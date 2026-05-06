/* planner.js – Gestaltungs-Planer für Papier und Farben */

(() => {
  'use strict';

  // Design-Station nur initialisieren, wenn Elemente vorhanden
  const preview = document.querySelector('.design-preview');
  if (!preview) return;

  const colorSwatches = document.querySelectorAll('.color-swatch');

  // === FARBE WECHSELN ===
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      // Active-State aktualisieren
      colorSwatches.forEach(s => s.classList.remove('is-active'));
      swatch.classList.add('is-active');

      // Preview-Hintergrund ändern (simuliert Papierfarbe)
      const color = swatch.dataset.color;
      if (color) {
        preview.style.backgroundColor = color + '40'; // 40 = 25% Opacity
      }
    });
  });

  // === MUSTER OVERLAY (optional) ===
  // Hier könnte später Canvas- oder SVG-basiertes Zeichnen hinzugefügt werden

  console.log('🎨 Design Planner initialized');
})();
