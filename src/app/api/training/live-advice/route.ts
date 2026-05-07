import { NextResponse } from "next/server";
import { getLiveTrainingAdvice } from "@/lib/server/getLiveTrainingAdvice";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await getLiveTrainingAdvice({
      trainingPart: body.trainingPart,
      intensityMode: body.intensityMode,
      exerciseName: body.exerciseName,
      weight: Number(body.weight),
      reps: Number(body.reps),
      setNumber: Number(body.setNumber),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { feedback: "今はAIアドバイスを取得できませんでした。フォーム優先で次セットいきましょう。" },
      { status: 500 }
    );
  }
}