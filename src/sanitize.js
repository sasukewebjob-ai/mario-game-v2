// レベルを組み立てた直後の安全処理
// ・ブロックや土管の中に埋まって取れないコインを、すぐ上の空いている場所へ移す（無ければ消す）
//   （コインの列をループで並べると土管やブロックを貫通しがちなため。レベルデータの検査は tools/ 側で行う）
import {platforms,pipes,coinItems,H} from './globals.js';

const SOLID_SKIP=new Set(['hidden','coin','chest']);

export function sanitizeLevel(){
  const solids=[];
  for(const p of platforms)if(!SOLID_SKIP.has(p.type))solids.push(p);
  for(const p of pipes)solids.push(p);
  // コインの見た目（中心付近の16x16）がブロックと重なっているか
  const buried=(x,y)=>{const cx=x+8,cy=y+8;for(const p of solids)if(cx<p.x+p.w&&cx+16>p.x&&cy<p.y+p.h&&cy+16>p.y)return true;return false;};
  for(let i=coinItems.length-1;i>=0;i--){
    const c=coinItems[i];
    if(c.collected||c.type||c.pop)continue; // 動くコイン（敵が落とす等）は対象外
    if(!buried(c.x,c.y))continue;
    // まず上へ、だめなら下へ（天井から下がった土管の中なら下に出す）
    let moved=false;
    for(let k=1;k<=8&&!moved;k++){const ny=c.y-k*32;if(ny<0)break;if(!buried(c.x,ny)){c.y=ny;moved=true;}}
    for(let k=1;k<=8&&!moved;k++){const ny=c.y+k*32;if(ny+32>H-32)break;if(!buried(c.x,ny)){c.y=ny;moved=true;}}
    if(!moved)coinItems.splice(i,1);
  }
}
