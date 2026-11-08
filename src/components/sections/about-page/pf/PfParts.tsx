/**
 * TEMPORARY · variant F «Розмова»: the chat's small parts, shared by its blocks. No faces, no initials, no photos: each
 * role has a round ember badge with an abstract CSS glyph of its own (pf.css: the lines of a message for «Супровід», a
 * rising route for «Сайти, реклама, автоматизація», a window for «Дизайн і розробка»); the team as a whole is the
 * three badges stacked (a group chat's picture, motionsites' Social Hangouts).
 */

export type Role = 1 | 2 | 3;
export type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** a role's badge (decorative: the role's name is always said next to it) */
export const Badge = ({ role }: { role: Role }) => <span className="pf-badge" data-role={role} aria-hidden="true" />;

/** the team as a group: the three badges stacked */
export const Stack = () => (
  <span className="pf-stack" aria-hidden="true">
    <span className="pf-badge" data-role={1} />
    <span className="pf-badge" data-role={2} />
    <span className="pf-badge" data-role={3} />
  </span>
);

/** a tick (the system's «готово»: lime on the page, never a button) */
export const Tick = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="m6 12.5 4 4L18 8" />
  </svg>
);

/** the arrow between who sends and who gets a message */
export const To = () => (
  <svg className="pf-to" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path d="M2.5 8h10M9 4.5 12.5 8 9 11.5" />
  </svg>
);

/**
 * A message from the team: the sender's badge in the avatar column, the role's name above the bubble (mono), and
 * the bubble. Before it arrives, the role «types» (three dots over the bubble's place; gone in the final frame, so it
 * never takes room). `got`: which of the five things it delivers (the side panel's tick); `team`: signed by the whole
 * team (the stacked badges)
 */
export function TeamMsg({ who, role, got, className = "", children }: { who: string; role: Role | "team"; got?: number; className?: string; children: React.ReactNode }) {
  return (
    <li className={`pf-msg pf-msg--team ${className}`} data-pf-msg="" data-got={got}>
      {role === "team" ? <Stack /> : <Badge role={role} />}
      <p className="pf-msg__who">{who}</p>
      <div className="pf-msg__body">
        <span className="pf-typing" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div className="pf-bub">{children}</div>
      </div>
    </li>
  );
}

/** a message from the visitor («Ви»), on the right */
export function YouMsg({ who, className = "", children }: { who: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <li className={`pf-msg pf-msg--you ${className}`} data-pf-msg="">
      <p className="pf-msg__who">{who}</p>
      <div className="pf-msg__body">
        <div className="pf-bub">{children}</div>
      </div>
    </li>
  );
}
