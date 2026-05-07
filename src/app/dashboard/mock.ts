export type TodoItem = {
  id: number;
  label: string;
  done?: boolean;
};
export type Improvement = {
  title: string;
  details: string[];
};
export type TodaySummary = {
  overallScore: number;
  dietScore: number;
  trainingScore: number;
  lifeScore: number;
};
export const mockTodaySummary: TodaySummary = {
  overallScore: 78,
  dietScore: 82,
  trainingScore: 75,
  lifeScore: 72,
};
export type Area = "diet" | "training" | "life";

export type HistoryItem = {
  id: number;
  date: string; // "2025-11-23"
  area: Area;
  title: string;
  score: number | null;
};
export const mockHistory: HistoryItem[] = [
  {
    id: 1,
    date: "2025-11-22",
    area: "diet",
    title: "夕食：鶏むね肉とサラダボウル",
    score: 86,
  },
  {
    id: 2,
    date: "2025-11-22",
    area: "training",
    title: "上半身プッシュメニュー（ベンチ＋ショルダープレス）",
    score: 80,
  },
  {
    id: 3,
    date: "2025-11-21",
    area: "life",
    title: "睡眠6.5h／仕事ストレスやや高め",
    score: 70,
  },
];
export const mockYesterdayImprovement: Improvement = {
  title: "昨日の改善ポイント（AI要約）",
  details: [
    "夕食の脂質量がやや多かったため、次回は揚げ物を一品減らすと◎",
    "胸・背中メニューのボリューム差が大きいので、背中種目を1種目追加推奨",
    "就寝時間が遅く、睡眠時間が 6 時間未満の日が続いている",
  ],
};

export const mockTodaySuggestion: Improvement = {
  title: "今日のおすすめアクション",
  details: [
    "昼食に「高タンパク＋低脂質」のメインを1品追加する",
    "トレーニングはベンチプレスのボリュームを維持しつつ、ローイング種目を追加",
    "24:00 までにベッドに入り、7時間以上の睡眠を確保する",
  ],
};

export const mockTodos: TodoItem[] = [
  {
    id: 1,
    label: "今日の食事を /diet に入力してスコアを確認する",
  },
  {
    id: 2,
    label: "メインのトレーニングメニューを /training に入力して負荷チェック",
  },
  {
    id: 3,
    label: "就寝・起床時間や疲労感を /life に入力してコンディション診断",
  },
];