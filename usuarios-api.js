(() => {
  const base = String(window.MATECIENCIAS_USUARIOS_API || '').replace(/\/$/, '');
  const key = 'matecienciasSesionRemota';
  const current = () => { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } };
  async function request(path, method = 'GET', data) {
    if (!base) throw Error('Falta conectar el servicio compartido de usuarios.');
    let response;
    try {
      response = await fetch(base + '/api' + path, {
        method, cache: 'no-store', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', ...(current()?.token ? { Authorization: 'Bearer ' + current().token } : {}) },
        ...(data === undefined ? {} : { body: JSON.stringify(data) })
      });
    } catch { throw Error('No se pudo conectar. Comprueba tu conexión e intenta nuevamente.'); }
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path !== '/login') sessionStorage.removeItem(key);
      throw Error(result.error || 'No se pudo completar la operación.');
    }
    return result;
  }
  window.UsuariosAPI = {
    enabled: Boolean(base), current, request,
    async login(name, code) {
      const result = await request('/login', 'POST', { name, code });
      sessionStorage.setItem(key, JSON.stringify(result));
      return result.user;
    },
    async verify() {
      const { user } = await request('/session');
      sessionStorage.setItem(key, JSON.stringify({ ...current(), user }));
      return user;
    },
    async logout() {
      try { if (current()) await request('/logout', 'POST'); }
      finally { sessionStorage.removeItem(key); }
    }
  };
  if (base) {
    let checking = false;
    const checkSession = async () => {
      if (checking || !current()) return;
      checking = true;
      try { await window.UsuariosAPI.verify(); }
      catch (_) {
        // A network failure keeps the session; an explicit 401 clears it.
        if (!current()) {
          sessionStorage.removeItem('dashboardAuthenticated');
          sessionStorage.removeItem('adminAutenticado');
          window.location.replace(new URL('index.html', document.baseURI).href);
        }
      } finally { checking = false; }
    };
    window.addEventListener('focus', checkSession);
    setInterval(checkSession, 60000);
  }
})();
