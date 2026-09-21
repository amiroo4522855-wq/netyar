/* ===== انگری بردز پرمیوم — Angry Birds NetYar ===== */
'use strict';

/* ---------- سیستم ریستارت پرمیوم برای همه بازی‌ها ---------- */
function hidePremiumGO(){
  const el=document.querySelector('.gover-premium');
  if(el){el.classList.remove('in');setTimeout(()=>el.remove(),380);}
}
function showPremiumGO(opts){
  // opts: {title, sub, score, best, win, restart, home}
  const stage=document.querySelector('.game-stage');
  if(!stage)return;
  hidePremiumGO();
  const isWin=!!opts.win;
  const div=document.createElement('div');
  div.className='gover-premium'+(isWin?' win':' lose');
  div.innerHTML=
    '<div class="gover-backdrop"></div>'+
    '<div class="gover-card">'+
      '<div class="gover-ic-wrap"><span class="gover-ic">'+(isWin?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/><circle cx="12" cy="8" r="2" fill="currentColor" stroke="none"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>')+'</span><span class="gover-glow"></span></div>'+
      '<h3 class="gover-title">'+(opts.title||(isWin?'بردی!':'باختی!'))+'</h3>'+
      '<p class="gover-sub">'+(opts.sub||'')+'</p>'+
      (opts.score!=null?'<div class="gover-stats"><span class="gs"><b>'+gNum(opts.score)+'</b> امتیاز</span>'+(opts.best!=null?'<span class="gs gold"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> '+gNum(opts.best)+' رکورد</span>':'')+'</div>':'')+
      '<div class="gover-acts">'+
        '<button class="gover-btn primary"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> شروع مجدد</button>'+
        '<button class="gover-btn ghost">بازگشت به بازی‌خانه</button>'+
      '</div>'+
    '</div>';
  stage.appendChild(div);
  // trigger anim
  requestAnimationFrame(()=>requestAnimationFrame(()=>div.classList.add('in')));
  const btns=div.querySelectorAll('.gover-btn');
  if(btns[0])btns[0].onclick=(e)=>{e.stopPropagation();hidePremiumGO();try{gSfx('click');}catch(x){};opts.restart&&opts.restart();};
  if(btns[1])btns[1].onclick=(e)=>{e.stopPropagation();hidePremiumGO();go('games');};
  div.querySelector('.gover-backdrop').onclick=()=>{hidePremiumGO();};
}

/* اگر بازی‌ها قبلاً لود شده‌اند، ریستارت‌شان را با پرمیوم اورلی بپوشانیم */
function patchExistingGamesWithGO(){
  try{
    // DINO
    if(typeof DINO!=='undefined'){
      const oldDraw = typeof dinoDraw==='function'?dinoDraw:null;
      if(oldDraw && !oldDraw._patched){
        const orig = oldDraw;
        window.dinoDraw = function(){
          orig();
          if(DINO.over){
            const stage=document.querySelector('.game-stage');
            if(stage && !stage.querySelector('.gover-premium')){
              showPremiumGO({title:'آخ! گاز گرفتی!',sub:'دایی ناصر به کاکتوس خورد — ولی می‌تونی دوباره بدوی!',score:DINO.score,best:DINO.best,win:false,restart:()=>{dinoReset();}});
            }
          }else hidePremiumGO();
        };
        window.dinoDraw._patched=true;
      }
    }
    // TOWER
    if(typeof TWR!=='undefined' && typeof twrDraw==='function' && !twrDraw._patched){
      const orig=twrDraw;
      window.twrDraw=function(){
        orig();
        if(TWR.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            showPremiumGO({title:'برجت فرو ریخت!',sub:'یک میلی‌متر خطا کافی بود — دوباره دقیق‌تر بساز!',score:TWR.score,best:TWR.best,win:false,restart:()=>{twrReset();}});
          }
        }else if(!TWR.over) { const s=document.querySelector('.gover-premium'); if(s) hidePremiumGO(); }
      };
      window.twrDraw._patched=true;
    }
    // FLAPPY
    if(typeof FLAP!=='undefined' && typeof flapDraw==='function' && !flapDraw._patched){
      const orig=flapDraw;
      window.flapDraw=function(){
        orig();
        if(FLAP.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            showPremiumGO({title:'افتادی!',sub:'فنجان قهوه‌ات به لوله خورد — دوباره بپر!',score:FLAP.score,best:FLAP.best,win:false,restart:()=>{flapReset();}});
          }
        }else hidePremiumGO();
      };
      window.flapDraw._patched=true;
    }
    // BREAKOUT
    if(typeof BRK!=='undefined' && typeof brkDraw==='function' && !brkDraw._patched){
      const orig=brkDraw;
      window.brkDraw=function(){
        orig();
        if(BRK.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            const win=BRK.bricks.length===0;
            showPremiumGO({title:win?'بردی! همه آجرها شکست!':'باختی!',sub:win?'همه آجرها رو ترکوندی — قهرمان بریک‌اوت!':'توپ افتاد — دوباره شانس‌تو امتحان کن!',score:BRK.score,best:BRK.best,win:win,restart:()=>{brkReset();}});
          }
        }else hidePremiumGO();
      };
      window.brkDraw._patched=true;
    }
    // BUBBLE
    if(typeof BUB!=='undefined' && typeof bubDraw==='function' && !bubDraw._patched){
      const orig=bubDraw;
      window.bubDraw=function(){
        orig();
        if(BUB.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            showPremiumGO({title:'زمان تمام!',sub:'حباب‌ها فرار کردند — دوباره بترکان!',score:BUB.score,best:BUB.best,win:false,restart:()=>{bubReset();}});
          }
        }else hidePremiumGO();
      };
      window.bubDraw._patched=true;
    }
    // TETRIS
    if(typeof TET!=='undefined' && typeof tetDraw==='function' && !tetDraw._patched){
      const orig=tetDraw;
      window.tetDraw=function(){
        orig();
        if(TET.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            showPremiumGO({title:'بازی تمام!',sub:'بلوک‌ها تا سقف رسیدند — دوباره بچین!',score:TET.score,best:TET.best,win:false,restart:()=>{tetReset();}});
          }
        }else hidePremiumGO();
      };
      window.tetDraw._patched=true;
    }
    // SNAKE
    if(typeof SNK!=='undefined' && typeof snkDraw==='function' && !snkDraw._patched){
      const orig=snkDraw;
      window.snkDraw=function(){
        orig();
        if(SNK.over){
          const st=document.querySelector('.game-stage');
          if(st && !st.querySelector('.gover-premium')){
            showPremiumGO({title:'مار گیر کرد!',sub:'به دیوار یا خودش خورد — دوباره بخز!',score:SNK.score,best:SNK.best,win:false,restart:()=>{snkReset();}});
          }
        }else hidePremiumGO();
      };
      window.snkDraw._patched=true;
    }
  }catch(e){console.warn('patch GO fail',e);}
}

/* ================================================================
   انگری بردز — فیزیک دقیق پرتابی
   ================================================================ */
const ANGRY={
  cv:null,ctx:null,w:800,h:480,on:false,over:false,win:false,raf:0,last:0,
  ground:0,sling:{x:160,y:340},birds:[],curBird:null,drag:{on:false,sx:0,sy:0,dx:0,dy:0},
  pigs:[],blocks:[],parts:[],score:0,best:0,level:0,t:0,trail:[],shake:0,
  canLaunch:true,birdsLeft:0
};

const ANGRY_LEVELS=[
  // Level 1 — ساده
  {
    birds:['red','red','yellow'],
    pigs:[{x:580,y:380},{x:650,y:380}],
    blocks:[
      {x:560,y:360,w:16,h:60,type:'wood'},{x:680,y:360,w:16,h:60,type:'wood'},
      {x:560,y:340,w:136,h:16,type:'wood'},
      {x:600,y:300,w:16,h:40,type:'wood'},{x:640,y:300,w:16,h:40,type:'wood'},
      {x:600,y:284,w:56,h:16,type:'stone'},
    ]
  },
  // Level 2 — برج چوبی
  {
    birds:['red','yellow','blue','black'],
    pigs:[{x:620,y:380},{x:620,y:300},{x:700,y:380}],
    blocks:[
      {x:580,y:360,w:16,h:60,type:'wood'},{x:660,y:360,w:16,h:60,type:'wood'},
      {x:580,y:340,w:96,h:16,type:'wood'},
      {x:580,y:280,w:16,h:60,type:'wood'},{x:660,y:280,w:16,h:60,type:'wood'},
      {x:580,y:260,w:96,h:16,type:'stone'},
      {x:610,y:220,w:16,h:40,type:'glass'},{x:635,y:220,w:16,h:40,type:'glass'},
      {x:610,y:204,w:41,h:16,type:'wood'},
      {x:700,y:360,w:16,h:60,type:'wood'},{x:740,y:360,w:16,h:60,type:'wood'},
      {x:700,y:340,w:56,h:16,type:'wood'},
    ]
  },
  // Level 3 — قلعه سنگی
  {
    birds:['red','red','yellow','blue','black'],
    pigs:[{x:560,y:380},{x:640,y:380},{x:720,y:380},{x:640,y:280}],
    blocks:[
      {x:540,y:320,w:16,h:100,type:'stone'},{x:760,y:320,w:16,h:100,type:'stone'},
      {x:540,y:300,w:236,h:16,type:'stone'},
      {x:580,y:240,w:16,h:60,type:'wood'},{x:700,y:240,w:16,h:60,type:'wood'},
      {x:580,y:220,w:136,h:16,type:'wood'},
      {x:610,y:180,w:16,h:40,type:'glass'},{x:670,y:180,w:16,h:40,type:'glass'},
      {x:610,y:164,w:76,h:16,type:'stone'},
      {x:620,y:360,w:16,h:40,type:'wood'},{x:660,y:360,w:16,h:40,type:'wood'},
      {x:620,y:340,w:56,h:16,type:'glass'},
    ]
  },
];

const BIRD_TYPES={
  red:{r:16,col:'#e74c3c',col2:'#c0392b',mass:1.2,power:1},
  yellow:{r:14,col:'#f1c40f',col2:'#d4ac0d',mass:0.9,power:1.6,special:'speed'},
  blue:{r:10,col:'#3498db',col2:'#2471a3',mass:0.6,power:0.7,special:'split'},
  black:{r:18,col:'#2c3e50',col2:'#1a252f',mass:1.6,power:2.2,special:'bomb'},
};

function angryInit(cv){
  ANGRY.best=store.get('angryBest',0);
  ANGRY.cv=cv;
  const s=gCanvas(cv,800,480,800);
  ANGRY.ctx=s.ctx;ANGRY.w=s.w;ANGRY.h=s.h;ANGRY.ground=s.h-40;
  ANGRY.sling={x:160,y:ANGRY.ground-20};
}
function angryReset(level){
  if(level!=null)ANGRY.level=level;
  const L=ANGRY_LEVELS[ANGRY.level%ANGRY_LEVELS.length];
  ANGRY.birds=L.birds.map(t=>({type:t, ...BIRD_TYPES[t]}));
  ANGRY.birdsLeft=ANGRY.birds.length;
  ANGRY.pigs=L.pigs.map(p=>({x:p.x,y:p.y,r:18,vx:0,vy:0,dead:false,hit:0,angle:0}));
  ANGRY.blocks=L.blocks.map(b=>({x:b.x,y:b.y,w:b.w,h:b.h,type:b.type,hp:b.type==='stone'?2:1,maxHp:b.type==='stone'?2:1,vx:0,vy:0,angle:0,av:0,dead:false,grounded:false}));
  ANGRY.curBird=null;ANGRY.drag={on:false,sx:0,sy:0,dx:0,dy:0};
  ANGRY.parts=[];ANGRY.score=0;ANGRY.over=false;ANGRY.win=false;ANGRY.t=0;ANGRY.trail=[];ANGRY.shake=0;ANGRY.canLaunch=true;
  angryNextBird();
  hidePremiumGO();
}
function angryNextBird(){
  if(ANGRY.birds.length===0){ANGRY.curBird=null;return;}
  const bt=ANGRY.birds.shift();
  ANGRY.curBird={
    x:ANGRY.sling.x,y:ANGRY.sling.y,
    ox:ANGRY.sling.x,oy:ANGRY.sling.y,
    vx:0,vy:0,r:bt.r,col:bt.col,col2:bt.col2,type:bt.type,mass:bt.mass,power:bt.power,special:bt.special,
    launched:false,trail:[],active:true,specialUsed:false
  };
  ANGRY.canLaunch=true;
}
function angryLaunch(dx,dy){
  const b=ANGRY.curBird;
  if(!b||b.launched)return;
  const dist=Math.sqrt(dx*dx+dy*dy);
  const maxD=90;
  const clamped=Math.min(dist,maxD);
  const ang=Math.atan2(dy,dx);
  const fx=Math.cos(ang)*clamped;
  const fy=Math.sin(ang)*clamped;
  // پرتاب برعکس کشش
  b.vx = -fx*0.18;
  b.vy = -fy*0.18;
  b.launched=true;
  b.trail=[];
  ANGRY.canLaunch=false;
  gSfx('go');
}
function angrySpecial(){
  const b=ANGRY.curBird;
  if(!b||!b.launched||b.specialUsed)return;
  b.specialUsed=true;
  if(b.special==='speed'){
    b.vx*=2.2;b.vy*=2.2;
    for(let i=0;i<12;i++)ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,a:1,col:'#f1c40f',r:2});
    gSfx('zap');
  }else if(b.special==='split'){
    const angs=[-0.35,0,0.35];
    for(let k=0;k<3;k++){
      if(k===1)continue;
      const nb={
        x:b.x,y:b.y,vx:b.vx+Math.cos(angs[k])*1.5,vy:b.vy+Math.sin(angs[k])*1.5,
        r:10,col:'#3498db',col2:'#2471a3',type:'blue',mass:0.6,power:0.7,launched:true,trail:[],active:true,specialUsed:true
      };
      ANGRY.pigs.forEach(()=>{}); // placeholder
      ANGRY._extraBirds=ANGRY._extraBirds||[];
      ANGRY._extraBirds.push(nb);
    }
    gSfx('match');
  }else if(b.special==='bomb'){
    // انفجار
    ANGRY.shake=1;
    for(let i=0;i<28;i++)ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*9,vy:(Math.random()-0.5)*9-1,a:1,col:'#f39c12',r:3+Math.random()*3});
    // آسیب به اطراف
    const rad=90;
    ANGRY.pigs.forEach(p=>{
      const dx=p.x-b.x,dy=p.y-b.y;
      if(dx*dx+dy*dy<rad*rad){p.dead=true;ANGRY.score+=1000;gSfx('line');}
    });
    ANGRY.blocks.forEach(bl=>{
      const cx=bl.x+bl.w/2,cy=bl.y+bl.h/2;
      const dx=cx-b.x,dy=cy-b.y;
      if(dx*dx+dy*dy<rad*rad){bl.hp=0;bl.dead=true;ANGRY.score+=100;}
    });
    b.active=false;
    gSfx('bad');
    setTimeout(()=>angryCheckEnd(),300);
  }
}
function angryUpdate(dt){
  ANGRY.t+=dt;
  if(ANGRY.shake>0)ANGRY.shake=Math.max(0,ANGRY.shake-dt*0.003);
  const G=ANGRY.ground;
  // bird
  const birds=[ANGRY.curBird].concat(ANGRY._extraBirds||[]).filter(Boolean);
  for(const b of birds){
    if(!b||!b.launched||!b.active)continue;
    b.vy+=0.32;
    b.vx*=0.999;b.vy*=0.999;
    b.x+=b.vx;b.y+=b.vy;
    b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>12)b.trail.pop();
    // ground
    if(b.y+b.r>G){
      b.y=G-b.r;b.vy*=-0.35;b.vx*=0.75;
      if(Math.abs(b.vy)<0.6&&Math.abs(b.vx)<0.6){
        b.vx=0;b.vy=0;b.active=false;
        for(let i=0;i<10;i++)ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*3,vy:-Math.random()*2,a:1,col:b.col,r:2});
      }
      gSfx('click');
    }
    if(b.x-b.r<0){b.x=b.r;b.vx*=-0.5;}
    if(b.x+b.r>ANGRY.w){b.x=ANGRY.w-b.r;b.vx*=-0.5;}
    // collision with blocks
    for(const bl of ANGRY.blocks){
      if(bl.dead)continue;
      if(b.x+b.r>bl.x&&b.x-b.r<bl.x+bl.w&&b.y+b.r>bl.y&&b.y-b.r<bl.y+bl.h){
        // impact
        const overlapX=Math.min(b.x+b.r-bl.x, bl.x+bl.w-(b.x-b.r));
        const overlapY=Math.min(b.y+b.r-bl.y, bl.y+bl.h-(b.y-b.r));
        if(overlapX<overlapY){b.vx*=-0.6;b.x+=b.vx>0?overlapX:-overlapX;}
        else{b.vy*=-0.6;b.y+=b.vy>0?overlapY:-overlapY;}
        bl.hp-=b.power;
        bl.vx+=b.vx*0.15;bl.vy+=b.vy*0.1;bl.av+=(Math.random()-0.5)*0.08;
        if(bl.hp<=0){bl.dead=true;ANGRY.score+=bl.type==='stone'?150:bl.type==='wood'?100:70;
          for(let i=0;i<12;i++)ANGRY.parts.push({x:bl.x+bl.w/2,y:bl.y+bl.h/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5-1,a:1,col:bl.type==='wood'?'#8d6e63':bl.type==='stone'?'#78909c':'#b0bec5',r:2+Math.random()*2});
          gSfx('line');
        }else gSfx('move');
        if(b.type!=='black')b.vx*=0.85;
      }
    }
    // collision with pigs
    for(const pig of ANGRY.pigs){
      if(pig.dead)continue;
      const dx=b.x-pig.x,dy=b.y-pig.y;
      if(dx*dx+dy*dy < (b.r+pig.r)*(b.r+pig.r)){
        pig.dead=true;ANGRY.score+=1000;
        for(let i=0;i<18;i++)ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-2,a:1,col:'#8bc34a',r:3});
        gSfx('win');
        b.vx*=0.7;
      }
    }
  }
  // cleanup extra birds
  ANGRY._extraBirds=(ANGRY._extraBirds||[]).filter(b=>b.active);

  // blocks physics
  for(const bl of ANGRY.blocks){
    if(bl.dead)continue;
    // check support
    let supported=false;
    if(bl.y+bl.h>=G-1)supported=true;
    else{
      for(const other of ANGRY.blocks){
        if(other===bl||other.dead)continue;
        if(Math.abs((other.y)-(bl.y+bl.h))<6 && bl.x+bl.w>other.x+4 && bl.x<other.x+other.w-4){supported=true;break;}
      }
    }
    if(!supported){
      bl.vy+=0.4;bl.y+=bl.vy;bl.x+=bl.vx;bl.angle+=bl.av;bl.vx*=0.98;bl.av*=0.98;
      if(bl.y+bl.h>G){bl.y=G-bl.h;bl.vy*=-0.25;bl.vx*=0.7;if(Math.abs(bl.vy)<0.8)bl.vy=0;}
    }else{
      bl.vy*=0.8;bl.vx*=0.8;
      if(Math.abs(bl.vy)<0.1)bl.vy=0;
    }
    // block vs pig crush
    for(const pig of ANGRY.pigs){
      if(pig.dead)continue;
      if(pig.x>bl.x&&pig.x<bl.x+bl.w&&pig.y+pig.r>bl.y&&pig.y-pig.r<bl.y+bl.h && bl.vy>1){
        pig.dead=true;ANGRY.score+=1000;
        for(let i=0;i<14;i++)ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,a:1,col:'#8bc34a',r:2});
      }
    }
  }
  // pigs physics
  for(const pig of ANGRY.pigs){
    if(pig.dead)continue;
    let sup=false;
    if(pig.y+pig.r>=G-1)sup=true;
    else{
      for(const bl of ANGRY.blocks){
        if(bl.dead)continue;
        if(pig.x>bl.x&&pig.x<bl.x+bl.w&&Math.abs((pig.y+pig.r)-bl.y)<8)sup=true;
      }
    }
    if(!sup){pig.vy+=0.4;pig.y+=pig.vy;if(pig.y+pig.r>G){pig.y=G-pig.r;pig.vy*=-0.2;if(Math.abs(pig.vy)<1)pig.vy=0;}}
  }

  for(const pt of ANGRY.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.15;pt.a-=0.018;}
  ANGRY.parts=ANGRY.parts.filter(p=>p.a>0);

  angryCheckEnd();
}
function angryCheckEnd(){
  if(ANGRY.over||ANGRY.win)return;
  const alivePigs=ANGRY.pigs.filter(p=>!p.dead).length;
  if(alivePigs===0){
    ANGRY.win=true;ANGRY.over=false;
    if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
    gSfx('win');
    const stage=document.querySelector('.game-stage');
    if(stage && !stage.querySelector('.gover-premium')){
      setTimeout(()=>showPremiumGO({
        title:'بردی! خوک‌ها نابود شدند!',
        sub:'همه خوک‌های سبز ترکیدند — مرحله '+gNum(ANGRY.level+1)+' تموم شد! امتیاز '+gNum(ANGRY.score),
        score:ANGRY.score,best:ANGRY.best,win:true,
        restart:()=>{angryReset();},
      }),400);
    }
    // next level auto after 2.5s? No, let user choose restart goes next
    return;
  }
  const birdsActive = (ANGRY.curBird&&ANGRY.curBird.active) || (ANGRY._extraBirds&&ANGRY._extraBirds.some(b=>b.active));
  const birdsRemaining = ANGRY.birds.length + (ANGRY.curBird?1:0);
  // if no active bird and no birds left to launch
  if(!birdsActive && ANGRY.birds.length===0 && (!ANGRY.curBird||!ANGRY.curBird.launched || !ANGRY.curBird.active)){
    // wait a bit for blocks to settle
    const movingBlocks=ANGRY.blocks.some(bl=>!bl.dead&&Math.abs(bl.vy)>0.5);
    if(movingBlocks)return;
    setTimeout(()=>{
      if(ANGRY.pigs.filter(p=>!p.dead).length>0 && !ANGRY.over){
        ANGRY.over=true;
        if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
        gSfx('bad');
        const stage=document.querySelector('.game-stage');
        if(stage && !stage.querySelector('.gover-premium')){
          showPremiumGO({
            title:'باختی! خوک‌ها هنوز زنده‌ان!',
            sub:'پرنده‌هات تموم شد — ولی می‌تونی دوباره با تیرکمون بزنی!',
            score:ANGRY.score,best:ANGRY.best,win:false,
            restart:()=>{angryReset(ANGRY.level);},
          });
        }
      }
    },800);
  }else if(!birdsActive && ANGRY.birds.length>0 && ANGRY.canLaunch===false){
    // next bird ready
    setTimeout(()=>{if(!ANGRY.over&&!ANGRY.win){angryNextBird();}},900);
  }
}
function angryDraw(){
  const c=ANGRY.ctx,W=ANGRY.w,H=ANGRY.h,G=ANGRY.ground;
  c.save();
  if(ANGRY.shake>0)c.translate((Math.random()-0.5)*ANGRY.shake*12,(Math.random()-0.5)*ANGRY.shake*10);
  // sky premium gradient
  const sky=c.createLinearGradient(0,0,0,G);
  sky.addColorStop(0,'#6ec6ff');sky.addColorStop(0.55,'#a8d8ff');sky.addColorStop(1,'#e6f3ff');
  c.fillStyle=sky;c.fillRect(0,0,W,G);
  // sun
  c.fillStyle='rgba(255,224,120,.9)';c.beginPath();c.arc(W-90,80,38,0,7);c.fill();
  c.fillStyle='rgba(255,224,120,.25)';c.beginPath();c.arc(W-90,80,58,0,7);c.fill();
  // clouds
  c.fillStyle='rgba(255,255,255,.85)';
  for(let i=0;i<5;i++){
    const cx=(ANGRY.t*0.02+i*160)% (W+120) -20;
    const cy=40+i*28;
    c.beginPath();
    c.arc(cx,cy,16,0,7);c.arc(cx+20,cy-6,18,0,7);c.arc(cx+40,cy,14,0,7);
    c.rect(cx-6,cy,52,12);c.fill();
  }
  // hills
  c.fillStyle='#8bc34a';c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.25,G-30,W*0.5,G);c.quadraticCurveTo(W*0.75,G-20,W,G);c.lineTo(W,G+40);c.lineTo(0,G+40);c.fill();
  c.fillStyle='#7ab33f';c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.35,G-18,W*0.7,G-8);c.lineTo(W,G);c.lineTo(W,G+40);c.lineTo(0,G+40);c.fill();
  // ground
  c.fillStyle='#c2a46a';c.fillRect(0,G,W,H-G);
  c.fillStyle='#a88a55';c.fillRect(0,G,W,6);
  // slingshot wood premium
  const sx=ANGRY.sling.x,sy=ANGRY.sling.y;
  c.strokeStyle='#5d4037';c.lineWidth=10;c.lineCap='round';
  c.beginPath();c.moveTo(sx-10,G);c.lineTo(sx-4,sy+8);c.stroke();
  c.beginPath();c.moveTo(sx+10,G);c.lineTo(sx+4,sy+8);c.stroke();
  c.strokeStyle='#8d6e63';c.lineWidth=8;
  c.beginPath();c.moveTo(sx-4,sy+8);c.lineTo(sx-12,sy-18);c.stroke();
  c.beginPath();c.moveTo(sx+4,sy+8);c.lineTo(sx+12,sy-18);c.stroke();
  // elastic bands
  if(ANGRY.curBird){
    const b=ANGRY.curBird;
    const bx=b.launched?b.ox:b.x, by=b.launched?b.oy:b.y;
    c.strokeStyle='rgba(60,40,30,.85)';c.lineWidth=3;
    c.beginPath();c.moveTo(sx-12,sy-18);c.lineTo(bx,by);c.stroke();
    c.beginPath();c.moveTo(sx+12,sy-18);c.lineTo(bx,by);c.stroke();
    // trajectory prediction when dragging
    if(ANGRY.drag.on && !b.launched){
      const dx=ANGRY.drag.dx,dy=ANGRY.drag.dy;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const maxD=90;
      const cl=Math.min(dist,maxD);
      const ang=Math.atan2(dy,dx);
      const fx=Math.cos(ang)*cl, fy=Math.sin(ang)*cl;
      const vx=-fx*0.18, vy=-fy*0.18;
      c.fillStyle='rgba(255,255,255,.85)';
      let px=sx,py=sy-18;
      let pvx=vx,pvy=vy;
      for(let i=0;i<22;i++){
        pvy+=0.32;pvx*=0.999;pvy*=0.999;
        px+=pvx;py+=pvy;
        if(i%2===0){c.globalAlpha=Math.max(0,1-i*0.04);c.beginPath();c.arc(px,py,3,0,7);c.fill();}
        if(py>G)break;
      }
      c.globalAlpha=1;
    }
  }

  // blocks
  for(const bl of ANGRY.blocks){
    if(bl.dead)continue;
    c.save();
    c.translate(bl.x+bl.w/2,bl.y+bl.h/2);
    c.rotate(bl.angle);
    let col='#8d6e63';
    if(bl.type==='stone')col='#78909c';
    else if(bl.type==='glass')col='#b0bec5';
    const grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
    if(bl.type==='wood'){grad.addColorStop(0,'#a1887f');grad.addColorStop(1,'#5d4037');}
    else if(bl.type==='stone'){grad.addColorStop(0,'#b0bec5');grad.addColorStop(1,'#546e7a');}
    else{grad.addColorStop(0,'rgba(200,230,255,.7)');grad.addColorStop(1,'rgba(120,180,220,.5)');}
    c.fillStyle=grad;
    c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,bl.type==='glass'?2:4);c.fill();
    if(bl.type==='wood'){
      c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;
      for(let i=1;i<3;i++){c.beginPath();c.moveTo(-bl.w/2+2,-bl.h/2+i*bl.h/3);c.lineTo(bl.w/2-2,-bl.h/2+i*bl.h/3);c.stroke();}
    }
    if(bl.type==='glass'){
      c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.roundRect(-bl.w/2+3,-bl.h/2+2,bl.w*0.3,4,2);c.fill();
    }
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,4);c.stroke();
    c.restore();
  }

  // pigs premium
  for(const pig of ANGRY.pigs){
    if(pig.dead)continue;
    c.save();
    c.translate(pig.x,pig.y);
    c.rotate(pig.angle||0);
    // body
    const pg=c.createRadialGradient(-4,-4,4,0,0,pig.r);
    pg.addColorStop(0,'#aed581');pg.addColorStop(1,'#7cb342');
    c.fillStyle=pg;c.beginPath();c.arc(0,0,pig.r,0,7);c.fill();
    // snout
    c.fillStyle='#aed581';c.beginPath();c.ellipse(0,6,9,6,0,0,7);c.fill();
    c.fillStyle='#558b2f';c.beginPath();c.arc(-3,7,1.5,0,7);c.fill();c.beginPath();c.arc(3,7,1.5,0,7);c.fill();
    // eyes
    c.fillStyle='#fff';c.beginPath();c.arc(-6,-4,5,0,7);c.fill();c.beginPath();c.arc(6,-4,5,0,7);c.fill();
    c.fillStyle='#1b5e20';c.beginPath();c.arc(-5,-2,2.2,0,7);c.fill();c.beginPath();c.arc(7,-2,2.2,0,7);c.fill();
    // eyebrows angry
    c.strokeStyle='#33691e';c.lineWidth=2;c.lineCap='round';
    c.beginPath();c.moveTo(-11,-8);c.lineTo(-2,-5);c.stroke();
    c.beginPath();c.moveTo(2,-5);c.lineTo(11,-8);c.stroke();
    c.restore();
  }

  // birds
  const allBirds=[ANGRY.curBird].concat(ANGRY._extraBirds||[]).filter(b=>b&&b.active);
  for(const b of allBirds){
    // trail
    for(let i=b.trail.length-1;i>=0;i--){
      const t=b.trail[i];
      c.globalAlpha=(i/b.trail.length)*0.25;
      c.fillStyle=b.col;c.beginPath();c.arc(t.x,t.y,b.r*0.5,0,7);c.fill();
    }
    c.globalAlpha=1;
    c.save();
    c.translate(b.x,b.y);
    c.rotate(b.vx*0.05);
    c.shadowColor='rgba(0,0,0,.25)';c.shadowBlur=8;
    const grad=c.createRadialGradient(-4,-4,3,0,0,b.r);
    grad.addColorStop(0,'#fff8e1');grad.addColorStop(0.3,b.col);grad.addColorStop(1,b.col2);
    c.fillStyle=grad;c.beginPath();c.arc(0,0,b.r,0,7);c.fill();
    // beak
    c.fillStyle='#ffca28';c.beginPath();c.moveTo(b.r-2,-2);c.lineTo(b.r+8,0);c.lineTo(b.r-2,4);c.fill();
    // eyes
    c.fillStyle='#fff';c.beginPath();c.arc(2,-4,5,0,7);c.fill();
    c.fillStyle='#212121';c.beginPath();c.arc(4,-3,2.5,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(5,-4,1,0,7);c.fill();
    // eyebrows for red
    if(b.type==='red'){
      c.strokeStyle='#b71c1c';c.lineWidth=2;c.beginPath();c.moveTo(-2,-8);c.lineTo(6,-6);c.stroke();
    }
    // special indicator
    if(b.special && !b.specialUsed){
      c.fillStyle='rgba(255,255,255,.9)';c.font='800 10px Vazirmatn';c.textAlign='center';
      c.fillText(b.special==='speed'?'SPD':b.special==='split'?'+3':b.special==='bomb'?'BOM':'',0,b.r+12);
    }
    c.restore();
  }

  // particles
  for(const pt of ANGRY.parts){
    c.globalAlpha=pt.a;c.fillStyle=pt.col;c.beginPath();c.arc(pt.x,pt.y,pt.r,0,7);c.fill();
  }
  c.globalAlpha=1;

  // UI
  c.fillStyle='#2e2a22';c.font='800 18px Vazirmatn';c.textAlign='left';
  c.fillText('امتیاز '+gNum(ANGRY.score),16,32);
  c.fillStyle='#5d4037';c.font='700 12px Vazirmatn';
  c.fillText('مرحله '+(ANGRY.level+1)+' — رکورد '+gNum(ANGRY.best)+' — پرنده‌ها '+gNum(ANGRY.birds.length+(ANGRY.curBird?1:0)),16,52);

  // birds queue
  let bx=16;
  for(let i=0;i<ANGRY.birds.length;i++){
    const bt=ANGRY.birds[i];
    c.fillStyle=bt.col;c.beginPath();c.arc(bx,70,10,0,7);c.fill();
    c.strokeStyle=bt.col2;c.lineWidth=1.5;c.beginPath();c.arc(bx,70,10,0,7);c.stroke();
    bx+=24;
  }
  if(ANGRY.curBird&&!ANGRY.curBird.launched){
    c.fillStyle='rgba(0,0,0,.12)';c.beginPath();c.ellipse(ANGRY.sling.x,ANGRY.ground-2,26,5,0,0,7);c.fill();
  }

  c.restore();
}
function angryFrame(now){
  if(!ANGRY.on)return;
  const dt=Math.min(32,now-(ANGRY.last||now));ANGRY.last=now;
  angryUpdate(dt);angryDraw();
  ANGRY.raf=requestAnimationFrame(angryFrame);
}
const angryEng={
  start(cv){
    angryInit(cv);
    if(ANGRY.raf)cancelAnimationFrame(ANGRY.raf);
    ANGRY.on=true;angryReset(ANGRY.level);
    ANGRY.last=0;ANGRY.raf=requestAnimationFrame(angryFrame);
    // input
    const getPos=e=>{
      const r=cv.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width*ANGRY.w;
      const y=(e.clientY-r.top)/r.height*ANGRY.h;
      return {x,y};
    };
    const down=e=>{
      if(!ANGRY.curBird||ANGRY.curBird.launched)return;
      const p=getPos(e);
      const dx=p.x-ANGRY.curBird.x,dy=p.y-ANGRY.curBird.y;
      if(dx*dx+dy*dy<900){
        ANGRY.drag.on=true;ANGRY.drag.sx=p.x;ANGRY.drag.sy=p.y;
        cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
      }
    };
    const move=e=>{
      if(!ANGRY.drag.on||!ANGRY.curBird||ANGRY.curBird.launched)return;
      const p=getPos(e);
      let dx=p.x-ANGRY.drag.sx,dy=p.y-ANGRY.drag.sy;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const maxD=90;
      if(dist>maxD){const a=Math.atan2(dy,dx);dx=Math.cos(a)*maxD;dy=Math.sin(a)*maxD;}
      ANGRY.drag.dx=dx;ANGRY.drag.dy=dy;
      ANGRY.curBird.x=ANGRY.sling.x+dx;
      ANGRY.curBird.y=ANGRY.sling.y+dy;
    };
    const up=e=>{
      if(!ANGRY.drag.on)return;
      ANGRY.drag.on=false;
      angryLaunch(ANGRY.drag.dx,ANGRY.drag.dy);
      ANGRY.drag.dx=0;ANGRY.drag.dy=0;
    };
    const clickSpecial=e=>{
      if(ANGRY.curBird&&ANGRY.curBird.launched&&!ANGRY.curBird.specialUsed){
        const p=getPos(e);
        const b=ANGRY.curBird;
        if(Math.hypot(p.x-b.x,p.y-b.y)<60)angrySpecial();
        else if(b.special)angrySpecial();
      }
    };
    ANGRY._down=down;ANGRY._move=move;ANGRY._up=up;ANGRY._spec=clickSpecial;
    cv.addEventListener('pointerdown',down);
    cv.addEventListener('pointermove',move);
    cv.addEventListener('pointerup',up);
    cv.addEventListener('pointerdown',clickSpecial);
  },
  stop(){
    ANGRY.on=false;
    if(ANGRY.raf)cancelAnimationFrame(ANGRY.raf);ANGRY.raf=0;
    const cv=ANGRY.cv;
    if(cv){
      if(ANGRY._down)cv.removeEventListener('pointerdown',ANGRY._down);
      if(ANGRY._move)cv.removeEventListener('pointermove',ANGRY._move);
      if(ANGRY._up)cv.removeEventListener('pointerup',ANGRY._up);
      if(ANGRY._spec)cv.removeEventListener('pointerdown',ANGRY._spec);
    }
    hidePremiumGO();
  },
  key(e){
    if(e.key===' '){
      e.preventDefault();
      if(ANGRY.curBird&&ANGRY.curBird.launched&&!ANGRY.curBird.specialUsed)angrySpecial();
      else if(ANGRY.curBird&&!ANGRY.curBird.launched){
        // launch with default power
        angryLaunch(-50,-30);
      }
      return true;
    }
    if(e.key==='Enter'){
      if(ANGRY.over||ANGRY.win){angryReset(ANGRY.over?ANGRY.level:ANGRY.level+1);return true;}
    }
    return false;
  }
};

Object.assign(GAME_ENG,{'angry':angryEng});

// patch after load
setTimeout(patchExistingGamesWithGO,300);
