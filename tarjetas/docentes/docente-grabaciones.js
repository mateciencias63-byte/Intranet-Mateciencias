(() => {
  window.DocenteModules = window.DocenteModules || {};
  const recordingKey = 'matecienciasGrabaciones';
  const readRecordings = () => {
    try {
      const recordings = JSON.parse(localStorage.getItem(recordingKey) || '[]');
      return Array.isArray(recordings) ? recordings : [];
    } catch (error) { return []; }
  };
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const getYoutubeId = (value) => {
    try {
      const url = new URL(value);
      if (!['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname.replace(/^www\./, ''))) return '';
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0];
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      const match = url.pathname.match(/\/shorts\/([^/]+)/);
      return match ? match[1] : '';
    } catch (error) { return ''; }
  };
  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    target.innerHTML = `<section class="panel grabaciones-admin-panel"><div class="panel-header"><h2>Publicar grabación</h2></div><form class="grabaciones-form" id="recordingForm"><label>Título de la clase<input id="recordingTitle" maxlength="120" required placeholder="Ej. Clase de Álgebra - Semana 1" /></label><label>Curso<input id="recordingCourse" maxlength="80" required placeholder="Ej. Álgebra" /></label><label>Enlace de YouTube<input id="recordingUrl" type="url" required placeholder="https://www.youtube.com/watch?v=..." /></label><button class="grabaciones-submit" type="submit">Publicar grabación</button><p class="grabaciones-message" id="recordingMessage" role="status"></p></form><div class="grabaciones-admin-list" id="recordingsAdminList"></div></section>`;
    const renderList = () => {
      const recordings = readRecordings();
      document.getElementById('recordingsAdminList').innerHTML = recordings.length ? recordings.map((recording, index) => `<div class="grabacion-admin-item"><span><strong>${escapeHtml(recording.title)}</strong><small>${escapeHtml(recording.course)}</small></span><button type="button" class="grabacion-delete" data-recording-index="${index}" aria-label="Eliminar grabación" title="Eliminar grabación">X</button></div>`).join('') : '<p class="grabaciones-muted">Todavía no hay grabaciones publicadas.</p>';
      document.querySelectorAll('.grabacion-delete').forEach((button) => button.addEventListener('click', () => {
        if (!window.confirm('¿Eliminar esta grabación?')) return;
        const updated = readRecordings();
        updated.splice(Number(button.dataset.recordingIndex), 1);
        localStorage.setItem(recordingKey, JSON.stringify(updated));
        renderList();
      }));
    };
    document.getElementById('recordingForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('recordingTitle').value.trim();
      const course = document.getElementById('recordingCourse').value.trim();
      const url = document.getElementById('recordingUrl').value.trim();
      const youtubeId = getYoutubeId(url);
      const message = document.getElementById('recordingMessage');
      if (!youtubeId) { message.textContent = 'Ingresa un enlace válido de YouTube.'; return; }
      const recordings = readRecordings();
      recordings.unshift({ id: `grabacion-${Date.now()}`, title, course, youtubeId, publishedAt: new Date().toISOString(), publishedBy: sessionStorage.getItem('adminUsuario') || 'Administrador' });
      localStorage.setItem(recordingKey, JSON.stringify(recordings));
      window.NotificacionesService?.add({ title: 'Nueva grabación publicada', detail: `${title} · ${course}`, author: recordings[0].publishedBy });
      event.currentTarget.reset();
      message.textContent = 'Grabación publicada correctamente.';
      renderList();
    });
    renderList();
  };
  window.DocenteModules.Grabaciones = { name: 'Grabaciones', render };
})();
