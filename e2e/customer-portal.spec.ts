import { test, expect } from '@playwright/test';

const CUSTOMER_EMAIL = 'customer_e2e@techmaha.com';
const CUSTOMER_PASSWORD = 'password123';

test.describe('Customer Portal Flow', () => {
  test('Customer can login and land on /customer/dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();

    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to customer dashboard
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Quotations', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/quotations');
    await expect(page).toHaveURL(/\/customer\/quotations/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Invoices', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/invoices');
    await expect(page).toHaveURL(/\/customer\/invoices/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Orders', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/orders');
    await expect(page).toHaveURL(/\/customer\/orders/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Tickets', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/tickets');
    await expect(page).toHaveURL(/\/customer\/tickets/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Warranty', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/warranty');
    await expect(page).toHaveURL(/\/customer\/warranty/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Customer can navigate to Profile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', CUSTOMER_EMAIL);
    await page.fill('input[type="password"]', CUSTOMER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/customer\/dashboard/, { timeout: 10000 });

    await page.goto('/customer/profile');
    await expect(page).toHaveURL(/\/customer\/profile/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
