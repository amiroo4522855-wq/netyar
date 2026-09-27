/* ================================================================
   اقتصاد سکه و فروشگاه جامع بازی‌ها — کافی‌نت نت‌یار v22.6
   شامل: اسکین شطرنج + اسکین دایناسور، مار، توربو، فلپی، ۲۰۴۸ +
   بوسترها و مصرفی‌ها + جایزه روزانه سکه
   ================================================================ */
'use strict';

const COIN_KEY='netyar_coins';
const SHOP_OWNED_KEY='netyar_shop_owned';
const CHESS_SKIN_KEY='netyar_chess_skin';
const SHOP_CAT_KEY='netyar_shop_cat';
const GAME_SKINS_KEY='netyar_game_skins';
const CONSUMABLES_KEY='netyar_consumables';
const DAILY_FREE_KEY='netyar_daily_free_claim';

const CHESS_SKINS=[
  {id:'classic', name:'کلاسیک آبی', desc:'آبی سرمه‌ای استاندارد کافی‌نت', price:0, light:'#c8d4e8', dark:'#46598a', owned:true, badge:'پیش‌فرض', icon:'♔', cat:'classic'},
  {id:'wood', name:'چوب گردو', desc:'گرمای چوب طبیعی با کنتراست بالا', price:60, light:'#f0d9b5', dark:'#b58863', badge:'چوبی', icon:'♜', cat:'classic'},
  {id:'gold', name:'طلایی لوکس', desc:'طلایی سلطنتی با سایه‌های پرمیوم', price:140, light:'#ffe9a8', dark:'#9a7a2a', badge:'لوکس', icon:'✦', cat:'lux'},
  {id:'neon', name:'نئون شب', desc:'تیره نئونی با درخشش آبی', price:95, light:'#2a3a5a', dark:'#0d1a30', badge:'نئون', icon:'◍', cat:'dark'},
  {id:'forest', name:'جنگل سبز', desc:'سبز آرامش‌بخش جنگلی', price:80, light:'#d9e8c8', dark:'#4a7a4a', badge:'طبیعت', icon:'♗', cat:'nature'},
  {id:'rose', name:'رز صورتی', desc:'صورتی رز با حس لطیف', price:70, light:'#f8d8e0', dark:'#a85a6a', badge:'رز', icon:'♕', cat:'fancy'},
  {id:'midnight', name:'نیمه‌شب', desc:'مشکی مات پرمیوم برای گیمرهای حرفه‌ای', price:110, light:'#3a3a5a', dark:'#16161e', badge:'تاریک', icon:'♚', cat:'dark'},
  {id:'ocean', name:'اقیانوس عمیق', desc:'تم فیروزه‌ای خنک با حس آب عمیق', price:85, light:'#c8e8f0', dark:'#2a6a8a', badge:'اقیانوس', icon:'♞', cat:'nature'},
  {id:'sunset', name:'غروب ارغوانی', desc:'طیف بنفش و نارنجی دراماتیک', price:100, light:'#f8d8c8', dark:'#8a3a6a', badge:'غروب', icon:'♟', cat:'fancy'},
  {id:'emerald', name:'زمرد شاهانه', desc:'سبز یشمی درخشان با رگه‌های طلایی', price:125, light:'#d0f0e0', dark:'#1a6a4a', badge:'شاهانه', icon:'❖', cat:'lux'},
];

const GAME_UPGRADE_ITEMS=[
  {id:'dino_gold', type:'skin', game:'dino', name:'دایی‌ناصر طلایی', desc:'تغییر رنگ دایناسور به طلای متالیک درخشان', price:80, color:'#ffd76e', badge:'پوسته دایی‌ناصر', icon:'zap', cat:'game_upgrades'},
  {id:'dino_night', type:'skin', game:'dino', name:'دایی‌ناصر سایبر شب', desc:'تغییر رنگ دایناسور به آبی سایان نئونی آینده', price:90, color:'#38bdf8', badge:'پوسته دایی‌ناصر', icon:'zap', cat:'game_upgrades'},
  {id:'snake_neon', type:'skin', game:'snake', name:'مار نئون زمردی', desc:'بدنه مار با خطوط درخشان سبز نئونی و نورانی', price:75, color:'#10b981', badge:'تم مار', icon:'shield', cat:'game_upgrades'},
  {id:'snake_gold', type:'skin', game:'snake', name:'مار طلای سلطنتی', desc:'بدنه متالیک تمام‌طلایی مار با جرقه‌های طلایی', price:110, color:'#f59e0b', badge:'تم مار', icon:'shield', cat:'game_upgrades'},
  {id:'turbo_fire', type:'skin', game:'turbo', name:'دونده آتشین توربو', desc:'لباس قرمز متالیک دونده با رد آتشین پرسرعت', price:95, color:'#ef4444', badge:'پوسته توربو', icon:'wind', cat:'game_upgrades'},
  {id:'turbo_gold', type:'skin', game:'turbo', name:'دونده طلای کیهانی', desc:'پوشش طلایی براق دونده با ذرات استارداست', price:130, color:'#ffd76e', badge:'پوسته توربو', icon:'wind', cat:'game_upgrades'},
  {id:'flappy_cup', type:'skin', game:'flappy', name:'پرنده کاپ طلایی', desc:'ظاهر پرنده تبدیل به عقاب طلایی جام قهرمانی می‌شود', price:85, color:'#fbbf24', badge:'پوسته فلپی', icon:'award', cat:'game_upgrades'},
  {id:'g2048_gold', type:'skin', game:'2048', name:'صفحه ۲۰۴۸ طلایی مات', desc:'استایل لوکس طلایی-مشکی برای کاشی‌های بازی ۲۰۴۸', price:90, color:'#d9ae3e', badge:'تم ۲۰۴۸', icon:'grid', cat:'game_upgrades'},
  
  // مصرفی‌ها
  {id:'revive_token', type:'consumable', name:'فرصت ادامه پس از باخت (۱ بار)', desc:'هنگام باخت در بازی‌ها یک شانس دوباره بدون باختن رکورد می‌دهد', price:50, badge:'مصرفی تک‌بار', icon:'rotate-ccw', cat:'consumables'},
  {id:'double_coin_10m', type:'consumable', name:'دو برابر سکه (۱۰ دقیقه)', desc:'به مدت ۱۰ دقیقه هر امتیازی که بگیری سکه دوبل دریافت می‌کنی!', price:65, badge:'بوستر ۱۰ دقیقه‌ای', icon:'sparkles', cat:'consumables'}
];

const SHOP_CATS=[
  {id:'all', l:'همه آیتم‌ها', i:'layers', c:'#d9ae3e'},
  {id:'game_upgrades', l:'ارتقای بازی‌ها', i:'gamepad', c:'#0284c7'},
  {id:'consumables', l:'بوسترها و شانس مجدد', i:'zap', c:'#ec4899'},
  {id:'classic', l:'شطرنج کلاسیک', i:'book-open', c:'#4c8ddb'},
  {id:'lux', l:'شطرنج لوکس طلایی', i:'crown', c:'#d9ae3e'},
  {id:'dark', l:'شطرنج تاریک و نئون', i:'shield', c:'#7c8da6'},
  {id:'nature', l:'شطرنج طبیعت و فانتزی', i:'heart-pulse', c:'#4fa98c'},
];

function coinGet(){ return store.get(COIN_KEY, 120); }
function coinSet(v){
  const n = Math.max(0, Math.floor(v));
  store.set(COIN_KEY, n);
  syncAllCoinDisplays(n);
}

function syncAllCoinDisplays(n){
  const numStr = faNum(n);
  document.querySelectorAll('#coinBalance, #coinBalShop, .hdr-coin-val').forEach(el=>{
    el.textContent = numStr;
  });
}

function coinAdd(amount, reason){
  if(!amount || amount<=0) return coinGet();
  let finalAmount = amount;
  if(isDoubleCoinActive()){
    finalAmount *= 2;
    reason = (reason ? reason + ' ' : '') + '(بوستر ۲ برابر فعال است!)';
  }
  const cur=coinGet();
  const next=cur+finalAmount;
  coinSet(next);
  if(reason){ toast('+'+faNum(finalAmount)+' سکه — '+reason, 'coins'); }else{ toast('+'+faNum(finalAmount)+' سکه', 'coins'); }
  try{
    const flyWrap = document.createElement('div');
    flyWrap.className = 'fly-coin-reward';
    flyWrap.innerHTML = '<span class="fcr-coin">'+ic('coins',28)+'</span><b class="fcr-text">+'+faNum(finalAmount)+' سکه!</b>';
    document.body.appendChild(flyWrap);
    setTimeout(()=>{ flyWrap.remove(); }, 1200);
  }catch(e){}
  try{gSfx('win');}catch(e){}
  return next;
}

function coinSpend(amount){
  const cur=coinGet();
  if(cur < amount) return false;
  coinSet(cur-amount);
  return true;
}

function shopOwnedGet(){
  const base=['classic'];
  const stored=store.get(SHOP_OWNED_KEY, base);
  return Array.from(new Set(base.concat(stored)));
}
function shopOwnedSet(arr){ store.set(SHOP_OWNED_KEY, arr); }
function isOwned(id){ return shopOwnedGet().includes(id); }

function chessSkinGet(){ return store.get(CHESS_SKIN_KEY, 'classic'); }
function chessSkinSet(id){ store.set(CHESS_SKIN_KEY, id); }

function getActiveGameSkin(game){
  const s = store.get(GAME_SKINS_KEY, {});
  return s[game] || 'default';
}
function setActiveGameSkin(game, skinId){
  const s = store.get(GAME_SKINS_KEY, {});
  s[game] = skinId;
  store.set(GAME_SKINS_KEY, s);
}

function getConsumableCount(id){
  const c = store.get(CONSUMABLES_KEY, {});
  return c[id] || 0;
}
function addConsumable(id, count=1){
  const c = store.get(CONSUMABLES_KEY, {});
  c[id] = (c[id] || 0) + count;
  store.set(CONSUMABLES_KEY, c);
}
function useConsumable(id){
  const c = store.get(CONSUMABLES_KEY, {});
  if((c[id] || 0) > 0){
    c[id]--;
    store.set(CONSUMABLES_KEY, c);
    return true;
  }
  return false;
}

function isDoubleCoinActive(){
  try{
    const exp = parseInt(localStorage.getItem('ny_double_coin_until') || '0', 10);
    return Date.now() < exp;
  }catch(e){ return false; }
}

function activateDoubleCoin(){
  const exp = Date.now() + 10 * 60 * 1000;
  localStorage.setItem('ny_double_coin_until', String(exp));
  toast('بوستر ۲ برابر سکه برای ۱۰ دقیقه فعال شد! ⚡', 'zap');
}

function shopCatGet(){ return store.get(SHOP_CAT_KEY, 'all'); }
function shopCatSet(id){ store.set(SHOP_CAT_KEY, id); }

function canClaimDailyFree(){
  const today = new Date().toISOString().slice(0, 10);
  try{
    return localStorage.getItem(DAILY_FREE_KEY) !== today;
  }catch(e){ return true; }
}

function claimDailyFreeCoins(){
  const today = new Date().toISOString().slice(0, 10);
  if(!canClaimDailyFree()){
    toast('جایزه روزانه امروز را قبلاً دریافت کرده‌اید! فردا دوباره سر بزنید.', 'info');
    return;
  }
  localStorage.setItem(DAILY_FREE_KEY, today);
  coinAdd(20, 'هدیه ورود روزانه به کافی‌نت');
  toast('۲۰ سکه طلایی هدیه روزانه به شما اهدا شد ✓', 'sparkles');
  if(typeof shopRerender==='function') shopRerender();
}

function buyItem(id){
  // Check in Chess skins or Upgrades
  const chessSkin = CHESS_SKINS.find(s=>s.id===id);
  const upgItem = GAME_UPGRADE_ITEMS.find(s=>s.id===id);
  const item = chessSkin || upgItem;
  if(!item){ toast('آیتم پیدا نشد','alert'); return; }

  if(item.type === 'consumable'){
    if(!coinSpend(item.price)){
      toast('سکه کم داری! برو بازی کن تا سکه جمع کنی','coins');
      try{gSfx('bad');}catch(e){}
      return;
    }
    if(item.id === 'double_coin_10m'){
      activateDoubleCoin();
    } else {
      addConsumable(item.id, 1);
      toast('۱ عدد «'+item.name+'» خریداری و ذخیره شد ✓','check-circle');
    }
    try{gSfx('win');}catch(e){}
    if(typeof shopRerender==='function') shopRerender();
    return;
  }

  if(isOwned(id)){
    toast('این آیتم را قبلاً خریداری کرده‌اید','info');
    selectItem(id);
    return;
  }

  if(!coinSpend(item.price)){
    toast('سکه کم داری! برو بازی کن تا سکه جمع کنی','coins');
    try{gSfx('bad');}catch(e){}
    return;
  }

  const owned=shopOwnedGet();
  owned.push(id);
  shopOwnedSet(owned);
  toast('خرید موفق ✓ «'+item.name+'» — هم‌اکنون فعال شد!','shopping-bag');
  try{gSfx('win');}catch(e){}
  selectItem(id);
}

function selectItem(id){
  if(!isOwned(id)){ toast('ابتدا باید آیتم را بخرید!','alert'); return; }
  const chessSkin = CHESS_SKINS.find(s=>s.id===id);
  const upgItem = GAME_UPGRADE_ITEMS.find(s=>s.id===id);
  
  if(chessSkin){
    chessSkinSet(id);
    applyChessSkin();
    toast('اسکین شطرنج «'+chessSkin.name+'» فعال شد ✓','palette');
  } else if(upgItem && upgItem.game){
    setActiveGameSkin(upgItem.game, id);
    toast('پوسته «'+upgItem.name+'» روی بازی فعال شد ✓','check-circle');
  }

  if(typeof shopRerender==='function') shopRerender();
}

function applyChessSkin(){
  const skinId=chessSkinGet();
  const skin=CHESS_SKINS.find(s=>s.id===skinId) || CHESS_SKINS[0];
  let styleEl=document.getElementById('chessSkinStyle');
  if(!styleEl){
    styleEl=document.createElement('style');
    styleEl.id='chessSkinStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent=
    '.chs-c.l{background:'+skin.light+'!important}'+
    '.chs-c.d{background:'+skin.dark+'!important}';
}

function shopRerender(){
  const wrap=document.querySelector('.content[data-view="shop"]');
  if(wrap){ wrap.innerHTML=vShopFull(); }
}

function setShopCat(id){
  shopCatSet(id);
  const wrap=document.querySelector('.content[data-view="shop"]');
  if(wrap){ wrap.innerHTML=vShopFull(); }
}

function vShopFull(){
  const coins=coinGet();
  const owned=shopOwnedGet();
  const activeChess=chessSkinGet();
  const curCat=shopCatGet();

  let allList = [];
  if(curCat === 'all'){
    allList = GAME_UPGRADE_ITEMS.concat(CHESS_SKINS);
  } else if(curCat === 'game_upgrades' || curCat === 'consumables'){
    allList = GAME_UPGRADE_ITEMS.filter(s=>s.cat===curCat);
  } else {
    allList = CHESS_SKINS.filter(s=>s.cat===curCat || (curCat==='nature' && s.cat==='fancy'));
  }

  const canClaim = canClaimDailyFree();

  return '<section class="shop-hero-premium">'
    +'<div class="shop-hero-bg"></div><div class="shop-hero-glow g1"></div><div class="shop-hero-glow g2"></div>'
    +'<div class="shop-hero-content">'
      +'<span class="shop-badge">'+ic('shopping-bag',14)+' فروشگاه جامع بازی‌ها — <b class="hdr-coin-val">'+faNum(coins)+'</b> سکه</span>'
      +'<h1>ارتقای بازی‌ها، پوسته و بوستر با <span class="g">سکه‌های طلا</span></h1>'
      +'<p>با برد در بازی‌ها و ثبت رکوردهای جدید سکه جمع کن و همین‌جا پوسته‌های خفن دایناسور، مار، توربو رانر، تخته شطرنج و بوسترهای ۲ برابری رو فعال کن!</p>'
      +'<div class="shop-stats">'
        +'<span>'+ic('coins',12)+' موجودی شما: <b id="coinBalShop">'+faNum(coins)+'</b> سکه</span>'
        +'<span>'+ic('check-circle',12)+' '+faNum(owned.length)+' آیتم خریداری شده</span>'
        +(isDoubleCoinActive()?'<span style="color:#ffd76e">'+ic('zap',12)+' بوستر ۲ برابر سکه فعال است!</span>':'')
      +'</div>'
      +'<div class="shop-hero-acts">'
        +'<button class="btn gold" onclick="claimDailyFreeCoins()">'+ic('gift',16)+(canClaim?'دریافت ۲۰ سکه رایگان امروز!':'جایزه امروز دریافت شده ✓')+'</button>'
        +'<button class="btn ghost" onclick="go(\'games\')">'+ic('gamepad',14)+' بازگشت به بازی‌خانه</button>'
      +'</div>'
    +'</div>'
    +'<div class="shop-visual-premium"><div class="shop-cover-svg">'+(typeof gcov==='function'?gcov('shop'):'')+'</div></div>'
  +'</section>'

  +'<div class="shop-nav">'
    +'<div class="snav-scroll">'+SHOP_CATS.map(c=>'<button class="snav-tab'+(curCat===c.id?' active':'')+'" style="--cc:'+c.c+'" onclick="setShopCat(\''+c.id+'\')">'+ic(c.i,14)+c.l+'</button>').join('')+'</div>'
  +'</div>'

  +'<div class="shop-sec-head"><span class="ln"></span><span class="tx">'+faNum(allList.length)+' آیتم در این بخش</span><span class="ln"></span></div>'

  +'<div id="shopSkins" class="shop-skins-grid">'+allList.map(s=>{
    const ow=isOwned(s.id);
    let isActive = false;
    if(s.cat && s.cat.startsWith('game_upgrades')){
      isActive = getActiveGameSkin(s.game) === s.id;
    } else if(s.type === 'consumable'){
      isActive = false;
    } else {
      isActive = activeChess === s.id;
    }

    const consumableCount = s.type === 'consumable' ? getConsumableCount(s.id) : 0;

    return '<div class="shop-skin-card'+(ow?' owned':'')+(isActive?' active':'')+' reveal" style="--cl:'+(s.color||s.light||'#ffd76e')+';--cd:'+(s.dark||'#1e293b')+'">'
      +'<div class="ssk-preview">'
        +(s.light ? '<div class="ssk-board"><div class="ssk-c l"></div><div class="ssk-c d"></div><div class="ssk-c d"></div><div class="ssk-c l"></div></div>' : '<div class="ssk-orb" style="background:'+(s.color||'#ffd76e')+';box-shadow:0 0 20px '+(s.color||'#ffd76e')+'"></div>')
        +'<span class="ssk-icon">'+(s.icon ? ic(s.icon,22) : '❖')+'</span>'
        +(isActive?'<span class="ssk-active">'+ic('check',12)+' فعال</span>':'')
      +'</div>'
      +'<div class="ssk-info">'
        +'<div class="ssk-name">'+s.name+' <span class="ssk-badge">'+s.badge+'</span></div>'
        +'<div class="ssk-desc">'+s.desc+'</div>'
        +'<div class="ssk-price">'
          +(s.type==='consumable' ? (consumableCount>0?'<span class="owned">'+ic('package',12)+' موجود: '+faNum(consumableCount)+'</span>':'<span>'+ic('coins',12)+faNum(s.price)+' سکه</span>') : (ow?'<span class="owned">'+ic('check-circle',12)+' خریده شده</span>':'<span>'+ic('coins',12)+faNum(s.price)+' سکه</span>'))
        +'</div>'
      +'</div>'
      +'<div class="ssk-act">'
        +(s.type==='consumable' ?
            '<button class="btn gold small" onclick="buyItem(\''+s.id+'\')">'+ic('shopping-cart',12)+' خرید مجدد ('+faNum(s.price)+' سکه)</button>'
          : (ow ?
              (isActive ? '<button class="btn ghost small" disabled>'+ic('check',12)+' در حال استفاده</button>' : '<button class="btn gold small" onclick="selectItem(\''+s.id+'\')">'+ic('check-circle',12)+' انتخاب و فعال‌سازی</button>')
            : '<button class="btn gold small" onclick="buyItem(\''+s.id+'\')">'+ic('shopping-cart',12)+' خرید ('+faNum(s.price)+' سکه)</button>')
        )
      +'</div>'
    +'</div>';
  }).join('')+'</div>'

  +'<div class="shop-earn">'
    +'<h3>'+ic('trophy',16)+' چطور سکه جمع کنم؟</h3>'
    +'<div class="earn-grid">'
      +'<div class="earn-card">'+ic('wind',18)+'<b>توربو رانر</b><span>جمع کردن حلقه‌ها، شکست غول و پایان مرحله +۳۰ تا +۱۰۰</span></div>'
      +'<div class="earn-card">'+ic('cards',18)+'<b>چهاربرگ (پاسور)</b><span>هر برد دست +۲۵ سکه، هر سور +۱۰</span></div>'
      +'<div class="earn-card">'+ic('zap',18)+'<b>دایی‌ناصر و فلپی</b><span>ثبت رکورد جدید +۲۵ سکه</span></div>'
      +'<div class="earn-card">'+ic('gift',18)+'<b>جایزه روزانه</b><span>هر روز ورود به سایت +۲۰ سکه رایگان قطعی</span></div>'
    +'</div>'
  +'</div>'
  +footHtml();
}

function vShop(){ return vShopFull(); }
function coinBalanceHtml(){ return '<span class="coin-pill" id="coinBalanceWrap">'+ic('coins',12)+'<b id="coinBalance">'+faNum(coinGet())+'</b></span>'; }

// اعمال استایل پیش‌فرض شطرنج هنگام بارگذاری
try{ applyChessSkin(); }catch(e){}
