---
name: mario-boss
description: mario-game-v2に城・ボス戦ステージ（X-3/X-4）を追加する。クッパoffscreen入場・アリーナ壁・peachChase・城門まで一貫して実装する。
---

城ステージの追加を依頼されました: $ARGUMENTS

## このスキルの対象

ワールド X の城ステージ（城テーマ・クッパボス戦）専用。
通常ステージ（X-1〜X-2）は `/mario-new-level` を使うこと。

---

## ステップ1: 既存コード確認

- `src/stages.js` の末尾（最後の id 番号・最後の world/level 確認）
- `src/main.js` の Bowser 更新ループ（`bowser.state==='offscreen'` の処理があるか）
- `src/main.js` の `drawBG()` に新 bgTheme が必要か確認
- 直前の城ステージファイル（座標・難易度の参考）

## ステップ2: 城ステージ設計

### 座標設計（CLAUDE.md 座標表を参照）

| パラメータ | 説明 | 計算式 |
|---|---|---|
| `stairX` | 大型上り階段の開始 x | 後半エリア（例: 6000〜6700） |
| `wallX` | アリーナ壁の x（2列） | `stairX + 10*32 + 余白` |
| `bowserArenaX` | クッパ入場トリガー | `stairX + 9*32 - 33`（階段頂上付近） |
| `bowserLeftX` | クッパの左端制限 | `wallX + 64 + 2`（壁右端+余裕） |

**既存城ステージの座標例：**
| ステージ | stairX | wallX | bowserArenaX | bowserLeftX |
|---|---|---|---|---|
| 1-4 | 6200 | 6520,6552 | 6455 | 6586 |
| 2-3 | 6000 | 6320,6352 | 6255 | 6386 |
| 3-3 | 6400 | 6720,6752 | 6655 | 6786 |
| 4-3 | 6400 | 6720,6752 | 6655 | 6786 |
| 6-3 | 6700 | 7020,7052 | 6955 | 7086 |
| 7-3 | 6500 | 6820,6852 | 6755 | 6886 |

### 城ステージの必須要素

1. **序盤エリア**（x=0〜stairX）: 城内部ギミック（溶岩炎・移動足場・ハンマーブロス・テレサ・ドッスン）
2. **大型上り階段**（10段）: `addStair(stairX, 10)` → 頂上 y = H-11*TILE
3. **アリーナ壁**（7ブロック高・2列）: クッパのジャンプ上限144pxを超える224px
4. **アリーナ内 ? ブロック**: hasMush + hasStar（クッパ戦の救済）
5. **クッパ offscreen 配置**
6. **ピーチ配置**（peach.alive=true, caught=true）

---

## ステップ3: 実装

### 3-1. 新規ファイル作成

**import ヘッダー（必ずこの形式）：**
```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';
```

**リセット（全項目・漏れ厳禁）：**
```javascript
export function buildLevel_X_Y(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;  // ← 必須！
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
```

**城ステージ終盤（クッパ・ピーチ）：**
```javascript
  // ────────────────────────────────
  // 大型上り階段（10段）
  // ────────────────────────────────
  const stairX = XXXX;
  addStair(stairX, 10); // 頂上 y = H-11*TILE

  // ────────────────────────────────
  // アリーナ壁（7ブロック高 = 224px > クッパジャンプ上限 144px）
  // ────────────────────────────────
  const wallX = stairX + 10*32 + 余白;
  for(let wy=H-8*TILE; wy<H-TILE; wy+=TILE){
    addB(wallX,    wy,'brick');
    addB(wallX+32, wy,'brick');
  }

  // アリーナ内 ? ブロック（壁の右側）
  platforms.push({x:wallX+96,  y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true, bounceOffset:0});
  platforms.push({x:wallX+160, y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true, bounceOffset:0});

  // ────────────────────────────────
  // クッパ（offscreen 配置）
  // ────────────────────────────────
  G.bowserArenaX = stairX + 9*32 - 33;
  G.bowserLeftX  = wallX + 64 + 2;
  Object.assign(bowser,{
    alive:true,
    x:9000,            // LW(8000)より右（画面外）
    y:H-TILE-72,
    w:64,h:72,
    hp:5,maxHp:5,      // ワールドが進むほど増やす
    vx:-1.5,vy:0,
    facing:-1,
    hurtTimer:0,
    fireTimer:100,     // 小さいほど頻繁にファイアを吐く
    jumpTimer:180,
    onGround:false,
    state:'offscreen', // ← offscreen ステート（物理演算スキップ）
    deadTimer:0,
  });

  // ────────────────────────────────
  // ピーチ（クッパ死亡後に走り出す）
  // ────────────────────────────────
  Object.assign(peach,{
    alive:true,        // 城ステージでは alive=true + caught=true で配置
    x:wallX+300,
    y:H-TILE-52,
    w:30,h:52,
    vx:-2.5,           // 必ず負値（マリオに向かって走る方向）
    caught:true,       // クッパ死亡時に false になり走り出す
    walkFrame:0,
    walkTimer:0,
  });
}
```

> **⚠️ peach.vx は必ず負値**。正値だとピーチが逃げ続けてクリア不可になる。

### 3-2. bowser offscreen 処理（main.js に既存）

`src/main.js` の Bowser 更新ループに以下の処理が入っているか確認する：

```javascript
if(bowser.alive){
  if(bowser.state==='offscreen'){
    if(mario.x > G.bowserArenaX){
      bowser.x = G.cam + W + 150;
      bowser.state = 'walk';
    }
    // offscreen 中は物理演算スキップ
  } else {
    // 通常の Bowser 更新処理
    // bowser.x の左端制限: if(bowser.x < G.bowserLeftX) bowser.x = G.bowserLeftX;
  }
}
```

### 3-3. stages.js に登録（⭐ 最重要 ⭐）

以前は main.js に4箇所変更が必要だったが、**現在は stages.js に1行追加するだけで自動接続される**。

```javascript
// src/stages.js
import {buildLevel_X_Y} from './levels/levelX-Y.js';  // importを追加

export const STAGES = [
  ...
  {world:X, level:Y, id:N, build:buildLevel_X_Y, bgTheme:'castle', bgmTheme:'castle',
   selBg:'#101010', selFg:'#a0a0c0'},
];
```

- `id` は前のステージの id+1（連番）
- goalSlide・restart・BGM はすべて自動動作する

### 3-4. 城テーマの敵（推奨）

```javascript
// テレサ（浮遊・ファイアボール免疫・スターで撃破）— activated:true 必須
enemies.push({x:ex,y:H-6*TILE,w:28,h:28,vx:-0.5,vy:0.2,alive:true,
  type:'teresa',hiding:false,activated:true});

// ドッスン（天井落下・ファイアボール免疫・スターで撃破）
enemies.push({x:ex,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,
  type:'thwomp',state:'idle',waitTimer:0});

// ハンマーブロス（城の番兵）
hammers.push({x:ex,y:H-3*TILE,vx:-0.8,vy:0,alive:true,
  type:'hammerBro',throwTimer:60,facing:-1});
```

---

## ステップ4: ブロック重複チェック（必須）

`addRow` と `platforms.push` の座標重複を全件確認する（mario-new-level スキル参照）。

城ステージ特有の注意：
- `addStair` は `addB` を使うので `platforms.push` とは重複しない
- `addB` で追加した壁ブロックと `platforms.push` の ? ブロックが重ならないか確認

---

## ステップ5: ビルド確認

`npm run build` でエラーなし確認。

---

## 実装後チェックリスト

### 必須（城ステージ固有）
- [ ] `bowser.state='offscreen'` で初期化（`alive:true`, `x:9000`）
- [ ] `G.bowserArenaX` と `G.bowserLeftX` を設定
- [ ] `peach.alive=true`, `peach.caught=true` で配置
- [ ] `peach.vx` が**負値**（例: -2.5）
- [ ] アリーナ壁が 7ブロック高（224px > クッパジャンプ上限 144px）
- [ ] lavaFlames のリセット（`lavaFlames.length=0`）が buildLevel 冒頭にある

### 共通必須
- [ ] import ヘッダーに `chainChomps,jumpBlocks,pipos` が含まれているか
- [ ] リセット行に `chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;` があるか
- [ ] `G.autoScroll=0;G.iceMode=false;G.waterMode=false;` が入っているか
- [ ] テレサに `activated:true` を設定したか
- [ ] ドッスンを `y=TILE` 付近の天井に配置したか
- [ ] addRow と platforms.push の座標重複チェック済みか
- [ ] stages.js に import と STAGES エントリを追加したか
- [ ] `npm run build` エラーなし
