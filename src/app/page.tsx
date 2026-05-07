"use client";

import LoadingLink from "@/components/LoadingLink";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* 背景のネオングロー */}
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] h-[420px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-40 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-120px] bottom-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-black/40 px-4 py-1 text-[11px] font-medium tracking-[0.2em] text-blue-200/80">
              AI FITNESS ASSISTANT
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
              <span className="text-blue-300">「3つのAI」</span> が
              <br className="hidden md:block" />
              あなたの身体を最速で仕上げる。
            </p>

            <p className="max-w-2xl text-sm md:text-base text-slate-200/90 leading-relaxed">
              食事・トレーニング・生活習慣をまとめて解析。
              プロ格闘家の理論とAIが融合した、
              <span className="text-blue-200">
                {" "}
                次世代フィットネスアシスタント
              </span>
              。
            </p>

            {/* CTA */}
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
                    FUTURE BODY SCANNER
                  </span>
                  <span className="mt-1 text-lg font-black">
                    3つのAIで身体をスキャン
                  </span>
                </div>
              </LoadingLink>

              <p className="text-[11px] text-slate-400">
                Training / Diet / Life を統合し、今日のコンディションを可視化。
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 pb-24 md:pb-32">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
                FITRA が選ばれる理由
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                3つのAIが、それぞれの側面からあなたのコンディションを解析します。
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="🥗 食事AI"
                desc="食べたものをそのまま貼るだけ。PFCバランス・改善点・次のおすすめ食材を一瞬で解析。"
                href="/diet"
                linkLabel="食事を解析する →"
                theme="diet"
              />
              <FeatureCard
                title="🏋️ トレーニングAI"
                desc="種目・重量・レップを入力すると、負荷評価・改善点・次回の最適メニューをAIが生成。"
                href="/training"
                linkLabel="運動を解析する →"
                theme="training"
              />
              <FeatureCard
                title="🌙 生活AI"
                desc="睡眠・疲労・ストレスから、今日のコンディションと「やるべきこと / 休むべき日」を提案。"
                href="/life"
                linkLabel="生活を解析する →"
                theme="life"
              />
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/60 bg-black/20 py-8 text-center text-[11px] text-slate-500">
          Supervised by an active professional fighter. <br />© 2025 FITRA
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
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <h3 className="text-lg font-semibold text-blue-300">{title}</h3>

      <p className="mt-2 text-xs md:text-sm text-slate-200/90 leading-relaxed">
        {desc}
      </p>

      {/* カード全体ではなく、リンク部分だけにLoadingLinkを使う */}
      <LoadingLink
        href={href}
        theme={theme}
        className="mt-4 inline-flex text-xs md:text-sm font-medium text-blue-300 underline underline-offset-4 decoration-blue-400/70 hover:text-blue-200"
      >
        {linkLabel}
      </LoadingLink>
    </div>
  );
}