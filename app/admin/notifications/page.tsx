
"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminNotificationsPage() {
  const [targetType, setTargetType] = useState<"SINGLE" | "ALL">("SINGLE");
  const [publicUserId, setPublicUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function sendNotification() {
    setFeedback("");

    if (!title.trim() || !message.trim()) {
      setFeedback("Title aur message dono likhna zaroori hai.");
      return;
    }

    if (targetType === "SINGLE" && !/^\d{6}$/.test(publicUserId.trim())) {
      setFeedback("Valid 6-digit User ID enter karo.");
      return;
    }

    const confirmed = window.confirm(
      targetType === "ALL"
        ? "Kya tum waqai sab users ko notification bhejna chahte ho?"
        : `Kya tum User ID ${publicUserId} ko notification bhejna chahte ho?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          publicUserId: publicUserId.trim(),
          title: title.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Notification send nahi hui.");
      }

      setFeedback(
        `Success! ${data.sentCount} user(s) ko notification send ho gayi.`
      );

      setTitle("");
      setMessage("");
      setPublicUserId("");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080b14] text-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Admin
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Notifications
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Send announcements directly to ClaudeInvest users.
          </p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-7">
          <h2 className="text-lg font-semibold mb-5">
            Create Notification
          </h2>

          <label className="block text-sm text-gray-300 mb-2">
            Send notification to
          </label>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setTargetType("SINGLE")}
              className={`rounded-xl border p-3 text-sm font-semibold ${
                targetType === "SINGLE"
                  ? "border-blue-500 bg-blue-500/15 text-blue-300"
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              Single User
            </button>

            <button
              type="button"
              onClick={() => setTargetType("ALL")}
              className={`rounded-xl border p-3 text-sm font-semibold ${
                targetType === "ALL"
                  ? "border-blue-500 bg-blue-500/15 text-blue-300"
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              All Users
            </button>
          </div>

          {targetType === "SINGLE" && (
            <div className="mb-5">
              <label className="block text-sm text-gray-300 mb-2">
                User ID (6 digits)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={publicUserId}
                onChange={(e) =>
                  setPublicUserId(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter user ID"
                className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm text-gray-300 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="w-full rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">
              Notification Message
            </label>
            <textarea
              rows={5}
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message..."
              className="w-full resize-y rounded-xl border border-white/10 bg-[#080b14] px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {feedback && (
            <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
              {feedback}
            </div>
          )}

          <button
            type="button"
            onClick={sendNotification}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </section>
      </div>
    </main>
  );
}
