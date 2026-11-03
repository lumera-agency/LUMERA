import { getTranslations } from "next-intl/server";
import { WhyGlyph, type WhyLink } from "./glyphs";

/** The four links in order, with their lines: «Только страница» against «Система ECLO». */
const STEPS: { link: WhyLink; page: string; sys: string }[] = [
  { link: "search", page: "why.page.1", sys: "why.sys.1" },
  { link: "site", page: "why.page.2", sys: "why.sys.2" },
  { link: "lead", page: "why.page.3", sys: "why.sys.3" },
  { link: "source", page: "why.page.4", sys: "why.sys.4" },
];

/**
 * 4 · Почему ECLO as a chain read top to bottom (the owner, 3 Nov: «видно последовательность цепочки» поиск → сайт →
 * заявка → откуда заявка): the links sit on the page's own line down the left (the spine, PageShell), which turns
 * lime down to the link in view; that link lit, the ones before it kept (WhyChainClient). Each link a row: its number,
 * glyph and name on the left, its two lines on the right, hairlines between the links. On phones, where the page has
 * no spine, the chain draws its own line.
 */
export async function WhyChain() {
  const t = await getTranslations();
  const index = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div className="wc" data-chain="">
      <span className="wc__rail" aria-hidden="true">
        <i className="wc__fill"></i>
      </span>
      <ol className="wc__steps">
        {STEPS.map((s, i) => (
          <li className="wc__step" data-step={i} data-link={s.link} key={s.link}>
            <span className="wc__node" aria-hidden="true">
              <b>{index(i)}</b>
            </span>
            <div className="wc__title">
              <span className="wc__index" aria-hidden="true">
                {index(i)}
              </span>
              <WhyGlyph link={s.link} />
              <h3 className="wc__name">{t(`why.link.${i + 1}`)}</h3>
            </div>
            <div className="wc__cmp">
              <p className="wc__page">
                <span className="wc__k">
                  {/* a grey dot before «Только страница», the lime one before «Система ECLO» */}
                  <span className="w5-mark w5-mark--sys wc__mark-page" aria-hidden="true">
                    <b></b>
                  </span>
                  {t("why.col.page")}
                </span>
                <span className="wc__text">{t(s.page)}</span>
              </p>
              <p className="wc__sys">
                <span className="wc__k">
                  <span className="w5-mark w5-mark--sys" aria-hidden="true">
                    <b></b>
                  </span>
                  {t("why.col.system")}
                </span>
                <span className="wc__text">{t(s.sys)}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
