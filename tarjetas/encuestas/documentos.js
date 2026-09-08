(() => {
  const types = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  const canEdit = () => Boolean(window.UsuarioService?.isAdminSessionValid?.());
  const keyFor = (kind) => `matecienciasDocumentos-${kind}`;
  const read = (kind) => {
    try {
      const records = JSON.parse(localStorage.getItem(keyFor(kind)) || '[]');
      return Array.isArray(records) ? records : [];
    } catch { return []; }
  };
  const mount = (target, kind, title, admin = false, teacher = false) => {
    if (!target) return;
    const canUpload = () => teacher ? kind === 'Silabos' && Boolean(sessionStorage.getItem('docenteUser')) : admin && canEdit();
    target.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = title;
    target.appendChild(heading);
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    const list = document.createElement('div');
    const draw = () => {
      list.replaceChildren();
      const records = read(kind);
      if (!records.length) { list.textContent = 'Aún no hay documentos publicados.'; return; }
      records.forEach((record) => {
        const extension = String(record.name || '').split('.').pop().toLowerCase();
        if (!types[extension] || typeof record.data !== 'string' || !record.data.startsWith(`data:${types[extension]};base64,`)) return;
        const row = document.createElement('p');
        if (record.teacher || record.course) {
          const details = document.createElement('strong');
          details.textContent = `${record.teacher || 'Docente'} · ${record.course || 'Curso'} — `;
          row.appendChild(details);
        }
        const link = document.createElement('a');
        link.textContent = `Descargar ${record.name}`;
        link.href = record.data;
        link.download = record.name;
        row.appendChild(link);
        if (admin && canEdit()) {
          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = 'Eliminar';
          remove.style.marginLeft = '12px';
          remove.addEventListener('click', () => {
            if (!canEdit()) { status.textContent = 'Solo el administrador puede eliminar documentos.'; return; }
            try {
              localStorage.setItem(keyFor(kind), JSON.stringify(read(kind).filter((item) => item.id !== record.id)));
              draw();
              status.textContent = 'Documento eliminado.';
            } catch { status.textContent = 'No se pudo eliminar el documento.'; }
          });
          row.appendChild(remove);
        }
        list.appendChild(row);
      });
    };
    if (canUpload()) {
      const form = document.createElement('form');
      form.style.cssText = 'display:grid;gap:14px;margin:20px 0;max-width:640px';
      let teacherInput;
      let courseInput;
      if (kind === 'Silabos') {
        const addField = (text, name, value = '') => {
          const field = document.createElement('label');
          field.textContent = text;
          field.style.cssText = 'display:grid;gap:6px';
          const control = document.createElement('input');
          control.name = name;
          control.required = true;
          control.maxLength = 160;
          control.value = value;
          control.style.cssText = 'padding:10px;border:1px solid #cbd5e1;border-radius:8px';
          field.appendChild(control);
          form.appendChild(field);
          return control;
        };
        teacherInput = addField('Nombre del docente', 'teacher', teacher ? sessionStorage.getItem('docenteUser') || '' : '');
        courseInput = addField('Curso', 'course');
      }
      const label = document.createElement('label');
      label.textContent = 'Subir documento (PDF o Word, máximo 2 MB) ';
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx';
      input.required = true;
      label.appendChild(input);
      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = teacher ? 'Enviar sílabo' : 'Publicar documento';
      form.append(label, button);
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!canUpload()) { status.textContent = 'No tienes una sesión autorizada para enviar documentos.'; return; }
        const teacherName = teacherInput?.value.trim() || '';
        const course = courseInput?.value.trim() || '';
        const submittedBy = teacher ? sessionStorage.getItem('docenteUser') : '';
        if (kind === 'Silabos' && (!teacherName || !course)) { status.textContent = 'Completa el nombre del docente y el curso.'; return; }
        const file = input.files[0];
        const extension = file?.name.split('.').pop().toLowerCase();
        if (!file || !types[extension]) { status.textContent = 'Selecciona un archivo PDF o Word (.doc o .docx).'; return; }
        if (!file.size || file.size > 2 * 1024 * 1024) { status.textContent = 'El archivo debe tener contenido y no superar 2 MB.'; return; }
        button.disabled = true;
        try {
          const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
          const signature = extension === 'pdf' ? [37, 80, 68, 70, 45] : extension === 'doc' ? [208, 207, 17, 224, 161, 177, 26, 225] : [80, 75, 3, 4];
          if (!signature.every((byte, index) => bytes[index] === byte)) throw new Error('El contenido no corresponde a un PDF o Word válido.');
          const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
            reader.readAsDataURL(new Blob([file], { type: types[extension] }));
          });
          if (!canUpload() || (teacher && submittedBy !== sessionStorage.getItem('docenteUser'))) throw new Error('La sesión cambió o terminó. Vuelve a iniciar sesión.');
          const records = read(kind);
          records.push({ id: crypto.randomUUID(), name: file.name, data, teacher: teacherName, course, submittedBy, createdAt: new Date().toISOString() });
          localStorage.setItem(keyFor(kind), JSON.stringify(records));
          form.reset();
          draw();
          status.textContent = teacher ? 'Sílabo enviado correctamente.' : 'Documento publicado.';
        } catch (error) {
          status.textContent = error.name === 'QuotaExceededError' ? 'No hay espacio disponible. Elimina un documento o usa un archivo más pequeño.' : error.message || 'No se pudo publicar el documento.';
        } finally { button.disabled = false; }
      });
      target.appendChild(form);
    }
    target.append(status, list);
    draw();
  };
  window.DocenteModules = window.DocenteModules || {};
  window.DocenteModules.SilaboDocente = { render: () => {
    const content = document.querySelector('.content-grid');
    if (!content) return;
    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.style.padding = '24px';
    content.replaceChildren(panel);
    mount(panel, 'Silabos', 'Enviar sílabo', false, true);
  } };
  for (const [kind, title] of [['Certificados', 'Certificados'], ['Silabos', 'Sílabos']]) {
    window.DocenteModules[kind] = { render: () => {
      const content = document.getElementById('adminContent');
      if (!content) return;
      const panel = document.createElement('section');
      panel.className = 'admin-panel';
      content.replaceChildren(panel);
      mount(panel, kind, title, true);
    } };
  }
  const renderStudent = () => {
    mount(document.querySelector('[data-panel="certificados"] .aula-panel'), 'Certificados', 'Certificados');
    mount(document.querySelector('[data-panel="silabo"] .aula-panel'), 'Silabos', 'Sílabos');
  };
  renderStudent();
  window.addEventListener('storage', (event) => { if (event.key === null || event.key.startsWith('matecienciasDocumentos-')) renderStudent(); });
  window.addEventListener('focus', renderStudent);
})();
