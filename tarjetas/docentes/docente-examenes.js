(() => {
	window.DocenteModules = window.DocenteModules || {};

	const courses = [
		['Aritmética', 'aritmetica'], ['Álgebra', 'algebra'], ['Geometría', 'geometria'], ['Trigonometría', 'trigonometria'],
		['Razonamiento Matemático', 'razonamiento-matematico'], ['Razonamiento Lógico', 'razonamiento-logico'], ['Aptitud Verbal', 'aptitud-verbal'],
		['Lengua y Literatura', 'lengua-literatura'], ['Historia del Perú', 'historia-del-peru'], ['Geografía', 'geografia'], ['Economía', 'economia'],
		['Física', 'fisica'], ['Química', 'quimica'], ['Biología', 'biologia'], ['Psicología', 'psicologia'], ['Cívica', 'civica'],
		['Filosofía', 'filosofia'], ['Historia Universal', 'historia-universal']
	];
	const examenesKey = 'matecienciasExamenesPublicados';
	const isAdminPanel = window.location.pathname.endsWith('tarjetas/administracion/admin-panel.html');
	const getPublishedCourses = () => {
		try {
			const published = JSON.parse(localStorage.getItem(examenesKey) || '[]');
			return Array.isArray(published) ? published : [];
		} catch (error) {
			return [];
		}
	};

	const addStyles = () => {
		if (document.getElementById('examenesDocenteStyles')) return;
		const style = document.createElement('style');
		style.id = 'examenesDocenteStyles';
		style.textContent = `
			.examenes-docente-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.examenes-course-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
			.examenes-course-card { padding: 18px; border: 1px solid #d6e1eb; border-radius: 10px; background: #fff; }
			.examenes-course-card h3 { margin: 0 0 14px; color: #12233f; font-size: 1rem; }
			.examenes-week-grid { display: grid; grid-template-columns: repeat(10, minmax(55px, 1fr)); gap: 6px; }
			.examenes-week-link { padding: 9px 4px; border-radius: 6px; background: #0d8f36; color: #fff; font-size: .72rem; font-weight: 700; text-align: center; text-decoration: none; }
			.examenes-week-link:hover { background: #0a6c27; }
			.examenes-publish-button { margin: 0 0 14px; padding: 8px 12px; border: 0; border-radius: 6px; background: #0d8f36; color: #fff; cursor: pointer; font: inherit; font-size: .78rem; font-weight: 700; }
			.examenes-unpublish-button { margin: 0 0 14px; padding: 8px 12px; border: 0; border-radius: 6px; background: #b4232f; color: #fff; cursor: pointer; font: inherit; font-size: .78rem; font-weight: 700; }
			@media (max-width: 800px) { .examenes-week-grid { grid-template-columns: repeat(5, minmax(55px, 1fr)); } .examenes-course-card { overflow-x: auto; } }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		const publishedCourses = getPublishedCourses();
		const visibleCourses = isAdminPanel ? courses : courses.filter(([, slug]) => publishedCourses.includes(slug));
		const courseMarkup = visibleCourses.map(([name, slug]) => `<article class="examenes-course-card"><h3>${name}</h3>${isAdminPanel ? (publishedCourses.includes(slug) ? `<button class="examenes-unpublish-button" type="button" data-unpublish-exam="${slug}">No publicar</button>` : `<button class="examenes-publish-button" type="button" data-publish-exam="${slug}">Publicar curso</button>`) : ''}<div class="examenes-week-grid">${Array.from({ length: 10 }, (_, index) => `<a class="examenes-week-link" href="tarjetas/aula-virtual/cuestionario.html?curso=${encodeURIComponent(name)}&slug=${slug}&semana=${index + 1}">Semana ${index + 1}</a>`).join('')}</div></article>`).join('');
		target.innerHTML = `<section class="panel examenes-docente-panel" aria-labelledby="examenesDocenteTitle"><div class="panel-header"><h2 id="examenesDocenteTitle">Exámenes</h2></div>${courseMarkup ? `<div class="examenes-course-grid">${courseMarkup}</div>` : '<p class="examenes-empty-message">No hay exámenes publicados.</p>'}</section>`;
	};

	if (isAdminPanel) {
		document.addEventListener('click', (event) => {
			const button = event.target.closest('[data-publish-exam], [data-unpublish-exam]');
			if (!button) return;
			const publishedCourses = getPublishedCourses();
			const slug = button.dataset.publishExam || button.dataset.unpublishExam;
			const updatedCourses = button.dataset.publishExam
				? [...new Set([...publishedCourses, slug])]
				: publishedCourses.filter((publishedSlug) => publishedSlug !== slug);
			localStorage.setItem(examenesKey, JSON.stringify(updatedCourses));
			if (button.dataset.publishExam) window.NotificacionesService?.add({ title: 'Nuevo examen publicado', detail: `Curso ${slug}`, author: 'Administrador' });
			render();
		});
	}

	window.addEventListener('storage', (event) => { if (event.key === examenesKey) render(); });

	window.DocenteModules['Exámenes'] = { name: 'Exámenes', render };
})();
