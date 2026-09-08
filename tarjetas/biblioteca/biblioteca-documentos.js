const BIBLIOTECA_STORAGE_KEY = 'matecienciasBibliotecaDocumentos';
const BIBLIOTECA_PROPIETARIO = 'Uziel Aponte Ramirez';
const puedeGestionarBiblioteca = obtenerUsuarioActual() === BIBLIOTECA_PROPIETARIO;

const bibliotecaState = {
  documentos: [],
  filtro: '',
  categoria: 'todos',
  orden: 'recientes'
};

function cargarDocumentos() {
  try {
    const documentosGuardados = JSON.parse(localStorage.getItem(BIBLIOTECA_STORAGE_KEY) || '[]');
    return Array.isArray(documentosGuardados) ? documentosGuardados : [];
  } catch (error) {
    return [];
  }
}

async function cargarDocumentosIniciales() {
  const documentosGuardados = cargarDocumentos();

  try {
    const respuesta = await fetch('tarjetas/biblioteca/biblioteca-index.json?v=20260905-6', { cache: 'no-store' });
    const documentosDeCarpeta = await respuesta.json();
    bibliotecaState.documentos = [...documentosDeCarpeta, ...documentosGuardados].map((documento, indice) => ({
      ...documento,
      id: documento.id || `${documento.ruta || documento.nombreArchivo}-${indice}`
    }));
  } catch (error) {
    bibliotecaState.documentos = documentosGuardados.map((documento, indice) => ({
      ...documento,
      id: documento.id || `${documento.ruta || documento.nombreArchivo}-${indice}`
    }));
  }

  renderizarCategorias();
  renderizarDocumentos();
}

function guardarDocumentos() {
  const documentosLocales = bibliotecaState.documentos.filter((documento) => !documento.ruta);
  localStorage.setItem(BIBLIOTECA_STORAGE_KEY, JSON.stringify(documentosLocales));
}

function obtenerUsuarioActual() {
  const usuarioAdmin = sessionStorage.getItem('adminUsuario');
  const usuarioDashboard = sessionStorage.getItem('dashboardUser');
  return (usuarioAdmin || usuarioDashboard || '').trim();
}

function escaparHtml(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function obtenerDocumentosVisibles() {
  const termino = bibliotecaState.filtro.toLowerCase();
  const documentos = bibliotecaState.documentos.filter((documento) => {
    const coincideCategoria = bibliotecaState.categoria === 'todos' || documento.categoria === bibliotecaState.categoria;
    const textoDocumento = `${documento.titulo} ${documento.autor} ${documento.categoria}`.toLowerCase();
    return documento.publicado && coincideCategoria && textoDocumento.includes(termino);
  });

  return documentos.sort((documentoA, documentoB) => {
    if (bibliotecaState.orden === 'titulo') {
      return documentoA.titulo.localeCompare(documentoB.titulo, 'es');
    }
    if (bibliotecaState.orden === 'categoria') {
      return documentoA.categoria.localeCompare(documentoB.categoria, 'es');
    }
    return documentoB.fechaCreacion - documentoA.fechaCreacion;
  });
}

function renderizarCategorias() {
  const filtroCategoria = document.getElementById('filtroCategoria');
  const categorias = [...new Set(bibliotecaState.documentos.map((documento) => documento.categoria))].sort((categoriaA, categoriaB) => categoriaA.localeCompare(categoriaB, 'es'));
  const categoriaActual = bibliotecaState.categoria;

  filtroCategoria.innerHTML = '<option value="todos">Todas las categorías</option>';
  categorias.forEach((categoria) => {
    filtroCategoria.insertAdjacentHTML('beforeend', `<option value="${escaparHtml(categoria)}">${escaparHtml(categoria)}</option>`);
  });
  filtroCategoria.value = categorias.includes(categoriaActual) ? categoriaActual : 'todos';
}

function renderizarDocumentos() {
  const listaDocumentos = document.getElementById('listaDocumentos');
  const documentosVisibles = obtenerDocumentosVisibles();
  const contadorDocumentos = document.getElementById('contadorDocumentos');

  contadorDocumentos.textContent = `${documentosVisibles.length} ${documentosVisibles.length === 1 ? 'documento publicado' : 'documentos publicados'}`;

  if (!documentosVisibles.length) {
    listaDocumentos.innerHTML = '<div class="biblioteca-vacia"><strong>No hay documentos publicados</strong><span>Sube el primer libro o filtra con otra categoría.</span></div>';
    return;
  }

  listaDocumentos.innerHTML = documentosVisibles.map((documento) => `
    <article class="documento-item">
      <div class="documento-icono">${obtenerIcono(documento.tipo)}</div>
      <div class="documento-info">
        <span class="documento-categoria">${escaparHtml(documento.categoria)}</span>
        <h3>${escaparHtml(documento.titulo)}</h3>
      </div>
      <div class="documento-acciones">
        <button class="boton-descarga" type="button" data-descargar="${documento.id}">Descargar</button>
        ${puedeGestionarBiblioteca && !documento.ruta ? `<button class="boton-eliminar" type="button" data-eliminar="${documento.id}" aria-label="Eliminar ${escaparHtml(documento.titulo)}">Eliminar</button>` : ''}
      </div>
    </article>
  `).join('');
}

function obtenerIcono(tipo) {
  if (tipo === 'application/pdf') return 'PDF';
  if (tipo.includes('word') || tipo.includes('document')) return 'DOC';
  if (tipo.includes('epub')) return 'EPUB';
  return 'FILE';
}

async function descargarDocumento(id) {
  const documento = bibliotecaState.documentos.find((item) => item.id === id);
  if (!documento) return;

  try {
    let contenidoDescarga = documento.contenido;

    if (!contenidoDescarga && documento.ruta) {
      const respuesta = await fetch(documento.ruta);
      if (!respuesta.ok) throw new Error('No se encontró el archivo.');
      const archivo = await respuesta.blob();
      contenidoDescarga = URL.createObjectURL(archivo);
    }

    const enlace = document.createElement('a');
    enlace.href = contenidoDescarga;
    enlace.download = documento.nombreArchivo;
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    if (documento.ruta && contenidoDescarga.startsWith('blob:')) {
      window.setTimeout(() => URL.revokeObjectURL(contenidoDescarga), 1000);
    }
  } catch (error) {
    const enlaceRespaldo = document.createElement('a');
    enlaceRespaldo.href = documento.contenido || documento.ruta;
    enlaceRespaldo.target = '_blank';
    enlaceRespaldo.rel = 'noopener';
    document.body.appendChild(enlaceRespaldo);
    enlaceRespaldo.click();
    enlaceRespaldo.remove();
  }
}

function eliminarDocumento(id) {
  if (!puedeGestionarBiblioteca) return;

  const documento = bibliotecaState.documentos.find((item) => item.id === id);
  if (!documento || documento.ruta || !window.confirm(`¿Eliminar "${documento.titulo}"?`)) return;

  bibliotecaState.documentos = bibliotecaState.documentos.filter((item) => item.id !== id);
  guardarDocumentos();
  renderizarCategorias();
  renderizarDocumentos();
}

document.getElementById('buscadorDocumentos').addEventListener('input', (event) => {
  bibliotecaState.filtro = event.target.value;
  renderizarDocumentos();
});
document.getElementById('filtroCategoria').addEventListener('change', (event) => {
  bibliotecaState.categoria = event.target.value;
  renderizarDocumentos();
});
document.getElementById('ordenDocumentos').addEventListener('change', (event) => {
  bibliotecaState.orden = event.target.value;
  renderizarDocumentos();
});
document.getElementById('listaDocumentos').addEventListener('click', (event) => {
  const botonDescarga = event.target.closest('[data-descargar]');
  const botonEliminar = event.target.closest('[data-eliminar]');
  if (botonDescarga) descargarDocumento(botonDescarga.dataset.descargar);
  if (botonEliminar) eliminarDocumento(botonEliminar.dataset.eliminar);
});

cargarDocumentosIniciales();
