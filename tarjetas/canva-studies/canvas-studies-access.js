// Códigos de acceso para Canvas Studies (6 dígitos)
// Cada curso/examen tiene su código único y complejo

const CanvaStudiesCodes = {
  'ADES-2026': 'K7M9P2',
  'REGULAR-2026': 'Q5B8W3',
  'ENERO-2027': 'L2F6R9',
  'ABRIL-2027': 'X4T7N1',
  'ADES-2027': 'C8J5V2',
  'REGULAR-2027': 'D9S4H6',
  'EXAMEN-ORD-2027-1': 'G3Z1A8',
  'EXAMEN-EXT-2027-2': 'Y6E2O7',
  'EXAMEN-ORD-2027-2': 'U1I9P4',
  'EXAMEN-ADES-2027': 'W5M8K3'
};

// Función para validar código
function validarCodigoAcceso(codigo, course) {
  const codigoIngresado = codigo.replace('-', '').toUpperCase();
  const codigoEsperado = CanvaStudiesCodes[course] || '';
  
  // Verificar que el código sea válido
  return codigoIngresado === codigoEsperado;
}

// Función para formatear código mientras se escribe (XXX-XXX)
function formatearCodigoAcceso(input) {
  let valor = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
  
  if (valor.length > 3) {
    valor = valor.slice(0, 3) + '-' + valor.slice(3);
  }
  
  return valor;
}
