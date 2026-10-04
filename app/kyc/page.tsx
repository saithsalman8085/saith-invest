
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import MainNav from "@/components/MainNav";

type KycData = {
  cnicNumber: string;
  easypaisaNumber: string;
  accountName: string;
  isLocked: boolean;
};

export default function KycPage() {
  const [cnic, setCnic] = useState("");
  const [easypaisa, setEasypaisa] = useState("");
  const [accountName, setAccountName] = useState("");

  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadKyc() {
      try {
        const response = await fetch("/api/kyc");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load KYC details.");
          return;
        }

        if (data.kyc) {
          setKyc(data.kyc);
          setCnic(data.kyc.cnicNumber);
          setEasypaisa(data.kyc.easypaisaNumber);
          setAccountName(data.kyc.accountName);
        }
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadKyc();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!cnic.trim() || !easypaisa.trim() || !accountName.trim()) {
      setError("Please fill all KYC fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnicNumber: cnic,
          easypaisaNumber: easypaisa,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to save KYC details.");
        return;
      }

      setKyc(data.kyc);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const locked = Boolean(kyc?.isLocked);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 pb-24 text-white">
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
        <div className="mx-auto max-w-3xl">

          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Withdrawal Verification
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Withdrawal KYC
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your withdrawal account information is securely linked to your
              account.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-7">

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <p className="text-sm text-slate-500">
                  Loading KYC details...
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
                  <p className="text-sm font-semibold text-amber-400">
                    Important
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Once submitted, your withdrawal details are locked.
                    Changes require administrator approval.
                  </p>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3">
                    <p className="text-xs leading-5 text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <div className="mt-7 space-y-5">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      CNIC Number
                    </label>

                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      disabled={locked || saving}
                      placeholder="35202-1234567-1"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Easypaisa Number
                    </label>

                    <input
                      type="text"
                      value={easypaisa}
                      onChange={(e) => setEasypaisa(e.target.value)}
                      disabled={locked || saving}
                      placeholder="03XXXXXXXXX"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Account Name
                    </label>

                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      disabled={locked || saving}
                      placeholder="Enter account holder name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                </div>

                {locked ? (
                  <div className="mt-7 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-emerald-400">
                          KYC Verified & Locked
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Contact the administrator if these details need to
                          be changed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="mt-7 w-full rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Submit KYC Details"}
                  </button>
                )}
              </>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/withdraw"
              className="hidden flex-1 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-center text-xs font-semibold text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 sm:flex"
            >
              ← Back to Withdraw
            </Link>

            <Link
              href="/profile"
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-center text-xs font-semibold text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400"
            >
              Profile
            </Link>
          </div>

          <div className="py-6 text-center text-[10px] text-slate-600 sm:text-xs">
            ClaudeInvest © 2025
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}