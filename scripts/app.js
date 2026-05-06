/* app.js – Hanging Jars Shelf */
(function() {
  'use strict';

  const TOTAL_STEPS = 12;

  const nav = document.querySelector('.process-nav__inner');
  const progressBar = document.querySelector('.progress-bar');
  const steps = document.querySelectorAll('.step-section');

  let state = {
    currentStep: 1,
    completedSteps: [],
    lampOn: false
  };

  function loadState() {
    try {
      const saved = localStorage.getItem('shelfState');
      if (saved) {
        const parsed = JSON.parse(saved);
        state.currentStep = parsed.currentStep || 1;
        state.completedSteps = parsed.completedSteps || [];
        state.lampOn = parsed.lampOn || false;
        if (state.lampOn) document.body.dataset.lamp = 'on';
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem('shelfState', JSON.stringify(state));
    } catch (e) {}
  }

  function createNav() {
    const labels = ['Start', 'System', 'Materials', 'Shelf', 'Jars', 'Light', 'Usage', 'Design', 'Build', 'Done', 'Safety', 'Finish'];

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
      });
    });
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
          const stepId = parseInt(entry.target.dataset.step);
          if (stepId !== state.currentStep) {
            state.currentStep = stepId;
            createNav();
            updateProgress();
            saveState();
          }
        }
      });
    }, observerOptions);

    steps.forEach(step => observer.observe(step));
  }

  function completeStep(stepNum) {
    // Toggle: if already done, remove it
    if (state.completedSteps.includes(stepNum)) {
      state.completedSteps = state.completedSteps.filter(s => s !== stepNum);
    } else {
      state.completedSteps.push(stepNum);
    }

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
    document.querySelectorAll('.material-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          const checkbox = item.querySelector('input[type="checkbox"]');
          checkbox.checked = !checkbox.checked;
        }
      });
    });
  }

  function init() {
    loadState();
    createNav();
    updateProgress();
    initScrollObserver();
    initCompletionButtons();
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
