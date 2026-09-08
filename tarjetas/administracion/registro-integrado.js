// Reuse the administrator session only inside the administrator's own frame.
window.registroAdminIntegrado = false;
try {
  window.registroAdminIntegrado = window.parent !== window &&
    new URLSearchParams(location.search).get('panel') === 'admin' &&
    window.parent.location.pathname.endsWith('/tarjetas/administracion/admin-panel.html') &&
    window.parent.document.getElementById('adminRegistroFrame') === window.frameElement &&
    window.parent.UsuarioService?.isAdminSessionValid() === true;
} catch (_) { /* A different origin cannot provide administrator access. */ }
if (window.registroAdminIntegrado) {
  const style = document.createElement('style');
  style.textContent = `
    body { background: white; margin: 0; }
    .admision-page, .matricula-page { min-height: 0; padding: 0; }
    .admision-card, .matricula-card { box-sizing: border-box; box-shadow: none; }
    .admision-card > h1, .matricula-card > h1,
    .admision-actions, .matricula-back { display: none; }
  `;
  document.head.append(style);
  const resize = () => {
    if (window.frameElement) window.frameElement.style.height = `${Math.ceil(document.body.getBoundingClientRect().height) + 24}px`;
  };
  new ResizeObserver(resize).observe(document.body);
  resize();
}
