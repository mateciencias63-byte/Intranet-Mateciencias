(() => {
  const userKey = 'calendarioUsuario';
  const timeKey = 'calendarioTimestamp';
  function isValid() {
    const age = Date.now() - Number(sessionStorage.getItem(timeKey));
    return sessionStorage.getItem(timeKey) !== null && age >= 0 && age < 30 * 60 * 1000
      && UsuarioService.adminUserIsAllowed(sessionStorage.getItem(userKey));
  }
  function login(username) {
    if (!UsuarioService.adminUserIsAllowed(username)) return false;
    sessionStorage.setItem(userKey, username.trim());
    sessionStorage.setItem(timeKey, String(Date.now()));
    return true;
  }
  window.CalendarioAcceso = { isValid, login };
})();
