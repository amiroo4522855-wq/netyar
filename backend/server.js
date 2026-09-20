/**
 * بک‌اند امن نت‌یار — پروکسی OpenRouter
 * کلید فقط سرورساید، با ریت‌لیمیت، تایم‌اوت، ولیدیشن و استریم واقعی
 * اجرا: npm install && npm start
 * ENV: OPENROUTER_API_KEY, PORT, DEFAULT_MODEL, ALLOWED_ORIGIN
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const KEY = process.env.OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'openai/gpt-4o-mini';
const ALLOWED = process.env.ALLOWED_ORIGIN || '*';

if (!KEY) {
  console.warn('⚠️  OPENROUTER_API_KEY تنظیم نشده! در .env بگذار.');
}

app.use(cors({
  origin: ALLOWED === '*' ? true : ALLOWED.split(',').map(s=>s.trim()),
  credentials: false
}));
app.use(express.json({limit:'64kb'}));

// ریت‌لیمیت ساده: 20 درخواست در دقیقه برای هر IP
const buckets = new Map();
function rateLimit(req,res,next){
  const ip = req.ip || req.headers['x-forwarded-for'] || 'local';
  const now = Date.now();
  const rec = buckets.get(ip) || {c:0,t:now};
  if(now-rec.t>60000){rec.c=0;rec.t=now;}
  rec.c++;
  buckets.set(ip,rec);
  if(rec.c>20){
    return res.status(429).json({error:'تعداد درخواست‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید.'});
  }
  next();
}
app.use('/api/', rateLimit);

// هلث‌چک
app.get('/api/health', (req,res)=>{
  res.json({ok:true, hasKey:!!KEY, model:DEFAULT_MODEL, time:new Date().toISOString()});
});

// چت — استریم SSE
app.post('/api/chat', async (req,res)=>{
  if(!KEY) return res.status(500).json({error:'کلید سرور تنظیم نشده'});
  const {messages, model, stream} = req.body||{};
  if(!Array.isArray(messages)||!messages.length){
    return res.status(400).json({error:'messages باید آرایه‌ای از پیام‌ها باشد'});
  }
  // ولیدیشن ساده
  const clean = messages.slice(-20).map(m=>{
    if(!m||typeof m.content!=='string')return null;
    const role = (m.role==='user'||m.role==='assistant'||m.role==='system')?m.role:'user';
    let content = String(m.content).slice(0,8000);
    return {role, content};
  }).filter(Boolean);
  if(!clean.length) return res.status(400).json({error:'پیام معتبر نیست'});

  const useModel = (typeof model==='string'&&model.length<80)?model:DEFAULT_MODEL;
  const wantStream = stream!==false;

  try{
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 30000);
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+KEY,
        'Content-Type':'application/json',
        'HTTP-Referer': process.env.FRONT_URL||'http://localhost:3000',
        'X-Title':'NetYar AI'
      },
      body: JSON.stringify({
        model: useModel,
        messages: clean,
        stream: wantStream,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if(!orRes.ok){
      const txt = await orRes.text().catch(()=> '');
      console.error('OpenRouter error', orRes.status, txt.slice(0,500));
      if(orRes.status===429) return res.status(429).json({error:'تعداد درخواست‌ها زیاد است. لطفاً کمی بعد دوباره تلاش کنید.'});
      if(orRes.status===401||orRes.status===403) return res.status(502).json({error:'کلید OpenRouter نامعتبر است'});
      return res.status(502).json({error:'اتصال به هوش مصنوعی برقرار نشد. لطفاً دوباره تلاش کنید.'});
    }

    if(!wantStream){
      const j = await orRes.json();
      const content = j.choices?.[0]?.message?.content||'';
      return res.json({content});
    }

    // استریم SSE به کلاینت
    res.writeHead(200,{
      'Content-Type':'text/event-stream; charset=utf-8',
      'Cache-Control':'no-cache, no-transform',
      'Connection':'keep-alive',
      'X-Accel-Buffering':'no'
    });

    const reader = orRes.body.getReader();
    const dec = new TextDecoder();
    let buf='';
    req.on('close',()=>{ try{reader.cancel();}catch(e){} });

    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      // مستقیم پاس بده تا فرانت خودش parse کنه (سازگار با فرمت OpenRouter)
      // همچنین برای سادگی، همان chunk را بفرست
      res.write(dec.decode(value,{stream:true}));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  }catch(e){
    if(e.name==='AbortError'){
      return res.status(504).json({error:'زمان پاسخ تمام شد. دوباره تلاش کنید.'});
    }
    console.error('proxy fail', e);
    if(!res.headersSent) res.status(502).json({error:'اتصال به هوش مصنوعی برقرار نشد. لطفاً دوباره تلاش کنید.'});
    else res.end();
  }
});

// سرو استاتیک فرانت اگر بخواهی (اختیاری)
app.get('/', (req,res)=> res.send('NetYar AI Backend — /api/health , POST /api/chat'));

app.listen(PORT, '0.0.0.0', ()=>{
  console.log(`✅ NetYar AI Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`   Model: ${DEFAULT_MODEL} | HasKey: ${!!KEY}`);
});
