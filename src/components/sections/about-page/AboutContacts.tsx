import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiRich as R } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";

/** The rows, in the owner's order; their values come later (the owner): until then, a quiet placeholder */
const ROWS = ["tg", "phone", "mail", "fop"] as const;

/**
 * 4 · Контакти: a plain list, no cards (Telegram, phone, e-mail, the legal entity), when we answer, and the page's one
 * lime button: «Обговорити проєкт», to the main page's form. The rows come in one after another as the list reaches the
 * screen (React Bits' Animated List: a short rise from a little smaller; runtime: [data-in]).
 */
export async function AboutContacts({ index }: { index: number }) {
  const t = await getTranslations("about");
  const form = `${aiHref(await getLocale(), "/")}#contact`;
  return (
    <section className="section about-contacts" id="contacts" aria-labelledby="contacts-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("contacts.meta")}</span>
          </p>
          <h2 className="s-head__title" id="contacts-title" data-split="">
            <span className="tone">{t.rich("contacts.title", R)}</span>
          </h2>
        </header>
        <div className="about-cols">
          <div className="about-contacts__in">
            <dl className="about-contacts__list">
              {ROWS.map((k) => (
                <div className="about-contacts__row" data-in="" key={k}>
                  <dt>{t(`contacts.${k}`)}</dt>
                  <dd className="is-empty">{t("contacts.empty")}</dd>
                </div>
              ))}
            </dl>
            <p className="about-contacts__note" data-sr="">{t("contacts.note")}</p>
            <div data-sr="">
              <ButtonLink href={form} variant="primary">{t("contacts.go")}</ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
