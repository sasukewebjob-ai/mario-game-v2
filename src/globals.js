export const W=800,H=450,TILE=32,GRAVITY=0.52,LW=8000;

export const platforms=[],pipes=[],coinItems=[],enemies=[],mushrooms=[],fireballs=[],piranhas=[];
export const movingPlats=[],springs=[],hammers=[],cannons=[],bulletBills=[];
export const particles=[],scorePopups=[],blockAnims=[];
export const lavaFlames=[],bowserFire=[],yoshiEggs=[],yoshiItems=[];
export const chainChomps=[];
export const jumpBlocks=[];
export const pipos=[];

export const mario={x:80,y:H-3*TILE,w:26,h:32,vx:0,vy:0,onGround:false,facing:1,walkFrame:0,walkTimer:0,inv:0,dead:false,big:false,power:'none'};
export const yoshi={x:0,y:0,w:30,h:40,vx:0,vy:0,alive:false,mounted:false,facing:1,walkFrame:0,walkTimer:0,tongueOut:0,tongueLen:0,tongueMaxLen:90,eatCount:0,eggsReady:0,onGround:false,runAway:false,runTimer:0,flutterTimer:0,idleTimer:0};
export const bowser={alive:false,x:0,y:0,w:64,h:72,hp:3,maxHp:3,vx:-1.5,vy:0,facing:-1,hurtTimer:0,fireTimer:130,jumpTimer:220,onGround:false,state:'walk',deadTimer:0};
export const peach={alive:false,x:0,y:0,w:30,h:52,vx:0,caught:false,walkFrame:0,walkTimer:0};
export const flagPole={x:LW-500,h:320};

// スカラー変数はオブジェクトにまとめて export（モジュール間で共有するため）
export const G={
  state:'start',score:0,coins:0,lives:3,timeLeft:400,
  timerTick:null,cam:0,frame:0,shakeX:0,shakeY:0,
  currentWorld:1,currentLevel:1,introTimer:0,goalSlide:null,
  lastFireFrame:-999,ugMode:false,savedOW:null,starTimer:0,
  combo:0,comboTimer:0,checkpoint:null,checkpointReached:false,
  selectedStage:1,peachChase:null
};
