// src/app/life/fatigue/page.tsx
"use client";

import * as React from "react";
import LoadingLink from "@/components/LoadingLink";

const STORAGE_KEY = "fitra_life_fatigue_detail";
const LIFE_SCORE_KEY = "fitra_life_fatigue_score";

const fatigueChecks = [
  {
    id: "bodyHeavy",
    label: "身体が重い",
    desc: "身体の重さは、回復不足や前日の負荷が残っているサインとして扱います。",
    impact: 10,
  },
  {
    id: "muscleSoreness",
    label: "筋肉痛がある",
    desc: "筋肉痛が強い場合、トレーニング由来の疲労が残っている可能性があります。",
    impact: 8,
  },
  {
    id: "lowFocus",
    label: "集中力が低い",
    desc: "集中力の低下は、睡眠・疲労・ストレスが重なったときにも出やすい項目です。",
    impact: 8,
  },
  {
    id: "sleepiness",
    label: "眠気がある",
    desc: "眠気がある場合、睡眠の回復感や生活リズムも合わせて確認する必要があります。",
    impact: 8,
  },
  {
    id: "highTrainingLoad",
    label: "昨日の運動量が多い",
    desc: "前日のトレーニング量が多い場合、今日の疲労感に影響する可能性があります。",
    impact: 10,
  },
  {
    id: "lowFood",
    label: "食事量が少なかった",
    desc: "食事量が少ない状態で活動量が多いと、だるさや回復不足につながりやすくなります。",
    impact: 9,
  },
  {
    id: "lowCarb",
    label: "炭水化物が少なかった",
    desc: "炭水化物が少ないと、トレーニング時の出力やだるさに影響する場合があります。",
    impact: 8,
  },
  {
    id: "canMove",
    label: "今日は動けそう",
    desc: "体感として動けそうな日は、疲労スコアを少し下げる材料として扱います。",
    impact: -8,
  },
];

export default function FatiguePage() {
  const [fatigueLevel, setFatigueLevel] = React.useState<number>(5);
  const [activityMeter, setActivityMeter] = React.useState<number>(60);
  const [selectedChecks, setSelectedChecks] = React.useState<string[]>([]);
  const [aiComment, setAiComment] = React.useState("");
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setFatigueLevel(parsed.fatigueLevel ?? 5);
      setActivityMeter(parsed.activityMeter ?? 60);
      setSelectedChecks(parsed.selectedChecks ?? []);
      setAiComment(parsed.aiComment ?? "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const fatigueScore = React.useMemo(() => {
    const subjectiveFatigue = fatigueLevel * 6;
    const activityPenalty = (100 - activityMeter) * 0.25;

    const checkImpact = fatigueChecks
      .filter((item) => selectedChecks.includes(item.id))
      .reduce((sum, item) => sum + item.impact, 0);

    return Math.max(
      0,
      Math.min(100, Math.round(subjectiveFatigue + activityPenalty + checkImpact))
    );
  }, [fatigueLevel, activityMeter, selectedChecks]);

  const status =
    fatigueScore >= 70
      ? {
          label: "高疲労",
          color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
          comment:
            "疲労が強めに出ています。今日は重量更新より、回復寄りの判断が合いそうです。",
        }
      : fatigueScore >= 50
        ? {
            label: "中等度疲労",
            color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
            comment:
              "疲労は中程度です。動けますが、強度を上げすぎると回復が遅れる可能性があります。",
          }
        : fatigueScore >= 30
          ? {
              label: "軽度疲労",
              color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
              comment:
                "疲労は軽めです。通常の活動はしやすい状態ですが、体感も見ながら進めるのが良さそうです。",
            }
          : {
              label: "良好",
              color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
              comment:
                "疲労はかなり少なめです。通常のトレーニングや活動に入りやすい状態です。",
            };

  const saveDetail = (comment?: string) => {
    const data = {
      fatigueLevel,
      activityMeter,
      selectedChecks,
      fatigueScore,
      aiComment: comment ?? aiComment,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const toggleCheck = (id: string) => {
    setSelectedChecks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setAiComment("");
    setSavedMessage("");
  };

  const handleAnalyze = async () => {
    setSavedMessage("");
    setAiComment("AIが疲労状態を分析しています...");

    const body = {
      domain: "life",
      level: "beginner",
      goal: "health",
      summary: {
        sleep: 7,
        fatigue: fatigueLevel,
        stress: 5,
        detailType: "fatigue",
        coefficientLevel: 6,
        fatigueDetail: {
          fatigue: fatigueLevel,
          subjectiveScore: activityMeter,
          selectedChecks,
          fatigueScore,
        },
      },
    };

    try {
      const res = await fetch("/api/life/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiComment(data.feedback ?? "AI分析に失敗しました。");
        return;
      }

      const feedback = data.feedback ?? "";
      setAiComment(feedback);
      saveDetail(feedback);
      setSavedMessage("疲労分析を保存しました。");
    } catch (error) {
      console.error(error);
      setAiComment("AI分析の取得に失敗しました。時間をおいて再度お試しください。");
    }
  };

  const handleApplyToLife = () => {
    console.log("疲労スコア反映:", fatigueScore);

    const data = {
      score: fatigueScore,
      fatigueLevel,
      activityMeter,
      selectedChecks,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LIFE_SCORE_KEY, JSON.stringify(data));
    saveDetail(aiComment);
    setSavedMessage("Life画面の疲労評価に反映しました。");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-emerald-400">
              LIFE / FATIGUE ANALYZER
            </p>

            <h1 className="mt-3 text-3xl font-black">疲労AI</h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              疲労度、今日動けそうな感覚、Training・Diet由来のサインから、
              今日の疲労状態を確認します。
            </p>
          </div>

          <LoadingLink
            href="/life"
            theme="life"
            className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-200 hover:bg-emerald-500/20"
          >
            ← Life
          </LoadingLink>
        </header>

        {savedMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {savedMessage}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-[1fr,340px]">
          <div className="space-y-5 rounded-3xl border border-slate-800 bg-black/20 p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">疲労度</p>
                <p className="text-xl font-black text-emerald-300">
                  {fatigueLevel}/10
                </p>
              </div>

              <input
                type="range"
                min={0}
                max={10}
                value={fatigueLevel}
                onChange={(e) => {
                  setFatigueLevel(Number(e.target.value));
                  setSavedMessage("");
                }}
                className="mt-3 w-full accent-emerald-400"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>軽い</span>
                <span>普通</span>
                <span>かなり重い</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">今日動けそうメーター</p>
                <p className="text-xl font-black text-emerald-300">
                  {activityMeter}
                </p>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={activityMeter}
                onChange={(e) => {
                  setActivityMeter(Number(e.target.value));
                  setSavedMessage("");
                }}
                className="mt-3 w-full accent-emerald-400"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>かなり重い</span>
                <span>普通</span>
                <span>かなり動ける</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-slate-400">気になる項目（任意）</p>
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(true)}
                  className="text-xs text-emerald-300 underline underline-offset-4"
                >
                  なぜ影響する？
                </button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {fatigueChecks.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm ${
                      selectedChecks.includes(item.id)
                        ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChecks.includes(item.id)}
                      onChange={() => toggleCheck(item.id)}
                      className="mr-2"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              AIに疲労状態を評価してもらう
            </button>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                AI COMMENT
              </p>

              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-slate-200">
                {aiComment || status.comment}
              </div>
            </div>

            <div className={`rounded-3xl border p-6 ${status.color}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs">FATIGUE SCORE</p>
                  <p className="mt-2 text-sm">{status.label}</p>
                </div>

                <p className="text-6xl font-black">{fatigueScore}</p>
              </div>

              <p className="mt-3 text-xs opacity-80">
                高いほど疲労が強いスコアです。
              </p>

              <button
                type="button"
                onClick={handleApplyToLife}
                className="cursor-pointer active:translate-y-[1px] active:scale-[0.99] mt-5 w-full rounded-2xl border border-current/30 bg-black/20 px-4 py-3 text-sm font-semibold transition hover:bg-black/30"
              >
                この疲労スコアをLifeに反映する
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                SCORE DETAIL
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label="疲労度" value={`${fatigueLevel}/10`} />
                <DetailRow label="動けそうメーター" value={`${activityMeter}/100`} />
                <DetailRow label="選択項目" value={`${selectedChecks.length}個`} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.25em] text-emerald-300">
                  FATIGUE FACTORS
                </p>

                <h2 className="mt-3 text-2xl font-bold">
                  なぜスコアに影響するのか
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
              >
                閉じる
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              {fatigueChecks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <p className="font-semibold text-emerald-300">{item.label}</p>
                  <p className="mt-2 text-slate-400">{item.desc}</p>
                </div>
              ))}

              <p className="text-xs text-slate-500">
                ※ この説明は医学的な診断ではありません。疲労状態を振り返るための補助情報です。
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}