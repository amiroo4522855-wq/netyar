/* ================================================================
   توربو رانر (Turbo Runner) — پلتفرمر سرعتی فوق حرفه‌ای
   نت‌یار — فیزیک شتاب و مومنتوم، دابل‌جامپ، دش، رول، ۶ جهان، باس‌فایت،
   حلقه‌ها و کریستال‌ها، پاورآپ‌ها و جلوه‌های صوتی Web Audio
   ================================================================ */
'use strict';

const TB_WORLDS = [
  {id:1, name:'جنگل استوایی', theme:'jungle', skyT:'#064e3b', skyB:'#022c22', ground:'#10b981', track:'#047857', bgHills:'#065f46'},
  {id:2, name:'شهر آینده', theme:'cyber', skyT:'#0f172a', skyB:'#1e1b4b', ground:'#38bdf8', track:'#0284c7', bgHills:'#312e81'},
  {id:3, name:'بیابان طلایی', theme:'desert', skyT:'#78350f', skyB:'#451a03', ground:'#f59e0b', track:'#b45309', bgHills:'#92400e'},
  {id:4, name:'منطقه یخی', theme:'ice', skyT:'#0c4a6e', skyB:'#082f49', ground:'#bae6fd', track:'#38bdf8', bgHills:'#0369a1'},
  {id:5, name:'آتشفشان سوزان', theme:'volcano', skyT:'#7f1d1d', skyB:'#450a0a', ground:'#ef4444', track:'#b91c1c', bgHills:'#991b1b'},
  {id:6, name:'مدار فضایی', theme:'space', skyT:'#020617', skyB:'#0f172a', ground:'#a855f7', track:'#7e22ce', bgHills:'#3b0764'}
];

const TB_STORAGE_KEY = 'netyar_turbo_save';

let TB = {
  world: 1,
  stage: 1,
  unlockedWorlds: 1,
  unlockedStages: 1,
  sound: true,
  paused: false,
  gameOver: false,
  stageClear: false,
  raf: 0,
  cv: null,
  ctx: null,
  W: 860,
  H: 480,

  // دوربین
  cam: {x:0, y:0, zoom:1, targetZoom:1},

  // وضعیت و فیزیک بازیکن
  p: {
    x: 80,
    y: 280,
    vx: 0,
    vy: 0,
    w: 26,
    h: 38,
    onGround: false,
    facing: 1, // 1 راست، -1 چپ
    state: 'idle', // idle, run, jump, roll, dash, hit, victory
    animTimer: 0,

    // مکانیک‌های کلیدی
    canDoubleJump: true,
    dashTimer: 0,
    dashCooldown: 0,
    isRolling: false,
    rollTimer: 0,
    spinAttack: false,
    invincibleTimer: 0,

    // آمار و سلامت
    hp: 3,
    maxHp: 3,
    rings: 0,
    crystals: 0,
    score: 0,
    time: 0,
    checkpoint: {x:80, y:280},

    // پاورآپ‌ها
    powerups: {
      shield: false,
      speedBoost: 0,
      magnet: 0,
      invincibility: 0,
      doubleRing: 0
    }
  },

  // المان‌های مرحله
  platforms: [],
  slopes: [],
  springs: [],
  rings: [],
  crystals: [],
  powerupItems: [],
  speedRings: [],
  checkpoints: [],
  enemies: [],
  particles: [],
  trail: [],
  secrets: [],
  secretsFound: 0,
  totalSecrets: 1,
  goalFlag: {x: 4800, y: 300, reached: false},

  // باس‌فایت
  boss: null,

  // ورودی‌های کاربر
  keys: {left:false, right:false, up:false, down:false, jump:false, dash:false}
};

// افکت‌های صوتی با Web Audio API
function tbSfx(type){
  if(!TB.sound) return;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    if(!window._tbAudioCtx) window._tbAudioCtx = new AC();
    const ctx = window._tbAudioCtx;
    if(ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if(type === 'jump'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(320, now);
      o.frequency.exponentialRampToValueAtTime(750, now + 0.15);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.15);
    } else if(type === 'dash'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(550, now);
      o.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.18);
    } else if(type === 'ring'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(987.77, now); // B5
      o.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.16);
    } else if(type === 'spring'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(280, now);
      o.frequency.exponentialRampToValueAtTime(920, now + 0.22);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.22);
    } else if(type === 'hit'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(140, now);
      o.frequency.exponentialRampToValueAtTime(45, now + 0.2);
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.2);
    } else if(type === 'enemy'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(440, now);
      o.frequency.exponentialRampToValueAtTime(880, now + 0.14);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.14);
    } else if(type === 'checkpoint'){
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(523, now);
      o.frequency.setValueAtTime(659, now + 0.1);
      o.frequency.setValueAtTime(784, now + 0.2);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.35);
    } else if(type === 'win'){
      try{ if(typeof gSfx==='function') gSfx('win'); }catch(e){}
    }
  }catch(e){}
}

// ذخیره و بازیابی پیشرفت در localStorage
function tbSaveGame(){
  try{
    const data = {
      unlockedWorlds: TB.unlockedWorlds,
      unlockedStages: TB.unlockedStages,
      bestScore: store.get('turboBest', 0)
    };
    store.set(TB_STORAGE_KEY, data);
  }catch(e){}
}

function tbLoadGame(){
  try{
    const d = store.get(TB_STORAGE_KEY, null);
    if(d){
      TB.unlockedWorlds = d.unlockedWorlds || 1;
      TB.unlockedStages = d.unlockedStages || 1;
    }
  }catch(e){}
}

// تولید مرحله کامل با ۳ مسیر (بالا، وسط، پایین)، دشمنان و باس
function tbBuildStage(worldId, stageNum){
  const p = TB.p;
  p.x = 80;
  p.y = 280;
  p.vx = 0;
  p.vy = 0;
  p.hp = 3;
  p.rings = 0;
  p.crystals = 0;
  p.time = 0;
  p.checkpoint = {x:80, y:280};
  p.powerups = {shield:false, speedBoost:0, magnet:0, invincibility:0, doubleRing:0};
  TB.secretsFound = 0;
  TB.totalSecrets = 2;
  TB.gameOver = false;
  TB.stageClear = false;

  const plats = [];
  const rings = [];
  const crystals = [];
  const springs = [];
  const speedRings = [];
  const enemies = [];
  const checkpoints = [];
  const powerupItems = [];

  // زمین اصلی (مسیر پایین)
  let curX = 0;
  for(let i = 0; i < 24; i++){
    const gap = (i > 1 && i % 4 === 0) ? 90 : 0;
    const w = 240;
    const y = 380 + Math.sin(i * 0.7) * 40;
    plats.push({x: curX + gap, y, w, h: 60, type:'ground', tier:'low'});
    curX += w + gap;
  }
  const stageLength = curX + 300;
  TB.goalFlag = {x: stageLength - 200, y: 340, reached:false};

  // مسیر میانی (متعادل و جذاب)
  for(let x = 320; x < stageLength - 400; x += 360){
    plats.push({x, y: 270, w: 180, h: 20, type:'platform', tier:'mid'});
    // حلقه و کریستال روی مسیر میانی
    for(let k = 0; k < 4; k++){
      rings.push({x: x + 30 + k * 35, y: 235, taken: false});
    }
    crystals.push({x: x + 90, y: 205, taken: false});
  }

  // مسیر بالایی (سریع، پرچالش و سرشار از حلقه و پاورآپ)
  for(let x = 500; x < stageLength - 600; x += 420){
    plats.push({x, y: 160, w: 160, h: 18, type:'platform', tier:'high'});
    // حلقه‌های سرعت
    speedRings.push({x: x + 80, y: 125, active: true});
    for(let k = 0; k < 3; k++){
      rings.push({x: x + 35 + k * 35, y: 125, taken: false});
    }
  }

  // فنرها برای جهش به مسیرهای بالا
  springs.push({x: 280, y: 360, w: 32, h: 16, force: 16});
  springs.push({x: 1100, y: 350, w: 32, h: 16, force: 17});
  springs.push({x: 2200, y: 370, w: 32, h: 16, force: 16});
  springs.push({x: 3400, y: 360, w: 32, h: 16, force: 18});

  // چک‌پوینت‌ها
  checkpoints.push({x: 1400, y: 330, active: false});
  checkpoints.push({x: 2800, y: 330, active: false});

  // پاورآپ‌ها
  powerupItems.push({x: 650, y: 230, type:'shield', taken:false});
  powerupItems.push({x: 1750, y: 120, type:'speedBoost', taken:false});
  powerupItems.push({x: 2450, y: 230, type:'magnet', taken:false});
  powerupItems.push({x: 3150, y: 120, type:'invincibility', taken:false});

  // دشمنان گوناگون (AI متحرک، پرنده، تعقیب‌کننده)
  for(let x = 600; x < stageLength - 800; x += 450){
    const r = Math.random();
    if(r < 0.4){
      // گشت‌زن زمینی
      enemies.push({x, y: 345, vx: -1.8, w: 30, h: 30, type:'walker', hp: 1, minX: x - 120, maxX: x + 120, dead: false});
    } else if(r < 0.75){
      // پرنده سینوسی
      enemies.push({x, y: 230, startY: 230, vx: -2.2, w: 28, h: 24, type:'flyer', hp: 1, dead: false, t: 0});
    } else {
      // شلیک‌کننده
      enemies.push({x, y: 345, vx: 0, w: 34, h: 32, type:'shooter', hp: 2, shootCooldown: 90, dead: false});
    }
  }

  // باس در مرحله پایانی جهان (Stage 3 یا مرحله ۴)
  let boss = null;
  if(stageNum === 3 || stageNum === 4){
    boss = {
      x: stageLength - 450,
      y: 260,
      w: 80,
      h: 80,
      hp: 8,
      maxHp: 8,
      phase: 1,
      vx: -2.5,
      minX: stageLength - 700,
      maxX: stageLength - 250,
      invuln: 0,
      dead: false
    };
  }

  TB.platforms = plats;
  TB.rings = rings;
  TB.crystals = crystals;
  TB.springs = springs;
  TB.speedRings = speedRings;
  TB.checkpoints = checkpoints;
  TB.powerupItems = powerupItems;
  TB.enemies = enemies;
  TB.boss = boss;
  TB.particles = [];
  TB.trail = [];
}

// حلقه اصلی فیزیک و رندرینگ
function tbLoop(){
  if(TB.paused){
    TB.raf = requestAnimationFrame(tbLoop);
    return;
  }
  tbUpdatePhysics();
  tbRender();
  TB.raf = requestAnimationFrame(tbLoop);
}

// فیزیک مومنتوم واقعی، شتاب، اصطکاک و شیب
function tbUpdatePhysics(){
  const p = TB.p;
  if(TB.gameOver || TB.stageClear) return;

  p.time += 1/60;

  // مدیریت تایمرهای پاورآپ
  if(p.powerups.speedBoost > 0) p.powerups.speedBoost--;
  if(p.powerups.magnet > 0){
    p.powerups.magnet--;
    // جذب حلقه‌ها و کریستال‌های اطراف
    TB.rings.forEach(r => {
      if(!r.taken && Math.hypot(p.x - r.x, p.y - r.y) < 180){
        r.x += (p.x - r.x) * 0.12;
        r.y += (p.y - r.y) * 0.12;
      }
    });
  }
  if(p.powerups.invincibility > 0) p.powerups.invincibility--;
  if(p.invincibleTimer > 0) p.invincibleTimer--;
  if(p.dashCooldown > 0) p.dashCooldown--;

  // کنترل شتاب، حداکثر سرعت و مومنتوم
  const isBoosted = p.powerups.speedBoost > 0;
  const topSpeed = isBoosted ? 15.5 : 9.5;
  const accel = p.onGround ? (isBoosted ? 0.65 : 0.42) : 0.28;
  const friction = p.onGround ? (p.isRolling ? 0.985 : 0.88) : 0.96;

  // حرکت به چپ و راست
  if(TB.keys.left){
    p.vx -= accel;
    p.facing = -1;
  } else if(TB.keys.right){
    p.vx += accel;
    p.facing = 1;
  } else {
    // اصطکاک روان
    p.vx *= friction;
    if(Math.abs(p.vx) < 0.1) p.vx = 0;
  }

  // محدودیت سرعت
  if(p.vx > topSpeed) p.vx = topSpeed;
  if(p.vx < -topSpeed) p.vx = -topSpeed;

  // مانور دش (Dash)
  if(TB.keys.dash && p.dashCooldown <= 0){
    p.vx = p.facing * (isBoosted ? 21 : 16);
    p.dashTimer = 14;
    p.dashCooldown = 45;
    tbSfx('dash');
    // ذرات جت سرعت
    for(let i=0; i<8; i++){
      TB.particles.push({
        x: p.x, y: p.y + p.h/2,
        vx: -p.facing * (Math.random()*4 + 2),
        vy: (Math.random()-0.5)*3,
        life: 1, c: '#38bdf8', r: 3.5
      });
    }
  }

  // رول (Roll) هنگام دویدن با فشردن کلید پایین
  if(TB.keys.down && p.onGround && Math.abs(p.vx) > 3){
    p.isRolling = true;
  } else if(!TB.keys.down || Math.abs(p.vx) < 1){
    p.isRolling = false;
  }

  // پرش و دابل‌جامپ
  if(TB.keys.jump){
    if(p.onGround){
      p.vy = -12.5;
      p.onGround = false;
      p.canDoubleJump = true;
      tbSfx('jump');
    } else if(p.canDoubleJump){
      p.vy = -11.5;
      p.canDoubleJump = false;
      p.spinAttack = true;
      tbSfx('jump');
      // افکت چرخش دوگانه
      for(let i=0; i<6; i++){
        TB.particles.push({
          x: p.x + p.w/2, y: p.y + p.h,
          vx: (Math.random()-0.5)*4, vy: Math.random()*2,
          life: 0.8, c: '#ffd76e', r: 2.5
        });
      }
    }
    TB.keys.jump = false; // مصرف پرش
  }

  // گرانش
  p.vy += 0.58;
  if(p.vy > 16) p.vy = 16;

  // جابجایی
  p.x += p.vx;
  p.y += p.vy;

  // تریل موشن بلور در سرعت بالا
  if(Math.abs(p.vx) > 7 || p.dashTimer > 0){
    TB.trail.push({x: p.x, y: p.y, facing: p.facing, life: 1});
    if(TB.trail.length > 8) TB.trail.shift();
  }

  // برخورد با پلتفرم‌ها
  p.onGround = false;
  for(const plat of TB.platforms){
    if(p.x + p.w > plat.x && p.x < plat.x + plat.w){
      // فرود از بالا
      if(p.y + p.h >= plat.y && p.y + p.h <= plat.y + 18 && p.vy >= 0){
        p.y = plat.y - p.h;
        p.vy = 0;
        p.onGround = true;
        p.spinAttack = false;
        break;
      }
    }
  }

  // فنرها
  for(const sp of TB.springs){
    if(p.x + p.w > sp.x && p.x < sp.x + sp.w && p.y + p.h >= sp.y && p.y + p.h <= sp.y + sp.h + 8 && p.vy >= 0){
      p.vy = -sp.force;
      p.onGround = false;
      p.canDoubleJump = true;
      tbSfx('spring');
      for(let i=0; i<6; i++){
        TB.particles.push({x: sp.x + sp.w/2, y: sp.y, vx: (Math.random()-0.5)*4, vy: -Math.random()*4, life: 0.8, c: '#ffd76e', r: 3});
      }
    }
  }

  // حلقه‌های سرعت (Speed Boost Rings)
  for(const sr of TB.speedRings){
    if(Math.hypot(p.x - sr.x, p.y - sr.y) < 32){
      p.vx = p.facing * 18;
      p.powerups.speedBoost = 90;
      tbSfx('dash');
    }
  }

  // جمع‌آوری حلقه‌ها
  for(const r of TB.rings){
    if(!r.taken && Math.hypot(p.x + p.w/2 - r.x, p.y + p.h/2 - r.y) < 26){
      r.taken = true;
      const mult = p.powerups.doubleRing > 0 ? 2 : 1;
      p.rings += mult;
      p.score += 50 * mult;
      tbSfx('ring');
    }
  }

  // جمع‌آوری کریستال‌ها
  for(const c of TB.crystals){
    if(!c.taken && Math.hypot(p.x + p.w/2 - c.x, p.y + p.h/2 - c.y) < 28){
      c.taken = true;
      p.crystals++;
      p.score += 250;
      tbSfx('ring');
    }
  }

  // جمع‌آوری پاورآپ‌ها
  for(const pw of TB.powerupItems){
    if(!pw.taken && Math.hypot(p.x + p.w/2 - pw.x, p.y + p.h/2 - pw.y) < 30){
      pw.taken = true;
      if(pw.type === 'shield') p.powerups.shield = true;
      if(pw.type === 'speedBoost') p.powerups.speedBoost = 240;
      if(pw.type === 'magnet') p.powerups.magnet = 300;
      if(pw.type === 'invincibility') p.powerups.invincibility = 300;
      toast('قابلیت ویژه فعال شد: ' + pw.type, 'zap');
      tbSfx('ring');
    }
  }

  // چک‌پوینت‌ها
  for(const cp of TB.checkpoints){
    if(!cp.active && Math.abs(p.x - cp.x) < 32){
      cp.active = true;
      p.checkpoint = {x: cp.x, y: cp.y};
      toast('چک‌پوینت ذخیره شد!', 'flag');
      tbSfx('checkpoint');
    }
  }

  // تعامل با دشمنان
  for(const e of TB.enemies){
    if(e.dead) continue;
    // هوش مصنوعی دشمن
    if(e.type === 'walker'){
      e.x += e.vx;
      if(e.x < e.minX || e.x > e.maxX) e.vx *= -1;
    } else if(e.type === 'flyer'){
      e.t = (e.t || 0) + 0.05;
      e.y = e.startY + Math.sin(e.t) * 35;
      e.x += e.vx;
      if(e.x < p.x - 350) e.x = p.x + 400;
    }

    // بررسی برخورد با بازیکن
    if(p.x + p.w > e.x && p.x < e.x + e.w && p.y + p.h > e.y && p.y < e.y + e.h){
      // حمله چرخشی یا پرش از بالا = شکست دشمن
      const isAttacking = p.isRolling || p.spinAttack || p.dashTimer > 0 || p.powerups.invincibility > 0 || (p.vy > 0 && p.y + p.h < e.y + 18);
      if(isAttacking){
        e.dead = true;
        p.vy = -8.5; // پرش برگشتی
        p.score += 200;
        tbSfx('enemy');
        for(let i=0; i<8; i++){
          TB.particles.push({x: e.x + e.w/2, y: e.y + e.h/2, vx: (Math.random()-0.5)*6, vy: (Math.random()-0.5)*6, life: 1, c: '#ef4444', r: 3});
        }
      } else if(p.invincibleTimer <= 0){
        // بازیکن ضربه می‌خورد
        tbPlayerHit();
      }
    }
  }

  // باس‌فایت
  const b = TB.boss;
  if(b && !b.dead){
    if(b.invuln > 0) b.invuln--;
    b.x += b.vx;
    if(b.x < b.minX || b.x > b.maxX) b.vx *= -1;

    // برخورد با باس
    if(p.x + p.w > b.x && p.x < b.x + b.w && p.y + p.h > b.y && p.y < b.y + b.h){
      const isAttacking = p.isRolling || p.spinAttack || p.dashTimer > 0 || (p.vy > 0 && p.y + p.h < b.y + 24);
      if(isAttacking && b.invuln <= 0){
        b.hp--;
        b.invuln = 45;
        p.vy = -11;
        p.score += 500;
        tbSfx('enemy');
        if(b.hp <= 0){
          b.dead = true;
          p.score += 2500;
          tbSfx('win');
          toast('غول مرحله شکست خورد!', 'award');
        }
      } else if(p.invincibleTimer <= 0 && b.invuln <= 0){
        tbPlayerHit();
      }
    }
  }

  // بررسی رسیدن به پرچم پایان
  if(!TB.goalFlag.reached && p.x >= TB.goalFlag.x){
    TB.goalFlag.reached = true;
    TB.stageClear = true;
    tbSfx('win');
    tbShowVictoryScreen();
  }

  // سقوط در پرتگاه
  if(p.y > 600){
    tbPlayerRespawn();
  }

  // به‌روزرسانی دوربین با زوم خودکار سرعتی
  const targetCamX = p.x - TB.W * 0.35;
  TB.cam.x += (targetCamX - TB.cam.x) * 0.12;
  const speedRatio = Math.abs(p.vx) / topSpeed;
  TB.cam.targetZoom = 1 - speedRatio * 0.18; // زوم‌آوت هنگام سرعت بالا
  TB.cam.zoom += (TB.cam.targetZoom - TB.cam.zoom) * 0.08;

  // به‌روزرسانی ذرات
  TB.particles.forEach(pt => {
    pt.x += pt.vx; pt.y += pt.vy;
    pt.life -= 0.03;
  });
  TB.particles = TB.particles.filter(pt => pt.life > 0);

  // به‌روزرسانی تریل
  TB.trail.forEach(tr => tr.life -= 0.12);
  TB.trail = TB.trail.filter(tr => tr.life > 0);
}

// ضربه خوردن بازیکن
function tbPlayerHit(){
  const p = TB.p;
  if(p.powerups.shield){
    p.powerups.shield = false;
    p.invincibleTimer = 60;
    tbSfx('hit');
    toast('شیلد از شما محافظت کرد!', 'shield');
    return;
  }

  if(p.rings > 0){
    // پراکنده شدن بخشی از حلقه‌ها
    const drop = Math.min(10, p.rings);
    p.rings -= drop;
    for(let i=0; i<drop; i++){
      TB.particles.push({
        x: p.x, y: p.y,
        vx: (Math.random()-0.5)*7, vy: -Math.random()*6,
        life: 1.2, c: '#ffd76e', r: 4
      });
    }
    p.invincibleTimer = 60;
    tbSfx('hit');
  } else {
    p.hp--;
    p.invincibleTimer = 80;
    tbSfx('hit');
    if(p.hp <= 0){
      tbPlayerRespawn();
    }
  }
}

// بازگشت از آخرین چک‌پوینت
function tbPlayerRespawn(){
  const p = TB.p;
  p.x = p.checkpoint.x;
  p.y = p.checkpoint.y;
  p.vx = 0;
  p.vy = 0;
  p.hp = 3;
  p.rings = 0;
  p.invincibleTimer = 60;
  toast('بازگشت از آخرین چک‌پوینت', 'flag');
}

// رندرینگ پیشرفته با پارالاکس و نورپردازی ۲.۵ بعدی
function tbRender(){
  const c = TB.ctx;
  if(!c) return;
  const W = TB.W, H = TB.H;
  const curWorld = TB_WORLDS.find(w => w.id === TB.world) || TB_WORLDS[0];

  c.save();
  c.clearRect(0, 0, W, H);

  // ۱. پس‌زمینه پارالاکس آسمان
  const skyGrad = c.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, curWorld.skyT);
  skyGrad.addColorStop(1, curWorld.skyB);
  c.fillStyle = skyGrad;
  c.fillRect(0, 0, W, H);

  // لایه پارالاکس کوه‌ها و افق
  c.save();
  const bgShift = (TB.cam.x * 0.15) % W;
  c.fillStyle = curWorld.bgHills;
  c.beginPath();
  c.moveTo(0, H);
  for(let x=0; x<=W+60; x+=60){
    c.lineTo(x, H - 120 + Math.sin((x + bgShift)*0.015)*40);
  }
  c.lineTo(W, H);
  c.closePath();
  c.fill();
  c.restore();

  // ۲. ترنسفورم دوربین و زوم پویا
  c.save();
  c.translate(W * 0.35, H * 0.55);
  c.scale(TB.cam.zoom, TB.cam.zoom);
  c.translate(-TB.cam.x, -TB.p.y * 0.5 - 60);

  // ۳. رندر پلتفرم‌ها و مسیرها
  for(const plat of TB.platforms){
    c.fillStyle = curWorld.track;
    c.fillRect(plat.x, plat.y, plat.w, plat.h);
    // لبه چمنی یا نورانی بالا
    c.fillStyle = curWorld.ground;
    c.fillRect(plat.x, plat.y, plat.w, 6);
  }

  // ۴. فنرها
  for(const sp of TB.springs){
    c.fillStyle = '#f59e0b';
    c.fillRect(sp.x, sp.y + 4, sp.w, sp.h - 4);
    c.fillStyle = '#ef4444';
    c.fillRect(sp.x - 2, sp.y, sp.w + 4, 6);
  }

  // ۵. حلقه‌های سرعت
  for(const sr of TB.speedRings){
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(sr.x, sr.y, 22, 0, Math.PI * 2);
    c.stroke();
  }

  // ۶. چک‌پوینت‌ها
  for(const cp of TB.checkpoints){
    c.fillStyle = cp.active ? '#10b981' : '#64748b';
    c.fillRect(cp.x, cp.y, 6, 40);
    c.beginPath();
    c.moveTo(cp.x + 6, cp.y);
    c.lineTo(cp.x + 24, cp.y + 10);
    c.lineTo(cp.x + 6, cp.y + 20);
    c.closePath();
    c.fill();
  }

  // ۷. پرچم پایان
  const gf = TB.goalFlag;
  c.fillStyle = '#ffd76e';
  c.fillRect(gf.x, gf.y - 60, 8, 60);
  c.fillStyle = '#ef4444';
  c.beginPath();
  c.moveTo(gf.x + 8, gf.y - 60);
  c.lineTo(gf.x + 36, gf.y - 45);
  c.lineTo(gf.x + 8, gf.y - 30);
  c.closePath();
  c.fill();

  // ۸. حلقه‌های جمع‌کردنی (چرخان)
  const ringScale = Math.cos(TB.p.time * 6);
  for(const r of TB.rings){
    if(!r.taken){
      c.save();
      c.translate(r.x, r.y);
      c.scale(ringScale, 1);
      c.strokeStyle = '#ffd76e';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, 10, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
  }

  // ۹. کریستال‌ها
  for(const cr of TB.crystals){
    if(!cr.taken){
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.moveTo(cr.x, cr.y - 12);
      c.lineTo(cr.x + 10, cr.y);
      c.lineTo(cr.x, cr.y + 12);
      c.lineTo(cr.x - 10, cr.y);
      c.closePath();
      c.fill();
    }
  }

  // ۱۰. پاورآپ‌ها
  for(const pw of TB.powerupItems){
    if(!pw.taken){
      c.fillStyle = pw.type==='shield' ? '#38bdf8' : '#f59e0b';
      c.beginPath();
      c.arc(pw.x, pw.y, 14, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 2;
      c.stroke();
    }
  }

  // ۱۱. دشمنان
  for(const e of TB.enemies){
    if(!e.dead){
      c.fillStyle = e.type==='walker' ? '#ef4444' : '#eab308';
      c.fillRect(e.x, e.y, e.w, e.h);
      // چشم‌های خشمگین
      c.fillStyle = '#fff';
      c.fillRect(e.x + 4, e.y + 6, 6, 6);
      c.fillRect(e.x + e.w - 10, e.y + 6, 6, 6);
    }
  }

  // ۱۲. باس‌فایت
  const b = TB.boss;
  if(b && !b.dead){
    c.fillStyle = b.invuln > 0 ? '#fff' : '#b91c1c';
    c.fillRect(b.x, b.y, b.w, b.h);
    // نوار سلامت باس
    c.fillStyle = 'rgba(0,0,0,0.6)';
    c.fillRect(b.x - 10, b.y - 18, b.w + 20, 8);
    c.fillStyle = '#ef4444';
    c.fillRect(b.x - 10, b.y - 18, (b.w + 20) * (b.hp / b.maxHp), 8);
  }

  // ۱۳. تریل و موشن بلور بازیکن
  for(const tr of TB.trail){
    c.save();
    c.globalAlpha = tr.life * 0.45;
    c.fillStyle = '#38bdf8';
    c.beginPath();
    c.arc(tr.x + TB.p.w/2, tr.y + TB.p.h/2, 14, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // ۱۴. مدل و انیمیشن بازیکن (قهرمان سرعتی)
  const p = TB.p;
  c.save();
  c.translate(p.x + p.w/2, p.y + p.h/2);
  c.scale(p.facing, 1);

  if(p.isRolling || p.spinAttack){
    // حالت رول و چرخش هجومی
    c.rotate(p.time * 16 * p.facing);
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.arc(0, 0, 16, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 3;
    c.stroke();
  } else {
    // بدن دونده با انیمیشن ران
    const legSwing = Math.sin(p.time * 20) * 12;
    // شیلد دور بازیکن
    if(p.powerups.shield){
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, 0, 24, 0, Math.PI * 2);
      c.stroke();
    }
    // بدن آبی متالیک
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.arc(0, -6, 13, 0, Math.PI * 2); // سر و کلاه کاسکت
    c.fill();
    c.fillStyle = '#0369a1';
    c.fillRect(-8, 2, 16, 14); // تنه
    // پاها با انیمیشن دویدن
    c.strokeStyle = '#ffd76e';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-4, 16); c.lineTo(-4 + legSwing, 24);
    c.moveTo(4, 16); c.lineTo(4 - legSwing, 24);
    c.stroke();
  }
  c.restore();

  // ۱۵. ذرات
  for(const pt of TB.particles){
    c.fillStyle = pt.c;
    c.beginPath();
    c.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
    c.fill();
  }

  c.restore(); // پایان ترنسفورم دوربین

  // ۱۶. نوار HUD و وضعیت بالای صفحه (امتیاز، جان، حلقه‌ها)
  tbRenderHud();

  c.restore();
}

// رندر نوار وضعیت زنده (HUD)
function tbRenderHud(){
  const c = TB.ctx;
  const p = TB.p;

  // زمینه شیشه‌ای HUD
  c.fillStyle = 'rgba(15, 26, 46, 0.75)';
  c.strokeStyle = 'rgba(148, 180, 224, 0.2)';
  c.lineWidth = 1;
  c.beginPath();
  c.roundRect(16, 14, 280, 72, 14);
  c.fill();
  c.stroke();

  // جان‌ها
  for(let i=0; i<p.maxHp; i++){
    c.fillStyle = i < p.hp ? '#ef4444' : 'rgba(255,255,255,0.2)';
    c.beginPath();
    c.arc(38 + i * 24, 34, 8, 0, Math.PI * 2);
    c.fill();
  }

  // آمار
  c.fillStyle = '#ffd76e';
  c.font = '900 13px Vazirmatn, sans-serif';
  c.textAlign = 'right';
  c.fillText('حلقه‌ها: ' + faNum(p.rings), 280, 36);

  c.fillStyle = '#fff';
  c.font = '800 12px Vazirmatn, sans-serif';
  c.fillText('امتیاز: ' + faNum(p.score), 280, 68);

  c.textAlign = 'left';
  c.fillStyle = '#94a3b8';
  c.fillText('زمان: ' + faNum(Math.floor(p.time)) + ' ثانیه', 32, 68);
}

// نمایش کارت پیروزی مرحله و محاسبه ستاره‌ها
function tbShowVictoryScreen(){
  const p = TB.p;
  const prevBest = store.get('turboBest', 0);
  if(p.score > prevBest) store.set('turboBest', p.score);

  let stars = 1;
  if(p.rings >= 15) stars++;
  if(p.time < 90) stars++;

  if(TB.stage >= TB.unlockedStages && TB.unlockedStages < 4){
    TB.unlockedStages++;
    tbSaveGame();
  }

  try{
    if(typeof showPremiumGO === 'function'){
      showPremiumGO({
        title: 'مرحله فتح شد!',
        sub: 'سرعت خارق‌العاده و پایان درخشان! به مرحله بعد خوش آمدید.',
        stars: stars,
        score: p.score,
        best: Math.max(prevBest, p.score),
        win: true,
        nextLabel: 'مرحله بعدی',
        restart: () => {
          hidePremiumGO();
          tbBuildStage(TB.world, TB.stage);
        },
        exit: () => {
          hidePremiumGO();
          go('games');
        }
      });
    }
  }catch(e){}
}

// ساخت ساختار DOM بازی توربو رانر
function tbInitDom(container){
  container.innerHTML = '<div class="tb-outer-wrap">'
    +'<div class="tb-top-ctrls">'
      +'<div class="tb-world-selector">'
        +'<span>' + ic('globe', 14) + ' جهان:</span>'
        +'<select class="tb-select" onchange="tbSetWorld(+this.value)">'
          +TB_WORLDS.map(w => '<option value="' + w.id + '"' + (w.id===TB.world?' selected':'') + '>' + w.name + '</option>').join('')
        +'</select>'
        +'<span style="margin-right:12px">' + ic('award', 14) + ' مرحله:</span>'
        +'<select class="tb-select" onchange="tbSetStage(+this.value)">'
          +[1,2,3,4].map(s => '<option value="' + s + '"' + (s===TB.stage?' selected':'') + '>مرحله ' + faNum(s) + '</option>').join('')
        +'</select>'
      +'</div>'
      +'<div class="tb-act-btns">'
        +'<button class="btn ghost sm" onclick="tbToggleSound()">' + ic(TB.sound?'volume':'volume-x', 14) + '</button>'
        +'<button class="btn ghost sm" onclick="tbRestart()">' + ic('refresh-cw', 14) + ' از نو</button>'
        +'<button class="btn ghost sm" onclick="toggleGameFS()">' + ic('maximize', 14) + ' تمام‌صفحه</button>'
      +'</div>'
    +'</div>'
    +'<div class="tb-canvas-wrap">'
      +'<canvas id="tbCanvas" width="860" height="480"></canvas>'
    +'</div>'
    +'<div class="tb-mobile-touch-panel">'
      +'<div class="tb-touch-group left">'
        +'<button class="tb-touch-btn" data-key="left">' + ic('arrow-left', 20) + '</button>'
        +'<button class="tb-touch-btn" data-key="right">' + ic('arrow-right', 20) + '</button>'
      +'</div>'
      +'<div class="tb-touch-group right">'
        +'<button class="tb-touch-btn action roll" data-key="down">' + ic('chevron-down', 18) + ' رول</button>'
        +'<button class="tb-touch-btn action dash" data-key="dash">' + ic('wind', 18) + ' دش</button>'
        +'<button class="tb-touch-btn action jump" data-key="jump">' + ic('zap', 20) + ' پرش</button>'
      +'</div>'
    +'</div>'
  +'</div>';

  const cv = document.getElementById('tbCanvas');
  if(cv){
    TB.cv = cv;
    TB.ctx = cv.getContext('2d');
  }

  // اتصال کنترل‌های لمسی
  container.querySelectorAll('.tb-touch-btn').forEach(btn => {
    const k = btn.dataset.key;
    const activate = () => { TB.keys[k] = true; };
    const deactivate = () => { TB.keys[k] = false; };
    btn.addEventListener('pointerdown', e => { e.preventDefault(); activate(); });
    btn.addEventListener('pointerup', deactivate);
    btn.addEventListener('pointerleave', deactivate);
    btn.addEventListener('pointercancel', deactivate);
  });
}

function tbSetWorld(wid){
  TB.world = wid;
  tbBuildStage(TB.world, TB.stage);
  toast('جهان به «' + (TB_WORLDS.find(w=>w.id===wid)||{}).name + '» تغییر یافت', 'globe');
}

function tbSetStage(st){
  TB.stage = st;
  tbBuildStage(TB.world, TB.stage);
  toast('ورود به مرحله ' + faNum(st), 'flag');
}

function tbRestart(){
  tbBuildStage(TB.world, TB.stage);
  toast('مرحله از نو شروع شد', 'refresh-cw');
}

function tbToggleSound(){
  TB.sound = !TB.sound;
  toast(TB.sound ? 'صدا فعال شد' : 'صدا قطع شد', TB.sound ? 'volume' : 'volume-x');
}

// کلیدهای کیبورد
function tbOnKeyDown(e){
  if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') TB.keys.left = true;
  if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') TB.keys.right = true;
  if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') TB.keys.up = true;
  if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') TB.keys.down = true;
  if(e.key === ' ') { e.preventDefault(); TB.keys.jump = true; }
  if(e.key === 'Shift') { e.preventDefault(); TB.keys.dash = true; }
  if(e.key === 'Escape') TB.paused = !TB.paused;
}

function tbOnKeyUp(e){
  if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') TB.keys.left = false;
  if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') TB.keys.right = false;
  if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') TB.keys.up = false;
  if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') TB.keys.down = false;
  if(e.key === 'Shift') TB.keys.dash = false;
}

// انجین سازگار با ساختار کلی بازی‌های نت‌یار
const turboEng = {
  start(container){
    tbLoadGame();
    tbInitDom(container);
    tbBuildStage(TB.world, TB.stage);
    try{
      if(window.addEventListener){
        window.addEventListener('keydown', tbOnKeyDown);
        window.addEventListener('keyup', tbOnKeyUp);
      }
    }catch(e){}
    if(TB.raf) cancelAnimationFrame(TB.raf);
    TB.raf = requestAnimationFrame(tbLoop);
  },
  stop(){
    if(TB.raf) cancelAnimationFrame(TB.raf);
    TB.raf = 0;
    try{
      if(window.removeEventListener){
        window.removeEventListener('keydown', tbOnKeyDown);
        window.removeEventListener('keyup', tbOnKeyUp);
      }
    }catch(e){}
  },
  action(){
    TB.keys.jump = true;
  },
  key(e){
    if(e.key === ' ') TB.keys.jump = true;
    if(e.key === 'Shift') TB.keys.dash = true;
    if(e.key === 'ArrowDown') TB.keys.down = true;
    if(e.key === 'ArrowLeft') TB.keys.left = true;
    if(e.key === 'ArrowRight') TB.keys.right = true;
  },
  up(e){
    TB.keys.left = false;
    TB.keys.right = false;
    TB.keys.down = false;
  }
};

// ثبت بازی در سیستم بازی‌های سایت
Object.assign(GAME_ENG, {'turbo': turboEng});
window.TB = TB;
window.turboEng = turboEng;

// اکسپوز به پنجره
window.tbSetWorld = tbSetWorld;
window.tbSetStage = tbSetStage;
window.tbRestart = tbRestart;
window.tbToggleSound = tbToggleSound;
