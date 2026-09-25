// セーブデータ（3スロット）
// 各スロット = { progress: 続きから遊ぶための進行データ | null, records: { clearedStages:[id...], stageTimes:{id:秒} } }
// ・progress はゲームオーバーで消える（従来どおり）
// ・records（★とベストタイム）はゲームオーバーでも消えない
// 旧形式（mario_v2_save 1件）は初回起動時にスロット1へ移行する
const KEY='mario_v2_slots';
export const SLOT_COUNT=3;
const emptyRecords=()=>({clearedStages:[],stageTimes:{}});
export const slots=[];

function write(){try{localStorage.setItem(KEY,JSON.stringify(slots));}catch(e){}}

(function load(){
  let data=null;
  try{data=JSON.parse(localStorage.getItem(KEY));}catch(e){}
  for(let i=0;i<SLOT_COUNT;i++){
    const s=data&&data[i];
    slots.push({
      progress:s&&s.progress&&typeof s.progress==='object'?s.progress:null,
      records:{
        clearedStages:Array.isArray(s?.records?.clearedStages)?s.records.clearedStages.filter(n=>typeof n==='number'):[],
        stageTimes:s?.records?.stageTimes&&typeof s.records.stageTimes==='object'?{...s.records.stageTimes}:{},
      },
    });
  }
  if(!data){
    // 旧セーブの移行
    try{
      const old=JSON.parse(localStorage.getItem('mario_v2_save'));
      if(old&&typeof old==='object'){
        slots[0].records={clearedStages:Array.isArray(old.clearedStages)?[...old.clearedStages]:[],stageTimes:{...(old.stageTimes||{})}};
        const {clearedStages,stageTimes,...progress}=old;
        slots[0].progress=progress;
        write();
        localStorage.removeItem('mario_v2_save');
      }
    }catch(e){}
  }
})();

export function getProgress(i){return slots[i]?.progress||null;}
export function getRecords(i){return slots[i]?.records||emptyRecords();}
export function writeProgress(i,progress){if(!slots[i])return;slots[i].progress=progress;write();}
export function clearProgress(i){if(!slots[i])return;slots[i].progress=null;write();}
export function writeRecords(i,clearedStages,stageTimes){if(!slots[i])return;slots[i].records={clearedStages:[...clearedStages],stageTimes:{...stageTimes}};write();}
