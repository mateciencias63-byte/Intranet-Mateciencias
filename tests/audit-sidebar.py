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
Object.entries({dashboardUser:'MateCiencias Adm',dashboardAuthenticated:'true',adminAutenticado:'true',adminUsuario:'MateCiencias Adm',adminTimestamp:String(Date.now()),docenteUser:'Joel Chiroque Chiroque',secretariaUsuario:'MateCiencias Adm',aulaVirtualAuth:'true'}).forEach(([k,v])=>sessionStorage.setItem(k,v));
localStorage.setItem('matecienciasNotificaciones',JSON.stringify([{title:'Comunicado de prueba',detail:'Contenido de prueba',createdAt:'2026-09-08T12:00:00Z'}]));
localStorage.setItem('matecienciasAsistencias',JSON.stringify([{student:'MateCiencias Adm',className:'Curso propio',status:'Falta'},{student:'Otro alumno',className:'Curso ajeno',status:'Presente'}]));
localStorage.removeItem('matecienciasClasesSinEjemplos20260908');
localStorage.setItem('matecienciasClasesVirtuales',JSON.stringify([{name:'Ciclo Preu Verano 2026 - Ciencias',url:'https://meet.google.com/jso-wsie-ndw'},{name:'Clase publicada',url:'https://example.com/clase'}]));
for(const [page,selector] of [['administracion/admin-panel.html','[data-module="Estudiantes"]'],['docentes/administrativo.html','[data-module="Estudiantes"]'],['aula-virtual/aula-virtual-contenido.html','[data-view="pagos"]']]){
await new Promise(r=>{frame.onload=r;frame.src='/tarjetas/'+page;setTimeout(r,1800);});await delay(250);
const doc=frame.contentDocument,nav=doc.querySelector('.menu-lateral');assert(!!nav,page+' menu loaded');
const classes=JSON.parse(localStorage.getItem('matecienciasClasesVirtuales'));assert(classes.length===1&&classes[0].name==='Clase publicada',page+' removes only legacy example classes');
const home=doc.querySelector('.portal-home');assert(home&&!home.hidden,page+' initial summary visible');
assert(home.querySelector('.portal-notices').textContent.includes('Comunicado de prueba'),page+' real notices');
home.querySelector('.portal-collapse').click();assert(home.querySelector('.portal-notices').hidden,page+' notices collapse');home.querySelector('.portal-collapse').click();
assert(home.querySelectorAll('.portal-shortcut').length===3,page+' three working shortcuts');
if(page.includes('aula-virtual'))assert(home.querySelector('tbody').textContent.includes('Curso propio')&&!home.querySelector('tbody').textContent.includes('Curso ajeno'),'Student attendance is filtered');
const button=nav.querySelector(selector)||nav.querySelectorAll('button')[1];assert(nav.querySelectorAll('button').length===nav.querySelectorAll('.menu-lateral-icon svg').length,page+' all icons');
let style=frame.contentWindow.getComputedStyle(button);assert(style.flexDirection==='column'&&style.color==='rgb(255, 255, 255)',page+' white vertical layout');
frame.contentWindow.scrollTo(0,650);await delay(50);
assert(frame.contentWindow.scrollY>0,page+' scrolled down before selecting option');
button.querySelector('svg path,svg rect,svg circle').dispatchEvent(new MouseEvent('click',{bubbles:true}));await delay(150);assert(button.classList.contains('active'),page+' icon opens module');
assert(frame.contentWindow.scrollY===0,page+' selecting option returns to top');
assert(!doc.querySelector('.portal-home')||doc.querySelector('.portal-home').hidden,page+' summary hides on module navigation');
frame.style.width='390px';await delay(100);style=frame.contentWindow.getComputedStyle(nav);assert(style.flexDirection==='column',page+' mobile vertical menu');assert(nav.getBoundingClientRect().width<=110,page+' mobile compact width');frame.style.width='1200px';
const scheduleButton=nav.querySelector('[data-module="Horario"],[data-module="horarios"],[data-view="horario"]');
assert(!!scheduleButton,page+' schedule option available');scheduleButton.click();await delay(400);
const schedule=doc.querySelector('.week-schedule');assert(!!schedule,page+' weekly timetable loaded');
assert(schedule.querySelectorAll('.week-day-heading').length===8,page+' seven days and hour column');
assert(schedule.querySelectorAll('.week-hour').length===24,page+' full 24-hour schedule');
const RealDate=frame.contentWindow.Date;let clockTime='2026-09-09T05:00:00Z';
frame.contentWindow.Date=class extends RealDate { constructor(...args){super(...(args.length?args:[clockTime]));} };
await delay(1100);
let currentDay=schedule.querySelector('.week-day.today');
assert([...schedule.querySelectorAll('.week-day')].indexOf(currentDay)===2&&parseFloat(currentDay.querySelector('.week-now-line').style.top)===0,page+' Wednesday starts at midnight Peru time');
clockTime='2026-09-09T17:30:00Z';await delay(1100);
assert(parseFloat(schedule.querySelector('.week-now-line').style.top)===850,page+' time line advances automatically');
clockTime='2026-09-10T05:00:00Z';await delay(1100);
assert([...schedule.querySelectorAll('.week-day')].indexOf(schedule.querySelector('.week-day.today'))===3&&parseFloat(schedule.querySelector('.week-now-line').style.top)===0,page+' line and highlight move to next day');
assert(schedule.querySelectorAll('.week-now-line').length===1,page+' only one current-time marker');
frame.contentWindow.Date=RealDate;
if(page.startsWith('administracion/')){
schedule.querySelector('.week-heading button:not([data-current-time])').click();let editor=doc.querySelector('.week-editor'),form=editor.querySelector('form');
form.elements.course.value='Álgebra de prueba';form.elements.teacher.value='Docente de prueba';form.elements.start.value='08:50';form.elements.end.value='08:00';form.requestSubmit();
assert(!localStorage.getItem('matecienciasHorarioSemanal'),'Invalid ending time blocked');
form.elements.end.value='10:20';form.elements.day.value='6';form.requestSubmit();await delay(80);
let classes=JSON.parse(localStorage.getItem('matecienciasHorarioSemanal'));assert(classes.length===1&&classes[0].day===6&&classes[0].teacher==='Docente de prueba','Admin saves course, teacher, exact times and Sunday');
doc.querySelector('button.week-class').click();editor=doc.querySelector('.week-editor');form=editor.querySelector('form');form.elements.course.value='Curso actualizado';form.requestSubmit();await delay(60);
assert(JSON.parse(localStorage.getItem('matecienciasHorarioSemanal'))[0].course==='Curso actualizado','Admin edits existing class');
doc.querySelector('button.week-class').click();editor=doc.querySelector('.week-editor');form=editor.querySelector('form');form.elements.course.value='Cambio no autorizado';sessionStorage.setItem('adminTimestamp','0');form.requestSubmit();
assert(JSON.parse(localStorage.getItem('matecienciasHorarioSemanal'))[0].course==='Curso actualizado','Expired admin session cannot save');editor.close();
sessionStorage.setItem('adminAutenticado','true');sessionStorage.setItem('adminUsuario','MateCiencias Adm');sessionStorage.setItem('adminTimestamp',String(Date.now()));
}else{
assert(!schedule.querySelector('.week-heading button:not([data-current-time]),button.week-class,[contenteditable]'),page+' timetable is read-only');
assert(schedule.textContent.includes('Curso actualizado')&&schedule.textContent.includes('Docente de prueba'),page+' shows administrator schedule');
}
if(page.startsWith('administracion/')){
nav.querySelector('[data-module="Comunicados"]').click();await delay(400);
const form=doc.querySelector('#comunicadoForm');assert(!!form,'Admin announcement form opens');
const count=JSON.parse(localStorage.getItem('matecienciasNotificaciones')).length;
form.requestSubmit();assert(JSON.parse(localStorage.getItem('matecienciasNotificaciones')).length===count,'Empty announcement blocked');
doc.querySelector('#comunicadoText').value='Texto publicado de prueba';form.requestSubmit();
assert(JSON.parse(localStorage.getItem('matecienciasNotificaciones'))[0].detail==='Texto publicado de prueba','Text-only announcement saved');
const canvas=doc.createElement('canvas');canvas.width=10;canvas.height=10;
const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
const transfer=new DataTransfer();transfer.items.add(new File([blob],'prueba.png',{type:'image/png'}));
doc.querySelector('#comunicadoFile').files=transfer.files;doc.querySelector('#comunicadoFile').dispatchEvent(new Event('change'));for(let attempt=0;attempt<20&&doc.querySelector('#comunicadoPreview').hidden;attempt++)await delay(100);
assert(!doc.querySelector('#comunicadoPreview').hidden,'Image preview works');form.requestSubmit();
assert(JSON.parse(localStorage.getItem('matecienciasNotificaciones'))[0].image.startsWith('data:image/png'),'Image-only announcement saved');
assert(doc.querySelector('.portal-notice img'),'Image renders in home announcements');
}
if(page.startsWith('administracion/')){
for(const [module,content] of [['Admision','#inscripcionesContent'],['Matricula','#matriculaContent']]){
nav.querySelector('[data-module="'+module+'"]').click();await delay(500);
const inner=doc.querySelector('#adminRegistroFrame');assert(!!inner,module+' opens inside right panel');
for(let attempt=0;attempt<20&&!inner.contentDocument?.querySelector(content);attempt++)await delay(100);
assert(!!inner.contentDocument.querySelector(content),module+' opens without second login');
assert(inner.contentWindow.registroAdminIntegrado===true,module+' uses validated embedded administrator session');
assert(frame.contentWindow.location.pathname.endsWith('/administracion/admin-panel.html'),module+' keeps administrator navigation');
const back=inner.contentDocument.querySelector('.admision-actions,.matricula-back');assert(inner.contentWindow.getComputedStyle(back).display==='none',module+' hides standalone navigation');
}
}
const paymentButton=nav.querySelector('[data-module="Pagos"],[data-module="pagos"],[data-view="pagos"]');assert(!!paymentButton,page+' payment menu exists');paymentButton.click();await delay(350);
let history=doc.querySelector('.payment-history');assert(!!history,page+' payment history loads');
if(page.startsWith('administracion/')){
assert(JSON.stringify([...history.querySelector('[aria-label="Filtrar por usuario"]').options].slice(1).map(option=>option.value))===JSON.stringify(frame.contentWindow.UsuarioService.getApprovedAccounts().map(item=>item.name)),'Payment filter lists only usuario.js accounts');
for(const [name,concept,state] of [['Joel Chiroque Chiroque','Pago del docente','pendiente'],['MateCiencias Adm','Pago del alumno','pagado']]){
history.querySelector('[data-add-payment]').click();const dialog=doc.querySelector('.payment-editor'),form=dialog.querySelector('form');
assert(form.elements.student.tagName==='SELECT','Payment user selected from list');form.elements.student.value=name;form.elements.concept.value=concept;form.elements.amount.value='120.50';form.elements.status.value=state;form.elements.status.dispatchEvent(new Event('change'));if(state==='pagado')form.elements.paymentDate.value='2026-09-08';form.requestSubmit();await delay(80);
}
assert(JSON.parse(localStorage.getItem('matecienciasPagos')).length===2,'Admin saves assigned payments');
localStorage.setItem('matecienciasDocentesDetalle',JSON.stringify([{id:'teacher-test',name:'Docente Prueba',email:'prueba@example.com',specialty:'Matemática',areas:'Álgebra'}]));
nav.querySelector('[data-module="MisDocentes"]').click();await delay(250);
doc.querySelector('[data-edit-teacher-detail]').click();assert(doc.querySelector('#teacherDetailName').value==='Docente Prueba','Pencil loads teacher details');
doc.querySelector('#teacherDetailSpecialty').value='Estadística';doc.querySelector('#teacherDetailsForm').requestSubmit();
const teachers=JSON.parse(localStorage.getItem('matecienciasDocentesDetalle'));assert(teachers.length===1&&teachers[0].id==='teacher-test'&&teachers[0].specialty==='Estadística','Teacher edit updates existing record without duplicate');
}else{
assert(!history.querySelector('[data-add-payment],tbody button'),'Reader cannot modify payments despite other role sessions');
const text=history.querySelector('tbody').textContent;
assert(page.startsWith('docentes/')?text.includes('Pago del docente')&&!text.includes('Pago del alumno'):text.includes('Pago del alumno')&&!text.includes('Pago del docente'),page+' sees only own assigned payments');
}
}
for(const module of ['admision','matricula']){
await new Promise(r=>{frame.onload=r;frame.src='/tarjetas/'+module+'/'+module+'.html?panel=admin';setTimeout(r,1500);});await delay(500);
assert(frame.contentWindow.location.pathname.endsWith('/'+module+'-login.html'),module+' direct URL still requires its own login');
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
                '--user-data-dir='+profile,'--virtual-time-budget=45000','--dump-dom',
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
