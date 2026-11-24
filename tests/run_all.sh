#!/usr/bin/env bash
# 使い方: tests/run_all.sh [前の版のindex.html]
# 例)     tests/run_all.sh /tmp/index_5d.html
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
  echo "------ vil_5e_workshop.js"; INDEX="$INDEX" node vil_5e_workshop.js
  if [ "${1:-}" != "" ]; then echo "------ vil_diff_compare.js (OLD=$1)"; OLD="$1" NEW="$INDEX" node vil_diff_compare.js; fi
} 2>&1 | tee "$OUT"
echo "結果を $OUT に保存しました"
