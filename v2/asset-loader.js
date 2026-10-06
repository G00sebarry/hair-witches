// Prioritize the first playable scene; later scenery uses one background request.
window.GameAssets=(()=>{
 const sizes=window.GAME_ASSET_SIZES,initial=new Set(window.GAME_INITIAL_ASSETS||Object.keys(sizes)),total=[...initial].reduce((n,k)=>n+sizes[k],0),fullTotal=Object.values(sizes).reduce((a,b)=>a+b,0),cache=new Map(),received=new Map(),done=new Set();
 const queue=[];let active=0,finished=false,failed=false;
 const bar=document.getElementById('loadProgress'),label=document.getElementById('loadDetail');
 const sum=keys=>[...keys].reduce((n,k)=>n+(received.get(k)||0),0);
 function paint(){const bytes=sum(initial),value=finished?100:Math.min(99,Math.floor(bytes/total*100));bar.value=value;label.textContent=failed?'Загрузка прервалась. Попробуй ещё раз.':finished?'Готово':`${value}% · ${(Math.min(bytes,total)/1048576).toFixed(1)} / ${(total/1048576).toFixed(1)} МБ`;
 const late=document.getElementById('lateProgress');if(late){const lateTotal=fullTotal-total;late.value=lateTotal?Math.min(99,(sum(received.keys())-bytes)/lateTotal*100):100;}}
 async function read(src){const expected=sizes[src]||0,response=await fetch((window.GAME_ASSET_URLS?.[src]||src)+'?asset='+expected);if(!response.ok)throw Error('Не загрузился файл: '+src);
 const chunks=[];let bytes=0;received.set(src,0);
 if(response.body?.getReader){const reader=response.body.getReader();for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);bytes+=value.byteLength;received.set(src,bytes);paint();}}
 else{const data=await response.arrayBuffer();chunks.push(data);received.set(src,data.byteLength);paint();}
 const url=URL.createObjectURL(new Blob(chunks,{type:response.headers.get('Content-Type')||'image/png'}));
 try{const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=()=>reject(Error('Не удалось прочитать изображение: '+src));im.src=url;});if(im.decode)await im.decode();done.add(src);paint();if(src.endsWith('result-frame-alpha.png'))document.documentElement.style.setProperty('--result-frame',`url("${url}")`);return im;}finally{if(!src.endsWith('result-frame-alpha.png'))URL.revokeObjectURL(url);}}
 function pump(){while(active<(finished?1:3)&&queue.length){const job=queue.shift();active++;read(job.src).then(job.resolve,job.reject).finally(()=>{active--;pump();});}}
 function load(src){if(!cache.has(src)){const p=new Promise((resolve,reject)=>{queue.push({src,resolve,reject});pump();});cache.set(src,p);p.catch(()=>cache.delete(src));}return cache.get(src);}
 paint();return {load,finish(){cache.clear();finished=true;paint();document.getElementById('loadingBox').hidden=true;},release(){cache.clear();},fail(){failed=true;paint();document.getElementById('reloadAssets').hidden=false;},status:()=>({bytes:sum(initial),total,fullBytes:sum(received.keys()),fullTotal,decoded:done.size,initialFiles:initial.size,finished})};
})();
document.getElementById('reloadAssets').onclick=()=>location.reload();
