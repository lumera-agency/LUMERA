import { Chip, roleTag, type CSSVars, type Role, type T } from "./parts";

const CAST: readonly Exclude<Role, "you">[] = ["1", "2", "3"];
const SLOTS = [1, 2, 3, 4, 5] as const;

/**
 * The rail: one dark card (the main page's .card) beside blocks 1–3 on wide screens, sticky under the topbar on a screen
 * tall enough (pc.css). It answers two questions all the way down:
 * · who works on the step being read: the three roles and «Ви» as credits (a mono tag, one plain line), one ember marker
 *   on the one at work (runtime/pc.js moves it; each scene's key line names the same role as text, so it is aria-hidden);
 * · what is already yours: «Папка проєкту», five fixed slots whose titles fill in as each scene hands its document over,
 *   and empty again once the ivory block gives the folder to you (a visual echo of the scenes: aria-hidden).
 * Phones: the cast card in the first screen, static, without the folder.
 */
export function PcRail({ t }: { t: T }) {
  return (
    <aside className="pc-rail card" aria-label={t("work.sign")}>
      <p className="pc-rail__k">{t("work.sign")}</p>
      <ul className="pc-cast">
        {CAST.map((role, i) => (
          <li className="pc-cast__row" data-role={role} style={{ "--i": i } as CSSVars} key={role}>
            <span className="pc-marker" aria-hidden="true" />
            <span className="pc-cast__tag">{roleTag(t, role)}</span>
            <span className="pc-cast__d">{t(`team.${role}.d`)}</span>
          </li>
        ))}
        {/* the last credit: you (on at load: the first screen is about who you will talk to) */}
        <li className="pc-cast__row pc-cast__row--you is-on" data-role="you" style={{ "--i": 3 } as CSSVars}>
          <span className="pc-marker" aria-hidden="true" />
          <span className="pc-cast__tag">{roleTag(t, "you")}</span>
          <span className="pc-cast__d">{t("pc.cast.you")}</span>
        </li>
      </ul>
      <div className="pc-rail__folder" aria-hidden="true">
        <p className="pc-rail__k">{t("work.folder")}</p>
        <ol className="pc-slots">
          {SLOTS.map((n) => (
            <li className="pc-slot" data-slot={n} key={n}>
              <Chip t={t} n={n} />
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
