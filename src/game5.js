/* ===== حاج عباس — بازی کلمه‌سازی مثل آمیرزا، پرمیوم و خوشگل ===== */
'use strict';

const HAJ={
  el:null,level:0,best:0,
  letters:[],words:[],found:new Set(),
  cur:[], // array of {char, idx}
  used:new Set(),
  score:0,hintUsed:0,shuffle:0,
  t:0
};

const HAJ_LEVELS=[
  {name:'ابر بهاری', letters:['ا','ب','ر'], words:['ابر','بر','رب']},
  {name:'حاجی کوچک', letters:['ح','ا','ج'], words:['حاج','جا','حج']},
  {name:'عبای حاجی', letters:['ع','ب','ا','س'], words:['عباس','عابس','اسب','عبا','با','سا']},
  {name:'حاجی و حیا', letters:['ح','ا','ج','ی'], words:['حاجی','حاج','حیا','جا','یا']},
  {name:'قهوه داغ', letters:['ق','ه','و','ه'], words:['قهوه','قوه','قه','هو','وه']},
  {name:'یاران', letters:['ن','ت','ی','ا','ر'], words:['یاران','یاران','یار','تیر','تار','ریا','نار','تن','نت','یا','ران','آری']},
  {name:'کافی‌نت', letters:['ک','ا','ف','ی'], words:['کافی','کاف','یا','آف']},
  {name:'بازی شیرین', letters:['ب','ا','ز','ی'], words:['بازی','باز','زی','با','یاز']},
  {name:'دانش', letters:['د','ا','ن','ش'], words:['دانش','شاد','دان','شان','شدن','اش','نش']},
  {name:'موزیک', letters:['م','و','ز','ی','ک'], words:['موزیک','موز','میز','کوی','موی','زیک']},
  {name:'پرینت', letters:['پ','ر','ی','ن','ت'], words:['پرینت','پرین','پری','نیت','تن','پر']},
  {name:'حاج عباس', letters:['ح','ا','ج','ع','ب','ا','س'], words:['حاج عباس','عباس','حاجی','حجاب','سحاب','عابس','حباب','اسب','عاب','حاج','جا','با']},
  {name:'کتابخانه', letters:['ک','ت','ا','ب'], words:['کتاب','تاب','بت','با','تاک','آب']},
  {name:'سفره', letters:['س','ف','ر','ه'], words:['سفره','سفر','رفه','فر','سر','هر']},
  {name:'خوشحال', letters:['خ','و','ش','ح','ا','ل'], words:['خوشحال','خوش','حال','شال','خواب','حالش','خال','شوخ','الو']},
];

function hajCanMake(word, letters){
  const need={};
  for(const ch of word.replace(/\s/g,'')) need[ch]=(need[ch]||0)+1;
  const have={};
  for(const ch of letters) have[ch]=(have[ch]||0)+1;
  for(const k in need) if((have[k]||0)<need[k]) return false;
  return true;
}
function hajInit(){
  HAJ.best=store.get('hajBest',0);
}
function hajReset(lv){
  if(lv!=null) HAJ.level=lv;
  HAJ.level=Math.max(0,Math.min(HAJ_LEVELS.length-1,HAJ.level));
  const L=HAJ_LEVELS[HAJ.level];
  // letters may have duplicates, keep as is but shuffle display
  HAJ.letters=L.letters.slice();
  // filter words that can be made and unique
  const uniq=[];
  const seen=new Set();
  for(const w of L.words){
    const nw=w.replace(/\s/g,'');
    if(!seen.has(nw) && hajCanMake(nw, L.letters)){uniq.push(w);seen.add(nw);}
  }
  // ensure main word first
  HAJ.words=uniq;
  HAJ.found=new Set();
  HAJ.cur=[];HAJ.used=new Set();
  HAJ.score=0;HAJ.hintUsed=0;
  // auto reveal 2-letter words? No
  hajRender();
  hidePremiumGO();
}
function hajShuffle(){
  for(let i=HAJ.letters.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[HAJ.letters[i],HAJ.letters[j]]=[HAJ.letters[j],HAJ.letters[i]];}
  HAJ.shuffle++;
  hajRender();
  try{gSfx('shuffle');}catch(e){}
}
function hajTap(idx){
  if(HAJ.used.has(idx)) return;
  HAJ.cur.push({char:HAJ.letters[idx], idx:idx});
  HAJ.used.add(idx);
  hajRenderCur();
  try{gSfx('click');}catch(e){}
}
function hajBack(){
  if(!HAJ.cur.length) return;
  const last=HAJ.cur.pop();
  HAJ.used.delete(last.idx);
  hajRenderCur();
  try{gSfx('move');}catch(e){}
}
function hajClear(){
  HAJ.cur=[];HAJ.used.clear();
  hajRenderCur();
}
function hajSubmit(){
  const word=HAJ.cur.map(o=>o.char).join('');
  if(word.length<2){toast('کلمه کوتاه است','info');return;}
  const normWord=word.replace(/\s/g,'');
  // check if in words list (compare without space)
  let foundWord=null;
  for(const w of HAJ.words){
    if(w.replace(/\s/g,'')===normWord){foundWord=w;break;}
  }
  if(!foundWord){
    // check if can make but not in list -> not valid
    const el=document.querySelector('.haj-cur');
    if(el){el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),400);}
    toast('«'+word+'» در لیست نیست — دوباره امتحان کن','alert');
    try{gSfx('bad');}catch(e){}
    return;
  }
  if(HAJ.found.has(foundWord)){
    toast('«'+foundWord+'» رو قبلا پیدا کردی!','info');
    hajClear();
    return;
  }
  HAJ.found.add(foundWord);
  HAJ.score+=foundWord.replace(/\s/g,'').length*10;
  toast('آفرین! «'+foundWord+'» پیدا شد!','trophy');
  try{ if(typeof coinAdd==='function') coinAdd(5,'حاج عباس — '+foundWord); }catch(e){}
  try{gSfx('win');}catch(e){}
  hajClear();
  hajRenderWords();
  hajCheckWin();
}
function hajHint(){
  const remaining=HAJ.words.filter(w=>!HAJ.found.has(w));
  if(!remaining.length) return;
  const pick=remaining[Math.floor(Math.random()*remaining.length)];
  HAJ.found.add(pick);
  HAJ.hintUsed++;
  toast('راهنما: «'+pick+'»','lightbulb');
  hajRenderWords();
  hajCheckWin();
  try{gSfx('lightbulb');}catch(e){}
}
function hajCheckWin(){
  if(HAJ.found.size===HAJ.words.length){
    if(HAJ.level>HAJ.best){HAJ.best=HAJ.level;store.set('hajBest',HAJ.best);}
    try{ if(typeof coinAdd==='function') coinAdd(30,'مرحله حاج عباس '+HAJ.level); }catch(e){}
    try{gSfx('win');}catch(e){}
    const isLast=HAJ.level===HAJ_LEVELS.length-1;
    setTimeout(()=>{
      showPremiumGO({
        title: isLast?'آفرین حاج عباس راضی شد!':'مرحله '+gNum(HAJ.level+1)+' تموم شد!',
        sub: isLast?'تمام '+gNum(HAJ_LEVELS.length)+' مرحله رو مثل آمیرزا ترکوندی! حاج عباس برات چای می‌ریزه!':'همه کلمات «'+HAJ_LEVELS[HAJ.level].name+'» رو پیدا کردی — برو مرحله بعد!',
        score:HAJ.score,best:HAJ.best,win:true,
        nextLabel: isLast?'از اول':'مرحله بعد',
        onNext:()=>{hajReset(isLast?0:HAJ.level+1);},
        restart:()=>{hajReset(HAJ.level);}
      });
    },400);
  }
}
function hajRenderCur(){
  const curEl=document.getElementById('hajCur');
  const lettersEl=document.getElementById('hajLetters');
  if(curEl){
    curEl.textContent=HAJ.cur.map(o=>o.char).join('')||'حروف رو بچین...';
    curEl.classList.toggle('has',HAJ.cur.length>0);
  }
  if(lettersEl){
    // update used state
    [...lettersEl.querySelectorAll('.haj-l')].forEach((btn,i)=>{
      const idx=parseInt(btn.dataset.idx);
      btn.classList.toggle('used',HAJ.used.has(idx));
    });
  }
  const subBtn=document.getElementById('hajSubmit');
  if(subBtn) subBtn.disabled=HAJ.cur.length<2;
}
function hajRenderWords(){
  const box=document.getElementById('hajWords');
  if(!box) return;
  box.innerHTML=HAJ.words.map(w=>{
    const found=HAJ.found.has(w);
    const chars=w.replace(/\s/g,'').split('');
    return '<div class="haj-w '+(found?'found':'')+'">'+
      chars.map(ch=>'<span class="hw-c '+(found?'on':'')+'">'+(found?ch:'')+'</span>').join('')+
      '<span class="hw-lbl">'+(found?w:'<i>'+gNum(chars.length)+' حرف</i>')+'</span>'+
    '</div>';
  }).join('');
  const prog=document.getElementById('hajProg');
  if(prog){
    const pct=Math.round(HAJ.found.size/HAJ.words.length*100);
    prog.style.width=pct+'%';
    const txt=document.getElementById('hajProgTxt');
    if(txt) txt.textContent=gNum(HAJ.found.size)+' از '+gNum(HAJ.words.length)+' — '+gNum(pct)+'٪';
  }
}
function hajRender(){
  const el=HAJ.el;
  if(!el) return;
  const L=HAJ_LEVELS[HAJ.level];
  el.innerHTML=
    '<div class="haj-top">'+
      '<div class="haj-char">'+
        '<svg viewBox="0 0 120 120" class="haj-svg">'+
          '<defs><radialGradient id="hg1" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#d9ae3e"/></radialGradient></defs>'+
          '<circle cx="60" cy="60" r="52" fill="rgba(217,174,62,.12)" stroke="rgba(217,174,62,.25)"/>'+
          '<circle cx="60" cy="52" r="28" fill="url(#hg1)" stroke="#b8922f" stroke-width="1.2"/>'+
          '<path d="M32 32 Q60 12 88 32 L88 38 Q60 18 32 38 Z" fill="#5d4037" stroke="#3e2723" stroke-width="1.2"/>'+
          '<circle cx="48" cy="50" r="3.5" fill="#fff"/><circle cx="72" cy="50" r="3.5" fill="#fff"/>'+
          '<circle cx="49" cy="51" r="1.6" fill="#212121"/><circle cx="73" cy="51" r="1.6" fill="#212121"/>'+
          '<path d="M52 62 Q60 68 68 62" stroke="#5d4037" stroke-width="2" fill="none" stroke-linecap="round"/>'+
          '<path d="M38 68 Q60 88 82 68 L82 78 Q60 98 38 78 Z" fill="#fff" stroke="#b0bec5"/>'+
          '<path d="M38 78 Q60 82 82 78" stroke="#5d4037" stroke-width="1.2" fill="none"/>'+
          '<circle cx="60" cy="84" r="2" fill="#d9ae3e"/>'+
        '</svg>'+
        '<div class="haj-name">حاج عباس</div><div class="haj-lvl">'+L.name+' — مرحله '+gNum(HAJ.level+1)+'/'+gNum(HAJ_LEVELS.length)+'</div>'+
      '</div>'+
      '<div class="haj-stats">'+
        '<span class="hs">'+ic('trophy',12)+' رکورد '+gNum(HAJ.best+1)+'</span>'+
        '<span class="hs gold">'+ic('star',12)+' '+gNum(HAJ.score)+' امتیاز</span>'+
      '</div>'+
    '</div>'+
    '<div class="haj-progress"><div class="haj-pbar"><i id="hajProg" style="width:0%"></i></div><span id="hajProgTxt" class="haj-ptxt">۰ از ۰</span></div>'+
    '<div class="haj-words" id="hajWords"></div>'+
    '<div class="haj-cur-wrap"><div class="haj-cur" id="hajCur">حروف رو بچین...</div></div>'+
    '<div class="haj-letters" id="hajLetters">'+
      HAJ.letters.map((ch,i)=>'<button class="haj-l" data-idx="'+i+'" onclick="hajTap('+i+')"><span>'+ch+'</span></button>').join('')+
    '</div>'+
    '<div class="haj-acts">'+
      '<button class="btn ghost" onclick="hajShuffle()">'+ic('shuffle',14)+' به‌هم‌ریز</button>'+
      '<button class="btn ghost" onclick="hajBack()">'+ic('delete',14)+' حذف</button>'+
      '<button class="btn ghost" onclick="hajHint()">'+ic('lightbulb',14)+' راهنما</button>'+
      '<button class="btn primary" id="hajSubmit" onclick="hajSubmit()" disabled>'+ic('check',14)+' تایید</button>'+
    '</div>';
  hajRenderWords();
  hajRenderCur();
}

const hajEng={
  start(el){hajInit();HAJ.el=el;hajReset(HAJ.level);},
  stop(){HAJ.el=null;hidePremiumGO();},
  key(e){
    if(e.key==='Enter'){e.preventDefault();if(HAJ.cur.length>=2)hajSubmit();return true;}
    if(e.key==='Backspace'){e.preventDefault();hajBack();return true;}
    if(e.key===' '||e.key==='s'||e.key==='S'){e.preventDefault();hajShuffle();return true;}
    if(e.key.length===1){
      // find letter
      const ch=e.key;
      // map persian/english?
      const idx=HAJ.letters.findIndex((l,i)=>!HAJ.used.has(i)&&l===ch);
      if(idx>=0){hajTap(idx);return true;}
    }
    return false;
  }
};

Object.assign(GAME_ENG,{'hajabbas':hajEng});
