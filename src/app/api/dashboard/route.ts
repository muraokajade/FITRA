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



export async function GET() {
    try {
        const userId = "demo";

    /**
     * 3つのAnalysisを並列で取得する。
     *
     * Promise.all を使う理由:
     * Diet → Training → Life の順番で待つ必要がないため。
     * 3つ同時にDBへ問い合わせて、全部終わったら次へ進む。
     */
     const [dietAnalysis, trainingAnalysis, lifeAnalysis] = await Promise.all([
        prisma.dietAnalysis.findFirst({
            where: { userId },
            orderBy: { date: "desc" }
        }),
        prisma.trainingAnalysis.findFirst({
            where: { userId },
            orderBy: { date: "desc" }

        }),
        prisma.lifeAnalysis.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
      }),

     ]);

    const dietScore = dietAnalysis?.score ?? null;
    const trainingScore = trainingAnalysis?.score ?? null;
    const lifeScore = lifeAnalysis?.score ?? null;

    const overallScore = calculateOverallScore([
      dietScore,
      trainingScore,
      lifeScore,
    ]);

    const historyItems: DashboardHistoryItem[] = [
      /**
       * dietAnalysis が存在する場合だけ履歴に追加する。
       *
       * 存在しない場合は false / null 相当になり、
       * 後ろの filter(Boolean) で除外される。
       */
      dietAnalysis && {
        id: `diet_${dietAnalysis.id}`,
        date: formatDate(dietAnalysis.date),
        area: "diet" as const,
        title: dietAnalysis.summary ?? "食事分析",
        score: dietAnalysis.score,
      },

      /**
       * trainingAnalysis が存在する場合だけ履歴に追加する。
       */
      trainingAnalysis && {
        id: `training_${trainingAnalysis.id}`,
        date: formatDate(trainingAnalysis.date),
        area: "training" as const,
        title: trainingAnalysis.summary ?? "トレーニング分析",
        score: trainingAnalysis.score,
      },

      /**
       * lifeAnalysis が存在する場合だけ履歴に追加する。
       */
      lifeAnalysis && {
        id: `life_${lifeAnalysis.id}`,
        date: formatDate(lifeAnalysis.date),
        area: "life" as const,
        title: lifeAnalysis.summary ?? "生活分析",
        score: lifeAnalysis.score,
      },
    ].filter(Boolean) as DashboardHistoryItem[];

    //TODO このメソッド知らん
    historyItems.sort((a, b) => b.date.localeCompare(a.date));

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
    });



    } catch (error) {
    /**
     * DBエラーやPrismaエラーが起きた場合。
     *
     * サーバー側には詳細ログを出す。
     * フロント側には安全なメッセージだけ返す。
     */
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      { message: "Dashboardデータの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

