// キーボード入力とキーコンフィグ
// アクションごとに最大3つのキーを割り当てる。割当は localStorage(mario_v2_keys) に保存
export const keys={}; // e.code → 押下中か

export const ACTIONS=['left','right','down','jump','dash','fire','yoshi','item','pause'];
export const ACTION_LABEL={left:'LEFT',right:'RIGHT',down:'DOWN',jump:'JUMP',dash:'DASH',fire:'FIRE',yoshi:'YOSHI',item:'ITEM',pause:'PAUSE'};
export const ACTION_DESC={left:'左へ移動',right:'右へ移動',down:'しゃがむ/土管/ヒップドロップ',jump:'ジャンプ/泳ぐ/壁キック',dash:'ダッシュ/甲羅を持つ',fire:'ファイア/アイス/ハンマー',yoshi:'ヨッシーの舌/タマゴ',item:'ストックアイテム使用',pause:'ポーズメニュー'};
export const SLOTS=3;
export const DEFAULT_BINDS={
  left:['ArrowLeft','KeyA'],right:['ArrowRight','KeyD'],down:['ArrowDown','KeyS'],
  jump:['Space','ArrowUp','KeyK'],dash:['ShiftLeft','ShiftRight','KeyJ'],
  fire:['KeyZ'],yoshi:['KeyX'],item:['KeyC'],pause:['KeyP','Escape'],
};
// 設定変更できないキー（音量・ミュート等の固定操作と衝突させない）
export const RESERVED=new Set(['KeyM','Equal','Minus','NumpadAdd','NumpadSubtract','Enter','Tab','F5','F11','F12']);

export const binds={};
export function resetBinds(){for(const a of ACTIONS)binds[a]=[...DEFAULT_BINDS[a]];}
function saveBinds(){try{localStorage.setItem('mario_v2_keys',JSON.stringify(binds));}catch(e){}}
(function load(){
  resetBinds();
  try{const o=JSON.parse(localStorage.getItem('mario_v2_keys'));
    if(o)for(const a of ACTIONS)if(Array.isArray(o[a]))binds[a]=o[a].filter(c=>typeof c==='string').slice(0,SLOTS);}catch(e){}
})();

export function isBound(code,action){return binds[action].includes(code);}
export function held(action){for(const c of binds[action])if(keys[c])return true;return false;}

// action の slot 番目にキーを割り当てる。他アクションで使われていたら外す（二重割当防止）
export function setBind(action,slot,code){
  const list=binds[action],cur=list.indexOf(code);
  if(cur>=0){ // 同じアクションの別の欄にある → 入れ替え
    if(slot<list.length&&slot!==cur){const old=list[slot];list[slot]=code;list[cur]=old;}
    saveBinds();return;
  }
  for(const a of ACTIONS){if(a===action)continue;const i=binds[a].indexOf(code);if(i>=0)binds[a].splice(i,1);}
  if(slot<list.length)list[slot]=code;else list.push(code);
  saveBinds();
}
export function clearBind(action,slot){binds[action].splice(slot,1);saveBinds();}
export function resetAndSaveBinds(){resetBinds();saveBinds();}

const NAMES={Space:'SPACE',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',ShiftLeft:'L-SHIFT',ShiftRight:'R-SHIFT',
  ControlLeft:'L-CTRL',ControlRight:'R-CTRL',AltLeft:'L-ALT',AltRight:'R-ALT',Escape:'ESC',Backspace:'BS',Comma:',',Period:'.',Slash:'/',
  Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backslash:'\\',Backquote:'`',CapsLock:'CAPS',Delete:'DEL',Insert:'INS',Home:'HOME',End:'END',PageUp:'PGUP',PageDown:'PGDN'};
export function keyLabel(code){
  if(!code)return'---';
  if(NAMES[code])return NAMES[code];
  if(code.startsWith('Key'))return code.slice(3);
  if(code.startsWith('Digit'))return code.slice(5);
  if(code.startsWith('Numpad'))return'NUM'+code.slice(6);
  return code.toUpperCase().slice(0,7);
}
// 表示用: アクションの主キー名（例: 'Z'）。未割当なら '---'
export function mainKey(action){return keyLabel(binds[action][0]);}
