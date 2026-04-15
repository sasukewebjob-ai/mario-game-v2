# レベル作成テンプレート・接続手順

## レベルファイル テンプレート

```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_X_X(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  gravityZones.length=0;windZones.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.checkpoint2=null;G.goalSlide=null;
  G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.darkMode=false;G.iceMode=false;G.waterMode=false;G.swimCooldown=0;
  G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;
  G.chasingWall=null;G.airshipMode=false;G.pswitchTimer=0;
  G._psCoins=null;G._psBricks=null;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // ★ 新ギミック有効化（必要なものだけ設定）
  // G.darkMode=true;
  // G.iceMode=true;
  // G.sandstormMode=true;
  // G.tideMode=true;
  // G.airshipMode=true;
  // G.autoScroll=0.8;
  // G.chasingWall={x:-200,speed:1.5,triggerX:500,active:false};
  // gravityZones.push({x:2000,y:0,w:400,h:H});
  // windZones.push({x:1500,y:0,w:600,h:H,force:3});
}
```

## 新ステージ追加 チェックリスト

1. `src/levels/levelX-X.js` を新規作成（上記テンプレート使用）
2. `src/main.js` の import ブロック先頭に追加
3. `src/main.js` の `goalSlide` 完了ハンドラを更新
4. `src/main.js` の `restartCurrentLevel()` にケースを追加
5. `src/main.js` の `drawBG()` に背景を追加（新テーマの場合）
6. `npm run build` でエラーなし確認

## main.js 接続ポイント

### import ブロック（ファイル先頭）
```javascript
import {buildLevel_X_X} from './levels/levelX-X.js';
```

### goalSlide 完了ハンドラ
```javascript
// 各ステージの G.currentLevel 判定の末尾に追加
else if(G.currentWorld===X&&G.currentLevel===Y){ G.currentLevel=Y+1; buildLevel_X_X(); ... }
```

### restartCurrentLevel()
```javascript
// 世界ごとの分岐に追加
else if(G.currentWorld===X&&G.currentLevel===Y) buildLevel_X_X();
```

## 強制スクロール（G.autoScroll）

`G.autoScroll > 0` のとき毎フレームカメラが自動前進。マリオは左端に押される。
- 4-1: `0.8` / 4-2: `1.2` / 8-1: `0.8` / 8-2: `1.0`
- enterUnderground() で自動リセット済み
- 全レベルリセット時に `G.autoScroll=0` 必須

## 移動足場（ワンウェイ）実装メモ

```javascript
// 毎フレーム: mp.prevX=mp.x; mp.prevY=mp.y;
// 着地判定: mario.vy>=0 かつ 前フレーム底辺 <= 足場上端+4
const prevBot = mario.y - mario.vy + mario.h;
if(mario.vy>=0 && prevBot<=mp.prevY+4){
  mario.y=mp.y-mario.h;
  mario.x+=mp.x-(mp.prevX??mp.x); // 横移動追従
}
```

## 現在の実装状況

| ステージ | ファイル | 特記 |
|---|---|---|
| 1-1〜1-3 | level1-1〜3.js | 通常面 |
| 1-4 | level1-4.js | 城・ドッスン×3 |
| 2-1〜2-2 | level2-1〜2.js | 砂漠 |
| 2-3 | level2-3.js | 砂漠城・追いかけ壁 |
| 3-1〜3-2 | level3-1〜2.js | 海辺 |
| 3-3 | level3-3.js | 海辺城・潮モード |
| 4-1〜4-2 | level4-1〜2.js | 山岳・強制スクロール |
| 4-3 | level4-3.js | 山岳城・風ゾーン |
| 5-1〜5-2 | level5-1〜2.js | 水中 |
| 5-3 | level5-3.js | 水中城・waterMode |
| 6-1〜6-2 | level6-1〜2.js | 氷・iceMode・ペンギン |
| 6-3 | level6-3.js | 氷城・追いかけ壁(強) |
| 7-1〜7-2 | level7-1〜2.js | 砦・テレサ・ドッスン |
| 7-3 | level7-3.js | 砦玉座・暗闇モード |
| 8-1〜8-2 | level8-1〜2.js | 飛行船・airshipMode |
| 8-3 | level8-3.js | 氷城→最終クッパ |
| 地下 | underground.js | 全バリアント |
