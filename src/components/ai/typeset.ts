/*
 * One more typesetting rule for the AI pages' messages (on top of lib/typeset, which the whole site uses): a number
 * stays with its unit or with the next group of three digits — «15 хвилин», «20 000 ₴», «≈ 2 500 €», «6 км» never
 * break across lines. Applied once, on the server (i18n/request.ts), to messages/ai only.
 */
const NBSP = " ";
const GLUE_NUMBER =
  /(?<=\d)[ \t\r\n]+(?=(?:\d{3}\b|€|₴|\$|грн|км|km|хв|мин|м²|m²|хвилин|хвилини|минут|минуты|годин|година|часа|час|оголошень|объявлений|тиж|нед|дн))/gu;
const GLUE_APPROX = /(?<=≈)[ \t\r\n]+(?=\d)/g;

type Messages = { [key: string]: string | Messages };

export function glueNumbers<T extends Messages>(messages: T): T {
  const walk = (node: Messages): Messages =>
    Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, typeof v === "string" ? v.replace(GLUE_NUMBER, NBSP).replace(GLUE_APPROX, NBSP) : walk(v)]),
    );
  return walk(messages) as T;
}
