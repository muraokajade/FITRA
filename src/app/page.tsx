"use client";

import LoadingLink from "@/components/LoadingLink";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const sectionLinks = [
  {
    label: "Diet",
    title: "食事を記録する",
    desc: "食事内容・栄養バランス・不足傾向を分析します。",
    href: "/diet/dashboard",
    theme: "diet" as const,
    accent: "text-orange-300",
    border: "border-orange-400/30",
    bg: "bg-orange-500/10",
  },
  {
    label: "Training",
    title: "成長を確認する",
    desc: "重量・回数・セット数からトレーニング成長を可視化します。",
    href: "/training",
    theme: "training" as const,
    accent: "text-red-300",
    border: "border-red-400/30",
    bg: "bg-red-500/10",
  },
  {
    label: "Life",
    title: "回復状態を見る",
    desc: "睡眠・疲労・ストレスからコンディションを評価します。",
    href: "/life",
    theme: "life" as const,
    accent: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-500/10",
  },
];

const GITHUB_URL = "https://github.com/muraokajade/FITRA";
const README_URL = "https://github.com/muraokajade/FITRA#readme";

const clearDietTempStorage = () => {
  if (typeof window === "undefined") return;

  const exactKeys = [
    "foodItems",
    "foodItem",
    "input",
    "images",
    "feedback",
    "pendingMeal",
    "tempMeals",
    "viewingMealId",
    "resultMode",
  ];

  exactKeys.forEach((key) => localStorage.removeItem(key));

  const keywords = [
    "diet",
    "meal",
    "food",
    "pending",
    "temp",
    "result",
    "feedback",
    "image",
  ];

  Object.keys(localStorage).forEach((key) => {
    const lowerKey = key.toLowerCase();

    if (keywords.some((keyword) => lowerKey.includes(keyword))) {
      localStorage.removeItem(key);
    }
  });
};

function getTriangleColor(score: number) {
  if (score >= 80) {
    return {
      stroke: "#4ade80",
      text: "#86efac",
      fill: "rgba(34,197,94,0.13)",
      glow: "rgba(34,197,94,0.34)",
      border: "border-emerald-400/30",
      bg: "bg-emerald-500/10",
      bar: "from-emerald-400 via-cyan-300 to-blue-400",
      label: "良好",
    };
  }

  if (score >= 65) {
    return {
      stroke: "#38bdf8",
      text: "#93c5fd",
      fill: "rgba(56,189,248,0.13)",
      glow: "rgba(56,189,248,0.34)",
      border: "border-cyan-400/30",
      bg: "bg-cyan-500/10",
      bar: "from-blue-500 via-cyan-400 to-sky-300",
      label: "標準",
    };
  }

  return {
    stroke: "#fb7185",
    text: "#fda4af",
    fill: "rgba(244,63,94,0.13)",
    glow: "rgba(244,63,94,0.34)",
    border: "border-rose-400/30",
    bg: "bg-rose-500/10",
    bar: "from-rose-500 via-orange-400 to-red-400",
    label: "要調整",
  };
}

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    clearDietTempStorage();
    await logout();
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03050b] text-white">
      <HomeEffects />

      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <HomeLogo />

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LoadingLink
                  href="/dashboard"
                  theme="home"
                  className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.12)] transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
                >
                  Dashboard
                </LoadingLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <LoadingLink
                  href="/login"
                  theme="home"
                  className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
                >
                  ログイン
                </LoadingLink>

                <LoadingLink
                  href="/register"
                  theme="home"
                  className="hidden rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20 sm:inline-flex"
                >
                  新規登録
                </LoadingLink>
              </>
            )}
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl items-stretch gap-12 px-5 pb-20 pt-14 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pb-24 md:pt-20">
          <div className="flex h-full min-h-[620px] flex-col justify-center">
            <div className="inline-flex w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-[10px] font-bold tracking-[0.28em] text-blue-200">
              DIET / TRAINING / LIFE
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
              今日の身体を、
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-600 bg-clip-text text-transparent">
                3軸で掴む。
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-8 text-slate-300 md:text-base">
              FITRAは、食事・運動・生活を別々に見るだけではありません。
              3つの状態を同じ土台で並行評価し、今日の身体状態を総合スコアとして可視化します。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/90 px-6 py-3 text-sm font-black text-white shadow-[0_0_24px_rgba(15,23,42,0.55)] transition hover:border-cyan-300/60 hover:bg-slate-800"
              >
                <GitHubIcon className="h-5 w-5" />
                GitHub
              </Link>

              <Link
                href={README_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-6 py-3 text-sm font-black text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)] transition hover:bg-cyan-500/20"
              >
                READMEを見る
              </Link>

              <LoadingLink
                href="/score-logic"
                theme="home"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-400/40 bg-blue-500/10 px-6 py-3 text-sm font-black text-blue-100 transition hover:bg-blue-500/20"
              >
                スコア根拠
              </LoadingLink>
            </div>

            <div className="mt-10">
              <LoadingLink
                href={user ? "/dashboard" : "/login"}
                theme="home"
                className="group relative inline-flex min-h-20 w-full max-w-[430px] items-center justify-center overflow-hidden rounded-full border border-cyan-200/60 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 px-12 py-6 text-lg font-black text-white shadow-[0_0_70px_rgba(34,211,238,0.46)] transition duration-300 hover:scale-[1.04] hover:shadow-[0_0_90px_rgba(34,211,238,0.62)]"
              >
                <span className="absolute inset-0 rounded-full bg-cyan-300/20 blur-xl animate-pulse" />
                <span className="absolute inset-y-0 left-[-45%] w-1/3 skew-x-[-20deg] bg-white/35 transition-all duration-700 group-hover:left-[120%]" />
                <span className="relative flex items-center gap-3">
                  {user ? "Dashboardを開く" : "ログインして始める"}
                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </LoadingLink>
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-500">
              未登録でもこのページは閲覧できます。記録・分析・Dashboard利用にはログインが必要です。
            </p>
          </div>

          <HomeBalanceVisual />
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="rounded-[2rem] border border-blue-400/20 bg-[#070b13]/80 p-6 shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-blue-300">
                  ANALYTICS DASHBOARD
                </p>

                <h2 className="mt-3 text-2xl font-black md:text-4xl">
                  記録データを、分析画面で確認
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  総合スコアだけでなく、推移・領域別スコア・改善優先を同じ画面で確認できます。
                </p>
              </div>

              <LoadingLink
                href={user ? "/dashboard" : "/login"}
                theme="home"
                className="w-fit rounded-full border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-xs font-bold text-blue-100 transition hover:bg-blue-500/20"
              >
                {user ? "Dashboardを見る" : "ログインしてDashboardを見る"}
              </LoadingLink>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <DashboardMock />
              <AnalysisModules />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="rounded-[2rem] border border-blue-400/20 bg-[#070b13]/80 p-6 shadow-[0_0_60px_rgba(59,130,246,0.1)] md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-blue-300">
                  BALANCE CONCEPT
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  3つを並行で見て、
                  <br />
                  身体状態を判断する。
                </h2>

                <div className="mt-5 space-y-4 text-sm leading-8 text-slate-300">
                  <p>
                    食事だけ良くても、睡眠不足や疲労が強ければ身体状態は下がります。
                    逆に、生活が整っていても、運動の刺激が少なければ成長の評価は上がりにくくなります。
                  </p>

                  <p>
                    FITRAでは、Diet・Training・Life のどれか1つを上位に置くのではなく、
                    3つを同じ土台で見ます。その中心にあるものが、今日の総合スコアです。
                  </p>
                </div>

                <LoadingLink
                  href="/score-logic"
                  theme="home"
                  className="mt-7 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-6 py-3 text-xs font-bold text-blue-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
                >
                  FITRAスコアのロジックを見る
                </LoadingLink>
              </div>

              <div className="grid gap-4">
                {sectionLinks.map((section) => (
                  <LoadingLink
                    key={section.label}
                    href={section.href}
                    theme={section.theme}
                    className={`group relative overflow-hidden rounded-[1.5rem] border ${section.border} ${section.bg} p-5 transition hover:-translate-y-1 hover:bg-white/[0.08]`}
                  >
                    <div className="absolute right-[-50px] top-[-50px] h-36 w-36 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />

                    <div className="relative flex items-center justify-between gap-5">
                      <div>
                        <p className={`text-xs font-black ${section.accent}`}>
                          {section.label}
                        </p>

                        <h3 className="mt-2 text-xl font-black text-white">
                          {section.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {section.desc}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 text-xs font-bold ${section.accent}`}
                      >
                        開く
                      </span>
                    </div>
                  </LoadingLink>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-28 md:px-8">
          <div className="rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#07111f,#04060b)] p-8 text-center shadow-[0_0_70px_rgba(34,211,238,0.12)] md:p-12">
            <p className="text-[11px] font-bold tracking-[0.3em] text-cyan-300">
              START TODAY
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              まずは、今日の状態を記録する。
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-300">
              完璧な記録よりも、継続して状態を把握することを重視します。
              小さな入力を積み上げて、自分の身体の傾向を見える化します。
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LoadingLink
                href={user ? "/dashboard" : "/login"}
                theme="home"
                className="rounded-full border border-cyan-300/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 px-9 py-4 text-sm font-black text-white shadow-[0_0_38px_rgba(34,211,238,0.32)] transition hover:scale-[1.02]"
              >
                {user ? "Dashboardを開く" : "ログインして始める"}
              </LoadingLink>

              {!user && (
                <LoadingLink
                  href="/register"
                  theme="home"
                  className="rounded-full border border-blue-400/30 bg-blue-500/10 px-9 py-4 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                >
                  新規登録する
                </LoadingLink>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/70 bg-black/30 px-5 py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black tracking-[0.22em] text-blue-200">
                FITRA
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                AI Fitness Management App / Diet・Training・Life を3軸で分析するポートフォリオ
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <LoadingLink
                href="/score-logic"
                theme="home"
                className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-blue-100 transition hover:bg-blue-500/20"
              >
                Score Logic
              </LoadingLink>

              <LoadingLink
                href="/dashboard"
                theme="home"
                className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Dashboard
              </LoadingLink>

              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-200 transition hover:bg-slate-800"
              >
                GitHub / README
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-7xl border-t border-slate-800/60 pt-5 text-[11px] text-slate-600">
            © 2026 FITRA. Built with Next.js, TypeScript, Prisma, Firebase Auth, Neon, OpenAI API.
          </div>
        </footer>

        <ReadmeNotice />
      </div>
    </main>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.99c.85 0 1.71.12 2.51.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function HomeLogo() {
  return (
    <Link href="/" className="group relative inline-flex items-center gap-3">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.25)] transition group-hover:border-cyan-300/60 group-hover:bg-cyan-400/10">
        <span className="absolute inset-1 rounded-xl bg-gradient-to-br from-blue-500/30 via-cyan-400/20 to-transparent blur-sm" />
        <span className="relative text-sm font-black text-blue-200">F</span>
      </span>

      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-500 bg-clip-text text-xl font-black tracking-[0.22em] text-transparent">
          FITRA
        </span>
        <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.28em] text-slate-500 sm:block">
          AI FITNESS SYSTEM
        </span>
      </span>
    </Link>
  );
}

function HomeEffects() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-[-260px] h-[520px] bg-gradient-to-b from-blue-500/30 via-cyan-500/8 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] top-36 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-180px] bottom-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
    </>
  );
}

function HomeBalanceVisual() {
  const [scores, setScores] = useState({
    diet: 77,
    training: 83,
    life: 69,
  });

  const totalScore = useMemo(() => {
    return Math.round((scores.diet + scores.training + scores.life) / 3);
  }, [scores]);

  const color = getTriangleColor(totalScore);

  return (
    <div
      className={`relative flex h-full rounded-[2rem] border ${color.border} bg-[#060b14]/95 p-4 shadow-[0_0_80px_rgba(59,130,246,0.14)] transition-colors duration-500`}
    >
      <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex h-full w-full flex-col rounded-[1.5rem] border border-slate-800 bg-[#050814] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300">
              BALANCE ANALYTICS
            </p>

            <h2 className="mt-2 text-2xl font-black">3軸バランス分析</h2>

            <p className="mt-2 text-xs leading-6 text-slate-500">
              バーを動かすと、総合スコア・三角形・色彩が連動します。
            </p>
          </div>

          <div
            className={`shrink-0 rounded-full border ${color.border} ${color.bg} px-4 py-2 text-xs font-bold ${color.text}`}
          >
            {color.label}
          </div>
        </div>

        <div className="mt-6 grid flex-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
            <TriangleScoreGraphic
              diet={scores.diet}
              training={scores.training}
              life={scores.life}
              total={totalScore}
              color={color}
            />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-black/30 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.22em] text-slate-500">
                  TOTAL SCORE
                </p>
                <p className={`mt-2 text-6xl font-black ${color.text}`}>
                  {totalScore}
                </p>
              </div>

              <p className="pb-2 text-right text-xs leading-6 text-slate-400">
                3領域の平均から
                <br />
                今日の身体状態を算出
              </p>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-500`}
                style={{ width: `${totalScore}%` }}
              />
            </div>

            <div className="mt-6 space-y-5">
              <BalanceSlider
                label="Diet"
                jpLabel="食事"
                value={scores.diet}
                color="accent-emerald-400"
                onChange={(value) =>
                  setScores((prev) => ({ ...prev, diet: value }))
                }
              />

              <BalanceSlider
                label="Training"
                jpLabel="運動"
                value={scores.training}
                color="accent-blue-400"
                onChange={(value) =>
                  setScores((prev) => ({ ...prev, training: value }))
                }
              />

              <BalanceSlider
                label="Life"
                jpLabel="生活"
                value={scores.life}
                color="accent-violet-400"
                onChange={(value) =>
                  setScores((prev) => ({ ...prev, life: value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-sm leading-7 text-slate-300">
            FITRAは、Diet・Training・Life を並行で見ます。
            どれか1つの点数だけで判断せず、3つの関係から今日の身体状態を評価します。
          </p>
        </div>
      </div>
    </div>
  );
}

function TriangleScoreGraphic({
  diet,
  training,
  life,
  total,
  color,
}: {
  diet: number;
  training: number;
  life: number;
  total: number;
  color: ReturnType<typeof getTriangleColor>;
}) {
  return (
    <div className="relative h-[330px]">
      <svg className="h-full w-full" viewBox="0 0 500 330">
        <defs>
          <filter id="homeTriangleGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon
          points="250,58 105,260 395,260"
          fill={color.fill}
          stroke={color.stroke}
          strokeWidth="1.7"
          filter="url(#homeTriangleGlow)"
        />

        <line x1="250" y1="58" x2="250" y2="170" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
        <line x1="105" y1="260" x2="250" y2="170" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
        <line x1="395" y1="260" x2="250" y2="170" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />

        <circle cx="250" cy="170" r="72" fill={color.glow} opacity="0.42" />
        <circle cx="250" cy="170" r="57" fill="#050814" stroke={color.stroke} strokeWidth="1.5" />

        <text x="250" y="154" textAnchor="middle" fill="#94a3b8" fontSize="11">
          総合
        </text>
        <text x="250" y="190" textAnchor="middle" fill={color.text} fontSize="36" fontWeight="800">
          {total}
        </text>

        <circle cx="250" cy="58" r="3" fill={color.stroke} />
        <circle cx="105" cy="260" r="3" fill={color.stroke} />
        <circle cx="395" cy="260" r="3" fill={color.stroke} />

        <text x="250" y="34" textAnchor="middle" fill="#94a3b8" fontSize="11">
          食事
        </text>
        <text x="250" y="72" textAnchor="middle" fill="#93c5fd" fontSize="27" fontWeight="800">
          {diet}
        </text>

        <text x="82" y="254" textAnchor="middle" fill="#94a3b8" fontSize="11">
          運動
        </text>
        <text x="82" y="291" textAnchor="middle" fill="#93c5fd" fontSize="27" fontWeight="800">
          {training}
        </text>

        <text x="418" y="254" textAnchor="middle" fill="#94a3b8" fontSize="11">
          生活
        </text>
        <text x="418" y="291" textAnchor="middle" fill="#93c5fd" fontSize="27" fontWeight="800">
          {life}
        </text>
      </svg>
    </div>
  );
}

function BalanceSlider({
  label,
  jpLabel,
  value,
  color,
  onChange,
}: {
  label: string;
  jpLabel: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-200">{jpLabel}</p>
        </div>

        <p className="text-2xl font-black text-blue-300">{value}</p>
      </div>

      <input
        type="range"
        min="50"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${color}`}
      />
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="rounded-[1.7rem] border border-cyan-400/20 bg-black/35 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.26em] text-cyan-300">
            SCORE TREND
          </p>

          <h3 className="mt-2 text-xl font-black">総合スコア推移</h3>

          <p className="mt-2 text-xs leading-6 text-slate-500">
            直近の保存データから、身体状態の変化を可視化します。
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500">Latest</p>
          <p className="text-5xl font-black text-cyan-300">82</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <AnalyticsLineGraph />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <StatusBox label="改善優先" value="Life" color="text-emerald-300" />
        <StatusBox label="強み" value="Training" color="text-red-300" />
        <StatusBox label="今日の一手" value="回復" color="text-blue-300" />
      </div>
    </div>
  );
}

function AnalysisModules() {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/50 p-5">
        <p className="text-[10px] font-bold tracking-[0.26em] text-blue-300">
          AREA SCORES
        </p>

        <h3 className="mt-2 text-xl font-black">領域別スコア</h3>

        <div className="mt-5 space-y-3">
          <ScoreRow label="Diet" jpLabel="食事" value="75" color="text-orange-300" />
          <ScoreRow label="Training" jpLabel="運動" value="100" color="text-red-300" />
          <ScoreRow label="Life" jpLabel="生活" value="64" color="text-emerald-300" />
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-blue-400/20 bg-blue-500/10 p-5">
        <p className="text-[10px] font-bold tracking-[0.24em] text-cyan-300">
          AI SUMMARY
        </p>

        <h3 className="mt-2 text-xl font-black">今日の分析コメント</h3>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-black/30 p-4">
          <p className="text-sm leading-7 text-slate-300">
            Trainingは高評価ですが、Lifeスコアが全体を下げています。
            本日は高負荷トレーニングより、睡眠・疲労回復を優先すると
            コンディションが安定しやすい状態です。
          </p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsLineGraph() {
  return (
    <svg viewBox="0 0 560 210" className="h-56 w-full">
      <defs>
        <linearGradient id="analysisLineHome" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {[40, 80, 120, 160].map((y) => (
        <line
          key={y}
          x1="28"
          y1={y}
          x2="532"
          y2={y}
          stroke="rgba(148,163,184,0.14)"
        />
      ))}

      <line x1="28" y1="24" x2="28" y2="176" stroke="rgba(148,163,184,0.16)" />
      <line x1="28" y1="176" x2="532" y2="176" stroke="rgba(148,163,184,0.16)" />

      <path
        d="M28 140 C90 125, 130 90, 202 96 C270 102, 320 132, 382 92 C435 58, 486 60, 532 40"
        fill="none"
        stroke="url(#analysisLineHome)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {[
        [28, 140],
        [202, 96],
        [382, 92],
        [532, 40],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="5"
          fill="#020617"
          stroke="#22d3ee"
          strokeWidth="3"
        />
      ))}

      <text x="30" y="22" fill="#64748b" fontSize="10">
        score trend
      </text>
      <text x="488" y="196" fill="#64748b" fontSize="10">
        latest
      </text>
    </svg>
  );
}

function StatusBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-[10px] tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}

function ScoreRow({
  label,
  jpLabel,
  value,
  color,
}: {
  label: string;
  jpLabel: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-sm font-black ${color}`}>{label}</p>
          <p className="mt-1 text-xs text-slate-500">{jpLabel}</p>
        </div>

        <p className={`text-3xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  );
}

function ReadmeNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = sessionStorage.getItem("fitra_readme_notice_dismissed");

    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fitra_readme_notice_dismissed", "true");
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,360px)] rounded-3xl border border-cyan-400/30 bg-[#07111f]/95 p-5 text-white shadow-[0_0_50px_rgba(34,211,238,0.24)] backdrop-blur">
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-4 top-4 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400 transition hover:text-white"
        aria-label="READMEバナーを閉じる"
      >
        ×
      </button>

      <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">
        FOR REVIEWERS
      </p>

      <h3 className="mt-3 pr-8 text-lg font-black">
        READMEで構成・環境構築を確認できます
      </h3>

      <p className="mt-3 text-xs leading-6 text-slate-300">
        使用技術、実装方針、セットアップ手順、今後の改善点をまとめています。
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          href={README_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/20"
        >
          <GitHubIcon className="h-4 w-4" />
          READMEを見る
        </Link>

        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs font-black text-slate-200 transition hover:bg-slate-800"
        >
          GitHub
        </Link>
      </div>
    </div>
  );
}