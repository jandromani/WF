import { expect, test } from '@playwright/test';

const parseBalance = (value: string) => Number(value.replace(/[^0-9.,-]/g, '').replace(',', '.'));

test('claim habilitado actualiza el balance y muestra notificación', async ({ page }) => {
  await page.goto('/?world_app=1');
  await page.getByTestId('verify-cta').click();
  await expect(page.getByTestId('verification-gate')).toBeHidden();

  const balanceLocator = page.getByTestId('wallet-balance');
  const initialBalanceText = await balanceLocator.textContent();
  expect(initialBalanceText).not.toBeNull();
  const initialBalance = parseBalance(initialBalanceText ?? '0');

  const claimButton = page.getByTestId('claim-action');
  await expect(claimButton).toBeEnabled();
  await claimButton.click();

  await expect(claimButton).toBeDisabled();
  await expect(page.getByTestId('notification-center')).toContainText('Claim completado');

  await expect(balanceLocator).toHaveText(/WLD/);
  const finalBalanceText = await balanceLocator.textContent();
  const finalBalance = parseBalance(finalBalanceText ?? '0');

  expect(finalBalance).toBeGreaterThan(initialBalance);
});
