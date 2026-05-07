import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

/**
 * =====================================
 * 型定義
 * =====================================
 */

/**
 * 1種目ぶんの入力値
 * - number : 入力済み
 * - ""     : input[type=number] 未入力状態
 */
export type TrainingInput = {
  weight: number | "";
  reps: number | "";
  sets: number | "";
};

/**
 * 種目キー -> TrainingInput のマップ
 *
 * 例:
 * {
 *   squat: { weight: 100, reps: 5, sets: 3 },
 *   bench: { weight: "", reps: "", sets: "" }
 * }
 */
export type TrainingInputs = Record<string, TrainingInput>;

/**
 * useTrainingDraft に渡す引数
 */
type useTrainingDraftArgs = {
  userId: string;                    // ユーザー識別子
  dateKey: string;                   // 日付キー（例: "2026-01-01"）
  selectedTrainingKeys: string[];    // 今回入力対象の種目キー一覧
  fetchLatestFromDb: () => Promise<TrainingInputs | null>;
};

/**
 * =====================================
 * 空の draft を作る関数
 * =====================================
 *
 * 【目的】
 * - 選択された種目キー配列から
 * - すべて未入力状態の TrainingInputs を生成する
 *
 * 【用途】
 * - localStorage 初期値
 * - 全リセット
 * - 「draft が空かどうか」の判定基準
 */
const makeEmpty = (keys: string[]): TrainingInputs =>
  Object.fromEntries(
    keys.map((k) => [
      k,
      {
        weight: "",
        reps: "",
        sets: "",
      },
    ])
  );

/**
 * =====================================
 * useTrainingDraft 本体
 * =====================================
 *
 * 【この Hook がやること】
 * 1. トレーニング入力の下書き（draft）を管理する
 * 2. localStorage に自動保存する
 * 3. 初回だけ DB の最新データで補完する
 *
 * 【超重要ルール】
 * - ユーザーが入力途中の draft は絶対に上書きしない
 */
export function useTrainingDraft({
  userId,
  dateKey,
  selectedTrainingKeys,
  fetchLatestFromDb,
}: useTrainingDraftArgs) {

  /**
   * ---------------------------------
   * localStorage 用キー生成
   * ---------------------------------
   *
   * ユーザー × 日付 ごとに
   * 完全に別の下書きを持たせる
   */
  const storageKey = useMemo(
    () => `fitra:training:draft:${userId}:${dateKey}`,
    [userId, dateKey]
  );

  /**
   * ---------------------------------
   * localStorage と同期した state
   * ---------------------------------
   *
   * useLocalStorageState が返す value を
   * 「draft」という名前で受け取っている
   *
   * draft の正体 = TrainingInputs
   */
  const {
    value: draft,         // 現在の下書きデータ
    setValue: setDraft,   // 下書きを更新する関数
    remove,               // localStorage ごと削除
    hydrated,             // localStorage 復元完了フラグ
  } = useLocalStorageState<TrainingInputs>(
    storageKey,
    makeEmpty(selectedTrainingKeys)
  );

  /**
   * ---------------------------------
   * DB 復元中フラグ
   * ---------------------------------
   *
   * hydrated（localStorage復元）とは別
   * 「DB から最新を反映中かどうか」
   */
  const [hydrating, setHydrating] = useState(true);

  /**
   * ---------------------------------
   * 初回のみ：DB から最新データを復元
   * ---------------------------------
   *
   * 条件：
   * - draft が完全に空のときのみ
   * - 入力途中なら絶対に上書きしない
   */
  useEffect(() => {
    // 非同期処理中に unmount されたか判定するためのフラグ
    let cancelled = false;

    (async () => {
      try {
        /**
         * 現在の draft が
         * 「完全な未入力状態」かどうかを判定
         *
         * JSON.stringify を使う理由：
         * - オブジェクト同士は === で比較できないため
         */
        const isEmptyDraft =
          JSON.stringify(draft) ===
          JSON.stringify(makeEmpty(selectedTrainingKeys));

        // すでに入力途中なら DB で上書きしない
        if (!isEmptyDraft) return;

        // DB から最新データを取得
        const latest = await fetchLatestFromDb();

        // DB にデータが無ければ何もしない
        if (!latest) return;

        // effect 実行中に unmount されていたら中断
        if (cancelled) return;

        /**
         * 安全なマージ処理
         *
         * 1. まず「今回選択されている種目だけ」の空オブジェクトを作る
         * 2. DB に存在する種目だけ値をコピーする
         */
        const next: TrainingInputs = makeEmpty(selectedTrainingKeys);

        for (const key of selectedTrainingKeys) {
          if (latest[key]) {
            next[key] = latest[key];
          }
        }

        // draft を更新（localStorage にも反映される）
        setDraft(next);

      } finally {
        // DB 復元処理が完了したことを通知
        if (!cancelled) setHydrating(false);
      }
    })();

    /**
     * クリーンアップ関数
     * - useEffect 実行中にアンマウントされた場合
     *   setState を防ぐ
     */
    return () => {
      cancelled = true;
    };

    // storageKey が変わったときのみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /**
   * ---------------------------------
   * 1フィールドだけ更新する関数
   * ---------------------------------
   *
   * やりたいこと：
   * - 特定の種目
   * - 特定のフィールド
   * - その値だけを安全に更新
   *
   * ※ state を直接書き換えず、
   *   新しいオブジェクトを作る
   */
  type TrainingField = keyof TrainingInput;

  const updateField = (
    trainingKey: string,
    field: TrainingField,
    value: number | ""
  ) => {
    setDraft((prev) => ({
      // 全種目を一旦コピー
      ...prev,

      // 対象の種目だけ上書き
      [trainingKey]: {
        // その種目の中身をコピー
        ...prev[trainingKey],

        // 指定フィールドだけ変更
        [field]: value,
      },
    }));
  };

  /**
   * ---------------------------------
   * 全リセット
   * ---------------------------------
   *
   * 選択されている種目を
   * すべて未入力状態に戻す
   */
  const resetToEmpty = () => {
    setDraft(makeEmpty(selectedTrainingKeys));
  };

  /**
   * ---------------------------------
   * Hook の戻り値
   * ---------------------------------
   */
  return {
    draft,               // 現在の下書き
    setDraft,            // draft を丸ごと置き換える
    updateField,         // 1フィールド更新
    removeDraft: remove, // localStorage ごと削除
    resetToEmpty,        // 全リセット
    hydrating,           // DB 復元中フラグ
    hydrated,            // localStorage 復元完了フラグ
    storageKey,          // localStorage キー（デバッグ用）
  };
}
