
"use client";

import { useCallback, useEffect, useState } from "react";

type Appeal = {
  id: string;
  userId: string;
  message: string;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  user?: {
    id: string;
    publicUserId?: string | null;
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string;
  } | null;
};

export default function AccountAppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAppeals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/account-appeals", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load appeals.");
      }

      setAppeals(Array.isArray(data.appeals) ? data.appeals : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load appeals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppeals();
  }, [loadAppeals]);

  async function reviewAppeal(
    appealId: string,
    decision: "APPROVED" | "REJECTED"
  ) {
    const appeal = appeals.find((item) => item.id === appealId);

    if (!appeal) return;

    const confirmed = window.confirm(
      decision === "APPROVED"
        ? "Approve this appeal and reactivate the user account?"
        : "Reject this account appeal?"
    );

    if (!confirmed) return;

    setBusyId(appealId);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/account-appeals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealId,
          decision,
          adminNote: notes[appealId] || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to review appeal.");
      }

      setNotice(data.message || "Appeal reviewed successfully.");
      await loadAppeals();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to review appeal."
      );
    } finally {
      setBusyId("");
    }
  }

  const filteredAppeals = appeals.filter((appeal) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        appeal.id,
        appeal.userId,
        appeal.user?.publicUserId,
        appeal.user?.fullName,
        appeal.user?.email,
        appeal.user?.phone,
        appeal.message,
      ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" || appeal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = appeals.filter(
    (appeal) => appeal.status === "PENDING"
  ).length;

  const approvedCount = appeals.filter(
    (appeal) => appeal.status === "APPROVED"
  ).length;

  const rejectedCount = appeals.filter(
    (appeal) => appeal.status === "REJECTED"
  ).length;

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-500";

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Account Appeals
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Review suspended users&apos; requests for reactivation.
            </p>
          </div>

          <button
            onClick={() => void loadAppeals()}
            disabled={loading}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium hover:border-yellow-500 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-green-800 bg-green-950/40 p-3 text-sm text-green-300">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-400">Pending Appeals</p>
            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-400">Approved</p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm text-gray-400">Rejected</p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {rejectedCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user ID, name, email, phone..."
            className={inputClass}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="ALL">All Appeals</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-10 text-center text-gray-400">
            Loading appeals...
          </div>
        ) : filteredAppeals.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-10 text-center">
            <p className="font-medium">No appeals found</p>
            <p className="mt-2 text-sm text-gray-500">
              Appeals matching your search will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="rounded-xl border border-gray-800 bg-gray-950 p-4 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {appeal.user?.fullName || "Unknown User"}
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-400">
                      Public ID: {appeal.user?.publicUserId || "N/A"}
                    </p>

                    <p className="break-all text-sm text-gray-400">
                      User ID: {appeal.userId}
                    </p>

                    <p className="break-all text-sm text-gray-400">
                      {appeal.user?.email || appeal.user?.phone || "No contact details"}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                      appeal.status === "PENDING"
                        ? "border-yellow-700 bg-yellow-950 text-yellow-300"
                        : appeal.status === "APPROVED"
                          ? "border-green-700 bg-green-950 text-green-300"
                          : "border-red-700 bg-red-950 text-red-300"
                    }`}
                  >
                    {appeal.status}
                  </span>
                </div>

                <div className="mt-5 rounded-lg border border-gray-800 bg-black p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Appeal Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-200">
                    {appeal.message}
                  </p>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Submitted:{" "}
                  {new Date(appeal.createdAt).toLocaleString()}
                </div>

                {appeal.adminNote && (
                  <div className="mt-3 text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">
                      Previous admin note:
                    </span>{" "}
                    {appeal.adminNote}
                  </div>
                )}

                {appeal.status === "PENDING" && (
                  <div className="mt-5 space-y-3">
                    <textarea
                      value={notes[appeal.id] || ""}
                      onChange={(event) =>
                        setNotes((previous) => ({
                          ...previous,
                          [appeal.id]: event.target.value,
                        }))
                      }
                      placeholder="Optional note for this decision..."
                      rows={3}
                      maxLength={1000}
                      className={inputClass}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        onClick={() =>
                          void reviewAppeal(appeal.id, "REJECTED")
                        }
                        disabled={busyId === appeal.id}
                        className="rounded-lg border border-red-800 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-950 disabled:opacity-50"
                      >
                        {busyId === appeal.id ? "Processing..." : "Reject"}
                      </button>

                      <button
                        onClick={() =>
                          void reviewAppeal(appeal.id, "APPROVED")
                        }
                        disabled={busyId === appeal.id}
                        className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-yellow-400 disabled:opacity-50"
                      >
                        {busyId === appeal.id ? "Processing..." : "Approve & Reactivate"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
