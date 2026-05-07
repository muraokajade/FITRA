// types/training.ts

// Step2入力（文字列）
export type TrainingRowRaw = {
  name: string;
  weight: string;
  reps: string;
  sets: string;
};

// 画面表示・AI用（計算済み / userId・createdAt不要）
export type TrainingRowCalc = {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
};

// DB保存・取得用（Prismaの実体に寄せるならこっち）
export type TrainingRowDb = TrainingRowCalc & {
  id: string;
  userId: string;      // ← DBがTEXTなのでstring
  recordId: string;
  createdAt: string;   // API返却でISO文字列に統一
};

// 1日分レコード（localStorage用：まずはCalcで十分）
export type TrainingRecord = {
  id: string;
  date: string;
  rows: TrainingRowCalc[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
};

// AIに渡すまとめ
export type TrainingSummary = {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  rows: TrainingRowCalc[];
};

export type TrainingFeedbackRequest = TrainingSummary;

export type TrainingFeedbackResponse = {
  feedback: string;
};
