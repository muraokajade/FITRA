// src/app/page.tsx

"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      {/* 背景のネオングロー */}
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] h-[420px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-40 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-120px] bottom-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />

      {/* 中身 */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center space-y-8">
            {/* 小さなラベル */}
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-black/40 px-4 py-1 text-[11px] font-medium tracking-[0.2em] text-blue-200/80">
              AI FITNESS ASSISTANT
            </span>

            {/* タイトル */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-blue-600 bg-clip-text text-transparent">
                FITRA
              </span>
            </h1>

            {/* アピールバッジ */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/60 bg-black/60 px-5 py-1.5 text-[11px] text-blue-300 shadow-[0_0_25px_rgba(59,130,246,0.45)]">
              <span>現役プロ格闘家監修</span>
              <span className="text-blue-500/50">•</span>
              <span>AI栄養学</span>
              <span className="text-blue-500/50">•</span>
              <span>最新スポーツ科学</span>
            </div>

            {/* 強めキャッチ */}
            <p className="mt-2 text-2xl md:text-4xl font-bold leading-tight">
              <span className="text-blue-300">「3つのAI」</span> が
              <br className="hidden md:block" /> あなたの身体を最速で仕上げる。
            </p>

            {/* サブコピー */}
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
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-10 py-3 text-sm md:text-base font-semibold shadow-[0_0_30px_rgba(56,189,248,0.55)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(56,189,248,0.8)]"
              >
                無料ではじめる
              </Link>
              <p className="text-[11px] text-slate-400">
                まずは食事・トレーニング・生活の3つを入力して、今日のコンディションを診断。
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
                link="/diet"
                linkLabel="食事を解析する →"
              />
              <FeatureCard
                title="🏋️ トレーニングAI"
                desc="種目・重量・レップを入力すると、負荷評価・改善点・次回の最適メニューをAIが生成。"
                link="/training"
                linkLabel="運動を解析する →"
              />
              <FeatureCard
                title="🌙 生活AI"
                desc="睡眠・疲労・ストレスから、今日のコンディションと「やるべきこと / 休むべき日」を提案。"
                link="/life"
                linkLabel="生活を解析する →"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
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
  link,
  linkLabel,
}: {
  title: string;
  desc: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 transition-transform hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
      {/* カードのネオン下線 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <h3 className="text-lg font-semibold text-blue-300">{title}</h3>
      <p className="mt-2 text-xs md:text-sm text-slate-200/90 leading-relaxed">
        {desc}
      </p>
      <Link
        href={link}
        className="mt-4 inline-flex text-xs md:text-sm font-medium text-blue-300 underline underline-offset-4 decoration-blue-400/70 hover:text-blue-200"
      >
        {linkLabel}
      </Link>
    </div>
  );
}
