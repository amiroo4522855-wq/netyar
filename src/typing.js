/* ================================================================
   آموزش تایپ — Typing Lab کافی‌نت
   درس‌های مرحله‌ای فارسی/انگلیسی + کیبورد زنده با رنگ انگشت‌ها
   + آزمون زمان‌دار + تایپ آزاد + پیشرفت روی دستگاه
   ================================================================ */
const TYP={
  lang:'',mode:'learn',lesson:-1,text:'',log:[],errs:0,
  startT:0,charT:0,reactSum:0,reactN:0,running:false,fin:false,
  block:true,int:0,light:false,
  dur:30,testLeft:0,freeN:0,freeBad:0,freeT0:0,res:null,
};
/* store در app.js تعریف می‌شود — مقداردهی تنبل، هیچ خواندنی در سطح فایل نیست */
function typLazy(){
  if(!TYP.lang){TYP.lang=store.get('typLang','fa');TYP.light=store.get('typLight',false);}
}
function typProg(){return store.get('typLab',{});}
function typSaveProg(p){store.set('typLab',p);}
function typStats(){
  const p=typProg();const s=p[TYP.lang]||{done:{},n:0,w:0,a:0,best:{}};
  return s;
}
function typNorm(c){return c==='ي'?'ی':c==='ك'?'ک':c;}

/* ---------- چیدمان و انگشت‌ها ---------- */
const TYP_ROWS={
  fa:[
    ['۱','۲','۳','۴','۵','۶','۷','۸','۹','۰'],
    ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','چ'],
    ['ش','س','ی','ب','ل','ا','ت','ن','م','ک','گ'],
    ['ظ','ط','ز','ر','ذ','د','پ','و','.','؟'],
  ],
  en:[
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l',';'],
    ['z','x','c','v','b','n','m',',','.','/'],
  ],
};
const TYP_SUB={
  fa:{'۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','۰':'0','ض':'q','ص':'w','ث':'e','ق':'r','ف':'t','غ':'y','ع':'u','ه':'i','خ':'o','ح':'p','ج':'[','چ':']','ش':'a','س':'s','ی':'d','ب':'f','ل':'g','ا':'h','ت':'j','ن':'k','م':'l','ک':';','گ':"'",'ظ':'z','ط':'x','ز':'c','ر':'v','ذ':'b','د':'n','پ':'m','و':',','.':'.','؟':'/'},
  en:{q:'ض',w:'ص',e:'ث',r:'ق',t:'ف',y:'غ',u:'ع',i:'ه',o:'خ',p:'ح',a:'ش',s:'س',d:'ی',f:'ب',g:'ل',h:'ا',j:'ت',k:'ن',l:'م',';':'ک',z:'ظ',x:'ط',c:'ز',v:'ر',b:'ذ',n:'د',m:'پ',',':'و','.':'.','/':'؟'},
};
const TYP_ZONE={
  fa:{'۱':'lp','۲':'lr','۳':'lm','۴':'li','۵':'li','۶':'ri','۷':'ri','۸':'rm','۹':'rr','۰':'rp','ض':'lp','ص':'lr','ث':'lm','ق':'li','ف':'li','غ':'ri','ع':'ri','ه':'rm','خ':'rr','ح':'rp','ج':'rp','چ':'rp','ش':'lp','س':'lr','ی':'lm','ب':'li','ل':'li','ا':'ri','ت':'ri','ن':'rm','م':'rr','ک':'rp','گ':'rp','ظ':'lp','ط':'lr','ز':'lm','ر':'li','ذ':'li','د':'ri','پ':'ri','و':'rm','.':'rr','؟':'rp',' ':'th','\u200c':'th',
    q:'lp',w:'lr',e:'lm',r:'li',t:'li',y:'ri',u:'ri',i:'rm',o:'rr',p:'rp',a:'lp',s:'lr',d:'lm',f:'li',g:'li',h:'ri',j:'ri',k:'rm',l:'rr',';':'rp',z:'lp',x:'lr',c:'lm',v:'li',b:'li',n:'ri',m:'ri',',':'rm','.':'rr','/':'rp'},
  en:{q:'lp',w:'lr',e:'lm',r:'li',t:'li',y:'ri',u:'ri',i:'rm',o:'rr',p:'rp',a:'lp',s:'lr',d:'lm',f:'li',g:'li',h:'ri',j:'ri',k:'rm',l:'rr',';':'rp',z:'lp',x:'lr',c:'lm',v:'li',b:'li',n:'ri',m:'ri',',':'rm','.':'rr','/':'rp','1':'lp','2':'lr','3':'lm','4':'li','5':'li','6':'ri','7':'ri','8':'rm','9':'rr','0':'rp',' ':'th'},
};
const TYP_FINGER={
  fa:{lp:'انگشت کوچکِ دست چپ',lr:'انگشت حلقهٔ دست چپ',lm:'انگشت میانی دست چپ',li:'انگشت اشارهٔ دست چپ',th:'شست (فضا)',ri:'انگشت اشارهٔ دست راست',rm:'انگشت میانی دست راست',rr:'انگشت حلقهٔ دست راست',rp:'انگشت کوچکِ دست راست'},
  en:{lp:'Left pinky',lr:'Left ring',lm:'Left middle',li:'Left index',th:'Thumb (space)',ri:'Right index',rm:'Right middle',rr:'Right ring',rp:'Right pinky'},
};

/* ---------- درس‌ها ---------- */
const TYP_LESSONS={
  fa:[
    {t:'آشنایی با ردیف اصلی',d:'خانهٔ انگشت‌ها: ش س ی ب ل ا ت ن م ک',x:'شش سس یی بب لل اا تن نن مم کک شسیبلاتنمک لاتن ممک شسی بلات نمکا تنمک شسیب '},
    {t:'انگشت‌های چپ و راست',d:'یک در میان: چپ… راست… چپ…',x:'شل سا یت بک لن ام تا نم کی شا سل با تنک ملا کست شب نات ملک سیب تار '},
    {t:'حروف تکی',d:'هر حرف، جای خودش روی کیبورد',x:'گ ح ج چ پ و ر ذ د ط ظ م ن ت ا ل ب ی س ش ک ف ق ص ض ه ع غ خ '},
    {t:'ترکیب دو حرف',d:'جفت‌جفت تند و روان',x:'شس سی یب بل لا ات تن نم مم کگ گح حج چپ پو ور رذ ذد دط طظ ظم منت الب یس شک فق قص صض ضه هع عغ غخ خش '},
    {t:'کلمات کوتاه',d:'سه‌چهار حرفی‌های پرکاربرد',x:'آب آی ابر بد دست شب ما تو نان نمک کتاب کافه مادر باران پنجره دوست سلام شب آب پنیر نان تاب سیر دیر باز '},
    {t:'کلمات سخت‌تر',d:'بلندها و نیم‌فاصله‌دارها',x:'خوش‌حال ستاره کلیدها صندوقچه شترمرغ بلندپرواز خانواده ماهواره دست‌فروش پنجره‌ها مهربان‌تر آسمان‌ها کتاب‌خانه '},
    {t:'جمله',d:'با علامت‌ها و فاصلهٔ درست',x:'شب که شد، ستاره‌ها آمدند و ماه از پنجرهٔ ما سلام کرد. توپ جدید را به خانه بردیم و با هم بازی کردیم. '},
    {t:'پاراگراف',d:'تایپ روانِ متن پیوسته',x:'در کافهٔ کوچکی وسط شهر، بوی قهوهٔ تازه پیچیده بود. پشت پنجره، باران آرام می‌بارید و مردم با چترهای رنگی عجله داشتند. من پشت میزم نشستم و کتابم را باز کردم؛ دنیا انگار همان لحظه آرام شده بود. '},
    {t:'تایپ آزاد',d:'هر چه دوست داری بنویس',x:''},
  ],
  en:[
    {t:'Home row basics',d:'Finger home: a s d f — j k l ;',x:'ff jj dd kk ss aa ll ;; ffjj ddkk ssll aa;; asdf jkl; asdf jkl; fjfj dkdk slsl ajaj '},
    {t:'Left & right fingers',d:'Alternate: left… right… left…',x:'fj fj dk dk sl sl aj aj gf gf hj hj asdf jkl; lad; flask salad dad asks jak fads gala '},
    {t:'Single letters',d:'Every key, its own home',x:'q w e r t y u i o p z x c v b n m , . / ; a s d f g h j k l '},
    {t:'Letter combos',d:'Two by two, fast and smooth',x:'qw we er rt ty yu ui io op za xs dc fv gb hn jm ,k .l /; qaz wsx edc rfv tgb yhn ujm '},
    {t:'Short words',d:'Common three-four letters',x:'dad sad fall glass flask salad adds lad ask fad jak gala half hall gas sad lass flag '},
    {t:'Harder words',d:'Longer and trickier',x:'keyboard handwriting journeys electricity straightforward neighborhood extraordinary vocabulary typefast '},
    {t:'Sentence',d:'Punctuation and spacing',x:'The quick brown fox jumps over the lazy dog. Practice every day and your speed will grow fast. '},
    {t:'Paragraph',d:'Smooth continuous typing',x:'In a small cafe at the corner of the street, fresh coffee filled the air. Rain tapped softly on the window while people hurried by with colorful umbrellas. I opened my laptop and began to type; the world, for a moment, felt calm. '},
    {t:'Free typing',d:'Type anything you like',x:''},
  ],
};
const TYP_WORDS={
  fa:['آب','ابر','بد','دست','شب','ما','تو','نان','نمک','کتاب','کافه','مادر','باران','پنجره','دوست','سلام','پنیر','تاب','سیر','دیر','باز','خانه','مدرسه','ستاره','کلید','مهتاب','بارون','سیب','شب','روز','دوستان','خورشید','چتر','میزی','صندلی','قهوه','چای','شیرینی','گل','درخت'],
  en:['dad','sad','fall','glass','flask','salad','adds','ask','gala','half','hall','flag','task','dash','flash','grass','land','hand','sand','jak','fad','lass','gash','dish','fish','wish','dark','darn','hard','harsh','shake','shape','snake','snack','trade','grade','glad','plan','plant','grant'],
};
const TYP_LVL_NAMES={
  fa:['سطح ۱ — حروف','سطح ۲ — ترکیب حروف','سطح ۳ — کلمات','سطح ۴ — جمله','سطح ۵ — متن روان','سطح ۶ — زمان‌دار','سطح ۷ — حرفه‌ای'],
  en:['Level 1 — Letters','Level 2 — Combos','Level 3 — Words','Level 4 — Sentence','Level 5 — Flow','Level 6 — Timed','Level 7 — Pro'],
};

/* ---------- نما ---------- */
function typLvl(){
  const done=Object.keys(typStats().done||{}).length;
  return Math.min(7,1+Math.floor(done*7/9));
}
function typView(){
  typLazy();
  const L=TYP.lang;
  return '<section class="typ-wrap'+(TYP.light?' light':'')+'">'
    +'<div class="typ-hero">'
      +'<div><span class="kicker"><span class="dot"></span> '+(L==='fa'?'آزمایشگاه تایپ — از صفر، ده‌انگشتی':'Typing Lab — touch typing from zero')+'</span>'
      +'<h1>'+(L==='fa'?'<span class="g">آموزش</span> تایپ':'<span class="g">Typing</span> Lab')+'</h1>'
      +'<p>'+(L==='fa'?'درس‌به‌درس جلو برو، جای کلیدها را با کیبورد زنده یاد بگیر و سرعتت را در آزمون زمان‌دار بسنج.':'Step by step, learn key positions with the live keyboard and test your speed.')+'</p></div>'
      +'<div class="typ-hctl">'
        +'<div class="typ-langseg"><button class="tl-btn'+(L==='fa'?' on':'')+'" onclick="typSetLang(\'fa\')">فارسی</button><button class="tl-btn'+(L==='en'?' on':'')+'" onclick="typSetLang(\'en\')">English</button></div>'
        +'<button class="tl-btn ghost" onclick="typLight()" title="حالت روشن/تاریک">'+ic('sun',14)+'</button>'
      +'</div>'
    +'</div>'
    +'<div class="typ-tabs">'
      +'<span class="typ-tab'+(TYP.mode==='learn'?' on':'')+'" onclick="typMode(\'learn\')">'+ic('graduation',14)+(L==='fa'?'آموزش از صفر':'Course')+'</span>'
      +'<span class="typ-tab'+(TYP.mode==='test'?' on':'')+'" onclick="typMode(\'test\')">'+ic('clock',14)+(L==='fa'?'آزمون سرعت':'Speed test')+'</span>'
      +'<span class="typ-tab'+(TYP.mode==='free'?' on':'')+'" onclick="typMode(\'free\')">'+ic('type',14)+(L==='fa'?'تایپ آزاد':'Free')+'</span>'
    +'</div>'
    +'<div id="typBody">'+typBodyHtml()+'</div>'
    +'<div id="typKbWrap">'+typKbHtml()+'</div>'
    +'<input type="text" id="typInput" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="'+(L==='fa'?'ورودی تایپ':'typing input')+'">'
  +'</section>';
}
function typBodyHtml(){
  if(TYP.mode==='learn'){
    const s=typStats();
    const done=Object.keys(s.done||{}).length;
    const pct=Math.round(done/TYP_LESSONS[TYP.lang].length*100);
    const lv=typLvl();
    const aw=s.n?Math.round(s.w/s.n):0,aa=s.n?Math.round(s.a/s.n):0;
    return '<div class="typ-strip">'
      +'<div class="tst"><b>'+faNum(lv)+'</b><span>'+TYP_LVL_NAMES[TYP.lang][lv-1]+'</span></div>'
      +'<div class="tst"><b>'+faNum(aw)+'</b><span>'+(TYP.lang==='fa'?'سرعت میانگین':'Avg WPM')+'</span></div>'
      +'<div class="tst"><b>'+faNum(aa)+'٪</b><span>'+(TYP.lang==='fa'?'دقت میانگین':'Avg accuracy')+'</span></div>'
      +'<div class="tst"><b>'+faNum(s.n)+'</b><span>'+(TYP.lang==='fa'?'تمرین‌ها':'Sessions')+'</span></div>'
      +'<div class="tst wide"><span>'+(TYP.lang==='fa'?'پیشرفت':'Progress')+' — '+faNum(pct)+'٪</span><div class="typ-pbar"><i style="width:'+pct+'%"></i></div></div>'
    +'</div>'
    +'<div class="typ-lessons">'+TYP_LESSONS[TYP.lang].map((ls,i)=>{
      const dn=s.done&&s.done[i];
      const lock=i>0&&!(s.done&&s.done[i-1]);
      const cur=TYP.lesson===i&&!TYP.fin;
      return '<button class="tls'+(dn?' done':'')+(cur?' cur':'')+(lock?' lock':'')+'" onclick="typClickLesson('+i+')">'
        +'<span class="tls-n">'+(dn?'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>':faNum(i+1))+'</span>'
        +'<span class="tls-t">'+ls.t+'</span><span class="tls-d">'+ls.d+'</span>'
        +(lock?'<span class="tls-lock">'+ic('shield-check',12)+'</span>':'')
      +'</button>';
    }).join('')+'</div>'
    +'<div id="typPractice">'+((TYP.lesson>=0)?typPracticeHtml():'')+'</div>';
  }
  if(TYP.mode==='test'){
    const s=typStats();
    const durs=[30,60,120,300];
    return '<div class="typ-strip">'
      +'<div class="tst"><b>'+faNum(s.best&&s.best[TYP.dur]||0)+'</b><span>'+(TYP.lang==='fa'?'رکورد این زمان (WPM)':'Best WPM here')+'</span></div>'
      +'<div class="tst wide"><span>'+(TYP.lang==='fa'?'زمان آزمون را انتخاب کن':'Pick a duration')+'</span>'
      +'<div class="typ-durs">'+durs.map(d=>'<button class="tdur'+(TYP.dur===d?' on':'')+'" onclick="typDur('+d+')">'+(d<60?faNum(d)+' ثانیه':faNum(d/60)+' دقیقه')+'</button>').join('')
      +'<span class="tdur custom">'+ic('wrench',12)+'<input type="number" id="typCustom" min="10" max="600" placeholder="'+(TYP.lang==='fa'?'ثانیه':'sec')+'" value=""></span>'
      +'<button class="btn gold" onclick="typDurCustom()">'+ic('play',13)+(TYP.lang==='fa'?'شروع':'Start')+'</button></div></div>'
    +'</div>'
    +'<div id="typPractice">'+((TYP.lesson>=0)?typPracticeHtml():'')+'</div>';
  }
  /* آزاد */
  return '<div class="typ-free"><textarea id="typInpFree" dir="'+(TYP.lang==='fa'?'rtl':'ltr')+'" placeholder="'+(TYP.lang==='fa'?'هر چه دوست داری بنویس — سرعتت زنده حساب می‌شود…':'Type anything — live speed is counted…')+'"></textarea>'
    +'<div class="typ-fstats"><span>'+(TYP.lang==='fa'?'سرعت':'WPM')+': <b id="tfWpm">۰</b></span><span>'+(TYP.lang==='fa'?'کاراکتر':'Chars')+': <b id="tfCh">۰</b></span><span>'+(TYP.lang==='fa'?'کلمه':'Words')+': <b id="tfWd">۰</b></span><span>'+(TYP.lang==='fa'?'زمان':'Time')+': <b id="tfT">۰:۰۰</b></span></div></div>';
}
function typPracticeHtml(){
  const L=TYP.lang;
  const ls=TYP.mode==='learn'?TYP_LESSONS[L][TYP.lesson]:null;
  return '<div class="typ-practice'+(TYP.fin?' fin':'')+'">'
    +'<div class="typ-phead"><span class="typ-pttl">'+(ls?ls.t:(L==='fa'?'آزمون سرعت':'Speed test'))+'</span>'
      +'<div class="typ-pctl">'
        +(TYP.mode==='learn'?'<button class="tl-btn sm'+(TYP.block?' on':'')+'" onclick="typBlock()">'+ic('shield-check',12)+(L==='fa'?'حالت آموزشی':'Strict')+'</button>':'')
        +'<button class="tl-btn sm" onclick="typRestart()">'+ic('rotate-ccw',12)+(L==='fa'?'از نو':'Restart')+'</button>'
        +(TYP.mode==='learn'?'<button class="tl-btn sm" onclick="typQuit()">'+ic('x',12)+(L==='fa'?'بستن':'Close')+'</button>':'')
      +'</div></div>'
    +'<div class="typ-prompt" id="typPrompt">'+typPromptHtml()+'</div>'
    +'<div class="typ-text" id="typText" dir="'+(L==='fa'?'rtl':'ltr')+'">'+typTextHtml()+'</div>'
    +'<div class="typ-statbar">'
      +'<span class="tss">'+ic('zap',12)+(L==='fa'?'سرعت':'WPM')+' <b id="tWpm">۰</b></span>'
      +'<span class="tss">'+ic('shield-check',12)+(L==='fa'?'دقت':'Acc')+' <b id="tAcc">۱۰۰٪</b></span>'
      +'<span class="tss bad">'+ic('x',12)+(L==='fa'?'خطا':'Errors')+' <b id="tErr">۰</b></span>'
      +'<span class="tss">'+ic('clock',12)+(L==='fa'?'زمان':'Time')+' <b id="tTime">۰:۰۰</b></span>'
      +(TYP.mode==='test'?'<span class="tss gold">'+ic('clock',12)+(L==='fa'?'باقی‌مانده':'Left')+' <b id="tLeft">—</b></span>':'<span class="tss">'+ic('list',12)+(L==='fa'?'باقی‌مانده':'Left')+' <b id="tLeft">—</b></span>')
      +'<span class="tss">'+ic('activity',12)+(L==='fa'?'واکنش':'React')+' <b id="tReact">—</b></span>'
    +'</div>'
    +'<div class="typ-pbar big"><i id="tBar" style="width:0%"></i></div>'
  +'</div>';
}
function typPromptHtml(){
  if(TYP.fin)return TYP.mode==='test'?(TYP.lang==='fa'?'تمام شد! نتیجه آماده است':'Done! Results ready'):(TYP.lang==='fa'?'درس تمام شد! عالی بودی':'Lesson complete!');
  const t=TYP.text[TYP.log.length]||'';
  if(t==='' )return (TYP.lang==='fa'?'شروع کن… تایپ کن!':'Start typing!');
  if(t===' ')return TYP.lang==='fa'?'حرف بعدی: <b>فاصله</b> — '+TYP_FINGER.fa.th:'Next: <b>Space</b> — '+TYP_FINGER.en.th;
  if(t==='\u200c')return TYP.lang==='fa'?'حرف بعدی: <b>نیم‌فاصله</b> — '+TYP_FINGER.fa.th:'Next: <b>Half-space</b>';
  const z=TYP_ZONE[TYP.lang][t]||'th';
  const disp=TYP.lang==='en'?t.toUpperCase():t;
  return (TYP.lang==='fa'?'حرف بعدی:':'Next:')+' <b class="gold">'+esc(disp)+'</b> — '+TYP_FINGER[TYP.lang][z];
}
function typTextHtml(){
  let h='';
  for(let i=0;i<TYP.text.length;i++){
    const c=TYP.text[i];
    const log=TYP.log[i];
    let cls='';
    if(i<TYP.log.length)cls=log&&log.ok?'ok':'bad';
    else if(i===TYP.log.length)cls='cur';
    const disp=c===' '?'&nbsp;':c==='\u200c'?'‌':esc(c);
    h+='<span class="tc '+cls+(c===' '?' sp':'')+'">'+disp+'</span>';
  }
  return h;
}
/* ---------- کیبورد زنده ---------- */
function typKbHtml(){
  const L=TYP.lang,rows=TYP_ROWS[L],sub=TYP_SUB[L==='fa'?'en':'fa'];
  let h='<div class="typ-kb'+(L==='en'?' en':'')+'" id="typKb">';
  rows.forEach((r,ri)=>{
    h+='<div class="krow r'+ri+'">';
    r.forEach(k=>{
      const z=TYP_ZONE[L][k]||'th';
      h+='<button class="kk z-'+z+(k===';'||k==='.'||k==='/'||k===','?' wide-s':'')+'" data-k="'+esc(k)+'" data-z="'+z+'" onclick="typKbTap(\''+(k==='\\'?'\\\\':k.replace(/'/g,"\\'"))+'\')">'
        +'<span class="kmain">'+(L==='en'?k.toUpperCase():k)+'</span>'
        +(sub[k]?'<span class="ksub">'+sub[k]+'</span>':'')
      +'</button>';
    });
    if(ri===3)h+='<button class="kk bk z-rp" data-k="BK" onclick="typKbTap(\'BK\')"><span class="kmain">⌫</span></button>';
    h+='</div>';
  });
  h+='<div class="krow r4"><button class="kk space z-th" data-k=" " data-z="th" onclick="typKbTap(\' \')"><span class="kmain">'+(L==='fa'?'فاصله':'space')+'</span></button>'
    +(L==='fa'?'<button class="kk space half z-th" data-k="\u200c" data-z="th" onclick="typKbTap(\'HS\')"><span class="kmain">نیم‌فاصله</span></button>':'')
    +'</div></div>';
  return h;
}
function typKbTap(k){
  if(k==='BK'){typBack();return;}
  if(k==='HS'){typChar('\u200c');return;}
  typChar(k==='\\'?'\\':k);
}
function kbEl(ch){const d=document.getElementById('typKb');if(!d)return null;return d.querySelector('[data-k="'+(ch==='"'?'\\"':ch)+'"]');}
function typKbNext(){
  const d=document.getElementById('typKb');if(!d)return;
  d.querySelectorAll('.next,.zl').forEach(e=>e.classList.remove('next','zl'));
  if(TYP.fin||!TYP.text)return;
  const t=TYP.text[TYP.log.length];
  if(!t)return;
  const el=kbEl(typNorm(t));
  if(el){
    el.classList.add('next');
    const z=el.dataset.z;
    d.querySelectorAll('[data-z="'+z+'"]').forEach(e=>e.classList.add('zl'));
  }
  const pr=document.getElementById('typPrompt');
  if(pr)pr.innerHTML=typPromptHtml();
}
function typKbHit(ch,ok){
  const el=kbEl(typNorm(ch));
  if(el){el.classList.add(ok?'hit':'miss');setTimeout(()=>el.classList.remove('hit','miss'),190);}
}
/* ---------- جریان تمرین ---------- */
function typMode(m){
  TYP.mode=m;TYP.lesson=-1;TYP.fin=false;typStopInt();typRerender();
}
function typSetLang(l){
  TYP.lang=l;store.set('typLang',l);
  TYP.lesson=-1;TYP.fin=false;TYP.log=[];typStopInt();typRerender();
}
function typLight(){TYP.light=!TYP.light;store.set('typLight',TYP.light);
  const w=document.querySelector('.typ-wrap');if(w)w.classList.toggle('light',TYP.light);}
function typClickLesson(i){
  const s=typStats();
  if(i>0&&!(s.done&&s.done[i-1])){toast(TYP.lang==='fa'?'اول درس قبلی را تمام کن!':'Finish the previous lesson first','info');return;}
  TYP.mode='learn';typStartLesson(i);
}
function typStartLesson(i){
  TYP.lesson=i;TYP.fin=false;TYP.log=[];TYP.errs=0;TYP.startT=0;TYP.charT=0;TYP.reactSum=0;TYP.reactN=0;TYP.res=null;
  const ls=TYP_LESSONS[TYP.lang][i];
  TYP.text=ls.x||'';
  if(!TYP.text){TYP.mode='free';typRerender();return;}
  TYP.running=true;typStopInt();
  typRerender();
  const inp=document.getElementById('typInput');if(inp)inp.focus();
}
function typDur(d){TYP.dur=d;typRerender();}
function typDurCustom(){
  const el=document.getElementById('typCustom');
  const v=el&&+el.value;
  if(!v||v<5||v>900){toast(TYP.lang==='fa'?'زمان را بین ۵ تا ۹۰۰ ثانیه بده':'Pick 5–900 seconds','info');return;}
  TYP.dur=v;typStartTest();
}
function typStartTest(){
  TYP.mode='test';TYP.fin=false;TYP.log=[];TYP.errs=0;TYP.startT=0;TYP.charT=0;TYP.reactSum=0;TYP.reactN=0;TYP.res=null;
  const ws=TYP_WORDS[TYP.lang];
  const parts=[];
  for(let i=0;i<150;i++)parts.push(ws[Math.floor(Math.random()*ws.length)]);
  TYP.text=parts.join(' ');
  TYP.testLeft=TYP.dur;TYP.running=true;
  typStopInt();
  TYP.int=setInterval(()=>{
    if(!TYP.running)return;
    TYP.testLeft--;
    const le=document.getElementById('tLeft');
    if(le)le.textContent=faNum(Math.max(0,Math.floor(TYP.testLeft/60)))+':'+faNum((Math.max(0,TYP.testLeft%60)<10?'0':'')+(TYP.testLeft%60));
    typTickStats();
    if(TYP.testLeft<=0)typFinishTest();
  },1000);
  typRerender();
  const inp=document.getElementById('typInput');if(inp)inp.focus();
}
function typRestart(){
  if(TYP.mode==='test')typStartTest();
  else if(TYP.lesson>=0)typStartLesson(TYP.lesson);
}
function typQuit(){TYP.lesson=-1;TYP.fin=false;TYP.log=[];typStopInt();typRerender();}
function typBlock(){TYP.block=!TYP.block;typRerender();}
function typBack(){
  if(TYP.mode==='free')return;
  if(TYP.block&&TYP.mode==='learn')return;
  if(!TYP.log.length)return;
  TYP.log.pop();typPaint();
}
function typChar(ch){
  if(TYP.mode==='free'){
    const ta=document.getElementById('typInpFree');
    if(!ta)return;
    if(!TYP.freeT0)TYP.freeT0=performance.now();
    TYP.freeN=ta.value.length;
    typFreeStats();
    return;
  }
  if(TYP.fin||!TYP.text)return;
  const tgt=TYP.text[TYP.log.length];
  if(tgt===undefined)return;
  const now=performance.now();
  if(TYP.startT===0){TYP.startT=now;TYP.charT=now;typStartElapsed();}
  const ok=typNorm(ch)===typNorm(tgt)||(tgt==='\u200c'&&(ch==='-'));
  if(ok)TYP.reactSum+=now-TYP.charT,TYP.reactN++;
  TYP.charT=now;
  if(!ok){
    TYP.errs++;
    typKbHit(ch,false);
    const cur=document.querySelector('.tc.cur');
    if(cur){cur.classList.add('no');setTimeout(()=>cur&&cur.classList.remove('no'),260);}
    if(TYP.block){typPaintStats();return;}
    TYP.log.push({c:ch,ok:false});
  }else{
    typKbHit(ch,true);
    TYP.log.push({c:ch,ok:true});
  }
  if(TYP.log.length>=TYP.text.length){
    if(TYP.mode==='test'){typFinishTest();}
    else typFinishLesson();
    return;
  }
  typPaint();typPaintStats();
}
function typStartElapsed(){
  typStopInt();
  TYP.int=setInterval(()=>{
    if(!TYP.running)return;
    const t=document.getElementById('tTime');
    if(t){const s=Math.floor((performance.now()-TYP.startT)/1000);t.textContent=faNum(Math.floor(s/60))+':'+faNum((s%60<10?'0':'')+(s%60));}
    typPaintStats();
  },1000);
}
function typStopInt(){if(TYP.int){clearInterval(TYP.int);TYP.int=0;}}
function typStopAll(){typStopInt();}
function typElapsed(){return TYP.startT?(performance.now()-TYP.startT)/1000:0;}
function typCalcWpm(){const m=typElapsed()/60;return m>0?Math.round(TYP.log.filter(x=>x.ok).length/5/m):0;}
function typPaintStats(){
  const w=document.getElementById('tWpm');if(w)w.textContent=faNum(typCalcWpm());
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length+TYP.errs;
  const acc=document.getElementById('tAcc');
  if(acc){const tot=okc+bad;acc.textContent=faNum(tot?Math.round(okc/tot*100):100)+'٪';}
  const e=document.getElementById('tErr');if(e)e.textContent=faNum(bad);
  const l=document.getElementById('tLeft');
  if(l&&TYP.mode!=='test')l.textContent=faNum(TYP.text.length-TYP.log.length);
  const r=document.getElementById('tReact');
  if(r)r.textContent=TYP.reactN?faNum(Math.round(TYP.reactSum/TYP.reactN))+'ms':'—';
  const b=document.getElementById('tBar');
  if(b)b.style.width=Math.round(TYP.log.length/Math.max(1,TYP.text.length)*100)+'%';
}
function typFreeStats(){
  const ta=document.getElementById('typInpFree');if(!ta)return;
  const v=ta.value;
  const s=Math.floor((performance.now()-TYP.freeT0)/1000);
  const wpm=s>2?Math.round(v.length/5/(s/60)):0;
  const a=document.getElementById('tfWpm');if(a)a.textContent=faNum(wpm);
  const c=document.getElementById('tfCh');if(c)c.textContent=faNum(v.length);
  const wd=document.getElementById('tfWd');if(wd)wd.textContent=faNum(v.trim()?v.trim().split(/\s+/).length:0);
  const t=document.getElementById('tfT');if(t)t.textContent=faNum(Math.floor(s/60))+':'+faNum((s%60<10?'0':'')+(s%60));
}
function typPaint(){
  const t=document.getElementById('typText');
  if(t)t.innerHTML=typTextHtml();
  typKbNext();
}
function typRerender(){
  const k=document.getElementById('typKbWrap');
  if(k)k.innerHTML=typKbHtml();
  const b=document.getElementById('typBody');
  if(b)b.innerHTML=typBodyHtml();
  typPaint();typPaintStats();
}
/* ---------- پایان‌ها ---------- */
function typFinishLesson(){
  TYP.fin=true;TYP.running=false;typStopInt();
  const wpm=typCalcWpm();
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length+TYP.errs;
  const acc=okc+bad?Math.round(okc/(okc+bad)*100):100;
  const react=TYP.reactN?Math.round(TYP.reactSum/TYP.reactN):0;
  const p=typProg();
  const s=p[TYP.lang]=p[TYP.lang]||{done:{},n:0,w:0,a:0,best:{}};
  const first=!s.done[TYP.lesson];
  s.done[TYP.lesson]={w:wpm,a:acc};
  s.n++;s.w+=wpm;s.a+=acc;
  typSaveProg(p);
  TYP.res={wpm,acc,errs:bad,react,first};
  typRerender();
  const pr=document.getElementById('typPractice');
  if(pr)pr.insertAdjacentHTML('beforeend',typResultHtml(TYP.lang==='fa'?'درس تمام شد!':'Lesson complete!',true));
  toast(TYP.lang==='fa'?'درس '+faNum(TYP.lesson+1)+' تمام شد — '+faNum(wpm)+' کلمه در دقیقه':'Lesson done — '+wpm+' WPM','trophy');
}
function typFinishTest(){
  TYP.fin=true;TYP.running=false;typStopInt();
  const wpm=typCalcWpm();
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length+TYP.errs;
  const acc=okc+bad?Math.round(okc/(okc+bad)*100):100;
  const secs=TYP.mode==='test'?Math.min(TYP.dur,Math.round(typElapsed()))||TYP.dur:Math.round(typElapsed());
  const p=typProg();
  const s=p[TYP.lang]=p[TYP.lang]||{done:{},n:0,w:0,a:0,best:{}};
  const prev=s.best&&s.best[TYP.dur]||0;
  const rec=wpm>prev;
  if(rec){s.best=s.best||{};s.best[TYP.dur]=wpm;}
  s.n++;s.w+=wpm;s.a+=acc;
  typSaveProg(p);
  TYP.res={wpm,acc,errs:bad,chars:okc+bad,okc,secs,rec,prev};
  typRerender();
  const pr=document.getElementById('typPractice');
  if(pr)pr.insertAdjacentHTML('beforeend',typResultHtml(TYP.lang==='fa'?'زمان تمام شد!':'Time is up!',false));
  toast((TYP.lang==='fa'?'نتیجه: ':'Result: ')+faNum(wpm)+(TYP.lang==='fa'?' کلمه در دقیقه':' WPM'),rec?'trophy':'info');
}
function typResultHtml(title,isLesson){
  const r=TYP.res;if(!r)return '';
  const L=TYP.lang;
  return '<div class="overlay typ-ov" onclick="if(event.target===this)this.remove()">'
    +'<div class="modal typ-modal" onclick="event.stopPropagation()">'
      +'<button class="x" onclick="this.closest(\'.overlay\').remove()">'+ic('x',14)+'</button>'
      +'<div class="tm-ic">'+ic('trophy',26)+'</div>'
      +'<h3>'+title+'</h3>'
      +(r.rec?'<div class="tm-rec">'+ic('sparkles',13)+(L==='fa'?'رکورد جدید!':'New record!')+'</div>':'')
      +'<div class="tm-grid">'
        +'<div class="tm-c gold"><b>'+faNum(r.wpm)+'</b><span>WPM</span></div>'
        +'<div class="tm-c"><b>'+faNum(r.acc)+'٪</b><span>'+(L==='fa'?'دقت':'Accuracy')+'</span></div>'
        +'<div class="tm-c"><b>'+faNum(r.errs)+'</b><span>'+(L==='fa'?'خطا':'Errors')+'</span></div>'
        +'<div class="tm-c"><b>'+(isLesson?faNum(Math.round((r.react||0)))+'ms':faNum(r.okc))+'</b><span>'+(isLesson?(L==='fa'?'واکنش':'Reaction'):(L==='fa'?'صحیح':'Correct'))+'</span></div>'
      +'</div>'
      +'<div class="row">'
        +'<button class="btn gold" onclick="this.closest(\'.overlay\').remove();typRestart()">'+ic('rotate-ccw',14)+(L==='fa'?'دوباره':'Again')+'</button>'
        +'<button class="btn ghost" onclick="this.closest(\'.overlay\').remove()">'+ic('check',14)+(L==='fa'?'باشه':'OK')+'</button>'
      +'</div>'
    +'</div></div>';
}
/* ---------- اتصال رخدادها ---------- */
function typBind(){
  document.addEventListener('input',e=>{
    if(e.target&&e.target.id==='typInput'&&e.data){typChar(e.data);e.target.value='';}
    if(e.target&&e.target.id==='typInpFree')typFreeStats();
  });
}
if(typeof document!=='undefined'&&document.addEventListener&&!window.__typBound){
  window.__typBound=true;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',typBind);
  else typBind();
}
