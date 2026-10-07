
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
        const response = await fetch("/api/referrals", {
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
    <main className="min-h-screen overflow-x-hidden bg-slate-950 pb-24 text-white">
      <section className="px-2.5 py-3 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <header className="mb-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3 backdrop-blur-xl sm:mb-5 sm:rounded-2xl sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <Link
                  href="/"
                  className="text-base font-bold text-cyan-400 sm:text-xl"
                >
                  ClaudeInvest
                </Link>

                <p className="mt-1.5 text-[10px] text-cyan-400 sm:mt-2 sm:text-xs">
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
          <div className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-slate-950 p-3 sm:rounded-2xl sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-cyan-400 sm:px-3 sm:text-[10px]">
                  Your Referral Network
                </span>

                <h2 className="mt-2 text-lg font-bold sm:mt-3 sm:text-3xl">
                  Invite people using your unique code.
                </h2>

                <p className="mt-1.5 text-[10px] leading-4 text-slate-400 sm:mt-2 sm:text-sm sm:leading-5">
                  Share your invite link and track your referral activity
                  from one place.
                </p>
              </div>

              <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-950/80 p-3 sm:rounded-xl sm:p-4">
                <p className="text-center text-[9px] text-slate-500 sm:text-[11px]">
                  Your Invite Code
                </p>

                <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <div className="min-w-0 flex-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-2 sm:rounded-lg sm:px-3 sm:py-2.5">
                    <p className="truncate text-center text-[11px] font-bold tracking-wider text-cyan-400 sm:text-sm">
                      {loading ? "Loading..." : inviteCode}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyText(inviteCode)}
                    disabled={loading || inviteCode === "..."}
                    className="rounded-md bg-cyan-500 px-2.5 py-2 text-[10px] font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Invite Link */}
          <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:mt-3 sm:rounded-xl sm:p-5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  Your Invite Link
                </p>

                <div className="mt-1.5 rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2 sm:mt-2 sm:rounded-lg sm:px-3 sm:py-2.5">
                  <p className="truncate text-[9px] text-slate-400 sm:text-[11px]">
                    {loading ? "Loading..." : inviteLink}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyText(inviteLink)}
                disabled={loading || inviteLink === "..."}
                className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[10px] font-semibold text-cyan-400 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs"
              >
                Copy Link
              </button>
            </div>

            {copied && (
              <p className="mt-1.5 text-[10px] text-emerald-400 sm:mt-2 sm:text-xs">
                Copied successfully.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2.5 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Total Invites
              </p>

              <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-xl">
                {loading ? "..." : totalInvites}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Active Users
              </p>

              <p className="mt-0.5 text-base font-bold text-cyan-400 sm:mt-1 sm:text-xl">
                {loading ? "..." : activeUsers}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 sm:rounded-xl sm:p-4">
              <p className="text-[8px] text-slate-500 sm:text-xs">
                Referral Earnings
              </p>

              <p className="mt-0.5 text-base font-bold text-emerald-400 sm:mt-1 sm:text-xl">
                {loading ? "..." : `$${referralEarnings.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Referral Levels + Referral Network */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3">

            {/* Referral Levels */}
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 sm:rounded-xl sm:p-5">
              <div className="text-center">
                <h2 className="text-sm font-bold sm:text-lg">
                  Referral Levels
                </h2>

                <p className="mt-0.5 text-[8px] text-slate-500 sm:mt-1 sm:text-xs">
                  Current standard referral percentages.
                </p>

                <Link
                  href="/plans"
                  className="mt-1 inline-block text-[8px] font-medium text-cyan-400 hover:text-cyan-300 sm:text-[11px]"
                >
                  Plans →
                </Link>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                <div className="rounded-lg border border-cyan-400/20 bg-slate-950 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 1
                    </span>

                    <span className="rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[7px] text-cyan-400 sm:px-2 sm:py-1 sm:text-[9px]">
                      Direct
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-cyan-400 sm:mt-2 sm:text-2xl">
                    12%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 2
                    </span>

                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[7px] text-slate-500 sm:px-2 sm:py-1 sm:text-[9px]">
                      Network
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-cyan-400 sm:mt-2 sm:text-2xl">
                    4%
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-center sm:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-500 sm:text-xs">
                      Level 3
                    </span>

                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[7px] text-slate-500 sm:px-2 sm:py-1 sm:text-[9px]">
                      Network
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold text-cyan-400 sm:mt-2 sm:text-2xl">
                    2%
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Network */}
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-center sm:rounded-xl sm:p-5">
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-sm font-bold sm:text-lg">
                  Referral Network
                </h2>

                <p className="mt-0.5 text-[8px] text-slate-500 sm:mt-1 sm:text-xs">
                  Your three-level network.
                </p>

                <span className="mt-1 rounded-full border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[7px] text-slate-500 sm:mt-2 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  {loading ? "..." : `${totalNetwork} Members`}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                <div className="rounded-lg bg-slate-950 p-2.5 text-center sm:p-3">
                  <p className="text-[8px] text-slate-500 sm:text-[11px]">
                    Level 1 Members
                  </p>

                  <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-lg">
                    {loading ? "..." : level1}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-2.5 text-center sm:p-3">
                  <p className="text-[8px] text-slate-500 sm:text-[11px]">
                    Level 2 Members
                  </p>

                  <p className="mt-0.5 text-base font-bold sm:mt-1 sm:text-lg">
                    {loading ? "..." : level2}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-2.5 text-center sm:p-3">
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
          <div className="mt-2.5 rounded-lg border border-slate-800 bg-slate-900 p-3 sm:mt-3 sm:rounded-xl sm:p-5">
            <h2 className="text-center text-sm font-bold sm:text-lg">
              How It Works
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2.5">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-[9px] font-bold text-cyan-400 sm:h-8 sm:w-8 sm:text-xs">
                  01
                </div>

                <h3 className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">
                  Share your link
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                  Send your unique invite link to your friends.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-[9px] font-bold text-cyan-400 sm:h-8 sm:w-8 sm:text-xs">
                  02
                </div>

                <h3 className="mt-2 text-[10px] font-semibold sm:mt-3 sm:text-sm">
                  Friend registers
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                  Your friend creates an account using your referral code.
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 sm:p-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-[9px] font-bold text-cyan-400 sm:h-8 sm:w-8 sm:text-xs">
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
          <div className="py-4 text-center text-[9px] text-slate-600 sm:py-5 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}