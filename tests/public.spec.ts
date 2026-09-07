import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('home, navigation, program filters and free registration', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /DIGITAL NIS FORUM/ }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Explore program', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ideas on the agenda.' })).toBeVisible();
  await page.getByRole('button', { name: '15 SEP', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vibe Coding', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'STARTUPS', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Startup Commercialization', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vibe Coding', exact: true })).toHaveCount(0);
  await page.goto('/apply');
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByRole('button', { name: /Apply to Digital/ })).toBeVisible();
});
test('language switch persists and mobile menu is usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByLabel('Language').selectOption('ru');
  await expect(page.getByRole('link', { name: 'Смотреть программу', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Программа', exact: true })
    .click();
  await expect(page).toHaveURL(/\/program/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
test('FAQ opens and public pages contain no dead destinations', async ({ page }) => {
  await page.goto('/');
  await page.locator('summary').filter({ hasText: 'Is the forum free?' }).click();
  await expect(page.getByText('Yes. Participation is free.', { exact: false })).toBeVisible();
  for (const path of [
    '/digital-apta',
    '/speakers',
    '/startup-battle',
    '/hackathon',
    '/jas-startuper',
    '/fifa',
    '/zones',
    '/activate',
    '/privacy',
    '/rules',
    '/contact',
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  }
});
test('protected routes redirect without exposing admin data', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/dashboard/pass');
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/verify/' + 'a'.repeat(64));
  await expect(page).toHaveURL(/\/login/);
});
test('disconnected service reports a real error, never fake success', async ({ page }) => {
  await page.goto('/activate');
  await page.getByLabel('Enter your invitation code').fill('DNF-INVALID-TEST');
  await page.getByRole('button', { name: 'Activate invitation' }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('not open yet');
  await expect(page.getByText('ACCESS GRANTED')).toHaveCount(0);
});
test('homepage accessibility and responsive screenshot', async ({ page }) => {
  await page.goto('/');
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
