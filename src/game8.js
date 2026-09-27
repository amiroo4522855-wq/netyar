/* ================================================================
   بازی ماشین‌سواری ایرانی اولترا پرمیوم — «رانندگی در شهر» (Speed City Racing) v24.0
   دنا پلاس، پژو پارس، پیکان — گرافیک HD آسفالت و ماشین‌ها، رد لاستیک و دود،
   کیلومترشمار سفارشی هر خودرو، فیزیک مومنتوم بدون لگ و هوش مصنوعی ترافیک
   ================================================================ */
'use strict';

const CR_CARS = [
  {
    id: 'dena',
    name: 'دنا پلاس توربو',
    enName: 'Dena Plus Turbo',
    cls: 'سدان اسپرت مدرن',
    desc: 'موتور EF7 توربوشارژ، شتاب عالی، آیرودینامیک تیز، چراغ‌های لوزی و پشت آمپر دیجیتال نئونی فیروزه‌ای',
    price: 0,
    topSpeed: 220,
    accel: 0.30,
    brake: 0.44,
    handling: 0.050,
    grip: 0.95,
    weight: 1260,
    power: 155,
    defaultColor: '#e2e8f0',
    colors: ['#e2e8f0', '#0f172a', '#b91c1c', '#1e3a8a', '#d9ae3e'],
    soundPitch: 1.18,
    dialTheme: 'dena-digital',
    accentCol: '#38bdf8'
  },
  {
    id: 'pars',
    name: 'پژو پارس ELX',
    enName: 'Peugeot Pars ELX',
    cls: 'سدان اصیل و پرطرفدار',
    desc: 'موتور پرشتاب زانتیا (XUM)، پایداری بالا در پیچ‌ها، جلوپنجره کلاسیک و کیلومترشمار اسپرت با نورپردازی یخی و قرمز',
    price: 40,
    topSpeed: 208,
    accel: 0.27,
    brake: 0.41,
    handling: 0.053,
    grip: 0.93,
    weight: 1190,
    power: 138,
    defaultColor: '#0f172a',
    colors: ['#0f172a', '#ffffff', '#71717a', '#1e293b', '#854d0e'],
    soundPitch: 1.05,
    dialTheme: 'pars-sport',
    accentCol: '#ef4444'
  },
  {
    id: 'paykan',
    name: 'پیکان جوانان ۵۷',
    enName: 'Paykan Javanan 1978',
    cls: 'کلاسیک نوستالژیک ایرانی',
    desc: 'سپر کروم براق، چراغ‌های گرد دوبل، فنربندی نرم، کیلومترشمار عقربه‌ای کلاسیک با نور کهربایی گرم',
    price: 80,
    topSpeed: 175,
    accel: 0.20,
    brake: 0.35,
    handling: 0.042,
    grip: 0.88,
    weight: 980,
    power: 90,
    defaultColor: '#f59e0b',
    colors: ['#f59e0b', '#065f46', '#991b1b', '#f8fafc', '#3b82f6'],
    soundPitch: 0.88,
    dialTheme: 'paykan-classic',
    accentCol: '#f59e0b'
  }
];

const CR_MAPS = [
  {
    id: 'city',
    name: 'خیابان‌های تهران (پایتخت)',
    enName: 'City Center',
    desc: 'آسفالت شهری با خط‌کشی عابر، خطوط زرد، پیاده‌روهای موزاییکی، فضای سبز و ترافیک روان',
    skyTop: '#0d1e3a', skyBot: '#1e3a6a', roadCol: '#1e2124', sidewalkCol: '#475569',
    weather: 'sunny', gripMod: 1.0, trafficDense: 8,
    ambience: 'city'
  },
  {
    id: 'mountain',
    name: 'جاده چالوس و کوهستان',
    enName: 'Mountain Pass',
    desc: 'پیچ‌های کوهستانی هیجان‌انگیز، صخره‌های مرتفع، گاردریل محافظ و هوای ابری خنک',
    skyTop: '#172554', skyBot: '#3b82f6', roadCol: '#1b1e22', sidewalkCol: '#334155',
    weather: 'cloudy', gripMod: 0.95, trafficDense: 5,
    ambience: 'wind'
  },
  {
    id: 'night',
    name: 'بزرگراه شبانه و چراغ‌های نئونی',
    enName: 'Neon Highway',
    desc: 'اتوبان عریض شبانه، تیرهای چراغ‌برق با هاله درخشان، آسفالت تاریک و ساختمان‌های نورانی',
    skyTop: '#050a15', skyBot: '#0f172a', roadCol: '#121417', sidewalkCol: '#1e293b',
    weather: 'night', gripMod: 1.0, trafficDense: 10,
    ambience: 'highway'
  },
  {
    id: 'rain',
    name: 'مسیر بارانی شمال',
    enName: 'Rainy Coast',
    desc: 'آسفالت خیس و براق با انعکاس نور چراغ‌ها، قطرات متحرک باران، چسبندگی کمتر و لذت دریفت',
    skyTop: '#1e293b', skyBot: '#334155', roadCol: '#14171a', sidewalkCol: '#273549',
    weather: 'rain', gripMod: 0.82, trafficDense: 6,
    ambience: 'rain'
  }
];

const CR = {
  view: 'menu',
  carId: 'dena',
  mapId: 'city',
  mode: 'free',
  cameraMode: 0,
  camModes: ['نمای پشت (سوم‌شخص سینمایی)', 'نمای کاپوت (Hood Cam)', 'نمای راننده (First Person)', 'نمای دور و نقشه'],
  transmission: 'auto',

  p: {
    x: 450, y: 450,
    vx: 0, vy: 0,
    angle: 0,
    speed: 0,
    rpm: 900,
    gear: 1,
    gearMode: 'D',
    acc: 0,
    steer: 0,
    brake: 0,
    handbrake: false,
    headlights: true,
    turnSignal: 0,
    fuel: 100,
    nitro: 100,
    distance: 0,
    health: 100
  },

  cam: { x: 450, y: 450, zoom: 1, smoothAngle: 0 },
  
  cfg: {
    quality: 'ultra',
    sound: true,
    music: true,
    particles: true
  },

  custom: {
    dena: { color: '#e2e8f0', rim: 'sport', tint: 20, height: 0, engineLvl: 1, brakeLvl: 1, plate: '۶۸ ج ۵۴۹ ایران ۲۲' },
    pars: { color: '#0f172a', rim: 'classic', tint: 35, height: -5, engineLvl: 1, brakeLvl: 1, plate: '۱۱ ب ۸۸۳ ایران ۳۳' },
    paykan: { color: '#f59e0b', rim: 'chrome', tint: 0, height: 10, engineLvl: 1, brakeLvl: 1, plate: '۴۴ ص ۱۲۹ ایران ۱۱' }
  },

  keys: {
    up: false, down: false, left: false, right: false,
    space: false, shift: false, l: false, c: false
  },

  // رد لاستیک و دود
  skidmarks: [],
  particles: [],

  world: {
    width: 3600,
    height: 3600,
    roads: [],
    intersections: [],
    buildings: [],
    props: [],
    traffic: []
  },

  raf: 0,
  lastTime: 0,
  active: false,
  container: null,
  audioCtx: null,
  engineOsc1: null,
  engineOsc2: null,
  engineGain: null,
  records: {
    bestSpeed: 0,
    totalDistance: 0
  }
};

/* ================================================================
   سیستم صوتی چندکاناله وب‌آودیو
   ================================================================ */
function crInitAudio(){
  if(CR.audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    CR.audioCtx = new AudioContext();
    
    CR.engineOsc1 = CR.audioCtx.createOscillator();
    CR.engineOsc2 = CR.audioCtx.createOscillator();
    CR.engineGain = CR.audioCtx.createGain();

    CR.engineOsc1.type = 'sawtooth';
    CR.engineOsc2.type = 'triangle';

    CR.engineOsc1.connect(CR.engineGain);
    CR.engineOsc2.connect(CR.engineGain);
    CR.engineGain.connect(CR.audioCtx.destination);

    CR.engineGain.gain.setValueAtTime(0.001, CR.audioCtx.currentTime);
    CR.engineOsc1.start();
    CR.engineOsc2.start();
  } catch(e){}
}

function crUpdateSound(){
  if(!CR.audioCtx || !CR.engineOsc1 || !CR.cfg.sound) return;
  try {
    const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
    const baseFreq = 42 * curCar.soundPitch;
    const rpmRatio = (CR.p.rpm - 900) / 5900;
    const targetFreq = baseFreq + rpmRatio * 180;

    CR.engineOsc1.frequency.setTargetAtTime(targetFreq, CR.audioCtx.currentTime, 0.04);
    CR.engineOsc2.frequency.setTargetAtTime(targetFreq * 1.5, CR.audioCtx.currentTime, 0.04);

    let vol = 0.035 + rpmRatio * 0.075;
    if(CR.view !== 'ingame') vol = 0.001;
    CR.engineGain.gain.setTargetAtTime(vol, CR.audioCtx.currentTime, 0.05);
  } catch(e){}
}

function crSfx(type){
  if(!CR.cfg.sound) return;
  crInitAudio();
  if(!CR.audioCtx) return;
  try {
    const ctx = CR.audioCtx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;

    if(type === 'click'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      g.gain.setValueAtTime(0.08, now);
      g.gain.linearRampToValueAtTime(0, now + 0.08);
      osc.start(now); osc.stop(now + 0.08);
    } else if(type === 'gear'){
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      g.gain.setValueAtTime(0.14, now);
      g.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if(type === 'crash'){
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.28);
      g.gain.setValueAtTime(0.22, now);
      g.gain.linearRampToValueAtTime(0, now + 0.28);
      osc.start(now); osc.stop(now + 0.28);
    } else if(type === 'nitro'){
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(850, now + 0.35);
      g.gain.setValueAtTime(0.18, now);
      g.gain.linearRampToValueAtTime(0, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    }
  } catch(e){}
}

/* ================================================================
   ساخت مپ با جزئیات آسفالت، تقاطع و پیاده‌رو
   ================================================================ */
function crBuildWorld(){
  const W = CR.world.width;
  const H = CR.world.height;
  CR.world.roads = [];
  CR.world.intersections = [];
  CR.world.buildings = [];
  CR.world.props = [];
  CR.world.traffic = [];
  CR.skidmarks = [];
  CR.particles = [];

  const roadW = 180;
  for(let y = 450; y < H; y += 750){
    CR.world.roads.push({x: 0, y: y - roadW/2, w: W, h: roadW, dir: 'h'});
  }
  for(let x = 450; x < W; x += 750){
    CR.world.roads.push({x: x - roadW/2, y: 0, w: roadW, h: H, dir: 'v'});
  }

  // ثبت تقاطع‌ها برای خط‌کشی عابر پیاده
  for(let x = 450; x < W; x += 750){
    for(let y = 450; y < H; y += 750){
      CR.world.intersections.push({x, y, size: roadW});
    }
  }

  for(let x = 120; x < W - 250; x += 750){
    for(let y = 120; y < H - 250; y += 750){
      const bw = 500, bh = 500;
      CR.world.buildings.push({
        x, y, w: bw, h: bh,
        color: CR.mapId === 'night' ? '#0f172a' : (Math.random() > 0.5 ? '#1e293b' : '#27354f'),
        trimColor: Math.random() > 0.5 ? '#d9ae3e' : '#38bdf8'
      });
      CR.world.props.push({type: 'tree', x: x - 32, y: y + 90});
      CR.world.props.push({type: 'tree', x: x + bw + 32, y: y + 260});
      CR.world.props.push({type: 'light', x: x - 45, y: y + 320});
      CR.world.props.push({type: 'light', x: x + bw + 45, y: y + 420});
      CR.world.props.push({type: 'bench', x: x - 36, y: y + 180});
    }
  }

  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  for(let i = 0; i < curMap.trafficDense; i++){
    const isHoriz = Math.random() > 0.5;
    const roadIdx = Math.floor(Math.random() * 4);
    const posOnRoad = Math.random() * (W - 500) + 250;
    const roadCoord = 450 + roadIdx * 750;
    
    CR.world.traffic.push({
      id: i,
      x: isHoriz ? posOnRoad : roadCoord + (Math.random() > 0.5 ? 42 : -42),
      y: isHoriz ? roadCoord + (Math.random() > 0.5 ? 42 : -42) : posOnRoad,
      angle: isHoriz ? (Math.random() > 0.5 ? 0 : Math.PI) : (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2),
      speed: Math.random() * 2 + 3.2,
      color: ['#ffffff', '#0f172a', '#71717a', '#b91c1c', '#2563eb'][i % 5],
      w: 52, h: 26
    });
  }
}

function crResetCar(){
  CR.p.x = 450;
  CR.p.y = 450;
  CR.p.vx = 0;
  CR.p.vy = 0;
  CR.p.speed = 0;
  CR.p.angle = 0;
  CR.p.rpm = 900;
  CR.p.gear = 1;
  CR.p.gearMode = CR.transmission === 'manual' ? 'M' : 'D';
  CR.p.fuel = 100;
  CR.p.nitro = 100;
  CR.p.health = 100;
  CR.p.turnSignal = 0;
  CR.p.headlights = true;
  CR.p.handbrake = false;
  CR.cam.x = CR.p.x;
  CR.cam.y = CR.p.y;
  CR.cam.smoothAngle = CR.p.angle;
}

/* ================================================================
   منوی اصلی
   ================================================================ */
function crMenuHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper">'
    +'<div class="cr-cinema-bg">'
      +'<div class="cr-hero-cover-art">'+(typeof gcov==='function'?gcov('carracing'):'')+'</div>'
      +'<div class="cr-cinema-overlay"></div>'
    +'</div>'

    +'<div class="cr-main-panel">'
      +'<div class="cr-header">'
        +'<div class="cr-title-box">'
          +'<span class="cr-badge">'+ic('zap',13)+'شبیه‌ساز مسابقه و رانندگی ایرانی — نسخه ۲۴</span>'
          +'<h1>مسابقه در شهر <span class="g">نت‌یار اسپید</span></h1>'
          +'<p>دنا پلاس توربو، پژو پارس ELX و پیکان جوانان — فیزیک روان و نرم، صدای غرش موتور، کیلومترشمار اختصاصی هر ماشین و گیربکس انتخابی</p>'
        +'</div>'

        +'<div class="cr-car-badge-card" onclick="crSetView(\'select_car\')">'
          +'<div class="ccb-info">'
            +'<span class="ccb-lbl">ماشین انتخاب‌شده:</span>'
            +'<b>'+curCar.name+'</b>'
            +'<i>گیربکس: '+(CR.transmission==='manual'?'دنده‌ای دستی (M)':'اتوماتیک هوشمند (A)')+'</i>'
          +'</div>'
          +'<div class="ccb-color-dot" style="background:'+(custom.color||curCar.defaultColor)+'"></div>'
          +'<button class="btn gold small">'+ic('car',12)+'تغییر ماشین</button>'
        +'</div>'
      +'</div>'

      +'<div class="cr-trans-selector">'
        +'<span class="cts-lbl">'+ic('activity',14)+'نوع گیربکس رانندگی:</span>'
        +'<div class="cts-btns">'
          +'<button class="btn small'+(CR.transmission==='auto'?' gold':' ghost')+'" onclick="crSetTransmission(\'auto\')">'+ic('zap',12)+'اتوماتیک (رانندگی آسان و روان)</button>'
          +'<button class="btn small'+(CR.transmission==='manual'?' gold':' ghost')+'" onclick="crSetTransmission(\'manual\')">'+ic('wrench',12)+'دنده‌ای دستی (کلید E دنده بالا / Q معکوس)</button>'
        +'</div>'
      +'</div>'

      +'<div class="cr-menu-grid">'
        +'<div class="cr-action-card primary" onclick="crStartGame()">'
          +'<div class="cac-ic">'+ic('play',28)+'</div>'
          +'<div class="cac-tt">'
            +'<b>استارت موتور و شروع رانندگی</b>'
            +'<span>ورود به جاده «'+curMap.name+'» با '+curCar.name+'</span>'
          +'</div>'
          +'<span class="cac-arrow">'+ic('arrow-left',16)+'</span>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'select_car\')">'
          +'<div class="cac-ic">'+ic('car',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>گاراژ خودروها و کیلومترشمار</b>'
            +'<span>دنا، پارس، پیکان — مشاهده تم آمپر و شتاب</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'garage\')">'
          +'<div class="cac-ic">'+ic('wrench',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>تیونینگ و شخصی‌سازی</b>'
            +'<span>تغییر رنگ بدنه، دودی شیشه، تقویت موتور و پلاک</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'select_map\')">'
          +'<div class="cac-ic">'+ic('compass',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>انتخاب مپ و وضعیت آب‌وهوا</b>'
            +'<span>شهر تهران، جاده چالوس، بزرگراه شبانه و بارانی</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'controls\')">'
          +'<div class="cac-ic">'+ic('activity',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>راهنمای کلیدها و کنترل</b>'
            +'<span>W/A/S/D یا فلش‌ها، ترمز دستی، نیترو و تغییر دوربین</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="go(\'games\')">'
          +'<div class="cac-ic">'+ic('log-out',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>خروج به بازی‌خانه</b>'
            +'<span>بازگشت به لیست بازی‌های کافی‌نت</span>'
          +'</div>'
        +'</div>'
      +'</div>'

      +'<div class="cr-footer-stats">'
        +'<span>'+ic('zap',13)+' حداکثر سرعت ثبت‌شده: <b>'+faNum(CR.records.bestSpeed)+' KM/H</b></span>'
        +'<span>'+ic('navigation',13)+' مجموع مسافت پیموده شده: <b>'+faNum((CR.records.totalDistance/1000).toFixed(1))+' کیلومتر</b></span>'
        +'<span>'+ic('shield',13)+' فیزیک ۶۰ فریم بر ثانیه · کاملاً روان و بدون لگ</span>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function crSetTransmission(t){
  CR.transmission = t;
  crSfx('gear');
  toast(t === 'manual' ? 'گیربکس دستی فعال شد (کلید E دنده بالا / Q دنده پایین)' : 'گیربکس اتوماتیک فعال شد', 'activity');
  crRenderApp();
}

/* ================================================================
   انتخاب خودرو و مشخصات
   ================================================================ */
function crSelectCarHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>انتخاب خودرو و بررسی صفحه کیلومتر</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' شروع بازی با این ماشین</button>'
    +'</div>'

    +'<div class="cr-car-select-layout">'
      +'<div class="cr-cars-list">'
        +CR_CARS.map(c => {
          const isSel = c.id === CR.carId;
          const cust = CR.custom[c.id] || {};
          return '<div class="cr-car-card'+(isSel?' active':'')+'" onclick="crSelectCar(\''+c.id+'\')">'
            +'<div class="ccc-head">'
              +'<b>'+c.name+'</b>'
              +'<span class="ccc-cls">'+c.cls+'</span>'
            +'</div>'
            +'<div class="ccc-preview-box" style="--car-col:'+(cust.color||c.defaultColor)+'">'
              +'<div class="ccp-chassis"></div>'
            +'</div>'
            +'<div class="ccc-mini-specs">'
              +'<span>'+ic('zap',11)+' '+faNum(c.topSpeed)+' KM/H</span>'
              +'<span>'+ic('gauge',11)+' تم آمپر: '+(c.id==='dena'?'دیجیتال نئون':c.id==='pars'?'اسپرت یخی':'کلاسیک کهربایی')+'</span>'
            +'</div>'
          +'</div>';
        }).join('')
      +'</div>'

      +'<div class="cr-car-details-panel">'
        +'<div class="cdp-title">'
          +'<span class="badge gold">'+curCar.cls+'</span>'
          +'<h3>'+curCar.name+'</h3>'
          +'<p>'+curCar.desc+'</p>'
        +'</div>'

        +'<div class="cdp-bars">'
          +crSpecBar('حداکثر سرعت', (curCar.topSpeed/240)*100, faNum(curCar.topSpeed) + ' KM/H')
          +crSpecBar('شتاب اولیه (۰ تا ۱۰۰)', (curCar.accel/0.32)*100, (curCar.accel*100).toFixed(0) + ' %')
          +crSpecBar('هندلینگ و پیچیدن در سرعت', (curCar.handling/0.06)*100, (curCar.handling*1000).toFixed(0) + ' pt')
          +crSpecBar('قدرت ترمزگیری', (curCar.brake/0.5)*100, (curCar.brake*100).toFixed(0) + ' %')
          +crSpecBar('چسبندگی لاستیک', curCar.grip*100, (curCar.grip*100).toFixed(0) + ' %')
        +'</div>'

        +'<div class="cdp-acts">'
          +'<button class="btn gold" onclick="crSetView(\'garage\')">'+ic('wrench',15)+' شخصی‌سازی در گاراژ</button>'
          +'<button class="btn primary" onclick="crStartGame()">'+ic('play',15)+' ورود به بازی</button>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function crSpecBar(label, percent, valStr){
  return '<div class="cdp-bar-row">'
    +'<div class="cbr-info"><span>'+label+'</span><b>'+valStr+'</b></div>'
    +'<div class="cbr-track"><div class="cbr-fill" style="width:'+Math.min(100, percent)+'%"></div></div>'
  +'</div>';
}

/* ================================================================
   گاراژ
   ================================================================ */
function crGarageHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>گاراژ تیونینگ و شخصی‌سازی «'+curCar.name+'»</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' تست در جاده</button>'
    +'</div>'

    +'<div class="cr-garage-layout">'
      +'<div class="cr-garage-stage">'
        +'<div class="cgs-glow"></div>'
        +'<div class="cgs-car-preview" style="--car-col:'+(custom.color||curCar.defaultColor)+';--car-tint:'+(custom.tint||20)+'%">'
          +'<div class="cg-car-body">'
            +'<div class="cg-roof"></div>'
            +'<div class="cg-hood"></div>'
            +'<div class="cg-lights"></div>'
            +'<div class="cg-plate">'+(custom.plate||'ایران ۲۲')+'</div>'
          +'</div>'
        +'</div>'
        +'<div class="cgs-pedestal"></div>'
      +'</div>'

      +'<div class="cr-garage-controls">'
        +'<div class="cgc-section">'
          +'<label>'+ic('palette',14)+' انتخاب رنگ بدنه:</label>'
          +'<div class="cgc-colors">'
            +curCar.colors.map(col => '<span class="cgc-col-btn'+(custom.color===col?' active':'')+'" style="background:'+col+'" onclick="crSetColor(\''+col+'\')"></span>').join('')
          +'</div>'
        +'</div>'

        +'<div class="cgc-section">'
          +'<label>'+ic('eye',14)+' درصد دودی شیشه‌ها:</label>'
          +'<div class="cgc-btns-group">'
            +[0, 20, 45, 70].map(t => '<button class="btn small'+(custom.tint===t?' gold':' ghost')+'" onclick="crSetTint('+t+')">'+faNum(t)+'%</button>').join('')
          +'</div>'
        +'</div>'

        +'<div class="cgc-section">'
          +'<label>'+ic('zap',14)+' ارتقای تیونینگ و قدرت:</label>'
          +'<div class="cgc-tuning-row">'
            +'<span>ریمپ موتور (افزایش شتاب توربو)</span>'
            +'<button class="btn gold small" onclick="crUpgradeEngine()">'+ic('check',12)+' اعمال ریمپ</button>'
          +'</div>'
          +'<div class="cgc-tuning-row">'
            +'<span>کالیپرهای ترمز مسابقه‌ای</span>'
            +'<button class="btn gold small" onclick="crUpgradeBrake()">'+ic('check',12)+' تقویت ترمز</button>'
          +'</div>'
        +'</div>'

        +'<div class="cgc-section">'
          +'<label>'+ic('tag',14)+' شماره پلاک اختصاصی:</label>'
          +'<input type="text" class="cgc-plate-input" value="'+(custom.plate||'۶۸ ج ۵۴۹ ایران ۲۲')+'" onchange="crSetPlate(this.value)">'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

function crSelectMapHtml(){
  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>انتخاب نقشه، جاده و آب‌وهوا</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' شروع مسابقه</button>'
    +'</div>'

    +'<div class="cr-maps-grid">'
      +CR_MAPS.map(m => {
        const isSel = m.id === CR.mapId;
        return '<div class="cr-map-card'+(isSel?' active':'')+'" onclick="crSelectMap(\''+m.id+'\')">'
          +'<div class="cmc-preview" style="background:linear-gradient(160deg,'+m.skyTop+','+m.skyBot+')">'
            +'<span class="cmc-tag">'+m.enName+'</span>'
          +'</div>'
          +'<div class="cmc-info">'
            +'<b>'+m.name+'</b>'
            +'<p>'+m.desc+'</p>'
            +'<div class="cmc-chips">'
              +'<span>'+ic('cloud',11)+' آب‌وهوا: '+m.weather+'</span>'
              +'<span>'+ic('activity',11)+' ترافیک: '+faNum(m.trafficDense)+' خودرو</span>'
            +'</div>'
          +'</div>'
        +'</div>';
      }).join('')
    +'</div>'
  +'</div>';
}

function crControlsHtml(){
  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>راهنمای کنترل خودرو و کلیدها</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' شروع رانندگی</button>'
    +'</div>'

    +'<div class="cr-controls-grid">'
      +'<div class="cr-ctrl-card"><span class="cr-key">W / ↑</span><b>گاز دادن نرم و شتاب پیوسته</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">S / ↓</span><b>ترمز ABS و دنده عقب (R)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">A / ←</span><b>فرمان به چپ</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">D / →</span><b>فرمان به راست</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Space</span><b>ترمز دستی (دریفت کشیدن و ایجاد رد لاستیک)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Shift</span><b>نیتروبوست موقت همراه با دنباله آتشین</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">E / Q</span><b>تعویض دنده دستی (در حالت گیربکس دستی)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">C</span><b>تغییر نرم دوربین (سوم‌شخص، کاپوت، داخل، دور)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">L</span><b>چراغ‌های جلو / نور بالا</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Esc</span><b>توقف بازی (Pause Menu)</b></div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   صفحه داخل بازی
   ================================================================ */
function crInGameHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];

  return '<div class="cr-ingame-wrap">'
    +'<canvas id="crCanvas" width="1280" height="720"></canvas>'

    +'<div class="cr-hud-top">'
      +'<div class="cht-badge">'
        +'<span class="cht-dot"></span>'
        +'<b>'+curMap.name+'</b>'
        +'<span>'+curCar.name+'</span>'
      +'</div>'
      +'<div class="cht-cam-lbl" id="crCamLbl">'+CR.camModes[CR.cameraMode]+' (کلید C)</div>'
      +'<button class="btn ghost small" onclick="crPauseGame()">'+ic('pause',14)+' مکث (Esc)</button>'
    +'</div>'

    +'<div class="cr-minimap-wrap">'
      +'<canvas id="crMinimap" width="140" height="140"></canvas>'
    +'</div>'

    // صفحه کیلومتر اختصاصی خودرو
    +'<div class="cr-speedo-hud theme-'+curCar.dialTheme+'">'
      +'<div class="csh-dial">'
        +'<div class="csh-car-brand">'+curCar.name+'</div>'
        +'<div class="csh-speed-num" id="crSpeedNum">۰۰۰</div>'
        +'<div class="csh-unit">KM/H</div>'
        +'<div class="csh-rpm-bar"><div class="crb-fill" id="crRpmBar" style="width:15%"></div></div>'
        +'<div class="csh-rpm-text"><span id="crRpmNum">۹۰۰</span> RPM</div>'
      +'</div>'

      +'<div class="csh-gear-box">'
        +'<div class="cgb-mode" id="crGearMode">'+CR.p.gearMode+'</div>'
        +'<div class="cgb-gear">دنده <b id="crGearNum">۱</b></div>'
      +'</div>'

      +'<div class="csh-meters">'
        +'<div class="csh-meter-row">'
          +'<span>'+ic('zap',11)+' نیترو</span>'
          +'<div class="cmr-track"><div class="cmr-fill nitro" id="crNitroBar" style="width:100%"></div></div>'
        +'</div>'
        +'<div class="csh-meter-row">'
          +'<span>'+ic('activity',11)+' سلامت</span>'
          +'<div class="cmr-track"><div class="cmr-fill health" id="crHealthBar" style="width:100%"></div></div>'
        +'</div>'
      +'</div>'
    +'</div>'

    +'<div class="cr-touch-controls">'
      +'<div class="ctc-group left">'
        +'<button class="ctc-btn" data-key="left">'+ic('chevron-left',24)+'</button>'
        +'<button class="ctc-btn" data-key="right">'+ic('chevron-right',24)+'</button>'
      +'</div>'
      +'<div class="ctc-group right">'
        +'<button class="ctc-btn brake" data-key="down">'+ic('chevron-down',24)+'</button>'
        +'<button class="ctc-btn gas" data-key="up">'+ic('chevron-up',28)+'</button>'
        +'<button class="ctc-btn nitro" data-key="shift">'+ic('zap',18)+'</button>'
        +'<button class="ctc-btn cam" onclick="crCycleCamera()">'+ic('camera',18)+'</button>'
      +'</div>'
    +'</div>'

    +'<div class="cr-pause-overlay" id="crPauseOverlay" style="display:none">'
      +'<div class="cpo-modal">'
        +'<h3>بازی متوقف شد</h3>'
        +'<p>تنظیمات، تعویض زاویه دید یا شروع مجدد مرحله</p>'
        +'<div class="cpo-acts">'
          +'<button class="btn gold" onclick="crResumeGame()">'+ic('play',16)+' ادامه بازی</button>'
          +'<button class="btn primary" onclick="crRestartGame()">'+ic('refresh-cw',16)+' شروع مجدد</button>'
          +'<button class="btn ghost" onclick="crCycleCamera()">'+ic('camera',16)+' تغییر زاویه دوربین</button>'
          +'<button class="btn ghost" onclick="crExitToMenu()">'+ic('log-out',16)+' خروج به منوی اصلی</button>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   توابع کنترل
   ================================================================ */
function crSetView(v){
  CR.view = v;
  crSfx('click');
  crRenderApp();
}

function crSelectCar(id){
  CR.carId = id;
  crSfx('click');
  toast('خودرو به «' + (CR_CARS.find(c=>c.id===id)||{}).name + '» تغییر یافت', 'car');
  crRenderApp();
}

function crSelectMap(id){
  CR.mapId = id;
  crSfx('click');
  toast('نقشه به «' + (CR_MAPS.find(m=>m.id===id)||{}).name + '» تغییر یافت', 'compass');
  crRenderApp();
}

function crSetColor(col){
  if(!CR.custom[CR.carId]) CR.custom[CR.carId] = {};
  CR.custom[CR.carId].color = col;
  crSfx('click');
  crRenderApp();
}

function crSetTint(val){
  if(!CR.custom[CR.carId]) CR.custom[CR.carId] = {};
  CR.custom[CR.carId].tint = val;
  crSfx('click');
  crRenderApp();
}

function crUpgradeEngine(){
  crSfx('gear');
  toast('موتور با موفقیت ریمپ شد (افزایش توان +۱۵٪) ✓', 'zap');
}

function crUpgradeBrake(){
  crSfx('click');
  toast('کالیپرهای ترمز تقویت شدند ✓', 'shield');
}

function crSetPlate(str){
  if(!CR.custom[CR.carId]) CR.custom[CR.carId] = {};
  CR.custom[CR.carId].plate = str;
  toast('شماره پلاک ثبت شد', 'check');
}

function crCycleCamera(){
  CR.cameraMode = (CR.cameraMode + 1) % CR.camModes.length;
  crSfx('click');
  const lbl = document.getElementById('crCamLbl');
  if(lbl) lbl.textContent = CR.camModes[CR.cameraMode] + ' (کلید C)';
  toast('دوربین: ' + CR.camModes[CR.cameraMode], 'camera');
}

function crShiftGearUp(){
  if(CR.transmission !== 'manual') return;
  if(CR.p.gear < 5){
    CR.p.gear++;
    crSfx('gear');
    toast('دنده ' + faNum(CR.p.gear), 'activity');
  }
}

function crShiftGearDown(){
  if(CR.transmission !== 'manual') return;
  if(CR.p.gear > 1){
    CR.p.gear--;
    crSfx('gear');
    toast('دنده ' + faNum(CR.p.gear), 'activity');
  }
}

function crStartGame(){
  crInitAudio();
  CR.view = 'ingame';
  crBuildWorld();
  crResetCar();
  crRenderApp();
  CR.active = true;
  CR.lastTime = performance.now();
  if(CR.raf) cancelAnimationFrame(CR.raf);
  CR.raf = requestAnimationFrame(crGameLoop);
}

function crPauseGame(){
  CR.active = false;
  const ov = document.getElementById('crPauseOverlay');
  if(ov) ov.style.display = 'flex';
}

function crResumeGame(){
  const ov = document.getElementById('crPauseOverlay');
  if(ov) ov.style.display = 'none';
  CR.active = true;
  CR.lastTime = performance.now();
  CR.raf = requestAnimationFrame(crGameLoop);
}

function crRestartGame(){
  const ov = document.getElementById('crPauseOverlay');
  if(ov) ov.style.display = 'none';
  crResetCar();
  CR.active = true;
  CR.lastTime = performance.now();
  CR.raf = requestAnimationFrame(crGameLoop);
}

function crExitToMenu(){
  CR.active = false;
  if(CR.raf) cancelAnimationFrame(CR.raf);
  if(CR.engineGain && CR.audioCtx){
    try{ CR.engineGain.gain.setValueAtTime(0.001, CR.audioCtx.currentTime); }catch(e){}
  }
  CR.view = 'menu';
  crRenderApp();
}

/* ================================================================
   فیزیک واقعی با سیستم رد لاستیک و دود دریفت
   ================================================================ */
function crUpdatePhysics(dt){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const p = CR.p;

  let throttle = 0;
  if(CR.keys.up) throttle = 1;
  else if(CR.keys.down) throttle = -0.6;

  let nitroBoost = 1;
  if(CR.keys.shift && p.nitro > 0 && throttle > 0){
    nitroBoost = 1.45;
    p.nitro = Math.max(0, p.nitro - dt * 25);
    crSfx('nitro');
    // ذرات آتشین نیترو در عقب خودرو
    CR.particles.push({
      x: p.x - Math.cos(p.angle) * 28,
      y: p.y - Math.sin(p.angle) * 28,
      vx: -Math.cos(p.angle) * 6 + (Math.random()-0.5)*3,
      vy: -Math.sin(p.angle) * 6 + (Math.random()-0.5)*3,
      life: 1, c: Math.random()>0.5 ? '#38bdf8' : '#ffd76e', r: 4
    });
  } else if(!CR.keys.shift && p.nitro < 100){
    p.nitro = Math.min(100, p.nitro + dt * 4);
  }

  const maxSteer = curCar.handling;
  if(CR.keys.left){
    p.steer = Math.max(-maxSteer, p.steer - dt * 0.22);
    p.turnSignal = -1;
  } else if(CR.keys.right){
    p.steer = Math.min(maxSteer, p.steer + dt * 0.22);
    p.turnSignal = 1;
  } else {
    p.steer *= 0.82;
    p.turnSignal = 0;
  }

  const isDrifting = CR.keys.space && Math.abs(p.speed) > 2;
  const grip = (isDrifting ? 0.70 : curCar.grip) * curMap.gripMod;
  const maxSpd = (curCar.topSpeed / 3.6) * 0.35 * nitroBoost;

  // اضافه کردن رد لاستیک و دود هنگام ترمز دستی یا دریفت
  if(isDrifting || (CR.keys.down && p.speed > 5)){
    // موقعیت دو چرخ عقب
    const rx1 = p.x - Math.cos(p.angle) * 20 + Math.sin(p.angle) * 14;
    const ry1 = p.y - Math.sin(p.angle) * 20 - Math.cos(p.angle) * 14;
    const rx2 = p.x - Math.cos(p.angle) * 20 - Math.sin(p.angle) * 14;
    const ry2 = p.y - Math.sin(p.angle) * 20 + Math.cos(p.angle) * 14;
    
    CR.skidmarks.push({x1: rx1, y1: ry1, x2: rx2, y2: ry2, alpha: 0.65});
    if(CR.skidmarks.length > 250) CR.skidmarks.shift();

    // تولید دود لاستیک
    for(let i=0; i<2; i++){
      CR.particles.push({
        x: (rx1 + rx2)/2 + (Math.random()-0.5)*10,
        y: (ry1 + ry2)/2 + (Math.random()-0.5)*10,
        vx: (Math.random()-0.5)*2,
        vy: (Math.random()-0.5)*2,
        life: 1, c: 'rgba(200, 200, 210, 0.4)', r: 6 + Math.random()*5
      });
    }
  }

  if(throttle > 0){
    let gearMaxSpd = maxSpd;
    if(CR.transmission === 'manual'){
      gearMaxSpd = maxSpd * (p.gear * 0.22);
    }
    if(p.speed < gearMaxSpd){
      p.speed += curCar.accel * throttle * nitroBoost * dt * 36;
      if(p.speed > gearMaxSpd) p.speed = gearMaxSpd;
    }
  } else if(throttle < 0){
    if(p.speed > 0.5){
      p.speed -= curCar.brake * dt * 52;
      if(p.speed < 0) p.speed = 0;
    } else {
      p.speed -= curCar.accel * 0.42 * dt * 30;
      if(p.speed < -maxSpd * 0.32) p.speed = -maxSpd * 0.32;
    }
  } else {
    p.speed *= (0.985 * grip);
    if(Math.abs(p.speed) < 0.05) p.speed = 0;
  }

  if(Math.abs(p.speed) > 0.1){
    const dir = p.speed > 0 ? 1 : -1;
    p.angle += p.steer * (p.speed / maxSpd) * dir;
  }

  p.vx = Math.cos(p.angle) * p.speed;
  p.vy = Math.sin(p.angle) * p.speed;

  p.x += p.vx;
  p.y += p.vy;

  p.x = Math.max(90, Math.min(CR.world.width - 90, p.x));
  p.y = Math.max(90, Math.min(CR.world.height - 90, p.y));

  p.distance += Math.abs(p.speed);
  const kmh = Math.round(Math.abs(p.speed) * 11.2);
  if(kmh > CR.records.bestSpeed){
    CR.records.bestSpeed = kmh;
  }
  CR.records.totalDistance += Math.abs(p.speed) * 0.1;

  const ratio = Math.abs(p.speed) / maxSpd;
  if(p.speed < -0.1){
    p.gearMode = 'R';
  } else if(CR.transmission === 'manual'){
    p.gearMode = 'M';
  } else {
    p.gearMode = 'D';
    if(ratio < 0.22) p.gear = 1;
    else if(ratio < 0.44) p.gear = 2;
    else if(ratio < 0.68) p.gear = 3;
    else if(ratio < 0.88) p.gear = 4;
    else p.gear = 5;
  }

  let gearRatio = ratio;
  if(CR.transmission === 'manual'){
    gearRatio = Math.min(1.0, (Math.abs(p.speed) / (maxSpd * (p.gear * 0.22))));
  }
  p.rpm = Math.min(6800, Math.max(900, Math.round(900 + gearRatio * 5200 + (throttle > 0 ? 650 : 0))));

  // برخورد با ساختمان‌ها
  for(const b of CR.world.buildings){
    if(p.x > b.x - 24 && p.x < b.x + b.w + 24 && p.y > b.y - 24 && p.y < b.y + b.h + 24){
      p.speed = -p.speed * 0.4;
      p.x -= p.vx * 1.5;
      p.y -= p.vy * 1.5;
      p.health = Math.max(10, p.health - 5);
      crSfx('crash');
    }
  }

  // ترافیک
  for(const npc of CR.world.traffic){
    npc.x += Math.cos(npc.angle) * npc.speed;
    npc.y += Math.sin(npc.angle) * npc.speed;
    if(npc.x < 50) npc.x = CR.world.width - 100;
    if(npc.x > CR.world.width - 50) npc.x = 100;
    if(npc.y < 50) npc.y = CR.world.height - 100;
    if(npc.y > CR.world.height - 50) npc.y = 100;

    const distToPlayer = Math.hypot(npc.x - p.x, npc.y - p.y);
    if(distToPlayer < 44){
      p.speed = -p.speed * 0.5;
      npc.speed *= 0.5;
      p.health = Math.max(10, p.health - 10);
      crSfx('crash');
    }
  }

  // ذرات دود
  for(let i = CR.particles.length - 1; i >= 0; i--){
    const pt = CR.particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.life -= dt * 1.8;
    pt.r += dt * 8;
    if(pt.life <= 0) CR.particles.splice(i, 1);
  }

  const camLag = 0.14;
  CR.cam.x += (p.x - CR.cam.x) * camLag;
  CR.cam.y += (p.y - CR.cam.y) * camLag;
  let angleDiff = p.angle - CR.cam.smoothAngle;
  while(angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  while(angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  CR.cam.smoothAngle += angleDiff * 0.085;

  crUpdateSound();
}

/* ================================================================
   رندر گرافیک با کیفیت سینمایی بالا
   ================================================================ */
function crDrawGame(){
  const cv = document.getElementById('crCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const p = CR.p;
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const custom = CR.custom[CR.carId] || {};

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = curMap.skyTop;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W/2, H/2);

  if(CR.cameraMode === 0){
    ctx.rotate(-CR.cam.smoothAngle - Math.PI/2);
    ctx.translate(-CR.cam.x, -CR.cam.y + 130);
  } else if(CR.cameraMode === 1){
    ctx.rotate(-p.angle - Math.PI/2);
    ctx.translate(-p.x, -p.y + 45);
  } else if(CR.cameraMode === 2){
    ctx.rotate(-p.angle - Math.PI/2);
    ctx.translate(-p.x, -p.y);
  } else {
    ctx.translate(-CR.cam.x, -CR.cam.y);
  }

  // ۱. زمین و چمن
  ctx.fillStyle = curMap.roadCol === '#121417' ? '#080b10' : '#142018';
  ctx.fillRect(0, 0, CR.world.width, CR.world.height);

  // ۲. پیاده‌روها و جدول‌های شهری
  for(const r of CR.world.roads){
    ctx.fillStyle = curMap.sidewalkCol || '#334155';
    if(r.dir === 'h'){
      ctx.fillRect(r.x, r.y - 18, r.w, 18);
      ctx.fillRect(r.x, r.y + r.h, r.w, 18);
    } else {
      ctx.fillRect(r.x - 18, r.y, 18, r.h);
      ctx.fillRect(r.x + r.w, r.y, 18, r.h);
    }

    // آسفالت اصلی با بافت دانه دار
    ctx.fillStyle = curMap.roadCol;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // خطوط زرد دوبل میانی خیابان
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.setLineDash([26, 18]);
    ctx.beginPath();
    if(r.dir === 'h'){
      ctx.moveTo(r.x, r.y + r.h/2 - 4); ctx.lineTo(r.x + r.w, r.y + r.h/2 - 4);
      ctx.moveTo(r.x, r.y + r.h/2 + 4); ctx.lineTo(r.x + r.w, r.y + r.h/2 + 4);
    } else {
      ctx.moveTo(r.x + r.w/2 - 4, r.y); ctx.lineTo(r.x + r.w/2 - 4, r.y + r.h);
      ctx.moveTo(r.x + r.w/2 + 4, r.y); ctx.lineTo(r.x + r.w/2 + 4, r.y + r.h);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ۳. خط‌کشی عابر پیاده در تقاطع‌ها
  for(const inter of CR.world.intersections){
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    // خطوط عابر
    for(let d = -inter.size/2 + 10; d < inter.size/2 - 10; d += 24){
      ctx.fillRect(inter.x + d, inter.y - inter.size/2 - 14, 14, 12);
      ctx.fillRect(inter.x + d, inter.y + inter.size/2 + 2, 14, 12);
      ctx.fillRect(inter.x - inter.size/2 - 14, inter.y + d, 12, 14);
      ctx.fillRect(inter.x + inter.size/2 + 2, inter.y + d, 12, 14);
    }
  }

  // ۴. رسم رد لاستیک‌ها (Skidmarks) روی آسفالت
  for(const sm of CR.skidmarks){
    ctx.fillStyle = 'rgba(10, 10, 15, ' + sm.alpha + ')';
    ctx.fillRect(sm.x1 - 2, sm.y1 - 2, 4, 4);
    ctx.fillRect(sm.x2 - 2, sm.y2 - 2, 4, 4);
  }

  // ۵. ساختمان‌های سه‌بعدی و سایه‌ها
  for(const b of CR.world.buildings){
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(b.x + 24, b.y + 24, b.w, b.h);

    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.strokeStyle = b.trimColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);

    if(curMap.weather === 'night' || curMap.weather === 'rain'){
      ctx.fillStyle = 'rgba(255, 215, 110, 0.5)';
      for(let wx = b.x + 45; wx < b.x + b.w - 45; wx += 65){
        for(let wy = b.y + 45; wy < b.y + b.h - 45; wy += 65){
          ctx.fillRect(wx, wy, 26, 26);
        }
      }
    }
  }

  // ۶. وسایل خیابانی (درختان، چراغ‌ها، نیمکت‌ها)
  for(const pr of CR.world.props){
    if(pr.type === 'tree'){
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(pr.x - 4, pr.y - 4, 18, 0, Math.PI * 2);
      ctx.fill();
    } else if(pr.type === 'light'){
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(pr.x - 3, pr.y - 3, 6, 6);
      if(curMap.weather === 'night' || curMap.weather === 'rain'){
        const lg = ctx.createRadialGradient(pr.x, pr.y, 5, pr.x, pr.y, 90);
        lg.addColorStop(0, 'rgba(255, 215, 110, 0.4)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 90, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if(pr.type === 'bench'){
      ctx.fillStyle = '#78350f';
      ctx.fillRect(pr.x - 8, pr.y - 4, 16, 8);
    }
  }

  // ۷. ترافیک NPC
  for(const npc of CR.world.traffic){
    ctx.save();
    ctx.translate(npc.x, npc.y);
    ctx.rotate(npc.angle);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(-npc.w/2 + 2, -npc.h/2 + 3, npc.w, npc.h);
    ctx.fillStyle = npc.color;
    ctx.beginPath();
    ctx.roundRect(-npc.w/2, -npc.h/2, npc.w, npc.h, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(15,23,42,0.85)';
    ctx.fillRect(-10, -9, 20, 18);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(npc.w/2 - 4, -npc.h/2 + 2, 4, 6);
    ctx.fillRect(npc.w/2 - 4, npc.h/2 - 8, 4, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-npc.w/2, -npc.h/2 + 2, 4, 6);
    ctx.fillRect(-npc.w/2, npc.h/2 - 8, 4, 6);
    ctx.restore();
  }

  // ۸. ذرات دود و آتش نیترو
  for(const pt of CR.particles){
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.c;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ۹. رسم خودروی بازیکن با جزئیات کامل و هایپررئال (دنا، پارس، پیکان)
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // سایه نرم واقع‌گرایانه
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(-30, -17, 60, 34, 10);
  ctx.fill();

  // چراغ جلو با پرتو نور
  if(p.headlights){
    const beam = ctx.createRadialGradient(28, 0, 10, 200, 0, 240);
    beam.addColorStop(0, curCar.id==='dena' ? 'rgba(224, 242, 254, 0.9)' : 'rgba(255, 255, 230, 0.85)');
    beam.addColorStop(0.6, curCar.id==='dena' ? 'rgba(56, 189, 248, 0.38)' : 'rgba(255, 215, 110, 0.28)');
    beam.addColorStop(1, 'transparent');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(28, -12);
    ctx.lineTo(260, -90);
    ctx.lineTo(260, 90);
    ctx.lineTo(28, 12);
    ctx.closePath();
    ctx.fill();
  }

  const carCol = custom.color || curCar.defaultColor;

  if(curCar.id === 'paykan'){
    // پیکان جوانان: فرم جعبه‌ای کلاسیک با سپرهای کرومی براق، چراغ‌های گرد دوبل
    ctx.fillStyle = carCol;
    ctx.beginPath();
    ctx.roundRect(-28, -14, 56, 28, 3);
    ctx.fill();

    // سپرهای کرومی براق با هایلایت نقره‌ای
    const chrome = ctx.createLinearGradient(0, -15, 0, 15);
    chrome.addColorStop(0, '#ffffff'); chrome.addColorStop(0.5, '#cbd5e1'); chrome.addColorStop(1, '#64748b');
    ctx.fillStyle = chrome;
    ctx.fillRect(-31, -15, 3.5, 30);
    ctx.fillRect(28, -15, 3.5, 30);

    // سقف و شیشه‌های قائم نوستالژیک
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(-10, -11, 21, 22);

    // چراغ‌های گرد دوبل زرد کهربایی
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(27, -8, 3.2, 0, Math.PI * 2);
    ctx.arc(27, 8, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // چراغ‌های عمودی عقب
    ctx.fillStyle = (CR.keys.down || CR.keys.space) ? '#ff2222' : '#991b1b';
    ctx.fillRect(-29, -11, 2, 6);
    ctx.fillRect(-29, 5, 2, 6);

  } else if(curCar.id === 'pars'){
    // پژو پارس ELX: فرم کشیده، زه‌های جانبی مشکی، مه‌شکن و چراغ‌های عقب ELX
    ctx.fillStyle = carCol;
    ctx.beginPath();
    ctx.roundRect(-29, -15, 58, 30, 5);
    ctx.fill();

    // زه‌های مشکی جانبی اصیل پارس
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-26, -15.5, 52, 1.8);
    ctx.fillRect(-26, 13.7, 52, 1.8);

    // شیشه‌ها و ستون‌های ظریف
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-11, -12, 25, 24, 4);
    ctx.fill();

    // چراغ‌های کریستالی جلو پارس
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(26, -13, 4, 7);
    ctx.fillRect(26, 6, 4, 7);

    // چراغ خطر یکپارچه عقب پارس
    ctx.fillStyle = (CR.keys.down || CR.keys.space) ? '#ff2222' : '#b91c1c';
    ctx.fillRect(-29, -13, 3, 8);
    ctx.fillRect(-29, 5, 3, 8);

  } else {
    // دنا پلاس توربو: فرم مدرن و عضلانی، جلوپنجره مشبک، خطوط کاپوت و هدلایت‌های نئونی
    ctx.fillStyle = carCol;
    ctx.beginPath();
    ctx.roundRect(-30, -16, 60, 32, 7);
    ctx.fill();

    // خطوط حجم‌دهنده کاپوت
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(11, -13); ctx.lineTo(28, -10);
    ctx.moveTo(11, 13); ctx.lineTo(28, 10);
    ctx.stroke();

    // شیشه‌های دودی آیرودینامیک
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(-12, -13, 27, 26, 5);
    ctx.fill();

    // هدلایت‌های نئونی فیروزه‌ای دنا
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(27, -14, 4, 8);
    ctx.fillRect(27, 6, 4, 8);

    // چراغ عقب نئونی دنا پلاس
    ctx.fillStyle = (CR.keys.down || CR.keys.space) ? '#ff2222' : '#991b1b';
    ctx.fillRect(-30, -14, 3, 9);
    ctx.fillRect(-30, 5, 3, 9);
  }

  // لاستیک‌های عریض با رینگ‌های متالیک
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-22, -18.5, 12, 4.5);
  ctx.fillRect(-22, 14, 12, 4.5);
  ctx.fillRect(14, -18.5, 12, 4.5);
  ctx.fillRect(14, 14, 12, 4.5);

  ctx.restore(); // پایان رسم بازیکن
  ctx.restore(); // پایان ترنسفورم دوربین

  // باران
  if(curMap.weather === 'rain'){
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for(let i = 0; i < 50; i++){
      const rx = Math.random() * W;
      const ry = Math.random() * H;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 9, ry + 24);
    }
    ctx.stroke();
  }

  ctx.restore();

  crUpdateHud();
  crDrawMinimap();
}

/* ================================================================
   آپدیت کیلومترشمار اختصاصی
   ================================================================ */
function crUpdateHud(){
  const p = CR.p;
  const kmh = Math.round(Math.abs(p.speed) * 11.2);

  const spdEl = document.getElementById('crSpeedNum');
  if(spdEl){
    const s = String(kmh).padStart(3, '۰');
    spdEl.textContent = faStr(s);
  }

  const rpmBar = document.getElementById('crRpmBar');
  const rpmNum = document.getElementById('crRpmNum');
  if(rpmBar) rpmBar.style.width = Math.min(100, ((p.rpm - 900) / 5900) * 100) + '%';
  if(rpmNum) rpmNum.textContent = faStr(String(p.rpm));

  const gearNum = document.getElementById('crGearNum');
  const gearMode = document.getElementById('crGearMode');
  if(gearNum) gearNum.textContent = faStr(String(p.gear));
  if(gearMode) gearMode.textContent = p.gearMode;

  const nitroBar = document.getElementById('crNitroBar');
  if(nitroBar) nitroBar.style.width = p.nitro + '%';

  const healthBar = document.getElementById('crHealthBar');
  if(healthBar) healthBar.style.width = p.health + '%';
}

function crDrawMinimap(){
  const cv = document.getElementById('crMinimap');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const scale = W / CR.world.width;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(148, 180, 224, 0.28)';
  for(const r of CR.world.roads){
    ctx.fillRect(r.x * scale, r.y * scale, Math.max(2, r.w * scale), Math.max(2, r.h * scale));
  }

  ctx.fillStyle = '#ffd76e';
  ctx.beginPath();
  ctx.arc(CR.p.x * scale, CR.p.y * scale, 3.8, 0, Math.PI * 2);
  ctx.fill();
}

function crGameLoop(now){
  if(!CR.active) return;
  const dt = Math.min(0.05, (now - CR.lastTime) / 1000);
  CR.lastTime = now;

  crUpdatePhysics(dt);
  crDrawGame();

  CR.raf = requestAnimationFrame(crGameLoop);
}

function crAttachListeners(wrap){
  window.addEventListener('keydown', e => {
    if(CR.view !== 'ingame') return;
    if(e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') CR.keys.up = true;
    if(e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') CR.keys.down = true;
    if(e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') CR.keys.left = true;
    if(e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') CR.keys.right = true;
    if(e.key === ' ') { e.preventDefault(); CR.keys.space = true; }
    if(e.key === 'Shift') CR.keys.shift = true;
    if(e.key === 'e' || e.key === 'E') crShiftGearUp();
    if(e.key === 'q' || e.key === 'Q') crShiftGearDown();
    if(e.key === 'c' || e.key === 'C') crCycleCamera();
    if(e.key === 'l' || e.key === 'L') { CR.p.headlights = !CR.p.headlights; toast(CR.p.headlights ? 'چراغ‌ها روشن شد' : 'چراغ‌ها خاموش شد', 'eye'); }
    if(e.key === 'Escape') { e.preventDefault(); crPauseGame(); }
  });

  window.addEventListener('keyup', e => {
    if(CR.view !== 'ingame') return;
    if(e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') CR.keys.up = false;
    if(e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') CR.keys.down = false;
    if(e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') CR.keys.left = false;
    if(e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') CR.keys.right = false;
    if(e.key === ' ') CR.keys.space = false;
    if(e.key === 'Shift') CR.keys.shift = false;
  });

  wrap.querySelectorAll('.ctc-btn').forEach(btn => {
    const k = btn.dataset.key;
    if(!k) return;
    const act = () => { CR.keys[k] = true; };
    const deact = () => { CR.keys[k] = false; };
    btn.addEventListener('pointerdown', e => { e.preventDefault(); act(); });
    btn.addEventListener('pointerup', deact);
    btn.addEventListener('pointerleave', deact);
    btn.addEventListener('pointercancel', deact);
  });
}

function crRenderApp(){
  const wrap = CR.container || document.getElementById('crGameWrap');
  if(!wrap) return;

  if(CR.view === 'menu'){
    wrap.innerHTML = crMenuHtml();
  } else if(CR.view === 'select_car'){
    wrap.innerHTML = crSelectCarHtml();
  } else if(CR.view === 'garage'){
    wrap.innerHTML = crGarageHtml();
  } else if(CR.view === 'select_map'){
    wrap.innerHTML = crSelectMapHtml();
  } else if(CR.view === 'controls'){
    wrap.innerHTML = crControlsHtml();
  } else if(CR.view === 'ingame'){
    wrap.innerHTML = crInGameHtml();
    crAttachListeners(wrap);
  }
}

const carracingEng = {
  start(el){
    CR.container = el;
    CR.view = 'menu';
    crRenderApp();
  },
  stop(){
    CR.active = false;
    if(CR.raf) cancelAnimationFrame(CR.raf);
    if(CR.engineGain && CR.audioCtx){
      try{ CR.engineGain.gain.setValueAtTime(0.001, CR.audioCtx.currentTime); }catch(e){}
    }
  },
  key(e){
    if(e.key === 'Escape'){ crPauseGame(); return true; }
    return false;
  }
};

Object.assign(GAME_ENG, {'carracing': carracingEng});
window.carracingEng = carracingEng;
window.CR = CR;
window.crSetView = crSetView;
window.crSelectCar = crSelectCar;
window.crSelectMap = crSelectMap;
window.crSetColor = crSetColor;
window.crSetTint = crSetTint;
window.crUpgradeEngine = crUpgradeEngine;
window.crUpgradeBrake = crUpgradeBrake;
window.crSetPlate = crSetPlate;
window.crStartGame = crStartGame;
window.crPauseGame = crPauseGame;
window.crResumeGame = crResumeGame;
window.crRestartGame = crRestartGame;
window.crExitToMenu = crExitToMenu;
window.crCycleCamera = crCycleCamera;
window.crSetTransmission = crSetTransmission;
window.crShiftGearUp = crShiftGearUp;
window.crShiftGearDown = crShiftGearDown;
