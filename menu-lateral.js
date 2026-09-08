(() => {
  const icons = {
    home: '<path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 2v6m10-6v6M3 10h18M7 13h1m3 0h1m3 0h1M7 17h1m3 0h1m3 0h1"/>',
    payment: '<path d="M6 8c3-3 8-3 11 0l3-2v5l2 1v5h-3l-2 4h-3l-1-3H9l-1 3H5l-1-5c-3-2-3-5-1-6M8 8V5a3 3 0 0 1 6 0v3"/><circle cx="16" cy="11" r=".7"/><path d="M10 4h2m-1-1v4"/>',
    people: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3M3 4a3 3 0 0 0 0 6m18-6a3 3 0 0 1 0 6"/>',
    book: '<path d="M12 5c-3-2-7-2-10-1v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1v16"/>',
    video: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="m10 8 5 3-5 3zM8 22h8m-4-4v4"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H9l-6 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2zM7 8h10M7 12h7"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9m-4-9 1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 0 1 6 0c0 3-3 3-3 6m0 3v1"/>',
    clipboard: '<path d="M8 4H4v18h16V4h-4"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m7 11 1 1 2-2m2 1h5m-10 5 1 1 2-2m2 1h5"/>'
  };
  function decorate(nav) {
    nav.querySelectorAll('button').forEach(button => {
      const icon = button.querySelector('.admin-nav-icon,.nav-icon,.aula-nav-icon,.sa-nav-icon');
      if (!icon || icon.classList.contains('menu-lateral-icon')) return;
      const label = button.textContent.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const kind = /inicio|panel principal/.test(label) ? 'home' : /horario|agenda|calendario/.test(label) ? 'calendar' : /pago|tesorer|finanz/.test(label) ? 'payment' : /alumno|estudiante|docente|personal|usuario/.test(label) ? 'people' : /recurso|material|silabo|curso/.test(label) ? 'book' : /clase|grabaci/.test(label) ? 'video' : /mensaje|chat|aviso|comunic/.test(label) ? 'chat' : /ranking|certificado|beca/.test(label) ? 'award' : /informacion|ayuda/.test(label) ? 'info' : 'clipboard';
      icon.classList.add('menu-lateral-icon');
      icon.setAttribute('aria-hidden','true');
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${icons[kind]}</svg>`;
    });
  }
  document.querySelectorAll('.admin-nav,.docente-nav,.aula-nav,.sa-nav').forEach(nav => {
    nav.classList.add('menu-lateral');
    decorate(nav);
    nav.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !nav.contains(button) || button.disabled) return;
      // Run after the selected module's click handlers update the page.
      setTimeout(() => {
        window.scrollTo({ top:0, left:0, behavior:'instant' });
        document.querySelectorAll('.admin-main,.docente-main,.aula-main,.sa-main').forEach(main => {
          main.scrollTo({ top:0, left:0, behavior:'instant' });
        });
      }, 0);
    });
    new MutationObserver(() => decorate(nav)).observe(nav,{childList:true,subtree:true});
  });
})();
