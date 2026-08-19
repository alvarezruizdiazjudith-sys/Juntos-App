const body = document.body;
const personTab = document.getElementById('person-tab');
const entityTab = document.getElementById('entity-tab');
const tipoUsuario = document.getElementById('tipo_usuario');
const form = document.getElementById('juntos-form');
const submitBtn = document.getElementById('submit-btn');
const searchTitle = document.getElementById('search-title');
const modeNote = document.getElementById('mode-note');
const formStatus = document.getElementById('form-status');
const personFields = [...document.querySelectorAll('[data-mode="persona"]')];
const entityFields = [...document.querySelectorAll('[data-mode="entidad"]')];

function setMode(mode) {
  const isEntity = mode === 'entidad';
  body.classList.toggle('entity-mode', isEntity);
  tipoUsuario.value = isEntity ? 'entidad' : 'persona';
  personTab.setAttribute('aria-pressed', String(!isEntity));
  entityTab.setAttribute('aria-pressed', String(isEntity));
  searchTitle.textContent = isEntity ? 'Contanos qué necesita tu comunidad' : 'Contanos qué estás buscando';
  modeNote.textContent = isEntity
    ? 'Para clubes, asociaciones civiles, centros culturales y otras organizaciones barriales.'
    : 'Actividad, zona, horario y presupuesto.';
  submitBtn.textContent = isEntity ? 'Registrar una necesidad' : 'Sumar mi búsqueda';
  formStatus.textContent = '';
  formStatus.removeAttribute('data-state');

  personFields.forEach((field) => {
    field.hidden = isEntity;
    field.querySelectorAll('input,select').forEach((input) => {
      input.disabled = isEntity;
      if (input.dataset.required === 'true') input.required = !isEntity;
    });
  });

  entityFields.forEach((field) => {
    field.hidden = !isEntity;
    field.querySelectorAll('input,select').forEach((input) => {
      input.disabled = !isEntity;
      if (input.dataset.required === 'true') input.required = isEntity;
    });
  });
}

personTab.addEventListener('click', () => setMode('persona'));
entityTab.addEventListener('click', () => setMode('entidad'));
setMode('persona');

function getResponseData(raw) {
  if (Array.isArray(raw)) return raw[0] || {};
  if (raw && typeof raw === 'object' && raw.data && typeof raw.data === 'object') return raw.data;
  return raw && typeof raw === 'object' ? raw : {};
}

function formatBudget(value) {
  const amount = Number(value || 0);
  return amount ? `Hasta $${amount.toLocaleString('es-AR')}` : 'A definir';
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return ['true', '1', 'sí', 'si', 'yes'].includes(value.trim().toLowerCase());
  return false;
}

function normalizeBackendResult(data, backend) {
  const rawMiembros = Number(
    backend.cantidad_miembros ??
    backend.personas_compatibles ??
    backend.cantidad_compatibles ??
    0
  );
  const miembros = Number.isFinite(rawMiembros) ? Math.max(0, rawMiembros) : 0;

  const grupoFormado = parseBoolean(
    backend.grupo_formado ??
    backend.demanda_suficiente ??
    false
  );

  const estadoGrupo = backend.estado_grupo || (grupoFormado ? 'Grupo formado' : 'En formación');
  const nivelDemanda = backend.nivel_demanda || 'Demanda registrada';
  const actividad = data.actividad || 'Bienestar';
  const zona = data.zona || 'Tu zona';

  return {
    actividad,
    zona,
    tipo_usuario: data.tipo_usuario || 'persona',
    personas_compatibles: miembros,
    demanda_suficiente: grupoFormado,
    mensaje_usuario: backend.mensaje || backend.mensaje_usuario ||
      (grupoFormado
        ? 'Encontramos una coincidencia con suficiente demanda para empezar a organizarse.'
        : 'Registramos tu búsqueda. Cuando aparezcan más coincidencias en tu zona, la demanda va a empezar a hacerse visible.'),
    solicitud_id: backend.solicitud_id || null,
    grupo_id: backend.grupo_id || null,
    grupo_formado: grupoFormado,
    nivel_demanda: nivelDemanda,
    estado_grupo: estadoGrupo,
    backend_ok: backend.ok !== false,
    resultados: [
      {
        nombre: backend.grupo_id ? `Manada ${backend.grupo_id}` : 'Demanda en tu zona',
        tipo: nivelDemanda,
        actividad,
        zona,
        horario: data.franja_horaria || 'Flexible',
        precio_estimado: formatBudget(data.presupuesto_max),
        demanda: miembros,
        estado: estadoGrupo,
        descripcion: grupoFormado
          ? 'Tu búsqueda ya forma parte de un grupo con condiciones compatibles.'
          : 'Tu búsqueda quedó registrada y se irá agrupando con otras compatibles de la zona.'
      }
    ]
  };
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Buscando coincidencias…';
  form.setAttribute('aria-busy', 'true');
  formStatus.textContent = 'Estamos cruzando tu búsqueda con otras compatibles…';
  formStatus.removeAttribute('data-state');

  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    actividad: data.actividad || '',
    zona: data.zona || '',
    presupuesto_max: data.presupuesto_max ? Number(data.presupuesto_max) : 0,
    franja_horaria: data.franja_horaria || '',
    tipo_usuario: data.tipo_usuario || 'persona',
    nombre_entidad: data.nombre_entidad || '',
    tipo_entidad: data.tipo_entidad || '',
    cantidad_estimada: data.cantidad_estimada ? Number(data.cantidad_estimada) : null,
    objetivo_entidad: data.objetivo_entidad || ''
  };

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    const response = await fetch('/api/solicitud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).finally(() => window.clearTimeout(timeoutId));

    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(raw.error || raw.message || 'No pudimos procesar tu búsqueda.');
    }

    const backend = getResponseData(raw);
    const result = normalizeBackendResult(data, backend);
    sessionStorage.setItem('juntos_resultado', JSON.stringify(result));

    window.location.href = `./resultados.html?actividad=${encodeURIComponent(result.actividad)}&zona=${encodeURIComponent(result.zona)}`;
  } catch (error) {
    console.error('Error enviando la solicitud a JUNTOS:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
    form.removeAttribute('aria-busy');
    formStatus.dataset.state = 'error';
    formStatus.textContent = error.name === 'AbortError'
      ? 'La búsqueda está tardando más de lo esperado. Probá nuevamente.'
      : `No pudimos conectar con JUNTOS. ${error.message || 'Probá nuevamente en unos segundos.'}`;
  }
});
