const body = document.body;
const personTab = document.getElementById('person-tab');
const entityTab = document.getElementById('entity-tab');
const tipoUsuario = document.getElementById('tipo_usuario');
const form = document.getElementById('juntos-form');
const submitBtn = document.getElementById('submit-btn');
const personFields = [...document.querySelectorAll('[data-mode="persona"]')];
const entityFields = [...document.querySelectorAll('[data-mode="entidad"]')];

const demoPlaces = [
  { nombre:'Casa Yoga Sur', actividad:'Yoga', zona:'Palermo', horario:'Mañana', precio:30000, tipo:'Yoga y movilidad' },
  { nombre:'Ritmo Club', actividad:'Danza', zona:'Palermo', horario:'Noche', precio:50000, tipo:'Danza y movimiento' },
  { nombre:'Fit Sur Club', actividad:'Funcional', zona:'Belgrano', horario:'Después del trabajo', precio:50000, tipo:'Funcional + entrenamiento' },
  { nombre:'Espacio Movimiento', actividad:'Pilates', zona:'Belgrano', horario:'Tarde', precio:70000, tipo:'Pilates y movilidad' },
  { nombre:'Club de la Comunidad', actividad:'Gimnasio', zona:'Adrogué', horario:'Flexible', precio:30000, tipo:'Gimnasio + actividades barriales' },
  { nombre:'Centro Activo', actividad:'Boxeo', zona:'Adrogué', horario:'Noche', precio:50000, tipo:'Boxeo recreativo' },
  { nombre:'Aqua Barrio', actividad:'Natación', zona:'Caballito', horario:'Mañana', precio:70000, tipo:'Natación y bienestar' },
  { nombre:'Movimiento 360', actividad:'Funcional', zona:'Caballito', horario:'Tarde', precio:50000, tipo:'Funcional y fuerza' },
  { nombre:'Pausa Studio', actividad:'Yoga', zona:'Villa Crespo', horario:'Tarde', precio:50000, tipo:'Yoga y respiración' },
  { nombre:'Norte Pilates', actividad:'Pilates', zona:'Vicente López', horario:'Mañana', precio:70000, tipo:'Pilates reformer' },
  { nombre:'Comunidad Activa', actividad:'Gimnasio', zona:'Quilmes', horario:'Después del trabajo', precio:50000, tipo:'Entrenamiento y comunidad' },
  { nombre:'Fuerza Sur', actividad:'Boxeo', zona:'Quilmes', horario:'Noche', precio:50000, tipo:'Boxeo y acondicionamiento' }
];

function setMode(mode) {
  const isEntity = mode === 'entidad';
  body.classList.toggle('entity-mode', isEntity);
  tipoUsuario.value = isEntity ? 'entidad' : 'persona';
  personTab.setAttribute('aria-selected', String(!isEntity));
  entityTab.setAttribute('aria-selected', String(isEntity));

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

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function scorePlace(place, data) {
  let score = 0;
  if (normalize(place.actividad) === normalize(data.actividad)) score += 5;
  if (normalize(place.zona).includes(normalize(data.zona)) || normalize(data.zona).includes(normalize(place.zona))) score += 4;
  if (normalize(place.horario) === normalize(data.franja_horaria)) score += 2;
  const budget = Number(data.presupuesto_max || 0);
  if (!budget || place.precio <= budget) score += 2;
  return score;
}

function buildResults(data) {
  const ranked = demoPlaces
    .map((place) => ({ ...place, score: scorePlace(place, data) }))
    .sort((a, b) => b.score - a.score || a.precio - b.precio)
    .slice(0, 3);

  const demandBase = data.tipo_usuario === 'entidad'
    ? Math.max(18, Number(data.cantidad_estimada || 25))
    : 18 + Math.min(18, (normalize(data.zona).length + normalize(data.actividad).length));

  return ranked.map((place, index) => ({
    nombre: place.nombre,
    tipo: place.tipo,
    zona: place.zona,
    horario: place.horario,
    precio_estimado: `$${place.precio.toLocaleString('es-AR')}`,
    demanda: demandBase + (index * 4),
    estado: index === 0 ? 'Mejor coincidencia' : index === 1 ? 'Oportunidad para negociar' : 'Grupo en formación'
  }));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Buscando oportunidades…';

  const data = Object.fromEntries(new FormData(form).entries());
  const resultados = buildResults(data);
  const personasCompatibles = resultados.reduce((max, item) => Math.max(max, Number(item.demanda) || 0), 0);

  const payload = {
    actividad: data.actividad || 'Bienestar',
    zona: data.zona || 'Tu zona',
    personas_compatibles: personasCompatibles,
    demanda_suficiente: personasCompatibles >= 25,
    mensaje_usuario: data.tipo_usuario === 'entidad'
      ? 'Encontramos señales de demanda compatibles con la comunidad que describiste.'
      : 'Encontramos opciones y personas con intereses similares para tu búsqueda.',
    resultados
  };

  sessionStorage.setItem('juntos_resultado', JSON.stringify(payload));

  await new Promise((resolve) => setTimeout(resolve, 700));
  window.location.href = `./resultados.html?actividad=${encodeURIComponent(payload.actividad)}&zona=${encodeURIComponent(payload.zona)}`;
});
