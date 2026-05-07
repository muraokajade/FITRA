export const labelMap: Record<string, string> = {
  bench_press: "ベンチプレス",
  incline_bench_press: "インクラインベンチプレス",
};

export const getExerciseLabel = (key: string) => {
  return labelMap[key] || key;
};