"use client";

import LoadingLink from "@/components/LoadingLink";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

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

type ScoreTrendItem = {
  date: string;
  overallScore: number | null;
  dietScore: number | null;
  trainingScore: number | null;
  lifeScore: number | null;
};

type LatestAnalysis = {
  id?: string;
  date?: string;
  score?: number | null;
  summary?: string | null;
  feedback?: string | null;
  label?: string | null;

  // Training
  totalVolume?: number | null;
  topExercise?: string | null;

  // Life
  sleepPoint?: number | null;
  fatiguePoint?: number | null;
  stressPoint?: number | null;
};

type DashboardResponse = {
  todaySummary: TodaySummary;
  historyItems: HistoryItem[];
  scoreTrend: ScoreTrendItem[];
  latestAnalyses?: {
    diet?: LatestAnalysis | null;
    training?: LatestAnalysis | null;
    life?: LatestAnalysis | null;
  };
};

type InsightArea = "diet" | "training" | "life";

type DashboardInsightArea = {
  area: InsightArea;
  label: string;
  score: number;
};

type DashboardInsight = {
  lowest: DashboardInsightArea;
  highest: DashboardInsightArea;
  actionTitle: string;
  actionDetail: string;
};

type TrendInsight = {
  label: string;
  description: string;
  diff: number | null;
};

const emptyTodaySummary: TodaySummary = {
  overallScore: null,
  dietScore: null,
  trainingScore: null,
  lifeScore: null,
};

const areaMeta: Record<
  Area,
  {
    jp: string;
    short: string;
    href: string;
    theme: "diet" | "training" | "life";
    colorText: string;
    border: string;
    bg: string;
    glow: string;
  }
> = {
  diet: {
    jp: "食事AI",
    short: "食事",
    href: "/diet/dashboard",
    theme: "diet",
    colorText: "text-orange-300",
    border: "border-orange-400/30",
    bg: "bg-orange-500/10",
    glow: "shadow-orange-500/10",
  },
  training: {
    jp: "トレーニングAI",
    short: "トレーニング",
    href: "/training",
    theme: "training",
    colorText: "text-red-300",
    border: "border-red-400/30",
    bg: "bg-red-500/10",
    glow: "shadow-red-500/10",
  },
  life: {
    jp: "生活AI",
    short: "生活",
    href: "/life",
    theme: "life",
    colorText: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-500/10",
    glow: "shadow-emerald-500/10",
  },
};

function createDashboardInsight(today: TodaySummary): DashboardInsight | null {
  const areas = [
    { area: "diet" as const, label: "食事", score: today.dietScore },
    {
      area: "training" as const,
      label: "トレーニング",
      score: today.trainingScore,
    },
    { area: "life" as const, label: "生活", score: today.lifeScore },
  ].filter(
    (item): item is DashboardInsightArea =>
      typeof item.score === "number"
  );

  if (areas.length === 0) return null;

  const sortedAreas = [...areas].sort((a, b) => a.score - b.score);
  const lowest = sortedAreas[0];
  const highest = sortedAreas[sortedAreas.length - 1];

  const action =
    lowest.area === "diet"
      ? {
          actionTitle: "食事バランスを優先",
          actionDetail:
            "次の食事で高タンパク・低脂質のメニューを1回入れて、食事スコアの底上げを狙いましょう。",
        }
      : lowest.area === "training"
      ? {
          actionTitle: "トレーニング記録を優先",
          actionDetail:
            "メイン種目を1つ記録し、重量・回数・セット数から成長状態を確認しましょう。",
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

function createTrendInsight(scoreTrend: ScoreTrendItem[]): TrendInsight {
  const validTrend = scoreTrend.filter(
    (item): item is ScoreTrendItem & { overallScore: number } =>
      typeof item.overallScore === "number"
  );

  if (validTrend.length < 2) {
    return {
      label: "推移データ不足",
      description:
        "スコア推移データが増えると、上昇傾向・下降傾向を判定できます。",
      diff: null,
    };
  }

  const previous = validTrend[validTrend.length - 2];
  const latest = validTrend[validTrend.length - 1];
  const diff = latest.overallScore - previous.overallScore;

  if (diff > 0) {
    return {
      label: "改善傾向",
      description: `前回より +${diff} 点。コンディションは改善傾向です。`,
      diff,
    };
  }

  if (diff < 0) {
    return {
      label: "低下傾向",
      description: `前回より ${diff} 点。コンディションがやや低下しています。`,
      diff,
    };
  }

  return {
    label: "維持",
    description: "前回と同じスコアです。現在の状態を維持できています。",
    diff,
  };
}

function getScoreLabel(score: number | null) {
  if (score === null) return "未判定";
  if (score >= 85) return "かなり良好";
  if (score >= 70) return "良好";
  if (score >= 50) return "調整が必要";
  return "回復優先";
}

function createDashboardSummary(
  today: TodaySummary,
  insight: DashboardInsight | null,
  trend: TrendInsight
) {
  const scoreLabel = getScoreLabel(today.overallScore);

  if (!insight) {
    return "食事・トレーニング・生活の分析データが増えると、今日の状態を総合判定できます。";
  }

  if (insight.lowest.area === insight.highest.area) {
    return `${scoreLabel}。現在は ${insight.lowest.label} の分析結果を中心に、今日のコンディションを判定しています。`;
  }

  return `${scoreLabel}。${insight.highest.label} は強みですが、${insight.lowest.label} が全体スコアを下げています。${trend.label}のため、今日は ${insight.lowest.label} の改善を優先しましょう。`;
}

function pickAnalysisText(analysis?: LatestAnalysis | null) {
  if (!analysis) return "まだ分析データがありません。";

  const text = analysis.summary ?? analysis.feedback ?? analysis.label;

  if (!text) return "分析結果は保存されています。";

  return text.length > 90 ? `${text.slice(0, 90)}...` : text;
}

function getLatestTrainingText(analysis?: LatestAnalysis | null) {
  if (!analysis) return "まだトレーニング分析データがありません。";

  const volume =
    typeof analysis.totalVolume === "number"
      ? `総ボリューム ${analysis.totalVolume.toLocaleString()}kg。`
      : "";

  const topExercise = analysis.topExercise
    ? `主な種目は ${analysis.topExercise}。`
    : "";

  const text = pickAnalysisText(analysis);

  return `${volume}${topExercise}${text}`;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user?.uid}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Dashboard取得失敗");
        }

        const data: DashboardResponse = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.uid]);

  const today = dashboardData?.todaySummary ?? emptyTodaySummary;
  const historyItems = dashboardData?.historyItems ?? [];
  const scoreTrend = dashboardData?.scoreTrend ?? [];
  const latestAnalyses = dashboardData?.latestAnalyses ?? {};

  const dashboardInsight = createDashboardInsight(today);
  const trendInsight = createTrendInsight(scoreTrend);
  const dashboardSummary = createDashboardSummary(
    today,
    dashboardInsight,
    trendInsight
  );

  const displayOverallScore = today.overallScore ?? 0;
  const overallBarWidth = Math.min(Math.max(displayOverallScore, 0), 100);

  return (
    <AuthGuard>
      <AppHeader />
      <div className="pt-16">
        <main className="min-h-screen w-full bg-[#030712] px-3 py-5 text-white sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-8">
            <HeroDashboardCard
              today={today}
              isLoading={isLoading}
              summary={dashboardSummary}
              insight={dashboardInsight}
              trendInsight={trendInsight}
              overallBarWidth={overallBarWidth}
              latestAnalyses={latestAnalyses}
            />

            <LatestAnalysisSection latestAnalyses={latestAnalyses} />

            {/* <QuickNavSection /> */}

            <ScoreTrendChart data={scoreTrend} trendInsight={trendInsight} />

            <HistorySection
              isLoading={isLoading}
              historyItems={historyItems}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function HeroDashboardCard({
  today,
  isLoading,
  summary,
  insight,
  trendInsight,
  overallBarWidth,
  latestAnalyses,
}: {
  today: TodaySummary;
  isLoading: boolean;
  summary: string;
  insight: DashboardInsight | null;
  trendInsight: TrendInsight;
  overallBarWidth: number;
  latestAnalyses: DashboardResponse["latestAnalyses"];
}) {
  return (
    <section className="relative w-full overflow-hidden rounded-[1.6rem] border border-cyan-400/30 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_32%),linear-gradient(135deg,#07111f,#05060a_55%,#08111f)] p-4 shadow-[0_0_55px_rgba(56,189,248,0.14)] sm:rounded-[2rem] sm:p-7">
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex w-full flex-col gap-5 sm:gap-6">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[10px] tracking-[0.2em] text-cyan-200 sm:px-4 sm:text-[11px]">
              FITRA CONDITION SCORE
            </p>

            <h1 className="mt-4 break-words text-3xl font-black tracking-tight text-white sm:text-5xl">
              FITRA 総合スコア
            </h1>

            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              食事AI・トレーニングAI・生活AIの分析結果から、今日の身体とメンタルの現在地をまとめて確認します。
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

        <div className="grid w-full gap-4 lg:grid-cols-[330px,1fr]">
          <div className="w-full rounded-3xl border border-cyan-400/30 bg-black/30 p-4 shadow-[0_0_35px_rgba(56,189,248,0.12)] sm:p-5">
            <p className="text-xs tracking-[0.2em] text-cyan-200">OVERALL</p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-black text-cyan-300 sm:text-7xl">
                {isLoading ? "..." : today.overallScore ?? "-"}
              </span>
              <span className="mb-2 text-sm text-slate-500">/100</span>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300"
                style={{ width: `${overallBarWidth}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <CompactScore label="Diet" value={today.dietScore} area="diet" />
              <CompactScore
                label="Training"
                value={today.trainingScore}
                area="training"
              />
              <CompactScore label="Life" value={today.lifeScore} area="life" />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-800 bg-[#080d15]/80 p-4 sm:p-5">
              <p className="text-xs tracking-[0.2em] text-blue-200">
                TODAY CONCLUSION
              </p>

              <h2 className="mt-3 text-lg font-bold text-white sm:text-xl">
                今日の結論
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {summary}
              </p>

              {insight ? (
                <div className="mt-5 grid w-full gap-3 sm:grid-cols-3">
                  <HeroMiniPanel
                    label="改善優先"
                    value={insight.lowest.label}
                    score={insight.lowest.score}
                    area={insight.lowest.area}
                  />
                  <HeroMiniPanel
                    label="強み"
                    value={insight.highest.label}
                    score={insight.highest.score}
                    area={insight.highest.area}
                  />
                  <HeroMiniPanel
                    label="今日の一手"
                    value={insight.actionTitle}
                  />
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-500">
                  Diet・Training・Life の分析データが増えると、改善優先や今日の一手を表示できます。
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <HeroTextPanel
                label="TREND"
                title={trendInsight.label}
                text={trendInsight.description}
              />

              <HeroTextPanel
                label="LATEST"
                title="直近分析の要点"
                text={createHeroLatestText(latestAnalyses)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function createHeroLatestText(
  latestAnalyses: DashboardResponse["latestAnalyses"]
) {
  const trainingVolume = latestAnalyses?.training?.totalVolume;

  if (typeof trainingVolume === "number") {
    return `直近のトレーニング総ボリュームは ${trainingVolume.toLocaleString()}kg。食事・生活スコアと合わせて総合判定しています。`;
  }

  const dietText = latestAnalyses?.diet?.summary;
  const lifeText = latestAnalyses?.life?.summary;

  return dietText ?? lifeText ?? "各AIの最新分析から、今日の総合状態を判定しています。";
}

function HeroTextPanel({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-[10px] tracking-[0.18em] text-slate-500">{label}</p>
      <h3 className="mt-2 text-sm font-bold text-slate-100">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{text}</p>
    </div>
  );
}

function HeroMiniPanel({
  label,
  value,
  score,
  area,
}: {
  label: string;
  value: string;
  score?: number;
  area?: Area;
}) {
  const meta = area ? areaMeta[area] : null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-[10px] tracking-[0.18em] text-slate-500">{label}</p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="min-w-0 break-words text-sm font-bold text-slate-100">
          {value}
        </p>

        {typeof score === "number" && (
          <p
            className={`shrink-0 text-xl font-black ${
              meta?.colorText ?? "text-cyan-300"
            }`}
          >
            {score}
          </p>
        )}
      </div>
    </div>
  );
}

function CompactScore({
  label,
  value,
  area,
}: {
  label: string;
  value: number | null;
  area: Area;
}) {
  const meta = areaMeta[area];

  return (
    <div className={`rounded-2xl border ${meta.border} ${meta.bg} p-3`}>
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${meta.colorText}`}>
        {value ?? "-"}
      </p>
    </div>
  );
}

function LatestAnalysisSection({
  latestAnalyses,
}: {
  latestAnalyses: DashboardResponse["latestAnalyses"];
}) {
  const cards = [
    {
      area: "diet" as const,
      score: latestAnalyses?.diet?.score ?? null,
      title: "食事AIの最新分析",
      text: pickAnalysisText(latestAnalyses?.diet),
    },
    {
      area: "training" as const,
      score: latestAnalyses?.training?.score ?? null,
      title: "トレーニングAIの最新分析",
      text: getLatestTrainingText(latestAnalyses?.training),
    },
    {
      area: "life" as const,
      score: latestAnalyses?.life?.score ?? null,
      title: "生活AIの最新分析",
      text:
        latestAnalyses?.life?.label != null
          ? `${latestAnalyses.life.label}。${pickAnalysisText(
              latestAnalyses.life
            )}`
          : pickAnalysisText(latestAnalyses?.life),
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-4 shadow-lg shadow-black/40 sm:p-5">
      <div>
        <p className="text-xs tracking-[0.2em] text-blue-200">
          LATEST ANALYSIS
        </p>
        <h2 className="mt-2 text-sm font-semibold text-slate-100">
          3領域の最新分析
        </h2>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <AnalysisCard key={card.area} {...card} />
        ))}
      </div>
    </section>
  );
}

// function QuickNavSection() {
//   return (
//     <section className="grid w-full gap-3 sm:grid-cols-3">
//       <QuickNavCard
//         label="食事AI"
//         href="/diet"
//         theme="diet"
//         description="食事記録と栄養評価"
//       />
//       <QuickNavCard
//         label="トレーニングAI"
//         href="/training"
//         theme="training"
//         description="LIVE/NORMAL合算の成長確認"
//       />
//       <QuickNavCard
//         label="生活AI"
//         href="/life"
//         theme="life"
//         description="睡眠・疲労・ストレス"
//       />
//     </section>
//   );
// }

function HistorySection({
  isLoading,
  historyItems,
}: {
  isLoading: boolean;
  historyItems: HistoryItem[];
}) {
  return (
    <section className="w-full rounded-2xl border border-slate-800 bg-[#0b0f16] p-4 shadow-lg shadow-black/40 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-blue-200">
            ANALYSIS HISTORY
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-100">
            最新の解析履歴
          </h2>
        </div>

        <p className="text-[11px] text-slate-500">直近の分析結果</p>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        {isLoading ? (
          <p className="text-slate-500">読み込み中...</p>
        ) : historyItems.length > 0 ? (
          historyItems.map((item) => <HistoryRow key={item.id} item={item} />)
        ) : (
          <p className="text-slate-500">まだ解析履歴がありません。</p>
        )}
      </div>
    </section>
  );
}

function AnalysisCard({
  area,
  title,
  text,
  score,
}: {
  area: Area;
  title: string;
  text: string;
  score: number | null;
}) {
  const meta = areaMeta[area];

  return (
    <LoadingLink
      href={meta.href}
      theme={meta.theme}
      className={`block rounded-2xl border ${meta.border} bg-slate-900/40 p-4 transition hover:bg-slate-900/70`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold ${meta.colorText}`}>
            {meta.jp}
          </p>
          <h3 className="mt-2 text-sm font-bold text-slate-100">{title}</h3>
        </div>

        <p className={`shrink-0 text-2xl font-black ${meta.colorText}`}>
          {score ?? "-"}
        </p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">{text}</p>
    </LoadingLink>
  );
}

function QuickNavCard({
  label,
  href,
  theme,
  description,
}: {
  label: string;
  href: string;
  theme: "diet" | "training" | "life";
  description: string;
}) {
  const meta =
    theme === "diet"
      ? areaMeta.diet
      : theme === "training"
      ? areaMeta.training
      : areaMeta.life;

  return (
    <LoadingLink
      href={href}
      theme={theme}
      className={`group relative w-full overflow-hidden rounded-2xl border ${meta.border} bg-[#090d14]/80 p-5 text-xs shadow-lg shadow-black/40 transition hover:-translate-y-0.5`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${meta.bg} opacity-0 transition group-hover:opacity-100`}
      />

      <div className="relative">
        <p className={`text-sm font-bold ${meta.colorText}`}>{label}</p>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          {description}
        </p>

        <p className="mt-4 text-[11px] text-slate-400">詳細を確認する →</p>
      </div>
    </LoadingLink>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const meta = areaMeta[item.area];

  return (
    <LoadingLink
      href={meta.href}
      theme={meta.theme}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 hover:border-blue-500/60"
    >
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-[11px] text-slate-400">{item.date}</span>
        <span className="break-words text-xs font-medium text-slate-100">
          {item.title}
        </span>
        <span className={`text-[11px] ${meta.colorText}`}>{meta.jp}</span>
      </div>

      <span className={`shrink-0 text-lg font-semibold ${meta.colorText}`}>
        {item.score ?? "-"}
      </span>
    </LoadingLink>
  );
}

function ScoreTrendChart({
  data,
  trendInsight,
}: {
  data: ScoreTrendItem[];
  trendInsight: TrendInsight;
}) {
  return (
    <section className="w-full rounded-2xl border border-blue-500/20 bg-[#0b0f16] p-4 shadow-lg shadow-black/40 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-blue-200">
            SCORE TREND
          </p>
          <h2 className="mt-2 text-sm font-semibold text-slate-100">
            統合スコア推移
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {trendInsight.description}
          </p>
        </div>

        <p className="text-[11px] text-slate-500">直近7件</p>
      </div>

      <div className="mt-5 h-52 w-full sm:h-56">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                stroke="#64748b"
                width={28}
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