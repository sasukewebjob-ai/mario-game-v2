// 各レベルの build を実際に実行して coinItems / コインブロックの実数を数える
// 使い方: node tools/count-coins.mjs
import {coinItems, platforms} from '../src/globals.js';

const LEVELS = [];
for (let w = 1; w <= 8; w++) for (let l = 1; l <= 3; l++) LEVELS.push(`${w}-${l}`);
LEVELS.splice(3, 0, '1-4'); // 1-4 が存在する

const rows = [];
for (const id of LEVELS) {
  const mod = await import(`../src/levels/level${id}.js`);
  const fn = Object.values(mod).find(v => typeof v === 'function');
  try { fn(); } catch (e) { rows.push([id, 'build失敗: ' + e.message]); continue; }
  const loose = coinItems.length;
  // ブロック由来のコイン: coinBlock(hitsLeft回) + 通常q(アイテム無しは1枚)
  let blockCoins = 0;
  for (const p of platforms) {
    if (p.coinBlock) blockCoins += p.hitsLeft || 0;
    else if ((p.type === 'question' || p.type === 'q' || p.type === 'hidden') &&
             !p.hasMush && !p.hasStar && !p.has1UP && !p.hasHammer && !p.hasYoshi && !p.hasFlower) blockCoins += 1;
  }
  rows.push([id, loose, blockCoins, loose + blockCoins]);
}
console.log('level  ばらコイン  ブロック由来  合計');
for (const r of rows) console.log(String(r[0]).padEnd(6), String(r[1]).padStart(6), String(r[2]).padStart(8), String(r[3]).padStart(8));
