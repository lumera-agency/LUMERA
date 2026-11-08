/**
 * TEMPORARY · variant F «Розмова»: the chat's small parts, shared by its blocks. No faces, no initials: each role has a
 * round ember badge with an abstract CSS glyph of its own (pf.css: the lines of a message for «Супровід», a rising
 * route for «Сайти, реклама, автоматизація», a window for «Дизайн і розробка»); the team as a whole is the three badges
 * stacked (a group chat's picture, motionsites' Social Hangouts). The first screen's profile cards take the real photos
 * once the owner sends them (PfTeam's PHOTOS); until then their frames show the role's glyph (RoleGlyph).
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

/**
 * A role's glyph at the size of a picture: the photo frame's empty state while there is no photo (line art, never a
 * person). The same three ideas as the badges: a message for «Супровід», a route rising to its launch for «Сайти,
 * реклама, автоматизація», a window for «Дизайн і розробка»; the ember part is the role's own mark
 */
export const RoleGlyph = ({ role }: { role: Role }) => (
  <svg className="pf-glyph" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    {role === 1 && (
      <>
        <path d="M30 30h60a12 12 0 0 1 12 12v28a12 12 0 0 1-12 12H56l-16 13V82H30a12 12 0 0 1-12-12V42a12 12 0 0 1 12-12Z" />
        <path d="M34 50h44M34 62h28" />
        <circle className="pf-glyph__em" cx="90" cy="30" r="7" />
      </>
    )}
    {role === 2 && (
      <>
        <path d="M18 92h84" className="pf-glyph__soft" />
        <path d="M24 84 48 60l18 12 30-38" />
        <circle cx="24" cy="84" r="5" />
        <circle cx="48" cy="60" r="5" />
        <circle cx="66" cy="72" r="5" />
        <circle className="pf-glyph__em" cx="96" cy="34" r="7" />
      </>
    )}
    {role === 3 && (
      <>
        <rect x="16" y="24" width="88" height="72" rx="10" />
        <path d="M16 40h88" />
        <path d="M28 56h40M28 66h28" className="pf-glyph__soft" />
        <circle cx="26" cy="32" r="1.6" />
        <circle cx="33" cy="32" r="1.6" />
        <circle cx="40" cy="32" r="1.6" />
        <rect className="pf-glyph__em" x="28" y="76" width="26" height="9" rx="4.5" />
      </>
    )}
  </svg>
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
