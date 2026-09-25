// ステージの配置検査（組み立て後のデータで判定。既存の check-overlap は「同じ座標」しか見ないため、部分的な重なり等をここで見る）
//   ① ブロック同士の部分的な重なり     ② ブロックと土管の重なり       ③ 固い物の中に出現する敵
//   ④ 真下がふさがった?ブロック（下から叩けない）  ⑤ 中間地点±300pxの危険物（ルール⑥。その場から動かない火柱は復帰地点±64pxだけ）
//   ⑥ スタート地点 x<350 の危険物（ルール⑤）  ⑦ 旗竿とブロックの重なり  ⑧ 旗より先のコイン
//   ⑨ 移動足場の通り道にあるブロック
// 使い方: node tools/check-geometry.mjs [1-1 ...]   （問題があれば終了コード1）
import {installEnv} from './smoke/env.mjs';
installEnv();
const g=await import('../src/globals.js');
const {platforms,pipes,enemies,coinItems,piranhas,chainChomps,jumpBlocks,pipos,cannons,lavaFlames,movingPlats,springs,flagPole,G,H,TILE,LW}=g;
const {STAGES}=await import('../src/stages.js');

const only=process.argv.slice(2);
const ov=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
const SOLID=p=>p.type!=='hidden'&&p.type!=='coin'&&p.type!=='chest';
const FLYING=new Set(['montyMole','parakoopa','parakoopaR','lakitu','cheepH','cheepV','blooper','angrySun','teresa','thwomp','fuzzy','spikeTop','plantFire','firePlant','miniBowser','bowser']);
let total=0;
for(const st of STAGES){
  const label=`${st.world}-${st.level}`;if(only.length&&!only.includes(label))continue;
  flagPole.x=LW-500;flagPole.h=320;G.checkpoint=null;G.checkpoint2=null;st.build();
  const out=[];const add=(k,m)=>out.push(`${k} ${m}`);
  const solids=platforms.filter(SOLID);
  // ① ブロック同士
  for(let i=0;i<solids.length;i++)for(let j=i+1;j<solids.length;j++){const a=solids[i],b=solids[j];if(Math.abs(a.x-b.x)>200)continue;const o=ov(a,b);if(o>16)add('①重なり',`${a.type}@${a.x},${a.y} × ${b.type}@${b.x},${b.y} (${o}px²)`);}
  // ② ブロックと土管
  for(const p of pipes)for(const b of platforms){if(b.type==='coin')continue;if(p.ceiling&&b.y+b.h<=TILE+1)continue;/* 天井の列から下がる天井土管は正常 */const o=ov(p,b);if(o>16)add('②土管',`${b.type}@${b.x},${b.y} が土管@${p.x},${p.y}(${p.w}x${p.h}${p.ceiling?' 天井':''})に重なる (${o}px²)`);}
  // ③ 固い物の中に出現する敵（足元が床に8px以内めり込んでいるのは除外）
  for(const e of enemies){if(!e.alive||FLYING.has(e.type))continue;for(const s of [...solids,...pipes]){const top=s.y;const box={x:e.x+2,y:e.y,w:e.w-4,h:Math.max(0,Math.min(e.h,top-e.y+0)+0)};const o=ov({x:e.x+2,y:e.y,w:e.w-4,h:e.h-8},s);if(o>32){add('③敵埋まり',`${e.type}@${Math.round(e.x)},${Math.round(e.y)} が ${s.type||'土管'}@${s.x},${s.y} の中`);break;}}}
  // ④ 真下がふさがった?ブロック
  for(const q of platforms){if(q.type!=='question'&&!(q.type==='hidden'))continue;const below={x:q.x+4,y:q.y+q.h,w:q.w-8,h:TILE};if(solids.some(s=>s!==q&&ov(below,s)>32)||pipes.some(p=>ov(below,p)>32))add('④叩けない',`${q.type}@${q.x},${q.y} の真下がふさがっている`);}
  // ⑤ 中間地点±300px の危険物
  const hazards=[...enemies.filter(e=>e.alive).map(e=>({x:e.x,t:e.type})),...piranhas.map(p=>({x:p.x,t:'piranha'})),...chainChomps.map(c=>({x:c.postX??c.x,t:'chainChomp'})),...jumpBlocks.map(j=>({x:j.x,t:'jumpBlock'})),...pipos.map(p=>({x:p.x,t:'pipo'})),...cannons.map(c=>({x:c.x,t:'cannon'})),...lavaFlames.map(f=>({x:f.x,t:'flame'}))];
  for(const [name,cp] of [['CP',G.checkpoint],['CP2',G.checkpoint2]]){if(!cp)continue;for(const h of hazards)if(Math.abs(h.x-cp.x)<(h.t==='flame'?64:300)&&h.t!=='bowser')add('⑤CP近く',`${name}@${cp.x} から ${Math.round(Math.abs(h.x-cp.x))}px に ${h.t}@${Math.round(h.x)}`);}
  // ⑥ スタート地点
  for(const h of hazards)if(h.x<350)add('⑥スタート',`x<350 に ${h.t}@${Math.round(h.x)}`);
  // ⑦ 旗竿
  if(flagPole.x<LW){const pole={x:flagPole.x-4,y:H-TILE-flagPole.h,w:26,h:flagPole.h};for(const s of solids)if(s.y<H-TILE&&ov(pole,s)>0)add('⑦旗竿',`旗@${flagPole.x} が ${s.type}@${s.x},${s.y} に埋まる`);
    // ⑧ 旗より先のコイン
    const beyond=coinItems.filter(c=>!c.type&&c.x>flagPole.x+24).length;if(beyond)add('⑧旗の先',`旗より先にコイン ${beyond}枚`);}
  // ⑨ 移動足場の通り道
  for(const mp of movingPlats){if(mp.type!=='h'&&mp.type!=='v')continue;const r=mp.range||0;const path=mp.type==='h'?{x:mp.ox-r,y:mp.oy??mp.y,w:mp.w+2*r,h:mp.h}:{x:mp.ox??mp.x,y:(mp.oy??mp.y)-r,w:mp.w,h:mp.h+2*r};
    for(const s of [...solids,...pipes])if(ov(path,s)>0){add('⑨移動足場',`${mp.type}@${Math.round(mp.ox??mp.x)},${Math.round(mp.oy??mp.y)} range${r} の通り道に ${s.type||'土管'}@${s.x},${s.y}`);break;}}
  if(out.length){console.log(`[${label}] ${out.length}件`);for(const o of out)console.log('  '+o);}
  total+=out.length;
}
console.log(`\n合計: ${total} 件`);
process.exit(total?1:0);
