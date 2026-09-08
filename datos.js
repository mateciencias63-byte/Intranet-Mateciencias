// ========================================
// BASE DE DATOS SIMULADA - UNP Aula Virtual
// ========================================

const UnpData = {
  // Cursos disponibles
  cursos: [
    { id: 1, nombre: 'Psicologia', codigo: 'PSI101', creditos: 4 }
  ],

  // Material
  material: [
    { id: 1, titulo: 'ÁLGEBRA - Semana 01', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 01 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 2, titulo: 'ÁLGEBRA - Semana 02', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 02 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 3, titulo: 'ÁLGEBRA - Semana 03', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 03 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 4, titulo: 'ÁLGEBRA - Semana 04', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 04 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 5, titulo: 'ÁLGEBRA - Semana 05', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 05 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 6, titulo: 'ÁLGEBRA - Semana 06', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 06 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 7, titulo: 'ÁLGEBRA - Semana 07', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 07 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 8, titulo: 'ÁLGEBRA - Semana 08', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 08 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 9, titulo: 'ÁLGEBRA - Semana 09', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 09 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 10, titulo: 'ÁLGEBRA - Semana 10', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 10 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 11, titulo: 'ÁLGEBRA - Semana 11', curso: 'ÁLGEBRA', tipo: 'PDF', enlace: 'Teoria/ALGEBRA/Semana 11 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },

    { id: 12, titulo: 'ARITMÉTICA - Semana 01', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S01 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 13, titulo: 'ARITMÉTICA - Semana 02', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S02 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 14, titulo: 'ARITMÉTICA - Semana 03', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S03 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 15, titulo: 'ARITMÉTICA - Semana 04', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S04 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 16, titulo: 'ARITMÉTICA - Semana 05', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S05 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 17, titulo: 'ARITMÉTICA - Semana 06', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S06 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 18, titulo: 'ARITMÉTICA - Semana 07', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S07 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 19, titulo: 'ARITMÉTICA - Semana 08', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S08 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 20, titulo: 'ARITMÉTICA - Semana 09', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S09 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 21, titulo: 'ARITMÉTICA - Semana 10', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S10 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 22, titulo: 'ARITMÉTICA - Semana 11', curso: 'ARITMÉTICA', tipo: 'PDF', enlace: 'Teoria/ARITMETICA/ARITMETICA - S11 - REGULAR 2022 - 3 - TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },

    { id: 23, titulo: 'BIOLOGÍA - Semana 01', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 01 REGULAR CIENCIAS CICLO OCTUBRE DICIEMBRE 2022.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 24, titulo: 'BIOLOGÍA - Semana 02', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 02 CICLO REGULAR CITOLOGIA Y GENETICA CICLO OCTUBRE  DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 25, titulo: 'BIOLOGÍA - Semana 03', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 03 CICLO REGULAR SETIEMBRE DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 26, titulo: 'BIOLOGÍA - Semana 04', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 04 REINO FUNGI Y REINO PLANTAE CICLO REGULAR SETIEMBRE DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 27, titulo: 'BIOLOGÍA - Semana 05', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 05 REINO ANIMAL CICLO REGULAR SETIEMBRE DICIEMBRE 2022 CLASE PARA ALUMNOS.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 28, titulo: 'BIOLOGÍA - Semana 06', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 06 REINO ANIMAL II CICLO REGULAR SETIEMBRE DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 29, titulo: 'BIOLOGÍA - Semana 07', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 07 ECOLOGIA CICLO REGULAR OCTUBRE DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 30, titulo: 'BIOLOGÍA - Semana 08', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 08 CLASE OSTEOLOGIA ARTROLOGIA MIOLOGIA CICLO REGULAR SETIEMBRE DICIEMBRE 2022 clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 31, titulo: 'BIOLOGÍA - Semana 09', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 09 CICLO IDEPUNP  APARATO RESPIRATORIO Y CARDIOVASCULAR 2022 OCTUBRE DICIEMBRE clase final.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 32, titulo: 'BIOLOGÍA - Semana 10', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 10 CICLO REGULAR OCTUBRE DICIEMBRE 2022 CLASE FINAL.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 33, titulo: 'BIOLOGÍA - Semana 11', curso: 'BIOLOGÍA', tipo: 'PDF', enlace: 'Teoria/BIOLOGIA/SEMANA 11 CICLO REGULAR OCTUBRE DICIEMBRE 2022 CLASE FINAL.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 34, titulo: 'GEOMETRÍA - Semana 01', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 1 (teoría).pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 35, titulo: 'GEOMETRÍA - Semana 02', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 2(TEORÍA).pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 36, titulo: 'GEOMETRÍA - Semana 03', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 03 TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 37, titulo: 'GEOMETRÍA - Semana 04', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 04 TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 38, titulo: 'GEOMETRÍA - Semana 05', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 05 TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 39, titulo: 'GEOMETRÍA - Semana 06', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/TEORIA DE SEMANA 06.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 40, titulo: 'GEOMETRÍA - Semana 07', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 07 TEORIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 41, titulo: 'GEOMETRÍA - Semana 08', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 08 TEORIAdocx.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 42, titulo: 'GEOMETRÍA - Semana 09', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 09(TEORIA).pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 43, titulo: 'GEOMETRÍA - Semana 10', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 10(TEORÍA).pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 44, titulo: 'GEOMETRÍA - Semana 11', curso: 'GEOMETRÍA', tipo: 'PDF', enlace: 'Teoria/GEOMETRIA/SEMANA 11 teoria.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 45, titulo: 'LÓGICO - Semana 01', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/SEMANA 1 TEÓRIA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 46, titulo: 'LÓGICO - Semana 02', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/semana 2 teoria.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 47, titulo: 'LÓGICO - Semana 03', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/TEORÌA SEMANA 3.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 48, titulo: 'LÓGICO - Semana 04', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/semana 4 teoria.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 50, titulo: 'LÓGICO - Semana 07', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/TEORÍA SEMANA 7.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 51, titulo: 'LÓGICO - Semana 09', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/semana 9 teoria.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 52, titulo: 'LÓGICO - Semana 10', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/semana 10 Teoría.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 53, titulo: 'LÓGICO - Semana 11', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/semana 11 teoría.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 54, titulo: 'LÓGICO - Semana 05', curso: 'LÓGICO', tipo: 'PDF', enlace: 'Teoria/LOGICO/TEORÍA SEMANA 7.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 55, titulo: 'RAZ. MATEMÁTICO - Semana 01', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 01.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 56, titulo: 'RAZ. MATEMÁTICO - Semana 02', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 2.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 57, titulo: 'RAZ. MATEMÁTICO - Semana 03', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 3.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 58, titulo: 'RAZ. MATEMÁTICO - Semana 04', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 4.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 59, titulo: 'RAZ. MATEMÁTICO - Semana 05', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 5.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 60, titulo: 'RAZ. MATEMÁTICO - Semana 06', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 6.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 61, titulo: 'RAZ. MATEMÁTICO - Semana 07', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 7.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 62, titulo: 'RAZ. MATEMÁTICO - Semana 08', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 8.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 63, titulo: 'RAZ. MATEMÁTICO - Semana 09', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 9.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 64, titulo: 'RAZ. MATEMÁTICO - Semana 10', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 10.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 65, titulo: 'RAZ. MATEMÁTICO - Semana 11', curso: 'RAZ. MATEMÁTICO', tipo: 'PDF', enlace: 'Teoria/RAZ. MATEMATICO/SEMANA 11.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 66, titulo: 'TRIGONOMETRÍA - Semana 01', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA01 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 67, titulo: 'TRIGONOMETRÍA - Semana 02', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA02 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 68, titulo: 'TRIGONOMETRÍA - Semana 03', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA03 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 69, titulo: 'TRIGONOMETRÍA - Semana 04', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA04 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 70, titulo: 'TRIGONOMETRÍA - Semana 05', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA05 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 71, titulo: 'TRIGONOMETRÍA - Semana 06', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA06 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 72, titulo: 'TRIGONOMETRÍA - Semana 07', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA07 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 73, titulo: 'TRIGONOMETRÍA - Semana 08', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA08 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 74, titulo: 'TRIGONOMETRÍA - Semana 09', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA09 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 75, titulo: 'TRIGONOMETRÍA - Semana 10', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA10 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' },
    { id: 76, titulo: 'TRIGONOMETRÍA - Semana 11', curso: 'TRIGONOMETRÍA', tipo: 'PDF', enlace: 'Teoria/TRIGONOMETRÍA/TRIGONOMETRÍA SEMANA11 TEORÍA.pdf', imagen: 'Teoria/IDEPUNP.png' }
  ],

  // Class
  clases: [
    { id: 1, titulo: 'Class: Psicologia como Ciencia', curso: 'Psicologia', fecha: '2026-08-10', hora: '10:00 PM', enlace: 'https://meet.google.com/abc123', grabada: false },
   
  ],

  // Simulacros
  simulacros: [
   
  ],

  // Exámenes
  examenes: [
    
  ],

  // Mensajes del chat
  chatMensajes: [
   
  ],

  // Pagos
  pagos: [
    { id: 1, concepto: 'Amanecida Virtual', monto: 10.00, fecha: 'No disponible', estado: 'Pendiente', comprobante: null },
  ],

  // Calificaciones
  calificaciones: [
    { id: 1, curso: 'Psicologia', nota: 0, peso: 0 },
    { id: 2, curso: 'Psicologia', nota: 0, peso: 0 },
  ],

  // Funciones auxiliares
  getMaterialPorCurso: function(nombreCurso) {
    return this.material.filter(function(m) {
      return m.curso === nombreCurso;
    });
  },

  getClasesPorCurso: function(nombreCurso) {
    return this.clases.filter(c => c.curso === nombreCurso);
  },

  getCalificacionesPorCurso: function(nombreCurso) {
    return this.calificaciones.filter(c => c.curso === nombreCurso);
  },

  calcularPromedioCurso: function(nombreCurso) {
    const cals = this.getCalificacionesPorCurso(nombreCurso);
    if (cals.length === 0) return 0;
    const suma = cals.reduce((acc, c) => acc + (c.nota * c.peso), 0);
    const pesoTotal = cals.reduce((acc, c) => acc + c.peso, 0);
    return (suma / pesoTotal).toFixed(2);
  },

  calcularPromedioGeneral: function() {
    const cursos = [...new Set(this.calificaciones.map(c => c.curso))];
    const promedios = cursos.map(c => parseFloat(this.calcularPromedioCurso(c)));
    return (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2);
  },

  obtenerEstadoPago: function() {
    const pendiente = this.pagos.filter(p => p.estado === 'Pendiente').length;
    const enRevision = this.pagos.filter(p => p.estado === 'En revisión').length;
    const confirmado = this.pagos.filter(p => p.estado === 'Confirmado').length;
    return { pendiente, enRevision, confirmado };
  }
};

// Exportar para ser usado en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UnpData;
}
