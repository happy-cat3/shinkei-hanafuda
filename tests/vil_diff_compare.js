// vil_diff_compare.js — 前の版(OLD)と今の版(NEW)で、同じ操作をしたときの保存データと画面の文言が一致するかを比べる(22場面)
// 5f以降:意図した変更(完了カードの表示・tut.seen)は INTENDED として分けて数え、それ以外の差(変えてはいけない既存機能)だけを DIFF とする。
// 採集・保管庫・受け取り待ち・入れかえ・拡張・掲示板・案内(到着〜依頼)。違いが出た場面だけ DIFF と表示する。
// 実行: OLD=/path/to/index_5d.html NEW=/path/to/index.html node tests/vil_diff_compare.js
const {chromium}=require('playwright');
const path=require('path');const OLD=path.resolve(process.env.OLD||'');const NEW=path.resolve(process.env.NEW||path.join(__dirname,'..','index.html'));const BASE=1800000000000;
async function run(file){const b=await chromium.launch();const out=[];
 const mk=async(setup)=>{const ctx=await b.newContext({viewport:{width:915,height:412}});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
  const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));
  await pg.addInitScript(B=>{window.__t=B;},BASE);
  await pg.goto('file://'+file+'#vil');await pg.waitForTimeout(700);
  await pg.evaluate(B=>{window.__o=0;VIL.now=()=>B+window.__o},BASE);
  if(setup){await pg.evaluate(`VIL.commit(${setup})`);await pg.evaluate(()=>VILUI.draw())}return{ctx,pg}};
 const adv=(pg,ms)=>pg.evaluate(ms=>{window.__o+=ms;VILUI.refresh()},ms);
 const snap=async(pg,tag)=>{const r=await pg.evaluate(()=>{const s=VIL.get();const strip=o=>JSON.parse(JSON.stringify(o));
   return{tag:null,items:s.store.items,slots:s.store.slots,pend:s.pend.map(p=>[p.item,p.n,p.from]),tut:s.tut,quest:s.quest,total:s.total,build:s.build,
    panel:(document.querySelector('.vlpn')||{textContent:''}).textContent.replace(/\s+/g,' ').trim(),pv:VILUI.pn&&VILUI.pn.view,bar:(document.querySelector('.vlres')||{textContent:''}).textContent,
    nt:[...document.querySelectorAll('.vlo.nt')].map(e=>e.dataset.o+':'+e.dataset.n).join(),fin:!!document.querySelector('.vlfin'),errs:0}});r.tag=tag;r.errs=pg.errs.length;out.push(r)};
 const wt=()=>new Promise(r=>setTimeout(r,760));
 // S1 採集(5b)
 {const {ctx,pg}=await mk();for(const id of ['wood1','wood2','stone1','stone2','wood1']){await pg.click(`[data-h=${id}]`);await pg.waitForTimeout(80);await snap(pg,'S1-'+id)}await adv(pg,31000);await pg.click('[data-h=wood1]');await pg.waitForTimeout(80);await snap(pg,'S1-again');await ctx.close()}
 // S2 満杯→受け取り待ち→受け取り/入れかえ/拡張(5c)
 {const {ctx,pg}=await mk(`s=>{s.tut.ach.arrive=true;s.tut.ach.quest=true;s.tut.ach.build=true;s.tut.ach.plank=true;s.build.workshop=true;s.store.items.wood=10;s.store.items.stone=10;s.store.items.plank=10;s.store.items.crystal=10;s.pend.push({id:'p1',item:'wood',n:6,from:'gather'},{id:'p2',item:'crystal',n:1,from:'reward'});s.seq=2}`);
  await snap(pg,'S2-start');await pg.click('[data-h=storage]');await snap(pg,'S2-main');await pg.click('.vlpn [data-pid=p1] button');await snap(pg,'S2-recv');await pg.click('#pngo');await snap(pg,'S2-swap');
  await pg.evaluate(()=>VILUI.pnGo('main'));await pg.click('.vlpn .tile.ex');await snap(pg,'S2-expand');await wt();await pg.click('#pngo');await wt();await snap(pg,'S2-expand-go');await pg.evaluate(()=>VILUI.pnClose());await snap(pg,'S2-end');await ctx.close()}
 // S3 掲示板(5d)
 {const {ctx,pg}=await mk();await pg.click('[data-h=board]');await snap(pg,'S3-open');
  await pg.evaluate(()=>VIL.commit(s=>{s.total.wood=4}));await pg.evaluate(()=>VILUI.pnClose());await pg.evaluate(()=>VILUI.pnOpen('board'));await snap(pg,'S3-done');await pg.click('.vbqgo');await wt();await snap(pg,'S3-claimed');
  await pg.click('.vbqt[data-cat=normal]');await snap(pg,'S3-normal');await ctx.close()}
 {const {ctx,pg}=await mk(`s=>{s.total.wood=4;s.store.items.wood=10;s.store.items.stone=10;s.store.items.plank=10;s.store.items.crystal=10}`);await pg.click('[data-h=board]');await pg.click('.vbqgo');await wt();await snap(pg,'S3b-pended');await ctx.close()}
 // S4 チュートリアルの案内(到着・依頼まで)
 {const {ctx,pg}=await mk();const g=async t=>{const r=await pg.evaluate(()=>JSON.stringify(VILUI.guideInfo()));out.push({tag:t,guide:r})};
  await g('G-arrive');await pg.click('[data-h=board]');await pg.evaluate(()=>VILUI.pnClose());await g('G-gather0');await pg.evaluate(()=>VIL.commit(s=>{s.total.wood=2}));await g('G-gather2');await pg.evaluate(()=>VIL.commit(s=>{s.total.wood=4}));await g('G-claim');await ctx.close()}
 await b.close();return out}
(async()=>{const a=await run(OLD),c=await run(NEW);let diff=0,intended=0;
 // 5fで意図して変わる項目:カードの有無(fin)と、案内文(完了後の seen 済みのときだけ)。ほかは1文字も変わってはいけない
 const strip=o=>{const r=JSON.parse(JSON.stringify(o));delete r.fin;if(r.tut&&r.tut.seen===undefined)delete r.tut.seen;return r};
 for(let i=0;i<a.length;i++){const x=JSON.stringify(strip(a[i])),y=JSON.stringify(strip(c[i]));
  if(c[i].fin&&!(c[i].tut&&c[i].tut.done&&c[i].tut.seen!==true&&!c[i].pv)){diff++;console.log('DIFF(想定外のカード表示)',a[i].tag)}
  else if(c[i].fin&&!a[i].fin){intended++;console.log('INTENDED(前の版にはない完了カードが出る。未確認・窓なし)',a[i].tag)}
  if(a[i].fin&&!c[i].fin){diff++;console.log('DIFF(前の版にあったカードが出なくなった)',a[i].tag)}
  if(x!==y){diff++;console.log('DIFF',a[i].tag);console.log(' OLD',x.slice(0,400));console.log(' NEW',y.slice(0,400))}}
 console.log('scenarios',a.length,'differences',diff,'intended',intended,'errsNEW',c.reduce((n,r)=>n+(r.errs||0),0))})()
