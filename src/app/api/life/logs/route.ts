import { NextResponse } from "next/server";
import { use } from "react";
import { prisma } from "@/lib/prisma";

type LifeLogRequestBody = {
  userId?: string;
  date: string;
  sleepHours: number;
  fatigue: number;
  stress: number;
  memo?: string;
};

type LifeScoreResult = {
    score: number;
    label: string;
    sleepPoint: number;
    fatiguePoint: number;
    stressPoint: number;
    summary: string;
}

function calculateLifeScore(
  { sleepHours, fatigue, stress }: 
  { sleepHours: number; fatigue: number; stress: number }
): LifeScoreResult {
  // 睡眠は7時間以上で満点40点
  const sleepPoint = Math.min(sleepHours / 6, 1) * 40;

  // 疲労は低いほど高得点。0なら満点30点、10なら0点
  const fatiguePoint = ((10 - fatigue) / 10) * 30;

  // ストレスも低いほど高得点。0なら満点30点、10なら0点
  const stressPoint = ((10 - stress) / 10) * 30;

  // 3項目を合計して100点満点にする
  const score = Math.round(sleepPoint + fatiguePoint + stressPoint);

  const label =
    score >= 60
      ? "攻めてもよい状態"
      : score >= 40
        ? "調整しながら進める"
        : score >= 20
          ? "回復を優先する"
          : "今日はかなり低調";

  const summary =
    score >= 60
      ? "睡眠・疲労・ストレスのバランスが良く、回復状態は良好です。"
      : score >= 40
        ? "大きく崩れてはいませんが、疲労やストレスに注意しながら進める状態です。"
        : score >= 20
          ? "回復状態が弱めです。今日は負荷を上げすぎず、整える判断が合いそうです。"
          : "回復状態がかなり低めです。休養と最低限の活動を優先する状態です。";
    return {
    score,
    label,
    sleepPoint,
    fatiguePoint,
    stressPoint,
    summary,
  };
    
}


export async function POST(req: Request) {
    try {
        //Partial不明
        const body = (await req.json()) as Partial<LifeLogRequestBody>;

        const { userId, date, sleepHours, fatigue, stress, memo } = body;
        
        if(!date) {
            return NextResponse.json(
                { error: "dateは必須です。" },
                { status: 400 }
            )
        }
        // APIには外部から何が来るか分からないので、必須数値を実行時にも確認する
        if (
        typeof sleepHours !== "number" ||
        typeof fatigue !== "number" ||
        typeof stress !== "number"
        ) {
        return NextResponse.json(
            { error: "sleepHours, fatigue, stress は必須です。" },
            { status: 400 }
        );
        }

        // 範囲チェック
        if (sleepHours < 0 || sleepHours > 24) {
        return NextResponse.json(
            { error: "sleepHours は0〜24の範囲で入力してください。" },
            { status: 400 }
        );
        }

        if (fatigue < 0 || fatigue > 10) {
        return NextResponse.json(
            { error: "fatigue は0〜10の範囲で入力してください。" },
            { status: 400 }
        );
        }

        if (stress < 0 || stress > 10) {
        return NextResponse.json(
            { error: "stress は0〜10の範囲で入力してください。" },
            { status: 400 }
        );
        }

        const lifeScore = calculateLifeScore({ sleepHours, fatigue, stress });

        const savedLifeLog = await prisma.lifeLog.create({
            data: {
                userId: userId ?? "demo",
                date: new Date(date),
                sleepHours,
                fatigue,
                stress,
                memo: memo ?? null,
                lifeAnalyses: {
                create: {
                    userId: userId ?? "demo",
                    date: new Date(date),
                    score: lifeScore.score,
                    label: lifeScore.label,
                    sleepPoint: lifeScore.sleepPoint,
                    fatiguePoint: lifeScore.fatiguePoint,
                    stressPoint: lifeScore.stressPoint,
                    summary: lifeScore.summary,
                    feedback: `生活スコア：${lifeScore.score}点\n判定：${lifeScore.label}\n${lifeScore.summary}`,
                },
                },
            },
            include: {
                lifeAnalyses: true,
            },
            });


        return NextResponse.json(
            {
                message: "LifeログAPIの入り口確認OK",
                received: {
                    userId: userId ?? "demo",
                    date,
                    sleepHours,
                    fatigue,
                    stress,
                    memo: memo ?? null,
                },
                analysis: lifeScore,
            },
            { status: 200 }
        );
    } catch(e) {
        console.error(e);

        return NextResponse.json(
            { error: "Lifeログ受け取り失敗" },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        const latestLifeAnalysis = await prisma.lifeAnalysis.findFirst({
            orderBy: { date: "desc"}, include: { lifeLog: true }
        });
        return NextResponse.json(
            {
                lifeAnalysis: latestLifeAnalysis,

            },
            {status: 200 }
        )
    } catch(e) {
        console.error(e);
        
        return NextResponse.json(
            {error: "Life分析失敗"},
            { status: 500 }
        );
    }
}