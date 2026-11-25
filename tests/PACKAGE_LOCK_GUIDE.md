# package-lock.json を作って GitHub に保存する手順(Windows・初心者向け)

## これは何のための作業?
`package-lock.json` は、テストで使うソフト(Playwright など)の「版」を 1 つ残らず記録するファイルです。これがあると、いつ・どのパソコンで実行しても同じ版が使われます。
**ゲーム本体(index.html)には関係ありません。** 作業は、パソコンで 1 回だけ、10〜15 分ほどです。

## 先にお伝えしておくこと
- Claude の作業環境からは npm のサイトに接続できないため、Claude 側では作れませんでした(5f・5g・5h で 3 回ずつ試して、すべて接続エラー)。
- ファイルの中身を Claude が手で書くことはしません(記録の数値は npm のサイトから取るべきもので、作り話になるため)。
- 作業の途中で分からなくなったら、**画面の写真か、出た文字をそのまま** Claude に送ってください。

## 1. 必要なもの
| もの | 説明 |
|---|---|
| Windows のパソコン | インターネットにつながっていること |
| Node.js(LTS 版) | npm という道具も一緒に入ります。バージョン 22 以上であれば大丈夫です |
| GitHub のアカウント | すでにお持ちのもの(`happy-cat3`)を使います |
| 提出された tests の ZIP | 中に `package.json` が入っています |

### Node.js のインストール(すでに入っていれば 2 へ)
1. ブラウザで `https://nodejs.org/` を開きます。
2. 「LTS」と書かれた緑のボタン(Windows Installer)をクリックしてダウンロードします。
3. ダウンロードしたファイルをダブルクリック → 「Next」を押して進みます(設定は変えなくて大丈夫です)→ 「Install」→ 「Finish」。
4. インストールが終わったら、パソコンを再起動しなくて大丈夫ですが、**開いていた黒い画面(PowerShell など)があれば閉じてください**。

## 2. 作業用フォルダを作る
1. `C:\work\lock` というフォルダを作ります(エクスプローラーで C ドライブを開き、右クリック → 新規作成 → フォルダー)。`work` が無ければ先に作ります。
2. 提出された tests の ZIP を右クリック → 「すべて展開」→ 展開先を `C:\work\lock` にします。
3. 次のようになっていれば成功です: `C:\work\lock\tests\package.json`

## 3. PowerShell を開く
1. エクスプローラーで `C:\work\lock\tests` フォルダを開きます(中に `package.json` が見える場所)。
2. 画面の上のほうのアドレス欄(`C:\work\lock\tests` と書いてある所)を 1 回クリックします。
3. 文字を全部消して `powershell` と入力し、Enter を押します。
4. 青か黒の画面(PowerShell)が開きます。行の頭に `PS C:\work\lock\tests>` と出ていれば正しい場所です。

## 4. コマンドを入力する(1 行ずつ入力して Enter)
```
node -v
```
→ `v22.…` や `v24.…` のように、**v22 以上**の数字が出れば OK です。

```
npm -v
```
→ 数字(例 `10.9.0`)が出れば OK です。

```
npm install --package-lock-only
```
→ 少し待つと終わります(1〜2 分)。**このコマンドは、ロックファイルだけを作ります。** ブラウザなどの大きなファイルはダウンロードしません。
→ 最後に `up to date` や `added …packages` のような文が出て、赤い `npm error` が出ていなければ成功です。

## 5. できたか確認する
```
dir package-lock.json
```
→ `package-lock.json` が一覧に出れば成功です。
メモ帳で開いて(右クリック → プログラムから開く → メモ帳)、`"playwright"` を探し、近くに `"version": "1.63.0"` と書かれていることを確認してください(1.63.0 以外ならそこで止めて Claude に知らせてください)。
**中身は書き換えないでください。**

## 6. GitHub に保存する(ブラウザだけでできます)
**注意:保存先は `feature/vil-storage` ブランチです。main には保存しないでください。**
1. ブラウザで `https://github.com/happy-cat3/shinkei-hanafuda` を開きます。
2. 左上の「main」と書かれたボタンをクリックし、一覧から `feature/vil-storage` を選びます。(ボタンの文字が `feature/vil-storage` になったことを確認します)
3. ファイル一覧から `tests` フォルダをクリックして開きます。
4. 右上の「Add file」→「Upload files」を選びます。
5. `C:\work\lock\tests\package-lock.json` を画面にドラッグ&ドロップします。(**このファイル 1 つだけ**。`node_modules` というフォルダができていたら、それは絶対に入れないでください)
6. 下の「Commit changes」の欄に次を入力します。
   - タイトル: `テスト環境：package-lock.json を追加（Playwright 1.63.0 を固定）`
   - 拡張説明: `npm install --package-lock-only で生成。テスト用ソフトの版を固定するための記録で、ゲーム本体(index.html)には影響しません。`
7. 「Commit directly to the `feature/vil-storage` branch」が選ばれていることを確認し、緑の「Commit changes」を押します。
8. 保存できたら、Claude に「package-lock.json を保存しました」と伝えてください。Claude が GitHub から取得して、内容(Playwright 1.63.0 であること、`npm ci` で入ること)を確認します。

## うまくいかないとき
| 出たもの | 対応 |
|---|---|
| `node` や `npm` が「認識されません」 | PowerShell を閉じて開き直す。それでもだめなら Node.js を入れ直す |
| 「このシステムではスクリプトの実行が無効」(npm.ps1 の赤い文字) | `npm.cmd install --package-lock-only` と、`npm` の代わりに `npm.cmd` と入力する |
| `npm error network` や `ENOTFOUND` | インターネット接続を確認する。会社・学校の回線だと止められることがあるので、家の回線で試す |
| `package.json` が見つからない | 場所が違います。手順 3 のとおり、`tests` フォルダの中で PowerShell を開き直す |
| 何か分からなくなった | その画面の写真か文字を Claude に送る(パスワード等は入力しないので、そのまま送って大丈夫です) |

## 終わったあと
- 手元の `C:\work\lock` フォルダは、不要なら削除して構いません。
- 以降、テストを新しいパソコンで動かすときは `npm ci`(ロックファイルどおりに入れる)が使えます。
