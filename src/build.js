/* بیلدر کافی‌نت نت‌یار — همه‌چیز را در یک HTML خودکفا مونتاژ می‌کند v19 */
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname);

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');

/* فونت وزیرمتن به‌صورت base64 */
const fontB64 = fs.readFileSync(path.join(SRC, 'fonts', 'vazirmatn.woff2')).toString('base64');
const FONTS = `<style>
@font-face{font-family:'Vazirmatn';src:url(data:font/woff2;base64,${fontB64}) format('woff2-variations');
font-weight:100 900;font-style:normal;font-display:swap;}
</style>`;

/* دیتای سایت‌ها */
const dataFiles = ['data1.js','data2.js','data3.js','data4.js','data5.js','data6.js','data7.js','data8.js','data9.js','data10.js'];
const DATA = dataFiles.map(read).join('\n')
  + '\nconst RAW=[].concat(' + dataFiles.map((_, i) => 'SITES_P' + (i + 1)).join(',') + ');';

const CSS = read('style.css');
const ICONS = read('icons.js');
const GAMEJS = read('game.js');
const GAME2JS = read('game2.js');
const GAME3JS = read('game3.js');
const GAME4JS = read('game4.js');
const GAME5JS = read('game5.js');
const COVJS = read('covers.js');
const TYPJS = read('typing.js');
const CUSTJS = read('customers.js');
const COINJS = read('coins.js');
const AIJS = read('ai.js');
const APPJS = read('app.js');
const SHELL = read('shell.html');

let out = SHELL;
for (const [k, v] of [['{{FONTS}}', FONTS], ['{{CSS}}', CSS], ['{{DATA}}', DATA], ['{{ICONS}}', ICONS], ['{{GAMEJS}}', GAMEJS], ['{{GAME2JS}}', GAME2JS], ['{{GAME3JS}}', GAME3JS], ['{{GAME4JS}}', GAME4JS], ['{{GAME5JS}}', GAME5JS], ['{{COVJS}}', COVJS], ['{{TYPJS}}', TYPJS], ['{{CUSTJS}}', CUSTJS], ['{{COINJS}}', COINJS], ['{{AIJS}}', AIJS], ['{{APPJS}}', APPJS]]) {
  out = out.split(k).join(v);
}

const OUT = path.join(__dirname, '..', 'netyar.html');
fs.writeFileSync(OUT, out, 'utf8');
/* نسخهٔ index.html برای گیت‌هاب پیجز */
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), out, 'utf8');

/* شمارش سایت‌ها */
const names = [];
for (const f of dataFiles) {
  const c = read(f);
  names.push((c.match(/,\s*\[[\"']/g) || []).length);
}
console.log('سایت‌ها در هر فایل:', names.join(' | '));
console.log('خروجی:', OUT, '—', (fs.statSync(OUT).size / 1024).toFixed(1), 'KB');
