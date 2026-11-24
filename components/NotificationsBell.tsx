
"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) return;

      setNotifications(result.notifications || []);
      setUnreadCount(result.unreadCount || 0);
    } catch (error) {
      console.error("NOTIFICATIONS_LOAD_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) return;

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("NOTIFICATION_READ_ERROR:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      if (!response.ok) return;

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("NOTIFICATIONS_MARK_ALL_ERROR:", error);
    }
  }

  function handleBellClick() {
    const nextState = !isOpen;

    setIsOpen(nextState);
    setIsAnimating(true);

    window.setTimeout(() => {
      setIsAnimating(false);
    }, 350);

    if (nextState) {
      loadNotifications();
    }
  }

  function formatNotificationDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString();
  }

  return (
    <div className="fixed right-2 top-2 z-50 sm:right-4 sm:top-3">
      <button
        type="button"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className={`relative flex h-7 w-7 items-center justify-center rounded-full border border-blue-300 bg-linear-to-br from-blue-600 to-blue-700 text-yellow-300 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 sm:h-8 sm:w-8 ${
          isAnimating ? "scale-90 rotate-6" : "scale-100"
        }`}
      >
        {isAnimating && (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 border-yellow-300/70 bg-blue-400/20" />
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className={`h-3 w-3 transition-all duration-200 sm:h-3.5 sm:w-3.5 ${
            isAnimating ? "animate-bounce" : ""
          }`}
        >
          <path
  stroke="#facc15"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
/>
          <path
  stroke="#ffffff"
  strokeWidth="1.8"
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M10 21h4"
/>
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-blue-900 ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="fixed right-2 top-14 z-50 flex max-h-[calc(100dvh-4.5rem)] w-[min(350px,calc(100vw-16px))] flex-col overflow-hidden rounded-2xl border border-yellow-200 bg-white text-left shadow-2xl sm:right-4 sm:top-16">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-[#fffaf2] px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Notifications
                </h3>
                <p className="mt-0.5 text-[10px] text-gray-500">
                  {unreadCount} unread notification(s)
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {loading && notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-gray-500">
                  Loading notifications...
                </p>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-3xl">🔔</div>
                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    No notifications yet
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    New updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      !notification.isRead &&
                      markAsRead(notification.id)
                    }
                    className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-yellow-50 ${
                      notification.isRead
                        ? "bg-white"
                        : "bg-yellow-50/70"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          notification.isRead
                            ? "bg-gray-300"
                            : "bg-blue-500"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900">
                          {notification.title}
                        </p>

                        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-xs leading-5 text-gray-600">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-400">
                          {formatNotificationDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
