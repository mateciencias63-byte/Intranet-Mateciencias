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
    const portrait = kind === 'mujer'
      ? '<path d="M35 49c0-24 10-35 25-35s25 11 25 35c0 15 3 24 8 31H74v3l30 13 16 24H0l16-24 30-13v-3H27c5-7 8-16 8-31z" fill="#737575"/>'
      : '<path d="M60 14c-15 0-22 13-22 30 0 11 3 19 8 25v12L11 96 0 120h120l-11-24-35-15V69c5-6 8-14 8-25 0-17-7-30-22-30z" fill="#737575"/>';
    svg.style.borderRadius = '50%';
    svg.style.overflow = 'hidden';
    svg.innerHTML = `<circle cx="60" cy="60" r="60" fill="#d2d2d2"/>${portrait}`;
    return svg;
  };
})();
