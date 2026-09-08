(() => {
      const calendarKey = 'matecienciasCalendario';
      const calendarMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const escapeCalendarText = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
      const renderStudentCalendar = () => {
        const grid = document.getElementById('aulaCalendarGrid');
        if (!grid) return;
        let events = [];
        try { events = JSON.parse(localStorage.getItem(calendarKey) || '[]'); } catch (error) { events = []; }
        if (!Array.isArray(events)) events = [];
        const month = Number(grid.dataset.month || new Date().getMonth());
        const year = Number(grid.dataset.year || new Date().getFullYear());
        grid.dataset.month = month;
        grid.dataset.year = year;
        document.getElementById('aulaCalendarMonth').textContent = `${calendarMonths[month]} ${year}`;
        const offset = (new Date(year, month, 1).getDay() + 6) % 7;
        const days = new Date(year, month + 1, 0).getDate();
        const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        grid.innerHTML = labels.map((label) => `<div class="aula-calendar-weekday">${label}</div>`).join('') + Array.from({ length: offset }, () => '<div class="aula-calendar-day empty"></div>').join('') + Array.from({ length: days }, (_, index) => { const day = index + 1; const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; return `<div class="aula-calendar-day"><strong>${day}</strong>${events.filter((event) => event.date === date).map((event) => `<div class="aula-calendar-event">${escapeCalendarText(event.time ? `${event.time} ` : '')}${escapeCalendarText(event.title)}<small>${escapeCalendarText(event.description)}</small></div>`).join('')}</div>`; }).join('');
      };
      document.getElementById('aulaCalendarPrevious').addEventListener('click', () => { const grid = document.getElementById('aulaCalendarGrid'); const date = new Date(Number(grid.dataset.year), Number(grid.dataset.month) - 1, 1); grid.dataset.month = date.getMonth(); grid.dataset.year = date.getFullYear(); renderStudentCalendar(); });
      document.getElementById('aulaCalendarNext').addEventListener('click', () => { const grid = document.getElementById('aulaCalendarGrid'); const date = new Date(Number(grid.dataset.year), Number(grid.dataset.month) + 1, 1); grid.dataset.month = date.getMonth(); grid.dataset.year = date.getFullYear(); renderStudentCalendar(); });
      renderStudentCalendar();
      window.addEventListener('storage', (event) => { if (event.key === calendarKey) renderStudentCalendar(); });
})();

