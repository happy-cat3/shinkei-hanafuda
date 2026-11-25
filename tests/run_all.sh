#!/usr/bin/env bash
# 使い方: bash tests/run_all.sh [前の版のindex.html]
# 例)     bash tests/run_all.sh /tmp/index_5e.html
# 前の版を渡すと、(1)前の版との比較(意図した変更と変えてはいけない部分を区別) (2)前の版が seen つきの保存データを読めるか (3)5gではホームの他のボタンが前の版と同じ動きか も確認する。
set -u
cd "$(dirname "$0")"
INDEX="${INDEX:-$(cd .. && pwd)/index.html}"
STAMP="$(date +%Y%m%d_%H%M%S)"
SHA="$(sha256sum "$INDEX" | cut -d' ' -f1)"
OUT="results/run_${STAMP}.txt"
mkdir -p results
{
  echo "対象: $INDEX"; echo "SHA-256: $SHA"; echo "サイズ: $(wc -c < "$INDEX") bytes"
  echo "node: $(node -v)"; echo "playwright: $(node -e "console.log(require('playwright/package.json').version)")"
  echo "chromium: $(node -e "const {chromium}=require('playwright');chromium.launch().then(async b=>{console.log(b.version());await b.close()})")"
  echo "------ vil_5e_workshop.js (作り直した76項目)"; INDEX="$INDEX" node vil_5e_workshop.js
  echo "------ vil_5f_complete.js (5f専用)"; INDEX="$INDEX" OLD="${1:-}" node vil_5f_complete.js
  echo "------ vil_5g_home.js (5g専用)"; INDEX="$INDEX" OLD="${1:-}" node vil_5g_home.js
  if [ "${1:-}" != "" ]; then echo "------ vil_diff_compare.js (OLD=$1)"; OLD="$1" NEW="$INDEX" node vil_diff_compare.js; fi
} 2>&1 | tee "$OUT"
echo "結果を $OUT に保存しました"
