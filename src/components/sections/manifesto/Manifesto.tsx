import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { ManifestoClient } from "./ManifestoClient";
import "./manifesto.css";

/** A phrase by its words, each in a box of its own: the boxes are what comes in out of the blur (ManifestoClient). */
function Words({ text }: { text: string }) {
  const words = text.split(" ").filter(Boolean);
  return words.map((word, index) => (
    <Fragment key={index}>
      <span className="manifesto__word">{word}</span>
      {index < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

/**
 * The manifesto: one sentence on ivory between the services and the reasons. Its words come in out of a blur as it
 * comes up the screen (the owner, 11 Nov 2026: the ads page's pause effect in place of the glitch and the marker's
 * swipe); the marked words come as one piece, with their marker.
 */
export async function Manifesto() {
  const t = await getTranslations("manifesto");
  return (
    <ManifestoClient>
      <div className="manifesto__hold">
        <div className="container">
          <h2 className="manifesto__text" id="manifesto-text" data-cursor-size="150" data-cursor-still="">
            {/* .manifesto__ink: the words themselves (the lines are blocks): the inverting lens works over these */}
            <span className="manifesto__lead">
              <span className="manifesto__ink">
                <Words text={t("lead")} />
              </span>
            </span>
            <span className="manifesto__rest">
              <span className="manifesto__ink">
                <Words text={t("and")} />
              </span>
              &nbsp;
              <mark className="manifesto__mark manifesto__ink">{t("mark")}</mark>
            </span>
          </h2>
          <span className="manifesto__slot" data-slot="manifesto" aria-hidden="true" />
        </div>
      </div>
    </ManifestoClient>
  );
}
