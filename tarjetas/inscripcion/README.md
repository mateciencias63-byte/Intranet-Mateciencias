# Inscripción

Entrada: [inscripcion-ciclo.html](inscripcion-ciclo.html).

Flujo basado en el video de referencia: registro de documento y temporada, carga de varios pagos, ficha del postulante, recorte de foto de 300 × 300, estudios secundarios, autoidentificación, lenguas originarias, documento adjunto y apoderado.

`registro.js` amplía el formulario existente; `registro.css` adapta la presentación a la referencia y a pantallas pequeñas. Se conservan la marca MateCiencias y la clave `matecienciasInscripciones`. Los registros incorporan `tipoDocumento`, `pagos`, `datosComplementarios`, `lenguasOriginarias` y `documentoAdjunto`; los campos originales siguen disponibles para los módulos existentes. El monto representa la suma de los comprobantes y el pago queda pendiente de verificación. La persistencia es local al navegador; no existe verificación bancaria ni envío a un servidor.

Se bloquean duplicados por tipo de documento, número y temporada. Para otra temporada se recuperan los datos personales disponibles y se requieren nuevos pagos y adjuntos.

Validación en Chrome: `python tests/audit-registro.py`. Usa un perfil temporal y datos ficticios.

Las páginas usan `<base href="../../">` para acceder a los recursos compartidos de la raíz.
