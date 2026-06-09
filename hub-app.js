(() => {
  "use strict";

  const CONFIG = window.S2V_CONFIG || {};
  const CONFIG_PLACEHOLDER = "PEGA_AQUI_LA_URL_HTTP_DEL_FLUJO_S2V_02";
  const STORAGE_KEYS = { apiUrl: "s2v_api_consultar_datos_url", session: "s2v_session" };

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
    filtered: [], selectedId: null, session: null
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const els = {
    loginView: $("#loginView"), dashboardView: $("#dashboardView"),
    loginForm: $("#loginForm"), correoEvaluador: $("#correoEvaluador"),
    codigoAcceso: $("#codigoAcceso"), loginMessage: $("#loginMessage"),
    apiUrlInput: $("#apiUrlInput"), saveApiUrlBtn: $("#saveApiUrlBtn"),
    setupPanel: $("#setupPanel"), /* may be null if removed */ userEmailLabel: $("#userEmailLabel"),
    logoutBtn: $("#logoutBtn"),
    metricPostulaciones: $("#metricPostulaciones"), metricControl: $("#metricControl"),
    metricMiembros: $("#metricMiembros"), metricEquidad: $("#metricEquidad"),
    searchInput: $("#searchInput"), routeFilter: $("#routeFilter"),
    statusFilter: $("#statusFilter"), reloadBtn: $("#reloadBtn"),
    initiativeList: $("#initiativeList"), visibleCount: $("#visibleCount"),
    detailPanel: $("#detailPanel"), cardTemplate: $("#initiativeCardTemplate")
  };

  /* ── Utilities ── */
  function choice(value, fallback = "Pendiente") {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "object") {
      if ("Value" in value) return clean(value.Value) || fallback;
      if ("value" in value) return clean(value.value) || fallback;
      if ("Title" in value) return clean(value.Title) || fallback;
    }
    return clean(String(value)) || fallback;
  }
  function clean(v) { if (v == null) return ""; return String(v).replace(/\s+/g, " ").replace(/\s+\./g, ".").trim(); }
  function shortText(v, max = 110) { const t = clean(v); if (!t) return "Sin información."; return t.length > max ? t.slice(0, max).trim() + "…" : t; }
  function boolText(v) { if (v === true) return "Sí"; if (v === false) return "No"; return choice(v, "Pendiente"); }
  function routeOf(item) { return choice(item.RutaTRL_x007c_ || item.RutaTRL || item.RutaTRLValue, "Pendiente"); }
  function trlOf(item) { return choice(item.TRLDeclarado || item.TRLValidadoFinal || item.TRL, "Pendiente"); }
  function statusOf(item) { return choice(item.EstadoPostulacion || item.EstadoResultado || item.Estado, "Pendiente"); }
  function initiativeIdOf(item) { return clean(item.IDIniciativa || item.Title || item.NombreIniciativa || item.ID || "Sin ID"); }
  function initiativeNameOf(item) { return clean(item.NombreIniciativa || item.Title || item["{Name}"] || item.IDIniciativa || "Iniciativa sin nombre"); }
  function esc(v) { return clean(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

  function normalizeData(data) {
    return {
      postulaciones: Array.isArray(data?.postulaciones) ? data.postulaciones : [],
      controlDocumental: Array.isArray(data?.controlDocumental) ? data.controlDocumental : [],
      miembrosEquipo: Array.isArray(data?.miembrosEquipo) ? data.miembrosEquipo : []
    };
  }

  function getConfiguredApiUrl() {
    const stored = localStorage.getItem(STORAGE_KEYS.apiUrl);
    const fromCfg = CONFIG.API_CONSULTAR_DATOS_URL;
    const c = stored || fromCfg || "";
    if (!c || c === CONFIG_PLACEHOLDER) return "";
    return c.trim();
  }

  function setMessage(text, type = "") {
    els.loginMessage.textContent = text || "";
    els.loginMessage.className = `message ${type}`.trim();
  }

  /* ── API (modo demo temporal) ── */
  async function fetchData(session) {
    const apiUrl = getConfiguredApiUrl();

    const DEMO_DATA = {
      ok: true,
      mensaje: "Modo demo temporal cargado",
      postulaciones: [
        {
          IDIniciativa: "S2V-2026-23",
          NombreIniciativa: "El cambio como mecánica de juego: Desarrollo de un RPG educativo para la enseñanza de derivadas",
          EstadoPostulacion: "Recibida",
          NombreLider: "Nicolás Varón Bernal",
          CorreoLider: "nvaronb89301@universidadean.edu.co",
          RutaTRL: "TRL 1-3",
          TRLDeclarado: "TRL 2",
          CRLDeclarado: "Pendiente",
          BRLDeclarado: "Pendiente",
          IPRLDeclarado: "Pendiente",
          DescripcionCorta: "RPG educativo para apoyar la enseñanza de derivadas en estudiantes universitarios mediante mecánicas de juego.",
          PropuestaValor: "Transforma el aprendizaje de derivadas en una experiencia interactiva basada en mecánicas de RPG.",
          BonoEquidadAplica: "No",
          VideoPitchURL: "https://youtu.be/wygC5u1XgG4",
          EvidenciasURL: "https://drive.google.com/drive/folders/1hQIZJg3xi8b2ioPnvQRTybRnAcHx_QPh?usp=sharing"
        },
        {
          IDIniciativa: "S2V-2026-22",
          NombreIniciativa: "PRUEBA MVP SCIENCE2VENTURE HTML",
          EstadoPostulacion: "Recibida",
          NombreLider: "Prueba Automatización Líder MVP",
          CorreoLider: "afcaballero@universidadean.edu.co",
          RutaTRL: "TRL 4-6",
          TRLDeclarado: "TRL 4",
          CRLDeclarado: "CRL 4",
          BRLDeclarado: "BRL 3",
          IPRLDeclarado: "IPRL 2",
          DescripcionCorta: "Sistema digital para centralizar recepción, revisión y evaluación de iniciativas científico-tecnológicas.",
          PropuestaValor: "Centraliza postulaciones, evidencias y control documental en un hub conectado a SharePoint y Power Automate.",
          BonoEquidadAplica: "No",
          VideoPitchURL: "https://example.com/video-pitch-s2v-mvp",
          EvidenciasURL: "https://example.com/evidencias-s2v-mvp"
        }
      ],
      controlDocumental: [
        {
          IDIniciativa: "S2V-2026-23",
          NombreIniciativa: "El cambio como mecánica de juego: Desarrollo de un RPG educativo para la enseñanza de derivadas",
          EstadoDocumentalGeneral: "Pendiente revisión",
          VideoPitchEstado: "Pendiente revisión",
          VideoPitchURL: "https://youtu.be/wygC5u1XgG4",
          EvidenciasEstado: "Pendiente revisión",
          EvidenciasURL: "https://drive.google.com/drive/folders/1hQIZJg3xi8b2ioPnvQRTybRnAcHx_QPh?usp=sharing",
          EstadoAnexo1: "Pendiente revisión",
          URLAnexo1: "https://drive.google.com/drive/folders/1hQIZJg3xi8b2ioPnvQRTybRnAcHx_QPh",
          MetodoRecepcionAnexo1: "Formulario",
          RequiereSubsanacion: "No"
        },
        {
          IDIniciativa: "S2V-2026-22",
          NombreIniciativa: "PRUEBA MVP SCIENCE2VENTURE HTML",
          EstadoDocumentalGeneral: "Pendiente revisión",
          VideoPitchEstado: "Pendiente revisión",
          VideoPitchURL: "https://example.com/video-pitch-s2v-mvp",
          EvidenciasEstado: "Pendiente revisión",
          EvidenciasURL: "https://example.com/evidencias-s2v-mvp",
          EstadoAnexo1: "Pendiente revisión",
          URLAnexo1: "https://example.com/anexo1-s2v-mvp",
          MetodoRecepcionAnexo1: "Formulario",
          RequiereSubsanacion: "No"
        }
      ],
      miembrosEquipo: [
        {
          IDIniciativa: "S2V-2026-23",
          NombreMiembro: "Nicolás Varón Bernal",
          CorreoMiembro: "nvaronb89301@universidadean.edu.co",
          RolIniciativa: "Líder técnico",
          EsLider: "Sí",
          EsEanista: "Sí",
          EsMujer: "No",
          EstadoRegistro: "Activo"
        },
        {
          IDIniciativa: "S2V-2026-22",
          NombreMiembro: "Prueba Automatización Líder MVP",
          CorreoMiembro: "afcaballero@universidadean.edu.co",
          RolIniciativa: "Investigador principal y líder técnico",
          EsLider: "Sí",
          EsEanista: "Sí",
          EsMujer: "No",
          EstadoRegistro: "Activo"
        }
      ]
    };

    if (!apiUrl) {
      console.warn("Falta configurar la URL HTTP del flujo S2V_02. Cargando modo demo.");
      return DEMO_DATA;
    }

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correoEvaluador: session.correoEvaluador,
          codigoAcceso: session.codigoAcceso,
          modo: "consulta"
        })
      });

      const text = await res.text();
      let data = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.warn("La API no devolvió JSON válido. Cargando modo demo.", parseError);
        return DEMO_DATA;
      }

      if (!res.ok || data?.ok === false) {
        console.warn("API respondió con error. Cargando modo demo.", res.status, data);
        return DEMO_DATA;
      }

      return data;
    } catch (error) {
      console.warn("No se pudo consultar Power Automate. Cargando modo demo.", error);
      return DEMO_DATA;
    }
  }

  /* ── Auth ── */
  async function login(e) {
    e.preventDefault();
    const correo = clean(els.correoEvaluador.value);
    const codigo = clean(els.codigoAcceso.value);
    const btn = els.loginForm.querySelector("button[type='submit']");
    if (!correo || !codigo) { setMessage("Completa correo y código.", "error"); return; }
    btn.disabled = true;
    btn.classList.add("loading");
    setMessage("Consultando SharePoint…", "");
    try {
      const session = { correoEvaluador: correo, codigoAcceso: codigo };
      const data = await fetchData(session);
      state.session = session;
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ correoEvaluador: correo }));
      loadData(data);
      showDashboard();
      setMessage("", "");
    } catch (err) { setMessage(err.message, "error"); }
    finally { btn.disabled = false; btn.classList.remove("loading"); }
  }

  function showDashboard() {
    els.userEmailLabel.textContent = state.session?.correoEvaluador || "Evaluador";
    els.loginView.classList.add("leaving");
    setTimeout(() => {
      els.loginView.classList.add("hidden");
      els.loginView.classList.remove("leaving");
      els.dashboardView.classList.remove("hidden");
      staggerIn(".metric-card", 70);
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
        <p>Ficha, documentos, equipo y evaluación.</p>
      </div>`;
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
    animateNumber(els.metricEquidad, state.postulaciones.filter(i => i.BonoEquidadAplica === true || i.BonoEquidad > 0).length);
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
    state.filtered = state.postulaciones.filter(item => {
      const h = [initiativeIdOf(item), initiativeNameOf(item), item.NombreLider, item.CorreoLider, item.Ciudad, trlOf(item), routeOf(item), statusOf(item)].join(" ").toLowerCase();
      return (!q || h.includes(q)) && (!route || routeOf(item).includes(route)) && (!status || statusOf(item).includes(status));
    });
    renderInitiativeList();
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
      node.querySelector("p").textContent = shortText(item.DescripcionCorta || item.ObservacionesInternas || item.NombreLider);
      node.querySelector(".badge-row").innerHTML = [
        badge(routeOf(item), "cyan"), badge(trlOf(item)),
        badge(statusOf(item)), item.BonoEquidadAplica ? badge("Bono equidad", "gold") : ""
      ].join("");
      button.addEventListener("click", () => selectInitiative(id));
      els.initiativeList.appendChild(node);
    }
  }

  function badge(text, variant = "") { return `<span class="badge ${variant}">${esc(text)}</span>`; }

  function selectInitiative(id) {
    state.selectedId = id;
    renderInitiativeList();
    renderDetail(id);
  }

  function findControl(id) { return state.controlDocumental.find(i => clean(i.Title || i.IDIniciativa) === id) || null; }
  function findMembers(id) { return state.miembrosEquipo.filter(i => clean(i.IDIniciativa) === id).sort((a, b) => Number(a.OrdenMiembro || 99) - Number(b.OrdenMiembro || 99)); }

  function field(label, value, long = false) {
    return `<div class="field ${long ? "long-field" : ""}"><span class="label">${esc(label)}</span><span class="value">${esc(value ?? "Pendiente")}</span></div>`;
  }

  function memberCard(m) {
    const name = clean(m.Title || m.NombreMiembro || "Integrante sin nombre");
    const parts = [choice(m.VinculacionMiembro, "Vinculación pendiente"), m.RolIniciativa ? clean(m.RolIniciativa) : "Rol pendiente", m.EsLider ? "Líder" : "Integrante", m.EsEanista ? "Eanista" : "No eanista", m.EsMujer ? "Mujer" : ""].filter(Boolean);
    return `<article class="member-card"><strong>${esc(name)}</strong><p>${esc(parts.join(" · "))}</p><p>${esc(clean(m.CorreoMiembro || "Correo pendiente"))}</p></article>`;
  }

  /* ── Detail Rendering ── */
  function renderDetail(id) {
    const item = state.postulaciones.find(r => initiativeIdOf(r) === id);
    if (!item) return;
    const control = findControl(id);
    const members = findMembers(id);
    const evidUrl = clean(item.EvidenciasURL || control?.EvidenciasURL);
    const videoUrl = clean(item.VideoPitchURL || control?.VideoPitchURL);
    const anexoUrl = clean(control?.URLAnexo1 || item.URLAnexo1);

    els.detailPanel.innerHTML = `
      <div class="detail-header">
        <div>
          <p class="eyebrow">${esc(id)}</p>
          <h3>${esc(initiativeNameOf(item))}</h3>
          <div class="badge-row">
            ${badge(routeOf(item), "cyan")} ${badge(trlOf(item))} ${badge(statusOf(item))}
            ${item.BonoEquidadAplica ? badge("Bono equidad", "gold") : badge("Sin bono")}
          </div>
        </div>
        <div class="detail-actions">
          ${evidUrl ? `<a class="detail-link" href="${esc(evidUrl)}" target="_blank" rel="noopener">Evidencias</a>` : ""}
          ${videoUrl ? `<a class="detail-link" href="${esc(videoUrl)}" target="_blank" rel="noopener">Video pitch</a>` : ""}
          ${anexoUrl ? `<a class="detail-link" href="${esc(anexoUrl)}" target="_blank" rel="noopener">Anexo 1</a>` : ""}
        </div>
      </div>

      <section class="detail-section" style="animation-delay:0.05s">
        <h4>Información general</h4>
        <div class="field-grid">
          ${field("Líder", item.NombreLider)} ${field("Correo líder", item.CorreoLider)}
          ${field("Ciudad", item.Ciudad)} ${field("Vinculación", choice(item.VinculacionLider))}
          ${field("Área de conocimiento", choice(item.AreaConocimiento))} ${field("Enfoque", choice(item.EnfoqueProyecto))}
          ${field("Grupo o semillero", item.GrupoOSemillero || choice(item.SurgeGrupoSemillero))}
          ${field("Mujeres en equipo", item.MujeresEquipo ?? "Pendiente")}
          ${field("Descripción", item.DescripcionCorta || "Sin descripción.", true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.1s">
        <h4>Madurez tecnológica y ruta</h4>
        <div class="field-grid">
          ${field("TRL declarado", trlOf(item), true)}
          ${field("Ruta TRL preliminar", routeOf(item))}
          ${field("Coherencia TRL", choice(item.CoherenciaTRLPreliminar))}
          ${field("Postura frente a equity EAN", choice(item.PosturaEquityEan), true)}
        </div>
      </section>

      <section class="detail-section" style="animation-delay:0.15s">
        <h4>Control documental</h4>
        ${control ? `<div class="field-grid">
          ${field("Estado general", choice(control.EstadoDocumentalGeneral))}
          ${field("Video pitch", choice(control.VideoPitchEstado))}
          ${field("Evidencias", choice(control.EvidenciasEstado))}
          ${field("Alerta evidencias", boolText(control.EvidenciasAlertaInterna))}
          ${field("Estado Anexo 1", choice(control.EstadoAnexo1 || control.Anexo1Estado))}
          ${field("Método recepción Anexo 1", choice(control.MetodoRecepcionAnexo1))}
          ${field("Acepta términos", choice(control.AceptaTerminos))}
          ${field("Autoriza datos", choice(control.AutorizaDatos))}
          ${field("Declara veracidad", choice(control.DeclaraVeracidad))}
          ${field("Cumple equipo", choice(control.CumpleEquipo))}
          ${field("Cumple habilitantes", choice(control.CumpleHabilitantes))}
          ${field("Requiere subsanación", boolText(control.RequiereSubsanacion))}
          ${field("Observación", control.ObservacionDocumentalGeneral || "Sin observación", true)}
        </div>` : '<div class="alert-box">No hay control documental asociado a esta iniciativa.</div>'}
      </section>

      <section class="detail-section" style="animation-delay:0.2s">
        <h4>Equipo registrado</h4>
        ${members.length ? `<div class="team-list">${members.map(memberCard).join("")}</div>` : '<div class="alert-box">No hay miembros asociados en la respuesta actual.</div>'}
      </section>

      ${renderEvaluation(id)}
    `;
    attachEvalListeners(id);
  }

  /* ── Evaluation ── */
  function getEvalKey(id) { return `s2v_eval_${id}`; }
  function loadEval(id) { try { return JSON.parse(localStorage.getItem(getEvalKey(id))) || {}; } catch { return {}; } }
  function saveEval(id, data) { localStorage.setItem(getEvalKey(id), JSON.stringify(data)); }

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
      <section class="detail-section eval-section" style="animation-delay:0.25s">
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
        const head = s.closest(".criterion").querySelector(".criterion-value strong");
        if (head) head.textContent = val;
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

    const saveBtn = $("#evalSaveBtn");
    const resetBtn = $("#evalResetBtn");
    const notesEl = $("#evalNotes");
    const feedbackEl = $("#evalFeedback");

    if (saveBtn) saveBtn.addEventListener("click", () => {
      const evaluation = {};
      sliders.forEach(s => { evaluation[s.dataset.key] = parseInt(s.value, 10); });
      evaluation.observaciones = notesEl ? notesEl.value : "";
      evaluation.timestamp = new Date().toISOString();
      evaluation.evaluador = state.session?.correoEvaluador || "";
      saveEval(initiativeId, evaluation);
      if (feedbackEl) {
        feedbackEl.innerHTML = '<div class="eval-saved-msg">✓ Evaluación guardada localmente</div>';
        setTimeout(() => { feedbackEl.innerHTML = ""; }, 3000);
      }
    });

    if (resetBtn) resetBtn.addEventListener("click", () => {
      sliders.forEach(s => { s.value = 0; });
      if (notesEl) notesEl.value = "";
      updateUI();
      if (feedbackEl) feedbackEl.innerHTML = "";
    });
  }

  /* ── Animation Helpers ── */
  function staggerIn(selector, delay = 50) {
    const items = $$(selector);
    items.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(14px)";
      setTimeout(() => {
        el.style.transition = "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, i * delay + 30);
    });
  }

  /* ── Reload & URL ── */
  async function reloadData() {
    if (!state.session) return;
    els.reloadBtn.disabled = true;
    els.reloadBtn.textContent = "Actualizando…";
    try {
      const data = await fetchData(state.session);
      loadData(data);
      if (state.selectedId) renderDetail(state.selectedId);
    } catch (err) { alert(err.message); }
    finally { els.reloadBtn.disabled = false; els.reloadBtn.textContent = "Actualizar"; }
  }

  function saveApiUrl() {
    const url = clean(els.apiUrlInput.value);
    if (!url.startsWith("https://")) { setMessage("La URL debe empezar por https://", "error"); return; }
    localStorage.setItem(STORAGE_KEYS.apiUrl, url);
    setMessage("URL guardada localmente.", "success");
  }

  /* ── Init ── */
  function init() {
    const storedUrl = localStorage.getItem(STORAGE_KEYS.apiUrl);
    if (storedUrl && els.apiUrlInput) els.apiUrlInput.value = storedUrl;
    if (!getConfiguredApiUrl() && els.setupPanel) els.setupPanel.open = true;

    const storedSession = localStorage.getItem(STORAGE_KEYS.session);
    if (storedSession) {
      try { const p = JSON.parse(storedSession); if (p?.correoEvaluador) els.correoEvaluador.value = p.correoEvaluador; } catch {}
    }
    if (CONFIG.CODIGO_DEMO) els.codigoAcceso.placeholder = CONFIG.CODIGO_DEMO;

    els.loginForm.addEventListener("submit", login);
    if (els.saveApiUrlBtn) els.saveApiUrlBtn.addEventListener("click", saveApiUrl);
    els.logoutBtn.addEventListener("click", showLogin);
    els.reloadBtn.addEventListener("click", reloadData);
    els.searchInput.addEventListener("input", applyFilters);
    els.routeFilter.addEventListener("change", applyFilters);
    els.statusFilter.addEventListener("change", applyFilters);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
