"use client";

import { useEffect, useMemo, useState } from "react";

type Transaction = {
  id: string;
  userId: string;
  type: string;
  status: string;
  amountUSD: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string | null;
  description: string | null;
  depositId: string | null;
  withdrawalId: string | null;
  createdAt: string;
};

const INCOMING_TYPES = new Set([
  "DEPOSIT",
  "WITHDRAWAL_FEE",
  "ADMIN_ADJUSTMENT",
]);

const OUTGOING_TYPES = new Set([
  "DAILY_EARNING",
  "REFERRAL_COMMISSION",
  "ACTIVE_USER_REWARD",
  "WITHDRAWAL",
]);

function isIncoming(transaction: Transaction) {
  if (transaction.type === "ADMIN_ADJUSTMENT") {
    return Number(transaction.amountUSD) >= 0;
  }

  return INCOMING_TYPES.has(transaction.type);
}

function formatType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadTransactions(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/transactions", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load transactions");
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid transaction data");
      }

      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError("Transactions load nahi ho sakin.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const TRANSACTION_SUMMARY_RESET_AT =
  "2026-10-10T11:32:00+05:00";

  const totals = useMemo(() => {
  let moneyIn = 0;
  let moneyOut = 0;

  const resetTime = new Date(
    TRANSACTION_SUMMARY_RESET_AT
  ).getTime();

  for (const transaction of transactions) {
    if (transaction.status === "REVERSED") continue;

    const transactionTime = new Date(
      transaction.createdAt
    ).getTime();

    // Old transactions remain visible in history,
    // but they are not included in the summary totals.
    if (
      !Number.isFinite(transactionTime) ||
      transactionTime <= resetTime
    ) {
      continue;
    }

    const amount = Math.abs(
      Number(transaction.amountUSD) || 0
    );

    if (isIncoming(transaction)) {
      moneyIn += amount;
    } else if (OUTGOING_TYPES.has(transaction.type)) {
      moneyOut += amount;
    }
  }

  return {
    moneyIn,
    moneyOut,
    netFlow: moneyIn - moneyOut,
  };
}, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.userId.toLowerCase().includes(query) ||
        (transaction.description ?? "").toLowerCase().includes(query) ||
        (transaction.referenceId ?? "").toLowerCase().includes(query);

      const matchesType =
        typeFilter === "ALL" || transaction.type === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" || transaction.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const transactionTypes = useMemo(
    () => [...new Set(transactions.map((transaction) => transaction.type))],
    [transactions]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <a
              href="/"
              className="text-2xl font-bold text-cyan-400"
            >
              ClaudeInvest
            </a>

            <p className="mt-1 text-xs text-slate-500">
              ADMIN PANEL
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Admin Dashboard
          </a>
        </div>
      </header>

      <section className="px-5 py-10">
        <div className="mx-auto max-w-7xl">

          {/* Intro */}
          <div className="mb-8">
            <p className="text-sm text-cyan-400">
              Administrator
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Transactions
            </h1>

            <p className="mt-2 text-slate-400">
              Review the platform transaction ledger.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryCard
              title="Total Money In"
              amount={totals.moneyIn}
              accent="green"
            />

            <SummaryCard
              title="Total Money Out"
              amount={totals.moneyOut}
              accent="red"
            />

            <SummaryCard
              title="Net Flow"
              amount={totals.netFlow}
              accent={totals.netFlow >= 0 ? "cyan" : "orange"}
            />
          </div>

          {/* Filters */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="grid gap-4 md:grid-cols-3">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transaction, user ID..."
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Types</option>

                {transactionTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatType(type)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="REVERSED">Reversed</option>
              </select>

            </div>
          </div>

          {/* History Header */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Transaction History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredTransactions.length} transactions
              </p>
            </div>

            <button
              onClick={() => loadTransactions(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-cyan-400 transition hover:border-cyan-500/40 hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-500">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-sm text-slate-500">
              No transactions found.
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-800 bg-slate-950">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Transaction
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          User
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Type
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Amount
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                      {filteredTransactions.map((transaction) => {
                        const incoming = isIncoming(transaction);
                        const amount = Math.abs(
                          Number(transaction.amountUSD) || 0
                        );

                        return (
                          <tr
                            key={transaction.id}
                            className="transition hover:bg-slate-800/40"
                          >
                            <td className="px-5 py-4">
                              <p className="max-w-xs truncate text-sm font-semibold text-white">
                                {transaction.description || "Transaction"}
                              </p>

                              <p className="mt-1 max-w-xs truncate text-xs text-slate-600">
                                {transaction.id}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-400">
                              {transaction.userId}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-400">
                                {formatType(transaction.type)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-bold ${
                                  incoming
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {incoming ? "+" : "-"}$
                                {amount.toFixed(2)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={transaction.status} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-4 space-y-3 lg:hidden">
                {filteredTransactions.map((transaction) => {
                  const incoming = isIncoming(transaction);
                  const amount = Math.abs(
                    Number(transaction.amountUSD) || 0
                  );

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {transaction.description || "Transaction"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-600">
                            {transaction.id}
                          </p>
                        </div>

                        <span
                          className={`whitespace-nowrap text-base font-bold ${
                            incoming
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {incoming ? "+" : "-"}$
                          {amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-600">User</p>
                          <p className="mt-1 truncate text-slate-400">
                            {transaction.userId}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-600">Type</p>
                          <p className="mt-1 text-slate-400">
                            {formatType(transaction.type)}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-600">Status</p>
                          <div className="mt-1">
                            <StatusBadge status={transaction.status} />
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-600">Date</p>
                          <p className="mt-1 text-slate-400">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="py-8 text-center text-xs text-slate-600">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  amount,
  accent,
}: {
  title: string;
  amount: number;
  accent: "green" | "red" | "cyan" | "orange";
}) {
  const valueClass =
    accent === "green"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-red-400"
        : accent === "orange"
          ? "text-orange-400"
          : "text-cyan-400";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>
        {amount < 0 ? "-" : ""}${Math.abs(amount).toFixed(2)}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    COMPLETED:
      "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    PENDING:
      "border border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    REVERSED:
      "border border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "border border-slate-700 bg-slate-950 text-slate-400"
      }`}
    >
      {status}
    </span>
  );
}