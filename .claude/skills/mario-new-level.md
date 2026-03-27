---
name: mario-new-level
description: マリオゲーム（Vite版）に新しいステージを追加する。新規ファイル作成→main.js接続まで行う。土管バリアント・スタート画面・ブロック重複チェックは毎回必ず実施。
---

新ステージの追加を依頼されました: $ARGUMENTS

## ⚠️ 毎回必ず行うこと（指示がなくても）

以下の4つは**全ステージ共通の必須作業**です。ユーザーから指示がなくても必ず実施してください：

1. **土管バリアントを新規追加** → `underground.js` に新テーマのバリアントを追加
2. **スタート画面のステージ選択に追加** → `src/main.js` のスタート画面ボタン/選択肢に新ステージを追加
3. **ブロック重複チェック** → `addRow` と `platforms.push` が同じ (x,y) を使っていないか必ず確認・修正
4. **土管周辺に敵を置かない** → 土管入口・出口から 200px 以内に敵を配置しない（下記「土管スポーン安全地帯」参照）

---

## ステップ1: 既存コード確認（Explore Agent）

Explore サブエージェントで以下を調べてください：
- `src/main.js` の `goalSlide` 完了ハンドラ（現在の最終分岐）
- `src/main.js` の `restartCurrentLevel()` の現在の分岐
- `src/main.js` の import ブロック（先頭10行）
- `src/main.js` の `scheduleBGM()` の条件分岐
- `src/main.js` の `drawBG()` の背景分岐
- `src/main.js` のスタート画面描画・ステージ選択処理（`G.selectedStage` を使っている箇所）
- `src/levels/underground.js` の既存バリアント一覧と末尾の `else` ブロック
- 直前のステージファイル（難易度・ギミック密度の参考）

## ステップ2: ステージ設計（Plan Agent）

### テーマと難易度
- X-1: 易〜中、新ワールドの導入
- X-2: 中、ギミック組み合わせ
- X-3: 中〜難、ギャップ多め
- X-4: 難、ボス or 城テーマ

### ステージ要素の設計
1. 背景テーマ（青空・夕方・夜・城・水中・砂漠など）
2. 地形: ギャップ位置と数
3. ブロック配置（Zone ごとに分割 約1000px区切り）
4. パイプ: 本数・ワープ有無・variant
5. 敵の密度（Zone1は少なめ、後半多め）
6. ギミック: 移動足場・バネ・砲台・チェックポイント
7. 特殊ブロック: スター・1UP・ヨシ卵・コインブロック

## ステップ3: 実装

### 3-1. 新規ファイル作成

**ファイル名規則:**
```
World 1: src/levels/level1-1.js 〜 level1-4.js  ← 既存
World 2: src/levels/level2-1.js 〜 level2-4.js
World 3: src/levels/level3-1.js など
```

**ファイルテンプレート（必ずこの import ヘッダーから始める）:**
```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（ギャップ定義）
  const gaps=[{s:2500,e:2650}];
  for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ブロック配置（特殊ブロックは addRow しない、push のみ）
  addRow(...);

  // パイプ（isWarp:true のパイプには piranha 出さない）
  [[px,ph,warp],...].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,
                isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン・敵（parakoopa は x>=2000 のみ）
  // 移動足場・バネ・チェックポイント・特殊ブロック
}
```

### 3-2. main.js に import を追加

`src/main.js` の import ブロック（先頭10行あたり）に追加：
```javascript
import {buildLevel_2_1} from './levels/level2-1.js';
```

### 3-3. main.js の goalSlide 完了ハンドラを更新

`src/main.js` 内の `else{G.state='win'` の直前の分岐を変更：
```javascript
// 変更前（1-4クリア後がwinだった部分）:
else{G.state='win';...}

// 変更後:
else if(G.currentLevel===4&&G.currentWorld===1){
  G.currentLevel=1;G.currentWorld=2;buildLevel_2_1();
  fireballs.length=0;resetMario();G.timeLeft=400;
  G.state='intro';G.introTimer=120;
  try{startBGM()}catch(e){}updateHUD();
}
else{G.state='win';...}
```

### 3-4. main.js の restartCurrentLevel() にケースを追加

```javascript
// 既存の else buildLevel4() の後に追加:
else if(G.currentWorld===2&&G.currentLevel===1)buildLevel_2_1();
else if(G.currentWorld===2&&G.currentLevel===2)buildLevel_2_2();
// ... 以下同様
```

### 3-5. drawBG() に背景を追加（新テーマの場合）

`src/main.js` の `drawBG()` 関数内に分岐追加：
```javascript
if(G.currentWorld===2&&G.currentLevel===1){
  // グラデーション等で背景描画
}
```

### 3-6. scheduleBGM() の更新（専用BGMが必要な場合）

`src/main.js` の scheduleBGM 内の条件を拡張：
```javascript
const notes=G.ugMode?UG_NOTES:(G.starTimer>0?STAR_NOTES:(G.currentLevel===4?CASTLE_NOTES:THEME_NOTES));
// 例: World 2 専用BGM を追加する場合
const notes=G.ugMode?UG_NOTES:(G.starTimer>0?STAR_NOTES:
  (G.currentLevel===4&&G.currentWorld===1?CASTLE_NOTES:
  G.currentWorld===2?WORLD2_NOTES:THEME_NOTES));
```

## ステップ4: 土管バリアント追加（毎回必須）

このステージ専用の地下バリアントを `src/levels/underground.js` に **最低2本分** 追加する。
バリアント名はステージテーマを反映した文字列（例: `'desert1'`, `'snow1'`, `'sky1'` など）。

**バリアント内容のルール：**
- 既存バリアント（`coin`, `goomba`, `mushroom`, `danger1up`, `star`, `desert1`, `desert2`）と**被らない独自コンセプト**にする
- そのステージの新敵や特徴的なギミックを地下にも登場させる
- 難易度は地上ステージと揃える（X-1なら低め、X-3なら高め）

**underground.js のリセット行に新配列も含めること:**
```javascript
// buildUnderground 冒頭のリセットに、このステージで追加した新配列も追加
chainChomps.length=0; jumpBlocks.length=0; pipos.length=0;
// 新ステージで追加した敵配列があればここにも追記
```

## ステップ5: スタート画面のステージ選択に追加（毎回必須）

`src/main.js` のスタート画面（`G.state==='start'` の描画・クリック処理）を読んで、
新ステージのボタンまたは選択肢を追加する。

現在は 1-1〜1-4 の4ボタン構成。World 2 を追加する場合の例：
```javascript
// 描画側: ボタンを追加 or World 2 のボタン列を追加
// クリック/キー処理側: startFromStage または buildLevel_2_1 の呼び出しを追加
```

`startFromStage(n)` で対応できない場合（World 2 以降）は `startFromStage` を拡張するか、
World/Level を直接セットして buildLevel_X_Y() を呼ぶ処理を追加する。

## ステップ6: ブロック重複チェック（毎回必須・最重要）

実装したレベルファイルの全 `addRow` と `platforms.push` の座標を照合する。
**これを怠ると「チビマリオで叩けないQブロック」バグが必ず発生する。**

**チェック方法：**
- `addRow(x, y, n, t)` は x, x+32, x+64, ... x+(n-1)*32 の座標を使う
- `platforms.push({x:px, y:py, ...})` の px,py がそのいずれかと一致していたら**重複バグ**
- 重複があれば `addRow` の範囲を調整するか、特殊ブロック側の座標をずらして解消する
- **特殊ブロック（Q/hidden/yoshiEgg）は `addRow` に含めず、必ず `platforms.push` のみで配置**

**よくある重複パターン（必ず確認）：**
```javascript
// NG: addRow と push が同じ x,y → ブロックが重なり叩けない
addRow(1100, H-5*TILE, 5, 'brick');  // x=1100,1132,1164,1196,1228
platforms.push({x:1100, y:H-5*TILE, ..., hasMush:true});  // ← x=1100 が重複！

addRow(2600, H-7*TILE, 3, 'brick');  // x=2600,2632,2664
platforms.push({x:2600, y:H-7*TILE, ..., hasMush:true});  // ← x=2600 が重複！

// OK: addRow 終端 x+(n-1)*32 より大きい x に配置
addRow(1100, H-5*TILE, 5, 'brick');  // ends at x=1228
platforms.push({x:1250, y:H-5*TILE, ..., hasMush:true});  // x=1250 > 1228 ✓

// OK: 異なる y に配置
addRow(2600, H-7*TILE, 3, 'brick');
platforms.push({x:2600, y:H-9*TILE, ..., hasMush:true});  // y が違えば OK ✓
```

**チェック用コメント記法（推奨）：**
```javascript
addRow(350, H-5*TILE, 4, 'brick');  // x:350,382,414,446
// ↑ このコメントを書いておくと重複チェックが容易になる
platforms.push({x:480, y:H-5*TILE, ...});  // x=480 > 446 ✓
```

## 実装後チェックリスト

### 基本
- [ ] ファイル先頭の import ヘッダーが正しいか
- [ ] 全配列リセットが漏れなくあるか（lavaFlames 含む）
- [ ] ヨシリセットが `!yoshi.mounted` 条件付きか
- [ ] G.xxx 形式でスカラー変数を設定しているか
- [ ] parakoopa は x>=2000 のみか
- [ ] main.js の import に追加したか
- [ ] goalSlide ハンドラを更新したか
- [ ] restartCurrentLevel() にケースを追加したか

### 毎回必須の8項目
- [ ] **土管バリアントを新規追加したか**（underground.js に最低2本）
- [ ] **スタート画面のステージ選択に追加したか**（main.js のスタート画面処理）
- [ ] **addRow と platforms.push の座標重複がないか確認・修正したか**（Q/hidden/yoshiEgg は addRow に含めず push のみ）
- [ ] **土管入口・出口から 200px 以内に敵を置いていないか確認したか**
- [ ] **地上敵（goomba/koopa/buzzy等）が gaps 配列内の x に置かれていないか確認したか**（gaps.some(g=>e.x>=g.s&&e.x<g.e) でギャップ内の敵は即落下する）
- [ ] **G.checkpoint.x がギャップ外の地面またはブロック上にあるか確認したか**（ギャップ内だと旗が空中に浮く）
- [ ] **コインが城以外のアクションステージで300枚以上あるか確認したか**
- [ ] **ステージが LW-500(=7500) より手前で終わる場合、flagPole を import して flagPole.x を設定したか**

### 最終
- [ ] `npm run build` でエラーなし確認
- [ ] enterUnderground / exitUnderground で新配列がリセットされるか確認
- [ ] 土管入口・出口周辺に敵を置いていないか確認（safe zone 200px）
- [ ] 地上敵の x 座標が gaps 配列の範囲外か全件確認（ギャップ内 → 即落下バグ）
- [ ] G.checkpoint.x がギャップ外か確認、y が地面(H-TILE)またはブロック上か確認

## 土管スポーン安全地帯（必須ルール）

### コード側の自動処理
`main.js` の `enterUnderground` / `exitUnderground` には **スポーン周辺 200px の敵を自動除去する処理** が入っている。

- **地下入場時**: mario.x=60 がスポーン → x<260 の enemies を除去
- **地上復帰時**: 元のパイプ位置(savedOW.mx) から 200px 以内の enemies を除去
- **「敵が向かってくるのはOK」** → 遠くから歩いてくる敵は除去しない（距離チェックのみ）

### レベル設計側でも必ず守ること

自動除去があっても、**レベルファイルに最初から敵を置かない**のが原則。

```javascript
// NG: 土管 x=700 の直後に敵
pipes.push({x:700, ...});
enemies.push({x:820, t:'goomba'});   // 700+120 = NG（200px以内）

// OK: 土管から 200px 以上離す
enemies.push({x:950, t:'goomba'});   // 700+250 = OK
```

**土管ワープの入口・出口リスト（ステージ設計時に確認）：**
- ワープ土管の x 座標 ±200px に敵を置かない
- 地下出口パイプ（`isExit:true`）の周辺も同様に空ける

### パラクーパ（飛びノコノコ）の使用判断

- **ステージが既にゴチャゴチャしている場合は入れない**（難易度スパイクになる）
- 川ギャップ・水上など「空中に敵がいると自然なシーン」でのみ使用を検討
- 1ステージに入れる場合でも **5〜8体程度** を上限の目安にする
- ラキチュウがいるステージでは原則パラクーパを入れない（空中密度過多）

## globals.js / builders.js について（重要）

v2 プロジェクトでは変数はすべて `src/globals.js` から import する。
直接宣言は不可。

| 旧（index.html） | 新（v2） |
|---|---|
| `starTimer = 0` | `G.starTimer = 0` |
| `ugMode = false` | `G.ugMode = false` |
| `goalSlide = null` | `G.goalSlide = null` |
| `checkpointReached = false` | `G.checkpointReached = false` |
| `combo = 0` | `G.combo = 0` |
| `platforms.push(...)` | 同じ（配列はそのまま） |
| `yoshi.alive = false` | 同じ（オブジェクトはそのまま） |
