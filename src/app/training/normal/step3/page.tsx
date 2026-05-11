"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Row = {
  name: string;
  value: string;
  label: string;
  group: string;
  weight: string;
  reps: string;
  sets: string;
};

const nf = new Intl.NumberFormat("ja-JP");

const toNum = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function TrainingStep3() {
  const router = useRouter();
  const [rows, setRows] = React.useState<Row[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const raw = localStorage.getItem("fitra:training:records");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Row[];
      setRows(Array.isArray(parsed) ? parsed.filter((r) => r?.name) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const summary = React.useMemo(() => {
    const perExercise = rows.map((r) => {
      const w = toNum(r.weight);
      const reps = toNum(r.reps);
      const sets = toNum(r.sets);
      const totalReps = reps * sets;
      const volume = w * totalReps;

      return {
        name: r.name,
        value: r.value,
        group: r.group,
        w,
        reps,
        sets,
        totalReps,
        volume,
      };
    });

    const totalVolume = perExercise.reduce((a, x) => a + x.volume, 0);
    const totalSets = perExercise.reduce((a, x) => a + x.sets, 0);
    const totalReps = perExercise.reduce((a, x) => a + x.totalReps, 0);

    return { perExercise, totalVolume, totalSets, totalReps };
  }, [rows]);

  const canSave = rows.length > 0;

  const handleComplete = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/training/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo",
          date: new Date().toISOString().slice(0, 10),
          rows,
          level: "beginner",
          goal: "bulk",
        }),
      });

      const data = await res.json();

console.log("TRAINING_SAVE_RESPONSE:", {
  status: res.status,
  ok: res.ok,
  data,
});

      if (!res.ok) {
        throw new Error(data.error ?? "保存に失敗しました");
      }

      if (data.insight) {
        localStorage.setItem("trainingInsight", data.insight);
      }

      router.push("/training/dashboard");
    } catch (error) {
      console.error(error);
      setError("記録保存またはAI評価に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <Card className="mx-auto w-full max-w-3xl border-slate-700 bg-slate-900/80">
          <CardContent className="p-6 sm:p-8">
            <Button
              type="button"
              onClick={() => router.replace("/training/normal/step2")}
              className="mb-4 w-auto bg-transparent px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              ← 戻る
            </Button>

            <div className="mb-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-400">
                FITRA / TRAINING ANALYZER
              </p>
              <p className="mb-3 text-[11px] text-slate-400">Step 3 / 3</p>

              <h1 className="mb-2 text-2xl font-bold">
                今日のトレーニング結果
              </h1>

              <p className="text-sm leading-relaxed text-slate-300">
                入力内容から総ボリュームと合計を算出しました。
                記録完了後、AIコメントを生成してダッシュボードに表示します。
              </p>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総ボリューム</p>
                <p className="mt-1 text-2xl font-bold">
                  {nf.format(summary.totalVolume)}kg
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総セット数</p>
                <p className="mt-1 text-2xl font-bold">
                  {nf.format(summary.totalSets)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400">総レップ数</p>
                <p className="mt-1 text-2xl font-bold">
                  {nf.format(summary.totalReps)}
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              {summary.perExercise.map((x) => (
                <div
                  key={x.value}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{x.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {x.w}kg × {x.reps}rep × {x.sets}set
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">ボリューム</p>
                    <p className="text-lg font-bold">
                      {nf.format(x.volume)}kg
                    </p>
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <p className="text-sm text-slate-500">
                  データが取得できませんでした。Step2からやり直してください。
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={() => router.replace("/training/normal/step2")}
                className="w-full border border-slate-700 bg-transparent hover:bg-slate-800 sm:w-auto"
              >
                修正
              </Button>

              <Button
                type="button"
                disabled={!canSave || isSaving}
                onClick={handleComplete}
                className="w-full sm:w-auto"
              >
                {isSaving ? "保存・AI分析中..." : "記録完了"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}