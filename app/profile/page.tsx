
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
  const [copied, setCopied] = useState("");

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

  async function copyValue(value: string, type: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Unable to copy. Please copy it manually.");
    }
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf9] text-black">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-yellow-100 border-t-yellow-400" />
          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] pb-24 text-black">
      <header className="border-b border-yellow-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-yellow-500 sm:text-2xl"
          >
            ClaudeInvest
          </Link>
          <MainNav />
        </div>
      </header>

      <section className="px-3 py-6 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-5xl">
          {/* Profile Heading */}
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-yellow-200 bg-white px-5 py-7 text-center shadow-[0_8px_30px_rgba(234,179,8,0.07)] sm:mb-8 sm:py-10">
            <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-yellow-100/60 blur-2xl" />
            <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-orange-100/50 blur-2xl" />

            <div className="relative">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-700 sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Account Center
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                My <span className="text-yellow-500">Profile</span>
              </h1>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500 sm:text-sm">
                Your personal account details and account management.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Profile Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-yellow-200 bg-white shadow-[0_10px_35px_rgba(234,179,8,0.09)]">
            <div className="h-24 bg-gradient-to-r from-yellow-300 via-yellow-100 to-orange-100 sm:h-32" />

            <div className="relative px-4 pb-5 sm:px-7 sm:pb-7">
              <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-3 sm:gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-yellow-400 text-3xl font-extrabold text-black shadow-lg sm:h-24 sm:w-24 sm:text-4xl">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0 pb-1">
                    <h2 className="truncate text-xl font-extrabold sm:text-2xl">
                      {user?.fullName || "User"}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                      {user?.email || "Account Holder"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:pb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Account
                  </span>

                  <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-[10px] font-bold uppercase text-yellow-700">
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Your User ID
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-sm font-bold text-yellow-800">
                      {user?.publicUserId || "—"}
                    </p>
                    <button
                      onClick={() =>
                        copyValue(user?.publicUserId || "", "user")
                      }
                      className="shrink-0 rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-[10px] font-bold text-yellow-700 transition hover:bg-yellow-100"
                    >
                      {copied === "user" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-[#fffdf9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Member Since
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-800">
                    {joinedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <section className="mt-5 rounded-3xl border border-yellow-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-lg text-yellow-700">
                ◈
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-600">
                  Personal Details
                </p>
                <h2 className="text-lg font-extrabold sm:text-xl">
                  Account Information
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Full Name" value={user?.fullName || "Not provided"} />
              <InfoCard label="Email Address" value={user?.email || "Not provided"} />
              <InfoCard label="Phone Number" value={user?.phone || "Not provided"} />

              <div className="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                  Referral Code
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-sm font-bold text-yellow-800">
                    {user?.referralCode || "—"}
                  </p>
                  <button
                    onClick={() =>
                      copyValue(user?.referralCode || "", "referral")
                    }
                    className="shrink-0 rounded-lg border border-yellow-300 bg-white px-3 py-1.5 text-[10px] font-bold text-yellow-700 transition hover:bg-yellow-100"
                  >
                    {copied === "referral" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Account Options */}
          <section className="mt-6">
            <div className="mb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-600">
                Account Tools
              </p>
              <h2 className="mt-1 text-lg font-extrabold sm:text-xl">
                Important Options
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Quick access to your account features.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard href="/withdraw" icon="◈" title="Withdrawal & KYC" description="Manage withdrawal details and verification." />
              <OptionCard href="/invite" icon="♧" title="Referral Network" description="View your referral information and network." />
              <OptionCard href="/dashboard" icon="⌁" title="Account Activity" description="View your dashboard and account overview." />
              <OptionCard href="/deposit" icon="▣" title="Wallet & Deposits" description="Add funds and review wallet actions." />
              <OptionCard href="/plans" icon="↗" title="Investment Plans" description="Explore available investment plans." />
              <OptionCard href="/login" icon="?" title="Support" description="Contact the platform administrator for help." />
            </div>
          </section>

          {/* Logout */}
          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-2.5 text-xs font-bold text-red-500 transition hover:border-red-300 hover:bg-red-50"
            >
              <span>↪</span>
              Logout
            </Link>
          </div>

          <div className="py-6 text-center text-[10px] text-gray-400">
            ClaudeInvest © 2026
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-100 bg-[#fffdf9] p-4 transition hover:border-yellow-300 hover:bg-yellow-50/50">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-gray-800">
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
      className="group rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-50/50 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-200 bg-yellow-50 text-lg font-bold text-yellow-700 transition group-hover:bg-yellow-400 group-hover:text-black">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-[10px] leading-5 text-gray-500 sm:text-xs">
            {description}
          </p>
        </div>

        <span className="text-lg text-gray-400 transition group-hover:translate-x-1 group-hover:text-yellow-600">
          →
        </span>
      </div>
    </Link>
  );
}
