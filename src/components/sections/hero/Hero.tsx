import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/header/Header";
import { ButtonLink } from "@/components/ui/button/Button";
import { HeroShell } from "./HeroShell";
import { HeroRail } from "./HeroRail";

/** 1 · The first screen: the stone, the headline, one CTA, the rail. */
export async function Hero() {
  const t = await getTranslations("hero");
  const tone = (i: number) => ({ "--i": i }) as React.CSSProperties;
  return (
    <HeroShell orbitLabel={t("orbit")}>
      <Header />
      <div className="hero__content" id="main">
        <div className="hero__copy" data-copy>
          <h1 className="hero__title" data-title>
            <span className="tone" style={tone(0)}>{t("title.1")}</span> <br />
            <span className="tone" style={tone(1)}>{t("title.2")}</span> <br />
            <span className="tone tone--key" style={tone(2)}>{t("title.3")}</span>
          </h1>
          <div className="hero__actions" data-reveal="cta">
            <ButtonLink href="#contact" variant="primary" magnetic>{t("cta")}</ButtonLink>
          </div>
        </div>
        <HeroRail />
      </div>
    </HeroShell>
  );
}
