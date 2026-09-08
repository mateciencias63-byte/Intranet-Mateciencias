(() => {
	window.DocenteModules = window.DocenteModules || {};
	const chatKey = 'matecienciasChat';
	const isAdminPanel = Boolean(document.querySelector('.admin-shell'));

	const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
	const getMessages = () => {
		try {
			const messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
			return Array.isArray(messages) ? messages : [];
		} catch (error) {
			return [];
		}
	};

	const addStyles = () => {
		if (document.getElementById('docenteChatStyles')) return;
		const style = document.createElement('style');
		style.id = 'docenteChatStyles';
		style.textContent = `
			.docente-chat-panel { grid-column: 1 / -1; width: 100%; margin-top: 18px; }
			.docente-chat-messages { display: grid; gap: 10px; max-height: 480px; overflow-y: auto; padding: 4px; }
			.docente-chat-message { max-width: 78%; padding: 11px 14px; border-radius: 10px; background: #e8eef1; color: #12233f; }
			.docente-chat-message { position: relative; padding-right: 42px; }
			.docente-chat-message.student { justify-self: start; }
			.docente-chat-message.teacher { justify-self: end; background: #dff3e5; }
			.docente-chat-message small { display: block; margin-bottom: 4px; color: #65748b; font-size: .7rem; font-weight: 700; }
			.docente-chat-form { display: flex; gap: 10px; margin-top: 16px; }
			.docente-chat-form input { flex: 1; padding: 11px; border: 1px solid #cbdbe2; border-radius: 7px; font: inherit; }
			.docente-chat-send { padding: 11px 17px; border: 0; border-radius: 7px; background: #168044; color: #fff; cursor: pointer; font-weight: 700; }
			.docente-chat-delete { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 24px; height: 24px; border: 0; border-radius: 5px; background: #fde8e8; color: #b4232f; cursor: pointer; font-weight: 800; }
			.docente-chat-delete:hover { background: #f8caca; }
		`;
		document.head.appendChild(style);
	};

	const render = () => {
		const target = document.querySelector('.content-grid');
		if (!target) return;
		addStyles();
		const messages = getMessages();
		target.innerHTML = `<section class="panel docente-chat-panel"><div class="panel-header"><h2>Chat con estudiantes</h2></div><div class="docente-chat-messages" id="docenteChatMessages">${messages.length ? messages.map((message, index) => `<div class="docente-chat-message ${message.sender === 'student' ? 'student' : 'teacher'}"><small>${message.sender === 'student' ? 'Estudiante' : 'Docente'}</small>${escapeHtml(message.text)}${isAdminPanel ? `<button class="docente-chat-delete" type="button" data-message-index="${index}" title="Eliminar mensaje" aria-label="Eliminar mensaje">X</button>` : ''}</div>`).join('') : '<p>Todavía no hay mensajes.</p>'}</div><form class="docente-chat-form" id="docenteChatForm"><input id="docenteChatInput" type="text" placeholder="Escribe una respuesta" required /><button class="docente-chat-send" type="submit">Enviar respuesta</button></form></section>`;
		const messageBox = document.getElementById('docenteChatMessages');
		messageBox.scrollTop = messageBox.scrollHeight;
		document.querySelectorAll('.docente-chat-delete').forEach((button) => button.addEventListener('click', () => {
			if (!isAdminPanel) return;
			if (!window.confirm('¿Eliminar este mensaje?')) return;
			const updatedMessages = getMessages();
			updatedMessages.splice(Number(button.dataset.messageIndex), 1);
			localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
			render();
		}));
		document.getElementById('docenteChatForm').addEventListener('submit', (event) => {
			event.preventDefault();
			const input = document.getElementById('docenteChatInput');
			const text = input.value.trim();
			if (!text) return;
			const updatedMessages = getMessages();
			updatedMessages.push({ sender: 'teacher', text, date: new Date().toISOString() });
			localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
			render();
		});
	};

	window.DocenteModules.Chat = { name: 'Chat', render };
})();
