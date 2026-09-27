/* ================================================================
   بازی ماشین‌سواری ایرانی پرمیوم — «رانندگی در شهر» (Speed City Racing) v23.0
   دنا، پژو پارس، پیکان — فیزیک واقعی، کیلومترشمار، گیربکس، گاراژ، مپ‌ها و هوش مصنوعی
   ================================================================ */
'use strict';

const CR_CARS = [
  {
    id: 'dena',
    name: 'دنا پلاس توربو',
    enName: 'Dena Plus Turbo',
    cls: 'سدان اسپرت مدرن',
    desc: 'موتور EF7 توربوشارژ، شتاب عالی، آیرودینامیک تیز و چراغ‌های هدلایت نئونی',
    price: 0,
    topSpeed: 215,
    accel: 0.28,
    brake: 0.42,
    handling: 0.048,
    grip: 0.94,
    weight: 1260,
    power: 150,
    defaultColor: '#e2e8f0',
    colors: ['#e2e8f0', '#0f172a', '#b91c1c', '#1e3a8a', '#d9ae3e'],
    soundPitch: 1.15
  },
  {
    id: 'pars',
    name: 'پژو پارس ELX',
    enName: 'Peugeot Pars ELX',
    cls: 'سدان اصیل و پرطرفدار',
    desc: 'موتور پرشتاب زانتیا (XUM)، پایداری بالا در پیچ‌ها، جلوپنجره کلاسیک و بدنه آیرودینامیک',
    price: 40,
    topSpeed: 205,
    accel: 0.26,
    brake: 0.40,
    handling: 0.052,
    grip: 0.92,
    weight: 1190,
    power: 135,
    defaultColor: '#0f172a',
    colors: ['#0f172a', '#ffffff', '#71717a', '#1e293b', '#854d0e'],
    soundPitch: 1.05
  },
  {
    id: 'paykan',
    name: 'پیکان جوانان ۵۷',
    enName: 'Paykan Javanan 1978',
    cls: 'کلاسیک نوستالژیک ایرانی',
    desc: 'سپر کروم براق، چراغ‌های دوبل گرد، فنربندی نرم، هندلینگ خاص و لذت رانندگی اصیل',
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
    soundPitch: 0.88
  }
];

const CR_MAPS = [
  {
    id: 'city',
    name: 'خیابان‌های تهران (پایتخت)',
    enName: 'City Center',
    desc: 'آسفالت شهری با تقاطع‌ها، برج‌ها، تابلوهای راهنما و ترافیک روان',
    skyTop: '#0d1e3a', skyBot: '#1e3a6a', roadCol: '#272a30',
    weather: 'sunny', gripMod: 1.0, trafficDense: 8,
    ambience: 'city'
  },
  {
    id: 'mountain',
    name: 'جاده چالوس و کوهستان',
    enName: 'Mountain Pass',
    desc: 'پیچ‌های تند و هیجان‌انگیز، صخره‌های مرتفع، گاردریل و هوای مهره‌دار',
    skyTop: '#172554', skyBot: '#3b82f6', roadCol: '#22252a',
    weather: 'cloudy', gripMod: 0.95, trafficDense: 5,
    ambience: 'wind'
  },
  {
    id: 'night',
    name: 'بزرگراه شبانه و چراغ‌های نئونی',
    enName: 'Neon Highway',
    desc: 'اتوبان عریض شبانه، انعکاس چراغ‌های شهری و آسمان پرستاره',
    skyTop: '#050a15', skyBot: '#0f172a', roadCol: '#181b20',
    weather: 'night', gripMod: 1.0, trafficDense: 10,
    ambience: 'highway'
  },
  {
    id: 'rain',
    name: 'مسیر بارانی شمال',
    enName: 'Rainy Coast',
    desc: 'باران ملایم، آسفالت خیس و براق با انعکاس نور، کاهش چسبندگی و صدای قطرات',
    skyTop: '#1e293b', skyBot: '#334155', roadCol: '#1e242b',
    weather: 'rain', gripMod: 0.82, trafficDense: 6,
    ambience: 'rain'
  }
];

const CR_MODES = [
  {id:'free', name:'گشت‌وگذار آزاد', desc:'رانندگی دلخواه در تمام نقشه بدون محدودیت زمانی', icon:'compass'},
  {id:'checkpoint', name:'مسابقه زمانی و چک‌پوینت', desc:'رسیدن به نقاط مشخص شده قبل از اتمام زمان', icon:'clock'},
  {id:'speed', name:'چالش ثبت بالاترین سرعت', desc:'گاز دادن روی آسفالت خط مستقیم و شکستن رکورد سرعت', icon:'zap'},
  {id:'parking', name:'چالش پارک دقیق خودرو', desc:'پارک در محدوده طلایی بدون کوچک‌ترین برخورد', icon:'map-pin'}
];

const CR = {
  view: 'menu', // menu, select_car, garage, select_map, loading, ingame, pause, gameover
  carId: 'dena',
  mapId: 'city',
  mode: 'free',
  cameraMode: 0, // 0: Third Person, 1: Hood, 2: First Person, 3: Far
  camModes: ['نمای پشت (دوربین سوم شخص)', 'نمای روی کاپوت (Hood)', 'نمای راننده (First Person)', 'نمای دور سینمایی'],
  
  // فیزیک خودرو
  p: {
    x: 0, y: 0, z: 0,
    vx: 0, vy: 0,
    angle: -Math.PI / 2,
    speed: 0,
    rpm: 900,
    gear: 1, // 0: R, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5
    gearMode: 'D', // P, R, N, D
    acc: 0,
    steer: 0,
    brake: 0,
    handbrake: false,
    headlights: true,
    turnSignal: 0, // -1: left, 0: none, 1: right
    fuel: 100,
    nitro: 100,
    distance: 0,
    driftScore: 0,
    health: 100
  },

  // دوربین بازی
  cam: { x: 0, y: 0, zoom: 1, smoothAngle: -Math.PI / 2 },
  
  // تنظیمات
  cfg: {
    quality: 'ultra',
    sound: true,
    music: true,
    particles: true,
    controls: 'wasd', // wasd or arrows
    sensitivity: 1.0
  },

  // گاراژ و شخصی‌سازی (ذخیره در localStorage)
  custom: {
    dena: { color: '#e2e8f0', rim: 'sport', tint: 20, height: 0, engineLvl: 1, brakeLvl: 1, plate: '۶۸ ج ۵۴۹ ایران ۲۲' },
    pars: { color: '#0f172a', rim: 'classic', tint: 35, height: -5, engineLvl: 1, brakeLvl: 1, plate: '۱۱ ب ۸۸۳ ایران ۳۳' },
    paykan: { color: '#f59e0b', rim: 'chrome', tint: 0, height: 10, engineLvl: 1, brakeLvl: 1, plate: '۴۴ ص ۱۲۹ ایران ۱۱' }
  },

  // کنترل‌ها
  keys: {
    up: false, down: false, left: false, right: false,
    space: false, shift: false, l: false, c: false
  },

  // محیط و ترافیک
  world: {
    width: 3200,
    height: 3200,
    roads: [],
    buildings: [],
    props: [],
    traffic: [],
    checkpoints: [],
    curCp: 0,
    parkSpot: {x: 400, y: 300, w: 90, h: 50, angle: 0}
  },

  // وضعیت و حلقه
  raf: 0,
  lastTime: 0,
  active: false,
  container: null,
  cv: null,
  ctx: null,
  audioCtx: null,
  engineOsc: null,
  engineGain: null,
  records: {
    bestSpeed: 0,
    totalDistance: 0,
    parkingScore: 0
  }
};

/* ================================================================
   صداهای وب‌اودیو برای موتور و افکت‌ها
   ================================================================ */
function crInitAudio(){
  if(CR.audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    CR.audioCtx = new AudioContext();
    
    // اسیلاتور موتور
    CR.engineOsc = CR.audioCtx.createOscillator();
    CR.engineGain = CR.audioCtx.createGain();
    CR.engineOsc.type = 'sawtooth';
    CR.engineGain.gain.setValueAtTime(0.001, CR.audioCtx.currentTime);
    CR.engineOsc.connect(CR.engineGain);
    CR.engineGain.connect(CR.audioCtx.destination);
    CR.engineOsc.start();
  } catch(e){}
}

function crUpdateSound(){
  if(!CR.audioCtx || !CR.engineOsc || !CR.cfg.sound) return;
  try {
    const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
    const baseFreq = 45 * curCar.soundPitch;
    const targetFreq = baseFreq + (CR.p.rpm / 7000) * 160;
    CR.engineOsc.frequency.setTargetAtTime(targetFreq, CR.audioCtx.currentTime, 0.05);

    let vol = 0.03 + (CR.p.rpm / 7000) * 0.06;
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
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      g.gain.setValueAtTime(0.12, now);
      g.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if(type === 'crash'){
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      g.gain.setValueAtTime(0.2, now);
      g.gain.linearRampToValueAtTime(0, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    } else if(type === 'nitro'){
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.3);
      g.gain.setValueAtTime(0.15, now);
      g.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    }
  } catch(e){}
}

/* ================================================================
   تولید نقشه و محیط پویا
   ================================================================ */
function crBuildWorld(){
  const W = CR.world.width;
  const H = CR.world.height;
  CR.world.roads = [];
  CR.world.buildings = [];
  CR.world.props = [];
  CR.world.traffic = [];
  CR.world.checkpoints = [];

  // شبکه خیابان‌های پایتخت و بزرگراه
  const roadW = 160;
  // خیابان‌های افقی
  for(let y = 400; y < H; y += 700){
    CR.world.roads.push({x: 0, y: y - roadW/2, w: W, h: roadW, dir: 'h'});
  }
  // خیابان‌های عمودی
  for(let x = 400; x < W; x += 700){
    CR.world.roads.push({x: x - roadW/2, y: 0, w: roadW, h: H, dir: 'v'});
  }

  // ساختمان‌ها و بلوک‌های شهری
  for(let x = 100; x < W - 200; x += 700){
    for(let y = 100; y < H - 200; y += 700){
      const bw = 460;
      const bh = 460;
      const floors = Math.floor(Math.random() * 8 + 3);
      CR.world.buildings.push({
        x, y, w: bw, h: bh,
        floors,
        color: CR.mapId === 'night' ? '#111827' : (Math.random() > 0.5 ? '#1f293d' : '#27354f'),
        trimColor: Math.random() > 0.5 ? '#d9ae3e' : '#38bdf8'
      });
      // درختان و چراغ‌های کنار جدول
      CR.world.props.push({type: 'tree', x: x - 25, y: y + 80});
      CR.world.props.push({type: 'tree', x: x + bw + 25, y: y + 200});
      CR.world.props.push({type: 'light', x: x - 35, y: y + 250});
      CR.world.props.push({type: 'light', x: x + bw + 35, y: y + 350});
    }
  }

  // خودروهای NPC و ترافیک شهری
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const npcCount = curMap.trafficDense;
  for(let i = 0; i < npcCount; i++){
    const isHoriz = Math.random() > 0.5;
    const roadIdx = Math.floor(Math.random() * 4);
    const posOnRoad = Math.random() * (W - 400) + 200;
    const roadCoord = 400 + roadIdx * 700;
    
    CR.world.traffic.push({
      id: i,
      x: isHoriz ? posOnRoad : roadCoord + (Math.random() > 0.5 ? 40 : -40),
      y: isHoriz ? roadCoord + (Math.random() > 0.5 ? 40 : -40) : posOnRoad,
      angle: isHoriz ? (Math.random() > 0.5 ? 0 : Math.PI) : (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2),
      speed: Math.random() * 2 + 3,
      color: ['#ffffff', '#0f172a', '#71717a', '#b91c1c', '#2563eb'][i % 5],
      w: 48, h: 24
    });
  }

  // چک‌پوینت‌های حالت رکوردی
  CR.world.checkpoints = [
    {x: 400, y: 1100, r: 120, name: 'میدان آزادی'},
    {x: 1800, y: 1100, r: 120, name: 'تقاطع ولیعصر'},
    {x: 1800, y: 2500, r: 120, name: 'ورودی بزرگراه همت'},
    {x: 2500, y: 2500, r: 120, name: 'خط پایان'}
  ];
  CR.world.curCp = 0;

  // موقعیت پارک
  CR.world.parkSpot = {x: 480, y: 400, w: 80, h: 46, angle: 0};
}

/* ================================================================
   ریست و ستاپ وضعیت خودروی بازیکن
   ================================================================ */
function crResetCar(){
  CR.p.x = 400;
  CR.p.y = 400;
  CR.p.vx = 0;
  CR.p.vy = 0;
  CR.p.speed = 0;
  CR.p.angle = 0;
  CR.p.rpm = 900;
  CR.p.gear = 1;
  CR.p.gearMode = 'D';
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
   رندر و ساختار UI بازی
   ================================================================ */
function crMenuHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper">'
    // پس‌زمینه سینمایی
    +'<div class="cr-cinema-bg">'
      +'<div class="cr-hero-cover-art">'+(typeof gcov==='function'?gcov('carracing'):'')+'</div>'
      +'<div class="cr-cinema-overlay"></div>'
    +'</div>'

    // منوی اصلی بازی
    +'<div class="cr-main-panel">'
      +'<div class="cr-header">'
        +'<div class="cr-title-box">'
          +'<span class="cr-badge">'+ic('zap',13)+'رانندگی و مسابقه ایرانی — نسخه ۲۳</span>'
          +'<h1>شبیه‌ساز رانندگی <span class="g">نت‌یار اسپید</span></h1>'
          +'<p>دنا پلاس، پژو پارس و پیکان جوانان — فیزیک روان و واقعی، شخصی‌سازی گاراژ، مپ‌های متنوع و کنترل آسان</p>'
        +'</div>'
        +'<div class="cr-car-badge-card" onclick="crSetView(\'select_car\')">'
          +'<div class="ccb-info">'
            +'<span class="ccb-lbl">خودروی فعال شما:</span>'
            +'<b>'+curCar.name+'</b>'
            +'<i>'+curCar.cls+'</i>'
          +'</div>'
          +'<div class="ccb-color-dot" style="background:'+(custom.color||curCar.defaultColor)+'"></div>'
          +'<button class="btn gold small">'+ic('car',12)+'تغییر خودرو</button>'
        +'</div>'
      +'</div>'

      // دکمه‌های اصلی و حالت‌ها
      +'<div class="cr-menu-grid">'
        +'<div class="cr-action-card primary" onclick="crStartGame()">'
          +'<div class="cac-ic">'+ic('play',26)+'</div>'
          +'<div class="cac-tt">'
            +'<b>شروع رانندگی و مسابقه</b>'
            +'<span>ورود فوری به مپ «'+curMap.name+'» با '+curCar.name+'</span>'
          +'</div>'
          +'<span class="cac-arrow">'+ic('arrow-left',16)+'</span>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'select_car\')">'
          +'<div class="cac-ic">'+ic('car',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>انتخاب خودرو</b>'
            +'<span>دنا، پژو پارس، پیکان — مشاهده جزئیات فنی و شتاب</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'garage\')">'
          +'<div class="cac-ic">'+ic('wrench',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>گاراژ و شخصی‌سازی</b>'
            +'<span>رنگ بدنه، رینگ اسپرت، دودی شیشه و ارتقای موتور</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'select_map\')">'
          +'<div class="cac-ic">'+ic('compass',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>انتخاب مپ و وضعیت هوا</b>'
            +'<span>شهر تهران، جاده کوهستان چالوس، بزرگراه شب و بارانی</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="crSetView(\'controls\')">'
          +'<div class="cac-ic">'+ic('activity',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>راهنمای کنترل و کلیدها</b>'
            +'<span>W/A/S/D یا فلش‌ها، ترمز دستی با Space، نیترو با Shift</span>'
          +'</div>'
        +'</div>'

        +'<div class="cr-action-card" onclick="go(\'games\')">'
          +'<div class="cac-ic">'+ic('log-out',22)+'</div>'
          +'<div class="cac-tt">'
            +'<b>خروج به بازی‌خانه</b>'
            +'<span>بازگشت به لیست بازی‌های کافی‌نت نت‌یار</span>'
          +'</div>'
        +'</div>'
      +'</div>'

      // نوار رکوردهای رانندگی
      +'<div class="cr-footer-stats">'
        +'<span>'+ic('zap',13)+' حداکثر سرعت ثبت‌شده: <b>'+faNum(CR.records.bestSpeed)+' KM/H</b></span>'
        +'<span>'+ic('navigation',13)+' مجموع مسافت پیموده شده: <b>'+faNum((CR.records.totalDistance/1000).toFixed(1))+' کیلومتر</b></span>'
        +'<span>'+ic('shield',13)+' فیزیک ۶۰ فریم بر ثانیه · کاملاً روان و بدون لگ</span>'
      +'</div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   صفحه انتخاب خودرو با پیش‌نمایش گرافیکی
   ================================================================ */
function crSelectCarHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>انتخاب خودروی مسابقه‌ای</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' شروع بازی با این ماشین</button>'
    +'</div>'

    +'<div class="cr-car-select-layout">'
      // لیست کارت‌های انتخاب
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
              +'<span>'+ic('activity',11)+' '+faNum(c.power)+' اسب‌بخار</span>'
            +'</div>'
          +'</div>';
        }).join('')
      +'</div>'

      // پنل مشخصات فنی خودرو انتخاب شده
      +'<div class="cr-car-details-panel">'
        +'<div class="cdp-title">'
          +'<span class="badge gold">'+curCar.cls+'</span>'
          +'<h3>'+curCar.name+'</h3>'
          +'<p>'+curCar.desc+'</p>'
        +'</div>'

        +'<div class="cdp-bars">'
          +crSpecBar('حداکثر سرعت', (curCar.topSpeed/240)*100, faNum(curCar.topSpeed) + ' KM/H')
          +crSpecBar('شتاب اولیه (۰ تا ۱۰۰)', (curCar.accel/0.32)*100, (curCar.accel*100).toFixed(0) + ' %')
          +crSpecBar('هندلینگ و فرمان‌پذیری', (curCar.handling/0.06)*100, (curCar.handling*1000).toFixed(0) + ' pt')
          +crSpecBar('قدرت ترمزگیری', (curCar.brake/0.5)*100, (curCar.brake*100).toFixed(0) + ' %')
          +crSpecBar('چسبندگی لاستیک (Grip)', curCar.grip*100, (curCar.grip*100).toFixed(0) + ' %')
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
   گاراژ شخصی‌سازی خودرو
   ================================================================ */
function crGarageHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const custom = CR.custom[CR.carId] || {};

  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>گاراژ شخصی‌سازی «'+curCar.name+'»</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' تست در جاده</button>'
    +'</div>'

    +'<div class="cr-garage-layout">'
      // استیج ماشین در گاراژ
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

      // ابزارهای شخصی‌سازی
      +'<div class="cr-garage-controls">'
        // ۱. انتخاب رنگ بدنه
        +'<div class="cgc-section">'
          +'<label>'+ic('palette',14)+' انتخاب رنگ بدنه:</label>'
          +'<div class="cgc-colors">'
            +curCar.colors.map(col => '<span class="cgc-col-btn'+(custom.color===col?' active':'')+'" style="background:'+col+'" onclick="crSetColor(\''+col+'\')"></span>').join('')
          +'</div>'
        +'</div>'

        // ۲. دودی شیشه‌ها
        +'<div class="cgc-section">'
          +'<label>'+ic('eye',14)+' درصد دودی شیشه‌ها:</label>'
          +'<div class="cgc-btns-group">'
            +[0, 20, 45, 70].map(t => '<button class="btn small'+(custom.tint===t?' gold':' ghost')+'" onclick="crSetTint('+t+')">'+faNum(t)+'%</button>').join('')
          +'</div>'
        +'</div>'

        // ۳. ارتقای موتور و ترمز
        +'<div class="cgc-section">'
          +'<label>'+ic('zap',14)+' ارتقای تیونینگ و قدرت:</label>'
          +'<div class="cgc-tuning-row">'
            +'<span>موتور ریمپ شده (Stage 2)</span>'
            +'<button class="btn gold small" onclick="crUpgradeEngine()">'+ic('check',12)+' اعمال ریمپ</button>'
          +'</div>'
          +'<div class="cgc-tuning-row">'
            +'<span>دیسک ترمز خنک‌شونده</span>'
            +'<button class="btn gold small" onclick="crUpgradeBrake()">'+ic('check',12)+' ارتقای ترمز</button>'
          +'</div>'
        +'</div>'

        // ۴. پلاک خودرو
        +'<div class="cgc-section">'
          +'<label>'+ic('tag',14)+' شماره پلاک اختصاصی:</label>'
          +'<input type="text" class="cgc-plate-input" value="'+(custom.plate||'۶۸ ج ۵۴۹ ایران ۲۲')+'" onchange="crSetPlate(this.value)">'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   صفحه انتخاب مپ
   ================================================================ */
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

/* ================================================================
   راهنمای کنترل و تنظیمات
   ================================================================ */
function crControlsHtml(){
  return '<div class="cr-wrapper cr-panel-view">'
    +'<div class="cr-view-header">'
      +'<button class="btn ghost small" onclick="crSetView(\'menu\')">'+ic('arrow-right',14)+' بازگشت به منو</button>'
      +'<h2>راهنمای کنترل خودرو و کلیدها</h2>'
      +'<button class="btn gold small" onclick="crStartGame()">'+ic('play',14)+' شروع رانندگی</button>'
    +'</div>'

    +'<div class="cr-controls-grid">'
      +'<div class="cr-ctrl-card"><span class="cr-key">W / ↑</span><b>گاز دادن و شتاب گرفتن خودرو</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">S / ↓</span><b>ترمز شدید / دنده عقب (R)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">A / ←</span><b>فرمان به چپ</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">D / →</span><b>فرمان به راست</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Space</span><b>ترمز دستی (دریفت و چرخش سریع)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Shift</span><b>نیترو بوست (شتاب آنی)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">C</span><b>تغییر دوربین (سوم‌شخص، کاپوت، داخل، دور)</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">L</span><b>چراغ‌های جلو / نور بالا</b></div>'
      +'<div class="cr-ctrl-card"><span class="cr-key">Esc</span><b>توقف بازی (Pause Menu)</b></div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   صفحه داخل بازی با کیلومترشمار مدرن HUD
   ================================================================ */
function crInGameHtml(){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];

  return '<div class="cr-ingame-wrap">'
    // کانواس رندر بازی
    +'<canvas id="crCanvas" width="1280" height="720"></canvas>'

    // نوار بالای صفحه (مود، زمان و مینی‌مپ)
    +'<div class="cr-hud-top">'
      +'<div class="cht-badge">'
        +'<span class="cht-dot"></span>'
        +'<b>'+curMap.name+'</b>'
        +'<span>'+curCar.name+'</span>'
      +'</div>'
      +'<div class="cht-cam-lbl" id="crCamLbl">'+CR.camModes[CR.cameraMode]+' (کلید C)</div>'
      +'<button class="btn ghost small" onclick="crPauseGame()">'+ic('pause',14)+' مکث (Esc)</button>'
    +'</div>'

    // مینی‌مپ گوشه بالا
    +'<div class="cr-minimap-wrap">'
      +'<canvas id="crMinimap" width="140" height="140"></canvas>'
    +'</div>'

    // کیلومترشمار دیجیتال و آنالوگ لوکس در پایین
    +'<div class="cr-speedo-hud">'
      +'<div class="csh-dial">'
        +'<div class="csh-speed-num" id="crSpeedNum">۰۰۰</div>'
        +'<div class="csh-unit">KM/H</div>'
        +'<div class="csh-rpm-bar"><div class="crb-fill" id="crRpmBar" style="width:15%"></div></div>'
        +'<div class="csh-rpm-text"><span id="crRpmNum">۹۰۰</span> RPM</div>'
      +'</div>'

      // نشانگر دنده و وضعیت گیربکس
      +'<div class="csh-gear-box">'
        +'<div class="cgb-mode" id="crGearMode">D</div>'
        +'<div class="cgb-gear">دنده <b id="crGearNum">۱</b></div>'
      +'</div>'

      // نیترو و باک بنزین
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

    // کنترل‌های لمسی موبایل
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

    // منوی مکث (Pause Overlay)
    +'<div class="cr-pause-overlay" id="crPauseOverlay" style="display:none">'
      +'<div class="cpo-modal">'
        +'<h3>بازی متوقف شد</h3>'
        +'<p>می‌توانید بازی را ادامه دهید، از نو شروع کنید یا به منوی بازی برگردید.</p>'
        +'<div class="cpo-acts">'
          +'<button class="btn gold" onclick="crResumeGame()">'+ic('play',16)+' ادامه بازی</button>'
          +'<button class="btn primary" onclick="crRestartGame()">'+ic('refresh-cw',16)+' شروع مجدد</button>'
          +'<button class="btn ghost" onclick="crCycleCamera()">'+ic('camera',16)+' تغییر دوربین ('+CR.camModes[CR.cameraMode]+')</button>'
          +'<button class="btn ghost" onclick="crExitToMenu()">'+ic('log-out',16)+' خروج به منوی اصلی</button>'
        +'</div>'
      +'</div>'
    +'</div>'
  +'</div>';
}

/* ================================================================
   کنترل‌های وضعیت و اکشن‌ها
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
   هسته فیزیک و حلقه بازی (Real Momentum & Physics)
   ================================================================ */
function crUpdatePhysics(dt){
  const curCar = CR_CARS.find(c => c.id === CR.carId) || CR_CARS[0];
  const curMap = CR_MAPS.find(m => m.id === CR.mapId) || CR_MAPS[0];
  const p = CR.p;

  // شتاب‌گیری و ترمز
  let throttle = 0;
  if(CR.keys.up) throttle = 1;
  else if(CR.keys.down) throttle = -0.6;

  // نیترو
  let nitroBoost = 1;
  if(CR.keys.shift && p.nitro > 0 && throttle > 0){
    nitroBoost = 1.45;
    p.nitro = Math.max(0, p.nitro - dt * 25);
    crSfx('nitro');
  } else if(!CR.keys.shift && p.nitro < 100){
    p.nitro = Math.min(100, p.nitro + dt * 4);
  }

  // فرمان‌دهی
  const maxSteer = curCar.handling;
  if(CR.keys.left){
    p.steer = Math.max(-maxSteer, p.steer - dt * 0.2);
    p.turnSignal = -1;
  } else if(CR.keys.right){
    p.steer = Math.min(maxSteer, p.steer + dt * 0.2);
    p.turnSignal = 1;
  } else {
    p.steer *= 0.8;
    p.turnSignal = 0;
  }

  // ترمز دستی
  const grip = (CR.keys.space ? 0.72 : curCar.grip) * curMap.gripMod;

  // محاسبه سرعت و نیرو
  const maxSpd = (curCar.topSpeed / 3.6) * 0.35 * nitroBoost;
  if(throttle > 0){
    p.speed += curCar.accel * throttle * nitroBoost * dt * 35;
    if(p.speed > maxSpd) p.speed = maxSpd;
  } else if(throttle < 0){
    // ترمز یا دنده عقب
    if(p.speed > 0.5){
      p.speed -= curCar.brake * dt * 50;
      if(p.speed < 0) p.speed = 0;
    } else {
      p.speed -= curCar.accel * 0.4 * dt * 30;
      if(p.speed < -maxSpd * 0.3) p.speed = -maxSpd * 0.3;
    }
  } else {
    // اصطکاک طبیعی هوا و لاستیک
    p.speed *= (0.985 * grip);
    if(Math.abs(p.speed) < 0.05) p.speed = 0;
  }

  // چرخش زاویه بدنه خودرو
  if(Math.abs(p.speed) > 0.1){
    const dir = p.speed > 0 ? 1 : -1;
    p.angle += p.steer * (p.speed / maxSpd) * dir;
  }

  // بردار سرعت
  p.vx = Math.cos(p.angle) * p.speed;
  p.vy = Math.sin(p.angle) * p.speed;

  p.x += p.vx;
  p.y += p.vy;

  // محدوده نقشه
  p.x = Math.max(80, Math.min(CR.world.width - 80, p.x));
  p.y = Math.max(80, Math.min(CR.world.height - 80, p.y));

  // مسافت طی شده و رکورد
  p.distance += Math.abs(p.speed);
  const kmh = Math.round(Math.abs(p.speed) * 11.2);
  if(kmh > CR.records.bestSpeed){
    CR.records.bestSpeed = kmh;
  }
  CR.records.totalDistance += Math.abs(p.speed) * 0.1;

  // شبیه‌سازی گیربکس و دور موتور (RPM)
  const ratio = Math.abs(p.speed) / maxSpd;
  let gear = 1;
  let gearRatio = ratio;
  if(p.speed < -0.1){
    p.gearMode = 'R';
    gear = 1;
    gearRatio = Math.abs(p.speed) / (maxSpd * 0.3);
  } else {
    p.gearMode = 'D';
    if(ratio < 0.2) { gear = 1; gearRatio = ratio / 0.2; }
    else if(ratio < 0.4) { gear = 2; gearRatio = (ratio - 0.2) / 0.2; }
    else if(ratio < 0.65) { gear = 3; gearRatio = (ratio - 0.4) / 0.25; }
    else if(ratio < 0.85) { gear = 4; gearRatio = (ratio - 0.65) / 0.2; }
    else { gear = 5; gearRatio = (ratio - 0.85) / 0.15; }
  }
  p.gear = gear;
  p.rpm = Math.min(6800, Math.max(900, Math.round(900 + gearRatio * 5200 + (throttle > 0 ? 600 : 0))));

  // برخورد با ساختمان‌ها
  for(const b of CR.world.buildings){
    if(p.x > b.x - 20 && p.x < b.x + b.w + 20 && p.y > b.y - 20 && p.y < b.y + b.h + 20){
      p.speed = -p.speed * 0.4;
      p.x -= p.vx * 1.5;
      p.y -= p.vy * 1.5;
      p.health = Math.max(10, p.health - 5);
      crSfx('crash');
    }
  }

  // حرکت ترافیک NPC
  for(const npc of CR.world.traffic){
    npc.x += Math.cos(npc.angle) * npc.speed;
    npc.y += Math.sin(npc.angle) * npc.speed;
    if(npc.x < 50) npc.x = CR.world.width - 100;
    if(npc.x > CR.world.width - 50) npc.x = 100;
    if(npc.y < 50) npc.y = CR.world.height - 100;
    if(npc.y > CR.world.height - 50) npc.y = 100;

    // تصادف با خودروی بازیکن
    const distToPlayer = Math.hypot(npc.x - p.x, npc.y - p.y);
    if(distToPlayer < 40){
      p.speed = -p.speed * 0.5;
      npc.speed *= 0.5;
      p.health = Math.max(10, p.health - 10);
      crSfx('crash');
    }
  }

  // تعقیب نرم دوربین
  const camLag = 0.12;
  CR.cam.x += (p.x - CR.cam.x) * camLag;
  CR.cam.y += (p.y - CR.cam.y) * camLag;
  let angleDiff = p.angle - CR.cam.smoothAngle;
  while(angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  while(angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  CR.cam.smoothAngle += angleDiff * 0.08;

  // آپدیت صدا
  crUpdateSound();
}

/* ================================================================
   رندر کانواس و گرافیک بازی (Canvas Render)
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

  // پس‌زمینه آسمان و اتمسفر مپ
  ctx.fillStyle = curMap.skyTop;
  ctx.fillRect(0, 0, W, H);

  // ترنسفورم دوربین
  ctx.save();
  ctx.translate(W/2, H/2);

  // حالت‌های مختلف دوربین
  if(CR.cameraMode === 0){
    // Third Person: دوربین در زاویه حرکت خودرو
    ctx.rotate(-CR.cam.smoothAngle - Math.PI/2);
    ctx.translate(-CR.cam.x, -CR.cam.y + 120);
  } else if(CR.cameraMode === 1){
    // Hood Camera: چسبیده به کاپوت
    ctx.rotate(-p.angle - Math.PI/2);
    ctx.translate(-p.x, -p.y + 40);
  } else if(CR.cameraMode === 2){
    // First Person: از داخل کابین
    ctx.rotate(-p.angle - Math.PI/2);
    ctx.translate(-p.x, -p.y);
  } else {
    // Far Camera: نمای بالا و دور
    ctx.translate(-CR.cam.x, -CR.cam.y);
  }

  // ۱. زمین و چمن اطراف
  ctx.fillStyle = curMap.roadCol === '#181b20' ? '#090d16' : '#142018';
  ctx.fillRect(0, 0, CR.world.width, CR.world.height);

  // ۲. خیابان‌ها و آسفالت
  for(const r of CR.world.roads){
    ctx.fillStyle = curMap.roadCol;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // خط‌کشی وسط خیابان
    ctx.strokeStyle = '#ffd76e';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 20]);
    ctx.beginPath();
    if(r.dir === 'h'){
      ctx.moveTo(r.x, r.y + r.h/2);
      ctx.lineTo(r.x + r.w, r.y + r.h/2);
    } else {
      ctx.moveTo(r.x + r.w/2, r.y);
      ctx.lineTo(r.x + r.w/2, r.y + r.h);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ۳. ساختمان‌ها و برج‌ها
  for(const b of CR.world.buildings){
    // سایه ساختمان
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(b.x + 20, b.y + 20, b.w, b.h);

    // بدنه ساختمان
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // حاشیه و خطوط نمای مدرن
    ctx.strokeStyle = b.trimColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x + 10, b.y + 10, b.w - 20, b.h - 20);

    // پنجره‌های نورانی شب
    if(curMap.weather === 'night' || curMap.weather === 'rain'){
      ctx.fillStyle = 'rgba(255, 215, 110, 0.45)';
      for(let wx = b.x + 40; wx < b.x + b.w - 40; wx += 60){
        for(let wy = b.y + 40; wy < b.y + b.h - 40; wy += 60){
          ctx.fillRect(wx, wy, 24, 24);
        }
      }
    }
  }

  // ۴. عناصر محیطی (درختان و چراغ‌ها)
  for(const pr of CR.world.props){
    if(pr.type === 'tree'){
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if(pr.type === 'light'){
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(pr.x - 3, pr.y - 3, 6, 6);
      if(curMap.weather === 'night' || curMap.weather === 'rain'){
        // هاله نور چراغ
        const lg = ctx.createRadialGradient(pr.x, pr.y, 4, pr.x, pr.y, 80);
        lg.addColorStop(0, 'rgba(255, 215, 110, 0.35)');
        lg.addColorStop(1, 'transparent');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, 80, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ۵. ترافیک NPC
  for(const npc of CR.world.traffic){
    ctx.save();
    ctx.translate(npc.x, npc.y);
    ctx.rotate(npc.angle);
    ctx.fillStyle = npc.color;
    ctx.fillRect(-npc.w/2, -npc.h/2, npc.w, npc.h);
    // چراغ جلو
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(npc.w/2 - 4, -npc.h/2 + 2, 4, 5);
    ctx.fillRect(npc.w/2 - 4, npc.h/2 - 7, 4, 5);
    // چراغ خطر عقب
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-npc.w/2, -npc.h/2 + 2, 4, 5);
    ctx.fillRect(-npc.w/2, npc.h/2 - 7, 4, 5);
    ctx.restore();
  }

  // ۶. رسم خودروی بازیکن (دنا، پارس یا پیکان)
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // سایه خودرو
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(-28, -16, 56, 32, 8);
  ctx.fill();

  // چراغ‌های جلو با پرتو نور بر روی آسفالت
  if(p.headlights){
    const beam = ctx.createRadialGradient(28, 0, 10, 180, 0, 200);
    beam.addColorStop(0, 'rgba(255, 255, 230, 0.75)');
    beam.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
    beam.addColorStop(1, 'transparent');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(26, -10);
    ctx.lineTo(220, -70);
    ctx.lineTo(220, 70);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fill();
  }

  // بدنه خودرو
  const carCol = custom.color || curCar.defaultColor;
  ctx.fillStyle = carCol;
  ctx.beginPath();
  ctx.roundRect(-26, -14, 52, 28, 6);
  ctx.fill();

  // سقف و شیشه‌ها
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(-10, -11, 24, 22, 4);
  ctx.fill();

  // کاپوت و خطوط بدنه
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, -10); ctx.lineTo(24, -8);
  ctx.moveTo(14, 10); ctx.lineTo(24, 8);
  ctx.stroke();

  // چراغ‌های جلو
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(24, -12, 4, 6);
  ctx.fillRect(24, 6, 4, 6);

  // چراغ‌های عقب (قرمز در حالت ترمز روشن‌تر)
  ctx.fillStyle = (CR.keys.down || CR.keys.space) ? '#ff2222' : '#991b1b';
  ctx.fillRect(-26, -12, 4, 6);
  ctx.fillRect(-26, 6, 4, 6);

  // لاستیک‌ها
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-20, -16, 10, 4);
  ctx.fillRect(-20, 12, 10, 4);
  ctx.fillRect(12, -16, 10, 4);
  ctx.fillRect(12, 12, 10, 4);

  ctx.restore(); // پایان رسم بازیکن

  ctx.restore(); // پایان ترنسفورم دوربین

  // ۷. افکت باران در صورت انتخاب مپ بارانی
  if(curMap.weather === 'rain'){
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for(let i = 0; i < 40; i++){
      const rx = Math.random() * W;
      const ry = Math.random() * H;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 22);
    }
    ctx.stroke();
  }

  ctx.restore();

  // ۸. آپدیت مقادیر HUD و کیلومترشمار
  crUpdateHud();
  crDrawMinimap();
}

/* ================================================================
   آپدیت المان‌های HUD و سرعت
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
  if(rpmBar) rpmBar.style.width = Math.min(100, (p.rpm / 7000) * 100) + '%';
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

/* ================================================================
   رسم مینی‌مپ هماهنگ با جهت خودرو
   ================================================================ */
function crDrawMinimap(){
  const cv = document.getElementById('crMinimap');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const scale = W / CR.world.width;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, W, H);

  // خیابان‌ها روی مینی‌مپ
  ctx.fillStyle = 'rgba(148, 180, 224, 0.25)';
  for(const r of CR.world.roads){
    ctx.fillRect(r.x * scale, r.y * scale, Math.max(2, r.w * scale), Math.max(2, r.h * scale));
  }

  // موقعیت خودروی بازیکن
  ctx.fillStyle = '#ffd76e';
  ctx.beginPath();
  ctx.arc(CR.p.x * scale, CR.p.y * scale, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

/* ================================================================
   حلقه بازی (Game Loop)
   ================================================================ */
function crGameLoop(now){
  if(!CR.active) return;
  const dt = Math.min(0.05, (now - CR.lastTime) / 1000);
  CR.lastTime = now;

  crUpdatePhysics(dt);
  crDrawGame();

  CR.raf = requestAnimationFrame(crGameLoop);
}

/* ================================================================
   راه‌اندازی و اتصال کنترل‌های کیبورد و لمسی
   ================================================================ */
function crAttachListeners(wrap){
  // کلیدهای کیبورد
  window.addEventListener('keydown', e => {
    if(CR.view !== 'ingame') return;
    if(e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') CR.keys.up = true;
    if(e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') CR.keys.down = true;
    if(e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') CR.keys.left = true;
    if(e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') CR.keys.right = true;
    if(e.key === ' ') { e.preventDefault(); CR.keys.space = true; }
    if(e.key === 'Shift') CR.keys.shift = true;
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

  // کنترل‌های لمسی
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

/* ================================================================
   رندر اصلی ماژول ماشین‌بازی
   ================================================================ */
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

// ثبت بازی در سیستم مرکزی بازی‌ها
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
