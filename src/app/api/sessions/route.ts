
// POST
// 1. request body から userId, mode を受け取る
// 2. status = "ACTIVE"
// 3. startedAt = new Date()
// 4. DBにWorkoutSession作成
// 5. { sessionId, status, startedAt } を返す

// Next.jsのリクエスト/レスポンスユーティリティ
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function POST(req: NextRequest){
    try {
        const body = await req.json();
        const { userId, mode } = body;

        if(!userId || !mode ) {
            return NextResponse.json(
                {error: "userIdとmodeは必須です"},
                {status: 400}
            )
        }
        const session = await prisma.workoutSession.create({
            data: {
                userId,
                mode,
                status:"ACTIVE",
                startedAt: new Date(),
            }
        });

        return NextResponse.json(
            {
                sessionId: session.id,
                status: session.status,
                startedAt: session.startedAt,
            },
            { status: 201 }
        );
    } catch(error) {
        console.error("Session作成エラー:", error);

        return NextResponse.json(
            {error: "Session作成に失敗しました。"},
            {status: 500 }
        )
    }


}

