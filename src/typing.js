/* ================================================================
   آموزش تایپ نت‌یار — v19 پرمیوم تمیز و با کیفیت + باگ‌فیکس کامل
   - باگ دابل شمارش خطا رفع شد
   - کیبورد فارسی/انگلیسی دقیق + نیم‌فاصله
   - پیشرفت ۳ دوری تمیز + آنلاک خودکار درس بعدی
   - نمودار WPM + هیت‌مپ خطا + استریک روزانه
   - موبایل فوکوس + صدا + لایت + استریکت
   ================================================================ */
'use strict';
const TYP={
  lang:'',mode:'learn',lesson:-1,text:'',log:[],errs:0,
  startT:0,charT:0,reactSum:0,reactN:0,running:false,fin:false,
  block:true,int:0,light:false,
  dur:30,testLeft:0,freeN:0,freeBad:0,freeT0:0,res:null,
  history:[], // WPM history for chart
  heat:{}, // error heatmap
};
function typLazy(){
  if(!TYP.lang){TYP.lang=store.get('typLang','fa');TYP.light=store.get('typLight',false);TYP.history=store.get('typHistory',[]);TYP.heat=store.get('typHeat',{});}
}
function typProg(){return store.get('typLab',{});}
function typSaveProg(p){store.set('typLab',p);}
function typStats(){
  const p=typProg();const s=p[TYP.lang]||{done:{},rnd:{},n:0,w:0,a:0,best:{}};
  s.rnd=s.rnd||{};s.done=s.done||{};s.best=s.best||{};
  return s;
}
function typNorm(c){
  if(!c) return '';
  // normalize Persian variants
  return c.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/‌/g,'\u200c');
}
let TYPC=null;
function typSndOn(){return store.get('typSnd',true);}
function typSndToggle(){store.set('typSnd',!typSndOn());typRerender();}
function typSfx(ok){
  if(!typSndOn())return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    TYPC=TYPC||new AC();if(TYPC.state==='suspended')TYPC.resume();
    const o=TYPC.createOscillator(),g=TYPC.createGain();
    o.type=ok?'sine':'triangle';
    o.frequency.value=ok?620+Math.min(520,(TYP.log.length%12)*22):165;
    g.gain.setValueAtTime(.038,TYPC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,TYPC.currentTime+.11);
    o.connect(g);g.connect(TYPC.destination);o.start();o.stop(TYPC.currentTime+.12);
  }catch(e){}
}

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
  en:{},
};
const TYP_ZONE={
  fa:{'۱':'lp','۲':'lr','۳':'lm','۴':'li','۵':'li','۶':'ri','۷':'ri','۸':'rm','۹':'rr','۰':'rp','ض':'lp','ص':'lr','ث':'lm','ق':'li','ف':'li','غ':'ri','ع':'ri','ه':'rm','خ':'rr','ح':'rp','ج':'rp','چ':'rp','ش':'lp','س':'lr','ی':'lm','ب':'li','ل':'li','ا':'ri','ت':'ri','ن':'rm','م':'rr','ک':'rp','گ':'rp','ظ':'lp','ط':'lr','ز':'lm','ر':'li','ذ':'li','د':'ri','پ':'ri','و':'rm','.':'rr','؟':'rp',' ':'th','\u200c':'th',
    q:'lp',w:'lr',e:'lm',r:'li',t:'li',y:'ri',u:'ri',i:'rm',o:'rr',p:'rp',a:'lp',s:'lr',d:'lm',f:'li',g:'li',h:'ri',j:'ri',k:'rm',l:'rr',';':'rp',z:'lp',x:'lr',c:'lm',v:'li',b:'li',n:'ri',m:'ri',',':'rm','.':'rr','/':'rp'},
  en:{q:'lp',w:'lr',e:'lm',r:'li',t:'li',y:'ri',u:'ri',i:'rm',o:'rr',p:'rp',a:'lp',s:'lr',d:'lm',f:'li',g:'li',h:'ri',j:'ri',k:'rm',l:'rr',';':'rp',z:'lp',x:'lr',c:'lm',v:'li',b:'li',n:'ri',m:'ri',',':'rm','.':'rr','/':'rp','1':'lp','2':'lr','3':'lm','4':'li','5':'li','6':'ri','7':'ri','8':'rm','9':'rr','0':'rp',' ':'th'},
};
const TYP_FINGER={
  fa:{lp:'انگشت کوچک چپ',lr:'حلقه چپ',lm:'میانی چپ',li:'اشاره چپ',th:'شست (فاصله)',ri:'اشاره راست',rm:'میانی راست',rr:'حلقه راست',rp:'کوچک راست'},
  en:{lp:'Left pinky',lr:'Left ring',lm:'Left middle',li:'Left index',th:'Thumb (space)',ri:'Right index',rm:'Right middle',rr:'Right ring',rp:'Right pinky'},
};

/* ---------- درس‌ها ---------- */
const TYP_LESSONS={
  fa:[
    {t:'آشنایی با ردیف اصلی',d:'خانهٔ انگشت‌ها: ش س ی ب ل ا ت ن م ک',x:'شش سس یی بب لل اا تن نن مم کک شسیبلاتنمک لاتن ممک شسی بلات نمک تنمک شسیب ',
     pool:['شسیبلاتنمک کمنتالیبشس تنمالیبشس کمنتالیبشس لاتنمکشسیب ','شب لت کمان سیل بنت مشک تاس نمک لپا شبی سیل بنت کمان ','سیب شات لنت ممکن تبس کلال منت شسا یبلن کامک تنبل ','شسیب لاتن منت الک بلی سناک تنا ملک شبن کام سیل بنت ','بلاتنمکشسی شسیبلاتنمک لاتنمکشسیب منتالیبشسک کمنتالیبشس تنمالیکشس ']},
    {t:'انگشت‌های چپ و راست',d:'یک در میان: چپ… راست… چپ…',x:'شل سا یت بک لن ام تا نم کی شا سل با تنک ملا کست شب نات ملک سیب تار ',
     pool:['ناب کست شب لپا مار تن سیب کاه گم نامک بست کلف شب ماک ','شلن سابت یکمان پرک توله گم ذرفا طن ظبل شجی چخا پحو ','تاش بکل نسم یقا لخه امج چپو رذگ دخن طسا ظبل شیق ','سالن تیک بشر نامک گلپ حوله فراذ زخد میدان کپچ خواج ','تاشک بلم نسی یقن لخا مجو چپر رذگ خدن ستا بظل شیق ']},
    {t:'حروف تکی',d:'هر حرف، جای خودش روی کیبورد',x:'گ ح ج چ پ و ر ذ د ط ظ م ن ت ا ل ب ی س ش ک ف ق ص ض ه ع غ خ ',
     pool:['ق ف غ ع ه خ ح ج چ پ و ر ذ د ط ظ م ن ت ا ل ب ی س ش ک گ ض ص ث ','گ ک م ن ت ا ل ب ی س ش ض ص ث ق ف غ ع ه خ ح ج چ پ و ر ذ د ط ظ ','ب ا ل ک م ن ت س ی ش ج چ ح خ ه ع غ ق ف ض ث ص پ و ر ز ژ د ذ ط ظ ','ژ ژ ز ز ر ر ذ ذ د د ط ط ظ ظ م م ن ن ت ت ا ا ل ل ب ب ی ی س س ش ش ','پ و ج چ ح خ ه ع غ ق ف ض ص ث گ ک م ل ت ن ا ب ی س ش ر ذ د ط ظ ']},
    {t:'ترکیب دو حرف',d:'جفت‌جفت تند و روان',x:'شس سی یب بل لا ات تن نم مم کگ گح حج چپ پو ور رذ ذد دط طظ ظم منت الب یس شک فق قص صض ضه هع عغ غخ خش ',
     pool:['شس سیس یبل بلا لات اتت تنن نمم ممک کگ گح حجج جچ پو ورر رذ دط ظم منت الب یس شک فق قص ضه هع عغ غخ خش ','بلا پتو گر خو چی در مژ نم تی سا حل عم اب عن بخ ود زخ رب ست نچ ','شسی بل اتن ممک گح جچ پو رذ دط ظم نتا لیب سش کف قغ عه خح ','کلا شبا تنی مگر پوک درس بیژ وژن ژال گلت حسر چم خش عقل غف ','تنمک شسیب لانت کسم یبل اشن متک گبلا شهق عضو ثعب رکب ذرت طما ظل ']},
    {t:'کلمات کوتاه',d:'سه‌چهار حرفی‌های پرکاربرد',x:'آب آی ابر بد دست شب ما تو نان نمک کتاب کافه مادر باران پنجره دوست سلام شب آب پنیر نان تاب سیر دیر باز ',
     pool:['سلام دوست پنجره ستاره کلید مهتاب سیب دیر باز خانه مدرسه چتر گل ','سیر تاب درخت قهوه چای شیرینی خورشید روز مبل تاب قال ایوان دیز ','باران کوچک شب تاب نان نمک دست دستمال آب آبشار ما مادر تو توت ','کافه کتابخانه ستاره باران پنجره دوستان خورشید شیرینی مدرسه مهتاب سرا ','آب ابر بد دست شب نان نمک کتاب کافه مادر باران پنیر تاب دیر ']},
    {t:'کلمات سخت‌تر',d:'بلندها و نیم‌فاصله‌دارها',x:'خوش‌حال ستاره کلیدها صندوقچه شترمرغ بلندپرواز خانواده ماهواره دست‌فروش پنجره‌ها مهربان‌تر آسمان‌ها کتاب‌خانه ',
     pool:['سپیدار سرانجام پژواک آسایش پرستو کاروان‌سرا چشم‌انداز مهربان‌تر آسمان‌ها ','بی‌نظیر دل‌پذیر شگفت‌انگیز همان‌طور خوشبختانه ناگهان بین‌المللی نرم‌افزار سخت‌کوش گل‌فروش ','کهکشان میلی‌متر بالکن به‌طور مدیران داده‌ها شبکه‌ها رایانه‌ها اینترنت پردازه ','پنجره‌ها خانه‌ها کتاب‌ها ستاره‌ها ابرها باران‌ها کافه‌ها دوست‌ها خاطره‌ها لحظه‌ها ','خوش‌حال ستاره صندوقچه شترمرغ بلندپرواز خانواده ماهواره دست‌فروش مهربان‌تر ']},
    {t:'جمله',d:'با علامت‌ها و فاصلهٔ درست',x:'شب که شد، ستاره‌ها آمدند و ماه از پنجرهٔ ما سلام کرد. توپ جدید را به خانه بردیم و با هم بازی کردیم. ',
     pool:['امروز صبح زود بیدار شدم و رفتم توی آشپزخانه؛ مادرم چای تازه دم کرده بود. ','برای یادگیری تایپ ده‌انگشتی، هر روز باید تمرین کنی و صبور باشی. ','دوستانم به کافه آمدند و ما درباره کتاب‌ها و فیلم‌های جدید حرف زدیم. ','پشت پنجره، باران آرام می‌بارید و بچه‌ها با چترهای رنگی به مدرسه می‌رفتند. ','کافی‌نت نت‌یار همه‌چیز را یک‌جا دارد: سایت، بازی، موزیک، ماشین‌حساب و آموزش تایپ! ']},
    {t:'پاراگراف',d:'تایپ روانِ متن پیوسته',x:'در کافهٔ کوچکی وسط شهر، بوی قهوهٔ تازه پیچیده بود. پشت پنجره، باران آرام می‌بارید و مردم با چترهای رنگی عجله داشتند. من پشت میزم نشستم و کتابم را باز کردم؛ دنیا انگار همان لحظه آرام شده بود. ',
     pool:['کتاب‌خوانی یکی از بهترین سرگرمی‌های دنیاست. وقتی کتابی را باز می‌کنی، مثل این است که به دنیایی تازه سفر کرده‌ای؛ دنیایی پر از حرف‌های آدم‌ها و اتفاق‌های تازه. ','در هر کافی‌نت یک بوی خاصی در جریان است: بوی قهوهٔ تازه، صدای برشته‌کاری و زمزمهٔ آدم‌ها. پشت میزم نشستم، لپ‌تاپم را باز کردم و شروع به نوشتن کردم. ','شب که می‌شد، همهٔ ستاره‌ها بیرون می‌آمدند. ما روی پشت‌بام می‌نشستیم و نام ستاره‌ها را از پدربزرگ می‌پرسیدیم؛ او همیشه می‌خندید و داستانی تازه تعریف می‌کرد. ']},
    {t:'تایپ آزاد',d:'هر چه دوست داری بنویس',x:'',pool:[]},
  ],
  en:[
    {t:'Home row basics',d:'Finger home: a s d f — j k l ;',x:'ff jj dd kk ss aa ll ;; ffjj ddkk ssll aa;; asdf jkl; asdf jkl; fjfj dkdk slsl ajaj ',
     pool:['asdf jkl; aa ss dd ff jj kk ll ;; ffjj dkdk slsl aja; asdf jkl; ','asdfg ;lkjh asdfg ;lkjh ffjj ddkk ssll aa;; jjkk ll;; as;; ','a s d f j k l ; asdf jkl; sad lad add fall flask jsjs ','fjfj dkdk slsl ajaj ghgh hjhj asdf jkl; ffdd ssjj aall ','jjff kkdd llss ;;aa djdk flsk ghaj asdf jkl; fjfj dkdk ']},
    {t:'Left & right fingers',d:'Alternate: left… right… left…',x:'fj fj dk dk sl sl aj aj gf gf hj hj asdf jkl; lad; flask salad dad asks jak fads gala ',
     pool:['dk sl fj aj gm hm fr ju de ki sw lo asdf jkl; a lie; ','gas has fall glass dash flash salad lad asks fads gala half ','flask salad glass dad sad lad fall hall gash dish fjfj ','aj aj sl sl dk dk fj fj hf hf jg jg kd ls la js dj ','gf hj dj kl sa ;l aj fm gj hk asdf jkl; salad flask ']},
    {t:'Single letters',d:'Every key, its own home',x:'q w e r t y u i o p z x c v b n m , . / ; a s d f g h j k l ',
     pool:['q q w w e e r r t t y y u u i i o o p p a a s s d d f f g g h h j j k k l l ','z z x x c c v v b b n n m m , , . . / / ; ; l l k k j j h h g g ','p o i u y t r e w q ; l k j h g f d s a / . , m n b v c x z ','qaz wsx edc rfv tgb yhn ujm ,ok .il /;p zaq xsw cde vft bgy ','q w e r t y u i o p / . , m n b v c x z ; l k j h g f d s a ']},
    {t:'Letter combos',d:'Two by two, fast and smooth',x:'qw we er rt ty yu ui io op za xs dc fv gb hn jm ,k .l /; qaz wsx edc rfv tgb yhn ujm ',
     pool:['we rt yu io op sd fg hj kl qw er ty ui as df jk ;l ','qaz wsx edc rfv tgb yhn ujm ,ok .il /;p lok ;pi o lum ','za xs cd vf gb hn jm k, l. ;/ pq wo ei ru ty as df ','de fr gt hy ju ki lo ;p sw xa zc vb nm ,. /. qw er ','ty ui op as df gh jk l; er ty ui op we rt yu io pz ']},
    {t:'Short words',d:'Common three-four letters',x:'dad sad fall glass flask salad adds lad ask fad jak gala half hall gas sad lass flag ',
     pool:['task dash flash grass land hand sand jak fad lass gash dish fish wish ','dark darn hard harsh shake shape snake snack trade grade glad plan plant ','grant stand brand crash trask flash grand glass grass grasp shall slash ','half hall gas sad lass flag task dash hand sand land glad plan asks ','fall glass salad dad sad lad add ask jak gala fads gash lass flag ']},
    {t:'Harder words',d:'Longer and trickier',x:'keyboard handwriting journeys electricity straightforward neighborhood extraordinary vocabulary typefast ',
     pool:['everything traditional understand keyboard shortcuts practice together throughout ','wonderful afternoon breakfast chocolate instrument mountains holidays language ','straightforward handwriting neighborhood extraordinary journey keyboard typical ','knowledge celebrate generate organize deliver deliver standards reference delegate ','broadcast download upload keyboard notebook software hardware network laptop ']},
    {t:'Sentence',d:'Punctuation and spacing',x:'The quick brown fox jumps over the lazy dog. Practice every day and your speed will grow fast. ',
     pool:['Type fast but stay accurate. Speed will come with practice and patience. ','A good typist looks at the screen, not at the keyboard, every time. ','Practice makes perfect; type a little every single day and enjoy it. ','Coffee first, then typing: the digital cafe is open all night long. ','Set a small goal today: five more words per minute than yesterday. ']},
    {t:'Paragraph',d:'Smooth continuous typing',x:'In a small cafe at the corner of the street, fresh coffee filled the air. Rain tapped softly on the window while people hurried by with colorful umbrellas. I opened my laptop and began to type; the world, for a moment, felt calm. ',
     pool:['Typing is a superpower you can learn. Every day you practice, your fingers find the keys faster, your eyes stop searching, and your thoughts flow straight onto the screen like water. ','The cafe was quiet that morning. Steam rose from the cups, the machines hummed, and somewhere behind the counter a radio played an old song. I typed page after page, losing track of time. ']},
    {t:'Free typing',d:'Type anything you like',x:'',pool:[]},
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
  const done=Object.keys(typStats().done||{}).length;
  const pct=Math.round(done/TYP_LESSONS[TYP.lang].length*100);
  const streak=store.get('typStreak',0);
  return '<section class="typ-wrap typ-wrap-v19'+(TYP.light?' light':'')+'">'
    +'<div class="typ-hero-v19">'
      +'<div class="typ-hero-bg"><div class="typ-glow g1"></div><div class="typ-glow g2"></div></div>'
      +'<div class="typ-hero-content">'
        +'<span class="kicker"><span class="dot"></span> '+(L==='fa'?'آزمایشگاه تایپ نت‌یار — نسخه ۱۹ پرمیوم':'Typing Lab v19 — Premium')+' · '+faNum(done)+'/'+faNum(TYP_LESSONS[L].length)+' درس</span>'
        +'<h1>'+(L==='fa'?'<span class="g">تایپ</span> ده‌انگشتی رو حرفه‌ای یاد بگیر':'Learn <span class="g">touch typing</span> pro')+'</h1>'
        +'<p>'+(L==='fa'?'درس‌به‌درس، با کیبورد زنده، نمودار سرعت، هیت‌مپ خطا و آزمون زمان‌دار — همه باگ‌ها رفع شد، کیفیت فول، طراحی تمیز خوشگل.':'Step by step with live keyboard, WPM chart, error heatmap and timed tests — bug-free, full quality, clean premium.')+'</p>'
        +'<div class="typ-hero-stats">'
          +'<span>'+ic('trophy',12)+' '+faNum(pct)+'% پیشرفت</span>'
          +'<span>'+ic('zap',12)+' میانگین '+faNum(typStats().n?Math.round(typStats().w/typStats().n):0)+' WPM</span>'
          +'<span>'+ic('activity',12)+' استریک '+faNum(streak)+' روز</span>'
        +'</div>'
      +'</div>'
      +'<div class="typ-hero-visual">'
        +'<div class="typ-card-stack"><div class="tc s1">'+ic('keyboard',20)+'</div><div class="tc s2">'+ic('type',18)+'</div><div class="tc s3">'+ic('zap',16)+'</div></div>'
        +'<div class="typ-mini-chart"><canvas id="typMiniChart" width="140" height="60"></canvas></div>'
      +'</div>'
      +'<div class="typ-hctl">'
        +'<div class="typ-langseg"><button class="tl-btn'+(L==='fa'?' on':'')+'" onclick="typSetLang(\'fa\')">فارسی</button><button class="tl-btn'+(L==='en'?' on':'')+'" onclick="typSetLang(\'en\')">English</button></div>'
        +'<button class="tl-btn ghost" onclick="typLight()" title="حالت روشن/تاریک">'+ic('palette',14)+'</button>'
      +'</div>'
    +'</div>'
    +'<div class="typ-tabs-v19">'
      +'<span class="typ-tab'+(TYP.mode==='learn'?' on':'')+'" onclick="typMode(\'learn\')">'+ic('graduation',14)+(L==='fa'?'آموزش از صفر':'Course')+'</span>'
      +'<span class="typ-tab'+(TYP.mode==='test'?' on':'')+'" onclick="typMode(\'test\')">'+ic('clock',14)+(L==='fa'?'آزمون سرعت':'Speed test')+'</span>'
      +'<span class="typ-tab'+(TYP.mode==='free'?' on':'')+'" onclick="typMode(\'free\')">'+ic('type',14)+(L==='fa'?'تایپ آزاد':'Free')+'</span>'
    +'</div>'
    +'<div id="typBody">'+typBodyHtml()+'</div>'
    +'<div id="typKbWrap">'+typKbHtml()+'</div>'
    +'<input type="text" id="typInput" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" aria-label="'+(L==='fa'?'ورودی تایپ':'typing input')+'">'
  +'</section>';
}
function typBodyHtml(){
  if(TYP.mode==='learn'){
    const s=typStats();
    const done=Object.keys(s.done||{}).length;
    const pct=Math.round(done/TYP_LESSONS[TYP.lang].length*100);
    const lv=typLvl();
    const aw=s.n?Math.round(s.w/s.n):0,aa=s.n?Math.round(s.a/s.n):0;
    const streak=store.get('typStreak',0);
    return '<div class="typ-strip-v19">'
      +'<div class="tst"><b>'+faNum(lv)+'</b><span>'+TYP_LVL_NAMES[TYP.lang][lv-1]+'</span></div>'
      +'<div class="tst"><b>'+faNum(aw)+'</b><span>'+(TYP.lang==='fa'?'میانگین WPM':'Avg WPM')+'</span></div>'
      +'<div class="tst"><b>'+faNum(aa)+'٪</b><span>'+(TYP.lang==='fa'?'میانگین دقت':'Avg Acc')+'</span></div>'
      +'<div class="tst"><b>'+faNum(s.n)+'</b><span>'+(TYP.lang==='fa'?'تمرین':'Sessions')+'</span></div>'
      +'<div class="tst wide"><span>'+(TYP.lang==='fa'?'پیشرفت':'Progress')+' — '+faNum(pct)+'٪ · استریک '+faNum(streak)+' روز</span><div class="typ-pbar"><i style="width:'+pct+'%"></i></div></div>'
    +'</div>'
    +'<div class="typ-lessons-v19">'+TYP_LESSONS[TYP.lang].map((ls,i)=>{
      const dn=s.done&&s.done[i];
      const lock=i>0&&!(s.done&&s.done[i-1]);
      const cur=TYP.lesson===i&&!TYP.fin;
      const rr=s.rnd[i]||0;
      return '<button class="tls'+(dn?' done':'')+(cur?' cur':'')+(lock?' lock':'')+'" onclick="typClickLesson('+i+')">'
        +'<span class="tls-n">'+(dn?ic('check',14):faNum(i+1))+'</span>'
        +'<span class="tls-t">'+ls.t+'</span><span class="tls-d">'+ls.d+'</span>'
        +'<span class="tls-r">'+[0,1,2].map(k=>'<i class="tdot'+(rr>k?' on':'')+'"></i>').join('')+'</span>'
        +(lock?'<span class="tls-lock">'+ic('lock',12)+'</span>':'')
      +'</button>';
    }).join('')+'</div>'
    +'<div id="typPractice">'+((TYP.lesson>=0)?typPracticeHtml():'')+'</div>'
    +typHeatmapHtml();
  }
  if(TYP.mode==='test'){
    const s=typStats();
    const durs=[30,60,120,300];
    return '<div class="typ-strip-v19">'
      +'<div class="tst"><b>'+faNum(s.best&&s.best[TYP.dur]||0)+'</b><span>'+(TYP.lang==='fa'?'رکورد این زمان':'Best here')+'</span></div>'
      +'<div class="tst wide"><span>'+(TYP.lang==='fa'?'زمان آزمون':'Duration')+'</span>'
      +'<div class="typ-durs">'+durs.map(d=>'<button class="tdur'+(TYP.dur===d?' on':'')+'" onclick="typDur('+d+')">'+(d<60?faNum(d)+' ثانیه':faNum(d/60)+' دقیقه')+'</button>').join('')
      +'<span class="tdur custom">'+ic('wrench',12)+'<input type="number" id="typCustom" min="10" max="600" placeholder="ثانیه" value=""></span>'
      +'<button class="btn gold" onclick="typDurCustom()">'+ic('play',13)+(TYP.lang==='fa'?'شروع':'Start')+'</button></div></div>'
    +'</div>'
    +'<div id="typPractice">'+((TYP.lesson>=0)?typPracticeHtml():'<div class="empty small"><span class="e-ic">'+ic('clock',24)+'</span><h3>آماده‌ای؟</h3><p>زمان رو انتخاب کن و شروع کن — سرعتت زنده حساب می‌شه.</p><button class="btn gold" onclick="typStartTest()">'+ic('play',14)+' شروع آزمون '+faNum(TYP.dur)+' ثانیه‌ای</button></div>')+'</div>';
  }
  return '<div class="typ-free-v19"><textarea id="typInpFree" dir="'+(TYP.lang==='fa'?'rtl':'ltr')+'" placeholder="'+(TYP.lang==='fa'?'هر چه دوست داری بنویس — سرعتت زنده حساب می‌شود…':'Type anything — live speed is counted…')+'"></textarea>'
    +'<div class="typ-fstats"><span>'+(TYP.lang==='fa'?'سرعت':'WPM')+': <b id="tfWpm">۰</b></span><span>'+(TYP.lang==='fa'?'کاراکتر':'Chars')+': <b id="tfCh">۰</b></span><span>'+(TYP.lang==='fa'?'کلمه':'Words')+': <b id="tfWd">۰</b></span><span>'+(TYP.lang==='fa'?'زمان':'Time')+': <b id="tfT">۰:۰۰</b></span><button class="btn ghost sm" onclick="document.getElementById(\'typInpFree\').value=\'\';typFreeStats()">'+ic('trash',12)+' پاک</button></div></div>';
}
function typHeatmapHtml(){
  const heat=TYP.heat||{};
  const entries=Object.entries(heat).sort((a,b)=>b[1]-a[1]).slice(0,12);
  if(!entries.length) return '';
  return '<div class="typ-heat"><h4>'+ic('activity',14)+' کلیدهای پرخطا — روشون بیشتر تمرین کن</h4><div class="heat-grid">'+entries.map(([k,c])=>{
    const z=TYP_ZONE[TYP.lang][k]||'th';
    return '<span class="heat-k z-'+z+'" title="'+esc(k)+' — '+faNum(c)+' خطا"><b>'+esc(k)+'</b><i>'+faNum(c)+'</i></span>';
  }).join('')+'</div></div>';
}
function typPracticeHtml(){
  const L=TYP.lang;
  const ls=TYP.mode==='learn'?TYP_LESSONS[L][TYP.lesson]:null;
  return '<div class="typ-practice-v19'+(TYP.fin?' fin':'')+'">'
    +'<div class="typ-phead"><span class="typ-pttl">'+(ls?ls.t:(L==='fa'?'آزمون سرعت':'Speed test'))+'</span>'
      +(TYP.mode==='learn'?'<span class="typ-round">'+(L==='fa'?'دور':'Round')+' <b>'+faNum((typStats().rnd[TYP.lesson]||0)+1)+'</b> از ۳'
        +'<span class="tdots">'+[0,1,2].map(k=>'<i class="tdot'+((typStats().rnd[TYP.lesson]||0)>k?' on':'')+'"></i>').join('')+'</span></span>':'')
      +'<div class="typ-pctl">'
        +'<button class="tl-btn sm'+(typSndOn()?' on':'')+'" onclick="typSndToggle()" title="صدا">'+ic(typSndOn()?'volume':'volume-x',12)+'</button>'
        +(TYP.mode==='learn'?'<button class="tl-btn sm'+(TYP.block?' on':'')+'" onclick="typBlock()">'+ic('shield-check',12)+(L==='fa'?'سخت‌گیر':'Strict')+'</button>':'')
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
      +(TYP.mode==='test'?'<span class="tss gold">'+ic('clock',12)+(L==='fa'?'مانده':'Left')+' <b id="tLeft">—</b></span>':'<span class="tss">'+ic('list',12)+(L==='fa'?'مانده':'Left')+' <b id="tLeft">—</b></span>')
      +'<span class="tss">'+ic('activity',12)+(L==='fa'?'واکنش':'React')+' <b id="tReact">—</b></span>'
    +'</div>'
    +'<div class="typ-pbar big"><i id="tBar" style="width:0%"></i></div>'
    +'<canvas id="typChart" width="600" height="100" class="typ-chart"></canvas>'
  +'</div>';
}
function typPromptHtml(){
  if(TYP.fin)return TYP.mode==='test'?(TYP.lang==='fa'?'تمام شد! نتیجه آماده است':'Done! Results ready'):(TYP.lang==='fa'?'درس تمام شد! عالی بودی':'Lesson complete!');
  const t=TYP.text[TYP.log.length]||'';
  if(t==='')return (TYP.lang==='fa'?'شروع کن… تایپ کن!':'Start typing!');
  if(t===' ')return TYP.lang==='fa'?'بعدی: <b>فاصله</b> — '+TYP_FINGER.fa.th:'Next: <b>Space</b> — '+TYP_FINGER.en.th;
  if(t==='\u200c')return TYP.lang==='fa'?'بعدی: <b>نیم‌فاصله</b> — Shift+Space':'Next: <b>Half-space</b>';
  const z=TYP_ZONE[TYP.lang][t]||TYP_ZONE[TYP.lang][typNorm(t)]||'th';
  const disp=TYP.lang==='en'?t.toUpperCase():t;
  return (TYP.lang==='fa'?'بعدی:':'Next:')+' <b class="gold">'+esc(disp)+'</b> — '+TYP_FINGER[TYP.lang][z];
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
function typKbHtml(){
  const L=TYP.lang,rows=TYP_ROWS[L],sub=TYP_SUB[L==='fa'?'en':'fa'];
  let h='<div class="typ-kb-v19'+(L==='en'?' en':'')+'" id="typKb">';
  rows.forEach((r,ri)=>{
    h+='<div class="krow r'+ri+'">';
    r.forEach(k=>{
      const z=TYP_ZONE[L][k]||'th';
      h+='<button class="kk z-'+z+(k===';'||k==='.'||k==='/'||k===','?' wide-s':'')+'" data-k="'+esc(k)+'" data-z="'+z+'" onclick="typKbTap(\''+(k==='\\'?'\\\\':k.replace(/'/g,"\\'"))+'\')">'
        +'<span class="kmain">'+(L==='en'?k.toUpperCase():k)+'</span>'
        +(sub&&sub[k]?'<span class="ksub">'+sub[k]+'</span>':'')
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
function kbEl(ch){
  const d=document.getElementById('typKb');if(!d)return null;
  const esc=k=>{ try{ return (window.CSS&&CSS.escape?CSS.escape(k):k); }catch(e){ return k; } };
  let el=d.querySelector('[data-k="'+esc(ch)+'"]');
  if(el) return el;
  el=d.querySelector('[data-k="'+esc(typNorm(ch))+'"]');
  return el;
}
function typKbNext(){
  const d=document.getElementById('typKb');if(!d)return;
  d.querySelectorAll('.next,.zl').forEach(e=>e.classList.remove('next','zl'));
  if(TYP.fin||!TYP.text)return;
  const t=TYP.text[TYP.log.length];
  if(!t)return;
  const el=kbEl(typNorm(t))||kbEl(t);
  if(el){
    el.classList.add('next');
    const z=el.dataset.z;
    d.querySelectorAll('[data-z="'+z+'"]').forEach(e=>e.classList.add('zl'));
  }
  const pr=document.getElementById('typPrompt');
  if(pr)pr.innerHTML=typPromptHtml();
}
function typKbHit(ch,ok){
  const el=kbEl(typNorm(ch))||kbEl(ch);
  if(el){el.classList.add(ok?'hit':'miss');setTimeout(()=>el.classList.remove('hit','miss'),200);}
}

/* ---------- جریان تمرین — باگ‌فیکس اصلی ---------- */
function typMode(m){
  TYP.mode=m;TYP.lesson=-1;TYP.fin=false;typStopInt();typRerender();setTimeout(typFocus,80);
}
function typSetLang(l){
  TYP.lang=l;store.set('typLang',l);
  TYP.lesson=-1;TYP.fin=false;TYP.log=[];typStopInt();typRerender();setTimeout(typFocus,80);
}
function typLight(){TYP.light=!TYP.light;store.set('typLight',TYP.light);
  const w=document.querySelector('.typ-wrap-v19')||document.querySelector('.typ-wrap');if(w)w.classList.toggle('light',TYP.light);}
function typClickLesson(i){
  const s=typStats();
  if(i>0&&!(s.done&&s.done[i-1])){toast(TYP.lang==='fa'?'اول درس قبلی را تمام کن!':'Finish previous first','info');return;}
  TYP.mode='learn';typStartLesson(i);
}
function typStartLesson(i){
  TYP.lesson=i;TYP.fin=false;TYP.log=[];TYP.errs=0;TYP.startT=0;TYP.charT=0;TYP.reactSum=0;TYP.reactN=0;TYP.res=null;TYP.history=[];
  const ls=TYP_LESSONS[TYP.lang][i];
  const st=typStats();
  const pool=(ls.pool&&ls.pool.length)?ls.pool:[ls.x];
  TYP.text=pool[(st.rnd[i]||0)%pool.length]||'';
  if(!TYP.text){TYP.mode='free';typRerender();return;}
  TYP.running=true;typStopInt();
  typRerender();setTimeout(()=>{typFocus();typDrawChart();},60);
}
function typDur(d){TYP.dur=d;typRerender();}
function typDurCustom(){
  const el=document.getElementById('typCustom');
  const v=el&&+el.value;
  if(!v||v<5||v>900){toast(TYP.lang==='fa'?'زمان بین ۵ تا ۹۰۰ ثانیه':'Pick 5–900 sec','info');return;}
  TYP.dur=v;typStartTest();
}
function typStartTest(){
  TYP.mode='test';TYP.fin=false;TYP.log=[];TYP.errs=0;TYP.startT=0;TYP.charT=0;TYP.reactSum=0;TYP.reactN=0;TYP.res=null;TYP.history=[];
  const ws=TYP_WORDS[TYP.lang];
  const parts=[];
  for(let i=0;i<160;i++)parts.push(ws[Math.floor(Math.random()*ws.length)]);
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
  typRerender();setTimeout(()=>{typFocus();typDrawChart();},60);
}
function typRestart(){
  if(TYP.mode==='test')typStartTest();
  else if(TYP.lesson>=0)typStartLesson(TYP.lesson);
}
function typQuit(){TYP.lesson=-1;TYP.fin=false;TYP.log=[];typStopInt();typRerender();}
function typBlock(){TYP.block=!TYP.block;typRerender();setTimeout(typFocus,50);}
function typBack(){
  if(TYP.mode==='free')return;
  if(TYP.block&&TYP.mode==='learn')return;
  if(!TYP.log.length)return;
  TYP.log.pop();
  typPaint();
}
function typFocus(){
  const inp=document.getElementById('typInput');
  if(inp){ inp.value=''; inp.focus(); }
}
function typChar(ch){
  if(TYP.mode==='free'){
    const ta=document.getElementById('typInpFree');
    if(!ta)return;
    if(!TYP.freeT0)TYP.freeT0=performance.now();
    typFreeStats();
    return;
  }
  if(TYP.fin||!TYP.text)return;
  const idx=TYP.log.length;
  const tgt=TYP.text[idx];
  if(tgt===undefined)return;
  const now=performance.now();
  if(TYP.startT===0){TYP.startT=now;TYP.charT=now;typStartElapsed();}
  const normCh=typNorm(ch);
  const normTgt=typNorm(tgt);
  const ok=normCh===normTgt;
  if(ok){
    TYP.reactSum+=now-TYP.charT; TYP.reactN++;
    TYP.charT=now;
    typSfx(true); typKbHit(ch,true);
    TYP.log.push({c:ch,ok:true});
    // WPM history
    if(TYP.log.length%6===0){ TYP.history.push(typCalcWpm()); typDrawChart(); }
  }else{
    // خطا
    TYP.errs++;
    // heatmap
    const key=tgt;
    TYP.heat[key]=(TYP.heat[key]||0)+1;
    store.set('typHeat',TYP.heat);
    typSfx(false); typKbHit(ch,false);
    const cur=document.querySelector('.tc.cur');
    if(cur){cur.classList.add('no');setTimeout(()=>cur&&cur.classList.remove('no'),260);}
    if(TYP.block){
      // در حالت سخت‌گیر، فقط خطا بشمار، جلو نرو
      typPaintStats();
      return;
    }else{
      TYP.log.push({c:ch,ok:false});
    }
  }
  if(TYP.log.length>=TYP.text.length){
    if(TYP.mode==='test')typFinishTest();
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
function typElapsed(){return TYP.startT?(performance.now()-TYP.startT)/1000:0;}
function typCalcWpm(){const m=typElapsed()/60;return m>0?Math.round(TYP.log.filter(x=>x.ok).length/5/m):0;}
function typPaintStats(){
  const w=document.getElementById('tWpm');if(w)w.textContent=faNum(typCalcWpm());
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length + (TYP.block?TYP.errs:0); // در سخت‌گیر، errs جداگانه
  const tot=okc+bad;
  const acc=document.getElementById('tAcc');
  if(acc){acc.textContent=faNum(tot?Math.round(okc/tot*100):100)+'٪';}
  const e=document.getElementById('tErr');if(e)e.textContent=faNum(bad);
  const l=document.getElementById('tLeft');
  if(l&&TYP.mode!=='test')l.textContent=faNum(TYP.text.length-TYP.log.length);
  const r=document.getElementById('tReact');
  if(r)r.textContent=TYP.reactN?faNum(Math.round(TYP.reactSum/TYP.reactN))+'ms':'—';
  const b=document.getElementById('tBar');
  if(b)b.style.width=Math.round(TYP.log.length/Math.max(1,TYP.text.length)*100)+'%';
}
function typTickStats(){ typPaintStats(); if(TYP.log.length%5===0){ TYP.history.push(typCalcWpm()); typDrawChart(); } }
function typDrawChart(){
  const c=document.getElementById('typChart'); if(!c) return;
  const ctx=c.getContext('2d');
  const W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  const hist=TYP.history;
  if(!hist.length) return;
  const max=Math.max(...hist,10);
  ctx.beginPath();
  ctx.strokeStyle='rgba(240,199,94,.9)'; ctx.lineWidth=2.5; ctx.lineJoin='round';
  hist.forEach((v,i)=>{
    const x=i/(Math.max(1,hist.length-1))*W;
    const y=H - (v/max)*H*0.8 - 8;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  // fill
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'rgba(240,199,94,.35)'); grad.addColorStop(1,'rgba(240,199,94,0)');
  ctx.fillStyle=grad; ctx.fill();
}
function typFreeStats(){
  const ta=document.getElementById('typInpFree');if(!ta)return;
  const v=ta.value;
  if(!TYP.freeT0 && v.length) TYP.freeT0=performance.now();
  const s=TYP.freeT0?Math.floor((performance.now()-TYP.freeT0)/1000):0;
  const wpm=s>2?Math.round(v.length/5/(s/60)):0;
  const a=document.getElementById('tfWpm');if(a)a.textContent=faNum(wpm);
  const c=document.getElementById('tfCh');if(c)c.textContent=faNum(v.length);
  const wd=document.getElementById('tfWd');if(wd)wd.textContent=faNum(v.trim()?v.trim().split(/\s+/).length:0);
  const t=document.getElementById('tfT');if(t)t.textContent=faNum(Math.floor(s/60))+':'+faNum((s%60<10?'0':'')+(s%60));
}
function typPaint(){
  const t=document.getElementById('typText');
  if(t){
    if(t.dataset.txt!==TYP.text){t.innerHTML=typTextHtml();t.dataset.txt=TYP.text;t.dataset.li='0';}
    const sp=t.children,i=TYP.log.length,li=+(t.dataset.li||0);
    if(i!==li&&sp.length){
      const a=Math.min(i,li),b=Math.max(i,li);
      for(let k=a;k<b;k++){
        const lg=TYP.log[k];
        if(sp[k])sp[k].className='tc '+(lg?(lg.ok?'ok':'bad'):'')+(TYP.text[k]===' '?' sp':'');
      }
    }
    if(sp[i])sp[i].className='tc cur'+(TYP.text[i]===' '?' sp':'');
    t.dataset.li=i;
    // auto scroll to current
    const cur=sp[i]; if(cur){ try{ cur.scrollIntoView({block:'nearest',behavior:'smooth'}); }catch(e){} }
  }
  typKbNext();
}
function typRerender(){
  const k=document.getElementById('typKbWrap');
  if(k)k.innerHTML=typKbHtml();
  const b=document.getElementById('typBody');
  if(b)b.innerHTML=typBodyHtml();
  typPaint();typPaintStats();setTimeout(typDrawChart,80);
  setTimeout(typFocus,80);
}
/* ---------- پایان‌ها ---------- */
function typFinishLesson(){
  TYP.fin=true;TYP.running=false;typStopInt();
  const wpm=typCalcWpm();
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length + (TYP.block?TYP.errs:0);
  const acc=okc+bad?Math.round(okc/(okc+bad)*100):100;
  const react=TYP.reactN?Math.round(TYP.reactSum/TYP.reactN):0;
  const p=typProg();
  const s=p[TYP.lang]=p[TYP.lang]||{done:{},rnd:{},n:0,w:0,a:0,best:{}};
  s.rnd=s.rnd||{};s.done=s.done||{};
  const rounds=(s.rnd[TYP.lesson]||0)+1;
  s.rnd[TYP.lesson]=rounds;
  const complete=rounds>=3;
  if(complete&&!s.done[TYP.lesson])s.done[TYP.lesson]={w:wpm,a:acc};
  s.n++;s.w+=wpm;s.a+=acc;
  // streak
  const today=new Date().toDateString();
  const last=store.get('typLastDay','');
  if(last!==today){
    if(last && (new Date()-new Date(last))/86400000<2) store.set('typStreak',(store.get('typStreak',0)||0)+1);
    else store.set('typStreak',1);
    store.set('typLastDay',today);
  }
  // history
  let hist=store.get('typHistory',[]);
  hist.push({t:Date.now(),w:wpm,a:acc,lang:TYP.lang,lesson:TYP.lesson});
  if(hist.length>60) hist=hist.slice(-60);
  store.set('typHistory',hist);
  typSaveProg(p);
  TYP.res={wpm,acc,errs:bad,react,rounds,complete};
  typSfx(true);
  typRerender();
  const pr=document.getElementById('typPractice');
  const ttl=complete?(TYP.lang==='fa'?'درس تمام شد!':'Lesson complete!'):(TYP.lang==='fa'?'دور '+faNum(rounds)+' از ۳':'Round '+rounds+' of 3');
  if(pr)pr.insertAdjacentHTML('beforeend',typResultHtml(ttl,true));
  toast((complete?(TYP.lang==='fa'?'درس ':'Lesson '):(TYP.lang==='fa'?'دور ':'Round '))+faNum(TYP.lesson+1)+' — '+faNum(wpm)+' WPM','trophy');
  try{ if(typeof coinAdd==='function') coinAdd(5+(complete?15:0), 'تایپ '+TYP_LESSONS[TYP.lang][TYP.lesson].t); }catch(e){}
}
function typFinishTest(){
  TYP.fin=true;TYP.running=false;typStopInt();
  const wpm=typCalcWpm();
  const okc=TYP.log.filter(x=>x.ok).length;
  const bad=TYP.log.filter(x=>!x.ok).length + (TYP.block?TYP.errs:0);
  const acc=okc+bad?Math.round(okc/(okc+bad)*100):100;
  const secs=Math.min(TYP.dur,Math.round(typElapsed()))||TYP.dur;
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
  try{ if(typeof coinAdd==='function') coinAdd(Math.max(5, Math.floor(wpm/4)), 'آزمون تایپ'); }catch(e){}
}
function typResultHtml(title,isLesson){
  const r=TYP.res;if(!r)return '';
  const L=TYP.lang;
  return '<div class="overlay typ-ov" onclick="if(event.target===this)this.remove()">'
    +'<div class="modal typ-modal typ-modal-v19" onclick="event.stopPropagation()">'
      +'<button class="x" onclick="this.closest(\'.overlay\').remove()">'+ic('x',14)+'</button>'
      +'<div class="tm-ic">'+ic('trophy',28)+'</div>'
      +'<h3>'+title+'</h3>'
      +(r.rec?'<div class="tm-rec">'+ic('sparkles',13)+(L==='fa'?'رکورد جدید!':'New record!')+'</div>':'')
      +'<div class="tm-grid">'
        +'<div class="tm-c gold"><b>'+faNum(r.wpm)+'</b><span>WPM</span></div>'
        +'<div class="tm-c"><b>'+faNum(r.acc)+'٪</b><span>'+(L==='fa'?'دقت':'Accuracy')+'</span></div>'
        +'<div class="tm-c"><b>'+faNum(r.errs)+'</b><span>'+(L==='fa'?'خطا':'Errors')+'</span></div>'
        +'<div class="tm-c"><b>'+(isLesson?faNum(Math.round((r.react||0)))+'ms':faNum(r.okc))+'</b><span>'+(isLesson?(L==='fa'?'واکنش':'Reaction'):(L==='fa'?'صحیح':'Correct'))+'</span></div>'
      +'</div>'
      +(isLesson&&!r.complete?'<div class="tm-round">'+(L==='fa'?'این درس ۳ دور دارد — خط بعدی را تمرین کن!':'This lesson has 3 rounds — next line!')+'</div>':'')
      +'<div class="row">'
        +'<button class="btn gold" onclick="this.closest(\'.overlay\').remove();typRestart()">'+ic('rotate-ccw',14)+(isLesson&&!r.complete?(L==='fa'?'دور بعد':'Next round'):(L==='fa'?'دوباره':'Again'))+'</button>'
        +'<button class="btn ghost" onclick="this.closest(\'.overlay\').remove()">'+ic('check',14)+(L==='fa'?'باشه':'OK')+'</button>'
      +'</div>'
    +'</div></div>';
}
/* ---------- اتصال رخدادها ---------- */
function typBind(){
  document.addEventListener('keydown',e=>{
    if(TYP.mode==='free') return;
    if(!TYP.text || TYP.fin) return;
    // handle backspace globally for typing view
    if(e.key==='Backspace'){ 
      const active=document.activeElement && document.activeElement.id==='typInpFree';
      if(active) return;
      e.preventDefault(); typBack(); return;
    }
    // prevent typing when input not focused? allow
    if(e.key.length===1 || e.key===' ' || e.key==='Enter'){
      const active=document.activeElement && (document.activeElement.tagName==='INPUT' || document.activeElement.tagName==='TEXTAREA');
      if(active && document.activeElement.id!=='typInput') return;
      if(e.key==='Enter') return;
      e.preventDefault();
      typChar(e.key===' '?' ':e.key);
      const inp=document.getElementById('typInput'); if(inp) inp.value='';
    }
  });
  document.addEventListener('input',e=>{
    if(e.target&&e.target.id==='typInput'){
      const v=e.target.value;
      if(v){
        // handle last char
        const ch=v.slice(-1);
        if(ch) typChar(ch);
        e.target.value='';
      }
    }
    if(e.target&&e.target.id==='typInpFree')typFreeStats();
  });
  document.addEventListener('click',e=>{
    const t=e.target.closest && e.target.closest('.typ-text');
    if(t) typFocus();
  });
}
if(typeof document!=='undefined'&&document.addEventListener&&!window.__typBound){
  window.__typBound=true;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',typBind);
  else typBind();
}
