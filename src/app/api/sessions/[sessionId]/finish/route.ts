//  /api/sessions/[sessionId]/finish

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rebuildTrainingAnalysis } from "@/lib/training/rebuildTrainingAnalysis";
import { error, log } from "console";

export async function PUT(
    req: NextRequest,
    context: {params: Promise<{sessionId: string}>}
) {
    try {
        const { sessionId } = await context.params;
        const sessionIdNum = Number(sessionId);

        if(Number.isNaN(sessionIdNum)) {
            return NextResponse.json(
                {error: "sesssionIdが不正です。"},
                { status: 400 },
            )
        }

        /**
         * LIVEの親セッションを取得する。
         * WorkoutSession は LIVE側の保存元。
         */
        const currentSession = await prisma.workoutSession.findUnique({
            where: { id: sessionIdNum },
        });

        if(!currentSession) {
            return NextResponse.json(
                { error: "sessionが存在しません。" },
                { status: 400 }
            );
        }


        /**
         * LIVE中に記録されたセットログを取得する。
         * ExerciseLog は LIVE側の生データ。
         */
        const logs = await prisma.exerciseLog.findMany({
            where: {sessionId: sessionIdNum},
            orderBy: { setNumber: "asc" },
        });

        if(logs.length === 0) {
            return NextResponse.json(
                { error: "LIVEログが存在しません。" },
                { status: 400 },
            )
        }


        const totalVolume = logs.reduce((sum: number, log: any) => {
            return sum + log.volume;
        }, 0);

        //TODO "DONEにするの意味"
        const session = await prisma.workoutSession.update({
            where: {id: sessionIdNum},
            data: {
                status: "DONE",
                endedAt: new Date(),
                totalVolume,
            }
        });

        /**
         * 現状Dashboardは userId = "demo" を見ているため、
         * LIVE由来のTrainingAnalysisも demo に寄せる。
         *
         * 認証実装後は currentSession.userId と統一する。
         */
        const dashboardUserId = "demo";

        /**
         * LIVEセッションの開始日時をTrainingSessionの日付として使う。
         */
        const trainingDate = currentSession.startedAt;

        /**
         * ExerciseLogは1セットごとのデータ。
         * TrainingEntryは種目ごとのデータ。
         *
         * そのため、exerciseName単位で集約する。
         */ //TODO

        const entryMap = new Map<
            string,
            {
                exercise: string;
                weight: number;
                reps: number;
                sets: number;
                volume: number;
            }
            >();
        
        //TODO
        for(const log of logs) {
            const current = entryMap.get(log.exerciseName) ?? {
                exercise: log.exerciseName,
                weight: log.weight,
                reps: 0,
                sets: 0,
                volume: 0,

            }
            /**
             * 暫定仕様：
             * weight = 最大重量
             * reps = 合計reps
             * sets = セット数
             * volume = 合計volume
             */
            current.weight = Math.max(current.weight, log.weight);
            current.reps += log.reps;
            current.sets += 1;
            current.volume += log.volume;

            entryMap.set(log.exerciseName, current);
        }

        const entries = Array.from(entryMap.values());

        /**
         * LIVEデータをDashboard用のTrainingSession / TrainingEntryへ変換保存する。
         *
         * 既存のWorkoutSession / ExerciseLogは壊さない。
         * Dashboardが読むTrainingAnalysis生成のために、別途TrainingSessionを作る。
         */
        const trainingSession = await prisma.trainingSession.create({
            data: {
                userId: dashboardUserId,
                date: trainingDate,
                mode: "LIVE",
                totalVolume,
                memo: `LIVE sesssionId ${sessionIdNum}`,
                entries: {
                    create: entries.map((entry) => ({
                        exercise: entry.exercise,
                        weight: entry.weight,
                        reps: entry.reps,
                        sets: entry.sets,
                        volume: entry.volume,
                    })),
                }
            },
            include: {
                entries: true,
            }
        });

        /**
         * TrainingSession / TrainingEntry を元にTrainingAnalysisを作る。
         *
         * DashboardはTrainingAnalysisだけを読むため、
         * ここでLIVE結果をDashboardへ接続する。
         */
        const analysis = await rebuildTrainingAnalysis({
            userId: dashboardUserId,
            date: trainingDate,
            feedback: "LIVEトレーニング結果を元に分析を更新しました。"
        });

        return NextResponse.json(
            {
                sessionId: session.id,
                status: session.status,
                totalVolume: session.totalVolume,
                trainingSession,
                analysis,
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


// TODO:
// 現在はWorkoutSession.idとTrainingSessionを厳密に紐づけるカラムがないため、
// 同じLIVE sessionIdを複数回finishするとTrainingSessionが重複作成される可能性がある。
// 将来的にはTrainingSessionに sourceType / sourceId を追加し、
// @@unique([sourceType, sourceId]) で重複防止する。

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