/* eslint-disable @next/next/no-img-element -- the stills and the board's pictures are set, swapped and sliced by the page's script (runtime) */
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button/Button";
import { ArrowIcon } from "@/components/ui/icons/ArrowIcon";
import { aiRich as R } from "@/components/ai/rich";
import type { SitesFacts } from "@/components/sites/facts";

/**
 * 2 · Формати (ivory): the four formats as a rail of tabs (all four prices at once) and one stage with the sample
 * site on a computer and a phone (the corporate site: its four pages fanned out); «Детальніше» opens the format's
 * panel. Prices and weeks from the main page's configurator engine (facts).
 */
/** «сайт-візитка · 5–6 блоків» stays on one line: the browser would break after the hyphen or before the dot */
const NW = { nw: (chunks: React.ReactNode) => <span style={{ whiteSpace: "nowrap" }}>{chunks}</span> };

/** «Що входить у ціну» per format (the owner's packages, 26 Nov 2026): the panels («Детальніше») list every line and
 *  the calculator reads them there ([data-inc], sites-runtime); the AI search's line carries its note in small type */
const INC = {
  landing: ["inc.landing.1", "inc.landing.2", "inc.landing.3", "inc.landing.4", "inc.landing.5", "inc.landing.6", "inc.landing.7", "inc.landing.8", "inc.landing.9"],
  landingPlus: ["inc.plus.all", "inc.plus.1", "inc.plus.2"],
  corporate: ["inc.corp.1", "inc.corp.2", "inc.landing.2", "inc.corp.3", "inc.landing.4", "inc.plus.2", "inc.landing.5", "inc.landing.6", "inc.landing.9"],
  ecommerce: ["inc.shop.1", "inc.shop.2", "inc.shop.3", "inc.landing.2", "inc.shop.4", "inc.landing.4", "inc.landing.5", "inc.shop.5", "inc.landing.9"],
} as const;
/** the format's card: the main lines only, the rest in its panel */
const CARD = {
  landing: ["inc.landing.1", "inc.landing.2", "inc.landing.3", "inc.landing.4", "inc.landing.9"],
  landingPlus: ["inc.plus.all", "inc.plus.1", "inc.plus.2", "inc.landing.9"],
  corporate: ["inc.corp.1", "inc.corp.2", "inc.landing.2", "inc.plus.2", "inc.landing.9"],
  ecommerce: ["inc.shop.1", "inc.shop.2", "inc.shop.3", "inc.shop.4", "inc.landing.9"],
} as const;
const AI_LINE: string = "inc.landing.5";

export async function SitesFormats({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  return (
    <section className="section section--ivory ai-sec st-formats" id="formats" aria-labelledby="formats-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">2</span><span>{t("nav.formats")}</span></p>
          <h2 data-split="" className="s-head__title" id="formats-title"><span className="tone">{t.rich("fmt.title", { ...R, mk: (c) => <span className="st-mk">{c}</span> })}</span></h2>
          <p className="s-head__intro">{t("fmt.intro")}</p>
        </header>

        {/* the showroom: the four formats as a rail of tabs (name, volume, price: all four prices at once) and one large stage:
             the sample site itself, as it looks on a computer and a phone, with the format's volume made visible (the landing's
             ten blocks (since 26 Nov 2026), Лендінг+'s ten with the four extra in ember, the 5–7 pages fanned out, the store's catalogue) */}
        <div className="st-room" data-room="">
        <div className="st-rail" role="tablist" aria-label={t("nav.formats")}>
          <button className="st-rail__t" type="button" role="tab" id="fmt-tab-landing" aria-controls="fmt-stage-landing" aria-selected="true" tabIndex={0} data-tab="landing">
            <span className="st-rail__n" aria-hidden="true">01</span>
            <b className="st-rail__name">{t("f.landing.t")}</b>
            <span className="st-rail__vol">{t("f.landing.s")}</span>
            <span className="st-rail__price"><span>{t("from")}</span> <b data-fprice="landing">{F.landing}</b></span>
            <span className="st-rail__go" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#ico-arrow" /></svg></span>
          </button>
          <button className="st-rail__t" type="button" role="tab" id="fmt-tab-landingPlus" aria-controls="fmt-stage-landingPlus" aria-selected="false" tabIndex={-1} data-tab="landingPlus">
            <span className="st-rail__n" aria-hidden="true">02</span>
            <b className="st-rail__name">{t("f.plus.t")}</b>
            <span className="st-rail__vol">{t("f.plus.s")}</span>
            <span className="st-rail__price"><span>{t("from")}</span> <b data-fprice="landingPlus">{F.landingPlus}</b></span>
            <span className="st-rail__go" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#ico-arrow" /></svg></span>
          </button>
          <button className="st-rail__t" type="button" role="tab" id="fmt-tab-corporate" aria-controls="fmt-stage-corporate" aria-selected="false" tabIndex={-1} data-tab="corporate">
            <span className="st-rail__n" aria-hidden="true">03</span>
            <b className="st-rail__name">{t("f.corp.t")}</b>
            <span className="st-rail__vol">{t("f.corp.s2")}</span>
            <span className="st-rail__price"><span>{t("from")}</span> <b data-fprice="corporate">{F.corporate}</b></span>
            <span className="st-rail__go" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#ico-arrow" /></svg></span>
          </button>
          <button className="st-rail__t" type="button" role="tab" id="fmt-tab-ecommerce" aria-controls="fmt-stage-ecommerce" aria-selected="false" tabIndex={-1} data-tab="ecommerce">
            <span className="st-rail__n" aria-hidden="true">04</span>
            <b className="st-rail__name">{t("f.shop.t")}</b>
            <span className="st-rail__vol">{t("f.shop.s")}</span>
            <span className="st-rail__price"><span>{t("from")}</span> <b data-fprice="ecommerce">{F.ecommerce}</b></span>
            <span className="st-rail__go" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><use href="#ico-arrow" /></svg></span>
          </button>
        </div>
        <div className="st-stages">
          <div className="st-stage" id="fmt-stage-landing" role="tabpanel" aria-labelledby="fmt-tab-landing" data-fmt="landing">
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 01</p>
              <h3 className="st-stage__t" id="fmt-1-t"><span className="st-stage__tin">{t("f.landing.t")}</span></h3>
              <p className="st-stage__m">{t.rich("f.landing.m", NW)}</p>
              <p className="st-stage__p">{t("f.landing.p")}</p>
              <ul className="st-stage__inc">{CARD.landing.map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="landing">{F.landing}</b><span className="st-stage__wk" data-fweeks="landing">{F.wLanding}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="landing" aria-describedby="fmt-1-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-landing" data-open="dlg-landing"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="landing"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            <div className="st-stage__art" data-scene="stage-landing" aria-hidden="true">
              <div className="st-dev st-dev--landing">
                <ol className="st-ruler" data-ruler="landing" data-stops="0.0,0.06,0.193,0.313,0.437,0.518,0.634,0.722,0.804,0.868" />
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCACEABQDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAAUDBAYCAQf/xAAwEAACAQMDAgQEBQUAAAAAAAABAgMABBEFEiExUQYTQWEUInGBMpGhwdEVJDSisf/EABkBAAIDAQAAAAAAAAAAAAAAAAIEAAEDBf/EACkRAAIABAQDCQAAAAAAAAAAAAABAgMRIQQSMVETYaEUIjJBUrHh8PH/2gAMAwEAAhEDEQA/AKX9Nsl2s86IwAPzRkkHt1qmbaEvhkjGTgkjiphfRAEG5jXttZuf0riK7sVmDTXIZV+bC7s59PSghjd8x3FHKSiby8tCKa3t1fbugfaMfKeBRRcz6e87PHcYDckMrHmijzr6gFOl0vToUJL+6ESqJmAwBwAD+Y+lXdA0u21T4h7uaRCrKAVI+YtnvUreE9YIwVteOP8AIWmujeHtWsUcm0hm3MrKyXCcYz/NU9LHHFur6FbWN0sUUkrKU3ZbHcjt7UU91PSNYvrhZVsUQBNuDcKfUn96KlyES6tfJqjJFBCIGmZHbYp6E8nNO7PULp3ZTIhX0UIBj34qHybCadpRb3DSKeWGeD+VWba2to2MqQyhm4O9uaGKKqsMTXBFEnBoMLeaR1bd1DY6e1FcLMEGBH/tRWSzUuZugiN5dxyOFtZHGcAnH81RbVGTUFSedbQNgPk5KCr0d5K7kC1wu4gtgfnXeo2VoLSS6kS2llxwGQE59PWsJWJcTaaqlt+jHDUPOu/wS2cll8OBDqxuVXguwGQexorFxa5JbJsWO0jzyQIgKKYcS2EXMSsMF8Q5Xi3U8Z5ulzz9qr3HiNMsjWh3bSoIlBHI69Kd2EFlqVlHLG8bPAqttWPAibZzux+IV3YxWMEUV0syOtwAA8inH4jgc9Dk+tAsJJT09xjjzNzEm9IY7UCKeQq4P/QaKY+IreztNRWOGEIDGGI35BJJ560U2LOCF3aNBHounGR1FrAmDgf3LZP2Bq0fDekCJpDagRqMs3mNgfrUMj6Zp988k01yrsxQ5hyM5pzBPaaho7ol0Et7hGTLja2M4Jwax72enkMzFLXgdRNHovh+Vd0aQuoOMrMT+9FMbLwpb2UTRxTyFWbdzjsPb2oormVhdq8Wj6mE33nllXZw2188/arWj3Gk6dp8Vq92svllvmaIknJz2rLzai80A8yFyirw/kHgfWpEhupo1MdldupAIKwk5Hoa1ojqLDYWl4+qNyPEGlgAC5AA6YRv4orBS+dbsFltrmNiMgNGRxRVZUX2bC+vqhBPcyTgb5GJChR6DA6V9A07xJY2trbgG3DrCiMfiFGcL6g9PWshJa34hLmArEIwdxRemBz0968s7bUDumt4Q4GQSVBA79RVPSxzHTVM0Wva1Y3t3FJHPGAIgpAcNzk9vrRWZv5L1ZwLmNEfbwPKA4yew75ooVm2BsQNqN60Jia6mMZXaULcY7Vyl7dRqFS4lVdxbAbjPTNFFGVU6fUbuTb5k7OVG0FgCcUUUVCH/9k=)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="5922" alt="" loading="lazy" decoding="async" data-src={t("img.landing._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="7008" alt="" loading="lazy" decoding="async" data-src={t("img.landing.m")} /></div></div>
                
              </div>
            </div>
          </div>
          <div className="st-stage" id="fmt-stage-landingPlus" role="tabpanel" aria-labelledby="fmt-tab-landingPlus" data-fmt="landingPlus" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 02</p>
              <h3 className="st-stage__t" id="fmt-2-t"><span className="st-stage__tin">{t("f.plus.t")}</span></h3>
              <p className="st-stage__m">{t("f.plus.m")}</p>
              <p className="st-stage__p">{t("f.plus.p")}</p>
              <ul className="st-stage__inc">{CARD.landingPlus.map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="landingPlus">{F.landingPlus}</b><span className="st-stage__wk" data-fweeks="landingPlus">{F.wLandingPlus}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="landingPlus" aria-describedby="fmt-2-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-plus" data-open="dlg-plus"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="landingPlus"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            <div className="st-stage__art" data-scene="stage-plus" aria-hidden="true">
              <div className="st-dev st-dev--plus">
                <ol className="st-ruler" data-ruler="landingPlus" />
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCAB1ABQDASIAAhEBAxEB/8QAGwAAAwADAQEAAAAAAAAAAAAAAAMEAgUGAQf/xAAyEAABBAEDAQYEBAcAAAAAAAABAAIDEQQFEiExBhMiQVFhFXGB0RQyk+EWJEJUkbHB/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/AOuMn846FkjQQL27SVX+WMFws+fkpsmATNkYZ3M3ivCaI+SNMxzhYDMZ87sotJPeSfmNm1hpm+GEHdHGGh/iPFWfdCZJZIocUhBiPBK5xqjQFqGpHPPgkoEjrX1V5LQ88OJ+SBIw3Rr5oNPiY2RG7JMr5n75S5u5xNChwPbhC3McjJG7o3tc31BsIQZV4rWqx4Z2ukL2ECzQ6+adK6UZDqfTL6JQll7suLnE35A/6UFUDS1hG0jn0QkNkeQDucL9UKiyUhrhdeL2UrM1kk00IZtdEQNxb1v0VjiwuDXUXD2Q1rOrQgUZWj+lqE7Y0+Q/whEe7m7qsX6IawgkizamnzsLGlInyYo38CnuqvRPgyYJ2NnhdHI13R7XWD5IphBHUIXrn7jfCEGk1rQmasKdKYzvDrB6UKVGj6adO0yHFkl710YI3AdbJP8A1PfqWnwyuZLl4rZGmnNdI0EH3Shqmm7iTn4n6zfuguaKFWhR/FtO/v8AE/Vb90IPmXaDntBqI8PE7jyAus0LB074NhTSQxyTPjG5suKZG9TyC1t39SjUuxrc7UcjJOa5gmkL6EYNX9Uj+AwBQ1SUDpQj/dWpEvanGwRqMX4TGjjjMIsCLZZ3O5ogIVJ7AtdydTlPzi/dCtI6eTPLct8Pdghrg279RaTLqboibia4XxyR6/ZCFlTWagXNvuwOT5oQhB//2Q==)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="5264" alt="" loading="lazy" decoding="async" data-src={t("img.landingPlus._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="6132" alt="" loading="lazy" decoding="async" data-src={t("img.landingPlus.m")} /></div></div>
                {/* the sample's pages (27 Nov 2026): a tab puts that page's still in the frames (sites-runtime initStagePages) */}
                <span className="st-dev__pages" data-ptabs="">{t("pv.lp.tabs").split("·").map((w, i) => <b key={i} data-pi={i} className={i ? undefined : "is-on"}>{w.trim()}</b>)}</span>
              </div>
            </div>
          </div>
          <div className="st-stage" id="fmt-stage-corporate" role="tabpanel" aria-labelledby="fmt-tab-corporate" data-fmt="corporate" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 03</p>
              <h3 className="st-stage__t" id="fmt-3-t"><span className="st-stage__tin">{t("f.corp.t")}</span></h3>
              <p className="st-stage__m">{t("f.corp.m")}</p>
              <p className="st-stage__p">{t("f.corp.d")} {t("f.corp.p")}</p>
              <ul className="st-stage__inc">{CARD.corporate.map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="corporate">{F.corporate}</b><span className="st-stage__wk" data-fweeks="corporate">{F.wCorporate}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="corporate" aria-describedby="fmt-3-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-corp" data-open="dlg-corp"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="corporate"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            {/* (the fan's cards are buttons: each shows its page large, js/sites-fx-page.js mountFan; so this art is not aria-hidden) */}
            <div className="st-stage__art" data-scene="stage-corp" aria-hidden="true">
              {/* (16 Oct, the owner: as the other formats, a smooth scroll; no fan of cards, no film. The corporate site
                  scrolls through its pages: Головна, then the first screen of Послуги, Про нас and Контакти; the ruler lights
                  each page as it passes) */}
              <div className="st-dev st-dev--corp">
                <ol className="st-ruler" data-ruler="corporate" data-stops="0,0.44,0.53,0.70" />
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="5227" alt="" loading="lazy" decoding="async" data-src={t("img.corp._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="3319" alt="" loading="lazy" decoding="async" data-src={t("img.corp.m")} /></div></div>
                <span className="st-dev__badge"><b>+1–3</b> <span>{t("pg.more")}</span></span>
              </div>
            </div>
          </div>
          <div className="st-stage" id="fmt-stage-ecommerce" role="tabpanel" aria-labelledby="fmt-tab-ecommerce" data-fmt="ecommerce" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 04</p>
              <h3 className="st-stage__t" id="fmt-4-t"><span className="st-stage__tin">{t("f.shop.t2")}</span></h3>
              <p className="st-stage__m">{t("f.shop.m")}</p>
              <p className="st-stage__p">{t("f.shop.d")} {t("f.shop.p")}</p>
              <ul className="st-stage__inc">{CARD.ecommerce.map((k) => <li key={k}>{t(k)}</li>)}</ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="ecommerce">{F.ecommerce}</b><span className="st-stage__wk" data-fweeks="ecommerce">{F.wEcommerce}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="ecommerce" aria-describedby="fmt-4-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-shop" data-open="dlg-shop"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="ecommerce"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            <div className="st-stage__art" data-scene="stage-shop" aria-hidden="true">
              <div className="st-dev st-dev--shop">
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="4756" alt="" loading="lazy" decoding="async" data-src={t("img.shop._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAABnwAAAAD/wAARCAGfABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwAGBgYGBgYKBgYKDgoKCg4SDg4ODhIXEhISEhIXHBcXFxcXFxwcHBwcHBwcIiIiIiIiJycnJycsLCwsLCwsLCws/9sAQwEHBwcLCgsTCgoTLh8aHy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4u/90ABAAC/9oADAMBAAIRAxEAPwD1p/AXw1V2hXTbNJFJ64zx14Lexqe0+HXw+u4i0emWs65xuUDH0+U11U9kzTtIZpVySdodQOvbIzTorUrL5guJByGwZF2/TAXpQBylp8KfA8EbJc6ZbzsXdgxTbhWJKrgH+EcZ6mrX/Crvh/8A9AW2/I/413ikMMjn6UtAH//Q991e6W1juLl+kSs35CuA8L+J9R1fUZbO/jjRREHQr1LAgN+HNaXxGvZLPTTEgOLiYIx9FHzH88V5XoGtR23iKyEPzCRjGwHXDDHP86TPbwmDjPBzqNa9PKx9Qaec2wPuau1naWc2in1JrRpniH//0feNY0BNdS5s7+ZvImBCrtX5GBGGUjnI964TRvhv4b8OaobubV1eVRgJKyKVz3655Few7VklwR93JByeP0/rXHap8O/CWu38uq6lp6zXM+N7mWRS20bRwCB0HpSaTNY15xi4Reh12nyQSWwNs6SICQCjBhx7ir1Yug+H9I8M2H9maJALe33s+wMzfM3U5Yk1tUzI/9L6Ya7MTsot5Dz1BTB9+Wqad7W3iM0xCqO5OP5mvLfFniNtM8RWlmJfLQuplXA+ZXbaBz6deK5n4h3V5q8o0G2DSIVCmKMgs8i/OOM8f1rKpWUHFPq0jplhZpRfdNo99gmjniWWI5VhkGpsivM7LWV8O6dZ6NJbXLtbW8Sk+Xk52AkHbkZHQ4Jqz/wmcX/Pndf9+m/wreSSdkzlT0P/0/fNXs/Cs1/FPrMUUtzD88TMp3KCeOn0rPt28EfbZtXWSF52y7Oc5HlgZOO3GO3PavOPFUXimTUrm6MgjeSZ4UiwNq20QBVt2eS+7njPaue02wg1ILa6XMwu2G6WVRtI2kNwD1BIHbpXz2Lx9WlXlTkk0npp5X1Otxjajq/e/BHuqaf4f8Rr/asErTrJ8u5HdR8vGCARgjvxmn/8IlovpL/38k/+Kqfw/p66ZpUUAbe7DzJHxje7cscYra3H/P8A+qvbhOTinLcwqcik1G9j/9T1bV4Vn1G53D/low9P4UrO0XT7LTp2uIYwryKQxHevS3e6EzbHQgMeChPH/fX9KkjkufM+coVz0EeD+e6uOWDjKUpPqW535P7o3TsPYQsDnKCru3/P+TVkYx0xS10qFlYh6u5//9X6e8s7yVmIJPQBfy6VbrLfTYndnIcFmJ4lcDk+gq+u5QFCgAe/agCWimRszrlgAfY5/oKfQB//1vadV8SrYeKYNIa9gRJIJppImwZAY8FQPmz84JwMZ44qO58WW7ac1xb3Xly7Y3QEAlg56AHvjJ9qx9W+Hh1Hx3D4x80KIXiYwmMHeYhgHdu78Y44xXU3XhdLu08qby9wnaddqYxvyMdT0B61hmMZqMZYV3dtVtqXhuXn/e7XOqs5Umt0ljkEqsMhx/EPXirNVLG2SztI7WNQixjaAOlW62jeyuS99D//1/SvGPiqTRvEFpZo4ETOpnBGfkdto57dzW34p8R/8I7ptreiMymaeOAhSMhWyS3PoBmr2peD9H8R6lHqeqQOJLV8IQxXeFbI3L0Zc9M10FxYLdMUdF2Lgrn/AA7VpiOScIKC1W/mRh1OE5Sk73enkX7f7n4mp6aiBF2inVik0jVs/9DvfH3irTtG8WaNZXVtNKwk812j6Mjho1UDI3EOQ2Paum8ReMzodz9mtlDyJw6sDjlQVwf507WPCPh7xHrEWrayzLNZttjHm7BhX3DgH1q1rPhix1y7+03d5NHCCrDy5UC5xjuDW1ScHGKitVuQk7u51GlalDqtr9qgyAGKHII5H1rSqtaRJDCFSQyD+8cHtjsAO1WaxLP/0fSb/wAOLPqF5PIoKPLIxGP4mbOc/SuJ1q6LtJ4U07TmmuIo4i10ucRKcNuYLgkjsOa9++xs87ySOFG8nbnIIqNdMthdTTIFTzSCzLjLEDHP0xSaurCauU/B5i/sKGOKVpfLJViwIO4dRggGuoqraWyWyMqOX3NuJbGc4A7ADtVqhID/0vf5Nb0wXcluWbejlW+U4yDj1q899pscRmYvt68ZzXi/iLUru31yWGxLKGuJTLIse/YF5Ax0+Y96t3uuaolt5QG6QRo+1E3BgfvAkH5Tzz6VwYrHwoW5ursdVHCzq/CezaTqlpq1qbmyLFFdkJcYOV61p1yPgqCSDSXSVGjJndgGGDhgCD+Irrq7FJtXOdrU/9P6VOm2EbvcyxqSzFido7+vHNPjtNNYkJbRjcOf3eMj3yKvModSpPWoooBEchi31Oalwi90PmY6CCK3QxwrtGc4qaiiqEf/1PojUItQuoDHp9z9llzkP5av+BDCvO/h/rfinXptQe+1KCSKwu2tyscSZfZ/FkBcA9jWr498cQeB9OhujCZ57lykKZwuVGSWPoB+deLfDX4jQ6PqE+nanbqE1W883zIVwUeY4AK90B/EV30MPUnh5zjHRenzMZySmk2fVvmv60ea/rTDxxSV55sf/9Xrfjf9lfwpA8hUut0mzJGeVbOP614Z8P8A7OfGWkNIqlBcDJboMA4/WvtV7D7TM6TygrklF2o2Af8AeTjH1NM+w2Wn4url02qQBujjUZY4XlUB6mvSw+YzpUZUEtGc9ShzTU7lvevrRvT1q1BJBcJ5kW1hnGRyKm2J6CvLujpsz//W+mr2O4u7Oe3tZTBI6OiSrglGIIDAeoPOK8tXwD462lX8Y3eT0Pkrx/49XqQ+eVlQt15wy8fh1qwIcHJdz7ZoAxvDWlano+mfY9W1GTVJ97N58ihGwcYXAJ6V0FNQADA7epzTqAP/1/pZY9W82Qs8IjLHYADnb2ySOtXY0lABlbJxyB0zWVby6lcPI6gRokrKBLGwYqpIyMPgg9j+OK2N/GcGkkA8UUUUwP/Q+gLON11TU2ublbhHljMcSqcw4jAIYjru610sIQRqIxhe1Y9vFZWt7c3KQ7JLlgZGUsdxUYHBGBx6VrLMhUEZwfXA/mabd9xtLoSIGA+Yg89hinVHFsAIQYGfXNSUhH//0fqFVVpC3OQfXj8s1NTV6t9afQAClpBS0Af/0vpdoZEkYxhvmOcrt5/rVpEcKAxyfcnP6UKGM7HPA7c//qpLibyRyCQR/CrMf/HaAJkBAOfWn1DbuHiVlzg/3gQfyPNTUAf/0/W9b+HnhvxHq8us3N9eJLKFBSGfbGNqheFwR0H51lSfCHwntw2oagAT2uMH/wBBrqP7Smn5gAiQEjLD5jj0HQfj+VUZ7qQXCKJjhuDH1B9wexoBnWaLaaboGlwaPaztJHbqVVpn3uQST8zd+tan2y1/56L+dedlw7Eh5TgkZXGOPT1o/wCBTfpQK5//1PabmCRZPtVpy/8AHGThZB/Rh2P4GsuRL64n+aB0gXsCu5z7nOQPpXfSwXAkbbIQCcgCJSAPTNOjgnLrmQ46kGNRmgDz1rG9U/6PGVU84Jxz+Bpv2PVP7h/77Neq+XH/AHR+VHlx/wB0flSsKyP/1fpuZMyZ2g8f3Cf1zUkcgRAuxvwUgU17pkcr5TnBIyATUsU4lJ+R0x/eGM/SgCVG3DOCPqMU6iigD//W+j7vS/tcqyOZF2OWG2QgHjAzx2rNl8MwTIqO8+FMfAmYfcOcfieT6+1bqQBpmdXPDHuf5ZxVkbixQMcj2FKy5lPqg6WKek6cmmWpt0Ltl2cl3Lkljk8mtKgdOeaKZTk27tn/1/p6Nkid9zdT34qVFBkMynIYAVWVEe4YcgjnPHr9Kv0AFFFFAH//0Pp8ECQkDDdM7f65pUeZh84APtg/1FZdymui4ka0Fu0RxtEmcjA56DuaZ5fiFZ2ZDbbD0BB4/L1oA3k3Y+anVWtBdCAfbSplySdnQc8AVZoA/9k=)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="6225" alt="" loading="lazy" decoding="async" data-src={t("img.shop.m")} /></div></div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="st-fmts__end">
          {/* (23 Nov 2026, the owner's keyword round: the format advice and the calculator below, both as links) */}
          <p className="st-fmts__note"><span>{t("fmt.unsure._")}</span> {t.rich("fmt.unsure.a", {
            contact: (c) => <a className="link" href="#contact" data-pick-format="unsure">{c}</a>,
            calc: (c) => <a className="link" href="#kalkuliator">{c}</a>,
          })}</p>
          <p className="st-fmts__note"><span>{t("fmt.has._")}</span> <a className="link" href="#faq-has">{t("fmt.has.a")}</a></p>
          <button className="ai-replay" type="button" data-replay="fmt-landing fmt-plus fmt-corp fmt-shop" aria-label={t("replay.fmt")}><span aria-hidden="true">↻</span> <span>{t("x.replay")}</span></button>
        </div>

        {/* the formats' panels: which blocks or pages, what the price includes; «Порахувати» sets block 3, «Обговорити» the form */}
        <dialog className="ai-dlg st-dlg" id="dlg-landing" aria-labelledby="dlg-landing-t">
          <div className="ai-dlg__panel">
            <div className="ai-dlg__head">
              <p className="ai-dlg__k"><span>{t("nav.formats")}</span> · 1</p>
              <button className="ai-dlg__x" type="button" data-close="" aria-label={t("close")}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-x" /></svg></button>
            </div>
            <h3 className="ai-dlg__t" id="dlg-landing-t">{t("f.landing.t")}</h3>
            <p className="ai-dlg__lead"><span>{t.rich("f.landing.m", NW)}</span>. <span>{t("f.landing.p")}</span></p>
            <div className="ai-dlg__grid">
              <div>
                <p className="ai-dlg__h">{t("dlg.blocks")}</p>
                <ol className="st-blocks">
                  <li><b>{t("blk.1._")}</b><span>{t("blk.1.d")}</span></li>
                  <li><b>{t("blk.2._")}</b><span>{t("blk.2.d")}</span></li>
                  <li><b>{t("blk.3._")}</b><span>{t("blk.3.d")}</span></li>
                  <li><b>{t("blk.4._")}</b><span>{t("blk.4.d")}</span></li>
                  <li><b>{t("blk.5._")}</b><span>{t("blk.5.d")}</span></li>
                  <li><b>{t("blk.6._")}</b><span>{t("blk.6.d")}</span></li>
                  <li><b>{t("blk.7._")}</b><span>{t("blk.7.d")}</span></li>
                  <li><b>{t("blk.8._")}</b><span>{t("blk.8.d")}</span></li>
                  <li><b>{t("blk.9._")}</b><span>{t("blk.9.d")}</span></li>
                  <li><b>{t("blk.10._")}</b><span>{t("blk.10.d")}</span></li>
                </ol>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="landing">
                  {INC.landing.map((k) => (
                    <li key={k}>{t(k)}{k === AI_LINE && <small className="st-inc__note">{t("inc.ai")}</small>}</li>
                  ))}
                </ul>
                <p className="ai-dlg__price"><span>{t("from")}</span> <b className="ai-dlg__sum" data-fprice="landing">{F.landing}</b> <span className="ai-dlg__once">{t("once")}</span> <span className="ai-dlg__wk"><span>{t("launch")}</span> <span data-fweeks="landing">{F.wLanding}</span></span></p>
                <p className="ai-dlg__note">{t("dlg.note._")}</p>
              </div>
            </div>
            <div className="ai-dlg__foot">
              <button className="btn btn--ghost btn--sm" type="button" data-calc-format="landing"><span className="btn__label">{t("count")}</span><ArrowIcon /></button>
              <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="landing">{t("talk")}</ButtonLink>
            </div>
          </div>
        </dialog>

        <dialog className="ai-dlg st-dlg" id="dlg-plus" aria-labelledby="dlg-plus-t">
          <div className="ai-dlg__panel">
            <div className="ai-dlg__head">
              <p className="ai-dlg__k"><span>{t("nav.formats")}</span> · 2</p>
              <button className="ai-dlg__x" type="button" data-close="" aria-label={t("close")}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-x" /></svg></button>
            </div>
            <h3 className="ai-dlg__t" id="dlg-plus-t">{t("f.plus.t")}</h3>
            <p className="ai-dlg__lead"><span>{t("f.plus.m")}</span>. <span>{t("f.plus.p")}</span></p>
            <div className="ai-dlg__grid">
              <div>
                <p className="ai-dlg__h">{t("dlg.pages")}</p>
                <ol className="st-blocks">
                  <li><b>{t("pp.1._")}</b><span>{t("pp.1.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("pg.2._")}</b><span>{t("pg.2.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("pg.3._")}</b><span>{t("pg.3.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("pp.4._")}</b><span>{t("pp.4.d")}</span></li>
                </ol>
                <p className="ai-dlg__note">{t("pp.note")}</p>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="landingPlus">
                  {INC.landingPlus.map((k) => (
                    <li key={k}>{t(k)}{k === AI_LINE && <small className="st-inc__note">{t("inc.ai")}</small>}</li>
                  ))}
                </ul>
                <p className="ai-dlg__price"><span>{t("from")}</span> <b className="ai-dlg__sum" data-fprice="landingPlus">{F.landingPlus}</b> <span className="ai-dlg__once">{t("once")}</span> <span className="ai-dlg__wk"><span>{t("launch")}</span> <span data-fweeks="landingPlus">{F.wLandingPlus}</span></span></p>
                <p className="ai-dlg__note">{t("dlg.note._")}</p>
              </div>
            </div>
            <div className="ai-dlg__foot">
              <button className="btn btn--ghost btn--sm" type="button" data-calc-format="landingPlus"><span className="btn__label">{t("count")}</span><ArrowIcon /></button>
              <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="landingPlus">{t("talk")}</ButtonLink>
            </div>
          </div>
        </dialog>

        <dialog className="ai-dlg st-dlg" id="dlg-corp" aria-labelledby="dlg-corp-t">
          <div className="ai-dlg__panel">
            <div className="ai-dlg__head">
              <p className="ai-dlg__k"><span>{t("nav.formats")}</span> · 3</p>
              <button className="ai-dlg__x" type="button" data-close="" aria-label={t("close")}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-x" /></svg></button>
            </div>
            <h3 className="ai-dlg__t" id="dlg-corp-t">{t("f.corp.t")}</h3>
            <p className="ai-dlg__lead"><span>{t("f.corp.m")}</span>. <span>{t("f.corp.p")}</span></p>
            <div className="ai-dlg__grid">
              <div>
                <p className="ai-dlg__h">{t("dlg.pages")}</p>
                <ol className="st-blocks">
                  <li><b>{t("pg.1._")}</b><span>{t("pg.1.d")}</span></li>
                  <li><b>{t("pg.2._")}</b><span>{t("pg.2.d")}</span></li>
                  <li><b>{t("pg.3._")}</b><span>{t("pg.3.d")}</span></li>
                  <li><b>{t("pg.4._")}</b><span>{t("pg.4.d")}</span></li>
                  <li><b>{t("pg.5._")}</b><span>{t("pg.5.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("pg.6._")}</b><span>{t("pg.6.d")}</span></li>
                </ol>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="corporate">
                  {INC.corporate.map((k) => (
                    <li key={k}>{t(k)}{k === AI_LINE && <small className="st-inc__note">{t("inc.ai")}</small>}</li>
                  ))}
                </ul>
                <p className="ai-dlg__price"><span>{t("from")}</span> <b className="ai-dlg__sum" data-fprice="corporate">{F.corporate}</b> <span className="ai-dlg__once">{t("once")}</span> <span className="ai-dlg__wk"><span>{t("launch")}</span> <span data-fweeks="corporate">{F.wCorporate}</span></span></p>
                <p className="ai-dlg__note">{t("dlg.note.pay")}</p>
              </div>
            </div>
            <div className="ai-dlg__foot">
              <button className="btn btn--ghost btn--sm" type="button" data-calc-format="corporate"><span className="btn__label">{t("count")}</span><ArrowIcon /></button>
              <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="corporate">{t("talk")}</ButtonLink>
            </div>
          </div>
        </dialog>

        <dialog className="ai-dlg st-dlg" id="dlg-shop" aria-labelledby="dlg-shop-t">
          <div className="ai-dlg__panel">
            <div className="ai-dlg__head">
              <p className="ai-dlg__k"><span>{t("nav.formats")}</span> · 4</p>
              <button className="ai-dlg__x" type="button" data-close="" aria-label={t("close")}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-x" /></svg></button>
            </div>
            <h3 className="ai-dlg__t" id="dlg-shop-t">{t("f.shop.t2")}</h3>
            <p className="ai-dlg__lead"><span>{t("f.shop.m")}</span>. <span>{t("f.shop.p")}</span></p>
            <div className="ai-dlg__grid">
              <div>
                <p className="ai-dlg__h">{t("dlg.pages")}</p>
                <ol className="st-blocks">
                  <li><b>{t("pg.1._")}</b><span>{t("spg.1.d")}</span></li>
                  <li><b>{t("spg.2._")}</b><span>{t("spg.2.d")}</span></li>
                  <li><b>{t("spg.3._")}</b><span>{t("spg.3.d")}</span></li>
                  <li><b>{t("spg.4._")}</b><span>{t("spg.4.d")}</span></li>
                </ol>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="ecommerce">
                  {INC.ecommerce.map((k) => (
                    <li key={k}>{t(k)}{k === AI_LINE && <small className="st-inc__note">{t("inc.ai")}</small>}</li>
                  ))}
                </ul>
                <p className="ai-dlg__price"><span>{t("from")}</span> <b className="ai-dlg__sum" data-fprice="ecommerce">{F.ecommerce}</b> <span className="ai-dlg__once">{t("once")}</span> <span className="ai-dlg__wk"><span>{t("launch")}</span> <span data-fweeks="ecommerce">{F.wEcommerce}</span></span></p>
                <p className="ai-dlg__note">{t("dlg.note.pay")}</p>
              </div>
            </div>
            <div className="ai-dlg__foot">
              <button className="btn btn--ghost btn--sm" type="button" data-calc-format="ecommerce"><span className="btn__label">{t("count")}</span><ArrowIcon /></button>
              <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="ecommerce">{t("talk")}</ButtonLink>
            </div>
          </div>
        </dialog>
      </div>
    </section>
  );
}
