"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";

import { useTrainingDraft, type TrainingInputs } from "@/hooks/useTrainingDraft";

type Field = "weight" | "reps" | "sets";

type SelectedExercise = {
  value: string;
  label: string;
  group: string;
};

type LatestTrainingMap = Record<
  string,
  {
    weight: string;
    reps: string;
    sets: string;
  }
>;

const toInputValue = (v: number | "" | undefined | null) => {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
};

const toDraftNumber = (raw: string): number | "" => {
  if (raw === "") return "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : "";
};

export default function TrainingStep2() {
  const router = useRouter();
  const params = useSearchParams();

const selectedExercises = React.useMemo<SelectedExercise[]>(() => {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem("fitra:training:selectedExercises");
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}, []);

  const selectedExerciseKeys = React.useMemo(
    () => selectedExercises.map((e) => e.value),
    [selectedExercises]
  );

  const userId = "demo";

  const dateKey = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const fetchLatestFromDb =
    React.useCallback(async (): Promise<TrainingInputs | null> => {
      if (selectedExerciseKeys.length === 0) return null;

      const res = await fetch("/api/training/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: selectedExerciseKeys }),
      });

      if (!res.ok) return null;

      const nameMap = await res.json();

      const converted: TrainingInputs = {};

      for (const key of selectedExerciseKeys) {
        const db = nameMap[key];
        if (!db) continue;

        const w = Number(db.weight);
        const r = Number(db.reps);
        const s = Number(db.sets);

        converted[key] = {
          weight: Number.isFinite(w) && w > 0 ? w : "",
          reps: Number.isFinite(r) && r > 0 ? r : "",
          sets: Number.isFinite(s) && s > 0 ? s : "",
        };
      }

      return Object.keys(converted).length ? converted : null;
    }, [selectedExerciseKeys]);

  const { draft, updateField, resetToEmpty } = useTrainingDraft({
    userId,
    dateKey,
    selectedExerciseKeys,
    fetchLatestFromDb,
  });

  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [isLoadingPrevious, setIsLoadingPrevious] = React.useState(false);

  React.useEffect(() => {
    if (!activeKey && selectedExercises.length > 0) {
      setActiveKey(selectedExercises[0].value);
    }
  }, [activeKey, selectedExercises]);

  const handleLoadPrevious = async () => {
    setIsLoadingPrevious(true);

    try {
      const latest = await fetchLatestFromDb();
      if (!latest) return;

      for (const key of selectedExerciseKeys) {
        const v = latest[key];
        if (!v) continue;

        updateField(key, "weight", v.weight);
        updateField(key, "reps", v.reps);
        updateField(key, "sets", v.sets);
      }
    } finally {
      setIsLoadingPrevious(false);
    }
  };



const handleNext = () => {
  const rows = selectedExercises.map((exercise) => {
    const key = exercise.value;
    const v = draft[key] ?? { weight: "", reps: "", sets: "" };

    return {
      name: exercise.label,
      value: exercise.value,
      label: exercise.label,
      group: exercise.group,
      weight: v.weight === "" ? "" : String(v.weight),
      reps: v.reps === "" ? "" : String(v.reps),
      sets: v.sets === "" ? "" : String(v.sets),
    };
  });

  localStorage.setItem("fitra:training:records", JSON.stringify(rows));

  router.push("/training/normal/step3");
};

const isDisabled =
  selectedExerciseKeys.length === 0 ||
  selectedExerciseKeys.some((key) => {
    const v = draft[key];
    return !v || !v.weight || !v.reps || !v.sets;
  });

  return (
    <AuthGuard>
      <AppHeader />
      <div className="pt-16">
        <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 px-4 py-8 text-slate-50">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <Card className="mx-auto w-full max-w-3xl border-red-500/30 bg-zinc-900/90">
          <CardContent className="p-6 sm:p-8">
            <Button
              type="button"
              onClick={() => router.replace("/training/normal/step1")}
              className="mb-4 w-auto bg-transparent px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              ← 戻る
            </Button>

            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-300">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="mb-3 text-[11px] text-zinc-400">Step 2 / 3</p>

            <h1 className="mb-2 text-2xl font-bold">
              重量・レップ・セットを入力
            </h1>

            <p className="mb-4 text-sm leading-relaxed text-zinc-300">
              前回値を呼び出して、変更した部分だけ修正できます。
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={resetToEmpty}
                className="border border-slate-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
              >
                全部クリア
              </Button>

              <Button
                type="button"
                onClick={handleLoadPrevious}
                disabled={isLoadingPrevious || selectedExerciseKeys.length === 0}
                className="bg-red-500 text-white hover:bg-red-400 disabled:opacity-50"
              >
                {isLoadingPrevious ? "読込中..." : "前回値を入力"}
              </Button>
            </div>

            {selectedExercises.length === 0 ? (
              <p className="text-sm text-zinc-500">
                種目が取得できませんでした。ステップ1に戻って選び直してください。
              </p>
            ) : (
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {selectedExercises.map((exercise) => {
                  const key = exercise.value;
                  const label = exercise.label;
                  const v = draft[key] ?? { weight: "", reps: "", sets: "" };
                  const opened = activeKey === key;

                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveKey(opened ? null : key)}
                        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-100"
                      >
                        <span>{label}</span>
                        <span className="text-xs text-zinc-400">
                          {opened ? "▲" : "▼"}
                        </span>
                      </button>

                      {opened && (
                        <div className="mt-3 grid grid-cols-3 gap-3">
                          <Input
                            className="border-zinc-700 bg-zinc-950 text-slate-100"
                            placeholder="重量"
                            type="number"
                            value={toInputValue(v.weight)}
                            onChange={(e) =>
                              updateField(
                                key,
                                "weight",
                                toDraftNumber(e.target.value)
                              )
                            }
                          />

                          <Input
                            className="border-zinc-700 bg-zinc-950 text-slate-100"
                            placeholder="rep"
                            type="number"
                            value={toInputValue(v.reps)}
                            onChange={(e) =>
                              updateField(
                                key,
                                "reps",
                                toDraftNumber(e.target.value)
                              )
                            }
                          />

                          <Input
                            className="border-zinc-700 bg-zinc-950 text-slate-100"
                            placeholder="set"
                            type="number"
                            value={toInputValue(v.sets)}
                            onChange={(e) =>
                              updateField(
                                key,
                                "sets",
                                toDraftNumber(e.target.value)
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              className="mt-6 w-full"
              disabled={isDisabled}
              onClick={handleNext}
            >
              次へ
            </Button>
          </CardContent>
        </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}