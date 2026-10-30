"use client";
import { useRef, useState } from "react";

/**
 * The three businesses on a computer, behind a sliding switch (after 21st.dev's Slide Tabs; the owner's pick, 30 Oct
 * 2026): the reader picks their own, one panel shows. Phones have the ivory cards (Niches).
 */
export function NicheTabs({ tabs, panels, label }: { tabs: string[]; panels: React.ReactNode[]; label: string }) {
  const [on, setOn] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const move = (i: number) => {
    setOn(i);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[i]?.focus();
  };
  return (
    <div className="ai-nt ai-wide">
      <div
        className="ai-nt__tabs"
        ref={list}
        role="tablist"
        aria-label={label}
        style={{ "--i": on } as React.CSSProperties}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move((on + 1) % tabs.length);
          if (e.key === "ArrowLeft") move((on - 1 + tabs.length) % tabs.length);
        }}
      >
        <span className="ai-nt__thumb" aria-hidden="true" />
        {tabs.map((tab, i) => (
          <button className={`ai-nt__tab${i === on ? " is-on" : ""}`} type="button" role="tab" id={`nt-t${i}`} aria-selected={i === on} aria-controls={`nt-p${i}`} tabIndex={i === on ? 0 : -1} onClick={() => setOn(i)} key={tab}>{tab}</button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div className="ai-nt__panel" role="tabpanel" id={`nt-p${i}`} aria-labelledby={`nt-t${i}`} hidden={i !== on} key={i}>{panel}</div>
      ))}
    </div>
  );
}
