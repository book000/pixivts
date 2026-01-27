# AI エージェント作業方針

## 目的

このドキュメントは、AI エージェントが pixivts プロジェクトで作業を行う際の共通の基本方針を定義します。

## 基本方針

- 会話言語: 日本語
- コード内コメント: 日本語
- エラーメッセージ: 英語
- 日本語と英数字の間には半角スペースを挿入
- コミットメッセージ: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う
  - `<type>(<scope>): <description>` 形式
  - `<description>` は日本語で記載
  - 例: `feat: イラスト検索機能を追加`

## 判断記録のルール

技術的な判断を行う際は、以下を記録すること：

1. 判断内容の要約
2. 検討した代替案
3. 採用した案とその理由
4. 採用しなかった案とその理由
5. 前提条件・仮定・不確実性の明示

仮定を事実のように扱わず、常に前提条件と不確実性を明示する。

## 開発手順（概要）

1. プロジェクト理解
   - README.md を読む
   - package.json を確認
   - 主要なソースコードを確認
2. 依存関係インストール
   - `pnpm install` を実行
3. 変更実装
   - TypeScript strict モードに準拠
   - 関数・インターフェースに JSDoc コメント（日本語）を記載
   - `skipLibCheck` での回避は禁止
4. テストと Lint/Format 実行
   - `pnpm lint` でチェック
   - `pnpm test` でテスト実行
   - `pnpm fix` で自動修正

## セキュリティ / 機密情報

- API キーや認証情報を Git にコミットしない
- ログに個人情報や認証情報を出力しない
- テストコードでは実際の認証情報を使用せず、モックやダミーデータを使用

## リポジトリ固有

- このプロジェクトは pixiv Unofficial API Library for TypeScript
- npm パッケージ `@book000/pixivts` として公開されている
- パッケージマネージャー: pnpm 10.28.1
- テストフレームワーク: Jest
- Lint: ESLint (@book000/eslint-config)
- Format: Prettier (semi: false, singleQuote: true)
- ドキュメント: TypeDoc で自動生成し GitHub Pages にホスティング
- ctix を使用して `src/index.ts` を自動生成（手動編集禁止）
- Renovate による依存関係の自動更新が有効
