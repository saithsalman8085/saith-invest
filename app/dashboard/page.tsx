
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type Investment = {
  id: string;
  amount: number;
  durationDays: number;
  collectedDays: number;
  remainingDays: number;
  dailyReturn: number;
  startedAt: string;
  endsAt: string;
  nextCollectionAt: string | null;
  status: string;
};

type DashboardData = {
  user: {
    fullName: string;
    referralCode: string;
    premiumBadge: boolean;
  };
  stats: {
    balance: number;
    totalInvested: number;
    totalEarnings: number;
    totalWithdraw: number;
  };
  activeInvestments: Investment[];
  transactions: {
    id: string;
    type: string;
    status: string;
    amountUSD: number;
    createdAt: string;
  }[];
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function formatRemaining(seconds: number) {
  if (seconds <= 0) {
    return "Ready to collect";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours}h ${minutes}m ${secs}s`;
}

function getTransactionName(type: string) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "INVESTMENT":
      return "Investment";
    case "DAILY_EARNING":
      return "Daily Earning";
    case "REFERRAL_COMMISSION":
      return "Referral";
    case "ACTIVE_USER_REWARD":
      return "Active User Reward";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "WITHDRAWAL_FEE":
      return "Withdrawal Fee";
    case "ADMIN_ADJUSTMENT":
      return "Admin Adjustment";
    default:
      return type;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [remainingSeconds, setRemainingSeconds] =
    useState<Record<string, number>>({});

  async function loadDashboard() {
    try {
      setError("");

      const response = await fetch("/api/dashboard", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load dashboard."
        );
      }

      setData(result);

      const timers: Record<string, number> = {};

      for (const investment of result.activeInvestments || []) {
        if (investment.nextCollectionAt) {
          timers[investment.id] = Math.max(
            0,
            Math.ceil(
              (new Date(
                investment.nextCollectionAt
              ).getTime() -
                Date.now()) /
                1000
            )
          );
        } else {
          timers[investment.id] = 0;
        }
      }

      setRemainingSeconds(timers);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        const updated: Record<string, number> = {};

        for (const [id, seconds] of Object.entries(current)) {
          updated[id] = Math.max(0, seconds - 1);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function collectEarnings(investmentId: string) {
    const investment = data?.activeInvestments.find(
      (item) => item.id === investmentId
    );

    if (!investment) {
      return;
    }

    setCollectingId(investmentId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/investments/earn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            investmentId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to collect earnings."
        );
      }

      setSuccess(
        `Earning of ${formatMoney(
          Number(result.earning.amount)
        )} collected successfully.`
      );

      await loadDashboard();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to collect earnings."
      );
    } finally {
      setCollectingId(null);
    }
  }

  const investments = data?.activeInvestments || [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] pb-24 text-black">
      <section className="w-full px-2.5 py-3 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          
{/* Centered Header */}
<header className="relative mb-3 overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-[0_4px_18px_rgba(0,0,0,0.05)] sm:mb-5 sm:rounded-3xl">

  <style jsx>{`
    @keyframes coinFloat {
      0%, 100% {
        transform: translateY(0) rotate(-8deg);
      }
      50% {
        transform: translateY(-13px) rotate(8deg);
      }
    }

    .floating-coin {
  position: absolute;
  font-size: 29px;
  opacity: 1;
  pointer-events: none;
  animation: coinFloat 3s ease-in-out infinite;
  filter:
    brightness(1.35)
    saturate(1.8)
    drop-shadow(0 0 5px rgba(255, 190, 0, 0.9))
    drop-shadow(0 3px 5px rgba(180, 110, 0, 0.4));
}

@media (max-width: 640px) {
  .floating-coin {
    font-size: 23px;
  }
}
  `}</style>

  
{/* Floating Golden Coins - Staggered Layout */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">

  {/* Top Row - 6 Coins */}
  <div className="absolute left-0 right-0 top-[18%] flex justify-around px-2 sm:px-8">
    {["0s", "0.7s", "1.3s", "0.4s", "1.8s", "0.9s"].map((delay, i) => (
      <span
        key={`top-${i}`}
        className="floating-coin"
        style={{ position: "relative", animationDelay: delay }}
      >
        🪙
      </span>
    ))}
  </div>

  {/* Bottom Row - 5 Coins */}
  <div className="absolute left-0 right-0 bottom-[14%] flex justify-around px-7 sm:px-16">
    {["1.5s", "0.3s", "1.1s", "2s", "2.4s"].map((delay, i) => (
      <span
        key={`bottom-${i}`}
        className="floating-coin"
        style={{ position: "relative", animationDelay: delay }}
      >
        🪙
      </span>
    ))}
  </div>

</div>


  <div className="relative z-10 h-1.5 bg-gradient-to-r from-[#f5a313] via-[#f3bb55] to-[#ffead5]" />

  <div className="relative z-10 px-3 py-4 text-center sm:px-5 sm:py-5">
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-yellow-600 sm:text-2xl"
    >
      ClaudeInvest
    </Link>

    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
      Welcome back
    </p>

    <h1 className="mt-1 text-xl font-bold sm:text-2xl">
  {loading ? (
    <span className="inline-block animate-pulse text-gray-400">
      Loading...
    </span>
  ) : (
    `${data?.user.fullName || "User"} 👋`
  )}
</h1>

    {data?.user.premiumBadge && (
      <p className="mt-1 text-[10px] font-bold tracking-wider text-yellow-600 sm:text-xs">
        PREMIUM
      </p>
    )}
  </div>

  <div className="relative z-10 flex justify-center border-t border-yellow-100 px-2 py-2">
    <MainNav />
  </div>
</header>

          {/* Messages */}
          {error && (
            <div className="mb-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-600 sm:mb-3 sm:px-4 sm:py-3 sm:text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-600 sm:mb-3 sm:px-4 sm:py-3 sm:text-xs">
              {success}
            </div>
          )}

          {/* Account Overview */}
          <div className="mb-2.5 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-1 rounded-full bg-yellow-400 sm:h-8" />

              <div>
                <h2 className="text-sm font-bold sm:text-lg">
                  Account Overview
                </h2>

                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                  Your current account balances and activity.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

            {/* Balance */}
            <div className="relative overflow-hidden rounded-xl border border-yellow-200 bg-[#fff9ef] p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-yellow-100/70" />

              <p className="relative text-[9px] font-medium text-gray-500 sm:text-[11px]">
                Available Balance
              </p>

              <h2 className="relative mt-1 text-base font-bold text-yellow-600 sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(data?.stats.balance || 0)}
              </h2>
            </div>

            {/* Invested */}
            <div className="relative overflow-hidden rounded-xl border border-yellow-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-yellow-50" />

              <p className="relative text-[9px] font-medium text-gray-500 sm:text-[11px]">
                Total Invested
              </p>

              <h2 className="relative mt-1 text-base font-bold sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(
                      data?.stats.totalInvested || 0
                    )}
              </h2>
            </div>

            {/* Earnings */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-emerald-50" />

              <p className="relative text-[9px] font-medium text-gray-500 sm:text-[11px]">
                Total Earnings
              </p>

              <h2 className="relative mt-1 text-base font-bold text-emerald-500 sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(
                      data?.stats.totalEarnings || 0
                    )}
              </h2>
            </div>

            {/* Total Withdraw */}
            <div className="relative overflow-hidden rounded-xl border border-yellow-100 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4">
              <div className="absolute right-0 top-0 h-12 w-12 rounded-bl-full bg-yellow-50" />

              <p className="relative text-[9px] font-medium text-gray-500 sm:text-[11px]">
                Total Withdraw
              </p>

              <h2 className="relative mt-1 text-base font-bold sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(data?.stats.totalWithdraw || 0)}
              </h2>
            </div>
          </div>

          {/* Active Investments */}
          <div className="mt-4 sm:mt-6">
            <div className="mb-2.5 flex items-center justify-between sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-1 rounded-full bg-yellow-400 sm:h-8" />

                <div>
                  <h2 className="text-sm font-bold sm:text-lg">
                    Active Investments
                  </h2>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                    Your active investment plans.
                  </p>
                </div>
              </div>

              {investments.length > 0 && (
                <span className="rounded-full bg-yellow-50 px-2 py-1 text-[9px] font-bold text-yellow-700 sm:px-3 sm:text-[10px]">
                  {investments.length} Active
                </span>
              )}
            </div>

            {!loading && investments.length === 0 ? (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:rounded-3xl">
                <div className="bg-[#ffead5] px-3.5 py-5 sm:px-6 sm:py-6">
                  <div>
                    <p className="text-[10px] font-medium text-gray-600 sm:text-xs">
                      Active Investments
                    </p>

                    <h2 className="mt-1 text-base font-bold sm:text-xl">
                      No Active Investment
                    </h2>
                  </div>
                </div>

                <div className="bg-white p-3.5 sm:p-5">
                  <Link
                    href="/plans"
                    className="inline-block rounded-xl bg-gradient-to-r from-[#ffdbad] to-[#f3bb55] px-4 py-2.5 text-[11px] font-bold text-[#3d2b15] shadow-sm transition hover:from-[#ffd09a] hover:to-[#edac36] sm:px-5 sm:py-3 sm:text-xs"
                  >
                    View Investment Plans
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {investments.map((investment) => {
                  const remaining =
                    remainingSeconds[investment.id] ?? 0;

                  const collecting =
                    collectingId === investment.id;

                  const canCollect =
                    investment.status === "ACTIVE" &&
                    remaining <= 0 &&
                    !collecting;

                  return (
                    <div
                      key={investment.id}
                      className="overflow-hidden rounded-[15px] bg-white shadow-[0_3px_12px_rgba(0,0,0,0.07)] ring-1 ring-gray-100 sm:rounded-[24px]"
                    >
                      {/* Investment Card */}
                      <div className="bg-[#ffead5] px-2.5 py-3 sm:px-5 sm:py-5">

                        <p className="text-[8px] font-semibold text-gray-600 sm:text-xs">
                          DAILY INCOME
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-emerald-600 sm:text-3xl">
                          {formatMoney(investment.dailyReturn)}
                        </h2>

                        <div className="mt-4 border-t border-[#e9c9a9] pt-3 sm:mt-5 sm:pt-4">
                          <p className="text-[8px] font-medium text-gray-600 sm:text-xs">
                            MACHINE DURATION
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#171717] sm:text-xl">
                            {investment.collectedDays} / {investment.durationDays} days completed
                          </p>

                          <p className="mt-1 text-[9px] font-medium text-gray-600 sm:text-xs">
                            {investment.remainingDays} days remaining
                          </p>
                        </div>
                      </div>

                      {/* Countdown and Collect */}
                      <div className="bg-white p-2 sm:p-4">
                        <div className="rounded-xl border border-yellow-100 bg-[#fffaf2] p-2.5 text-center sm:rounded-2xl sm:p-4">

                          <p className="text-[8px] font-medium text-gray-500 sm:text-[10px]">
                            {remaining > 0
                              ? "NEXT EARNING IN"
                              : "EARNING AVAILABLE"}
                          </p>

                          <p className="mt-1 text-[13px] font-bold tabular-nums text-black sm:text-lg">
                            {formatRemaining(remaining)}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              collectEarnings(investment.id)
                            }
                            disabled={!canCollect}
                            className={`mt-3 w-full rounded-lg px-1.5 py-2.5 text-[8px] font-bold transition sm:rounded-xl sm:px-3 sm:py-3 sm:text-xs ${
                              canCollect
                                ? "bg-gradient-to-r from-[#ffdbad] to-[#f3bb55] text-[#3d2b15] shadow-sm hover:from-[#ffd09a] hover:to-[#edac36]"
                                : "cursor-not-allowed bg-gray-100 text-gray-400"
                            }`}
                          >
                            {collecting
                              ? "Collecting..."
                              : remaining > 0
                              ? "Not Ready"
                              : "Collect Earnings"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm sm:mt-6 sm:rounded-3xl">

            <div className="border-b border-yellow-100 bg-[#fffaf2] px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-yellow-400" />

                <div>
                  <h2 className="text-sm font-bold sm:text-lg">
                    Recent Transactions
                  </h2>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-[11px]">
                    Your latest account activity.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-[11px] sm:text-xs">
                <thead>
                  <tr className="border-b border-yellow-100 bg-white text-left text-[10px] text-gray-500 sm:text-[11px]">
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5">
                      Type
                    </th>

                    <th className="px-3 py-2 sm:px-4 sm:py-2.5">
                      Amount
                    </th>

                    <th className="px-3 py-2 sm:px-4 sm:py-2.5">
                      Status
                    </th>

                    <th className="px-3 py-2 sm:px-4 sm:py-2.5">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-gray-500 sm:px-4 sm:py-5"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : data?.transactions.length ? (
                    data.transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-3 py-2 text-gray-700 sm:px-4 sm:py-2.5">
                          {getTransactionName(transaction.type)}
                        </td>

                        <td className="px-3 py-2 font-medium sm:px-4 sm:py-2.5">
                          {formatMoney(transaction.amountUSD)}
                        </td>

                        <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                          <span
                            className={
                              transaction.status === "COMPLETED"
                                ? "font-medium text-emerald-500"
                                : "font-medium text-yellow-600"
                            }
                          >
                            {transaction.status}
                          </span>
                        </td>

                        <td className="px-3 py-2 text-gray-500 sm:px-4 sm:py-2.5">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-gray-500 sm:px-4 sm:py-5"
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center text-[10px] text-gray-400 sm:py-5 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
