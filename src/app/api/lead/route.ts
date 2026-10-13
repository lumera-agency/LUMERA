/**
 * POST /api/lead — the contact form's request (8 · Заявка, lead-form.js) → the studio.
 *
 * Where it goes is set in the host's environment, never in the code:
 *   LEAD_WEBHOOK_URL                       any webhook (n8n, Make, a CRM) that takes the JSON as is; or
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  a Telegram bot that writes the request to a chat.
 * With neither set it answers 503, and the form tells the visitor the failure is on our side.
 * `fax` is a field people never see: a bot that fills it is thanked and ignored.
 */
const MAX_BODY = 16000; // bytes

const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

type Lead = ReturnType<typeof clean>;
function clean(body: Record<string, unknown>) {
  return {
    name: str(body.name, 120),
    contact: str(body.contact, 160),
    task: str(body.task, 80),
    package: str(body.package, 240),
    details: str(body.details, 1500),
    site: str(body.site, 240),
    note: str(body.note, 2000),
    lang: body.lang === "ru" ? "ru" : "uk",
    page: str(body.page, 300),
    sentAt: str(body.sentAt, 40),
  };
}

/** «Страница: …» for a lead sent from anywhere but the main page (/ or /ru). */
function pageLine(page: string) {
  let path = "";
  try {
    path = new URL(page, "https://lumera.local").pathname;
  } catch {
    return "";
  }
  return /^\/(ru\/?)?$/.test(path) ? "" : `Страница: ${path}`;
}

function telegramText(lead: Lead) {
  return [
    "Новая заявка с сайта Lumera",
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    lead.task && `Задача: ${lead.task}`,
    lead.package && `Выбрано в калькуляторе: ${lead.package}`,
    lead.details && `Состав:\n${lead.details}`,
    lead.site && `Сайт: ${lead.site}`,
    lead.note && `Комментарий: ${lead.note}`,
    pageLine(lead.page),
    `Язык страницы: ${lead.lang.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ ok: false, error: "too large" }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw || "{}");
  } catch {
    return Response.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  if (str(body.fax, 200)) return Response.json({ ok: true }); // a bot: nothing is sent

  const lead = clean(body);
  // the same minimum the form checks: a name and a way to reach the person
  if (lead.name.length < 2 || lead.contact.length < 3) return Response.json({ ok: false, error: "name and contact required" }, { status: 422 });

  const { LEAD_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!LEAD_WEBHOOK_URL && !(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)) {
    console.error("[lead] no channel: set LEAD_WEBHOOK_URL or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID");
    return Response.json({ ok: false, error: "no channel" }, { status: 503 });
  }
  try {
    const r = LEAD_WEBHOOK_URL
      ? await fetch(LEAD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
        })
      : await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: telegramText(lead), disable_web_page_preview: true }),
        });
    if (!r.ok) throw new Error(`channel answered ${r.status}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[lead]", (error as Error).message);
    return Response.json({ ok: false, error: "not delivered" }, { status: 502 });
  }
}
