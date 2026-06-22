(() => {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  let W, H, raf;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Color del tema: lee --particle-rgb / --particle-alpha de las variables CSS.
  let RGB = '85,201,204', ALPHA = 1;
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    RGB = (cs.getPropertyValue('--particle-rgb') || '85,201,204').trim();
    ALPHA = parseFloat(cs.getPropertyValue('--particle-alpha')) || 1;
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(75, Math.floor((W * H) / 16000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 1.8 + 0.6,
        o: Math.random() * 0.45 + 0.12,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const maxDist = 160;
    const maxDist2 = maxDist * maxDist;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.012;
      if (p.x < -30) p.x = W + 30;
      if (p.x > W + 30) p.x = -30;
      if (p.y < -30) p.y = H + 30;
      if (p.y > H + 30) p.y = -30;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const md = Math.sqrt(dx * dx + dy * dy);
      if (md < 180) {
        const force = (180 - md) / 180 * 0.018;
        p.x += dx * force;
        p.y += dy * force;
      }

      const glow = (p.o + Math.sin(p.pulse) * 0.08) * ALPHA;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RGB},${glow})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          const alpha = 0.14 * (1 - Math.sqrt(d2) / maxDist) * ALPHA;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${RGB},${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(draw);
  }

  // Render estático (una sola pasada) para reduced-motion.
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RGB},${p.o * ALPHA})`;
      ctx.fill();
    }
    const maxDist = 140, maxDist2 = maxDist * maxDist;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist2) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${RGB},${0.11 * (1 - Math.sqrt(d2) / maxDist) * ALPHA})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    // El usuario pidió movimiento explícito en el fondo: animamos siempre.
    draw();
  }

  function init() {
    readTheme();
    resize();
    createParticles();
    start();
  }

  window.addEventListener('resize', () => {
    resize();
    const target = Math.min(75, Math.floor((W * H) / 16000));
    if (Math.abs(particles.length - target) > 12) createParticles();
    if (reduceMotion.matches) start();
  });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  // Recolorear al cambiar de tema (Light/Dark).
  window.addEventListener('s2v:themechange', () => { readTheme(); if (reduceMotion.matches) start(); });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
