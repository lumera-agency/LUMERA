import { getTranslations } from "next-intl/server";
import { aiRich as R } from "@/components/ai/rich";
import { TeamMark } from "./AboutMarks";

/**
 * The page's one light block (the main page's ivory section), no number, no button: one sentence and the place for the
 * team's photo or a working moment (the owner adds it).
 */
export async function AboutPhoto() {
  const t = await getTranslations("about");
  return (
    <section className="section section--ivory about-photo" id="photo" aria-labelledby="photo-text">
      <div className="container about-photo__in">
        <h2 className="s-head__title about-photo__text" id="photo-text" data-split="">
          <span className="tone">{t.rich("photo.text", R)}</span>
        </h2>
        <div className="about-photo__ph" data-sr="">
          <TeamMark />
          <span>{t("photo.ph")}</span>
        </div>
      </div>
    </section>
  );
}
