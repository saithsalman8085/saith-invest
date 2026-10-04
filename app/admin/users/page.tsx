"use client";

import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  publicUserId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  referralCode: string;
  status: string;
  role: string;
  premiumBadge?: boolean;
  createdAt: string;
};

type ResetResult = {
  userId: string;
  fullName: string;
  temporaryPassword: string;
} | null;

type EditUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
} | null;

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const className =
    normalized === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : normalized === "SUSPENDED"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {normalized}
    </span>
  );
}

function ActionButtons({
  user,
  loading,
  onStatusChange,
  onResetPassword,
  onEdit,
}: {
  user: User;
  loading: string | null;
  onStatusChange: (user: User, action: string) => void;
  onResetPassword: (user: User) => void;
  onEdit: (user: User) => void;
}) {
  if (user.role === "ADMIN") {
    return (
      <span className="text-xs text-slate-500">
        Admin account protected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onEdit(user)}
        disabled={loading === user.id}
        className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
      >
        Edit
      </button>

      {user.status === "ACTIVE" && (
        <>
          <button
            onClick={() => onStatusChange(user, "SUSPEND")}
            disabled={loading === user.id}
            className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            Suspend
          </button>

          <button
            onClick={() => onStatusChange(user, "BLOCK")}
            disabled={loading === user.id}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            Block
          </button>
        </>
      )}

      {user.status === "SUSPENDED" && (
        <>
          <button
            onClick={() => onStatusChange(user, "ACTIVATE")}
            disabled={loading === user.id}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Activate
          </button>

          <button
            onClick={() => onStatusChange(user, "BLOCK")}
            disabled={loading === user.id}
            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            Block
          </button>
        </>
      )}

      {user.status === "BLOCKED" && (
        <button
          onClick={() => onStatusChange(user, "ACTIVATE")}
          disabled={loading === user.id}
          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          Activate
        </button>
      )}

      <button
        onClick={() => onResetPassword(user)}
        disabled={loading === user.id}
        className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
      >
        Reset Password
      </button>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetResult, setResetResult] =
    useState<ResetResult>(null);

  const [editUser, setEditUser] =
    useState<EditUser>(null);

  async function loadUsers() {
    try {
      setPageLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load users."
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users."
      );
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function onEdit(user: User) {
    setMessage("");
    setError("");

    setEditUser({
      id: user.id,
      fullName: user.fullName,
      email: user.email || "",
      phone: user.phone || "",
    });
  }

  async function saveUserChanges() {
    if (!editUser) {
      return;
    }

    if (!editUser.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setLoading(editUser.id);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: editUser.id,
            action: "EDIT",
            fullName: editUser.fullName,
            email: editUser.email,
            phone: editUser.phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update user details."
        );
      }

      setEditUser(null);

      setMessage(
        data.message ||
          "User details updated successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user details."
      );
    } finally {
      setLoading(null);
    }
  }

  async function onStatusChange(
    user: User,
    action: string
  ) {
    const actionText =
      action === "SUSPEND"
        ? "suspend"
        : action === "BLOCK"
          ? "block"
          : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(user.id);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/users",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update user."
        );
      }

      setMessage(
        data.message ||
          "User updated successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user."
      );
    } finally {
      setLoading(null);
    }
  }

  async function onResetPassword(user: User) {
    const confirmed = window.confirm(
      `Reset password for ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(user.id);
      setMessage("");
      setError("");
      setResetResult(null);

      const response = await fetch(
        "/api/admin/users/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to reset password."
        );
      }

      setResetResult({
        userId: user.id,
        fullName: user.fullName,
        temporaryPassword:
          data.temporaryPassword,
      });

      setMessage(
        "Password reset successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(null);
    }
  }

  async function copyTemporaryPassword() {
    if (!resetResult) {
      return;
    }

    await navigator.clipboard.writeText(
      resetResult.temporaryPassword
    );

    setMessage(
      "Temporary password copied."
    );
  }

  const filteredUsers = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.fullName
          .toLowerCase()
          .includes(value) ||
        String(user.email || "")
          .toLowerCase()
          .includes(value) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(value) ||
        user.publicUserId
          .toLowerCase()
          .includes(value) ||
        user.referralCode
          .toLowerCase()
          .includes(value)
      );
    });
  }, [users, search]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Search users, manage account status,
            edit details, and reset passwords.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {editUser && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  Edit User
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update the user's basic account details.
                </p>
              </div>

              <button
                onClick={() => setEditUser(null)}
                disabled={loading === editUser.id}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Full Name
                </label>

                <input
                  value={editUser.fullName}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,
                      fullName:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Email
                </label>

                <input
                  type="email"
                  value={editUser.email}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,
                      email:
                        event.target.value,
                    })
                  }
                  placeholder="No email"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Phone
                </label>

                <input
                  value={editUser.phone}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,
                      phone:
                        event.target.value,
                    })
                  }
                  placeholder="No phone"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={saveUserChanges}
                disabled={loading === editUser.id}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loading === editUser.id
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {resetResult && (
          <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
            <div className="mb-3">
              <p className="text-sm font-semibold text-blue-300">
                Temporary Password
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Give this password to{" "}
                {resetResult.fullName}.
                It is shown here only for this reset.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-lg font-bold tracking-wider">
                {resetResult.temporaryPassword}
              </div>

              <button
                onClick={copyTemporaryPassword}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                Copy Password
              </button>

              <button
                onClick={() =>
                  setResetResult(null)
                }
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Hide
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, email, phone, user ID or referral code..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500/50"
          />
        </div>

        {pageLoading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-400">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-sm text-slate-400">
            No users found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead className="border-b border-white/10 bg-slate-950/50">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">
                        User
                      </th>

                      <th className="px-5 py-4">
                        Contact
                      </th>

                      <th className="px-5 py-4">
                        Role
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Referral
                      </th>

                      <th className="px-5 py-4">
                        Joined
                      </th>

                      <th className="px-5 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(
                      (user) => (
                        <tr
                          key={user.id}
                          className="align-top hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-5">
                            <div className="font-semibold">
                              {user.fullName}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              ID:{" "}
                              {user.publicUserId}
                            </div>

                            {user.premiumBadge && (
                              <div className="mt-2 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-[10px] font-bold text-yellow-300">
                                PREMIUM
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-5 text-sm">
                            <div>
                              {user.email ||
                                "No email"}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {user.phone ||
                                "No phone"}
                            </div>
                          </td>

                          <td className="px-5 py-5 text-sm text-slate-300">
                            {user.role}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge
                              status={
                                user.status
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <div className="font-mono text-xs text-slate-300">
                              {
                                user.referralCode
                              }
                            </div>
                          </td>

                          <td className="px-5 py-5 text-xs text-slate-500">
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-5">
                            <ActionButtons
                              user={user}
                              loading={loading}
                              onStatusChange={
                                onStatusChange
                              }
                              onResetPassword={
                                onResetPassword
                              }
                              onEdit={onEdit}
                            />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 md:hidden">
              {filteredUsers.map(
                (user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-white/10 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">
                          {user.fullName}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                          ID:{" "}
                          {user.publicUserId}
                        </p>
                      </div>

                      <StatusBadge
                        status={user.status}
                      />
                    </div>

                    {user.premiumBadge && (
                      <div className="mt-3 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-[10px] font-bold text-yellow-300">
                        PREMIUM
                      </div>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-slate-300">
                        {user.email ||
                          "No email"}
                      </p>

                      <p className="text-slate-500">
                        {user.phone ||
                          "No phone"}
                      </p>

                      <p className="font-mono text-xs text-slate-500">
                        Referral:{" "}
                        {user.referralCode}
                      </p>
                    </div>

                    <div className="mt-5">
                      <ActionButtons
                        user={user}
                        loading={loading}
                        onStatusChange={
                          onStatusChange
                        }
                        onResetPassword={
                          onResetPassword
                        }
                        onEdit={onEdit}
                      />
                    </div>
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