// POST:
// 1. userId, date, mode, entries を受け取る
// 2. entries から totalVolume を計算
// 3. score を仮計算
// 4. topExercise を決める
// 5. TrainingSession を作る
// 6. TrainingEntry を複数作る
// 7. TrainingAnalysis を作る

// GET:
// 最新の TrainingAnalysis を取得する
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TrainingAnalysisRequestBody = {
    userId?: string;
    date: string;
    mode: "LIVE" | "NORMAL";
    entries: {
        exercise: string;
        weight: number;
        reps: number;
        sets:number;
    }[];
    memo?: string;
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as TrainingAnalysisRequestBody;

        const { userId, date, mode, entries, memo } = body;

        const totalVolume = entries.reduce((acc, cur) => {
            return acc + cur.weight * cur.reps * cur.sets;
        }, 0)

        const score = Math.min(100, Math.round(totalVolume / 100));

        const topEntry = entries.reduce((max, cur) => {
            const curVolume = cur.weight * cur.reps * cur.sets;
            const maxVolume = max.weight * max.reps * max.sets;

            return curVolume > maxVolume ? cur : max;
        });

        //topEntryはexercise、weight, reps、sets が入ったオブジェクト
        const topExercise = topEntry.exercise;

        const savedTrainingSession = await prisma.trainingSession.create({
            data: {
                userId: userId ?? "demo",
                date: new Date(date),
                mode: mode,
                totalVolume: totalVolume,
                memo: memo ?? "",

                entries: {
                    create: entries.map((entry) => ({
                        exercise: entry.exercise,
                        weight: entry.weight,
                        reps: entry.reps,
                        sets: entry.sets,
                        volume: entry.weight * entry.reps * entry.sets, 
                        })),
                },
                analyses: {
                    create: {
                        userId: userId ?? "demo",
                        date: new Date(date),
                        score: score,
                        totalVolume,
                        topExercise,
                        summary: "トレーニング分析を保存しました。",
                        feedback: "記録しましょう"
                    },
                }

            },
            include: {
                entries: true,
                analyses: true
            },
        });
        return NextResponse.json(savedTrainingSession, { status: 201 });
    } catch(e) {
        console.error(e);
        return NextResponse.json(
            { error: "トレーニング分析保存に失敗しました。"},
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const latestAnalysis = await prisma.trainingAnalysis.findFirst({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                session: {
                    include: {
                        entries: true,
                    }
                }
            }
        });
        return NextResponse.json(latestAnalysis);
    } catch(e) {
        console.error(e);
        return NextResponse.json(
            {error: "最新のトレーニング分析取得に失敗しました。"},
            { status: 500 }
        );
    }
}