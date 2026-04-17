import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

// 3-3: 海辺の要塞 (Seaside Fortress)
// テーマ: 海辺の城、溶岩ピット×3、大砲×5、ラキチュウ2体
// クッパ HP=5 (1-4の1.66倍)
export function buildLevel_3_3(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面 (溶岩ピット×3 — gap2 widened ~100px)
  const gaps=[{s:1900,e:2120},{s:3400,e:3740},{s:5200,e:5440}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // 城ブロック — castle variety with H-4*TILE, H-6*TILE ledges
  addRow(0,H-5*TILE,3,'brick');
  addRow(350,H-5*TILE,4,'brick');addRow(450,H-9*TILE,3,'q');
  addRow(650,H-4*TILE,2,'brick');           // low castle ledge
  addRow(800,H-7*TILE,3,'brick');
  addRow(1100,H-5*TILE,5,'brick');
  addRow(1350,H-6*TILE,2,'brick');          // mid castle ledge
  addRow(1500,H-7*TILE,3,'brick');
  addRow(1700,H-4*TILE,2,'brick');          // low castle ledge
  addRow(2200,H-5*TILE,4,'brick');addRow(2200,H-9*TILE,3,'q');
  addRow(2450,H-6*TILE,2,'brick');          // mid castle ledge
  addRow(2600,H-7*TILE,3,'brick');
  addRow(2900,H-5*TILE,5,'brick');
  addRow(3150,H-4*TILE,2,'brick');          // low castle ledge
  addRow(3800,H-5*TILE,4,'brick');addRow(3800,H-9*TILE,3,'q');  // shifted for widened gap2
  addRow(4100,H-7*TILE,3,'brick');
  addRow(4300,H-6*TILE,2,'brick');          // mid castle ledge
  addRow(4450,H-5*TILE,4,'brick');
  addRow(4700,H-4*TILE,2,'brick');          // low castle ledge
  addRow(4850,H-7*TILE,3,'brick');
  addRow(5500,H-5*TILE,4,'brick');addRow(5500,H-9*TILE,3,'q');
  addRow(5900,H-7*TILE,3,'brick');
  addRow(6050,H-6*TILE,2,'brick');          // mid castle ledge
  addRow(6200,H-5*TILE,4,'brick');
  // 大型上り階段（10段）— マリオが高台に上ってクッパアリーナへ
  addStair(6400,10);
  G.stairSealX=6656;

  // 特殊ブロック (pushのみ)
  platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:600,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1050,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3200,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3900,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4550,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5050,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5650,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6000,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1380,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4900,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:2800,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // コイン — safe arches + risk coins hovering over lava pit edges
  // Safe coin lines
  for(let i=0;i<7;i++)coinItems.push({x:350+i*200,y:H-9*TILE,collected:false});
  for(let i=0;i<6;i++)coinItems.push({x:3850+i*180,y:H-9*TILE,collected:false});
  // Risk coins near lava pits (high reward near flames)
  for(let i=0;i<4;i++)coinItems.push({x:1920+i*50,y:H-3*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:3420+i*55,y:H-3*TILE,collected:false});
  for(let i=0;i<4;i++)coinItems.push({x:5220+i*50,y:H-3*TILE,collected:false});

  // 地上敵（サボテンはW2テーマのため削除→koopa/goombaに置換）
  [{x:620,t:'goomba'},{x:880,t:'koopa'},
   {x:1100,t:'koopa'},{x:1380,t:'koopa'},{x:1490,t:'goomba'},{x:1600,t:'goomba'},
   {x:2200,t:'koopa'},{x:2380,t:'koopa'},{x:2600,t:'hammerBro'},{x:2700,t:'goomba'},
   {x:3480,t:'koopa'},{x:4120,t:'koopa'},{x:4220,t:'koopa'},
   {x:4200,t:'goomba'},{x:4300,t:'goomba'},{x:4700,t:'goomba'},{x:4820,t:'koopa'},
   {x:5500,t:'koopa'},{x:5620,t:'hammerBro'},{x:5740,t:'goomba'},
   {x:5930,t:'koopa'},{x:6570,t:'koopa'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
    else if(t==='koopa')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
    else if(t==='hammerBro')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false};
    if(e)enemies.push(e);
  });

  // ラキチュウ (2体)
  [{x:1800,bY:H-9*TILE},{x:4400,bY:H-9*TILE}].forEach(({x,bY})=>{
    enemies.push({x,y:bY,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'lakitu',state:'fly',baseY:bY,phase:Math.random()*Math.PI*2,dropTimer:100});
  });

  // 移動足場 (溶岩ピット越え)
  movingPlats.push(
    {x:1960,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1960,range:80,spd:1.3},
    {x:3470,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3470,range:120,spd:1.5},
    {x:5270,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5270,range:90,spd:1.6}
  );

  // 大砲 (5門)
  cannons.push(
    {x:580, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20},
    {x:1650,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:60},
    {x:2950,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:100},
    {x:4400,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:140},
    {x:5780,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:40}
  );

  // 溶岩 (ピット内間欠泉×6 + 地上火柱×12)
  [
    {x:1965,w:22,maxH:200,period:165,phase:0},
    {x:2060,w:18,maxH:165,period:165,phase:50},
    {x:3475,w:22,maxH:200,period:150,phase:0},
    {x:3570,w:18,maxH:165,period:150,phase:65},
    {x:5280,w:22,maxH:200,period:140,phase:0},
    {x:5375,w:18,maxH:165,period:140,phase:40},
    // 地上火柱
    {x:450, w:16,maxH:80,period:220,phase:70},
    {x:700, w:16,maxH:90,period:210,phase:40},
    {x:960, w:16,maxH:75,period:200,phase:130},
    {x:1290,w:16,maxH:80,period:190,phase:0},
    {x:1680,w:16,maxH:85,period:215,phase:90},
    {x:2250,w:16,maxH:90,period:205,phase:50},
    {x:2650,w:16,maxH:80,period:200,phase:80},
    {x:3050,w:16,maxH:85,period:185,phase:160},
    {x:3760,w:16,maxH:80,period:195,phase:30},
    {x:4150,w:16,maxH:85,period:180,phase:110},
    {x:4650,w:16,maxH:75,period:210,phase:170},
    {x:4980,w:16,maxH:85,period:190,phase:60}
  ].forEach(f=>lavaFlames.push({...f,curH:0}));

  // チェックポイント
  G.checkpoint={x:3800,y:H-TILE,reached:false};

  // アリーナ壁（7ブロック高・Bowserジャンプ144px < 壁高224px）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6720,wy,'brick');addB(6752,wy,'brick');}
  // アリーナ内 ? ブロック
  platforms.push({x:6860,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7100,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  // ★ アリーナ足場（高低差でジャンプルート多様化）
  addRow(6900,H-7*TILE,2,'brick');   // 中段足場（左側）
  addRow(7150,H-6*TILE,2,'brick');   // 中段足場（右側）
  // ★ アリーナ特色: 潮に浮かぶ岩島（垂直移動足場 × 2）
  movingPlats.push({x:6950,y:H-5*TILE,w:TILE*2,h:12,type:'v',ox:6950,oy:H-5*TILE,range:TILE*2,spd:0.7,prevX:6950});
  movingPlats.push({x:7200,y:H-6*TILE,w:TILE*2,h:12,type:'v',ox:7200,oy:H-6*TILE,range:TILE*2,spd:0.9,prevX:7200});
  // クッパ — 階段頂上をマリオが越えたとき画面右端から登場
  G.bowserArenaX=6655;G.checkpoint2={x:6250,y:H-TILE,reached:false};
  G.bowserLeftX=6786;
  const _bs=BOWSER_STATS[3];Object.assign(bowser,{alive:true,x:9000,y:H-TILE-72,w:64,h:72,hp:_bs.hp,maxHp:_bs.hp,
    vx:-_bs.speed,vy:0,facing:-1,hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0});
  // ★ ハンマースーツ
  platforms.push({x:4700,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  // 城の天井土管は撤去（落とし穴上の火柱との競合回避）
  // ★ 上空パタパタ（2段JMP対策）
  enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
  enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});
  // 潮の満ち引き（海辺の城らしさ）：低地が定期的に水没
  G.tideMode=true;

// ★ 新敵（CP2以降・クッパアリーナ前廊下）
enemies.push({x:6450,y:H-2*TILE,w:TILE,h:TILE,vx:-1.2,vy:0,alive:true,type:'bobomb',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1,litTimer:0});
enemies.push({x:6500,y:2*TILE,w:TILE,h:TILE,vx:-1.2,vy:0,alive:true,type:'spikeTop',state:'walk',baseX:6500,range:80,walkFrame:0,walkTimer:0,facing:-1});
enemies.push({x:6600,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'spiny',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3000,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
