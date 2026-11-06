import { getTranslations } from "next-intl/server";
import { BlurText } from "./fx/BlurText";

/**
 * The pause after the case (the owner, 21 Oct 2026): one thought across the screen, a lot of air, no buttons; since 5
 * Nov 2026 a short story rather than one line (the owner: too little for so much room), all of it in white, what is
 * left to you a little heavier. Its words come in out of a blur (React Bits BlurText, fx/BlurText).
 */
export async function Pause() {
  const t = await getTranslations("ai");
  // «… <b>…</b>»: the story, then what is left to you
  const raw = t.raw("pause.text") as string;
  const [muted, bright = ""] = raw.split(/<b>|<\/b>/);
  return (
    <section className="section ai-sec ai-pause">
      <div className="container">
        <BlurText className="ai-pause__text" parts={[{ text: muted.trim() }, { text: bright.trim(), className: "ai-pause__b" }]} stagger={0.08} />
      </div>
    </section>
  );
}
