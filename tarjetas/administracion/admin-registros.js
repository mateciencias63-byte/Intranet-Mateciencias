(() => {
  window.DocenteModules = window.DocenteModules || {};
  for (const [name, path, title] of [
    ['Admision', 'admision/admision.html', 'Admisión'],
    ['Matricula', 'matricula/matricula.html', 'Matrícula']
  ]) {
    window.DocenteModules[name] = { render() {
      if (!UsuarioService.isAdminSessionValid()) {
        window.location.replace('tarjetas/administracion/admin-login.html');
        return;
      }
      const frame = document.createElement('iframe');
      frame.id = 'adminRegistroFrame';
      frame.title = title;
      frame.style.cssText = 'display:block;width:100%;min-height:520px;border:0;background:white';
      frame.src = `tarjetas/${path}?panel=admin&v=20260908-1`;
      document.getElementById('adminContent').replaceChildren(frame);
    } };
  }
})();
