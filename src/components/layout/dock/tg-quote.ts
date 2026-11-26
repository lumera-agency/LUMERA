/*
 * «Отримати розрахунок у Telegram» beside a calculator's sum (the owner, 26 Nov 2026: «з підставленим текстом»): a link
 * to the studio's Telegram whose message box comes filled with what the visitor counted. Telegram takes the text as
 * ?text= on a chat link, by username or by phone number (core.telegram.org/api/links).
 *
 * The calculators mark their parts, so one listener serves the main page's configurator, the sites page and the AI
 * page alike: the link carries data-tg-quote (its plain href is the chat itself, and data-tg-hello / data-tg-from the
 * message's first and last lines), its card data-tg-card, and the card's lines data-tg-line="n" (the message's order;
 * parts with the same n go on one line). The text is read as the link is pressed, focused or long-pressed, so it is
 * always the sum on the screen.
 */

const QUOTE = "a[data-tg-quote]";

/** a part's words as a screen reader hears them: its own letters (not the ones a style puts in capitals), without the
 *  parts drawn for the eye alone (an animated number's digit reels, a price's «+$400» flash: aria-hidden) and without
 *  what is not shown */
function readable(part: HTMLElement): string {
  let out = "";
  const walk = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    const host = node.parentElement;
    if (!host || host.closest('[aria-hidden="true"]') || !host.getClientRects().length) continue;
    out += node.nodeValue ?? "";
  }
  return out.replace(/\s+/g, " ").trim();
}

/** the message: the greeting, the card's shown lines in their order, where it was counted */
export function quoteText(link: HTMLElement): string {
  const card = link.closest<HTMLElement>("[data-tg-card]");
  const lines = new Map<number, string[]>();
  for (const part of card ? card.querySelectorAll<HTMLElement>("[data-tg-line]") : []) {
    if (part.closest("[hidden]") || !part.getClientRects().length) continue;
    const text = readable(part);
    if (!text) continue;
    // (an empty mark: a part shown but not the visitor's choice, an offered monthly sum)
    if (!part.dataset.tgLine) continue;
    const n = Number(part.dataset.tgLine) || 0;
    lines.set(n, [...(lines.get(n) ?? []), text]);
  }
  const body = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, parts]) => parts.join(" "));
  const from = `${link.dataset.tgFrom ?? ""} ${location.host}${location.pathname}`.trim();
  return [link.dataset.tgHello ?? "", ...body, from].filter(Boolean).join("\n");
}

/** the chat's link with the message in it */
function fill(link: HTMLAnchorElement) {
  const base = link.dataset.tgBase ?? link.getAttribute("href") ?? "";
  if (!link.dataset.tgBase) link.dataset.tgBase = base;
  const url = new URL(base, location.href);
  url.searchParams.set("text", quoteText(link));
  link.href = url.toString();
}

/** one listener for every quote link on the page, now and later (the calculators draw theirs as they load) */
export function listenTgQuotes() {
  const onEvent = (e: Event) => {
    const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>(QUOTE);
    if (link) fill(link);
  };
  const types = ["pointerdown", "focusin", "click", "contextmenu"] as const;
  // (capture: filled before the link's own default, and before any other listener reads it)
  for (const type of types) document.addEventListener(type, onEvent, true);
  return () => {
    for (const type of types) document.removeEventListener(type, onEvent, true);
  };
}
