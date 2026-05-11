"use client";

import LoadingLink from "@/components/LoadingLink";
import { useEffect, useState } from "react";

type TodaySummary = {
  overallScore: number | null;
  dietScore: number | null;
  trainingScore: number | null;
  lifeScore: number | null;
};

type Area = "diet" | "training" | "life";

type HistoryItem = {
  id: string;
  date: string;
  area: Area;
  title: string;
  score: number | null;
};

type DashboardResponse = {
  todaySummary: TodaySummary;
  historyItems: HistoryItem[];
}

const emptyTodaySummary: TodaySummary = {
  overallScore: null,
  dietScore: null,
  trainingScore: null,
  lifeScore: null,
}


export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // /api/dashboard から統合スコアと履歴を取得する
  useEffect(() => {
    const fetchDashBoard = async() => {
      try {
        const res = await fetch("/api/dashboard",{
          cache: "no-store",
        });

        if(!res.ok) {
          throw new Error("Dashboard取得失敗");
        }
         const data: DashboardResponse = await res.json();

         setDashboard(data);

      } catch(e) {
        console.error(e);

      } finally {
        setIsLoading(false);
      }
    }
    fetchDashBoard();
  },[]);


    // API取得前でも画面が落ちないように空データを使う？？？？？？？
    const today = dashboard?.todaySummary ?? emptyTodaySummary;
    const historyItems = dashboard?.historyItems ?? [];

    const displayOverallScore = today.overallScore ?? 0;
    const overallBarWidth = Math.min(Math.max(displayOverallScore, 0), 100);

  return (
    <main className="min-h-screen bg-[#05060a] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="w-fit rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-[11px] tracking-[0.2em] text-blue-200">
            AI ANALYSIS COMPLETE
          </p>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Future Body Scanner
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Diet / Training / Life の分析結果から、今日の身体状態を統合表示します。
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
                    {isLoading ? "..." : today.overallScore ?? "-"}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <p className="text-slate-300">
                  3つのAIスコアから、今日のコンディションを総合評価。
                </p>

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

          <div className="grid h-full gap-3 md:grid-cols-3">
            <QuickNavCard label="Diet AI" href="/diet" theme="diet" />
            <QuickNavCard label="Training AI" href="/training" theme="training" />
            <QuickNavCard label="Life AI" href="/life" theme="life" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <h2 className="text-sm font-semibold text-slate-100">
            最新の解析履歴
          </h2>

          <div className="mt-4 space-y-3 text-xs">
            {isLoading ? (
              <p className="text-slate-500">読み込み中...</p>
            ) : historyItems.length > 0 ? (
              historyItems.map((item) => (
                <HistoryRow key={item.id} item={item} />
              ))
            ) : (
              <p className="text-slate-500">まだ解析履歴がありません。</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SmallScore({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-blue-300">
        {value ?? "-"}
      </p>
    </div>
  );
}

function QuickNavCard({
  label,
  href,
  theme,
}: {
  label: string;
  href: string;
  theme: "diet" | "training" | "life";
}) {
  return (
    <LoadingLink
      href={href}
      theme={theme}
      className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#090d14]/80 p-4 text-xs shadow-lg shadow-black/40 hover:border-blue-500/60"
    >
      <p className="font-semibold text-blue-300">{label}</p>
      <p className="mt-4 text-[11px] text-slate-400">解析画面へ移動</p>
    </LoadingLink>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const href =
    item.area === "diet"
      ? "/diet"
      : item.area === "training"
      ? "/training"
      : "/life";

  return (
    <LoadingLink
      href={href}
      theme={item.area}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 hover:border-blue-500/60"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-slate-400">{item.date}</span>
        <span className="text-xs font-medium text-slate-100">
          {item.title}
        </span>
        <span className="text-[11px] text-slate-400">{item.area}</span>
      </div>

      <span className="text-lg font-semibold text-blue-300">
        {item.score ?? "-"}
      </span>
    </LoadingLink>
  );
  
}