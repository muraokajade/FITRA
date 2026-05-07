import { NextResponse, type NextRequest } from "next/server";

import { getDietFeedback } from "@/lib/server/getDietFeedback";
import type { UserGoal, UserLevel } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const text = String(formData.get("text") ?? "");
    const domain = "diet";
    const level = String(formData.get("level") ?? "beginner") as UserLevel;
    const goal = String(formData.get("goal") ?? "health") as UserGoal;

    const images = formData
      .getAll("images")
      .filter((file): file is File => file instanceof File);

    if (!text.trim() && images.length === 0) {
      return NextResponse.json(
        { error: "食事内容または画像を入力してください。" },
        { status: 400 }
      );
    }

    const feedback = await getDietFeedback({
      summary: {
        text,
        images,
      },
      domain,
      level,
      goal,
    });

    return NextResponse.json(feedback);
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "AI分析に失敗しました。" },
      { status: 500 }
    );
  }
}