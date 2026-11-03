import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { WhyClient } from "./WhyClient";
import "./why.css";

/** On phones the rows of the accordion: the link, and its lines (the site's own, shorter where it has them). */
const PHONE_LINKS = [
  { link: "search", page: "why.page.1", sys: "why.sys.1" },
  { link: "site", page: "why.page.2.short.m", sys: "why.sys.2.m" },
  { link: "lead", page: "why.page.3", sys: "why.sys.3" },
  { link: "source", page: "why.page.4", sys: "why.sys.4" },
] as const;

/**
 * 4 · Чому ECLO: the request's chain, link by link — «Тільки сторінка» against «Система ECLO».
 * Each link has a tiny UI glyph whose short story plays as a relay along the chain (why-orbit.js);
 * on phones the table becomes an accordion (why-phone.js). Markup ported 1:1 from website-v2.
 */
export async function Why() {
  const t = await getTranslations();
  return (
    <WhyClient>
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">4</span>
            <span>{t("nav.why")}</span>
          </p>
          <h2 className="s-head__title s-head__title--stone" id="why-title" data-split="">
            <span className="tone">{t.rich("why.title", rich)}</span>
          </h2>
        </header>
        <div className="w5-body">
          <div className="w5-ledger">
            <table className="w5-table" role="table" data-why-ledger="">
              <caption className="visually-hidden">{t("why.caption")}</caption>
              <colgroup>
                <col className="w5-c-link" />
                <col className="w5-c-page" />
                <col className="w5-c-sys" />
              </colgroup>
              <thead role="rowgroup">
                <tr className="w5-head" role="row" data-sr="">
                  <th className="w5-h-link" role="columnheader" scope="col">
                    <span className="visually-hidden">{t("why.col.link")}</span>
                  </th>
                  <th className="w5-h-page" role="columnheader" scope="col">
                    <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                    <span>{t("why.col.page")}</span>
                  </th>
                  <th className="w5-h-sys" role="columnheader" scope="col">
                    <span className="w5-mark w5-mark--sys" aria-hidden="true">
                      <b></b>
                    </span>
                    <span>{t("why.col.system")}</span>
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                <tr className="w5-row" role="row" data-link="search" data-sr="">
                  <th className="w5-link" role="rowheader" scope="row">
                    <span className="w5-glyph" aria-hidden="true">
                      <svg viewBox="0 0 72 44" focusable="false">
                        <rect className="g-l" x=".5" y=".5" width="71" height="12" rx="6" />
                        <circle className="g-l" cx="7.5" cy="6.5" r="2.5" />
                        <path className="g-l" d="m9.4 8.4 2.1 2.1" />
                        <rect className="g-f2 g-q" x="15" y="5.5" width="26" height="2" rx="1" />
                        <rect className="g-caret" x="42.5" y="3.5" width="1" height="6" />
                        <rect className="g-hl" x="-3.5" y="16.5" width="58" height="13" rx="3" />
                        <g className="g-r1">
                          <rect className="g-ac" x=".5" y="19.5" width="9" height="5" rx="1.25" />
                          <rect className="g-on" x=".5" y="19.5" width="9" height="5" rx="1.25" />
                          <rect className="g-f2" x="13" y="19" width="36" height="3" rx="1.5" />
                          <rect className="g-f" x="13" y="25" width="22" height="2" rx="1" />
                        </g>
                        <rect className="g-f g-r2" x="0" y="34" width="56" height="2" rx="1" />
                        <rect className="g-f g-r3" x="0" y="40" width="42" height="2" rx="1" />
                      </svg>
                    </span>
                    <span className="w5-link__name">{t("why.link.1")}</span>
                  </th>
                  <td className="w5-page" role="cell">
                    <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                    <span className="w5-page__text">{t("why.page.1")}</span>
                  </td>
                  <td className="w5-sys" role="cell">
                    <span className="w5-mark w5-mark--sys" aria-hidden="true">
                      <b></b>
                    </span>
                    <span className="w5-sys__text">{t("why.sys.1")}</span>
                  </td>
                </tr>
                <tr className="w5-row" role="row" data-link="site" data-sr="">
                  <th className="w5-link" role="rowheader" scope="row">
                    <span className="w5-glyph" aria-hidden="true">
                      <svg viewBox="0 0 72 44" focusable="false">
                        <rect className="g-l" x=".5" y=".5" width="71" height="43" rx="4.5" />
                        <path className="g-l" d="M.5 9.5h71" />
                        <circle className="g-d" cx="5.5" cy="5" r="1.25" />
                        <circle className="g-d" cx="9.5" cy="5" r="1.25" />
                        <circle className="g-d" cx="13.5" cy="5" r="1.25" />
                        <rect className="g-f2 g-b1" x="7" y="16" width="30" height="4" rx="2" />
                        <rect className="g-f g-b2" x="7" y="24" width="22" height="2" rx="1" />
                        <g className="g-b3">
                          <rect className="g-ac" x="7" y="31" width="15" height="6" rx="3" />
                          <rect className="g-on" x="7" y="31" width="15" height="6" rx="3" />
                        </g>
                        <g className="g-b4">
                          <rect className="g-l" x="44.5" y="15.5" width="20" height="22" rx="3" />
                          <circle className="g-f" cx="54.5" cy="26.5" r="5" />
                        </g>
                      </svg>
                    </span>
                    <span className="w5-link__name">{t("why.link.2")}</span>
                  </th>
                  <td className="w5-page" role="cell">
                    <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                    <span className="w5-page__text">{t("why.page.2.text")}</span>
                  </td>
                  <td className="w5-sys" role="cell">
                    <span className="w5-mark w5-mark--sys" aria-hidden="true">
                      <b></b>
                    </span>
                    <span className="w5-sys__text">{t("why.sys.2.text")}</span>
                  </td>
                </tr>
                <tr className="w5-row" role="row" data-link="lead" data-sr="">
                  <th className="w5-link" role="rowheader" scope="row">
                    <span className="w5-glyph" aria-hidden="true">
                      <svg viewBox="0 0 72 44" focusable="false">
                        <g className="g-card">
                          <rect className="g-l" x=".5" y="9.5" width="71" height="25" rx="7" />
                          <circle className="g-l" cx="13" cy="22" r="6.5" />
                          <path className="g-l" d="M9 22.3l8.6-3.7-1.8 7.9-2.9-2.3-1.6 1.5v-2.5l4.4-3.8" />
                          <rect className="g-f2" x="24" y="16.5" width="26" height="3" rx="1.5" />
                          <rect className="g-f" x="24" y="24" width="36" height="2" rx="1" />
                        </g>
                        <circle className="g-ping" cx="66" cy="9.5" r="3.5" />
                        <g className="g-dot">
                          <circle className="g-ac" cx="66" cy="9.5" r="3" />
                          <circle className="g-on" cx="66" cy="9.5" r="3" />
                        </g>
                      </svg>
                    </span>
                    <span className="w5-link__name">{t("why.link.3")}</span>
                  </th>
                  <td className="w5-page" role="cell">
                    <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                    <span className="w5-page__text">{t("why.page.3")}</span>
                  </td>
                  <td className="w5-sys" role="cell">
                    <span className="w5-mark w5-mark--sys" aria-hidden="true">
                      <b></b>
                    </span>
                    <span className="w5-sys__text">{t("why.sys.3")}</span>
                  </td>
                </tr>
                <tr className="w5-row" role="row" data-link="source" data-sr="">
                  <th className="w5-link" role="rowheader" scope="row">
                    <span className="w5-glyph" aria-hidden="true">
                      <svg viewBox="0 0 72 44" focusable="false">
                        <g className="g-tag">
                          <path className="g-l" d="M.5 3.5a3 3 0 0 1 3-3h33l6 6-6 6h-33a3 3 0 0 1-3-3z" />
                          <circle className="g-ac" cx="6.5" cy="6.5" r="1.6" />
                          <circle className="g-on" cx="6.5" cy="6.5" r="1.6" />
                          <rect className="g-f2" x="11" y="5.5" width="22" height="2" rx="1" />
                        </g>
                        <path className="g-l" d="M.5 43.5h71" />
                        <rect className="g-f g-bar" x="4" y="32" width="9" height="11" rx="1" />
                        <rect className="g-f2 g-bar" x="18" y="18" width="9" height="25" rx="1" />
                        <rect className="g-f g-bar" x="32" y="35" width="9" height="8" rx="1" />
                        <rect className="g-f g-bar" x="46" y="27" width="9" height="16" rx="1" />
                      </svg>
                    </span>
                    <span className="w5-link__name">{t("why.link.4")}</span>
                  </th>
                  <td className="w5-page" role="cell">
                    <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                    <span className="w5-page__text">{t("why.page.4")}</span>
                  </td>
                  <td className="w5-sys" role="cell">
                    <span className="w5-mark w5-mark--sys" aria-hidden="true">
                      <b></b>
                    </span>
                    <span className="w5-sys__text">{t("why.sys.4")}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* ≤ 600 px only (why-phone.js): the four links as an accordion, the first open: the link's glyph
               and name, under it «Тільки сторінка» against «Система ECLO». There the rows are what a screen
               reader reads (the table above is display: none). Wider screens keep the table; this is display: none. */}
          <ul className="w5-acc" role="list" data-why-acc="">
            {PHONE_LINKS.map((l, i) => (
              <li className={`w5-acc__item${i === 0 ? " is-open" : ""}`} data-link={l.link} key={l.link}>
                <h3 className="w5-acc__head">
                  <button className="w5-acc__btn" type="button" id={`w5-acc-${l.link}`} aria-expanded={i === 0} aria-controls={`w5-acc-${l.link}-text`}>
                    <span className="w5-glyph" data-glyph="" aria-hidden="true"></span>
                    <span className="w5-acc__name">{t(`why.link.${i + 1}`)}</span>
                    <span className="w5-acc__sign" aria-hidden="true"></span>
                  </button>
                </h3>
                <div className="w5-acc__panel" id={`w5-acc-${l.link}-text`} role="region" aria-labelledby={`w5-acc-${l.link}`}>
                  <div className="w5-acc__clip">
                    <div className="w5-acc__body">
                      <p className="w5-acc__page">
                        <span className="w5-acc__k">
                          <span className="w5-mark w5-mark--page" aria-hidden="true"></span>
                          <span>{t("why.col.page")}</span>
                        </span>
                        <span>{t(l.page)}</span>
                      </p>
                      <p className="w5-acc__sys">
                        <span className="w5-acc__k">
                          <span className="w5-mark w5-mark--sys" aria-hidden="true">
                            <b></b>
                          </span>
                          <span>{t("why.col.system")}</span>
                        </span>
                        <span>{t(l.sys)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <ul className="w5-sum" role="list">
            <li className="w5-sum__item" data-sr="">
              <h3 className="w5-sum__head">{t("why.sum.head.2")}</h3>
              <p className="w5-sum__text">{t("why.sum.text.2")}</p>
            </li>
            <li className="w5-sum__item w5-sum__item--bridge" data-sr="">
              <h3 className="w5-sum__head">{t("why.sum.head.3")}</h3>
              <p className="w5-sum__text">{t("why.sum.text.3")}</p>
            </li>
          </ul>
        </div>
      </div>
    </WhyClient>
  );
}
