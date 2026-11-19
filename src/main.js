import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { site } from './content.js';
import { renderSite } from './render.js';
import { createScene } from './scene.js';
import { initCursor, initMagnetic, initWorkRows, initMarquee, initClock } from './interactions.js';
import { initTerminal } from './terminal.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

renderSite(site);

// ── WebGL ────────────────────────────────────────────────────
let scene = null;
try {
  scene = createScene(document.querySelector('#webgl'), { reduce });
} catch (err) {
  console.warn('WebGL unavailable, continuing without the 3D scene.', err);
  document.body.classList.add('no-webgl');
}

// ── Smooth scroll ────────────────────────────────────────────
const lenis = reduce ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  lenis.stop();
}
gsap.ticker.add((time, delta) => {
  lenis?.raf(time * 1000);
  scene?.update(time, Math.min(delta / 1000, 0.05));
});
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else if (target === 0) window.scrollTo(0, 0);
    else target.scrollIntoView();
  });
});

// ── Hero title fits any name length ──────────────────────────
function fitHero() {
  const title = document.querySelector('.hero__title');
  title.style.fontSize = '';
  const avail = title.clientWidth;
  let ratio = 1;
  title.querySelectorAll('.line').forEach((l) => {
    const w = l.scrollWidth;
    if (w > avail) ratio = Math.min(ratio, avail / w);
  });
  if (ratio < 1) title.style.fontSize = `${parseFloat(getComputedStyle(title).fontSize) * ratio * 0.98}px`;
}

// ── Scroll choreography ──────────────────────────────────────
function setupScroll() {
  const sections = [...document.querySelectorAll('[data-section]')];

  // Each section has a pose for the particle object
  const poses = [
    { morph: 0, x: 2.45, y: 0.05, scale: 0.8, rotY: 0, alpha: 1 }, // Intro: planet
    { morph: 1, x: 0, y: -1.25, scale: 1.05, rotY: 0, alpha: 0.38 }, // About: terrain, low and quiet behind the text
    { morph: 2, x: 0, y: -1.0, scale: 1.1, rotY: 0, alpha: 0.42 }, // Work: terrain
    { morph: 2, x: 0, y: -0.3, scale: 1.25, rotY: 0.7, alpha: 0.55 }, // Stack: terrain, turned
    { morph: 3, x: 2.1, y: 0, scale: 0.85, rotY: 0, alpha: 1 }, // Contact: portal
  ];
  if (scene) {
    // Start in the hero pose so nothing jumps on the first scroll
    Object.assign(scene.state, poses[0]);
    sections.forEach((sec, i) => {
      if (i === 0) return;
      gsap.fromTo(scene.state, { ...poses[i - 1] }, {
        ...poses[i],
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 15%', scrub: 1.4 },
      });
    });
  }

  // HUD: section indicator + progress
  const hudIndex = document.querySelector('[data-hud-index]');
  const hudName = document.querySelector('[data-hud-name]');
  sections.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return;
        gsap.to([hudIndex, hudName], {
          xPercent: -100, opacity: 0, duration: 0.3, ease: 'power2.in',
          onComplete: () => {
            hudIndex.textContent = String(i).padStart(2, '0');
            hudName.textContent = sec.dataset.section;
            gsap.fromTo([hudIndex, hudName], { xPercent: 100, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
          },
        });
      },
    });
  });
  gsap.to('.hud__progress i', {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

  // Hero drifts away
  gsap.to('.hero__title', {
    yPercent: -18, opacity: 0.15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  if (reduce) return;

  // Manifesto lights up word by word
  const manifesto = document.querySelector('[data-words]');
  const words = new SplitText(manifesto, { type: 'words' }).words;
  gsap.fromTo(words, { opacity: 0.12 }, {
    opacity: 1, stagger: 0.08, ease: 'none',
    scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true },
  });

  // Masked line reveals for headings
  document.querySelectorAll('[data-split]').forEach((el) => {
    const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.lines, {
      yPercent: 110, rotate: 2, duration: 1.3, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Fade-up reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Count-up stats
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Work rows: draw their divider line
  gsap.utils.toArray('.work__item').forEach((el) => {
    gsap.from(el, {
      '--line': 0, duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 92%' },
    });
  });
}

// ── Loader → intro ───────────────────────────────────────────
function intro(heroChars) {
  document.body.classList.remove('is-loading');
  lenis?.start();
  if (scene) gsap.to(scene.state, { intro: 1, duration: reduce ? 0 : 3.4, ease: 'power3.out' });
  const tl = gsap.timeline();
  if (heroChars) {
    tl.from(heroChars, { yPercent: 115, rotate: 8, duration: 1.6, ease: 'expo.out', stagger: 0.04 }, 0.1);
  }
  tl.from('[data-hero-fade]', { y: 24, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0.5)
    .from('.nav > *', { y: -20, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.6)
    .from('.hud', { opacity: 0, duration: 1.2 }, 0.9);
}

function runLoader(onReveal) {
  const countEl = document.querySelector('[data-loader-count]');
  const bar = document.querySelector('.loader__bar i');
  const o = { v: 0 };
  const tl = gsap.timeline({ onComplete: () => document.querySelector('.loader').remove() });
  tl.to(o, {
    v: 100, duration: reduce ? 0.4 : 2.2, ease: 'power2.inOut',
    onUpdate: () => {
      countEl.textContent = String(Math.round(o.v)).padStart(3, '0');
      bar.style.transform = `scaleX(${o.v / 100})`;
    },
  })
    .to('.loader__count, .loader__top, .loader__bar', { yPercent: -60, opacity: 0, duration: 0.6, ease: 'power3.in', stagger: 0.05 }, '+=0.15')
    .to('.loader', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'expo.inOut' }, '-=0.25')
    .add(onReveal, '-=0.85');
}

async function init() {
  try { await document.fonts.ready; } catch {}
  fitHero();
  let heroChars = null;
  if (!reduce) {
    heroChars = [];
    document.querySelectorAll('.hero__title .line').forEach((line) => {
      heroChars.push(...new SplitText(line, { type: 'chars', charsClass: 'char' }).chars);
    });
  }

  setupScroll();
  initCursor();
  initMagnetic();
  initWorkRows();
  initMarquee(() => (lenis ? lenis.velocity : 0));
  initClock(site.timezone);
  const cursorEl = document.querySelector('.cursor');
  initTerminal(site, {
    onOpen: () => { lenis?.stop(); cursorEl.style.display = 'none'; },
    onClose: () => { lenis?.start(); cursorEl.style.display = ''; },
  });
  ScrollTrigger.refresh();

  runLoader(() => intro(heroChars));

  let w = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === w) return; // ignore mobile URL-bar height changes
    w = window.innerWidth;
    fitHero();
    ScrollTrigger.refresh();
  });
}

init();
