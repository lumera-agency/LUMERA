/*
 * Головна, after the first screen: Категорії (four 4:5 tiles of three columns each with their counts; a pointer scales
 * the photo to 1.035 and slides an arrow in; a click opens the catalogue with that filter; phones: a snap rail of 42cqw
 * tiles) and Колекція «Світло» (the photo in c1–c6, the text in c8–c12; phones: the photo full bleed, then the text).
 * Rebuilt from the public demo (behaviour only, no code taken): Product Listing Card · ShadcnStore · MIT ·
 * 21st.dev/@shadcnstore/components/product-card-1 — the tile's anatomy, made square.
 */
import { Arrow, Curtain, Lines, Pic, ULink, type Css } from "./parts";
import { useEnv } from "./env";
import { useShop } from "./store";
import { TYPE_N, TYPES } from "./products";
import { TYPE_SHOT } from "./Header";

export function Categories() {
  const { W, D, go } = useEnv();
  const { filterTo } = useShop();
  const all = W.allGoods;
  return (
    <section className="sh-sec sh-cats" data-sec data-part="cats">
      <div className="sh-head">
        <Lines className="sh-h2" lines={[D.catsTitle]} />
        <span data-rv>
          <ULink
            arrow
            onClick={() => {
              filterTo({ type: "all", col: null });
              go("catalog");
            }}
          >
            {all}
          </ULink>
        </span>
      </div>
      <div className="sh-cats__row">
        {TYPES.map((t, i) => (
          <div
            key={t}
            className="sh-tile"
            style={{ "--i": i } as Css}
            onClick={() => {
              filterTo({ type: t, col: null });
              go("catalog");
            }}
          >
            <div className="sh-tile__w sh-well sh-ph">
              <span className="sh-zoom">
                <Pic shot={TYPE_SHOT[t]} />
              </span>
              <Curtain />
            </div>
            <div className="sh-tile__c">
              <span>{W.types[t]}</span>
              <span className="sh-tile__n">
                <Arrow />
                <i>{TYPE_N[t]}</i>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Collection() {
  const { W, go } = useEnv();
  const { filterTo } = useShop();
  return (
    <section className="sh-sec sh-coll" data-sec data-part="coll">
      <div className="sh-coll__ph sh-well sh-ph">
        <Pic shot={{ k: "pitchers-colour", f: "50% 45%" }} />
        <Curtain />
      </div>
      <div className="sh-coll__t">
        <span className="sh-label sh-kick" data-rv>
          {W.coll.k}
        </span>
        <Lines className="sh-h2" lines={[W.coll.h]} />
        <p className="sh-lead" data-rv style={{ "--rd": "120ms" } as Css}>
          {W.coll.p}
        </p>
        <span data-rv style={{ "--rd": "200ms" } as Css}>
          <ULink
            arrow
            onClick={() => {
              filterTo({ type: "all", col: null });
              go("catalog");
            }}
          >
            {W.coll.go}
          </ULink>
        </span>
      </div>
    </section>
  );
}
