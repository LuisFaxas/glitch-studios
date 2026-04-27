#!/usr/bin/env node
// Brand-engine CLI entry point. Renders any registered asset to a transparent
// .mov + .webm pair, then verifies the .mov is bit-perfect to the raw captured
// PNG sequence.
//
// Usage:
//   node brand-engine/render.mjs --asset hero-tech
//   node brand-engine/render.mjs --asset bpr-medal --tier platinum --score 87
//   node brand-engine/render.mjs --list
//   node brand-engine/render.mjs --all
//
// Per-asset output lands in: <out>/<asset-id>/<param-hash>/
//   ├── frames/                  raw captured PNGs (debug)
//   ├── concat.txt               ffmpeg concat manifest
//   ├── <asset-id>.mov           PNG-in-MOV (bit-perfect, DaVinci primary)
//   └── <asset-id>.webm          VP9 alpha (browser preview)
//
// See brand-engine/README.md for the methodology and DaVinci import procedure.
import { mkdir } from "node:fs/promises"
import { resolve, join } from "node:path"
import { homedir } from "node:os"
import { ASSETS, getAsset, resolveParams } from "./registry.mjs"
import { parseArgs, num } from "./lib/args.mjs"
import { captureAsset } from "./lib/capture.mjs"
import { encodeOutputs } from "./lib/encode.mjs"
import { verifyBitPerfect } from "./lib/verify.mjs"

const args = parseArgs(process.argv.slice(2))

if (args.list === "true") {
  printList()
  process.exit(0)
}

if (args.all === "true") {
  await renderAll(args)
  process.exit(0)
}

if (!args.asset) {
  console.error("Usage: node brand-engine/render.mjs --asset <id> [--<param> <value> ...]")
  console.error("       node brand-engine/render.mjs --list")
  console.error("       node brand-engine/render.mjs --all")
  process.exit(1)
}

await renderOne(args.asset, args)

async function renderOne(assetId, rawArgs) {
  const asset = getAsset(assetId)
  if (!asset) {
    console.error(`Unknown asset "${assetId}". Available: ${ASSETS.map((a) => a.id).join(", ")}`)
    process.exit(1)
  }

  const params = resolveParams(asset, rawArgs)
  const outputFps = num(rawArgs["output-fps"] ?? rawArgs.fps, 60)
  const devUrlBase = rawArgs.url ?? "http://localhost:3010"

  // Default: <project>/exports/<asset-id>/<param-hash>/
  const projectExports = rawArgs.out ?? "./exports"
  const paramHash = asset.paramHash(params)
  const outDir = resolve(projectExports, asset.id, paramHash)
  const framesDir = join(outDir, "frames")
  const concatPath = join(outDir, "concat.txt")

  await mkdir(outDir, { recursive: true })

  console.log(`[brand-engine] rendering ${asset.id}`)
  console.log(`  params: ${JSON.stringify(params)}`)
  console.log(`  outDir: ${outDir}`)
  console.log(`  loop:   ${asset.loopMs}ms @ ${outputFps}fps, ${asset.viewport.width}x${asset.viewport.height}`)

  const queryString = asset.buildQuery(params)

  const { totalFrames, captureSeconds, effectiveFps } = await captureAsset({
    asset,
    queryString,
    framesDir,
    concatPath,
    devUrlBase,
  })

  const { movPath, webmPath } = await encodeOutputs({
    asset,
    concatPath,
    outDir,
    outputFps,
  })

  console.log(`[brand-engine] verifying ${movPath} is bit-perfect...`)
  const { totalMovFrames, mismatches, mismatchSamples } = await verifyBitPerfect({
    movPath,
    framesDir,
    asset,
    outputFps,
  })

  const passed = mismatches === 0
  const symbol = passed ? "✓" : "✗"
  console.log(`[brand-engine] verification: ${totalMovFrames - mismatches}/${totalMovFrames} frames byte-match raw captures ${symbol}`)

  if (!passed) {
    console.error(`[brand-engine] BIT-PERFECT VERIFICATION FAILED for ${asset.id}`)
    console.error(`  ${mismatches} of ${totalMovFrames} encoded frames diverge from the raw captures`)
    console.error(`  Sample mismatched frame indices: ${mismatchSamples.join(", ")}`)
    console.error(`  This means the encoder is silently lying about its output. Investigate before shipping.`)
    process.exit(2)
  }

  console.log("")
  console.log(`[brand-engine] ${asset.id} rendered successfully`)
  console.log(`  ${movPath}`)
  console.log(`  ${webmPath}`)
  console.log("")
  console.log(`  DaVinci import:`)
  console.log(`    1. Drop the .mov on the timeline`)
  console.log(`    2. Right-click clip → Clip Attributes → Alpha Mode = Straight`)
  console.log(`    3. Right-click clip → Retime Process = Frame Repeat (NOT Optical Flow)`)
  console.log(`    4. Set timeline frame rate to ${outputFps}fps for clean playback`)
  if (asset.davinciNotes) console.log(`    Asset-specific: ${asset.davinciNotes}`)
}

async function renderAll(rawArgs) {
  console.log(`[brand-engine] rendering all ${ASSETS.length} assets at default params...\n`)
  for (const asset of ASSETS) {
    console.log("─".repeat(60))
    await renderOne(asset.id, rawArgs)
    console.log("")
  }
}

function printList() {
  console.log(`brand-engine — ${ASSETS.length} registered assets:\n`)
  for (const asset of ASSETS) {
    console.log(`  ${asset.id.padEnd(16)} ${asset.viewport.width}x${asset.viewport.height} @ ${asset.loopMs}ms`)
    console.log(`  ${" ".repeat(16)} ${asset.description}`)
    if (asset.defaultParams && Object.keys(asset.defaultParams).length > 0) {
      const defaults = Object.entries(asset.defaultParams)
        .map(([k, v]) => `${k}=${typeof v === "string" ? `"${v}"` : v}`)
        .join(", ")
      console.log(`  ${" ".repeat(16)} params: ${defaults}`)
    }
    console.log("")
  }
}
