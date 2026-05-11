// rebuildTrainingAnalysis(userId, date)
//
// 目的:
// Trainingの生データを元に、統合Dashboard用のTrainingAnalysisを作成または更新する。
//
// 引数:
// userId: 対象ユーザー
// date: 対象日
//
// 処理:
// 1. userId/date に一致するTrainingの生データを取得する
// 2. LIVE/NORMALの重複があればLIVEを優先する
// 3. 有効なentriesを作る
// 4. totalVolumeを計算する
// 5. scoreを仮計算する
// 6. topExerciseを決める
// 7. TrainingAnalysisをupsertする
//
// 戻り値:
// 作成または更新されたTrainingAnalysis

import { prisma } from "@/lib/prisma";

type RebuildTrainingAnalysisParams = {
    userId: string;
    date: Date;
    feedback?: string;
}

export async function rebuildTrainingAnalysis({ 
    userId, date 
}: RebuildTrainingAnalysisParams ) {
    // 1. 対象日のTraining生データを取得する
    const start = new Date(date);
    start.setHours(0, 0, 0, 0 );

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    // sessions は TrainingSession[]。
    // include: { entries: true } を指定しているので、
    // 各 session の中に entries: TrainingEntry[] が入っている。
    const sessions = await prisma.trainingSession.findMany({
        where: {
            userId,
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            entries: true,
        }
    });

    const allEntries = sessions.flatMap((session) => {
        return session.entries.map((entry) =>{
            return {
                ...entry,
                mode: session.mode,
                sessionId: session.id,
                sessionDate: session.date
            }
        })
    });

    if(allEntries.length === 0) {
        return null;
    }
    const totalVolume = allEntries.reduce((sum, entry) => {
        return sum + entry.weight * entry.reps * entry.sets;
    }, 0);

    const score = Math.min(100, Math.round(totalVolume / 100));

    const topEntry = allEntries.reduce((max, entry) => {
        const maxVolume = max.weight * max.reps * max.sets;
        const entryVolume = entry.weight * entry.reps * entry.sets;

        return entryVolume > maxVolume ? entry : max;
    });

    const latestSession = sessions[0];

    const analysis = await prisma.trainingAnalysis.create({
        data: {
            userId,
            date,
            sessionId: latestSession.id,
            score,
            totalVolume,
            topExercise: topEntry.exercise,
            summary: "トレーニング分析を保存しました。",
            // feedback
        }
    })
    

    return analysis;
  // 2. LIVE/NORMALの重複を整理する
  // 3. totalVolumeを計算する
  // 4. scoreを計算する
  // 5. topExerciseを決める
  // 6. TrainingAnalysisをupsertする
}