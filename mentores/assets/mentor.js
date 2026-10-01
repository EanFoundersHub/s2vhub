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
    if (/^https?:\/\//i.test(s)) return `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(s)}</a>`;
    return esc(s);
  };
  const money = v => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return "";
    return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
  };
  const fundingLabel = r => r?.fundingAssigned ? "Recibirá financiación" : "Sin financiación asignada";
  const mailLink = v => empty(v) ? "" : `<a class="contact-link" href="mailto:${esc(clean(v))}">${esc(clean(v))}</a>`;
  const phoneLink = v => {
    if (empty(v)) return "";
    const raw=clean(v), tel=raw.replace(/[^\d+]/g,"");
    return `<a class="contact-link" href="tel:${esc(tel)}">${esc(raw)}</a>`;
  };

  const fieldGroups = [
    ["Identificación del proyecto",[
      ["IDIniciativa","Código de iniciativa"],["EstadoPostulacion","Estado de postulación"],["FechaPostulacion","Fecha de postulación"],
      ["NombreLider","Líder / contacto principal"],["CorreoLider","Correo de contacto"],["TelefonoLider","Teléfono de contacto"],
      ["Ciudad","Ciudad"],["Vinculacion","Vinculación"],["Modalidad","Modalidad"],["Enfoque","Enfoque"],
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
    ["Problema",[
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
      ["Recursos6m","Uso de recursos a 6 meses"],["BuscaInversion","¿Busca inversión?"]
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

  document.getElementById("themeBtn")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("s2v_mentor_theme", next); } catch(e) {}
  });
  try { const t=localStorage.getItem("s2v_mentor_theme"); if(t) document.documentElement.dataset.theme=t; } catch(e){}

  function invalid(title="Enlace de acceso requerido", text="Esta vista solo está disponible mediante el enlace individual asignado al mentor.") {
    app.innerHTML = `<section class="access-state">
      <p class="eyebrow">SCIENCE2VENTURE · MENTOR VIEW</p>
      <h1>${esc(title)}</h1>
      <p>${esc(text)}</p>
      <p class="notice">No hay formulario de ingreso ni listado de mentores en esta pantalla.</p>
    </section>`;
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
    } catch(e) {
      invalid("Enlace no válido","El enlace no corresponde a un acceso activo de Mentor View.");
    }
  }

  function renderPortfolio() {
    const d=state.data,m=d.mentor;
    const fundedCount=d.projects.filter(p=>p.result?.fundingAssigned).length;
    const fundingTotal=d.projects.reduce((sum,p)=>sum+(Number(p.result?.fundingAmount)||0),0);
    app.innerHTML=`<section class="portfolio">
      <div class="mentor-hero">
        <article class="hero-main">
          <div class="avatar">${esc(m.initials||"S2V")}</div>
          <div>
            <p class="eyebrow">SCIENCE2VENTURE · COHORTE I 2026</p>
            <h1>${esc(m.name)}</h1>
            <p>Iniciativas asignadas para acompañamiento en la Cohorte I.</p>
          </div>
        </article>
        <aside class="hero-stats">
          <div class="stat"><strong>${d.initiativeCount}</strong><span>INICIATIVAS</span></div>
          <div class="stat"><strong>${fundedCount}</strong><span>CON FINANCIACIÓN</span></div>
          <div class="stat"><strong>${fundingTotal ? esc(money(fundingTotal).replace(",00","")) : "—"}</strong><span>FINANCIACIÓN ASIGNADA</span></div>
        </aside>
      </div>
      <div class="toolbar">
        <div class="field search"><label>Buscar iniciativa</label><input id="searchInput" type="search" placeholder="Nombre, sector o enfoque"></div>
      </div>
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
      const hay=[p.name,r.sector,r.category,r.shortDescription].map(clean).join(" ").toLowerCase();
      return !q||hay.includes(q);
    });
    renderCards();
  }

  function fundingBadge(r) {
    if(r?.fundingAssigned) {
      return `<span class="badge funding-yes">FINANCIACIÓN · ${esc(money(r.fundingAmount).replace(",00",""))}</span>`;
    }
    return `<span class="badge funding-no">SIN FINANCIACIÓN ASIGNADA</span>`;
  }

  function renderCards() {
    const grid=document.getElementById("projectGrid"); if(!grid) return;
    if(!state.filtered.length){grid.innerHTML=`<div class="empty-filter">No hay iniciativas que coincidan con esta búsqueda.</div>`;return;}
    grid.innerHTML=state.filtered.map(p=>{
      const r=p.result||{};
      return `<article class="project-card" data-project="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)}">
        <div class="badges">
          ${fundingBadge(r)}
          ${r.trlValidatedByUnit?`<span class="badge">${esc(r.trlValidatedByUnit)}</span>`:""}
        </div>
        <h2>${esc(p.name)}</h2>
        <p class="card-description">${esc(r.shortDescription||r.sourceDescription||r.description||"")}</p>
        <div class="card-footer"><span>${esc(r.sector||r.category||"")}</span><span class="view-link">VER INICIATIVA →</span></div>
      </article>`;
    }).join("");
    grid.querySelectorAll("[data-project]").forEach(card=>{
      const go=()=>{const p=state.data.projects.find(x=>x.id===card.dataset.project); if(p) openProject(p,true);};
      card.addEventListener("click",go);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go();}});
    });
  }

  function openProject(p,push=true) {
    state.selected=p; state.activeTab="summary";
    if(push) history.pushState({project:p.id},"",`#project=${encodeURIComponent(p.id)}`);
    renderDetail();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function backPortfolio(push=true){
    state.selected=null;
    if(push) history.pushState({},"",location.pathname+location.search);
    renderPortfolio(); window.scrollTo({top:0,behavior:"smooth"});
  }
  window.addEventListener("popstate",()=>{
    if(location.hash.startsWith("#project=")){
      const id=decodeURIComponent(location.hash.slice(9));
      const p=state.data?.projects?.find(x=>x.id===id);
      if(p){state.selected=p;renderDetail();return;}
    }
    if(state.data) backPortfolio(false);
  });

  function renderDetail(){
    const p=state.selected,r=p.result||{},m=state.data.mentor;
    app.innerHTML=`<section class="detail-view">
      <button class="back-btn" id="backBtn" type="button">← Mis iniciativas</button>
      <article class="detail-shell">
        <header class="detail-head">
          <p class="eyebrow">MENTOR · ${esc(m.name)}</p>
          <h1>${esc(p.name)}</h1>
          <div class="detail-meta">
            ${fundingBadge(r)}
            ${r.trlValidatedByUnit?`<span class="badge">${esc(r.trlValidatedByUnit)} · validado por UnIT</span>`:""}
            ${r.sector?`<span class="badge">${esc(r.sector)}</span>`:""}
          </div>
        </header>
        <nav class="tabs" aria-label="Secciones de iniciativa">
          ${[
            ["summary","01 · RESUMEN"],["application","02 · POSTULACIÓN"],["panel","03 · EVALUACIÓN DEL PANEL"],
            ["unit","04 · REVISIÓN INSTITUCIONAL"],["result","05 · RESULTADO"],["tools","06 · BANCO DE HERRAMIENTAS"]
          ].map(([id,l])=>`<button type="button" class="tab-btn ${id===state.activeTab?"active":""}" data-tab="${id}">${l}</button>`).join("")}
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

  function teamHtml(r){
    const team=Array.isArray(r.team)?r.team.filter(t=>t&&t.name):[];
    if(!team.length) return `<p class="muted-empty">No se registró información de integrantes en esta sección.</p>`;
    return `<div class="team-list">${team.map(t=>{
      const role=[t.role,t.link].filter(x=>!empty(x)).join(" · ");
      const contacts=[mailLink(t.email),phoneLink(t.phone)].filter(Boolean).join(`<span class="contact-sep">·</span>`);
      return `<div class="team-row">
        <div class="person-main"><b>${esc(t.name)}</b>${role?`<span>${esc(role)}</span>`:""}</div>
        <div class="person-contact">${contacts||`<span class="contact-muted">Sin datos de contacto registrados</span>`}</div>
      </div>`;
    }).join("")}</div>`;
  }

  function leaderContactHtml(a){
    if(!a) return `<p class="muted-empty">No se registró un contacto principal.</p>`;
    const name=clean(a.NombreLider), role=clean(a.RolLider), email=clean(a.CorreoLider), phone=clean(a.TelefonoLider), city=clean(a.Ciudad);
    if(!name&&!email&&!phone) return `<p class="muted-empty">No se registró un contacto principal.</p>`;
    return `<div class="contact-card-body">
      ${name?`<strong>${esc(name)}</strong>`:""}
      ${role?`<span class="contact-role">${esc(role)}</span>`:""}
      <div class="contact-stack">
        ${email?`<div><span class="contact-key">Correo</span>${mailLink(email)}</div>`:""}
        ${phone?`<div><span class="contact-key">Teléfono</span>${phoneLink(phone)}</div>`:""}
        ${city?`<div><span class="contact-key">Ciudad</span><span>${esc(city)}</span></div>`:""}
      </div>
    </div>`;
  }

  function summaryHtml(r,a){
    const what = r.sourceDescription||r.description||a?.DescripcionCorta||"";
    const problem = a?.ProblemaDescripcion||r.problem||"";
    const proposal = a?.PropuestaValor||a?.PropuestaValorEstructura||r.valueProposition||"";
    const trl = r.trlValidatedByUnit||r.trlValidated||a?.TRLDeclarado||"TRL sin dato";
    return `<div class="reading-grid">
      <article class="reading-card full"><span class="source-label">RESPUESTA DEL EQUIPO / DATOS DE POSTULACIÓN</span><h3>Qué hace</h3><p>${esc(what||"No se registró información en esta sección.")}</p></article>
      <article class="reading-card"><span class="source-label">RESPUESTA DEL EQUIPO</span><h3>Problema</h3><p>${esc(problem||"No se registró información en esta sección.")}</p></article>
      <article class="reading-card"><span class="source-label">RESPUESTA DEL EQUIPO</span><h3>Propuesta</h3><p>${esc(proposal||"No se registró información en esta sección.")}</p></article>
      <article class="reading-card"><span class="source-label unit-src">MADUREZ TECNOLÓGICA</span><h3>Estado</h3><p>${esc(trl)}</p></article>
      <article class="reading-card funding-card ${r.fundingAssigned?"is-funded":"not-funded"}"><span class="source-label result-src">FINANCIACIÓN</span><h3>${esc(fundingLabel(r))}</h3><p>${r.fundingAssigned?esc(money(r.fundingAmount).replace(",00","")):"No se registra un valor de financiación asignado en el consolidado."}</p></article>
      <article class="reading-card contact-card"><span class="source-label">CONTACTO PRINCIPAL</span><h3>Datos de contacto</h3>${leaderContactHtml(a)}</article>
      <article class="reading-card team-card"><span class="source-label">EQUIPO</span><h3>Integrantes</h3>${teamHtml(r)}</article>
    </div>`;
  }

  function applicationHtml(a){
    if(!a) return `<div class="notice">No se registró información en esta sección dentro de los datos de postulación disponibles en SelectionHub.</div>`;
    const groups=fieldGroups.map(([title,fields])=>{
      const rows=fields.filter(([k])=>!empty(a[k])).map(([k,label])=>`<article class="response"><h4>${esc(label)}</h4><div class="value">${valueHtml(a[k])}</div></article>`).join("");
      if(!rows) return "";
      return `<details class="app-group" ${title==="Identificación del proyecto"?"open":""}><summary><span>${esc(title)}</span><span class="source-label">RESPUESTA DEL EQUIPO</span></summary><div class="app-group-body">${rows}</div></details>`;
    }).join("");
    return `<div class="application-groups">${groups||'<div class="notice">No se registró información en esta sección.</div>'}</div>`;
  }

  function panelHtml(r){
    const one=clean(r.observation1),two=clean(r.observation2);
    return `<div class="eval-stack">
      ${r.platformScore!==null&&r.platformScore!==undefined?`<div class="result-grid"><div class="result-item"><span>Puntaje global</span><strong>${esc(r.platformScore)}</strong></div></div>`:""}
      ${one?`<article class="eval-block"><span class="source-label panel-src">EVALUACIÓN DEL PANEL</span><h3>Evaluación 1</h3><p>${esc(one)}</p></article>`:""}
      ${two?`<article class="eval-block"><span class="source-label panel-src">EVALUACIÓN DEL PANEL</span><h3>Evaluación 2</h3><p>${esc(two)}</p></article>`:""}
      ${!one&&!two?`<div class="notice">No se registró información en esta sección.</div>`:""}
    </div>`;
  }

  function unitHtml(r){
    const cc=Array.isArray(r.coordinationComments)?r.coordinationComments:[];
    return `<div class="eval-stack">
      ${r.trlValidatedByUnit?`<div class="result-grid"><div class="result-item"><span>TRL validado por UnIT</span><strong>${esc(r.trlValidatedByUnit)}</strong></div></div>`:""}
      ${r.routeAdjustment?`<article class="eval-block"><span class="source-label unit-src">REVISIÓN INSTITUCIONAL / UNIT</span><h3>Ajuste registrado</h3><p>${esc(r.routeAdjustment)}</p></article>`:""}
      ${cc.length?`<article class="eval-block"><span class="source-label">COORDINACIÓN SCIENCE2VENTURE</span><h3>Comentarios de coordinación</h3>${cc.map(x=>`<p>${esc(x.text||"")}${x.date?`\n\n${esc(x.date)}`:""}</p>`).join("<hr style='border:0;border-top:1px solid var(--border);margin:18px 0'>")}</article>`:""}
      ${!r.trlValidatedByUnit&&!r.routeAdjustment&&!cc.length?`<div class="notice">No se registró información en esta sección.</div>`:""}
    </div>`;
  }

  function resultHtml(r){
    const items=[
      ["Mentor",state.data.mentor.name],
      ["Financiación",fundingLabel(r)],
      ["Valor asignado",r.fundingAssigned?money(r.fundingAmount).replace(",00",""):"—"],
      ["Modalidad",r.modality],["Acción requerida",r.action]
    ].filter(([,v])=>!empty(v));
    return `<div class="eval-stack">
      <div class="result-grid">${items.map(([l,v])=>`<div class="result-item"><span>${esc(l)}</span><strong>${esc(v)}</strong></div>`).join("")}</div>
      ${r.decisionSummary?`<article class="eval-block"><span class="source-label result-src">RESULTADO FINAL</span><h3>Decisión / revisión</h3><p>${esc(r.decisionSummary)}</p></article>`:""}
      ${r.notes?`<article class="eval-block"><span class="source-label result-src">NOTA DE SEGUIMIENTO</span><h3>Nota</h3><p>${esc(r.notes)}</p></article>`:""}
    </div>`;
  }

  function toolsHtml(){
    return `<section class="tool-bank">
      <div class="tool-bank-icon" aria-hidden="true">↗</div>
      <span class="source-label">BANCO DE HERRAMIENTAS</span>
      <h2>Recursos para el acompañamiento</h2>
      <p>En este espacio encontrarán los espacios, recursos y herramientas de apoyo para el acompañamiento de las iniciativas.</p>
      <div class="notice">Los enlaces y recursos se habilitarán progresivamente durante el programa.</div>
    </section>`;
  }

  load();
})();