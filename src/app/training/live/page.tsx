"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const exerciseGroups = [
  {
    group: "胸",
    options: [
      { value: "bench_press", label: "ベンチプレス" },
      { value: "incline_bench_press", label: "インクラインベンチプレス" },
      { value: "dumbbell_press", label: "ダンベルプレス" },
      { value: "dumbbell_fly", label: "ダンベルフライ" },
      { value: "machine_chest_press", label: "チェストプレス（マシン）" },
    ],
  },
  {
    group: "背中",
    options: [
      { value: "deadlift", label: "デッドリフト" },
      { value: "lat_pulldown", label: "ラットプルダウン" },
      { value: "seated_row", label: "シーテッドロー" },
      { value: "barbell_row", label: "バーベルロー" },
      { value: "pull_up", label: "懸垂" },
    ],
  },
  {
    group: "脚",
    options: [
      { value: "squat", label: "スクワット" },
      { value: "leg_press", label: "レッグプレス" },
      { value: "leg_extension", label: "レッグエクステンション" },
      { value: "leg_curl", label: "レッグカール" },
      { value: "romanian_deadlift", label: "ルーマニアンデッドリフト" },
    ],
  },
  {
    group: "肩",
    options: [
      { value: "shoulder_press", label: "ショルダープレス" },
      { value: "side_raise", label: "サイドレイズ" },
      { value: "front_raise", label: "フロントレイズ" },
      { value: "rear_delt_fly", label: "リアデルトフライ" },
      { value: "shrug", label: "シュラッグ" },
    ],
  },
  {
    group: "腕",
    options: [
      { value: "barbell_curl", label: "バーベルカール" },
      { value: "dumbbell_curl", label: "ダンベルカール" },
      { value: "hammer_curl", label: "ハンマーカール" },
      { value: "triceps_pushdown", label: "トライセプスプッシュダウン" },
      { value: "dips", label: "ディップス" },
    ],
  },
];

export default function LivePage() {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<number | null>(null);

  const [trainingPart, setTrainingPart] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [memo, setMemo] = useState("");
  const [intensityMode, setIntensityMode] = useState("通常");

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [setNumber, setSetNumber] = useState(1);

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([
    "FITRA: LIVE開始後、筋トレのセット記録に合わせてアドバイスできます。",
  ]);

  const currentGroup = exerciseGroups.find((g) => g.group === trainingPart);

  const selectedExerciseLabel =
    currentGroup?.options.find((o) => o.value === exerciseName)?.label ?? "";

  const canAddSet =
    !!sessionId &&
    !!trainingPart &&
    !!exerciseName &&
    Number(weight) > 0 &&
    Number(reps) > 0;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startSession = async () => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 1,
        mode: "LIVE",
      }),
    });

    const data = await res.json();

    setSessionId(data.sessionId);
    setSeconds(0);
    setIsRunning(false);
    setSetNumber(1);

    setMessages((prev) => [
      ...prev,
      `FITRA: ${intensityMode}モードで開始。部位・種目・重量・repsを入力してSet追加してください。`,
    ]);
  };

  const getLiveAdvice = async () => {
    const res = await fetch("/api/training/live-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        trainingPart,
        intensityMode,
        exerciseName: selectedExerciseLabel,
        weight: Number(weight),
        reps: Number(reps),
        setNumber,
      }),
    });

    const data = await res.json();
    return data.feedback;
  };

  const addLog = async () => {
    if (!canAddSet) return;

    setMessages((prev) => [
      ...prev,
      `YOU: Set ${setNumber} → ${selectedExerciseLabel} ${weight}kg × ${reps}`,
      "FITRA: 記録中...",
    ]);

    try {
      const logRes = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          exerciseName,
          weight: Number(weight),
          reps: Number(reps),
          setNumber,
          memo: memo.trim() || null,
        }),
      });

      if (!logRes.ok) {
        throw new Error("logs API failed");
      }

      let advice = "記録完了。呼吸を整えて、次のセットに入りましょう。";

      try {
        advice = await getLiveAdvice();
      } catch (error) {
        console.error("live-advice error:", error);
      }

      setMessages((prev) => [
        ...prev.filter((m) => m !== "FITRA: 記録中..."),
        `FITRA: ${advice}`,
      ]);

      setSetNumber((prev) => prev + 1);
      setWeight("");
      setReps("");
      setMemo("");
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev.filter((m) => m !== "FITRA: 記録中..."),
        "FITRA: 記録に失敗しました。入力内容かAPIを確認してください。",
      ]);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");

    setMessages((prev) => [...prev, `YOU: ${userMessage}`]);

    try {
      const res = await fetch("/api/training/live-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainingPart,
          intensityMode,
          exerciseName: selectedExerciseLabel || "未選択",
          setNumber,
          message: userMessage,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [...prev, `FITRA: ${data.feedback}`]);
    } catch {
      setMessages((prev) => [
        ...prev,
        "FITRA: 今は応答できません。呼吸を整えて、無理せずいきましょう。",
      ]);
    }
  };

  const finishSession = async () => {
  if (!sessionId) return;

  await fetch(`/api/sessions/${sessionId}/finish`, {
    method: "PUT",
  });

  setSessionId(null);
  setIsRunning(false);
  setSeconds(0);
  setSetNumber(1);

  router.push("/training/dashboard");
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-red-950 text-white px-5 py-6">
      <button
        onClick={() => router.push("/training")}
        className="mb-8 text-sm text-zinc-500 hover:text-white"
      >
        ← 戻る
      </button>

      <div className="relative flex flex-col items-center text-center mb-12 mt-4">
        <div className="absolute -top-6 h-24 w-24 rounded-full bg-red-600/20 blur-3xl" />

        <p className="text-xs font-bold tracking-[0.4em] text-red-500 mb-3">
          FITRA LIVE MODE
        </p>

        <h1 className="text-5xl font-black tracking-tight leading-none">
          LIVE
          <span className="block text-red-500">TRAINING</span>
        </h1>

        <div className="mt-5 h-[2px] w-20 bg-red-600 rounded-full" />

        <p className="mt-5 text-sm text-zinc-400 max-w-xs leading-relaxed">
          筋トレの1セットを素早く記録。FITRAがその場で次の一手を返します。
        </p>
      </div>

      {!sessionId && (
        <section className="rounded-2xl border border-red-900 bg-zinc-950/80 p-5 space-y-4">
          <select
            value={intensityMode}
            onChange={(e) => setIntensityMode(e.target.value)}
            className="w-full rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm"
          >
            <option>調整</option>
            <option>通常</option>
            <option>ハード</option>
            <option>MAX狙い</option>
          </select>

          <button
            onClick={startSession}
            className="w-full rounded-xl bg-red-600 py-4 font-black tracking-wide shadow-[0_0_30px_rgba(220,38,38,0.35)] active:scale-[0.98]"
          >
            LIVE START
          </button>
        </section>
      )}

      {sessionId && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-red-900 bg-zinc-950/80 p-5 space-y-3">
            <p className="text-sm font-bold text-zinc-300">記録</p>

            <select
              value={trainingPart}
              onChange={(e) => {
                setTrainingPart(e.target.value);
                setExerciseName("");
              }}
              className="w-full rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm"
            >
              <option value="">部位を選択</option>
              <option value="胸">胸</option>
              <option value="背中">背中</option>
              <option value="脚">脚</option>
              <option value="肩">肩</option>
              <option value="腕">腕</option>
            </select>

            <select
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              disabled={!currentGroup}
              className="w-full rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm disabled:opacity-40"
            >
              <option value="">種目を選択</option>
              {currentGroup?.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ：フォーム、体感、痛みなど（任意）"
              className="w-full rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm"
              />

              <input
                type="number"
                inputMode="numeric"
                min="0"
                placeholder="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="rounded-xl bg-black border border-zinc-800 px-4 py-3 text-sm"
              />
            </div>

            <button
              onClick={addLog}
              disabled={!canAddSet}
              className="w-full rounded-xl bg-red-600 py-3 font-bold active:scale-[0.98] disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none disabled:active:scale-100"
            >
              Set追加
            </button>

            {!canAddSet && (
              <p className="text-xs text-zinc-500">
                部位・種目・重量・repsを入力するとSet追加できます。
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-red-900 bg-black p-5 text-center">
            <p className="text-xs tracking-[0.3em] text-zinc-400 mb-4">
              INTERVAL
            </p>

            <div className="text-5xl font-black tracking-wider my-5">
              {formatTime(seconds)}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6">
              <button
                onClick={() => setIsRunning(true)}
                className="rounded-lg bg-red-600 py-2 text-xs font-bold"
              >
                START
              </button>

              <button
                onClick={() => setIsRunning(false)}
                className="rounded-lg bg-zinc-800 py-2 text-xs font-bold"
              >
                STOP
              </button>

              <button
                onClick={() => setSeconds(0)}
                className="rounded-lg bg-zinc-800 py-2 text-xs font-bold"
              >
                RESET
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-red-900 bg-zinc-900/90 p-5">
            <p className="text-sm font-bold mb-3">FITRA</p>

            <div className="h-64 overflow-y-auto text-sm space-y-3 mb-3 text-zinc-300">
              {messages.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="FITRAに聞く"
                className="min-w-0 flex-1 rounded-xl bg-black border border-zinc-800 px-3 py-3 text-sm"
              />

              <button
                onClick={sendMessage}
                className="rounded-xl bg-red-600 px-4 text-sm font-bold"
              >
                送信
              </button>
            </div>
          </section>
          <button
            onClick={finishSession}
            className="w-full rounded-xl bg-zinc-800 py-3 font-bold text-zinc-200"
          >
            トレーニング終了
          </button>
        </div>
      )}
    </main>
  );
}