/*
 * Доставка й оплата (the menu's «Доставка»: four ruled rows beside the photo of light through glass; phones: the photo
 * full bleed, then the rows) and the footer, kept from the round before (the owner likes it; spec §5) with the new
 * palette only: the shelf «Скло за кольором» (six glass balls standing on a line above their reflections; each opens the
 * catalogue in that glass), the columns (the brand, «Магазин», «Категорії», «Контакти», «Соцмережі»), the bar (©, the
 * payment line, a square ghost «Нагору ↑»), and the Playfair italic wordmark at 16.5cqw cut by its line, with its
 * reflection. White ground, lines in ink at 14 %, the reflections fading from ink 4 % to nothing; the logo mark dropped.
 * Structure from the public demo (no code taken): Halftone Wordmark Footer · Kedhareswer Naidu · MIT ·
 * 21st.dev/@kedhareswer (columns, then the wordmark; no halftone, no pointer springs).
 */
import { Curtain, Ico, Lines, Pic, SOC, Up, type Css } from "./parts";
import { useEnv, type Part } from "./env";
import { useShop } from "./store";
import { COL_N, COLS, SW, TYPES } from "./products";
import { nb, plural } from "./copy";

const NAV_TO: Part[] = ["catalog", "coll", "ship", "ftr"];
const PIN = "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zM12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z";
const PHONE = "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z";
const MAIL = "M3.5 5.5h17v13h-17zM4 7l8 6 8-6";
const CARD = "M3.5 6h17v12h-17zM3.5 10h17M7 14.5h3";

export function Delivery() {
  const { W } = useEnv();
  return (
    <section className="sh-sec sh-ship" data-sec data-part="ship">
      <div className="sh-ship__t">
        <Lines className="sh-h2" lines={[W.ship.h]} />
        <ul className="sh-ship__rows">
          {W.ship.rows.map((r, i) => (
            <li key={r} data-rv style={{ "--rd": `${80 + i * 70}ms` } as Css}>
              <i>{String(i + 1).padStart(2, "0")}</i>
              <span>{nb(r)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="sh-ship__ph sh-well sh-ph">
        <Pic shot={{ k: "light-caustics", f: "40% 50%" }} />
        <Curtain />
      </div>
    </section>
  );
}

export function Footer() {
  const { W, D, brand, go } = useEnv();
  const { filterTo } = useShop();
  const f = D.footer;
  const pay = D.perks[2] ? `${D.perks[2][0]} · ${String(D.perks[2][1]).toLowerCase()}` : "";
  const toCol = (c: (typeof COLS)[number]) => {
    filterTo({ col: c, type: "all" });
    go("catalog");
  };
  return (
    <footer className="sh-ftr" data-sec data-part="ftr">
      <div className="sh-ftr__shelf">
        <div className="sh-ftr__lead">
          <span className="sh-label">{W.foot.byColour}</span>
          <span className="sh-ftr__lt">{W.handmade}</span>
        </div>
        <div className="sh-ftr__glass">
          {COLS.map((c, i) => (
            <span key={c} className="sh-ftr__g" style={{ "--a": SW[c][0], "--b": SW[c][1], "--i": i } as Css} onClick={() => toCol(c)}>
              <span className="sh-ftr__ball" />
              <i className="sh-ftr__ballr" aria-hidden="true" />
              <b>{W.cols[c]}</b>
              <small>{plural(COL_N[c], W.items)}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="sh-ftr__cols">
        <div className="sh-ftr__brand">
          <span className="sh-wm" onClick={() => go("top")}>
            {brand}
          </span>
          <span>{nb(W.sub)}</span>
        </div>
        <div className="sh-ftr__col">
          <span className="sh-ftr__h sh-label">{W.foot.shop}</span>
          {D.nav.map((x, i) => (
            <span key={x} className="sh-ftr__a" onClick={() => go(NAV_TO[i])}>
              {x}
            </span>
          ))}
        </div>
        <div className="sh-ftr__col">
          <span className="sh-ftr__h sh-label">{D.catsTitle}</span>
          {TYPES.map((t) => (
            <span
              key={t}
              className="sh-ftr__a"
              onClick={() => {
                filterTo({ type: t, col: null });
                go("catalog");
              }}
            >
              {W.tabs[t]}
            </span>
          ))}
        </div>
        <div className="sh-ftr__col sh-ftr__col--c">
          <span className="sh-ftr__h sh-label">{D.nav[3]}</span>
          <span className="sh-ftr__c">
            <Ico d={PIN} />
            {f.addr}
          </span>
          <span className="sh-ftr__c">
            <Ico d={PHONE} />
            {f.phone}
          </span>
          <span className="sh-ftr__c">
            <Ico d={MAIL} />
            hello@vash-sait.ua
          </span>
        </div>
        <div className="sh-ftr__col">
          <span className="sh-ftr__h sh-label">{W.foot.social}</span>
          {(f.links || ["Instagram", "Telegram", "Facebook"]).map((x, i) => (
            <span key={x} className="sh-ftr__c sh-ftr__a">
              <Ico d={SOC[i] || SOC[0]} />
              {x}
            </span>
          ))}
        </div>
      </div>
      <div className="sh-ftr__bar">
        <span>{f.copy}</span>
        <span className="sh-ftr__pay">
          <Ico d={CARD} />
          {pay}
        </span>
        <span className="sh-btn sh-btn--ghost sh-up" onClick={() => go("top")}>
          <span className="sh-btn__t">
            {W.foot.up}
            <Up />
          </span>
        </span>
      </div>
      <div className="sh-ftr__word" aria-hidden="true">
        <span className="sh-ftr__clip">
          <span className="sh-ftr__w">{brand}</span>
        </span>
        <span className="sh-ftr__clip sh-ftr__clip--r">
          <span className="sh-ftr__w sh-ftr__w--r">{brand}</span>
        </span>
        <i className="sh-ftr__line" />
      </div>
    </footer>
  );
}

