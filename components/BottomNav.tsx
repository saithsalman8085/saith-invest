"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  { label: "Plans", href: "/plans", icon: "plans" },
  { label: "Invite", href: "/invite", icon: "invite" },
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Wallet", href: "/deposit", icon: "wallet" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

function Icon({ type, active }: { type: string; active: boolean }) {
  const common =
    "h-5 w-5 transition-transform duration-200";

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
        <path
          d="M16 4v16"
          stroke="currentColor"
          strokeWidth="1.4"
        />
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
        <circle
          cx="15"
          cy="13"
          r="1"
          fill="currentColor"
        />
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
        <div className="relative overflow-visible rounded-2xl border border-yellow-200 bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">

          {/* Top light */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent" />

          <div className="grid grid-cols-5 items-end">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/deposit" &&
                  (pathname === "/deposit" ||
                    pathname === "/withdraw"));

              const isDashboard = item.href === "/dashboard";
              const isClicked = clicked === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleClick(item.href)}
                  className="group relative flex min-h-[58px] flex-col items-center justify-end"
                >
                  {/* Click ripple */}
                  {isClicked && (
                    <span className="pointer-events-none absolute inset-2 animate-ping rounded-2xl bg-yellow-400/10" />
                  )}

                  {isDashboard ? (
                    <div
                      className={`absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200 ${
                        active
                          ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_0_25px_rgba(250,204,21,0.45)]"
                          : "border-yellow-200 bg-white text-gray-500 shadow-lg"
                      } ${
                        isClicked
                          ? "scale-75 rotate-12"
                          : "scale-100"
                      }`}
                    >
                      <div
                        className={
                          isClicked
                            ? "animate-bounce"
                            : ""
                        }
                      >
                        <Icon
                          type={item.icon}
                          active={active}
                        />
                      </div>

                      {isClicked && (
                        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-yellow-400/60" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={`relative flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-yellow-100 text-yellow-600"
                          : "text-gray-400"
                      } ${
                        isClicked
                          ? "scale-75 -translate-y-1 rotate-6"
                          : "scale-100"
                      }`}
                    >
                      <Icon
                        type={item.icon}
                        active={active}
                      />

                      {isClicked && (
                        <span className="pointer-events-none absolute inset-0 animate-ping rounded-xl border border-yellow-400/50" />
                      )}
                    </div>
                  )}

                  <span
                    className={`mt-1 text-[10px] font-medium transition-all duration-200 ${
                      active
                        ? "text-yellow-600"
                        : "text-gray-500"
                    } ${
                      isClicked
                        ? "scale-110 text-yellow-500"
                        : ""
                    }`}
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