// 未定義の名前の参照を探す（ファイル内で宣言も import もされていない名前）。実行時に ReferenceError になる所を、そのコードが動く前に見つける
// スコープは無視した近似（別の関数の同名ローカル変数があると見逃す）。ファイル間でコードを動かしたときの取りこぼし検出用
// 使い方: node tools/check-refs.mjs [ファイル...]   （省略時は src/ と src/levels/ の .js すべて。見つかれば終了コード1）
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {parseSync} from 'rolldown/experimental';
const GLOBALS=new Set(['Math','document','window','performance','Date','JSON','Number','String','Array','Object','Infinity','NaN','isNaN','isFinite','parseInt','parseFloat','console','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','setInterval','clearInterval','navigator','localStorage','sessionStorage','undefined','Map','Set','WeakMap','Promise','Error','Symbol','Boolean','encodeURIComponent','decodeURIComponent','KeyboardEvent','Uint8ClampedArray','Float32Array','Image','AudioContext','webkitAudioContext','matchMedia','screen','location','history','globalThis','arguments','Reflect','Proxy','BigInt','structuredClone','OffscreenCanvas','Path2D','ImageData','DOMRect','TouchEvent','Event','CustomEvent','alert','confirm','caches','fetch','URL','queueMicrotask','devicePixelRatio','innerWidth','innerHeight']);
const SRC=fileURLToPath(new URL('../src/',import.meta.url));
const files=process.argv.length>2?process.argv.slice(2):['','levels'].flatMap(d=>fs.readdirSync(path.join(SRC,d)).filter(n=>n.endsWith('.js')).map(n=>path.join(SRC,d,n)));
let total=0;
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  const res=parseSync(f,src,{sourceType:'module'});
  if(res.errors?.length){console.log(f,'構文エラー',res.errors.map(e=>e.message).join(' / '));total++;continue;}
  const bound=new Set(),refs=new Map();
  const bindPat=p=>{if(!p)return;if(p.type==='Identifier')bound.add(p.name);else if(p.type==='ObjectPattern')p.properties.forEach(q=>bindPat(q.value??q.argument));else if(p.type==='ArrayPattern')p.elements.forEach(bindPat);else if(p.type==='AssignmentPattern')bindPat(p.left);else if(p.type==='RestElement')bindPat(p.argument);};
  const walk=(n,p,k)=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(x=>walk(x,p,k));return;}
    if(n.type==='VariableDeclarator')bindPat(n.id);
    if((n.type==='FunctionDeclaration'||n.type==='FunctionExpression'||n.type==='ClassDeclaration')&&n.id)bound.add(n.id.name);
    if(n.type==='FunctionDeclaration'||n.type==='FunctionExpression'||n.type==='ArrowFunctionExpression')(n.params||[]).forEach(q=>bindPat(q.type==='FormalParameter'?q.pattern:q));
    if(n.type==='CatchClause')bindPat(n.param);
    if(n.type==='ImportSpecifier'||n.type==='ImportDefaultSpecifier'||n.type==='ImportNamespaceSpecifier')bound.add(n.local.name);
    if(n.type==='Identifier'){const skip=(p&&(p.type==='MemberExpression'||p.type==='StaticMemberExpression')&&k==='property'&&!p.computed)||(p&&p.type==='Property'&&k==='key'&&!p.computed&&!p.shorthand)||(p&&(p.type==='LabeledStatement'||p.type==='BreakStatement'||p.type==='ContinueStatement'))||(p&&(p.type==='ImportSpecifier'||p.type==='ExportSpecifier'))||(p&&p.type==='MetaProperty');
      if(!skip)refs.set(n.name,(refs.get(n.name)||0)+1);}
    for(const kk in n){if(kk==='start'||kk==='end'||kk==='type')continue;const v=n[kk];if(v&&typeof v==='object')walk(v,n,kk);}};
  walk(res.program,null,null);
  const unresolved=[...refs.keys()].filter(n=>!bound.has(n)&&!GLOBALS.has(n));
  total+=unresolved.length;if(unresolved.length)console.log(`${f}: 未定義の参照 ${unresolved.length} 個`,unresolved.join(' '));
}
console.log(total?`未定義の参照: 合計 ${total} 個`:`未定義の参照なし（${files.length} ファイル）`);
process.exit(total?1:0);
