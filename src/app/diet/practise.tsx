/**
 * =========================================
 * FITRA Diet AI
 * 画像 × foodItems × tempMeals バグ修正ログ
 * =========================================
 *
 * 目的：
 * あとでVSCode上で復習するための単体メモ。
 * 実装用ではなく、時系列で「何が壊れて、なぜ直したか」を残す。
 */

/**
 * =========================================
 * Case1
 * foodItems が画像認識を潰した問題
 * =========================================
 *
 * 症状：
 * foodItems: ラーメン
 * image: カレー + ナン
 *
 * AI結果：
 * 認識した食事名：ラーメン
 *
 * 画像は送信されているのに、AIがfoodItemsだけで判断していた。
 */

const prev_handleAnalyzeSingle_case1 = async () => {
  const analysisFoodItems = ["ラーメン"];
  const images = [new File(["dummy"], "curry.png", { type: "image/png" })];

  const formData = new FormData();

  /**
   * 修正前：
   * foodItems の情報だけが強く、画像を見る指示が弱い。
   */
  formData.append(
    "text",
    `
foodItems:
${analysisFoodItems.join(",")}
`
  );

  images.forEach((image) => {
    formData.append("images", image);
  });

  await fetch("/api/diet/feedback", {
    method: "POST",
    body: formData,
  });
};

/**
 * 問題点：
 *
 * - 画像ファイル自体は formData に入っていた
 * - しかし text 側の指示が foodItems 中心だった
 * - GPT-4o-mini が「入力テキストだけで判断してよい」と寄った
 */

const next_handleAnalyzeSingle_case1 = async () => {
  const analysisFoodItems = ["ラーメン"];
  const images = [new File(["dummy"], "curry.png", { type: "image/png" })];

  const formData = new FormData();

  /**
   * 修正後：
   * foodItems と画像を統合して評価するように明示。
   */
  formData.append(
    "text",
    `これは1食分の食事評価です。

【入力された食品名】
${
  analysisFoodItems.length > 0
    ? analysisFoodItems.map((item) => `・${item}`).join("\n")
    : "未入力"
}

【画像】
${images.length}枚

【評価ルール】
- 食品名、補足、画像をすべて評価対象にしてください。
- 画像がある場合、画像内の食品を必ず確認してください。
- 食品名だけで評価を完結させないでください。
- 画像だけで評価を完結させないでください。
- 入力食品名と画像内食品が異なる場合、両方を認識した食事名に含めてください。
- 認識した食事名には、入力食品名・補足・画像から推定した食品を統合して出力してください。
- 存在しない食品は推測しすぎないでください。
- 皿、容器、背景は食品として扱わないでください。`
  );

  images.forEach((image) => {
    formData.append("images", image);
  });

  await fetch("/api/diet/feedback", {
    method: "POST",
    body: formData,
  });
};

/**
 * 修正結果：
 *
 * foodItems: ラーメン
 * image: カレー + ナン
 *
 * AI結果：
 * 認識した食事名：ラーメン、カレー、ナン
 */

/**
 * =========================================
 * Case2
 * tempMeals に画像認識結果が残らない問題
 * =========================================
 *
 * 症状：
 *
 * 単食分析では、
 * 認識した食事名：カレー、ナン、リンゴ
 *
 * しかし総合評価では、
 * 認識した食事名：ラーメン、ラーメン、カレー
 *
 * のように画像由来の食事名が崩れた。
 */

/**
 * 原因：
 *
 * AIのfeedbackには画像認識結果が存在していた。
 * しかし tempMeals.foodItems に保存していなかった。
 *
 * つまり、
 *
 * AIが認識した
 * ↓
 * feedbackには出た
 * ↓
 * でもstateに保存していない
 * ↓
 * 総合評価で消える
 *
 * という状態だった。
 */

const prev_buildNextFoodItems_case2 = (
  analysisFoodItems: string[],
  detectedName: string
) => {
  /**
   * 修正前：
   * analysisFoodItems が存在すると detectedName を無視する。
   *
   * foodItems: ラーメン
   * detectedName: カレー、ナン、リンゴ
   *
   * 結果：
   * ["ラーメン"] だけになる。
   */
  const nextFoodItems =
    analysisFoodItems.length > 0
      ? analysisFoodItems
      : detectedName
      ? [detectedName]
      : [];

  return nextFoodItems;
};

const next_buildNextFoodItems_case2 = (
  analysisFoodItems: string[],
  detectedName: string
) => {
  /**
   * 修正後：
   * 入力された foodItems と、
   * AIが認識した detectedName を統合する。
   *
   * foodItems: ラーメン
   * detectedName: カレー、ナン、リンゴ
   *
   * 結果：
   * ["ラーメン", "カレー", "ナン", "リンゴ"]
   */
  const nextFoodItems = detectedName
    ? Array.from(
        new Set([
          ...analysisFoodItems,
          ...detectedName
            .split(/[、,]/)
            .map((item) => item.trim())
            .filter(Boolean),
        ])
      )
    : analysisFoodItems;

  return nextFoodItems;
};

/**
 * 実装位置：
 *
 * handleAnalyzeSingle の中。
 *
 * const data = await res.json();
 * const aiFeedback = data.feedback ?? "";
 * const detectedName = extractFoodName(aiFeedback);
 *
 * の直後で nextFoodItems を作る。
 */

const next_handleAnalyzeSingle_foodItemsPersistence_case2 = async () => {
  const analysisFoodItems = ["ラーメン"];
  const aiFeedback = `
認識した食事名：カレー、ナン、リンゴ

食事スコア：70点
`;

  const extractFoodName = (text: string) => {
    const match = text.match(/(?:食事名|認識した食事名)：(.+)/);
    return match ? match[1].trim() : "";
  };

  const detectedName = extractFoodName(aiFeedback);

  const nextFoodItems = detectedName
    ? Array.from(
        new Set([
          ...analysisFoodItems,
          ...detectedName
            .split(/[、,]/)
            .map((item) => item.trim())
            .filter(Boolean),
        ])
      )
    : analysisFoodItems;

  /**
   * 修正後の pendingMeal。
   *
   * ここで画像認識由来の食品名を
   * tempMeals に残せる形にする。
   */
  const nextPendingMeal = {
    foodItems: nextFoodItems,
    text: "",
    images: [],
    feedback: aiFeedback,
  };

  return nextPendingMeal;
};

/**
 * 修正結果：
 *
 * tempMeals.foodItems に
 *
 * - ラーメン
 * - カレー
 * - ナン
 * - リンゴ
 *
 * が残る。
 *
 * そのため、総合評価時にも画像由来の食事名が消えない。
 */

/**
 * =========================================
 * Case3
 * AI無効入力が tempMeals / DB まで入る問題
 * =========================================
 *
 * 症状：
 *
 * AI結果：
 *
 * 認識した食事名：qxqxqxqx
 * 食事スコア：無効
 *
 * なのに tempMeals に追加できた。
 * そのままDB保存まで通る可能性があった。
 */

const prev_handleAddTempMeal_case3 = (pendingMeal: { feedback: string }) => {
  /**
   * 修正前：
   * feedback の先頭だけ見ていた。
   */
  const isInvalid = pendingMeal.feedback.startsWith("【無効】");

  if (isInvalid) {
    return "追加不可";
  }

  return "追加可能";
};

/**
 * 問題点：
 *
 * 実際のAI返却は、
 *
 * 認識した食事名：qxqxqxqx
 * 食事スコア：無効
 *
 * のように「【無効】」から始まらないことがある。
 *
 * そのため startsWith("【無効】") では検知できない。
 */

const next_isInvalidFeedbackText_case3 = (text: string) => {
  /**
   * 修正後：
   * 文中に「食事スコア：無効」が含まれていれば無効扱い。
   */
  return (
    text.includes("【無効】") ||
    text.includes("食事スコア：無効") ||
    text.includes("食事スコア: 無効")
  );
};

const next_handleAddTempMeal_case3 = (pendingMeal: { feedback: string }) => {
  const isInvalid = next_isInvalidFeedbackText_case3(pendingMeal.feedback);

  if (isInvalid) {
    return "追加不可";
  }

  return "追加可能";
};

/**
 * 修正結果：
 *
 * AIが無効判定したものは、
 *
 * pendingMeal
 * ↓
 * tempMeals
 * ↓
 * DB
 *
 * へ進めない。
 */

/**
 * =========================================
 * Case4
 * 総合評価で画像情報が消える問題
 * =========================================
 *
 * 症状：
 *
 * 単食分析：
 * 認識した食事名：カレー、ナン、リンゴ
 *
 * tempMeal：
 * カレー、ナン、リンゴ までは保持
 *
 * 総合評価：
 * ラーメン、ラーメン、カレー
 *
 * のように崩れる。
 */

/**
 * 原因：
 *
 * 総合評価では画像を再送していない。
 * そのため、総合評価で使える情報は tempMeals に保存された情報だけ。
 *
 * つまり総合評価時に必要なのは、
 *
 * - feedback
 * - foodItems
 * - text
 *
 * のどこかに画像由来の認識結果を残しておくこと。
 */

const prev_buildDailyText_case4 = (
  tempMeals: Array<{
    foodItems: string[];
    text: string;
    feedback: string;
  }>
) => {
  /**
   * 修正前：
   * foodItems と text だけで dailyText を作っていた。
   *
   * foodItems に画像由来の食品が残っていない場合、
   * 総合評価では画像情報が消える。
   */
  const dailyText = tempMeals
    .map(
      (meal, index) =>
        `【${index + 1}食目】
食べたもの:
${meal.foodItems.map((item) => `・${item}`).join("\n")}
補足: ${meal.text || "なし"}`
    )
    .join("\n\n");

  return dailyText;
};

const next_buildDailyText_case4 = (
  tempMeals: Array<{
    foodItems: string[];
    text: string;
    feedback: string;
  }>
) => {
  /**
   * 修正後：
   * 基本は foodItems に統合済みの食事名を使う。
   *
   * 重要：
   * Case2で detectedName を foodItems に統合しておくことで、
   * dailyText でも画像由来の食事名を扱える。
   */
  const dailyText = tempMeals
    .map(
      (meal, index) =>
        `【${index + 1}食目】
食べたもの:
${meal.foodItems.map((item) => `・${item}`).join("\n")}
補足: ${meal.text || "なし"}`
    )
    .join("\n\n");

  return dailyText;
};

/**
 * 修正結果：
 *
 * 総合評価は画像を直接見ていない。
 * しかし、単食分析時に画像由来の食品名を
 * tempMeals.foodItems に保存しているため、
 * 総合評価でも情報が残る。
 */

/**
 * =========================================
 * 最終まとめ
 * =========================================
 *
 * 今回の最大の学び：
 *
 * 「AIが認識した」だけでは足りない。
 *
 * AI認識結果
 * ↓
 * stateへ正規化
 * ↓
 * tempMealsへ保存
 * ↓
 * 総合評価へ利用
 * ↓
 * DB保存
 *
 * まで繋げて初めて、アプリの仕様として成立する。
 *
 * 特に画像AIでは、
 *
 * feedbackには出ている
 * でもstateに残っていない
 *
 * というバグが起きやすい。
 */