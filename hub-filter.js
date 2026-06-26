/* ════════════════════════════════════════════════════════════
   Science2Venture · Selection Hub — Lógica de mejoras UX/UI
   Módulos independientes: toasts, confeti, modo enfoque,
   micro-tour y navegación por teclado.
   ════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ── Toasts ── */
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5M12 16.5v.5"/></svg>'
  };
  let stack = null;
  function ensureStack() {
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    return stack;
  }
  function toast(message, opts = {}) {
    const type = opts.type || "success";
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast__icon">${ICONS[type] || ICONS.info}</span>
      <div class="toast__body">${opts.title ? `<strong>${opts.title}</strong>` : ""}<span>${message}</span></div>
      <button class="toast__close" aria-label="Cerrar">×</button>`;
    ensureStack().appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    const close = () => {
      el.classList.remove("show");
      el.classList.add("hide");
      setTimeout(() => el.remove(), 420);
    };
    el.querySelector(".toast__close").addEventListener("click", close);
    if (opts.duration !== 0) setTimeout(close, opts.duration || 3800);
    return close;
  }
  window.S2V_toast = toast;

  /* ── Confeti ── */
  function confetti(opts = {}) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let canvas = document.getElementById("confettiCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "confettiCanvas";
      document.body.appendChild(canvas);
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const colors = ["#55c9cc", "#7be1e4", "#2ea8ab", "#d4a853", "#1f9d6b", "#ffffff"];
    const count = opts.count || 150;
    const originX = opts.x != null ? opts.x : W / 2;
    const originY = opts.y != null ? opts.y : H * 0.32;
    const parts = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: 5 + Math.random() * 7,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        life: 0, ttl: 90 + Math.random() * 50
      };
    });
    let frame = 0;
    function tick() {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        if (p.life > p.ttl) continue;
        alive = true;
        p.life++;
        p.vy += 0.28; p.vx *= 0.99;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const fade = Math.max(0, 1 - p.life / p.ttl);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      frame++;
      if (alive && frame < 220) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    }
    tick();
  }
  window.S2V_confetti = confetti;

  /* ── Modo enfoque ── */
  function initFocusMode() {
    const host = document.querySelector(".header-actions");
    if (!host || document.querySelector(".focus-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "focus-toggle";
    btn.setAttribute("aria-pressed", "false");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h2M19 12h2M12 3v2M12 19v2"/></svg>
      <span class="lbl-on">Modo enfoque</span><span class="lbl-off">Enfoque activo</span>`;
    host.insertBefore(btn, host.firstChild);
    const apply = (on) => {
      document.body.classList.toggle("focus-mode", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      try { localStorage.setItem("s2v_focus", on ? "1" : "0"); } catch (e) {}
    };
    btn.addEventListener("click", () => apply(!document.body.classList.contains("focus-mode")));
    try { if (localStorage.getItem("s2v_focus") === "1") apply(true); } catch (e) {}
  }

  /* ── Navegación por teclado en la lista ── */
  function initKeyboardNav() {
    document.addEventListener("keydown", (e) => {
      const search = document.getElementById("searchInput");
      const tag = (e.target.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      const listVisible = !document.getElementById("listSection")?.classList.contains("hidden")
        && !document.getElementById("dashboardView")?.classList.contains("hidden");

      if (e.key === "/" && !typing && listVisible) {
        e.preventDefault();
        search?.focus();
        search?.select();
        return;
      }
      if (e.key === "Escape" && document.activeElement === search) {
        search.blur();
        return;
      }
      if (!listVisible) return;
      if (typing && e.target !== search) return;

      const cards = [...document.querySelectorAll("#initiativeList .initiative-card")];
      if (!cards.length) return;
      let idx = cards.findIndex(c => c.classList.contains("kbd-focus"));
      if (idx < 0) idx = cards.findIndex(c => c.classList.contains("active"));

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        idx = e.key === "ArrowDown" ? Math.min(idx + 1, cards.length - 1) : Math.max(idx - 1, 0);
        if (idx < 0) idx = 0;
        cards.forEach(c => c.classList.remove("kbd-focus"));
        cards[idx].classList.add("kbd-focus");
        cards[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && idx >= 0 && !typing) {
        e.preventDefault();
        cards[idx].querySelector(".card-button")?.click();
      } else if (e.key === "Enter" && e.target === search) {
        const first = cards[0];
        first?.querySelector(".card-button")?.click();
        search.blur();
      }
    });
  }

  /* ── Micro-tour ── */
  const TOUR_KEY = "s2v_tour_done_v1";
  let tourSteps = [], tourIdx = 0, tourEls = null;

  function buildTourEls() {
    const backdrop = document.createElement("div");
    backdrop.className = "tour-backdrop";
    const spot = document.createElement("div");
    spot.className = "tour-spot";
    const pop = document.createElement("div");
    pop.className = "tour-pop";
    backdrop.appendChild(spot);
    document.body.append(backdrop, pop);
    return { backdrop, spot, pop };
  }

  function positionTour() {
    const step = tourSteps[tourIdx];
    const target = step.selector ? document.querySelector(step.selector) : null;
    const { spot, pop } = tourEls;
    if (target) {
      const r = target.getBoundingClientRect();
      const pad = 8;
      spot.style.opacity = "1";
      spot.style.left = `${r.left - pad}px`;
      spot.style.top = `${r.top - pad}px`;
      spot.style.width = `${r.width + pad * 2}px`;
      spot.style.height = `${r.height + pad * 2}px`;
    } else {
      spot.style.opacity = "0";
    }
    pop.innerHTML = `
      <p class="eyebrow">Paso ${tourIdx + 1} de ${tourSteps.length}</p>
      <h4>${step.title}</h4>
      <p>${step.body}</p>
      <div class="tour-pop__foot">
        <div class="tour-dots">${tourSteps.map((_, i) => `<i class="${i === tourIdx ? "active" : ""}"></i>`).join("")}</div>
        <div class="tour-actions">
          <button class="tour-skip" type="button">${tourIdx === tourSteps.length - 1 ? "Cerrar" : "Saltar"}</button>
          <button class="tour-next" type="button">${tourIdx === tourSteps.length - 1 ? "Listo" : "Siguiente"}</button>
        </div>
      </div>`;
    // place popover near target
    requestAnimationFrame(() => {
      pop.classList.add("show");
      const pr = pop.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      let top, left;
      if (target) {
        const r = target.getBoundingClientRect();
        top = r.bottom + 14;
        if (top + pr.height > vh - 12) top = Math.max(12, r.top - pr.height - 14);
        left = Math.min(Math.max(12, r.left), vw - pr.width - 12);
      } else {
        top = vh / 2 - pr.height / 2;
        left = vw / 2 - pr.width / 2;
      }
      pop.style.top = `${top}px`;
      pop.style.left = `${left}px`;
    });
    pop.querySelector(".tour-next").onclick = () => {
      if (tourIdx < tourSteps.length - 1) { tourIdx++; positionTour(); } else endTour();
    };
    pop.querySelector(".tour-skip").onclick = endTour;
  }

  function endTour() {
    if (!tourEls) return;
    tourEls.pop.classList.remove("show");
    tourEls.backdrop.classList.remove("show");
    setTimeout(() => {
      tourEls.backdrop.remove();
      tourEls.pop.remove();
      tourEls = null;
    }, 320);
    try { localStorage.setItem(TOUR_KEY, "1"); } catch (e) {}
  }

  function startTour(steps, force) {
    try { if (!force && localStorage.getItem(TOUR_KEY) === "1") return; } catch (e) {}
    tourSteps = steps.filter(s => !s.selector || document.querySelector(s.selector));
    if (!tourSteps.length) return;
    tourIdx = 0;
    tourEls = buildTourEls();
    requestAnimationFrame(() => { tourEls.backdrop.classList.add("show"); positionTour(); });
    window.addEventListener("resize", positionTour);
  }
  window.S2V_startTour = (role, force) => {
    const common = [
      { selector: ".summary-grid", title: "Tu resumen en un vistazo", body: "Las tarjetas superiores muestran las cifras clave de la convocatoria y se actualizan según los filtros activos." },
      { selector: "#tabNav", title: "Cambia de vista", body: role === "coordinacion" ? "Alterna entre la radiografía analítica, el mapa por componentes, las iniciativas, el ranking y la gestión de evaluadores." : "Aquí encuentras las iniciativas que te fueron asignadas para evaluar por componentes." }
    ];
    const extra = role === "evaluador"
      ? [{ selector: ".evaluator-progress", title: "Tu progreso", body: "Sigue cuántos componentes has enviado. Las iniciativas marcan su estado: sin evaluar, en progreso o evaluada." },
         { selector: ".toolbar", title: "Busca y filtra", body: "Pulsa “/” para buscar al instante y usa las flechas ↑ ↓ y Enter para abrir una ficha sin el ratón." }]
      : [{ selector: ".toolbar", title: "Busca y filtra", body: "Pulsa “/” para buscar al instante; los filtros activos aparecen como chips removibles y puedes ordenar la lista." }];
    startTour([...common, ...extra], force);
  };

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", () => {
    initKeyboardNav();
  });
  // Focus toggle is mounted when dashboard is ready (app dispatches event)
  window.addEventListener("s2v:dashboardready", () => {
    initFocusMode();
  });
})();
