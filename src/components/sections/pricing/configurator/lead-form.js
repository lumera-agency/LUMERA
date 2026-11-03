/**
 * The configurator's own lead form, kept for when a lead channel exists (pd6 §14, step 7). NOT MOUNTED:
 * today «Обговорити проєкт» fills the page's contact form (#contact) instead (sections.js onDiscuss).
 * Moved out of the old configurator template unchanged in behaviour: validate name + contact, build the
 * payload (engine.js), send it (submitLead → /api/lead, or onLead), then show what was sent.
 *
 *   mountLeadForm(host, { lang, getConfig, getLabel, onLead, onBack, onAgain }) → { destroy() }
 * Its look is the old .cfg-form / .cfg-sent markup; style it when it is mounted.
 */
import { calculateProject, money, parseContact, buildLeadPayload, submitLead } from './engine.js';
import { STRINGS } from './strings.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountLeadForm(host, { lang = 'uk', getConfig, getLabel = () => '', onLead, onBack, onAgain } = {}) {
  const t = STRINGS[lang];
  const f = t.form, s = t.sent;
  host.innerHTML = `
    <form class="cfg-form" novalidate>
      <div class="cfg-form__top"><span class="cfg-form__title">${esc(f.title)}</span><button type="button" class="cfg-link" data-lf="back">${esc(f.back)}</button></div>
      <div class="cfg-form__sum"><strong data-lf="name"></strong><span data-lf="price"></span></div>
      <div class="cfg-form__fields">
        <label class="cfg-field">${esc(f.name)}<input name="name" type="text" autocomplete="name" required></label>
        <label class="cfg-field">${esc(f.contact)}<input name="contact" type="text" autocomplete="email" required></label>
        <label class="cfg-field cfg-field--full"><span>${esc(f.company)} <span>${esc(f.optional)}</span></span><input name="company" type="text" autocomplete="organization"></label>
      </div>
      <span class="cfg-error" role="alert" data-lf="error"></span>
      <div class="cfg-form__send"><button type="submit" class="btn btn--primary btn--sm" data-lf="submit"><span class="btn__label">${esc(f.submit)}</span></button><span class="cfg-small">${esc(f.privacy)}</span></div>
    </form>
    <div class="cfg-sent" hidden>
      <span class="cfg-form__title" data-lf="sent-title"></span>
      <span>${esc(s.lead)}</span>
      <dl data-lf="sent-rows"></dl>
      <button type="button" class="cfg-link" data-lf="again">${esc(s.again)}</button>
    </div>`;
  const $ = (k) => host.querySelector(`[data-lf="${k}"]`);
  const form = host.querySelector('form');
  const sent = host.querySelector('.cfg-sent');
  let sending = false;

  const p = calculateProject(getConfig());
  $('name').textContent = getLabel();
  $('price').textContent = money(p.once) + ' ' + t.once + (p.monthly ? ' · +' + money(p.monthly) + t.perMonth : '');

  host.addEventListener('click', (e) => {
    const k = e.target.closest('[data-lf]')?.dataset.lf;
    if (k === 'back') onBack?.();
    if (k === 'again') { sent.hidden = true; form.hidden = false; onAgain?.(); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const data = { name: form.elements.name.value, contact: form.elements.contact.value, company: form.elements.company.value };
    const err = $('error');
    form.elements.name.removeAttribute('aria-invalid');
    form.elements.contact.removeAttribute('aria-invalid');
    const fail = (message, input) => { err.textContent = message; input.setAttribute('aria-invalid', 'true'); input.focus(); };
    if (!data.name.trim()) return fail(f.errName, form.elements.name);
    if (!parseContact(data.contact)) return fail(f.errContact, form.elements.contact);
    err.textContent = '';
    const payload = buildLeadPayload(getConfig(), data, lang, getLabel());
    const button = $('submit');
    sending = true;
    button.disabled = true;
    button.querySelector('.btn__label').textContent = f.sending;
    try {
      await (onLead ? onLead(payload) : submitLead(payload));
      host.dispatchEvent(new CustomEvent('eclo:configurator-lead', { bubbles: true, detail: payload }));
      const c = payload.contact;
      $('sent-title').textContent = s.title(data.name.trim());
      const rows = [
        [s.rows.project, payload.project.label],
        [s.rows.price, money(payload.estimate.once) + (payload.estimate.monthly ? ' + ' + money(payload.estimate.monthly) + t.perMonth : '')],
        [s.rows.weeks, payload.estimate.timelineMin == null ? '—' : t.weeks(payload.estimate.timelineMin, payload.estimate.timelineMax)],
        [s.rows.scope, payload.estimate.lines.map((l) => t.items[l.id][0]).join(', ')],
        [s.rows.contact, c.email || c.telegram || c.phone],
      ];
      $('sent-rows').innerHTML = rows.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
      form.hidden = true;
      sent.hidden = false;
    } catch (error) {
      console.error('[configurator] lead not sent', error);
      err.textContent = f.errSend;
    } finally {
      sending = false;
      button.disabled = false;
      button.querySelector('.btn__label').textContent = f.submit;
    }
  });

  return { destroy() { host.innerHTML = ''; } };
}
