# Servicio compartido de usuarios

La opción **Usuarios** del panel usa esta API. GitHub Pages solo sirve la interfaz:
no ejecuta Python ni guarda las cuentas creadas por el administrador.
Mientras `usuarios-config.js` tenga una URL vacía, el acceso anterior se conserva
y Usuarios indica que la conexión está pendiente. No simula cuentas con localStorage.

## Activación

1. Alojar `usuarios.py` en un servidor con Python 3.11 o posterior y almacenamiento
   persistente. Publicarlo detrás de un proxy HTTPS. El servidor solo atiende la API,
   no debe publicar la base de datos ni el directorio personal como archivos estáticos.
2. Establecer `USUARIOS_DB` a una ruta privada persistente y
   `USUARIOS_ORIGINS=https://mateciencias63-byte.github.io`.
   `HOST` y `PORT` son opcionales (por defecto `127.0.0.1:8080`).
   La configuración inicial acepta `ADMIN_NAME` (por defecto `MateCiencias Adm`).
3. Ejecutar `python servidor/usuarios.py`. Solo en el primer arranque muestra el
   nombre y código inicial del administrador. Guardarlos de forma privada.
   No incorporar esa salida, la base de datos ni códigos a GitHub.
4. Poner la URL HTTPS del servicio, sin `/api` al final, en `usuarios-config.js`
   y publicar ese archivo. Por ejemplo, `https://cuentas.ejemplo.com`.
5. Entrar con la cuenta administradora del servicio y abrir **Usuarios**.
   Las cuentas antiguas de `usuario.js` no se importan automáticamente: deben crearse
   en el servicio. Al activarlo, la página principal autentica únicamente contra la API.

## Funcionamiento

Los códigos se generan con `secrets` y contienen exactamente diez dígitos, incluidos
posibles ceros iniciales. Se muestran únicamente al crear la cuenta o regenerar el
código; se almacenan con scrypt y una sal individual, nunca en texto plano.
El administrador puede copiar nombre, código y enlace para enviarlos personalmente.
Solo la cuenta con rol admin en el servidor puede listar o modificar usuarios.
La cuenta administradora está protegida de eliminación desde este módulo.

Editar un nombre, regenerar un código o eliminar una cuenta revoca sus sesiones
en el servidor. La interfaz comprueba la sesión al abrir el panel principal y
periódicamente en páginas abiertas. Una sesión dura ocho horas.
Los intentos de acceso fallidos se limitan por usuario e IP; el proxy debe tener
también limitación de solicitudes. La API no confía en cabeceras de IP del cliente.
Realizar copias privadas de la base de datos en el servidor.

Esta implementación centraliza **cuentas y acceso**, no los datos académicos:
pagos, horarios y otros módulos existentes todavía usan almacenamiento local.
Los archivos HTML públicos no se convierten en documentos privados por este cambio.

## Comprobación local

`python -m unittest discover -s tests -p "test_usuarios_api.py"`

`python tests/audit-usuarios.py`

Las pruebas usan bases temporales y navegadores aislados. No modifican las cuentas
de producción ni publican contraseñas reales.
