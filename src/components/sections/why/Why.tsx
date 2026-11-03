import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { WhyChainClient } from "./WhyChainClient";
import { WhyChain } from "./WhyChain";
import "./why.css";
import "./why-chain.css";

/**
 * 4 · Почему ECLO: the request's chain, link by link, read down the page's spine — «Только страница» against
 * «Система ECLO» (WhyChain), then two notes: the 3D and motion, the open price.
 */
export async function Why() {
  const t = await getTranslations();
  return (
    <WhyChainClient>
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">4</span>
            <span>{t("nav.why")}</span>
          </p>
          <h2 className="s-head__title s-head__title--stone" id="why-title" data-split="">
            <span className="tone">{t.rich("why.title", rich)}</span>
          </h2>
        </header>
        <WhyChain />
        <ul className="w5-sum" role="list">
          <li className="w5-sum__item" data-sr="">
            <h3 className="w5-sum__head">{t("why.sum.head.2")}</h3>
            <p className="w5-sum__text">{t("why.sum.text.2")}</p>
          </li>
          <li className="w5-sum__item w5-sum__item--bridge" data-sr="">
            <h3 className="w5-sum__head">{t("why.sum.head.3")}</h3>
            <p className="w5-sum__text">{t("why.sum.text.3")}</p>
          </li>
        </ul>
      </div>
    </WhyChainClient>
  );
}
