/* ===== هوش مصنوعی نت‌یار — چت واقعی با OpenRouter + استریم + تاریخچه ===== */
'use strict';
const AI={
  chats:[],curId:null,streaming:false,abort:null,search:'',editing:null,
  model:'openai/gpt-4o-mini',
  sys:'تو دستیار هوشمند نت‌یار هستی — یک دستیار فارسی حرفه‌ای، صمیمی و کاربردی برای کارهای روزمره. اگر کاربر فارسی نوشت فارسی جواب بده، اگر انگلیسی نوشت انگلیسی. جواب‌هایت تمیز، دقیق، کوتاهِ مفید و با Markdown زیبا باشد. برای کدها همیشه زبان را مشخص کن.',
  _inited:false,_key:null,
  backend:'/api/chat',
  rate:{c:0,t:0},
};

function aiLazy(){
  if(AI._inited)return;
  try{
    AI.chats=store.get('aiChats',[]);
    AI.curId=store.get('aiCur',null);
    const k=store.get('aiKey','');
    if(k)AI._key=k;
  }catch(e){}
  AI._inited=true;
  if(!AI.chats)AI.chats=[];
  // پاکسازی قدیمی
  AI.chats=AI.chats.filter(c=>c&&c.id&&Array.isArray(c.msgs));
  // اگر چت جاری حذف شده بود
  if(AI.curId&&!AI.chats.find(c=>c.id===AI.curId))AI.curId=AI.chats[0]?.id||null;
}
function aiSave(){
  try{store.set('aiChats',AI.chats);store.set('aiCur',AI.curId);if(AI._key)store.set('aiKey',AI._key);}catch(e){}
}
function aiUid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function aiNow(){return Date.now();}
function aiTime(t){
  try{return new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit'}).format(new Date(t));}catch(e){const d=new Date(t);return d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');}
}
function aiDate(t){
  try{return new Intl.DateTimeFormat('fa-IR',{month:'short',day:'numeric'}).format(new Date(t));}catch(e){return '';}
}
function aiIsRTL(s){return /[\u0600-\u06FF]/.test(s||'');}
function aiEsc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function aiGetKey(){
  if(AI._key)return AI._key;
  try{
    const sk=store.get('aiKey','');
    if(sk)return sk;
  }catch(e){}
  // کلید پیش‌فرض برای دمو (در نسخهٔ امن باید از بک‌اند بیاید)
  try{return atob('c2stb3ItdjEtM2Q1Mzg1OWIyYzc1MWU1MGIzMjFmYzcwZjFjODlmZjM1OWM5ZTJjMmE5ZWIwYWRkMDAyNGFhODVkZTRhZDdjNg==');}catch(e){return '';}
}
function aiSetKey(k){AI._key=(k||'').trim();aiSave();}

/* ---------- ریت لیمیت کلاینت ---------- */
function aiCanSend(){
  const now=Date.now();
  if(now-AI.rate.t>60000){AI.rate.c=0;AI.rate.t=now;}
  if(AI.rate.c>=20)return false;
  AI.rate.c++;return true;
}

/* ---------- چت‌ها ---------- */
function aiCur(){aiLazy();return AI.chats.find(c=>c.id===AI.curId)||null;}
function aiNewChat(){
  aiLazy();
  const id=aiUid();
  const ch={id,title:'مکالمه جدید',created:aiNow(),updated:aiNow(),msgs:[]};
  AI.chats.unshift(ch);
  AI.curId=id;
  aiSave();
  aiRerender();
  setTimeout(()=>{const el=document.getElementById('aiInput');if(el)el.focus();},60);
  toast('مکالمه جدید ساخته شد','sparkles');
}
function aiOpenChat(id){
  aiLazy();
  const ch=AI.chats.find(c=>c.id===id);
  if(!ch)return;
  AI.curId=id;
  aiSave();
  aiRerender();
  aiCloseDrawer();
}
function aiDeleteChat(id,e){
  if(e)e.stopPropagation();
  if(!confirm('این مکالمه حذف شود؟'))return;
  AI.chats=AI.chats.filter(c=>c.id!==id);
  if(AI.curId===id)AI.curId=AI.chats[0]?.id||null;
  aiSave();
  aiRerender();
  toast('مکالمه حذف شد','trash');
}
function aiRenameChat(id,e){
  if(e)e.stopPropagation();
  const ch=AI.chats.find(c=>c.id===id);
  if(!ch)return;
  const nt=prompt('نام جدید:',ch.title);
  if(!nt)return;
  ch.title=nt.trim().slice(0,60)||ch.title;
  ch.updated=aiNow();
  aiSave();
  aiRerenderList();
}
function aiClearCur(){
  const c=aiCur();
  if(!c||!c.msgs.length)return;
  if(!confirm('پیام‌های این مکالمه پاک شود؟'))return;
  c.msgs=[];
  c.updated=aiNow();
  aiSave();
  aiRerender();
}
function aiSearch(v){
  AI.search=(v||'').trim();
  aiRerenderList();
}

/* ---------- کارت‌های شروع ---------- */
const AI_QUICK=[
  {i:'message',t:'گفت‌وگو',d:'پرسش و پاسخ و کمک روزمره',p:'سلام! می‌خوام باهات گپ بزنم. می‌تونی خودتو معرفی کنی و بگی چطور می‌تونی کمکم کنی؟'},
  {i:'type',t:'نویسنده',d:'نوشتن و اصلاح انواع متن',p:'لطفاً یک متن حرفه‌ای، روان و جذاب درباره [موضوع دلخواهت را اینجا بنویس] بنویس. لحن دوستانه و رسمی باشه.'},
  {i:'graduation',t:'آموزش',d:'یادگیری، خلاصه‌سازی و حل تمرین',p:'این موضوع رو به زبان ساده و مرحله‌به‌مرحله برام توضیح بده: '},
  {i:'monitor',t:'کامپیوتر',d:'کمک برای مشکلات کامپیوتری',p:'یه مشکل کامپیوتری دارم، لطفاً راهنمایی کن: '},
  {i:'globe',t:'ترجمه',d:'ترجمه فارسی و انگلیسی',p:'این متن رو به انگلیسی ترجمه کن و اگر نکته گرامری داره بگو: '},
  {i:'book-open',t:'خلاصه‌ساز',d:'خلاصه کردن متن‌های طولانی',p:'این متن طولانی رو در ۵ نکته کلیدی خلاصه کن: '},
];
const AI_WRITER=[
  {t:'نوشتن متن',p:'یک متن کامل و حرفه‌ای درباره این موضوع بنویس: '},
  {t:'نامه اداری',p:'یک نامه اداری رسمی و محترمانه درباره این موضوع بنویس: '},
  {t:'درخواست رسمی',p:'یک درخواست رسمی و قانع‌کننده بنویس: '},
  {t:'متن دوستانه',p:'این متن رو به لحن صمیمی و دوستانه بازنویسی کن: '},
  {t:'کپشن',p:'چند کپشن جذاب و کوتاه برای این موضوع بنویس: '},
  {t:'بازنویسی',p:'این متن رو بازنویسی کن تا روان‌تر و حرفه‌ای‌تر بشه: '},
  {t:'اصلاح نگارشی',p:'غلط‌های نگارشی و املایی این متن رو اصلاح کن: '},
  {t:'کوتاه کردن',p:'این متن رو کوتاه‌تر و خلاصه‌تر کن: '},
  {t:'حرفه‌ای کردن',p:'این متن رو حرفه‌ای‌تر و رسمی‌تر کن: '},
];
const AI_EDU=[
  {t:'توضیح درس',p:'این درس رو ساده و کامل توضیح بده: '},
  {t:'خلاصه درس',p:'این درس رو در چند نکته خلاصه کن: '},
  {t:'ساخت سؤال',p:'از این متن ۵ سؤال امتحانی بساز: '},
  {t:'آزمون',p:'یک آزمون ۵ سؤالی چهارگزینه‌ای از این موضوع بساز: '},
  {t:'مرحله‌به‌مرحله',p:'این مسئله رو مرحله‌به‌مرحله حل کن: '},
  {t:'ساده‌سازی',p:'این مطلب پیچیده رو به زبان خیلی ساده توضیح بده: '},
];
const AI_COMP=[
  {t:'مشکل ویندوز',p:'ویندوز من این مشکل رو داره، راه حل چیه؟ '},
  {t:'توضیح ارور',p:'این ارور یعنی چی و چطور حلش کنم؟ '},
  {t:'نصب نرم‌افزار',p:'راهنمای نصب این نرم‌افزار رو بده: '},
  {t:'تنظیمات',p:'چطور این تنظیم رو در ویندوز انجام بدم؟ '},
  {t:'اینترنت',p:'اینترنت من این مشکل رو داره: '},
  {t:'عمومی',p:'یه مشکل کامپیوتری دارم: '},
];
const AI_TRANS=[
  {t:'فا → En',p:'این متن فارسی رو به انگلیسی ترجمه کن: '},
  {t:'En → فا',p:'Translate this English text to Persian: '},
  {t:'رسمی',p:'این متن رو به انگلیسی رسمی ترجمه کن: '},
  {t:'دوستانه',p:'این متن رو به فارسی محاوره‌ای و دوستانه ترجمه کن: '},
];

/* ---------- Markdown حرفه‌ای ---------- */
function aiMdParse(text){
  if(!text)return '';
  // جدا کردن کدبلاک‌ها
  const blocks=[];
  let tmp=text.replace(/```(\w+)?\n?([\s\S]*?)```/g,(m,lang,code)=>{
    const id='__CB_'+blocks.length+'__';
    blocks.push({lang:(lang||'').trim(),code:code});
    return id;
  });
  // escape باقی
  tmp=aiEsc(tmp);
  // جداسازی بلاک‌ها برای پردازش خطی
  const lines=tmp.split('\n');
  let out='',inList=null,listType=null,tableBuf=[],inQuote=false,quoteBuf=[];
  const flushList=()=>{
    if(inList){out+='</'+(listType==='ol'?'ol':'ul')+'>';inList=null;listType=null;}
  };
  const flushTable=()=>{
    if(tableBuf.length>=2){
      out+='<div class="md-table-wrap"><table class="md-table">';
      const head=tableBuf[0].split('|').map(s=>s.trim()).filter(Boolean);
      const sep=tableBuf[1];
      if(/^\s*\|?(\s*:?-+:?\s*\|)+\s*$/.test(sep)){
        out+='<thead><tr>'+head.map(h=>'<th>'+aiInline(h)+'</th>').join('')+'</tr></thead><tbody>';
        for(let i=2;i<tableBuf.length;i++){
          const row=tableBuf[i].split('|').map(s=>s.trim()).filter(Boolean);
          if(!row.length)continue;
          out+='<tr>'+row.map(c=>'<td>'+aiInline(c)+'</td>').join('')+'</tr>';
        }
        out+='</tbody></table></div>';
      }
    }
    tableBuf=[];
  };
  const flushQuote=()=>{
    if(quoteBuf.length){out+='<blockquote>'+quoteBuf.map(l=>'<p>'+aiInline(l)+'</p>').join('')+'</blockquote>';quoteBuf=[];inQuote=false;}
  };
  for(let i=0;i<lines.length;i++){
    let l=lines[i];
    // table detection
    if(l.includes('|')&&i+1<lines.length&&/^\s*\|?(\s*:?-+:?\s*\|)+\s*$/.test(lines[i+1])){
      flushList();flushQuote();
      tableBuf=[l,lines[i+1]];
      i+=1;
      while(i+1<lines.length&&lines[i+1].includes('|')&&lines[i+1].trim()!==''){
        tableBuf.push(lines[++i]);
      }
      flushTable();
      continue;
    }
    if(!l.trim()){
      flushList();flushTable();flushQuote();
      continue;
    }
    // code placeholder line alone
    if(/^__CB_\d+__$/.test(l.trim())){
      flushList();flushTable();flushQuote();
      const m=l.trim().match(/__CB_(\d+)__/);
      if(m){
        const b=blocks[+m[1]];
        out+=aiCodeBlock(b.code,b.lang,+m[1]);
      }
      continue;
    }
    // blockquote
    if(/^&gt;/.test(l)||/^>/.test(l)){
      if(!inQuote){flushList();flushTable();inQuote=true;quoteBuf=[];}
      quoteBuf.push(l.replace(/^&gt;\s?|^>\s?/,''));
      continue;
    }else if(inQuote){flushQuote();}
    // heading
    const hm=l.match(/^(#{1,6})\s+(.*)$/);
    if(hm){
      flushList();flushTable();
      const lvl=hm[1].length;
      out+='<h'+lvl+' class="md-h'+lvl+'">'+aiInline(hm[2])+'</h'+lvl+'>';
      continue;
    }
    // ul
    const um=l.match(/^\s*[-*+]\s+(.*)$/);
    if(um){
      if(!inList||listType!=='ul'){flushList();out+='<ul class="md-ul">';inList=true;listType='ul';}
      out+='<li>'+aiInline(um[1])+'</li>';
      continue;
    }
    // ol
    const om=l.match(/^\s*\d+\.\s+(.*)$/);
    if(om){
      if(!inList||listType!=='ol'){flushList();out+='<ol class="md-ol">';inList=true;listType='ol';}
      out+='<li>'+aiInline(om[1])+'</li>';
      continue;
    }
    flushList();
    out+='<p class="md-p">'+aiInline(l)+'</p>';
  }
  flushList();flushTable();flushQuote();
  // جایگذاری کدبلاک‌های inline باقی‌مانده در متن (اگر داخل پاراگراف بودند)
  out=out.replace(/__CB_(\d+)__/g,(m,n)=>{const b=blocks[+n];return aiCodeBlock(b.code,b.lang,+n);});
  return out;
}
function aiInline(s){
  if(!s)return '';
  // لینک‌ها
  s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  // bold
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/__(.+?)__/g,'<strong>$1</strong>');
  // italic
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/_(.+?)_/g,'<em>$1</em>');
  // inline code
  s=s.replace(/`([^`]+)`/g,'<code class="md-ic">$1</code>');
  return s;
}
function aiCodeBlock(code,lang,idx){
  const esc=aiEsc(code);
  const l=(lang||'text').toLowerCase();
  return '<div class="md-code"><div class="md-code-head"><span class="md-lang">'+aiEsc(l||'code')+'</span><button class="md-copy" onclick="aiCopyCode(this)">'+ic('copy',12)+'کپی</button></div><pre><code class="lang-'+aiEsc(l)+'">'+esc+'</code></pre></div>';
}
function aiCopyCode(btn){
  const pre=btn.closest('.md-code').querySelector('pre code');
  if(!pre)return;
  copyText(pre.textContent).then(ok=>{
    if(ok){const o=btn.innerHTML;btn.innerHTML=ic('check',12)+'کپی شد';setTimeout(()=>btn.innerHTML=o,1400);toast('کد کپی شد','copy');}
  });
}

/* ---------- تماس با AI ---------- */
async function aiCallBackend(msgs,signal){
  const r=await fetch(AI.backend,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:msgs,model:AI.model,stream:true}),
    signal
  });
  if(!r.ok)throw new Error('backend '+r.status);
  return r;
}
async function aiCallDirect(msgs,onChunk,signal){
  const key=aiGetKey();
  if(!key)throw new Error('no_key');
  const res=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{
      'Authorization':'Bearer '+key,
      'Content-Type':'application/json',
      'HTTP-Referer':location.origin,
      'X-Title':'NetYar AI'
    },
    body:JSON.stringify({model:AI.model,messages:msgs,stream:true,temperature:0.7}),
    signal
  });
  if(!res.ok){
    const t=await res.text().catch(()=> '');
    if(res.status===429)throw new Error('rate');
    if(res.status===401||res.status===403)throw new Error('auth');
    throw new Error('http '+res.status+' '+t.slice(0,200));
  }
  const reader=res.body.getReader();
  const dec=new TextDecoder();
  let buf='';
  while(true){
    if(signal&&signal.aborted)throw new DOMException('Aborted','AbortError');
    const {done,value}=await reader.read();
    if(done)break;
    buf+=dec.decode(value,{stream:true});
    const lines=buf.split('\n');
    buf=lines.pop()||'';
    for(const line of lines){
      const tr=line.trim();
      if(!tr||!tr.startsWith('data:'))continue;
      const d=tr.slice(5).trim();
      if(d==='[DONE]')return;
      try{
        const j=JSON.parse(d);
        const delta=j.choices?.[0]?.delta?.content;
        if(delta)onChunk(delta);
      }catch(e){}
    }
  }
}
async function aiStream(msgs,onChunk,signal){
  // اول بک‌اند
  try{
    const r=await aiCallBackend(msgs,signal);
    // اگر بک‌اند استریم SSE برگرداند
    if(r.body){
      const reader=r.body.getReader();
      const dec=new TextDecoder();
      let buf='';
      while(true){
        if(signal&&signal.aborted)throw new DOMException('Aborted','AbortError');
        const {done,value}=await reader.read();
        if(done)break;
        buf+=dec.decode(value,{stream:true});
        const parts=buf.split('\n\n');
        buf=parts.pop()||'';
        for(const part of parts){
          const lines=part.split('\n');
          for(const ln of lines){
            if(ln.startsWith('data:')){
              const d=ln.slice(5).trim();
              if(d==='[DONE]')return;
              try{
                const j=JSON.parse(d);
                // بک‌اند ما ممکنه {content} یا openrouter format بده
                const c=j.content||j.choices?.[0]?.delta?.content||j.delta;
                if(c)onChunk(c);
              }catch(e){
                // اگر متن ساده بود
                if(ln.includes('content')){}
                else if(d&&!d.startsWith('{'))onChunk(d);
              }
            }
          }
        }
      }
      return;
    }else{
      const j=await r.json();
      if(j.content)onChunk(j.content);
      return;
    }
  }catch(e){
    if(e.name==='AbortError')throw e;
    // fallback به مستقیم
    // console.warn('backend fail, fallback direct',e);
  }
  await aiCallDirect(msgs,onChunk,signal);
}

/* ---------- ارسال ---------- */
function aiSend(prefill){
  aiLazy();
  const inp=document.getElementById('aiInput');
  let txt=(prefill!==undefined?prefill:(inp?inp.value:''))+'';
  txt=txt.trim();
  if(!txt)return;
  if(!aiCanSend()){toast('تعداد درخواست‌ها زیاد است، کمی صبر کن','alert');return;}
  if(!aiCur())aiNewChat();
  const cur=aiCur();
  if(!cur)return;
  // اگر در حال استریم بود
  if(AI.streaming){toast('صبر کن تا پاسخ تمام شود','info');return;}

  const um={id:aiUid(),role:'user',content:txt,time:aiNow()};
  cur.msgs.push(um);
  if(cur.msgs.length===1){
    cur.title=txt.slice(0,48)+(txt.length>48?'…':'');
  }
  cur.updated=aiNow();
  aiSave();
  if(inp)inp.value='';
  aiAutoResize(inp);
  aiRerenderChat();

  // پیام دستیار خالی
  const am={id:aiUid(),role:'assistant',content:'',time:aiNow(),streaming:true};
  cur.msgs.push(am);
  aiRerenderChat();
  aiScrollBottom();

  const ctrl=new AbortController();
  AI.abort=ctrl;
  AI.streaming=true;
  aiUpdateInputState();

  const history=[{role:'system',content:AI.sys}].concat(cur.msgs.filter(m=>m.role!=='assistant'||!m.streaming||m.content).slice(-20).map(m=>({role:m.role,content:m.content})));
  // حذف آخرین دستیار خالی از تاریخچه ارسالی
  const sendHist=history.filter((m,i)=>!(i===history.length-1&&m.role==='assistant'&&!m.content));

  let full='';
  const onChunk=(delta)=>{
    full+=delta;
    am.content=full;
    const el=document.getElementById('am-'+am.id);
    if(el){
      const contentEl=el.querySelector('.ai-bubble-content');
      if(contentEl){
        contentEl.innerHTML=aiMdParse(full)+'<span class="ai-cursor"></span>';
        contentEl.classList.toggle('rtl',aiIsRTL(full));
        contentEl.classList.toggle('ltr',!aiIsRTL(full));
      }
    }
    aiScrollBottom(false);
  };
  aiStream(sendHist,onChunk,ctrl.signal).then(()=>{
    am.streaming=false;
    am.time=aiNow();
    cur.updated=aiNow();
    aiSave();
    AI.streaming=false;
    AI.abort=null;
    aiUpdateInputState();
    aiRerenderChat();
    aiScrollBottom();
  }).catch(err=>{
    AI.streaming=false;
    AI.abort=null;
    aiUpdateInputState();
    if(err.name==='AbortError'){
      am.content=full||am.content||'';
      am.streaming=false;
      if(!am.content)cur.msgs=cur.msgs.filter(m=>m.id!==am.id);
      aiSave();
      aiRerenderChat();
      return;
    }
    let msg='اتصال به هوش مصنوعی برقرار نشد. لطفاً دوباره تلاش کنید.';
    if(err.message==='rate')msg='تعداد درخواست‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید.';
    else if(err.message==='no_key')msg='کلید API تنظیم نشده. لطفاً در تنظیمات کلید را وارد کنید یا از بک‌اند استفاده کنید.';
    else if(err.message==='auth')msg='کلید API نامعتبر است. لطفاً آن را بررسی کنید.';
    else if(!navigator.onLine)msg='اتصال اینترنت خود را بررسی کنید.';
    am.content=full?full+'\n\n---\n! '+msg:'! '+msg;
    am.streaming=false;
    am.error=true;
    aiSave();
    aiRerender();
    toast(msg,'alert');
  });
}
function aiStop(){
  if(AI.abort)AI.abort.abort();
}
function aiRegenerate(mid){
  const cur=aiCur();if(!cur)return;
  const idx=cur.msgs.findIndex(m=>m.id===mid);
  if(idx<0)return;
  // پیدا کردن آخرین پیام کاربر قبل از این
  let uIdx=-1;
  for(let i=idx-1;i>=0;i--)if(cur.msgs[i].role==='user'){uIdx=i;break;}
  if(uIdx<0)return;
  // حذف پیام‌های بعد از کاربر
  cur.msgs=cur.msgs.slice(0,uIdx+1);
  aiSave();
  aiRerenderChat();
  aiSend(cur.msgs[uIdx].content);
}
function aiContinue(mid){
  const cur=aiCur();if(!cur)return;
  aiSend('ادامه بده');
}
function aiEditMsg(id){
  const cur=aiCur();if(!cur)return;
  const m=cur.msgs.find(x=>x.id===id);
  if(!m||m.role!=='user')return;
  const nt=prompt('ویرایش پیام:',m.content);
  if(nt===null)return;
  const t=nt.trim();
  if(!t)return;
  const idx=cur.msgs.findIndex(x=>x.id===id);
  cur.msgs=cur.msgs.slice(0,idx);
  aiSave();
  aiRerenderChat();
  aiSend(t);
}
function aiCopy(txt){
  copyText(txt).then(ok=>{if(ok)toast('کپی شد','copy');});
}
function aiCopyMsg(id){
  const cur=aiCur();if(!cur)return;
  const m=cur.msgs.find(x=>x.id===id);
  if(m)aiCopy(m.content);
}

/* ---------- رندر ---------- */
function aiView(){
  aiLazy();
  const cur=aiCur();
  const hasMsgs=cur&&cur.msgs.length>0;
  return '<div class="ai-wrap" id="aiWrap">'
    +'<aside class="ai-side" id="aiSide">'
      +'<div class="ai-side-head">'
        +'<button class="btn primary ai-new" onclick="aiNewChat()">'+ic('sparkles',14)+'<span>مکالمه جدید</span></button>'
        +'<div class="ai-search"><span class="si">'+ic('search',14)+'</span><input id="aiSearch" placeholder="جستجوی مکالمات…" oninput="aiSearch(this.value)" value="'+aiEsc(AI.search)+'"><span class="clear" onclick="document.getElementById(\'aiSearch\').value=\'\';aiSearch(\'\')" style="display:'+(AI.search?'flex':'none')+'">'+ic('x',12)+'</span></div>'
      +'</div>'
      +'<div class="ai-chats" id="aiChatsList">'+aiChatsListHtml()+'</div>'
      +'<div class="ai-side-foot">'
        +'<div class="ai-foot-info">'+ic('shield-check',12)+'نسخه ۱۱٫۰ — امن و خصوصی</div>'
        +'<div class="ai-foot-actions">'
          +'<button class="ai-foot-btn" onclick="aiShowSettings()" title="تنظیمات">'+ic('wrench',13)+'کلید API</button>'
          +'<button class="ai-foot-btn" onclick="aiExportChats()" title="خروجی گرفتن">'+ic('download',13)+'خروجی</button>'
        +'</div>'
      +'</div>'
    +'</aside>'
    +'<div class="ai-main">'
      +'<div class="ai-header">'
        +'<button class="ai-menu-btn" onclick="aiToggleDrawer()" aria-label="منو">'+ic('menu',18)+'</button>'
        +'<div class="ai-head-txt"><div class="ai-head-title">'+ic('brain',16)+'هوش مصنوعی نت‌یار</div><div class="ai-head-sub">دستیار هوشمند شما برای کارهای روزمره</div></div>'
        +'<div class="ai-head-actions">'
          +'<button class="icon-btn" onclick="aiClearCur()" title="پاک کردن این مکالمه">'+ic('trash',14)+'</button>'
          +'<button class="icon-btn" onclick="aiNewChat()" title="مکالمه جدید">'+ic('sparkles',14)+'</button>'
        +'</div>'
      +'</div>'
      +'<div class="ai-chat-area" id="aiChatArea">'
        +(hasMsgs?aiChatHtml(cur):aiWelcomeHtml())
      +'</div>'
      +'<div class="ai-tools-bar" id="aiToolsBar">'+aiToolsHtml()+'</div>'
      +'<div class="ai-input-area">'
        +'<div class="ai-input-wrap">'
          +'<textarea id="aiInput" placeholder="پیامت را برای هوش مصنوعی بنویس…" rows="1" oninput="aiAutoResize(this);aiDetectDir(this)" onkeydown="aiInputKey(event)"></textarea>'
          +'<button id="aiSendBtn" class="ai-send" onclick="aiSend()" title="ارسال (Enter)">'+ic('arrow-up',18)+'</button>'
          +'<button id="aiStopBtn" class="ai-stop" onclick="aiStop()" title="توقف" style="display:none">'+ic('x',14)+'<span>توقف</span></button>'
        +'</div>'
        +'<div class="ai-input-hint"><span>'+ic('keyboard',11)+'Enter ارسال • Shift+Enter خط جدید</span><span class="ai-model">'+aiEsc(AI.model)+'</span></div>'
      +'</div>'
    +'</div>'
    +'<div class="ai-drawer-bg" id="aiDrawerBg" onclick="aiCloseDrawer()"></div>'
  +'</div>';
}
function aiChatsListHtml(){
  aiLazy();
  let list=AI.chats;
  if(AI.search){
    const q=AI.search.toLowerCase();
    list=list.filter(c=>c.title.toLowerCase().includes(q)||c.msgs.some(m=>m.content.toLowerCase().includes(q)));
  }
  if(!list.length)return '<div class="ai-empty"><span class="e-ic">'+ic('search',28)+'</span><p>'+(AI.search?'نتیجه‌ای پیدا نشد':'هنوز مکالمه‌ای نداری')+'</p></div>';
  return list.map(c=>{
    const last=c.msgs[c.msgs.length-1];
    const isCur=c.id===AI.curId;
    return '<div class="ai-chat-item'+(isCur?' active':'')+'" onclick="aiOpenChat(\''+c.id+'\')">'
      +'<div class="ai-ci-head"><span class="ai-ci-title">'+aiEsc(c.title)+'</span><span class="ai-ci-date">'+aiDate(c.updated)+'</span></div>'
      +'<div class="ai-ci-last">'+aiEsc((last?last.content:'').slice(0,80))+'</div>'
      +'<div class="ai-ci-actions">'
        +'<span class="ai-ci-btn" onclick="aiRenameChat(\''+c.id+'\',event)" title="تغییر نام">'+ic('type',12)+'</span>'
        +'<span class="ai-ci-btn del" onclick="aiDeleteChat(\''+c.id+'\',event)" title="حذف">'+ic('x',12)+'</span>'
      +'</div>'
    +'</div>';
  }).join('');
}
function aiWelcomeHtml(){
  return '<div class="ai-welcome">'
    +'<div class="ai-w-ic">'+ic('brain',42)+'</div>'
    +'<h2>سلام<br>من دستیار هوشمند <span>نت‌یار</span> هستم.</h2>'
    +'<p>امروز چه کاری می‌توانم برایت انجام دهم؟</p>'
    +'<div class="ai-quick-grid">'+AI_QUICK.map(q=>'<button class="ai-qcard" onclick="aiQuick(\''+q.p.replace(/'/g,"\\'")+'\')"><span class="q-ic">'+ic(q.i,18)+'</span><span class="q-t">'+q.t+'</span><span class="q-d">'+q.d+'</span></button>').join('')+'</div>'
    +'<div class="ai-w-foot"><span>'+ic('shield-check',12)+'امن • سریع • فارسی و انگلیسی • با Markdown و کد</span></div>'
  +'</div>';
}
function aiChatHtml(cur){
  if(!cur||!cur.msgs.length)return aiWelcomeHtml();
  return '<div class="ai-msgs">'+cur.msgs.map(m=>aiMsgHtml(m)).join('')+'</div>';
}
function aiMsgHtml(m){
  const isUser=m.role==='user';
  const rtl=aiIsRTL(m.content);
  const time=aiTime(m.time);
  if(isUser){
    return '<div class="ai-msg user" id="am-'+m.id+'" data-id="'+m.id+'">'
      +'<div class="ai-avatar user">'+ic('user',16)+'</div>'
      +'<div class="ai-bubble-wrap"><div class="ai-bubble user '+(rtl?'rtl':'ltr')+'"><div class="ai-bubble-content">'+aiEsc(m.content).replace(/\n/g,'<br>')+'</div></div>'
      +'<div class="ai-msg-meta"><span class="ai-time">'+time+'</span><span class="ai-actions">'
        +'<button class="ai-act" onclick="aiCopyMsg(\''+m.id+'\')" title="کپی">'+ic('copy',12)+'</button>'
        +'<button class="ai-act" onclick="aiEditMsg(\''+m.id+'\')" title="ویرایش">'+ic('type',12)+'</button>'
      +'</span></div></div></div>';
  }else{
    const streaming=m.streaming;
    const content=streaming&&!m.content?'<div class="ai-typing"><span>AI در حال پاسخ دادن</span><i></i><i></i><i></i></div>':aiMdParse(m.content);
    return '<div class="ai-msg ai'+(m.error?' err':'')+'" id="am-'+m.id+'" data-id="'+m.id+'">'
      +'<div class="ai-avatar ai">'+ic('sparkles',16)+'</div>'
      +'<div class="ai-bubble-wrap"><div class="ai-bubble ai '+(rtl?'rtl':'ltr')+'"><div class="ai-bubble-content '+(rtl?'rtl':'ltr')+'">'+content+(streaming&&m.content?'<span class="ai-cursor"></span>':'')+'</div></div>'
      +'<div class="ai-msg-meta"><span class="ai-time">'+time+'</span>'
      +'<span class="ai-actions">'
        +'<button class="ai-act" onclick="aiCopyMsg(\''+m.id+'\')" title="کپی">'+ic('copy',12)+'</button>'
        +'<button class="ai-act" onclick="aiRegenerate(\''+m.id+'\')" title="دوباره تولید کن">'+ic('rotate-ccw',12)+'</button>'
        +'<button class="ai-act" onclick="aiContinue(\''+m.id+'\')" title="ادامه بده">'+ic('arrow-down',12)+'</button>'
      +'</span></div></div></div>';
  }
}
function aiToolsHtml(){
  // تب‌های ابزار
  return '<div class="ai-tools-tabs">'
    +'<button class="ai-tool-tab active" data-tab="writer" onclick="aiToolTab(\'writer\',this)">'+ic('type',13)+'نویسنده</button>'
    +'<button class="ai-tool-tab" data-tab="edu" onclick="aiToolTab(\'edu\',this)">'+ic('graduation',13)+'آموزش</button>'
    +'<button class="ai-tool-tab" data-tab="comp" onclick="aiToolTab(\'comp\',this)">'+ic('monitor',13)+'کامپیوتر</button>'
    +'<button class="ai-tool-tab" data-tab="trans" onclick="aiToolTab(\'trans\',this)">'+ic('globe',13)+'ترجمه</button>'
  +'</div>'
  +'<div class="ai-tools-panels">'
    +'<div class="ai-tool-panel active" id="aiPanel-writer">'+AI_WRITER.map(t=>'<button class="ai-chip" onclick="aiQuick(\''+t.p.replace(/'/g,"\\'")+'\')">'+t.t+'</button>').join('')+'</div>'
    +'<div class="ai-tool-panel" id="aiPanel-edu">'+AI_EDU.map(t=>'<button class="ai-chip" onclick="aiQuick(\''+t.p.replace(/'/g,"\\'")+'\')">'+t.t+'</button>').join('')+'</div>'
    +'<div class="ai-tool-panel" id="aiPanel-comp">'+AI_COMP.map(t=>'<button class="ai-chip" onclick="aiQuick(\''+t.p.replace(/'/g,"\\'")+'\')">'+t.t+'</button>').join('')+'</div>'
    +'<div class="ai-tool-panel" id="aiPanel-trans">'+AI_TRANS.map(t=>'<button class="ai-chip" onclick="aiQuick(\''+t.p.replace(/'/g,"\\'")+'\')">'+t.t+'</button>').join('')+'</div>'
  +'</div>';
}
function aiToolTab(tab,btn){
  document.querySelectorAll('.ai-tool-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  document.querySelectorAll('.ai-tool-panel').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('aiPanel-'+tab);
  if(el)el.classList.add('active');
}
function aiQuick(prompt){
  const inp=document.getElementById('aiInput');
  if(inp){inp.value=prompt;aiAutoResize(inp);aiDetectDir(inp);inp.focus();}
}
function aiAutoResize(el){
  if(!el)return;
  el.style.height='auto';
  el.style.height=Math.min(160,el.scrollHeight)+'px';
}
function aiDetectDir(el){
  if(!el)return;
  const rtl=aiIsRTL(el.value);
  el.style.direction=rtl?'rtl':'ltr';
  el.style.textAlign=rtl?'right':'left';
}
function aiInputKey(e){
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    aiSend();
  }
}
function aiRerender(){
  const area=document.getElementById('aiChatArea');
  const cur=aiCur();
  if(area){
    area.innerHTML=(cur&&cur.msgs.length)?aiChatHtml(cur):aiWelcomeHtml();
    aiScrollBottom(true);
  }
  aiRerenderList();
  aiUpdateInputState();
}
function aiRerenderList(){
  const list=document.getElementById('aiChatsList');
  if(list)list.innerHTML=aiChatsListHtml();
  const clr=document.querySelector('.ai-search .clear');
  if(clr)clr.style.display=AI.search?'flex':'none';
}
function aiRerenderChat(){
  const area=document.getElementById('aiChatArea');
  const cur=aiCur();
  if(!area)return;
  if(!cur||!cur.msgs.length){
    area.innerHTML=aiWelcomeHtml();
    return;
  }
  // اگر قبلاً welcome بود، کل را بازسازی کن
  if(area.querySelector('.ai-welcome')){
    area.innerHTML=aiChatHtml(cur);
    aiScrollBottom(true);
    return;
  }
  const msgsBox=area.querySelector('.ai-msgs');
  if(!msgsBox){
    area.innerHTML=aiChatHtml(cur);
    aiScrollBottom(true);
    return;
  }
  // فقط پیام آخر را به‌روزرسانی یا اضافه کن
  const last=cur.msgs[cur.msgs.length-1];
  let existing=document.getElementById('am-'+last.id);
  if(!existing){
    msgsBox.insertAdjacentHTML('beforeend',aiMsgHtml(last));
    aiScrollBottom();
  }else{
    // اگر پیام موجود بود (استریم)، فقط محتوایش قبلاً در onChunk آپدیت شده
  }
}
function aiScrollBottom(smooth){
  const area=document.getElementById('aiChatArea');
  if(!area)return;
  try{
    if(smooth===false||typeof area.scrollTo!=='function')area.scrollTop=area.scrollHeight;
    else area.scrollTo({top:area.scrollHeight,behavior:smooth?'smooth':'auto'});
  }catch(e){try{area.scrollTop=area.scrollHeight;}catch(x){}}
}
function aiUpdateInputState(){
  const send=document.getElementById('aiSendBtn');
  const stop=document.getElementById('aiStopBtn');
  if(!send||!stop)return;
  if(AI.streaming){
    send.style.display='none';
    stop.style.display='inline-flex';
  }else{
    send.style.display='inline-flex';
    stop.style.display='none';
  }
}
function aiToggleDrawer(){
  const side=document.getElementById('aiSide');
  const bg=document.getElementById('aiDrawerBg');
  if(!side)return;
  side.classList.toggle('open');
  if(bg)bg.classList.toggle('open');
}
function aiCloseDrawer(){
  const side=document.getElementById('aiSide');
  const bg=document.getElementById('aiDrawerBg');
  if(side)side.classList.remove('open');
  if(bg)bg.classList.remove('open');
}
function aiShowSettings(){
  const curKey=aiGetKey();
  const html='<div class="overlay" onclick="if(event.target===this)this.remove()"><div class="modal ai-modal" onclick="event.stopPropagation()">'
    +'<button class="x" onclick="this.closest(\'.overlay\').remove()">'+ic('x',14)+'</button>'
    +'<div class="m-av" style="background:linear-gradient(140deg,#2e6cb8,#d9ae3e)">'+ic('wrench',28)+'</div>'
    +'<h3>تنظیمات هوش مصنوعی</h3>'
    +'<p>کلید OpenRouter فقط روی دستگاه شما ذخیره می‌شود و به هیچ‌جا ارسال نمی‌شود جز مستقیم به OpenRouter (یا بک‌اند شما).</p>'
    +'<div class="ai-set-row"><label>کلید API (sk-or-...) — برای امنیت بهتر از بک‌اند استفاده کن</label><input id="aiKeyInp" type="password" value="'+aiEsc(curKey)+'" placeholder="sk-or-v1-..." style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--line2);background:rgba(9,18,34,.6);color:var(--tx);font-family:monospace"></div>'
    +'<div class="ai-set-row"><label>مدل</label><select id="aiModelSel" style="width:100%;padding:10px 12px;border-radius:12px;border:1px solid var(--line2);background:rgba(9,18,34,.6);color:var(--tx)"><option value="openai/gpt-4o-mini" '+(AI.model==='openai/gpt-4o-mini'?'selected':'')+'>gpt-4o-mini (سریع و ارزان)</option><option value="openai/gpt-4o" '+(AI.model==='openai/gpt-4o'?'selected':'')+'>gpt-4o (قدرتمند)</option><option value="google/gemini-2.0-flash-exp:free" '+(AI.model==='google/gemini-2.0-flash-exp:free'?'selected':'')+'>gemini-flash (رایگان)</option><option value="meta-llama/llama-3.1-8b-instruct:free" '+(AI.model==='meta-llama/llama-3.1-8b-instruct:free'?'selected':'')+'>llama-3.1 (رایگان)</option></select></div>'
    +'<div class="row" style="margin-top:16px"><button class="btn gold" onclick="aiSaveSettings()">'+ic('check',14)+'ذخیره</button><button class="btn ghost" onclick="this.closest(\'.overlay\').remove()">'+ic('x',14)+'بستن</button></div>'
    +'<div class="ai-set-hint">'+ic('shield-check',12)+'برای نسخهٔ امن: یک بک‌اند بساز که کلید را در .env نگه دارد و از /api/chat پروکسی کند. نمونه در پوشهٔ backend/ گذاشته شده.</div>'
  +'</div></div>';
  const d=document.createElement('div');
  d.innerHTML=html;
  document.body.appendChild(d.firstChild);
}
function aiSaveSettings(){
  const k=document.getElementById('aiKeyInp');
  const m=document.getElementById('aiModelSel');
  if(k)aiSetKey(k.value);
  if(m)AI.model=m.value;
  try{store.set('aiModel',AI.model);}catch(e){}
  aiSave();
  document.querySelector('.overlay')?.remove();
  toast('تنظیمات ذخیره شد','check-circle');
  const hint=document.querySelector('.ai-model');
  if(hint)hint.textContent=AI.model;
}
function aiExportChats(){
  aiLazy();
  const data=JSON.stringify(AI.chats,null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='netyar-ai-chats.json';a.click();
  URL.revokeObjectURL(url);
  toast('خروجی دانلود شد','download');
}
function aiAfterRender(){
  aiLazy();
  try{const mm=store.get('aiModel','');if(mm)AI.model=mm;}catch(e){}
  aiRerenderList();
  const inp=document.getElementById('aiInput');
  if(inp){
    aiAutoResize(inp);
    aiDetectDir(inp);
    // فوکوس در دسکتاپ
    if(window.innerWidth>920)setTimeout(()=>inp.focus(),120);
  }
  aiScrollBottom(true);
  aiUpdateInputState();
}
// برای تست‌ها
function aiTestReset(){AI.chats=[];AI.curId=null;AI.search='';aiSave();}

