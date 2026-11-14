
"use client";

import Link from "next/link";
import Image from "next/image";
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

const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029Vb9LHaaIyPtJNWokxd2o";

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
      {/* Header */}
      <header className="border-b border-yellow-200 bg-white/95 backdrop-blur-xl">
        <div className="relative mx-auto grid max-w-6xl grid-cols-3 items-center px-3 py-2.5 sm:px-5 sm:py-3">
          <div />

          <Link
            href="/"
            className="flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Image
              src="/cloudeinvest-logo.svg"
              alt="cloudeinvest logo"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-extrabold tracking-tight text-yellow-600 sm:text-xl">
              cloudeinvest
            </span>
          </Link>

          <div className="flex justify-end">
            <MainNav />
          </div>
        </div>
      </header>

      <section className="px-2.5 py-4 sm:px-5 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Profile Hero */}
          <div className="overflow-hidden rounded-2xl border border-yellow-300 bg-white shadow-[0_6px_24px_rgba(234,179,8,0.13)] sm:rounded-3xl">
            <div className="h-2 bg-linear-to-r from-yellow-400 via-amber-300 to-yellow-500" />

            <div className="bg-linear-to-b from-yellow-50 via-white to-white px-3.5 pb-4 pt-3.5 sm:px-7 sm:pb-6 sm:pt-5">
              <div className="mb-3 text-center sm:mb-5">
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                  My Profile
                </h1>
                <div className="mx-auto mt-1.5 h-1 w-12 rounded-full bg-yellow-400" />
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-yellow-300 bg-linear-to-br from-yellow-300 to-amber-400 text-xl font-extrabold text-black shadow-[0_4px_12px_rgba(234,179,8,0.25)] sm:h-20 sm:w-20 sm:text-3xl">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-extrabold text-gray-900 sm:text-2xl">
                    {user?.fullName || "User"}
                  </h2>

                  <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-sm">
                    {user?.email || "Account Holder"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[8px] font-bold text-emerald-600 sm:text-[10px]">
                      Active Account
                    </span>

                    <span className="rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-1 text-[8px] font-bold text-yellow-800 sm:text-[10px]">
                      {user?.role || "USER"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User ID and Register Date */}
              <div className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-xl border border-yellow-300 bg-linear-to-br from-yellow-50 to-amber-50 p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-yellow-700 sm:text-[10px]">
                    Your User ID
                  </p>

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs font-extrabold text-yellow-900 sm:text-sm">
                      {user?.publicUserId || "—"}
                    </p>

                    <button
                      onClick={() =>
                        copyValue(user?.publicUserId || "", "user")
                      }
                      className="shrink-0 rounded-lg border border-yellow-400 bg-white px-2.5 py-1 text-[9px] font-bold text-yellow-800 transition hover:bg-yellow-100 sm:px-3 sm:py-1.5 sm:text-[10px]"
                    >
                      {copied === "user" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-200 bg-white p-3 sm:rounded-2xl sm:p-4">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-yellow-700 sm:text-[10px]">
                    Register Date
                  </p>

                  <p className="mt-1.5 text-xs font-bold text-gray-800 sm:text-sm">
                    {joinedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <section className="mt-3 rounded-2xl border border-yellow-200 bg-white p-3.5 shadow-sm sm:mt-4 sm:rounded-3xl sm:p-7">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-base text-yellow-700 sm:h-10 sm:w-10 sm:rounded-xl sm:text-lg">
                ◈
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-600 sm:text-[10px]">
                  Personal Details
                </p>

                <h2 className="mt-0.5 text-base font-bold sm:text-xl">
                  Account Information
                </h2>
              </div>
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

              <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3 sm:rounded-2xl sm:p-4">
                <p className="text-[8px] font-bold uppercase tracking-wider text-gray-500 sm:text-[10px]">
                  Referral Code
                </p>

                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <p className="truncate font-mono text-xs font-bold text-yellow-800 sm:text-sm">
                    {user?.referralCode || "—"}
                  </p>

                  <button
                    onClick={() =>
                      copyValue(user?.referralCode || "", "referral")
                    }
                    className="shrink-0 rounded-lg border border-yellow-300 bg-white px-2.5 py-1 text-[9px] font-bold text-yellow-700 transition hover:bg-yellow-100 sm:px-3 sm:py-1.5 sm:text-[10px]"
                  >
                    {copied === "referral" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Account Options */}
          <section className="mt-4 sm:mt-5">
            <div className="mb-2.5 sm:mb-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-600 sm:text-[10px]">
                Account Tools
              </p>

              <h2 className="mt-0.5 text-base font-bold sm:text-xl">
                Important Options
              </h2>

              <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                Quick access to your account features.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {/* WhatsApp Channel */}
              <a
                href={WHATSAPP_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-green-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-400 hover:bg-green-50 hover:shadow-md sm:rounded-2xl sm:p-4"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 text-white transition group-hover:bg-green-600 sm:h-10 sm:w-10 sm:rounded-xl">
                    <svg
                      viewBox="0 0 32 32"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M16.02 3C8.86 3 3.04 8.8 3.04 15.94c0 2.29.6 4.53 1.74 6.52L3 29l6.73-1.76a13 13 0 0 0 6.28 1.6h.01c7.15 0 12.97-5.81 12.97-12.96A12.9 12.9 0 0 0 16.02 3Zm0 23.62h-.01a10.7 10.7 0 0 1-5.46-1.5l-.39-.23-4 .99 1.07-3.9-.25-.4a10.67 10.67 0 0 1-1.64-5.64c0-5.9 4.8-10.69 10.7-10.69 2.86 0 5.54 1.11 7.56 3.14a10.62 10.62 0 0 1 3.13 7.57c0 5.9-4.8 10.66-10.71 10.66Zm5.87-8c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.51-.16-.73.16-.21.32-.83 1.05-1.02 1.27-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.67 0 1.57 1.16 3.08 1.32 3.29.16.21 2.28 3.47 5.53 4.87.77.33 1.37.53 1.84.68.77.24 1.47.2 2.02.12.62-.1 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.14-.3-.22-.62-.38Z" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-gray-900 sm:text-sm">
                      WhatsApp Channel
                    </h3>
                    <p className="mt-0.5 text-[9px] leading-4 text-gray-500 sm:mt-1 sm:text-[11px] sm:leading-5">
                      Join our official channel for updates.
                    </p>
                  </div>

                  <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600">
                    →
                  </span>
                </div>
              </a>

              <OptionCard
                href="/withdraw"
                icon="💳"
                title="Withdrawal & KYC"
                description="Manage withdrawal details and verification."
                iconStyle="bg-blue-50 border-blue-200"
              />

              <OptionCard
                href="/invite"
                icon="👥"
                title="Referral Network"
                description="View your referral information and network."
                iconStyle="bg-purple-50 border-purple-200"
              />

              <OptionCard
                href="/dashboard"
                icon="📊"
                title="Account Activity"
                description="View your dashboard and account overview."
                iconStyle="bg-sky-50 border-sky-200"
              />

              <OptionCard
                href="/deposit"
                icon="💰"
                title="Wallet & Deposits"
                description="Add funds and review wallet actions."
                iconStyle="bg-emerald-50 border-emerald-200"
              />

              <OptionCard
                href="/plans"
                icon="📈"
                title="Investment Plans"
                description="Explore available investment plans."
                iconStyle="bg-amber-50 border-amber-200"
              />

              <OptionCard
                href="/login"
                icon="🎧"
                title="Support"
                description="Contact the platform administrator for help."
                iconStyle="bg-pink-50 border-pink-200"
              />
            </div>
          </section>

          {/* Logout */}
          <div className="mt-5 text-center sm:mt-7">
            <Link
              href="/login"
              className="inline-flex rounded-lg border border-red-200 bg-white px-4 py-2 text-[10px] font-semibold text-red-500 transition hover:border-red-300 hover:bg-red-50 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-xs"
            >
              Logout
            </Link>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-[9px] text-gray-400 sm:py-6 sm:text-xs">
            cloudeinvest © 2025
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
    <div className="rounded-xl border border-yellow-100 bg-[#fffdf9] p-3 transition hover:border-yellow-300 hover:bg-yellow-50/50 sm:rounded-2xl sm:p-4">
      <p className="text-[8px] font-medium uppercase tracking-wider text-gray-500 sm:text-[10px]">
        {label}
      </p>

      <p className="mt-1.5 wrap-break-word text-xs font-semibold text-gray-800 sm:mt-2 sm:text-sm">
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
  iconStyle,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  iconStyle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-yellow-100 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-yellow-400 hover:bg-yellow-50 hover:shadow-md sm:rounded-2xl sm:p-4"
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-lg transition sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl ${iconStyle}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-semibold sm:text-sm">{title}</h3>

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
