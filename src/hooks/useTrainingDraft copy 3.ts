import { useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "./useLocalStorageState";

export type TrainingInput = {
  weight: number | "";
  reps: number | "";
  sets: number | "";
};

export type TrainingInputs = Record<string, TrainingInput>

type userTrainingDraftArgs = {
    userId:string;
    dateKey:string;
    selectedTrainingKeys:string[];
    fetchLatestFromDb: () => Promise<TrainingInputs | null>;
}

const makeEmpty = (keys:string[]): TrainingInputs => Object.fromEntries(
    keys.map((k) => [
        k, {weight: "", reps:"", sets: ""}
    ])
)
export function useTrainingDraft({
    userId,
    dateKey,
    selectedTrainingKeys,
    fetchLatestFromDb
}: userTrainingDraftArgs) {


    const storageKey = useMemo(() => `fitra:training:draft:${userId}:${dateKey}`,[
        userId, dateKey
    ])

    const {
        value:draft,
        setValue:setDraft,
        remove,
        hydrated
    } = useLocalStorageState<TrainingInputs>(storageKey, makeEmpty(selectedTrainingKeys))

    const[hydrating, setHydraiting] = useState(true)

    useEffect(() => {
        let cancelled = false;

        (async () =>  {
            try{

                const isEmptyDraft = JSON.stringify(draft) === JSON.stringify(makeEmpty(selectedTrainingKeys))

                if (!isEmptyDraft) return
                const latest = await fetchLatestFromDb();

                if(!latest) return;

                if(cancelled) return;
                const next: TrainingInputs = makeEmpty(selectedTrainingKeys);

                for(const key of selectedTrainingKeys) {
                    if (latest[key]) {
                        next[key] = latest[key]
                    }
                }
                setDraft(next)
            } finally {
                if(!cancelled) setHydraiting(false)
            }

        })();

        return () => {
            cancelled = true;
        }

    },[storageKey]);
    /**
   * 1フィールドだけ更新するためのヘルパー
   *
   * exersizeKey: 種目キー（例: "squat"）
   * field      : "weight" | "reps" | "sets"
   * value      : number | ""（未入力対応）
   */
    type TrainingFeild = keyof TrainingInput;

    const updateField = (
        TrainingKey: string,
        field: TrainingFeild,
        value:number | ""
    ) => {
        setDraft((prev) =>({
            ...prev,
            [TrainingKey]:{
                ...prev[TrainingKey],
                [field]:value,
            }
        }))
    }
    
    const resetToEmpty = () => {
    setDraft(makeEmpty(selectedTrainingKeys));
  };

  return {
    draft,
    setDraft,
    updateField,
    removeDraft: remove,
    resetToEmpty,
    hydrating,
    storageKey,
    hydrated, // ←必要ならUIで「復元完了後に描画」みたいに使える
  };



}