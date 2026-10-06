const names=['Монетка · +10','Эликсир · +25','Кристалл · +75','Зеркало · защита','Сердце · жизнь','Колтун','Ножницы','Проклятая смесь'];
const descriptions=['Покачивание и световая волна','Покачивание и вихрь внутри','Поворот и перелив граней','Световая волна и защитный купол','Пульсация и восстановление','Контровой свет, моргание и прищур','Щелчки лезвий и отскок','Кипение, предупреждение и хлопок'];
const colors=['#ffdc77','#c78aff','#80eeef','#a0edff','#ff96ae','#c97cbd','#e6e6ff','#ffac4e'];
let time=0,paused=false,last=0,ready=false;const effects=Array(8).fill(-100),sprites=[];
function loadImage(src){if(window.GameAssets)return GameAssets.load(src);return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('Не загрузился '+src));im.src=src;});}
// Trim transparent padding in memory only; source PNG files remain unchanged.
function trim(im,sx,sy,sw,sh,outline=null){const c=document.createElement('canvas');c.width=sw;c.height=sh;const x=c.getContext('2d',{willReadFrequently:true});if(outline){x.beginPath();outline.forEach(([px,py],i)=>i?x.lineTo(px,py):x.moveTo(px,py));x.closePath();x.clip();}x.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);const d=x.getImageData(0,0,sw,sh).data;let l=sw,r=0,t=sh,b=0;for(let y=0;y<sh;y++)for(let xx=0;xx<sw;xx++)if(d[(y*sw+xx)*4+3]>30){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,y);b=Math.max(b,y);}const out=document.createElement('canvas');out.width=r-l+1;out.height=b-t+1;out.getContext('2d').drawImage(c,l,t,out.width,out.height,0,0,out.width,out.height);return out;}
const rand=n=>{const v=Math.sin(n*127.1+19.7)*43758.5453;return v-Math.floor(v);};
// Each individual owns a deterministic irregular schedule, not a shared animation clock.
function expression(t,id){const period=1.25+rand(id+12)*1.25,phase=(t+rand(id+5)*period)%period;if(phase<.24)return {state:2,age:phase/.24};if(phase<.65&&rand(id+29)>.4)return {state:1,age:(phase-.24)/.41};return {state:0,age:0};}

let faces=[];const bakedItems=[],bakedFaces=[],scissorLayers=[];
function bakeItem(im,i,side=null){const pad=Math.ceil(im.height*.25),c=document.createElement('canvas');c.width=im.width+pad*2;c.height=im.height+pad*2;const g=c.getContext('2d');let source=im;
 if(side!==null){source=document.createElement('canvas');source.width=im.width;source.height=im.height;const a=source.getContext('2d');a.translate(im.width/2,im.height/2);a.beginPath();a.moveTo(-im.width,-im.height);a.lineTo(im.width,im.height);a.lineTo(side===0?im.width:-im.width,side===0?-im.height:im.height);a.closePath();a.clip();a.drawImage(im,-im.width/2,-im.height/2);}
 g.shadowColor=colors[i]+(i===5?'bb':'66');g.shadowBlur=im.height*(i===5?.085:.045);if(i===5)g.filter='brightness(1.4) saturate(0.85)';g.drawImage(source,pad,pad);return {canvas:c,pad,w:im.width,h:im.height};}
function drawBaked(ctx,b,size){const s=size/b.h;ctx.drawImage(b.canvas,(-b.w/2-b.pad)*s,(-b.h/2-b.pad)*s,b.canvas.width*s,b.canvas.height*s);}
function prepareItemEffects(){for(let i=0;i<8;i++)bakedItems[i]=bakeItem(sprites[i],i);for(const im of faces)bakedFaces.push(bakeItem(im,5));for(let side=0;side<2;side++)scissorLayers.push(bakeItem(sprites[6],6,side));}

function drawSprite(ctx,i,t,size,id=1){let im=i===5?faces[expression(t,id).state]:sprites[i];const ratio=im.width/im.height,w=size*ratio,h=size;ctx.drawImage(im,-w/2,-h/2,w,h);}
function object(ctx,i,t,x,y,size,id=1,age=100,rotation=0){ctx.save();ctx.translate(x,y+Math.sin(t*1.7+id)*size*.025);let angle=Math.sin(t*1.4+id)*.07;
if(i===5)angle=rotation+Math.sin(t*1.7+id*2)*.12;
if(i===2)angle=Math.sin(t*.8)*.14;
if(i===7&&age<1.3){ctx.translate(Math.sin(t*65)*size*.015*(age+.2),0);angle+=Math.sin(t*50)*.025;}
ctx.rotate(angle);if(i===7&&age>=0&&age<1.3){const charge=age/1.3, swell=1+.24*charge*charge+.025*charge*Math.sin(t*35);ctx.scale(swell,1+.16*charge*charge);}
if(i===4){const pulse=1+.04*Math.pow(Math.max(0,Math.sin(t*3)),6);ctx.scale(pulse,pulse);}
if(i===5&&age<.22)ctx.scale(1+.25*Math.sin(age/.22*Math.PI),1-.25*Math.sin(age/.22*Math.PI));
if(i===6&&age<.5){ctx.translate(age*size*.5,-Math.sin(age*6)*size*.15);ctx.rotate(age);}
if(i===6)drawScissors(ctx,t+id*.37,size);else drawBaked(ctx,i===5?bakedFaces[expression(t,id).state]:bakedItems[i],size);
const im=sprites[i],w=size*im.width/im.height;
if(i===0){ctx.save();ctx.beginPath();ctx.ellipse(0,0,w*.41,size*.44,.38,0,Math.PI*2);ctx.clip();const yy=((t*.24)%1)*size*1.7-size*.85;const light=ctx.createLinearGradient(0,yy-size*.12,0,yy+size*.12);light.addColorStop(0,'#fff8d000');light.addColorStop(.5,'#fff8d077');light.addColorStop(1,'#fff8d000');ctx.fillStyle=light;ctx.fillRect(-w/2,yy-size*.12,w,size*.24);ctx.restore();}
if(i===1){ctx.save();ctx.translate(0,size*.13);ctx.rotate(t*.7);ctx.strokeStyle='#e9b7ff';ctx.globalAlpha=.3;ctx.lineWidth=size*.009;ctx.beginPath();for(let a=0;a<9;a+=.12){const r=size*.009*a;const xx=Math.cos(a)*r,yy=Math.sin(a)*r*.65;a?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();ctx.restore();}
if(i===3){ctx.save();ctx.beginPath();ctx.ellipse(w*.07,-size*.1,w*.25,size*.27,.35,0,Math.PI*2);ctx.clip();ctx.strokeStyle='#dbffff';ctx.globalAlpha=.4;ctx.lineWidth=size*.035;const yy=((t*.3)%1)*size-size*.6;ctx.beginPath();ctx.moveTo(-w/2,yy);ctx.lineTo(w/2,yy-size*.15);ctx.stroke();ctx.restore();}
if(i===2){ctx.globalAlpha=Math.pow(Math.max(0,Math.sin(t*1.8)),8);ctx.fillStyle='#fff8df';ctx.beginPath();ctx.arc(-w*.15,-size*.22,size*.025,0,7);ctx.fill();}
if(i===7){ctx.fillStyle='#fff0a0';for(let j=0;j<4;j++){const q=(t*1.7+j*.23)%1;ctx.globalAlpha=(1-q)*.85;ctx.beginPath();ctx.arc(size*(.32+Math.sin(j*2)*q*.08),size*(-.37-q*.12),size*(.008*(1-q)+.003),0,7);ctx.fill();}}

ctx.restore();}
function drawScissors(ctx,t,size){const a=(.5+.5*Math.sin(t*15))*.32;for(let side=0;side<2;side++){ctx.save();ctx.rotate(side?a:-a);drawBaked(ctx,scissorLayers[side],size);ctx.restore();}}

function fx(ctx,i,age,x,y,size){if(age<0||age>1)return;ctx.save();ctx.translate(x,y);ctx.globalAlpha=1-age;ctx.strokeStyle=colors[i];ctx.fillStyle=colors[i];ctx.lineWidth=2;if(i===3||i===7){ctx.beginPath();ctx.arc(0,0,size*(.3+age*.7),0,7);ctx.stroke();}for(let j=0;j<14;j++){const a=j*2.399,r=size*(.12+age*(.5+rand(j)*.5));ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2.4*(1-age)+.5,0,7);ctx.fill();}ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText(i===0?'+10':i===1?'+25':i===2?'+75':i===4?'♥ +1':'',0,-age*45);ctx.restore();}

const itemsLoaded=Promise.all([loadImage('../items-v2/atlas.png'),loadImage('../items-v2/koltun.png'),loadImage('../items-v2/bomb-skull-v2.png')]).then(([atlas,eyes,bomb])=>{for(let i=0;i<8;i++)sprites.push(i===2?trim(atlas,768,0,384,480):i===6?trim(atlas,768,504,384,460,[[55,0],[190,145],[384,225],[384,460],[170,460],[165,275],[0,100],[0,50],[48,95]]):trim(atlas,(i%4)*atlas.width/4,Math.floor(i/4)*atlas.height/2,atlas.width/4,atlas.height/2));sprites[7]=trim(bomb,0,0,bomb.width,bomb.height);for(let i=0;i<3;i++)faces.push(trim(eyes,i*eyes.width/3,0,eyes.width/3,eyes.height));prepareItemEffects();});

