// Playwright + raw CDP screenshot loop. Generic over asset definition.
//
// The capture pipeline (the proven hero-tech formula, generalized):
//   1. Launch headless Chromium at the asset's declared viewport
//   2. Navigate to /export/<asset.id>?<query>
//   3. Wait for the export client to mark itself ready (document.body.dataset.exportReady === "true")
//   4. Wait for fonts + image assets to decode
//   5. Pause briefly so the template's brand-flicker overlay can fade
//   6. Set Emulation.setDefaultBackgroundColorOverride alpha=0 for true transparency
//   7. Call window.__armCapture() — mounts the animated subtree at phase 0
//   8. Wait one rAF tick so the React commit + first paint complete
//   9. Real-time CDP Page.captureScreenshot loop for the asset's loopMs duration
//  10. Save each frame's raw timestamp; emit a concat manifest with per-frame durations
//
// Returns { framesDir, concatPath, totalFrames, captureSeconds, effectiveFps }.
import { chromium } from "playwright"
import { mkdir, rm, readdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

export async function captureAsset({ asset, queryString, framesDir, concatPath, devUrlBase = "http://localhost:3010" }) {
  await rm(framesDir, { recursive: true, force: true })
  await mkdir(framesDir, { recursive: true })

  const url = `${devUrlBase}${asset.route}${queryString ? `?${queryString}` : ""}`

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: asset.viewport.width, height: asset.viewport.height },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  })
  const page = await context.newPage()

  console.log(`[brand-engine] navigating ${url}`)
  const resp = await page.goto(url, { waitUntil: "domcontentloaded" })
  if (!resp || !resp.ok()) {
    await browser.close()
    throw new Error(`Failed to load ${url} — status ${resp?.status()}. Is the dev server running on ${devUrlBase}?`)
  }

  await page.waitForSelector("#export-root", { state: "attached", timeout: 10000 })
  await page.waitForFunction(
    () => document.body.dataset.exportReady === "true" && typeof window.__armCapture === "function",
    null,
    { timeout: 10000 },
  )
  await page.evaluate(() => document.fonts.ready)
  // Probe-decode any /logo-white.png the asset might use; harmless if absent
  await page.evaluate(async () => {
    try {
      const probe = new Image()
      probe.src = "/logo-white.png"
      await probe.decode().catch(() => {})
    } catch {}
  })

  // Let the template's brand-flicker overlay (z-50, opacity-0.6 → 0 over ~200ms) finish.
  await page.waitForTimeout(400)

  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
    color: { r: 0, g: 0, b: 0, a: 0 },
  })

  // Arm: mount the animated subtree → animation phase 0 begins on the React commit.
  // Wait one double-rAF tick so the first paint completes before our capture loop
  // begins. Capture frame 0 lands within ~16ms of phase 0.
  await page.evaluate(() => window.__armCapture?.())
  await page.evaluate(
    () =>
      new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r(undefined))),
      ),
  )

  // Capture slightly past the loop duration so the final output frame at
  // t = loopMs - 1/fps always has well-defined source data — without this
  // buffer, ffmpeg's `fps=60` filter occasionally picks a frame just outside
  // its boundary lookup window for the very last output frame, producing one
  // bit-mismatched frame per render. 60ms is one full frame at 60fps + slack.
  const captureMs = asset.loopMs + 60
  console.log(`[brand-engine] capturing ${asset.loopMs}ms of animation starting at phase 0 (+60ms buffer)`)
  const timestamps = []
  const pendingWrites = []
  const t0 = Date.now()
  let i = 0
  while (Date.now() - t0 < captureMs) {
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      optimizeForSpeed: true,
    })
    const path = join(framesDir, `${String(i).padStart(6, "0")}.png`)
    pendingWrites.push(writeFile(path, Buffer.from(data, "base64")))
    timestamps.push((Date.now() - t0) / 1000)
    i++
    if (i % 30 === 0) {
      process.stdout.write(`  ${i} frames @ ${(timestamps[i - 1] * 1000).toFixed(0)}ms\n`)
    }
  }
  await Promise.all(pendingWrites)
  await browser.close()

  const totalFrames = i
  const captureSeconds = timestamps[totalFrames - 1]
  const effectiveFps = totalFrames / captureSeconds

  // Sanity: verify the on-disk count matches what we recorded
  const onDisk = (await readdir(framesDir)).filter((f) => f.endsWith(".png")).length
  if (onDisk !== totalFrames) {
    throw new Error(`Expected ${totalFrames} PNGs in ${framesDir}, found ${onDisk}`)
  }

  // Build the ffmpeg concat manifest. Each captured frame holds for its real
  // wall-clock duration to the next frame. The last frame fills out to loopMs.
  // ffmpeg's concat demuxer requires the final `file` line to be repeated, or
  // its duration is silently dropped.
  const lines = []
  const loopSeconds = asset.loopMs / 1000
  for (let j = 0; j < totalFrames; j++) {
    const framePath = join(framesDir, `${String(j).padStart(6, "0")}.png`)
    const nextT = j + 1 < totalFrames ? timestamps[j + 1] : loopSeconds
    const duration = Math.max(0.001, nextT - timestamps[j])
    lines.push(`file '${framePath}'`)
    lines.push(`duration ${duration.toFixed(6)}`)
  }
  lines.push(`file '${join(framesDir, `${String(totalFrames - 1).padStart(6, "0")}.png`)}'`)
  await writeFile(concatPath, lines.join("\n") + "\n")

  console.log(
    `[brand-engine] captured ${totalFrames} frames over ${captureSeconds.toFixed(3)}s` +
    ` (effective ${effectiveFps.toFixed(1)}fps native)`,
  )

  return { framesDir, concatPath, totalFrames, captureSeconds, effectiveFps }
}
