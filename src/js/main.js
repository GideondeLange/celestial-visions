import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Swup from 'swup';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupBodyClassPlugin from '@swup/body-class-plugin';

gsap.registerPlugin(ScrollTrigger);

// Three.js Starfield Background - PERSISTENT
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const starCount = 1000;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    let x, y, z;
    do {
        x = (Math.random() - 0.5) * 150;
        y = (Math.random() - 0.5) * 150;
        z = (Math.random() - 0.5) * 150;
    } while (Math.abs(x) < 5 && Math.abs(y) < 5 && z > 20);
    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.22,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
});

const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const plight = new THREE.PointLight(0x7c5cfc, 1.5);
plight.position.set(10, 10, 10);
scene.add(plight);

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let currentRotationX = 0;
let currentRotationY = 0;

function animate() {
    requestAnimationFrame(animate);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const targetRotY = mouseX * 0.2;
    const targetRotX = mouseY * 0.2;

    // Reduced parallax intensity — was 5, now 2
    const targetCamX = mouseX * 2;
    const targetCamY = -mouseY * 2;

    starfield.rotation.y += (targetRotY - starfield.rotation.y) * 0.05;
    starfield.rotation.x += (targetRotX - starfield.rotation.x) * 0.05;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;

    starfield.rotation.y += 0.0005;

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- PAGE-SPECIFIC INITIALIZATION ---

function initContent() {
    // 1. Navigation active state — class only, no inline styles
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav .nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        const isActive = (currentPath === linkPath) ||
                         (currentPath === '/' && linkPath === '/index.html') ||
                         (currentPath.endsWith('/') && currentPath + 'index.html' === linkPath);

        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. Hero Entrance — tighter timing
    const heroTitle = document.querySelector('#hero-title');
    if (heroTitle) {
        const heroBadge = document.querySelector('#hero-badge');
        const heroSubtitle = document.querySelector('#hero-subtitle');
        const heroCta = document.querySelector('#hero-cta-container');
        const heroStats = document.querySelector('#hero-stats');

        const toAnimate = [heroTitle];
        if (heroBadge) toAnimate.push(heroBadge);
        if (heroSubtitle) toAnimate.push(heroSubtitle);
        if (heroCta) toAnimate.push(heroCta);
        if (heroStats) toAnimate.push(heroStats);

        gsap.set(toAnimate, { opacity: 0, y: 20 });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (heroBadge)    tl.to(heroBadge,    { opacity: 1, y: 0, duration: 0.7, delay: 0.15 });
        tl.to(heroTitle, { opacity: 1, y: 0, duration: 1.1 }, heroBadge ? '-=0.4' : '+=0.3');
        if (heroSubtitle) tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.9 }, '-=0.7');
        if (heroCta)      tl.to(heroCta,      { opacity: 1, y: 0, duration: 0.7 }, '-=0.6');
        if (heroStats)    tl.to(heroStats,    { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');
    }

    // 3. Individual .reveal elements — simple fade-up, no clipPath
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 28 },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // 4. Staggered card groups
    gsap.utils.toArray('.reveal-group').forEach(container => {
        const children = container.querySelectorAll('.glass-card, .feature-card, .portfolio-item, .icon-feature, .process-step');
        if (children.length === 0) return;
        gsap.fromTo(children,
            { opacity: 0, y: 32 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: container,
                    start: 'top 82%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // 5. Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const statusBox = document.getElementById('form-status');
        const statusTitle = statusBox?.querySelector('h3');
        const statusText = statusBox?.querySelector('p');

        const showStatus = (type, title, text) => {
            if (!statusBox) return;
            statusTitle.innerText = title;
            statusText.innerText = text;
            statusBox.classList.remove('is-success', 'is-error', 'is-visible');
            statusBox.classList.add(type === 'success' ? 'is-success' : 'is-error');
            statusBox.hidden = false;
            requestAnimationFrame(() => statusBox.classList.add('is-visible'));
            statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    submitBtn.innerText = 'Message Sent';
                    contactForm.reset();
                    showStatus('success', 'Thank you for your enquiry!', "Your message has been sent successfully — we'll get back to you within 24 hours.");
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error();
                }
            } catch {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                showStatus('error', 'Something went wrong', 'Your message could not be sent. Please try again, or email us directly at gideon@celestialvisions.co.za.');
            }
        });
    }

    // 6. Camera scroll parallax
    window.removeEventListener('scroll', handleCameraScroll);
    window.addEventListener('scroll', handleCameraScroll);
}

function handleCameraScroll() {
    const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
    gsap.to(camera.position, {
        z: 30 - scrollPercent * 15,
        duration: 1,
        ease: 'power1.out'
    });
}

// --- GLOBAL MICRO-INTERACTIONS ---
// Initialised once; survive Swup page swaps via delegation / persistent elements

// Cursor spotlight on glass cards — feeds --mx/--my to the ::after radial gradient
document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.glass-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
});

// Scroll progress bar
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.appendChild(scrollProgress);
window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    scrollProgress.style.transform = 'scaleX(' + (max > 0 ? window.pageYOffset / max : 0) + ')';
}, { passive: true });

// --- HAMBURGER MENU ---
// Nav is outside #swup so it persists — init once, not inside initContent

const navToggle = document.querySelector('.nav-toggle');
const navList   = document.querySelector('nav ul');

function closeMenu() {
    if (!navToggle || !navList) return;
    navToggle.classList.remove('is-open');
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
}

if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.classList.toggle('is-open');
        navList.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
    });

    // Close when a nav link or dropdown item is clicked
    navList.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link') && !e.target.classList.contains('nav-dropdown-toggle')) closeMenu();
        if (e.target.classList.contains('nav-dropdown-item')) closeMenu();
    });
}

// Detect mobile-nav mode from CSS — more reliable than pixel-width check.
const isMobileNav = () => !!navToggle && window.getComputedStyle(navToggle).display !== 'none';

// Mobile dropdown toggle
// On mobile, touchstart fires before Swup's PreloadPlugin can intercept the link.
// preventDefault() on touchstart cancels all subsequent synthesised mouse/click
// events, so Swup never sees a navigable click and the link never follows its href.
// { passive: false } is required to allow preventDefault() inside touchstart.
document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('touchstart', (e) => {
        if (!isMobileNav()) return;
        e.preventDefault();
        toggle.closest('.nav-dropdown').classList.toggle('is-open');
    }, { passive: false });

    // Fallback for non-touch (keyboard Enter, desktop dev tools in mobile mode)
    toggle.addEventListener('click', (e) => {
        if (!isMobileNav()) return;
        e.preventDefault();
        e.stopPropagation();
        toggle.closest('.nav-dropdown').classList.toggle('is-open');
    });
});

// Close open dropdowns when clicking outside — desktop only.
document.addEventListener('click', (e) => {
    if (isMobileNav()) return;
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
    }
});

// Escape key closes mobile nav and desktop dropdowns
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenu();
    document.querySelectorAll('.nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
});

// --- SWUP ---

const swup = new Swup({
    plugins: [
        new SwupPreloadPlugin(),
        new SwupBodyClassPlugin()
    ]
});

// Kill ScrollTriggers + close menu before the leave animation starts
swup.hooks.on('visit:start', () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    closeMenu();
});

// Scroll + init after content swap
swup.hooks.on('content:replace', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    initContent();
});

// Run on initial load
initContent();
