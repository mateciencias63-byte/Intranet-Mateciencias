(() => {
  window.DocenteModules = window.DocenteModules || {};
  window.DocenteModules.Usuarios = { async render() {
    const target = document.getElementById('adminContent');
    const root = document.createElement('section');
    root.className = 'admin-panel users-manager';
    root.innerHTML = `<style>
      .users-manager form { display:flex;flex-wrap:wrap;align-items:end;gap:14px;margin:20px 0 }
      .users-manager label { display:grid;gap:8px;flex:1;min-width:200px }
      .users-manager input { padding:12px;border:1px solid #cbd5e1;border-radius:7px;font:inherit }
      .users-manager button { padding:10px 14px;border:0;border-radius:7px;background:#076bb2;color:white;cursor:pointer }
      .users-manager button:disabled { opacity:.5;cursor:wait }
      .users-manager .users-danger { background:#b91c1c }
      .users-manager table { width:100%;border-collapse:collapse;text-align:left }
      .users-manager td,.users-manager th { padding:12px;border-bottom:1px solid #e2e8f0 }
      .users-manager th { background:#eaf8ef }
      .users-manager td:last-child { display:flex;gap:8px;flex-wrap:wrap }
      .users-manager [role=status] { color:#164969 }
      .users-manager .users-code { background:#eef8ff;padding:18px;border-radius:8px;margin:16px 0 }
      .users-manager pre { white-space:pre-wrap;font:inherit;user-select:all }
    </style><h2>Usuarios del intranet</h2><p>Crea una cuenta y comparte su nombre y código con la persona. Puedes editar el nombre, generar un código nuevo o eliminar su acceso.</p><p role="status" aria-live="polite"></p><div class="users-body"></div>`;
    target.replaceChildren(root);
    const body = root.querySelector('.users-body'), message = root.querySelector('[role=status]');
    const api = window.UsuariosAPI;
    if (!api?.enabled) {
      message.textContent = 'La gestión de usuarios aún no está activada. Falta conectar el servicio compartido para que las cuentas funcionen desde otros dispositivos.';
      return;
    }
    try {
      const user = await api.verify();
      if (user.role !== 'admin') throw Error('Solo el administrador puede gestionar usuarios.');
    } catch (error) {
      message.textContent = error.message + ' Ingresa con la cuenta administradora del servicio de usuarios.';
      const login = document.createElement('a');login.href = 'tarjetas/administracion/admin-login.html';login.textContent = 'Iniciar sesión administrativa';body.append(login);
      return;
    }
    let editing = null, busy = false;
    body.innerHTML = `<form><label>Nombre del usuario<input name="name" required maxlength="100" autocomplete="off" placeholder="Nombre y apellidos o nombre de usuario"></label><button type="submit">Crear usuario y código</button><button type="button" data-cancel hidden>Cancelar edición</button></form><section class="users-code" hidden><strong>Datos para enviar al usuario</strong><pre></pre><button type="button" data-copy>Copiar usuario y código</button><button type="button" data-hide>Cerrar</button><p>Guarda o copia este código ahora. Para obtener otro después, genera uno nuevo.</p></section><label>Buscar usuario<input type="search" data-search placeholder="Buscar por nombre"></label><div style="overflow:auto"><table><thead><tr><th>N.º</th><th>Usuario</th><th>Tipo</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>`;
    const form = body.querySelector('form'), field = form.elements.name, submit = form.querySelector('[type=submit]');
    const cancel = form.querySelector('[data-cancel]'), codeBox = body.querySelector('.users-code');
    let users = [];
    const reset = () => { editing = null;form.reset();submit.textContent = 'Crear usuario y código';cancel.hidden = true; };
    cancel.onclick = reset;
    body.querySelector('[data-hide]').onclick = () => { codeBox.hidden = true;codeBox.querySelector('pre').textContent = ''; };
    body.querySelector('[data-copy]').onclick = async () => {
      try { await navigator.clipboard.writeText(codeBox.querySelector('pre').textContent);message.textContent = 'Datos copiados. Ya puedes enviarlos al usuario.'; }
      catch { message.textContent = 'Selecciona y copia los datos que aparecen en el recuadro.'; }
    };
    const showCode = result => {
      codeBox.hidden = !result.code;
      codeBox.querySelector('pre').textContent = result.code ? `Usuario: ${result.user.name}\nCódigo: ${result.code}\nIntranet: ${new URL('index.html', document.baseURI).href}` : '';
    };
    const action = async work => {
      if (busy) return;busy = true;root.querySelectorAll('button').forEach(button => button.disabled = true);
      message.textContent = 'Procesando…';
      try { await work(); } catch (error) { message.textContent = error.message; }
      finally { busy = false;root.querySelectorAll('button').forEach(button => button.disabled = false); }
    };
    function draw() {
      const query = body.querySelector('[data-search]').value.toLocaleLowerCase();
      const table = body.querySelector('tbody');table.replaceChildren();
      users.filter(user => user.name.toLocaleLowerCase().includes(query)).forEach((user, index) => {
        const row = document.createElement('tr');
        [index + 1, user.name, user.role === 'admin' ? 'Administrador' : 'Usuario'].forEach(value => { const td = document.createElement('td');td.textContent = value;row.append(td); });
        const actions = document.createElement('td');row.append(actions);
        if (user.role === 'admin') actions.textContent = 'Cuenta protegida';
        else {
          const button = (label, fn, danger = false) => { const b = document.createElement('button');b.type = 'button';b.textContent = label;b.onclick = fn;if (danger) b.className = 'users-danger';actions.append(b); };
          button('✎ Editar', () => { editing = user;field.value = user.name;submit.textContent = 'Guardar cambios';cancel.hidden = false;field.focus();form.scrollIntoView({ block: 'center' }); });
          button('Generar código nuevo', () => {
            if (!confirm(`¿Generar otro código para ${user.name}? El anterior dejará de funcionar.`)) return;
            action(async () => { const result = await api.request('/users/' + user.id, 'PATCH', { name: user.name, regenerate: true });showCode(result);message.textContent = 'Código nuevo generado. El anterior fue invalidado.'; });
          });
          button('Eliminar', () => {
            if (!confirm(`¿Eliminar el acceso de ${user.name}? Esta persona ya no podrá iniciar sesión.`)) return;
            action(async () => { await api.request('/users/' + user.id, 'DELETE');reset();showCode({});await refresh();message.textContent = 'Usuario eliminado y sesiones cerradas.'; });
          }, true);
        }
        table.append(row);
      });
    }
    async function refresh() {
      const result = await api.request('/users');users = result.users;
      window.usuariosRemotos = users;draw();
    }
    body.querySelector('[data-search]').oninput = draw;
    form.onsubmit = event => { event.preventDefault();action(async () => {
      const result = await api.request(editing ? '/users/' + editing.id : '/users', editing ? 'PATCH' : 'POST', { name: field.value.trim() });
      showCode(result);reset();
      message.textContent = result.code ? 'Usuario creado. Copia sus datos para enviarlos.' : 'Nombre actualizado.';
      // Keep one-time credentials visible even if refreshing the list fails.
      await refresh();
    }); };
    await action(async () => { await refresh();message.textContent = ''; });
  } };
})();
