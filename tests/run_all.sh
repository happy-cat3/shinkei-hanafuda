#!/usr/bin/env bash
# 使い方: bash tests/run_all.sh [前の段階(5g)のindex.html] [5fのindex.html]
# 例)     bash tests/run_all.sh /tmp/index_5g.html /tmp/index_5f.html
# 既定の方式は「ローカルHTTPサーバー(127.0.0.1・空きポート)」です。サーバーは各テストが自分で起動・終了します(lib_http.js)。
#   VIL_SERVE=file を付けると従来の file:// 方式になります(ヘッドレスChromiumで保存データが消える環境要因の再現・比較用)。
# 前の段階(5g)を渡すと、(1)比較22場面 (2)5hの洞窟修正テストの「5gでは再現する」確認 も行います。
# 5fを渡すと、5f専用・5g専用が従来どおり「5fとの比較」を行います(省略時は前の段階と同じ版を使います)。
# 再読み込みの検証回数は VIL_RELOAD_N(既定30)。「参考」として file:// 方式でも同じ回数を実行し、結果を別に記録します(合否には数えません)。
set -u
cd "$(dirname "$0")"
INDEX="${INDEX:-$(cd .. && pwd)/index.html}"
PREV="${1:-}"; PREV5F="${2:-$PREV}"
N="${VIL_RELOAD_N:-30}"
STAMP="$(date +%Y%m%d_%H%M%S)"
SHA="$(sha256sum "$INDEX" | cut -d' ' -f1)"
OUT="results/run_${STAMP}.txt"
mkdir -p results
{
  echo "対象: $INDEX"; echo "SHA-256: $SHA"; echo "サイズ: $(wc -c < "$INDEX") bytes"
  echo "実行日時: $(date '+%Y-%m-%d %H:%M:%S %z')"
  echo "node: $(node -v)"; echo "playwright: $(node -e "console.log(require('playwright/package.json').version)")"
  echo "chromium: $(node -e "const {chromium}=require('playwright');chromium.launch().then(async b=>{console.log(b.version());await b.close()})")"
  echo "実行方式: ${VIL_SERVE:-http}(既定=ローカルHTTPサーバー) / 前の段階: ${PREV:-なし} / 5f: ${PREV5F:-なし} / 再読み込み試行回数: $N"
  echo "------ vil_5e_workshop.js (作り直した76項目)"; INDEX="$INDEX" node vil_5e_workshop.js
  echo "------ vil_5f_complete.js (5f専用)"; INDEX="$INDEX" OLD="$PREV5F" node vil_5f_complete.js
  echo "------ vil_5g_home.js (5g専用)"; INDEX="$INDEX" OLD="$PREV5F" node vil_5g_home.js
  echo "------ vil_5h_sx.js (5h専用:洞窟の説明窓と入口)"; INDEX="$INDEX" OLD="$PREV" node vil_5h_sx.js
  echo "------ vil_5h_reload.js (5h専用:再読み込みのくり返し・${VIL_SERVE:-http}方式)"; INDEX="$INDEX" VIL_RELOAD_N="$N" node vil_5h_reload.js
  if [ "$PREV" != "" ]; then echo "------ vil_diff_compare.js (OLD=$PREV)"; OLD="$PREV" NEW="$INDEX" node vil_diff_compare.js; fi
  if [ "${VIL_SERVE:-http}" = "http" ] && [ "${VIL_REF_FILE:-1}" = "1" ]; then
    echo "------ 【参考・合否に数えない】vil_5h_reload.js を従来の file:// 方式で実行(環境要因の確認)"; VIL_SERVE=file INDEX="$INDEX" VIL_RELOAD_N="$N" node vil_5h_reload.js
  fi
} 2>&1 | tee "$OUT"
echo "結果を $OUT に保存しました"
