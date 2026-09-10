import { chromium } from '@playwright/test';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = 'materials/ru';
const logo = '../../public/logo-horizontal.svg';

const competitions = [
  ['01', 'Startup Battle', '8 стартапов на одной сцене. Покажи свою идею.', '↗'],
  ['02', 'Startup Women', 'Сцена для девушек, которые запускают свои идеи.', '✳'],
  ['03', 'NIS Edutech Hackathon', 'Реальные задачи и технологические решения для обучения.', '⌘'],
  ['04', 'FIFA Tournament for 7–8 Grades', 'Турнир для учеников 7–8 классов.', '⊕'],
];

const aptaEvents = [
  ['12.09', 'Открытие Digital Apta', 'Знакомство с участниками и старт недели практики.', '01'],
  ['12–18.09', 'Акселерация стартапов', 'Менторство, бизнес-модель, презентация и подготовка к Startup Battle.', '02'],
  ['14.09', 'Startup & Pitching', 'Стартап-мышление, сильная идея, структура питча и уверенная презентация проекта.', '03'],
  ['15.09', 'Vibe Coding', 'Кодинг с ИИ, быстрый прототип и путь от идеи к MVP для команд хакатона.', '04'],
  ['15.09', 'Коммерциализация стартапа', 'Проблема клиента, ценность продукта, монетизация и первые клиенты.', '05'],
  ['16.09', 'Artisan 3D Modeling', 'Практический мастер-класс по 3D-моделированию: от формы и идеи до цифрового объекта.', '06'],
  ['17.09', 'Объявление финалистов', 'Команды и участники четырёх соревнований будут объявлены онлайн.', '07'],
  ['17.09', 'Mock Day: Hackathon & Startup Battle', 'Тестовый день для команд хакатона и Startup Battle: прогон решений, питчей и обратная связь.', '08'],
];

const speakerSlides = [
  ['01', 'Спикер 01', 'Имя и тема выступления появятся в следующих анонсах.'],
  ['02', 'Спикер 02', 'Новый взгляд на технологии, образование и идеи.'],
  ['03', 'Спикер 03', 'Личная история, опыт и честный разговор со сценой.'],
  ['04', 'Панельная дискуссия', 'Три участника, вопросы из зала и разговор о будущем.'],
];

const css = `
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#070908;color:#f0f2eb;font-family:Arial,Helvetica,sans-serif}
.post{width:1080px;height:1350px;position:relative;overflow:hidden;background:#070908;padding:58px;break-after:page;page-break-after:always}
.post:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#91ab6512 1px,transparent 1px),linear-gradient(90deg,#91ab6512 1px,transparent 1px);background-size:64px 64px;background-position:24px 0}
.post:after{content:"";position:absolute;left:58px;right:58px;top:28px;bottom:42px;border-top:1px solid #2b3429;border-bottom:1px solid #2b3429;pointer-events:none}
.brand{position:absolute;left:58px;top:58px;width:176px;z-index:10}
.topline{position:absolute;right:58px;top:68px;color:#9ca692;font:13px/1.5 monospace;letter-spacing:4px;text-align:right;text-transform:uppercase;z-index:10}
.kicker{position:relative;margin-top:118px;color:#9ba594;font:14px monospace;letter-spacing:4px;text-transform:uppercase;z-index:8}
.kicker b{color:#bcf75a;margin-right:13px}
h1{position:relative;margin:42px 0 0;font-size:86px;line-height:.93;letter-spacing:-5px;font-weight:800;max-width:930px;z-index:8}
h1.long-title{font-size:64px;line-height:1;letter-spacing:-2px;max-width:920px}
.huge h1{font-size:126px;letter-spacing:-8px}.xl h1{font-size:104px}
p{position:relative;color:#a9b0a6;font-size:27px;line-height:1.42;margin:24px 0 0;max-width:820px;z-index:8}.lime{color:#bcf75a}
.button{position:absolute;left:58px;bottom:148px;width:340px;height:74px;border:1px solid #43503f;display:flex;align-items:center;justify-content:space-between;padding:0 28px;color:#f0f2eb;font-size:15px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;z-index:9}
.button.fill{background:#bcf75a;color:#10180b;border-color:#bcf75a}
.footer{position:absolute;left:58px;right:58px;bottom:70px;display:flex;justify-content:space-between;color:#8f9b8d;font:12px monospace;letter-spacing:3px;text-transform:uppercase;z-index:8}
.hero-logo{position:absolute;left:50%;top:568px;width:430px;height:365px;margin-left:-215px;display:grid;place-items:center;background:radial-gradient(ellipse,#bcf75a20,transparent 70%);z-index:4}
.hero-logo svg{width:430px;height:365px;filter:drop-shadow(0 0 42px #bcf75a24)}
.hero-center{position:absolute;left:90px;right:90px;top:145px;text-align:center;z-index:5}
.hero-center h1{font-size:88px;line-height:.88;letter-spacing:-6px;margin:42px auto 0;max-width:850px}
.hero-center p{margin-left:auto;margin-right:auto}.hero-tag{font-size:28px;letter-spacing:14px;color:#bcf75a;margin-top:26px}
.people{position:absolute;left:0;right:0;bottom:150px;height:560px;z-index:2;pointer-events:none}
.person{position:absolute;bottom:0;width:190px;height:500px;opacity:.9;filter:drop-shadow(0 0 42px #bcf75a18)}
.person:before{content:"";position:absolute;left:50%;top:0;width:92px;height:104px;margin-left:-46px;border-radius:48%;background:linear-gradient(145deg,#dce7d2,#4d6244 55%,#111a10)}
.person:after{content:"";position:absolute;left:50%;top:116px;width:170px;height:300px;margin-left:-85px;border-radius:56% 56% 22% 22%;background:linear-gradient(145deg,#b3c4a2,#263520 62%,#0b1009)}
.person .leg{position:absolute;bottom:0;width:56px;height:190px;background:linear-gradient(180deg,#445339,#11170f);border-radius:26px 26px 8px 8px}
.person .leg.a{left:38px}.person .leg.b{right:38px}
.person.left-one{left:8px;transform:scale(1.08)}
.person.left-two{left:142px;bottom:28px;transform:scale(.82);opacity:.52}
.person.right-one{right:8px;transform:scale(1.08)}
.person.right-two{right:142px;bottom:28px;transform:scale(.82);opacity:.52}
.hero-card{position:absolute;left:92px;right:92px;bottom:110px;border-top:1px solid #34422f;padding-top:30px;display:flex;justify-content:space-between;align-items:flex-end;z-index:6}
.hero-card .date{font-size:76px;line-height:.9;letter-spacing:-5px;font-weight:800}.hero-card .date span{color:#8f9b82}.hero-card small{display:block;margin-top:18px;color:#9ba594;font:14px monospace;letter-spacing:4px;text-transform:uppercase}.hero-card .note{max-width:360px;text-align:right;color:#c4ccc0;font:15px monospace;letter-spacing:3px;text-transform:uppercase}
.ticker{position:absolute;left:0;right:0;bottom:0;height:64px;background:#bcf75a;color:#0b1208;display:flex;align-items:center;white-space:nowrap;font:18px monospace;font-weight:800;letter-spacing:2px;text-transform:uppercase}.ticker span{padding-left:18px}
.cards{position:relative;margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:18px;z-index:7}.card{height:305px;border:1px solid #354332;background:#10150f;padding:28px;display:flex;flex-direction:column;justify-content:space-between}.card.active{border-color:#bcf75a;box-shadow:0 0 0 1px #bcf75a inset}.card .icon{color:#bcf75a;font-size:66px;line-height:1}.card h2{font-size:32px;line-height:1.03;margin:0;letter-spacing:-1.8px;text-transform:uppercase}.card h2.long{font-size:27px;line-height:1.06}.card p{font-size:16px;line-height:1.45;margin:10px 0 0}
.bar{position:absolute;left:58px;right:58px;bottom:180px;height:94px;border:1px solid #2d392b;display:flex;align-items:center;gap:28px;padding:0 32px;color:#f0f2eb;font:19px monospace;letter-spacing:2px;text-transform:uppercase}.bar .lock{color:#bcf75a;font-size:31px}
.prize-line{position:absolute;left:58px;right:58px;bottom:108px;height:54px;border:1px solid #bcf75a;display:flex;align-items:center;justify-content:space-between;padding:0 24px;color:#f0f2eb;font:14px monospace;letter-spacing:3px;text-transform:uppercase;z-index:8}.prize-line b{color:#bcf75a;font-size:20px;letter-spacing:2px}
.event-card{position:relative;margin-top:62px;height:610px;border:1px solid #354332;background:#10150f;padding:42px;display:flex;flex-direction:column;justify-content:space-between;z-index:7}.event-card>*{position:relative;z-index:2}.event-card .day{font-size:108px;letter-spacing:-7px;font-weight:800;color:#bcf75a}.event-card h2{font-size:58px;line-height:1.02;letter-spacing:-3px;margin:0;text-transform:uppercase}.event-card p{font-size:25px}.event-card .num{position:absolute;right:34px;bottom:20px;font-size:185px;font-weight:800;color:#bcf75a0d;letter-spacing:-12px;z-index:0}
.speaker-grid{position:relative;margin-top:44px;display:grid;grid-template-columns:1fr;gap:18px}.speaker{height:210px;border:1px solid #354332;background:linear-gradient(180deg,#111a11,#090d0b);display:grid;grid-template-columns:220px 1fr 80px;align-items:center;padding:24px}.avatar{width:155px;height:155px;border-radius:50%;background:radial-gradient(circle at 45% 35%,#9fb18f,#172015 68%);box-shadow:0 0 60px #bcf75a18;justify-self:center}.speaker h2{font-size:42px;letter-spacing:-2px;margin:0}.speaker p{font-size:20px;margin:12px 0 0}.speaker .n{font-size:70px;color:#bcf75a25;font-weight:800}
.pass{position:absolute;right:74px;bottom:170px;width:470px;height:585px;background:#c3dea7;color:#12200e;border-radius:4px;transform:rotate(-3deg);padding:42px;box-shadow:0 22px 80px #0008}.pass .pass-top{display:flex;justify-content:space-between;font-size:22px;font-weight:800}.pass h2{font-size:54px;line-height:.95;letter-spacing:-3px;margin:120px 0 0}.qr{position:absolute;left:42px;right:42px;bottom:42px;height:150px;background:#f7f7f2;display:grid;place-items:center;color:#111;font:28px monospace}
.coin{position:absolute;right:86px;bottom:180px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle at 35% 32%,#d4ff8b,#628d2c 66%,#243b15);box-shadow:12px 18px 0 #2b4817,0 0 70px #bcf75a22;display:grid;place-items:center;color:#dfff9d;font-size:116px}.outline{position:absolute;inset:18px;border:7px double #c9ff86;border-radius:50%;opacity:.7}
.plus-gift{position:absolute;right:76px;bottom:185px;width:390px;height:330px;border:1px solid #bcf75a;background:linear-gradient(145deg,#bcf75a,#7fb52d 58%,#1d2c11);box-shadow:18px 22px 0 #17240f,0 0 70px #bcf75a22;transform:rotate(-4deg);padding:34px;color:#111b0c}
.plus-gift:before{content:"";position:absolute;left:30px;right:30px;top:104px;height:2px;background:#e3ffae;opacity:.55}
.plus-gift:after{content:"";position:absolute;top:-32px;left:50%;width:115px;height:68px;margin-left:-58px;border:14px solid #cfff75;border-bottom:0;border-radius:60px 60px 0 0}
.plus-gift small{position:relative;z-index:2;display:block;font:15px monospace;letter-spacing:3px;text-transform:uppercase}.plus-gift b{position:relative;z-index:2;display:block;margin-top:42px;font-size:74px;line-height:.86;letter-spacing:-4px}.plus-gift span{position:absolute;right:30px;bottom:28px;font-size:64px;z-index:2}
.mini-list{position:relative;margin-top:46px;display:grid;gap:16px}.mini-list div{border-top:1px solid #31402e;padding:18px 0;display:flex;justify-content:space-between;color:#dfe6dc;font:19px monospace;letter-spacing:2px;text-transform:uppercase}.mini-list b{color:#bcf75a}
`;

function frame(id, group, number, inner) {
  return [group, number, `<section id="${id}" class="post ${inner.className || ''}">${inner.html}</section>`];
}

const siteLogoArt = `<svg viewBox="0 0 640 550" fill="none" aria-hidden="true"><defs><linearGradient id="post-beam" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#36540a"/><stop offset=".45" stop-color="#c1ff53"/><stop offset=".7" stop-color="#98d52d"/><stop offset="1" stop-color="#edffc8"/></linearGradient><linearGradient id="post-side" x1="0" x2="1"><stop stop-color="#263711"/><stop offset="1" stop-color="#749d35"/></linearGradient><pattern id="post-lines" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0V5" stroke="#071004" stroke-width="1.4" opacity=".35"/></pattern><filter id="post-glow"><feGaussianBlur stdDeviation="28"/></filter></defs><ellipse cx="330" cy="430" rx="205" ry="32" fill="#a9ff32" opacity=".1" filter="url(#post-glow)"/><g transform="translate(20 2)"><path d="M74 299 209 168 301 168 164 302 164 400 74 400Z" fill="url(#post-side)"/><path d="M74 299 209 168 257 195 122 328 122 430 74 400Z" fill="url(#post-beam)"/><path d="M122 328 257 195 349 195 211 329 211 429 122 430Z" fill="url(#post-beam)"/><path d="M122 328 257 195 349 195 211 329 211 429 122 430Z" fill="url(#post-lines)"/><path d="M303 145 393 145 528 277 528 377 439 377 439 304 303 171Z" fill="url(#post-side)"/><path d="M303 145 350 117 443 117 576 249 528 277 393 145Z" fill="url(#post-beam)"/><path d="M393 145 443 117 576 249 576 350 528 377 528 277Z" fill="url(#post-beam)"/><path d="M393 145 443 117 576 249 576 350 528 377 528 277Z" fill="url(#post-lines)"/><path d="M235 287 326 198 373 225 283 314 283 414 235 388Z" fill="url(#post-side)"/><path d="M283 314 373 225 464 225 372 315 372 414 283 414Z" fill="url(#post-beam)"/><path d="M283 314 373 225 464 225 372 315 372 414 283 414Z" fill="url(#post-lines)"/><path d="m326 198 91 0 47 27-91 0Z" fill="#ceff82"/><path d="m74 299 135-131h92M303 145h90l135 132M283 314l90-89h91" fill="none" stroke="#e4ffb2" stroke-width="1"/></g><g stroke="#748462" stroke-width=".6" fill="none" opacity=".7"><path d="M80 125h72M116 89v72M516 436h70M551 401v70"/><circle cx="334" cy="278" r="236" stroke-dasharray="2 11"/></g></svg>`;

const slides = [
  frame('forum-01', 'forum', 1, {
    className: 'huge',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">NIS · ҚАЗАҚСТАН<br>19.09.2026</div><div class="hero-center"><div class="kicker"><b>●</b>Форум технологий и идей</div><h1>DIGITAL<br>NIS FORUM</h1><div class="hero-tag">БІРГЕ ЖАСАЙМЫЗ</div><p>Один день. Одно сообщество. Общее цифровое будущее.</p></div><div class="people"><div class="person left-one"><i class="leg a"></i><i class="leg b"></i></div><div class="person left-two"><i class="leg a"></i><i class="leg b"></i></div><div class="person right-one"><i class="leg a"></i><i class="leg b"></i></div><div class="person right-two"><i class="leg a"></i><i class="leg b"></i></div></div><div class="hero-logo">${siteLogoArt}</div><div class="hero-card"><div><div class="date">19.09<span>.2026</span></div><small>Басты форум</small></div><div class="note">Идея · команда · нәтиже<br>01 / 03</div></div><div class="ticker"><span>СТАРТАПЫ ✳ ЖИ ✳ РОБОТОТЕХНИКА ✳ БІЛІМ ✳ КОД ✳ 3D ✳ ИННОВАЦИИ ✳ АДАМДАР ✳ БІРГЕ</span></div>`,
  }),
  frame('digital-apta-01', 'digital-apta', 1, {
    className: 'huge',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">12–18.09.2026<br>НЕДЕЛЯ ПОДГОТОВКИ</div><div class="kicker"><b>02</b>Digital Apta</div><h1>DIGITAL<br>APTA</h1><p><span class="lime">Неделя, чтобы создать своё.</span></p><p>Практика, менторы, прототипы и подготовка к главному форуму.</p><div class="mini-list">${aptaEvents.slice(0, 5).map(([d, n]) => `<div><span>${d}</span><b>${n}</b></div>`).join('')}</div><div class="footer"><span>Программа недели</span><span>01 / 09</span></div>`,
  }),
  ...aptaEvents.map(([date, title, desc, num], i) =>
    frame(`digital-apta-${String(i + 2).padStart(2, '0')}`, 'digital-apta', i + 2, {
      className: 'xl',
      html: `<img class="brand" src="${logo}" alt=""><div class="topline">DIGITAL APTA<br>${date}</div><div class="kicker"><b>${String(i + 1).padStart(2, '0')}</b>Событие недели</div><h1>${title}</h1><article class="event-card"><div><div class="day">${date}</div><h2>${title}</h2><p>${desc}</p></div><div class="button fill" style="position:static;width:100%">Добавить в расписание <span>↗</span></div><span class="num">${num}</span></article><div class="footer"><span>DIGITAL APTA</span><span>${String(i + 2).padStart(2, '0')} / 09</span></div>`,
    }),
  ),
  frame('speakers-01', 'speakers', 1, {
    className: 'xl',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">19.09.2026<br>ГЛАВНАЯ СЦЕНА</div><div class="kicker"><b>05</b>Спикеры</div><h1>Большие умы.<br>Пока под секретом.</h1><div class="speaker-grid">${speakerSlides.slice(0, 3).map(([n, t, d]) => `<article class="speaker"><div class="avatar"></div><div><h2>${t}</h2><p>${d}</p></div><b class="n">${n}</b></article>`).join('')}</div><div class="footer"><span>Имена спикеров скоро откроем</span><span>01 / 05</span></div>`,
  }),
  ...speakerSlides.map(([n, title, desc], i) =>
    frame(`speakers-${String(i + 2).padStart(2, '0')}`, 'speakers', i + 2, {
      className: 'xl',
      html: `<img class="brand" src="${logo}" alt=""><div class="topline">СПИКЕРЫ<br>${n}</div><div class="kicker"><b>${n}</b>Главная сцена</div><h1>${title}</h1><article class="event-card" style="height:670px;background:linear-gradient(180deg,#111a11,#090d0b)"><div class="avatar" style="width:320px;height:320px;margin:35px auto 0"></div><div><h2>${i === 3 ? 'Панельная дискуссия' : 'Тема скоро'}</h2><p>${desc}</p></div><span class="num">${n}</span></article><div class="footer"><span>Люди · идеи · диалог</span><span>${String(i + 2).padStart(2, '0')} / 05</span></div>`,
    }),
  ),
  frame('competitions-01', 'competitions', 1, {
    className: 'xl',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">19.09.2026<br>СОРЕВНОВАНИЯ</div><div class="kicker"><b>06</b>Для тех, кто создаёт</div><h1>Твоя идея.<br>Твоя игра.<br>Твой ход.</h1><div class="cards">${competitions.map((c, i) => `<article class="card ${i === 3 ? 'active' : ''}"><div><span class="icon">${c[3]}</span><h2 class="${c[1].length > 28 ? 'long' : ''}">${c[1]}</h2><p>${c[2]}</p></div><div class="footer" style="position:static;padding-top:18px"><span>19 сентября</span><span>↗</span></div></article>`).join('')}</div><div class="prize-line"><span>Общий призовой фонд</span><b>200 000 ТГ</b></div><div class="footer"><span>4 направления</span><span>01 / 05</span></div>`,
  }),
  ...competitions.map(([n, title, desc, icon], i) =>
    frame(`competitions-${String(i + 2).padStart(2, '0')}`, 'competitions', i + 2, {
      className: 'xl',
      html: `<img class="brand" src="${logo}" alt=""><div class="topline">СОРЕВНОВАНИЕ<br>${n}</div><div class="kicker"><b>${n}</b>19 сентября</div><h1 class="${title.length > 28 ? 'long-title' : ''}">${title}</h1><article class="event-card"><div><div class="day">${icon}</div><h2>${title}</h2><p>${desc}</p></div><div class="button fill" style="position:static;width:100%">Смотреть подробнее <span>↗</span></div><span class="num">${n}</span></article><div class="footer"><span>DIGITAL NIS FORUM</span><span>${String(i + 2).padStart(2, '0')} / 05</span></div>`,
    }),
  ),
  frame('extra-01', 'extra', 1, {
    className: 'xl',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">МАСТЕР-КЛАССЫ<br>РОЗЫГРЫШ</div><div class="kicker"><b>09</b>Подарок на каждом мастер-классе</div><h1>Участвуй.<br>Выигрывай.<br><span class="lime">ChatGPT Plus.</span></h1><p>На каждом мастер-классе форума мы разыграем подписку ChatGPT Plus среди участников.</p><div class="plus-gift"><small>Приз мастер-класса</small><b>CHATGPT<br>PLUS</b><span>↗</span></div><div class="button">Приходи на мастер-класс <span>↗</span></div><div class="footer"><span>Розыгрыш среди участников</span><span>01 / 02</span></div>`,
  }),
  frame('extra-02', 'extra', 2, {
    className: 'xl',
    html: `<img class="brand" src="${logo}" alt=""><div class="topline">DIGITAL PASS<br>2026</div><div class="kicker"><b>10</b>Ваш пропуск</div><h1>Один пропуск.<br>Все события.</h1><p>Цифровой QR-пропуск для входа, расписания и начисления баллов.</p><div class="pass"><div class="pass-top"><span>DIGITAL<br>NIS FORUM</span><span>2026 ↗</span></div><h2>Будущее<br>начинается<br>с вас.</h2><div class="qr">QR</div></div><div class="button">Активировать промокод <span>↗</span></div><div class="footer"><span>Личный · цифровой</span><span>02 / 02</span></div>`,
  }),
];

await writeFile(
  `${root}/instagram-designs.html`,
  `<!doctype html><html lang="ru"><meta charset="utf-8"><title>DIGITAL NIS FORUM — Instagram</title><style>${css}</style><body>${slides.map((s) => s[2]).join('\n')}</body></html>`,
);

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(`${root}/instagram-designs.html`).href, { waitUntil: 'networkidle' });

for (const [series, index] of slides) {
  await mkdir(`${root}/instagram/${series}`, { recursive: true });
  await page
    .locator(`#${series}-${String(index).padStart(2, '0')}`)
    .screenshot({ path: `${root}/instagram/${series}/${String(index).padStart(2, '0')}.png` });
}

await page.pdf({
  path: `${root}/instagram-preview.pdf`,
  printBackground: true,
  width: '1080px',
  height: '1350px',
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  scale: 1,
});
for (const series of ['forum', 'digital-apta', 'speakers']) {
  await copyFile(`${root}/instagram/${series}/01.png`, `${root}/instagram-${series}.png`);
}

await page.evaluate(() => {
  document.body.style.display = 'grid';
  document.body.style.gridTemplateColumns = 'repeat(4, 236px)';
  document.body.style.gap = '18px';
  document.body.style.padding = '18px';
  document.querySelectorAll('.post').forEach((el) => {
    el.style.zoom = '.2';
  });
});
await page.setViewportSize({ width: 1010, height: 1700 });
await page.screenshot({ path: `${root}/instagram/contact-sheet.png`, fullPage: true });
await browser.close();

spawnSync(
  'python3',
  [
    '-c',
    `from pathlib import Path
from PIL import Image
root = Path('${root}')
order = []
for folder in ['forum', 'digital-apta', 'speakers', 'competitions', 'extra']:
    order.extend(sorted((root / 'instagram' / folder).glob('*.png')))
images = [Image.open(path).convert('RGB') for path in order]
images[0].save(root / 'instagram-preview.pdf', save_all=True, append_images=images[1:], resolution=96.0)`,
  ],
  { stdio: 'inherit' },
);

console.log(`Generated ${slides.length} Instagram slides and PDF preview.`);
