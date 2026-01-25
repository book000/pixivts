# GitHub Copilot Instructions

## プロジェクト概要

- 目的: pixiv Unofficial API Library for TypeScript
- 主な機能: pixiv の iOS アプリが使用するプライベート API を利用した TypeScript ライブラリを提供
- 対象ユーザー: pixiv API を利用したい TypeScript/Node.js 開発者

## 共通ルール

- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う（`<description>` は日本語で記載）。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック

- 言語: TypeScript (ES2020)
- パッケージマネージャー: pnpm
- テストフレームワーク: Jest
- Lint: ESLint (@book000/eslint-config)
- Format: Prettier
- ドキュメント生成: TypeDoc
- 主要な依存関係: axios, mysql2, typeorm

## コーディング規約

- フォーマット: Prettier を使用
  - セミコロンなし (`semi: false`)
  - シングルクォート使用 (`singleQuote: true`)
  - タブ幅 2 (`tabWidth: 2`)
  - 改行コード: LF
- 命名規則:
  - クラス: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
- TypeScript:
  - strict モード有効
  - `skipLibCheck` での回避は禁止
  - 関数とインターフェースには docstring (JSDoc) を日本語で記載
- コメント: 日本語で記載
- エラーメッセージ: 英語で記載

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm build

# クリーン
pnpm clean

# コンパイル
pnpm compile

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
```

## テスト方針

- テストフレームワーク: Jest
- テストファイル: `*.test.ts`
- カバレッジ収集対象: `src/**/*.ts` (ただし `src/index.ts`, `src/**/*.test.ts`, `src/types/**` を除く)
- 新しい機能を追加する場合は、対応するテストを追加すること

## セキュリティ / 機密情報

- API キーや認証情報は Git にコミットしない。
- ログに個人情報や認証情報を出力しない。
- テストコードでは実際の認証情報を使用せず、モックやダミーデータを使用すること。

## ドキュメント更新

以下のドキュメントは適宜更新すること：

- README.md: 機能追加や使用方法の変更時
- TypeDoc コメント: 公開 API の変更時
- CHANGELOG (存在する場合): バージョンアップ時

## リポジトリ固有

- このプロジェクトは npm パッケージとして公開されている。
- API ドキュメントは GitHub Pages でホスティングされている。
- TypeDoc のドキュメント生成は master ブランチの内容を参照する。
- ctix を使用してインデックスファイルを自動生成している。
- TypeORM を使用してレスポンスを MySQL データベースに保存する機能がある。
- Renovate による依存関係の自動更新が有効になっている。
