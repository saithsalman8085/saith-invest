
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
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch("/api/plans", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setMessageType("error");
          throw new Error(data.error || "Unable to load plans.");
        }

        setPlans(data.plans || []);
      } catch (error) {
        setMessageType("error");
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
    setMessageType("info");

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
        setMessageType("error");

        throw new Error(
          data.error || "Unable to create investment."
        );
      }

      setMessageType("success");

      setMessage(
        data.message || "Investment created successfully."
      );
    } catch (error) {
      setMessageType("error");

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
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black">

      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-yellow-600 sm:text-2xl"
          >
            ClaudeInvest
          </Link>

          <MainNav />

          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <Link
              href="/login"
              className="rounded-lg bg-yellow-400 px-3 py-2 text-[11px] font-semibold text-black transition hover:bg-yellow-300 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Login
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-black"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="px-3 pt-5 sm:px-5 sm:pt-10">
        <div className="mx-auto max-w-6xl">

          {/* Back */}
          <Link
            href="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-600 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-black sm:inline-flex sm:text-sm"
          >
            ← Back to Dashboard
          </Link>

          {/* Page Intro */}
          <div className="mx-auto mt-2 max-w-3xl text-center sm:mt-8">
            <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-700 sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Investment Plans
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:mt-5 sm:text-4xl md:text-5xl">
              Choose Your{" "}
              <span className="text-yellow-600">
                Investment Plan
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-gray-500 sm:mt-4 sm:text-base sm:leading-6">
              Explore the available plans and choose an option that fits
              your investment goals.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mx-auto mt-4 max-w-2xl rounded-xl px-3 py-2.5 text-center text-xs sm:mt-6 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm ${
                messageType === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : messageType === "error"
                    ? "border border-red-200 bg-red-50 text-red-600"
                    : "border border-yellow-200 bg-yellow-50 text-yellow-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="mt-8 text-center text-xs text-gray-500 sm:mt-12 sm:text-sm">
              Loading investment plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center sm:mt-12 sm:rounded-3xl sm:p-8">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                📋
              </div>

              <h2 className="mt-3 text-lg font-bold sm:mt-4 sm:text-xl">
                No plans available
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:mt-2 sm:text-sm sm:leading-6">
                There are currently no published investment plans available.
              </p>
            </div>
          ) : (
            /*
             * ONE PLAN PER ROW
             */
            <div className="mt-6 space-y-5 sm:mt-10 sm:space-y-7">
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
                    className="relative overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.10)] sm:rounded-[30px]"
                  >

                    {/* TOP INFORMATION AREA */}
                    <div
                      className={`relative overflow-hidden ${
                        plan.isSpecial
                          ? "bg-gradient-to-br from-[#fff0df] via-[#ffead4] to-[#ffe2c4]"
                          : "bg-gradient-to-br from-[#fff7e9] via-[#fff0d8] to-[#ffe8c9]"
                      }`}
                    >

                      {/* Special Banner */}
                      {plan.isSpecial && (
                        <div className="absolute left-0 top-0 rounded-br-[18px] bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-md sm:px-7 sm:py-3 sm:text-lg">
                          Upgrade • Unlock 8 Benefits
                        </div>
                      )}

                      {/* Normal Plan Accent */}
                      {!plan.isSpecial && (
                        <div className="absolute left-0 top-0 rounded-br-[18px] bg-gradient-to-r from-yellow-500 to-orange-400 px-5 py-2.5 text-xs font-bold text-white shadow-md sm:px-7 sm:py-3 sm:text-sm">
                          Investment Plan
                        </div>
                      )}

                      {/* Question Icon */}
                      <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-yellow-600/30 bg-yellow-400/30 text-lg font-bold text-yellow-800 shadow-sm sm:right-5 sm:top-5 sm:h-12 sm:w-12 sm:text-xl">
                        ?
                      </div>

                      <div className="grid gap-5 px-4 pb-5 pt-20 sm:grid-cols-[230px_1fr] sm:gap-7 sm:px-7 sm:pb-7 sm:pt-24 lg:grid-cols-[270px_1fr]">

                        {/* IMAGE / PRODUCT AREA */}
                        <div className="flex items-center justify-center">
                          <div className="relative flex h-48 w-full max-w-[260px] items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-[#111827] via-[#243447] to-[#0f172a] shadow-lg sm:h-56 sm:max-w-none sm:rounded-[26px]">

                            {/* Decorative lights */}
                            <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-yellow-400/10 blur-2xl" />
                            <div className="absolute bottom-3 right-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

                            {/* Product illustration */}
                            <div className="relative flex flex-col items-center">
                              <div className="flex h-24 w-20 items-center justify-center rounded-md border border-yellow-300/30 bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl sm:h-28 sm:w-24">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-400/50 text-xl text-yellow-300 sm:h-12 sm:w-12">
                                  ◈
                                </div>
                              </div>

                              <div className="mt-3 max-w-[190px] text-center text-xs font-semibold text-white/90 sm:text-sm">
                                {plan.name}
                              </div>

                              <div className="mt-1 text-[8px] uppercase tracking-[0.25em] text-yellow-300/70 sm:text-[9px]">
                                ClaudeInvest
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PLAN INFORMATION */}
                        <div className="min-w-0">

                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-500 sm:text-xs">
                                Investment Plan
                              </p>

                              <h2 className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                                {plan.name}
                              </h2>
                            </div>

                            {plan.isSpecial && (
                              <div className="shrink-0 rounded-lg border border-yellow-400/50 bg-yellow-100 px-2.5 py-1.5 text-[9px] font-bold text-yellow-800 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs">
                                ★ Premium
                              </div>
                            )}
                          </div>

                          {/* Existing information arranged like reference */}
                          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:mt-6 sm:gap-x-8 sm:gap-y-5">

                            <div>
                              <p className="text-xs text-gray-500 sm:text-sm">
                                Daily Earning
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                ${daily.toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 sm:text-sm">
                                Total Return
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                ${total.toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 sm:text-sm">
                                Duration
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                {plan.durationDays} Days
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 sm:text-sm">
                                Active Purchases
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                {maxPurchases}
                              </p>
                            </div>

                            <div className="col-span-2">
                              <p className="text-xs text-gray-500 sm:text-sm">
                                Instant Referral Bonus
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                ${referralBonus.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Status + Level */}
                          <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">

                            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Available
                            </div>

                            <div className="rounded-full bg-yellow-50 px-3 py-1.5 text-[10px] font-semibold text-yellow-700 sm:text-xs">
                              Level 1: {Number(plan.level1Percent)}%
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM PRICE AREA */}
                    <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-7 sm:py-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* Prices + Plan Name */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">

                          <div>
                            <p className="text-2xl font-bold text-orange-500 sm:text-4xl">
                              ${deposit.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-2xl font-bold text-red-600 sm:text-4xl">
                              ${profit.toLocaleString()}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gradient-to-r from-[#ffe0bd] to-[#f7bd57] px-3 py-2 text-sm font-bold text-yellow-900 shadow-sm sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-base">
                            {plan.name}
                          </div>
                        </div>

                        {/* INVEST */}
                        <button
                          type="button"
                          onClick={() => handleInvest(plan)}
                          disabled={investing === plan.id}
                          className="w-full rounded-2xl bg-gradient-to-r from-[#ffd8ad] to-[#f2b94b] px-7 py-3.5 text-base font-bold text-gray-900 shadow-sm transition hover:from-[#ffc98f] hover:to-[#e9a92e] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[190px] sm:px-9 sm:py-4 sm:text-lg"
                        >
                          {investing === plan.id
                            ? "Processing..."
                            : "Invest"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="py-5 text-center text-[9px] text-gray-400 sm:py-6 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}