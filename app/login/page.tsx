"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!contact.trim() || !password) {
      setError("Please enter your email/phone and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: contact.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("claudeinvest_remember", "true");
      } else {
        localStorage.removeItem("claudeinvest_remember");
      }

      setMessage("Login successful. Redirecting...");

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] text-black">
      {/* SOFT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md">

          {/* BACK */}
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-yellow-600 transition hover:text-yellow-700 sm:mb-7 sm:text-sm"
          >
            ← Back to ClaudeInvest
          </Link>

          {/* LOGIN CARD */}
          <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-[0_10px_40px_rgba(234,179,8,0.10)] sm:rounded-3xl">

            {/* HEADER */}
            <div className="border-b border-yellow-200 bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 p-5 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-sm font-extrabold text-black shadow-lg shadow-yellow-300/30">
                CI
              </div>

              <div className="mt-4 inline-flex rounded-full border border-yellow-300 bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-yellow-700">
                Secure Login
              </div>

              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                Sign in to your ClaudeInvest account.
              </p>
            </div>

            {/* FORM */}
            <div className="p-5 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* CONTACT */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email or Phone Number
                  </label>

                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter email or phone number"
                    autoComplete="username"
                    className="w-full rounded-xl border-2 border-yellow-100 bg-[#fffdf9] px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl border-2 border-yellow-100 bg-[#fffdf9] px-4 py-3.5 pr-20 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50 hover:text-yellow-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* REMEMBER / FORGOT */}
                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-500 sm:text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-yellow-300 accent-yellow-400"
                    />

                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        "Please contact the administrator to reset your password."
                      )
                    }
                    className="text-xs font-semibold text-yellow-600 transition hover:text-yellow-700 sm:text-sm"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* MESSAGE */}
                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                    {message}
                  </div>
                )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-bold text-black shadow-md shadow-yellow-200 transition hover:bg-yellow-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-yellow-100" />

                <span className="text-xs font-medium text-gray-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-yellow-100" />
              </div>

              {/* REGISTER */}
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-yellow-600 transition hover:text-yellow-700"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <p className="mt-5 text-center text-[10px] text-gray-400 sm:mt-6 sm:text-xs">
            ClaudeInvest © 2025
          </p>
        </div>
      </div>
    </main>
  );
}