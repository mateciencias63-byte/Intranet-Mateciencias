(() => {
  if (document.body.classList.contains('home-login-page')) return;
  if (document.body.classList.contains('dashboard-home-page') &&
      sessionStorage.getItem('dashboardAuthenticated') !== 'true') return;
  const routes = {
    Admision: 'tarjetas/admision/admision-login.html',
    Inscripcion: 'tarjetas/inscripcion/inscripcion-ciclo.html',
    Matricula: 'tarjetas/matricula/matricula-login.html',
    'Panel administrativo': 'tarjetas/administracion/admin-login.html',
    Formularios: 'tarjetas/canva-studies/formularios.html',
    'Panel de docentes': 'tarjetas/docentes/docente-login.html',
    'Aula virtual': 'tarjetas/aula-virtual/aula-virtual.html',
    'Biblioteca virtual': 'tarjetas/biblioteca/biblioteca-login.html',
    'Calendario Academico': 'tarjetas/calendario/calendario-academico.html',
    Encuestas: 'tarjetas/encuestas/index.html',
    'Tramites Academicos': 'tarjetas/tramites/index.html'
  };
  document.querySelectorAll('#cardsGrid [data-service]').forEach((card) => {
    const destination = routes[card.dataset.service];
    card.tabIndex = 0;
    card.setAttribute('role', destination ? 'link' : 'button');
    card.style.cursor = 'pointer';
    card.removeAttribute('onclick');
    const open = () => {
      if (destination) window.location.assign(destination);
      else window.alert(`${card.querySelector('.card-title')?.textContent.trim() || card.dataset.service}: este módulo todavía no está disponible. Consulta con Secretaría Académica.`);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
})();
