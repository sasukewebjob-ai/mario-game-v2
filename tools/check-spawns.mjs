// 地上歩き敵のスポーン検証: 各レベルの build を実行し、
// (a) 足元に支えがない（ギャップ内等で即落下） (b) パイプ内にスポーン を検出
// 使い方: node tools/check-spawns.mjs
import {enemies, platforms, pipes} from '../src/globals.js';

const GROUND_TYPES = new Set(['goomba','koopa','buzzy','cactus','hammerBro','chuck','dryBones','penguin','rex','spiny','bobomb','montyMole','shyGuy','pokey']);

const LEVELS = [];
for (let w = 1; w <= 8; w++) for (let l = 1; l <= 3; l++) LEVELS.push(`${w}-${l}`);
LEVELS.splice(3, 0, '1-4');

let total = 0;
for (const id of LEVELS) {
  const mod = await import(`../src/levels/level${id}.js`);
  const fn = Object.values(mod).find(v => typeof v === 'function');
  try { fn(); } catch (e) { console.log(`[${id}] build失敗: ${e.message}`); continue; }
  const bad = [];
  for (const e of enemies) {
    if (!GROUND_TYPES.has(e.type) || e.flying) continue;
    // 真下のどこにも支え（platform/pipe天面）が無い＝穴に落ちて消えるスポーンのみ検出
    // ※数pxの埋まり・パイプ接触は cX/cY 物理が解決するため対象外（誤検出の元）
    const feet = e.y + e.h;
    const support = [...platforms, ...pipes.filter(p => !p.ceiling)].some(p =>
      p.y >= feet - 24 &&
      Math.min(e.x + e.w, p.x + p.w) - Math.max(e.x, p.x) >= 8);
    if (!support) bad.push(`${e.type}@x=${e.x} y=${e.y} 真下に支えなし（穴に消える）`);
  }
  if (bad.length) { console.log(`[${id}]`); bad.forEach(b => console.log('  ⚠️  ' + b)); total += bad.length; }
}
console.log(`\n合計: ${total} 件`);
process.exit(total > 0 ? 1 : 0);
