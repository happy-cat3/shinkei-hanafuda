// vil_5f_complete.js — 町づくり5f(チュートリアル完了演出・tut.seen・ふりかえり)の確認
// 実行: INDEX=/path/to/index.html [OLD=/path/to/前の版index.html] node tests/vil_5f_complete.js
// 【注意】旧テスト(912項目・5e専用142項目)のスクリプトは復旧できていません。これは5fのために新しく作ったものです。
// 本番の保存先(elemVil / elemVilBk / elemVilBad_*)は、#vil の入口では読まず・書かないことも確かめます。
const {chromium}=require('playwright');const path=require('path');
const INDEX=path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html'));const H=require('./lib_http.js');let URL;
const OLD=process.env.OLD?path.resolve(process.env.OLD):'';
const SHOTS=process.env.SHOTS||path.join(__dirname,'results','shots');
const R=[];const ok=(n,c,x)=>R.push([n,!!c,x===undefined?'':String(x)]);
const J=JSON.stringify,KJ=/[㐀-鿿]/,sleep=ms=>new Promise(r=>setTimeout(r,ms));let b;
const ACHALL=`s.tut.ach.arrive=true;s.tut.ach.quest=true;s.tut.ach.build=true;s.tut.ach.plank=true;s.tut.ach.expand=true;s.quest.list.first={p:4,done:true,claimed:true};s.total.wood=4;s.build.workshop=true;s.store.slots=5;s.done.plank=1;`;
const DONE=`s=>{${ACHALL}s.tut.done=true}`;
const NOTDONE=`s=>{${ACHALL}s.tut.done=false}`;
async function fresh(w,h,setup,pre){const ctx=await b.newContext({viewport:{width:w,height:h}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
 const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));
 await pg.goto(URL+'#vil');await pg.waitForTimeout(700);
 await pg.evaluate(()=>{window.__a=0;const f=SE.agari;SE.agari=function(){window.__a++;return f.apply(this,arguments)}});
 if(pre)await pg.evaluate(pre);
 if(setup){const r=await pg.evaluate(`VIL.commit(${setup})`);if(!r.ok)throw new Error(J(r));await pg.evaluate(()=>VILUI.draw())}
 await pg.waitForTimeout(250);return{ctx,pg}}
const S=pg=>pg.evaluate(()=>VIL.get()),ag=pg=>pg.evaluate(()=>window.__a|0),card=pg=>pg.locator('.vlfin').count();
const ftxt=pg=>pg.evaluate(()=>{const e=document.querySelector('.vlfin');return e?e.textContent.replace(/\s+/g,' ').trim():''});
const wt=()=>sleep(760);
const store=pg=>pg.evaluate(()=>{const o={};for(const k of Object.keys(localStorage))o[k]=localStorage.getItem(k);return o});
const rest=s=>{const r=JSON.parse(JSON.stringify(s));delete r.rev;delete r.saved;if(r.tut)delete r.tut.seen;return r};
(async()=>{await H.start([INDEX,OLD]);URL=H.u(INDEX);b=await chromium.launch();

// ---- 表示内容 ----
{const {ctx,pg}=await fresh(915,412,DONE);const t=await ftxt(pg);
 ok('A1 未確認で完了 → 完了カードが出る',(await card(pg))===1);
 ok('A2 見出し「町づくり はじめの一歩 クリア！」',t.includes('町づくり はじめの一歩 クリア！'));
 ok('A3 達成リスト5つ(指定の文言)',['依頼掲示板を 見た','はじめての依頼を 達成','作業場を たてた','板材を つくった','保管庫を 5わくにした'].every(x=>t.includes(x))&&(await pg.locator('.vlfin li').count())===5);
 ok('A4 解放の表示「通常依頼・学習依頼が 解放されました！」',t.includes('通常依頼・学習依頼が 解放されました！'));
 ok('A5 ルナ先生の案内文(指定)',t.includes('よく がんばったね！ これから、どんな町に なっていくのか たのしみだね。'));
 ok('A6 「つぎへ」ボタン1つ',(await pg.locator('.vlfin button').count())===1&&(await pg.locator('.vlfin .fb').innerText())==='つぎへ');
 ok('A7 「クリア！」が見出しの他の文字より大きい',await pg.evaluate(()=>{const e=document.querySelector('.vlfin h2 em'),h=document.querySelector('.vlfin h2');return parseFloat(getComputedStyle(e).fontSize)>parseFloat(getComputedStyle(h).fontSize)*1.3}));
 ok('A8 星(CSS)がある・新しい画像は使わない(カード内の img はルナ先生の既存画像だけ)',(await pg.locator('.vlfin .vfs').count())>=5&&await pg.evaluate(()=>[...document.querySelectorAll('.vlfin img')].length<=1));
 ok('A9 暗幕は半透明で、町の背景と物が後ろにある',await pg.evaluate(()=>{const o=document.querySelector('.vlfin'),c=getComputedStyle(o).backgroundColor,m=c.match(/rgba?\(([^)]+)\)/)[1].split(',').map(Number);return m.length===4&&m[3]>0&&m[3]<0.7&&!!document.querySelector('.vlbg')&&document.querySelectorAll('.vlo').length>=5}));
 ok('A10 暗幕の下の町は操作できない(木の位置を押すとカードが受ける)',await pg.evaluate(()=>{const t=document.querySelector('.vlo[data-o=wood1]').getBoundingClientRect();const e=document.elementFromPoint(t.x+t.width/2,t.y+t.height/2);return !!(e&&e.closest('.vlfin'))}));
 await pg.screenshot({path:path.join(SHOTS,'5f_card_915x412.png')});ok('A12 ページエラー0',pg.errs.length===0);await ctx.close()}

// ---- 効果音 ----
{const {ctx,pg}=await fresh(915,412,DONE);
 ok('B1 表示時に agari が1回',(await ag(pg))===1);
 await pg.evaluate(()=>{KID=true;render()});await pg.waitForTimeout(300);await pg.evaluate(()=>{KID=false;render()});await pg.evaluate(()=>VILUI.draw());await pg.waitForTimeout(2600);
 ok('B2 再描画・漢字/ひらがな切替・時間経過でも増えない',(await ag(pg))===1&&(await card(pg))===1);
 await pg.click('.vlfin .fb');await pg.waitForTimeout(500);await pg.waitForTimeout(1500);
 ok('B3 「つぎへ」のあと・確認済みでは鳴らない',(await ag(pg))===1&&(await card(pg))===0);
 await pg.evaluate(()=>VILUI.pnOpen('board'));await pg.waitForTimeout(200);await pg.click('.vbqr[data-q=review]');await pg.waitForTimeout(200);
 ok('B4 ふりかえりでは鳴らない',(await ag(pg))===1);await ctx.close()}
{const {ctx,pg}=await fresh(915,412,DONE);await H.reload(pg);await pg.waitForTimeout(900);
 ok('B5 未確認のまま再読み込み → 再表示される',(await card(pg))===1);await ctx.close()}
{const {ctx,pg}=await fresh(915,412,DONE,()=>{window.__au=0;const f=window.audio;window.audio=function(){window.__au++;return f.apply(this,arguments)};mute=true});
 ok('B6 消音設定を尊重(消音中は音を作らない)',(await card(pg))===1&&(await pg.evaluate(()=>window.__au))===0);await ctx.close()}

// ---- 保存・確認済み ----
{const {ctx,pg}=await fresh(915,412,DONE);const s0=await S(pg);const st0=await store(pg);
 ok('C1 旧データ(seen なし)は未確認として読める・検証も通る',!('seen' in s0.tut)&&(await pg.evaluate(()=>VIL.validate(VIL.get())))===null&&(await card(pg))===1);
 await pg.click('.vlfin .fb');await pg.waitForTimeout(500);const s1=await S(pg),st1=await store(pg);
 ok('C2 「つぎへ」→ tut.seen===true が保存され、カードが閉じる',s1.tut.seen===true&&(await card(pg))===0&&await pg.evaluate(()=>{const d=VIL.decode(localStorage.getItem(VIL.KEY));return d.ok&&d.s.tut.seen===true}));
 ok('C3 tut.done と他の保存データは変わらない・報酬(資材・結晶・実績・replay)なし',J(rest(s1))===J(rest(s0))&&s1.tut.done===true&&s1.tut.replay===false&&J(s1.store)===J(s0.store)&&J(s1.total)===J(s0.total));
 const chg=Object.keys(st1).filter(k=>!k.startsWith('elemVilTest')&&st1[k]!==st0[k]);ok('C4 本番キー・学習データは変わらない',chg.length===0&&!('elemVil' in st1));
 await H.reload(pg);await pg.waitForTimeout(900);ok('C5 再読み込み・再ログイン後は自動表示しない(音も鳴らない)',(await card(pg))===0&&(await ag(pg))===0&&(await S(pg)).tut.seen===true);
 ok('C6 完了後の案内文(指定)',(await pg.locator('.vlgd .m').innerText())==='通常・学習の 依頼が ひらいたよ。掲示板を 見てみよう！');
 ok('C7 解放専用の赤い印は付かない(掲示板・保管庫・作業場とも)',await pg.evaluate(()=>document.querySelectorAll('.vlo.nt').length===0));await ctx.close()}
{const {ctx,pg}=await fresh(915,412,NOTDONE);
 ok('D1 tut.done が false なら、全実績がそろっていてもカードは出ない・seen も書かない',(await card(pg))===0&&(await S(pg)).tut.seen===undefined);
 await pg.evaluate(()=>VILUI.finNext());await pg.waitForTimeout(300);ok('D2 完了前に確認済みは書けない',(await S(pg)).tut.seen===undefined&&!(await pg.evaluate(()=>VIL.act.board().normal.open)));
 await pg.evaluate(()=>VIL.commit(s=>{s.tut.seen=true}));
 ok('D3 seen は進行条件ではない(seen=true・done=false でも通常・学習は閉じたまま)',!(await pg.evaluate(()=>VIL.act.board().normal.open))&&!(await pg.evaluate(()=>VIL.act.board().learn.open)));await ctx.close()}
{const {ctx,pg}=await fresh(915,412,DONE);
 ok('D4 未確認(done=true)でも通常・学習の解放は tut.done どおり',await pg.evaluate(()=>VIL.act.board().normal.open&&VIL.act.board().learn.open));await ctx.close()}
for(const v of ['x',1,0,'true',null,{},[],false]){const {ctx,pg}=await fresh(915,412,`s=>{${ACHALL}s.tut.done=true;s.tut.seen=${J(v)}}`);
 const shown=(await card(pg))===1;await pg.click('.vlfin .fb');await pg.waitForTimeout(500);
 ok(`E 不正な seen(${J(v)})は未確認 → カードが出て、「つぎへ」で true になる`,shown&&(await S(pg)).tut.seen===true&&(await card(pg))===0);await ctx.close()}
{const {ctx,pg}=await fresh(915,412,`s=>{${ACHALL}s.tut.done=true;s.tut.seen=true}`);ok('E2 seen===true なら出ない',(await card(pg))===0&&(await ag(pg))===0);await ctx.close()}
// 途中終了
{const {ctx,pg}=await fresh(915,412,DONE);await H.reload(pg);await pg.waitForTimeout(900);ok('F1 つぎへ前に終了(再読み込み)→ 次回また表示',(await card(pg))===1&&(await S(pg)).tut.seen===undefined);
 // 注:テスト入口(#vil)は、町を出たあとの再入場を再読み込みなしでは行えない(5aからの仕様)ので、再入場の確認は再読み込みで代える
 
 await ctx.close()}
// 窓が開いているあいだは出さない
{const {ctx,pg}=await fresh(915,412,NOTDONE);await pg.evaluate(()=>VILUI.pnOpen('main'));await pg.evaluate(()=>VIL.commit(s=>{s.tut.done=true}));await pg.evaluate(()=>VILUI.refresh());await pg.waitForTimeout(300);
 ok('G1 窓(保管庫)が開いているあいだはカードを出さない',(await card(pg))===0);await pg.evaluate(()=>VILUI.pnClose());await pg.waitForTimeout(100);ok('G2 窓を閉じた直後にカードが出る(1秒待たない)',(await card(pg))===1&&(await ag(pg))===1);await ctx.close()}

// ---- 保存失敗・保存結果不明 ----
{const {ctx,pg}=await fresh(915,412,DONE);const s0=J(await S(pg));
 await pg.evaluate(()=>{const o=Storage.prototype.setItem;window.__o=o;Storage.prototype.setItem=function(k,v){if(k==='elemVilTest')throw new Error('q');return o.apply(this,arguments)}});
 await wt();await pg.click('.vlfin .fb');await pg.waitForTimeout(400);
 ok('H1 保存失敗:カードを維持・状態不変・失敗の案内・再試行できる',(await card(pg))===1&&J(await S(pg))===s0&&/うまく保存できなかったよ/.test(await ftxt(pg))&&!(await pg.locator('.vlfin .fb').isDisabled()));
 await pg.evaluate(()=>{Storage.prototype.setItem=window.__o});await wt();await pg.click('.vlfin .fb');await pg.waitForTimeout(400);
 ok('H2 やり直しで確認済みになり、閉じる(1回だけ)',(await S(pg)).tut.seen===true&&(await card(pg))===0);ok('H3 エラー0',pg.errs.length===0);await ctx.close()}
for(const wf of [false,true]){const {ctx,pg}=await fresh(915,412,DONE);const s0=await S(pg);
 await pg.evaluate(w=>{const os=Storage.prototype.setItem,og=Storage.prototype.getItem;window.__arm=1;window.__blk=false;window.__c=0;const f=VIL.commit;VIL.commit=function(){window.__c++;return f.apply(this,arguments)};
  if(w)Storage.prototype.setItem=function(k,v){if(k==='elemVilTest'&&window.__arm>0)throw new Error('w');return os.apply(this,arguments)};
  Storage.prototype.getItem=function(k){if(k==='elemVilTest'){if(window.__arm===1)window.__arm=2;else if(window.__arm===2||window.__blk){window.__blk=true;throw new Error('r')}}return og.apply(this,arguments)}},wf);
 await wt();await pg.click('.vlfin .fb');await pg.waitForTimeout(300);
 const u=await pg.evaluate(()=>({chk:!!VILUI.chk,dis:document.querySelector('.vlfin .fb').disabled,c:window.__c,st:VIL.status().unsure}));const msg=await ftxt(pg);
 ok(`I-${wf?'書けず':'書けた'}1 結果不明:カード維持・確認中表示・ボタン停止`,(await card(pg))===1&&u.chk&&u.dis&&u.st&&msg.includes('確認しているよ'));
 await pg.evaluate(()=>document.querySelector('.vlfin .fb').click());await wt();await pg.evaluate(()=>document.querySelector('.vlfin .fb').click());
 ok(`I-${wf?'書けず':'書けた'}2 確認中は同じ書き込みをくり返さない`,(await pg.evaluate(()=>window.__c))===u.c);
 await pg.evaluate(()=>{window.__blk=false;window.__arm=0});for(let i=0;i<40&&await pg.evaluate(()=>!!VILUI.chk);i++)await sleep(150);
 if(!wf)ok('I-書けた3 確認できたら確認済みとして閉じる',(await card(pg))===0&&(await S(pg)).tut.seen===true);
 else{ok('I-書けず3 書けていなかったと確認 → カード維持・失敗の案内',(await card(pg))===1&&(await S(pg)).tut.seen===undefined&&/うまく保存できなかったよ/.test(await ftxt(pg)));
  await wt();await pg.click('.vlfin .fb');await pg.waitForTimeout(400);ok('I-書けず4 再試行で1回だけ成功',(await S(pg)).tut.seen===true&&(await card(pg))===0)}
 await H.reload(pg);await pg.waitForTimeout(900);
 ok(`I-${wf?'書けず':'書けた'}5 再読み込み後も整合(確認済み・カードなし・資材そのまま)`,(await S(pg)).tut.seen===true&&(await card(pg))===0&&J((await S(pg)).store)===J(s0.store));ok(`I-${wf?'書けず':'書けた'}6 エラー0`,pg.errs.length===0);await ctx.close()}
// 結果不明のまま再読み込み(書けたか・書けなかったか分からないままページを閉じた)
for(const wf of [false,true]){const {ctx,pg}=await fresh(915,412,DONE);
 await pg.evaluate(w=>{const os=Storage.prototype.setItem,og=Storage.prototype.getItem;window.__arm=1;
  if(w)Storage.prototype.setItem=function(k,v){if(k==='elemVilTest'&&window.__arm>0)throw new Error('w');return os.apply(this,arguments)};
  Storage.prototype.getItem=function(k){if(k==='elemVilTest'){if(window.__arm===1)window.__arm=2;else if(window.__arm===2)throw new Error('r')}return og.apply(this,arguments)}},wf);
 await wt();await pg.click('.vlfin .fb');await pg.waitForTimeout(300);await pg.evaluate(()=>{window.__arm=0});await H.reload(pg);await pg.waitForTimeout(900);
 const sv=(await S(pg)).tut.seen===true;ok(`J-${wf?'書けず':'書けた'} 結果不明のまま再読み込み:${wf?'未確認なのでカード再表示':'確認済みなのでカードなし'}・二重なし`,wf?(!sv&&(await card(pg))===1):(sv&&(await card(pg))===0));await ctx.close()}
// 保存が確定するまで新しくは出さない
{const {ctx,pg}=await fresh(915,412,NOTDONE);await pg.evaluate(()=>VILUI.pnOpen('main'));await pg.evaluate(()=>VIL.commit(s=>{s.tut.done=true}));
 await pg.evaluate(()=>{const os=Storage.prototype.setItem,og=Storage.prototype.getItem;window.__arm=1;window.__blk=false;
  Storage.prototype.getItem=function(k){if(k==='elemVilTest'){if(window.__arm===1)window.__arm=2;else if(window.__arm===2||window.__blk){window.__blk=true;throw new Error('r')}}return og.apply(this,arguments)};
  const r=VIL.act.gather('wood1');window.__r=r.reason});
 const u=await pg.evaluate(()=>({r:window.__r,un:VIL.status().unsure}));await pg.evaluate(()=>VILUI.pnClose());await pg.waitForTimeout(400);
 ok('K1 保存結果不明のあいだは、窓を閉じてもカードを新しく出さない',u.un&&(await card(pg))===0);
 await pg.evaluate(()=>{window.__blk=false;window.__arm=0;VIL.reverify();VILUI.refresh()});await pg.waitForTimeout(400);ok('K2 保存が確定したら出る',(await card(pg))===1);await ctx.close()}
// 連打
{const {ctx,pg}=await fresh(915,412,DONE);await pg.evaluate(()=>{window.__c=0;const f=VIL.commit;VIL.commit=function(){window.__c++;return f.apply(this,arguments)};const x=document.querySelector('.vlfin .fb');for(let i=0;i<6;i++)x.click()});await pg.waitForTimeout(400);
 ok('L 連打6回:保存は1回だけ',(await pg.evaluate(()=>window.__c))===1&&(await S(pg)).tut.seen===true);await ctx.close()}

// ---- 複数画面 ----
{const ctx=await b.newContext({viewport:{width:915,height:412}});const p1=await ctx.newPage(),p2=await ctx.newPage();p1.errs=[];p2.errs=[];[p1,p2].forEach(p=>p.on('pageerror',e=>p.errs.push(e.message)));
 await p1.goto(URL+'#vil');await p1.waitForTimeout(600);await p1.evaluate(`VIL.commit(${DONE})`);await p1.evaluate(()=>VILUI.draw());
 await p2.goto(URL+'#vil');await p2.waitForTimeout(800);
 ok('M1 2画面とも、未確認ならカードが出る',(await card(p1))===1&&(await card(p2))===1);
 await p1.click('.vlfin .fb');await p1.waitForTimeout(400);await p1.evaluate(()=>VIL.act.gather('wood1'));
 ok('M2 先に確認した画面ではカードが閉じる。別画面のカードは自動では閉じない',(await card(p1))===0&&(await card(p2))===1);
 const w1=(await p1.evaluate(()=>VIL.get())).store.items.wood;
 await p2.click('.vlfin .fb');await p2.waitForTimeout(500);
 const sf=await p2.evaluate(()=>{VIL.init();return VIL.get()});
 ok('M3 古い画面で「つぎへ」→ 最新を読み込み、確認済みとして閉じる',(await card(p2))===0&&sf.tut.seen===true);
 ok('M4 別画面の資材(採集)が古い状態に戻らない',sf.store.items.wood===w1&&w1>=2&&sf.total.wood>=6);
 ok('M5 保存データの版(rev)は戻らない',sf.rev>=3);ok('M6 エラー0',p1.errs.length+p2.errs.length===0);await ctx.close()}
{const ctx=await b.newContext({viewport:{width:915,height:412}});const p1=await ctx.newPage(),p2=await ctx.newPage();
 await p1.goto(URL+'#vil');await p1.waitForTimeout(600);await p1.evaluate(`VIL.commit(${DONE})`);await p1.evaluate(()=>VILUI.draw());await p2.goto(URL+'#vil');await p2.waitForTimeout(800);
 await p1.evaluate(()=>VIL.act.gather('stone1'));await p2.click('.vlfin .fb');await p2.waitForTimeout(500);
 const sf=await p2.evaluate(()=>{VIL.init();return VIL.get()});
 ok('M7 別画面が先に資材を変えたあとの「つぎへ」でも、資材は戻らず、確認済みになる',sf.tut.seen===true&&sf.store.items.stone===2&&(await card(p2))===0);await ctx.close()}

// ---- ふりかえり ----
{const {ctx,pg}=await fresh(915,412,NOTDONE);await pg.evaluate(()=>VILUI.pnOpen('board'));await pg.waitForTimeout(200);
 ok('N1 完了前は「ふりかえり」を出さない',(await pg.locator('.vbqr[data-q=review]').count())===0);await ctx.close()}
{const {ctx,pg}=await fresh(915,412,`s=>{${ACHALL}s.tut.done=true;s.tut.seen=true}`);await pg.evaluate(()=>VILUI.pnOpen('board'));await pg.waitForTimeout(200);
 ok('N2 完了後は物語タブに「チュートリアルのふりかえり」が出る',(await pg.locator('.vbqr[data-q=review]').count())===1&&(await pg.locator('.vbqr[data-q=review]').innerText()).includes('チュートリアルのふりかえり'));
 await pg.evaluate(()=>{window.__w=0;const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k){if(String(k).startsWith('elemVil'))window.__w++;return o.apply(this,arguments)};window.__cm=0;const f=VIL.commit;VIL.commit=function(){window.__cm++;return f.apply(this,arguments)}});
 const s0=J(await S(pg)),a0=await ag(pg);await pg.click('.vbqr[data-q=review]');await pg.waitForTimeout(300);const t=await pg.evaluate(()=>document.querySelector('.vbq .vbqd').textContent.replace(/\s+/g,' '));
 ok('N3 ふりかえり:5つの達成と「見るだけ」の説明',/見るだけだよ。ごほうびは もらえないよ。/.test(t)&&['依頼掲示板を 見た','はじめての依頼を 達成','作業場を たてた','板材を つくった','保管庫を 5わくにした'].every(x=>t.includes(x)));
 ok('N4 ふりかえりは読み取り専用:ボタンなし',(await pg.locator('.vbq .vbqd button').count())===0);
 ok('N5 保存へ書かない・commit を呼ばない・状態不変・音なし',(await pg.evaluate(()=>window.__w))===0&&(await pg.evaluate(()=>window.__cm))===0&&J(await S(pg))===s0&&(await ag(pg))===a0);
 await pg.click('.vbqt[data-cat=normal]');await pg.waitForTimeout(150);ok('N6 通常タブには出ない・「準備中」のまま(依頼の内容は追加しない)',(await pg.locator('.vbqr[data-q=review]').count())===0&&(await pg.locator('.vbq .vbqd').innerText()).includes('準備中'));
 await pg.click('.vbqt[data-cat=story]');await pg.waitForTimeout(150);ok('N7 物語の最初の依頼は従来どおり(受け取り済み)',(await pg.locator('.vbqr[data-q=first]').count())===1);await ctx.close()}
// ふりかえりの5項目が、最小サイズ(640x300)でも切れずに見える
for(const kid of [false,true]){const {ctx,pg}=await fresh(640,300,`s=>{${ACHALL}s.tut.done=true;s.tut.seen=true}`,kid?()=>{KID=true}:null);await pg.evaluate(k=>{KID=k;render()},kid);await pg.evaluate(()=>VILUI.pnOpen('board'));await pg.waitForTimeout(200);await pg.click('.vbqr[data-q=review]');await pg.waitForTimeout(250);
 const m=await pg.evaluate(()=>{const e=document.querySelector('.vbq .vbqs'),r=e.getBoundingClientRect();return{noscroll:e.scrollHeight<=e.clientHeight+1,lis:[...e.querySelectorAll('li')].every(l=>{const q=l.getBoundingClientRect();return q.bottom<=r.bottom+1&&q.top>=r.top-1}),n:e.querySelectorAll('li').length}});
 ok(`N8 640x300${kid?' ひらがな':''}:ふりかえりの5項目が切れずに見える`,m.n===5&&m.noscroll&&m.lis,J(m));await ctx.close()}
// 既存の赤い印は変えない
{const {ctx,pg}=await fresh(915,412,`s=>{${ACHALL}s.tut.done=true;s.tut.seen=true;s.quest.list.first={p:4,done:true,claimed:false}}`);
 ok('O 受け取れる報酬の赤い印は従来どおり(掲示板に表示)',await pg.evaluate(()=>document.querySelector('.vlo[data-o=board]').classList.contains('nt')));await ctx.close()}

// ---- 漢字/ひらがな・5サイズ ----
{const {ctx,pg}=await fresh(915,412,DONE);await pg.evaluate(()=>{KID=true;render()});await pg.waitForTimeout(300);const t=await ftxt(pg);
 ok('P1 ひらがな表示:カード内に漢字が残らない',!KJ.test(t),t.match(KJ)&&t.match(/.{0,6}[㐀-鿿].{0,6}/g));
 ok('P2 ひらがな表示の文言(見出し・解放・案内)',t.includes('まちづくり はじめのいっぽ クリア！')&&t.includes('つうじょういらい・がくしゅういらいが かいほうされました！')&&t.includes('どんな まちに'));
 await pg.screenshot({path:path.join(SHOTS,'5f_card_hira_915x412.png')});await pg.click('.vlfin .fb');await pg.waitForTimeout(600);
 const g=await pg.locator('.vlgd .m').innerText();ok('P3 ひらがな表示の完了後の案内に漢字なし',!KJ.test(g)&&g.includes('けいじばん'),g);
 await pg.evaluate(()=>VILUI.pnOpen('board'));await pg.waitForTimeout(200);await pg.click('.vbqr[data-q=review]');await pg.waitForTimeout(200);const rv=await pg.evaluate(()=>document.querySelector('.vbq').textContent);
 ok('P4 ひらがな表示のふりかえりに漢字なし',!KJ.test(rv),rv.match(/.{0,6}[㐀-鿿].{0,6}/g));await ctx.close()}
for(const [w,h] of [[640,300],[780,330],[915,412],[1280,720],[1910,830]]){for(const kid of [false,true]){
 const {ctx,pg}=await fresh(w,h,DONE,kid?()=>{KID=true}:null);await pg.evaluate(k=>{KID=k;render()},kid);await pg.waitForTimeout(500);
 const m=await pg.evaluate(()=>{const st=document.querySelector('.vls').getBoundingClientRect(),fc=document.querySelector('.vlfin .fc').getBoundingClientRect(),el=document.querySelector('.vlfin .fc'),bt=document.querySelector('.vlfin .fb').getBoundingClientRect();
  const parts=['h2','ul','.fu','.fl','.fb'].map(q=>document.querySelector('.vlfin '+q).getBoundingClientRect());let ov=false;for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){const a=parts[i],c=parts[j];if(a.left<c.right-1&&c.left<a.right-1&&a.top<c.bottom-1&&c.top<a.bottom-1)ov=true}
  const fs=[...document.querySelectorAll('.vlfin h2,.vlfin li,.vlfin .fu,.vlfin .fl div,.vlfin .fb')].map(e=>parseFloat(getComputedStyle(e).fontSize));
  const cl=[...document.querySelectorAll('.vlfin h2,.vlfin li,.vlfin .fu,.vlfin .fl div,.vlfin .fb')].some(e=>e.scrollWidth>e.clientWidth+1);
  return{inside:fc.left>=st.left-1&&fc.right<=st.right+1&&fc.top>=st.top-1&&fc.bottom<=st.bottom+1,btnIn:bt.top>=st.top&&bt.bottom<=st.bottom&&bt.left>=st.left&&bt.right<=st.right,bh:bt.height,bw:bt.width,ov,minfs:Math.min(...fs),noscroll:el.scrollHeight<=el.clientHeight+1,cl}});
 ok(`Q ${w}x${h}${kid?' ひらがな':''}:カード・ボタンが画面内・40px以上・重なり/切れなし・文字11px以上`,m.inside&&m.btnIn&&m.bh>=40&&m.bw>=40&&!m.ov&&m.minfs>=11&&m.noscroll&&!m.cl,J(m));
 if(!kid&&(w===640||w===1910))await pg.screenshot({path:path.join(SHOTS,`5f_card_${w}x${h}.png`)});
 ok(`Q2 ${w}x${h}${kid?' ひらがな':''}:「つぎへ」が押せて閉じる`,await (async()=>{await pg.click('.vlfin .fb');await pg.waitForTimeout(500);return (await card(pg))===0&&(await S(pg)).tut.seen===true})());
 await ctx.close()}}

// ---- 旧版との互換:seen が入った保存データを、前の版(OLD)が読めて、書いても seen が残る ----
if(OLD){const ctx=await b.newContext({viewport:{width:915,height:412}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
 await pg.goto(URL+'#vil');await pg.waitForTimeout(600);await pg.evaluate(`VIL.commit(${DONE})`);await pg.evaluate(()=>VILUI.draw());await pg.click('.vlfin .fb');await pg.waitForTimeout(400);
 const raw=await pg.evaluate(()=>localStorage.getItem('elemVilTest'));
 const pg2=await ctx.newPage();pg2.errs=[];pg2.on('pageerror',e=>pg2.errs.push(e.message));await pg2.goto(H.u(OLD)+'#vil');await pg2.waitForTimeout(700);
 await pg2.evaluate(r=>{localStorage.setItem('elemVilTest',r)},raw);await H.reload(pg2);await pg2.waitForTimeout(800);
 const st=await pg2.evaluate(()=>VIL.status());const s=await pg2.evaluate(()=>VIL.get());ok('R1 前の版:seen つきの保存データを正常に読める',st.status==='ok'&&s&&s.tut.seen===true&&pg2.errs.length===0,J(st));
 const r=await pg2.evaluate(()=>{VIL.now=()=>Date.now()+1e6;return VIL.act.gather('wood1')});const s2=await pg2.evaluate(()=>VIL.get());ok('R2 前の版で保存しても seen が消えない',r.ok&&s2.tut.seen===true);await ctx.close()}
// ---- 本番キー ----
{const ctx=await b.newContext({viewport:{width:915,height:412}});const pg=await ctx.newPage();await pg.goto(URL);await pg.waitForTimeout(500);
 await pg.evaluate(()=>{localStorage.setItem('elemVil','REAL_MARKER');localStorage.setItem('elemVilBk','REAL_BK')});const b0=await store(pg);
 await pg.goto(URL+'#vil');await pg.waitForTimeout(500);await H.reload(pg);await pg.waitForTimeout(700);await pg.evaluate(`VIL.commit(${DONE})`);await pg.evaluate(()=>VILUI.draw());await pg.click('.vlfin .fb');await pg.waitForTimeout(500);
 const a=await store(pg);const chg=Object.keys(a).filter(k=>!k.startsWith('elemVilTest')&&a[k]!==b0[k]);ok('S 本番キー(elemVil・elemVilBk)・学習データは1文字も変わらない',!chg.length&&a.elemVil==='REAL_MARKER'&&a.elemVilBk==='REAL_BK');await ctx.close()}
await b.close();H.finish(R);await H.stop();let f=0;R.forEach(([n,c,x])=>{if(!c)f++;console.log((c?'PASS ':'FAIL ')+n+(c?'':'  '+x))});console.log('failed:',f,'/',R.length)})();
