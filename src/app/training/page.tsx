"use client";

import { useRouter } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
export default function TrainingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-red-950 text-white px-6 py-12">

      {/* 戻るボタン */}
      <button
        onClick={() => router.push("/")}
        className="mb-8 text-sm text-zinc-400 hover:text-white transition"
      >
        ← ホームに戻る
      </button>

      {/* タイトル */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          🏋️ TRAINING MODE
        </h1>
        <p className="text-zinc-400">
          リアルタイム or 分析。状況に応じて使い分け。
        </p>
      </div>

      {/* カード */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* リアルタイム */}
        <div
          onClick={() => router.push("/training/live")}
          className="cursor-pointer p-6 rounded-2xl bg-zinc-900 border border-red-900 hover:border-red-500 hover:scale-[1.02] transition"
        >
          <h2 className="text-xl font-semibold mb-2">
            ⚡ リアルタイム記録
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            セットごとに即入力。ジム中に使うモード。
          </p>
          <span className="text-red-400 text-sm">
            今すぐ開始 →
          </span>
        </div>

        {/* 分析 */}
        <div
          onClick={() => router.push("/training/normal/step1")}
          className="cursor-pointer p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500 hover:scale-[1.02] transition"
        >
          <h2 className="text-xl font-semibold mb-2">
            📊 分析・振り返り
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            トレーニングをまとめて入力してAI分析。
          </p>
          <span className="text-red-400 text-sm">
            分析を始める →
          </span>
        </div>

      </div>
    </main>
  );
}