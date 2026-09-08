(function () {
  const RANKING_KEY = 'matecienciasRanking';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function getRanking() {
    try {
      const ranking = JSON.parse(localStorage.getItem(RANKING_KEY) || '[]');
      return Array.isArray(ranking) ? ranking : [];
    } catch (error) {
      return [];
    }
  }

  function saveRanking(ranking) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  }

  function renderProfile(container) {
    if (!container || !window.UsuarioService) return;
    const name = UsuarioService.getStoredUserName() || 'Estudiante';
    const initials = UsuarioService.getInitials(name);
    container.innerHTML = `<div class="profile-avatar">${escapeHtml(initials)}</div><div><strong>${escapeHtml(name)}</strong><span>Alumno</span></div>`;
  }

  function saveResult(result) {
    const ranking = getRanking();
    const entry = { ...result, name: UsuarioService?.getStoredUserName() || 'Estudiante', finishedAt: Date.now() };
    const sameAttempt = ranking.findIndex((item) => item.name === entry.name && item.course === entry.course);
    if (sameAttempt >= 0) {
      const previous = ranking[sameAttempt];
      const isBetter = entry.correct > previous.correct ||
        (entry.correct === previous.correct && entry.score > previous.score) ||
        (entry.correct === previous.correct && entry.score === previous.score && entry.time < previous.time);
      if (isBetter) ranking[sameAttempt] = entry;
    } else {
      ranking.push(entry);
    }
    saveRanking(ranking);
    return ranking
      .filter((item) => item.course === entry.course)
      .sort((left, right) => right.correct - left.correct || right.score - left.score || left.time - right.time || left.finishedAt - right.finishedAt);
  }

  function renderRanking(container, ranking) {
    if (!container) return;
    const rows = ranking.slice(0, 10).map((item, index) => `<li><strong>${index + 1}</strong><span>${escapeHtml(item.name)}</span><b>${item.correct} aciertos · ${item.score.toFixed(2)} pts · ${item.time}s</b></li>`).join('');
    container.innerHTML = `<h2>Ranking de resultados</h2><p>Ordenado por aciertos, puntaje y menor tiempo.</p><ol>${rows || '<li>Aún no hay resultados.</li>'}</ol>`;
    container.classList.add('visible');
  }

  window.PerfilRankingService = { renderProfile, saveResult, renderRanking, getRanking };
})();
