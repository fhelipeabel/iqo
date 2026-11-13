(() => {
  const RATING_LABELS = {
    1: { text: '1 estrela · Muito insatisfeito', tone: 'is-low' },
    2: { text: '2 estrelas · Insatisfeito', tone: 'is-low' },
    3: { text: '3 estrelas · Pode melhorar', tone: 'is-low' },
    4: { text: '4 estrelas · Muito bom!', tone: 'is-high' },
    5: { text: '5 estrelas · Excelente!', tone: 'is-high' },
  };

  const SCREEN_TAGS = {
    rating: '[ TELA 01 · AVALIAÇÃO ]',
    feedback: '[ TELA 2A · DESVIO 1–3★ ]',
    'feedback-sent': '[ TELA 3A · CONFIRMAÇÃO INTERNA ]',
    google: '[ TELA 2B · REDIRECT GOOGLE (4–5★) ]',
  };

  const state = {
    rating: 0,
    reasons: new Set(),
  };

  const screens = document.querySelectorAll('.app-screen');
  const screenTagEl = document.getElementById('protoScreenTag');
  const toastEl = document.getElementById('protoToast');

  // Tela 1
  const starButtons = document.querySelectorAll('.star-btn');
  const ratingFeedbackPill = document.getElementById('ratingFeedbackPill');
  const btnContinueRating = document.getElementById('btnContinueRating');

  // Tela 2A / 3A
  const reasonChips = document.querySelectorAll('.ios-chip');
  const feedbackDetails = document.getElementById('feedbackDetails');
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
  const btnReset = document.getElementById('btnReset');
  const btnToggleFullscreen = document.getElementById('btnToggleFullscreen');
  const btnExitFullscreen = document.getElementById('btnExitFullscreen');

  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2400);
  }

  function goToScreen(screenName) {
    screens.forEach((screen) => {
      screen.classList.toggle('is-active', screen.dataset.screen === screenName);
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
  }

  function proceedFromRating() {
    if (!state.rating) return;

    if (state.rating <= 3) {
      goToScreen('feedback');
    } else {
      googleStarsBadge.textContent = `${state.rating} ★`;
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

    goToScreen('rating');

    if (!silent) {
      showToast('Protótipo reiniciado');
    }
  }

  starButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectRating(Number(btn.dataset.value));
    });
  });

  btnContinueRating.addEventListener('click', proceedFromRating);

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

  btnBackFromFeedback.addEventListener('click', () => goToScreen('rating'));

  btnSubmitFeedback.addEventListener('click', () => {
    const selected = Array.from(state.reasons);
    summaryStars.textContent = `${state.rating}★`;
    summaryReasons.textContent = selected.length > 0 ? selected.join(', ') : 'Geral';
    goToScreen('feedback-sent');
    showToast('Feedback privado simulado');
  });

  btnDoneFeedback.addEventListener('click', () => resetPrototype(false));

  btnBackFromGoogle.addEventListener('click', () => goToScreen('rating'));

  btnOpenGoogle.addEventListener('click', () => {
    showToast('Abrindo Google Avaliações...');
  });

  btnGoogleLater.addEventListener('click', () => resetPrototype(false));

  btnReset.addEventListener('click', () => resetPrototype(false));

  function togglePatientMode(forceState) {
    const isFullscreen = typeof forceState === 'boolean'
      ? forceState
      : !document.body.classList.contains('patient-fullscreen');

    document.body.classList.toggle('patient-fullscreen', isFullscreen);
    btnToggleFullscreen.textContent = isFullscreen ? 'Modo Protótipo' : 'Modo Paciente';
  }

  btnToggleFullscreen.addEventListener('click', () => togglePatientMode());
  btnExitFullscreen.addEventListener('click', () => togglePatientMode(false));
})();
