// src/app/api/life/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLifeFeedback } from "@/lib/server/getLifeFeedback";
import type { AiFeedbackRequest } from "@/types/ai";
import type { LifeSummary } from "@/types/life";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if(!body || body.domain !== "life" || !body.summary) {
      return NextResponse.json(
        { feedback: "Life分析に必要なデータが不足しています。" },
        { status: 400},
      )
    }

    const result = await getLifeFeedback(body);

    return NextResponse.json(result);

  } catch(error) {
    console.error("life feedback api error:", error);

    return NextResponse.json(
      { feedback: "AIによるLife分析の取得に失敗しました。" },
      { status: 500 }
  )}

}