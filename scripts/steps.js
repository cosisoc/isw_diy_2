/* steps.js — Live-Vorschau im Studio-Bereich
   Lässt Kinder Papierfarbe und Muster auswählen und zeigt das Glas live. */

(() => {
  const paper   = document.getElementById('studio-paper');
  const pattern = document.getElementById('studio-pattern');
  if (!paper || !pattern) return;

  const swatches = document.querySelectorAll('.swatch');
  const patterns = document.querySelectorAll('.pattern');

  // ---- Farbe wählen ----
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('is-active'));
      btn.classList.add('is-active');
      paper.setAttribute('fill', btn.dataset.color);
    });
  });

  // ---- Muster wählen ----
  patterns.forEach(btn => {
    btn.addEventListener('click', () => {
      patterns.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      const id = btn.dataset.pattern;
      if (id === 'none') {
        pattern.setAttribute('opacity', '0');
      } else {
        pattern.setAttribute('fill', `url(#${id})`);
        pattern.setAttribute('opacity', '0.55');
      }
    });
  });

  // ---- Bonus: kleines „Aufleuchten" wenn man im Studio etwas ändert ----
  const studio = document.getElementById('studio-jar');
  function pulse() {
    if (!studio) return;
    studio.style.transition = 'transform 400ms cubic-bezier(.2,.7,.2,1)';
    studio.style.transform = 'scale(1.02)';
    setTimeout(() => { studio.style.transform = 'scale(1)'; }, 400);
  }
  swatches.forEach(b => b.addEventListener('click', pulse));
  patterns.forEach(b => b.addEventListener('click', pulse));
})();
