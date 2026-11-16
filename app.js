/* ============================================================
   Nexora Digital — lógica de la demo
   Login de demostración: acepta cualquier usuario y contraseña.
   No guarda contraseñas, no procesa pagos y no tiene backend.
   ============================================================ */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var SESSION_KEY = 'nexora.session';
  var PREMIUM_KEY = 'nexora.premium.v1';

  /*
   * Integración futura (no activa en esta demo):
   * Cuando exista un backend, cambia demoMode a false y completa las URLs.
   * - authEndpoint:    POST /api/auth/login
   * - premiumEndpoint: POST /api/premium/access
   * - paymentsEndpoint: POST /api/payments/checkout
   * En producción no guardes tokens ni contraseñas en localStorage.
   */
  var NEXORA_CONFIG = {
    demoMode: true,
    authEndpoint: null,
    premiumEndpoint: null,
    paymentsEndpoint: null
  };

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------ */

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(storage, key, value) {
    try { storage.setItem(key, value); return true; } catch (e) { return false; }
  }

  function safeRemove(storage, key) {
    try { storage.removeItem(key); } catch (e) { /* sin permisos */ }
  }

  function money(value) {
    // Formato argentino: separador de miles con punto y moneda explícita.
    return 'ARS ' + Math.round(value).toLocaleString('de-DE');
  }

  function readSession() {
    var raw = safeGet(localStorage, SESSION_KEY) || safeGet(sessionStorage, SESSION_KEY);
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      return data && data.user ? data : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(user, keep) {
    var payload = JSON.stringify({ user: user, at: Date.now() });
    if (keep) {
      safeSet(localStorage, SESSION_KEY, payload);
      safeRemove(sessionStorage, SESSION_KEY);
    } else {
      safeSet(sessionStorage, SESSION_KEY, payload);
      safeRemove(localStorage, SESSION_KEY);
    }
  }

  function clearSession() {
    safeRemove(localStorage, SESSION_KEY);
    safeRemove(sessionStorage, SESSION_KEY);
  }

  var toastTimer = null;
  function toast(message) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 3400);
  }

  function scrollToTop() {
    var html = document.documentElement;
    var previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }

  /* ------------------------------------------------------------
     Login
     ------------------------------------------------------------ */

  var loginView = $('#loginView');
  var appView = $('#appView');
  var loginForm = $('#loginForm');
  var loginShell = $('#loginShell');
  var loginBtn = $('#loginBtn');
  var loginLabel = $('.btn-label', loginBtn);
  var userInput = $('#user');
  var passInput = $('#pass');
  var errorBox = $('#loginError');
  var togglePass = $('#togglePass');
  var rememberBox = $('#remember');
  var appInitialized = false;

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function shakeLogin() {
    loginShell.classList.remove('is-shaking');
    // Forzar reinicio de la animación
    void loginShell.offsetWidth;
    loginShell.classList.add('is-shaking');
  }

  loginShell.addEventListener('animationend', function (event) {
    if (event.animationName === 'shake') loginShell.classList.remove('is-shaking');
  });

  togglePass.addEventListener('click', function () {
    var showing = passInput.type === 'password';
    passInput.type = showing ? 'text' : 'password';
    togglePass.classList.toggle('is-on', showing);
    togglePass.setAttribute('aria-pressed', String(showing));
    togglePass.setAttribute('aria-label', showing ? 'Ocultar contraseña' : 'Mostrar contraseña');
    passInput.focus();
  });

  userInput.addEventListener('input', hideError);
  passInput.addEventListener('input', hideError);

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var user = userInput.value.trim();
    var pass = passInput.value;

    if (!user || !pass) {
      showError('Escribe un usuario y una contraseña. Puede ser cualquiera, pero no pueden quedar vacíos.');
      shakeLogin();
      if (!user) userInput.focus();
      else passInput.focus();
      return;
    }

    hideError();
    loginBtn.disabled = true;
    loginBtn.classList.add('is-loading');
    loginLabel.textContent = 'Verificando acceso...';

    wait(700).then(function () {
      // Demo: se acepta cualquier combinación no vacía. Aquí iría una llamada real de autenticación.
      saveSession(user, rememberBox.checked);
      loginLabel.textContent = 'Acceso concedido';
      return wait(320);
    }).then(function () {
      loginBtn.disabled = false;
      loginBtn.classList.remove('is-loading');
      loginLabel.textContent = 'Entrar a la demo';
      showApp(user);
      toast('Bienvenido, ' + user + '. Sesión demo iniciada.');
    });
  });

  /* ------------------------------------------------------------
     Cambio de vistas
     ------------------------------------------------------------ */

  function showApp(user) {
    loginView.hidden = true;
    appView.hidden = false;
    document.title = 'Nexora Digital · Soluciones digitales para pymes';

    $('#userName').textContent = user;
    $('#footerUser').textContent = user;
    $('#avatar').textContent = (user.charAt(0) || 'N').toUpperCase();

    scrollToTop();

    if (!appInitialized) {
      appInitialized = true;
      initApp();
    } else {
      // Recalcular animaciones al volver a entrar
      $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  function showLogin() {
    appView.hidden = true;
    loginView.hidden = false;
    document.title = 'Nexora Digital · Acceso demo';

    loginForm.reset();
    rememberBox.checked = true;
    hideError();
    passInput.type = 'password';
    togglePass.classList.remove('is-on');
    togglePass.setAttribute('aria-pressed', 'false');
    togglePass.setAttribute('aria-label', 'Mostrar contraseña');
    scrollToTop();
    setTimeout(function () { userInput.focus(); }, 80);
  }

  $('#logoutBtn').addEventListener('click', function () {
    clearSession();
    showLogin();
    toast('Sesión cerrada. Puedes volver a entrar con cualquier usuario demo.');
  });

  /* ------------------------------------------------------------
     Inicialización del panel
     ------------------------------------------------------------ */

  function initApp() {
    setupReveal();
    setupCounters();
    setupCalculator();
    setupPremiumEstimator();
    setupPremium();
    setupTemplateCopy();
    setupPrint();
  }

  /* ---------- Animación de aparición ---------- */

  function setupReveal() {
    var targets = $$(
      '.section-head, .stats-grid, .step, .important-card, .calc-panel, .calc-results, .hero-copy, .hero-card, .formula-card, .service-card, .premium-card, .premium-block, .kpi-card'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Contadores ---------- */

  function setupCounters() {
    var counters = $$('.stat strong');
    if (!counters.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.count || '0');
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var duration = 1100;
    var start = performance.now();

    function frame(now) {
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString('de-DE') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ---------- Calculadora ---------- */

  function setupCalculator() {
    var clients = $('#calcClients');
    var ticket = $('#calcTicket');
    var retainers = $('#calcRetainers');
    var retainerPrice = $('#calcRetainerPrice');
    var costs = $('#calcCosts');
    if (!clients || !ticket || !retainers || !retainerPrice || !costs) return;

    var clientsVal = $('#clientsVal');
    var ticketVal = $('#ticketVal');
    var retainersVal = $('#retainersVal');
    var retainerPriceVal = $('#retainerPriceVal');
    var costsVal = $('#costsVal');
    var outProjects = $('#outProjects');
    var outMrr = $('#outMrr');
    var outTotal = $('#outTotal');
    var outCosts = $('#outCosts');
    var outProfit = $('#outProfit');
    var outYear = $('#outYear');
    var outBreakEven = $('#outBreakEven');

    function update() {
      var newClients = Number(clients.value);
      var avgTicket = Number(ticket.value);
      var monthlyClients = Number(retainers.value);
      var monthlyPrice = Number(retainerPrice.value);
      var fixedCosts = Number(costs.value);

      var projects = newClients * avgTicket;
      var recurring = monthlyClients * monthlyPrice;
      var total = projects + recurring;
      var profit = total - fixedCosts;
      var year = total * 12;
      var breakEven = monthlyPrice > 0 ? Math.ceil(fixedCosts / monthlyPrice) : 0;

      clientsVal.textContent = String(newClients);
      ticketVal.textContent = money(avgTicket);
      retainersVal.textContent = String(monthlyClients);
      retainerPriceVal.textContent = money(monthlyPrice);
      costsVal.textContent = money(fixedCosts);

      outProjects.textContent = money(projects);
      outMrr.textContent = money(recurring);
      outTotal.textContent = money(total);
      outCosts.textContent = money(fixedCosts);
      outProfit.textContent = money(profit);
      outYear.textContent = money(year);
      outBreakEven.textContent = breakEven + (breakEven === 1 ? ' cliente' : ' clientes');
    }

    [clients, ticket, retainers, retainerPrice, costs].forEach(function (input) {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });

    update();
  }

  /* ---------- Simulador Premium ---------- */

  var PREMIUM_MARGIN = 0.70;

  function setupPremiumEstimator() {
    var retainers = $('#pRetainers');
    var price = $('#pPrice');
    var setup = $('#pSetup');
    var newClients = $('#pNew');
    if (!retainers || !price || !setup || !newClients) return;

    var retainersVal = $('#pRetainersVal');
    var priceVal = $('#pPriceVal');
    var setupVal = $('#pSetupVal');
    var newVal = $('#pNewVal');
    var outMrr = $('#pOutMrr');
    var outSetup = $('#pOutSetup');
    var outTotal = $('#pOutTotal');
    var outYear = $('#pOutYear');
    var outLtv = $('#pOutLtv');
    var outCac = $('#pOutCac');

    function update() {
      var nRetainers = Number(retainers.value);
      var monthly = Number(price.value);
      var fee = Number(setup.value);
      var fresh = Number(newClients.value);

      var mrr = nRetainers * monthly;
      var setupIncome = fresh * fee;
      var total = mrr + setupIncome;
      var year = total * 12;
      var ltv = monthly * 24 * PREMIUM_MARGIN;

      retainersVal.textContent = String(nRetainers);
      priceVal.textContent = money(monthly);
      setupVal.textContent = money(fee);
      newVal.textContent = String(fresh);

      outMrr.textContent = money(mrr);
      outSetup.textContent = money(setupIncome);
      outTotal.textContent = money(total);
      outYear.textContent = money(year);
      outLtv.textContent = money(ltv);
      outCac.textContent = money(ltv / 3);
    }

    [retainers, price, setup, newClients].forEach(function (input) {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });

    update();
  }

  /* ---------- Premium ---------- */

  function isValidEmail(value) {
    return typeof value === 'string' &&
      value.length <= 120 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function readPremium() {
    var raw = safeGet(localStorage, PREMIUM_KEY);
    if (!raw) return null;
    try {
      var data = JSON.parse(raw);
      if (!data || !isValidEmail(data.email)) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function burstConfetti(container) {
    if (!container || reducedMotion) return;

    var colors = ['#f6c56b', '#3ce8c5', '#8b7bff', '#ff7bb6', '#ffffff'];

    for (var i = 0; i < 26; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.background = colors[i % colors.length];
      piece.style.width = (5 + Math.random() * 5) + 'px';
      piece.style.height = (8 + Math.random() * 8) + 'px';
      piece.style.setProperty('--x', Math.round(Math.random() * 180 - 90) + 'px');
      piece.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
      piece.style.animationDelay = Math.round(Math.random() * 180) + 'ms';
      container.appendChild(piece);

      (function (node) {
        setTimeout(function () { node.remove(); }, 2300);
      })(piece);
    }
  }

  function setupPremium() {
    var section = $('#premium');
    var locked = $('#premiumLocked');
    var unlocked = $('#premiumUnlocked');
    var form = $('#premiumForm');
    var emailInput = $('#premiumEmail');
    var errorBox = $('#premiumError');
    var btn = $('#premiumBtn');
    var btnLabel = $('.btn-label', btn);
    var emailOut = $('#premiumEmailOut');
    var changeBtn = $('#changeEmailBtn');
    var printBtn = $('#printPremiumBtn');
    var title = $('#premiumTitle');
    var confettiLayer = $('#confettiLayer');

    if (!section || !locked || !unlocked || !form) return;

    function showError(message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function hideError() {
      errorBox.hidden = true;
      errorBox.textContent = '';
    }

    function showPremium(email, options) {
      options = options || {};
      locked.hidden = true;
      unlocked.hidden = false;
      emailOut.textContent = email;

      if (!options.silent) {
        toast('Guía desbloqueada en este navegador para ' + email + '.');
        setTimeout(function () { burstConfetti(confettiLayer); }, 300);
      }

      if (options.scroll) {
        section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        setTimeout(function () {
          if (title) title.focus({ preventScroll: true });
        }, reducedMotion ? 60 : 420);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var email = emailInput.value.trim();

      if (!email) {
        showError('Escribe un correo electrónico para desbloquear la guía demo.');
        emailInput.focus();
        return;
      }

      if (!isValidEmail(email)) {
        showError('Ese correo no parece válido. Revisa el formato (ejemplo: tu@empresa.com).');
        emailInput.focus();
        return;
      }

      hideError();
      btn.disabled = true;
      btn.classList.add('is-loading');
      btnLabel.textContent = 'Desbloqueando...';

      wait(750).then(function () {
        var stored = safeSet(localStorage, PREMIUM_KEY, JSON.stringify({ email: email, at: Date.now() }));
        btn.disabled = false;
        btn.classList.remove('is-loading');
        btnLabel.textContent = 'Desbloquear la guía';
        showPremium(email, { scroll: true });
        if (!stored) {
          toast('Guía desbloqueada solo para esta visita: el navegador bloqueó el guardado.');
        }
      });
    });

    emailInput.addEventListener('input', hideError);

    changeBtn.addEventListener('click', function () {
      safeRemove(localStorage, PREMIUM_KEY);
      unlocked.hidden = true;
      locked.hidden = false;
      emailInput.value = '';
      hideError();
      section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { emailInput.focus({ preventScroll: true }); }, reducedMotion ? 60 : 420);
      toast('Guía bloqueada. Puedes desbloquearla de nuevo con otro correo.');
    });

    printBtn.addEventListener('click', function () { window.print(); });

    var saved = readPremium();
    if (saved) showPremium(saved.email, { silent: true });
  }

  /* ---------- Copiar plantillas ---------- */

  function setupTemplateCopy() {
    var buttons = $$('.copy-btn[data-copy-target]');
    if (!buttons.length) return;

    function fallbackCopy(text) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-9999px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(area);
      return ok;
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-copy-target'));
        if (!target) return;

        var text = typeof target.value === 'string' ? target.value : target.textContent;
        var original = button.textContent;

        function done(ok) {
          if (ok) {
            button.textContent = 'Copiado';
            toast('Plantilla copiada al portapapeles.');
            setTimeout(function () { button.textContent = original; }, 1800);
          } else {
            toast('No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.');
            if (target.focus) target.focus();
            if (target.select) target.select();
          }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { done(true); },
            function () { done(fallbackCopy(text)); }
          );
        } else {
          done(fallbackCopy(text));
        }
      });
    });
  }

  /* ---------- Imprimir ---------- */

  function setupPrint() {
    var printBtn = $('#printBtn');
    if (!printBtn) return;

    var opened = [];

    printBtn.addEventListener('click', function () { window.print(); });

    window.addEventListener('beforeprint', function () {
      opened = $$('details').filter(function (item) { return !item.open; });
      opened.forEach(function (item) { item.open = true; });
    });

    window.addEventListener('afterprint', function () {
      opened.forEach(function (step) { step.open = false; });
      opened = [];
    });
  }

  /* ------------------------------------------------------------
     Arranque
     ------------------------------------------------------------ */

  var session = readSession();
  if (session) {
    showApp(session.user);
  } else {
    document.title = 'Nexora Digital · Acceso demo';
    loginView.hidden = false;
    appView.hidden = true;
    setTimeout(function () { userInput.focus(); }, 150);
  }

  // Mantener el año del documento coherente si se reutiliza la plantilla.
  window.NexoraDemo = {
    clearSession: clearSession,
    config: NEXORA_CONFIG,
    version: '2.0.0-demo'
  };
})();
