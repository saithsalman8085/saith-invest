"use client";

import { useEffect, useMemo, useState } from "react";

type KycProfile = {
  userId: string;
  publicUserId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  cnicNumber: string;
  easypaisaNumber: string;
  accountName: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
};

function StatusBadge({ locked }: { locked: boolean }) {
  return locked ? (
    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
      LOCKED
    </span>
  ) : (
    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
      UNLOCKED
    </span>
  );
}

export default function AdminKycPage() {
  const [profiles, setProfiles] = useState<KycProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProfiles() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/kyc",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load KYC profiles."
        );
      }

      setProfiles(data.profiles || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load KYC profiles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  async function unlockKyc(profile: KycProfile) {
    const confirmed = window.confirm(
      `Unlock withdrawal details for ${profile.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(profile.userId);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/kyc",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: profile.userId,
            action: "UNLOCK",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to unlock KYC."
        );
      }

      setMessage(
        `${profile.fullName}'s KYC has been unlocked.`
      );

      await loadProfiles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to unlock KYC."
      );
    } finally {
      setActionLoading(null);
    }
  }

  const filteredProfiles = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return profiles;
    }

    return profiles.filter((profile) => {
      return (
        profile.fullName
          .toLowerCase()
          .includes(value) ||
        String(profile.email || "")
          .toLowerCase()
          .includes(value) ||
        String(profile.phone || "")
          .toLowerCase()
          .includes(value) ||
        profile.publicUserId
          .toLowerCase()
          .includes(value) ||
        profile.cnicNumber
          .toLowerCase()
          .includes(value) ||
        profile.easypaisaNumber
          .toLowerCase()
          .includes(value)
      );
    });
  }, [profiles, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            KYC Management
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Review withdrawal verification details and manage KYC locks.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search name, email, phone, user ID, CNIC..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/50"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-400">
            Loading KYC profiles...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-400">
            No KYC profiles found.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b border-white/10 bg-slate-950/50">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">
                        User
                      </th>

                      <th className="px-5 py-4">
                        CNIC
                      </th>

                      <th className="px-5 py-4">
                        Easypaisa
                      </th>

                      <th className="px-5 py-4">
                        Account Name
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Updated
                      </th>

                      <th className="px-5 py-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredProfiles.map(
                      (profile) => (
                        <tr
                          key={profile.userId}
                          className="align-top hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-5">
                            <div className="font-semibold">
                              {profile.fullName}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              ID:{" "}
                              {profile.publicUserId}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {profile.email ||
                                profile.phone ||
                                "No contact"}
                            </div>
                          </td>

                          <td className="px-5 py-5 font-mono text-sm text-slate-300">
                            {profile.cnicNumber}
                          </td>

                          <td className="px-5 py-5 text-sm text-slate-300">
                            {profile.easypaisaNumber}
                          </td>

                          <td className="px-5 py-5 text-sm text-slate-300">
                            {profile.accountName}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge
                              locked={
                                profile.isLocked
                              }
                            />
                          </td>

                          <td className="px-5 py-5 text-xs text-slate-500">
                            {new Date(
                              profile.updatedAt
                            ).toLocaleString()}
                          </td>

                          <td className="px-5 py-5">
                            {profile.isLocked ? (
                              <button
                                onClick={() =>
                                  unlockKyc(
                                    profile
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  profile.userId
                                }
                                className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                              >
                                {actionLoading ===
                                profile.userId
                                  ? "Unlocking..."
                                  : "Unlock KYC"}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Already unlocked
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-4 md:hidden">
              {filteredProfiles.map(
                (profile) => (
                  <div
                    key={profile.userId}
                    className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">
                          {profile.fullName}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          ID:{" "}
                          {profile.publicUserId}
                        </p>
                      </div>

                      <StatusBadge
                        locked={
                          profile.isLocked
                        }
                      />
                    </div>

                    <div className="mt-5 space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">
                          CNIC
                        </p>

                        <p className="mt-1 font-mono text-slate-300">
                          {profile.cnicNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Easypaisa
                        </p>

                        <p className="mt-1 text-slate-300">
                          {profile.easypaisaNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Account Name
                        </p>

                        <p className="mt-1 text-slate-300">
                          {profile.accountName}
                        </p>
                      </div>
                    </div>

                    {profile.isLocked && (
                      <button
                        onClick={() =>
                          unlockKyc(
                            profile
                          )
                        }
                        disabled={
                          actionLoading ===
                          profile.userId
                        }
                        className="mt-5 w-full rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        {actionLoading ===
                        profile.userId
                          ? "Unlocking..."
                          : "Unlock KYC"}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </>
        )}

        <footer className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-600">
          ClaudeInvest Admin • 2026
        </footer>
      </div>
    </main>
  );
}