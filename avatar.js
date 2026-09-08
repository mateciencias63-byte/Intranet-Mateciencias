(() => {
  const men = new Set('JOEL JOSE JUAN CARLOS LUIS DIEGO JAVIER TOMAS MATEO SAMUEL BRUNO CHRISTIAN CRISTIAN FERNANDO GABRIEL OSCAR RICARDO KEVIN UZIEL PEDRO PABLO MIGUEL ANGEL JESUS MANUEL ANTONIO DAVID DANIEL JORGE STEVEN ALEXANDER ANDRES EDUARDO FRANCISCO ALBERTO RENZO SEBASTIAN'.split(' '));
  const women = new Set('MARIA ANA SOFIA CAMILA ELENA VALERIA ISABELLA ISABEL DANIELA JULIANA MARIANA NATALIA RENATA PAULA CARLA LUCIA ROSA CARMEN LUISA ANDREA GABRIELA FERNANDA ALEJANDRA PATRICIA ELIZABETH DIANA ANGELA MILAGROS VALENTINA XIMENA CLAUDIA BEATRIZ TERESA'.split(' '));
  window.createNameAvatar = fullName => {
    const name = String(fullName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().split(/\s+/)[0];
    const kind = men.has(name) ? 'hombre' : women.has(name) ? 'mujer' : 'neutro';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', kind === 'neutro' ? 'Avatar de usuario' : `Avatar de ${kind}`);
    svg.dataset.avatar = kind;
    const portrait = kind === 'neutro'
      ? '<circle cx="60" cy="43" r="20" fill="#fff"/><path d="M24 111v-12a36 36 0 0 1 72 0v12" fill="#fff"/>'
      : `${kind === 'mujer' ? '<path d="M31 53c0-27 12-35 29-35s29 8 29 35v39H31z" fill="#343a40"/>' : ''}<path d="M20 120v-16c0-20 18-29 40-29s40 9 40 29v16" fill="${kind === 'mujer' ? '#eee6fc' : '#e5f1ff'}"/><path d="M50 69h20v16c-6 8-14 8-20 0z" fill="#dfa67e"/><ellipse cx="60" cy="49" rx="22" ry="28" fill="#f2c29c"/><path d="${kind === 'mujer' ? 'M37 48c-3-27 12-31 23-31 20 0 28 16 24 34-12-2-20-10-25-19-4 9-12 14-22 16' : 'M37 46c-5-23 9-30 23-30 16 0 27 11 24 30l-8-13c-9 5-20 5-31 1z'}" fill="#343a40"/><circle cx="52" cy="51" r="2" fill="#343a40"/><circle cx="69" cy="51" r="2" fill="#343a40"/><path d="M54 63q6 5 12 0" fill="none" stroke="#a65d4e" stroke-width="2" stroke-linecap="round"/>`;
    svg.innerHTML = `<circle cx="60" cy="60" r="60" fill="#0d8f36"/>${portrait}`;
    return svg;
  };
})();
