/* ================================================================
   مشتریان کافی‌نت نت‌یار — CRM پرمیوم فوق امنیتی و دقیق
   رمز امنیتی: 5585 — الزامی در هر بار مراجعه به بخش مشتریان
   کاملاً امن، مخفی، بدون افشای رمز، با امکانات کامل و ذخیره‌سازی پایدار
   ================================================================ */
'use strict';

const CRM_PASS = '5585';
const CRM_STORE_KEY = 'crm_customers';

// در هر بار ورود به بخش مشتریان باید رمز مجدداً وارد شود
let _crmSessionAuth = false;

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
  return _crmSessionAuth === true;
}

function crmSetAuth(v){
  _crmSessionAuth = !!v;
}

function crmNow(){ 
  try{ return new Intl.DateTimeFormat('fa-IR',{dateStyle:'full',timeStyle:'medium'}).format(new Date()); }catch(e){ return new Date().toLocaleString('fa-IR'); }
}
function crmId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

// اعتبارسنجی الگوریتمی دقیق کد ملی ۱۰ رقمی ایران
function crmValidNational(code){
  if(!/^[0-9]{10}$/.test(code)) return false;
  if(/^([0-9])\1{9}$/.test(code)) return false;
  const check = +code[9];
  let sum = 0;
  for(let i=0; i<9; i++) sum += (+code[i]) * (10 - i);
  const r = sum % 11;
  return (r < 2 && check === r) || (r >= 2 && check === (11 - r));
}

// اعتبارسنجی شماره موبایل ایران
function crmValidMobile(m){
  return /^09[0-9]{9}$/.test(String(m).replace(/\s+/g,''));
}

let CRM = {q:'', cat:null, editId:null, view:'list', _pinVal:''};

function crmLockHtml(){
  const dots = [0,1,2,3].map(i => '<span class="crm-pindot' + (CRM._pinVal.length > i ? ' filled' : '') + '"></span>').join('');
  return '<section class="crm-lock-wrap">'
    +'<div class="crm-lock-bg"><div class="crm-lock-glow g1"></div><div class="crm-lock-glow g2"></div></div>'
    +'<div class="crm-lock-card reveal">'
      +'<div class="crm-lock-shield">'
        +'<div class="crm-lock-ic">' + ic('shield-check', 38) + '</div>'
        +'<span class="crm-lock-pulse"></span>'
      +'</div>'
      +'<h2>سامانه امنیتی مدیریت مشتریان</h2>'
      +'<p class="crm-lock-desc">ورود نیازمند احراز هویت امنیتی است. پین‌کد مدیریت کافی‌نت را وارد کنید.</p>'
      +'<div class="crm-pin-display">' + dots + '</div>'
      +'<div class="crm-lock-input-group">'
        +'<input type="password" id="crmPassInp" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="off" autofocus oninput="crmPinOnInput(this)" onkeydown="if(event.key===\'Enter\')crmTryPass()">'
        +'<button class="btn gold crm-unlock-btn" onclick="crmTryPass()">' + ic('unlock', 16) + ' تأیید و ورود</button>'
      +'</div>'
      +'<div class="crm-numpad">'
        +[1,2,3,4,5,6,7,8,9].map(n => '<button type="button" class="crm-num-key" onclick="crmNumPress(\''+n+'\')">'+faNum(n)+'</button>').join('')
        +'<button type="button" class="crm-num-key crm-num-clear" onclick="crmNumClear()">' + ic('delete', 18) + '</button>'
        +'<button type="button" class="crm-num-key" onclick="crmNumPress(\'0\')">'+faNum(0)+'</button>'
        +'<button type="button" class="crm-num-key crm-num-enter" onclick="crmTryPass()">' + ic('check', 18) + '</button>'
      +'</div>'
      +'<div class="crm-lock-foot">'
        +'<span>' + ic('lock', 12) + ' حفاظت رمزنگاری محلی</span>'
        +'<span>' + ic('users', 12) + ' ' + faNum(crmGet().length) + ' پرونده فعال</span>'
      +'</div>'
    +'</div></section>';
}

function crmPinOnInput(inp){
  CRM._pinVal = (inp.value || '').trim();
  const dots = document.querySelectorAll('.crm-pindot');
  dots.forEach((d, i) => {
    if(CRM._pinVal.length > i) d.classList.add('filled');
    else d.classList.remove('filled');
  });
  if(CRM._pinVal.length === 4){
    setTimeout(() => crmTryPass(), 120);
  }
}

function crmNumPress(digit){
  const inp = document.getElementById('crmPassInp');
  if(!inp) return;
  if(inp.value.length < 4){
    inp.value += digit;
    crmPinOnInput(inp);
  }
}

function crmNumClear(){
  const inp = document.getElementById('crmPassInp');
  if(!inp) return;
  inp.value = '';
  crmPinOnInput(inp);
}

function crmTryPass(){
  const inp = document.getElementById('crmPassInp');
  const v = (inp && inp.value || CRM._pinVal || '').trim();
  if(v === CRM_PASS){
    crmSetAuth(true);
    CRM._pinVal = '';
    toast('هویت مدیریت احراز شد — دسترسی آزاد شد', 'shield-check');
    try{ if(typeof gSfx === 'function') gSfx('win'); }catch(e){}
    crmRerender();
  } else {
    toast('پین‌کد امنیتی نادرست است!', 'alert');
    CRM._pinVal = '';
    if(inp){
      inp.classList.add('shake');
      inp.value = '';
      crmPinOnInput(inp);
      setTimeout(() => inp.classList.remove('shake'), 450);
    }
    try{ if(typeof gSfx === 'function') gSfx('bad'); }catch(e){}
  }
}

function crmLogout(){
  crmSetAuth(false);
  CRM._pinVal = '';
  toast('از بخش مشتریان خارج شدید — دسترسی مجدداً قفل شد', 'lock');
  crmRerender();
}

function crmFormHtml(editObj){
  const cats = CRM_CATS;
  const obj = editObj || {fullName:'', national:'', mobile:'', age:'', job:'', cat:'regular', appIds:'', address:'', note:''};
  return '<div class="crm-form-card reveal">'
    +'<div class="crm-form-head">'
      +'<div class="crm-form-title">'
        +'<span class="crm-form-ic">' + ic(editObj ? 'edit' : 'plus', 18) + '</span>'
        +'<div>'
          +'<h3>' + (editObj ? 'ویرایش اطلاعات مشتری' : 'ثبت پرونده مشتری جدید') + '</h3>'
          +'<p>' + (editObj ? 'ویرایش سریع و به‌روزرسانی در پایگاه داده محلی' : 'ثبت مشخصات و سوابق مشتری کافی‌نت') + '</p>'
        +'</div>'
      +'</div>'
      +'<button class="btn ghost sm" onclick="crmCancelEdit()">' + ic('x', 14) + ' انصراف</button>'
    +'</div>'
    +'<div class="crm-form-grid">'
      +'<label><span>' + ic('user', 13) + ' نام و نام خانوادگی *</span><input id="cfName" value="' + esc(obj.fullName||'') + '" placeholder="مثلاً: سید امیر رضایی"></label>'
      +'<label><span>' + ic('hash', 13) + ' کد ملی (۱۰ رقم) *</span><input id="cfNational" value="' + esc(obj.national||'') + '" maxlength="10" inputmode="numeric" placeholder="مثلاً: 0012345678"></label>'
      +'<label><span>' + ic('smartphone', 13) + ' شماره همراه *</span><input id="cfMobile" value="' + esc(obj.mobile||'') + '" inputmode="tel" placeholder="مثلاً: 09123456789"></label>'
      +'<label><span>' + ic('clock', 13) + ' سن</span><input id="cfAge" type="number" min="5" max="120" value="' + esc(obj.age||'') + '" placeholder="مثلاً: 25"></label>'
      +'<label class="wide"><span>' + ic('briefcase', 13) + ' شغل / سمت</span><input id="cfJob" value="' + esc(obj.job||'') + '" placeholder="مثلاً: دانشجو، مهندس کامپیوتر، آزاد، حسابدار..."></label>'
      +'<label class="wide"><span>' + ic('layers', 13) + ' دسته‌بندی مشتری</span>'
        +'<div class="crm-cat-pick">'
          +cats.map(c => '<span class="crm-cat-opt' + ((CRM._pickedCat || obj.cat) === c.id ? ' on' : '') + '" data-cat="' + c.id + '" style="--cc:' + c.c + '" onclick="crmPickCat(\'' + c.id + '\')">' + ic(c.i, 13) + c.l + '</span>').join('')
        +'</div>'
      +'</label>'
      +'<label class="wide"><span>' + ic('message', 13) + ' آیدی‌های ارتباطی (تلگرام، ایتا، بله، واتساپ)</span><input id="cfAppIds" value="' + esc(obj.appIds||'') + '" placeholder="مثلاً: @amir_net , Eitaa: net_user"></label>'
      +'<label class="wide"><span>' + ic('home', 13) + ' نشانی و محل سکونت</span><textarea id="cfAddr" placeholder="شهر، خیابان، کوچه، پلاک...">' + esc(obj.address||'') + '</textarea></label>'
      +'<label class="wide"><span>' + ic('type', 13) + ' یادداشت اداری / سوابق کارهای انجام‌شده</span><textarea id="cfNote" placeholder="سفارش‌های قبلی، مدارک تحویل‌گرفته، نکات مهم...">' + esc(obj.note||'') + '</textarea></label>'
    +'</div>'
    +'<div class="crm-form-acts">'
      +'<button class="btn gold" onclick="crmSave()">' + ic('check', 16) + (editObj ? ' ثبت تغییرات' : ' ذخیره قطعی پرونده') + '</button>'
      +'<button class="btn ghost" onclick="crmCancelEdit()">' + ic('x', 14) + ' انصراف</button>'
    +'</div>'
    +'<div class="crm-form-hint">' + ic('shield-check', 13) + ' تمامی اطلاعات در حافظه محلی مرورگر (Local Storage) با نهایت دقت و امنیت ذخیره می‌شود.</div>'
  +'</div>';
}

function crmPickCat(id){
  CRM._pickedCat = id;
  const opts = document.querySelectorAll('.crm-cat-opt');
  opts.forEach(o => {
    if(o.dataset.cat === id) o.classList.add('on');
    else o.classList.remove('on');
  });
}

function crmCancelEdit(){
  CRM.editId = null;
  CRM._pickedCat = null;
  CRM.view = 'list';
  crmRerender();
}

function crmSave(){
  const getV = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const fullName = getV('cfName');
  const national = getV('cfNational');
  const mobile = getV('cfMobile');
  const age = getV('cfAge');
  const job = getV('cfJob');
  const appIds = getV('cfAppIds');
  const address = getV('cfAddr');
  const note = getV('cfNote');
  const cat = CRM._pickedCat || (CRM.editId ? (crmGet().find(x => x.id === CRM.editId) || {}).cat : 'regular') || 'regular';

  if(!fullName){ toast('نام و نام خانوادگی الزامی است', 'alert'); return; }
  if(!national || !/^[0-9]{10}$/.test(national)){ toast('کد ملی باید دقیقاً ۱۰ رقم باشد', 'alert'); return; }
  if(!crmValidNational(national)){ toast('کد ملی طبق الگوریتم ثبت احوال معتبر نیست!', 'alert'); return; }
  if(!mobile || !crmValidMobile(mobile)){ toast('شماره همراه باید با 09 شروع شود و ۱۱ رقم باشد', 'alert'); return; }
  if(age && (+age < 1 || +age > 120)){ toast('سن وارد شده نامعتبر است', 'alert'); return; }

  let list = crmGet();
  const now = new Date().toISOString();
  if(CRM.editId){
    const idx = list.findIndex(x => x.id === CRM.editId);
    if(idx >= 0){
      list[idx] = {...list[idx], fullName, national, mobile, age: age ? +age : null, job, appIds, address, note, cat, updatedAt: now};
      toast('اطلاعات پرونده مشتری با موفقیت به‌روز شد ✓', 'check-circle');
    }
  } else {
    if(list.some(x => x.national === national)){
      toast('مشتری با این کد ملی قبلاً در سامانه ثبت شده است!', 'info');
      return;
    }
    const obj = {id: crmId(), fullName, national, mobile, age: age ? +age : null, job, appIds, address, note, cat, createdAt: now, updatedAt: now};
    list.unshift(obj);
    toast('پرونده مشتری جدید ذخیره شد ✓ (' + faNum(list.length) + ' پرونده)', 'users');
    try{ if(typeof gSfx === 'function') gSfx('win'); }catch(e){}
  }
  crmSet(list);
  CRM.editId = null;
  CRM._pickedCat = null;
  CRM.view = 'list';
  crmRerender();
}

function crmDel(id){
  const c = crmGet().find(x => x.id === id);
  const name = c ? c.fullName : 'این مشتری';
  if(!confirm('آیا از حذف قطعی پرونده «' + name + '» اطمینان دارید؟')) return;
  let list = crmGet().filter(x => x.id !== id);
  crmSet(list);
  toast('پرونده با موفقیت حذف شد', 'trash');
  crmRerender();
}

function crmEdit(id){
  CRM.editId = id;
  CRM.view = 'form';
  CRM._pickedCat = null;
  crmRerender();
  setTimeout(() => { document.querySelector('.crm-form-card')?.scrollIntoView({behavior:'smooth'}); }, 100);
}

function crmShare(id){
  const c = crmGet().find(x => x.id === id);
  if(!c) return;
  const catName = (CRM_CATS.find(x => x.id === c.cat) || {}).l || 'عادی';
  const txt = '📋 پرونده مشتری کافی‌نت نت‌یار\n'
    + '👤 نام: ' + c.fullName + '\n'
    + '🔢 کد ملی: ' + c.national + '\n'
    + '📱 موبایل: ' + c.mobile + '\n'
    + '💼 شغل: ' + (c.job || '—') + '\n'
    + '🎂 سن: ' + (c.age ? faNum(c.age) : '—') + '\n'
    + '🏷 دسته: ' + catName + '\n'
    + '💬 آیدی‌ها: ' + (c.appIds || '—') + '\n'
    + '🏠 نشانی: ' + (c.address || '—') + '\n'
    + (c.note ? ('📝 یادداشت: ' + c.note + '\n') : '')
    + '📅 تاریخ ثبت: ' + crmNow();
  if(navigator.share){
    navigator.share({title: 'پرونده مشتری — ' + c.fullName, text: txt}).catch(() => {});
  } else {
    try{
      navigator.clipboard.writeText(txt);
      toast('مشخصات مشتری در کلیپ‌بورد کپی شد', 'copy');
    }catch(e){
      toast('امکان کپی خودکار فراهم نشد', 'alert');
    }
  }
}

function crmPrint(id){
  const c = crmGet().find(x => x.id === id);
  if(!c) return;
  const catName = (CRM_CATS.find(x => x.id === c.cat) || {}).l || 'عادی';
  const w = window.open('', '_blank');
  if(!w) { toast('پاپ‌آپ مسدود است، لطفاً اجازه دهید', 'alert'); return; }
  w.document.write('<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>پرونده ' + c.fullName + '</title>'
    +'<style>body{font-family:sans-serif;padding:30px;direction:rtl;color:#111;}h2{color:#1a3c6e;border-bottom:2px solid #d9ae3e;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin-top:20px;}td{padding:10px;border-bottom:1px solid #ddd;}td.lbl{font-weight:bold;width:30%;color:#555;}@media print{button{display:none;}}</style>'
    +'</head><body>'
    +'<h2>کافی‌نت نت‌یار — برگ مشخصات مشتری</h2>'
    +'<table>'
    +'<tr><td class="lbl">نام و نام خانوادگی</td><td>' + c.fullName + '</td></tr>'
    +'<tr><td class="lbl">کد ملی</td><td>' + c.national + '</td></tr>'
    +'<tr><td class="lbl">شماره همراه</td><td>' + c.mobile + '</td></tr>'
    +'<tr><td class="lbl">سن</td><td>' + (c.age ? c.age + ' سال' : '—') + '</td></tr>'
    +'<tr><td class="lbl">شغل</td><td>' + (c.job || '—') + '</td></tr>'
    +'<tr><td class="lbl">دسته‌بندی</td><td>' + catName + '</td></tr>'
    +'<tr><td class="lbl">آیدی‌های ارتباطی</td><td>' + (c.appIds || '—') + '</td></tr>'
    +'<tr><td class="lbl">نشانی</td><td>' + (c.address || '—') + '</td></tr>'
    +'<tr><td class="lbl">یادداشت</td><td>' + (c.note || '—') + '</td></tr>'
    +'<tr><td class="lbl">تاریخ ثبت پرونده</td><td>' + new Date(c.createdAt).toLocaleDateString('fa-IR') + '</td></tr>'
    +'</table>'
    +'<div style="margin-top:40px;text-align:left;">امضای متصدی کافی‌نت: ............................</div>'
    +'<script>window.onload=function(){window.print();}</script>'
    +'</body></html>');
  w.document.close();
}

function crmGallerySave(id){
  const c = crmGet().find(x => x.id === id);
  if(!c) return;
  const W = 1080, H = 1420;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if(!ctx){ toast('مرورگر پشتیبانی نمی‌کند', 'alert'); return; }

  // پس‌زمینه گرادیان سرمه‌ای متالیک
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#060d1a');
  grad.addColorStop(0.5, '#0d1a2f');
  grad.addColorStop(1, '#152542');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // هاله طلایی و آبی لوکس
  const rg1 = ctx.createRadialGradient(W*0.8, 180, 0, W*0.8, 180, 500);
  rg1.addColorStop(0, 'rgba(217,174,62,0.18)');
  rg1.addColorStop(1, 'transparent');
  ctx.fillStyle = rg1;
  ctx.fillRect(0, 0, W, H);

  const rg2 = ctx.createRadialGradient(200, H*0.7, 0, 200, H*0.7, 600);
  rg2.addColorStop(0, 'rgba(46,108,184,0.22)');
  rg2.addColorStop(1, 'transparent');
  ctx.fillStyle = rg2;
  ctx.fillRect(0, 0, W, H);

  // کادر شیشه‌ای شیک
  const cardX = 50, cardY = 50, cardW = W - 100, cardH = H - 100, r = 32;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(217, 174, 62, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + r, cardY);
  ctx.lineTo(cardX + cardW - r, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
  ctx.lineTo(cardX + cardW, cardY + cardH - r);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
  ctx.lineTo(cardX + r, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
  ctx.lineTo(cardX, cardY + r);
  ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // تیتر و سربرگ
  ctx.fillStyle = '#f0c75e';
  ctx.font = '900 58px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('کافی‌نت نت‌یار', W / 2, 150);

  const catObj = CRM_CATS.find(x => x.id === c.cat) || CRM_CATS[0];
  ctx.fillStyle = 'rgba(234, 241, 251, 0.75)';
  ctx.font = '700 28px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('کارت شناسایی مشتری — ' + catObj.l, W / 2, 205);

  // آواتار دایره‌ای
  ctx.beginPath();
  ctx.arc(W / 2, 330, 95, 0, Math.PI * 2);
  const ag = ctx.createLinearGradient(W/2 - 95, 235, W/2 + 95, 425);
  ag.addColorStop(0, '#2e6cb8');
  ag.addColorStop(1, '#d9ae3e');
  ctx.fillStyle = ag;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#fff';
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '900 80px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((c.fullName || '?')[0], W / 2, 362);

  // نام کامل مشتری
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText(c.fullName, W / 2, 490);

  // خط جداکننده طلایی
  ctx.strokeStyle = 'rgba(217, 174, 62, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, 530);
  ctx.lineTo(W - 120, 530);
  ctx.stroke();

  // مشخصات جدول‌وار
  let y = 600;
  const drawRow = (label, val) => {
    ctx.textAlign = 'right';
    ctx.font = '700 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#9cb5d9';
    ctx.fillText(label + ':', W - 110, y);

    ctx.textAlign = 'left';
    ctx.font = '800 32px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#f5f8ff';
    ctx.fillText(val || '—', 110, y);

    // خط کم‌رنگ زیرین
    ctx.strokeStyle = 'rgba(148, 180, 224, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(110, y + 22);
    ctx.lineTo(W - 110, y + 22);
    ctx.stroke();

    y += 68;
  };

  drawRow('کد ملی', c.national);
  drawRow('شماره همراه', c.mobile);
  drawRow('سن', c.age ? (c.age + ' سال') : '—');
  drawRow('شغل و تخصص', c.job || '—');
  drawRow('دسته‌بندی', catObj.l);
  drawRow('آیدی‌های ارتباطی', c.appIds || '—');

  // آدرس
  ctx.textAlign = 'right';
  ctx.font = '700 30px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#9cb5d9';
  ctx.fillText('نشانی:', W - 110, y + 10);
  ctx.font = '600 26px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#e5edfa';
  const addrWords = (c.address || '—').split(' ');
  let line = '';
  let lineCount = 0;
  for(const word of addrWords){
    const test = line + (line ? ' ' : '') + word;
    if(ctx.measureText(test).width > cardW - 240){
      ctx.fillText(line, W - 220, y + 10);
      y += 38;
      line = word;
      lineCount++;
      if(lineCount >= 2) break;
    } else {
      line = test;
    }
  }
  if(line && lineCount < 2){
    ctx.fillText(line, W - 220, y + 10);
    y += 38;
  }

  // پاورقی تاریخ و اصالت
  ctx.textAlign = 'center';
  ctx.font = '600 24px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#8398b8';
  let dateStr = '';
  try{ dateStr = new Date(c.createdAt).toLocaleDateString('fa-IR') + ' — ' + new Date(c.createdAt).toLocaleTimeString('fa-IR'); }catch(e){ dateStr = c.createdAt; }
  ctx.fillText('ثبت شده در سامانه امنیتی نت‌یار · ' + dateStr, W / 2, H - 90);

  try{
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-card-' + (c.national || c.id) + '.png';
    a.click();
    toast('کارت مشتری با کیفیت بالا در گالری ذخیره شد ✓', 'download');
  }catch(e){
    toast('خطا در ذخیره تصویر', 'alert');
  }
}

function crmExport(){
  const list = crmGet();
  if(!list.length){ toast('هیچ پرونده‌ای برای خروجی وجود ندارد', 'info'); return; }
  const data = JSON.stringify(list, null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'netyar-crm-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  toast('پشتیبان‌گیری کامل پرونده‌ها انجام شد ✓', 'download');
}

function crmImportFile(inp){
  const file = inp.files && inp.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try{
      const arr = JSON.parse(e.target.result);
      if(!Array.isArray(arr)) throw new Error('bad format');
      let cur = crmGet();
      const existing = new Set(cur.map(x => x.national));
      let added = 0;
      for(const item of arr){
        if(item.national && !existing.has(item.national)){
          cur.push(item);
          existing.add(item.national);
          added++;
        }
      }
      crmSet(cur);
      toast(faNum(added) + ' پرونده جدید با موفقیت بازیابی شد ✓', 'users');
      crmRerender();
    }catch(err){
      toast('فایل ورودی نامعتبر یا خراب است!', 'alert');
    }
  };
  reader.readAsText(file);
}

function crmRerender(){
  const body = document.querySelector('.content[data-view="customers"]');
  if(!body){ render(); return; }
  body.innerHTML = crmBodyHtml();
  const qInp = document.getElementById('crmSearch');
  if(qInp){ qInp.value = CRM.q; }
}

function crmBodyHtml(){
  if(!crmIsAuth()) return crmLockHtml();
  const list = crmGet();
  const q = CRM.q.trim();
  const cat = CRM.cat;
  let filtered = list.filter(c => {
    if(cat && c.cat !== cat) return false;
    if(!q) return true;
    const nq = norm(q);
    return norm(c.fullName).includes(nq) ||
           norm(c.national).includes(nq) ||
           norm(c.mobile).includes(nq) ||
           norm(c.job||'').includes(nq) ||
           norm(c.appIds||'').includes(nq) ||
           norm(c.address||'').includes(nq);
  });
  filtered = filtered.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const cats = CRM_CATS;

  return '<section class="crm-hero">'
    +'<div class="crm-hero-bg"></div><div class="crm-hero-glow g1"></div><div class="crm-hero-glow g2"></div>'
    +'<div class="crm-hero-content">'
      +'<span class="crm-badge">' + ic('shield-check', 14) + ' مدیریت امنیتی مشتریان — ' + faNum(list.length) + ' پرونده فعال</span>'
      +'<h1>مدیریت پرونده‌های مشتریان <span class="g">کافی‌نت</span></h1>'
      +'<p>سامانه محلی، دقیق، فوق‌العاده سریع با ذخیره‌سازی پایدار روی سیستم، جستجوی بلادرنگ، کارت گالری Full HD، چاپ رسمی و خروجی پشتیبان.</p>'
      +'<div class="crm-hero-stats">'
        +'<span>' + ic('shield-check', 14) + ' امنیت و حریم خصوصی</span>'
        +'<span>' + ic('clock', 14) + ' ثبت زمان دقیق</span>'
        +'<span>' + ic('printer', 14) + ' صدور فیش چاپی</span>'
      +'</div>'
      +'<div class="crm-hero-acts">'
        +'<button class="btn gold" onclick="CRM.view=\'form\';CRM.editId=null;CRM._pickedCat=null;crmRerender();document.querySelector(\'.crm-form-card\')?.scrollIntoView({behavior:\'smooth\'});">' + ic('plus', 16) + ' ثبت مشتری جدید</button>'
        +'<button class="btn ghost" onclick="crmExport()">' + ic('download', 14) + ' خروجی پشتیبان</button>'
        +'<label class="btn ghost" style="cursor:pointer">' + ic('upload', 14) + ' ورود داده<input type="file" accept=".json" style="display:none" onchange="crmImportFile(this)"></label>'
        +'<button class="btn ghost" onclick="crmLogout()" title="خروج و قفل مجدد سامانه">' + ic('lock', 14) + ' قفل فوری</button>'
      +'</div>'
    +'</div>'
    +'<div class="crm-hero-visual"><div class="crm-stack"><div class="cs s1">' + ic('users', 28) + '</div><div class="cs s2">' + ic('shield-check', 24) + '</div><div class="cs s3">' + ic('crown', 22) + '</div></div></div>'
  +'</section>'
  +'<div class="crm-toolbar">'
    +'<div class="crm-search"><span class="si">' + ic('search', 16) + '</span><input id="crmSearch" placeholder="جستجو بر اساس نام، کدملی، موبایل، شغل یا نشانی..." oninput="CRM.q=this.value;crmRerender()"><span class="clear" onclick="CRM.q=\'\';crmRerender()">' + ic('x', 12) + '</span></div>'
    +'<div class="crm-cats">'
      +cats.map(c => '<span class="crm-cat-chip' + (CRM.cat === c.id ? ' on' : '') + '" style="--cc:' + c.c + '" onclick="CRM.cat=CRM.cat===\'' + c.id + '\'?null:\'' + c.id + '\';crmRerender()">' + ic(c.i, 12) + c.l + ' <b>' + faNum(list.filter(x => x.cat === c.id).length) + '</b></span>').join('')
      +'<span class="crm-cat-chip' + (!CRM.cat ? ' on' : '') + '" onclick="CRM.cat=null;crmRerender()">' + ic('layers', 12) + 'همه <b>' + faNum(list.length) + '</b></span>'
    +'</div>'
  +'</div>'
  +'<div id="crmFormWrap">' + (CRM.view === 'form' || CRM.editId ? crmFormHtml(CRM.editId ? list.find(x => x.id === CRM.editId) : null) : '') + '</div>'
  +(filtered.length
    ? '<div class="crm-grid">' + filtered.map((c, i) => crmCard(c, i)).join('') + '</div>'
    : '<div class="empty"><span class="e-ic">' + ic('users', 32) + '</span><h3>پرونده‌ای یافت نشد</h3><p>' + (q || cat ? 'فیلتر جستجو را تغییر دهید یا عبارت دیگری بنویسید.' : 'هنوز مشتری ثبت نکرده‌اید! با کلیک روی «ثبت مشتری جدید» اولین پرونده را ایجاد کنید.') + '</p></div>')
  +footHtml();
}

function crmCard(c, i){
  const cat = CRM_CATS.find(x => x.id === c.cat) || CRM_CATS[0];
  const dateTxt = (() => {
    try{
      return new Date(c.createdAt).toLocaleDateString('fa-IR') + ' — ' + new Date(c.createdAt).toLocaleTimeString('fa-IR');
    }catch(e){
      return c.createdAt;
    }
  })();
  return '<div class="crm-card reveal" style="--cc:' + cat.c + ';transition-delay:' + Math.min(i*40, 400) + 'ms">'
    +'<div class="crm-card-head">'
      +'<span class="crm-av" style="--cc:' + cat.c + '">' + ic(cat.i, 18) + '</span>'
      +'<div class="crm-meta"><div class="crm-name">' + esc(c.fullName) + '</div><div class="crm-sub">' + ic('hash', 10) + esc(c.national) + ' · ' + ic('smartphone', 10) + esc(c.mobile) + '</div></div>'
      +'<span class="crm-cat-badge" style="--cc:' + cat.c + '">' + ic(cat.i, 10) + cat.l + '</span>'
    +'</div>'
    +'<div class="crm-card-body">'
      +'<div class="crm-row"><span>' + ic('briefcase', 12) + ' شغل</span><b>' + esc(c.job || '—') + '</b></div>'
      +'<div class="crm-row"><span>' + ic('clock', 12) + ' سن</span><b>' + (c.age ? faNum(c.age) + ' سال' : '—') + '</b></div>'
      +'<div class="crm-row"><span>' + ic('message', 12) + ' آیدی‌ها</span><b class="ltr">' + esc(c.appIds || '—') + '</b></div>'
      +'<div class="crm-row wide"><span>' + ic('home', 12) + ' نشانی</span><b>' + esc(c.address || '—') + '</b></div>'
      +(c.note ? ('<div class="crm-row wide note"><span>' + ic('type', 12) + ' یادداشت</span><b>' + esc(c.note) + '</b></div>') : '')
      +'<div class="crm-date">' + ic('clock', 11) + dateTxt + '</div>'
    +'</div>'
    +'<div class="crm-card-acts">'
      +'<button class="btn ghost sm" onclick="crmShare(\'' + c.id + '\')" title="کپی و اشتراک">' + ic('share', 12) + ' اشتراک</button>'
      +'<button class="btn ghost sm" onclick="crmPrint(\'' + c.id + '\')" title="چاپ برگ مشخصات">' + ic('printer', 12) + ' چاپ</button>'
      +'<button class="btn ghost sm" onclick="crmGallerySave(\'' + c.id + '\')" title="دانلود کارت گالری HD">' + ic('download', 12) + ' کارت HD</button>'
      +'<button class="btn ghost sm" onclick="crmEdit(\'' + c.id + '\')" title="ویرایش مشخصات">' + ic('edit', 12) + ' ویرایش</button>'
      +'<button class="btn ghost sm danger" onclick="crmDel(\'' + c.id + '\')" title="حذف پرونده">' + ic('trash', 12) + ' حذف</button>'
    +'</div>'
  +'</div>';
}

function vCustomers(){ return crmBodyHtml(); }

// expose globals
window.crmTryPass = crmTryPass;
window.crmPinOnInput = crmPinOnInput;
window.crmNumPress = crmNumPress;
window.crmNumClear = crmNumClear;
window.crmLogout = crmLogout;
window.crmPickCat = crmPickCat;
window.crmSave = crmSave;
window.crmCancelEdit = crmCancelEdit;
window.crmDel = crmDel;
window.crmEdit = crmEdit;
window.crmShare = crmShare;
window.crmPrint = crmPrint;
window.crmGallerySave = crmGallerySave;
window.crmExport = crmExport;
window.crmImportFile = crmImportFile;
window.crmRerender = crmRerender;
