
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
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
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

          {/* Heading */}
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
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-xs text-emerald-700 sm:mt-6 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
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
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
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
             * IMPORTANT:
             * One plan per row — same structure as the reference image.
             */
            <div className="mt-6 space-y-5 sm:mt-12 sm:space-y-7">
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
                    className="relative overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-[0_5px_22px_rgba(0,0,0,0.08)] sm:rounded-[30px]"
                  >
                    {/* ================================
                        TOP PEACH / CREAM AREA
                    ================================= */}
                    <div className="relative overflow-hidden bg-[#ffead5]">
                      {/* Premium Banner */}
                      {plan.isSpecial && (
                        <div className="absolute left-0 top-0 z-10 rounded-br-[18px] bg-gradient-to-r from-[#ef2929] to-[#d71919] px-5 py-2.5 text-sm font-bold text-white shadow-md sm:px-7 sm:py-3 sm:text-lg">
                          Upgrade • Unlock 8 Benefits
                        </div>
                      )}

                      {!plan.isSpecial && (
                        <div className="absolute left-0 top-0 z-10 rounded-br-[18px] bg-gradient-to-r from-[#f59e0b] to-[#e6a93b] px-5 py-2.5 text-sm font-bold text-white shadow-md sm:px-7 sm:py-3 sm:text-base">
                          Investment Plan
                        </div>
                      )}

                      {/* Question Button */}
                      <div className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#c99532] bg-[#f6d98d] text-xl font-bold text-[#8a641b] shadow-sm sm:right-5 sm:top-5 sm:h-14 sm:w-14 sm:text-2xl">
                        ?
                      </div>

                      <div className="grid gap-5 px-4 pb-6 pt-20 sm:grid-cols-[270px_1fr] sm:gap-8 sm:px-7 sm:pb-8 sm:pt-24 lg:grid-cols-[290px_1fr]">
                        {/* ================================
                            PRODUCT IMAGE STYLE AREA
                        ================================= */}
                        <div className="flex items-center justify-center">
                          <div className="relative h-[230px] w-full max-w-[260px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#0d1117] via-[#253442] to-[#10151b] shadow-lg sm:h-[255px] sm:max-w-[290px] sm:rounded-[26px]">
                            {/* Background lights */}
                            <div className="absolute left-[-20px] top-[-20px] h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute bottom-[-25px] right-[-10px] h-36 w-36 rounded-full bg-yellow-400/10 blur-3xl" />

                            {/* Table / platform */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />

                            {/* Product */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                              <div className="relative flex h-[125px] w-[92px] items-center justify-center rounded-sm border border-gray-500/50 bg-gradient-to-br from-[#34495a] via-[#17232e] to-[#0b1117] shadow-2xl sm:h-[145px] sm:w-[108px]">
                                <div className="absolute inset-2 rounded-sm border border-yellow-400/10" />

                                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-400/50 bg-black/20 text-lg text-yellow-300 sm:h-14 sm:w-14 sm:text-xl">
                                  ◈
                                </div>
                              </div>

                              <div className="mt-2 text-center text-[9px] font-semibold text-white/80 sm:text-[10px]">
                                {plan.name}
                              </div>

                              <div className="mt-0.5 text-center text-[6px] uppercase tracking-[0.25em] text-yellow-300/70 sm:text-[7px]">
                                ClaudeInvest
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ================================
                            PLAN DETAILS
                        ================================= */}
                        <div className="min-w-0 self-center">
                          <h2 className="text-2xl font-bold leading-tight text-[#171717] sm:text-4xl">
                            {plan.name}
                          </h2>

                          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:mt-4 sm:gap-x-12 sm:gap-y-3">
                            {/* Daily Income */}
                            <div>
                              <p className="text-lg leading-none text-[#555] sm:text-2xl">
                                Daily income
                              </p>

                              <p className="mt-1 text-2xl font-bold leading-none text-[#171717] sm:text-4xl">
                                ${daily.toLocaleString()}
                              </p>
                            </div>

                            {/* Total Income */}
                            <div>
                              <p className="text-lg leading-none text-[#555] sm:text-2xl">
                                Total income
                              </p>

                              <p className="mt-1 text-2xl font-bold leading-none text-[#171717] sm:text-4xl">
                                ${total.toLocaleString()}
                              </p>
                            </div>

                            {/* Contract Period */}
                            <div>
                              <p className="text-lg leading-none text-[#555] sm:text-2xl">
                                Contract period
                              </p>

                              <p className="mt-1 text-2xl font-bold leading-none text-[#171717] sm:text-4xl">
                                {plan.durationDays} Days
                              </p>
                            </div>

                            {/* Quantity Limit */}
                            <div>
                              <p className="text-lg leading-none text-[#555] sm:text-2xl">
                                Quantity limit
                              </p>

                              <p className="mt-1 text-2xl font-bold leading-none text-[#171717] sm:text-4xl">
                                {maxPurchases}
                              </p>
                            </div>

                            {/* Referral Bonus */}
                            <div className="col-span-2">
                              <p className="text-lg leading-none text-[#555] sm:text-2xl">
                                Subordinate purchase rebate
                              </p>

                              <p className="mt-1 text-2xl font-bold leading-none text-[#171717] sm:text-4xl">
                                ${referralBonus.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ================================
                        BOTTOM WHITE PRICE AREA
                    ================================= */}
                    <div className="bg-white px-4 py-5 sm:px-7 sm:py-7">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-5">
                          {/* Deposit */}
                          <div className="text-[38px] font-semibold leading-none text-[#ef8c27] sm:text-[52px]">
                            ${deposit.toLocaleString()}
                          </div>

                          {/* Plan Name Badge */}
                          <div className="rounded-xl bg-gradient-to-r from-[#ffe0bd] to-[#f5bd58] px-3 py-2.5 text-lg font-bold text-[#6b4618] shadow-sm sm:rounded-xl sm:px-5 sm:py-3 sm:text-2xl">
                            {plan.name}
                          </div>

                          {/* Profit */}
                          <div className="text-[38px] font-semibold leading-none text-[#d71919] sm:text-[52px]">
                            ${profit.toLocaleString()}
                          </div>
                        </div>

                        {/* INVEST BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleInvest(plan)}
                          disabled={investing === plan.id}
                          className="w-full rounded-[22px] bg-gradient-to-r from-[#ffdbad] to-[#f4bd58] px-8 py-4 text-xl font-medium text-[#493316] shadow-sm transition hover:from-[#ffd09a] hover:to-[#efae36] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[220px] sm:px-10 sm:py-5 sm:text-2xl"
                        >
                          {investing === plan.id
                            ? "Processing..."
                            : "INVEST"}
                        </button>
                      </div>

                      {/* Referral percentages remain available */}
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-[9px] font-semibold text-yellow-700 sm:text-[10px]">
                          Level 1: {Number(plan.level1Percent)}%
                        </span>

                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-[9px] font-semibold text-yellow-700 sm:text-[10px]">
                          Level 2: {Number(plan.level2Percent)}%
                        </span>

                        <span className="rounded-full bg-yellow-50 px-3 py-1 text-[9px] font-semibold text-yellow-700 sm:text-[10px]">
                          Level 3: {Number(plan.level3Percent)}%
                        </span>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-semibold text-emerald-700 sm:text-[10px]">
                          {plan.status}
                        </span>
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
