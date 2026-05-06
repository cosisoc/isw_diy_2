/* app.js – Haupt-Navigation, Progress-Tracking, Prozess-Führung */

(() => {
  'use strict';

  // === ELEMENTE ===
  const progressBar = document.querySelector('.progress-bar__fill');
  const navDots = document.querySelectorAll('.process-nav__dot');
  const sections = document.querySelectorAll('.section[data-step]');
  const lampToggles = document.querySelectorAll('[data-lamp-toggle]');
  const body = document.body;

  // === ZUSTAND ===
  let currentStep = 1;
  const totalSteps = 12;

  // === PROGRESS BAR ===
  function updateProgress(step) {
    const percent = ((step - 1) / (totalSteps - 1)) * 100;
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }

  // === NAVIGATION DOTS ===
  function updateNavDots(activeStep) {
    navDots.forEach((dot, index) => {
      const stepNum = index + 1;
      dot.classList.remove('is-active', 'is-done');

      if (stepNum === activeStep) {
        dot.classList.add('is-active');
      } else if (stepNum < activeStep) {
        dot.classList.add('is-done');
      }
    });
  }

  // === SCHRITT WECHSELN ===
  function goToStep(stepNum) {
    const targetSection = document.querySelector(`.section[data-step="${stepNum}"]`);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // === SCROLL OBSERVER ===
  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = parseInt(entry.target.dataset.step, 10);
        currentStep = step;
        updateProgress(step);
        updateNavDots(step);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // === NAV DOTS CLICK ===
  navDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToStep(index + 1);
    });
  });

  // === LAMPEN TOGGLE (für Licht-Station) ===
  lampToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOn = body.dataset.lamp === 'on';
      body.dataset.lamp = isOn ? 'off' : 'on';

      toggle.setAttribute('aria-pressed', !isOn);
      const label = toggle.querySelector('.lamp-toggle__label');
      if (label) {
        label.textContent = isOn ? 'Licht an' : 'Licht aus';
      }
    });
  });

  // === REVEAL ANIMATION ===
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // === MATERIAL CHECKLISTE ===
  const materialItems = document.querySelectorAll('.material-item');

  materialItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('is-checked');
    });
  });

  // === JAR OPTION AUSWAHL ===
  const jarOptions = document.querySelectorAll('.jar-option');

  jarOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Entferne Auswahl von allen
      jarOptions.forEach(opt => opt.classList.remove('is-selected'));
      // Füge zu geklicktem hinzu
      option.classList.add('is-selected');
    });
  });

  // === INIT ===
  updateProgress(1);
  updateNavDots(1);

  console.log('🫙 Hanging Jars Shelf – App initialized');
})();
