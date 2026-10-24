
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
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-yellow-600 sm:text-2xl"
          >
            ClaudeInvest
          </Link>

          <MainNav />
        </div>
      </header>

      <section className="px-2.5 py-4 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-5 text-center sm:mb-10">
            <div className="mx-auto inline-flex items-center rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-yellow-700 sm:px-4 sm:py-1.5 sm:text-[10px]">
              Investment Plans
            </div>

            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:mt-4 sm:text-4xl">
              Investment Plans
            </h1>

            <p className="mx-auto mt-1 max-w-xl text-[10px] leading-4 text-gray-500 sm:mt-2 sm:text-sm sm:leading-6">
              Choose an investment plan that suits your goals.
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 rounded-xl border p-3 text-center text-xs sm:mb-6 sm:rounded-2xl sm:p-4 sm:text-sm ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading investment plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <h2 className="font-bold">No plans available</h2>
              <p className="mt-2 text-sm text-gray-500">
                There are currently no published investment plans.
              </p>
            </div>
          ) : (
            /*
             * ONE PLAN PER ROW
             */
            <div className="space-y-2.5 sm:space-y-3.5">
              {plans.map((plan) => {
                const deposit = Number(plan.depositAmount);
                const profit = Number(plan.profitAmount);
                const daily = Number(plan.dailyEarning);
                const total = Number(plan.totalReturn);
                const referralBonus = Number(plan.referralBonusUSD);
                const quantity = Number(plan.maxPurchasesPerUser);

                return (
                  <article
                    key={plan.id}
                    className="overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:rounded-2xl"
                  >
                    {/* =================================
                        TOP PEACH SECTION
                    ================================= */}
                    <div className="relative bg-[#ffead5]">
                      

                      {/* Question */}
                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#d09b36] bg-[#f5d58a] text-sm font-bold text-[#765619] shadow-sm sm:right-4 sm:top-4 sm:h-9 sm:w-9 sm:text-base">
                        ?
                      </div>

                      {/* Content */}
                      <div className="px-3 pb-2 pt-3 sm:px-4 sm:pb-2 sm:pt-4">
                        {/* Plan name */}
                        <h2 className="pr-10 text-lg font-bold leading-tight text-[#171717] sm:pr-12 sm:text-2xl">
                          {plan.name}
                        </h2>

                        {/* Details */}
                        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:mt-4 sm:gap-x-5 sm:gap-y-3">
                          {/* Daily */}
                          <div>
                            <p className="text-[11px] leading-tight text-[#555] sm:text-sm">
                              Daily income
                            </p>

                            <p className="mt-1 text-base font-bold leading-none text-[#171717] sm:text-xl">
                              ${daily.toLocaleString()}
                            </p>
                          </div>

                          {/* Total */}
                          <div>
                            <p className="text-[11px] leading-tight text-[#555] sm:text-sm">
                              Total income
                            </p>

                            <p className="mt-1 text-base font-bold leading-none text-[#171717] sm:text-xl">
                              ${total.toLocaleString()}
                            </p>
                          </div>

                          {/* Duration */}
                          <div>
                            <p className="text-[11px] leading-tight text-[#555] sm:text-sm">
                              Contract period
                            </p>

                            <p className="mt-1 text-base font-bold leading-none text-[#171717] sm:text-xl">
                              {plan.durationDays} Days
                            </p>
                          </div>

                          {/* Quantity */}
                          <div>
                            <p className="text-[11px] leading-tight text-[#555] sm:text-sm">
                              Quantity limit
                            </p>

                            <p className="mt-1 text-base font-bold leading-none text-[#171717] sm:text-xl">
                              {quantity}
                            </p>
                          </div>

                          {/* Referral */}
                          <div className="col-span-2">
                            <p className="text-[11px] leading-tight text-[#555] sm:text-sm">
                              Subordinate purchase rebate
                            </p>

                            <p className="mt-1 text-base font-bold leading-none text-[#171717] sm:text-xl">
                              ${referralBonus.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================
                        WHITE BOTTOM SECTION
                    ================================= */}
                    <div className="bg-white px-3 py-3 sm:px-4 sm:py-4">
                      {/* Price / Invest row */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        {/* Prices */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
                          {/* Deposit */}
                          <span className="text-lg font-medium leading-none text-[#ed8420] sm:text-2xl">
                            ${deposit.toLocaleString()}
                          </span>

                          {/* Plan name */}
                          <span className="rounded-lg bg-gradient-to-r from-[#ffdfb9] to-[#f4bd58] px-2 py-1 text-[10px] font-bold text-[#68451b] shadow-sm sm:px-2 sm:py-1 sm:text-sm">
                            {plan.name}
                          </span>
                        </div>

                        {/* Invest */}
                        <button
                          type="button"
                          onClick={() => handleInvest(plan)}
                          disabled={investing === plan.id}
                          className="w-full rounded-xl bg-gradient-to-r from-[#ffdbad] to-[#f3bb55] px-4 py-2 text-sm font-medium text-[#3d2b15] shadow-sm transition hover:from-[#ffd09a] hover:to-[#edac36] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[160px] sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-base"
                        >
                          {investing === plan.id
                            ? "Processing..."
                            : "INVEST"}
                        </button>
                      </div>

                      {/* Referral / Status badges */}
                      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-gray-100 pt-2">
                        <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-semibold text-yellow-700">
                          Level 1: {Number(plan.level1Percent)}%
                        </span>

                        <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-semibold text-yellow-700">
                          Level 2: {Number(plan.level2Percent)}%
                        </span>

                        <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-semibold text-yellow-700">
                          Level 3: {Number(plan.level3Percent)}%
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
                          {plan.status}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="py-5 text-center text-[9px] text-gray-400 sm:py-7 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}