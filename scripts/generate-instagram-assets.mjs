import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL('materials/ru/instagram-designs.html').href, {
  waitUntil: 'networkidle',
});
for (const id of ['forum', 'speakers', 'digital-apta']) {
  await page.locator(`#${id}`).screenshot({ path: `materials/ru/instagram-${id}.png` });
}
await browser.close();
console.log('Generated Instagram PNG assets in materials/ru');
