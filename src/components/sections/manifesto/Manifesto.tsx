import { getTranslations } from "next-intl/server";
import { ManifestoClient } from "./ManifestoClient";
import "./manifesto.css";

/**
 * The manifesto: one sentence on ivory between the services and the reasons. On arrival the marker
 * swipes across the key words and the lead glitches once (React Bits' GlitchText, in CSS); hover —
 * or a tap — plays the glitch again.
 */
export async function Manifesto() {
  const t = await getTranslations("manifesto");
  return (
    <ManifestoClient>
      <div className="manifesto__hold">
        <div className="container">
          <h2 className="manifesto__text" id="manifesto-text" data-sr="" data-cursor-size="150" data-cursor-still="">
            {/* .manifesto__ink: the words themselves (the lines are blocks): the inverting lens works over these */}
            <span className="manifesto__lead manifesto__glitch" data-glitch="" data-text={t("glitch")}>
              <span className="manifesto__ink">{t("glitch")}</span>
            </span>
            <span className="manifesto__rest">
              <span className="manifesto__ink">{t("and")}</span>&nbsp;
              <mark className="manifesto__mark manifesto__ink" data-text={t("mark")}>{t("mark")}</mark>
            </span>
          </h2>
          <span className="manifesto__slot" data-slot="manifesto" aria-hidden="true" />
        </div>
      </div>
    </ManifestoClient>
  );
}
