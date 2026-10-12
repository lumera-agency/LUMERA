import "./roll-text.css";

/**
 * RollText — on hover of the nearest link/button, each letter rolls up out of sight and its copy
 * rolls in from below, one letter after another (CSS only: an ancestor with .roll-host triggers it).
 * Screen readers get the text whole; the rolling letters are hidden from them.
 */
export function RollText({ children }: { children: string }) {
  return (
    <>
      <span className="visually-hidden">{children}</span>
      <span className="roll" aria-hidden="true">
        {[...children].map((char, i) => (
          <span className="roll__c" key={i} style={{ "--i": i } as React.CSSProperties}>
            <span>{char}</span>
            <span>{char}</span>
          </span>
        ))}
      </span>
    </>
  );
}
