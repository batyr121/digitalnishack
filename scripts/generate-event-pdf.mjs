import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage();
await page.goto(pathToFileURL('materials/ru/event-documentation.html').href, {
  waitUntil: 'networkidle',
});
await page.pdf({
  path: 'materials/ru/digital-nis-forum-2026-docs-ru.pdf',
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log('Generated materials/ru/digital-nis-forum-2026-docs-ru.pdf');
