// records.route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAiFeedback } from "@/lib/server/getTrainingFeedback";
import { rebuildTrainingAnalysis } from "@/lib/training/rebuildTrainingAnalysis";
import type { TrainingSummary } from "@/types/training";
import type { Prisma } from "@prisma/client";

type TrainingRecordsRequestBody = {
  userId?: string;
  date: string;
  rows: {
    name: string;
    value: string;
    label?: string;
    group?: string;
    weight: string;
    reps: string;
    sets: string;
  }[];
  memo?: string;
  level?: string;
  goal?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrainingRecordsRequestBody;

    const {
      rows,
      userId: rawUserId,
      date,
      memo = "",
      level = "beginner",
      goal = "bulk",
    } = body;

    // userId は任意なので、未指定なら demo に固定する
    const userId = rawUserId ?? "demo";

    // rows が空なら、この後の map / reduce / DB保存ができない
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "トレーニング記録がありません" },
        { status: 400 }
      );
    }

    // Prisma の DateTime には string ではなく Date 型を渡す
    const trainingDate = new Date(date);

    // フロント用の rows を、DB保存・分析用の entries に変換する
    // row.value は bench_press などの固定key。重複判定や分析に使いやすい
    const entries = rows.map((row) => {
      const weight = Number(row.weight);
      const reps = Number(row.reps);
      const sets = Number(row.sets);

      return {
        exercise: row.value,
        weight,
        reps,
        sets,
        volume: weight * reps * sets,
      };
    });

    // Session に持たせる総ボリューム
    const totalVolume = entries.reduce((sum, entry) => {
      return sum + entry.volume;
    }, 0);

    // 1. TrainingSession を作る
    // 2. その子として TrainingEntry を複数作る
    // ここでは TrainingAnalysis は作らない
    // Analysis は rebuildTrainingAnalysis に集約する
    const savedTrainingSession = await prisma.trainingSession.create({
      data: {
        userId,
        date: trainingDate,
        mode: "NORMAL",
        totalVolume,
        memo,

        entries: {
          create: entries.map((entry) => ({
            exercise: entry.exercise,
            weight: entry.weight,
            reps: entry.reps,
            sets: entry.sets,
            volume: entry.volume,
          })),
        },
      },
      include: {
        entries: true,
      },
    });

    // AIコメント生成用のsummary
    // これはDB保存用ではなく、getAiFeedbackに渡すための形
    const summary: TrainingSummary = {
      totalVolume,
      totalSets: entries.reduce((sum, entry) => sum + entry.sets, 0),
      totalReps: entries.reduce((sum, entry) => {
        return sum + entry.reps * entry.sets;
      }, 0),
      rows: rows.map((row) => {
        const weight = Number(row.weight);
        const reps = Number(row.reps);
        const sets = Number(row.sets);

        return {
          name: row.name,
          weight,
          reps,
          sets,
          volume: weight * reps * sets,
        };
      }),
    };

    // AIフィードバックを取得
    // 今は型安定を優先して、level / goal は固定値で渡す
    const ai = await getAiFeedback({
      domain: "training",
      level: "beginner",
      goal: "bulk",
      summary,
    });

    // 保存済みの TrainingSession / TrainingEntry を元に
    // 統合Dashboard用の TrainingAnalysis を作る
    const analysis = await rebuildTrainingAnalysis({
      userId,
      date: trainingDate,
      feedback: ai.feedback,
    });

    return NextResponse.json(
      {
        trainingSession: savedTrainingSession,
        analysis,
        insight: ai.feedback,
      },
      { status: 201 }
    );
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
    // TODO:
    // 現在のGETは旧TrainingRecord + LIVEのexerciseLogを読んでいる。
    // POSTをTrainingSession / TrainingEntry構造に寄せたので、
    // 後でGETも TrainingSession / TrainingEntry ベースに置き換える。
    //
    // 今はPOSTの保存確認を優先するため、既存GETは一旦そのまま残す。

    type TrainingSessionWithEntries = Prisma.TrainingSessionGetPayload<{
      include: {
        entries: true;
      };
    }>;

    const normalSessions: TrainingSessionWithEntries[] = await prisma.trainingSession.findMany({
      where: {
        userId: "demo",
        mode: "NORMAL",
      },
      include: {
        entries: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    const liveLogs = await prisma.exerciseLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // const normalRows = normalSessions.map((session) => ({
    //   id: String(r.id),
    //   userId: r.userId,
    //   date: r.date,
    //   exercise: r.exercise,
    //   weight: r.weight,
    //   reps: r.reps,
    //   sets: r.sets,
    //   volume: r.volume,
    //   createdAt: r.createdAt,
    //   source: "NORMAL" as const,
    // }));

    const normalRows = normalSessions.flatMap((session) =>
  session.entries.map((entry) => ({
    id: String(entry.id),
    userId: session.userId,
    date: session.date.toISOString().slice(0, 10),
    exercise: entry.exercise,
    weight: entry.weight,
    reps: entry.reps,
    sets: entry.sets,
    volume: entry.volume,
    createdAt: session.createdAt,
    source: "NORMAL" as const,
  }))
);

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