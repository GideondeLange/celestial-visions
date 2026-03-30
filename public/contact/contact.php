<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recipient email
    $to = "hello@celestialvisions.co.za";
    
    // Form fields
    $name = strip_tags(trim($_POST["name"]));
    $email = filter_var(trim($_POST["_replyto"]), FILTER_SANITIZE_EMAIL);
    $subject_input = strip_tags(trim($_POST["subject"]));
    $message_content = strip_tags(trim($_POST["message"]));

    // Validate inputs
    if (empty($name) || empty($message_content) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["message" => "Please complete the form and provide a valid email."]);
        exit;
    }

    // Email content
    $subject = "Celestial Visions Transmission: " . ($subject_input ?: "New Inquiry");
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Subject: $subject_input\n\n";
    $email_content .= "Message:\n$message_content\n";

    // Email headers
    $headers = "From: Celestial Visions <noreply@celestialvisions.co.za>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send the email
    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["message" => "Transmission received successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Oops! Something went wrong and we couldn't send your message."]);
    }

} else {
    http_response_code(403);
    echo json_encode(["message" => "There was a problem with your submission, please try again."]);
}
?>
