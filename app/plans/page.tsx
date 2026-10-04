"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type Plan = {
  id: string;
  name: string;
  depositAmount: string | number;
  profitAmount: string | number;
  durationDays: number;
  dailyEarning: string | number;
  totalReturn: string | number;
  level1Percent: string | number;
  level2Percent: string | number;
  level3Percent: string | number;
  referralBonusUSD: string | number;
  maxPurchasesPerUser: number;
  isSpecial: boolean;
  status: string;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch("/api/plans", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load plans.");
        }

        setPlans(data.plans || []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load investment plans."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  async function handleInvest(plan: Plan) {
    const confirmed = window.confirm(
      `Invest $${Number(plan.depositAmount).toLocaleString()} in ${plan.name}?`
    );

    if (!confirmed) {
      return;
    }

    setInvesting(plan.id);
    setMessage("");

    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create investment."
        );
      }

      setMessage(
        data.message || "Investment created successfully."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create investment."
      );
    } finally {
      setInvesting(null);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 pb-24 text-white">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-cyan-400 sm:text-2xl"
          >
            ClaudeInvest
          </Link>

          <MainNav />

          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <Link
              href="/login"
              className="rounded-lg bg-cyan-500 px-3 py-2 text-[11px] font-semibold text-slate-950 transition hover:bg-cyan-400 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Login
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-900 hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="px-2.5 pt-5 sm:px-5 sm:pt-14">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300 sm:inline-flex sm:text-sm"
          >
            ← Back to Dashboard
          </Link>

          <div className="mx-auto mt-2 max-w-3xl text-center sm:mt-10">
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-400 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Investment Plans
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:mt-5 sm:text-4xl md:text-5xl">
              Choose Your
              <span className="text-cyan-400">
                {" "}
                Investment Plan
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-slate-400 sm:mt-4 sm:text-base sm:leading-6">
              Explore the available plans and choose an option that fits
              your investment goals.
            </p>
          </div>

          {message && (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5 text-center text-xs text-cyan-300 sm:mt-6 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
              {message}
            </div>
          )}

          {loading ? (
            <div className="mt-8 text-center text-xs text-slate-500 sm:mt-12 sm:text-sm">
              Loading investment plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center sm:mt-12 sm:rounded-3xl sm:p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📋
              </div>

              <h2 className="mt-3 text-lg font-bold sm:mt-4 sm:text-xl">
                No plans available
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                There are currently no published investment plans available.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const deposit = Number(plan.depositAmount);
                const profit = Number(plan.profitAmount);
                const daily = Number(plan.dailyEarning);
                const total = Number(plan.totalReturn);
                const referralBonus = Number(plan.referralBonusUSD);
                const maxPurchases = Number(plan.maxPurchasesPerUser);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col overflow-hidden rounded-xl border bg-slate-900 transition duration-300 hover:-translate-y-1 sm:rounded-3xl ${
                      plan.isSpecial
                        ? "border-cyan-400/50 shadow-[0_0_45px_rgba(34,211,238,0.08)]"
                        : "border-slate-800 hover:border-cyan-500/40"
                    }`}
                  >
                    <div
                      className={`h-0.5 w-full sm:h-1 ${
                        plan.isSpecial
                          ? "bg-cyan-400"
                          : "bg-slate-800"
                      }`}
                    />

                    {plan.isSpecial && (
                      <div className="absolute right-2 top-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-amber-300 sm:right-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[10px]">
                        ★ Premium
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-2.5 sm:p-6">
                      <div>
                        <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">
                          Investment Plan
                        </p>

                        <h2 className="mt-1 pr-10 text-sm font-bold sm:mt-2 sm:pr-20 sm:text-3xl">
                          {plan.name}
                        </h2>
                      </div>

                      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-2.5 sm:mt-6 sm:rounded-2xl sm:p-4">
                        <p className="text-[8px] text-slate-500 sm:text-[11px]">
                          Investment
                        </p>

                        <p className="mt-0.5 text-lg font-bold text-white sm:mt-1 sm:text-3xl">
                          ${deposit.toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 sm:rounded-xl sm:p-3">
                          <p className="text-[8px] text-slate-500 sm:text-[10px]">
                            Profit
                          </p>

                          <p className="mt-0.5 text-sm font-bold text-emerald-400 sm:mt-1 sm:text-lg">
                            ${profit.toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 sm:rounded-xl sm:p-3">
                          <p className="text-[8px] text-slate-500 sm:text-[10px]">
                            Duration
                          </p>

                          <p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg">
                            {plan.durationDays}
                            <span className="ml-0.5 text-[7px] font-normal text-slate-500 sm:ml-1 sm:text-[10px]">
                              days
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/70 sm:mt-4 sm:rounded-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Daily Earning
                          </span>

                          <span className="text-[8px] font-semibold text-emerald-400 sm:text-xs">
                            ${daily.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Total Return
                          </span>

                          <span className="text-[8px] font-semibold text-cyan-400 sm:text-xs">
                            ${total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Level 1 Referral
                          </span>

                          <span className="text-[8px] font-semibold sm:text-xs">
                            {Number(plan.level1Percent)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Instant Referral Bonus
                          </span>

                          <span className="text-[8px] font-semibold text-amber-300 sm:text-xs">
                            ${referralBonus.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Active Purchases
                          </span>

                          <span className="text-[8px] font-semibold text-white sm:text-xs">
                            Up to {maxPurchases}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-2.5 py-2 sm:px-4 sm:py-3">
                          <span className="text-[8px] text-slate-500 sm:text-xs">
                            Status
                          </span>

                          <span className="flex items-center gap-1 text-[8px] font-semibold text-emerald-400 sm:gap-1.5 sm:text-xs">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 sm:h-1.5 sm:w-1.5" />
                            Available
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInvest(plan)}
                        disabled={investing === plan.id}
                        className={`mt-3 rounded-lg px-2.5 py-2 text-center text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:mt-5 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm ${
                          plan.isSpecial
                            ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            : "border border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-500/50 hover:text-cyan-400"
                        }`}
                      >
                        {investing === plan.id
                          ? "Processing..."
                          : `Invest $${deposit.toLocaleString()}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="py-5 text-center text-[9px] text-slate-600 sm:py-6 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}