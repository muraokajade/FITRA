// src/types/user.ts

// マイページで選ぶレベル
export type UserLevel = "beginner" | "intermediate" | "advanced";

// マイページで選ぶ目標
export type UserGoal = "bulk" | "cut" | "health";

// ユーザー設定（今後マイページと紐づける想定）
export type UserSetting = {
  level: UserLevel;
  goal: UserGoal;
  weightKg?: number; // 任意
  heightCm?: number; // 任意
};
