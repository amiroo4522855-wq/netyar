/* ================================================================
   بازی پرمیوم ضربات پنالتی قهرمانان — Penalty Shootout Champions v1.0
   طراحی استادیوم چمن و تور دروازه، فیزیک شلیک توپ، هوش مصنوعی واکنش دروازه‌بان،
   جلوه‌های صوتی Web Audio، نوار قدرت و زاویه، و جدول ثبت رکورد گل
   ================================================================ */
'use strict';

const PENALTY = {
  container: null,
  active: false,
  score: 0,
  streak: 0,
  bestStreak: 0,
  round: 1,
  shotsLeft: 5,
  aimX: 0, // -1 (left) to +1 (right)
  power: 50,
  powerDir: 1,
  state: 'aiming', // 'aiming', 'shooting', 'goal', 'saved', 'missed'
  ball: { x: 300, y: 380, z: 0, vx: 0, vy: 0, vz: 0, r: 18 },
  keeper: { x: 300, y: 155, targetX: 300, diving: false, diveX: 0 },
  raf: null,
  audioCtx: null
};

function penInitAudio(){
  if(!PENALTY.audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(AC) PENALTY.audioCtx = new AC();
  }
}

function penSfx(type){
  try{
    penInitAudio();
    if(!PENALTY.audioCtx) return;
    const ctx = PENALTY.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if(type === 'kick'){
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if(type === 'goal'){
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now); osc.stop(now + 0.45);
    } else if(type === 'save'){
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    }
  }catch(e){}
}

function penShoot(dirOffset){
  if(PENALTY.state !== 'aiming') return;
  penSfx('kick');
  PENALTY.state = 'shooting';

  const targetX = 300 + (dirOffset !== undefined ? dirOffset : PENALTY.aimX) * 160;
  const targetY = 120 + Math.random() * 50;

  // تصمیم هوش مصنوعی دروازه‌بان ( شیرجه به چپ، وسط، یا راست)
  const keeperChoices = [-130, -80, 0, 80, 130];
  const keeperDive = keeperChoices[Math.floor(Math.random() * keeperChoices.length)];
  PENALTY.keeper.targetX = 300 + keeperDive;
  PENALTY.keeper.diving = true;

  const b = PENALTY.ball;
  b.vx = (targetX - b.x) / 28;
  b.vy = (targetY - b.y) / 28;
  b.vz = 0.95;
}

function penResetBall(){
  PENALTY.ball = { x: 300, y: 380, z: 0, vx: 0, vy: 0, vz: 0, r: 18 };
  PENALTY.keeper = { x: 300, y: 155, targetX: 300, diving: false, diveX: 0 };
  PENALTY.state = 'aiming';
  penUpdateUI();
}

function penUpdateUI(){
  const sEl = document.getElementById('penScore');
  const strkEl = document.getElementById('penStreak');
  const shotsEl = document.getElementById('penShots');
  if(sEl) sEl.textContent = faNum(PENALTY.score);
  if(strkEl) strkEl.textContent = faNum(PENALTY.streak);
  if(shotsEl) shotsEl.textContent = faNum(PENALTY.shotsLeft);
}

function penLoop(){
  if(!PENALTY.active) return;
  const cv = document.getElementById('penCanvas');
  if(!cv){ PENALTY.raf = requestAnimationFrame(penLoop); return; }
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  // قدرت شوت نوسانی در حالت نشانه‌گیری
  if(PENALTY.state === 'aiming'){
    PENALTY.power += PENALTY.powerDir * 1.5;
    if(PENALTY.power >= 95){ PENALTY.power = 95; PENALTY.powerDir = -1; }
    if(PENALTY.power <= 15){ PENALTY.power = 15; PENALTY.powerDir = 1; }
    const pBar = document.getElementById('penPowerFill');
    if(pBar) pBar.style.width = PENALTY.power + '%';
  }

  // به‌روزرسانی فیزیک شلیک
  if(PENALTY.state === 'shooting'){
    const b = PENALTY.ball;
    b.x += b.vx;
    b.y += b.vy;
    b.r = Math.max(9, b.r - 0.28);

    // حرکت دروازه‌بان
    PENALTY.keeper.x += (PENALTY.keeper.targetX - PENALTY.keeper.x) * 0.14;

    // بررسی رسیدن به خط دروازه
    if(b.y <= 160){
      const goalLeft = 140, goalRight = 460;
      const distToKeeper = Math.abs(b.x - PENALTY.keeper.x);

      if(b.x >= goalLeft && b.x <= goalRight){
        if(distToKeeper < 42){
          // مهار توسط دروازه‌بان
          PENALTY.state = 'saved';
          PENALTY.streak = 0;
          PENALTY.shotsLeft--;
          penSfx('save');
          if(typeof toast === 'function') toast('مهار عالی دروازه‌بان! 🧤', 'shield');
        } else {
          // گل شد!
          PENALTY.state = 'goal';
          PENALTY.score++;
          PENALTY.streak++;
          PENALTY.shotsLeft--;
          penSfx('goal');
          if(typeof coinAdd === 'function') coinAdd(2, 'گل در پنالتی');
          if(PENALTY.streak > PENALTY.bestStreak){
            PENALTY.bestStreak = PENALTY.streak;
            try{ store.set('penaltiesBest', PENALTY.bestStreak); }catch(e){}
          }
          if(typeof toast === 'function') toast('گـل تماشایی کنج دروازه! ⚽🔥 +۲ سکه', 'trophy');
        }
      } else {
        // شوت به بیرون
        PENALTY.state = 'missed';
        PENALTY.streak = 0;
        PENALTY.shotsLeft--;
        penSfx('save');
        if(typeof toast === 'function') toast('شوت از بالای دروازه به بیرون رفت!', 'alert');
      }

      penUpdateUI();

      if(PENALTY.shotsLeft <= 0){
        setTimeout(()=>{
          if(typeof toast === 'function') toast('پایان دست مسابقه! مجموع گل‌ها: ' + faNum(PENALTY.score), 'crown');
          PENALTY.shotsLeft = 5;
          penResetBall();
        }, 1600);
      } else {
        setTimeout(penResetBall, 1400);
      }
    }
  }

  // --- رندر گرافیکی استادیوم و زمین ---
  ctx.clearRect(0, 0, W, H);

  // ۱. پس‌زمینه استادیوم و تماشاگران
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
  skyGrad.addColorStop(0, '#091322');
  skyGrad.addColorStop(1, '#132847');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, 200);

  // پروژکتورهای نورافکن استادیوم
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(60, 40, 50, 0, Math.PI*2);
  ctx.arc(W - 60, 40, 50, 0, Math.PI*2);
  ctx.fill();

  // ۲. چمن ورزشگاه
  const grassGrad = ctx.createLinearGradient(0, 160, 0, H);
  grassGrad.addColorStop(0, '#155e2e');
  grassGrad.addColorStop(1, '#0e4420');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, 160, W, H - 160);

  // نوارهای چمن متناوب
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for(let y = 160; y < H; y += 40){
    ctx.fillRect(0, y, W, 20);
  }

  // خطوط سفید محوطه جریمه
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(100, 150, 400, 160); // محوطه جریمه
  ctx.beginPath();
  ctx.arc(300, 310, 50, Math.PI, Math.PI * 2); // قوس پشت محوطه
  ctx.stroke();

  // ۳. تور و تیرهای دروازه (Goal Posts & Net)
  ctx.fillStyle = 'rgba(240, 240, 240, 0.12)';
  ctx.fillRect(140, 70, 320, 90); // عمق تور

  // خطوط شبکه تور
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for(let x = 140; x <= 460; x += 16){
    ctx.moveTo(x, 70); ctx.lineTo(x, 160);
  }
  for(let y = 70; y <= 160; y += 14){
    ctx.moveTo(140, y); ctx.lineTo(460, y);
  }
  ctx.stroke();

  // تیرهای سفید فلزی دروازه
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(140, 160);
  ctx.lineTo(140, 70);
  ctx.lineTo(460, 70);
  ctx.lineTo(460, 160);
  ctx.stroke();

  // ۴. رندر دروازه‌بان (Goalkeeper)
  const kx = PENALTY.keeper.x;
  const ky = PENALTY.keeper.y;

  // سایه دروازه‌بان
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(kx, ky + 12, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // لباس دروازه‌بان (زرد نئونی و دستکش)
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(kx - 14, ky - 30, 28, 32, 6);
  ctx.fill();

  // سر دروازه‌بان
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.arc(kx, ky - 38, 9, 0, Math.PI * 2);
  ctx.fill();

  // دستکش‌ها
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(kx - 18, ky - 22, 6, 0, Math.PI * 2);
  ctx.arc(kx + 18, ky - 22, 6, 0, Math.PI * 2);
  ctx.fill();

  // ۵. رندر توپ فوتبال (Soccer Ball)
  const b = PENALTY.ball;

  // سایه توپ
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + b.r * 0.8, b.r * 1.1, b.r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // بدنه سفید توپ
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();

  // پنج‌ضلعی‌های سیاه فوتبال
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r * 0.42, 0, Math.PI * 2);
  ctx.fill();

  // ۶. فلش راهنمای هدف‌گیری در حالت Aiming
  if(PENALTY.state === 'aiming'){
    const aimTargetX = 300 + PENALTY.aimX * 150;
    ctx.strokeStyle = 'rgba(217, 174, 62, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y - b.r);
    ctx.lineTo(aimTargetX, 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // دایره هدف
    ctx.fillStyle = 'rgba(217, 174, 62, 0.8)';
    ctx.beginPath();
    ctx.arc(aimTargetX, 130, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  PENALTY.raf = requestAnimationFrame(penLoop);
}

const penaltiesEng = {
  start(el){
    PENALTY.container = el;
    PENALTY.active = true;
    PENALTY.score = 0;
    PENALTY.streak = 0;
    PENALTY.shotsLeft = 5;
    PENALTY.state = 'aiming';

    el.innerHTML = '<div class="pen-game-wrap">'
      +'<div class="pen-hud-bar">'
        +'<div class="phb-item"><span>تعداد گل:</span><b id="penScore">۰</b></div>'
        +'<div class="phb-item highlight"><span>گل‌های متوالی:</span><b id="penStreak">۰</b></div>'
        +'<div class="phb-item"><span>فرصت‌های باقی‌مانده:</span><b id="penShots">۵</b></div>'
      +'</div>'
      +'<div class="pen-canvas-container">'
        +'<canvas id="penCanvas" width="600" height="420"></canvas>'
        +'<div class="pen-power-wrap">'
          +'<span class="ppw-lbl">قدرت شوت</span>'
          +'<div class="pen-power-track"><div class="pen-power-fill" id="penPowerFill"></div></div>'
        +'</div>'
      +'</div>'
      +'<div class="pen-controls-row">'
        +'<button class="pen-act-btn" onclick="penShoot(-0.85)">'+ic('chevron-left',16)+' کنج چپ</button>'
        +'<button class="pen-act-btn shoot-main" onclick="penShoot(0)">'+ic('zap',18)+' شوت مستقیم وسط</button>'
        +'<button class="pen-act-btn" onclick="penShoot(0.85)">کنج راست '+ic('chevron-right',16)+'</button>'
      +'</div>'
    +'</div>';

    // کلیک روی کانواس جهت شوت دقیق
    const cv = document.getElementById('penCanvas');
    if(cv){
      cv.addEventListener('pointerdown', (e)=>{
        const rect = cv.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 600;
        const normX = (clickX - 300) / 160;
        penShoot(Math.max(-1, Math.min(1, normX)));
      });
      cv.addEventListener('pointermove', (e)=>{
        if(PENALTY.state !== 'aiming') return;
        const rect = cv.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 600;
        PENALTY.aimX = Math.max(-1, Math.min(1, (clickX - 300) / 150));
      });
    }

    if(PENALTY.raf) cancelAnimationFrame(PENALTY.raf);
    PENALTY.raf = requestAnimationFrame(penLoop);
  },
  stop(){
    PENALTY.active = false;
    if(PENALTY.raf) cancelAnimationFrame(PENALTY.raf);
  },
  key(e){
    if(e.key === 'ArrowLeft') penShoot(-0.85);
    else if(e.key === 'ArrowRight') penShoot(0.85);
    else if(e.key === 'ArrowUp' || e.key === ' ') penShoot(0);
  }
};

if(typeof GAME_ENG !== 'undefined'){
  Object.assign(GAME_ENG, { 'penalties': penaltiesEng });
}

window.penShoot = penShoot;
window.penaltiesEng = penaltiesEng;
