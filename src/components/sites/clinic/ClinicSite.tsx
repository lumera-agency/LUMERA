/*
 * «Ваш бренд», a dental clinic in Kyiv: the sample site of the «Корпоративний сайт» format on «Дизайн і розробка сайтів»,
 * art direction «Петроль» (round 14). Four pages behind the frame's tabs (page 0–3: Головна, Послуги, Про нас, Контакти),
 * one at a time; the header and the footer are shared. Mounted by module.tsx into the frame's site element.
 */
import { useCallback, useState } from "react";
import { EnvCtx, two, type Env } from "./env";
import { Header, MenuSheet } from "./Header";
import { Footer, NextLink } from "./Footer";
import { Home } from "./Home";
import { Services } from "./Services";
import { About } from "./About";
import { Contacts } from "./Contacts";
import { LbCtx, Lightbox, type LbState, type Shot } from "./Editorial";

export function ClinicSite({ env }: { env: Env }) {
  const [menu, setMenu] = useState(false);
  const [lb, setLb] = useState<LbState>(null);
  const open = useCallback((set: Shot[], i: number, items: () => HTMLElement[]) => setLb({ set, i, items }), []);
  const { page, tabs } = env;
  return (
    <EnvCtx.Provider value={env}>
      <LbCtx.Provider value={open}>
      <Header menuOpen={menu} setMenu={setMenu} />
      <div className="pv-scroll cl-scroll">
        <i className="cl-top" aria-hidden="true" />
        {page === 0 ? <Home /> : page === 1 ? <Services /> : page === 2 ? <About /> : <Contacts />}
        {page < tabs.length - 1 ? <NextLink /> : null}
        <Footer />
      </div>
      <MenuSheet open={menu} setMenu={setMenu} />
      <Lightbox state={lb} setState={setLb} />
      {/* the page change: the shutter carries this page's number and its title, word by word (module.tsx moves it) */}
      <div className="cl-shutter" aria-hidden="true">
        <i className="cl-grain" />
        <span className="cl-shutter__t">
          <span className="cl-sh__m">
            <b className="cl-sh__w cl-sh__n">{two(page + 1)}</b>
          </span>
          {tabs[page].split(" ").map((w, i) => (
            <span key={i} className="cl-sh__m">
              <span className="cl-sh__w">{w}</span>
            </span>
          ))}
        </span>
      </div>
      </LbCtx.Provider>
    </EnvCtx.Provider>
  );
}
