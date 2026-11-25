// vil_5h_reload.js — 5h:再読み込みをくり返しても、保存データが消えない・町の進行が保たれることの確認(試行回数と失敗回数を報告)
// 実行: INDEX=/path/to/index.html [VIL_RELOAD_N=30] [VIL_SERVE=file(従来方式の参考)] node tests/vil_5h_reload.js
// 1回の試行 = あたらしい入れ物 → ホーム(Lv2)→ 町づくり → 資材と進行をつくる → 再読み込み×2 → 前後のキーと中身を比べる → 町を開きなおして進行を確かめる。
// 失敗の数え方: 保存データのキーが1つでも消えた/町のデータが前後で違う/進行が戻った/エラーがあった → その試行は失敗(再試行はしない・合格扱いにしない)。
const {chromium}=require('playwright');const path=require('path');const H=require('./lib_http.js');
const INDEX=path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html'));const N=+(process.env.VIL_RELOAD_N||30);
const R=[];const ok=(n,c,x)=>R.push([n,!!c,x===undefined?'':String(x)]);const J=JSON.stringify;let b,URL;
const keep=o=>{const r={};for(const k of Object.keys(o))if(/^elemVil|^elemWorld$|^elemSx_/.test(k))r[k]=o[k];return r};
(async()=>{await H.start([INDEX]);URL=H.u(INDEX);b=await chromium.launch();let fails=0,lostTr=0,diffTr=0,progTr=0,errTr=0;const detail=[];
for(let i=0;i<N;i++){
 const ctx=await b.newContext({viewport:{width:915,height:412}});
 await ctx.addInitScript(()=>{try{localStorage.setItem('elemSkipIntro','1');localStorage.setItem('elemOpDone','1');if(!localStorage.getItem('elemPartner'))localStorage.setItem('elemPartner','火')}catch(e){}});
 const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));
 await pg.goto(URL);await pg.waitForTimeout(900);await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);
 await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}HOMEMAP=true;render()});await pg.waitForTimeout(300);
 await pg.click('.hb .tw');await pg.waitForTimeout(600);
 const r=await pg.evaluate(()=>VIL.commit(s=>{s.tut.ach.arrive=true;s.total.wood=3+Math.floor(Math.random()*5);s.store.items.wood=2;s.store.items.stone=1}));
 const want=await pg.evaluate(()=>{const s=VIL.get();return{wood:s.total.wood,sw:s.store.items.wood,ss:s.store.items.stone}});
 await pg.waitForTimeout(250);const b0=await H.snap(pg);let bad=[];
 const rl1=await H.reload(pg,'試行'+(i+1)+'-1');await pg.waitForTimeout(700);const rl2=await H.reload(pg,'試行'+(i+1)+'-2');await pg.waitForTimeout(900);
 const a=await H.snap(pg);
 if(rl1.lost.length||rl2.lost.length){lostTr++;bad.push('保存データのキーが消えた:'+J([rl1.lost,rl2.lost]))}
 const k0=keep(b0),k1=keep(a);const ch=Object.keys(k0).filter(k=>k1[k]!==k0[k]);if(ch.length&&!(rl1.lost.length||rl2.lost.length)){diffTr++;bad.push('町・世界樹の保存データが前後で違う:'+J(ch))}
 if(!r.ok){bad.push('commit失敗 '+J(r))}
 if(!bad.length){await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}HOMEMAP=true;render()});await pg.waitForTimeout(300);await pg.click('.hb .tw');await pg.waitForTimeout(700);
  const got=await pg.evaluate(()=>{const s=VIL.get();return VILUI.open?{wood:s.total.wood,sw:s.store.items.wood,ss:s.store.items.stone,mode:VILUI.mode}:null});
  if(!got||got.wood!==want.wood||got.sw!==want.sw||got.ss!==want.ss||got.mode!=='live'){progTr++;bad.push('再読み込み後に町を開くと進行が違う:'+J([want,got]))}}
 if(pg.errs.length){errTr++;bad.push('ページエラー:'+pg.errs.join('|'))}
 if(bad.length){fails++;detail.push('試行'+(i+1)+': '+bad.join(' / '))}
 await ctx.close()}
console.log(`[試行] 方式=${H.mode} 試行回数=${N}(各試行で再読み込み2回=計${N*2}回)失敗した試行=${fails}(キー消失${lostTr}・データ相違${diffTr}・進行相違${progTr}・エラー${errTr})`);
for(const d of detail)console.log('  '+d);
ok(`RL1 再読み込みのくり返し(${H.mode}方式):${N}試行すべてで保存データ・町の進行が保たれる(失敗${fails}回)`,fails===0,detail.join(' ; ').slice(0,300));
await b.close();console.log(H.info());console.log(`[reload] 再読み込み回数=${H.stats.attempts} 保存データ消失=${H.stats.lost}`);await H.stop();let f=0;R.forEach(([n,c,x])=>{if(!c)f++;console.log((c?'PASS ':'FAIL ')+n+(c?'':'  '+x))});console.log('failed:',f,'/',R.length)})();
