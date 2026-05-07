import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import type { TrainingSummary } from "@/types/training";
import { getAiFeedback } from "@/lib/server/getTrainingFeedback";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiFeedbackRequest<TrainingSummary>;

    // domain のチェック
    if (body.domain !== "training") {
      return NextResponse.json(
        { feedback: "不正な domain です（training 以外が指定されました）" },
        { status: 200 }
      );
    }

    // AI ロジック呼び出し
    const result: AiFeedbackResponse = await getAiFeedback(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("training feedback error:", error);

    // フォールバック（AI落ちてもアプリが落ちない）
    const fallback: AiFeedbackResponse = {
      feedback:
        "今日はAIコーチが混雑しているようです。\n総ボリュームは良い感じなので、無理せず継続していきましょう！",
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
