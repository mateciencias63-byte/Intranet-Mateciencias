"""Run the intranet in isolated headless Chrome with no extra dependencies.

Uses a temporary Chrome profile and an ephemeral local HTTP origin. No existing
browser sessions or stored intranet records are used.
"""
import functools
import http.server
import json
import re
from pathlib import Path
import subprocess
import tempfile
import threading

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(p.relative_to(ROOT).as_posix() for p in [*ROOT.glob('*.html'), *(ROOT / 'tarjetas').rglob('*.html')])
PAGES.append('tarjetas/aula-virtual/aula-virtual-contenido.html?view=calendario')
HARNESS = r'''<!doctype html><meta charset="utf-8"><pre id="result">RUNNING</pre>
<script>
const pages = __PAGES__;
const errors = [];
const checked = [];
const notices = [];
const routes = {
  Admision:'tarjetas/admision/admision-login.html', Inscripcion:'tarjetas/inscripcion/inscripcion-ciclo.html', Matricula:'tarjetas/matricula/matricula-login.html',
  'Panel administrativo':'tarjetas/administracion/admin-login.html', Contabilidad:'tarjetas/tesoreria/contabilidad-login.html', Formularios:'tarjetas/canva-studies/formularios.html',
  'Panel de docentes':'tarjetas/docentes/docente-login.html', 'Aula virtual':'tarjetas/aula-virtual/aula-virtual.html', 'Biblioteca virtual':'tarjetas/biblioteca/biblioteca-login.html',
  'Calendario Academico':'tarjetas/calendario/calendario-academico.html', 'Secretaria Academica':'tarjetas/secretaria/secretaria-login.html',
  Encuestas:'tarjetas/administracion/admin-login.html?next=Encuestas', 'Tramites Academicos':'tarjetas/secretaria/secretaria-login.html?next=tramites'
};
const logins = {
  'tarjetas/administracion/admin-login.html':['adminUser','MateCiencias', 'tarjetas/administracion/admin-panel.html'],
  'tarjetas/docentes/docente-login.html':['docenteUserInput','Steven Aponte Ramirez','tarjetas/docentes/administrativo.html'],
  'tarjetas/admision/admision-login.html':['admisionUserInput','MateCiencias Adm','tarjetas/admision/admision.html'],
  'tarjetas/tesoreria/contabilidad-login.html':['accountingUserInput','MateCiencias Adm','tarjetas/tesoreria/contabilidad.html'],
  'tarjetas/matricula/matricula-login.html':['matriculaUserInput','MateCiencias Adm','tarjetas/matricula/matricula.html'],
  'tarjetas/secretaria/secretaria-login.html':['secretariaUserInput','MateCiencias Adm','tarjetas/secretaria/secretaria-academica.html'],
  'tarjetas/canva-studies/formularios-login.html':['formulariosUserInput','MateCiencias Adm','tarjetas/canva-studies/formularios.html'],
  'tarjetas/aula-virtual/aula-virtual.html':['aulaUser','MateCiencias Adm','tarjetas/aula-virtual/aula-virtual-contenido.html']
};
window.captureError = (page, message) => errors.push({page, message});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
for (const [key,value] of Object.entries({dashboardUser:'MateCiencias Adm',
  docenteUser:'Steven Aponte Ramirez', adminAutenticado:'true',
  adminUsuario:'MateCiencias Adm', adminTimestamp:String(Date.now()),
  calendarioUsuario:'MateCiencias Adm', calendarioTimestamp:String(Date.now()),
  secretariaUsuario:'MateCiencias Adm', contabilidadUsuario:'MateCiencias Adm',
  admisionUsuario:'MateCiencias Adm', matriculaUsuario:'MateCiencias Adm',
  aulaVirtualAuth:'true'})) sessionStorage.setItem(key,value);
async function run() {
  for (const page of pages) {
    try {
      const frame = document.createElement('iframe');
      document.body.append(frame);
      frame.src = '/'+page;
      await new Promise(resolve => { frame.onload=resolve; setTimeout(resolve,3000); });
      await delay(100);
      const doc = frame.contentDocument;
      checked.push(page);
      if(page.endsWith('?view=calendario')) {
        const activeCalendar=()=>frame.contentDocument.querySelector('[data-panel="calendario"].active');
        if(!activeCalendar()) errors.push({page,message:'Calendar was not selected'});
        sessionStorage.removeItem('aulaVirtualAuth');
        frame.src='/'+page;
        await delay(400);
        if(frame.contentWindow.location.pathname!=='/tarjetas/calendario/calendario-academico.html' || !frame.contentDocument.getElementById('aulaCalendarGrid')?.children.length) errors.push({page,message:'Calendar requires login'});
        const month=frame.contentDocument.getElementById('aulaCalendarMonth').textContent;
        frame.contentDocument.getElementById('aulaCalendarNext').click();
        if(frame.contentDocument.getElementById('aulaCalendarMonth').textContent===month) errors.push({page,message:'Public calendar month navigation failed'});
        if(sessionStorage.getItem('aulaVirtualAuth')!==null) errors.push({page,message:'Public calendar created an Aula session'});
        sessionStorage.setItem('aulaVirtualAuth','true');
        checked.push(page+' :: public calendar without Aula login');
      }
      if (page==='index.html' || page==='dashboard.html') {
        const services=[...doc.querySelectorAll('#cardsGrid [data-service]')].map(card=>card.dataset.service);
        for (const service of services) {
          frame.src='/'+page;
          await new Promise(resolve=>{frame.onload=resolve;setTimeout(resolve,3000);});
          const card=[...frame.contentDocument.querySelectorAll('[data-service]')].find(card=>card.dataset.service===service);
          const before=notices.length;
          card.click();
          await delay(200);
          if(routes[service]) {
            const actual=frame.contentWindow.location.pathname.slice(1)+frame.contentWindow.location.search;
            if(actual!==routes[service]) errors.push({page,message:'Card failed: '+service+' -> '+actual});
          } else if(notices.length===before) errors.push({page,message:'Card has no feedback: '+service});
          checked.push(page+' :: '+service);
        }
      }
      if (logins[page]) {
        const calendarLogin = page==='tarjetas/calendario/calendario-login.html';
        const adminKeys=['adminAutenticado','adminUsuario','adminTimestamp'];
        const adminState=adminKeys.map(key=>sessionStorage.getItem(key));
        if(calendarLogin) adminKeys.forEach(key=>sessionStorage.removeItem(key));
        const [id,user,destination]=logins[page];
        const input=doc.getElementById(id);
        input.value='Unknown test user';
        doc.querySelector('button[type="submit"]').click();
        await delay(50);
        if(frame.contentWindow.location.pathname!=='/'+page) {
          errors.push({page,message:'Unknown user was accepted'});
        }
        input.value=user;
        doc.querySelector('button[type="submit"]').click();
        await delay(200);
        if(frame.contentWindow.location.pathname!=='/'+destination) errors.push({page,message:'Login did not navigate to '+destination});
        checked.push(page+' :: rejected unknown user and accepted authorized user');
        if(calendarLogin) {
          if(adminKeys.some(key=>sessionStorage.getItem(key)!==null)) errors.push({page,message:'Calendar opened an admin session'});
          if(frame.contentDocument.querySelector('.calendar-page-back')?.getAttribute('href')!=='dashboard.html') errors.push({page,message:'Calendar return link does not go to dashboard'});
          if(!frame.contentDocument.getElementById('calendarForm')) errors.push({page,message:'Calendar form missing after login'});
          adminKeys.forEach((key,index)=>{if(adminState[index]!==null)sessionStorage.setItem(key,adminState[index]);});
          checked.push(page+' :: independent session and return to dashboard');
        }
      }
      if (page==='tarjetas/aula-virtual/aula-virtual-contenido.html') {
        for(const button of doc.querySelectorAll('.aula-nav [data-view]')) {
          button.click();
          if(!button.classList.contains('active')) errors.push({page,message:'View did not activate: '+button.dataset.view});
          checked.push(page+' :: '+button.dataset.view);
        }
      }
      if (page==='tarjetas/administracion/admin-panel.html' || page==='tarjetas/docentes/administrativo.html') {
        const buttons = [...doc.querySelectorAll('nav [data-module], .admin-nav [data-module], .docente-nav [data-module]')];
        for (const button of buttons) {
          const name=button.dataset.module;
          if(name==='Inicio') continue;
          button.click();
          await delay(200);
          if(typeof frame.contentWindow.DocenteModules?.[name]?.render !== 'function') {
            errors.push({page,message:'Module not loaded: '+name});
          }
          checked.push(page+' :: '+name);
          if(name==='Tareas') {
            const original={id:'audit-task', title:'Original', course:'Trigonometría', type:'encuesta', points:20, dueDate:'2026-09-10T12:00', instructions:'Indicaciones', published:true, teacher:'Steven', createdAt:'2026-09-01', attachment:{name:'apoyo.txt',data:'data:text/plain;base64,QQ=='}};
            const delivery={id:'audit-delivery',taskId:original.id,student:'Prueba',response:'Respuesta',grade:18};
            localStorage.setItem('matecienciasTareas',JSON.stringify([original]));
            localStorage.setItem('matecienciasEntregasTareas',JSON.stringify([delivery]));
            frame.contentWindow.DocenteModules.Tareas.render();
            doc.querySelector('[data-edit-task]').click();
            doc.getElementById('tareaTitle').value='Editada';
            doc.getElementById('tareaSave').click();
            const saved=JSON.parse(localStorage.getItem('matecienciasTareas'));
            if(saved.length!==1 || saved[0].title!=='Editada' || saved[0].id!==original.id || saved[0].attachment.data!==original.attachment.data || JSON.parse(localStorage.getItem('matecienciasEntregasTareas'))[0].grade!==18) errors.push({page,message:'Task edit did not preserve record and submissions'});
            doc.querySelector('[data-edit-task]').click();
            doc.getElementById('tareaTitle').value='Cancelada';
            doc.getElementById('tareaCancel').click();
            if(JSON.parse(localStorage.getItem('matecienciasTareas'))[0].title!=='Editada') errors.push({page,message:'Cancel changed saved task'});
            frame.contentWindow.confirm=()=>false;
            doc.querySelector('[data-delete-task]').click();
            if(JSON.parse(localStorage.getItem('matecienciasTareas')).length!==1) errors.push({page,message:'Cancelled deletion removed task'});
            frame.contentWindow.confirm=()=>true;
            doc.querySelector('[data-delete-task]').click();
            if(JSON.parse(localStorage.getItem('matecienciasTareas')).length!==0 || doc.querySelector('[data-delete-task]')) errors.push({page,message:'Task deletion failed'});
            checked.push(page+' :: edit, cancel and delete activity');
            localStorage.removeItem('matecienciasEntregasTareas');
          }
        }
      }
      frame.remove();
    } catch(error) { errors.push({page,message:String(error)}); }
  }
  const assets=errors.filter(error=>error.message.startsWith('Failed resource:') && !error.message.includes('.js'));
  document.getElementById('result').textContent=JSON.stringify({checked,errors:errors.filter(error=>!assets.includes(error)),assets});
}
window.recordNotice=message=>notices.push(message);
run().catch(error=>document.getElementById('result').textContent=String(error));
</script>'''.replace('__PAGES__', json.dumps(PAGES))

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/__audit.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HARNESS.encode())
        else:
            path = Path(self.translate_path(self.path))
            if path.suffix == '.html' and path.is_file() and path.resolve().is_relative_to(ROOT):
                page = json.dumps(path.relative_to(ROOT).as_posix())
                hook = ('<script>if(parent!==window && parent.captureError){'
                    'window.addEventListener("error",e=>parent.captureError('+page+',e.message||"Failed resource: "+(e.target.src||e.target.href)),true);'
                    'window.addEventListener("unhandledrejection",e=>parent.captureError('+page+',String(e.reason)));'
                    'window.alert=message=>parent.recordNotice(String(message));}</script>')
                source = path.read_text(encoding='utf-8-sig').replace('<head>', '<head>'+hook, 1)
                source = re.sub(r'<link[^>]+https://fonts[^>]+>', '', source)
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(source.encode())
            else:
                super().do_GET()

    def log_message(self, *args):
        pass

if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    chrome = Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe')
    with tempfile.TemporaryDirectory(prefix='intranet-audit-') as profile:
        try:
            result = subprocess.run([str(chrome), '--headless=new', '--disable-gpu',
                '--no-first-run', '--disable-background-networking',
                '--user-data-dir='+profile, '--virtual-time-budget=90000', '--dump-dom',
                f'http://127.0.0.1:{server.server_port}/__audit.html'],
                capture_output=True, text=True, encoding='utf-8', timeout=120)
            import html
            import re
            match = re.search(r'<pre id="result">(.*?)</pre>', result.stdout, re.S)
            if not match or match.group(1) == 'RUNNING':
                raise RuntimeError('Browser audit did not finish: '+result.stderr[-1500:])
            report = json.loads(html.unescape(match.group(1)))
            print(json.dumps({'checks':len(report['checked']), 'errors':report['errors'],
                'assets':report['assets']}, ensure_ascii=True))
            if report['errors']:
                raise SystemExit(1)
        finally:
            server.shutdown()
