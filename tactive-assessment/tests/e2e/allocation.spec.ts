import { test, expect } from '@playwright/test';

test('should load the dashboard and allow logging in', async ({ page }) => {
  await page.goto('/');

  // Check header
  await expect(page.locator('h1')).toContainText('EVChargeFlow');

  // Handle mock login
  page.on('dialog', async (dialog) => {
    // Answer the username prompt
    if (dialog.message().includes('Username')) {
      await dialog.accept('operator');
    }
    // Answer the password prompt
    else if (dialog.message().includes('Password')) {
      await dialog.accept('admin123');
    }
    else {
      await dialog.accept(); // For alerts
    }
  });

  await page.click('text=Operator Login');

  // The UI should now show "Operator Mode Active"
  await expect(page.locator('text=Operator Mode Active')).toBeVisible({ timeout: 5000 });
});

test('should submit a charging request', async ({ page }) => {
  await page.goto('/');

  // Fill in request form
  await page.fill('input[placeholder="e.g. EV-01"]', 'TEST-EV');
  await page.selectOption('select', 'Type 2');
  await page.click('button:has-text("Request Charger")');

  // Wait for request to process and clear form
  await expect(page.locator('input[placeholder="e.g. EV-01"]')).toHaveValue('');
});
