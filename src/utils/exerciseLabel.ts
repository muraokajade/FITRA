export const labelMap: Record<string, string> = {
  bench_press: "ベンチプレス",
  incline_bench_press: "インクラインベンチプレス",
  leg_press: "レッグプレス",
  squat: "スクワット",
};

export const getExerciseLabel = (key: string) => {
  return labelMap[key] || key;
};