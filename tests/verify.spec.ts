import { expect, test, type Page } from '@playwright/test';

const mockProofPayload = {
  nullifier_hash: '0xmock-nullifier',
  merkle_root: '0xmock-merkle-root',
  proof: '0xmock-proof',
  status: 'success',
};

const installMiniKitMock = async (
  page: Page,
  overrides: Partial<typeof mockProofPayload> = {},
) => {
  const payload = { ...mockProofPayload, ...overrides };
  await page.addInitScript((mockPayload) => {
    (window as unknown as { MiniKit: unknown }).MiniKit = {
      isInstalled: () => true,
      commandsAsync: {
        verify: () =>
          Promise.resolve({
            finalPayload: mockPayload,
          }),
        pay: () => Promise.resolve(undefined),
        getPermissions: () => Promise.resolve([]),
        sendTransaction: () => Promise.resolve(undefined),
      },
      getUserByUsername: async () => ({ walletAddress: '0x0' }),
    };
  }, payload);
};

const fulfillVerifyProof = async (
  page: Page,
  status: number,
  body: Record<string, unknown>,
) => {
  await page.route('**/api/verify-proof', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
};

test('bloquea pantalla si no verificado y se levanta tras verificar', async ({ page }) => {
  await installMiniKitMock(page);
  await fulfillVerifyProof(page, 200, { verifyRes: { success: true } });

  await page.goto('/(protected)/home?world_app=1');
  await expect(page).toHaveURL(/\(protected\)\/home/);

  const gate = page.getByTestId('verification-gate');
  await expect(gate).toBeVisible();

  await page.getByTestId('verify-cta').click();

  await expect(gate).toBeHidden();
});

test('muestra un error cuando se reutiliza el mismo nullifier', async ({ page }) => {
  await installMiniKitMock(page, { nullifier_hash: '0xduplicate-nullifier' });

  let attempts = 0;
  await page.route('**/api/verify-proof', async (route) => {
    attempts += 1;
    const isFirstAttempt = attempts === 1;
    await route.fulfill({
      status: isFirstAttempt ? 200 : 409,
      contentType: 'application/json',
      body: isFirstAttempt
        ? JSON.stringify({ verifyRes: { success: true } })
        : JSON.stringify({ error: 'Nullifier already used' }),
    });
  });

  await page.goto('/(protected)/home?world_app=1');
  await expect(page).toHaveURL(/\(protected\)\/home/);

  const verifyButton = page.getByTestId('verify-device');

  const firstResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/verify-proof') &&
      response.request().method() === 'POST',
  );
  await verifyButton.click();
  const firstResponse = await firstResponsePromise;
  expect(firstResponse.status()).toBe(200);

  const duplicateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/verify-proof') &&
      response.request().method() === 'POST' &&
      response.status() === 409,
  );
  await verifyButton.click();
  const duplicateResponse = await duplicateResponsePromise;
  expect(duplicateResponse.status()).toBe(409);

  await expect(page.getByText('Failed to verify')).toBeVisible();
});

test('muestra un error cuando se supera la cuota por IP', async ({ page }) => {
  await installMiniKitMock(page, { nullifier_hash: '0xrate-limit' });

  await fulfillVerifyProof(page, 429, { error: 'Rate limit exceeded' });

  await page.goto('/(protected)/home?world_app=1');
  await expect(page).toHaveURL(/\(protected\)\/home/);

  const verifyButton = page.getByTestId('verify-device');

  const rateLimitResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/verify-proof') &&
      response.request().method() === 'POST',
  );

  await verifyButton.click();
  const rateLimitResponse = await rateLimitResponsePromise;
  expect(rateLimitResponse.status()).toBe(429);

  await expect(page.getByText('Failed to verify')).toBeVisible();
});
