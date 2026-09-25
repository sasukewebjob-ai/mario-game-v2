// PWA用アイコン（?ブロックのドット絵）をPNGで生成する
// 使い方: node tools/make-icons.mjs  → public/icon-192.png, icon-512.png, apple-touch-icon.png
import fs from 'fs';
import zlib from 'zlib';

const PAL={'.':[0x5c,0x94,0xfc],K:[0,0,0],O:[0xf8,0xa8,0x38],D:[0x9c,0x4a,0x00],W:[0xff,0xff,0xff]};
// 16x16: 空色の背景に ?ブロック
const grid=Array.from({length:16},()=>Array(16).fill('.'));
for(let y=1;y<=14;y++)for(let x=1;x<=14;x++)grid[y][x]=(y===1||y===14||x===1||x===14)?'K':'O';
for(const [x,y] of [[3,3],[12,3],[3,12],[12,12]])grid[y][x]='D';
const Q=['.WWW.','W...W','....W','...W.','..W..','..W..','.....','..W..'];
for(let y=0;y<Q.length;y++)for(let x=0;x<5;x++)if(Q[y][x]==='W')grid[4+y+1][6+x+1]='D'; // 影
for(let y=0;y<Q.length;y++)for(let x=0;x<5;x++)if(Q[y][x]==='W')grid[4+y][6+x]='W';

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
const crc=buf=>{let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&0xff]^(c>>>8);return(c^0xffffffff)>>>0;};
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([len,td,c]);}
function png(size){
  const s=size/16,raw=Buffer.alloc((size*3+1)*size);
  for(let y=0;y<size;y++){raw[y*(size*3+1)]=0;for(let x=0;x<size;x++){const col=PAL[grid[Math.floor(y/s)][Math.floor(x/s)]];col.forEach((v,i)=>raw[y*(size*3+1)+1+x*3+i]=v);}}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=2;
  return Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
const out=new URL('../public/',import.meta.url);
for(const [name,size] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',176]])fs.writeFileSync(new URL(name,out),png(size));
console.log('icons written');
