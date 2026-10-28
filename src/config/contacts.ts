/**
 * The studio's phones and messengers: the header's contact pill, the phone menu. One place to change them.
 *
 * EXAMPLES for now (the owner, 28 Oct: «возьмем пока примеры украинского номера, потом поставим реальные»): replace
 * them with the real numbers before the site goes live. Until the accounts exist, Telegram and Viber open a chat with
 * the first number; a Telegram username (no @) takes over once it is set.
 */
export const CONTACTS = {
  phones: ["+380670000001", "+380500000002"],
  telegram: null as string | null,
  viber: null as string | null,
};

/** +380670000001 → «+380 67 000 00 01» */
export const phoneText = (n: string) => n.replace(/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/, "+380 $1 $2 $3 $4");
export const telHref = (n: string) => `tel:${n}`;
export const telegramHref = () => (CONTACTS.telegram ? `https://t.me/${CONTACTS.telegram}` : `https://t.me/${CONTACTS.phones[0]}`);
export const viberHref = () => `viber://chat?number=${encodeURIComponent(CONTACTS.viber ?? CONTACTS.phones[0])}`;
