<?php
/*
  Celestial Visions — contact form mail handler

  Sends enquiries to the business mailbox over authenticated SMTP (PHPMailer)
  instead of PHP mail().

  Why: mail() sends as an anonymous "noreply@" address from the web server,
  which fails SPF/DKIM alignment and lands in spam (or is dropped when the
  recipient is on the same host). Logging in to a real mailbox and sending
  as that mailbox is properly authenticated and delivers to the inbox.

  Credentials live in ../mail-config.php, which is generated at deploy time
  from GitHub Secrets and is NEVER committed to the repository.
*/

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// Honeypot — bots fill hidden fields; humans never see it. Silently "succeed".
if (!empty($_POST['company'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['_replyto'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please complete the form and provide a valid email.']);
    exit;
}

// Strip CR/LF from single-line fields (header-injection protection)
$oneLine = fn($v) => str_replace(["\r", "\n"], ' ', $v);
$name    = $oneLine($name);
$email   = $oneLine($email);
$subject = $oneLine($subject);

// ---- Credentials -----------------------------------------------------------
$configFile = __DIR__ . '/../mail-config.php';
if (!file_exists($configFile)) {
    error_log('Celestial Visions contact form: mail-config.php missing');
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail not configured']);
    exit;
}
require $configFile;   // defines SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_TO

require __DIR__ . '/../lib/PHPMailer/Exception.php';
require __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/../lib/PHPMailer/SMTP.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->Timeout    = 20;

    // 465 = implicit SSL, 587/25 = STARTTLS
    $mail->SMTPSecure = (SMTP_PORT == 465)
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;

    // Envelope sender must be the authenticated mailbox
    // Show the customer's name as the sender so the inbox reads "Dawid Gideon"
    // rather than "Celestial Visions Website". The address stays the mailbox.
    $mail->setFrom(SMTP_USER, $name . ' (via website)');
    $mail->addAddress(MAIL_TO);
    $mail->addReplyTo($email, $name);   // hit Reply -> goes to the customer

    $mail->Subject = 'New website enquiry — ' . $name . ($subject !== '' ? ' (' . $subject . ')' : '');

    $h = fn($v) => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');

    // One-click reply: opens a new email to the customer, pre-addressed, from any mail app
    $replySubject = 'Re: ' . ($subject !== '' ? $subject : 'Your enquiry to Celestial Visions');
    $replyLink = 'mailto:' . rawurlencode($email) . '?subject=' . rawurlencode($replySubject);
    $row = fn($label, $value) =>
        '<tr><td style="padding:2px 12px 2px 0;color:#666">' . $label . '</td><td>' . $h($value) . '</td></tr>';

    $mail->isHTML(true);
    $mail->Body = '<p>You have a new enquiry from the Celestial Visions website:</p>'
        . '<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">'
        . $row('Name', $name)
        . $row('Email', $email)
        . $row('Subject', $subject !== '' ? $subject : '—')
        . '</table>'
        . '<p style="margin-top:14px"><strong>Message:</strong><br>' . nl2br($h($message)) . '</p>'
        . '<p style="margin-top:22px"><a href="' . $h($replyLink) . '" style="display:inline-block;padding:11px 22px;background:#4338ca;color:#ffffff;text-decoration:none;border-radius:4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold">Reply to ' . $h($name) . '</a></p>'
        . '<p style="font-family:Arial,sans-serif;font-size:12px;color:#777">Or just email them directly: <a href="mailto:' . $h($email) . '">' . $h($email) . '</a></p>';
    $mail->AltBody = "You have a new enquiry from the Celestial Visions website:\n\n"
        . "Name:    $name\nEmail:   $email\nSubject: $subject\n\nMessage:\n$message\n\n"
        . "To reply, email: $email\n";

    $mail->send();
    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    // Log the detail server-side; never leak SMTP internals to the browser
    error_log('Celestial Visions contact form SMTP error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail failed']);
}
