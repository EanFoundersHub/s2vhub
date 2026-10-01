(() => {
  "use strict";
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  const access = (params.get("access") || "").trim();
  const state = { data:null, filtered:[], selected:null, activeTab:"summary" };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const clean = v => (v === null || v === undefined ? "" : String(v).trim());
  const empty = v => {
    if (v === null || v === undefined) return true;
    if (Array.isArray(v)) return !v.length;
    const s=String(v).trim().toLowerCase();
    return !s || ["null","undefined","nan","no reportado"].includes(s);
  };
  const valueHtml = v => {
    if (Array.isArray(v)) return `<ul>${v.filter(x=>!empty(x)).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
    const s=clean(v);
    if (/^https?:\/\//i.test(s)) return `<a href="${esc(s)}" target="_blank" rel="noopener">Abrir recurso ↗</a>`;
    return esc(s);
  };
  const money = v => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return "";
    return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n).replace(/\s/g," ");
  };
  const moneyCompact = v => {
    const n=Number(v);
    if(!Number.isFinite(n)||n<=0) return "—";
    if(n>=1000000){
      const m=n/1000000;
      return `$${Number.isInteger(m)?m:m.toFixed(1)} M`;
    }
    if(n>=1000) return `$${Math.round(n/1000)} mil`;
    return `$${n}`;
  };
  const fundingLabel = r => r?.fundingAssigned ? "Financiación asignada" : "Sin financiación asignada";
  const mailLink = v => empty(v) ? "" : `<a class="contact-action" href="mailto:${esc(clean(v))}"><span>✉</span>${esc(clean(v))}</a>`;
  const phoneLink = v => {
    if (empty(v)) return "";
    const raw=clean(v), tel=raw.replace(/[^\d+]/g,"");
    return `<a class="contact-action" href="tel:${esc(tel)}"><span>☎</span>${esc(raw)}</a>`;
  };
  // Notas de coordinación interna que no deben exponerse a los mentores.
  // Se eliminan solo frases de revisión/consulta con nombres internos; los nombres
  // legítimos de líderes, integrantes o evaluadores permanecen intactos.
  const internalCoordinationNote = text => {
    const s=clean(text);
    if(!s) return false;
    const verb=/(revisar|revisi[oó]n|consultar|validar|confirmar)/i;
    const person=/(andr[eé]s|jos[eé](?:\s+alba)?)/i;
    return verb.test(s) && person.test(s);
  };
  const stripInternalNotes = value => {
    let s=clean(value);
    if(!s) return "";
    // Primero elimina paréntesis puramente internos, p. ej. "(revisión con José Alba)".
    s=s.replace(/\s*\([^)]*(?:revisar|revisi[oó]n|consultar|validar|confirmar)[^)]*(?:andr[eé]s|jos[eé](?:\s+alba)?)[^)]*\)/gi,"");
    // Luego elimina únicamente las oraciones/párrafos internos y conserva la observación técnica restante.
    const parts=s.split(/(?:\r?\n)+|(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean);
    return parts.filter(x=>!internalCoordinationNote(x)).join(" " ).replace(/\s+/g," " ).trim();
  };
  const nonLegacy = text => !!stripInternalNotes(text);
  const initials = name => clean(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("") || "S2V";

  const fieldGroups = [
    ["Identificación del proyecto",[
      ["IDIniciativa","Código de iniciativa"],["EstadoPostulacion","Estado de postulación"],["FechaPostulacion","Fecha de postulación"],
      ["NombreLider","Líder / contacto principal"],["CorreoLider","Correo de contacto"],["TelefonoLider","Teléfono de contacto"],
      ["Ciudad","Ciudad"],["Vinculacion","Vinculación"],["NivelEducativo","Nivel educativo"],["Pregrado","Pregrado"],["Posgrado","Posgrado"],
      ["Modalidad","Modalidad"],["Enfoque","Enfoque"],
      ["EnfoqueDetalle","Detalle del enfoque"],["AreaConocimiento","Área de conocimiento"],["SurgeGrupoSemillero","¿Surge de grupo o semillero?"],
      ["GrupoSemillero","Grupo / semillero"],["AnoInicio","Año de inicio"]
    ]],
    ["Madurez tecnológica",[
      ["TRLDeclarado","TRL declarado"],["TRLDetalle","Detalle TRL"],["CRLDeclarado","CRL declarado"],
      ["CRLDetalle","Detalle CRL"],["BRLDeclarado","BRL declarado"],["BRLDetalle","Detalle BRL"],["TipoTecnologia","Tipo de tecnología"],
      ["TecnologiaPropia","Tecnología propia"],["Complejidad","Complejidad"],["EntornoPrueba","Entorno de prueba"],["Brecha","Brecha principal"],
      ["EvidenciasTecnicas","Evidencias técnicas"],["EvidenciasConcretas","Evidencias concretas"],["TRLValidado","TRL validado"],
      ["TRLValidacionEstado","Estado de validación TRL"],["TRLValidacionComparacion","Comparación TRL"],
      ["TRLValidacionTipo","Tipo de validación"],["TRLValidacionTexto","Texto de validación TRL"],["TRLValidacionFecha","Fecha validación"],
      ["TRLValidacionEvaluador","Evaluador TRL"]
    ]],
    ["Problema y reto",[
      ["ProblemaDescripcion","Problema que aborda"],["IdentificacionProblema","Cómo se identificó el problema"],["ValidacionProblema","Validación del problema"],
      ["PersonasEntrevistadas","Personas entrevistadas"],["RetoPrincipal","Reto principal"]
    ]],
    ["Mercado",[
      ["ClienteTipo","Cliente / usuario"],["EvidenciaInteres","Evidencia de interés"],["AlcanceGeografico","Alcance geográfico"],
      ["TamanoMercado","Tamaño de mercado"],["Competencia","Competencia"],["Diferenciacion","Diferenciación"],["Canales","Canales"],
      ["AliadosEstrategicos","Aliados estratégicos"]
    ]],
    ["Modelo de negocio",[
      ["PropuestaValor","Propuesta de valor"],["PropuestaValorEstructura","Estructura de la propuesta de valor"],["FuenteIngresos","Fuente de ingresos"],
      ["PrecioValidado","Precio validado"],["NumerosNegocio","Números del negocio"],["HaFacturado","¿Ha facturado?"],["FacturacionTotal","Facturación total"],
      ["VentasMensuales","Ventas mensuales"],["PuntoEquilibrio","Punto de equilibrio"],["RegistrosContables","Registros contables"],
      ["InversionAcumulada","Inversión acumulada"],["FuentesInversion","Fuentes de inversión"],["Necesidad12m","Necesidad a 12 meses"],
      ["Recursos6m","Recursos a 6 meses"],["BuscaInversion","¿Busca inversión?"]
    ]],
    ["Transferencia y propiedad intelectual",[
      ["EstadoPI","Estado de propiedad intelectual"],["TipoPI","Tipo de propiedad intelectual"],["DuenoPI","Titularidad / dueño de PI"],
      ["FreedomToOperate","Freedom to Operate"],["Regulatorio","Aspectos regulatorios"],["EstadoLegal","Estado legal"],["PosturaEquityEan","Postura frente a equity EAN"]
    ]],
    ["Equipo",[
      ["RolesEquipo","Roles del equipo"],["ExperienciaPrevia","Experiencia previa"],["DedicacionEquipo","Dedicación del equipo"],
      ["DisposicionTC","Disposición de tiempo completo"],["DisposicionPivotear","Disposición a pivotear"],["MujeresEquipo","Participación de mujeres"],
      ["RolLider","Rol del líder"],["EquipoRazon","Razón / fortaleza del equipo"],["BonoEquidadAplica","Bono de equidad"]
    ]],
    ["Impacto y sostenibilidad",[
      ["ODS","ODS"],["Sostenibilidad","Enfoque de sostenibilidad"],["MideImpacto","Medición de impacto"]
    ]],
    ["Anexos",[
      ["VideoPitchURL","Video pitch"],["EvidenciasURL","Evidencias"],["Anexo1URL","Anexo"]
    ]]
  ];
  const longKeys = new Set(["EnfoqueDetalle","TRLDetalle","CRLDetalle","BRLDetalle","TecnologiaPropia","Complejidad","EntornoPrueba","Brecha","EvidenciasTecnicas","EvidenciasConcretas","TRLValidacionTexto","ProblemaDescripcion","IdentificacionProblema","ValidacionProblema","RetoPrincipal","ClienteTipo","EvidenciaInteres","TamanoMercado","Competencia","Diferenciacion","AliadosEstrategicos","PropuestaValor","PropuestaValorEstructura","NumerosNegocio","FreedomToOperate","Regulatorio","RolesEquipo","ExperienciaPrevia","EquipoRazon","Sostenibilidad","MideImpacto"]);

  document.getElementById("themeBtn")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("s2v_mentor_theme", next); } catch(e) {}
  });
  try { const t=localStorage.getItem("s2v_mentor_theme"); if(t) document.documentElement.dataset.theme=t; } catch(e){}

  function invalid(title="Enlace de acceso requerido", text="Esta vista solo está disponible mediante el enlace individual asignado al mentor.") {
    app.innerHTML = `<section class="access-state"><p class="eyebrow">SCIENCE2VENTURE · MENTOR VIEW</p><h1>${esc(title)}</h1><p>${esc(text)}</p><p class="notice">No hay formulario de ingreso ni listado de mentores en esta pantalla.</p></section>`;
  }

  async function load() {
    if(!/^[a-f0-9]{32}$/i.test(access)) return invalid();
    try {
      const res = await fetch(`./data/${encodeURIComponent(access)}.json`, {cache:"no-store"});
      if(!res.ok) throw new Error("invalid");
      state.data = await res.json();
      if(!state.data?.mentor || !Array.isArray(state.data.projects)) throw new Error("invalid");
      state.filtered = [...state.data.projects];
      renderPortfolio();
      if(location.hash.startsWith("#project=")) {
        const id=decodeURIComponent(location.hash.slice(9));
        const project=state.data.projects.find(p=>p.id===id);
        if(project) openProject(project,false);
      }
    } catch(e) { invalid("Enlace no válido","El enlace no corresponde a un acceso activo de Mentor View."); }
  }

  function renderPortfolio() {
    const d=state.data,m=d.mentor;
    const fundedCount=d.projects.filter(p=>p.result?.fundingAssigned).length;
    const fundingTotal=d.projects.reduce((sum,p)=>sum+(Number(p.result?.fundingAmount)||0),0);
    const people=new Set();
    d.projects.forEach(p=>(p.result?.team||[]).forEach(t=>{ if(t?.name) people.add(clean(t.name).toLowerCase()); }));
    app.innerHTML=`<section class="portfolio">
      <article class="mentor-banner">
        <div class="mentor-banner-main"><div class="avatar">${esc(m.initials||initials(m.name))}</div><div><p class="eyebrow">SCIENCE2VENTURE · COHORTE I 2026</p><h1>${esc(m.name)}</h1><p>Portafolio de iniciativas asignadas para acompañamiento. La vista conserva la lógica de SelectionHub, organizada para lectura de mentoría.</p></div></div>
        <div class="mentor-banner-kpis">
          <div class="mentor-kpi"><span>Iniciativas</span><strong>${d.initiativeCount}</strong><small>asignadas</small></div>
          <div class="mentor-kpi"><span>Financiadas</span><strong>${fundedCount}</strong><small>con valor definido</small></div>
          <div class="mentor-kpi funding"><span>Recursos</span><strong>${fundingTotal ? esc(moneyCompact(fundingTotal)) : "—"}</strong><small>${fundingTotal?esc(money(fundingTotal)):"sin asignación"}</small></div>
          <div class="mentor-kpi"><span>Equipo</span><strong>${people.size}</strong><small>personas registradas</small></div>
        </div>
      </article>
      <div class="toolbar"><div class="field search"><label>Buscar iniciativa</label><input id="searchInput" type="search" placeholder="Nombre, sector, enfoque o contacto"></div></div>
      <div id="projectGrid" class="project-grid"></div>
      <p class="footer-note">SelectionHub · Mentor View · Science2Venture 2026</p>
    </section>`;
    document.getElementById("searchInput")?.addEventListener("input", applyFilters);
    renderCards();
  }

  function applyFilters() {
    const q=clean(document.getElementById("searchInput")?.value).toLowerCase();
    state.filtered=state.data.projects.filter(p=>{
      const r=p.result||{};
      const team=(r.team||[]).map(t=>[t.name,t.email,t.phone].join(" ")).join(" ");
      const hay=[p.name,r.sector,r.category,r.shortDescription,team].map(clean).join(" ").toLowerCase();
      return !q||hay.includes(q);
    });
    renderCards();
  }

  function fundingBadge(r) {
    if(r?.fundingAssigned) return `<span class="badge funding-yes">FINANCIACIÓN · ${esc(money(r.fundingAmount))}</span>`;
    return `<span class="badge funding-no">SIN FINANCIACIÓN ASIGNADA</span>`;
  }

  function renderCards() {
    const grid=document.getElementById("projectGrid"); if(!grid) return;
    if(!state.filtered.length){grid.innerHTML=`<div class="empty-filter">No hay iniciativas que coincidan con esta búsqueda.</div>`;return;}
    grid.innerHTML=state.filtered.map(p=>{
      const r=p.result||{}, a=p.application||{}, team=Array.isArray(r.team)?r.team:[];
      const leader=team.find(t=>t.leader==="Sí")||team[0]||{};
      const declared=r.trlDeclared||a.TRLDeclarado||"—";
      const validated=r.trlValidatedByUnit||r.trlValidated||a.TRLValidado||"—";
      return `<article class="project-card selection-card" data-project="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)}">
        <div class="badges">${fundingBadge(r)}${r.priority?`<span class="badge">${esc(r.priority)}</span>`:""}</div>
        <h2>${esc(p.name)}</h2>
        <p class="card-description">${esc(r.shortDescription||r.sourceDescription||r.description||"")}</p>
        <div class="selection-mini-grid">
          <div><span>Puntaje</span><strong>${r.platformScore??"—"}</strong></div>
          <div><span>TRL declarado</span><strong>${esc(declared)}</strong></div>
          <div><span>TRL validado</span><strong>${esc(validated)}</strong></div>
          <div><span>Financiación</span><strong>${r.fundingAssigned?esc(moneyCompact(r.fundingAmount)):"—"}</strong></div>
        </div>
        <div class="card-contact"><span>${esc(leader.name||a.NombreLider||"")}</span>${leader.email||a.CorreoLider?`<small>${esc(leader.email||a.CorreoLider)}</small>`:""}</div>
        <div class="card-footer"><span>${esc(r.sector||r.category||"")}</span><span class="view-link">VER EXPEDIENTE →</span></div>
      </article>`;
    }).join("");
    grid.querySelectorAll("[data-project]").forEach(card=>{
      const go=()=>{const p=state.data.projects.find(x=>x.id===card.dataset.project); if(p) openProject(p,true);};
      card.addEventListener("click",go); card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
    });
  }

  function openProject(p,push=true) {
    state.selected=p; state.activeTab="summary";
    if(push) history.pushState({project:p.id},"",`#project=${encodeURIComponent(p.id)}`);
    renderDetail(); window.scrollTo({top:0,behavior:"smooth"});
  }
  function backPortfolio(push=true){ state.selected=null; if(push) history.pushState({},"",location.pathname+location.search); renderPortfolio(); window.scrollTo({top:0,behavior:"smooth"}); }
  window.addEventListener("popstate",()=>{
    if(location.hash.startsWith("#project=")){ const id=decodeURIComponent(location.hash.slice(9)); const p=state.data?.projects?.find(x=>x.id===id); if(p){state.selected=p;renderDetail();return;} }
    if(state.data) backPortfolio(false);
  });

  function processHtml(r,a){
    const declared=r.trlDeclared||a?.TRLDeclarado||"—";
    const validated=r.trlValidatedByUnit||r.trlValidated||a?.TRLValidado||"—";
    const resultText=r.fundingAssigned?`Financiación · ${moneyCompact(r.fundingAmount)}`:"Sin financiación asignada";
    return `<section class="selection-process" aria-label="Proceso de selección">
      <div class="process-step"><span>01</span><div><small>POSTULACIÓN</small><strong>${esc(declared)}</strong><em>${esc(a?.FechaPostulacion||a?.EstadoPostulacion||"Recibida")}</em></div></div>
      <div class="process-arrow">→</div>
      <div class="process-step"><span>02</span><div><small>PANEL</small><strong>${r.platformScore??"—"} pts</strong><em>${esc(r.priority||"Evaluada")}</em></div></div>
      <div class="process-arrow">→</div>
      <div class="process-step"><span>03</span><div><small>REVISIÓN INSTITUCIONAL</small><strong>${esc(validated)}</strong><em>${r.trlValidatedByUnit?"Validado por UnIT":"Sin ajuste adicional"}</em></div></div>
      <div class="process-arrow">→</div>
      <div class="process-step ${r.fundingAssigned?"is-funded":""}"><span>04</span><div><small>RESULTADO</small><strong>${esc(resultText)}</strong><em>${r.fundingAssigned?esc(money(r.fundingAmount)):"Consolidado final"}</em></div></div>
    </section>`;
  }

  function projectKpis(r,a){
    const team=Array.isArray(r.team)?r.team:[];
    const declared=r.trlDeclared||a?.TRLDeclarado||"—";
    const validated=r.trlValidatedByUnit||r.trlValidated||a?.TRLValidado||"—";
    return `<div class="project-kpis selection-kpis">
      <div class="project-kpi"><span>Puntaje SelectionHub</span><strong>${r.platformScore??"—"}</strong></div>
      <div class="project-kpi"><span>TRL declarado</span><strong>${esc(declared)}</strong></div>
      <div class="project-kpi"><span>TRL validado</span><strong>${esc(validated)}</strong></div>
      <div class="project-kpi ${r.fundingAssigned?"is-funded":""}"><span>Financiación</span><strong>${r.fundingAssigned?esc(moneyCompact(r.fundingAmount)):"Sin asignación"}</strong></div>
      <div class="project-kpi"><span>Prioridad</span><strong>${esc(r.priority||"—")}</strong></div>
      <div class="project-kpi"><span>Equipo registrado</span><strong>${team.length||"—"} integrante${team.length===1?"":"s"}</strong></div>
    </div>`;
  }

  function renderDetail(){
    const p=state.selected,r=p.result||{},a=p.application||{},m=state.data.mentor;
    app.innerHTML=`<section class="detail-view">
      <button class="back-btn" id="backBtn" type="button">← Mis iniciativas</button>
      <article class="detail-shell">
        <header class="detail-head"><p class="eyebrow">MENTOR · ${esc(m.name)}</p><h1>${esc(p.name)}</h1><div class="detail-meta">${fundingBadge(r)}${r.trlValidatedByUnit?`<span class="badge">${esc(r.trlValidatedByUnit)} · validado</span>`:""}${r.sector?`<span class="badge">${esc(r.sector)}</span>`:""}</div>${projectKpis(r,a)}</header>${processHtml(r,a)}
        <nav class="tabs" aria-label="Secciones de iniciativa">
          ${[["summary","01 · RESUMEN"],["application","02 · POSTULACIÓN"],["panel","03 · EVALUACIÓN DEL PANEL"],["unit","04 · REVISIÓN INSTITUCIONAL"],["result","05 · RESULTADO"],["tools","06 · BANCO DE HERRAMIENTAS"]].map(([id,l])=>`<button type="button" class="tab-btn ${id===state.activeTab?"active":""}" data-tab="${id}">${l}</button>`).join("")}
        </nav>
        <div class="tab-content" id="tabContent"></div>
      </article>
      <p class="footer-note">Este enlace contiene únicamente las iniciativas asignadas a ${esc(m.name)}.</p>
    </section>`;
    document.getElementById("backBtn").addEventListener("click",()=>backPortfolio(true));
    document.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>{state.activeTab=btn.dataset.tab;renderActiveTab();}));
    renderActiveTab();
  }

  function renderActiveTab(){
    document.querySelectorAll("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===state.activeTab));
    const c=document.getElementById("tabContent"),p=state.selected,r=p.result||{},a=p.application;
    if(state.activeTab==="summary") c.innerHTML=summaryHtml(r,a);
    if(state.activeTab==="application") c.innerHTML=applicationHtml(a);
    if(state.activeTab==="panel") c.innerHTML=panelHtml(r);
    if(state.activeTab==="unit") c.innerHTML=unitHtml(r);
    if(state.activeTab==="result") c.innerHTML=resultHtml(r);
    if(state.activeTab==="tools") c.innerHTML=toolsHtml();
  }

  function teamContext(t){
    const raw=[t.link,t.educationLevel,t.modality,t.undergrad,t.undergradOther,t.postgrad,t.postgradOther,t.area,t.faculty,t.external,t.education].filter(x=>!empty(x));
    const seen=new Set(); return raw.filter(x=>{const k=clean(x).toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true;});
  }

  function teamHtml(r){
    const team=Array.isArray(r.team)?r.team.filter(t=>t&&t.name):[];
    if(!team.length) return `<p class="muted-empty">No se registró información de integrantes en esta sección.</p>`;
    return `<div class="team-grid">${team.map(t=>{
      const context=teamContext(t);
      return `<article class="person-card">
        <div class="person-top"><div class="person-avatar">${esc(initials(t.name))}</div><div class="person-id"><div class="person-name-row"><h4>${esc(t.name)}</h4>${t.leader==="Sí"?`<span class="leader-chip">LÍDER</span>`:""}</div><p>${esc(t.role||"Integrante")}</p></div></div>
        ${context.length?`<div class="person-context">${context.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}
        <div class="person-actions">${mailLink(t.email)}${phoneLink(t.phone)}${!t.email&&!t.phone?`<span class="contact-muted">Sin datos de contacto registrados</span>`:""}</div>
      </article>`;
    }).join("")}</div>`;
  }

  function leaderContactHtml(r,a){
    const team=Array.isArray(r.team)?r.team:[];
    const t=team.find(x=>x.leader==="Sí")||team[0]||{};
    const name=clean(t.name||a?.NombreLider), role=clean(t.role||a?.RolLider), email=clean(t.email||a?.CorreoLider), phone=clean(t.phone||a?.TelefonoLider), city=clean(t.city||a?.Ciudad), link=clean(t.link||a?.Vinculacion);
    if(!name&&!email&&!phone) return `<p class="muted-empty">No se registró un contacto principal.</p>`;
    return `<div class="lead-contact"><div class="lead-avatar">${esc(initials(name))}</div><div class="lead-copy"><strong>${esc(name)}</strong>${role?`<span>${esc(role)}</span>`:""}${link?`<small>${esc(link)}</small>`:""}</div><div class="lead-actions">${mailLink(email)}${phoneLink(phone)}${city?`<span class="contact-action static"><span>⌖</span>${esc(city)}</span>`:""}</div></div>`;
  }

  function summaryHtml(r,a){
    const what = r.sourceDescription||r.description||a?.DescripcionCorta||"";
    const problem = a?.ProblemaDescripcion||r.problem||"";
    const proposal = a?.PropuestaValor||a?.PropuestaValorEstructura||r.valueProposition||"";
    const challenge = a?.RetoPrincipal||r.followUpSummary||"";
    const declared=r.trlDeclared||a?.TRLDeclarado||"—";
    const validated=r.trlValidatedByUnit||r.trlValidated||a?.TRLValidado||"—";
    const quick=[["Código",a?.IDIniciativa||r.id],["Sector",r.sector||r.category],["Año de inicio",a?.AnoInicio||r.yearStarted],["Ventas",r.hasSales?"Sí":"No / no reportadas"],["TRL",`${declared} → ${validated}`],["Puntaje",r.platformScore??"—"]].filter(([,v])=>!empty(v));
    return `<div class="executive-summary selection-summary">
      <section class="summary-main-card"><span class="section-kicker">LECTURA EJECUTIVA</span><h2>¿Qué hace la iniciativa?</h2><p>${esc(what||"No se registró información en esta sección.")}</p></section>
      <aside class="summary-side">
        <article class="funding-summary ${r.fundingAssigned?"is-funded":""}"><span>RESULTADO DE FINANCIACIÓN</span><strong>${esc(fundingLabel(r))}</strong><b>${r.fundingAssigned?esc(money(r.fundingAmount)):"—"}</b></article>
        <article class="contact-summary"><span>CONTACTO DEL EQUIPO</span>${leaderContactHtml(r,a)}</article>
      </aside>
      <section class="quick-facts">${quick.map(([l,v])=>`<div><span>${esc(l)}</span><strong>${esc(v)}</strong></div>`).join("")}</section>
      <section class="summary-pair"><article><span class="section-kicker">PROBLEMA</span><h3>Necesidad que aborda</h3><p>${esc(problem||"No se registró información en esta sección.")}</p></article><article><span class="section-kicker">PROPUESTA DE VALOR</span><h3>Solución planteada</h3><p>${esc(proposal||"No se registró información en esta sección.")}</p></article></section>
      ${challenge?`<section class="challenge-card"><span class="section-kicker">RETO PRINCIPAL</span><h3>Lo que el equipo espera resolver</h3><p>${esc(challenge)}</p></section>`:""}
      <section class="team-section"><div class="section-headline"><div><span class="section-kicker">EQUIPO REGISTRADO</span><h2>Integrantes y datos de contacto</h2></div><span class="team-count">${Array.isArray(r.team)?r.team.length:0} integrantes</span></div>${teamHtml(r)}</section>
    </div>`;
  }

  function applicationHtml(a){
    if(!a) return `<div class="notice">No se registró información en esta sección dentro de los datos de postulación disponibles en SelectionHub.</div>`;
    const groups=fieldGroups.map(([title,fields])=>{
      const rows=fields.filter(([k])=>!empty(a[k])).map(([k,label])=>{
        const long=longKeys.has(k)||clean(a[k]).length>180||Array.isArray(a[k]);
        return `<article class="app-field ${long?"full":""}"><span>${esc(label)}</span><div>${valueHtml(a[k])}</div></article>`;
      }).join("");
      if(!rows) return "";
      return `<section class="app-section-card"><div class="app-section-head"><h3>${esc(title)}</h3><span>RESPUESTA DEL EQUIPO</span></div><div class="app-field-grid">${rows}</div></section>`;
    }).join("");
    return `<div class="application-intro"><div><span class="section-kicker">POSTULACIÓN ORIGINAL</span><h2>Información registrada por el equipo</h2></div><p>Contenido organizado por bloques para facilitar la lectura durante el acompañamiento.</p></div><div class="application-groups">${groups||'<div class="notice">No se registró información en esta sección.</div>'}</div>`;
  }

  function panelHtml(r){
    const comments=[r.observation1,r.observation2].map(stripInternalNotes).filter(Boolean);
    const metrics=[["Puntaje global",r.platformScore],["Prioridad",r.priority],["Posición general",r.overallOrder],["Posición en grupo",r.routeRank]].filter(([,v])=>!empty(v));
    return `<div class="eval-stack">
      ${metrics.length?`<div class="result-grid panel-metrics">${metrics.map(([l,v],i)=>`<div class="result-item ${i===0?"accent":""}"><span>${esc(l)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>`:""}
      ${stripInternalNotes(r.evaluationSummary)?`<article class="eval-block"><span class="source-label panel-src">SÍNTESIS DE EVALUACIÓN</span><h3>Lectura del panel</h3><p>${esc(stripInternalNotes(r.evaluationSummary))}</p></article>`:""}
      ${comments.map((x,i)=>`<article class="eval-block"><span class="source-label panel-src">EVALUACIÓN DEL PANEL</span><h3>${comments.length>1?`Comentario ${i+1}`:"Comentario técnico"}</h3><p>${esc(x)}</p></article>`).join("")}
      ${!comments.length&&!metrics.length&&!r.evaluationSummary?`<div class="notice">No se registró información en esta sección.</div>`:""}
    </div>`;
  }

  function unitHtml(r){
    const cc=(Array.isArray(r.coordinationComments)?r.coordinationComments:[]).map(x=>({...x,text:stripInternalNotes(x?.text)})).filter(x=>x.text);
    const adjustment=clean(r.routeAdjustment);
    const showAdjustment=adjustment && !/founder|construye|ruta\s*[1-4]|trl\s*\d\s*[–-]\s*\d/i.test(adjustment);
    const declared=r.trlDeclared||"—", validated=r.trlValidatedByUnit||r.trlValidated||"—";
    return `<div class="eval-stack">
      <div class="trl-comparison"><div><span>TRL declarado</span><strong>${esc(declared)}</strong></div><div class="trl-arrow">→</div><div class="validated"><span>TRL validado</span><strong>${esc(validated)}</strong></div></div>
      ${stripInternalNotes(r.teamObservations)?`<article class="eval-block"><span class="source-label unit-src">REVISIÓN INSTITUCIONAL</span><h3>Observaciones técnicas</h3><p>${esc(stripInternalNotes(r.teamObservations))}</p></article>`:""}
      ${showAdjustment?`<article class="eval-block"><span class="source-label unit-src">REVISIÓN INSTITUCIONAL / UNIT</span><h3>Ajuste registrado</h3><p>${esc(adjustment)}</p></article>`:""}
      ${cc.length?`<article class="eval-block"><span class="source-label">COORDINACIÓN SCIENCE2VENTURE</span><h3>Comentarios de coordinación</h3>${cc.map(x=>`<p>${esc(x.text||"")}${x.date?`\n\n${esc(x.date)}`:""}</p>`).join("<hr>")}</article>`:""}
      ${!stripInternalNotes(r.teamObservations)&&!showAdjustment&&!cc.length?`<div class="notice">No se registraron observaciones adicionales después de la validación institucional.</div>`:""}
    </div>`;
  }

  function resultHtml(r){
    const funded=!!r.fundingAssigned;
    const action=stripInternalNotes(r.action), decision=stripInternalNotes(r.decisionSummary), notes=stripInternalNotes(r.notes);
    const showAction=!!action;
    const showDecision=!!decision;
    return `<div class="result-executive">
      <section class="funding-result ${funded?"is-funded":""}"><span class="section-kicker">RESULTADO CONSOLIDADO</span><div class="funding-result-grid"><div><span>Estado</span><strong>${esc(fundingLabel(r))}</strong></div><div><span>Valor asignado</span><strong>${funded?esc(money(r.fundingAmount)):"—"}</strong></div><div><span>Puntaje</span><strong>${r.platformScore??"—"}</strong></div><div><span>TRL validado</span><strong>${esc(r.trlValidatedByUnit||r.trlValidated||"—")}</strong></div><div><span>Prioridad</span><strong>${esc(r.priority||"—")}</strong></div><div><span>Mentor</span><strong>${esc(state.data.mentor.name)}</strong></div></div>${funded?`<p>La iniciativa cuenta con un valor numérico de financiación definido en el consolidado final.</p>`:`<p>No se registra un valor numérico de financiación asignado en el consolidado final.</p>`}</section>
      ${showAction||showDecision||notes?`<section class="result-followup"><span class="section-kicker">SEGUIMIENTO</span><h3>Observaciones vigentes</h3>${showDecision?`<p>${esc(decision)}</p>`:""}${showAction?`<p><b>Acción:</b> ${esc(action)}</p>`:""}${notes?`<p>${esc(notes)}</p>`:""}</section>`:""}
    </div>`;
  }

  function toolsHtml(){
    const tools=[
      ["Guías de acompañamiento","Materiales para orientar las sesiones de mentoría y seguimiento."],
      ["Formatos de seguimiento","Recursos para documentar avances, acuerdos y próximos pasos."],
      ["Validación y mercado","Herramientas para apoyar experimentos, entrevistas y lectura de mercado."],
      ["Pitch y narrativa","Recursos para estructurar mensajes, presentaciones y conversaciones clave."],
      ["Recursos del programa","Enlaces, espacios y materiales habilitados durante Science2Venture."]
    ];
    return `<section class="tool-bank"><div class="tool-bank-head"><div class="tool-bank-icon">↗</div><div><span class="source-label">BANCO DE HERRAMIENTAS</span><h2>Recursos para el acompañamiento</h2><p>En este espacio encontrarán los recursos, enlaces y herramientas de apoyo para el acompañamiento de las iniciativas.</p></div></div><div class="tool-grid">${tools.map(([t,d])=>`<article class="tool-card"><span>PRÓXIMAMENTE</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div><div class="notice">Los enlaces y recursos se habilitarán progresivamente durante el programa.</div></section>`;
  }

  load();
})();
