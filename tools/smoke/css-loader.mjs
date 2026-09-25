// Node で main.js を読み込むためのローダー: CSS の import を空モジュールにする
export async function load(url,context,next){
  if(url.endsWith('.css'))return{format:'module',source:'',shortCircuit:true};
  return next(url,context);
}
