/** The button arrow: two copies, the first leaves up-right as the second comes in (button.css). */
export function ArrowIcon() {
  return (
    <span className="btn__icon" aria-hidden="true">
      <svg className="arrow arrow--a" viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
      <svg className="arrow arrow--b" viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
    </span>
  );
}
