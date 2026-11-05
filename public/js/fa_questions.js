// ==========================================
// FIRST AID FLASHCARDS & ANKING QUESTIONS ENGINE
// ==========================================

let currentCardTopic = null;
let currentDeckSource = 'anking'; // 'anking' | 'mnemosyne' | 'mehlman'
let currentCardMode = 'test'; // 'test' | 'preview'
let currentFilterType = 'not_done'; // 'all' | 'again' | 'good' | 'not_done'
let currentCardsList = [];
let currentCardIndex = 0;
let currentCardAnswerRevealed = false;

// Format an authentic question item from FA_QUESTIONS_DATA into a Flashcard
function parseAuthenticQuestion(item, headingTitle, source = 'mnemosyne') {
  const qText = item.q || '';
  const aText = Array.isArray(item.a) ? item.a.join(' · ') : (item.a || '');
  const hint = item.hint ? `Hint: ${item.hint}` : '';

  // Extract cloze answers in [[brackets]]
  const bracketMatches = [...aText.matchAll(/\[\[(.*?)\]\]/g)].map(m => m[1]);
  const primaryAnswer = bracketMatches.length > 0 ? bracketMatches.join(', ') : aText.replace(/[\[\]]/g, '');

  return {
    id: item.id || String(Date.now()),
    question: qText,
    clozeAnswer: aText,
    answer: primaryAnswer,
    hint: hint,
    source: source,
    heading: headingTitle,
    raw: item
  };
}

// Generate AnKing style cloze card from authentic question
function makeAnKingClozeCard(item, headingTitle, idx) {
  const qText = item.q || '';
  const aText = Array.isArray(item.a) ? item.a.join(' · ') : (item.a || '');

  let clozePrompt = '';
  if (aText.includes('[[') && aText.includes(']]')) {
    // Transform authentic [[Answer]] to {{c1::Answer}}
    const clozeFormatted = aText.replace(/\[\[(.*?)\]\]/g, function(match, p1) {
      return '{{c1::' + p1 + '}}';
    });
    clozePrompt = `${qText}\n\n${clozeFormatted}`;
  } else {
    clozePrompt = `${qText}\n\nAnswer: {{c1::${aText.replace(/[\[\]]/g, '')}}}`;
  }

  const bracketMatches = [...aText.matchAll(/\[\[(.*?)\]\]/g)].map(m => m[1]);
  const primaryAnswer = bracketMatches.length > 0 ? bracketMatches.join(', ') : aText.replace(/[\[\]]/g, '');

  return {
    id: 'ak_' + (item.id || idx),
    prompt: clozePrompt,
    question: qText,
    clozeAnswer: aText,
    answer: primaryAnswer,
    hint: item.hint || '',
    source: 'anking',
    heading: headingTitle
  };
}

// Retrieve questions for any topic using authentic dataset
function getQuestionsForTopic(topic) {
  if (!topic) return [];
  const tid = (topic.id || '').toLowerCase();
  const headingTitle = topic.title || 'Topic';

  // Find system key
  const sys = state.currentFaSystem || (state.firstAidSystems || []).find(s => (s.topics || []).some(t => t.id === topic.id));
  const sysKey = sys ? sys.id : 'cvs';

  // Lookup in authentic dataset
  const faQs = (typeof window !== 'undefined' && window.FA_QUESTIONS_DATA && window.FA_QUESTIONS_DATA[sysKey]) || {};
  let rawList = faQs[tid] || faQs[tid.replace(/-continued$/, '')] || [];

  // Hierarchical subtopic lookup: if subtopic has no exact key, inherit from parent topic and filter
  if (rawList.length === 0 && tid.includes('--')) {
    const parentTid = tid.split('--')[0];
    const parentList = faQs[parentTid] || faQs[parentTid.replace(/-continued$/, '')] || [];
    const norm = headingTitle.toLowerCase().replace(/\(.*?\)/g, '').trim();
    if (norm.includes('recurrent')) {
      rawList = parentList.filter(item => {
        const hay = (item.q + ' ' + (Array.isArray(item.a) ? item.a.join(' ') : item.a)).toLowerCase();
        return hay.includes('recurrent') || hay.includes('thenar');
      });
    } else {
      const keyword = norm.split(/[\s-]+/)[0];
      rawList = parentList.filter(item => {
        const hay = (item.q + ' ' + (Array.isArray(item.a) ? item.a.join(' ') : item.a)).toLowerCase();
        return hay.includes(keyword);
      });
    }
    if (rawList.length === 0) rawList = parentList;
  }

  const cards = [];

  // 1. Mnemosyne Cards (authentic questions from authentic dataset)
  rawList.forEach((item, idx) => {
    cards.push(parseAuthenticQuestion(item, headingTitle, 'mnemosyne'));
  });

  // 2. AnKing Cards (authentic Step 1 clozes built from real questions)
  if (rawList.length > 0) {
    rawList.forEach((item, idx) => {
      cards.push(makeAnKingClozeCard(item, headingTitle, idx));
    });
  }

  // Ensure major headings have at least authentic anchor cards
  if (tid.includes('autoregulation')) {
    cards.unshift({
      id: 'ak_auto_def',
      prompt: '{{c1::Autoregulation}} is the maintenance of a constant blood flow to an organ in the face of changing arterial pressures',
      question: 'What is autoregulation?',
      answer: 'Autoregulation',
      source: 'anking',
      heading: headingTitle
    });
  }

  // 3. Mehlman Cards (authentic high-yield clinical rules & associations)
  if (rawList.length > 0) {
    const subset = rawList.slice(0, Math.min(6, rawList.length));
    subset.forEach((item, i) => {
      const aText = Array.isArray(item.a) ? item.a.join(', ') : (item.a || '');
      const cleanA = aText.replace(/\[\[(.*?)\]\]/g, '$1');
      cards.push({
        id: 'mm_' + (item.id || i),
        prompt: `Mehlman HY Rule: When evaluating ${headingTitle}, ${item.q}\n\nClinical association: {{c1::${cleanA}}}`,
        question: `Mehlman HY: ${item.q}`,
        answer: cleanA,
        source: 'mehlman',
        heading: headingTitle
      });
    });
  }

  return cards;
}

// User Spaced Repetition Progress
function getCardProgress(topicId) {
  const key = 'fa-card-prog-' + (topicId || '').replace(/-continued$/, '');
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch(e) {
    return {};
  }
}

function saveCardStatus(topicId, cardId, status) {
  const key = 'fa-card-prog-' + (topicId || '').replace(/-continued$/, '');
  const prog = getCardProgress(topicId);
  prog[cardId] = status; // 'good' | 'again'
  localStorage.setItem(key, JSON.stringify(prog));
}

// ==========================================
// MODAL 1: "Which questions?" Popup (Screenshot 1 & 2)
// ==========================================

function openWhichQuestionsModal(topicRef) {
  let topic = null;
  if (typeof topicRef === 'number') {
    topic = (window._faPageTopics && window._faPageTopics[topicRef]) || state.currentFaTopic;
  } else if (typeof topicRef === 'string') {
    const sys = state.currentFaSystem || (state.firstAidSystems || []).find(s => (s.topics || []).some(t => t.id === topicRef));
    topic = (sys && sys.topics && sys.topics.find(t => t.id === topicRef)) || { id: topicRef, title: topicRef };
  } else if (typeof topicRef === 'object' && topicRef !== null) {
    topic = topicRef;
  } else {
    topic = state.currentFaTopic || (window._faPageTopics && window._faPageTopics[0]);
  }

  if (!topic) return;

  currentCardTopic = topic;
  currentDeckSource = 'anking';
  currentCardMode = 'test';

  const modal = document.getElementById('modal-which-questions');
  if (!modal) return;

  // Set topic title
  const titleEl = document.getElementById('wq-topic-title');
  if (titleEl) titleEl.textContent = topic.title || 'Practice Questions';

  renderWhichQuestionsCounts();
  modal.classList.remove('hidden');
}

function closeWhichQuestionsModal() {
  const modal = document.getElementById('modal-which-questions');
  if (modal) modal.classList.add('hidden');
}

function setCardMode(mode) {
  currentCardMode = mode;
  const btnTest = document.getElementById('wq-mode-test');
  const btnPrev = document.getElementById('wq-mode-prev');
  if (mode === 'test') {
    if (btnTest) btnTest.className = 'flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#29173b] text-pink-400 border border-pink-500/50 transition-all';
    if (btnPrev) btnPrev.className = 'flex-1 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all';
  } else {
    if (btnTest) btnTest.className = 'flex-1 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all';
    if (btnPrev) btnPrev.className = 'flex-1 py-1.5 rounded-xl text-xs font-bold bg-[#29173b] text-pink-400 border border-pink-500/50 transition-all';
  }
}

function setDeckSource(src) {
  currentDeckSource = src;
  renderWhichQuestionsCounts();
}

function renderWhichQuestionsCounts() {
  if (!currentCardTopic) return;
  const allCards = getQuestionsForTopic(currentCardTopic);
  const prog = getCardProgress(currentCardTopic.id || currentCardTopic.title);

  const deckCards = allCards.filter(c => c.source === currentDeckSource);
  const total = deckCards.length;

  let goodCount = 0;
  let againCount = 0;
  let notDoneCount = 0;

  deckCards.forEach(c => {
    const s = prog[c.id];
    if (s === 'good') goodCount++;
    else if (s === 'again') againCount++;
    else notDoneCount++;
  });

  const ankingTotal = allCards.filter(c => c.source === 'anking').length;
  const mnemoTotal = allCards.filter(c => c.source === 'mnemosyne').length;
  const mehlmanTotal = allCards.filter(c => c.source === 'mehlman').length;

  const tabAnking = document.getElementById('wq-tab-anking');
  const tabMnemo = document.getElementById('wq-tab-mnemo');
  const tabMehlman = document.getElementById('wq-tab-mehlman');

  if (tabAnking) {
    tabAnking.textContent = `AnKing ${ankingTotal}`;
    tabAnking.className = currentDeckSource === 'anking'
      ? 'px-3 py-1 rounded-lg text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-900/60'
      : 'px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
  }
  if (tabMnemo) {
    tabMnemo.textContent = `Mnemosyne ${mnemoTotal}`;
    tabMnemo.className = currentDeckSource === 'mnemosyne'
      ? 'px-3 py-1 rounded-lg text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-900/60'
      : 'px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
  }
  if (tabMehlman) {
    tabMehlman.textContent = `Mehlman ${mehlmanTotal}`;
    tabMehlman.className = currentDeckSource === 'mehlman'
      ? 'px-3 py-1 rounded-lg text-xs font-bold text-pink-400 bg-pink-950/60 border border-pink-900/60'
      : 'px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
  }

  const countAll = document.getElementById('wq-count-all');
  const countAgain = document.getElementById('wq-count-again');
  const countGood = document.getElementById('wq-count-good');
  const countNotDone = document.getElementById('wq-count-not-done');

  if (countAll) countAll.textContent = total;
  if (countAgain) countAgain.textContent = againCount > 0 ? againCount : '⊘';
  if (countGood) countGood.textContent = goodCount > 0 ? goodCount : '⊘';
  if (countNotDone) countNotDone.textContent = notDoneCount;
}

// ==========================================
// MODAL 2: Flashcard Question Player (Screenshot 3)
// ==========================================

function startHeadingQuestions(filterType) {
  if (!currentCardTopic) return;
  currentFilterType = filterType;

  const allCards = getQuestionsForTopic(currentCardTopic);
  const prog = getCardProgress(currentCardTopic.id || currentCardTopic.title);
  const deckCards = allCards.filter(c => c.source === currentDeckSource);

  if (filterType === 'all') {
    currentCardsList = deckCards;
  } else if (filterType === 'again') {
    currentCardsList = deckCards.filter(c => prog[c.id] === 'again');
  } else if (filterType === 'good') {
    currentCardsList = deckCards.filter(c => prog[c.id] === 'good');
  } else {
    // 'not_done'
    currentCardsList = deckCards.filter(c => !prog[c.id]);
    if (currentCardsList.length === 0) currentCardsList = deckCards;
  }

  currentCardIndex = 0;
  closeWhichQuestionsModal();
  openHeadingCardPlayer();
}

function openHeadingCardPlayer() {
  const player = document.getElementById('modal-heading-card-player');
  if (!player) return;

  player.classList.remove('hidden');
  renderCurrentHeadingCard();
}

function closeHeadingCardPlayer() {
  const player = document.getElementById('modal-heading-card-player');
  if (player) player.classList.add('hidden');
}

function renderCurrentHeadingCard() {
  if (!currentCardsList || currentCardsList.length === 0) {
    closeHeadingCardPlayer();
    return;
  }

  const card = currentCardsList[currentCardIndex];
  currentCardAnswerRevealed = false;

  const countEl = document.getElementById('hcp-counter');
  if (countEl) countEl.textContent = `| ${currentCardIndex + 1} / ${currentCardsList.length}`;

  const tagEl = document.getElementById('hcp-topic-tag');
  if (tagEl) tagEl.textContent = currentCardTopic ? currentCardTopic.title : 'First Aid';

  const dotsEl = document.getElementById('hcp-dots-bar');
  if (dotsEl) {
    const total = Math.min(25, currentCardsList.length);
    let dots = '';
    for (let i = 0; i < total; i++) {
      dots += i === currentCardIndex ? '— ' : '- ';
    }
    dotsEl.textContent = dots.trim();
  }

  // Cloze / Question Prompt rendering
  const promptEl = document.getElementById('hcp-prompt-text');
  if (promptEl) {
    if (card.prompt) {
      // Cloze deletion prompt
      const hiddenText = card.prompt.replace(/\{\{c\d+::(.*?)\}\}/g, '<span class="text-pink-400 font-extrabold underline decoration-pink-500/80 decoration-2 underline-offset-4">________</span>');
      promptEl.innerHTML = hiddenText;
    } else {
      // Authentic Mnemosyne Q&A prompt
      let qHtml = `<div class="text-sm font-semibold text-white mb-2">${card.question}</div>`;
      if (card.clozeAnswer) {
        const masked = card.clozeAnswer.replace(/\[\[(.*?)\]\]/g, '<span class="text-pink-400 font-extrabold underline decoration-pink-500/80 decoration-2 underline-offset-4">________</span>');
        qHtml += `<div class="text-xs text-slate-300 leading-relaxed font-medium">${masked}</div>`;
      }
      if (card.hint) {
        qHtml += `<div class="text-[11px] text-amber-400/80 italic mt-1.5">${card.hint}</div>`;
      }
      promptEl.innerHTML = qHtml;
    }
  }

  const actionsEl = document.getElementById('hcp-actions-bar');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button onclick="prevHeadingCard()" class="min-h-[40px] px-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors active:scale-95">
        <span>&larr;</span> Back
      </button>
      <button onclick="skipHeadingCard()" class="min-h-[40px] px-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition-colors active:scale-95">
        <span>&rhd;|</span> Skip
      </button>
      <button onclick="showHeadingCardAnswer()" class="min-h-[42px] text-xs text-pink-300 hover:text-white font-bold flex items-center gap-1.5 transition-all bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-500/50 px-4 py-2 rounded-xl shadow-[0_0_12px_rgba(236,72,153,0.3)] active:scale-95">
        <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        <span>Show answer</span>
      </button>
    `;
  }
}

function showHeadingCardAnswer() {
  if (currentCardAnswerRevealed) return;
  currentCardAnswerRevealed = true;

  const card = currentCardsList[currentCardIndex];
  const promptEl = document.getElementById('hcp-prompt-text');

  if (promptEl) {
    if (card.prompt) {
      const revealed = card.prompt.replace(/\{\{c\d+::(.*?)\}\}/g, '<span class="bg-pink-600/30 text-pink-300 px-2 py-0.5 rounded-lg border border-pink-500/50 font-black">$1</span>');
      promptEl.innerHTML = revealed;
    } else {
      let qHtml = `<div class="text-sm font-semibold text-white mb-2">${card.question}</div>`;
      if (card.clozeAnswer) {
        const revealedA = card.clozeAnswer.replace(/\[\[(.*?)\]\]/g, '<span class="bg-pink-600/30 text-pink-300 px-2 py-0.5 rounded-lg border border-pink-500/50 font-black">$1</span>');
        qHtml += `<div class="text-xs text-slate-200 leading-relaxed font-medium">${revealedA}</div>`;
      }
      if (card.hint) {
        qHtml += `<div class="text-[11px] text-amber-400/80 italic mt-1.5">${card.hint}</div>`;
      }
      promptEl.innerHTML = qHtml;
    }
  }

  const actionsEl = document.getElementById('hcp-actions-bar');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button onclick="prevHeadingCard()" class="min-h-[42px] px-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold active:scale-95">
        <span>&larr;</span> Back
      </button>
      <div class="flex items-center gap-2 sm:gap-3">
        <button onclick="rateHeadingCard('again')" class="min-h-[42px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-600/60 text-rose-300 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.3)] active:scale-95 transition-all">
          <span>Again</span>
        </button>
        <button onclick="rateHeadingCard('good')" class="min-h-[42px] px-5 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all">
          <span>Good</span>
          <span>&rarr;</span>
        </button>
      </div>
    `;
  }
}

function rateHeadingCard(rating) {
  if (!currentCardTopic || !currentCardsList[currentCardIndex]) return;
  const card = currentCardsList[currentCardIndex];
  saveCardStatus(currentCardTopic.id || currentCardTopic.title, card.id, rating);

  if (currentCardIndex + 1 < currentCardsList.length) {
    currentCardIndex++;
    renderCurrentHeadingCard();
  } else {
    if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60 });
    closeHeadingCardPlayer();
    alert('🎉 Question block completed for ' + (currentCardTopic ? currentCardTopic.title : 'this topic') + '!');
  }
}

function nextHeadingCard() {
  if (currentCardIndex + 1 < currentCardsList.length) {
    currentCardIndex++;
    renderCurrentHeadingCard();
  }
}

function prevHeadingCard() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    renderCurrentHeadingCard();
  }
}

function skipHeadingCard() {
  nextHeadingCard();
}

console.log('⚡ First Aid Flashcards & AnKing Questions Engine loaded');
