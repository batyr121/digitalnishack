import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const outDir = 'materials/ru/workshops';
const htmlPath = `${outDir}/digital-nis-workshops.html`;
const pdfPath = `${outDir}/digital-nis-workshops.pdf`;
const contactPath = `${outDir}/digital-nis-workshops-preview.png`;
const logo = '../../../public/logo-horizontal.svg';

const workshops = [
  ['01', '14.09', 'Startup & Pitching', 'Стартап-мышление, сильная идея, структура питча и уверенная презентация проекта.', '↗'],
  ['02', '16.09', 'Artisan 3D Modeling', 'Практический мастер-класс по 3D-моделированию: от формы и идеи до цифрового объекта.', '3D'],
  ['03', '17.09', 'Mock Day', 'Пробный день для команд хакатона и Startup Battle: прогон решений, питчей и обратная связь.', '✳'],
];

const css = `
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;caret-color:transparent}
body{margin:0;background:#070908;color:#f0f2eb;font-family:Arial,Helvetica,sans-serif}
.page{width:1080px;height:1350px;position:relative;overflow:hidden;background:#070908;padding:58px;break-after:page;page-break-after:always}
.page:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#91ab6515 1px,transparent 1px),linear-gradient(90deg,#91ab6515 1px,transparent 1px);background-size:64px 64px;background-position:24px 0}
.page:after{content:"";position:absolute;left:58px;right:58px;top:28px;height:1px;background:#263424;box-shadow:0 1280px 0 #263424}
.brand{position:absolute;left:58px;top:62px;width:150px;z-index:5}.topline{position:absolute;right:58px;top:72px;text-align:right;color:#b8bfb4;font:15px monospace;letter-spacing:6px;text-transform:uppercase;z-index:5}.kicker{position:relative;margin-top:150px;color:#b8bfb4;font:17px monospace;letter-spacing:6px;text-transform:uppercase;z-index:5}.kicker b{color:#bcf75a;margin-right:18px}h1{position:relative;font-size:86px;line-height:.9;letter-spacing:-5px;margin:48px 0 34px;z-index:5}p{position:relative;color:#aeb6ad;font-size:27px;line-height:1.38;margin:0;z-index:5}.lime{color:#bcf75a}.cards{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px;z-index:5}.card{height:150px;border:1px solid #334230;background:#10150f;padding:20px;display:grid;grid-template-columns:60px 1fr;align-items:center;gap:18px}.card.wide{grid-column:1 / -1}.icon{color:#bcf75a;font-size:42px;line-height:1;font-weight:800}.card h2{font-size:27px;line-height:.98;letter-spacing:-1.4px;text-transform:uppercase;margin:0 0 12px}.card p{display:none}.date{font:15px monospace;letter-spacing:5px;text-transform:uppercase;color:#b8bfb4}.footer{position:absolute;left:58px;right:58px;bottom:70px;display:flex;justify-content:space-between;align-items:center;color:#b8bfb4;font:14px monospace;letter-spacing:5px;text-transform:uppercase;z-index:6}.gift-box{position:relative;margin-top:24px;border:1px solid #bcf75a;background:#10150f;padding:24px 30px;z-index:6}.gift-box span{display:block;color:#b8bfb4;font:15px monospace;letter-spacing:5px;text-transform:uppercase}.gift-box b{display:block;margin-top:12px;color:#bcf75a;font-size:42px;line-height:1;text-transform:uppercase}.gift-box em{display:block;margin-top:10px;color:#f0f2eb;font-size:24px;font-style:normal;font-weight:800}.event-card{position:relative;margin-top:68px;height:640px;border:1px solid #bcf75a;background:#10150f;padding:46px;display:flex;flex-direction:column;justify-content:space-between;z-index:5}.event-card .big-icon{font-size:96px;color:#bcf75a;font-weight:900;line-height:1}.event-card h2{font-size:72px;line-height:.94;letter-spacing:-4px;margin:0;text-transform:uppercase}.event-card p{font-size:27px;max-width:760px}.event-card .ghost{position:absolute;right:32px;bottom:18px;font-size:190px;font-weight:900;color:#bcf75a12;letter-spacing:-10px}.button{width:max-content;border:1px solid #44523f;padding:24px 34px;color:#f0f2eb;font-weight:900;text-transform:uppercase;letter-spacing:1px}.ticker{position:absolute;left:0;right:0;bottom:0;height:54px;background:#bcf75a;color:#111a0c;display:flex;align-items:center;white-space:nowrap;font-weight:900;font-size:22px;letter-spacing:3px;z-index:10}.ticker span{animation:none;padding-left:28px}
`;

const coverCards = workshops.map(([n, d, title, desc, icon], i) => `<article class="card ${i === 4 ? 'wide' : ''}"><div class="icon">${icon}</div><div><h2>${title}</h2><div class="date">${d}</div></div></article>`).join('');
const pages = [`<section class="page"><img class="brand" src="${logo}" alt=""><div class="topline">12–18.09.2026<br>МАСТЕР-КЛАССЫ</div><div class="kicker"><b>09</b>Практика для тех, кто создаёт</div><h1>Учись.<br>Создавай.<br><span class="lime">Побеждай.</span></h1><p>Мастер-классы Digital Apta: стартапы, 3D и подготовка команд к финалу.</p><div class="cards">${coverCards}</div><div class="gift-box"><span>Подарки на мастер-классах</span><b>Chat GPT Plus</b><em>или сертификат «Золотое Яблоко» на 10 000 ₸</em></div><div class="footer"><span>3 мастер-класса · подарки участникам</span><span>01 / 04</span></div></section>`];
for (const [n, d, title, desc, icon] of workshops) {
  pages.push(`<section class="page"><img class="brand" src="${logo}" alt=""><div class="topline">DIGITAL APTA<br>${d}</div><div class="kicker"><b>${n}</b>Мастер-класс</div><h1>${title}</h1><article class="event-card"><div><div class="big-icon">${icon}</div><h2>${title}</h2><p>${desc}</p></div><div class="button">Добавить в расписание ↗</div><span class="ghost">${n}</span></article><div class="footer"><span>Digital NIS Forum</span><span>${String(Number(n)+1).padStart(2,'0')} / 04</span></div></section>`);
}
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${pages.join('\n')}</body></html>`;

await mkdir(outDir, { recursive: true });
await writeFile(htmlPath, html);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(`${process.cwd()}/${htmlPath}`).href);
const sections = await page.$$('.page');
let i = 1;
for (const section of sections) await section.screenshot({ path: `${outDir}/${String(i++).padStart(2,'0')}.png` });
await page.pdf({ path: pdfPath, width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();

const montage = spawnSync('python3', ['-c', `from PIL import Image,ImageOps,ImageDraw\nfrom pathlib import Path\nfiles=sorted(Path('${outDir}').glob('[0-9][0-9].png'))\nthumbs=[]\nfor f in files:\n    im=Image.open(f).convert('RGB')\n    im.thumbnail((270,338))\n    canvas=Image.new('RGB',(270,338),(7,9,8))\n    canvas.paste(im,((270-im.width)//2,(338-im.height)//2))\n    thumbs.append(canvas)\nw=810; h=676\nout=Image.new('RGB',(w,h),(7,9,8))\nfor idx,t in enumerate(thumbs): out.paste(t,((idx%3)*270,(idx//3)*338))\nout.save('${contactPath}')`]);
if (montage.status !== 0) console.error(montage.stderr.toString());
console.log(`Generated ${pdfPath}`);
console.log(`Generated ${contactPath}`);
