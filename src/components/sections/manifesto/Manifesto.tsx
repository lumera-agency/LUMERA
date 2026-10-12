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
          <h2 className="manifesto__text" id="manifesto-text" data-sr="" data-cursor-lens="">
            <span className="manifesto__lead manifesto__glitch" data-glitch="" data-text={t("glitch")}>{t("glitch")}</span>
            <span className="manifesto__rest">
              <span>{t("and")}</span>&nbsp;
              <mark className="manifesto__mark" data-text={t("mark")}>{t("mark")}</mark>
            </span>
          </h2>
          <span className="manifesto__slot" data-slot="manifesto" aria-hidden="true" />
        </div>
      </div>
    </ManifestoClient>
  );
}
