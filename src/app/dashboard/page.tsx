// src/app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  mockTodaySummary,
  mockHistory,
  mockYesterdayImprovement,
  mockTodaySuggestion,
  mockTodos,
} from "./mock";

import type {
  TodoItem,
  Improvement,
  TodaySummary,
  HistoryItem,
  Area,
} from "./mock";


export default function DashboardPage() {
  const today = useMemo(() => mockTodaySummary, []);
  const overallBarWidth = Math.min(Math.max(today.overallScore, 0), 100);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              FITRA ダッシュボード
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300">
              今日のコンディションを
              <span className="text-blue-300">
                「食事 × トレーニング × 生活」
              </span>
              で一括チェック。
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <Badge>食事AI</Badge>
            <Badge>トレーニングAI</Badge>
            <Badge>生活AI</Badge>
          </div>
        </header>

        {/* ① 今日の総合スコア & 各スコア */}
        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          {/* 総合スコア */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <p className="text-xs font-medium text-slate-400">
              今日の総合スコア
            </p>
            <div className="mt-3 flex items-center gap-5">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-900">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-500/70 to-sky-500/50 blur-[2px]" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#05060a]">
                  <span className="text-3xl font-bold text-blue-300">
                    {today.overallScore}
                  </span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <p className="text-slate-400">
                  3つのAIの結果から、今日のコンディションを総合評価しています。
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-[width]"
                    style={{ width: `${overallBarWidth}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <SmallScore label="食事" value={today.dietScore} />
              <SmallScore label="トレーニング" value={today.trainingScore} />
              <SmallScore label="生活" value={today.lifeScore} />
            </div>
          </div>

          {/* ② 各AIへのクイックカード */}
          <div className="grid h-full gap-3 md:grid-cols-3">
            <QuickNavCard
              label="食事AI"
              desc="PFCバランス・不足栄養素をチェック"
              href="/diet"
              tone="green"
            />
            <QuickNavCard
              label="トレーニングAI"
              desc="ボリューム・強度・次回メニュー"
              href="/training"
              tone="blue"
            />
            <QuickNavCard
              label="生活AI"
              desc="睡眠・疲労・ストレスを診断"
              href="/life"
              tone="purple"
            />
          </div>
        </section>

        {/* ③ 昨日の改善ポイント & 今日のおすすめ */}
        <section className="grid gap-6 md:grid-cols-2">
          <ImprovementCard
            title={mockYesterdayImprovement.title}
            items={mockYesterdayImprovement.details}
          />
          <ImprovementCard
            title={mockTodaySuggestion.title}
            items={mockTodaySuggestion.details}
            highlight
          />
        </section>

        {/* ④ 今日のToDo & ⑤ 最新の解析履歴 */}
        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          {/* ToDo */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100">
              今日のアクションリスト
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              「入力したらチェック」にして、1日のルーティンを固定していきましょう。
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

          {/* 履歴 */}
          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <h2 className="text-sm font-semibold text-slate-100">
              最新の解析履歴
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              直近 3 件の解析結果のサマリです。詳細は各AI画面で確認できます。
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

/* ----- small components ----- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-0.5">
      {children}
    </span>
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
  tone,
}: {
  label: string;
  desc: string;
  href: string;
  tone: "green" | "blue" | "purple";
}) {
  const toneClasses =
    tone === "green"
      ? "from-emerald-400/70 to-emerald-500/60"
      : tone === "blue"
      ? "from-sky-400/70 to-blue-500/70"
      : "from-violet-400/70 to-purple-500/70";

  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#090d14]/80 p-4 text-xs shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 hover:border-blue-400/70"
    >
      <div>
        <p className="text-[11px] font-semibold text-slate-200">{label}</p>
        <p className="mt-1 text-[11px] text-slate-400">{desc}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-blue-300">開く →</span>
        <span
          className={`h-6 w-6 rounded-full bg-gradient-to-br ${toneClasses} opacity-70 blur-[1px] group-hover:opacity-100`}
        />
      </div>
    </Link>
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
      ? "食事AI"
      : item.area === "training"
      ? "トレーニングAI"
      : "生活AI";

  const href =
    item.area === "diet"
      ? "/diet"
      : item.area === "training"
      ? "/training"
      : "/life";

  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 hover:border-blue-500/60"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-slate-400">{item.date}</span>
        <span className="text-xs font-medium text-slate-100">{item.title}</span>
        <span className="text-[11px] text-slate-400">{label}</span>
      </div>
      {item.score !== null && (
        <span className="text-lg font-semibold text-blue-300">
          {item.score}
        </span>
      )}
    </Link>
  );
}
