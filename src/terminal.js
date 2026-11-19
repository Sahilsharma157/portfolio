import gsap from 'gsap';

// Hidden dev terminal. Open with the ` key or the >_ button. All answers come from content.js.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const pad = (s, n) => String(s).padEnd(n, ' ');

export function initTerminal(site, { onOpen = () => {}, onClose = () => {} } = {}) {
  const user = site.name.first.toLowerCase();
  const ps = `<span class="t-accent">${esc(user)}@portfolio</span><span class="t-muted">:~$</span>`;
  const link = (url, label = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) =>
    `<a class="t-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;

  // ── DOM ──────────────────────────────────────────────────
  const root = document.createElement('div');
  root.className = 'term';
  root.innerHTML = `
    <div class="term__backdrop" data-close></div>
    <div class="term__win" role="dialog" aria-modal="true" aria-label="Terminal">
      <div class="term__bar mono">
        <span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="term__title">${esc(user)}@portfolio: ~</span>
        <button class="term__close mono" data-close aria-label="Close terminal">esc</button>
      </div>
      <div class="term__body" data-lenis-prevent>
        <div class="term__out" aria-live="polite"></div>
        <form class="term__line" autocomplete="off">
          <label class="term__ps" for="term-input">${ps}</label>
          <input id="term-input" class="term__input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" />
        </form>
      </div>
    </div>`;
  document.body.appendChild(root);

  const btn = document.createElement('button');
  btn.className = 'term-btn mono';
  btn.setAttribute('aria-label', 'Open terminal');
  btn.innerHTML = '<span>&gt;_</span><kbd>`</kbd>';
  document.body.appendChild(btn);

  const win = root.querySelector('.term__win');
  const body = root.querySelector('.term__body');
  const out = root.querySelector('.term__out');
  const form = root.querySelector('.term__line');
  const input = root.querySelector('.term__input');

  // ── Output ───────────────────────────────────────────────
  let queue = Promise.resolve();
  const print = (lines, { delay = 14 } = {}) => {
    const arr = Array.isArray(lines) ? lines : [lines];
    queue = queue.then(
      () =>
        new Promise((done) => {
          let i = 0;
          const next = () => {
            if (i >= arr.length) return done();
            const div = document.createElement('div');
            let line = arr[i++] || '&nbsp;';
            div.className = 'term__row';
            if (line.startsWith('    ')) { div.classList.add('term__row--indent'); line = line.slice(4); }
            div.innerHTML = line;
            out.appendChild(div);
            body.scrollTop = body.scrollHeight;
            setTimeout(next, delay);
          };
          next();
        })
    );
    return queue;
  };

  // ── Commands ─────────────────────────────────────────────
  const projects = site.projects || [];
  const cmds = {
    help: {
      desc: 'list commands',
      run: () => [
        '<span class="t-muted">Available commands:</span>',
        ...Object.entries(cmds)
          .filter(([, c]) => c.desc)
          .map(([k, c]) => `  <span class="t-accent">${pad(k, 12)}</span>${esc(c.desc)}`),
        '',
        '<span class="t-muted">Tip: Tab completes, ↑/↓ recalls history, Esc closes.</span>',
      ],
    },
    whoami: {
      desc: 'who I am',
      run: () => [
        `<b>${esc(site.name.first)} ${esc(site.name.last)}</b>, ${esc(site.role)}`,
        `<span class="t-muted">${esc(site.location)} · ${esc(site.status || '')}</span>`,
        '',
        strip(site.tagline),
      ],
    },
    about: {
      desc: 'the longer story',
      run: () => [...(site.about || []).flatMap((p) => [esc(strip(p)), ''])],
    },
    projects: {
      desc: "things I've shipped",
      run: () => [
        ...projects.map(
          (p, i) =>
            `<span class="t-accent">[${i + 1}]</span> <b>${esc(p.title)}</b>${p.year ? ` <span class="t-muted">(${esc(p.year)})</span>` : ''}\n    ${esc(p.description)}\n    <span class="t-muted">${esc(p.tags.join(' · '))}</span>`
        ),
        '',
        '<span class="t-muted">Type</span> open 1 <span class="t-muted">(or a name) to visit one.</span>',
      ],
    },
    open: {
      desc: 'open <n|name>  visit a project',
      run: (args) => {
        const q = args.join(' ').toLowerCase().trim();
        if (!q) return ['<span class="t-muted">usage:</span> open &lt;number|name&gt;'];
        const p = projects[Number(q) - 1] || projects.find((x) => x.title.toLowerCase().includes(q));
        if (!p) return [`<span class="t-err">no project matching "${esc(q)}"</span>. Try <span class="t-accent">projects</span>.`];
        if (!p.link || p.link === '#') return [`${esc(p.title)} doesn't have a public link yet.`];
        window.open(p.link, '_blank', 'noopener');
        return [`Opening ${link(p.link, p.title)} in a new tab…`];
      },
    },
    skills: {
      desc: 'tech I work with',
      run: () => (site.stack || []).map((g) => `<span class="t-accent">${pad(g.title, 16)}</span>${esc(g.items.join(', '))}`),
    },
    experience: {
      desc: "where I've been",
      run: () => (site.experience || []).map((e) => `<span class="t-muted">${pad(e.period, 16)}</span><b>${esc(e.role)}</b> · ${esc(e.company)}`),
    },
    awards: {
      desc: 'hackathon wins',
      run: () =>
        (site.awards || []).map(
          (a) => `<span class="t-accent">★</span> <b>${esc(a.title)}</b>, ${esc(a.event)}${a.note ? ` <span class="t-muted">(${esc(a.note)})</span>` : ''}`
        ),
    },
    certs: {
      desc: 'certifications',
      run: () => (site.certifications || []).map((c) => `<span class="t-accent">✓</span> ${esc(c)}`),
    },
    contact: {
      desc: 'how to reach me',
      run: () => [
        `<span class="t-muted">${pad('email', 10)}</span><a class="t-link" href="mailto:${esc(site.email)}">${esc(site.email)}</a>`,
        ...(site.socials || []).map((s) => `<span class="t-muted">${pad(s.label.toLowerCase(), 10)}</span>${link(s.url)}`),
      ],
    },
    github: { desc: 'open my GitHub', run: () => openSocial('github') },
    linkedin: { desc: 'open my LinkedIn', run: () => openSocial('linkedin') },
    neofetch: {
      desc: 'system info, sort of',
      run: () => {
        const art = [
          '        ..--""--..        ',
          '     .\'            \'.     ',
          ' ~~~:~~~~~~~~~~~~~~~~:~~~ ',
          '     \'.            .\'     ',
          '        \'\'--..--\'\'        ',
          '                          ',
        ];
        const langs = (site.stack?.[0]?.items || []).slice(0, 3).join(', ');
        const info = [
          `<span class="t-accent">${esc(user)}@portfolio</span>`,
          '<span class="t-muted">-----------------</span>',
          `<span class="t-accent">role</span>      ${esc(site.role)}`,
          `<span class="t-accent">location</span>  ${esc(site.location)}`,
          `<span class="t-accent">langs</span>     ${esc(langs)}`,
          `<span class="t-accent">status</span>    ${esc(site.status || 'online')}`,
        ];
        return art.map((a, i) => `<span class="t-ember">${esc(a)}</span>  ${info[i] || ''}`);
      },
    },
    clear: { desc: 'clear the screen', run: () => { out.innerHTML = ''; return []; } },
    exit: { desc: 'close the terminal', run: () => { setTimeout(close, 150); return ['<span class="t-muted">bye 👋</span>']; } },

    // hidden extras (not listed in help)
    ls: { run: () => ['about.txt  projects/  skills.json  awards.md  contact.txt'] },
    cat: {
      run: (args) => {
        const map = { 'about.txt': 'about', 'skills.json': 'skills', 'awards.md': 'awards', 'contact.txt': 'contact' };
        const f = args[0];
        return map[f] ? cmds[map[f]].run([]) : [`cat: ${esc(f || '')}: No such file`];
      },
    },
    cd: { run: (args) => (args[0] === 'projects' || args[0] === 'projects/' ? cmds.projects.run([]) : ['<span class="t-muted">You are already where you need to be.</span>']) },
    date: { run: () => [new Date().toString()] },
    echo: { run: (args) => [esc(args.join(' '))] },
    history: { run: () => hist.map((h, i) => `<span class="t-muted">${pad(i + 1, 4)}</span>${esc(h)}`) },
    sudo: {
      run: (args) =>
        args.join(' ').toLowerCase().includes('hire')
          ? [
              '<span class="t-ok">[sudo] permission granted.</span>',
              'Preparing offer letter… <span class="t-ok">done</span>.',
              `Next step: <a class="t-link" href="mailto:${esc(site.email)}">${esc(site.email)}</a> 😉`,
            ]
          : [`<span class="t-err">${esc(user)} is not in the sudoers file.</span> This incident will be reported.`],
    },
    hire: { run: () => cmds.sudo.run(['hire']) },
    rm: { run: () => ['<span class="t-err">Nice try.</span> This portfolio is read-only.'] },
    vim: { run: () => ['<span class="t-muted">You can never leave. Just kidding, type</span> exit.'] },
  };
  const openSocial = (name) => {
    const s = (site.socials || []).find((x) => x.label.toLowerCase().includes(name));
    if (!s) return [`no ${name} link set`];
    window.open(s.url, '_blank', 'noopener');
    return [`Opening ${link(s.url)}…`];
  };

  // ── Input handling ───────────────────────────────────────
  const hist = [];
  let hIndex = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    print(`${ps} <span class="term__cmd">${esc(raw)}</span>`, { delay: 0 });
    if (!raw) return;
    hist.push(raw);
    hIndex = hist.length;
    const [name, ...args] = raw.split(/\s+/);
    const cmd = cmds[name.toLowerCase()];
    if (!cmd) {
      print([`<span class="t-err">command not found:</span> ${esc(name)}. Type <span class="t-accent">help</span>.`, '']);
      return;
    }
    const lines = cmd.run(args).flatMap((l) => String(l).split('\n'));
    if (lines.length) print([...lines, '']);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hist.length) {
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = hist[hIndex];
    } else if (e.key === 'ArrowDown' && hist.length) {
      e.preventDefault();
      hIndex = Math.min(hist.length, hIndex + 1);
      input.value = hist[hIndex] || '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const v = input.value.toLowerCase();
      if (!v) return;
      const hits = Object.keys(cmds).filter((k) => cmds[k].desc && k.startsWith(v));
      if (hits.length === 1) input.value = hits[0] + ' ';
      else if (hits.length > 1) print([`<span class="t-muted">${hits.join('  ')}</span>`], { delay: 0 });
    }
  });

  // ── Open / close ─────────────────────────────────────────
  let isOpen = false;
  let greeted = false;
  function open() {
    if (isOpen) return;
    isOpen = true;
    root.classList.add('is-open');
    onOpen();
    gsap.fromTo(root.querySelector('.term__backdrop'), { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(win, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'expo.out' });
    if (!greeted) {
      greeted = true;
      print([
        `<span class="t-ember">●</span> Welcome to ${esc(site.name.first)}'s terminal <span class="t-muted">v1.0</span>`,
        `Type <span class="t-accent">help</span> to see what you can do, or try <span class="t-accent">neofetch</span>.`,
        '',
      ], { delay: 60 });
    }
    setTimeout(() => input.focus({ preventScroll: true }), 50);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    input.blur();
    gsap.to(root.querySelector('.term__backdrop'), { opacity: 0, duration: 0.3 });
    gsap.to(win, {
      opacity: 0, y: 20, scale: 0.98, duration: 0.3, ease: 'power2.in',
      onComplete: () => root.classList.remove('is-open'),
    });
    onClose();
  }

  btn.addEventListener('click', () => (isOpen ? close() : open()));
  root.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  body.addEventListener('click', (e) => {
    if (!e.target.closest('a') && !window.getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest?.('input, textarea, [contenteditable]');
    if (e.key === '`' && (!typing || (e.target === input && !input.value))) {
      e.preventDefault();
      isOpen ? close() : open();
    } else if (e.key === 'Escape' && isOpen) {
      close();
    }
  });

  return { open, close };
}
