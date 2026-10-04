
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

const filters = [
  "All",
  "Deposits",
  "Withdrawals",
  "Earnings",
  "Referrals",
];

type Transaction = {
  id: string;
  type: string;
  status: string;
  amountUSD: string | number;
  balanceBefore: string | number;
  balanceAfter: string | number;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
};

export default function TransactionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/transactions", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load transactions.");
          return;
        }

        setTransactions(data.transactions || []);
      } catch {
        setError("Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === "All") {
      return transactions;
    }

    if (activeFilter === "Deposits") {
      return transactions.filter(
        (transaction) => transaction.type === "DEPOSIT"
      );
    }

    if (activeFilter === "Withdrawals") {
      return transactions.filter(
        (transaction) =>
          transaction.type === "WITHDRAWAL" ||
          transaction.type === "WITHDRAWAL_FEE"
      );
    }

    if (activeFilter === "Earnings") {
      return transactions.filter(
        (transaction) => transaction.type === "EARNING"
      );
    }

    if (activeFilter === "Referrals") {
      return transactions.filter(
        (transaction) => transaction.type === "REFERRAL_COMMISSION"
      );
    }

    return transactions;
  }, [activeFilter, transactions]);

  const summary = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    let earnings = 0;
    let referrals = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amountUSD) || 0;

      if (transaction.status !== "COMPLETED") {
        continue;
      }

      if (transaction.type === "DEPOSIT") {
        deposits += amount;
      }

      if (
        transaction.type === "WITHDRAWAL" ||
        transaction.type === "WITHDRAWAL_FEE"
      ) {
        withdrawals += amount;
      }

      if (transaction.type === "EARNING") {
        earnings += amount;
      }

      if (transaction.type === "REFERRAL_COMMISSION") {
        referrals += amount;
      }
    }

    return {
      deposits,
      withdrawals,
      earnings,
      referrals,
    };
  }, [transactions]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 pb-24 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-cyan-400 sm:text-2xl"
          >
            ClaudeInvest
          </Link>

          <MainNav />
        </div>
      </header>

      <section className="px-4 py-7 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-6xl">

          {/* Intro */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Account Activity
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Transaction History
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review your deposits, withdrawals, earnings and referral
                activity.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="w-fit rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Deposits"
              value={`$${summary.deposits.toFixed(2)}`}
              icon="+"
            />

            <SummaryCard
              label="Withdrawals"
              value={`$${summary.withdrawals.toFixed(2)}`}
              icon="−"
            />

            <SummaryCard
              label="Earnings"
              value={`$${summary.earnings.toFixed(2)}`}
              icon="↗"
            />

            <SummaryCard
              label="Referrals"
              value={`$${summary.referrals.toFixed(2)}`}
              icon="♧"
            />
          </div>

          {/* Filters */}
          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => {
                const active = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                      active
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-950 text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Transaction List */}
          <section className="mt-4 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    {activeFilter === "All"
                      ? "All Transactions"
                      : activeFilter}
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-600">
                    Your account activity is shown from the transaction ledger.
                  </p>
                </div>

                <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[10px] text-slate-600">
                  {filteredTransactions.length}{" "}
                  {filteredTransactions.length === 1 ? "Record" : "Records"}
                </span>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center px-5 py-12 text-center">
                <p className="text-xs text-slate-500">
                  Loading transactions...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex min-h-[300px] items-center justify-center px-5 py-12 text-center">
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Unable to load transactions
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading &&
              !error &&
              filteredTransactions.length === 0 && (
                <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-2xl text-slate-700">
                    ↯
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-slate-300">
                    No Transactions Yet
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">
                    Once account activity is recorded, your transaction history
                    will appear here with its amount, type, status and date.
                  </p>

                  <Link
                    href="/deposit"
                    className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Go to Deposit
                  </Link>
                </div>
              )}

            {/* Transactions */}
            {!loading &&
              !error &&
              filteredTransactions.length > 0 && (
                <div className="divide-y divide-slate-800">
                  {filteredTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </div>
              )}
          </section>

          {/* Transaction Information */}
          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Deposits"
              text="Approved deposits are recorded with their transaction details."
            />

            <InfoCard
              title="Withdrawals"
              text="Withdrawal transactions show their amount, fee and status."
            />

            <InfoCard
              title="Earnings & Referrals"
              text="Earnings and referral commissions are tracked separately."
            />
          </section>

          {/* Footer */}
          <div className="py-6 text-center text-[10px] text-slate-600 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  const amount = Number(transaction.amountUSD) || 0;

  const creditTypes = [
    "DEPOSIT",
    "EARNING",
    "REFERRAL_COMMISSION",
    "REWARD",
  ];

  const isCredit = creditTypes.includes(transaction.type);

  const typeLabel = transaction.type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const statusLabel = transaction.status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const date = new Date(transaction.createdAt);

  return (
    <div className="px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              isCredit
                ? "bg-emerald-400/10 text-emerald-400"
                : "bg-red-400/10 text-red-400"
            }`}
          >
            {isCredit ? "+" : "−"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {transaction.description || typeLabel}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              {typeLabel}
              {" · "}
              {date.toLocaleString()}
            </p>

            {transaction.referenceId && (
              <p className="mt-1 truncate text-[10px] text-slate-700">
                Ref: {transaction.referenceId}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-bold ${
              isCredit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isCredit ? "+" : "-"}${amount.toFixed(2)}
          </p>

          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] ${
              transaction.status === "COMPLETED"
                ? "bg-emerald-400/10 text-emerald-400"
                : transaction.status === "PENDING"
                  ? "bg-amber-400/10 text-amber-400"
                  : "bg-red-400/10 text-red-400"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-slate-600">
          {label}
        </p>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-950 text-xs text-cyan-400">
          {icon}
        </span>
      </div>

      <p className="mt-3 text-lg font-bold sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
      <h3 className="text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-600">
        {text}
      </p>
    </div>
  );
}