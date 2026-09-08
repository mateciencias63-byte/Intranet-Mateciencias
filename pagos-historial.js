(() => {
  const key='matecienciasPagos';
  const normalize=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();
  const users=()=>[...new Set([...(window.UsuarioService?.getApprovedAccounts()||[]).map(item=>item.name),...(window.docentesAutorizados||[])])];
  function editable(){
    if(document.querySelector('.admin-main'))return window.UsuarioService?.isAdminSessionValid()===true;
    if(document.querySelector('.sa-main'))return window.UsuarioService?.userIsInList(sessionStorage.getItem('secretariaUsuario'),window.secretariaAutorizados||[])===true;
    return false;
  }
  const read=()=>{const data=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(data))throw Error('Datos inválidos');return data;};
  const user=()=>document.querySelector('.docente-main')?sessionStorage.getItem('docenteUser'):window.UsuarioService?.getStoredUserName();
  const actor=()=>document.querySelector('.sa-main')?sessionStorage.getItem('secretariaUsuario'):sessionStorage.getItem('adminUsuario');
  function mount(target){
    if(!target)return;target.replaceChildren();const root=document.createElement('section');root.className='payment-history';target.append(root);
    let page=1,query='',status='',selectedUser='';const size=10;
    function render(){
      if(!root.isConnected)return;let records=[],failed=false;try{records=read();}catch{failed=true;}
      const edit=editable();if(!edit)records=records.filter(item=>normalize(item.student)===normalize(user()));
      const filtered=records.filter(item=>(!selectedUser||normalize(item.student)===normalize(selectedUser))&&(!status||item.status===status)&&normalize([item.student,item.concept,item.detail,item.code,item.receipt].join(' ')).includes(normalize(query)));
      const pages=Math.max(1,Math.ceil(filtered.length/size));page=Math.min(page,pages);
      root.innerHTML='<h2>Historial de Pagos</h2><div class="payment-controls"><input type="search" placeholder="Buscar…" aria-label="Buscar pagos"><select aria-label="Filtrar estado"><option value="">Todos los estados</option><option value="pendiente">Pendientes</option><option value="pagado">Completados</option><option value="anulado">Anulados</option></select></div><p class="payment-count" role="status"></p><div class="payment-table-scroll"><table><thead><tr></tr></thead><tbody></tbody></table></div><div class="payment-pages"></div>';
      const controls=root.querySelector('.payment-controls'),search=controls.querySelector('input'),filter=controls.querySelector('select');search.value=query;filter.value=status;
      search.oninput=()=>{query=search.value;page=1;const position=search.selectionStart;render();const input=root.querySelector('input');input.focus();try{input.setSelectionRange(position,position);}catch{}};
      filter.onchange=()=>{status=filter.value;page=1;render();};
      if(edit){const people=document.createElement('select');people.setAttribute('aria-label','Filtrar por usuario');const all=document.createElement('option');all.value='';all.textContent='Todos los usuarios';people.append(all);[...new Set([...users(),...records.map(item=>item.student).filter(Boolean)])].forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;people.append(option);});people.value=selectedUser;people.onchange=()=>{selectedUser=people.value;page=1;render();};controls.append(people);if(!failed){const add=document.createElement('button');add.type='button';add.dataset.addPayment='true';add.textContent='Asignar pago';add.onclick=()=>editor();controls.append(add);}}
      const headers=[...(edit?['Usuario']:[]),'Tipo','Concepto','Código','Importe','Fecha de pago','Estado','Opciones'];headers.forEach(text=>{const th=document.createElement('th');th.textContent=text;root.querySelector('thead tr').append(th);});
      const first=(page-1)*size,slice=filtered.slice(first,first+size);
      root.querySelector('.payment-count').textContent=failed?'No se pudieron leer los pagos guardados.':`Mostrando ${filtered.length?first+1:0}–${Math.min(first+size,filtered.length)} de ${filtered.length} registros`;
      slice.forEach(item=>{const row=document.createElement('tr');const values=[...(edit?[item.student]:[]),item.type||'Concepto',[item.concept,item.detail].filter(Boolean).join(' · '),item.code||'—',`S/ ${Number(item.amount||0).toFixed(2)}`,item.paymentDate||'—',item.status==='pagado'?'Completado':item.status==='anulado'?'Anulado':'Pendiente'];values.forEach((value,index)=>{const td=document.createElement('td');if(index===(edit?1:0)||index===values.length-1){const span=document.createElement('span');span.className='payment-pill'+(index===values.length-1?(item.status==='pagado'?' paid':' pending'):'');span.textContent=value;td.append(span);}else td.textContent=value;row.append(td);});const td=document.createElement('td');if(edit){const button=document.createElement('button');button.type='button';button.textContent='Editar';button.onclick=()=>editor(item);td.append(button);}else td.textContent='—';row.append(td);root.querySelector('tbody').append(row);});
      if(!slice.length){const row=document.createElement('tr'),td=document.createElement('td');td.colSpan=headers.length;td.textContent=failed?'No se modificaron los datos.':'No hay pagos para mostrar.';row.append(td);root.querySelector('tbody').append(row);}
      const pagination=root.querySelector('.payment-pages');[['«',1,page===1],['‹',page-1,page===1],['›',page+1,page===pages],['»',pages,page===pages]].forEach(([label,next,disabled],i)=>{if(i===2){const number=document.createElement('span');number.textContent=`${page} / ${pages}`;pagination.append(number);}const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=disabled;button.setAttribute('aria-label',['Primera página','Página anterior','Página siguiente','Última página'][i]);button.onclick=()=>{page=next;render();};pagination.append(button);});
    }
    function editor(item){
      if(!editable())return;const dialog=document.createElement('dialog');dialog.className='payment-editor';
      dialog.innerHTML='<h2>Asignar o modificar pago</h2><form><label class="payment-wide">Usuario<select name="student" required><option value="">Selecciona un usuario</option></select></label><label>Tipo<select name="type"><option>Concepto</option><option>Trámites</option><option>Matrícula</option><option>Mensualidad</option></select></label><label>Concepto<input name="concept" required maxlength="150"></label><label>Código<input name="code" maxlength="50"></label><label>Importe (S/)<input name="amount" type="number" min="0.01" step="0.01" required></label><label>Estado<select name="status"><option value="pendiente">Pendiente</option><option value="pagado">Completado</option><option value="anulado">Anulado</option></select></label><label>Fecha de pago<input name="paymentDate" type="date"></label><p class="payment-error payment-wide" role="status"></p><div class="payment-actions payment-wide"><button type="button" class="secondary">Cancelar</button><button type="submit">Guardar pago</button></div></form>';
      const form=dialog.querySelector('form'),fields=form.elements;
      const names=users();if(item?.student&&!names.includes(item.student))names.push(item.student);
      names.forEach(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;fields.student.append(option);});
      for(const name of ['student','concept','code','amount','paymentDate'])fields[name].value=item?.[name]??'';
      fields.type.value=item?.type||'Concepto';fields.status.value=item?.status||'pendiente';
      const dateRequired=()=>{fields.paymentDate.required=fields.status.value==='pagado';};dateRequired();fields.status.onchange=dateRequired;
      dialog.querySelector('button[type="button"]').onclick=()=>dialog.close();
      form.onsubmit=event=>{event.preventDefault();const error=dialog.querySelector('.payment-error');
        if(!editable()){error.textContent='No tienes una sesión autorizada para modificar pagos.';return;}
        if(!names.includes(fields.student.value)||!fields.concept.value.trim()||!Number.isFinite(Number(fields.amount.value))||Number(fields.amount.value)<=0){error.textContent='Selecciona un usuario y completa un concepto e importe válidos.';return;}
        try{const records=read();const index=item?records.findIndex(record=>record.id===item.id):-1;if(item&&index<0)throw Error('El pago cambió');
          const record={...(item?records[index]:{}),id:item?.id||`pago-${Date.now()}-${Math.random().toString(36).slice(2)}`,student:fields.student.value,type:fields.type.value,concept:fields.concept.value.trim(),code:fields.code.value.trim(),amount:Number(fields.amount.value),status:fields.status.value,paymentDate:fields.paymentDate.value,registeredBy:item?.registeredBy||actor(),registeredAt:item?.registeredAt||new Date().toISOString(),updatedBy:actor(),updatedAt:new Date().toISOString()};
          if(item)records[index]=record;else records.unshift(record);localStorage.setItem(key,JSON.stringify(records));
        }catch{error.textContent='No se pudo guardar el pago. Los datos siguen en el formulario.';return;}
        dialog.close();render();window.dispatchEvent(new Event('pagos-updated'));
      };
      dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
    }
    render();const update=()=>{if(!root.isConnected){window.removeEventListener('storage',update);window.removeEventListener('pagos-updated',update);window.removeEventListener('focus',update);return;}render();};window.addEventListener('storage',update);window.addEventListener('pagos-updated',update);window.addEventListener('focus',update);
  }
  window.PagosHistorial={mount};window.DocenteModules=window.DocenteModules||{};window.DocenteModules.Pagos={name:'Pagos',render:()=>mount(document.querySelector('.content-grid'))};
})();
