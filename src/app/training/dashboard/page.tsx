"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getExerciseLabel } from "@/utils/exerciseLabel";

type TrainingRecord = {
  id: string;
  userId: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
  createdAt: string;
  source: "LIVE" | "NORMAL";
};

const bodyParts = ["all", "胸", "背中", "脚", "肩", "腕"] as const;

const exerciseBodyPartMap: Record<string, string> = {
  ベンチプレス: "胸",
  インクラインベンチプレス: "胸",
  ダンベルプレス: "胸",
  ダンベルフライ: "胸",
  チェストプレス: "胸",

  ラットプルダウン: "背中",
  シーテッドロー: "背中",
  デッドリフト: "背中",
  懸垂: "背中",
  バーベルロー: "背中",

  スクワット: "脚",
  レッグプレス: "脚",
  レッグエクステンション: "脚",
  レッグカール: "脚",
  ルーマニアンデッドリフト: "脚",

  ショルダープレス: "肩",
  サイドレイズ: "肩",
  リアレイズ: "肩",
  フロントレイズ: "肩",
  シュラッグ: "肩",

  アームカール: "腕",
  ハンマーカール: "腕",
  トライセプスプッシュダウン: "腕",
  ディップス: "腕",
  スカルクラッシャー: "腕",
};

const filterRecords = (records: TrainingRecord[]) => {
  const liveKeys = new Set(
    records
      .filter((r) => r.source === "LIVE")
      .map((r) => `${r.date}-${r.exercise}`)
  );

  return records.filter((r) => {
    const key = `${r.date}-${r.exercise}`;

    if (r.source === "NORMAL" && liveKeys.has(key)) {
      return false;
    }

    return true;
  });
};

const getExerciseHistory = (records: TrainingRecord[], exercise: string) => {
  const filtered = filterRecords(records).filter((r) => r.exercise === exercise);

  const grouped: Record<string, TrainingRecord[]> = {};

  filtered.forEach((r) => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });

  return Object.entries(grouped)
    .map(([date, items]) => {
      const totalVolume = items.reduce((sum, i) => sum + i.volume, 0);
      const maxWeight = Math.max(...items.map((i) => i.weight));
      const totalSets = items.reduce((sum, i) => sum + i.sets, 0);
      const totalReps = items.reduce((sum, i) => sum + i.reps * i.sets, 0);
      const avgReps = totalSets > 0 ? totalReps / totalSets : 0;

      return {
        ...items[0],
        date,
        weight: maxWeight,
        reps: avgReps,
        sets: totalSets,
        volume: totalVolume,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getLatestPair = (records: TrainingRecord[], exercise: string) => {
  const list = [...getExerciseHistory(records, exercise)].reverse();

  return {
    current: list[0],
    prev: list[1],
  };
};

const getTrendComment = (chartData: { weight: number }[]) => {
  if (chartData.length < 3) {
    return "まずは3回分の記録をためると傾向が見えてきます。";
  }

  const last3 = chartData.slice(-3);
  const a = last3[0].weight;
  const b = last3[1].weight;
  const c = last3[2].weight;

  if (a < b && b < c) {
    return "直近3回で重量が右肩上がりです。かなり良い流れです。";
  }

  if (a === b && b === c) {
    return "直近3回は重量維持できています。次回は+2.5kgを狙いたいです。";
  }

  if (a > b && b > c) {
    return "直近3回で重量が下がり気味です。疲労管理やフォーム確認を優先しても良さそうです。";
  }

  return "上下はありますが、記録は継続できています。";
};

export default function TrainingPage() {
  const router = useRouter();
  const [records, setRecords] = React.useState<TrainingRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [insight, setInsight] = React.useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = React.useState("all");

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("/api/training/records");
        const data = await res.json();

        setRecords(data.records ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem("trainingInsight");

    if (saved) {
      setInsight(saved);
      localStorage.removeItem("trainingInsight");
    }
  }, []);

  const filteredRecords = filterRecords(records);
  const exercises = Array.from(new Set(filteredRecords.map((r) => r.exercise)));

  const displayedExercises =
    selectedBodyPart === "all"
      ? exercises
      : exercises.filter(
          (exercise) => exerciseBodyPartMap[exercise] === selectedBodyPart
        );

  const totalVolume = filteredRecords.reduce((sum, r) => sum + r.volume, 0);

  const topExercise = exercises
    .map((ex) => {
      const { current, prev } = getLatestPair(filteredRecords, ex);

      if (!current || !prev) return null;

      const diff =
        current.weight -
        prev.weight +
        (current.reps - prev.reps) +
        (current.sets - prev.sets);

      return {
        exercise: ex,
        label: getExerciseLabel(ex),
        diff,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.diff ?? 0) - (a?.diff ?? 0))[0];

  const shareText = `今日のトレーニング完了🔥
総ボリューム：${totalVolume.toLocaleString()}kg
${topExercise ? `直近で一番伸びた種目：${topExercise.label}` : ""}

#FITRA #筋トレ記録 #ボディメイク`;

  const shareToX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText);
    alert("コピーしました");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            FITRA / TRAINING DASHBOARD
          </p>
          <h1 className="mt-2 text-3xl font-bold">成長ダッシュボード</h1>
          <p className="mt-2 text-sm text-slate-400">
            数値だけでなく、直近の伸び方をグラフで確認できます。
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-900/80">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
              <p className="text-sm text-slate-300">総ボリューム</p>
              <p className="mt-1 text-3xl font-bold text-sky-300">
                {totalVolume.toLocaleString()}kg
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="text-sm text-slate-300">直近で一番伸びた種目</p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {topExercise ? topExercise.label : "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-5">
              <p className="text-sm text-slate-300">AIコメント</p>
              <p className="mt-1 text-sm text-pink-200">
                {insight
                  ? insight
                  : topExercise
                  ? `${topExercise.label}が今回もっとも伸びています。次回もこの流れで狙えます。`
                  : "まずは数回分の記録をためると分析できます。"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {bodyParts.map((part) => (
            <button
              key={part}
              onClick={() => setSelectedBodyPart(part)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedBodyPart === part
                  ? "bg-sky-400 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {part === "all" ? "全て" : part}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-400">読み込み中...</p>
        ) : filteredRecords.length === 0 ? (
          <Card className="border-slate-700 bg-slate-900/80">
            <CardContent className="p-6">
              <p className="text-slate-400">まだ記録がありません。</p>
              <Button className="mt-4" onClick={() => router.push("/training/step1")}>
                記録を開始する
              </Button>
            </CardContent>
          </Card>
        ) : displayedExercises.length === 0 ? (
          <Card className="border-slate-700 bg-slate-900/80">
            <CardContent className="p-6">
              <p className="text-slate-400">
                この部位の記録はまだありません。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {displayedExercises.map((exercise) => {
              const history = getExerciseHistory(filteredRecords, exercise);

              const chartData = history.slice(-5).map((r) => ({
                date: r.date.slice(5),
                weight: r.weight,
              }));

              const { current, prev } = getLatestPair(filteredRecords, exercise);
              if (!current) return null;

              const currentSummary = {
                weight: current.weight,
                reps: Math.round(current.reps),
                sets: current.sets,
              };

              const prevSummary = prev
                ? {
                    weight: prev.weight,
                    reps: Math.round(prev.reps),
                    sets: prev.sets,
                  }
                : null;

              const diff = prevSummary
                ? {
                    weight: currentSummary.weight - prevSummary.weight,
                    reps: currentSummary.reps - prevSummary.reps,
                    sets: currentSummary.sets - prevSummary.sets,
                  }
                : null;

              const improved =
                diff &&
                (diff.weight > 0 || diff.reps > 0 || diff.sets > 0);

              return (
                <Card key={exercise} className="border-slate-700 bg-slate-900/80">
                  <CardContent className="space-y-5 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          {getExerciseLabel(exercise)}
                        </h2>

                        <div>
                          <p className="text-sm text-slate-400">
                            今回：{currentSummary.weight}kg ×{" "}
                            {currentSummary.reps}rep × {currentSummary.sets}
                            セット
                          </p>

                          {diff && (
                            <div className="mt-2 text-sm">
                              <p>
                                重量：{diff.weight >= 0 ? "+" : ""}
                                {diff.weight}kg
                              </p>
                              <p>
                                rep：{diff.reps >= 0 ? "+" : ""}
                                {diff.reps}
                              </p>
                              <p>
                                セット：{diff.sets >= 0 ? "+" : ""}
                                {diff.sets}セット
                              </p>
                              <p>{improved ? "🔥 向上" : "→ 維持/低下"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="h-56 rounded-xl border border-slate-700 bg-slate-950 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="date" stroke="#94a3b8" />
                          <YAxis
                            stroke="#94a3b8"
                            domain={["dataMin - 5", "dataMax + 5"]}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#020617",
                              border: "1px solid #334155",
                              borderRadius: "12px",
                              color: "#e2e8f0",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            name="重量"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            dot
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                      <p className="text-sm text-slate-300">
                        {getTrendComment(chartData)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-slate-700 bg-slate-900/80">
          <CardContent className="space-y-4 p-6">
            <p className="font-semibold">SNS共有</p>
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              {shareText}
            </pre>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={shareToX}
                className="bg-blue-400 text-slate-950 hover:bg-blue-400"
              >
                Xで共有
              </Button>
              <Button
                onClick={copyText}
                className="bg-pink-500 text-white hover:bg-pink-400"
              >
                インスタ用コピー
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}