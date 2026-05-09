// src/app/life/page.tsx
"use client";

import * as React from "react";
import LoadingLink from "@/components/LoadingLink";
import type { AiFeedbackRequest } from "@/types/ai";
import type { LifeSummary } from "@/types/life";
import type { UserLevel, UserGoal } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SLEEP_SCORE_KEY = "fitra_life_sleep_score";
const FATIGUE_SCORE_KEY = "fitra_life_fatigue_score";
const LIFE_SCORE_HISTORY_KEY = "fitra_life_score_history";

type SleepOverride = {
  score: number;
  sleepHours?: number;
  subjectiveScore?: number;
  selectedChecks?: string[];
  updatedAt?: string;
};

type FatigueOverride = {
  score: number;
  fatigueLevel?: number;
  activityMeter?: number;
  selectedChecks?: string[];
  updatedAt?: string;
};

type LifeScoreHistoryItem = {
  date: string;
  score: number;
  label: string;
  sleepPoint: number;
  fatiguePoint: number;
  stressPoint: number;
  updatedAt: string;
};
type StressOverride = {
  score: number;
  dailyStress?: number;
  selectedChecks?: string[];
  categoryScores?: Record<string, number>;
  memo?: string;
  updatedAt?: string;
};

export default function LifePage() {
  const [sleep, setSleep] = React.useState<number>(0);
  const [fatigue, setFatigue] = React.useState<number>(0);
  const [stress, setStress] = React.useState<number>(0);

  const [sleepTouched, setSleepTouched] = React.useState(false);
  const [fatigueTouched, setFatigueTouched] = React.useState(false);
  const [stressOverride, setStressOverride] =
  React.useState<StressOverride | null>(null);
  const STRESS_SCORE_KEY = "fitra_life_stress_score";


  const [stressTouched, setStressTouched] = React.useState(false);

  const [sleepOverride, setSleepOverride] =
    React.useState<SleepOverride | null>(null);
  const [fatigueOverride, setFatigueOverride] =
    React.useState<FatigueOverride | null>(null);

  const [scoreHistory, setScoreHistory] = React.useState<
    LifeScoreHistoryItem[]
  >([]);

  const [feedback, setFeedback] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const userLevel: UserLevel = "beginner";
  const userGoal: UserGoal = "health";

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  React.useEffect(() => {
    const savedSleep = localStorage.getItem(SLEEP_SCORE_KEY);

    if (savedSleep) {
      try {
        const parsed = JSON.parse(savedSleep) as SleepOverride;

        if (typeof parsed.score === "number") {
          setSleepOverride(parsed);
          setSleepTouched(true);
        }

        if (typeof parsed.sleepHours === "number") {
          setSleep(parsed.sleepHours);
        }
      } catch {
        localStorage.removeItem(SLEEP_SCORE_KEY);
      }
    }

    const savedFatigue = localStorage.getItem(FATIGUE_SCORE_KEY);
    const savedStress = localStorage.getItem(STRESS_SCORE_KEY);

if (savedStress) {
  try {
    const parsed = JSON.parse(savedStress) as StressOverride;

    if (typeof parsed.score === "number") {
      setStressOverride(parsed);
      setStressTouched(true);
    }

    if (typeof parsed.dailyStress === "number") {
      setStress(parsed.dailyStress);
    }
  } catch {
    localStorage.removeItem(STRESS_SCORE_KEY);
  }
}

    if (savedFatigue) {
      try {
        const parsed = JSON.parse(savedFatigue) as FatigueOverride;

        if (typeof parsed.score === "number") {
          setFatigueOverride(parsed);
          setFatigueTouched(true);
        }

        if (typeof parsed.fatigueLevel === "number") {
          setFatigue(parsed.fatigueLevel);
        }
      } catch {
        localStorage.removeItem(FATIGUE_SCORE_KEY);
      }
    }

    const savedHistory = localStorage.getItem(LIFE_SCORE_HISTORY_KEY);

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as LifeScoreHistoryItem[];
        setScoreHistory(parsed);
      } catch {
        localStorage.removeItem(LIFE_SCORE_HISTORY_KEY);
      }
    }
  }, []);

  const hasAnyInput = sleepTouched || fatigueTouched || stressTouched;

  const sleepPoint =
    sleepOverride !== null
      ? (sleepOverride.score / 100) * 40
      : sleepTouched
        ? Math.min(sleep / 7, 1) * 40
        : 0;

  const fatiguePoint =
    fatigueOverride !== null
      ? ((100 - fatigueOverride.score) / 100) * 30
      : fatigueTouched
        ? ((10 - fatigue) / 10) * 30
        : 0;

  const stressPoint =
  stressOverride !== null
    ? ((100 - stressOverride.score) / 100) * 30
    : stressTouched
      ? ((10 - stress) / 10) * 30
      : 0;

  const recoveryScore = Math.round(sleepPoint + fatiguePoint + stressPoint);

const recoveryLabel =
  !hasAnyInput
    ? "未入力"
    : recoveryScore >= 70
      ? "攻めてもよい状態"
      : recoveryScore >= 50
        ? "調整しながら進める"
        : recoveryScore >= 30
          ? "回復を優先する"
          : "今日はかなり低調";

const recoveryMessage =
  !hasAnyInput
    ? "睡眠・疲労・ストレスを入力すると、今日の生活スコアを判定します。"
    : recoveryScore >= 70
      ? "今日の回復状態は十分です。通常メニューから入って、調子が良ければ強度を上げられます。"
      : recoveryScore >= 50
        ? "大きく崩れてはいません。攻め切るより、整えながら進める状態です。"
        : recoveryScore >= 30
          ? "回復が弱めです。今日は負荷を上げすぎず、整える判断が合いそうです。"
          : "回復状態がかなり低めです。今日は高負荷より、休養と最低限の活動を優先する状態です。";

const nextGuide =
  sleepOverride === null
    ? "sleep"
    : fatigueOverride === null
      ? "fatigue"
      : stressOverride === null
        ? "stress"
        : "";

  const graphItems = [
    ...scoreHistory
      .filter((item) => item.date !== today)
      .slice(0, 6)
      .reverse(),
    {
      date: today,
      score: recoveryScore,
      label: recoveryLabel,
      sleepPoint,
      fatiguePoint,
      stressPoint,
      updatedAt: new Date().toISOString(),
    },
  ];

  const saveTodayScore = () => {
    const item: LifeScoreHistoryItem = {
      date: today,
      score: recoveryScore,
      label: recoveryLabel,
      sleepPoint,
      fatiguePoint,
      stressPoint,
      updatedAt: new Date().toISOString(),
    };

    const nextHistory = [
      item,
      ...scoreHistory.filter((history) => history.date !== today),
    ].slice(0, 7);

    setScoreHistory(nextHistory);
    localStorage.setItem(LIFE_SCORE_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const handleAnalyze = async () => {
    setError(null);
    setFeedback("");

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.feedback ?? "AIによる生活評価の取得に失敗しました。");
        return;
      }

      setFeedback(data.feedback ?? "");
      saveTodayScore();
    } catch (e) {
      console.error(e);
      setError(
        "AIによる生活評価の取得に失敗しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const parseNumber = (value: string, fallback: number): number => {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  };

const clearOverrides = () => {
  localStorage.removeItem(SLEEP_SCORE_KEY);
  localStorage.removeItem(FATIGUE_SCORE_KEY);
  localStorage.removeItem(STRESS_SCORE_KEY);
  setSleepOverride(null);
  setFatigueOverride(null);
  setStressOverride(null);
  setFeedback("");
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-4 py-8 text-white">
      <div className="w-full max-w-6xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-6 shadow-xl md:px-10 md:py-8">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80">
              FITRA / LIFE ANALYZER
            </p>

            <h1 className="text-2xl font-semibold md:text-3xl">
              生活AIアナリスト{" "}
              <span className="align-middle text-sm font-normal text-slate-400">
                （睡眠・疲労・ストレス）
              </span>
            </h1>

            <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              生活スコアは、睡眠・疲労・ストレスから今日の回復状態を判定します。
              まず3つ入力し、気になる項目だけ詳細ページで原因を確認します。
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <LoadingLink
              href="/dashboard"
              theme="life"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
            >
              ← Dashboard
            </LoadingLink>

            <LoadingLink
              href="/"
              theme="home"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              ← Home
            </LoadingLink>
          </div>
        </header>

        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs tracking-[0.2em] text-emerald-300">
            今日の生活判定
          </p>

          <div className="mt-4 grid grid-cols-[300px,1fr] gap-5 max-[760px]:grid-cols-1">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
              <p className="text-xs text-slate-400">今日の生活スコア</p>

              <p className="mt-2 text-[11px] text-slate-500">{today}</p>

              <div className="mt-5 flex justify-center">
                <ScoreCircle score={recoveryScore} hasInput={hasAnyInput} />
              </div>

              <p className="mt-5 text-center text-base font-semibold text-white">
                {recoveryLabel}
              </p>

              <p className="mt-3 text-center text-xs leading-6 text-slate-400">
                {recoveryMessage}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.2em] text-emerald-300">
                    生活スコア履歴
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    AI評価時に今日のスコアを保存します。
                  </p>
                </div>

                <p className="shrink-0 text-[11px] text-slate-500">直近7件</p>
              </div>

              <MiniLifeScoreGraph items={graphItems} />

              <p className="mt-4 text-xs leading-6 text-slate-500">
                詳細ページで深掘りしたスコアを反映すると、
                今日の生活スコアと内訳が更新されます。
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-emerald-300">
              STEP 1
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              今日の状態を3つだけ入力
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <LifeInput
              label="睡眠時間（時間）"
              value={sleep}
              min={0}
              max={24}
              step={0.5}
              helper="例: 6.5（6時間半）、7.0 など"
              onChange={(value) => {
                setSleep(parseNumber(value, sleep));
                setSleepTouched(true);
                setSleepOverride(null);
                localStorage.removeItem(SLEEP_SCORE_KEY);
              }}
            />

            <LifeInput
              label="疲労度（0〜10）"
              value={fatigue}
              min={0}
              max={10}
              step={1}
              helper="0=全く疲れていない / 10=ヘトヘト"
              onChange={(value) => {
                setFatigue(parseNumber(value, fatigue));
                setFatigueTouched(true);
                setFatigueOverride(null);
                localStorage.removeItem(FATIGUE_SCORE_KEY);
              }}
            />

            <LifeInput
              label="ストレス度（0〜10）"
              value={stress}
              min={0}
              max={10}
              step={1}
              helper="0=特になし / 10=かなり高い"
              onChange={(value) => {
                setStress(parseNumber(value, stress));
                setStressTouched(true);
              }}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-emerald-300">
              STEP 2
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              気になる項目だけ深掘り
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <LifeDetailCard
              href="/life/sleep"
              title="睡眠"
              value={
                sleepOverride !== null
                  ? `${sleepOverride.score}/100`
                  : sleepTouched
                    ? `${sleep}h`
                    : "未入力"
              }
              desc={
                sleepOverride !== null
                  ? "Sleep詳細ページの評価を反映中"
                  : "睡眠不足・寝起き・回復感"
              }
              isApplied={sleepOverride !== null}
              isGuide={nextGuide === "sleep"}
            />

            <LifeDetailCard
              href="/life/fatigue"
              title="疲労"
              value={
                fatigueOverride !== null
                  ? `${fatigueOverride.score}/100`
                  : fatigueTouched
                    ? `${fatigue}/10`
                    : "未入力"
              }
              desc={
                fatigueOverride !== null
                  ? "Fatigue詳細ページの評価を反映中"
                  : "身体の重さ・だるさ・筋疲労"
              }
              isApplied={fatigueOverride !== null}
              isGuide={nextGuide === "fatigue"}
            />

            <LifeDetailCard
              href="/life/stress"
              title="ストレス"
              value={
                stressOverride !== null
                  ? `${stressOverride.score}/100`
                  : stressTouched
                    ? `${stress}/10`
                    : "未入力"
              }
              desc={
                stressOverride !== null
                  ? "Stress詳細ページの評価を反映中"
                  : "集中力・精神疲労・緊張感"
              }
              isApplied={stressOverride !== null}
              isGuide={nextGuide === "stress"}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-black/20 p-5">
          <p className="text-xs tracking-[0.2em] text-emerald-300">
            スコア内訳
          </p>

          <h2 className="mt-2 text-lg font-semibold">
            生活スコアはこの3つで決まります
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <BreakdownItem
              label="睡眠"
              value={`${sleepPoint.toFixed(1)} / 40`}
              note={
                sleepOverride !== null
                  ? "Sleep詳細ページの評価を反映しています"
                  : sleepTouched
                    ? "7時間以上で満点として計算しています"
                    : "未入力です"
              }
            />

            <BreakdownItem
              label="疲労"
              value={`${fatiguePoint.toFixed(1)} / 30`}
              note={
                fatigueOverride !== null
                  ? "Fatigue詳細ページの評価を反映しています"
                  : fatigueTouched
                    ? "疲労が低いほど点数が高くなります"
                    : "未入力です"
              }
            />

            <BreakdownItem
              label="ストレス"
              value={`${stressPoint.toFixed(1)} / 30`}
              note={
                stressOverride !== null
                  ? "Stress詳細ページの評価を反映しています"
                  : stressTouched
                    ? "ストレスが低いほど点数が高くなります"
                    : "未入力です"
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-emerald-300">
              STEP 3
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              AIで総合生活評価
            </h2>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={clearOverrides}
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs text-slate-300 transition hover:border-emerald-400"
            >
              詳細反映をリセット
            </button>

            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500"
            >
              {isLoading
                ? "AIが総合評価中..."
                : "AIで今日の生活スコアを総合評価する"}
            </Button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          {!error && !feedback && (
            <p className="text-sm text-slate-500">
              「AIで今日の生活スコアを総合評価する」を押すと、睡眠・疲労・ストレスをまとめた行動方針が表示されます。
            </p>
          )}

          {feedback && !error && (
            <div className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100">
              {feedback}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ScoreCircle({
  score,
  hasInput,
}: {
  score: number;
  hasInput: boolean;
}) {
  const safeScore = Math.max(0, Math.min(100, score));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = hasInput ? (safeScore / 100) * circumference : 0;
  const dashOffset = circumference - progress;

const color =
  !hasInput
    ? "rgb(148,163,184)"
    : safeScore >= 70
      ? "rgb(52,211,153)"
      : safeScore >= 50
        ? "rgb(96,165,250)"
        : safeScore >= 30
          ? "rgb(251,191,36)"
          : "rgb(248,113,113)";

const label =
  !hasInput
    ? "未入力"
    : safeScore >= 70
      ? "攻める"
      : safeScore >= 50
        ? "調整"
        : safeScore >= 30
          ? "回復"
          : "低調";

  return (
    <div className="relative h-[180px] w-[180px]">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="12"
        />

        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-5xl font-black" style={{ color }}>
          {hasInput ? safeScore : 0}
        </p>
        <p className="mt-1 text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function LifeInput({
  label,
  value,
  min,
  max,
  step,
  helper,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  helper: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-slate-200">
        {label}
      </label>

      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-slate-700 bg-slate-900/80 text-sm"
      />

      <p className="text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function LifeDetailCard({
  href,
  title,
  value,
  desc,
  isApplied,
  isGuide,
}: {
  href: string;
  title: string;
  value: string;
  desc: string;
  isApplied: boolean;
  isGuide: boolean;
}) {
  return (
    <LoadingLink
      href={href}
      theme="life"
      className={`relative rounded-2xl border bg-slate-900/70 p-5 transition hover:border-emerald-400 hover:bg-slate-900 ${
        isGuide
          ? "border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.12)]"
          : "border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-400">{title}</p>

        <span
          className={`rounded-full px-2 py-1 text-[10px] ${
            isApplied
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : isGuide
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-slate-700 bg-slate-900 text-slate-500"
          }`}
        >
          {isApplied ? "反映済み" : isGuide ? "次に確認" : "未反映"}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">{desc}</p>
      <p className="mt-3 text-xs text-emerald-300">原因を確認する →</p>
    </LoadingLink>
  );
}

function BreakdownItem({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-[11px] leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function MiniLifeScoreGraph({
  items,
}: {
  items: {
    date: string;
    score: number;
  }[];
}) {
  const graphItems = items.length > 0 ? items : [{ date: "今日", score: 0 }];

  const width = 360;
  const height = 150;
  const padding = 22;

  const points = graphItems.map((item, index) => {
    const x =
      graphItems.length === 1
        ? width / 2
        : padding +
          (index * (width - padding * 2)) / (graphItems.length - 1);

    const y =
      height -
      padding -
      (Math.max(0, Math.min(100, item.score)) / 100) *
        (height - padding * 2);

    return { x, y, score: item.score, date: item.date };
  });

  const polylinePoints = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[150px] w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-3"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth="1"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="1"
        />

        <polyline
          points={polylinePoints}
          fill="none"
          stroke="rgb(52,211,153)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={`${point.date}-${point.score}`}>
            <circle cx={point.x} cy={point.y} r="4" fill="rgb(52,211,153)" />
            <text
              x={point.x}
              y={point.y - 9}
              textAnchor="middle"
              fill="rgb(209,250,229)"
              fontSize="10"
              fontWeight="700"
            >
              {point.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}