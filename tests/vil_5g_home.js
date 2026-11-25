// vil_5g_home.js — 町づくり5g(ホームの「町づくり」ボタン → 新しい「はじまりの町」・本番の保存先 elemVil)の確認
// 実行: INDEX=/path/to/index.html [OLD=/path/to/前の版(5f)index.html] node tests/vil_5g_home.js
// 【注意】旧テスト(912項目・5e専用142項目)のスクリプトは復旧できていません。これは5gのために新しく作ったものです。
// 【隔離】本番の保存先(elemVil など)の確認は、毎回あたらしい ブラウザの入れ物(context)で行います。実際の利用者データには触れません。
const {chromium}=require('playwright');const path=require('path');
const INDEX=path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html'));const URL='file://'+INDEX;
const OLD=process.env.OLD?path.resolve(process.env.OLD):'';
const SHOTS=process.env.SHOTS||path.join(__dirname,'results','shots');
const R=[];const ok=(n,c,x)=>R.push([n,!!c,x===undefined?'':String(x)]);
const J=JSON.stringify,KJ=/[㐀-鿿]/,sleep=ms=>new Promise(r=>setTimeout(r,ms));let b;
const SIZES=[[640,300],[780,330],[915,412],[1280,720],[1910,830]];
const sto=pg=>pg.evaluate(()=>{const o={};for(const k of Object.keys(localStorage))o[k]=localStorage.getItem(k);return o});
const vilKeys=o=>Object.keys(o).filter(k=>/^elemVil/.test(k)).sort();
const nonVil=o=>{const r={};for(const k of Object.keys(o))if(!/^elemVil/.test(k))r[k]=o[k];return r};
async function ctxNew(w,h,keys){const ctx=await b.newContext({viewport:{width:w,height:h}});
 await ctx.addInitScript(k=>{try{localStorage.setItem('elemSkipIntro','1');localStorage.setItem('elemOpDone','1');if(!localStorage.getItem('elemPartner'))localStorage.setItem('elemPartner','火');for(const x in (k||{}))if(localStorage.getItem(x)===null)localStorage.setItem(x,k[x])}catch(e){}},keys||null);return ctx}
async function open(ctx,lv,file,hash){const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
 const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));
 await pg.goto((file||URL)+(hash||''));await pg.waitForTimeout(900);await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);
 if(lv>=2)await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}});
 await pg.evaluate(()=>{HOMEMAP=true;render()});await pg.waitForTimeout(300);return pg}
async function home(w,h,lv,keys,file,hash){const ctx=await ctxNew(w,h,keys);const pg=await open(ctx,lv,file,hash);return{ctx,pg}}
const TW='.hb .tw';
const opened=pg=>pg.evaluate(()=>VILUI.open),mode=pg=>pg.evaluate(()=>VILUI.mode);
const backHome=async pg=>{await pg.click('.vlbar .vlb');await pg.waitForTimeout(400)};
const SNAP=()=>({HOMEMAP,SEC,PLAY,GAME,V:V||null,FT:typeof FT==='undefined'?null:FT,HMSG,SXID:typeof SXID==='undefined'?null:SXID,vil:VILUI.open});
(async()=>{b=await chromium.launch();

// ---- 世界樹 Lv1 / Lv2 の解放条件 ----
{const {ctx,pg}=await home(915,412,1);const lv=await pg.evaluate(()=>wlv());await pg.click(TW);await pg.waitForTimeout(300);
 const st=await sto(pg);
 ok('A1 世界樹Lv1:ホームの町づくりボタンでは新しい町に入れない(従来の案内)',lv===1&&!(await opened(pg))&&(await pg.evaluate(()=>HMSG))==='世界樹が Lv2に なると 町が ひらくよ');
 ok('A2 Lv1:本番キー(elemVil系)は1つも作られない',vilKeys(st).length===0);
 ok('A3 Lv1:本番用入口を直接呼んでも入れない(false・何も書かない)',await pg.evaluate(()=>VILUI.enter())===false&&!(await opened(pg))&&vilKeys(await sto(pg)).length===0);
 ok('A4 Lv1:ボタンは「まだ ひらかないよ」の鍵つき画像のまま',await pg.evaluate(()=>document.querySelector('.hb .tw').classList.contains('lk2')));
 await pg.screenshot({path:path.join(SHOTS,'5g_home_lv1_locked.png')});ok('A5 ページエラー0',pg.errs.length===0);await ctx.close()}
{const {ctx,pg}=await home(915,412,2);
 ok('B1 Lv2:ホームの鍵が外れる',await pg.evaluate(()=>wlv()===2&&!document.querySelector('.hb .tw').classList.contains('lk2')));
 await pg.screenshot({path:path.join(SHOTS,'5g_home_lv2_open.png')});
 await pg.click(TW);await pg.waitForTimeout(600);const st=await sto(pg);
 ok('B2 Lv2:町づくりボタンで新しい「はじまりの町」が開く(本番モード)',(await opened(pg))&&(await mode(pg))==='live'&&(await pg.locator('.vlt').innerText())==='はじまりの町');
 ok('B3 本番キー elemVil だけができ、テスト用キーはできない','elemVil' in st&&!Object.keys(st).some(k=>/^elemVilTest/.test(k)),J(vilKeys(st)));
 ok('B4 旧町用の初回説明(sxModal)は出ない・説明用キーも作らない',(await pg.evaluate(()=>V))!=='sx'&&st.elemSx_town===undefined);
 ok('B5 本番では「テスト中」ボタンが出ない・テスト用の道具・消去は使えない',!(await pg.locator('.vlbar').innerText()).includes('テスト中')&&await pg.evaluate(()=>{VILUI.tp(1);VILUI.dbgT();VILUI.erase();return !document.body.innerText.includes('テストの どうぐ')&&!VILUI.dbg&&VIL.namespace()===''}));
 ok('B6 新しい町の画面が出ている(背景・採集の木・掲示板・保管庫)',await pg.evaluate(()=>!!document.querySelector('.vlbg')&&!!document.querySelector('.vlo[data-o=wood1]')&&!!document.querySelector('.vlo[data-o=board]')&&!!document.querySelector('.vlo[data-o=storage]')));
 await pg.screenshot({path:path.join(SHOTS,'5g_town_from_home_915x412.png')});ok('B7 ページエラー0',pg.errs.length===0);await ctx.close()}
{const {ctx,pg}=await home(915,412,1);
 const r=await pg.evaluate(()=>{homeGo('town');homeGo('town');return[VILUI.open,HMSG]});await pg.evaluate(()=>VILUI.enter());
 ok('C1 Lv1:homeGo・enter をくり返し呼んでも入れない',!r[0]&&!(await opened(pg))&&vilKeys(await sto(pg)).length===0);
 await pg.evaluate(()=>{W.tree=TREE_XP[1];saveW()});ok('C2 Lv2になった直後から入れる',await pg.evaluate(()=>VILUI.enter())===true&&(await opened(pg)));await ctx.close()}

// ---- 洞窟・旧町は従来どおり ----
{const {ctx,pg}=await home(915,412,2);await pg.evaluate(()=>{try{localStorage.removeItem('elemSx_town')}catch(e){}});
 await pg.click('.hl .gt');await pg.waitForTimeout(400);const s1=await pg.evaluate(SNAP);
 ok('D1 洞窟:初回は旧町の説明(sxModal)が出る(従来どおり)',s1.V==='sx'&&!s1.vil);
 await pg.evaluate(()=>sxOk());await pg.waitForTimeout(400);const s2=await pg.evaluate(SNAP);
 ok('D2 説明のあとは旧町が開く(新しい町ではない)',!s2.vil&&s2.V==='farm'&&s2.FT==='town');
 await pg.evaluate(()=>{V=null;HOMEMAP=true;render()});await pg.waitForTimeout(200);await pg.click('.hl .gt');await pg.waitForTimeout(400);const s3=await pg.evaluate(SNAP);
 ok('D3 洞窟(説明済み):旧町が開く',!s3.vil&&s3.V==='farm'&&s3.FT==='town');
 await pg.evaluate(()=>{V=null;HOMEMAP=true;render()});await pg.waitForTimeout(200);await pg.click(TW);await pg.waitForTimeout(500);
 ok('D4 旧町を見たあとでも、町づくりボタンは新しい町を開く',(await opened(pg))&&(await mode(pg))==='live');
 await backHome(pg);await pg.click('.hl .gt');await pg.waitForTimeout(400);ok('D5 新しい町から戻ったあとも、洞窟は旧町',!(await opened(pg))&&(await pg.evaluate(()=>V==='farm'&&FT==='town')));
 ok('D6 旧町のタブ(農園の中の「町」)が残っている',await pg.evaluate(()=>{V='farm';FT='farm';render();return document.body.innerText.includes('町')}));await ctx.close()}

// ---- ホームと町の行き来・ホームの正常表示 ----
{const {ctx,pg}=await home(915,412,2);const s0=await sto(pg);let good=true,roots=true;
 for(let i=0;i<6;i++){await pg.click(TW);await pg.waitForTimeout(450);if(!(await opened(pg)))good=false;if((await pg.locator('#vilroot').count())!==1)roots=false;
  await backHome(pg);if(await opened(pg))good=false;if((await pg.locator('#vilroot').count())!==0)roots=false;
  if(!(await pg.evaluate(()=>HOMEMAP&&!!document.querySelector('.hb')&&document.getElementById('app').style.display!=='none')))good=false}
 ok('E1 ホーム⇔町を6回くり返しても、毎回開閉できる',good);ok('E2 町の画面が重ならない(開いているとき1つ・閉じたとき0)',roots);
 const s1=await sto(pg);ok('E3 行き来で、世界樹・学習データ(elemVil 以外)は1文字も変わらない',J(nonVil(s1))===J(nonVil(s0)));
 ok('E4 町から戻ったホームの表示:4つのボタン・設定・相棒・ステータス',await pg.evaluate(()=>document.querySelectorAll('.hb button').length===4&&!!document.querySelector('.gr')&&!!document.querySelector('.pbtn')&&!!document.querySelector('.st')));
 await pg.screenshot({path:path.join(SHOTS,'5g_home_after_back_915x412.png')});ok('E5 エラー0',pg.errs.length===0);await ctx.close()}
// ホームの他のボタンへの影響(5f版との比較:町づくりボタン以外は同じ結果)
if(OLD){for(const lv of [1,2])for(const seen of [false,true])for(const id of ['word','elem','spirit','cave','book']){
  const res=[];for(const f of [('file://'+OLD),URL]){const {ctx,pg}=await home(915,412,lv,seen?{elemSx_word:'1',elemSx_elem:'1',elemSx_spirit:'1',elemSx_town:'1'}:null,f);
   await pg.evaluate(x=>homeGo(x),id);await pg.waitForTimeout(400);res.push(J(await pg.evaluate(SNAP)));await ctx.close()}
  ok(`F ホームの「${id}」(Lv${lv}・説明${seen?'済み':'未'}):5f版と同じ動き`,res[0]===res[1],res.join('  ≠  '))}
 {const res=[];for(const f of [('file://'+OLD),URL]){const {ctx,pg}=await home(915,412,1,null,f);await pg.evaluate(()=>homeGo('town'));await pg.waitForTimeout(300);res.push(J(await pg.evaluate(SNAP)));await ctx.close()}
  ok('F2 町づくりボタン(Lv1):5f版と同じ(鍵の案内)',res[0]===res[1],res.join(' ≠ '))}
 {const res=[];for(const f of [('file://'+OLD),URL]){const {ctx,pg}=await home(915,412,2,{elemSx_town:'1'},f);await pg.evaluate(()=>homeGo('town'));await pg.waitForTimeout(500);res.push(await pg.evaluate(SNAP));await ctx.close()}
  ok('F3 町づくりボタン(Lv2)の変更点=意図した変更だけ:5f版は旧町・今回は新しい町',res[0].V==='farm'&&res[0].FT==='town'&&!res[0].vil&&res[1].vil===true&&res[1].V===null,J(res))}}

// ---- 本番とテストの分離 ----
{const {ctx,pg}=await home(915,412,2,{elemVilTest:'TESTSENTINEL',elemVilTestBk:'TESTBK'});await pg.click(TW);await pg.waitForTimeout(500);await pg.evaluate(()=>{VIL.act.gather('wood1')});
 const st=await sto(pg);ok('G1 本番の町を遊んでも、テスト用キー(elemVilTest 系)は変わらない',st.elemVilTest==='TESTSENTINEL'&&st.elemVilTestBk==='TESTBK'&&!Object.keys(st).some(k=>/^elemVilTestBad_/.test(k)));
 ok('G2 本番の町は elemVil に保存される(採集が残る)',await pg.evaluate(()=>{const d=VIL.decode(localStorage.getItem('elemVil'));return d.ok&&d.s.store.items.wood===2}));
 await pg.evaluate(()=>{VILUI.goHome()});await pg.waitForTimeout(300);await pg.evaluate(()=>{location.hash='#x'});await pg.evaluate(()=>{location.hash='#vil'});await pg.waitForTimeout(600);
 const st2=await sto(pg);ok('G3 本番の町を開いたあと、テスト入口(#vil)は開かない・本番データを変えない',!(await opened(pg))&&st2.elemVil===st.elemVil&&st2.elemVilTest==='TESTSENTINEL');await ctx.close()}
{const {ctx,pg}=await home(915,412,2,null,URL,'#vil');
 ok('G4 テスト入口で始めたページ:テストの町が開く(テスト用キー)',(await opened(pg))&&(await mode(pg))==='test'&&!('elemVil' in await sto(pg)));
 await backHome(pg);await pg.evaluate(()=>{W.tree=TREE_XP[1];saveW();HOMEMAP=true;render()});await pg.waitForTimeout(300);await pg.click(TW);await pg.waitForTimeout(400);
 const st=await sto(pg);ok('G5 そのページでは、ホームのボタンから本番の町は開かない(案内を出す)・elemVil は作られない',!(await opened(pg))&&!('elemVil' in st)&&/テスト用/.test(await pg.evaluate(()=>HMSG)));await ctx.close()}
{const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(400);
 ok('G6 本番モードで本番キーをテスト用の消去で消そうとしても、拒否される',await pg.evaluate(()=>{const r=VIL.eraseTestData('ERASE_TEST');return r.ok===false&&r.reason==='refused'&&!!localStorage.getItem('elemVil')}));await ctx.close()}

// ---- 保存データが こわれている/読めない/保存できない ----
const GOOD=async()=>{const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(400);await pg.evaluate(()=>VIL.act.gather('wood1'));const st=await sto(pg);await ctx.close();return st};
const G0=await GOOD();
for(const [name,keys,expectOpen] of [
  ['本体がこわれている・バックアップなし',{elemVil:'{こわれた'},false],
  ['本体もバックアップもこわれている',{elemVil:'{x',elemVilBk:'{y'},false],
  ['バックアップだけこわれている(本体は正常)',{elemVil:G0.elemVil,elemVilBk:'{y'},true],
  ['本体がこわれている・バックアップは正常(復元)',{elemVil:'{こわれた',elemVilBk:G0.elemVil},true]]){
 const {ctx,pg}=await home(915,412,2,keys);const before=await sto(pg);await pg.click(TW);await pg.waitForTimeout(600);const after=await sto(pg);const op=await opened(pg);
 ok(`H ${name}:${expectOpen?'開く':'開かない'}`,op===expectOpen,J({op}));
 if(!expectOpen){ok(`H ${name}:保存データを初期データで上書きしない(本番キーは1文字も変わらない)`,J(vilKeys(after).map(k=>[k,after[k]]))===J(vilKeys(before).map(k=>[k,before[k]]))&&!vilKeys(after).some(k=>/Bad_/.test(k)));
  ok(`H ${name}:やさしい案内を出す・消去や新規開始の入口は使えない`,/データが よめないよ/.test(await pg.evaluate(()=>HMSG))&&await pg.evaluate(()=>VIL.eraseTestData('ERASE_TEST').ok===false&&!!localStorage.getItem('elemVil')));
  ok(`H ${name}:洞窟(旧町)は使える`,await (async()=>{await pg.click('.hl .gt');await pg.waitForTimeout(300);return await pg.evaluate(()=>V==='sx'||V==='farm')})())}
 else if(name.includes('復元')){ok(`H ${name}:復元された採集が見える・こわれた本体は とっておく`,await pg.evaluate(()=>VIL.get().store.items.wood===2)&&Object.keys(after).some(k=>/^elemVilBad_/.test(k)))}
 else ok(`H ${name}:進行が残っている`,await pg.evaluate(()=>VIL.get().store.items.wood===2));
 ok(`H ${name}:エラー0`,pg.errs.length===0);await ctx.close()}
{const ctx=await ctxNew(915,412);await ctx.addInitScript(()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(/^elemVil/.test(k))throw new Error('quota');return o.apply(this,arguments)}});const pg=await open(ctx,2);
 await pg.click(TW);await pg.waitForTimeout(500);ok('I1 保存できない環境では、新しい町を開かない・案内・本番キーは作られない',!(await opened(pg))&&/ほぞんが できない/.test(await pg.evaluate(()=>HMSG))&&vilKeys(await sto(pg)).length===0&&pg.errs.length===0);await ctx.close()}

// ---- 再入場・再読み込み・複数画面で進行が消えない ----
{const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(400);await pg.evaluate(()=>VIL.act.gather('wood1'));await pg.evaluate(()=>VIL.act.gather('stone1'));
 const a=await pg.evaluate(()=>JSON.stringify(VIL.get()));await backHome(pg);await pg.click(TW);await pg.waitForTimeout(400);const b1=await pg.evaluate(()=>JSON.stringify(VIL.get()));
 ok('J1 戻って再入場:資材・時刻・進行がそのまま',a===b1);await pg.reload();await pg.waitForTimeout(900);await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);
 await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}HOMEMAP=true;render()});await pg.click(TW);await pg.waitForTimeout(500);const c=JSON.parse(await pg.evaluate(()=>JSON.stringify(VIL.get())));
 ok('J2 再読み込み後に入りなおしても、資材・進行が残る(初期化・重複なし)',c.store.items.wood===2&&c.store.items.stone===2&&c.total.wood===2&&c.total.stone===2&&c.rev===JSON.parse(a).rev);await ctx.close()}
{const ctx=await ctxNew(915,412);const p1=await open(ctx,2),p2=await open(ctx,2);
 await p1.click(TW);await p1.waitForTimeout(400);await p1.evaluate(()=>VIL.act.gather('wood1'));await sleep(700);await p2.click(TW);await p2.waitForTimeout(500);
 ok('K1 2画面:あとから開いた画面に、先の画面の採集が見える',await p2.evaluate(()=>VIL.get().store.items.wood===2));
 await p2.evaluate(()=>VIL.act.gather('stone1'));await sleep(700);await p1.evaluate(()=>VILUI.tap('wood2'));await p1.waitForTimeout(600);await p1.evaluate(()=>VILUI.tap('wood2'));await p1.waitForTimeout(600);
 const f=await p1.evaluate(()=>{VIL.init();return VIL.get()});ok('K2 2画面の操作で、どちらの資材も古い状態に戻らない',f.store.items.stone===2&&f.store.items.wood>=2&&f.total.stone===2);
 ok('K3 エラー0',p1.errs.length+p2.errs.length===0);await ctx.close()}

// ---- 板材づくり中にホームへ戻って再入場 ----
{const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(400);
 await pg.evaluate(()=>VIL.commit(s=>{s.build.workshop=true;s.tut.ach.build=true;s.work={state:'run',item:'plank',end:Date.now()+4500}}));await pg.evaluate(()=>VILUI.draw());await backHome(pg);await sleep(1200);
 await pg.click(TW);await pg.waitForTimeout(500);const w1=await pg.evaluate(()=>VIL.act.workInfo());
 ok('L1 製作中に戻って再入場:残り時間が減っている・まだ未完成',w1&&w1.state==='run'&&w1.remain>500&&w1.remain<4500,J(w1));
 await backHome(pg);await sleep(4300);await pg.click(TW);await pg.waitForTimeout(600);const w2=await pg.evaluate(()=>VIL.act.workInfo());
 const col=await pg.evaluate(()=>VIL.act.collectPlank().ok);const pl=await pg.evaluate(()=>VIL.get().store.items.plank+VIL.get().pend.filter(p=>p.item==='plank').reduce((a,p)=>a+p.n,0));
 ok('L2 時間が過ぎたあとの再入場:完成として受け取れる(板材1個)',w2&&w2.state==='ready'&&col&&pl===1,J([w2,col,pl]));await ctx.close()}

// ---- チュートリアルの進行・完了確認済み ----
{const DONE=`VIL.commit(s=>{for(const k in s.tut.ach)s.tut.ach[k]=true;s.tut.done=true;s.build.workshop=true;s.store.slots=5;s.quest.list.first={p:4,done:true,claimed:true};s.total.wood=4})`;
 const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(400);await pg.evaluate(DONE);await pg.evaluate(()=>VILUI.draw());await pg.waitForTimeout(400);
 ok('M1 完了・未確認:町に入っている間は完了カードが出る',(await pg.locator('.vlfin').count())===1);
 await pg.evaluate(()=>VILUI.goHome());await pg.waitForTimeout(300);await pg.click(TW);await pg.waitForTimeout(600);ok('M2 確認前に戻って再入場:また出る',(await pg.locator('.vlfin').count())===1);
 await pg.click('.vlfin .fb');await pg.waitForTimeout(500);await backHome(pg);await pg.click(TW);await pg.waitForTimeout(600);
 ok('M3 「つぎへ」のあとは、戻って再入場しても出ない・seen と done が残る',(await pg.locator('.vlfin').count())===0&&await pg.evaluate(()=>VIL.get().tut.seen===true&&VIL.get().tut.done===true));
 await pg.reload();await pg.waitForTimeout(800);await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}HOMEMAP=true;render()});await pg.click(TW);await pg.waitForTimeout(600);
 ok('M4 再読み込み後も出ない・案内が残る',(await pg.locator('.vlfin').count())===0&&(await pg.locator('.vlgd .m').innerText()).includes('掲示板'));
 ok('M5 通常・学習の解放は tut.done どおり',await pg.evaluate(()=>VIL.act.board().normal.open&&VIL.act.board().learn.open));await ctx.close()}

// ---- 学習データ・旧町データは変わらない ----
{const {ctx,pg}=await home(915,412,2);const s0=await sto(pg);await pg.click(TW);await pg.waitForTimeout(400);await pg.evaluate(()=>{VIL.act.gather('wood1');VILUI.pnOpen('board')});await pg.waitForTimeout(300);await pg.evaluate(()=>VILUI.goHome());
 const s1=await sto(pg);ok('N1 町を遊んでも、学習・世界樹・旧町(elemWorld ほか elemVil 以外)は1文字も変わらない',J(nonVil(s1))===J(nonVil(s0)),Object.keys(nonVil(s1)).filter(k=>nonVil(s1)[k]!==nonVil(s0)[k]).join());
 ok('N2 新しい町の保存先と旧町の保存先は別(elemVil と elemWorld)','elemVil' in s1&&'elemWorld' in s1&&!s1.elemWorld.includes('"tut"')&&!s1.elemVil.includes('"tree"'));await ctx.close()}

// ---- 横向き5サイズ・漢字ひらがな・縦向き ----
for(const [w,h] of SIZES){const {ctx,pg}=await home(w,h,2);
 const hb=await pg.evaluate(()=>{const e=document.querySelector('.hb .tw').getBoundingClientRect();return{w:e.width,h:e.height,vis:e.top>=0&&e.bottom<=innerHeight&&e.left>=0&&e.right<=innerWidth}});
 await pg.click(TW);await pg.waitForTimeout(500);
 const m=await pg.evaluate(()=>{const bk=document.querySelector('.vlbar .vlb').getBoundingClientRect();return{op:VILUI.open,bk:[Math.round(bk.width),Math.round(bk.height)],inside:bk.top>=0&&bk.left>=0&&bk.bottom<=innerHeight}});
 ok(`P ${w}x${h}:ホームの町づくりボタンが見えて押せ、町が開き、「戻る」が見える(40px以上)`,hb.vis&&hb.w>=30&&hb.h>=30&&m.op&&m.inside&&m.bk[0]>=40&&m.bk[1]>=36,J({hb,m}));
 if(w===640||w===1910)await pg.screenshot({path:path.join(SHOTS,`5g_town_${w}x${h}.png`)});
 await backHome(pg);ok(`P2 ${w}x${h}:戻るとホームが正常に出る`,await pg.evaluate(()=>HOMEMAP&&!!document.querySelector('.hb .tw')&&!document.querySelector('#vilroot')));
 ok(`P3 ${w}x${h}:エラー0`,pg.errs.length===0);await ctx.close()}
{const {ctx,pg}=await home(915,412,2);await pg.evaluate(()=>{KID=true;render()});await pg.waitForTimeout(300);await pg.click(TW);await pg.waitForTimeout(500);
 const t=await pg.evaluate(()=>document.querySelector('.vlbar').innerText+' '+document.querySelector('.vlgd').innerText);ok('Q1 ひらがな表示で町が開く・バーと案内に漢字なし',(await opened(pg))&&!KJ.test(t),t);
 await pg.evaluate(()=>{KID=false;render()});await pg.waitForTimeout(300);ok('Q2 漢字表示に戻せる',await pg.evaluate(()=>/依頼/.test(document.querySelector('.vlgd').innerText)));await ctx.close()}
{const {ctx,pg}=await home(412,915,2);const rot=await pg.evaluate(()=>{const e=document.getElementById('rot');return e?getComputedStyle(e).display:'none'});await pg.evaluate(()=>homeGo('town'));await pg.waitForTimeout(400);
 const rot2=await pg.evaluate(()=>{const e=document.getElementById('rot');return e?getComputedStyle(e).display:'none'});ok('R 縦向き:従来の「横向きにしてね」の案内が出る(町を開いても同じ)',rot!=='none'&&rot2!=='none',J([rot,rot2]));await ctx.close()}
await b.close();let f=0;R.forEach(([n,c,x])=>{if(!c)f++;console.log((c?'PASS ':'FAIL ')+n+(c?'':'  '+x))});console.log('failed:',f,'/',R.length)})();
