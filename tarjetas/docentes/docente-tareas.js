(() => {
  window.DocenteModules = window.DocenteModules || {};
  const taskKey = 'matecienciasTareas';
  const submissionKey = 'matecienciasEntregasTareas';
  const courses = ['Aritmética', 'Álgebra', 'Geometría', 'Trigonometría', 'Razonamiento Matemático', 'Razonamiento Lógico', 'Aptitud Verbal', 'Lengua y Literatura', 'Historia del Perú', 'Geografía', 'Economía', 'Física', 'Química', 'Biología', 'Psicología', 'Cívica', 'Filosofía', 'Historia Universal'];

  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (error) { return []; }
  };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const formatDate = (value) => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin fecha límite';

  const addStyles = () => {
    if (document.getElementById('tareasDocenteStyles')) return;
    const style = document.createElement('style');
    style.id = 'tareasDocenteStyles';
    style.textContent = `
      .tareas-docente-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
      .tareas-form { display:grid; gap:14px; }
      .tareas-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
      .tareas-field { display:grid; gap:7px; color:#12233f; font-size:.84rem; font-weight:700; }
      .tareas-field input, .tareas-field select, .tareas-field textarea { width:100%; padding:10px 11px; border:1px solid #cbd5e1; border-radius:7px; background:#fff; color:#12233f; font:inherit; box-sizing:border-box; }
      .tareas-field textarea { min-height:90px; resize:vertical; }
      .tareas-field.full { grid-column:1/-1; }
      .tareas-publish { width:fit-content; padding:11px 16px; border:0; border-radius:7px; background:#0d8f36; color:#fff; cursor:pointer; font-weight:700; }
      .tareas-message { margin:0; color:#0d8f36; font-size:.82rem; font-weight:700; }
      .tareas-list { display:grid; gap:11px; margin-top:22px; }
      .tarea-item { padding:14px; border:1px solid #d6e1eb; border-radius:8px; background:#f8fbfc; }
      .tarea-item-header { display:flex; justify-content:space-between; gap:12px; align-items:start; }
      .tarea-item strong { color:#12233f; }
      .tarea-item small { display:block; margin-top:5px; color:#65748b; line-height:1.45; }
      .tarea-state { padding:4px 8px; border-radius:999px; background:#eaf8ef; color:#08652b; font-size:.7rem; font-weight:700; white-space:nowrap; }
      .tarea-state.draft { background:#fff2e8; color:#a54e18; }
      .tarea-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
      .tarea-action { width:34px; height:34px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; color:#12233f; cursor:pointer; font-size:21px; }
      .tarea-action.delete { color:#b42318; }
      .tarea-action:hover { background:#eaf8ef; }
      .tarea-action.delete:hover { background:#fee2e2; }
      .tareas-form-actions { display:flex; gap:10px; }
      .tareas-cancel { padding:10px; border:1px solid #cbd5e1; border-radius:7px; background:#fff; cursor:pointer; }
      .tarea-submissions { margin-top:12px; padding-top:12px; border-top:1px solid #d6e1eb; }
      .tarea-submission { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 0; color:#65748b; font-size:.78rem; }
      .tarea-grade-form { display:flex; gap:6px; align-items:center; }
      .tarea-grade-form input { width:62px; padding:6px; border:1px solid #cbd5e1; border-radius:5px; }
      .tarea-grade-form button { padding:6px 9px; border:0; border-radius:5px; background:#12233f; color:#fff; cursor:pointer; font-size:.75rem; }
      @media (max-width:700px) { .tareas-form-grid { grid-template-columns:1fr; } .tareas-field.full { grid-column:auto; } .tarea-item-header, .tarea-submission { display:block; } .tarea-state, .tarea-grade-form { display:inline-flex; margin-top:8px; } }
    `;
    document.head.appendChild(style);
  };

  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    addStyles();
    target.innerHTML = `<section class="panel tareas-docente-panel" aria-labelledby="tareasTitle">
      <div class="panel-header"><h2 id="tareasTitle">Crear y publicar tarea</h2></div>
      <form class="tareas-form" id="tareaForm">
        <div class="tareas-form-grid">
          <label class="tareas-field">Título<input id="tareaTitle" required maxlength="120" placeholder="Ej. Práctica de ecuaciones" /></label>
          <label class="tareas-field">Curso<select id="tareaCourse" required><option value="">Selecciona un curso</option>${courses.map((course) => `<option>${course}</option>`).join('')}</select></label>
          <label class="tareas-field">Tipo<select id="tareaType"><option value="archivo">Entrega de archivo</option><option value="encuesta">Encuesta o respuesta</option></select></label>
          <label class="tareas-field">Puntaje máximo (1 a 20)<input id="tareaPoints" type="number" min="1" max="20" step="1" value="20" required /></label>
          <label class="tareas-field">Fecha y hora límite<input id="tareaDueDate" type="datetime-local" required /></label>
          <label class="tareas-field">Archivo de apoyo (opcional)<input id="tareaFile" type="file" /></label>
          <label class="tareas-field full">Instrucciones o pregunta<textarea id="tareaInstructions" required placeholder="Escribe las indicaciones para tus estudiantes."></textarea></label>
        </div>
        <label class="tareas-field"><span><input id="tareaPublished" type="checkbox" checked /> Publicar oficialmente para los alumnos</span></label>
        <p class="tareas-message" id="tareaAttachment"></p>
        <div class="tareas-form-actions"><button class="tareas-publish" id="tareaSave" type="submit">Guardar tarea</button><button class="tareas-cancel" id="tareaCancel" type="button" hidden>Cancelar edición</button></div>
        <p class="tareas-message" id="tareaMessage" role="status"></p>
      </form>
      <div class="tareas-list" id="tareasList"></div>
    </section>`;

    let editingId = null;
    let saving = false;
    const resetEditor = () => {
      editingId = null;
      document.getElementById('tareaForm').reset();
      document.getElementById('tareasTitle').textContent = 'Crear y publicar tarea';
      document.getElementById('tareaSave').textContent = 'Guardar tarea';
      document.getElementById('tareaCancel').hidden = true;
      document.getElementById('tareaAttachment').textContent = '';
    };
    document.getElementById('tareaCancel').addEventListener('click', () => {
      if (saving) return;
      resetEditor();
      document.getElementById('tareaMessage').textContent = '';
    });
    document.getElementById('tareasList').addEventListener('click', (event) => {
      const button = event.target.closest('[data-edit-task], [data-delete-task]');
      if (!button || saving) return;
      const taskId = button.dataset.editTask || button.dataset.deleteTask;
      const tasks = read(taskKey);
      const task = tasks.find((item) => String(item.id) === taskId);
      if (!task) { renderTasks(); return; }
      if (button.hasAttribute('data-delete-task')) {
        if (!confirm(`¿Eliminar la actividad "${task.title}"?`)) return;
        try {
          localStorage.setItem(taskKey, JSON.stringify(tasks.filter((item) => item.id !== task.id)));
        } catch (error) {
          document.getElementById('tareaMessage').textContent = 'No se pudo eliminar la actividad. Intenta nuevamente.';
          return;
        }
        if (editingId === task.id) resetEditor();
        renderTasks();
        document.getElementById('tareaMessage').textContent = 'Actividad eliminada.';
        return;
      }
      editingId = task.id;
      const fields = { tareaTitle:'title', tareaCourse:'course', tareaType:'type', tareaPoints:'points', tareaDueDate:'dueDate', tareaInstructions:'instructions' };
      Object.entries(fields).forEach(([id, key]) => { document.getElementById(id).value = task[key] ?? ''; });
      document.getElementById('tareaPublished').checked = !!task.published;
      document.getElementById('tareaFile').value = '';
      document.getElementById('tareaAttachment').textContent = task.attachment ? `Archivo actual: ${task.attachment.name}. Se conservará si no seleccionas otro.` : '';
      document.getElementById('tareasTitle').textContent = 'Editar actividad';
      document.getElementById('tareaSave').textContent = 'Guardar cambios';
      document.getElementById('tareaCancel').hidden = false;
      document.getElementById('tareaMessage').textContent = '';
      document.getElementById('tareaForm').scrollIntoView({ behavior:'smooth', block:'start' });
      document.getElementById('tareaTitle').focus({ preventScroll:true });
    });
    const renderTasks = () => {
      const tasks = read(taskKey);
      const submissions = read(submissionKey);
      document.getElementById('tareasList').innerHTML = tasks.length ? tasks.map((task) => {
        const taskSubmissions = submissions.filter((submission) => submission.taskId === task.id);
        return `<article class="tarea-item"><div class="tarea-item-header"><div><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.course)} · ${task.type === 'encuesta' ? 'Encuesta' : 'Archivo'} · ${task.points} puntos · Límite: ${formatDate(task.dueDate)}</small></div><div class="tarea-actions"><span class="tarea-state ${task.published ? '' : 'draft'}">${task.published ? 'Publicada' : 'Borrador'}</span><button class="tarea-action" type="button" data-edit-task="${escapeHtml(task.id)}" aria-label="Editar actividad: ${escapeHtml(task.title)}" title="Editar actividad">✎</button><button class="tarea-action delete" type="button" data-delete-task="${escapeHtml(task.id)}" aria-label="Eliminar actividad: ${escapeHtml(task.title)}" title="Eliminar actividad">×</button></div></div><small>${escapeHtml(task.instructions)}</small><div class="tarea-submissions"><strong>Entregas: ${taskSubmissions.length}</strong>${taskSubmissions.length ? taskSubmissions.map((submission) => `<div class="tarea-submission"><span>${escapeHtml(submission.student)}${submission.fileName ? ` · <a href="${submission.attachment?.data || '#'}" download="${escapeHtml(submission.fileName)}">Abrir entrega</a>` : ''}${submission.response ? ` · Respuesta: ${escapeHtml(submission.response)}` : ''}${submission.grade !== null && submission.grade !== undefined ? ` · ${submission.grade}/${task.points}` : ' · Sin calificar'}</span><form class="tarea-grade-form" data-submission-id="${submission.id}"><input type="number" min="0" max="${task.points}" value="${submission.grade ?? ''}" placeholder="Nota" required /><button type="submit">Publicar nota</button></form></div>`).join('') : '<small>Aún no hay entregas.</small>'}</div></article>`;
      }).join('') : '<p class="tareas-message">Todavía no has creado tareas.</p>';
      document.querySelectorAll('.tarea-grade-form').forEach((form) => form.addEventListener('submit', (event) => {
        event.preventDefault();
        const grade = Number(form.querySelector('input').value);
        const updated = read(submissionKey).map((submission) => submission.id === form.dataset.submissionId ? { ...submission, grade, gradedAt: new Date().toISOString() } : submission);
        localStorage.setItem(submissionKey, JSON.stringify(updated));
        renderTasks();
      }));
    };

    document.getElementById('tareaForm').addEventListener('submit', (event) => {
      event.preventDefault();
      if (saving) return;
      const points = Number(document.getElementById('tareaPoints').value);
      if (points < 1 || points > 20) { document.getElementById('tareaMessage').textContent = 'El puntaje debe estar entre 1 y 20.'; return; }
      const file = document.getElementById('tareaFile').files[0];
      const saveTask = (attachment) => {
        const tasks = read(taskKey);
        const existing = editingId === null ? null : tasks.find((task) => task.id === editingId);
        if (editingId !== null && !existing) {
          saving = false;
          document.getElementById('tareaMessage').textContent = 'La actividad ya no existe. Cancela la edición para crear otra.';
          return;
        }
        const task = { ...existing, id: existing?.id || `tarea-${Date.now()}`, title: document.getElementById('tareaTitle').value.trim(), course: document.getElementById('tareaCourse').value, type: document.getElementById('tareaType').value, points, dueDate: document.getElementById('tareaDueDate').value, instructions: document.getElementById('tareaInstructions').value.trim(), attachment: attachment || existing?.attachment || null, published: document.getElementById('tareaPublished').checked, teacher: existing?.teacher || sessionStorage.getItem('docenteUser') || 'Docente', createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
        if (existing) tasks[tasks.indexOf(existing)] = task; else tasks.unshift(task);
        try {
          localStorage.setItem(taskKey, JSON.stringify(tasks));
        } catch (error) {
          saving = false;
          document.getElementById('tareaMessage').textContent = 'No se pudieron guardar los cambios. Revisa el espacio de almacenamiento e intenta nuevamente.';
          return;
        }
        saving = false;
        resetEditor();
        document.getElementById('tareaMessage').textContent = existing ? 'Actividad actualizada correctamente.' : 'Tarea guardada correctamente.';
        renderTasks();
        if (task.published) window.NotificacionesService?.add({ title: existing ? 'Actividad actualizada' : 'Nueva tarea publicada', detail: `${task.title} · ${task.course}`, author: task.teacher });
      };
      if (!file) { saveTask(null); return; }
      if (file.size > 4000000) { document.getElementById('tareaMessage').textContent = 'El archivo no debe superar 4 MB.'; return; }
      const reader = new FileReader();
      saving = true;
      reader.onerror = () => { saving = false; document.getElementById('tareaMessage').textContent = 'No se pudo leer el archivo. Intenta nuevamente.'; };
      reader.onload = () => saveTask({ name: file.name, data: reader.result });
      reader.readAsDataURL(file);
    });
    renderTasks();
    window.addEventListener('storage', (event) => { if (event.key === taskKey || event.key === submissionKey) renderTasks(); });
  };

  window.DocenteModules.Tareas = { name: 'Tareas', render };
})();
