// src/app/life/stress/page.tsx
"use client";

import * as React from "react";
import LoadingLink from "@/components/LoadingLink";

const STORAGE_KEY = "fitra_life_stress_detail";
const LIFE_SCORE_KEY = "fitra_life_stress_score";

type StressType =
  | "work"
  | "relationship"
  | "life_environment"
  | "physical_health"
  | "emotional_cognitive"
  | "future_money"
  | "digital_information"
  | "life_event";

type StressItem = {
  id: string;
  category: StressType;
  label: string;
};

const stressCategories: {
  key: StressType;
  label: string;
  weight: number;
  desc: string;
}[] = [
  {
    key: "work",
    label: "仕事・学業",
    weight: 0.15,
    desc: "仕事量、納期、責任、評価、裁量の少なさなど。",
  },
  {
    key: "relationship",
    label: "人間関係",
    weight: 0.15,
    desc: "職場、家族、恋愛、友人、SNS、孤独感など。",
  },
  {
    key: "life_environment",
    label: "生活・環境",
    weight: 0.12,
    desc: "睡眠、家事、金銭、住環境、騒音、生活リズムなど。",
  },
  {
    key: "physical_health",
    label: "身体・健康",
    weight: 0.15,
    desc: "疲労、痛み、不調、運動不足、食生活の乱れなど。",
  },
  {
    key: "emotional_cognitive",
    label: "感情・思考",
    weight: 0.18,
    desc: "不安、焦り、怒り、自己否定、考えすぎなど。",
  },
  {
    key: "future_money",
    label: "将来・経済",
    weight: 0.1,
    desc: "収入、キャリア、生活費、将来不安、目標未達など。",
  },
  {
    key: "digital_information",
    label: "情報・デジタル",
    weight: 0.07,
    desc: "SNS、通知、比較、ニュース疲れ、情報過多など。",
  },
  {
    key: "life_event",
    label: "ライフイベント",
    weight: 0.08,
    desc: "転職、引っ越し、家族の変化、病気、死別、大きな環境変化など。",
  },
];

const stressItems: StressItem[] = [
  { id: "work_amount", category: "work", label: "仕事量・学習量が多い" },
  { id: "deadline", category: "work", label: "納期や課題に追われている" },
  { id: "pressure", category: "work", label: "評価や責任のプレッシャーがある" },
  { id: "low_control", category: "work", label: "自分で決められないことが多い" },

  { id: "work_relation", category: "relationship", label: "職場や学校の人間関係が重い" },
  { id: "family_relation", category: "relationship", label: "家族・パートナーとの関係が気になる" },
  { id: "lonely", category: "relationship", label: "孤独感がある" },
  { id: "messages", category: "relationship", label: "連絡や返信が負担になっている" },

  { id: "sleep_bad", category: "life_environment", label: "寝つき・睡眠リズムが悪い" },
  { id: "room_messy", category: "life_environment", label: "部屋・家事・予定が溜まっている" },
  { id: "commute", category: "life_environment", label: "移動・通勤・外出が負担" },
  { id: "no_rest_time", category: "life_environment", label: "休む時間がない" },

  { id: "body_tired", category: "physical_health", label: "身体の疲労感が強い" },
  { id: "pain", category: "physical_health", label: "肩こり・腰痛・頭痛などがある" },
  { id: "gut", category: "physical_health", label: "胃腸や食欲の乱れがある" },
  { id: "pc_eye", category: "physical_health", label: "目・頭・PC疲れがある" },

  { id: "anxiety", category: "emotional_cognitive", label: "不安や焦りが強い" },
  { id: "irritated", category: "emotional_cognitive", label: "イライラしやすい" },
  { id: "self_blame", category: "emotional_cognitive", label: "自分を責めやすい" },
  { id: "overthinking", category: "emotional_cognitive", label: "考えごとが止まらない" },

  { id: "money", category: "future_money", label: "お金・生活費が不安" },
  { id: "career", category: "future_money", label: "キャリアや将来が不安" },
  { id: "goal_gap", category: "future_money", label: "目標に届いていない焦りがある" },

  { id: "sns_compare", category: "digital_information", label: "SNSで比較して疲れる" },
  { id: "notification", category: "digital_information", label: "通知や情報量が多い" },
  { id: "news", category: "digital_information", label: "ニュースや情報で不安になる" },

  { id: "moving", category: "life_event", label: "引っ越し・転職・環境変化がある" },
  { id: "family_event", category: "life_event", label: "家族や身近な人の大きな変化がある" },
  { id: "big_failure", category: "life_event", label: "大きな失敗・喪失・変化を引きずっている" },
];

export default function StressPage() {
  const [dailyStress, setDailyStress] = React.useState<number>(0);
  const [selectedChecks, setSelectedChecks] = React.useState<string[]>([]);
  const [memo, setMemo] = React.useState("");
  const [savedMessage, setSavedMessage] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setDailyStress(parsed.dailyStress ?? 0);
      setSelectedChecks(parsed.selectedChecks ?? []);
      setMemo(parsed.memo ?? "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const categoryScores = React.useMemo(() => {
    const result = stressCategories.reduce(
      (acc, category) => {
        const items = stressItems.filter((item) => item.category === category.key);
        const selectedCount = items.filter((item) =>
          selectedChecks.includes(item.id)
        ).length;

        // MVP: 1カテゴリ内でチェックが増えるほど高くなる。最大100。
        acc[category.key] = Math.min(100, selectedCount * 25);
        return acc;
      },
      {} as Record<StressType, number>
    );

    return result;
  }, [selectedChecks]);

  const weeklyStressScore = React.useMemo(() => {
    const weighted = stressCategories.reduce((sum, category) => {
      return sum + categoryScores[category.key] * category.weight;
    }, 0);

    return Math.round(weighted);
  }, [categoryScores]);

  const stressScore = React.useMemo(() => {
    // チェックがある場合は、1〜2週間単位のチェック結果を優先。
    // チェックがない場合は、Lifeの日次ストレス入力と同じく dailyStress を使う。
    if (selectedChecks.length > 0) {
      return weeklyStressScore;
    }

    return dailyStress * 10;
  }, [dailyStress, selectedChecks.length, weeklyStressScore]);

  const status =
    stressScore >= 80
      ? {
          label: "危険域",
          color: "border-rose-500/30 bg-rose-500/10 text-rose-300",
          comment:
            "ストレス負荷がかなり高い状態です。無理に処理しきろうとせず、休息・相談・負荷の整理を優先する段階です。",
        }
      : stressScore >= 60
        ? {
            label: "高ストレス",
            color: "border-orange-500/30 bg-orange-500/10 text-orange-300",
            comment:
              "ストレス負荷が高めです。何が一番重いのかを分けて確認する段階です。",
          }
        : stressScore >= 40
          ? {
              label: "中程度ストレス",
              color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
              comment:
                "複数の小さな負荷が積み重なっている可能性があります。まずは一番強い要因を確認します。",
            }
          : stressScore >= 20
            ? {
                label: "軽度ストレス",
                color: "border-blue-500/30 bg-blue-500/10 text-blue-300",
                comment:
                  "軽いストレス反応があります。日次では大きく崩れていませんが、週単位での変化を見ます。",
              }
            : {
                label: "安定",
                color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                comment:
                  "現在のストレス負荷は比較的安定しています。急なイベントがないかだけ確認します。",
              };

  const mainCategories = React.useMemo(() => {
    return stressCategories
      .map((category) => ({
        ...category,
        score: categoryScores[category.key],
      }))
      .sort((a, b) => b.score - a.score)
      .filter((category) => category.score > 0)
      .slice(0, 3);
  }, [categoryScores]);

  const toggleCheck = (id: string) => {
    setSelectedChecks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setSavedMessage("");
  };

  const saveDetail = () => {
    const data = {
      dailyStress,
      selectedChecks,
      memo,
      stressScore,
      categoryScores,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedMessage("ストレスチェックを保存しました。");
  };

  const handleApplyToLife = () => {
    const data = {
      score: stressScore,
      dailyStress,
      selectedChecks,
      categoryScores,
      memo,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LIFE_SCORE_KEY, JSON.stringify(data));
    saveDetail();
    setSavedMessage("Life画面のストレス評価に反映しました。");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl md:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs tracking-[0.25em] text-emerald-400">
              LIFE / STRESS CHECK
            </p>

            <h1 className="mt-3 text-3xl font-black">ストレスチェック</h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              ストレスは毎日の1回入力だけでは判断しにくいため、
              Life画面では日次入力を優先し、このページでは1〜2週間単位の原因チェックを扱います。
            </p>

            <p className="mt-2 text-xs text-slate-500">
              ※ 医療診断ではありません。ストレス傾向と生活スコア調整の参考として扱います。
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

        <section className="grid gap-5 lg:grid-cols-[1fr,360px]">
          <div className="space-y-5 rounded-3xl border border-slate-800 bg-black/20 p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">今日のストレス度</p>
                <p className="text-xl font-black text-emerald-300">
                  {dailyStress}/10
                </p>
              </div>

              <input
                type="range"
                min={0}
                max={10}
                value={dailyStress}
                onChange={(e) => {
                  setDailyStress(Number(e.target.value));
                  setSavedMessage("");
                }}
                className="mt-3 w-full accent-emerald-400"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>低い</span>
                <span>普通</span>
                <span>高い</span>
              </div>

              <p className="mt-3 text-xs leading-6 text-slate-500">
                毎日の生活スコアでは、この日次ストレスを優先します。
                下のチェックは週単位の振り返りで使います。
              </p>
            </div>

            <div>
              <p className="text-xs tracking-[0.2em] text-emerald-300">
                週次チェック
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                この1〜2週間で当てはまるものを選択
              </h2>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                チェックがある場合は、日次入力よりもこちらの傾向を優先してストレススコアを計算します。
              </p>

              <div className="mt-5 space-y-6">
                {stressCategories.map((category) => {
                  const items = stressItems.filter(
                    (item) => item.category === category.key
                  );

                  return (
                    <div
                      key={category.key}
                      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {category.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {category.desc}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-emerald-300">
                          {categoryScores[category.key]}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {items.map((item) => (
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
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400">メモ（任意）</p>

              <textarea
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value);
                  setSavedMessage("");
                }}
                placeholder="例：今週は仕事量が多く、寝る前も考えごとが止まらなかった"
                className="mt-2 h-28 w-full rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={saveDetail}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              ストレスチェックを保存する
            </button>
          </div>

          <div className="space-y-5">
            <div className={`rounded-3xl border p-6 ${status.color}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs">STRESS SCORE</p>
                  <p className="mt-2 text-sm">{status.label}</p>
                </div>

                <p className="text-6xl font-black">{stressScore}</p>
              </div>

              <p className="mt-4 text-sm leading-7 opacity-90">
                {status.comment}
              </p>

              <p className="mt-3 text-xs opacity-80">
                高いほどストレス負荷が強いスコアです。
              </p>

              <button
                type="button"
                onClick={handleApplyToLife}
                className="cursor-pointer active:translate-y-[1px] active:scale-[0.99] mt-5 w-full rounded-2xl border border-current/30 bg-black/20 px-4 py-3 text-sm font-semibold transition hover:bg-black/30"
              >
                このストレススコアをLifeに反映する
              </button>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                MAIN FACTORS
              </p>

              {mainCategories.length === 0 ? (
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  まだ週次チェックはありません。毎日のストレス度を中心に扱います。
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {mainCategories.map((category) => (
                    <div
                      key={category.key}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-200">
                          {category.label}
                        </p>
                        <p className="text-sm font-bold text-emerald-300">
                          {category.score}
                        </p>
                      </div>

                      <div className="mt-3 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-emerald-400"
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-black/20 p-6">
              <p className="text-xs tracking-[0.25em] text-emerald-300">
                REFERENCES
              </p>

              <div className="mt-4 space-y-3 text-xs leading-6 text-slate-400">
                <p>
                  PSS：主観的ストレス、特に予測不能感・制御不能感・過負荷感を扱う代表的尺度。
                </p>
                <p>
                  Holmes-Rahe：生活上の大きな変化を点数化するライフイベント型ストレス尺度。
                </p>
                <p>
                  Daily Hassles：日々の小さなストレス要因を扱う考え方。
                </p>
                <p>
                  NIOSH：仕事量、役割、職場環境、人間関係などの職業性ストレス要因。
                </p>
                <p>
                  Maslach Burnout Inventory：バーンアウトの代表的評価尺度。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}