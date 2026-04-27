// Cross-browser crash reproduction for glitchtech.io/tech/rankings/laptops filter chips.
// Runs WebKit, Firefox, Chromium against the live URL with heavy instrumentation.

import { webkit, firefox, chromium } from 'playwright'

const URL = 'https://glitchtech.io/tech/rankings/laptops'
const ARTIFACTS_DIR = '/tmp/crash-repro'
import fs from 'node:fs'
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true })

const INIT_SCRIPT = `
window.__counters = { rafCount: 0, mutationCount: 0, listenerCount: 0, removeListenerCount: 0 };
const origRaf = window.requestAnimationFrame;
window.requestAnimationFrame = function(...args) { window.__counters.rafCount++; return origRaf.apply(this, args); };
const origAdd = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, ...args) {
  window.__counters.listenerCount++;
  return origAdd.call(this, type, ...args);
};
const origRemove = EventTarget.prototype.removeEventListener;
EventTarget.prototype.removeEventListener = function(type, ...args) {
  window.__counters.removeListenerCount++;
  return origRemove.call(this, type, ...args);
};
try {
  new MutationObserver(records => { window.__counters.mutationCount += records.length; })
    .observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
} catch (e) { window.__mutObserverError = String(e); }
window.__pageErrors = [];
window.addEventListener('error', e => window.__pageErrors.push({type:'error', msg: String(e.message || e)}));
window.addEventListener('unhandledrejection', e => window.__pageErrors.push({type:'unhandledrejection', msg: String(e.reason)}));
`

function snapshotScript() {
  return `(() => ({
    counters: window.__counters,
    domNodes: document.getElementsByTagName('*').length,
    heap: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null,
    pageErrors: window.__pageErrors || [],
    cpuFacetButtons: document.querySelectorAll('[data-facet-dropdown="CPU"]').length,
    chipCount: document.querySelectorAll('[role="option"], [data-facet-chip], button[aria-pressed]').length,
    mutObserverError: window.__mutObserverError || null,
    url: location.href
  }))()`
}

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`TIMEOUT[${label}] ${ms}ms`)), ms))
  ])
}

async function responsivenessCheck(page) {
  const t0 = Date.now()
  try {
    const r = await withTimeout(page.evaluate(() => 1 + 1), 3000, 'eval')
    return { ok: true, value: r, ms: Date.now() - t0 }
  } catch (e) {
    return { ok: false, error: e.message, ms: Date.now() - t0 }
  }
}

async function runTest(browserName, launcher) {
  const log = []
  const push = (...args) => {
    const s = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')
    log.push(`[${browserName}] ${s}`)
    console.log(`[${browserName}] ${s}`)
  }
  const result = { browser: browserName, log, snapshots: [], events: [], crashed: false, crashStep: null }

  let browser, context, page
  try {
    push('launching...')
    browser = await launcher.launch({ headless: true })
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: browserName === 'webkit'
        ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
        : undefined
    })
    await context.addInitScript(INIT_SCRIPT)

    page = await context.newPage()
    page.on('console', msg => {
      if (['error','warning'].includes(msg.type())) {
        result.events.push({ kind: 'console.' + msg.type(), text: msg.text().slice(0, 500) })
      }
    })
    page.on('pageerror', err => result.events.push({ kind: 'pageerror', text: String(err.message || err).slice(0, 500) }))
    page.on('crash', () => { result.crashed = true; push('!!! page CRASH event'); })
    page.on('close', () => push('page closed'))

    const reqs = []
    page.on('request', r => reqs.push({ url: r.url(), method: r.method(), t: Date.now() }))

    push('navigating to', URL)
    const navStart = Date.now()
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 })
    } catch (e) {
      push('goto error (continuing):', e.message.split('\n')[0])
    }
    push('navigated in', Date.now() - navStart, 'ms')

    // Initial snapshot
    let snap = await withTimeout(page.evaluate(snapshotScript()), 5000, 'snap-initial').catch(e => ({ error: e.message }))
    result.snapshots.push({ label: 'after-load', ...snap })
    push('after-load snapshot:', JSON.stringify(snap))

    // 30-second idle observation (no interaction)
    push('observing 30s idle...')
    const idleReqsBefore = reqs.length
    await page.waitForTimeout(30000).catch(() => {})
    snap = await withTimeout(page.evaluate(snapshotScript()), 5000, 'snap-idle').catch(e => ({ error: e.message }))
    result.snapshots.push({ label: 'after-30s-idle', ...snap })
    push('after-30s-idle snapshot:', JSON.stringify(snap))
    push('network requests during idle:', reqs.length - idleReqsBefore)

    // Check the CPU facet exists
    const cpuExists = await page.locator('[data-facet-dropdown="CPU"]').count()
    push('CPU facet dropdown count:', cpuExists)
    if (cpuExists === 0) {
      // Try to find any facet button
      const facets = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('[data-facet-dropdown]'))
        return all.map(e => e.getAttribute('data-facet-dropdown'))
      }).catch(() => [])
      push('available facets:', JSON.stringify(facets))
    }

    // Single-cycle responsiveness + network capture
    const reqsBeforeCycle = reqs.length
    push('--- single chip cycle (responsiveness test) ---')
    let respBeforeClick = await responsivenessCheck(page)
    push('responsiveness pre-click:', JSON.stringify(respBeforeClick))

    try {
      await withTimeout(page.click('[data-facet-dropdown="CPU"]', { timeout: 5000 }), 6000, 'open-cpu')
      await page.waitForTimeout(300)
      // Click first chip-like option in the popover
      const chipSelector = '[role="option"], [data-facet-chip], [role="dialog"] button, [role="menu"] button'
      const chipBefore = await page.evaluate((sel) => {
        const el = document.querySelector(sel)
        return el ? { tag: el.tagName, text: (el.textContent||'').slice(0,40), ariaPressed: el.getAttribute('aria-pressed') } : null
      }, chipSelector)
      push('first chip target:', JSON.stringify(chipBefore))
      const respDuring = await responsivenessCheck(page)
      push('responsiveness with popover open:', JSON.stringify(respDuring))

      await withTimeout(page.click(chipSelector, { timeout: 5000 }), 6000, 'click-chip')
      await page.waitForTimeout(1500)

      const respAfter = await responsivenessCheck(page)
      push('responsiveness post-click:', JSON.stringify(respAfter))

      const chipAfter = await page.evaluate((sel) => {
        const el = document.querySelector(sel)
        return el ? { tag: el.tagName, text: (el.textContent||'').slice(0,40), ariaPressed: el.getAttribute('aria-pressed') } : null
      }, chipSelector).catch(e => ({ error: e.message }))
      push('first chip after click:', JSON.stringify(chipAfter))
    } catch (e) {
      push('single-cycle error:', e.message.split('\n')[0])
    }

    snap = await withTimeout(page.evaluate(snapshotScript()), 5000, 'snap-1cycle').catch(e => ({ error: e.message }))
    result.snapshots.push({ label: 'after-1-cycle', ...snap })
    push('after-1-cycle snapshot:', JSON.stringify(snap))
    const cycleReqs = reqs.slice(reqsBeforeCycle).map(r => r.url.replace('https://glitchtech.io',''))
    push('requests during single cycle (' + cycleReqs.length + '):', JSON.stringify(cycleReqs.slice(0, 30)))
    result.singleCycleRequests = cycleReqs

    // 10-cycle stress
    push('--- starting 10-cycle stress test ---')
    for (let i = 1; i <= 10; i++) {
      const t0 = Date.now()
      try {
        // Close any existing popover by Escape
        await page.keyboard.press('Escape').catch(() => {})
        await page.waitForTimeout(150)
        await withTimeout(page.click('[data-facet-dropdown="CPU"]', { timeout: 4000, force: true }), 5000, `cycle${i}-open`)
        await page.waitForTimeout(200)
        await withTimeout(page.click('[role="option"], [data-facet-chip], [role="dialog"] button, [role="menu"] button', { timeout: 4000, force: true }), 5000, `cycle${i}-chip`)
        await page.waitForTimeout(800)
        const resp = await responsivenessCheck(page)
        const s = await withTimeout(page.evaluate(snapshotScript()), 4000, `snap-c${i}`).catch(e => ({ error: e.message }))
        push(`cycle ${i} ok in ${Date.now()-t0}ms domNodes=${s.domNodes} listeners=${s.counters?.listenerCount} raf=${s.counters?.rafCount} mut=${s.counters?.mutationCount} resp=${resp.ok?resp.ms+'ms':'FAIL:'+resp.error}`)
        result.snapshots.push({ label: `cycle-${i}`, durMs: Date.now()-t0, resp, ...s })
        if (!resp.ok) {
          push(`!!! responsiveness FAILED at cycle ${i} -> stopping`)
          result.crashStep = `cycle-${i}-unresponsive`
          break
        }
      } catch (e) {
        push(`cycle ${i} ERROR: ${e.message.split('\n')[0]}`)
        result.crashStep = `cycle-${i}-${e.message.split('\n')[0]}`
        // Try a final responsiveness probe
        const resp = await responsivenessCheck(page)
        push(`post-error responsiveness:`, JSON.stringify(resp))
        if (!resp.ok || page.isClosed()) {
          result.crashed = true
          break
        }
      }
    }

    // Final screenshot
    try {
      await page.screenshot({ path: `${ARTIFACTS_DIR}/${browserName}-final.png`, fullPage: false, timeout: 5000 })
      push('screenshot saved')
    } catch (e) {
      push('screenshot failed:', e.message.split('\n')[0])
    }

    // Final snapshot + page errors collection
    snap = await withTimeout(page.evaluate(snapshotScript()), 5000, 'snap-final').catch(e => ({ error: e.message }))
    result.snapshots.push({ label: 'final', ...snap })
    push('final snapshot:', JSON.stringify(snap))

  } catch (e) {
    push('FATAL:', e.message)
    result.fatalError = e.message
  } finally {
    try { await context?.close() } catch {}
    try { await browser?.close() } catch {}
  }
  return result
}

const browsers = [
  ['chromium', chromium],
  ['firefox', firefox],
  ['webkit', webkit],
]

const allResults = {}
for (const [name, launcher] of browsers) {
  console.log('\n========================================')
  console.log(`=== ${name.toUpperCase()} ===`)
  console.log('========================================\n')
  try {
    allResults[name] = await runTest(name, launcher)
  } catch (e) {
    console.log(`[${name}] OUTER ERROR:`, e.message)
    allResults[name] = { error: e.message }
  }
}

fs.writeFileSync(`${ARTIFACTS_DIR}/results.json`, JSON.stringify(allResults, null, 2))
console.log('\n\n=== SUMMARY TABLE ===')
const headers = ['browser','crashed','crashStep','final domNodes','final listeners','final raf','final mut','final heap used']
console.log(headers.join(' | '))
for (const [name, r] of Object.entries(allResults)) {
  const f = r.snapshots?.[r.snapshots.length-1] || {}
  console.log([
    name,
    r.crashed,
    r.crashStep || '-',
    f.domNodes,
    f.counters?.listenerCount,
    f.counters?.rafCount,
    f.counters?.mutationCount,
    f.heap?.used
  ].join(' | '))
}
console.log('\nartifacts in', ARTIFACTS_DIR)
