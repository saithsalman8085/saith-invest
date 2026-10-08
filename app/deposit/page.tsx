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
        return "bg-emerald-50 text-emerald-600 border-emerald-200";

      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-200";

      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] text-black">
      <div className="mx-auto max-w-6xl px-2.5 py-4 pb-24 sm:px-6 sm:py-8 lg:px-8">

        {/* HEADER */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-yellow-600 hover:text-yellow-700 md:inline-block"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-1 text-2xl font-bold sm:mt-3 sm:text-3xl">
              Wallet
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
              Add funds to your ClaudeInvest wallet.
            </p>
          </div>

          <Link
            href="/withdraw"
            className="rounded-xl border border-yellow-400 bg-yellow-50 px-4 py-2.5 text-center text-xs font-semibold text-yellow-800 transition hover:bg-yellow-400 hover:text-black sm:px-5 sm:py-3 sm:text-sm"
          >
            Go to Withdrawal
          </Link>
        </div>

        {/* SIMPLE DEPOSIT GUIDE */}
        <div className="mb-4 rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 via-[#fff8df] to-orange-50 p-3 shadow-sm sm:mb-6 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black">
              $
            </div>

            <div>
              <h2 className="text-sm font-bold text-black sm:text-base">
                How to Deposit
              </h2>

              <p className="text-[10px] text-gray-600 sm:text-xs">
                Follow these simple steps to add money to your wallet.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <GuideStep
              number="1"
              title="Make Payment"
              text="Send payment to the account below."
            />

            <GuideStep
              number="2"
              title="Enter Amount"
              text="Enter the exact PKR amount sent."
            />

            <GuideStep
              number="3"
              title="Transaction ID"
              text="Enter the payment transaction ID."
            />

            <GuideStep
              number="4"
              title="Submit"
              text="Submit and wait for approval."
            />
          </div>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-600 sm:mb-6 sm:px-4 sm:py-4 sm:text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600 sm:mb-6 sm:px-4 sm:py-4 sm:text-sm">
            {error}
          </div>
        )}

        {/* PAYMENT + DEPOSIT */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">

          {/* PAYMENT DETAILS */}
          <section className="overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-sm">
            <div className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-bold text-black shadow-sm">
                  $
                </div>

                <div>
                  <h2 className="text-base font-bold sm:text-xl">
                    Payment Details
                  </h2>

                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-sm">
                    Send your payment using the details below.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-6">
              {loadingSettings ? (
                <div className="py-5 text-xs text-gray-400 sm:py-8 sm:text-sm">
                  Loading payment details...
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">

                  <InfoBox
                    label="Payment Method"
                    value={settings.paymentMethod}
                    highlight
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
                    highlight
                  />

                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-yellow-700 sm:text-xs">
                      Instructions
                    </p>

                    <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-5 text-gray-700 sm:mt-2 sm:text-sm sm:leading-6">
                      {settings.instructions}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-medium text-gray-500 sm:text-sm">
                        Exchange Rate
                      </span>

                      <span className="text-xs font-bold text-black sm:text-sm">
                        1 USD = {rate} PKR
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* DEPOSIT FORM */}
          <section className="overflow-hidden rounded-2xl border-2 border-yellow-300 bg-white shadow-[0_5px_25px_rgba(234,179,8,0.12)]">

            {/* FORM HEADER */}
            <div className="border-b border-yellow-200 bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-lg font-bold text-black shadow-sm">
                  +
                </div>

                <div>
                  <h2 className="text-lg font-bold sm:text-2xl">
                    Submit Deposit
                  </h2>

                  <p className="mt-1 text-[10px] leading-4 text-gray-600 sm:text-sm sm:leading-5">
                    Enter your payment amount and transaction ID here.
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-yellow-300 bg-white/70 px-3 py-2.5 sm:mt-4 sm:px-4 sm:py-3">
                <p className="text-[10px] font-semibold text-yellow-800 sm:text-xs">
                  ⚠ Make sure the transaction ID belongs to the payment you just sent.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6">

              <div className="space-y-5 sm:space-y-6">

                {/* AMOUNT */}
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-800 sm:text-sm">
                    Deposit Amount (PKR)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amountPKR}
                    onChange={(e) => setAmountPKR(e.target.value)}
                    placeholder="Enter amount e.g. 5000"
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-[9px] text-gray-400 sm:text-xs">
                    Enter the exact amount that you sent.
                  </p>
                </div>

                {/* USD CREDIT */}
                <div className="rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-700 sm:text-xs">
                        Wallet Credit
                      </p>

                      <p className="mt-1 text-[9px] text-gray-500 sm:text-xs">
                        Amount you will receive after approval
                      </p>
                    </div>

                    <span className="text-xl font-extrabold text-yellow-600 sm:text-2xl">
                      ${usdAmount}
                    </span>
                  </div>

                  <p className="mt-2 border-t border-yellow-200 pt-2 text-[9px] text-gray-500 sm:mt-3 sm:pt-3 sm:text-xs">
                    Based on 1 USD = {rate} PKR
                  </p>
                </div>

                {/* TRANSACTION ID */}
                <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50/50 p-3.5 sm:p-4">
                  <label className="mb-2 block text-xs font-bold text-gray-900 sm:text-sm">
                    Transaction ID
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <p className="mb-2.5 text-[10px] leading-4 text-gray-600 sm:text-xs sm:leading-5">
                    Copy the transaction ID from your payment app and paste it below.
                  </p>

                  <input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter payment transaction ID"
                    className={inputClass}
                  />

                  <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-white px-2.5 py-2">
                    <span className="text-xs text-yellow-600">
                      ✓
                    </span>

                    <p className="text-[9px] leading-4 text-gray-500 sm:text-xs">
                      This ID is used by admin to verify your payment.
                    </p>
                  </div>
                </div>

                {/* IMPORTANT */}
                <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3.5 sm:p-4">
                  <p className="text-xs font-bold text-yellow-800 sm:text-sm">
                    Important
                  </p>

                  <p className="mt-1.5 text-[10px] leading-4 text-gray-700 sm:text-xs sm:leading-5">
                    Make the payment first, then enter the exact amount and
                    transaction ID here. Your wallet is credited after admin approval.
                  </p>
                </div>

                {/* SUBMIT */}
                <button
                  type="button"
                  onClick={submitDeposit}
                  disabled={submitting}
                  className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-bold text-black shadow-md shadow-yellow-200 transition hover:bg-yellow-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Deposit"}
                </button>

                <p className="text-center text-[9px] text-gray-400 sm:text-xs">
                  Your deposit will remain pending until approved by admin.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* DEPOSIT HISTORY */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm sm:mt-6">
          <div className="flex items-center justify-between gap-2 border-b border-yellow-100 bg-yellow-50/60 p-3 sm:p-6">
            <div>
              <h2 className="text-sm font-bold sm:text-xl">
                Deposit History
              </h2>

              <p className="mt-0.5 text-[9px] text-gray-500 sm:mt-1 sm:text-sm">
                Track your submitted deposits and approval status.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDeposits}
              className="shrink-0 rounded-lg border border-yellow-300 bg-white px-2.5 py-1.5 text-[9px] font-medium text-gray-600 hover:bg-yellow-50 hover:text-black sm:px-4 sm:py-2 sm:text-sm"
            >
              Refresh
            </button>
          </div>

          <div className="p-2.5 sm:p-6">
            {loadingDeposits ? (
              <div className="py-4 text-center text-[10px] text-gray-400 sm:py-10 sm:text-sm">
                Loading deposit history...
              </div>
            ) : deposits.length === 0 ? (
              <div className="rounded-xl bg-gray-50 py-6 text-center text-[10px] text-gray-400 sm:py-10 sm:text-sm">
                No deposits submitted yet.
              </div>
            ) : (
              <>
                {/* MOBILE HISTORY */}
                <div className="space-y-2 sm:hidden">
                  {deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-2.5 sm:border-gray-200 sm:bg-gray-50"
                    >
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div>
                          <p className="text-[7px] uppercase text-gray-400">
                            Date
                          </p>

                          <p className="mt-0.5 text-[9px] text-gray-600">
                            {formatDate(deposit.submittedAt)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[7px] uppercase text-gray-400">
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
                          <p className="text-[7px] uppercase text-gray-400">
                            Amount
                          </p>

                          <p className="mt-0.5 text-[9px] font-semibold text-black">
                            {Number(
                              deposit.amountPKR
                            ).toLocaleString()}{" "}
                            PKR
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[7px] uppercase text-gray-400">
                            USD Credit
                          </p>

                          <p className="mt-0.5 text-[9px] font-semibold text-yellow-600">
                            $
                            {Number(
                              deposit.creditAmountUSD
                            ).toFixed(2)}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[7px] uppercase text-gray-400">
                            Transaction ID
                          </p>

                          <p className="mt-0.5 truncate text-[9px] text-gray-600">
                            {deposit.transactionId}
                          </p>
                        </div>

                        {deposit.status.toUpperCase() === "REJECTED" &&
                          deposit.rejectionReason && (
                            <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5">
                              <p className="text-[7px] font-semibold uppercase text-red-600">
                                Rejection Reason
                              </p>

                              <p className="mt-0.5 text-[9px] leading-3 text-gray-600">
                                {deposit.rejectionReason}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP HISTORY */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[650px] text-left">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
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
                          className="border-b border-gray-100"
                        >
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatDate(deposit.submittedAt)}
                          </td>

                          <td className="px-4 py-4 font-medium text-black">
                            {Number(
                              deposit.amountPKR
                            ).toLocaleString()}{" "}
                            PKR
                          </td>

                          <td className="px-4 py-4 font-semibold text-yellow-600">
                            $
                            {Number(
                              deposit.creditAmountUSD
                            ).toFixed(2)}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
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
                                  <div className="max-w-xs rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
                                      Rejection Reason
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-gray-600">
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
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-3.5 py-3 text-xs font-medium text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 sm:px-4 sm:py-3.5 sm:text-sm";

function InfoBox({
  label,
  value,
  copyable = false,
  highlight = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
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
    <div
      className={`rounded-xl border p-3 sm:p-4 ${
        highlight
          ? "border-yellow-200 bg-yellow-50/70"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-[9px] font-bold uppercase tracking-wide sm:text-xs ${
            highlight
              ? "text-yellow-700"
              : "text-gray-400"
          }`}
        >
          {label}
        </p>

        {copyable && (
          <button
            type="button"
            onClick={copyValue}
            className="rounded-md bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-700 hover:bg-yellow-200 sm:text-xs"
          >
            Copy
          </button>
        )}
      </div>

      <p className="mt-1.5 break-all text-xs font-bold text-black sm:mt-2 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

function GuideStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-yellow-200 bg-white p-2.5 sm:p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black sm:h-7 sm:w-7 sm:text-xs">
          {number}
        </div>

        <p className="text-[10px] font-bold text-black sm:text-xs">
          {title}
        </p>
      </div>

      <p className="mt-1.5 text-[8px] leading-3 text-gray-500 sm:text-[10px] sm:leading-4">
        {text}
      </p>
    </div>
  );
}