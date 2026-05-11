// api/diet/logs/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type TempMealPayload = {
  foodItems: string[];
  text?: string;
  feedback?: string;
}

function extractScore(text: string): number | null {
  const match = text.match(/食事スコア：(\d+)点/);

  if (!match) return null;

  return Number(match[1]);
}

export async function POST(req: NextRequest) {
  try {
    //フロントの fetch bodyで送ったjsonを受け取る
    const body = await req.json();

    // body から必要な値を分割代入で取り出す
    // as は「bodyはこういう形として扱う」というTypeScript用の型指定
    const { userId, date, meals, dailyFeedback } = body as {
      userId?: string;
      date?: string;
      meals?: TempMealPayload[];
      dailyFeedback?: string;
    };

    if(!userId || !date || !Array.isArray(meals) || meals.length === 0) {
      return NextResponse.json(
        { error: "保存データが不足しています。"},
        { status: 400 }
      );
    }
    // tempMeals の foodItems を1つの配列にまとめる
    const foodNames = meals.flatMap((meal) => meal.foodItems ?? []);

    if(foodNames.length === 0){
      return NextResponse.json(
        {error: "食事名がありません。"},
        {status: 400}
      );
    }

    const score = dailyFeedback ? extractScore(dailyFeedback) : null;

    const saved = await prisma.mealLog.create({
      data: {
        name: "今日の食事ログ",
        mealType: "daily",
        timestamp: new Date(date),
        score,
        
        //このmapの理解ができてない
        items: {
          create: foodNames.map((name) => ({
            name,
            amount: 0,
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
          })),
        },
        dietAnalyses: {
          create: {
            userId: userId ?? "demo",
            date: new Date(date),
            score: score ?? 0,
            summary: "今日の食事ログのAI評価",
            feedback: dailyFeedback ?? "",

          }
        }
      },
      include: {
        items: true,
        dietAnalyses: true
      },
    });
    return NextResponse.json(saved, { status: 201});
  } catch(e) {
    console.error("DIET_LOG_SAVE_ERROR", e);

    return NextResponse.json(
      {error: "食事ログ保存に失敗しました。"},
      { status: 500 }
    )
  }
}

export async function GET() {
  const logs = await prisma.mealLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, dietAnalyses: true },
  });

  return NextResponse.json(logs);
}