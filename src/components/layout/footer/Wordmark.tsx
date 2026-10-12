/** LUMERA at the very end of the page (the liquid-chrome canvas comes in the next step). */
export function Wordmark() {
  return (
    <div className="container footer__mark" data-wordmark aria-hidden="true">
      <span className="footer__mark-text">LUMERA</span>
      <canvas className="footer__mark-canvas" />
      <span className="footer__drop" data-slot="drop" />
    </div>
  );
}
