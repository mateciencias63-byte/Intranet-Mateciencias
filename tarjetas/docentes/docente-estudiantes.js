window.DocenteModules = window.DocenteModules || {};
(() => {
	const attendanceKey = 'matecienciasAsistencias';
	const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

	const getStudents = () => {
		try {
			const records = JSON.parse(localStorage.getItem(attendanceKey) || '[]');
			if (!Array.isArray(records)) return [];
			return [...new Map(records.filter((record) => record.student).map((record) => [record.code || record.student, record])).values()];
		} catch (error) {
			return [];
		}
	};

	const addStyles = () => {
		if (document.getElementById('estudiantesStyles')) return;
		const style = document.createElement('style');
		style.id = 'estudiantesStyles';
		style.textContent = `
			.estudiantes-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.estudiantes-table-wrap { overflow-x: auto; border: 1px solid #cbd5e1; }
			.estudiantes-table { width: 100%; min-width: 620px; border-collapse: collapse; color: #12233f; font-size: .82rem; }
			.estudiantes-table th, .estudiantes-table td { padding: 10px 12px; border: 1px solid #9aa7b5; text-align: left; }
			.estudiantes-table thead th { background: #ffff00; color: #000; font-weight: 800; text-transform: uppercase; }
			.estudiantes-table th:first-child, .estudiantes-table td:first-child { width: 48px; text-align: center; }
			.estudiantes-table tbody tr:nth-child(even) { background: #fbfcfd; }
			.estudiantes-empty { margin: 0; color: #65748b; font-size: .82rem; }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		const students = getStudents();
		target.innerHTML = `
			<section class="panel estudiantes-panel" aria-labelledby="estudiantesTitle">
				<div class="panel-header"><h2 id="estudiantesTitle">Estudiantes</h2></div>
				${students.length ? `<div class="estudiantes-table-wrap"><table class="estudiantes-table"><thead><tr><th>N°</th><th>Nombre y Apellidos Completos</th><th>Carrera</th><th>Universidad</th></tr></thead><tbody>${students.map((student, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(student.student)}</td><td>${escapeHtml(student.career || 'Pendiente')}</td><td>${escapeHtml(student.university || 'Pendiente')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="estudiantes-empty">Todavía no hay estudiantes registrados desde el Aula Virtual.</p>'}
			</section>`;
	};

	window.DocenteModules.Estudiantes = { name: 'Estudiantes', render };
})();
