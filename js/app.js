function isLowEnd() {
  try {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    if (mem <= 2 || cores <= 2) return true;
    if (/Android 4|Android 5|iPhone 5|iPhone 6|Linux armv7l/i.test(navigator.userAgent)) return true;
  } catch (e) {}
  return false;
}

const lowEnd = isLowEnd();
const PARTICLE_COUNT = lowEnd ? 30 : 300;
const STAR_COUNT = lowEnd ? 20 : 120;

if (lowEnd) document.body.classList.add('low-end');

/* ── Shooting Stars ── */
function initShootingStars() {
  if (lowEnd) return;
  const sf = document.getElementById('starfield');
  if (!sf) return;

  function createStar() {
    const el = document.createElement('div');
    el.className = 'shooting-star';
    const angle = Math.random() * 60 - 30;
    const x = Math.random() * 80 + 10;
    const dur = 0.8 + Math.random() * 1.2;
    const delay = Math.random() * 20;
    el.style.cssText =
      'left:' + x + '%;top:-10px;--angle:' + angle + 'deg;--dur:' + dur + 's;animation-delay:' + delay + 's';
    sf.appendChild(el);
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, (delay + dur + 1) * 1000);
  }

  for (let i = 0; i < 4; i++) createStar();
  setInterval(createStar, 8000);
}

/* ── Constellation Particles ── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }

  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const CONNECT_DIST = 140;
  const MOUSE_RADIUS = 180;

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r = Math.random() * 2 + 0.8;
    this.alpha = Math.random() * 0.3 + 0.1;
    this.hue = Math.random() > 0.6 ? 195 : 45;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = Math.random() * 6 + 2;
  }

  Particle.prototype.update = function(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const dirX = dx / dist || 0;
      const dirY = dy / dist || 0;
      this.x -= dirX * force * this.density * 0.3;
      this.y -= dirY * force * this.density * 0.3;
    }

    this.vx += (Math.random() - 0.5) * 0.02;
    this.vy += (Math.random() - 0.5) * 0.02;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.baseX = this.x;
      this.baseY = this.y;
    }
  };

  Particle.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.hue === 195
      ? 'rgba(0,212,255,' + this.alpha + ')'
      : 'rgba(255,215,0,' + this.alpha + ')';
    ctx.fill();
  };

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  let mx = W / 2, my = H / 2;
  let mouseActive = false;
  let mouseTimer = null;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
    mouseActive = true;
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(function() { mouseActive = false; }, 200);
  });

  let frameCount = 0;

  function animate() {
    ctx.clearRect(0, 0, W, H);
    frameCount++;

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(mx, my);
      particles[i].draw(ctx);
    }

    const connectAlpha = mouseActive ? 0.12 : 0.04;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const a = (1 - dist / CONNECT_DIST) * connectAlpha;
          ctx.strokeStyle = 'rgba(0,212,255,' + a + ')';
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

function initStars() {
  if (lowEnd) return;
  const sf = document.getElementById('starfield');
  if (!sf) return;
  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2.5 + 0.3;
    const minO = Math.random() * 0.2 + 0.02;
    const maxO = Math.random() * 0.6 + 0.3;
    s.style.cssText =
      'width:' + sz + 'px;height:' + sz + 'px;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 +
      '%;--min-opacity:' + minO + ';--max-opacity:' + maxO + ';--duration:' + (Math.random() * 4 + 2) +
      's;--delay:' + (Math.random() * 5) + 's';
    sf.appendChild(s);
  }
}

/* ── Mouse Glow ── */
function initMouseGlow() {
  if (lowEnd) return;
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  document.body.appendChild(glow);

  let mx = -200, my = -200;

  document.addEventListener('mousemove', function(e) {
    mx = e.clientX;
    my = e.clientY;
  });

  function animGlow() {
    const x = mx + window.scrollX;
    const y = my + window.scrollY;
    glow.style.transform = 'translate(' + (x - 150) + 'px, ' + (y - 150) + 'px)';
    requestAnimationFrame(animGlow);
  }

  requestAnimationFrame(animGlow);
}

/* ── 3D Hero Tilt ── */
function initHeroTilt() {
  const hero = document.getElementById('hero');
  if (!hero || lowEnd) return;

  hero.addEventListener('mousemove', function(e) {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    const inner = hero.querySelector('.hero-inner');
    if (inner) {
      inner.style.transform =
        'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02,1.02,1.02)';
    }
  });

  hero.addEventListener('mouseleave', function() {
    const inner = hero.querySelector('.hero-inner');
    if (inner) {
      inner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
      inner.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(function() { if (inner) inner.style.transition = ''; }, 800);
    }
  });
}

/* ── Magnetic Buttons ── */
function initMagneticButtons() {
  if (lowEnd) return;
  document.querySelectorAll('.btn-support, .btn-bot, .lang-toggle').forEach(function(btn) {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = 'translate(' + x * 0.25 + 'px, ' + (y * 0.25 - 2) + 'px)';
      this.style.transition = 'transform 0.1s linear';
    });

    btn.addEventListener('mouseenter', function() {
      this.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
      this.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(function() {
        if (btn) btn.style.transition = '';
      }, 500);
    });
  });
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.features, .feat-card').forEach(function(el) {
    observer.observe(el);
  });
}

/* ── Enhanced Loading ── */
async function runLoading() {
  const ld = document.getElementById('loadingScreen');
  const lb = document.getElementById('loaderBar');
  const lp = document.getElementById('loaderPct');
  const lt = document.getElementById('loaderTitle');
  const ls = document.getElementById('loaderSub');
  const mc = document.getElementById('mainContent');
  if (!ld || !lb || !lp || !lt || !ls || !mc) return;

  let pct = 0;

  function updPct(v) {
    pct = Math.min(v, 100);
    lb.style.width = pct + '%';
    lp.textContent = Math.round(pct) + '%';
  }

  lt.textContent = '';
  ls.classList.add('show');

  const title = t('loading');
  for (let i = 0; i <= title.length; i++) {
    lt.textContent = title.slice(0, i);
    updPct((i / title.length) * 40);
    await new Promise(r => setTimeout(r, 40));
  }

  await new Promise(r => setTimeout(r, 150));
  updPct(55);
  await new Promise(r => setTimeout(r, 100));
  updPct(70);
  await new Promise(r => setTimeout(r, 100));
  updPct(85);
  await new Promise(r => setTimeout(r, 100));
  updPct(100);
  await new Promise(r => setTimeout(r, 200));

  ld.classList.add('hidden');
  mc.classList.add('show');
}

document.addEventListener('DOMContentLoaded', function() {
  applyLang(currentLang);

  initStars();
  initParticles();
  initShootingStars();
  initMouseGlow();
  initHeroTilt();
  initMagneticButtons();
  initScrollReveal();
  runLoading();

  document.getElementById('lang-btn')?.addEventListener('click', function() {
    const newLang = getLang() === 'ar' ? 'en' : 'ar';
    applyLang(newLang);
    const lbl = document.getElementById('lang-label');
    if (lbl) lbl.textContent = newLang === 'ar' ? 'EN' : 'AR';
  });

  document.getElementById('adminGearBtn')?.addEventListener('click', function() {
    if (typeof window.openAdmin === 'function') window.openAdmin();
  });

  document.getElementById('open-chat-btn')?.addEventListener('click', function() {
    openChat();
  });

  document.getElementById('chat-close-btn')?.addEventListener('click', function() {
    closeChat();
  });

  document.getElementById('send-btn')?.addEventListener('click', function() {
    submitMessage();
  });

  document.getElementById('chat-input')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  });

  document.getElementById('chat-input')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) sendBtn.disabled = !this.value.trim();
  });

  document.getElementById('mic-btn')?.addEventListener('click', function() {
    if (!isSpeechSupported()) {
      showToast(t('voice_unsupported'), 'bad');
      return;
    }
    if (this.classList.contains('active')) {
      stopListening();
      this.classList.remove('active');
    } else {
      this.classList.add('active');
      startListening();
    }
  });

  document.getElementById('file-btn')?.addEventListener('click', function() {
    document.getElementById('file-input')?.click();
  });

  document.getElementById('file-input')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const check = validateFile(file);
    if (!check.valid) { showToast(check.error, 'bad'); return; }
    setSelectedFile(file);
  });

  document.getElementById('file-preview-remove')?.addEventListener('click', function() {
    clearSelectedFile();
  });

  document.getElementById('confirm-name-btn')?.addEventListener('click', function() {
    confirmName();
  });

  document.getElementById('name-input')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') confirmName();
  });

  document.getElementById('end-chat-btn')?.addEventListener('click', function() {
    showEndChatConfirm();
  });

  document.getElementById('confYes')?.addEventListener('click', function() {
    if (window._endChatResolve) {
      window._endChatResolve(true);
      window._endChatResolve = null;
    }
  });

  document.getElementById('confNo')?.addEventListener('click', function() {
    if (window._endChatResolve) {
      window._endChatResolve(false);
      window._endChatResolve = null;
    }
  });

  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = getLang() === 'ar' ? 'EN' : 'AR';

  document.addEventListener('click', function(e) {
    if (e.target.closest('#confirmOverlay') && !e.target.closest('.confirm-box')) {
      document.getElementById('confirmOverlay')?.classList.remove('open');
      if (window._endChatResolve) {
        window._endChatResolve(false);
        window._endChatResolve = null;
      }
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const conf = document.getElementById('confirmOverlay');
      if (conf?.classList.contains('open')) {
        conf.classList.remove('open');
        if (window._endChatResolve) {
          window._endChatResolve(false);
          window._endChatResolve = null;
        }
        return;
      }
      const chatWin = document.getElementById('chat-window');
      if (chatWin?.classList.contains('open')) {
        closeChat();
        return;
      }
    }
  });
});

document.addEventListener('langChanged', function({ detail: { lang } }) {
  const chatWin = document.getElementById('chat-window');
  if (chatWin) chatWin.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const input = document.getElementById('chat-input');
  if (input) input.placeholder = t('chat_msg_ph');
  const nameInput = document.getElementById('name-input');
  if (nameInput) nameInput.placeholder = t('nPh');
});
