(() => {
	window.DocenteModules = window.DocenteModules || {};

	const classes = [];
	const classUrl = 'https://meet.google.com/jso-wsie-ndw';
	const classLinksKey = 'matecienciasClasesVirtuales';
	const isAdminPanel = Boolean(document.querySelector('.admin-shell'));
	const readPublishedClasses = () => {
		try {
			const stored = JSON.parse(localStorage.getItem(classLinksKey) || 'null');
			return Array.isArray(stored) ? stored : classes.map((name) => ({ name, url: classUrl }));
		} catch (error) {
			return classes.map((name) => ({ name, url: classUrl }));
		}
	};
	const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

	const addStyles = () => {
		if (document.getElementById('clasesDocenteStyles')) return;
		const style = document.createElement('style');
		style.id = 'clasesDocenteStyles';
		style.textContent = `
			.clases-docente-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.clases-docente-list { display: grid; gap: 10px; }
			.clase-docente-link { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px; border: 1px solid #d6e1eb; border-radius: 8px; background: #f8fbfc; color: #12233f; text-decoration: none; }
			.clase-docente-link:hover { border-color: #0d8f36; background: #eaf8ef; }
			.clase-docente-link > a { flex:1; min-width:0; color:inherit; text-decoration:none; }
			.clase-docente-link strong { display: block; font-size: .87rem; }
			.clase-docente-link small { display: block; margin-top: 4px; color: #65748b; }
			.clase-docente-badge { padding: 5px 9px; border-radius: 999px; background: #eaf8ef; color: #08652b; font-size: .73rem; font-weight: 700; white-space: nowrap; }
			.clase-docente-actions { display:flex; align-items:center; gap:9px; }
			.clase-docente-delete { display:grid; place-items:center; width:28px; height:28px; padding:0; border:0; border-radius:50%; background:#fee2e2; color:#b91c1c; cursor:pointer; font-size:1.1rem; font-weight:800; line-height:1; }
			.clase-docente-delete:hover { background:#dc2626; color:#fff; }
			.clases-docente-form { display: grid; grid-template-columns: 1fr 1.4fr auto; gap: 10px; margin-bottom: 16px; }
			.clases-docente-form input { min-width: 0; padding: 10px 11px; border: 1px solid #cbdbe2; border-radius: 7px; font: inherit; }
			.clases-docente-form button { padding: 10px 14px; border: 0; border-radius: 7px; background: #168044; color: #fff; cursor: pointer; font: inherit; font-weight: 700; }
			@media (max-width: 700px) { .clase-docente-link { display: block; } .clase-docente-badge { display: inline-block; margin-top: 9px; } }
			@media (max-width: 700px) { .clases-docente-form { grid-template-columns: 1fr; } }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		const publishedClasses = readPublishedClasses();
		const formMarkup = isAdminPanel ? `<div class="panel-header"><h2 id="clasesDocenteTitle">Publicar clases virtuales</h2></div><form class="clases-docente-form" id="clasesDocenteForm"><input id="claseNombre" placeholder="Nombre de la clase" required /><input id="claseUrl" type="url" placeholder="Enlace de la clase" required /><button type="submit">Publicar enlace</button></form>` : '';
		const listMarkup = publishedClasses.map((item, index) => `<div class="clase-docente-link"><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer"><div><strong>${escapeHtml(item.name)}</strong><small>Clase publicada. Puedes ingresar para verificarla.</small></div></a><div class="clase-docente-actions"><a class="clase-docente-badge" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Ingresar</a>${isAdminPanel ? `<button class="clase-docente-delete" type="button" data-delete-class="${index}" aria-label="Eliminar ${escapeHtml(item.name)}" title="Eliminar clase">×</button>` : ''}</div></div>`).join('') || '<small>No hay clases virtuales publicadas.</small>';
		target.innerHTML = `<section class="panel clases-docente-panel">${formMarkup}<div class="clases-docente-list">${listMarkup}</div></section>`;
		if (!isAdminPanel) return;
		document.getElementById('clasesDocenteForm')?.addEventListener('submit', (event) => {
			event.preventDefault();
			const published = readPublishedClasses();
			published.push({ name: document.getElementById('claseNombre').value.trim(), url: document.getElementById('claseUrl').value.trim() });
			localStorage.setItem(classLinksKey, JSON.stringify(published));
			window.NotificacionesService?.add({ title: 'Nueva clase virtual publicada', detail: published[published.length - 1].name, author: 'Administrador' });
			render();
		});
		target.querySelectorAll('[data-delete-class]').forEach((button) => button.addEventListener('click', () => {
			const published = readPublishedClasses();
			published.splice(Number(button.dataset.deleteClass), 1);
			localStorage.setItem(classLinksKey, JSON.stringify(published));
			render();
		}));
	};

	window.DocenteModules.Clases = { name: 'Clases', render };
})();
