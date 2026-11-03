import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

/** Each term's mark: a thin line drawing in a ring (the art director, 3 Nov: no numbers, the page has enough of them) */
const ICONS = [
  // paying Google directly: a card
  <><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M3.5 10h17M7 14.5h3" /></>,
  // the price in the contract: a page with lines
  <><path d="M6.5 3.5h7.5l4 4v13h-11.5Z" /><path d="M14 3.5v4h4M9.5 12h5M9.5 15.5h5" /></>,
  // checking the site before the launch: a window with a tick
  <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M3.5 9h17M9 14l2 2 4-4" /></>,
  // said at the first talk: a speech bubble
  <><path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.5v-3.5a1.5 1.5 0 0 1-1.5-1.5Z" /></>,
];

/**
 * 3 · Умови: «what if they vanish?» answered with what stays with the client (the product director, 3 Nov): the site and
 * the accounts are in your name, you pay Google directly, the price is in the contract, you check the site before the
 * launch, and a task that does not suit us is said at the first talk. Every line is the site's own copy (the main page's
 * FAQ, stages and «Що ви отримуєте», the owner's brief). A grid of four on hairlines with a «+» where they cross
 * (21st.dev's features grids); the top line draws itself in, then the cells rise one after another.
 */
export async function AboutTerms({ index }: { index: number }) {
  const t = await getTranslations("about");
  return (
    <section className="section about-terms-sec" id="terms" aria-labelledby="terms-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">{index}</span>
            <span>{t("terms.meta")}</span>
          </p>
          <h2 className="s-head__title" id="terms-title" data-split="">
            <span className="tone">{t.rich("terms.title", R)}</span>
          </h2>
        </header>
        <ul className="about-terms" data-draw="">
          {ICONS.map((icon, i) => (
            <li className="about-terms__i" data-in="" key={i}>
              <span className="about-terms__ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">{icon}</svg>
              </span>
              <div>
                <p className="about-terms__b">{t(`terms.${i + 1}.b`)}</p>
                <p className="about-terms__t">{t(`terms.${i + 1}.t`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
