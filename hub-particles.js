(() => {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let raf = 0;
  const mouse = {
    x: -9999,
    y: -9999,
    tx: -9999,
    ty: -9999,
    active: false,
    energy: 0
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      baseVx: (Math.random() - 0.5) * 0.18,
      baseVy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.65 + 0.65,
      o: Math.random() * 0.38 + 0.14,
      pulse: Math.random() * Math.PI * 2
    };
  }

  function createParticles() {
    const count = Math.min(105, Math.max(48, Math.floor((W * H) / 13500)));
    particles = Array.from({ length: count }, makeParticle);
  }

  function keepInside(p) {
    if (p.x < -40) p.x = W + 40;
    if (p.x > W + 40) p.x = -40;
    if (p.y < -40) p.y = H + 40;
    if (p.y > H + 40) p.y = -40;
  }

  function drawCursorField() {
    if (!mouse.active && mouse.energy < 0.02) return;
    const glow = Math.min(1, mouse.energy);
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 230);
    g.addColorStop(0, `rgba(85,201,204,${0.12 * glow})`);
    g.addColorStop(0.35, `rgba(85,201,204,${0.045 * glow})`);
    g.addColorStop(1, 'rgba(85,201,204,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 230, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    mouse.x += (mouse.tx - mouse.x) * 0.18;
    mouse.y += (mouse.ty - mouse.y) * 0.18;
    mouse.energy += ((mouse.active ? 1 : 0) - mouse.energy) * 0.08;

    drawCursorField();

    const linkDist = 145;
    const linkDist2 = linkDist * linkDist;
    const cursorDist = 210;
    const cursorDist2 = cursorDist * cursorDist;

    for (const p of particles) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;

      if (d2 < cursorDist2) {
        const d = Math.sqrt(d2) || 1;
        const power = (1 - d / cursorDist) * (mouse.active ? 0.52 : 0.16);
        // Suave efecto de órbita/repulsión: visible, pero sin convertir el dashboard en pecera.
        p.vx += (dx / d) * power * 0.075 + (-dy / d) * power * 0.025;
        p.vy += (dy / d) * power * 0.075 + ( dx / d) * power * 0.025;
      }

      p.vx += p.baseVx * 0.012;
      p.vy += p.baseVy * 0.012;
      p.vx *= 0.982;
      p.vy *= 0.982;
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.010;
      keepInside(p);

      const glow = Math.max(0.03, p.o + Math.sin(p.pulse) * 0.08);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(85,201,204,${glow})`;
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < linkDist2) {
          const alpha = 0.10 * (1 - Math.sqrt(d2) / linkDist);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(85,201,204,${alpha})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
      const dxm = a.x - mouse.x;
      const dym = a.y - mouse.y;
      const md2 = dxm * dxm + dym * dym;
      if (mouse.energy > 0.02 && md2 < cursorDist2) {
        const alpha = 0.20 * (1 - Math.sqrt(md2) / cursorDist) * mouse.energy;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(123,225,228,${alpha})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
    }

    raf = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createParticles();
    cancelAnimationFrame(raf);
    draw();
  }

  window.addEventListener('resize', () => {
    resize();
    const target = Math.min(105, Math.max(48, Math.floor((W * H) / 13500)));
    if (Math.abs(particles.length - target) > 14) createParticles();
  });

  window.addEventListener('pointermove', e => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    if (!mouse.active) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    mouse.active = false;
    mouse.tx = -9999;
    mouse.ty = -9999;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else draw();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
