// 画面レイアウト: ウィンドウに収まるようにゲーム全体（HUD+キャンバス+ボタン）を縮小する
// - PC: 画面より大きいときだけ縮小（拡大はしない）
// - タッチ端末: 画面いっぱいにフィット。横向きではボタンをゲーム画面の上に半透明で重ねる
import {W,H} from './globals.js';

const wrap=document.getElementById('wrap');
// 主な入力が指（pointer: coarse）の端末だけをタッチ端末とみなす（タッチ対応PCはPC表示のまま）
export const isTouch=!!(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches);

export function fitScreen(){
  const vv=window.visualViewport;
  const vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;
  const landscape=vw>=vh;
  document.body.classList.toggle('touch',isTouch);
  document.body.classList.toggle('overlay',isTouch&&landscape);
  document.body.classList.toggle('portrait',isTouch&&!landscape);
  wrap.style.transform='none';
  const w=wrap.offsetWidth,h=wrap.offsetHeight;
  let s=Math.min(vw/w,vh/h);
  if(!isTouch)s=Math.min(1,s);
  wrap.style.transform=`scale(${s})`;
  wrap.style.left=`${Math.max(0,(vw-w*s)/2)}px`;
  wrap.style.top=`${Math.max(0,(vh-h*s)/2)}px`;
}

// 画面座標(clientX/Y) → キャンバス内座標(0..W, 0..H)。CSS縮小・枠線を考慮
export function canvasPoint(canvas,clientX,clientY){
  const r=canvas.getBoundingClientRect();
  const k=r.width/canvas.offsetWidth;
  const b=(canvas.offsetWidth-canvas.clientWidth)/2*k;
  return{x:(clientX-r.left-b)*W/(r.width-2*b),y:(clientY-r.top-b)*H/(r.height-2*b)};
}

// 縦向きの案内はタップで閉じられる
{const _rh=document.getElementById('rotate-hint');if(_rh)_rh.addEventListener('click',()=>document.body.classList.add('hint-closed'));}

window.addEventListener('resize',fitScreen);
window.addEventListener('orientationchange',()=>setTimeout(fitScreen,200));
if(window.visualViewport)window.visualViewport.addEventListener('resize',fitScreen);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitScreen);
fitScreen();
