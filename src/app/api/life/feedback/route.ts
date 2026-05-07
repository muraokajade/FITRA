// src/app/api/life/feedback/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import type { LifeSummary } from "@/types/life";
import { getLifeFeedback } from "@/lib/server/getLifeFeedback";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiFeedbackRequest<LifeSummary>;

    // domain が life 以外ならフォールバック
    if (body.domain !== "life") {
      const res: AiFeedbackResponse = {
        feedback: "不正な domain が指定されています。（life 以外）",
      };
      return NextResponse.json(res, { status: 200 });
    }

    const result = await getLifeFeedback(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("life feedback error:", error);

    // フォールバック：AIが落ちていてもアプリは落とさない
    const fallback: AiFeedbackResponse = {
      feedback:
        "今日は生活AIコーチが少し混雑しているようです。\n" +
        "睡眠時間・疲労・ストレスのバランスを見ながら、無理のないペースで過ごしていきましょう。",
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}
