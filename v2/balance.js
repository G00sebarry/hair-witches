/* All dimensions are in the fixed mobile playfield 390 × 700. */
const BALANCE={duration:90,bonusBoost:{coin:.10,crystal:.03},player:{x:165,startY:295,height:70,gravity:650,lift:-520,maxRise:-380,maxFall:450,top:126,bottom:650,rx:21,ry:23,lives:3,invulnerability:2.1,shield:5},
 sizes:[28,32,32,28,26,36,34,36],points:[10,25,75,5,0,0,0,0],thresholds:[0,550,1000],
 stages:[{until:22,speed:140,wave:3.2,enemies:1,enemyChance:.45,amplitude:22},{until:45,speed:160,wave:3,enemies:1,enemyChance:.7,amplitude:32},{until:65,speed:180,wave:2.8,enemies:2,enemyChance:.8,amplitude:40},{until:90,speed:195,wave:2.7,enemies:2,enemyChance:.9,amplitude:45}],
 coinsPerWave:3,coinGap:42,laneMin:190,laneMax:540,laneStep:65,safeSeparation:150,crystalEvery:6,potionEvery:4,shieldEvery:7,heartCooldown:24,
 bomb:{warning:1.3,radius:62,blastDuration:.8},freeze:{duration:3,budget:6,speed:1.15},finaleDuration:4};
if(typeof module!=='undefined')module.exports=BALANCE;
