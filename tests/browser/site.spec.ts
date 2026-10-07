import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home renders Markdown, optimized photography and keyboard skip link', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'What makes a good paddle?',
  );
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(
    'A little closer to the water',
  );
  const image = page.getByRole('img');
  await expect(image).toHaveAttribute('src', /\.webp$/);
  await expect(image).toHaveJSProperty('complete', true);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('drafts are absent and missing routes offer a working way home', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page
      .getByRole('navigation')
      .getByRole('link', { name: /About|Contact|Blog/ }),
  ).toHaveCount(0);
  const response = await page.goto('/about/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Back to shore.',
  );
  await page.getByRole('link', { name: 'Return to Good Paddle' }).click();
  await expect(page).toHaveURL('/');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme} theme: accessible homepage and 404 at mobile size`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 740 });
    for (const path of ['/', '/missing/']) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}

test('theme choice persists and System tracks OS changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-override',
    'dark',
  );
  await page.reload();
  await expect(
    page.getByRole('radio', { name: 'Dark', exact: true }),
  ).toBeChecked();
  await page.getByRole('radio', { name: 'System', exact: true }).check();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-override');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-resolved',
    'dark',
  );
});

test('blocked storage does not break reading or theme selection', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme-resolved',
    'dark',
  );
});

test('content and navigation work with JavaScript disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Good Paddle home' }).click();
  await expect(page.getByRole('main')).toBeVisible();
  await context.close();
});
