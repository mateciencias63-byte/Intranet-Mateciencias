(() => {
	window.DocenteModules = window.DocenteModules || {};

	const days = ['L', 'M', 'M', 'J', 'V', 'S'];
	const weekCount = 10;
	const studentCount = 13;
	const storageKey = 'docenteAsistenciaPanel';
	const state = JSON.parse(localStorage.getItem(storageKey) || '{"marks":{},"published":false}');

	const saveState = () => localStorage.setItem(storageKey, JSON.stringify(state));
	const getSubmittedAttendance = () => {
		try {
			const records = JSON.parse(localStorage.getItem('matecienciasAsistencias') || '[]');
			return Array.isArray(records) ? records.filter((record) => record.student && record.code && record.className && record.date && record.status) : [];
		} catch (error) {
			return [];
		}
	};
	const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

	const addStyles = () => {
		if (document.getElementById('asistenciaStyles')) return;
		const style = document.createElement('style');
		style.id = 'asistenciaStyles';
		style.textContent = `
			.asistencia-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.asistencia-submitted-panel { margin-bottom: 18px; }
			.asistencia-submitted-table { width: 100%; border-collapse: collapse; color: #12233f; font-size: .8rem; }
			.asistencia-submitted-table th, .asistencia-submitted-table td { padding: 10px 9px; border: 1px solid #d6dee7; text-align: left; }
			.asistencia-submitted-table th { background: #e8f1fb; color: #174a7c; }
			.asistencia-submitted-status { color: #0d8f36; font-weight: 700; }
			.asistencia-actions { display: flex; gap: 6px; justify-content: center; }
			.asistencia-action { width: 28px; height: 28px; border: 0; border-radius: 5px; cursor: pointer; font-weight: 800; }
			.asistencia-action.edit { background: #e8f1fb; color: #174a7c; }
			.asistencia-action.delete { background: #fde8e8; color: #c83d45; }
			.asistencia-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
			.asistencia-toolbar p { margin: 0; color: #65748b; font-size: .8rem; }
			.asistencia-publish { padding: 10px 14px; border: 0; border-radius: 7px; background: #0d8f36; color: #fff; cursor: pointer; font-weight: 700; }
			.asistencia-publish:disabled { background: #8b98a8; cursor: not-allowed; }
			.asistencia-wrap { overflow-x: auto; border: 1px solid #cbd5e1; }
			.asistencia-table { min-width: 1400px; width: 100%; border-collapse: collapse; color: #12233f; font-size: .72rem; table-layout: auto; }
			.asistencia-table th, .asistencia-table td { border: 1px solid #9aa7b5; padding: 0; text-align: center; }
			.asistencia-table thead th { height: 28px; background: #f3f6f9; font-weight: 700; }
			.asistencia-table .number-cell { width: 34px; }
			.asistencia-table .name-cell { width: 250px; min-width: 250px; text-align: left; padding: 0 9px; }
			.asistencia-table .week-title { background: #e8f1fb; color: #174a7c; }
			.asistencia-table .day-cell { width: 29px; min-width: 29px; font-size: .68rem; }
			.asistencia-table tbody tr { height: 31px; }
			.asistencia-table tbody tr:nth-child(even) { background: #fbfcfd; }
			.asistencia-mark { display: grid; place-items: center; width: 100%; min-height: 30px; border: 0; background: transparent; color: #0d8f36; cursor: pointer; font-size: .9rem; font-weight: 800; }
			.asistencia-mark:hover:not(:disabled) { background: #eaf8ef; }
			.asistencia-mark.absent { color: #c83d45; }
			.asistencia-mark:disabled { cursor: default; }
			.asistencia-status { margin: 12px 0 0; color: #65748b; font-size: .78rem; }
			.asistencia-status.published { color: #0d8f36; font-weight: 700; }
			@media (max-width: 600px) { .asistencia-toolbar { align-items: flex-start; flex-direction: column; } }
		`;
		document.head.appendChild(style);
	};

	const cellKey = (student, week, day) => `${student}-${week}-${day}`;

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		document.querySelector('.topbar')?.remove();
		addStyles();
		const submittedAttendance = getSubmittedAttendance();
		const students = [...new Map(submittedAttendance.map((record) => [record.code, record])).values()];
		const rowCount = Math.max(studentCount, students.length);
		target.innerHTML = `
			<section class="panel asistencia-panel asistencia-submitted-panel" aria-labelledby="submittedAttendanceTitle">
				<div class="panel-header"><h2 id="submittedAttendanceTitle">Asistencias enviadas por estudiantes</h2></div>
				${submittedAttendance.length ? `<div class="asistencia-wrap"><table class="asistencia-submitted-table"><thead><tr><th>N°</th><th>Alumno</th><th>Ciclo o Curso</th><th>Carrera</th><th>Universidad</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${submittedAttendance.map((record, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(record.student)}</td><td>${escapeHtml(record.className)}</td><td>${escapeHtml(record.career)}</td><td>${escapeHtml(record.university)}</td><td>${escapeHtml(record.date)}</td><td><span class="asistencia-submitted-status">${escapeHtml(record.status)}</span></td><td><div class="asistencia-actions"><button class="asistencia-action edit" type="button" data-attendance-action="edit" data-attendance-index="${index}" title="Editar asistencia" aria-label="Editar asistencia">✎</button><button class="asistencia-action delete" type="button" data-attendance-action="delete" data-attendance-index="${index}" title="Eliminar asistencia" aria-label="Eliminar asistencia">X</button></div></td></tr>`).join('')}</tbody></table></div>` : '<p class="asistencia-status">Todavía no hay asistencias enviadas por estudiantes.</p>'}
			</section>
			<section class="panel asistencia-panel" id="asistenciaPanel" aria-labelledby="asistenciaTitle">
				<div class="panel-header"><h2 id="asistenciaTitle">Panel de asistencias</h2></div>
				<div class="asistencia-toolbar">
					<p>Marca ✓ para asistencia. Las celdas sin marcar se publicarán como X.</p>
					<button class="asistencia-publish" id="publicarAsistencia" type="button">Publicar asistencia oficial</button>
				</div>
				<div class="asistencia-wrap"><table class="asistencia-table"><thead><tr><th class="number-cell" rowspan="2">N°</th><th class="name-cell" rowspan="2">Nombres y Apellidos</th>${Array.from({ length: weekCount }, (_, index) => `<th class="week-title" colspan="6">SEMANA ${index + 1}</th>`).join('')}</tr><tr>${Array.from({ length: weekCount }, () => days.map((day) => `<th class="day-cell">${day}</th>`).join('')).join('')}</tr></thead><tbody>${Array.from({ length: rowCount }, (_, student) => { const record = students[student]; const studentName = record ? escapeHtml(record.student) : `Alumno ${student + 1}`; return `<tr><td>${student + 1}</td><td class="name-cell">${studentName}</td>${Array.from({ length: weekCount }, (_, week) => days.map((_, day) => { const key = cellKey(student, week, day); const marked = state.marks[key] === true; const value = marked ? '✓' : state.published ? 'X' : ''; return `<td><button class="asistencia-mark ${marked ? '' : 'absent'}" type="button" data-cell="${key}" ${state.published ? 'disabled' : ''}>${value}</button></td>`; }).join('')).join('')}</tr>`; }).join('')}</tbody></table></div>
				<p class="asistencia-status ${state.published ? 'published' : ''}" id="asistenciaStatus">${state.published ? 'Asistencia oficial publicada y bloqueada.' : 'Borrador: todavía puedes marcar las asistencias.'}</p>
			</section>`;

		target.querySelectorAll('[data-cell]').forEach((button) => button.addEventListener('click', () => {
			if (state.published) return;
			const key = button.dataset.cell;
			state.marks[key] = state.marks[key] !== true;
			saveState();
			render();
		}));
		target.querySelectorAll('[data-attendance-action]').forEach((button) => button.addEventListener('click', () => {
			const index = Number(button.dataset.attendanceIndex);
			const records = getSubmittedAttendance();
			const record = records[index];
			if (!record) return;
			if (button.dataset.attendanceAction === 'delete') {
				if (!window.confirm(`¿Eliminar la asistencia de ${record.student}?`)) return;
				records.splice(index, 1);
				localStorage.setItem('matecienciasAsistencias', JSON.stringify(records));
				render();
				return;
			}
			const student = window.prompt('Nombre completo del estudiante:', record.student);
			if (student === null || !student.trim()) return;
			const className = window.prompt('Ciclo o Curso:', record.className);
			if (className === null || !className.trim()) return;
			const date = window.prompt('Fecha de la clase (AAAA-MM-DD):', record.date);
			if (date === null || !date.trim()) return;
			const career = window.prompt('Carrera:', record.career || '');
			if (career === null || !career.trim()) return;
			const university = window.prompt('Universidad:', record.university || '');
			if (university === null || !university.trim()) return;
			const status = window.prompt('Estado (Presente, Tardanza, Falta o Justificada):', record.status);
			if (status === null || !status.trim()) return;
			records[index] = { ...record, student: student.trim(), className: className.trim(), date: date.trim(), career: career.trim(), university: university.trim(), status: status.trim() };
			localStorage.setItem('matecienciasAsistencias', JSON.stringify(records));
			render();
		}));
		document.getElementById('publicarAsistencia').addEventListener('click', () => {
			if (!window.confirm('¿Publicar la asistencia oficial y reiniciar la tabla?')) return;
			localStorage.setItem('docenteAsistenciaUltimaPublicacion', JSON.stringify({
				marks: { ...state.marks },
				students: submittedAttendance,
				publishedAt: new Date().toISOString()
			}));
			state.marks = {};
			state.published = false;
			saveState();
			render();
		});
	};

	window.DocenteModules.Asistencia = { name: 'Asistencia', render };
})();
