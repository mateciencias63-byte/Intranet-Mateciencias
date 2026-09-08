(async () => {
  if (!UsuarioService.isAdminSessionValid()) {
    const requestedModule = new URLSearchParams(window.location.search).get('module');
    const loginUrl = ['Calendario', 'Encuestas'].includes(requestedModule) ? `tarjetas/administracion/admin-login.html?next=${requestedModule}` : 'tarjetas/administracion/admin-login.html';
    window.location.replace(loginUrl);
    return;
  }

  const teacherKey = 'matecienciasDocentes';
  const catalogKey = 'matecienciasAulaCatalogo';
  const classLinksKey = 'matecienciasClasesVirtuales';
  const defaultClasses = [];
  const teachers = readArray(teacherKey);
  const catalog = readArray(catalogKey);
  let classes;
  try {
    const storedClasses = JSON.parse(localStorage.getItem(classLinksKey) || 'null');
    classes = Array.isArray(storedClasses) ? storedClasses : defaultClasses.map((item) => ({ ...item }));
  } catch (error) {
    classes = defaultClasses.map((item) => ({ ...item }));
  }
  const teacherList = document.getElementById('teacherList');
  const catalogList = document.getElementById('catalogList');
  const classList = document.getElementById('adminClassList');

  const adminDisplayName = UsuarioService.getAdminSessionUser?.() || 'Administrador';
  document.getElementById('adminName').textContent = adminDisplayName;
  document.getElementById('adminHeaderName').textContent = adminDisplayName;
  document.getElementById('adminHeaderAvatar').textContent = UsuarioService.getInitials?.(adminDisplayName) || 'AD';
  const adminHeading = document.getElementById('adminHeading');
  adminHeading.textContent = 'Panel principal';
  const adminMainHeader = document.createElement('div');
  adminMainHeader.className = 'panel-main-header';
  adminHeading.before(adminMainHeader);
  adminMainHeader.appendChild(adminHeading);
  const adminDate = document.createElement('time');
  adminDate.className = 'panel-date';
  adminDate.textContent = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date());
  adminMainHeader.appendChild(adminDate);

  const render = () => {
    teacherList.innerHTML = teachers.map((teacher, index) => `<div class="admin-list-item"><span>${teacher}</span><button class="remove" type="button" data-teacher="${index}">Quitar</button></div>`).join('') || '<small>No hay docentes adicionales.</small>';
    catalogList.innerHTML = catalog.map((item, index) => `<div class="admin-list-item"><span><strong>${item.nombre}</strong><small>${item.url}</small></span><button class="remove" type="button" data-catalog="${index}">Quitar</button></div>`).join('') || '<small>No hay cursos publicados.</small>';
    classList.innerHTML = classes.map((item, index) => `<div class="admin-list-item"><span><strong>${item.name}</strong><small>${item.url}</small></span><button class="remove" type="button" data-class="${index}">Quitar</button></div>`).join('') || '<small>No hay clases publicadas.</small>';
  };

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  };

  const renderAdminHome = () => {
    const content = document.getElementById('adminContent');
    if (!content) return;
    const notifications = window.NotificacionesService?.read?.() || [];
    const publishedClasses = readArray(classLinksKey);
    const materials = readArray('matecienciasMateriales');
    const tasks = readArray('matecienciasTareas').filter((task) => task.published);
    const home = document.createElement('section');
    home.className = 'admin-dashboard-home';
    home.innerHTML = `<article class="notifications-panel"><div class="notifications-header"><h2>Notificaciones</h2><span class="notifications-count">${notifications.length}</span></div><div class="notifications-list">${notifications.length ? notifications.slice(0, 8).map((item) => `<article class="notification-item"><strong>${item.title}</strong><small>${item.detail} · ${item.author} · ${new Date(item.createdAt).toLocaleString('es-PE')}</small><button class="notification-delete" type="button" data-admin-delete-notification="${item.id}" aria-label="Eliminar notificación">×</button></article>`).join('') : '<p class="notifications-empty">No hay notificaciones nuevas.</p>'}</div></article><div class="admin-dashboard-metrics"><article class="admin-dashboard-metric"><span>Cursos activos</span><strong>${publishedClasses.length}</strong></article><article class="admin-dashboard-metric"><span>Materiales disponibles</span><strong>${materials.length}</strong></article><article class="admin-dashboard-metric"><span>Tareas publicadas</span><strong>${tasks.length}</strong></article></div><div class="admin-quick-grid"><button class="admin-quick-card" type="button" data-module="Clases"><span class="admin-quick-icon">▣</span>Clases virtuales</button><button class="admin-quick-card" type="button" data-module="Horario"><span class="admin-quick-icon">◷</span>Mi horario</button><button class="admin-quick-card" type="button" data-module="Calendario"><span class="admin-quick-icon">▦</span>Calendario</button><button class="admin-quick-card" type="button" data-module="Comunicados"><span class="admin-quick-icon">!</span>Avisos</button><button class="admin-quick-card" type="button" data-module="Materiales"><span class="admin-quick-icon">▤</span>Recursos académicos</button><button class="admin-quick-card" type="button" data-module="Tareas"><span class="admin-quick-icon">✓</span>Actividades</button><button class="admin-quick-card" type="button" data-module="Grabaciones"><span class="admin-quick-icon">▶</span>Clases grabadas</button><button class="admin-quick-card" type="button" data-module="Pagos"><span class="admin-quick-icon">$</span>Pagos</button><button class="admin-quick-card" type="button" data-module="Exámenes"><span class="admin-quick-icon">✓</span>Evaluaciones</button><button class="admin-quick-card" type="button" data-module="Asistencia"><span class="admin-quick-icon">◉</span>Control de asistencia</button></div>`;
    home.querySelector('[data-module="Calendario"]').lastChild.nodeValue = 'Agenda Académica';
    content.prepend(home);
    home.querySelectorAll('[data-admin-delete-notification]').forEach((button) => button.addEventListener('click', () => {
      window.NotificacionesService?.remove?.(button.dataset.adminDeleteNotification);
      home.remove();
      renderAdminHome();
    }));
  };

  if (localStorage.getItem(classLinksKey) === null) {
    localStorage.setItem(classLinksKey, JSON.stringify(classes));
  }

  document.getElementById('teacherForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('teacherName').value.trim().toLowerCase();
    if (name && !teachers.includes(name)) teachers.push(name);
    localStorage.setItem(teacherKey, JSON.stringify(teachers));
    event.currentTarget.reset();
    render();
  });
  document.getElementById('catalogForm').addEventListener('submit', (event) => {
    event.preventDefault();
    catalog.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), nombre: document.getElementById('catalogName').value.trim(), imagen: 'IDEPUNP.png', url: document.getElementById('catalogUrl').value.trim(), activo: true });
    localStorage.setItem(catalogKey, JSON.stringify(catalog));
    window.NotificacionesService?.add({ title: 'Nuevo curso disponible', detail: catalog[catalog.length - 1].nombre, author: 'Administrador' });
    event.currentTarget.reset();
    render();
  });
  document.getElementById('adminClassForm').addEventListener('submit', (event) => {
    event.preventDefault();
    classes.push({ name: document.getElementById('adminClassName').value.trim(), url: document.getElementById('adminClassUrl').value.trim() });
    localStorage.setItem(classLinksKey, JSON.stringify(classes));
    window.NotificacionesService?.add({ title: 'Nueva clase virtual publicada', detail: classes[classes.length - 1].name, author: 'Administrador' });
    event.currentTarget.reset();
    render();
  });
  document.addEventListener('click', (event) => {
    const teacher = event.target.closest('[data-teacher]');
    const item = event.target.closest('[data-catalog]');
    const classItem = event.target.closest('[data-class]');
    if (teacher) teachers.splice(Number(teacher.dataset.teacher), 1);
    if (item) catalog.splice(Number(item.dataset.catalog), 1);
    if (classItem) classes.splice(Number(classItem.dataset.class), 1);
    if (teacher || item || classItem) { localStorage.setItem(teacherKey, JSON.stringify(teachers)); localStorage.setItem(catalogKey, JSON.stringify(catalog)); localStorage.setItem(classLinksKey, JSON.stringify(classes)); render(); }
  });
  document.getElementById('logoutAdmin').addEventListener('click', () => { UsuarioService.clearAdminSession(); window.location.assign('tarjetas/administracion/admin-login.html'); });
  render();
  renderAdminHome();

  const moduleScripts = {
    Admision: 'tarjetas/administracion/admin-registros.js',
    Matricula: 'tarjetas/administracion/admin-registros.js',
    'Pagos': 'pagos-historial.js',
    'Estudiantes': 'tarjetas/docentes/docente-estudiantes.js',
    Ranking: 'tarjetas/administracion/admin-ranking.js',
    'Materiales': 'tarjetas/docentes/docente-materiales.js',
    'Clases': 'tarjetas/docentes/docente-clases.js',
    'Horario': 'tarjetas/administracion/admin-horario.js',
    'Calendario': 'tarjetas/calendario/calendario.js',
    'Tareas': 'tarjetas/docentes/docente-tareas.js',
    'Exámenes': 'tarjetas/docentes/docente-examenes.js',
    'Grabaciones': 'tarjetas/docentes/docente-grabaciones.js',
    'PromedioGeneral': 'tarjetas/docentes/docente-promedio-general.js',
    'Asistencia': 'tarjetas/docentes/docente-asistencia.js',
    'Comunicados': 'tarjetas/docentes/docente-comunicados.js',
    'Chat': 'tarjetas/docentes/docente-chat.js',
    'Encuestas': 'tarjetas/encuestas/admin-extras.js',
    'Certificados': 'tarjetas/encuestas/documentos.js',
    'Silabos': 'tarjetas/encuestas/documentos.js',
    'MisDocentes': 'tarjetas/encuestas/admin-extras.js'
  };
  const loadedModules = new Set();
  let activeModule = 'Inicio';
  window.addEventListener('storage', (event) => {
    const dashboardKeys = [classLinksKey, 'matecienciasMateriales', 'matecienciasTareas', window.NotificacionesService?.key];
    if (activeModule !== 'Inicio' || !dashboardKeys.includes(event.key)) return;
    document.querySelector('.admin-dashboard-home')?.remove();
    renderAdminHome();
  });
  const loadModule = (moduleName) => {
    const scriptName = moduleScripts[moduleName];
    if (!scriptName) return Promise.resolve();
    if (loadedModules.has(scriptName)) return Promise.resolve();
    const script = document.createElement('script');
    script.src = `${scriptName}?v=${Date.now()}`;
    const loading = new Promise((resolve) => {
      script.onload = () => { loadedModules.add(scriptName); resolve(); };
      script.onerror = resolve;
    });
    document.body.appendChild(script);
    return loading;
  };
  const studentsButton = document.querySelector('[data-module="Estudiantes"]');
  if (studentsButton && !document.querySelector('.admin-nav [data-module="Pagos"]')) {
    const treasuryButton = document.createElement('button');
    treasuryButton.type = 'button';
    treasuryButton.dataset.module = 'Pagos';
    treasuryButton.innerHTML = '<span class="admin-nav-icon">$</span><span>Pagos</span>';
    studentsButton.before(treasuryButton);
  }
  const calendarButtonLabel = document.querySelector('[data-module="Calendario"] span:last-child');
  if (calendarButtonLabel) calendarButtonLabel.textContent = 'Agenda Académica';
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-module]');
    if (!button) return;
    const moduleName = button.dataset.module;
    activeModule = moduleName;
    document.querySelectorAll('.admin-nav button').forEach((item) => item.classList.toggle('active', item.dataset.module === moduleName));
    const moduleTitles = { Admision: 'Admisión', Matricula: 'Matrícula', Inicio: 'Panel principal', Estudiantes: 'Alumnos', Ranking: 'Ranking', Materiales: 'Recursos académicos', Clases: 'Clases virtuales', Horario: 'Mi horario', Calendario: 'Agenda Académica', Tareas: 'Actividades', 'Exámenes': 'Evaluaciones', Grabaciones: 'Clases grabadas', PromedioGeneral: 'Calificaciones', Asistencia: 'Control de asistencia', Comunicados: 'Avisos', Chat: 'Mensajes', Encuestas: 'Encuestas', Certificados: 'Certificados', Silabos: 'Sílabos', MisDocentes: 'Mis docentes' };
    document.getElementById('adminHeading').textContent = moduleTitles[moduleName] || moduleName;
    if (moduleName === 'Inicio') { window.location.reload(); return; }
    loadModule(moduleName).then(() => { if (activeModule === moduleName) window.DocenteModules?.[moduleName]?.render?.(); });
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-admin-link]');
    if (!button) return;
    window.location.assign(button.dataset.adminLink);
  });
  const requestedModule = new URLSearchParams(window.location.search).get('module');
  if (requestedModule) document.querySelector(`[data-module="${requestedModule}"]`)?.click();
})();
