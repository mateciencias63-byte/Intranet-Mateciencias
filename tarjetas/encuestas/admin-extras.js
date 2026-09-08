(() => {
  window.DocenteModules = window.DocenteModules || {};
  const teacherDetailsKey = 'matecienciasDocentesDetalle';
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

  const addTeacherStyles = () => {
    if (document.getElementById('teacherDetailsStyles')) return;
    const style = document.createElement('style');
    style.id = 'teacherDetailsStyles';
    style.textContent = `
      .teacher-details-panel { width:100%; padding:24px; }
      .teacher-details-form { display:grid; grid-template-columns:2fr 1.5fr 1.4fr 1.5fr auto; gap:10px; align-items:end; margin-bottom:24px; padding:18px; border:1px solid #dbe5ef; border-radius:12px; background:#f8fbfc; }
      .teacher-details-field { display:grid; gap:6px; color:#12233f; font-size:.78rem; font-weight:700; }
      .teacher-details-field input { width:100%; height:42px; min-width:0; padding:9px 11px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#12233f; font:inherit; }
      .teacher-details-field input:focus { outline:0; border-color:#0d8f36; box-shadow:0 0 0 3px rgba(13,143,54,.12); }
      .teacher-details-submit { height:42px; padding:9px 15px; border:0; border-radius:8px; background:#0d8f36; color:#fff; cursor:pointer; font-weight:800; }
      .teacher-details-wrap { overflow-x:auto; border:1px solid #dbe5ef; border-radius:10px; }
      .teacher-details-table { width:100%; min-width:820px; border-collapse:collapse; color:#12233f; font-size:.84rem; }
      .teacher-details-table th,.teacher-details-table td { padding:12px 11px; border-bottom:1px solid #dbe5ef; text-align:left; }
      .teacher-details-table th { background:#eaf8ef; color:#12233f; font-size:.72rem; text-transform:uppercase; }
      .teacher-details-table th:first-child,.teacher-details-table td:first-child { width:55px; text-align:center; }
      .teacher-details-table tbody tr:nth-child(even) { background:#f8fbfc; }
      .teacher-details-delete { display:grid; place-items:center; width:29px; height:29px; border:0; border-radius:50%; background:#fee2e2; color:#b91c1c; cursor:pointer; font-size:1rem; font-weight:800; }
      .teacher-details-delete:hover { background:#dc2626; color:#fff; }
      .teacher-details-empty { color:#65748b; text-align:center !important; }
      @media(max-width:1050px) { .teacher-details-form { grid-template-columns:repeat(2,minmax(0,1fr)); } .teacher-details-submit { width:fit-content; } }
      @media(max-width:600px) { .teacher-details-form { grid-template-columns:1fr; } }
    `;
    document.head.appendChild(style);
  };

  const readTeacherDetails = () => {
    try {
      const teachers = JSON.parse(localStorage.getItem(teacherDetailsKey) || '[]');
      return Array.isArray(teachers) ? teachers : [];
    } catch (error) {
      return [];
    }
  };

  const renderSection = (title) => {
    const content = document.getElementById('adminContent');
    if (!content) return;
    content.innerHTML = `<section class="admin-panel"><h2>${title}</h2></section>`;
  };

  window.DocenteModules.Encuestas = {
    render: () => {
      const content = document.getElementById('adminContent');
      if (!content) return;
      addTeacherStyles();
      const key = 'matecienciasEncuestaLink';
      const canEdit = () => typeof UsuarioService !== 'undefined' && UsuarioService.isAdminSessionValid?.();
      let savedLink = '';
      try { savedLink = localStorage.getItem(key) || ''; } catch (error) { /* Sin enlace disponible. */ }
      const validLink = (value) => {
        try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch (error) { return false; }
      };
      content.innerHTML = `<section class="admin-panel teacher-details-panel"><h2>Encuestas</h2>${canEdit() ? `<form id="surveyLinkForm"><label class="teacher-details-field">Enlace de la encuesta<input name="url" type="url" required placeholder="https://forms.gle/..." value="${escapeHtml(savedLink)}" /></label><button class="teacher-details-submit" type="submit" style="margin-top:12px">Guardar enlace</button></form>` : ''}<p id="surveyLinkStatus" role="status"></p><p id="surveyLinkAccess"></p></section>`;
      const drawLink = () => {
        const access = document.getElementById('surveyLinkAccess');
        access.textContent = '';
        if (!validLink(savedLink)) { access.textContent = 'Aún no hay una encuesta publicada.'; return; }
        const link = document.createElement('a');
        link.href = savedLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir encuesta';
        access.appendChild(link);
      };
      drawLink();
      document.getElementById('surveyLinkForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = document.getElementById('surveyLinkStatus');
        if (!canEdit()) { status.textContent = 'Solo el administrador puede cambiar el enlace.'; return; }
        const value = event.currentTarget.elements.url.value.trim();
        if (!validLink(value)) { status.textContent = 'Ingresa un enlace válido que empiece con https:// o http://.'; return; }
        try {
          localStorage.setItem(key, value);
          savedLink = value;
          drawLink();
          status.textContent = 'Enlace de la encuesta guardado.';
        } catch (error) { status.textContent = 'No se pudo guardar el enlace. Inténtalo nuevamente.'; }
      });
    }
  };


  window.DocenteModules.MisDocentes = {
    render: () => {
      const content = document.getElementById('adminContent');
      if (!content) return;
      addTeacherStyles();
      const drawTeachers = () => {
        const teachers = readTeacherDetails();
        const rows = teachers.length ? teachers.map((teacher, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(teacher.name)}</td><td>${escapeHtml(teacher.email)}</td><td>${escapeHtml(teacher.specialty)}</td><td>${escapeHtml(teacher.areas)}</td><td><button class="teacher-details-delete" type="button" data-delete-teacher-detail="${teacher.id}" aria-label="Eliminar docente" title="Eliminar docente">×</button></td></tr>`).join('') : '<tr><td class="teacher-details-empty" colspan="6">No hay docentes registrados.</td></tr>';
        content.innerHTML = `<section class="admin-panel teacher-details-panel"><form class="teacher-details-form" id="teacherDetailsForm"><label class="teacher-details-field">Nombres y apellidos<input id="teacherDetailName" required placeholder="Nombre completo" /></label><label class="teacher-details-field">Correo<input id="teacherDetailEmail" type="email" required placeholder="correo@ejemplo.com" /></label><label class="teacher-details-field">Especialidad<input id="teacherDetailSpecialty" required placeholder="Especialidad" /></label><label class="teacher-details-field">Áreas<input id="teacherDetailAreas" required placeholder="Áreas que enseña" /></label><button class="teacher-details-submit" type="submit">Agregar</button></form><div class="teacher-details-wrap"><table class="teacher-details-table"><thead><tr><th>N.º</th><th>Nombres y apellidos</th><th>Correo</th><th>Especialidad</th><th>Áreas</th><th>Acción</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
        document.getElementById('teacherDetailsForm').addEventListener('submit', (event) => {
          event.preventDefault();
          const updated = readTeacherDetails();
          updated.push({ id: `docente-${Date.now()}`, name: document.getElementById('teacherDetailName').value.trim(), email: document.getElementById('teacherDetailEmail').value.trim(), specialty: document.getElementById('teacherDetailSpecialty').value.trim(), areas: document.getElementById('teacherDetailAreas').value.trim() });
          localStorage.setItem(teacherDetailsKey, JSON.stringify(updated));
          drawTeachers();
        });
        content.querySelectorAll('[data-delete-teacher-detail]').forEach((button) => button.addEventListener('click', () => {
          if (!window.confirm('¿Eliminar este docente?')) return;
          localStorage.setItem(teacherDetailsKey, JSON.stringify(readTeacherDetails().filter((teacher) => teacher.id !== button.dataset.deleteTeacherDetail)));
          drawTeachers();
        }));
      };
      drawTeachers();
    }
  };
})();
