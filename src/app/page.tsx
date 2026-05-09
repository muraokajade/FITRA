"use client";

import LoadingLink from "@/components/LoadingLink";

const chips = ["現役プロ格闘家監修", "AI栄養学", "最新スポーツ科学"];

const flowItems = [
  { label: "Diet", text: "食事・栄養・不足傾向", theme: "text-orange-300" },
  { label: "Training", text: "重量・回数・成長傾向", theme: "text-red-300" },
  { label: "Life", text: "睡眠・疲労・ストレス", theme: "text-emerald-300" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[460px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] top-36 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-160px] bottom-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10">
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
            <span className="inline-flex rounded-full border border-blue-500/40 bg-black/40 px-5 py-1 text-[11px] tracking-[0.25em] text-blue-200/80">
              TRAINING / DIET / LIFE
            </span>

            <h1 className="mt-8 text-5xl font-black tracking-tight md:text-7xl">
              <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-blue-600 bg-clip-text text-transparent">
                FITRA
              </span>
            </h1>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                >
                  {chip}
                </span>
              ))}
            </div>

            <h2 className="mt-12 text-3xl font-black leading-tight md:text-5xl">
              今日の身体状態を、
              <br />
              <span className="text-blue-300">3秒で把握する。</span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
              FITRAは、Training・Diet・Life の入力データをまとめて、
              今日の身体状態・回復傾向・改善ポイントを見える化する
              AIフィットネス管理アプリです。
            </p>

            <div className="mt-10 flex flex-col items-center gap-3">
              <LoadingLink
                href="/dashboard"
                theme="home"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-300/40 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-11 py-4 text-sm font-bold shadow-[0_0_35px_rgba(56,189,248,0.65)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(56,189,248,0.95)] md:text-base"
              >
                <span className="absolute inset-y-0 left-[-40%] w-1/3 skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[120%]" />
                <span className="relative flex flex-col items-center leading-tight">
                  <span className="text-[10px] tracking-[0.25em] text-blue-100/80">
                    FITRA AI解析
                  </span>
                  <span className="mt-1 text-lg font-black">
                    今日の身体状態を見る
                  </span>
                </span>
              </LoadingLink>

              <p className="text-[11px] text-slate-400">
                入力データから、身体状態をスコアとコメントで確認できます。
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.1fr,1fr]">
            <div className="rounded-3xl border border-blue-500/20 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
                BODY STATUS FLOW
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                3つの入力が、総合ダッシュボードに集まる
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                FITRAでは、食事・運動・生活を別々に記録します。
                それぞれの結果は個別ページで確認でき、最後に総合ダッシュボードへ反映されます。
              </p>

              <div className="mt-6 grid gap-3">
                {flowItems.map((item) => (
                  <LoadingLink
                    key={item.label}
                    href={`/${item.label.toLowerCase()}`}
                    theme={
                      item.label === "Diet"
                        ? "diet"
                        : item.label === "Training"
                          ? "training"
                          : "life"
                    }
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4 transition hover:border-blue-500/50"
                  >
                    <div>
                      <p className={`text-sm font-black ${item.theme}`}>
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.text}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">入力する</span>
                  </LoadingLink>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
                SCORE IMAGE
              </p>

              <div className="mt-6 flex justify-center">
                <div className="relative h-72 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40">
                  <svg className="h-full w-full" viewBox="0 0 420 280">
                    <polygon
                      points="210,42 70,230 350,230"
                      fill="rgba(56,189,248,0.08)"
                      stroke="rgba(56,189,248,0.55)"
                      strokeWidth="1.5"
                    />
                    <line x1="210" y1="42" x2="210" y2="142" stroke="rgba(148,163,184,0.25)" />
                    <line x1="70" y1="230" x2="210" y2="142" stroke="rgba(148,163,184,0.25)" />
                    <line x1="350" y1="230" x2="210" y2="142" stroke="rgba(148,163,184,0.25)" />

                    <circle cx="210" cy="142" r="55" fill="#05060a" stroke="rgba(56,189,248,0.8)" />
                    <text x="210" y="134" textAnchor="middle" fill="#94a3b8" fontSize="11">総合</text>
                    <text x="210" y="164" textAnchor="middle" fill="#93c5fd" fontSize="30" fontWeight="800">76</text>

                    <text x="210" y="31" textAnchor="middle" fill="#94a3b8" fontSize="11">Diet</text>
                    <text x="210" y="62" textAnchor="middle" fill="#fed7aa" fontSize="23" fontWeight="800">77</text>

                    <text x="55" y="226" textAnchor="middle" fill="#94a3b8" fontSize="11">Training</text>
                    <text x="55" y="256" textAnchor="middle" fill="#fca5a5" fontSize="23" fontWeight="800">83</text>

                    <text x="365" y="226" textAnchor="middle" fill="#94a3b8" fontSize="11">Life</text>
                    <text x="365" y="256" textAnchor="middle" fill="#86efac" fontSize="23" fontWeight="800">69</text>
                  </svg>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-300">
                3つの入力結果をつなげることで、単なる記録ではなく、
                今日の状態をひと目で確認できる形にします。
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl border border-blue-500/20 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
              FITRA SCORE LOGIC
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              スコアの根拠も確認できる
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              FITRAのスコアは、単なるAIの感覚値ではなく、
              睡眠・疲労・ストレス・食事・運動負荷などの入力データをもとに算出します。
              係数や評価基準を確認できるようにし、なぜそのスコアになったのかを説明できる設計を目指しています。
            </p>

            <LoadingLink
              href="/score-logic"
              theme="home"
              className="mt-5 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              FITRAスコアのロジックを見る
            </LoadingLink>
          </div>
        </section>

        <section className="px-6 pb-24 md:pb-32">
          <div className="mx-auto flex max-w-6xl flex-col gap-10">
            <div className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
                AI SECTIONS
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                まずは各セクションで入力する
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                食事・運動・生活の記録から、総合スコアの材料を作ります。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="Diet AI"
                desc="食事内容から栄養バランス・不足傾向・改善ポイントを確認します。"
                href="/diet/dashboard"
                linkLabel="食事を入力する"
                theme="diet"
              />

              <FeatureCard
                title="Training AI"
                desc="種目・重量・回数・セット数から、成長傾向と負荷バランスを確認します。"
                href="/training"
                linkLabel="運動を入力する"
                theme="training"
              />

              <FeatureCard
                title="Life AI"
                desc="睡眠・疲労・ストレスから、回復状態と今日のコンディションを確認します。"
                href="/life"
                linkLabel="生活を入力する"
                theme="life"
              />
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/60 bg-black/20 py-8 text-center text-[11px] text-slate-500">
          © 2026 FITRA
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  href,
  linkLabel,
  theme,
}: {
  title: string;
  desc: string;
  href: string;
  linkLabel: string;
  theme: "training" | "diet" | "life";
}) {
  const themeStyle =
    theme === "diet"
      ? "hover:border-orange-500/70 text-orange-300"
      : theme === "training"
        ? "hover:border-red-500/70 text-red-300"
        : "hover:border-emerald-500/70 text-emerald-300";

  return (
    <LoadingLink
      href={href}
      theme={theme}
      className={`group relative block overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.9)] ${themeStyle}`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500">
        FITRA SECTION
      </p>

      <h3 className="mt-3 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-xs leading-relaxed text-slate-200/90 md:text-sm">
        {desc}
      </p>

      <span className="mt-5 inline-flex text-xs font-medium underline underline-offset-4 decoration-current md:text-sm">
        {linkLabel}
      </span>
    </LoadingLink>
  );
}