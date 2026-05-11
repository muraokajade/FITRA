"use client";

import LoadingLink from "@/components/LoadingLink";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


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
  scoreTrend: ScoreTrendItem[];
}

const emptyTodaySummary: TodaySummary = {
  overallScore: null,
  dietScore: null,
  trainingScore: null,
  lifeScore: null,
}

type ScoreTrendItem = {
  date: string;
  overallScore: number | null;
  dietScore: number | null;
  trainingScore: number | null;
  lifeScore: number | null;
};

type InsightArea = "diet" | "training" | "life";

type DashboardInsightArea = {
  area: InsightArea;
  label: string;
  score: number;
}

type DashboardInsight = {
  lowest: DashboardInsightArea;
  highest: DashboardInsightArea;
  actionTitle: string;
  actionDetail: string;
}

function createDashboardInsight(today: TodaySummary): DashboardInsight | null {
  const areas = [
    {
      area: "diet" as const,
      label: "Diet",
      score: today.dietScore,
    },
    {
      area: "training" as const,
      label: "Training",
      score: today.trainingScore,
    },
    {
      area: "life" as const,
      label: "Life",
      score: today.lifeScore,
    },
  ].filter((item): item is DashboardInsightArea => typeof item.score === "number");

  if(areas.length === 0) {
    return null;
  }
  /**
   * スコアが低い順に並べる。
   *
   * 先頭 = 改善優先エリア
   * 末尾 = 強みエリア
   */
  const sortedAreas = [...areas,].sort((a , b ) => a.score - b.score);

  const lowest = sortedAreas[0];
  const highest = sortedAreas[sortedAreas.length - 1];

   /**
   * 最も低い領域に応じて、今日の一手を決める。
   *
   * ここはAI生成ではなく、まずは固定ロジックで十分。
   */
  const action =
    lowest.area === "diet"
      ? {
          actionTitle: "食事バランスを優先",
          actionDetail:
            "高タンパク・低脂質の食事を1回入れて、Dietスコアの底上げを狙いましょう。",
        }
      : lowest.area === "training"
      ? {
          actionTitle: "トレーニング入力を優先",
          actionDetail:
            "メイン種目を1つ記録し、負荷・回数・セット数から成長状態を確認しましょう。",
        }
      : {
          actionTitle: "回復を優先",
          actionDetail:
            "睡眠・疲労・ストレスを入力し、今日は回復状態を整えることを優先しましょう。",
        };

      return {
        lowest,
        highest,
        actionTitle: action.actionTitle,
        actionDetail: action.actionDetail,
      };


}


export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scoreTrend = dashboard?.scoreTrend ?? []; // dashboardという変数のデータ構造に違和感あり

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
    const dashboardInsight = createDashboardInsight(today);

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

        <ScoreTrendChart data={scoreTrend}/>
        <DashboardInsightCards insight={dashboardInsight} />

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

function ScoreTrendChart({ data }: { data: ScoreTrendItem[] }) {
  return (
    <section className="rounded-2xl border border-blue-500/20 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-blue-200">
            SCORE TREND
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-100">
            統合スコア推移
          </h2>
        </div>

        <p className="text-[11px] text-slate-500">直近7件</p>
      </div>

      <div className="mt-5 h-56 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#64748b"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="overallScore"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-500">
            まだスコア推移データがありません。
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardInsightCards({
  insight,
}: {
  insight: DashboardInsight | null;
}) {
  if (!insight) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
        <p className="text-xs tracking-[0.2em] text-blue-200">
          DASHBOARD INSIGHT
        </p>

        <p className="mt-3 text-sm text-slate-400">
          まだInsightを表示できる分析データがありません。
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <InsightCard
        title="改善優先"
        label={insight.lowest.label}
        score={insight.lowest.score}
        description={`${insight.lowest.label} が現在もっとも低いスコアです。ここを改善すると、統合スコアの底上げにつながります。`}
      />

      <InsightCard
        title="強み"
        label={insight.highest.label}
        score={insight.highest.score}
        description={`${insight.highest.label} は現在もっとも高いスコアです。良い状態を維持できています。`}
        highlight
      />

      <div className="rounded-2xl border border-blue-500/40 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
        <p className="text-xs tracking-[0.2em] text-blue-200">
          TODAY ACTION
        </p>

        <h2 className="mt-3 text-sm font-semibold text-slate-100">
          {insight.actionTitle}
        </h2>

        <p className="mt-3 text-xs leading-relaxed text-slate-300">
          {insight.actionDetail}
        </p>
      </div>
    </section>
  );
}

function InsightCard({
  title,
  label,
  score,
  description,
  highlight,
}: {
  title: string;
  label: string;
  score: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#0b0f16] p-5 shadow-lg shadow-black/40 ${
        highlight ? "border-blue-500/50" : "border-slate-800"
      }`}
    >
      <p className="text-xs tracking-[0.2em] text-blue-200">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-100">{label}</h2>

        <p className="text-3xl font-black text-blue-300">{score}</p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}