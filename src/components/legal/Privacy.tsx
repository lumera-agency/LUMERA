import { getLocale, getTranslations } from "next-intl/server";
import { CONTACTS, phoneText, realPhones, telHref } from "@/config/contacts";
import { studioName } from "@/config/site";
import { ButtonLink } from "@/components/ui/button/Button";
import { aiHref } from "@/components/ai/links";
import { Backdrop } from "./backdrop/Backdrop";

/*
 * «Політика конфіденційності»: what the site takes, why, where it goes, the cookies, how long, the visitor's rights.
 * Every statement is what the site does today (13 Nov 2026): the lead form (api/lead → the studio's Telegram chat, no
 * database), Vercel Web Analytics (no cookies), one cookie (NEXT_LOCALE, the language), the tab's own marks
 * (sessionStorage: the preloader, the light or full version, the place on a language switch), and nothing from another
 * host (the Content-Security-Policy refuses it). What only the owner can say is marked <todo> until he says it.
 */

/** the policy's parts in reading order: the anchor is the messages' key (privacy.<key>) */
export const PARTS = ["who", "data", "why", "where", "cookies", "keep", "rights", "safety", "changes"] as const;
/** the first screen is 1, then «Коротко», the parts, the questions */
export const INDEX = Object.fromEntries((["short", ...PARTS, "ask"] as const).map((key, i) => [key, i + 2])) as Record<string, number>;

const email = CONTACTS.email;
const tags = {
  email,
  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
  code: (chunks: React.ReactNode) => <code className="lg-code">{chunks}</code>,
  mail: (chunks: React.ReactNode) => (
    <a className="link" href={`mailto:${email}`}>
      {chunks}
    </a>
  ),
  todo: (chunks: React.ReactNode) => <mark className="lg-todo">{chunks}</mark>,
};

/** 1 · the first screen: the name of the document, what it is about, its date, and the contents */
export async function PrivacyHero() {
  const t = await getTranslations("privacy");
  const c = await getTranslations("aiCommon");
  const locale = await getLocale();
  const rows = ["short", ...PARTS, "ask"] as const;
  return (
    <section className="ai-hero lg-hero" id="top" aria-labelledby="lg-title">
      <Backdrop />
      <div className="ai-hero__in">
        <div className="ai-hero__copy">
          <nav className="ai-crumbs" aria-label={c("crumbs.label")}>
            <a href={aiHref(locale, "/")}>{studioName}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t("crumb")}</span>
          </nav>
          <h1 className="s-head__title s-head__title--stone ai-hero__title lg-hero__title" id="lg-title">
            <span className="tone">{t("hero.title")}</span>
          </h1>
          <p className="ai-hero__lead">{t("hero.lead")}</p>
          <ul className="ai-chips">
            <li>{t("hero.date")}</li>
            <li>{t("hero.chip")}</li>
          </ul>
        </div>
        <nav className="ai-hero__visual lg-toc" aria-labelledby="lg-toc">
          <p className="lg-toc__label" id="lg-toc">{t("hero.toc")}</p>
          <ol className="lg-toc__list">
            {rows.map((key) => (
              <li key={key}>
                <a className="lg-toc__row" href={`#${key}`}>
                  <span className="lg-toc__n">{INDEX[key]}</span>
                  <span className="lg-toc__name">{t(`nav.${key}`)}</span>
                  <svg className="lg-toc__go" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}

/** One part: the label on the page's line (its node lights as it passes), the title on the left, the text on the right */
function Part({ id, label, title, wide = false, children }: { id: string; label: string; title: React.ReactNode; wide?: boolean; children: React.ReactNode }) {
  return (
    <section className={`section lg-part${wide ? " lg-part--wide" : ""}`} id={id} aria-labelledby={`${id}-title`}>
      <div className="container lg-part__in">
        <header className="s-head lg-head">
          <p className="s-head__meta">
            <span className="s-head__index">{INDEX[id]}</span>
            <span>{label}</span>
          </p>
          <h2 className="lg-head__title" id={`${id}-title`} data-split="">
            {title}
          </h2>
        </header>
        <div className="lg-body">{children}</div>
      </div>
    </section>
  );
}

/** a part's list: the fact in bold first, its plain explanation after it */
function Rows({ ns, n }: { ns: string; n: number }) {
  return <RowsOf ns={ns} keys={Array.from({ length: n }, (_, i) => String(i + 1))} />;
}
async function RowsOf({ ns, keys }: { ns: string; keys: string[] }) {
  const t = await getTranslations(`privacy.${ns}`);
  return (
    <ul className="lg-rows">
      {keys.map((key) => (
        <li key={key} data-sr="">
          {t.rich(key, tags)}
        </li>
      ))}
    </ul>
  );
}

/** 2…11 · the policy itself */
export async function PrivacyParts() {
  const t = await getTranslations("privacy");
  const phones = realPhones();
  return (
    <>
      <Part id="short" label={t("nav.short")} title={t("short.title")} wide>
        <div className="lg-cards">
          {["1", "2", "3", "4"].map((key) => (
            <article className="card lg-card" key={key} data-sr="">
              <span className="lg-card__n" aria-hidden="true">{`0${key}`}</span>
              <h3 className="lg-card__t">{t(`short.${key}.t`)}</h3>
              <p className="lg-card__d">{t.rich(`short.${key}.d`, tags)}</p>
            </article>
          ))}
        </div>
      </Part>

      <Part id="who" label={t("nav.who")} title={t("who.title")}>
        <p className="lg-p" data-sr="">{t("who.p")}</p>
        <dl className="lg-facts" data-sr="">
          <div>
            <dt>{t("who.owner")}</dt>
            <dd>{t.rich("who.ownerValue", tags)}</dd>
          </div>
          <div>
            <dt>{t("who.mail")}</dt>
            <dd>
              <a className="link" href={`mailto:${email}`}>{email}</a>
            </dd>
          </div>
          {phones.length > 0 && (
            <div>
              <dt>{t("who.phones")}</dt>
              <dd className="lg-facts__phones">
                {phones.map((phone) => (
                  <a className="link" key={phone} href={telHref(phone)}>{phoneText(phone)}</a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </Part>

      <Part id="data" label={t("nav.data")} title={t("data.title")}>
        <Rows ns="data" n={5} />
      </Part>

      <Part id="why" label={t("nav.why")} title={t("why.title")}>
        <Rows ns="why" n={3} />
        <p className="lg-p lg-p--key" data-sr="">{t("why.p")}</p>
      </Part>

      <Part id="where" label={t("nav.where")} title={t("where.title")}>
        <p className="lg-p" data-sr="">{t("where.p")}</p>
        <p className="lg-p lg-p--lead-in" data-sr="">{t("where.via")}</p>
        <Rows ns="where" n={2} />
        <p className="lg-p" data-sr="">{t("where.none")}</p>
      </Part>

      <Part id="cookies" label={t("nav.cookies")} title={t("cookies.title")}>
        {["1", "2", "3"].map((key) => (
          <p className="lg-p" key={key} data-sr="">{t.rich(`cookies.${key}`, tags)}</p>
        ))}
      </Part>

      <Part id="keep" label={t("nav.keep")} title={t("keep.title")}>
        <p className="lg-p" data-sr="">{t("keep.1")}</p>
        <p className="lg-p" data-sr="">{t("keep.2")}</p>
      </Part>

      <Part id="rights" label={t("nav.rights")} title={t("rights.title")}>
        <Rows ns="rights" n={5} />
        <p className="lg-p lg-p--key" data-sr="">{t.rich("rights.how", tags)}</p>
      </Part>

      <Part id="safety" label={t("nav.safety")} title={t("safety.title")}>
        <Rows ns="safety" n={3} />
      </Part>

      <Part id="changes" label={t("nav.changes")} title={t("changes.title")}>
        <p className="lg-p" data-sr="">{t("changes.p")}</p>
      </Part>
    </>
  );
}

/** 12 · the questions: the mail as the main button, the address and the phones under it */
export async function PrivacyAsk() {
  const t = await getTranslations("privacy");
  const phones = realPhones();
  return (
    <section className="section lg-part lg-ask" id="ask" aria-labelledby="ask-title">
      <div className="container">
        <header className="s-head lg-head lg-head--plain">
          <p className="s-head__meta">
            <span className="s-head__index">{INDEX.ask}</span>
            <span>{t("nav.ask")}</span>
          </p>
        </header>
        <div className="card lg-ask__card" data-sr="">
          <div className="lg-ask__copy">
            <h2 className="lg-ask__title" id="ask-title">{t("ask.title")}</h2>
            <p className="lg-ask__p">{t("ask.p")}</p>
          </div>
          <div className="lg-ask__act">
            <ButtonLink href={`mailto:${email}`} variant="primary">{t("ask.write")}</ButtonLink>
            <p className="lg-ask__contacts">
              <a href={`mailto:${email}`}>{email}</a>
              {phones.map((phone) => (
                <a key={phone} href={telHref(phone)}>{phoneText(phone)}</a>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
