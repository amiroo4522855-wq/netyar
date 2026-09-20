/* ================================================================
   کاورهای سینمایی بازی‌ها — همه SVG داخلی، بدون تصویر خارجی
   ================================================================ */
const COVERS={
  'tetris':()=>'<defs><linearGradient id="cvt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1830"/><stop offset="1" stop-color="#144068"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvt)"/>'
    +'<g stroke="rgba(126,200,240,.07)" stroke-width="1"><line x1="40" y1="0" x2="40" y2="200"/><line x1="80" y1="0" x2="80" y2="200"/><line x1="120" y1="0" x2="120" y2="200"/><line x1="160" y1="0" x2="160" y2="200"/><line x1="200" y1="0" x2="200" y2="200"/><line x1="240" y1="0" x2="240" y2="200"/><line x1="280" y1="0" x2="280" y2="200"/><line x1="0" y1="50" x2="320" y2="50"/><line x1="0" y1="100" x2="320" y2="100"/><line x1="0" y1="150" x2="320" y2="150"/></g>'
    +'<g rx="4"><rect x="24" y="164" width="36" height="34" rx="5" fill="#4fc3f7"/><rect x="62" y="164" width="36" height="34" rx="5" fill="#ffd54f"/><rect x="100" y="164" width="36" height="34" rx="5" fill="#ba68c8"/><rect x="138" y="164" width="36" height="34" rx="5" fill="#4db6ac"/><rect x="176" y="164" width="36" height="34" rx="5" fill="#ef9a9a"/><rect x="214" y="164" width="36" height="34" rx="5" fill="#ffb74d"/><rect x="252" y="164" width="36" height="34" rx="5" fill="#aed581"/><rect x="62" y="128" width="36" height="34" rx="5" fill="#4db6ac"/><rect x="100" y="128" width="36" height="34" rx="5" fill="#4fc3f7"/><rect x="138" y="128" width="36" height="34" rx="5" fill="#ffd54f"/><rect x="214" y="128" width="36" height="34" rx="5" fill="#ba68c8"/><rect x="252" y="128" width="36" height="34" rx="5" fill="#ef9a9a"/><rect x="100" y="92" width="36" height="34" rx="5" fill="#aed581"/></g>'
    +'<g stroke="#7ec8f0" stroke-width="2" opacity=".4" stroke-linecap="round"><line x1="206" y1="30" x2="206" y2="48"/><line x1="244" y1="22" x2="244" y2="40"/><line x1="282" y1="34" x2="282" y2="52"/></g>'
    +'<rect x="188" y="52" width="36" height="34" rx="5" fill="#ffd54f"/><rect x="226" y="52" width="36" height="34" rx="5" fill="#ffd54f"/><rect x="264" y="52" width="36" height="34" rx="5" fill="#ffd54f"/><rect x="226" y="16" width="36" height="34" rx="5" fill="#f5b83d"/>'
    +'<rect x="194" y="58" width="10" height="6" rx="3" fill="rgba(255,255,255,.35)"/><rect x="232" y="22" width="10" height="6" rx="3" fill="rgba(255,255,255,.35)"/>'
    +'<text x="298" y="34" font-family="Vazirmatn" font-size="17" font-weight="800" fill="#f0c75e" text-anchor="middle">۳</text>',
  '2048':()=>'<defs><linearGradient id="cv4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#191d33"/><stop offset="1" stop-color="#3d3113"/></linearGradient><linearGradient id="cv4g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#d9a72e"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cv4)"/>'
    +'<g opacity=".5"><rect x="14" y="22" width="26" height="26" rx="6" fill="#2c365e"/><rect x="284" y="150" width="26" height="26" rx="6" fill="#2c365e"/><rect x="288" y="24" width="20" height="20" rx="5" fill="#2c365e"/><rect x="12" y="152" width="20" height="20" rx="5" fill="#2c365e"/></g>'
    +'<rect x="84" y="24" width="72" height="72" rx="12" fill="#5f9ecf"/><rect x="164" y="24" width="72" height="72" rx="12" fill="#4a8fe2"/><rect x="84" y="104" width="72" height="72" rx="12" fill="#8b7bd8"/><rect x="164" y="104" width="72" height="72" rx="12" fill="url(#cv4g)"/>'
    +'<text x="120" y="70" font-family="Vazirmatn" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">۲</text>'
    +'<text x="200" y="70" font-family="Vazirmatn" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">۴</text>'
    +'<text x="120" y="150" font-family="Vazirmatn" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">۸</text>'
    +'<text x="200" y="150" font-family="Vazirmatn" font-size="24" font-weight="900" fill="#4a3608" text-anchor="middle">۲۰۴۸</text>'
    +'<rect x="164" y="104" width="72" height="72" rx="12" fill="none" stroke="rgba(255,224,138,.8)" stroke-width="2"/>',
  'snake':()=>'<defs><linearGradient id="cvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2410"/><stop offset="1" stop-color="#1e4019"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvs)"/>'
    +'<g fill="rgba(255,255,255,.035)"><rect x="50" y="50" width="50" height="50"/><rect x="150" y="0" width="50" height="50"/><rect x="250" y="100" width="50" height="50"/><rect x="0" y="100" width="50" height="50"/><rect x="200" y="150" width="50" height="50"/></g>'
    +'<path d="M30 150 C 70 90, 120 175, 170 125 S 250 70, 278 96" fill="none" stroke="#5da84e" stroke-width="20" stroke-linecap="round"/>'
    +'<path d="M30 150 C 70 90, 120 175, 170 125 S 250 70, 278 96" fill="none" stroke="#7ec86f" stroke-width="13" stroke-linecap="round"/>'
    +'<circle cx="278" cy="96" r="12.5" fill="#8ed67c"/><circle cx="282" cy="92" r="4.6" fill="#fff"/><circle cx="283.4" cy="92.6" r="2.2" fill="#14260f"/><circle cx="273" cy="89.5" r="3.6" fill="#fff"/><circle cx="273.8" cy="89.9" r="1.8" fill="#14260f"/>'
    +'<path d="M288 90 q 9 -4 13 2" stroke="#d95757" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    +'<g transform="translate(58,38)"><path d="M0 6 h26 v16 a13 13 0 0 1 -26 0 Z" fill="#e8b04b"/><path d="M26 10 h7 a8 8 0 0 1 0 14 h-7" fill="none" stroke="#e8b04b" stroke-width="4"/><path d="M7 0 q 3 -7 0 -12 M19 0 q 3 -7 0 -12" stroke="rgba(255,224,138,.75)" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>',
  'ttt':()=>'<defs><linearGradient id="cvt3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1a10"/><stop offset="1" stop-color="#180d06"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvt3)"/>'
    +'<g stroke="#c9973f" stroke-width="5" stroke-linecap="round" opacity=".95"><line x1="126" y1="34" x2="122" y2="166"/><line x1="196" y1="36" x2="200" y2="164"/><line x1="62" y1="76" x2="258" y2="72"/><line x1="60" y1="130" x2="260" y2="134"/></g>'
    +'<g stroke="#6ea8f0" stroke-width="8" stroke-linecap="round"><line x1="80" y1="46" x2="106" y2="62"/><line x1="106" y1="46" x2="80" y2="62"/><line x1="216" y1="144" x2="242" y2="160"/><line x1="242" y1="144" x2="216" y2="160"/></g>'
    +'<g stroke="#e08b85" stroke-width="8" fill="none" stroke-linecap="round"><circle cx="160" cy="100" r="14"/><circle cx="228" cy="52" r="14"/></g>'
    +'<line x1="88" y1="58" x2="232" y2="152" stroke="#f0c75e" stroke-width="6" stroke-linecap="round" opacity=".9"/>'
    +'<g fill="#ffe9a8"><circle cx="288" cy="36" r="2.4"/><circle cx="36" cy="158" r="2"/><circle cx="302" cy="120" r="1.8"/></g>',
  'memory':()=>'<defs><linearGradient id="cvm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#221333"/><stop offset="1" stop-color="#3d2058"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvm)"/>'
    +'<g transform="rotate(-14 130 105)"><rect x="98" y="58" width="64" height="90" rx="11" fill="#101d38" stroke="#3a5f9e" stroke-width="2"/><path d="M130 116 c-11 -9 -18 -16 -18 -25 a9 9 0 0 1 18 -4 a9 9 0 0 1 18 4 c0 9 -7 16 -18 25 Z" fill="#e06a75"/></g>'
    +'<g transform="rotate(9 190 100)"><rect x="158" y="55" width="64" height="90" rx="11" fill="#182a4d" stroke="#4d78c4" stroke-width="2.5"/><path d="M190 78 l6.5 13.5 15 2 -11 10.5 2.7 15 -13.2 -7.3 -13.2 7.3 2.7 -15 -11 -10.5 15 -2 Z" fill="#f0c75e"/></g>'
    +'<g transform="rotate(22 250 108)"><rect x="218" y="62" width="64" height="90" rx="11" fill="#101d38" stroke="#3a5f9e" stroke-width="2"/><path d="M252 84 l4 10 11 1.4 -8 7.6 2 11 -9 -5.4 -9 5.4 2 -11 -8 -7.6 11 -1.4 Z" fill="#7ec8f0"/></g>'
    +'<g fill="rgba(240,199,94,.8)"><circle cx="44" cy="40" r="2.6"/><circle cx="284" cy="34" r="2.2"/><circle cx="52" cy="164" r="2"/></g>',
  'rps':()=>'<defs><linearGradient id="cvr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#33141c"/><stop offset="1" stop-color="#1f0b10"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvr)"/>'
    +'<circle cx="60" cy="104" r="40" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)" stroke-width="2"/><path d="M42 108 l8 -18 12 -4 14 8 4 14 -10 10 -20 2 Z" fill="#9aa5b8"/><path d="M50 96 l6 -6" stroke="#c3ccd9" stroke-width="3" stroke-linecap="round"/>'
    +'<circle cx="160" cy="96" r="40" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)" stroke-width="2"/><g transform="rotate(-7 160 96)"><rect x="140" y="70" width="42" height="52" rx="4" fill="#eef2f8"/><path d="M140 70 h26 l16 14 v38 h-42 Z" fill="#fff"/><path d="M166 70 l16 14 h-16 Z" fill="#c8d4e8"/><g stroke="#aab8cc" stroke-width="2.6" stroke-linecap="round"><line x1="148" y1="94" x2="174" y2="94"/><line x1="148" y1="104" x2="174" y2="104"/><line x1="148" y1="114" x2="166" y2="114"/></g></g>'
    +'<circle cx="260" cy="104" r="40" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)" stroke-width="2"/><g stroke="#c3ccd9" stroke-width="6" stroke-linecap="round"><line x1="242" y1="76" x2="272" y2="122"/><line x1="278" y1="76" x2="248" y2="122"/></g><circle cx="244" cy="128" r="8" fill="none" stroke="#e06a75" stroke-width="5"/><circle cx="276" cy="128" r="8" fill="none" stroke="#e06a75" stroke-width="5"/><circle cx="260" cy="98" r="4" fill="#eef2f8"/>'
    +'<text x="110" y="102" font-family="Vazirmatn" font-size="19" font-weight="900" fill="#f0c75e" text-anchor="middle">؟</text>'
    +'<text x="210" y="98" font-family="Vazirmatn" font-size="19" font-weight="900" fill="#f0c75e" text-anchor="middle">؟</text>',
  'react':()=>'<defs><linearGradient id="cvr2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1d3d"/><stop offset="1" stop-color="#1c3a6e"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvr2)"/>'
    +'<g stroke="rgba(126,200,240,.3)" stroke-width="3" stroke-linecap="round"><line x1="18" y1="70" x2="66" y2="70"/><line x1="30" y1="96" x2="60" y2="96"/><line x1="18" y1="122" x2="66" y2="122"/></g>'
    +'<circle cx="172" cy="106" r="58" fill="rgba(110,168,240,.07)" stroke="#6ea8f0" stroke-width="6"/>'
    +'<g stroke="#6ea8f0" stroke-width="3.4" stroke-linecap="round" opacity=".85"><line x1="172" y1="52" x2="172" y2="60"/><line x1="172" y1="152" x2="172" y2="160"/><line x1="118" y1="106" x2="126" y2="106"/><line x1="218" y1="106" x2="226" y2="106"/><line x1="134" y1="68" x2="140" y2="74"/><line x1="204" y1="138" x2="210" y2="144"/><line x1="210" y1="68" x2="204" y2="74"/><line x1="140" y1="138" x2="134" y2="144"/></g>'
    +'<line x1="172" y1="106" x2="200" y2="74" stroke="#f0c75e" stroke-width="5" stroke-linecap="round"/><circle cx="172" cy="106" r="6.5" fill="#f0c75e"/>'
    +'<rect x="164" y="38" width="16" height="9" rx="3" fill="#6ea8f0"/>'
    +'<g transform="translate(236,132)"><circle r="24" fill="rgba(240,199,94,.14)" stroke="#f0c75e" stroke-width="2.5"/><path d="M4 -14 l-10 16 h8 l-4 14 12 -18 h-8 Z" fill="#f0c75e"/></g>'
    +'<text x="172" y="188" font-family="Vazirmatn" font-size="15" font-weight="800" fill="#7ec8f0" text-anchor="middle">۲۱۸ میلی‌ثانیه</text>',
  'coin':()=>'<defs><radialGradient id="cvci" cx=".38" cy=".3" r=".9"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".45" stop-color="#f0c75e"/><stop offset=".8" stop-color="#c9992e"/><stop offset="1" stop-color="#a87d20"/></radialGradient><linearGradient id="cvcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#241a06"/><stop offset="1" stop-color="#3d2c0a"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvcb)"/>'
    +'<circle cx="238" cy="132" r="34" fill="#8a6a1c" opacity=".55"/><circle cx="238" cy="132" r="26" fill="none" stroke="rgba(255,224,138,.4)" stroke-width="2" stroke-dasharray="4 4"/>'
    +'<circle cx="146" cy="96" r="62" fill="url(#cvci)"/><circle cx="146" cy="96" r="62" fill="none" stroke="rgba(122,92,20,.5)" stroke-width="2"/><circle cx="146" cy="96" r="50" fill="none" stroke="rgba(122,92,20,.35)" stroke-width="2.5" stroke-dasharray="6 5"/>'
    +'<path d="M146 62 l8.5 17.5 19 2.6 -13.8 13.4 3.3 19 -17 -9.5 -17 9.5 3.3 -19 -13.8 -13.4 19 -2.6 Z" fill="#7a5c14"/>'
    +'<ellipse cx="124" cy="66" rx="16" ry="9" fill="rgba(255,255,255,.4)" transform="rotate(-28 124 66)"/>'
    +'<text x="252" y="52" font-family="Vazirmatn" font-size="14" font-weight="800" fill="#ffe08a" text-anchor="middle">شیر یا خط؟</text>',
  'dice':()=>'<defs><linearGradient id="cvd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#311726"/><stop offset="1" stop-color="#4a2038"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvd)"/>'
    +'<g transform="rotate(-11 118 100)"><rect x="80" y="66" width="72" height="72" rx="15" fill="#f4f7ff" stroke="#d9e2f2" stroke-width="2"/><g fill="#1c2b52"><circle cx="100" cy="86" r="6.5"/><circle cx="132" cy="86" r="6.5"/><circle cx="116" cy="102" r="6.5"/><circle cx="100" cy="118" r="6.5"/><circle cx="132" cy="118" r="6.5"/></g></g>'
    +'<g transform="rotate(12 208 106)"><rect x="172" y="70" width="72" height="72" rx="15" fill="#f4f7ff" stroke="#d9e2f2" stroke-width="2"/><g fill="#c46a8e"><circle cx="190" cy="88" r="6.5"/><circle cx="226" cy="88" r="6.5"/><circle cx="190" cy="106" r="6.5"/><circle cx="226" cy="106" r="6.5"/><circle cx="190" cy="124" r="6.5"/><circle cx="226" cy="124" r="6.5"/></g></g>'
    +'<g stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none" stroke-linecap="round"><path d="M36 60 a 26 26 0 0 1 22 -12"/><path d="M282 132 a 26 26 0 0 1 -22 12"/></g>'
    +'<g fill="#ffe08a"><circle cx="288" cy="46" r="2.6"/><circle cx="30" cy="152" r="2.2"/></g>',
  'puzzle':()=>'<defs><linearGradient id="cvp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d2b27"/><stop offset="1" stop-color="#164640"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvp)"/>'
    +'<g><rect x="92" y="44" width="64" height="64" rx="8" fill="#2e8f84"/><circle cx="156" cy="76" r="12" fill="#2e8f84"/><rect x="164" y="44" width="64" height="64" rx="8" fill="#3e9e93"/><circle cx="196" cy="44" r="12" fill="#3e9e93"/><circle cx="228" cy="108" r="12" fill="#3e9e93"/><rect x="92" y="116" width="64" height="64" rx="8" fill="#37a89c"/><circle cx="156" cy="148" r="12" fill="#37a89c"/><rect x="164" y="116" width="64" height="64" rx="8" fill="#2a837a"/></g>'
    +'<text x="124" y="84" font-family="Vazirmatn" font-size="21" font-weight="900" fill="rgba(255,255,255,.85)" text-anchor="middle">۱۵</text>'
    +'<text x="196" y="156" font-family="Vazirmatn" font-size="21" font-weight="900" fill="rgba(255,255,255,.85)" text-anchor="middle">۷</text>'
    +'<g transform="rotate(9 262 66)"><rect x="230" y="34" width="64" height="64" rx="8" fill="#45b3a6" stroke="rgba(255,255,255,.5)" stroke-width="2"/><text x="262" y="74" font-family="Vazirmatn" font-size="21" font-weight="900" fill="#0d2b27" text-anchor="middle">۳</text></g>'
    +'<rect x="164" y="44" width="64" height="64" rx="8" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.6" stroke-dasharray="5 4"/>',
  'word':()=>'<defs><linearGradient id="cvw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#191539"/><stop offset="1" stop-color="#2c2454"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvw)"/>'
    +'<g>'
    +['ق:56:36', 'ه:96:36', 'و:136:36', 'ه:176:36', 'ب:216:36', 'ی:256:36', 'ا:36:76', 'ف:76:76', 'ت:116:76', 'ث:156:76', 'ج:196:76', 'چ:236:76', 'خ:276:76', 'د:56:116', 'ذ:96:116', 'ر:136:116', 'ز:176:116', 'ژ:216:116', 'س:256:116', 'ش:296:116', 'ص:36:156', 'ض:76:156', 'ط:116:156', 'ظ:156:156', 'ع:196:156', 'غ:236:156', 'ف:276:156'].map(s=>{const[a,b,c]=s.split(':');return '<rect x="'+(b-19)+'" y="'+(c-17)+'" width="38" height="36" rx="8" fill="rgba(148,180,224,.08)"/><text x="'+b+'" y="'+(+c+7)+'" font-family="Vazirmatn" font-size="19" font-weight="800" fill="#aab8dd" text-anchor="middle">'+a+'</text>';}).join('')
    +'</g>'
    +'<g><rect x="37" y="19" width="38" height="36" rx="8" fill="rgba(240,199,94,.95)"/><rect x="77" y="19" width="38" height="36" rx="8" fill="rgba(240,199,94,.95)"/><rect x="117" y="19" width="38" height="36" rx="8" fill="rgba(240,199,94,.95)"/><rect x="157" y="19" width="38" height="36" rx="8" fill="rgba(240,199,94,.95)"/><text x="56" y="45" font-family="Vazirmatn" font-size="20" font-weight="900" fill="#241a06" text-anchor="middle">ق</text><text x="96" y="45" font-family="Vazirmatn" font-size="20" font-weight="900" fill="#241a06" text-anchor="middle">ه</text><text x="136" y="45" font-family="Vazirmatn" font-size="20" font-weight="900" fill="#241a06" text-anchor="middle">و</text><text x="176" y="45" font-family="Vazirmatn" font-size="20" font-weight="900" fill="#241a06" text-anchor="middle">ه</text></g>',
  'chess':()=>'<defs><linearGradient id="cvc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171106"/><stop offset="1" stop-color="#33270d"/></linearGradient></defs>'
    +'<rect width="320" height="200" fill="url(#cvc)"/>'
    +'<text x="118" y="150" font-family="serif" font-size="110" fill="rgba(217,174,62,.28)" text-anchor="middle">♛</text>'
    +'<text x="178" y="158" font-family="serif" font-size="118" fill="#f0c75e" text-anchor="middle">♞</text>'
    +'<text x="236" y="146" font-family="serif" font-size="74" fill="rgba(248,251,255,.75)" text-anchor="middle">♟</text>'
    +'<g transform="translate(28,150)"><rect x="0" y="0" width="60" height="16" fill="#46598a"/><rect x="15" y="-16" width="30" height="16" fill="#c8d4e8"/><rect x="0" y="-16" width="15" height="16" fill="#c8d4e8"/><rect x="30" y="-16" width="15" height="16" fill="#c8d4e8"/><rect x="45" y="-16" width="15" height="16" fill="#c8d4e8"/></g>'
    +'<g fill="#ffe9a8"><circle cx="290" cy="30" r="2.6"/><circle cx="36" cy="44" r="2.2"/><circle cx="300" cy="160" r="2"/></g>',
};
function gcov(k){const f=COVERS[k];return f?'<svg class="gcov-svg" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+f()+'</svg>':'';}
