"use client";
/*
 * The first screen's table and the robot's answers (RobotHero): the robot's scene keeps the time (three/ai-robot,
 * BotScene) and tells this through botStage: the round starting (the rows empty into dashed slots), which row a card
 * goes into, the answer to show by its mouth, a card recorded (its row fills, the status lights). Until the scene
 * starts (no WebGL, reduced motion: never) nothing changes: the server's still stays, every request booked.
 */
import { useEffect, useRef } from "react";
import { botStage } from "@/components/three/ai-robot/stage";

export function BotStory({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = box.current;
    const room = stage?.closest<HTMLElement>(".ai-bot__in");
    if (!stage || !room) return;
    const rows = [...stage.querySelectorAll<HTMLElement>("[data-row]")];
    const head = room.querySelector<HTMLElement>(".ai-bot__head");
    const bubble = room.querySelector<HTMLElement>("[data-say]");
    if (!rows.length || !head || !bubble) return;
    let timers: number[] = [];

    // the round over: the booked rows fade before they empty into slots (cut at once, it read as the seam of the
    // phone's looped film: the owner, 6 Nov 2026); the first round empties the server's still at once
    const CLEAR = 450;
    botStage.reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      stage.classList.add("is-playing");
      bubble.classList.remove("is-on");
      const booked = rows.filter((row) => row.classList.contains("is-on"));
      booked.forEach((row) => row.classList.add("is-clearing"));
      const empty = () =>
        rows.forEach((row) => {
          row.classList.remove("is-on", "is-done", "is-clearing");
          row.querySelectorAll<HTMLElement>("td").forEach((cell) => ((cell.querySelector<HTMLElement>(".bot-crm__state") ?? cell).textContent = ""));
        });
      if (booked.length) timers.push(window.setTimeout(empty, CLEAR));
      else empty();
    };
    botStage.rowFor = (index) => rows[index] ?? null;
    botStage.say = (index, under = false) => {
      const reply = index === null ? "" : (rows[index]?.dataset.reply ?? "");
      if (!reply) {
        bubble.classList.remove("is-on");
        return;
      }
      // under the head's screen, by its mouth, kept inside the room; with the card held under the head's left (a phone)
      // toward the head's right
      // (placed in its positioned ancestor, the first screen; kept within the room's width)
      const holder = (bubble.offsetParent as HTMLElement | null) ?? room;
      const base = holder.getBoundingClientRect();
      const bounds = room.getBoundingClientRect();
      const face = head.getBoundingClientRect();
      bubble.textContent = reply;
      const width = bubble.offsetWidth;
      const anchor = under ? 0.2 : 0.62;
      const left = Math.max(bounds.left - base.left + 4, Math.min(bounds.right - base.left - width - 4, face.left - base.left + face.width * 0.5 - width * anchor));
      bubble.style.setProperty("--tail", `${Math.round(anchor * 100)}%`);
      bubble.style.transform = `translate(${left}px, ${face.top - base.top + face.height * 0.84}px)`;
      bubble.classList.add("is-on");
    };
    botStage.insert = (index) => {
      const row = rows[index];
      if (!row) return;
      row.classList.add("is-on");
      const cells = [...row.querySelectorAll<HTMLElement>("td")];
      cells.forEach((cell, cellIndex) => {
        const node = cell.querySelector<HTMLElement>(".bot-crm__state") ?? cell;
        timers.push(window.setTimeout(() => (node.textContent = cell.dataset.text ?? ""), 60 + cellIndex * 110));
      });
      timers.push(window.setTimeout(() => row.classList.add("is-done"), 60 + cells.length * 110));
    };
    return () => {
      timers.forEach(clearTimeout);
      botStage.rowFor = () => null;
      botStage.say = () => {};
      botStage.insert = () => {};
      botStage.reset = () => {};
    };
  }, []);

  return (
    <div ref={box} className="bot-stage" aria-hidden="true">
      {children}
    </div>
  );
}
