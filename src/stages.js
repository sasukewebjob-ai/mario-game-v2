/**
 * Stage Registry — 全ステージの宣言的定義
 *
 * 新ステージを追加するときは STAGES 配列に1行追加するだけ。
 * goalSlide / restart / startFromStage / drawBG / scheduleBGM は
 * すべてこの Registry を参照して自動動作する。
 *
 * id: selectedStage の flat index (1 始まり、連番)
 * bgTheme: drawBG() のキー
 * bgmTheme: 'main' | 'castle'
 * selBg: スタート画面ボタンの非選択色
 * selFg: スタート画面ボタンの選択色
 */

import {buildLevel}      from './levels/level1-1.js';
import {buildLevel2}     from './levels/level1-2.js';
import {buildLevel3}     from './levels/level1-3.js';
import {buildLevel4}     from './levels/level1-4.js';
import {buildLevel_2_1}  from './levels/level2-1.js';
import {buildLevel_2_2}  from './levels/level2-2.js';
import {buildLevel_2_3}  from './levels/level2-3.js';
import {buildLevel_3_1}  from './levels/level3-1.js';
import {buildLevel_3_2}  from './levels/level3-2.js';
import {buildLevel_3_3}  from './levels/level3-3.js';
import {buildLevel_4_1}  from './levels/level4-1.js';
import {buildLevel_4_2}  from './levels/level4-2.js';
import {buildLevel_4_3}  from './levels/level4-3.js';

export const STAGES = [
  // ── World 1: Plains ──────────────────────────────────────────
  {world:1,level:1,id:1,  build:buildLevel,     bgTheme:'sky',      bgmTheme:'main',   selBg:'#1a3a1a',selFg:'#27ae60'},
  {world:1,level:2,id:2,  build:buildLevel2,    bgTheme:'evening',  bgmTheme:'main',   selBg:'#1a2a3a',selFg:'#2980b9'},
  {world:1,level:3,id:3,  build:buildLevel3,    bgTheme:'night',    bgmTheme:'main',   selBg:'#2a1a3a',selFg:'#8e44ad'},
  {world:1,level:4,id:4,  build:buildLevel4,    bgTheme:'castle',   bgmTheme:'castle', selBg:'#3a1a1a',selFg:'#c0392b'},
  // ── World 2: Desert ──────────────────────────────────────────
  {world:2,level:1,id:5,  build:buildLevel_2_1, bgTheme:'desert',   bgmTheme:'main',   selBg:'#3a1800',selFg:'#d35400'},
  {world:2,level:2,id:6,  build:buildLevel_2_2, bgTheme:'desert2',  bgmTheme:'main',   selBg:'#1a0a3a',selFg:'#7b2fbe'},
  {world:2,level:3,id:7,  build:buildLevel_2_3, bgTheme:'castle',   bgmTheme:'castle', selBg:'#1a2a0a',selFg:'#1a7a2a'},
  // ── World 3: Seaside ─────────────────────────────────────────
  {world:3,level:1,id:8,  build:buildLevel_3_1, bgTheme:'beach',    bgmTheme:'main',   selBg:'#003a5a',selFg:'#0097c8'},
  {world:3,level:2,id:9,  build:buildLevel_3_2, bgTheme:'beach',    bgmTheme:'main',   selBg:'#002a40',selFg:'#00b4d8'},
  {world:3,level:3,id:10, build:buildLevel_3_3, bgTheme:'castle3',  bgmTheme:'castle', selBg:'#1a0808',selFg:'#c0392b'},
  // ── World 4: Mountain ────────────────────────────────────────
  {world:4,level:1,id:11, build:buildLevel_4_1, bgTheme:'mountain',        bgmTheme:'main',   selBg:'#0a1828',selFg:'#4a90c8'},
  {world:4,level:2,id:12, build:buildLevel_4_2, bgTheme:'mountain',        bgmTheme:'main',   selBg:'#0a1828',selFg:'#6ab0e0'},
  {world:4,level:3,id:13, build:buildLevel_4_3, bgTheme:'mountain_castle', bgmTheme:'castle', selBg:'#1a0820',selFg:'#c030c0'},
];

/** world + level → ステージ取得 */
export function getStage(world, level){
  return STAGES.find(s => s.world === world && s.level === level) || null;
}

/** flat id → ステージ取得 */
export function getStageById(id){
  return STAGES.find(s => s.id === id) || null;
}

/** 次のステージを返す（最終ステージなら null） */
export function getNextStage(world, level){
  const idx = STAGES.findIndex(s => s.world === world && s.level === level);
  return (idx >= 0 && idx < STAGES.length - 1) ? STAGES[idx + 1] : null;
}

/** 登録されているワールド番号の配列 */
export function getWorlds(){
  return [...new Set(STAGES.map(s => s.world))];
}

/** 指定ワールドのステージ配列 */
export function getWorldStages(world){
  return STAGES.filter(s => s.world === world);
}
