// vil_5e_workshop.js — 町づくり5e(作業場:建築・板材づくり)+5b〜5dの主要動線の確認(76項目)
// 【注意】2026-11-23の環境入れ替えのあと、会話記録から組み直した確認です。旧テスト vil_test10.js(142項目)とは別物です。
// 実行: INDEX=/path/to/index.html node tests/vil_5e_workshop.js
const {chromium}=require('playwright');const fs=require('fs');
const path=require('path');const INDEX=path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html'));const URL='file://'+INDEX;const SHOTS=process.env.SHOTS||path.join(__dirname,'results','shots');const R=[];const ok=(n,c,x)=>R.push([n,!!c,x===undefined?'':String(x)]);
const J=JSON.stringify,KJ=/[㐀-鿿]/,sleep=ms=>new Promise(r=>setTimeout(r,ms));let b;
const ACH0=`s.tut.ach.arrive=true;s.tut.ach.quest=true;s.quest.list.first={p:4,done:true,claimed:true};s.total.wood=4;`;
const ENOUGH=`s=>{${ACH0}s.store.items.wood=6;s.store.items.stone=4}`,BUILT=w=>`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.store.items.wood=${w}}`;
const FULL=`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.store.items.wood=10;s.store.items.stone=10;s.store.items.plank=10;s.store.items.crystal=10;s.work={state:'run',item:'plank',end:Date.now()-1000}}`;
async function fresh(w,h,setup){const ctx=await b.newContext({viewport:{width:w,height:h}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
 const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));await pg.goto(URL+'#vil');await pg.waitForTimeout(700);
 if(setup){const r=await pg.evaluate(`VIL.commit(${setup})`);if(!r.ok)throw new Error(J(r));await pg.evaluate(()=>VILUI.draw())}return{ctx,pg}}
const S=pg=>pg.evaluate(()=>VIL.get()),wt=()=>sleep(760);
const tot=s=>{const t={wood:0,stone:0,plank:0,crystal:0};for(const k in t)t[k]=s.store.items[k]+s.pend.filter(p=>p.item===k).reduce((a,p)=>a+p.n,0);return t};
const adv=(pg,ms)=>pg.evaluate(ms=>{window.__o=(window.__o||0)+ms;VIL.now=()=>Date.now()+window.__o;VILUI.refresh()},ms);
const OPW=async pg=>{await pg.click('[data-h=workshop]');await pg.waitForTimeout(150)};
const txt=pg=>pg.evaluate(()=>{const e=document.querySelector('.vwk');return e?e.textContent.replace(/\s+/g,' ').trim():''});
const btn=pg=>pg.evaluate(()=>[...document.querySelectorAll('.vwk button')].filter(e=>!e.classList.contains('x')).map(e=>[e.textContent.trim(),e.disabled]));
const arm=pg=>pg.evaluate(()=>{window.__a=0;const f=SE.agari;SE.agari=function(){window.__a++;return f.apply(this,arguments)}});const ag=pg=>pg.evaluate(()=>window.__a|0);
(async()=>{b=await chromium.launch();
// 建築
{const {ctx,pg}=await fresh(915,412,`s=>{${ACH0}s.store.items.wood=5;s.store.items.stone=3}`);await OPW(pg);let t=await txt(pg);
 ok('A 建築前:不足表示・「たてる」停止・確認にも進めない',/木材\s*5 \/ 6/.test(t)&&t.includes('あと 1こ')&&(await btn(pg))[0][1]===true);
 const s0=J(await S(pg));await pg.evaluate(()=>{VILUI.wkBuild();VILUI.wkBuildGo()});ok('A2 不足のまま実行しても何も消費しない',J(await S(pg))===s0);await ctx.close()}
{const {ctx,pg}=await fresh(915,412,ENOUGH);await OPW(pg);const s0=await S(pg);await pg.click('.vwk .vwkgo');await pg.waitForTimeout(100);
 let t=await txt(pg),s1=await S(pg);ok('B1 確認画面(たてますか?・もどる/たてる)・資材も保存も変わらない',t.includes('たてますか?')&&(await btn(pg)).map(x=>x[0]).join()==='もどる,たてる'&&s1.rev===s0.rev&&s1.store.items.wood===6);
 await pg.click('.vwk .vwkrow .bt.gr');ok('B2 もどる:キャンセルで消費なし',!(await txt(pg)).includes('たてますか')&&(await S(pg)).rev===s0.rev);
 await pg.click('.vwk .vwkgo');await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);const s=await S(pg);
 ok('B3 たてる:木材6・石材4を消費・実績・建築済み表示・見た目が変わる',s.build.workshop&&s.store.items.wood===0&&s.store.items.stone===0&&s.tut.ach.build&&await pg.evaluate(()=>document.querySelector('.vlo[data-o=workshop]').dataset.b==='1'));
 ok('B4 ページエラー0',pg.errs.length===0);await ctx.close()}
// 板材
{const {ctx,pg}=await fresh(915,412,BUILT(2));await OPW(pg);await arm(pg);await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);let s=await S(pg),t=await txt(pg);
 ok('C1 製作開始:木材2消費・60秒・「ほかの ばしょに いっても…」と残り時間',s.store.items.wood===0&&s.work.state==='run'&&/あと (59|60) 秒/.test(t)&&t.includes('ほかの ばしょに いっても、じかんが たつと できあがるよ'));
 ok('C2 製作中は2件目・早い受け取りは不可',await pg.evaluate(()=>{const a=VIL.act.startPlank(),c=VIL.act.collectPlank();return !a.ok&&a.reason==='busy'&&!c.ok&&c.reason==='notready'}));
 await pg.click('.vwk .x');await adv(pg,61000);await pg.waitForTimeout(100);
 ok('C3 完成:作業場に赤い印・音1回(更新しても増えない)',await pg.evaluate(()=>{const e=document.querySelector('.vlo[data-o=workshop]');return e.classList.contains('nt')&&e.dataset.n==='1'})&&(await (async()=>{for(let i=0;i<3;i++)await adv(pg,1000);return await ag(pg)})())===1);
 await OPW(pg);await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);s=await S(pg);
 ok('C4 受け取り:板材+1・実績・空きに戻る・赤い印が消える',s.store.items.plank===1&&s.tut.ach.plank&&s.work.state==='idle'&&!(await pg.evaluate(()=>document.querySelector('.vlo[data-o=workshop]').classList.contains('nt'))));await ctx.close()}
{const {ctx,pg}=await fresh(640,300,FULL);const t0=tot(await S(pg));await OPW(pg);await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);const s=await S(pg),t=await txt(pg);
 ok('D 満杯:板材は受け取り待ち(作業場から)・総数+1・説明と「保管庫を ひらく」',s.pend.length===1&&s.pend[0].from==='work'&&tot(s).plank===t0.plank+1&&t.includes('受け取り待ちに 入ったよ')&&t.includes('保管庫を ひらく'));await ctx.close()}
// 再読み込み・音
{const {ctx,pg}=await fresh(915,412,`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.work={state:'run',item:'plank',end:Date.now()-5000}}`);
 await pg.reload();await pg.waitForTimeout(500);await arm(pg);await pg.waitForTimeout(2500);
 ok('E1 完成済みで再読み込み:印あり・音なし',(await pg.evaluate(()=>document.querySelector('.vlo[data-o=workshop]').classList.contains('nt')))&&(await ag(pg))===0);await ctx.close()}
// 安全:保存失敗・不明・連打・2画面
for(const [kind,setup,act] of [['build',ENOUGH,'build'],['start',BUILT(2),'startPlank'],['collect',`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.work={state:'run',item:'plank',end:Date.now()-1000}}`,'collectPlank']]){
 const rdy=async pg=>{await OPW(pg);if(kind==='build')await pg.click('.vwk .vwkgo')};
 {const {ctx,pg}=await fresh(915,412,setup);await rdy(pg);const s0=J(await S(pg));
  await pg.evaluate(()=>{const o=Storage.prototype.setItem;window.__o=o;Storage.prototype.setItem=function(k,v){if(k==='elemVilTest')throw new Error('q');return o.apply(this,arguments)}});
  await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);ok(`F-${kind} 保存失敗:状態不変・失敗の案内`,J(await S(pg))===s0&&/増えていない|使っていない|受け取っていない/.test(await pg.evaluate(()=>document.querySelector('.vwk .vphd b').textContent)));
  await pg.evaluate(()=>{Storage.prototype.setItem=window.__o});await wt();if(kind==='build')await pg.click('.vwk .vwkgo');await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);const s=await S(pg);
  ok(`F-${kind} やり直しで1回だけ成功`,kind==='build'?s.build.workshop&&s.store.items.wood===0:kind==='start'?s.work.state==='run':s.done.plank===1);await ctx.close()}
 for(const wf of [false,true]){const {ctx,pg}=await fresh(915,412,setup);await rdy(pg);const t0=tot(await S(pg));
  await pg.evaluate(w=>{const os=Storage.prototype.setItem,og=Storage.prototype.getItem;window.__arm=1;window.__blk=false;window.__c=0;const f=VIL.act[w[0]];VIL.act[w[0]]=function(){window.__c++;return f.apply(this,arguments)};
   if(w[1])Storage.prototype.setItem=function(k,v){if(k==='elemVilTest'&&window.__arm>0)throw new Error('w');return os.apply(this,arguments)};
   Storage.prototype.getItem=function(k){if(k==='elemVilTest'){if(window.__arm===1)window.__arm=2;else if(window.__arm===2||window.__blk){window.__blk=true;throw new Error('r')}}return og.apply(this,arguments)}},[act,wf]);
  await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);const u=await pg.evaluate(()=>({tt:VILUI.toastText,chk:!!VILUI.chk,dis:[...document.querySelectorAll('.vwkgo')].every(e=>e.disabled)}));
  const c0=await pg.evaluate(()=>window.__c);await pg.evaluate(()=>document.querySelectorAll('.vwkgo').forEach(x=>x.click()));await wt();await pg.evaluate(()=>document.querySelectorAll('.vwkgo').forEach(x=>x.click()));
  ok(`G-${kind}-${wf?'書けず':'書けた'} 結果不明:確認中表示・停止・くり返さない`,(u.tt||'').includes('確認しているよ')&&u.chk&&u.dis&&(await pg.evaluate(()=>window.__c))===c0);
  await pg.evaluate(()=>{window.__blk=false;window.__arm=0});for(let i=0;i<40&&await pg.evaluate(()=>!!VILUI.chk);i++)await sleep(150);
  await pg.reload();await pg.waitForTimeout(800);const s2=await S(pg),t1=tot(s2),d2=kind==='build'?s2.build.workshop:kind==='start'?s2.work.state==='run':s2.done.plank===1;
  ok(`G-${kind}-${wf?'書けず':'書けた'} 再読み込み後も整合(${wf?'未実行':'1回分のみ'})`,d2===!wf&&(kind==='build'?(wf?t1.wood===t0.wood:t1.wood===t0.wood-6):kind==='start'?(wf?t1.wood===t0.wood:t1.wood===t0.wood-2):(wf?t1.plank===t0.plank:t1.plank===t0.plank+1)));
  if(wf){await pg.evaluate(()=>VILUI.pnOpen('work'));await pg.waitForTimeout(150);if(kind==='build')await pg.click('.vwk .vwkgo');await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(300);const s3=await S(pg);ok(`G-${kind} 未実行から再実行して1回だけ成功`,kind==='build'?s3.build.workshop:kind==='start'?s3.work.state==='run':s3.done.plank===1)}
  ok(`G-${kind}-${wf?'書けず':'書けた'} エラー0`,pg.errs.length===0);await ctx.close()}}
{const {ctx,pg}=await fresh(915,412,BUILT(4));await OPW(pg);await pg.evaluate(()=>{window.__c=0;const f=VIL.act.startPlank;VIL.act.startPlank=function(){window.__c++;return f.apply(this,arguments)};const x=document.querySelector('.vwkgo');for(let i=0;i<5;i++)x.click()});await pg.waitForTimeout(300);
 ok('H 連打5回:1件・木材2のみ',(await S(pg)).store.items.wood===2&&(await pg.evaluate(()=>window.__c))===1);await ctx.close()}
{const ctx=await b.newContext({viewport:{width:915,height:412}});const p1=await ctx.newPage(),p2=await ctx.newPage();
 await p1.goto(URL+'#vil');await p1.waitForTimeout(600);await p1.evaluate(`VIL.commit(${ENOUGH})`);await p2.goto(URL+'#vil');await p2.waitForTimeout(600);
 for(const p of [p1,p2]){await p.click('[data-h=workshop]',{force:true});await p.click('.vwk .vwkgo',{force:true})}await p1.click('.vwk .vwkgo',{force:true});await p1.waitForTimeout(300);await p2.click('.vwk .vwkgo',{force:true});await p2.waitForTimeout(400);
 const s=await p1.evaluate(()=>{VIL.init();return VIL.get()});ok('I 2画面同時の建築:1回だけ',s.build.workshop&&s.store.items.wood===0&&s.store.items.stone===0);await ctx.close()}
// 案内・ひらがな
{const {ctx,pg}=await fresh(915,412,`s=>{${ACH0}s.store.items.wood=6;s.store.items.stone=4}`);const gm=()=>pg.evaluate(()=>document.querySelector('.vlgd .m').textContent);
 ok('J1 案内:作業場を たてよう',(await gm()).includes('作業場を たてよう'));await pg.click('.vlopen');ok('J2 ひらくで作業場',await pg.evaluate(()=>VILUI.pn&&VILUI.pn.view)==='work');
 await pg.click('.vwk .vwkgo');await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(250);await pg.click('.vwk .x');ok('J3 建築後:木材の採集案内',(await gm()).includes('木材が あと 2こ'));
 await pg.evaluate(()=>VIL.commit(s=>{s.store.items.wood=2}));await pg.evaluate(()=>VILUI.refresh());ok('J4 板材を つくろう',(await gm()).includes('板材を つくろう'));
 await pg.click('.vlopen');await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(250);await pg.click('.vwk .x');ok('J5 製作中の案内(あと N 秒)',/あと \d+ 秒/.test(await gm()));
 await adv(pg,61000);ok('J6 完成の案内',(await gm()).includes('板材が できたよ!'));await ctx.close()}
{const {ctx,pg}=await fresh(915,412,`s=>{${ACH0}s.store.items.wood=3;s.store.items.stone=1}`);await pg.evaluate(()=>{KID=true;VILUI.draw()});
 const chk=async n=>{const t=await txt(pg),g=await pg.evaluate(()=>document.querySelector('.vlgd').textContent),h=await pg.evaluate(()=>document.querySelector('.vwk .vphd b').textContent);ok(`K-${n} ひらがな:漢字なし`,!KJ.test(t+g+h),((t+g+h).match(/.{0,8}[㐀-鿿].{0,8}/)||[''])[0])};
 await OPW(pg);await chk('不足');await pg.evaluate(()=>{KID=false});await pg.evaluate(()=>VIL.commit(s=>{s.store.items.wood=6;s.store.items.stone=4}));await pg.evaluate(()=>{KID=true;VILUI.draw()});await OPW(pg);await chk('そろう');
 await pg.click('.vwk .vwkgo');await chk('確認');await wt();await pg.click('.vwk .vwkgo');await pg.waitForTimeout(250);await chk('建築直後');
 await pg.evaluate(()=>VIL.commit(s=>{s.store.items.wood=2}));await pg.evaluate(()=>VILUI.pnClose());await OPW(pg);await chk('つくれる');await pg.click('.vwk .vwkgo');await pg.waitForTimeout(250);await chk('製作中');await adv(pg,61000);await chk('完成');
 await pg.evaluate(()=>VIL.commit(s=>{s.store.items.wood=10;s.store.items.stone=10;s.store.items.plank=10;s.store.items.crystal=10}));await pg.click('.vwk .vwkgo');await pg.waitForTimeout(250);await chk('受け取り待ち');await ctx.close()}
// 5サイズ
const ST={'1不足':`s=>{${ACH0}s.store.items.wood=3;s.store.items.stone=1}`,'2そろう':ENOUGH,'3確認':ENOUGH,'4つくれる':BUILT(4),'5製作中':`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.work={state:'run',item:'plank',end:Date.now()+30000}}`,'6完成':`s=>{${ACH0}s.build.workshop=true;s.tut.ach.build=true;s.work={state:'run',item:'plank',end:Date.now()-1000}}`,'7受け取り待ち':FULL,'8待ちの木材':`s=>{${ACH0}s.store.items.wood=5;s.store.items.stone=4;s.pend.push({id:'p1',item:'wood',n:6,from:'gather'});s.seq=1}`};
fs.mkdirSync(SHOTS,{recursive:true});
for(const [w,h] of [[640,300],[780,330],[915,412],[1280,720],[1910,830]]){for(const kid of [false,true]){const {ctx,pg}=await fresh(w,h);const bad=[];
 for(const [name,st] of Object.entries(ST)){await pg.evaluate(()=>{VILUI.pn&&VILUI.pnClose()});await pg.evaluate(`VIL.eraseTestData('ERASE_TEST');VIL.init();VIL.commit(${st});KID=${kid};VILUI.draw()`);
  await pg.click('[data-h=workshop]');await pg.waitForTimeout(100);if(name==='3確認')await pg.click('.vwkgo');if(name==='7受け取り待ち'){await pg.click('.vwkgo');await pg.waitForTimeout(260)}await pg.waitForTimeout(80);
  const r=await pg.evaluate(()=>{const pn=document.querySelector('.vwk').getBoundingClientRect(),vs=document.querySelector('.vls').getBoundingClientRect(),gd=document.querySelector('.vlgd').getBoundingClientRect(),bar=document.querySelector('.vlbar').getBoundingClientRect();const out=[];
   for(const e of [...document.querySelectorAll('.vwk button')].filter(e=>e.offsetParent)){const q=e.getBoundingClientRect(),c=(e.closest('.vbqd')||document.querySelector('.vwk')).getBoundingClientRect(),t=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);out.push({inside:q.left>=c.left-1&&q.right<=c.right+1&&q.top>=c.top-1&&q.bottom<=c.bottom+1,top:e.contains(t),h:Math.round(q.height),w:Math.round(q.width)})}
   const fs=[...document.querySelectorAll('.vwk *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>parseFloat(getComputedStyle(e).fontSize));
   return{pn:[pn.left>=vs.left-1,pn.right<=vs.right+1,pn.top>=bar.bottom-1,pn.bottom<=gd.top+1],out,minFs:Math.min(...fs),sc:[...document.querySelectorAll('.vwk .vbqs')].some(e=>e.scrollHeight>e.clientHeight+1)}});
  const f=[];if(!r.pn.every(Boolean))f.push('panel');if(r.out.some(o=>!o.inside))f.push('clipped');if(r.out.some(o=>!o.top))f.push('covered');if(r.out.some(o=>o.h<39||o.w<39))f.push('tap<40');if(r.minFs<10.9)f.push('font'+r.minFs);if(r.sc)f.push('scroll');
  if(f.length)bad.push(name+':'+f.join('/'));if(!kid&&[[640,300],[915,412]].some(a=>a[0]===w))await pg.screenshot({path:path.join(SHOTS,`${name.slice(0,1)}_${w}x${h}.png`)})}
 ok(`S-${w}x${h}${kid?' ひらがな':''} 8状態:切れ・重なり・隠れなし/40px以上/11px以上/内容が切れない`,!bad.length,bad.join(';'));ok(`S-${w}x${h}${kid?' ひらがな':''} エラー0`,pg.errs.length===0);await ctx.close()}}
// 本番データ
{const REAL={elemVil:'REAL_MARKER',elemVilBk:'REAL_BK',elemVilBad_1:'REAL_BAD',elemKid:'0',elemStamp:'0'};const ctx=await b.newContext({viewport:{width:915,height:412}});const pg=await ctx.newPage();
 await pg.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){for(const k in s)localStorage.setItem(k,s[k]);sessionStorage.setItem('seeded','1')}},REAL);
 await pg.goto(URL);await pg.waitForTimeout(500);const snap=()=>pg.evaluate(()=>{const o={};for(const k of Object.keys(localStorage))o[k]=localStorage.getItem(k);return o});const b0=await snap();
 await pg.goto(URL+'#vil');await pg.waitForTimeout(500);await pg.reload();await pg.waitForTimeout(700);await pg.evaluate(`VIL.commit(${ENOUGH})`);await pg.evaluate(()=>VILUI.draw());
 await pg.click('[data-h=workshop]',{force:true});await pg.click('.vwkgo',{force:true});await wt();await pg.click('.vwkgo',{force:true});await pg.waitForTimeout(300);
 const a=await snap();const chg=Object.keys(a).filter(k=>!k.startsWith('elemVilTest')&&a[k]!==b0[k]);ok('N 本番キー・学習データは1文字も変わらない',!chg.length&&a.elemVil==='REAL_MARKER'&&a.elemVilBk==='REAL_BK');await ctx.close()}
await b.close();let f=0;R.forEach(([n,c,x])=>{if(!c)f++;console.log((c?'PASS ':'FAIL ')+n+(c?'':'  '+x))});console.log('failed:',f,'/',R.length)})();
