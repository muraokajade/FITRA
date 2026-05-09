"use client";

import * as React from "react";
import LoadingLink from "@/components/LoadingLink";

const STORAGE_KEY = "fitra_life_sleep_detail";
const LIFE_SCORE_KEY = "fitra_life_sleep_score";

const sleepChecks = [
  {
    id: "wakeup",
    label: "夜中に起きた",
    desc: "中途覚醒があると、睡眠時間が長くても回復感が下がることがあります。",
    impact: -8,
    disabled: false,
  },
  {
    id: "hardToSleep",
    label: "寝つきが悪かった",
    desc: "寝つきの悪さは、睡眠の満足感や翌日のだるさに影響しやすい項目です。",
    impact: -8,
    disabled: false,
  },
  {
    id: "sleepyMorning",
    label: "起きても眠かった",
    desc: "起床後の眠気が強い場合、睡眠時間だけでは回復を十分に判断できません。",
    impact: -10,
    disabled: false,
  },
  {
    id: "badDream",
    label: "嫌な夢を見た",
    desc: "夢の内容だけで医学的な判断はしません。主観的な睡眠満足度の補助情報として扱います。",
    impact: -4,
    disabled: false,
  },
  {
    id: "refresh",
    label: "朝スッキリ起きた",
    desc: "起床時の軽さは、睡眠の満足感を判断する主観情報として使います。",
    impact: 8,
    disabled: false,
  },
  {
    id: "medicine",
    label: "睡眠導入剤を飲んだ",
    desc: "服薬の良し悪しは判定しません。今後、医療判断に踏み込まない形で扱う予定です。",
    impact: 0,
    disabled: true,
  },
];

export default function SleepPage() {
  const [sleepHours, setSleepHours] = React.useState<number>(7);
  const [subjectiveScore, setSubjectiveScore] = React.useState<number>(70);
  const [selectedChecks, setSelectedChecks] = React.useState<string[]>([]);
  const [aiComment, setAiComment] = React.useState("");
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setSleepHours(parsed.sleepHours ?? 7);
      setSubjectiveScore(parsed.subjectiveScore ?? 70);
      setSelectedChecks(parsed.selectedChecks ?? []);
      setAiComment(parsed.aiComment ?? "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const sleepScore = React.useMemo(() => {
    const timeScore = Math.min((sleepHours / 8) * 60, 60);
    const subjectivePoint = (subjectiveScore / 100) * 40;

    const checkImpact = sleepChecks
      .filter((item) => selectedChecks.includes(item.id))
      .reduce((sum, item) => sum + item.impact, 0);

    return Math.max(
      0,
      Math.min(100, Math.round(timeScore + subjectivePoint + checkImpact))
    );
  }, [sleepHours, subjectiveScore, selectedChecks]);

  const status =
    sleepScore >= 80
      ? {
          label: "回復良好",
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
          comment:
            "睡眠状態は良好です。今日は身体が動きやすい可能性があります。",
        }
      : sleepScore >= 60
        ? {
            label: "普通",
            color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
            comment:
              "最低限の回復はできています。疲労感がある場合は無理しすぎない方が良さそうです。",
          }
        : {
            label: "回復不足",
            color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
            comment:
              "睡眠による回復が弱めです。今日は回復優先を意識した方が良さそうです。",
          };

  const saveDetail = (comment?: string) => {
    const data = {
      sleepHours,
      subjectiveScore,
      selectedChecks,
      sleepScore,
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

  const handleAnalyze = async() => {
    setSavedMessage("")

    const body = {
        domain: "life",
        level: "beginner",
        goal: "health",
        summary: {
            sleep: sleepHours,
            fatigue: 5,
            stress: 5,
            detailType: "sleep",
            coefficientLevel: 6,
            sleepDetail: {
                sleepHours,
                subjectiveScore,
                selectedChecks,
                sleepScore,
            }
        }
    }
    try {
        setAiComment("AIが睡眠状態を分析しています.....")

        const res = await fetch("/api/life/feedback",{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        console.log("res.ok", res.ok);
console.log("data", data);
console.log("feedback", data.feedback);

        if(!res.ok) {
            setAiComment(data.feedback ?? "AI分析に失敗しました。");
            return;
        }

        const feedback = data.feedback ?? "";

        setAiComment(feedback);
        saveDetail(feedback);
        setSavedMessage("睡眠分析を保存しました。");
    } catch(error) {
        console.error(error);
        setAiComment("AI分析の取得に失敗しました。時間をおいて再度お試しください。");
    }
  }

  const handleApplyToLife = () => {
    console.log("反映ボタン押下");
    const data = {
      score: sleepScore,
      sleepHours,
      subjectiveScore,
      selectedChecks,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("fitra_life_sleep_score", JSON.stringify(data));
    saveDetail(aiComment);
    setSavedMessage("Life画面の睡眠評価に反映しました。");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-emerald-400">
              LIFE / SLEEP ANALYZER
            </p>
            <h1 className="mt-3 text-3xl font-black">睡眠AI</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              睡眠時間、寝起き感、気になる項目から睡眠状態を確認します。
              医療判断ではなく、Lifeスコア調整のための参考情報として扱います。
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
              <label className="text-xs text-slate-400">睡眠時間</label>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={sleepHours}
                onChange={(e) => {
                  setSleepHours(Number(e.target.value));
                  setSavedMessage("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg text-white outline-none"
              />
              <p className="mt-2 text-[11px] text-slate-500">例：6.5 / 7 / 8</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">主観メーター</p>
                <p className="text-xl font-black text-emerald-300">
                  {subjectiveScore}
                </p>
              </div>

              <input
                type="range"
                min={0}
                max={100}
                value={subjectiveScore}
                onChange={(e) => {
                  setSubjectiveScore(Number(e.target.value));
                  setSavedMessage("");
                }}
                className="mt-3 w-full accent-emerald-400"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>かなり悪い</span>
                <span>普通</span>
                <span>かなり良い</span>
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
                {sleepChecks.map((item) => (
                  <label
                    key={item.id}
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      item.disabled
                        ? "cursor-not-allowed border-slate-800 bg-slate-900/30 text-slate-600"
                        : selectedChecks.includes(item.id)
                          ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                          : "cursor-pointer border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={item.disabled}
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
              AIに睡眠状態を評価してもらう
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
                  <p className="text-xs">SLEEP SCORE</p>
                  <p className="mt-2 text-sm">{status.label}</p>
                </div>
                <p className="text-6xl font-black">{sleepScore}</p>
              </div>

              <button
                type="button"
                onClick={handleApplyToLife}
                className="cursor-pointer active:translate-y-[1px] active:scale-[0.99] mt-5 w-full rounded-2xl border border-current/30 bg-black/20 px-4 py-3 text-sm font-semibold transition hover:bg-black/30"
              >
                この睡眠スコアをLifeに反映する
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                SCORE DETAIL
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label="睡眠時間" value={`${sleepHours}h`} />
                <DetailRow label="主観メーター" value={`${subjectiveScore}/100`} />
                <DetailRow label="選択項目" value={`${selectedChecks.length}個`} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                TRAINING RELATION
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                高強度トレーニングや夜遅い運動は、寝つきや回復感に影響する場合があります。
                必要に応じて、昨日の運動内容も確認できます。
              </p>
              <LoadingLink
                href="/training"
                theme="training"
                className="mt-4 inline-flex rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300 hover:border-emerald-400"
              >
                Trainingを見る
              </LoadingLink>
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
                  SLEEP FACTORS
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
              {sleepChecks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <p className="font-semibold text-emerald-300">
                    {item.label}
                    {item.disabled && "（現在は未対応）"}
                  </p>
                  <p className="mt-2 text-slate-400">{item.desc}</p>
                </div>
              ))}

              <p className="text-xs text-slate-500">
                ※ この説明は医学的な診断ではありません。睡眠状態を振り返るための補助情報です。
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