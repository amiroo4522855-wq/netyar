/* ================================================================
   بازی چهاربرگ (۱۱ / پاسور ۴ نفره دو تیم ۲ نفره) — نسخه فوق حرفه‌ای
   نت‌یار — قوانین اصیل، هوش مصنوعی ۴ سطحی، انیمیشن و جلوه‌های صوتی
   ================================================================ */
'use strict';

const FC_SUITS = [
  {id:'s', n:'spade', icName:'spade', c:'#1e293b', fa:'پیک'},
  {id:'c', n:'club', icName:'club', c:'#1e293b', fa:'گشنیز'},
  {id:'d', n:'diamond', icName:'diamond', c:'#dc2626', fa:'خشت'},
  {id:'h', n:'heart', icName:'heart', c:'#dc2626', fa:'دل'}
];

const FC_RANKS = [
  {v:1, l:'A', fa:'تک (آس)'},
  {v:2, l:'2', fa:'۲'},
  {v:3, l:'3', fa:'۳'},
  {v:4, l:'4', fa:'۴'},
  {v:5, l:'5', fa:'۵'},
  {v:6, l:'6', fa:'۶'},
  {v:7, l:'7', fa:'۷'},
  {v:8, l:'8', fa:'۸'},
  {v:9, l:'9', fa:'۹'},
  {v:10, l:'10', fa:'۱۰'},
  {v:11, l:'J', fa:'سرباز'},
  {v:12, l:'Q', fa:'بی‌بی (شاهزاده)'},
  {v:13, l:'K', fa:'شاه'}
];

const FC_PLAYERS = [
  {id:0, name:'شما', team:0, role:'player', pos:'bottom'},
  {id:1, name:'حریف راست (سامان)', team:1, role:'ai', pos:'right'},
  {id:2, name:'یار شما (آرش)', team:0, role:'ai', pos:'top'},
  {id:3, name:'حریف چپ (بهرام)', team:1, role:'ai', pos:'left'}
];

const FC_STORAGE_KEY = 'netyar_fourcards_state';

let FC = {
  diff: 'medium',
  sound: true,
  targetScore: 62,
  teamScores: [0, 0], // تیم من (0 و 2) ، تیم حریف (1 و 3)
  hakem: 0,
  starter: 1,
  turn: 1,
  deck: [],
  table: [],
  hands: [[], [], [], []],
  collected: [[], [], [], []], // کارت‌های جمع‌شده توسط هر بازیکن
  surCounts: [0, 0], // تعداد سورهای تیم ۰ و تیم ۱ در راند جاری
  totalSurs: [0, 0],
  lastCaptureTeam: -1,
  lastCapturedAllByJ: false,
  round: 1,
  dealStep: 0, // 0 تا 3 (در هر راند ۴ دست ۴تایی داده می‌شود)
  paused: false,
  roundOver: false,
  gameOver: false,
  busy: false,
  playedCardsHistory: [],
  container: null
};

// تابع تولید ۵۲ کارت کامل
function fcMakeDeck(){
  const d = [];
  for(const s of FC_SUITS){
    for(const r of FC_RANKS){
      d.push({
        suit: s.id,
        rank: r.v,
        label: r.l,
        id: s.id + '_' + r.v,
        color: s.c,
        icName: s.icName
      });
    }
  }
  // بر زدن استاندارد فیشر-یتس
  for(let i = d.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const temp = d[i];
    d[i] = d[j];
    d[j] = temp;
  }
  return d;
}

// افکت صوتی اختصاصی پاسور با وب آدیو
function fcSfx(type){
  if(!FC.sound) return;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    if(!window._fcAudioCtx) window._fcAudioCtx = new AC();
    const ctx = window._fcAudioCtx;
    if(ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    
    if(type === 'deal' || type === 'play'){
      const bufSize = ctx.sampleRate * 0.06;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for(let i=0; i<bufSize; i++) data[i] = (Math.random()*2 - 1) * Math.exp(-i/(bufSize*0.3));
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type==='deal' ? 1200 : 800, now);
      filter.Q.setValueAtTime(1.5, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start(now);
    } else if(type === 'collect'){
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if(type === 'sur'){
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();
      osc1.type = 'sine'; osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc1.frequency.setValueAtTime(1046.5, now + 0.3); // C6
      osc2.frequency.setValueAtTime(523.25*1.5, now);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
      osc1.connect(g); osc2.connect(g);
      g.connect(ctx.destination);
      osc1.start(now); osc2.start(now);
      osc1.stop(now + 0.55); osc2.stop(now + 0.55);
    } else if(type === 'win'){
      try{ if(typeof gSfx==='function') gSfx('win'); }catch(e){}
    }
  }catch(e){}
}

// ذخیره وضعیت جاری
function fcSaveState(){
  try{
    const state = {
      diff: FC.diff,
      sound: FC.sound,
      teamScores: FC.teamScores,
      totalSurs: FC.totalSurs,
      round: FC.round,
      targetScore: FC.targetScore,
      best: store.get('fourcardsBest', 0)
    };
    store.set(FC_STORAGE_KEY, state);
  }catch(e){}
}

// لود وضعیت
function fcLoadState(){
  try{
    const s = store.get(FC_STORAGE_KEY, null);
    if(s && s.teamScores){
      FC.diff = s.diff || FC.diff;
      FC.sound = s.sound !== undefined ? s.sound : FC.sound;
      FC.teamScores = s.teamScores || [0, 0];
      FC.totalSurs = s.totalSurs || [0, 0];
      FC.round = s.round || 1;
    }
  }catch(e){}
}

// مقداردهی اولیه شروع راند جدید
function fcNewRound(resetScores){
  if(resetScores){
    FC.teamScores = [0, 0];
    FC.totalSurs = [0, 0];
    FC.round = 1;
  }
  FC.deck = fcMakeDeck();
  FC.table = [];
  FC.hands = [[], [], [], []];
  FC.collected = [[], [], [], []];
  FC.surCounts = [0, 0];
  FC.lastCaptureTeam = -1;
  FC.lastCapturedAllByJ = false;
  FC.dealStep = 0;
  FC.roundOver = false;
  FC.gameOver = false;
  FC.busy = false;
  FC.playedCardsHistory = [];

  // نوبت دهنده و حاکم:
  // نفر بعد از حاکم دست را شروع می‌کند
  // بازیکن ۰ (شما) در دست اول شروع می‌کند
  FC.starter = 0;
  FC.turn = 0;

  // ۴ کارت اولیه روی زمین (هیچ سربازی نباید ابتدا روی زمین باشد)
  // طبق قانون چهاربرگ: اگر در ۴ کارت اولیه سربازی بود، تعویض می‌شود
  const initialTable = [];
  while(initialTable.length < 4 && FC.deck.length > 0){
    const card = FC.deck.pop();
    if(card.rank === 11){
      // سرباز را به عمق دسته کارت می‌بریم و کارت دیگری می‌آوریم
      FC.deck.unshift(card);
    } else {
      initialTable.push(card);
    }
  }
  FC.table = initialTable;

  // پخش ۴ کارت به هر بازیکن
  fcDealHands();
  fcSaveState();
}

// پخش ۴ کارت به ۴ بازیکن
function fcDealHands(){
  for(let p = 0; p < 4; p++){
    const h = [];
    for(let c = 0; c < 4; c++){
      if(FC.deck.length > 0) h.push(FC.deck.pop());
    }
    // مرتب‌سازی دست کاربر برای نمایش شیک‌تر
    if(p === 0){
      h.sort((a,b) => a.rank - b.rank);
    }
    FC.hands[p] = h;
  }
  FC.dealStep++;
  fcSfx('deal');
}

// بررسی امکان جمع‌آوری کارت‌های زمین با کارت بازی شده
function fcFindCombinations(card, tableCards){
  const r = card.rank;
  
  // ۱. شاه (۱۳) فقط شاه‌های روی زمین را جمع می‌کند
  if(r === 13){
    const match = tableCards.filter(c => c.rank === 13);
    return match.length > 0 ? match : [];
  }
  
  // ۲. بی‌بی (۱۲) فقط بی‌بی‌های روی زمین را جمع می‌کند
  if(r === 12){
    const match = tableCards.filter(c => c.rank === 12);
    return match.length > 0 ? match : [];
  }
  
  // ۳. سرباز (۱۱): تمام کارت‌های روی زمین به جز شاه و بی‌بی را جمع می‌کند
  if(r === 11){
    const match = tableCards.filter(c => c.rank !== 12 && c.rank !== 13);
    return match;
  }
  
  // ۴. اعداد ۱ تا ۱۰: کارت‌هایی که مجموعشان با کارت بازی شده ۱۱ شود
  // یعنی مجموع ترکیب کارت‌های انتخاب شده از زمین برابر (11 - r) باشد
  const target = 11 - r;
  if(target <= 0) return [];
  
  // فقط کارت‌های عددی (۱ تا ۱۰) قابل ترکیب شدن هستند
  const eligible = tableCards.filter(c => c.rank >= 1 && c.rank <= 10);
  
  // یافتن ترکیب‌هایی که مجموعشان target می‌شود (با جستجوی ترکیبی حریصانه)
  // ممکن است چندین دسته کارت جمع شوند (مثلاً با ۲، هم ۹ و هم ۵+۴ جمع شوند)
  const chosen = [];
  let remaining = eligible.slice();
  
  // ابتدا تطابق تک کارته را پیدا می‌کنیم
  let foundSingle = true;
  while(foundSingle){
    foundSingle = false;
    const idx = remaining.findIndex(c => c.rank === target);
    if(idx >= 0){
      chosen.push(remaining[idx]);
      remaining.splice(idx, 1);
      foundSingle = true;
    }
  }
  
  // سپس ترکیب‌های ۲ کارته
  let foundPair = true;
  while(foundPair){
    foundPair = false;
    for(let i=0; i<remaining.length; i++){
      for(let j=i+1; j<remaining.length; j++){
        if(remaining[i].rank + remaining[j].rank === target){
          chosen.push(remaining[i], remaining[j]);
          remaining.splice(j, 1);
          remaining.splice(i, 1);
          foundPair = true;
          break;
        }
      }
      if(foundPair) break;
    }
  }
  
  // ترکیب‌های ۳ کارته
  let foundTriple = true;
  while(foundTriple){
    foundTriple = false;
    for(let i=0; i<remaining.length; i++){
      for(let j=i+1; j<remaining.length; j++){
        for(let k=j+1; k<remaining.length; k++){
          if(remaining[i].rank + remaining[j].rank + remaining[k].rank === target){
            chosen.push(remaining[i], remaining[j], remaining[k]);
            remaining.splice(k, 1);
            remaining.splice(j, 1);
            remaining.splice(i, 1);
            foundTriple = true;
            break;
          }
        }
        if(foundTriple) break;
      }
      if(foundTriple) break;
    }
  }
  
  return chosen;
}

// اجرای حرکت توسط بازیکن فعلی
function fcPlayCard(playerIdx, cardIndex){
  if(FC.busy || FC.roundOver || FC.gameOver) return;
  const hand = FC.hands[playerIdx];
  if(!hand || cardIndex < 0 || cardIndex >= hand.length) return;
  
  FC.busy = true;
  const card = hand.splice(cardIndex, 1)[0];
  FC.playedCardsHistory.push({player: playerIdx, card});
  fcSfx('play');

  const captured = fcFindCombinations(card, FC.table);
  const player = FC_PLAYERS[playerIdx];
  const team = player.team;

  if(captured.length > 0){
    // کارت‌ها جمع می‌شوند!
    // حذف کارت‌های برداشته شده از زمین
    const capturedIds = new Set(captured.map(c => c.id));
    const wasAllTableCleared = (captured.length === FC.table.length);
    FC.table = FC.table.filter(c => !capturedIds.has(c.id));
    
    // افزودن به کارت‌های جمع‌شده بازیکن
    FC.collected[playerIdx].push(card, ...captured);
    FC.lastCaptureTeam = team;
    FC.lastCapturedAllByJ = (card.rank === 11 && wasAllTableCleared);

    // بررسی «سور»:
    // طبق قانون چهاربرگ:
    // ۱. اگر تمام کارت‌های روی زمین جمع شود و زمین کاملاً خالی گردد
    // ۲. جمع کردن با سرباز هرگز سور محسوب نمی‌شود
    // ۳. در دست آخر (دست پایانی بازی) سور حساب نمی‌شود
    const isLastDeal = (FC.deck.length === 0 && FC.hands.every(h => h.length === 0));
    const isSur = (wasAllTableCleared && card.rank !== 11 && !isLastDeal);

    if(isSur){
      FC.surCounts[team]++;
      FC.totalSurs[team]++;
      fcSfx('sur');
      toast(' سور برای تیم ' + (team===0 ? 'شما' : 'حریف') + '! (+۵ امتیاز)', 'crown');
      fcShowSurBanner(team);
    } else {
      fcSfx('collect');
    }
  } else {
    // کارتی جمع نشد، روی زمین قرار می‌گیرد
    FC.table.push(card);
  }

  fcRenderTable();

  // بررسی اتمام این دست یا اتمام راند
  setTimeout(() => {
    fcCheckNextTurn();
  }, 480);
}

// نمایش بنر افکتیو سور
function fcShowSurBanner(team){
  const el = document.getElementById('fcSurOverlay');
  if(!el) return;
  el.innerHTML = '<div class="fc-sur-badge ' + (team===0 ? 'team0' : 'team1') + '"> سور! ۵+ امتیاز برای تیم ' + (team===0 ? 'شما' : 'حریف') + '</div>';
  el.classList.add('active');
  setTimeout(() => {
    el.classList.remove('active');
  }, 1400);
}

// چک نوبت بعدی یا پخش دست بعد یا محاسبه راند
function fcCheckNextTurn(){
  const allHandsEmpty = FC.hands.every(h => h.length === 0);
  
  if(allHandsEmpty){
    if(FC.deck.length > 0){
      // هنوز کارت در دسته هست، دست بعدی ۴تایی داده می‌شود
      fcDealHands();
      FC.busy = false;
      fcRenderTable();
      fcTriggerAiIfNeeded();
    } else {
      // راند تمام شد!
      fcEndRound();
    }
  } else {
    // نوبت نفر بعدی
    FC.turn = (FC.turn + 1) % 4;
    FC.busy = false;
    fcRenderTable();
    fcTriggerAiIfNeeded();
  }
}

// تصمیم‌گیری هوش مصنوعی حریف‌ها و یار
function fcTriggerAiIfNeeded(){
  if(FC.roundOver || FC.gameOver) return;
  if(FC.turn !== 0){
    // هوش مصنوعی بازی می‌کند
    FC.busy = true;
    const delay = FC.diff === 'expert' ? 450 : (FC.diff === 'hard' ? 600 : 750);
    setTimeout(() => {
      fcAiMakeMove(FC.turn);
    }, delay);
  }
}

// منطق هوشمند هوش مصنوعی در ۴ سطح مختلف
function fcAiMakeMove(aiIdx){
  const hand = FC.hands[aiIdx];
  if(!hand || !hand.length){
    FC.busy = false;
    return;
  }

  let bestCardIdx = 0;
  const diff = FC.diff; // easy, medium, hard, expert

  if(diff === 'easy'){
    // سطح آسان: اولویت اول جمع کردن اگر ممکن باشد، وگرنه کارت تصادفی
    const capturing = [];
    hand.forEach((c, i) => {
      const caps = fcFindCombinations(c, FC.table);
      if(caps.length > 0) capturing.push({i, count: caps.length});
    });
    if(capturing.length > 0 && Math.random() < 0.7){
      bestCardIdx = capturing[0].i;
    } else {
      bestCardIdx = Math.floor(Math.random() * hand.length);
    }
  } else {
    // سطوح معمولی، سخت و حرفه‌ای (medium, hard, expert)
    let bestScore = -9999;
    
    hand.forEach((c, idx) => {
      let score = 0;
      const caps = fcFindCombinations(c, FC.table);
      const isCapture = caps.length > 0;
      const willClearAll = isCapture && (caps.length === FC.table.length);
      const isSur = willClearAll && c.rank !== 11;

      if(isSur){
        score += 500; // سور بیشترین اولویت
      } else if(isCapture){
        score += 100;
        // امتیاز به تعداد کارت‌های جمع‌شده
        score += caps.length * 15;
        
        // کارت‌های امتیازآور:
        caps.forEach(cap => {
          if(cap.rank === 1) score += 20; // آس (۱ امتیاز)
          if(cap.rank === 11) score += 25; // سرباز (۱ امتیاز)
          if(cap.suit === 'd' && cap.rank === 10) score += 60; // ده خشت (۳ امتیاز طلایی)
          if(cap.suit === 'c' && cap.rank === 2) score += 45; // دو گشنیز (۲ امتیاز)
          if(cap.suit === 'c') score += 18; // گشنیز برای هفت گشنیز
        });

        // مصرف سرباز اگر زمین خلوت باشد امتیاز کمتری دارد (سرباز را باید برای زمین پر نگه داشت)
        if(c.rank === 11){
          if(caps.length < 3 && !willClearAll && hand.length > 1){
            score -= 40;
          }
        }
      } else {
        // اگر کارتی جمع نمی‌کند، چه کارتی به زمین بدهد؟
        // ۱. نباید ده خشت یا دو گشنیز یا آس یا سرباز را مفت بدهد!
        if(c.suit === 'd' && c.rank === 10) score -= 200;
        if(c.suit === 'c' && c.rank === 2) score -= 150;
        if(c.rank === 1) score -= 100;
        if(c.rank === 11) score -= 120;
        if(c.suit === 'c') score -= 30; // گشنیزها باارزشند

        // ۲. کارتی بیندازد که بازیکن بعدی نتواند به آسانی ۱۱ بسازد
        // در سطح سخت و حرفه‌ای، احتمال ۱۱ شدن را تخمین می‌زند
        if(diff === 'hard' || diff === 'expert'){
          const need = 11 - c.rank;
          if(need >= 1 && need <= 10){
            // اگر کارت‌های نیازمند قبلاً زیاد بازی شده باشند، انداختن این کارت امن‌تر است
            const alreadyPlayedCount = FC.playedCardsHistory.filter(h => h.card.rank === need).length;
            score += alreadyPlayedCount * 12;
          }
          // ترجیح دادن کارت‌های کم‌ارزش مثل شاه یا بی‌بی اگر زمین خالی است
          if((c.rank === 12 || c.rank === 13) && FC.table.length === 0){
            score += 35; // شاه و بی‌بی روی زمین خالی امن هستند چون با هیچ عددی ۱۱ نمی‌شوند
          }
        }
      }

      if(score > bestScore){
        bestScore = score;
        bestCardIdx = idx;
      }
    });
  }

  FC.busy = false;
  fcPlayCard(aiIdx, bestCardIdx);
}

// محاسبه امتیازات پایان راند
function fcEndRound(){
  FC.roundOver = true;
  
  // کارت‌های باقیمانده روی زمین به آخرین تیمی که کارت جمع کرده می‌رسد
  if(FC.table.length > 0 && FC.lastCaptureTeam >= 0){
    const lastPlayerIdx = FC.lastCaptureTeam === 0 ? 0 : 1;
    FC.collected[lastPlayerIdx].push(...FC.table);
    toast('کارت‌های پایانی زمین به تیم ' + (FC.lastCaptureTeam===0 ? 'شما' : 'حریف') + ' رسید', 'cards');
    FC.table = [];
  }

  // تجمیع کارت‌های تیم ۰ (بازیکن ۰ و ۲) و تیم ۱ (بازیکن ۱ و ۳)
  const teamCards = [
    [...FC.collected[0], ...FC.collected[2]],
    [...FC.collected[1], ...FC.collected[3]]
  ];

  // محاسبه گشنیزها (باشگاه)
  const clubsCount = [
    teamCards[0].filter(c => c.suit === 'c').length,
    teamCards[1].filter(c => c.suit === 'c').length
  ];

  const roundPoints = [0, 0];
  let clubsWinnerTeam = -1;

  if(clubsCount[0] > clubsCount[1] && clubsCount[0] >= 7){
    roundPoints[0] += 7;
    clubsWinnerTeam = 0;
  } else if(clubsCount[1] > clubsCount[0] && clubsCount[1] >= 7){
    roundPoints[1] += 7;
    clubsWinnerTeam = 1;
  }

  // ده خشت (۳ امتیاز)
  const has10D = [
    teamCards[0].some(c => c.suit === 'd' && c.rank === 10),
    teamCards[1].some(c => c.suit === 'd' && c.rank === 10)
  ];
  if(has10D[0]) roundPoints[0] += 3;
  if(has10D[1]) roundPoints[1] += 3;

  // دو گشنیز (۲ امتیاز)
  const has2C = [
    teamCards[0].some(c => c.suit === 'c' && c.rank === 2),
    teamCards[1].some(c => c.suit === 'c' && c.rank === 2)
  ];
  if(has2C[0]) roundPoints[0] += 2;
  if(has2C[1]) roundPoints[1] += 2;

  // آس‌ها (هر آس ۱ امتیاز = مجموع ۴ امتیاز)
  const acesCount = [
    teamCards[0].filter(c => c.rank === 1).length,
    teamCards[1].filter(c => c.rank === 1).length
  ];
  roundPoints[0] += acesCount[0];
  roundPoints[1] += acesCount[1];

  // سربازها (هر سرباز ۱ امتیاز = مجموع ۴ امتیاز)
  const jacksCount = [
    teamCards[0].filter(c => c.rank === 11).length,
    teamCards[1].filter(c => c.rank === 11).length
  ];
  roundPoints[0] += jacksCount[0];
  roundPoints[1] += jacksCount[1];

  // سورها (هر سور ۵ امتیاز)
  const surPoints = [
    FC.surCounts[0] * 5,
    FC.surCounts[1] * 5
  ];
  roundPoints[0] += surPoints[0];
  roundPoints[1] += surPoints[1];

  // افزودن امتیاز راند به امتیاز کل تیم‌ها
  FC.teamScores[0] += roundPoints[0];
  FC.teamScores[1] += roundPoints[1];

  // بررسی برنده نهایی بازی (رسیدن به امتیاز هدف، معمولاً ۶۲)
  const win0 = FC.teamScores[0] >= FC.targetScore;
  const win1 = FC.teamScores[1] >= FC.targetScore;

  if(win0 || win1){
    FC.gameOver = true;
    if(win0 && FC.teamScores[0] > FC.teamScores[1]){
      const prevBest = store.get('fourcardsBest', 0);
      store.set('fourcardsBest', prevBest + 1);
      try{ if(typeof coinAdd==='function') coinAdd(50, 'پیروزی در بازی چهاربرگ'); }catch(e){}
      fcSfx('win');
    }
  }

  fcSaveState();
  fcRenderTable();
  fcShowRoundModal({
    roundPoints,
    clubsCount,
    clubsWinnerTeam,
    has10D,
    has2C,
    acesCount,
    jacksCount,
    surPoints,
    isFinal: FC.gameOver
  });
}

// دیالوگ لوکس نمایش نتیجه راند و پایان بازی
function fcShowRoundModal(data){
  const el = document.getElementById('fcModalWrap');
  if(!el) return;

  const isWin = FC.teamScores[0] > FC.teamScores[1];
  const title = data.isFinal
    ? (isWin ? ' پیروزی درخشان تیم شما!' : 'شکست در مسابقه چهاربرگ')
    : ('پایان راند ' + faNum(FC.round));

  const sub = data.isFinal
    ? (isWin ? 'تبریک! تیم شما به امتیاز هدف رسید و پیروز میدان شد.' : 'تیم حریف به امتیاز هدف رسید. دست بعد جبران کنید!')
    : 'محاسبه امتیازات دقیق بر اساس گشنیز، ده خشت، دو گشنیز، تک‌ها، سربازها و سورها:';

  el.innerHTML = '<div class="fc-modal-card reveal">'
    +'<div class="fc-modal-head">'
      +'<span class="fc-modal-ic">' + ic(data.isFinal ? (isWin?'crown':'award') : 'cards', 26) + '</span>'
      +'<div><h3>' + title + '</h3><p>' + sub + '</p></div>'
    +'</div>'
    +'<div class="fc-score-table">'
      +'<div class="fc-st-row head"><span>آیتم امتیازی</span><span>تیم شما (آرش و شما)</span><span>تیم حریف (سامان و بهرام)</span></div>'
      +'<div class="fc-st-row"><span>هفت گشنیز (۷ امتیاز)</span><b>' + (data.clubsWinnerTeam===0 ? 'برنده (۷ امتیاز)' : (faNum(data.clubsCount[0]) + ' گشنیز')) + '</b><b>' + (data.clubsWinnerTeam===1 ? 'برنده (۷ امتیاز)' : (faNum(data.clubsCount[1]) + ' گشنیز')) + '</b></div>'
      +'<div class="fc-st-row"><span>۱۰ خشت (۳ امتیاز)</span><b>' + (data.has10D[0] ? '✓ ۳ امتیاز' : '—') + '</b><b>' + (data.has10D[1] ? '✓ ۳ امتیاز' : '—') + '</b></div>'
      +'<div class="fc-st-row"><span>۲ گشنیز (۲ امتیاز)</span><b>' + (data.has2C[0] ? '✓ ۲ امتیاز' : '—') + '</b><b>' + (data.has2C[1] ? '✓ ۲ امتیاز' : '—') + '</b></div>'
      +'<div class="fc-st-row"><span>تک‌ها (آس هرکدام ۱ امتیاز)</span><b>' + faNum(data.acesCount[0]) + ' تک' + (data.acesCount[0]>0?' ('+faNum(data.acesCount[0])+' امتیاز)':'') + '</b><b>' + faNum(data.acesCount[1]) + ' تک' + (data.acesCount[1]>0?' ('+faNum(data.acesCount[1])+' امتیاز)':'') + '</b></div>'
      +'<div class="fc-st-row"><span>سربازها (هرکدام ۱ امتیاز)</span><b>' + faNum(data.jacksCount[0]) + ' سرباز' + (data.jacksCount[0]>0?' ('+faNum(data.jacksCount[0])+' امتیاز)':'') + '</b><b>' + faNum(data.jacksCount[1]) + ' سرباز' + (data.jacksCount[1]>0?' ('+faNum(data.jacksCount[1])+' امتیاز)':'') + '</b></div>'
      +'<div class="fc-st-row"><span>سورها (هر سور ۵ امتیاز)</span><b>' + (FC.surCounts[0]>0 ? faNum(FC.surCounts[0])+' سور ('+faNum(data.surPoints[0])+' امتیاز)' : '—') + '</b><b>' + (FC.surCounts[1]>0 ? faNum(FC.surCounts[1])+' سور ('+faNum(data.surPoints[1])+' امتیاز)' : '—') + '</b></div>'
      +'<div class="fc-st-row total"><span>مجموع امتیاز این دست</span><b>' + faNum(data.roundPoints[0]) + ' امتیاز</b><b>' + faNum(data.roundPoints[1]) + ' امتیاز</b></div>'
      +'<div class="fc-st-row grand"><span>امتیاز کل مسابقه (هدف: ' + faNum(FC.targetScore) + ')</span><b>' + faNum(FC.teamScores[0]) + '</b><b>' + faNum(FC.teamScores[1]) + '</b></div>'
    +'</div>'
    +'<div class="fc-modal-acts">'
      +(data.isFinal
        ? '<button class="btn gold" onclick="fcStartNewGame()">' + ic('refresh-cw', 15) + ' شروع مسابقه جدید</button><button class="btn ghost" onclick="go(\'games\')">' + ic('arrow-left', 14) + ' بازگشت به بازی‌خانه</button>'
        : '<button class="btn gold" onclick="fcContinueNextRound()">' + ic('play', 15) + ' شروع راند بعدی (' + faNum(FC.round + 1) + ')</button>')
    +'</div>'
  +'</div>';
  el.classList.add('active');
}

// بستن مدال و رفتن به راند بعد
function fcContinueNextRound(){
  const el = document.getElementById('fcModalWrap');
  if(el) el.classList.remove('active');
  FC.round++;
  // حاکم می‌چرخد
  FC.hakem = (FC.hakem + 1) % 4;
  fcNewRound(false);
  fcRenderTable();
  fcTriggerAiIfNeeded();
}

// شروع یک بازی تازه از اول
function fcStartNewGame(){
  const el = document.getElementById('fcModalWrap');
  if(el) el.classList.remove('active');
  fcNewRound(true);
  fcRenderTable();
  fcTriggerAiIfNeeded();
}

// رندر تک کارت شیک و مدرن
function fcRenderCardHtml(card, isFaceDown, onClickStr){
  if(isFaceDown){
    return '<div class="fc-card back" ' + (onClickStr||'') + '>'
      +'<div class="fc-card-back-pattern"></div>'
      +'<span class="fc-card-back-ic">' + ic('cards', 18) + '</span>'
    +'</div>';
  }

  const suitObj = FC_SUITS.find(s => s.id === card.suit) || FC_SUITS[0];
  const isRed = (card.suit === 'h' || card.suit === 'd');
  const suitSvgSmall = ic(suitObj.icName, 12);
  const suitSvgBig = ic(suitObj.icName, 26);

  return '<div class="fc-card face ' + (isRed ? 'red' : 'black') + '" ' + (onClickStr||'') + ' data-id="' + card.id + '">'
    +'<div class="fc-card-corner top">'
      +'<span class="fc-c-val">' + card.label + '</span>'
      +'<span class="fc-c-suit">' + suitSvgSmall + '</span>'
    +'</div>'
    +'<div class="fc-card-center">'
      +'<span class="fc-main-suit">' + suitSvgBig + '</span>'
    +'</div>'
    +'<div class="fc-card-corner bottom">'
      +'<span class="fc-c-val">' + card.label + '</span>'
      +'<span class="fc-c-suit">' + suitSvgSmall + '</span>'
    +'</div>'
  +'</div>';
}

// رندر کامل میز بازی چهاربرگ
function fcRenderTable(){
  const wrap = document.getElementById('fcTableWrap');
  if(!wrap) return;

  const topPlayer = FC_PLAYERS[2];   // یار
  const leftPlayer = FC_PLAYERS[3];  // حریف چپ
  const rightPlayer = FC_PLAYERS[1]; // حریف راست
  const myPlayer = FC_PLAYERS[0];    // کاربر

  const myHand = FC.hands[0] || [];
  const topHandCount = (FC.hands[2] || []).length;
  const leftHandCount = (FC.hands[3] || []).length;
  const rightHandCount = (FC.hands[1] || []).length;

  wrap.innerHTML = ''
    // نوار وضعیت بالای میز
    +'<div class="fc-topbar">'
      +'<div class="fc-team-score team0">'
        +'<span class="fc-ts-lbl">' + ic('users', 13) + ' تیم شما (آرش و شما)</span>'
        +'<b class="fc-ts-val">' + faNum(FC.teamScores[0]) + '</b>'
        +(FC.surCounts[0]>0 ? '<span class="fc-ts-sur">' + faNum(FC.surCounts[0]) + ' سور</span>' : '')
      +'</div>'
      +'<div class="fc-game-info">'
        +'<span class="fc-round-badge">' + ic('award', 13) + ' راند ' + faNum(FC.round) + ' · دست ' + faNum(FC.dealStep) + ' از ۴</span>'
        +'<span class="fc-deck-badge">' + ic('layers', 13) + ' ' + faNum(FC.deck.length) + ' کارت در دسته</span>'
      +'</div>'
      +'<div class="fc-team-score team1">'
        +'<span class="fc-ts-lbl">' + ic('shield', 13) + ' تیم حریف (سامان و بهرام)</span>'
        +'<b class="fc-ts-val">' + faNum(FC.teamScores[1]) + '</b>'
        +(FC.surCounts[1]>0 ? '<span class="fc-ts-sur">' + faNum(FC.surCounts[1]) + ' سور</span>' : '')
      +'</div>'
    +'</div>'

    // سطح میز نمدی سبز کازینویی
    +'<div class="fc-felt-table">'
      +'<div class="fc-table-glow"></div>'

      // بازیکن بالا (یار)
      +'<div class="fc-seat top ' + (FC.turn===2 ? 'active-turn' : '') + '">'
        +'<div class="fc-seat-avatar">' + ic('user', 16) + '</div>'
        +'<div class="fc-seat-info">'
          +'<span class="fc-p-name">' + topPlayer.name + '</span>'
          +'<span class="fc-p-cards">' + faNum(topHandCount) + ' کارت' + (FC.turn===2 ? ' · در حال فکر...' : '') + '</span>'
        +'</div>'
        +'<div class="fc-opponent-cards">'
          +Array(topHandCount).fill(0).map(() => fcRenderCardHtml(null, true, '')).join('')
        +'</div>'
      +'</div>'

      // بازیکن چپ (حریف)
      +'<div class="fc-seat left ' + (FC.turn===3 ? 'active-turn' : '') + '">'
        +'<div class="fc-seat-avatar">' + ic('user', 16) + '</div>'
        +'<div class="fc-seat-info">'
          +'<span class="fc-p-name">' + leftPlayer.name + '</span>'
          +'<span class="fc-p-cards">' + faNum(leftHandCount) + ' کارت</span>'
        +'</div>'
        +'<div class="fc-opponent-cards vertical">'
          +Array(leftHandCount).fill(0).map(() => fcRenderCardHtml(null, true, '')).join('')
        +'</div>'
      +'</div>'

      // مرکز میز: کارت‌های روی زمین
      +'<div class="fc-center-ground">'
        +'<div class="fc-ground-decor"><span>چهاربرگ ۱۱</span></div>'
        +'<div class="fc-table-cards">'
          +(FC.table.length === 0
            ? '<div class="fc-empty-ground">زمین خالی است</div>'
            : FC.table.map((c, i) => {
                const rot = ((i * 17) % 25) - 12;
                return '<div class="fc-ground-card-slot" style="transform:rotate(' + rot + 'deg);">'
                  +fcRenderCardHtml(c, false, '')
                +'</div>';
              }).join(''))
        +'</div>'
      +'</div>'

      // بازیکن راست (حریف)
      +'<div class="fc-seat right ' + (FC.turn===1 ? 'active-turn' : '') + '">'
        +'<div class="fc-seat-avatar">' + ic('user', 16) + '</div>'
        +'<div class="fc-seat-info">'
          +'<span class="fc-p-name">' + rightPlayer.name + '</span>'
          +'<span class="fc-p-cards">' + faNum(rightHandCount) + ' کارت</span>'
        +'</div>'
        +'<div class="fc-opponent-cards vertical">'
          +Array(rightHandCount).fill(0).map(() => fcRenderCardHtml(null, true, '')).join('')
        +'</div>'
      +'</div>'

      // بازیکن پایین (شما)
      +'<div class="fc-seat bottom ' + (FC.turn===0 ? 'active-turn' : '') + '">'
        +'<div class="fc-my-hand-label">'
          +'<span class="fc-turn-prompt">' + (FC.turn===0 ? 'نوبت شماست — یک کارت را برای بازی انتخاب کنید' : 'نوبت ' + FC_PLAYERS[FC.turn].name + ' است...') + '</span>'
        +'</div>'
        +'<div class="fc-my-cards">'
          +myHand.map((c, i) => {
            const canPlay = (FC.turn === 0 && !FC.busy && !FC.roundOver && !FC.gameOver);
            const clickStr = canPlay ? 'onclick="fcPlayCard(0, ' + i + ')"' : '';
            return '<div class="fc-my-card-wrap' + (canPlay ? ' playable' : '') + '">'
              +fcRenderCardHtml(c, false, clickStr)
            +'</div>';
          }).join('')
        +'</div>'
      +'</div>'

      // لایه انیمیشن و بنر سور
      +'<div id="fcSurOverlay" class="fc-sur-overlay"></div>'
    +'</div>'

    // کنترل پنل شیک پایین
    +'<div class="fc-controls-bar">'
      +'<div class="fc-ctrl-group">'
        +'<label><span>' + ic('brain', 13) + ' هوش مصنوعی:</span>'
          +'<select class="fc-select" onchange="fcSetDiff(this.value)">'
            +'<option value="easy"' + (FC.diff==='easy'?' selected':'') + '>آسان</option>'
            +'<option value="medium"' + (FC.diff==='medium'?' selected':'') + '>معمولی</option>'
            +'<option value="hard"' + (FC.diff==='hard'?' selected':'') + '>سخت</option>'
            +'<option value="expert"' + (FC.diff==='expert'?' selected':'') + '>حرفه‌ای</option>'
          +'</select>'
        +'</label>'
        +'<button class="btn ghost sm" onclick="fcToggleSound()">' + ic(FC.sound?'volume':'volume-x', 14) + (FC.sound ? ' صدا روشن' : ' صدا بی‌صدا') + '</button>'
      +'</div>'
      +'<div class="fc-ctrl-group">'
        +'<button class="btn ghost sm" onclick="fcShowRules()">' + ic('help-circle', 14) + ' راهنمای قوانین</button>'
        +'<button class="btn ghost sm" onclick="fcStartNewGame()">' + ic('refresh-cw', 14) + ' بازی جدید</button>'
        +'<button class="btn ghost sm" onclick="toggleGameFS()">' + ic('maximize', 14) + ' تمام‌صفحه</button>'
        +'<button class="btn ghost sm" onclick="go(\'games\')">' + ic('arrow-left', 14) + ' بازی‌خانه</button>'
      +'</div>'
    +'</div>'

    // دیالوگ مودال پاپ‌آپ
    +'<div id="fcModalWrap" class="fc-modal-overlay"></div>';
}

// تغییر سختی بازی
function fcSetDiff(v){
  FC.diff = v;
  store.set('fc_diff', v);
  const names = {easy:'آسان', medium:'معمولی', hard:'سخت', expert:'حرفه‌ای'};
  toast('سطح هوش مصنوعی به «' + (names[v]||v) + '» تغییر کرد', 'brain');
  fcSaveState();
}

// قطع و وصل صدا
function fcToggleSound(){
  FC.sound = !FC.sound;
  store.set('fc_sound', FC.sound);
  toast(FC.sound ? 'صدای کارت‌ها فعال شد' : 'صدا قطع شد', FC.sound ? 'volume' : 'volume-x');
  fcRenderTable();
}

// راهنمای کامل قوانین چهاربرگ
function fcShowRules(){
  const el = document.getElementById('fcModalWrap');
  if(!el) return;
  el.innerHTML = '<div class="fc-modal-card reveal fc-rules-card">'
    +'<div class="fc-modal-head">'
      +'<span class="fc-modal-ic">' + ic('book-open', 26) + '</span>'
      +'<div><h3>قوانین اصیل و نحوه بازی چهاربرگ (۱۱)</h3><p>بازی ۴ نفره دو تیم دو نفره (شما و آرش مقابل سامان و بهرام)</p></div>'
    +'</div>'
    +'<div class="fc-rules-body">'
      +'<div class="fc-rule-item"><b>هدف بازی:</b> جمع‌آوری کارت‌های زمین با کارت دست خود به‌طوری‌که مجموعشان ۱۱ شود، و رساندن امتیاز تیم به ۶۲.</div>'
      +'<div class="fc-rule-item"><b>نحوه جمع کردن:</b>'
        +'<ul>'
          +'<li>اعداد ۱ تا ۱۰: کارتی که مجموعش با یک یا چند کارت زمین ۱۱ شود، آنها را برمی‌دارد (مثلاً ۷ با ۴، یا ۲ با ۹، یا ۳ با ۵ و ۳).</li>'
          +'<li>سرباز (J): تمام کارت‌های روی زمین به جز شاه و بی‌بی را جمع می‌کند.</li>'
          +'<li>بی‌بی (Q): فقط بی‌بی‌های روی زمین را برمی‌دارد.</li>'
          +'<li>شاه (K): فقط شاه‌های روی زمین را برمی‌دارد.</li>'
        +'</ul>'
      +'</div>'
      +'<div class="fc-rule-item"><b> سور:</b> اگر بازیکنی تمام کارت‌های روی زمین را جمع کند به‌طوری‌که زمین کاملاً خالی شود، ۵ امتیاز سور می‌گیرد (جمع کردن با سرباز یا در دست آخر سور محسوب نمی‌شود).</div>'
      +'<div class="fc-rule-item"><b> امتیازدهی پایان هر راند:</b>'
        +'<ul>'
          +'<li>هفت گشنیز: تیمی که حداقل ۷ گشنیز (خال ♣) جمع کند، ۷ امتیاز می‌گیرد.</li>'
          +'<li>۱۰ خشت (♦۱۰): ۳ امتیاز</li>'
          +'<li>۲ گشنیز (♣۲): ۲ امتیاز</li>'
          +'<li>هر آس (تک): ۱ امتیاز (مجموع ۴ امتیاز)</li>'
          +'<li>هر سرباز: ۱ امتیاز (مجموع ۴ امتیاز)</li>'
          +'<li>هر سور: ۵ امتیاز</li>'
        +'</ul>'
      +'</div>'
    +'</div>'
    +'<div class="fc-modal-acts">'
      +'<button class="btn gold" onclick="document.getElementById(\'fcModalWrap\').classList.remove(\'active\')">' + ic('check', 15) + ' متوجه شدم، شروع بازی</button>'
    +'</div>'
  +'</div>';
  el.classList.add('active');
}

// انجین سازگار با سیستم بازی‌های کافی‌نت
const fourcardsEng = {
  start(container){
    FC.container = container;
    fcLoadState();
    if(FC.hands.every(h => h.length === 0)){
      fcNewRound(false);
    }
    fcRenderTable();
    fcTriggerAiIfNeeded();
  },
  stop(){
    fcSaveState();
  },
  key(e){
    if(e.key === 'r' || e.key === 'R') fcStartNewGame();
    if(e.key === 'h' || e.key === 'H') fcShowRules();
    if(e.key === 'm' || e.key === 'M') fcToggleSound();
  }
};

// ثبت بازی در انجین بازی‌های نت‌یار
Object.assign(GAME_ENG, {'fourcards': fourcardsEng});

// اکسپوز توابع به پنجره برای هندلرهای onclick اینلاین
window.fcPlayCard = fcPlayCard;
window.fcSetDiff = fcSetDiff;
window.fcToggleSound = fcToggleSound;
window.fcShowRules = fcShowRules;
window.fcStartNewGame = fcStartNewGame;
window.fcContinueNextRound = fcContinueNextRound;
window.FC = FC;
window.fcCheckNextTurn = fcCheckNextTurn;
window.fcNewRound = fcNewRound;
