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
        const heroSubtitle = document.querySelector('#hero-subtitle');
        const heroCta = document.querySelector('#hero-cta-container');

        const toAnimate = [heroTitle];
        if (heroSubtitle) toAnimate.push(heroSubtitle);
        if (heroCta) toAnimate.push(heroCta);

        gsap.set(toAnimate, { opacity: 0, y: 20 });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.to(heroTitle, { opacity: 1, y: 0, duration: 1.1, delay: 0.3 });
        if (heroSubtitle) tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.9 }, '-=0.7');
        if (heroCta)      tl.to(heroCta,      { opacity: 1, y: 0, duration: 0.7 }, '-=0.6');
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
        const children = container.querySelectorAll('.glass-card, .feature-card, .portfolio-item, .icon-feature');
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
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error();
                }
            } catch {
                submitBtn.innerText = 'Something went wrong — try again';
                submitBtn.disabled = false;
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

// Detect mobile-nav mode from CSS, not pixel width — matches the media query exactly
// and handles landscape orientation correctly.
const isMobileNav = () => !!navToggle && window.getComputedStyle(navToggle).display !== 'none';

// Mobile dropdown toggle (desktop uses CSS :hover)
document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        if (!isMobileNav()) return; // desktop: CSS :hover handles it, let link navigate normally
        e.preventDefault();
        e.stopPropagation(); // stop the click reaching the document close-handler below
        toggle.closest('.nav-dropdown').classList.toggle('is-open');
    });
});

// Close open dropdowns when clicking outside — desktop only.
// On mobile the hamburger overlay handles its own close logic.
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
