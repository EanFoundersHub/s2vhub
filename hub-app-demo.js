(() => {
  "use strict";

  const DEMO_DATA = window.S2V_DEMO_DATA;
  const STORAGE_KEYS = {
    session: "s2v_demo_session_v2",
    evaluators: "s2v_demo_evaluators_v2",
    assignments: "s2v_demo_assignments_v2",
    responses: "s2v_demo_component_responses_v2"
  };

  const RUBRIC = [
    {
      key: "calidadCientifica", short: "Ciencia", label: "Calidad y solidez científica", max: 300, color: "#55c9cc",
      description: "Examina la fundamentación, el rigor, las evidencias y la coherencia entre el TRL declarado y el avance demostrado.",
      questions: [
        { id: "sci_fundamentacion", label: "Fundamentación científica y pertinencia", prompt: "¿El proyecto parte de un problema, hipótesis o necesidad claramente definida y respaldada por conocimiento científico, técnico o evidencia verificable?", help: "Revisa antecedentes, relevancia del problema y relación entre conocimiento y solución.", weight: 60 },
        { id: "sci_metodologia", label: "Rigor metodológico", prompt: "¿El proceso de investigación o desarrollo presenta una metodología coherente, documentada y adecuada para obtener los resultados reportados?", help: "Considera diseño metodológico, procedimientos, fuentes, controles y consistencia.", weight: 70 },
        { id: "sci_resultados", label: "Robustez de los resultados", prompt: "¿Los resultados son suficientemente sólidos, verificables y consistentes para sustentar el desarrollo de la solución?", help: "Valora resultados medibles, repetibilidad, ensayos, prototipos, datos o publicaciones.", weight: 70 },
        { id: "sci_trl", label: "Coherencia del TRL", prompt: "¿El nivel TRL declarado corresponde al estado de desarrollo demostrado mediante las evidencias presentadas?", help: "Diferencia entre lo ya realizado y lo que el equipo proyecta hacer.", weight: 70 },
        { id: "sci_trazabilidad", label: "Credibilidad y trazabilidad", prompt: "¿Es posible identificar el origen del conocimiento, los responsables y la trazabilidad del proceso investigativo?", help: "Revisa grupo o semillero, autores, documentación e integridad de la información.", weight: 30 }
      ]
    },
    {
      key: "mercado", short: "Mercado", label: "Potencial comercial y de mercado", max: 300, color: "#7be1e4",
      description: "Valora la necesidad de mercado, las validaciones, la propuesta de valor y una ruta de transferencia proporcional al TRL.",
      questions: [
        { id: "mkt_problema", label: "Relevancia del problema", prompt: "¿El equipo demuestra que existe un problema, necesidad u oportunidad relevante para usuarios, clientes, empresas o instituciones?", help: "Revisa claridad, frecuencia, intensidad y consecuencias del problema.", weight: 70 },
        { id: "mkt_validacion", label: "Validación del problema y cliente", prompt: "¿El nivel de validación presentado es coherente con el TRL y confirma que el problema es real y significativo?", help: "Considera entrevistas, encuestas, estudios, pilotos, aliados o clientes.", weight: 70 },
        { id: "mkt_valor", label: "Propuesta de valor y diferenciación", prompt: "¿La propuesta explica con claridad por qué la solución genera un beneficio superior o diferente frente a las alternativas?", help: "Valora beneficio, cliente objetivo, diferenciación y claridad de comunicación.", weight: 60 },
        { id: "mkt_acceso", label: "Mercado y posibilidad de acceso", prompt: "¿Existe un mercado identificable y una ruta razonable para acceder a primeros usuarios, clientes o aliados?", help: "Revisa segmento, barreras, canales, decisores y restricciones.", weight: 50 },
        { id: "mkt_transferencia", label: "Ruta de transferencia", prompt: "¿El equipo presenta una ruta coherente para transferir el conocimiento o la tecnología al mercado?", help: "Puede incluir spin-off, licenciamiento, venta, alianzas o prestación de servicios.", weight: 50 }
      ]
    },
    {
      key: "innovacionPI", short: "Innovación / PI", label: "Innovación y protección de PI", max: 200, color: "#2ea8ab",
      description: "Examina la novedad, la ventaja difícil de replicar y la estrategia de protección y titularidad.",
      questions: [
        { id: "pi_novedad", label: "Nivel de novedad", prompt: "¿La solución presenta novedad científica, tecnológica, metodológica o de aplicación frente a alternativas existentes?", help: "Valora originalidad, combinación diferenciada y estado del arte.", weight: 60 },
        { id: "pi_ventaja", label: "Ventaja competitiva", prompt: "¿La innovación puede convertirse en una ventaja difícil de replicar o sustituir?", help: "Considera barreras técnicas, datos, know-how, algoritmos, procesos o infraestructura.", weight: 50 },
        { id: "pi_proteccion", label: "Potencial de protección", prompt: "¿Los resultados presentan potencial razonable de protección mediante propiedad intelectual o mecanismos de apropiación?", help: "Patente, software, diseño, secreto, marca, derecho de autor o know-how.", weight: 50 },
        { id: "pi_titularidad", label: "Titularidad y riesgos", prompt: "¿La información permite identificar la titularidad y la ausencia de conflictos evidentes con terceros?", help: "Revisa contratos, licencias, autores, cesiones y libertad de operación.", weight: 40 }
      ]
    },
    {
      key: "equipo", short: "Equipo", label: "Equipo y capacidad de ejecución", max: 150, color: "#d4a853",
      description: "Valora capacidades técnicas y de negocio, complementariedad, compromiso y apertura al acompañamiento.",
      questions: [
        { id: "eq_capacidad", label: "Capacidad científica y técnica", prompt: "¿El equipo cuenta con conocimiento, experiencia y capacidades suficientes para continuar desarrollando la solución?", help: "Formación, experiencia, publicaciones, proyectos y dominio sectorial.", weight: 45 },
        { id: "eq_roles", label: "Complementariedad de roles", prompt: "¿Los integrantes cubren las capacidades necesarias para avanzar desde la investigación hacia el mercado?", help: "Liderazgo científico, tecnología, negocio, PI, operación y relacionamiento.", weight: 35 },
        { id: "eq_ejecucion", label: "Capacidad de ejecución", prompt: "¿El equipo demuestra disponibilidad, organización y capacidad real para cumplir los hitos del proceso?", help: "Roles, responsables, recursos, tiempo e historial de ejecución.", weight: 30 },
        { id: "eq_apertura", label: "Apertura al acompañamiento", prompt: "¿El equipo demuestra disposición para recibir retroalimentación y ajustar la iniciativa?", help: "Observa escucha, reconocimiento de brechas y capacidad de aplicar aprendizajes.", weight: 20 },
        { id: "eq_vision", label: "Visión de transferencia", prompt: "¿El equipo comparte una visión clara sobre el futuro de la tecnología y su transferencia?", help: "Hitos, ambición realista, escalabilidad y posible conformación de spin-off.", weight: 20 }
      ]
    },
    {
      key: "impacto", short: "Impacto", label: "Impacto y sostenibilidad", max: 50, color: "#6bdfb0",
      description: "Valora la claridad del cambio positivo, su medición y la posibilidad de sostenerlo en el tiempo.",
      questions: [
        { id: "imp_claridad", label: "Claridad del impacto", prompt: "¿La iniciativa identifica el cambio positivo que busca generar y los beneficiarios?", help: "Considera impacto económico, social o ambiental y población beneficiada.", weight: 20 },
        { id: "imp_medicion", label: "Medición del impacto", prompt: "¿El equipo propone indicadores o mecanismos razonables para medir resultados?", help: "Revisa métricas, línea base, frecuencia y posibilidad de verificación.", weight: 15 },
        { id: "imp_sostenibilidad", label: "Sostenibilidad de largo plazo", prompt: "¿La iniciativa presenta condiciones para sostener su operación e impacto más allá del acompañamiento?", help: "Viabilidad económica, recursos, riesgos y posibilidad de escala.", weight: 15 }
      ]
    }
  ];

  const COORDINATOR = {
    id: "coord-01", role: "coordinacion", name: "Coordinación Science2Venture",
    email: "coordinacion@universidadean.edu.co", code: "S2V-COORD"
  };

  const DEMO_EVALUATORS = [
    { id: "ev-ana", name: "Ana Martínez", email: "ana.martinez@demo.com", code: "S2V-482731", specialty: "Ciencia, innovación y propiedad intelectual", active: true },
    { id: "ev-carlos", name: "Carlos Ruiz", email: "carlos.ruiz@demo.com", code: "S2V-615284", specialty: "Mercado y transferencia tecnológica", active: true },
    { id: "ev-laura", name: "Laura Gómez", email: "laura.gomez@demo.com", code: "S2V-307946", specialty: "Equipo, impacto y sostenibilidad", active: true }
  ];

  const DEMO_ASSIGNMENTS = [
    { id: "asig-001", evaluatorId: "ev-ana", initiativeId: "S2V-2026-01", criteria: ["calidadCientifica", "innovacionPI"], comment: "Revisa especialmente la coherencia entre el TRL declarado, las evidencias y el potencial de protección.", deadline: "2026-07-10", active: true },
    { id: "asig-002", evaluatorId: "ev-carlos", initiativeId: "S2V-2026-01", criteria: ["mercado"], comment: "Valida que la oportunidad comercial sea proporcional al nivel de madurez de la iniciativa.", deadline: "2026-07-10", active: true },
    { id: "asig-003", evaluatorId: "ev-laura", initiativeId: "S2V-2026-01", criteria: ["equipo", "impacto"], comment: "Observa complementariedad del equipo y claridad de los indicadores de impacto.", deadline: "2026-07-10", active: true },
    { id: "asig-004", evaluatorId: "ev-ana", initiativeId: "S2V-2026-02", criteria: ["calidadCientifica"], comment: "Determina si la evidencia disponible sustenta el TRL reportado.", deadline: "2026-07-10", active: true },
    { id: "asig-005", evaluatorId: "ev-carlos", initiativeId: "S2V-2026-02", criteria: ["mercado", "innovacionPI"], comment: "Evalúa la ruta de transferencia y la diferenciación frente a soluciones existentes.", deadline: "2026-07-10", active: true },
    { id: "asig-006", evaluatorId: "ev-laura", initiativeId: "S2V-2026-02", criteria: ["equipo", "impacto"], comment: "Valora la capacidad de ejecución y la sostenibilidad del impacto.", deadline: "2026-07-10", active: true }
  ];

  const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

  const state = {
    raw: null, postulaciones: [], controlDocumental: [], miembrosEquipo: [],
    filtered: [], selectedId: null, session: null, role: null, activeTab: "analytics",
    crossIds: null, evaluators: [], assignments: [], responses: {},
    resultsFilters: { search: "", status: "", route: "", sort: "score-desc" }, resultExpandedId: null
  };

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const els = {
    loginView: $("#loginView"), dashboardView: $("#dashboardView"),
    loginForm: $("#loginForm"), correoEvaluador: $("#correoEvaluador"),
    codigoAcceso: $("#codigoAcceso"), loginMessage: $("#loginMessage"),
    userEmailLabel: $("#userEmailLabel"), userRoleLabel: $("#userRoleLabel"), logoutBtn: $("#logoutBtn"),
    metricPostulaciones: $("#metricPostulaciones"), metricControl: $("#metricControl"),
    metricMiembros: $("#metricMiembros"), metricEquidad: $("#metricEquidad"),
    searchInput: $("#searchInput"), routeFilter: $("#routeFilter"),
    statusFilter: $("#statusFilter"), reloadBtn: $("#reloadBtn"),
    initiativeList: $("#initiativeList"), visibleCount: $("#visibleCount"),
    detailPanel: $("#detailPanel"), cardTemplate: $("#initiativeCardTemplate"),
    tabNav: $("#tabNav"), analyticsPanel: $("#analyticsPanel"),
    componentsPanel: $("#componentsPanel"), resultsPanel: $("#resultsPanel"), evaluatorsPanel: $("#evaluatorsPanel"),
    listSection: $("#listSection"), initiativePanelTitle: $("#initiativePanelTitle")
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

  function attr(v) { return esc(v).replaceAll("`", "&#096;"); }

  function normalizeEmbedUrl(url) {
    const raw = clean(url);
    if (!raw) return "";
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") {
        const id = u.pathname.split("/").filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : raw;
      }
      if (host.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
        if (u.pathname.includes("/shorts/")) {
          const sid = u.pathname.split("/shorts/")[1]?.split("/")[0];
          if (sid) return `https://www.youtube.com/embed/${sid}`;
        }
        if (u.pathname.includes("/embed/")) return raw;
      }
      if (host.includes("drive.google.com")) {
        const fileMatch = raw.match(/\/file\/d\/([^/]+)/);
        if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
        const folderMatch = raw.match(/\/folders\/([^/?#]+)/);
        if (folderMatch) return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
      }
      return raw;
    } catch (e) {
      return raw;
    }
  }

  function isVideoAsset(label, url) {
    const raw = clean(`${label || ""} ${url || ""}`).toLowerCase();
    return raw.includes("video") || raw.includes("youtube.com") || raw.includes("youtu.be") || raw.includes("vimeo.com");
  }

  function viewerButton(label, url) {
    if (!url) return "";
    const kind = isVideoAsset(label, url) ? "video" : "document";
    return `<button class="detail-link asset-open" type="button" data-kind="${kind}" data-label="${attr(label)}" data-url="${attr(url)}">${esc(label)}</button>`;
  }

  function openAssetViewer(label, url) {
    const viewer = document.getElementById("assetViewer");
    const title = document.getElementById("assetViewerTitle");
    const body = document.getElementById("assetViewerBody");
    const fallback = document.getElementById("assetViewerFallback");
    if (!viewer || !body || !fallback) return;
    const original = clean(url);
    const embed = normalizeEmbedUrl(original);
    const isVideo = isVideoAsset(label, original);
    title.textContent = label || "Soporte";
    fallback.href = original;
    fallback.textContent = isVideo ? "Abrir video en nueva pestaña" : "Abrir soporte en nueva pestaña";
    viewer.classList.toggle("asset-viewer--video", isVideo);
    viewer.classList.toggle("asset-viewer--document", !isVideo);
    body.innerHTML = `
      <iframe src="${attr(embed)}" title="${attr(label || 'Soporte')}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>
    `;
    viewer.classList.remove("hidden");
    document.body.classList.add("viewer-open");
  }

  function closeAssetViewer() {
    const viewer = document.getElementById("assetViewer");
    const body = document.getElementById("assetViewerBody");
    if (!viewer) return;
    viewer.classList.add("hidden");
    viewer.classList.remove("asset-viewer--video", "asset-viewer--document");
    document.body.classList.remove("viewer-open");
    if (body) body.innerHTML = "";
  }

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

  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureDemoStores() {
    if (!localStorage.getItem(STORAGE_KEYS.evaluators)) writeStore(STORAGE_KEYS.evaluators, DEMO_EVALUATORS);
    if (!localStorage.getItem(STORAGE_KEYS.assignments)) writeStore(STORAGE_KEYS.assignments, DEMO_ASSIGNMENTS);
    if (!localStorage.getItem(STORAGE_KEYS.responses)) writeStore(STORAGE_KEYS.responses, {});
    state.evaluators = readStore(STORAGE_KEYS.evaluators, DEMO_EVALUATORS);
    state.assignments = readStore(STORAGE_KEYS.assignments, DEMO_ASSIGNMENTS);
    state.responses = readStore(STORAGE_KEYS.responses, {});
  }

  function persistRoleData() {
    writeStore(STORAGE_KEYS.evaluators, state.evaluators);
    writeStore(STORAGE_KEYS.assignments, state.assignments);
    writeStore(STORAGE_KEYS.responses, state.responses);
  }

  function rubricByKey(key) { return RUBRIC.find(c => c.key === key); }
  function evaluatorById(id) { return state.evaluators.find(e => e.id === id); }
  function assignmentsForEvaluator(id) { return state.assignments.filter(a => a.active !== false && a.evaluatorId === id); }
  function assignmentsForInitiative(id) { return state.assignments.filter(a => a.active !== false && a.initiativeId === id); }
  function currentEvaluator() { return state.role === "evaluador" ? evaluatorById(state.session?.userId) : null; }
  function assignmentForCurrentEvaluator(id) { return assignmentsForEvaluator(state.session?.userId).find(a => a.initiativeId === id) || null; }
  function responseKey(evaluatorId, initiativeId, criterionKey) { return `${evaluatorId}|${initiativeId}|${criterionKey}`; }
  function getCriterionResponse(evaluatorId, initiativeId, criterionKey) {
    return state.responses[responseKey(evaluatorId, initiativeId, criterionKey)] || { ratings: {}, comments: {}, criterionComment: "", confidentialNote: "", status: "pending", score: 0 };
  }
  function setCriterionResponse(evaluatorId, initiativeId, criterionKey, value) {
    state.responses[responseKey(evaluatorId, initiativeId, criterionKey)] = value;
    writeStore(STORAGE_KEYS.responses, state.responses);
  }

  function scoreQuestion(rating, weight) {
    const r = Number(rating) || 0;
    if (!r) return 0;
    return ((r - 1) / 4) * weight;
  }

  function scoreCriterion(criterion, ratings) {
    return criterion.questions.reduce((total, q) => total + scoreQuestion(ratings?.[q.id], q.weight), 0);
  }

  function criterionStatus(evaluatorId, initiativeId, criterionKey) {
    return getCriterionResponse(evaluatorId, initiativeId, criterionKey).status || "pending";
  }

  function statusLabel(status) {
    return status === "sent" ? "Enviada" : status === "draft" ? "Borrador" : "Pendiente";
  }

  function formatDate(value) {
    if (!value) return "Sin fecha";
    try { return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
    catch { return value; }
  }

  /* ── Auth demo por roles ── */
  async function login(e) {
    e.preventDefault();
    const correo = clean(els.correoEvaluador.value).toLowerCase();
    const codigo = clean(els.codigoAcceso.value);
    const btn = els.loginForm.querySelector("button[type='submit']");
    if (!correo || !codigo) { setMessage("Completa correo y código.", "error"); return; }
    btn.disabled = true;
    btn.classList.add("loading");
    setMessage("Validando acceso…", "");
    await new Promise(r => setTimeout(r, 450));

    let session = null;
    if (correo === COORDINATOR.email.toLowerCase() && codigo === COORDINATOR.code) {
      session = { role: "coordinacion", userId: COORDINATOR.id, name: COORDINATOR.name, email: COORDINATOR.email };
    } else {
      const evaluator = state.evaluators.find(ev => ev.active !== false && ev.email.toLowerCase() === correo && ev.code === codigo);
      if (evaluator) session = { role: "evaluador", userId: evaluator.id, name: evaluator.name, email: evaluator.email };
    }

    if (!session) {
      setMessage("Credenciales no válidas. Usa uno de los accesos demo indicados.", "error");
      btn.disabled = false;
      btn.classList.remove("loading");
      return;
    }

    state.session = session;
    state.role = session.role;
    writeStore(STORAGE_KEYS.session, session);
    loadData(DEMO_DATA);
    showDashboard();
    setMessage("", "");
    btn.disabled = false;
    btn.classList.remove("loading");
  }

  function configureRoleView() {
    const coordinator = state.role === "coordinacion";
    document.body.classList.toggle("role-coordinator", coordinator);
    document.body.classList.toggle("role-evaluator", !coordinator);
    $$(".coordinator-only").forEach(el => el.classList.toggle("hidden", !coordinator));
    const tabAnalytics = $('.tab-btn[data-tab="analytics"]');
    const tabComponents = $('.tab-btn[data-tab="componentes"]');
    const tabInitiatives = $('.tab-btn[data-tab="iniciativas"]');
    if (tabAnalytics) tabAnalytics.classList.toggle("hidden", !coordinator);
    if (tabComponents) tabComponents.classList.toggle("hidden", !coordinator);
    if (tabInitiatives) tabInitiatives.textContent = coordinator ? "Iniciativas" : "Mis evaluaciones";
    if (els.initiativePanelTitle) els.initiativePanelTitle.textContent = coordinator ? "Iniciativas" : "Iniciativas asignadas";
  }

  function showDashboard() {
    els.userEmailLabel.textContent = state.session?.name || state.session?.email || "Usuario";
    if (els.userRoleLabel) els.userRoleLabel.textContent = state.role === "coordinacion" ? "Coordinación" : "Evaluador por componentes";
    configureRoleView();
    els.loginView.classList.add("leaving");
    setTimeout(() => {
      els.loginView.classList.add("hidden");
      els.loginView.classList.remove("leaving");
      els.dashboardView.classList.remove("hidden");
      staggerIn(".metric-card", 70);
      if (state.role === "coordinacion") {
        if (window.S2V_Filter && !state._crossWired) {
          state._crossWired = true;
          window.S2V_Filter.subscribe(handleCrossFilter);
        }
        if (window.S2V_Analytics) window.S2V_Analytics.render(els.analyticsPanel, state.postulaciones);
        switchTab("analytics");
      } else {
        switchTab("iniciativas");
      }
      renderMetrics();
      applyFilters();
    }, 320);
  }

  function showLogin() {
    state.session = null;
    state.role = null;
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
    if (state.role === "evaluador" && tab !== "iniciativas") tab = "iniciativas";
    state.activeTab = tab;
    $$(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    els.analyticsPanel.classList.toggle("hidden", tab !== "analytics");
    els.componentsPanel.classList.toggle("hidden", tab !== "componentes");
    els.listSection.classList.toggle("hidden", tab !== "iniciativas");
    if (els.resultsPanel) els.resultsPanel.classList.toggle("hidden", tab !== "resultados");
    if (els.evaluatorsPanel) els.evaluatorsPanel.classList.toggle("hidden", tab !== "evaluadores");
    if (tab === "componentes" && window.S2V_Components) window.S2V_Components.render(els.componentsPanel);
    if (tab === "resultados") renderResultsPanel();
    if (tab === "evaluadores") renderEvaluatorsPanel();
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
    const labels = $$(".summary-grid .metric-label");
    if (state.role === "evaluador") {
      const evaluatorId = state.session?.userId;
      const assignments = assignmentsForEvaluator(evaluatorId);
      const initiativeIds = new Set(assignments.map(a => a.initiativeId));
      const totalCriteria = assignments.reduce((n, a) => n + a.criteria.length, 0);
      let sent = 0;
      assignments.forEach(a => a.criteria.forEach(key => { if (criterionStatus(evaluatorId, a.initiativeId, key) === "sent") sent += 1; }));
      if (labels[0]) labels[0].textContent = "Iniciativas asignadas";
      if (labels[1]) labels[1].textContent = "Componentes asignados";
      if (labels[2]) labels[2].textContent = "Componentes enviados";
      if (labels[3]) labels[3].textContent = "Pendientes / borrador";
      animateNumber(els.metricPostulaciones, initiativeIds.size);
      animateNumber(els.metricControl, totalCriteria);
      animateNumber(els.metricMiembros, sent);
      animateNumber(els.metricEquidad, Math.max(totalCriteria - sent, 0));
      return;
    }
    if (labels[0]) labels[0].textContent = "Postulaciones";
    if (labels[1]) labels[1].textContent = "Control documental";
    if (labels[2]) labels[2].textContent = "Miembros equipo";
    if (labels[3]) labels[3].textContent = "Evaluadores activos";
    animateNumber(els.metricPostulaciones, state.postulaciones.length);
    animateNumber(els.metricControl, state.controlDocumental.length);
    animateNumber(els.metricMiembros, state.miembrosEquipo.length);
    animateNumber(els.metricEquidad, state.evaluators.filter(e => e.active !== false).length);
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
    let base = state.postulaciones;
    if (state.role === "evaluador") {
      const allowed = new Set(assignmentsForEvaluator(state.session?.userId).map(a => a.initiativeId));
      base = base.filter(item => allowed.has(initiativeIdOf(item)));
    }
    state.filtered = base.filter(item => {
      if (state.role === "coordinacion" && cross && !cross.has(initiativeIdOf(item))) return false;
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
    animateNumber(els.metricEquidad, state.evaluators.filter(e => e.active !== false).length);
  }

  function renderInitiativeList() {
    els.initiativeList.innerHTML = "";
    els.visibleCount.textContent = `${state.filtered.length}`;
    if (!state.filtered.length) {
      els.initiativeList.innerHTML = '<div class="alert-box">No hay iniciativas que coincidan con los filtros o asignaciones.</div>';
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
      const badges = [badge(routeOf(item), "cyan"), badge(trlOf(item)), badge(statusOf(item))];
      if (state.role === "evaluador") {
        const assignment = assignmentForCurrentEvaluator(id);
        const sent = assignment ? assignment.criteria.filter(k => criterionStatus(state.session.userId, id, k) === "sent").length : 0;
        const total = assignment?.criteria.length || 0;
        if (assignment) assignment.criteria.forEach(k => badges.push(badge(rubricByKey(k)?.short || k, "assignment")));
        badges.push(badge(`${sent}/${total} enviados`, sent === total && total ? "done" : "progress"));
      } else {
        const assigned = new Set(assignmentsForInitiative(id).flatMap(a => a.criteria));
        badges.push(badge(`${assigned.size}/5 componentes`, assigned.size === 5 ? "done" : "progress"));
      }
      node.querySelector(".badge-row").innerHTML = badges.join("");
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

  function compactInitiativeSections() {
    const sections = [...els.detailPanel.querySelectorAll(":scope > .detail-section:not(.eval-section)")];
    sections.forEach((section, index) => {
      const heading = section.querySelector(":scope > h4");
      if (!heading || section.classList.contains("collapsible-detail-section")) return;
      const title = heading.textContent.trim();
      const content = document.createElement("div");
      content.className = "detail-section-content";
      [...section.childNodes].forEach(node => { if (node !== heading) content.appendChild(node); });
      heading.remove();
      const button = document.createElement("button");
      button.type = "button";
      button.className = "detail-section-toggle";
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      button.innerHTML = `<span>${esc(title)}</span><small>${index === 0 ? "Ocultar" : "Ver contenido"}</small><i aria-hidden="true">⌄</i>`;
      section.classList.add("collapsible-detail-section");
      if (index === 0) section.classList.add("open");
      section.append(button, content);
      button.addEventListener("click", () => {
        const open = section.classList.toggle("open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
        button.querySelector("small").textContent = open ? "Ocultar" : "Ver contenido";
      });
    });
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
          ${viewerButton("Video pitch", item.VideoPitchURL)}
          ${viewerButton("Evidencias", item.EvidenciasURL)}
          ${viewerButton("Anexo 1", item.Anexo1URL)}
        </div>
      </div>

      ${renderAssignmentBanner(id)}

      <section class="detail-section" style="animation-delay:0.05s">
        <h4>Información general</h4>
        <div class="field-grid">
          ${field("Fecha de postulación", item.FechaPostulacion ? formatDate(item.FechaPostulacion) : "")}
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

      ${renderRoleEvaluation(id)}
    `;
    compactInitiativeSections();
    attachRoleEvaluationListeners(id);
  }

  /* ── Evaluation by component + coordinator management ── */
  function renderAssignmentBanner(id) {
    if (state.role === "evaluador") {
      const assignment = assignmentForCurrentEvaluator(id);
      if (!assignment) return "";
      const chips = assignment.criteria.map(key => {
        const c = rubricByKey(key);
        const status = criterionStatus(state.session.userId, id, key);
        return `<span class="assignment-chip ${status}">${esc(c?.short || key)} · ${statusLabel(status)}</span>`;
      }).join("");
      return `
        <section class="assignment-banner evaluator-banner">
          <div>
            <p class="eyebrow">Tu asignación</p>
            <h4>${assignment.criteria.length > 1 ? "Tienes varios componentes asignados" : "Componente asignado"}</h4>
            <div class="assignment-chip-row">${chips}</div>
          </div>
          <div class="assignment-guidance">
            <span>Indicación de coordinación</span>
            <p>${esc(assignment.comment || "Sin comentario adicional.")}</p>
            <small>Fecha límite: ${esc(formatDate(assignment.deadline))}</small>
          </div>
        </section>`;
    }

    const assignments = assignmentsForInitiative(id);
    const covered = new Set(assignments.flatMap(a => a.criteria));
    return `
      <section class="assignment-banner coordinator-banner">
        <div>
          <p class="eyebrow">Cobertura del panel</p>
          <h4>${covered.size}/5 componentes asignados</h4>
          <div class="assignment-chip-row">
            ${RUBRIC.map(c => `<span class="assignment-chip ${covered.has(c.key) ? "assigned" : "unassigned"}">${esc(c.short)}</span>`).join("")}
          </div>
        </div>
        <button type="button" class="secondary-btn" data-open-management="true">Gestionar asignaciones</button>
      </section>`;
  }

  function renderRoleEvaluation(id) {
    return state.role === "coordinacion" ? renderCoordinatorEvaluationOverview(id) : renderEvaluatorEvaluation(id);
  }

  function renderCoordinatorEvaluationOverview(id) {
    const assignments = assignmentsForInitiative(id);
    let totalScore = 0;
    let maxAssigned = 0;
    const cards = RUBRIC.map(criterion => {
      const assignment = assignments.find(a => a.criteria.includes(criterion.key));
      if (!assignment) {
        return `
          <article class="component-status-card unassigned">
            <div class="component-status-head">
              <span class="component-dot" style="--component-color:${criterion.color}"></span>
              <div><strong>${esc(criterion.label)}</strong><small>${criterion.max} puntos</small></div>
            </div>
            <span class="status-pill pending">Sin asignar</span>
          </article>`;
      }
      const evaluator = evaluatorById(assignment.evaluatorId);
      const response = getCriterionResponse(assignment.evaluatorId, id, criterion.key);
      const score = Number(response.score || scoreCriterion(criterion, response.ratings || {}));
      totalScore += score;
      maxAssigned += criterion.max;
      return `
        <article class="component-status-card ${response.status || "pending"}">
          <div class="component-status-head">
            <span class="component-dot" style="--component-color:${criterion.color}"></span>
            <div><strong>${esc(criterion.label)}</strong><small>${criterion.max} puntos</small></div>
          </div>
          <div class="component-assignee">
            <span>${esc(evaluator?.name || "Evaluador no disponible")}</span>
            <small>${esc(evaluator?.email || "")}</small>
          </div>
          <div class="component-status-foot">
            <span class="status-pill ${response.status || "pending"}">${statusLabel(response.status)}</span>
            <strong>${score.toFixed(1)} / ${criterion.max}</strong>
          </div>
          ${assignment.comment ? `<p class="component-comment">${esc(assignment.comment)}</p>` : ""}
        </article>`;
    }).join("");

    return `
      <section class="detail-section eval-section coordinator-eval-overview" style="animation-delay:0.3s">
        <div class="eval-header">
          <div>
            <p class="eyebrow">Seguimiento de evaluación</p>
            <h4>Avance por componentes</h4>
            <p class="muted">Cada componente se asigna a una sola persona. Una persona puede asumir varios componentes.</p>
          </div>
          <div class="score-summary-box">
            <strong>${totalScore.toFixed(1)}</strong>
            <span>/ ${maxAssigned || 1000} evaluados</span>
          </div>
        </div>
        <div class="component-status-grid">${cards}</div>
        <div class="eval-actions">
          <button class="primary-btn" type="button" data-open-management="true"><span>Gestionar evaluadores</span></button>
        </div>
      </section>`;
  }

  function renderEvaluatorEvaluation(id) {
    const assignment = assignmentForCurrentEvaluator(id);
    if (!assignment) {
      return `<section class="detail-section eval-section"><div class="alert-box">Esta iniciativa no está asignada a tu usuario.</div></section>`;
    }
    const orderedCriteria = RUBRIC.filter(c => assignment.criteria.includes(c.key));
    const nav = orderedCriteria.map(c => {
      const response = getCriterionResponse(state.session.userId, id, c.key);
      return `<a href="#criterion-${c.key}" class="criterion-nav-chip ${response.status || "pending"}">${esc(c.short)} · ${statusLabel(response.status)}</a>`;
    }).join("");
    return `
      <section class="detail-section eval-section component-evaluation" style="animation-delay:0.3s">
        <div class="eval-header component-eval-intro">
          <div>
            <p class="eyebrow">Evaluación por componentes</p>
            <h4>${orderedCriteria.length > 1 ? `${orderedCriteria.length} componentes asignados` : "1 componente asignado"}</h4>
            <p class="muted">Califica únicamente los componentes asignados. Los demás serán evaluados por otras personas del panel.</p>
          </div>
          <div class="scale-legend">
            <span>1 Nulo</span><span>2 Bajo</span><span>3 Medio</span><span>4 Alto</span><span>5 Muy alto</span>
          </div>
        </div>
        <nav class="criterion-jump-nav">${nav}</nav>
        <div class="criterion-evaluation-stack">
          ${orderedCriteria.map(c => renderRubricCriterion(id, c)).join("")}
        </div>
      </section>`;
  }

  function renderRubricCriterion(initiativeId, criterion) {
    const response = getCriterionResponse(state.session.userId, initiativeId, criterion.key);
    const score = Number(response.score || scoreCriterion(criterion, response.ratings || {}));
    const locked = response.status === "sent";
    return `
      <article class="criterion-eval-card ${locked ? "submitted" : ""}" id="criterion-${criterion.key}" data-criterion="${criterion.key}">
        <header class="criterion-eval-card__header" style="--criterion-color:${criterion.color}">
          <div>
            <p class="eyebrow">${esc(criterion.short)}</p>
            <h5>${esc(criterion.label)}</h5>
            <p>${esc(criterion.description)}</p>
          </div>
          <div class="criterion-score-box">
            <strong data-criterion-score>${score.toFixed(1)}</strong>
            <span>/ ${criterion.max}</span>
            <small class="status-pill ${response.status || "pending"}">${statusLabel(response.status)}</small>
          </div>
        </header>
        <div class="rubric-question-list">
          ${criterion.questions.map((q, index) => renderRubricQuestion(q, response, index, locked)).join("")}
        </div>
        <div class="criterion-comments-grid">
          <label>
            <span>Conclusión del componente <b>*</b> <small>(visible para la iniciativa)</small></span>
            <textarea rows="4" data-criterion-comment placeholder="Escribe la retroalimentación que recibirá el equipo postulante: fortalezas, brechas y recomendaciones." ${locked ? "disabled" : ""}>${esc(response.criterionComment || "")}</textarea>
          </label>
          <label>
            <span>Nota confidencial para coordinación <b>*</b></span>
            <textarea rows="4" data-confidential-note placeholder="Registra alertas, riesgos o consideraciones que solo debe conocer la coordinación." ${locked ? "disabled" : ""}>${esc(response.confidentialNote || "")}</textarea>
          </label>
        </div>
        <footer class="criterion-eval-actions">
          <div class="criterion-feedback" role="status"></div>
          ${locked ? `
            <div class="submitted-lock"><strong>Evaluación enviada</strong><span>Solo coordinación puede reabrir este componente.</span></div>` : `
            <button class="secondary-btn" type="button" data-save-draft="${criterion.key}">Guardar borrador</button>
            <button class="primary-btn" type="button" data-submit-criterion="${criterion.key}"><span>Enviar componente</span></button>`}
        </footer>
      </article>`;
  }

  function renderRubricQuestion(question, response, index, locked) {
    const selected = Number(response.ratings?.[question.id] || 0);
    const comment = response.comments?.[question.id] || "";
    const wantsComment = Boolean(comment);
    const questionScore = scoreQuestion(selected, question.weight);
    return `
      <section class="rubric-question compact-question" data-question="${question.id}" data-weight="${question.weight}">
        <div class="rubric-question__heading">
          <span class="question-index">${index + 1}</span>
          <div>
            <h6>${esc(question.label)} <small>${question.weight} pts</small></h6>
            <p>${esc(question.prompt)}</p>
            <details class="question-help-details"><summary>Qué debe revisar el evaluador</summary><p>${esc(question.help)}</p></details>
          </div>
          <strong class="question-score" data-question-score>${questionScore.toFixed(1)} / ${question.weight}</strong>
        </div>
        <div class="rating-scale compact-rating-scale" role="radiogroup" aria-label="Calificación de ${attr(question.label)}">
          ${[1,2,3,4,5].map(value => `<button type="button" class="rating-option ${selected === value ? "active" : ""}" data-rating="${value}" aria-pressed="${selected === value ? "true" : "false"}" ${locked ? "disabled" : ""}><strong>${value}</strong><span>${["Nulo","Bajo","Medio","Alto","Muy alto"][value-1]}</span></button>`).join("")}
        </div>
        <label class="optional-justification-toggle">
          <input type="checkbox" data-toggle-justification ${wantsComment ? "checked" : ""} ${locked ? "disabled" : ""}>
          <span>Deseo justificar esta respuesta</span>
        </label>
        <div class="question-comment-wrap ${wantsComment ? "" : "hidden"}">
          <label class="question-comment-label">
            <span>Justificación opcional</span>
            <textarea rows="2" data-question-comment placeholder="Explica la evidencia que sustenta tu valoración." ${locked ? "disabled" : ""}>${esc(comment)}</textarea>
          </label>
        </div>
      </section>`;
  }

  function collectCriterionResponse(card, criterion, strict) {
    const ratings = {};
    const comments = {};
    const errors = [];
    card.querySelectorAll(".rubric-question").forEach(block => {
      const questionId = block.dataset.question;
      const active = block.querySelector(".rating-option.active");
      const rating = active ? Number(active.dataset.rating) : 0;
      const wantsComment = Boolean(block.querySelector("[data-toggle-justification]")?.checked);
      const comment = wantsComment ? (block.querySelector("[data-question-comment]")?.value.trim() || "") : "";
      ratings[questionId] = rating;
      comments[questionId] = comment;
      if (strict && !rating) errors.push("Debes calificar todas las preguntas.");
    });
    const criterionComment = card.querySelector("[data-criterion-comment]")?.value.trim() || "";
    const confidentialNote = card.querySelector("[data-confidential-note]")?.value.trim() || "";
    if (strict && !criterionComment) errors.push("Incluye la conclusión del componente que será visible para la iniciativa.");
    if (strict && !confidentialNote) errors.push("Incluye la nota confidencial para coordinación.");
    return { ratings, comments, criterionComment, confidentialNote, errors: [...new Set(errors)], score: scoreCriterion(criterion, ratings) };
  }

  function attachRoleEvaluationListeners(initiativeId) {
    document.querySelectorAll("[data-open-management]").forEach(btn => btn.addEventListener("click", () => switchTab("evaluadores")));
    if (state.role !== "evaluador") return;
    document.querySelectorAll(".criterion-eval-card").forEach(card => {
      const criterion = rubricByKey(card.dataset.criterion);
      if (!criterion || card.classList.contains("submitted")) return;
      card.querySelectorAll(".rating-option").forEach(btn => {
        btn.addEventListener("click", () => {
          const group = btn.closest(".rating-scale");
          group.querySelectorAll(".rating-option").forEach(option => {
            option.classList.toggle("active", option === btn);
            option.setAttribute("aria-pressed", option === btn ? "true" : "false");
          });
          const question = btn.closest(".rubric-question");
          const weight = Number(question.dataset.weight);
          question.querySelector("[data-question-score]").textContent = `${scoreQuestion(Number(btn.dataset.rating), weight).toFixed(1)} / ${weight}`;
          const current = collectCriterionResponse(card, criterion, false);
          card.querySelector("[data-criterion-score]").textContent = current.score.toFixed(1);
        });
      });
      card.querySelectorAll("[data-toggle-justification]").forEach(toggle => {
        toggle.addEventListener("change", () => {
          const question = toggle.closest(".rubric-question");
          const wrap = question?.querySelector(".question-comment-wrap");
          if (wrap) wrap.classList.toggle("hidden", !toggle.checked);
          if (toggle.checked) question?.querySelector("[data-question-comment]")?.focus();
        });
      });
    });

    document.querySelectorAll("[data-save-draft]").forEach(btn => btn.addEventListener("click", () => saveCriterionFromCard(initiativeId, btn.dataset.saveDraft, false)));
    document.querySelectorAll("[data-submit-criterion]").forEach(btn => btn.addEventListener("click", () => saveCriterionFromCard(initiativeId, btn.dataset.submitCriterion, true)));
  }

  function saveCriterionFromCard(initiativeId, criterionKey, submit) {
    const criterion = rubricByKey(criterionKey);
    const card = document.querySelector(`.criterion-eval-card[data-criterion="${criterionKey}"]`);
    if (!criterion || !card) return;
    const collected = collectCriterionResponse(card, criterion, submit);
    const feedback = card.querySelector(".criterion-feedback");
    if (submit && collected.errors.length) {
      feedback.innerHTML = `<div class="eval-error-msg">${collected.errors.map(esc).join(" ")}</div>`;
      return;
    }
    const previous = getCriterionResponse(state.session.userId, initiativeId, criterionKey);
    const now = new Date().toISOString();
    const value = {
      ...previous,
      ratings: collected.ratings,
      comments: collected.comments,
      criterionComment: collected.criterionComment,
      confidentialNote: collected.confidentialNote,
      score: collected.score,
      status: submit ? "sent" : "draft",
      updatedAt: now,
      sentAt: submit ? now : previous.sentAt || null,
      evaluatorId: state.session.userId,
      initiativeId,
      criterionKey
    };
    setCriterionResponse(state.session.userId, initiativeId, criterionKey, value);
    feedback.innerHTML = `<div class="eval-saved-msg">✓ ${submit ? "Componente enviado" : "Borrador guardado"}</div>`;
    renderMetrics();
    setTimeout(() => renderDetail(initiativeId), submit ? 450 : 800);
  }


  /* ── Resultados y ranking de coordinación ── */
  function appliesEquityBonus(item) {
    const value = choice(item?.BonoEquidadAplica, "").toLowerCase();
    return value === "sí" || value === "si" || value === "true" || value === "aplica" || value.startsWith("sí,") || value.startsWith("si,");
  }

  function buildInitiativeResult(item) {
    const initiativeId = initiativeIdOf(item);
    const assignments = assignmentsForInitiative(initiativeId);
    const components = RUBRIC.map(criterion => {
      const assignment = assignments.find(a => a.criteria.includes(criterion.key));
      if (!assignment) {
        return { criterion, assignment: null, evaluator: null, response: null, status: "unassigned", score: 0 };
      }
      const response = getCriterionResponse(assignment.evaluatorId, initiativeId, criterion.key);
      const calculated = scoreCriterion(criterion, response.ratings || {});
      const score = Number.isFinite(Number(response.score)) && Number(response.score) > 0 ? Number(response.score) : calculated;
      return {
        criterion,
        assignment,
        evaluator: evaluatorById(assignment.evaluatorId),
        response,
        status: response.status || "pending",
        score: Math.max(0, Math.min(score, criterion.max))
      };
    });
    const assignedCount = components.filter(c => c.assignment).length;
    const sentCount = components.filter(c => c.status === "sent").length;
    const draftCount = components.filter(c => c.status === "draft").length;
    const sentBase = components.filter(c => c.status === "sent").reduce((sum, c) => sum + c.score, 0);
    const provisionalBase = components.filter(c => c.status === "sent" || c.status === "draft").reduce((sum, c) => sum + c.score, 0);
    const complete = sentCount === RUBRIC.length;
    const status = complete ? "complete" : (sentCount || draftCount) ? "in-progress" : assignedCount ? "assigned" : "unassigned";
    const bonus = complete && appliesEquityBonus(item) && sentBase <= 800 ? 50 : 0;
    const finalScore = complete ? sentBase + bonus : null;
    return {
      item, initiativeId, name: initiativeNameOf(item), route: routeOf(item), trl: trlOf(item),
      components, assignedCount, sentCount, draftCount, complete, status,
      baseScore: sentBase, provisionalScore: provisionalBase, bonus, finalScore,
      rankScore: complete ? finalScore : provisionalBase
    };
  }

  function resultStatusLabel(status) {
    if (status === "complete") return "Completa";
    if (status === "in-progress") return "En curso";
    if (status === "assigned") return "Asignada";
    return "Sin asignar";
  }

  function resultStatusClass(status) {
    if (status === "complete") return "sent";
    if (status === "in-progress") return "draft";
    return "pending";
  }

  function resultsData() {
    return state.postulaciones.map(buildInitiativeResult);
  }

  function sortResults(rows, sort) {
    const copy = [...rows];
    if (sort === "name-asc") return copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "progress-desc") return copy.sort((a, b) => b.sentCount - a.sentCount || b.rankScore - a.rankScore || a.name.localeCompare(b.name, "es"));
    if (sort === "score-asc") return copy.sort((a, b) => a.rankScore - b.rankScore || a.name.localeCompare(b.name, "es"));
    return copy.sort((a, b) => {
      if (a.complete !== b.complete) return a.complete ? -1 : 1;
      if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
      if (b.sentCount !== a.sentCount) return b.sentCount - a.sentCount;
      return a.name.localeCompare(b.name, "es");
    });
  }

  function resultComponentCell(component) {
    if (!component.assignment) return `<td><span class="result-component-score is-empty" title="Sin evaluador asignado">—</span></td>`;
    const status = component.status || "pending";
    const shownScore = status === "sent" || status === "draft" ? component.score.toFixed(1) : "—";
    const evaluator = component.evaluator?.name || "Evaluador";
    return `<td><span class="result-component-score ${status}" title="${attr(evaluator)} · ${attr(statusLabel(status))}"><strong>${shownScore}</strong><small>/${component.criterion.max}</small></span></td>`;
  }

  function renderResultBreakdown(row) {
    const cards = row.components.map(component => {
      const response = component.response || {};
      const evaluator = component.evaluator;
      return `
        <article class="result-breakdown-card" style="--result-color:${component.criterion.color}">
          <div class="result-breakdown-head">
            <span class="component-dot" style="--component-color:${component.criterion.color}"></span>
            <div><strong>${esc(component.criterion.label)}</strong><small>${esc(evaluator?.name || "Sin evaluador asignado")}</small></div>
            <span class="status-pill ${component.assignment ? (component.status || "pending") : "pending"}">${component.assignment ? statusLabel(component.status) : "Sin asignar"}</span>
          </div>
          <div class="result-breakdown-score"><strong>${component.score.toFixed(1)}</strong><span>/ ${component.criterion.max}</span></div>
          <div class="result-breakdown-copy">
            <p><b>Conclusión visible:</b> ${esc(response.criterionComment || "Aún no registrada.")}</p>
            <p><b>Nota confidencial:</b> ${esc(response.confidentialNote || "Aún no registrada.")}</p>
          </div>
        </article>`;
    }).join("");
    return `
      <tr class="result-detail-row">
        <td colspan="14">
          <div class="result-detail-shell">
            <div class="result-detail-title">
              <div><p class="eyebrow">Desglose de calificación</p><h4>${esc(row.name)}</h4></div>
              <div class="result-total-summary"><span>Base</span><strong>${row.complete ? row.baseScore.toFixed(1) : row.provisionalScore.toFixed(1)}</strong><small>${row.complete ? `+ ${row.bonus} bono · ${row.finalScore.toFixed(1)} final` : "puntaje provisional"}</small></div>
            </div>
            <div class="result-breakdown-grid">${cards}</div>
          </div>
        </td>
      </tr>`;
  }

  function renderResultRow(row, index) {
    const progressPct = (row.sentCount / RUBRIC.length) * 100;
    const expanded = state.resultExpandedId === row.initiativeId;
    const baseDisplay = row.complete ? row.baseScore.toFixed(1) : row.provisionalScore ? row.provisionalScore.toFixed(1) : "—";
    const totalDisplay = row.complete ? row.finalScore.toFixed(1) : "—";
    return `
      <tr class="result-main-row ${row.complete ? "is-complete" : "is-provisional"}">
        <td><span class="rank-badge">${index + 1}</span></td>
        <td class="result-name-cell"><strong>${esc(row.name)}</strong><small>${esc(row.initiativeId)}</small></td>
        <td><div class="result-route"><span>${esc(row.route)}</span><small>${esc(row.trl)}</small></div></td>
        <td><div class="result-progress"><div><strong>${row.sentCount}/5</strong><small>${row.assignedCount}/5 asignados</small></div><span><i style="width:${progressPct}%"></i></span></div></td>
        ${row.components.map(resultComponentCell).join("")}
        <td><div class="result-base-score"><strong>${baseDisplay}</strong><small>${row.complete ? "/1000" : "provisional"}</small></div></td>
        <td><span class="result-bonus ${row.bonus ? "applied" : ""}">${row.complete ? `+${row.bonus}` : "—"}</span></td>
        <td><div class="result-final-score ${row.complete ? "ready" : ""}"><strong>${totalDisplay}</strong><small>${row.complete ? "/1050" : "Pendiente"}</small></div></td>
        <td><span class="status-pill ${resultStatusClass(row.status)}">${resultStatusLabel(row.status)}</span></td>
        <td><div class="table-actions result-actions"><button type="button" class="text-btn" data-toggle-result="${attr(row.initiativeId)}">${expanded ? "Ocultar" : "Desglose"}</button><button type="button" class="text-btn" data-view-result="${attr(row.initiativeId)}">Ver ficha</button></div></td>
      </tr>
      ${expanded ? renderResultBreakdown(row) : ""}`;
  }

  function filteredResults(rows) {
    const filters = state.resultsFilters || {};
    const search = clean(filters.search).toLowerCase();
    const filtered = rows.filter(row => {
      const matchesSearch = !search || `${row.initiativeId} ${row.name} ${row.route} ${row.trl}`.toLowerCase().includes(search);
      const matchesStatus = !filters.status || row.status === filters.status;
      const matchesRoute = !filters.route || row.route === filters.route;
      return matchesSearch && matchesStatus && matchesRoute;
    });
    return sortResults(filtered, filters.sort || "score-desc");
  }

  function updateResultsView() {
    if (!els.resultsPanel) return;
    const rows = resultsData();
    const visibleRows = filteredResults(rows);
    const complete = rows.filter(r => r.complete);
    const inProgress = rows.filter(r => r.status === "in-progress");
    const notStarted = rows.filter(r => r.status === "assigned" || r.status === "unassigned");
    const average = complete.length ? complete.reduce((sum, r) => sum + r.finalScore, 0) / complete.length : 0;
    const kpiMount = els.resultsPanel.querySelector("#resultsKpiMount");
    const componentMount = els.resultsPanel.querySelector("#resultsComponentMount");
    const tableMount = els.resultsPanel.querySelector("#resultsTableMount");
    const countMount = els.resultsPanel.querySelector("#resultsVisibleCount");
    if (kpiMount) kpiMount.innerHTML = `
      <article class="results-kpi-card"><span>Iniciativas</span><strong>${rows.length}</strong><small>en el proceso</small></article>
      <article class="results-kpi-card success"><span>Evaluación completa</span><strong>${complete.length}</strong><small>5 de 5 componentes</small></article>
      <article class="results-kpi-card warning"><span>En curso</span><strong>${inProgress.length}</strong><small>con borrador o envío parcial</small></article>
      <article class="results-kpi-card"><span>Sin iniciar</span><strong>${notStarted.length}</strong><small>asignadas o sin cobertura</small></article>
      <article class="results-kpi-card accent"><span>Promedio final</span><strong>${complete.length ? average.toFixed(1) : "—"}</strong><small>${complete.length ? "sobre 1050" : "sin evaluaciones completas"}</small></article>`;
    if (componentMount) componentMount.innerHTML = RUBRIC.map(criterion => {
      const sent = rows.map(r => r.components.find(c => c.criterion.key === criterion.key)).filter(c => c?.status === "sent");
      const avg = sent.length ? sent.reduce((sum, c) => sum + c.score, 0) / sent.length : 0;
      const pct = criterion.max ? (avg / criterion.max) * 100 : 0;
      return `<article class="results-component-card" style="--result-color:${criterion.color}"><div><span>${esc(criterion.short)}</span><strong>${sent.length ? avg.toFixed(1) : "—"}<small> / ${criterion.max}</small></strong></div><p>${sent.length} evaluaciones enviadas</p><span class="results-component-bar"><i style="width:${Math.min(100, pct)}%"></i></span></article>`;
    }).join("");
    if (countMount) countMount.textContent = `${visibleRows.length} ${visibleRows.length === 1 ? "iniciativa" : "iniciativas"}`;
    if (tableMount) tableMount.innerHTML = visibleRows.length ? `
      <div class="results-table-wrap">
        <table class="results-table">
          <thead><tr><th>#</th><th>Iniciativa</th><th>Ruta</th><th>Avance</th><th>Ciencia</th><th>Mercado</th><th>Innovación PI</th><th>Equipo</th><th>Impacto</th><th>Base</th><th>Bono</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${visibleRows.map(renderResultRow).join("")}</tbody>
        </table>
      </div>` : `<div class="results-empty"><strong>No hay resultados con estos filtros.</strong><span>Ajusta la búsqueda o el estado para volver a ver iniciativas.</span></div>`;
  }

  function renderResultsPanel() {
    if (!els.resultsPanel || state.role !== "coordinacion") return;
    const filters = state.resultsFilters || { search: "", status: "", route: "", sort: "score-desc" };
    els.resultsPanel.innerHTML = `
      <section class="results-shell">
        <header class="results-hero">
          <div><p class="eyebrow">Coordinación · Consolidado</p><h3>Resultados y ranking</h3><p>Consulta el avance de las calificaciones, compara los cinco componentes y ordena las iniciativas de mayor a menor puntaje. Las evaluaciones incompletas aparecen como provisionales.</p></div>
          <div class="results-method-note"><strong>Regla del demo</strong><span>El total definitivo se muestra cuando los 5 componentes están enviados. El bono de equidad se aplica con base ≤ 800.</span></div>
        </header>
        <div id="resultsKpiMount" class="results-kpi-grid"></div>
        <section class="results-component-summary"><div class="results-section-heading"><div><p class="eyebrow">Promedios</p><h4>Resultado por componente</h4></div></div><div id="resultsComponentMount" class="results-component-grid"></div></section>
        <section class="results-ranking-card">
          <div class="results-ranking-head"><div><p class="eyebrow">Clasificación</p><h4>Ranking de iniciativas</h4></div><span id="resultsVisibleCount" class="count-chip">0 iniciativas</span></div>
          <div class="results-toolbar">
            <label class="results-search"><span>Buscar</span><input id="resultsSearch" type="search" value="${attr(filters.search || "")}" placeholder="Nombre o código de iniciativa"></label>
            <label><span>Estado</span><select id="resultsStatus"><option value="">Todos</option><option value="complete" ${filters.status === "complete" ? "selected" : ""}>Completas</option><option value="in-progress" ${filters.status === "in-progress" ? "selected" : ""}>En curso</option><option value="assigned" ${filters.status === "assigned" ? "selected" : ""}>Asignadas sin iniciar</option><option value="unassigned" ${filters.status === "unassigned" ? "selected" : ""}>Sin asignar</option></select></label>
            <label><span>Ruta</span><select id="resultsRoute"><option value="">Todas</option><option value="TRL 1-3" ${filters.route === "TRL 1-3" ? "selected" : ""}>TRL 1-3</option><option value="TRL 4-6" ${filters.route === "TRL 4-6" ? "selected" : ""}>TRL 4-6</option><option value="TRL 7-9" ${filters.route === "TRL 7-9" ? "selected" : ""}>TRL 7-9</option></select></label>
            <label><span>Ordenar</span><select id="resultsSort"><option value="score-desc" ${filters.sort === "score-desc" ? "selected" : ""}>Mayor a menor puntaje</option><option value="score-asc" ${filters.sort === "score-asc" ? "selected" : ""}>Menor a mayor puntaje</option><option value="progress-desc" ${filters.sort === "progress-desc" ? "selected" : ""}>Mayor avance</option><option value="name-asc" ${filters.sort === "name-asc" ? "selected" : ""}>Nombre A–Z</option></select></label>
            <button id="resultsReset" type="button" class="secondary-btn">Limpiar filtros</button>
          </div>
          <div id="resultsTableMount"></div>
        </section>
      </section>`;
    const search = els.resultsPanel.querySelector("#resultsSearch");
    const status = els.resultsPanel.querySelector("#resultsStatus");
    const route = els.resultsPanel.querySelector("#resultsRoute");
    const sort = els.resultsPanel.querySelector("#resultsSort");
    if (search) search.addEventListener("input", () => { state.resultsFilters.search = search.value; updateResultsView(); });
    if (status) status.addEventListener("change", () => { state.resultsFilters.status = status.value; updateResultsView(); });
    if (route) route.addEventListener("change", () => { state.resultsFilters.route = route.value; updateResultsView(); });
    if (sort) sort.addEventListener("change", () => { state.resultsFilters.sort = sort.value; updateResultsView(); });
    const reset = els.resultsPanel.querySelector("#resultsReset");
    if (reset) reset.addEventListener("click", () => { state.resultsFilters = { search: "", status: "", route: "", sort: "score-desc" }; state.resultExpandedId = null; renderResultsPanel(); });
    els.resultsPanel.onclick = e => {
      const toggle = e.target.closest("[data-toggle-result]");
      const view = e.target.closest("[data-view-result]");
      if (toggle) {
        const id = toggle.dataset.toggleResult;
        state.resultExpandedId = state.resultExpandedId === id ? null : id;
        updateResultsView();
      }
      if (view) {
        const id = view.dataset.viewResult;
        selectInitiative(id);
        switchTab("iniciativas");
        requestAnimationFrame(() => els.listSection.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    };
    updateResultsView();
  }

  function renderEvaluatorsPanel() {
    if (!els.evaluatorsPanel || state.role !== "coordinacion") return;
    const activeEvaluators = state.evaluators.filter(e => e.active !== false);
    const assignedComponents = state.assignments.reduce((sum, a) => sum + (a.criteria?.length || 0), 0);
    let sentComponents = 0;
    state.assignments.forEach(a => a.criteria.forEach(key => { if (criterionStatus(a.evaluatorId, a.initiativeId, key) === "sent") sentComponents += 1; }));
    const evaluatorOptions = activeEvaluators.map(e => `<option value="${e.id}">${esc(e.name)} · ${esc(e.specialty || "Sin especialidad")}</option>`).join("");
    const initiativeChecklist = state.postulaciones.map(i => {
      const id = initiativeIdOf(i);
      return `<label class="initiative-check-item" data-initiative-search="${attr(`${id} ${initiativeNameOf(i)}`.toLowerCase())}"><input type="checkbox" name="initiativeIds" value="${attr(id)}"><span><strong>${esc(id)}</strong><small>${esc(initiativeNameOf(i))}</small></span></label>`;
    }).join("");

    els.evaluatorsPanel.innerHTML = `
      <section class="management-shell">
        <header class="management-hero">
          <div>
            <p class="eyebrow">Coordinación</p>
            <h3>Gestión de evaluadores por componentes</h3>
            <p>Cada componente se asigna a una sola persona por iniciativa. Una persona puede recibir uno o varios componentes.</p>
          </div>
          <div class="demo-backend-note"><strong>Modo demo</strong><span>Los cambios se guardan en este navegador. La conexión con SharePoint se implementará en el siguiente paso.</span></div>
        </header>

        <div class="management-metrics">
          <article><span>Evaluadores activos</span><strong>${activeEvaluators.length}</strong></article>
          <article><span>Asignaciones</span><strong>${state.assignments.length}</strong></article>
          <article><span>Componentes asignados</span><strong>${assignedComponents}</strong></article>
          <article><span>Componentes enviados</span><strong>${sentComponents}</strong></article>
        </div>

        <div id="managementFeedback"></div>

        <div class="management-forms-grid">
          <form id="evaluatorCreateForm" class="management-card">
            <div class="management-card__head"><span>01</span><div><h4>Registrar evaluador</h4><p>Crea el acceso que después alimentará el flujo de invitación.</p></div></div>
            <label><span>Nombre completo</span><input name="name" required placeholder="Nombre del evaluador"></label>
            <label><span>Correo electrónico</span><input name="email" type="email" required placeholder="correo@dominio.com"></label>
            <label><span>Especialidad o perfil</span><input name="specialty" required placeholder="Ej. transferencia tecnológica"></label>
            <button class="primary-btn" type="submit"><span>Crear evaluador</span></button>
          </form>

          <form id="assignmentCreateForm" class="management-card assignment-form">
            <div class="management-card__head"><span>02</span><div><h4>Asignar componentes de forma masiva</h4><p>Selecciona una, varias o todas las iniciativas y asigna los mismos componentes a la persona elegida.</p></div></div>
            <div class="management-form-row">
              <label><span>Evaluador</span><select name="evaluatorId" required><option value="">Seleccionar…</option>${evaluatorOptions}</select></label>
              <label><span>Fecha límite</span><input name="deadline" type="date" value="2026-07-10" required></label>
            </div>
            <fieldset class="initiative-multiselect">
              <legend>Iniciativas a asignar</legend>
              <div class="initiative-select-toolbar">
                <label class="select-all-initiatives"><input type="checkbox" id="selectAllInitiatives"><span>Seleccionar todas las ${state.postulaciones.length} iniciativas</span></label>
                <strong id="initiativeSelectionCount">0 seleccionadas</strong>
              </div>
              <input id="initiativeAssignmentSearch" class="initiative-assignment-search" type="search" placeholder="Buscar por código o nombre…" autocomplete="off">
              <div class="initiative-checkbox-list">${initiativeChecklist}</div>
            </fieldset>
            <fieldset class="criteria-checkboxes"><legend>Componentes a asignar</legend>${RUBRIC.map(c => `<label><input type="checkbox" name="criteria" value="${c.key}"><span style="--criterion-color:${c.color}">${esc(c.label)} <small>${c.max} pts</small></span></label>`).join("")}</fieldset>
            <label><span>Comentario para el evaluador</span><textarea name="comment" rows="3" placeholder="Esta indicación se aplicará a todas las iniciativas seleccionadas."></textarea></label>
            <button class="primary-btn" type="submit"><span>Guardar asignaciones</span></button>
          </form>
        </div>

        <section class="management-section">
          <div class="management-section__head"><div><p class="eyebrow">Accesos</p><h4>Evaluadores registrados</h4></div><span>${activeEvaluators.length} activos</span></div>
          <div class="evaluator-roster">${state.evaluators.map(renderEvaluatorRosterCard).join("")}</div>
        </section>

        <section class="management-section">
          <div class="management-section__head"><div><p class="eyebrow">Distribución</p><h4>Asignaciones vigentes</h4></div><span>${state.assignments.length} registros</span></div>
          <div class="assignment-table-wrap"><table class="assignment-table"><thead><tr><th>Iniciativa</th><th>Evaluador</th><th>Componentes</th><th>Fecha límite</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${state.assignments.map(renderAssignmentRow).join("")}</tbody></table></div>
        </section>
      </section>`;
    attachManagementListeners();
  }

  function renderEvaluatorRosterCard(evaluator) {
    const assignments = assignmentsForEvaluator(evaluator.id);
    const components = assignments.reduce((sum, a) => sum + a.criteria.length, 0);
    return `
      <article class="evaluator-roster-card ${evaluator.active === false ? "inactive" : ""}">
        <div class="avatar-initials">${esc(evaluator.name.split(/\s+/).slice(0,2).map(x => x[0]).join(""))}</div>
        <div class="evaluator-roster-main"><strong>${esc(evaluator.name)}</strong><span>${esc(evaluator.email)}</span><small>${esc(evaluator.specialty || "Sin especialidad")}</small></div>
        <div class="credential-box"><span>Código demo</span><code>${esc(evaluator.code)}</code></div>
        <div class="roster-count"><strong>${assignments.length}</strong><span>iniciativas</span><small>${components} componentes</small></div>
        <div class="roster-actions">
          <button type="button" class="secondary-btn compact-btn" data-copy-invite="${evaluator.id}">Copiar acceso</button>
          <button type="button" class="secondary-btn compact-btn" data-mail-invite="${evaluator.id}">Preparar correo</button>
          <button type="button" class="text-btn" data-toggle-evaluator="${evaluator.id}">${evaluator.active === false ? "Activar" : "Desactivar"}</button>
        </div>
      </article>`;
  }

  function renderAssignmentRow(assignment) {
    const evaluator = evaluatorById(assignment.evaluatorId);
    const initiative = state.postulaciones.find(i => initiativeIdOf(i) === assignment.initiativeId);
    const statuses = assignment.criteria.map(key => criterionStatus(assignment.evaluatorId, assignment.initiativeId, key));
    const sent = statuses.filter(s => s === "sent").length;
    const status = sent === assignment.criteria.length ? "sent" : statuses.some(s => s === "draft") ? "draft" : "pending";
    const reopenButtons = assignment.criteria.filter(key => criterionStatus(assignment.evaluatorId, assignment.initiativeId, key) === "sent").map(key => `<button type="button" class="text-btn" data-reopen="${assignment.id}|${key}">Reabrir ${esc(rubricByKey(key)?.short || key)}</button>`).join("");
    return `
      <tr>
        <td><strong>${esc(assignment.initiativeId)}</strong><span>${esc(shortText(initiativeNameOf(initiative || {}), 55))}</span></td>
        <td><strong>${esc(evaluator?.name || "Sin evaluador")}</strong><span>${esc(evaluator?.email || "")}</span></td>
        <td><div class="assignment-chip-row">${assignment.criteria.map(key => `<span class="assignment-chip ${criterionStatus(assignment.evaluatorId, assignment.initiativeId, key)}">${esc(rubricByKey(key)?.short || key)}</span>`).join("")}</div></td>
        <td>${esc(formatDate(assignment.deadline))}</td>
        <td><span class="status-pill ${status}">${sent}/${assignment.criteria.length} enviados</span></td>
        <td><div class="table-actions">${reopenButtons}<button type="button" class="text-btn danger" data-remove-assignment="${assignment.id}">Eliminar</button></div></td>
      </tr>`;
  }

  function generateAccessCode() {
    return `S2V-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  function managementMessage(text, error = false) {
    const box = document.getElementById("managementFeedback");
    if (!box) return;
    box.innerHTML = `<div class="${error ? "eval-error-msg" : "eval-saved-msg"}">${esc(text)}</div>`;
    setTimeout(() => { if (box) box.innerHTML = ""; }, 5000);
  }

  function attachManagementListeners() {
    const createForm = document.getElementById("evaluatorCreateForm");
    const assignmentForm = document.getElementById("assignmentCreateForm");
    if (createForm) createForm.addEventListener("submit", e => {
      e.preventDefault();
      const fd = new FormData(createForm);
      const email = clean(fd.get("email")).toLowerCase();
      if (state.evaluators.some(ev => ev.email.toLowerCase() === email)) { managementMessage("Ya existe un evaluador con ese correo.", true); return; }
      const evaluator = { id: `ev-${Date.now()}`, name: clean(fd.get("name")), email, specialty: clean(fd.get("specialty")), code: generateAccessCode(), active: true };
      state.evaluators.push(evaluator);
      persistRoleData();
      renderMetrics();
      renderEvaluatorsPanel();
      managementMessage(`Evaluador creado. Código: ${evaluator.code}`);
    });

    if (assignmentForm) {
      const initiativeChecks = [...assignmentForm.querySelectorAll('input[name="initiativeIds"]')];
      const selectAll = assignmentForm.querySelector("#selectAllInitiatives");
      const search = assignmentForm.querySelector("#initiativeAssignmentSearch");
      const count = assignmentForm.querySelector("#initiativeSelectionCount");
      const updateSelectionCount = () => {
        const selected = initiativeChecks.filter(input => input.checked).length;
        if (count) count.textContent = `${selected} ${selected === 1 ? "seleccionada" : "seleccionadas"}`;
        if (selectAll) {
          selectAll.checked = selected === initiativeChecks.length && initiativeChecks.length > 0;
          selectAll.indeterminate = selected > 0 && selected < initiativeChecks.length;
        }
      };
      initiativeChecks.forEach(input => input.addEventListener("change", updateSelectionCount));
      if (selectAll) selectAll.addEventListener("change", () => {
        initiativeChecks.forEach(input => { input.checked = selectAll.checked; });
        updateSelectionCount();
      });
      if (search) search.addEventListener("input", () => {
        const query = clean(search.value).toLowerCase();
        assignmentForm.querySelectorAll(".initiative-check-item").forEach(label => {
          label.hidden = Boolean(query) && !clean(label.dataset.initiativeSearch).includes(query);
        });
      });
      updateSelectionCount();

      assignmentForm.addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(assignmentForm);
        const evaluatorId = clean(fd.get("evaluatorId"));
        const initiativeIds = fd.getAll("initiativeIds").map(clean).filter(Boolean);
        const criteria = fd.getAll("criteria").map(clean).filter(Boolean);
        if (!evaluatorId || !initiativeIds.length || !criteria.length) { managementMessage("Selecciona evaluador, al menos una iniciativa y un componente.", true); return; }

        const comment = clean(fd.get("comment"));
        const deadline = clean(fd.get("deadline"));
        const stamp = Date.now();
        initiativeIds.forEach((initiativeId, index) => {
          state.assignments.forEach(a => {
            if (a.initiativeId === initiativeId && a.evaluatorId !== evaluatorId) a.criteria = a.criteria.filter(key => !criteria.includes(key));
          });
          state.assignments = state.assignments.filter(a => a.criteria.length > 0);
          let assignment = state.assignments.find(a => a.initiativeId === initiativeId && a.evaluatorId === evaluatorId);
          if (assignment) {
            assignment.criteria = [...new Set([...assignment.criteria, ...criteria])];
            assignment.comment = comment;
            assignment.deadline = deadline;
            assignment.active = true;
          } else {
            assignment = { id: `asig-${stamp}-${index}`, evaluatorId, initiativeId, criteria: [...criteria], comment, deadline, active: true };
            state.assignments.push(assignment);
          }
        });
        persistRoleData();
        renderEvaluatorsPanel();
        renderInitiativeList();
        managementMessage(`${initiativeIds.length} ${initiativeIds.length === 1 ? "iniciativa actualizada" : "iniciativas actualizadas"}. La cobertura por componente fue reasignada.`);
      });
    }

    els.evaluatorsPanel.onclick = async e => {
      const copyBtn = e.target.closest("[data-copy-invite]");
      const mailBtn = e.target.closest("[data-mail-invite]");
      const toggleBtn = e.target.closest("[data-toggle-evaluator]");
      const removeBtn = e.target.closest("[data-remove-assignment]");
      const reopenBtn = e.target.closest("[data-reopen]");
      if (copyBtn) {
        const evaluator = evaluatorById(copyBtn.dataset.copyInvite);
        const text = invitationText(evaluator);
        try { await navigator.clipboard.writeText(text); managementMessage("Acceso e invitación copiados."); }
        catch { managementMessage("No fue posible copiar automáticamente.", true); }
      }
      if (mailBtn) {
        const evaluator = evaluatorById(mailBtn.dataset.mailInvite);
        const subject = encodeURIComponent("Invitación como evaluador(a) · Science2Venture");
        const body = encodeURIComponent(invitationText(evaluator));
        window.location.href = `mailto:${encodeURIComponent(evaluator.email)}?subject=${subject}&body=${body}`;
      }
      if (toggleBtn) {
        const evaluator = evaluatorById(toggleBtn.dataset.toggleEvaluator);
        evaluator.active = evaluator.active === false;
        persistRoleData();
        renderEvaluatorsPanel();
      }
      if (removeBtn) {
        state.assignments = state.assignments.filter(a => a.id !== removeBtn.dataset.removeAssignment);
        persistRoleData();
        renderEvaluatorsPanel();
        renderInitiativeList();
      }
      if (reopenBtn) {
        const [assignmentId, criterionKey] = reopenBtn.dataset.reopen.split("|");
        const assignment = state.assignments.find(a => a.id === assignmentId);
        if (assignment) {
          const key = responseKey(assignment.evaluatorId, assignment.initiativeId, criterionKey);
          if (state.responses[key]) state.responses[key].status = "draft";
          persistRoleData();
          renderEvaluatorsPanel();
          managementMessage("Componente reabierto para edición.");
        }
      }
    };
  }

  function invitationText(evaluator) {
    const assignments = assignmentsForEvaluator(evaluator.id);
    const detail = assignments.map(a => {
      const initiative = state.postulaciones.find(i => initiativeIdOf(i) === a.initiativeId);
      const criteria = a.criteria.map(key => rubricByKey(key)?.label || key).join(", ");
      return `• ${a.initiativeId} · ${initiativeNameOf(initiative || {})}\n  Componentes: ${criteria}\n  Fecha límite: ${formatDate(a.deadline)}`;
    }).join("\n\n");
    return `Hola ${evaluator.name},\n\nGracias por acompañarnos como evaluador(a) de Science2Venture. Te hemos asignado los siguientes componentes:\n\n${detail || "Aún no tienes asignaciones registradas."}\n\nAcceso al Selection Hub:\nURL: ${window.location.href}\nUsuario: ${evaluator.email}\nCódigo: ${evaluator.code}\n\nLa información de las iniciativas es confidencial y debe usarse únicamente para el proceso de evaluación.\n\nEquipo Science2Venture`;
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
    ensureDemoStores();
    const storedSession = readStore(STORAGE_KEYS.session, null);
    if (storedSession?.email) els.correoEvaluador.value = storedSession.email;
    els.loginForm.addEventListener("submit", login);
    els.logoutBtn.addEventListener("click", showLogin);
    els.reloadBtn.addEventListener("click", () => {
      ensureDemoStores();
      loadData(DEMO_DATA);
      renderMetrics();
      if (state.selectedId) renderDetail(state.selectedId);
      if (state.activeTab === "resultados") renderResultsPanel();
      if (state.activeTab === "evaluadores") renderEvaluatorsPanel();
    });
    els.searchInput.addEventListener("input", applyFilters);
    els.routeFilter.addEventListener("change", applyFilters);
    els.statusFilter.addEventListener("change", applyFilters);

    $$(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.addEventListener("click", (e) => {
      const opener = e.target.closest(".asset-open");
      if (opener) {
        e.preventDefault();
        openAssetViewer(opener.dataset.label || "Soporte", opener.dataset.url || "");
      }
      if (e.target.closest("[data-close-viewer]")) closeAssetViewer();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAssetViewer(); });

    window.S2V_Nav = (id) => {
      if (!id) return;
      selectInitiative(id);
      switchTab("iniciativas");
      requestAnimationFrame(() => {
        els.listSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
  }


  document.addEventListener("DOMContentLoaded", init);
})();
