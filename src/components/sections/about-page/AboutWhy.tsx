import { getLocale, getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";

/** The four links of a request's way (the main page's «why» chain), each with its line drawing */
const LINKS = [
  // search: a magnifier
  <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  // the site: a window
  <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 9h17M7 13h6M7 16h4" /></>,
  // the request: Telegram's plane (the header's contact pill draws the same)
  <><path d="M20.5 4.2 3.4 10.8c-.8.3-.8 1.5.1 1.7l4.3 1.3 1.6 5c.2.7 1.1.9 1.6.4l2.4-2.3 4.5 3.3c.6.4 1.4.1 1.6-.6l2.6-13.1c.2-.9-.7-1.6-1.6-1.3Z" /><path d="m7.8 13.8 9.3-6.1-6.9 7.2-.6 3.9" /></>,
  // where it came from: bars
  <><path d="M4.5 19.5h15M7.5 16v-4M12 16V8M16.5 16v-6" /></>,
];

/**
 * 2 · Чому ECLO (the owner, 3 Nov: «why choose us» in place of the cases, light to read, a demo where it helps): one
 * team sets up the whole way of a request. The page's one light block holds one dark window, the way itself: the four
 * links of the main page's chain (Пошук → Сайт → Заявка → Звідки заявка), each with what we do there, in the main page's
 * words (why.link, why.sys). As the window reaches the screen a request runs it once (runtime: scene «chain»): an ember
 * line from link to link, each link lighting as it arrives and its words coming up; at «Заявка» the message pops
 * («Нова заявка»), at «Звідки заявка» its source («Google Ads»). Wide screens: the four in a row; up to 1100 px: a
 * column, the line running down. Under the window, the way to the open prices (the main page's calculator).
 */
export async function AboutWhy({ index }: { index: number }) {
  const t = await getTranslations();
  const a = await getTranslations("about");
  const calc = `${aiHref(await getLocale(), "/")}#pricing`;
  return (
    <section className="section section--ivory about-why" id="why" aria-labelledby="why-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{a("why.meta")}</span>
          </p>
          <h2 className="s-head__title" id="why-title" data-split="">
            <span className="tone">{a.rich("why.title", R)}</span>
          </h2>
          <p className="s-head__intro">{a("why.intro")}</p>
        </header>
        <div className="about-chain" data-chain="">
          <ol className="about-chain__list">
            {LINKS.map((icon, i) => (
              <li className="about-chain__st" style={{ "--n": i } as React.CSSProperties} key={i}>
                {/* the line to the next link, and the request running it */}
                {i < LINKS.length - 1 && (
                  <span className="about-chain__seg" aria-hidden="true">
                    <span className="about-chain__run" />
                  </span>
                )}
                <span className="about-chain__node" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">{icon}</svg>
                  <span className="about-chain__lit">
                    <svg viewBox="0 0 24 24" focusable="false">{icon}</svg>
                  </span>
                </span>
                <div className="about-chain__txt">
                  <p className="about-chain__k">{t(`why.link.${i + 1}`)}</p>
                  <p className="about-chain__v">{i === 1 ? t("why.sys.2.m") : t(`why.sys.${i + 1}`)}</p>
                  {i === 2 && <span className="about-chain__pop about-chain__pop--msg" aria-hidden="true">{a("why.msg")}</span>}
                  {i === 3 && <span className="about-chain__pop about-chain__pop--src" aria-hidden="true">Google Ads</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="about-why__calc">
          <a className="link" href={calc}>
            {t("faq.a.1.link")}
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
        </p>
      </div>
    </section>
  );
}
