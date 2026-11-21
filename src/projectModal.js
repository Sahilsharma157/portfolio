import gsap from 'gsap';

// Project case-study modal: screenshots, overview, what I built, stack, links.

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');

export function initProjectModal(projects, { onOpen = () => {}, onClose = () => {} } = {}) {
  const root = document.createElement('div');
  root.className = 'pm';
  root.innerHTML = `
    <div class="pm__backdrop" data-pm-close></div>
    <article class="pm__panel" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabindex="-1">
      <header class="pm__bar mono">
        <span class="pm__count"></span>
        <div class="pm__nav">
          <button class="pm__btn" data-pm-prev aria-label="Previous project">←</button>
          <button class="pm__btn" data-pm-next aria-label="Next project">→</button>
          <button class="pm__btn pm__close" data-pm-close aria-label="Close">esc ✕</button>
        </div>
      </header>
      <div class="pm__scroll" data-lenis-prevent>
        <div class="pm__inner"></div>
      </div>
    </article>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.pm__panel');
  const inner = root.querySelector('.pm__inner');
  const scroller = root.querySelector('.pm__scroll');
  const count = root.querySelector('.pm__count');
  let current = -1;
  let isOpen = false;
  let lastFocus = null;

  function media(p, i) {
    if (!p.images?.length) {
      return `<div class="pm__hero pm__hero--empty" style="--c1:${p.colors[0]};--c2:${p.colors[1]}">
        <span class="display">${esc(p.title)}</span>
        <span class="mono">Screenshots coming soon</span>
      </div>`;
    }
    return `
      <figure class="pm__browser">
        <div class="pm__chrome" aria-hidden="true">
          <span class="pm__dots"><i></i><i></i><i></i></span>
          <span class="pm__url mono">${esc((p.link || '').replace(/^https?:\/\//, '').replace(/\/$/, ''))}</span>
        </div>
        <div class="pm__shot">
          <img src="${esc(p.images[0])}" alt="${esc(p.title)} screenshot 1" data-pm-main />
        </div>
      </figure>
      ${p.images.length > 1 ? `<div class="pm__thumbs">${p.images
        .map((src, k) => `<button class="pm__thumb${k === 0 ? ' is-active' : ''}" data-pm-thumb="${k}" aria-label="Show screenshot ${k + 1}"><img src="${esc(src)}" alt="" loading="lazy" /></button>`)
        .join('')}</div>` : ''}`;
  }

  function render(i) {
    const p = projects[i];
    count.textContent = `Project ${pad(i + 1)} / ${pad(projects.length)}`;
    const links = [
      p.link ? `<a class="pm__cta pm__cta--primary" href="${esc(p.link)}" target="_blank" rel="noopener">Visit live site <span>↗</span></a>` : '',
      p.code ? `<a class="pm__cta" href="${esc(p.code)}" target="_blank" rel="noopener">View code <span>↗</span></a>` : '',
    ].join('');
    inner.innerHTML = `
      <div class="pm__media">${media(p, i)}</div>
      <div class="pm__info">
        <div class="pm__head">
          <span class="mono pm__num">${pad(i + 1)}${p.year ? ` · ${esc(p.year)}` : ''}</span>
          <h2 id="pm-title" class="display pm__title">${esc(p.title)}</h2>
        </div>
        <p class="pm__overview">${esc(p.overview || p.description)}</p>
        ${p.built?.length ? `
          <h3 class="mono pm__label">What I built</h3>
          <ul class="pm__list">${p.built.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
        <h3 class="mono pm__label">Stack</h3>
        <ul class="pm__tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        ${links ? `<div class="pm__ctas">${links}</div>` : ''}
      </div>`;
    scroller.scrollTop = 0;

    const main = inner.querySelector('[data-pm-main]');
    inner.querySelectorAll('[data-pm-thumb]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = Number(btn.dataset.pmThumb);
        inner.querySelectorAll('.pm__thumb').forEach((b) => b.classList.toggle('is-active', b === btn));
        gsap.to(main, {
          opacity: 0, duration: 0.18, onComplete: () => {
            main.src = p.images[k];
            main.alt = `${p.title} screenshot ${k + 1}`;
            gsap.to(main, { opacity: 1, duration: 0.3 });
          },
        });
      });
    });

    gsap.from(inner.children, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
  }

  function open(i) {
    current = i;
    render(i);
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    onOpen();
    gsap.fromTo(root.querySelector('.pm__backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.45 });
    gsap.fromTo(panel, { yPercent: 6, opacity: 0, clipPath: 'inset(8% 4% 0% 4% round 14px)' }, {
      yPercent: 0, opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 0.8, ease: 'expo.out',
    });
    panel.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    gsap.to(root.querySelector('.pm__backdrop'), { opacity: 0, duration: 0.35 });
    gsap.to(panel, {
      yPercent: 5, opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete: () => root.classList.remove('is-open'),
    });
    onClose();
    lastFocus?.focus?.({ preventScroll: true });
  }

  const step = (d) => open((current + d + projects.length) % projects.length);

  root.querySelectorAll('[data-pm-close]').forEach((el) => el.addEventListener('click', close));
  root.querySelector('[data-pm-prev]').addEventListener('click', () => step(-1));
  root.querySelector('[data-pm-next]').addEventListener('click', () => step(1));
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });

  // Project rows open the modal (Ctrl/⌘-click still opens the link directly)
  document.querySelectorAll('.work__item a[data-index]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(Number(a.dataset.index));
    });
  });

  return { open, close, isOpen: () => isOpen };
}
