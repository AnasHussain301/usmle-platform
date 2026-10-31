// RadMed USMLE Application Logic

let state = {
  currentUser: null,
  token: localStorage.getItem('radmed_token') || null,
  currentView: 'dashboard',
  questions: [],
  currentExam: {
    active: false,
    mode: 'timed', // 'timed' or 'tutor'
    questionList: [],
    currentIndex: 0,
    answers: {},
    timeRemaining: 45 * 60, // 45 minutes
    timerInterval: null
  },
  adminTab: 'activity',
  imageInverted: false,
  showAnnotation: false
};

// ==========================================
// 1. INITIALIZATION & SESSION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await checkSession();
  await loadQuestions();
  navigate('dashboard');
});

async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  const res = await fetch(endpoint, { ...options, headers });
  if (res.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register') {
    // Session expired
    logout();
    return { error: 'Session expired. Please log in.' };
  }
  return res.json();
}

async function checkSession() {
  if (!state.token) {
    renderAuthUI();
    return;
  }
  try {
    const data = await apiFetch('/api/auth/me');
    if (data.user) {
      state.currentUser = data.user;
    } else {
      state.token = null;
      localStorage.removeItem('radmed_token');
    }
  } catch (err) {
    console.error('Session check failed', err);
  }
  renderAuthUI();
}

function renderAuthUI() {
  const container = document.getElementById('auth-container');
  const adminBtn = document.getElementById('nav-btn-admin');
  const mobileAdminBtn = document.getElementById('mobile-nav-admin');
  const upgradeBtn = document.getElementById('upgrade-cta-btn');
  const userTierStat = document.getElementById('stat-user-tier');

  if (state.currentUser) {
    const isPremium = state.currentUser.tier === 'premium' || state.currentUser.role === 'admin';
    const isAdmin = state.currentUser.role === 'admin';

    // Upgrade CTA button logic
    if (upgradeBtn) {
      if (isPremium) {
        upgradeBtn.classList.add('hidden');
      } else {
        upgradeBtn.classList.remove('hidden');
      }
    }

    if (userTierStat) {
      userTierStat.textContent = isPremium ? 'Premium VIP' : 'Free Tier';
      userTierStat.className = isPremium 
        ? 'text-2xl font-black text-amber-500' 
        : 'text-2xl font-black text-slate-900';
    }

    // Admin nav button
    if (isAdmin) {
      adminBtn?.classList.remove('hidden');
      mobileAdminBtn?.classList.remove('hidden');
    } else {
      adminBtn?.classList.add('hidden');
      mobileAdminBtn?.classList.add('hidden');
    }

    // Auth Pill
    container.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors p-1.5 rounded-full cursor-pointer" onclick="toggleUserDropdown(event)">
        <div class="w-8 h-8 rounded-full ${isAdmin ? 'bg-rose-600' : (isPremium ? 'bg-amber-500' : 'bg-sky-600')} text-white flex items-center justify-center font-black text-xs">
          ${(state.currentUser.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="hidden sm:block text-left pr-2">
          <p class="text-xs font-bold text-slate-800 leading-tight">${state.currentUser.name.split(' ')[0]}</p>
          <span class="text-[10px] font-semibold uppercase ${isPremium ? 'text-amber-600' : 'text-slate-500'}">
            ${isPremium ? '⭐ VIP' : 'Free'}
          </span>
        </div>
        <button onclick="logout()" title="Logout" class="p-1 hover:text-rose-600 text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    `;
  } else {
    upgradeBtn?.classList.add('hidden');
    adminBtn?.classList.add('hidden');
    mobileAdminBtn?.classList.add('hidden');
    if (userTierStat) userTierStat.textContent = 'Free';
    container.innerHTML = `
      <button onclick="openLoginModal()" class="px-4 py-2 text-sm font-semibold rounded-xl bg-sky-600 text-white hover:bg-sky-700 shadow-sm transition-all">
        Sign In
      </button>
    `;
  }
}

function logout() {
  state.currentUser = null;
  state.token = null;
  localStorage.removeItem('radmed_token');
  renderAuthUI();
  navigate('dashboard');
  loadQuestions();
}

// ==========================================
// 2. ROUTING & NAVIGATION
// ==========================================

function navigate(viewName) {
  state.currentView = viewName;
  ['dashboard', 'qbank', 'exam', 'admin'].forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Highlight active nav item
  ['dashboard', 'qbank', 'admin'].forEach(v => {
    const btn = document.getElementById(`nav-btn-${v}`);
    if (btn) {
      if (v === viewName) {
        btn.classList.add('text-sky-600', 'bg-sky-50');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
      } else {
        btn.classList.remove('text-sky-600', 'bg-sky-50');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100');
      }
    }
  });

  if (viewName === 'admin') {
    refreshAdminDashboard();
  }
  if (viewName === 'qbank') {
    renderQBankList();
  }
}

// ==========================================
// 3. AUTHENTICATION MODAL LOGIC
// ==========================================

let isRegisterMode = false;

function openLoginModal() {
  isRegisterMode = false;
  document.getElementById('auth-modal-title').textContent = 'Sign in to RadMed';
  document.getElementById('auth-name-container').classList.add('hidden');
  document.getElementById('auth-submit-btn').textContent = 'Sign In';
  document.getElementById('auth-switch-btn').textContent = "Don't have an account? Register here";
  document.getElementById('modal-auth').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('modal-auth').classList.add('hidden');
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    document.getElementById('auth-modal-title').textContent = 'Create Student Account';
    document.getElementById('auth-name-container').classList.remove('hidden');
    document.getElementById('auth-submit-btn').textContent = 'Create Account';
    document.getElementById('auth-switch-btn').textContent = 'Already have an account? Sign In';
  } else {
    openLoginModal();
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value;

  const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
  const payload = isRegisterMode ? { name, email, password } : { email, password };

  const data = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (data.token) {
    state.token = data.token;
    state.currentUser = data.user;
    localStorage.setItem('radmed_token', data.token);
    closeAuthModal();
    renderAuthUI();
    loadQuestions();
  } else {
    alert(data.error || 'Authentication failed.');
  }
}

async function quickDemoLogin(type) {
  let email = 'admin@radmed.local';
  let password = 'Admin123!';

  if (type === 'premium') {
    email = 'sarah.jenkins@usmle.com';
    password = 'Student123!';
  } else if (type === 'free') {
    email = 'michael.chen@usmle.com';
    password = 'Student123!';
  }

  document.getElementById('auth-email').value = email;
  document.getElementById('auth-password').value = password;

  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    state.token = data.token;
    state.currentUser = data.user;
    localStorage.setItem('radmed_token', data.token);
    closeAuthModal();
    renderAuthUI();
    loadQuestions();
  } else {
    alert(data.error || 'Demo login failed.');
  }
}

function openUpgradeModal() {
  document.getElementById('modal-upgrade').classList.remove('hidden');
}

function closeUpgradeModal() {
  document.getElementById('modal-upgrade').classList.add('hidden');
}

async function confirmUpgradeToPremium() {
  if (!state.currentUser) {
    closeUpgradeModal();
    openLoginModal();
    return;
  }
  const res = await apiFetch('/api/auth/upgrade', { method: 'POST' });
  if (res.user) {
    state.currentUser = res.user;
    closeUpgradeModal();
    renderAuthUI();
    loadQuestions();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    alert('Congratulations! Your account is now upgraded to Premium VIP with full access!');
  } else {
    alert(res.error || 'Upgrade failed.');
  }
}

// ==========================================
// 4. QBANK QUESTIONS & LISTING
// ==========================================

async function loadQuestions() {
  try {
    const res = await apiFetch('/api/questions');
    if (res.questions) {
      state.questions = res.questions;
      document.getElementById('stat-total-q').textContent = res.questions.length;
      renderQBankList();
    }
  } catch (err) {
    console.error('Failed to load questions', err);
  }
}

function renderQBankList() {
  const container = document.getElementById('qbank-list-container');
  if (!container) return;

  const systemFilter = document.getElementById('qbank-filter-system').value;
  const tierFilter = document.getElementById('qbank-filter-tier').value;

  const isPremiumUser = state.currentUser && (state.currentUser.tier === 'premium' || state.currentUser.role === 'admin');

  const filtered = state.questions.filter(q => {
    if (systemFilter !== 'all' && q.system !== systemFilter) return false;
    if (tierFilter === 'free' && q.isPremium) return false;
    if (tierFilter === 'premium' && !q.isPremium) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-base font-semibold">No questions match the selected filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(q => {
    const isLocked = q.isPremium && !isPremiumUser;
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              ${q.system}
            </span>
            ${q.isPremium ? `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                ⭐ VIP
              </span>
            ` : `
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                Free
              </span>
            `}
          </div>

          <h3 class="text-base font-bold text-slate-900 line-clamp-1">${q.title}</h3>
          
          <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            ${q.vignette}
          </p>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">${q.discipline}</span>
          ${isLocked ? `
            <button onclick="openUpgradeModal()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              Unlock Case
            </button>
          ` : `
            <button onclick="openQuestionInExam('${q.id}')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm">
              Practice Now &rarr;
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 5. USMLE EXAM PLAYER LOGIC
// ==========================================

function startQuickExam(mode = 'timed') {
  const isPremium = state.currentUser && (state.currentUser.tier === 'premium' || state.currentUser.role === 'admin');
  const available = state.questions.filter(q => isPremium || !q.isPremium);

  if (available.length === 0) {
    alert('Please sign in or unlock Premium to access these cases.');
    return;
  }

  state.currentExam = {
    active: true,
    mode,
    questionList: available.map(q => q.id),
    currentIndex: 0,
    answers: {},
    timeRemaining: mode === 'timed' ? 45 * 60 : 0,
    timerInterval: null
  };

  document.getElementById('exam-mode-badge').textContent = mode === 'timed' ? 'TIMED EXAM' : 'TUTOR MODE';
  document.getElementById('exam-mode-badge').className = mode === 'timed'
    ? 'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500 text-white'
    : 'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500 text-white';

  if (mode === 'timed') {
    startExamTimer();
  } else {
    document.getElementById('exam-timer-container').classList.add('hidden');
  }

  navigate('exam');
  renderExamQuestion();
}

function openQuestionInExam(questionId) {
  state.currentExam = {
    active: true,
    mode: 'tutor',
    questionList: [questionId],
    currentIndex: 0,
    answers: {},
    timeRemaining: 0,
    timerInterval: null
  };
  document.getElementById('exam-mode-badge').textContent = 'PRACTICE TUTOR';
  document.getElementById('exam-timer-container').classList.add('hidden');
  navigate('exam');
  renderExamQuestion();
}

function startExamTimer() {
  clearInterval(state.currentExam.timerInterval);
  document.getElementById('exam-timer-container').classList.remove('hidden');

  state.currentExam.timerInterval = setInterval(() => {
    state.currentExam.timeRemaining--;
    const mins = Math.floor(state.currentExam.timeRemaining / 60);
    const secs = state.currentExam.timeRemaining % 60;
    document.getElementById('exam-timer-display').textContent = 
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (state.currentExam.timeRemaining <= 0) {
      clearInterval(state.currentExam.timerInterval);
      alert('Time is up for this USMLE block!');
      finishExam();
    }
  }, 1000);
}

function renderExamQuestion() {
  const currentQId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === currentQId);
  if (!q) return;

  // Update progress
  document.getElementById('exam-progress-text').textContent = 
    `Question ${state.currentExam.currentIndex + 1} of ${state.currentExam.questionList.length}`;

  document.getElementById('exam-q-system').textContent = q.system;
  document.getElementById('exam-q-difficulty').textContent = `Difficulty: ${q.difficulty}`;
  document.getElementById('exam-q-title').textContent = q.title;
  document.getElementById('exam-q-vignette').textContent = q.vignette;

  // Image & Radiology Viewer
  const imgCard = document.getElementById('exam-image-card');
  const imgEl = document.getElementById('exam-radiology-img');
  const annotationOverlay = document.getElementById('exam-annotation-overlay');

  if (q.imageUrl) {
    imgCard.classList.remove('hidden');
    imgEl.src = q.imageUrl;
    state.imageInverted = false;
    imgEl.classList.remove('xray-inverted');
    if (q.imageAnnotation) {
      annotationOverlay.textContent = q.imageAnnotation;
    }
  } else {
    imgCard.classList.add('hidden');
  }

  // Answer Options
  const optionsContainer = document.getElementById('exam-options-list');
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
  const savedAnswer = state.currentExam.answers[state.currentExam.currentIndex];

  optionsContainer.innerHTML = (q.options || []).map((opt, idx) => {
    const isSelected = savedAnswer === idx;
    return `
      <div onclick="selectExamOption(${idx})" id="opt-card-${idx}" class="p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-start gap-3 ${isSelected ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-bold' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'}">
        <span class="w-6 h-6 rounded-lg ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center text-xs font-bold shrink-0">
          ${alphabet[idx]}
        </span>
        <span class="flex-1 pt-0.5">${opt}</span>
      </div>
    `;
  }).join('');

  // Reset or show explanation
  document.getElementById('exam-explanation-panel').classList.add('hidden');
  document.getElementById('exam-submit-answer-btn').classList.remove('hidden');
}

function selectExamOption(idx) {
  state.currentExam.answers[state.currentExam.currentIndex] = idx;
  const totalOptions = 6;
  for (let i = 0; i < totalOptions; i++) {
    const el = document.getElementById(`opt-card-${i}`);
    if (el) {
      if (i === idx) {
        el.className = 'p-3.5 rounded-xl border text-sm font-bold cursor-pointer transition-all flex items-start gap-3 border-sky-600 bg-sky-50 text-sky-950 shadow-sm';
      } else {
        el.className = 'p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all flex items-start gap-3 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
      }
    }
  }
}

async function submitExamAnswer() {
  const selectedIndex = state.currentExam.answers[state.currentExam.currentIndex];
  if (selectedIndex === undefined) {
    alert('Please select an answer choice.');
    return;
  }

  const currentQId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === currentQId);
  if (!q) return;

  // Check correctness
  const isCorrect = selectedIndex === q.correctIndex;

  // Reveal explanation panel
  const panel = document.getElementById('exam-explanation-panel');
  const banner = document.getElementById('exam-result-banner');
  const explanationText = document.getElementById('exam-explanation-text');
  const pearlText = document.getElementById('exam-pearl-text');

  panel.classList.remove('hidden');
  document.getElementById('exam-submit-answer-btn').classList.add('hidden');

  if (isCorrect) {
    banner.className = 'p-3 rounded-xl text-sm font-bold flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200';
    banner.innerHTML = `
      <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
      <span>Correct! Excellent clinical deduction.</span>
    `;
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  } else {
    banner.className = 'p-3 rounded-xl text-sm font-bold flex items-center gap-2 bg-rose-50 text-rose-800 border border-rose-200';
    banner.innerHTML = `
      <svg class="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
      <span>Incorrect. Correct Answer: (${['A','B','C','D','E'][q.correctIndex]}) ${q.options[q.correctIndex]}</span>
    `;
  }

  explanationText.textContent = q.explanation;
  pearlText.textContent = q.highYieldPearl;

  // Log in backend
  if (state.currentUser) {
    await apiFetch('/api/questions/submit', {
      method: 'POST',
      body: JSON.stringify({
        questionId: q.id,
        selectedIndex,
        timeSpentSeconds: 30
      })
    });
  }
}

function nextExamQuestion() {
  if (state.currentExam.currentIndex < state.currentExam.questionList.length - 1) {
    state.currentExam.currentIndex++;
    renderExamQuestion();
  } else {
    finishExam();
  }
}

async function finishExam() {
  clearInterval(state.currentExam.timerInterval);
  const total = state.currentExam.questionList.length;
  let correct = 0;

  state.currentExam.questionList.forEach((qId, idx) => {
    const q = state.questions.find(item => item.id === qId);
    if (q && state.currentExam.answers[idx] === q.correctIndex) {
      correct++;
    }
  });

  const percentage = Math.round((correct / total) * 100);

  if (state.currentUser) {
    await apiFetch('/api/tests/submit', {
      method: 'POST',
      body: JSON.stringify({
        title: 'USMLE Practice Block',
        mode: state.currentExam.mode,
        questions: state.currentExam.questionList,
        userAnswers: state.currentExam.answers
      })
    });
  }

  alert(`Test Completed!\n\nScore: ${correct} / ${total} (${percentage}%)`);
  navigate('dashboard');
}

function exitExamPrompt() {
  if (confirm('Are you sure you want to exit this examination block?')) {
    clearInterval(state.currentExam.timerInterval);
    navigate('dashboard');
  }
}

// Radiology Image Controls
function toggleImageInvert() {
  const imgEl = document.getElementById('exam-radiology-img');
  state.imageInverted = !state.imageInverted;
  if (state.imageInverted) {
    imgEl.classList.add('xray-inverted');
  } else {
    imgEl.classList.remove('xray-inverted');
  }
}

function toggleImageAnnotation() {
  const overlay = document.getElementById('exam-annotation-overlay');
  overlay.classList.toggle('hidden');
}

// ==========================================
// 6. AI RAD BOT INTEGRATION
// ==========================================

function toggleRadBotDrawer() {
  const drawer = document.getElementById('radbot-drawer');
  drawer.classList.toggle('translate-x-full');
}

async function askRadBotQuick(promptText) {
  const drawer = document.getElementById('radbot-drawer');
  drawer.classList.remove('translate-x-full');
  document.getElementById('radbot-input').value = promptText;
  await sendRadBotMessage(promptText);
}

function askRadBotAboutCurrentCase() {
  const currentQId = state.currentExam.questionList[state.currentExam.currentIndex];
  const q = state.questions.find(item => item.id === currentQId);
  const prompt = `Explain the clinical and radiologic key points for: ${q ? q.title : 'this question'}`;
  askRadBotQuick(prompt);
}

async function handleRadBotSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('radbot-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  await sendRadBotMessage(message);
}

async function sendRadBotMessage(message) {
  const container = document.getElementById('radbot-messages-container');
  
  // Render User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'flex items-start justify-end gap-3';
  userMsgEl.innerHTML = `
    <div class="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] shadow-sm font-medium">
      ${escapeHtml(message)}
    </div>
  `;
  container.appendChild(userMsgEl);

  // Render Bot Loading Skeleton
  const loadingEl = document.createElement('div');
  loadingEl.className = 'flex items-start gap-3';
  loadingEl.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
      AI
    </div>
    <div class="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 italic max-w-[85%]">
      Analyzing clinical findings and imaging features...
    </div>
  `;
  container.appendChild(loadingEl);
  container.scrollTop = container.scrollHeight;

  const activeQId = state.currentExam.active ? state.currentExam.questionList[state.currentExam.currentIndex] : null;

  try {
    const res = await apiFetch('/api/radbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, activeQuestionId: activeQId })
    });

    loadingEl.remove();

    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'flex items-start gap-3';
    botMsgEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md shadow-purple-600/30">
        AI
      </div>
      <div class="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-xs text-slate-800 leading-relaxed shadow-sm max-w-[90%] markdown-body overflow-x-auto">
        ${marked.parse(res.reply || 'No response generated.')}
      </div>
    `;
    container.appendChild(botMsgEl);
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    loadingEl.remove();
    console.error('RadBot error', err);
  }
}

// ==========================================
// 7. ADMIN DASHBOARD & MONITORING
// ==========================================

async function refreshAdminDashboard() {
  if (!state.currentUser || state.currentUser.role !== 'admin') return;

  try {
    const overview = await apiFetch('/api/admin/overview');
    if (overview.metrics) {
      document.getElementById('admin-metric-users').textContent = overview.metrics.totalUsers;
      document.getElementById('admin-metric-active').textContent = overview.metrics.activeToday;
      document.getElementById('admin-metric-premium').textContent = overview.metrics.premiumUsers;
      document.getElementById('admin-metric-questions').textContent = overview.metrics.totalQuestions;
      document.getElementById('admin-metric-radbot').textContent = overview.metrics.radBotInteractions;
    }

    if (state.adminTab === 'activity') {
      await loadAdminActivity();
    } else if (state.adminTab === 'users') {
      await loadAdminUsers();
    } else if (state.adminTab === 'questions') {
      await loadAdminQuestions();
    } else if (state.adminTab === 'radbot') {
      await loadAdminRadBotLogs();
    }
  } catch (err) {
    console.error('Admin refresh error', err);
  }
}

function switchAdminTab(tabName) {
  state.adminTab = tabName;
  ['activity', 'users', 'questions', 'radbot', 'settings'].forEach(t => {
    const el = document.getElementById(`admin-tab-${t}`);
    const btn = document.getElementById(`admin-tab-btn-${t}`);
    if (el) {
      if (t === tabName) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
    if (btn) {
      if (t === tabName) {
        btn.className = 'px-4 py-2.5 border-b-2 border-rose-600 font-bold text-sm text-rose-600 flex items-center gap-1.5 whitespace-nowrap';
      } else {
        btn.className = 'px-4 py-2.5 border-b-2 border-transparent font-medium text-sm text-slate-600 hover:text-slate-900 whitespace-nowrap';
      }
    }
  });

  if (tabName === 'activity') loadAdminActivity();
  if (tabName === 'users') loadAdminUsers();
  if (tabName === 'questions') loadAdminQuestions();
  if (tabName === 'radbot') loadAdminRadBotLogs();
}

async function loadAdminActivity() {
  const res = await apiFetch('/api/admin/activity?limit=50');
  const tbody = document.getElementById('admin-activity-tbody');
  if (!tbody || !res.logs) return;

  tbody.innerHTML = res.logs.map(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3 font-mono text-slate-500">${time}</td>
        <td class="p-3 font-bold text-slate-900">${escapeHtml(log.userName)}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
            ${log.action}
          </span>
        </td>
        <td class="p-3 text-slate-600 font-mono text-[11px] truncate max-w-xs">
          ${JSON.stringify(log.details)}
        </td>
        <td class="p-3 text-slate-500 font-mono">${log.ip || '127.0.0.1'}</td>
      </tr>
    `;
  }).join('');
}

async function loadAdminUsers() {
  const res = await apiFetch('/api/admin/users');
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody || !res.users) return;

  tbody.innerHTML = res.users.map(u => {
    const isPremium = u.tier === 'premium';
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3">
          <p class="font-bold text-slate-900">${escapeHtml(u.name)}</p>
          <p class="text-[11px] text-slate-500">${escapeHtml(u.email)}</p>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}">
            ${u.role}
          </span>
        </td>
        <td class="p-3">
          <button onclick="toggleUserTier('${u.id}', '${u.tier}')" class="px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer ${isPremium ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
            ${isPremium ? '⭐ Premium' : 'Free'}
          </button>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${u.status || 'active'}
          </span>
        </td>
        <td class="p-3 text-slate-500 text-[11px]">
          ${u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
        </td>
        <td class="p-3 space-x-1">
          <button onclick="deleteAdminUser('${u.id}')" class="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 font-bold">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleUserTier(userId, currentTier) {
  const newTier = currentTier === 'premium' ? 'free' : 'premium';
  await apiFetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ tier: newTier })
  });
  loadAdminUsers();
}

async function deleteAdminUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    loadAdminUsers();
  }
}

async function loadAdminQuestions() {
  const tbody = document.getElementById('admin-questions-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.questions.map(q => {
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3">
          <p class="font-bold text-slate-900">${escapeHtml(q.title)}</p>
          <span class="text-[10px] text-sky-600 uppercase font-semibold">${q.system}</span>
        </td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${q.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
            ${q.isPremium ? 'VIP' : 'Free'}
          </span>
        </td>
        <td class="p-3 text-slate-600">${q.difficulty}</td>
        <td class="p-3">${q.imageUrl ? '📸 Yes' : 'No'}</td>
        <td class="p-3">
          <button onclick="deleteAdminQuestion('${q.id}')" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded font-bold">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteAdminQuestion(qId) {
  if (confirm('Delete this question permanently?')) {
    await apiFetch(`/api/admin/questions/${qId}`, { method: 'DELETE' });
    await loadQuestions();
    loadAdminQuestions();
  }
}

async function loadAdminRadBotLogs() {
  const res = await apiFetch('/api/admin/radbot-logs?limit=50');
  const tbody = document.getElementById('admin-radbot-tbody');
  if (!tbody || !res.chats) return;

  tbody.innerHTML = res.chats.map(chat => {
    const time = new Date(chat.timestamp).toLocaleTimeString();
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-3 font-mono text-slate-500">${time}</td>
        <td class="p-3 font-bold text-slate-900">${escapeHtml(chat.userName)}</td>
        <td class="p-3 text-slate-800 font-medium">${escapeHtml(chat.message)}</td>
        <td class="p-3 text-slate-600 text-[11px] truncate max-w-xs">
          ${escapeHtml(chat.response ? chat.response.substring(0, 80) : '')}...
        </td>
      </tr>
    `;
  }).join('');
}

// Bulk Import
function openImportModal() {
  document.getElementById('modal-import').classList.remove('hidden');
}

function closeImportModal() {
  document.getElementById('modal-import').classList.add('hidden');
}

async function executeBulkImport() {
  const raw = document.getElementById('import-json-textarea').value;
  try {
    const parsed = JSON.parse(raw);
    const res = await apiFetch('/api/admin/questions/import', {
      method: 'POST',
      body: JSON.stringify({ questions: parsed })
    });
    if (res.importedCount) {
      alert(`Successfully imported ${res.importedCount} questions!`);
      closeImportModal();
      await loadQuestions();
      loadAdminQuestions();
    } else {
      alert(res.error || 'Import failed.');
    }
  } catch (err) {
    alert('Invalid JSON format: ' + err.message);
  }
}

function exportQuestionsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.questions, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", "radmed_usmle_qbank.json");
  dlAnchorElem.click();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
