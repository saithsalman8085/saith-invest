
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Plans", href: "/plans" },
  { label: "Invite", href: "/invite" },
  { label: "Wallet", href: "/deposit" },
  { label: "Profile", href: "/profile" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5 backdrop-blur-xl">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === "/deposit" &&
              (pathname === "/deposit" ||
                pathname === "/withdraw"));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-cyan-400/10 text-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {link.label}

              {active && (
                <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}