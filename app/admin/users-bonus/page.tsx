
"use client";

import { useEffect, useState } from "react";

type BonusMode = "ALL_USERS" | "SINGLE_USER";

type BonusCode = {
  id: string;
  code: string;
  type: "ALL_USERS" | "SINGLE_USER";
  status: string;
  poolAmount: string | number;
  distributedAmount: string | number;
  maxClaims: number;
  claimCount: number;
  assignedUserId?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  claims?: any[];
};

export default function UsersBonusPage() {
  const [mode, setMode] = useState<BonusMode>("ALL_USERS");

  const [poolAmount, setPoolAmount] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [userId, setUserId] = useState("");
  const [singleAmount, setSingleAmount] = useState("");
  const [expiry, setExpiry] = useState("");

  const [search, setSearch] = useState("");
  const [codes, setCodes] = useState<BonusCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedCode, setSelectedCode] = useState<BonusCode | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");

  const allUserPerPerson =
    Number(poolAmount) > 0 && Number(maxUsers) > 0
      ? Number(poolAmount) / Number(maxUsers)
      : 0;

  // Load bonus codes
  const loadCodes = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/users-bonus", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Bonus codes load nahi ho sake.");
      }

      setCodes(data.codes || []);
    } catch (err: any) {
      setError(err.message || "Bonus codes load karne mein error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  // Create bonus code
  const handleGenerate = async () => {
    setError("");
    setMessage("");
    setGeneratedCode("");

    if (mode === "ALL_USERS") {
      if (Number(poolAmount) <= 0) {
        setError("Total bonus pool amount enter karein.");
        return;
      }

      if (
        !Number.isInteger(Number(maxUsers)) ||
        Number(maxUsers) <= 0
      ) {
        setError("Maximum users ki valid quantity enter karein.");
        return;
      }
    }

    if (mode === "SINGLE_USER") {
      if (!/^\d{6}$/.test(userId)) {
        setError("Valid 6-digit User ID enter karein.");
        return;
      }

      if (Number(singleAmount) <= 0) {
        setError("Valid bonus amount enter karein.");
        return;
      }
    }

    try {
      setCreating(true);

      const payload = {
        type: mode,
        poolAmount:
          mode === "ALL_USERS" ? Number(poolAmount) : Number(singleAmount),
        maxClaims: mode === "ALL_USERS" ? Number(maxUsers) : 1,
        publicUserId: mode === "SINGLE_USER" ? userId : undefined,
        expiryHours: expiry ? Number(expiry) : null,
      };

      const response = await fetch("/api/admin/users-bonus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Bonus code generate nahi hua.");
      }

      const newCode = data.code?.code || "";

      setGeneratedCode(newCode);
      setMessage(data.message || "Bonus code successfully generate ho gaya!");

      // Clear form
      setPoolAmount("");
      setMaxUsers("");
      setUserId("");
      setSingleAmount("");
      setExpiry("");

      // Refresh history and stats
      await loadCodes();
    } catch (err: any) {
      setError(err.message || "Bonus code create karne mein error.");
    } finally {
      setCreating(false);
    }
  };

  // Stats
  const totalDistributed = codes.reduce(
    (total, code) => total + Number(code.distributedAmount || 0),
    0
  );

  const activeCodes = codes.filter(
    (code) => code.status === "ACTIVE"
  ).length;

  const totalClaims = codes.reduce(
    (total, code) => total + Number(code.claimCount || 0),
    0
  );

  // Search
  const filteredCodes = codes.filter((code) => {
    const searchText = search.toLowerCase();

    return (
      code.code?.toLowerCase().includes(searchText) ||
      code.type?.toLowerCase().includes(searchText) ||
      String(code.assignedUserId || "").includes(searchText)
    );
  });

  const formatMoney = (value: number | string) =>
    `$${Number(value || 0).toFixed(2)}`;

  const getRemaining = (code: BonusCode) =>
    Math.max(
      0,
      Number(code.poolAmount || 0) -
        Number(code.distributedAmount || 0)
    );

  const getStatus = (code: BonusCode) => {
    if (code.status === "COMPLETED") return "COMPLETED";
    if (code.status === "INACTIVE") return "INACTIVE";
    if (code.status === "EXPIRED") return "EXPIRED";

    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return "EXPIRED";
    }

    if (
      getRemaining(code) <= 0 ||
      code.claimCount >= code.maxClaims
    ) {
      return "COMPLETED";
    }

    return code.status || "ACTIVE";
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "EXPIRED":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Bonus code copy ho gaya!");
    } catch {
      setError("Code copy nahi ho saka.");
    }
  };

  return (
    <div className="min-h-screen bg-[#080b12] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              🎁 Users Bonus
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Create bonus codes and manage reward distributions.
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-xl border border-gray-700 bg-[#111827] px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-800"
          >
            ← Back to Admin
          </a>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
            <button
              onClick={() => setError("")}
              className="ml-3 text-red-400"
            >
              ✕
            </button>
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-800 bg-green-950/30 p-4 text-sm text-green-300">
            {message}
            <button
              onClick={() => setMessage("")}
              className="ml-3 text-green-400"
            >
              ✕
            </button>
          </div>
        )}

        {/* Generated Code */}
        {generatedCode && (
          <div className="rounded-2xl border border-green-700 bg-green-950/20 p-5">
            <p className="text-sm text-green-300">
              🎉 New Bonus Code Successfully Created
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-green-800 bg-black/30 px-5 py-3 font-mono text-xl font-bold tracking-wider">
                {generatedCode}
              </div>

              <button
                onClick={() => copyCode(generatedCode)}
                className="rounded-xl bg-green-600 px-4 py-3 font-semibold transition hover:bg-green-700"
              >
                📋 Copy Code
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Bonus Codes",
              value: loading ? "..." : codes.length.toLocaleString(),
              icon: "🎟️",
              color: "text-blue-400",
            },
            {
              title: "Total Distributed",
              value: loading ? "..." : formatMoney(totalDistributed),
              icon: "💰",
              color: "text-green-400",
            },
            {
              title: "Active Codes",
              value: loading ? "..." : activeCodes.toLocaleString(),
              icon: "🟢",
              color: "text-emerald-400",
            },
            {
              title: "Total Claims",
              value: loading ? "..." : totalClaims.toLocaleString(),
              icon: "👥",
              color: "text-purple-400",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-800 bg-[#111827] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{stat.title}</p>
                <span className="text-xl">{stat.icon}</span>
              </div>

              <h2 className={`mt-3 text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Create Bonus */}
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5 sm:p-6">
          <h2 className="text-xl font-bold">Create Bonus Code</h2>

          <p className="mt-1 text-sm text-gray-400">
            Select bonus type and configure reward details.
          </p>

          {/* Tabs */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("ALL_USERS")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "ALL_USERS"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 bg-[#0b1220] hover:border-gray-500"
              }`}
            >
              <div className="text-lg font-semibold">
                🌍 All Users Bonus
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Create a shared bonus pool for multiple users.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("SINGLE_USER")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "SINGLE_USER"
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-gray-700 bg-[#0b1220] hover:border-gray-500"
              }`}
            >
              <div className="text-lg font-semibold">
                👤 Single User Bonus
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Create a bonus code for a specific user.
              </p>
            </button>
          </div>

          {/* All Users Form */}
          {mode === "ALL_USERS" && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Total Bonus Pool (USD)
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Example: 1000"
                    value={poolAmount}
                    onChange={(e) => setPoolAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Maximum Users
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Example: 2500"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Expiry (Optional)
                  </label>

                  <input
  type="number"
  min="1"
  step="1"
  placeholder="Example: 1 hour"
  value={expiry}
  onChange={(e) => setExpiry(e.target.value)}
  className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-blue-500"
/>

                  <p className="mt-1 text-xs text-gray-500">
                    Code can also expire automatically when the pool is exhausted.
                  </p>
                </div>
              </div>

              {/* Calculation */}
              <div className="rounded-xl border border-blue-900 bg-blue-950/30 p-4">
                <h3 className="font-semibold text-blue-300">
                  Bonus Distribution Preview
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">Total Pool</p>
                    <p className="mt-1 text-lg font-bold">
                      ${Number(poolAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Maximum Claims</p>
                    <p className="mt-1 text-lg font-bold">
                      {Number(maxUsers || 0).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Per User</p>
                    <p className="mt-1 text-lg font-bold text-green-400">
                      ${allUserPerPerson.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={creating}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {creating
                  ? "Generating..."
                  : "Generate All Users Bonus Code"}
              </button>
            </div>
          )}

          {/* Single User Form */}
          {mode === "SINGLE_USER" && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    User ID (6 Digits)
                  </label>

                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter User ID"
                    value={userId}
                    onChange={(e) =>
                      setUserId(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bonus Amount (USD)
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Example: 10"
                    value={singleAmount}
                    onChange={(e) => setSingleAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Expiry (Optional)
                  </label>

                  <input
                    type="datetime-local"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-purple-900 bg-purple-950/30 p-4">
                <p className="text-sm text-purple-300">
                  🔒 This bonus code will only be redeemable by the assigned
                  user. Other users will not be able to claim it.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={creating}
                className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {creating
                  ? "Generating..."
                  : "Generate Single User Bonus Code"}
              </button>
            </div>
          )}
        </div>

        {/* History */}
        <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Bonus Codes History</h2>
              <p className="mt-1 text-sm text-gray-400">
                Manage bonus codes and view their distribution.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search bonus code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-2.5 outline-none focus:border-blue-500 sm:w-64"
              />

              <button
                onClick={loadCodes}
                disabled={loading}
                className="rounded-xl border border-gray-700 bg-[#0b1220] px-4 py-2.5 text-sm transition hover:bg-gray-800 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-237.5 text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-4 py-3">Bonus Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Total Pool</th>
                  <th className="px-4 py-3">Claimed</th>
                  <th className="px-4 py-3">Distributed</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      Loading bonus codes...
                    </td>
                  </tr>
                ) : filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="text-3xl">🎁</div>
                      <p className="mt-3 font-medium text-gray-300">
                        {search ? "No matching bonus codes" : "No bonus codes yet"}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Search ko change karke dobara try karein."
                          : "Bonus codes will appear here after creation."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code) => {
                    const status = getStatus(code);

                    return (
                      <tr
                        key={code.id}
                        className="border-b border-gray-800 transition hover:bg-white/2"
                      >
                        <td className="px-4 py-4">
                          <div className="font-mono font-semibold text-white">
                            {code.code}
                          </div>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                          >
                            📋 Copy
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          {code.type === "ALL_USERS" ? (
                            <span className="text-blue-300">🌍 All Users</span>
                          ) : (
                            <span className="text-purple-300">👤 Single User</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {formatMoney(code.poolAmount)}
                        </td>

                        <td className="px-4 py-4">
                          {code.claimCount || 0} / {code.maxClaims}
                        </td>

                        <td className="px-4 py-4 text-green-400">
                          {formatMoney(code.distributedAmount)}
                        </td>

                        <td className="px-4 py-4 text-yellow-400">
                          {formatMoney(getRemaining(code))}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(status)}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedCode(code)}
                            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs transition hover:bg-gray-700"
                          >
                            👁️ View Claims
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claims Modal */}
        {selectedCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-800 bg-[#111827] shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 p-5">
                <div>
                  <h2 className="text-lg font-bold">Bonus Claims</h2>
                  <p className="mt-1 font-mono text-sm text-blue-400">
                    {selectedCode.code}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCode(null)}
                  className="rounded-lg bg-gray-800 px-3 py-2 hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-[#0b1220] p-3">
                    <p className="text-xs text-gray-400">Pool</p>
                    <p className="mt-1 font-bold">
                      {formatMoney(selectedCode.poolAmount)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0b1220] p-3">
                    <p className="text-xs text-gray-400">Claims</p>
                    <p className="mt-1 font-bold">
                      {selectedCode.claimCount}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0b1220] p-3">
                    <p className="text-xs text-gray-400">Distributed</p>
                    <p className="mt-1 font-bold text-green-400">
                      {formatMoney(selectedCode.distributedAmount)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0b1220] p-3">
                    <p className="text-xs text-gray-400">Remaining</p>
                    <p className="mt-1 font-bold text-yellow-400">
                      {formatMoney(getRemaining(selectedCode))}
                    </p>
                  </div>
                </div>

                {selectedCode.claims?.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-125 text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="px-3 py-3">User</th>
                          <th className="px-3 py-3">Amount</th>
                          <th className="px-3 py-3">Claimed At</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedCode.claims.map((claim: any, index: number) => (
                          <tr
                            key={claim.id || index}
                            className="border-b border-gray-800"
                          >
                            <td className="px-3 py-3">
                              <div className="font-medium">
                                {claim.user?.fullName || "User"}
                              </div>
                              <div className="text-xs text-gray-500">
                                UID: {claim.user?.publicUserId || claim.publicUserId || claim.userId || "—"}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-green-400">
                              {formatMoney(
                                claim.amountUSD ??
                                  claim.amount ??
                                  claim.claimAmount ??
                                  0
                              )}
                            </td>

                            <td className="px-3 py-3 text-gray-400">
                              {claim.createdAt
                                ? new Date(claim.createdAt).toLocaleString()
                                : claim.claimedAt
                                  ? new Date(claim.claimedAt).toLocaleString()
                                  : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-400">
                    <div className="text-3xl">👥</div>
                    <p className="mt-3">Abhi tak kisi user ne code claim nahi kiya.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
