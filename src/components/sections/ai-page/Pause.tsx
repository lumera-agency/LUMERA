import { getTranslations } from "next-intl/server";
import { BlurText } from "./fx/BlurText";

/**
 * The pause after the case (the owner, 21 Oct 2026): one phrase across the screen, a lot of air, no buttons. Its words
 * come in out of a blur (React Bits BlurText, fx/BlurText): the first sentence muted, the second bright.
 */
export async function Pause() {
  const t = await getTranslations("ai");
  // «… <b>…</b>»: the muted part, then the bright one
  const raw = t.raw("pause.text") as string;
  const [muted, bright = ""] = raw.split(/<b>|<\/b>/);
  return (
    <section className="section ai-sec ai-pause">
      <div className="container">
        <BlurText className="ai-pause__text" parts={[{ text: muted.trim() }, { text: bright.trim(), className: "ai-pause__b" }]} />
      </div>
    </section>
  );
}
