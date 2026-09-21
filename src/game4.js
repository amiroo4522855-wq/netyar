/* ===== انگری بردز پرمیوم v16.0 — فیزیک واقعی پرتاب به هدف + صدای خود انگری بردز ===== */
'use strict';

/* ---------- سیستم ریستارت پرمیوم برای همه بازی‌ها ---------- */
function hidePremiumGO(){
  const el=document.querySelector('.gover-premium');
  if(el){el.classList.remove('in');setTimeout(()=>{if(el.parentNode)el.remove();},380);}
}
function showPremiumGO(opts){
  const stage=document.querySelector('.game-stage');
  if(!stage)return;
  const existing=stage.querySelector('.gover-premium');
  if(existing && existing.dataset.title===opts.title) return;
  if(existing) existing.remove();
  const isWin=!!opts.win;
  const div=document.createElement('div');
  div.className='gover-premium'+(isWin?' win':' lose');
  div.dataset.title=opts.title||'';
  const scoreHtml = opts.score!=null?'<div class="gover-stats"><span class="gs"><b>'+gNum(opts.score)+'</b> امتیاز</span>'+(opts.best!=null?'<span class="gs gold"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> '+gNum(opts.best)+' رکورد</span>':'')+'</div>':'';
  const nextBtn = isWin ? '<button class="gover-btn primary next">'+
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg> '+(opts.nextLabel||'مرحلهٔ بعد')+'</button>' : '';
  div.innerHTML=
    '<div class="gover-backdrop"></div>'+
    '<div class="gover-card">'+
      '<div class="gover-ic-wrap"><span class="gover-ic">'+(isWin?
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/><circle cx="12" cy="8" r="2.2" fill="currentColor" stroke="none"/></svg>':
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>')+
      '</span><span class="gover-glow"></span><span class="gover-ring"></span></div>'+
      '<h3 class="gover-title">'+(opts.title||(isWin?'بردی!':'باختی!'))+'</h3>'+
      '<p class="gover-sub">'+(opts.sub||'')+'</p>'+
      scoreHtml+
      '<div class="gover-acts">'+
        nextBtn+
        '<button class="gover-btn '+(isWin?'ghost':'primary')+' restart"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> '+(isWin?'دوباره همین مرحله':'شروع مجدد')+'</button>'+
        '<button class="gover-btn ghost home">بازگشت به بازی‌خانه</button>'+
      '</div>'+
    '</div>';
  stage.appendChild(div);
  requestAnimationFrame(()=>requestAnimationFrame(()=>div.classList.add('in')));
  const bNext=div.querySelector('.gover-btn.next');
  const bRestart=div.querySelector('.gover-btn.restart');
  const bHome=div.querySelector('.gover-btn.home');
  if(bNext) bNext.onclick=(e)=>{e.stopPropagation();hidePremiumGO();try{gSfx('click');}catch(x){};opts.onNext&&opts.onNext();};
  if(bRestart) bRestart.onclick=(e)=>{e.stopPropagation();hidePremiumGO();try{gSfx('click');}catch(x){};opts.restart&&opts.restart();};
  if(bHome) bHome.onclick=(e)=>{e.stopPropagation();hidePremiumGO();go('games');};
  div.querySelector('.gover-backdrop').onclick=()=>hidePremiumGO();
}
function patchExistingGamesWithGO(){
  try{
    const wrap=(obj,drawName,checkOver,makeOpts)=>{
      if(!obj||typeof window[drawName]!=='function') return;
      if(window[drawName]._patched) return;
      const orig=window[drawName];
      window[drawName]=function(){
        orig();
        try{
          if(checkOver()){
            const st=document.querySelector('.game-stage');
            if(st && !st.querySelector('.gover-premium')){showPremiumGO(makeOpts());}
          }else{
            const s=document.querySelector('.gover-premium');
            if(s && !s.classList.contains('win')) hidePremiumGO();
          }
        }catch(e){}
      };
      window[drawName]._patched=true;
    };
    wrap(typeof DINO!=='undefined'?DINO:null,'dinoDraw',()=>DINO.over,()=>({title:'آخ! گاز گرفتی!',sub:'دایی ناصر به مانع خورد — دوباره بدو!',score:DINO.score,best:DINO.best,win:false,restart:()=>dinoReset()}));
    wrap(typeof TWR!=='undefined'?TWR:null,'twrDraw',()=>TWR.over,()=>({title:'برجت فرو ریخت!',sub:'یک میلی‌متر خطا کافی بود!',score:TWR.score,best:TWR.best,win:false,restart:()=>twrReset()}));
    wrap(typeof FLAP!=='undefined'?FLAP:null,'flapDraw',()=>FLAP.over,()=>({title:'افتادی!',sub:'فنجان به لوله خورد!',score:FLAP.score,best:FLAP.best,win:false,restart:()=>flapReset()}));
    wrap(typeof BRK!=='undefined'?BRK:null,'brkDraw',()=>BRK.over,()=>{const win=BRK.bricks.length===0;return {title:win?'بردی!':'باختی!',sub:win?'همه آجرها شکست!':'توپ افتاد!',score:BRK.score,best:BRK.best,win:win,restart:()=>brkReset()};});
    wrap(typeof BUB!=='undefined'?BUB:null,'bubDraw',()=>BUB.over,()=>({title:'زمان تمام!',sub:'حباب‌ها فرار کردند!',score:BUB.score,best:BUB.best,win:false,restart:()=>bubReset()}));
    wrap(typeof TET!=='undefined'?TET:null,'tetDraw',()=>TET.over,()=>({title:'بازی تمام!',sub:'بلوک‌ها تا سقف رسیدند!',score:TET.score,best:TET.best,win:false,restart:()=>tetReset()}));
    wrap(typeof SNK!=='undefined'?SNK:null,'snkDraw',()=>SNK.over,()=>({title:'مار گیر کرد!',sub:'به دیوار یا خودش خورد!',score:SNK.score,best:SNK.best,win:false,restart:()=>snkReset()}));
  }catch(e){}
}

/* ================================================================
   انگری بردز v16 — پرتاب واقعی با فیزیک سهموی + صدای واقعی
   ================================================================ */
/* --- صدای واقعی انگری بردز با WebAudio --- */
let angryAudio=null;
function angryEnsureAudio(){
  try{
    if(!angryAudio){angryAudio=new (window.AudioContext||window.webkitAudioContext)();}
    if(angryAudio.state==='suspended') angryAudio.resume();
    return angryAudio;
  }catch(e){return null;}
}
function angrySfx(type){
  const AC=angryEnsureAudio();
  if(!AC) return;
  const now=AC.currentTime;
  try{
    if(type==='launch'){
      // whoosh پرتاب: sweep 400->90 Hz + نویز بادی
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(420,now);o.frequency.exponentialRampToValueAtTime(90,now+0.32);
      g.gain.setValueAtTime(0.85,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.38);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.4);
      // کش تیرکمون twang
      const o2=AC.createOscillator(), g2=AC.createGain();
      o2.type='triangle';o2.frequency.setValueAtTime(180,now);o2.frequency.linearRampToValueAtTime(60,now+0.18);
      g2.gain.setValueAtTime(0.5,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.22);
      o2.connect(g2);g2.connect(AC.destination);o2.start(now);o2.stop(now+0.24);
    }else if(type==='pig'){
      // oink خوک: دو نت سریع
      for(let k=0;k<2;k++){
        const o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter();
        f.type='lowpass';f.frequency.value=1200;
        o.type='sawtooth';o.frequency.setValueAtTime(k?620:320,now+k*0.12);o.frequency.linearRampToValueAtTime(k?380:180,now+k*0.12+0.18);
        g.gain.setValueAtTime(0.6,now+k*0.12);g.gain.exponentialRampToValueAtTime(0.001,now+k*0.12+0.22);
        o.connect(f);f.connect(g);g.connect(AC.destination);o.start(now+k*0.12);o.stop(now+k*0.12+0.24);
      }
    }else if(type==='wood'){
      // ترک چوب: نویز فیلتر شده + کلیک
      const buf=AC.createBuffer(1, AC.sampleRate*0.18, AC.sampleRate);
      const ch=buf.getChannelData(0);
      for(let i=0;i<ch.length;i++) ch[i]=(Math.random()*2-1)*Math.pow(1-i/ch.length,1.5);
      const src=AC.createBufferSource();src.buffer=buf;
      const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=900;bp.Q.value=0.8;
      const g=AC.createGain();g.gain.setValueAtTime(0.7,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.2);
      src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start(now);
      const o=AC.createOscillator(), g2=AC.createGain();
      o.frequency.setValueAtTime(120,now);o.frequency.linearRampToValueAtTime(40,now+0.12);
      g2.gain.setValueAtTime(0.5,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.14);
      o.connect(g2);g2.connect(AC.destination);o.start(now);o.stop(now+0.16);
    }else if(type==='stone'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='square';o.frequency.setValueAtTime(90,now);o.frequency.exponentialRampToValueAtTime(30,now+0.22);
      g.gain.setValueAtTime(0.6,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.26);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.28);
    }else if(type==='bounce'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.frequency.setValueAtTime(180,now);g.gain.setValueAtTime(0.22,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.12);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.13);
    }else if(type==='win'){
      // تشویق پیروزی: آرپژ ماژور شاد
      const notes=[261.63,329.63,392.00,523.25,659.25];
      notes.forEach((f,i)=>{
        const o=AC.createOscillator(), g=AC.createGain();
        o.type=i%2?'sine':'triangle';o.frequency.value=f;
        g.gain.setValueAtTime(0,now+i*0.09);g.gain.linearRampToValueAtTime(0.45,now+i*0.09+0.02);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.09+0.6);
        o.connect(g);g.connect(AC.destination);o.start(now+i*0.09);o.stop(now+i*0.09+0.65);
      });
      // دست زدن شبیه سازی با نویز
      for(let k=0;k<3;k++){
        const buf=AC.createBuffer(1, AC.sampleRate*0.06, AC.sampleRate);
        const ch=buf.getChannelData(0);
        for(let i=0;i<ch.length;i++) ch[i]=(Math.random()*2-1)*(i<ch.length*0.15?1:0.2);
        const src=AC.createBufferSource();src.buffer=buf;
        const g=AC.createGain();g.gain.setValueAtTime(0.5,now+0.5+k*0.13);g.gain.exponentialRampToValueAtTime(0.001,now+0.5+k*0.13+0.08);
        src.connect(g);g.connect(AC.destination);src.start(now+0.5+k*0.13);
      }
    }else if(type==='special'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(200,now);o.frequency.linearRampToValueAtTime(800,now+0.18);
      g.gain.setValueAtTime(0.5,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.22);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.24);
    }
  }catch(e){}
}

const ANGRY={
  cv:null,ctx:null,w:800,h:480,on:false,over:false,win:false,raf:0,last:0,
  ground:0,sling:{x:160,y:0},birdsQueue:[],cur:null,extras:[],
  pigs:[],blocks:[],parts:[],scorePop:[],score:0,best:0,level:0,t:0,shake:0,
  drag:{on:false,sx:0,sy:0,dx:0,dy:0,active:false},
  canLaunch:true,idleT:0,birdsLeft:0,settling:0
};
const GRAV=0.24; // کمتر → پرواز بیشتر، سهموی واقعی
const AIR=0.9998; // هوا کمتر
const MAX_STRETCH=110; // بیشتر → قدرت بیشتر
const LAUNCH_POW=0.26; // قوی‌تر
const MIN_LAUNCH=12; // آستانه

const BIRD_TYPES={
  red:{r:16,col:'#e74c3c',col2:'#a93226',mass:1.2,power:1,desc:'معمولی'},
  yellow:{r:14,col:'#f4d03f',col2:'#b7950b',mass:0.9,power:1.2,special:'speed',desc:'سرعتی'},
  blue:{r:10,col:'#5dade2',col2:'#21618c',mass:0.6,power:0.7,special:'split',desc:'سه‌تایی'},
  black:{r:18,col:'#2c3e50',col2:'#1a252f',mass:1.6,power:2.2,special:'bomb',desc:'انفجاری'},
};

const LEVELS=[
  {
    name:'طلوع صحرا',
    birds:['red','red','yellow'],
    pigs:[{x:580,y:0},{x:650,y:0}],
    blocks:[
      {x:560,y:0,w:16,h:60,type:'wood'},{x:680,y:0,w:16,h:60,type:'wood'},
      {x:560,y:0,w:136,h:16,type:'wood',yOff:-60},
      {x:600,y:0,w:16,h:40,type:'wood',yOff:-100},{x:640,y:0,w:16,h:40,type:'wood',yOff:-100},
      {x:600,y:0,w:56,h:16,type:'stone',yOff:-116},
    ]
  },
  {
    name:'برج جنگلی',
    birds:['red','yellow','blue','black'],
    pigs:[{x:620,y:0},{x:620,y:0,yOff:-80},{x:700,y:0}],
    blocks:[
      {x:580,y:0,w:16,h:60,type:'wood'},{x:660,y:0,w:16,h:60,type:'wood'},
      {x:580,y:0,w:96,h:16,type:'wood',yOff:-60},
      {x:580,y:0,w:16,h:60,type:'wood',yOff:-120},{x:660,y:0,w:16,h:60,type:'wood',yOff:-120},
      {x:580,y:0,w:96,h:16,type:'stone',yOff:-180},
      {x:610,y:0,w:16,h:40,type:'glass',yOff:-220},{x:635,y:0,w:16,h:40,type:'glass',yOff:-220},
      {x:610,y:0,w:41,h:16,type:'wood',yOff:-236},
      {x:700,y:0,w:16,h:60,type:'wood'},{x:740,y:0,w:16,h:60,type:'wood'},
      {x:700,y:0,w:56,h:16,type:'wood',yOff:-60},
    ]
  },
  {
    name:'قلعه سنگی',
    birds:['red','red','yellow','blue','black'],
    pigs:[{x:560,y:0},{x:640,y:0},{x:720,y:0},{x:640,y:0,yOff:-100}],
    blocks:[
      {x:540,y:0,w:16,h:100,type:'stone'},{x:760,y:0,w:16,h:100,type:'stone'},
      {x:540,y:0,w:236,h:16,type:'stone',yOff:-100},
      {x:580,y:0,w:16,h:60,type:'wood',yOff:-160},{x:700,y:0,w:16,h:60,type:'wood',yOff:-160},
      {x:580,y:0,w:136,h:16,type:'wood',yOff:-220},
      {x:610,y:0,w:16,h:40,type:'glass',yOff:-260},{x:670,y:0,w:16,h:40,type:'glass',yOff:-260},
      {x:610,y:0,w:76,h:16,type:'stone',yOff:-276},
      {x:620,y:0,w:16,h:40,type:'wood'},{x:660,y:0,w:16,h:40,type:'wood'},
      {x:620,y:0,w:56,h:16,type:'glass',yOff:-40},
    ]
  },
  {
    name:'معبد شیشه‌ای',
    birds:['blue','blue','yellow','red','black'],
    pigs:[{x:600,y:0},{x:680,y:0},{x:640,y:0,yOff:-70},{x:640,y:0,yOff:-150}],
    blocks:[
      {x:560,y:0,w:16,h:40,type:'glass'},{x:720,y:0,w:16,h:40,type:'glass'},
      {x:560,y:0,w:176,h:16,type:'glass',yOff:-40},
      {x:580,y:0,w:16,h:50,type:'wood',yOff:-90},{x:700,y:0,w:16,h:50,type:'wood',yOff:-90},
      {x:580,y:0,w:136,h:16,type:'wood',yOff:-140},
      {x:600,y:0,w:16,h:50,type:'glass',yOff:-190},{x:680,y:0,w:16,h:50,type:'glass',yOff:-190},
      {x:600,y:0,w:96,h:16,type:'stone',yOff:-240},
      {x:630,y:0,w:16,h:40,type:'wood',yOff:-280},{x:650,y:0,w:16,h:40,type:'wood',yOff:-280},
      {x:630,y:0,w:36,h:16,type:'wood',yOff:-296},
    ]
  },
];

function angryInit(cv){
  ANGRY.best=store.get('angryBest',0);
  ANGRY.cv=cv;
  const s=gCanvas(cv,800,480,800);
  ANGRY.ctx=s.ctx;ANGRY.w=s.w;ANGRY.h=s.h;ANGRY.ground=s.h-40;
  ANGRY.sling={x:160,y:ANGRY.ground-20};
}
function buildLevel(idx){
  const L=LEVELS[idx%LEVELS.length];
  const G=ANGRY.ground;
  ANGRY.pigs=L.pigs.map(p=>{
    const yOff=p.yOff||0;
    return {x:p.x,y:G-18+yOff,r:18,vx:0,vy:0,dead:false,angle:0,av:0,wob:Math.random()*6.28,bob:0,grounded:false};
  });
  ANGRY.blocks=L.blocks.map(b=>{
    const yOff=b.yOff||0;
    const h=b.h,w=b.w;
    return {x:b.x,y:G-h+yOff,w:w,h:h,type:b.type,hp:b.type==='stone'?2:1,maxHp:b.type==='stone'?2:1,vx:0,vy:0,angle:0,av:0,dead:false,grounded:false,settled:false};
  });
  for(const pig of ANGRY.pigs){
    for(const bl of ANGRY.blocks){
      if(!bl.dead && pig.x>bl.x-4 && pig.x<bl.x+bl.w+4 && Math.abs((pig.y+pig.r)-(bl.y))<10){
        pig.y=bl.y-pig.r;break;
      }
    }
  }
}
function angryReset(level){
  if(level!=null) ANGRY.level = ((level%LEVELS.length)+LEVELS.length)%LEVELS.length;
  const L=LEVELS[ANGRY.level];
  ANGRY.birdsQueue=L.birds.map(t=>({type:t, ...BIRD_TYPES[t]}));
  buildLevel(ANGRY.level);
  ANGRY.cur=null;ANGRY.extras=[];ANGRY.parts=[];ANGRY.scorePop=[];
  ANGRY.score=0;ANGRY.over=false;ANGRY.win=false;ANGRY.t=0;ANGRY.shake=0;ANGRY.canLaunch=true;ANGRY.idleT=0;ANGRY.settling=0;
  ANGRY.drag={on:false,sx:0,sy:0,dx:0,dy:0,active:false};
  ANGRY.birdsLeft=ANGRY.birdsQueue.length;
  angryNextBird(true);
  hidePremiumGO();
}
function angryNextBird(immediate){
  if(ANGRY.birdsQueue.length===0){ANGRY.cur=null;ANGRY.canLaunch=false;return;}
  const bt=ANGRY.birdsQueue.shift();
  ANGRY.birdsLeft=ANGRY.birdsQueue.length + 1;
  ANGRY.cur={
    x:ANGRY.sling.x,y:ANGRY.sling.y-18,
    ox:ANGRY.sling.x,oy:ANGRY.sling.y-18,
    vx:0,vy:0,r:bt.r,col:bt.col,col2:bt.col2,type:bt.type,mass:bt.mass,power:bt.power,special:bt.special,
    launched:false,active:true,trail:[],specialUsed:false,idle:0,rot:0
  };
  ANGRY.canLaunch=true;
  ANGRY.drag.active=false;
  if(!immediate){
    const startX=40, startY=ANGRY.ground-10;
    ANGRY.cur.x=startX;ANGRY.cur.y=startY;
    const anim=(t0)=>{
      if(!ANGRY.cur || ANGRY.cur.launched) return;
      const p=Math.min(1,(performance.now()-t0)/420);
      const e=1-Math.pow(1-p,3);
      ANGRY.cur.x = startX + (ANGRY.sling.x-startX)*e;
      ANGRY.cur.y = startY + (ANGRY.sling.y-18-startY)*e;
      if(p<1) requestAnimationFrame(()=>anim(t0));
    };
    anim(performance.now());
  }
}
function angryLaunch(dx,dy){
  const b=ANGRY.cur;
  if(!b||b.launched||!ANGRY.canLaunch) return;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<MIN_LAUNCH) return;
  const clamped=Math.min(dist,MAX_STRETCH);
  const ang=Math.atan2(dy,dx);
  const fx=Math.cos(ang)*clamped;
  const fy=Math.sin(ang)*clamped;
  // پرتاب واقعی: معکوس کشش + قدرت بیشتر
  b.vx = -fx*LAUNCH_POW;
  b.vy = -fy*LAUNCH_POW;
  // بوست عمودی قوی برای پرتاب‌های کم‌ارتفاع → مسیر سهموی واقعی به هدف
  // اگر زاویه خیلی افقیه، کمی به بالا هل بده تا هوا بره
  if(b.vy>-2){
    b.vy -= 2.8 + (1 - Math.min(1, Math.abs(fy)/MAX_STRETCH))*1.5;
  }
  // اگر خیلی به چپ کشیده، قدرت افقی بیشتر
  if(Math.abs(fx)>60) b.vx*=1.08;
  b.launched=true;
  b.trail=[];
  ANGRY.canLaunch=false;
  ANGRY.drag.active=false;
  ANGRY.idleT=0;
  angrySfx('launch');
  try{gSfx('go');}catch(e){}
}
function angrySpecial(){
  const b=ANGRY.cur;
  if(!b||!b.launched||!b.active||b.specialUsed) return;
  b.specialUsed=true;
  if(b.special==='speed'){
    const sp=2.35;
    b.vx*=sp;b.vy*=sp;
    for(let i=0;i<14;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7,a:1,col:'#f4d03f',r:2+Math.random()*2,ay:0.08});
    ANGRY.shake=0.35;
    angrySfx('special');try{gSfx('zap');}catch(e){}
  }else if(b.special==='split'){
    const baseAng=Math.atan2(b.vy,b.vx);
    const speed=Math.hypot(b.vx,b.vy);
    const spread=0.42;
    for(let k=-1;k<=1;k++){
      if(k===0) continue;
      const ang=baseAng+k*spread;
      ANGRY.extras.push({
        x:b.x,y:b.y,
        vx:Math.cos(ang)*speed*0.95,vy:Math.sin(ang)*speed*0.95,
        r:10,col:'#5dade2',col2:'#21618c',type:'blue',mass:0.6,power:0.7,
        launched:true,active:true,trail:[],specialUsed:true,idle:0,rot:0
      });
    }
    for(let i=0;i<10;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,a:1,col:'#5dade2',r:2,ay:0.06});
    angrySfx('special');try{gSfx('match');}catch(e){}
  }else if(b.special==='bomb'){
    ANGRY.shake=1.2;
    for(let i=0;i<32;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10-1,a:1,col:i%2?'#f39c12':'#e74c3c',r:3+Math.random()*3,ay:0.12});
    const rad=108;
    ANGRY.pigs.forEach(p=>{
      if(p.dead) return;
      const dx=p.x-b.x,dy=p.y-b.y;
      if(dx*dx+dy*dy<rad*rad){
        p.dead=true;ANGRY.score+=1000;
        ANGRY.scorePop.push({x:p.x,y:p.y-18,txt:'+1000',a:1,vy:-1.2});
        for(let i=0;i<16;i++) ANGRY.parts.push({x:p.x,y:p.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-1,a:1,col:'#8bc34a',r:2.5,ay:0.1});
      }
    });
    ANGRY.blocks.forEach(bl=>{
      if(bl.dead) return;
      const cx=bl.x+bl.w/2,cy=bl.y+bl.h/2;
      const dx=cx-b.x,dy=cy-b.y;
      if(dx*dx+dy*dy<rad*rad){
        bl.hp=0;bl.dead=true;ANGRY.score+=bl.type==='stone'?150:100;
        ANGRY.scorePop.push({x:cx,y:cy,txt:'+'+(bl.type==='stone'?150:100),a:1,vy:-1});
        for(let i=0;i<14;i++) ANGRY.parts.push({x:cx,y:cy,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-1,a:1,col:bl.type==='wood'?'#8d6e63':bl.type==='stone'?'#78909c':'#b0bec5',r:2.5,ay:0.12});
      }else if(dx*dx+dy*dy<(rad+40)*(rad+40)){
        bl.vx+=(Math.random()-0.5)*4;bl.vy+=-2;bl.av+=(Math.random()-0.5)*0.12;
      }
    });
    b.active=false;
    angrySfx('stone');try{gSfx('bad');}catch(e){}
    setTimeout(()=>angryCheckEnd(),200);
  }
}
function rectCircleCollide(rx,ry,rw,rh,cx,cy,cr){
  const closestX=Math.max(rx,Math.min(cx,rx+rw));
  const closestY=Math.max(ry,Math.min(cy,ry+rh));
  const dx=cx-closestX,dy=cy-closestY;
  return {hit:dx*dx+dy*dy<cr*cr,dx,dy,closestX,closestY};
}
function angryUpdate(dt){
  ANGRY.t+=dt;
  if(ANGRY.shake>0) ANGRY.shake=Math.max(0,ANGRY.shake-dt*0.0025);
  const G=ANGRY.ground;
  const allBirds=[ANGRY.cur].concat(ANGRY.extras).filter(b=>b&&b.active);

  for(const b of allBirds){
    if(!b.launched) continue;
    b.vy+=GRAV;
    b.vx*=AIR;b.vy*=AIR;
    b.x+=b.vx;b.y+=b.vy;
    b.rot=Math.atan2(b.vy,b.vx);
    b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>14)b.trail.pop();
    b.idle = (Math.hypot(b.vx,b.vy)<0.7) ? (b.idle||0)+dt : 0;

    if(b.y+b.r>G){
      b.y=G-b.r;
      b.vy*=-0.32;b.vx*=0.78;
      b.av=(b.av||0)*0.8;
      if(b.idle>600){b.active=false;}
      if(Math.abs(b.vy)>1) angrySfx('bounce');
    }
    if(b.x-b.r<0){b.x=b.r;b.vx*=-0.5;}
    if(b.x+b.r>ANGRY.w){b.x=ANGRY.w-b.r;b.vx*=-0.5;if(Math.abs(b.vx)<1) b.active=false;}

    for(const bl of ANGRY.blocks){
      if(bl.dead) continue;
      const rc=rectCircleCollide(bl.x,bl.y,bl.w,bl.h,b.x,b.y,b.r);
      if(rc.hit){
        const len=Math.hypot(rc.dx,rc.dy)||1;
        const nx=rc.dx/len, ny=rc.dy/len;
        const overlap=b.r - Math.hypot(b.x-rc.closestX,b.y-rc.closestY);
        b.x+=nx* (overlap+1);
        b.y+=ny* (overlap+1);
        const dot=b.vx*nx + b.vy*ny;
        b.vx-=2*dot*nx*0.65;
        b.vy-=2*dot*ny*0.65;
        bl.hp-=b.power*(0.7+Math.hypot(b.vx,b.vy)*0.08);
        bl.vx+=b.vx*0.12;bl.vy+=b.vy*0.08;bl.av+=(Math.random()-0.5)*0.06 + b.vx*0.002;
        if(bl.hp<=0){
          bl.dead=true;ANGRY.score+=bl.type==='stone'?150:bl.type==='wood'?100:70;
          ANGRY.scorePop.push({x:bl.x+bl.w/2,y:bl.y,txt:'+'+(bl.type==='stone'?150:bl.type==='wood'?100:70),a:1,vy:-1.1});
          for(let i=0;i<14;i++) ANGRY.parts.push({x:bl.x+bl.w/2,y:bl.y+bl.h/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5-1.2,a:1,col:bl.type==='wood'?'#8d6e63':bl.type==='stone'?'#90a4ae':'#b3e5fc',r:2+Math.random()*2.5,ay:0.12});
          angrySfx(bl.type==='wood'?'wood':'stone');
        }else{
          angrySfx('bounce');
        }
      }
    }
    for(const pig of ANGRY.pigs){
      if(pig.dead) continue;
      const dx=b.x-pig.x,dy=b.y-pig.y;
      if(dx*dx+dy*dy < (b.r+pig.r)*(b.r+pig.r)*0.92){
        pig.dead=true;ANGRY.score+=1000;
        ANGRY.scorePop.push({x:pig.x,y:pig.y-20,txt:'+1000',a:1,vy:-1.3});
        for(let i=0;i<20;i++) ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-1.5,a:1,col:'#8bc34a',r:2.5+Math.random()*2,ay:0.11});
        angrySfx('pig');
        b.vx*=0.82;b.vy*=0.82;
        ANGRY.shake=Math.max(ANGRY.shake,0.5);
      }
    }
  }
  ANGRY.extras=ANGRY.extras.filter(b=>b.active);

  for(const bl of ANGRY.blocks){
    if(bl.dead) continue;
    let grounded=false;
    if(bl.y+bl.h>=G-0.5) grounded=true;
    else{
      for(const other of ANGRY.blocks){
        if(other===bl||other.dead) continue;
        if(other.y+other.h<=bl.y+6 && other.y+other.h>=bl.y-12 && bl.x+bl.w>other.x+6 && bl.x<other.x+other.w-6){
          if(other.grounded||other.y+other.h>=G-0.5){grounded=true;break;}
        }
      }
    }
    bl.grounded=grounded;
    if(!grounded){
      bl.vy+=0.42;bl.vx*=0.998;bl.av*=0.995;
      bl.y+=bl.vy;bl.x+=bl.vx;bl.angle+=bl.av;
      if(bl.y+bl.h>G){bl.y=G-bl.h;bl.vy*=-0.28;bl.vx*=0.72;bl.av*=0.7;if(Math.abs(bl.vy)<0.7)bl.vy=0;}
      if(bl.x<0){bl.x=0;bl.vx*=-0.4;}
      if(bl.x+bl.w>ANGRY.w){bl.x=ANGRY.w-bl.w;bl.vx*=-0.4;}
    }else{
      bl.vy*=0.75;bl.vx*=0.82;bl.av*=0.82;
      if(Math.abs(bl.vy)<0.05) bl.vy=0;
    }
  }
  for(let i=0;i<ANGRY.blocks.length;i++){
    const a=ANGRY.blocks[i];if(a.dead) continue;
    for(let j=i+1;j<ANGRY.blocks.length;j++){
      const b=ANGRY.blocks[j];if(b.dead) continue;
      if(a.x<a.x+b.w&&a.x+a.w>b.x&&a.y<a.y+b.h&&a.y+a.h>b.y){
        const ox=Math.min(a.x+a.w-b.x,b.x+b.w-a.x);
        const oy=Math.min(a.y+a.h-b.y,b.y+b.h-a.y);
        if(ox<oy){
          if(a.x<b.x){a.x-=ox/2;b.x+=ox/2;}else{a.x+=ox/2;b.x-=ox/2;}
          a.vx*=-0.2;b.vx*=-0.2;
        }else{
          if(a.y<b.y){a.y-=oy/2;b.y+=oy/2;}else{a.y+=oy/2;b.y-=oy/2;}
          a.vy*=-0.2;b.vy*=-0.2;
        }
      }
    }
  }
  for(const pig of ANGRY.pigs){
    if(pig.dead) continue;
    pig.wob+=0.06;pig.bob=Math.sin(ANGRY.t*0.005+pig.wob)*0.6;
    let sup=false;
    if(pig.y+pig.r>=G-0.5) sup=true;
    else{
      for(const bl of ANGRY.blocks){
        if(bl.dead) continue;
        if(pig.x>bl.x&&pig.x<bl.x+bl.w&&Math.abs((pig.y+pig.r)-bl.y)<9) sup=true;
      }
    }
    pig.grounded=sup;
    if(!sup){pig.vy+=0.42;pig.y+=pig.vy;pig.angle+=pig.av||0;if(pig.y+pig.r>G){pig.y=G-pig.r;pig.vy*=-0.2;if(Math.abs(pig.vy)<0.8)pig.vy=0;}}
    for(const bl of ANGRY.blocks){
      if(bl.dead) continue;
      if(bl.vy>1.2 && pig.x>bl.x&&pig.x<bl.x+bl.w&&pig.y+pig.r>bl.y&&pig.y-pig.r<bl.y+bl.h){
        pig.dead=true;ANGRY.score+=1000;
        ANGRY.scorePop.push({x:pig.x,y:pig.y-20,txt:'+1000',a:1,vy:-1.3});
        for(let i=0;i<18;i++) ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-1,a:1,col:'#8bc34a',r:2.5,ay:0.11});
        angrySfx('pig');
      }
    }
  }

  for(const pt of ANGRY.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=pt.ay||0.12;pt.vx*=0.99;pt.a-=0.017;}
  ANGRY.parts=ANGRY.parts.filter(p=>p.a>0);
  for(const sp of ANGRY.scorePop){sp.y+=sp.vy;sp.vy+=0.04;sp.a-=0.016;}
  ANGRY.scorePop=ANGRY.scorePop.filter(s=>s.a>0);

  const alivePigs=ANGRY.pigs.filter(p=>!p.dead).length;
  if(alivePigs===0 && !ANGRY.win){
    ANGRY.win=true;ANGRY.over=false;
    if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
    angrySfx('win');
    ANGRY.settling=0;
    setTimeout(()=>{
      if(ANGRY.win){
        const isLast=ANGRY.level===LEVELS.length-1;
        showPremiumGO({
          title:isLast?'همه مراحل تموم شد! قهرمان انگری!':'مرحله '+gNum(ANGRY.level+1)+' پاک شد!',
          sub: (isLast?'تمام '+gNum(LEVELS.length)+' قلعه رو با خاک یکسان کردی!':'همه خوک‌ها نابود شدند — برو مرحله بعد، سخت‌تره!')+' امتیاز '+gNum(ANGRY.score),
          score:ANGRY.score,best:ANGRY.best,win:true,
          nextLabel: isLast?'از اول شروع کن':'مرحلهٔ بعد',
          onNext:()=>{angryReset(isLast?0:ANGRY.level+1);},
          restart:()=>{angryReset(ANGRY.level);}
        });
      }
    },500);
    return;
  }
  const activeBirds = (ANGRY.cur&&ANGRY.cur.active&&ANGRY.cur.launched) || ANGRY.extras.some(b=>b.active);
  const hasBirdsToLaunch = ANGRY.birdsQueue.length>0 || (ANGRY.cur&&!ANGRY.cur.launched);
  if(!activeBirds && !hasBirdsToLaunch && alivePigs>0 && !ANGRY.over && !ANGRY.win){
    const moving = ANGRY.blocks.some(bl=>!bl.dead&& (Math.abs(bl.vy)>0.6||Math.abs(bl.vx)>0.6)) || ANGRY.pigs.some(p=>!p.dead&&Math.abs(p.vy)>0.6);
    if(moving){
      ANGRY.settling+=dt;
      if(ANGRY.settling<1200) return;
    }
    ANGRY.over=true;
    if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
    angrySfx('pig');
    setTimeout(()=>{
      if(ANGRY.over && !ANGRY.win){
        showPremiumGO({
          title:'خوک‌ها هنوز زنده‌ان!',
          sub:'پرنده‌هات تموم شد و '+gNum(alivePigs)+' خوک باقی مونده — دوباره تیرکمون رو بکش!',
          score:ANGRY.score,best:ANGRY.best,win:false,
          restart:()=>{angryReset(ANGRY.level);}
        });
      }
    },600);
  }else if(!activeBirds && hasBirdsToLaunch && ANGRY.birdsQueue.length>0 && !ANGRY.cur?.launched){
    if(ANGRY.idleT===0) ANGRY.idleT=ANGRY.t;
    if(ANGRY.t-ANGRY.idleT>700){
      angryNextBird(false);
      ANGRY.idleT=0;
    }
  }else if(activeBirds){
    ANGRY.idleT=0;ANGRY.settling=0;
  }
}
function angryCheckEnd(){}
function angryDraw(){
  const c=ANGRY.ctx,W=ANGRY.w,H=ANGRY.h,G=ANGRY.ground;
  c.save();
  if(ANGRY.shake>0) c.translate((Math.random()-0.5)*ANGRY.shake*14,(Math.random()-0.5)*ANGRY.shake*10);

  const sky=c.createLinearGradient(0,0,0,G);
  sky.addColorStop(0,'#5fb8ff');sky.addColorStop(0.18,'#7ec8ff');sky.addColorStop(0.55,'#b8e0ff');sky.addColorStop(1,'#eaf6ff');
  c.fillStyle=sky;c.fillRect(0,0,W,G);
  const vig=c.createRadialGradient(W*0.5,G*0.2,0,W*0.5,G*0.2,G);
  vig.addColorStop(0,'rgba(255,255,255,0)');vig.addColorStop(1,'rgba(0,20,60,.08)');
  c.fillStyle=vig;c.fillRect(0,0,W,G);

  c.save();
  c.globalAlpha=0.95;
  const sunG=c.createRadialGradient(W-88,78,6,W-88,78,42);
  sunG.addColorStop(0,'rgba(255,245,180,1)');sunG.addColorStop(0.35,'rgba(255,224,120,.6)');sunG.addColorStop(1,'rgba(255,224,120,0)');
  c.fillStyle=sunG;c.beginPath();c.arc(W-88,78,42,0,7);c.fill();
  c.fillStyle='#ffe88a';c.beginPath();c.arc(W-88,78,26,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(W-96,68,7,0,7);c.fill();
  c.restore();

  c.fillStyle='rgba(255,255,255,.92)';
  for(let i=0;i<5;i++){
    const speed=0.04+i*0.015;
    const cx=((ANGRY.t*speed + i*170) % (W+140)) - 40;
    const cy=38+i*30 + Math.sin(ANGRY.t*0.001+i)*4;
    const sc=0.9+i*0.08;
    c.globalAlpha=0.72;
    c.beginPath();
    c.arc(cx,cy,15*sc,0,7);c.arc(cx+18*sc,cy-5*sc,17*sc,0,7);c.arc(cx+36*sc,cy,13*sc,0,7);
    c.rect(cx-5*sc,cy,46*sc,11*sc);c.fill();
  }
  c.globalAlpha=1;

  c.fillStyle='#8bc34a';
  c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.22,G-32,W*0.48,G-6);c.quadraticCurveTo(W*0.72,G-24,W,G-4);c.lineTo(W,G+40);c.lineTo(0,G+40);c.fill();
  c.fillStyle='#7ab33f';
  c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.34,G-16,W*0.68,G-8);c.lineTo(W,G);c.lineTo(W,G+40);c.lineTo(0,G+40);c.fill();

  c.fillStyle='#c2a46a';c.fillRect(0,G,W,H-G);
  c.fillStyle='#a88a55';c.fillRect(0,G,W,7);
  c.fillStyle='rgba(0,0,0,.07)';
  for(let i=0;i<W;i+=32){c.fillRect((i+ANGRY.t*0.06)%W,G+12,18,2.5);}
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(0,G, W,1.5);

  const sx=ANGRY.sling.x,sy=ANGRY.sling.y;
  c.save();
  c.shadowColor='rgba(0,0,0,.22)';c.shadowBlur=12;c.shadowOffsetY=4;
  c.strokeStyle='#5d4037';c.lineWidth=11;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(sx-11,G);c.quadraticCurveTo(sx-8,G-18,sx-5,sy+9);c.stroke();
  c.beginPath();c.moveTo(sx+11,G);c.quadraticCurveTo(sx+8,G-18,sx+5,sy+9);c.stroke();
  c.shadowBlur=0;
  c.strokeStyle='#8d6e63';c.lineWidth=8.5;
  c.beginPath();c.moveTo(sx-5,sy+9);c.lineTo(sx-14,sy-19);c.stroke();
  c.beginPath();c.moveTo(sx+5,sy+9);c.lineTo(sx+14,sy-19);c.stroke();
  c.fillStyle='#4e342e';c.beginPath();c.arc(sx,sy+9,6,0,7);c.fill();
  c.restore();

  if(ANGRY.cur){
    const b=ANGRY.cur;
    const bx=b.launched?b.ox:b.x, by=b.launched?b.oy:b.y;
    c.strokeStyle='rgba(50,30,20,.55)';c.lineWidth=3.5;c.lineCap='round';
    c.beginPath();c.moveTo(sx-14,sy-19);c.lineTo(bx,by);c.stroke();
    c.beginPath();c.moveTo(sx+14,sy-19);c.lineTo(bx,by);c.stroke();
    c.strokeStyle='rgba(90,60,40,.32)';c.lineWidth=2;
    c.beginPath();c.moveTo(sx-14,sy-19);c.lineTo(bx,by);c.stroke();
    c.beginPath();c.moveTo(sx+14,sy-19);c.lineTo(bx,by);c.stroke();

    if(ANGRY.drag.on && !b.launched){
      const dx=ANGRY.drag.dx,dy=ANGRY.drag.dy;
      const dist=Math.hypot(dx,dy);
      const cl=Math.min(dist,MAX_STRETCH);
      const ang=Math.atan2(dy,dx);
      const fx=Math.cos(ang)*cl, fy=Math.sin(ang)*cl;
      let vx=-fx*LAUNCH_POW, vy=-fy*LAUNCH_POW;
      if(vy>-2) vy-=2.8 + (1 - Math.min(1, Math.abs(fy)/MAX_STRETCH))*1.5;
      if(Math.abs(fx)>60) vx*=1.08;
      let px=sx,py=sy-19;
      let pvx=vx,pvy=vy;
      for(let i=0;i<38;i++){
        pvy+=GRAV;pvx*=AIR;pvy*=AIR;
        px+=pvx;py+=pvy;
        if(i%2===0 || i<8){
          const alpha=Math.max(0,1-i*0.028);
          c.globalAlpha=alpha*0.95;
          c.fillStyle=i%3===0?'#f4d03f':'#fff';
          c.shadowColor='rgba(244,208,63,.9)';c.shadowBlur=i%3===0?8:0;
          c.beginPath();c.arc(px,py,i%3===0?4.2:2.8,0,7);c.fill();
          c.shadowBlur=0;
        }
        if(py>G-4) break;
        if(px>W+40) break;
      }
      c.globalAlpha=1;
      // خط هدف قرمز روی قلعه
      if(dist>18){
        c.save();
        c.strokeStyle='rgba(231,76,60,.22)';c.setLineDash([6,6]);c.lineWidth=1.2;
        c.beginPath();c.moveTo(520,G);c.lineTo(520,G-180);c.stroke();
        c.restore();
      }
    }
  }

  for(const bl of ANGRY.blocks){
    if(bl.dead) continue;
    c.save();
    c.translate(bl.x+bl.w/2,bl.y+bl.h/2);
    c.rotate(bl.angle);
    c.save();
    c.translate(0, (G-(bl.y+bl.h/2))/12);
    c.globalAlpha=0.12;c.fillStyle='#000';
    c.beginPath();c.ellipse(0,bl.h/2,bl.w*0.5,6,0,0,7);c.fill();
    c.restore();
    c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=10;c.shadowOffsetY=3;
    let grad;
    if(bl.type==='wood'){
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'#bcaaa4');grad.addColorStop(0.2,'#a1887f');grad.addColorStop(1,'#5d4037');
    }else if(bl.type==='stone'){
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'#cfd8dc');grad.addColorStop(0.5,'#90a4ae');grad.addColorStop(1,'#546e7a');
    }else{
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'rgba(220,245,255,.85)');grad.addColorStop(1,'rgba(120,190,230,.55)');
    }
    c.fillStyle=grad;
    c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,bl.type==='glass'?3:5);c.fill();
    c.shadowBlur=0;
    if(bl.type==='wood'){
      c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;
      for(let i=1;i<3;i++){c.beginPath();c.moveTo(-bl.w/2+3,-bl.h/2+i*bl.h/3);c.lineTo(bl.w/2-3,-bl.h/2+i*bl.h/3);c.stroke();}
      c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.roundRect(-bl.w/2+3,-bl.h/2+2,bl.w*0.35,3.5,2);c.fill();
    }
    if(bl.type==='glass'){
      c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.roundRect(-bl.w/2+3,-bl.h/2+2,bl.w*0.32,4,2);c.fill();
      if(bl.hp<bl.maxHp){
        c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;
        c.beginPath();c.moveTo(-bl.w/2+4,-bl.h/2+4);c.lineTo(bl.w/2-4,bl.h/2-4);c.stroke();
      }
    }
    c.strokeStyle=bl.type==='glass'?'rgba(120,180,220,.5)':'rgba(0,0,0,.28)';c.lineWidth=1.2;
    c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,bl.type==='glass'?3:5);c.stroke();
    c.restore();
  }

  for(const pig of ANGRY.pigs){
    if(pig.dead) continue;
    c.save();
    c.translate(pig.x,pig.y+pig.bob);
    c.rotate(pig.angle);
    c.fillStyle='rgba(0,0,0,.14)';c.beginPath();c.ellipse(0,pig.r+8, pig.r*0.8,4,0,0,7);c.fill();
    const pg=c.createRadialGradient(-4,-5,3,0,0,pig.r);
    pg.addColorStop(0,'#c5e1a5');pg.addColorStop(0.4,'#aed581');pg.addColorStop(1,'#7cb342');
    c.fillStyle=pg;c.beginPath();c.arc(0,0,pig.r,0,7);c.fill();
    c.strokeStyle='#558b2f';c.lineWidth=1.2;c.beginPath();c.arc(0,0,pig.r,0,7);c.stroke();
    c.fillStyle='#dcedc8';c.beginPath();c.ellipse(0,6.5,9.5,6.5,0,0,7);c.fill();
    c.fillStyle='#33691e';c.beginPath();c.arc(-3,7.5,1.6,0,7);c.fill();c.beginPath();c.arc(3,7.5,1.6,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(-6.5,-3.5,5.2,0,7);c.fill();c.beginPath();c.arc(6.5,-3.5,5.2,0,7);c.fill();
    c.fillStyle='#1b5e20';c.beginPath();c.arc(-5.5,-1.8,2.4,0,7);c.fill();c.beginPath();c.arc(7.5,-1.8,2.4,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(-4.5,-2.8,1,0,7);c.fill();c.beginPath();c.arc(8.5,-2.8,1,0,7);c.fill();
    c.strokeStyle='#33691e';c.lineWidth=2.2;c.lineCap='round';
    c.beginPath();c.moveTo(-12,-8.5);c.lineTo(-2.5,-5);c.stroke();
    c.beginPath();c.moveTo(2.5,-5);c.lineTo(12,-8.5);c.stroke();
    c.fillStyle='rgba(255,183,197,.35)';c.beginPath();c.arc(-9,4,2.2,0,7);c.fill();c.beginPath();c.arc(9,4,2.2,0,7);c.fill();
    c.restore();
  }

  const allBirds=[ANGRY.cur].concat(ANGRY.extras).filter(b=>b&&b.active);
  for(const b of allBirds){
    for(let i=b.trail.length-1;i>=0;i--){
      const t=b.trail[i];
      const alpha=(i/b.trail.length)*0.28;
      c.globalAlpha=alpha;
      c.fillStyle=b.col;
      c.shadowColor=b.col;c.shadowBlur=8;
      c.beginPath();c.arc(t.x,t.y,b.r*(0.45+i*0.02),0,7);c.fill();
      c.shadowBlur=0;
    }
    c.globalAlpha=1;
    c.save();
    c.translate(b.x,b.y);
    c.rotate(b.rot||0);
    c.shadowColor='rgba(0,0,0,.28)';c.shadowBlur=12;c.shadowOffsetY=4;
    const grad=c.createRadialGradient(-4,-4,2,0,0,b.r);
    grad.addColorStop(0,'#fffde7');grad.addColorStop(0.25,b.col);grad.addColorStop(1,b.col2);
    c.fillStyle=grad;c.beginPath();c.arc(0,0,b.r,0,7);c.fill();
    c.shadowBlur=0;
    c.fillStyle='rgba(255,255,255,.32)';c.beginPath();c.ellipse(-1,4,b.r*0.55,b.r*0.38,0,0,7);c.fill();
    c.fillStyle='#ffca28';c.strokeStyle='#f57f17';c.lineWidth=0.8;
    c.beginPath();c.moveTo(b.r-2,-2.5);c.lineTo(b.r+9,0);c.lineTo(b.r-2,3.5);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(3,-4.5,6,0,7);c.fill();
    c.strokeStyle='rgba(0,0,0,.15)';c.lineWidth=1;c.beginPath();c.arc(3,-4.5,6,0,7);c.stroke();
    c.fillStyle='#212121';c.beginPath();c.arc(5,-3,2.8,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(6,-4.5,1.1,0,7);c.fill();
    if(b.type==='red'){
      c.strokeStyle='#b71c1c';c.lineWidth=2.2;c.lineCap='round';
      c.beginPath();c.moveTo(-2,-9);c.lineTo(7,-7);c.stroke();
    }
    if(b.type==='yellow'){
      c.fillStyle='#ffca28';c.beginPath();c.moveTo(-4,-b.r+2);c.lineTo(0,-b.r-6);c.lineTo(4,-b.r+2);c.fill();
    }
    if(b.type==='black'){
      c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.arc(-3,-3,b.r*0.6,0,7);c.fill();
    }
    if(b.special && !b.specialUsed && b.launched){
      c.fillStyle='rgba(255,255,255,.95)';c.font='900 9px Vazirmatn';c.textAlign='center';
      c.fillText('SPACE',0,b.r+14);
    }
    c.restore();
  }

  for(const pt of ANGRY.parts){
    c.globalAlpha=pt.a;
    c.fillStyle=pt.col;
    c.shadowColor=pt.col;c.shadowBlur=6;
    c.beginPath();c.arc(pt.x,pt.y,pt.r,0,7);c.fill();
    c.shadowBlur=0;
  }
  c.globalAlpha=1;
  for(const sp of ANGRY.scorePop){
    c.globalAlpha=sp.a;
    c.fillStyle=sp.txt.includes('1000')?'#7cb342':'#f4d03f';
    c.font='900 16px Vazirmatn';c.textAlign='center';
    c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=3;c.strokeText(sp.txt,sp.x,sp.y);
    c.fillText(sp.txt,sp.x,sp.y);
  }
  c.globalAlpha=1;

  c.save();
  c.fillStyle='rgba(255,255,255,.88)';c.beginPath();c.roundRect(10,10,220,52,14);c.fill();
  c.strokeStyle='rgba(148,180,224,.18)';c.lineWidth=1;c.beginPath();c.roundRect(10,10,220,52,14);c.stroke();
  c.fillStyle='#3e2723';c.font='800 15px Vazirmatn';c.textAlign='right';
  c.fillText('امتیاز '+gNum(ANGRY.score),210,32);
  c.fillStyle='#5d4037';c.font='600 11px Vazirmatn';
  const L=LEVELS[ANGRY.level];
  c.fillText(L.name+' — مرحله '+gNum(ANGRY.level+1)+'/'+gNum(LEVELS.length)+' — رکورد '+gNum(ANGRY.best),210,50);
  c.restore();

  let bx=18;
  c.save();
  c.fillStyle='rgba(255,255,255,.82)';c.beginPath();c.roundRect(10,68,Math.max(36,ANGRY.birdsQueue.length*26+16),28,12);c.fill();
  c.strokeStyle='rgba(148,180,224,.15)';c.lineWidth=1;c.beginPath();c.roundRect(10,68,Math.max(36,ANGRY.birdsQueue.length*26+16),28,12);c.stroke();
  for(let i=0;i<ANGRY.birdsQueue.length;i++){
    const bt=ANGRY.birdsQueue[i];
    c.fillStyle=bt.col;c.beginPath();c.arc(bx+8,82,10,0,7);c.fill();
    c.strokeStyle=bt.col2;c.lineWidth=1.2;c.beginPath();c.arc(bx+8,82,10,0,7);c.stroke();
    c.fillStyle='#ffca28';c.beginPath();c.moveTo(bx+14,81);c.lineTo(bx+18,82);c.lineTo(bx+14,83);c.fill();
    bx+=26;
  }
  if(ANGRY.birdsQueue.length===0){
    c.fillStyle='#8d6e63';c.font='700 10px Vazirmatn';c.textAlign='center';c.fillText('بدون پرنده',28,86);
  }
  c.restore();

  if(ANGRY.cur && !ANGRY.cur.launched && ANGRY.drag.on){
    const dist=Math.hypot(ANGRY.drag.dx,ANGRY.drag.dy);
    const pct=Math.min(1,dist/MAX_STRETCH);
    c.save();
    c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.roundRect(sx-46,sy-56,92,8,4);c.fill();
    c.fillStyle=pct>0.85?'#e74c3c':pct>0.6?'#f4d03f':'#7cb342';
    c.beginPath();c.roundRect(sx-46,sy-56,92*pct,8,4);c.fill();
    c.fillStyle='#fff';c.font='700 9px Vazirmatn';c.textAlign='center';c.fillText(Math.round(pct*100)+'٪ قدرت',sx,sy-60);
    c.restore();
  }

  c.restore();
}
function angryFrame(now){
  if(!ANGRY.on) return;
  const dt=Math.min(33, now-(ANGRY.last||now));
  ANGRY.last=now;
  angryUpdate(dt);
  angryDraw();
  ANGRY.raf=requestAnimationFrame(angryFrame);
}
const angryEng={
  start(cv){
    angryInit(cv);
    if(ANGRY.raf) cancelAnimationFrame(ANGRY.raf);
    ANGRY.on=true;
    angryReset(ANGRY.level);
    ANGRY.last=performance.now();
    ANGRY.raf=requestAnimationFrame(angryFrame);
    const getPos=e=>{
      const r=cv.getBoundingClientRect();
      return {x:(e.clientX-r.left)/r.width*ANGRY.w, y:(e.clientY-r.top)/r.height*ANGRY.h};
    };
    const down=e=>{
      if(!ANGRY.cur||ANGRY.cur.launched) return;
      const p=getPos(e);
      const dx=p.x-ANGRY.cur.x, dy=p.y-ANGRY.cur.y;
      if(dx*dx+dy*dy< 42*42){
        ANGRY.drag.on=true;ANGRY.drag.sx=p.x;ANGRY.drag.sy=p.y;
        ANGRY.drag.active=true;
        try{cv.setPointerCapture(e.pointerId);}catch(x){}
        angryEnsureAudio();
      }
    };
    const move=e=>{
      if(!ANGRY.drag.on||!ANGRY.cur||ANGRY.cur.launched) return;
      const p=getPos(e);
      let dx=p.x-ANGRY.drag.sx, dy=p.y-ANGRY.drag.sy;
      // فقط سمت چپ تیرکمون: dx نباید مثبت زیاد باشد
      if(dx>18) dx=18 - (dx-18)*0.15; // مقاومت نرم
      if(dx>35) dx=35;
      // محدودیت فاصله
      const dist=Math.hypot(dx,dy);
      if(dist>MAX_STRETCH){const a=Math.atan2(dy,dx);dx=Math.cos(a)*MAX_STRETCH;dy=Math.sin(a)*MAX_STRETCH; if(dx>18) dx=18;}
      ANGRY.drag.dx=dx;ANGRY.drag.dy=dy;
      ANGRY.cur.x=ANGRY.sling.x+dx;
      ANGRY.cur.y=ANGRY.sling.y-18+dy;
    };
    const up=e=>{
      if(!ANGRY.drag.on) return;
      ANGRY.drag.on=false;
      angryLaunch(ANGRY.drag.dx,ANGRY.drag.dy);
      ANGRY.drag.dx=0;ANGRY.drag.dy=0;
      setTimeout(()=>ANGRY.drag.active=false,100);
    };
    const specialTrigger=e=>{
      if(!ANGRY.cur||!ANGRY.cur.launched||ANGRY.cur.specialUsed) return;
      if(ANGRY.drag.active) return;
      angrySpecial();
    };
    ANGRY._down=down;ANGRY._move=move;ANGRY._up=up;ANGRY._spec=specialTrigger;
    cv.addEventListener('pointerdown',down);
    cv.addEventListener('pointermove',move);
    cv.addEventListener('pointerup',up);
    cv.addEventListener('pointercancel',up);
    cv.addEventListener('pointerdown',specialTrigger);
    cv.addEventListener('contextmenu',e=>e.preventDefault());
  },
  stop(){
    ANGRY.on=false;
    if(ANGRY.raf) cancelAnimationFrame(ANGRY.raf);ANGRY.raf=0;
    const cv=ANGRY.cv;
    if(cv){
      if(ANGRY._down) cv.removeEventListener('pointerdown',ANGRY._down);
      if(ANGRY._move) cv.removeEventListener('pointermove',ANGRY._move);
      if(ANGRY._up){cv.removeEventListener('pointerup',ANGRY._up);cv.removeEventListener('pointercancel',ANGRY._up);}
      if(ANGRY._spec) cv.removeEventListener('pointerdown',ANGRY._spec);
    }
    hidePremiumGO();
  },
  key(e){
    if(e.key===' '){
      e.preventDefault();
      if(ANGRY.cur&&ANGRY.cur.launched&&!ANGRY.cur.specialUsed) angrySpecial();
      else if(ANGRY.cur&&!ANGRY.cur.launched){
        angryLaunch(-70,-30);
      }
      return true;
    }
    if(e.key==='Enter'){
      if(ANGRY.over||ANGRY.win){
        e.preventDefault();
        if(ANGRY.win){
          const isLast=ANGRY.level===LEVELS.length-1;
          angryReset(isLast?0:ANGRY.level+1);
        }else angryReset(ANGRY.level);
        return true;
      }
    }
    if(e.key==='r'||e.key==='R'){
      e.preventDefault();angryReset(ANGRY.level);return true;
    }
    return false;
  }
};

Object.assign(GAME_ENG,{'angry':angryEng});
setTimeout(patchExistingGamesWithGO,400);
