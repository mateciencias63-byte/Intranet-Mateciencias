(() => {
  const $ = id => document.getElementById(id);
  const form = $('inscripcionForm');
  const card = document.querySelector('.inscripcion-card');
  card.hidden = true;
  card.querySelector('h1').textContent = 'Formulario de inscripción';
  card.querySelector('p').textContent = 'Verifica tu información y completa todos los campos obligatorios.';
  const start = document.createElement('section');
  start.className = 'registro-inicio';
  start.innerHTML = `<h1>REGISTRO DE POSTULANTE</h1><form id="registroInicioForm"><label>Tipo de documento :<select id="registroTipo"><option>DNI</option><option>Carné de extranjería</option><option>Pasaporte</option><option>Partida de nacimiento</option><option>Carné de identidad</option><option>Libreta militar</option><option>Boleta militar</option></select></label><label>Documento:<input placeholder="Documento" id="registroDocumento" required maxlength="8" pattern="[0-9]{8}" inputmode="numeric"></label><label>Proceso de admisión :<select id="registroCiclo" required></select></label><div class="registro-pago"><label for="registroTotal">Adjuntar pago :</label><div class="registro-pago-control"><input id="registroTotal" value="S/ 0.00" inputmode="decimal" aria-label="Precio del ciclo en soles"><button type="button" class="registro-button" id="registroPagos">Validar</button></div></div><p id="registroError" class="registro-error" role="status"></p><div class="registro-actions"><button class="registro-button" type="submit">Ir a la ficha</button></div></form>`;
  document.querySelector('main').prepend(start);
  $('registroCiclo').innerHTML = $('inscripcionCiclo').innerHTML;
  $('registroCiclo').options[0].textContent = 'Seleccione un proceso de admisión';
  const payments = [];
  let cyclePriceEdited = false;
  const readCyclePrice = () => Number($('registroTotal').value.replace(/^S\/\s*/i, '').trim().replace(',', '.'));
  $('registroTotal').addEventListener('focus', () => {
    $('registroTotal').value = $('registroTotal').value.replace(/^S\/\s*/i, '');
    $('registroTotal').select();
  });
  $('registroTotal').addEventListener('input', () => {
    cyclePriceEdited = true;
    const value = $('registroTotal').value.replace(/^S\/\s*/i, '').trim();
    const valid = /^\d+(?:[.,]\d{1,2})?$/.test(value) && readCyclePrice() > 0;
    $('registroTotal').setCustomValidity(valid ? '' : 'Ingresa un precio mayor que cero, con hasta dos decimales.');
  });
  $('registroTotal').addEventListener('blur', () => {
    if ($('registroTotal').validity.valid && Number.isFinite(readCyclePrice())) {
      $('registroTotal').value = `S/ ${readCyclePrice().toFixed(2)}`;
    }
  });
  const dialog = document.createElement('dialog');
  dialog.className = 'registro-dialog';
  dialog.innerHTML = `<h2>Datos del pago</h2><p>Agrega cada comprobante y guarda los pagos para continuar. Los pagos quedan pendientes de verificación por Secretaría Académica.</p><form id="registroPagoForm"><div class="registro-grid" id="registroPagoCampos"></div><div class="registro-actions"><button class="registro-button">Agregar pago</button></div></form><p id="registroPagoError" class="registro-error" role="status"></p><table class="registro-table"><thead><tr><th>Tipo</th><th>N.º operación</th><th>Monto</th><th>Fecha</th><th>Opciones</th></tr></thead><tbody id="registroPagoFilas"></tbody></table><p id="registroPagoSuma"></p><div class="registro-actions"><button type="button" class="registro-button secondary" id="registroCerrarPago">Cerrar</button><button type="button" class="registro-button" id="registroGuardarPago">Guardar</button></div>`;
  document.body.append(dialog);
  ['inscripcionMetodo','inscripcionOperacion','inscripcionFechaPago','inscripcionMonto'].forEach(id => $('registroPagoCampos').append($(id).closest('label')));
  dialog.insertBefore(document.querySelector('.inscripcion-qr'), $('registroPagoForm'));
  $('inscripcionMonto').min = '0.01';
  $('inscripcionFechaPago').max = new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  function renderPayments() {
    $('registroPagoFilas').replaceChildren();
    payments.forEach((p,i) => {
      const row = document.createElement('tr');
      [p.metodo,p.operacion,`S/ ${Number(p.monto).toFixed(2)}`,p.fecha].forEach(value=>{const td=document.createElement('td');td.textContent=value;row.append(td);});
      const td=document.createElement('td'),button=document.createElement('button');
      button.type='button';button.textContent='Eliminar';button.className='registro-button secondary';button.setAttribute('aria-label',`Eliminar pago ${p.operacion}`);
      button.onclick=()=>{payments.splice(i,1);renderPayments();};td.append(button);row.append(td);$('registroPagoFilas').append(row);
    });
    const total=payments.reduce((sum,p)=>sum+Math.round(Number(p.monto)*100),0)/100;
    if (!cyclePriceEdited) $('registroTotal').value=`S/ ${total.toFixed(2)}`;
    $('registroPagoSuma').textContent=`Total registrado: S/ ${total.toFixed(2)}`;
    $('inscripcionTotal').textContent=`S/ ${total.toFixed(2)}`;
  }
  $('registroPagoForm').onsubmit=e=>{e.preventDefault();const p={metodo:$('inscripcionMetodo').value,operacion:$('inscripcionOperacion').value.trim(),fecha:$('inscripcionFechaPago').value,monto:$('inscripcionMonto').value};
    if(!p.operacion || payments.some(item=>item.operacion===p.operacion && item.metodo===p.metodo)){ $('registroPagoError').textContent='Ingresa una operación válida que no esté registrada.';return; }
    payments.push(p);$('registroPagoError').textContent='';renderPayments();$('inscripcionOperacion').value='';$('inscripcionMonto').value='';
  };
  $('registroPagos').onclick=()=>{
    if (!$('registroTotal').reportValidity()) return;
    if (cyclePriceEdited && !payments.length) $('inscripcionMonto').value=readCyclePrice().toFixed(2);
    dialog.showModal();
  };
  $('registroCerrarPago').onclick=()=>dialog.close();
  $('registroGuardarPago').onclick=()=>{if(!payments.length){$('registroPagoError').textContent='Agrega al menos un pago.';return;}dialog.close();};
  $('registroTipo').onchange=()=>{const dni=$('registroTipo').value==='DNI';$('registroDocumento').maxLength=dni?8:20;$('registroDocumento').pattern=dni?'[0-9]{8}':'[A-Za-z0-9-]{4,20}';$('registroDocumento').inputMode=dni?'numeric':'text';};
  $('registroInicioForm').onsubmit=e=>{
    e.preventDefault();if(!payments.length){$('registroError').textContent='Registra al menos un pago antes de continuar.';return;}
    const doc=$('registroDocumento').value.trim(),cycle=$('registroCiclo').value;
    const existing=readInscripciones().find(r=>r.dni===doc && (r.tipoDocumento||'DNI')===$('registroTipo').value && r.ciclo===cycle);
    if(existing){$('registroError').textContent='Ya existe una inscripción para este documento y temporada. Consulta a Secretaría Académica.';return;}
    $('inscripcionDni').value=doc;$('inscripcionDni').readOnly=true;$('inscripcionDni').maxLength=20;$('inscripcionDni').pattern=$('registroDocumento').pattern;
    $('inscripcionCiclo').value=cycle;
    const old=readInscripciones().find(r=>r.dni===doc && (r.tipoDocumento||'DNI')===$('registroTipo').value);
    if(old){const map={ApellidoPaterno:'apellidoPaterno',ApellidoMaterno:'apellidoMaterno',Nombres:'nombres',Correo:'correo',FechaNacimiento:'fechaNacimiento',Direccion:'direccion',Ubigeo:'ubigeo',Apoderado:'apoderado',Carrera:'carrera',Universidad:'universidad'};Object.entries(map).forEach(([id,key])=>{if(old[key])$('inscripcion'+id).value=old[key];});$('inscripcionEstudioAnterior').value='Sí';updateAge();}
    start.hidden=true;card.hidden=false;$('inscripcionNombres').focus();
  };
  $('inscripcionCiclo').addEventListener('change',()=>{$('registroCiclo').value=$('inscripcionCiclo').value;});
  $('inscripcionNext').hidden=true;
  $('inscripcionPaymentStep').classList.add('visible');
  $('inscripcionPaymentStep').querySelector('h2').textContent='Resumen de pagos';
  form.querySelector('[type="submit"]').textContent='Enviar inscripción';
  function extra(id,label,options,required=true,type='text') {
    const wrapper=document.createElement('label');wrapper.textContent=label;
    const input=document.createElement(options?'select':'input');input.id=id;input.required=required;input.dataset.registroExtra='true';
    if(options){['',...options].forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value||'Selecciona una opción';input.append(option);});}else input.type=type;
    wrapper.append(input);return wrapper;
  }
  const personal=document.querySelector('.inscripcion-fields-grid');
  personal.append(extra('registroArea','Área',['Ciencias','Letras','Mixta']),extra('registroTurno','Turno',['Mañana','Tarde','Noche']),extra('registroPais','País',null),extra('registroDiscapacidad','Discapacidad',['Sin discapacidad','Física o motora','Visual','Auditiva','Intelectual','Otra']));
  $('registroPais').value='Perú';
  $('inscripcionDni').closest('label').firstChild.textContent='Número de documento';
  $('inscripcionEdad').readOnly=true;
  function updateAge(){const birth=new Date($('inscripcionFechaNacimiento').value+'T00:00:00'),now=new Date();let age=now.getFullYear()-birth.getFullYear();if(now.getMonth()<birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()<birth.getDate()))age--; $('inscripcionEdad').value=Number.isFinite(age)?age:'';}
  $('inscripcionFechaNacimiento').max=$('inscripcionFechaPago').max;$('inscripcionFechaNacimiento').addEventListener('change',updateAge);
  const add=node=>form.insertBefore(node,$('inscripcionNext'));
  const heading=text=>{const h=document.createElement('h2');h.className='inscripcion-section-title';h.textContent=text;add(h);};
  heading('Estudios de educación secundaria');
  add(extra('registroTipoEducacion','Tipo de educación',['Pública','Privada','Extranjera']));add(extra('registroEstudiosConcluidos','Estudios concluidos',['Sí','No, cursando 5.º año','No, cursando 4.º año','No, cursando 3.º año']));
  add(extra('registroInicioEstudios','Año de inicio',null,true,'number'));add(extra('registroFinEstudios','Año de finalización (si corresponde)',null,false,'number'));
  ['registroInicioEstudios','registroFinEstudios'].forEach(id=>{$(id).min='1950';$(id).max=String(new Date().getFullYear()+6);});
  heading('Autoidentificación étnica');add(extra('registroIdentidad','Autoidentificación',['Mestizo','Originario','Afroperuano','Otro','Prefiero no responder']));add(extra('registroComunidad','Comunidad nativa (si corresponde)',null,false));
  heading('Lenguas originarias');add(extra('registroConoceLengua','¿Conoce una lengua originaria del Perú?',['No','Sí']));
  const languages=document.createElement('div');languages.className='registro-wide';languages.hidden=true;
  languages.innerHTML='<div id="registroLenguas"></div><button type="button" class="registro-button" id="registroAgregarLengua">Agregar lengua</button>';add(languages);
  function addLanguage(){const row=document.createElement('div');row.className='registro-grid';row.innerHTML='<label>Lengua originaria<input required placeholder="Nombre de la lengua"></label><label>Dominio<select required><option value="">Selecciona</option><option>Habla</option><option>Lee</option><option>Escribe</option><option>Habla y lee</option><option>Habla y escribe</option><option>Lee y escribe</option><option>Habla, lee y escribe</option></select></label><button type="button" class="registro-button secondary">Eliminar lengua</button>';row.querySelector('button').onclick=()=>row.remove();$('registroLenguas').append(row);}
  $('registroAgregarLengua').onclick=addLanguage;
  $('registroConoceLengua').onchange=()=>{languages.hidden=$('registroConoceLengua').value!=='Sí';if(!languages.hidden&&!$('registroLenguas').children.length)addLanguage();languages.querySelectorAll('input,select').forEach(f=>f.disabled=languages.hidden);};
  heading('Requisitos');add(extra('registroDocumentoArchivo','Adjunta tu documento de identidad (imagen o PDF, máximo 2 MB)',null,true,'file'));$('registroDocumentoArchivo').accept='image/jpeg,image/png,application/pdf';
  let documentData='';$('registroDocumentoArchivo').onchange=()=>{documentData='';const file=$('registroDocumentoArchivo').files[0];$('registroDocumentoArchivo').setCustomValidity('');if(!file)return;if(file.size>2*1024*1024||!['image/jpeg','image/png','application/pdf'].includes(file.type)){$('registroDocumentoArchivo').setCustomValidity('Selecciona una imagen JPG, PNG o PDF de hasta 2 MB.');$('registroDocumentoArchivo').reportValidity();return;}const reader=new FileReader();reader.onload=()=>{if($('registroDocumentoArchivo').files[0]===file)documentData=reader.result;};reader.onerror=()=>showInscripcionError('No se pudo leer el documento adjunto.');reader.readAsDataURL(file);};
  heading('Datos de apoderado');add($('inscripcionApoderado').closest('label'));add($('inscripcionTelefonoApoderado').closest('label'));$('inscripcionApoderado').required=true;$('inscripcionTelefonoApoderado').required=true;
  window.datosRegistroCompleto=()=>({precioCiclo:readCyclePrice(),tipoDocumento:$('registroTipo').value,pagos:payments.map(p=>({...p})),documentoAdjunto:documentData,datosComplementarios:Object.fromEntries([...form.querySelectorAll('[data-registro-extra]')].filter(f=>f.type!=='file').map(f=>[f.id,f.value])),lenguasOriginarias:$('registroConoceLengua').value==='Sí'?[...$('registroLenguas').children].map(row=>({lengua:row.querySelector('input').value,dominio:row.querySelector('select').value})):[]});
  form.addEventListener('submit',e=>{if(!payments.length||!documentData||($('registroConoceLengua').value==='Sí'&&!$('registroLenguas').children.length)){e.preventDefault();e.stopImmediatePropagation();showInscripcionError('Completa los pagos, el documento adjunto y las lenguas indicadas antes de enviar.');return;}
    const first=payments[0];$('inscripcionMetodo').value=first.metodo;$('inscripcionOperacion').value=payments.map(p=>p.operacion).join(', ');$('inscripcionFechaPago').value=first.fecha;$('inscripcionMonto').value=String(payments.reduce((sum,p)=>sum+Math.round(Number(p.monto)*100),0)/100);
  },true);
  renderPayments();
})();

(() => {
  const crop=document.createElement('dialog');crop.className='registro-dialog';
  crop.innerHTML='<h2>Fotografía formal en formato digital</h2><p>Ajusta el encuadre. La fotografía se guardará en formato de 300 × 300 píxeles.</p><canvas width="300" height="300" class="registro-crop"></canvas><label>Ampliación<input id="fotoZoom" type="range" min="1" max="3" step="0.01" value="1"></label><label>Posición horizontal<input id="fotoX" type="range" min="0" max="1" step="0.01" value="0.5"></label><label>Posición vertical<input id="fotoY" type="range" min="0" max="1" step="0.01" value="0.5"></label><div class="registro-actions"><button type="button" class="registro-button secondary" id="fotoCancelar">Cancelar</button><button type="button" class="registro-button" id="fotoGuardar">Recortar y guardar</button></div>';
  document.body.append(crop);let currentImage=null;
  const canvas=crop.querySelector('canvas'),context=canvas.getContext('2d');
  function draw(){if(!currentImage)return;const size=Math.min(currentImage.width,currentImage.height)/Number(document.getElementById('fotoZoom').value);context.drawImage(currentImage,(currentImage.width-size)*Number(document.getElementById('fotoX').value),(currentImage.height-size)*Number(document.getElementById('fotoY').value),size,size,0,0,300,300);}
  crop.querySelectorAll('input').forEach(input=>input.oninput=draw);
  inscripcionFoto.addEventListener('change',event=>{event.stopImmediatePropagation();inscripcionFotoData='';inscripcionFotoLoading=false;inscripcionPhotoPreview.textContent='Selecciona una foto';const file=inscripcionFoto.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){inscripcionFoto.value='';showInscripcionError('Selecciona una foto JPG, PNG o WebP de hasta 10 MB.');return;}
    inscripcionFotoLoading=true;const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);if(inscripcionFoto.files[0]!==file)return;currentImage=img;document.getElementById('fotoZoom').value=1;document.getElementById('fotoX').value=.5;document.getElementById('fotoY').value=.5;draw();crop.showModal();};img.onerror=()=>{URL.revokeObjectURL(url);inscripcionFotoLoading=false;inscripcionFoto.value='';showInscripcionError('No se pudo abrir la fotografía.');};img.src=url;
  },true);
  document.getElementById('fotoGuardar').onclick=()=>{inscripcionFotoData=canvas.toDataURL('image/jpeg',.85);inscripcionFotoLoading=false;const image=new Image();image.src=inscripcionFotoData;image.alt='Fotografía del postulante';inscripcionPhotoPreview.replaceChildren(image);crop.close();};
  function cancel(){inscripcionFotoLoading=false;inscripcionFoto.value='';crop.close();}
  document.getElementById('fotoCancelar').onclick=cancel;crop.addEventListener('cancel',cancel);
})();
