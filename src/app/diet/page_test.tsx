"use client"
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { TempMeal } from "@/types/tempMeal";
import { UserGoal, UserLevel } from "@/types/user";
import * as React from "react";


export default function DietPage() {
    const [foodItem, setFoodItem] = React.useState("")
    const [foodItems, setFoodItems] = React.useState<string[]>([]);
    const [feedback, setFeedback] = React.useState("")
    const [pendingMeal, setPendingMeal] = React.useState<Omit<TempMeal, "id" > | null>(null)
    const [tempMeals, setTempMeals] = React.useState<TempMeal[]>([])
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [images, setImages] = React.useState<File[]>([]);
    //TODO
    const { value: input, setValue: setInput } =
    useLocalStorageState<string>("fitra:diet:lastInput", "");

    const userLevel: UserLevel = "beginner"
    const userGoal: UserGoal = "health"



    //既存の食品配列に新規食品を追加する関数
    const handleAddFoodItem = () => {
        const value = foodItem.trim();
        if(!value) return;

        setFoodItems((prev) => [...prev, foodItem])
        setFoodItem("")
    }

    //特定の食事を消す関数
    const handleRemoveFoodItem = (targetIndex: number) => {
        setFoodItems((prev) => prev.filter((_, i) => i !== targetIndex))
    }

    // foodItems + input をAIに送る
    // feedback に表示する
    // pendingMeal を作る
    const handleAnalyzeSingle = async () => {
        if(foodItems.length === 0 && !input.trim() && images.length === 0) return;

        //複数のステータス初期化
        setIsLoading(true)
        setError(null)
        setFeedback("")


        //appendする
        try {
            const formData = new FormData();

            formData.append(
                        "text",
                        `食べたもの:
                        ${foodItems.map((item) => `・${item}`).join("\n")}

                        補足:
                        ${input || "未入力"}`
                    );

            formData.append("domain", "diet");
            formData.append("level", userLevel);
            formData.append("goal", userGoal);

            images.forEach((image) => {
                formData.append("images",image);
            });

            //データ投げる
            const res = await fetch("/api/diet/feedback",{
                method:"POST",
                body: formData,
            })
            if(!res.ok) throw new Error("API error")

            const data = await res.json();

            //// APIから返ってきたfeedbackを取得（なければ空文字）
            const aiFeedback = data.feedback ?? "";
            // AIの文章から「食事名」を抽出する
            const detectedName = extractFoodName(aiFeedback);
            // 次に使う食品リストを決定する
            // ① すでにfoodItemsがあればそれを使う
            // ② なければAIが検出した食事名を使う
            // ③ それもなければ空配列にする
            const nextFoodItems = foodItems.length > 0 ? foodItems : detectedName ? [detectedName] : [];

            setFeedback(aiFeedback);
            setPendingMeal({
                foodItems: nextFoodItems,
                text: input,
                images,
                feedback: aiFeedback
            });
        
        } catch (error) {
            console.error(error)
            setError("AI分析に失敗しました。")
        } finally {
            setIsLoading(false);
        }

    };

    const extractFoodName = (text: string) => {
        const match = text.match(/(?:食事名|認識した食事名)：(.+)/);
        return match ? match[1].trim() : "";
    };

    //分析済みの食事を食事ログに追加する
    const handleAddTempMeal = () => {
        if (!feedback) return;

        setTempMeals((prev) => [
            ...prev,
            {
                id:crypto.randomUUID(),
                foodItems,
                text: input,
                images,
                feedback
            }
        ])

    }

    return (
  <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
        <h2 className="text-xl font-bold">食事入力</h2>
        <p className="mt-1 text-sm text-slate-400">
          食べたものを1品ずつ追加してから、1食として分析します。
        </p>

        <div className="mt-5 flex gap-2">
          <input
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            placeholder="例：納豆"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
          />

          <button
            type="button"
            onClick={handleAddFoodItem}
            disabled={!foodItem.trim()}
            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            追加
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="補足：量・具材・調理法など。例：ご飯大盛り、卵2個、野菜少なめ"
          className="mt-4 h-40 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
        />
      </section>

      <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
        <h2 className="text-xl font-bold">この食事</h2>

        {foodItems.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            まだ食べ物が追加されていません。
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {foodItems.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => handleRemoveFoodItem(index)}
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-100"
              >
                {item} ×
              </button>
            ))}
          </div>
        )}
      </section>
      <button
        type="button"
        onClick={handleAnalyzeSingle}
        disabled={
            isLoading ||
            (foodItems.length === 0 &&
            !input.trim() &&
            images.length === 0)
        }
        className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
        {isLoading ? "AIが分析中..." : "この食事を分析する"}
        </button>

<section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
  <h2 className="text-xl font-bold">AI結果</h2>

  {feedback ? (
    <div className="mt-4 space-y-4">
      <pre className="whitespace-pre-wrap rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm leading-7 text-slate-100">
        {feedback}
      </pre>

      <button
        type="button"
        onClick={handleAddTempMeal}
        className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
      >
        この食事を今日のログに追加
      </button>
    </div>
  ) : (
    <p className="mt-3 text-sm text-slate-400">まだAI結果はありません。</p>
  )}
</section>

<section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-xl">
  <h2 className="text-xl font-bold">今日の一時ログ</h2>

  {tempMeals.length === 0 ? (
    <p className="mt-3 text-sm text-slate-400">まだ追加されていません。</p>
  ) : (
    <div className="mt-4 space-y-3">
      {tempMeals.map((meal, index) => (
        <div
          key={meal.id}
          className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-100">
                {index + 1}食目
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {meal.foodItems.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {meal.text && (
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {meal.text}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setTempMeals((prev) =>
                  prev.filter((m) => m.id !== meal.id)
                )
              }
              className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</section>  
    </div>
  </main>
);
}