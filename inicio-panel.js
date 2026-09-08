(() => {
  const aula = document.querySelector('[data-panel="inicio"]');
  const nav = document.querySelector('.admin-nav,.docente-nav,.aula-nav,.sa-nav');
  const target = aula || document.querySelector('#adminContent') || document.querySelector('.docente-main') || document.querySelector('#saContent');
  if (!target || !nav) return;
  const read = key => { try { const data=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(data)?data:[]; } catch { return []; } };
  const normalize = name => String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
  const svg = (kind='document') => `<svg class="portal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${({bell:'<path d="M5 16V9a7 7 0 0 1 14 0v7l2 3H3zm4 5h6"/>',document:'<path d="M5 2h10l4 4v16H5zm10 0v5h4M8 11h8M8 15h8M8 19h6"/>',book:'<path d="M12 5 3 3v17l9 2 9-2V3l-9 2v17"/>',money:'<rect x="2" y="5" width="20" height="14"/><circle cx="12" cy="12" r="4"/><path d="M2 9h3V5m14 0v4h3M2 15h3v4m14 0v-4h3"/>',person:'<circle cx="12" cy="7" r="5" fill="currentColor"/><path d="M2 24v-3a10 10 0 0 1 20 0v3" fill="currentColor"/>'})[kind]}</svg>`;
  const find = (...keys) => [...nav.querySelectorAll('button')].find(button => keys.some(key => (button.dataset.module||button.dataset.view)===key));
  const open = (...keys) => find(...keys)?.click();
  let home;
  function render() {
    if (!home?.isConnected) { home=document.createElement('section'); home.className='portal-home'; target.prepend(home); }
    const notices=read('matecienciasNotificaciones');
    const options = aula ? [['Mis actividades','document',['tareas']],['Mis evaluaciones','book',['examenes']],['Mis pagos','money',['pagos']]] : [['Actividades','document',['Tareas','tramites','matriculas']],['Calificaciones','book',['PromedioGeneral','notas']],['Asistencias','document',['Asistencia','asistencia']]];
    home.innerHTML=`<article class="portal-card"><header class="portal-bar"><h2>${svg('bell')}Comunicados</h2><button type="button" class="portal-collapse" aria-label="Contraer comunicados" aria-expanded="true">⌃</button></header><div class="portal-notices"></div></article><div class="portal-columns"><div><div class="portal-shortcuts"></div><button type="button" class="portal-green"></button></div><article class="portal-card"><header class="portal-bar"><h2>${aula?'Mis inasistencias':'Resumen de asistencias'}</h2><button type="button" class="portal-detail">Ver detalle</button></header><div class="portal-table-wrap"><table class="portal-table"><thead><tr><th>Curso</th><th>Registros</th><th>Faltas</th><th>% faltas</th></tr></thead><tbody></tbody></table></div></article></div>`;
    const noticesEl=home.querySelector('.portal-notices');
    if(document.querySelector('.admin-main')){
      const create=document.createElement('button');create.type='button';create.className='portal-detail';create.textContent='Publicar comunicado';create.onclick=()=>open('Comunicados');home.querySelector('.portal-bar').insertBefore(create,home.querySelector('.portal-collapse'));
    }
    if (!notices.length) noticesEl.innerHTML='<p class="portal-empty">No hay comunicados publicados.</p>';
    notices.slice(0,3).forEach(item=>{
      const article=document.createElement('article');article.className='portal-notice';
      article.innerHTML=`<header><span class="portal-person">${svg('person')}</span><strong></strong><time></time></header><p></p>`;
      article.querySelector('strong').textContent=item.title||'Comunicado';
      article.querySelector('p').textContent=item.detail||'';
      if (/^data:image\/(png|jpeg|webp);base64,/.test(item.image || '')) {
        const image=document.createElement('img');image.src=item.image;image.alt=item.title||'Imagen del comunicado';image.style.cssText='display:block;max-width:100%;max-height:420px;object-fit:contain;margin-top:14px';article.append(image);
      }
      const date=new Date(item.createdAt); if(!Number.isNaN(date.getTime()))article.querySelector('time').textContent=date.toLocaleString('es-PE');
      noticesEl.append(article);
    });
    home.querySelector('.portal-collapse').onclick=e=>{noticesEl.hidden=!noticesEl.hidden;e.currentTarget.setAttribute('aria-expanded',String(!noticesEl.hidden));e.currentTarget.setAttribute('aria-label',noticesEl.hidden?'Expandir comunicados':'Contraer comunicados');e.currentTarget.textContent=noticesEl.hidden?'⌄':'⌃';};
    options.forEach(([label,icon,keys])=>{if(!find(...keys))return;const button=document.createElement('button');button.type='button';button.className='portal-shortcut';button.innerHTML=svg(icon);button.append(document.createTextNode(label));button.onclick=()=>open(...keys);home.querySelector('.portal-shortcuts').append(button);});
    const green=home.querySelector('.portal-green'),surveys=find('encuestas','Encuestas');
    green.textContent=surveys?'Consultar encuestas  →':'Ver todos los comunicados  →';green.onclick=()=>surveys?surveys.click():open('Comunicados','comunicados','anuncios');
    home.querySelector('.portal-detail').onclick=()=>open('asistencias','Asistencia','asistencia');
    const user=normalize(window.UsuarioService?.getStoredUserName());
    const records=read('matecienciasAsistencias').filter(item=>!aula||normalize(item.student)===user);
    const groups=new Map();records.forEach(item=>{const name=item.className||'Sin curso';const group=groups.get(name)||{total:0,absent:0};group.total++;if(normalize(item.status)==='FALTA')group.absent++;groups.set(name,group);});
    const tbody=home.querySelector('tbody');
    if(!groups.size)tbody.innerHTML='<tr><td colspan="4" class="portal-empty">No hay asistencias registradas.</td></tr>';
    groups.forEach((value,name)=>{const row=document.createElement('tr');[name,value.total,value.absent,`${Math.round(value.absent/value.total*100)}%`].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;row.append(cell);});tbody.append(row);});
    sync();
  }
  function sync() {const active=nav.querySelector('button.active');const initial=(active?.dataset.module||active?.dataset.view||'inicio').toLowerCase()==='inicio';if(home)home.hidden=!initial;target.classList.toggle('portal-showing',initial);}
  render();
  new MutationObserver(()=>{if(!home.isConnected)render();else sync();}).observe(target,{childList:true});
  new MutationObserver(sync).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']});
  window.addEventListener('storage',render);
  window.addEventListener('focus',render);
  window.addEventListener('comunicados-updated',render);
})();
