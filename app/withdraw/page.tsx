"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type KycProfile = {
  id: string;
  cnicNumber: string;
  easypaisaNumber: string;
  accountName: string;
  isLocked: boolean;
};

type PlatformSettings = {
  exchangeRate: number;
  withdrawalFee: number;
  withdrawalApprovalTime: number;

  withdrawalStartTime: string;
  withdrawalEndTime: string;

  withdrawalMonday: boolean;
  withdrawalTuesday: boolean;
  withdrawalWednesday: boolean;
  withdrawalThursday: boolean;
  withdrawalFriday: boolean;
  withdrawalSaturday: boolean;
  withdrawalSunday: boolean;

  maintenanceMode: boolean;
};

type WithdrawalHistoryItem = {
  id: string;
  amountUSD: number;
  feePercent: number;
  feeUSD: number;
  netAmountUSD: number;
  exchangeRate: number;
  payoutPKR: number;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
};

const DEFAULT_SETTINGS: PlatformSettings = {
  exchangeRate: 300,
  withdrawalFee: 8,
  withdrawalApprovalTime: 2,

  withdrawalStartTime: "09:00",
  withdrawalEndTime: "23:00",

  withdrawalMonday: true,
  withdrawalTuesday: true,
  withdrawalWednesday: true,
  withdrawalThursday: true,
  withdrawalFriday: true,
  withdrawalSaturday: false,
  withdrawalSunday: false,

  maintenanceMode: false,
};

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  const [settings, setSettings] =
    useState<PlatformSettings>(DEFAULT_SETTINGS);

  const [cnicNumber, setCnicNumber] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] =
    useState("");
  const [accountName, setAccountName] =
    useState("");

  const [kycProfile, setKycProfile] =
    useState<KycProfile | null>(null);

  const [withdrawalHistory, setWithdrawalHistory] =
    useState<WithdrawalHistoryItem[]>([]);

  const [loadingBalance, setLoadingBalance] =
    useState(true);

  const [loadingKyc, setLoadingKyc] =
    useState(true);

  const [loadingSettings, setLoadingSettings] =
    useState(true);

  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [savingKyc, setSavingKyc] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const calculation = useMemo(() => {
    const usd = Number(amount) || 0;

    const fee = Number(
      (
        usd *
        (settings.withdrawalFee / 100)
      ).toFixed(2)
    );

    const netUsd = Number(
      Math.max(usd - fee, 0).toFixed(2)
    );

    const pkr = Number(
      (
        netUsd *
        settings.exchangeRate
      ).toFixed(2)
    );

    return {
      usd,
      fee,
      netUsd,
      pkr,
    };
  }, [
    amount,
    settings.withdrawalFee,
    settings.exchangeRate,
  ]);

  async function loadWithdrawalHistory() {
    try {
      setLoadingHistory(true);

      const response = await fetch(
        "/api/withdrawal",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWithdrawalHistory(
          data.withdrawals || []
        );
      }
    } catch {
      // History failure should not break withdrawal page.
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingBalance(true);
        setLoadingKyc(true);
        setLoadingSettings(true);

        const [
          walletResponse,
          kycResponse,
          settingsResponse,
          withdrawalResponse,
        ] = await Promise.all([
          fetch("/api/wallet", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/withdrawal/profile", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/platform-settings", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/withdrawal", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const walletData =
          await walletResponse.json();

        const kycData =
          await kycResponse.json();

        const settingsData =
          await settingsResponse.json();

        const withdrawalData =
          await withdrawalResponse.json();

        if (!walletResponse.ok) {
          setError(
            walletData.error ||
              "Unable to load wallet balance."
          );
        } else {
          setBalance(
            Number(
              walletData.wallet?.balanceUSD ||
                0
            )
          );
        }

        if (!kycResponse.ok) {
          setError(
            kycData.error ||
              "Unable to load withdrawal details."
          );
        } else if (kycData.profile) {
          const profile =
            kycData.profile as KycProfile;

          setKycProfile(profile);

          setCnicNumber(
            profile.cnicNumber
          );

          setEasypaisaNumber(
            profile.easypaisaNumber
          );

          setAccountName(
            profile.accountName
          );
        }

        if (!settingsResponse.ok) {
          setError(
            settingsData.error ||
              "Unable to load platform settings."
          );
        } else if (settingsData.settings) {
          const s =
            settingsData.settings;

          setSettings({
            exchangeRate:
              Number(
                s.exchangeRate ??
                  DEFAULT_SETTINGS.exchangeRate
              ),

            withdrawalFee:
              Number(
                s.withdrawalFee ??
                  DEFAULT_SETTINGS.withdrawalFee
              ),

            withdrawalApprovalTime:
              Number(
                s.withdrawalApprovalTime ??
                  DEFAULT_SETTINGS.withdrawalApprovalTime
              ),

            withdrawalStartTime:
              s.withdrawalStartTime ??
              DEFAULT_SETTINGS.withdrawalStartTime,

            withdrawalEndTime:
              s.withdrawalEndTime ??
              DEFAULT_SETTINGS.withdrawalEndTime,

            withdrawalMonday:
              Boolean(
                s.withdrawalMonday ??
                  DEFAULT_SETTINGS.withdrawalMonday
              ),

            withdrawalTuesday:
              Boolean(
                s.withdrawalTuesday ??
                  DEFAULT_SETTINGS.withdrawalTuesday
              ),

            withdrawalWednesday:
              Boolean(
                s.withdrawalWednesday ??
                  DEFAULT_SETTINGS.withdrawalWednesday
              ),

            withdrawalThursday:
              Boolean(
                s.withdrawalThursday ??
                  DEFAULT_SETTINGS.withdrawalThursday
              ),

            withdrawalFriday:
              Boolean(
                s.withdrawalFriday ??
                  DEFAULT_SETTINGS.withdrawalFriday
              ),

            withdrawalSaturday:
              Boolean(
                s.withdrawalSaturday ??
                  DEFAULT_SETTINGS.withdrawalSaturday
              ),

            withdrawalSunday:
              Boolean(
                s.withdrawalSunday ??
                  DEFAULT_SETTINGS.withdrawalSunday
              ),

            maintenanceMode:
              Boolean(
                s.maintenanceMode ??
                  DEFAULT_SETTINGS.maintenanceMode
              ),
          });
        }

        if (withdrawalResponse.ok) {
          setWithdrawalHistory(
            withdrawalData.withdrawals || []
          );
        }
      } catch {
        setError(
          "Unable to load withdrawal information."
        );
      } finally {
        setLoadingBalance(false);
        setLoadingKyc(false);
        setLoadingSettings(false);
        setLoadingHistory(false);
      }
    }

    loadData();
  }, []);

  async function handleSaveKyc() {
    setMessage("");
    setError("");

    if (!cnicNumber.trim()) {
      setError(
        "Please enter your CNIC number."
      );
      return;
    }

    if (!easypaisaNumber.trim()) {
      setError(
        "Please enter your Easypaisa number."
      );
      return;
    }

    if (!accountName.trim()) {
      setError(
        "Please enter the account holder name."
      );
      return;
    }

    try {
      setSavingKyc(true);

      const response = await fetch(
        "/api/withdrawal/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cnicNumber:
              cnicNumber.trim(),

            easypaisaNumber:
              easypaisaNumber.trim(),

            accountName:
              accountName.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to save withdrawal details."
        );
        return;
      }

      setKycProfile(data.profile);

      setMessage(
        "Withdrawal details saved and locked successfully."
      );
    } catch {
      setError(
        "Unable to save withdrawal details."
      );
    } finally {
      setSavingKyc(false);
    }
  }

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (settings.maintenanceMode) {
      setError(
        "Withdrawals are temporarily unavailable because the platform is under maintenance."
      );
      return;
    }

    if (!kycProfile?.isLocked) {
      setError(
        "Please complete and lock your withdrawal verification details first."
      );
      return;
    }

    if (
      !amount ||
      calculation.usd <= 0
    ) {
      setError(
        "Please enter a valid withdrawal amount."
      );
      return;
    }

    if (calculation.usd > balance) {
      setError(
        "Insufficient available balance."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/withdrawal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountUSD:
              calculation.usd,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to submit withdrawal request."
        );
        return;
      }

      setMessage(
        "Withdrawal request submitted successfully. It is now pending review."
      );

      setAmount("");

      const walletResponse =
        await fetch(
          "/api/wallet",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const walletData =
        await walletResponse.json();

      if (walletResponse.ok) {
        setBalance(
          Number(
            walletData.wallet
              ?.balanceUSD || 0
          )
        );
      }

      await loadWithdrawalHistory();
    } catch {
      setError(
        "Unable to submit withdrawal request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const kycLocked = Boolean(
    kycProfile?.isLocked
  );

  const activeDays = [
    settings.withdrawalMonday &&
      "Monday",
    settings.withdrawalTuesday &&
      "Tuesday",
    settings.withdrawalWednesday &&
      "Wednesday",
    settings.withdrawalThursday &&
      "Thursday",
    settings.withdrawalFriday &&
      "Friday",
    settings.withdrawalSaturday &&
      "Saturday",
    settings.withdrawalSunday &&
      "Sunday",
  ].filter(Boolean) as string[];

  function getStatusClass(status: string) {
    const normalized =
      status.toUpperCase();

    if (normalized === "APPROVED") {
      return "border-emerald-200 bg-emerald-50 text-emerald-600";
    }

    if (normalized === "REJECTED") {
      return "border-red-200 bg-red-50 text-red-600";
    }

    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  function formatStatus(status: string) {
    return status
      .toLowerCase()
      .replace(
        /^./,
        (letter) => letter.toUpperCase()
      );
  }

  function formatDate(date: string) {
    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return date;
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] pb-24 text-black">
      <section className="px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <header className="mb-5 overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-sm">
            <div className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-4 sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href="/"
                    className="text-lg font-bold text-yellow-600 sm:text-xl"
                  >
                    ClaudeInvest
                  </Link>

                  <p className="mt-2 text-xs font-medium text-yellow-600">
                    Wallet
                  </p>

                  <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                    Withdraw Funds
                  </h1>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    Withdraw your available USD balance to Easypaisa in PKR.
                  </p>
                </div>

                <MainNav />
              </div>
            </div>
          </header>

          {/* WALLET TABS */}
          <div className="mb-4 grid grid-cols-2 gap-2.5">
            <Link
              href="/deposit"
              className="rounded-xl border border-yellow-200 bg-white px-4 py-3 text-center text-xs font-semibold text-gray-600 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-black"
            >
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="rounded-xl border border-yellow-400 bg-yellow-400 px-4 py-3 text-center text-xs font-bold text-black shadow-sm"
            >
              Withdraw
            </Link>
          </div>

          {/* MAINTENANCE */}
          {settings.maintenanceMode && (
            <div className="mb-4 rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-4 text-sm text-yellow-800 shadow-sm">
              <p className="font-semibold">
                Maintenance Mode
              </p>

              <p className="mt-1 text-xs leading-5 text-yellow-700">
                Withdrawals are temporarily unavailable.
                Deposits and existing investments continue normally.
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-5">

            {/* WITHDRAWAL FORM */}
            <section className="overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-[0_5px_25px_rgba(234,179,8,0.10)] lg:col-span-3">

              {/* FORM HEADER */}
              <div className="border-b border-yellow-200 bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-yellow-700">
                      Withdrawal
                    </p>

                    <h2 className="mt-1 text-lg font-bold sm:text-xl">
                      Withdrawal Request
                    </h2>
                  </div>

                  <span className="rounded-full border border-yellow-300 bg-white px-2.5 py-1 text-[10px] font-bold text-yellow-700">
                    USD → PKR
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-4 sm:p-6"
              >

                {/* BALANCE */}
                <div className="rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-700 sm:text-xs">
                        Available Balance
                      </p>

                      <p className="mt-1 text-[9px] text-gray-500 sm:text-xs">
                        Amount available for withdrawal
                      </p>
                    </div>

                    <span className="text-xl font-extrabold text-yellow-600 sm:text-2xl">
                      {loadingBalance
                        ? "Loading..."
                        : `$${balance.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-600">
                    {message}
                  </div>
                )}

                {/* KYC */}
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50/40 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-yellow-700">
                        Withdrawal Verification
                      </p>

                      <h3 className="mt-1 text-sm font-bold">
                        KYC / Payout Details
                      </h3>
                    </div>

                    {loadingKyc ? (
                      <span className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[10px] text-gray-500">
                        Loading...
                      </span>
                    ) : kycLocked ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                        LOCKED
                      </span>
                    ) : (
                      <span className="rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-1 text-[10px] font-bold text-yellow-700">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-4">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        CNIC Number
                      </label>

                      <input
                        type="text"
                        value={cnicNumber}
                        onChange={(e) =>
                          setCnicNumber(
                            e.target.value
                          )
                        }
                        placeholder="XXXXX-XXXXXXX-X"
                        disabled={
                          kycLocked ||
                          savingKyc ||
                          submitting
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Easypaisa Number
                      </label>

                      <input
                        type="tel"
                        value={easypaisaNumber}
                        onChange={(e) =>
                          setEasypaisaNumber(
                            e.target.value
                          )
                        }
                        placeholder="03XXXXXXXXX"
                        disabled={
                          kycLocked ||
                          savingKyc ||
                          submitting
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Account Name
                      </label>

                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) =>
                          setAccountName(
                            e.target.value
                          )
                        }
                        placeholder="Enter account holder name"
                        disabled={
                          kycLocked ||
                          savingKyc ||
                          submitting
                        }
                        className={inputClass}
                      />
                    </div>

                    {!kycLocked && (
                      <button
                        type="button"
                        onClick={handleSaveKyc}
                        disabled={
                          savingKyc ||
                          loadingKyc ||
                          submitting
                        }
                        className="w-full rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingKyc
                          ? "Saving..."
                          : "Save & Lock Withdrawal Details"}
                      </button>
                    )}

                    {kycLocked && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] leading-5 text-emerald-600">
                        Your withdrawal details are locked.
                        Contact support if you need to change
                        them.
                      </div>
                    )}
                  </div>
                </div>

                {/* AMOUNT */}
                <div className="rounded-2xl border border-gray-200 bg-white">
                  <div className="border-b border-yellow-100 bg-yellow-50/70 px-4 py-3">
                    <label className="text-sm font-bold text-gray-800">
                      Withdrawal Amount (USD)
                    </label>
                  </div>

                  <div className="p-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-yellow-600">
                        $
                      </span>

                      <input
                        type="number"
                        min="1"
                        max="2000"
                        step="0.01"
                        value={amount}
                        onChange={(e) => {
                          setAmount(
                            e.target.value
                          );
                          setError("");
                          setMessage("");
                        }}
                        placeholder="Enter amount"
                        disabled={
                          submitting ||
                          loadingBalance ||
                          loadingSettings ||
                          !kycLocked ||
                          settings.maintenanceMode
                        }
                        className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-9 pr-4 text-sm font-medium text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                {/* CALCULATION */}
                <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-50">
                  <div className="border-b border-yellow-200 bg-yellow-100/70 px-4 py-3 sm:px-5">
                    <h3 className="text-sm font-bold">
                      Withdrawal Summary
                    </h3>
                  </div>

                  <div className="space-y-3 p-4 text-xs sm:p-5 sm:text-sm">

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">
                        Requested Amount
                      </span>

                      <span className="font-semibold">
                        ${calculation.usd.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">
                        Withdrawal Fee (
                        {settings.withdrawalFee}%)
                      </span>

                      <span className="font-semibold text-red-600">
                        -$
                        {calculation.fee.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-yellow-200 pt-3">
                      <div className="flex justify-between gap-4 font-bold">
                        <span>
                          Net Amount
                        </span>

                        <span className="text-yellow-700">
                          $
                          {calculation.netUsd.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                      <div className="flex justify-between gap-4">
                        <span className="font-medium text-gray-600">
                          Estimated PKR Payout
                        </span>

                        <span className="font-bold text-emerald-600">
                          PKR{" "}
                          {calculation.pkr.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingBalance ||
                    loadingKyc ||
                    loadingSettings ||
                    !kycLocked ||
                    settings.maintenanceMode
                  }
                  className="w-full rounded-xl bg-yellow-400 px-5 py-4 text-sm font-bold text-black shadow-md shadow-yellow-200 transition hover:bg-yellow-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {settings.maintenanceMode
                    ? "Withdrawals Temporarily Unavailable"
                    : submitting
                      ? "Submitting..."
                      : "Submit Withdrawal Request"}
                </button>
              </form>
            </section>

            {/* RIGHT SIDE */}
            <aside className="space-y-4 lg:col-span-2">

              {/* WITHDRAWAL HISTORY */}
              <div className="overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-yellow-100 bg-yellow-50/70 p-4 sm:p-6">
                  <div>
                    <p className="text-[11px] font-medium text-yellow-700">
                      Wallet
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      Withdrawal History
                    </h2>
                  </div>

                  <span className="rounded-full border border-yellow-200 bg-white px-2.5 py-1 text-[10px] font-bold text-yellow-700">
                    {withdrawalHistory.length} Requests
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  {loadingHistory ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500">
                      Loading withdrawal history...
                    </div>
                  ) : withdrawalHistory.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">
                        No withdrawal history yet.
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        Your withdrawal requests will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
                      {withdrawalHistory.map(
                        (withdrawal) => {
                          const status =
                            String(
                              withdrawal.status
                            ).toUpperCase();

                          return (
                            <div
                              key={
                                withdrawal.id
                              }
                              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold">
                                    $
                                    {Number(
                                      withdrawal.amountUSD
                                    ).toFixed(2)}
                                  </p>

                                  <p className="mt-1 text-[10px] text-gray-400">
                                    {formatDate(
                                      withdrawal.requestedAt
                                    )}
                                  </p>
                                </div>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                    status
                                  )}`}
                                >
                                  {formatStatus(
                                    status
                                  )}
                                </span>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">

                                <div className="rounded-lg bg-white p-2.5">
                                  <p className="text-gray-400">
                                    Fee
                                  </p>

                                  <p className="mt-1 font-semibold text-red-600">
                                    -$
                                    {Number(
                                      withdrawal.feeUSD
                                    ).toFixed(2)}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-2.5">
                                  <p className="text-gray-400">
                                    Net Amount
                                  </p>

                                  <p className="mt-1 font-semibold text-yellow-600">
                                    $
                                    {Number(
                                      withdrawal.netAmountUSD
                                    ).toFixed(2)}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-2.5">
                                  <p className="text-gray-400">
                                    Exchange Rate
                                  </p>

                                  <p className="mt-1">
                                    {Number(
                                      withdrawal.exchangeRate
                                    )}{" "}
                                    PKR
                                  </p>
                                </div>

                                <div className="rounded-lg bg-white p-2.5">
                                  <p className="text-gray-400">
                                    PKR Payout
                                  </p>

                                  <p className="mt-1 font-semibold text-emerald-600">
                                    PKR{" "}
                                    {Number(
                                      withdrawal.payoutPKR
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {status ===
                                "REJECTED" &&
                                withdrawal.rejectionReason && (
                                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-[10px] font-semibold text-red-600">
                                      Rejection Reason
                                    </p>

                                    <p className="mt-1 text-[11px] text-red-500">
                                      {
                                        withdrawal.rejectionReason
                                      }
                                    </p>
                                  </div>
                                )}

                              {status ===
                                "APPROVED" &&
                                withdrawal.approvedAt && (
                                  <p className="mt-3 text-[10px] text-emerald-600">
                                    Approved:{" "}
                                    {formatDate(
                                      withdrawal.approvedAt
                                    )}
                                  </p>
                                )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SCHEDULE */}
              <div className="overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm">
                <div className="border-b border-yellow-100 bg-yellow-50/70 p-4 sm:p-6">
                  <h2 className="text-lg font-bold">
                    Withdrawal Schedule
                  </h2>
                </div>

                <div className="space-y-3 p-4 text-xs sm:p-6 sm:text-sm">

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Days
                    </span>

                    <span className="text-right font-medium">
                      {activeDays.length > 0
                        ? activeDays.join(
                            ", "
                          )
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Opening
                    </span>

                    <span className="font-medium">
                      {settings.withdrawalStartTime}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Closing
                    </span>

                    <span className="font-medium">
                      {settings.withdrawalEndTime}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Approval
                    </span>

                    <span className="font-medium">
                      Within{" "}
                      {
                        settings.withdrawalApprovalTime
                      }{" "}
                      hours
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-[11px] leading-5 text-yellow-800">
                    Withdrawal requests follow the schedule
                    configured by the platform administrator.
                  </div>
                </div>
              </div>

              {/* CONVERSION */}
              <div className="overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-sm">
                <div className="border-b border-yellow-100 bg-yellow-50/70 p-4 sm:p-6">
                  <h2 className="text-lg font-bold">
                    Conversion
                  </h2>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 text-center">
                    <p className="text-xs text-gray-500">
                      Exchange Rate
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-yellow-700 sm:text-2xl">
                      1 USD ={" "}
                      {settings.exchangeRate}{" "}
                      PKR
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <p>
                      Withdrawal fee:{" "}
                      {settings.withdrawalFee}%
                    </p>

                    <p>
                      Payout currency: PKR
                    </p>

                    <p>
                      Account balance: USD
                    </p>
                  </div>
                </div>
              </div>

              {/* VERIFICATION */}
              <div className="rounded-2xl border border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 shadow-sm">
                <p className="text-sm font-bold text-yellow-700">
                  Withdrawal Verification
                </p>

                <p className="mt-2 text-[11px] leading-5 text-gray-600">
                  Your CNIC and payout details are required
                  before withdrawal. Once submitted, these
                  details are locked for security.
                </p>
              </div>
            </aside>
          </div>

          <div className="py-5 text-center text-[10px] text-gray-400 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:opacity-60";