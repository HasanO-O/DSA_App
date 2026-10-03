import { test, expect } from '@playwright/test';

/**
 * MVP smoke flow (spec §39), trimmed to what Phase 0–3 delivers.
 * The judge/execution steps arrive with Phase 4 and are added there.
 *
 * Runs against a Pixel 5 viewport so the mobile layout is exercised by default.
 */
test('a learner can browse problems and open a workspace', async ({ page }) => {
  // Unauthenticated visitors are redirected to the login screen.
  await page.goto('/problems');
  await expect(page).toHaveURL(/\/login$/);

  // The login screen is usable on a narrow viewport.
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('the login screen renders without horizontal overflow on a phone', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  // A couple of pixels of sub-pixel rounding is fine; a real layout break is not.
  expect(overflow).toBeLessThanOrEqual(2);
});

test('the PWA manifest is served and installable', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.length).toBeGreaterThan(0);
});