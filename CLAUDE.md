# Celestial Visions — Claude Code Instructions

## Project
Web design business site for Gideon de Lange, Boksburg, South Africa.
Live site: celestialvisions.co.za | Repo: GideondeLange/celestial-visions

## After Every Change — Always Do This
1. `npm run build` — regenerates dist/ (Vite 8, Node 20+)
2. `git add <changed files>` — never use `git add -A` blindly
3. `git commit` with a clear message
4. `git push origin main` — triggers GitHub Actions → auto-deploys to Hostinger via FTP

Never leave changes uncommitted. Never skip the build step. The dist/ folder is gitignored — the CI pipeline builds it on the server.

## Deploy Pipeline
GitHub push → GitHub Actions (ubuntu-latest) → `npm run build` → FTP to Hostinger /public_html/
FTP timeout is set to 120s. If deploy fails with timeout, advise Gideon to re-run the workflow from the Actions tab.

## Tech Stack
- Vite 8 (build tool)
- Three.js (WebGL starfield)
- GSAP 3.14 + ScrollTrigger (animations)
- Swup 4 (page transitions)
- Plain HTML/CSS/JS — no React, no framework
- CSS lives in src/css/style.css
- Apache .htaccess handles clean URLs and www redirect

## Key CSS Rules
- `--clr-text-primary: #f0eef8` — bright heading white
- `--clr-text-secondary: #a09bb8` — muted grey for body text
- `.glass-card p` sets all card paragraphs to grey — use `.glass-card p.package-price` to override with higher specificity
- Package price class: `.package-price`

## Pages
index.html, about/, services/, packages/, projects/, contact/ — all use clean URLs

## How Gideon Works
- Describes what he sees (often with screenshots) — read the relevant file before making changes
- One task at a time
- Expects changes live on the site after every session — always push
- No manual FTP ever — everything goes through GitHub

## Still To Do
- Mobile hamburger navigation (currently broken on small screens)
- Social media links (Facebook & Instagram still on #)
- Google Search Console + sitemap submission
- Business email: hello@celestialvisions.co.za
- Replace placeholder nebula images in Recent Work section with real client screenshots
