from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent


class BibliotecaHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        clean_path = unquote(path.split('?', 1)[0])
        requested_path = (ROOT / clean_path.lstrip('/')).resolve()
        if ROOT not in requested_path.parents and requested_path != ROOT:
            return str(ROOT / '__archivo_inexistente__')
        return str(requested_path)

    def end_headers(self):
        if unquote(self.path.split('?', 1)[0]).lower().startswith('/material 1/biblioteca/'):
            self.send_header('Content-Disposition', 'attachment')
        super().end_headers()


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 8000), BibliotecaHandler)
    print('Biblioteca disponible en http://127.0.0.1:8000/tarjetas/biblioteca/biblioteca-login.html')
    print('Presiona Ctrl+C para detener el servidor.')
    server.serve_forever()
