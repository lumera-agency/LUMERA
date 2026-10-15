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
export async function SitesFormats({ facts: F }: { facts: SitesFacts }) {
  const t = await getTranslations("sites");
  return (
    <section className="section section--ivory ai-sec st-formats" id="formats" aria-labelledby="formats-title">
      <div className="container">
        <header className="s-head">
          <p className="s-head__meta"><span className="s-head__index">2</span><span>{t("nav.formats")}</span></p>
          <h2 data-split="" className="s-head__title" id="formats-title"><span className="tone">{t.rich("fmt.title", R)}</span></h2>
          <p className="s-head__intro">{t("fmt.intro")}</p>
        </header>

        {/* the showroom: the four formats as a rail of tabs (name, volume, price: all four prices at once) and one large stage:
             the sample site itself, as it looks on a computer and a phone, with the format's volume made visible (the landing's
             six blocks, Лендінг+'s ten with the four extra in ember, the 5–7 pages fanned out, the store's catalogue) */}
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
          <article className="st-stage" id="fmt-stage-landing" role="tabpanel" aria-labelledby="fmt-tab-landing" data-fmt="landing">
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 01</p>
              <h3 className="st-stage__t" id="fmt-1-t"><span className="st-stage__tin">{t("f.landing.t")}</span></h3>
              <p className="st-stage__m">{t("f.landing.m")}</p>
              <p className="st-stage__p">{t("f.landing.p")}</p>
              <ul className="st-stage__inc"><li>{t("inc.landing.1")}</li><li>{t("inc.landing.2")}</li><li>{t("inc.anim")}</li><li>{t("inc.landing.3")}</li><li>{t("inc.landing.4")}</li><li>{t("inc.landing.5")}</li></ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="landing">{F.landing}</b><span className="st-stage__wk" data-fweeks="landing">{F.wLanding}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="landing" aria-describedby="fmt-1-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-landing" data-open="dlg-landing"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="landing"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            <div className="st-stage__art" data-scene="stage-landing" aria-hidden="true">
              <div className="st-dev st-dev--landing">
                <ol className="st-ruler" data-ruler="landing" />
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAATQAAAAD/wAARCABNABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwAHBwcHBwcMBwcMEQwMDBEXERERERceFxcXFxceJB4eHh4eHiQkJCQkJCQkKysrKysrMjIyMjI4ODg4ODg4ODg4/9sAQwEJCQkODQ4ZDQ0ZOyghKDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7/90ABAAC/9oADAMBAAIRAxEAPwDnY/DdtKiPmAZUH52IIH41R/s+0lnEUqxqWONz8DI9665dD15gQ1hLkADlQc4GMDINLZeGNXNx5t3azoq/MAq8MfQj0qYSm2+dJdj7BTpcs21Hy0T69jjJ9NsBJsPlSbPlzG2QPbiof7N0/wD55r+Z/wAa66bwhrEczmC0mdHbdkrg89qj/wCEU17/AJ8pfyrVSREa8LbR+5H/0NC78VT22vTWaWnmIblo2dixAIY89eK6/SfENzcO1tFHGqKu5QM+v1rn500C51F5zJIsrSElQBjcT355rVW1tNGhl1R1mZAhJ+6PfjnvXBPG05xapvX0PVxNGDlH2a0/r7zurOeWaIvIADnHFWtxryW3+KOjxR4+zTcnPO3/ABqf/hauj/8APtN+n+NQqk7as82Veim1c//R6pLNo2bhASxPbOf8aS/s9Tu7R7dmLIUPyZ4LY4qtDLKdVmiNoNhLHzDk5wa6m5kMOj3F5EN1xHGWjjHcjoK8OngIU6vJGTva/kezXqVaaTmkeHv4I1ZnOLUsAcAs+Mj6Cm/8INq//Pn/AORDXqPh7VtW1GyebU7b7PKJCoXBGVABzz7k1u+fL/dr1vkeM6EW7s//0sSa9s3gURM6yqACd3BPeqpugEH73n/eriZr9Ps6JBBGuIwjEgFi3ds9q9/0G28JxadaNfRQu720RdXj5DbQSc45zkVbkfSxz22ip/j/AMA80+1HH+t/8eo+1H/nr/49/wDXq98Q7bS4dahGkpGsJtlJ8sYBbc4PTvXBeWP7tHP5B/rB/wBO/wAf+Af/0/ItllsUCJixTJIbjOPp+lXbPVJYG2zvctEq4VElZceg/CrJ8Uzf2d/ZxtIMeUIvMwd3AC564zgUyx8UXNhAbeK3hYMxYllyeRjH6ZokrqxtKd1d7ryKGqXsV1cCSITABQP3shc9T3I6VneYPRvzrS1XU4tWnS4e3SIrGEIjOASCTnH41l/uP7n61CppdX97I5j/2Q==)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="3478" alt="" loading="lazy" decoding="async" data-src={t("img.landing._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="4293" alt="" loading="lazy" decoding="async" data-src={t("img.landing.m")} /></div></div>
                
              </div>
            </div>
          </article>
          <article className="st-stage" id="fmt-stage-landingPlus" role="tabpanel" aria-labelledby="fmt-tab-landingPlus" data-fmt="landingPlus" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 02</p>
              <h3 className="st-stage__t" id="fmt-2-t"><span className="st-stage__tin">{t("f.plus.t")}</span></h3>
              <p className="st-stage__m">{t("f.plus.m")}</p>
              <p className="st-stage__p">{t("f.plus.p")}</p>
              <ul className="st-stage__inc"><li>{t("inc.plus.1")}</li><li>{t("inc.landing.2")}</li><li>{t("inc.anim")}</li><li>{t("inc.landing.3")}</li><li>{t("inc.landing.4")}</li><li>{t("inc.landing.5")}</li></ul>
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
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAAcQAAAAD/wAARCABxABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwAHBwcHBwcMBwcMEQwMDBEXERERERceFxcXFxceJB4eHh4eHiQkJCQkJCQkKysrKysrMjIyMjI4ODg4ODg4ODg4/9sAQwEJCQkODQ4ZDQ0ZOyghKDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7/90ABAAC/9oADAMBAAIRAxEAPwD12Sci/NpFIobbu2nrWsMJEHk5PfFZ15aG5WSPzTHvXbleCPcGmaHZTaZpaaddTm7ZCxMjZycnI656dKyRbNJYYIhmAYV/m/E0uBTic+2KSmB//9D2vAE7SOARjGDWHunMjbQ4AYjjjpW8xG/aVLfyqJbu2OcHp1/CsizF0CK9iiuvt0jyM9wzIW7IVXAHsK3+feiCeKdPMhOV/KpqYH//0fcfl3ZJrm7awuYnleQg7mOAPQnNWLmOY3bOCduelVQtyIycMWznH49KxsaXNuzQxRFX4O6rWR61gKJSoJBB9Kdtk9DTuI//0vabh/LZSM/McVlx39zJcz27RsqRsAj/AN4Hn9OlbJLb9uzI9aEKkn5QDWRZUa6kU4x+lN+1yf3f0rRwPSjA9KdxWZ//0/bvM/eeXgn3+tSrGu/aOGNcl4g8WWnhxibqFmXKDcpHVs4H6VraNr0OsabFqUAZUl3YB6/KSv8ASsizZdChwabSBzJ81LQB/9T1/UNHsNVUxXsXmAkE/wDAelGmabY6TaJp1ihWKPdgHn7xJP6muN1j4lWGi6nPpklrK7QNtLKwAPAP9aWx8dSagolsNJuZg43jayE49cZzis7Mu56IAAOBilrzDUPiZBpM4ttS0y5gkKhgrFc4PAP6VR/4XBpH/PlP+a0WYXP/1eE8eFB4w1Lf/wA9BjHrsFd34e8c6Fp+gWWn3GwSQJhj84bOSeSo5HNexzadZTSmaSFGY8klQc/Wmf2dpx4FtFwf7oqOYqx81ePPENp4i1iO/t2DBYFjO3OMhmPf2NcVvSvs1dL03H/HtF/3wKd/Zem/8+0X/fAo5gsf/9b029/5CY+o/wDQayT/AMfk/wDvj/0EVrXv/ITH1H/oNZJ/4/J/98f+gisyzorXpJ/10arVVbXpJ/10arVAH//Z)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="5118" alt="" loading="lazy" decoding="async" data-src={t("img.landingPlus._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="6019" alt="" loading="lazy" decoding="async" data-src={t("img.landingPlus.m")} /></div></div>
                <span className="st-dev__badge"><b>+4</b> <span>{t("stage.plus")}</span></span>
              </div>
            </div>
          </article>
          <article className="st-stage" id="fmt-stage-corporate" role="tabpanel" aria-labelledby="fmt-tab-corporate" data-fmt="corporate" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 03</p>
              <h3 className="st-stage__t" id="fmt-3-t"><span className="st-stage__tin">{t("f.corp.t")}</span></h3>
              <p className="st-stage__m">{t("f.corp.m")}</p>
              <p className="st-stage__p">{t("f.corp.p")}</p>
              <ul className="st-stage__inc"><li>{t("inc.corp.1")}</li><li>{t("inc.corp.2")}</li><li>{t("inc.anim")}</li><li>{t("inc.landing.2")}</li><li>{t("inc.corp.4")}</li><li>{t("inc.corp.5")}</li></ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="corporate">{F.corporate}</b><span className="st-stage__wk" data-fweeks="corporate">{F.wCorporate}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="corporate" aria-describedby="fmt-3-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-corp" data-open="dlg-corp"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="corporate"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            {/* (the fan's cards are buttons: each shows its page large, js/sites-fx-page.js mountFan; so this art is not aria-hidden) */}
            <div className="st-stage__art" data-scene="stage-corp">
              <span className="ai-sample st-fan__chip">{t("x.sample")}</span>
              <div className="st-fan">
                <figure className="st-fan__p" style={{ "--i": "0" } as React.CSSProperties} data-pg="1"><div className="st-dev__bar" aria-hidden="true"><i /><i /><i /><span>{t("pg.1._")}</span></div><img width="600" height="600" alt="" loading="lazy" decoding="async" src={t("img.corp0")} /></figure><figure className="st-fan__p" style={{ "--i": "1" } as React.CSSProperties} data-pg="2"><div className="st-dev__bar" aria-hidden="true"><i /><i /><i /><span>{t("pg.2._")}</span></div><img width="600" height="600" alt="" loading="lazy" decoding="async" src={t("img.corp1")} /></figure><figure className="st-fan__p" style={{ "--i": "2" } as React.CSSProperties} data-pg="3"><div className="st-dev__bar" aria-hidden="true"><i /><i /><i /><span>{t("pg.3._")}</span></div><img width="600" height="600" alt="" loading="lazy" decoding="async" src={t("img.corp2")} /></figure><figure className="st-fan__p" style={{ "--i": "3" } as React.CSSProperties} data-pg="5"><div className="st-dev__bar" aria-hidden="true"><i /><i /><i /><span>{t("pg.5._")}</span></div><img width="600" height="600" alt="" loading="lazy" decoding="async" src={t("img.corp3")} /></figure>
                <figure className="st-fan__p st-fan__p--more" style={{ "--i": "4" } as React.CSSProperties} aria-hidden="true" />
                <span className="st-dev__badge"><b>+1–3</b> <span>{t("pg.more")}</span></span>
              </div>
            </div>
          </article>
          <article className="st-stage" id="fmt-stage-ecommerce" role="tabpanel" aria-labelledby="fmt-tab-ecommerce" data-fmt="ecommerce" hidden>
            <div className="st-stage__copy">
              <p className="st-stage__k"><span>{t("g.format")}</span> · 04</p>
              <h3 className="st-stage__t" id="fmt-4-t"><span className="st-stage__tin">{t("f.shop.t")}</span></h3>
              <p className="st-stage__m">{t("f.shop.m")}</p>
              <p className="st-stage__p">{t("f.shop.p")}</p>
              <ul className="st-stage__inc"><li>{t("inc.shop.1")}</li><li>{t("inc.shop.2")}</li><li>{t("inc.anim")}</li><li>{t("inc.shop.3")}</li><li>{t("inc.shop.4")}</li><li>{t("inc.shop.5")}</li></ul>
              <p className="st-stage__price"><span className="st-stage__from">{t("from")}</span> <b data-fprice="ecommerce">{F.ecommerce}</b><span className="st-stage__wk" data-fweeks="ecommerce">{F.wEcommerce}</span></p>
              <div className="st-stage__acts">
                <ButtonLink href="#contact" variant="primary" size="sm" data-pick-format="ecommerce" aria-describedby="fmt-4-t">{t("talk")}</ButtonLink>
                <button className="st-more2" type="button" aria-haspopup="dialog" aria-controls="dlg-shop" data-open="dlg-shop"><span>{t("more")}</span><i aria-hidden="true"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-plus" /></svg></i></button>
                <button className="st-ghost" type="button" data-calc-format="ecommerce"><span>{t("count")}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5v15M6 13.5l6 6 6-6" /></svg></button>
              </div>
            </div>
            <div className="st-stage__art" data-scene="stage-shop" aria-hidden="true">
              <div className="st-dev st-dev--shop">
                <div className="st-dev__desk"><div className="st-dev__bar"><i /><i /><i /><span className="ai-sample">{t("x.sample")}</span><span>vash-sait.ua</span></div><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAAcgAAAAD/wAARCAByABQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwAHBwcHBwcMBwcMEQwMDBEXERERERceFxcXFxceJB4eHh4eHiQkJCQkJCQkKysrKysrMjIyMjI4ODg4ODg4ODg4/9sAQwEJCQkODQ4ZDQ0ZOyghKDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7/90ABAAC/9oADAMBAAIRAxEAPwDufsvhgOUNrbgg94x/hVGeDSEuGSKytCgMeCYlzhiAaeuh6WpmSW4O4ZbJwNoXk/XHvTv+EWsp5gY7l8uEIUY5AOR+dZ86mvcZurRvzouHTvDx5+yW3/ftaT+zvD3/AD6W3/ftaP8AhGrf/ns/5D/Ck/4Rq3/57P8AkP8ACtNDM//Q37rwrql3c3h+3jyrgyFY9hym/gc55xWtbaLqlrdxXEd0u2KONCuw5JRSM5zxk89K0TJqaT3O2AFHUKh3dcZHTt1qc3WpedHmAFRGQx3dGyMcd+KxjCML8q3NKvv25nexoAuR+8wT7UtZejtqbabD/bAAuguJMEHn8OK081qSf//R9CGs3meYHxn+4elYet+KtZsGhbT7WVw4cOvlsQemOgOO9dmjks+VA29eecep9KkK7Rjb17VnKN1a5Uk2rbGHZ65cTWkUs9vKrsilhsPBxzVn+2H/AOeEv/fJrU5HBGKM07Aj/9L0XyNSa7uEhmjJlUYXHIHzYzVl4dWSdC0iAJGysCOTkg5H0qlc6bqE08s0V0E3gKo25xg5555p8tlqc0TRm7+9E0WSo6t3/CoaTLvd2ZNo1reWOmw2d7MLiWIbWkHfvWpzWPoWmzaRZG0ml84l2fdjHB7Yya2dxoV7CP/T9MnvJYFjYFSWuFjIP91mx/LvVm7vLe0cNNJsRuBwTk/gDWLqmiXV/MJbaXyfmQ8g4O1gT0Petm0t5beBY5m3MM8jPPNSaya5VYfbXKXUXnRZ2kkAnjOOM81Pk0UUEH//1O3vtL1q4mvnguVVLhIliU5+TyySTx6g9quabZ6taRWsNxKkiwxskhwcsS2cgmtaNNpY8ZJ7USGULmFVdgeA5Kj8wD/Ko5VuVclwaMGo4jKyZuFVGz0QlhjtyQP5VL8tMD//1fXFI5UYJprSxpwzKMZ7+nWoZLmCF9k0ioSM/NxxUf26z3mMzICByCfWpKLoIPTnHFLUcbrIgdTuDcgjvUlAH//W9QkhhlO6VFc9MsAaT7PbnrGvp0FTUVJQo+UBV4A6AUuT60lFAH//2Q==)" } as React.CSSProperties}><img className="st-dev__img" width="900" height="5127" alt="" loading="lazy" decoding="async" data-src={t("img.shop._")} /></div></div>
                <div className="st-dev__phone"><div className="st-dev__vp" style={{ "--lqip": "url(data:image/jpeg;base64,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)" } as React.CSSProperties}><img className="st-dev__img" width="300" height="5319" alt="" loading="lazy" decoding="async" data-src={t("img.shop.m")} /></div></div>
              </div>
            </div>
          </article>
        </div>
        </div>

        <div className="st-fmts__end">
          <p className="st-fmts__note"><span>{t("fmt.unsure._")}</span> <a className="link" href="#contact" data-pick-format="unsure">{t("fmt.unsure.a")}</a></p>
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
            <p className="ai-dlg__lead"><span>{t("f.landing.m")}</span>. <span>{t("f.landing.p")}</span></p>
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
                </ol>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="landing">
                  <li>{t("inc.landing.1")}</li>
                  <li>{t("inc.landing.2")}</li>
                  <li>{t("inc.anim")}</li>
                  <li>{t("inc.landing.3")}</li>
                  <li>{t("inc.landing.4")}</li>
                  <li>{t("inc.landing.5")}</li>
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
                <p className="ai-dlg__h">{t("dlg.blocks")}</p>
                <ol className="st-blocks">
                  <li><b>{t("blk.1._")}</b><span>{t("blk.1.d")}</span></li>
                  <li><b>{t("blk.2._")}</b><span>{t("blk.2.d")}</span></li>
                  <li><b>{t("blk.3._")}</b><span>{t("blk.3.d")}</span></li>
                  <li><b>{t("blk.4._")}</b><span>{t("blk.4.d")}</span></li>
                  <li><b>{t("blk.5._")}</b><span>{t("blk.5.d")}</span></li>
                  <li><b>{t("blk.6._")}</b><span>{t("blk.6.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("blk.7._")}</b><span>{t("blk.7.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("blk.8._")}</b><span>{t("blk.8.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("blk.9._")}</b><span>{t("blk.9.d")}</span></li>
                  <li className="st-blocks__add"><b>{t("blk.10._")}</b><span>{t("blk.10.d")}</span></li>
                </ol>
              </div>
              <div className="ai-dlg__side">
                <p className="ai-dlg__h">{t("inc.h")}</p>
                <ul className="ai-dlg__inc" data-inc="landingPlus">
                  <li>{t("inc.plus.1")}</li>
                  <li>{t("inc.landing.2")}</li>
                  <li>{t("inc.anim")}</li>
                  <li>{t("inc.landing.3")}</li>
                  <li>{t("inc.landing.4")}</li>
                  <li>{t("inc.landing.5")}</li>
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
                  <li>{t("inc.corp.1")}</li>
                  <li>{t("inc.corp.2")}</li>
                  <li>{t("inc.anim")}</li>
                  <li>{t("inc.landing.2")}</li>
                  <li>{t("inc.corp.4")}</li>
                  <li>{t("inc.corp.5")}</li>
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
                  <li>{t("inc.shop.1")}</li>
                  <li>{t("inc.shop.2")}</li>
                  <li>{t("inc.anim")}</li>
                  <li>{t("inc.shop.3")}</li>
                  <li>{t("inc.shop.4")}</li>
                  <li>{t("inc.shop.5")}</li>
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
