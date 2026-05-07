import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

/**
 * 【目的】
 * トレーニング入力の「下書き（draft）」を管理する Hook
 * - localStorage に一時保存
 * - 初回のみ DB の最新データで補完
 *
 * 【扱うデータ構造】
 * TrainingInput:
 *   - 1種目分の入力値
 *   - input[type=number] の未入力対応で "" を許可
 */
    export type TrainingInput = {
        weight: number | "";
        reps: number | "";
        sets: number | ""
    }
/*
 * TrainingInputs:
 *   - 種目キー -> TrainingInput のマップ
 *
 * 
 *///
    export type TrainingInputs = Record<string, TrainingInput>


/*
 * 【引数】
 * userId:
 *   - ユーザー単位で draft を分離するため
 *
 * dateKey:
 *   - 日付単位で draft を分けるため（例: 2026-01-01）
 *
 * selectedExerciseKeys:
 *   - 今回選択されている種目キー一覧
 *   - draft の形を決定する基準
 *
 * fetchLatestFromDb:
 *   - DB から過去の最新トレーニングを取得する関数
 *
 */
    type userTrainingDraftArgs = {
        userId:string;
        dateKey:string;
        selectedExerciseKeys: string[]
        fetchLatestFromDb: () => Promise<TrainingInputs | null>
    }

    /**
     * すべて未入力状態のオブジェクトを生成
     * 「draftが空かどうか」を判定する基準にも使う
     */
    //keys：種目キーの配列
    // 戻り値：TrainingInputs（＝Record<string, TrainingInput>）
    //「種目キー配列 → 初期状態オブジェクト」変換器
    const makeEmpty = (keys:string[]) : TrainingInputs => 
        Object.fromEntries(
            keys.map((k) => [k, {weight: "", reps:"", sets: ""}])
        )
    export function useTrainingDraft({
    userId,
    dateKey,
    selectedExerciseKeys,
    fetchLatestFromDb,
    }: userTrainingDraftArgs) {

  // ✅ localStorage のキー文字列を作る
  // 「ユーザーごと」「日付ごと」に保存場所を分けたいので
  // userId と dateKey を埋め込んだキーを作っている
  //
  // useMemo は「依存が変わるまで同じ文字列を再利用」するため
  // （毎回同じ計算をしない＆依存が変わったときだけキーが変わる）
  const storageKey = useMemo(
    () => `fitra:training:draft:${userId}:${dateKey}`,
    [userId, dateKey]
  );

  // ✅ ここが「draft が生まれる場所」
  //
  // useLocalStorageState<TrainingInputs>() は
  // localStorage と同期した state を返す custom hook
  //
  // 返ってくるオブジェクトは { value, setValue, remove, hydrated } みたいな形
  //
  // その value を「draft」という名前に付け替えて受け取っている
  //   value: draft  ← これが「draftの正体」
  const {
    value: draft,      // ⭐️ localStorage同期 state（中身は TrainingInputs）
    setValue: setDraft,// ⭐️ draft を更新する関数（setStateと同じ役割）
    remove,            // ⭐️ localStorage上のキーを削除する関数
    hydrated,          // ⭐️ localStorageから復元が完了したか（今回のコードでは未使用）
  } = useLocalStorageState<TrainingInputs>(
    storageKey,                 // localStorage のキー
    makeEmpty(selectedExerciseKeys) // localStorageに何も無いときの初期値
  );

  // ✅ DBからの復元処理が「終わったかどうか」を管理するフラグ
  // hydrated（localStorage復元）とは別物
  // これは「DBから最新を引っ張って draft に入れる処理」が終わったかどうか
  const [hydrating, setHydrating] = useState(true);

  // ✅ 初回（storageKeyが変わったタイミング）だけ
  // 「draftが空ならDBの最新を入れてあげる」処理を走らせる
  useEffect(() => {

    // ✅ 非同期処理が終わる前にコンポーネントが消えた場合に
    // setState して警告になるのを防ぐためのフラグ
    let cancelled = false;

    // ✅ useEffectの中では async を直接つけられないので
    // IIFE（即時実行関数）で async を包んでいる
    (async () => {
      try {
        /**
         * ✅ 今の draft が「完全な初期状態」かを判定
         *
         * makeEmpty(selectedExerciseKeys) は
         * 「選ばれた種目を全部 空欄にした TrainingInputs」を作る
         *
         * それと draft が完全一致してたら
         * 「ユーザーはまだ何も入力してない（空）」とみなす
         *
         * JSON.stringify を使う理由:
         * オブジェクト同士を === で比較しても false だから
         * （参照が違うため）
         */
        const isEmptyDraft =
          JSON.stringify(draft) ===
          JSON.stringify(makeEmpty(selectedExerciseKeys));

        // ✅ すでにユーザーが入力途中なら、DBの最新で上書きしたら事故るので止める
        if (!isEmptyDraft) return;

        // ✅ DBから最新データを取ってくる（過去データ）
        const latest = await fetchLatestFromDb();

        // ✅ DBに何も無いなら終了（初回ユーザーなど）
        if (!latest) return;

        // ✅ 途中で unmount されてたら終了（setStateしない）
        if (cancelled) return;

        /**
         * ✅ 安全にマージして next を作る
         *
         * next は「今回選択されている種目だけ」を持つ TrainingInputs にしたい
         * だからまず空の状態を作って…
         */
        const next: TrainingInputs = makeEmpty(selectedExerciseKeys);

        /**
         * ✅ selectedExerciseKeys を1個ずつ見て、
         * DB側にその種目が存在するなら上書きする
         *
         * 例:
         * selectedExerciseKeys = ["squat","bench"]
         * latest = { squat:{...}, deadlift:{...} }
         *
         * → next は squat は入るが deadlift は無視される
         */
        for (const key of selectedExerciseKeys) {
          if (latest[key]) {
            next[key] = latest[key];
          }
        }

        // ✅ next を draft としてセットする
        // → これにより localStorage にも保存される（useLocalStorageState 側の仕組みで）
        setDraft(next);

      } finally {
        // ✅ 成功でも失敗でも「DB復元処理は終わった」扱いにする
        if (!cancelled) setHydrating(false);
      }
    })();

    // ✅ useEffect のクリーンアップ
    // storageKeyが変わる / unmount される時に cancelled=true にして
    // 非同期の setState を止める
    return () => {
      cancelled = true;
    };

    // ✅ deps を storageKey のみにしてる
    // 「ユーザー・日付が変わった時だけ」復元ロジックを回したいから
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // ✅ 1フィールドだけ更新するための関数
  // exerciseKey の中の weight/reps/sets のどれかだけ差し替える
  const updateField = (
    exersizeKey: string,
    field: "weight" | "reps" | "sets",
    value: number | ""
  ) => {
    setDraft((prev) => ({
      ...prev, // 既存の全種目をまずコピー
      [exersizeKey]: {
        ...prev[exersizeKey], // その種目の既存値をコピー
        [field]: value,       // 指定フィールドだけ上書き
      },
    }));
  };

  // ✅ 全種目を空欄に戻す（localStorageにも反映される）
  const resetToEmpty = () => {
    setDraft(makeEmpty(selectedExerciseKeys));
  };

  // ✅ この Hook を使う側（UIコンポーネント）に返すもの
  return {
    draft,                 // いまの入力途中データ
    setDraft,              // draft を丸ごと更新したいとき用
    updateField,           // 1項目更新用
    removeDraft: remove,   // localStorageキーごと削除
    resetToEmpty,          // 空欄に戻す
    hydrating,             // DB復元処理中かどうか
    storageKey,            // 今使ってる localStorage のキー（デバッグ用にも便利）
  };
}
