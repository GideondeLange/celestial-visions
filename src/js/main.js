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
    positions[i * 3] = (Math.random() - 0.5) * 150;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.22, // Adjusted to halfway point based on feedback (original 0.1, previous 0.35)
    transparent: true,
    opacity: 0.9, // Increased from 0.8
    sizeAttenuation: true
});

const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const plight = new THREE.PointLight(0x6e44ff, 1.5);
plight.position.set(10, 10, 10);
scene.add(plight);

let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
    // Normalize mouse coordinates (-1 to 1)
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let currentRotationX = 0;
let currentRotationY = 0;
let currentCameraX = 0;
let currentCameraY = 0;

function animate() {
    requestAnimationFrame(animate);
    
    // Lerp mouse position for extra smoothness
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Rotation reaction (increased sensitivity)
    const targetRotY = mouseX * 0.2;
    const targetRotX = mouseY * 0.2;
    
    // Camera parallax reaction (subtle movement)
    const targetCamX = mouseX * 5;
    const targetCamY = -mouseY * 5;
    
    // Smooth transitions
    starfield.rotation.y += (targetRotY - starfield.rotation.y) * 0.05;
    starfield.rotation.x += (targetRotX - starfield.rotation.x) * 0.05;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    
    // Base rotation
    starfield.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- PAGE-SPECIFIC INITIALIZATION (Runs on load and every Swup transition) ---

function initContent() {
    // 1. Update Navigation Active State
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav .nav-link').forEach(link => {
        // Handle both root / and /index.html
        const linkPath = link.getAttribute('href');
        const isActive = (currentPath === linkPath) || 
                         (currentPath === '/' && linkPath === '/index.html') ||
                         (currentPath.endsWith('/') && currentPath + 'index.html' === linkPath);
        
        if (isActive) {
            link.classList.add('active');
            link.style.opacity = "1";
            link.style.color = "var(--clr-nebula-cyan)";
        } else {
            link.classList.remove('active');
            link.style.opacity = "";
            link.style.color = "";
        }
    });

    // 2. Kill old ScrollTriggers to prevent memory leaks and ghost triggers
    ScrollTrigger.getAll().forEach(t => t.kill());

    // 3. Hero Entrance
    const heroTitle = document.querySelector('#hero-title');
    if (heroTitle) {
        const heroSubtitle = document.querySelector('#hero-subtitle');
        const heroCta = document.querySelector('#hero-cta-container');
        
        const toAnimate = [heroTitle];
        if (heroSubtitle) toAnimate.push(heroSubtitle);
        if (heroCta) toAnimate.push(heroCta);

        gsap.set(toAnimate, { opacity: 0, y: 20 });
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to(heroTitle, { opacity: 1, y: 0, duration: 1.5, delay: 0.5 });
        
        if (heroSubtitle) tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 1.2 }, '-=1');
        if (heroCta) tl.to(heroCta, { opacity: 1, y: 0, duration: 1 }, '-=0.8');
          
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            gsap.set(scrollIndicator, { opacity: 0 });
            tl.to(scrollIndicator, { opacity: 1, duration: 1, delay: 0.2 });
        }
    }

    // 4. Scroll Reveals
    gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el, {
            opacity: 0,
            y: 40,
            clipPath: 'inset(100% 0% 0% 0%)'
        }, {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // 5. Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.submit-button');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'TRANSMITTING...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    submitBtn.innerText = 'TRANSMISSION RECEIVED';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error();
                }
            } catch {
                submitBtn.innerText = 'RETRY TRANSMISSION';
                submitBtn.disabled = false;
            }
        });
    }

    // 6. Camera Parallax on scroll
    window.removeEventListener('scroll', handleCameraScroll);
    window.addEventListener('scroll', handleCameraScroll);
}

function handleCameraScroll() {
    const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
    gsap.to(camera.position, {
        z: 30 - scrollPercent * 15,
        duration: 1,
        ease: "power1.out"
    });
}

// --- SWUP INITIALIZATION ---

const swup = new Swup({
    plugins: [
        new SwupPreloadPlugin(),
        new SwupBodyClassPlugin()
    ]
});

// Run on initial load
initContent();

// Run on every content swap
swup.hooks.on('content:replace', () => {
    window.scrollTo(0, 0); 
    initContent();
});
