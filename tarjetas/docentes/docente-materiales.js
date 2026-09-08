(() => {
	window.DocenteModules = window.DocenteModules || {};
	const materialKey = 'matecienciasMateriales';
	const courses = ['Aritmética', 'Álgebra', 'Geometría', 'Trigonometría', 'Razonamiento Matemático', 'Razonamiento Lógico', 'Aptitud Verbal', 'Lengua y Literatura', 'Historia del Perú', 'Geografía', 'Economía', 'Física', 'Química', 'Biología', 'Psicología', 'Cívica', 'Filosofía', 'Historia Universal'];
	const readMaterials = () => { try { return JSON.parse(localStorage.getItem(materialKey) || '[]'); } catch (error) { return []; } };
	const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

	const addStyles = () => {
		if (document.getElementById('materialesDocenteStyles')) return;
		const style = document.createElement('style');
		style.id = 'materialesDocenteStyles';
		style.textContent = `
			.materiales-docente-panel { grid-column:1/-1; width:100%; margin-top:18px; }
			.materiales-form { display:grid; gap:14px; }
			.materiales-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
			.materiales-field { display:grid; gap:7px; color:#12233f; font-size:.84rem; font-weight:700; }
			.materiales-field input, .materiales-field select, .materiales-field textarea { width:100%; padding:10px 11px; border:1px solid #cbd5e1; border-radius:7px; background:#fff; color:#12233f; font:inherit; box-sizing:border-box; }
			.materiales-field textarea { min-height:90px; resize:vertical; }
			.materiales-field.full { grid-column:1/-1; }
			.materiales-publish { width:fit-content; padding:11px 16px; border:0; border-radius:7px; background:#0d8f36; color:#fff; cursor:pointer; font-weight:700; }
			.materiales-message { margin:0; color:#0d8f36; font-size:.82rem; font-weight:700; }
			.materiales-list { display:grid; gap:11px; margin-top:22px; }
			.material-item { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:14px; border:1px solid #d6e1eb; border-radius:8px; background:#f8fbfc; }
			.material-item strong { color:#12233f; }
			.material-item small { display:block; margin-top:5px; color:#65748b; }
			.material-download { padding:7px 10px; border-radius:6px; background:#eaf8ef; color:#08652b; font-size:.75rem; font-weight:700; text-decoration:none; white-space:nowrap; }
			@media (max-width:700px) { .materiales-form-grid { grid-template-columns:1fr; } .materiales-field.full { grid-column:auto; } .material-item { display:block; } .material-download { display:inline-block; margin-top:10px; } }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		target.innerHTML = `<section class="panel materiales-docente-panel" aria-labelledby="materialesTitle"><div class="panel-header"><h2 id="materialesTitle">Publicar material</h2></div><form class="materiales-form" id="materialForm"><div class="materiales-form-grid"><label class="materiales-field">Título del material<input id="materialTitle" maxlength="120" required placeholder="Ej. Guía de ejercicios" /></label><label class="materiales-field">Curso<select id="materialCourse" required><option value="">Selecciona un curso</option>${courses.map((course) => `<option>${course}</option>`).join('')}</select></label><label class="materiales-field full">Descripción<textarea id="materialDescription" required placeholder="Indica qué encontrará el alumno en este material."></textarea></label><label class="materiales-field full">Seleccionar archivo<input id="materialFile" type="file" required /></label></div><button class="materiales-publish" type="submit">Publicar material</button><p class="materiales-message" id="materialMessage" role="status"></p></form><div class="materiales-list" id="materialesList"></div></section>`;
		const renderList = () => {
			const materials = readMaterials();
			document.getElementById('materialesList').innerHTML = materials.length ? materials.map((material) => `<article class="material-item"><div><strong>${escapeHtml(material.title)}</strong><small>${escapeHtml(material.course)} · ${escapeHtml(material.description)}</small></div><a class="material-download" href="${material.file.data}" download="${escapeHtml(material.file.name)}">Descargar</a></article>`).join('') : '<p class="materiales-message">Todavía no has publicado materiales.</p>';
		};
		document.getElementById('materialForm').addEventListener('submit', (event) => {
			event.preventDefault();
			const file = document.getElementById('materialFile').files[0];
			const message = document.getElementById('materialMessage');
			if (!file) return;
			if (file.size > 4000000) { message.textContent = 'El archivo no debe superar 4 MB.'; return; }
			const reader = new FileReader();
			reader.onload = () => {
				const materials = readMaterials();
				materials.unshift({ id: `material-${Date.now()}`, title: document.getElementById('materialTitle').value.trim(), course: document.getElementById('materialCourse').value, description: document.getElementById('materialDescription').value.trim(), file: { name: file.name, data: reader.result }, teacher: sessionStorage.getItem('docenteUser') || 'Docente', publishedAt: new Date().toISOString() });
				localStorage.setItem(materialKey, JSON.stringify(materials));
				window.NotificacionesService?.add({ title: 'Nuevo material publicado', detail: materials[0].title, author: materials[0].teacher });
				document.getElementById('materialForm').reset();
				message.textContent = 'Material publicado correctamente.';
				renderList();
			};
			reader.readAsDataURL(file);
		});
		renderList();
		window.addEventListener('storage', (event) => { if (event.key === materialKey) renderList(); });
	};

	window.DocenteModules.Materiales = { name: 'Materiales', render };
})();
