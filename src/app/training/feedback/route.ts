import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import type { TrainingSummary } from "@/types/training";
import type { AiFeedbackRequest, AiFeedbackResponse } from "@/types/ai";
import { getAiFeedback } from "@/lib/server/getTrainingFeedback";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AiFeedbackRequest<TrainingSummary>;

    if (body.domain !== "training") {
      return NextResponse.json({ message: "invalid domain" }, { status: 404 });
    }

    const result: AiFeedbackResponse = await getAiFeedback(body);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error("training feedback error", e);
    return NextResponse.json({ status: 500 });
  }
}
