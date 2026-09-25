// スモークテスト用のブラウザ環境スタブ（DOM / Canvas / Audio / localStorage / rAF / 時計）
// main.js を import する前に installEnv() を呼ぶこと
import {register} from 'node:module';

export const handlers={document:{},window:{}};
export const clock={t:0};
export let rafCb=null;

function noop(){}
// どんなメソッド呼び出し・プロパティ代入も受け付ける 2D コンテキスト
function makeCtx(){
  const store={};
  const grad=()=>({addColorStop:noop});
  const special={
    createLinearGradient:grad,createRadialGradient:grad,createPattern:()=>({}),
    measureText:t=>({width:String(t).length*8}),
    getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),
    getTransform:()=>({a:1,b:0,c:0,d:1,e:0,f:0}),
  };
  return new Proxy(store,{
    get(o,k){if(k in special)return special[k];if(k in o)return o[k];return noop;},
    set(o,k,v){o[k]=v;return true;},
  });
}
function makeEl(id){
  const listeners={};
  const el={
    id,style:{},dataset:{},textContent:'',innerHTML:'',children:[],
    width:800,height:450,offsetWidth:806,offsetHeight:456,clientWidth:800,clientHeight:450,
    classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},toggle(c,f){const on=f===undefined?!this._s.has(c):f;on?this._s.add(c):this._s.delete(c);return on},contains(c){return this._s.has(c)}},
    addEventListener(t,f){(listeners[t]||=[]).push(f)},removeEventListener(){},
    appendChild(c){this.children.push(c);return c},contains(c){return c===this||this.children.includes(c)},closest(){return null},removeChild(){},append(){},remove(){},
    setAttribute(){},getAttribute(){return null},querySelector:()=>makeEl('q'),querySelectorAll:()=>[],
    getBoundingClientRect:()=>({left:0,top:0,width:806,height:456,right:806,bottom:456,x:0,y:0}),
    getContext:()=>makeCtx(),focus:noop,blur:noop,requestFullscreen:()=>Promise.resolve(),
    _listeners:listeners,
  };
  return el;
}
const els={};
export function el(id){return els[id]||=makeEl(id);}

function makeAudioParam(){return{value:1,setValueAtTime:noop,exponentialRampToValueAtTime:noop,linearRampToValueAtTime:noop,setTargetAtTime:noop,cancelScheduledValues:noop};}
class FakeAudioContext{
  constructor(){this.destination={};this.state='running';}
  get currentTime(){return clock.t/1000;}
  createOscillator(){return{type:'square',frequency:makeAudioParam(),detune:makeAudioParam(),connect:noop,disconnect:noop,start:noop,stop:noop};}
  createGain(){return{gain:makeAudioParam(),connect:noop,disconnect:noop};}
  createBufferSource(){return{buffer:null,connect:noop,start:noop,stop:noop,playbackRate:makeAudioParam()};}
  createBuffer(c,l,r){return{getChannelData:()=>new Float32Array(l)};}
  createBiquadFilter(){return{type:'lowpass',frequency:makeAudioParam(),Q:makeAudioParam(),connect:noop};}
  resume(){return Promise.resolve();}
  suspend(){return Promise.resolve();}
}

export const storage=new Map();
export const gamepads=[null,null,null,null];

export function installEnv(){
  register('./css-loader.mjs',import.meta.url);
  const document={
    getElementById:el,elementFromPoint:()=>null,querySelector:()=>el('q'),querySelectorAll:()=>[],createElement:t=>makeEl(t),
    addEventListener(t,f){(handlers.document[t]||=[]).push(f)},removeEventListener(){},
    body:el('body'),documentElement:el('html'),hidden:false,fonts:{ready:Promise.resolve()},
    fullscreenElement:null,exitFullscreen:()=>Promise.resolve(),
  };
  const win={
    addEventListener(t,f){(handlers.window[t]||=[]).push(f)},removeEventListener(){},
    innerWidth:1280,innerHeight:800,visualViewport:null,matchMedia:()=>({matches:false,addEventListener:noop}),
    AudioContext:FakeAudioContext,
  };
  const def=(k,v)=>Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true});
  def('document',document);
  def('window',new Proxy(win,{get:(o,k)=>k in o?o[k]:globalThis[k],set:(o,k,v)=>{o[k]=v;return true}}));
  def('innerWidth',1280);def('innerHeight',800);
  def('AudioContext',FakeAudioContext);
  def('navigator',{getGamepads:()=>gamepads,maxTouchPoints:0,userAgent:'node',serviceWorker:undefined});
  def('localStorage',{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),clear:()=>storage.clear()});
  def('sessionStorage',{getItem:()=>null,setItem:noop,removeItem:noop});
  def('performance',{now:()=>clock.t});
  def('requestAnimationFrame',cb=>{rafCb=cb;return 1;});
  def('cancelAnimationFrame',noop);
}

// 1フレーム(1000/60ms)進めて rAF コールバックを実行
export function step(){clock.t+=1000/60;const cb=rafCb;rafCb=null;if(cb)cb(clock.t);}

export function key(type,code,repeat=false){
  const e={code,key:code,type,repeat,preventDefault:noop,stopPropagation:noop};
  for(const f of handlers.document[type]||[])f(e);
}
