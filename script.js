document.addEventListener('DOMContentLoaded', () => {
  const currentDateEl = document.getElementById('currentDate');
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const careerSelect = document.getElementById('careerSelect');
  const welcomeBlock = document.getElementById('welcomeBlock');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const cardsGrid = document.getElementById('cardsGrid');
  const authorizedRoom = document.getElementById('authorizedRoom');
  const accountShell = document.getElementById('accountShell');
  const accountName = document.getElementById('accountName');
  const logoutButton = document.getElementById('logoutButton');
  const welcomeCard = document.getElementById('welcomeCard');
  const userWelcome = document.getElementById('userWelcome');
  const passwordWelcome = document.getElementById('passwordWelcome');
  const accessRegistryList = document.getElementById('accessRegistryList');
  const cards = document.querySelectorAll('.panel[data-service]');
  const admisionPanel = document.getElementById('admisionPanel');
  const normalizeName = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();

  const approvedAccounts = UsuarioService.getApprovedAccounts();

  const approvedUsers = new Map(
    approvedAccounts.map((entry) => [normalizeName(entry.name), entry.password])
  );

  const passwordRegex = /^\d{10}$/;

  if (accessRegistryList) {
    accessRegistryList.innerHTML = approvedAccounts
      .map((entry, index) => `<div class="access-item"><span>${index + 1}. ${entry.name}</span><strong>${entry.password}</strong></div>`)
      .join('');
  }

  const generateAvatarWithInitials = (fullName) => {
    // Obtener las iniciales del nombre
    const parts = fullName.trim().toUpperCase().split(/\s+/);
    const initials = parts.length >= 2 
      ? parts[0][0] + parts[parts.length - 1][0]
      : (parts[0] ? parts[0].substring(0, 2) : 'US');
    
    // Generar un color basado en el nombre
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#1e7a42', '#0d8f36', '#16a34a', '#22c55e', '#059669', '#0891b2'];
    const bgColor = colors[Math.abs(hash % colors.length)];
    
    // Crear SVG avatar
    const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="${bgColor}"/>
      <text x="50" y="50" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${initials}</text>
    </svg>`;
    
    return svg;
  };

  const showAuthorizedRoom = (fullName) => {
    if (welcomeBlock) welcomeBlock.classList.add('hidden');
    if (welcomeBanner) welcomeBanner.classList.add('hidden');
    if (cardsGrid) cardsGrid.classList.remove('hidden');
    if (authorizedRoom) authorizedRoom.classList.remove('hidden');
    if (accountShell) accountShell.classList.remove('hidden');
    
    // Mostrar nombre y apellidos
    if (accountName) accountName.textContent = fullName;
    
    // Generar y mostrar avatar con iniciales
    const accountAvatar = document.querySelector('.account-avatar');
    if (accountAvatar) {
      accountAvatar.innerHTML = generateAvatarWithInitials(fullName);
    }

    sessionStorage.setItem('dashboardUser', fullName);
    window.location.assign('dashboard.html');
  };

  const showLoginRoom = () => {
    if (welcomeBlock) welcomeBlock.classList.remove('hidden');
    if (welcomeBanner) welcomeBanner.classList.remove('hidden');
    if (cardsGrid) cardsGrid.classList.remove('hidden');
    if (authorizedRoom) authorizedRoom.classList.add('hidden');
    if (accountShell) accountShell.classList.add('hidden');
    if (welcomeCard) welcomeCard.classList.add('hidden');
  };

  if (loginForm) {
    // Listener en el formulario para submit
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Listener en los inputs para que funcione con Enter
    if (usernameInput) {
      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    }
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    }

    // Listener directo en el botón
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    }
  }

  document.querySelector('.recover-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    alert('Solicita a Secretaría Académica el restablecimiento de tu contraseña.');
  });

  function handleLoginSubmit(event) {
    if (event) event.preventDefault();

    const fullName = (usernameInput.value || '').replace(/\s+/g, ' ').trim();
    const password = (passwordInput.value || '').trim();
    const validName = fullName.split(/\s+/).length >= 2;
    const validPassword = passwordRegex.test(password);

    // Validación del nombre
    if (!fullName) {
      alert('Por favor ingresa tu nombre de usuario');
      return;
    }

    if (!validName) {
      alert('El nombre debe tener al menos 2 palabras (Nombre Apellido)');
      return;
    }

    // Validación de la contraseña
    if (!password) {
      alert('Por favor ingresa tu contraseña');
      return;
    }

    if (!validPassword) {
      alert('La contraseña debe ser exactamente 10 dígitos');
      return;
    }

    // Verificar si el usuario existe
    const normalizedName = normalizeName(fullName);
    const storedPassword = approvedUsers.get(normalizedName);
    if (!storedPassword) {
      alert('Usuario no encontrado. Verifica tu nombre de usuario');
      if (welcomeCard) welcomeCard.classList.add('hidden');
      return;
    }

    // Verificar la contraseña
    if (storedPassword !== password) {
      console.log('Comparación de contraseñas:');
      console.log('Contraseña ingresada:', password, 'Largo:', password.length);
      console.log('Contraseña guardada:', storedPassword, 'Largo:', storedPassword.length);
      alert(`Contraseña incorrecta. Intenta de nuevo.\n\nTu contraseña debe ser: ${storedPassword}`);
      passwordInput.value = '';
      passwordInput.focus();
      return;
    }

    const career = (careerSelect && careerSelect.value) ? careerSelect.value.trim() : '';

    if (career) {
      sessionStorage.setItem('dashboardCareer', career);
    }

    if (userWelcome) userWelcome.textContent = `Usuario: ${fullName}`;
    if (passwordWelcome) passwordWelcome.textContent = `Contraseña: ${password}`;
    if (welcomeCard) welcomeCard.classList.remove('hidden');
    showAuthorizedRoom(fullName);

    usernameInput.value = fullName;
    passwordInput.value = password;
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      showLoginRoom();
      usernameInput.value = '';
      passwordInput.value = '';
      sessionStorage.removeItem('dashboardUser');
      sessionStorage.removeItem('dashboardCareer');
    });
  }

  if (admisionPanel) {
    admisionPanel.addEventListener('click', () => {
      window.location.assign('tarjetas/admision/admision-login.html');
    });
  }

});
