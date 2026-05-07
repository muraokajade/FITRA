"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type TrainingRecord = {
  id: string;
  date: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  volume: number;
};

const nf = new Intl.NumberFormat("ja-JP");

export default function TrainingHistoryPage() {
  const router = useRouter();
  const [records, setRecords] = React.useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("/api/training/records");
        const data = await res.json();

        setRecords(data.records ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const groupedRecords = React.useMemo(() => {
    return records.reduce<Record<string, TrainingRecord[]>>((acc, record) => {
      if (!acc[record.date]) acc[record.date] = [];
      acc[record.date].push(record);
      return acc;
    }, {});
  }, [records]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Button
            type="button"
            onClick={() => router.push("/training")}
            className="mb-4 border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
          >
            ← ダッシュボードへ戻る
          </Button>

          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            FITRA / TRAINING HISTORY
          </p>
          <h1 className="mt-2 text-3xl font-bold">トレーニング履歴</h1>
          <p className="mt-2 text-sm text-slate-400">
            日付ごとに、過去の種目・重量・回数・セット・ボリュームを確認できます。
          </p>
        </div>

        {isLoading && (
          <Card className="border-slate-700 bg-slate-900/80">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400">読み込み中...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && records.length === 0 && (
          <Card className="border-slate-700 bg-slate-900/80">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400">
                まだトレーニング履歴がありません。
              </p>
              <Button
                type="button"
                onClick={() => router.push("/training/step1")}
                className="mt-4"
              >
                記録を開始する
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([date, items]) => {
            const totalVolume = items.reduce((sum, i) => sum + i.volume, 0);
            const totalSets = items.reduce((sum, i) => sum + i.sets, 0);
            const totalReps = items.reduce(
              (sum, i) => sum + i.reps * i.sets,
              0
            );
            const avgWeight =
              items.length > 0
                ? items.reduce((sum, i) => sum + i.weight, 0) / items.length
                : 0;
            const maxWeight =
              items.length > 0 ? Math.max(...items.map((i) => i.weight)) : 0;

            return (
              <Card
                key={date}
                className="border-slate-700 bg-slate-900/80"
              >
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-sky-300">{date}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {items.length}種目の記録
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">総Volume</p>
                      <p className="mt-1 font-bold text-sky-300">
                        {nf.format(totalVolume)}kg
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">総セット</p>
                      <p className="mt-1 font-bold">{nf.format(totalSets)}</p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">総レップ</p>
                      <p className="mt-1 font-bold">{nf.format(totalReps)}</p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">平均重量</p>
                      <p className="mt-1 font-bold">
                        {avgWeight.toFixed(1)}kg
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                      <p className="text-xs text-slate-400">最大重量</p>
                      <p className="mt-1 font-bold text-emerald-300">
                        {maxWeight}kg
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-700 bg-slate-950/70 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">{item.exercise}</p>
                            <p className="mt-1 text-sm text-slate-400">
                              {item.weight}kg × {item.reps}rep × {item.sets}set
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-400">Volume</p>
                            <p className="text-lg font-bold">
                              {nf.format(item.volume)}kg
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}