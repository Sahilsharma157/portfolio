import gsap from 'gsap';

const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initCursor() {
  if (!fine()) return;
  document.body.classList.add('has-cursor');
  const root = document.querySelector('.cursor');
  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = root.querySelector('.cursor__label');
  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    root.classList.add('is-visible');
  });
  document.documentElement.addEventListener('pointerleave', () => root.classList.remove('is-visible'));
  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));

  gsap.ticker.add(() => {
    const k = 1 - Math.pow(0.82, gsap.ticker.deltaRatio());
    rx += (mx - rx) * k; ry += (my - ry) * k;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  });

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      if (el.dataset.cursor) { label.textContent = el.dataset.cursor; root.classList.add('is-label'); }
      else root.classList.add('is-hover');
    });
    el.addEventListener('pointerleave', () => root.classList.remove('is-label', 'is-hover'));
  });
}

export function initMagnetic() {
  if (!fine()) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.45)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// Project rows: color wipe that enters and exits from the side the pointer crossed
export function initWorkRows() {
  if (!fine()) return;
  const closed = { top: 'inset(0% 0% 100% 0%)', bottom: 'inset(100% 0% 0% 0%)' };
  document.querySelectorAll('.work__item a').forEach((a) => {
    const fill = a.querySelector('.work__fill');
    const side = (e) => {
      const r = a.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2 ? 'top' : 'bottom';
    };
    a.addEventListener('pointerenter', (e) => {
      gsap.fromTo(fill, { clipPath: closed[side(e)] }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'expo.out', overwrite: true });
    });
    a.addEventListener('pointerleave', (e) => {
      gsap.to(fill, { clipPath: closed[side(e)], duration: 0.5, ease: 'expo.out', overwrite: true });
    });
  });
}

export function initMarquee(getVelocity) {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  let pos = 0, dir = 1, boost = 0;
  gsap.ticker.add(() => {
    const v = getVelocity();
    if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
    boost += (Math.min(Math.abs(v), 60) * 0.18 - boost) * 0.1;
    pos -= dir * (0.7 + boost) * gsap.ticker.deltaRatio();
    const half = track.scrollWidth / 2;
    if (half > 0) {
      if (pos <= -half) pos += half;
      if (pos > 0) pos -= half;
    }
    track.style.transform = `translate3d(${pos}px, 0, 0) skewX(${-dir * Math.min(boost, 8) * 0.8}deg)`;
  });
}

export function initClock(timezone) {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' };
  if (timezone) opts.timeZone = timezone;
  const fmt = new Intl.DateTimeFormat('en-GB', opts);
  const tick = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
    el.innerHTML = `${get('hour')}<span class="blink">:</span>${get('minute')} <small>${get('timeZoneName')}</small>`;
  };
  tick();
  setInterval(tick, 10000);
}
