"""Check login navigation in isolated Chrome with the project's existing accounts."""
import functools
import http.server
import json
import re
import html
import subprocess
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HARNESS = r'''<pre id="result">RUNNING</pre><iframe id="app"></iframe><script>
const frame=document.getElementById('app'),checks=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(ok,message)=>{if(!ok)throw Error(message);checks.push(message);};
async function load(path){await new Promise(resolve=>{frame.onload=resolve;frame.src=path;setTimeout(resolve,1500);});await delay(100);}
(async()=>{try{
sessionStorage.clear();await load('/dashboard.html');await delay(300);
assert(frame.contentWindow.location.pathname==='/index.html','Dashboard redirects without login');
const doc=frame.contentDocument;
assert(doc.getElementById('cardsGrid').inert,'First-page cards are inert');
for(const card of doc.querySelectorAll('[data-service]'))card.click();
await delay(100);assert(frame.contentWindow.location.pathname==='/index.html','No first-page card opens');
const account=frame.contentWindow.UsuarioService.getApprovedAccounts()[0];
let notice='';frame.contentWindow.alert=message=>notice=message;
doc.getElementById('usernameInput').value=account.name;
doc.getElementById('passwordInput').value='0000000000';
doc.getElementById('loginForm').requestSubmit();await delay(100);
assert(sessionStorage.getItem('dashboardAuthenticated')!=='true','Wrong password cannot authenticate');
assert(!notice.includes(account.password),'Wrong password does not reveal credentials');
doc.getElementById('passwordInput').value=account.password;
doc.getElementById('loginForm').requestSubmit();await delay(400);
assert(frame.contentWindow.location.pathname==='/dashboard.html','Valid login opens second page');
frame.contentWindow.history.back();await delay(500);
assert(frame.contentWindow.location.pathname==='/index.html','Back returns to first page');
assert(!frame.contentDocument.getElementById('welcomeBlock').classList.contains('hidden'),'Back displays login form');
assert(frame.contentDocument.getElementById('accountShell').classList.contains('hidden'),'Back does not display duplicate account panel');
assert(frame.contentDocument.getElementById('passwordInput').value==='','Back does not retain password');
assert(frame.contentDocument.getElementById('cardsGrid').inert,'Cards stay blocked after going back');
await load('/dashboard.html');
frame.contentDocument.querySelector('[data-service="Inscripcion"]').click();await delay(400);
assert(frame.contentWindow.location.pathname.endsWith('/inscripcion-ciclo.html'),'Second-page cards open modules');
await load('/dashboard.html');frame.contentDocument.getElementById('logoutButton').click();await delay(300);
assert(sessionStorage.getItem('dashboardAuthenticated')===null,'Logout clears authentication');
await load('/dashboard.html');await delay(300);
assert(frame.contentWindow.location.pathname==='/index.html','Logged-out session cannot reopen dashboard');
document.getElementById('result').textContent=JSON.stringify({checks});
}catch(error){document.getElementById('result').textContent=JSON.stringify({error:error.message,checks});}})();
</script>'''

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/__login_test.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HARNESS.encode())
        else:
            path = Path(self.translate_path(self.path))
            if path.suffix == '.html' and path.is_file():
                source = re.sub(r'<link[^>]+https://fonts[^>]+>', '', path.read_text(encoding='utf-8-sig'))
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(source.encode())
            else:
                super().do_GET()

    def log_message(self, *args):
        pass

if __name__ == '__main__':
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        with tempfile.TemporaryDirectory(prefix='mateciencias-login-') as profile:
            result=subprocess.run([r'C:\Program Files\Google\Chrome\Application\chrome.exe',
                '--headless','--no-sandbox','--disable-gpu','--no-first-run','--disable-background-networking',
                '--user-data-dir='+profile,'--virtual-time-budget=15000','--dump-dom',
                f'http://127.0.0.1:{server.server_port}/__login_test.html'],capture_output=True,timeout=60)
            match=re.search(r'<pre id="result">(.*?)</pre>',result.stdout.decode('utf-8'),re.S)
            if not match or match.group(1)=='RUNNING':
                raise RuntimeError('Login check did not finish')
            report=json.loads(html.unescape(match.group(1)))
            print(json.dumps(report))
            if 'error' in report:
                raise SystemExit(1)
    finally:
        server.shutdown()
