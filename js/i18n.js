const CONFIG = {
  TELEGRAM_TOKEN: "8958134125:AAHu1DCI016bWjGSzaq7JetRr4P9z1N6Dn8",
  TELEGRAM_CHAT_ID: "8304613989",
  BOT_LINK: "https://t.me/YOUR_BOT_USERNAME",
  SITE_NAME: "CR7 Number Bot Support",
  get REPLY_BASE_URL() { return window.location.origin + window.location.pathname; }
};

const TRANSLATIONS = {
  ar: {
    site_name: "CR7 Number Bot Support",
    tagline: "بوت الأرقام الاحترافي",
    hero_line2: "CR7 Number Bot",
    hero_desc: "دعم فني احترافي متاح على مدار الساعة",
    btn_bot: "بوت أرقام",
    btn_support: "تواصل مع الدعم",
    loading: "CR7 Number Bot Support",
    chat_msg_ph: "اكتب رسالتك...",
    nPh: "أدخل اسمك الثنائي...",
    mPh: "اكتب رسالتك هنا...",
    gr: "مرحباً بك في CR7 Support! 👋",
    np: "من فضلك أدخل اسمك الثنائي للمتابعة:",
    mR: "✅ تم استلام رسالتك وسيتم الرد عليك قريباً",
    mR2: "🕐 فريق الدعم سيراجع طلبك قريباً",
    on: "ميدو: متصل الآن 🟢",
    off: "ميدو: غير متصل 🔴",
    end: "إنهاء المحادثة",
    snd: "إرسال",
    cEnd: "هل أنت متأكد من إنهاء المحادثة؟ سيتم حذف جميع الرسائل.",
    cY: "نعم، إنهاء",
    cN: "لا، رجوع",
    eDone: "✅ تم إنهاء المحادثة.",
    nShort: "❌ كل كلمة ≥ حرفين.",
    nSingle: "❌ أدخل اسم ثنائي.",
    nBad: "❌ الاسم يحتوي على كلمات غير مقبولة.",
    nRep: "❌ الاسم فيه تكرار غير طبيعي.",
    nSym: "❌ لا تستخدم أرقاماً أو رموزاً.",
    nFake: "❌ أدخل اسمك الحقيقي.",
    nShortT: "❌ الاسم قصير.",
    sent: "✅ تم الإرسال",
    err: "❌ حدث خطأ",
    sending: "جاري الإرسال...",
    newMsg: "رسالة جديدة من الدعم 💬",
    voice_start: "🎤 بدء التسجيل",
    voice_stop: "⏹️ إيقاف التسجيل",
    voice_unsupported: "التسجيل الصوتي غير مدعوم",
    end_confirm_title: "إنهاء المحادثة",
    chat_title: "CR7 Support",
    chat_status: "ميدو: غير متصل 🔴",
    features_title: "المميزات الأساسية",
    feat_instant: "رد فوري",
    feat_instant_desc: "الرسائل تصل للدعم فوراً",
    feat_secure: "آمن وخاص",
    feat_secure_desc: "محادثات مشفرة",
    feat_lang: "متعدد اللغات",
    feat_lang_desc: "دعم بالعربية والإنجليزية",
    feat_responsive: "متجاوب",
    feat_responsive_desc: "يعمل على جميع الأجهزة",
    footer_text: "© 2026 CR7 Number Bot Support — جميع الحقوق محفوظة",
    tg_not_configured: "⚠️ التيليجرام غير مُعد — عيّن التوكن في الإعدادات",
    tg_test_success: "✅ التيليجرام شغال! تم إرسال رسالة اختبار",
    tg_test_fail: "❌ التيليجرام مش شغال — تحقق من التوكن والـ Chat ID"
  },
  en: {
    site_name: "CR7 Number Bot Support",
    tagline: "Professional Number Bot",
    hero_line2: "CR7 Number Bot",
    hero_desc: "24/7 Professional Technical Support",
    btn_bot: "Number Bot",
    btn_support: "Contact Support",
    loading: "CR7 Number Bot Support",
    chat_msg_ph: "Type your message...",
    nPh: "Enter your full name...",
    mPh: "Type your message here...",
    gr: "Welcome to CR7 Support! 👋",
    np: "Please enter your full name (two parts) to continue:",
    mR: "✅ Your message has been received",
    mR2: "🕐 We'll reply shortly",
    on: "Meedo: Online 🟢",
    off: "Meedo: Offline 🔴",
    end: "End Chat",
    snd: "Send",
    cEnd: "Are you sure you want to end the chat?",
    cY: "Yes, End",
    cN: "No, Go Back",
    eDone: "✅ Chat ended.",
    nShort: "❌ Each word ≥ 2 chars.",
    nSingle: "❌ Enter at least two words.",
    nBad: "❌ Name contains inappropriate words.",
    nRep: "❌ Excessive repetition.",
    nSym: "❌ No numbers or symbols.",
    nFake: "❌ Enter your real name.",
    nShortT: "❌ Name too short.",
    sent: "✅ Sent",
    err: "❌ Error",
    sending: "Sending...",
    newMsg: "New message from support 💬",
    voice_start: "🎤 Start recording",
    voice_stop: "⏹️ Stop recording",
    voice_unsupported: "Voice recording unsupported",
    end_confirm_title: "End Chat",
    chat_title: "CR7 Support",
    chat_status: "Meedo: Offline 🔴",
    features_title: "Core Features",
    feat_instant: "Instant Response",
    feat_instant_desc: "Messages delivered directly to support",
    feat_secure: "Secure & Private",
    feat_secure_desc: "Encrypted conversations",
    feat_lang: "Multi-Language",
    feat_lang_desc: "Arabic & English support",
    feat_responsive: "Responsive",
    feat_responsive_desc: "Works on all devices",
    footer_text: "© 2026 CR7 Number Bot Support — All rights reserved",
    tg_not_configured: "⚠️ Telegram not configured — set token in settings",
    tg_test_success: "✅ Telegram works! Test message sent",
    tg_test_fail: "❌ Telegram not working — check token and Chat ID"
  }
};

function detectBrowserLang() {
  const saved = localStorage.getItem("cr7_lang");
  if (saved === "ar" || saved === "en") return saved;

  const langs = navigator.languages || [navigator.language || "ar"];
  for (const lang of langs) {
    if (lang.startsWith("ar")) return "ar";
    if (lang.startsWith("en")) return "en";
  }

  return "ar";
}

let currentLang = detectBrowserLang();

function getLang() { return currentLang; }
function setLang(lang) { currentLang = lang; }

function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] || key);
}

function applyLang(lang) {
  setLang(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  localStorage.setItem("cr7_lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });

  document.title = t("site_name");

  document.dispatchEvent(new CustomEvent("langChanged", { detail: { lang } }));
}
