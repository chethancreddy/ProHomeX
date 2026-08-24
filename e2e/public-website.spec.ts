import { test, expect } from '@playwright/test';

test.describe('Public Website', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TechMaha/);
    // Should NOT redirect to login
    await expect(page).not.toHaveURL(/login/);
    // Should show the hero section
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('CCTV service page loads', async ({ page }) => {
    await page.goto('/cctv');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Solar service page loads', async ({ page }) => {
    await page.goto('/solar');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('UPS service page loads', async ({ page }) => {
    await page.goto('/ups');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Request Quote page loads and has a form', async ({ page }) => {
    await page.goto('/request-quote');
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('form')).toBeVisible();
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('Auth Guards', () => {
  test('Unauthenticated access to /customer/* redirects to login', async ({ page }) => {
    await page.goto('/customer/dashboard');
    // Should be redirected to login
    await expect(page).toHaveURL(/login/);
  });

  test('Unauthenticated access to /admin/dashboard redirects to admin login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/admin\/login/);
  });
});
