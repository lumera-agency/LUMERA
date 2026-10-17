/*
 * (copied from ../clinic/stage.ts; the event is «sh:in») The shop sample's entrances: each block ([data-sec]) plays once, the first time it comes into the frame (an
 * IntersectionObserver whose root is the frame's viewport, .pv-vp) and only once the frame itself has been seen on the
 * page (≥ 15 % of it on screen, the tab visible). A block that comes in gets [data-in] (its CSS transitions run: transform
 * and opacity; an attribute, so a React re-render of the block never takes it away) and a «sh:in» event its components listen to (the cards, the scripted demos). Nothing runs at rest.
 * Not armed (reduced motion, or the same page drawn again for 3D / the second language): every block is in at once and
 * the events say so (animate: false), so the components show their final frame.
 */
export type InDetail = { animate: boolean; delay: number };

export class Stage {
  private io: IntersectionObserver | null = null;
  private vio: IntersectionObserver | null = null;
  private seen = false;
  private pending = new Set<Element>();
  private onVis = () => {
    if (document.visibilityState === "visible" && !this.seen && this.vio) {
      this.vio.unobserve(this.vp);
      this.vio.observe(this.vp);
    }
  };

  constructor(
    private root: HTMLElement,
    private vp: Element,
    private armed: boolean,
    private held: boolean,
  ) {}

  start() {
    const secs = [...this.root.querySelectorAll("[data-sec]")];
    if (!this.armed) {
      secs.forEach((s) => this.fire(s, false, 0));
      return;
    }
    this.io = new IntersectionObserver(
      (es) => {
        for (const x of es) {
          if (!x.isIntersecting) continue;
          this.io?.unobserve(x.target);
          this.pending.add(x.target);
        }
        this.flush();
      },
      { root: this.vp, threshold: 0, rootMargin: "0px 0px -28px 0px" },
    );
    secs.forEach((s) => this.io?.observe(s));
    this.vio = new IntersectionObserver(
      (es) => {
        const e = es[es.length - 1];
        if (e.intersectionRatio >= 0.15 && document.visibilityState === "visible" && !this.seen) {
          this.seen = true;
          this.flush();
        }
      },
      { threshold: [0, 0.15] },
    );
    this.vio.observe(this.vp);
    document.addEventListener("visibilitychange", this.onVis);
  }

  release() {
    this.held = false;
    this.flush();
  }

  private flush() {
    if (!this.seen || this.held) return;
    let i = 0;
    for (const s of this.pending) this.fire(s, true, i++ * 80);
    this.pending.clear();
  }

  private fire(s: Element, animate: boolean, delay: number) {
    if (s.hasAttribute("data-in")) return;
    (s as HTMLElement).style.setProperty("--d0", `${delay}ms`);
    // (an attribute React never renders: a re-render of the block keeps it)
    s.setAttribute("data-in", "");
    s.dispatchEvent(new CustomEvent<InDetail>("sh:in", { detail: { animate, delay } }));
  }

  destroy() {
    this.io?.disconnect();
    this.vio?.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.pending.clear();
  }
}
