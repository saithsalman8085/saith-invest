"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DepositStatus = "PENDING" | "APPROVED" | "REJECTED";

type Deposit = {
id: string;
userId: string;
amountPKR: string | number;
creditAmountUSD: string | number;
paymentMethod: string;
transactionId: string;
status: DepositStatus;
submittedAt: string;
approvedAt?: string | null;
rejectedAt?: string | null;
rejectionReason?: string | null;
};

export default function AdminDepositsPage() {
const [deposits, setDeposits] = useState<Deposit[]>([]);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState<"ALL" | DepositStatus>("ALL");
const [loading, setLoading] = useState(true);
const [processingId, setProcessingId] = useState<string | null>(null);
const [error, setError] = useState("");

async function loadDeposits() {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/admin/deposits", {
    method: "GET",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to load deposits.");
  }

  setDeposits(data.deposits || []);
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load deposits."
  );
} finally {
  setLoading(false);
}


}

useEffect(() => {
loadDeposits();
}, []);

async function updateStatus(
depositId: string,
action: "APPROVE" | "REJECT"
) {
let rejectionReason = "";


if (action === "REJECT") {
  rejectionReason =
    window.prompt("Enter rejection reason:")?.trim() || "";

  if (!rejectionReason) {
    return;
  }
}

const confirmed =
  action === "APPROVE"
    ? window.confirm(
        "Approve this deposit and credit the user's wallet?"
      )
    : window.confirm("Reject this deposit?");

if (!confirmed) {
  return;
}

try {
  setProcessingId(depositId);
  setError("");

  const response = await fetch("/api/admin/deposits", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depositId,
      action,
      rejectionReason,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to update deposit.");
  }

  await loadDeposits();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to update deposit."
  );
} finally {
  setProcessingId(null);
}


}

const filteredDeposits = useMemo(() => {
const query = search.toLowerCase().trim();


return deposits.filter((deposit) => {
  const matchesSearch =
    !query ||
    deposit.id.toLowerCase().includes(query) ||
    deposit.userId.toLowerCase().includes(query) ||
    deposit.transactionId.toLowerCase().includes(query) ||
    deposit.paymentMethod.toLowerCase().includes(query);

  const matchesFilter =
    filter === "ALL" || deposit.status === filter;

  return matchesSearch && matchesFilter;
});


}, [deposits, search, filter]);

const pendingCount = deposits.filter(
(deposit) => deposit.status === "PENDING"
).length;

return ( <main className="min-h-screen bg-[#020617] text-white"> <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/admin"
          className="mb-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Admin
        </Link>

        <h1 className="text-3xl font-bold">
          Deposit Requests
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Review and manage user deposit requests.
        </p>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
        <span className="text-slate-400">
          Pending:
        </span>{" "}
        <span className="font-semibold text-yellow-300">
          {pendingCount}
        </span>
      </div>
    </div>

    {error && (
      <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {error}
      </div>
    )}

    <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-[#0f172a] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Search user ID, transaction ID or deposit ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as "ALL" | DepositStatus
            )
          }
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </div>

    {loading ? (
      <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-10 text-center text-slate-400">
        Loading deposit requests...
      </div>
    ) : (
      <>
        <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/70">
                <tr>
                  <th className="px-5 py-4">Deposit ID</th>
                  <th className="px-5 py-4">User ID</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Transaction ID</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredDeposits.map((deposit) => {
                  const amountPKR = Number(deposit.amountPKR);
                  const amountUSD = Number(
                    deposit.creditAmountUSD
                  );

                  return (
                    <tr
                      key={deposit.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-5 py-4 font-medium text-cyan-400">
                        {deposit.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {deposit.userId}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          PKR {amountPKR.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          ≈ ${amountUSD.toFixed(2)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {deposit.paymentMethod}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-300">
                        {deposit.transactionId}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(deposit.submittedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={deposit.status} />
                      </td>

                      <td className="px-5 py-4">
                        {deposit.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              disabled={
                                processingId === deposit.id
                              }
                              onClick={() =>
                                updateStatus(
                                  deposit.id,
                                  "APPROVE"
                                )
                              }
                              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processingId === deposit.id
                                ? "..."
                                : "Approve"}
                            </button>

                            <button
                              disabled={
                                processingId === deposit.id
                              }
                              onClick={() =>
                                updateStatus(
                                  deposit.id,
                                  "REJECT"
                                )
                              }
                              className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4 md:hidden">
          {filteredDeposits.map((deposit) => {
            const amountPKR = Number(deposit.amountPKR);
            const amountUSD = Number(
              deposit.creditAmountUSD
            );

            return (
              <div
                key={deposit.id}
                className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">
                    {deposit.id}
                  </span>

                  <StatusBadge status={deposit.status} />
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500">
                      User ID
                    </p>
                    <p className="font-medium">
                      {deposit.userId}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-slate-500">
                        Amount
                      </p>
                      <p className="font-semibold">
                        PKR {amountPKR.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        ≈ ${amountUSD.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-slate-500">
                        Method
                      </p>
                      <p>{deposit.paymentMethod}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Transaction ID
                    </p>
                    <p className="break-all">
                      {deposit.transactionId}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Date
                    </p>
                    <p>
                      {formatDate(deposit.submittedAt)}
                    </p>
                  </div>

                  {deposit.status === "REJECTED" &&
                    deposit.rejectionReason && (
                      <div>
                        <p className="text-slate-500">
                          Rejection Reason
                        </p>
                        <p className="text-red-300">
                          {deposit.rejectionReason}
                        </p>
                      </div>
                    )}
                </div>

                {deposit.status === "PENDING" && (
                  <div className="mt-5 flex gap-2">
                    <button
                      disabled={
                        processingId === deposit.id
                      }
                      onClick={() =>
                        updateStatus(
                          deposit.id,
                          "APPROVE"
                        )
                      }
                      className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      disabled={
                        processingId === deposit.id
                      }
                      onClick={() =>
                        updateStatus(
                          deposit.id,
                          "REJECT"
                        )
                      }
                      className="flex-1 rounded-lg border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredDeposits.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-10 text-center text-slate-400">
            No deposit requests found.
          </div>
        )}
      </>
    )}
  </div>
</main>


);
}

function formatDate(value: string | null | undefined) {
if (!value) {
return "—";
}

try {
return new Date(value).toLocaleString();
} catch {
return "—";
}
}

function StatusBadge({
status,
}: {
status: DepositStatus;
}) {
const classes = {
PENDING:
"border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
APPROVED:
"border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
REJECTED:
"border-red-500/30 bg-red-500/10 text-red-300",
};

const labels = {
PENDING: "Pending",
APPROVED: "Approved",
REJECTED: "Rejected",
};

return (
<span
className={`rounded-full border px-3 py-1 text-xs font-medium ${classes[status]}`}
>
{labels[status]} </span>
);
}
