/*
 * The end of every page: «Далі» (the next page as a heading-sized link whose underline draws on hover) and the footer,
 * round 2 (the owner: «one big block of one colour»): layers and tones instead of a slab. A porcelain call to book beside
 * a collage of three overlapping photos (each comes in from its own side); the sitemap on a white card; the contacts and
 * the week's hours on one inset petrol panel with glaze accents; the legal line; «Ваш бренд» across the width in two
 * tones (the first word solid, the second outlined), cut by the footer's bottom edge and rising word by word as it enters.
 * Rebuilt from the public demo (behaviour only, no code taken): Large Name Footer · Arihant Jain · MIT ·
 * 21st.dev/@arihantcodes_1f7b8c4d/components/large-name-footer.
 */
import type { CSSProperties } from "react";
import { Arrow, Btn, Hours, SplitHeading, Status } from "./parts";
import { FOOT_PICS } from "./copy";
import { TabMark } from "./Header";
import { PH, two, useEnv } from "./env";

export function NextLink() {
  const { W, tabs, page, go } = useEnv();
  const nx = (page + 1) % tabs.length;
  return (
    <section className="cl-next" data-sec onClick={() => go(nx)}>
      <div className="cl-grid">
        <span className="cl-kick cl-next__k" data-rv>
          <b>({two(nx + 1)})</b>
          <span>{W.next}</span>
        </span>
        <span className="cl-next__t" data-rv>
          <span className="cl-next__w">
            {tabs[nx]}
            <i className="cl-next__l" aria-hidden="true" />
          </span>
          <Arrow />
        </span>
      </div>
    </section>
  );
}

type Css = CSSProperties & Record<`--${string}`, string | number>;
const FOOT_DIR = ["r", "u", "d"] as const;

export function Footer() {
  const { W, tabs, brand, url, phone, go } = useEnv();
  const F = W.footer;
  const sv = [0, 1, 2, 4, 5];
  const [w1, ...rest] = brand.split(" ");
  return (
    <footer className="cl-ftr" data-sec>
      <div className="cl-ftr__cta cl-grid">
        <div className="cl-ftr__l">
          <span className="cl-kick" data-rv>
            <b>—</b>
            <span>{W.foot.k}</span>
          </span>
          <SplitHeading parts={F.h} keyIndex={1} className="cl-ftr__h" />
          <p className="cl-ftr__p" data-rv>
            {F.p}
          </p>
          <div data-rv>
            <Btn onClick={() => go(3, { to: "book" })}>{W.hero.btn}</Btn>
          </div>
        </div>
        <div className="cl-ftr__col" aria-hidden="true">
          {FOOT_PICS.map((d, i) => (
            <div key={d.k} className={`cl-ftr__pic cl-ftr__pic--${i + 1}`} data-dir={FOOT_DIR[i]} style={{ "--k": i } as Css}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the sample's own photo */}
              <img src={`${PH}${phone ? "m/" : ""}${d.k}.jpg`} alt="" decoding="async" loading={phone ? "lazy" : undefined} style={{ objectPosition: d.f }} />
              <i className="cl-ph__cur" />
            </div>
          ))}
        </div>
      </div>
      <div className="cl-ftr__deck cl-grid" data-sec>
        <div className="cl-ftr__map" data-rv>
          <div className="cl-ftr__c">
            <small>{F.cols[0]}</small>
            {tabs.map((t, i) => (
              <span key={t} onClick={() => go(i)}>
                <i>{two(i + 1)}</i>
                {t}
              </span>
            ))}
          </div>
          <div className="cl-ftr__c">
            <small>{F.cols[1]}</small>
            {sv.map((i) => (
              <span key={i} onClick={() => go(1, { to: "prices", row: i })}>
                {W.svc[i].name}
              </span>
            ))}
          </div>
          <div className="cl-ftr__c">
            <small>{F.cols[2]}</small>
            <span onClick={() => go(2)}>{F.clinic[0]}</span>
            <span onClick={() => go(2, { to: "docs" })}>{F.clinic[1]}</span>
            <span onClick={() => go(2, { to: "rev" })}>{F.clinic[2]}</span>
          </div>
          <div className="cl-ftr__brand">
            <span className="cl-logo" onClick={() => go(0)}>
              <TabMark />
              <span>{brand}</span>
            </span>
            <span className="cl-label">{W.label}</span>
          </div>
        </div>
        <div className="cl-ftr__panel" data-rv style={{ "--rd": "120ms" } as Css}>
          <i className="cl-grain" aria-hidden="true" />
          <div className="cl-ftr__ph">
            <small>{W.foot.contacts}</small>
            <Status dark />
          </div>
          <span className="cl-ftr__addr" onClick={() => go(3, { to: "con" })}>
            {W.addrFull}
          </span>
          <span className="cl-ftr__line" onClick={() => go(3, { to: "con" })}>
            {W.phone}
          </span>
          <span className="cl-ftr__line" onClick={() => go(3, { to: "con" })}>
            {W.contacts.items[2][1]}
          </span>
          <small className="cl-ftr__hk">{W.foot.hours}</small>
          <Hours dark />
        </div>
      </div>
      <div className="cl-ftr__bot cl-label">
        <span>{F.copy}</span>
        <span>{W.cond}</span>
        <span>{url}</span>
      </div>
      <div className="cl-ftr__word" data-sec aria-hidden="true">
        <span className="cl-ftr__wm">
          <span className="cl-ftr__w1">{w1}</span> <span className="cl-ftr__w2">{rest.join(" ")}</span>
        </span>
      </div>
    </footer>
  );
}
