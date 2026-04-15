# クッパ・城ステージ リファレンス

## BOWSER_STATS テーブル（globals.js）

| W | HP | fireImmune | speed | 火球速 | 火球vy | fireTimer | jumpTimer |
|---|-----|-----------|-------|--------|--------|-----------|-----------|
| 1 | 3 | false | 1.2 | 4.5 | -2.5 | 130 | 240 |
| 2 | 3 | false | 1.5 | 5.0 | -3.0 | 110 | 230 |
| 3 | 3 | false | 1.8 | 5.5 | -3.5 | 95 | 220 |
| 4 | 4 | false | 2.0 | 6.0 | -3.5 | 80 | 210 |
| 5 | 4 | false | 2.0 | 6.5 | -4.0 | 85 | 215 |
| 6 | 4 | false | 2.2 | 7.0 | -4.0 | 75 | 205 |
| 7 | 5 | false | 2.4 | 7.5 | -4.5 | 65 | 195 |
| 8 | 5 | false | 2.6 | 8.0 | -5.0 | 60 | 175 |

- `fireImmune:true` のとき、ファイアボールはダメージなし（ダストのみ）
- ハンマースーツは fireImmune 無視

## 城ステージ クッパ初期化テンプレート

```javascript
const _bs=BOWSER_STATS[N]; // N=ワールド番号
G.bowserArenaX = XXXX;
G.bowserLeftX  = XXXX;
G.checkpoint2={x:G.bowserArenaX-400, y:H-TILE, reached:false};
Object.assign(bowser, {
  alive:true, x:9000, y:H-TILE-72, w:64, h:72,
  hp:_bs.hp, maxHp:_bs.hp, vx:-_bs.speed, vy:0, facing:-1,
  hurtTimer:0, fireTimer:_bs.fireTimer, jumpTimer:_bs.jumpTimer,
  onGround:false, state:'offscreen', deadTimer:0,
  fireImmune:_bs.fireImmune, phase:1, phaseTransition:0
});
```

## 各城ステージ座標

| ステージ | addStair | 壁x | bowserArenaX | bowserLeftX |
|---|---|---|---|---|
| 1-4 | (6200, 10) | 6520, 6552 | 6455 | 6586 |
| 2-3 | (6000, 10) | 6320, 6352 | 6255 | 6386 |
| 3-3 | (6400, 10) | 6720, 6752 | 6655 | 6786 |
| 4-3 | (6400, 10) | 6720, 6752 | 6655 | 6786 |
| 5-3 | (6400, 10) | 6720, 6752 | 6655 | 6786 |
| 6-3 | (6700, 10) | 7020, 7052 | 6955 | 7086 |
| 7-3 | (6500, 10) | 6820, 6852 | 6755 | 6886 |
| 8-3 | ※bowser_finalバリアント | — | — | — |

## 城ステージ レイアウト共通テンプレート

```javascript
addStair(startX, 10); // 10段上り階段
// アリーナ壁（7ブロック高 = 224px > Bowserジャンプ上限）
for(let wy=H-8*TILE; wy<H-TILE; wy+=TILE){
  addB(wallX, wy,'brick'); addB(wallX+32, wy,'brick');
}
G.bowserArenaX = stairRightEdge - 33;
G.bowserLeftX  = wallX + 64 + 2;
G.checkpoint2  = {x:G.bowserArenaX-400, y:H-TILE, reached:false};
```

## クッパ offscreen 登場条件

state==='offscreen' のとき以下3条件すべて満たしたら `state='walk'` に遷移:
1. `mario.x > G.bowserArenaX`
2. `mario.onGround`
3. `mario.y + mario.h >= H - TILE*2`

遷移時: `bowser.x = G.cam + W + 150`（画面右端から入場）

## クッパ第2形態（Phase 2）

HPが `Math.floor(maxHp/2)` 以下で遷移（一度きり）。

| 項目 | Phase 1 | Phase 2 |
|------|---------|---------|
| 移動速度 | _bs.speed | × 1.3 |
| ジャンプvy | -12 | -14 |
| 火球数 | 3発 | 5発（扇状） |
| 着地衝撃波 | なし | 左右に発射（vx=±6） |

- 衝撃波: `bowserShockwaves` 配列。90f存続 or 画面外で消滅
- レベルリセット・enterUnderground・bowser死亡時にクリア

## クッパ前チェックポイント（G.checkpoint2）

```javascript
G.checkpoint2={x:bowserArenaX-400, y:H-TILE, reached:false};
```
- 到達後の死亡はクッパ手前から復帰
- 全リセットポイントで `G.checkpoint2=null`
