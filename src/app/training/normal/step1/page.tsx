"use client";

import * as React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ExerciseOption = {
  value: string;
  label: string;
};

type ExerciseGroup = {
  group: string;
  options: ExerciseOption[];
};

type SelectedExercise = {
  value: string;
  label: string;
  group: string;
};

const trainingMenu: ExerciseGroup[] = [
  {
    group: "胸（Chest）",
    options: [
      { value: "bench_press", label: "ベンチプレス" },
      { value: "incline_bench_press", label: "インクラインベンチプレス" },
      { value: "decline_bench_press", label: "デクラインベンチプレス" },
      { value: "dumbbell_press", label: "ダンベルプレス" },
      { value: "incline_dumbbell_press", label: "インクラインダンベルプレス" },
      { value: "dumbbell_fly", label: "ダンベルフライ" },
      { value: "cable_fly", label: "ケーブルフライ" },
      { value: "pec_deck_fly", label: "ペックデックフライ" },
      { value: "push_up", label: "プッシュアップ" },
      { value: "weighted_push_up", label: "加重プッシュアップ" },
      { value: "machine_chest_press", label: "チェストプレス（マシン）" },
      { value: "smith_bench_press", label: "スミスベンチプレス" },
    ],
  },
  {
    group: "背中（Back）",
    options: [
      { value: "deadlift", label: "デッドリフト" },
      { value: "lat_pulldown", label: "ラットプルダウン" },
      { value: "seated_row", label: "シーテッドロー" },
      { value: "barbell_row", label: "バーベルロー" },
      { value: "dumbbell_row", label: "ワンハンドダンベルロー" },
      { value: "pull_up", label: "懸垂" },
      { value: "chin_up", label: "チンニング" },
      { value: "face_pull", label: "フェイスプル" },
      { value: "back_extension", label: "バックエクステンション" },
    ],
  },
  {
    group: "脚（Legs）",
    options: [
      { value: "squat", label: "スクワット" },
      { value: "front_squat", label: "フロントスクワット" },
      { value: "hack_squat", label: "ハックスクワット" },
      { value: "leg_press", label: "レッグプレス" },
      { value: "lunges", label: "ランジ" },
      { value: "bulgarian_split_squat", label: "ブルガリアンスクワット" },
      { value: "leg_extension", label: "レッグエクステンション" },
      { value: "leg_curl", label: "レッグカール" },
      { value: "romanian_deadlift", label: "ルーマニアンデッドリフト" },
      { value: "hip_thrust", label: "ヒップスラスト" },
      { value: "calf_raise", label: "カーフレイズ" },
    ],
  },
  {
    group: "肩（Shoulders）",
    options: [
      { value: "shoulder_press", label: "ショルダープレス" },
      { value: "smith_shoulder_press", label: "スミスショルダープレス" },
      { value: "military_press", label: "ミリタリープレス" },
      { value: "arnold_press", label: "アーノルドプレス" },
      { value: "side_raise", label: "サイドレイズ" },
      { value: "front_raise", label: "フロントレイズ" },
      { value: "rear_delt_fly", label: "リアデルトフライ" },
      { value: "machine_shoulder_press", label: "ショルダープレス（マシン）" },
      { value: "shrug", label: "シュラッグ" },
    ],
  },
  {
    group: "腕（Arms）",
    options: [
      { value: "barbell_curl", label: "バーベルカール" },
      { value: "dumbbell_curl", label: "ダンベルカール" },
      { value: "hammer_curl", label: "ハンマーカール" },
      { value: "preacher_curl", label: "プリーチャーカール" },
      { value: "triceps_pushdown", label: "トライセプスプッシュダウン" },
      { value: "french_press", label: "フレンチプレス" },
      { value: "dips", label: "ディップス" },
      { value: "close_grip_bench", label: "ナローベンチプレス" },
      { value: "overhead_extension", label: "オーバーヘッドエクステンション" },
    ],
  },
];

export default function TrainingStep1() {
  const router = useRouter();

  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [exercises, setExercises] = useState<SelectedExercise[]>([]);

  React.useEffect(() => {
  const raw = localStorage.getItem("fitra:training:selectedExercises");
  if (!raw) return;

  try {
    setExercises(JSON.parse(raw));
  } catch {
    setExercises([]);
  }
}, []);

  const filteredOptions = useMemo(() => {
    return trainingMenu.find((menu) => menu.group === selectedGroup)?.options ?? [];
  }, [selectedGroup]);

  const addExercise = () => {
    if (!selectedGroup || !selectedValue) return;

    const option = filteredOptions.find((item) => item.value === selectedValue);
    if (!option) return;

    if (exercises.some((exercise) => exercise.value === option.value)) return;

    setExercises((prev) => [
      ...prev,
      {
        value: option.value,
        label: option.label,
        group: selectedGroup,
      },
    ]);

    setSelectedValue("");
  };

  const removeExercise = (value: string) => {
    setExercises((prev) => prev.filter((exercise) => exercise.value !== value));
  };

const handleNext = () => {
  localStorage.setItem("fitra:training:selectedExercises", JSON.stringify(exercises));
  router.push("/training/normal/step2");
};

  return (
    <AuthGuard>
      <AppHeader />
      <div className="pt-16">
        <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 px-4 py-8 text-slate-50">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <Card className="mx-auto w-full max-w-xl border-red-500/30 bg-zinc-900/90">
          <CardContent className="p-6 sm:p-8">
            <Button
              type="button"
              onClick={() => router.push("/training")}
              className="mb-4 w-auto bg-transparent px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              ← 戻る
            </Button>

            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-red-300">
              FITRA / TRAINING ANALYZER
            </p>
            <p className="mb-3 text-[11px] text-zinc-400">Step 1 / 3</p>

            <h1 className="mb-2 text-2xl font-bold">今日の種目を選ぼう</h1>
            <p className="mb-4 text-sm leading-relaxed text-zinc-300">
              まず部位で絞り込み、実際に行った種目を追加してください。
            </p>

            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setSelectedValue("");
                }}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="">部位を選択</option>
                {trainingMenu.map((menu) => (
                  <option key={menu.group} value={menu.group}>
                    {menu.group}
                  </option>
                ))}
              </select>

              <select
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                disabled={!selectedGroup}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm disabled:opacity-40"
              >
                <option value="">種目を選択</option>
                {filteredOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              onClick={addExercise}
              disabled={!selectedGroup || !selectedValue}
              className="mb-6 w-full bg-red-500 text-white hover:bg-red-400"
            >
              追加
            </Button>

            <div className="mb-6">
              <p className="mb-2 text-xs text-zinc-400">
                今日のメニュー（タップで削除）：
              </p>

              {exercises.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  まだ種目が追加されていません。
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {exercises.map((exercise) => (
                    <button
                      key={exercise.value}
                      type="button"
                      onClick={() => removeExercise(exercise.value)}
                      className="rounded-full bg-zinc-800 px-3 py-1 text-xs hover:bg-red-500/70"
                    >
                      {exercise.label} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              disabled={exercises.length === 0}
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