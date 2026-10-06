/* Art review renderer. Absolute route distance makes pause/seeking deterministic. */
class CityRoute {
  constructor(){
    this.images={};this.scaledCache=new Map();this.skyCache=new Map();
    this.trafficEvents=[{start:41,type:'aeroexpress',duration:9}];
    this.street=[];let cursor=-680;
    const order=[0,1,2,0,2,1,2,0,1,2,1,0,2,0,1,2,0,2];
    for(let i=0;i<order.length;i++){const height=[380,420,365,405][i%4],width=height*1.5;this.street.push({x:cursor,width,height,kind:order[i],index:i});cursor+=width-2;}

    const old='../game/sprites/illustrated/';
    const files={sunset:old+'sky-sunset.png',night:old+'sky-night.png',farA:old+'far-a.png',farB:old+'far-b.png',old:old+'mid-a.png',oldB:old+'mid-b.png',stalin:'../city-v2/assets/stalin.png',stalinB:'../city-v2/assets/stalin-b.png',panels:'../city-v2/assets/panels.png',panelsB:'../city-v2/assets/panels-b.png',mixed:'../city-v2/assets/mixed.png',mixedB:'../city-v2/assets/mixed-b.png',streetOld:'../city-v3/assets/street-old.png',streetResidential:'../city-v3/assets/street-residential.png',streetMixed:'../city-v3/assets/street-mixed.png',transport:'train-unbranded.png'};
    this.files=files;this.loadedNames=new Set();this.lateKeys=['night','stalin','stalinB','panels','panelsB','mixed','mixedB','transport'];
    this.loaded=Promise.all(Object.keys(files).filter(k=>!this.lateKeys.includes(k)).map(k=>this.loadFile(k)));
  }
  async loadFile(name){if(this.loadedNames.has(name))return;const im=await GameAssets.load(this.files[name]);this.images[name]=name==='transport'?this.cutoutTrain(im):im;this.loadedNames.add(name);}
  async loadLater(){for(const key of this.lateKeys){await this.loadFile(key);if(this.images[key]){if(key==='night')this.skyImage(key,390);else if(key!=='transport')this.scaledImage(key,787.5,525);if(key!=='transport')delete this.images[key];}await new Promise(r=>setTimeout(r,0));}}

  cutoutTrain(im){
    // Source-space contours remove the atlas backdrop, including both sloping noses.
    // Keeping the original source coordinates preserves the shared traffic geometry.
    const out=document.createElement('canvas');out.width=im.width;out.height=im.height;
    const g=out.getContext('2d');g.save();g.scale(im.width/1536,im.height/1024);g.beginPath();
    g.moveTo(19,400);g.lineTo(30,363);g.quadraticCurveTo(39,337,51,323);
    g.bezierCurveTo(104,248,159,202,219,181);g.quadraticCurveTo(254,173,324,174);
    g.lineTo(335,165);g.lineTo(389,165);g.lineTo(397,170);g.lineTo(466,168);
    g.lineTo(495,173);g.lineTo(539,168);g.lineTo(563,168);g.lineTo(569,174);
    g.lineTo(1447,170);g.lineTo(1471,191);g.lineTo(1482,205);g.lineTo(1502,218);
    g.lineTo(1508,421);g.lineTo(1497,437);g.lineTo(1463,441);g.lineTo(1448,453);
    g.lineTo(1360,462);g.quadraticCurveTo(1327,514,1296,465);g.lineTo(1190,467);
    g.quadraticCurveTo(1157,508,1124,464);g.lineTo(425,464);
    g.quadraticCurveTo(393,505,363,467);g.lineTo(255,465);
    g.quadraticCurveTo(218,508,187,465);g.lineTo(157,455);g.lineTo(43,446);g.lineTo(18,434);g.closePath();
    g.moveTo(22,628);g.lineTo(40,618);g.lineTo(58,619);g.lineTo(66,596);g.lineTo(86,586);
    g.lineTo(151,587);g.lineTo(158,582);g.lineTo(213,582);g.lineTo(225,590);
    g.lineTo(1447,584);g.lineTo(1459,590);g.lineTo(1471,619);g.lineTo(1498,624);
    g.lineTo(1508,854);g.lineTo(1492,868);g.lineTo(1392,882);
    g.quadraticCurveTo(1359,926,1326,882);g.lineTo(1215,883);
    g.quadraticCurveTo(1183,923,1150,882);g.lineTo(423,882);
    g.quadraticCurveTo(389,923,358,883);g.lineTo(243,883);
    g.quadraticCurveTo(211,923,178,882);g.lineTo(89,876);g.lineTo(20,858);g.closePath();
    g.clip();g.drawImage(im,0,0,1536,1024);g.restore();return out;
  }
  scaledImage(key,w,h){const id=key+':'+w+':'+h;if(!this.scaledCache.has(id)){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);c.getContext('2d').drawImage(this.images[key],0,0,w,h);this.scaledCache.set(id,c);}return this.scaledCache.get(id);}
  skyImage(key,w){const id=key+':'+w;if(!this.skyCache.has(id)){const c=document.createElement('canvas');c.width=Math.ceil(w);c.height=700;const h=854,sw=Math.max(w,h*1.5);c.getContext('2d').drawImage(this.images[key],(w-sw)/2,-154,sw,h);this.skyCache.set(id,c);}return this.skyCache.get(id);}
  prepare(){this.skyImage('sunset',390);for(const key of ['farA','farB'])this.scaledImage(key,998.5,665);for(const key of ['old','oldB'])this.scaledImage(key,787.5,525);for(const t of this.street)this.scaledImage(['streetOld','streetResidential','streetMixed'][t.kind],t.width,t.height);for(const key of Object.keys(this.images))if(key!=='transport')delete this.images[key];}
  district(t){return t<22?0:t<45?1:t<65?2:3;}
  name(t){return ['Старый город','Жилые сталинки','Хрущёвки и брежневки','Смешанная Москва'][this.district(t)];}
  draw(ctx,width,height,time,options={}){
    const t=Math.max(0,time),scale=height/700,w=width/scale,h=700;
    const night=options.fixedLight?.45:Math.max(0,Math.min(1,(t-20)/65));
    ctx.save();ctx.scale(scale,scale);ctx.fillStyle='#13172d';ctx.fillRect(0,0,w,h);
    const skyH=h*1.22,skyW=Math.max(w,skyH*1.5),skyY=-h*.22;
    ctx.drawImage(this.skyImage("sunset",w),0,0);ctx.globalAlpha=night;if(night>0)ctx.drawImage(this.skyImage("night",w),0,0);ctx.globalAlpha=1;
    this.drawStars(ctx,w,t,night);
    // Original skyline artwork, lifted 32 logical pixels.
    if(options.far!==false){const dh=h*.95,dw=dh*1.5,phase=t*45%(2*dw);for(let x=-phase;x<w;x+=2*dw){ctx.drawImage(this.scaledImage("farA",dw+1,dh),x,h*1.08-dh-32);ctx.drawImage(this.scaledImage("farB",dw+1,dh),x+dw,h*1.08-dh-32);}}
    const dh=525,dw=dh*1.5,step=dw-110,speed=68,dist=t*speed;
    const first=Math.floor((dist-dw)/step),last=Math.ceil((dist+w)/step);
    for(let i=first;i<=last;i++){
      const centerPass=(i*step+dw*.5-165)/speed;
      const district=this.district(centerPass),key=['old','stalin','panels','mixed'][district]+(Math.abs(i%2)?'B':'');
      const x=i*step-dist;if(x>=w||x+dw<=0)continue;const variant=((i%3)+3)%3;
      const y=205+[0,12,-8][variant];
      ctx.drawImage(this.scaledImage(key,dw,dh),x,y);
    }
    // Atmospheric tint is uniform; neighboring facades never cross-fade.
    ctx.fillStyle=`rgba(22,23,57,${night*.12})`;ctx.fillRect(0,0,w,h);
    if(options.near!==false){ctx.save();if(options.nearEnd!==undefined){ctx.beginPath();ctx.rect(0,0,Math.max(0,options.nearEnd),700);ctx.clip();}
      // Every facade lands on the same pavement line; the road seals the full bottom.
      for(const tile of this.street){const x=tile.x-t*94;if(x+tile.width<0||x>w)continue;
        const key=['streetOld','streetResidential','streetMixed'][tile.kind],y=684-tile.height*([900,915,890][tile.kind]/1024);
        ctx.drawImage(this.scaledImage(key,tile.width,tile.height),x,y);
        if(options.signs!==false){const signs=[[[125,740,'КОФЕ'],[350,717,'КНИГИ'],[800,716,'ЦВЕТЫ'],[1080,730,'ПЕКАРНЯ']],[[150,735,'ПРОДУКТЫ'],[870,765,'ОПТИКА'],[1400,810,'КОФЕ']],[[395,750,'МАСТЕРСКАЯ'],[1000,727,'КОФЕ'],[1200,710,'КНИГИ'],[1415,740,'ВИНИЛ']]][tile.kind];for(let j=0;j<signs.length;j++){const [sx,sy,label]=signs[j];this.sign(ctx,x+sx*tile.width/1536,y+sy*tile.height/1024,label,night,j%4);}}
      }
      this.drawRoad(ctx,w,t);ctx.restore();
    }
    if(options.traffic!==false)this.drawTraffic(ctx,w,t,options.hitboxes);
    ctx.restore();
  }
  drawStars(ctx,w,t,night){
    const fade=Math.max(0,Math.min(1,(night-.28)/.65));if(!fade)return;
    ctx.save();
    for(let i=0;i<90;i++){
      const seed=Math.sin(i*127.1+31.7)*43758.5453,fract=seed-Math.floor(seed);
      const x=(fract*1300-t*1.2+1300)%1300,y=24+((i*83.37)%290);
      if(x>w)continue;
      const pulse=.68+.32*Math.sin(t*(.45+(i%5)*.06)+i*2.4),r=i%11===0?1.3:.65;
      ctx.globalAlpha=fade*pulse*(.4+.5*(1-y/340));ctx.fillStyle=i%3?'#f0efff':'#cbdfff';
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }ctx.restore();
  }
  drawRoad(ctx,w,t){
    ctx.fillStyle='#49414b';ctx.fillRect(0,684,w,10);
    ctx.fillStyle='#a79a99';ctx.fillRect(0,693,w,2);
    ctx.fillStyle='#20212b';ctx.fillRect(0,695,w,5);
  }
  trafficAt(t,w){
    return RunModel.trafficAt(t,w);
  }
  drawTraffic(ctx,w,t,hitboxes){
    const cars=this.trafficAt(t,w);
    for(let i=0;i<cars.length;i++){
      const v=cars[i];if(v.x>w||v.x+v.width<0)continue;
      if(i<cars.length-1){ctx.fillStyle='#29252a';ctx.fillRect(v.x+v.width-5,v.y+v.height*.25,15,v.height*.6);}
      ctx.save();if(v.flip){ctx.translate(v.x+v.width,v.y);ctx.scale(-1,1);ctx.drawImage(this.images.transport,...v.src,0,0,v.width,v.height);}
      else ctx.drawImage(this.images.transport,...v.src,v.x,v.y,v.width,v.height);ctx.restore();
      if(hitboxes){ctx.save();ctx.strokeStyle='#ffb46c';ctx.setLineDash([3,3]);ctx.strokeRect(v.x+8,v.y+20,v.width-16,v.height-25);ctx.restore();}
    }
  }
  sign(ctx,x,y,text,night,style){
    const colors=['#ecd5a1','#d6e9bc','#f4b9df','#98e5df'];
    ctx.save();ctx.font='bold 9px sans-serif';const width=Math.max(58,ctx.measureText(text).width+13);
    ctx.fillStyle='#292733';ctx.fillRect(x-width/2,y-10,width,16);ctx.strokeStyle='#665b68';ctx.lineWidth=.7;ctx.strokeRect(x-width/2,y-10,width,16);
    ctx.fillStyle=colors[style];ctx.shadowColor=colors[style];ctx.shadowBlur=night*5;ctx.textAlign='center';ctx.fillText(text,x,y+1);ctx.restore();
  }
}


