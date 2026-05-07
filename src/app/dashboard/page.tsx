"use client";

import LoadingLink from "@/components/LoadingLink";
import { useMemo } from "react";
import {
  mockTodaySummary,
  mockHistory,
  mockYesterdayImprovement,
  mockTodaySuggestion,
  mockTodos,
} from "./mock";

import type { HistoryItem } from "./mock";

export default function DashboardPage() {
  const today = useMemo(() => mockTodaySummary, []);
  const overallBarWidth = Math.min(Math.max(today.overallScore, 0), 100);

  return (
    <main className="min-h-screen bg-[#05060a] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-[11px] tracking-[0.2em] text-blue-200">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            AI ANALYSIS COMPLETE
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Future Body Scanner
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Training / Diet / Life の3AIから、今日の身体状態を統合解析しました。
              </p>
            </div>

            <LoadingLink
              href="/"
              theme="home"
              className="w-fit rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/20"
            >
              ← Home
            </LoadingLink>
          </div>
        </header>

        {/* BODY STATUS */}
        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <div className="rounded-2xl border border-blue-500/30 bg-[#0b0f16] p-5 shadow-[0_0_35px_rgba(56,189,248,0.12)]">
            <p className="text-xs tracking-[0.2em] text-blue-200">
              BODY STATUS
            </p>

            <div className="mt-4 flex items-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-900">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-500/80 to-cyan-400/60 blur-[3px]" />

                <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#05060a]">
                  <span className="text-4xl font-black text-blue-300">
                    {today.overallScore}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <p className="text-slate-300">
                  3つのAIスコアから、今日のコンディションを総合評価。
                </p>

                <p className="text-blue-300">3日前より +6 上昇</p>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${overallBarWidth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <SmallScore label="Diet" value={today.dietScore} />
              <SmallScore label="Training" value={today.trainingScore} />
              <SmallScore label="Life" value={today.lifeScore} />
            </div>
          </div>

          {/* 各AIへの導線 */}
          <div className="grid h-full gap-3 md:grid-cols-3">
            <QuickNavCard
              label="Diet AI"
              desc="栄養・PFC・食事傾向"
              href="/diet"
              theme="diet"
            />

            <QuickNavCard
              label="Training AI"
              desc="強度・成長・負荷バランス"
              href="/training"
              theme="training"
            />

            <QuickNavCard
              label="Life AI"
              desc="睡眠・疲労・ストレス"
              href="/life"
              theme="life"
            />
          </div>
        </section>

        {/* AI身体解析 */}
        <section className="rounded-2xl border border-blue-500/20 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />

            <p className="text-xs tracking-[0.2em] text-blue-200">
              SCAN RESULT
            </p>
          </div>

          <h2 className="mt-3 text-xl font-bold text-white">AI 身体解析</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "筋力パフォーマンスは上昇傾向",
              "睡眠不足により回復効率がやや低下",
              "タンパク質摂取は安定",
              "疲労蓄積は中程度",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* AI解析結果 */}
        <section className="grid gap-6 md:grid-cols-2">
          <ImprovementCard
            title="昨日のAI解析結果"
            items={mockYesterdayImprovement.details}
          />

          <ImprovementCard
            title="今日の最適行動"
            items={mockTodaySuggestion.details}
            highlight
          />
        </section>

        {/* ToDo & 履歴 */}
        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100">
              今日のアクションリスト
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              入力すると、身体スキャナーの精度が上がります。
            </p>

            <ul className="mt-4 space-y-3 text-xs">
              {mockTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2.5"
                >
                  <div className="mt-[2px] h-4 w-4 flex-shrink-0 rounded-full border border-slate-500/60 bg-black/60" />
                  <p className="text-slate-200">{todo.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100">
              最新の解析履歴
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              直近のAI解析結果です。
            </p>

            <div className="mt-4 space-y-3 text-xs">
              {mockHistory.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SmallScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-blue-300">{value}</p>
    </div>
  );
}

function QuickNavCard({
  label,
  desc,
  href,
  theme,
}: {
  label: string;
  desc: string;
  href: string;
  theme: "training" | "diet" | "life";
}) {
  const themeClasses =
    theme === "diet"
      ? "from-orange-400/70 to-amber-500/60"
      : theme === "training"
      ? "from-red-400/70 to-rose-500/70"
      : "from-emerald-400/70 to-green-500/70";

  const borderHover =
    theme === "diet"
      ? "hover:border-orange-400/70"
      : theme === "training"
      ? "hover:border-red-400/70"
      : "hover:border-emerald-400/70";

  const textColor =
    theme === "diet"
      ? "text-orange-300"
      : theme === "training"
      ? "text-red-300"
      : "text-emerald-300";

  return (
    <LoadingLink
      href={href}
      theme={theme}
      className={`group flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#090d14]/80 p-4 text-xs shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 ${borderHover}`}
    >
      <div>
        <p className={`text-[11px] font-semibold ${textColor}`}>{label}</p>

        <p className="mt-1 text-[11px] text-slate-400">{desc}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-[11px] ${textColor}`}>解析する →</span>

        <span
          className={`h-6 w-6 rounded-full bg-gradient-to-br ${themeClasses} opacity-70 blur-[1px] group-hover:opacity-100`}
        />
      </div>
    </LoadingLink>
  );
}

function ImprovementCard({
  title,
  items,
  highlight,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#0b0f16] p-5 shadow-lg shadow-black/40 ${
        highlight ? "border-blue-500/70" : "border-slate-800"
      }`}
    >
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>

      <ul className="mt-3 space-y-2 text-xs text-slate-200">
        {items.map((text, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="mt-[5px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-blue-400" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const label =
    item.area === "diet"
      ? "Diet AI"
      : item.area === "training"
      ? "Training AI"
      : "Life AI";

  const href =
    item.area === "diet"
      ? "/diet"
      : item.area === "training"
      ? "/training"
      : "/life";

  const theme =
    item.area === "diet"
      ? "diet"
      : item.area === "training"
      ? "training"
      : "life";

  return (
    <LoadingLink
      href={href}
      theme={theme}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 hover:border-blue-500/60"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-slate-400">{item.date}</span>
        <span className="text-xs font-medium text-slate-100">
          {item.title}
        </span>
        <span className="text-[11px] text-slate-400">{label}</span>
      </div>

      {item.score !== null && (
        <span className="text-lg font-semibold text-blue-300">
          {item.score}
        </span>
      )}
    </LoadingLink>
  );
}