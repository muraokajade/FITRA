"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import LoadingLink from "@/components/LoadingLink";
import type { UserLevel, UserGoal } from "@/types/user";
import type { TempMeal } from "@/types/tempMeal";

type ResultMode = "single" | "daily" | null;

const INVALID_PREFIX = "【無効】";

export default function DietPage() {
  const userLevel: UserLevel = "beginner";
  const userGoal: UserGoal = "health";

  const { value: input, setValue: setInput } =
    useLocalStorageState<string>("fitra:diet:lastInput", "");

  const { value: foodItems, setValue: setFoodItems } =
    useLocalStorageState<string[]>("fitra:diet:foodItems", []);

  const { value: tempMeals, setValue: setTempMeals } =
    useLocalStorageState<TempMeal[]>("fitra:diet:tempMeals", []);

  const { value: pendingMeal, setValue: setPendingMeal } =
    useLocalStorageState<Omit<TempMeal, "id"> | null>(
      "fitra:diet:pendingMeal",
      null
    );

  const { value: feedback, setValue: setFeedback } =
    useLocalStorageState<string>("fitra:diet:feedback", "");

  const { value: resultMode, setValue: setResultMode } =
    useLocalStorageState<ResultMode>("fitra:diet:resultMode", null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [images, setImages] = React.useState<File[]>([]);
  const [foodItem, setFoodItem] = React.useState("");
  const [viewingMealId, setViewingMealId] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const trimmedFoodItem = foodItem.trim();

  const hasFoodTextChar = (text: string) => {
    return /[a-zA-Z0-9ぁ-んァ-ン一-龥ー]/.test(text);
  };

  const isInvalidFoodText = (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) return true;
    if (/^(.)\1{3,}$/.test(trimmed)) return true;
    if (!hasFoodTextChar(trimmed)) return true;
    if (/^[@＠#＃]+/.test(trimmed)) return true;
    if (/[：；;:@#$%^&*_=+<>?]/.test(trimmed)) return true;
    if (/^[a-zA-Z]{1,3}$/.test(trimmed)) return true;

    return false;
  };

  const isValidFoodItem = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (isInvalidFoodText(trimmed)) return false;
    if (!hasFoodTextChar(trimmed)) return false;
    return true;
  };

  const getValidInputText = () => {
    const value = input.trim();
    if (!value) return "";
    if (isInvalidFoodText(value)) return "";
    return value;
  };

  const getAnalysisFoodItems = () => {
    const validItems = foodItems.filter(isValidFoodItem);

    if (isValidFoodItem(trimmedFoodItem)) {
      validItems.push(trimmedFoodItem);
    }

    return Array.from(new Set(validItems));
  };

  const isInvalidFeedbackText = (text: string) => {
    return (
      text.includes(INVALID_PREFIX) ||
      text.includes("食事スコア：無効") ||
      text.includes("食事スコア: 無効")
    );
  };

  const canAnalyzeSingle =
    getAnalysisFoodItems().length > 0 ||
    getValidInputText().length > 0 ||
    images.length > 0;

  const canAnalyzeDaily = tempMeals.length > 0;

  const resetSingleInput = () => {
    setFoodItem("");
    setFoodItems([]);
    setInput("");
    setImages([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetAnalysisResult = () => {
    setFeedback("");
    setPendingMeal(null);
    setResultMode(null);
    setError(null);
  };

  const handleClear = () => {
    resetSingleInput();
    resetAnalysisResult();
    setViewingMealId(null);
  };

  const handleRedo = () => {
    resetAnalysisResult();
    setViewingMealId(null);
  };

  const handleAddFoodItem = () => {
    const value = trimmedFoodItem;

    if (!isValidFoodItem(value)) {
      setError("食品名として判定できる内容を入力してください。");
      return;
    }

    setError(null);
    setFoodItems((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setFoodItem("");
  };

  const handleRemoveFoodItem = (targetIndex: number) => {
    setFoodItems((prev) => prev.filter((_, index) => index !== targetIndex));
  };

  const handleAddImages = (files: File[]) => {
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("画像ファイルを選択してください。");
      return;
    }

    setError(null);
    setImages((prev) => [...prev, ...imageFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (targetIndex: number) => {
    setImages((prev) => prev.filter((_, index) => index !== targetIndex));
  };

  const extractFoodName = (text: string) => {
    const match = text.match(/(?:食事名|認識した食事名)：(.+)/);
    return match ? match[1].trim() : "";
  };

  const handleAnalyzeSingle = async () => {
    const analysisFoodItems = getAnalysisFoodItems();
    const validInputText = getValidInputText();

    if (
      analysisFoodItems.length === 0 &&
      !validInputText &&
      images.length === 0
    ) {
      setError("食事として判定できる内容を入力してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback("");
    setPendingMeal(null);
    setResultMode(null);
    setViewingMealId(null);

    try {
      const formData = new FormData();

      formData.append(
        "text",
        `これは1食分の食事評価です。

【入力された食品名】
${
  analysisFoodItems.length > 0
    ? analysisFoodItems.map((item) => `・${item}`).join("\n")
    : "未入力"
}

【補足】
${validInputText || "未入力"}

【画像】
${images.length}枚

【評価ルール】
- 食品名、補足、画像をすべて評価対象にしてください。
- 画像がある場合、画像内の食品を必ず確認してください。
- 食品名だけで評価を完結させないでください。
- 画像だけで評価を完結させないでください。
- 入力食品名と画像内食品が異なる場合、認識した食事名には必ず両方を含めてください。
- 認識した食事名には、入力食品名・補足・画像から推定した食品を統合して出力してください。
- 例：入力食品名が「梨」、画像が「リンゴ」の場合、認識した食事名は「梨、リンゴ」としてください。
- 存在しない食品は推測しすぎないでください。
- 皿、容器、背景は食品として扱わないでください。`
      );

      formData.append("domain", "diet");
      formData.append("level", userLevel);
      formData.append("goal", userGoal);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch("/api/diet/feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const aiFeedback = data.feedback ?? "";
      const detectedName = extractFoodName(aiFeedback);

      const nextFoodItems =
        detectedName
          ? Array.from(
              new Set([
                ...analysisFoodItems,
                ...detectedName
                  .split(/[、,]/)
                  .map((item) => item.trim())
                  .filter(Boolean),
              ])
            )
          : analysisFoodItems.length > 0
          ? analysisFoodItems
          : images.length > 0
          ? ["画像からの食事"]
          : [];

      const nextPendingMeal: Omit<TempMeal, "id"> = {
        foodItems: nextFoodItems,
        text: validInputText,
        images: [],
        feedback: aiFeedback,
      };

      setFeedback(aiFeedback);
      setResultMode("single");
      setPendingMeal(nextPendingMeal);
    } catch (e) {
      console.error(e);
      setError("AI分析に失敗しました。時間をおいて再度お試しください。");
      setResultMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTempMeal = () => {
    if (!pendingMeal) return;
    if (viewingMealId) return;

    if (isInvalidFeedbackText(pendingMeal.feedback)) {
      alert("この入力は食事として追加できません。");
      return;
    }

    setTempMeals((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...pendingMeal,
      },
    ]);

    resetSingleInput();
    resetAnalysisResult();
  };

  const handleAnalyzeDaily = async () => {
    if (!canAnalyzeDaily) return;

    setIsLoading(true);
    setError(null);
    setFeedback("");
    setPendingMeal(null);
    setResultMode(null);
    setViewingMealId(null);

    try {
      const dailyText = tempMeals
        .map(
          (meal, index) =>
            `【${index + 1}食目】
食べたもの:
${meal.foodItems.map((item) => `・${item}`).join("\n")}
補足: ${meal.text || "なし"}`
        )
        .join("\n\n");

      const formData = new FormData();

      formData.append(
        "text",
        `これは1日の食事ログです。
単発評価の平均ではなく、1日の総合評価として、PFC・野菜量・塩分・食事全体の偏りを評価してください。
食事名はtempMealsの内容をそのまま維持し、勝手に朝食・昼食・夕食へ変換しないでください。

${dailyText}`
      );

      formData.append("domain", "diet");
      formData.append("level", userLevel);
      formData.append("goal", userGoal);

      const res = await fetch("/api/diet/feedback", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      setFeedback(data.feedback ?? "");
      setResultMode("daily");
    } catch (e) {
      console.error(e);
      setError("今日の総合評価に失敗しました。");
      setResultMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDaily = async () => {
    if (tempMeals.length === 0 || !feedback || resultMode !== "daily") return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/diet/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "demo",
          date: new Date().toISOString().slice(0, 10),
          meals: tempMeals.map((meal) => ({
            foodItems: meal.foodItems,
            text: meal.text,
            feedback: meal.feedback,
          })),
          dailyFeedback: feedback,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.log("SAVE_ERROR_STATUS:", res.status);
        console.log("SAVE_ERROR_BODY:", errorBody);
        throw new Error("API error");
      }

      setTempMeals([]);
      setPendingMeal(null);
      setFoodItems([]);
      setInput("");
      setFeedback("");
      setResultMode(null);
      setImages([]);
      setError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("今日の食事ログを保存しました。");
    } catch (e) {
      console.error(e);
      setError("DB保存APIが未実装、または保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  const isInvalidFeedback = isInvalidFeedbackText(feedback);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-400">
              FITRA / DIET AI
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              今日の食事をAIで分析
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              食べたものを1品ずつ積み上げて、1食単位・1日単位でAIが評価します。
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-slate-600 bg-white/5 px-4 py-2 text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            ← ホーム
          </Link>
        </header>

        <section className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl shadow-black/30">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">食事入力</h2>
              <p className="mt-1 text-xs text-slate-400">
                納豆・ご飯・卵のように1品ずつ追加してから分析します。
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white"
            >
              クリア
            </button>
          </div>

          <label
            htmlFor="imageUpload"
            className="mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-950/30 px-4 py-6 text-sm text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-900/40"
          >
            📸 食事写真をアップロード
          </label>

          <input
            ref={fileInputRef}
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleAddImages(Array.from(e.target.files ?? []));
            }}
          />

          {images.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <div key={`${image.name}-${image.lastModified}-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="h-28 w-full rounded-xl object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white hover:bg-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <input
              value={foodItem}
              onChange={(e) => {
                setFoodItem(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  handleAddFoodItem();
                }
              }}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/40"
              placeholder="食べたもの：例 納豆"
            />

            <button
              type="button"
              onClick={handleAddFoodItem}
              disabled={!isValidFoodItem(trimmedFoodItem)}
              className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              追加
            </button>
          </div>

          {foodItems.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {foodItems.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => handleRemoveFoodItem(index)}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 hover:bg-red-500/20 hover:text-red-100"
                >
                  {item} ×
                </button>
              ))}
            </div>
          )}

          <textarea
            className="h-40 w-full resize-none rounded-2xl border border-slate-600 bg-slate-950/50 p-4 text-sm leading-7 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="補足：量・具材・調理法など。例：ご飯大盛り、卵2個、野菜少なめ"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              食品：{getAnalysisFoodItems().length}件 / 入力文字数：
              {input.length}文字 / 画像：{images.length}枚
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAnalyzeSingle}
                disabled={isLoading || !canAnalyzeSingle}
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading && resultMode !== "daily"
                  ? "AIが分析中..."
                  : "この食事を分析する"}
              </button>

              <button
                type="button"
                onClick={handleAnalyzeDaily}
                disabled={isLoading || !canAnalyzeDaily}
                className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                今日の総合評価
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 shadow-2xl shadow-black/30">
          <div>
            <h2 className="text-lg font-semibold">AI分析結果</h2>
            <p className="mt-1 text-xs text-slate-400">
              1食分の評価、または今日の総合評価が表示されます。
            </p>
          </div>

          <div className="mt-4">
            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-5 text-sm text-blue-100">
                AIが食事内容を分析しています...
              </div>
            )}

            {feedback && !error && !isLoading && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
                  {feedback.replace(/\*\*/g, "")}
                </div>

                <div className="mt-4 flex gap-3">
                  {resultMode === "single" &&
                    pendingMeal &&
                    !isInvalidFeedback && (
                      <button
                        type="button"
                        onClick={handleAddTempMeal}
                        className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
                      >
                        この食事を今日のログに追加
                      </button>
                    )}

                  {resultMode === "daily" && (
                    <button
                      type="button"
                      onClick={handleSaveDaily}
                      disabled={isSaving}
                      className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? "保存中..." : "DBに保存する"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleRedo}
                    className="flex-1 rounded-xl bg-slate-700 py-3 text-sm text-slate-100 hover:bg-slate-600"
                  >
                    やり直す
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-yellow-500/30 bg-yellow-950/20 p-6">
          <h2 className="text-lg font-semibold">今日の一時ログ（未保存）</h2>

          {tempMeals.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">
              まだ追加されていません。
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {tempMeals.map((meal, index) => (
                <div
                  key={meal.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400">
                        {index + 1}食目
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {meal.foodItems.map((item, itemIndex) => (
                          <span
                            key={`${item}-${itemIndex}`}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setTempMeals((prev) =>
                          prev.filter((m) => m.id !== meal.id)
                        )
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      削除
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setViewingMealId((prev) =>
                        prev === meal.id ? null : meal.id
                      )
                    }
                    className="mt-3 text-xs text-blue-300 hover:text-blue-200"
                  >
                    {viewingMealId === meal.id ? "閉じる" : "評価を見る"}
                  </button>

                  {viewingMealId === meal.id && (
                    <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-xs leading-6 text-slate-200">
                      {meal.feedback.replace(/\*\*/g, "")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}