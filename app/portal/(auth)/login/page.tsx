"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "メールアドレスまたはパスワードが正しくありません"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/portal/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "#F2F6FF" }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
      />
      <div
        className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ background: "linear-gradient(135deg, #EE542F, #F67A34, #FFA639)" }}
      />

      {/* Decorative small circles */}
      <div
        className="absolute top-32 left-[15%] w-3 h-3 rounded-full"
        style={{ background: "linear-gradient(135deg, #EE542F, #FFA639)", opacity: 0.6 }}
      />
      <div
        className="absolute top-48 right-[20%] w-2 h-2 rounded-full"
        style={{ background: "linear-gradient(135deg, #EE542F, #F67A34)", opacity: 0.5 }}
      />
      <div
        className="absolute bottom-40 right-[25%] w-4 h-4 rounded-full"
        style={{ background: "linear-gradient(135deg, #F67A34, #FFA639)", opacity: 0.4 }}
      />
      <div
        className="absolute bottom-60 left-[30%] w-2.5 h-2.5 rounded-full"
        style={{ background: "linear-gradient(135deg, #EE542F, #FFA639)", opacity: 0.5 }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #16B1F3, #0649C4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PITキャリア
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#6B7280" }}>
            求職者の方はこちら
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden"
          style={{
            boxShadow: "0 8px 32px rgba(6, 73, 196, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Gradient accent bar at top */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ background: "linear-gradient(135deg, #16B1F3, #0649C4)" }}
          />

          <h2 className="text-xl font-semibold mb-6" style={{ color: "#1E293B" }}>
            マイページログイン
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="portal-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#1E293B" }}
              >
                メールアドレス
              </label>
              <input
                id="portal-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ boxShadow: "none" }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 177, 243, 0.2)";
                  e.currentTarget.style.borderColor = "#16B1F3";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#D1D5DB";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="portal-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#1E293B" }}
              >
                パスワード
              </label>
              <input
                id="portal-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ boxShadow: "none" }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22, 177, 243, 0.2)";
                  e.currentTarget.style.borderColor = "#16B1F3";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#D1D5DB";
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #16B1F3 0%, #0649C4 100%)",
                boxShadow: "0 4px 14px rgba(6, 73, 196, 0.3)",
              }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          &copy; 2026 PITキャリア. All rights reserved.
        </p>
      </div>
    </div>
  );
}
