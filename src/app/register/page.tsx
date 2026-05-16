"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function getRegisterErrorMessage(error: unknown) {
  const errorCode =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  if (errorCode === "auth/email-already-in-use") {
    return "このメールアドレスはすでに登録されています。ログイン画面からお試しください。";
  }

  if (errorCode === "auth/invalid-email") {
    return "メールアドレスの形式が正しくありません。";
  }

  if (errorCode === "auth/weak-password") {
    return "パスワードは6文字以上で入力してください。";
  }

  if (errorCode === "auth/network-request-failed") {
    return "通信に失敗しました。ネットワーク状況を確認して、もう一度お試しください。";
  }

  return "登録に失敗しました。入力内容を確認して、もう一度お試しください。";
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(email, password);
      router.push("/");
    } catch (error) {
      setError(getRegisterErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyRegistered = error.includes("すでに登録されています");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060a] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[460px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] top-36 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-160px] bottom-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-blue-500/20 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-3xl font-black tracking-tight text-blue-300"
          >
            FITRA
          </Link>

          <p className="mt-3 text-[11px] font-semibold tracking-[0.25em] text-blue-300">
            REGISTER
          </p>

          <h1 className="mt-4 text-2xl font-black">新規登録</h1>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            FITRAで食事・運動・生活の記録を始めましょう。
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <p>{error}</p>

              {isAlreadyRegistered && (
                <Link
                  href="/login"
                  className="mt-3 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-100 transition hover:bg-blue-500/20"
                >
                  ログイン画面へ
                </Link>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              placeholder="example@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              placeholder="6文字以上"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-sky-300/40 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-6 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(56,189,248,0.45)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          すでにアカウントをお持ちの方は{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-300 underline underline-offset-4"
          >
            ログイン
          </Link>
        </div>
      </section>
    </main>
  );
}