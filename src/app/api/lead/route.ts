/**
 * POST /api/lead — the contact form's request (8 · Заявка, lead-form.js) → the studio.
 *
 * Where it goes is set in the host's environment, never in the code:
 *   LEAD_WEBHOOK_URL                       any webhook (n8n, Make, a CRM) that takes the JSON as is; or
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  a Telegram bot that writes the request to a chat.
 * With neither set it answers 503, and the form tells the visitor the failure is on our side.
 * `fax` is a field people never see: a bot that fills it is thanked and ignored.
 *
 * Only the site's own forms get through (the 13 Nov 2026 audit). They send JSON from the same origin: another site
 * cannot make its visitors' browsers post here (JSON needs a CORS preflight this route never grants, and the browser
 * names a cross-site request). In Telegram what a visitor typed arrives as code, so a link in it cannot be tapped; only
 * a contact that looks like a phone, a mail or an @username stays live, to answer. A flood from one address is the
 * host's to stop: a Vercel Firewall rate limit on this path.
 */
import { brandName, siteUrl } from "@/config/site";

const MAX_BODY = 16000; // bytes

const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
/** one line: a line break in a name or a contact cannot fake the message's next field */
const line = (v: unknown, n: number) => str(v, n).replace(/[\r\n\u2028\u2029]+/g, " ");

type Lead = ReturnType<typeof clean>;
function clean(body: Record<string, unknown>) {
  return {
    name: line(body.name, 120),
    contact: line(body.contact, 160),
    task: line(body.task, 80),
    package: line(body.package, 240),
    details: str(body.details, 1500),
    site: line(body.site, 240),
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
    path = new URL(page, siteUrl).pathname;
  } catch {
    return "";
  }
  return /^\/(ru\/?)?$/.test(path) ? "" : `Страница: ${path}`;
}

/** A contact the studio answers with one tap: a phone, a mail or a Telegram @username; anything else arrives as code. */
const LIVE_CONTACT = /^(\+?[\d\s()-]{7,20}|[^\s@]+@[^\s@]+\.[^\s@]+|@?[A-Za-z][A-Za-z0-9_]{4,31})$/;

/** Telegram refuses a message over 4096 characters: a long request is cut, never lost. */
const TELEGRAM_MAX = 4096;

/** The message and its entities (UTF-16 offsets, as JavaScript counts): our labels as plain text, what the visitor
 *  typed as code. */
function telegramMessage(lead: Lead) {
  const fields: [label: string, value: string, code: boolean][] = [
    ["Имя: ", lead.name, true],
    ["Контакт: ", lead.contact, !LIVE_CONTACT.test(lead.contact)],
    ["Задача: ", lead.task, true],
    ["Выбрано в калькуляторе: ", lead.package, true],
    ["Состав:\n", lead.details, true],
    ["Сайт: ", lead.site, true],
    ["Комментарий: ", lead.note, true],
  ];
  let text = `Новая заявка с сайта ${brandName}`;
  const entities: { type: "code"; offset: number; length: number }[] = [];
  for (const [label, value, code] of fields) {
    if (!value) continue;
    text += `\n${label}`;
    if (code) entities.push({ type: "code", offset: text.length, length: value.length });
    text += value;
  }
  text += `\n${[pageLine(lead.page), `Язык страницы: ${lead.lang.toUpperCase()}`].filter(Boolean).join("\n")}`;
  if (text.length <= TELEGRAM_MAX) return { text, entities };
  const end = TELEGRAM_MAX - 1;
  return {
    text: `${text.slice(0, end)}…`,
    entities: entities.filter((e) => e.offset < end).map((e) => ({ ...e, length: Math.min(e.length, end - e.offset) })),
  };
}

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status });

/** The site's own forms only: JSON, from this very origin (the browser's Sec-Fetch-Site and Origin say so). */
function fromOwnPage(request: Request) {
  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return 415;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return 403;
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    try {
      if (new URL(origin).host !== host) return 403;
    } catch {
      return 403; // «null» and other non-URLs
    }
  }
  return 0;
}

export async function POST(request: Request) {
  const refused = fromOwnPage(request);
  if (refused) return fail(refused, refused === 415 ? "unsupported" : "forbidden");
  // the size in bytes, before and after reading (a Cyrillic letter is two)
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return fail(413, "too large");
  const raw = await request.arrayBuffer();
  if (raw.byteLength > MAX_BODY) return fail(413, "too large");
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(raw) || "{}");
  } catch {
    return fail(400, "bad request");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "bad request");
  const fields = body as Record<string, unknown>;
  if (str(fields.fax, 200)) return Response.json({ ok: true }); // a bot: nothing is sent

  const lead = clean(fields);
  // the same minimum the form checks: a name and a way to reach the person
  if (lead.name.length < 2 || lead.contact.length < 3) return fail(422, "name and contact required");

  const { LEAD_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!LEAD_WEBHOOK_URL && !(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)) {
    console.error("[lead] no channel: set LEAD_WEBHOOK_URL or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID");
    return fail(503, "no channel");
  }
  try {
    let r: Response;
    if (LEAD_WEBHOOK_URL) {
      r = await fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
      });
    } else {
      const send = () =>
        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, ...telegramMessage(lead), link_preview_options: { is_disabled: true } }),
        });
      r = await send();
      // the chat's limit (about 20 messages a minute): wait as Telegram says, once, so a real lead is not lost
      if (r.status === 429) {
        const wait = Number((await r.json().catch(() => null))?.parameters?.retry_after ?? 0);
        if (wait > 0 && wait <= 5) {
          await new Promise((done) => setTimeout(done, wait * 1000));
          r = await send();
        }
      }
    }
    if (!r.ok) throw new Error(`channel answered ${r.status}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[lead]", (error as Error).message);
    return fail(502, "not delivered");
  }
}
