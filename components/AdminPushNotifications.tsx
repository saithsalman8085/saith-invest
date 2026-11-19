
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}

export default function AdminPushNotifications() {
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!pathname.startsWith("/admin")) {
    return null;
  }

  async function enableNotifications() {
    try {
      setLoading(true);
      setMessage("");

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setMessage("Your browser does not support push notifications.");
        return;
      }

      if (!("Notification" in window)) {
        setMessage("Notifications are not supported by this browser.");
        return;
      }

      if (Notification.permission === "denied") {
        setMessage("Notifications are blocked. Allow them in browser settings.");
        return;
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        setMessage("Notification configuration is missing.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("Please allow notifications to continue.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const response = await fetch("/api/admin/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to enable notifications.");
      }

      setMessage("Admin notifications enabled successfully!");
    } catch (error) {
      console.error("Enable admin notifications error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to enable notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 left-5 z-9999 max-w-70 rounded-xl border border-gray-700 bg-gray-900 p-3 text-white shadow-xl">
      <p className="mb-2 text-sm font-semibold">
        Admin Notifications
      </p>

      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Enabling..." : "Enable Notifications"}
      </button>

      {message && (
        <p className="mt-2 text-xs text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
}
