const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Replace everything from `// ==========================================\n// AI RAD BOT` down to `// ==========================================\n// ADMIN DASHBOARD`
const startMarker = '// ==========================================\n// AI RAD BOT';
const endMarker = '// ==========================================\n// ADMIN DASHBOARD';

const startIndex = content.indexOf('// AI RAD BOT');
if (startIndex === -1) {
  console.error('Could not find start marker!');
  process.exit(1);
}

// Find previous header line
const actualStart = content.lastIndexOf('// ==========================================', startIndex);
const adminIdx = content.indexOf('// ADMIN DASHBOARD');
const actualEnd = content.lastIndexOf('// ==========================================', adminIdx);

if (actualStart === -1 || actualEnd === -1) {
  console.error('Markers not found!', { actualStart, actualEnd });
  process.exit(1);
}

const replacement = `// ==========================================
// AI RAD BOT (Gemini 2.5 with Sessions & 10k-Word / 7-Day History)
// ==========================================

const RADBOT_MAX_WORDS_PER_CHAT = 10000;
const RADBOT_ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
let isRadBotThinking = false;

// Active Chat Session state
let currentRadBotSession = null;

function countWords(txt) {
  if (!txt) return 0;
  return txt.trim().split(/\\s+/).filter(Boolean).length;
}

function initNewRadBotSession() {
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    wordCount: 0,
    messages: []
  };
}

// Retrieve valid sessions (auto-purging chats older than 7 days)
function getSavedRadBotSessions() {
  try {
    const raw = localStorage.getItem('radbot_sessions_v1');
    const sessions = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    // Prune chats older than 1 week (7 days)
    const valid = sessions.filter(s => {
      const ts = s.updatedAt ? new Date(s.updatedAt).getTime() : new Date(s.createdAt || now).getTime();
      return (now - ts) < RADBOT_ONE_WEEK_MS;
    });
    if (valid.length !== sessions.length) {
      localStorage.setItem('radbot_sessions_v1', JSON.stringify(valid));
    }
    return valid;
  } catch (e) {
    return [];
  }
}

// Save a session with a strict 10,000 words limit per chat
function saveRadBotSessionToStorage(session) {
  if (!session || !session.messages || session.messages.length === 0) return;
  try {
    const sessions = getSavedRadBotSessions();

    // Enforce 10,000 words limit by trimming oldest messages if needed
    let totalWords = session.messages.reduce((sum, m) => sum + countWords(m.text || ''), 0);
    while (totalWords > RADBOT_MAX_WORDS_PER_CHAT && session.messages.length > 2) {
      const removed = session.messages.shift();
      totalWords -= countWords(removed.text || '');
    }
    session.wordCount = totalWords;
    session.updatedAt = new Date().toISOString();

    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }

    localStorage.setItem('radbot_sessions_v1', JSON.stringify(sessions));
    updateRadBotHistoryBadge();

    // Background sync to server if available
    try {
      apiFetch('/api/radbot/sessions', {
        method: 'POST',
        body: JSON.stringify(session)
      }).catch(() => {});
    } catch(e) {}
  } catch (e) {
    console.warn('Failed to save RadBot session:', e);
  }
}

function updateRadBotWordCountDisplay() {
  const badge = document.getElementById('radbot-wordcount-badge');
  if (!badge) return;
  const count = currentRadBotSession 
    ? (currentRadBotSession.wordCount || currentRadBotSession.messages.reduce((sum, m) => sum + countWords(m.text || ''), 0))
    : 0;
  badge.textContent = \`\${count.toLocaleString()} / 10k w\`;
  if (count >= RADBOT_MAX_WORDS_PER_CHAT) {
    badge.classList.add('text-pink-400', 'font-bold');
  } else {
    badge.classList.remove('text-pink-400', 'font-bold');
  }
}

function updateRadBotHistoryBadge() {
  const badge = document.getElementById('radbot-history-count-badge');
  if (!badge) return;
  const list = getSavedRadBotSessions();
  badge.textContent = list.length;
}

function toggleRadBotDrawer() {
  const drawer = document.getElementById('radbot-drawer');
  if (!drawer) return;
  drawer.classList.toggle('translate-x-full');
  if (!drawer.classList.contains('translate-x-full')) {
    if (!currentRadBotSession) {
      currentRadBotSession = initNewRadBotSession();
    }
    updateRadBotWordCountDisplay();
    updateRadBotHistoryBadge();
  }
}

// Toggle between Active Chat and History panel
function toggleRadBotHistoryView() {
  const chatView = document.getElementById('radbot-chat-view');
  const historyPanel = document.getElementById('radbot-history-panel');
  if (!chatView || !historyPanel) return;

  const isShowingHistory = !historyPanel.classList.contains('hidden');
  if (isShowingHistory) {
    historyPanel.classList.add('hidden');
    chatView.classList.remove('hidden');
  } else {
    chatView.classList.add('hidden');
    historyPanel.classList.remove('hidden');
    renderRadBotHistoryList();
  }
}

// Render saved sessions in the history panel
function renderRadBotHistoryList() {
  const container = document.getElementById('radbot-history-list');
  if (!container) return;
  const sessions = getSavedRadBotSessions();

  if (sessions.length === 0) {
    container.innerHTML = \`
      <div class="py-12 text-center text-slate-400 text-xs">
        <svg class="w-10 h-10 mx-auto text-purple-400/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="font-medium text-slate-300">No saved conversations yet</p>
        <p class="text-[11px] text-slate-500 mt-1">Start chatting! Conversations are automatically saved for 7 days.</p>
      </div>\`;
    return;
  }

  container.innerHTML = sessions.map(s => {
    const isCurrent = currentRadBotSession && currentRadBotSession.id === s.id;
    const dateStr = formatChatRelativeDate(s.updatedAt || s.createdAt);
    const msgCount = s.messages ? s.messages.length : 0;
    const words = s.wordCount || s.messages.reduce((sum, m) => sum + countWords(m.text || ''), 0);
    const firstSnippet = s.messages && s.messages[0] ? s.messages[0].text : 'No messages';

    return \`
      <div class="p-3 rounded-xl border \${isCurrent ? 'bg-purple-950/60 border-purple-500/60' : 'bg-[#1e142e] border-purple-900/40 hover:border-purple-700/60'} transition-all group">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 cursor-pointer" onclick="loadRadBotSession('\${s.id}')">
            <div class="flex items-center gap-1.5">
              <h4 class="text-xs font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                \${escapeHtml(s.title || 'Untitled Chat')}
              </h4>
              \${isCurrent ? '<span class="text-[9px] bg-green-500/20 text-green-300 px-1 py-0.2 rounded font-bold uppercase">Active</span>' : ''}
            </div>
            <p class="text-[11px] text-slate-400 line-clamp-1 mt-1 font-mono">
              "\${escapeHtml(firstSnippet)}"
            </p>
            <div class="flex items-center gap-2 mt-2 text-[10px] text-purple-300/80">
              <span>\${dateStr}</span>
              <span>&bull;</span>
              <span>\${msgCount} messages</span>
              <span>&bull;</span>
              <span class="font-mono bg-black/30 px-1.5 py-0.2 rounded text-purple-200">\${words.toLocaleString()} words</span>
            </div>
          </div>
          <button onclick="event.stopPropagation(); deleteRadBotSession('\${s.id}')" class="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Delete conversation">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    \`;
  }).join('');
}

function formatChatRelativeDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const diffHours = (now - d) / (1000 * 60 * 60);
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHours < 48) return 'Yesterday ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Load a session from history
function loadRadBotSession(sessionId) {
  // If current session has unsaved changes, save it first
  if (currentRadBotSession && currentRadBotSession.messages && currentRadBotSession.messages.length > 0) {
    saveRadBotSessionToStorage(currentRadBotSession);
  }

  const sessions = getSavedRadBotSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;

  currentRadBotSession = session;

  // Render messages
  const container = document.getElementById('radbot-messages-container');
  if (container) {
    container.innerHTML = '';
    (session.messages || []).forEach(m => {
      if (m.role === 'user') {
        const userEl = document.createElement('div');
        userEl.className = 'flex items-start justify-end gap-2.5';
        userEl.innerHTML = \`<div class="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] font-medium">\${escapeHtml(m.text)}</div>\`;
        container.appendChild(userEl);
      } else {
        const botEl = document.createElement('div');
        botEl.className = 'flex items-start gap-2.5';
        botEl.innerHTML = \`
          <div class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">AI</div>
          <div class="bg-[#241736] p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed max-w-[90%] markdown-body border border-[#3b2554]">
            \${marked.parse(m.text || '')}
          </div>
        \`;
        container.appendChild(botEl);
      }
    });
    container.scrollTop = container.scrollHeight;
  }

  updateRadBotWordCountDisplay();

  // Switch back to Chat View
  const chatView = document.getElementById('radbot-chat-view');
  const historyPanel = document.getElementById('radbot-history-panel');
  if (chatView && historyPanel) {
    historyPanel.classList.add('hidden');
    chatView.classList.remove('hidden');
  }
}

// Delete an individual chat session
function deleteRadBotSession(sessionId) {
  try {
    let sessions = getSavedRadBotSessions();
    sessions = sessions.filter(s => s.id !== sessionId);
    localStorage.setItem('radbot_sessions_v1', JSON.stringify(sessions));

    if (currentRadBotSession && currentRadBotSession.id === sessionId) {
      startNewRadBotChat();
    } else {
      renderRadBotHistoryList();
      updateRadBotHistoryBadge();
    }

    try { apiFetch('/api/radbot/sessions/' + sessionId, { method: 'DELETE' }).catch(() => {}); } catch(e) {}
  } catch (e) {}
}

// Clear all history
function clearAllRadBotHistory() {
  if (!confirm('Are you sure you want to delete all saved chat history?')) return;
  localStorage.removeItem('radbot_sessions_v1');
  startNewRadBotChat();
  renderRadBotHistoryList();
  updateRadBotHistoryBadge();
}

// Clicking "New Chat": saves current chat to history, opens empty new chat session
async function startNewRadBotChat() {
  // 1. Save current session to history if it has messages
  if (currentRadBotSession && currentRadBotSession.messages && currentRadBotSession.messages.length > 0) {
    saveRadBotSessionToStorage(currentRadBotSession);
  }

  // 2. Clear backend session context
  try { await apiFetch('/api/radbot/clear', { method: 'POST' }); } catch(e) {}

  // 3. Create fresh new chat session
  currentRadBotSession = initNewRadBotSession();

  // 4. Reset messages container to welcome prompt
  const container = document.getElementById('radbot-messages-container');
  if (container) {
    container.innerHTML = \`
      <div class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-xs font-bold border border-purple-500/40">AI</div>
        <div class="bg-[#241736] p-3 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed max-w-[88%] markdown-body border border-[#3b2554]">
          <p class="font-bold text-pink-400 mb-1">New conversation started 🩺</p>
          <p>I am <strong>RadBot</strong>, your USMLE AI assistant powered by <strong>Gemini 2.5</strong>. What would you like to study?</p>
        </div>
      </div>\`;
  }

  // 5. Reset inputs & badges
  updateRadBotWordCountDisplay();
  updateRadBotHistoryBadge();

  // 6. Make sure Chat View is showing
  const chatView = document.getElementById('radbot-chat-view');
  const historyPanel = document.getElementById('radbot-history-panel');
  if (chatView && historyPanel) {
    historyPanel.classList.add('hidden');
    chatView.classList.remove('hidden');
  }

  const input = document.getElementById('radbot-input');
  if (input) input.focus();
}

// Backwards-compatible alias for header button
function clearRadBotChat() {
  startNewRadBotChat();
}

async function askRadBotQuick(text) {
  const drawer = document.getElementById('radbot-drawer');
  if (drawer) drawer.classList.remove('translate-x-full');

  // Ensure chat view is active
  const chatView = document.getElementById('radbot-chat-view');
  const historyPanel = document.getElementById('radbot-history-panel');
  if (chatView && historyPanel) {
    historyPanel.classList.add('hidden');
    chatView.classList.remove('hidden');
  }

  const input = document.getElementById('radbot-input');
  if (input) input.value = text;
  await sendRadBotMessage(text);
}

function askRadBotAboutCurrentCase() {
  const qId = state.currentExam && state.currentExam.questionList ? state.currentExam.questionList[state.currentExam.currentIndex] : null;
  const q = state.questions ? state.questions.find(item => item.id === qId) : null;
  askRadBotQuick(\`Explain the clinical and radiologic key points for: \${q ? q.title : 'this case'}\`);
}

async function handleRadBotSubmit(e) {
  e.preventDefault();
  if (isRadBotThinking) return; // Prevent multiple requests while AI is processing
  const input = document.getElementById('radbot-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  await sendRadBotMessage(message);
}

// Send message with disabled send button, spinner, and session word tracking
async function sendRadBotMessage(message) {
  if (isRadBotThinking) return;

  if (!currentRadBotSession) {
    currentRadBotSession = initNewRadBotSession();
  }

  const sendBtn = document.getElementById('radbot-send-btn');
  const sendBtnText = document.getElementById('radbot-send-btn-text');
  const sendSpinner = document.getElementById('radbot-send-btn-spinner');
  const input = document.getElementById('radbot-input');

  // 1. DISABLE SEND BUTTON & INPUT TO PREVENT MULTIPLE REQUESTS
  isRadBotThinking = true;
  if (sendBtn) sendBtn.disabled = true;
  if (input) input.disabled = true;
  if (sendBtnText) sendBtnText.textContent = 'Thinking...';
  if (sendSpinner) sendSpinner.classList.remove('hidden');

  const container = document.getElementById('radbot-messages-container');

  // Render user message bubble
  const userEl = document.createElement('div');
  userEl.className = 'flex items-start justify-end gap-2.5';
  userEl.innerHTML = \`<div class="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] font-medium">\${escapeHtml(message)}</div>\`;
  container.appendChild(userEl);

  // Render thinking indicator
  const loadEl = document.createElement('div');
  loadEl.className = 'flex items-start gap-2.5';
  loadEl.innerHTML = \`<div class="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-xs font-bold border border-purple-500/40 animate-pulse">AI</div><div class="bg-[#241736] p-2.5 rounded-2xl rounded-tl-none text-xs text-slate-400 italic flex items-center gap-2"><span class="animate-bounce">&bull;</span><span class="animate-bounce" style="animation-delay: 150ms">&bull;</span><span class="animate-bounce" style="animation-delay: 300ms">&bull;</span><span>Thinking...</span></div>\`;
  container.appendChild(loadEl);
  container.scrollTop = container.scrollHeight;

  // Record user message in current session
  currentRadBotSession.messages.push({
    role: 'user',
    text: message,
    timestamp: new Date().toISOString()
  });

  // Auto-generate title from first user message
  if (currentRadBotSession.title === 'New Conversation' || !currentRadBotSession.title) {
    currentRadBotSession.title = message.slice(0, 38) + (message.length > 38 ? '...' : '');
  }

  updateRadBotWordCountDisplay();

  try {
    const res = await apiFetch('/api/radbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });

    loadEl.remove();
    const replyText = res.reply || 'No response.';

    // Render AI reply bubble
    const botEl = document.createElement('div');
    botEl.className = 'flex items-start gap-2.5';
    botEl.innerHTML = \`
      <div class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-md">AI</div>
      <div class="bg-[#241736] p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed max-w-[90%] markdown-body border border-[#3b2554]">
        \${marked.parse(replyText)}
      </div>
    \`;
    container.appendChild(botEl);
    container.scrollTop = container.scrollHeight;

    // Record AI reply in current session
    currentRadBotSession.messages.push({
      role: 'assistant',
      text: replyText,
      timestamp: new Date().toISOString()
    });

    // Save session to history (enforcing 10,000 words limit & 7-day retention)
    saveRadBotSessionToStorage(currentRadBotSession);
    updateRadBotWordCountDisplay();

  } catch (err) {
    loadEl.remove();
    const errEl = document.createElement('div');
    errEl.className = 'p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300';
    errEl.textContent = 'Failed to get AI response. Please try again.';
    container.appendChild(errEl);
  } finally {
    // 2. RE-ENABLE SEND BUTTON & INPUT AFTER RESPONSE IS COMPLETE
    isRadBotThinking = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) {
      input.disabled = false;
      input.focus();
    }
    if (sendBtnText) sendBtnText.textContent = 'Send';
    if (sendSpinner) sendSpinner.classList.add('hidden');
  }
}

// Initialize RadBot Session badge on DOM load
document.addEventListener('DOMContentLoaded', () => {
  updateRadBotHistoryBadge();
});
\n`;

content = content.slice(0, actualStart) + replacement + content.slice(actualEnd);

// Also remove the old clearRadBotChat at the bottom if present
content = content.replace(/\/\/ ==========================================\s*\/\/ RADBOT CLEAR CHAT[\s\S]*?async function clearRadBotChat\(\)[\s\S]*?\n\}/g, '');

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Successfully patched public/js/app.js with full RadBot session & history system!');
