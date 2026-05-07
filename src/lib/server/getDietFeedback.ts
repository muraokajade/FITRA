import { callOpenAi } from "./openai";
import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import type { DietSummary } from "@/types/diet";

function buildDietPrompt(req: AiFeedbackRequest<DietSummary>): string {
  const { level, goal, summary } = req;

  const isDaily = summary.text.includes("1日の食事ログ");
  const imageCount = summary.images?.length ?? 0;

  const textForPrompt =
    summary.text.trim() ||
    (imageCount > 0
      ? "画像のみの食事入力です。画像から食品を推定して評価してください。"
      : "");

  const levelText =
    level === "beginner"
      ? "初心者向けに、やさしい言葉で、褒め多めで。"
      : level === "intermediate"
      ? "中級者向けに、専門用語も少し使ってOK。"
      : "上級者向けに、厳しく、具体的なアドバイスを。";

  const goalText =
    goal === "bulk"
      ? "目的は増量。筋肥大と十分なカロリー摂取を意識したコメントを。"
      : goal === "cut"
      ? "目的は減量。カロリーコントロールとPFCバランスを意識したコメントを。"
      : "目的は健康維持。バランス重視でコメントを。";

  return `
あなたはプロの栄養コーチです。

${levelText}
${goalText}

${
  isDaily
    ? "これは1日の食事ログです。全体のバランスを評価してください。"
    : "これは単体の食事です。この食事単体を評価してください。"
}

画像は ${imageCount} 枚あります。
複数画像がある場合は、それぞれ確認したうえで全体評価してください。

### 食事内容
${textForPrompt}

### 入力判定ルール
- 画像が1枚以上ある場合は、テキスト未入力でも必ず評価対象とする。
- 画像がある場合、【無効】を出してはいけない。
- 画像だけの場合は「画像からの推定評価」として返す。
- 画像から断定できない食材や量は「不足情報」として明記する。
- 【無効】にするのは、画像が0枚、かつ食べ物名・補足テキストの両方が食事として判断できない場合のみ。
- 意味不明な文字列、記号混じり、テスト入力のみの場合は【無効】とする。
- 一般的に食べ物として成立する単語は有効（例：もも、りんご、納豆）

#### 出力条件
- 日本語で回答してください。
- 最初に「認識した食事名」を1行で出力すること
- 次に「食事スコア：○点」を1行で書いてください。
- 入力された食べ物名・食事内容を必ず拾って評価してください。
- PFC、野菜量、塩分、脂質、目的との相性を具体的に評価してください。
- 良い点と気になる点を分けてください。
- 改善策は「次の1食で実行できる行動」にしてください。
- 「野菜を追加」だけで終わらせず、具体的な食材名を2〜3個出してください。
- 画像だけの場合、正確なカロリー計算はしない。
- 食材と量が推定できる範囲で「推定評価」として返してください。
- 不明な量や食材は「不足情報」として明記してください。
- 数値は断定せず、「高め・普通・低め」などの表現を使ってください。
- 食事スコア「無効」の場合、「食事名が無効の可能性があります。もう一度やり直して下さい。」

### スコア基準（厳しめ・必ず従う）
- 90〜100点：理想
- 80〜89点：かなり良い
- 70〜79点：良い
- 60〜69点：普通
- 50〜59点：やや問題あり
- 40〜49点：問題あり
- 30〜39点：かなり問題
- 0〜29点：改善必須レベル

### 強制ルール
- タンパク質が低め かつ 脂質が高め かつ 炭水化物が高め
  → 必ず35点未満
- 野菜がほぼ無い かつ タンパク質が低め
  → 必ず40点未満
- ケーキ・菓子パンなど糖質＋脂質中心の単体食
  → 必ず35点未満

### 出力フォーマット
認識した食事名：○○

食事スコア：○点

【PFC評価】
タンパク質：◯◯
脂質：◯◯
炭水化物：◯◯

【良い点】
...

【気になる点】
...

【次の一手】
...
`;
}

export async function getDietFeedback(
  req: AiFeedbackRequest<DietSummary>
): Promise<AiFeedbackResponse> {
  const prompt = buildDietPrompt(req);

  const text = await callOpenAi(
    prompt,
    req.summary.images ?? []
  );

  return {
    feedback: text,
  };
}