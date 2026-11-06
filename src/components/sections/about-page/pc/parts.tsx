import type { getTranslations } from "next-intl/server";
import { num } from "../docs";

export type T = Awaited<ReturnType<typeof getTranslations<"about">>>;
export type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** the roles of the cast (about.team.N), and «Ви» */
export type Role = "1" | "2" | "3" | "you";

/** a person, in a thin line (AboutDirect's stations) */
export const PERSON = <><circle cx="12" cy="9" r="3.75" /><path d="M5 20c.9-3.7 3.6-5.75 7-5.75S18.1 16.3 19 20" /></>;
export const TICK = <path d="m6 12.5 4 4L18 8" />;

/** a role's tag as text: the cast's mono tag (about.team.N.role, or «Ви») */
export const roleTag = (t: T, role: Role) => (role === "you" ? t("direct.you") : t(`team.${role}.role`));

/**
 * A document's chip: its index (01 … 05) and its title (about.work.N.h), 14 px. The same chip in the scene's window
 * (its tab), in the rail's folder slot and in the ivory folder's cell, so a flight between them is a translate only.
 */
export function Chip({ t, n, dark }: { t: T; n: number; dark?: boolean }) {
  return (
    <span className={dark ? "pc-chip pc-chip--dark" : "pc-chip"} data-chip={n}>
      <span className="pc-chip__n">{num(n)}</span>
      <span className="pc-chip__t">{t(`work.${n}.h`)}</span>
    </span>
  );
}

/**
 * A scene's key line: the mono key (the document's index, when it has one), a hairline, then the role at work on it as
 * real text with an ember dot (the rail's marker only echoes it, aria-hidden).
 */
export function Key({ t, n, k, role }: { t: T; n?: number; k: string; role: Role }) {
  return (
    <p className="pc-key">
      <span className="pc-key__k">
        {n ? <span className="pc-key__n">{num(n)}</span> : null}
        <span className="pc-key__w">{k}</span>
      </span>
      <span className="pc-key__rule" aria-hidden="true" />
      <span className="pc-key__role">
        <i className="pc-key__dot" aria-hidden="true" />
        <span>{roleTag(t, role)}</span>
      </span>
    </p>
  );
}

/**
 * The kit's dark demo window (the services' demos, AboutDirect's): three dots, the document's chip as its tab (S2–S5),
 * «Приклад» at the right; the body clips what it holds and its height is fixed in CSS (CLS 0).
 */
export function Win({ t, n, className, children }: { t: T; n?: number; className: string; children: React.ReactNode }) {
  return (
    <figure className={`pc-win ${className}`} data-pc-view="">
      <div className="pc-win__bar">
        <span className="pc-win__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {n ? (
          <span className="pc-win__tab">
            <Chip t={t} n={n} />
          </span>
        ) : null}
        <span className="pc-win__sample">{t("direct.sample")}</span>
      </div>
      <div className="pc-win__body">{children}</div>
    </figure>
  );
}
