/* ===== بازی‌های کافی‌نت — دایی ناصر + برج‌سازی ===== */
'use strict';

/* ---------- ابزار مشترک ---------- */
const GFA='۰۱۲۳۴۵۶۷۸۹';
const gNum=n=>String(n).replace(/\d/g,d=>GFA[+d]);
function lerp(a,b,t){return a+(b-a)*t;}
function lerpC(c1,c2,t){
  return 'rgb('+Math.round(lerp(c1[0],c2[0],t))+','+Math.round(lerp(c1[1],c2[1],t))+','+Math.round(lerp(c1[2],c2[2],t))+')';
}
function hex2rgb(h){
  h=h.replace('#','');
  return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
}
function setupCanvas(cv,hRatio){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=cv.parentElement.clientWidth;
  const h=hRatio;
  cv.width=w*dpr;cv.height=h*dpr;
  cv.style.width=w+'px';cv.style.height=h+'px';
  const ctx=cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return{ctx:ctx,w:w,h:h};
}

/* ================================================================
   دایی ناصر — دایناسور پرشی با شب/روز و سه اکوسیستم
   ================================================================ */
const DINO={
  cv:null,ctx:null,w:900,h:440,raf:0,last:0,on:false,over:false,
  t:0,dist:0,speed:6,x:96,y:0,vy:0,duck:false,ground:true,
  obs:[],nextIn:600,deco:[],decoIn:200,clouds:[],stars:[],
  blinkT:0,blink:0,runP:0,squash:0,
  biome:0,prevBiome:0,mix:1,biomeDist:0,
  best:0,score:0,shake:0,parts:[],
};
const DINO_DAY={skyT:'#6fc3f7',skyB:'#fdeec9',gnd:'#e7c27d',txt:'#173a5e'};
const DINO_NIGHT={skyT:'#0a1030',skyB:'#25315f',gnd:'#2a2f52',txt:'#cfe0ff'};
const BIOMES=[
  {name:'صحرا',gnd:'#e7c27d',gndN:'#33385e',deco:'desert',acc:'#c98f3f'},
  {name:'جنگل',gnd:'#5fae62',gndN:'#28463f',deco:'forest',acc:'#2f7a45'},
  {name:'رود',gnd:'#d9b96f',gndN:'#2c3358',deco:'river',acc:'#3f8fd2'},
];
function dinoInit(cv){
  DINO.best=store.get('dinoBest',0);
  DINO.cv=cv;
  const s=setupCanvas(cv,440);
  DINO.ctx=s.ctx;DINO.w=s.w;DINO.h=s.h;
  if(!DINO.stars.length){
    for(let i=0;i<70;i++)DINO.stars.push({x:Math.random(),y:Math.random()*0.55,r:Math.random()*1.4+0.4,p:Math.random()*6.28});
    for(let i=0;i<6;i++)DINO.clouds.push({x:Math.random(),y:0.08+Math.random()*0.3,s:0.5+Math.random()*0.8});
  }
}
function dinoReset(){
  const D=DINO;
  D.t=0;D.dist=0;D.speed=6;D.y=0;D.vy=0;D.ground=true;D.over=false;
  D.obs=[];D.nextIn=700;D.deco=[];D.decoIn=100;D.biome=0;D.prevBiome=0;D.mix=1;D.biomeDist=0;
  D.score=0;D.parts=[];D.shake=0;
}
function dinoJump(){
  const D=DINO;
  if(D.over){dinoReset();return;}
  if(D.ground){D.vy=-0.82;D.ground=false;D.squash=1;}
}
function dinoActionDown(){DINO.duck=true;}
function dinoActionUp(){DINO.duck=false;}
function dinoSpawn(){
  const D=DINO,b=BIOMES[D.biome],g=D.h*0.8;
  const r=Math.random();
  const hard=Math.min(1,D.dist/9000);
  if(r<0.14&&D.dist>1600){
    D.obs.push({fly:true,x:D.w+40,w:44,h:26,y:g-(D.duck?46:66),ph:Math.random()*6});
  }else if(b.deco==='river'&&r<0.55){
    D.obs.push({type:'log',x:D.w+40,w:70+Math.random()*50*(1+hard*0.4),h:26,y:g});
  }else if(r<0.75){
    const n=1+(Math.random()<hard*0.55?1:0)+(Math.random()<hard*0.3?2:0);
    for(let i=0;i<n;i++){
      const tall=Math.random()<0.4;
      D.obs.push({type:b.deco==='forest'?'tree':'cactus',x:D.w+40+i*26,w:18,h:tall?52:34,y:g,off:Math.random()});
    }
  }else{
    D.obs.push({type:'rock',x:D.w+40,w:30+Math.random()*22,h:20+Math.random()*12,y:g});
  }
  D.nextIn=(330+Math.random()*430)*(1-hard*0.28);
}
function dinoSpawnDeco(){
  const D=DINO,b=BIOMES[D.biome];
  const type=b.deco;
  D.deco.push({type:type,x:D.w+60,s:0.5+Math.random()*0.9,v:Math.random(),h2:Math.random()});
  D.decoIn=90+Math.random()*220;
}
function dinoUpdate(dt){
  const D=DINO,g=D.h*0.8;
  D.t+=dt;
  if(!D.over){
    D.speed+=dt*0.00022;
    const mv=D.speed*dt*0.06;
    D.dist+=mv;
    D.score=Math.floor(D.dist/12);
    D.runP+=dt*0.02*(D.speed/6);
    /* پرش */
    if(!D.ground){
      D.vy+=0.0026*dt;
      D.y+=D.vy*dt;
      if(D.y>=0){D.y=0;D.ground=true;D.squash=0.7;}
    }
    if(D.squash>0)D.squash=Math.max(0,D.squash-dt*0.004);
    /* پلک زدن */
    D.blinkT+=dt;
    if(D.blinkT>2800){D.blink=140;D.blinkT=0;}
    if(D.blink>0)D.blink-=dt;
    /* تعویض بیوم هر 2400 پیکسل */
    D.biomeDist+=mv;
    if(D.biomeDist>2400){
      D.biomeDist=0;D.prevBiome=D.biome;D.biome=(D.biome+1)%3;D.mix=0;
    }
    if(D.mix<1)D.mix=Math.min(1,D.mix+dt*0.0012);
    /* موانع */
    D.nextIn-=mv;
    if(D.nextIn<=0)dinoSpawn();
    for(const o of D.obs)o.x-=mv;
    D.obs=D.obs.filter(o=>o.x+o.w>-20);
    /* دکور پس‌زمینه */
    D.decoIn-=mv*0.45;
    if(D.decoIn<=0)dinoSpawnDeco();
    for(const d of D.deco)d.x-=mv*0.45*d.s;
    D.deco=D.deco.filter(d=>d.x>-140);
    for(const c of D.clouds){c.x-=dt*0.000012*c.s;if(c.x<-0.15)c.x=1.12;}
    /* برخورد */
    const dw=D.duck?58:38,dh=(D.duck?30:50);
    const px=D.x+4,py=g+D.y-(D.duck?30:50);
    for(const o of D.obs){
      const oy=o.fly?o.y:o.y-o.h;
      if(px<o.x+o.w-6&&px+dw>o.x+6&&py+dh>oy+4&&py<oy+(o.fly?o.h:o.h)-2){
        D.over=true;D.shake=1;
        if(D.score>D.best){D.best=D.score;store.set('dinoBest',D.best);}
        for(let i=0;i<16;i++)D.parts.push({x:px+dw/2,y:py+dh/2,vx:(Math.random()-0.5)*0.5,vy:-Math.random()*0.5-0.1,l:1});
        break;
      }
    }
  }
  for(const p of D.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=0.001*dt;p.l-=dt*0.0012;}
  D.parts=D.parts.filter(p=>p.l>0);
  if(D.shake>0)D.shake=Math.max(0,D.shake-dt*0.003);
}
function dinoDraw(){
  const D=DINO,c=D.ctx,W=D.w,H=D.h,g=H*0.8;
  const cyc=(D.t%9000)/9000;
  const nightAmt=0.5-0.5*Math.cos(cyc*6.28318);
  const b=BIOMES[D.biome],bp=BIOMES[D.prevBiome],mx=D.mix;
  c.save();
  if(D.shake>0)c.translate((Math.random()-0.5)*D.shake*8,(Math.random()-0.5)*D.shake*6);
  /* آسمان */
  const skyT=lerpC(hex2rgb(DINO_DAY.skyT),hex2rgb(DINO_NIGHT.skyT),nightAmt);
  const skyB=lerpC(hex2rgb(DINO_DAY.skyB),hex2rgb(DINO_NIGHT.skyB),nightAmt);
  const grd=c.createLinearGradient(0,0,0,g);
  grd.addColorStop(0,skyT);grd.addColorStop(1,skyB);
  c.fillStyle=grd;c.fillRect(-10,-10,W+20,g+12);
  /* ستاره‌ها */
  if(nightAmt>0.05){
    for(const s of D.stars){
      c.globalAlpha=nightAmt*(0.4+0.6*Math.abs(Math.sin(D.t*0.001+s.p)));
      c.fillStyle='#fff';
      c.beginPath();c.arc(s.x*W,s.y*H,s.r,0,7);c.fill();
    }
    c.globalAlpha=1;
  }
  /* خورشید / ماه */
  const ang=cyc*6.28318-Math.PI/2;
  const cx=W*0.5+Math.cos(ang+Math.PI)*W*0.42;
  const cyy=g*0.62+Math.sin(ang+Math.PI)*g*0.55;
  if(nightAmt<0.6){
    c.globalAlpha=1-nightAmt;
    const sg=c.createRadialGradient(W*0.78,g*0.24,4,W*0.78,g*0.24,54);
    sg.addColorStop(0,'rgba(255,220,110,.95)');sg.addColorStop(.4,'rgba(255,210,90,.5)');sg.addColorStop(1,'rgba(255,210,90,0)');
    c.fillStyle=sg;c.beginPath();c.arc(W*0.78,g*0.24,54,0,7);c.fill();
    c.fillStyle='#ffd76e';c.beginPath();c.arc(W*0.78,g*0.24,26,0,7);c.fill();
    c.globalAlpha=1;
  }
  if(nightAmt>0.4){
    c.globalAlpha=nightAmt;
    const mx2=W*0.2,my2=g*0.22;
    c.fillStyle='#eef3ff';c.beginPath();c.arc(mx2,my2,22,0,7);c.fill();
    c.fillStyle='rgba(160,175,215,.5)';
    c.beginPath();c.arc(mx2-7,my2-4,5,0,7);c.fill();
    c.beginPath();c.arc(mx2+6,my2+7,3.5,0,7);c.fill();
    c.beginPath();c.arc(mx2+9,my2-8,2.5,0,7);c.fill();
    c.globalAlpha=1;
  }
  /* ابر */
  for(const cl of D.clouds){
    c.globalAlpha=(0.75-nightAmt*0.45)*cl.s;
    c.fillStyle=nightAmt>0.5?'#8f9bc7':'#ffffff';
    const cx2=cl.x*W,cy2=cl.y*H;
    c.beginPath();
    c.arc(cx2,cy2,14*cl.s,0,7);c.arc(cx2+16*cl.s,cy2-7*cl.s,17*cl.s,0,7);c.arc(cx2+34*cl.s,cy2,13*cl.s,0,7);
    c.rect(cx2-8*cl.s,cy2,50*cl.s,12*cl.s);
    c.fill();
  }
  c.globalAlpha=1;
  /* کوه/تل‌های دور */
  c.fillStyle=lerpC(hex2rgb(nightAmt>0.5?'#1c2547':'#c9b284'),hex2rgb(nightAmt>0.5?'#141b38':'#b8cd9a'),mx);
  c.beginPath();c.moveTo(0,g);
  for(let i=0;i<=8;i++){const xx=i*W/8;c.lineTo(xx,g-30-38*Math.abs(Math.sin(i*1.7+D.biome*2)));}
  c.lineTo(W,g);c.fill();
  /* دکورها */
  for(const d of D.deco)dinoDeco(d,g,nightAmt);
  /* زمین */
  const g1=lerpC(hex2rgb(bp.gnd),hex2rgb(b.gnd),mx);
  const g2=lerpC(hex2rgb(bp.gndN),hex2rgb(b.gndN),mx);
  const gc=lerpC(hex2rgb(g1),hex2rgb(g2),nightAmt);
  c.fillStyle=gc;c.fillRect(-10,g,W+20,H-g+10);
  c.strokeStyle='rgba(0,0,0,.14)';c.lineWidth=2;
  c.beginPath();c.moveTo(0,g+1);c.lineTo(W,g+1);c.stroke();
  /* خط‌های زمین متحرک */
  c.fillStyle='rgba(0,0,0,.09)';
  for(let i=0;i<14;i++){
    const xx=((i*160-(D.dist*0.9)%160)+W)%W;
    c.fillRect(xx,g+10+((i*37)%34),26+((i*13)%22),2.5);
  }
  /* رودخانه: نوار آب */
  const curDeco=lerpBiome(bp.deco,b.deco,mx);
  if(curDeco==='river'){
    c.fillStyle=lerpC(hex2rgb('#3f8fd2'),hex2rgb('#173a6b'),nightAmt);
    c.fillRect(0,g+6,W,16);
    c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.6;
    for(let i=0;i<7;i++){
      const yy=g+9+i*2,ph=D.t*0.004+i;
      c.beginPath();
      for(let xx=0;xx<=W;xx+=26)c.lineTo(xx,yy+Math.sin(xx*0.05+ph)*1.6);
      c.globalAlpha=0.35-i*0.04;c.stroke();c.globalAlpha=1;
    }
  }
  /* موانع */
  for(const o of D.obs)dinoObs(o,curDeco,nightAmt,g);
  /* دایی ناصر */
  dinoHero(g,nightAmt);
  /* ذرات */
  for(const p of D.parts){
    c.globalAlpha=p.l;c.fillStyle='#ffd76e';
    c.beginPath();c.arc(p.x,p.y,3,0,7);c.fill();
  }
  c.globalAlpha=1;
  /* امتیاز */
  c.font='800 20px Vazirmatn';
  c.fillStyle=lerpC(hex2rgb('#173a5e'),hex2rgb('#cfe0ff'),nightAmt);
  c.textAlign='left';
  c.fillText('امتیاز '+gNum(D.score),18,34);
  c.font='600 13px Vazirmatn';c.globalAlpha=0.75;
  c.fillText('رکورد '+gNum(D.best),18,56);
  c.globalAlpha=1;
  const bn=lerpBiomeName(bp.name,b.name,mx);
  c.font='700 13px Vazirmatn';c.textAlign='center';c.globalAlpha=0.7;
  c.fillText(bn+' · '+(nightAmt>0.5?'شب':'روز'),W/2,32);
  c.globalAlpha=1;
  /* منو / باخت */
  if(!D.on){}
  if(D.over){
    c.fillStyle='rgba(6,10,26,.55)';c.fillRect(0,0,W,H);
    c.textAlign='center';
    c.fillStyle='#ffd76e';c.font='900 38px Vazirmatn';
    c.fillText('آخ! گاز گرفتی!',W/2,H/2-34);
    c.fillStyle='#fff';c.font='800 20px Vazirmatn';
    c.fillText('امتیاز: '+gNum(D.score)+' — رکورد: '+gNum(D.best),W/2,H/2+4);
    c.font='600 14px Vazirmatn';c.fillStyle='#a9bad4';
    c.fillText('Enter یا کلیک = از نو',W/2,H/2+38);
  }
  c.restore();
}
function lerpBiome(a,b,t){return t>0.5?b:a;}
function lerpBiomeName(a,b,t){return t>0.5?b:a;}
function dinoHero(g,nightAmt){
  const D=DINO,c=D.ctx;
  const duck=D.duck&&D.ground;
  const bx=D.x,by=g+D.y;
  const sq=D.squash;
  /* سایه */
  c.fillStyle='rgba(0,0,0,'+(0.22-nightAmt*0.08)+')';
  c.beginPath();c.ellipse(bx+20,g+4,26-D.y*0.05,5,0,0,7);c.fill();
  c.save();
  c.translate(bx,by);
  const bodyW=duck?58:40,bodyH=(duck?28:48)*(1-sq*0.18),bodyY=duck?-28:-48;
  /* پاها */
  if(D.ground&&!duck){
    const ph=Math.sin(D.runP);
    c.fillStyle='#3f9e52';
    c.beginPath();c.roundRect(6+ph*5,-10,11,12,4);c.fill();
    c.beginPath();c.roundRect(22-ph*5,-10,11,12,4);c.fill();
  }else if(!D.ground){
    c.fillStyle='#3f9e52';
    c.beginPath();c.roundRect(8,-8,12,10,4);c.fill();
    c.beginPath();c.roundRect(22,-6,12,10,4);c.fill();
  }else{
    c.fillStyle='#3f9e52';
    c.beginPath();c.roundRect(8,-8,12,9,4);c.fill();
    c.beginPath();c.roundRect(26,-8,12,9,4);c.fill();
  }
  /* دم */
  c.fillStyle='#4bb05e';
  c.beginPath();
  c.moveTo(2,bodyY+bodyH*0.55);
  c.quadraticCurveTo(-16,bodyY+bodyH*0.42,-20,bodyY+bodyH*0.1);
  c.quadraticCurveTo(-8,bodyY+bodyH*0.4,4,bodyY+bodyH*0.8);
  c.fill();
  /* بدن */
  const bg=c.createLinearGradient(0,bodyY,0,bodyY+bodyH);
  bg.addColorStop(0,'#66cf78');bg.addColorStop(1,'#4bb05e');
  c.fillStyle=bg;
  c.beginPath();c.roundRect(0,bodyY,bodyW,bodyH,14);c.fill();
  /* شکم */
  c.fillStyle='#d9f2cf';
  c.beginPath();c.roundRect(duck?12:16,bodyY+bodyH*0.42,duck?36:17,bodyH*0.5,8);c.fill();
  /* خارهای پشت */
  c.fillStyle='#2f8a41';
  for(let i=0;i<3;i++){
    const sx=duck?6+i*15:4+i*11;
    c.beginPath();
    c.moveTo(sx,bodyY+3);c.lineTo(sx+5,bodyY-7);c.lineTo(sx+10,bodyY+3);
    c.fill();
  }
  /* چشم بزرگ گوگولی */
  const ex=duck?bodyW-16:bodyW-13,ey=bodyY+(duck?9:12);
  const blink=D.blink>0;
  c.fillStyle='#fff';
  c.beginPath();c.ellipse(ex,ey,8,blink?1.4:8.5,0,0,7);c.fill();
  if(!blink){
    c.fillStyle='#1d2b3a';
    c.beginPath();c.arc(ex+2,ey+1,3.6,0,7);c.fill();
    c.fillStyle='#fff';
    c.beginPath();c.arc(ex+3.2,ey-0.4,1.2,0,7);c.fill();
  }
  /* لپ گوگولی */
  c.fillStyle='rgba(247,140,160,.55)';
  c.beginPath();c.arc(ex-7,ey+8,3.6,0,7);c.fill();
  /* لبخند */
  c.strokeStyle='#1d4a2c';c.lineWidth=2;c.lineCap='round';
  c.beginPath();c.arc(ex-4,ey+9,5,0.15,1.35);c.stroke();
  /* بینی */
  c.fillStyle='#3a9e4d';
  c.beginPath();c.arc(bodyW-2,bodyY+(duck?14:20),3.4,0,7);c.fill();
  c.restore();
}
function dinoObs(o,deco,nightAmt,g){
  const c=DINO.ctx;
  c.save();
  if(o.fly){
    const wing=Math.sin(DINO.t*0.02)*10;
    c.fillStyle=nightAmt>0.5?'#454f77':'#4a3f66';
    c.beginPath();c.ellipse(o.x+22,o.y+13,16,9,0,0,7);c.fill();
    c.beginPath();c.moveTo(o.x+12,o.y+11);c.quadraticCurveTo(o.x-2,o.y+2-wing,o.x+8,o.y+12);c.fill();
    c.beginPath();c.moveTo(o.x+32,o.y+11);c.quadraticCurveTo(o.x+46,o.y+2-wing,o.x+36,o.y+12);c.fill();
    c.fillStyle='#fff';
    c.beginPath();c.arc(o.x+27,o.y+10,2.4,0,7);c.fill();
    c.fillStyle='#222';c.beginPath();c.arc(o.x+27.8,o.y+10,1.2,0,7);c.fill();
    /* منقار */
    c.fillStyle='#f0b53e';
    c.beginPath();c.moveTo(o.x+37,o.y+12);c.lineTo(o.x+46,o.y+14);c.lineTo(o.x+37,o.y+17);c.fill();
  }else if(o.type==='cactus'){
    const dark=nightAmt>0.5;
    c.fillStyle=dark?'#2f6b4f':'#3f9e5c';
    c.beginPath();c.roundRect(o.x,g-o.h,o.w,o.h+2,8);c.fill();
    c.beginPath();c.roundRect(o.x-7,g-o.h*0.6,6,o.h*0.42,3);c.fill();
    c.beginPath();c.roundRect(o.x+o.w+1,g-o.h*0.72,6,o.h*0.5,3);c.fill();
    c.fillStyle='rgba(255,255,255,.18)';
    c.beginPath();c.roundRect(o.x+3,g-o.h+3,3,o.h-8,2);c.fill();
  }else if(o.type==='tree'){
    c.fillStyle=nightAmt>0.5?'#4a3b2c':'#7a5a3a';
    c.fillRect(o.x+6,g-o.h*0.5,7,o.h*0.5+2);
    c.fillStyle=nightAmt>0.5?'#245542':'#2f8a4d';
    c.beginPath();c.arc(o.x+9,g-o.h*0.62,15,0,7);c.arc(o.x-2,g-o.h*0.45,10,0,7);c.arc(o.x+20,g-o.h*0.45,10,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,.14)';
    c.beginPath();c.arc(o.x+5,g-o.h*0.68,5,0,7);c.fill();
  }else if(o.type==='log'){
    c.fillStyle=nightAmt>0.5?'#4a3b2c':'#8a6238';
    c.beginPath();c.roundRect(o.x,g-o.h,o.w,o.h+3,7);c.fill();
    c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=1.6;
    for(let i=1;i<4;i++){c.beginPath();c.moveTo(o.x+i*o.w/4,g-o.h+3);c.lineTo(o.x+i*o.w/4-4,g);c.stroke();}
    c.fillStyle=nightAmt>0.5?'#5c6b9a':'#c9a06a';
    c.beginPath();c.ellipse(o.x+o.w/2,g-o.h+2,o.w*0.16,4,0,0,7);c.fill();
  }else{
    const dark=nightAmt>0.5;
    c.fillStyle=dark?'#3c4468':'#9a8f7d';
    c.beginPath();
    c.moveTo(o.x,g+2);c.lineTo(o.x+o.w*0.2,g-o.h);c.lineTo(o.x+o.w*0.62,g-o.h-3);
    c.lineTo(o.x+o.w,g-o.h*0.4);c.lineTo(o.x+o.w,g+2);c.fill();
    c.fillStyle='rgba(255,255,255,.15)';
    c.beginPath();c.moveTo(o.x+o.w*0.2,g-o.h);c.lineTo(o.x+o.w*0.62,g-o.h-3);c.lineTo(o.x+o.w*0.5,g);c.lineTo(o.x+o.w*0.3,g);c.fill();
  }
  c.restore();
}
function dinoDeco(d,g,nightAmt){
  const c=DINO.ctx,x=d.x,s=d.s;
  c.save();c.globalAlpha=0.5+0.3*s;
  if(d.type==='desert'){
    /* هرم یا تپه */
    if(d.v<0.5){
      c.fillStyle=nightAmt>0.5?'#252c50':'#d4af6e';
      c.beginPath();c.moveTo(x,g+1);c.lineTo(x+45*s,g-60*s);c.lineTo(x+90*s,g+1);c.fill();
      c.fillStyle='rgba(255,255,255,.12)';
      c.beginPath();c.moveTo(x+45*s,g-60*s);c.lineTo(x+62*s,g+1);c.lineTo(x+28*s,g+1);c.fill();
    }else{
      c.fillStyle=nightAmt>0.5?'#2c3358':'#dcbd82';
      c.beginPath();c.ellipse(x,g+1,55*s,16*s,0,Math.PI,0);c.fill();
    }
  }else if(d.type==='forest'){
    c.fillStyle=nightAmt>0.5?'#1d3a30':'#4c9a68';
    const th=(40+d.h2*36)*s;
    c.beginPath();c.moveTo(x,g+1);c.lineTo(x+16*s,g-th);c.lineTo(x+32*s,g+1);c.fill();
    c.beginPath();c.moveTo(x+14*s,g+1);c.lineTo(x+27*s,g-th*0.75);c.lineTo(x+40*s,g+1);c.fill();
  }else{
    /* نیلوفر / سنگ رودخانه */
    if(d.v<0.6){
      c.strokeStyle=nightAmt>0.5?'#33507e':'#2f7a4d';c.lineWidth=2.4*s;
      c.beginPath();c.moveTo(x,g+8);c.quadraticCurveTo(x+4*s,g-14*s,x+1,g-22*s);c.stroke();
      c.fillStyle=nightAmt>0.5?'#4a6b9a':'#63b26e';
      c.beginPath();c.ellipse(x+1,g-24*s,7*s,3.4*s,0,0,7);c.fill();
    }else{
      c.fillStyle=nightAmt>0.5?'#2c3358':'#b09a6e';
      c.beginPath();c.ellipse(x,g+6,16*s,7*s,0,Math.PI,0);c.fill();
    }
  }
  c.restore();
}
/* ---------- حلقه و کنترل ---------- */
function dinoFrame(now){
  const D=DINO;
  if(!D.on)return;
  const dt=Math.min(50,now-(D.last||now));D.last=now;
  dinoUpdate(dt);
  dinoDraw();
  D.raf=requestAnimationFrame(dinoFrame);
}
function dinoStart(cv){
  dinoInit(cv);
  const D=DINO;
  if(D.raf)cancelAnimationFrame(D.raf);
  D.on=true;dinoReset();
  D.last=0;
  D.raf=requestAnimationFrame(dinoFrame);
}
function dinoStop(){const D=DINO;D.on=false;if(D.raf)cancelAnimationFrame(D.raf);D.raf=0;}

/* ================================================================
   برج‌سازی — استک‌کردن بلوک‌ها
   ================================================================ */
const TWR={
  cv:null,ctx:null,w:900,h:480,raf:0,last:0,on:false,over:false,
  blocks:[],cur:null,pieces:[],ring:null,
  camY:0,camT:0,speed:0.22,baseW:230,bh:26,
  score:0,combo:0,best:0,
  t:0,stars:[],clouds:[],
};
function twrInit(cv){
  TWR.best=store.get('towerBest',0);
  TWR.cv=cv;
  const s=setupCanvas(cv,480);
  TWR.ctx=s.ctx;TWR.w=s.w;TWR.h=s.h;
  if(!TWR.stars.length){
    for(let i=0;i<80;i++)TWR.stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.3+0.3,p:Math.random()*6.28});
    for(let i=0;i<7;i++)TWR.clouds.push({x:Math.random(),y:Math.random()*0.85,s:0.5+Math.random()});
  }
}
function twrReset(){
  const T=TWR;
  T.blocks=[{x:(T.w-T.baseW)/2,w:T.baseW,hue:210,y:0}];
  T.cur=null;T.pieces=[];T.ring=null;
  T.camY=0;T.camT=0;T.speed=0.22;T.score=0;T.combo=0;T.over=false;T.t=0;
  twrNext();
}
function twrNext(){
  const T=TWR,top=T.blocks[T.blocks.length-1];
  const dir=(T.blocks.length%2===0)?1:-1;
  T.cur={x:dir===1?-top.w*0.6:T.w-top.w*0.4,w:top.w,dir:dir};
  T.speed=Math.min(0.55,0.22+T.blocks.length*0.006);
}
function twrDrop(){
  const T=TWR;
  if(T.over){twrReset();return;}
  if(!T.cur)return;
  const top=T.blocks[T.blocks.length-1];
  const oL=Math.max(T.cur.x,top.x),oR=Math.min(T.cur.x+T.cur.w,top.x+top.w);
  const ow=oR-oL;
  const y=-(T.blocks.length)*T.bh;
  if(ow<=6){
    /* کامل باخت */
    T.pieces.push({x:T.cur.x,w:T.cur.w,y:y,vx:T.cur.dir*0.25,vr:T.cur.dir*0.004,rot:0,hue:T.hueOf()});
    T.cur=null;T.over=true;
    if(T.score>T.best){T.best=T.score;store.set('towerBest',T.best);}
    return;
  }
  const diff=Math.abs(T.cur.x-top.x);
  if(diff<7){
    /* عالی! */
    T.combo++;
    T.cur.x=top.x;T.cur.w=top.w;
    if(T.combo>=3&&T.cur.w<T.baseW)T.cur.w=Math.min(T.baseW,T.cur.w+10);
    T.ring={y:y,l:1};
  }else{
    T.combo=0;
    /* تکهٔ افتادنی */
    if(T.cur.x<top.x){
      T.pieces.push({x:T.cur.x,w:T.cur.x+T.cur.w-oL,y:y,vx:-0.22,vr:-0.004,rot:0,hue:T.hueOf()});
    }else{
      T.pieces.push({x:oR,w:T.cur.x+T.cur.w-oR,y:y,vx:0.22,vr:0.004,rot:0,hue:T.hueOf()});
    }
    T.cur.x=oL;T.cur.w=ow;
  }
  T.blocks.push({x:T.cur.x,w:T.cur.w,hue:T.hueOf(),y:y});
  T.score=T.blocks.length-1;
  T.cur=null;
  T.camT=y+T.h*0.42;
  setTimeout(()=>{if(TWR.on&&!TWR.over)twrNext();},140);
}
TWR.hueOf=function(){return (205+TWR.blocks.length*9)%360;};
function twrUpdate(dt){
  const T=TWR;
  T.t+=dt;
  if(T.cur&&!T.over){
    T.cur.x+=T.cur.dir*T.speed*dt;
    const top=T.blocks[T.blocks.length-1];
    const m=T.baseW*0.9;
    if(T.cur.x<-m){T.cur.x=-m;T.cur.dir=1;}
    if(T.cur.x+T.cur.w>T.w+m){T.cur.x=T.w+m-T.cur.w;T.cur.dir=-1;}
  }
  T.camY+=(T.camT-T.camY)*Math.min(1,dt*0.006);
  for(const p of T.pieces){
    p.vy=(p.vy||0)+0.0011*dt;p.y+=p.vy*dt;
    p.x+=p.vx*dt;p.rot+=p.vr*dt;
  }
  T.pieces=T.pieces.filter(p=>p.y<T.h+240);
  if(T.ring){T.ring.l-=dt*0.002;if(T.ring.l<=0)T.ring=null;}
  for(const c of T.clouds){c.x+=dt*0.00001*c.s;if(c.x>1.15)c.x=-0.15;}
}
function twrDraw(){
  const T=TWR,c=T.ctx,W=T.w,H=T.h;
  const hRatio=Math.min(1,T.blocks.length/40);
  /* آسمان بر اساس ارتفاع برج */
  const g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,lerpC(hex2rgb('#3f7fd4'),hex2rgb('#0b1030'),hRatio));
  g.addColorStop(0.7,lerpC(hex2rgb('#9fd0f0'),hex2rgb('#1c2b52'),hRatio));
  g.addColorStop(1,lerpC(hex2rgb('#e8f3ea'),hex2rgb('#2a3560'),hRatio));
  c.fillStyle=g;c.fillRect(0,0,W,H);
  /* ستاره‌ها با ارتفاع */
  if(hRatio>0.25){
    c.globalAlpha=(hRatio-0.25)*1.2;
    for(const s of T.stars){
      c.fillStyle='#fff';
      c.beginPath();c.arc(s.x*W,s.y*H*0.7,s.r,0,7);c.fill();
    }
    c.globalAlpha=1;
  }
  /* خورشید */
  c.globalAlpha=1-hRatio*0.7;
  const sg=c.createRadialGradient(W*0.82,H*0.16,5,W*0.82,H*0.16,60);
  sg.addColorStop(0,'rgba(255,224,120,.95)');sg.addColorStop(1,'rgba(255,224,120,0)');
  c.fillStyle=sg;c.beginPath();c.arc(W*0.82,H*0.16,60,0,7);c.fill();
  c.globalAlpha=1;
  /* ابر */
  for(const cl of T.clouds){
    c.globalAlpha=0.5;
    c.fillStyle='#fff';
    const cx2=cl.x*W,cy2=cl.y*H*0.8;
    c.beginPath();
    c.arc(cx2,cy2,13*cl.s,0,7);c.arc(cx2+15*cl.s,cy2-6*cl.s,15*cl.s,0,7);c.arc(cx2+31*cl.s,cy2,12*cl.s,0,7);
    c.rect(cx2-8*cl.s,cy2,46*cl.s,10*cl.s);c.fill();
  }
  c.globalAlpha=1;
  /* زمین */
  c.fillStyle=lerpC(hex2rgb('#79b877'),hex2rgb('#232f52'),hRatio);
  c.fillRect(0,H-26,W,26);
  c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,H-26,W,4);
  /* برج */
  c.save();
  c.translate(0,-T.camY+ (H-26));
  /* بلوک‌ها */
  for(let i=0;i<T.blocks.length;i++){
    const b=T.blocks[i];
    const by=i*(-T.bh);
    if(by-T.camY+ (H-26)<-60)continue;
    twrBlock(c,b.x,by,b.w,b.hue,i===T.blocks.length-1);
  }
  /* تکه‌های افتادنی */
  for(const p of T.pieces){
    c.save();
    c.translate(p.x+p.w/2,p.y-T.bh/2);
    c.rotate(p.rot);
    c.fillStyle='hsl('+p.hue+' 62% 52% / .85)';
    c.beginPath();c.roundRect(-p.w/2,-T.bh/2,p.w,T.bh,5);c.fill();
    c.restore();
  }
  /* بلوک لغزان */
  if(T.cur){
    const cy=T.blocks.length*(-T.bh);
    twrBlock(c,T.cur.x,cy,T.cur.w,T.hueOf(),true);
    /* راهنمای تراز */
    const top=T.blocks[T.blocks.length-1];
    c.strokeStyle='rgba(255,255,255,.35)';c.setLineDash([5,5]);c.lineWidth=1.5;
    c.strokeRect(top.x,cy,top.w,T.bh);
    c.setLineDash([]);
  }
  /* حلقهٔ عالی */
  if(T.ring){
    c.globalAlpha=T.ring.l;
    c.strokeStyle='#ffd76e';c.lineWidth=3.5;
    const ex=(1-T.ring.l)*26;
    c.beginPath();c.roundRect(-ex,T.ring.y-ex,T.w+ex*2,T.bh+ex*2,10);c.stroke();
    c.globalAlpha=1;
  }
  c.restore();
  /* متن */
  c.textAlign='left';
  c.font='800 21px Vazirmatn';c.fillStyle='#fff';
  c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=6;
  c.fillText('ارتفاع '+gNum(T.score),18,34);
  c.font='600 13px Vazirmatn';c.globalAlpha=0.85;
  c.fillText('رکورد '+gNum(T.best),18,56);
  c.globalAlpha=1;c.shadowBlur=0;
  if(T.combo>=2&&!T.over){
    c.textAlign='center';
    c.font='900 26px Vazirmatn';
    c.fillStyle='#ffd76e';
    c.fillText('عالی! ×'+gNum(T.combo),W/2,110);
  }
  if(T.over){
    c.fillStyle='rgba(6,10,26,.55)';c.fillRect(0,0,W,H);
    c.textAlign='center';
    c.fillStyle='#ffd76e';c.font='900 36px Vazirmatn';
    c.fillText('برجت فرو ریخت!',W/2,H/2-36);
    c.fillStyle='#fff';c.font='800 20px Vazirmatn';
    c.fillText('ارتفاع: '+gNum(T.score)+' — رکورد: '+gNum(T.best),W/2,H/2+2);
    c.font='600 14px Vazirmatn';c.fillStyle='#a9bad4';
    c.fillText('Enter یا کلیک = بساز از نو',W/2,H/2+36);
  }else if(!T.cur&&T.blocks.length===1&&!T.on){}
}
function twrBlock(c,x,y,w,hue,top){
  const h=TWR.bh,d=9;
  c.fillStyle='hsl('+hue+' 62% 44%)';
  c.beginPath();c.roundRect(x,y,w,h,5);c.fill();
  /* وجه بالایی سه‌بعدی */
  c.fillStyle='hsl('+hue+' 68% '+(top?'68%':'60%')+')';
  c.beginPath();
  c.moveTo(x+3,y);c.lineTo(x+d,y-d);c.lineTo(x+w-d,y-d);c.lineTo(x+w-3,y);
  c.fill();
  /* برق */
  c.fillStyle='rgba(255,255,255,.22)';
  c.beginPath();c.roundRect(x+4,y+3,Math.max(6,w*0.3),5,3);c.fill();
  c.strokeStyle='rgba(0,0,0,.15)';c.lineWidth=1;
  c.beginPath();c.roundRect(x,y,w,h,5);c.stroke();
}
function twrFrame(now){
  const T=TWR;
  if(!T.on)return;
  const dt=Math.min(50,now-(T.last||now));T.last=now;
  twrUpdate(dt);
  twrDraw();
  T.raf=requestAnimationFrame(twrFrame);
}
function twrStart(cv){
  twrInit(cv);
  const T=TWR;
  if(T.raf)cancelAnimationFrame(T.raf);
  T.on=true;twrReset();
  T.last=0;
  T.raf=requestAnimationFrame(twrFrame);
}
function twrStop(){const T=TWR;T.on=false;if(T.raf)cancelAnimationFrame(T.raf);T.raf=0;}

/* ---------- API مشترک ---------- */
const GAME_ENG={
  'dino':{start:dinoStart,stop:dinoStop,action:dinoJump,down:dinoActionDown,up:dinoActionUp},
  'tower':{start:twrStart,stop:twrStop,action:twrDrop},
};
function gameStart(id){
  gameStopAll();
  const cv=document.getElementById('gameCv');
  if(cv&&GAME_ENG[id])GAME_ENG[id].start(cv);
}
function gameStopAll(){
  for(const k in GAME_ENG)GAME_ENG[k].stop();
}
