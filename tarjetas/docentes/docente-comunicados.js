(() => {
  window.DocenteModules = window.DocenteModules || {};
  function render() {
    const target=document.querySelector('.content-grid');if(!target)return;
    target.innerHTML=`<section class="panel comunicado-panel" style="padding:24px;grid-column:1/-1"><h2>Publicar comunicado</h2><p>Escribe un texto, adjunta una imagen o combina ambos.</p><form id="comunicadoForm" style="display:grid;gap:16px"><label>Título (opcional)<input id="comunicadoTitle" maxlength="150" style="display:block;width:100%;box-sizing:border-box;padding:10px"></label><label>Texto del comunicado<textarea id="comunicadoText" rows="6" maxlength="10000" style="display:block;width:100%;box-sizing:border-box;padding:10px;resize:vertical"></textarea></label><label>Imagen (opcional, JPG, PNG o WebP; máximo 2.5 MB)<input id="comunicadoFile" type="file" accept="image/png,image/jpeg,image/webp" style="display:block;margin-top:8px;max-width:100%"></label><img id="comunicadoPreview" alt="Vista previa del comunicado" hidden style="max-width:100%;max-height:360px;object-fit:contain"><button id="comunicadoRemove" type="button" hidden>Quitar imagen</button><button id="comunicadoPublish" type="submit" style="width:fit-content;padding:12px 18px;border:0;border-radius:6px;background:#0d8f36;color:white;cursor:pointer">Publicar comunicado</button><p id="comunicadoMessage" role="status"></p></form></section>`;
    const form=target.querySelector('form'),fileInput=target.querySelector('#comunicadoFile'),preview=target.querySelector('#comunicadoPreview'),message=target.querySelector('#comunicadoMessage'),publish=target.querySelector('#comunicadoPublish'),remove=target.querySelector('#comunicadoRemove');
    let image='',loading=false,revision=0;
    function clearImage(){revision++;image='';loading=false;fileInput.value='';preview.removeAttribute('src');preview.hidden=true;remove.hidden=true;publish.disabled=false;}
    remove.onclick=clearImage;
    fileInput.onchange=()=>{
      const file=fileInput.files[0];clearImage();if(!file)return;
      if(file.size>2500000||!['image/jpeg','image/png','image/webp'].includes(file.type)){message.textContent='Selecciona una imagen JPG, PNG o WebP de hasta 2.5 MB.';return;}
      const current=revision;loading=true;publish.disabled=true;message.textContent='Cargando imagen…';
      const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{if(current!==revision)return;image=String(reader.result);loading=false;publish.disabled=false;preview.src=image;preview.hidden=false;remove.hidden=false;message.textContent='Imagen lista para publicar.';};img.onerror=()=>{if(current!==revision)return;clearImage();message.textContent='No se pudo abrir la imagen. Selecciona otra.';};img.src=String(reader.result);};reader.onerror=()=>{if(current!==revision)return;clearImage();message.textContent='No se pudo leer la imagen.';};reader.readAsDataURL(file);
    };
    form.onsubmit=event=>{
      event.preventDefault();if(loading)return;
      const detail=form.querySelector('#comunicadoText').value.trim(),title=form.querySelector('#comunicadoTitle').value.trim()||'Comunicado';
      if(!detail&&!image){message.textContent='Escribe un texto o selecciona una imagen antes de publicar.';return;}
      const legacyKey='matecienciasComunicadoImagen';let previous,legacyChanged=false;
      try {
        previous=localStorage.getItem(legacyKey);
        if(image){localStorage.setItem(legacyKey,JSON.stringify({image,name:title,publishedAt:new Date().toISOString()}));legacyChanged=true;}
        if(!window.NotificacionesService)throw new Error('Servicio no disponible');
        window.NotificacionesService.add({title,detail,image,author:document.querySelector('.admin-main')?(sessionStorage.getItem('adminUsuario')||'Administrador'):(sessionStorage.getItem('docenteUser')||'Docente')});
      }catch(error){if(legacyChanged){try{if(previous===null)localStorage.removeItem(legacyKey);else localStorage.setItem(legacyKey,previous);}catch{}}
        message.textContent='No se pudo guardar el comunicado. Prueba con una imagen más pequeña. Tu texto sigue en el formulario.';return;}
      form.reset();clearImage();message.textContent='Comunicado publicado correctamente.';
    };
  }
  window.DocenteModules.Comunicados={name:'Comunicados',render};
})();
