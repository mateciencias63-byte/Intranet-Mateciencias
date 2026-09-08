"""Check material links over HTTP, including PDF download headers."""
import http.client
import importlib.util
import json
from pathlib import Path
import re
import threading
from urllib.parse import quote, unquote

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('biblioteca_server', ROOT / 'biblioteca-servidor.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class QuietHandler(module.BibliotecaHandler):
    def log_message(self, *args):
        pass

if __name__ == '__main__':
    records = json.loads((ROOT / 'tarjetas/biblioteca/biblioteca-index.json').read_text(encoding='utf-8'))
    paths = {record['ruta'] for record in records}
    data = (ROOT / 'tarjetas/canva-studies/evaluaciones-personalizadas-data.js').read_text(encoding='utf-8')
    paths.update(re.findall(r"image:\s*'(MATERIAL[^']+)'", data))
    paths.add('MATERIAL%201/cuestionario/biologia/semana1/preguntas.js')
    failures = []
    server = module.ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        for path in sorted(paths):
            local = (ROOT / unquote(path)).resolve()
            if not local.is_relative_to(ROOT / 'MATERIAL 1') or not local.is_file():
                failures.append('Missing material: '+path)
                continue
            connection = http.client.HTTPConnection('127.0.0.1', server.server_port, timeout=10)
            connection.request('HEAD', '/'+quote(unquote(path), safe='/'))
            response = connection.getresponse()
            if response.status != 200 or int(response.getheader('Content-Length', '-1')) != local.stat().st_size:
                failures.append('HTTP material failed: '+path)
            if '/Biblioteca/' in unquote(path) and response.getheader('Content-Disposition') != 'attachment':
                failures.append('Download header missing: '+path)
            response.read()
            connection.close()
    finally:
        server.shutdown()
        server.server_close()
    print(json.dumps({'material_links':len(paths), 'errors':failures}, ensure_ascii=True))
    raise SystemExit(bool(failures))
