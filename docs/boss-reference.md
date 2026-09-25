# クッパ・城ステージ リファレンス

## BOWSER_STATS テーブル（globals.js）

（globals.js の実値。W が進むほど速く・短い間隔になるよう単調に並べる。2026-09-25 に W5 が W4 より弱かったのを W4〜W6 の間へ調整）

| W | HP | fireImmune | speed | 火球速 | 火球vy | fireTimer | jumpTimer |
|---|-----|-----------|-------|--------|--------|-----------|-----------|
| 1 | 3 | false | 1.0 | 4.0 | -2.5 | 160 | 320 |
| 2 | 3 | false | 1.2 | 4.5 | -3.0 | 140 | 300 |
| 3 | 3 | false | 1.4 | 5.0 | -3.5 | 120 | 290 |
| 4 | 4 | false | 1.6 | 5.5 | -3.5 | 105 | 280 |
| 5 | 4 | false | 1.7 | 6.0 | -4.0 | 102 | 275 |
| 6 | 4 | false | 1.8 | 6.5 | -4.0 | 100 | 270 |
| 7 | 5 | false | 2.0 | 7.0 | -4.5 | 90 | 260 |
| 8 | 5 | false | 2.2 | 7.5 | -5.0 | 85 | 240 |

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

| ステージ | addStair | stairSealX | bowserArenaX | bowserLeftX |
|---|---|---|---|---|
| 1-3 | (6200, 10) | 6456 | 6455 | 6586 |
| 2-3 | (6000, 10) | 6256 | 6255 | 6386 |
| 3-3 | (6400, 10) | 6656 | 6655 | 6786 |
| 4-3 | (6400, 10) | 6656 | 6655 | 6786 |
| 5-3 | (6600, 10) | 6856 | 6855 | 6986 |
| 6-3 | (6700, 10) | 6956 | 6955 | 7086 |
| 7-3 | (6500, 10) | 6756 | 6755 | 6886 |
| 8-3 | ※ワープ土管(6880)→地下 bowser_final（BOWSER_STATS[8]、即 walk） | — | — | — |

- 大階段の中に敵を置かない（アリーナへ押し出されてピーチ追跡中のマリオを倒していた。2026-09-25 に全城から撤去）
- ステージ右端 LW で止まる（城は旗が無いので、以前はクッパを越えて右へ進むと見えない穴に落ちた）
- 撃破演出・ピーチ追跡中は残り時間が減らず、マリオもやられない

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
