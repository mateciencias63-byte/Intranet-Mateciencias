(() => {
  window.DocenteModules = window.DocenteModules || {};
  const isStandaloneCalendar = document.body.classList.contains('calendar-admin-page');
  const calendarKey = isStandaloneCalendar ? 'matecienciasCalendarioAcademicoIndependiente' : 'matecienciasCalendario';
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const readEvents = () => { try { const events = JSON.parse(localStorage.getItem(calendarKey) || '[]'); return Array.isArray(events) ? events : []; } catch (error) { return []; } };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const addStyles = () => {
    if (document.getElementById('calendarioStyles')) return;
    const style = document.createElement('style');
    style.id = 'calendarioStyles';
    style.textContent = `.calendario-panel { grid-column:1/-1; width:100%; } .calendario-permission { color:#65748b; font-size:.78rem; } .calendario-form { display:grid; grid-template-columns:2fr 1fr 1fr 2fr auto; gap:10px; align-items:end; margin-bottom:20px; } .calendario-form label { display:grid; gap:6px; color:#12233f; font-size:.8rem; font-weight:700; } .calendario-form input { width:100%; height:40px; padding:9px; border:1px solid #cbd5e1; border-radius:7px; font:inherit; box-sizing:border-box; } .calendario-form button { height:40px; padding:9px 13px; border:0; border-radius:7px; background:#0d8f36; color:#fff; cursor:pointer; font-weight:700; } .calendario-message { grid-column:1/-1; margin:0; color:#0d8f36; font-size:.8rem; font-weight:700; } .calendar-toolbar { display:flex; align-items:center; justify-content:center; gap:22px; margin:12px 0 16px; color:#12233f; } .calendar-toolbar button { width:34px; height:32px; border:0; border-radius:6px; background:#eaf8ef; color:#08652b; cursor:pointer; font-size:1.1rem; font-weight:700; } .calendar-grid { display:grid; grid-template-columns:repeat(7,minmax(90px,1fr)); border-top:1px solid #d6e1eb; border-left:1px solid #d6e1eb; overflow:auto; } .calendar-weekday { padding:10px; background:#eaf8ef; color:#12233f; font-size:.75rem; font-weight:800; text-align:center; border-right:1px solid #d6e1eb; border-bottom:1px solid #d6e1eb; } .calendar-day { min-height:100px; padding:8px; background:#fff; border-right:1px solid #d6e1eb; border-bottom:1px solid #d6e1eb; } .calendar-day > strong { color:#12233f; font-size:.8rem; } .calendar-day.empty { background:#f8fbfc; } .calendar-event { position:relative; margin-top:7px; padding:6px 22px 6px 6px; border-radius:5px; background:#dff3e5; color:#08652b; font-size:.7rem; line-height:1.25; } .calendar-event span { display:block; font-weight:700; } .calendar-event small { display:block; margin-top:3px; color:#376b4a; } .calendar-event button { position:absolute; top:4px; right:4px; border:0; background:transparent; color:#b4232f; cursor:pointer; font-size:.75rem; font-weight:800; } @media(max-width:800px){ .calendario-form { grid-template-columns:1fr 1fr; } .calendario-form button { width:fit-content; } .calendar-grid { grid-template-columns:repeat(7,90px); } }`;
    document.head.appendChild(style);
  };
  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    addStyles();
    const isAdmin = Boolean(document.querySelector('.admin-shell')) || document.body.classList.contains('calendar-admin-page');
    const canEdit = isStandaloneCalendar ? window.CalendarioAcceso?.isValid() === true : isAdmin;
    target.innerHTML = `<section class="panel calendario-panel">${canEdit ? '<form class="calendario-form" id="calendarForm"><label>Evento<input id="calendarTitle" maxlength="120" required placeholder="Ej. Examen de Álgebra" /></label><label>Fecha<input id="calendarDate" type="date" required /></label><label>Hora<input id="calendarTime" type="time" /></label><label>Descripción<input id="calendarDescription" maxlength="180" placeholder="Información adicional" /></label><button type="submit">Agregar evento</button><p class="calendario-message" id="calendarMessage" role="status"></p></form>' : ''}<div class="calendar-toolbar"><button type="button" id="calendarPrevious" aria-label="Mes anterior">&larr;</button><strong id="calendarMonth"></strong><button type="button" id="calendarNext" aria-label="Mes siguiente">&rarr;</button></div><div class="calendar-grid" id="calendarGrid"></div></section>`;
    const today = new Date();
    let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const draw = () => {
      const events = readEvents();
      document.getElementById('calendarMonth').textContent = `${monthNames[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;
      const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
      const offset = (firstDay + 6) % 7;
      const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
      const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      document.getElementById('calendarGrid').innerHTML = labels.map((label) => `<div class="calendar-weekday">${label}</div>`).join('') + Array.from({ length: offset }, () => '<div class="calendar-day empty"></div>').join('') + Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const date = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const dayEvents = events.filter((event) => event.date === date); return `<div class="calendar-day"><strong>${day}</strong>${dayEvents.map((event) => `<div class="calendar-event"><span>${escapeHtml(event.time ? `${event.time} ` : '')}${escapeHtml(event.title)}</span>${canEdit ? `<button type="button" data-delete-event="${event.id}" title="Eliminar evento" aria-label="Eliminar evento">X</button>` : ''}<small>${escapeHtml(event.description)}</small></div>`).join('')}</div>`; }).join('');
      document.querySelectorAll('[data-delete-event]').forEach((button) => button.addEventListener('click', () => { if (!window.confirm('¿Eliminar este evento?')) return; localStorage.setItem(calendarKey, JSON.stringify(readEvents().filter((event) => event.id !== button.dataset.deleteEvent))); draw(); }));
    };
    document.getElementById('calendarPrevious').addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() - 1); draw(); });
    document.getElementById('calendarNext').addEventListener('click', () => { visibleMonth.setMonth(visibleMonth.getMonth() + 1); draw(); });
    if (canEdit) document.getElementById('calendarForm').addEventListener('submit', (event) => { event.preventDefault(); const events = readEvents(); events.push({ id: `evento-${Date.now()}`, title: document.getElementById('calendarTitle').value.trim(), date: document.getElementById('calendarDate').value, time: document.getElementById('calendarTime').value, description: document.getElementById('calendarDescription').value.trim(), createdBy: (isStandaloneCalendar ? sessionStorage.getItem('calendarioUsuario') : null) || sessionStorage.getItem('adminUsuario') || sessionStorage.getItem('docenteUser') || 'Usuario autorizado' }); localStorage.setItem(calendarKey, JSON.stringify(events)); event.currentTarget.reset(); document.getElementById('calendarMessage').textContent = 'Evento agregado correctamente.'; draw(); });
    draw();
    window.addEventListener('storage', (event) => { if (event.key === calendarKey) draw(); });
  };
  window.DocenteModules.Calendario = { name: 'Calendario', render };
})();
