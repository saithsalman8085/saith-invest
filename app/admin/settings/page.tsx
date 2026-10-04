
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Settings = {
  platformName: string;
  supportEmail: string;

  exchangeRate: string;
  withdrawalFee: string;

  depositMinApproval: string;
  depositMaxApproval: string;
  withdrawalApprovalTime: string;

  withdrawalStartTime: string;
  withdrawalEndTime: string;

  withdrawalMonday: boolean;
  withdrawalTuesday: boolean;
  withdrawalWednesday: boolean;
  withdrawalThursday: boolean;
  withdrawalFriday: boolean;
  withdrawalSaturday: boolean;
  withdrawalSunday: boolean;

  depositPaymentMethod: string;
  depositAccountName: string;
  depositAccountNumber: string;
  depositInstructions: string;

  maintenanceMode: boolean;
  twoFactor: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  platformName: "ClaudeInvest",
  supportEmail: "",

  exchangeRate: "300",
  withdrawalFee: "8",

  depositMinApproval: "1",
  depositMaxApproval: "3",
  withdrawalApprovalTime: "2",

  withdrawalStartTime: "09:00",
  withdrawalEndTime: "23:00",

  withdrawalMonday: true,
  withdrawalTuesday: true,
  withdrawalWednesday: true,
  withdrawalThursday: true,
  withdrawalFriday: true,
  withdrawalSaturday: false,
  withdrawalSunday: false,

  depositPaymentMethod: "Easypaisa",
  depositAccountName: "ClaudeInvest",
  depositAccountNumber: "",
  depositInstructions:
    "Send payment to the account above and enter your transaction ID.",

  maintenanceMode: false,
  twoFactor: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/platform-settings",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load settings."
        );
      }

      const s = data.settings;

      setSettings({
        platformName:
          s.platformName ??
          DEFAULT_SETTINGS.platformName,

        supportEmail:
          s.supportEmail ?? "",

        exchangeRate:
          String(
            s.exchangeRate ??
              DEFAULT_SETTINGS.exchangeRate
          ),

        withdrawalFee:
          String(
            s.withdrawalFee ??
              DEFAULT_SETTINGS.withdrawalFee
          ),

        depositMinApproval:
          String(
            s.depositMinApproval ??
              DEFAULT_SETTINGS.depositMinApproval
          ),

        depositMaxApproval:
          String(
            s.depositMaxApproval ??
              DEFAULT_SETTINGS.depositMaxApproval
          ),

        withdrawalApprovalTime:
          String(
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

        depositPaymentMethod:
          s.depositPaymentMethod ??
          DEFAULT_SETTINGS.depositPaymentMethod,

        depositAccountName:
          s.depositAccountName ??
          DEFAULT_SETTINGS.depositAccountName,

        depositAccountNumber:
          s.depositAccountNumber ?? "",

        depositInstructions:
          s.depositInstructions ??
          DEFAULT_SETTINGS.depositInstructions,

        maintenanceMode:
          Boolean(
            s.maintenanceMode ??
              DEFAULT_SETTINGS.maintenanceMode
          ),

        twoFactor:
          Boolean(
            s.twoFactor ??
              DEFAULT_SETTINGS.twoFactor
          ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSection(
    section: string,
    updates: Record<string, unknown>,
    successMessage: string
  ) {
    try {
      setSavingSection(section);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/platform-settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to save settings."
        );
      }

      setMessage(successMessage);

      // Reload actual values from database
      await loadSettings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSavingSection("");
    }
  }

  async function saveGeneralSettings() {
    await saveSection(
      "general",
      {
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
      },
      "General settings updated successfully."
    );
  }

  async function saveCurrencySettings() {
    const exchangeRate = Number(
      settings.exchangeRate
    );

    if (
      !Number.isFinite(exchangeRate) ||
      exchangeRate <= 0
    ) {
      setError(
        "Exchange rate must be greater than 0."
      );
      return;
    }

    await saveSection(
      "currency",
      {
        exchangeRate: settings.exchangeRate,
      },
      "Currency settings updated successfully."
    );
  }

  async function saveDepositSettings() {
    const minApproval = Number(
      settings.depositMinApproval
    );

    const maxApproval = Number(
      settings.depositMaxApproval
    );

    if (
      !Number.isInteger(minApproval) ||
      minApproval < 0
    ) {
      setError(
        "Minimum deposit approval time is invalid."
      );
      return;
    }

    if (
      !Number.isInteger(maxApproval) ||
      maxApproval < 0
    ) {
      setError(
        "Maximum deposit approval time is invalid."
      );
      return;
    }

    if (minApproval > maxApproval) {
      setError(
        "Minimum approval time cannot be greater than maximum approval time."
      );
      return;
    }

    await saveSection(
      "deposit",
      {
        depositPaymentMethod:
          settings.depositPaymentMethod,

        depositAccountName:
          settings.depositAccountName,

        depositAccountNumber:
          settings.depositAccountNumber,

        depositInstructions:
          settings.depositInstructions,

        depositMinApproval:
          settings.depositMinApproval,

        depositMaxApproval:
          settings.depositMaxApproval,
      },
      "Deposit settings updated successfully."
    );
  }

  async function saveWithdrawalSettings() {
    const fee = Number(
      settings.withdrawalFee
    );

    const approvalTime = Number(
      settings.withdrawalApprovalTime
    );

    if (
      !Number.isFinite(fee) ||
      fee < 0 ||
      fee > 100
    ) {
      setError(
        "Withdrawal fee must be between 0% and 100%."
      );
      return;
    }

    if (
      !Number.isInteger(approvalTime) ||
      approvalTime < 0
    ) {
      setError(
        "Maximum withdrawal approval time is invalid."
      );
      return;
    }

    if (
      !settings.withdrawalMonday &&
      !settings.withdrawalTuesday &&
      !settings.withdrawalWednesday &&
      !settings.withdrawalThursday &&
      !settings.withdrawalFriday &&
      !settings.withdrawalSaturday &&
      !settings.withdrawalSunday
    ) {
      setError(
        "At least one withdrawal day must be enabled."
      );
      return;
    }

    await saveSection(
      "withdrawal",
      {
        withdrawalStartTime:
          settings.withdrawalStartTime,

        withdrawalEndTime:
          settings.withdrawalEndTime,

        withdrawalApprovalTime:
          settings.withdrawalApprovalTime,

        withdrawalFee:
          settings.withdrawalFee,

        withdrawalMonday:
          settings.withdrawalMonday,

        withdrawalTuesday:
          settings.withdrawalTuesday,

        withdrawalWednesday:
          settings.withdrawalWednesday,

        withdrawalThursday:
          settings.withdrawalThursday,

        withdrawalFriday:
          settings.withdrawalFriday,

        withdrawalSaturday:
          settings.withdrawalSaturday,

        withdrawalSunday:
          settings.withdrawalSunday,
      },
      "Withdrawal settings updated successfully."
    );
  }

  async function saveSecuritySettings() {
    await saveSection(
      "security",
      {
        maintenanceMode:
          settings.maintenanceMode,

        twoFactor:
          settings.twoFactor,
      },
      "Security settings updated successfully."
    );
  }

  const withdrawalDays = [
    {
      key:
        "withdrawalMonday" as const,
      label: "Monday",
    },
    {
      key:
        "withdrawalTuesday" as const,
      label: "Tuesday",
    },
    {
      key:
        "withdrawalWednesday" as const,
      label: "Wednesday",
    },
    {
      key:
        "withdrawalThursday" as const,
      label: "Thursday",
    },
    {
      key:
        "withdrawalFriday" as const,
      label: "Friday",
    },
    {
      key:
        "withdrawalSaturday" as const,
      label: "Saturday",
    },
    {
      key:
        "withdrawalSunday" as const,
      label: "Sunday",
    },
  ];

  const activeWithdrawalDays =
    withdrawalDays
      .filter(
        (day) => settings[day.key]
      )
      .map((day) => day.label);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-slate-400">
            Loading platform settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Admin
          </Link>

          <h1 className="text-3xl font-bold">
            Platform Settings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage ClaudeInvest platform and payment settings.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* GENERAL */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">
            General Settings
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <Field
              label="Platform Name"
              value={settings.platformName}
              onChange={(value) =>
                updateSetting(
                  "platformName",
                  value
                )
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Support Email
              </label>

              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  updateSetting(
                    "supportEmail",
                    e.target.value
                  )
                }
                placeholder="support@example.com"
                className={inputClass}
              />
            </div>

          </div>

          <SaveButton
            saving={
              savingSection === "general"
            }
            onClick={
              saveGeneralSettings
            }
          >
            Save General Settings
          </SaveButton>
        </section>

        {/* CURRENCY */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">
            Currency & Conversion
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            USD is used inside the platform. PKR is used for
            deposits and withdrawals.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <StaticField
              label="Platform Currency"
              value="USD"
            />

            <StaticField
              label="Deposit Currency"
              value="PKR"
            />

            <StaticField
              label="Withdrawal Currency"
              value="PKR"
            />

          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Exchange Rate
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="number"
                min="1"
                step="0.01"
                value={
                  settings.exchangeRate
                }
                onChange={(e) =>
                  updateSetting(
                    "exchangeRate",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500 sm:max-w-xs"
              />

              <span className="text-sm text-slate-400">
                1 USD ={" "}
                {settings.exchangeRate ||
                  "0"}{" "}
                PKR
              </span>
            </div>
          </div>

          <SaveButton
            saving={
              savingSection === "currency"
            }
            onClick={
              saveCurrencySettings
            }
          >
            Save Currency Settings
          </SaveButton>
        </section>

        {/* DEPOSIT */}

        <section className="mb-6 rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-xl">
          <div>
            <h2 className="text-xl font-semibold">
              Deposit Settings
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Configure the payment details users see when
              making a deposit.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <Field
              label="Payment Method"
              value={
                settings.depositPaymentMethod
              }
              onChange={(value) =>
                updateSetting(
                  "depositPaymentMethod",
                  value
                )
              }
            />

            <Field
              label="Account Name"
              value={
                settings.depositAccountName
              }
              onChange={(value) =>
                updateSetting(
                  "depositAccountName",
                  value
                )
              }
            />

            <Field
              label="Account Number"
              value={
                settings.depositAccountNumber
              }
              onChange={(value) =>
                updateSetting(
                  "depositAccountNumber",
                  value
                )
              }
              placeholder="03XXXXXXXXX"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Deposit Instructions
              </label>

              <textarea
                rows={4}
                value={
                  settings.depositInstructions
                }
                onChange={(e) =>
                  updateSetting(
                    "depositInstructions",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

          </div>

          <div className="mt-6 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4">
            <p className="text-sm font-medium text-cyan-300">
              Current payment details
            </p>

            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>
                Method:{" "}
                {settings.depositPaymentMethod}
              </p>

              <p>
                Account:{" "}
                {settings.depositAccountName}
              </p>

              <p>
                Number:{" "}
                {settings.depositAccountNumber ||
                  "Not configured"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <NumberField
              label="Minimum Approval Time"
              value={
                settings.depositMinApproval
              }
              onChange={(value) =>
                updateSetting(
                  "depositMinApproval",
                  value
                )
              }
            />

            <NumberField
              label="Maximum Approval Time"
              value={
                settings.depositMaxApproval
              }
              onChange={(value) =>
                updateSetting(
                  "depositMaxApproval",
                  value
                )
              }
            />

          </div>

          <div className="mt-5 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4">
            <p className="text-sm text-cyan-300">
              Deposit requests are available 24/7.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Current approval target:{" "}
              {settings.depositMinApproval}–
              {settings.depositMaxApproval}{" "}
              hours.
            </p>
          </div>

          <SaveButton
            saving={
              savingSection === "deposit"
            }
            onClick={
              saveDepositSettings
            }
          >
            Save Deposit Settings
          </SaveButton>
        </section>

        {/* WITHDRAWAL */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">
            Withdrawal Settings
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Configure the days, time, approval period and fee
            for withdrawal requests.
          </p>

          {/* WITHDRAWAL DAYS */}

          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Withdrawal Days
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
              {withdrawalDays.map(
                (day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      updateSetting(
                        day.key,
                        !settings[
                          day.key
                        ]
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-center text-sm font-medium transition ${
                      settings[day.key]
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300"
                        : "border-red-900/50 bg-red-950/20 text-red-400"
                    }`}
                  >
                    {day.label}

                    <span className="mt-1 block text-xs">
                      {settings[day.key]
                        ? "ON"
                        : "OFF"}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Opening Time
              </label>

              <input
                type="time"
                value={
                  settings.withdrawalStartTime
                }
                onChange={(e) =>
                  updateSetting(
                    "withdrawalStartTime",
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Closing Time
              </label>

              <input
                type="time"
                value={
                  settings.withdrawalEndTime
                }
                onChange={(e) =>
                  updateSetting(
                    "withdrawalEndTime",
                    e.target.value
                  )
                }
                className={inputClass}
              />

              <p className="mt-2 text-xs text-slate-500">
                After{" "}
                {settings.withdrawalEndTime},
                new requests are blocked.
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <NumberField
              label="Maximum Approval Time"
              value={
                settings.withdrawalApprovalTime
              }
              onChange={(value) =>
                updateSetting(
                  "withdrawalApprovalTime",
                  value
                )
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Withdrawal Fee
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    settings.withdrawalFee
                  }
                  onChange={(e) =>
                    updateSetting(
                      "withdrawalFee",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />

                <span className="text-sm text-slate-400">
                  %
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                12% withdrawal fee.
              </p>
            </div>

          </div>

          <div className="mt-6 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-5">
            <p className="font-semibold text-cyan-300">
              Current Withdrawal Schedule
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-300">

              <p>
                •{" "}
                {activeWithdrawalDays.length > 0
                  ? activeWithdrawalDays.join(
                      ", "
                    )
                  : "No days enabled"}
              </p>

              <p>
                •{" "}
                {settings.withdrawalStartTime}{" "}
                to{" "}
                {settings.withdrawalEndTime}
              </p>

              <p>
                • Approval target: within{" "}
                {settings.withdrawalApprovalTime}{" "}
                hours
              </p>

              <p>
                • Withdrawal fee:{" "}
                {settings.withdrawalFee}%
              </p>

              <p>
                • Conversion: 1 USD ={" "}
                {settings.exchangeRate} PKR
              </p>
            </div>
          </div>

          <SaveButton
            saving={
              savingSection === "withdrawal"
            }
            onClick={
              saveWithdrawalSettings
            }
          >
            Save Withdrawal Settings
          </SaveButton>
        </section>

        {/* SECURITY */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold">
            Security
          </h2>

          <div className="mt-6 space-y-5">

            <ToggleRow
              title="Maintenance Mode"
              description="Block new investments and withdrawal requests while allowing deposits and existing investments to continue."
              value={
                settings.maintenanceMode
              }
              onChange={(value) =>
                updateSetting(
                  "maintenanceMode",
                  value
                )
              }
            />

            <ToggleRow
              title="Admin Two-Factor Authentication"
              description="Add an extra security layer to admin access."
              value={
                settings.twoFactor
              }
              onChange={(value) =>
                updateSetting(
                  "twoFactor",
                  value
                )
              }
            />

          </div>

          <SaveButton
            saving={
              savingSection === "security"
            }
            onClick={
              saveSecuritySettings
            }
          >
            Save Security Settings
          </SaveButton>
        </section>

      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500";

function SaveButton({
  saving,
  onClick,
  children,
}: {
  saving: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving
        ? "Saving..."
        : children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={inputClass}
        />

        <span className="text-sm text-slate-400">
          Hours
        </span>
      </div>
    </div>
  );
}

function StaticField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-semibold">
        {value}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div>
        <p className="font-medium">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        aria-label={title}
        aria-pressed={value}
        onClick={() =>
          onChange(!value)
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          value
            ? "bg-cyan-500"
            : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            value
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
