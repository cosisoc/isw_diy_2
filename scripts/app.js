/* app.js – Hanging Jars Shelf */
(function() {
  'use strict';

  const TOTAL_STEPS = 10;

  const nav = document.querySelector('.process-nav__inner');
  const progressBar = document.querySelector('.progress-bar');
  const steps = document.querySelectorAll('.step-section');

  let state = {
    currentStep: 1,
    completedSteps: [],
    lampOn: false
  };

  function normalizeCurrentStep(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(TOTAL_STEPS, Math.trunc(n)));
  }

  function normalizeCompletedSteps(list) {
    if (!Array.isArray(list)) return [];
    const nums = list
      .map(v => Number(v))
      .filter(n => Number.isFinite(n) && n >= 1 && n <= TOTAL_STEPS);
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('shelfState');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.currentStep = normalizeCurrentStep(parsed.currentStep || 1);
        state.completedSteps = normalizeCompletedSteps(parsed.completedSteps || []);
        state.lampOn = parsed.lampOn || false;
        if (state.lampOn) document.body.dataset.lamp = 'on';
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      state.currentStep = normalizeCurrentStep(state.currentStep);
      state.completedSteps = normalizeCompletedSteps(state.completedSteps);
      localStorage.setItem('shelfState', JSON.stringify(state));
    } catch (e) {}
  }

  function scrollNavToStep(stepNum, behavior = 'smooth') {
    try {
      if (!nav) return;
      const btn = nav.querySelector(`.nav-item[data-step="${stepNum}"]`);
      if (!btn) return;

      const targetLeft = btn.offsetLeft - (nav.clientWidth - btn.clientWidth) / 2;
      const maxLeft = Math.max(0, nav.scrollWidth - nav.clientWidth);
      const clampedLeft = Math.max(0, Math.min(maxLeft, targetLeft));

      if (Math.abs(nav.scrollLeft - clampedLeft) < 1) return;

      nav.scrollTo({ left: clampedLeft, behavior });
    } catch (e) {}
  }

  function createNav() {
    const labels = ['Project', 'How it works', 'Materials', 'Clean', 'Decorate', 'Light jar', 'Glue lids', 'Mount', 'Attach jars', 'Done'];

    nav.innerHTML = labels.map((label, i) => {
      const stepNum = i + 1;
      let status = 'todo';
      if (state.completedSteps.includes(stepNum)) status = 'done';
      else if (stepNum === state.currentStep) status = 'current';

      return `
        <button class="nav-item" data-step="${stepNum}" data-status="${status}" type="button">
          <span class="nav-item__status">${status === 'done' ? '✓' : stepNum}</span>
          ${status === 'current' ? `<span>${label}</span>` : ''}
        </button>
      `;
    }).join('');

    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const step = parseInt(item.dataset.step);
        scrollToStep(step);
        scrollNavToStep(step);
      });
    });

    // Keep the current step visible in the horizontal nav (mobile).
    scrollNavToStep(state.currentStep, 'auto');
  }

  function updateProgress() {
    const percent = ((state.currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function scrollToStep(stepNum) {
    const target = document.getElementById(`step-${stepNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function initScrollObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepId = normalizeCurrentStep(parseInt(entry.target.dataset.step));
          if (stepId !== state.currentStep) {
            state.currentStep = stepId;
            createNav();
            updateProgress();
            saveState();
            scrollNavToStep(state.currentStep);
          }
        }
      });
    }, observerOptions);

    steps.forEach(step => observer.observe(step));
  }

  function completeStep(stepNum) {
    stepNum = Number(stepNum);
    if (!Number.isFinite(stepNum)) return;

    // Toggle: if already done, remove it
    if (state.completedSteps.includes(stepNum)) {
      state.completedSteps = state.completedSteps.filter(s => s !== stepNum);
    } else {
      state.completedSteps.push(stepNum);
    }

    state.completedSteps = normalizeCompletedSteps(state.completedSteps);

    // Update button visual
    const btn = document.querySelector(`#step-${stepNum} .completion-button`);
    if (btn) {
      if (state.completedSteps.includes(stepNum)) {
        btn.classList.add('is-done');
      } else {
        btn.classList.remove('is-done');
      }
    }

    // If completing (not uncompleting) and not on last step, scroll forward
    if (state.completedSteps.includes(stepNum) && stepNum < TOTAL_STEPS) {
      setTimeout(() => {
        scrollToStep(stepNum + 1);
      }, 300);
    }

    createNav();
    updateProgress();
    saveState();
  }

  function initCompletionButtons() {
    document.querySelectorAll('.completion-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.step-section');
        if (section) {
          const stepNum = parseInt(section.dataset.step);
          completeStep(stepNum);
        }
      });
    });
  }

  function syncCompletionButtonsFromState() {
    state.completedSteps = normalizeCompletedSteps(state.completedSteps);
    document.querySelectorAll('.step-section').forEach(section => {
      const stepNum = Number(section.dataset.step);
      if (!Number.isFinite(stepNum)) return;
      const btn = section.querySelector('.completion-button');
      if (!btn) return;

      if (state.completedSteps.includes(stepNum)) btn.classList.add('is-done');
      else btn.classList.remove('is-done');
    });
  }

  function initJarOptions() {
    document.querySelectorAll('.jar-option').forEach(opt => {
      opt.addEventListener('click', () => {
        // Toggle selection on/off
        if (opt.classList.contains('is-selected')) {
          opt.classList.remove('is-selected');
        } else {
          opt.classList.add('is-selected');
        }
      });
    });
  }

  function initLampToggle() {
    document.querySelectorAll('[data-lamp-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        state.lampOn = !state.lampOn;
        document.body.dataset.lamp = state.lampOn ? 'on' : 'off';

        const label = btn.querySelector('.lamp-toggle__label');
        if (label) {
          label.textContent = state.lampOn ? 'Turn light off' : 'Turn light on';
        }

        saveState();
      });
    });
  }

  function initMaterialItems() {
  }

  function init() {
    loadState();
    createNav();
    updateProgress();
    initScrollObserver();
    initCompletionButtons();
    syncCompletionButtonsFromState();
    initJarOptions();
    initLampToggle();
    initMaterialItems();

    // Update lamp toggle labels on load
    document.querySelectorAll('[data-lamp-toggle]').forEach(btn => {
      const label = btn.querySelector('.lamp-toggle__label');
      if (label) {
        label.textContent = state.lampOn ? 'Turn light off' : 'Turn light on';
      }
    });

    console.log('🫙 Shelf ready – scroll freely or click through!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
