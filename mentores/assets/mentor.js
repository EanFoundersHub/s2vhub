(() => {
  "use strict";
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  const access = (params.get("access") || "").trim();
  const state = { data:null, filtered:[], selected:null, activeTab:"summary", workspaceTab:"home", activity:{docs:[],bitacoras:[]} };
  const BITACORA_URL = 'https://defaultc06fb5591b684b84a14f47d0d837a5.ab.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/111d5c434a8e4b809e196466d38a02a4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iVrvxbnltN1_GPun1u9Wi3gQixTF0KCyaA_CIQthb-Q';
  const DOCS_CONFIG = window.S2V_DOCS_CONFIG || {};
  const DOC_UPLOAD_URL = String(DOCS_CONFIG.uploadRequestUrl || "").trim();
  const DOC_SEARCH_URL = String(DOCS_CONFIG.searchPendingUrl || "").trim();
  const DOC_ASSOCIATE_URL = String(DOCS_CONFIG.associateFileUrl || "").trim();
  const DOC_TRACKING_URL = String(DOCS_CONFIG.trackingUrl || "").trim();
  const CURRENT_STAGE_NUMBER = Math.max(0, Math.min(5, Number(DOCS_CONFIG.currentStage ?? 0) || 0));

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
      state.activity = readMentorActivity();
      state.filtered = [...state.data.projects];
      renderPortfolio();
      syncTracking().catch(()=>{});
      if(location.hash === "#tools") {
        renderToolsHub(false);
      } else if(location.hash.startsWith("#project=")) {
        const id=decodeURIComponent(location.hash.slice(9));
        const project=state.data.projects.find(p=>p.id===id);
        if(project) openProject(project,false);
      }
    } catch(e) { invalid("Enlace no válido","El enlace no corresponde a un acceso activo de Mentor View."); }
  }

  function activityStorageKey(){ return `s2v_activity_${access}`; }

  function readMentorActivity(){
    try{
      const parsed=JSON.parse(localStorage.getItem(activityStorageKey())||"{}");
      return {
        docs:Array.isArray(parsed.docs)?parsed.docs.slice(0,120):[],
        bitacoras:Array.isArray(parsed.bitacoras)?parsed.bitacoras.slice(0,120):[]
      };
    }catch(e){ return {docs:[],bitacoras:[]}; }
  }

  function writeMentorActivity(){
    try{ localStorage.setItem(activityStorageKey(),JSON.stringify(state.activity||{docs:[],bitacoras:[]})); }catch(e){}
  }

  function recordMentorDoc(doc){
    state.activity=state.activity||{docs:[],bitacoras:[]};
    state.activity.docs=[{...doc,recordedAt:new Date().toISOString()},...(state.activity.docs||[])].slice(0,120);
    writeMentorActivity();
    updateStageTrackingViews();
  }

  function recordMentorBitacora(item){
    state.activity=state.activity||{docs:[],bitacoras:[]};
    state.activity.bitacoras=[{...item,recordedAt:new Date().toISOString()},...(state.activity.bitacoras||[])].slice(0,120);
    writeMentorActivity();
    updateStageTrackingViews();
  }

  async function syncTracking(){
    if(!DOC_TRACKING_URL) return;
    try{
      const response=await fetch(DOC_TRACKING_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","X-S2V-Access":access},body:JSON.stringify({mentor:clean(state.data?.mentor?.name)})});
      const raw=await response.text(); let result={};
      try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true) return;
      const docs=Array.isArray(result.archivos)?result.archivos.map(x=>({
        iniciativa:clean(x.Iniciativa??x.iniciativa),
        tipoDocumento:clean(x.TipoDocumento??x.tipoDocumento),
        nombreArchivo:clean(x.Nombre??x.nombreArchivo??x.FileLeafRef),
        fechaCarga:clean(x.Created??x.fechaCarga),
        recordedAt:clean(x.Modified??x.Created??x.fechaCarga)||new Date().toISOString(),
        server:true
      })):[];
      const bitacoras=Array.isArray(result.bitacoras)?result.bitacoras.map(x=>({
        iniciativa:clean(x.Iniciativa??x.iniciativa),
        fechaSesion:clean(x.FechaSesion??x.fechaSesion),
        etapa:clean(x.Etapa??x.etapa),
        etapaNumero:Number(x.EtapaNumero??x.etapaNumero??((clean(x.Etapa??x.etapa).match(/\\d+/)||[])[0])??0),
        sesionNumero:Number(x.SesionNumero??x.sesionNumero)||null,
        duracionHoras:Number(x.DuracionHoras??x.duracionHoras)||null,
        avances:clean(x.Avances??x.avances),
        compromisos:clean(x.Compromisos??x.compromisos),
        bitacoraId:clean(x.ID??x.Id??x.id??x.bitacoraId),
        recordedAt:clean(x.Modified??x.Created??x.fechaSesion)||new Date().toISOString(),
        server:true
      })):[];
      const hasDocuments = Array.isArray(result.archivos);
      const hasBitacoras = Array.isArray(result.bitacoras);
      if(hasDocuments || hasBitacoras){
        state.activity={
          docs:hasDocuments ? docs : state.activity.docs,
          bitacoras:hasBitacoras ? bitacoras : state.activity.bitacoras
        };
        writeMentorActivity();
        updateStageTrackingViews();
      }
    }catch(e){ console.warn("Seguimiento histórico no disponible",e); }
  }

  function activityForInitiative(name){
    const key=clean(name).toLowerCase();
    const docs=(state.activity?.docs||[]).filter(x=>clean(x.iniciativa).toLowerCase()===key);
    const bitacoras=(state.activity?.bitacoras||[]).filter(x=>clean(x.iniciativa).toLowerCase()===key);
    return {docs,bitacoras};
  }

  function validatedTrl(p){
    const r=p?.result||{},a=p?.application||{};
    return clean(r.trlValidatedByUnit||r.trlValidated||a.TRLValidado||r.trlDeclared||a.TRLDeclarado);
  }

  function routeBand(p){
    const trl=validatedTrl(p);
    const n=Number((trl.match(/\d+/)||[])[0]);
    if(n>=7) return "TRL 7–9";
    if(n>=4) return "TRL 4–6";
    if(n>=1) return "TRL 1–3";
    return "Ruta por validar";
  }

  const S2V_ROUTE = {
    weeks:"32 semanas",
    mentoringTotal:"12 h",
    stages:[
      {n:0,name:"Arranque y línea base",weeks:"Sem. 1–4",duration:"4 semanas",months:"OCTUBRE 2026",mentorHours:"2 h",hito:"Línea base + KPIs + plan individual + hitos técnico-comerciales."},
      {n:1,name:"Validación problema y cliente",weeks:"Sem. 5–10",duration:"6 semanas",months:"NOVIEMBRE – DICIEMBRE 2026",mentorHours:"2 h",hito:"20 a 50 validaciones en campo de problema, cliente/JTBD e ICP priorizados."},
      {n:2,name:"Validación propuesta de valor y oportunidad comercial",weeks:"Sem. 11–16",duration:"6 semanas",months:"ENERO – FEBRERO 2027",mentorHours:"2 h",hito:"Cliente/segmento priorizado + propuesta de valor revisada.",followup:"Seguimiento técnico 1 al cierre de la etapa."},
      {n:3,name:"Modelo de negocio y experimentación",weeks:"Sem. 17–22",duration:"6 semanas",months:"MARZO – ABRIL 2027",mentorHours:"2 h",hito:"Modelo de negocio definido + base financiera estructurada + aspectos legales priorizados."},
      {n:4,name:"GTM temprano, growth y lógica económica",weeks:"Sem. 22–27",duration:"6 semanas",months:"MAYO – JUNIO 2027",mentorHours:"2 h",hito:"PMV fortalecido + estrategia inicial de salida + criterios de tracción."},
      {n:5,name:"Impacto",weeks:"Sem. 27–32",duration:"6 semanas",months:"JULIO – AGOSTO 2027",mentorHours:"2 h",hito:"Sostenibilidad + narrativa de impacto + plan de trabajo a 6 meses.",followup:"Seguimiento técnico 2 y cierre de la ruta."}
    ]
  };

  function currentStageInfo(){
    return S2V_ROUTE.stages.find(x=>x.n===CURRENT_STAGE_NUMBER) || S2V_ROUTE.stages[0];
  }

  function nextStageInfo(){
    return S2V_ROUTE.stages.find(x=>x.n===CURRENT_STAGE_NUMBER+1) || null;
  }

  function bitacoraStageNumber(item){
    const raw=clean(item?.etapaNumero ?? item?.stageNumber ?? item?.etapa);
    const m=raw.match(/\d+/);
    return m ? Number(m[0]) : 0;
  }

  function mentorRoutesHtml(){
    return `<section class="roadmap-section">
      <div class="workspace-heading"><div><span>RUTA DE ACOMPAÑAMIENTO</span><h2>6 etapas · 32 semanas · 12 h de mentoría por iniciativa</h2><p>La misma ruta aplica a todas las iniciativas. Cada iniciativa recibe 2 horas de mentoría por etapa, distribuidas en 2 sesiones quincenales.</p></div></div>
      <div class="single-route-summary">
        <div><span>MENTORÍA POR ETAPA</span><strong>2 h</strong><small>2 sesiones · cada 15 días</small></div>
        <div><span>MENTORÍA POR INICIATIVA</span><strong>12 h</strong><small>6 etapas · 2 h por etapa</small></div>
        <div><span>DURACIÓN</span><strong>32 semanas</strong><small>Etapa 0: 4 semanas · demás: 6 semanas</small></div>
      </div>
      <div class="route-stage-list">
        ${S2V_ROUTE.stages.map((s,i)=>{
          const next=S2V_ROUTE.stages[i+1];
          return `<article class="route-stage ${s.n===CURRENT_STAGE_NUMBER?"is-current":""}">
            <div class="route-stage-number"><span>ETAPA</span><strong>E${s.n}</strong></div>
            <div class="route-stage-main"><span>${esc(s.weeks)} · ${esc(s.duration)}</span><h4>${esc(s.name)}</h4><span class="route-month-badge">${esc(s.months)}</span><p><b>Hito requerido:</b> ${esc(s.hito)}</p>${s.followup?`<em>${esc(s.followup)}</em>`:""}</div>
            <div class="route-stage-hours"><span>MENTORÍA</span><strong>${esc(s.mentorHours)}</strong><small>2 sesiones quincenales</small></div>
            <div class="route-stage-next"><span>${next?"QUÉ SIGUE":"CIERRE"}</span><strong>${next?`Etapa ${next.n}`:"Fin de ruta"}</strong><small>${next?esc(next.name):"Seguimiento final + próximos pasos"}</small></div>
          </article>`;
        }).join("")}
      </div>
    </section>`;
  }

  function bindRouteTabs(){}

  function projectRouteHtml(p){
    const s=currentStageInfo(), next=nextStageInfo();
    return `<section class="project-route-current">
      <div><span>ETAPA VIGENTE · SCIENCE2VENTURE</span><h3>Etapa ${s.n} · ${esc(s.name)}</h3><p><b>Hito:</b> ${esc(s.hito)}</p></div>
      <div class="project-route-kpi"><span>MENTORÍA ETAPA</span><strong>2 h</strong><small>por iniciativa · 2 sesiones</small></div>
      <div class="project-route-kpi"><span>${next?"SIGUE":"CIERRE"}</span><strong>${next?`Etapa ${next.n}`:"Fin de ruta"}</strong><small>${next?esc(next.name):"Seguimiento final"}</small></div>
    </section>`;
  }

  function stageProjectListHtml(){
    return (state.data?.projects||[]).map(p=>{
      const a=activityForInitiative(p.name);
      const hasPlan=a.docs.some(x=>clean(x.tipoDocumento).toLowerCase()==="plan de trabajo");
      const hasDiag=a.docs.some(x=>clean(x.tipoDocumento).toLowerCase()==="diagnóstico");
      const stageBitacoras=a.bitacoras.filter(x=>bitacoraStageNumber(x)===CURRENT_STAGE_NUMBER);
      const bitaDone=stageBitacoras.length>=2;
      return `<article class="stage-project-row">
        <div class="stage-project-main"><strong>${esc(p.name)}</strong><small>TRL validado: ${esc(validatedTrl(p)||"Por validar")}</small></div>
        <div class="stage-check ${hasDiag?"is-done":""}"><span>${hasDiag?"✓":"○"}</span><div><b>Diagnóstico</b><small>${hasDiag?(DOC_TRACKING_URL?"Registrado":"Visible en este dispositivo"):"Pendiente"}</small></div></div>
        <div class="stage-check ${hasPlan?"is-done":""}"><span>${hasPlan?"✓":"○"}</span><div><b>Plan de trabajo</b><small>${hasPlan?(DOC_TRACKING_URL?"Registrado":"Visible en este dispositivo"):"Pendiente"}</small></div></div>
        <div class="stage-check ${bitaDone?"is-done":""}"><span>${bitaDone?"✓":"○"}</span><div><b>Bitácoras · E${CURRENT_STAGE_NUMBER}</b><small>${Math.min(stageBitacoras.length,2)} / 2 sesiones registradas</small></div></div>
      </article>`;
    }).join("");
  }

  function activityHistoryHtml(){
    const docs=(state.activity?.docs||[]).slice(0,8);
    const bitas=(state.activity?.bitacoras||[]).slice(0,8);
    const docsHtml=docs.length?docs.map(x=>`<article class="history-item"><div class="history-icon">↥</div><div><span>ARCHIVO · ${esc(x.tipoDocumento||"Documento")}</span><strong>${esc(x.nombreArchivo||"Archivo asociado")}</strong><small>${esc(x.iniciativa||"")} · ${esc(new Date(x.recordedAt||Date.now()).toLocaleString("es-CO"))}</small></div></article>`).join(""):`<div class="history-empty">Todavía no hay archivos registrados en el historial local de esta vista.</div>`;
    const bitasHtml=bitas.length?bitas.map(x=>`<article class="history-item"><div class="history-icon">✓</div><div><span>BITÁCORA · E${bitacoraStageNumber(x)} · SESIÓN ${esc(x.sesionNumero||"—")}</span><strong>${esc(x.iniciativa||"Sesión de mentoría")}</strong><small>${esc(x.fechaSesion||"")} · ${esc(x.duracionHoras||"—")} h · ${esc(x.avances||"").slice(0,100)}${clean(x.avances).length>100?"…":""}</small></div></article>`).join(""):`<div class="history-empty">Todavía no hay bitácoras registradas en el historial local de esta vista.</div>`;
    return `<div class="history-columns"><section><div class="history-head"><div><span>ARCHIVOS ASOCIADOS</span><h3>Entregables registrados</h3></div><button type="button" class="history-action" id="historyDocsAction">CARGAR / ASOCIAR</button></div><div class="history-list">${docsHtml}</div></section><section><div class="history-head"><div><span>BITÁCORAS DE MENTORÍA</span><h3>Sesiones registradas</h3></div><button type="button" class="history-action gold" id="historyBitaAction">REGISTRAR BITÁCORA</button></div><div class="history-list">${bitasHtml}</div></section></div>`;
  }

  function updateStageTrackingViews(){
    const p=document.getElementById("stageProjectList"); if(p) p.innerHTML=stageProjectListHtml();
    const h=document.getElementById("activityHistory"); if(h){h.innerHTML=activityHistoryHtml();bindHistoryActions();}
    const bitaCount=(state.activity?.bitacoras||[]).length;
    const docs=(state.activity?.docs||[]).filter(x=>["plan de trabajo","diagnóstico"].includes(clean(x.tipoDocumento).toLowerCase()));
    const completed=new Set(docs.map(x=>`${clean(x.iniciativa).toLowerCase()}|${clean(x.tipoDocumento).toLowerCase()}`)).size;
    const total=(state.data?.projects||[]).length*2;
    const navBita=document.querySelector('[data-workspace-tab="bitacoras"] span'); if(navBita) navBita.textContent=String(bitaCount);
    const navDocs=document.querySelector('[data-workspace-tab="deliverables"] span'); if(navDocs) navDocs.textContent=`${completed}/${total}`;
    const homeBita=document.querySelector('#homeBitacoraBtn small'); if(homeBita) homeBita.textContent=trackingScopeText("bitacoras",bitaCount);
    const homeDocs=document.querySelector('[data-open-workspace="deliverables"] small'); if(homeDocs) homeDocs.textContent=trackingScopeText("docs",completed,total);
    const homeDocsIcon=document.querySelector('[data-open-workspace="deliverables"] .home-action-icon'); if(homeDocsIcon) homeDocsIcon.textContent=String(completed);
    const prog=document.querySelector(".deliverables-progress > strong"); if(prog) prog.textContent=`${completed} / ${total}`;
    const bar=document.querySelector(".deliverables-progress .stage-progress-bar i"); if(bar) bar.style.width=`${total?Math.round((completed/total)*100):0}%`;
  }

  function bindHistoryActions(){
    document.getElementById("historyDocsAction")?.addEventListener("click",openEtapa0Modal);
    document.getElementById("historyBitaAction")?.addEventListener("click",openBitacoraModal);
  }

  function trackingScopeText(kind,count,total=0){
    if(DOC_TRACKING_URL){
      if(kind==="bitacoras") return `${count} bitácora${count===1?"":"s"} sincronizada${count===1?"":"s"}.`;
      return `${count} de ${total} entregables registrados.`;
    }
    if(kind==="bitacoras") return `${count} bitácora${count===1?"":"s"} visible${count===1?"":"s"} en este dispositivo.`;
    return `${count} de ${total} entregables visibles en este dispositivo.`;
  }

  function workspaceNavHtml(){
    const bitaCount=(state.activity?.bitacoras||[]).length;
    const docs=(state.activity?.docs||[]).filter(x=>["plan de trabajo","diagnóstico"].includes(clean(x.tipoDocumento).toLowerCase()));
    const completed=new Set(docs.map(x=>`${clean(x.iniciativa).toLowerCase()}|${clean(x.tipoDocumento).toLowerCase()}`)).size;
    const total=(state.data?.projects||[]).length*2;
    return `<nav class="workspace-nav" aria-label="Navegación Mentor View">
      <button type="button" data-workspace-tab="home" class="${state.workspaceTab==="home"?"active":""}"><span>⌂</span><b>Inicio</b></button>
      <button type="button" data-workspace-tab="initiatives" class="${state.workspaceTab==="initiatives"?"active":""}"><span>${state.data?.initiativeCount||0}</span><b>Mis iniciativas</b></button>
      <button type="button" data-workspace-tab="bitacoras" class="${state.workspaceTab==="bitacoras"?"active":""}"><span>${bitaCount}</span><b>Bitácoras</b></button>
      <button type="button" data-workspace-tab="deliverables" class="${state.workspaceTab==="deliverables"?"active":""}"><span>${completed}/${total}</span><b>Entregables</b></button>
      <button type="button" data-workspace-tab="route" class="${state.workspaceTab==="route"?"active":""}"><span>6</span><b>Ruta</b></button>
    </nav>`;
  }

  function setWorkspaceTab(tab,scroll=true){
    state.workspaceTab=tab;
    document.querySelectorAll("[data-workspace-tab]").forEach(btn=>btn.classList.toggle("active",btn.dataset.workspaceTab===tab));
    document.querySelectorAll("[data-workspace-panel]").forEach(panel=>panel.hidden=panel.dataset.workspacePanel!==tab);
    if(scroll){
      const nav=document.querySelector(".workspace-nav");
      if(nav) window.scrollTo({top:Math.max(0,nav.getBoundingClientRect().top+window.scrollY-18),behavior:"smooth"});
    }
  }

  function bindWorkspaceNav(){
    document.querySelectorAll("[data-workspace-tab]").forEach(btn=>btn.addEventListener("click",()=>setWorkspaceTab(btn.dataset.workspaceTab)));
    document.querySelectorAll("[data-open-workspace]").forEach(btn=>btn.addEventListener("click",()=>setWorkspaceTab(btn.dataset.openWorkspace)));
  }

  function currentStageTasksHtml(d){
    const cs=currentStageInfo();
    if(cs.n===0){
      return `<div class="stage-requirements actionable">
        <article><span class="requirement-step">01</span><div class="requirement-content"><b>Diagnóstico / línea base</b><p>Brechas, readiness, supuestos, riesgos y situación técnico-comercial.</p><em>1 por iniciativa.</em><button type="button" class="requirement-action" id="diagnosticoEntryBtn">↥ CARGAR DIAGNÓSTICO</button></div></article>
        <article><span class="requirement-step">02</span><div class="requirement-content"><b>Plan de trabajo individual</b><p>Prioridades, KPIs, hitos y acciones acordadas con el equipo.</p><em>1 por iniciativa.</em><button type="button" class="requirement-action" id="planEntryBtn">↥ CARGAR PLAN DE TRABAJO</button></div></article>
        <article><span class="requirement-step">03</span><div class="requirement-content"><b>Bitácora de cada sesión</b><p>Avances, compromisos y soportes de la mentoría.</p><em>2 sesiones en la etapa.</em><button type="button" class="requirement-action gold" id="bitacoraEntryBtn">＋ REGISTRAR BITÁCORA</button></div></article>
      </div>
      <div class="stage-actions utility-actions">
        <button class="secondary-work-action" id="initiativesEntryBtn" type="button"><span>${d.initiativeCount}</span><div><b>VER MIS INICIATIVAS</b><small>Equipos asignados y expedientes</small></div><i>→</i></button>
        <button class="secondary-work-action" id="toolsEntryBtn" type="button"><span>↗</span><div><b>BANCO DE HERRAMIENTAS</b><small>Formatos y recursos</small></div><i>→</i></button>
      </div>`;
    }
    return `<div class="stage-requirements actionable">
      <article><span class="requirement-step">01</span><div class="requirement-content"><b>Mentoría · Sesión 1 de 2</b><p>Revisa avance, brechas y decisiones necesarias para acercar la iniciativa al hito de la etapa.</p><em>1 hora prevista.</em><button type="button" class="requirement-action gold" data-bita-session="1">＋ REGISTRAR SESIÓN 1</button></div></article>
      <article><span class="requirement-step">02</span><div class="requirement-content"><b>Mentoría · Sesión 2 de 2</b><p>Contrasta avances, acuerda compromisos y deja definidos los siguientes pasos.</p><em>1 hora prevista.</em><button type="button" class="requirement-action gold" data-bita-session="2">＋ REGISTRAR SESIÓN 2</button></div></article>
      <article><span class="requirement-step">03</span><div class="requirement-content"><b>Hito de la etapa</b><p>${esc(cs.hito)}</p><em>${esc(cs.months)}.</em><button type="button" class="requirement-action" data-open-workspace="route">VER RUTA Y SIGUIENTE ETAPA</button></div></article>
    </div>
    <div class="stage-actions utility-actions">
      <button class="secondary-work-action" id="initiativesEntryBtn" type="button"><span>${d.initiativeCount}</span><div><b>VER MIS INICIATIVAS</b><small>Equipos asignados y expedientes</small></div><i>→</i></button>
      <button class="secondary-work-action" id="toolsEntryBtn" type="button"><span>↗</span><div><b>BANCO DE HERRAMIENTAS</b><small>Formatos y recursos</small></div><i>→</i></button>
    </div>`;
  }

  function renderPortfolio() {
    const d=state.data,m=d.mentor;
    const people=new Set();
    d.projects.forEach(p=>(p.result?.team||[]).forEach(t=>{ if(t?.name) people.add(clean(t.name).toLowerCase()); }));
    const totalRequired=d.projects.length*2;
    const localDocs=(state.activity?.docs||[]).filter(x=>["plan de trabajo","diagnóstico"].includes(clean(x.tipoDocumento).toLowerCase()));
    const completedKeys=new Set(localDocs.map(x=>`${clean(x.iniciativa).toLowerCase()}|${clean(x.tipoDocumento).toLowerCase()}`));
    const completed=Math.min(totalRequired,completedKeys.size);
    const bitaCount=(state.activity?.bitacoras||[]).length;

    app.innerHTML=`<section class="portfolio mentor-workspace">
      <article class="mentor-banner mentor-banner-work">
        <div class="mentor-banner-main">
          <div class="avatar">${esc(m.initials||initials(m.name))}</div>
          <div class="mentor-banner-copy"><p class="eyebrow">SCIENCE2VENTURE · MENTOR VIEW</p><h1>${esc(m.name)}</h1><p>Tu espacio de acompañamiento. Consulta tus iniciativas, registra bitácoras, carga entregables y revisa la ruta sin perderte entre pantallas.</p></div>
          <div class="mentor-identity"><span>MENTOR ASIGNADO</span><strong>${esc(m.name)}</strong><small>${d.initiativeCount} iniciativas · 12 h de mentoría por iniciativa</small></div>
        </div>
      </article>

      ${workspaceNavHtml()}

      <div class="workspace-panel" data-workspace-panel="home" ${state.workspaceTab==="home"?"":"hidden"}>
        <section class="home-dashboard">
          <div class="home-stage-card">
            ${(()=>{const cs=currentStageInfo(),ns=nextStageInfo();return `<div class="home-stage-top"><span class="stage-number small">${cs.n}</span><div><span class="stage-label">ETAPA VIGENTE</span><h2>${esc(cs.name)}</h2><p>${esc(cs.months)} · ${esc(cs.weeks)} · 2 horas de mentoría por iniciativa</p></div></div>
            <div class="home-stage-hito"><span>HITO DE LA ETAPA</span><strong>${esc(cs.hito)}</strong><small>${ns?`Después sigue: Etapa ${ns.n} · ${esc(ns.name)} · ${esc(ns.months)}`:"Esta es la etapa final de la ruta."}</small></div>`;})()}
          </div>

          <div class="home-action-grid">
            <button type="button" class="home-action-card" data-open-workspace="initiatives"><span class="home-action-icon">${d.initiativeCount}</span><div><b>MIS INICIATIVAS</b><strong>Ver equipos asignados</strong><small>Expedientes, contactos y datos técnicos.</small></div><i>→</i></button>
            <button type="button" class="home-action-card gold" id="homeBitacoraBtn"><span class="home-action-icon">＋</span><div><b>BITÁCORAS</b><strong>Registrar una mentoría</strong><small>${trackingScopeText("bitacoras",bitaCount)}</small></div><i>→</i></button>
            <button type="button" class="home-action-card" data-open-workspace="deliverables"><span class="home-action-icon">${completed}</span><div><b>ENTREGABLES</b><strong>Diagnóstico y plan de trabajo</strong><small>${trackingScopeText("docs",completed,totalRequired)}</small></div><i>→</i></button>
            <button type="button" class="home-action-card" data-open-workspace="route"><span class="home-action-icon">6</span><div><b>RUTA</b><strong>Ver etapas, meses e hitos</strong><small>32 semanas · 12 h por iniciativa.</small></div><i>→</i></button>
          </div>

          <section class="home-current-work">
            <div class="workspace-heading"><div><span>QUÉ DEBES HACER AHORA</span><h2>Etapa ${CURRENT_STAGE_NUMBER}</h2><p>${CURRENT_STAGE_NUMBER===0?"La prioridad es completar la línea base y el plan de trabajo de cada iniciativa y registrar cada mentoría realizada.":"Completa las dos sesiones de mentoría de la etapa, registra sus bitácoras y orienta al equipo hacia el hito previsto."}</p></div></div>
            ${currentStageTasksHtml(d)}
          </section>
        </section>
      </div>

      <div class="workspace-panel" data-workspace-panel="initiatives" ${state.workspaceTab==="initiatives"?"":"hidden"}>
        <section class="initiative-section standalone">
          <div class="workspace-heading initiative-heading"><div><span>MIS INICIATIVAS</span><h2>${d.initiativeCount} equipos asignados</h2><p>Abre cualquier expediente para consultar el contexto técnico, el equipo y la información de selección.</p></div><div class="field search compact-search"><label>Buscar iniciativa</label><input id="searchInput" type="search" placeholder="Nombre, sector o contacto"></div></div>
          <div id="projectGrid" class="project-grid"></div>
        </section>
      </div>

      <div class="workspace-panel" data-workspace-panel="bitacoras" ${state.workspaceTab==="bitacoras"?"":"hidden"}>
        <section class="activity-section standalone">
          <div class="workspace-heading action-heading"><div><span>BITÁCORAS DE MENTORÍA</span><h2>Registro de sesiones</h2><p>Después de cada mentoría registra avances, compromisos y, cuando aplique, los soportes de la sesión.</p></div><button type="button" class="section-primary-btn gold" id="bitacoraTabBtn">＋ REGISTRAR BITÁCORA</button></div>
          <div id="activityHistory">${activityHistoryHtml()}</div>
        </section>
      </div>

      <div class="workspace-panel" data-workspace-panel="deliverables" ${state.workspaceTab==="deliverables"?"":"hidden"}>
        <section class="tracking-section standalone">
          <div class="workspace-heading action-heading"><div><span>ENTREGABLES · ETAPA 0</span><h2>Diagnóstico y plan de trabajo</h2><p>Revisa qué falta por iniciativa y carga los documentos correspondientes.</p></div><button type="button" class="section-primary-btn" id="deliverablesTabBtn">↥ CARGAR ENTREGABLE</button></div>
          <div class="deliverables-progress"><span>AVANCE</span><strong>${completed} / ${totalRequired}</strong><small>${DOC_TRACKING_URL?"entregables sincronizados":"seguimiento visible en este dispositivo"}</small><div class="stage-progress-bar"><i style="width:${totalRequired?Math.round((completed/totalRequired)*100):0}%"></i></div></div>
          <div id="stageProjectList" class="stage-project-list">${stageProjectListHtml()}</div>
        </section>
      </div>

      <div class="workspace-panel" data-workspace-panel="route" ${state.workspaceTab==="route"?"":"hidden"}>
        ${mentorRoutesHtml()}
      </div>

      <p class="footer-note">Mentor View · Science2Venture 2026</p>
    </section>`;

    document.getElementById("searchInput")?.addEventListener("input", applyFilters);
    document.getElementById("toolsEntryBtn")?.addEventListener("click",()=>renderToolsHub(true));
    document.getElementById("initiativesEntryBtn")?.addEventListener("click",()=>setWorkspaceTab("initiatives"));
    document.getElementById("diagnosticoEntryBtn")?.addEventListener("click",()=>openEtapa0Modal("Diagnóstico"));
    document.getElementById("planEntryBtn")?.addEventListener("click",()=>openEtapa0Modal("Plan de trabajo"));
    document.getElementById("bitacoraEntryBtn")?.addEventListener("click",openBitacoraModal);
    document.getElementById("homeBitacoraBtn")?.addEventListener("click",openBitacoraModal);
    document.getElementById("bitacoraTabBtn")?.addEventListener("click",openBitacoraModal);
    document.getElementById("deliverablesTabBtn")?.addEventListener("click",openEtapa0Modal);
    document.querySelectorAll("[data-bita-session]").forEach(btn=>btn.addEventListener("click",()=>openBitacoraModal(btn.dataset.bitaSession)));
    bindHistoryActions();
    bindWorkspaceNav();
    renderCards();
    setWorkspaceTab(state.workspaceTab,false);
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
  function renderToolsHub(push=true){
    state.selected=null;
    if(push) history.pushState({tools:true},"",location.pathname+location.search+"#tools");
    app.innerHTML=`<section class="tools-view"><button class="back-btn" id="toolsBackBtn" type="button">← Mis iniciativas</button><article class="tools-shell">${toolsHtml()}</article><p class="footer-note">Banco de Herramientas · Science2Venture 2026</p></section>`;
    document.getElementById("toolsBackBtn")?.addEventListener("click",()=>backPortfolio(true));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  window.addEventListener("popstate",()=>{
    if(location.hash === "#tools"){ renderToolsHub(false); return; }
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
        <header class="detail-head"><p class="eyebrow">MENTOR · ${esc(m.name)}</p><h1>${esc(p.name)}</h1><div class="detail-meta">${fundingBadge(r)}${r.trlValidatedByUnit?`<span class="badge">${esc(r.trlValidatedByUnit)} · validado</span>`:""}${r.sector?`<span class="badge">${esc(r.sector)}</span>`:""}</div>${projectKpis(r,a)}</header>${projectRouteHtml(p)}${processHtml(r,a)}
        <nav class="tabs" aria-label="Secciones de iniciativa">
          ${[["summary","01 · RESUMEN"],["application","02 · POSTULACIÓN"],["panel","03 · EVALUACIÓN DEL PANEL"],["unit","04 · REVISIÓN INSTITUCIONAL"],["result","05 · RESULTADO"]].map(([id,l])=>`<button type="button" class="tab-btn ${id===state.activeTab?"active":""}" data-tab="${id}">${l}</button>`).join("")}
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



  function docsConfigReady(){
    return !!(DOC_UPLOAD_URL && DOC_SEARCH_URL && DOC_ASSOCIATE_URL);
  }

  function docsStatus(modal,message,type=""){
    const el=modal?.querySelector("#docsStatus"); if(!el) return;
    el.textContent=message||"";
    el.className=`bitacora-status${type?` is-${type}`:""}`;
  }

  function ensureEtapa0Modal(){
    let modal=document.getElementById("etapa0Modal");
    if(modal) return modal;
    modal=document.createElement("div");
    modal.id="etapa0Modal";
    modal.className="bitacora-modal etapa0-modal";
    modal.hidden=true;
    modal.innerHTML=`<div class="bitacora-backdrop" data-docs-close></div><section class="bitacora-dialog etapa0-dialog" role="dialog" aria-modal="true" aria-labelledby="etapa0Title"><header class="bitacora-head"><div><span class="section-kicker">SCIENCE2VENTURE · ETAPA 0</span><h2 id="etapa0Title">Entregables de arranque y línea base</h2><p>Por cada iniciativa debes dejar asociado un diagnóstico y un plan de trabajo individual.</p></div><button class="bitacora-close" type="button" data-docs-close aria-label="Cerrar">×</button></header><div class="bitacora-form"><div class="docs-intro docs-intro-clear"><span>QUÉ DEBES COMPLETAR</span><strong>2 entregables por iniciativa</strong><div class="modal-requirements"><div><b>1 · Diagnóstico / línea base</b><small>Brechas, readiness, supuestos, riesgos y situación inicial.</small></div><div><b>2 · Plan de trabajo individual</b><small>Prioridades, KPIs, objetivos e hitos acordados.</small></div></div></div><div class="bitacora-grid"><label class="bitacora-field"><span>Mentor</span><input id="docsMentor" type="text" readonly></label><label class="bitacora-field"><span>Iniciativa</span><select id="docsIniciativa"><option value="">Seleccionar iniciativa</option></select></label><label class="bitacora-field bitacora-full"><span>¿Qué vas a cargar?</span><div class="doc-type-grid"><label class="doc-type-option"><input type="radio" name="docsTipo" value="Diagnóstico" checked><span><b>DIAGNÓSTICO / LÍNEA BASE</b><small>Lectura inicial y priorización de brechas de la iniciativa.</small></span></label><label class="doc-type-option"><input type="radio" name="docsTipo" value="Plan de trabajo"><span><b>PLAN DE TRABAJO INDIVIDUAL</b><small>Objetivos, prioridades, KPIs e hitos del acompañamiento.</small></span></label></div></label></div><div class="docs-process-note"><b>Cargar no significa registrar.</b><span>Completa los 3 pasos: carga el archivo en Microsoft, regresa a Mentor View para verificarlo y finalmente asócialo a la iniciativa.</span></div><div class="docs-upload-actions"><button class="docs-upload-btn" id="docsUploadBtn" type="button">1 · CARGAR EN MICROSOFT ↗</button><button class="docs-verify-btn" id="docsVerifyBtn" type="button">2 · YA LO CARGUÉ · VERIFICAR</button></div><div id="docsStatus" class="bitacora-status" role="status" aria-live="polite"></div><div id="docsPendingWrap" class="docs-pending-wrap" hidden><div class="docs-pending-head"><span>ARCHIVO ENCONTRADO</span><small>Confirma que sea el documento que acabas de cargar.</small></div><div id="docsPendingList" class="pending-file-list"></div><button class="bitacora-save docs-associate-btn" id="docsAssociateBtn" type="button">3 · ASOCIAR Y MARCAR COMO REGISTRADO</button></div><div class="modal-local-history"><span>REGISTROS DE ESTA INICIATIVA</span><div id="docsInitiativeHistory" class="modal-history-list"></div></div></div></section>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-docs-close]").forEach(el=>el.addEventListener("click",closeEtapa0Modal));
    modal.querySelector("#docsUploadBtn")?.addEventListener("click",openDocsUpload);
    modal.querySelector("#docsVerifyBtn")?.addEventListener("click",searchPendingDocs);
    modal.querySelector("#docsAssociateBtn")?.addEventListener("click",associatePendingDoc);
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden) closeEtapa0Modal();});
    return modal;
  }

  function openEtapa0Modal(preferredType=""){
    const modal=ensureEtapa0Modal();
    modal.querySelector("#docsMentor").value=state.data?.mentor?.name||"";
    const select=modal.querySelector("#docsIniciativa");
    select.innerHTML=`<option value="">Seleccionar iniciativa</option>${(state.data?.projects||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join("")}`;
    if(preferredType){
      const radio=[...modal.querySelectorAll('input[name="docsTipo"]')].find(x=>x.value===preferredType);
      if(radio) radio.checked=true;
    }
    select.onchange=()=>renderModalInitiativeHistory(modal,select.value);
    renderModalInitiativeHistory(modal,select.value);
    modal.querySelector("#docsPendingWrap").hidden=true;
    modal.querySelector("#docsPendingList").innerHTML="";
    modal._pendingDocs=[];
    docsStatus(modal,docsConfigReady()?"Selecciona la iniciativa y el documento que vas a cargar.":"La sección está lista. Falta conectar los enlaces de carga y automatización.");
    modal.hidden=false; document.body.classList.add("modal-open");
    setTimeout(()=>select.focus(),0);
  }

  function renderModalInitiativeHistory(modal,initiative){
    const target=modal?.querySelector("#docsInitiativeHistory"); if(!target) return;
    if(!initiative){target.innerHTML='<div class="history-empty compact">Selecciona una iniciativa para ver sus registros.</div>';return;}
    const a=activityForInitiative(initiative);
    const rows=[
      ...a.docs.map(x=>({kind:"Archivo",title:x.tipoDocumento||"Documento",detail:x.nombreArchivo||"",date:x.recordedAt})),
      ...a.bitacoras.map(x=>({kind:"Bitácora",title:x.fechaSesion||"Sesión",detail:x.avances||"",date:x.recordedAt}))
    ].sort((x,y)=>new Date(y.date||0)-new Date(x.date||0));
    target.innerHTML=rows.length?rows.slice(0,8).map(x=>`<div class="modal-history-row"><span>${esc(x.kind)}</span><div><b>${esc(x.title)}</b><small>${esc(x.detail).slice(0,130)}${clean(x.detail).length>130?"…":""}</small></div></div>`).join(""):'<div class="history-empty compact">Aún no hay registros locales para esta iniciativa.</div>';
  }

  function closeEtapa0Modal(){
    const modal=document.getElementById("etapa0Modal"); if(!modal) return;
    modal.hidden=true; document.body.classList.remove("modal-open");
  }

  function selectedDocType(modal){
    return clean(modal?.querySelector('input[name="docsTipo"]:checked')?.value);
  }

  function openDocsUpload(){
    const modal=document.getElementById("etapa0Modal"); if(!modal) return;
    const initiative=clean(modal.querySelector("#docsIniciativa")?.value);
    if(!initiative){docsStatus(modal,"Selecciona primero la iniciativa.","error");return;}
    if(!DOC_UPLOAD_URL){docsStatus(modal,"El enlace de carga todavía no está configurado.","error");return;}
    const since=new Date(Date.now()-30000).toISOString();
    modal.dataset.since=since;
    try{sessionStorage.setItem("s2v_docs_since",since);}catch(e){}
    window.open(DOC_UPLOAD_URL,"_blank","noopener");
    docsStatus(modal,"Se abrió la solicitud de archivos de Microsoft. Cuando termine la carga, vuelve aquí y pulsa “Ya lo cargué · Verificar”.");
  }

  function normalizePendingDoc(item,index){
    const id=clean(item?.Id ?? item?.ID ?? item?.ItemInternalId ?? item?.id);
    const name=clean(item?.Name ?? item?.DisplayName ?? item?.["{FilenameWithExtension}"] ?? item?.FileLeafRef ?? item?.nombreArchivo ?? `Archivo ${index+1}`);
    const identifier=clean(item?.Id ?? item?.Identifier ?? item?.["{Identifier}"] ?? item?.identificadorArchivo ?? id);
    const path=clean(item?.Path ?? item?.["{FullPath}"] ?? item?.["{Path}"] ?? item?.rutaArchivo);
    const created=clean(item?.LastModified ?? item?.Created ?? item?.created ?? item?.fechaCarga);
    return {raw:item,id,name,identifier,path,created};
  }

  function renderPendingDocs(modal,items){
    const wrap=modal.querySelector("#docsPendingWrap"), list=modal.querySelector("#docsPendingList");
    modal._pendingDocs=items;
    wrap.hidden=!items.length;
    if(!items.length){list.innerHTML="";return;}
    list.innerHTML=items.map((f,i)=>`<label class="pending-file"><input type="radio" name="pendingDoc" value="${i}" ${i===0?"checked":""}><span class="pending-file-main"><b>${esc(f.name)}</b><small>${f.created?esc(new Date(f.created).toLocaleString("es-CO")):"Carga reciente"}</small></span><span class="pending-file-id">ONEDRIVE</span></label>`).join("");
  }

  async function searchPendingDocs(){
    const modal=document.getElementById("etapa0Modal"); if(!modal) return;
    const initiative=clean(modal.querySelector("#docsIniciativa")?.value);
    if(!initiative){docsStatus(modal,"Selecciona primero la iniciativa.","error");return;}
    if(!DOC_SEARCH_URL){docsStatus(modal,"El flujo de verificación todavía no está conectado.","error");return;}
    const btn=modal.querySelector("#docsVerifyBtn");
    let since=modal.dataset.since;
    try{since=since||sessionStorage.getItem("s2v_docs_since");}catch(e){}
    if(!since) since=new Date(Date.now()-30*60*1000).toISOString();
    btn.disabled=true; btn.textContent="VERIFICANDO…"; docsStatus(modal,"Buscando cargas pendientes recientes…");
    try{
      const response=await fetch(DOC_SEARCH_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","X-S2V-Access":access},body:JSON.stringify({desde:since})});
      const raw=await response.text(); let result={};
      try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true) throw new Error(`Power Automate respondió ${response.status}`);
      const items=(Array.isArray(result.archivos)?result.archivos:[]).map(normalizePendingDoc).filter(x=>!!x.id&&!!x.identifier);
      renderPendingDocs(modal,items);
      docsStatus(modal,items.length?`${items.length} archivo${items.length===1?"":"s"} pendiente${items.length===1?"":"s"} encontrado${items.length===1?"":"s"}. Selecciona el que acabas de cargar.`:"No encontré una carga nueva todavía. Puede tardar unos segundos en aparecer.",items.length?"success":"");
    }catch(error){
      console.error("Error buscando cargas S2V",error);
      docsStatus(modal,"No fue posible verificar las cargas. Intenta nuevamente en unos segundos.","error");
    }finally{btn.disabled=false;btn.textContent="2 · YA LO CARGUÉ · VERIFICAR";}
  }

  async function associatePendingDoc(){
    const modal=document.getElementById("etapa0Modal"); if(!modal) return;
    const initiative=clean(modal.querySelector("#docsIniciativa")?.value);
    const type=selectedDocType(modal);
    const selected=modal.querySelector('input[name="pendingDoc"]:checked');
    const file=selected?modal._pendingDocs?.[Number(selected.value)]:null;
    if(!initiative||!type){docsStatus(modal,"Selecciona la iniciativa y el tipo de documento.","error");return;}
    if(!file){docsStatus(modal,"Selecciona el archivo que quieres asociar.","error");return;}
    if(!DOC_ASSOCIATE_URL){docsStatus(modal,"El flujo de asociación todavía no está conectado.","error");return;}
    const btn=modal.querySelector("#docsAssociateBtn");
    const payload={archivoId:file.id,nombreArchivo:file.name,identificadorArchivo:file.identifier,rutaArchivo:file.path,fechaCarga:file.created,mentor:clean(state.data?.mentor?.name),iniciativa:initiative,etapa:"Etapa 0",tipoDocumento:type,asociacionEmpresa:true,bitacoraId:null,fechaBitacora:null,fechaSesion:null};
    btn.disabled=true; btn.textContent="ASOCIANDO…"; docsStatus(modal,"Organizando el archivo dentro de la iniciativa…");
    try{
      const response=await fetch(DOC_ASSOCIATE_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","X-S2V-Access":access},body:JSON.stringify(payload)});
      const raw=await response.text(); let result={};
      try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true) throw new Error(`Power Automate respondió ${response.status}`);
      docsStatus(modal,`${type} asociado correctamente a ${initiative}.`,"success");
      recordMentorDoc({iniciativa:initiative,tipoDocumento:type,nombreArchivo:file.name,fechaCarga:file.created});
      renderModalInitiativeHistory(modal,initiative);
      modal._pendingDocs=(modal._pendingDocs||[]).filter(x=>x.id!==file.id);
      renderPendingDocs(modal,modal._pendingDocs);
    }catch(error){
      console.error("Error asociando archivo S2V",error);
      docsStatus(modal,"No fue posible asociar el archivo. Revisa el flujo e intenta nuevamente.","error");
    }finally{btn.disabled=false;btn.textContent="3 · ASOCIAR Y MARCAR COMO REGISTRADO";}
  }

  function localDateValue(){
    const d=new Date();
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${day}`;
  }

  function ensureBitacoraModal(){
    let modal=document.getElementById("bitacoraModal");
    if(modal) return modal;
    modal=document.createElement("div");
    modal.id="bitacoraModal";
    modal.className="bitacora-modal";
    modal.hidden=true;
    modal.innerHTML=`<div class="bitacora-backdrop" data-bita-close></div><section class="bitacora-dialog bitacora-dialog-wide" role="dialog" aria-modal="true" aria-labelledby="bitacoraTitle"><header class="bitacora-head"><div><span class="section-kicker">SCIENCE2VENTURE · ACOMPAÑAMIENTO</span><h2 id="bitacoraTitle">Registrar bitácora</h2><p>Deja la trazabilidad de la sesión y, si aplica, adjunta los soportes que respaldan el avance.</p></div><button class="bitacora-close" type="button" data-bita-close aria-label="Cerrar">×</button></header><form id="bitacoraForm" class="bitacora-form"><div class="bitacora-grid"><label class="bitacora-field"><span>Mentor</span><input id="bitaMentor" type="text" readonly></label><label class="bitacora-field"><span>Iniciativa</span><div class="bita-initiative-picker" id="bitaInitiativePicker"><button class="bita-initiative-toggle" id="bitaInitiativeToggle" type="button" aria-expanded="false"><span id="bitaInitiativeChoice">Seleccionar iniciativa</span><i aria-hidden="true">⌄</i></button><div class="bita-initiative-menu" id="bitaInitiativeMenu" role="listbox" hidden></div></div><select id="bitaIniciativa" class="bita-native-select-hidden" aria-hidden="true" tabindex="-1"><option value="">Seleccionar iniciativa</option></select></label><label class="bitacora-field"><span>Fecha de sesión</span><input id="bitaFecha" type="date" required></label><label class="bitacora-field"><span>Etapa</span><input id="bitaEtapa" type="text" readonly></label><label class="bitacora-field"><span>Sesión de la etapa</span><select id="bitaSesion" required><option value="">Seleccionar</option><option value="1">Sesión 1 de 2</option><option value="2">Sesión 2 de 2</option></select></label><label class="bitacora-field"><span>Duración (horas)</span><input id="bitaDuracion" type="number" min="0.25" max="2" step="0.25" value="1" required><small>Meta de la etapa: 2 h por iniciativa.</small></label><label class="bitacora-field bitacora-full"><span>Avances</span><textarea id="bitaAvances" required rows="5" placeholder="¿Qué avances se lograron o revisaron durante la sesión?"></textarea></label><label class="bitacora-field bitacora-full"><span>Compromisos</span><textarea id="bitaCompromisos" required rows="5" placeholder="¿Qué compromisos quedaron acordados?"></textarea></label></div><section id="bitaAttachments" class="bita-attachments"><div class="bita-attachments-head"><div><span>DESARROLLO DOCUMENTAL · OPCIONAL</span><h3>¿Se realizó desarrollo documental para esta sesión?</h3><p>Por ejemplo: actas, matrices, presentaciones, evidencias u otros documentos elaborados o actualizados durante la mentoría.</p></div><div class="bita-saved-chip" id="bitaSavedChip" hidden>BITÁCORA GUARDADA ✓</div></div><div class="docs-upload-actions" id="bitaDocsChoice"><button class="bitacora-secondary" id="bitaDocsNo" type="button" aria-pressed="false">NO</button><button class="docs-verify-btn" id="bitaDocsYes" type="button" aria-pressed="false">SÍ · HUBO DESARROLLO DOCUMENTAL</button></div><div id="bitaDocsChoiceStatus" class="bitacora-status" role="status" aria-live="polite"></div><div id="bitaDocsFlow" hidden><div class="docs-process-note"><b>Ahora adjunta el soporte documental de esta sesión.</b><span>Cárgalo en Microsoft, vuelve a Mentor View, verifica el archivo y asócialo a esta bitácora.</span></div><div class="docs-upload-actions"><button class="docs-upload-btn" id="bitaUploadBtn" type="button">2 · CARGAR SOPORTE ↗</button><button class="docs-verify-btn" id="bitaVerifyBtn" type="button">3 · YA LO CARGUÉ · VERIFICAR</button></div><div id="bitaDocsStatus" class="bitacora-status" role="status" aria-live="polite"></div><div id="bitaPendingWrap" class="docs-pending-wrap" hidden><div class="docs-pending-head"><span>ARCHIVOS ENCONTRADOS</span><small>Selecciona el soporte que quieres asociar a esta bitácora.</small></div><div id="bitaPendingList" class="pending-file-list"></div><button class="bitacora-save docs-associate-btn" id="bitaAssociateBtn" type="button">4 · ASOCIAR A ESTA BITÁCORA</button></div></div><div id="bitaDocsComplete" class="bita-docs-complete" hidden><span>✓ SOPORTE ASOCIADO</span><strong id="bitaDocsCompleteFile"></strong><small id="bitaDocsCompleteInitiative"></small></div></section><div id="bitacoraStatus" class="bitacora-status" role="status" aria-live="polite"></div><footer class="bitacora-actions"><button class="bitacora-secondary" type="button" data-bita-close>Cerrar</button><button class="bitacora-save" id="bitacoraSave" type="submit">1 · GUARDAR BITÁCORA</button></footer></form></section>`;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-bita-close]").forEach(el=>el.addEventListener("click",closeBitacoraModal));
    modal.querySelector("#bitacoraForm")?.addEventListener("submit",submitBitacora);
    modal.querySelector("#bitaDocsYes")?.addEventListener("click",()=>setBitacoraDocsChoice(true));
    modal.querySelector("#bitaDocsNo")?.addEventListener("click",()=>setBitacoraDocsChoice(false));
    modal.querySelector("#bitaUploadBtn")?.addEventListener("click",openBitacoraUpload);
    modal.querySelector("#bitaVerifyBtn")?.addEventListener("click",searchBitacoraPendingDocs);
    modal.querySelector("#bitaAssociateBtn")?.addEventListener("click",associateBitacoraDoc);
    modal.querySelector("#bitaInitiativeToggle")?.addEventListener("click",()=>{
      const menu=modal.querySelector("#bitaInitiativeMenu");
      const toggle=modal.querySelector("#bitaInitiativeToggle");
      if(!menu||!toggle) return;
      const willOpen=menu.hidden;
      menu.hidden=!willOpen;
      toggle.setAttribute("aria-expanded",willOpen?"true":"false");
    });
    modal.querySelector("#bitaInitiativeMenu")?.addEventListener("click",e=>{
      const option=e.target.closest("[data-bita-project-index]");
      if(!option) return;
      const idx=Number(option.dataset.bitaProjectIndex);
      const project=state.data?.projects?.[idx];
      const select=modal.querySelector("#bitaIniciativa");
      if(!project||!select) return;
      select.value=project.name;
      updateBitacoraInitiativePreview(modal);
      closeBitacoraInitiativeMenu(modal);
    });
    modal.addEventListener("click",e=>{
      const picker=modal.querySelector("#bitaInitiativePicker");
      if(picker&&!picker.contains(e.target)) closeBitacoraInitiativeMenu(modal);
    });
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden) closeBitacoraModal();});
    return modal;
  }

  function closeBitacoraInitiativeMenu(modal){
    const menu=modal?.querySelector("#bitaInitiativeMenu");
    const toggle=modal?.querySelector("#bitaInitiativeToggle");
    if(menu) menu.hidden=true;
    if(toggle) toggle.setAttribute("aria-expanded","false");
  }

  function updateBitacoraInitiativePreview(modal){
    const select=modal?.querySelector("#bitaIniciativa");
    const choice=modal?.querySelector("#bitaInitiativeChoice");
    if(!select||!choice) return;
    const name=clean(select.value);
    choice.textContent=name||"Seleccionar iniciativa";
    choice.title=name;
  }

  function renderBitacoraInitiativeOptions(modal){
    const menu=modal?.querySelector("#bitaInitiativeMenu");
    if(!menu) return;
    const projects=state.data?.projects||[];
    menu.innerHTML=projects.map((p,i)=>`<button type="button" class="bita-initiative-option" data-bita-project-index="${i}" role="option"><span>${esc(p.name)}</span></button>`).join("");
  }

  function openBitacoraModal(preferredSession=""){
    const modal=ensureBitacoraModal();
    const mentor=modal.querySelector("#bitaMentor"), select=modal.querySelector("#bitaIniciativa"), fecha=modal.querySelector("#bitaFecha"), etapa=modal.querySelector("#bitaEtapa"), sesion=modal.querySelector("#bitaSesion"), duracion=modal.querySelector("#bitaDuracion"), avances=modal.querySelector("#bitaAvances"), compromisos=modal.querySelector("#bitaCompromisos"), status=modal.querySelector("#bitacoraStatus");
    mentor.value=state.data?.mentor?.name||"";
    select.innerHTML=`<option value="">Seleccionar iniciativa</option>${(state.data?.projects||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join("")}`;
    renderBitacoraInitiativeOptions(modal);
    closeBitacoraInitiativeMenu(modal);
    updateBitacoraInitiativePreview(modal);
    fecha.value=localDateValue();
    const cs=currentStageInfo(); etapa.value=`Etapa ${cs.n} · ${cs.name}`; sesion.value=preferredSession?String(preferredSession):""; duracion.value="1";
    avances.value=""; compromisos.value=""; status.textContent=""; status.className="bitacora-status";
    modal.dataset.bitacoraId=""; modal.dataset.bitaSince=""; modal.dataset.bitaEtapa=String(CURRENT_STAGE_NUMBER); modal.dataset.bitaHasDocs=""; modal.dataset.bitaSupportAssociated="";
    const attachments=modal.querySelector("#bitaAttachments"); if(attachments) attachments.hidden=false;
    const savedChip=modal.querySelector("#bitaSavedChip"); if(savedChip) savedChip.hidden=true;
    const docsFlow=modal.querySelector("#bitaDocsFlow"); if(docsFlow) docsFlow.hidden=true;
    const noBtn=modal.querySelector("#bitaDocsNo"), yesBtn=modal.querySelector("#bitaDocsYes");
    if(noBtn){noBtn.setAttribute("aria-pressed","false");noBtn.disabled=false;} if(yesBtn){yesBtn.setAttribute("aria-pressed","false");yesBtn.disabled=false;}
    const complete=modal.querySelector("#bitaDocsComplete"); if(complete) complete.hidden=true;
    const completeFile=modal.querySelector("#bitaDocsCompleteFile"); if(completeFile) completeFile.textContent="";
    const completeInitiative=modal.querySelector("#bitaDocsCompleteInitiative"); if(completeInitiative) completeInitiative.textContent="";
    const docsChoiceStatus=modal.querySelector("#bitaDocsChoiceStatus"); if(docsChoiceStatus){docsChoiceStatus.textContent="";docsChoiceStatus.className="bitacora-status";}
    const pending=modal.querySelector("#bitaPendingWrap"); if(pending) pending.hidden=true;
    const pendingList=modal.querySelector("#bitaPendingList"); if(pendingList) pendingList.innerHTML="";
    modal._bitaPendingDocs=[];
    modal.hidden=false; document.body.classList.add("modal-open");
    setTimeout(()=>modal.querySelector("#bitaInitiativeToggle")?.focus(),0);
  }

  function closeBitacoraModal(){
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    modal.hidden=true; document.body.classList.remove("modal-open");
  }

  async function submitBitacora(event){
    event.preventDefault();
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    const select=modal.querySelector("#bitaIniciativa"), fecha=modal.querySelector("#bitaFecha"), sesion=modal.querySelector("#bitaSesion"), duracion=modal.querySelector("#bitaDuracion"), avances=modal.querySelector("#bitaAvances"), compromisos=modal.querySelector("#bitaCompromisos"), status=modal.querySelector("#bitacoraStatus"), save=modal.querySelector("#bitacoraSave");
    const cs=currentStageInfo();
    const payload={mentor:clean(state.data?.mentor?.name),iniciativa:clean(select.value),fechaSesion:clean(fecha.value),etapa:`Etapa ${cs.n}`,etapaNumero:cs.n,nombreEtapa:cs.name,sesionNumero:Number(sesion.value),duracionHoras:Number(duracion.value),avances:clean(avances.value),compromisos:clean(compromisos.value)};
    if(empty(payload.mentor)||empty(payload.iniciativa)||empty(payload.fechaSesion)||![1,2].includes(payload.sesionNumero)||!Number.isFinite(payload.duracionHoras)||payload.duracionHoras<=0||empty(payload.avances)||empty(payload.compromisos)){status.textContent="Completa iniciativa, fecha, sesión, duración, avances y compromisos antes de guardar.";status.className="bitacora-status is-error";return;}
    save.disabled=true; save.textContent="GUARDANDO…"; status.textContent="Registrando la bitácora…"; status.className="bitacora-status";
    try{
      const response=await fetch(BITACORA_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify(payload)});
      const raw=await response.text(); let result={};
      try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true) throw new Error(result.mensaje||`Power Automate respondió ${response.status}`);
      const bitacoraId=clean(result.bitacoraId ?? result.id ?? result.ID ?? result.itemId);
      const hasDocs=modal.dataset.bitaHasDocs==="true";
      const noDocs=modal.dataset.bitaHasDocs==="false";
      status.textContent=bitacoraId?(hasDocs?"Bitácora guardada. Continúa con la carga del soporte documental.":noDocs?"Bitácora guardada. Esta sesión no requiere soporte documental.":"Bitácora guardada correctamente."):"Bitácora guardada correctamente."; status.className="bitacora-status is-success";
      recordMentorBitacora({...payload,bitacoraId:bitacoraId||null});
      if(bitacoraId){
        modal.dataset.bitacoraId=bitacoraId;
        modal.dataset.bitaIniciativa=payload.iniciativa;
        modal.dataset.bitaFecha=payload.fechaSesion;
        modal.dataset.bitaEtapa=String(payload.etapaNumero);
        modal.dataset.bitaSesion=String(payload.sesionNumero);
        const savedChip=modal.querySelector("#bitaSavedChip"); if(savedChip) savedChip.hidden=false;
        const docsFlow=modal.querySelector("#bitaDocsFlow"); if(docsFlow) docsFlow.hidden=!hasDocs;
        const docsChoiceStatus=modal.querySelector("#bitaDocsChoiceStatus");
        if(docsChoiceStatus&&hasDocs){docsChoiceStatus.textContent="Bitácora guardada. Ya puedes cargar el soporte.";docsChoiceStatus.className="bitacora-status is-success";}
        if(docsChoiceStatus&&noDocs){docsChoiceStatus.textContent="Sin soporte documental para esta sesión.";docsChoiceStatus.className="bitacora-status is-success";}
        save.textContent="BITÁCORA GUARDADA ✓";
        save.disabled=true;
      } else {
        avances.value=""; compromisos.value="";
        setTimeout(closeBitacoraModal,900);
      }
    }catch(error){
      console.error("Error guardando bitácora",error);
      status.textContent="No fue posible guardar la bitácora. Intenta nuevamente."; status.className="bitacora-status is-error";
    }finally{
      if(!modal.dataset.bitacoraId){save.disabled=false;save.textContent="1 · GUARDAR BITÁCORA";}
    }
  }

  function setBitacoraDocsChoice(hasDocs){
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    if(modal.dataset.bitaSupportAssociated==="true") return;
    modal.dataset.bitaHasDocs=hasDocs?"true":"false";
    const flow=modal.querySelector("#bitaDocsFlow"), status=modal.querySelector("#bitaDocsChoiceStatus");
    const noBtn=modal.querySelector("#bitaDocsNo"), yesBtn=modal.querySelector("#bitaDocsYes");
    if(noBtn) noBtn.setAttribute("aria-pressed",hasDocs?"false":"true");
    if(yesBtn) yesBtn.setAttribute("aria-pressed",hasDocs?"true":"false");
    const isSaved=!!modal.dataset.bitacoraId;
    if(flow) flow.hidden=!(hasDocs&&isSaved);
    if(status){
      status.textContent=hasDocs?(isSaved?"Bitácora guardada. Ya puedes cargar el soporte.":"Al guardar la bitácora se habilitará la carga del soporte."):"No se solicitará soporte documental para esta sesión.";
      status.className="bitacora-status is-success";
    }
  }

  function bitaDocsStatus(modal,message,type=""){
    const el=modal?.querySelector("#bitaDocsStatus"); if(!el) return;
    el.textContent=message||"";
    el.className=`bitacora-status${type?` is-${type}`:""}`;
  }

  function openBitacoraUpload(){
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    if(!modal.dataset.bitacoraId){bitaDocsStatus(modal,"Guarda primero la bitácora.","error");return;}
    if(!DOC_UPLOAD_URL){bitaDocsStatus(modal,"El enlace de carga todavía no está configurado.","error");return;}
    const since=new Date(Date.now()-30000).toISOString();
    modal.dataset.bitaSince=since;
    window.open(DOC_UPLOAD_URL,"_blank","noopener");
    bitaDocsStatus(modal,"Se abrió Microsoft para cargar el soporte. Cuando termine, vuelve aquí y pulsa “Verificar carga”.");
  }

  function renderBitacoraPendingDocs(modal,items){
    const wrap=modal.querySelector("#bitaPendingWrap"), list=modal.querySelector("#bitaPendingList");
    modal._bitaPendingDocs=items;
    wrap.hidden=!items.length;
    if(!items.length){list.innerHTML="";return;}
    list.innerHTML=items.map((f,i)=>`<label class="pending-file"><input type="radio" name="bitaPendingDoc" value="${i}" ${i===0?"checked":""}><span class="pending-file-main"><b>${esc(f.name)}</b><small>${f.created?esc(new Date(f.created).toLocaleString("es-CO")):"Carga reciente"}</small></span><span class="pending-file-id">SOPORTE</span></label>`).join("");
  }

  async function searchBitacoraPendingDocs(){
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    if(!modal.dataset.bitacoraId){bitaDocsStatus(modal,"Guarda primero la bitácora.","error");return;}
    const btn=modal.querySelector("#bitaVerifyBtn");
    const since=modal.dataset.bitaSince||new Date(Date.now()-30*60*1000).toISOString();
    btn.disabled=true; btn.textContent="VERIFICANDO…"; bitaDocsStatus(modal,"Buscando soportes cargados recientemente…");
    try{
      const response=await fetch(DOC_SEARCH_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","X-S2V-Access":access},body:JSON.stringify({desde:since})});
      const raw=await response.text(); let result={}; try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true) throw new Error(`Power Automate respondió ${response.status}`);
      const items=(Array.isArray(result.archivos)?result.archivos:[]).map(normalizePendingDoc).filter(x=>!!x.id&&!!x.identifier);
      renderBitacoraPendingDocs(modal,items);
      bitaDocsStatus(modal,items.length?`${items.length} soporte${items.length===1?"":"s"} encontrado${items.length===1?"":"s"}.`:"No encontré una carga nueva todavía.",items.length?"success":"");
    }catch(error){
      console.error("Error buscando soportes de bitácora",error);
      bitaDocsStatus(modal,"No fue posible verificar los soportes. Intenta nuevamente.","error");
    }finally{btn.disabled=false;btn.textContent="3 · VERIFICAR CARGA";}
  }

  async function associateBitacoraDoc(){
    const modal=document.getElementById("bitacoraModal"); if(!modal) return;
    const selected=modal.querySelector('input[name="bitaPendingDoc"]:checked');
    const file=selected?modal._bitaPendingDocs?.[Number(selected.value)]:null;
    const bitacoraId=clean(modal.dataset.bitacoraId);
    if(!bitacoraId||!file){bitaDocsStatus(modal,"Selecciona el soporte que quieres asociar.","error");return;}
    const btn=modal.querySelector("#bitaAssociateBtn");
    const payload={
      archivoId:file.id,
      nombreArchivo:file.name,
      identificadorArchivo:file.identifier,
      rutaArchivo:file.path,
      fechaCarga:file.created,
      mentor:clean(state.data?.mentor?.name),
      iniciativa:clean(modal.dataset.bitaIniciativa),
      etapa:`Etapa ${clean(modal.dataset.bitaEtapa)||CURRENT_STAGE_NUMBER}`,
      tipoDocumento:"Soporte de bitácora",
      asociacionEmpresa:false,
      bitacoraId:Number(bitacoraId)||bitacoraId,
      fechaBitacora:clean(modal.dataset.bitaFecha),
      fechaSesion:clean(modal.dataset.bitaFecha),
      sesionNumero:Number(clean(modal.dataset.bitaSesion))||null
    };
    btn.disabled=true; btn.textContent="ASOCIANDO…"; bitaDocsStatus(modal,"Asociando el soporte a la bitácora…");
    try{
      const response=await fetch(DOC_ASSOCIATE_URL,{method:"POST",headers:{"Content-Type":"application/json; charset=utf-8","X-S2V-Access":access},body:JSON.stringify(payload)});
      const raw=await response.text(); let result={}; try{result=raw?JSON.parse(raw):{};}catch(e){}
      if(!response.ok||result.ok!==true){
        const detail=clean(result.mensaje||result.error||result.message||raw);
        throw new Error(detail?`HTTP ${response.status} · ${detail}`:`HTTP ${response.status}`);
      }
      modal.dataset.bitaSupportAssociated="true";
      const flow=modal.querySelector("#bitaDocsFlow"); if(flow) flow.hidden=true;
      const complete=modal.querySelector("#bitaDocsComplete"); if(complete) complete.hidden=false;
      const completeFile=modal.querySelector("#bitaDocsCompleteFile"); if(completeFile) completeFile.textContent=file.name;
      const completeInitiative=modal.querySelector("#bitaDocsCompleteInitiative"); if(completeInitiative) completeInitiative.textContent=payload.iniciativa;
      const docsChoiceStatus=modal.querySelector("#bitaDocsChoiceStatus"); if(docsChoiceStatus){docsChoiceStatus.textContent="";docsChoiceStatus.className="bitacora-status";}
      const generalStatus=modal.querySelector("#bitacoraStatus"); if(generalStatus){generalStatus.textContent="Bitácora y soporte documental registrados correctamente.";generalStatus.className="bitacora-status is-success";}
      const noBtn=modal.querySelector("#bitaDocsNo"), yesBtn=modal.querySelector("#bitaDocsYes"); if(noBtn) noBtn.disabled=true; if(yesBtn) yesBtn.disabled=true;
      recordMentorDoc({iniciativa:payload.iniciativa,tipoDocumento:"Soporte de bitácora",nombreArchivo:file.name,fechaCarga:file.created,bitacoraId});
      modal._bitaPendingDocs=[];
      renderBitacoraPendingDocs(modal,[]);
    }catch(error){
      console.error("Error asociando soporte de bitácora",error);
      const detail=clean(error?.message);
      bitaDocsStatus(modal,detail?`No fue posible asociar el soporte. ${detail}`:"No fue posible asociar el soporte a la bitácora.","error");
    }finally{btn.disabled=false;btn.textContent="4 · ASOCIAR A ESTA BITÁCORA";}
  }

  function toolsHtml(){
    const resources=[
      {type:"PRESENTACIÓN",title:"Kick-Off Mentores · Cohorte I 2026",description:"Presentación de arranque para mentores: contexto de Science2Venture, ruta de acompañamiento, rol del mentor, asignaciones, seguimientos y próximos pasos.",file:"./recursos/kick-off-mentores-cohorte-i-2026.pptx",format:"PPTX"},
      {type:"FORMATO",title:"Plan de acompañamiento individual S2V",description:"Formato de trabajo para estructurar y registrar el acompañamiento individual de cada iniciativa durante la ruta.",file:"./recursos/plan-acompanamiento-individual-s2v.xlsx",format:"XLSX"},
      {type:"LÍNEA BASE",title:"Línea base Science2Venture",description:"Formato de apoyo para documentar la línea base técnico-comercial de cada iniciativa durante la Etapa 0.",file:"./recursos/lineas-base-construye-s2v.xlsx",format:"XLSX"}
    ];
    return `<section class="tool-bank"><div class="tool-bank-head"><div class="tool-bank-icon">↗</div><div><span class="source-label">BANCO DE HERRAMIENTAS</span><h2>Recursos para el acompañamiento</h2><p>Documentos de trabajo disponibles para los mentores de Science2Venture. Los archivos se descargan directamente desde esta plataforma.</p></div></div><div class="resource-grid">${resources.map(r=>`<article class="resource-card"><div class="resource-card-top"><span class="resource-type">${esc(r.type)}</span><span class="resource-format">${esc(r.format)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.description)}</p><a class="resource-action" href="${esc(r.file)}" download>DESCARGAR ARCHIVO <span aria-hidden="true">↓</span></a></article>`).join("")}</div><div class="notice">Estos recursos son comunes para todos los mentores y están disponibles directamente desde el ingreso principal de Mentor View.</div></section>`;
  }

  load();
})();
