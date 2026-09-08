(function () {
  const USER_STORAGE_KEYS = ['dashboardUser', 'accountName', 'adminUser', 'bibliotecaName', 'bibliotecaEmail'];

  const APPROVED_ACCOUNTS = [
    { name: 'MateCiencias Adm', password: '4829176345' },
    { name: 'Joel Chiroque Chiroque', password: '7314829065' },
  ];

  function safeTrim(value) {
    return String(value || '').trim();
  }

  function getApprovedAccounts() {
    if (window.UsuariosAPI?.enabled) {
      return window.usuariosRemotos || (UsuariosAPI.current()?.user ? [UsuariosAPI.current().user] : []);
    }
    return APPROVED_ACCOUNTS;
  }

  function approvedUserIsAllowed(usuario) {
    return !!safeTrim(usuario) && userIsInList(usuario, APPROVED_ACCOUNTS.map((account) => account.name));
  }

  function getAdminSessionUser() {
    return isAdminSessionValid() ? safeTrim(sessionStorage.getItem('adminUsuario')) : '';
  }

  function validateCredentials(fullName, password) {
    const normalizedName = safeTrim(fullName).toUpperCase();
    const normalizedPassword = safeTrim(password);
    const account = APPROVED_ACCOUNTS.find((entry) => entry.name.toUpperCase() === normalizedName);
    return !!account && account.password === normalizedPassword;
  }

  function getStoredUserName() {
    for (const key of USER_STORAGE_KEYS) {
      const value = safeTrim(sessionStorage.getItem(key));
      if (value) return value;
    }
    return 'Estudiante';
  }

  function normalizeUserName(value) {
    return safeTrim(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  function userIsInList(user, allowedUsers) {
    const targetUser = normalizeUserName(user);
    const allowed = Array.isArray(allowedUsers) ? allowedUsers : [];
    return allowed.some((entry) => normalizeUserName(entry) === targetUser);
  }

  function canManageAllCards() {
    return userIsInList(getStoredUserName(), ['MateCiencias Adm']);
  }

  function getInitials(fullName) {
    const name = safeTrim(fullName || 'Estudiante');
    if (!name) return 'E';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function setUserProfile({ nameElement, avatarElement, fallbackName = 'Perfil' }) {
    const name = getStoredUserName();
    if (nameElement) {
      nameElement.textContent = name || fallbackName;
    }

    if (avatarElement) {
      avatarElement.textContent = getInitials(name);
    }
  }

  function setAdminSession(usuario) {
    sessionStorage.setItem('adminAutenticado', 'true');
    sessionStorage.setItem('adminUsuario', usuario);
    sessionStorage.setItem('adminTimestamp', String(Date.now()));
  }

  function isAdminSessionValid() {
    const autenticado = sessionStorage.getItem('adminAutenticado') === 'true';
    const timestamp = Number(sessionStorage.getItem('adminTimestamp') || 0);
    const ahora = Date.now();
    const tiempoExpiracion = 30 * 60 * 1000;
    if (!autenticado || (ahora - timestamp) > tiempoExpiracion) {
      sessionStorage.removeItem('adminAutenticado');
      sessionStorage.removeItem('adminUsuario');
      sessionStorage.removeItem('adminTimestamp');
      return false;
    }
    return true;
  }

  function clearAdminSession() {
    sessionStorage.removeItem('adminAutenticado');
    sessionStorage.removeItem('adminUsuario');
    sessionStorage.removeItem('adminTimestamp');
  }

  function adminUserIsAllowed(usuario) {
    return !!safeTrim(usuario) && userIsInList(usuario, window.administradoresAutorizados);
  }

  function getAuthorizedPeople() {
    try {
      return JSON.parse(localStorage.getItem('personasAutorizadas') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveAuthorizedPeople(personas) {
    localStorage.setItem('personasAutorizadas', JSON.stringify(personas));
  }

  function addAuthorizedPerson(persona) {
    const personas = getAuthorizedPeople();
    personas.push({
      id: persona.id || Date.now().toString(),
      nombre: persona.nombre,
      email: persona.email,
      rol: persona.rol || 'administrador',
      fecha: persona.fecha || new Date().toLocaleString()
    });
    saveAuthorizedPeople(personas);
    return personas;
  }

  function removeAuthorizedPerson(id) {
    const personas = getAuthorizedPeople().filter((p) => p.id !== id);
    saveAuthorizedPeople(personas);
    return personas;
  }

  window.UsuarioService = {
    approvedUserIsAllowed,
    getAdminSessionUser,
    getApprovedAccounts,
    validateCredentials,
    getStoredUserName,
    normalizeUserName,
    userIsInList,
    canManageAllCards,
    getInitials,
    setUserProfile,
    setAdminSession,
    isAdminSessionValid,
    clearAdminSession,
    adminUserIsAllowed,
    getAuthorizedPeople,
    saveAuthorizedPeople,
    addAuthorizedPerson,
    removeAuthorizedPerson
  };
})();
