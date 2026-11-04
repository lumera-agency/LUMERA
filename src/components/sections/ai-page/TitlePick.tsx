"use client";
/*
 * The first screen's title, its settings to choose from (the owner, 4 Nov 2026; robot-hero.css: .ai-bot[data-tt]): ?tt=
 * marks the screen, the CSS does the rest; 11…13 the steps with drawn marks, 21…23 the condensed capitals with them,
 * 2…5 the first round. Without it (or the script) the screen's own: the title 2.1, the kicker 3.3 (the owner's picks,
 * set in RobotHero).
 */
import { useEffect, useRef } from "react";

const SETTINGS = ["1", "2", "3", "4", "5", "11", "12", "13", "21", "22", "23"];

export function TitlePick() {
  const mark = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const pick = query.get("tt") ?? "";
    const kicker = query.get("kk") ?? "";
    const screen = mark.current?.closest<HTMLElement>(".ai-bot");
    if (screen && SETTINGS.includes(pick)) screen.dataset.tt = pick;
    // the kicker's place (?kk=1…4; 11…13 over the title, 31…33 at the top right, 41…44 on the left)
    if (screen && ["1", "2", "3", "4", "11", "12", "13", "31", "32", "33", "41", "42", "43", "44"].includes(kicker)) screen.dataset.kk = kicker;
  }, []);
  return <span ref={mark} hidden />;
}
