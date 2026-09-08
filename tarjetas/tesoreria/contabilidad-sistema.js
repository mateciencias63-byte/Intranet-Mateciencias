(function () {
  const accountingUser = sessionStorage.getItem('contabilidadUsuario') || '';
  const hasAccountingAccess = window.UsuarioService?.userIsInList?.(
    accountingUser,
    window.tesoreraAutorizados || []
  ) === true;
  if (!hasAccountingAccess) {
    sessionStorage.removeItem('contabilidadUsuario');
    window.location.replace('tarjetas/tesoreria/contabilidad-login.html');
    return;
  }
  const KEY = 'matecienciasPagos';
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[character]);
  const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
  const today = () => new Date().toISOString().slice(0, 10);
  let editingId = null;

  const read = () => { try { const data = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(data) ? data : []; } catch (error) { return []; } };
  const save = (payments) => localStorage.setItem(KEY, JSON.stringify(payments));
  const statusLabel = { pagado:'Pagado', pendiente:'Pendiente', anulado:'Anulado' };

  function filteredPayments() {
    const query = $('paymentSearch').value.trim().toLowerCase();
    const status = $('statusFilter').value;
    const concept = $('conceptFilter').value;
    return read().filter((payment) => {
      const text = [payment.code,payment.student,payment.receipt,payment.detail,payment.concept].join(' ').toLowerCase();
      return (!query || text.includes(query)) && (!status || payment.status === status) && (!concept || payment.concept === concept);
    });
  }

  function renderMetrics(payments) {
    const total = (status) => payments.filter((item) => item.status === status).reduce((sum,item) => sum + Number(item.amount || 0),0);
    $('metricPaid').textContent = money(total('pagado')); $('metricPending').textContent = money(total('pendiente')); $('metricCancelled').textContent = money(total('anulado')); $('metricCount').textContent = payments.length;
  }

  function renderFilters(payments) {
    const selected = $('conceptFilter').value;
    const concepts = [...new Set(payments.map((item) => item.concept).filter(Boolean))].sort();
    $('conceptFilter').innerHTML = '<option value="">Todos los conceptos</option>' + concepts.map((value) => `<option${value === selected ? ' selected' : ''}>${escapeHtml(value)}</option>`).join('');
  }

  function render() {
    const all = read(); renderMetrics(all); renderFilters(all);
    const payments = filteredPayments();
    $('accountingTable').innerHTML = payments.length ? `<div class="accounting-table-wrap"><table class="accounting-table"><thead><tr><th>Código/DNI</th><th>Alumno</th><th>Concepto</th><th>Ciclo</th><th>Monto</th><th>Método</th><th>Comprobante</th><th>Fecha</th><th>Vencimiento</th><th>Estado</th><th>Responsable</th><th>Acciones</th></tr></thead><tbody>${payments.map((payment) => `<tr><td>${escapeHtml(payment.code || '-')}</td><td>${escapeHtml(payment.student)}</td><td>${escapeHtml(payment.concept)}</td><td>${escapeHtml(payment.detail)}</td><td>${money(payment.amount)}</td><td>${escapeHtml(payment.method || '-')}</td><td>${escapeHtml(payment.receipt || '-')}</td><td>${escapeHtml(payment.paymentDate || '-')}</td><td>${escapeHtml(payment.dueDate || '-')}</td><td class="accounting-status ${payment.status === 'pendiente' ? 'pending' : payment.status === 'anulado' ? 'cancelled' : ''}">${statusLabel[payment.status] || payment.status}</td><td>${escapeHtml(payment.registeredBy)}</td><td><div class="accounting-actions"><button class="accounting-edit" data-edit="${payment.id}" type="button">Editar</button><button class="accounting-delete" data-delete="${payment.id}" type="button">X</button></div></td></tr>`).join('')}</tbody></table></div>` : '<p>No hay pagos que coincidan con los filtros.</p>';
    document.querySelectorAll('[data-edit]').forEach((button) => button.onclick = () => startEdit(button.dataset.edit));
    document.querySelectorAll('[data-delete]').forEach((button) => button.onclick = () => removePayment(button.dataset.delete));
  }

  function resetForm() { editingId=null; $('paymentForm').reset(); $('paymentDate').value=today(); $('paymentSubmit').textContent='Registrar pago'; $('cancelEdit').classList.add('hidden'); }
  function startEdit(id) { const item=read().find((payment)=>payment.id===id); if(!item)return; editingId=id; $('paymentCode').value=item.code||''; $('paymentStudent').value=item.student||''; $('paymentConcept').value=item.concept||'Matrícula'; $('paymentDetail').value=item.detail||''; $('paymentAmount').value=item.amount||''; $('paymentMethod').value=item.method||'Efectivo'; $('paymentReceipt').value=item.receipt||''; $('paymentDate').value=item.paymentDate||today(); $('paymentDueDate').value=item.dueDate||''; $('paymentStatus').value=item.status||'pagado'; $('paymentNotes').value=item.notes||''; $('paymentSubmit').textContent='Guardar cambios'; $('cancelEdit').classList.remove('hidden'); scrollTo({top:0,behavior:'smooth'}); }
  function removePayment(id) { if(!confirm('¿Eliminar este registro de pago?'))return; save(read().filter((item)=>item.id!==id)); render(); }

  $('paymentForm').onsubmit = (event) => { event.preventDefault(); const payments=read(); const previous=payments.find((item)=>item.id===editingId); const record={ id:editingId||`pago-${Date.now()}`, code:$('paymentCode').value.trim(), student:$('paymentStudent').value.trim(), concept:$('paymentConcept').value, detail:$('paymentDetail').value.trim(), amount:Number($('paymentAmount').value), method:$('paymentMethod').value, receipt:$('paymentReceipt').value.trim(), paymentDate:$('paymentDate').value, dueDate:$('paymentDueDate').value, status:$('paymentStatus').value, notes:$('paymentNotes').value.trim(), registeredBy:accountingUser, registeredAt:previous?.registeredAt||new Date().toISOString(), updatedAt:new Date().toISOString() }; if(editingId){ const index=payments.findIndex((item)=>item.id===editingId); payments[index]=record; } else payments.unshift(record); save(payments); $('accountingMessage').textContent=editingId?'Pago actualizado correctamente.':'Pago registrado correctamente.'; resetForm(); render(); };
  $('cancelEdit').onclick=resetForm; $('paymentSearch').oninput=render; $('statusFilter').onchange=render; $('conceptFilter').onchange=render;
  $('exportPayments').onclick=()=>{ const rows=filteredPayments(); const header=['Código/DNI','Alumno','Concepto','Ciclo','Monto','Método','Comprobante','Fecha','Vencimiento','Estado','Observación','Responsable']; const csv=[header,...rows.map((p)=>[p.code,p.student,p.concept,p.detail,p.amount,p.method,p.receipt,p.paymentDate,p.dueDate,p.status,p.notes,p.registeredBy])].map((row)=>row.map((cell)=>`"${String(cell??'').replace(/"/g,'""')}"`).join(',')).join('\r\n'); const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`pagos-${today()}.csv`; link.click(); URL.revokeObjectURL(link.href); };
  $('accountingUser').textContent=accountingUser; $('paymentDate').value=today(); render();
})();
