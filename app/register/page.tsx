"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanContact = contact.trim();

    if (!fullName.trim() || !cleanContact || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      contact: cleanContact,
      password,
      referralCode: referralCode.trim().toUpperCase(),
    };

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let data: { error?: string; message?: string } = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        data = { error: responseText };
      }

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }

      setMessage(
        "Account created successfully. You can now continue to login."
      );

      setFullName("");
      setContact("");
      setPassword("");
      setReferralCode("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdf9] text-black">
      {/* Soft Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md">

          {/* BRAND */}
          <div className="mb-6 text-center sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-300/30">
                C
              </span>

              <span>
                Claude<span className="text-yellow-500">Invest</span>
              </span>
            </Link>

            <div className="mt-5 inline-flex rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-700">
              Create Account
            </div>

            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Create Your Account
            </h1>

            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              Join ClaudeInvest and start managing your investment account.
            </p>
          </div>

          {/* REGISTER CARD */}
          <div className="overflow-hidden rounded-2xl border border-yellow-200 bg-white shadow-[0_10px_40px_rgba(234,179,8,0.10)] sm:rounded-3xl">

            {/* CARD HEADER */}
            <div className="border-b border-yellow-200 bg-gradient-to-r from-yellow-100 via-yellow-50 to-orange-50 px-5 py-4 sm:px-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-700">
                Registration
              </p>

              <h2 className="mt-1 text-base font-bold sm:text-lg">
                Account Details
              </h2>

              <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                Enter your details below to create your account.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* FULL NAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full rounded-xl border-2 border-yellow-100 bg-[#fffdf9] px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                  />
                </div>

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

                  <p className="mt-2 text-xs text-gray-400">
                    Use either your email address or phone number.
                  </p>
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
                      placeholder="Create a password"
                      autoComplete="new-password"
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

                  <p className="mt-2 text-xs text-gray-400">
                    Password must be at least 8 characters.
                  </p>
                </div>

                {/* REFERRAL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Referral Code
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      Optional
                    </span>
                  </label>

                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    autoComplete="off"
                    className="w-full rounded-xl border-2 border-yellow-100 bg-[#fffdf9] px-4 py-3.5 text-sm uppercase text-black outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:ring-4 focus:ring-yellow-100"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    If someone invited you, enter their referral code here.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {message && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                    {message}
                  </div>
                )}

                {/* TERMS */}
                <p className="text-center text-[10px] leading-5 text-gray-400 sm:text-xs">
                  By creating an account, you agree to our{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-yellow-600 underline hover:text-yellow-700"
                  >
                    Terms & Conditions
                  </Link>
                  .
                </p>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-yellow-400 px-4 py-3.5 text-sm font-bold text-black shadow-md shadow-yellow-200 transition hover:bg-yellow-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
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

              {/* LOGIN */}
              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-yellow-600 hover:text-yellow-700"
                >
                  Login
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