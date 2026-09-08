(() => {
  window.DocenteModules = window.DocenteModules || {};
  window.DocenteModules.Horario = { name: 'Horario', render: () => window.HorarioSemanal.mount(document.querySelector('.content-grid')) };
})();
