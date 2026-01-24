# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
Pixiv 非公式 API ライブラリ（TypeScript 実装）。iOS Pixiv アプリの通信 API を利用して、Pixiv データアクセスを提供します。

### 技術スタック
- **言語**: TypeScript
- **フレームワーク**: None (Library)
- **パッケージマネージャー**: pnpm@10.28.1
- **主要な依存関係**:
  - axios 1.13.2
  - mysql2 3.16.1
  - typeorm 0.3.28
  - qs 6.14.1

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

### 開発コマンド
```bash
# install
pnpm install

# build
pnpm build (tsc + ctix + typedoc)

# test
jest --coverage

# lint
pnpm lint (prettier, eslint, tsc チェック)

```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有
- npm 公開パッケージ (@book000/pixivts)
- GitHub Pages API ドキュメント
- TypeORM データベース統合
- スナップショットテスト
- API レスポンスの直接取得パターン