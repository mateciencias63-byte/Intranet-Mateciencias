(() => {
  window.DocenteModules = window.DocenteModules || {};
  const resultsKey = 'matecienciasResultadosExamenes';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  const readResults = () => {
    try {
      const results = JSON.parse(localStorage.getItem(resultsKey) || '[]');
      return Array.isArray(results) ? results : [];
    } catch (error) {
      return [];
    }
  };
  const formatDate = (value) => value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';

  const addStyles = () => {
    if (document.getElementById('promedioGeneralStyles')) return;
    const style = document.createElement('style');
    style.id = 'promedioGeneralStyles';
    style.textContent = `
      .promedio-general-panel { grid-column: 1 / -1; width: 100%; min-height: calc(100vh - 170px); }
      .promedio-general-summary { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:18px; color:#65748b; font-size:.84rem; }
      .promedio-general-table-wrap { width:100%; overflow:auto; border:1px solid #cbd5e1; }
      .promedio-general-table { width:100%; min-width:850px; border-collapse:collapse; color:#12233f; font-size:.82rem; }
      .promedio-general-table th, .promedio-general-table td { padding:12px 10px; border:1px solid #d6e1eb; text-align:left; }
      .promedio-general-table th { background:#eaf8ef; color:#12233f; font-size:.74rem; text-transform:uppercase; }
      .promedio-general-table tbody tr:nth-child(even) { background:#f8fbfc; }
      .promedio-score { color:#08652b; font-weight:800; }
      .promedio-delete-cell { width:58px; text-align:center !important; }
      .promedio-delete { display:inline-grid; place-items:center; width:28px; height:28px; border:0; border-radius:5px; background:#fde8e8; color:#b4232f; cursor:pointer; font-size:1.1rem; font-weight:800; line-height:1; }
      .promedio-delete:hover { background:#f8caca; }
      .promedio-empty { color:#65748b; }
    `;
    document.head.appendChild(style);
  };

  const render = () => {
    const target = document.querySelector('.content-grid');
    if (!target) return;
    addStyles();
    const results = readResults().sort((first, second) => new Date(second.completedAt) - new Date(first.completedAt));
    target.innerHTML = `<section class="panel promedio-general-panel" aria-labelledby="promedioGeneralTitle"><div class="panel-header"><h2 id="promedioGeneralTitle">Promedio general</h2></div><div class="promedio-general-summary"><span>${results.length} examen${results.length === 1 ? '' : 'es'} finalizado${results.length === 1 ? '' : 's'}</span><span>Reglas: correcta +4 · incorrecta -0.25 · en blanco -0.10</span></div>${results.length ? `<div class="promedio-general-table-wrap"><table class="promedio-general-table"><thead><tr><th>Nombre completo</th><th>Curso</th><th>Semana</th><th>Puntaje</th><th>Correctas</th><th>Incorrectas</th><th>En blanco</th><th>Finalizado</th><th>Eliminar</th></tr></thead><tbody>${results.map((result, index) => `<tr><td>${escapeHtml(result.student)}</td><td>${escapeHtml(result.course)}</td><td>${escapeHtml(result.week)}</td><td class="promedio-score">${escapeHtml(result.score)} puntos</td><td>${escapeHtml(result.correct)}</td><td>${escapeHtml(result.incorrect)}</td><td>${escapeHtml(result.blank)}</td><td>${formatDate(result.completedAt)}</td><td class="promedio-delete-cell"><button class="promedio-delete" type="button" data-result-index="${index}" title="Eliminar resultado" aria-label="Eliminar resultado">X</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="promedio-empty">Todavía no hay exámenes finalizados por los alumnos.</p>'}</section>`;
    document.querySelectorAll('.promedio-delete').forEach((button) => button.addEventListener('click', () => {
      const result = results[Number(button.dataset.resultIndex)];
      if (!result || !window.confirm(`¿Eliminar el resultado de ${result.student} - ${result.course}, semana ${result.week}?`)) return;
      const storedResults = readResults();
      const resultPosition = storedResults.findIndex((item) => item.completedAt === result.completedAt && item.student === result.student && item.course === result.course && String(item.week) === String(result.week));
      if (resultPosition < 0) return;
      storedResults.splice(resultPosition, 1);
      localStorage.setItem(resultsKey, JSON.stringify(storedResults));
      render();
    }));
  };

  window.DocenteModules.PromedioGeneral = { name: 'Promedio general', render };
})();
