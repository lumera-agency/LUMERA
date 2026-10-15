import { getLocale, getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich } from "@/components/ai/rich";
import { aiHref } from "@/components/ai/links";
import { Replay, Sample } from "@/components/ai/parts";
import type { AiFacts } from "@/components/ai/facts";

type Step = { who: "person" | "sys"; actor: string; text: string };

const PLUS = (
  <i aria-hidden="true">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg>
  </i>
);

/**
 * 3 · Що можна автоматизувати: four cards, a short scene each («svc-tg» … «svc-flow»: once in view, again when the
 * pointer comes in), the price and launch time from the main page's calculator; «Детальніше» opens the service's
 * panel (a native modal <dialog>: in the middle on wide screens, a sheet from below on phones; runtime/ai-runtime.js).
 */
export async function Services({ facts }: { facts: AiFacts }) {
  const t = await getTranslations("ai");
  const c = await getTranslations("aiCommon");
  const locale = await getLocale();
  const caseHref = aiHref(locale, "/keisy/poshuk-zamovlen");
  const asstHref = aiHref(locale, "/keisy/ai-asystent");
  const who = (k: string) => t(`svc.who.${k}`);

  const more = (id: string, n: number) => (
    <button className="ai-svc__more" type="button" aria-haspopup="dialog" aria-controls={`dlg-${id}`} aria-describedby={`svc-${n}-t`} data-open={`dlg-${id}`}>
      <span>{t("do.more")}</span>
      {PLUS}
    </button>
  );

  const panel = (p: {
    id: string;
    n: number;
    steps: Step[];
    how?: React.ReactNode;
    side: React.ReactNode;
    count?: string;
    talk: string;
  }) => (
    <dialog className="ai-dlg" id={`dlg-${p.id}`} aria-labelledby={`dlg-${p.id}-t`}>
      <div className="ai-dlg__panel">
        <div className="ai-dlg__head">
          <p className="ai-dlg__k"><span>{t("nav.services")}</span> · {p.n}</p>
          <button className="ai-dlg__x" type="button" data-close="" aria-label={t("svc.close")}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-x" /></svg>
          </button>
        </div>
        <h3 className="ai-dlg__t" id={`dlg-${p.id}-t`}>{t(`do.${p.n}.t`)}</h3>
        <p className="ai-dlg__lead">{t(`do.${p.n}.text`)}</p>
        <div className="ai-dlg__grid">
          <div className="ai-dlg__how">
            <p className="ai-dlg__h">{t("svc.how")}</p>
            <ol className="ai-dlg__steps">
              {p.steps.map((s, i) => (
                <li className={`ai-dlg__step ai-dlg__step--${s.who}`} key={i}>
                  <span className="ai-dlg__n" aria-hidden="true">{i + 1}</span>
                  <p><b className="ai-dlg__who">{s.actor}</b> <span>{s.text}</span></p>
                </li>
              ))}
            </ol>
            {p.how}
          </div>
          <div className="ai-dlg__side">{p.side}</div>
        </div>
        <div className="ai-dlg__foot">
          {p.count && (
            <button className="btn btn--ghost btn--sm" type="button" data-calc-pick={p.count}>
              <span className="btn__label">{t("svc.count")}</span>
              <ArrowIcon />
            </button>
          )}
          <ButtonLink href="#contact" variant="primary" size="sm" data-talk={p.talk}>{t("svc.talk")}</ButtonLink>
        </div>
      </div>
    </dialog>
  );

  const inc = (prefix: string, n: number) => (
    <>
      <p className="ai-dlg__h">{t("svc.inc")}</p>
      <ul className="ai-dlg__inc">
        {Array.from({ length: n }, (_, i) => <li key={i}>{t(`inc.${prefix}.${i + 1}`)}</li>)}
      </ul>
    </>
  );
  const price = (sum: string, weeks: string) => (
    <p className="ai-dlg__price">
      <b className="ai-dlg__sum">{sum}</b> <span className="ai-dlg__once">{t("svc.once")}</span>{" "}
      <span className="ai-dlg__wk"><span>{t("do.launch")}</span> <span>{weeks}</span></span>
    </p>
  );

  return (
    <section className="section ai-sec" id="services" aria-labelledby="services-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta">
            <span className="s-head__index">3</span>
            <span>{t("nav.services")}</span>
          </p>
          <h2 className="s-head__title" id="services-title" data-split="">
            <span className="tone">{t.rich("do.title", aiRich)}</span>
          </h2>
          <p className="s-head__intro">{t("do.intro")}</p>
        </header>
        <ul className="ai-svcs">
          <li className="ai-svc" data-svc="">
            <div className="ai-svc__art ai-svc__art--tg" data-scene="svc-tg" aria-hidden="true">
              <div className="ai-mf"><i /><i /><b className="ai-mf__btn" /></div>
              <div className="ai-mp">
                <span className="ai-mp__ico"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-tg" /></svg></span>
                <span className="ai-mp__txt"><b>{t("svc.1.push.text")}</b><span>{t("svc.1.push.b")}</span></span>
                <i className="ai-mp__dot" />
              </div>
            </div>
            <div className="ai-svc__body">
              <h3 className="ai-svc__t" id="svc-1-t">{t("do.1.t")}</h3>
              <p className="ai-svc__p">{t("do.1.text")}</p>
              <p className="ai-svc__facts"><b className="ai-do__sum">{facts.lead}</b> · <span>{t("do.launch")}</span> <span className="ai-do__weeks">{facts.leadWeeks}</span></p>
              <div className="ai-svc__acts">{more("lead", 1)}</div>
            </div>
          </li>
          <li className="ai-svc" data-svc="">
            <div className="ai-svc__art ai-svc__art--crm" data-scene="svc-crm" aria-hidden="true">
              <p className="ai-mb ai-mb--in">{t("svc.2.q")}</p>
              <p className="ai-mb ai-mb--bot">{t("svc.2.a")}</p>
              <p className="ai-mc"><i /><span>{t("svc.2.crm")}</span></p>
            </div>
            <div className="ai-svc__body">
              <h3 className="ai-svc__t" id="svc-2-t">{t("do.2.t")}</h3>
              <p className="ai-svc__p">{t("do.2.text")}</p>
              <p className="ai-svc__facts"><b className="ai-do__sum">{facts.crm}</b> · <span>{t("do.launch")}</span> <span className="ai-do__weeks">{facts.crmWeeks}</span></p>
              <p className="ai-svc__note">{t("do.2.note")}</p>
              <div className="ai-svc__acts">{more("crm", 2)}</div>
            </div>
          </li>
          <li className="ai-svc" data-svc="">
            <div className="ai-svc__art ai-svc__art--mail" data-scene="svc-mail" aria-hidden="true">
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
            <div className="ai-svc__body">
              <h3 className="ai-svc__t" id="svc-3-t">{t("do.3.t")}</h3>
              <p className="ai-svc__p">{t("do.3.text")}</p>
              <p className="ai-svc__facts ai-svc__facts--talk">{t("do.3.facts")}</p>
              <div className="ai-svc__acts">{more("mail", 3)}</div>
            </div>
          </li>
          <li className="ai-svc" data-svc="">
            <div className="ai-svc__art ai-svc__art--flow" data-scene="svc-flow" aria-hidden="true">
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
            <div className="ai-svc__body">
              <h3 className="ai-svc__t" id="svc-4-t">{t("do.4.t")}</h3>
              <p className="ai-svc__p">{t("do.4.text")}</p>
              <p className="ai-svc__facts ai-svc__facts--talk">{t("do.4.facts")}</p>
              <div className="ai-svc__acts">
                {more("custom", 4)}
                <ButtonLink href={caseHref} variant="ghost" size="xs" className="ai-svc__case">{t("do.case")}</ButtonLink>
              </div>
            </div>
          </li>
        </ul>
        <div className="ai-svcs__end">
          <Sample>{c("sample")}</Sample>
          <Replay scenes="svc-tg svc-crm svc-mail svc-flow" label={t("replay.svc")}>{c("replay")}</Replay>
        </div>
        <p className="ai-do__foot">
          <span>{t("do.foot")}</span> <span>{t("do.weeks.note")}</span>{" "}
          <a className="link" href="#calc">
            <span>{t("price.calc")}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg>
          </a>
        </p>

        {panel({
          id: "lead",
          n: 1,
          steps: [
            { who: "person", actor: who("client"), text: t("svc.1.s1") },
            { who: "sys", actor: who("prog"), text: t("svc.1.s2") },
            { who: "person", actor: who("you"), text: t("svc.1.s3") },
          ],
          side: (<>{inc("lead", 4)}{price(facts.lead, facts.leadWeeks)}</>),
          count: "lead",
          talk: "0",
        })}
        {panel({
          id: "crm",
          n: 2,
          steps: [
            { who: "person", actor: who("client"), text: t("svc.2.s1") },
            { who: "sys", actor: who("bot"), text: t("svc.2.s2") },
            { who: "sys", actor: who("crm"), text: t("svc.2.s3") },
            { who: "person", actor: who("mgr"), text: t("svc.2.s4") },
          ],
          how: (
            <a className="ai-dlg__link" href={asstHref}>
              <span>{t("svc.2.ex")}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
            </a>
          ),
          side: (<>{inc("crm", 5)}{price(facts.crm, facts.crmWeeks)}<p className="ai-dlg__note">{t("inc.crm.note")}</p></>),
          count: "crmAi",
          talk: "2",
        })}
        {panel({
          id: "mail",
          n: 3,
          steps: [
            { who: "person", actor: who("client"), text: t("svc.3.s1") },
            { who: "sys", actor: who("prog"), text: t("svc.3.s2") },
            { who: "sys", actor: who("prog"), text: t("step.3.text") },
            { who: "person", actor: who("mgr"), text: t("svc.3.s4") },
          ],
          side: (
            <>
              <p className="ai-dlg__price ai-dlg__price--talk">{t("svc.after")}</p>
              <a className="ai-dlg__link" href="#how" data-close-go="">
                <span>{t("svc.3.see")}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19.5v-15M6 10.5l6-6 6 6" /></svg>
              </a>
            </>
          ),
          talk: "1",
        })}
        {panel({
          id: "custom",
          n: 4,
          steps: [
            { who: "person", actor: who("you"), text: t("svc.4.s1") },
            { who: "sys", actor: who("us"), text: t("svc.4.s2") },
            { who: "sys", actor: who("us"), text: t("svc.4.s3") },
          ],
          side: (
            <>
              <p className="ai-dlg__h">{t("svc.4.ex")}</p>
              <a className="ai-dlg__door" href={caseHref}>
                <span className="ai-dlg__tag ai-dlg__tag--case">{t("ex.case.k")}</span>
                <span className="ai-dlg__dt">{t.rich("ex.case.t", aiRich)}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
              </a>
              <a className="ai-dlg__door" href={asstHref}>
                <span className="ai-dlg__tag">{t("ex.asst.k")}</span>
                <span className="ai-dlg__dt">{t.rich("ex.asst.t", aiRich)}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
              </a>
              <p className="ai-dlg__price ai-dlg__price--talk">{t("do.4.facts")}</p>
            </>
          ),
          count: "custom",
          talk: "",
        })}
      </div>
    </section>
  );
}
