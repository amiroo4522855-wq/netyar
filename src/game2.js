/* ===== بازی‌های کافی‌نت ۲ — تتریس، ۲۰۴۸، مار، دوز، حافظه، RPS، ری‌اکشن، سکه، تاس، پازل، واژه‌یاب، شطرنج ===== */
'use strict';

/* ---------- کمکی ---------- */
function gCanvas(cv,lw,lh,maxW){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=lw*dpr;cv.height=lh*dpr;
  cv.style.width='100%';cv.style.maxWidth=(maxW||lw)+'px';cv.style.aspectRatio=lw+'/'+lh;
  const ctx=cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return{ctx:ctx,w:lw,h:lh};
}
let GSFX=null,GSCTX=null;
function gSfxOn(){if(GSFX===null)GSFX=store.get('gSfx',true);return GSFX;}
function gSfxToggle(){GSFX=!gSfxOn();store.set('gSfx',GSFX);return GSFX;}
function gSfx(type){
  if(!gSfxOn())return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    GSCTX=GSCTX||new AC();
    if(GSCTX.state==='suspended')GSCTX.resume();
    const F={eat:560,line:700,merge:460,match:760,go:900,click:320,win:800,bad:170,move:400};
    const o=GSCTX.createOscillator(),g=GSCTX.createGain();
    o.type=type==='bad'?'sawtooth':'sine';
    o.frequency.value=F[type]||440;
    g.gain.setValueAtTime(.05,GSCTX.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,GSCTX.currentTime+.13);
    o.connect(g);g.connect(GSCTX.destination);
    o.start();o.stop(GSCTX.currentTime+.14);
  }catch(e){}
}
function gOver(el,title,sub){
  const ov=document.createElement('div');
  ov.className='gv-over';
  ov.innerHTML='<h4>'+title+'</h4><p>'+sub+'</p><button class="btn gold" data-again>'+ic('rotate-ccw',15)+'دوباره</button>';
  el.appendChild(ov);
  ov.querySelector('[data-again]').onclick=e=>{e.stopPropagation();ov.remove();};
  return ov;
}

/* ================================================================
   تتریس
   ================================================================ */
const TET={cv:null,ctx:null,w:320,h:480,on:false,over:false,raf:0,last:0,drop:0,
  grid:null,cur:null,next:null,score:0,lines:0,level:0,best:0,cells:26,flash:0,llast:0,plast:0};
const T_SHAPES=[
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]],
];
const T_COLORS=['#4fc3f7','#ffd54f','#ba68c8','#4db6ac','#ef9a9a','#ffb74d','#aed581'];
function tetInit(){TET.best=store.get('tetrisBest',0);}
function tetSpawn(){
  const id=Math.floor(Math.random()*T_SHAPES.length);
  const m=T_SHAPES[id].map(r=>r.slice());
  return{m:m,x:Math.floor((10-m[0].length)/2),y:0,c:id};
}
function tetReset(){
  tetInit();
  TET.grid=Array.from({length:20},()=>Array(10).fill(-1));
  TET.cur=tetSpawn();TET.next=tetSpawn();
  TET.score=0;TET.lines=0;TET.level=0;TET.over=false;TET.drop=0;
}
function tetCollide(m,px,py){
  for(let y=0;y<m.length;y++)for(let x=0;x<m[y].length;x++){
    if(!m[y][x])continue;
    const gx=px+x,gy=py+y;
    if(gx<0||gx>=10||gy>=20)return true;
    if(gy>=0&&TET.grid[gy][gx]>=0)return true;
  }
  return false;
}
function tetMerge(){
  const c=TET.cur;
  c.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&c.y+y>=0)TET.grid[c.y+y][c.x+x]=c.c;}));
  let cleared=0;
  for(let y=19;y>=0;y--){
    if(TET.grid[y].every(v=>v>=0)){TET.grid.splice(y,1);TET.grid.unshift(Array(10).fill(-1));cleared++;y++;}
  }
  if(cleared){
    TET.lines+=cleared;
    TET.score+=[0,100,300,500,800][cleared]*(TET.level+1);
    TET.level=Math.floor(TET.lines/8);
  }
  TET.cur=TET.next;TET.next=tetSpawn();
  if(tetCollide(TET.cur.m,TET.cur.x,TET.cur.y)){
    TET.over=true;
    if(TET.score>TET.best){TET.best=TET.score;store.set('tetrisBest',TET.best);}
  }
}
function tetRotate(){
  const c=TET.cur;
  const m=c.m[0].map((_,i)=>c.m.map(r=>r[i]).reverse());
  if(!tetCollide(m,c.x,c.y))c.m=m;
  else if(!tetCollide(m,c.x-1,c.y)){c.m=m;c.x--;}
  else if(!tetCollide(m,c.x+1,c.y)){c.m=m;c.x++;}
}
function tetMove(dx){if(!tetCollide(TET.cur.m,TET.cur.x+dx,TET.cur.y))TET.cur.x+=dx;}
function tetDrop(soft){
  if(!tetCollide(TET.cur.m,TET.cur.x,TET.cur.y+1)){TET.cur.y++;if(soft)TET.score++;}
  else tetMerge();
}
function tetHard(){while(!tetCollide(TET.cur.m,TET.cur.x,TET.cur.y+1)){TET.cur.y++;TET.score+=2;}tetMerge();}
function tetUpdate(dt){
  if(TET.over)return;
  if(TET.flash>0)TET.flash-=dt;
  if(TET.lines>(TET.llast||0)){TET.flash=170;gSfx('line');}
  TET.llast=TET.lines;
  if(TET.level>(TET.plast||0)){toast('مرحله '+gNum(TET.level+1)+'!','sparkles');gSfx('go');}
  TET.plast=TET.level;
  TET.drop+=dt;
  const iv=Math.max(90,650-TET.level*55);
  if(TET.drop>=iv){TET.drop=0;tetDrop(false);}
}
function tetDraw(){
  const c=TET.ctx,cs=TET.cells;
  const g=c.createLinearGradient(0,0,0,480);
  g.addColorStop(0,'#0d1730');g.addColorStop(1,'#0a1226');
  c.fillStyle=g;c.fillRect(0,0,320,480);
  /* شبکه */
  c.strokeStyle='rgba(148,180,224,.07)';c.lineWidth=1;
  for(let x=0;x<=10;x++){c.beginPath();c.moveTo(x*cs,0);c.lineTo(x*cs,480);c.stroke();}
  for(let y=0;y<=20;y++){c.beginPath();c.moveTo(0,y*cs);c.lineTo(260,y*cs);c.stroke();}
  const cell=(x,y,col,alpha)=>{
    c.globalAlpha=alpha||1;
    c.fillStyle=col;
    c.beginPath();c.roundRect(x*cs+1.5,y*cs+1.5,cs-3,cs-3,5);c.fill();
    c.fillStyle='rgba(255,255,255,.25)';
    c.beginPath();c.roundRect(x*cs+4,y*cs+4,cs-8,4,2);c.fill();
    c.globalAlpha=1;
  };
  for(let y=0;y<20;y++)for(let x=0;x<10;x++)if(TET.grid[y][x]>=0)cell(x,y,T_COLORS[TET.grid[y][x]]);
  if(TET.cur&&!TET.over){
    /* روحِ محل فرود */
    let gy=TET.cur.y;
    while(!tetCollide(TET.cur.m,TET.cur.x,gy+1))gy++;
    if(gy>TET.cur.y)TET.cur.m.forEach((row,y)=>row.forEach((v,x)=>{
      if(v&&gy+y>=0){c.globalAlpha=.22;c.fillStyle=T_COLORS[TET.cur.c];c.beginPath();c.roundRect((TET.cur.x+x)*cs+2.5,(gy+y)*cs+2.5,cs-5,cs-5,5);c.fill();c.globalAlpha=1;}
    }));
    TET.cur.m.forEach((row,y)=>row.forEach((v,x)=>{if(v&&TET.cur.y+y>=0)cell(TET.cur.x+x,TET.cur.y+y,T_COLORS[TET.cur.c]);}));
  }
  if(TET.flash>0){c.fillStyle='rgba(255,235,170,'+(TET.flash/170*.25)+')';c.fillRect(0,0,260,480);}
  /* پنل */
  c.fillStyle='rgba(148,180,224,.05)';c.beginPath();c.roundRect(266,10,46,460,10);c.fill();
  c.fillStyle='#eaf1fb';c.font='800 13px Vazirmatn';c.textAlign='center';
  c.fillText('امتیاز',289,36);c.fillStyle='#f0c75e';c.font='900 15px Vazirmatn';c.fillText(gNum(TET.score),289,56);
  c.fillStyle='#eaf1fb';c.font='800 12px Vazirmatn';c.fillText('خط',289,88);c.fillStyle='#7ee2a8';c.fillText(gNum(TET.lines),289,106);
  c.fillStyle='#eaf1fb';c.font='800 12px Vazirmatn';c.fillText('مرحله',289,138);c.fillStyle='#6ea8f0';c.fillText(gNum(TET.level+1),289,156);
  c.fillStyle='#a9bad4';c.font='700 11px Vazirmatn';c.fillText('بعدی',289,190);
  if(TET.next){
    const m=TET.next.m,off=(4-m[0].length)*6;
    m.forEach((row,y)=>row.forEach((v,x)=>{if(v){c.fillStyle=T_COLORS[TET.next.c];c.beginPath();c.roundRect(270+off+x*9,200+y*9,8,8,2);c.fill();}}));
  }
  c.fillStyle='#a9bad4';c.font='700 11px Vazirmatn';
  c.fillText('رکورد',289,300);c.fillStyle='#fff';c.font='900 13px Vazirmatn';c.fillText(gNum(TET.best),289,320);
  if(TET.over){
    c.fillStyle='rgba(6,10,26,.6)';c.fillRect(0,0,320,480);
    c.textAlign='center';c.fillStyle='#ffd76e';c.font='900 26px Vazirmatn';
    c.fillText('بازی تمام!',130,200);
    c.fillStyle='#fff';c.font='800 15px Vazirmatn';
    c.fillText('امتیاز: '+gNum(TET.score),130,230);
    c.fillStyle='#a9bad4';c.font='600 12px Vazirmatn';
    c.fillText('Enter = دوباره',130,258);
  }
}
function tetFrame(now){
  if(!TET.on)return;
  const dt=Math.min(50,now-(TET.last||now));TET.last=now;
  tetUpdate(dt);tetDraw();
  TET.raf=requestAnimationFrame(tetFrame);
}
const tetEng={
  start(cv){tetInit();TET.cv=cv;const s=gCanvas(cv,320,480,320);TET.ctx=s.ctx;
    if(TET.raf)cancelAnimationFrame(TET.raf);
    TET.on=true;tetReset();TET.last=0;TET.raf=requestAnimationFrame(tetFrame);},
  stop(){TET.on=false;if(TET.raf)cancelAnimationFrame(TET.raf);TET.raf=0;},
  key(e){
    if(TET.over&&(e.key==='Enter'||e.key===' ')){e.preventDefault();tetReset();return true;}
    switch(e.key){
      case 'ArrowLeft':e.preventDefault();if(TET.on&&!TET.over)tetMove(-1);return true;
      case 'ArrowRight':e.preventDefault();if(TET.on&&!TET.over)tetMove(1);return true;
      case 'ArrowDown':e.preventDefault();if(TET.on&&!TET.over)tetDrop(true);return true;
      case 'ArrowUp':e.preventDefault();if(TET.on&&!TET.over)tetRotate();return true;
      case ' ':e.preventDefault();if(TET.on&&!TET.over)tetHard();return true;
      case 'Enter':if(TET.over){tetReset();return true;}return true;
    }
    return false;
  },
};

/* ================================================================
   ۲۰۴۸
   ================================================================ */
const G48={el:null,score:0,best:0,board:null,won:false,over:false,gainFx:0,fx:{m:[],born:-1}};
function g48Init(){G48.best=store.get('g2048Best',0);}
function g48Add(){
  const b=G48.board;
  const empty=[];b.forEach((v,i)=>{if(!v)empty.push(i);});
  if(!empty.length)return;
  const i=empty[Math.floor(Math.random()*empty.length)];
  b[i]=Math.random()<0.9?2:4;
  return i;
}
function g48Reset(){
  g48Init();
  G48.board=Array(16).fill(0);
  G48.score=0;G48.won=false;G48.over=false;
  g48Add();g48Add();g48Render();
}
function g48Row(idx){
  /* برمی‌گرداند ردیف/ستون به‌صورت آرایه ۴تایی؛ rev برای ستون‌ها */
  const b=G48.board;
  return [0,1,2,3].map(i=>b[idx(i)]);
}
function g48Slide(line){
  let arr=line.filter(v=>v);
  let moved=false,gain=0;
  const out=[],merged=[];
  for(let i=0;i<arr.length;i++){
    if(arr[i]===arr[i+1]){out.push(arr[i]*2);merged.push(out.length-1);gain+=arr[i]*2;if(arr[i]*2===2048)G48.won=true;i++;}
    else out.push(arr[i]);
  }
  while(out.length<4)out.push(0);
  for(let i=0;i<4;i++)if(out[i]!==line[i])moved=true;
  return{out:out,moved:moved,gain:gain,merged:merged};
}
function g48Move(dir){
  /* dir: 0=چپ 1=راست 2=بالا 3=پایین */
  if(G48.over)return;
  const b=G48.board;
  const prev=b.slice();
  let moved=false,gain=0;const mergedCells=[];
  for(let l=0;l<4;l++){
    let idxs;
    if(dir<2)idxs=[0,1,2,3].map(i=>l*4+(dir===0?i:3-i));
    else idxs=[0,1,2,3].map(i=>(dir===2?i:3-i)*4+l);
    const line=idxs.map(i=>b[i]);
    const r=g48Slide(line);
    if(r.moved){
      moved=true;
      G48.score+=r.gain;gain+=r.gain;
      mergedCells.push(...r.merged.map(k=>idxs[k]));
      idxs.forEach((bi,i)=>b[bi]=r.out[i]);
    }
  }
  if(moved){
    if(gain>0)gSfx('merge');
    g48Add();
    let born=-1;
    prev.forEach((v,i)=>{if(v===0&&b[i]>0)born=i;});
    G48.fx={m:mergedCells,born:born};
    G48.gainFx=gain;
    if(G48.score>G48.best){G48.best=G48.score;store.set('g2048Best',G48.best);}
    if(!g48Can()){G48.over=true;store.set('g2048Best',G48.best);}
    g48Render();
  }
}
function g48Can(){
  const b=G48.board;
  for(let i=0;i<16;i++){
    if(!b[i])return true;
    const r=Math.floor(i/4),c=i%4;
    if(c<3&&b[i]===b[i+1])return true;
    if(r<3&&b[i]===b[i+4])return true;
  }
  return false;
}
function g48Render(win){
  const el=G48.el;if(!el)return;
  const C={2:'#7ec8f0',4:'#6ea8f0',8:'#8b7bd8',16:'#b58ad8',32:'#d97fb0',64:'#e07a7a',
    128:'#e09a6a',256:'#e0b45f',512:'#d9c34e',1024:'#a8d05a',2048:'#5ec9a0'};
  let h='<div class="g48-top"><span class="g48-sc">امتیاز <b>'+gNum(G48.score)+'</b></span><span class="g48-sc">رکورد <b>'+gNum(G48.best)+'</b></span>'
    +(G48.gainFx>0?'<span class="g48-float">+'+gNum(G48.gainFx)+'</span>':'')+'</div><div class="g48-grid'+(G48.over?' done':'')+'">';
  G48.board.forEach((v,i)=>{
    const fx=(G48.fx&&G48.fx.m.includes(i)?' pop':'')+(G48.fx&&i===G48.fx.born?' born':'');
    if(v)h+='<div class="g48-tile v'+Math.min(v,2048)+fx+'">'+gNum(v)+'</div>';
    else h+='<div class="g48-tile empty"></div>';
  });
  h+='</div>';
  if(win&&!G48.over)h+='<div class="g48-msg win">۲۰۴۸ ساختی! ادامه بده…</div>';
  if(G48.over)h+='<div class="g48-msg lose">جای خالی نماند! — Enter = از نو</div>';
  el.innerHTML=h;
  G48.gainFx=0;G48.fx={m:[],born:-1};
}
const g48Eng={
  start(el){g48Init();G48.el=el;G48.best=store.get('g2048Best',0);g48Reset();
    /* سوایپ لمسی */
    let sx=0,sy=0;
    el.ontouchstart=e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;};
    el.ontouchend=e=>{
      const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
      if(Math.abs(dx)<24&&Math.abs(dy)<24)return;
      if(Math.abs(dx)>Math.abs(dy))g48Move(dx>0?1:0);else g48Move(dy>0?3:2);
    };},
  stop(){G48.el=null;},
  key(e){
    const map={ArrowLeft:0,ArrowRight:1,ArrowUp:2,ArrowDown:3};
    if(map[e.key]!==undefined){e.preventDefault();g48Move(map[e.key]);return true;}
    if(e.key==='Enter'&&G48.over){g48Reset();return true;}
    return false;
  },
};

/* ================================================================
   مار
   ================================================================ */
const SNK={cv:null,ctx:null,on:false,over:false,raf:0,last:0,acc:0,
  snake:[],dir:[1,0],ndir:[1,0],prev:null,pop:0,food:null,score:0,best:0,cell:25,cols:22,rows:16,t:0};
function snkInit(){SNK.best=store.get('snakeBest',0);}
function snkReset(){
  snkInit();
  SNK.snake=[{x:5,y:8},{x:4,y:8},{x:3,y:8}];
  SNK.dir=[1,0];SNK.ndir=[1,0];SNK.score=0;SNK.over=false;SNK.acc=0;SNK.t=0;SNK.prev=null;SNK.pop=0;
  snkFood();
}
function snkFood(){
  while(true){
    const f={x:Math.floor(Math.random()*SNK.cols),y:Math.floor(Math.random()*SNK.rows)};
    if(!SNK.snake.some(s=>s.x===f.x&&s.y===f.y)){SNK.food=f;return;}
  }
}
function snkUpdate(dt){
  if(SNK.over)return;
  SNK.t+=dt;
  if(SNK.pop)SNK.pop=Math.max(0,SNK.pop-dt/200);
  SNK.acc+=dt;
  const iv=Math.max(80,160-Math.floor(SNK.score/4)*8);
  if(SNK.acc<iv)return;
  SNK.acc=0;
  SNK.prev=SNK.snake.map(s=>({x:s.x,y:s.y}));
  SNK.dir=SNK.ndir;
  const h={x:SNK.snake[0].x+SNK.dir[0],y:SNK.snake[0].y+SNK.dir[1]};
  if(h.x<0||h.x>=SNK.cols||h.y<0||h.y>=SNK.rows||SNK.snake.some(s=>s.x===h.x&&s.y===h.y)){
    SNK.over=true;
    gSfx('bad');
    if(SNK.score>SNK.best){SNK.best=SNK.score;store.set('snakeBest',SNK.best);}
    return;
  }
  SNK.snake.unshift(h);
  if(h.x===SNK.food.x&&h.y===SNK.food.y){SNK.score++;SNK.pop=1;gSfx('eat');snkFood();}
  else SNK.snake.pop();
}
function snkDraw(){
  const c=SNK.ctx,cs=SNK.cell,W=SNK.cols*cs,H=SNK.rows*cs;
  const g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#0d1b33');g.addColorStop(1,'#091223');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(148,180,224,.06)';
  for(let x=0;x<=SNK.cols;x++){c.beginPath();c.moveTo(x*cs,0);c.lineTo(x*cs,H);c.stroke();}
  for(let y=0;y<=SNK.rows;y++){c.beginPath();c.moveTo(0,y*cs);c.lineTo(W,y*cs);c.stroke();}
  /* غذا: قهوهٔ درخشان */
  const f=SNK.food,pulse=(1+Math.sin(SNK.t*0.006)*0.12)*(1+(SNK.pop||0)*.55);
  c.save();
  c.shadowColor='rgba(240,199,94,.8)';c.shadowBlur=12+Math.sin(SNK.t*0.008)*7;
  c.fillStyle='#f0c75e';
  c.beginPath();c.roundRect(f.x*cs+6,f.y*cs+6,(cs-12)*pulse,(cs-12)*pulse,6);c.fill();
  c.restore();
  c.fillStyle='#8b5a2b';
  c.beginPath();c.arc(f.x*cs+cs/2,f.y*cs+cs/2,4,0,7);c.fill();
  /* مار — حرکت نرم بین خانه‌ها */
  const ivc=Math.max(80,160-Math.floor(SNK.score/4)*8);
  const tt=Math.min(1,SNK.acc/ivc);
  c.save();
  c.shadowColor='rgba(126,224,150,.3)';c.shadowBlur=9;
  SNK.snake.forEach((s,i)=>{
    const pv=(SNK.prev&&SNK.prev[i])||s;
    const x=(pv.x+(s.x-pv.x)*tt)*cs, y=(pv.y+(s.y-pv.y)*tt)*cs;
    c.fillStyle='hsl(150 55% '+Math.max(30,52-i*1.4)+'%)';
    c.beginPath();c.roundRect(x+2,y+2,cs-4,cs-4,i===0?11:7);c.fill();
    if(i===0){
      c.restore();
      const dx=SNK.dir[0],dy=SNK.dir[1],px=-dy,py=dx;
      const hx=x+cs/2+dx*3,hy=y+cs/2+dy*3;
      const eye=off=>{
        c.fillStyle='#fff';c.beginPath();c.arc(hx+px*off,hy+py*off,3.2,0,7);c.fill();
        c.fillStyle='#0f2018';c.beginPath();c.arc(hx+px*off+dx*1.4,hy+py*off+dy*1.4,1.6,0,7);c.fill();
      };
      eye(4.6);eye(-4.6);
      c.strokeStyle='#e06666';c.lineWidth=1.8;c.lineCap='round';
      c.beginPath();c.moveTo(hx+dx*8,hy+dy*8);c.lineTo(hx+dx*13,hy+dy*13);c.stroke();
      c.save();c.shadowColor='rgba(126,224,150,.3)';c.shadowBlur=9;
    }
  });
  c.restore();
  /* امتیاز */
  c.fillStyle='#eaf1fb';c.font='800 16px Vazirmatn';c.textAlign='left';
  c.fillText('قهوه‌ها: '+gNum(SNK.score),14,28);
  c.fillStyle='#a9bad4';c.font='600 12px Vazirmatn';
  c.fillText('رکورد '+gNum(SNK.best),14,48);
  if(SNK.over){
    c.fillStyle='rgba(6,10,26,.6)';c.fillRect(0,0,W,H);
    c.textAlign='center';c.fillStyle='#ffd76e';c.font='900 26px Vazirmatn';
    c.fillText('مار به دیوار/خودش خورد!',W/2,H/2-20);
    c.fillStyle='#fff';c.font='800 15px Vazirmatn';
    c.fillText('قهوه‌ها: '+gNum(SNK.score)+' — رکورد: '+gNum(SNK.best),W/2,H/2+10);
    c.fillStyle='#a9bad4';c.font='600 12px Vazirmatn';
    c.fillText('Enter = از نو',W/2,H/2+36);
  }
}
function snkFrame(now){
  if(!SNK.on)return;
  const dt=Math.min(50,now-(SNK.last||now));SNK.last=now;
  snkUpdate(dt);snkDraw();
  SNK.raf=requestAnimationFrame(snkFrame);
}
const snkEng={
  start(cv){snkInit();SNK.cv=cv;const s=gCanvas(cv,SNK.cols*SNK.cell,SNK.rows*SNK.cell,560);SNK.ctx=s.ctx;
    if(SNK.raf)cancelAnimationFrame(SNK.raf);
    SNK.on=true;snkReset();SNK.last=0;SNK.raf=requestAnimationFrame(snkFrame);
    /* کنترل با موس: مار به سمت نشانگر می‌رود */
    if(SNK.mm){cv.removeEventListener('pointermove',SNK.mm);cv.removeEventListener('pointerdown',SNK.md);cv.removeEventListener('pointerup',SNK.mu);}
    SNK.mm=e=>{
      if(SNK.over)return;
      const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;
      const gx=(e.clientX-r.left)/r.width*SNK.cols, gy=(e.clientY-r.top)/r.height*SNK.rows;
      const dx=gx-(SNK.snake[0].x+.5), dy=gy-(SNK.snake[0].y+.5);
      if(Math.abs(dx)+Math.abs(dy)<1.5)return;
      const nd=Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1];
      if(nd[0]===-SNK.dir[0]&&nd[1]===-SNK.dir[1])return;
      SNK.ndir=nd;
    };
    /* سوایپ لمسی */
    SNK.md=e=>{SNK.pt={x:e.clientX,y:e.clientY};};
    SNK.mu=e=>{
      if(!SNK.pt)return;
      const dx=e.clientX-SNK.pt.x,dy=e.clientY-SNK.pt.y;SNK.pt=null;
      if(Math.abs(dx)+Math.abs(dy)<18)return;
      const nd=Math.abs(dx)>Math.abs(dy)?[dx>0?1:-1,0]:[0,dy>0?1:-1];
      if(!(nd[0]===-SNK.dir[0]&&nd[1]===-SNK.dir[1]))SNK.ndir=nd;
    };
    cv.addEventListener('pointermove',SNK.mm);
    cv.addEventListener('pointerdown',SNK.md);
    cv.addEventListener('pointerup',SNK.mu);},
  stop(){SNK.on=false;if(SNK.raf)cancelAnimationFrame(SNK.raf);SNK.raf=0;
    const cv=SNK.cv;
    if(cv&&SNK.mm){cv.removeEventListener('pointermove',SNK.mm);cv.removeEventListener('pointerdown',SNK.md);cv.removeEventListener('pointerup',SNK.mu);}
    SNK.mm=null;},
  key(e){
    const d=SNK.ndir;
    const set=(x,y)=>{if(!(d[0]===-x&&d[1]===-y))SNK.ndir=[x,y];};
    switch(e.key){
      case 'ArrowLeft':e.preventDefault();set(-1,0);return true;
      case 'ArrowRight':e.preventDefault();set(1,0);return true;
      case 'ArrowUp':e.preventDefault();set(0,-1);return true;
      case 'ArrowDown':e.preventDefault();set(0,1);return true;
      case 'Enter':if(SNK.over){snkReset();return true;}return false;
    }
    return false;
  },
};

/* ================================================================
   دوز (با هوش مصنوعی مینی‌مکس)
   ================================================================ */
const TTT={el:null,b:Array(9).fill(''),turn:'X',over:false,score:{w:0,l:0,d:0}};
function tttReset(){TTT.b=Array(9).fill('');TTT.turn='X';TTT.over=false;tttRender();}
function tttWinner(b){
  const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(const l of L)if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[1]]===b[l[2]])return{p:b[l[0]],line:l};
  if(b.every(v=>v))return{p:'D',line:[]};
  return null;
}
function tttMini(b,player){
  const w=tttWinner(b);
  if(w)return{sc:w.p==='O'?10:w.p==='X'?-10:0};
  const moves=[];
  b.forEach((v,i)=>{if(!v)moves.push(i);});
  if(player==='O'){
    let best=-99;
    for(const m of moves){b[m]='O';best=Math.max(best,tttMini(b,'X').sc);b[m]='';}
    return{sc:best};
  }else{
    let best=99;
    for(const m of moves){b[m]='X';best=Math.min(best,tttMini(b,'O').sc);b[m]='';}
    return{sc:best};
  }
}
function tttAI(){
  const b=TTT.b;
  let best=-99,mv=-1;
  b.forEach((v,i)=>{
    if(v)return;
    b[i]='O';
    const sc=tttMini(b,'X').sc;
    b[i]='';
    if(sc>best){best=sc;mv=i;}
  });
  if(mv>=0)tttPlace(mv);
}
function tttPlace(i){
  if(TTT.over||TTT.b[i])return;
  TTT.b[i]=TTT.turn;
  const w=tttWinner(TTT.b);
  if(w){
    TTT.over=true;
    if(w.p==='X'){TTT.score.w++;toast('بردی! '.replace(' ',''),'trophy');}
    else if(w.p==='O'){TTT.score.l++;}
    else{TTT.score.d++;}
  }else{
    TTT.turn=TTT.turn==='X'?'O':'X';
    if(TTT.turn==='O'){tttRender();setTimeout(()=>{if(!TTT.over)tttAI();tttRender();},380);return;}
  }
  tttRender();
}
function tttRender(){
  const el=TTT.el;if(!el)return;
  const w=tttWinner(TTT.b);
  let h='<div class="ttt-top"><span class="ttt-sc win">تو '+gNum(TTT.score.w)+'</span><span class="ttt-sc">مساوی '+gNum(TTT.score.d)+'</span><span class="ttt-sc lose">ربات '+gNum(TTT.score.l)+'</span></div>';
  h+='<div class="ttt-grid'+(TTT.over?' done':'')+'">';
  TTT.b.forEach((v,i)=>{
    const inLine=w&&w.line.includes(i);
    h+='<button class="ttt-c '+(v==='X'?'x':'o')+' '+(inLine?'inline win':'')+'" data-i="'+i+'">'+(v?(v==='X'?'✕':'◯'):'')+'</button>';
  });
  h+='</div>';
  if(w)h+='<div class="g48-msg '+(w.p==='X'?'win':w.p==='O'?'lose':'')+'">'+(w.p==='X'?'بردی!':w.p==='O'?'ربات برد!':'مساوی شد')+' — Enter = از نو</div>';
  else h+='<div class="ttt-hint">نوبت '+(TTT.turn==='X'?'تو (✕)':'ربات (◯)…')+'</div>';
  el.innerHTML=h;
  el.querySelectorAll('.ttt-c').forEach(c=>c.onclick=()=>{if(TTT.turn==='X')tttPlace(+c.dataset.i);});
}
const tttEng={
  start(el){TTT.el=el;tttReset();},
  stop(){TTT.el=null;},
  key(e){if(e.key==='Enter'&&TTT.over){tttReset();return true;}return false;},
};

/* ================================================================
   حافظه
   ================================================================ */
const MEM={el:null,cards:[],open:[],lock:false,moves:0,best:0,found:0,icons:['coffee','music','gamepad','star','heart','zap','globe','dice5']};
function memReset(){
  MEM.best=store.get('memoryBest',0);
  MEM.open=[];MEM.lock=false;MEM.moves=0;MEM.found=0;
  MEM.cards=MEM.icons.concat(MEM.icons).map((icn,i)=>({icn:icn,id:i,done:false})).sort(()=>Math.random()-0.5);
  memRender();
}
function memRender(){
  const el=MEM.el;if(!el)return;
  let h='<div class="mem-top"><span>حرکت‌ها: <b>'+gNum(MEM.moves)+'</b></span><span>رکورد: <b>'+gNum(MEM.best)+'</b> حرکت</span></div>';
  h+='<div class="mem-grid">';
  MEM.cards.forEach((c,i)=>{
    const open=MEM.open.includes(i)||c.done;
    h+='<button class="mem-c'+(open?' open':'')+(c.done?' done':'')+'" data-i="'+i+'">'
      +'<span class="mem-in"><span class="mem-f">'+ic('coffee',22)+'</span><span class="mem-b" style="color:'+(c.icn==='heart'?'#e08b85':c.icn==='star'?'#f0c75e':'#7ec8f0')+'">'+ic(c.icn,26)+'</span></span></button>';
  });
  h+='</div>';
  if(MEM.found===8)h+='<div class="g48-msg win">همه‌شو پیدا کردی با '+gNum(MEM.moves)+' حرکت! — Enter = از نو</div>';
  el.innerHTML=h;
  el.querySelectorAll('.mem-c').forEach(b=>b.onclick=()=>memFlip(+b.dataset.i));
}
function memFlip(i){
  if(MEM.lock||MEM.open.includes(i)||MEM.cards[i].done)return;
  MEM.open.push(i);
  memRender();
  if(MEM.open.length===2){
    MEM.moves++;MEM.lock=true;
    const [a,b]=MEM.open;
    setTimeout(()=>{
      if(MEM.cards[a].icn===MEM.cards[b].icn){
        MEM.cards[a].done=MEM.cards[b].done=true;MEM.found++;
        if(MEM.found===8&&(!MEM.best||MEM.moves<MEM.best)){MEM.best=MEM.moves;store.set('memoryBest',MEM.best);}
      }
      MEM.open=[];MEM.lock=false;memRender();
    },620);
  }
}
const memEng={
  start(el){MEM.el=el;memReset();},
  stop(){MEM.el=null;},
  key(e){if(e.key==='Enter'&&MEM.found===8){memReset();return true;}return false;},
};

/* ================================================================
   سنگ کاغذ قیچی
   ================================================================ */
const RPS={el:null,me:0,pc:0,draw:0,lock:false};
const RPS_ITEMS=[
  {n:'سنگ',svg:'<svg viewBox="0 0 24 24" fill="currentColor" style="width:38px;height:38px"><path d="M7 4l6-1 6 4 2 6-3 7H7l-4-6z"/></svg>'},
  {n:'کاغذ',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:38px;height:38px"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>'},
  {n:'قیچی',svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:38px;height:38px"><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/></svg>'},
];
function rpsReset(){RPS.me=0;RPS.pc=0;RPS.draw=0;RPS.lock=false;rpsRender(null,null,-1);}
function rpsPlay(m){
  if(RPS.lock)return;
  RPS.lock=true;
  const p=Math.floor(Math.random()*3);
  /* سنجش: 0سنگ 1کاغذ 2قیچی */
  let res;
  if(m===p)res=-1;
  else if((m-p+3)%3===1)res=1;
  else res=0;
  gSfx('click');
  rpsRender(m,null,-1,true);
  setTimeout(()=>{
    if(res===1)RPS.me++;else if(res===0)RPS.pc++;else RPS.draw++;
    rpsRender(m,p,res);
    gSfx(res===1?'win':res===0?'bad':'click');
    RPS.lock=false;
  },680);
}
function rpsRender(m,p,res,cd){
  const el=RPS.el;if(!el)return;
  let h='<div class="rps-top"><span class="ttt-sc win">تو '+gNum(RPS.me)+'</span><span class="ttt-sc">مساوی '+gNum(RPS.draw)+'</span><span class="ttt-sc lose">ربات '+gNum(RPS.pc)+'</span></div>';
  h+='<div class="rps-arena">'
    +'<div class="rps-hand me'+(cd?' shake':'')+'">'+(m!==null?RPS_ITEMS[m].svg:'<span class="rps-q">؟</span>')+'</div>'
    +'<div class="rps-vs">'+(res===-1?'مساوی!':res===1?'بردی!':res===0?'ربات برد!':'VS')+'</div>'
    +'<div class="rps-hand pc'+(p!==null?' show':'')+(cd?' shake':'')+'">'+(p!==null?RPS_ITEMS[p].svg:'<span class="rps-q">؟</span>')+'</div>'
  +'</div>';
  h+='<div class="rps-btns">'+RPS_ITEMS.map((it,i)=>'<button class="rps-b" data-i="'+i+'" title="'+it.n+'">'+it.svg+'<span>'+it.n+'</span></button>').join('')+'</div>';
  el.innerHTML=h;
  el.querySelectorAll('.rps-b').forEach(b=>b.onclick=()=>rpsPlay(+b.dataset.i));
}
const rpsEng={
  start(el){RPS.el=el;rpsReset();},
  stop(){RPS.el=null;},
  key(e){return false;},
};

/* ================================================================
   تست ری‌اکشن
   ================================================================ */
const RCT={el:null,st:'idle',t0:0,timer:null,best:0};
function rctInit(){RCT.best=store.get('reactBest',0);}
function rctRender(msg,cls){
  const el=RCT.el;if(!el)return;
  let h='<div class="rct-panel '+(cls||'')+'" id="rctP">'
    +'<div class="rct-ic">'+ic(cls==='go'?'zap':cls==='wait'?'clock':'activity',44)+'</div>'
    +'<h4>'+(msg||'آماده‌ای؟')+'</h4>'
    +'<p>'+(RCT.st==='idle'?'کلیک کن یا Space بزن تا شروع شود':RCT.st==='wait'?'صبر… به محض طلایی‌شدن بزن!':RCT.st==='go'?'الان! بزن!':'')+'</p>'
    +(RCT.best?'<span class="rct-best">رکورد: '+gNum(RCT.best)+' میلی‌ثانیه</span>':'')
  +'</div>';
  el.innerHTML=h;
  el.querySelector('#rctP').onclick=()=>rctClick();
}
function rctClick(){
  if(RCT.st==='idle'){
    RCT.st='wait';rctRender('صبر کن…','wait');
    RCT.timer=setTimeout(()=>{RCT.st='go';RCT.t0=performance.now();rctRender('الان بزن!','go');},1400+Math.random()*2600);
  }else if(RCT.st==='wait'){
    clearTimeout(RCT.timer);RCT.st='idle';
    rctRender('زود زدی! دوباره امتحان کن','early');
    setTimeout(()=>{if(RCT.st==='idle')rctRender();},1200);
  }else if(RCT.st==='go'){
    const ms=Math.round(performance.now()-RCT.t0);
    RCT.st='idle';
    if(!RCT.best||ms<RCT.best){RCT.best=ms;store.set('reactBest',ms);}
    rctRender(gNum(ms)+' میلی‌ثانیه!','result');
    setTimeout(()=>{if(RCT.st==='idle')rctRender();},1600);
  }
}
const rctEng={
  start(el){rctInit();RCT.el=el;RCT.st='idle';rctRender();},
  stop(){if(RCT.timer)clearTimeout(RCT.timer);RCT.el=null;},
  key(e){if(e.key===' '){e.preventDefault();rctClick();return true;}return false;},
};

/* ================================================================
   پرتاب سکه
   ================================================================ */
const COIN={el:null,h:0,t:0,spinning:false};
function coinReset(){COIN.h=0;COIN.t=0;coinRender('کلیک کن تا بچرخه!');}
function coinRender(msg){
  const el=COIN.el;if(!el)return;
  el.innerHTML='<div class="coin-top"><span class="ttt-sc win">شیر '+gNum(COIN.h)+'</span><span class="ttt-sc">خط '+gNum(COIN.t)+'</span></div>'
    +'<div class="coin-area"><div class="coin'+(COIN.spinning?' spin':'')+'" id="coin3d"><span class="coin-f h">'+ic('star',34)+'</span><span class="coin-f t">'+ic('coffee',30)+'</span></div></div>'
    +'<div class="coin-msg">'+(msg||'')+'</div>'
    +'<button class="btn gold coin-btn" id="coinGo">'+ic('dice',16)+'پرتاب!</button>';
  el.querySelector('#coinGo').onclick=()=>coinFlip();
}
function coinFlip(){
  if(COIN.spinning)return;
  COIN.spinning=true;
  const r=Math.random()<0.5;
  const c3=COIN.el.querySelector('#coin3d');
  c3.style.transform='rotateY('+(1800+(r?0:180))+'deg)';
  setTimeout(()=>{
    COIN.spinning=false;
    if(r)COIN.h++;else COIN.t++;
    coinRender(r?'شیر آمد!':'خط آمد!');
    COIN.el.querySelector('#coin3d').style.transform='rotateY('+(r?0:180)+'deg)';
  },2100);
}
const coinEng={
  start(el){COIN.el=el;coinReset();},
  stop(){COIN.el=null;},
  key(e){if(e.key===' '){e.preventDefault();coinFlip();return true;}return false;},
};

/* ================================================================
   تاس شانس
   ================================================================ */
const DICE={el:null,rolling:false,v:[3,4],hist:[]};
const D_PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function diceRender(msg){
  const el=DICE.el;if(!el)return;
  const die=(v,i)=>'<div class="die'+(DICE.rolling?' roll':'')+'" id="die'+i+'">'+D_PIPS[v].map(p=>'<i style="grid-area:'+(Math.floor(p/3)+1)+'/'+(p%3+1)+'"></i>').join('')+'</div>';
  el.innerHTML='<div class="dice-area">'+die(DICE.v[0],0)+die(DICE.v[1],1)
    +'<div class="dice-sum">مجموع: <b>'+gNum(DICE.v[0]+DICE.v[1])+'</b></div></div>'
    +'<div class="coin-msg">'+(msg||'')+'</div>'
    +'<button class="btn gold coin-btn" id="diceGo">'+ic('dice5',16)+'بریز!</button>';
  el.querySelector('#diceGo').onclick=()=>diceRoll();
}
function diceRoll(){
  if(DICE.rolling)return;
  DICE.rolling=true;
  diceRender('می‌چرخه…');
  setTimeout(()=>{
    DICE.rolling=false;
    DICE.v=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];
    diceRender(DICE.v[0]===DICE.v[1]?'جفت آوردی! '.replace(' ',''):'ریخته شد!');
  },800);
}
const diceEng={
  start(el){DICE.el=el;diceRender();},
  stop(){DICE.el=null;},
  key(e){if(e.key===' '){e.preventDefault();diceRoll();return true;}return false;},
};

/* ================================================================
   پازل (۱۵-پازل)
   ================================================================ */
const PZL={el:null,tiles:[],moves:0,best:0,size:4};
function pzlReset(){
  PZL.best=store.get('puzzleBest',0);
  PZL.tiles=Array.from({length:16},(_,i)=>(i+1)%16);
  /* شافل با حرکت‌های قانونی */
  let z=15;
  for(let i=0;i<300;i++){
    const zr=Math.floor(z/4),zc=z%4;
    const opts=[];
    if(zr>0)opts.push(z-4);if(zr<3)opts.push(z+4);
    if(zc>0)opts.push(z-1);if(zc<3)opts.push(z+1);
    const pick=opts[Math.floor(Math.random()*opts.length)];
    PZL.tiles[z]=PZL.tiles[pick];PZL.tiles[pick]=0;z=pick;
  }
  PZL.moves=0;
  pzlRender();
}
function pzlMove(i){
  const z=PZL.tiles.indexOf(0);
  const zr=Math.floor(z/4),zc=z%4,ir=Math.floor(i/4),ic=i%4;
  if(Math.abs(zr-ir)+Math.abs(zc-ic)!==1)return;
  PZL.tiles[z]=PZL.tiles[i];PZL.tiles[i]=0;
  PZL.moves++;
  pzlRender();
  if(PZL.tiles.every((v,idx)=>v===(idx+1)%16)){
    if(!PZL.best||PZL.moves<PZL.best){PZL.best=PZL.moves;store.set('puzzleBest',PZL.best);}
    setTimeout(()=>pzlRender(true),60);
  }
}
function pzlRender(win){
  const el=PZL.el;if(!el)return;
  let h='<div class="mem-top"><span>حرکت‌ها: <b>'+gNum(PZL.moves)+'</b></span><span>رکورد: <b>'+gNum(PZL.best)+'</b> حرکت</span></div>';
  h+='<div class="pzl-grid'+(win?' done':'')+'">';
  PZL.tiles.forEach((v,i)=>{
    if(v===0){h+='<div class="pzl-t blank"></div>';return;}
    const correct=v===(i+1)%16;
    h+='<button class="pzl-t'+(correct?' ok':'')+'" data-i="'+i+'">'+gNum(v)+'</button>';
  });
  h+='</div>';
  if(win)h+='<div class="g48-msg win">حلش کردی با '+gNum(PZL.moves)+' حرکت! — Enter = از نو</div>';
  el.innerHTML=h;
  el.querySelectorAll('.pzl-t').forEach(t=>t.onclick=()=>pzlMove(+t.dataset.i));
}
const pzlEng={
  start(el){PZL.el=el;pzlReset();},
  stop(){PZL.el=null;},
  key(e){
    if(e.key==='Enter'&&PZL.el&&PZL.el.querySelector('.g48-msg')){pzlReset();return true;}
    /* حرکت با کیبورد: فلش = حرکت کاشی مخالف جهت */
    const z=PZL.tiles.indexOf(0);
    const zr=Math.floor(z/4),zc=z%4;
    const map={ArrowUp:[zr<3?z+4:-1],ArrowDown:[zr>0?z-4:-1],ArrowLeft:[zc<3?z+1:-1],ArrowRight:[zc>0?z-1:-1]};
    if(map[e.key]&&map[e.key][0]>=0){e.preventDefault();pzlMove(map[e.key][0]);return true;}
    return false;
  },
};

/* ================================================================
   واژه‌یاب
   ================================================================ */
const WRD={el:null,grid:[],words:[],found:[],sel:null,start:null,t:0,timer:null,ALPHA:'ابپتثجچحخدذرزسشصطظعغفقکگلمنوهی'};
const WRD_LIST=['قهوه','کافی','نت','برج','شب','رود','موسیقی','ماشین'];
function wrdReset(){
  WRD.found=[];WRD.sel=null;WRD.start=null;WRD.t=0;WRD.words=[];
  const N=9;
  WRD.grid=Array.from({length:N},()=>Array(N).fill(''));
  /* قرار دادن کلمات */
  for(const w of WRD_LIST){
    let placed=false,guard=0;
    while(!placed&&guard++<200){
      const horiz=Math.random()<0.6;
      const L=w.length;
      const r=horiz?Math.floor(Math.random()*N):Math.floor(Math.random()*(N-L+1));
      const c=horiz?Math.floor(Math.random()*(N-L+1)):Math.floor(Math.random()*N);
      const rev=Math.random()<0.5;
      const word=rev?w.split('').reverse().join(''):w;
      let ok=true;
      const cells=[];
      for(let i=0;i<L;i++){
        const rr=horiz?r:r+i, cc=horiz?c+i:c;
        if(WRD.grid[rr][cc]&&WRD.grid[rr][cc]!==word[i]){ok=false;break;}
        cells.push([rr,cc]);
      }
      if(ok){
        cells.forEach(([rr,cc],i)=>WRD.grid[rr][cc]=word[i]);
        WRD.words.push({w:w,cells:cells.map(x=>x.join('-'))});
        placed=true;
      }
    }
  }
  /* پرکردن خالی‌ها */
  WRD.grid.forEach((row,r)=>row.forEach((v,c)=>{if(!v)WRD.grid[r][c]=WRD.ALPHA[Math.floor(Math.random()*WRD.ALPHA.length)];}));
  if(WRD.timer)clearInterval(WRD.timer);
  WRD.timer=setInterval(()=>{if(WRD.el){WRD.t++;const te=WRD.el.querySelector('.wrd-time');if(te)te.textContent=gNum(Math.floor(WRD.t/60))+':'+gNum(WRD.t%60<10?'0'+WRD.t%60:WRD.t%60);}},1000);
  wrdRender();
}
function wrdLine(a,b){
  const [r1,c1]=a.split('-').map(Number),[r2,c2]=b.split('-').map(Number);
  const cells=[];
  if(r1===r2){
    const [s,e]=[Math.min(c1,c2),Math.max(c1,c2)];
    for(let c=s;c<=e;c++)cells.push(r1+'-'+c);
  }else if(c1===c2){
    const [s,e]=[Math.min(r1,r2),Math.max(r1,r2)];
    for(let r=s;r<=e;r++)cells.push(r+'-'+c1);
  }
  return cells;
}
function wrdCheck(cells){
  const key=cells.join('|');
  const rev=cells.slice().reverse().join('|');
  for(let i=0;i<WRD.words.length;i++){
    const w=WRD.words[i];
    if(WRD.found.includes(w.w))continue;
    if(w.cells.join('|')===key||w.cells.join('|')===rev){
      WRD.found.push(w.w);
      toast('پیدا شد: '+w.w,'trophy');
      if(WRD.found.length===WRD_LIST.filter(x=>WRD.words.some(y=>y.w===x)).length){
        toast('همهٔ کلمات پیدا شد!','crown');
      }
      return true;
    }
  }
  return false;
}
function wrdRender(){
  const el=WRD.el;if(!el)return;
  let h='<div class="mem-top"><span>پیدا‌شده: <b>'+gNum(WRD.found.length)+'</b> از '+gNum(WRD.words.length)+'</span><span class="wrd-time">۰:۰۰</span></div>';
  h+='<div class="wrd-grid">';
  WRD.grid.forEach((row,r)=>row.forEach((v,c)=>{
    const key=r+'-'+c;
    const inFound=WRD.words.some(w=>WRD.found.includes(w.w)&&w.cells.includes(key));
    const inSel=WRD.sel&&WRD.sel.includes(key);
    h+='<button class="wrd-c'+(inFound?' fd':'')+(inSel?' sel':'')+'" data-k="'+key+'">'+v+'</button>';
  }));
  h+='</div><div class="wrd-words">'+WRD.words.map(w=>'<span class="'+(WRD.found.includes(w.w)?'fd':'')+'">'+w.w+'</span>').join('')+'</div>';
  el.innerHTML=h;
  const wb=el.querySelector('.wrd-words');
  if(wb){
    const bar=document.createElement('div');
    bar.className='wrd-pbar';
    bar.innerHTML='<i style="width:'+Math.round(WRD.found.length/Math.max(1,WRD.words.length)*100)+'%"></i>';
    wb.parentNode.insertBefore(bar,wb);
  }
  el.querySelectorAll('.wrd-c').forEach(b=>{
    b.onclick=()=>{
      const k=b.dataset.k;
      if(!WRD.start){WRD.start=k;WRD.sel=[k];}
      else{
        const cells=wrdLine(WRD.start,k);
        if(cells.length){WRD.sel=cells;if(!wrdCheck(cells)){b.classList.add('no');setTimeout(()=>b.classList.remove('no'),400);}}
        WRD.start=null;WRD.sel=null;
      }
      wrdRender();
    };
  });
}
const wrdEng={
  start(el){WRD.el=el;wrdReset();},
  stop(){if(WRD.timer)clearInterval(WRD.timer);WRD.el=null;},
  key(e){return false;},
};

/* ================================================================
   شطرنج
   ================================================================ */
const CHS={el:null,b:null,sel:null,turn:'w',over:'',moves:0,last:null};
const CH_GLYPH={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const CH_VAL={p:1,n:3,b:3,r:5,q:9,k:100};
function chsReset(){
  CHS.b=Array.from({length:8},()=>Array(8).fill(null));
  const back=['r','n','b','q','k','b','n','r'];
  for(let c=0;c<8;c++){
    CHS.b[0][c]={t:back[c],col:'b'};CHS.b[1][c]={t:'p',col:'b'};
    CHS.b[6][c]={t:'p',col:'w'};CHS.b[7][c]={t:back[c],col:'w'};
  }
  CHS.sel=null;CHS.turn='w';CHS.over='';CHS.moves=0;
  chsRender();
}
function chsIn(r,c){return r>=0&&r<8&&c>=0&&c<8;}
function chsPseudo(b,r,c){
  const p=b[r][c];if(!p)return[];
  const out=[];
  const push=(rr,cc)=>{if(!chsIn(rr,cc))return;if(!b[rr][cc]||b[rr][cc].col!==p.col)out.push([rr,cc]);};
  const ray=(dr,dc)=>{
    let rr=r+dr,cc=c+dc;
    while(chsIn(rr,cc)){
      if(!b[rr][cc]){out.push([rr,cc]);}
      else{if(b[rr][cc].col!==p.col)out.push([rr,cc]);break;}
      rr+=dr;cc+=dc;
    }
  };
  if(p.t==='p'){
    const dir=p.col==='w'?-1:1,start=p.col==='w'?6:1;
    if(chsIn(r+dir,c)&&!b[r+dir][c]){
      out.push([r+dir,c]);
      if(r===start&&!b[r+2*dir][c])out.push([r+2*dir,c]);
    }
    for(const dc of [-1,1]){
      if(chsIn(r+dir,c+dc)&&b[r+dir][c+dc]&&b[r+dir][c+dc].col!==p.col)out.push([r+dir,c+dc]);
    }
  }else if(p.t==='n'){
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>push(r+dr,c+dc));
  }else if(p.t==='b'){[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>ray(dr,dc));}
  else if(p.t==='r'){[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>ray(dr,dc));}
  else if(p.t==='q'){[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>ray(dr,dc));}
  else{[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>push(r+dr,c+dc));}
  return out;
}
function chsKing(b,col){
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=b[r][c];
    if(p&&p.t==='k'&&p.col===col)return[r,c];
  }
  return null;
}
function chsAttacked(b,r,c,by){
  for(let rr=0;rr<8;rr++)for(let cc=0;cc<8;cc++){
    const p=b[rr][cc];
    if(p&&p.col===by){
      if(p.t==='p'){
        const dir=by==='w'?-1:1;
        if(rr+dir===r&&(cc+1===c||cc-1===c))return true;
      }else{
        if(chsPseudo(b,rr,cc).some(m=>m[0]===r&&m[1]===c))return true;
      }
    }
  }
  return false;
}
function chsLegal(r,c){
  const p=CHS.b[r][c];if(!p)return[];
  return chsPseudo(CHS.b,r,c).filter(([rr,cc])=>{
    const save=CHS.b[rr][cc];
    CHS.b[rr][cc]=p;CHS.b[r][c]=null;
    const k=chsKing(CHS.b,p.col);
    const bad=k&&chsAttacked(CHS.b,k[0],k[1],p.col==='w'?'b':'w');
    CHS.b[r][c]=p;CHS.b[rr][cc]=save;
    return !bad;
  });
}
function chsAllLegal(col){
  const out=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    if(CHS.b[r][c]&&CHS.b[r][c].col===col){
      chsLegal(r,c).forEach(m=>out.push({from:[r,c],to:m}));
    }
  }
  return out;
}
function chsMove(r,c,rr,cc){
  CHS.last=[r,c,rr,cc];
  const p=CHS.b[r][c];
  const captured=CHS.b[rr][cc];
  CHS.b[rr][cc]=p;CHS.b[r][c]=null;
  CHS.moves++;
  /* ارتقای سرباز */
  if(p.t==='p'&&(rr===0||rr===7))p.t='q';
  CHS.turn=CHS.turn==='w'?'b':'w';
  /* پایان بازی */
  const legal=chsAllLegal(CHS.turn);
  const k=chsKing(CHS.b,CHS.turn);
  const check=k&&chsAttacked(CHS.b,k[0],k[1],CHS.turn==='w'?'b':'w');
  if(!legal.length)CHS.over=check?(CHS.turn==='w'?'مات! ربات برد':'مات! بردی!'):'پات — مساوی';
  else if(check)CHS.over='';
  else CHS.over='';
  return captured||check;
}
function chsAI(){
  if(CHS.over)return;
  const all=chsAllLegal('b');
  if(!all.length)return;
  let best=null,bestSc=-99;
  for(const m of all){
    const tgt=CHS.b[m.to[0]][m.to[1]];
    let sc=tgt?CH_VAL[tgt.t]*10+Math.random():Math.random();
    /* شبیه‌سازی امنیت */
    const save=CHS.b[m.to[0]][m.to[1]];
    const p=CHS.b[m.from[0]][m.from[1]];
    CHS.b[m.to[0]][m.to[1]]=p;CHS.b[m.from[0]][m.from[1]]=null;
    if(chsAttacked(CHS.b,m.to[0],m.to[1],'w'))sc-=CH_VAL[p.t]*8;
    CHS.b[m.from[0]][m.from[1]]=p;CHS.b[m.to[0]][m.to[1]]=save;
    if(sc>bestSc){bestSc=sc;best=m;}
  }
  chsMove(best.from[0],best.from[1],best.to[0],best.to[1]);
  gSfx('move');
  chsRender();
}
function chsClick(r,c){
  if(CHS.over||CHS.turn!=='w')return;
  const p=CHS.b[r][c];
  if(CHS.sel){
    const legal=chsLegal(CHS.sel[0],CHS.sel[1]);
    if(legal.some(m=>m[0]===r&&m[1]===c)){
      const res=chsMove(CHS.sel[0],CHS.sel[1],r,c);
      CHS.sel=null;
      gSfx('move');
      chsRender();
      if(res===true)toast('کیش!','alert');
      if(!CHS.over)setTimeout(chsAI,450);
      return;
    }
  }
  if(p&&p.col==='w'){
    CHS.sel=(CHS.sel&&CHS.sel[0]===r&&CHS.sel[1]===c)?null:[r,c];
    chsRender();
  }else{CHS.sel=null;chsRender();}
}
function chsRender(){
  const el=CHS.el;if(!el)return;
  let h='<div class="chs-top"><span>حرکت: <b>'+gNum(CHS.moves)+'</b></span><span>'+(CHS.turn==='w'&&!CHS.over?'نوبت تو (سفید)':CHS.over?'':'ربات فکر می‌کند…')+'</span></div>';
  h+='<div class="chs-board'+(CHS.over?' done':'')+'">';
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const dark=(r+c)%2===1;
    const p=CHS.b[r][c];
    const isSel=CHS.sel&&CHS.sel[0]===r&&CHS.sel[1]===c;
    const legal=CHS.sel&&chsLegal(CHS.sel[0],CHS.sel[1]).some(m=>m[0]===r&&m[1]===c);
    h+='<button class="chs-c '+(dark?'d':'l')+(isSel?' sel':'')+(legal?' legal':'')+'" data-r="'+r+'" data-c="'+c+'">'
      +(p?'<span class="chs-p '+(p.col==='w'?'w':'b')+'">'+CH_GLYPH[p.col][p.t]+'</span>':'')
      +(legal&&!p?'<i class="chs-dot"></i>':'')+(legal&&p?'<i class="chs-ring"></i>':'')
    +'</button>';
  }
  h+='</div>';
  if(CHS.over)h+='<div class="g48-msg '+(CHS.over.includes('بردی')?'win':CHS.over.includes('ربات')?'lose':'')+'">'+CHS.over+' — Enter = از نو</div>';
  el.innerHTML=h;
  el.querySelectorAll('.chs-c').forEach((cell,k)=>{
    const r=Math.floor(k/8),c2=k%8;
    if(CHS.last&&((CHS.last[0]===r&&CHS.last[1]===c2)||(CHS.last[2]===r&&CHS.last[3]===c2)))cell.classList.add('last');
    const pcv=CHS.b[r][c2];
    if(pcv&&pcv.t==='k'&&chsAttacked(CHS.b,r,c2,pcv.col==='w'?'b':'w'))cell.classList.add('chk');
  });
  el.querySelectorAll('.chs-c').forEach(b=>b.onclick=()=>chsClick(+b.dataset.r,+b.dataset.c));
}
const chsEng={
  start(el){CHS.el=el;chsReset();},
  stop(){CHS.el=null;},
  key(e){if(e.key==='Enter'&&CHS.over){chsReset();return true;}return false;},
};

/* ---------- ثبت در رجیستری ---------- */
Object.assign(GAME_ENG,{
  'tetris':tetEng,'2048':g48Eng,'snake':snkEng,'ttt':tttEng,
  'memory':memEng,'rps':rpsEng,'react':rctEng,'coin':coinEng,
  'dice':diceEng,'puzzle':pzlEng,'word':wrdEng,'chess':chsEng,
});
