/*
 * The two languages of the AI pages (/ai-avtomatyzatsiia/ and the case /keisy/poshuk-zamovlen/):
 * Ukrainian (default) and Russian.
 * Its own copy of the main page's js/i18n.js, so the two pages never depend on each other's
 * scripts. Same rules and the same storage keys, so the visitor's language carries over:
 *   - language: ?lang= in the URL, else the last choice (localStorage 'lumera:lang'), else Ukrainian;
 *   - the copy of both pages lives in /locales/ai-uk.json and /locales/ai-ru.json (absolute paths: the pages
 *     are folders); keys are prefixed ai.* (the AI page), case.* (the case), the rest are shared;
 *   - markup carries its keys: data-i18n (text), data-i18n-html (markup), data-i18n-attr="attr:key;…";
 *   - the UA · RU links reload the page in the other language at the same scroll position.
 * The inline script in <head> applies the same language rule before the first paint.
 */
export const LANGS = ['uk', 'ru'];
const DEFAULT_LANG = 'uk';
const STORE_KEY = 'lumera:lang';
const SCROLL_KEY = 'lumera:lang-scroll';
const dictionaryUrl = (lang) => `/locales/ai-${lang}.json`;

let dict = {};
let current = DEFAULT_LANG;

/** The active language code. */
export const getLang = () => current;

/** Translation for `key`, or `fallback` when the dictionary has none. */
export const t = (key, fallback = '') => dict[key] ?? fallback;

const read = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
const write = (storage, key, value) => { try { storage.setItem(key, value); } catch { /* private mode */ } };

function detectLang() {
  const param = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(param)) return param;
  const saved = read(localStorage, STORE_KEY);
  return LANGS.includes(saved) ? saved : DEFAULT_LANG;
}

/** Same page in `lang`: the default language has the clean URL. */
function urlFor(lang) {
  const url = new URL(location.href);
  url.hash = '';
  if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
  else url.searchParams.set('lang', lang);
  return url.pathname + url.search;
}

function applyKeys(root) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    const value = dict[el.dataset.i18n];
    if (value != null) el.textContent = value;
  }
  for (const el of root.querySelectorAll('[data-i18n-html]')) {
    const value = dict[el.dataset.i18nHtml];
    if (value != null) el.innerHTML = value;
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':');
      const value = dict[key];
      if (value != null) el.setAttribute(attr, value);
    }
  }
}

// the two pages share the dictionary: each one's title and description sit under its prefix
// (<html data-page="ai"> → ai.meta.title, data-page="case" → case.meta.title)
function applyAll() {
  applyKeys(document);
  const page = document.documentElement.dataset.page;
  const title = dict[`${page}.meta.title`];
  const description = dict[`${page}.meta.description`];
  if (title) document.title = title;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
}

/** UA · RU links: real links, the active one marked. */
function wireSwitchers() {
  for (const link of document.querySelectorAll('.lang__link[lang]')) {
    const target = link.getAttribute('lang');
    if (!LANGS.includes(target)) continue;
    link.href = urlFor(target);
    if (target === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (target === current) return;
      write(localStorage, STORE_KEY, target);
      write(sessionStorage, SCROLL_KEY, String(Math.round(window.scrollY)));
      location.assign(urlFor(target));
    });
  }
}

/** Links back to the main page: the Next.js site keeps Russian under /ru (/ru, /ru#faq). */
function wireMainLinks() {
  if (current === DEFAULT_LANG) return;
  for (const link of document.querySelectorAll('a[href="/"], a[href^="/#"]')) {
    link.setAttribute('href', `/${current}${link.getAttribute('href').slice(1)}`);
  }
}

/** Load the active dictionary and put its text into the page. */
export async function initI18n() {
  current = detectLang();
  write(localStorage, STORE_KEY, current);
  // keep the address honest: a saved choice shows as ?lang=ru, an explicit ?lang=uk (from the main page) goes away
  const param = new URLSearchParams(location.search).get('lang');
  if (param !== (current === DEFAULT_LANG ? null : current)) {
    history.replaceState(history.state, '', urlFor(current) + location.hash);
  }
  // the Ukrainian text is inline (the first paint): its dictionary is only needed for the other language
  // and for the few strings that exist only there; it is fetched anyway, so a copy edit in the JSON wins
  try {
    const response = await fetch(dictionaryUrl(current));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    dict = await response.json();
    applyAll();
  } catch (error) {
    // the inline Ukrainian text stays, so say so: <html lang> and the switch show UA
    console.warn(`[i18n] ${dictionaryUrl(current)} unavailable.`, error);
    current = DEFAULT_LANG;
  }
  document.documentElement.lang = current;
  wireSwitchers();
  wireMainLinks();
  document.documentElement.classList.remove('i18n-pending');
}

/** After a language switch, come back to where the visitor was reading. */
export function restoreScroll() {
  const y = read(sessionStorage, SCROLL_KEY);
  if (y == null) return false;
  try { sessionStorage.removeItem(SCROLL_KEY); } catch { /* private mode */ }
  window.scrollTo({ top: Number(y) || 0, behavior: 'instant' });
  return true;
}
