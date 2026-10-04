"use client";

import { useEffect, useState } from "react";

const MESSENGER_LINK = "https://www.facebook.com/share/1MQySnw6AS/?mibextid=wwXIfr";

const DEFAULT_POSITION = {
  right: 18,
  bottom: 90,
};

export default function CustomerSupport() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("customer-support-position");

    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch {
        // Ignore invalid saved position
      }
    }
  }, []);

  function savePosition(nextPosition: typeof DEFAULT_POSITION) {
    setPosition(nextPosition);
    localStorage.setItem(
      "customer-support-position",
      JSON.stringify(nextPosition)
    );
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();

    setDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;

    const startRight = position.right;
    const startBottom = position.bottom;

    const handleMove = (event: PointerEvent) => {
      const newRight = startRight - (event.clientX - startX);
      const newBottom = startBottom - (event.clientY - startY);

      const maxRight = window.innerWidth - 65;
      const maxBottom = window.innerHeight - 65;

      savePosition({
        right: Math.max(8, Math.min(newRight, maxRight)),
        bottom: Math.max(80, Math.min(newBottom, maxBottom)),
      });
    };

    const handleUp = () => {
      setDragging(false);

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  function openMessenger() {
    if (!dragging) {
      window.open(MESSENGER_LINK, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      aria-label="Customer Support"
      onClick={openMessenger}
      onPointerDown={handlePointerDown}
      style={{
        right: `${position.right}px`,
        bottom: `${position.bottom}px`,
      }}
      className="fixed z-[60] flex h-10 w-10 touch-none items-center justify-center rounded-full bg-[#0084ff] text-white shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95"
    >
      <svg
  width="23"
  height="23"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
  {/* Headset */}
  <path d="M4 13a8 8 0 0 1 16 0" />

  <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H4Z" />
  <path d="M20 13v3a2 2 0 0 1-2 2h-1v-5h3Z" />

  {/* Chat bubble */}
  <path d="M8.5 18.5c.8 1.1 2.1 1.7 3.5 1.7 1.2 0 2.3-.4 3.1-1.1" />

  {/* Sparkle */}
  <path d="M18.2 4.2v2.4" />
  <path d="M17 5.4h2.4" />

  {/* Small dot */}
  <circle cx="12" cy="15" r="0.8" fill="currentColor" stroke="none" />
</svg>
    </button>
  );
}