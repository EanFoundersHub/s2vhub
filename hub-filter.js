/* ── Science2Venture · Shared cross-filter store ──
   Fuente única de verdad para el filtrado cruzado. Tanto la Radiografía
   como el Mapa por componentes leen y escriben el mismo estado, de modo
   que fijar una variable en cualquier vista recalcula todo el tablero.

   Normaliza los campos de selección múltiple (separados por ";") para
   contarlos correctamente categoría por categoría. */
window.S2V_Filter = (function () {

  let allP = [];
  let filters = {};           // { dim: value }
  const listeners = [];

  function splitMulti(v) {
    return String(v == null ? "" : v).split(";").map(s => s.trim()).filter(Boolean);
  }
  function trim(v) { return String(v == null ? "" : v).trim(); }

  function trlNum(i) { return parseInt(i.TRLNumero) || parseInt(String(i.TRLDeclarado || "").replace(/\D/g, "")) || 0; }
  function mujeres(i) { return parseInt(i.MujeresEquipo) || 0; }
  function yesNo(v) { const t = trim(v); return /^s[íi]/i.test(t) ? "Sí" : (t ? "No" : ""); }

  /* ── Dimension registry ──
     get → value(s) for a record;  multi → split & count each option.
     order:'level' sorts by embedded number (TRL/CRL/BRL). */
  const DIMS = {
    // Madurez
    RutaTRL:      { label: "Ruta TRL",                get: i => i.RutaTRL,        order: "level" },
    TRLDeclarado: { label: "TRL declarado",           get: i => i.TRLDeclarado,   order: "level" },
    CRLDeclarado: { label: "CRL declarado",           get: i => i.CRLDeclarado,   order: "level" },
    BRLDeclarado: { label: "BRL declarado",           get: i => i.BRLDeclarado,   order: "level" },
    // Tecnología
    Enfoque:        { label: "Enfoque / base",        get: i => i.Enfoque },
    TipoTecnologia: { label: "Tipo de tecnología",    get: i => i.TipoTecnologia },
    TecnologiaPropia:{ label: "Tecnología propia",    get: i => i.TecnologiaPropia },
    Complejidad:    { label: "Complejidad técnica",   get: i => i.Complejidad },
    EntornoPrueba:  { label: "Entorno de prueba",     get: i => i.EntornoPrueba },
    Brecha:         { label: "Brecha técnica",        get: i => i.Brecha },
    // Problema & validación
    IdentificacionProblema: { label: "Identificación del problema", get: i => i.IdentificacionProblema },
    ValidacionProblema:     { label: "Validación del problema",     get: i => i.ValidacionProblema, multi: true },
    PersonasEntrevistadas:  { label: "Personas entrevistadas",      get: i => i.PersonasEntrevistadas },
    EvidenciasTecnicas:     { label: "Evidencias técnicas",         get: i => i.EvidenciasTecnicas },
    EvidenciasConcretas:    { label: "Tipo de evidencias",          get: i => i.EvidenciasConcretas, multi: true },
    PropuestaValorEstructura:{ label: "Propuesta de valor",         get: i => i.PropuestaValorEstructura },
    // Mercado
    ClienteTipo:    { label: "Tipo de cliente",       get: i => i.ClienteTipo, multi: true },
    AlcanceGeografico:{ label: "Alcance geográfico",  get: i => i.AlcanceGeografico },
    TamanoMercado:  { label: "Tamaño de mercado",     get: i => i.TamanoMercado },
    Competencia:    { label: "Conocimiento competencia", get: i => i.Competencia },
    Diferenciacion: { label: "Diferenciación",        get: i => i.Diferenciacion, multi: true },
    Canales:        { label: "Canales",               get: i => i.Canales, multi: true },
    EvidenciaInteres:{ label: "Evidencia de interés", get: i => i.EvidenciaInteres, multi: true },
    AliadosEstrategicos:{ label: "Aliados estratégicos", get: i => i.AliadosEstrategicos },
    // Negocio & tracción
    FuenteIngresos: { label: "Fuente de ingresos",    get: i => i.FuenteIngresos },
    PrecioValidado: { label: "Precio validado",       get: i => i.PrecioValidado },
    NumerosNegocio: { label: "Números del negocio",   get: i => i.NumerosNegocio },
    HaFacturado:    { label: "¿Ha facturado?",        get: i => yesNo(i.HaFacturado) },
    PuntoEquilibrio:{ label: "Punto de equilibrio",   get: i => i.PuntoEquilibrio },
    RegistrosContables:{ label: "Registros contables",get: i => i.RegistrosContables },
    // Inversión & finanzas
    InversionAcumulada:{ label: "Inversión acumulada",get: i => i.InversionAcumulada },
    FuentesInversion:{ label: "Fuentes de inversión", get: i => i.FuentesInversion, multi: true },
    Necesidad12m:   { label: "Necesidad 12 meses",    get: i => i.Necesidad12m },
    Recursos6m:     { label: "Recursos para 6 meses", get: i => i.Recursos6m },
    BuscaInversion: { label: "Busca inversión",       get: i => i.BuscaInversion },
    // PI & legal
    EstadoPI:       { label: "Estado de PI",          get: i => i.EstadoPI },
    TipoPI:         { label: "Tipo de protección",    get: i => i.TipoPI, multi: true },
    DuenoPI:        { label: "Titularidad de la PI",  get: i => i.DuenoPI },
    FreedomToOperate:{ label: "Libertad de operación",get: i => i.FreedomToOperate },
    EstadoLegal:    { label: "Estado legal",          get: i => i.EstadoLegal },
    PosturaEquityEan:{ label: "Postura equity EAN",   get: i => i.PosturaEquityEan },
    Regulatorio:    { label: "Requisitos regulatorios", get: i => i.Regulatorio, multi: true },
    // Equipo
    RolesEquipo:    { label: "Roles cubiertos",       get: i => i.RolesEquipo, multi: true },
    ExperienciaPrevia:{ label: "Experiencia previa",  get: i => i.ExperienciaPrevia },
    DedicacionEquipo:{ label: "Dedicación",           get: i => i.DedicacionEquipo },
    DisposicionTC:  { label: "Disposición tiempo completo", get: i => i.DisposicionTC },
    DisposicionPivotear:{ label: "Disposición a pivotear", get: i => i.DisposicionPivotear },
    MujeresRango:   { label: "Mujeres en el equipo",  get: i => { const m = mujeres(i); return m === 0 ? "Sin mujeres" : m === 1 ? "1 mujer" : m === 2 ? "2 mujeres" : "3 o más"; } },
    // Impacto & sostenibilidad
    ODS:            { label: "ODS",                   get: i => i.ODS, multi: true },
    Sectores:       { label: "Sectores",              get: i => i.Sectores, multi: true },
    Sostenibilidad: { label: "Vertical sostenibilidad", get: i => i.Sostenibilidad, multi: true },
    MideImpacto:    { label: "Medición de impacto",   get: i => i.MideImpacto },
    // Perfil académico & origen
    Vinculacion:    { label: "Vinculación EAN",       get: i => trim(i.Vinculacion) },
    NivelEducativo: { label: "Nivel educativo",       get: i => i.NivelEducativo },
    Modalidad:      { label: "Modalidad",             get: i => i.Modalidad },
    AreaConocimiento:{ label: "Área de conocimiento", get: i => i.AreaConocimiento },
    Pregrado:       { label: "Programa (pregrado)",   get: i => i.Pregrado },
    AnoInicio:      { label: "Año de inicio",         get: i => i.AnoInicio },
    Semillero:      { label: "Origen semillero",      get: i => (i.SurgeGrupoSemillero || "").startsWith("Sí") ? "Sí" : "No" },
    Ciudad:         { label: "Ciudad",                get: i => trim(i.Ciudad) },
    // KPI / derived (match-only)
    ConMujeres:     { label: "Equidad",   match: i => mujeres(i) > 0 },
    TRL7plus:       { label: "Madurez",   match: i => trlNum(i) >= 7 }
  };

  function rawVals(dim, item) {
    const d = DIMS[dim];
    if (!d || d.match) return [];
    const g = d.get(item);
    if (d.multi) return Array.isArray(g) ? g.map(trim).filter(Boolean) : splitMulti(g);
    const v = trim(g);
    return v ? [v] : [];
  }

  function matchItem(item, dim, value) {
    const d = DIMS[dim];
    if (!d) return true;
    if (d.match) return d.match(item, value);
    return rawVals(dim, item).includes(value);
  }

  function hasFilters() { return Object.keys(filters).length > 0; }

  function getFiltered() {
    const keys = Object.keys(filters);
    if (!keys.length) return allP.slice();
    return allP.filter(it => keys.every(dim => matchItem(it, dim, filters[dim])));
  }
  function filteredExcept(dim) {
    const keys = Object.keys(filters).filter(d => d !== dim);
    if (!keys.length) return allP.slice();
    return allP.filter(it => keys.every(d => matchItem(it, d, filters[d])));
  }

  /* distribution of a dimension over a list → {entries:[[label,count]], answered, total, multi} */
  function distribution(dim, list) {
    const d = DIMS[dim] || {};
    const map = {};
    let answered = 0;
    list.forEach(it => {
      const vs = rawVals(dim, it);
      if (vs.length) answered++;
      vs.forEach(v => { map[v] = (map[v] || 0) + 1; });
    });
    let entries = Object.entries(map);
    if (d.order === "level") {
      entries.sort((a, b) => (parseInt(a[0].replace(/\D/g, "")) || 0) - (parseInt(b[0].replace(/\D/g, "")) || 0));
    } else {
      entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }
    return { entries, answered, total: list.length, multi: !!d.multi };
  }

  function pct(n, base) { return base ? Math.round((n / base) * 100) : 0; }

  function escHtml(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escAttr(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }

  /* Roster of the currently filtered initiatives — clickable chips that
     open each initiative's profile (handled by window.S2V_Nav). */
  function rosterHtml() {
    const list = getFiltered();
    if (!list.length) return "";
    const chips = list.map(i => {
      const id = String(i.IDIniciativa || "").trim();
      const name = String(i.NombreIniciativa || "Iniciativa").trim();
      const short = name.length > 15 ? name.slice(0, 15).trim() + "…" : name;
      return `<button class="ana-ini-chip" data-initiative-id="${escAttr(id)}" type="button" title="${escAttr(id + " · " + name)}">${escHtml(short)}</button>`;
    }).join("");
    return `<div class="ana-roster">
      <div class="ana-roster-head"><span class="fb-label">Iniciativas en la selección</span><span class="ana-roster-count">${list.length}</span><span class="ana-roster-hint">clic para abrir su perfil →</span></div>
      <div class="ana-roster-list">${chips}</div>
    </div>`;
  }

  /* shorten long enumerated answers for display (full text kept as tooltip) */
  function shorten(s, n) {
    n = n || 46;
    let t = String(s == null ? "" : s).replace(/\s+/g, " ").trim().replace(/[.;,\s]+$/, "");
    const cut = t.search(/[(:]/);
    if (cut > 10) t = t.slice(0, cut).trim().replace(/[.;,\s]+$/, "");
    if (t.length > n) t = t.slice(0, n).trim() + "…";
    return t;
  }

  function shortSector(s) {
    if (s.length <= 30) return s;
    const map = { "Inteligencia artificial": "IA y computación", "Tecnologías de la información": "TIC", "Economía digital": "Economía digital", "Economía verde": "Economía verde / circular", "Ciencias de la vida": "Ciencias de la vida", "Industrias creativas": "Industrias creativas", "Industria de alimentos": "Alimentos y bebidas", "Agroindustria": "Agroindustria", "Farmacéutico": "Farma y biotech", "Instrumentos de precisión": "Instrumentos médicos", "Aeroespacial": "Aeroespacial / defensa", "Electrónica": "Electrónica", "Construcción": "Construcción", "Petroquímica": "Petroquímica" };
    for (const [k, v] of Object.entries(map)) if (s.includes(k)) return v;
    return s.slice(0, 28) + "…";
  }

  /* Curated short labels per dimension. Each entry: [needle (lowercase), short].
     The first needle found inside the answer text wins (scoped by dimension). */
  const SHORT = {
    TipoTecnologia: [["plataforma digital propia", "Plataforma digital propia"], ["producto principal", "Tecnología propia (producto)"], ["deep tech", "Deep Tech"], ["tecnologías avanzadas existentes", "Tecnologías avanzadas"], ["procesos tradicionales", "Procesos tradicionales"]],
    TecnologiaPropia: [["antes no existía", "Combina tecnologías existentes"], ["una parte la desarrollamos", "Mixta (propia + existente)"], ["adaptamos o personalizamos", "Adapta tecnologías existentes"], ["desde cero", "Propia desde cero"], ["sin modificarlas", "Solo herramientas existentes"]],
    Complejidad: [["muy alto", "Muy alto (Deep Tech)"], ["muy bajo", "Muy bajo"], ["medio", "Medio"], ["alto", "Alto"], ["bajo", "Bajo"]],
    EntornoPrueba: [["solo en papel", "Papel / simulación"], ["operación real continuada", "Operación real continuada"], ["entorno simulado", "Entorno simulado realista"], ["laboratorio controlado", "Laboratorio controlado"], ["modo piloto", "Piloto con cliente"]],
    Brecha: [["primer prototipo integrado", "Primer prototipo integrado"], ["infraestructura que ya tiene", "Integración con cliente"], ["escalar el prototipo", "Escalar a condiciones reales"], ["confiable, reproducible", "Confiabilidad / durabilidad"], ["no tengo claro", "Sin claridad de brechas"], ["lista para escalar", "Lista para escalar"]],
    IdentificacionProblema: [["experiencia directa", "Experiencia directa"], ["nos trajo el problema", "Lo trajo un cliente"], ["literatura académica", "Literatura / reportes"], ["hallazgo científico", "Desde la tecnología"]],
    PersonasEntrevistadas: [["1 y 5", "1–5 personas"], ["más de 30", "30+ personas"], ["6 y 15", "6–15 personas"], ["16 y 30", "16–30 personas"], ["ninguna", "Ninguna aún"]],
    EvidenciasTecnicas: [["pueden ser revisadas", "Sí, documentadas"], ["preparando la documentación", "En preparación"], ["no cuento todavía", "Sin evidencias aún"]],
    PropuestaValorEstructura: [["validado con al menos 5", "Validada con 5+ clientes"], ["ajustada varias veces", "Validada y ajustada"], ["cliente, problema, beneficio", "Estructurada"], ["frase general", "Frase general"]],
    AlcanceGeografico: [["internacional", "Internacional"], ["territorio nacional", "Nacional"], ["principales ciudades", "Principales ciudades"], ["municipio", "Local"]],
    TamanoMercado: [["tam, sam y som", "TAM/SAM/SOM documentado"], ["tam y sam", "TAM y SAM"], ["el tam", "Solo TAM"], ["idea general", "Idea general (sin fuentes)"], ["no lo he estimado", "Sin estimar"]],
    Competencia: [["benchmark", "Benchmark formal"], ["alternativas o sustitutas", "Alternativas identificadas"], ["competidores directos", "Competidores mapeados"], ["no existe competencia", "Sin competencia directa"], ["no he investigado", "Sin investigar"]],
    AliadosEstrategicos: [["conversaciones informales", "Conversaciones informales"], ["no tengo aliados", "Sin aliados formales"], ["no vinculantes", "MoU / cartas"], ["red activa", "Red activa (3+)"]],
    FuenteIngresos: [["combinación", "Combinación"], ["venta única", "Venta única"], ["servicios asociados", "Servicios asociados"], ["no he pensado", "Sin definir"], ["suscripción", "Suscripción"]],
    PrecioValidado: [["mirando a la competencia", "Estimado por comparables"], ["efectivamente lo pagó", "Validado con ventas"], ["rango aceptable", "Conversado con clientes"], ["no he pensado", "Sin definir"], ["costos + margen", "Costos + margen"]],
    NumerosNegocio: [["estimado en papel", "Estimados en papel"], ["mejorar los márgenes", "Medidos + plan márgenes"], ["modelado con supuestos", "Modelados"], ["no los he calculado", "Sin calcular"], ["datos reales", "Medidos (datos reales)"]],
    PuntoEquilibrio: [["alcanzamos el punto", "Alcanzado"], ["menos del 70", "<70% costos"], ["70% y el 100", "70–100% costos"]],
    RegistrosContables: [["formales, pero", "Formales (propios)"], ["básicos informales", "Básicos / informales"], ["ningún registro", "Sin registros"]],
    InversionAcumulada: [["menos de 10", "< $10M COP"], ["10 y 50", "$10–50M"], ["50 y 200", "$50–200M"]],
    Necesidad12m: [["20 y 70", "$20–70M"], ["70 y 300", "$70–300M"], ["menos de 20", "< $20M"], ["no lo he estimado", "Sin estimar"]],
    Recursos6m: [["menos del 50", "Parcial (<50%)"], ["50% y 80", "Ajustado (50–80%)"], ["más del 80", "Con holgura (>80%)"], ["no", "No"]],
    BuscaInversion: [["etapa de preparación", "Sí, preparando"], ["no es una prioridad", "No es prioridad"]],
    EstadoPI: [["no he pensado", "Sin pensar"], ["análisis preliminar", "Análisis preliminar"], ["radicamos una solicitud", "Solicitud radicada"], ["preparando la solicitud", "Preparando solicitud"], ["secreto industrial", "Secreto industrial"]],
    DuenoPI: [["no está definida", "Sin definir"], ["co-titularidad de los investigadores", "Ean + investigadores"], ["tercero externo", "Tercero externo"], ["empresa privada", "Co-titularidad empresa"]],
    FreedomToOperate: [["revisión informal", "Revisión informal"], ["bases de patentes", "Análisis preliminar"], ["no he considerado", "No considerado"]],
    EstadoLegal: [["no he pensado", "Sin constituir"], ["figura jurídica", "Evaluando figura jurídica"], ["operaciones regulares", "Constituida y operando"], ["con rut", "Constituida con RUT"]],
    PosturaEquityEan: [["si estoy de acuerdo", "A favor de equity EAN"], ["no estoy de acuerdo", "En contra"]],
    Regulatorio: [["no requiere", "No requiere"], ["otro regulador", "Otro regulador"], ["invima", "INVIMA"], ["ica", "ICA"]],
    ExperienciaPrevia: [["empresa exitosa", "Empresa exitosa previa"], ["bootcamps", "Formación emprendimiento"], ["ninguno tiene", "Sin experiencia"], ["no haya prosperado", "Empresa previa (falló)"], ["transferencia tecnológica", "Transferencia tecnológica"]],
    DedicacionEquipo: [["más de 20", "20+ h/sem"], ["tiempo completo", "Tiempo completo"], ["9 y 12", "9–12 h/sem"], ["menos de 5", "<5 h/sem"], ["13 y 20", "13–20 h/sem"], ["5 y 8", "5–8 h/sem"]],
    DisposicionTC: [["al menos una persona", "1 persona comprometida"], ["dedicado tiempo completo", "Ya hay dedicación TC"], ["dedicación parcial", "Solo parcial"]],
    DisposicionPivotear: [["5 —", "5 · Totalmente"], ["4 —", "4 · De acuerdo"], ["3 —", "3 · Neutral"], ["2 —", "2 · En desacuerdo"]],
    MideImpacto: [["cualitativas generales", "Cualitativas generales"], ["no hemos definido", "Sin definir"], ["aún no las medimos", "Cuantificables (sin medir)"], ["pilotos o escenarios", "Medido en pilotos"]],
    AreaConocimiento: [["interdisciplinar", "Interdisciplinar"], ["médicas y de la salud", "Ciencias médicas y salud"], ["agrícolas", "Ciencias agrícolas"], ["ingeniería", "Ingeniería y tecnología"]],
    ValidacionProblema: [["literatura académica", "Literatura académica"], ["entrevistas informales", "Entrevistas informales"], ["pruebas piloto", "Pruebas piloto"], ["estudios previos", "Estudios previos"], ["pagando o pilotando", "Cliente pagando/pilotando"], ["entrevistas estructuradas", "Entrevistas estructuradas"], ["encuestas cuantitativas", "Encuestas cuantitativas"], ["es mi hipótesis", "Sin validar (hipótesis)"]],
    EvidenciasConcretas: [["no tenemos evidencias", "Sin evidencias"], ["ponencia", "Ponencia / evento"], ["prototipo físico", "Prototipo (fotos/video)"], ["repositorio público", "Repositorio público"], ["tesis", "Tesis vinculada"], ["reporte técnico", "Reporte técnico interno"], ["dataset", "Dataset propio"], ["ensayos certificados", "Ensayos certificados"], ["publicación científica", "Publicación indexada"]],
    Diferenciacion: [["comunidad o red", "Comunidad / red"], ["marca o posicionamiento", "Marca temprana"], ["know-how", "Know-how difícil de replicar"], ["costos más eficientes", "Costos más eficientes"], ["datos propios", "Datos propios"], ["infraestructura, laboratorios", "Infraestructura / alianzas"], ["regulaciones, permisos", "Permisos / certificaciones"], ["no hemos identificado", "Sin diferenciador claro"], ["tecnología protegida", "Tecnología protegida"]],
    Canales: [["e-commerce propio", "Plataforma / e-commerce"], ["equipo fundador", "Venta directa (fundadores)"], ["equipo comercial propio", "Equipo comercial propio"], ["integran nuestra solución", "Alianzas integradoras"], ["no he pensado", "Sin definir"], ["distribuidores", "Distribuidores"], ["marketplaces de terceros", "Marketplaces de terceros"]],
    EvidenciaInteres: [["buena idea", "Interés verbal"], ["pilotos no pagados", "Pilotos no pagados"], ["pilotos pagados", "Pilotos pagados"], ["ninguna evidencia", "Sin evidencia"], ["cartas de intención", "Cartas de intención (LOI)"], ["confidencialidad", "NDA firmados"], ["contratos de venta", "Contratos firmados"], ["otro", "Otro"]],
    FuentesInversion: [["fff", "Propios / FFF"], ["empresas aliadas", "Empresas aliadas"], ["ángeles", "Ángeles / VC"]],
    TipoPI: [["registro de software", "Registro de software"], ["diseño industrial", "Diseño industrial"], ["no aplicamos", "Ninguno"], ["patente", "Patente"], ["registro de marca", "Marca"], ["secreto industrial", "Secreto industrial"], ["modelo de utilidad", "Modelo de utilidad"]],
    RolesEquipo: [["investigador principal", "Investigador principal"], ["desarrollo comercial", "Negocio / comercial"], ["co-investigador", "Co-investigador técnico"], ["producto, ux", "Producto / UX"], ["financiero u operaciones", "Financiero / operaciones"], ["comunicación y relación", "Comunicación / ecosistema"], ["propiedad intelectual", "PI / legal"]]
  };

  function label(dim, value) {
    const raw = String(value == null ? "" : value);
    if (dim === "ODS") { const m = raw.match(/ODS\s*(\d+)/); return m ? "ODS " + m[1] : raw; }
    if (dim === "Sectores") return shortSector(raw.trim());
    if (dim === "ClienteTipo") {
      if (/-B2B/i.test(raw)) return "B2B (empresas)";
      if (/-C2C/i.test(raw)) return "C2C (marketplace)";
      if (/-B2G/i.test(raw)) return "B2G (gobierno)";
      if (/-B2C/i.test(raw)) return "B2C (consumidor)";
      return "Sin definir";
    }
    if (dim === "Pregrado") return shorten(raw.replace("Carrera de ", "").replace(/\s*\+.*$/, ""), 26);
    const rules = SHORT[dim];
    if (rules) {
      const low = raw.toLowerCase();
      for (const [needle, short] of rules) if (low.includes(needle)) return short;
    }
    return shorten(raw, 40);
  }

  function emit() {
    const f = getFiltered();
    const snap = Object.assign({}, filters);
    listeners.forEach(l => { try { l(f, snap); } catch (e) { console.error(e); } });
  }

  return {
    DIMS,
    setData(p) { allP = p || []; },
    init(p) { allP = p || []; filters = {}; },
    getData() { return allP; },
    get filters() { return filters; },
    hasFilters, getFiltered, filteredExcept, matchItem, distribution, rawVals,
    pct, shorten, shortSector, label, rosterHtml,
    toggle(dim, value) { if (filters[dim] === value) delete filters[dim]; else filters[dim] = value; emit(); },
    remove(dim) { delete filters[dim]; emit(); },
    clear() { if (hasFilters()) { filters = {}; emit(); } },
    subscribe(fn) { if (typeof fn === "function") listeners.push(fn); }
  };
})();
