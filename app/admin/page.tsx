
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalUsers: number;
  activePlans: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activePlans: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load admin dashboard.");
          return;
        }

        setStats(data.stats);
      } catch {
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <Link
              href="/"
              className="text-2xl font-bold text-cyan-400"
            >
              ClaudeInvest
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              ADMIN PANEL
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">

          {/* Intro */}
          <div className="mb-8">
            <p className="text-sm text-cyan-400">
              Administrator
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Manage users, payments, plans and platform activity.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Users"
              value={loading ? "..." : String(stats.totalUsers)}
            />

            <StatCard
              label="Active Plans"
              value={loading ? "..." : String(stats.activePlans)}
              accent="cyan"
            />

            <StatCard
              label="Pending Deposits"
              value={loading ? "..." : String(stats.pendingDeposits)}
              accent="yellow"
            />

            <StatCard
              label="Pending Withdrawals"
              value={loading ? "..." : String(stats.pendingWithdrawals)}
              accent="orange"
            />
          </div>

          {/* Management */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">
              Management
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AdminCard
                href="/admin/users"
                icon="👥"
                title="Users"
                text="View, search and manage registered users."
              />

              <AdminCard
                href="/admin/deposits"
                icon="💳"
                title="Deposits"
                text="Review and manage pending deposit requests."
              />

              <AdminCard
                href="/admin/withdrawals"
                icon="💰"
                title="Withdrawals"
                text="Review withdrawal requests and payouts."
              />

              <AdminCard
                href="/admin/plans"
                icon="📊"
                title="Investment Plans"
                text="Create, edit, publish and manage investment plans."
              />

              <AdminCard
                href="/admin/kyc"
                icon="🪪"
                title="KYC"
                text="Review withdrawal verification information."
              />

              <AdminCard
                href="/admin/transactions"
                icon="↯"
                title="Transactions"
                text="Review the platform transaction ledger."
              />
            </div>
          </div>

          {/* Platform Controls */}
          <div className="mt-8">
            <h2 className="text-xl font-bold">
              Platform Controls
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AdminCard
                href="/admin/referrals"
                icon="♧"
                title="Referral Settings"
                text="Manage referral levels and commission settings."
              />

              <AdminCard
                href="/admin/rewards"
                icon="🏆"
                title="Active User Rewards"
                text="Manage active-user reward rules."
              />

              <AdminCard
                href="/admin/settings"
                icon="⚙"
                title="Platform Settings"
                text="Manage exchange rate, fees and platform settings."
              />

              <AdminCard
                href="/admin/audit-logs"
                icon="🔐"
                title="Audit Logs"
                text="Review important administrative actions."
              />
            </div>
          </div>

          {/* Security */}
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Security
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Administrator Access
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Administrative API requests verify the logged-in account
                  and require the ADMIN role before returning protected data.
                </p>
              </div>

              <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                Protected
              </span>
            </div>
          </section>

          {/* Footer */}
          <div className="py-8 text-center text-xs text-slate-600">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "cyan" | "yellow" | "orange";
}) {
  const valueClass =
    accent === "cyan"
      ? "text-cyan-400"
      : accent === "yellow"
        ? "text-yellow-400"
        : accent === "orange"
          ? "text-orange-400"
          : "text-white";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function AdminCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition duration-200 hover:border-cyan-500/40 hover:bg-slate-900/80"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-xl transition group-hover:scale-105">
        {icon}
      </div>

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      <p className="mt-4 text-xs font-semibold text-cyan-400">
        Open →
      </p>
    </Link>
  );
}