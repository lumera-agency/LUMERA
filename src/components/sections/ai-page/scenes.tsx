import { getTranslations } from "next-intl/server";
import type { Product } from "./prices";

/** The lineup's little scenes (runtime/ai-runtime.js plays them, looping, while they are on screen). */
export async function offerScenes(): Promise<Partial<Record<Product, React.ReactNode>>> {
  const t = await getTranslations("ai");
  return {
    search: (
      <div className="ai-svc__art ai-svc__art--flow" data-scene="svc-flow" data-loop="" aria-hidden="true">
        <ol className="ai-mfl">
          <li className="ai-mfl__s"><span className="ai-mfl__n"><i /><i /><i /></span><span className="ai-mfl__c">{t("svc.4.a")}</span></li>
          <li className="ai-mfl__s"><i className="ai-mfl__seg"><b /></i><span className="ai-mfl__n ai-mfl__n--ok">✓</span><span className="ai-mfl__c">{t("svc.4.b")}</span></li>
          <li className="ai-mfl__s">
            <i className="ai-mfl__seg"><b /></i>
            <span className="ai-mfl__n ai-mfl__n--tg"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-tg" /></svg></span>
            <span className="ai-mfl__c">Telegram</span>
          </li>
        </ol>
      </div>
    ),
    sources: (
      <div className="ai-svc__art ai-svc__art--mail" data-scene="svc-mail" data-loop="" aria-hidden="true">
        <div className="ai-mm">
          <p className="ai-mm__from">
            <svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>
            <span>{t("art.mail.from")}</span>
          </p>
          <p className="ai-mm__b">{t("svc.3.mail")}</p>
        </div>
        <div className="ai-mt">
          <p className="ai-mt__sk"><i /><i /><i /></p>
          <p className="ai-mt__sk"><i /><i /><i /></p>
          <p className="ai-mt__row"><b className="ai-mt__bar" /><span>{t("art.mail.from")}</span><span>20 000 ₴</span><span>15.11</span></p>
        </div>
      </div>
    ),
    assistant: (
      <div className="ai-svc__art ai-svc__art--crm" data-scene="svc-crm" data-loop="" aria-hidden="true">
        <p className="ai-mb ai-mb--in">{t("svc.2.q")}</p>
        <p className="ai-mb ai-mb--bot">{t("svc.2.a")}</p>
        <p className="ai-mc"><i /><span>{t("svc.2.crm")}</span></p>
      </div>
    ),
    // no scene of its own: the empty place is the reader's task
    custom: (
      <div className="ai-svc__art ai-offer__art-plus" aria-hidden="true"><span>+</span></div>
    ),
  };
}
