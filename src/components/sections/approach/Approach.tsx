import { getTranslations } from "next-intl/server";
import { rich } from "@/lib/rich";
import { ApproachClient, StageStoneSlot } from "./ApproachClient";
import { StageChecks } from "./StageChecks";
import "./approach.css";

/**
 * 5 · Підхід: the stages from the prototype to the launch, and after it. Wide screens: a deck pinned
 * while the page runs on, the 3D stone beside it turning a quarter per stage; otherwise a list with a
 * line that fills as you read; phones get their own picture (approach-phone.js). Markup 1:1 from v2.
 */
export async function Approach() {
  const t = await getTranslations();
  return (
    <ApproachClient>
      <div className="container">
        <header className="s-head s-head--process">
          <p className="s-head__meta" data-sr="">
            <span className="s-head__index">5</span>
            <span>{t("nav.approach")}</span>
          </p>
          <h2 className="s-head__title s-head__title--stone" id="approach-title" data-split="">
            <span className="tone">{t.rich("approach.title", rich)}</span>
          </h2>
          <p className="s-head__intro" data-sr="">
            <span className="t-d">{t.rich("approach.intro.text", rich)}</span>
            <span className="t-m">{t.rich("approach.intro.m", rich)}</span>
          </p>
        </header>
        <div className="process__body" data-stages="">
          {/* on wide screens the stage list is a deck pinned while the page runs on (.process__run);
               the stone in the left lane turns at each stage (js/stage-stone.js) */}
          <div className="process__track">
            <div className="process__pin">
              {/* the left lane: the stage line, from the first node to the last; below it the line goes on dashed */}
              <div className="process__lane" aria-hidden="true">
                <StageStoneSlot />
                <span className="process__line">
                  <span className="process__fill"></span>
                </span>
                <span className="process__tail"></span>
              </div>
              <ol className="stages">
                <li className="stage" data-sr="">
                  <span className="stage__node" aria-hidden="true"></span>
                  <span className="stage__pic t-m" data-pic="1" aria-hidden="true">
                    <svg viewBox="0 0 72 44" focusable="false">
                      <g className="g-bub">
                        <path className="g-l" d="M6.5.5h22a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H13.5l-6 5.5v-5.6A6 6 0 0 1 .5 14.5v-8a6 6 0 0 1 6-6z" />
                        <rect className="g-f2 g-say" x="7" y="7" width="19" height="2" rx="1" />
                        <rect className="g-f g-say" x="7" y="12.5" width="12" height="2" rx="1" />
                      </g>
                      <rect className="g-l g-doc" x="38.5" y="8.5" width="33" height="35" rx="4" />
                      <g className="g-row">
                        <rect className="g-l" x="43.5" y="15.5" width="5" height="5" rx="1.5" />
                        <rect className="g-f2" x="52" y="17" width="15" height="2" rx="1" />
                      </g>
                      <g className="g-row">
                        <rect className="g-l" x="43.5" y="24.5" width="5" height="5" rx="1.5" />
                        <rect className="g-f" x="52" y="26" width="12" height="2" rx="1" />
                      </g>
                      <g className="g-row">
                        <rect className="g-l" x="43.5" y="33.5" width="5" height="5" rx="1.5" />
                        <rect className="g-f" x="52" y="35" width="14" height="2" rx="1" />
                      </g>
                      <g className="g-tick">
                        <rect className="g-ac" x="43.5" y="15.5" width="5" height="5" rx="1.5" />
                        <rect className="g-on" x="43.5" y="15.5" width="5" height="5" rx="1.5" />
                      </g>
                    </svg>
                  </span>
                  <p className="stage__num">1</p>
                  <h3 className="stage__title">{t("approach.stage.title.1")}</h3>
                  <div className="stage__v">
                    <p>
                      <span className="t-d">{t("approach.stage.v.1.text")}</span>
                      <span className="t-m">{t("approach.stage.v.1.m")}</span>
                    </p>
                    <StageChecks n={1} />
                  </div>
                </li>
                <li className="stage" data-sr="">
                  <span className="stage__node" aria-hidden="true"></span>
                  <span className="stage__pic t-m" data-pic="2" aria-hidden="true">
                    <svg viewBox="0 0 72 44" focusable="false">
                      <rect className="g-l" x=".5" y=".5" width="71" height="43" rx="4.5" />
                      <g className="g-w1">
                        <rect className="g-f2" x="6" y="5" width="10" height="3" rx="1.5" />
                        <rect className="g-f" x="48" y="5.5" width="6" height="2" rx="1" />
                        <rect className="g-f" x="57" y="5.5" width="9" height="2" rx="1" />
                      </g>
                      <path className="g-l" d="M.5 12.5h71" />
                      <g className="g-w2">
                        <rect className="g-l g-dash" x="6.5" y="17.5" width="26" height="15" rx="2" />
                        <path className="g-l g-dash" d="m6.5 17.5 26 15m0-15-26 15" />
                      </g>
                      <g className="g-w3">
                        <rect className="g-ac" x="38" y="18" width="25" height="3" rx="1.5" />
                        <rect className="g-on" x="38" y="18" width="25" height="3" rx="1.5" />
                      </g>
                      <rect className="g-f g-w4" x="38" y="24.5" width="27" height="2" rx="1" />
                      <rect className="g-f g-w5" x="38" y="29" width="18" height="2" rx="1" />
                      <g className="g-w6">
                        <rect className="g-f" x="6.5" y="37" width="17" height="2.5" rx="1.25" />
                        <rect className="g-f" x="27.5" y="37" width="17" height="2.5" rx="1.25" />
                        <rect className="g-f" x="48.5" y="37" width="17" height="2.5" rx="1.25" />
                      </g>
                    </svg>
                  </span>
                  <p className="stage__num">2</p>
                  <h3 className="stage__title">{t("approach.stage.title.2")}</h3>
                  <div className="stage__v">
                    <p>
                      <span className="t-d">{t("approach.stage.v.2.text")}</span>
                      <span className="t-m">{t("approach.stage.v.2.m")}</span>
                      <span className="stage__you t-m">{t("approach.stage.you.2.m")}</span>
                    </p>
                    <StageChecks n={2} />
                  </div>
                </li>
                <li className="stage" data-sr="">
                  <span className="stage__node" aria-hidden="true"></span>
                  <span className="stage__pic t-m" data-pic="3" aria-hidden="true">
                    <svg viewBox="0 0 72 44" focusable="false">
                      <g className="g-desk">
                        <rect className="g-l" x=".5" y=".5" width="50" height="35" rx="3.5" />
                        <path className="g-l" d="M.5 7.5h50M21.5 35.5 20 41.5M29.5 35.5l1.5 6M16 43.5h19" />
                        <circle className="g-d" cx="4.5" cy="4" r="1" />
                        <circle className="g-d" cx="8" cy="4" r="1" />
                        <circle className="g-d" cx="11.5" cy="4" r="1" />
                        <rect className="g-f2 g-k1" x="5" y="12" width="21" height="3.5" rx="1.75" />
                        <rect className="g-f g-k2" x="5" y="19" width="15" height="2" rx="1" />
                        <g className="g-k3">
                          <rect className="g-ac" x="5" y="25" width="11" height="4.5" rx="2.25" />
                          <rect className="g-on" x="5" y="25" width="11" height="4.5" rx="2.25" />
                        </g>
                        <g className="g-k4">
                          <rect className="g-l" x="31.5" y="11.5" width="14" height="18" rx="2" />
                          <circle className="g-f" cx="38.5" cy="20.5" r="3.5" />
                        </g>
                      </g>
                      <g className="g-ph">
                        <rect className="g-bgf" x="55.5" y="10.5" width="16" height="33" rx="3.5" />
                        <rect className="g-l" x="55.5" y="10.5" width="16" height="33" rx="3.5" />
                        <rect className="g-d" x="61" y="13" width="5" height="1.2" rx=".6" />
                        <rect className="g-f2" x="58.5" y="18" width="10" height="2.5" rx="1.25" />
                        <rect className="g-f" x="58.5" y="23" width="7" height="1.5" rx=".75" />
                        <rect className="g-f" x="58.5" y="27" width="10" height="7" rx="1.5" />
                        <rect className="g-ac" x="58.5" y="37" width="10" height="3.5" rx="1.75" />
                        <rect className="g-on" x="58.5" y="37" width="10" height="3.5" rx="1.75" />
                      </g>
                    </svg>
                  </span>
                  <p className="stage__num">3</p>
                  <h3 className="stage__title">{t("approach.stage.title.3")}</h3>
                  <div className="stage__v">
                    <p>
                      <span className="t-d">{t("approach.stage.v.3.text")}</span>
                      <span className="t-m">{t("approach.stage.v.3.m")}</span>
                    </p>
                    <StageChecks n={3} />
                  </div>
                </li>
                <li className="stage" data-sr="">
                  <span className="stage__node" aria-hidden="true"></span>
                  <span className="stage__pic t-m" data-pic="4" aria-hidden="true">
                    <svg viewBox="0 0 72 44" focusable="false">
                      <rect className="g-l" x=".5" y=".5" width="71" height="43" rx="4.5" />
                      <path className="g-l" d="M.5 9.5h71" />
                      <circle className="g-d" cx="5" cy="5" r="1.1" />
                      <circle className="g-d" cx="8.8" cy="5" r="1.1" />
                      <rect className="g-l" x="14.5" y="2.5" width="43" height="5" rx="2.5" />
                      <g className="g-tag">
                        <rect className="g-ac" x="17" y="4" width="9" height="2" rx="1" />
                        <rect className="g-on" x="17" y="4" width="9" height="2" rx="1" />
                      </g>
                      <rect className="g-f" x="28.5" y="4.25" width="18" height="1.5" rx=".75" />
                      <rect className="g-f2 g-load" x="1" y="9" width="70" height="1" />
                      <rect className="g-f2 g-p" x="6" y="15" width="26" height="3.5" rx="1.75" />
                      <rect className="g-f g-p" x="6" y="22" width="20" height="2" rx="1" />
                      <rect className="g-f g-p" x="6" y="26.5" width="23" height="2" rx="1" />
                      <rect className="g-f2 g-p" x="6" y="32" width="12" height="4.5" rx="2.25" />
                      <rect className="g-l g-p" x="40.5" y="14.5" width="25" height="17" rx="2.5" />
                      <circle className="g-ping" cx="13" cy="34.5" r="3" />
                      <path className="g-cur" d="M13 33v9.4l2.5-2.2 1.8 3.9 1.7-.8-1.8-3.8 3.4-.3z" />
                    </svg>
                  </span>
                  <p className="stage__num">4</p>
                  <h3 className="stage__title">{t("approach.stage.title.4")}</h3>
                  <div className="stage__v">
                    <p>
                      <span className="t-d">{t("approach.stage.v.4.text")}</span>
                      <span className="t-m">{t("approach.stage.v.4.m")}</span>
                      <span className="stage__you t-m">{t("approach.stage.you.4.m")}</span>
                    </p>
                    <StageChecks n={4} />
                  </div>
                </li>
                <li className="stage stage--launch" data-sr="">
                  <span className="stage__node" aria-hidden="true"></span>
                  <span className="stage__pic t-m" data-pic="5" aria-hidden="true">
                    <svg viewBox="0 0 72 44" focusable="false">
                      <rect className="g-l" x=".5" y=".5" width="71" height="43" rx="4.5" />
                      <path className="g-l" d="M.5 9.5h71" />
                      <circle className="g-d" cx="5" cy="5" r="1.1" />
                      <circle className="g-d" cx="8.8" cy="5" r="1.1" />
                      <rect className="g-l" x="14.5" y="2.5" width="43" height="5" rx="2.5" />
                      <g className="g-lock">
                        <path className="g-l" d="M18.4 4.6v-.6a1.1 1.1 0 0 1 2.2 0v.6" />
                        <rect className="g-f2" x="17.7" y="4.5" width="3.6" height="2.3" rx=".6" />
                      </g>
                      <rect className="g-f2 g-url" x="23.5" y="4.25" width="20" height="1.5" rx=".75" />
                      <rect className="g-f2" x="6" y="15" width="28" height="3.5" rx="1.75" />
                      <rect className="g-f" x="6" y="22" width="21" height="2" rx="1" />
                      <rect className="g-f2" x="6" y="28" width="13" height="4.5" rx="2.25" />
                      <g className="g-key">
                        <circle className="g-ac" cx="49" cy="30" r="5" />
                        <circle className="g-on" cx="49" cy="30" r="5" />
                        <circle className="g-hole" cx="49" cy="30" r="1.7" />
                        <path className="g-l" d="M54 30h12.5M62.5 30v3.5M66 30v2.5" />
                      </g>
                    </svg>
                  </span>
                  <p className="stage__num">5</p>
                  <h3 className="stage__title">{t("approach.stage.title.5")}</h3>
                  <div className="stage__v">
                    <p>{t("approach.stage.v.5")}</p>
                    <p className="checks__head t-m" aria-hidden="true">{t("prototype.handoff.title")}</p>
                    <ul className="checks" data-checks="" aria-label={t("prototype.handoff.title")}>
                      <li>
                        <span className="check" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="m5 12.5 4.2 4.2L19 7" />
                          </svg>
                        </span>
                        <div>
                          <b>{t("prototype.checks.b.1")}</b>
                          <span>{t("prototype.checks.span.1")}</span>
                        </div>
                      </li>
                      <li>
                        <span className="check" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="m5 12.5 4.2 4.2L19 7" />
                          </svg>
                        </span>
                        <div>
                          <b>{t("prototype.checks.b.2")}</b>
                          <span>{t("prototype.checks.span.2")}</span>
                        </div>
                      </li>
                      <li>
                        <span className="check" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="m5 12.5 4.2 4.2L19 7" />
                          </svg>
                        </span>
                        <div>
                          <b>{t("prototype.checks.b.3")}</b>
                          <span>{t("prototype.checks.span.3")}</span>
                        </div>
                      </li>
                      <li>
                        <span className="check" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="m5 12.5 4.2 4.2L19 7" />
                          </svg>
                        </span>
                        <div>
                          <b>{t("prototype.checks.b.4")}</b>
                          <span>{t("prototype.checks.span.4")}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
              </ol>
            </div>
            <span className="process__run" aria-hidden="true"></span>
          </div>
          <div className="after">
            <span className="stage__node stage__node--after" aria-hidden="true"></span>
            <h3 className="after__head" id="after-title">{t.rich("after.title", rich)}</h3>
            <div className="after__list">
              <p className="after__text">
                <span className="t-d">{t("approach.after.text")}</span>
                <span className="t-m">{t.rich("approach.after.m", rich)}</span>
              </p>
              <p className="after__text after__text--guarantee t-d">{t.rich("approach.guarantee", rich)}</p>
            </div>
          </div>
        </div>
      </div>
    </ApproachClient>
  );
}
