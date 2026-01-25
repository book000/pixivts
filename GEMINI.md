# Gemini CLI 作業方針

## 目的

このドキュメントは、Gemini CLI が pixivts プロジェクトで作業を行う際のコンテキストと作業方針を定義します。

## 出力スタイル

- 言語: 日本語
- トーン: 簡潔で技術的
- 形式: Markdown

## 共通ルール

- 会話は日本語で行う
- PR とコミットは Conventional Commits に従う（`<description>` は日本語で記載）
- 日本語と英数字の間には半角スペースを入れる

## プロジェクト概要

- 目的: pixiv Unofficial API Library for TypeScript
- 主な機能:
  - pixiv の iOS アプリが使用するプライベート API を TypeScript でラップ
  - イラスト、マンガ、小説の検索・取得
  - ユーザー情報の取得
  - ブックマークの追加・削除
  - ランキング情報の取得
  - うごイラメタデータの取得
  - レスポンスの MySQL データベースへの保存機能

## コーディング規約

- フォーマット: Prettier
  - セミコロンなし (`semi: false`)
  - シングルクォート (`singleQuote: true`)
  - タブ幅 2 (`tabWidth: 2`)
  - 改行コード: LF
- 命名規則:
  - クラス: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
- コメント: 日本語で記載
- エラーメッセージ: 英語で記載
- TypeScript:
  - strict モード有効
  - `skipLibCheck` での回避は禁止
  - 関数とインターフェースには docstring (JSDoc) を日本語で記載

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm build

# テスト
pnpm test

# Lint チェック
pnpm lint

# Lint 修正
pnpm fix

# Prettier チェック
pnpm lint:prettier

# Prettier 修正
pnpm fix:prettier

# ESLint チェック
pnpm lint:eslint

# ESLint 修正
pnpm fix:eslint

# TypeScript 型チェック
pnpm lint:tsc

# ドキュメント生成
pnpm generate-docs

# クリーン
pnpm clean
```

## 注意事項

- API キーや認証情報は Git にコミットしない
- ログに個人情報や認証情報を出力しない
- 既存のコーディングルールとパターンを優先する
- Renovate が作成した既存のプルリクエストに対して、追加コミットや更新を行ってはならない

## リポジトリ固有

- このプロジェクトは npm パッケージ `@book000/pixivts` として公開されている
- API ドキュメントは GitHub Pages (https://book000.github.io/pixivts/) でホスティングされている
- ctix を使用して `src/index.ts` を自動生成している。手動編集してはならない
- TypeORM を使用してレスポンスを MySQL データベースに保存する機能がある
- パッケージマネージャーは pnpm 10.28.1 を使用
- テストフレームワークは Jest を使用
- Renovate による依存関係の自動更新が有効
