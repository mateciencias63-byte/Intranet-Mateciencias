(() => {
  const key='matecienciasHorarioSemanal';
  const days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const clockFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'America/Lima',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  const minutes=time=>{const [h,m]=String(time).split(':').map(Number);return h*60+m;};
  const hour=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  const display=time=>{const n=minutes(time),h=Math.floor(n/60);return `${h%12||12}:${String(n%60).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
  const canEdit=()=>Boolean(document.querySelector('.admin-main')&&window.UsuarioService?.isAdminSessionValid());
  function read() {
    const raw=localStorage.getItem(key);
    if(raw!==null){const data=JSON.parse(raw);if(!Array.isArray(data))throw Error('Horario inválido');return data;}
    const legacy=JSON.parse(localStorage.getItem('matecienciasHorario')||'{}');
    return Object.entries(legacy).flatMap(([cell,value])=>{
      const [h,day]=cell.split('-').map(Number);
      if(!String(value).trim()||!Number.isInteger(h)||h<0||h>23||!Number.isInteger(day)||day<0||day>6)return [];
      return [{id:`legacy-${cell}`,course:String(value),teacher:'',day,start:hour(h*60),end:hour(Math.min((h+1)*60,1439))}];
    });
  }
  const valid=item=>item&&Number.isInteger(item.day)&&item.day>=0&&item.day<7&&/^\d{2}:\d{2}$/.test(item.start)&&/^\d{2}:\d{2}$/.test(item.end)&&minutes(item.start)>=0&&minutes(item.end)<=1440&&minutes(item.end)>minutes(item.start);
  function mount(target) {
    if(!target)return;
    target.replaceChildren();
    const root=document.createElement('section');root.className='week-schedule';target.append(root);
    let editor;
    let positioned=false;
    function showCurrentTime() {
      const scroll=root.querySelector('.week-scroll'),line=root.querySelector('.week-now-line');
      if(!scroll?.clientHeight||!line)return;
      const col=line.parentElement;
      scroll.scrollTo({top:Math.max(0,parseFloat(line.style.top)-scroll.clientHeight/2+44),left:Math.max(0,col.offsetLeft-(scroll.clientWidth-col.clientWidth)/2),behavior:'instant'});
      positioned=true;
    }
    function updateClock() {
      if(!root.isConnected)return;
      const parts=Object.fromEntries(clockFormat.formatToParts(new Date()).map(part=>[part.type,part.value]));
      const day=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(parts.weekday);
      const elapsed=Number(parts.hour)*60+Number(parts.minute)+Number(parts.second)/60;
      root.querySelectorAll('.week-day').forEach((col,index)=>{
        col.classList.toggle('today',index===day);
        col.querySelector('.week-now-line')?.remove();
        if(index===day){const line=document.createElement('div');line.className='week-now-line';line.style.top=`${elapsed/60*68}px`;line.setAttribute('role','img');line.setAttribute('aria-label',`Hora actual en Perú: ${parts.hour}:${parts.minute}`);col.append(line);}
      });
      root.querySelectorAll('.week-day-heading').forEach((heading,index)=>heading.classList.toggle('today',index===day+1));
      const clock=root.querySelector('.week-current-time');
      if(clock)clock.textContent=`${days[day]} · ${parts.hour}:${parts.minute} · Hora de Perú`;
      if(!positioned)showCurrentTime();
    }
    function render() {
      if(!root.isConnected)return;
      let events=[],failed=false;
      try{events=read();}catch{failed=true;}
      const editable=canEdit(),items=events.filter(valid);
      root.innerHTML='<header class="week-heading"><div><h2>Horario semanal</h2><p></p></div></header><div class="week-scroll" tabindex="0" aria-label="Horario de lunes a domingo"><div class="week-grid"></div></div><p class="week-message" role="status"></p>';
      positioned=false;
      const nowButton=document.createElement('button');nowButton.type='button';nowButton.className='week-button secondary';nowButton.textContent='Ver hora actual';nowButton.dataset.currentTime='true';nowButton.onclick=showCurrentTime;root.querySelector('header').append(nowButton);
      const clock=document.createElement('p');clock.className='week-current-time';root.querySelector('.week-heading > div').append(clock);
      root.querySelector('.week-heading p').textContent=editable?'Registra el curso, el docente y las horas de cada clase.':'Horario publicado por administración.';
      if(editable&&!failed){const add=document.createElement('button');add.type='button';add.className='week-button';add.textContent='Agregar clase';add.onclick=()=>edit();root.querySelector('header').append(add);}
      const start=0;
      const end=1440;
      const grid=root.querySelector('.week-grid');
      ['Hora',...days].forEach(name=>{const el=document.createElement('div');el.className='week-day-heading';el.textContent=name;grid.append(el);});
      const hours=document.createElement('div');hours.className='week-hours';
      for(let n=start;n<end;n+=60){const el=document.createElement('div');el.className='week-hour';el.textContent=display(hour(n));hours.append(el);}grid.append(hours);
      days.forEach((day,index)=>{
        const col=document.createElement('div');col.className='week-day';col.style.height=`${(end-start)/60*68}px`;
        const entries=items.filter(i=>i.day===index).sort((a,b)=>minutes(a.start)-minutes(b.start));
        const lanes=[];const positioned=entries.map(item=>{let lane=lanes.findIndex(end=>end<=minutes(item.start));if(lane<0)lane=lanes.length;lanes[lane]=minutes(item.end);return {item,lane};});
        positioned.forEach(({item,lane})=>{
          const el=document.createElement(editable?'button':'article');if(editable){el.type='button';el.onclick=()=>edit(item);}
          el.className='week-class';el.style.top=`${(minutes(item.start)-start)/60*68}px`;el.style.height=`${(minutes(item.end)-minutes(item.start))/60*68}px`;
          el.style.width=`calc(${100/lanes.length}% - 8px)`;el.style.left=`calc(${lane*100/lanes.length}% + 4px)`;
          el.title=`${item.course} · ${item.teacher||'Docente por asignar'} · ${display(item.start)} – ${display(item.end)}`;
          [display(item.start)+' – '+display(item.end),item.course,item.teacher||'Docente por asignar'].forEach((text,i)=>{const line=document.createElement(i===1?'strong':'span');line.textContent=text;if(i===2)line.className='week-teacher';el.append(line);});col.append(el);
        });grid.append(col);
      });
      root.querySelector('.week-message').textContent=failed?'No se pudo leer el horario guardado. No se modificaron los datos.':items.length?'':'Todavía no hay clases registradas.';
      updateClock();
    }
    function edit(item) {
      if(!canEdit())return;
      editor?.remove();editor=document.createElement('dialog');editor.className='week-editor';
      editor.innerHTML='<h2></h2><form class="week-form"><label>Curso<input name="course" required maxlength="150"></label><label>Docente<input name="teacher" required maxlength="150"></label><label>Día<select name="day"></select></label><label>Hora de inicio<input name="start" type="time" required></label><label>Hora de fin<input name="end" type="time" required></label><p class="week-error" role="status"></p><div class="week-actions"><button type="button" class="week-button secondary" data-cancel>Cancelar</button><button type="submit" class="week-button">Guardar clase</button></div></form>';
      editor.querySelector('h2').textContent=item?'Editar clase':'Agregar clase';
      const form=editor.querySelector('form'),fields=form.elements,error=editor.querySelector('.week-error');
      days.forEach((day,index)=>{const option=document.createElement('option');option.value=index;option.textContent=day;fields.day.append(option);});
      fields.course.value=item?.course||'';fields.teacher.value=item?.teacher||'';fields.day.value=item?.day??0;fields.start.value=item?.start||'08:00';fields.end.value=item?.end||'09:00';
      function save(remove=false){
        if(!canEdit()){error.textContent='La sesión de administrador terminó. Vuelve a iniciar sesión.';return;}
        const entry={id:item?.id||`clase-${Date.now()}-${Math.random().toString(36).slice(2)}`,course:fields.course.value.trim(),teacher:fields.teacher.value.trim(),day:Number(fields.day.value),start:fields.start.value,end:fields.end.value};
        if(!remove&&(!entry.course||!entry.teacher||!valid(entry))){error.textContent='Completa el curso y docente, y elige una hora final posterior a la inicial.';return;}
        try{const events=read();if(item&&!events.some(e=>e.id===item.id))throw Error('La clase cambió');const next=events.filter(e=>e.id!==entry.id);if(!remove)next.push(entry);localStorage.setItem(key,JSON.stringify(next));}
        catch{error.textContent='No se pudo guardar el horario. Tus datos siguen en el formulario.';return;}
        editor.close();render();window.dispatchEvent(new Event('horario-updated'));
      }
      form.onsubmit=event=>{event.preventDefault();save();};editor.querySelector('[data-cancel]').onclick=()=>editor.close();
      if(item){const remove=document.createElement('button');remove.type='button';remove.className='week-button secondary';remove.textContent='Eliminar clase';remove.onclick=()=>{if(window.confirm('¿Eliminar esta clase del horario?'))save(true);};editor.querySelector('.week-actions').prepend(remove);}
      editor.addEventListener('close',()=>editor.remove());document.body.append(editor);editor.showModal();
    }
    render();
    const dispose=()=>{clearInterval(timer);window.removeEventListener('storage',update);window.removeEventListener('horario-updated',update);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',updateClock);};
    const timer=setInterval(()=>{if(!root.isConnected){dispose();return;}updateClock();},1000);
    const update=()=>{if(!root.isConnected){dispose();return;}render();};
    document.addEventListener('visibilitychange',updateClock);
    window.addEventListener('storage',update);window.addEventListener('horario-updated',update);window.addEventListener('focus',update);
  }
  window.HorarioSemanal={mount};
})();
