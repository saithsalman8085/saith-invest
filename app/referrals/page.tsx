"use client";

import Link from "next/link";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const referralLink = "https://claudeinvest.com/register?ref=SALMAN123";

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            ClaudeInvest
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="px-5 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              Referral Program
            </p>

            <h1 className="mt-3 text-4xl font-bold">
              Invite Friends
            </h1>

            <p className="mt-3 text-slate-400">
              Share your referral link and track your referrals.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-center">
            <p className="text-sm text-yellow-300">
               — Referral rewards are not active yet.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
              <p className="text-sm text-slate-500">Total Referrals</p>
              <p className="mt-2 text-3xl font-bold">12</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
              <p className="text-sm text-slate-500">Active Referrals</p>
              <p className="mt-2 text-3xl font-bold text-cyan-400">8</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
              <p className="text-sm text-slate-500"> Rewards</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                $120
              </p>
            </div>
          </div>

          {/* Referral Link */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h2 className="text-xl font-bold">Your Referral Link</h2>

            <p className="mt-2 text-sm text-slate-400">
              Share this link with people you invite.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-sm text-slate-300 outline-none"
              />

              <button
                onClick={copyLink}
                className="rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8">
            <h2 className="text-xl font-bold">How Referrals Work</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-950 p-5">
                <div className="text-2xl">1</div>
                <h3 className="mt-3 font-semibold">Share Your Link</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Send your unique referral link to your friends.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <div className="text-2xl">2</div>
                <h3 className="mt-3 font-semibold">Friend Registers</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your friend creates an account using your link.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5">
                <div className="text-2xl">3</div>
                <h3 className="mt-3 font-semibold">Reward Tracking</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Eligible referral rewards will be tracked by the system.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-600">
            Referral rules and reward percentages will be controlled from
            the admin panel.
          </div>
        </div>
      </section>
            <BottomNav />
    </main>
  );
}