class RunModel{
 constructor(config,seed=1,experimental=false){this.c=config;this.reset(seed,experimental);}
 reset(seed,experimental){this.seed=seed>>>0;this.rng=this.seed||1;this.experimental=experimental;this.mode='playing';this.elapsed=0;this.progress=0;this.remaining=this.c.duration;this.score=0;this.lives=this.c.player.lives;this.y=this.c.player.startY;this.vy=0;this.shield=0;this.invulnerable=0;this.hurtAge=100;this.shieldFlash=100;this.freeze=0;this.freezeSpent=0;this.freezeBurst=100;this.speedBoost=1;this.waveClock=.7;this.enemyClock=3;this.enemyCount=0;this.rows=0;this.nextRow=12+this.random()*7;this.rowUntil=0;this.lastRewardY=295;this.rareSide=this.random()<.5?0:1;this.rewardBag=[];this.extraQueue=[];this.extraClock=0;this.extraCredit={0:((this.seed*2654435761)>>>0)/4294967296,2:((this.seed*1597334677)>>>0)/4294967296};this.wave=0;this.lane=295;this.heartAt=-100;this.objects=[];this.blasts=[];this.events=[];this.serial=0;this.finale=0;this.stats={spawnedPoints:0,picked:0,hits:0,blocked:0,waves:0};}
 random(){let x=this.rng;x^=x<<13;x^=x>>>17;x^=x<<5;this.rng=x>>>0;return this.rng/4294967296;}
 stage(){return this.c.stages.find(s=>this.progress<s.until)||this.c.stages.at(-1);}
 emit(type,data={}){this.events.push({type,...data});}
 add(type,x,y,extra={}){const o={id:++this.serial,type,x,y,baseY:y,age:0,phase:this.random()*Math.PI*2,amp:0,size:this.c.sizes[type],warn:-1,done:false,...extra};this.objects.push(o);
 if(!extra.boosted&&(type===0||type===2)){this.extraCredit[type]+=type===0?(this.c.bonusBoost?.coin||0):(this.c.bonusBoost?.crystal||0);if(this.extraCredit[type]>=1){this.extraCredit[type]--;this.extraQueue.push(type);}}
 if(type<4)this.stats.spawnedPoints+=this.c.points[type];return o;}
 spawnWave(){
 const c=this.c;this.wave++;this.stats.waves++;
 if(this.progress>=this.nextRow&&this.rows<2){
  const y=160+this.random()*450;for(let j=0;j<3;j++)this.add(0,425+j*45,y,{row:this.rows+1});
  this.rows++;this.nextRow=53+this.random()*13;this.rowUntil=this.elapsed+3;this.waveClock=3;return;
 }
 if(this.rows<2&&this.progress<this.nextRow&&this.nextRow-this.progress<3){this.waveClock=.2;return;}
 if(!this.rewardBag.length){this.rewardBag=[0,0,0,0,0,0,1,1,1,2,2,3];for(let i=this.rewardBag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.rewardBag[i],this.rewardBag[j]]=[this.rewardBag[j],this.rewardBag[i]];}}
 let type=this.rewardBag.pop();
 if(this.lives<3&&this.elapsed-this.heartAt>c.heartCooldown&&this.random()<.06){type=4;this.heartAt=this.elapsed;}
 let y=125+this.random()*510;
 if(type===2){this.rareSide=1-this.rareSide;y=this.rareSide?130+this.random()*45:590+this.random()*45;}
 // Avoid accidental chains at one height; rare rewards favor the risky edges.
 if(type!==2&&Math.abs(y-this.lastRewardY)<80)y=y<380?Math.min(635,y+150):Math.max(125,y-150);
 this.lastRewardY=y;this.add(type,425,y);this.extraClock=.65;
 }
 spawnExtra(){
 if(!this.extraQueue.length||this.elapsed<this.rowUntil||this.rows<2&&this.nextRow-this.progress<3)return;
 const type=this.extraQueue.shift(),saved=this.rng;
 // Extra pickups do not perturb the established enemy or main-reward random sequence.
 this.rng=(this.seed^Math.floor(this.elapsed*1000)^0x9e3779b9)>>>0;
 let y=130+this.random()*500;if(type===2)y=this.random()<.5?130+this.random()*45:590+this.random()*45;
 if(Math.abs(y-this.lastRewardY)<100)y=y<380?610:145;
 this.add(type,425,y,{boosted:true});this.rng=saved;this.extraClock=.65;
 }
 spawnEnemy(){
 const s=this.stage(),type=5+Math.floor(this.random()*3);this.enemyCount++;
 const y=this.enemyCount%4===0?126:135+this.random()*495;
 this.add(type,435,y,{amp:type===6?30+this.random()*Math.min(65,s.amplitude+20):0,frequency:1.7+this.random()*2.3,joltAt:.25+this.random()*.9,joltAge:99,joltDuration:.42+this.random()*.24,joltDirection:this.random()<.5?-1:1,joltSize:22+this.random()*18,rotation:0});
 }
 pickupZones(){const a=Math.max(-.32,Math.min(.26,this.vy*.0007));return [{x:this.c.player.x,y:this.y,rx:25,ry:25},{x:this.c.player.x+10*Math.cos(a)+29*Math.sin(a),y:this.y+10*Math.sin(a)-29*Math.cos(a),rx:26,ry:12}];}
 static trafficAt(t,w=390){if(t<41||t>=50)return [];const width=500,gap=5,count=6,total=count*width+(count-1)*gap,head=w+20-(t-41)/9*(w+total+40);return Array.from({length:count},(_,i)=>({type:'aeroexpress',src:i===0||i===5?[15,160,1500,340]:[15,580,1500,340],x:head+i*(width+gap),y:710-width*340/1500,width,height:width*340/1500,flip:i===5}));}
 damage(source){if(this.mode!=='playing')return false;if(this.shield>0){this.stats.blocked++;this.shieldFlash=0;this.emit('shieldHit');return false;}if(this.invulnerable>0)return false;this.lives--;this.stats.hits++;this.invulnerable=this.c.player.invulnerability;this.hurtAge=0;this.emit('hit',{source});if(this.lives<=0){this.mode='gameover';this.emit('gameover');}return true;}
 collect(o){if(o.done)return;o.done=true;this.stats.picked++;this.score+=this.c.points[o.type];if(o.type===3)this.shield=this.c.player.shield;if(o.type===4)this.lives=Math.min(3,this.lives+1);
 if(o.type===1&&this.experimental&&this.freeze<=0&&this.freezeSpent<this.c.freeze.budget){const seconds=Math.min(this.c.freeze.duration,this.c.freeze.budget-this.freezeSpent);this.freeze=seconds;this.freezeSpent+=seconds;this.emit('freeze');}
 this.emit('pickup',{item:o.type,x:o.x,y:o.y,points:this.c.points[o.type]});}
 update(dt,pressed){if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.05);if(this.mode==='finale'){this.finale=Math.min(this.c.finaleDuration,this.finale+dt);if(this.finale>=this.c.finaleDuration){this.mode='victory';this.emit('victory');}return;}if(this.mode!=='playing')return;
 const c=this.c,p=c.player;this.elapsed+=dt;this.hurtAge+=dt;this.shieldFlash+=dt;this.freezeBurst+=dt;this.shield=Math.max(0,this.shield-dt);this.invulnerable=Math.max(0,this.invulnerable-dt);
 const frozen=Math.min(dt,this.freeze);this.freeze=Math.max(0,this.freeze-dt);if(frozen>0&&this.freeze===0)this.freezeBurst=0;this.progress=Math.min(c.duration,this.progress+dt-frozen);this.remaining=c.duration-this.progress;
 this.speedBoost+=((this.freeze>0?c.freeze.speed:1)-this.speedBoost)*(1-Math.exp(-dt*5));
 if(this.remaining<=1e-7){this.remaining=0;this.mode='finale';this.finalY=this.y;this.finalTilt=this.vy*.00024;this.objects=[];this.blasts=[];this.emit('finale');return;}
 this.vy=Math.max(p.maxRise,Math.min(p.maxFall,this.vy+(pressed?p.lift:p.gravity)*dt));this.y+=this.vy*dt;
 if(this.y<p.top){this.y=p.top;this.vy=Math.max(0,this.vy);}if(this.y>p.bottom){this.y=p.bottom;this.damage('ground');this.vy=p.maxRise*.7;}
 if(this.mode!=='playing')return;
 for(const car of RunModel.trafficAt(this.progress)){const nx=Math.max(car.x+8,Math.min(p.x,car.x+car.width-8)),ny=Math.max(car.y+14,Math.min(this.y,car.y+car.height-5));if(((p.x-nx)/p.rx)**2+((this.y-ny)/p.ry)**2<=1)this.damage('train');}
 if(this.mode!=='playing')return;
 const s=this.stage();this.waveClock-=dt*this.speedBoost;if(this.waveClock<=0){this.spawnWave();if(this.waveClock<=0)this.waveClock=1.05+this.random()*.6;}
 this.extraClock-=dt*this.speedBoost;if(this.extraClock<=0)this.spawnExtra();
 this.enemyClock-=dt*this.speedBoost;if(this.enemyClock<=0){this.spawnEnemy();this.enemyClock=(this.progress<22?2.3:this.progress<65?1.8:1.45)*(.75+this.random()*.5);}
 for(const o of this.objects){if(this.mode!=='playing')break;o.age+=dt;o.baseX??=o.x;o.baseX-=s.speed*this.speedBoost*dt;o.x=o.baseX;
 o.y=o.baseY;
 if(o.type===5){o.joltAge+=dt;if(o.age>=o.joltAt){o.joltAge=0;o.joltAt=o.age+1.05+this.random()*1.2;o.joltDirection=this.random()<.5?-1:1;}
 const q=Math.min(1,o.joltAge/o.joltDuration),pulse=Math.sin(q*Math.PI);o.x+=o.joltDirection*o.joltSize*pulse;o.rotation=o.joltDirection*pulse*.65+Math.sin(o.age*2+o.phase)*.12;
 }else if(o.type===6){o.y=Math.max(122,Math.min(640,o.baseY+o.amp*(.7*Math.sin(o.age*o.frequency+o.phase)+.3*Math.sin(o.age*o.frequency*1.73))));}
 if(o.type===7&&o.warn<0&&o.x<305)o.warn=0;
 if(o.warn>=0){o.warn+=dt;if(o.warn>=c.bomb.warning&&!o.done){o.done=true;this.blasts.push({x:o.x,y:o.y,age:0,hit:false,seed:o.id});this.emit('explosion',{x:o.x,y:o.y});}}
 if(o.done)continue;const dx=o.x-p.x,dy=o.y-this.y;
 const rx=p.rx+o.size*(o.type<5?.42:.3),ry=p.ry+o.size*(o.type<5?.42:.3);
 const touch=o.type<5?this.pickupZones().some(z=>((o.x-z.x)/(z.rx+o.size*.42))**2+((o.y-z.y)/(z.ry+o.size*.42))**2<=1):dx*dx/(rx*rx)+dy*dy/(ry*ry)<=1;
 if(touch){if(o.type<5)this.collect(o);else{this.damage(o.type);o.done=true;}}
 }
 for(const b of this.blasts){b.age+=dt;if(b.age<.35&&!b.hit&&Math.hypot(b.x-p.x,b.y-this.y)<c.bomb.radius+p.rx){b.hit=true;this.damage('blast');}}
 this.blasts=this.blasts.filter(b=>b.age<c.bomb.blastDuration);this.objects=this.objects.filter(o=>!o.done&&o.x>-80);
 }
 tier(){return this.score>=1000?15:this.score>=550?10:5;}
}
if(typeof module!=='undefined')module.exports=RunModel;
