const CONFIG = {
  BOT_TOKEN: "8767342832:AAF-JEDwwccZ-wT8cROdTRnowPyIuQUTi30",
  BOT_USERNAME: "PZIllPBOT",
  MEDO_CHAT_ID: "8753921687",
  ZOSER_CHAT_ID: "YOUR_ZOSER_ID_HERE",
  POLL_INTERVAL: 2000,
  API_BASE: "https://api.telegram.org/bot"
};

const SESSION_KEY = "cr7_session";
const AGENTS = {
  MEDO: { name: "MEDO", chatId: CONFIG.MEDO_CHAT_ID, ring: "gold" },
  ZOSER: { name: "ZOSER", chatId: CONFIG.ZOSER_CHAT_ID, ring: "cyan" }
};

function getSession() {
  try { const d = localStorage.getItem(SESSION_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function saveSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function genId() { return 'xxxx-xxxx-xxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16)); }
function genName() { return `User#${Math.floor(Math.random() * 9000 + 1000)}`; }
function fmtTime() { return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }); }

const dom = {};
function initDom() {
  dom.loading = document.getElementById('loading-screen');
  dom.pCanvas = document.getElementById('particle-canvas');
  dom.cCanvas = document.getElementById('cursor-canvas');
  dom.tw = document.getElementById('typewriter');
  dom.featureCards = document.querySelectorAll('.feature-card');
  dom.supportBtn = document.getElementById('support-btn');
  dom.heroCta = document.getElementById('hero-cta');
  dom.ctaBtn = document.getElementById('cta-btn');
  dom.modal = document.getElementById('agent-modal');
  dom.modalClose = document.getElementById('modal-close');
  dom.agentCards = document.querySelectorAll('.agent-card');
  dom.chat = document.getElementById('chat-container');
  dom.chatMsgs = document.getElementById('chat-messages');
  dom.chatWelcome = document.getElementById('chat-welcome');
  dom.input = document.getElementById('chat-input');
  dom.sendBtn = document.getElementById('chat-send-btn');
  dom.endBtn = document.getElementById('chat-end-btn');
  dom.agentName = document.querySelector('.chat-agent-name');
  dom.agentRing = document.querySelector('.chat-agent-ring');
  dom.toast = document.getElementById('toast-container');
  dom.typing = document.querySelector('.typing-indicator');
  dom.statNums = document.querySelectorAll('.stat-number');
}

let agent = null, session = null, pollTimer = null, lastUpdateId = 0;

/* ─── LOADING ─── */
function initLoading() {
  setTimeout(() => dom.loading.classList.add('hidden'), 2200);
}

/* ─── TYPEWRITER ─── */
function initTypewriter() {
  const text = "الدعم الفني الاحترافي على أعلى مستوى";
  let i = 0;
  function t() {
    if (i <= text.length) { dom.tw.textContent = text.substring(0, i++); setTimeout(t, 40 + Math.random() * 40); }
  }
  setTimeout(t, 2600);
}

/* ─── PARTICLES ─── */
function initParticles() {
  const c = dom.pCanvas, ctx = c.getContext('2d');
  let w, h, parts = [];

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#FFD700', '#FF003C', '#00F5FF', '#ffffff'];
  const COUNT = 100;

  for (let i = 0; i < COUNT; i++) {
    parts.push({
      x: Math.random() * w, y: Math.random() * h,
      size: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      op: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      p.pulse += 0.01;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      const s = p.size + Math.sin(p.pulse) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.op * (0.7 + Math.sin(p.pulse) * 0.3);
      ctx.fill();
    }

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(parts[i].x, parts[i].y);
          ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = parts[i].color;
          ctx.lineWidth = 0.3 * (1 - dist / 100);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── CURSOR ─── */
function initCursor() {
  const c = dom.cCanvas, ctx = c.getContext('2d');
  let w, h, mx = -100, my = -100, trail = [], bursts = [];
  const LEN = 15;

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    trail.push({ x: mx, y: my });
    if (trail.length > LEN) trail.shift();
  });

  document.addEventListener('mouseleave', () => { mx = -100; my = -100; });

  document.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 / 8) * i;
      bursts.push({
        x: e.clientX, y: e.clientY,
        vx: Math.cos(a) * (2 + Math.random() * 2),
        vy: Math.sin(a) * (2 + Math.random() * 2),
        life: 1, size: Math.random() * 3 + 1
      });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < trail.length; i++) {
      const t = trail[i];
      const f = (i + 1) / trail.length;
      const sz = f * 3 + 1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${f * 0.5})`;
      ctx.fill();
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy;
      b.life -= 0.035;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${b.life * 0.6})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(mx, my, 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();

    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── 3D TILT ─── */
function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rotX = (y - 0.5) * -12;
      const rotY = (x - 0.5) * 12;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.02)`;
      card.style.borderColor = 'rgba(255, 215, 0, 0.3)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.borderColor = '';
    });
  });
}

/* ─── COUNTER ANIMATION ─── */
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  dom.statNums.forEach(el => obs.observe(el));
}

function animateCounter(el, target) {
  const dur = 2000;
  const start = Date.now();
  function tick() {
    const p = Math.min((Date.now() - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  tick();
}

/* ─── SCROLL ANIMATIONS ─── */
function initScrollFeatures() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  dom.featureCards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(50px) scale(0.95)';
    c.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
    obs.observe(c);
  });
}

/* ─── SOUND ─── */
function playChime() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)();
    const o = a.createOscillator(), g = a.createGain();
    o.connect(g); g.connect(a.destination);
    o.frequency.setValueAtTime(660, a.currentTime);
    o.frequency.setValueAtTime(880, a.currentTime + 0.08);
    o.frequency.setValueAtTime(1100, a.currentTime + 0.16);
    g.gain.setValueAtTime(0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.4);
    o.start(); o.stop(a.currentTime + 0.4);
  } catch {}
}

/* ─── EXPLOSION ─── */
function createExplosion(x, y) {
  const c = dom.pCanvas, ctx = c.getContext('2d');
  const COLS = ['#FFD700', '#FF003C', '#00F5FF', '#fff'];
  const ps = [];
  for (let i = 0; i < 50; i++) {
    const a = (Math.PI * 2 / 50) * i + Math.random() * 0.1;
    const s = 2 + Math.random() * 5;
    ps.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, sz: Math.random() * 4 + 2, col: COLS[Math.floor(Math.random() * COLS.length)], life: 1 });
  }
  function anim() {
    let alive = false;
    for (const p of ps) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.97; p.vy *= 0.97;
      p.life -= 0.025;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.col; ctx.globalAlpha = p.life; ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(anim);
  }
  anim();
}

/* ─── RIPPLE ─── */
function createRipple(e, btn) {
  const r = btn.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const el = document.createElement('span');
  el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.3);transform:translate(-50%,-50%);pointer-events:none;transition:all 0.6s ease;`;
  btn.appendChild(el);
  requestAnimationFrame(() => {
    el.style.width = '200px'; el.style.height = '200px';
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), 700);
}

function addRippleListeners() {
  document.querySelectorAll('.hero-btn, .cta-btn, #chat-send-btn, #support-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id !== 'support-btn') createRipple(e, btn);
    });
  });
}

/* ─── SUPPORT ─── */
function initSupport() {
  dom.supportBtn.addEventListener('click', (e) => {
    const rect = dom.supportBtn.getBoundingClientRect();
    createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const s = getSession();
    if (s && s.selected_agent && AGENTS[s.selected_agent]) {
      openChat(AGENTS[s.selected_agent]);
      return;
    }
    dom.modal.classList.add('active');
  });

  dom.heroCta.addEventListener('click', () => {
    dom.supportBtn.click();
  });

  dom.ctaBtn.addEventListener('click', () => {
    dom.supportBtn.click();
  });
}

/* ─── MODAL ─── */
function initModal() {
  dom.modalClose.addEventListener('click', () => dom.modal.classList.remove('active'));
  dom.modal.addEventListener('click', (e) => { if (e.target === dom.modal) dom.modal.classList.remove('active'); });

  dom.agentCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.agent;
      const a = AGENTS[key];
      if (!a) return;

      if (!session) {
        session = { session_id: genId(), session_name: genName(), selected_agent: key, messages: [], created_at: Date.now(), last_active: Date.now(), last_update_id: 0 };
      } else {
        session.selected_agent = key;
        session.messages = [];
        session.last_active = Date.now();
      }
      saveSession(session);
      dom.modal.classList.remove('active');
      openChat(a);
    });
  });
}

/* ─── CHAT ─── */
function openChat(a) {
  agent = a;
  dom.agentName.textContent = a.name;
  dom.agentRing.style.background = a.name === 'MEDO'
    ? 'conic-gradient(from 0deg, #FFD700, #ff8c00, #FFD700)'
    : 'conic-gradient(from 0deg, #00F5FF, #0088ff, #00F5FF)';
  dom.chatMsgs.innerHTML = '';
  dom.chat.classList.add('active');

  if (session && session.messages) {
    dom.chatWelcome.style.display = 'none';
    session.messages.forEach(m => renderMsg(m));
  } else {
    dom.chatWelcome.style.display = 'block';
  }

  scrollBottom();
  if (session) lastUpdateId = session.last_update_id || 0;
  startPoll();
  setTimeout(() => dom.input.focus(), 300);
}

function renderMsg(m) {
  const d = document.createElement('div');
  d.className = `message ${m.role}`;
  const t = document.createElement('div');
  t.className = 'message-text';
  t.textContent = m.text;
  d.appendChild(t);
  const ti = document.createElement('div');
  ti.className = 'message-time';
  ti.textContent = m.time || fmtTime();
  d.appendChild(ti);
  dom.chatMsgs.appendChild(d);
}

function scrollBottom() {
  dom.chatMsgs.scrollTop = dom.chatMsgs.scrollHeight;
}

function addMsg(text, role) {
  const m = { text, role, time: fmtTime() };
  if (session) {
    session.messages.push(m);
    session.last_active = Date.now();
    saveSession(session);
  }
  renderMsg(m);
  scrollBottom();
}

let activeAgentSessions = {};
let seenUpdates = new Set();

function sendMsg() {
  const text = dom.input.value.trim();
  if (!text || !agent || !session) return;
  dom.input.value = '';
  dom.input.style.height = 'auto';
  dom.chatWelcome.style.display = 'none';
  addMsg(text, 'user');

  fetch(`${CONFIG.API_BASE}${CONFIG.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: agent.chatId,
      text: `🎮 رسالة دعم جديدة — CR7\n\n👤 المستخدم: ${session.session_name}\n🆔 كود المحادثة: ${session.session_id}\n💬 الرسالة:\n${text}\n\n⏰ ${fmtTime()}`,
      reply_markup: {
        inline_keyboard: [[
          { text: "✏️ رد على المستخدم", url: `tg://resolve?domain=${CONFIG.BOT_USERNAME}&start=reply_${session.session_id}` }
        ], [
          { text: "❌ إنهاء المحادثة", url: `tg://resolve?domain=${CONFIG.BOT_USERNAME}&start=end_${session.session_id}` }
        ]]
      }
    })
  }).catch(() => {});
}

/* ─── POLLING ─── */
function startPoll() { stopPoll(); pollTimer = setInterval(poll, CONFIG.POLL_INTERVAL); }
function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

async function poll() {
  if (!session || !agent) return;
  try {
    const res = await fetch(`${CONFIG.API_BASE}${CONFIG.BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`);
    const data = await res.json();
    if (!data.ok || !data.result) return;

    for (const u of data.result) {
      const uid = u.update_id;
      if (uid <= lastUpdateId || seenUpdates.has(uid)) continue;
      seenUpdates.add(uid);
      if (seenUpdates.size > 500) seenUpdates.clear();
      lastUpdateId = uid;

      if (!u.message || !u.message.text) continue;
      const txt = u.message.text;
      const chatId = u.message.chat.id;

      const startReply = txt.match(/^\/start reply_(.+)$/);
      if (startReply) {
        const sid = startReply[1].trim();
        if (sid === session.session_id) activeAgentSessions[chatId] = sid;
        continue;
      }

      const startEnd = txt.match(/^\/start end_(.+)$/);
      if (startEnd) {
        const sid = startEnd[1].trim();
        if (sid === session.session_id) {
          showEndToast();
          clearSession();
          session = null; agent = null;
          stopPoll();
          dom.chat.classList.remove('active');
        }
        continue;
      }

      const replyPrefix = `reply:${session.session_id}`;
      if (txt.startsWith(replyPrefix)) {
        const reply = txt.substring(replyPrefix.length).trim();
        if (reply) deliverReply(reply);
        continue;
      }

      if (activeAgentSessions[chatId] === session.session_id && txt !== `/start reply_${session.session_id}`) {
        deliverReply(txt);
      }
    }
    if (session) { session.last_update_id = lastUpdateId; saveSession(session); }
  } catch {}
}

let replyPending = false;

function deliverReply(text) {
  if (replyPending) return;
  replyPending = true;
  dom.chatWelcome.style.display = 'none';
  addMsg(text, 'agent');
  showToast(agent.name);
  playChime();
  replyPending = false;
}

function showEndToast() {
  const t = document.createElement('div');
  t.className = 'toast';
  const ic = document.createElement('div');
  ic.className = 'toast-icon'; ic.textContent = '✓';
  t.appendChild(ic);
  const tx = document.createElement('div');
  tx.className = 'toast-text'; tx.textContent = 'تم إنهاء المحادثة من قبل الدعم';
  t.appendChild(tx);
  t.addEventListener('click', () => t.remove());
  dom.toast.appendChild(t);
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 400); }, 6000);
}

/* ─── TOAST ─── */
function showToast(name) {
  const t = document.createElement('div');
  t.className = 'toast';
  const ic = document.createElement('div');
  ic.className = 'toast-icon'; ic.textContent = name.charAt(0);
  t.appendChild(ic);
  const tx = document.createElement('div');
  tx.className = 'toast-text'; tx.textContent = `رد عليك ${name}!`;
  t.appendChild(tx);
  t.addEventListener('click', () => { dom.chat.classList.add('active'); t.remove(); });
  dom.toast.appendChild(t);
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 400); }, 5000);
}

/* ─── CHAT INPUT ─── */
function initInput() {
  dom.input.addEventListener('input', () => {
    dom.input.style.height = 'auto';
    dom.input.style.height = Math.min(dom.input.scrollHeight, 120) + 'px';
  });
  dom.input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } });
  dom.sendBtn.addEventListener('click', sendMsg);
}

/* ─── END CHAT ─── */
function initEnd() {
  dom.endBtn.addEventListener('click', () => {
    clearSession();
    session = null; agent = null;
    stopPoll();
    dom.chat.classList.remove('active');
    dom.chatWelcome.style.display = 'block';
    dom.chatMsgs.innerHTML = '';
    dom.chatMsgs.appendChild(dom.chatWelcome);
  });
}

/* ─── RESTORE ─── */
function restoreSession() {
  const s = getSession();
  if (!s || !s.selected_agent) return;
  session = s;
  const a = AGENTS[s.selected_agent];
  if (!a) return;
  agent = a;
  openChat(a);

  const t = document.createElement('div');
  t.className = 'toast';
  const ic = document.createElement('div');
  ic.className = 'toast-icon'; ic.textContent = '✓';
  t.appendChild(ic);
  const tx = document.createElement('div');
  tx.className = 'toast-text'; tx.textContent = `تم استعادة محادثتك مع ${a.name}`;
  t.appendChild(tx);
  t.addEventListener('click', () => { dom.chat.classList.add('active'); t.remove(); });
  dom.toast.appendChild(t);
  setTimeout(() => { t.classList.add('removing'); setTimeout(() => t.remove(), 400); }, 4000);
}

/* ─── TOUCH ─── */
function initTouch() {
  if ('ontouchstart' in window) {
    document.body.style.cursor = 'auto';
    dom.cCanvas.style.display = 'none';
  }
}

/* ─── HERO PARALLAX ─── */
function initParallax() {
  const hero = document.getElementById('hero-content');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    hero.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
  });
}

/* ─── INIT ─── */
function init() {
  initDom();
  initTouch();
  initLoading();
  initTypewriter();
  initParticles();
  initCursor();
  initTilt();
  initCounters();
  initScrollFeatures();
  initSupport();
  initModal();
  initInput();
  initEnd();
  addRippleListeners();
  initParallax();
  setTimeout(restoreSession, 2800);
}

document.addEventListener('DOMContentLoaded', init);
