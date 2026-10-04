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
    useState<PlatformSettings>(
      DEFAULT_SETTINGS
    );

  const [cnicNumber, setCnicNumber] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] =
    useState("");
  const [accountName, setAccountName] =
    useState("");

  const [kycProfile, setKycProfile] =
    useState<KycProfile | null>(null);

  const [loadingBalance, setLoadingBalance] =
    useState(true);

  const [loadingKyc, setLoadingKyc] =
    useState(true);

  const [loadingSettings, setLoadingSettings] =
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
        ]);

        const walletData =
          await walletResponse.json();

        const kycData =
          await kycResponse.json();

        const settingsData =
          await settingsResponse.json();

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
      } catch {
        setError(
          "Unable to load withdrawal information."
        );
      } finally {
        setLoadingBalance(false);
        setLoadingKyc(false);
        setLoadingSettings(false);
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 pb-24 text-white">
      <section className="px-3 py-4 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-6xl">

          <header className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 backdrop-blur-xl sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href="/"
                  className="text-lg font-bold text-cyan-400 sm:text-xl"
                >
                  ClaudeInvest
                </Link>

                <p className="mt-2 text-xs text-cyan-400">
                  Wallet
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Withdraw Funds
                </h1>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Withdraw your available USD balance to Easypaisa in PKR.
                </p>
              </div>

              <MainNav />
            </div>
          </header>

          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <Link
              href="/deposit"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-xs font-semibold text-slate-400 transition hover:border-slate-700 hover:text-white"
            >
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-xs font-semibold text-cyan-400"
            >
              Withdraw
            </Link>
          </div>

          {settings.maintenanceMode && (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-300">
              <p className="font-semibold">
                Maintenance Mode
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-200/70">
                Withdrawals are temporarily unavailable.
                Deposits and existing investments continue normally.
              </p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-5">

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl sm:p-6 lg:col-span-3">

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-slate-500">
                    Withdrawal
                  </p>

                  <h2 className="mt-1 text-lg font-semibold sm:text-xl">
                    Withdrawal Request
                  </h2>
                </div>

                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] text-cyan-400">
                  USD → PKR
                </span>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Available Balance
                    </span>

                    <span className="text-xl font-bold text-cyan-400">
                      {loadingBalance
                        ? "Loading..."
                        : `$${balance.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-400">
                    {message}
                  </div>
                )}

                {/* KYC */}

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">
                        Withdrawal Verification
                      </p>

                      <h3 className="mt-1 text-sm font-semibold">
                        KYC / Payout Details
                      </h3>
                    </div>

                    {loadingKyc ? (
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-500">
                        Loading...
                      </span>
                    ) : kycLocked ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                        LOCKED
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  <div className="mt-5 space-y-4">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
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
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    {!kycLocked && (
                      <button
                        type="button"
                        onClick={
                          handleSaveKyc
                        }
                        disabled={
                          savingKyc ||
                          loadingKyc ||
                          submitting
                        }
                        className="w-full rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingKyc
                          ? "Saving..."
                          : "Save & Lock Withdrawal Details"}
                      </button>
                    )}

                    {kycLocked && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-[11px] leading-5 text-emerald-400">
                        Your withdrawal details are locked.
                        Contact support if you need to change
                        them.
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Withdrawal Amount (USD)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      $
                    </span>

                    <input
                      type="number"
                      min="1"
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
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-9 pr-4 text-sm text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Calculation */}

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold">
                    Withdrawal Summary
                  </h3>

                  <div className="mt-4 space-y-3 text-xs sm:text-sm">

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Requested Amount
                      </span>

                      <span>
                        ${calculation.usd.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">
                        Withdrawal Fee (
                        {settings.withdrawalFee}%)
                      </span>

                      <span className="text-red-400">
                        -$
                        {calculation.fee.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <div className="flex justify-between gap-4 font-semibold">
                        <span>
                          Net Amount
                        </span>

                        <span className="text-cyan-400">
                          $
                          {calculation.netUsd.toFixed(
                            2
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between gap-4 pt-1">
                      <span className="text-slate-500">
                        Estimated PKR Payout
                      </span>

                      <span className="font-semibold text-emerald-400">
                        PKR{" "}
                        {calculation.pkr.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

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
                  className="w-full rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {settings.maintenanceMode
                    ? "Withdrawals Temporarily Unavailable"
                    : submitting
                      ? "Submitting..."
                      : "Submit Withdrawal Request"}
                </button>
              </form>
            </section>

            <aside className="space-y-4 lg:col-span-2">

              {/* Schedule */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <h2 className="text-lg font-semibold">
                  Withdrawal Schedule
                </h2>

                <div className="mt-5 space-y-3 text-xs sm:text-sm">

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Days
                    </span>

                    <span className="text-right">
                      {activeDays.length > 0
                        ? activeDays.join(
                            ", "
                          )
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Opening
                    </span>

                    <span>
                      {settings.withdrawalStartTime}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Closing
                    </span>

                    <span>
                      {settings.withdrawalEndTime}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">
                      Approval
                    </span>

                    <span>
                      Within{" "}
                      {
                        settings.withdrawalApprovalTime
                      }{" "}
                      hours
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] leading-5 text-slate-500">
                  Withdrawal requests follow the schedule
                  configured by the platform administrator.
                </div>
              </div>

              {/* Conversion */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <h2 className="text-lg font-semibold">
                  Conversion
                </h2>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Exchange Rate
                  </p>

                  <p className="mt-2 text-xl font-bold text-cyan-400 sm:text-2xl">
                    1 USD ={" "}
                    {settings.exchangeRate}{" "}
                    PKR
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500">

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

              {/* Verification */}

              <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
                <p className="text-sm font-semibold text-amber-400">
                  Withdrawal Verification
                </p>

                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Your CNIC and payout details are required
                  before withdrawal. Once submitted, these
                  details are locked for security.
                </p>
              </div>
            </aside>
          </div>

          <div className="py-5 text-center text-[10px] text-slate-600 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}