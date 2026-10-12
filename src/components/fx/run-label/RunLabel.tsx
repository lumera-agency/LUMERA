import "./run-label.css";

/** The label's markup for useRunLabel: the text for screen readers, two copies on a track for the eye. */
export function RunLabel({ children }: { children: string }) {
  return (
    <span className="run-label">
      <span className="visually-hidden">{children}</span>
      <span className="run-label__track" aria-hidden="true">
        <span>{children}</span>
        <span>{children}</span>
      </span>
    </span>
  );
}
