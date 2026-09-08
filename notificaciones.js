(() => {
  const notificationKey = 'matecienciasNotificaciones';
  const style = document.createElement('style');
  style.textContent = '.notifications-panel { margin: 0 0 18px; padding: 18px; border: 1px solid #d6e1eb; border-radius: 9px; background: #fff; } .notifications-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; } .notifications-header h2 { margin: 0; color: #12233f; font-size: 1rem; } .notifications-count { min-width: 24px; padding: 3px 7px; border-radius: 999px; background: #eaf8ef; color: #08652b; font-size: .75rem; font-weight: 700; text-align: center; } .notifications-list { display: grid; gap: 8px; } .notification-item { position:relative; padding:10px 46px 10px 12px; border-left:3px solid #0d8f36; background:#f8fbfc; } .notification-item strong, .notification-item small { display: block; } .notification-item strong { color: #12233f; font-size: .84rem; } .notification-item small { margin-top: 4px; color: #65748b; font-size: .75rem; } .notification-delete { position:absolute; top:50%; right:10px; display:grid; place-items:center; width:26px; height:26px; padding:0; border:0; border-radius:50%; background:#fee2e2; color:#b91c1c; cursor:pointer; font-size:1rem; font-weight:800; line-height:1; transform:translateY(-50%); } .notification-delete:hover { background:#dc2626; color:#fff; } .notifications-empty { margin: 0; color: #65748b; font-size: .82rem; }';
  document.head.appendChild(style);
  const read = () => {
    try {
      const notifications = JSON.parse(localStorage.getItem(notificationKey) || '[]');
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) { return []; }
  };
  const add = ({ title, detail, image = '', author = 'Administrador' }) => {
    const notifications = read();
    notifications.unshift({ id: `notificacion-${Date.now()}-${Math.random().toString(36).slice(2)}`, title, detail, image, author, createdAt: new Date().toISOString() });
    localStorage.setItem(notificationKey, JSON.stringify(notifications.slice(0, 50)));
    window.dispatchEvent(new Event('comunicados-updated'));
  };
  const remove = (id) => {
    const notifications = read().filter((notification) => notification.id !== id);
    localStorage.setItem(notificationKey, JSON.stringify(notifications));
  };
  window.NotificacionesService = { key: notificationKey, read, add, remove };
})();
