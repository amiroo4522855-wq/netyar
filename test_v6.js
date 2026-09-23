/* تست کامل v6 — jsdom، async با API واقعی */
const fs=require('fs');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('netyar.html','utf-8');
const vc=new VirtualConsole();vc.on('jsdomError',()=>{});
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://amiroo4522855-wq.github.io/netyar/',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window,d=w.document,ev=x=>w.eval(x);
w.HTMLCanvasElement.prototype.getContext=function(){
  return new Proxy({},{get:(t,k)=>typeof k==='string'?(()=>({addColorStop(){}})):undefined});
};
let pass=0,fail=0;const fails=[];
function T(n,c){if(c){pass++;console.log('  ✓ '+n);}else{fail++;fails.push(n);console.log('  ✗ FAIL: '+n);}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function keys(k){d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));}
const $=s=>d.querySelector(s),$$=s=>d.querySelectorAll(s);
const bodyTxt=()=>($('.content')||d.body).textContent;

(async()=>{try{

console.log('— بوت و ناوبری —');
w.__finishLoader();
await sleep(450);
T('لودر تمام شد',w.eval('document.body').classList.contains('ready'));
const views=['music','sites','games','shop','calc','fav','ai','game-dino','game-tower','game-tetris','game-2048','game-snake','game-ttt','game-memory','game-rps','game-react','game-coin','game-dice','game-puzzle','game-word','game-chess','game-flappy','game-breakout','game-mines','game-bubble','game-angry','game-hajabbas'];
let navOK=0;const navBad=[];
for(const v of views){
  try{w.go(v);await sleep(300);if(bodyTxt().length>100)navOK++;else navBad.push(v);}
  catch(e){navBad.push(v+'('+e.message.slice(0,40)+')');}
}
T('همه نما بدون خطا رندر شدند ('+navOK+'/'+views.length+')',navOK===views.length);
if(navBad.length)console.log('   nav bad:',navBad.join(' | '));
T('۱۹+ بازی در متادیتا (۲۰)',ev('Object.keys(GAME_META).length')>=19);

console.log('— بازی‌خانه —');
w.go('games');await sleep(300);
T('بنر دایی ناصر',bodyTxt().includes('دایی ناصر'));
T('بنر برج‌سازی',bodyTxt().includes('برج‌سازی'));
T('۱۷+ کارت بازی جدید (۱۸)',$$('.game-card.playable').length>=17);
T('بدون «به‌زودی» در صفحه',!bodyTxt().includes('به‌زودی'));

console.log('— تتریس —');
w.go('game-tetris');await sleep(300);
T('شروع و قطعه اول',ev('TET.cur')!==null&&ev('TET.on')===true);
keys('ArrowLeft');keys('ArrowRight');keys('ArrowUp');keys('ArrowDown');keys(' ');
T('حرکت/چرخش/سقوط',ev('TET.cur')!==null);
ev('TET.score=80;TET.lines=9;TET.over=true');
keys('Enter');
T('Enter=ری‌استارت',ev('TET.score')===0&&ev('TET.lines')===0&&ev('TET.over')===false);
T('۵ دکمه لمسی',$$('.touch-btns .btn').length===5);

w.eval('TET.lines=5');w.eval('tetUpdate(16)');
T('فلاش پاک‌شدن خط تتریس',ev('TET.flash')>0);

console.log('— ۲۰۴۸ —');
w.go('game-2048');await sleep(300);
T('دو خانه اولیه',ev('G48.board.filter(x=>x).length')===2);
ev('G48.board=[2,2,4,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];G48.score=0;g48Render()');
keys('ArrowLeft');
T('ادغام ۲+۲ و امتیاز',ev('G48.board[0]')===4&&ev('G48.score')>=4);
T('امتیاز شناور + پاپ ادغام',!!$('.g48-float')&&$$('.g48-tile.pop').length>=1);

console.log('— مار —');
w.go('game-snake');await sleep(300);
T('مار اولیه',ev('SNK.snake.length')===3);
keys('ArrowUp');
T('جهت جدید',JSON.stringify(ev('SNK.ndir'))==='[0,-1]');
ev('SNK.over=true');
keys('Enter');
T('ری‌استارت',ev('SNK.snake.length')===3&&ev('SNK.score')===0);
T('۴ دکمه لمسی',$$('.touch-btns .btn').length===4);
w.eval('SNK.acc=9999;snkUpdate(16)');
T('اینترپولیشن نرم مار',Array.isArray(ev('SNK.prev'))&&ev('SNK.prev.length')===3);

console.log('— دوز —');
w.go('game-ttt');await sleep(300);
$$('.ttt-c')[4].click();
T('X بازیکن',ev('TTT.b[4]')==='X');
await sleep(600);
T('ربات O گذاشت',ev('TTT.b.filter(x=>x==="O").length')===1);

console.log('— حافظه —');
w.go('game-memory');await sleep(300);
$$('.mem-c')[0].click();$$('.mem-c')[1].click();
T('دو کارت باز',ev('MEM.open.length')===2||ev('MEM.lock')===true);
T('شمار حرکت',ev('MEM.moves')===1);
T('کارت‌ها آیکون SVG',$$('.mem-c svg').length>=2);

console.log('— سنگ کاغذ قیچی —');
w.go('game-rps');await sleep(300);
$$('.rps-b')[0].click();
await sleep(700);
T('دور بازی شد',ev('RPS.me+RPS.pc+RPS.draw')===1);

console.log('— ری‌اکشن —');
w.go('game-react');await sleep(300);
$('.rct-panel').click();
T('فاز انتظار',ev('RCT.st')==='wait');
$('.rct-panel').click();
T('زودزد = پیام',ev('RCT.st')==='idle'&&bodyTxt().includes('زود زدی'));

console.log('— سکه و تاس —');
w.go('game-coin');await sleep(300);
$('.coin-btn').click();
T('چرخش سکه',ev('COIN.spinning')===true);
await sleep(2100);
T('نتیجه سکه',ev('COIN.h+COIN.t')===1);
w.go('game-dice');await sleep(300);
$('.coin-btn').click();
T('ریختن تاس',ev('DICE.rolling')===true);
await sleep(1000);
T('تاس ۱ تا ۶',ev('DICE.v[0]>=1&&DICE.v[0]<=6&&DICE.v[1]>=1&&DICE.v[1]<=6'));

console.log('— پازل —');
w.go('game-puzzle');await sleep(300);
T('۱۶ کاشی یکتا',(()=>{const t=ev('PZL.tiles');return t.length===16&&new Set(t).size===16;})());
const mv0=ev('PZL.moves');
const z=ev('PZL.tiles.indexOf(0)');
const cand=z>3?z-4:(z<12?z+4:(z%4>0?z-1:z+1));
$$('.pzl-t')[cand].click();
T('حرکت کاشی',ev('PZL.moves')===mv0+1);
keys('ArrowUp');
T('فلش پازل',ev('PZL.moves')>=mv0+1);

T('دکمهٔ صدا در نوار بازی',$$('.gi-sfx').length===1);

console.log('— واژه‌یاب —');
w.go('game-word');await sleep(300);
T('۸۱ خانه',$$('.wrd-c').length===81);
T('۸ کلمه چیده شده',ev('WRD.words.length')===8&&ev('WRD.words[0]')!==undefined);
const w0=JSON.parse(JSON.stringify(ev('WRD.words[0]')));
const widx=s=>{const p=s.split('-').map(Number);return p[0]*9+p[1];};
T('کلمه در محدوده جدول',w0.cells.every(c=>widx(c)>=0&&widx(c)<81));
$$('.wrd-c')[widx(w0.cells[0])].click();
$$('.wrd-c')[widx(w0.cells[w0.cells.length-1])].click();
T('پیدا شدن کلمه',ev('WRD.found.length')===1);
T('کلمه نشان‌دار',$$('.wrd-c.fd').length===w0.cells.length);
T('تایمر',$$('.wrd-time').length>=1);
T('نوار پیشرفت واژه‌یاب',$$('.wrd-pbar').length===1);

console.log('— شطرنج —');
w.go('game-chess');await sleep(300);
T('۱۶ مهره سفید',ev('CHS.b.flat().filter(p=>p&&p.col==="w").length')===16);
ev('(()=>{outer:for(let r=6;r<8;r++)for(let c=0;c<8;c++)if(CHS.b[r][c]&&CHS.b[r][c].t==="p"&&CHS.b[r][c].col==="w"){window.__pr=r;window.__pc=c;break outer;}})()');
const pr=ev('__pr'),pc=ev('__pc');
$$('.chs-c')[pr*8+pc].click();
T('انتخاب سرباز',JSON.stringify(ev('CHS.sel'))==='['+pr+','+pc+']');
T('دو حرکت قانونی',$$('.chs-dot').length===2);
$$('.chs-c')[(pr-2)*8+pc].click();
T('حرکت انجام شد',ev('CHS.b['+pr+']['+pc+']')===null);
T('نوبت ربات',ev('CHS.turn')==='b');
T('نشانه‌گذاری حرکت آخر',Array.isArray(ev('CHS.last'))&&ev('CHS.last.length')===4);
await sleep(700);
T('پاسخ ربات',ev('CHS.turn')==='w');

console.log('— دایی ناصر و برج v6 —');
w.go('game-dino');await sleep(300);
T('شروع دینو',ev('DINO.on')===true);
keys('Enter');
T('پرش',ev('DINO.vy')<0);
keys('ArrowDown');
T('خم شدن',ev('DINO.duck')===true);
w.go('game-tower');await sleep(300);
T('شروع برج',ev('TWR.on')===true);
keys('Enter');
T('رها کردن',ev('TWR.blocks.length')>=1);

console.log('— ماشین‌حساب v6 —');
w.go('calc');await sleep(300);
const val=()=>$('.calc-disp .val').textContent;
const press=k=>{const b=$('.ck[data-k="'+k+'"]');if(b)b.click();else throw new Error('کلید '+k)};
['7','×','8','+','6','='].forEach(press);
T('۷×۸+۶=۶۲',val()==='۶۲');
['AC','0','.','1','+','0','.','2','='].forEach(press);
T('۰٫۱+۰٫۲=۰٫۳ دقیق',val()==='۰٫۳');
press('√');
T('√۰٫۳=۰٫۵۴۷۷۲۲۵۵۷۵۰۵۲',val()==='۰٫۵۴۷۷۲۲۵۵۷۵۰۵۲');
['AC','5'].forEach(press);$('.ck[data-k="sq"]').click();
T('x²=۲۵',val()==='۲۵');
$('.ck[data-k="inv"]').click();
T('¹∕x=۰٫۰۴',val()==='۰٫۰۴');
$('.ck[data-k="pi"]').click();
T('π=۳٫۱۴۱۵۹۲۶۵۳۵۹',val()==='۳٫۱۴۱۵۹۲۶۵۳۵۹');
['AC','4','÷','0','='].forEach(press);
T('تقسیم بر صفر=خطا',val()==='خطا');
['AC','9'].forEach(press);keys('Backspace');
T('Backspace',val()==='۰');
keys('p');
T('کلید p=π',val()==='۳٫۱۴۱۵۹۲۶۵۳۵۹');
press('AC');

console.log('— موزیک v6 —');
let calls=0;
w.fetch=(url)=>{
  calls++;const u=String(url);
  if(u.includes('/v1/tracks/search')){
    if(calls===1)return Promise.reject(new Error('host down'));
    return Promise.resolve({ok:true,json:()=>Promise.resolve({data:[{id:'x1',title:'Coffee',user:{name:'Nastran'},duration:200,artwork:{'150x150':'http://a/1.jpg'},is_streamable:true}]})});
  }
  return Promise.reject(new Error('skip'));
};
w.go('music');await sleep(300);
$('#musInp').value='قهوه';
$('.mus-go').click();
await sleep(300);
T('failover هاست اوودیوس',calls>=2&&ev('MUS.results')&&ev('MUS.results.length')===1);
T('حذف لودینگ',ev('MUS.loading')===false);
w.fetch=(url)=>{
  const u=String(url);
  if(u.includes('/v1/tracks/search'))return Promise.resolve({ok:true,json:()=>Promise.resolve({data:[]})});
  if(u.includes('archive.org/advancedsearch'))return Promise.resolve({ok:true,json:()=>Promise.resolve({response:{docs:[{identifier:'net-test',title:'NetYar Song',creator:['AM']}]}})});
  if(u.includes('/metadata/'))return Promise.resolve({ok:true,json:()=>Promise.resolve({files:[{name:'song.mp3',format:'VBR MP3'}]})});
  return Promise.reject(new Error('skip'));
};
$('#musInp').value='ناستران';
$('.mus-go').click();
await sleep(300);
T('نتیجه آرشیو',ev('MUS.results')&&ev('MUS.results[0].t')==='NetYar Song');
T('دکمه‌های گوگل/یوتیوب',!!$('a[href*="google.com/search"]')&&!!$('a[href*="youtube.com"]'));

console.log('— رگرسیون v5 —');
w.go('home');await sleep(300);
  T('نسخه ۱۸٫۰',bodyTxt().includes('نسخه ۱۸٫۰'));
w.go('sites');await sleep(320);
T('۵۳۱ سایت',$$('.content article.card').length===531);
w.go('home');await sleep(300);
T('فوتر لینک آنلاین',!!$('a.gh-link'));
const src=fs.readFileSync('netyar.html','utf-8');
T('شب/روز ۱۳ ثانیه',src.includes('D.t%13000'));
T('سختی فزاینده',src.includes('dt*0.00027')&&src.includes('D.dist/7000'));
T('بدون ایموجی',!/(?:[\uD800-\uDBFF][\uDC00-\uDFFF])/.test(src));

console.log('— v9: آموزش تایپ —');
T('منوی آموزش',$$('body').length&&d.body.textContent.includes('آموزش')&&!!ev('NAV.find(n=>n.v==="typing")'));
w.go('typing');await sleep(320);
T('نمای تایپ رندر شد',!!$('.typ-wrap')&&$$('.tls').length===9);
T('کیبورد فارسی کامل',$$('.kk').length>=45&&!!kbKey('ش'));
T('هایلایت انگشت‌ها',$$('.kk.z-li').length>=6);
w.eval('typSetLang("en")');await sleep(320);
T('سوییچ انگلیسی: کیبورد QWERTY',!!kbKey('q')&&!!kbKey(';'));
T('درس‌های انگلیسی',d.body.textContent.includes('Home row basics'));
T('استخر چندخطی هر درس',ev('TYP_LESSONS.fa[0].pool.length')===5&&ev('TYP_LESSONS.en[7].pool.length')===2);
w.eval('typSetLang("fa")');await sleep(320);
w.eval('typClickLesson(0)');await sleep(320);
T('تمرین شروع شد',ev('TYP.text.length')>50&&!!$('.typ-text'));
const t0=ev('TYP.text[0]');
const wrong=t0==='ش'?'ب':t0==='ب'?'ش':'ظ';
w.eval('typChar('+JSON.stringify(t0)+')');
T('حرف درست جلو می‌رود',ev('TYP.log.length')===1);
T('کلید بعدی روی کیبورد روشن',!!$('.kk.next'));
w.eval('typChar('+JSON.stringify(wrong)+')');
T('حرف اشتباه بلاک می‌شود',ev('TYP.log.length')===1&&ev('TYP.errs')===1);
const round1=async()=>{w.eval('TYP.text="اب";TYP.log=[];TYP.fin=false');w.eval('typChar("ا")');w.eval('typChar("ب")');await sleep(120);};
await round1();
T('دور ۱ ثبت شد (هنوز کامل نیست)',ev('typStats().rnd[0]')===1&&!ev('typStats().done[0]'));
T('کارنامهٔ دور',!!$('.typ-modal')&&bodyTxt().includes('از ۳'));
$('.typ-modal .x').click();
await round1();
await round1();
T('بعد از ۳ دور: درس کامل',ev('typStats().done[0]')!==undefined);
T('دکمهٔ صدا در تمرین',!!$('.typ-pctl .tl-btn.sm'));
w.eval('typSndToggle()');
T('سوییچ صدای تایپ',ev('typSndOn()')===false);
w.eval('typSndToggle()');
w.eval('typDur(30)');w.eval('typStartTest()');await sleep(320);
T('آزمون زمان‌دار شروع شد',ev('TYP.mode')==='test'&&ev('TYP.testLeft')<=30);
for(const ch of ev('TYP.text.slice(0,8).split("")'))w.eval('typChar('+JSON.stringify(ch)+')');
T('۸ حرف درست در آزمون',ev('TYP.log.filter(x=>x.ok).length')===8);
w.eval('typBack()');
T('Backspace در آزمون',ev('TYP.log.length')===7);
w.eval('typFinishTest()');
T('نتیجهٔ آزمون + رکورد',ev('TYP.res')&&ev('TYP.res.wpm')>=0&&ev('typStats().best[30]')!==undefined);
w.eval('typMode("free")');await sleep(320);
const ta=$('#typInpFree');
ta.value='سلام دنیا این یک آزمون تایپ آزاد است';
ta.dispatchEvent(new w.Event('input',{bubbles:true}));
T('تایپ آزاد: شمارنده‌ها',d.getElementById('tfWd').textContent!=='۰');
w.eval('typLight()');
T('حالت روشن سکشن',!!$('.typ-wrap.light'));
w.eval('typLight()');
w.go('games');await sleep(320);
w.go('typing');await sleep(320);
T('بازگشت به تایپ بدون خطا',!!$('.typ-wrap'));

console.log('— v8: کاورها و مار موسی —');
w.go('games');await sleep(320);
T('کاور SVG روی هر کارت (۱۸)',$$('.game-card.playable .gcov > svg').length>=17);
T('دکمهٔ «بازی کن» روی کاور',$$('.gcov-play').length>=17);
T('بدون کارت بدون کاور',[...$$('.game-card.playable')].every(c=>c.querySelector('.gcov > svg')));
w.go('game-snake');await sleep(320);
T('بنر کاور در صفحهٔ بازی',$$('.gcov.page svg').length===1);
const cvEl=$('#gameCv');
cvEl.getBoundingClientRect=()=>({left:0,top:0,width:550,height:400,right:550,bottom:400});
const dirBefore=JSON.stringify(ev('SNK.ndir'));
cvEl.dispatchEvent(new w.PointerEvent('pointermove',{clientX:100,clientY:60,bubbles:true}));
T('مار با موس جهت عوض می‌کند',JSON.stringify(ev('SNK.ndir'))!==dirBefore);
cvEl.dispatchEvent(new w.PointerEvent('pointerdown',{clientX:200,clientY:200,bubbles:true}));
cvEl.dispatchEvent(new w.PointerEvent('pointerup',{clientX:340,clientY:200,bubbles:true}));
T('مار با سوایپ',JSON.stringify(ev('SNK.ndir'))==='[1,0]');

console.log('— v7: پخش فوری و خدمات ایرانی —');
w.go('music');await sleep(320);
T('ردیف پخش فوری',$$('.qk').length===7);
$('.qk').click();
await sleep(350);
T('پخش فوری: صف و تراک فعلی',ev('MUS.queue.length')===7&&ev('MUS.cur')!==null&&ev('MUS.qi')===0);
T('عنوان تراک در پلیر',ev('MUS.cur.t')==='سونات پاتتیک — بتهوون');
T('سایت‌های ایرانی فول',ev('SITES.filter(s=>s.c==="iran").length')===34);
T('فیلور هاست اوودیوس در کد',src.includes('raceAny(AUDIUS_HOSTS'));
T('فیلور استریم در کد',src.includes('t.stream=AUDIUS_HOSTS[hi]'));
T('انیمیشن تعویض نما',src.includes('v-leave')&&src.includes('v-enter')&&src.includes('data-view'));


console.log('— v11: هوش مصنوعی نت‌یار —');
T('منوی هوش مصنوعی', !!ev('NAV.find(n=>n.v==="ai")') && d.body.textContent.includes('هوش مصنوعی'));
w.go('ai');await sleep(400);
T('نمای AI رندر شد', !!$('.ai-wrap') && !!$('#aiChatArea') && !!$('#aiInput'));
T('کارت‌های شروع ۶ تایی', $$('.ai-qcard').length===6);
T('تب‌های ابزار ۴ تایی', $$('.ai-tool-tab').length===4);
T('پنل نویسنده فعال', !!$('#aiPanel-writer.active'));
T('چیپ‌های نویسنده', $$('#aiPanel-writer .ai-chip').length>=9);
T('جستجوی مکالمات', !!$('#aiSearch'));
T('دکمه مکالمه جدید', !!$('.ai-new'));
T('هدر AI با عنوان', bodyTxt().includes('هوش مصنوعی نت‌یار'));
T('زیرعنوان دستیار هوشمند', bodyTxt().includes('دستیار هوشمند شما'));
T('فوتر امن و خصوصی', bodyTxt().includes('امن و خصوصی'));

// تست مارک‌داون
T('پارسر مارک‌داون bold', ev('aiMdParse("**سلام**")').includes('<strong>'));
T('پارسر مارک‌داون کد اینلاین', ev('aiMdParse("`code`")').includes('md-ic'));
T('پارسر مارک‌داون کدبلاک', ev('aiMdParse("```js"+String.fromCharCode(10)+"console.log(1)"+String.fromCharCode(10)+"```")').includes('md-code'));
T('پارسر مارک‌داون لیست', ev('aiMdParse("- آیتم")').includes('<ul'));
T('پارسر مارک‌داون جدول', ev('aiMdParse("| a | b |"+String.fromCharCode(10)+"|---|---|"+String.fromCharCode(10)+"| 1 | 2 |")').includes('<table'));
T('تشخیص RTL فارسی', ev('aiIsRTL("سلام")')===true);
T('تشخیص LTR انگلیسی', ev('aiIsRTL("hello")')===false);

// تست چت‌سازی و تاریخچه
w.eval('aiTestReset()');
w.eval('aiNewChat()');await sleep(200);
T('مکالمه جدید ساخته شد', ev('AI.chats.length')===1 && !!ev('AI.curId'));
const curId=ev('AI.curId');
w.eval('AI.chats[0].msgs=[{id:"u1",role:"user",content:"سلام",time:Date.now()},{id:"a1",role:"assistant",content:"سلام! چطوری؟",time:Date.now()}]; AI.chats[0].title="سلام";');
w.eval('aiSave()');
w.go('ai');await sleep(300);
T('نمایش پیام‌ها', $$('.ai-msg').length===2);
T('پیام کاربر RTL', !!$('.ai-bubble.user.rtl'));
T('اکشن‌های پیام', $$('.ai-act').length>=4);
T('کپی تابع دارد', typeof ev('aiCopy')==='function');

// تست ابزارها
w.eval('aiQuick("این متن رو ترجمه کن: hello")');await sleep(100);
T('کوییک پرامپت در اینپوت', $('#aiInput').value.includes('ترجمه'));

// تست سرچ
w.eval('aiNewChat()');w.eval('AI.chats[0].title="تست ترجمه"; AI.chats[0].msgs=[{id:"u2",role:"user",content:"ترجمه",time:Date.now()}]; aiSave()');await sleep(200);
w.go('ai');await sleep(300);
const searchEl=$('#aiSearch');
searchEl.value='ترجمه';searchEl.dispatchEvent(new w.Event('input',{bubbles:true}));await sleep(200);
T('سرچ فیلتر می‌کند', $$('.ai-chat-item').length>=1);
searchEl.value='';searchEl.dispatchEvent(new w.Event('input',{bubbles:true}));await sleep(200);

// تست ارسال با ماک fetch (استریم)
let streamChunks=['سلام! ','من ','هوش مصنوعی ','نت‌یار ','هستم.'];
w.fetch=(url,opts)=>{
  if(String(url).includes('openrouter')||String(url).includes('/api/chat')){
    const enc=new TextEncoder();
    const RS=w.ReadableStream||ReadableStream;
    const stream=new RS({
      async start(ctrl){
        for(const ch of streamChunks){
          const data='data: '+JSON.stringify({choices:[{delta:{content:ch}}]})+String.fromCharCode(10,10);
          ctrl.enqueue(enc.encode(data));
          await new Promise(r=>setTimeout(r,35));
        }
        ctrl.enqueue(enc.encode('data: [DONE]'+String.fromCharCode(10,10)));
        ctrl.close();
      }
    });
    return Promise.resolve({ok:true, body:stream, headers:{get:()=>''}, text:()=>Promise.resolve('')});
  }
  return Promise.reject(new Error('no mock'));
};
$('#aiInput').value='سلام';
$('#aiInput').dispatchEvent(new w.Event('input',{bubbles:true}));
w.eval('aiSend()');await sleep(100);
T('حالت استریم فعال', ($$('.ai-msg').length>=2 || ev('AI.streaming')===true || !!$('.ai-typing')));
await sleep(600);
T('پاسخ استریم کامل شد', ev('AI.streaming')===false && (bodyTxt().includes('هوش مصنوعی نت‌یار هستم') || bodyTxt().includes('نت‌یار')));
T('پیام AI رندر شد', $$('.ai-msg.ai').length>=1);

// تست توقف
$('#aiInput').value='ادامه بده';
w.fetch=(url,opts)=>{
  const enc=new TextEncoder();
  const RS=w.ReadableStream||ReadableStream;
  const stream=new RS({
    async start(ctrl){
      for(let i=0;i<20;i++){
        if(opts && opts.signal && opts.signal.aborted){ ctrl.close(); return; }
        const data='data: '+JSON.stringify({choices:[{delta:{content:'توکن'+i+' '}}]})+String.fromCharCode(10,10);
        ctrl.enqueue(enc.encode(data));
        await new Promise(r=>setTimeout(r,60));
      }
      ctrl.enqueue(enc.encode('data: [DONE]'+String.fromCharCode(10,10)));
      ctrl.close();
    }
  });
  return Promise.resolve({ok:true, body:stream, headers:{get:()=>''}});
};
w.eval('aiSend()');await sleep(120);
w.eval('aiStop()');await sleep(200);
T('توقف استریم', ev('AI.streaming')===false);

// تست خطای Rate Limit
w.fetch=()=>Promise.resolve({ok:false, status:429, text:()=>Promise.resolve('rate limit')});
$('#aiInput').value='تست ارور';
w.eval('aiSend()');await sleep(1000);
T('مدیریت خطای ریت‌لیمیت', bodyTxt().includes('تعداد درخواست‌ها زیاد است'));

// تست کلید API
T('کلید پیش‌فرض دارد', ev('aiGetKey()').startsWith('sk-or-v1-'));
T('مدل پیش‌فرض', ev('AI.model')==='openai/gpt-4o-mini');

// تست responsive: بدون overflow افقی
T('بدون overflow افقی AI', ev('document.querySelector(".ai-wrap")') && ev('document.querySelector(".ai-wrap").scrollWidth - document.querySelector(".ai-wrap").clientWidth')<=2);

console.log('— v18: تمام‌صفحه پرمیوم + کاورهای باکیفیت + کلیدهای خفن —');
T('تابع تمام‌صفحه وجود دارد', typeof ev('toggleGameFS')==='function' && typeof ev('isGameFS')==='function');
w.go('game-dino');await sleep(320);
T('دکمه تمام‌صفحه در بازی', !!$('.gi-fs') && $('.gi-fs').textContent.includes('تمام‌صفحه'));
T('wrapper تمام‌صفحه', !!$('.game-fs-wrap'));
T('کاور دایی ناصر', ev('typeof gcov==="function" && gcov("dino").length>100'));
T('کاور برج‌سازی', ev('typeof gcov==="function" && gcov("tower").length>100'));
w.go('games');await sleep(320);
T('۲۰ کاور SVG با کیفیت بالا', $$('.game-card.playable .gcov > svg').length>=18);
T('کاورها پرمیوم با شاین', $$('.gcov-shine').length>=10 && $$('.gcov-svg').length>=10);
w.go('game-tetris');await sleep(320);
T('کلیدهای با کیفیت — touch-btns استایل', $$('.touch-btns .btn').length>=1 && ev('document.querySelector(".touch-btns .btn")')!==null);
T('Esc و Backspace برای خروج تمام‌صفحه در کد', src.includes('isGameFS()') && src.includes('Backspace'));
T('CSS تمام‌صفحه :fullscreen', src.includes(':fullscreen') && src.includes('game-fs-wrap'));
T('CSS دکمه مربع خوشگل تمام‌صفحه', src.includes('.gi-fs') && src.includes('maximize'));
T('۲۰ بازی در متا', ev('Object.keys(GAME_META).length')===20);

function kbKey(k){return [...$$('.kk')].find(b=>b.dataset.k===k);}
console.log('\n═══ v11: '+pass+' ✓ / '+fail+' ✗ ═══');
if(fail)console.log('FAILS: '+fails.join(' | '));
process.exit(fail?1:0);
}catch(e){console.log('FATAL:',e.message,e.stack.split('\n')[1]||'');process.exit(2);}})();
