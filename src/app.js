/* ===== کافی‌نت نت‌یار v4 — موتور اپلیکیشن ===== */
'use strict';

/* ---------- دسته‌بندی‌ها ---------- */
const CATS={
  search:{l:'موتور جستجو',i:'search',c:'#4c8ddb'},
  ai:{l:'هوش مصنوعی',i:'sparkles',c:'#8b7bd8'},
  social:{l:'شبکه اجتماعی',i:'message',c:'#c0699b'},
  video:{l:'فیلم و ویدیو',i:'film',c:'#b85c6b'},
  music:{l:'موسیقی و پادکست',i:'music',c:'#4fa98c'},
  mail:{l:'ایمیل و پیام',i:'mail',c:'#5b8dbe'},
  cafe:{l:'کافی‌نت و پرینت',i:'printer',c:'#8b6f4e'},
  learn:{l:'آموزش و یادگیری',i:'graduation',c:'#c9a227'},
  dev:{l:'برنامه‌نویسی',i:'code',c:'#3d9ab8'},
  tools:{l:'ابزار آنلاین',i:'wrench',c:'#7c8da6'},
  design:{l:'طراحی و خلاقیت',i:'palette',c:'#9b6fb8'},
  shop:{l:'خرید و فروشگاه',i:'shopping-bag',c:'#c67b3c'},
  news:{l:'خبر و رسانه',i:'newspaper',c:'#c25b5b'},
  crypto:{l:'بورس و ارز دیجیتال',i:'trending-up',c:'#3fa37c'},
  bank:{l:'بانک‌های ایران',i:'landmark',c:'#4c7fb0'},
  cloud:{l:'ابری و دانلود',i:'cloud',c:'#5e9bc4'},
  travel:{l:'سفر و نقشه',i:'plane',c:'#3e9e93'},
  health:{l:'سلامت و پزشکی',i:'heart-pulse',c:'#c46a8e'},
  job:{l:'کاریابی و مشاغل',i:'briefcase',c:'#6c7bc4'},
  games:{l:'بازی و گیمینگ',i:'gamepad',c:'#7a9e4f'},
  book:{l:'کتاب و دانش',i:'book-open',c:'#b0793f'},
  car:{l:'خودرو و آگهی',i:'car',c:'#a85b4f'},
  iran:{l:'خدمات ایرانی',i:'shield-check',c:'#3f8f6b'},
  life:{l:'زندگی و آشپزی',i:'utensils',c:'#c2607c'},
  sport:{l:'ورزش',i:'trophy',c:'#b99530'},
};

/* ---------- نرمال‌سازی فارسی ---------- */
const ZR=/[\u064B-\u065F\u0670\u0640]/g;
function norm(s){
  if(!s)return '';
  return String(s).toLowerCase()
    .replace(/ي/g,'ی').replace(/ك/g,'ک').replace(ZR,'')
    .replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[\u200c\u200f\u200e]/g,' ')
    .replace(/\s+/g,' ').trim();
}
const FA='۰۱۲۳۴۵۶۷۸۹';
const faNum=n=>String(n).replace(/\d/g,d=>FA[+d]);
function grp(s){
  s=String(s);
  const neg=s.startsWith('-');
  if(neg)s=s.slice(1);
  let parts=s.split('.');
  let i=parts[0],f=parts[1];
  i=i.replace(/\B(?=(\d{3})+(?!\d))/g,'٬');
  return (neg?'−':'')+i+(f!==undefined?'٫'+f:'');
}
const faStr=s=>String(s).replace(/\d/g,d=>FA[+d]).replace(/\./g,'٫');

/* ---------- ذخیره‌سازی ---------- */
const store=(()=>{let mem={};let ok=false;
  try{localStorage.setItem('__t','1');localStorage.removeItem('__t');ok=true;}catch(e){}
  return{
    get(k,d){try{if(ok){const v=localStorage.getItem('netyar_'+k);return v?JSON.parse(v):d;}}catch(e){}return(k in mem)?mem[k]:d;},
    set(k,v){try{if(ok){localStorage.setItem('netyar_'+k,JSON.stringify(v));return;}}catch(e){}mem[k]=v;}
  };})();

/* ---------- وضعیت ---------- */
const SITES=RAW.map((r,i)=>({id:i,n:r[0],u:r[1],c:r[2],d:r[3]}));
const state={view:'home',q:'',cat:null,favs:store.get('favs',[]),mode:store.get('mode','grid')};
const HIST=[];
const $=s=>document.querySelector(s);
const app=$('#app');

/* ---------- ابزار ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function fullUrl(u){return /^https?:\/\//.test(u)?u:'https://'+u;}
function hi(text,q){
  const t=esc(text);
  if(!q)return t;
  const nq=norm(q);if(!nq)return t;
  try{
    const re=new RegExp(nq.split(' ').filter(Boolean).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[\\s\\u200c]*'),'i');
    if(re.test(text))return esc(text).replace(re,m=>'<mark>'+m+'</mark>');
  }catch(e){}
  const nt=norm(text);const idx=nt.indexOf(nq);
  if(idx<0)return t;
  return t.slice(0,idx)+'<mark>'+t.slice(idx,idx+nq.length)+'</mark>'+t.slice(idx+nq.length);
}
function copyText(txt){
  return new Promise(res=>{
    const done=ok=>res(ok);
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(()=>done(true)).catch(()=>fallback());
      }else fallback();
    }catch(e){fallback();}
    function fallback(){
      try{
        const ta=document.createElement('textarea');
        ta.value=txt;ta.style.cssText='position:fixed;opacity:0;left:-999px;top:0';
        document.body.appendChild(ta);ta.focus();ta.select();
        const ok=document.execCommand('copy');
        document.body.removeChild(ta);done(!!ok);
      }catch(e){done(false);}
    }
  });
}
function toast(msg,iconName,url){
  const box=$('#toasts');
  const el=document.createElement('div');
  el.className='toast';
  el.innerHTML='<span class="ti">'+ic(iconName||'check-circle',17)+'</span><span>'+msg+(url?' <span class="turl">'+esc(url)+'</span>':'')+'</span>';
  box.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),320);},2600);
  while(box.children.length>3)box.firstChild.remove();
}

/* ---------- ناوبری و بازگشت ---------- */
function pushHist(){HIST.push(state.view);if(HIST.length>25)HIST.shift();}
function go(v){
  if(v===state.view){render();return;}
  pushHist();
  state.view=v;state.cat=null;
  if(location.hash!=='#'+v)location.hash=v;
  render();
}
function goBack(){
  if(!HIST.length)return;
  const v=HIST.pop();
  state.view=v;state.cat=null;
  if(location.hash!=='#'+v)location.hash=v;
  render();
}
function openCat(k){
  if(state.view!=='sites')go('sites');
  state.cat=k;render();
}
function setCat(k){state.cat=k;render();}
function setQ(q){state.q=q;render();}
function setMode(m){const y=window.scrollY;state.mode=m;store.set('mode',m);render();window.scrollTo(0,y);}
function clearSearch(){state.q='';render();}

/* ---------- ورود آنی: بازکردن سایت + کپی همزمان ---------- */
function enterSite(st){
  copyText(fullUrl(st.u)).then(ok=>{
    if(ok)toast('آدرس <b>'+esc(st.n)+'</b> کپی شد — فقط بچسبان!','copy',st.u);
    else toast('آدرس: <span class="turl">'+esc(fullUrl(st.u))+'</span>','info');
  });
}
function openSite(id,ev){
  const st=SITES[id];
  if(ev&&ev.currentTarget&&ev.currentTarget.classList){
    const c=ev.currentTarget;
    c.classList.remove('pressed');void c.offsetWidth;c.classList.add('pressed');
  }
  const fu=fullUrl(st.u);
  let opened=false;
  try{const wn=window.open(fu,'_blank','noopener');opened=!!wn;}catch(e){opened=false;}
  copyText(fu).then(ok=>{
    if(opened)toast('ورود آنی به <b>'+esc(st.n)+'</b>'+(ok?' — آدرس هم کپی شد ✓':''),'log-in');
    else if(ok)toast('آدرس <b>'+esc(st.n)+'</b> کپی شد — تب مسدود بود، بچسبان!','copy',fu);
    else toast('آدرس: <span class="turl">'+esc(fu)+'</span>','info');
  });
}
function copySite(id,btn,ev){
  if(ev)ev.stopPropagation();
  const st=SITES[id];
  copyText(fullUrl(st.u)).then(ok=>{
    if(ok)toast('آدرس <b>'+esc(st.n)+'</b> کپی شد ✓','copy',st.u);
    else toast('کپی دستی: <span class="turl">'+esc(fullUrl(st.u))+'</span>','info');
  });
  if(btn){
    const old=btn.innerHTML;
    btn.classList.add('ok');btn.innerHTML=ic('check',15);
    setTimeout(()=>{btn.classList.remove('ok');btn.innerHTML=old;},1300);
  }
}
function toggleFav(id,btn,ev){
  if(ev)ev.stopPropagation();
  const i=state.favs.indexOf(id);
  if(i<0){state.favs.push(id);toast('به علاقه‌مندی‌ها اضافه شد','star');}
  else{state.favs.splice(i,1);toast('از علاقه‌مندی‌ها حذف شد','heart');}
  store.set('favs',state.favs);
  if(btn){
    btn.classList.toggle('on',i<0);
    btn.innerHTML=ic('star',15);
    btn.classList.remove('pop');void btn.offsetWidth;btn.classList.add('pop');
  }
  if(state.view==='fav')render();else updateFavCount();
}
function updateFavCount(){
  const c=document.querySelector('.nav-item[data-v="fav"] .cnt');
  if(c){c.textContent=faNum(state.favs.length);c.style.display=state.favs.length?'':'none';}
}

/* ---------- کارت سایت ---------- */
function siteCard(st,q,i){
  const cat=CATS[st.c]||CATS.tools;
  const col=cat.c;
  const isFav=state.favs.includes(st.id);
  return '<article class="card" onclick="openSite('+st.id+',event)" title="کلیک = ورود آنی + کپی آدرس">'
    +'<div class="av" style="--cc:'+col+';--csh:'+col+'66">'+ic(cat.i,20)+'</div>'
    +'<div class="meta">'
      +'<div class="nm">'+hi(st.n,q)+(isFav?'<span class="on-star">'+ic('star',12,'fill')+'</span>':'')+'</div>'
      +'<div class="url">'+esc(st.u)+'</div>'
    +'</div>'
    +'<div class="desc">'+hi(st.d,q)+'</div>'
    +'<div class="foot">'
      +'<span class="badge" style="--cc:'+col+'">'+ic(cat.i,11)+cat.l+'</span>'
      +'<span class="acts">'
        +'<span class="icon-btn star'+(isFav?' on':'')+'" onclick="toggleFav('+st.id+',this,event)" title="علاقه‌مندی">'+ic('star',15)+'</span>'
        +'<span class="icon-btn" onclick="copySite('+st.id+',this,event)" title="فقط کپی آدرس">'+ic('copy',14)+'</span>'
        +'<span class="icon-btn enter" onclick="event.stopPropagation();openSite('+st.id+',event)" title="ورود آنی به سایت">'+ic('log-in',14)+'</span>'
      +'</span>'
    +'</div>'
  +'</article>';
}

/* ---------- فیلتر ---------- */
function filterSites(q,cat){
  const nq=norm(q);
  return SITES.filter(s=>{
    if(cat&&s.c!==cat)return false;
    if(!nq)return true;
    return norm(s.n).includes(nq)||norm(s.d).includes(nq)||norm(s.u).includes(nq)||norm(CATS[s.c].l).includes(nq);
  });
}

/* ---------- قالب‌های مشترک ---------- */
const NAV=[
  {v:'home',i:'home',t:'خانه'},
  {v:'sites',i:'globe',t:'همه سایت‌ها'},
  {v:'fav',i:'star',t:'علاقه‌مندی‌ها'},
  {sec:'سرگرمیِ کافی‌نت'},
  {v:'games',i:'gamepad',t:'بازی‌ها'},
  {v:'music',i:'music',t:'موزیک'},
  {v:'calc',i:'calculator',t:'ماشین‌حساب'},
];
const VIEWS=['home','sites','fav','games','music','calc'];

function sideHtml(){
  const catKeys=Object.keys(CATS);
  return '<aside class="sidebar">'
    +'<div class="logo" onclick="go(\'home\')">'
      +'<div class="logo-mark">'+ic('coffee',24)+'</div>'
      +'<div class="logo-txt"><div class="t1">کافی‌نتِ <b>نت‌یار</b></div><div class="t2">کافه اینترنتِ دیجیتال تو</div></div>'
    +'</div>'
    +'<nav class="nav no-sb">'
      +NAV.map(item=>item.sec
        ?'<div class="nav-sec">'+item.sec+'</div>'
        :'<div class="nav-item'+(state.view===item.v?' active':'')+'" data-v="'+item.v+'" onclick="go(\''+item.v+'\')"><span class="nico">'+ic(item.i,17)+'</span><span>'+item.t+'</span>'+(item.v==='sites'?'<span class="cnt">'+faNum(SITES.length)+'</span>':'')+(item.v==='fav'?'<span class="cnt" style="display:'+(state.favs.length?'':'none')+'">'+faNum(state.favs.length)+'</span>':'')+'</div>'
      ).join('')
      +'<div class="nav-sec">دسته‌بندی‌ها</div>'
      +'<div class="nav-cats">'
        +catKeys.map(k=>'<div class="nav-cat" onclick="openCat(\''+k+'\')" title="'+CATS[k].l+'"><span class="nci" style="color:'+CATS[k].c+'">'+ic(CATS[k].i,16)+'</span><span>'+CATS[k].l+'</span><span class="nc">'+faNum(SITES.filter(s=>s.c===k).length)+' سایت</span></div>').join('')
      +'</div>'
    +'</nav>'
    +'<div class="side-foot"><span class="v">'+ic('shield-check',12)+'نسخه ۴٫۰ — '+faNum(SITES.length)+' سایت</span>'
      +'<a class="gh-ic" href="'+ghUrl()+'" target="_blank" rel="noopener" title="پروژه در گیت‌هاب">'+ic('github',16)+'</a></div>'
  +'</aside>';
}
function topHtml(){
  const titles={home:'خانه',sites:'همه سایت‌ها',fav:'علاقه‌مندی‌ها',games:'بازی‌ها',music:'موزیک',calc:'ماشین‌حساب'};
  let dt='',tm='';
  try{
    const now=new Date();
    dt=new Intl.DateTimeFormat('fa-IR',{weekday:'long',day:'numeric',month:'long'}).format(now);
    tm=new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit'}).format(now);
  }catch(e){}
  return '<header class="topbar">'
    +'<button class="back-btn'+(HIST.length?'':' hide')+'" onclick="goBack()" title="بازگشت به صفحهٔ قبل">'+ic('arrow-left',17)+'</button>'
    +'<div class="top-logo" onclick="go(\'home\')"><span class="logo-mark">'+ic('coffee',18)+'</span>کافی‌نتِ <b>نت‌یار</b></div>'
    +'<div class="pg-ttl">'+(titles[state.view]||'')+'<span class="bdg">'+ic('shield-check',10)+'نت‌یار</span></div>'
    +'<div class="sp"></div>'
    +'<div class="status-pill"><span class="dot"></span><span class="st-lbl">سرویس آنلاین</span></div>'
    +'<div class="clock">'+ic('clock',15)+'<div><div class="tm">'+tm+'</div><div class="dt">'+dt+'</div></div></div>'
  +'</header>';
}
function searchBox(id){
  return '<div class="searchbox" id="'+id+'">'
    +'<input type="text" id="inp-'+id+'" placeholder="جستجو بین '+faNum(SITES.length)+' سایت… (نام، توضیح یا آدرس)" value="'+esc(state.q)+'" autocomplete="off">'
    +'<span class="clear" onclick="clearSearch()" title="پاک کردن">'+ic('x',13)+'</span>'
    +'<span class="si">'+ic('search',19)+'</span>'
    +'<span class="kbd"><kbd>/</kbd></span>'
  +'</div>';
}
function secHead(icon,iconCls,title,mini){
  return '<div class="sec-head reveal"><span class="sq '+iconCls+'">'+ic(icon,16)+'</span><h2>'+title+'</h2><span class="mini">'+mini+'</span><span class="ln"></span></div>';
}
/* ---------- لینک پروژه در گیت‌هاب ---------- */
const GH={user:'USERNAME',repo:'netyar'};
function ghUrl(){return 'https://github.com/'+GH.user+'/'+GH.repo;}
function ghPage(){return 'https://'+GH.user+'.github.io/'+GH.repo+'/';}
function footHtml(){
  return '<footer class="foot"><div class="f1">'+ic('coffee',14)+'کافی‌نت <b>نت‌یار</b> — '+faNum(SITES.length)+' سایت کاربردی در '+faNum(Object.keys(CATS).length)+' دسته، همه‌جا یک‌جا</div>'
  +'<div class="f2"><span>'+ic('zap',12)+'ورود آنی</span><span>'+ic('shield',12)+'بدون تبلیغ</span><span>'+ic('check-circle',12)+'۱۰۰٪ رایگان</span>'
  +'<a class="gh-link" href="'+ghUrl()+'" target="_blank" rel="noopener" title="پروژه در گیت‌هاب — ستاره بدی!">'+ic('github',14)+'گیت‌هاب</a>'
  +'<a class="gh-link gold" href="'+ghPage()+'" target="_blank" rel="noopener" title="نسخهٔ آنلاین">'+ic('external',13)+'لینک نسخهٔ آنلاین</a></div></footer>';
}

/* ---------- خانه ---------- */
const FEATURED=['گوگل','یوتیوب','چت‌جی‌پی‌تی','دیجی‌کالا','اینستاگرام','آپارات','اسپاتیفای','ویکی‌پدیای فارسی'];
function heroVisual(){
  const chips=[
    {i:'search',c:'#4c8ddb',x:'8%',y:'12%'},{i:'sparkles',c:'#8b7bd8',x:'70%',y:'4%'},
    {i:'music',c:'#4fa98c',x:'84%',y:'62%'},{i:'printer',c:'#8b6f4e',x:'4%',y:'66%'},
    {i:'newspaper',c:'#c25b5b',x:'42%',y:'-2%'},{i:'code',c:'#3d9ab8',x:'-4%',y:'36%'},
  ];
  return '<div class="hero-visual">'
    +'<div class="hv-grid"></div>'
    +'<div class="orbit-wrap">'
      +'<div class="orbit-ring"></div>'
      +'<div class="orbit">'+chips.map(c=>'<span class="ochip" style="left:'+c.x+';top:'+c.y+';color:'+c.c+'">'+ic(c.i,19)+'</span>').join('')+'</div>'
      +'<svg class="hv-cup" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'
        +'<path class="steam" d="M9 2.5v2"/><path class="steam" d="M12.5 2v2.5"/><path class="steam" d="M16 2.5v2"/>'
        +'<path d="M16.5 8.5a1 1 0 0 1 1 1v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7a1 1 0 0 1 1-1h14a3.5 3.5 0 1 1 0 7h-1"/>'
      +'</svg>'
    +'</div>'
    +'<div class="hv-badge">'+ic('wifi',13)+'وای‌فای کافی‌نت متصل است</div>'
  +'</div>';
}
function vHome(){
  const cats=Object.keys(CATS).map(k=>({k,...CATS[k],n:SITES.filter(s=>s.c===k).length}));
  const feat=SITES.filter(s=>FEATURED.includes(s.n)).slice(0,8);
  return '<section class="hero">'
    +'<div>'
      +'<span class="kicker"><span class="dot"></span> کافه اینترنتِ دیجیتال — نسخه ۴٫۰</span>'
      +'<h1>هر سایتی که لازم داری،<br>یک‌جا سروِ <span class="g">کافی‌نتِ نت‌یار</span></h1>'
      +'<p class="sub">'+faNum(SITES.length)+' سایت واقعی دنیا و ایران با توضیح و دسته‌بندی کامل — کلیک کنی <b>همان لحظه وارد سایت می‌شوی</b> و آدرسش هم کپی می‌شود! پلیر موزیک زنده و ماشین‌حساب واقعی هم سرِ کارشان.</p>'
      +searchBox('home-sb')
      +'<div class="hero-acts" style="margin-top:18px">'
        +'<button class="btn primary" onclick="go(\'sites\')">'+ic('globe',16)+'گشت‌وگذار در سایت‌ها</button>'
        +'<button class="btn gold" onclick="randomSite()">'+ic('dice',16)+'یه سایت تصادفی بده!</button>'
        +'<button class="btn ghost" onclick="go(\'music\')">'+ic('music',15)+'پلیر موزیک زنده</button>'
      +'</div>'
      +'<div class="stats">'
        +'<div class="stat"><span class="sic">'+ic('globe',17)+'</span><div><div class="n"><span class="count" data-n="'+SITES.length+'">۰</span><em>+</em></div><div class="l">سایت کاربردی</div></div></div>'
        +'<div class="stat gold"><span class="sic">'+ic('layers',17)+'</span><div><div class="n"><span class="count" data-n="'+Object.keys(CATS).length+'">۰</span></div><div class="l">دسته‌بندی رسمی</div></div></div>'
        +'<div class="stat green"><span class="sic">'+ic('activity',17)+'</span><div><div class="n">زنده</div><div class="l">جستجوی موزیک واقعی</div></div></div>'
        +'<div class="stat"><span class="sic">'+ic('shield',17)+'</span><div><div class="n">۱۰۰٪</div><div class="l">رایگان و بدون تبلیغ</div></div></div>'
      +'</div>'
    +'</div>'
    +heroVisual()
  +'</section>'
  +secHead('trending-up','blue','پرطرفدارها','پرکلیک‌ترین سایت‌های کافی‌نت')
  +'<div class="strip-wrap"><div class="strip">'+feat.map((s,i)=>siteCard(s,'',i)).join('')+'</div></div>'
  +secHead('layers','','دسته‌بندی‌های کافی‌نت','هر ابزاری برای هر کاری')
  +'<div class="cat-grid">'+cats.map((c,i)=>
      '<div class="cat-card reveal" style="--cc:'+c.c+';transition-delay:'+Math.min(i*18,300)+'ms" onclick="openCat(\''+c.k+'\')">'
      +'<span class="em">'+ic(c.i,19)+'</span><div><div class="nm">'+c.l+'</div><div class="ct">'+faNum(c.n)+' سایت</div></div>'
      +'<span class="go">'+ic('arrow-left',15)+'</span></div>').join('')
  +'</div>'
  +secHead('shield-check','blue','چرا کافی‌نت نت‌یار؟','سه دلیلِ ساده')
  +'<div class="perks">'
    +'<div class="perk reveal"><span class="pic">'+ic('log-in',18)+'</span><div><h3>ورود آنی + کپی</h3><p>یک کلیک کن: سایت در تب جدید باز می‌شود و آدرسش هم کلیپ‌بوردت است.</p></div></div>'
    +'<div class="perk reveal" style="transition-delay:.08s"><span class="pic">'+ic('search',18)+'</span><div><h3>جستجوی زنده و دقیق</h3><p>همان لحظه که تایپ می‌کنی، نتیجه می‌آید؛ حتی با حروف فارسیِ نیم‌فاصله‌دار.</p></div></div>'
    +'<div class="perk reveal" style="transition-delay:.16s"><span class="pic">'+ic('shield',18)+'</span><div><h3>تمیز و بدون تبلیغ</h3><p>نه بنر مزاحم، نه پاپ‌آپ؛ فقط یک میز مرتب با بهترین سایت‌های دنیا.</p></div></div>'
  +'</div>'
  +footHtml();
}

/* ---------- همه سایت‌ها ---------- */
function vSites(){
  const res=filterSites(state.q,state.cat);
  const cats=Object.keys(CATS).map(k=>({k,...CATS[k],n:SITES.filter(s=>s.c===k).length}));
  return '<div class="toolbar">'
    +searchBox('sites-sb')
    +'<div class="res-info"><b>'+faNum(res.length)+'</b> نتیجه'+(state.cat?' در «'+CATS[state.cat].l+'»':'')+(state.q?' برای «'+esc(state.q)+'»':'')+'</div>'
    +'<div class="mode-btns">'
      +'<button class="mode-btn'+(state.mode==='grid'?' active':'')+'" onclick="setMode(\'grid\')" title="نمایش کارت">'+ic('grid',15)+'</button>'
      +'<button class="mode-btn'+(state.mode==='list'?' active':'')+'" onclick="setMode(\'list\')" title="نمایش لیست">'+ic('list',15)+'</button>'
    +'</div>'
  +'</div>'
  +'<div class="chips">'
    +'<span class="chip'+(!state.cat?' active':'')+'" onclick="setCat(null)">'+ic('layers',13)+'همه <span class="cc">'+faNum(SITES.length)+'</span></span>'
    +cats.map(c=>'<span class="chip'+(state.cat===c.k?' active':'')+'" onclick="setCat(\''+c.k+'\')">'+ic(c.i,13)+c.l+' <span class="cc">'+faNum(c.n)+'</span></span>').join('')
  +'</div>'
  +(res.length
    ?'<div class="grid '+(state.mode==='list'?'list':'')+'" id="sites-grid" style="margin-top:16px">'+res.map((s,i)=>siteCard(s,state.q,i)).join('')+'</div>'
    :'<div class="empty"><span class="e-ic">'+ic('search',34)+'</span><h3>چیزی پیدا نشد!</h3><p>برای «'+esc(state.q)+'» نتیجه‌ای نداشتیم. یک کلمه دیگر امتحان کن یا از این پیشنهادها استفاده کن:</p>'
      +'<div class="sugg">'+['یوتیوب','هوش مصنوعی','پرینت','ترجمه','بورس','آشپزی','اخبار'].map(w=>'<span class="chip" onclick="setQ(\''+w+'\')">'+w+'</span>').join('')+'</div></div>')
  +footHtml();
}

/* ---------- علاقه‌مندی‌ها ---------- */
function vFav(){
  const res=SITES.filter(s=>state.favs.includes(s.id));
  return secHead('star','','علاقه‌مندی‌های من',faNum(res.length)+' سایت ذخیره‌شده — روی این دستگاه')
  +(res.length
    ?'<div class="grid '+(state.mode==='list'?'list':'')+'">'+res.map((s,i)=>siteCard(s,'',i)).join('')+'</div>'
    :'<div class="empty"><span class="e-ic">'+ic('star',34)+'</span><h3>هنوز چیزی ستاره نزدی!</h3><p>روی ستارهٔ هر سایت بزن تا اینجا ذخیره شود و همیشه دم دستت باشد. لیست تو فقط روی دستگاه خودت ذخیره می‌شود.</p>'
    +'<button class="btn primary" onclick="go(\'sites\')">'+ic('globe',15)+'برو سایت‌ها را ببین</button></div>')
  +footHtml();
}

/* ---------- بازی‌ها (به‌زودی) ---------- */
const GAMES=[
  {t:'شطرنج',i:'crown',c:'#d9ae3e',d:'مقابل ربات یا دوستت بازی کن'},
  {t:'تتریس',i:'layout-grid',c:'#5b8dbe',d:'کلاسیکِ همیشه‌سبز بلوک‌چینی'},
  {t:'۲۰۴۸',i:'hash',c:'#4fa98c',d:'عددها را به هم برسان'},
  {t:'مار',i:'move',c:'#7a9e4f',d:'مار را بزرگ کن، نخور به خودت!'},
  {t:'حافظه',i:'brain',c:'#9b6fb8',d:'جفت کارت‌های همسان را پیدا کن'},
  {t:'دوز',i:'grid3x3',c:'#c67b3c',d:'سه‌تایی ردیف کن، برنده شو'},
  {t:'سنگ کاغذ قیچی',i:'scissors',c:'#c25b5b',d:'حریف بزرگِ بچگی‌ها'},
  {t:'پازل',i:'puzzle',c:'#3e9e93',d:'تکه‌ها را سر جای خودشان بگذار'},
  {t:'واژه‌یاب',i:'type',c:'#8b7bd8',d:'کلمه‌های قایم‌شده را شکار کن'},
  {t:'پرتاب سکه',i:'coins',c:'#c9a227',d:'شانست را محک بزن'},
  {t:'تست ری‌اکشن',i:'zap',c:'#4c8ddb',d:'ببین چقدر سریعی'},
  {t:'تاس شانس',i:'dice5',c:'#c46a8e',d:'بدون تاس، شروع نکن!'},
];
function vGames(){
  return '<section class="soon-hero"><span class="soon-badge"><span class="d"></span> به‌زودی فعال می‌شود</span>'
    +'<h2>بازی‌خانهٔ کافی‌نت</h2>'
    +'<p>اینجا قرار است آرکیدِ کافی‌نت ساخته شود — '+faNum(GAMES.length)+' بازی خفن که مستقیم در همین صفحه بازی می‌کنی، بدون نصب و بدون دردسر. فعلاً منو را ببین و ذوق کن!</p>'
    +'<span class="big">'+ic('gamepad',86)+'</span></section>'
  +'<div class="game-grid">'+GAMES.map((g,i)=>
    '<div class="game-card reveal" style="--gc:'+g.c+';transition-delay:'+Math.min(i*35,450)+'ms" onclick="soon(\'بازی‌خانه\')">'
    +'<span class="ribbon">به‌زودی</span><span class="ge">'+ic(g.i,26)+'</span>'
    +'<div class="gt">'+g.t+'</div><div class="gd">'+g.d+'</div></div>').join('')
  +'</div>'+footHtml();
}
function soon(name){toast('بخش «'+name+'» به‌زودی فعال می‌شود','lightbulb');}

/* ================================================================
   موزیک — پلیر واقعی (Audius + Internet Archive)
   ================================================================ */
const MUS={
  audio:null,ctx:null,an:null,fdata:null,raf:0,
  queue:[],qi:-1,playing:false,dur:0,seekDrag:false,cur:null,
  prov:store.get('mprov','audius'),host:'',q:'',results:null,loading:false,err:'',autoPlay:false,
  corsCache:{},graph:false,hue:40,bars:null,vol:store.get('vol',.8),
  retried:null,bass:0,repeat:store.get('rep','off'),shuffle:false,
};
let graphAttached=false;
function wireAudio(a){
  a.addEventListener('play',()=>{MUS.playing=true;musOnState();});
  a.addEventListener('pause',()=>{MUS.playing=false;musOnState();});
  a.addEventListener('ended',()=>{musNext(true);});
  a.addEventListener('loadedmetadata',()=>{MUS.dur=a.duration||0;musUpdSeek();});
  a.addEventListener('timeupdate',()=>{if(!MUS.seekDrag)musUpdSeek();});
  a.addEventListener('error',()=>{
    const t=MUS.queue[MUS.qi];
    if(!t)return;
    if(a.crossOrigin==='anonymous'&&MUS.retried!==t.id){
      MUS.retried=t.id;
      try{MUS.corsCache[new URL(t.stream,location.href).origin]=false;}catch(e){}
      MUS.graph=false;
      musLoad(t);
      return;
    }
    if(MUS.retried!==t.id)MUS.retried=t.id;
    toast('پخش این آهنگ ممکن نشد — بعدی!','alert');
    musNext(true);
  });
}
function musAudio(){
  if(MUS.audio)return MUS.audio;
  const a=new Audio();
  a.preload='auto';a.volume=MUS.vol;
  wireAudio(a);
  MUS.audio=a;
  return a;
}
function musSetupGraph(a){
  if(graphAttached)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){MUS.graph=false;return;}
    MUS.ctx=MUS.ctx||new AC();
    const src=MUS.ctx.createMediaElementSource(a);
    MUS.an=MUS.ctx.createAnalyser();
    MUS.an.fftSize=256;
    MUS.an.smoothingTimeConstant=.78;
    MUS.fdata=new Uint8Array(MUS.an.frequencyBinCount);
    src.connect(MUS.an);
    MUS.an.connect(MUS.ctx.destination);
    graphAttached=true;
  }catch(e){MUS.an=null;MUS.graph=false;}
}
function musOnState(){
  const bp=$('#mPlay');if(bp)bp.innerHTML=ic(MUS.playing?'pause':'play',21);
  const mb=$('#miniPlayBtn');if(mb)mb.innerHTML=ic(MUS.playing?'pause':'play',15);
  const mp=$('#mPlayer');if(mp)mp.classList.toggle('playing',MUS.playing);
  try{if('mediaSession' in navigator)navigator.mediaSession.playbackState=MUS.playing?'playing':'paused';}catch(e){}
  document.title=(MUS.playing?'▶ ':'')+(MUS.cur?MUS.cur.t+' — ':'')+'کافی‌نت نت‌یار';
  if(MUS.playing&&state.view==='music')musStartViz();else if(!MUS.playing)musStopViz();
}
function fmtT(s){
  if(!isFinite(s)||s<0)s=0;
  const m=Math.floor(s/60),ss=Math.floor(s%60);
  return faNum(m)+':'+faNum(ss<10?'0'+ss:ss);
}
function fmtPlays(n){
  n=+n||0;
  if(n>=1e6)return faNum(grp((n/1e6).toFixed(1)))+' میلیون';
  if(n>=1e3)return faNum(grp(Math.round(n/1e3)))+' هزار';
  return faNum(grp(n));
}
/* --- هاست‌های discovery (استریم را سرو می‌کنند) --- */
const AUDIUS_HOSTS=[
  'https://discoveryprovider.audius.co',
  'https://discoveryprovider2.audius.co',
  'https://discoveryprovider3.audius.co',
];
function audiusHost(){
  return new Promise(res=>{
    if(MUS.host)return res(MUS.host);
    MUS.host=AUDIUS_HOSTS[0];
    res(MUS.host);
  });
}
function corsOK(url){
  let origin;try{origin=new URL(url,location.href).origin;}catch(e){return Promise.resolve(false);}
  if(origin===location.origin)return Promise.resolve(true);
  if(MUS.corsCache[origin]!==undefined)return Promise.resolve(MUS.corsCache[origin]);
  if(typeof fetch==='undefined')return Promise.resolve(false);
  return fetch(url,{method:'GET',headers:{Range:'bytes=0-1'}})
    .then(r=>{const ok=r.ok||r.status===206;MUS.corsCache[origin]=ok;return ok;})
    .catch(()=>{MUS.corsCache[origin]=false;return false;});
}
/* --- جستجو --- */
function musSearch(q,autoPlay){
  q=(q||'').trim();
  if(!q)return;
  MUS.q=q;MUS.loading=true;MUS.err='';MUS.autoPlay=!!autoPlay;MUS.results=null;
  renderMusResults();
  const call=MUS.prov==='audius'?audiusSearch(q):archSearch(q);
  call.then(list=>{
    MUS.loading=false;
    if(!list.length){MUS.err='نتیجه‌ای برای «'+q+'» پیدا نشد — عبارت دیگری امتحان کن.';}
    MUS.results=list;
    renderMusResults();
    if(MUS.autoPlay&&list.length){MUS.autoPlay=false;musPlayAt(0);}
  }).catch(()=>{
    MUS.loading=false;
    MUS.err='اتصال به سرویس برقرار نشد — اینترنت را چک کن و دوباره تلاش کن.';
    MUS.results=null;
    renderMusResults();
  });
}
function audiusSearch(q){
  return audiusHost().then(h=>{
    if(typeof fetch==='undefined')throw new Error('no fetch');
    return fetch(h+'/v1/tracks/search?query='+encodeURIComponent(q)+'&app_name=NETYAR',{headers:{'Accept':'application/json'}})
      .then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json();});
  }).then(j=>{
    const arr=(j&&j.data)||[];
    return arr.filter(t=>t&&(t.is_streamable===true||t.is_streamable===undefined)).map(t=>({
      p:'audius',id:t.id,t:t.title||'بدون نام',
      a:(t.user&&(t.user.name||t.user.handle))||'ناشناس',
      art:(t.artwork&&(t.artwork['480x480']||t.artwork['150x150']))||'',
      d:t.duration||0,g:t.genre||'',pc:t.play_count||0,
      stream:MUS.host+'/v1/tracks/'+t.id+'/stream?app_name=NETYAR'
    }));
  });
}
function archSearch(q){
  if(typeof fetch==='undefined')throw new Error('no fetch');
  const u='https://archive.org/advancedsearch.php?q='+encodeURIComponent(q+' AND mediatype:audio')
    +'&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&rows=24&page=1&output=json';
  return fetch(u,{headers:{'Accept':'application/json'}}).then(r=>r.json()).then(j=>{
    const docs=(j&&j.response&&j.response.docs)||[];
    return docs.map(d=>({
      p:'arch',id:d.identifier,t:(typeof d.title==='string'?d.title:d.identifier)||'بدون نام',
      a:Array.isArray(d.creator)?d.creator.join('، '):(d.creator||'ناشناس'),
      art:'https://archive.org/services/img/'+encodeURIComponent(d.identifier),
      d:0,g:'آرشیو',pc:0,stream:null
    }));
  });
}
function archResolve(t){
  if(t.stream)return Promise.resolve(t);
  if(typeof fetch==='undefined')return Promise.reject(new Error('no fetch'));
  return fetch('https://archive.org/metadata/'+encodeURIComponent(t.id)).then(r=>r.json()).then(m=>{
    const files=(m&&m.files)||[];
    const aud=files.filter(f=>/\.(mp3|m4a|ogg|flac)$/i.test(f.name||''));
    if(!aud.length)throw new Error('nofile');
    aud.sort((x,y)=>{const sx=/mp3/i.test(x.name)?0:1,sy=/mp3/i.test(y.name)?0:1;return sx-sy;});
    const f=aud[0];
    t.stream='https://archive.org/download/'+encodeURIComponent(t.id)+'/'+encodeURIComponent(f.name);
    let L=f.length;
    if(L){if(String(L).includes(':')){const pp=String(L).split(':');L=+pp[pp.length-1]+(pp.length>1?+pp[pp.length-2]*60:0)+(pp.length>2?+pp[0]*3600:0);}t.d=Math.round(+L)||0;}
    return t;
  });
}
/* --- پخش --- */
function musPlayAt(i){
  if(!MUS.queue.length)return;
  MUS.qi=(i+MUS.queue.length)%MUS.queue.length;
  MUS.retried=null;
  const t=MUS.queue[MUS.qi];
  const prep=t.p==='arch'?archResolve(t):Promise.resolve(t);
  prep.then(tt=>musLoad(tt)).catch(()=>{toast('فایل این آهنگ در دسترس نیست','alert');});
  renderPlayer();
  renderMusResults();
}
function musLoad(t){
  let a=musAudio();
  const url=t.stream;
  a.pause();
  MUS.cur=t;
  musPaintNow(t);
  corsOK(url).then(ok=>{
    if(ok){
      if(graphAttached&&MUS.audio!==a)MUS.audio=a;
      a.crossOrigin='anonymous';
      musSetupGraph(a);
      MUS.graph=!!MUS.an;
    }else{
      MUS.graph=false;
      if(graphAttached){
        a=new Audio();
        a.preload='auto';a.volume=MUS.vol;
        wireAudio(a);
        MUS.audio=a;
      }
      a.crossOrigin=null;
    }
    a.src=url;
    try{if(MUS.ctx&&MUS.ctx.state==='suspended')MUS.ctx.resume();}catch(e){}
    musMediaSession(t);
    const p=a.play();
    if(p&&p.catch)p.catch(()=>{});
  });
}
function musMediaSession(t){
  if(!('mediaSession' in navigator))return;
  try{
    navigator.mediaSession.metadata=new MediaMetadata({
      title:t.t,artist:t.a,album:'کافی‌نت نت‌یار',
      artwork:t.art?[{src:t.art,sizes:'480x480',type:'image/jpeg'}]:[]
    });
    navigator.mediaSession.setActionHandler('play',()=>{try{musAudio().play();}catch(e){}});
    navigator.mediaSession.setActionHandler('pause',()=>{try{musAudio().pause();}catch(e){}});
    navigator.mediaSession.setActionHandler('previoustrack',()=>musPrev());
    navigator.mediaSession.setActionHandler('nexttrack',()=>musNext(false));
  }catch(e){}
}
function musPaintNow(t){
  const el=$('#mArt'),ti=$('#mTitle'),ar=$('#mArtist');
  if(ti)ti.textContent=t.t;
  if(ar)ar.textContent=t.a+(t.g?' — '+t.g:'');
  if(el){
    el.classList.toggle('noimg',!t.art);
    el.innerHTML=(t.art?'<img src="'+esc(t.art)+'" alt="" onerror="this.parentNode.classList.add(\'noimg\')">':'')
      +'<span class="fallback">'+ic('music',30)+'</span><span class="vinyl-shine"></span>';
  }
  document.title=(MUS.playing?'▶ ':'')+t.t+' — کافی‌نت نت‌یار';
}
function musToggle(){const a=musAudio();if(!a.src)return;a.paused?a.play():a.pause();}
function musNext(auto){
  if(!MUS.queue.length)return;
  if(auto&&MUS.repeat==='one'){musPlayAt(MUS.qi);return;}
  let ni;
  if(MUS.shuffle&&MUS.queue.length>1){
    do{ni=Math.floor(Math.random()*MUS.queue.length);}while(ni===MUS.qi);
  }else ni=MUS.qi+1;
  if(ni>=MUS.queue.length){
    if(MUS.repeat==='all'||!auto)ni=0;
    else{const a=MUS.audio;if(a)a.pause();return;}
  }
  musPlayAt(ni);
}
function musToggleShuffle(){
  MUS.shuffle=!MUS.shuffle;
  renderPlayer();
  toast(MUS.shuffle?'پخش تصادفی روشن شد':'پخش تصادفی خاموش شد','shuffle');
}
function musCycleRepeat(){
  MUS.repeat=MUS.repeat==='off'?'all':MUS.repeat==='all'?'one':'off';
  store.set('rep',MUS.repeat);
  renderPlayer();
  toast(MUS.repeat==='off'?'تکرار خاموش شد':MUS.repeat==='all'?'تکرار کل صف':'تکرار همین آهنگ','repeat');
}
function musPrev(){
  const a=MUS.audio;
  if(a&&a.currentTime>4){a.currentTime=0;return;}
  if(MUS.queue.length)musPlayAt(MUS.qi-1);
}
function musSeekTo(v){
  const a=musAudio();
  if(a&&a.duration&&isFinite(a.duration))a.currentTime=(v/1000)*a.duration;
}
function musSetVol(v){
  MUS.vol=Math.max(0,Math.min(1,v));
  store.set('vol',MUS.vol);
  const a=musAudio();a.volume=MUS.vol;
  const lbl=$('#volLbl');if(lbl)lbl.textContent=faNum(Math.round(MUS.vol*100))+'٪';
  const vr=$('#mVol');if(vr){vr.value=MUS.vol*100;vr.style.setProperty('--p',(MUS.vol*100)+'%');}
  const vi=$('#volIc');if(vi)vi.innerHTML=ic(MUS.vol===0?'volume-x':'volume',16);
}
function musMute(){musSetVol(MUS.vol===0?.8:0);}
function musUpdSeek(){
  const a=MUS.audio;if(!a)return;
  const sk=$('#mSeek');
  const ct=a.currentTime||0,dur=a.duration||MUS.dur||0;
  if(sk&&!MUS.seekDrag&&dur){
    sk.value=(ct/dur)*1000;
    sk.style.setProperty('--p',((ct/dur)*100)+'%');
  }
  const t1=$('#mCur');if(t1)t1.textContent=fmtT(ct);
  const t2=$('#mDur');if(t2&&dur)t2.textContent=fmtT(dur);
  const mpb=$('#mpProg');
  if(mpb)mpb.style.width=dur?((ct/dur)*100).toFixed(1)+'%':'0%';
}
/* --- ویژوالایزر و رقص نور --- */
function musStartViz(){
  if(MUS.raf)return;
  if(MUS.graph&&MUS.an&&MUS.ctx){
    try{if(MUS.ctx.state==='suspended')MUS.ctx.resume();}catch(e){}
  }
  (function loop(){
    const cv=document.getElementById('eqCanvas');
    const dance=document.getElementById('musicDance');
    if(!cv&&!dance){MUS.raf=0;return;}
    let bass=0;
    if(MUS.graph&&MUS.an&&MUS.fdata&&MUS.playing){
      MUS.an.getByteFrequencyData(MUS.fdata);
      let s=0,n=0;
      for(let i=2;i<14;i++){s+=MUS.fdata[i];n++;}
      bass=n?(s/n)/255:0;
    }
    MUS.bass=(MUS.bass||0)+(bass-(MUS.bass||0))*0.22;
    const b=MUS.bass;
    MUS.hue=(MUS.hue+0.10+b*0.85)%360;
    if(dance){
      dance.style.setProperty('--hue',MUS.hue.toFixed(1));
      dance.style.setProperty('--bass',b.toFixed(3));
    }
    const mp=document.getElementById('mPlayer');
    if(mp)mp.style.setProperty('--ph',MUS.hue.toFixed(1));
    if(cv)musDrawEQ(b);
    const art=document.querySelector('.m-art');
    if(art)art.style.transform='scale('+(1+b*0.09).toFixed(3)+')';
    MUS.raf=requestAnimationFrame(loop);
  })();
}
function musStopViz(){if(MUS.raf){cancelAnimationFrame(MUS.raf);MUS.raf=0;}}
function musDrawEQ(b){
  const cv=document.getElementById('eqCanvas');if(!cv)return;
  const ctx2=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx2.clearRect(0,0,W,H);
  const N=44,gap=3,bw=(W-gap*(N-1))/N;
  if(!MUS.bars)MUS.bars=new Array(N).fill(0);
  const base=Math.round(H*0.62);
  for(let i=0;i<N;i++){
    let v;
    if(MUS.graph&&MUS.an&&MUS.fdata&&MUS.playing){
      const idx=2+Math.floor(Math.pow(i/N,1.6)*90);
      v=(MUS.fdata[idx]||0)/255;
    }else{
      v=MUS.playing?(0.18+0.14*Math.sin(Date.now()/300+i*0.55)):0.06;
    }
    MUS.bars[i]+=(v-MUS.bars[i])*0.3;
    const h=Math.max(3,MUS.bars[i]*(base-6));
    const x=i*(bw+gap);
    const hue=(MUS.hue+i*3)%360;
    const r=Math.min(bw/2,3);
    const g2=ctx2.createLinearGradient(0,base-h,0,base);
    g2.addColorStop(0,'hsl('+hue+' 75% 66%)');
    g2.addColorStop(1,'hsl('+((hue+40)%360)+' 65% 44%)');
    ctx2.fillStyle=g2;
    ctx2.beginPath();
    ctx2.moveTo(x,base);ctx2.lineTo(x,base-h+r);ctx2.quadraticCurveTo(x,base-h,x+r,base-h);
    ctx2.lineTo(x+bw-r,base-h);ctx2.quadraticCurveTo(x+bw,base-h,x+bw,base-h+r);ctx2.lineTo(x+bw,base);
    ctx2.closePath();ctx2.fill();
    const hr=h*0.32;
    const g3=ctx2.createLinearGradient(0,base,0,base+hr);
    g3.addColorStop(0,'hsl('+hue+' 70% 55% / .35)');
    g3.addColorStop(1,'hsl('+hue+' 70% 55% / 0)');
    ctx2.fillStyle=g3;
    ctx2.fillRect(x,base,bw,hr);
  }
}
/* --- رندر بخش موزیک --- */
function musHero(){
  const QUICK=['lo-fi beats','persian classic','piano calm','synthwave','acoustic','jazz'];
  return '<section class="mus-hero">'
    +'<span class="kicker"><span class="dot"></span> پخش زندهٔ واقعی — با جستجو در صدها هزار آهنگ</span>'
    +'<h1>هیئت‌شنیدارِ <span class="g">کافی‌نت</span></h1>'
    +'<p>آهنگی که می‌خواهی را جستجو کن؛ همان لحظه در پلیر پخش می‌شود — با کنترل کامل: مکث، جلو/عقب، صدا، شافل، تکرار و رقصِ نورِ هماهنگ با بیس!</p>'
    +'<div class="mus-search">'
      +'<span class="ms-ic">'+ic('search',20)+'</span>'
      +'<input type="text" id="musInp" placeholder="نام آهنگ، خواننده یا سبک… (مثلاً lo-fi یا piano)" value="'+esc(MUS.q)+'" autocomplete="off">'
      +'<button class="btn gold mus-go" onclick="musGo(true)">'+ic('play',16)+'جستجو و پخش</button>'
    +'</div>'
    +'<div class="mus-tabs">'
      +'<span class="mtab'+(MUS.prov==='audius'?' active':'')+'" onclick="musProv(\'audius\')">'+ic('radio',14)+'اودیوس — موزیک زنده</span>'
      +'<span class="mtab'+(MUS.prov==='arch'?' active':'')+'" onclick="musProv(\'arch\')">'+ic('library',14)+'آرشیو اینترنت — کلاسیک و تاریخی</span>'
    +'</div>'
    +'<div class="chips" style="justify-content:center">'+QUICK.map(q=>'<span class="chip" onclick="musQuick(\''+q+'\')">'+ic('music',12)+q+'</span>').join('')+'</div>'
  +'</section>'
  +'<div class="mus-grid">'
    +'<div class="player-card'+(MUS.playing?' playing':'')+'" id="mPlayer">'+playerHtml()+'</div>'
    +'<div class="mus-results" id="musRes">'+resPlaceholder()+'</div>'
  +'</div>'
  +'<div id="musicDance" class="on"><i class="md-b b1"></i><i class="md-b b2"></i><i class="md-b b3"></i></div>'
  +footHtml();
}
function playerHtml(){
  const t=MUS.cur;
  return '<div class="m-top">'
    +'<div class="m-artwrap"><span class="m-art-ring" aria-hidden="true"></span>'
    +'<div class="m-art'+(t&&t.art?'':' noimg')+'" id="mArt">'+(t&&t.art?'<img src="'+esc(t.art)+'" alt="" onerror="this.parentNode.classList.add(\'noimg\')">':'<span class="fallback">'+ic('music',30)+'</span>')+'<span class="vinyl-shine"></span></div>'
    +'</div>'
    +'<div class="m-now"><div class="m-lbl">'+(MUS.playing?'در حال پخش زنده':'آمادهٔ پخش')+'</div>'
      +'<div class="m-ttl" id="mTitle">'+(t?esc(t.t):'هنوز چیزی پخش نشده')+'</div>'
      +'<div class="m-artst" id="mArtist">'+(t?esc(t.a):'یه آهنگ جستجو کن تا اینجا بنشیند')+'</div>'
      +(t?'<div class="m-chips"><span class="q-chip">'+ic('activity',10)+(t.p==='audius'?'استریم زنده':'آرشیو صوتی')+'</span>'
        +(MUS.ctx?'<span class="q-chip">'+faStr((MUS.ctx.sampleRate/1000).toFixed(1))+' کیلوهرتز</span>':'')+'</div>':'')
    +'</div>'
  +'</div>'
  +'<canvas id="eqCanvas" width="320" height="60" aria-hidden="true"></canvas>'
  +'<div class="m-seekrow"><span id="mCur">'+(t?'۰:۰۰':'')+'</span>'
    +'<input type="range" id="mSeek" min="0" max="1000" value="0" style="--p:0%" aria-label="جابه‌جایی در آهنگ">'
    +'<span id="mDur">'+(t&&t.d?fmtT(t.d):'۰:۰۰')+'</span></div>'
  +'<div class="m-ctrls">'
    +'<button class="ctl sm'+(MUS.shuffle?' on':'')+'" onclick="musToggleShuffle()" title="پخش تصادفی">'+ic('shuffle',15)+'</button>'
    +'<button class="ctl" onclick="musPrev()" title="قبلی / ابتدا">'+ic('skip-back',17)+'</button>'
    +'<button class="ctl main" id="mPlay" onclick="musToggle()" title="پخش / مکث">'+ic(MUS.playing?'pause':'play',21)+'</button>'
    +'<button class="ctl" onclick="musNext()" title="بعدی">'+ic('skip-fwd',17)+'</button>'
    +'<button class="ctl sm'+(MUS.repeat!=='off'?' on':'')+'" onclick="musCycleRepeat()" title="تکرار">'+ic(MUS.repeat==='one'?'repeat-1':'repeat',15)+'</button>'
  +'</div>'
  +'<div class="m-volrow">'
    +'<span class="vol-ic" id="volIc" onclick="musMute()" title="بی‌صدا/بازگردانی">'+ic(MUS.vol===0?'volume-x':'volume',16)+'</span>'
    +'<input type="range" id="mVol" min="0" max="100" value="'+Math.round(MUS.vol*100)+'" style="--p:'+(MUS.vol*100)+'%" aria-label="بلندی صدا" oninput="musSetVol(this.value/100)">'
    +'<span class="vol-lbl" id="volLbl">'+faNum(Math.round(MUS.vol*100))+'٪</span>'
  +'</div>'
  +'<div class="m-meta">'+ic('disc',12)+(MUS.queue.length?'در صف: '+faNum(MUS.queue.length)+' آهنگ':'صف خالی است')+(t?' · '+(t.p==='audius'?'منبع: اودیوس':'منبع: آرشیو اینترنت'):'')+'</div>';
}
function resPlaceholder(){
  return '<div class="mus-empty"><span class="e-ic">'+ic('disc',34)+'</span><h3>دنبال چی می‌گردی؟</h3>'
  +'<p>اسم آهنگ یا خواننده را بالا بنویس و Enter بزن — نتیجه‌های واقعی می‌آیند و اولی خودکار پخش می‌شود.</p>'
  +'<div class="mus-hints">'+ic('lightbulb',13)+' پیشنهاد: «lo-fi beats» برای تمرکز، «persian classic» برای نوستالژی، «synthwave» برای انرژی!</div></div>';
}
function renderMusResults(){
  const box=$('#musRes');if(!box)return;
  let h='';
  if(MUS.loading){
    h='<div class="mus-loading">'+ic('activity',16)+'در حال جستجوی «'+esc(MUS.q)+'»…</div>'
     +'<div class="rrow skel"><span class="sk sk-art"></span><div class="sk-lines"><span class="sk sk-a"></span><span class="sk sk-b"></span></div></div>'.repeat(4);
  }else if(MUS.err){
    h='<div class="mus-empty"><span class="e-ic">'+ic('alert',30)+'</span><h3>ای!</h3><p>'+esc(MUS.err)+'</p>'
    +'<button class="btn primary" onclick="musSearch(MUS.q)">'+ic('rotate-ccw',15)+'تلاش دوباره</button></div>';
  }else if(MUS.results&&MUS.results.length){
    h='<div class="mus-qinfo">'+ic('music',13)+faNum(MUS.results.length)+' نتیجه برای «'+esc(MUS.q)+'» — کلیک = پخش فوری</div>'
    +MUS.results.map((t,i)=>rrow(t,i)).join('');
  }else{
    h=resPlaceholder();
  }
  box.innerHTML=h;
}
function rrow(t,i){
  const now=MUS.cur&&MUS.queue[MUS.qi]&&MUS.qi===i&&MUS.cur.id===t.id;
  return '<div class="rrow'+(now?' now':'')+'" onclick="musPlayAt('+i+')">'
    +'<span class="r-idx">'+(now?'<span class="live-eq"><i></i><i></i><i></i></span>':faNum(i+1))+'</span>'
    +'<span class="r-art">'+(t.art?'<img src="'+esc(t.art)+'" alt="" loading="lazy" onerror="this.remove()">':ic('music',16))+'</span>'
    +'<span class="r-tt"><span class="a">'+esc(t.t)+'</span><span class="b">'+esc(t.a)+(t.g?' · '+esc(t.g):'')+(t.pc?' · '+fmtPlays(t.pc)+' پخش':'')+'</span></span>'
    +'<span class="r-dur">'+(t.d?fmtT(t.d):'—')+'</span>'
    +'<span class="r-play">'+ic('play',14)+'</span>'
  +'</div>';
}
function renderPlayer(){
  const p=$('#mPlayer');
  if(p){
    p.innerHTML=playerHtml();
    p.classList.toggle('playing',MUS.playing);
  }
}
function musGo(auto){
  const inp=$('#musInp');
  const q=inp?inp.value:'';
  musSearch(q,auto);
}
function musQuick(q){
  const inp=$('#musInp');if(inp)inp.value=q;
  musSearch(q,true);
}
function musProv(p){
  MUS.prov=p;store.set('mprov',p);
  const tabs=document.querySelectorAll('.mtab');
  tabs.forEach(el=>el.classList.remove('active'));
  const idx=p==='arch'?1:0;
  if(tabs[idx])tabs[idx].classList.add('active');
  if(MUS.q)musSearch(MUS.q,false);
  toast('منبع جستجو: '+(p==='audius'?'اودیوس':'آرشیو اینترنت'),'radio');
}
/* --- مینی‌پلیر --- */
function miniHtml(){
  const t=MUS.cur;if(!t)return '';
  return '<div class="mini-play" id="miniPlay" onclick="go(\'music\')">'
    +'<span class="mp-art">'+(t.art?'<img src="'+esc(t.art)+'" alt="">':ic('music',16))+'</span>'
    +'<span class="mp-tt"><span class="a">'+esc(t.t)+'</span><span class="b">'+esc(t.a)+'</span></span>'
    +'<span class="mp-eq"><i></i><i></i><i></i></span>'
    +'<button class="mp-btn" id="miniPlayBtn" onclick="event.stopPropagation();musToggle()">'+ic(MUS.playing?'pause':'play',15)+'</button>'
    +'<button class="mp-btn" onclick="event.stopPropagation();musNext()" title="بعدی">'+ic('skip-fwd',14)+'</button>'
    +'<button class="mp-btn x" onclick="event.stopPropagation();musStopAll()" title="توقف و بستن">'+ic('x',13)+'</button>'
    +'<span class="mp-prog"><i id="mpProg"></i></span>'
  +'</div>';
}
function musStopAll(){
  const a=musAudio();a.pause();a.src='';
  MUS.cur=null;MUS.queue=[];MUS.qi=-1;
  document.title='کافی‌نت نت‌یار — هر سایتی که لازم داری، یک‌جا';
  render();
}
function attachMini(){if(MUS.cur&&state.view!=='music'&&!$('#miniPlay')){app.insertAdjacentHTML('beforeend',miniHtml());}}

/* ================================================================
   ماشین‌حساب واقعی
   ================================================================ */
const CALC={cur:'0',expr:[],justEq:false,hist:store.get('calcHist',[])};
function cClean(v){
  if(typeof v!=='number'||!isFinite(v))return null;
  return parseFloat(v.toPrecision(12));
}
function cCompute(arr){
  const a=arr.slice();
  for(let i=1;i<a.length-1;){
    const op=a[i];
    if(op==='×'||op==='÷'){
      const x=a[i-1],y=a[i+1];
      if(op==='÷'&&(y===0||y===0.0))return null;
      a.splice(i-1,3,op==='×'?x*y:x/y);
    }else i+=2;
  }
  let r=a[0];
  for(let i=1;i<a.length-1;i+=2)r=a[i]==='+'?r+a[i+1]:r-a[i+1];
  return cClean(r);
}
function cFmtNum(x){
  if(x===null)return 'خطا';
  if(Math.abs(x)>=1e13||(Math.abs(x)<1e-9&&x!==0))return faStr(x.toExponential(6).replace('e','ᴇ'));
  return faStr(grp(String(x)));
}
function cExprHtml(){
  let out='';
  for(const tok of CALC.expr){
    out+=(typeof tok==='number')?cFmtNum(tok)+' ':'<b class="cop">'+tok+'</b> ';
  }
  return out;
}
function cRender(){
  const v=$('#cVal'),e=$('#cExpr');
  if(!v)return;
  let disp=CALC.cur;
  if(disp!=='خطا'&&!disp.includes('ᴇ'))disp=faStr(grp(disp));
  v.textContent=disp;
  v.classList.toggle('err',CALC.cur==='خطا');
  if(e)e.innerHTML=cExprHtml()||'۰';
  renderCHist();
}
function cHistHtml(){
  if(!CALC.hist.length)return '<div class="ch-empty">'+ic('lightbulb',14)+' محاسبات اینجا ثبت می‌شوند</div>';
  return CALC.hist.map((h,i)=>'<div class="ch-row" onclick="cUseHist('+i+')" title="برای استفاده کلیک کن"><span class="e">'+h.e+'</span><span class="r">'+h.r+'</span></div>').join('');
}
function renderCHist(){
  const el=$('#cHist');if(el)el.innerHTML=cHistHtml();
}
function cUseHist(i){
  const h=CALC.hist[i];if(!h)return;
  CALC.cur=String(h.raw);CALC.expr=[];CALC.justEq=true;
  cRender();toast('نتیجه در ماشین‌حساب بارگذاری شد','calculator');
}
function cPushHist(eStr,rawVal){
  CALC.hist.unshift({e:eStr,r:cFmtNum(rawVal),raw:String(rawVal)});
  if(CALC.hist.length>10)CALC.hist.pop();
  store.set('calcHist',CALC.hist);
}
function calcKey(k){
  const C=CALC;
  if(k==='-')k='−';
  if(k===',')k='.';
  if(/^[0-9۰-۹]{2,}$/.test(k)){for(const ch of k)calcKey(ch);return;}
  const isDigit=/^[0-9۰-۹]$/.test(k);
  if(isDigit){
    const d=String(k).replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x));
    if(C.justEq){C.expr=[];C.cur=d;C.justEq=false;}
    else if(C.cur==='خطا'){C.cur=d;}
    else if(C.cur==='0')C.cur=d;
    else if(C.cur.replace(/[-]/g,'').length<15)C.cur+=d;
  }else if(k==='.'){
    if(C.justEq){C.expr=[];C.cur='0.';C.justEq=false;}
    else if(C.cur==='خطا')C.cur='0.';
    else if(!C.cur.includes('.'))C.cur+=(C.cur===''||C.cur==='−')?'0.':'.';
  }else if(['+','−','×','÷'].includes(k)){
    if(C.cur==='خطا')return;
    const hasNum=C.cur!==''&&C.cur!=='−'&&!isNaN(parseFloat(C.cur));
    const lastIsOp=C.expr.length>0&&typeof C.expr[C.expr.length-1]==='string';
    if(C.justEq){
      C.expr=[parseFloat(C.cur),k];C.justEq=false;C.cur='';
    }else if(hasNum){
      C.expr.push(parseFloat(C.cur),k);C.cur='';
    }else if(lastIsOp){
      C.expr[C.expr.length-1]=k;
    }else if(C.expr.length===0){
      C.expr.push(0,k);C.cur='';
    }
  }else if(k==='٪'){
    if(C.cur&&C.cur!=='خطا'){const v=cClean(parseFloat(C.cur)/100);if(v!==null)C.cur=String(v);}
  }else if(k==='±'){
    if(C.cur&&C.cur!=='خطا'&&C.cur!=='0')C.cur=C.cur.startsWith('-')?C.cur.slice(1):'-'+C.cur;
  }else if(k==='⌫'){
    if(C.justEq||C.cur==='خطا'){C.cur='0';C.justEq=false;}
    else C.cur=C.cur.slice(0,-1)||'0';
  }else if(k==='AC'){
    C.cur='0';C.expr=[];C.justEq=false;
  }else if(k==='='){
    const pending=C.expr.length&&typeof C.expr[C.expr.length-1]==='string';
    const curNum=(C.cur!==''&&C.cur!=='−'&&!isNaN(parseFloat(C.cur)))?parseFloat(C.cur):null;
    if(pending&&curNum!==null){
      const full=C.expr.concat(curNum);
      const eStr=full.map(t=>typeof t==='number'?cFmtNum(t):t).join(' ');
      const res=cCompute(full);
      if(res===null){C.cur='خطا';C.expr=[];C.justEq=false;}
      else{cPushHist(eStr,res);C.expr=[];C.cur=String(res);C.justEq=true;}
    }
  }
  cRender();
}
const CK=[
  ['AC','fn','AC'],['⌫','fn','bk'],['٪','op','%'],['÷','op','÷'],
  ['۷','','7'],['۸','','8'],['۹','','9'],['×','op','×'],
  ['۴','','4'],['۵','','5'],['۶','','6'],['−','op','-'],
  ['۱','','1'],['۲','','2'],['۳','','3'],['+','op','+'],
  ['±','fn','pm'],['۰','','0'],['.','.','.'],['=','eq','='],
];
function vCalc(){
  return '<section class="soon-hero" style="margin-bottom:20px"><span class="soon-badge live"><span class="d"></span> فعال و آمادهٔ کار</span>'
    +'<h2>حسابِ کافی‌نت</h2>'
    +'<p>ماشین‌حساب واقعی و دقیق با اولویتِ ضرب و تقسیم، درصد، تاریخچهٔ محاسبات و پشتیبانی کامل از کیبورد فیزیکی و لمسی. بنویس و ببین!</p>'
    +'<span class="big">'+ic('calculator',84)+'</span></section>'
  +'<div class="calc-wrap">'
    +'<div class="calc">'
      +'<div class="calc-brand"><span class="t">'+ic('calculator',15)+'نت‌یار حساب</span><span class="b">LIVE</span></div>'
      +'<div class="calc-disp"><div class="expr" id="cExpr">۰</div><div class="val" id="cVal">۰</div></div>'
      +'<div class="calc-keys">'+CK.map(k=>'<button class="ck '+k[1]+'" data-k="'+k[2]+'" onclick="calcKey(\''+k[2]+'\')">'+k[0]+'</button>').join('')+'</div>'
    +'</div>'
    +'<div class="calc-side">'
      +'<div class="info-card"><h3>'+ic('library',16)+'تاریخچهٔ محاسبات</h3><div class="ch-list" id="cHist">'+cHistHtml()+'</div></div>'
      +'<div class="info-card reveal"><h3>'+ic('keyboard',16)+'میان‌برهای کیبورد</h3><p>اعداد و <b>+ − * /</b> مستقیم کار می‌کنند؛ <b>Enter</b> مساوی، <b>Backspace</b> حذف، <b>Esc</b> پاک‌کردن کامل و <b>%</b> درصد. حتی با اعداد فارسی هم جواب می‌دهد!</p></div>'
      +'<div class="info-card reveal" style="transition-delay:.08s"><h3>'+ic('info',16)+'نکته‌ها</h3><p>روی نتیجه‌های تاریخچه کلیک کن تا دوباره استفاده شوند. اولویت محاسبات استاندارد است: اول ضرب و تقسیم، بعد جمع و تفریق.</p></div>'
    +'</div>'
  +'</div>'+footHtml();
}

/* ---------- رندر ---------- */
function render(){
  let body='';
  switch(state.view){
    case 'sites':body=vSites();break;
    case 'fav':body=vFav();break;
    case 'games':body=vGames();break;
    case 'music':body=musHero();break;
    case 'calc':body=vCalc();break;
    default:body=vHome();
  }
  app.innerHTML=sideHtml()+topHtml()+'<main class="content">'+body+'</main>';
  tick();
  animateCounts();
  observeReveals();
  window.scrollTo({top:0});
  if(state.view==='music'){
    renderMusResults();
    if(MUS.playing)musStartViz();
    const a=MUS.audio;
    if(a&&MUS.cur){musPaintNow(MUS.cur);musUpdSeek();}
  }else{
    musStopViz();
    attachMini();
  }
}
function randomSite(){
  const s=SITES[Math.floor(Math.random()*SITES.length)];
  const cat=CATS[s.c];
  const ov=document.createElement('div');
  ov.className='overlay';
  ov.innerHTML='<div class="modal" style="--cc:'+cat.c+';--csh:'+cat.c+'88" onclick="event.stopPropagation()">'
    +'<button class="x" onclick="this.closest(\'.overlay\').remove()">'+ic('x',14)+'</button>'
    +'<div class="m-av">'+ic(cat.i,28)+'</div>'
    +'<h3>قرعه به نام «'+esc(s.n)+'» افتاد!</h3>'
    +'<div class="m-url">'+esc(s.u)+'</div>'
    +'<p>'+esc(s.d)+'</p>'
    +'<div class="row"><button class="btn gold" onclick="this.closest(\'.overlay\').remove();openSite('+s.id+',event)">'+ic('log-in',15)+'ورود آنی</button>'
    +'<button class="btn ghost" onclick="this.closest(\'.overlay\').remove();go(\'sites\');setQ(\''+esc(s.n).replace(/'/g,"\\'")+'\')">'+ic('search',14)+'دیدن در لیست</button></div>'
  +'</div>';
  ov.addEventListener('click',()=>ov.remove());
  document.body.appendChild(ov);
}

/* ---------- جستجوی زنده سایت‌ها ---------- */
function updateResInfo(){
  const res=filterSites(state.q,state.cat);
  const info=$('.res-info');
  if(info)info.innerHTML='<b>'+faNum(res.length)+'</b> نتیجه'+(state.cat?' در «'+CATS[state.cat].l+'»':'')+(state.q?' برای «'+esc(state.q)+'»':'');
  const oldGrid=$('#sites-grid');
  const empty=$('.content .empty');
  const html=res.length
    ?'<div class="grid '+(state.mode==='list'?'list':'')+'" id="sites-grid">'+res.map((s,i)=>siteCard(s,state.q,i)).join('')+'</div>'
    :'<div class="empty"><span class="e-ic">'+ic('search',34)+'</span><h3>چیزی پیدا نشد!</h3><p>برای «'+esc(state.q)+'» نتیجه‌ای نداشتیم. یک چیز دیگر امتحان کن.</p></div>';
  if(oldGrid)oldGrid.outerHTML=html;
  else if(empty)empty.outerHTML=html;
}
document.addEventListener('input',e=>{
  const inp=e.target;
  if(!inp||!inp.id)return;
  if(inp.id==='musInp')return;
  if(inp.id==='mSeek'){
    MUS.seekDrag=true;
    inp.style.setProperty('--p',(inp.value/10)+'%');
    const a=MUS.audio;
    if(a&&a.duration){const t1=$('#mCur');if(t1)t1.textContent=fmtT((inp.value/1000)*a.duration);}
    return;
  }
  if(inp.id==='mVol')return;
  if(!inp.id.startsWith('inp-'))return;
  state.q=inp.value;
  inp.closest('.searchbox').classList.toggle('hasq',!!state.q);
  if(state.view!=='sites'){go('sites');const ni=$('#inp-sites-sb');if(ni){ni.focus();ni.setSelectionRange(ni.value.length,ni.value.length);}return;}
  updateResInfo();
});
document.addEventListener('change',e=>{
  if(e.target&&e.target.id==='mSeek'){MUS.seekDrag=false;musSeekTo(+e.target.value);}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target&&e.target.id==='musInp'){musGo(true);return;}
});

/* ---------- میکرو-تعامل‌ها ---------- */
document.addEventListener('pointerdown',e=>{
  const t=e.target.closest('.btn,.chip,.nav-item,.cat-card,.icon-btn,.bnav-item,.game-card,.nav-cat,.track,.ctl,.ck,.rrow,.mtab,.ch-row,.back-btn,.mp-btn');
  if(!t)return;
  const r=t.getBoundingClientRect();
  const d=Math.max(r.width,r.height)*1.15;
  const s=document.createElement('span');
  s.className='ripple';
  s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';
  t.appendChild(s);
  setTimeout(()=>s.remove(),700);
});
let tiltEl=null;
document.addEventListener('pointermove',e=>{
  if(!window.matchMedia||!matchMedia('(pointer:fine)').matches||window.innerWidth<921)return;
  const c=e.target.closest?e.target.closest('.card'):null;
  if(tiltEl&&tiltEl!==c){tiltEl.style.setProperty('--rx','0deg');tiltEl.style.setProperty('--ry','0deg');tiltEl=null;}
  if(c&&c.parentElement&&c.parentElement.classList.contains('grid')){
    tiltEl=c;
    const r=c.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.setProperty('--ry',(x*5).toFixed(2)+'deg');
    c.style.setProperty('--rx',(-y*5).toFixed(2)+'deg');
  }
});
let revealObs=null;
function observeReveals(){
  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('vis'));return;
  }
  if(!revealObs)revealObs=new IntersectionObserver(es=>{
    es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('vis');revealObs.unobserve(en.target);}});
  },{threshold:.08});
  document.querySelectorAll('.reveal:not(.vis)').forEach(el=>revealObs.observe(el));
}
function animateCounts(){
  document.querySelectorAll('.count[data-n]').forEach(el=>{
    if(el.dataset.done)return;el.dataset.done='1';
    const target=+el.dataset.n,t0=performance.now(),D=1300;
    (function step(t){
      const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);
      el.textContent=faNum(Math.round(target*e));
      if(p<1)requestAnimationFrame(step);
    })(t0);
  });
}

/* ---------- کیبورد سراسری ---------- */
const CALC_KMAP={'*':'×','x':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Backspace':'⌫','Delete':'AC','%':'٪','.':'.',',':'.'};
document.addEventListener('keydown',e=>{
  const ae=document.activeElement;
  const tag=(ae&&ae.tagName)||'';
  const inInput=tag==='INPUT'||tag==='TEXTAREA';
  if(e.key==='Escape'){
    if(document.querySelector('.overlay')){document.querySelector('.overlay').remove();return;}
    if(state.view==='calc'&&!inInput){calcKey('AC');return;}
    if(state.q){state.q='';render();}
    return;
  }
  if(document.querySelector('.overlay'))return;
  if(inInput)return;
  const onBtn=tag==='BUTTON';
  /* میان‌برهای پلیر (وقتی آهنگی در جریان است) */
  if(MUS.cur&&!onBtn){
    if(e.key===' '){e.preventDefault();musToggle();return;}
    if(e.key==='ArrowLeft'){e.preventDefault();const a=MUS.audio;if(a)try{a.currentTime=Math.max(0,a.currentTime-5);}catch(x){}return;}
    if(e.key==='ArrowRight'){e.preventDefault();const a=MUS.audio;if(a)try{a.currentTime=Math.min(a.duration||0,a.currentTime+5);}catch(x){}return;}
    if(e.key==='ArrowUp'){e.preventDefault();musSetVol(MUS.vol+0.05);return;}
    if(e.key==='ArrowDown'){e.preventDefault();musSetVol(MUS.vol-0.05);return;}
    if(e.key==='n'||e.key==='ن'){musNext(false);return;}
    if(e.key==='p'||e.key==='پ'){musPrev();return;}
  }
  /* ماشین‌حساب */
  if(state.view==='calc'){
    if(ae&&ae.classList&&ae.classList.contains('ck')&&(e.key==='Enter'||e.key===' '))return;
    let k=null;
    if(/^[0-9]$/.test(e.key))k=e.key;
    else if('۰۱۲۳۴۵۶۷۸۹'.includes(e.key))k=e.key;
    else if(CALC_KMAP[e.key]!==undefined)k=CALC_KMAP[e.key];
    if(k){
      e.preventDefault();
      calcKey(k);
      const code={'×':'×','÷':'÷','-':'-','+':'+','%':'%','.':'.','=':'=','⌫':'bk','AC':'AC'}[k]||k;
      const sel='.ck[data-k="'+String(code).replace(/["\\]/g,'\\$&')+'"]';
      const btn=document.querySelector(sel);
      if(btn){btn.classList.add('kdown');setTimeout(()=>btn.classList.remove('kdown'),140);}
      return;
    }
  }
  if(e.key==='/'){
    e.preventDefault();
    if(state.view==='music'){const mi=$('#musInp');if(mi)mi.focus();return;}
    if(state.view!=='sites'&&state.view!=='home'){go('sites');setTimeout(()=>{const i=$('#inp-sites-sb');if(i)i.focus();},60);return;}
    const i=$('#inp-sites-sb')||$('#inp-home-sb');if(i)i.focus();
    return;
  }
  /* میان‌بر 1-6 (در ماشین‌حساب غیرفعال) */
  if(state.view==='calc')return;
  let idx=-1;
  if(['1','2','3','4','5','6'].includes(e.key))idx=+e.key-1;
  else if('۱۲۳۴۵۶'.includes(e.key))idx='۱۲۳۴۵۶'.indexOf(e.key);
  if(idx>=0)go(VIEWS[idx]);
});

/* ---------- ساعت ---------- */
function tick(){
  const tmEl=$('.clock .tm');
  if(!tmEl)return;
  try{tmEl.textContent=new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date());}catch(e){}
}
setInterval(tick,1000);

/* ---------- لودینگ ۱۰ ثانیه‌ای ---------- */
(function(){
  const DUR=10000;
  const fill=document.getElementById('ldFill'),pct=document.getElementById('ldPct'),stat=document.getElementById('ldStat');
  const loader=document.getElementById('loader'),skip=document.getElementById('ldSkip');
  const STAGES=[
    [0,'روشن‌کردن چراغ‌های کافی‌نت…'],
    [1400,'دم‌کردن قهوهٔ تازه…'],
    [2900,'چیدن '+faNum(SITES.length)+' سایت روی میزها…'],
    [4400,'اتصال به وای‌فای کافی‌نت…'],
    [6000,'تنظیم صندلی‌های راحتی…'],
    [7500,'نهایی‌کردن منوی سرویس…'],
    [9200,'آمادهٔ سرو! خوش آمدید'],
  ];
  let finished=false;const t0=performance.now();
  function finish(){
    if(finished)return;finished=true;
    fill.style.width='100%';pct.textContent=faNum(100)+'٪';
    stat.textContent='آمادهٔ سرو! خوش آمدید';
    setTimeout(()=>{
      loader.classList.add('done');
      document.body.classList.add('ready');
      animateCounts();observeReveals();
      setTimeout(()=>loader.remove(),900);
    },250);
  }
  function frame(now){
    if(finished)return;
    const el=now-t0;
    const p=Math.min(1,el/DUR);
    fill.style.width=(p*100).toFixed(1)+'%';
    pct.textContent=faNum(Math.floor(p*100))+'٪';
    let s=STAGES[0][1];
    for(const st of STAGES){if(el>=st[0])s=st[1];}
    if(stat.textContent!==s)stat.textContent=s;
    if(p>=1){finish();return;}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  skip.addEventListener('click',finish);
  window.__finishLoader=finish;
})();

/* ---------- شروع ---------- */
function start(){
  const h=(location.hash||'').replace('#','');
  if(VIEWS.includes(h))state.view=h;
  render();
}
window.addEventListener('hashchange',()=>{
  const h=(location.hash||'').replace('#','');
  if(VIEWS.includes(h)&&h!==state.view){state.view=h;state.cat=null;render();}
});
start();
