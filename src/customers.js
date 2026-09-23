/* ================================================================
   مشتریان کافی‌نت نت‌یار — CRM پرمیوم واقعی
   رمز مخفی 5585 — ذخیره پایدار، اشتراک، ذخیره گالری، ویرایش/حذف
   ================================================================ */
'use strict';

const CRM_PASS = '5585';
const CRM_STORE_KEY = 'crm_customers';
const CRM_AUTH_KEY = 'crm_auth';
const CRM_CATS = [
  {id:'regular', l:'عادی', c:'#4c8ddb', i:'user'},
  {id:'student', l:'دانشجو', c:'#8b7bd8', i:'graduation'},
  {id:'freelancer', l:'فریلنسر', c:'#4fa98c', i:'code'},
  {id:'gamer', l:'گیمر', c:'#7a9e4f', i:'gamepad'},
  {id:'business', l:'کسب‌وکار', c:'#c9a227', i:'briefcase'},
  {id:'vip', l:'VIP طلایی', c:'#d9ae3e', i:'crown'},
  {id:'other', l:'سایر', c:'#7c8da6', i:'layers'},
];

function crmGet(){ return store.get(CRM_STORE_KEY, []); }
function crmSet(arr){ store.set(CRM_STORE_KEY, arr); }
function crmIsAuth(){ 
  try{ return store.get(CRM_AUTH_KEY, false)===true || sessionStorage.getItem('crm_auth')==='1'; }catch(e){ return store.get(CRM_AUTH_KEY,false); }
}
function crmSetAuth(v){ 
  try{ store.set(CRM_AUTH_KEY, v); if(v) sessionStorage.setItem('crm_auth','1'); else sessionStorage.removeItem('crm_auth'); }catch(e){ store.set(CRM_AUTH_KEY,v); }
}
function crmNow(){ 
  try{ return new Intl.DateTimeFormat('fa-IR',{dateStyle:'full',timeStyle:'medium'}).format(new Date()); }catch(e){ return new Date().toLocaleString('fa-IR'); }
}
function crmId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

// اعتبارسنجی کد ملی ایران
function crmValidNational(code){
  if(!/^\d{10}$/.test(code)) return false;
  if(/^(\d)\1{9}$/.test(code)) return false;
  const check = +code[9];
  let sum=0;
  for(let i=0;i<9;i++) sum+= +code[i]*(10-i);
  const r=sum%11;
  return (r<2 && check===r) || (r>=2 && check===11-r);
}
function crmValidMobile(m){
  return /^09\d{9}$/.test(m.replace(/\s+/g,''));
}

let CRM={q:'',cat:null,editId:null,view:'list'};

function crmLockHtml(){
  return '<section class="crm-lock-wrap">'
    +'<div class="crm-lock-bg"><div class="crm-lock-glow g1"></div><div class="crm-lock-glow g2"></div></div>'
    +'<div class="crm-lock-card reveal">'
      +'<div class="crm-lock-ic">'+ic('shield-check',42)+'</div>'
      +'<h2>بخش مشتریان — دسترسی امن</h2>'
      +'<p>این بخش فقط برای مدیریت کافی‌نت است. رمز ۴ رقمی را وارد کنید تا وارد شوید.</p>'
      +'<div class="crm-lock-input">'
        +'<input type="password" id="crmPassInp" inputmode="numeric" maxlength="4" placeholder="رمز ۴ رقمی" autocomplete="off">'
        +'<button class="btn gold" onclick="crmTryPass()">'+ic('unlock',16)+' ورود</button>'
      +'</div>'
      +'<div class="crm-lock-hint">'+ic('info',12)+' رمز پیش‌فرض: <b>۵۵۸۵</b> — قابل تغییر نیست (سفارشی شما)</div>'
      +'<div class="crm-lock-foot"><span>'+ic('users',12)+' '+faNum(crmGet().length)+' مشتری ذخیره شده</span><span>'+ic('shield',12)+' رمزنگاری محلی</span></div>'
    +'</div></section>';
}

function crmTryPass(){
  const inp=document.getElementById('crmPassInp');
  const v=(inp&&inp.value||'').trim();
  if(v===CRM_PASS){
    crmSetAuth(true);
    toast('خوش آمدید! دسترسی باز شد','shield-check');
    try{gSfx('win');}catch(e){}
    render();
  }else{
    toast('رمز اشتباه است!','alert');
    if(inp){inp.classList.add('shake'); inp.value=''; setTimeout(()=>inp.classList.remove('shake'),400);}
    try{gSfx('bad');}catch(e){}
  }
}
function crmLogout(){
  crmSetAuth(false);
  toast('از بخش مشتریان خارج شدید','lock');
  render();
}

function crmFormHtml(editObj){
  const cats=CRM_CATS;
  const obj=editObj||{fullName:'',national:'',mobile:'',address:'',appIds:'',age:'',job:'',cat:'regular',note:''};
  return '<div class="crm-form-card">'
    +'<h3>'+ic(editObj?'edit':'plus',16)+(editObj?' ویرایش مشتری':' افزودن مشتری جدید')+'</h3>'
    +'<div class="crm-form-grid">'
      +'<label><span>'+ic('user',12)+' نام و نام خانوادگی *</span><input id="cfName" value="'+esc(obj.fullName||'')+'" placeholder="مثلا: علی رضایی"></label>'
      +'<label><span>'+ic('hash',12)+' کد ملی *</span><input id="cfNational" value="'+esc(obj.national||'')+'" maxlength="10" inputmode="numeric" placeholder="۱۰ رقم"></label>'
      +'<label><span>'+ic('smartphone',12)+' شماره موبایل *</span><input id="cfMobile" value="'+esc(obj.mobile||'')+'" inputmode="tel" placeholder="۰۹۱۲..."></label>'
      +'<label><span>'+ic('clock',12)+' سن</span><input id="cfAge" type="number" min="1" max="120" value="'+esc(obj.age||'')+'" placeholder="مثلا: ۲۴"></label>'
      +'<label class="wide"><span>'+ic('briefcase',12)+' نوع کار / شغل</span><input id="cfJob" value="'+esc(obj.job||'')+'" placeholder="مثلا: برنامه‌نویس، دانشجو، گیمر..."></label>'
      +'<label class="wide"><span>'+ic('layers',12)+' دسته‌بندی</span><div class="crm-cat-pick">'+cats.map(c=>'<span class="crm-cat-opt'+(obj.cat===c.id?' on':'')+'" data-cat="'+c.id+'" style="--cc:'+c.c+'" onclick="crmPickCat(\''+c.id+'\')">'+ic(c.i,12)+c.l+'</span>').join('')+'</div></label>'
      +'<label class="wide"><span>'+ic('message',12)+' آیدی اپلیکیشن‌ها (اینستا، تلگرام، واتساپ...)</span><input id="cfAppIds" value="'+esc(obj.appIds||'')+'" placeholder="مثلا: @ali_telegram , insta: ali.rez"></label>'
      +'<label class="wide"><span>'+ic('home',12)+' آدرس</span><textarea id="cfAddr" placeholder="آدرس کامل...">'+esc(obj.address||'')+'</textarea></label>'
      +'<label class="wide"><span>'+ic('type',12)+' یادداشت</span><textarea id="cfNote" placeholder="یادداشت اضافی...">'+esc(obj.note||'')+'</textarea></label>'
    +'</div>'
    +'<div class="crm-form-acts">'
      +'<button class="btn gold" onclick="crmSave()">'+ic('check',16)+(editObj?' ذخیره تغییرات':' افزودن مشتری')+'</button>'
      +'<button class="btn ghost" onclick="crmCancelEdit()">'+ic('x',14)+' انصراف</button>'
    +'</div>'
    +'<div class="crm-form-hint">'+ic('shield-check',12)+' همه اطلاعات روی همین دستگاه ذخیره می‌شود، پاک نمی‌شود.</div>'
  +'</div>';
}

function crmPickCat(id){
  const cur=document.querySelector('.crm-form-card');
  if(!cur) return;
  CRM._pickedCat=id;
  cur.querySelectorAll('.crm-cat-opt').forEach(el=>el.classList.toggle('on',el.dataset.cat===id));
}

function crmCancelEdit(){ CRM.editId=null; CRM._pickedCat=null; crmRerender(); }

function crmSave(){
  const getV=id=>{const el=document.getElementById(id); return el?el.value.trim():'';};
  const fullName=getV('cfName');
  const national=getV('cfNational');
  const mobile=getV('cfMobile');
  const age=getV('cfAge');
  const job=getV('cfJob');
  const appIds=getV('cfAppIds');
  const address=getV('cfAddr');
  const note=getV('cfNote');
  const cat=CRM._pickedCat || (CRM.editId ? (crmGet().find(x=>x.id===CRM.editId)||{}).cat : 'regular') || 'regular';

  if(!fullName){ toast('نام الزامی است','alert'); return; }
  if(!national || !/^\d{10}$/.test(national)){ toast('کد ملی باید ۱۰ رقم باشد','alert'); return; }
  if(!crmValidNational(national)){ toast('کد ملی معتبر نیست (الگوریتم)','alert'); /* allow? we warn but still allow? We'll block */ return; }
  if(!mobile || !crmValidMobile(mobile)){ toast('موبایل باید ۰۹xxxxxxxxx باشد','alert'); return; }
  if(age && (+age<1 || +age>120)){ toast('سن نامعتبر','alert'); return; }

  let list=crmGet();
  const now=new Date().toISOString();
  if(CRM.editId){
    const idx=list.findIndex(x=>x.id===CRM.editId);
    if(idx>=0){
      list[idx]={...list[idx], fullName, national, mobile, age:age?+age:null, job, appIds, address, note, cat, updatedAt:now};
      toast('مشتری ویرایش شد ✓','check-circle');
    }
  }else{
    // check duplicate national
    if(list.some(x=>x.national===national)){ toast('این کد ملی قبلا ثبت شده','info'); return; }
    const obj={id:crmId(), fullName, national, mobile, age:age?+age:null, job, appIds, address, note, cat, createdAt:now, updatedAt:now};
    list.unshift(obj);
    toast('مشتری اضافه شد ✓ — '+faNum(list.length)+' مشتری','users');
    try{gSfx('win');}catch(e){}
  }
  crmSet(list);
  CRM.editId=null; CRM._pickedCat=null;
  crmRerender();
}

function crmDel(id){
  if(!confirm('حذف این مشتری؟')) return;
  let list=crmGet();
  list=list.filter(x=>x.id!==id);
  crmSet(list);
  toast('حذف شد','trash');
  crmRerender();
}
function crmEdit(id){
  CRM.editId=id;
  CRM.view='form';
  crmRerender();
  setTimeout(()=>{document.querySelector('.crm-form-card')?.scrollIntoView({behavior:'smooth'});},100);
}

function crmShare(id){
  const c=crmGet().find(x=>x.id===id);
  if(!c) return;
  const txt=''+c.fullName+'\n کد ملی: '+c.national+'\n موبایل: '+c.mobile+'\n شغل: '+(c.job||'-')+'\n سن: '+(c.age||'-')+'\n دسته: '+(CRM_CATS.find(x=>x.id===c.cat)||{}).l+'\n آیدی‌ها: '+(c.appIds||'-')+'\n آدرس: '+(c.address||'-')+'\n ثبت: '+crmNow();
  if(navigator.share){
    navigator.share({title:'مشتری '+c.fullName, text:txt}).catch(()=>copyText(txt).then(()=>toast('کپی شد','copy')));
  }else{
    copyText(txt).then(ok=>toast(ok?'متن مشتری کپی شد ✓':'کپی دستی','share'));
  }
}

function crmGallerySave(id){
  const c=crmGet().find(x=>x.id===id);
  if(!c) return;
  // generate canvas card
  const W=1080,H=1350;
  const canvas=document.createElement('canvas');
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  // background gradient
  const grad=ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0,'#0a1424'); grad.addColorStop(1,'#13253f');
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
  // gold glow
  const rg=ctx.createRadialGradient(W*0.5, H*0.15, 0, W*0.5, H*0.15, W*0.8);
  rg.addColorStop(0,'rgba(240,199,94,.22)'); rg.addColorStop(1,'transparent');
  ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
  // card
  ctx.fillStyle='rgba(255,255,255,.06)'; ctx.strokeStyle='rgba(148,180,224,.18)';
  const cardX=40, cardY=40, cardW=W-80, cardH=H-80;
  ctx.beginPath(); 
  const r=36;
  ctx.moveTo(cardX+r, cardY); ctx.lineTo(cardX+cardW-r, cardY); ctx.quadraticCurveTo(cardX+cardW, cardY, cardX+cardW, cardY+r);
  ctx.lineTo(cardX+cardW, cardY+cardH-r); ctx.quadraticCurveTo(cardX+cardW, cardY+cardH, cardX+cardW-r, cardY+cardH);
  ctx.lineTo(cardX+r, cardY+cardH); ctx.quadraticCurveTo(cardX, cardY+cardH, cardX, cardY+cardH-r);
  ctx.lineTo(cardX, cardY+r); ctx.quadraticCurveTo(cardX, cardY, cardX+r, cardY);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // header
  ctx.fillStyle='#f0c75e'; ctx.font='900 64px Vazirmatn'; ctx.textAlign='center';
  ctx.fillText('کافی‌نت نت‌یار', W/2, 160);
  ctx.fillStyle='rgba(234,241,251,.7)'; ctx.font='600 32px Vazirmatn';
  ctx.fillText('کارت مشتری — '+ (CRM_CATS.find(x=>x.id===c.cat)||{}).l, W/2, 220);
  // avatar circle
  ctx.beginPath(); ctx.arc(W/2, 340, 110, 0, Math.PI*2);
  const ag=ctx.createLinearGradient(W/2-110,230,W/2+110,450);
  ag.addColorStop(0,'#2e6cb8'); ag.addColorStop(1,'#d9ae3e');
  ctx.fillStyle=ag; ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='900 90px Vazirmatn'; ctx.fillText((c.fullName||'?')[0], W/2, 375);
  // name
  ctx.fillStyle='#fff'; ctx.font='900 56px Vazirmatn'; ctx.fillText(c.fullName, W/2, 540);
  // details
  ctx.textAlign='right'; ctx.font='700 36px Vazirmatn';
  let y=640;
  const line=(label,val)=>{
    ctx.fillStyle='rgba(169,186,212,.7)'; ctx.fillText(label+': ', W-80, y);
    const w=ctx.measureText(label+': ').width;
    ctx.fillStyle='#eaf1fb'; ctx.fillText(val||'-', W-80-w, y);
    y+=64;
  };
  line('کد ملی', c.national);
  line('موبایل', c.mobile);
  line('سن', c.age?String(c.age):'-');
  line('شغل', c.job||'-');
  line('دسته', (CRM_CATS.find(x=>x.id===c.cat)||{}).l);
  line('آیدی‌ها', c.appIds||'-');
  // address multiline
  ctx.fillStyle='rgba(169,186,212,.7)'; ctx.fillText('آدرس: ', W-80, y);
  y+=10;
  ctx.fillStyle='#eaf1fb'; ctx.font='600 30px Vazirmatn';
  const addr=c.address||'-';
  // wrap
  const words=addr.split(' ');
  let lineTxt=''; let lines=[];
  for(const w of words){ 
    const test=lineTxt+' '+w;
    if(ctx.measureText(test).width > cardW-120){ lines.push(lineTxt); lineTxt=w; } else lineTxt=test;
  }
  if(lineTxt) lines.push(lineTxt);
  ctx.textAlign='right';
  for(const l of lines.slice(0,3)){
    y+=46; ctx.fillText(l.trim(), W-80, y);
  }
  // date
  y+=80;
  ctx.fillStyle='rgba(100,120,155,.9)'; ctx.font='600 26px Vazirmatn'; ctx.textAlign='center';
  try{ ctx.fillText(new Date(c.createdAt).toLocaleString('fa-IR'), W/2, H-80); }catch(e){ ctx.fillText(c.createdAt, W/2, H-80); }

  // download
  const url=canvas.toDataURL('image/png');
  const a=document.createElement('a');
  a.href=url; a.download='customer-'+c.fullName.replace(/\s+/g,'-')+'.png';
  a.click();
  toast('کارت ذخیره شد در گالری (دانلود)','download');
}

function crmExport(){
  const data=JSON.stringify(crmGet(),null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='netyar-customers.json'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  toast('خروجی JSON دانلود شد','download');
}
function crmImportFile(inp){
  const file=inp.files&&inp.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const arr=JSON.parse(e.target.result);
      if(!Array.isArray(arr)) throw new Error('bad');
      // merge
      let cur=crmGet();
      const map=new Set(cur.map(x=>x.national));
      let added=0;
      for(const c of arr){
        if(c.national && !map.has(c.national)){ cur.push(c); added++; map.add(c.national); }
      }
      crmSet(cur);
      toast(faNum(added)+' مشتری وارد شد','users');
      crmRerender();
    }catch(err){ toast('فایل نامعتبر','alert'); }
  };
  reader.readAsText(file);
}

function crmRerender(){
  const body=document.querySelector('.content[data-view=\"customers\"]');
  if(!body) { render(); return; }
  body.innerHTML=crmBodyHtml();
  // focus search etc
  const qInp=document.getElementById('crmSearch');
  if(qInp){ qInp.value=CRM.q; }
}

function crmBodyHtml(){
  if(!crmIsAuth()) return crmLockHtml();
  const list=crmGet();
  const q=CRM.q.trim();
  const cat=CRM.cat;
  let filtered=list.filter(c=>{
    if(cat && c.cat!==cat) return false;
    if(!q) return true;
    const nq=norm(q);
    return norm(c.fullName).includes(nq) || norm(c.national).includes(nq) || norm(c.mobile).includes(nq) || norm(c.job||'').includes(nq) || norm(c.appIds||'').includes(nq) || norm(c.address||'').includes(nq);
  });
  // sort newest first
  filtered=filtered.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  const cats=CRM_CATS;

  return '<section class="crm-hero">'
    +'<div class="crm-hero-bg"></div><div class="crm-hero-glow g1"></div><div class="crm-hero-glow g2"></div>'
    +'<div class="crm-hero-content">'
      +'<span class="crm-badge">'+ic('users',14)+' مدیریت مشتریان کافی‌نت — '+faNum(list.length)+' مشتری</span>'
      +'<h1>مشتری‌هات رو <span class="g">حرفه‌ای</span> مدیریت کن</h1>'
      +'<p>همه چیز واقعی، تمیز، ذخیره پایدار روی دستگاه — با جستجو، دسته‌بندی، اشتراک‌گذاری و کارت گالری خوشگل. رمز ورود: ۵۵۸۵</p>'
      +'<div class="crm-hero-stats"><span>'+ic('shield-check',14)+' ذخیره محلی امن</span><span>'+ic('clock',14)+' تاریخ دقیق</span><span>'+ic('share',14)+' اشتراک فوری</span></div>'
      +'<div class="crm-hero-acts"><button class="btn gold" onclick="CRM.view=\'form\';CRM.editId=null;crmRerender();document.querySelector(\'.crm-form-card\')?.scrollIntoView({behavior:\'smooth\'})">'+ic('plus',16)+' افزودن مشتری</button><button class="btn ghost" onclick="crmExport()">'+ic('download',14)+' خروجی</button><label class="btn ghost" style="cursor:pointer">'+ic('upload',14)+' ورود<input type="file" accept=".json" style="display:none" onchange="crmImportFile(this)"></label><button class="btn ghost" onclick="crmLogout()">'+ic('lock',14)+' قفل</button></div>'
    +'</div>'
    +'<div class="crm-hero-visual"><div class="crm-stack"><div class="cs s1">'+ic('users',28)+'</div><div class="cs s2">'+ic('shield-check',24)+'</div><div class="cs s3">'+ic('crown',22)+'</div></div></div>'
  +'</section>'
  +'<div class="crm-toolbar">'
    +'<div class="crm-search"><span class="si">'+ic('search',16)+'</span><input id="crmSearch" placeholder="جستجو نام، کد ملی، موبایل، شغل..." oninput="CRM.q=this.value;crmRerender()"><span class="clear" onclick="CRM.q=\'\';crmRerender()">'+ic('x',12)+'</span></div>'
    +'<div class="crm-cats">'+cats.map(c=>'<span class="crm-cat-chip'+(CRM.cat===c.id?' on':'')+'" style="--cc:'+c.c+'" onclick="CRM.cat=CRM.cat===\''+c.id+'\'?null:\''+c.id+'\';crmRerender()">'+ic(c.i,12)+c.l+' <b>'+faNum(list.filter(x=>x.cat===c.id).length)+'</b></span>').join('')+'<span class="crm-cat-chip'+(!CRM.cat?' on':'')+'" onclick="CRM.cat=null;crmRerender()">'+ic('layers',12)+'همه <b>'+faNum(list.length)+'</b></span></div>'
  +'</div>'
  +'<div id="crmFormWrap">'+(CRM.view==='form' || CRM.editId ? crmFormHtml(CRM.editId ? list.find(x=>x.id===CRM.editId) : null) : '')+'</div>'
  +(filtered.length
    ?'<div class="crm-grid">'+filtered.map((c,i)=>crmCard(c,i)).join('')+'</div>'
    :'<div class="empty"><span class="e-ic">'+ic('users',32)+'</span><h3>مشتری‌ای پیدا نشد</h3><p>'+(q||cat?'فیلتر را عوض کن یا جستجوی دیگری بزن':'هنوز مشتری اضافه نکردی — دکمه افزودن را بزن و اولین مشتری کافی‌نت رو ثبت کن!')+'</p></div>')
  +footHtml();
}

function crmCard(c,i){
  const cat=CRM_CATS.find(x=>x.id===c.cat)||CRM_CATS[0];
  const dateTxt=(()=>{try{return new Date(c.createdAt).toLocaleDateString('fa-IR')+' — '+new Date(c.createdAt).toLocaleTimeString('fa-IR');}catch(e){return c.createdAt;}})();
  return '<div class="crm-card reveal" style="--cc:'+cat.c+';transition-delay:'+Math.min(i*40,400)+'ms">'
    +'<div class="crm-card-head">'
      +'<span class="crm-av" style="--cc:'+cat.c+'">'+ic(cat.i,18)+'</span>'
      +'<div class="crm-meta"><div class="crm-name">'+esc(c.fullName)+'</div><div class="crm-sub">'+ic('hash',10)+esc(c.national)+' · '+ic('smartphone',10)+esc(c.mobile)+'</div></div>'
      +'<span class="crm-cat-badge" style="--cc:'+cat.c+'">'+ic(cat.i,10)+cat.l+'</span>'
    +'</div>'
    +'<div class="crm-card-body">'
      +'<div class="crm-row"><span>'+ic('briefcase',12)+' شغل</span><b>'+esc(c.job||'—')+'</b></div>'
      +'<div class="crm-row"><span>'+ic('clock',12)+' سن</span><b>'+(c.age?faNum(c.age):'—')+'</b></div>'
      +'<div class="crm-row"><span>'+ic('message',12)+' آیدی‌ها</span><b class="ltr">'+esc(c.appIds||'—')+'</b></div>'
      +'<div class="crm-row wide"><span>'+ic('home',12)+' آدرس</span><b>'+esc(c.address||'—')+'</b></div>'
      +'<div class="crm-date">'+ic('clock',11)+dateTxt+'</div>'
    +'</div>'
    +'<div class="crm-card-acts">'
      +'<button class="btn ghost sm" onclick="crmShare(\''+c.id+'\')">'+ic('share',12)+' اشتراک</button>'
      +'<button class="btn ghost sm" onclick="crmGallerySave(\''+c.id+'\')">'+ic('download',12)+' گالری</button>'
      +'<button class="btn ghost sm" onclick="crmEdit(\''+c.id+'\')">'+ic('edit',12)+' ویرایش</button>'
      +'<button class="btn ghost sm danger" onclick="crmDel(\''+c.id+'\')">'+ic('trash',12)+' حذف</button>'
    +'</div>'
  +'</div>';
}

function vCustomers(){ return crmBodyHtml(); }

// expose globals
window.crmTryPass=crmTryPass;
window.crmLogout=crmLogout;
window.crmPickCat=crmPickCat;
window.crmSave=crmSave;
window.crmCancelEdit=crmCancelEdit;
window.crmDel=crmDel;
window.crmEdit=crmEdit;
window.crmShare=crmShare;
window.crmGallerySave=crmGallerySave;
window.crmExport=crmExport;
window.crmImportFile=crmImportFile;
window.crmRerender=crmRerender;
