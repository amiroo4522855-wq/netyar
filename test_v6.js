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
const views=['music','sites','games','calc','fav','game-dino','game-tower','game-tetris','game-2048','game-snake','game-ttt','game-memory','game-rps','game-react','game-coin','game-dice','game-puzzle','game-word','game-chess'];
let navOK=0;const navBad=[];
for(const v of views){
  try{w.go(v);await sleep(300);if(bodyTxt().length>100)navOK++;else navBad.push(v);}
  catch(e){navBad.push(v+'('+e.message.slice(0,40)+')');}
}
T('همه ۱۹ نما بدون خطا رندر شدند ('+navOK+'/19)',navOK===views.length);
if(navBad.length)console.log('   nav bad:',navBad.join(' | '));
T('۱۴ بازی در متادیتا',ev('Object.keys(GAME_META).length')===14);

console.log('— بازی‌خانه —');
w.go('games');await sleep(300);
T('بنر دایی ناصر',bodyTxt().includes('دایی ناصر'));
T('بنر برج‌سازی',bodyTxt().includes('برج‌سازی'));
T('۱۲ کارت بازی جدید',$$('.game-card.playable').length===12);
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

console.log('— ۲۰۴۸ —');
w.go('game-2048');await sleep(300);
T('دو خانه اولیه',ev('G48.board.filter(x=>x).length')===2);
ev('G48.board=[2,2,4,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];G48.score=0;g48Render()');
keys('ArrowLeft');
T('ادغام ۲+۲ و امتیاز',ev('G48.board[0]')===4&&ev('G48.score')>=4);

console.log('— مار —');
w.go('game-snake');await sleep(300);
T('مار اولیه',ev('SNK.snake.length')===3);
keys('ArrowUp');
T('جهت جدید',JSON.stringify(ev('SNK.ndir'))==='[0,-1]');
ev('SNK.over=true');
keys('Enter');
T('ری‌استارت',ev('SNK.snake.length')===3&&ev('SNK.score')===0);
T('۴ دکمه لمسی',$$('.touch-btns .btn').length===4);

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
T('نسخه ۷٫۰',bodyTxt().includes('نسخه ۷٫۰'));
w.go('sites');await sleep(320);
T('۵۳۱ سایت',$$('.content article.card').length===531);
w.go('home');await sleep(300);
T('فوتر لینک آنلاین',!!$('a.gh-link'));
const src=fs.readFileSync('netyar.html','utf-8');
T('شب/روز ۱۳ ثانیه',src.includes('D.t%13000'));
T('سختی فزاینده',src.includes('dt*0.00027')&&src.includes('D.dist/7000'));
T('بدون ایموجی',!/(?:[\uD800-\uDBFF][\uDC00-\uDFFF])/.test(src));

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

console.log('\n═══ v7: '+pass+' ✓ / '+fail+' ✗ ═══');
if(fail)console.log('FAILS: '+fails.join(' | '));
process.exit(fail?1:0);
}catch(e){console.log('FATAL:',e.message,e.stack.split('\n')[1]||'');process.exit(2);}})();
