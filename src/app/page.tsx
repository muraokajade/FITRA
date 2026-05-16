"use client";

import LoadingLink from "@/components/LoadingLink";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const chips = ["Training", "Diet", "Life", "AI Condition Score"];

const sectionLinks = [
  {
    label: "Training",
    title: "成長を見える化",
    desc: "重量・回数・セット数から、成長傾向と直近の伸びを確認します。",
    href: "/training",
    theme: "training" as const,
    accent: "text-red-300",
    border: "border-red-400/30",
    bg: "bg-red-500/10",
  },
  {
    label: "Diet",
    title: "食事スコアを確認",
    desc: "保存済みの食事ログから、直近スコアと食事内容を振り返ります。",
    href: "/diet/dashboard",
    theme: "diet" as const,
    accent: "text-orange-300",
    border: "border-orange-400/30",
    bg: "bg-orange-500/10",
  },
  {
    label: "Life",
    title: "回復状態を把握",
    desc: "睡眠・疲労・ストレスから、今日の整い具合を確認します。",
    href: "/life",
    theme: "life" as const,
    accent: "text-emerald-300",
    border: "border-emerald-400/30",
    bg: "bg-emerald-500/10",
  },
];

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

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[0.92fr_1.08fr] md:px-8 md:pb-28 md:pt-20">
          <Reveal>
            <div>
              <div className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-[10px] font-bold tracking-[0.28em] text-blue-200">
                TRAINING / DIET / LIFE
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                今日の身体を、
                <br />
                <span className="bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-600 bg-clip-text text-transparent">
                  数字で掴む。
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-8 text-slate-300 md:text-base">
                FITRAは、トレーニング・食事・生活の記録をまとめて、
                今日の身体状態、回復傾向、改善ポイントをひとつのDashboardで確認できる
                AIフィットネス管理アプリです。
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-[11px] font-semibold text-slate-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <LoadingLink
                  href={user ? "/dashboard" : "/login"}
                  theme="home"
                  className="group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full border border-cyan-300/40 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 px-8 py-4 text-sm font-black text-white shadow-[0_0_42px_rgba(34,211,238,0.34)] transition hover:scale-[1.02]"
                >
                  <span className="absolute inset-y-0 left-[-40%] w-1/3 skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[120%]" />
                  <span className="relative">
                    {user ? "Dashboardを開く" : "ログインして始める"}
                  </span>
                </LoadingLink>

                {!user && (
                  <LoadingLink
                    href="/register"
                    theme="home"
                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 px-8 py-4 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                  >
                    新規登録
                  </LoadingLink>
                )}
              </div>

              <p className="mt-4 text-xs leading-6 text-slate-500">
                未登録でもこのページは閲覧できます。記録・分析・Dashboard利用にはログインが必要です。
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HeroDevice />
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-blue-400/20 bg-[#070b13]/80 p-5 shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.3em] text-blue-300">
                    LIVE PRODUCT IMAGE
                  </p>
                  <h2 className="mt-3 text-2xl font-black md:text-4xl">
                    3つの記録が、総合スコアに集まる
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                    食事・運動・生活を個別に記録し、最後に総合Dashboardで身体状態を判断します。
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
                <DashboardVisual />
                <SectionVisual />
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <Reveal>
            <div className="grid gap-5 md:grid-cols-3">
              {sectionLinks.map((section) => (
                <LoadingLink
                  key={section.label}
                  href={section.href}
                  theme={section.theme}
                  className={`group relative overflow-hidden rounded-[1.7rem] border ${section.border} ${section.bg} p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:bg-white/[0.08]`}
                >
                  <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-white/10 blur-3xl transition group-hover:bg-white/20" />

                  <div className="relative">
                    <p className={`text-xs font-black ${section.accent}`}>
                      {section.label}
                    </p>

                    <h3 className="mt-3 text-xl font-black text-white">
                      {section.title}
                    </h3>

                    <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-300">
                      {section.desc}
                    </p>

                    <span
                      className={`mt-5 inline-flex text-xs font-bold ${section.accent}`}
                    >
                      画面を見る
                    </span>
                  </div>
                </LoadingLink>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <Reveal>
            <div className="rounded-[2rem] border border-blue-500/25 bg-[#070b13]/85 p-6 shadow-[0_0_70px_rgba(59,130,246,0.12)] md:p-8">
              <p className="text-[11px] font-bold tracking-[0.3em] text-blue-300">
                FITRA SCORE LOGIC
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
                スコアの根拠も確認できる
              </h2>

              <p className="mt-5 max-w-4xl text-sm leading-8 text-slate-300 md:text-base">
                FITRAのスコアは、単なるAIの感覚値ではなく、
                睡眠・疲労・ストレス・食事・運動負荷などの入力データをもとに算出します。
                係数や評価基準を確認できるようにし、なぜそのスコアになったのかを説明できる設計を目指しています。
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ScoreLogicMini
                  title="Diet"
                  text="栄養バランス、食事内容、不足傾向を評価します。"
                  className="text-orange-300"
                />

                <ScoreLogicMini
                  title="Training"
                  text="重量、回数、セット数、成長傾向を評価します。"
                  className="text-red-300"
                />

                <ScoreLogicMini
                  title="Life"
                  text="睡眠、疲労、ストレスから回復状態を評価します。"
                  className="text-emerald-300"
                />
              </div>

              <LoadingLink
                href="/score-logic"
                theme="home"
                className="mt-8 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-6 py-3 text-xs font-bold text-blue-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/10"
              >
                FITRAスコアのロジックを見る
              </LoadingLink>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-28 md:px-8">
          <Reveal>
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
          </Reveal>
        </section>

        <footer className="border-t border-slate-800/60 bg-black/20 px-5 py-8 text-center text-[11px] text-slate-500">
          © 2026 FITRA
        </footer>
      </div>

    </main>
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
      <div className="fitra-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-[-260px] h-[520px] bg-gradient-to-b from-blue-500/30 via-cyan-500/8 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] top-36 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-180px] bottom-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
    </>
  );
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`fitra-reveal ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroDevice() {
  return (
    <div className="fitra-float relative rounded-[2rem] border border-blue-400/20 bg-[#070b13]/90 p-4 shadow-[0_0_80px_rgba(59,130,246,0.16)]">
      <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative rounded-[1.5rem] border border-slate-800 bg-[#050814] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300">
              FITRA CONDITION
            </p>
            <h2 className="mt-2 text-2xl font-black">総合スコア</h2>
          </div>

          <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-200">
            LIVE
          </div>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-[180px_1fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/8 p-5">
            <p className="text-[10px] tracking-[0.22em] text-cyan-200">
              OVERALL
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-6xl font-black text-cyan-300">82</span>
              <span className="mb-2 text-sm text-slate-500">/100</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300" />
            </div>
          </div>

          <AnimatedLineGraph />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <HeroMini label="Diet" value="75" className="text-orange-300" />
          <HeroMini label="Training" value="100" className="text-red-300" />
          <HeroMini label="Life" value="64" className="text-emerald-300" />
        </div>
      </div>
    </div>
  );
}

function HeroMini({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${className}`}>{value}</p>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="rounded-[1.7rem] border border-cyan-400/20 bg-black/35 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.26em] text-cyan-300">
            DASHBOARD
          </p>
          <h3 className="mt-2 text-xl font-black">身体状態の現在地</h3>
        </div>

        <p className="text-4xl font-black text-cyan-300">82</p>
      </div>

      <div className="mt-6">
        <AnimatedLineGraph compact />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatusBox label="改善優先" value="Life" color="text-emerald-300" />
        <StatusBox label="強み" value="Training" color="text-red-300" />
        <StatusBox label="今日の一手" value="回復" color="text-blue-300" />
      </div>
    </div>
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

function SectionVisual() {
  return (
    <div className="grid gap-4">
      <LoadingLink
        href="/training"
        theme="training"
        className="group rounded-[1.5rem] border border-red-400/25 bg-red-500/10 p-5 transition hover:-translate-y-1 hover:border-red-300/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-red-300">Training AI</p>
            <h3 className="mt-2 text-xl font-black">成長ダッシュボード</h3>
          </div>
          <p className="text-3xl font-black text-red-300">100</p>
        </div>

        <div className="mt-5 flex h-24 items-end gap-2 rounded-2xl border border-red-400/10 bg-black/30 p-3">
          {[26, 38, 62, 92].map((height, index) => (
            <div
              key={height}
              className="fitra-bar flex-1 rounded-t-lg bg-red-300/80"
              style={{
                height: `${height}%`,
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
        </div>
      </LoadingLink>

      <div className="grid gap-4 sm:grid-cols-2">
        <LoadingLink
          href="/diet/dashboard"
          theme="diet"
          className="group rounded-[1.5rem] border border-orange-400/25 bg-orange-500/10 p-5 transition hover:-translate-y-1 hover:border-orange-300/50"
        >
          <p className="text-xs font-black text-orange-300">Diet AI</p>
          <h3 className="mt-2 text-xl font-black">食事スコア推移</h3>

          <div className="mt-5 flex h-28 items-end gap-3">
            <ScoreBar value="40" height="38%" color="bg-red-400" delay={0} />
            <ScoreBar
              value="60"
              height="58%"
              color="bg-orange-400"
              delay={120}
            />
            <ScoreBar
              value="95"
              height="90%"
              color="bg-emerald-400"
              delay={240}
            />
            <ScoreBar
              value="75"
              height="72%"
              color="bg-yellow-300"
              delay={360}
            />
          </div>
        </LoadingLink>

        <LoadingLink
          href="/life"
          theme="life"
          className="group rounded-[1.5rem] border border-emerald-400/25 bg-emerald-500/10 p-5 transition hover:-translate-y-1 hover:border-emerald-300/50"
        >
          <p className="text-xs font-black text-emerald-300">Life AI</p>
          <h3 className="mt-2 text-xl font-black">生活スコア</h3>

          <div className="mt-5 flex items-center justify-center">
            <LifeRing />
          </div>
        </LoadingLink>
      </div>
    </div>
  );
}

function AnimatedLineGraph({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-950/50 p-4 ${
        compact ? "h-48" : "h-56"
      }`}
    >
      <svg viewBox="0 0 560 190" className="h-full w-full">
        <defs>
          <linearGradient id="fitraLine" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {[40, 80, 120, 160].map((y) => (
          <line
            key={y}
            x1="24"
            y1={y}
            x2="536"
            y2={y}
            stroke="rgba(148,163,184,0.12)"
          />
        ))}

        <path
          className="fitra-line"
          d="M24 132 C90 110, 132 62, 210 76 C285 90, 330 116, 390 72 C444 34, 492 42, 536 24"
          fill="none"
          stroke="url(#fitraLine)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {[
          [24, 132],
          [210, 76],
          [390, 72],
          [536, 24],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="6"
            fill="#020617"
            stroke="#22d3ee"
            strokeWidth="4"
          />
        ))}
      </svg>
    </div>
  );
}

function ScoreBar({
  value,
  height,
  color,
  delay,
}: {
  value: string;
  height: string;
  color: string;
  delay: number;
}) {
  return (
    <div className="flex h-full flex-1 flex-col justify-end gap-2 rounded-xl bg-slate-950/50 p-2">
      <div
        className={`fitra-bar w-full rounded-lg ${color}`}
        style={{ height, animationDelay: `${delay}ms` }}
      />
      <p className="text-center text-xs font-black text-slate-200">{value}</p>
    </div>
  );
}

function LifeRing() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="rgba(30,41,59,0.95)"
          strokeWidth="12"
        />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="180 320"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            animation: "fitra-ring-spin 2.2s ease-out forwards",
          }}
        />
      </svg>

      <div className="text-center">
        <p className="text-3xl font-black text-blue-300">52</p>
        <p className="text-[10px] text-slate-500">調整</p>
      </div>
    </div>
  );
}

function ScoreLogicMini({
  title,
  text,
  className,
}: {
  title: string;
  text: string;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <p className={`text-sm font-bold ${className}`}>{title}</p>
      <p className="mt-2 text-xs leading-6 text-slate-400">{text}</p>
    </div>
  );
}