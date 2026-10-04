"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WithdrawalStatus =
| "PENDING"
| "APPROVED"
| "REJECTED";

type Withdrawal = {
id: string;
userId: string;
amountUSD: string | number;
feePercent: string | number;
feeUSD: string | number;
netAmountUSD: string | number;
exchangeRate: string | number;
payoutPKR: string | number;
cnicNumber: string;
easypaisaNumber: string;
accountName: string;
status: WithdrawalStatus;
submittedAt: string;
approvedAt?: string | null;
rejectedAt?: string | null;
rejectionReason?: string | null;
};

export default function AdminWithdrawalsPage() {
const [withdrawals, setWithdrawals] =
useState<Withdrawal[]>([]);

const [search, setSearch] = useState("");

const [filter, setFilter] = useState<
"ALL" | WithdrawalStatus

> ("ALL");

const [loading, setLoading] = useState(true);
const [processingId, setProcessingId] =
useState<string | null>(null);

const [error, setError] = useState("");
const [message, setMessage] = useState("");

useEffect(() => {
loadWithdrawals();
}, []);

async function loadWithdrawals() {
try {
setLoading(true);
setError("");


  const response = await fetch(
    "/api/admin/withdrawals",
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to load withdrawals."
    );
  }

  setWithdrawals(
    data.withdrawals || []
  );
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to load withdrawals."
  );
} finally {
  setLoading(false);
}


}

async function processWithdrawal(
withdrawalId: string,
action: "APPROVE" | "REJECT"
) {
try {
setProcessingId(withdrawalId);
setError("");
setMessage("");


  let rejectionReason = "";

  if (action === "REJECT") {
    const reason = window.prompt(
      "Enter the reason for rejecting this withdrawal:"
    );

    if (!reason?.trim()) {
      return;
    }

    rejectionReason = reason.trim();
  }

  if (action === "APPROVE") {
    const confirmed = window.confirm(
      "Approve this withdrawal? The withdrawal amount and fee will be recorded in the user's wallet ledger."
    );

    if (!confirmed) {
      return;
    }
  }

  const response = await fetch(
    "/api/admin/withdrawals",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        withdrawalId,
        action,
        rejectionReason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Unable to process withdrawal."
    );
  }

  setMessage(
    data.message ||
      "Withdrawal processed successfully."
  );

  await loadWithdrawals();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to process withdrawal."
  );
} finally {
  setProcessingId(null);
}


}

const filteredWithdrawals = useMemo(() => {
const searchText =
search.trim().toLowerCase();


return withdrawals.filter(
  (withdrawal) => {
    const matchesSearch =
      !searchText ||
      withdrawal.id
        .toLowerCase()
        .includes(searchText) ||
      withdrawal.userId
        .toLowerCase()
        .includes(searchText) ||
      withdrawal.accountName
        .toLowerCase()
        .includes(searchText) ||
      withdrawal.easypaisaNumber
        .toLowerCase()
        .includes(searchText);

    const matchesFilter =
      filter === "ALL" ||
      withdrawal.status === filter;

    return (
      matchesSearch &&
      matchesFilter
    );
  }
);


}, [withdrawals, search, filter]);

const pendingCount = withdrawals.filter(
(withdrawal) =>
withdrawal.status === "PENDING"
).length;

function formatDate(value: string) {
try {
return new Date(value).toLocaleString(
"en-PK",
{
dateStyle: "medium",
timeStyle: "short",
}
);
} catch {
return value;
}
}

return ( <main className="min-h-screen bg-slate-950 text-white"> <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link
          href="/admin"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Admin
        </Link>

        <h1 className="mt-3 text-3xl font-bold">
          Withdrawal Requests
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Review and process user withdrawal requests.
        </p>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3">
        <p className="text-xs text-slate-500">
          Pending Requests
        </p>

        <p className="mt-1 text-2xl font-bold text-yellow-400">
          {pendingCount}
        </p>
      </div>
    </div>

    {message && (
      <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
        {message}
      </div>
    )}

    {error && (
      <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )}

    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="grid gap-4 md:grid-cols-2">

        <input
          type="text"
          placeholder="Search ID, User ID, name or Easypaisa..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value as
                | "ALL"
                | WithdrawalStatus
            )
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
        >
          <option value="ALL">
            All Statuses
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="APPROVED">
            Approved
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>

      </div>
    </section>

    {loading ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
        Loading withdrawal requests...
      </div>
    ) : filteredWithdrawals.length === 0 ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
        No withdrawal requests found.
      </div>
    ) : (
      <>
        {/* DESKTOP */}

        <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  <th className="px-5 py-4">
                    Withdrawal
                  </th>

                  <th className="px-5 py-4">
                    User
                  </th>

                  <th className="px-5 py-4">
                    Amount
                  </th>

                  <th className="px-5 py-4">
                    Payment
                  </th>

                  <th className="px-5 py-4">
                    Payout
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWithdrawals.map(
                  (withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-cyan-400">
                          {withdrawal.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Fee{" "}
                          {Number(
                            withdrawal.feePercent
                          ).toFixed(2)}
                          %
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {withdrawal.accountName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          User ID:{" "}
                          {withdrawal.userId}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          CNIC:{" "}
                          {withdrawal.cnicNumber}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          $
                          {Number(
                            withdrawal.amountUSD
                          ).toFixed(2)}
                        </p>

                        <p className="mt-1 text-xs text-red-400">
                          Fee: $
                          {Number(
                            withdrawal.feeUSD
                          ).toFixed(2)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Net: $
                          {Number(
                            withdrawal.netAmountUSD
                          ).toFixed(2)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          Easypaisa
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {
                            withdrawal.easypaisaNumber
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-cyan-400">
                          Rs.{" "}
                          {Number(
                            withdrawal.payoutPKR
                          ).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          1 USD ={" "}
                          {Number(
                            withdrawal.exchangeRate
                          ).toLocaleString()}{" "}
                          PKR
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {formatDate(
                          withdrawal.submittedAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            withdrawal.status
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        {withdrawal.status ===
                        "PENDING" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={
                                processingId ===
                                withdrawal.id
                              }
                              onClick={() =>
                                processWithdrawal(
                                  withdrawal.id,
                                  "APPROVE"
                                )
                              }
                              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processingId ===
                              withdrawal.id
                                ? "..."
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                processingId ===
                                withdrawal.id
                              }
                              onClick={() =>
                                processWithdrawal(
                                  withdrawal.id,
                                  "REJECT"
                                )
                              }
                              className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">
                            Processed
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

        {/* MOBILE */}

        <div className="space-y-4 md:hidden">
          {filteredWithdrawals.map(
            (withdrawal) => (
              <div
                key={withdrawal.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-cyan-400">
                      {withdrawal.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(
                        withdrawal.submittedAt
                      )}
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      withdrawal.status
                    }
                  />
                </div>

                <div className="mt-5 space-y-4 text-sm">

                  <Info
                    label="User"
                    value={
                      withdrawal.accountName
                    }
                  />

                  <Info
                    label="User ID"
                    value={
                      withdrawal.userId
                    }
                  />

                  <Info
                    label="CNIC"
                    value={
                      withdrawal.cnicNumber
                    }
                  />

                  <Info
                    label="Easypaisa"
                    value={
                      withdrawal.easypaisaNumber
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Info
                      label="Withdrawal"
                      value={`$${Number(
                        withdrawal.amountUSD
                      ).toFixed(2)}`}
                    />

                    <Info
                      label="Fee"
                      value={`$${Number(
                        withdrawal.feeUSD
                      ).toFixed(2)}`}
                    />
                  </div>

                  <Info
                    label="Net USD"
                    value={`$${Number(
                      withdrawal.netAmountUSD
                    ).toFixed(2)}`}
                  />

                  <Info
                    label="Payout"
                    value={`Rs. ${Number(
                      withdrawal.payoutPKR
                    ).toLocaleString()}`}
                  />

                </div>

                {withdrawal.status ===
                  "PENDING" && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={
                        processingId ===
                        withdrawal.id
                      }
                      onClick={() =>
                        processWithdrawal(
                          withdrawal.id,
                          "APPROVE"
                        )
                      }
                      className="rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {processingId ===
                      withdrawal.id
                        ? "..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        withdrawal.id
                      }
                      onClick={() =>
                        processWithdrawal(
                          withdrawal.id,
                          "REJECT"
                        )
                      }
                      className="rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-400 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {withdrawal.status ===
                  "REJECTED" &&
                  withdrawal.rejectionReason && (
                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-xs text-red-400">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {
                          withdrawal.rejectionReason
                        }
                      </p>
                    </div>
                  )}
              </div>
            )
          )}
        </div>
      </>
    )}

  </div>
</main>


);
}

function StatusBadge({
status,
}: {
status: WithdrawalStatus;
}) {
const styles = {
PENDING:
"border-yellow-500/30 bg-yellow-500/10 text-yellow-400",


APPROVED:
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",

REJECTED:
  "border-red-500/30 bg-red-500/10 text-red-400",


};

return (
<span
className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
>
{status} </span>
);
}

function Info({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div> <p className="text-xs text-slate-500">
{label} </p>


  <p className="mt-1 break-all font-medium text-slate-200">
    {value}
  </p>
</div>


);
}
