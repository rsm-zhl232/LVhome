// Language state. Strings are { en, zh } objects or plain strings.

const KEY = 'livy.lang';
const listeners = new Set();

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {}
  return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

let lang = initial();
document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (next === lang) return;
  lang = next;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try { localStorage.setItem(KEY, lang); } catch {}
  listeners.forEach((fn) => fn(lang));
}

export function toggleLang() {
  setLang(lang === 'en' ? 'zh' : 'en');
}

export function onLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[lang] ?? value.en ?? '';
}

// Fills every [data-i18n="key"] element from a dictionary of { en, zh }.
export function applyStatic(dict, root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const entry = dict[el.dataset.i18n];
    if (entry) el.textContent = t(entry);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const entry = dict[el.dataset.i18nTitle];
    if (entry) {
      el.title = t(entry);
      el.setAttribute('aria-label', t(entry));
    }
  });
}
