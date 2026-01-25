# Claude Code 作業方針

## 目的

このドキュメントは、Claude Code が pixivts プロジェクトで作業を行う際の方針とルールを定義します。

## 判断記録のルール

判断は必ずレビュー可能な形で記録すること：

1. 判断内容の要約
2. 検討した代替案
3. 採用しなかった案とその理由
4. 前提条件・仮定・不確実性
5. 他エージェントによるレビュー可否

前提・仮定・不確実性を明示すること。仮定を事実のように扱ってはならない。

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

## 重要ルール

- 会話言語: 日本語
- コード内コメント: 日本語
- エラーメッセージ: 英語
- 日本語と英数字の間には半角スペースを挿入

## 環境のルール

- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - `<type>(<scope>): <description>` 形式
  - `<description>` は日本語で記載
- ブランチ命名: [Conventional Branch](https://conventional-branch.github.io) に従う
  - `<type>/<description>` 形式
  - `<type>` は短縮形 (feat, fix) を使用
- GitHub リポジトリを調査のために参照する場合、テンポラリディレクトリに git clone して、そこでコード検索する
- Renovate が作成した既存のプルリクエストに対して、追加コミットや更新を行ってはならない

## コード改修時のルール

- 日本語と英数字の間には、半角スペースを挿入しなければならない
- TypeScript プロジェクトにおいて、skipLibCheck を有効にして回避することは絶対にしてはならない
- 関数やインターフェースには、docstring (JSDoc) を記載・更新する。日本語で記載する必要がある

## 相談ルール

Codex CLI や Gemini CLI の他エージェントに相談することができる。以下の観点で使い分ける：

- Codex CLI (ask-codex)
  - 実装コードに対するソースコードレビュー
  - 関数設計、モジュール内部の実装方針などの局所的な技術判断
  - アーキテクチャ、モジュール間契約、パフォーマンス／セキュリティといった全体影響の判断
  - 実装の正当性確認、機械的ミスの検出、既存コードとの整合性確認
- Gemini CLI (ask-gemini)
  - SaaS 仕様、言語・ランタイムのバージョン差、料金・制限・クォータといった、最新の適切な情報が必要な外部依存の判断
  - 外部一次情報の確認、最新仕様の調査、外部前提条件の検証

他エージェントが指摘・異議を提示した場合、Claude Code は必ず以下のいずれかを行う。黙殺・無言での不採用は禁止する：

- 指摘を受け入れ、判断を修正する
- 指摘を退け、その理由を明示する

以下は必ず実施する：

- 他エージェントの提案を鵜呑みにせず、その根拠や理由を理解する
- 自身の分析結果と他エージェントの意見が異なる場合は、双方の視点を比較検討する
- 最終的な判断は、両者の意見を総合的に評価した上で、自身で下す

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# ビルド (clean, ctix, compile, generate-docs を順に実行)
pnpm build

# クリーン
pnpm clean

# コンパイル
pnpm compile

# ctix によるインデックスファイル自動生成
pnpm ctix

# TypeDoc によるドキュメント生成
pnpm generate-docs

# テスト (カバレッジ付き)
pnpm test

# Lint チェック (prettier, eslint, tsc を順に実行)
pnpm lint

# Lint 修正 (prettier, eslint, ctix を順に実行)
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
```

## アーキテクチャと主要ファイル

### アーキテクチャサマリー

- `src/pixiv.ts`: メインクラス Pixiv を定義。API リクエストメソッドを提供
- `src/types/`: API レスポンスの型定義
  - `pixiv-*.ts`: 共通の型定義（イラスト、小説、ユーザーなど）
  - `endpoints/`: エンドポイント別のリクエスト・レスポンス型定義
- `src/saving-responses/`: レスポンスをデータベースに保存する機能
- `src/options.ts`: Pixiv クラスのオプション定義
- `src/utils.ts`: ユーティリティ関数
- `src/checks.ts`: チェック関数
- `src/index.ts`: エクスポートファイル (ctix で自動生成)

### 主要ディレクトリ

- `src/`: ソースコード
- `src/types/`: 型定義
- `src/types/endpoints/`: エンドポイント別の型定義
- `src/saving-responses/`: レスポンス保存機能
- `dist/`: ビルド成果物
- `docs/`: TypeDoc 生成ドキュメント

## 実装パターン

### 推奨パターン

- API リクエストメソッドは axios の AxiosResponse を返す
- 型定義は snake_case から camelCase へのマッピングを snake-camel-types で行う
- レスポンスの型は `src/types/endpoints/` 以下に配置
- テストは `*.test.ts` ファイルに記載
- 公開 API には JSDoc コメントを日本語で記載

### 非推奨パターン

- `skipLibCheck` を有効にして型エラーを回避する
- エラーメッセージを日本語で記載する
- セミコロンを使用する (Prettier 設定で `semi: false`)

## テスト

### テスト方針

- テストフレームワーク: Jest
- カバレッジ収集: `src/**/*.ts` (ただし `src/index.ts`, `src/**/*.test.ts`, `src/types/**` を除く)
- スナップショットテスト: `src/__snapshots__/` に配置

### 追加テスト条件

- 新しい API メソッドを追加する場合、対応するテストを追加する
- エッジケースや例外処理のテストも記載する

## ドキュメント更新ルール

### 更新対象

- README.md: 機能追加や使用方法の変更時
- TypeDoc コメント (JSDoc): 公開 API の変更時
- src/index.ts: ctix で自動生成されるため手動編集不要

### 更新タイミング

- API メソッドの追加・変更時: 対応する JSDoc コメントを更新
- 機能追加時: README.md の Features セクションを更新
- 型定義の追加・変更時: 対応する JSDoc コメントを追加・更新

## 作業チェックリスト

### 新規改修時

1. プロジェクトについて詳細に探索し理解すること
2. 作業を行うブランチが適切であること。すでに PR を提出しクローズされたブランチでないこと
3. 最新のリモートブランチに基づいた新規ブランチであること
4. PR がクローズされ、不要となったブランチは削除されていること
5. `pnpm install` により依存パッケージをインストールしたこと

### コミット・プッシュ前

1. コミットメッセージが Conventional Commits に従っていること（`<description>` は日本語）
2. コミット内容にセンシティブな情報が含まれていないこと
3. `pnpm lint` でエラーが発生しないこと
4. `pnpm test` で全テストがパスすること
5. 動作確認を行い、期待通り動作すること

### PR 作成前

1. プルリクエストの作成をユーザーから依頼されていること
2. コミット内容にセンシティブな情報が含まれていないこと
3. コンフリクトする恐れが無いこと

### PR 作成後

1. コンフリクトが発生していないこと
2. PR 本文の内容は、ブランチの現在の状態を、今までのこの PR での更新履歴を含むことなく、最新の状態のみ、漏れなく日本語で記載されていること
3. `gh pr checks <PR ID> --watch` で GitHub Actions CI を待ち、その結果がエラーとなっていないこと
4. `request-review-copilot` コマンドが存在する場合、GitHub Copilot へレビューを依頼すること
5. 10 分以内に投稿される GitHub Copilot レビューへの対応を行うこと。対応したら、レビューコメントそれぞれに対して返信を行うこと
6. `/code-review:code-review` によるコードレビューを実施したこと。スコアが 50 以上の指摘事項に対して対応すること

## リポジトリ固有

- このプロジェクトは npm パッケージ `@book000/pixivts` として公開されている
- API ドキュメントは GitHub Pages (https://book000.github.io/pixivts/) でホスティングされている
- TypeDoc のドキュメント生成は master ブランチの内容を参照する (`--gitRevision master`)
- ctix を使用して `src/index.ts` を自動生成している。手動編集してはならない
- TypeORM を使用してレスポンスを MySQL データベースに保存する機能 (`src/saving-responses/`) がある
- Renovate による依存関係の自動更新が有効になっている
- パッケージマネージャーは pnpm 10.28.1 を使用
- Node.js のバージョンは `.node-version` ファイルで管理されている
