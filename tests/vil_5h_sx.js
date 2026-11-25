// vil_5h_sx.js — 5h:洞窟の説明窓(sxModal)と新しい町の入口の取り違えがないことの確認(SXCAVEの修正)
// 実行: INDEX=/path/to/index.html [OLD=/path/to/5gのindex.html] node tests/vil_5h_sx.js
// 守ること: 洞窟 → 従来どおり旧町 / ホームの「町づくり」ボタン → 新しい町 / 説明窓が何回出ても入口を取り違えない /
//           目印(SXCAVE)が残り続けない / 保存失敗でも意図しない画面遷移・データ変更がない。
// 【隔離】毎回あたらしいブラウザの入れ物(context)。実際の利用者データには触れない。保存の失敗は Storage.setItem を一時的に差し替えて再現する。
const {chromium}=require('playwright');const path=require('path');const H=require('./lib_http.js');
const INDEX=path.resolve(process.env.INDEX||path.join(__dirname,'..','index.html'));const OLD=process.env.OLD?path.resolve(process.env.OLD):'';
const SHOTS=process.env.SHOTS||path.join(__dirname,'results','shots');
const R=[];const ok=(n,c,x)=>R.push([n,!!c,x===undefined?'':String(x)]);const J=JSON.stringify;let b,URL,OURL;
const sto=pg=>pg.evaluate(()=>{const o={};for(const k of Object.keys(localStorage))o[k]=localStorage.getItem(k);return o});
const vilKeys=o=>Object.keys(o).filter(k=>/^elemVil/.test(k));
async function home(w,h,lv,keys,url){const ctx=await b.newContext({viewport:{width:w,height:h}});
 await ctx.addInitScript(k=>{try{localStorage.setItem('elemSkipIntro','1');localStorage.setItem('elemOpDone','1');if(!localStorage.getItem('elemPartner'))localStorage.setItem('elemPartner','火');for(const x in (k||{}))if(localStorage.getItem(x)===null)localStorage.setItem(x,k[x])}catch(e){}},keys||null);
 const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
 const oc=pg.click.bind(pg);pg.click=(s,o)=>oc(s,Object.assign({force:true},o));
 await pg.goto(url||URL);await pg.waitForTimeout(900);await pg.evaluate(()=>{try{opEnd()}catch(e){}});await pg.waitForTimeout(1300);
 if(lv>=2)await pg.evaluate(()=>{if(wlv()<2){W.tree=TREE_XP[1];saveW()}});
 await pg.evaluate(()=>{HOMEMAP=true;render()});await pg.waitForTimeout(300);return{ctx,pg}}
const st=pg=>pg.evaluate(()=>({V:V||null,FT:typeof FT==='undefined'?null:FT,SXID:SXID||null,SXCAVE,vil:VILUI.open,mode:VILUI.mode,sx:!!document.querySelector('.md .b[onclick="sxOk()"]')}));
const oldTown=s=>s.V==='farm'&&s.FT==='town'&&!s.vil;
const failSx=pg=>pg.evaluate(()=>{window.__o=Storage.prototype.setItem;window.__n=0;Storage.prototype.setItem=function(k,v){if(/^elemSx_/.test(k)){window.__n++;throw new Error('quota')}return window.__o.call(this,k,v)}});
const okSx=pg=>pg.evaluate(()=>{Storage.prototype.setItem=window.__o});
const GT='.gt',TW='.hb .tw',MB='.md .b';
const add=(a,b2)=>Object.keys(b2).filter(k=>!(k in a)),del=(a,b2)=>Object.keys(a).filter(k=>!(k in b2));
(async()=>{await H.start([INDEX,OLD]);URL=H.u(INDEX);OURL=OLD?H.u(OLD):'';b=await chromium.launch();
// ---- 1 洞窟(説明が未読・Lv2):説明窓 → 旧町 ----
for(const [w,h] of [[640,300],[915,412],[1910,830]]){
 const {ctx,pg}=await home(w,h,2);const s0=await sto(pg);await pg.click(GT);await pg.waitForTimeout(400);const a=await st(pg);
 ok(`H1 ${w}x${h} 洞窟:説明窓が出る(旧町も新しい町もまだ開かない)`,a.V==='sx'&&a.SXID==='town'&&a.SXCAVE===true&&!a.vil&&a.sx,J(a));
 if(w===915)await pg.screenshot({path:path.join(SHOTS,'5h_cave_modal.png')});
 await pg.click(MB);await pg.waitForTimeout(500);const c=await st(pg),s1=await sto(pg);
 ok(`H2 ${w}x${h} 「わかった」→旧町が開く(新しい町ではない)・目印は消える`,oldTown(c)&&c.SXCAVE===false&&c.SXID===null,J(c));
 ok(`H3 ${w}x${h} 新しい町の保存先(elemVil系)は1つも作られない・説明の既読(elemSx_town)だけが増える`,vilKeys(s1).length===0&&J(add(s0,s1).filter(k=>k!=='elemWorld'))===J(['elemSx_town'])&&del(s0,s1).length===0&&s1.elemSx_town==='1',J([add(s0,s1),del(s0,s1)]));
 if(w===915)await pg.screenshot({path:path.join(SHOTS,'5h_cave_oldtown.png')});
 ok(`H4 ${w}x${h} ページエラー0`,pg.errs.length===0,pg.errs.join('|'));await ctx.close()}
// ---- 2 ホームの「町づくり」ボタン:説明窓なしで新しい町 ----
{const {ctx,pg}=await home(915,412,2);await pg.click(TW);await pg.waitForTimeout(700);const a=await st(pg),s=await sto(pg);
 ok('H5 ホームの町づくりボタン:説明窓なしで新しい町が開く(本番モード)',a.vil&&a.mode==='live'&&a.V!=='sx'&&!a.sx,J(a));
 ok('H6 そのとき説明の既読(elemSx_town)は書かれない',s.elemSx_town===undefined&&vilKeys(s).length>0,J(Object.keys(s)));await ctx.close()}
// ---- 3 保存失敗:説明窓が何回出ても入口を取り違えない ----
{const {ctx,pg}=await home(915,412,2);const s0=await sto(pg);await failSx(pg);await pg.click(GT);await pg.waitForTimeout(300);const res=[];
 for(let i=0;i<4;i++){await pg.click(MB);await pg.waitForTimeout(350);res.push(await st(pg))}
 const s1=await sto(pg);
 ok('H7 保存できない環境:「わかった」を4回押しても、毎回 洞窟の説明窓のまま(新しい町にも旧町にも遷移しない)',res.every(a=>a.V==='sx'&&a.SXID==='town'&&a.SXCAVE===true&&!a.vil&&a.sx),J(res));
 ok('H8 そのあいだ新しい町の保存先は作られず、データも1つも増減しない',vilKeys(s1).length===0&&add(s0,s1).length===0&&del(s0,s1).length===0&&await pg.evaluate(()=>window.__n)>=4,J([add(s0,s1),del(s0,s1)]));
 await okSx(pg);await pg.click(MB);await pg.waitForTimeout(500);const c=await st(pg);
 ok('H9 保存できるようになったあとの「わかった」で、旧町が開く(新しい町ではない)',oldTown(c)&&c.SXCAVE===false,J(c));
 ok('H10 エラー0',pg.errs.length===0,pg.errs.join('|'));await ctx.close()}
// ---- 4 説明窓を別の経路で消した(目印が残った)あとでも、ホームの町づくりは新しい町 ----
{const {ctx,pg}=await home(915,412,2);await pg.click(GT);await pg.waitForTimeout(300);const m=await st(pg);
 await pg.evaluate(()=>{V=null;HOMEMAP=true;render()});await pg.waitForTimeout(250);const mid=await st(pg);await pg.click(TW);await pg.waitForTimeout(700);const a=await st(pg);
 ok('H11 説明窓が出たまま別の経路で閉じても、次のホーム「町づくり」は新しい町に入れる(目印に左右されない)',m.SXCAVE===true&&mid.V===null&&a.vil&&a.mode==='live',J([m,mid,a]));await ctx.close()}
// ---- 5 行き来の組み合わせ ----
{const {ctx,pg}=await home(915,412,2);const log=[];
 await pg.click(TW);await pg.waitForTimeout(600);log.push((await st(pg)).vil);await pg.click('.vlbar .vlb');await pg.waitForTimeout(400);
 await pg.click(GT);await pg.waitForTimeout(300);await pg.click(MB);await pg.waitForTimeout(500);log.push(oldTown(await st(pg)));
 await pg.evaluate(()=>{V=null;HOMEMAP=true;render()});await pg.waitForTimeout(300);await pg.click(TW);await pg.waitForTimeout(600);log.push((await st(pg)).vil);await pg.click('.vlbar .vlb');await pg.waitForTimeout(400);
 await pg.click(GT);await pg.waitForTimeout(400);const d=await st(pg);log.push(oldTown(d));
 ok('H12 新しい町→戻る→洞窟(旧町)→ホーム→新しい町→戻る→洞窟(既読なので説明なしで旧町):毎回正しい入口',J(log)==='[true,true,true,true]'&&d.V==='farm',J([log,d]));
 ok('H13 エラー0',pg.errs.length===0,pg.errs.join('|'));await ctx.close()}
// ---- 6 既読 ----
{const {ctx,pg}=await home(915,412,2,{elemSx_town:'1'});await pg.click(GT);await pg.waitForTimeout(500);const a=await st(pg),s=await sto(pg);
 ok('H14 説明が既読:洞窟は説明なしで旧町が開く・新しい町の保存先は作られない',oldTown(a)&&vilKeys(s).length===0,J(a));await ctx.close()}
// ---- 7 Lv1 ----
{const {ctx,pg}=await home(915,412,1);await pg.click(GT);await pg.waitForTimeout(400);const a=await st(pg),s=await sto(pg);
 ok('H15 世界樹Lv1:洞窟を押しても何も開かない(従来の案内)・保存先は作られない',a.V!=='sx'&&!a.vil&&!oldTown(a)&&vilKeys(s).length===0&&(await pg.evaluate(()=>HMSG))==='世界樹が Lv2に なると 町が ひらくよ',J(a));await ctx.close()}
// ---- 8 他のボタンの説明窓は従来どおり ----
{const {ctx,pg}=await home(915,412,2);await pg.evaluate(()=>homeGo('word'));await pg.waitForTimeout(300);const a=await st(pg);await pg.click(MB);await pg.waitForTimeout(400);const c=await st(pg);
 ok('H16 ことばの冒険の説明窓:目印は立たない・閉じるとことばの画面(新しい町は開かない)',a.V==='sx'&&a.SXID==='word'&&a.SXCAVE===false&&c.V===null&&!c.vil&&await pg.evaluate(()=>SEC==='word'),J([a,c]));await ctx.close()}
// ---- 9 5gではどうだったか(このテストが不具合を見つけられることの確認) ----
if(OURL){const {ctx,pg}=await home(915,412,2,null,OURL);await failSx(pg);await pg.click(GT);await pg.waitForTimeout(300);await pg.click(MB);await pg.waitForTimeout(350);const a1=await st(pg);await pg.click(MB);await pg.waitForTimeout(500);const a2=await st(pg);
 ok('H17 (確認用)5g版では、保存失敗で2回目の「わかった」に新しい町が開いてしまう=この不具合をテストが検出できる',a1.V==='sx'&&a2.vil===true,J([a1,a2]));await ctx.close()}
await b.close();H.finish(R);await H.stop();let f=0;R.forEach(([n,c,x])=>{if(!c)f++;console.log((c?'PASS ':'FAIL ')+n+(c?'':'  '+x))});console.log('failed:',f,'/',R.length)})();
