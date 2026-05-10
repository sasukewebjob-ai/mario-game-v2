#!/usr/bin/env node
// ブロック重複と 1UP-pit 距離検出スクリプト
// 静的解析: addRow / platforms.push の (x,y) を抽出して重複・近接落とし穴を検出
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVEL_DIR = path.join(__dirname, '..', 'src', 'levels');
const TILE = 32;
const H_TILES = 14; // approximate, H=448

function extractBlocks(content) {
  // addRow(x, y, count, type) → 各 (x+i*TILE, y) を生成
  const blocks = [];
  const arRe = /addRow\s*\(\s*(\d+)\s*,\s*([^,]+)\s*,\s*(\d+)\s*,\s*['"]([^'"]+)['"](?:\s*,\s*(true|false))?\s*\)/g;
  let m;
  while ((m = arRe.exec(content)) !== null) {
    const x = parseInt(m[1], 10);
    const yExpr = m[2].trim();
    const count = parseInt(m[3], 10);
    const type = m[4];
    const hidden = m[5] === 'true';
    const yResolved = resolveY(yExpr);
    if (yResolved === null) continue;
    for (let i = 0; i < count; i++) {
      blocks.push({x: x + i*TILE, y: yResolved, type: hidden ? `${type}(hidden)` : type, src: 'addRow', line: lineOf(content, m.index)});
    }
  }
  // platforms.push({x:N, y:..., type:'X'})
  const ppRe = /platforms\.push\s*\(\s*\{\s*x\s*:\s*(\d+)\s*,\s*y\s*:\s*([^,]+)\s*,[^}]*type\s*:\s*['"]([^'"]+)['"]/g;
  while ((m = ppRe.exec(content)) !== null) {
    const x = parseInt(m[1], 10);
    const yExpr = m[2].trim();
    const type = m[3];
    const yResolved = resolveY(yExpr);
    if (yResolved === null) continue;
    blocks.push({x, y: yResolved, type, src: 'push', line: lineOf(content, m.index)});
  }
  // addB(x, y, type)
  const abRe = /addB\s*\(\s*(\d+)\s*,\s*([^,]+)\s*,\s*['"]([^'"]+)['"]/g;
  while ((m = abRe.exec(content)) !== null) {
    const x = parseInt(m[1], 10);
    const yExpr = m[2].trim();
    const type = m[3];
    const yResolved = resolveY(yExpr);
    if (yResolved === null) continue;
    blocks.push({x, y: yResolved, type, src: 'addB', line: lineOf(content, m.index)});
  }
  return blocks;
}

function resolveY(expr) {
  // "H-5*TILE" → numeric
  // We'll keep as symbolic key for comparison: just treat the expression string
  return expr.replace(/\s/g, '');
}

function lineOf(content, idx) {
  return content.substring(0, idx).split('\n').length;
}

function findOverlaps(blocks) {
  const map = new Map();
  for (const b of blocks) {
    const key = `${b.x}@${b.y}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
  }
  const overlaps = [];
  for (const [key, list] of map.entries()) {
    if (list.length > 1) {
      // Filter: same type collisions are usually intentional row continuations (addRow contiguous w/o overlap is fine — diff x)
      // But same (x,y) is always suspicious
      overlaps.push({key, blocks: list});
    }
  }
  return overlaps;
}

function extractGaps(content) {
  // const gaps=[{s:N,e:N},...]
  const gaps = [];
  const re = /\{\s*s\s*:\s*(\d+)\s*,\s*e\s*:\s*(\d+)\s*\}/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    gaps.push({s: parseInt(m[1], 10), e: parseInt(m[2], 10)});
  }
  return gaps;
}

function extract1ups(content) {
  // platforms.push({x:N, ..., has1UP:true...})
  const out = [];
  const re = /platforms\.push\s*\(\s*\{\s*x\s*:\s*(\d+)[^}]*has1UP\s*:\s*true/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({x: parseInt(m[1], 10), line: lineOf(content, m.index)});
  }
  return out;
}

const files = fs.readdirSync(LEVEL_DIR)
  .filter(f => /^level[\d-]+\.js$/.test(f) || f === 'level-ex2.js')
  .sort();

console.log('='.repeat(70));
console.log('ブロック重複 & 1UP-落とし穴 近接 検出');
console.log('='.repeat(70));

let totalOverlaps = 0;
let totalDangerous1ups = 0;

for (const file of files) {
  const fp = path.join(LEVEL_DIR, file);
  const content = fs.readFileSync(fp, 'utf8');
  const blocks = extractBlocks(content);
  const overlaps = findOverlaps(blocks);
  const gaps = extractGaps(content);
  const ups = extract1ups(content);

  // 危険な1UP: 落とし穴のすぐ前（プレイヤー進行方向: 右 → gap.s 直前 ±64px）
  // または gap内（s〜e 内に1UPがある）
  const dangerous = ups.filter(u => {
    return gaps.some(g => {
      // 直前 (gap手前 0〜80px)
      if (u.x >= g.s - 80 && u.x < g.s) return true;
      // gap直上
      if (u.x >= g.s && u.x <= g.e) return true;
      return false;
    });
  });

  if (overlaps.length > 0 || dangerous.length > 0) {
    console.log('');
    console.log(`[${file}]`);
    if (overlaps.length > 0) {
      console.log('  ❌ ブロック重複:');
      for (const o of overlaps) {
        const desc = o.blocks.map(b => `${b.src}@L${b.line}:${b.type}`).join(' + ');
        console.log(`     (${o.key})  ${desc}`);
        totalOverlaps++;
      }
    }
    if (dangerous.length > 0) {
      console.log('  ⚠️  1UPが落とし穴付近:');
      for (const d of dangerous) {
        const near = gaps.find(g => (d.x >= g.s - 80 && d.x < g.s) || (d.x >= g.s && d.x <= g.e));
        const rel = d.x < near.s ? '直前' : 'gap内';
        console.log(`     1UP@L${d.line} x=${d.x}  ${rel}  pit:${near.s}-${near.e}`);
        totalDangerous1ups++;
      }
    }
  }
}

console.log('');
console.log('='.repeat(70));
console.log(`合計: 重複${totalOverlaps}件 / 危険1UP${totalDangerous1ups}件`);
console.log('='.repeat(70));
