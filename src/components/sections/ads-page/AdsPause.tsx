import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";

/**
 * A pause after the cases (the owner's brief of 21 Oct): one sentence across the screen, the main page's typographic
 * spread (the manifesto) on black, no button. Its key words in ember: the price of a request is the result the page is
 * about. It rises in as it reaches the screen (runtime: the reveals).
 */
export async function AdsPause() {
  const t = await getTranslations("ads");
  return (
    <section className="section ad-pause" aria-labelledby="pause-text">
      <div className="container">
        <h2 className="ad-pause__text" id="pause-text">{t.rich("pause.text", R)}</h2>
      </div>
    </section>
  );
}
