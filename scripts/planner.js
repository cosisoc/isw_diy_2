/**
 * planner.js – Gestaltungs-Planer
 * Farbauswahl für Papier-Gestaltung
 */

(function() {
  'use strict';

  const preview = document.querySelector('.design-preview');
  const colorSwatches = document.querySelectorAll('.color-swatch');

  if (!preview) return;

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      // Remove active von allen
      colorSwatches.forEach(s => s.classList.remove('is-active'));
      // Add active zu geklicktem
      swatch.classList.add('is-active');

      // Update preview hintergrund
      const color = swatch.dataset.color;
      if (color) {
        preview.style.backgroundColor = color + '33'; // 20% opacity
      }
    });
  });

})();
