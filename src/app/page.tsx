"use client";

import LoadingLink from "@/components/LoadingLink";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const chips = ["現役プロ格闘家監修", "AI栄養学", "最新スポーツ科学"];

const flowItems = [
  {
    label: "Diet",
    text: "食事・栄養・不足傾向",
    theme: "text-orange-300",
    href: "/diet/dashboard",
  },
  {
    label: "Training",
    text: "重量・回数・成長傾向",
    theme: "text-red-300",
    href: "/training",
  },
  {
    label: "Life",
    text: "睡眠・疲労・ストレス",
    theme: "text-emerald-300",
    href: "/life",
  },
];

const clearDietTempStorage = () => {
  localStorage.removeItem("foodItems");
  localStorage.removeItem("foodItem");
  localStorage.removeItem("input");
  localStorage.removeItem("images");
  localStorage.removeItem("feedback");
  localStorage.removeItem("pendingMeal");
  localStorage.removeItem("tempMeals");
  localStorage.removeItem("viewingMealId");
  localStorage.removeItem("resultMode");
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
    <main className="relative min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-[-220px] h-[460px] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-[-180px] top-36 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-160px] bottom-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />

      <div className="relative z-10">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-lg font-black tracking-[0.18em] text-blue-300"
          >
            FITRA
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LoadingLink
                  href="/dashboard"
                  theme="home"
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/20"
                >
                  Dashboard
                </LoadingLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <LoadingLink
                  href="/login"
                  theme="home"
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/20"
                >
                  ログイン
                </LoadingLink>

                <LoadingLink
                  href="/register"
                  theme="home"
                  className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  新規登録
                </LoadingLink>
              </>
            )}
          </div>
        </header>

        <section className="px-6 pb-16 pt-16 md:pb-20 md:pt-24">
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

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <LoadingLink
                href={user ? "/dashboard" : "/login"}
                theme="home"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-300/40 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-11 py-4 text-sm font-bold shadow-[0_0_35px_rgba(56,189,248,0.65)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_60px_rgba(56,189,248,0.95)] md:text-base"
              >
                <span className="absolute inset-y-0 left-[-40%] w-1/3 skew-x-[-20deg] bg-white/30 transition-all duration-700 group-hover:left-[120%]" />
                <span className="relative flex flex-col items-center leading-tight">
                  <span className="text-[10px] tracking-[0.25em] text-blue-100/80">
                    {user ? "OPEN DASHBOARD" : "START FITRA"}
                  </span>
                  <span className="mt-1 text-lg font-black">
                    {user ? "ダッシュボードを見る" : "ログインして始める"}
                  </span>
                </span>
              </LoadingLink>

              {!user && (
                <LoadingLink
                  href="/register"
                  theme="home"
                  className="inline-flex items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 px-8 py-4 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                >
                  新規登録
                </LoadingLink>
              )}
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              {user
                ? "ログイン済みです。ダッシュボードから今日の身体状態を確認できます。"
                : "登録後、Diet・Training・Life の記録と総合ダッシュボードを利用できます。"}
            </p>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),linear-gradient(135deg,#07111f,#05060a_58%,#08111f)] p-5 shadow-[0_0_70px_rgba(56,189,248,0.14)] md:p-8">
              <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1 text-[11px] tracking-[0.22em] text-cyan-200">
                      FITRA CONDITION SCORE
                    </p>

                    <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
                      総合Dashboardで、
                      <br />
                      体調の現在地を確認
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                      食事AI・トレーニングAI・生活AIの結果をまとめて、
                      今日の総合スコア、改善優先、直近の変化をひとつの画面で確認できます。
                    </p>
                  </div>

                  <LoadingLink
                    href="/dashboard"
                    theme="home"
                    className="w-fit rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20"
                  >
                    ダッシュボードを見る
                  </LoadingLink>
                </div>

                <MockDashboard />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.95fr,1.05fr]">
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
                    href={item.href}
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
                    <span className="text-xs text-slate-500">
                      {item.label === "Diet" ? "履歴を見る" : "入力する"}
                    </span>
                  </LoadingLink>
                ))}
              </div>
            </div>

            <MockSectionPreview />
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

            <div className="mt-6 grid gap-3 md:grid-cols-3">
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
              className="mt-6 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/20"
            >
              FITRAスコアのロジックを見る
            </LoadingLink>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-blue-950/40 via-[#0b0f16] to-cyan-950/30 p-6 text-center shadow-lg shadow-black/40 md:p-10">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
              START TODAY
            </p>

            <h2 className="mt-4 text-2xl font-black md:text-3xl">
              今日の記録から、身体状態を見える化する
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              FITRAは、完璧な記録よりも、まず今日の状態を把握することを重視しています。
              食事・運動・生活の小さな入力を積み上げることで、自分の身体の傾向を確認できます。
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <LoadingLink
                href={user ? "/dashboard" : "/login"}
                theme="home"
                className="rounded-full border border-sky-300/40 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-8 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(56,189,248,0.45)] transition hover:scale-[1.02]"
              >
                {user ? "ダッシュボードを見る" : "ログインして始める"}
              </LoadingLink>

              {!user && (
                <LoadingLink
                  href="/register"
                  theme="home"
                  className="rounded-full border border-blue-500/40 bg-blue-500/10 px-8 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-500/20"
                >
                  新規登録する
                </LoadingLink>
              )}
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

function MockDashboard() {
  return (
    <div className="mt-8 rounded-3xl border border-cyan-400/25 bg-black/35 p-4 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[280px,1fr]">
        <div className="rounded-3xl border border-cyan-400/30 bg-slate-950/60 p-5">
          <p className="text-[11px] tracking-[0.22em] text-cyan-200">
            OVERALL
          </p>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-6xl font-black text-cyan-300">80</span>
            <span className="mb-2 text-sm text-slate-500">/100</span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniScore label="Diet" value="75" className="text-orange-300" />
            <MiniScore label="Training" value="100" className="text-red-300" />
            <MiniScore label="Life" value="64" className="text-emerald-300" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-800 bg-[#080d15]/80 p-5">
            <p className="text-[11px] tracking-[0.2em] text-blue-200">
              TODAY CONCLUSION
            </p>

            <h3 className="mt-3 text-xl font-bold">今日の結論</h3>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              トレーニングは強みです。生活スコアが全体を下げているため、
              今日は回復を優先するとコンディションが整いやすい状態です。
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniPanel label="改善優先" value="生活" score="64" />
              <MiniPanel label="強み" value="Training" score="100" />
              <MiniPanel label="今日の一手" value="回復を優先" />
            </div>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-slate-950/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.2em] text-blue-200">
                SCORE TREND
              </p>
              <p className="text-[11px] text-slate-500">直近7件</p>
            </div>

            <MockLineChart />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockSectionPreview() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0b0f16]/90 p-6 shadow-lg shadow-black/40 md:p-8">
      <p className="text-[11px] font-semibold tracking-[0.25em] text-blue-300">
        APP SECTIONS
      </p>

      <h2 className="mt-3 text-2xl font-bold tracking-tight">
        各セクションで記録し、結果を見える化
      </h2>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-300">Training AI</p>
              <h3 className="mt-2 text-lg font-black">成長ダッシュボード</h3>
            </div>
            <p className="text-2xl font-black text-red-300">100</p>
          </div>

          <div className="mt-4 h-20 rounded-xl border border-red-500/20 bg-black/30 p-3">
            <div className="flex h-full items-end gap-2">
              <div className="h-[25%] flex-1 rounded-t bg-red-300/50" />
              <div className="h-[35%] flex-1 rounded-t bg-red-300/60" />
              <div className="h-[55%] flex-1 rounded-t bg-red-300/70" />
              <div className="h-[85%] flex-1 rounded-t bg-red-300" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LoadingLink
            href="/diet/dashboard"
            theme="diet"
            className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 transition hover:border-orange-400/60 hover:bg-orange-500/15"
          >
            <p className="text-xs font-bold text-orange-300">Diet AI</p>
            <h3 className="mt-2 text-lg font-black">食事スコア推移</h3>

            <div className="mt-4 flex items-end gap-3">
              <MockBar value="40" height="35%" color="bg-red-400" />
              <MockBar value="60" height="55%" color="bg-orange-400" />
              <MockBar value="95" height="90%" color="bg-emerald-400" />
              <MockBar value="75" height="70%" color="bg-yellow-300" />
            </div>

            <p className="mt-3 text-xs text-orange-200">食事履歴を見る</p>
          </LoadingLink>

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-xs font-bold text-emerald-300">Life AI</p>
            <h3 className="mt-2 text-lg font-black">生活スコア</h3>

            <div className="mt-5 flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-slate-800">
                <div className="absolute inset-[-10px] rounded-full border-[10px] border-blue-400 border-l-transparent border-b-transparent" />
                <div className="text-center">
                  <p className="text-3xl font-black text-blue-300">52</p>
                  <p className="text-[10px] text-slate-500">調整</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs leading-6 text-slate-400">
          記録画面はそれぞれの用途に合わせて最適化し、最後にDashboardで総合判断できます。
        </p>
      </div>
    </div>
  );
}

function MiniScore({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${className}`}>{value}</p>
    </div>
  );
}

function MiniPanel({
  label,
  value,
  score,
}: {
  label: string;
  value: string;
  score?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-[10px] tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-sm font-bold text-slate-100">{value}</p>
        {score && (
          <p className="text-xl font-black text-emerald-300">{score}</p>
        )}
      </div>
    </div>
  );
}

function MockLineChart() {
  return (
    <svg viewBox="0 0 520 150" className="mt-4 h-36 w-full">
      <line
        x1="24"
        y1="126"
        x2="500"
        y2="126"
        stroke="rgba(148,163,184,0.25)"
      />
      <line
        x1="24"
        y1="25"
        x2="24"
        y2="126"
        stroke="rgba(148,163,184,0.18)"
      />
      <polyline
        points="24,92 150,60 270,70 390,52 500,30"
        fill="none"
        stroke="rgb(56,189,248)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        ["24", "92"],
        ["150", "60"],
        ["270", "70"],
        ["390", "52"],
        ["500", "30"],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="5"
          fill="#020617"
          stroke="rgb(56,189,248)"
          strokeWidth="4"
        />
      ))}
    </svg>
  );
}

function MockBar({
  value,
  height,
  color,
}: {
  value: string;
  height: string;
  color: string;
}) {
  return (
    <div className="flex h-28 flex-1 flex-col items-center justify-end gap-2 rounded-xl bg-slate-950/50 p-2">
      <div
        className={`w-full rounded-lg ${color} shadow-[0_0_18px_rgba(255,255,255,0.12)]`}
        style={{ height }}
      />
      <p className="text-xs font-bold text-slate-200">{value}</p>
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