/**
 * 【目的】
 * localStorage と同期した state を管理するための共通 Hook
 *
 * 【この Hook がやること】
 * - key を元に localStorage から値を読み込む
 * - state が変わったら localStorage に保存する
 * - 初回読み込みが終わったかどうかを判定できるようにする
 *
 * 【ジェネリクス T】
 * - 保存する値の型
 * - JSON.stringify / parse 可能な前提
 *
 * 【引数】
 * key:
 *   - localStorage に保存するキー
 *   - key が変わったら別データとして扱う
 *
 * initial:
 *   - localStorage に何も無い場合の初期値
 *
 * 【内部 state】
 * value:
 *   - 実際に画面で使う値
 *
 * hydrated:
 *   - localStorage の読み込みが完了したかどうか
 *   - false の間は「まだ復元途中」
 ***/

import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T){
    const [value, setValue] = useState<T>(initial)
    const [hydrated, setHydrated] = useState(false)
    
    /*
 * 【初回 useEffect】
 * - localStorage から値を取得する
 * - 存在すれば JSON.parse して state に反映
 * - 成功・失敗に関わらず hydrated = true にする
 */ useEffect(() => {
    try {
        const raw = localStorage.getItem(key)
        if(raw != null) setValue(JSON.parse(raw) as T)
    }
    catch {

    }finally{
        setHydrated(true)
    }
 },[key])
     /*
    * 【保存用 useEffect】
    * - hydrated が true のときのみ実行
    * - value が変わるたびに localStorage に保存
    * - 初回復元前に上書きしないためのガード
    */
    useEffect(() => {
        if(!hydrated) return;
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch {

        }

    },[key,value,hydrated])

    const remove = () => {
        localStorage.removeItem(key)
        setValue(initial)
    } 

    return {value, setValue, hydrated}





}










/*
 * 【remove 関数】
 * - localStorage から該当キーを削除
 * - state も initial に戻す
 *
 * 【戻り値】
 * - value: 現在の値
 * - setValue: 通常の setState
 * - remove: localStorage ごと削除
 * - hydrated: 復元完了フラグ
 */
