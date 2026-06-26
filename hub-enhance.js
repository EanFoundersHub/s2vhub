/* ════════════════════════════════════════════════════════════
   Science2Venture · Selection Hub — Capa de mejoras UX/UI
   Usa las variables de hub-styles.css (Light/Dark).
   ════════════════════════════════════════════════════════════ */

/* ── 1. Toasts ── */
.toast-stack {
  position: fixed;
  right: 18px; bottom: 18px;
  z-index: 4000;
  display: flex; flex-direction: column;
  gap: 10px;
  max-width: min(360px, calc(100vw - 36px));
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex; align-items: flex-start; gap: 11px;
  padding: 13px 15px;
  border-radius: var(--radius-md);
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(var(--blur));
  color: var(--text);
  font-size: 0.88rem; line-height: 1.4;
  transform: translateY(14px) scale(0.98);
  opacity: 0;
  transition: transform 0.4s var(--ease-out), opacity 0.4s var(--ease-out);
}
.toast.show { transform: translateY(0) scale(1); opacity: 1; }
.toast.hide { transform: translateY(8px) scale(0.98); opacity: 0; }
.toast__icon {
  flex-shrink: 0;
  width: 22px; height: 22px; margin-top: 1px;
  border-radius: 7px;
  display: grid; place-items: center;
  color: #061012;
  background: linear-gradient(135deg, var(--teal), var(--teal-light));
}
.toast__icon svg { width: 14px; height: 14px; }
.toast__body { flex: 1; }
.toast__body strong { display: block; font-weight: 700; color: var(--text-strong); margin-bottom: 1px; }
.toast__body span { color: var(--text-muted); font-size: 0.82rem; }
.toast__close {
  flex-shrink: 0; border: none; background: transparent;
  color: var(--text-muted); cursor: pointer;
  font-size: 1.1rem; line-height: 1; padding: 2px 4px; border-radius: 6px;
}
.toast__close:hover { background: var(--surface-hover); color: var(--text); }
.toast.success .toast__icon { background: linear-gradient(135deg, var(--success), #36c08a); color: #042417; }
.toast.error .toast__icon { background: linear-gradient(135deg, var(--danger), #f59a9a); color: #3a0d0d; }
.toast.info .toast__icon { background: linear-gradient(135deg, var(--gold), #e9c97e); color: #2c2207; }

/* ── 2. Avatar + saludo en header ── */
.user-chip { position: relative; }
.user-identity { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 12px;
  display: grid; place-items: center;
  font-size: 0.86rem; font-weight: 800; letter-spacing: 0.02em;
  color: #061012;
  background: linear-gradient(135deg, var(--teal), var(--teal-light));
  box-shadow: 0 4px 14px rgba(85,201,204,0.24);
}
.user-identity-text { display: flex; flex-direction: column; line-height: 1.15; }
.user-greeting { color: var(--text-muted); font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.user-identity-text #userEmailLabel { color: var(--text-strong); font-weight: 700; font-size: 0.92rem; }

/* ── 3. Barra de progreso del evaluador ── */
.evaluator-progress {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center; gap: 16px;
  padding: 16px 20px; margin-bottom: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--teal-chip-border);
  background: linear-gradient(135deg, var(--teal-chip-bg), var(--surface));
  animation: fadeInUp 0.45s var(--ease-out) both;
}
.evaluator-progress__label { display: flex; flex-direction: column; gap: 2px; }
.evaluator-progress__label strong { font-size: 1.05rem; font-weight: 800; color: var(--text-strong); letter-spacing: -0.01em; }
.evaluator-progress__label span { color: var(--text-muted); font-size: 0.78rem; font-weight: 600; }
.evaluator-progress__bar {
  height: 10px; border-radius: 999px;
  background: var(--track); overflow: hidden;
  position: relative;
}
.evaluator-progress__bar i {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--teal-dark), var(--teal), var(--teal-light));
  transition: width 0.8s var(--ease-out);
}
.evaluator-progress__pct {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em;
  color: var(--teal-text); min-width: 64px; text-align: right;
}
.evaluator-progress.is-complete { border-color: var(--succ-chip-border); background: linear-gradient(135deg, var(--succ-chip-bg), var(--surface)); }
.evaluator-progress.is-complete .evaluator-progress__bar i { background: linear-gradient(90deg, var(--success), #36c08a); }
.evaluator-progress.is-complete .evaluator-progress__pct { color: var(--succ-chip-text); }

/* ── 4. Skeleton loaders ── */
@keyframes skelShimmer { 0% { background-position: -340px 0; } 100% { background-position: 340px 0; } }
.skeleton {
  border-radius: 8px;
  background: var(--track);
  background-image: linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--text) 9%, transparent) 50%, transparent 100%);
  background-size: 340px 100%;
  background-repeat: no-repeat;
  animation: skelShimmer 1.1s linear infinite;
}
.skel-card {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 16px;
  padding: 14px;
  display: grid; gap: 10px;
}
.skel-line { height: 11px; }
.skel-line.sm { height: 9px; }
.skel-line.w40 { width: 40%; }
.skel-line.w60 { width: 60%; }
.skel-line.w80 { width: 80%; }
.skel-badges { display: flex; gap: 6px; margin-top: 4px; }
.skel-badges .skeleton { width: 54px; height: 18px; border-radius: 999px; }
.metric-card .skel-line.metric-num { height: 30px; width: 56px; margin-top: 6px; }

/* ── 5. Transición entre tabs ── */
@keyframes panelEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.panel-enter { animation: panelEnter 0.4s var(--ease-out) both; }

/* ── 6. Chips de filtros activos ── */
.active-filters {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 0 12px 12px;
}
.active-filters:empty { display: none; }
.active-filters > .af-label { color: var(--text-muted); font-size: 0.74rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 8px 5px 11px;
  border-radius: 999px;
  background: var(--teal-chip-bg);
  border: 1px solid var(--teal-chip-border);
  color: var(--teal-chip-text);
  font-size: 0.74rem; font-weight: 700;
}
.filter-chip button {
  border: none; background: transparent; cursor: pointer;
  color: inherit; opacity: 0.7;
  width: 16px; height: 16px; border-radius: 50%;
  display: grid; place-items: center; font-size: 0.9rem; line-height: 1;
  transition: opacity 0.15s, background 0.15s;
}
.filter-chip button:hover { opacity: 1; background: color-mix(in srgb, var(--teal) 22%, transparent); }
.filter-chip.clear-all {
  background: transparent; border-color: var(--border);
  color: var(--text-muted); cursor: pointer; padding: 5px 11px;
}
.filter-chip.clear-all:hover { border-color: var(--border-hover); color: var(--text); }

/* ── 6b. Orden + resaltado de búsqueda ── */
.sort-field select { width: 100%; }
mark.search-hit {
  background: color-mix(in srgb, var(--teal) 40%, transparent);
  color: inherit; border-radius: 3px; padding: 0 1px;
}
.initiative-card.kbd-focus .card-button {
  border-color: var(--teal);
  box-shadow: var(--ring-shadow);
}

/* ── 7. CTA en estado vacío ── */
.empty-cta {
  margin-top: 18px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 18px; border: none; cursor: pointer;
  border-radius: 999px;
  font-family: inherit; font-weight: 800; font-size: 0.84rem;
  color: #061012;
  background: linear-gradient(135deg, var(--teal), var(--teal-light));
  box-shadow: 0 6px 20px rgba(85,201,204,0.25);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease);
}
.empty-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(85,201,204,0.34); }
.empty-cta svg { width: 16px; height: 16px; }

/* ── 8. Modo enfoque ── */
.focus-toggle {
  display: inline-flex; align-items: center; gap: 7px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-muted); cursor: pointer;
  border-radius: 999px; padding: 8px 13px;
  font-family: inherit; font-weight: 600; font-size: 0.82rem;
  transition: all 0.2s var(--ease);
}
.focus-toggle:hover { background: var(--surface-hover); border-color: var(--border-hover); color: var(--text); }
.focus-toggle svg { width: 15px; height: 15px; }
body.focus-mode .focus-toggle { background: var(--teal-chip-bg); border-color: var(--teal-chip-border); color: var(--teal-text); }
body.focus-mode #particleCanvas,
body.focus-mode .orb,
body.focus-mode .grain { opacity: 0 !important; transition: opacity 0.5s var(--ease); }
.focus-toggle .lbl-off { display: none; }
body.focus-mode .focus-toggle .lbl-on { display: none; }
body.focus-mode .focus-toggle .lbl-off { display: inline; }

/* ── 9. Confeti ── */
#confettiCanvas {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  pointer-events: none; z-index: 5000;
}

/* ── 10. Micro-tour ── */
.tour-backdrop {
  position: fixed; inset: 0; z-index: 3500;
  background: rgba(6,12,16,0.55);
  backdrop-filter: blur(2px);
  opacity: 0; transition: opacity 0.3s var(--ease);
}
.tour-backdrop.show { opacity: 1; }
.tour-spot {
  position: absolute;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(6,12,16,0.55), 0 0 0 3px var(--teal);
  transition: all 0.4s var(--ease-out);
  pointer-events: none;
}
.tour-pop {
  position: fixed; z-index: 3600;
  width: min(320px, calc(100vw - 32px));
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 20px;
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}
.tour-pop.show { opacity: 1; transform: translateY(0); }
.tour-pop .eyebrow { color: var(--teal-text); opacity: 1; margin-bottom: 6px; }
.tour-pop h4 { margin: 0 0 6px; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-strong); }
.tour-pop p { margin: 0; color: var(--text-muted); font-size: 0.88rem; line-height: 1.5; }
.tour-pop__foot { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 10px; }
.tour-dots { display: flex; gap: 6px; }
.tour-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--border-hover); transition: background 0.2s, width 0.2s; }
.tour-dots i.active { background: var(--teal); width: 18px; border-radius: 999px; }
.tour-actions { display: flex; gap: 8px; }
.tour-skip {
  border: none; background: transparent; cursor: pointer;
  color: var(--text-muted); font-family: inherit; font-weight: 600; font-size: 0.82rem;
  padding: 8px 10px; border-radius: 999px;
}
.tour-skip:hover { color: var(--text); background: var(--surface-hover); }
.tour-next {
  border: none; cursor: pointer;
  color: #061012; background: linear-gradient(135deg, var(--teal), var(--teal-light));
  font-family: inherit; font-weight: 800; font-size: 0.82rem;
  padding: 8px 16px; border-radius: 999px;
  transition: transform 0.2s var(--ease);
}
.tour-next:hover { transform: translateY(-1px); }

/* ── 11. Tabs internas del detalle ── */
.detail-section-tabs {
  position: sticky; top: 92px; z-index: 18;
  display: flex; gap: 6px; flex-wrap: wrap;
  margin: 14px 0 4px;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--sticky-bg);
  backdrop-filter: blur(var(--blur));
}
.detail-section-tab {
  border: none; cursor: pointer;
  padding: 8px 13px; border-radius: 8px;
  background: transparent; color: var(--text-muted);
  font-family: inherit; font-weight: 700; font-size: 0.8rem;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}
.detail-section-tab:hover { background: var(--tab-hover-bg); color: var(--text); }
.detail-section-tab.active { background: var(--tab-active-bg); color: var(--tab-active-text); }
.detail-section.tab-hidden { display: none !important; }
.detail-section.tab-shown { animation: panelEnter 0.32s var(--ease-out) both; }

/* ── 12. Card de iniciativa: realce del estado de evaluación ── */
.badge.progress { background: var(--warn-chip-bg); color: var(--warn-chip-text); border-color: var(--warn-chip-border); }

/* ── Responsive ── */
@media (max-width: 860px) {
  .evaluator-progress { grid-template-columns: 1fr auto; row-gap: 12px; }
  .evaluator-progress__bar { grid-column: 1 / -1; order: 3; }
  .toast-stack { right: 10px; left: 10px; bottom: 10px; max-width: none; }
  .detail-section-tabs { top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .toast, .panel-enter, .tour-pop, .evaluator-progress, .detail-section.tab-shown { animation: none !important; transition: none !important; }
  .skeleton { animation: none !important; }
}

/* ════════════════════════════════════════════════════════════
   13. Coordinación · Ranking rediseñado (podio + lista legible)
   Reemplaza la tabla ancha de 1500px por tarjetas claras.
   ════════════════════════════════════════════════════════════ */

/* — Podio de líderes — */
.rank-podium {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.podium-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.podium-card::before {
  content: "";
  position: absolute; inset: 0 auto 0 0; width: 4px;
  background: var(--border-hover);
}
.podium-1 { background: linear-gradient(135deg, color-mix(in srgb, #e9c97e 16%, var(--surface)), var(--surface)); border-color: color-mix(in srgb, #e9c97e 45%, var(--border)); }
.podium-1::before { background: linear-gradient(180deg, #f0d489, #d4a93f); }
.podium-2 { background: linear-gradient(135deg, color-mix(in srgb, #c3ccd6 18%, var(--surface)), var(--surface)); border-color: color-mix(in srgb, #c3ccd6 50%, var(--border)); }
.podium-2::before { background: linear-gradient(180deg, #d6dde4, #aab4bf); }
.podium-3 { background: linear-gradient(135deg, color-mix(in srgb, #d8a479 18%, var(--surface)), var(--surface)); border-color: color-mix(in srgb, #d8a479 45%, var(--border)); }
.podium-3::before { background: linear-gradient(180deg, #e0ab80, #b87b4e); }
.podium-rank {
  display: grid; place-items: center;
  width: 34px; height: 34px; flex-shrink: 0;
  border-radius: 11px;
  font-weight: 900; font-size: 1rem;
  color: #2a210a;
}
.podium-1 .podium-rank { background: linear-gradient(135deg, #f3da93, #d8ad44); }
.podium-2 .podium-rank { background: linear-gradient(135deg, #dde3e9, #aeb8c2); color: #2b3138; }
.podium-3 .podium-rank { background: linear-gradient(135deg, #e6b389, #bd8154); color: #3a2413; }
.podium-info { min-width: 0; display: grid; gap: 2px; }
.podium-info strong { color: var(--text-strong); font-size: 0.92rem; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.podium-info small { color: var(--text-muted); font-size: 0.72rem; font-weight: 600; }
.podium-score { text-align: right; line-height: 1; }
.podium-score strong { display: block; color: var(--text-strong); font-size: 1.45rem; font-weight: 800; letter-spacing: -0.03em; }
.podium-score span { color: var(--text-muted); font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
.podium-card.is-provisional { opacity: 0.9; }
.podium-card.is-provisional .podium-score strong { color: var(--text-soft); }

/* — Lista de ranking — */
.rank-list { display: grid; gap: 11px; }
.rank-row {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease), transform 0.18s var(--ease);
}
.rank-row:hover { border-color: var(--teal-chip-border); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.rank-row.is-provisional { opacity: 0.94; }
.rank-row.is-open { border-color: var(--teal-chip-border); }
.rank-row__main {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 188px;
  gap: 18px;
  align-items: center;
  padding: 15px 18px;
}
.rank-row .rank-badge {
  display: grid; place-items: center;
  width: 38px; height: 38px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--field-bg);
  color: var(--text-strong);
  font-weight: 900; font-size: 1rem;
}
.rank-row .rank-badge.medal { border: none; color: #2a210a; box-shadow: var(--shadow-sm); }
.rank-row .rank-badge.medal-1 { background: linear-gradient(135deg, #f3da93, #d8ad44); }
.rank-row .rank-badge.medal-2 { background: linear-gradient(135deg, #dde3e9, #aeb8c2); color: #2b3138; }
.rank-row .rank-badge.medal-3 { background: linear-gradient(135deg, #e6b389, #bd8154); color: #3a2413; }
.rank-row__body { min-width: 0; display: grid; gap: 10px; }
.rank-row__head { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 12px; }
.rank-row__name { color: var(--text-strong); font-size: 1.02rem; font-weight: 750; letter-spacing: -0.01em; line-height: 1.25; }
.rank-row__meta { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.rank-code { color: var(--teal-text); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.02em; }
.rank-route { color: var(--text-muted); font-size: 0.74rem; font-weight: 700; }
.rank-row__meta .status-pill { font-size: 0.66rem; }

.rank-components { display: flex; flex-wrap: wrap; gap: 7px; }
.rank-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--field-bg);
  white-space: nowrap;
}
.rank-chip__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rank-chip__abbr { color: var(--text-muted); font-size: 0.72rem; font-weight: 700; }
.rank-chip__val { color: var(--text-strong); font-size: 0.82rem; font-weight: 800; }
.rank-chip__val i { color: var(--text-muted); font-size: 0.62rem; font-weight: 600; font-style: normal; }
.rank-chip.is-sent { border-color: var(--succ-chip-border); background: var(--succ-chip-bg); }
.rank-chip.is-sent .rank-chip__abbr { color: var(--succ-chip-text); }
.rank-chip.is-draft { border-color: var(--warn-chip-border); background: var(--warn-chip-bg); }
.rank-chip.is-empty { border-style: dashed; opacity: 0.72; }
.rank-chip.is-empty .rank-chip__val { color: var(--text-muted); }

.rank-progress { display: flex; align-items: center; gap: 10px; }
.rank-progress__track { flex: 1; max-width: 220px; height: 6px; border-radius: 999px; background: var(--track); overflow: hidden; }
.rank-progress__track i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--teal-dark), var(--teal-light)); transition: width 0.5s var(--ease-out); }
.rank-progress small { color: var(--text-muted); font-size: 0.72rem; font-weight: 600; }

.rank-row__score { display: grid; gap: 10px; justify-items: stretch; text-align: right; }
.rank-total { display: grid; gap: 1px; }
.rank-total span { color: var(--text-muted); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; }
.rank-total strong { color: var(--text-soft); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.rank-total.ready strong { color: var(--teal-text); }
.rank-total small { color: var(--text-muted); font-size: 0.66rem; font-weight: 600; }
.rank-actions { display: flex; justify-content: flex-end; gap: 7px; }
.rank-action {
  border: 1px solid var(--teal-chip-border);
  background: var(--teal-chip-bg);
  color: var(--teal-text);
  cursor: pointer;
  border-radius: 9px;
  padding: 7px 12px;
  font-family: inherit; font-weight: 750; font-size: 0.76rem;
  transition: background 0.15s var(--ease), border-color 0.15s var(--ease), transform 0.15s var(--ease);
}
.rank-action:hover { transform: translateY(-1px); background: color-mix(in srgb, var(--teal) 20%, transparent); }
.rank-action.is-ghost { background: transparent; border-color: var(--border); color: var(--text-muted); }
.rank-action.is-ghost:hover { border-color: var(--border-hover); color: var(--text); background: var(--surface-hover); }

/* — Desglose expandible — */
.rank-detail { border-top: 1px solid var(--border); }
.rank-detail .result-detail-shell { border: 0; border-radius: 0 0 var(--radius-lg) var(--radius-lg); background: var(--detail-section-bg); animation: panelEnter 0.3s var(--ease-out) both; }
.rank-detail .result-breakdown-copy p { font-size: 0.74rem; }
.rank-detail .result-breakdown-head strong { font-size: 0.82rem; }
.rank-detail .result-breakdown-head small { font-size: 0.72rem; }

@media (max-width: 980px) {
  .rank-podium { grid-template-columns: 1fr; }
  .rank-row__main { grid-template-columns: 40px minmax(0, 1fr); }
  .rank-row__score { grid-column: 2 / -1; justify-items: start; text-align: left; }
  .rank-actions { justify-content: flex-start; }
}
@media (max-width: 520px) {
  .rank-row__main { grid-template-columns: 1fr; }
  .rank-row__score { grid-column: 1 / -1; }
}

/* ── 14. Gestión de evaluadores · legibilidad ── */
.management-metrics span { font-size: 0.78rem !important; }
.management-card__head h4 { font-size: 1.02rem; }
.management-card__head p { font-size: 0.76rem !important; }
.management-card label > span { font-size: 0.74rem !important; }
.evaluator-roster-card { transition: border-color 0.15s var(--ease), box-shadow 0.15s var(--ease); }
.evaluator-roster-card:hover { border-color: var(--teal-chip-border); box-shadow: var(--shadow-sm); }
.evaluator-roster-main strong { font-size: 0.92rem !important; }
.evaluator-roster-main span { font-size: 0.76rem !important; }
.evaluator-roster-main small { font-size: 0.72rem !important; }
.credential-box code { font-size: 0.82rem !important; }
.assignment-table th { font-size: 0.7rem !important; }
.assignment-table td { font-size: 0.78rem !important; }
.assignment-table tbody tr { transition: background 0.15s var(--ease); }
.assignment-table tbody tr:hover td { background: var(--surface-hover); }
.compact-btn { font-size: 0.72rem !important; padding: 7px 11px !important; }
.text-btn { font-size: 0.74rem; }

/* ── 15. Cobertura por componente (llena el hueco bajo "Registrar evaluador") ── */
.management-col { display: grid; gap: 16px; align-content: start; }
.coverage-panorama {
  display: grid; gap: 14px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: linear-gradient(155deg, var(--detail-section-bg), var(--surface));
  box-shadow: var(--shadow-sm);
}
.coverage-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.coverage-head h4 { margin: 2px 0 0; color: var(--text-strong); font-size: 1rem; }
.coverage-overall { text-align: right; line-height: 1; }
.coverage-overall strong { display: block; color: var(--teal-text); font-size: 1.7rem; font-weight: 800; letter-spacing: -0.04em; }
.coverage-overall span { color: var(--text-muted); font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; }
.coverage-list { display: grid; gap: 11px; }
.coverage-row { display: grid; grid-template-columns: 9px minmax(0, 1fr); gap: 11px; align-items: center; }
.coverage-dot { width: 9px; height: 9px; border-radius: 50%; align-self: center; }
.coverage-row__body { min-width: 0; display: grid; gap: 5px; }
.coverage-row__top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.coverage-row__top strong { color: var(--text-strong); font-size: 0.82rem; font-weight: 700; }
.coverage-row__top span { color: var(--text-muted); font-size: 0.74rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.coverage-row.is-complete .coverage-row__top span { color: var(--succ-chip-text); }
.coverage-row.is-empty .coverage-row__top span { color: var(--warn-chip-text); }
.coverage-bar { position: relative; height: 7px; border-radius: 999px; background: var(--track); overflow: hidden; }
.coverage-bar i { position: absolute; inset: 0 auto 0 0; height: 100%; border-radius: 999px; transition: width 0.55s var(--ease-out); }
.coverage-bar__assigned { background: color-mix(in srgb, var(--teal) 38%, transparent); }
.coverage-bar__sent { background: linear-gradient(90deg, var(--teal-dark), var(--teal-light)); }
.coverage-foot { display: grid; gap: 9px; padding-top: 12px; border-top: 1px solid var(--border); }
.coverage-flag { display: inline-flex; align-items: center; gap: 7px; font-size: 0.74rem; font-weight: 650; }
.coverage-flag b { font-weight: 800; }
.coverage-flag::before { content: ""; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.coverage-flag.warn { color: var(--warn-chip-text); }
.coverage-flag.warn::before { background: var(--warn-chip-text); }
.coverage-flag.ok { color: var(--succ-chip-text); }
.coverage-flag.ok::before { background: var(--succ-chip-text); }
.coverage-legend { display: inline-flex; align-items: center; gap: 7px; color: var(--text-muted); font-size: 0.68rem; font-weight: 600; }
.coverage-legend i { display: inline-block; width: 16px; height: 6px; border-radius: 999px; }
.coverage-legend .lg-assigned { background: color-mix(in srgb, var(--teal) 38%, transparent); margin-left: 4px; }
.coverage-legend .lg-sent { background: linear-gradient(90deg, var(--teal-dark), var(--teal-light)); margin-left: 8px; }
@media (max-width: 1100px) {
  .management-col { gap: 16px; }
}


/* ═══════════════════════════════════════════════════════════════
   V10 · Vista del evaluador depurada según lineamientos de Erika
   ═══════════════════════════════════════════════════════════════ */
.evaluator-curated-section {
  position: relative;
  overflow: hidden;
}
.evaluator-curated-section::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, rgba(83,205,207,.95), rgba(83,205,207,.15));
}
.evaluator-section-intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 10px;
}
.evaluator-section-intro h4 {
  margin: 2px 0 0;
}
.curated-data-chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 6px 11px;
  border: 1px solid rgba(83,205,207,.28);
  border-radius: 999px;
  background: rgba(83,205,207,.09);
  color: var(--accent, #47c8cb);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .02em;
}
.curated-data-chip.is-technical { background: rgba(97,128,255,.09); border-color: rgba(97,128,255,.22); }
.curated-data-chip.is-market { background: rgba(212,168,83,.10); border-color: rgba(212,168,83,.25); color: #b88728; }
.curated-data-chip.is-team { background: rgba(148,108,220,.10); border-color: rgba(148,108,220,.25); color: #8d64d7; }
.curated-data-chip.is-impact { background: rgba(107,223,176,.10); border-color: rgba(107,223,176,.25); color: #2a9d72; }
.curated-data-chip.is-doc { background: rgba(104,148,190,.10); border-color: rgba(104,148,190,.25); color: #4c84b8; }
.section-guidance {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface-2, #f4f7f8) 88%, transparent);
  color: var(--muted, #77808c);
  font-size: .82rem;
  line-height: 1.55;
}
.institutional-concept-box {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 18px;
  padding: 15px;
  border: 1px solid rgba(83,205,207,.22);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(83,205,207,.09), rgba(83,205,207,.025));
}
.institutional-concept-box > div {
  padding: 11px 12px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--surface, #fff) 88%, transparent);
}
.institutional-concept-box span {
  display: block;
  margin-bottom: 5px;
  color: var(--muted, #7d8791);
  font-size: .7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
}
.institutional-concept-box strong {
  display: block;
  font-size: .92rem;
  line-height: 1.4;
}
.institutional-concept-box p {
  grid-column: 1 / -1;
  margin: 0;
  padding: 12px;
  border-top: 1px solid rgba(83,205,207,.16);
  color: var(--text, #182126);
  font-size: .84rem;
  line-height: 1.55;
}
.evaluator-team-list {
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  margin-bottom: 18px;
}
.evaluator-member-card {
  padding: 16px;
}
.member-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.member-card__head strong {
  display: block;
  line-height: 1.35;
}
.member-card__head > div > span {
  display: block;
  margin-top: 4px;
  color: var(--muted, #7c8790);
  font-size: .75rem;
}
.member-ean-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(83,205,207,.12);
  color: var(--accent, #42bfc2);
  font-size: .66rem;
  font-weight: 800;
}
.member-ean-chip.external {
  background: rgba(212,168,83,.12);
  color: #b88728;
}
.member-card__details {
  display: grid;
  gap: 10px;
  margin: 0;
}
.member-card__details div {
  display: grid;
  gap: 3px;
  padding-top: 9px;
  border-top: 1px solid color-mix(in srgb, var(--border, #dfe5e7) 70%, transparent);
}
.member-card__details dt {
  color: var(--muted, #77828b);
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.member-card__details dd {
  margin: 0;
  color: var(--text, #182126);
  font-size: .8rem;
  line-height: 1.45;
}
.team-rationale-grid {
  margin-top: 12px;
}
.evaluator-resource-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 4px 0 18px;
}
.evaluator-resource-grid .asset-button,
.evaluator-resource-grid button {
  min-width: 170px;
}
.resource-status-grid {
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--border, #dfe5e7) 70%, transparent);
}
.question-comment-wrap.mandatory-comment {
  display: block !important;
  margin-top: 12px;
}
.question-comment-label > span b,
.criterion-comments-grid label > span b {
  color: #e16e76;
}
.question-comment-label textarea {
  min-height: 88px;
}
.criterion-recommendation-label {
  grid-column: 1 / -1;
}
.criterion-recommendation-label select {
  width: 100%;
  min-height: 48px;
  margin-top: 8px;
  padding: 0 13px;
  border: 1px solid var(--border, #dfe5e7);
  border-radius: 13px;
  background: var(--surface, #fff);
  color: var(--text, #182126);
  font: inherit;
}
.criterion-recommendation-label select:focus {
  outline: none;
  border-color: var(--accent, #47c8cb);
  box-shadow: 0 0 0 3px rgba(71,200,203,.12);
}
[data-theme="dark"] .section-guidance,
[data-theme="dark"] .institutional-concept-box > div {
  background: rgba(255,255,255,.035);
}
[data-theme="dark"] .institutional-concept-box p,
[data-theme="dark"] .member-card__details dd {
  color: var(--text, #edf4f4);
}
@media (max-width: 760px) {
  .evaluator-section-intro {
    flex-direction: column;
  }
  .institutional-concept-box {
    grid-template-columns: 1fr;
  }
  .institutional-concept-box p {
    grid-column: 1;
  }
  .criterion-recommendation-label {
    grid-column: auto;
  }
}
