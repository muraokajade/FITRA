import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const names: string[] = body.names;

    const records = await prisma.trainingRecord.findMany({
      where: {
        exercise: { in: names },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const latestMap: Record<string, any> = {};

    for (const r of records) {
      if (!latestMap[r.exercise]) {
        latestMap[r.exercise] = {
          weight: r.weight,
          reps: r.reps,
          sets: r.sets,
        };
      }
    }

    return NextResponse.json(latestMap);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "取得失敗" }, { status: 500 });
  }
}