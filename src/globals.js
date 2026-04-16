export const W=800,H=450,TILE=32,GRAVITY=0.52,LW=8000;

export const platforms=[],pipes=[],coinItems=[],enemies=[],mushrooms=[],fireballs=[],piranhas=[];
export const movingPlats=[],springs=[],hammers=[],cannons=[],bulletBills=[];
export const particles=[],scorePopups=[],blockAnims=[];
export const lavaFlames=[],bowserFire=[],yoshiEggs=[],yoshiItems=[];
export const chainChomps=[];
export const jumpBlocks=[];
export const pipos=[];
export const iceBalls=[];
export const marioHammers=[];
export const gravityZones=[];
export const windZones=[];
export const windParticles=[];

export const mario={x:80,y:H-3*TILE,w:26,h:32,vx:0,vy:0,onGround:false,facing:1,walkFrame:0,walkTimer:0,inv:0,dead:false,big:false,power:'none',wallContact:0,wallContactTimer:0,hipDrop:false,sliding:false,slideTimer:0,crouching:false};
export const yoshi={x:0,y:0,w:30,h:40,vx:0,vy:0,alive:false,mounted:false,facing:1,walkFrame:0,walkTimer:0,tongueOut:0,tongueLen:0,tongueMaxLen:90,eatCount:0,eggsReady:0,onGround:false,runAway:false,runTimer:0,flutterTimer:0,idleTimer:0};
export const bowser={alive:false,x:0,y:0,w:64,h:72,hp:3,maxHp:3,vx:-1.5,vy:0,facing:-1,hurtTimer:0,fireTimer:130,jumpTimer:220,onGround:false,state:'walk',deadTimer:0,fireImmune:false,phase:1,phaseTransition:0};
export const bowserShockwaves=[];

// クッパ難易度テーブル（ワールド1〜8で段階的に強化）
export const BOWSER_STATS={
  1:{hp:3,fireImmune:false,speed:1.2,fireSpeed:4.5,fireVy:-2.5,fireTimer:130,jumpTimer:240},
  2:{hp:3,fireImmune:false,speed:1.5,fireSpeed:5.0,fireVy:-3.0,fireTimer:110,jumpTimer:230},
  3:{hp:3,fireImmune:false,speed:1.8,fireSpeed:5.5,fireVy:-3.5,fireTimer:95,jumpTimer:220},
  4:{hp:4,fireImmune:false,speed:2.0,fireSpeed:6.0,fireVy:-3.5,fireTimer:80,jumpTimer:210},
  5:{hp:4,fireImmune:false,speed:2.0,fireSpeed:6.5,fireVy:-4.0,fireTimer:85,jumpTimer:215},
  6:{hp:4,fireImmune:false,speed:2.2,fireSpeed:7.0,fireVy:-4.0,fireTimer:75,jumpTimer:205},
  7:{hp:5,fireImmune:false,speed:2.4,fireSpeed:7.5,fireVy:-4.5,fireTimer:65,jumpTimer:195},
  8:{hp:5,fireImmune:false,speed:2.6,fireSpeed:8.0,fireVy:-5.0,fireTimer:60,jumpTimer:175}
};
export const peach={alive:false,x:0,y:0,w:30,h:52,vx:0,caught:false,walkFrame:0,walkTimer:0};
export const flagPole={x:LW-500,h:320};

// スカラー変数はオブジェクトにまとめて export（モジュール間で共有するため）
export const G={
  state:'start',score:0,coins:0,lives:3,timeLeft:400,
  timerTick:null,cam:0,frame:0,shakeX:0,shakeY:0,
  currentWorld:1,currentLevel:1,introTimer:0,goalSlide:null,
  lastFireFrame:-999,ugMode:false,savedOW:null,starTimer:0,
  combo:0,comboTimer:0,checkpoint:null,checkpointReached:false,
  selectedStage:1,peachChase:null,
  bowserArenaX:0,
  bowserLeftX:6900,
  autoScroll:0,
  waterMode:false,
  swimCooldown:0,
  paused:false,
  iceMode:false,
  shopCursor:0,nextStage:null,shopBought:null,
  weatherDrops:[],
  stageKills:0,stageMaxCombo:0,stageCoinsStart:0,
  totalKills:0,bgmMuted:false,bgmVolume:1.0,
  coinMagnet:false,doubleJump:false,doubleJumpUsed:false,
  retryHeart:0,shield:0,highJump:false,afterimages:[],
  darkMode:false,megaTimer:0,megaPrevPower:'none',megaPrevBig:false,
  chasingWall:null,gravityFlipped:false,
  sandstormMode:false,tideMode:false,tideLevel:450,airshipMode:false,
  pswitchTimer:0,_psCoins:null,_psBricks:null,
  stairSealX:null,
  usedUndergrounds:null,
  // ピノキオ部屋
  pinoRoom:false,pinoState:'idle',pinoReward:-1,
  pinoSpeechText:'',pinoSpeechTimer:0,pinoNeed:0,chestOpened:false,
  // EXステージ
  exStageFrom:null,isExStage:false,exStageFailed:false,exStageUsed:false,
  ex1Cleared:false,ex2Used:false,exStageNum:1,lowGravity:false,
  // 新機能
  heldItem:null,stageDamaged:false,clearedStages:[],
  // キャラクター・タイム
  character:'mario',stageStartTime:0,stageTimes:{}
};

// ピノキオエンティティ（ピノキオ部屋専用NPC）
export const pinoObj={alive:false,x:0,y:0,w:28,h:44,vx:1.5,vy:0,onGround:false,facing:1,jumpTimer:80,frame:0,frameTimer:0};
// 宝箱配列（platforms内にtype:'chest'として配置）
export let chests=[];
