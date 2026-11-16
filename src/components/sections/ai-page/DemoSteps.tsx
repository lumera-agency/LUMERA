import { part } from "./demo-beats";

const TICK = <path d="m5 12.5 4.2 4.2L19 7" />;

/** The three steps over a task's window (demo-window.css): each lit through its span of beats, ticked after it. */
export function DemoSteps({ steps, hold }: { steps: readonly { text: string; span: readonly [number, number] }[]; hold: number }) {
  return (
    <div className="sd__bar" aria-hidden="true">
      <ol className="sd__steps">
        {steps.map((step, i) => (
          <li {...part("sd__step", { step: step.span }, hold)} key={step.text}>
            <i>
              <span className="sd__n">{i + 1}</span>
              <svg viewBox="0 0 24 24">{TICK}</svg>
            </i>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
