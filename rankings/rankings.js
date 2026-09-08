(function () {
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  let records = [];
  try {
    const stored = JSON.parse(localStorage.getItem('matecienciasRanking') || '[]');
    records = Array.isArray(stored) ? stored : [];
  } catch (error) {
    records = [];
  }

  const target = document.getElementById('rankingsList');
  const courses = [...new Set(records.map((record) => record.course).filter(Boolean))].sort();
  if (!courses.length) {
    target.innerHTML = '<div class="rankings-empty">Todavía no existen resultados registrados.</div>';
    return;
  }

  target.innerHTML = courses.map((course) => {
    const ranking = records.filter((record) => record.course === course)
      .sort((left, right) => Number(right.correct || 0) - Number(left.correct || 0) || Number(right.score || 0) - Number(left.score || 0) || Number(left.time || 0) - Number(right.time || 0));
    const rows = ranking.map((record, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(record.name)}</td><td>${Number(record.score || 0).toFixed(2)}</td><td>${Number(record.correct || 0)}</td><td>${Number(record.incorrect || 0)}</td><td>${Number(record.blank || 0)}</td><td>${Number(record.time || 0)}s</td></tr>`).join('');
    return `<section class="ranking-group"><h2>${escapeHtml(course)}</h2><div class="ranking-wrap"><table><thead><tr><th>Puesto</th><th>Participante</th><th>Puntaje</th><th>Aciertos</th><th>Incorrectas</th><th>En blanco</th><th>Tiempo</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }).join('');
})();
