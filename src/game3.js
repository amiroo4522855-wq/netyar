/* ===== بازی‌های پرمیوم جدید — فلپی، بریک‌اوت، مین‌یاب، حباب‌پاپ ===== */
'use strict';

/* ================================================================
   فلپی کافی — Flappy Coffee
   ================================================================ */
const FLAP={
  cv:null,ctx:null,w:360,h:480,on:false,over:false,raf:0,last:0,
  bird:{x:80,y:220,vy:0,r:14,rot:0},
  pipes:[],t:0,score:0,best:0,ground:0,clouds:[],parts:[],
  speed:2.2
};
function flapInit(cv){
  FLAP.best=store.get('flapBest',0);
  FLAP.cv=cv;
  const s=gCanvas(cv,360,480,360);
  FLAP.ctx=s.ctx;FLAP.w=s.w;FLAP.h=s.h;FLAP.ground=s.h-28;
  if(!FLAP.clouds.length){
    for(let i=0;i<6;i++)FLAP.clouds.push({x:Math.random()*360,y:20+Math.random()*120,s:0.6+Math.random()*0.7,v:0.2+Math.random()*0.5});
  }
}
function flapReset(){
  FLAP.bird={x:80,y:220,vy:0,r:14,rot:0};
  FLAP.pipes=[];FLAP.t=0;FLAP.score=0;FLAP.over=false;FLAP.parts=[];FLAP.speed=2.2;
  for(let i=0;i<3;i++)flapAddPipe(360+i*160);
}
function flapAddPipe(x){
  const gap=112;
  const minH=50;
  const maxH=FLAP.ground-gap-minH-20;
  const topH=minH+Math.random()*(maxH-minH);
  FLAP.pipes.push({x:x,topH:topH,gap:gap,passed:false});
}
function flapFlap(){
  if(FLAP.over){flapReset();return;}
  FLAP.bird.vy=-7.2;
  gSfx('click');
}
function flapUpdate(dt){
  if(FLAP.over)return;
  FLAP.t+=dt;
  const b=FLAP.bird;
  b.vy+=0.36;
  b.y+=b.vy;
  b.rot=Math.max(-0.6,Math.min(1.1,b.vy*0.08));
  if(b.y+b.r>FLAP.ground){b.y=FLAP.ground-b.r;FLAP.over=true;flapDie();}
  if(b.y-b.r<0){b.y=b.r;b.vy=0;}
  FLAP.speed=Math.min(4.2,2.2+FLAP.score*0.06);
  for(const p of FLAP.pipes)p.x-=FLAP.speed;
  if(FLAP.pipes.length&&FLAP.pipes[0].x<-70)FLAP.pipes.shift();
  if(FLAP.pipes.length<4)flapAddPipe(FLAP.pipes[FLAP.pipes.length-1].x+160);
  // score & collision
  for(const pipe of FLAP.pipes){
    if(!pipe.passed&&pipe.x+50<b.x){pipe.passed=true;FLAP.score++;gSfx('eat');}
    const bx=b.x,by=b.y,br=b.r;
    const pipeX=pipe.x,pipeW=50;
    if(bx+br>pipeX+6&&bx-br<pipeX+pipeW-6){
      if(by-br<pipe.topH-4||by+br>pipe.topH+pipe.gap+4){FLAP.over=true;flapDie();break;}
    }
  }
  for(const cl of FLAP.clouds){cl.x-=cl.v;if(cl.x<-60)cl.x=380;}
  for(const pt of FLAP.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.2;pt.a-=0.02;}
  FLAP.parts=FLAP.parts.filter(p=>p.a>0);
}
function flapDie(){
  if(FLAP.score>FLAP.best){FLAP.best=FLAP.score;store.set('flapBest',FLAP.best);}
  gSfx('bad');
  for(let i=0;i<18;i++)FLAP.parts.push({x:FLAP.bird.x,y:FLAP.bird.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-1,a:1,r:2+Math.random()*3});
}
function flapDraw(){
  const c=FLAP.ctx,W=FLAP.w,H=FLAP.h,G=FLAP.ground;
  // sky premium
  const sky=c.createLinearGradient(0,0,0,G);
  sky.addColorStop(0,'#6fc3f7');sky.addColorStop(.6,'#a8d8f0');sky.addColorStop(1,'#e6f3ff');
  c.fillStyle=sky;c.fillRect(0,0,W,G);
  // clouds
  c.fillStyle='rgba(255,255,255,.85)';
  for(const cl of FLAP.clouds){
    c.globalAlpha=0.7*cl.s;
    c.beginPath();
    c.arc(cl.x,cl.y,14*cl.s,0,7);c.arc(cl.x+18*cl.s,cl.y-6*cl.s,16*cl.s,0,7);c.arc(cl.x+36*cl.s,cl.y,12*cl.s,0,7);
    c.rect(cl.x-6*cl.s,cl.y,48*cl.s,10*cl.s);c.fill();
  }
  c.globalAlpha=1;
  // pipes premium with 3D
  for(const pipe of FLAP.pipes){
    const x=pipe.x;
    // top pipe
    const topGrad=c.createLinearGradient(x,0,x+50,0);
    topGrad.addColorStop(0,'#2f7a45');topGrad.addColorStop(.5,'#5fbf6f');topGrad.addColorStop(1,'#2f7a45');
    c.fillStyle=topGrad;
    c.beginPath();c.roundRect(x,0,50,pipe.topH,8);c.fill();
    c.fillStyle='#3f9e52';c.beginPath();c.roundRect(x-4,pipe.topH-16,58,18,6);c.fill();
    c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.roundRect(x+6,8,8,pipe.topH-28,3);c.fill();
    // bottom pipe
    const by=pipe.topH+pipe.gap;
    c.fillStyle=topGrad;
    c.beginPath();c.roundRect(x,by,50,G-by,8);c.fill();
    c.fillStyle='#3f9e52';c.beginPath();c.roundRect(x-4,by,58,18,6);c.fill();
    c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.roundRect(x+6,by+8,8,80,3);c.fill();
    // cap shine
    c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;c.beginPath();c.roundRect(x,0,50,pipe.topH,8);c.stroke();
    c.beginPath();c.roundRect(x,by,50,G-by,8);c.stroke();
  }
  // ground
  c.fillStyle='#e7c27d';c.fillRect(0,G,W,H-G);
  c.fillStyle='#c9a06a';c.fillRect(0,G,W,4);
  // ground pattern
  c.fillStyle='rgba(0,0,0,.08)';
  for(let i=0;i<W;i+=28){c.fillRect((i+FLAP.t*0.3)%W,G+10,16,2.5);}
  // bird coffee cup premium
  const b=FLAP.bird;
  c.save();
  c.translate(b.x,b.y);c.rotate(b.rot);
  c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=10;c.shadowOffsetY=4;
  // cup body
  const cupGrad=c.createLinearGradient(-14,-12,14,12);
  cupGrad.addColorStop(0,'#fff7e0');cupGrad.addColorStop(1,'#f0c75e');
  c.fillStyle=cupGrad;
  c.beginPath();c.roundRect(-14,-12,28,22,8);c.fill();
  c.fillStyle='#7a4a1e';c.beginPath();c.roundRect(-12,-10,24,4,2);c.fill();
  // handle
  c.strokeStyle='#d9ae3e';c.lineWidth=3;c.beginPath();c.arc(16,0,7,-1,1);c.stroke();
  // eyes
  c.fillStyle='#fff';c.beginPath();c.arc(-4,-2,5,0,7);c.fill();c.beginPath();c.arc(6,-2,5,0,7);c.fill();
  c.fillStyle='#1d2b3a';c.beginPath();c.arc(-2,0,2.2,0,7);c.fill();c.beginPath();c.arc(8,0,2.2,0,7);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(-1,-1.5,0.9,0,7);c.fill();c.beginPath();c.arc(9,-1.5,0.9,0,7);c.fill();
  // blush
  c.fillStyle='rgba(255,140,160,.45)';c.beginPath();c.arc(-8,6,2.2,0,7);c.fill();c.beginPath();c.arc(10,6,2.2,0,7);c.fill();
  c.restore();
  // particles
  for(const pt of FLAP.parts){
    c.globalAlpha=pt.a;c.fillStyle='#f0c75e';c.beginPath();c.arc(pt.x,pt.y,pt.r,0,7);c.fill();
  }
  c.globalAlpha=1;
  // score
  c.textAlign='center';
  c.fillStyle='#fff';c.font='900 42px Vazirmatn';c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=8;
  c.fillText(gNum(FLAP.score),W/2,86);
  c.shadowBlur=0;
  c.fillStyle='rgba(255,255,255,.75)';c.font='700 12px Vazirmatn';c.fillText('رکورد '+gNum(FLAP.best),W/2,106);
  if(FLAP.over){
    c.fillStyle='rgba(6,10,26,.55)';c.fillRect(0,0,W,H);
    c.textAlign='center';c.fillStyle='#ffd76e';c.font='900 32px Vazirmatn';c.fillText('افتادی!',W/2,H/2-28);
    c.fillStyle='#fff';c.font='800 18px Vazirmatn';c.fillText('امتیاز: '+gNum(FLAP.score)+' — رکورد: '+gNum(FLAP.best),W/2,H/2+6);
    c.fillStyle='#a9bad4';c.font='600 13px Vazirmatn';c.fillText('Space یا کلیک = دوباره',W/2,H/2+36);
  }
}
function flapFrame(now){
  if(!FLAP.on)return;
  const dt=Math.min(32,now-(FLAP.last||now));FLAP.last=now;
  flapUpdate(dt);flapDraw();
  FLAP.raf=requestAnimationFrame(flapFrame);
}
const flapEng={
  start(cv){flapInit(cv);if(FLAP.raf)cancelAnimationFrame(FLAP.raf);FLAP.on=true;flapReset();FLAP.last=0;FLAP.raf=requestAnimationFrame(flapFrame);
    cv.onclick=()=>flapFlap();
  },
  stop(){FLAP.on=false;if(FLAP.raf)cancelAnimationFrame(FLAP.raf);FLAP.raf=0;if(FLAP.cv)FLAP.cv.onclick=null;},
  key(e){if(e.key===' '||e.key==='Enter'||e.key==='ArrowUp'){e.preventDefault();flapFlap();return true;}return false;}
};

/* ================================================================
   بریک‌اوت — Breakout Premium
   ================================================================ */
const BRK={
  cv:null,ctx:null,w:400,h:480,on:false,over:false,raf:0,last:0,
  paddle:{x:160,w:84,h:12},ball:{x:200,y:300,vx:2.6,vy:-3.2,r:7,trail:[]},
  bricks:[],score:0,best:0,lives:3,parts:[]
};
function brkInit(cv){
  BRK.best=store.get('brkBest',0);
  BRK.cv=cv;
  const s=gCanvas(cv,400,480,400);
  BRK.ctx=s.ctx;BRK.w=s.w;BRK.h=s.h;
}
function brkReset(){
  BRK.paddle={x:158,w:84,h:12};
  BRK.ball={x:200,y:320,vx:(Math.random()<0.5?1:-1)*2.6,vy:-3.4,r:7,trail:[]};
  BRK.bricks=[];
  const colors=['#4fc3f7','#8b7bd8','#f0c75e','#4db6ac','#ef9a9a','#aed581'];
  for(let r=0;r<6;r++)for(let c=0;c<8;c++){
    BRK.bricks.push({x:c*48+8,y:r*22+48,w:44,h:16,col:colors[r],hp:1});
  }
  BRK.score=0;BRK.lives=3;BRK.over=false;BRK.parts=[];
}
function brkUpdate(dt){
  if(BRK.over)return;
  const b=BRK.ball,p=BRK.paddle;
  b.x+=b.vx;b.y+=b.vy;
  b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>10)b.trail.pop();
  if(b.x-b.r<0){b.x=b.r;b.vx*=-1;gSfx('click');}
  if(b.x+b.r>BRK.w){b.x=BRK.w-b.r;b.vx*=-1;gSfx('click');}
  if(b.y-b.r<0){b.y=b.r;b.vy*=-1;gSfx('click');}
  if(b.y+b.r>BRK.h){
    BRK.lives--;gSfx('bad');
    if(BRK.lives<=0){BRK.over=true;if(BRK.score>BRK.best){BRK.best=BRK.score;store.set('brkBest',BRK.best);}}
    else{BRK.ball={x:p.x+p.w/2,y:300,vx:(Math.random()<0.5?1:-1)*2.6,vy:-3.4,r:7,trail:[]};}
    return;
  }
  // paddle
  if(b.y+b.r>p.y&&b.y-b.r<p.y+p.h&&b.x>p.x&&b.x<p.x+p.w){
    const hit=(b.x-(p.x+p.w/2))/(p.w/2);
    b.vx=hit*4.2;
    b.vy=-Math.abs(b.vy);
    b.y=p.y-b.r;
    gSfx('move');
  }
  // bricks
  for(let i=BRK.bricks.length-1;i>=0;i--){
    const br=BRK.bricks[i];
    if(b.x+b.r>br.x&&b.x-b.r<br.x+br.w&&b.y+b.r>br.y&&b.y-b.r<br.y+br.h){
      BRK.bricks.splice(i,1);
      BRK.score+=10;
      b.vy*=-1;
      gSfx('line');
      for(let k=0;k<8;k++)BRK.parts.push({x:br.x+br.w/2,y:br.y+br.h/2,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4-1,a:1,col:br.col});
      if(!BRK.bricks.length){BRK.over=true;if(BRK.score>BRK.best){BRK.best=BRK.score;store.set('brkBest',BRK.best);}}
      break;
    }
  }
  for(const pt of BRK.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.15;pt.a-=0.02;}
  BRK.parts=BRK.parts.filter(p=>p.a>0);
}
function brkDraw(){
  const c=BRK.ctx,W=BRK.w,H=BRK.h;
  const bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0d1730');bg.addColorStop(1,'#0a1226');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  // bricks premium
  for(const br of BRK.bricks){
    const grad=c.createLinearGradient(br.x,br.y,br.x,br.y+br.h);
    grad.addColorStop(0,br.col);grad.addColorStop(1,br.col+'aa');
    c.fillStyle=grad;
    c.beginPath();c.roundRect(br.x,br.y,br.w,br.h,5);c.fill();
    c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.roundRect(br.x+3,br.y+2,br.w*0.4,4,2);c.fill();
    c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;c.beginPath();c.roundRect(br.x,br.y,br.w,br.h,5);c.stroke();
  }
  // paddle premium with glow
  const p=BRK.paddle;
  c.shadowColor='rgba(240,199,94,.5)';c.shadowBlur=14;
  const pg=c.createLinearGradient(p.x,p.y,p.x,p.y+p.h);
  pg.addColorStop(0,'#ffe9a8');pg.addColorStop(1,'#f0c75e');
  c.fillStyle=pg;c.beginPath();c.roundRect(p.x,p.y,p.w,p.h,6);c.fill();
  c.shadowBlur=0;
  // ball trail
  const b=BRK.ball;
  for(let i=b.trail.length-1;i>=0;i--){
    const t=b.trail[i];
    c.globalAlpha=(i/b.trail.length)*0.3;
    c.fillStyle='#f0c75e';c.beginPath();c.arc(t.x,t.y,b.r*(0.5+i*0.05),0,7);c.fill();
  }
  c.globalAlpha=1;
  c.fillStyle='#fff';c.shadowColor='rgba(255,255,255,.6)';c.shadowBlur=10;
  c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.fill();
  c.shadowBlur=0;
  // particles
  for(const pt of BRK.parts){c.globalAlpha=pt.a;c.fillStyle=pt.col;c.beginPath();c.arc(pt.x,pt.y,2.5,0,7);c.fill();}
  c.globalAlpha=1;
  // UI
  c.fillStyle='#eaf1fb';c.font='800 15px Vazirmatn';c.textAlign='left';c.fillText('امتیاز '+gNum(BRK.score),12,24);
  c.fillStyle='#a9bad4';c.font='600 12px Vazirmatn';c.fillText('رکورد '+gNum(BRK.best)+' · جان '+gNum(BRK.lives),12,42);
  if(BRK.over){
    c.fillStyle='rgba(6,10,26,.6)';c.fillRect(0,0,W,H);
    c.textAlign='center';
    c.fillStyle=BRK.bricks.length?'#e08b85':'#7ee2a8';c.font='900 28px Vazirmatn';
    c.fillText(BRK.bricks.length?'باختی!':'بردی! همه آجرها شکست!',W/2,H/2-20);
    c.fillStyle='#fff';c.font='800 15px Vazirmatn';c.fillText('امتیاز: '+gNum(BRK.score),W/2,H/2+12);
    c.fillStyle='#a9bad4';c.font='600 12px Vazirmatn';c.fillText('Enter = دوباره',W/2,H/2+38);
  }
}
function brkFrame(now){
  if(!BRK.on)return;
  const dt=Math.min(32,now-(BRK.last||now));BRK.last=now;
  brkUpdate(dt);brkDraw();
  BRK.raf=requestAnimationFrame(brkFrame);
}
const brkEng={
  start(cv){
    brkInit(cv);if(BRK.raf)cancelAnimationFrame(BRK.raf);BRK.on=true;brkReset();BRK.last=0;BRK.raf=requestAnimationFrame(brkFrame);
    const move=e=>{
      const r=cv.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width*BRK.w;
      BRK.paddle.x=Math.max(0,Math.min(BRK.w-BRK.paddle.w,x-BRK.paddle.w/2));
    };
    BRK.mm=move;cv.addEventListener('pointermove',move);
  },
  stop(){BRK.on=false;if(BRK.raf)cancelAnimationFrame(BRK.raf);BRK.raf=0;if(BRK.cv&&BRK.mm)BRK.cv.removeEventListener('pointermove',BRK.mm);},
  key(e){
    if(e.key==='ArrowLeft'){e.preventDefault();BRK.paddle.x=Math.max(0,BRK.paddle.x-18);return true;}
    if(e.key==='ArrowRight'){e.preventDefault();BRK.paddle.x=Math.min(BRK.w-BRK.paddle.w,BRK.paddle.x+18);return true;}
    if(e.key==='Enter'&&BRK.over){brkReset();return true;}
    return false;
  }
};

/* ================================================================
   مین‌یاب پرمیوم — Minesweeper
   ================================================================ */
const MINES={el:null,rows:9,cols:9,mines:12,grid:[],over:false,win:false,time:0,timer:null,flags:0,best:9999};
function minesInit(){
  MINES.best=store.get('minesBest',9999);
}
function minesReset(){
  minesInit();
  MINES.grid=Array.from({length:MINES.rows},()=>Array.from({length:MINES.cols},()=>({mine:false,open:false,flag:false,n:0})));
  MINES.over=false;MINES.win=false;MINES.time=0;MINES.flags=0;
  // place mines
  let placed=0;
  while(placed<MINES.mines){
    const r=Math.floor(Math.random()*MINES.rows),c=Math.floor(Math.random()*MINES.cols);
    if(!MINES.grid[r][c].mine){MINES.grid[r][c].mine=true;placed++;}
  }
  // numbers
  for(let r=0;r<MINES.rows;r++)for(let c=0;c<MINES.cols;c++){
    if(MINES.grid[r][c].mine)continue;
    let n=0;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      const rr=r+dr,cc=c+dc;
      if(rr>=0&&rr<MINES.rows&&cc>=0&&cc<MINES.cols&&MINES.grid[rr][cc].mine)n++;
    }
    MINES.grid[r][c].n=n;
  }
  if(MINES.timer)clearInterval(MINES.timer);
  MINES.timer=setInterval(()=>{if(!MINES.over&&!MINES.win&&MINES.el){MINES.time++;const te=MINES.el.querySelector('.mines-time');if(te)te.textContent=gNum(MINES.time)+' ثانیه';}},1000);
  minesRender();
}
function minesOpen(r,c){
  if(MINES.over||MINES.win)return;
  const cell=MINES.grid[r][c];
  if(cell.open||cell.flag)return;
  cell.open=true;
  if(cell.mine){
    MINES.over=true;clearInterval(MINES.timer);gSfx('bad');
    minesRender(true);
    return;
  }
  gSfx('click');
  if(cell.n===0){
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      const rr=r+dr,cc=c+dc;
      if(rr>=0&&rr<MINES.rows&&cc>=0&&cc<MINES.cols&&!MINES.grid[rr][cc].open)minesOpen(rr,cc);
    }
  }
  // win check
  let closed=0;
  for(let rr=0;rr<MINES.rows;rr++)for(let cc=0;cc<MINES.cols;cc++)if(!MINES.grid[rr][cc].open&&!MINES.grid[rr][cc].mine)closed++;
  if(closed===0){
    MINES.win=true;clearInterval(MINES.timer);gSfx('win');
    if(MINES.time<MINES.best){MINES.best=MINES.time;store.set('minesBest',MINES.best);}
    toast('بردی! زمان: '+gNum(MINES.time)+' ثانیه','trophy');
  }
  minesRender();
}
function minesFlag(r,c,e){
  if(e)e.preventDefault();
  if(MINES.over||MINES.win)return;
  const cell=MINES.grid[r][c];
  if(cell.open)return;
  cell.flag=!cell.flag;
  gSfx('move');
  minesRender();
}
function minesRender(showMines){
  const el=MINES.el;if(!el)return;
  const colors={1:'#4fc3f7',2:'#7ec8a0',3:'#f0c75e',4:'#ba68c8',5:'#ef9a9a',6:'#4db6ac',7:'#aab8dd',8:'#e0e0e0'};
  let h='<div class="mines-top"><span class="ttt-sc">مین '+gNum(MINES.mines-MINES.grid.flat().filter(c=>c.flag).length)+'</span><span class="ttt-sc mines-time">'+gNum(MINES.time)+' ثانیه</span><span class="ttt-sc">رکورد '+gNum(MINES.best===9999?'—':MINES.best)+'</span></div>';
  h+='<div class="mines-grid">';
  for(let r=0;r<MINES.rows;r++){
    for(let c=0;c<MINES.cols;c++){
      const cell=MINES.grid[r][c];
      let cls='mines-c';
      if(cell.open)cls+=' open';
      if(cell.flag)cls+=' flag';
      if(showMines&&cell.mine)cls+=' mine';
      let txt='';
      if(cell.flag)txt='F';
      else if(cell.open){
        if(cell.mine)txt='M';
        else if(cell.n)txt=gNum(cell.n);
      }
      const col=cell.open&&cell.n?colors[cell.n]||'#fff':'';
      h+='<button class="'+cls+'" data-r="'+r+'" data-c="'+c+'" style="'+(col?'color:'+col:'')+'" oncontextmenu="return false;">'+txt+'</button>';
    }
  }
  h+='</div>';
  if(MINES.over)h+='<div class="g48-msg lose">باختی! مین خوردی — Enter = دوباره</div>';
  if(MINES.win)h+='<div class="g48-msg win">همه مین‌ها پیدا شد! زمان '+gNum(MINES.time)+' ثانیه — Enter = دوباره</div>';
  el.innerHTML=h;
  el.querySelectorAll('.mines-c').forEach(btn=>{
    const r=+btn.dataset.r,c=+btn.dataset.c;
    btn.onclick=()=>minesOpen(r,c);
    btn.oncontextmenu=e=>{minesFlag(r,c,e);return false;};
    btn.addEventListener('touchstart',e=>{btn._t=setTimeout(()=>minesFlag(r,c,e),500);});
    btn.addEventListener('touchend',()=>clearTimeout(btn._t));
  });
}
const minesEng={
  start(el){MINES.el=el;minesReset();},
  stop(){if(MINES.timer)clearInterval(MINES.timer);MINES.el=null;},
  key(e){if(e.key==='Enter'&&(MINES.over||MINES.win)){minesReset();return true;}return false;}
};

/* ================================================================
   حباب‌پاپ — Bubble Pop Premium
   ================================================================ */
const BUB={
  cv:null,ctx:null,w:400,h:500,on:false,over:false,raf:0,last:0,
  bubbles:[],score:0,best:0,time:30,t:0,parts:[],combo:0
};
function bubInit(cv){
  BUB.best=store.get('bubBest',0);
  BUB.cv=cv;
  const s=gCanvas(cv,400,500,400);
  BUB.ctx=s.ctx;BUB.w=s.w;BUB.h=s.h;
}
function bubReset(){
  BUB.bubbles=[];BUB.score=0;BUB.time=30;BUB.t=0;BUB.over=false;BUB.parts=[];BUB.combo=0;
  for(let i=0;i<8;i++)bubAdd();
}
function bubAdd(){
  const r=18+Math.random()*22;
  const x=r+Math.random()*(BUB.w-r*2);
  const y=BUB.h+r+Math.random()*120;
  const col=['#4fc3f7','#f0c75e','#7ec8a0','#ba68c8','#ef9a9a','#aed581'][Math.floor(Math.random()*6)];
  BUB.bubbles.push({x:x,y:y,r:r,vx:(Math.random()-0.5)*0.6,vy:-(1.2+Math.random()*1.8),col:col,wob:Math.random()*6.28,pop:0});
}
function bubUpdate(dt){
  if(BUB.over)return;
  BUB.t+=dt;
  BUB.time-=dt/1000;
  if(BUB.time<=0){BUB.over=true;if(BUB.score>BUB.best){BUB.best=BUB.score;store.set('bubBest',BUB.best);}return;}
  for(const b of BUB.bubbles){
    b.wob+=dt*0.004;
    b.x+=b.vx+Math.sin(b.wob)*0.6;
    b.y+=b.vy;
    if(b.pop>0)b.pop-=dt*0.005;
  }
  BUB.bubbles=BUB.bubbles.filter(b=>b.y+b.r>-20);
  while(BUB.bubbles.length<10)bubAdd();
  for(const pt of BUB.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.12;pt.a-=0.025;}
  BUB.parts=BUB.parts.filter(p=>p.a>0);
  if(BUB.combo>0)BUB.combo=Math.max(0,BUB.combo-dt*0.001);
}
function bubPopAt(x,y){
  for(let i=BUB.bubbles.length-1;i>=0;i--){
    const b=BUB.bubbles[i];
    const dx=x-b.x,dy=y-b.y;
    if(dx*dx+dy*dy<b.r*b.r){
      BUB.bubbles.splice(i,1);
      BUB.score+=Math.round(10+b.r*0.3+BUB.combo*5);
      BUB.combo=Math.min(10,BUB.combo+1);
      gSfx('match');
      for(let k=0;k<12;k++)BUB.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5-1,a:1,col:b.col});
      bubAdd();
      return true;
    }
  }
  BUB.combo=0;
  return false;
}
function bubDraw(){
  const c=BUB.ctx,W=BUB.w,H=BUB.h;
  const bg=c.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0d1b33');bg.addColorStop(1,'#091223');
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  // bubbles premium with gradient and shine
  for(const b of BUB.bubbles){
    c.save();
    c.translate(b.x,b.y);
    const scale=1+(b.pop||0)*0.3;
    c.scale(scale,scale);
    c.shadowColor=b.col;c.shadowBlur=18;
    const grad=c.createRadialGradient(-b.r*0.3,-b.r*0.3,b.r*0.2,0,0,b.r);
    grad.addColorStop(0,'rgba(255,255,255,.85)');grad.addColorStop(.2,b.col);grad.addColorStop(1,b.col+'88');
    c.fillStyle=grad;
    c.beginPath();c.arc(0,0,b.r,0,7);c.fill();
    c.shadowBlur=0;
    c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-b.r*0.28,-b.r*0.28,b.r*0.28,b.r*0.18, -0.4,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(b.r*0.2,-b.r*0.2,b.r*0.12,0,7);c.fill();
    c.restore();
  }
  for(const pt of BUB.parts){c.globalAlpha=pt.a;c.fillStyle=pt.col;c.beginPath();c.arc(pt.x,pt.y,2.8,0,7);c.fill();}
  c.globalAlpha=1;
  // UI premium
  c.fillStyle='#eaf1fb';c.font='800 18px Vazirmatn';c.textAlign='left';c.fillText('امتیاز '+gNum(BUB.score),14,30);
  c.fillStyle='#f0c75e';c.font='800 14px Vazirmatn';c.fillText('کمبو ×'+gNum(Math.floor(BUB.combo)),14,52);
  c.fillStyle='#a9bad4';c.font='600 13px Vazirmatn';c.textAlign='right';c.fillText('زمان '+gNum(Math.max(0,Math.ceil(BUB.time))),W-14,30);
  c.fillStyle='#7ec8a0';c.textAlign='left';c.fillText('رکورد '+gNum(BUB.best),14,72);
  // time bar
  const pct=Math.max(0,BUB.time/30);
  c.fillStyle='rgba(148,180,224,.12)';c.beginPath();c.roundRect(14,H-14,W-28,8,4);c.fill();
  c.fillStyle='#f0c75e';c.beginPath();c.roundRect(14,H-14,(W-28)*pct,8,4);c.fill();
  if(BUB.over){
    c.fillStyle='rgba(6,10,26,.6)';c.fillRect(0,0,W,H);
    c.textAlign='center';c.fillStyle='#ffd76e';c.font='900 30px Vazirmatn';c.fillText('زمان تمام!',W/2,H/2-24);
    c.fillStyle='#fff';c.font='800 17px Vazirmatn';c.fillText('امتیاز: '+gNum(BUB.score)+' — رکورد: '+gNum(BUB.best),W/2,H/2+10);
    c.fillStyle='#a9bad4';c.font='600 13px Vazirmatn';c.fillText('Enter = دوباره',W/2,H/2+38);
  }
}
function bubFrame(now){
  if(!BUB.on)return;
  const dt=Math.min(32,now-(BUB.last||now));BUB.last=now;
  bubUpdate(dt);bubDraw();
  BUB.raf=requestAnimationFrame(bubFrame);
}
const bubEng={
  start(cv){
    bubInit(cv);if(BUB.raf)cancelAnimationFrame(BUB.raf);BUB.on=true;bubReset();BUB.last=0;BUB.raf=requestAnimationFrame(bubFrame);
    const handler=e=>{
      const r=cv.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width*BUB.w;
      const y=(e.clientY-r.top)/r.height*BUB.h;
      bubPopAt(x,y);
    };
    BUB.hnd=handler;cv.addEventListener('pointerdown',handler);
  },
  stop(){BUB.on=false;if(BUB.raf)cancelAnimationFrame(BUB.raf);BUB.raf=0;if(BUB.cv&&BUB.hnd)BUB.cv.removeEventListener('pointerdown',BUB.hnd);},
  key(e){if(e.key==='Enter'&&BUB.over){bubReset();return true;}return false;}
};

/* ---------- ثبت ---------- */
Object.assign(GAME_ENG,{
  'flappy':flapEng,'breakout':brkEng,'mines':minesEng,'bubble':bubEng
});
