import { expect, test } from '@playwright/test';

test('bloquea pantalla si no verificado y se levanta tras verificar', async ({ page }) => {
  await page.goto('/?world_app=1');
  await expect(page).toHaveURL(/\(protected\)\/home/);

  const gate = page.getByTestId('verification-gate');
  await expect(gate).toBeVisible();

  await page.getByTestId('verify-cta').click();

  await expect(gate).toBeHidden();
});
