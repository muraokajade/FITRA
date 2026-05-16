# FITRA — AI Fitness Management App

[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)](#)
[![Auth](https://img.shields.io/badge/Auth-Firebase-orange)](#)
[![DB](https://img.shields.io/badge/DB-Prisma%20%2F%20Database-blue)](#)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](#)

## AIで、食事・運動・生活を統合管理するフィットネス記録アプリ

FITRAは、Diet / Training / Life の3領域を記録し、AI分析と統合Dashboardによって、今日の身体状態・改善ポイント・成長傾向を可視化するアプリです。

---

## 目次

- [概要](#概要)
- [本番URL](#本番url)
- [主な機能](#主な機能)
- [画面構成](#画面構成)
- [認証機能](#認証機能)
- [技術スタック](#技術スタック)
- [システム構成](#システム構成)
- [セットアップ](#セットアップ)
- [環境変数](#環境変数)
- [デプロイ](#デプロイ)
- [現在の注意点](#現在の注意点)
- [今後の改善予定](#今後の改善予定)

---

## 概要

FITRAは、トレーニング・食事・生活習慣を個別に記録し、それぞれの分析結果を統合Dashboardに集約するAIフィットネス管理アプリです。

主な目的は、単なる記録ではなく、以下を見える化することです。

- 今日の身体状態
- 食事の改善ポイント
- トレーニングの成長傾向
- 睡眠・疲労・ストレスによる回復状態
- Diet / Training / Life を統合した総合スコア

---

## 本番URL

- Production URL：デプロイ後に記載
- GitHub Repository：デプロイ後に記載

---

## 主な機能

### 1. 統合Dashboard

Diet / Training / Life の分析結果を統合し、今日の身体状態を表示します。

主な表示内容：

- 総合スコア
- Diet / Training / Life 別スコア
- 直近スコア推移
- 今日の改善優先エリア
- 今日のアクション提案
- 保存済み分析データの履歴

---

### 2. Diet AI

食事内容を入力し、AIによって食事評価を行います。

主な機能：

- 食事内容の入力
- 食品リストの追加
- 画像アップロードによる食事分析
- 1食単位のAI評価
- 1日単位の総合食事評価
- 食事ログのDB保存
- Diet履歴Dashboardでスコア推移を確認

導線：

- `/diet/dashboard`：食事履歴・スコア確認
- `/diet`：食事入力・AI分析

---

### 3. Training AI

トレーニング内容を記録し、成長傾向を可視化します。

主な機能：

- リアルタイム記録
- Normal記録 Step1〜Step3
- 種目選択
- 重量・回数・セット数入力
- 総ボリューム算出
- AIコメント生成
- Training Dashboardで重量推移を表示

導線：

- `/training`：Trainingトップ
- `/training/live`：リアルタイム記録
- `/training/normal/step1`：種目選択
- `/training/normal/step2`：重量・回数・セット数入力
- `/training/normal/step3`：確認・保存
- `/training/dashboard`：成長ダッシュボード

---

### 4. Life AI

睡眠・疲労・ストレスから生活スコアを算出します。

主な機能：

- 睡眠時間入力
- 疲労度入力
- ストレス度入力
- 入力済み項目だけで生活スコアを100点換算
- Sleep / Fatigue / Stress 詳細分析
- 生活ログのDB保存
- localStorageによる暫定スコア履歴表示

導線：

- `/life`：生活AIアナリスト
- `/life/sleep`：睡眠詳細
- `/life/fatigue`：疲労詳細
- `/life/stress`：ストレス詳細

---

## 画面構成

### 公開ページ

| URL | 内容 |
|---|---|
| `/` | LP / アプリ紹介 / ログイン導線 |
| `/login` | ログイン |
| `/register` | 新規登録 |

### ログイン後ページ

| URL | 内容 |
|---|---|
| `/dashboard` | 統合Dashboard |
| `/diet/dashboard` | Diet履歴Dashboard |
| `/diet` | 食事入力・AI分析 |
| `/training` | Trainingトップ |
| `/training/dashboard` | Training成長Dashboard |
| `/training/normal/step1` | Normal記録 Step1 |
| `/training/normal/step2` | Normal記録 Step2 |
| `/training/normal/step3` | Normal記録 Step3 |
| `/life` | Life AI |
| `/life/sleep` | 睡眠詳細 |
| `/life/fatigue` | 疲労詳細 |
| `/life/stress` | ストレス詳細 |

---

## 認証機能

Firebase Authentication を使用しています。

### 認証方式

- Email / Password 認証
- Firebase Authentication
- ログイン状態の永続化
- ログアウト機能

### 認証保護

ログイン後に利用する主要ページは `AuthGuard` によって保護しています。

対象：

- `/dashboard`
- `/diet`
- `/diet/dashboard`
- `/training`
- `/training/dashboard`
- `/life`

未ログイン状態でアクセスした場合は `/login` にリダイレクトします。

---

## 技術スタック

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- Firebase Authentication

### Backend / API

- Next.js API Routes
- Prisma
- AI feedback API
- REST API

### Database

- Prisma ORM
- TrainingSession
- TrainingEntry
- TrainingAnalysis
- DietAnalysis
- MealLog
- LifeLog
- LifeAnalysis

### Deploy

- Vercel予定

---

## システム構成

```txt
[ Browser ]
    |
    v
[ Next.js Frontend ]
    |
    | Firebase Auth
    v
[ Firebase Authentication ]

[ Next.js API Routes ]
    |
    | Prisma
    v
[ Database ]

[ AI Feedback Logic ]
    |
    v
Diet / Training / Life Analysis
