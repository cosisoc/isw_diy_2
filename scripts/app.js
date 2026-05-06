/* app.js — Lampe-Toggle, Reveal-Animation, Schritt-Tracker */

(() => {
  // -------- Lampe an/aus --------
  const body = document.body;
  const toggles = document.querySelectorAll('[data-lamp-toggle]');

  function setLamp(state) {
    body.dataset.lamp = state ? 'on' : 'off';
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', state ? 'true' : 'false');
      const label = btn.querySelector('.lamp-toggle__label');
      if (label) label.textContent = state ? 'Lampe aus' : 'Lampe an';
    });
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      setLamp(body.dataset.lamp !== 'on');
    });
  });

  // -------- Reveal beim Scrollen --------
  const revealTargets = document.querySelectorAll('.step, .material, .safety li');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  revealTargets.forEach(t => io.observe(t));

  // -------- Schritt-Tracker (Desktop) --------
  const steps = document.querySelectorAll('.step');
  const trackerList = document.getElementById('tracker');

  if (trackerList && steps.length) {
    steps.forEach(step => {
      const num = step.dataset.step;
      const title = step.querySelector('h3')?.textContent || `Schritt ${num}`;
      const li = document.createElement('li');
      li.className = 'tracker__item';
      li.dataset.target = num;
      li.textContent = `${num}. ${title}`;
      li.addEventListener('click', () => step.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      trackerList.appendChild(li);
    });

    const items = trackerList.querySelectorAll('.tracker__item');
    const trackIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const num = e.target.dataset.step;
        const item = trackerList.querySelector(`[data-target="${num}"]`);
        if (!item) return;
        if (e.isIntersecting) {
          items.forEach(i => i.classList.remove('is-active'));
          item.classList.add('is-active');
          // alle vorherigen als erledigt markieren
          items.forEach(i => {
            if (parseInt(i.dataset.target, 10) < parseInt(num, 10)) {
              i.classList.add('is-done');
            }
          });
        }
      });
    }, { threshold: 0.5 });
    steps.forEach(s => trackIO.observe(s));
  }

  // -------- Sanftes Parallax fürs Hero-Glas --------
  const heroJar = document.getElementById('hero-jar');
  if (heroJar && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 800) {
        heroJar.style.transform = `translateY(${y * 0.08}px) rotate(${y * 0.01}deg)`;
      }
    }, { passive: true });
  }
})();
