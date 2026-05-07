"use client";

import LoadingLink from "@/components/LoadingLink";

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 text-white px-6 py-12">
      {/* 戻るボタン */}
      <div className="mb-8 flex items-center gap-3">
        <LoadingLink
          href="/dashboard"
          theme="training"
          className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20 transition"
        >
          ← Dashboard
        </LoadingLink>

        <LoadingLink
          href="/"
          theme="home"
          className="rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition"
        >
          Home
        </LoadingLink>
      </div>

      {/* タイトル */}
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1 text-[11px] tracking-[0.2em] text-red-200">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          TRAINING AI
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-red-300">
          Performance Scanner
        </h1>

        <p className="text-zinc-400">
          リアルタイム記録 or AI分析。状況に応じて使い分け。
        </p>
      </div>

      {/* カード */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* リアルタイム */}
        <LoadingLink
          href="/training/live"
          theme="training"
          className="block cursor-pointer p-6 rounded-2xl bg-zinc-900/90 border border-red-900 hover:border-red-500 hover:scale-[1.02] transition shadow-lg shadow-black/30"
        >
          <h2 className="text-xl font-semibold mb-2">⚡ リアルタイム記録</h2>

          <p className="text-sm text-zinc-400 mb-4">
            セットごとに即入力。ジム中に使うモード。
          </p>

          <span className="text-red-400 text-sm">今すぐ開始 →</span>
        </LoadingLink>

        {/* 分析 */}
        <LoadingLink
          href="/training/normal/step1"
          theme="training"
          className="block cursor-pointer p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-red-500 hover:scale-[1.02] transition shadow-lg shadow-black/30"
        >
          <h2 className="text-xl font-semibold mb-2">📊 分析・振り返り</h2>

          <p className="text-sm text-zinc-400 mb-4">
            トレーニングをまとめて入力してAI分析。
          </p>

          <span className="text-red-400 text-sm">分析を始める →</span>
        </LoadingLink>
      </div>
    </main>
  );
}