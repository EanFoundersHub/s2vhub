/* ── Mapa por componentes · Science2Venture DEMO ──
   Vista analítica detallada: despliega prácticamente todos los campos del
   formulario agrupados por bloque temático, cada categoría con conteo y
   porcentaje. Los campos de selección múltiple se cuentan opción por opción.
   Comparte el filtrado cruzado con la Radiografía (store S2V_Filter). */
window.S2V_Components = (function () {
  const S = window.S2V_Filter;
  let containerEl = null;
  let bound = false, subbed = false;
  const collapsed = new Set([2, 3, 4, 5, 6, 7, 8, 9]);

  function attr(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
  function shortODS(s) { const m = s.match(/ODS\s*(\d+)/); return m ? `ODS ${m[1]}` : s.slice(0, 18); }
  function shortSector(s) {
    if (s.length <= 30) return s;
    const map = { 'Inteligencia artificial': 'IA y computación', 'Tecnologías de la información': 'TIC', 'Economía digital': 'Economía digital', 'Economía verde': 'Economía verde / circular', 'Ciencias de la vida': 'Ciencias de la vida', 'Industria de alimentos': 'Alimentos y bebidas', 'Agroindustria': 'Agroindustria', 'Farmacéutico': 'Farma y biotech' };
    for (const [k, v] of Object.entries(map)) if (s.includes(k)) return v;
    return s.slice(0, 28) + '…';
  }

  const GROUPS = [
    { title: "Madurez · Readiness Levels", color: "#55c9cc", dims: ["RutaTRL", "TRLDeclarado", "CRLDeclarado", "BRLDeclarado"] },
    { title: "Tecnología", color: "#7be1e4", dims: ["Enfoque", "TipoTecnologia", "TecnologiaPropia", "Complejidad", "EntornoPrueba", "Brecha"] },
    { title: "Problema & Validación", color: "#6bdfb0", dims: ["IdentificacionProblema", "ValidacionProblema", "PersonasEntrevistadas", "EvidenciasTecnicas", "EvidenciasConcretas", "PropuestaValorEstructura"] },
    { title: "Mercado & Cliente", color: "#a78bfa", dims: ["ClienteTipo", "AlcanceGeografico", "TamanoMercado", "Competencia", "Diferenciacion", "Canales", "EvidenciaInteres", "AliadosEstrategicos"] },
    { title: "Negocio & Tracción", color: "#d4a853", dims: ["FuenteIngresos", "PrecioValidado", "NumerosNegocio", "HaFacturado", "PuntoEquilibrio", "RegistrosContables"] },
    { title: "Inversión & Finanzas", color: "#fb923c", dims: ["InversionAcumulada", "FuentesInversion", "Necesidad12m", "Recursos6m", "BuscaInversion"] },
    { title: "Propiedad Intelectual & Legal", color: "#f472b6", dims: ["EstadoPI", "TipoPI", "DuenoPI", "FreedomToOperate", "EstadoLegal", "PosturaEquityEan", "Regulatorio"] },
    { title: "Equipo", color: "#60a5fa", dims: ["RolesEquipo", "ExperienciaPrevia", "DedicacionEquipo", "DisposicionTC", "DisposicionPivotear", "MujeresRango"] },
    { title: "Impacto & Sostenibilidad", color: "#84cc16", dims: ["ODS", "Sectores", "Sostenibilidad", "MideImpacto"] },
    { title: "Perfil académico & Origen", color: "#c084fc", dims: ["Vinculacion", "NivelEducativo", "Modalidad", "AreaConocimiento", "Pregrado", "AnoInicio", "Semillero", "Ciudad"] }
  ];

  function labelFnFor(dim) {
    if (dim === "ODS") return shortODS;
    if (dim === "Sectores") return shortSector;
    if (dim === "Pregrado") return s => S.shorten(s.replace("Carrera de ", ""), 34);
    return s => S.shorten(s, 38);
  }

  function bars(dim, dist, color) {
    if (!dist.entries.length) return '<div class="ana-empty">Sin respuestas</div>';
    const top = Math.max(...dist.entries.map(e => e[1]));
    const base = dist.answered || 1;
    const f = S.filters;
    const dimActive = f[dim] != null;
    return dist.entries.map(([label, val]) => {
      const w = Math.max(3, (val / top) * 100);
      const p = S.pct(val, base);
      const active = f[dim] === label;
      const cls = ["ana-bar-row", "clickable", active ? "is-active" : "", (dimActive && !active) ? "is-dim" : ""].filter(Boolean).join(" ");
      return `<div class="${cls}" data-dim="${dim}" data-value="${attr(label)}">
        <span class="ana-bar-label" title="${attr(label)}">${S.label(dim, label)}</span>
        <div class="ana-bar-track"><div class="ana-bar-fill" style="width:${w}%;background:${color}"></div></div>
        <span class="ana-bar-val">${val}<span class="pctv">${p}%</span></span>
      </div>`;
    }).join('');
  }

  function miniCard(dim, color) {
    const d = S.DIMS[dim] || {};
    const dist = S.distribution(dim, S.filteredExcept(dim));
    const multiTag = dist.multi ? '<span class="cmp-multi">multi</span>' : '';
    const note = dist.answered < dist.total
      ? `Base ${dist.answered}/${dist.total}` + (dist.multi ? ' · % de quienes respondieron' : '')
      : (dist.multi ? '% sobre las iniciativas' : `${dist.entries.length} categorías`);
    return `<div class="cmp-chart">
      <div class="cmp-chart-head"><h5>${d.label || dim}</h5>${multiTag}</div>
      <div class="ana-bars">${bars(dim, dist, color)}</div>
      <div class="cmp-base">${note}</div>
    </div>`;
  }

  function build() {
    const allP = S.getData();
    const n = allP.length;
    const nf = S.getFiltered().length;

    let filterBar = "";
    if (S.hasFilters()) {
      const chips = Object.keys(S.filters).map(dim =>
        `<button class="ana-chip" data-remove-dim="${dim}" type="button">${(S.DIMS[dim] || {}).label || dim}: ${S.shorten(S.filters[dim], 32)}<span class="x">✕</span></button>`).join('');
      filterBar = `<div class="ana-filterbar"><span class="fb-label">Filtrando por</span>${chips}<button class="ana-clear-all" data-clear="1" type="button">Limpiar todo</button></div>`;
    }
    const subtitle = S.hasFilters()
      ? `Mostrando <strong>${nf}</strong> de ${n} iniciativas · variable fijada`
      : `Mapeo categoría por categoría de las ${n} iniciativas reales`;

    const groupsHtml = GROUPS.map((g, gi) => `
      <section class="cmp-group${collapsed.has(gi) ? ' collapsed' : ''}" data-group="${gi}" style="--cmp-accent:${g.color}">
        <button type="button" class="cmp-group-head" data-toggle-group="${gi}"><span class="cmp-dot"></span><h4>${g.title}</h4><span class="cmp-group-num">${g.dims.length} · ${String(gi + 1).padStart(2, '0')}</span><span class="cmp-chevron" aria-hidden="true">▾</span></button>
        <div class="cmp-grid">${g.dims.map(dim => miniCard(dim, g.color)).join('')}</div>
      </section>`).join('');

    containerEl.innerHTML = `
      <div class="ana-section-title">
        <h3>Mapa por componentes</h3>
        <p class="muted">${subtitle}</p>
        <p class="ana-hint">Desglose detallado de cada variable del formulario. Conteo y porcentaje por categoría; las preguntas de selección múltiple (marca <span class="cmp-multi">multi</span>) se cuentan opción por opción. Haz clic en cualquier barra para fijar esa variable en todo el tablero.</p>
      </div>
      <div class="ana-sticky-context" aria-label="Contexto de filtros e iniciativas seleccionadas">
        ${filterBar}
        ${S.rosterHtml()}
      </div>
      <div class="cmp-tools"><button type="button" class="cmp-tool" data-expand-all>Expandir todo</button><button type="button" class="cmp-tool" data-collapse-all>Colapsar todo</button></div>
      <div class="cmp-groups">${groupsHtml}</div>`;
  }

  function animateBars() {
    requestAnimationFrame(() => {
      containerEl.querySelectorAll('.ana-bar-fill').forEach((bar, i) => {
        const w = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => { bar.style.width = w; }, Math.min(i * 6, 400) + 30);
      });
    });
  }

  function bindOnce() {
    if (bound) return; bound = true;
    containerEl.addEventListener('click', e => {
      const tg = e.target.closest('[data-toggle-group]');
      if (tg) { const gi = +tg.dataset.toggleGroup; if (collapsed.has(gi)) collapsed.delete(gi); else collapsed.add(gi); const sec = tg.closest('.cmp-group'); if (sec) sec.classList.toggle('collapsed'); return; }
      const ea = e.target.closest('[data-expand-all]'); if (ea) { collapsed.clear(); containerEl.querySelectorAll('.cmp-group').forEach(s => s.classList.remove('collapsed')); return; }
      const ca = e.target.closest('[data-collapse-all]'); if (ca) { GROUPS.forEach((_, i) => collapsed.add(i)); containerEl.querySelectorAll('.cmp-group').forEach(s => s.classList.add('collapsed')); return; }
      const ini = e.target.closest('[data-initiative-id]'); if (ini) { if (window.S2V_Nav) window.S2V_Nav(ini.dataset.initiativeId); return; }
      const clear = e.target.closest('[data-clear]'); if (clear) { S.clear(); return; }
      const rm = e.target.closest('[data-remove-dim]'); if (rm) { S.remove(rm.dataset.removeDim); return; }
      const el = e.target.closest('[data-dim]'); if (!el) return;
      S.toggle(el.dataset.dim, el.dataset.value);
    });
  }

  function render(container) {
    containerEl = container;
    bindOnce();
    if (!subbed) {
      subbed = true;
      S.subscribe(() => { if (containerEl && !containerEl.classList.contains('hidden')) { build(); animateBars(); } });
    }
    build(); animateBars();
  }

  return { render };
})();
