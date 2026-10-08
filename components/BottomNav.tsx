"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { label: "Plans", href: "/plans", icon: "plans", color: "blue" },
  { label: "Invite", href: "/invite", icon: "invite", color: "purple" },
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", color: "yellow" },
  { label: "Wallet", href: "/deposit", icon: "wallet", color: "emerald" },
  { label: "Profile", href: "/profile", icon: "profile", color: "pink" },
];

function Icon({ type }: { type: string; active: boolean }) {
  const common = "h-5 w-5 transition-all duration-200";

  if (type === "plans") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M5 6a2 2 0 0 1 2-2h12v16H7a2 2 0 0 1-2-2V6Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 8h7M8 11h7M8 14h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M16 4v16" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (type === "invite") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <circle
          cx="9"
          cy="8"
          r="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M3.5 19a5.5 5.5 0 0 1 11 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="18"
          cy="15"
          r="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M18 13.5v3M16.5 15h3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect
          x="4"
          y="4"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="14"
          y="4"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="4"
          y="14"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="14"
          y="14"
          width="6"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (type === "wallet") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common}>
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 8h16M15 13h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common}>
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [clicked, setClicked] = useState<string | null>(null);

  const handleClick = (href: string) => {
    setClicked(href);

    window.setTimeout(() => {
      setClicked(null);
    }, 350);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:hidden">
      <div className="mx-auto max-w-md">
        <div className="relative overflow-visible rounded-3xl border border-yellow-200/60 bg-yellow-50/40 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">

          {/* Colorful top glow */}
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-0 h-1 overflow-hidden rounded-full">
            <div className="h-full w-full bg-gradient-to-r from-blue-400 via-purple-400 via-yellow-400 via-emerald-400 to-pink-400 opacity-90" />
          </div>

          {/* Soft bottom glow */}
          <div className="pointer-events-none absolute -bottom-2 left-[10%] right-[10%] h-5 rounded-full bg-gradient-to-r from-blue-400/10 via-purple-400/10 via-yellow-400/10 via-emerald-400/10 to-pink-400/10 blur-xl" />

          <div className="grid grid-cols-5 items-end">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/deposit" &&
                  (pathname === "/deposit" ||
                    pathname === "/withdraw"));

              const isDashboard = item.href === "/dashboard";
              const isClicked = clicked === item.href;

              const activeColors = {
                blue: "bg-blue-50 text-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.18)]",
                purple:
                  "bg-purple-50 text-purple-600 shadow-[0_4px_16px_rgba(168,85,247,0.18)]",
                yellow:
                  "border-yellow-200 text-yellow-600 shadow-[0_4px_16px_rgba(234,179,8,0.18)]",
                emerald:
                  "bg-emerald-50 text-emerald-600 shadow-[0_4px_16px_rgba(16,185,129,0.18)]",
                pink:
                  "bg-pink-50 text-pink-600 shadow-[0_4px_16px_rgba(236,72,153,0.18)]",
              };

              const inactiveColors = {
                blue: "text-blue-400",
                purple: "text-purple-400",
                yellow: "text-yellow-500",
                emerald: "text-emerald-400",
                pink: "text-pink-400",
              };

              const labelColors = {
                blue: "text-blue-600",
                purple: "text-purple-600",
                yellow: "text-yellow-600",
                emerald: "text-emerald-600",
                pink: "text-pink-600",
              };

              const clickColors = {
                blue: "border-blue-400/50 bg-blue-400/10",
                purple: "border-purple-400/50 bg-purple-400/10",
                yellow: "border-yellow-400/50 bg-yellow-400/10",
                emerald: "border-emerald-400/50 bg-emerald-400/10",
                pink: "border-pink-400/50 bg-pink-400/10",
              };

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleClick(item.href)}
                  className="group relative flex min-h-[60px] flex-col items-center justify-end"
                >
                  {isClicked && (
                    <span
                      className={`pointer-events-none absolute inset-2 animate-ping rounded-2xl border ${
                        clickColors[
                          item.color as keyof typeof clickColors
                        ]
                      }`}
                    />
                  )}

                  {isDashboard ? (
                    <div
                      className={`absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 text-black shadow-[0_0_28px_rgba(250,204,21,0.55)]"
                          : "bg-gradient-to-br from-gray-100 to-white text-gray-500 shadow-[0_8px_20px_rgba(0,0,0,0.16)]"
                      } ${
                        isClicked
                          ? "scale-75 rotate-12"
                          : "scale-100 group-hover:scale-105"
                      }`}
                    >
                      <div className={isClicked ? "animate-bounce" : ""}>
                        <Icon type={item.icon} active={active} />
                      </div>

                      {active && (
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-yellow-300/20 blur-md" />
                      )}

                      {isClicked && (
                        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-yellow-400/70" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={`relative flex h-9 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                        active
                          ? activeColors[
                              item.color as keyof typeof activeColors
                            ]
                          : inactiveColors[
                              item.color as keyof typeof inactiveColors
                            ]
                      } ${
                        isClicked
                          ? "scale-75 -translate-y-1 rotate-6"
                          : "scale-100 group-hover:-translate-y-0.5"
                      }`}
                    >
                      <Icon type={item.icon} active={active} />

                      {active && (
                        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-current opacity-[0.06]" />
                      )}

                      {isClicked && (
                        <span
                          className={`pointer-events-none absolute inset-0 animate-ping rounded-2xl border ${
                            clickColors[
                              item.color as keyof typeof clickColors
                            ]
                          }`}
                        />
                      )}
                    </div>
                  )}

                  <span
                    className={`mt-1 text-[10px] font-semibold transition-all duration-200 ${
                      active
                        ? labelColors[
                            item.color as keyof typeof labelColors
                          ]
                        : "text-gray-400"
                    } ${isClicked ? "scale-110" : ""}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}