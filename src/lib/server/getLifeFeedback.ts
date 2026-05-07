// lib/server/getLifeFeedback.ts
import { LifeSummary } from "@/types/life";
import { callOpenAi } from "./openai";
import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";

function buildLifePrompt(req: AiFeedbackRequest<LifeSummary>): string {
  const { level, goal, summary } = req;

  const levelText =
    level === "beginner"
      ? "初心者向けに、やさしい言葉で。"
      : level === "intermediate"
      ? "中級者向けに、事実ベースで。"
      : "上級者向けに、遠慮なく厳しめに。";

  const goalText =
    goal === "bulk"
      ? "目的は増量。疲労管理と回復を重視してください。"
      : goal === "cut"
      ? "目的は減量。回復不足によるパフォーマンス低下にも注意してください。"
      : "目的は健康維持。長期的に続く生活リズムを重視してください。";

  return `
あなたはプロの生活習慣アドバイザーです。

${levelText}
${goalText}

### 今日の生活データ
- 睡眠時間: ${summary.sleep}時間
- 疲労度: ${summary.fatigue}/10
- ストレス: ${summary.stress}/10

### 出力条件
- 回復スコア（0〜100）
- 今日のコンディションの総評
- 明日のワンポイントアドバイス

日本語で、2〜4文程度でまとめてください。
`;
}

export async function getLifeFeedback(
  req: AiFeedbackRequest<LifeSummary>
): Promise<AiFeedbackResponse> {
  const prompt = buildLifePrompt(req);
  const text = await callOpenAi(prompt);
  return { feedback: text };
}
