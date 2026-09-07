import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE', m.text());
});
await page.goto('http://localhost:3000');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
console.log(
  'AXE',
  JSON.stringify(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
    })),
    null,
    2,
  ),
);
await page.goto('http://localhost:3000/program');
await page.getByRole('button', { name: '15 SEP', exact: true }).click();
await page.waitForTimeout(1000);
console.log('HEADINGS', await page.locator('h3').allTextContents());
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
await browser.close();
