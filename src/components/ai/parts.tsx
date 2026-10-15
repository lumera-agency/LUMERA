/** Small parts every AI page shares. */

/** «Приклад · дані умовні»: on every mock-up. */
export function Sample({ children }: { children: React.ReactNode }) {
  return <span className="ai-sample">{children}</span>;
}

/** «↻ Ще раз»: plays the named scenes again (runtime/ai-runtime.js shows it once a scene has played). */
export function Replay({ scenes, label, children }: { scenes: string; label: string; children: React.ReactNode }) {
  return (
    <button className="ai-replay" type="button" data-replay={scenes} aria-label={label}>
      <span aria-hidden="true">↻</span> <span>{children}</span>
    </button>
  );
}

/** The icons the AI pages draw with <use href="#ico-…">: one hidden sprite per page (the logo's is the layout's). */
export function AiSprite() {
  return (
    <svg className="sprite" width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <symbol id="ico-arrow" viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5" /></symbol>
      <symbol id="ico-tg" viewBox="0 0 24 24"><path d="M21 3 3 10.5l7 2.5 2.5 7z" /><path d="m10 13 4.5-4.5" /></symbol>
      <symbol id="ico-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></symbol>
      <symbol id="ico-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></symbol>
      <symbol id="ico-back" viewBox="0 0 24 24"><path d="M14.5 5.5 8 12l6.5 6.5" /></symbol>
      <symbol id="ico-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></symbol>
    </svg>
  );
}

/** The other example, after the questions: a wide link to its page. */
export function MoreLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <div className="container">
      <a className="ai-more" href={href}>
        <span className="ai-more__k">{label}</span>
        <span className="ai-more__t">{children}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#ico-arrow" /></svg>
      </a>
    </div>
  );
}
