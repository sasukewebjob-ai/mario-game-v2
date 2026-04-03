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
import {buildLevel_2_1}  from './levels/level2-1.js';
import {buildLevel_2_2}  from './levels/level2-2.js';
import {buildLevel_2_3}  from './levels/level2-3.js';
import {buildLevel_3_1}  from './levels/level3-1.js';
import {buildLevel_3_2}  from './levels/level3-2.js';
import {buildLevel_3_3}  from './levels/level3-3.js';
import {buildLevel_4_1}  from './levels/level4-1.js';
import {buildLevel_4_2}  from './levels/level4-2.js';
import {buildLevel_4_3}  from './levels/level4-3.js';
import {buildLevel_5_1}  from './levels/level5-1.js';
import {buildLevel_5_2}  from './levels/level5-2.js';
import {buildLevel_5_3}  from './levels/level5-3.js';
import {buildLevel_6_1}  from './levels/level6-1.js';
import {buildLevel_6_2}  from './levels/level6-2.js';
import {buildLevel_6_3}  from './levels/level6-3.js';
import {buildLevel_7_1}  from './levels/level7-1.js';
import {buildLevel_7_2}  from './levels/level7-2.js';
import {buildLevel_7_3}  from './levels/level7-3.js';
import {buildLevel_8_1}  from './levels/level8-1.js';
import {buildLevel_8_2}  from './levels/level8-2.js';
import {buildLevel_8_3}  from './levels/level8-3.js';

export const STAGES = [
  // ── World 1: Plains ──────────────────────────────────────────
  {world:1,level:1,id:1,  build:buildLevel,     bgTheme:'sky',      bgmTheme:'main',   selBg:'#1a3a1a',selFg:'#27ae60'},
  {world:1,level:2,id:2,  build:buildLevel2,    bgTheme:'evening',  bgmTheme:'main',   selBg:'#1a2a3a',selFg:'#2980b9'},
  {world:1,level:3,id:3,  build:buildLevel3,    bgTheme:'castle',   bgmTheme:'castle', selBg:'#3a1a1a',selFg:'#c0392b'},
  // ── World 2: Desert ──────────────────────────────────────────
  {world:2,level:1,id:4,  build:buildLevel_2_1, bgTheme:'desert',   bgmTheme:'main',   selBg:'#3a1800',selFg:'#d35400'},
  {world:2,level:2,id:5,  build:buildLevel_2_2, bgTheme:'desert2',  bgmTheme:'main',   selBg:'#1a0a3a',selFg:'#7b2fbe'},
  {world:2,level:3,id:6,  build:buildLevel_2_3, bgTheme:'castle',   bgmTheme:'castle', selBg:'#1a2a0a',selFg:'#1a7a2a'},
  // ── World 3: Seaside ─────────────────────────────────────────
  {world:3,level:1,id:7,  build:buildLevel_3_1, bgTheme:'beach',    bgmTheme:'main',   selBg:'#003a5a',selFg:'#0097c8'},
  {world:3,level:2,id:8,  build:buildLevel_3_2, bgTheme:'beach',    bgmTheme:'main',   selBg:'#002a40',selFg:'#00b4d8'},
  {world:3,level:3,id:9,  build:buildLevel_3_3, bgTheme:'castle3',  bgmTheme:'castle', selBg:'#1a0808',selFg:'#c0392b'},
  // ── World 4: Mountain ────────────────────────────────────────
  {world:4,level:1,id:10, build:buildLevel_4_1, bgTheme:'mountain',        bgmTheme:'main',   selBg:'#0a1828',selFg:'#4a90c8'},
  {world:4,level:2,id:11, build:buildLevel_4_2, bgTheme:'mountain',        bgmTheme:'main',   selBg:'#0a1828',selFg:'#6ab0e0'},
  {world:4,level:3,id:12, build:buildLevel_4_3, bgTheme:'mountain_castle', bgmTheme:'castle', selBg:'#1a0820',selFg:'#c030c0'},
  // ── World 5: Ocean ───────────────────────────────────────────
  {world:5,level:1,id:13, build:buildLevel_5_1, bgTheme:'underwater', bgmTheme:'main',   selBg:'#001428',selFg:'#0088cc'},
  {world:5,level:2,id:14, build:buildLevel_5_2, bgTheme:'underwater', bgmTheme:'main',   selBg:'#001428',selFg:'#00aaee'},
  {world:5,level:3,id:15, build:buildLevel_5_3, bgTheme:'castle3',    bgmTheme:'castle', selBg:'#1a0808',selFg:'#dd2222'},
  // ── World 6: Ice ─────────────────────────────────────────
  {world:6,level:1,id:16, build:buildLevel_6_1, bgTheme:'ice',         bgmTheme:'main',   selBg:'#0a1828',selFg:'#60c8f0'},
  {world:6,level:2,id:17, build:buildLevel_6_2, bgTheme:'ice',         bgmTheme:'main',   selBg:'#081420',selFg:'#90e0ff'},
  {world:6,level:3,id:18, build:buildLevel_6_3, bgTheme:'ice_castle',  bgmTheme:'castle', selBg:'#030d1c',selFg:'#4090e0'},
  // ── World 7: Fortress ────────────────────────────────────────
  {world:7,level:1,id:19, build:buildLevel_7_1, bgTheme:'fortress',    bgmTheme:'castle', selBg:'#101010',selFg:'#a0a0c0'},
  {world:7,level:2,id:20, build:buildLevel_7_2, bgTheme:'fortress',    bgmTheme:'castle', selBg:'#0c0c14',selFg:'#c0b080'},
  {world:7,level:3,id:21, build:buildLevel_7_3, bgTheme:'fortress',    bgmTheme:'castle', selBg:'#100808',selFg:'#e04040'},
  // ── World 8: Airship ─────────────────────────────────────────
  {world:8,level:1,id:22, build:buildLevel_8_1, bgTheme:'airship',     bgmTheme:'castle', selBg:'#020408',selFg:'#4060a0'},
  {world:8,level:2,id:23, build:buildLevel_8_2, bgTheme:'airship',     bgmTheme:'castle', selBg:'#040610',selFg:'#6080c0'},
  {world:8,level:3,id:24, build:buildLevel_8_3, bgTheme:'ice_castle',  bgmTheme:'castle', selBg:'#030d1c',selFg:'#e04040'},
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
