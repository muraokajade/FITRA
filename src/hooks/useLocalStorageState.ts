import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T){
    const [value, setValue] = useState<T>(initial);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if(raw != null) setValue(JSON.parse(raw) as T)
        } catch {
        
        }finally {
            setHydrated(true)
        }
    },[key])

    useEffect(() => {
        if(!hydrated) return;
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch{

        }
    },[key, value, hydrated])

      // ★ 追加
    const remove = () => {
        localStorage.removeItem(key);
        setValue(initial); // 状態も初期化
    };

    return {value, remove, setValue, hydrated} as const;
}