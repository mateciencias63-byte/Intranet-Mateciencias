(function () {
  const user = sessionStorage.getItem('secretariaUsuario') || '';
  const allowed = window.UsuarioService?.userIsInList?.(user, window.secretariaAutorizados || []) === true;
  if (!allowed) {
    sessionStorage.removeItem('secretariaUsuario');
    window.location.replace('tarjetas/secretaria/secretaria-login.html');
    return;
  }

  const modules = [
    { id: 'inicio', title: 'Panel principal', icon: '⌂', description: 'Resumen operativo de Secretaría Académica.' },
    { id: 'estudiantes', title: 'Gestión de estudiantes', icon: '♙', description: 'Expediente y estado académico de cada estudiante.', fields: [
      ['codigo','Código de estudiante','text'],['nombres','Nombres y apellidos','text'],['dni','DNI','text'],['telefono','Teléfono','tel'],['correo','Correo','email'],['nacimiento','Fecha de nacimiento','date'],['procedencia','Institución de procedencia','text'],['carrera','Carrera a la que postula','text'],['apoderado','Apoderado','text'],['estado','Estado del alumno','select','Activo|Inactivo|Egresado|Retirado']
    ]},
    { id: 'matriculas', title: 'Matrículas', icon: '▧', description: 'Nuevas matrículas y renovaciones por periodo.', fields: [
      ['tipo','Tipo','select','Nueva matrícula|Renovación'],['estudiante','Estudiante','text'],['ciclo','Ciclo académico','text'],['programa','Curso o programa','text'],['turno','Turno','select','Mañana|Tarde|Noche'],['grupo','Grupo','text'],['modalidad','Modalidad','select','Virtual|Presencial|Híbrida'],['fecha','Fecha de inscripción','date'],['estado','Estado de matrícula','select','Pendiente|Activa|Observada|Anulada']
    ]},
    { id: 'cursos', title: 'Cursos y ciclos', icon: '▤', description: 'Oferta académica, asignaturas, docentes y vacantes.', fields: [
      ['nombre','Nombre del ciclo','text'],['duracion','Duración','text'],['inicio','Fecha de inicio','date'],['fin','Fecha de fin','date'],['asignaturas','Asignaturas','textarea'],['horarios','Horarios','text'],['docentes','Docentes','text'],['aulas','Aulas o salas virtuales','text'],['vacantes','Número de vacantes','number'],['estado','Estado','select','Activo|Planificado|Finalizado']
    ]},
    { id: 'horarios', title: 'Horarios académicos', icon: '◷', description: 'Horarios y reprogramaciones por alumno, docente y grupo.', fields: [
      ['alumno','Alumno','text'],['docente','Docente','text'],['curso','Curso','text'],['grupo','Grupo','text'],['aula','Aula o sala virtual','text'],['dia','Día','select','Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo'],['inicio','Hora de inicio','time'],['fin','Hora de fin','time'],['cambio','Cambio o reprogramación','textarea']
    ]},
    { id: 'asistencia', title: 'Asistencia', icon: '✓', description: 'Control diario y porcentaje mensual de asistencia.', fields: [
      ['estudiante','Estudiante','text'],['curso','Curso','text'],['fecha','Fecha','date'],['estado','Asistencia','select','Presente|Tardanza|Falta|Falta justificada'],['porcentaje','Porcentaje de asistencia','number'],['mes','Reporte mensual','month'],['observacion','Observación','textarea']
    ]},
    { id: 'notas', title: 'Notas y evaluaciones', icon: 'A+', description: 'Resultados, promedios, ranking y observaciones.', fields: [
      ['estudiante','Estudiante','text'],['curso','Curso','text'],['practicas','Prácticas','number'],['tareas','Tareas','number'],['simulacros','Simulacros','number'],['examenes','Exámenes','number'],['promedioCurso','Promedio por curso','number'],['promedioGeneral','Promedio general','number'],['ranking','Ranking','number'],['observacion','Observaciones','textarea']
    ]},
    { id: 'simulacros', title: 'Simulacros', icon: '★', description: 'Seguimiento de puntaje, ranking y evolución.', fields: [
      ['estudiante','Estudiante','text'],['fecha','Fecha','date'],['tipo','Tipo de examen','text'],['puntaje','Puntaje obtenido','number'],['correctas','Respuestas correctas','number'],['incorrectas','Respuestas incorrectas','number'],['posicion','Posición en ranking','number'],['evolucion','Evolución del estudiante','textarea']
    ]},
    { id: 'docentes', title: 'Docentes', icon: '♟', description: 'Datos, asignaciones, horarios y carga académica.', fields: [
      ['nombre','Nombres y apellidos','text'],['dni','DNI','text'],['telefono','Teléfono','tel'],['correo','Correo','email'],['cursos','Cursos asignados','textarea'],['horarios','Horarios','text'],['asistencia','Asistencia docente','text'],['grupos','Grupos asignados','text'],['carga','Carga académica','text']
    ]},
    { id: 'documentos', title: 'Documentos académicos', icon: '▥', description: 'Emisión y seguimiento de documentos académicos.', fields: [
      ['estudiante','Estudiante','text'],['tipo','Tipo de documento','select','Constancia de estudios|Constancia de matrícula|Certificado|Récord de notas|Ficha del estudiante|Carnet|Certificado de logro|Otro'],['codigo','Código de documento','text'],['fecha','Fecha de emisión','date'],['estado','Estado','select','Solicitado|En elaboración|Emitido|Entregado'],['detalle','Detalle','textarea']
    ]},
    { id: 'tramites', title: 'Trámites y solicitudes', icon: '☷', description: 'Solicitudes académicas y seguimiento de atención.', fields: [
      ['estudiante','Estudiante','text'],['tipo','Tipo de trámite','select','Cambio de horario|Cambio de grupo|Retiro de curso|Justificación de faltas|Duplicado de documento|Solicitud especial'],['fecha','Fecha de solicitud','date'],['responsable','Responsable','text'],['estado','Estado','select','Pendiente|En proceso|Aprobado|Rechazado|Atendido'],['detalle','Detalle de solicitud','textarea']
    ]},
    { id: 'pagos', title: 'Control de pagos académico', icon: 'S/', description: 'Control académico asociado a matrícula, deuda y beneficios.', fields: [
      ['estudiante','Estudiante','text'],['matricula','Estado de matrícula','select','Pendiente|Pagada|Parcial'],['mensualidad','Mensualidad','number'],['deuda','Deuda pendiente','number'],['beneficio','Beca, semibeca o descuento','text'],['bloqueo','Estado académico','select','Habilitado|Bloqueado'],['vencimiento','Fecha de vencimiento','date'],['observacion','Observación','textarea']
    ]},
    { id: 'becas', title: 'Becas y descuentos', icon: '%', description: 'Beneficios, vigencias, requisitos y autorizaciones.', fields: [
      ['estudiante','Estudiante','text'],['tipo','Tipo de beneficio','select','Beca|Semibeca|Descuento'],['porcentaje','Porcentaje','number'],['motivo','Motivo','textarea'],['inicio','Inicio de vigencia','date'],['fin','Fin de vigencia','date'],['requisitos','Requisitos','textarea'],['autorizado','Autorizado por','text']
    ]},
    { id: 'comunicados', title: 'Comunicados', icon: '✉', description: 'Anuncios y fechas importantes para la comunidad.', fields: [
      ['titulo','Título','text'],['tipo','Tipo','select','Anuncio general|Cambio de horario|Examen|Inicio de ciclo|Fin de ciclo|Reunión|Actividad'],['fecha','Fecha de publicación','date'],['vigencia','Vigente hasta','date'],['destinatarios','Destinatarios','text'],['mensaje','Mensaje','textarea'],['estado','Estado','select','Borrador|Publicado|Archivado']
    ]},
    { id: 'material', title: 'Material académico', icon: '▣', description: 'Registro de recursos y enlaces académicos.', fields: [
      ['titulo','Título','text'],['tipo','Tipo','select','Módulo|Formulario|Banco de preguntas|Separata|Clase grabada|Clase virtual'],['curso','Curso','text'],['docente','Docente','text'],['enlace','Enlace','url'],['fecha','Fecha de publicación','date'],['estado','Estado','select','Borrador|Publicado']
    ]},
    { id: 'ranking', title: 'Ranking académico', icon: '🏆', description: 'Posiciones, puntajes y progreso semanal.', fields: [
      ['estudiante','Estudiante','text'],['curso','Curso','text'],['posicionGeneral','Posición general','number'],['posicionCurso','Posición por curso','number'],['puntaje','Puntaje acumulado','number'],['semana','Semana','number'],['progreso','Progreso semanal','text'],['destacado','Mejor estudiante','select','Sí|No']
    ]},
    { id: 'reportes', title: 'Reportes', icon: '▦', description: 'Indicadores consolidados de gestión académica.', fields: [
      ['nombre','Nombre del reporte','text'],['tipo','Tipo','select','Matrículas por ciclo|Alumnos por curso|Asistencias|Notas|Aprobados y desaprobados|Retiros|Becados|Rendimiento general'],['periodo','Periodo','text'],['fecha','Fecha de generación','date'],['responsable','Responsable','text'],['resultado','Resumen del resultado','textarea']
    ]},
    { id: 'historial', title: 'Historial del estudiante', icon: '↺', description: 'Expediente histórico académico y administrativo.', fields: [
      ['estudiante','Estudiante','text'],['ciclos','Ciclos estudiados','textarea'],['cursos','Cursos anteriores','textarea'],['notas','Notas','textarea'],['asistencias','Asistencias','textarea'],['pagos','Pagos','textarea'],['documentos','Documentos emitidos','textarea'],['observaciones','Observaciones','textarea']
    ]},
    { id: 'usuarios', title: 'Usuarios y permisos', icon: '⚙', description: 'Roles y accesos diferenciados dentro del intranet.', fields: [
      ['nombre','Nombre del usuario','text'],['usuario','Usuario de acceso','text'],['rol','Rol','select','Administrador|Secretario académico|Coordinador|Docente|Estudiante|Padre/Apoderado'],['correo','Correo','email'],['accesos','Módulos permitidos','textarea'],['estado','Estado','select','Activo|Suspendido']
    ]},
    { id: 'configuracion', title: 'Configuración académica', icon: '⚒', description: 'Parámetros generales de la operación académica.', fields: [
      ['periodo','Periodo académico','text'],['escala','Escala de notas','text'],['puntuacion','Sistema de puntuación','text'],['estados','Estados de matrícula','textarea'],['cursos','Cursos','textarea'],['grupos','Grupos','textarea'],['turnos','Turnos','textarea'],['estado','Estado','select','Activo|Inactivo']
    ]}
  ];

  const storagePrefix = 'matecienciasSecretaria_';
  const content = document.getElementById('saContent');
  const nav = document.getElementById('saNav');
  const title = document.getElementById('saTitle');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[char]);
  const read = (id) => { try { const data = JSON.parse(localStorage.getItem(storagePrefix + id) || '[]'); return Array.isArray(data) ? data : []; } catch (_) { return []; } };
  const save = (id, records) => localStorage.setItem(storagePrefix + id, JSON.stringify(records));
  const readArrayKey = (key) => { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch (_) { return []; } };
  const shared = (source, index, data) => ({ id: `shared-${source}-${index}`, _shared: true, _source: source, ...data });

  function readShared(id) {
    const attendance = readArrayKey('matecienciasAsistencias');
    const admissions = readArrayKey('matecienciasInscripciones');
    const examResults = readArrayKey('matecienciasResultadosExamenes');
    const ranking = readArrayKey('matecienciasRanking');
    const classes = readArrayKey('matecienciasClasesVirtuales');
    const catalog = readArrayKey('matecienciasAulaCatalogo');
    const materials = readArrayKey('matecienciasMateriales');
    const tasks = readArrayKey('matecienciasTareas');
    const recordings = readArrayKey('matecienciasGrabaciones');
    const notifications = readArrayKey('matecienciasNotificaciones');
    const teacherDetails = readArrayKey('matecienciasDocentesDetalle');
    const teacherNames = readArrayKey('matecienciasDocentes');
    const payments = readArrayKey('matecienciasPagos');
    const calendar = [...readArrayKey('matecienciasCalendario'), ...readArrayKey('matecienciasCalendarioAcademicoIndependiente')];
    const adapters = {
      estudiantes: () => [...new Map(attendance.map((item) => [item.code || item.student, item])).values()].map((item, index) => shared('Aula virtual', index, { codigo:item.code, nombres:item.student, carrera:item.career, procedencia:item.university, estado:'Activo' })).concat(admissions.map((item, index) => shared('Panel administrativo', index, { codigo:item.codigo, nombres:item.nombreCompleto || item.nombre, dni:item.dni, telefono:item.telefono, correo:item.correo, nacimiento:item.fechaNacimiento, procedencia:item.institucionProcedencia, carrera:item.carrera || item.ciclo, apoderado:item.apoderado, estado:item.estado || 'Nuevo ingreso' }))),
      matriculas: () => admissions.map((item, index) => shared('Admisión', index, { tipo:'Nueva matrícula', estudiante:item.nombreCompleto || item.nombre, ciclo:item.ciclo, programa:item.carrera || item.modalidad, modalidad:item.modalidad, fecha:item.fechaPago || item.fecha, estado:item.estadoPago || item.estado || 'Pendiente' })),
      cursos: () => catalog.map((item, index) => shared('Aula virtual', index, { nombre:item.nombre, aulas:item.url, estado:item.activo === false ? 'Finalizado' : 'Activo' })).concat(classes.map((item, index) => shared('Panel docente', index, { nombre:item.name, aulas:item.url, estado:'Activo' }))),
      horarios: () => classes.map((item, index) => shared('Clases virtuales', index, { curso:item.name, aula:item.url })).concat(calendar.map((item, index) => shared('Calendario', index, { curso:item.title, dia:item.date, inicio:item.time, cambio:item.description }))),
      asistencia: () => attendance.map((item, index) => shared('Panel docente', index, { estudiante:item.student, curso:item.className, fecha:item.date, estado:item.status, observacion:[item.career,item.university].filter(Boolean).join(' · ') })),
      notas: () => examResults.map((item, index) => shared('Panel docente', index, { estudiante:item.student, curso:item.course, examenes:item.score, promedioCurso:item.score, promedioGeneral:item.score, ranking:item.position, observacion:`Semana ${item.week || '-'}` })),
      simulacros: () => examResults.map((item, index) => shared('Aula virtual', index, { estudiante:item.student, fecha:item.completedAt ? String(item.completedAt).slice(0,10) : '', tipo:item.course, puntaje:item.score, correctas:item.correct, incorrectas:item.incorrect, posicion:item.position, evolucion:`Semana ${item.week || '-'}` })),
      docentes: () => teacherDetails.map((item, index) => shared('Panel administrativo', index, { nombre:item.name, correo:item.email, cursos:item.areas, carga:item.specialty })).concat(teacherNames.map((name, index) => shared('Panel administrativo', index + teacherDetails.length, { nombre:name }))),
      pagos: () => payments.map((item, index) => shared('Tesorería', index, { estudiante:item.student, matricula:item.status === 'pagado' ? 'Pagada' : 'Pendiente', mensualidad:item.amount, deuda:item.status === 'pendiente' ? item.amount : 0, vencimiento:item.dueDate, observacion:item.notes })),
      comunicados: () => notifications.map((item, index) => shared('Panel docente', index, { titulo:item.title, tipo:'Anuncio general', fecha:item.createdAt ? String(item.createdAt).slice(0,10) : '', destinatarios:'Comunidad educativa', mensaje:item.detail, estado:'Publicado' })),
      material: () => materials.map((item, index) => shared('Panel docente', index, { titulo:item.title, tipo:'Módulo', curso:item.course, docente:item.teacher, fecha:item.publishedAt ? String(item.publishedAt).slice(0,10) : '', estado:'Publicado' })).concat(tasks.map((item, index) => shared('Panel docente', index + materials.length, { titulo:item.title, tipo:'Formulario', curso:item.course, docente:item.teacher, fecha:item.createdAt ? String(item.createdAt).slice(0,10) : '', estado:item.published ? 'Publicado' : 'Borrador' })), recordings.map((item, index) => shared('Aula virtual', index + materials.length + tasks.length, { titulo:item.title, tipo:'Clase grabada', curso:item.course, docente:item.publishedBy, enlace:item.youtubeId ? `https://youtu.be/${item.youtubeId}` : '', fecha:item.publishedAt ? String(item.publishedAt).slice(0,10) : '', estado:'Publicado' }))),
      ranking: () => ranking.map((item, index) => shared('Panel administrativo', index, { estudiante:item.name || item.student, curso:item.course, posicionGeneral:item.position || index + 1, puntaje:item.score, semana:item.week })).concat(examResults.map((item, index) => shared('Panel docente', index + ranking.length, { estudiante:item.student, curso:item.course, puntaje:item.score, semana:item.week }))),
      historial: () => examResults.map((item, index) => shared('Aula virtual', index, { estudiante:item.student, ciclos:`Semana ${item.week || '-'}`, cursos:item.course, notas:item.score, observaciones:`Correctas: ${item.correct || 0}; incorrectas: ${item.incorrect || 0}` }))
    };
    return adapters[id] ? adapters[id]() : [];
  }

  const combinedRecords = (id) => [...readShared(id), ...read(id)];
  const getModule = (id) => modules.find((module) => module.id === id) || modules[0];
  let activeId = 'inicio';
  let editingId = '';

  document.getElementById('saUserName').textContent = user;
  document.getElementById('saAvatar').textContent = UsuarioService.getInitials(user);
  document.getElementById('saToday').textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'full' }).format(new Date());
  nav.innerHTML = modules.map((module) => `<button type="button" data-module="${module.id}"><span class="sa-nav-icon">${module.icon}</span><span>${module.title}</span></button>`).join('');

  function metric(label, value, color) {
    return `<article class="sa-metric" style="--accent:${color}"><span>${label}</span><strong>${value}</strong></article>`;
  }

  function dashboard() {
    const students = combinedRecords('estudiantes');
    const enrollments = combinedRecords('matriculas');
    const courses = combinedRecords('cursos');
    const payments = combinedRecords('pagos');
    const schedules = combinedRecords('horarios');
    const procedures = combinedRecords('tramites');
    const notices = combinedRecords('comunicados');
    const activeStudents = students.filter((item) => item.estado === 'Activo').length;
    const newStudents = enrollments.filter((item) => item.tipo === 'Nueva matrícula').length;
    const activeCourses = courses.filter((item) => item.estado === 'Activo').length;
    const pendingPayments = payments.filter((item) => Number(item.deuda) > 0 || item.matricula === 'Pendiente').length;
    const pendingProcedures = procedures.filter((item) => ['Pendiente','En proceso'].includes(item.estado)).length;
    const publishedNotices = notices.filter((item) => item.estado === 'Publicado').slice(0, 5);
    content.innerHTML = `<section class="sa-metrics">
      ${metric('Alumnos matriculados', enrollments.length, '#0d8f36')}${metric('Alumnos activos', activeStudents, '#1683c4')}${metric('Nuevos ingresos', newStudents, '#7c3aed')}${metric('Cursos activos', activeCourses, '#d97706')}
      ${metric('Pagos pendientes', pendingPayments, '#dc2626')}${metric('Próximas clases', schedules.length, '#0891b2')}${metric('Trámites pendientes', pendingProcedures, '#ea580c')}${metric('Avisos importantes', publishedNotices.length, '#4f46e5')}
    </section><section class="sa-dashboard-grid"><article class="sa-card"><h2>Próximas clases</h2><div class="sa-activity">${schedules.slice(0,6).map((item) => `<div class="sa-activity-item"><span><strong>${escapeHtml(item.curso || 'Curso')}</strong><small>${escapeHtml([item.dia,item.inicio,item.grupo].filter(Boolean).join(' · '))}</small></span><span class="sa-badge">${escapeHtml(item.aula || 'Por asignar')}</span></div>`).join('') || '<div class="sa-empty">No hay clases registradas.</div>'}</div></article><article class="sa-card"><h2>Avisos importantes</h2><div class="sa-activity">${publishedNotices.map((item) => `<div class="sa-activity-item"><span><strong>${escapeHtml(item.titulo)}</strong><small>${escapeHtml(item.fecha || '')}</small></span></div>`).join('') || '<div class="sa-empty">No hay avisos publicados.</div>'}</div></article></section>`;
  }

  function fieldMarkup(field) {
    const [name, label, type, choices] = field;
    if (type === 'select') return `<label>${label}<select name="${name}" required><option value="">Seleccionar</option>${choices.split('|').map((choice) => `<option>${choice}</option>`).join('')}</select></label>`;
    if (type === 'textarea') return `<label>${label}<textarea name="${name}" placeholder="${label}"></textarea></label>`;
    const step = type === 'number' ? ' step="any" min="0"' : '';
    return `<label>${label}<input name="${name}" type="${type}"${step} placeholder="${label}" required /></label>`;
  }

  function renderModule(module) {
    const visibleFields = module.fields.slice(0, 5);
    content.innerHTML = `<p class="sa-module-intro">${module.description}</p><div class="sa-toolbar"><input class="sa-search" id="saSearch" type="search" placeholder="Buscar en ${module.title.toLowerCase()}" /><button class="sa-primary" id="saNew" type="button">+ Nuevo registro</button></div><section class="sa-card sa-form-card hidden" id="saFormCard"><h2 id="saFormTitle">Nuevo registro</h2><form class="sa-form" id="saForm">${module.fields.map(fieldMarkup).join('')}<div class="sa-form-actions"><button class="sa-primary" type="submit">Guardar</button><button class="sa-secondary" id="saCancel" type="button">Cancelar</button></div></form></section><div id="saTable"></div><div class="sa-toast hidden" id="saToast"></div>`;

    const formCard = document.getElementById('saFormCard');
    const form = document.getElementById('saForm');
    const drawTable = (query = '') => {
      const normalized = UsuarioService.normalizeUserName(query);
      const filtered = combinedRecords(module.id).filter((record) => !normalized || UsuarioService.normalizeUserName(Object.values(record).join(' ')).includes(normalized));
      document.getElementById('saTable').innerHTML = `<div class="sa-table-wrap"><table class="sa-table"><thead><tr>${visibleFields.map((field) => `<th>${field[1]}</th>`).join('')}<th>Origen / Acciones</th></tr></thead><tbody>${filtered.map((record) => `<tr>${visibleFields.map((field) => `<td>${field[0] === 'estado' ? `<span class="sa-badge">${escapeHtml(record[field[0]] || '-')}</span>` : escapeHtml(record[field[0]] || '-')}</td>`).join('')}<td>${record._shared ? `<span class="sa-source">Sincronizado · ${escapeHtml(record._source)}</span>` : `<button class="sa-secondary" data-edit="${record.id}" type="button">Editar</button> <button class="sa-delete" data-delete="${record.id}" type="button">Eliminar</button>`}</td></tr>`).join('') || `<tr><td class="sa-empty" colspan="${visibleFields.length + 1}">No hay registros todavía.</td></tr>`}</tbody></table></div>`;
    };
    const openForm = (record) => {
      editingId = record?.id || '';
      document.getElementById('saFormTitle').textContent = editingId ? 'Editar registro' : 'Nuevo registro';
      form.reset();
      module.fields.forEach(([name]) => { if (record && form.elements[name]) form.elements[name].value = record[name] ?? ''; });
      formCard.classList.remove('hidden');
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.getElementById('saNew').onclick = () => openForm(null);
    document.getElementById('saCancel').onclick = () => { editingId = ''; formCard.classList.add('hidden'); };
    document.getElementById('saSearch').oninput = (event) => drawTable(event.target.value);
    form.onsubmit = (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const all = read(module.id);
      if (editingId) {
        const index = all.findIndex((record) => record.id === editingId);
        if (index >= 0) all[index] = { ...all[index], ...data, updatedAt: new Date().toISOString() };
      } else all.unshift({ id: `${module.id}-${Date.now()}`, ...data, createdAt: new Date().toISOString(), createdBy: user });
      save(module.id, all);
      editingId = '';
      formCard.classList.add('hidden');
      drawTable();
      const toast = document.getElementById('saToast');
      toast.textContent = 'Registro guardado correctamente.';
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2200);
    };
    document.getElementById('saTable').onclick = (event) => {
      const editButton = event.target.closest('[data-edit]');
      const deleteButton = event.target.closest('[data-delete]');
      if (editButton) openForm(read(module.id).find((record) => record.id === editButton.dataset.edit));
      if (deleteButton && confirm('¿Deseas eliminar este registro?')) {
        save(module.id, read(module.id).filter((record) => record.id !== deleteButton.dataset.delete));
        drawTable(document.getElementById('saSearch').value);
      }
    };
    drawTable();
  }

  function selectModule(id) {
    activeId = id;
    editingId = '';
    const module = getModule(id);
    title.textContent = module.title;
    nav.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.module === id));
    if (id === 'inicio') dashboard(); else renderModule(module);
    document.getElementById('saSidebar').classList.remove('open');
  }

  nav.onclick = (event) => {
    const button = event.target.closest('[data-module]');
    if (button) selectModule(button.dataset.module);
  };
  document.getElementById('saMenuButton').onclick = () => document.getElementById('saSidebar').classList.toggle('open');
  document.getElementById('saLogout').onclick = () => {
    sessionStorage.removeItem('secretariaUsuario');
    window.location.assign('tarjetas/secretaria/secretaria-login.html');
  };
  window.addEventListener('storage', () => selectModule(activeId));
  const requestedModule = new URLSearchParams(window.location.search).get('module');
  selectModule(modules.some((module) => module.id === requestedModule) ? requestedModule : activeId);
})();
