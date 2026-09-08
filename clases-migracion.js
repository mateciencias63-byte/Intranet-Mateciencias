(() => {
  const marker = 'matecienciasClasesSinEjemplos20260908';
  const key = 'matecienciasClasesVirtuales';
  try {
    if (localStorage.getItem(marker)) return;
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(records)) return;
    const names = new Set(['Ciclo Preu Verano 2026 - Ciencias', 'Ciclo Preu Verano 2026 - Medicina', 'Ciclo Preu Verano 2026 - Letras']);
    const filtered = records.filter(item => !(names.has(item.name) && item.url === 'https://meet.google.com/jso-wsie-ndw'));
    if (filtered.length !== records.length) localStorage.setItem(key, JSON.stringify(filtered));
    localStorage.setItem(marker, 'true');
  } catch { /* Keep existing records if storage is unavailable or invalid. */ }
})();
