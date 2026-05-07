// src/types/ai.ts
import type { UserLevel, UserGoal } from "./user";

export type AiDomain = "training" | "diet" | "life" | "summary";
export type AiLevel = "beginner" | "intermediate" | "advanced";
export type AiGoal = "bulk" | "cut" | "health";

// 各領域の summary をジェネリクスで受けられるようにする
export type AiFeedbackRequest<TSummary> = {
  domain: AiDomain; // "training" | "diet" | "life" | "summary"
  level: UserLevel; // beginner / intermediate / advanced
  goal: UserGoal; // bulk / cut / health
  summary: TSummary; // TrainingSummary / DietSummary / LifeSummary など
};

export type AiFeedbackResponse = {
  feedback: string;
};
