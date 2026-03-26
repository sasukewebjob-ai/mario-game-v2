import {platforms,H,TILE} from './globals.js';

export function addB(x,y,type,hasMush){platforms.push({x,y,w:TILE,h:TILE,type:type==='q'?'question':type==='g'?'ground':'brick',hit:false,hasMush:!!hasMush,bounceOffset:0})}
export function addRow(x,y,n,t,hm){for(let i=0;i<n;i++)addB(x+i*TILE,y,t,hm&&i===Math.floor(n/2))}
export function addStair(x,steps){for(let i=0;i<steps;i++)for(let j=0;j<=i;j++)addB(x+i*TILE,H-(j+2)*TILE,'g')}
export function addStairD(x,steps){for(let i=0;i<steps;i++)for(let j=i;j<steps;j++)addB(x+i*TILE,H-(j+2)*TILE,'g')}
