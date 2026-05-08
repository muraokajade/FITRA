"use client";

import LoadingLink from "@/components/LoadingLink";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* 背景グロー */}
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] h-[420px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-40 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-120px] bottom-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative z-10">
        {/* Hero */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-black/40 px-4 py-1 text-[11px] font-medium tracking-[0.2em] text-blue-200/80">
              TRAINING / DIET / LIFE
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-blue-600 bg-clip-text text-transparent">
                FITRA
              </span>
            </h1>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/60 bg-black/60 px-5 py-1.5 text-[11px] text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.45)]">
              <span>現役プロ格闘家監修</span>
              <span className="text-blue-500/50">•</span>
              <span>AI栄養学</span>
              <span className="text-blue-500/50">•</span>
              <span>最新スポーツ科学</span>
            </div>

            <p className="mt-2 text-2xl md:text-4xl font-bold leading-tight">
              今日の身体状態を、
              <br className="hidden md:block" />
              <span className="text-blue-300">3秒で把握する。</span>
            </p>

            <p className="max-w-2xl text-sm md:text-base text-slate-200/90 leading-relaxed">
              Training・Diet・Life の入力データを統合し、身体状態・回復傾向・改善ポイントを可視化するAIフィットネスアシスタントです。
            </p>

            <div className="mt-4 flex flex-col items-center gap-3">
              <LoadingLink
                href="/dashboard"
                theme="home"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-300/40 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-10 py-4 text-sm md:text-base font-bold shadow-[0_0_35px_rgba(56,189,248,0.65)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(56,189,248,0.95)]"
              >
                <span className="absolute inset-y-0 left-[-40%] w-1/3 skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[120%]" />
                <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex flex-col items-center leading-tight">
                  <span className="text-[10px] tracking-[0.25em] text-blue-100/80">
                    FITRA AI解析
                  </span>
                  <span className="mt-1 text-lg font-black">
                    今日の身体状態を見る
                  </span>
                </div>
              </LoadingLink>

              <p className="text-[11px] text-slate-400">
                入力データから、身体状態をスコアとコメントで確認できます。
              </p>
            </div>
          </div>
        </section>

        {/* Score Logic */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/20 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
              FITRA SCORE LOGIC
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              FITRAスコアの考え方
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              FITRAのスコアは、単なるAIの感覚値ではなく、睡眠・疲労・ストレス・食事・運動負荷などの入力データをもとに算出します。
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

        {/* Features */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                3つのAIセクション
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                各セクションの入力結果は、統合ダッシュボードへ反映されます。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="Diet AI"
                desc="食事内容から栄養バランス・不足傾向・改善ポイントを解析します。"
                href="/diet"
                linkLabel="食事を解析する"
                theme="diet"
              />

              <FeatureCard
                title="Training AI"
                desc="種目・重量・回数・セット数から、成長傾向と負荷バランスを確認します。"
                href="/training"
                linkLabel="運動を解析する"
                theme="training"
              />

              <FeatureCard
                title="Life AI"
                desc="睡眠・疲労・ストレスから、回復状態と今日のコンディションを確認します。"
                href="/life"
                linkLabel="生活状態を解析する"
                theme="life"
              />
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/60 bg-black/20 py-8 text-center text-[11px] text-slate-500">
          Supervised by an active professional fighter. <br />© 2026 FITRA
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
        FITRA MODULE
      </p>

      <h3 className="mt-3 text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-xs md:text-sm text-slate-200/90 leading-relaxed">
        {desc}
      </p>

      <span className="mt-5 inline-flex text-xs md:text-sm font-medium underline underline-offset-4 decoration-current">
        {linkLabel}
      </span>
    </LoadingLink>
  );
}