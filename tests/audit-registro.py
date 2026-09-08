from pathlib import Path
import subprocess
import tempfile
root=Path(__file__).resolve().parents[1]
work=tempfile.TemporaryDirectory(prefix='mateciencias-registro-')
review=Path(work.name)
s=(root/'tarjetas/inscripcion/inscripcion-ciclo.html').read_text(encoding='utf-8').replace('<base href="../../" />','<base href="'+root.as_uri()+'/" />')
s=s.replace('</body>',r'''<pre id="testResult">RUNNING</pre><script>
(async()=>{const results=[];const assert=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};const $=id=>document.getElementById(id);try{
localStorage.removeItem('matecienciasInscripciones');
$('registroDocumento').value='12345678';$('registroCiclo').selectedIndex=1;
$('registroInicioForm').requestSubmit();assert(!$('registroError').textContent.includes('undefined')&&document.querySelector('.inscripcion-card').hidden,'Bloquea ficha sin pagos');
$('inscripcionMetodo').selectedIndex=1;$('inscripcionOperacion').value='TEST-001';$('inscripcionMonto').value='30';$('registroPagoForm').requestSubmit();
$('inscripcionOperacion').value='TEST-002';$('inscripcionMonto').value='20';$('registroPagoForm').requestSubmit();assert($('registroTotal').value==='S/ 50.00','Suma múltiples pagos');
$('registroInicioForm').requestSubmit();assert(!document.querySelector('.inscripcion-card').hidden,'Abre ficha');
const form=$('inscripcionForm');for(const f of form.querySelectorAll('input,select')){if(f.disabled||f.type==='file'||f.closest('#registroLenguas'))continue;if(f.tagName==='SELECT'){if(!f.value)f.selectedIndex=1;}else if(f.type==='date')f.value='2000-01-01';else if(f.type==='number')f.value=f.id.includes('Estudios')?'2015':'26';else if(f.type==='email')f.value='prueba@example.com';else if(f.type==='tel')f.value='999999999';else if(!f.value)f.value='Prueba';}
$('registroDocumentoArchivo').files=(()=>{const d=new DataTransfer();d.items.add(new File(['%PDF-1.4 test'],'test.pdf',{type:'application/pdf'}));return d.files;})();$('registroDocumentoArchivo').dispatchEvent(new Event('change'));
const c=document.createElement('canvas');c.width=300;c.height=300;inscripcionFotoData=c.toDataURL('image/jpeg');$('inscripcionFoto').required=false;
await new Promise(r=>setTimeout(r,100));assert(form.checkValidity(),'Ficha válida');form.requestSubmit();const records=JSON.parse(localStorage.getItem('matecienciasInscripciones')||'[]');assert(records.length===1,'Guarda inscripción');assert(records[0].pagos.length===2&&Number(records[0].monto)===50,'Conserva pagos y monto');assert(records[0].documentoAdjunto.startsWith('data:application/pdf'),'Guarda documento');assert(records[0].datosComplementarios.registroArea,'Guarda campos adicionales');assert($('inscripcionReceipt').classList.contains('visible'),'Muestra confirmación');
$('testResult').textContent='PASS '+JSON.stringify(results);localStorage.removeItem('matecienciasInscripciones');
}catch(e){$('testResult').textContent='FAIL '+e.message;}})();</script></body>''')
p=review/'test.html';p.write_text(s,encoding='utf-8')
r=subprocess.run([r'C:\Program Files\Google\Chrome\Application\chrome.exe','--headless','--no-sandbox','--disable-gpu','--allow-file-access-from-files','--user-data-dir='+str(review/'test-profile'),'--dump-dom','--virtual-time-budget=5000',p.as_uri()],capture_output=True)
import re
out=r.stdout.decode('utf-8',errors='replace')
print(re.findall(r'<pre id="testResult">(.*?)</pre>',out))

if 'PASS [' not in out:
    raise SystemExit(1)
