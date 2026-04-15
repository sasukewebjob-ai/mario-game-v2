# ワールド別設計ルール・敵仕様

## W2 砂嵐モード（G.sandstormMode）

レベルファイルで `G.sandstormMode=true` を設定。全リセットで false に戻る。
- 茶色半透明オーバーレイ + 砂パーティクル40個
- 物理: 毎フレーム微小な右方向の力（マリオが左に進みにくい）

---

## W3 潮モード（G.tideMode）

通常ステージのみ（城は室内なので不使用）。`G.tideMode=true` を設定。
- 潮位: `H-TILE 〜 H-5*TILE` を約21秒周期で往復
- マリオが水面下のとき: 落下速度×0.88、最大落下4、微浮力-0.08
- リセット: `G.tideMode=false; G.tideLevel=H`

---

## W4 風ゾーン（windZones）

```javascript
windZones.push({x:500, y:0, w:900, h:H, force:-1.5}); // 負=左風（向かい風）
```
- 毎フレーム `mario.vx += force * 0.15`
- 斜め白線パーティクルで風向き表示

---

## W5 水中城（waterMode + 城）

```javascript
G.waterMode=true; // 水中城では lavaFlames を全削除する
```

---

## W6 氷ワールド（G.iceMode）

レベルファイルで `G.iceMode=true` を設定。4箇所で自動リセット（startFromStage/restart/goalSlide×2）。
enterUnderground() ではリセットしない（地下でも滑る仕様）。

**物理パラメータ:**
| 状態 | 加速係数 | 摩擦係数 |
|------|---------|---------|
| 通常 | 0.25 | 0.78 |
| 氷上 | 0.042 | 0.9895 |

### ペンギン（type:'penguin'）

```javascript
enemies.push({x, y:H-2*TILE, w:TILE, h:TILE, vx:-2.0, vy:0,
  alive:true, type:'penguin', state:'walk',
  walkFrame:0, walkTimer:0, onGround:false, facing:-1});
```
- 踏む → squish死 / ファイアボール → 死
- 崖折り返しロジック実装済み
- ギャップ内には置かない

---

## W7 砦ワールド（bgTheme:'fortress'）

bgmTheme:'castle' を使用。

### テレサ（type:'teresa'）

```javascript
enemies.push({x, y:H-6*TILE, w:28, h:28, vx:-0.5, vy:0.2,
  alive:true, type:'teresa', hiding:false, activated:true}); // activated:true 必須
```
- マリオが**背を向けている**と追跡（速度1.05）
- マリオが**正面を向く**と hiding=true（衝突無効）
- 撃破: スター / ハンマーのみ（踏み・ファイア免疫）
- ギャップ内配置OK（浮遊するため落下しない）
- ⚠️ `_tdx=mario.x-teresa.x`。テレサが右なら _tdx<0。facing===1のとき `_tdx<0` で「向いている」

### ドッスン（type:'thwomp'）

```javascript
enemies.push({x, y:TILE, w:TILE*2, h:TILE*2, vx:0, vy:0,
  alive:true, type:'thwomp', state:'idle', waitTimer:0});
```
- idle → fall（高速落下）→ wait（50f）→ rise → idle
- 撃破: スターのみ
- **⚠️ ドッスンの x〜x+64 の真下にブロックを置かない**（途中停止バグ）
- 着地時: `G.shakeX=6; G.shakeY=6`

---

## W8 飛行船ワールド（G.airshipMode）

`G.airshipMode=true` で ground/brick が鋼鉄甲板デザインに変わる。
bgTheme:'airship' / bgmTheme:'castle'

リセット時（startFromStage/restart/CP復帰）に自動で false に戻る。

### ゴールパイプ方式（8-1, 8-2）

```javascript
pipes.push({x:XXXX, y:H-TILE-3*TILE, w:TILE*2, h:3*TILE,
  bounceOffset:0, isWarp:true, variant:'airship_goal1'});
flagPole.x = LW+1000; // flagPole 無効化
```
underground.js の `airship_goal1` / `airship_goal2` にゴールパイプ（`isGoalPipe:true`）あり。

### 最終決戦（8-3）

```javascript
pipes.push({...isWarp:true, variant:'bowser_final'});
```
- `bowser_final` バリアント: `bowser.state='walk'`（即戦闘）, hp=7, `G.bowserRightX=W-TILE*3`

---

## 暗闇モード（G.darkMode）

```javascript
G.darkMode=true; // レベルファイルで設定
```
マリオ周囲のみスポットライト。半径: none=130, fire=180, ice=170, hammer=160, mega=220

---

## 重力反転ゾーン（gravityZones）

```javascript
gravityZones.push({x:2000, y:0, w:400, h:H});
```
ゾーン内で `G.gravityFlipped=true` → マリオは天井に着地、上下反転描画。

---

## 追いかけ壁（G.chasingWall）

```javascript
G.chasingWall={x:-200, speed:1.5, triggerX:500, active:false};
// mario.x > triggerX で起動。mario.x < wall.x で killMario(true)
```
triggerX はチェックポイント x + 200 を基準に設定すること。
