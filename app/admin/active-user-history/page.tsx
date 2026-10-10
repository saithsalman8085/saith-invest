
"use client";

import { useState } from "react";

type Referral = {
  id: string;
  publicUserId: string;
  fullName: string;
  status: string;
  hasInvestment: boolean;
};

type HistoryResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    publicUserId: string;
    fullName: string;
    referralCode: string;
  };
  stats?: {
    totalUsersBelow: number;
    totalInvites: number;
    totalActiveUsers: number;
  };
  levels?: {
    level1: Referral[];
    level2: Referral[];
    level3: Referral[];
  };
};

export default function ActiveUserHistoryPage() {
  const [userId, setUserId] = useState("");
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = userId.trim();

    if (!query) {
      setError("Please enter a User ID.");
      setData(null);
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch(
        `/api/admin/active-user-history?userId=${encodeURIComponent(query)}`,
        { method: "GET", cache: "no-store" }
      );

      const result: HistoryResponse = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Unable to find user history.");
        return;
      }

      setData(result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <a
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Back to Admin Dashboard
          </a>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Active User History
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Search a user ID to view referral levels and active-user history.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg sm:p-6">
          <form
            onSubmit={searchUser}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter Public User ID or internal User ID"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search User"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        {data?.user && data.stats && data.levels && (
          <div className="mt-8 space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <p className="text-sm text-slate-400">Searched User</p>

              <h2 className="mt-1 text-xl font-bold">
                {data.user.fullName || "Unnamed User"}
              </h2>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-slate-500">Public User ID</p>
                  <p className="mt-1 break-all font-medium text-cyan-300">
                    {data.user.publicUserId}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-slate-500">Referral Code</p>
                  <p className="mt-1 break-all font-medium">
                    {data.user.referralCode}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Total Users Below"
                value={data.stats.totalUsersBelow}
                description="Unique referrals across Levels 1–3"
              />

              <StatCard
                title="Total Invites"
                value={data.stats.totalInvites}
                description="Direct Level 1 referrals"
              />

              <StatCard
                title="Total Active Users"
                value={data.stats.totalActiveUsers}
                description="Referrals with at least one non-cancelled investment"
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <LevelCount
                title="Level 1"
                count={data.levels.level1.length}
              />
              <LevelCount
                title="Level 2"
                count={data.levels.level2.length}
              />
              <LevelCount
                title="Level 3"
                count={data.levels.level3.length}
              />
            </section>

            <section className="space-y-5">
              <ReferralTable title="Level 1 — Direct Referrals" users={data.levels.level1} />
              <ReferralTable title="Level 2 — Second-Level Referrals" users={data.levels.level2} />
              <ReferralTable title="Level 3 — Third-Level Referrals" users={data.levels.level3} />
            </section>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-800 px-6 py-12 text-center">
            <div className="text-4xl">📋</div>
            <h2 className="mt-4 text-lg font-semibold">
              Search User History
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter a Public User ID or internal User ID to see referral history.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-cyan-300">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function LevelCount({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold">{count}</p>
    </div>
  );
}

function ReferralTable({
  title,
  users,
}: {
  title: string;
  users: Referral[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {users.length} users
        </span>
      </div>

      {users.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">
          No users found in this level.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">User ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Account Status</th>
                <th className="px-5 py-3 font-medium">Investment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-medium text-cyan-300">
                    {user.publicUserId}
                  </td>
                  <td className="px-5 py-4 text-slate-200">
                    {user.fullName || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.hasInvestment ? (
                      <span className="text-emerald-400">Active</span>
                    ) : (
                      <span className="text-slate-500">No active investment</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
