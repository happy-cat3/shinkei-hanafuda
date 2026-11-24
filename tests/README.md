# tests/ — 町づくり(vil-core / vil-ui)の確認スクリプト

【状態】この README は **提案版(未アップロード)** です。GitHub には、承認後に `feature/vil-storage` へ追加します。

## 目的
作業環境の入れ替えでテストが消えるのを防ぐため、確認スクリプトとその実行結果をリポジトリで管理する。

## 必要な環境
- Node.js 22 以上、`npm i`（playwright）、`npx playwright install chromium`
- Linux / macOS。ブラウザは Chromium(Playwright)。**実機のスマホでは未確認**。

## 実行方法
```
cd tests && npm i && npx playwright install chromium
# 今の index.html(リポジトリ直下)を確認
bash run_all.sh                       # 5e/主要動線(76項目)
# 前の版と比べる(同じ操作で保存データ・文言が一致するか)
bash run_all.sh /path/to/前の版のindex.html
```
- 別の場所のファイルを確認するときは `INDEX=/path/to/index.html bash run_all.sh`
- 結果は `tests/results/run_日時.txt` に、対象のSHA-256・サイズ・node・playwright の版つきで保存される。

## ファイル
| ファイル | 内容 | 項目数 |
|---|---|---|
| `vil_5e_workshop.js` | 5e(作業場の建築・板材づくり)と、5b〜5dの主要動線(保存失敗/結果不明/連打/2画面/ひらがな/5サイズ/本番キー不変) | 76 |
| `vil_diff_compare.js` | 前の版と今の版で同じ操作を行い、保存データと画面の文言を比べる(採集・保管庫・受け取り待ち・入れかえ・拡張・掲示板・案内) | 22場面 |
| `run_all.sh` | 上の2つをまとめて実行し、結果を保存 | — |
| `MANIFEST.json` | 対象の版(SHA-256)・実行環境・結果の記録 | — |
| `RECOVERY_STATUS.md` | 旧テスト(912項目)の復旧状況(復旧/再構築/復旧不能の区別) | — |

## 運用の提案(未決定・承認待ち)
1. 版ごとに、`tests/results/` に実行結果を保存し、コミットする(対象SHAを記録)。
2. 新しい段階(5f以降)のテストは、`tests/vil_5f_*.js` のように段階名をつけて追加する。
3. 旧テストを作り直す場合は、「再構築」と明記し、旧テストと同一とは扱わない。
