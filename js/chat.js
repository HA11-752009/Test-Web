const STORAGE_PREFIX = {
  S: id => 'cr7_s_' + id,
  M: id => 'cr7_m_' + id,
  R: id => 'cr7_r_' + id,
  U: 'cr7_lang',
  A: 'cr7_active',
  N: 'cr7_name',
  AO: id => 'cr7_ao_' + id,
  AT: 'cr7_at'
};

const Storage = {
  saveSession(s) { try { localStorage.setItem(STORAGE_PREFIX.S(s.id), JSON.stringify(s)); } catch (e) {} },
  getSession(id) { try { const d = localStorage.getItem(STORAGE_PREFIX.S(id)); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
  saveMessages(id, ms) { try { localStorage.setItem(STORAGE_PREFIX.M(id), JSON.stringify(ms)); } catch (e) {} },
  getMessages(id) { try { const d = localStorage.getItem(STORAGE_PREFIX.M(id)); return d ? JSON.parse(d) : []; } catch (e) { return []; } },
  saveReply(id, r) { try { localStorage.setItem(STORAGE_PREFIX.R(id), JSON.stringify(r)); } catch (e) {} },
  getReply(id) { try { const d = localStorage.getItem(STORAGE_PREFIX.R(id)); return d ? JSON.parse(d) : null; } catch (e) { return null; } },
  setAdminOnline(id, online) { try { if (online) localStorage.setItem(STORAGE_PREFIX.AO(id), Date.now()); else localStorage.removeItem(STORAGE_PREFIX.AO(id)); } catch (e) {} },
  isAdminOnline(id) { try { const v = localStorage.getItem(STORAGE_PREFIX.AO(id)); if (!v) return false; return (Date.now() - Number(v)) < 20000; } catch (e) { return false; } },
  clearSession(id) {
    localStorage.removeItem(STORAGE_PREFIX.S(id));
    localStorage.removeItem(STORAGE_PREFIX.M(id));
    localStorage.removeItem(STORAGE_PREFIX.R(id));
    if (localStorage.getItem(STORAGE_PREFIX.A) === id) localStorage.removeItem(STORAGE_PREFIX.A);
  }
};

let chatState = {
  step: 'name',
  sid: null,
  name: null,
  userLang: currentLang,
  poll: null,
  selectedFile: null
};

chatState.sid = localStorage.getItem(STORAGE_PREFIX.A) || null;
chatState.name = localStorage.getItem(STORAGE_PREFIX.N) || null;
if (chatState.sid) {
  const s = Storage.getSession(chatState.sid);
  if (s) {
    chatState.userLang = s.userLang || currentLang;
    chatState.name = s.name || chatState.name;
    if (chatState.name) localStorage.setItem(STORAGE_PREFIX.N, chatState.name);
  }
}

const badWords = ['كلب','حمار','خنزير','عاهرة','شرموط','أحمق','غبي','تبا','كس','طيز','زب','نيك','منيوك','خول','قحبة','لوطي','fuck','shit','bitch','asshole','bastard','dick','pussy','whore','slut','motherfucker','cunt','twat'];
const fakeNames = ['test','تست','admin','user','مستخدم','aaaa','xxxx','asdf','qwe','qwerty','abcd'];

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function detectLang(txt) {
  const a = (txt.match(/[\u0600-\u06FF]/g) || []).length;
  const l = (txt.match(/[a-zA-Z\u0600-\u06FF]/g) || []).length;
  if (l === 0) return 'unknown';
  return (a / l) > 0.4 ? 'ar' : 'en';
}

async function translateText(txt, from, to) {
  if (from === 'unknown' || !txt.trim()) return { translated: txt, success: false };
  try {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(txt));
    const d = await r.json();
    const translated = d[0].map(function(i) { return i[0]; }).filter(Boolean).join('');
    if (translated === txt && from !== to) {
      console.warn('⚠️ Translation returned same text (source=' + from + ', target=' + to + ')');
      return { translated: txt, success: false };
    }
    return { translated: translated, success: true };
  } catch (e) {
    return { translated: txt, success: false };
  }
}

async function sendToTelegram(name, sid, msg, lang) {
  if (CONFIG.TELEGRAM_TOKEN === 'YOUR_BOT_TOKEN_HERE' || CONFIG.TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
    console.warn('⚠️ Telegram not configured — set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID in js/i18n.js');
    return;
  }

  const time = new Date().toLocaleString();
  const flag = lang === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English';
  const msgType = msg.includes('بدأ محادثة') || msg.includes('Started a new') ? '🆕' :
                  msg.includes('🔚') ? '🔚' : '💬';

  const link = CONFIG.REPLY_BASE_URL + '?reply=' + sid;
  const isLocal = window.location.protocol === 'file:';

  const text = msgType + ' *' + name + '*\n' +
               '🆔 `' + sid.slice(0, 8) + '...` 🌐 ' + flag + '\n' +
               '⏰ ' + time + '\n' +
               '━━━━━━━━━━━\n' +
               msg +
               '\n━━━━━━━━━━━\n' +
               '💬 [رد](' + link + ') | 🔚 [إنهاء](' + link + '&end=1)';

  let bodyObj = {
    chat_id: CONFIG.TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'Markdown',
    disable_web_page_preview: true
  };

  if (!isLocal) {
    bodyObj.reply_markup = {
      inline_keyboard: [[
        { text: '💬 رد', url: link },
        { text: '🔚 إنهاء', url: link + '&end=1' }
      ]]
    };
  } else {
    console.warn('⚠️ Running locally — Telegram buttons disabled (file:// URLs not accepted)');
    showToast('⚠️ Telegram buttons need hosting — text links sent instead', 'info');
  }

  try {
    const res = await fetch('https://api.telegram.org/bot' + CONFIG.TELEGRAM_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    });

    const data = await res.json();

    if (!data.ok) {
      const errorMsg = '❌ Telegram error: ' + (data.description || 'Unknown error');
      console.error(errorMsg);
      showToast(errorMsg, 'bad');
      return false;
    }

    console.log('✅ Telegram: message sent for ' + name);
    return true;
  } catch (e) {
    const errorMsg = '❌ Failed to send to Telegram: ' + e.message;
    console.error(errorMsg);
    showToast(errorMsg, 'bad');
    return false;
  }
}

function validateName(name) {
  const result = { valid: false, error: '', cleanedName: '' };
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (cleaned.length < 5) { result.error = t('nShortT'); return result; }
  const words = cleaned.split(' ').filter(function(x) { return x.length > 0; });
  if (words.length < 2) { result.error = t('nSingle'); return result; }
  for (let i = 0; i < words.length; i++) { if (words[i].length < 2) { result.error = t('nShort'); return result; } }
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(cleaned)) { result.error = t('nSym'); return result; }
  if (/[\u0300-\u036f\u0610-\u061A\u064B-\u065F]/.test(cleaned)) { result.error = t('nSym'); return result; }
  if (/(.)\1{3,}/.test(cleaned)) { result.error = t('nRep'); return result; }
  for (let i = 0; i < words.length; i++) {
    const unique = new Set(words[i].toLowerCase()).size;
    if (words[i].length > 4 && unique / words[i].length < 0.3) { result.error = t('nFake'); return result; }
  }
  if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(cleaned)) { result.error = t('nSym'); return result; }
  const lc = cleaned.toLowerCase();
  for (let i = 0; i < badWords.length; i++) { if (lc.includes(badWords[i])) { result.error = t('nBad'); return result; } }
  for (let i = 0; i < fakeNames.length; i++) { if (lc.includes(fakeNames[i])) { result.error = t('nFake'); return result; } }
  result.valid = true;
  result.cleanedName = cleaned;
  return result;
}

function addMsg(text, sender, extra) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-bubble ' + sender;
  const now = new Date();
  const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let content = '<div>' + text + '</div>';

  if (extra && extra.image) {
    content += '<div class="msg-img-wrap"><img src="' + extra.image + '" class="msg-img" onclick="window.open(\'' + extra.image + '\',\'_blank\')" loading="lazy"></div>';
  }

  content += '<div class="msg-time">' + ts + '</div>';
  div.innerHTML = content;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addSystemMsg(text) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-bubble system';
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTypingIndicator() {
  const msgs = document.getElementById('chat-messages');
  if (!msgs || document.getElementById('typing-indicator')) return;
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typing-indicator';
  div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function clearChat() {
  const msgs = document.getElementById('chat-messages');
  if (msgs) msgs.innerHTML = '';
}

function saveMsg(role, text) {
  if (!chatState.sid) return;
  const ms = Storage.getMessages(chatState.sid);
  ms.push({ role, text, time: new Date().toISOString() });
  Storage.saveMessages(chatState.sid, ms);
}

function loadHistory() {
  if (!chatState.sid) return;
  const ms = Storage.getMessages(chatState.sid);
  for (let i = 0; i < ms.length; i++) {
    addMsg(ms[i].text, ms[i].role === 'user' ? 'user' : 'support');
  }
}

function showNameScreen() {
  const nameScreen = document.getElementById('name-input-screen');
  const chatMessages = document.getElementById('chat-messages');
  const chatInputArea = document.getElementById('chat-input-area');
  const endBtn = document.getElementById('end-chat-btn');
  if (nameScreen) nameScreen.style.display = 'flex';
  if (chatMessages) chatMessages.style.display = 'none';
  if (chatInputArea) chatInputArea.style.display = 'none';
  if (endBtn) endBtn.style.display = 'none';
}

function hideNameScreen() {
  const nameScreen = document.getElementById('name-input-screen');
  const chatMessages = document.getElementById('chat-messages');
  const chatInputArea = document.getElementById('chat-input-area');
  const endBtn = document.getElementById('end-chat-btn');
  if (nameScreen) nameScreen.style.display = 'none';
  if (chatMessages) chatMessages.style.display = 'flex';
  if (chatInputArea) chatInputArea.style.display = 'flex';
  if (endBtn) endBtn.style.display = 'block';
}

function openChat() {
  const win = document.getElementById('chat-window');
  if (!win) return;
  win.classList.add('open');

  if (chatState.sid && chatState.name) {
    const s = Storage.getSession(chatState.sid);
    if (s && s.status === 'ended') {
      chatState.sid = null;
      chatState.name = null;
      localStorage.removeItem(STORAGE_PREFIX.A);
      localStorage.removeItem(STORAGE_PREFIX.N);
      showNameScreen();
      return;
    }
    hideNameScreen();
    clearChat();
    loadHistory();
    chatState.step = 'chatting';
    startPolling();
    return;
  }

  showNameScreen();
}

function closeChat() {
  const win = document.getElementById('chat-window');
  if (win) win.classList.remove('open');
  stopPolling();
}

function submitMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  if (chatState.step === 'name') {
    handleName(val);
  } else {
    handleMessage(val);
  }
}

async function handleName(val) {
  const result = validateName(val);
  const nameError = document.getElementById('name-error');
  if (!result.valid) {
    if (nameError) nameError.textContent = result.error;
    return;
  }
  if (nameError) nameError.textContent = '';

  chatState.name = result.cleanedName;
  chatState.sid = uuid();
  chatState.userLang = currentLang;
  localStorage.setItem(STORAGE_PREFIX.A, chatState.sid);
  localStorage.setItem(STORAGE_PREFIX.N, chatState.name);
  Storage.saveSession({
    id: chatState.sid,
    name: chatState.name,
    userLang: chatState.userLang,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    status: 'active'
  });

  hideNameScreen();
  clearChat();
  addMsg('<strong>' + chatState.name + '</strong><br>' + t('gr'), 'user');

  addTypingIndicator();
  await new Promise(r => setTimeout(r, 800));
  removeTypingIndicator();

  addMsg(t('mR'), 'support');
  addMsg(t('mR2'), 'support');
  addMsg('🔴 ' + t('off'), 'support');

  saveMsg('user', chatState.name + ': ' + t('gr'));
  saveMsg('support', t('mR'));
  saveMsg('support', t('mR2'));

  await sendToTelegram(chatState.name, chatState.sid, currentLang === 'ar' ? 'بدأ محادثة جديدة' : 'Started a new chat', currentLang === 'ar' ? 'ar' : 'en');

  chatState.step = 'chatting';
  updateAdminStatus();
  startPolling();
}

async function handleMessage(val) {
  const input = document.getElementById('chat-input');
  if (!input) return;

  const displayName = chatState.name || t('site_name');

  saveMsg('user', val);

  if (chatState.selectedFile) {
    const file = chatState.selectedFile;
    const extra = {};
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const lastMsg = document.querySelector('.msg-bubble.user:last-child');
        if (lastMsg) {
          const wrap = document.createElement('div');
          wrap.className = 'msg-img-wrap';
          wrap.innerHTML = '<img src="' + e.target.result + '" class="msg-img" onclick="window.open(\'' + e.target.result + '\',\'_blank\')" loading="lazy">';
          lastMsg.querySelector('div:first-child').after(wrap);
          const msgs = document.getElementById('chat-messages');
          if (msgs) msgs.scrollTop = msgs.scrollHeight;
        }
      };
      reader.readAsDataURL(file);
      addMsg('<strong>' + displayName + '</strong><br>' + val + '<br><span style="font-size:0.8rem;opacity:0.6">📷 ' + file.name + '</span>', 'user');
    } else {
      addMsg('<strong>' + displayName + '</strong><br>' + val + '<br><span style="font-size:0.8rem;opacity:0.6">📎 ' + file.name + '</span>', 'user');
    }
    chatState.selectedFile = null;
    clearSelectedFile();
  } else {
    addMsg('<strong>' + displayName + '</strong><br>' + val, 'user');
  }

  input.value = '';
  input.style.height = 'auto';
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = true;
  input.dispatchEvent(new Event('input'));

  const tgLang = currentLang === 'ar' ? 'en' : 'ar';
  const p = await translateText(val, 'auto', tgLang);
  if (!p.success) console.warn('⚠️ Translation failed, sending original text to Telegram');
  await sendToTelegram(displayName, chatState.sid, p.translated, currentLang);

  input.focus();
}

function confirmName() {
  const input = document.getElementById('name-input');
  if (!input) return;
  handleName(input.value);
}

function showEndChatConfirm() {
  const overlay = document.getElementById('confirmOverlay');
  const text = document.getElementById('confTxt');
  if (!overlay || !text) return;
  text.textContent = t('cEnd');
  overlay.classList.add('open');

  window._endChatResolve = async function(confirmed) {
    overlay.classList.remove('open');
    if (!confirmed) return;
    if (chatState.sid) {
      saveMsg('system', t('eDone'));
      const endName = chatState.name || t('site_name');
      await sendToTelegram(endName, chatState.sid, currentLang === 'ar' ? '🔚 أنهى المحادثة' : '🔚 Ended the chat', currentLang === 'ar' ? 'ar' : 'en');
      Storage.clearSession(chatState.sid);
    }
    localStorage.removeItem(STORAGE_PREFIX.A);
    localStorage.removeItem(STORAGE_PREFIX.N);
    chatState.sid = null;
    chatState.name = null;
    stopPolling();
    clearChat();
    closeChat();
    showToast(t('eDone'), 'ok');
  };
}

function updateAdminStatus() {
  var statusEl = document.querySelector('.chat-header-status');
  if (!statusEl || !chatState.sid) return;
  var dot = statusEl.querySelector('.status-dot');
  var text = statusEl.querySelector('span:last-child');
  var online = Storage.isAdminOnline(chatState.sid);
  if (dot) dot.style.background = online ? '#00e676' : '#ff5252';
  if (text) text.textContent = online ? t('on') : t('off');
}

function startPolling() {
  stopPolling();
  chatState.poll = setInterval(async function() {
    if (!chatState.sid) return;
    updateAdminStatus();
    const r = Storage.getReply(chatState.sid);
    if (r && !r.delivered) {
      let txt = r.text;
      const userLang = currentLang === 'ar' ? 'ar' : 'en';
      const tr = await translateText(txt, 'auto', userLang);
      if (!tr.success) console.warn('⚠️ Admin reply translation failed, showing original');

      if (r.isEnd) {
        addMsg('<strong>' + tr.translated + '</strong>', 'support');
        saveMsg('support', tr.translated);
        r.delivered = true;
        Storage.saveReply(chatState.sid, r);
        stopPolling();
        setTimeout(function() {
          if (chatState.sid) Storage.clearSession(chatState.sid);
          localStorage.removeItem(STORAGE_PREFIX.A);
          localStorage.removeItem(STORAGE_PREFIX.N);
          chatState.sid = null;
          chatState.name = null;
          clearChat();
          closeChat();
          showToast(t('eDone'), 'ok');
        }, 3000);
        return;
      }

      addMsg('💬 ' + tr.translated, 'support');
      saveMsg('support', tr.translated);
      r.delivered = true;
      Storage.saveReply(chatState.sid, r);
      showToast(t('newMsg'), 'info');
    }
  }, 4000);
}

function stopPolling() {
  if (chatState.poll) {
    clearInterval(chatState.poll);
    chatState.poll = null;
  }
}

function isSpeechSupported() {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

let recognition = null;

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  recognition = new SpeechRecognition();
  recognition.lang = currentLang === 'ar' ? 'ar-SA' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function(event) {
    const text = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) {
      input.value += (input.value ? ' ' : '') + text;
      input.dispatchEvent(new Event('input'));
    }
  };

  recognition.onerror = function() {
    const btn = document.getElementById('mic-btn');
    if (btn) btn.classList.remove('active');
  };

  recognition.onend = function() {
    const btn = document.getElementById('mic-btn');
    if (btn) btn.classList.remove('active');
  };

  recognition.start();
}

function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
    recognition = null;
  }
}

function validateFile(file) {
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
    return { valid: false, error: '❌ صيغة الملف غير مدعومة' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: '❌ الملف كبير جداً (الحد الأقصى 10MB)' };
  }
  return { valid: true, error: '' };
}

function setSelectedFile(file) {
  chatState.selectedFile = file;
  const bar = document.getElementById('file-preview-bar');
  const name = document.getElementById('file-preview-name');
  if (!bar || !name) return;
  name.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
  bar.style.display = 'flex';
}

function clearSelectedFile() {
  chatState.selectedFile = null;
  const bar = document.getElementById('file-preview-bar');
  if (bar) bar.style.display = 'none';
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';
}

function showToast(msg, type) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(function() { el.classList.add('show'); });
  setTimeout(function() {
    el.classList.remove('show');
    el.classList.add('out');
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }, 3500);
}
