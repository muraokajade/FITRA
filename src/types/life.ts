// src/types/life.ts
export type LifeInput = {
  sleepHours: number;
  fatigue: number;
  stress: number;
  note?: string;
};

export type LifeSummary = {
  sleep: number;
  fatigue: number;
  stress: number;
};

export type LifeFeedbackRequest = {
  summary: LifeSummary;
  level: "beginner" | "intermediate" | "advanced";
  goal: "bulk" | "cut" | "health";
};

export type LifeFeedbackResponse = {
  feedback: string;
};
