const pad = (n) => String(n).padStart(2, '0');

export function renderSite(s) {
  const fullName = `${s.name.first} ${s.name.last}`;
  document.title = `${fullName} — ${s.role}`;
  document.querySelector('[data-initials]').textContent = s.initials;

  const sections = ['About', 'Work', 'Stack', 'Contact'];

  document.querySelector('#app').innerHTML = `
  <header class="nav">
    <a href="#top" class="nav__logo display" data-magnetic aria-label="Back to top">${s.initials}</a>
    <nav class="nav__links mono" aria-label="Primary">
      ${sections.map((l, i) => `<a href="#${l.toLowerCase()}" class="roll"><span><span>${l}</span></span><sup>${pad(i + 1)}</sup></a>`).join('')}
    </nav>
    <a href="#contact" class="nav__status mono">${s.available ? `<i class="pulse"></i>${s.status || 'Available for work'}` : 'Currently booked'}</a>
  </header>

  <main>
    <section class="hero" id="top" data-section="Intro">
      <div class="hero__meta mono" data-hero-fade>
        <span>(Portfolio ©${new Date().getFullYear()})</span>
        <span>${s.role}</span>
        <span>Based in ${s.location}</span>
      </div>

      <h1 class="hero__title display" aria-label="${fullName}">
        <span class="line">${s.name.first}</span>
        <span class="line line--indent">${s.name.last}<em class="accent">.</em></span>
      </h1>

      <div class="hero__bottom">
        <p class="hero__tagline" data-hero-fade>${s.tagline}</p>
        <dl class="hero__info mono" data-hero-fade>
          <div><dt>Local time</dt><dd data-clock>--:--</dd></div>
          <div><dt>Scroll</dt><dd><a href="#about" class="hero__scroll">Explore <span class="arrow">↓</span></a></dd></div>
        </dl>
      </div>
    </section>

    <section class="about" id="about" data-section="About">
      <div class="section-label mono"><span>(01)</span><span>About</span></div>
      <p class="about__manifesto" data-words>${s.manifesto}</p>
      <div class="about__grid">
        <div class="about__text">${s.about.map((p) => `<p data-reveal>${p}</p>`).join('')}</div>
        <dl class="about__facts" data-reveal>
          ${(s.facts || []).map((f) => `<div><dt class="mono">${f.label}</dt><dd>${f.value}</dd></div>`).join('')}
        </dl>
      </div>
      ${s.pillars?.length ? `<div class="about__pillars">
        <h3 class="mono about__sub">What I do</h3>
        <ol>
          ${s.pillars
            .map(
              (pl, i) => `<li data-reveal>
              <span class="mono pillar__num">${pad(i + 1)}</span>
              <h4 class="pillar__title">${pl.title}</h4>
              <p>${pl.text}</p>
            </li>`
            )
            .join('')}
        </ol>
      </div>` : ''}
      <div class="about__statsrow">
        <ul class="about__stats">
          ${s.stats
            .map(
              (st) => `<li data-reveal>
              <span class="stat display"><span data-count="${st.value}">0</span>${st.suffix}</span>
              <span class="mono">${st.label}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="work" id="work" data-section="Work">
      <div class="section-head">
        <div class="section-label mono"><span>(02)</span><span>Selected work</span></div>
        <h2 class="section-title display" data-split>Things I've <em>shipped</em></h2>
      </div>
      <ul class="work__list">
        ${s.projects
          .map(
            (p, i) => `<li class="work__item" data-reveal style="--c1:${p.colors[0]}">
            <a href="${p.link}" ${p.link.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} data-cursor="Open">
              <span class="work__fill" aria-hidden="true"></span>
              <span class="work__num mono">${pad(i + 1)}</span>
              <span class="work__title display">${p.title}</span>
              <span class="work__swap">
                <span class="work__tags mono">${p.tags.join(' · ')}</span>
                <span class="work__desc">${p.description}</span>
              </span>
              <span class="work__year mono"><span>${p.year}</span><span class="work__arrow">→</span></span>
            </a>
          </li>`
          )
          .join('')}
      </ul>
    </section>

    <section class="stack" id="stack" data-section="Stack">
      <div class="section-label mono"><span>(03)</span><span>Capabilities</span></div>
      <div class="marquee" aria-hidden="true">
        <div class="marquee__track display">
          ${[...s.marquee, ...s.marquee].map((w, i) => `<span class="${i % 2 ? 'outline' : ''}">${w}</span><i>✳</i>`).join('')}
        </div>
      </div>
      <div class="stack__grid">
        ${s.stack
          .map(
            (g, gi) => `<div class="stack__col" data-reveal>
            <h3 class="mono"><span>${pad(gi + 1)}</span>${g.title}</h3>
            <ul>${g.items.map((it) => `<li>${it}</li>`).join('')}</ul>
          </div>`
          )
          .join('')}
      </div>
      <div class="experience">
        <h3 class="section-title display" data-split>Where I've <em>been</em></h3>
        <ul>
          ${s.experience
            .map(
              (e) => `<li data-reveal>
              <span class="mono">${e.period}</span>
              <span class="exp__role">${e.role}</span>
              <span class="exp__company">${e.company}</span>
              <span class="mono exp__place">${e.place}</span>
            </li>`
            )
            .join('')}
        </ul>
      </div>
      ${s.awards?.length ? `<div class="experience">
        <h3 class="section-title display" data-split>Wins &amp; <em>proof</em></h3>
        <ul class="awards">
          ${s.awards
            .map(
              (a, i) => `<li data-reveal>
              <span class="mono">${pad(i + 1)}</span>
              <span class="exp__role">${a.title}</span>
              <span class="exp__company">${a.event}</span>
              <span class="mono exp__place">${a.note}</span>
            </li>`
            )
            .join('')}
        </ul>
        ${s.certifications?.length ? `<div class="certs" data-reveal>
          <h4 class="mono">Certifications</h4>
          <ul>${s.certifications.map((c) => `<li>${c}</li>`).join('')}</ul>
        </div>` : ''}
      </div>` : ''}
    </section>

    <section class="contact" id="contact" data-section="Contact">
      <div class="section-label mono"><span>(04)</span><span>Contact</span></div>
      <h2 class="contact__title display" data-split>Got an idea?<br><em>Let's</em> build it.</h2>
      <div class="contact__row">
        <a class="contact__email" href="mailto:${s.email}" data-magnetic data-cursor="Write">
          <span>${s.email}</span><span class="arrow">↗</span>
        </a>
        <ul class="contact__socials mono">
          ${s.socials
            .map((so) => `<li><a class="roll" href="${so.url}" target="_blank" rel="noopener"><span><span>${so.label}</span></span></a></li>`)
            .join('')}
        </ul>
      </div>
    </section>
  </main>

  <footer class="footer mono">
    <span>© ${new Date().getFullYear()} ${fullName}</span>
    <span class="footer__mid">Designed &amp; built by hand. No templates.</span>
    <a href="#top" class="roll"><span><span>Back to top ↑</span></span></a>
  </footer>`;
}
