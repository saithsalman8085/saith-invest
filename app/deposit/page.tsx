
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";

type DepositSettings = {
  paymentMethod: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  exchangeRate: string;
};

type DepositRecord = {
  id: string;
  amountPKR: string | number;
  creditAmountUSD: string | number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  submittedAt: string;
  rejectionReason?: string | null;
};

const DEFAULT_SETTINGS: DepositSettings = {
  paymentMethod: "Easypaisa",
  accountName: "ClaudeInvest",
  accountNumber: "",
  instructions:
    "Send payment to the account above and enter your transaction ID.",
  exchangeRate: "300",
};

export default function DepositPage() {
  const [settings, setSettings] =
    useState<DepositSettings>(DEFAULT_SETTINGS);

  const [amountPKR, setAmountPKR] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDepositSettings();
    loadDeposits();
  }, []);

  async function loadDepositSettings() {
    try {
      setLoadingSettings(true);

      const response = await fetch("/api/deposit-settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load payment details."
        );
      }

      setSettings({
        paymentMethod:
          data.settings.paymentMethod || "Easypaisa",

        accountName:
          data.settings.accountName || "ClaudeInvest",

        accountNumber:
          data.settings.accountNumber || "",

        instructions:
          data.settings.instructions ||
          "Send payment to the account above and enter your transaction ID.",

        exchangeRate:
          data.settings.exchangeRate || "300",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment details."
      );
    } finally {
      setLoadingSettings(false);
    }
  }

  async function loadDeposits() {
    try {
      setLoadingDeposits(true);

      const response = await fetch("/api/deposit", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load deposits."
        );
      }

      setDeposits(data.deposits || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load deposits."
      );
    } finally {
      setLoadingDeposits(false);
    }
  }

  const rate = Number(settings.exchangeRate) || 300;

  const usdAmount = useMemo(() => {
    const pkr = Number(amountPKR);

    if (!Number.isFinite(pkr) || pkr <= 0) {
      return "0.00";
    }

    return (pkr / rate).toFixed(2);
  }, [amountPKR, rate]);

  async function submitDeposit() {
    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const pkr = Number(amountPKR);

      if (!Number.isFinite(pkr) || pkr <= 0) {
        setError("Please enter a valid deposit amount.");
        return;
      }

      if (!transactionId.trim()) {
        setError("Please enter your transaction ID.");
        return;
      }

      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPKR: pkr,
          transactionId: transactionId.trim(),
          paymentMethod: settings.paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit deposit."
        );
      }

      setMessage(
        "Deposit submitted successfully. It is now pending admin approval."
      );

      setAmountPKR("");
      setTransactionId("");

      await loadDeposits();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit deposit."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(value: string) {
    try {
      return new Date(value).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  }

  function statusClass(status: string) {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-2.5 py-4 pb-24 sm:px-6 sm:py-8 lg:px-8">

        {/* HEADER */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="hidden text-sm text-cyan-400 hover:text-cyan-300 md:inline-block"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-1 text-2xl font-bold sm:mt-3 sm:text-3xl">
              Wallet
            </h1>

            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
              Add funds to your ClaudeInvest wallet.
            </p>
          </div>

          <Link
            href="/withdraw"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold transition hover:border-cyan-500 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            Go to Withdrawal
          </Link>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400 sm:mb-6 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400 sm:mb-6 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {/* PAYMENT + DEPOSIT */}
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-2">

          {/* PAYMENT DETAILS */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl sm:rounded-2xl sm:p-6">
            <h2 className="text-base font-semibold sm:text-xl">
              Payment Details
            </h2>

            <p className="mt-1 text-[10px] text-slate-400 sm:mt-2 sm:text-sm">
              Send your payment using the details below.
            </p>

            {loadingSettings ? (
              <div className="mt-5 text-xs text-slate-500 sm:mt-8 sm:text-sm">
                Loading payment details...
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-4">

                <InfoBox
                  label="Payment Method"
                  value={settings.paymentMethod}
                />

                <InfoBox
                  label="Account Name"
                  value={settings.accountName}
                />

                <InfoBox
                  label="Account Number"
                  value={
                    settings.accountNumber ||
                    "Payment number not configured yet."
                  }
                  copyable={Boolean(settings.accountNumber)}
                />

                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 sm:rounded-xl sm:p-4">
                  <p className="text-[9px] font-medium uppercase tracking-wide text-cyan-400 sm:text-xs">
                    Instructions
                  </p>

                  <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-5 text-slate-300 sm:mt-2 sm:text-sm sm:leading-6">
                    {settings.instructions}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 sm:rounded-xl sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 sm:text-sm">
                      Exchange Rate
                    </span>

                    <span className="text-xs font-semibold text-white sm:text-sm">
                      1 USD = {rate} PKR
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* DEPOSIT FORM */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-xl sm:rounded-2xl sm:p-6">
            <h2 className="text-base font-semibold sm:text-xl">
              Submit Deposit
            </h2>

            <p className="mt-1 text-[10px] text-slate-400 sm:mt-2 sm:text-sm">
              Enter the amount you sent and your transaction ID.
            </p>

            <div className="mt-4 space-y-3.5 sm:mt-6 sm:space-y-5">

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-300 sm:mb-2 sm:text-sm">
                  Deposit Amount (PKR)
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountPKR}
                  onChange={(e) => setAmountPKR(e.target.value)}
                  placeholder="5000"
                  className={inputClass}
                />
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 sm:rounded-xl sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 sm:text-sm">
                    Wallet Credit
                  </span>

                  <span className="text-lg font-bold text-cyan-400 sm:text-xl">
                    ${usdAmount}
                  </span>
                </div>

                <p className="mt-1 text-[9px] text-slate-500 sm:mt-2 sm:text-xs">
                  Based on 1 USD = {rate} PKR
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-300 sm:mb-2 sm:text-sm">
                  Transaction ID
                </label>

                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter payment transaction ID"
                  className={inputClass}
                />
              </div>

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 sm:rounded-xl sm:p-4">
                <p className="text-xs font-medium text-yellow-400 sm:text-sm">
                  Important
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                  Make the payment first, then submit the exact transaction ID
                  here. Your wallet is credited after admin approval.
                </p>
              </div>

              <button
                type="button"
                onClick={submitDeposit}
                disabled={submitting}
                className="w-full rounded-lg bg-cyan-500 px-5 py-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-xl sm:px-6 sm:py-3.5 sm:text-sm"
              >
                {submitting ? "Submitting..." : "Submit Deposit"}
              </button>
            </div>
          </section>
        </div>

        {/* DEPOSIT HISTORY */}
        <section className="mt-2 rounded-lg border border-slate-800 bg-slate-900 p-2.5 shadow-xl sm:mt-6 sm:rounded-2xl sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold sm:text-xl">
                Deposit History
              </h2>

              <p className="mt-0.5 text-[9px] text-slate-400 sm:mt-1 sm:text-sm">
                Track your submitted deposits and approval status.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDeposits}
              className="shrink-0 rounded-md border border-slate-700 px-2.5 py-1.5 text-[9px] text-slate-300 hover:border-cyan-500 hover:text-white sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm"
            >
              Refresh
            </button>
          </div>

          {loadingDeposits ? (
            <div className="py-4 text-center text-[10px] text-slate-500 sm:py-10 sm:text-sm">
              Loading deposit history...
            </div>
          ) : deposits.length === 0 ? (
            <div className="py-4 text-center text-[10px] text-slate-500 sm:py-10 sm:text-sm">
              No deposits submitted yet.
            </div>
          ) : (
            <>
              {/* MOBILE HISTORY */}
              <div className="mt-2 space-y-1.5 sm:hidden">
                {deposits.map((deposit) => (
                  <div
                    key={deposit.id}
                    className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-2"
                  >
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div>
                        <p className="text-[7px] uppercase text-slate-600">
                          Date
                        </p>

                        <p className="mt-0.5 text-[9px] text-slate-400">
                          {formatDate(deposit.submittedAt)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[7px] uppercase text-slate-600">
                          Status
                        </p>

                        <span
                          className={`mt-0.5 inline-flex rounded-full border px-1.5 py-0.5 text-[8px] font-medium ${statusClass(
                            deposit.status
                          )}`}
                        >
                          {deposit.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-[7px] uppercase text-slate-600">
                          Amount
                        </p>

                        <p className="mt-0.5 text-[9px] font-semibold text-white">
                          {Number(
                            deposit.amountPKR
                          ).toLocaleString()}{" "}
                          PKR
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[7px] uppercase text-slate-600">
                          USD Credit
                        </p>

                        <p className="mt-0.5 text-[9px] font-semibold text-cyan-400">
                          $
                          {Number(
                            deposit.creditAmountUSD
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p className="text-[7px] uppercase text-slate-600">
                          Transaction ID
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-slate-400">
                          {deposit.transactionId}
                        </p>
                      </div>

                      {deposit.status.toUpperCase() === "REJECTED" &&
                        deposit.rejectionReason && (
                          <div className="col-span-2 rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1.5">
                            <p className="text-[7px] font-semibold uppercase text-red-400">
                              Rejection Reason
                            </p>

                            <p className="mt-0.5 text-[9px] leading-3 text-slate-300">
                              {deposit.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP HISTORY */}
              <div className="mt-6 hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">
                        Date
                      </th>

                      <th className="px-4 py-3">
                        Amount
                      </th>

                      <th className="px-4 py-3">
                        USD Credit
                      </th>

                      <th className="px-4 py-3">
                        Transaction ID
                      </th>

                      <th className="px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {deposits.map((deposit) => (
                      <tr
                        key={deposit.id}
                        className="border-b border-slate-800/70"
                      >
                        <td className="px-4 py-4 text-sm text-slate-400">
                          {formatDate(deposit.submittedAt)}
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {Number(
                            deposit.amountPKR
                          ).toLocaleString()}{" "}
                          PKR
                        </td>

                        <td className="px-4 py-4 font-semibold text-cyan-400">
                          $
                          {Number(
                            deposit.creditAmountUSD
                          ).toFixed(2)}
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-400">
                          {deposit.transactionId}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                                deposit.status
                              )}`}
                            >
                              {deposit.status}
                            </span>

                            {deposit.status.toUpperCase() ===
                              "REJECTED" &&
                              deposit.rejectionReason && (
                                <div className="max-w-xs rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-400">
                                    Rejection Reason
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-300">
                                    {deposit.rejectionReason}
                                  </p>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none transition focus:border-cyan-500 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm";

function InfoBox({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  async function copyValue() {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 sm:rounded-xl sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          {label}
        </p>

        {copyable && (
          <button
            type="button"
            onClick={copyValue}
            className="text-[10px] font-medium text-cyan-400 hover:text-cyan-300 sm:text-xs"
          >
            Copy
          </button>
        )}
      </div>

      <p className="mt-1.5 break-all text-xs font-semibold text-white sm:mt-2 sm:text-sm">
        {value}
      </p>
    </div>
  );
}