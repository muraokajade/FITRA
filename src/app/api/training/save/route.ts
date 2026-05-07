// app/api/training/save/route.ts

// Next.js の Response ヘルパー
type TrainingRowInput = {
  name: string;
  weight: number | string;
  reps: number | string;
  sets: number | string;
  volume: number | string;
};
import { NextResponse } from "next/server";
// さっき作った PrismaClient 共通ファイル
import { prisma } from "@/lib/prisma";

// POST /api/training/save
// Step3 からトレーニング内容を送ってくる想定
export async function POST(req: Request) {
  try {
    // フロントから送られてきた JSON をパース
    const { date, totalVolume, totalSets, totalReps, rows } = await req.json();

    // Prisma 経由で TrainingRecord + TrainingRow を一括作成
    const record = await prisma.trainingRecord.create({
      data: {
        // string → Date 型に変換して保存
        date: new Date(date),
        totalVolume,
        totalSets,
        totalReps,
        // 子テーブル TrainingRow をまとめて create
        rows: {
          create: (rows as TrainingRowInput[]).map((r) => ({
            name: r.name,
            // string の可能性があるので Number() で数値化
            weight: Number(r.weight),
            reps: Number(r.reps),
            sets: Number(r.sets),
            volume: Number(r.volume),
          })),
        },
      },
      // 返却時に rows も含めたいなら include: { rows: true } でもOK
    });

    // 作成したレコードの id を返す（フロントで何かに使いたい時用）
    return NextResponse.json({ id: record.id });
  } catch (e) {
    // 何か失敗したらログ出して 500 を返す
    console.error(e);
    return NextResponse.json(
      { error: "failed to save training record" },
      { status: 500 }
    );
  }
}
