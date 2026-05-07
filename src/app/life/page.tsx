// src/app/life/page.tsx
// 生活AIアナリスト（MVP）：睡眠時間 + 疲労度 + ストレス → AIコメント

"use client";

import * as React from "react";
import Link from "next/link";

import type { AiFeedbackRequest } from "@/types/ai";
import type { LifeSummary } from "@/types/life";
import type { UserLevel, UserGoal } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LifePage() {
  const [sleep, setSleep] = React.useState<number>(7);
  const [fatigue, setFatigue] = React.useState<number>(5);
  const [stress, setStress] = React.useState<number>(5);

  const [feedback, setFeedback] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 仮ユーザー設定（あとで /mypage で上書き）
  const userLevel: UserLevel = "beginner";
  const userGoal: UserGoal = "health";

  const handleAnalyze = async () => {
    setError(null);
    setFeedback("");

    // 一応レンジチェック（0〜10, 0〜24h）
    if (
      sleep < 0 ||
      sleep > 24 ||
      fatigue < 0 ||
      fatigue > 10 ||
      stress < 0 ||
      stress > 10
    ) {
      setError(
        "睡眠は0〜24時間、疲労度・ストレスは0〜10の範囲で入力してください。"
      );
      return;
    }

    const summary: LifeSummary = {
      sleep,
      fatigue,
      stress,
    };

    const body: AiFeedbackRequest<LifeSummary> = {
      domain: "life",
      level: userLevel,
      goal: userGoal,
      summary,
    };

    try {
      setIsLoading(true);

      const res = await fetch("/api/life/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setFeedback(data.feedback ?? "");
    } catch (e) {
      console.error(e);
      setError(
        "AIによる生活評価の取得に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 安全な number パース用
  const parseNumber = (value: string, fallback: number): number => {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full bg-slate-900/70 rounded-2xl shadow-xl border border-slate-800 px-6 py-6 md:px-10 md:py-8 space-y-8">
        {/* ヘッダー */}
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              FITRA / LIFE ANALYZER
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold">
              生活AIアナリスト{" "}
              <span className="text-sm font-normal text-slate-400 align-middle">
                （睡眠・疲労・ストレス）
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300">
              睡眠時間と、ざっくりした疲労度・ストレス度を入力すると、
              <span className="text-emerald-300">
                {" "}
                回復スコアと明日のワンポイント
              </span>
              をAIが返してくれます。
            </p>
          </div>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-400 hover:text-emerald-200 transition"
          >
            ← ホームへ戻る
          </Link>
        </header>

        {/* 入力エリア */}
        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                睡眠時間（時間）
              </label>
              <Input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={sleep}
                onChange={(e) => setSleep(parseNumber(e.target.value, sleep))}
                className="bg-slate-900/80 border-slate-700 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                例: 6.5（6時間半）、7.0 など
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                疲労度（0〜10）
              </label>
              <Input
                type="number"
                min={0}
                max={10}
                step={1}
                value={fatigue}
                onChange={(e) =>
                  setFatigue(parseNumber(e.target.value, fatigue))
                }
                className="bg-slate-900/80 border-slate-700 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                0=全く疲れていない / 10=ヘトヘト
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-200">
                ストレス度（0〜10）
              </label>
              <Input
                type="number"
                min={0}
                max={10}
                step={1}
                value={stress}
                onChange={(e) => setStress(parseNumber(e.target.value, stress))}
                className="bg-slate-900/80 border-slate-700 text-sm"
              />
              <p className="text-[11px] text-slate-500">
                0=特になし / 10=かなり高い
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              {isLoading ? "AIが分析中…" : "AIに生活リズムを評価してもらう"}
            </Button>
          </div>
        </section>

        {/* 結果表示 */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-200">AIコメント</h2>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && !feedback && (
            <p className="text-sm text-slate-500">
              入力を埋めて「AIに生活リズムを評価してもらう」を押すと、ここに結果が表示されます。
            </p>
          )}

          {feedback && !error && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm whitespace-pre-wrap text-slate-100">
              {feedback}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
