/* Reviewable rendering component. No Player coordinates, hitboxes or rewards. */
class FlightRigV5 {
  constructor(assetRoot = './assets/') {
    this.images = {};
    this.loaded = Promise.all(['body', 'hair', 'coat', 'parts-notched'].map(name => new Promise((resolve, reject) => {
      if(window.GameAssets){GameAssets.load(assetRoot+name+'.png').then(img=>{this.images[name]=img;resolve();},reject);return;}
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Не загрузился слой: ' + name));
      img.src = assetRoot + name + '.png';
      this.images[name] = img;
    })));
    this.time = 0; this.tilt = 0; this.thrust = 0; this.pressed = false;
    this.kickAge = Infinity; this.boostAge = Infinity;
    this.trail = []; this.sparks = []; this.sampleAge = 0;
    this.pose = { x: 0, y: 0, height: 90, angle: 0, kickX: 0, kickY: 0 };
    this.release = 0; this.hatSlip = 0;

  }

  hit() {
    this.kickAge = 0;
    // Distinct impact burst, deterministic for reproducible review captures.
    const p = this.emitter();
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39996;
      this.sparks.push({ x:p.x, y:p.y, vx:Math.cos(a)*85-50,
        vy:Math.sin(a)*70, life:0.5, max:0.5, size:1.4, impact:true });
    }
  }

  update(dt, input) {
    dt = Math.max(0, Math.min(dt, 0.05));
    this.time += dt; this.kickAge += dt; this.boostAge += dt;
    if (input.pressed && !this.pressed) this.boostAge = 0;
    this.pressed = input.pressed;
    this.thrust += ((input.pressed ? 1 : 0) - this.thrust) * (1-Math.exp(-dt*9));
    const velocity = Math.max(-380, Math.min(450, input.vy || 0));
    const targetTilt = velocity * 0.00024 - this.thrust * 0.055;
    this.tilt += (targetTilt - this.tilt) * (1-Math.exp(-dt*8));
    this.release=0;
    const k=this.impactPose(this.kickAge),scale=input.height/90;
    this.hatSlip=k.hat;
    this.pose={x:input.x,y:input.y,height:input.height,angle:this.tilt+k.angle,kickX:k.x*scale,kickY:k.y*scale};
    const sizeScale = input.height/90;
    this.trail.forEach(p=>{p.age+=dt;p.x-=130*sizeScale*dt;});
    this.trail = this.trail.filter(p=>p.age<0.8);
    this.sparks.forEach(p=>{p.life-=dt;p.x+=p.vx*dt*sizeScale;p.y+=p.vy*dt*sizeScale;p.vy+=12*dt;});
    this.sparks = this.sparks.filter(p=>p.life>0).slice(-96);
    this.sampleAge += dt;
    if (input.emit !== false && this.sampleAge >= 1/60) {
      this.sampleAge %= 1/60;
      const p=this.emitter();
      this.trail.push({...p,age:0,phase:this.time*9});
      if (Math.floor(this.time*28)%3===0 && dt>0) {
        const wave=Math.sin(this.time*41);
        this.sparks.push({x:p.x,y:p.y,vx:-65-25*this.thrust,vy:wave*16,
          life:0.6,max:0.6,size:1.1+this.thrust,impact:false});
      }
    }
    if(this.trail.length>52)this.trail.splice(0,this.trail.length-52);
  }

  // Authored key poses; smooth interpolation preserves the fixed grip throughout.
  impactPose(t){
    const keys=[
      [0,0,0,0,0], [.045,-8,-2,-.12,.08], [.14,-18,-9,-.30,.7],
      [.42,-12,-5,-.18,1], [.72,-4,2,.045,.4], [1.08,0,0,0,0]
    ];
    if(!Number.isFinite(t)||t>=1.08)return {x:0,y:0,angle:0,hat:0};
    let i=1;while(i<keys.length-1&&t>keys[i][0])i++;
    const a=keys[i-1],b=keys[i];let u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));u=u*u*(3-2*u);
    const v=n=>a[n]+(b[n]-a[n])*u;return {x:v(1),y:v(2),angle:v(3),hat:v(4)};
  }
  setImpactFrame(age,input){this.kickAge=age;this.update(0,{pressed:false,vy:0,emit:false,...input});}
  drawBats(ctx,front){
    const t=this.kickAge;if(t<.18||t>1.08)return;
    const fade=Math.min(1,(t-.18)/.1,(1.08-t)/.22),s=this.pose.height/90;
    const center=this.point(1080,-185);
    for(let i=0;i<3;i++){
      const phase=(t-.18)*8+i*Math.PI*2/3,depth=Math.sin(phase);
      if((depth>=0)!==front)continue;
      const x=center.x+Math.cos(phase)*20*s,y=center.y+depth*5*s;
      const size=(.72+depth*.12)*s,flap=Math.sin(t*34+i)*2;
      ctx.save();ctx.globalAlpha=fade*(front?1:.65);ctx.translate(x,y);ctx.scale(size,size);
      ctx.fillStyle='#6c416f';ctx.strokeStyle='#eed3ee';ctx.lineWidth=.65;
      ctx.beginPath();ctx.moveTo(-1,-1);ctx.lineTo(-2,-4);ctx.lineTo(0,-2);ctx.lineTo(2,-4);ctx.lineTo(2,-1);
      ctx.quadraticCurveTo(6,-7-flap,10,-3-flap);ctx.quadraticCurveTo(7,-1,8,2);ctx.quadraticCurveTo(5,0,4,3);ctx.quadraticCurveTo(2,1,0,4);
      ctx.quadraticCurveTo(-2,1,-4,3);ctx.quadraticCurveTo(-5,0,-8,2);ctx.quadraticCurveTo(-7,-1,-10,-3-flap);ctx.quadraticCurveTo(-6,-7-flap,-1,-1);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
  }

  // All contact landmarks use ONE rigid transform. No per-frame body geometry.
  point(x,y) {
    const p=this.pose,s=p.height/1024,dx=(x-940)*s,dy=(y-635)*s;
    return {x:p.x+p.kickX+dx*Math.cos(p.angle)-dy*Math.sin(p.angle),
      y:p.y+p.kickY+dx*Math.sin(p.angle)+dy*Math.cos(p.angle)};
  }
  emitter(){return this.point(100,740);}
  contacts(){return [this.point(930,635),this.point(1170,604),this.point(1290,590)];}

  drawTrail(ctx) {
    if(this.trail.length<2)return;
    const scale=this.pose.height/90;
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    const flash=Math.max(0,1-this.boostAge/0.28);
    // Fill each tapered ribbon once; overlapping line caps produced beads.
    const first=this.trail[0],end=this.trail[this.trail.length-1];
    const strength=0.85+this.thrust*.25+flash*.2;
    const smoothPath=points=>{
      ctx.moveTo(points[0].x,points[0].y);
      for(let i=1;i<points.length-1;i++)ctx.quadraticCurveTo(points[i].x,points[i].y,(points[i].x+points[i+1].x)/2,(points[i].y+points[i+1].y)/2);
      ctx.lineTo(points[points.length-1].x,points[points.length-1].y);
    };
    for(const [width,rgb,alpha] of [[26,'147,109,232',.13],[17,'99,219,207',.20],[8,'169,241,215',.32],[3,'255,240,189',.85]]) {
      const top=[],bottom=[];
      for(let i=0;i<this.trail.length;i++){
        const p=this.trail[i],a=this.trail[Math.max(0,i-1)],b=this.trail[Math.min(this.trail.length-1,i+1)];
        const len=Math.hypot(b.x-a.x,b.y-a.y)||1,life=Math.max(0,1-p.age/.8);
        const radius=width*.5*scale*Math.sqrt(life),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;
        top.push({x:p.x+nx*radius,y:p.y+ny*radius});bottom.push({x:p.x-nx*radius,y:p.y-ny*radius});
      }
      const gradient=ctx.createLinearGradient(first.x,first.y,end.x,end.y);
      gradient.addColorStop(0,`rgba(${rgb},0)`);gradient.addColorStop(.45,`rgba(${rgb},${alpha*.5})`);gradient.addColorStop(1,`rgba(${rgb},${Math.min(1,alpha*strength)})`);
      ctx.fillStyle=gradient;ctx.beginPath();smoothPath(top);const reverse=bottom.reverse();ctx.lineTo(reverse[0].x,reverse[0].y);for(let i=1;i<reverse.length;i++)ctx.lineTo(reverse[i].x,reverse[i].y);ctx.closePath();ctx.fill();
    }
    for(const sign of [-1,1]){
      const path=this.trail.map(p=>({x:p.x,y:p.y+Math.sin(p.phase+sign)*9*scale*(p.age/.8)}));
      const gradient=ctx.createLinearGradient(first.x,first.y,end.x,end.y);
      gradient.addColorStop(0,'rgba(190,235,240,0)');gradient.addColorStop(1,sign===1?'rgba(187,145,245,.7)':'rgba(196,255,240,.6)');
      ctx.strokeStyle=gradient;ctx.lineWidth=1.2*scale;ctx.beginPath();smoothPath(path);ctx.stroke();
    }
    for(const p of this.sparks){ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.impact?'#ffd5a0':'#e7ffdb';
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*scale*Math.sqrt(p.life/p.max),0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }

  draw(ctx, debug=false) {
    const {body,hair,coat}=this.images;
    if(!body.complete || !body.naturalWidth)return;
    const p=this.pose,s=p.height/1024;
    this.drawBats(ctx,false);
    ctx.save();ctx.translate(p.x+p.kickX,p.y+p.kickY);ctx.rotate(p.angle);ctx.scale(s,s);ctx.translate(-940,-635);
    if(hair.complete && hair.naturalWidth) {
      // Texture strips deform only the detached hair, tapering motion to zero at its root.
      const root=1310;
      for(let x=0;x<hair.naturalWidth;x+=16){
        const w=Math.min(16,hair.naturalWidth-x),weight=Math.pow(Math.max(0,(root-x)/root),1.35);
        const wave=Math.sin(this.time*3.8+x*.008)*38*weight;
        const lift=(this.thrust-.35)*42*weight;
        ctx.drawImage(hair,x,0,w,hair.naturalHeight,350+x*.5,135+wave+lift,w*.5+.35,hair.naturalHeight*.5);
      }
    }
    if(coat.complete && coat.naturalWidth){
      const rootX=966,rootY=515;
      ctx.save();ctx.translate(rootX,rootY);
      ctx.rotate(Math.sin(this.time*4.1)*.018+this.thrust*.025);
      ctx.translate(-rootX,-rootY);
      ctx.drawImage(coat,264,196.5,coat.naturalWidth*.65,coat.naturalHeight*.65);ctx.restore();
    }
    ctx.drawImage(body,0,0,1536,1024);
    // Hat moves after the recoil, slips back a little, then settles onto the head.
    ctx.save();ctx.translate(1080-this.hatSlip*110,220-this.hatSlip*100);ctx.rotate(-this.hatSlip*.30);
    ctx.drawImage(this.images["parts-notched"],0,0,1536,466,535-1080,-43-220,814,247);ctx.restore();
    ctx.restore();
    this.drawBats(ctx,true);
    if(debug){ctx.save();ctx.strokeStyle='#a7ffe5';ctx.fillStyle='#a7ffe5';ctx.lineWidth=1;
      const c=this.contacts();for(const p of c){ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.stroke();}
      ctx.beginPath();ctx.moveTo(c[0].x,c[0].y);ctx.lineTo(c[1].x,c[1].y);ctx.lineTo(c[2].x,c[2].y);ctx.stroke();ctx.restore();}
  }

  clearTrail(){this.trail=[];this.sparks=[];this.sampleAge=0;}
}






