// GET /api/dashboard
// 1. 最新のDietAnalysisを取得
// 2. 最新のTrainingAnalysisを取得
// 3. 最新のLifeAnalysisを取得
// 4. scoreからoverallScoreを計算
// 5. historyItemsを作る
// 6. JSONで返す

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Dashboardで扱う分析領域。
 *
 * diet      = 食事分析
 * training  = トレーニング分析
 * life      = 生活分析
 *
 * historyItems の area に使う。
 * 文字列を自由入力にせず、この3種類に限定するための型。
 */

type Area = "diet" | "training" | "life";


/**
 * Dashboard下部の「最新の解析履歴」に表示する1行分の型。
 *
 * DBのAnalysisテーブルをそのまま返すのではなく、
 * 画面表示に必要な形へ整形して返す。
 */

type DashboardHistoryItem = {
    //   * diet_1 / training_3 / life_5 のように、
   //* area名を付けてIDの重複を避ける。
   id: string;
   date: string; //"2026-05-11" のような文字列
   area: Area; // /dietなどへの遷移に使う
   title: string;//Analysisのsummaryがあればそれを使い、   * なければ "食事分析" などのデフォルト文言を使う。
   score: number | null;
}

type ScoreTrendItem = {
    date: string;
    overallScore: number | null;
    dietScore: number | null;
    trainingScore: number | null;
    lifeScore: number | null;
}

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function calculateOverallScore(scores: Array<number | null>) {

    const validScores = scores.filter((score): score is number  => typeof score === "number");

    if(validScores.length === 0) return null;

    const total = validScores.reduce((total, cur) => {
        return total + cur;
    }, 0);

    return Math.round((total / validScores.length));

}



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        todaySummary: {
          overallScore: null,
          dietScore: null,
          trainingScore: null,
          lifeScore: null,
        },
        latestAnalyses: {
          diet: null,
          training: null,
          life: null,
        },
        historyItems: [],
        scoreTrend: [],
        message: "userId is required",
      });
    }

    const [dietAnalyses, trainingAnalyses, lifeAnalyses] = await Promise.all([
      prisma.dietAnalysis.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 7,
      }),

      prisma.trainingAnalysis.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 7,
      }),

      prisma.lifeAnalysis.findMany({
        where: { userId },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 7,
      }),
    ]);

    const dietAnalysis = dietAnalyses[0] ?? null;
    const trainingAnalysis = trainingAnalyses[0] ?? null;
    const lifeAnalysis = lifeAnalyses[0] ?? null;

    const dietScore = dietAnalysis?.score ?? null;
    const trainingScore = trainingAnalysis?.score ?? null;
    const lifeScore = lifeAnalysis?.score ?? null;

    const overallScore = calculateOverallScore([
      dietScore,
      trainingScore,
      lifeScore,
    ]);

    const historyItems: DashboardHistoryItem[] = [
      dietAnalysis && {
        id: `diet_${dietAnalysis.id}`,
        date: formatDate(dietAnalysis.date),
        area: "diet" as const,
        title: dietAnalysis.summary ?? "食事分析",
        score: dietAnalysis.score,
      },

      trainingAnalysis && {
        id: `training_${trainingAnalysis.id}`,
        date: formatDate(trainingAnalysis.date),
        area: "training" as const,
        title: trainingAnalysis.summary ?? "トレーニング分析",
        score: trainingAnalysis.score,
      },

      lifeAnalysis && {
        id: `life_${lifeAnalysis.id}`,
        date: formatDate(lifeAnalysis.date),
        area: "life" as const,
        title: lifeAnalysis.summary ?? "生活分析",
        score: lifeAnalysis.score,
      },
    ].filter(Boolean) as DashboardHistoryItem[];

    historyItems.sort((a, b) => b.date.localeCompare(a.date));

    const trendMap = new Map<string, ScoreTrendItem>();

    for (const analysis of dietAnalyses) {
      const date = formatDate(analysis.date);

      const current = trendMap.get(date) ?? {
        date,
        overallScore: null,
        dietScore: null,
        trainingScore: null,
        lifeScore: null,
      };

      current.dietScore = analysis.score;
      trendMap.set(date, current);
    }

    for (const analysis of trainingAnalyses) {
      const date = formatDate(analysis.date);

      const current = trendMap.get(date) ?? {
        date,
        overallScore: null,
        dietScore: null,
        trainingScore: null,
        lifeScore: null,
      };

      current.trainingScore = analysis.score;
      trendMap.set(date, current);
    }

    for (const analysis of lifeAnalyses) {
      const date = formatDate(analysis.date);

      const current = trendMap.get(date) ?? {
        date,
        overallScore: null,
        dietScore: null,
        trainingScore: null,
        lifeScore: null,
      };

      current.lifeScore = analysis.score;
      trendMap.set(date, current);
    }

    const scoreTrend = Array.from(trendMap.values())
      .map((item) => ({
        ...item,
        overallScore: calculateOverallScore([
          item.dietScore,
          item.trainingScore,
          item.lifeScore,
        ]),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      todaySummary: {
        overallScore,
        dietScore,
        trainingScore,
        lifeScore,
      },
      latestAnalyses: {
        diet: dietAnalysis,
        training: trainingAnalysis,
        life: lifeAnalysis,
      },
      historyItems,
      scoreTrend,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      { message: "Dashboardデータの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

