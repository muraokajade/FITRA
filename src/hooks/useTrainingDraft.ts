


/**
 * 1種目あたりの入力値
 * 空文字 "" を許可しているのは input[type=number] の未入力対応用
 */

import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export type TrainingInput = {
    weight: number | "";
    reps: number | "";
    sets : number | "";
}
/**
 * 種目キー -> 入力値 のマップ
 * 例:
 * {
 *   squat: { weight: 100, reps: 5, sets: 3 },
 *   rearRaise: { weight: "", reps: "", sets: "" }
 * }
 */

export type TrainingInputs = Record<string, TrainingInput>

/**
 * useTrainingDraft に渡す引数
 */

type useTrainingDraftArgs = {
    userId:string;
    dateKey:string;// 例: "2026-01-01"（日付単位でdraftを分離）
    selectedExerciseKeys:string[];
    fetchLatestFromDb: () => Promise<TrainingInputs | null>
}

/**
 * すべて未入力状態のオブジェクトを生成
 * 「draftが空かどうか」を判定する基準にも使う
 */
//keys：種目キーの配列
// 戻り値：TrainingInputs（＝Record<string, TrainingInput>）
//「種目キー配列 → 初期状態オブジェクト」変換器
const makeEmpty = (keys: string[]) : TrainingInputs => 
    Object.fromEntries(
        keys.map((k) => [k, {weight: "", reps: "", sets: ""}])
    )

    // const value = useMemo(() => 計算, [依存])
export function useTrainingDraft({userId, dateKey, selectedExerciseKeys, fetchLatestFromDb}: useTrainingDraftArgs) {
    const storageKey = useMemo(() => `fitra:training:draft:${userId}:${dateKey}`,[userId, dateKey])

    const {
    value: draft,
    setValue: setDraft,
    remove,
    hydrated,
    } = useLocalStorageState<TrainingInputs>(
    storageKey,
    makeEmpty(selectedExerciseKeys)
    );

    const [hydrating, setHydrating] = useState(true);

    //自動復元の犯人
    // useEffect(() => {
    //     let cancelled = false;
    //     (async () => {
    //         if (!hydrated) return;              // ★追加：localStorage読み込み完了待ち
    //         try {
    //             /**
    //              * draft が完全な初期状態かどうかを判定
    //              * （1文字でも入力されていたら false）
    //              */
    //             const isEmptyDraft =
    //             JSON.stringify(draft) ===
    //             JSON.stringify(makeEmpty(selectedExerciseKeys));

    //             // すでに入力途中があれば、DBで上書きしない
    //             if (!isEmptyDraft) return;

    //             // DBに過去データが無ければ何もしない
    //             const latest = await fetchLatestFromDb();
    //             if (!latest) return;
    //             if (cancelled) return;

    //             /**
    //              * 安全なマージ：
    //              * - 今回選ばれた種目だけを対象にする
    //              * - DBに存在しない種目は空のまま
    //              */
    //             const next: TrainingInputs = makeEmpty(selectedExerciseKeys);
    //             for (const key of selectedExerciseKeys) {
    //             if (latest[key]) {
    //                 next[key] = latest[key];
    //             }
    //             }

    //             // localStorage に反映
    //             setDraft(next);
    //         } finally {
    //             if (!cancelled) setHydrating(false);
    //         }
    //         })();
    //     return () => {
    //         cancelled = true;
    //         };
    //         // 初回だけ動けば良いので deps は最小
    //         // eslint-disable-next-line react-hooks/exhaustive-deps
    //     }, [storageKey, hydrated, draft, selectedExerciseKeys, fetchLatestFromDb, setDraft]);


    //追加
    useEffect(() => {
        if (hydrated) {
            setHydrating(false);
        }
    }, [hydrated]);

    const updateField = (exersizeKey: string, field: "weight" | "reps" | "sets", value: number | "") => {
        setDraft((prev) => ({
            ...prev,
            [exersizeKey]: {
                ...prev[exersizeKey],
                [field] :value,
            }
        }))
    }

    const resetToEmpty = () => {
        setDraft(makeEmpty(selectedExerciseKeys));
    };

    return {
        draft,
        setDraft,
        updateField,
        removeDraft: remove, // ← 名前を意味寄りに変換
        resetToEmpty,
        hydrating,
        storageKey,
    };
    

}
