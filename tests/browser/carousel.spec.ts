import assert from 'node:assert/strict';
import { test, expect } from '@playwright/test';

const carousel = 'hero-carousel';

test('loads only the lead photo initially, then cycles through six unique slides', async ({
  page,
}) => {
  const imageRequests: string[] = [];
  page.on('request', (request) => {
    if (
      request.resourceType() === 'image' &&
      request.url().includes('/_astro/')
    )
      imageRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator(carousel)).toHaveAttribute('data-ready', 'true');
  const image = page.locator(`${carousel} img`);
  const lead = await image.getAttribute('src');
  assert.ok(lead, 'The lead photo must have a source URL');
  expect(imageRequests).toHaveLength(1);
  const seen = [lead];
  for (let i = 2; i <= 6; i++) {
    await page.getByRole('button', { name: 'Next photo' }).click();
    await expect(page.locator('[data-counter]')).toHaveText(`${i} / 6`);
    await expect(image).toHaveJSProperty('complete', true);
    expect(
      await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
    const source = await image.getAttribute('src');
    assert.ok(source, 'Each selected photo must have a source URL');
    seen.push(source);
  }
  expect(new Set(seen).size).toBe(6);
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(image).toHaveAttribute('src', lead);
  await expect(page.locator('[data-counter]')).toHaveText('1 / 6');
  await page.getByRole('button', { name: 'Previous photo' }).click();
  await expect(page.locator('[data-counter]')).toHaveText('6 / 6');
  await page.reload();
  await expect(image).toHaveAttribute('src', lead);
  await expect(page.locator('[data-counter]')).toHaveText('1 / 6');
});

test('keyboard controls preserve focus and announce the selected photo', async ({
  page,
}) => {
  await page.goto('/');
  const next = page.getByRole('button', { name: 'Next photo' });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
  await expect(next).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Photo 2 of 6:');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-counter]')).toHaveText('3 / 6');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
});

test('horizontal drag navigates, taps and vertical gestures do not', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator(carousel)).toHaveAttribute('data-ready', 'true');
  const image = page.locator(`${carousel} img`);
  await image.scrollIntoViewIfNeeded();
  const box = await image.boundingBox();
  assert.ok(box, 'The carousel photo must have a visible bounding box');
  const gesture = async (dx: number, dy: number) => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + dx,
      box.y + box.height / 2 + dy,
      { steps: 5 },
    );
    await page.mouse.up();
  };
  await gesture(-100, 5);
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
  await gesture(100, 5);
  await expect(page.locator('[data-counter]')).toHaveText('1 / 6');
  await gesture(5, 80);
  await gesture(10, 0);
  await expect(page.locator('[data-counter]')).toHaveText('1 / 6');
});

test('no JavaScript leaves the hero visible and hides nonfunctional controls', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const photoResponse = page.waitForResponse(
    (response) =>
      response.request().resourceType() === 'image' &&
      response.url().includes('/_astro/'),
  );
  await page.goto('http://127.0.0.1:4321/');
  expect((await photoResponse).ok()).toBe(true);
  const image = page.locator(`${carousel} img`);
  await expect(image).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
  await context.close();
});

test('a failed photo keeps the previous image and allows another attempt', async ({
  page,
}) => {
  await page.goto('/');
  const image = page.locator(`${carousel} img`);
  const lead = await image.getAttribute('src');
  assert.ok(lead, 'The lead photo must have a source URL');
  await page.route('**/_astro/*.webp', (route) => route.abort());
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(page.getByRole('status')).toContainText('could not load');
  await expect(image).toHaveAttribute('src', lead);
  await expect(page.locator('[data-counter]')).toHaveText('1 / 6');
  await page.unroute('**/_astro/*.webp');
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
});

test('rapid navigation displays the latest selection even when requests finish out of order', async ({
  page,
}) => {
  await page.goto('/');
  const counter = page.locator('[data-counter]');
  await expect(page.locator(carousel)).toHaveAttribute('data-ready', 'true');
  const pending: (() => Promise<void>)[] = [];
  await page.route('**/_astro/*.webp', (route) => {
    pending.push(() => route.continue());
  });
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect.poll(() => pending.length).toBe(1);
  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect.poll(() => pending.length).toBe(2);
  await pending[1]();
  await expect(counter).toHaveText('3 / 6');
  await pending[0]();
  await page.waitForLoadState('networkidle');
  await expect(counter).toHaveText('3 / 6');
});

test('touchscreen swipe changes photos and vertical touch still scrolls', async ({
  browser,
  browserName,
}) => {
  // Firefox and WebKit do not expose the CDP touch injection used by this test.
  test.skip(
    browserName !== 'chromium',
    'Native touch injection uses Chromium DevTools.',
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.locator(carousel)).toHaveAttribute('data-ready', 'true');
  const client = await context.newCDPSession(page);
  const box = await page.locator(`${carousel} img`).boundingBox();
  assert.ok(box, 'The carousel photo must have a visible bounding box');
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + box.height / 2);
  const touch = async (dx: number, dy: number) => {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 5; i++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + (dx * i) / 5, y: y + (dy * i) / 5 }],
      });
    }
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  };
  await touch(-100, 0);
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
  await touch(0, -100);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(page.locator('[data-counter]')).toHaveText('2 / 6');
  await context.close();
});

test('incomplete carousel markup keeps the static photo without enabling controls', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator(carousel)).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => {
    const original = document.querySelector('hero-carousel');
    if (!original) throw new Error('Expected the homepage carousel');
    const clone = original.cloneNode(true) as HTMLElement;
    delete clone.dataset.ready;
    clone.id = 'incomplete-carousel';
    const controls = clone.querySelector<HTMLElement>('[data-controls]');
    if (controls) controls.hidden = true;
    clone.querySelector('[data-next]')?.remove();
    document.querySelector('main')?.append(clone);
  });
  const fallback = page.locator('#incomplete-carousel');
  await expect(fallback.locator('img')).toBeVisible();
  await expect(fallback).not.toHaveAttribute('data-ready');
  await expect(fallback.locator('[data-controls]')).toBeHidden();
  expect(errors).toEqual([]);
});
