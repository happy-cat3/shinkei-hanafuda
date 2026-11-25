// serve_for_phone.js — スマホで 5h版 を確認するための、かんたんな表示用サーバー(5hで追加)
// 使い方: node serve_for_phone.js [index.htmlのパス]   (省略すると、リポジトリ直下 → tests フォルダ → この phone フォルダ の順に index.html を探します)
// 追加のインストールは不要です(Node.js だけ)。止めるときは Ctrl+C。
// 安全のための決まり:
//  ・読み取り専用です。GitHub・本番サイトには何も書きません(通信は同じWi-Fiの中だけ)。
//  ・配るのは index.html とアイコン類だけです(フォルダの一覧は出しません)。
//  ・sw.js は配りません(スマホにキャッシュを残さないため。404 を返します)。
//  ・スマホ側の保存データは「このPCのアドレス(http://192.168.x.x:8000)」だけのもので、本番サイトの保存データとは別です。
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');
const FILE=path.resolve(process.argv[2]||[path.join(__dirname,'..','..','index.html'),path.join(__dirname,'..','index.html'),path.join(__dirname,'index.html')].find(f=>fs.existsSync(f))||path.join(__dirname,'..','..','index.html'));
const PORT=+(process.env.PORT||8000);
if(!fs.existsSync(FILE)){console.error('index.html が見つかりません: '+FILE+'\nindex.html をリポジトリ直下(tests フォルダの1つ上)に置くか、パスを指定してください。例: node serve_for_phone.js C:\\work\\index.html');process.exit(1)}
const DIR=path.dirname(FILE);
const OK={'/':FILE,'/index.html':FILE};
for(const n of ['manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png']){const f=path.join(DIR,n);if(fs.existsSync(f))OK['/'+n]=f}
const MIME={'.html':'text/html; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const buf=fs.readFileSync(FILE),sha=crypto.createHash('sha256').update(buf).digest('hex');
const srv=http.createServer((req,res)=>{
  const u=(req.url||'/').split('?')[0].split('#')[0];const f=(req.method==='GET'||req.method==='HEAD')?OK[u]:null;
  if(!f){res.writeHead(u==='/sw.js'?404:(req.method==='GET'||req.method==='HEAD')?404:405);return res.end('not found')}
  const b=fs.readFileSync(f);res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Content-Length':b.length,'Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:b)});
srv.on('error',e=>{console.error(e.code==='EADDRINUSE'?'ポート '+PORT+' はすでに使われています。別の番号で試してください。例(Windows): set PORT=8001 && node serve_for_phone.js':String(e));process.exit(1)});
srv.listen(PORT,'0.0.0.0',()=>{
  const ips=[];for(const l of Object.values(os.networkInterfaces()))for(const a of l||[])if(a.family==='IPv4'&&!a.internal&&/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address))ips.push(a.address);
  console.log('=== スマホ確認用サーバーを起動しました ===');
  console.log('表示しているファイル: '+FILE);
  console.log('サイズ: '+buf.length+' bytes');
  console.log('SHA-256: '+sha+'\n(提出された 5h版 の値と同じか確かめてください)\n');
  if(ips.length){console.log('スマホのブラウザ(Chrome か Safari)に、次のどれかを入力してください(PCと同じWi-Fiにつなぐこと):');for(const ip of ips)console.log('   http://'+ip+':'+PORT+'/')}
  else console.log('PCのアドレスが見つかりません。Wi-Fiにつながっているか確認し、ipconfig で「IPv4 アドレス」を調べて http://そのアドレス:'+PORT+'/ を開いてください。');
  console.log('\n止めるときは、この画面で Ctrl+C を押してください。確認が終わったら必ず止めてください。')});
for(const ev of ['SIGINT','SIGTERM'])process.on(ev,()=>{console.log('\n停止しました。');srv.close();process.exit(0)});
