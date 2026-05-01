#!/usr/bin/env node
// レベル設計ルール自動検証スクリプト
// CLAUDE.md の「レベル設計 必須チェック」10項目のうち静的解析可能なものを検査
// 使い方: node tools/check-levels.js

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVEL_DIR = path.join(__dirname, '..', 'src', 'levels');

const GROUND_ENEMIES = ['goomba','koopa','buzzy','rex','penguin','cactus','shyGuy'];

// 個別チェック関数（テキストレベルの静的解析）
function checkAutoScrollReset(content) {
  return /G\.autoScroll\s*=\s*0/.test(content);
}
function checkCheckpoint(content) {
  return /G\.checkpoint\s*=/.test(content);
}
function findEarlyEnemies(content) {
  // `{x:N,t:'type'}` 形式の x<350 かつ地上歩き敵を抽出
  const out = [];
  const re = /\{\s*x\s*:\s*(\d+)\s*,\s*t\s*:\s*['"]([\w]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const x = parseInt(m[1], 10);
    const t = m[2];
    if (x < 350 && GROUND_ENEMIES.includes(t)) {
      out.push(`x=${x} t=${t}`);
    }
  }
  return out;
}
function findEnemiesNearCheckpoint(content) {
  const cpMatch = content.match(/G\.checkpoint\s*=\s*\{\s*x\s*:\s*(\d+)/);
  if (!cpMatch) return [];
  const cpX = parseInt(cpMatch[1], 10);
  const out = [];
  const re = /\{\s*x\s*:\s*(\d+)\s*,\s*t\s*:\s*['"]([\w]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const x = parseInt(m[1], 10);
    const t = m[2];
    if (Math.abs(x - cpX) < 300 && GROUND_ENEMIES.includes(t)) {
      out.push(`x=${x} t=${t} (CP=${cpX})`);
    }
  }
  return out;
}
function estimateCoinCount(content) {
  // coinItems.push の出現数 + 各 for(let i=0;i<N) のループでまとめてpushされる数
  let count = 0;
  // ベタ書きの coinItems.push
  count += (content.match(/coinItems\.push\(/g) || []).length;
  // for ループによる N 個生成（簡易）
  const forLoops = [...content.matchAll(/for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)[^)]*\)\s*coinItems\.push/g)];
  forLoops.forEach(m => {
    count += parseInt(m[1], 10) - 1; // .push 自体は既にカウント済みなので追加分のみ
  });
  // forEach 内 coinItems.push（配列リテラル要素数）
  const fe = [...content.matchAll(/\[([^\]]+)\]\.forEach\([^)]*coinItems\.push/g)];
  fe.forEach(m => {
    const elems = (m[1].match(/\{/g) || []).length;
    count += Math.max(0, elems - 1); // 同様
  });
  return count;
}
function checkFlagPoleSet(content, expectShortStage) {
  if (!expectShortStage) return true; // 短いステージのみ要明示
  return /flagPole\.x\s*=/.test(content);
}
function isCastleStage(content) {
  // bowser.alive=true や lavaFlames が多いと城ステージ
  return /bowser\.alive\s*=\s*true/.test(content) || (content.match(/lavaFlames\.push/g) || []).length > 5;
}

// メイン
const files = fs.readdirSync(LEVEL_DIR)
  .filter(f => /^level[\d-]+\.js$/.test(f) || f === 'level-ex2.js')
  .sort();

let totalIssues = 0;
const summary = [];

console.log('='.repeat(70));
console.log('Mario Game v2 — レベル設計検証');
console.log('='.repeat(70));

for (const file of files) {
  const fp = path.join(LEVEL_DIR, file);
  const content = fs.readFileSync(fp, 'utf8');
  const issues = [];
  const warnings = [];

  if (!checkAutoScrollReset(content)) {
    issues.push('④ G.autoScroll=0 のリセット記述なし');
  }
  if (!checkCheckpoint(content) && !file.includes('1-3') && !file.includes('1-4') && !isCastleStage(content)) {
    warnings.push('チェックポイント未設定（短いステージなら可）');
  }
  const early = findEarlyEnemies(content);
  if (early.length) {
    issues.push(`⑤ スポーン地点(x<350)に地上歩き敵: ${early.join(', ')}`);
  }
  const nearCP = findEnemiesNearCheckpoint(content);
  if (nearCP.length) {
    warnings.push(`⑥ チェックポイント±300px に敵: ${nearCP.join(', ')}`);
  }
  const coinCount = estimateCoinCount(content);
  if (!isCastleStage(content) && coinCount < 250) {
    warnings.push(`⑦ コイン推定 ${coinCount}（300+推奨、城以外）`);
  }

  if (issues.length || warnings.length) {
    console.log('');
    console.log(`[${file}]`);
    issues.forEach(i => { console.log('  ❌ ' + i); totalIssues++; });
    warnings.forEach(w => console.log('  ⚠️  ' + w));
    summary.push({file, issues: issues.length, warnings: warnings.length, coins: coinCount});
  } else {
    summary.push({file, issues: 0, warnings: 0, coins: coinCount});
  }
}

console.log('');
console.log('='.repeat(70));
console.log('サマリ');
console.log('='.repeat(70));
console.log(`チェック対象: ${files.length} ファイル`);
console.log(`違反(❌): ${totalIssues} 件`);
const warnTotal = summary.reduce((a, b) => a + b.warnings, 0);
console.log(`警告(⚠️ ): ${warnTotal} 件`);
console.log('');
console.log('コイン推定 BOTTOM5（城以外）:');
summary
  .filter(s => !s.file.match(/level[1-8]-[34]\.js/))
  .sort((a, b) => a.coins - b.coins)
  .slice(0, 5)
  .forEach(s => console.log(`  ${s.file}: ${s.coins}`));

process.exit(totalIssues > 0 ? 1 : 0);
