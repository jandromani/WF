import { expect, test } from '@playwright/test';

test('suscripción y tip generan actividad en la wallet', async ({ page }) => {
  await page.goto('/?world_app=1');
  await page.getByTestId('verify-cta').click();
  await expect(page.getByTestId('verification-gate')).toBeHidden();

  const activityList = page.getByTestId('wallet-activity');
  const initialCount = await activityList.getByTestId('wallet-activity-item').count();

  await page.getByTestId('subscribe-alice').click();
  await expect(activityList).toContainText('Suscripción');

  await page.getByTestId('tip-alice-5').click();
  await expect(activityList).toContainText('Tip enviado');

  const finalCount = await activityList.getByTestId('wallet-activity-item').count();
  const expectedMinimum = Math.min(initialCount + 2, 5);
  expect(finalCount).toBeGreaterThanOrEqual(expectedMinimum);
});
