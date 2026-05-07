import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    context: {params: Promise<{sessionId: string}>}
) {
    try {
        const {sessionId} = await context.params;
        const sessionIdNum = Number(sessionId)

        const logs = await prisma.exerciseLog.findMany({
            where: {sessionId: sessionIdNum},
        });

        const totalVolume = logs.reduce((sum: number, log: any) => {
            return sum + log.volume;
        }, 0);

        const session = await prisma.workoutSession.update({
            where: {id: sessionIdNum},
            data: {
                status: "DONE",
                endedAt: new Date(),
                totalVolume,
            }
        });

        return NextResponse.json(
            {
                sessionId: session.id,
                status: session.status,
                totalVolume: session.totalVolume,
            },
            {status: 200}
        );

    } catch(error){
        console.error("Sesssion終了エラー:", error);

        return NextResponse.json(
            { error: "Session終了に失敗しました。"},
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    context: { params : Promise<{sessionId: string}>}
) {
    try {
        const { sessionId } = await context.params;
        const sessionIdNum = Number(sessionId);

        if(Number.isNaN(sessionIdNum)) {
            return NextResponse.json(
                { error: "sessionIdが不正です"},
                { status: 400 }
            );
        }

        const session = await prisma.workoutSession.findUnique({
            where: { id: sessionIdNum },
        });
        if(!session) {
            return NextResponse.json(
                {error: "sessionが存在しません"},
                {status: 404 }
            );
        }
        const logs = await prisma.exerciseLog.findMany({
            where: { sessionId: sessionIdNum},
            orderBy: { setNumber: "asc"},
        });

        return NextResponse.json(
            {
                session,
                logs,
            },
            { status: 200 }
        );
    } catch(error) {
        console.error("Sesssion取得エラー", error);

        return NextResponse.json(
            {error: "Sesssion取得失敗"},
            {status: 500}
        );
    }
}