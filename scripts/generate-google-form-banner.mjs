import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const outDir = 'materials/ru/google-forms';
const htmlPath = `${outDir}/digital-nis-google-form-banner.html`;
const pngPath = `${outDir}/digital-nis-google-form-banner.png`;
const pdfPath = `${outDir}/digital-nis-google-form-banner.pdf`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:1600px 400px;margin:0}
*{box-sizing:border-box;caret-color:transparent}
body{margin:0;background:#070908;color:#f0f2eb;font-family:Arial,Helvetica,sans-serif}
.banner{width:1600px;height:400px;position:relative;overflow:hidden;background:#070908;padding:42px 56px}
.banner:before{content:"";position:absolute;inset:0;background-image:linear-gradient(#91ab6518 1px,transparent 1px),linear-gradient(90deg,#91ab6518 1px,transparent 1px);background-size:70px 70px;background-position:0 -20px}
.banner:after{content:"";position:absolute;right:-170px;top:-260px;width:740px;height:740px;border:1px dashed #bcf75a44;border-radius:50%;box-shadow:0 0 90px #bcf75a18 inset}
.brand{position:absolute;left:56px;top:40px;width:205px;height:auto;z-index:5}
.topline{position:absolute;right:58px;top:42px;text-align:right;color:#aeb7aa;font:15px monospace;letter-spacing:5px;text-transform:uppercase;z-index:5}
.kicker{position:absolute;left:56px;top:118px;color:#aeb7aa;font:16px monospace;letter-spacing:6px;text-transform:uppercase;z-index:5}.kicker b{color:#bcf75a;margin-right:18px}
h1{position:absolute;left:52px;bottom:54px;margin:0;font-size:94px;line-height:.88;letter-spacing:-6px;text-transform:uppercase;z-index:5}.lime{color:#bcf75a}
.sub{position:absolute;left:620px;bottom:70px;width:430px;color:#a9b0a6;font-size:26px;line-height:1.28;z-index:5}.sub b{color:#f0f2eb}
.mark-wrap{position:absolute;right:118px;top:70px;width:340px;height:260px;display:grid;place-items:center;background:radial-gradient(ellipse,#bcf75a26,transparent 68%);z-index:4}.mark-wrap img{width:275px;height:230px;filter:drop-shadow(0 0 34px #bcf75a34);transform:rotate(-5deg)}
.date{position:absolute;right:560px;top:172px;color:#f0f2eb;font-size:58px;font-weight:800;letter-spacing:-3px;z-index:5}.date span{color:#8f9b82}
.bottom{position:absolute;left:0;right:0;bottom:0;height:42px;background:#bcf75a;color:#111a0c;display:flex;align-items:center;gap:34px;padding-left:56px;font:22px Arial,sans-serif;font-weight:900;letter-spacing:2px;text-transform:uppercase;z-index:8;white-space:nowrap}.bottom span{display:inline-flex;gap:34px;align-items:center}.bottom b{font-size:26px}
.corner{position:absolute;right:58px;bottom:62px;color:#aeb7aa;font:15px monospace;letter-spacing:5px;text-transform:uppercase;z-index:7}
.line{position:absolute;left:56px;right:56px;top:96px;height:1px;background:#263424;z-index:3}
</style></head><body><section class="banner">
  <div class="line"></div>
  <img class="brand" src="../../../public/logo-horizontal.svg" alt="Digital NIS Forum">
  <div class="topline">NIS · Қазақстан<br>Google Forms</div>
  <div class="kicker"><b>●</b>Форум технологий и идей</div>
  <h1>DIGITAL<br><span class="lime">NIS</span> FORUM</h1>
  <div class="date">19.09<span>.2026</span></div>
  <p class="sub"><b>Один день.</b><br>Одно сообщество.<br>Общее цифровое будущее.</p>
  <div class="mark-wrap"><img src="../../../public/logo-mark.svg" alt=""></div>
  <div class="corner">Регистрация · участие бесплатно</div>
  <div class="bottom"><span>СТАРТАПЫ <b>✳</b> ЖИ <b>✳</b> РОБОТОТЕХНИКА <b>✳</b> БІЛІМ <b>✳</b> КОД <b>✳</b> 3D <b>✳</b> ИННОВАЦИИ</span></div>
</section></body></html>`;

await mkdir(outDir, { recursive: true });
await writeFile(htmlPath, html);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 400 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(`${process.cwd()}/${htmlPath}`).href);
await page.locator('.banner').screenshot({ path: pngPath });
await page.pdf({ path: pdfPath, width: '1600px', height: '400px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(`Generated ${pngPath}`);
console.log(`Generated ${pdfPath}`);
