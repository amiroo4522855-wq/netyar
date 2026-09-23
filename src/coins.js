/* ================================================================
   اقتصاد سکه — کافی‌نت نت‌یار
   سکه از بازی‌ها + فروشگاه اسکین شطرنج + آیتم‌های من
   ================================================================ */
'use strict';

const COIN_KEY='netyar_coins';
const SHOP_OWNED_KEY='netyar_shop_owned';
const CHESS_SKIN_KEY='netyar_chess_skin';

const CHESS_SKINS=[
  {id:'classic', name:'کلاسیک آبی', desc:'آبی سرمه‌ای استاندارد کافی‌نت', price:0, light:'#c8d4e8', dark:'#46598a', owned:true, badge:'پیش‌فرض', icon:'♔'},
  {id:'wood', name:'چوب گردو', desc:'گرمای چوب طبیعی با کنتراست بالا', price:60, light:'#f0d9b5', dark:'#b58863', badge:'چوبی', icon:'♜'},
  {id:'gold', name:'طلایی لوکس', desc:'طلایی سلطنتی با سایه‌های پرمیوم', price:140, light:'#ffe9a8', dark:'#9a7a2a', badge:'لوکس', icon:'✦'},
  {id:'neon', name:'نئون شب', desc:'تیره نئونی با درخشش آبی', price:95, light:'#2a3a5a', dark:'#0d1a30', badge:'نئون', icon:'◍'},
  {id:'forest', name:'جنگل سبز', desc:'سبز آرامش‌بخش جنگلی', price:80, light:'#d9e8c8', dark:'#4a7a4a', badge:'طبیعت', icon:'♗'},
  {id:'rose', name:'رز صورتی', desc:'صورتی رز با حس لطیف', price:70, light:'#f8d8e0', dark:'#a85a6a', badge:'رز', icon:'♕'},
  {id:'midnight', name:'نیمه‌شب', desc:'مشکی مات پرمیوم برای گیمرهای حرفه‌ای', price:110, light:'#3a3a5a', dark:'#16161e', badge:'تاریک', icon:'♚'},
  {id:'sand', name:'صحرا', desc:'شنی گرم الهام از کویر ایران', price:65, light:'#f5e6c8', dark:'#c9a86a', badge:'کویر', icon:'♞'},
  {id:'ocean', name:'اقیانوس', desc:'آبی اقیانوسی عمیق و شفاف', price:85, light:'#a8d8f0', dark:'#2a6a9a', badge:'اقیانوس', icon:'♖'},
  {id:'cherry', name:'آلبالویی', desc:'قرمز آلبالویی شیک', price:75, light:'#f0c8c8', dark:'#8a3a4a', badge:'آلبالو', icon:'♝'},
];

function coinGet(){ return store.get(COIN_KEY, 120); } // start with 120 to test
function coinSet(v){ store.set(COIN_KEY, Math.max(0, Math.floor(v))); }
function coinAdd(amount, reason){
  if(!amount || amount<=0) return coinGet();
  const cur=coinGet();
  const next=cur+amount;
  coinSet(next);
  // toast with animation
  if(reason){
    toast('+'+faNum(amount)+' سکه — '+reason, 'coins');
  }else{
    toast('+'+faNum(amount)+' سکه', 'coins');
  }
  try{
    // coin pop effect if exists
    const el=document.getElementById('coinBalance');
    if(el){ el.classList.add('pop'); setTimeout(()=>el.classList.remove('pop'),400); el.textContent=faNum(next); }
    const el2=document.getElementById('coinBalShop');
    if(el2){ el2.textContent=faNum(next); }
  }catch(e){}
  try{gSfx('win');}catch(e){}
  return next;
}
function coinSpend(amount){
  const cur=coinGet();
  if(cur < amount) return false;
  coinSet(cur-amount);
  try{
    const el=document.getElementById('coinBalance');
    if(el){ el.textContent=faNum(cur-amount); }
    const el2=document.getElementById('coinBalShop');
    if(el2){ el2.textContent=faNum(cur-amount); }
  }catch(e){}
  return true;
}

function shopOwnedGet(){
  let owned=store.get(SHOP_OWNED_KEY, null);
  if(!owned){
    // default: classic owned
    owned=['classic'];
    store.set(SHOP_OWNED_KEY, owned);
  }
  return owned;
}
function shopOwnedSet(arr){ store.set(SHOP_OWNED_KEY, arr); }
function isOwned(id){ return shopOwnedGet().includes(id); }

function chessSkinGet(){ return store.get(CHESS_SKIN_KEY, 'classic'); }
function chessSkinSet(id){ store.set(CHESS_SKIN_KEY, id); }

function buySkin(id){
  const skin=CHESS_SKINS.find(s=>s.id===id);
  if(!skin){ toast('اسکین پیدا نشد','alert'); return; }
  if(isOwned(id)){ toast('این اسکین رو قبلا خریدی','info'); selectSkin(id); return; }
  if(!coinSpend(skin.price)){
    toast('سکه کم داری! برو بازی کن تا سکه جمع کنی','coins');
    try{gSfx('bad');}catch(e){}
    return;
  }
  const owned=shopOwnedGet();
  owned.push(id);
  shopOwnedSet(owned);
  toast('خرید شد ✓ '+skin.name+' — حالا می‌تونی انتخابش کنی','shopping-bag');
  try{gSfx('win');}catch(e){}
  // re-render shop if open
  if(typeof shopRerender==='function') shopRerender();
}

function selectSkin(id){
  if(!isOwned(id)){ toast('اول باید بخریش!','alert'); return; }
  chessSkinSet(id);
  toast('اسکین '+ (CHESS_SKINS.find(s=>s.id===id)||{}).name +' فعال شد ✓','palette');
  // apply to chess board if exists
  applyChessSkin();
  if(typeof shopRerender==='function') shopRerender();
}

function applyChessSkin(){
  const skinId=chessSkinGet();
  const skin=CHESS_SKINS.find(s=>s.id===skinId) || CHESS_SKINS[0];
  // inject style
  let styleEl=document.getElementById('chessSkinStyle');
  if(!styleEl){
    styleEl=document.createElement('style');
    styleEl.id='chessSkinStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent=
    '.chs-c.l{background:'+skin.light+'!important}'+
    '.chs-c.d{background:'+skin.dark+'!important}'+
    (skin.pieceW ? '.chs-p.w{color:'+skin.pieceW+'!important}' : '')+
    (skin.pieceB ? '.chs-p.b{color:'+skin.pieceB+'!important}' : '');
}

// shop render helper
function shopRerender(){
  const wrap=document.querySelector('.content[data-view="shop"]');
  if(wrap){
    wrap.innerHTML=vShopFull();
  }
}

// expose
window.coinGet=coinGet;
window.coinAdd=coinAdd;
window.coinSpend=coinSpend;
window.buySkin=buySkin;
window.selectSkin=selectSkin;
window.applyChessSkin=applyChessSkin;
window.shopRerender=shopRerender;
window.CHESS_SKINS=CHESS_SKINS;
window.isOwned=isOwned;
window.shopOwnedGet=shopOwnedGet;

// improved shop view
function vShopFull(){
  const coins=coinGet();
  const owned=shopOwnedGet();
  const active=chessSkinGet();
  // hero
  return '<section class="shop-hero-premium">'
    +'<div class="shop-hero-bg"></div><div class="shop-hero-glow g1"></div><div class="shop-hero-glow g2"></div>'
    +'<div class="shop-hero-content">'
      +'<span class="shop-badge">'+ic('shopping-bag',14)+' فروشگاه پرمیوم نت‌یار — '+faNum(coins)+' سکه داری</span>'
      +'<h1>با سکه‌هات <span class="g">تخته شطرنج</span> خاص بخر</h1>'
      +'<p>هر برد در بازی‌های <b>حاج عباس، انگری بردز، دوز، ۲۰۴۸، حافظه، فلپی و...</b> بهت سکه میده. سکه‌ها رو اینجا خرج کن و تخته شطرنجتو شیک کن — همه واقعی و ذخیره پایدار.</p>'
      +'<div class="shop-stats"><span>'+ic('coins',12)+' موجودی: <b id="coinBalShop">'+faNum(coins)+'</b> سکه</span><span>'+ic('palette',12)+' '+faNum(CHESS_SKINS.length)+' اسکین</span><span>'+ic('check-circle',12)+' '+faNum(owned.length)+' خریداری شده</span></div>'
      +'<div class="shop-hero-acts"><button class="btn gold" onclick="document.getElementById(\'shopSkins\').scrollIntoView({behavior:\'smooth\'})">'+ic('shopping-bag',16)+' ورود به فروشگاه</button><button class="btn ghost" onclick="goView(\'games\')">'+ic('gamepad',14)+' بازی و جمع سکه</button></div>'
    +'</div>'
    +'<div class="shop-visual-premium"><div class="shop-cover-svg">'+gcov('shop','',0)+'</div><div class="shop-coin-float">'+ic('coins',20)+'<b>'+faNum(coins)+'</b></div></div>'
  +'</section>'
  +'<div class="sec-head"><span class="sq">'+ic('palette',16)+'</span><h2>اسکین‌های شطرنج</h2><span class="mini">انتخاب کن، بخر، اعمال کن</span><span class="ln"></span></div>'
  +'<div id="shopSkins" class="shop-skins-grid">'+CHESS_SKINS.map(s=>{
    const ow=isOwned(s.id);
    const isActive=active===s.id;
    return '<div class="shop-skin-card'+(ow?' owned':'')+(isActive?' active':'')+'" style="--cl:'+s.light+';--cd:'+s.dark+'">'
      +'<div class="ssk-preview"><div class="ssk-board"><div class="ssk-c l"></div><div class="ssk-c d"></div><div class="ssk-c d"></div><div class="ssk-c l"></div></div><span class="ssk-icon">'+s.icon+'</span>'+(isActive?'<span class="ssk-active">'+ic('check',12)+' فعال</span>':'')+'</div>'
      +'<div class="ssk-info"><div class="ssk-name">'+s.name+' <span class="ssk-badge">'+s.badge+'</span></div><div class="ssk-desc">'+s.desc+'</div><div class="ssk-price">'+(ow?'<span class="owned">'+ic('check-circle',12)+' خریده شده</span>':'<span>'+ic('coins',12)+faNum(s.price)+' سکه</span>')+'</div></div>'
      +'<div class="ssk-acts">'+(ow
        ? (isActive ? '<button class="btn ghost sm" disabled>'+ic('check',12)+' همین الان فعاله</button>' : '<button class="btn gold sm" onclick="selectSkin(\''+s.id+'\')">'+ic('palette',12)+' انتخاب</button>')
        : '<button class="btn gold sm" onclick="buySkin(\''+s.id+'\')">'+ic('shopping-bag',12)+' خرید</button>')+'</div>'
    +'</div>';
  }).join('')+'</div>'
  +'<div class="sec-head"><span class="sq blue">'+ic('layers',16)+'</span><h2>آیتم‌های من</h2><span class="mini">اسکین‌های خریداری شده</span><span class="ln"></span></div>'
  +'<div class="my-items-grid">'+(owned.length?owned.map(id=>{
    const s=CHESS_SKINS.find(x=>x.id===id)||CHESS_SKINS[0];
    const isActive=active===id;
    return '<div class="my-item-card'+(isActive?' active':'')+'" style="--cl:'+s.light+';--cd:'+s.dark+'"><div class="my-board"><div class="ssk-c l"></div><div class="ssk-c d"></div></div><div class="my-info"><b>'+s.name+'</b><span>'+s.badge+'</span></div><button class="btn '+(isActive?'ghost':'gold')+' sm" '+(isActive?'disabled':'onclick="selectSkin(\''+id+'\')"')+'>'+(isActive?ic('check',12)+' فعال':ic('palette',12)+' اعمال')+'</button></div>';
  }).join('') : '<div class="empty small"><span class="e-ic">'+ic('shopping-bag',22)+'</span><p>هنوز چیزی نخریدی — برو اسکین بخر!</p></div>')+'</div>'
  +'<div class="shop-earn">'
    +'<h3>'+ic('trophy',16)+' چطور سکه جمع کنم؟</h3>'
    +'<div class="earn-grid">'
      +'<div class="earn-card">'+ic('type',18)+'<b>حاج عباس</b><span>هر کلمه درست +۵ سکه، هر مرحله +۳۰</span></div>'
      +'<div class="earn-card">'+ic('zap',18)+'<b>انگری بردز</b><span>هر برد +۲۰ سکه، ستاره اضافه +۱۰</span></div>'
      +'<div class="earn-card">'+ic('grid3x3',18)+'<b>دوز و ۲۰۴۸</b><span>برد +۱۵ سکه، رکورد جدید +۲۵</span></div>'
      +'<div class="earn-card">'+ic('brain',18)+'<b>حافظه و پازل</b><span>حل کردن +۱۰ تا +۲۰ سکه</span></div>'
    +'</div>'
  +'</div>'
  +footHtml();
}

// legacy vShop placeholder for old code path (will be overridden)
function vShop(){ return vShopFull(); }

// coin balance in topbar
function coinBalanceHtml(){ return '<span class="coin-pill" id="coinBalanceWrap">'+ic('coins',12)+'<b id="coinBalance">'+faNum(coinGet())+'</b></span>'; }
