import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getAiFeedback } from "@/lib/server/getTrainingFeedback";
import type { TrainingSummary } from "@/types/training";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {rows, userId, date, level = "beginner", goal = "bulk"} = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "トレーニング記録がありません" },
        { status: 400 }
      );
    }

    // ✅ DB保存（schemaに合わせる）
    const records = await Promise.all(
      rows.map((row) =>
        prisma.trainingRecord.create({
          data: {
            userId,
            date,
            exercise: row.value,// ←ここ修正ポイントなんで？
            weight: Number(row.weight),
            reps: Number(row.reps),
            sets: Number(row.sets),
            volume:
              Number(row.weight) *
              Number(row.reps) *
              Number(row.sets),
          },
        })
      )
    );

    // ✅ summary作成
    const summary: TrainingSummary = {
      totalVolume: rows.reduce(
        (sum, row) =>
          sum +
          Number(row.weight) *
          Number(row.reps) *
          Number(row.sets),
        0
      ),
      totalSets: rows.reduce((sum, row) => sum + Number(row.sets), 0),
      totalReps: rows.reduce(
        (sum, row) =>
          sum + Number(row.reps) * Number(row.sets),
        0
      ),
      rows: rows.map((row) => ({
        name: row.name,
        weight: Number(row.weight),
        reps: Number(row.reps),
        sets: Number(row.sets),
        volume:
          Number(row.weight) *
          Number(row.reps) *
          Number(row.sets),
      })),
    };

    // ✅ AI呼び出し
    const ai = await getAiFeedback({
      domain: "training",
      level,
      goal,
      summary,
    });

    return NextResponse.json({
      records,
      insight: ai.feedback,
    });
  } catch (error) {
  console.error("TRAINING_RECORD_POST_ERROR:", error);

  return NextResponse.json(
    {
      error: "トレーニング記録の保存またはAI評価に失敗しました",
      detail: error instanceof Error ? error.message : String(error),
    },
    { status: 500 }
  );
}
}

export async function GET() {
  try {
    // NORMAL記録
    const normalRecords = await prisma.trainingRecord.findMany({
      where: {
        userId: "demo",
      },
      orderBy: [
        { date: "desc" },
        { createdAt: "desc" },
      ],
    });

    // LIVE記録
    const liveLogs = await prisma.exerciseLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // NORMALをダッシュボード用の形に変換
    const normalRows = normalRecords.map((r) => ({
      id: String(r.id),
      userId: r.userId,
      date: r.date,
      exercise: r.exercise,
      weight: r.weight,
      reps: r.reps,
      sets: r.sets,
      volume: r.volume,
      createdAt: r.createdAt,
      source: "NORMAL" as const,
    }));

    // LIVEをダッシュボード用の形に変換
    const liveRows = liveLogs.map((log) => ({
      id: String(log.id),
      userId: "demo",
      date: log.createdAt.toISOString().slice(0, 10),
      exercise: log.exerciseName,
      weight: log.weight,
      reps: log.reps,
      sets: 1,
      volume: log.weight * log.reps,
      createdAt: log.createdAt,
      source: "LIVE" as const,
    }));

    return NextResponse.json({
      records: [...normalRows, ...liveRows],
    });
  } catch (error) {
    console.error("TRAINING_RECORD_GET_ERROR:", error);

    return NextResponse.json(
      {
        error: "トレーニング履歴の取得に失敗しました",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}