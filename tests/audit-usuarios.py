"""Browser integration with a real temporary API, without production accounts."""
import functools
import html
import http.server
import importlib.util
import json
import re
import subprocess
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('cuentas', ROOT / 'servidor/usuarios.py')
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)

HARNESS = r'''<pre id="result">RUNNING</pre><iframe id="app" style="width:1200px;height:900px"></iframe><script>
const frame=document.querySelector('iframe'),checks=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
async function load(path){await new Promise(r=>{frame.onload=r;frame.src=path;setTimeout(r,2000);});await delay(400);}
async function until(fn){for(let n=0;n<50;n++){if(fn())return;await delay(100);}throw Error('Timeout waiting for UI');}
(async()=>{try{
await load('/tarjetas/administracion/admin-login.html');
let doc=frame.contentDocument;
doc.querySelector('#adminUser').value='Administrador Prueba';
doc.querySelector('#adminCode').value=ADMIN_CODE;
doc.querySelector('form').requestSubmit();
await until(()=>frame.contentDocument.querySelector('[data-module="Usuarios"]'));
doc=frame.contentDocument;doc.querySelector('[data-module="Usuarios"]').click();
await until(()=>doc.querySelector('.users-manager form'));
let form=doc.querySelector('.users-manager form');form.elements.name.value='Alumno Prueba';form.requestSubmit();
await until(()=>!doc.querySelector('.users-code').hidden);
const credentials=doc.querySelector('.users-code pre').textContent;
const code=credentials.match(/Código: ([0-9]{10})/)[1];assert(code.length===10,'Admin creates a ten-digit numeric code');
await until(()=>doc.querySelector('.users-manager tbody').textContent.includes('Alumno Prueba'));
assert(doc.querySelector('.users-manager tbody').textContent.includes('Cuenta protegida'),'Administrator account is protected');
await until(()=>!doc.querySelector('.users-manager button').disabled);
[...doc.querySelectorAll('.users-manager tbody button')].find(b=>b.textContent.includes('Editar')).click();
form.elements.name.value='usuario01';form.requestSubmit();
await until(()=>doc.querySelector('.users-manager tbody').textContent.includes('usuario01'));
assert(!doc.querySelector('.users-manager tbody').textContent.includes('Alumno Prueba'),'Admin edits the existing user');
// Remove all browser account state: the next login must use the shared API.
sessionStorage.clear();localStorage.clear();
await load('/index.html');doc=frame.contentDocument;
frame.contentWindow.alert=()=>{};
doc.querySelector('#usernameInput').value='usuario01';doc.querySelector('#passwordInput').value=code;
doc.querySelector('#loginForm').requestSubmit();
await until(()=>frame.contentWindow.location.pathname.endsWith('/dashboard.html')&&!frame.contentDocument.querySelector('.dashboard').hidden);
assert(frame.contentDocument.querySelector('#dashboardUser').textContent==='usuario01','Created account logs in after clearing all browser storage');
const result=await frame.contentWindow.UsuariosAPI.request('/session');assert(result.user.role==='user','Created user has no admin privileges');
let forbidden=false;try{await frame.contentWindow.UsuariosAPI.request('/users');}catch(_){forbidden=true;}
assert(forbidden,'Student cannot list or manage accounts');
document.querySelector('#result').textContent=JSON.stringify({checks});
}catch(e){document.querySelector('#result').textContent=JSON.stringify({error:e.message,checks});}})();
</script>'''

if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='mateciencias-users-') as temporary:
        store = api.Cuentas(Path(temporary) / 'users.sqlite3')
        admin = store.save('Administrador Prueba', role='admin')

        class Static(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *_):
                pass

            def do_GET(self):
                if self.path == '/test.html':
                    body = HARNESS.replace('ADMIN_CODE', json.dumps(admin['code']))
                elif self.path.startswith('/usuarios-config.js'):
                    body = f'window.MATECIENCIAS_USUARIOS_API="http://127.0.0.1:{backend.server_port}";'
                else:
                    path = Path(self.translate_path(self.path))
                    if path.suffix != '.html' or not path.is_file():
                        return super().do_GET()
                    body = re.sub(r'<link[^>]+https://fonts[^>]+>', '', path.read_text(encoding='utf-8-sig'))
                self.send_response(200)
                self.send_header('Content-Type', 'application/javascript' if self.path.startswith('/usuarios-config.js') else 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(body.encode())

        frontend = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Static, directory=str(ROOT)))
        backend = http.server.ThreadingHTTPServer(('127.0.0.1', 0), api.handler(store, {f'http://127.0.0.1:{frontend.server_port}'}))
        for server in (frontend, backend):
            threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            result = subprocess.run([r'C:\Program Files\Google\Chrome\Application\chrome.exe',
                                     '--headless', '--no-sandbox', '--disable-gpu', '--no-first-run',
                                     '--disable-background-networking', '--user-data-dir=' + temporary + '/chrome',
                                     '--virtual-time-budget=45000', '--dump-dom',
                                     f'http://127.0.0.1:{frontend.server_port}/test.html'], capture_output=True, timeout=60)
            match = re.search(r'<pre id="result">(.*?)</pre>', result.stdout.decode('utf-8'), re.S)
            if not match or match[1] == 'RUNNING':
                raise RuntimeError('Browser check did not finish')
            report = json.loads(html.unescape(match[1]))
            print(json.dumps(report))
            if 'error' in report:
                raise SystemExit(1)
        finally:
            for server in (frontend, backend):
                server.shutdown()
                server.server_close()
