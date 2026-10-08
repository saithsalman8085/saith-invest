
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type UserProfile = {
  publicUserId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  referralCode: string;
  role: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load profile.");
          return;
        }

        setUser(data.user);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-black">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-yellow-400" />

          <p className="mt-4 text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-yellow-500 sm:text-2xl"
          >
            ClaudeInvest
          </Link>

          <MainNav />
        </div>
      </header>

      <section className="px-2.5 py-4 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-5xl">

          {/* Page Intro */}
          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-yellow-700 sm:px-3 sm:py-1.5 sm:text-[10px]">
              Account Center
            </div>

            <h1 className="mt-2.5 text-2xl font-bold sm:mt-4 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-1 text-[10px] text-gray-500 sm:mt-2 sm:text-sm">
              Manage your account and access important account options.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-50 p-3 text-center text-xs text-red-600 sm:mt-6 sm:rounded-2xl sm:p-4 sm:text-sm">
              {error}
            </div>
          )}

          {/* Profile Hero */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:mt-7 sm:rounded-3xl">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-yellow-400/20 via-yellow-300/10 to-transparent sm:h-24" />

            <div className="relative p-3.5 sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-lg font-bold text-black shadow-[0_0_30px_rgba(250,204,21,0.15)] sm:h-20 sm:w-20 sm:rounded-2xl sm:text-3xl">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold sm:text-2xl">
                      {user?.fullName || "User"}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-semibold text-emerald-600 sm:px-2.5 sm:py-1 sm:text-[10px]">
                        Active Account
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] font-semibold text-gray-600 sm:px-2.5 sm:py-1 sm:text-[10px]">
                        {user?.role || "USER"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* USER ID — KEEP */}
                <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
                  <p className="text-[8px] uppercase tracking-wider text-gray-500 sm:text-[10px]">
                    User ID
                  </p>

                  <p className="mt-0.5 font-mono text-xs font-semibold text-yellow-600 sm:mt-1 sm:text-sm">
                    {user?.publicUserId || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <section className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3.5 sm:mt-4 sm:rounded-3xl sm:p-7">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-600 sm:text-[10px]">
                Personal Details
              </p>

              <h2 className="mt-0.5 text-base font-bold sm:mt-1 sm:text-xl">
                Account Information
              </h2>
            </div>

            <div className="mt-3 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
              <InfoCard
                label="Full Name"
                value={user?.fullName || "Not provided"}
              />

              <InfoCard
                label="Email Address"
                value={user?.email || "Not provided"}
              />

              <InfoCard
                label="Phone Number"
                value={user?.phone || "Not provided"}
              />

              <InfoCard
                label="Referral Code"
                value={user?.referralCode || "—"}
                highlight
              />
            </div>
          </section>

          {/* Account Options */}
          <section className="mt-4 sm:mt-5">
            <div className="mb-2.5 sm:mb-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-600 sm:text-[10px]">
                Account Tools
              </p>

              <h2 className="mt-0.5 text-base font-bold sm:mt-1 sm:text-xl">
                Important Options
              </h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              <OptionCard
                href="/withdraw"
                icon="wallet"
                title="Withdrawal & KYC"
                description="Manage withdrawal details and verification."
              />

              <OptionCard
                href="/invite"
                icon="users"
                title="Referral Network"
                description="View your referral information and network."
              />

              <OptionCard
                href="/dashboard"
                icon="activity"
                title="Account Activity"
                description="View your dashboard and account overview."
              />

              <OptionCard
                href="/deposit"
                icon="card"
                title="Wallet & Deposits"
                description="Add funds and review wallet actions."
              />

              <OptionCard
                href="/plans"
                icon="chart"
                title="Investment Plans"
                description="Explore available investment plans."
              />

              <OptionCard
                href="/login"
                icon="support"
                title="Support"
                description="Contact the platform administrator for help."
              />
            </div>
          </section>

          {/* Logout */}
          <div className="mt-5 text-center sm:mt-7">
            <Link
              href="/login"
              className="inline-flex rounded-lg border border-red-500/30 px-4 py-2 text-[10px] font-semibold text-red-500 transition hover:border-red-500/50 hover:bg-red-50 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-xs"
            >
              Logout
            </Link>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-[9px] text-gray-400 sm:py-6 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:rounded-2xl sm:p-4">
      <p className="text-[8px] uppercase tracking-wider text-gray-500 sm:text-[10px]">
        {label}
      </p>

      <p
        className={`mt-1.5 truncate text-xs font-semibold sm:mt-2 sm:text-sm ${
          highlight
            ? "font-mono text-yellow-600"
            : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function OptionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-gray-50 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-yellow-400 hover:bg-yellow-50 sm:rounded-2xl sm:p-4"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-yellow-600 transition group-hover:bg-yellow-100 sm:h-10 sm:w-10 sm:rounded-xl">
          {icon === "wallet" && "◈"}
          {icon === "users" && "♧"}
          {icon === "activity" && "⌁"}
          {icon === "card" && "▣"}
          {icon === "chart" && "↗"}
          {icon === "support" && "?"}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold sm:text-sm">
            {title}
          </h3>

          <p className="mt-0.5 text-[9px] leading-4 text-gray-500 sm:mt-1 sm:text-[11px] sm:leading-5">
            {description}
          </p>
        </div>

        <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-yellow-600">
          →
        </span>
      </div>
    </Link>
  );
}