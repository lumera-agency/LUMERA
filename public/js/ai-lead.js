/*
 * The case page's copies of two pieces of the main page's js/sections.js, kept identical in behaviour
 * so both pages read and send the same way, but separate so neither page depends on the other:
 *   - typesetText: no-break spaces for Ukrainian and Russian copy;
 *   - sendLead: the lead request to the form's data-endpoint (/api/lead), the same JSON body;
 *   - contactOk: the same check of the contact field.
 */

/* ---------- typesetting (Ukrainian and Russian) ----------
   No-break spaces glue one- and two-letter words and short prepositions or
   conjunctions to the next word, and a spaced dash to the word before it, so
   no line ends on "і", "в", "до", "та" ("и", "с", "что"), a short word that
   closes a clause never starts a line, and no line starts with "—". */
const NBSP = ' ';
const SHORT = '[а-яёіїєґыэъ]{1,2}|від|для|під|над|при|про|без|між|щоб|або|але|под|что|как|или|где';
const GLUE_AFTER = new RegExp(`(?<=^|[\\s(«„"—–])(${SHORT})[ \\t\\r\\n]+(?=\\S|$)`, 'giu');
const GLUE_DASH = /[ \t\r\n]+(?=[—–](?:[ \t\r\n]|$))/g;
const ENDS_SHORT = new RegExp(`(?:^|[\\s(«„"—–])(?:${SHORT})$`, 'iu');
// a one- or two-letter word that closes a clause stays with the word before it ("пишемо ми,")
const GLUE_BEFORE = /[ \t\r\n]+(?=[а-яёіїєґыэъ]{1,2}[,.;:!?](?:\s|$))/giu;
// a number stays with its unit or sign: "15 хвилин", "≈2 500 €", "6 км"
const GLUE_NUMBER = /(?<=\d)[ \t\r\n]+(?=(?:\d{3}\b|€|км|km|хв|мин|м²|m²|хвилин|минут|оголошень|объявлений))/gu;
export const typo = (text) => text.replace(GLUE_AFTER, `$1${NBSP}`).replace(GLUE_BEFORE, NBSP).replace(GLUE_DASH, NBSP).replace(GLUE_NUMBER, NBSP);

export function typesetText(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement.closest('script, style, textarea, code, pre, [data-no-typo]')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const block = (node) => node.parentElement.closest('p, h1, h2, h3, h4, li, dd, summary, label, legend, button, a, div, td, th');
  let prev = null;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    let text = typo(node.data);
    // a short word closing one element and the space opening the next ("від</span> XX XXX")
    if (prev && block(prev) === block(node) && ENDS_SHORT.test(prev.data) && /^[ \t\r\n]+\S/.test(text)) {
      text = text.replace(/^[ \t\r\n]+/, NBSP);
    }
    if (text !== node.data) node.data = text;
    prev = node;
  }
}

/* ---------- the contact field: a phone (9+ digits), an e-mail or a Telegram @username ---------- */
export const contactOk = (value) => {
  const v = value.trim();
  return /^@?[a-z][a-z0-9_]{4,31}$/i.test(v) || /^\S+@\S+\.\S+$/.test(v) || v.replace(/\D/g, '').length >= 9;
};

/* ---------- the lead request ----------
   Sends the form to its data-endpoint (/api/lead, which forwards it to the channel set in the host's
   environment) as JSON, with the page's address (so the studio sees the request came from the case).
   A local preview has no such function (a static server answers 404/405/501): there the round-trip is
   only simulated. Anywhere else a failure is honest and says whose it is: `error.server` when the site
   answered but couldn't deliver. */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', ''];
const LOCAL = LOCAL_HOSTS.includes(location.hostname) || /^(192\.168|10)\./.test(location.hostname);
const simulate = (reducedMotion) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : 900));

export async function sendLead(form, reducedMotion) {
  const endpoint = (form.dataset.endpoint || '').trim();
  if (!endpoint) {
    if (!LOCAL) throw Object.assign(new Error('no endpoint configured'), { server: true });
    return simulate(reducedMotion);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), page: location.href, sentAt: new Date().toISOString() }),
      signal: controller.signal,
    });
    if (LOCAL && [404, 405, 501].includes(res.status)) return simulate(reducedMotion);
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { server: true });
  } finally {
    clearTimeout(timer);
  }
}
