"use client";

import * as React from "react";
import LoadingLink from "@/components/LoadingLink";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";

type FoodItem = {
  id?: string;
  name?: string;
  amount?: number | null;
  calories?: number | null;
  protein?: number | null;
  fat?: number | null;
  carbs?: number | null;
};

type DietLog = {
  id: string;
  name?: string;
  mealType?: string;
  timestamp?: string;
  createdAt?: string;
  score?: number | null;
  items?: FoodItem[];
};

const getFoodItems = (log: DietLog) => {
  return log.items ?? [];
};

const getLogDate = (log: DietLog) => {
  return log.timestamp ?? log.createdAt;
};

const formatDate = (value?: string) => {
  if (!value) return "日付なし";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getScoreLabel = (score?: number | null) => {
  if (score == null) return "未評価";
  if (score >= 95) return "最高評価";
  if (score >= 90) return "かなり理想的";
  if (score >= 80) return "かなり良い";
  if (score >= 70) return "良い";
  if (score >= 60) return "普通";
  return "改善余地あり";
};

const getScoreGradient = (score: number) => {
  if (score >= 90) {
    return "linear-gradient(to top, #10b981, #34d399)";
  }

  if (score >= 80) {
    return "linear-gradient(to top, #22c55e, #86efac)";
  }

  if (score >= 70) {
    return "linear-gradient(to top, #eab308, #fde047)";
  }

  if (score >= 60) {
    return "linear-gradient(to top, #f97316, #fdba74)";
  }

  return "linear-gradient(to top, #ef4444, #fca5a5)";
};

const getScoreShadow = (score: number) => {
  if (score >= 90) return "0 0 18px rgba(16, 185, 129, 0.35)";
  if (score >= 80) return "0 0 18px rgba(34, 197, 94, 0.3)";
  if (score >= 70) return "0 0 18px rgba(234, 179, 8, 0.3)";
  if (score >= 60) return "0 0 18px rgba(249, 115, 22, 0.3)";
  return "0 0 18px rgba(239, 68, 68, 0.35)";
};

const getScoreMessage = (score?: number | null) => {
  if (score == null) return "まだ評価スコアがありません";
  if (score >= 95) return "かなり良い食事ができています";
  if (score >= 90) return "理想に近い食事です";
  if (score >= 80) return "良い食事を継続できています";
  if (score >= 70) return "悪くない内容です";
  if (score >= 60) return "改善余地があります";
  return "次の食事で立て直しましょう";
};

export default function DietDashboardPage() {
  const [logs, setLogs] = React.useState<DietLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/diet/logs", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch diet logs");
        }

        const data = await res.json();

        const nextLogs: DietLog[] = Array.isArray(data)
          ? data
          : data.logs ?? [];

        setLogs(nextLogs);
      } catch (e) {
        console.error(e);
        setError("食事履歴の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const sortedLogs = React.useMemo(() => {
    return [...logs].sort((a, b) => {
      const aTime = new Date(getLogDate(a) ?? 0).getTime();
      const bTime = new Date(getLogDate(b) ?? 0).getTime();

      return bTime - aTime;
    });
  }, [logs]);

  const scoredLogs = sortedLogs.filter((log) => typeof log.score === "number");

  const latestLog = sortedLogs[0];
  const latestScore = latestLog?.score ?? null;

  const averageScore =
    scoredLogs.length > 0
      ? Math.round(
          scoredLogs.reduce((sum, log) => sum + Number(log.score), 0) /
            scoredLogs.length
        )
      : null;

  const recentScoreLogs = scoredLogs.slice().reverse().slice(-6);

  return (
    <AuthGuard>
      <AppHeader />
      <div className="pt-16">
        <main className="min-h-screen bg-gradient-to-b from-orange-950 via-slate-900 to-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400">
              FITRA / DIET DASHBOARD
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              食事の記録と評価
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              保存済みの食事ログを確認し、直近の食事スコアと食事内容を振り返ります。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LoadingLink
              href="/diet"
              theme="diet"
              className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              食事を記録する
            </LoadingLink>
          </div>
        </header>

        {isLoading && (
          <section className="rounded-3xl border border-blue-500/30 bg-blue-950/30 p-5 text-sm text-blue-100">
            食事履歴を読み込んでいます。
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-500/40 bg-red-950/40 p-5 text-sm text-red-100">
            {error}
          </section>
        )}

        {!isLoading && !error && sortedLogs.length === 0 && (
          <section className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-semibold">まだ食事履歴がありません</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              まずは今日の食事を記録して、AI評価を保存してください。
            </p>

            <LoadingLink
              href="/diet"
              theme="diet"
              className="mt-5 inline-flex rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              最初の食事を記録する
            </LoadingLink>
          </section>
        )}

        {!isLoading && !error && sortedLogs.length > 0 && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 shadow-2xl shadow-black/20">
                <p className="text-xs text-emerald-300">直近スコア</p>

                <div className="mt-3 text-4xl font-bold">
                  {latestScore == null ? "--" : latestScore}
                  {latestScore != null && (
                    <span className="ml-1 text-base text-slate-300">点</span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {getScoreLabel(latestScore)}
                </p>
              </div>

              <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-6 shadow-2xl shadow-black/20">
                <p className="text-xs text-blue-300">平均スコア</p>

                <div className="mt-3 text-4xl font-bold">
                  {averageScore == null ? "--" : averageScore}
                  {averageScore != null && (
                    <span className="ml-1 text-base text-slate-300">点</span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  {scoredLogs.length}件の記録から算出
                </p>
              </div>

              <div className="rounded-3xl border border-orange-500/30 bg-orange-950/20 p-6 shadow-2xl shadow-black/20">
                <p className="text-xs text-orange-300">記録数</p>

                <div className="mt-3 text-4xl font-bold">
                  {sortedLogs.length}
                  <span className="ml-1 text-base text-slate-300">件</span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  保存済みの食事ログ
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">直近スコア推移</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    厳密なPFCではなく、食事の質の流れを確認します。
                  </p>
                </div>

                <LoadingLink
                  href="/diet"
                  theme="diet"
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  今日の食事を記録する
                </LoadingLink>
              </div>

              {recentScoreLogs.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/40 p-5 text-sm text-slate-300">
                  まだスコア付きの食事履歴がありません。
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {recentScoreLogs.map((log) => {
                    const score = Number(log.score);
                    const barHeight = Math.min(Math.max(score, 8), 100);

                    return (
                      <div
                        key={log.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                      >
                        <p className="text-xs text-slate-400">
                          {formatDate(getLogDate(log))}
                        </p>

                        <div className="mt-3 flex items-end gap-1">
                          <span className="text-3xl font-bold text-white">
                            {score}
                          </span>
                          <span className="pb-1 text-xs text-slate-400">
                            点
                          </span>
                        </div>

                        <div className="mt-3 h-24 rounded-xl bg-slate-900 p-2">
                          <div className="flex h-full items-end">
                            <div
                            className="w-full rounded-lg"
                            style={{
                                height: `${barHeight}%`,
                                background: getScoreGradient(score),
                                boxShadow: getScoreShadow(score),
                            }}
                            />
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-emerald-300">
                          {getScoreLabel(score)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">食事履歴</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    保存済みの食事ログを確認できます。
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  最新順で表示しています
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {sortedLogs.map((log) => {
                  const foodItems = getFoodItems(log);

                  const foodNames = foodItems
                    .map((item) => item.name)
                    .filter(Boolean);

                  const title =
                    foodNames.length > 0
                      ? foodNames.join("、")
                      : log.name ?? "食事ログ";

                  return (
                    <article
                      key={log.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-500/30 hover:bg-white/10"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">
                            {formatDate(getLogDate(log))}
                          </p>

                          <h3 className="mt-2 break-words text-xl font-bold text-white">
                            {title}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {foodNames.length > 0 ? (
                              foodNames.map((name, index) => (
                                <span
                                  key={`${name}-${index}`}
                                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
                                >
                                  {name}
                                </span>
                              ))
                            ) : (
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
                                食品名なし
                              </span>
                            )}
                          </div>

                          <p className="mt-4 text-sm text-slate-300">
                            {getScoreMessage(log.score)}
                          </p>
                        </div>

                        <div className="shrink-0 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-3 text-center">
                          <p className="text-xs text-emerald-300">score</p>

                          <p className="mt-1 text-3xl font-bold">
                            {log.score == null ? "--" : log.score}
                          </p>

                          <p className="mt-1 text-xs text-slate-300">
                            {getScoreLabel(log.score)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
        </main>
      </div>
    </AuthGuard>
  );
}