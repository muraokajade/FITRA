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
 *
 * TrainingInputs:
 *   - 種目キー -> TrainingInput のマップ
 *
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
 * 【localStorage key 設計】
 * - userId + dateKey を含めて完全に一意にする
 * - useMemo で安定させる
 *
 * 【makeEmpty 関数】
 * - 選択された種目キー配列から
 * - すべて未入力状態の TrainingInputs を生成
 * - 「draft が空かどうか」の判定基準にも使う
 *
 * 【useLocalStorageState の役割】
 * - draft の永続化
 * - hydrated で localStorage 復元完了を検知
 *
 * 【hydrating state】
 * - DB からの復元処理が完了したかどうか
 * - UI 側でローディング制御に使う
 *
 * 【初回 useEffect（DB復元）】
 * - draft が完全に空の場合のみ実行
 * - 入力途中の draft を絶対に上書きしない
 *
 * 手順：
 * 1. 現在の draft が makeEmpty と同一か判定
 * 2. 空でなければ何もしない
 * 3. DB から最新データを取得
 * 4. 選択中の種目キーだけを対象に安全にマージ
 * 5. localStorage（draft）に反映
 *
 * 【キャンセル制御】
 * - 非同期処理中にアンマウントされた場合の安全対策
 *
 * 【updateField】
 * - 特定の種目
 * - 特定のフィールド
 * - その値だけを更新
 * - 他の種目・他のフィールドは壊さない
 *
 * 【resetToEmpty】
 * - 選択中種目をすべて未入力状態に戻す
 *
 * 【removeDraft】
 * - localStorage から完全削除
 *
 * 【戻り値】
 * - draft: 現在の下書き
 * - updateField: フィールド更新用
 * - resetToEmpty: 全リセット
 * - removeDraft: 下書き削除
 * - hydrating: DB復元中フラグ
 * - storageKey: デバッグ用
 */
