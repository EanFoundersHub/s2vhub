/* ── Radiografía (overview) · Science2Venture DEMO ──
   Usa el store compartido S2V_Filter para el filtrado cruzado y muestra
   conteo + porcentaje en cada categoría. */
window.S2V_Analytics = (function () {
  const S = window.S2V_Filter;
  let containerEl = null;
  let bound = false, subbed = false;

  function attr(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

  const TEAL = '#55c9cc', GOLD = '#d4a853', CYAN = '#7be1e4', GREEN = '#6bdfb0',
        PURPLE = '#a78bfa', PINK = '#f472b6', ORANGE = '#fb923c', RED = '#ef6b6b',
        BLUE = '#60a5fa', LIME = '#84cc16';
  const PALETTE = [TEAL, GOLD, CYAN, GREEN, PURPLE, PINK, ORANGE, RED, BLUE, LIME,
    '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#e879f9', '#a3e635', '#fb7185'];

  function shortODS(s) { const m = s.match(/ODS\s*(\d+)/); return m ? `ODS ${m[1]}` : s.slice(0, 20); }
  function shortSector(s) {
    if (s.length <= 32) return s;
    const map = { 'Inteligencia artificial': 'IA y computación', 'Tecnologías de la información': 'TIC', 'Economía digital': 'Economía digital', 'Economía verde': 'Economía verde / circular', 'Ciencias de la vida': 'Ciencias de la vida', 'Industria de alimentos': 'Alimentos y bebidas', 'Agroindustria': 'Agroindustria', 'Farmacéutico': 'Farma y biotech' };
    for (const [k, v] of Object.entries(map)) if (s.includes(k)) return v;
    return s.slice(0, 30) + '…';
  }

  /* bar chart from a store distribution; base = answered (% of who answered) */
  function barChart(dist, color, dim) {
    if (!dist.entries.length) return '<div class="ana-empty">Sin datos</div>';
    const top = Math.max(...dist.entries.map(e => e[1]));
    const base = dist.answered || 1;
    const f = S.filters;
    const dimActive = dim && f[dim] != null;
    return dist.entries.map(([label, val]) => {
      const w = Math.max(2, (val / top) * 100);
      const p = S.pct(val, base);
      const disp = S.label(dim, label);
      const active = dim && f[dim] === label;
      const cls = ["ana-bar-row", dim ? "clickable" : "", active ? "is-active" : "", (dimActive && !active) ? "is-dim" : ""].filter(Boolean).join(" ");
      const da = dim ? `data-dim="${dim}" data-value="${attr(label)}"` : "";
      return `<div class="${cls}" ${da}>
        <span class="ana-bar-label" title="${attr(label)}">${disp}</span>
        <div class="ana-bar-track"><div class="ana-bar-fill" style="width:${w}%;background:${color}"></div></div>
        <span class="ana-bar-val">${val}<span class="pctv">${p}%</span></span>
      </div>`;
    }).join('');
  }

  function donutSVG(segments, size, dim) {
    size = size || 130;
    const r = 44, cx = 60, cy = 60, circ = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let offset = 0;
    const f = S.filters;
    const paths = segments.map(seg => {
      const dash = (seg.value / total) * circ, gap = circ - dash;
      const fval = seg.fval != null ? seg.fval : seg.label;
      const clickable = dim && !seg.noFilter && seg.value > 0;
      const active = clickable && f[dim] === fval;
      const cls = ["ana-arc", clickable ? "clickable" : "", active ? "is-active" : ""].filter(Boolean).join(" ");
      const da = clickable ? `data-dim="${dim}" data-value="${attr(fval)}"` : "";
      const op = (dim && f[dim] != null && !active && clickable) ? 0.32 : 0.9;
      const html = `<circle class="${cls}" ${da} cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="12" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${-offset}" stroke-linecap="round" opacity="${op}"/>`;
      offset += dash;
      return html;
    });
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="ana-donut">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
      ${paths.join('')}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="white" font-size="22" font-weight="800">${segments.reduce((s, x) => s + x.value, 0)}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="9" font-weight="500">TOTAL</text>
    </svg>`;
  }

  function legend(segments, dim) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const f = S.filters;
    const dimActive = dim && f[dim] != null;
    return segments.map(s => {
      const fval = s.fval != null ? s.fval : s.label;
      const clickable = dim && !s.noFilter;
      const active = clickable && f[dim] === fval;
      const cls = ["ana-legend-item", clickable ? "clickable" : "", active ? "is-active" : "", (clickable && dimActive && !active) ? "is-dim" : ""].filter(Boolean).join(" ");
      const da = clickable ? `data-dim="${dim}" data-value="${attr(fval)}"` : "";
      return `<div class="${cls}" ${da}><span class="ana-legend-dot" style="background:${s.color}"></span>${s.label} <strong>${s.value} · ${S.pct(s.value, total)}%</strong></div>`;
    }).join('');
  }

  function segsFromDist(dist, palette) {
    return dist.entries.map(([label, val], i) => ({ label, value: val, color: (palette || PALETTE)[i % (palette || PALETTE).length] }));
  }

  function build() {
    const allP = S.getData();
    const n = allP.length;
    const fAll = S.getFiltered();
    const nf = fAll.length;

    const rutaSegs = segsFromDist(S.distribution('RutaTRL', S.filteredExcept('RutaTRL')), [TEAL, GOLD, GREEN, PURPLE]);
    const enfSegs  = segsFromDist(S.distribution('Enfoque', S.filteredExcept('Enfoque')));
    const vincSegs = segsFromDist(S.distribution('Vinculacion', S.filteredExcept('Vinculacion')));

    const trlDist = S.distribution('TRLDeclarado', S.filteredExcept('TRLDeclarado'));
    const crlDist = S.distribution('CRLDeclarado', S.filteredExcept('CRLDeclarado'));
    const brlDist = S.distribution('BRLDeclarado', S.filteredExcept('BRLDeclarado'));
    const odsDist = S.distribution('ODS', S.filteredExcept('ODS'));
    const sectDist = S.distribution('Sectores', S.filteredExcept('Sectores'));
    const preDist = S.distribution('Pregrado', S.filteredExcept('Pregrado'));
    const anoDist = (() => { const d = S.distribution('AnoInicio', S.filteredExcept('AnoInicio')); d.entries.sort((a, b) => a[0].localeCompare(b[0])); return d; })();
    const legalDist = S.distribution('EstadoLegal', S.filteredExcept('EstadoLegal'));

    // semillero / facturación (2-segment donuts)
    const sSem = S.filteredExcept('Semillero');
    const semSi = sSem.filter(i => (i.SurgeGrupoSemillero || '').startsWith('Sí')).length;
    const sFact = S.filteredExcept('HaFacturado');
    const factSi = sFact.filter(i => i.HaFacturado === 'Sí').length;

    // KPIs over the full cross-filtered subset
    const kSem = fAll.filter(i => (i.SurgeGrupoSemillero || '').startsWith('Sí')).length;
    const kFact = fAll.filter(i => i.HaFacturado === 'Sí').length;
    const kMuj = fAll.reduce((s, i) => s + (parseInt(i.MujeresEquipo) || 0), 0);
    const kConM = fAll.filter(i => parseInt(i.MujeresEquipo) > 0).length;
    const kTRL7 = fAll.filter(i => (i.TRLNumero || 0) >= 7).length;
    const share = v => { const p = S.pct(v, nf); return `<div class="kpi-share"><span class="kpi-bar"><i style="width:${p}%"></i></span><em>${p}%</em></div>`; };

    const kpiCls = (dim, val) => "ana-kpi clickable" + (S.filters[dim] === val ? " is-active" : "");

    let filterBar = "";
    if (S.hasFilters()) {
      const chips = Object.keys(S.filters).map(dim =>
        `<button class="ana-chip" data-remove-dim="${dim}" type="button">${(S.DIMS[dim] || {}).label || dim}: ${S.shorten(S.filters[dim], 32)}<span class="x">✕</span></button>`).join('');
      filterBar = `<div class="ana-filterbar"><span class="fb-label">Filtrando por</span>${chips}<button class="ana-clear-all" data-clear="1" type="button">Limpiar todo</button></div>`;
    }
    const subtitle = S.hasFilters()
      ? `Mostrando <strong>${nf}</strong> de ${n} iniciativas · variable fijada`
      : `Resumen ejecutivo · ${n} iniciativas reales postuladas`;

    containerEl.innerHTML = `
      <div class="ana-section-title">
        <h3>Radiografía de la convocatoria</h3>
        <p class="muted">${subtitle}</p>
        <p class="ana-hint">Haz clic en cualquier segmento (dona, barra o indicador) para fijar esa variable y filtrar todo el tablero. Cada categoría muestra conteo y porcentaje.</p>
      </div>
      ${filterBar}
      ${S.rosterHtml()}
      <div class="ana-kpi-row">
        <div class="ana-kpi base clickable${S.hasFilters() ? '' : ' is-active'}" data-clear="1"><strong>${nf}</strong><span>Iniciativas</span></div>
        <div class="${kpiCls('Semillero', 'Sí')}" data-dim="Semillero" data-value="Sí"><strong>${kSem}</strong>${share(kSem)}<span>De semillero</span></div>
        <div class="${kpiCls('HaFacturado', 'Sí')}" data-dim="HaFacturado" data-value="Sí"><strong>${kFact}</strong>${share(kFact)}<span>Con facturación</span></div>
        <div class="ana-kpi"><strong>${kMuj}</strong><span>Mujeres en equipos</span></div>
        <div class="${kpiCls('ConMujeres', 'Sí')}" data-dim="ConMujeres" data-value="Sí"><strong>${kConM}</strong>${share(kConM)}<span>Equipos con mujeres</span></div>
        <div class="${kpiCls('TRL7plus', 'Sí')}" data-dim="TRL7plus" data-value="Sí"><strong>${kTRL7}</strong>${share(kTRL7)}<span>TRL 7+</span></div>
      </div>
      <div class="ana-grid">
        <div class="ana-card"><h4>Distribución por ruta TRL</h4><div class="ana-donut-wrap">${donutSVG(rutaSegs, 140, 'RutaTRL')}<div class="ana-legend">${legend(rutaSegs, 'RutaTRL')}</div></div></div>
        <div class="ana-card"><h4>Base de la solución</h4><div class="ana-donut-wrap">${donutSVG(enfSegs, 140, 'Enfoque')}<div class="ana-legend">${legend(enfSegs, 'Enfoque')}</div></div></div>
        <div class="ana-card"><h4>Vinculación EAN</h4><div class="ana-donut-wrap">${donutSVG(vincSegs, 140, 'Vinculacion')}<div class="ana-legend">${legend(vincSegs, 'Vinculacion')}</div></div></div>
        <div class="ana-card ana-card-wide"><h4>Nivel de madurez tecnológica (TRL)</h4><div class="ana-bars">${barChart(trlDist, TEAL, 'TRLDeclarado')}</div></div>
        <div class="ana-card ana-card-wide"><h4>Nivel de madurez comercial (CRL)</h4><div class="ana-bars">${barChart(crlDist, GOLD, 'CRLDeclarado')}</div></div>
        <div class="ana-card ana-card-wide"><h4>Nivel de madurez de negocio (BRL)</h4><div class="ana-bars">${barChart(brlDist, GREEN, 'BRLDeclarado')}</div></div>
        <div class="ana-card ana-card-wide"><h4>Objetivos de Desarrollo Sostenible (ODS)</h4><div class="ana-bars">${barChart(odsDist, CYAN, 'ODS')}</div></div>
        <div class="ana-card ana-card-wide"><h4>Sectores productivos</h4><div class="ana-bars">${barChart(sectDist, PURPLE, 'Sectores')}</div></div>
        <div class="ana-card"><h4>Programas académicos</h4><div class="ana-bars">${preDist.entries.length ? barChart(preDist, PINK, 'Pregrado') : '<div class="ana-empty">Datos parciales</div>'}</div></div>
        <div class="ana-card"><h4>Origen: Semillero / Grupo</h4><div class="ana-donut-wrap">${donutSVG([{ label: 'Semillero / Grupo', value: semSi, color: TEAL, fval: 'Sí' }, { label: 'Independiente', value: sSem.length - semSi, color: 'rgba(255,255,255,0.12)', fval: 'No' }], 130, 'Semillero')}<div class="ana-legend">${legend([{ label: 'Semillero / Grupo', value: semSi, color: TEAL, fval: 'Sí' }, { label: 'Independiente', value: sSem.length - semSi, color: 'rgba(255,255,255,0.25)', fval: 'No' }], 'Semillero')}<div class="ana-semilleros-list">${sSem.filter(i => i.GrupoSemillero).map(i => `<span class="ana-tag">${i.GrupoSemillero}</span>`).join('')}</div></div></div></div>
        <div class="ana-card"><h4>¿Han generado ingresos?</h4><div class="ana-donut-wrap">${donutSVG([{ label: 'Sí facturan', value: factSi, color: GOLD, fval: 'Sí' }, { label: 'Aún no', value: sFact.length - factSi, color: 'rgba(255,255,255,0.12)', fval: 'No' }], 130, 'HaFacturado')}<div class="ana-legend">${legend([{ label: 'Sí facturan', value: factSi, color: GOLD, fval: 'Sí' }, { label: 'Aún no', value: sFact.length - factSi, color: 'rgba(255,255,255,0.25)', fval: 'No' }], 'HaFacturado')}</div></div></div>
        <div class="ana-card"><h4>Año de inicio</h4><div class="ana-bars">${barChart(anoDist, BLUE, 'AnoInicio')}</div></div>
        <div class="ana-card"><h4>Estado legal</h4><div class="ana-bars">${legalDist.entries.length ? barChart(legalDist, ORANGE, 'EstadoLegal') : '<div class="ana-empty">Datos parciales</div>'}</div></div>
      </div>`;
  }

  function animateBars() {
    requestAnimationFrame(() => {
      containerEl.querySelectorAll('.ana-bar-fill').forEach((bar, i) => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, i * 16 + 50);
      });
    });
  }

  function bindOnce() {
    if (bound) return; bound = true;
    containerEl.addEventListener('click', e => {
      const ini = e.target.closest('[data-initiative-id]'); if (ini) { if (window.S2V_Nav) window.S2V_Nav(ini.dataset.initiativeId); return; }
      const clear = e.target.closest('[data-clear]'); if (clear) { S.clear(); return; }
      const rm = e.target.closest('[data-remove-dim]'); if (rm) { S.remove(rm.dataset.removeDim); return; }
      const el = e.target.closest('[data-dim]'); if (!el) return;
      S.toggle(el.dataset.dim, el.dataset.value);
    });
  }

  function render(container, postulaciones) {
    containerEl = container;
    if (postulaciones) S.init(postulaciones);
    bindOnce();
    if (!subbed) { subbed = true; S.subscribe(() => { if (containerEl) { build(); animateBars(); } }); }
    build(); animateBars();
  }

  return { render };
})();
