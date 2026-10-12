/*
 * 8 · Заявка, the form (ported 1:1 from website-v2/js/sections.js, framework-free): chips for the
 * task, validation, the plan chosen in the configurator, sending to /api/lead (on a local host a
 * missing endpoint is only simulated), the sent state. goToForm() glides to the form and focuses it.
 */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', ''];
const LOCAL = LOCAL_HOSTS.includes(location.hostname) || /^(192\.168|10)\./.test(location.hostname);
const simulate = (reducedMotion) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : 900));
async function sendLead(form, reducedMotion) {
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

function initForm(reducedMotion) {
  const form = $('[data-lead-form]');
  const noop = { setPlan() {}, setTask() {} };
  if (!form) return noop;

  // which language the visitor wrote in, for whoever answers the lead
  const langInput = $('[data-form-lang]', form);
  if (langInput) langInput.value = document.documentElement.lang;
  const planBox = $('[data-form-plan]', form);
  const planName = $('[data-form-plan-name]', form);
  const planInput = $('[data-form-plan-input]', form);
  const planItems = $('[data-form-plan-items]', form);
  const planDetails = $('[data-form-plan-details]', form);
  const errors = $('[data-form-errors]', form);
  const errorList = $('ul', errors);
  const done = $('[data-form-done]', form);
  const submit = $('[data-form-submit]', form);
  const chips = $('.field--chips', form);

  const fail = $('[data-form-fail]', form);
  const failServer = $('[data-form-fail-server]', form);

  const rules = {
    name: {
      field: () => form.elements.name,
      ok: () => form.elements.name.value.trim().length >= 2,
      error: 'f-name-err',
    },
    contact: {
      field: () => form.elements.contact,
      ok: () => {
        const v = form.elements.contact.value.trim();
        // a Telegram username starts with a letter; a bare 5–8 digit number is a phone with digits missing
        return /^@?[a-z][a-z0-9_]{4,31}$/i.test(v) || /^\S+@\S+\.\S+$/.test(v) || v.replace(/\D/g, '').length >= 9;
      },
      error: 'f-contact-err',
    },
    task: {
      field: () => $('#f-task', form),
      // a chosen plan already says what the task is
      ok: () => Boolean(form.querySelector('input[name="task"]:checked')) || Boolean(planInput.value),
      error: 'f-task-err',
    },
  };
  const touched = new Set();
  const showError = (key, show) => {
    $(`#${rules[key].error}`).hidden = !show;
    if (key === 'task') chips.classList.toggle('is-invalid', show);
    else if (show) rules[key].field().setAttribute('aria-invalid', 'true');
    else rules[key].field().removeAttribute('aria-invalid');
    // the summary at the top lists only what is still wrong; once it is empty, it goes
    if (!show) {
      errorList.querySelector(`li[data-key="${key}"]`)?.remove();
      if (!errors.hidden && !errorList.children.length) errors.hidden = true;
    }
  };

  // `details`: the configurator's items with their prices (block 6), shown under the plan and sent with it
  const setPlan = (name, details = []) => {
    planBox.hidden = !name;
    planName.textContent = name || '';
    planInput.value = name || '';
    const items = name ? details : [];
    if (planItems) planItems.textContent = items.join(' · ');
    if (planDetails) planDetails.value = items.join('\n');
    if (name) showError('task', false);
  };
  $('[data-form-plan-clear]', form).addEventListener('click', () => {
    setPlan(null);
    form.elements.name.focus();
  });

  for (const key of ['name', 'contact']) {
    const el = rules[key].field();
    el.addEventListener('blur', () => {
      if (el.value.trim()) touched.add(key);
      if (touched.has(key)) showError(key, !rules[key].ok());
    });
    let valid = rules[key].ok();
    el.addEventListener('input', () => {
      if (touched.has(key) && rules[key].ok()) showError(key, false);
      const now = rules[key].ok();
      if (now && !valid) document.dispatchEvent(new CustomEvent('stone:turn', { detail: { turn: 0.12 } }));
      valid = now;
    });
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'task') showError('task', false);
  });

  const setTask = (value) => {
    const radio = $$('input[name="task"]', form).find((r) => r.value === value);
    if (radio) {
      radio.checked = true;
      showError('task', false);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = Object.keys(rules).filter((key) => !rules[key].ok());
    for (const key of Object.keys(rules)) {
      touched.add(key);
      showError(key, invalid.includes(key));
    }
    if (invalid.length) {
      errorList.replaceChildren(
        ...invalid.map((key) => {
          const li = document.createElement('li');
          li.dataset.key = key;
          const a = document.createElement('a');
          const field = rules[key].field();
          a.href = `#${field.id}`;
          a.textContent = $(`#${rules[key].error}`).textContent;
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            field.focus();
          });
          li.append(a);
          return li;
        }),
      );
      errors.hidden = false;
      errors.focus();
      return;
    }

    if (submit.disabled) return; // already on its way: a second tap doesn't send it twice
    errors.hidden = true;
    fail.hidden = true;
    if (failServer) failServer.hidden = true;
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      await sendLead(form, reducedMotion);
      form.classList.add('is-sent');
      document.dispatchEvent(new CustomEvent('stone:flash', { detail: { env: 0.5 } }));
      done.hidden = false;
      done.focus();
    } catch (error) {
      console.warn('[form] the lead was not sent.', error);
      // the site's failure is not the visitor's connection
      const message = error?.server && failServer ? failServer : fail;
      message.hidden = false;
      message.focus?.();
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });

  return { setPlan, setTask };
}

/* ---------- 04 · stacking cards ----------
   Rows stick under the nav (each 14 px lower → a visible deck) and the next
   one slides over the previous. While a card is being covered it eases back
   (scale 0.94) and fades into the page, leaving only its hairline in the deck.
   Only with motion and where every card fits the viewport. */

export function goToForm(reducedMotion) {
  const section = $('#contact');
  const form = $('[data-lead-form]');
  if (!section) return;
  const stacked = form && form.getBoundingClientRect().top - section.getBoundingClientRect().top > window.innerHeight * 0.5;
  (stacked ? form : section).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  // the form is still fading in while the page glides there, and a hidden field can't take
  // focus: keep trying until it does (≤ 2.5 s)
  const field = $('#f-name');
  let tries = 0;
  const focus = () => {
    field?.focus({ preventScroll: true });
    if (field && document.activeElement !== field && ++tries < 16) setTimeout(focus, 150);
  };
  setTimeout(focus, reducedMotion ? 0 : 400);
}

let api = { setPlan() {}, setTask() {} };
let started = false;
/** Once per page; the configurator hands its plan to the form through leadForm(). */
export function startForm(reducedMotion) {
  if (!started) {
    started = true;
    api = initForm(reducedMotion);
  }
  return api;
}
export const leadForm = () => api;
