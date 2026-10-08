"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type Investment = {
  id: string;
  amount: number;
  durationDays: number;
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
    referrals: number;
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

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

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
  const [collectingId, setCollectingId] = useState<string | null>(null);
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

  function getProgress(investment: Investment) {
    const start = new Date(
      investment.startedAt
    ).getTime();

    const end = new Date(
      investment.endsAt
    ).getTime();

    const now = Date.now();

    if (end <= start) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        ((now - start) / (end - start)) * 100
      )
    );
  }

  const investments = data?.activeInvestments || [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-black">
      <section className="w-full px-2.5 py-3 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <header className="mb-3 rounded-xl border border-yellow-100 bg-white px-3 py-3 shadow-sm sm:mb-5 sm:rounded-2xl sm:px-5 sm:py-4">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <Link
                  href="/"
                  className="text-base font-bold text-yellow-600 sm:text-xl"
                >
                  ClaudeInvest
                </Link>

                <p className="mt-1.5 text-[11px] text-gray-500 sm:mt-2 sm:text-xs">
                  Welcome back
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <h1 className="text-lg font-bold sm:text-2xl">
                    {loading
                      ? "Salman 👋"
                      : `${data?.user.fullName || "Salman"} 👋`}
                  </h1>

                  {data?.user.premiumBadge && (
                    <span className="rounded-full border border-yellow-300 bg-yellow-50 px-2 py-0.5 text-[9px] font-semibold text-yellow-700 sm:text-[10px]">
                      PREMIUM
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-gray-500 sm:text-sm">
                  Manage your investment account.
                </p>
              </div>

              <MainNav />
            </div>
          </header>

          {/* Messages */}
          {error && (
            <div className="mb-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] text-red-600 sm:mb-3 sm:rounded-xl sm:px-4 sm:py-3 sm:text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-600 sm:mb-3 sm:rounded-xl sm:px-4 sm:py-3 sm:text-xs">
              {success}
            </div>
          )}

          {/* Account Overview */}
          <div className="mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-yellow-400 sm:h-7" />

              <div>
                <h2 className="text-sm font-bold sm:text-lg">
                  Account Overview
                </h2>

                <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-xs">
                  Your current account balances and activity.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

            <div className="rounded-lg border border-yellow-200 bg-[#fffbf5] p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 sm:text-[11px]">
                  Available Balance
                </p>

                <span className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>

              <h2 className="mt-1 text-base font-bold text-yellow-600 sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(data?.stats.balance || 0)}
              </h2>
            </div>

            <div className="rounded-lg border border-yellow-100 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 sm:text-[11px]">
                  Total Invested
                </p>

                <span className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>

              <h2 className="mt-1 text-base font-bold sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(
                      data?.stats.totalInvested || 0
                    )}
              </h2>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 sm:text-[11px]">
                  Total Earnings
                </p>

                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>

              <h2 className="mt-1 text-base font-bold text-emerald-500 sm:mt-1.5 sm:text-xl">
                {loading
                  ? "$0.00"
                  : formatMoney(
                      data?.stats.totalEarnings || 0
                    )}
              </h2>
            </div>

            <div className="rounded-lg border border-yellow-100 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 sm:text-[11px]">
                  Referrals
                </p>

                <span className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>

              <h2 className="mt-1 text-base font-bold sm:mt-1.5 sm:text-xl">
                {loading
                  ? "0"
                  : data?.stats.referrals || 0}
              </h2>
            </div>
          </div>

          {/* Active Investments */}
          <div className="mt-3 sm:mt-5">
            <div className="mb-2.5 flex items-center gap-2 sm:mb-3">
              <div className="h-6 w-1 rounded-full bg-yellow-400 sm:h-7" />

              <div>
                <h2 className="text-sm font-bold sm:text-lg">
                  Active Investments
                </h2>

                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                  Manage your active investment plans.
                </p>
              </div>
            </div>

            {!loading && investments.length === 0 ? (
              <div className="overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm sm:rounded-2xl">
                <div className="bg-[#ffead5] px-3.5 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-gray-600 sm:text-xs">
                        Active Investments
                      </p>

                      <h2 className="mt-1 text-base font-bold sm:text-xl">
                        No Active Investment
                      </h2>
                    </div>

                    <span className="rounded-full border border-gray-300 bg-white/70 px-2 py-1 text-[9px] text-gray-500 sm:px-2.5 sm:text-[10px]">
                      Inactive
                    </span>
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
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {investments.map((investment, index) => {
                  const remaining =
                    remainingSeconds[investment.id] || 0;

                  const progress =
                    getProgress(investment);

                  const collecting =
                    collectingId === investment.id;

                  const canCollect =
                    investment.status === "ACTIVE" &&
                    remaining <= 0 &&
                    !collecting;

                  return (
                    <div
                      key={investment.id}
                      className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:rounded-[26px]"
                    >
                      {/* Investment Top Section */}
                      <div className="relative bg-[#ffead5]">
                        <div className="absolute left-0 top-0 rounded-br-[16px] bg-gradient-to-r from-[#f5a313] to-[#e9a62e] px-4 py-2 text-[10px] font-bold text-white shadow-sm sm:px-6 sm:py-3 sm:text-sm">
                          Active Investment
                        </div>

                        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#d09b36] bg-[#f5d58a] text-base font-bold text-[#765619] sm:right-5 sm:top-5 sm:h-12 sm:w-12 sm:text-xl">
                          {index + 1}
                        </div>

                        <div className="px-4 pb-5 pt-16 sm:px-7 sm:pb-7 sm:pt-20">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-[11px] font-medium text-gray-600 sm:text-sm">
                                Investment Amount
                              </p>

                              <h2 className="mt-1 text-[30px] font-bold leading-none text-[#171717] sm:text-4xl">
                                {formatMoney(
                                  investment.amount
                                )}
                              </h2>
                            </div>

                            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700 sm:px-3 sm:py-1.5 sm:text-xs">
                              {investment.status}
                            </span>
                          </div>

                          {/* Details */}
                          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:mt-6 sm:grid-cols-4 sm:gap-x-8">
                            <div>
                              <p className="text-[11px] text-gray-600 sm:text-sm">
                                Daily income
                              </p>

                              <p className="mt-1 text-lg font-bold text-[#171717] sm:text-2xl">
                                {formatMoney(
                                  investment.dailyReturn
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-gray-600 sm:text-sm">
                                Contract period
                              </p>

                              <p className="mt-1 text-lg font-bold text-[#171717] sm:text-2xl">
                                {investment.durationDays} Days
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-gray-600 sm:text-sm">
                                Status
                              </p>

                              <p className="mt-1 text-lg font-bold text-emerald-600 sm:text-2xl">
                                Active
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-gray-600 sm:text-sm">
                                Progress
                              </p>

                              <p className="mt-1 text-lg font-bold text-[#171717] sm:text-2xl">
                                {Math.round(progress)}%
                              </p>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="mt-5 sm:mt-6">
                            <div className="mb-1.5 flex justify-between text-[9px] sm:mb-2 sm:text-[11px]">
                              <span className="font-medium text-gray-600">
                                Investment Progress
                              </span>

                              <span className="font-semibold text-gray-700">
                                {Math.round(progress)}%
                              </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-white/80 sm:h-2.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#f5a313] to-[#f3bb55] transition-all"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Earnings Bottom Section */}
                      <div className="bg-white p-3.5 sm:p-6">
                        <div className="rounded-2xl border border-yellow-100 bg-[#fffbf5] p-3 sm:rounded-2xl sm:p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div>
                              <p className="text-[9px] font-medium text-gray-500 sm:text-xs">
                                Daily Earnings
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-emerald-500 sm:text-2xl">
                                {formatMoney(
                                  investment.dailyReturn
                                )}
                              </p>

                              <p className="mt-1 text-[9px] text-gray-500 sm:text-[11px]">
                                {remaining > 0
                                  ? "Next earning available in"
                                  : "Your earning is ready to collect"}
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-black sm:mt-1 sm:text-sm">
                                {formatRemaining(
                                  remaining
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                collectEarnings(
                                  investment.id
                                )
                              }
                              disabled={!canCollect}
                              className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold transition sm:w-auto sm:min-w-[175px] sm:px-5 sm:py-3 ${
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="mt-4 overflow-hidden rounded-lg border border-yellow-100 bg-white shadow-sm sm:mt-5 sm:rounded-xl">
            <div className="border-b border-yellow-100 bg-[#fffbf5] px-3 py-2.5 sm:px-5 sm:py-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-yellow-400" />

                <div>
                  <h2 className="text-sm font-bold sm:text-lg">
                    Recent Transactions
                  </h2>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:mt-1 sm:text-[11px]">
                    Your latest account activity.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-[11px] sm:text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-white text-left text-[10px] text-gray-500 sm:text-[11px]">
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
                    data.transactions.map(
                      (transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-3 py-2 text-gray-700 sm:px-4 sm:py-2.5">
                            {getTransactionName(
                              transaction.type
                            )}
                          </td>

                          <td className="px-3 py-2 font-medium sm:px-4 sm:py-2.5">
                            {formatMoney(
                              transaction.amountUSD
                            )}
                          </td>

                          <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                            <span
                              className={
                                transaction.status ===
                                "COMPLETED"
                                  ? "font-medium text-emerald-500"
                                  : "font-medium text-yellow-600"
                              }
                            >
                              {transaction.status}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-gray-500 sm:px-4 sm:py-2.5">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </td>
                        </tr>
                      )
                    )
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