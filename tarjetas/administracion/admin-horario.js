(() => {
  window.DocenteModules = window.DocenteModules || {};
  const scheduleKey = 'matecienciasHorario';
  const canEdit = () => typeof UsuarioService !== 'undefined' && typeof UsuarioService.isAdminSessionValid === 'function' && UsuarioService.isAdminSessionValid();
  const formatHour = (hour) => `${hour % 12 || 12}:00 ${hour % 24 < 12 ? 'am' : 'pm'}`;
  const times = Array.from({ length: 24 }, (_, hour) => `${formatHour(hour)} - ${formatHour(hour + 1)}`);
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const readSchedule = () => {
    try {
      const schedule = JSON.parse(localStorage.getItem(scheduleKey) || '{}');
      return schedule && typeof schedule === 'object' ? schedule : {};
    } catch (error) { return {}; }
  };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    const editable = canEdit();
    target.innerHTML = `<section class="panel horario-admin-panel"><div class="panel-header"><h2>Horario</h2><span class="horario-admin-note">Solo administradores pueden editar</span></div><div class="horario-admin-wrap"><table class="horario-admin-table"><thead><tr><th>Hora</th>${days.map((day) => `<th>${day}</th>`).join('')}</tr></thead><tbody>${times.map((time, row) => `<tr><th>${time}</th>${days.map((day, column) => `<td ${editable ? 'contenteditable="true"' : ''} data-schedule-cell="${row}-${column}">${escapeHtml(readSchedule()[`${row}-${column}`])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="horario-admin-message" id="horarioAdminMessage" role="status">${editable ? 'Los cambios se guardan automáticamente.' : 'Solo los administradores pueden editar este horario.'}</p></section>`;
    if (!editable) return;
    document.querySelectorAll('[data-schedule-cell]').forEach((cell) => cell.addEventListener('input', () => {
      if (!canEdit()) return;
      const schedule = readSchedule();
      schedule[cell.dataset.scheduleCell] = cell.textContent.trim();
      localStorage.setItem(scheduleKey, JSON.stringify(schedule));
      document.getElementById('horarioAdminMessage').textContent = 'Horario actualizado correctamente.';
    }));
  };
  window.DocenteModules.Horario = { name: 'Horario', render };
})();
