(() => {
  const RATING_LABELS = {
    1: { text: '1 estrela · Muito insatisfeito', tone: 'is-low' },
    2: { text: '2 estrelas · Insatisfeito', tone: 'is-low' },
    3: { text: '3 estrelas · Pode melhorar', tone: 'is-low' },
    4: { text: '4 estrelas · Muito bom!', tone: 'is-high' },
    5: { text: '5 estrelas · Excelente!', tone: 'is-high' },
  };

  const SCREEN_TAGS = {
    rating: '[ TELA 01 / TRIAGEM INICIAL · COMPONENTE iOS ]',
    feedback: '[ TELA 2A / DESVIO 1–3★ · CANAL PRIVADO ]',
    'feedback-sent': '[ TELA 3A / CONFIRMAÇÃO · SIMULAÇÃO OUTRO LINK ]',
    google: '[ TELA 2B / DESVIO 4–5★ · REDIRECT GOOGLE ]',
  };

  const state = {
    rating: 0,
    reasons: new Set(),
    currentScreen: 'rating',
  };

  // Elementos principais
  const screens = document.querySelectorAll('.app-screen');
  const flowNodes = document.querySelectorAll('.flow-node');
  const screenTagEl = document.getElementById('protoScreenTag');
  const protoLogEl = document.getElementById('protoLog');
  const toastEl = document.getElementById('protoToast');

  // Tela 1
  const starButtons = document.querySelectorAll('.star-btn');
  const ratingFeedbackPill = document.getElementById('ratingFeedbackPill');
  const btnContinueRating = document.getElementById('btnContinueRating');

  // Tela 2A / 3A
  const reasonChips = document.querySelectorAll('.ios-chip');
  const feedbackDetails = document.getElementById('feedbackDetails');
  const feedbackContact = document.getElementById('feedbackContact');
  const btnBackFromFeedback = document.getElementById('btnBackFromFeedback');
  const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
  const btnDoneFeedback = document.getElementById('btnDoneFeedback');
  const summaryStars = document.getElementById('summaryStars');
  const summaryReasons = document.getElementById('summaryReasons');

  // Tela 2B
  const googleStarsBadge = document.getElementById('googleStarsBadge');
  const btnBackFromGoogle = document.getElementById('btnBackFromGoogle');
  const btnOpenGoogle = document.getElementById('btnOpenGoogle');
  const btnGoogleLater = document.getElementById('btnGoogleLater');

  // Controles do Protótipo
  const btnSimLow = document.getElementById('btnSimLow');
  const btnSimHigh = document.getElementById('btnSimHigh');
  const btnReset = document.getElementById('btnReset');
  const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
  const btnExitFullscreen = document.getElementById('btnExitFullscreen');
  const btnClearLog = document.getElementById('btnClearLog');

  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  function addLog(htmlMessage) {
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const item = document.createElement('li');
    item.className = 'proto-log-item';
    item.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${htmlMessage}</span>`;
    protoLogEl.prepend(item);
  }

  function goToScreen(screenName) {
    state.currentScreen = screenName;

    screens.forEach((screen) => {
      screen.classList.toggle('is-active', screen.dataset.screen === screenName);
    });

    flowNodes.forEach((node) => {
      node.classList.toggle('is-active', node.dataset.flow === screenName);
    });

    if (SCREEN_TAGS[screenName]) {
      screenTagEl.textContent = SCREEN_TAGS[screenName];
    }
  }

  function selectRating(value) {
    state.rating = value;

    starButtons.forEach((btn) => {
      const btnValue = Number(btn.dataset.value);
      btn.classList.toggle('is-selected', btnValue <= value);
    });

    const meta = RATING_LABELS[value];
    ratingFeedbackPill.textContent = meta.text;
    ratingFeedbackPill.className = `rating-feedback-pill ${meta.tone}`;
    btnContinueRating.disabled = false;

    const routeHint = value <= 3 ? 'Desvio Privado (1–3★)' : 'Google Avaliações (4–5★)';
    addLog(`Paciente tocou em <strong>${value}★</strong> → Próxima rota: <strong>${routeHint}</strong>.`);
  }

  function proceedFromRating() {
    if (!state.rating) return;

    if (state.rating <= 3) {
      addLog(`Roteado para <strong>Canal Privado (Tela 2A)</strong> — protegido de avaliação pública.`);
      goToScreen('feedback');
    } else {
      googleStarsBadge.textContent = `${state.rating} ★`;
      addLog(`Roteado para <strong>Agradecimento + Google (Tela 2B)</strong>.`);
      goToScreen('google');
    }
  }

  function resetPrototype(silent = false) {
    state.rating = 0;
    state.reasons.clear();

    starButtons.forEach((btn) => btn.classList.remove('is-selected'));
    ratingFeedbackPill.textContent = 'Toque em uma estrela para avaliar';
    ratingFeedbackPill.className = 'rating-feedback-pill';
    btnContinueRating.disabled = true;

    reasonChips.forEach((chip) => chip.classList.remove('is-active'));
    feedbackDetails.value = '';
    feedbackContact.value = '';

    goToScreen('rating');

    if (!silent) {
      addLog('Fluxo reiniciado para a <strong>Tela 01</strong>.');
      showToast('Protótipo reiniciado');
    }
  }

  // Eventos das estrelas
  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectRating(Number(btn.dataset.value));
    });
  });

  btnContinueRating.addEventListener('click', proceedFromRating);

  // Chips de motivo (1-3★)
  reasonChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const reason = chip.dataset.reason;
      if (state.reasons.has(reason)) {
        state.reasons.delete(reason);
        chip.classList.remove('is-active');
      } else {
        state.reasons.add(reason);
        chip.classList.add('is-active');
      }
    });
  });

  btnBackFromFeedback.addEventListener('click', () => {
    addLog('Voltou da Tela 2A para <strong>Tela 01</strong>.');
    goToScreen('rating');
  });

  btnSubmitFeedback.addEventListener('click', () => {
    const selected = Array.from(state.reasons);
    const reasonsText = selected.length > 0 ? selected.join(', ') : 'Não especificado';

    summaryStars.textContent = `${state.rating} ${state.rating === 1 ? 'estrela' : 'estrelas'}`;
    summaryReasons.textContent = reasonsText;

    addLog(`Feedback privado enviado (<strong>${state.rating}★</strong> · Motivos: ${reasonsText}).`);
    goToScreen('feedback-sent');
    showToast('Feedback privado simulado com sucesso');
  });

  btnDoneFeedback.addEventListener('click', () => resetPrototype(false));

  // Eventos Tela Google (4-5★)
  btnBackFromGoogle.addEventListener('click', () => {
    addLog('Voltou da Tela 2B para <strong>Tela 01</strong>.');
    goToScreen('rating');
  });

  btnOpenGoogle.addEventListener('click', () => {
    addLog('Paciente clicou em <strong>Avaliar no Google agora</strong> (g.page/r/CXlOmP9leyaiEBM/review).');
    showToast('Abrindo link oficial do Google Avaliações...');
  });

  btnGoogleLater.addEventListener('click', () => resetPrototype(false));

  // Controles de Simulação do Protótipo
  btnSimLow.addEventListener('click', () => {
    resetPrototype(true);
    selectRating(2);
    proceedFromRating();
    showToast('Simulação: Paciente deu 2★ (Desvio Privado)');
  });

  btnSimHigh.addEventListener('click', () => {
    resetPrototype(true);
    selectRating(5);
    proceedFromRating();
    showToast('Simulação: Paciente deu 5★ (Google)');
  });

  btnReset.addEventListener('click', () => resetPrototype(false));

  function togglePatientMode(forceState) {
    const isFullscreen = typeof forceState === 'boolean'
      ? forceState
      : !document.body.classList.contains('patient-fullscreen');

    document.body.classList.toggle('patient-fullscreen', isFullscreen);
    btnToggleFullscreen.textContent = isFullscreen
      ? 'Voltar ao Modo Protótipo'
      : 'Modo Paciente (Sem Moldura)';
  }

  btnToggleFullscreen.addEventListener('click', () => togglePatientMode());
  btnExitFullscreen.addEventListener('click', () => togglePatientMode(false));

  btnClearLog.addEventListener('click', () => {
    protoLogEl.innerHTML = '';
    addLog('Log limpo.');
  });
})();

