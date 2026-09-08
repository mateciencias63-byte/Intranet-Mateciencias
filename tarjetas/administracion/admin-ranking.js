(function () {
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  const readRanking = () => {
    try {
      const records = JSON.parse(localStorage.getItem('matecienciasRanking') || '[]');
      return Array.isArray(records) ? records : [];
    } catch (error) {
      return [];
    }
  };

  const addStyles = () => {
    if (document.getElementById('rankingAdminStyles')) return;
    const style = document.createElement('style');
    style.id = 'rankingAdminStyles';
    style.textContent = `
      .ranking-admin-panel { grid-column:1 / -1; width:100%; }
      .ranking-admin-panel + .ranking-admin-panel { margin-top:18px; }
      .ranking-admin-panel { position:relative; }
      .ranking-admin-title { display:flex; align-items:baseline; gap:8px; margin:0 42px 16px 0; color:#12233f; }
      .ranking-admin-title span { color:#1769d1; font-size:.74rem; letter-spacing:.08em; text-transform:uppercase; }
      .ranking-admin-delete { position:absolute; top:14px; right:16px; display:grid; place-items:center; width:32px; height:32px; padding:0; border:0; border-radius:50%; background:#fee2e2; color:#b91c1c; cursor:pointer; font-size:1.25rem; font-weight:800; line-height:1; }
      .ranking-admin-delete:hover { background:#dc2626; color:#fff; transform:scale(1.05); }
      .ranking-admin-delete:focus-visible { outline:3px solid rgba(220,38,38,.3); outline-offset:2px; }
      .ranking-admin-wrap { overflow-x:auto; }
      .ranking-admin-table { width:100%; min-width:780px; border-collapse:collapse; color:#12233f; font-size:.82rem; }
      .ranking-admin-table th,.ranking-admin-table td { padding:11px 12px; border:1px solid #cbd5e1; text-align:left; }
      .ranking-admin-table th { background:#eaf8ef; color:#001a4d; font-size:.72rem; text-transform:uppercase; }
      .ranking-admin-table tbody tr:nth-child(-n+3) { background:#eef5ff; }
      .ranking-admin-empty { color:#65748b; }
    `;
    document.head.appendChild(style);
  };

  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    addStyles();
    const records = readRanking();
    const courses = [...new Set(records.map((record) => record.course))].sort();
    target.innerHTML = courses.length ? courses.map((course) => {
      const courseRecords = records
        .filter((record) => record.course === course)
        .sort((left, right) => right.correct - left.correct || right.score - left.score || left.time - right.time || left.finishedAt - right.finishedAt);
      const rows = courseRecords.map((record, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(record.name)}</td><td>${Number(record.score || 0).toFixed(2)}</td><td>${Number(record.correct || 0)}</td><td>${Number(record.incorrect || 0)}</td><td>${Number(record.blank || 0)}</td><td>${Number(record.time || 0)} s</td></tr>`).join('');
      return `<section class="panel ranking-admin-panel"><button class="ranking-admin-delete" type="button" data-delete-ranking="${escapeHtml(course)}" aria-label="Eliminar cuestionario ${escapeHtml(course)}" title="Eliminar cuestionario">×</button><h2 class="ranking-admin-title"><span>Cuestionario:</span>${escapeHtml(course)}</h2><div class="ranking-admin-wrap"><table class="ranking-admin-table"><thead><tr><th>Puesto</th><th>Participante</th><th>Puntaje</th><th>Aciertos</th><th>Incorrectas</th><th>En blanco</th><th>Tiempo</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
    }).join('') : '<section class="panel ranking-admin-panel"><h2>Ranking</h2><p class="ranking-admin-empty">Todavía no hay resultados registrados.</p></section>';
  };

  window.DocenteModules = window.DocenteModules || {};
  window.DocenteModules.Ranking = { render };
  document.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-ranking]');
    if (!deleteButton) return;
    const course = deleteButton.dataset.deleteRanking;
    if (!window.confirm(`¿Eliminar el cuestionario "${course}" y todos sus resultados?`)) return;
    const remainingRecords = readRanking().filter((record) => record.course !== course);
    localStorage.setItem('matecienciasRanking', JSON.stringify(remainingRecords));
    render();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'matecienciasRanking') render();
  });
})();
