import { test, expect } from '@playwright/test';

const URL = 'http://192.168.1.122:3004/tech/rankings/laptops';

const DIAGNOSTIC_FN = () => {
  const yearTrigger = document.querySelector('[data-facet-dropdown="Year"]');
  if (!yearTrigger) return { error: 'Year trigger not found' };
  const rect = yearTrigger.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const elementsAtPoint = document.elementsFromPoint(cx, cy).slice(0, 10).map(el => ({
    tag: el.tagName,
    id: el.id || null,
    classes: (el.className && typeof el.className === 'string') ? el.className.slice(0, 200) : null,
    dataAttrs: Object.fromEntries(
      Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value])
    ),
    role: el.getAttribute('role'),
    ariaHidden: el.getAttribute('aria-hidden'),
    inert: el.hasAttribute('inert'),
    pointerEvents: getComputedStyle(el).pointerEvents,
    position: getComputedStyle(el).position,
    zIndex: getComputedStyle(el).zIndex,
    visibility: getComputedStyle(el).visibility,
    opacity: getComputedStyle(el).opacity,
    display: getComputedStyle(el).display,
    rect: el.getBoundingClientRect(),
  }));
  const overlays = Array.from(document.querySelectorAll('[data-base-ui-portal], [data-floating-ui-portal], [data-floating-ui-focusable], [data-floating-ui-inert], [data-base-ui-inert], [role="dialog"], [data-base-ui-popup], [data-base-ui-positioner], [data-base-ui-backdrop]')).map(el => ({
    selector: el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + (typeof el.className === 'string' ? el.className.slice(0, 60) : '') : ''),
    dataAttrs: Object.fromEntries(Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value])),
    role: el.getAttribute('role'),
    ariaHidden: el.getAttribute('aria-hidden'),
    inert: el.hasAttribute('inert'),
    pointerEvents: getComputedStyle(el).pointerEvents,
    rect: el.getBoundingClientRect(),
    visible: el.offsetParent !== null,
  }));
  return {
    elementsAtYearTriggerPoint: elementsAtPoint,
    allOverlays: overlays,
    bodyInert: document.body.hasAttribute('inert'),
    bodyPointerEvents: getComputedStyle(document.body).pointerEvents,
    bodyAriaHidden: document.body.getAttribute('aria-hidden'),
    htmlInert: document.documentElement.hasAttribute('inert'),
    htmlPointerEvents: getComputedStyle(document.documentElement).pointerEvents,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    bodyOverflow: getComputedStyle(document.body).overflow,
  };
};

test('TEST 1: chip click then check Year dropdown blocker', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Open CPU popover
  await page.locator('[data-facet-dropdown="CPU"]').first().click();
  await page.waitForTimeout(300);

  // Click first chip inside popover (AMD)
  const popover = page.locator('[role="dialog"], [data-base-ui-popup]').first();
  // Find the first chip-style button - try a few selectors
  const chip = popover.locator('button').filter({ hasText: /AMD/i }).first();
  await chip.click({ timeout: 5000 });
  await page.waitForTimeout(1500);

  const result = await page.evaluate(DIAGNOSTIC_FN);
  console.log('=== TEST 1 RESULT (after chip click) ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('=== END TEST 1 ===');

  // Sanity probe
  const probe = await page.evaluate(() => ({
    url: location.href,
    yearCount: document.querySelectorAll('[data-facet-dropdown="Year"]').length,
    allFacets: Array.from(document.querySelectorAll('[data-facet-dropdown]')).map(e => e.getAttribute('data-facet-dropdown')),
    totalButtons: document.querySelectorAll('button').length,
  }));
  console.log('=== TEST 1 PROBE ===');
  console.log(JSON.stringify(probe, null, 2));
});

test('TEST 2: open CPU popover, outside-click, check Year', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Diagnostic before
  const before = await page.evaluate(DIAGNOSTIC_FN);
  console.log('=== TEST 2 BEFORE OPEN ===');
  console.log(JSON.stringify(before, null, 2));

  // Open CPU popover
  await page.locator('[data-facet-dropdown="CPU"]').first().click();
  await page.waitForTimeout(300);

  // Click outside (somewhere on body, not on year). Click near top-left corner away from any controls.
  await page.mouse.click(10, 400);
  await page.waitForTimeout(1500);

  const after = await page.evaluate(DIAGNOSTIC_FN);
  console.log('=== TEST 2 AFTER OUTSIDE CLICK CLOSE ===');
  console.log(JSON.stringify(after, null, 2));
  console.log('=== END TEST 2 ===');
});

test('TEST 3: open CPU popover, press Escape, check Year', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.locator('[data-facet-dropdown="CPU"]').first().click();
  await page.waitForTimeout(300);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  const result = await page.evaluate(DIAGNOSTIC_FN);
  console.log('=== TEST 3 RESULT (after Escape) ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('=== END TEST 3 ===');
});
