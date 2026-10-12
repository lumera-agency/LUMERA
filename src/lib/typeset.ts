/*
 * Typesetting for Ukrainian and Russian: no-break spaces glue one- and two-letter words and short
 * prepositions or conjunctions to the next word, and a spaced dash to the word before it, so no
 * line ends on «і», «в», «до» («и», «с», «что»), a short word closing a clause never starts a line,
 * and no line starts with «—». Applied once to every message (i18n/request.ts), so the server
 * already sends glued text.
 */
const NBSP = " ";
const SHORT = "[а-яёіїєґыэъ]{1,2}|від|для|під|над|при|про|без|між|щоб|або|але|под|что|как|или|где";
const GLUE_AFTER = new RegExp(`(?<=^|[\\s(«„"—–>])(${SHORT})[ \\t\\r\\n]+(?=\\S|$)`, "giu");
const GLUE_DASH = /[ \t\r\n]+(?=[—–](?:[ \t\r\n]|$))/g;
const GLUE_BEFORE = /[ \t\r\n]+(?=[а-яёіїєґыэъ]{1,2}[,.;:!?](?:\s|$))/giu;
const GLUE_INITIALS =
  /[ \t\r\n]+(?=[А-ЯЁІЇЄҐA-Z]\.[ \t\r\n ]?[А-ЯЁІЇЄҐA-Z]\.)|(?<=[А-ЯЁІЇЄҐA-Z]\.)[ \t\r\n]+(?=[А-ЯЁІЇЄҐA-Z]\.)/g;

export const typo = (text: string) =>
  text.replace(GLUE_AFTER, `$1${NBSP}`).replace(GLUE_BEFORE, NBSP).replace(GLUE_DASH, NBSP).replace(GLUE_INITIALS, NBSP);

type Messages = { [key: string]: string | Messages };

/** Every string in a messages tree, typeset. */
export function typesetMessages<T extends Messages>(messages: T): T {
  const walk = (node: Messages): Messages =>
    Object.fromEntries(Object.entries(node).map(([k, v]) => [k, typeof v === "string" ? typo(v) : walk(v)]));
  return walk(messages) as T;
}
