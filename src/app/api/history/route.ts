// app/api/training/history/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/training/history
// トレーニング履歴の一覧を取得するAPI
export async function GET() {
  try {
    // TrainingRecord を新しい順に取得
    // それぞれに紐づく rows も include で取得
    const records = await prisma.trainingRecord.findMany({
      orderBy: { date: "desc" }, // 日付の降順
      include: { rows: true }, // 子テーブルも一緒に
    });

    // JSON で records をそのまま返す
    return NextResponse.json({ records });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "failed to load history" },
      { status: 500 }
    );
  }
}
