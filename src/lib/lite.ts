"use client";
/*
 * LITE, the light mode (the owner, 10 Nov 2026, after «на рабочем компьютере сильно лагает»; 11 Nov 2026: two modes,
 * FULL and LITE): html.is-lite. Who turns it on and in what order: lib/perf/mode.ts. It is told before anything is
 * drawn by the layout's early script (lib/perf/early.ts), or later by the monitor once the page has stayed slow
 * (lib/perf/monitor.ts). The visitor has no switch of their own (the owner, 12 Nov 2026).
 *
 * What LITE leaves out:
 * - three.js and every live scene; nothing of their code is fetched. In their place (the owner, 11 Nov 2026: «вместо
 *   картинок добавь видео, статические вообще не имеет смысла»): films of the live scenes, each drawn by one small
 *   shader (fx/alpha-film): the robot (RobotSlot: a phone's film, a computer's film), the droplet (SitesDropletSlot);
 *   a still of the film's own frame stands until the film plays, and stays where the browser has no WebGL. The home
 *   stone is a still with its orbit of services turning round it in CSS (HeroShell, HeroOrbit; the owner, 12 Nov 2026:
 *   its film stuttered). Still pictures only: the stone of «Подход» (StageStoneSlot), the ads page's fibres and the
 *   sites page's lines (their CSS). The footer's chrome name keeps its effect, calm (Wordmark; the owner, 12 Nov
 *   2026): the metal stands as a picture, the lens follows the cursor; its plain still stands only where no graphics
 *   card draws it;
 * - the preloader: the page comes up at once (Preloader);
 * - the glide: Lenis is neither started nor fetched, the page scrolls natively (SmoothScroll);
 * - the text's animations: the headlines' lines sliding in (useHeroIntro, ScrollReveals), the words lighting up
 *   (TextFill), the AI page's blurred words (BlurText), the manifesto's (ManifestoClient: one fade instead), the sites
 *   page's liquid title (TitleFx);
 * - the numbers counting up (AdsCases, ShrinkTotal, the services' demos);
 * - the rail's flashing lights (hero.css), the cards raining behind the robot (robot-hero.css);
 * - the sample sites' entrances and their 3D (configurator, sites-runtime, the samples' own WebGL parts).
 * The blocks still fade in (on the compositor). The content, the navigation and the forms are the same in both modes.
 */
export { LITE_KEY, goLite, isLite, useLite, watchMode as watchLite } from "@/lib/perf/mode";
