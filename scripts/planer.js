/* planer.js — Interaktives Planungsmodul für Kinder
   Einfache Bastelfläche: Malen, Stempeln, Aufkleben */

(() => {
  const canvas = document.getElementById('plan-canvas');
  const ctx = canvas?.getContext('2d');
  const svgLayer = document.getElementById('plan-svg-layer');
  const paperLayer = document.getElementById('plan-paper-layer');

  if (!canvas || !ctx || !svgLayer) return;

  // ---- State ----
  let tool = 'draw'; // 'draw' | 'stamp' | 'paper'
  let color = '#1f4031';
  let stampShape = 'star';
  let paperShape = 'circle';
  let isDrawing = false;
  let lastPos = null;

  // ---- Setup Canvas (HiDPI) ----
  function resizeCanvas() {
    // Der Canvas liegt in .planer__layers, nicht direkt im parent
    const container = canvas.closest('.planer__jar-content') || canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  // Verzögertes Init für korrekte Container-Größe
  function init() {
    // Warte auf Layout-Berechnung
    setTimeout(() => {
      resizeCanvas();
    }, 50);

    // Beim ersten Resize Canvas leeren (sonst wird verzerrt)
    let initialized = false;
    window.addEventListener('resize', () => {
      if (!initialized) {
        initialized = true;
        return;
      }
      resizeCanvas();
    });
  }
  init();

  // ---- Drawing (Marker) ----
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    if (tool !== 'draw') return;
    isDrawing = true;
    lastPos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
  }

  function moveDraw(e) {
    if (!isDrawing || tool !== 'draw') return;
    const pos = getPos(e);
    ctx.lineWidth = 8; // dicker Marker
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.quadraticCurveTo(
      (lastPos.x + pos.x) / 2,
      (lastPos.y + pos.y) / 2,
      pos.x, pos.y
    );
    ctx.stroke();
    lastPos = pos;
  }

  function endDraw() {
    isDrawing = false;
    lastPos = null;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); moveDraw(e); }, { passive: false });
  canvas.addEventListener('touchend', endDraw);

  // ---- Stempeln (SVG Overlays) ----
  const stampDefs = {
    star: 'M12 2 l3 7 h7 l-6 4 2 7 -6-4 -6 4 2-7 -6-4 h7 z',
    heart: 'M12 21 S4 16 4 10 A4 4 0 0 1 12 8 a4 4 0 0 1 8 2c0 6-8 11-8 11z',
    flower: 'M12 2 a3 3 0 0 1 0 6 a3 3 0 0 1 0-6 M12 8 a3 3 0 0 1 0 6 a3 3 0 0 1 0-6 M6 5 a3 3 0 0 0 6 0 a3 3 0 0 0-6 0 M12 11 a3 3 0 0 0 6 0 a3 3 0 0 0-6 0 M9 7.5 a3 3 0 0 0-3 3 a3 3 0 0 0 3-3 M12 7.5 a3 3 0 0 0 3 3 a3 3 0 0 0-3-3',
    circle: 'M12 2 a10 10 0 1 1 0 20 a10 10 0 1 1 0-20',
    moon: 'M12 3 a9 9 0 1 0 9 9 A7 7 0 0 1 12 3z'
  };

  function addStamp(x, y) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', stampDefs[stampShape]);
    path.setAttribute('fill', color);
    path.setAttribute('opacity', '0.85');

    // Zufällige leichte Drehung und Größe für handgemachten Look
    const rot = (Math.random() - 0.5) * 30;
    const scale = 1.2 + Math.random() * 0.4;

    g.setAttribute('transform', `translate(${x - 12}, ${y - 12}) rotate(${rot} 12 12) scale(${scale})`);
    g.appendChild(path);
    svgLayer.appendChild(g);

    // Kleine Feedback-Animation
    g.style.opacity = '0';
    requestAnimationFrame(() => {
      g.style.transition = 'opacity 0.2s ease';
      g.style.opacity = '1';
    });
  }

  // ---- Papierstücke (Collage Layer) ----
  const paperColors = ['#f0c987', '#e88b6c', '#c95d5d', '#7aa17a', '#7896b8', '#b88dbf', '#e3d4b8'];

  function addPaperPiece(x, y) {
    const piece = document.createElement('div');
    piece.className = 'paper-piece';

    const size = 40 + Math.random() * 30;
    const bg = paperColors[Math.floor(Math.random() * paperColors.length)];
    const rotation = (Math.random() - 0.5) * 40;

    // Form-Varianten via clip-path
    const shapes = [
      'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', // Raute
      'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', // Trapez
      'circle(50% at 50% 50%)', // Kreis
      'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', // Rechteck
      'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' // Fünfeck
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    piece.style.cssText = `
      position: absolute;
      left: ${x - size/2}px;
      top: ${y - size/2}px;
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      clip-path: ${shape};
      transform: rotate(${rotation}deg);
      box-shadow: 1px 1px 0 rgba(0,0,0,0.1);
      pointer-events: none;
      opacity: 0.9;
    `;

    paperLayer.appendChild(piece);
  }

  // ---- Klick auf Arbeitsfläche (Stempel oder Papier) ----
  function handleWorkAreaClick(e) {
    if (tool === 'draw') return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;

    if (tool === 'stamp') addStamp(x, y);
    if (tool === 'paper') addPaperPiece(x, y);
  }

  canvas.addEventListener('click', handleWorkAreaClick);
  canvas.addEventListener('touchend', (e) => {
    if (tool !== 'draw') handleWorkAreaClick(e);
  });

  // ---- Toolbar ----
  const toolBtns = document.querySelectorAll('[data-plan-tool]');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tool = btn.dataset.planTool;
      toolBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Cursor anpassen
      canvas.style.cursor = tool === 'draw' ? 'crosshair' : 'pointer';
    });
  });

  // Farbwahl
  const colorBtns = document.querySelectorAll('[data-plan-color]');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      color = btn.dataset.planColor;
      colorBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  // Stempel-Auswahl
  const stampBtns = document.querySelectorAll('[data-stamp]');
  stampBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stampShape = btn.dataset.stamp;
      stampBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      tool = 'stamp';
      updateToolUI();
    });
  });

  function updateToolUI() {
    toolBtns.forEach(b => {
      b.classList.toggle('is-active', b.dataset.planTool === tool);
    });
    canvas.style.cursor = tool === 'draw' ? 'crosshair' : 'pointer';
  }

  // Reset
  const resetBtn = document.querySelector('[data-plan-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      svgLayer.innerHTML = '';
      paperLayer.innerHTML = '';
    });
  }

  // Undo letztes Element
  const undoBtn = document.querySelector('[data-plan-undo]');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      const lastSvg = svgLayer.lastElementChild;
      const lastPaper = paperLayer.lastElementChild;
      if (lastPaper) lastPaper.remove();
      else if (lastSvg) lastSvg.remove();
    });
  }
})();
