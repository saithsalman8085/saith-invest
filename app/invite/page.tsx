
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type ReferralData = {
  success: boolean;
  user: {
    referralCode: string;
  };
  stats: {
    totalInvites: number;
    activeUsers: number;
    referralEarnings: number;
    totalNetwork: number;
  };
  levels: {
    level1: number;
    level2: number;
    level3: number;
  };
};

export default function InvitePage() {
  const [copied, setCopied] = useState(false);

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReferralData() {
      try {
        const response = await fetch("/api/invite", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setData(result);
        }
      } catch (error) {
        console.error("REFERRAL_PAGE_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReferralData();
  }, []);

  const inviteCode = data?.user?.referralCode || "...";

  const inviteLink = data?.user?.referralCode
    ? `https://claude-invest-nine.vercel.app/register?ref=${data.user.referralCode}`
    : "...";

  const totalInvites = data?.stats?.totalInvites ?? 0;
  const activeUsers = data?.stats?.activeUsers ?? 0;
  const referralEarnings = data?.stats?.referralEarnings ?? 0;
  const totalNetwork = data?.stats?.totalNetwork ?? 0;

  const level1 = data?.levels?.level1 ?? 0;
  const level2 = data?.levels?.level2 ?? 0;
  const level3 = data?.levels?.level3 ?? 0;

  async function copyText(text: string) {
    if (!text || text === "...") return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black">
      <section className="px-2.5 py-3 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <header className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:mb-5 sm:rounded-2xl sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <Link
                  href="/"
                  className="text-base font-bold text-yellow-600 sm:text-xl"
                >
                  ClaudeInvest
                </Link>

                <p className="mt-1.5 text-[10px] text-yellow-600 sm:mt-2 sm:text-xs">
                  Invite & Earn
                </p>

                <h1 className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-2xl">
                  Invite Friends
                </h1>

                <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">
                  Build your referral network with your unique invite link.
                </p>
              </div>

              <MainNav />
            </div>
          </header>

          {/* Invite Hero */}
          <div className="rounded-xl border border-yellow-300 bg-gradient-to-br from-yellow-50 via-white to-slate-50 p-3 sm:rounded-2xl sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-yellow-800 sm:px-3 sm:text-[10px]">
                  Your Referral Network
                </span>

                <h2 className="mt-2 text-lg font-bold sm:mt-3 sm:text-3xl">
                  Invite people using your unique code.
                </h2>

                <p className="mt-1.5 text-[10px] leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-5">
                  Share your invite link and track your referral activity
                  from one place.
                </p>
              </div>

              <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:rounded-xl sm:p-4">
                <p className="text-center text-[9px] text-slate-500 sm:text-[11px]">
                  Your Invite Code
                </p>

                <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <div className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 sm:rounded-lg sm:px-3 sm:py-2.5">
                    <p className="truncate text-center text-[11px] font-bold tracking-wider text-yellow-700 sm:text-sm">
                      {loading ? "Loading..." : inviteCode}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyText(inviteCode)}
                    disabled={loading || inviteCode === "..."}
                    className="rounded-md bg-yellow-400 px-2.5 py-2 text-[10px] font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Link */}
          <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:mt-3 sm:rounded-xl sm:p-5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-slate-600 sm:text-xs">
                  Your Invite Link
                </p>

                <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 sm:mt-2 sm:rounded-lg sm:px-3 sm:py-2.5">
                  <p className="truncate text-[9px] text-slate-500 sm:text-[11px]">
                    {loading ? "Loading..." : inviteLink}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyText(inviteLink)}
                disabled={loading || inviteLink === "..."}
                className="rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-[10px] font-semibold text-yellow-800 transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs"
              >
                Copy Link
              </button>
            </div>

            {copied && (
              <p className="mt-1.5 text-[10px] text-emerald-600 sm:mt-2 sm:text-xs">
                Copied successfully.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Total Invites
              </p>

              <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-xl">
                {loading ? "..." : totalInvites}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Active Users
              </p>

              <p className="mt-0.5 text-base font-bold text-yellow-600 sm:mt-1 sm:text-xl">
                {loading ? "..." : activeUsers}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Referral Earnings
              </p>

              <p className="mt-0.5 text-base font-bold text-emerald-600 sm:mt-1 sm:text-xl">
                {loading ? "..." : `$${referralEarnings.toFixed(2)}`}
              </p>
            </div>
          </div>

          
          {/* Invite Salary Tiers */}
          <div className="mt-3 rounded-xl border border-yellow-300 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-base font-bold sm:text-lg">
              Invite Salary
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Salary eligibility is based on active referrals across Levels 1, 2 and 3.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-2 py-2 font-medium">Active Users</th>
                    <th className="px-2 py-2 font-medium">Salary</th>
                    <th className="px-2 py-2 font-medium">Payment Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-2 py-3">30–49</td>
                    <td className="px-2 py-3 font-semibold">$2</td>
                    <td className="px-2 py-3">Every 7 days</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-2 py-3">50–99</td>
                    <td className="px-2 py-3 font-semibold">$5</td>
                    <td className="px-2 py-3">Every 7 days</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-2 py-3">100–199</td>
                    <td className="px-2 py-3 font-semibold">$35</td>
                    <td className="px-2 py-3">Monthly, on the 1st</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-2 py-3">200–499</td>
                    <td className="px-2 py-3 font-semibold">$80</td>
                    <td className="px-2 py-3">Monthly, on the 1st</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-3">500+</td>
                    <td className="px-2 py-3 font-semibold">$200</td>
                    <td className="px-2 py-3">Monthly, on the 1st</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          {/* Referral Levels + Referral Network */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">

            {/* Referral Levels */}
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-5">
              <div className="text-center">
                <h2 className="text-sm font-bold sm:text-lg">
                  Referral Levels
                </h2>

                <p className="mt-0.5 text-[8px] text-slate-500 sm:mt-1 sm:text-xs">
                  Current standard referral percentages.
                </p>

                <Link
                  href="/plans"
                  className="mt-1 inline-block text-[8px] font-medium text-yellow-700 hover:text-yellow-600 sm:text-[11px]"
                >
                  Plans →
                </Link>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 1
                    </span>

                    <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[7px] text-yellow-800 sm:px-2 sm:py-1 sm:text-[9px]">
                      Direct
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-yellow-600 sm:mt-2 sm:text-2xl">
                    12%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 2
                    </span>

                    <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[7px] text-slate-600 sm:px-2 sm:py-1 sm:text-[9px]">
                      Network
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-yellow-600 sm:mt-2 sm:text-2xl">
                    4%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 3
                    </span>

                    <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[7px] text-slate-600 sm:px-2 sm:py-1 sm:text-[9px]">
                      Network
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-yellow-600 sm:mt-2 sm:text-2xl">
                    2%
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Network */}
            <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm sm:rounded-xl sm:p-5">
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-sm font-bold sm:text-lg">
                  Referral Network
                </h2>

                <p className="mt-0.5 text-[8px] text-slate-500 sm:mt-1 sm:text-xs">
                  Your three-level network.
                </p>

                <span className="mt-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[7px] text-slate-500 sm:mt-2 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  {loading ? "..." : `${totalNetwork} Members`}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                <div className="rounded-lg bg-slate-50 p-2.5 text-center sm:p-3">
                  <p className="text-[8px] text-slate-500 sm:text-[11px]">
                    Level 1 Members
                  </p>

                  <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-lg">
                    {loading ? "..." : level1}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5 text-center sm:p-3">
                  <p className="text-[8px] text-slate-500 sm:text-[11px]">
                    Level 2 Members
                  </p>

                  <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-lg">
                    {loading ? "..." : level2}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5 text-center sm:p-3">
                  <p className="text-[8px] text-slate-500 sm:text-[11px]">
                    Level 3 Members
                  </p>

                  <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-lg">
                    {loading ? "..." : level3}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works - Bottom */}
          <div className="mt-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:mt-3 sm:rounded-xl sm:p-5">
            <h2 className="text-center text-sm font-bold sm:text-lg">
              How It Works
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2.5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100 text-[9px] font-bold text-yellow-700 sm:h-8 sm:w-8 sm:text-xs">
                  01
                </div>

                <h3 className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">
                  Share your link
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                  Send your unique invite link to your friends.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100 text-[9px] font-bold text-yellow-700 sm:h-8 sm:w-8 sm:text-xs">
                  02
                </div>

                <h3 className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">
                  Friend registers
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                  Your friend creates an account using your referral code.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-100 text-[9px] font-bold text-yellow-700 sm:h-8 sm:w-8 sm:text-xs">
                  03
                </div>

                <h3 className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">
                  Track activity
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                  Referral activity and eligible commissions can be tracked
                  here.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-[9px] text-slate-500 sm:py-5 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}