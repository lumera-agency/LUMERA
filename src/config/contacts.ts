/**
 * The studio's phones and messengers: the header's contact pill, the phone menu. One place to change them.
 *
 * The studio's real numbers since 12 Nov 2026 (the owner; until then examples, see EXAMPLE_PHONES). Until the accounts
 * exist, Telegram and Viber open a chat with the first number; a Telegram username (no @) takes over once it is set.
 *
 * The structured data for search engines and AI (components/seo) and /llms.txt read the studio's contacts from here
 * too: the mail and the profiles at once, the phones only when they are not the old examples (realPhones).
 */
export const CONTACTS = {
  phones: ["+380680986698", "+380661986698"],
  telegram: null as string | null,
  viber: null as string | null,
  /** the studio's mail (the owner, 12 Nov 2026) */
  email: "hello@eclo.com.ua",
  /** the studio's profiles elsewhere (Instagram, LinkedIn, Clutch …), full addresses: the structured data names them
   *  as the same studio (sameAs). None yet (12 Nov 2026). */
  profiles: [] as string[],
};

/** The example numbers the site carried until 12 Nov 2026 (the owner, 28 Oct). A search engine or an AI would take a
 *  number in the structured data as the studio's, so these never go there, should they ever come back. */
const EXAMPLE_PHONES = ["+380670000001", "+380500000002"];
export const realPhones = () => CONTACTS.phones.filter((n) => !EXAMPLE_PHONES.includes(n));

/** +380670000001 → «+380 67 000 00 01» */
export const phoneText = (n: string) => n.replace(/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/, "+380 $1 $2 $3 $4");
export const telHref = (n: string) => `tel:${n}`;
export const telegramHref = () => (CONTACTS.telegram ? `https://t.me/${CONTACTS.telegram}` : `https://t.me/${CONTACTS.phones[0]}`);
export const viberHref = () => `viber://chat?number=${encodeURIComponent(CONTACTS.viber ?? CONTACTS.phones[0])}`;
