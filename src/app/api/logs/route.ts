// POST
// 1. sessionId を受け取る
// 2. exerciseName, weight, reps, setNumber を受け取る
// 3. volume = weight * reps
// 4. ExerciseLog作成
// 5. { log, volume } を返す

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { sessionId, exerciseName, weight, reps, setNumber, memo } = body;

        if (
            sessionId == null ||
            !exerciseName ||
            Number(weight) <= 0 ||
            Number(reps) <= 0 ||
            setNumber == null
            ) {
            return NextResponse.json(
                { error: "部位・種目・重量・repsを正しく入力してください。" },
                { status: 400 }
            );
        }

        const volume = weight * reps;

        const log = await prisma.exerciseLog.create({
            data: {
                sessionId,
                exerciseName,
                weight,
                reps,
                setNumber,
                volume,
                createdAt: new Date(),
                memo
            },
        });

        return NextResponse.json({
            logId: log.id,
            volume: log.volume,
        },
            {status: 201}
        );

    } catch(error) {
        console.error("log作成エラー", error);

        return NextResponse.json(
            {error: "ログ作成に失敗しました"},
            {status: 500}
        )
    }
}