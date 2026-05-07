import { NextResponse } from "next/server";
import { getLiveTrainingAdvice } from "@/lib/server/getLiveTrainingAdvice"; 
import { getLiveTrainingChat } from "@/lib/server/getLiveTrainingChat";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await getLiveTrainingChat({
      trainingPart: body.trainingPart,
      intensityMode: body.intensityMode,
      exerciseName: body.exerciseName,
      setNumber: Number(body.setNumber),
      message: body.message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        feedback:
          "今はAI応答が不安定。呼吸を整えて、無理せず次に進みましょう。",
      },
      { status: 500 }
    );
  }
}