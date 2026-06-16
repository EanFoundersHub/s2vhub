(() => {
  "use strict";

  const DEMO_DATA = window.S2V_DEMO_DATA;
  const STORAGE_KEYS = { session: "s2v_demo_session" };

  const EVAL_CRITERIA = [
    { key: "calidadCientifica", label: "Calidad científica", max: 300, color: "#55c9cc" },
    { key: "mercado", label: "Potencial de mercado", max: 300, color: "#7be1e4" },
    { key: "innovacionPI", label: "Innovación / PI", max: 200, color: "#2ea8ab" },
    { key: "equipo", label: "Equipo", max: 150, color: "#d4a853" },
    { key: "impacto", label: "Impacto sostenible", max: 50, color: "#6bdfb0" }
  ];
  const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

  const state = {
    raw: null, postulaciones: [], controlDocumental: [], miembrosEquipo: [],
    filtered: [], selectedId: null, session: null, activeTab: "analytics",
    crossIds: null
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const els = {
    loginView: $("#loginView"), dashboardView: $("#dashboardView"),
    loginForm: $("#loginForm"), correoEvaluador: $("#correoEvaluador"),
    codigoAcceso: $("#codigoAcceso"), loginMessage: $("#loginMessage"),
    userEmailLabel: $("#userEmailLabel"), logoutBtn: $("#logoutBtn"),
    metricPostulaciones: $("#metricPostulaciones"), metricControl: $("#metricControl"),
    metricMiembros: $("#metricMiembros"), metricEquidad: $("#metricEquidad"),
    searchInput: $("#searchInput"), routeFilter: $("#routeFilter"),
    statusFilter: $("#statusFilter"), reloadBtn: $("#reloadBtn"),
    initiativeList: $("#initiativeList"), visibleCount: $("#visibleCount"),
    detailPanel: $("#detailPanel"), cardTemplate: $("#initiativeCardTemplate"),
    tabNav: $("#tabNav"), analyticsPanel: $("#analyticsPanel"),
    componentsPanel: $("#componentsPanel"),
    listSection: $("#listSection")
  };

  /* ── Utilities ── */
  function choice(value, fallback = "Pendiente") {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") {
      if ("Value" in value) return clean(value.Value) || fallback;
      if ("value" in value) return clean(value.value) || fallback;
    }
    return clean(String(value)) || fallback;
  }
  function clean(v) { if (v == null) return ""; return String(v).replace(/\s+/g, " ").replace(/\s+\./g, ".").trim(); }
  function shortText(v, max = 110) { const t = clean(v); if (!t) return "Sin información."; return t.length > max ? t.slice(0, max).trim() + "…" : t; }
  function boolText(v) { if (v === true) return "Sí"; if (v === false) return "No"; return choice(v, "Pendiente"); }
  function routeOf(item) { return choice(item.RutaTRL, "Pendiente"); }
  function trlOf(item) { return choice(item.TRLDeclarado, "Pendiente"); }
  function statusOf(item) { return choice(item.EstadoPostulacion, "Pendiente"); }
  function initiativeIdOf(item) { return clean(item.IDIniciativa || "Sin ID"); }
  function initiativeNameOf(item) { return clean(item.NombreIniciativa || "Iniciativa sin nombre"); }
  function esc(v) { return clean(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

  function normalizeData(data) {
    return {
      postulaciones: Array.isArray(data?.postulaciones) ? data.postulaciones : [],
      controlDocumental: Array.isArray(data?.controlDocumental) ? data.controlDocumental : [],
      miembrosEquipo: Array.isArray(data?.miembrosEquipo) ? data.miembrosEquipo : []
    };
  }

  function setMessage(text, type = "") {
    els.loginMessage.textContent = text || "";
    els.loginMessage.className = `message ${type}`.trim();
  }

  /* ── Auth (Demo: any credentials work) ── */
  async function login(e) {
    e.preventDefault();
    const correo = clean(els.correoEvaluador.value);
    const codigo = clean(els.codigoAcceso.value);
    const btn = els.loginForm.querySelector("button[type='submit']");
    if (!correo || !codigo) { setMessage("Completa correo y código.", "error"); return; }
    btn.disabled = true;
    btn.classList.add("loading");
    setMessage("Cargando datos de la convocatoria…", "");

    // Simulate loading
    await new Promise(r => setTimeout(r, 800));

    const session = { correoEvaluador: correo, codigoAcceso: codigo };
    state.session = session;
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ correoEvaluador: correo }));
    loadData(DEMO_DATA);
    showDashboard();
    setMessage("", "");
    btn.disabled = false;
    btn.classList.remove("loading");
  }

  function showDashboard() {
    els.userEmailLabel.textContent = state.session?.correoEvaluador || "Evaluador";
    els.loginView.classList.add("leaving");
    setTimeout(() => {
      els.loginView.classList.add("hidden");
      els.loginView.classList.remove("leaving");
      els.dashboardView.classList.remove("hidden");
      staggerIn(".metric-card", 70);
      // Render analytics + wire cross-filter (shared store)
      if (window.S2V_Filter && !state._crossWired) {
        state._crossWired = true;
        window.S2V_Filter.subscribe(handleCrossFilter);
      }
      if (window.S2V_Analytics) {
        window.S2V_Analytics.render(els.analyticsPanel, state.postulaciones);
      }
      switchTab("analytics");
    }, 420);
  }

  function showLogin() {
    state.session = null;
    localStorage.removeItem(STORAGE_KEYS.session);
    els.dashboardView.classList.add("hidden");
    els.loginView.classList.remove("hidden");
    resetDetail();
  }

  function resetDetail() {
    els.detailPanel.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="11" cy="11" r="4.5" fill="currentColor" opacity=".7"/><circle cx="25" cy="11" r="4.5" fill="currentColor" opacity=".7"/><circle cx="18" cy="25" r="4.5" fill="currentColor"/><path d="M14 14l4 9m4-9l-4 9" stroke="currentColor" stroke-width="2" opacity=".5"/></svg></div>
        <h3>Selecciona una iniciativa</h3>
        <p>Ficha completa, documentos, equipo y evaluación.</p>
      </div>`;
  }

  /* ── Tabs ── */
  function switchTab(tab) {
    state.activeTab = tab;
    $$(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    els.analyticsPanel.classList.toggle("hidden", tab !== "analytics");
    els.componentsPanel.classList.toggle("hidden", tab !== "componentes");
    els.listSection.classList.toggle("hidden", tab !== "iniciativas");
    if (tab === "componentes" && window.S2V_Components) {
      window.S2V_Components.render(els.componentsPanel);
    }
  }

  /* ── Data ── */
  function loadData(data) {
    const n = normalizeData(data);
    state.raw = data;
    state.postulaciones = n.postulaciones;
    state.controlDocumental = n.controlDocumental;
    state.miembrosEquipo = n.miembrosEquipo;
    applyFilters();
    renderMetrics();
  }

  function renderMetrics() {
    animateNumber(els.metricPostulaciones, state.postulaciones.length);
    animateNumber(els.metricControl, state.controlDocumental.length);
    animateNumber(els.metricMiembros, state.miembrosEquipo.length);
    const equity = state.postulaciones.filter(i => parseInt(i.MujeresEquipo) >= 2).length;
    animateNumber(els.metricEquidad, equity);
  }

  function animateNumber(el, target) {
    const start = parseInt(el.textContent, 10) || 0;
    if (start === target) { el.textContent = target; return; }
    const duration = 600;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Filters ── */
  function applyFilters() {
    const q = clean(els.searchInput.value).toLowerCase();
    const route = els.routeFilter.value;
    const status = els.statusFilter.value;
    const cross = state.crossIds;
    state.filtered = state.postulaciones.filter(item => {
      if (cross && !cross.has(initiativeIdOf(item))) return false;
      const h = [initiativeIdOf(item), initiativeNameOf(item), item.NombreLider, item.CorreoLider, item.Ciudad, trlOf(item), routeOf(item), statusOf(item), item.Enfoque, item.SectoresTexto, item.ODSTexto].join(" ").toLowerCase();
      return (!q || h.includes(q)) && (!route || routeOf(item).includes(route)) && (!status || statusOf(item).includes(status));
    });
    renderInitiativeList();
  }

  /* ── Cross-filter: the analytics dashboard fixes a variable and the
     whole board (metrics + list) follows that segment. ── */
  function handleCrossFilter(filtered, filters) {
    const active = filters && Object.keys(filters).length > 0;
    state.crossIds = active ? new Set(filtered.map(i => initiativeIdOf(i))) : null;
    const subset = active ? filtered : state.postulaciones;
    renderCrossMetrics(subset);
    applyFilters();
    if (state.selectedId && state.crossIds && !state.crossIds.has(state.selectedId)) {
      state.selectedId = null;
      resetDetail();
    }
  }

  function renderCrossMetrics(subset) {
    const ids = new Set(subset.map(i => initiativeIdOf(i)));
    animateNumber(els.metricPostulaciones, subset.length);
    animateNumber(els.metricControl, state.controlDocumental.filter(c => ids.has(clean(c.IDIniciativa))).length);
    animateNumber(els.metricMiembros, state.miembrosEquipo.filter(m => ids.has(clean(m.IDIniciativa))).length);
    animateNumber(els.metricEquidad, subset.filter(i => parseInt(i.MujeresEquipo) >= 2).length);
  }

  function renderInitiativeList() {
    els.initiativeList.innerHTML = "";
    els.visibleCount.textContent = `${state.filtered.length}`;
    if (!state.filtered.length) {
      els.initiativeList.innerHTML = '<div class="alert-box">No hay iniciativas que coincidan con los filtros.</div>';
      return;
    }
    for (const item of state.filtered) {
      const id = initiativeIdOf(item);
      const node = els.cardTemplate.content.cloneNode(true);
      const card = node.querySelector(".initiative-card");
      const button = node.querySelector(".card-button");
      if (state.selectedId === id) card.classList.add("active");
      node.querySelector(".id-label").textContent = id;
      node.querySelector("h4").textContent = initiativeNameOf(item);
      node.querySelector("p").textContent = shortText(item.DescripcionCorta || item.PropuestaValor || item.NombreLider);
      node.querySelector(".badge-row").innerHTML = [
        badge(routeOf(item), "cyan"), badge(trlOf(item)),
        badge(item.Enfoque || "Sin enfoque"),
        badge(statusOf(item))
      ].join("");
      button.addEventListener("click", () => { selectInitiative(id); switchTab("iniciativas"); });
      els.initiativeList.appendChild(node);
    }
  }

  function badge(text, variant = "") { return `<span class="badge ${variant}">${esc(text)}</span>`; }

  function selectInitiative(id) {
    state.selectedId = id;
    renderInitiativeList();
    renderDetail(id);
  }

  function findControl(id) { return state.controlDocumental.find(i => clean(i.IDIniciativa) === id) || null; }
  function findMembers(id) { return state.miembrosEquipo.filter(i => clean(i.IDIniciativa) === id); }

  function field(label, value, long = false) {
    const v = clean(value);
    if (!v || v === "Pendiente" || v === "undefined") return "";
    return `<div class="field ${long ? "long-field" : ""}"><span class="label">${esc(label)}</span><span class="value">${esc(v)}</span></div>`;
  }

  function memberCard(m) {
    const name = clean(m.NombreMiembro || "Integrante");
    const parts = [m.RolIniciativa, m.EsLider === "Sí" ? "Líder" : "Integrante", m.EsEanista === "Sí" ? "Eanista" : ""].filter(Boolean);
    return `<article class="member-card"><strong>${esc(name)}</strong><p>${esc(parts.join(" · "))}</p>${m.CorreoMiembro ? `<p>${esc(m.CorreoMiembro)}</p>` : ""}</article>`;
  }

  function extractUrls(raw) {
    if (!raw) return [];
    const matches = String(raw).match(/https?:\/\/[^\s)]+/gi) || [];
    const seen = new Set();
    return matches.map(u => u.replace(/[.,;]+$/g, "").trim()).filter(u => {
      if (!/^https?:\/\//i.test(u) || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }

  function resourceButton(label, rawUrl) {
    const urls = extractUrls(rawUrl);
    if (!urls.length) return "";
    const json = esc(JSON.stringify(urls));
    const suffix = urls.length > 1 ? ` <small>${urls.length}</small>` : "";
    return `<button class="detail-link resource-open" type="button" data-resource-title="${esc(label)}" data-resource-urls="${json}">${esc(label)}${suffix}</button>`;
  }

  function getYoutubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || "";
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex(p => ["shorts", "embed", "live"].includes(p));
      return idx >= 0 ? parts[idx + 1] || "" : "";
    } catch { return ""; }
  }

  function previewUrl(rawUrl) {
    const url = clean(rawUrl);
    if (!/^https?:\/\//i.test(url)) return "";
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      const yt = getYoutubeId(url);
      if (yt) return `https://www.youtube.com/embed/${encodeURIComponent(yt)}`;
      const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
      if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
      const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
      if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
      const driveFolder = url.match(/drive\.google\.com\/(?:drive\/u\/\d+\/)?folders\/([^/?#]+)/i);
      if (driveFolder) return `https://drive.google.com/embeddedfolderview?id=${driveFolder[1]}#list`;
      const googleDoc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/]+)/i);
      if (googleDoc) return `https://docs.google.com/${googleDoc[1]}/d/${googleDoc[2]}/preview`;
      return url;
    } catch {
      return url;
    }
  }

  function ensureResourceModal() {
    let modal = document.getElementById("resourceModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "resourceModal";
    modal.className = "resource-modal hidden";
    modal.innerHTML = `
      <div class="resource-backdrop" data-close-resource="1"></div>
      <section class="resource-dialog" role="dialog" aria-modal="true" aria-labelledby="resourceModalTitle">
        <header class="resource-header">
          <div>
            <p class="eyebrow">Vista previa integrada</p>
            <h3 id="resourceModalTitle">Recurso</h3>
          </div>
          <button class="resource-close" type="button" data-close-resource="1" aria-label="Cerrar">×</button>
        </header>
        <div id="resourceTabs" class="resource-tabs"></div>
        <div class="resource-frame-wrap">
          <iframe id="resourceFrame" title="Vista previa del recurso" loading="lazy" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
          <div class="resource-fallback">
            <strong>Si el recurso no carga</strong>
            <span>Algunos Drive, OneDrive o SharePoint bloquean la vista embebida por permisos. El enlace sigue disponible abajo, porque hasta los iframes tienen burocracia.</span>
            <a id="resourceOriginalLink" href="#">Abrir enlace original</a>
          </div>
        </div>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => {
      if (e.target.closest("[data-close-resource]")) closeResourceModal();
      const tab = e.target.closest("[data-resource-tab]");
      if (tab) setResourceFrame(tab.dataset.resourceUrl, tab.textContent.trim());
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeResourceModal(); });
    return modal;
  }

  function setResourceFrame(url, label) {
    const frame = document.getElementById("resourceFrame");
    const original = document.getElementById("resourceOriginalLink");
    if (!frame || !original) return;
    frame.src = previewUrl(url);
    original.href = url;
    original.removeAttribute("target");
    original.textContent = label ? `Abrir enlace original · ${label}` : "Abrir enlace original";
    $$("#resourceTabs [data-resource-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.resourceUrl === url));
  }

  function openResourceModal(title, urls) {
    if (!urls || !urls.length) return;
    const modal = ensureResourceModal();
    const titleEl = document.getElementById("resourceModalTitle");
    const tabs = document.getElementById("resourceTabs");
    if (titleEl) titleEl.textContent = title || "Recurso";
    if (tabs) {
      tabs.innerHTML = urls.length > 1 ? urls.map((url, idx) => `<button type="button" data-resource-tab="1" data-resource-url="${esc(url)}">Recurso ${idx + 1}</button>`).join("") : "";
    }
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    setResourceFrame(urls[0], urls.length > 1 ? "Recurso 1" : title);
  }

  function closeResourceModal() {
    const modal = document.getElementById("resourceModal");
    const frame = document.getElementById("resourceFrame");
    if (frame) frame.src = "about:blank";
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  /* ── Detail Rendering (enriched) ── */
  function renderDetail(id) {
    const item = state.postulaciones.find(r => initiativeIdOf(r) === id);
    if (!item) return;
    const control = findControl(id);
    const members = findMembers(id);

    els.detailPanel.innerHTML = `
      <div class="detail-header">
        <div>
          <p class="eyebrow">${esc(id)}</p>
          <h3>${esc(initiativeNameOf(item))}</h3>
          <div class="badge-row">
            ${badge(routeOf(item), "cyan")} ${badge(trlOf(item))} ${badge(item.CRLDeclarado || "CRL ?")} ${badge(item.BRLDeclarado || "BRL ?")}
            ${badge(item.Enfoque || "Sin enfoque")} ${badge(statusOf(item))}
          </div>
        </div>
        <div class="detail-actions">
          ${resourceButton("Video pitch", item.VideoPitchURL)}
          ${resourceButton("Evidencias", item.EvidenciasURL)}
          ${resourceButton("Anexo 1", item.Anexo1URL)}
        </div>
      </div>

      <section class="detail-section" style="animation-delay:0.05s">
        <h4>Información general</h4>
        <div class="field-grid">
          ${field("Líder", item.NombreLider)}
          ${field("Correo líder", item.CorreoLider)}
          ${field("Ciudad", item.Ciudad)}
          ${field("Vinculación EAN", item.Vinculacion)}
          ${field("Pregrado", item.Pregrado)}
          ${field("Posgrado", item.Posgrado)}
          ${field("Nivel educativo", item.NivelEducativo)}
          ${field("Modalidad", item.Modalidad)}
          ${field("Rol en la iniciativa", item.RolLider)}
          ${field("Año de inicio", item.AnoInicio)}
          ${field("Área de conocimiento", item.AreaConocimiento)}
          ${field("Descripción", item.DescripcionCorta, true)}
          ${field("Propuesta de valor", item.PropuestaValor, true)}
          ${field("Estructura propuesta de valor", item.PropuestaValorEstructura, true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.1s">
        <h4>Madurez tecnológica · TRL / CRL / BRL</h4>
        <div class="field-grid">
          ${field("TRL declarado", item.TRLDeclarado)}
          ${field("Ruta TRL", routeOf(item))}
          ${field("CRL (comercial)", item.CRLDeclarado)}
          ${field("BRL (negocio)", item.BRLDeclarado)}
          ${field("Detalle TRL", item.TRLDetalle, true)}
          ${field("Detalle CRL", item.CRLDetalle, true)}
          ${field("Detalle BRL", item.BRLDetalle, true)}
          ${field("Enfoque", item.EnfoqueDetalle, true)}
          ${field("Tipo tecnología", item.TipoTecnologia, true)}
          ${field("Tecnología propia", item.TecnologiaPropia, true)}
          ${field("Complejidad técnica", item.Complejidad, true)}
          ${field("Entorno de prueba", item.EntornoPrueba, true)}
          ${field("Brecha técnica principal", item.Brecha, true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.15s">
        <h4>Mercado y modelo de negocio</h4>
        <div class="field-grid">
          ${field("Tipo de cliente", item.ClienteTipo, true)}
          ${field("Evidencia de interés", item.EvidenciaInteres, true)}
          ${field("Fuente de ingresos", item.FuenteIngresos, true)}
          ${field("Precio validado", item.PrecioValidado, true)}
          ${field("Números del negocio", item.NumerosNegocio, true)}
          ${field("Canales", item.Canales, true)}
          ${field("Aliados estratégicos", item.AliadosEstrategicos, true)}
          ${field("Competencia", item.Competencia, true)}
          ${field("Diferenciación", item.Diferenciacion, true)}
          ${field("Tamaño mercado", item.TamanoMercado, true)}
          ${field("Identificación del problema", item.IdentificacionProblema, true)}
          ${field("Descripción del problema", item.ProblemaDescripcion, true)}
          ${field("Alcance geográfico", item.AlcanceGeografico)}
          ${field("Ha facturado", item.HaFacturado)}
          ${field("Facturación total", item.FacturacionTotal)}
          ${field("Ventas mensuales (3m)", item.VentasMensuales)}
          ${field("Punto de equilibrio", item.PuntoEquilibrio)}
          ${field("Registros contables", item.RegistrosContables)}
          ${field("Validación del problema", item.ValidacionProblema, true)}
          ${field("Personas entrevistadas", item.PersonasEntrevistadas)}
          ${field("Evidencias técnicas", item.EvidenciasTecnicas, true)}
          ${field("Evidencias concretas", item.EvidenciasConcretas, true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.18s">
        <h4>Sectores, ODS y sostenibilidad</h4>
        <div class="field-grid">
          ${field("Sectores productivos", item.SectoresTexto, true)}
          ${field("ODS", item.ODSTexto, true)}
          ${field("Vertical de sostenibilidad", item.Sostenibilidad, true)}
          ${field("Mide impacto", item.MideImpacto)}
          ${field("Regulatorio", item.Regulatorio, true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.2s">
        <h4>Origen y propiedad intelectual</h4>
        <div class="field-grid">
          ${field("Surge de semillero/grupo", item.SurgeGrupoSemillero)}
          ${field("Grupo o semillero", item.GrupoSemillero)}
          ${field("Estado PI", item.EstadoPI, true)}
          ${field("Tipo protección PI", item.TipoPI, true)}
          ${field("Dueño legal PI", item.DuenoPI)}
          ${field("Freedom to Operate", item.FreedomToOperate, true)}
          ${field("Postura equity EAN", item.PosturaEquityEan, true)}
          ${field("Estado legal", item.EstadoLegal)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.22s">
        <h4>Equipo y financiamiento</h4>
        <div class="field-grid">
          ${field("Mujeres en equipo", item.MujeresEquipo)}
          ${field("Roles cubiertos", item.RolesEquipo, true)}
          ${field("Experiencia previa", item.ExperienciaPrevia, true)}
          ${field("Dedicación", item.DedicacionEquipo, true)}
          ${field("Disposición tiempo completo", item.DisposicionTC, true)}
          ${field("Disposición a pivotear", item.DisposicionPivotear, true)}
          ${field("¿Por qué este equipo?", item.EquipoRazon, true)}
          ${field("Inversión acumulada", item.InversionAcumulada)}
          ${field("Fuentes inversión", item.FuentesInversion, true)}
          ${field("Necesidad 12 meses", item.Necesidad12m)}
          ${field("Recursos para 6 meses", item.Recursos6m)}
          ${field("Busca inversión", item.BuscaInversion)}
          ${field("Reto principal en el programa", item.RetoPrincipal, true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.25s">
        <h4>Miembros del equipo</h4>
        ${members.length ? `<div class="team-list">${members.map(memberCard).join("")}</div>` : '<div class="alert-box">No hay miembros adicionales registrados.</div>'}
      </section>

      <section class="detail-section" style="animation-delay:0.28s">
        <h4>Control documental</h4>
        ${control ? `<div class="field-grid">
          ${field("Estado general", control.EstadoDocumentalGeneral)}
          ${field("Video pitch", control.VideoPitchEstado)}
          ${field("Evidencias", control.EvidenciasEstado)}
          ${field("Anexo 1", control.EstadoAnexo1)}
          ${field("Requiere subsanación", control.RequiereSubsanacion)}
        </div>` : '<div class="alert-box">Sin control documental.</div>'}
      </section>

      ${renderEvaluation(id)}
    `;
    attachEvalListeners(id);
  }

  /* ── Evaluation ── */
  function getEvalKey(id) { return `s2v_eval_demo_${id}`; }
  function loadEval(id) { try { return JSON.parse(localStorage.getItem(getEvalKey(id))) || {}; } catch { return {}; } }
  function saveEvalData(id, data) { localStorage.setItem(getEvalKey(id), JSON.stringify(data)); }

  function renderEvaluation(id) {
    const saved = loadEval(id);
    const total = EVAL_CRITERIA.reduce((s, c) => s + (saved[c.key] || 0), 0);
    const offset = RING_CIRCUMFERENCE * (1 - total / 1000);
    const ringColor = total < 400 ? "#ef6b6b" : total < 700 ? "#f0c85c" : "#55c9cc";
    let criteriaHtml = "";
    for (const c of EVAL_CRITERIA) {
      const val = saved[c.key] || 0;
      const pct = ((val / c.max) * 100).toFixed(1);
      const bg = `linear-gradient(to right, ${c.color} 0%, ${c.color} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`;
      criteriaHtml += `
        <div class="criterion" data-key="${c.key}" data-max="${c.max}">
          <div class="criterion-head">
            <span class="criterion-name">${c.label}</span>
            <span class="criterion-value"><strong>${val}</strong> / ${c.max}</span>
          </div>
          <input type="range" min="0" max="${c.max}" step="5" value="${val}"
                 data-key="${c.key}" data-color="${c.color}" style="background:${bg}">
        </div>`;
    }
    return `
      <section class="detail-section eval-section" style="animation-delay:0.3s">
        <div class="eval-header">
          <h4>Evaluación del panel</h4>
          <div class="score-ring-wrap">
            <svg class="score-ring" viewBox="0 0 120 120">
              <circle class="score-ring-bg" cx="60" cy="60" r="52"/>
              <circle class="score-ring-fill" cx="60" cy="60" r="52"
                stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${offset}"
                style="stroke:${ringColor}" id="evalRingFill"/>
            </svg>
            <div class="score-ring-text">
              <strong id="evalTotal">${total}</strong>
              <span>/ 1000</span>
            </div>
          </div>
        </div>
        <div class="eval-criteria">${criteriaHtml}</div>
        <label class="eval-notes-label">
          <span>Observaciones del evaluador</span>
          <textarea id="evalNotes" rows="3" placeholder="Notas adicionales…">${esc(saved.observaciones || "")}</textarea>
        </label>
        <div class="eval-actions">
          <button class="secondary-btn" id="evalResetBtn" type="button">Limpiar</button>
          <button class="primary-btn" id="evalSaveBtn" type="button">
            <span>Guardar evaluación</span>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3.75 9h10.5M9.75 4.5 14.25 9l-4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div id="evalFeedback"></div>
      </section>`;
  }

  function attachEvalListeners(initiativeId) {
    const sliders = $$(".eval-section input[type='range']");
    if (!sliders.length) return;
    function updateUI() {
      let total = 0;
      for (const s of sliders) {
        const val = parseInt(s.value, 10);
        const max = parseInt(s.closest(".criterion").dataset.max, 10);
        const color = s.dataset.color;
        const pct = ((val / max) * 100).toFixed(1);
        s.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.06) ${pct}%)`;
        s.closest(".criterion").querySelector(".criterion-value strong").textContent = val;
        total += val;
      }
      const totalEl = $("#evalTotal");
      const ringEl = $("#evalRingFill");
      if (totalEl) totalEl.textContent = total;
      if (ringEl) {
        ringEl.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - total / 1000);
        ringEl.style.stroke = total < 400 ? "#ef6b6b" : total < 700 ? "#f0c85c" : "#55c9cc";
      }
    }
    sliders.forEach(s => s.addEventListener("input", updateUI));
    const saveBtn = $("#evalSaveBtn"), resetBtn = $("#evalResetBtn"),
          notesEl = $("#evalNotes"), feedbackEl = $("#evalFeedback");
    if (saveBtn) saveBtn.addEventListener("click", () => {
      const evaluation = {};
      sliders.forEach(s => { evaluation[s.dataset.key] = parseInt(s.value, 10); });
      evaluation.observaciones = notesEl ? notesEl.value : "";
      evaluation.timestamp = new Date().toISOString();
      evaluation.evaluador = state.session?.correoEvaluador || "";
      saveEvalData(initiativeId, evaluation);
      if (feedbackEl) {
        feedbackEl.innerHTML = '<div class="eval-saved-msg">✓ Evaluación guardada localmente</div>';
        setTimeout(() => { feedbackEl.innerHTML = ""; }, 3000);
      }
    });
    if (resetBtn) resetBtn.addEventListener("click", () => {
      sliders.forEach(s => { s.value = 0; });
      if (notesEl) notesEl.value = "";
      updateUI();
    });
  }

  /* ── Animation ── */
  function staggerIn(selector, delay = 50) {
    $$(selector).forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, i * delay + 30);
    });
  }

  /* ── Init ── */
  function init() {
    const storedSession = localStorage.getItem(STORAGE_KEYS.session);
    if (storedSession) {
      try { const p = JSON.parse(storedSession); if (p?.correoEvaluador) els.correoEvaluador.value = p.correoEvaluador; } catch {}
    }
    els.loginForm.addEventListener("submit", login);
    els.logoutBtn.addEventListener("click", showLogin);
    els.reloadBtn.addEventListener("click", () => { loadData(DEMO_DATA); if (state.selectedId) renderDetail(state.selectedId); });
    els.searchInput.addEventListener("input", applyFilters);
    els.routeFilter.addEventListener("change", applyFilters);
    els.statusFilter.addEventListener("change", applyFilters);
    els.detailPanel.addEventListener("click", e => {
      const btn = e.target.closest("[data-resource-urls]");
      if (!btn) return;
      try {
        const urls = JSON.parse(btn.dataset.resourceUrls || "[]");
        openResourceModal(btn.dataset.resourceTitle || "Recurso", urls);
      } catch {
        openResourceModal(btn.dataset.resourceTitle || "Recurso", []);
      }
    });

    // Tab navigation
    $$(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Roster chips (from analytics / components) open an initiative profile
    window.S2V_Nav = (id) => {
      if (!id) return;
      selectInitiative(id);
      switchTab("iniciativas");
      setTimeout(() => {
        els.listSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        els.detailPanel?.querySelector(".detail-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    };
  }

  document.addEventListener("DOMContentLoaded", init);
})();
