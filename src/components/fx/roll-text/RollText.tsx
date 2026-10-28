import "./roll-text.css";

/**
 * RollText — on hover of the nearest link/button, each letter rolls up out of sight and its copy
 * rolls in from below, one letter after another (CSS only: an ancestor with .roll-host triggers it).
 * The text is in the page once, whole: the rolling letters and their copies are drawn by CSS from
 * data-c (roll-text.css), so search engines and screen readers read the word, not its letters twice.
 */
export function RollText({ children }: { children: string }) {
  return (
    <>
      <span className="visually-hidden">{children}</span>
      <span className="roll" aria-hidden="true">
        {[...children].map((char, i) => (
          <span className="roll__c" key={i} data-c={char} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
    </>
  );
}
