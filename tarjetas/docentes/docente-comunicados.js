(() => {
	window.DocenteModules = window.DocenteModules || {};
	const announcementKey = 'matecienciasComunicadoImagen';

	const addStyles = () => {
		if (document.getElementById('comunicadosStyles')) return;
		const style = document.createElement('style');
		style.id = 'comunicadosStyles';
		style.textContent = `
			.comunicado-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.comunicado-form { display: grid; gap: 14px; }
			.comunicado-form label { display: grid; gap: 7px; color: #12233f; font-size: .85rem; font-weight: 700; }
			.comunicado-form input[type=file] { padding: 10px; border: 1px solid #cbd5e1; border-radius: 7px; background: #fff; }
			.comunicado-preview { display: none; max-width: 100%; max-height: 360px; object-fit: contain; border: 1px solid #d6e1eb; border-radius: 8px; }
			.comunicado-preview.visible { display: block; }
			.comunicado-publish { width: fit-content; padding: 11px 16px; border: 0; border-radius: 7px; background: #0d8f36; color: #fff; cursor: pointer; font-weight: 700; }
			.comunicado-message { margin: 0; color: #0d8f36; font-size: .82rem; font-weight: 700; }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		target.innerHTML = `<section class="panel comunicado-panel"><div class="panel-header"><h2>Comunicado con imagen</h2></div><form class="comunicado-form" id="comunicadoForm"><label>Seleccionar imagen<input id="comunicadoFile" type="file" accept="image/png,image/jpeg,image/webp" required /></label><img class="comunicado-preview" id="comunicadoPreview" alt="Vista previa del comunicado" /><button class="comunicado-publish" type="submit">Publicar comunicado</button><p class="comunicado-message" id="comunicadoMessage" role="status"></p></form></section>`;
		const fileInput = document.getElementById('comunicadoFile');
		const preview = document.getElementById('comunicadoPreview');
		fileInput.addEventListener('change', () => {
			const file = fileInput.files[0];
			if (!file) return;
			if (file.size > 2500000) { fileInput.value = ''; preview.classList.remove('visible'); document.getElementById('comunicadoMessage').textContent = 'La imagen no debe superar 2.5 MB.'; return; }
			preview.src = URL.createObjectURL(file);
			preview.classList.add('visible');
		});
		document.getElementById('comunicadoForm').addEventListener('submit', (event) => {
			event.preventDefault();
			const file = fileInput.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				localStorage.setItem(announcementKey, JSON.stringify({ image: reader.result, name: file.name, publishedAt: new Date().toISOString() }));
				window.NotificacionesService?.add({ title: 'Nuevo comunicado publicado', detail: file.name, author: sessionStorage.getItem('docenteUser') || 'Docente' });
				document.getElementById('comunicadoMessage').textContent = 'Comunicado publicado correctamente.';
			};
			reader.readAsDataURL(file);
		});
	};

	window.DocenteModules.Comunicados = { name: 'Comunicados', render };
})();
