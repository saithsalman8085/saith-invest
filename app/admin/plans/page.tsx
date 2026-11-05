"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PlanStatus = "PUBLISHED" | "DRAFT";
type PlanCategory = "NORMAL" | "PREMIUM" | "LIMITED_TIME";

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
  maxPurchasesPerUser: number;
  referralBonusUSD: string | number;
  isSpecial: boolean;
  category?: PlanCategory;
  expiresAt?: string | Date | null;
  status: PlanStatus;
};

const emptyForm = {
  name: "",
  depositAmount: "",
  profitAmount: "",
  durationDays: "",
  dailyEarning: "",
  totalReturn: "",
  level1Percent: "12",
  level2Percent: "4",
  level3Percent: "2",
  maxPurchasesPerUser: "1",
  referralBonusUSD: "0",
  category: "NORMAL" as PlanCategory,
  offerHours: "",
  status: "DRAFT" as PlanStatus,
};

function categoryLabel(category?: PlanCategory) {
  switch (category) {
    case "PREMIUM":
      return "PREMIUM";
    case "LIMITED_TIME":
      return "LIMITED TIME";
    default:
      return "NORMAL";
  }
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/plans", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load plans.");
      }

      setPlans(data.plans || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load plans."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const updateField = (
    field: keyof typeof emptyForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const savePlan = async () => {
    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      !form.depositAmount ||
      !form.profitAmount ||
      !form.durationDays ||
      !form.dailyEarning ||
      !form.totalReturn
    ) {
      setError("Please fill all required plan fields.");
      return;
    }

    let expiresAt: string | null = null;

    if (form.category === "LIMITED_TIME") {
      const hours = Number(form.offerHours);

      if (!Number.isInteger(hours) || hours < 1) {
        setError("Limited Time offer duration must be at least 1 hour.");
        return;
      }

      expiresAt = new Date(
        Date.now() + hours * 60 * 60 * 1000
      ).toISOString();
    }

    const maxPurchases = Number(form.maxPurchasesPerUser);
    const referralBonus = Number(form.referralBonusUSD);

    if (!Number.isInteger(maxPurchases) || maxPurchases < 1) {
      setError("Max active purchases must be at least 1.");
      return;
    }

    if (!Number.isFinite(referralBonus) || referralBonus < 0) {
      setError("Instant referral bonus cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        depositAmount: Number(form.depositAmount),
        profitAmount: Number(form.profitAmount),
        durationDays: Number(form.durationDays),
        dailyEarning: Number(form.dailyEarning),
        totalReturn: Number(form.totalReturn),
        level1Percent: Number(form.level1Percent),
        level2Percent: Number(form.level2Percent),
        level3Percent: Number(form.level3Percent),
        maxPurchasesPerUser: maxPurchases,
        referralBonusUSD: referralBonus,
        category: form.category,
        expiresAt,
        isSpecial: form.category === "PREMIUM",
        status: form.status,
      };

      const response = await fetch("/api/admin/plans", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save plan.");
      }

      setMessage(
        editingId
          ? "Plan updated successfully."
          : "Plan created successfully."
      );

      resetForm();
      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const editPlan = (plan: Plan) => {
    const category =
      plan.category ||
      (plan.isSpecial ? "PREMIUM" : "NORMAL");

    let remainingHours = "";

    if (category === "LIMITED_TIME" && plan.expiresAt) {
      const remaining =
        new Date(plan.expiresAt).getTime() - Date.now();

      remainingHours =
        remaining > 0
          ? String(Math.ceil(remaining / (60 * 60 * 1000)))
          : "0";
    }

    setEditingId(plan.id);

    setForm({
      name: plan.name,
      depositAmount: String(plan.depositAmount),
      profitAmount: String(plan.profitAmount),
      durationDays: String(plan.durationDays),
      dailyEarning: String(plan.dailyEarning),
      totalReturn: String(plan.totalReturn),
      level1Percent: String(plan.level1Percent),
      level2Percent: String(plan.level2Percent),
      level3Percent: String(plan.level3Percent),
      maxPurchasesPerUser: String(plan.maxPurchasesPerUser ?? 1),
      referralBonusUSD: String(plan.referralBonusUSD ?? 0),
      category,
      offerHours: remainingHours,
      status: plan.status,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deletePlan = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/plans", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete plan.");
      }

      setMessage("Plan deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete plan."
      );
    }
  };

  const toggleStatus = async (plan: Plan) => {
    try {
      setError("");
      setMessage("");

      const newStatus =
        plan.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

      const category =
        plan.category ||
        (plan.isSpecial ? "PREMIUM" : "NORMAL");

      const response = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: plan.id,
          name: plan.name,
          depositAmount: Number(plan.depositAmount),
          profitAmount: Number(plan.profitAmount),
          durationDays: plan.durationDays,
          dailyEarning: Number(plan.dailyEarning),
          totalReturn: Number(plan.totalReturn),
          level1Percent: Number(plan.level1Percent),
          level2Percent: Number(plan.level2Percent),
          level3Percent: Number(plan.level3Percent),
          maxPurchasesPerUser: Number(plan.maxPurchasesPerUser) || 1,
          referralBonusUSD: Number(plan.referralBonusUSD) || 0,
          category,
          expiresAt: plan.expiresAt
            ? new Date(plan.expiresAt).toISOString()
            : null,
          isSpecial: category === "PREMIUM",
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to change plan status.");
      }

      setMessage(
        newStatus === "PUBLISHED"
          ? "Plan published successfully."
          : "Plan moved to draft."
      );

      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change plan status."
      );
    }
  };

  const previewDeposit = Number(form.depositAmount) || 0;
  const previewProfit = Number(form.profitAmount) || 0;
  const previewTotal = Number(form.totalReturn) || 0;
  const previewReferralBonus = Number(form.referralBonusUSD) || 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Admin
          </Link>

          <h1 className="text-3xl font-bold">Investment Plans</h1>

          <p className="mt-2 text-sm text-slate-400">
            Create and manage investment plans in USD.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Investment Plan" : "Create New Plan"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Configure plan category, offer duration, deposit, profit,
              investment duration, earnings and referral settings.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Plan Name
              </label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Starter Plan"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Plan Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value as PlanCategory)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="NORMAL">Normal Plans</option>
                <option value="PREMIUM">Premium Plans</option>
                <option value="LIMITED_TIME">Limited Time Plans</option>
              </select>
            </div>

            {form.category === "LIMITED_TIME" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-amber-300">
                  Offer Duration (Hours)
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.offerHours}
                  onChange={(e) =>
                    updateField("offerHours", e.target.value)
                  }
                  placeholder="e.g. 24"
                  className="w-full rounded-xl border border-amber-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-amber-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Countdown starts as soon as you create the plan.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Deposit (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.depositAmount}
                onChange={(e) => updateField("depositAmount", e.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Profit (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.profitAmount}
                onChange={(e) => updateField("profitAmount", e.target.value)}
                placeholder="48"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => updateField("durationDays", e.target.value)}
                placeholder="40"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                This is the user's investment duration, not the offer timer.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Daily Earning (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={form.dailyEarning}
                onChange={(e) => updateField("dailyEarning", e.target.value)}
                placeholder="2.45"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Total Return (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.totalReturn}
                onChange={(e) => updateField("totalReturn", e.target.value)}
                placeholder="98"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            {(
              ["level1Percent", "level2Percent", "level3Percent"] as const
            ).map((field, index) => (
              <div key={field}>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Level {index + 1} Referral (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>
            ))}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Max Active Purchases Per User
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxPurchasesPerUser}
                onChange={(e) =>
                  updateField("maxPurchasesPerUser", e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Instant Referral Bonus (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.referralBonusUSD}
                onChange={(e) =>
                  updateField("referralBonusUSD", e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Paid instantly to the direct referrer when this plan is purchased.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {form.category === "PREMIUM" && (
              <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4">
                <p className="font-semibold text-amber-300">
                  Premium Badge
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Users who purchase this plan receive the Premium badge.
                </p>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  updateField("status", e.target.value as PlanStatus)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-5">
            <p className="text-sm font-medium text-cyan-300">Plan Preview</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 font-bold">
                  {categoryLabel(form.category)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Deposit</p>
                <p className="mt-1 text-lg font-bold">
                  ${previewDeposit.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Profit</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">
                  ${previewProfit.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Total Return</p>
                <p className="mt-1 text-lg font-bold text-cyan-400">
                  ${previewTotal.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Instant Referral</p>
                <p className="mt-1 text-lg font-bold text-amber-400">
                  ${previewReferralBonus.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={savePlan}
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Plan"
                  : "Create Plan"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Investment Plans</h2>
            <span className="text-sm text-slate-500">
              {plans.length} plans
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
              <p className="text-slate-400">
                No investment plans created yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => {
                const category =
                  plan.category ||
                  (plan.isSpecial ? "PREMIUM" : "NORMAL");

                const expired =
                  category === "LIMITED_TIME" &&
                  plan.expiresAt &&
                  new Date(plan.expiresAt).getTime() <= Date.now();

                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              category === "PREMIUM"
                                ? "bg-amber-500/10 text-amber-400"
                                : category === "LIMITED_TIME"
                                  ? "bg-purple-500/10 text-purple-400"
                                  : "bg-cyan-500/10 text-cyan-400"
                            }`}
                          >
                            {categoryLabel(category)}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {plan.durationDays} days
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          plan.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>

                    {category === "LIMITED_TIME" && (
                      <div className="mt-4 rounded-xl border border-purple-900/50 bg-purple-950/20 p-3 text-sm">
                        <p className="text-purple-300">
                          {expired ? "OFFER EXPIRED" : "Offer expiry"}
                        </p>
                        <p className="mt-1 text-slate-300">
                          {plan.expiresAt
                            ? new Date(plan.expiresAt).toLocaleString()
                            : "No expiry set"}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Deposit</span>
                        <span className="font-semibold">
                          ${Number(plan.depositAmount).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Profit</span>
                        <span className="font-semibold text-emerald-400">
                          ${Number(plan.profitAmount).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Daily Earning</span>
                        <span className="font-semibold text-cyan-400">
                          ${Number(plan.dailyEarning).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Total Return</span>
                        <span className="font-semibold">
                          ${Number(plan.totalReturn).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">
                          Max Active Purchases
                        </span>
                        <span className="font-semibold text-cyan-400">
                          {Number(plan.maxPurchasesPerUser)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">
                          Instant Referral
                        </span>
                        <span className="font-semibold text-amber-400">
                          ${Number(plan.referralBonusUSD).toFixed(2)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-4">
                        <p className="mb-3 text-xs text-slate-500">
                          Referral Rates
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            plan.level1Percent,
                            plan.level2Percent,
                            plan.level3Percent,
                          ].map((rate, index) => (
                            <div key={index}>
                              <p className="text-xs text-slate-500">
                                L{index + 1}
                              </p>
                              <p className="mt-1 font-semibold text-cyan-400">
                                {Number(rate)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => editPlan(plan)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleStatus(plan)}
                        className="rounded-lg border border-cyan-900 px-3 py-2 text-sm text-cyan-400 transition hover:bg-cyan-950/40"
                      >
                        {plan.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Plan Rules</h2>

          <div className="mt-4 grid gap-3 text-sm text-slate-400 md:grid-cols-2">
            <p>• Plans are controlled by admin.</p>
            <p>• All plans use USD.</p>
            <p>• Only published plans are available to users.</p>
            <p>• Premium plans activate the user's Premium badge after purchase.</p>
            <p>• Referral rates are stored with each plan.</p>
            <p>• Max active purchases are controlled per plan.</p>
            <p>• Instant referral bonus is controlled per plan.</p>
            <p>• Limited Time plans expire automatically.</p>
            <p>• Plans with existing investments cannot be deleted.</p>
          </div>
        </section>
      </div>
    </main>
  );
}