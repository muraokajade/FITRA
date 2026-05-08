"use client";

import LoadingLink from "@/components/LoadingLink";
import { useMemo, useState } from "react";

const baseScores = {
  diet: 77,
  training: 83,
  life: 69,
};

const formulaCards = [
  {
    title: "食事スコア",
    formula: "食事量 30点 + たんぱく質 40点 + 栄養バランス 30点",
    example: "例：24 + 32 + 21 = 77点",
    reason:
      "食事は、身体を作る材料です。特にたんぱく質は筋肉の維持・成長に関係するため、配点を高くしています。",
  },
  {
    title: "運動スコア",
    formula: "重量更新 35点 + 運動量 35点 + 継続 30点",
    example: "例：28 + 31 + 24 = 83点",
    reason:
      "運動は、身体に変化を起こす刺激です。重量・回数・セット数・継続状況を見て、成長傾向を評価します。",
  },
  {
    title: "生活スコア",
    formula: "睡眠 40点 + 疲労 30点 + ストレス 30点",
    example: "例：30 + 18 + 21 = 69点",
    reason:
      "生活は、回復状態を表します。睡眠は回復への影響が大きいため、疲労やストレスより少し高い配点にしています。",
  },
];

const coefficientLevels = [
  {
    range: "1 - 4",
    title: "軽め",
    calc: "減点 × 0.45 〜 0.84",
    text: "継続しやすさを優先する設定です。初心者、復帰直後、調子が不安定な時期に向いています。",
  },
  {
    range: "5 - 7",
    title: "標準",
    calc: "減点 × 0.97 〜 1.23",
    text: "FITRAの基本設定です。入力された食事・運動・生活の状態を、標準的な強さで点数に反映します。",
  },
  {
    range: "8 - 10",
    title: "厳しめ",
    calc: "減点 × 1.36 〜 1.62",
    text: "睡眠不足、疲労、食事不足を強く反映する設定です。減量期や本気で管理したい時期に向いています。",
  },
];

function getPenaltyRate(level: number) {
  return Number((0.45 + (level - 1) * 0.13).toFixed(2));
}

function getLevelLabel(level: number) {
  if (level <= 4) return "軽め";
  if (level <= 7) return "標準";
  return "厳しめ";
}

function getLevelColor(level: number) {
  if (level <= 4) {
    return {
      text: "text-emerald-300",
      border: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
      bar: "from-emerald-400 to-cyan-400",
      shadow: "shadow-[0_0_35px_rgba(52,211,153,0.14)]",
    };
  }

  if (level <= 7) {
    return {
      text: "text-blue-300",
      border: "border-blue-400/40",
      bg: "bg-blue-500/10",
      bar: "from-blue-500 to-cyan-400",
      shadow: "shadow-[0_0_35px_rgba(56,189,248,0.14)]",
    };
  }

  return {
    text: "text-red-300",
    border: "border-red-400/40",
    bg: "bg-red-500/10",
    bar: "from-orange-400 to-red-500",
    shadow: "shadow-[0_0_35px_rgba(248,113,113,0.16)]",
  };
}

function getTriangleColor(score: number) {
  if (score >= 80) {
    return {
      stroke: "#4ade80",
      text: "#86efac",
      fill: "rgba(34,197,94,0.12)",
      glow: "rgba(34,197,94,0.32)",
    };
  }

  if (score >= 65) {
    return {
      stroke: "#38bdf8",
      text: "#93c5fd",
      fill: "rgba(56,189,248,0.12)",
      glow: "rgba(56,189,248,0.32)",
    };
  }

  return {
    stroke: "#fb7185",
    text: "#fda4af",
    fill: "rgba(244,63,94,0.12)",
    glow: "rgba(244,63,94,0.32)",
  };
}

export default function ScoreLogicPage() {
  const [level, setLevel] = useState(6);

  const [triangleScores, setTriangleScores] = useState({
    diet: 77,
    training: 83,
    life: 69,
  });

  const calculated = useMemo(() => {
    const average = Math.round(
      (baseScores.diet + baseScores.training + baseScores.life) / 3
    );

    const penaltyBase = 100 - average;
    const penaltyRate = getPenaltyRate(level);
    const adjustedPenalty = Math.round(penaltyBase * penaltyRate);
    const totalScore = Math.max(0, 100 - adjustedPenalty);

    return {
      average,
      penaltyBase,
      penaltyRate,
      adjustedPenalty,
      totalScore,
    };
  }, [level]);

  const triangleTotal = Math.round(
    (triangleScores.diet + triangleScores.training + triangleScores.life) / 3
  );

  const triangleColor = getTriangleColor(triangleTotal);
  const levelColor = getLevelColor(level);

  return (
    <main className="min-h-screen bg-[#05060a] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1 text-[11px] tracking-[0.2em] text-blue-200">
            SCORE LOGIC
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                FITRAスコアの根拠
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                FITRAは、食事・運動・生活を別々に評価するだけではありません。
                3つの状態を同じ土台で見て、今日の身体状態を点数化します。
                このページでは、スコアの考え方・計算式・係数レベルの意味を説明します。
              </p>
            </div>

            <LoadingLink
              href="/"
              theme="home"
              className="w-fit rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/20"
            >
              ← Home
            </LoadingLink>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
          <div className="rounded-2xl border border-blue-500/30 bg-[#0b0f16] p-5 shadow-[0_0_35px_rgba(56,189,248,0.12)]">
            <p className="text-xs tracking-[0.2em] text-blue-200">
              TOTAL SCORE
            </p>

            <div className="mt-4 flex items-center gap-5">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-900">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-500/80 to-cyan-400/60 blur-[3px]" />

                <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#05060a]">
                  <span className="text-4xl font-black text-blue-300">
                    {calculated.totalScore}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <p className="text-slate-300">
                  総合スコアは、食事・運動・生活の平均値をもとに、
                  係数レベルで減点の強さを調整して算出します。
                </p>

                <p className="text-blue-300">
                  現在：係数レベル {level}（{getLevelLabel(level)}）
                </p>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
                    style={{ width: `${calculated.totalScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <SmallScore label="食事" value={baseScores.diet} />
              <SmallScore label="運動" value={baseScores.training} />
              <SmallScore label="生活" value={baseScores.life} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
            <p className="text-xs tracking-[0.2em] text-blue-200">
              BASIC POLICY
            </p>

            <h2 className="mt-3 text-xl font-bold">
              AIが勝手に点数を決めるわけではない
            </h2>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>
                FITRAでは、まず入力された数値をもとにスコアを計算します。
                AIは、その点数になった理由や次に取る行動を説明する役割です。
              </p>

              <p>
                そのため、スコアは完全なブラックボックスではありません。
                「どの項目が良かったのか」「どこで減点されたのか」を確認できる設計にします。
              </p>

              <p className="text-slate-400">
                FITRAのスコアは医療診断ではありません。
                食事・運動・生活を見直すための目安として使用します。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <p className="text-xs tracking-[0.2em] text-blue-200">
            THREE AREAS
          </p>

          <h2 className="mt-3 text-xl font-bold">
            食事・運動・生活は同じ重さで見る
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr,1fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
              <div className="relative h-[310px]">
                <svg className="h-full w-full" viewBox="0 0 500 320">
                  <defs>
                    <filter id="triangleGlow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <polygon
                    points="250,58 105,250 395,250"
                    fill={triangleColor.fill}
                    stroke={triangleColor.stroke}
                    strokeWidth="1.5"
                    filter="url(#triangleGlow)"
                  />

                  <line
                    x1="250"
                    y1="58"
                    x2="250"
                    y2="160"
                    stroke="rgba(148,163,184,0.28)"
                    strokeWidth="1"
                  />

                  <line
                    x1="105"
                    y1="250"
                    x2="250"
                    y2="160"
                    stroke="rgba(148,163,184,0.28)"
                    strokeWidth="1"
                  />

                  <line
                    x1="395"
                    y1="250"
                    x2="250"
                    y2="160"
                    stroke="rgba(148,163,184,0.28)"
                    strokeWidth="1"
                  />

                  <circle
                    cx="250"
                    cy="160"
                    r="70"
                    fill={triangleColor.glow}
                    opacity="0.45"
                  />

                  <circle
                    cx="250"
                    cy="160"
                    r="55"
                    fill="#05060a"
                    stroke={triangleColor.stroke}
                    strokeWidth="1.5"
                  />

                  <text
                    x="250"
                    y="145"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    総合
                  </text>

                  <text
                    x="250"
                    y="180"
                    textAnchor="middle"
                    fill={triangleColor.text}
                    fontSize="34"
                    fontWeight="800"
                  >
                    {triangleTotal}
                  </text>

                  <circle cx="250" cy="58" r="3" fill={triangleColor.stroke} />
                  <circle cx="105" cy="250" r="3" fill={triangleColor.stroke} />
                  <circle cx="395" cy="250" r="3" fill={triangleColor.stroke} />

                  <text
                    x="250"
                    y="36"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    食事
                  </text>
                  <text
                    x="250"
                    y="70"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="26"
                    fontWeight="800"
                  >
                    {triangleScores.diet}
                  </text>

                  <text
                    x="86"
                    y="246"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    運動
                  </text>
                  <text
                    x="86"
                    y="280"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="26"
                    fontWeight="800"
                  >
                    {triangleScores.training}
                  </text>

                  <text
                    x="414"
                    y="246"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    生活
                  </text>
                  <text
                    x="414"
                    y="280"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="26"
                    fontWeight="800"
                  >
                    {triangleScores.life}
                  </text>
                </svg>
              </div>

              <div className="mt-3 rounded-xl border border-slate-800 bg-black/30 p-4">
                <p className="text-xs text-slate-400">
                  数値を動かすと、中央の総合スコアと核の色が変化します。
                </p>

                <div className="mt-4 space-y-4">
                  <TriangleSlider
                    label="食事"
                    value={triangleScores.diet}
                    color="accent-emerald-400"
                    onChange={(value) =>
                      setTriangleScores((prev) => ({
                        ...prev,
                        diet: value,
                      }))
                    }
                  />

                  <TriangleSlider
                    label="運動"
                    value={triangleScores.training}
                    color="accent-blue-400"
                    onChange={(value) =>
                      setTriangleScores((prev) => ({
                        ...prev,
                        training: value,
                      }))
                    }
                  />

                  <TriangleSlider
                    label="生活"
                    value={triangleScores.life}
                    color="accent-violet-400"
                    onChange={(value) =>
                      setTriangleScores((prev) => ({
                        ...prev,
                        life: value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-7 text-slate-300">
              <p>
                食事だけ良くても、睡眠不足や疲労が強ければ身体状態は下がります。
                逆に、生活が整っていても、運動の刺激が少なければ成長の評価は上がりにくくなります。
              </p>

              <p>
                FITRAでは、食事・運動・生活のどれか1つを上位に置くのではなく、
                3つを並行して見ます。その中心にあるものが、今日の総合スコアです。
              </p>

              <p className="text-slate-400">
                この考え方は今後も変えません。
                計算式や配点は調整される可能性がありますが、
                「3つの関係から身体状態を見る」という軸は固定します。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-500/20 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <p className="text-xs tracking-[0.2em] text-blue-200">
            FORMULA
          </p>

          <h2 className="mt-3 text-xl font-bold">
            具体的な計算式
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-400">
            最初の設計では、誰が見ても理解できるように四則演算ベースで計算します。
            複雑な計算を使うよりも、どの入力がスコアに影響したのかを見えるようにするためです。
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {formulaCards.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <p className="text-sm font-semibold text-blue-300">
                  {item.title}
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-100">
                  {item.formula}
                </p>

                <p className="mt-3 rounded-lg border border-slate-800 bg-black/30 px-3 py-2 text-[11px] text-slate-300">
                  {item.example}
                </p>

                <p className="mt-3 text-[11px] leading-6 text-slate-400">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-blue-300">
              総合スコアの基本式
            </p>

            <p className="mt-2">
              総合スコア = 100 - ((100 - 基本平均) × 減点倍率)
            </p>

            <p className="mt-2 text-xs text-slate-400">
              基本平均 = (食事スコア + 運動スコア + 生活スコア) ÷ 3
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.2em] text-blue-200">
                COEFFICIENT LEVEL
              </p>

              <h2 className="mt-3 text-xl font-bold">
                係数レベル 1〜10 の意味
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                係数レベルとは、同じ入力でも
                「どれくらい厳しく点数に反映するか」を調整する設定です。
                数字を上げるほど、睡眠不足・疲労・食事不足などの減点が強くなります。
              </p>
            </div>

            <div className="hidden rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs text-blue-200 md:block">
              マイページ設定予定
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[1fr,1.15fr]">
            <div
              className={`rounded-2xl border p-5 transition-all duration-700 ease-out ${levelColor.border} ${levelColor.bg} ${levelColor.shadow}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs tracking-[0.2em] text-slate-400">
                    現在の設定
                  </p>

                  <p
                    className={`mt-2 text-2xl font-black transition-colors duration-500 ${levelColor.text}`}
                  >
                    {getLevelLabel(level)}
                  </p>
                </div>

                <p
                  className={`text-7xl font-black leading-none transition-all duration-500 ease-out ${levelColor.text}`}
                >
                  {level}
                </p>
              </div>

              <div className="mt-6">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />

                <div className="mt-3 grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }, (_, index) => {
                    const num = index + 1;
                    const active = num <= level;

                    return (
                      <div
                        key={num}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          active
                            ? `bg-gradient-to-r ${levelColor.bar}`
                            : "bg-slate-800"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                  <span>軽め</span>
                  <span>標準</span>
                  <span>厳しめ</span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                {level <= 4 &&
                  "減点を弱めます。初心者、復帰直後、まず継続したい時期に向いています。"}

                {level >= 5 &&
                  level <= 7 &&
                  "FITRAの標準設定です。食事・運動・生活の入力をバランスよく点数に反映します。"}

                {level >= 8 &&
                  "減点を強めます。睡眠不足、疲労、食事不足を厳しく見たい時期に向いています。"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <p className="text-xs tracking-[0.2em] text-blue-200">
                SCORE PREVIEW
              </p>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-slate-800 bg-black/30 px-3 py-4">
                  <p className="text-[11px] text-slate-500">基本平均</p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {calculated.average}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-black/30 px-3 py-4">
                  <p className="text-[11px] text-slate-500">減点倍率</p>
                  <p
                    className={`mt-2 text-3xl font-black transition-colors duration-500 ${levelColor.text}`}
                  >
                    ×{calculated.penaltyRate}
                  </p>
                </div>

                <div
                  className={`rounded-xl border px-3 py-4 transition-all duration-700 ${levelColor.border} ${levelColor.bg}`}
                >
                  <p className="text-[11px] text-slate-300">最終スコア</p>
                  <p
                    className={`mt-2 text-4xl font-black transition-all duration-500 ${levelColor.text}`}
                  >
                    {calculated.totalScore}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-[11px] text-slate-500">
                  <span>0</span>
                  <span>100</span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${levelColor.bar}`}
                    style={{ width: `${calculated.totalScore}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-800 bg-black/30 p-4 text-xs leading-6 text-slate-300">
                <p>
                  計算イメージ：
                  <span className="text-slate-100">
                    {" "}
                    100 - ((100 - 基本平均) × 減点倍率)
                  </span>
                </p>

                <p className="mt-2 text-slate-400">
                  レベルを上げるほど、減点倍率が上がります。
                  そのため、同じ入力でも最終スコアは厳しめに表示されます。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {coefficientLevels.map((item) => (
              <div
                key={item.range}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-blue-300">
                    {item.range}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.title}
                  </p>
                </div>

                <p className="mt-3 rounded-lg border border-slate-800 bg-black/30 px-3 py-2 text-[11px] text-slate-300">
                  {item.calc}
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-[#0b0f16] p-5 shadow-lg shadow-black/40">
          <p className="text-xs tracking-[0.2em] text-blue-200">
            REFERENCES
          </p>

          <h2 className="mt-3 text-xl font-bold">
            参考にする予定の情報
          </h2>

          <div className="mt-4 space-y-3 text-xs leading-6 text-slate-400">
            <p>※ 睡眠と回復の関係：〇〇から引用予定</p>
            <p>※ たんぱく質摂取と筋肉維持の関係：〇〇から引用予定</p>
            <p>
              ※ トレーニング量・強度・漸進性過負荷の考え方：〇〇から引用予定
            </p>
            <p>
              ※ ストレス・疲労とパフォーマンス低下の関係：〇〇から引用予定
            </p>
          </div>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            現時点では仮の参考欄です。今後、論文・公的機関・専門書などを確認し、
            計算式や配点の根拠を更新していきます。
          </p>
        </section>
      </div>
    </main>
  );
}

function SmallScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-blue-300">{value}</p>
    </div>
  );
}

function TriangleSlider({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-[52px,1fr,44px] items-center gap-3">
      <p className="text-xs text-slate-300">{label}</p>

      <input
        type="range"
        min="50"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${color}`}
      />

      <p className="text-right text-lg font-black text-blue-300">
        {value}
      </p>
    </div>
  );
}