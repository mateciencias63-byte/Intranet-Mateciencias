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
HARNESS = r'''<pre id="result">RUNNING</pre><iframe id="app" style="width:1200px;height:900px"></iframe><script>
const frame=document.getElementById('app'),checks=[];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
(async()=>{try{
Object.entries({dashboardUser:'MateCiencias Adm',dashboardAuthenticated:'true',adminAutenticado:'true',adminUsuario:'MateCiencias Adm',adminTimestamp:String(Date.now()),docenteUser:'Steven Aponte Ramirez',secretariaUsuario:'MateCiencias Adm',aulaVirtualAuth:'true'}).forEach(([k,v])=>sessionStorage.setItem(k,v));
for(const [page,selector] of [['administracion/admin-panel.html','[data-module="Estudiantes"]'],['docentes/administrativo.html','[data-module="Estudiantes"]'],['aula-virtual/aula-virtual-contenido.html','[data-view="pagos"]'],['secretaria/secretaria-academica.html','[data-module="estudiantes"]']]){
await new Promise(r=>{frame.onload=r;frame.src='/tarjetas/'+page;setTimeout(r,1800);});await delay(250);
const doc=frame.contentDocument,nav=doc.querySelector('.menu-lateral');assert(!!nav,page+' menu loaded');
const button=nav.querySelector(selector)||nav.querySelectorAll('button')[1];assert(nav.querySelectorAll('button').length===nav.querySelectorAll('.menu-lateral-icon svg').length,page+' all icons');
let style=frame.contentWindow.getComputedStyle(button);assert(style.flexDirection==='column'&&style.color==='rgb(255, 255, 255)',page+' white vertical layout');
button.querySelector('svg path,svg rect,svg circle').dispatchEvent(new MouseEvent('click',{bubbles:true}));await delay(150);assert(button.classList.contains('active'),page+' icon opens module');
frame.style.width='390px';await delay(100);style=frame.contentWindow.getComputedStyle(nav);assert(style.flexDirection==='column',page+' mobile vertical menu');assert(nav.getBoundingClientRect().width<=110,page+' mobile compact width');frame.style.width='1200px';
}
document.getElementById('result').textContent=JSON.stringify({checks});}catch(e){document.getElementById('result').textContent=JSON.stringify({error:e.message,checks});}})();
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
                '--user-data-dir='+profile,'--virtual-time-budget=25000','--dump-dom',
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
