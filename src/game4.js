/* ===== انگری بردز v17.0 — هدف متغیر هر برد + کیفیت دسکتاپ پرمیوم + بی‌نهایت مرحله ===== */
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
  const starsHtml = opts.stars!=null ? '<div class="gover-stars">'+[1,2,3].map(i=>'<span class="gs'+(i<=opts.stars?' on':'')+'">★</span>').join('')+'</div>' : '';
  const div=document.createElement('div');
  div.className='gover-premium'+(isWin?' win':' lose');
  div.dataset.title=opts.title||'';
  const scoreHtml = opts.score!=null?'<div class="gover-stats"><span class="gs"><b>'+gNum(opts.score)+'</b> امتیاز</span>'+(opts.best!=null?'<span class="gs gold"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg> '+gNum(opts.best)+' رکورد</span>':'')+'</div>':'';
  const nextBtn = isWin ? '<button class="gover-btn primary next">'+
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg> '+(opts.nextLabel||'هدف بعدی')+'</button>' : '';
  div.innerHTML=
    '<div class="gover-backdrop"></div>'+
    '<div class="gover-card">'+
      '<div class="gover-ic-wrap"><span class="gover-ic">'+(isWin?
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/><circle cx="12" cy="8" r="2.2" fill="currentColor" stroke="none"/></svg>':
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>')+
      '</span><span class="gover-glow"></span><span class="gover-ring"></span></div>'+
      '<h3 class="gover-title">'+(opts.title||(isWin?'بردی!':'باختی!'))+'</h3>'+
      '<p class="gover-sub">'+(opts.sub||'')+'</p>'+
      starsHtml+scoreHtml+
      '<div class="gover-acts">'+
        nextBtn+
        '<button class="gover-btn '+(isWin?'ghost':'primary')+' restart"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> '+(isWin?'دوباره همین هدف':'شروع مجدد')+'</button>'+
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
   انگری بردز v17 — هدف متغیر هر برد + دسکتاپ پرمیوم
   ================================================================ */
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
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(440,now);o.frequency.exponentialRampToValueAtTime(85,now+0.36);
      g.gain.setValueAtTime(0.9,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.42);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.44);
      const o2=AC.createOscillator(), g2=AC.createGain();
      o2.type='triangle';o2.frequency.setValueAtTime(200,now);o2.frequency.linearRampToValueAtTime(55,now+0.20);
      g2.gain.setValueAtTime(0.55,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.24);
      o2.connect(g2);g2.connect(AC.destination);o2.start(now);o2.stop(now+0.26);
    }else if(type==='pig'){
      for(let k=0;k<2;k++){
        const o=AC.createOscillator(), g=AC.createGain(), f=AC.createBiquadFilter();
        f.type='lowpass';f.frequency.value=1300;
        o.type='sawtooth';o.frequency.setValueAtTime(k?640:330,now+k*0.13);o.frequency.linearRampToValueAtTime(k?400:190,now+k*0.13+0.20);
        g.gain.setValueAtTime(0.65,now+k*0.13);g.gain.exponentialRampToValueAtTime(0.001,now+k*0.13+0.24);
        o.connect(f);f.connect(g);g.connect(AC.destination);o.start(now+k*0.13);o.stop(now+k*0.13+0.26);
      }
    }else if(type==='wood'){
      const buf=AC.createBuffer(1, AC.sampleRate*0.20, AC.sampleRate);
      const ch=buf.getChannelData(0);
      for(let i=0;i<ch.length;i++) ch[i]=(Math.random()*2-1)*Math.pow(1-i/ch.length,1.6);
      const src=AC.createBufferSource();src.buffer=buf;
      const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=950;bp.Q.value=0.9;
      const g=AC.createGain();g.gain.setValueAtTime(0.75,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.22);
      src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start(now);
      const o=AC.createOscillator(), g2=AC.createGain();
      o.frequency.setValueAtTime(130,now);o.frequency.linearRampToValueAtTime(35,now+0.14);
      g2.gain.setValueAtTime(0.55,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.16);
      o.connect(g2);g2.connect(AC.destination);o.start(now);o.stop(now+0.18);
    }else if(type==='stone'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='square';o.frequency.setValueAtTime(95,now);o.frequency.exponentialRampToValueAtTime(28,now+0.26);
      g.gain.setValueAtTime(0.65,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.30);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.32);
    }else if(type==='glass'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='sine';o.frequency.setValueAtTime(1200,now);o.frequency.exponentialRampToValueAtTime(300,now+0.18);
      g.gain.setValueAtTime(0.45,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.20);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.22);
    }else if(type==='bounce'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.frequency.setValueAtTime(200,now);g.gain.setValueAtTime(0.24,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.13);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.14);
    }else if(type==='win'){
      const notes=[261.63,329.63,392.00,523.25,659.25,783.99];
      notes.forEach((f,i)=>{
        const o=AC.createOscillator(), g=AC.createGain();
        o.type=i%2?'sine':'triangle';o.frequency.value=f;
        g.gain.setValueAtTime(0,now+i*0.085);g.gain.linearRampToValueAtTime(0.48,now+i*0.085+0.02);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.085+0.65);
        o.connect(g);g.connect(AC.destination);o.start(now+i*0.085);o.stop(now+i*0.085+0.70);
      });
      for(let k=0;k<4;k++){
        const buf=AC.createBuffer(1, AC.sampleRate*0.06, AC.sampleRate);
        const ch=buf.getChannelData(0);
        for(let i=0;i<ch.length;i++) ch[i]=(Math.random()*2-1)*(i<ch.length*0.18?1:0.18);
        const src=AC.createBufferSource();src.buffer=buf;
        const g=AC.createGain();g.gain.setValueAtTime(0.55,now+0.55+k*0.12);g.gain.exponentialRampToValueAtTime(0.001,now+0.55+k*0.12+0.08);
        src.connect(g);g.connect(AC.destination);src.start(now+0.55+k*0.12);
      }
    }else if(type==='special'){
      const o=AC.createOscillator(), g=AC.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(220,now);o.frequency.linearRampToValueAtTime(880,now+0.20);
      g.gain.setValueAtTime(0.55,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.24);
      o.connect(g);g.connect(AC.destination);o.start(now);o.stop(now+0.26);
    }
  }catch(e){}
}

const ANGRY={
  cv:null,ctx:null,w:960,h:540,on:false,over:false,win:false,raf:0,last:0,
  ground:0,sling:{x:170,y:0},birdsQueue:[],cur:null,extras:[],
  pigs:[],blocks:[],parts:[],scorePop:[],score:0,best:0,level:0,t:0,shake:0,
  drag:{on:false,sx:0,sy:0,dx:0,dy:0,active:false},
  canLaunch:true,idleT:0,birdsLeft:0,settling:0,stars:0,
  theme:0,clouds:[],trees:[],wind:0
};
const GRAV=0.22;
const AIR=0.9999;
const MAX_STRETCH=120;
const LAUNCH_POW=0.28;
const MIN_LAUNCH=12;

const BIRD_TYPES={
  red:{r:17,col:'#e74c3c',col2:'#a93226',mass:1.2,power:1,desc:'معمولی'},
  yellow:{r:15,col:'#f4d03f',col2:'#b7950b',mass:0.9,power:1.25,special:'speed',desc:'سرعتی'},
  blue:{r:11,col:'#5dade2',col2:'#21618c',mass:0.6,power:0.75,special:'split',desc:'سه‌تایی'},
  black:{r:19,col:'#2c3e50',col2:'#1a252f',mass:1.65,power:2.3,special:'bomb',desc:'انفجاری'},
};

const THEMES=[
  {name:'صحرا', sky:['#5fb8ff','#7ec8ff','#b8e0ff','#eaf6ff'], ground:'#c2a46a', ground2:'#a88a55', hill1:'#8bc34a', hill2:'#7ab33f', sun:'#ffe88a'},
  {name:'جنگل', sky:['#4fb3ff','#6ec8ff','#a8dcff','#e6f4ff'], ground:'#a67c52', ground2:'#8d6a46', hill1:'#4caf50', hill2:'#3d8b40', sun:'#fff176'},
  {name:'غروب', sky:['#ff8a65','#ffab91','#ffccbc','#fff3e0'], ground:'#b08968', ground2:'#9c7a5a', hill1:'#8d6e63', hill2:'#795548', sun:'#ff6f00'},
  {name:'برفی', sky:['#90caf9','#bbdefb','#e3f2fd','#f5fbff'], ground:'#e0e0e0', ground2:'#bdbdbd', hill1:'#b0bec5', hill2:'#90a4ae', sun:'#e1f5fe'},
  {name:'جادویی', sky:['#7c4dff','#b388ff','#d1c4e9','#ede7f6'], ground:'#8d6e63', ground2:'#6d4c41', hill1:'#9575cd', hill2:'#7e57c2', sun:'#e1bee7'},
];

/* ۱۲ مرحله دست‌ساز با هدف‌های کاملا متفاوت */
const LEVELS=[
  {
    name:'طلوع صحرا', theme:0,
    birds:['red','red','yellow'],
    pigs:[{x:600,y:0},{x:680,y:0}],
    blocks:[
      {x:570,y:0,w:16,h:62,type:'wood'},{x:700,y:0,w:16,h:62,type:'wood'},
      {x:570,y:0,w:146,h:16,type:'wood',yOff:-62},
      {x:610,y:0,w:16,h:42,type:'wood',yOff:-104},{x:650,y:0,w:16,h:42,type:'wood',yOff:-104},
      {x:610,y:0,w:56,h:16,type:'stone',yOff:-120},
    ]
  },
  {
    name:'برج جنگلی', theme:1,
    birds:['red','yellow','blue','black'],
    pigs:[{x:630,y:0},{x:630,y:0,yOff:-85},{x:720,y:0}],
    blocks:[
      {x:590,y:0,w:16,h:64,type:'wood'},{x:680,y:0,w:16,h:64,type:'wood'},
      {x:590,y:0,w:106,h:16,type:'wood',yOff:-64},
      {x:590,y:0,w:16,h:64,type:'wood',yOff:-128},{x:680,y:0,w:16,h:64,type:'wood',yOff:-128},
      {x:590,y:0,w:106,h:16,type:'stone',yOff:-192},
      {x:620,y:0,w:16,h:42,type:'glass',yOff:-234},{x:645,y:0,w:16,h:42,type:'glass',yOff:-234},
      {x:620,y:0,w:41,h:16,type:'wood',yOff:-250},
      {x:720,y:0,w:16,h:64,type:'wood'},{x:770,y:0,w:16,h:64,type:'wood'},
      {x:720,y:0,w:66,h:16,type:'wood',yOff:-64},
    ]
  },
  {
    name:'قلعه سنگی', theme:0,
    birds:['red','red','yellow','blue','black'],
    pigs:[{x:570,y:0},{x:650,y:0},{x:730,y:0},{x:650,y:0,yOff:-110}],
    blocks:[
      {x:545,y:0,w:18,h:110,type:'stone'},{x:775,y:0,w:18,h:110,type:'stone'},
      {x:545,y:0,w:248,h:18,type:'stone',yOff:-110},
      {x:585,y:0,w:16,h:64,type:'wood',yOff:-174},{x:710,y:0,w:16,h:64,type:'wood',yOff:-174},
      {x:585,y:0,w:141,h:16,type:'wood',yOff:-238},
      {x:615,y:0,w:16,h:44,type:'glass',yOff:-282},{x:680,y:0,w:16,h:44,type:'glass',yOff:-282},
      {x:615,y:0,w:81,h:16,type:'stone',yOff:-298},
      {x:630,y:0,w:16,h:44,type:'wood'},{x:670,y:0,w:16,h:44,type:'wood'},
      {x:630,y:0,w:56,h:16,type:'glass',yOff:-44},
    ]
  },
  {
    name:'معبد شیشه‌ای', theme:3,
    birds:['blue','blue','yellow','red','black'],
    pigs:[{x:610,y:0},{x:690,y:0},{x:650,y:0,yOff:-75},{x:650,y:0,yOff:-160,helmet:true}],
    blocks:[
      {x:570,y:0,w:16,h:44,type:'glass'},{x:730,y:0,w:16,h:44,type:'glass'},
      {x:570,y:0,w:176,h:16,type:'glass',yOff:-44},
      {x:590,y:0,w:16,h:54,type:'wood',yOff:-98},{x:710,y:0,w:16,h:54,type:'wood',yOff:-98},
      {x:590,y:0,w:136,h:16,type:'wood',yOff:-152},
      {x:610,y:0,w:16,h:54,type:'glass',yOff:-206},{x:690,y:0,w:16,h:54,type:'glass',yOff:-206},
      {x:610,y:0,w:96,h:16,type:'stone',yOff:-260},
      {x:635,y:0,w:16,h:44,type:'wood',yOff:-304},{x:660,y:0,w:16,h:44,type:'wood',yOff:-304},
      {x:635,y:0,w:41,h:16,type:'wood',yOff:-320},
    ]
  },
  {
    name:'طوفان شن', theme:2,
    birds:['red','yellow','yellow','black'],
    pigs:[{x:590,y:0},{x:700,y:0},{x:645,y:0,yOff:-70},{x:645,y:0,yOff:-150,helmet:true}],
    blocks:[
      {x:560,y:0,w:16,h:70,type:'wood'},{x:620,y:0,w:16,h:70,type:'wood'},
      {x:560,y:0,w:76,h:16,type:'wood',yOff:-70},
      {x:680,y:0,w:16,h:70,type:'wood'},{x:740,y:0,w:16,h:70,type:'wood'},
      {x:680,y:0,w:76,h:16,type:'wood',yOff:-70},
      {x:560,y:0,w:196,h:16,type:'stone',yOff:-140},
      {x:600,y:0,w:16,h:50,type:'glass',yOff:-190},{x:700,y:0,w:16,h:50,type:'glass',yOff:-190},
      {x:600,y:0,w:116,h:16,type:'wood',yOff:-240},
      {x:630,y:0,w:16,h:40,type:'wood',yOff:-280},
    ]
  },
  {
    name:'جنگل انبوه', theme:1,
    birds:['red','blue','blue','yellow','black'],
    pigs:[{x:580,y:0},{x:650,y:0},{x:720,y:0},{x:615,y:0,yOff:-65},{x:685,y:0,yOff:-65}],
    blocks:[
      {x:560,y:0,w:14,h:50,type:'wood'},{x:610,y:0,w:14,h:50,type:'wood'},
      {x:560,y:0,w:64,h:14,type:'wood',yOff:-50},
      {x:630,y:0,w:14,h:50,type:'wood'},{x:680,y:0,w:14,h:50,type:'wood'},
      {x:630,y:0,w:64,h:14,type:'wood',yOff:-50},
      {x:700,y:0,w:14,h:50,type:'wood'},{x:750,y:0,w:14,h:50,type:'wood'},
      {x:700,y:0,w:64,h:14,type:'wood',yOff:-50},
      {x:585,y:0,w:12,h:35,type:'glass',yOff:-85},{x:655,y:0,w:12,h:35,type:'glass',yOff:-85},{x:725,y:0,w:12,h:35,type:'glass',yOff:-85},
    ]
  },
  {
    name:'آتشفشان', theme:2,
    birds:['black','red','yellow','blue'],
    pigs:[{x:640,y:0},{x:600,y:0,yOff:-55},{x:680,y:0,yOff:-55},{x:640,y:0,yOff:-120,helmet:true}],
    blocks:[
      {x:560,y:0,w:16,h:40,type:'stone'},{x:740,y:0,w:16,h:40,type:'stone'},
      {x:560,y:0,w:196,h:16,type:'stone',yOff:-40},
      {x:580,y:0,w:16,h:40,type:'stone',yOff:-80},{x:720,y:0,w:16,h:40,type:'stone',yOff:-80},
      {x:580,y:0,w:156,h:16,type:'wood',yOff:-120},
      {x:600,y:0,w:16,h:40,type:'wood',yOff:-160},{x:700,y:0,w:16,h:40,type:'wood',yOff:-160},
      {x:600,y:0,w:116,h:16,type:'stone',yOff:-200},
      {x:630,y:0,w:16,h:36,type:'glass',yOff:-236},{x:670,y:0,w:16,h:36,type:'glass',yOff:-236},
      {x:630,y:0,w:56,h:16,type:'glass',yOff:-252},
    ]
  },
  {
    name:'شهر شیشه‌ای', theme:4,
    birds:['blue','blue','blue','yellow','black'],
    pigs:[{x:640,y:0,yOff:-20},{x:640,y:0,yOff:-90},{x:640,y:0,yOff:-170},{x:640,y:0,yOff:-250,helmet:true}],
    blocks:[
      {x:600,y:0,w:14,h:60,type:'glass'},{x:680,y:0,w:14,h:60,type:'glass'},
      {x:600,y:0,w:94,h:14,type:'glass',yOff:-60},
      {x:610,y:0,w:14,h:50,type:'glass',yOff:-110},{x:670,y:0,w:14,h:50,type:'glass',yOff:-110},
      {x:610,y:0,w:74,h:14,type:'wood',yOff:-160},
      {x:620,y:0,w:12,h:45,type:'glass',yOff:-205},{x:660,y:0,w:12,h:45,type:'glass',yOff:-205},
      {x:620,y:0,w:52,h:14,type:'stone',yOff:-250},
      {x:630,y:0,w:10,h:40,type:'glass',yOff:-290},
    ]
  },
  {
    name:'قلعه طلایی', theme:0,
    birds:['red','red','yellow','black','black'],
    pigs:[{x:580,y:0},{x:660,y:0},{x:740,y:0},{x:620,y:0,yOff:-75},{x:700,y:0,yOff:-75,helmet:true}],
    blocks:[
      {x:550,y:0,w:20,h:120,type:'stone'},{x:780,y:0,w:20,h:120,type:'stone'},
      {x:550,y:0,w:250,h:20,type:'stone',yOff:-120},
      {x:590,y:0,w:16,h:60,type:'wood',yOff:-180},{x:730,y:0,w:16,h:60,type:'wood',yOff:-180},
      {x:590,y:0,w:156,h:16,type:'wood',yOff:-240},
      {x:620,y:0,w:16,h:50,type:'glass',yOff:-290},{x:700,y:0,w:16,h:50,type:'glass',yOff:-290},
      {x:620,y:0,w:96,h:16,type:'stone',yOff:-340},
      {x:650,y:0,w:16,h:40,type:'wood',yOff:-380},
      {x:600,y:0,w:16,h:40,type:'wood'},{x:640,y:0,w:16,h:40,type:'wood'},{x:680,y:0,w:16,h:40,type:'wood'},{x:720,y:0,w:16,h:40,type:'wood'},
    ]
  },
  {
    name:'جزیره خوک‌ها', theme:1,
    birds:['red','yellow','blue','blue','black'],
    pigs:[{x:570,y:0},{x:620,y:0,yOff:-10},{x:700,y:0},{x:750,y:0,yOff:-15},{x:660,y:0,yOff:-90}],
    blocks:[
      {x:550,y:0,w:14,h:36,type:'wood'},{x:590,y:0,w:14,h:36,type:'wood'},
      {x:550,y:0,w:54,h:12,type:'wood',yOff:-36},
      {x:630,y:0,w:14,h:60,type:'wood'},{x:690,y:0,w:14,h:60,type:'wood'},
      {x:630,y:0,w:74,h:12,type:'stone',yOff:-60},
      {x:640,y:0,w:12,h:40,type:'glass',yOff:-100},
      {x:710,y:0,w:14,h:36,type:'wood'},{x:760,y:0,w:14,h:36,type:'wood'},
      {x:710,y:0,w:64,h:12,type:'wood',yOff:-36},
    ]
  },
  {
    name:'برج دوقلو', theme:4,
    birds:['red','yellow','yellow','blue','black'],
    pigs:[{x:590,y:0},{x:710,y:0},{x:590,y:0,yOff:-80},{x:710,y:0,yOff:-80},{x:650,y:0,yOff:-150,helmet:true}],
    blocks:[
      {x:560,y:0,w:16,h:70,type:'stone'},{x:620,y:0,w:16,h:70,type:'stone'},
      {x:560,y:0,w:76,h:16,type:'stone',yOff:-70},
      {x:680,y:0,w:16,h:70,type:'stone'},{x:740,y:0,w:16,h:70,type:'stone'},
      {x:680,y:0,w:76,h:16,type:'stone',yOff:-70},
      {x:560,y:0,w:196,h:16,type:'wood',yOff:-140},
      {x:580,y:0,w:14,h:50,type:'wood',yOff:-190},{x:700,y:0,w:14,h:50,type:'wood',yOff:-190},
      {x:580,y:0,w:156,h:14,type:'glass',yOff:-240},
      {x:620,y:0,w:14,h:45,type:'wood',yOff:-285},{x:680,y:0,w:14,h:45,type:'wood',yOff:-285},
      {x:620,y:0,w:74,h:14,type:'stone',yOff:-330},
    ]
  },
  {
    name:'معبد نهایی', theme:4,
    birds:['red','yellow','blue','black','black','black'],
    pigs:[{x:580,y:0},{x:650,y:0},{x:720,y:0},{x:615,y:0,yOff:-80},{x:685,y:0,yOff:-80},{x:650,y:0,yOff:-170,helmet:true}],
    blocks:[
      {x:540,y:0,w:18,h:80,type:'stone'},{x:760,y:0,w:18,h:80,type:'stone'},
      {x:540,y:0,w:238,h:18,type:'stone',yOff:-80},
      {x:570,y:0,w:16,h:60,type:'wood',yOff:-140},{x:710,y:0,w:16,h:60,type:'wood',yOff:-140},
      {x:570,y:0,w:156,h:16,type:'wood',yOff:-200},
      {x:590,y:0,w:14,h:50,type:'glass',yOff:-250},{x:690,y:0,w:14,h:50,type:'glass',yOff:-250},
      {x:590,y:0,w:114,h:16,type:'stone',yOff:-300},
      {x:610,y:0,w:14,h:45,type:'wood',yOff:-345},{x:670,y:0,w:14,h:45,type:'wood',yOff:-345},
      {x:610,y:0,w:74,h:14,type:'glass',yOff:-390},
      {x:630,y:0,w:12,h:40,type:'wood',yOff:-430},
      {x:580,y:0,w:14,h:40,type:'wood'},{x:620,y:0,w:14,h:40,type:'wood'},{x:680,y:0,w:14,h:40,type:'wood'},{x:720,y:0,w:14,h:40,type:'wood'},
    ]
  },
];

/* تولید مرحله بی‌نهایت با هدف‌های کاملا متفاوت */
function genProcLevel(idx){
  const seed = idx*9973;
  const rand = (n)=>{ const x=Math.sin(seed+n*374761)*10000; return x-Math.floor(x); };
  const theme = Math.floor(rand(1)*THEMES.length);
  const towerCount = 2 + Math.floor(rand(2)*3); // 2-4
  const pigs=[];
  const blocks=[];
  let baseX = 550 + Math.floor(rand(3)*40);
  const towerW = 16;
  for(let t=0;t<towerCount;t++){
    const tx = baseX + t* (70 + Math.floor(rand(10+t)*20));
    const th = 40 + Math.floor(rand(20+t)*50);
    blocks.push({x:tx,y:0,w:towerW,h:th,type: rand(30+t)>0.6?'wood':'stone'});
    blocks.push({x:tx+50,y:0,w:towerW,h:th,type: rand(31+t)>0.5?'wood':'stone'});
    blocks.push({x:tx,y:0,w:66,h:14,type: rand(32+t)>0.5?'wood':'stone', yOff:-th});
    pigs.push({x:tx+33,y:0});
    if(rand(40+t)>0.4){
      const upperH = 30+Math.floor(rand(50+t)*30);
      blocks.push({x:tx+10,y:0,w:12,h:upperH,type:'glass',yOff:-th-14-upperH});
      blocks.push({x:tx+44,y:0,w:12,h:upperH,type:'glass',yOff:-th-14-upperH});
      blocks.push({x:tx+10,y:0,w:46,h:12,type:'wood',yOff:-th-14-upperH*2-12});
      pigs.push({x:tx+33,y:0,yOff:-th-14, helmet: rand(60+t)>0.7});
    }
  }
  // پل سراسری
  if(towerCount>1){
    const totalW = (baseX + (towerCount-1)*90 + 66) - baseX;
    blocks.push({x:baseX,y:0,w:totalW,h:16,type:'stone',yOff:-120 - Math.floor(rand(70)*30)});
    pigs.push({x:baseX+totalW/2,y:0,yOff:-136 - Math.floor(rand(71)*30), helmet: idx%3===0});
  }
  const birdTypes=['red','yellow','blue','black'];
  const birdCount = Math.min(6, 3+Math.floor(idx/2));
  const birds=[];
  for(let i=0;i<birdCount;i++) birds.push(birdTypes[Math.floor(rand(100+i)*birdTypes.length)]);
  return {
    name:'هدف '+(idx+1)+' — '+(THEMES[theme].name),
    theme:theme,
    birds:birds,
    pigs:pigs,
    blocks:blocks,
    proc:true,
    idx:idx
  };
}

function getLevel(idx){
  if(idx < LEVELS.length) return LEVELS[idx];
  return genProcLevel(idx);
}

function angryInit(cv){
  ANGRY.best=store.get('angryBest',0);
  ANGRY.cv=cv;
  // دسکتاپ: 960، موبایل: 800
  const isDesk = (typeof window!=='undefined' && window.innerWidth>900);
  const W = isDesk?960:800;
  const H = isDesk?540:480;
  const s=gCanvas(cv,W,H,1000);
  ANGRY.ctx=s.ctx;ANGRY.w=s.w;ANGRY.h=s.h;ANGRY.ground=s.h-44;
  ANGRY.sling={x:isDesk?180:160,y:ANGRY.ground-22};
  ANGRY.clouds = Array.from({length:6},(_,i)=>({x:Math.random()*W, y:30+i*28, sc:0.8+i*0.12, sp:0.03+i*0.018}));
  ANGRY.trees = Array.from({length:5},(_,i)=>({x: 20+i*110+Math.random()*40, h: 18+Math.random()*18}));
  ANGRY.wind = (Math.random()-0.5)*0.04;
}
function buildLevel(idx){
  const L=getLevel(idx);
  const G=ANGRY.ground;
  ANGRY.theme = L.theme!=null?L.theme:(idx%THEMES.length);
  // خوک‌ها با جیتر رندوم کوچک برای تنوع هر برد
  ANGRY.pigs=L.pigs.map((p,i)=>{
    const yOff=p.yOff||0;
    const jitter = L.proc?0:(Math.sin(idx*1.7+i*2.3)*6);
    return {
      x:p.x + jitter,
      y:G-18+yOff,
      r: p.helmet?20:18,
      vx:0,vy:0,dead:false,angle:0,av:0,
      wob:Math.random()*6.28,bob:0,grounded:false,
      helmet:!!p.helmet, hp:p.helmet?2:1, maxHp:p.helmet?2:1,
      blink:Math.random()*100
    };
  });
  ANGRY.blocks=L.blocks.map(b=>{
    const yOff=b.yOff||0;
    const h=b.h,w=b.w;
    return {
      x:b.x + (L.proc?0:Math.sin(idx+b.x)*3),
      y:G-h+yOff,
      w:w,h:h,type:b.type,
      hp:b.type==='stone'?2.5:b.type==='wood'?1.2:1,
      maxHp:b.type==='stone'?2.5:b.type==='wood'?1.2:1,
      vx:0,vy:0,angle:0,av:0,dead:false,grounded:false,settled:false,
      crack:0
    };
  });
  for(const pig of ANGRY.pigs){
    for(const bl of ANGRY.blocks){
      if(!bl.dead && pig.x>bl.x-4 && pig.x<bl.x+bl.w+4 && Math.abs((pig.y+pig.r)-(bl.y))<12){
        pig.y=bl.y-pig.r;break;
      }
    }
  }
}
function angryReset(level){
  if(level!=null) ANGRY.level = Math.max(0,level);
  const L=getLevel(ANGRY.level);
  ANGRY.birdsQueue=L.birds.map(t=>({type:t, ...BIRD_TYPES[t]}));
  buildLevel(ANGRY.level);
  ANGRY.cur=null;ANGRY.extras=[];ANGRY.parts=[];ANGRY.scorePop=[];
  ANGRY.score=0;ANGRY.over=false;ANGRY.win=false;ANGRY.t=0;ANGRY.shake=0;ANGRY.canLaunch=true;ANGRY.idleT=0;ANGRY.settling=0;ANGRY.stars=0;
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
    x:ANGRY.sling.x,y:ANGRY.sling.y-20,
    ox:ANGRY.sling.x,oy:ANGRY.sling.y-20,
    vx:0,vy:0,r:bt.r,col:bt.col,col2:bt.col2,type:bt.type,mass:bt.mass,power:bt.power,special:bt.special,
    launched:false,active:true,trail:[],specialUsed:false,idle:0,rot:0
  };
  ANGRY.canLaunch=true;
  ANGRY.drag.active=false;
  if(!immediate){
    const startX=45, startY=ANGRY.ground-12;
    ANGRY.cur.x=startX;ANGRY.cur.y=startY;
    const anim=(t0)=>{
      if(!ANGRY.cur || ANGRY.cur.launched) return;
      const p=Math.min(1,(performance.now()-t0)/460);
      const e=1-Math.pow(1-p,3);
      ANGRY.cur.x = startX + (ANGRY.sling.x-startX)*e;
      ANGRY.cur.y = startY + (ANGRY.sling.y-20-startY)*e;
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
  b.vx = -fx*LAUNCH_POW;
  b.vy = -fy*LAUNCH_POW;
  if(b.vy>-3){
    b.vy -= 3.2 + (1 - Math.min(1, Math.abs(fy)/MAX_STRETCH))*1.8;
  }
  if(Math.abs(fx)>65) b.vx*=1.1;
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
    const sp=2.4;
    b.vx*=sp;b.vy*=sp;
    for(let i=0;i<16;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8,a:1,col:'#f4d03f',r:2+Math.random()*2.5,ay:0.07});
    ANGRY.shake=0.45;
    angrySfx('special');try{gSfx('zap');}catch(e){}
  }else if(b.special==='split'){
    const baseAng=Math.atan2(b.vy,b.vx);
    const speed=Math.hypot(b.vx,b.vy);
    const spread=0.46;
    for(let k=-1;k<=1;k++){
      if(k===0) continue;
      const ang=baseAng+k*spread;
      ANGRY.extras.push({
        x:b.x,y:b.y,
        vx:Math.cos(ang)*speed*0.96,vy:Math.sin(ang)*speed*0.96,
        r:11,col:'#5dade2',col2:'#21618c',type:'blue',mass:0.6,power:0.75,
        launched:true,active:true,trail:[],specialUsed:true,idle:0,rot:0
      });
    }
    for(let i=0;i<12;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,a:1,col:'#5dade2',r:2.2,ay:0.05});
    angrySfx('special');try{gSfx('match');}catch(e){}
  }else if(b.special==='bomb'){
    ANGRY.shake=1.35;
    for(let i=0;i<36;i++) ANGRY.parts.push({x:b.x,y:b.y,vx:(Math.random()-0.5)*11,vy:(Math.random()-0.5)*11-1,a:1,col:i%2?'#f39c12':'#e74c3c',r:3+Math.random()*3.5,ay:0.13});
    const rad=115;
    ANGRY.pigs.forEach(p=>{
      if(p.dead) return;
      const dx=p.x-b.x,dy=p.y-b.y;
      if(dx*dx+dy*dy<rad*rad){
        p.hp--; if(p.hp<=0){p.dead=true;ANGRY.score+=p.helmet?1500:1000; ANGRY.scorePop.push({x:p.x,y:p.y-18,txt:'+'+(p.helmet?1500:1000),a:1,vy:-1.2}); for(let i=0;i<18;i++) ANGRY.parts.push({x:p.x,y:p.y,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-1,a:1,col:'#8bc34a',r:2.8,ay:0.1});}
      }
    });
    ANGRY.blocks.forEach(bl=>{
      if(bl.dead) return;
      const cx=bl.x+bl.w/2,cy=bl.y+bl.h/2;
      const dx=cx-b.x,dy=cy-b.y;
      if(dx*dx+dy*dy<rad*rad){
        bl.hp=0;bl.dead=true;ANGRY.score+=bl.type==='stone'?150:100;
        ANGRY.scorePop.push({x:cx,y:cy,txt:'+'+(bl.type==='stone'?150:100),a:1,vy:-1});
        for(let i=0;i<16;i++) ANGRY.parts.push({x:cx,y:cy,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-1,a:1,col:bl.type==='wood'?'#8d6e63':bl.type==='stone'?'#90a4ae':'#b3e5fc',r:2.8,ay:0.13});
      }else if(dx*dx+dy*dy<(rad+50)*(rad+50)){
        bl.vx+=(Math.random()-0.5)*5;bl.vy+=-2.5;bl.av+=(Math.random()-0.5)*0.14;
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
  if(ANGRY.shake>0) ANGRY.shake=Math.max(0,ANGRY.shake-dt*0.0022);
  const G=ANGRY.ground;
  const allBirds=[ANGRY.cur].concat(ANGRY.extras).filter(b=>b&&b.active);

  for(const b of allBirds){
    if(!b.launched) continue;
    b.vy+=GRAV;
    b.vx*=AIR;b.vy*=AIR;
    b.vx+=ANGRY.wind*0.02;
    b.x+=b.vx;b.y+=b.vy;
    b.rot=Math.atan2(b.vy,b.vx);
    b.trail.unshift({x:b.x,y:b.y});if(b.trail.length>16)b.trail.pop();
    b.idle = (Math.hypot(b.vx,b.vy)<0.7) ? (b.idle||0)+dt : 0;

    if(b.y+b.r>G){
      b.y=G-b.r;
      b.vy*=-0.30;b.vx*=0.76;
      b.av=(b.av||0)*0.8;
      if(b.idle>650){b.active=false;}
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
        b.x+=nx* (overlap+1.2);
        b.y+=ny* (overlap+1.2);
        const dot=b.vx*nx + b.vy*ny;
        b.vx-=2*dot*nx*0.68;
        b.vy-=2*dot*ny*0.68;
        bl.hp-=b.power*(0.75+Math.hypot(b.vx,b.vy)*0.09);
        bl.crack = 1 - bl.hp/bl.maxHp;
        bl.vx+=b.vx*0.13;bl.vy+=b.vy*0.09;bl.av+=(Math.random()-0.5)*0.07 + b.vx*0.0022;
        if(bl.hp<=0){
          bl.dead=true;ANGRY.score+=bl.type==='stone'?150:bl.type==='wood'?100:70;
          ANGRY.scorePop.push({x:bl.x+bl.w/2,y:bl.y,txt:'+'+(bl.type==='stone'?150:bl.type==='wood'?100:70),a:1,vy:-1.1});
          for(let i=0;i<16;i++) ANGRY.parts.push({x:bl.x+bl.w/2,y:bl.y+bl.h/2,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-1.2,a:1,col:bl.type==='wood'?'#8d6e63':bl.type==='stone'?'#90a4ae':'#b3e5fc',r:2.5+Math.random()*2.8,ay:0.13});
          angrySfx(bl.type==='wood'?'wood':bl.type==='stone'?'stone':'glass');
        }else{
          angrySfx('bounce');
        }
      }
    }
    for(const pig of ANGRY.pigs){
      if(pig.dead) continue;
      const dx=b.x-pig.x,dy=b.y-pig.y;
      if(dx*dx+dy*dy < (b.r+pig.r)*(b.r+pig.r)*0.92){
        pig.hp--;
        if(pig.hp<=0){
          pig.dead=true;ANGRY.score+=pig.helmet?1500:1000;
          ANGRY.scorePop.push({x:pig.x,y:pig.y-20,txt:'+'+(pig.helmet?1500:1000),a:1,vy:-1.3});
          for(let i=0;i<22;i++) ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8-1.5,a:1,col:'#8bc34a',r:2.8+Math.random()*2.2,ay:0.11});
          angrySfx('pig');
        }else{
          ANGRY.score+=200; ANGRY.scorePop.push({x:pig.x,y:pig.y-10,txt:'کلاه شکست!',a:1,vy:-1});
          for(let i=0;i<10;i++) ANGRY.parts.push({x:pig.x,y:pig.y-8,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*3-1,a:1,col:'#78909c',r:2,ay:0.1});
          angrySfx('stone');
        }
        b.vx*=0.80;b.vy*=0.80;
        ANGRY.shake=Math.max(ANGRY.shake, pig.helmet?0.7:0.5);
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
        if(other.y+other.h<=bl.y+7 && other.y+other.h>=bl.y-14 && bl.x+bl.w>other.x+7 && bl.x<other.x+other.w-7){
          if(other.grounded||other.y+other.h>=G-0.5){grounded=true;break;}
        }
      }
    }
    bl.grounded=grounded;
    if(!grounded){
      bl.vy+=0.44;bl.vx*=0.998;bl.av*=0.995;
      bl.y+=bl.vy;bl.x+=bl.vx;bl.angle+=bl.av;
      if(bl.y+bl.h>G){bl.y=G-bl.h;bl.vy*=-0.26;bl.vx*=0.70;bl.av*=0.68;if(Math.abs(bl.vy)<0.7)bl.vy=0;}
      if(bl.x<0){bl.x=0;bl.vx*=-0.4;}
      if(bl.x+bl.w>ANGRY.w){bl.x=ANGRY.w-bl.w;bl.vx*=-0.4;}
    }else{
      bl.vy*=0.73;bl.vx*=0.80;bl.av*=0.80;
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
          a.vx*=-0.22;b.vx*=-0.22;
        }else{
          if(a.y<b.y){a.y-=oy/2;b.y+=oy/2;}else{a.y+=oy/2;b.y-=oy/2;}
          a.vy*=-0.22;b.vy*=-0.22;
        }
      }
    }
  }
  for(const pig of ANGRY.pigs){
    if(pig.dead) continue;
    pig.wob+=0.06;pig.bob=Math.sin(ANGRY.t*0.005+pig.wob)*0.7;
    pig.blink-=dt; if(pig.blink<0){pig.blink=2000+Math.random()*3000; pig.blinking=180;}
    if(pig.blinking>0) pig.blinking-=dt;
    let sup=false;
    if(pig.y+pig.r>=G-0.5) sup=true;
    else{
      for(const bl of ANGRY.blocks){
        if(bl.dead) continue;
        if(pig.x>bl.x&&pig.x<bl.x+bl.w&&Math.abs((pig.y+pig.r)-bl.y)<10) sup=true;
      }
    }
    pig.grounded=sup;
    if(!sup){pig.vy+=0.44;pig.y+=pig.vy;pig.angle+=pig.av||0;if(pig.y+pig.r>G){pig.y=G-pig.r;pig.vy*=-0.18;if(Math.abs(pig.vy)<0.8)pig.vy=0;}}
    for(const bl of ANGRY.blocks){
      if(bl.dead) continue;
      if(bl.vy>1.3 && pig.x>bl.x&&pig.x<bl.x+bl.w&&pig.y+pig.r>bl.y&&pig.y-pig.r<bl.y+bl.h){
        pig.hp--; if(pig.hp<=0){pig.dead=true;ANGRY.score+=pig.helmet?1500:1000; ANGRY.scorePop.push({x:pig.x,y:pig.y-20,txt:'+'+(pig.helmet?1500:1000),a:1,vy:-1.3}); for(let i=0;i<20;i++) ANGRY.parts.push({x:pig.x,y:pig.y,vx:(Math.random()-0.5)*7,vy:(Math.random()-0.5)*7-1,a:1,col:'#8bc34a',r:2.8,ay:0.11}); angrySfx('pig');}
      }
    }
  }

  for(const pt of ANGRY.parts){pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=pt.ay||0.13;pt.vx*=0.99;pt.a-=0.016;}
  ANGRY.parts=ANGRY.parts.filter(p=>p.a>0);
  for(const sp of ANGRY.scorePop){sp.y+=sp.vy;sp.vy+=0.045;sp.a-=0.015;}
  ANGRY.scorePop=ANGRY.scorePop.filter(s=>s.a>0);

  // ابرها
  for(const cl of ANGRY.clouds){ cl.x+=cl.sp*(dt*0.06); if(cl.x>ANGRY.w+80) cl.x=-80; }

  const alivePigs=ANGRY.pigs.filter(p=>!p.dead).length;
  if(alivePigs===0 && !ANGRY.win){
    ANGRY.win=true;ANGRY.over=false;
    const birdsUsed = getLevel(ANGRY.level).birds.length - ANGRY.birdsLeft + 1;
    const totalBirds = getLevel(ANGRY.level).birds.length;
    const stars = birdsUsed<=Math.ceil(totalBirds*0.4)?3:birdsUsed<=Math.ceil(totalBirds*0.7)?2:1;
    ANGRY.stars=stars;
    if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
    try{ if(typeof coinAdd==='function') coinAdd(20+stars*10,'برد انگری بردز — '+stars+' ستاره'); }catch(e){}
    angrySfx('win');
    ANGRY.settling=0;
    setTimeout(()=>{
      if(ANGRY.win){
        const nextLevel = ANGRY.level+1;
        const nextL = getLevel(nextLevel);
        showPremiumGO({
          title:'هدف '+gNum(ANGRY.level+1)+' نابود شد! — '+getLevel(ANGRY.level).name,
          sub:'همه خوک‌ها ترکیدن! هدف بعدی: «'+nextL.name+'» — کاملا متفاوت و سخت‌تر! امتیاز '+gNum(ANGRY.score)+' — '+gNum(stars)+' ستاره',
          score:ANGRY.score,best:ANGRY.best,win:true,stars:stars,
          nextLabel:'هدف بعدی: '+nextL.name,
          onNext:()=>{angryReset(nextLevel);},
          restart:()=>{angryReset(ANGRY.level);}
        });
      }
    },600);
    return;
  }
  const activeBirds = (ANGRY.cur&&ANGRY.cur.active&&ANGRY.cur.launched) || ANGRY.extras.some(b=>b.active);
  const hasBirdsToLaunch = ANGRY.birdsQueue.length>0 || (ANGRY.cur&&!ANGRY.cur.launched);
  if(!activeBirds && !hasBirdsToLaunch && alivePigs>0 && !ANGRY.over && !ANGRY.win){
    const moving = ANGRY.blocks.some(bl=>!bl.dead&& (Math.abs(bl.vy)>0.6||Math.abs(bl.vx)>0.6)) || ANGRY.pigs.some(p=>!p.dead&&Math.abs(p.vy)>0.6);
    if(moving){
      ANGRY.settling+=dt;
      if(ANGRY.settling<1300) return;
    }
    ANGRY.over=true;
    if(ANGRY.score>ANGRY.best){ANGRY.best=ANGRY.score;store.set('angryBest',ANGRY.best);}
    angrySfx('pig');
    setTimeout(()=>{
      if(ANGRY.over && !ANGRY.win){
        showPremiumGO({
          title:'خوک‌ها هنوز زنده‌ان! هدف عوض نشد',
          sub:'پرنده‌هات تموم شد و '+gNum(alivePigs)+' خوک با کلاه باقی مونده — دوباره تیرکمون رو بکش تا هدف بعدی باز شه!',
          score:ANGRY.score,best:ANGRY.best,win:false,
          restart:()=>{angryReset(ANGRY.level);}
        });
      }
    },650);
  }else if(!activeBirds && hasBirdsToLaunch && ANGRY.birdsQueue.length>0 && !ANGRY.cur?.launched){
    if(ANGRY.idleT===0) ANGRY.idleT=ANGRY.t;
    if(ANGRY.t-ANGRY.idleT>750){
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
  const TH = THEMES[ANGRY.theme]||THEMES[0];
  c.save();
  if(ANGRY.shake>0) c.translate((Math.random()-0.5)*ANGRY.shake*16,(Math.random()-0.5)*ANGRY.shake*12);

  // آسمان پرمیوم با تم
  const sky=c.createLinearGradient(0,0,0,G);
  sky.addColorStop(0,TH.sky[0]);sky.addColorStop(0.22,TH.sky[1]);sky.addColorStop(0.58,TH.sky[2]);sky.addColorStop(1,TH.sky[3]);
  c.fillStyle=sky;c.fillRect(0,0,W,G);
  const vig=c.createRadialGradient(W*0.5,G*0.18,0,W*0.5,G*0.18,G);
  vig.addColorStop(0,'rgba(255,255,255,0)');vig.addColorStop(1,'rgba(0,20,60,.10)');
  c.fillStyle=vig;c.fillRect(0,0,W,G);

  // خورشید با هاله پرمیوم
  c.save();
  c.globalAlpha=0.96;
  const sunG=c.createRadialGradient(W-92,78,6,W-92,78,48);
  sunG.addColorStop(0,'rgba(255,245,180,1)');sunG.addColorStop(0.35,TH.sun+'99');sunG.addColorStop(1,'rgba(255,224,120,0)');
  c.fillStyle=sunG;c.beginPath();c.arc(W-92,78,48,0,7);c.fill();
  c.fillStyle=TH.sun;c.beginPath();c.arc(W-92,78,28,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(W-102,66,8,0,7);c.fill();
  c.restore();

  // ابرهای حجمی با سایه
  for(const cl of ANGRY.clouds){
    c.save();
    c.globalAlpha=0.78;
    c.fillStyle='rgba(0,0,0,.08)';c.beginPath();c.ellipse(cl.x+3,cl.y+8, 28*cl.sc,10*cl.sc,0,0,7);c.fill();
    c.fillStyle='rgba(255,255,255,.94)';
    c.beginPath();
    c.arc(cl.x,cl.y,16*cl.sc,0,7);c.arc(cl.x+20*cl.sc,cl.y-5*cl.sc,18*cl.sc,0,7);c.arc(cl.x+40*cl.sc,cl.y,14*cl.sc,0,7);
    c.rect(cl.x-6*cl.sc,cl.y,52*cl.sc,12*cl.sc);c.fill();
    c.restore();
  }

  // تپه‌ها با تم
  c.fillStyle=TH.hill1;
  c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.20,G-36,W*0.46,G-8);c.quadraticCurveTo(W*0.72,G-28,W,G-6);c.lineTo(W,G+50);c.lineTo(0,G+50);c.fill();
  c.fillStyle=TH.hill2;
  c.beginPath();c.moveTo(0,G);c.quadraticCurveTo(W*0.32,G-18,W*0.68,G-10);c.lineTo(W,G);c.lineTo(W,G+50);c.lineTo(0,G+50);c.fill();

  // درختان پس‌زمینه
  for(const tr of ANGRY.trees){
    c.fillStyle='#5d4037';c.fillRect(tr.x,G-tr.h,6,tr.h);
    c.fillStyle=TH.hill1;c.beginPath();c.arc(tr.x+3,G-tr.h,14,0,7);c.fill();
    c.fillStyle=TH.hill2;c.beginPath();c.arc(tr.x-6,G-tr.h+4,10,0,7);c.fill();c.beginPath();c.arc(tr.x+10,G-tr.h+4,10,0,7);c.fill();
  }

  // زمین پرمیوم با بافت
  c.fillStyle=TH.ground;c.fillRect(0,G,W,H-G);
  c.fillStyle=TH.ground2;c.fillRect(0,G,W,8);
  c.fillStyle='rgba(0,0,0,.07)';
  for(let i=0;i<W;i+=28){c.fillRect((i+ANGRY.t*0.07)%W,G+14,20,2.8);}
  c.fillStyle='rgba(255,255,255,.14)';c.fillRect(0,G, W,1.8);
  // چمن لبه
  c.fillStyle=TH.hill1;c.globalAlpha=0.6;
  for(let i=0;i<W;i+=16){c.beginPath();c.moveTo(i,G);c.lineTo(i+4,G-6-Math.sin(i*0.1)*3);c.lineTo(i+8,G);c.fill();}
  c.globalAlpha=1;

  const sx=ANGRY.sling.x,sy=ANGRY.sling.y;
  // تیرکمون با بافت چوب
  c.save();
  c.shadowColor='rgba(0,0,0,.26)';c.shadowBlur=14;c.shadowOffsetY=5;
  c.strokeStyle='#4e342e';c.lineWidth=13;c.lineCap='round';c.lineJoin='round';
  c.beginPath();c.moveTo(sx-12,G);c.quadraticCurveTo(sx-9,G-20,sx-6,sy+10);c.stroke();
  c.beginPath();c.moveTo(sx+12,G);c.quadraticCurveTo(sx+9,G-20,sx+6,sy+10);c.stroke();
  c.shadowBlur=0;
  c.strokeStyle='#8d6e63';c.lineWidth=9.5;
  c.beginPath();c.moveTo(sx-6,sy+10);c.lineTo(sx-16,sy-21);c.stroke();
  c.beginPath();c.moveTo(sx+6,sy+10);c.lineTo(sx+16,sy-21);c.stroke();
  // رگه چوب
  c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1;c.beginPath();c.moveTo(sx-10,G-10);c.quadraticCurveTo(sx-8,G-30,sx-12,sy-10);c.stroke();
  c.fillStyle='#3e2723';c.beginPath();c.arc(sx,sy+10,7,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.arc(sx-2,sy+8,2.5,0,7);c.fill();
  c.restore();

  // کش‌ها با ضخامت متغیر
  if(ANGRY.cur){
    const b=ANGRY.cur;
    const bx=b.launched?b.ox:b.x, by=b.launched?b.oy:b.y;
    const stretch = ANGRY.drag.on ? Math.hypot(ANGRY.drag.dx,ANGRY.drag.dy)/MAX_STRETCH : 0;
    const thick = 2.5 + stretch*2.5;
    c.strokeStyle='rgba(40,25,15,.58)';c.lineWidth=thick+1.2;c.lineCap='round';
    c.beginPath();c.moveTo(sx-16,sy-21);c.lineTo(bx,by);c.stroke();
    c.beginPath();c.moveTo(sx+16,sy-21);c.lineTo(bx,by);c.stroke();
    c.strokeStyle='rgba(90,60,40,.34)';c.lineWidth=thick*0.6;
    c.beginPath();c.moveTo(sx-16,sy-21);c.lineTo(bx,by);c.stroke();
    c.beginPath();c.moveTo(sx+16,sy-21);c.lineTo(bx,by);c.stroke();

    if(ANGRY.drag.on && !b.launched){
      const dx=ANGRY.drag.dx,dy=ANGRY.drag.dy;
      const dist=Math.hypot(dx,dy);
      const cl=Math.min(dist,MAX_STRETCH);
      const ang=Math.atan2(dy,dx);
      const fx=Math.cos(ang)*cl, fy=Math.sin(ang)*cl;
      let vx=-fx*LAUNCH_POW, vy=-fy*LAUNCH_POW;
      if(vy>-3) vy-=3.2 + (1 - Math.min(1, Math.abs(fy)/MAX_STRETCH))*1.8;
      if(Math.abs(fx)>65) vx*=1.1;
      let px=sx,py=sy-21;
      let pvx=vx,pvy=vy;
      let hitX=null,hitY=null;
      for(let i=0;i<50;i++){
        pvy+=GRAV;pvx*=AIR;pvy*=AIR; pvx+=ANGRY.wind*0.02;
        px+=pvx;py+=pvy;
        // برخورد ساده برای پیش‌بینی
        if(!hitX){
          for(const bl of ANGRY.blocks){ if(!bl.dead && px>bl.x && px<bl.x+bl.w && py>bl.y && py<bl.y+bl.h){ hitX=px; hitY=py; break; } }
          for(const pg of ANGRY.pigs){ if(!pg.dead && Math.hypot(px-pg.x,py-pg.y)<pg.r+6){ hitX=pg.x; hitY=pg.y; break; } }
        }
        if(i%2===0 || i<10){
          const alpha=Math.max(0,1-i*0.022);
          c.globalAlpha=alpha*0.96;
          const isPower = i%4===0;
          c.fillStyle=isPower? (dist>MAX_STRETCH*0.85?'#e74c3c':dist>MAX_STRETCH*0.55?'#f4d03f':'#7cb342') : '#fff';
          c.shadowColor=c.fillStyle;c.shadowBlur=isPower?10:0;
          c.beginPath();c.arc(px,py,isPower?5:3,0,7);c.fill();
          c.shadowBlur=0;
        }
        if(py>G-6 || px>W+60) break;
      }
      c.globalAlpha=1;
      // نشانگر هدف
      if(hitX){
        c.save();
        c.strokeStyle='rgba(231,76,60,.55)';c.lineWidth=2;c.setLineDash([5,5]);
        c.beginPath();c.arc(hitX,hitY,18,0,7);c.stroke();
        c.setLineDash([]);c.fillStyle='rgba(231,76,60,.18)';c.beginPath();c.arc(hitX,hitY,18,0,7);c.fill();
        c.fillStyle='#e74c3c';c.font='900 12px Vazirmatn';c.textAlign='center';c.fillText('هدف',hitX,hitY-26);
        c.restore();
      }
      // خط عمودی هدف کلی
      if(dist>20){
        c.save();
        c.strokeStyle='rgba(46,108,184,.18)';c.setLineDash([8,8]);c.lineWidth=1.2;
        const avgPigX = ANGRY.pigs.filter(p=>!p.dead).reduce((s,p)=>s+p.x,0)/Math.max(1,ANGRY.pigs.filter(p=>!p.dead).length);
        if(avgPigX){ c.beginPath();c.moveTo(avgPigX,G);c.lineTo(avgPigX,G-200);c.stroke(); }
        c.restore();
      }
    }
  }

  // بلوک‌ها با ترک
  for(const bl of ANGRY.blocks){
    if(bl.dead) continue;
    c.save();
    c.translate(bl.x+bl.w/2,bl.y+bl.h/2);
    c.rotate(bl.angle);
    c.save();
    c.translate(0, (G-(bl.y+bl.h/2))/14);
    c.globalAlpha=0.13;c.fillStyle='#000';
    c.beginPath();c.ellipse(0,bl.h/2,bl.w*0.55,7,0,0,7);c.fill();
    c.restore();
    c.shadowColor='rgba(0,0,0,.32)';c.shadowBlur=12;c.shadowOffsetY=4;
    let grad;
    if(bl.type==='wood'){
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'#bcaaa4');grad.addColorStop(0.22,'#a1887f');grad.addColorStop(1,'#5d4037');
    }else if(bl.type==='stone'){
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'#cfd8dc');grad.addColorStop(0.5,'#90a4ae');grad.addColorStop(1,'#546e7a');
    }else{
      grad=c.createLinearGradient(-bl.w/2,-bl.h/2,bl.w/2,bl.h/2);
      grad.addColorStop(0,'rgba(220,245,255,.88)');grad.addColorStop(1,'rgba(120,190,230,.58)');
    }
    c.fillStyle=grad;
    c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,bl.type==='glass'?3:6);c.fill();
    c.shadowBlur=0;
    if(bl.type==='wood'){
      c.strokeStyle='rgba(0,0,0,.20)';c.lineWidth=1;
      for(let i=1;i<3;i++){c.beginPath();c.moveTo(-bl.w/2+3,-bl.h/2+i*bl.h/3);c.lineTo(bl.w/2-3,-bl.h/2+i*bl.h/3);c.stroke();}
      c.fillStyle='rgba(255,255,255,.20)';c.beginPath();c.roundRect(-bl.w/2+3,-bl.h/2+2,bl.w*0.36,4,2);c.fill();
      if(bl.crack>0.25){
        c.strokeStyle='rgba(0,0,0,'+(0.2+bl.crack*0.5)+')';c.lineWidth=1.2;
        c.beginPath();c.moveTo(-bl.w/2+4,-bl.h/2+4);c.lineTo(bl.w/2-6,bl.h/2-4);c.stroke();
        if(bl.crack>0.5){ c.beginPath();c.moveTo(bl.w/2-4,-bl.h/2+6);c.lineTo(-bl.w/2+6,bl.h/2-6);c.stroke(); }
      }
    }
    if(bl.type==='glass'){
      c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.roundRect(-bl.w/2+3,-bl.h/2+2,bl.w*0.34,5,2);c.fill();
      if(bl.crack>0.1){
        c.strokeStyle='rgba(255,255,255,'+(0.5+bl.crack*0.5)+')';c.lineWidth=1;
        c.beginPath();c.moveTo(-bl.w/2+5,-bl.h/2+5);c.lineTo(bl.w/2-5,bl.h/2-5);c.stroke();
        c.beginPath();c.moveTo(bl.w/2-5,-bl.h/2+5);c.lineTo(-bl.w/2+5,bl.h/2-5);c.stroke();
      }
    }
    if(bl.type==='stone' && bl.crack>0.3){
      c.fillStyle='rgba(0,0,0,'+(bl.crack*0.22)+')';c.beginPath();c.arc(0,0,bl.w*0.12,0,7);c.fill();
    }
    c.strokeStyle=bl.type==='glass'?'rgba(120,180,220,.55)':'rgba(0,0,0,.30)';c.lineWidth=1.3;
    c.beginPath();c.roundRect(-bl.w/2,-bl.h/2,bl.w,bl.h,bl.type==='glass'?3:6);c.stroke();
    c.restore();
  }

  // خوک‌ها با کلاه و پلک
  for(const pig of ANGRY.pigs){
    if(pig.dead) continue;
    c.save();
    c.translate(pig.x,pig.y+pig.bob);
    c.rotate(pig.angle);
    c.fillStyle='rgba(0,0,0,.16)';c.beginPath();c.ellipse(0,pig.r+9, pig.r*0.85,5,0,0,7);c.fill();
    const pg=c.createRadialGradient(-5,-6,4,0,0,pig.r);
    pg.addColorStop(0,'#c5e1a5');pg.addColorStop(0.42,'#aed581');pg.addColorStop(1,'#7cb342');
    c.fillStyle=pg;c.beginPath();c.arc(0,0,pig.r,0,7);c.fill();
    c.strokeStyle='#558b2f';c.lineWidth=1.3;c.beginPath();c.arc(0,0,pig.r,0,7);c.stroke();
    // کلاه
    if(pig.helmet){
      c.fillStyle='#78909c';c.strokeStyle='#546e7a';c.lineWidth=1;
      c.beginPath();c.arc(0,-pig.r+2,pig.r*0.72, Math.PI, 0);c.fill();c.stroke();
      c.fillStyle='#b0bec5';c.beginPath();c.ellipse(0,-pig.r+2,pig.r*0.75,4,0,0,7);c.fill();
    }
    c.fillStyle='#dcedc8';c.beginPath();c.ellipse(0,7.5,10,7,0,0,7);c.fill();
    c.fillStyle='#33691e';c.beginPath();c.arc(-3.2,8.5,1.7,0,7);c.fill();c.beginPath();c.arc(3.2,8.5,1.7,0,7);c.fill();
    // چشم با پلک
    const eyeOpen = !pig.blinking || pig.blinking<90;
    c.fillStyle='#fff';c.beginPath();c.arc(-7,-3.5,5.6,0,7);c.fill();c.beginPath();c.arc(7,-3.5,5.6,0,7);c.fill();
    if(eyeOpen){
      c.fillStyle='#1b5e20';c.beginPath();c.arc(-6,-1.8,2.6,0,7);c.fill();c.beginPath();c.arc(8,-1.8,2.6,0,7);c.fill();
      c.fillStyle='#fff';c.beginPath();c.arc(-5,-2.8,1.1,0,7);c.fill();c.beginPath();c.arc(9,-2.8,1.1,0,7);c.fill();
    }else{
      c.strokeStyle='#33691e';c.lineWidth=2;c.beginPath();c.moveTo(-11,-2);c.lineTo(-2,-2);c.stroke();c.beginPath();c.moveTo(2,-2);c.lineTo(11,-2);c.stroke();
    }
    c.strokeStyle='#33691e';c.lineWidth=2.3;c.lineCap='round';
    c.beginPath();c.moveTo(-13,-9);c.lineTo(-2.5,-5);c.stroke();
    c.beginPath();c.moveTo(2.5,-5);c.lineTo(13,-9);c.stroke();
    c.fillStyle='rgba(255,183,197,.38)';c.beginPath();c.arc(-10,4.5,2.4,0,7);c.fill();c.beginPath();c.arc(10,4.5,2.4,0,7);c.fill();
    // HP بار برای کلاه‌دار
    if(pig.helmet && pig.hp < pig.maxHp){
      c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.roundRect(-14,-pig.r-10,28,5,2);c.fill();
      c.fillStyle='#e74c3c';c.beginPath();c.roundRect(-14,-pig.r-10,28*(pig.hp/pig.maxHp),5,2);c.fill();
    }
    c.restore();
  }

  const allBirds=[ANGRY.cur].concat(ANGRY.extras).filter(b=>b&&b.active);
  for(const b of allBirds){
    for(let i=b.trail.length-1;i>=0;i--){
      const t=b.trail[i];
      const alpha=(i/b.trail.length)*0.32;
      c.globalAlpha=alpha;
      c.fillStyle=b.col;
      c.shadowColor=b.col;c.shadowBlur=10;
      c.beginPath();c.arc(t.x,t.y,b.r*(0.42+i*0.022),0,7);c.fill();
      c.shadowBlur=0;
    }
    c.globalAlpha=1;
    c.save();
    c.translate(b.x,b.y);
    c.rotate(b.rot||0);
    c.shadowColor='rgba(0,0,0,.32)';c.shadowBlur=14;c.shadowOffsetY=5;
    const grad=c.createRadialGradient(-5,-5,2,0,0,b.r);
    grad.addColorStop(0,'#fffde7');grad.addColorStop(0.28,b.col);grad.addColorStop(1,b.col2);
    c.fillStyle=grad;c.beginPath();c.arc(0,0,b.r,0,7);c.fill();
    c.shadowBlur=0;
    c.fillStyle='rgba(255,255,255,.36)';c.beginPath();c.ellipse(-1,5,b.r*0.58,b.r*0.42,0,0,7);c.fill();
    c.fillStyle='#ffca28';c.strokeStyle='#f57f17';c.lineWidth=0.9;
    c.beginPath();c.moveTo(b.r-2,-3);c.lineTo(b.r+10,0);c.lineTo(b.r-2,4);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(3.5,-5,6.5,0,7);c.fill();
    c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=1;c.beginPath();c.arc(3.5,-5,6.5,0,7);c.stroke();
    c.fillStyle='#212121';c.beginPath();c.arc(5.5,-3.2,3,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(6.5,-5,1.2,0,7);c.fill();
    if(b.type==='red'){
      c.strokeStyle='#b71c1c';c.lineWidth=2.4;c.lineCap='round';
      c.beginPath();c.moveTo(-2.5,-10);c.lineTo(8,-7.5);c.stroke();
    }
    if(b.type==='yellow'){
      c.fillStyle='#ffca28';c.beginPath();c.moveTo(-5,-b.r+2);c.lineTo(0,-b.r-8);c.lineTo(5,-b.r+2);c.fill();
      c.strokeStyle='#f57f17';c.lineWidth=0.8;c.beginPath();c.moveTo(-5,-b.r+2);c.lineTo(0,-b.r-8);c.lineTo(5,-b.r+2);c.stroke();
    }
    if(b.type==='black'){
      c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.arc(-3.5,-3.5,b.r*0.62,0,7);c.fill();
    }
    if(b.special && !b.specialUsed && b.launched){
      c.fillStyle='rgba(255,255,255,.96)';c.font='900 10px Vazirmatn';c.textAlign='center';
      c.fillText('SPACE',0,b.r+16);
      c.fillStyle='rgba(240,199,94,.9)';c.beginPath();c.arc(0,b.r+16,12,0,7);c.globalAlpha=0.15;c.fill();c.globalAlpha=1;
    }
    c.restore();
  }

  for(const pt of ANGRY.parts){
    c.globalAlpha=pt.a;
    c.fillStyle=pt.col;
    c.shadowColor=pt.col;c.shadowBlur=7;
    c.beginPath();c.arc(pt.x,pt.y,pt.r,0,7);c.fill();
    c.shadowBlur=0;
  }
  c.globalAlpha=1;
  for(const sp of ANGRY.scorePop){
    c.globalAlpha=sp.a;
    c.fillStyle=sp.txt.includes('1000')||sp.txt.includes('1500')?'#7cb342':'#f4d03f';
    c.font='900 17px Vazirmatn';c.textAlign='center';
    c.strokeStyle='rgba(0,0,0,.38)';c.lineWidth=3.5;c.strokeText(sp.txt,sp.x,sp.y);
    c.fillText(sp.txt,sp.x,sp.y);
  }
  c.globalAlpha=1;

  // UI پرمیوم
  c.save();
  c.fillStyle='rgba(255,255,255,.90)';c.beginPath();c.roundRect(12,12,260,58,15);c.fill();
  c.strokeStyle='rgba(148,180,224,.20)';c.lineWidth=1;c.beginPath();c.roundRect(12,12,260,58,15);c.stroke();
  c.fillStyle='#3e2723';c.font='800 16px Vazirmatn';c.textAlign='right';
  c.fillText('امتیاز '+gNum(ANGRY.score),252,36);
  c.fillStyle='#5d4037';c.font='700 11.5px Vazirmatn';
  const L=getLevel(ANGRY.level);
  const totalLv = LEVELS.length;
  const lvTxt = ANGRY.level < totalLv ? (L.name+' — هدف '+gNum(ANGRY.level+1)+'/'+gNum(totalLv)+'+∞') : ('بی‌نهایت — '+L.name);
  c.fillText(lvTxt+' — رکورد '+gNum(ANGRY.best),252,54);
  c.restore();

  // ستاره‌ها
  c.save();
  c.fillStyle='rgba(255,255,255,.84)';c.beginPath();c.roundRect(12,78,84,26,12);c.fill();
  c.strokeStyle='rgba(148,180,224,.16)';c.lineWidth=1;c.beginPath();c.roundRect(12,78,84,26,12);c.stroke();
  c.font='14px Vazirmatn';c.textAlign='center';
  for(let i=0;i<3;i++){
    c.fillStyle=i<ANGRY.stars?'#f4d03f':'rgba(0,0,0,.18)';
    c.fillText('★', 28+i*22, 95);
  }
  c.restore();

  // صف پرنده‌ها
  let bx=110;
  c.save();
  c.fillStyle='rgba(255,255,255,.86)';c.beginPath();c.roundRect(bx,78,Math.max(40,ANGRY.birdsQueue.length*28+18),28,12);c.fill();
  c.strokeStyle='rgba(148,180,224,.16)';c.lineWidth=1;c.beginPath();c.roundRect(bx,78,Math.max(40,ANGRY.birdsQueue.length*28+18),28,12);c.stroke();
  let bxx=bx+10;
  for(let i=0;i<ANGRY.birdsQueue.length;i++){
    const bt=ANGRY.birdsQueue[i];
    c.fillStyle=bt.col;c.beginPath();c.arc(bxx+8,92,11,0,7);c.fill();
    c.strokeStyle=bt.col2;c.lineWidth=1.3;c.beginPath();c.arc(bxx+8,92,11,0,7);c.stroke();
    c.fillStyle='#ffca28';c.beginPath();c.moveTo(bxx+15,91);c.lineTo(bxx+20,92);c.lineTo(bxx+15,93);c.fill();
    bxx+=28;
  }
  if(ANGRY.birdsQueue.length===0){
    c.fillStyle='#8d6e63';c.font='700 11px Vazirmatn';c.textAlign='center';c.fillText('بدون پرنده',bx+28,96);
  }
  c.restore();

  if(ANGRY.cur && !ANGRY.cur.launched && ANGRY.drag.on){
    const dist=Math.hypot(ANGRY.drag.dx,ANGRY.drag.dy);
    const pct=Math.min(1,dist/MAX_STRETCH);
    c.save();
    c.fillStyle='rgba(0,0,0,.20)';c.beginPath();c.roundRect(sx-50,sy-62,100,10,5);c.fill();
    c.fillStyle=pct>0.85?'#e74c3c':pct>0.6?'#f4d03f':'#7cb342';
    c.beginPath();c.roundRect(sx-50,sy-62,100*pct,10,5);c.fill();
    c.fillStyle='#fff';c.font='700 10px Vazirmatn';c.textAlign='center';c.fillText(Math.round(pct*100)+'٪ قدرت — '+(pct>0.85?'فوق‌العاده!':pct>0.55?'خوب':'کم'),sx,sy-66);
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
      if(dx*dx+dy*dy< 46*46){
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
      if(dx>20) dx=20 - (dx-20)*0.12;
      if(dx>38) dx=38;
      const dist=Math.hypot(dx,dy);
      if(dist>MAX_STRETCH){const a=Math.atan2(dy,dx);dx=Math.cos(a)*MAX_STRETCH;dy=Math.sin(a)*MAX_STRETCH; if(dx>20) dx=20;}
      ANGRY.drag.dx=dx;ANGRY.drag.dy=dy;
      ANGRY.cur.x=ANGRY.sling.x+dx;
      ANGRY.cur.y=ANGRY.sling.y-20+dy;
    };
    const up=e=>{
      if(!ANGRY.drag.on) return;
      ANGRY.drag.on=false;
      angryLaunch(ANGRY.drag.dx,ANGRY.drag.dy);
      ANGRY.drag.dx=0;ANGRY.drag.dy=0;
      setTimeout(()=>ANGRY.drag.active=false,120);
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
        angryLaunch(-80,-34);
      }
      return true;
    }
    if(e.key==='Enter'){
      if(ANGRY.over||ANGRY.win){
        e.preventDefault();
        if(ANGRY.win){
          angryReset(ANGRY.level+1);
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
