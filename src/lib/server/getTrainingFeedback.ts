// lib/server/getAiFeedback.ts

import { callOpenAi } from "./openai";
import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import type { TrainingSummary } from "@/types/training";

// ----------------------------------------------------------
// トレーニング専用のプロンプト生成
// （diet / life はあとで別関数として足していけばOK）
// ----------------------------------------------------------
function buildTrainingPrompt(req: AiFeedbackRequest<TrainingSummary>): string {
  const { level, goal, summary } = req;

  const levelText =
    level === "beginner"
      ? "初心者向けに、やさしい言葉で、褒め多めで。"
      : level === "intermediate"
      ? "中級者向けに、専門用語も少し使ってOK。"
      : "上級者向けに、厳しく、具体的なアドバイスを。";

  const goalText =
    goal === "bulk"
      ? "目的は増量。筋肥大を意識したコメントを。"
      : goal === "cut"
      ? "目的は減量。消費カロリーや食事量も意識したコメントを。"
      : "目的は健康維持。バランス重視でコメントを。";

  return `
あなたはプロのパーソナルトレーナーです。

${levelText}
${goalText}

### 今日のトレーニングデータ
- 総ボリューム: ${summary.totalVolume} kg
- 総セット数: ${summary.totalSets} セット
- 総レップ数: ${summary.totalReps} レップ

### 種目一覧
${summary.rows
  .map(
    (r) =>
      `・${r.name}: ${r.weight}kg × ${r.reps}rep × ${r.sets}set（${r.volume}kg）`
  )
  .join("\n")}

### 出力条件
- 日本語で回答してください。
- 3文の短い文章で、今日のトレーニングの総評を書いてください。
- 良かった点と、次に意識するとよいポイントを含めてください。
- 箇条書きは使わず、文章で書いてください。

### NG例（絶対に出力しない）
- 「継続が大事です」
- 「楽しんで続けましょう」
- 「バランスよく」
- 「素晴らしい」「いいですね」などの評価表現は禁止
- 精神論（集中、気持ちなど）のみで終わるのは禁止

### 禁止強化
- 評価表現を禁止（例：素晴らしい、いいですね）
- 精神論を禁止（集中、気持ち、頑張るなど）
- ユーザーを励ますだけの文章は禁止
`;
}

// ----------------------------------------------------------
// AI 呼び出し（トレーニング専用）
// ----------------------------------------------------------
export async function getAiFeedback(
  req: AiFeedbackRequest<TrainingSummary>
): Promise<AiFeedbackResponse> {
  // いまは training 専用なので domain は見ない
  const prompt = buildTrainingPrompt(req);
  const text = await callOpenAi(prompt);

  return { feedback: text };
}
