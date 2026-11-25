// lib_http.js — テスト用のローカルHTTPサーバー(127.0.0.1のみ)と、再読み込み前後の保存データ照合(5hで追加)
// 目的: ヘッドレスChromiumの file:// では page.reload() のあとに localStorage が全部消えることがあるため(環境要因)、
//       既定を http://127.0.0.1:<空きポート>/ に変更する。確認内容・期待値は変えない。
// 使い方: const H=require('./lib_http.js'); await H.start([ファイル...]); H.u(ファイル) → URL; H.reload(page); H.finish(R); await H.stop();
// 切り替え: VIL_SERVE=file で従来の file:// 方式(比較・再現用)。既定は http。
const http=require('http'),fs=require('fs'),path=require('path');
const MODE=process.env.VIL_SERVE==='file'?'file':'http';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
let srv=null,port=0;const map=new Map(); // ファイル(絶対パス) → 通し番号
const dirs=[];                            // 通し番号 → ディレクトリ
const stats={mode:MODE,attempts:0,lost:0,details:[],requests:0,notFound:0};
function handler(req,res){stats.requests++;
  try{if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
    const u=decodeURIComponent((req.url||'').split('?')[0].split('#')[0]);const m=/^\/s(\d+)\/(.*)$/.exec(u);
    if(!m||!dirs[+m[1]]){stats.notFound++;res.writeHead(404);return res.end('not found')}
    const dir=dirs[+m[1]],f=path.resolve(dir,m[2]||'');
    if(f!==dir&&!f.startsWith(dir+path.sep)){res.writeHead(403);return res.end('forbidden')}   // ディレクトリの外へは出さない
    fs.stat(f,(e,st)=>{if(e||!st.isFile()){stats.notFound++;res.writeHead(404);return res.end('not found')}
      res.writeHead(200,{'Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Content-Length':st.size,'Cache-Control':'no-store'});
      if(req.method==='HEAD')return res.end();fs.createReadStream(f).pipe(res)})}catch(e){res.writeHead(500);res.end()}}
async function start(files){
  for(const f of files||[]){if(!f)continue;const a=path.resolve(f);if(!map.has(a)){map.set(a,dirs.length);dirs.push(path.dirname(a))}}
  if(MODE==='file'||srv)return;
  srv=http.createServer(handler);
  await new Promise((ok,ng)=>{srv.once('error',ng);srv.listen(0,'127.0.0.1',()=>{port=srv.address().port;ok()})});
  for(const ev of ['SIGINT','SIGTERM'])process.once(ev,()=>{stop().then(()=>process.exit(130))});}
function u(f){const a=path.resolve(f);
  if(MODE==='file')return 'file://'+a;
  if(!map.has(a))throw new Error('lib_http: start() に渡していないファイルです: '+a);
  return 'http://127.0.0.1:'+port+'/s'+map.get(a)+'/'+encodeURIComponent(path.basename(a));}
async function stop(){if(!srv)return;const s=srv;srv=null;await new Promise(r=>{try{s.close(()=>r());if(s.closeAllConnections)s.closeAllConnections()}catch(e){r()}})}
const snap=pg=>pg.evaluate(()=>{const o={};try{for(const k of Object.keys(localStorage))o[k]=localStorage.getItem(k)}catch(e){o.__err=String(e)}return o});
// 再読み込み:前後で localStorage のキーを比べ、無くなったキーがあれば「失敗」として数える(再試行で合格扱いにはしない)
async function reload(pg,label){const before=await snap(pg);await pg.reload();await pg.waitForTimeout(120);
  let after;try{after=await snap(pg)}catch(e){await pg.waitForTimeout(400);after=await snap(pg)}
  stats.attempts++;const lost=Object.keys(before).filter(k=>!(k in after));
  if(lost.length){stats.lost++;stats.details.push({label:label||'',before:Object.keys(before).length,after:Object.keys(after).length,lost:lost.slice(0,12)})}
  return{before,after,lost}}
function info(){let pw='?';try{pw=require('playwright/package.json').version}catch(e){}
  return `[env] 方式=${MODE==='file'?'file://(従来方式・環境要因の再現用)':'http://127.0.0.1:'+port+'/ (ローカルHTTPサーバー)'} node=${process.version} playwright=${pw}`}
function finish(R){console.log(info());
  console.log(`[reload] 再読み込み回数=${stats.attempts} 保存データ消失=${stats.lost} サーバー要求=${stats.requests} 404=${stats.notFound}`);
  if(stats.lost){for(const d of stats.details)console.log('[reload] 消失',JSON.stringify(d));
    R.push(['RELOAD 再読み込みで保存データが消えた(環境要因でも失敗として記録。再試行での合格扱いはしない)',false,JSON.stringify(stats.details).slice(0,300)])}}
module.exports={start,stop,u,reload,finish,info,snap,stats,mode:MODE};
