// Bit-perfect verification: every frame of the encoded .mov must byte-match
// one of the raw captured PNGs. If any frame's RGBA pixel buffer diverges by
// even a single byte, the encoder is silently lying about the output and we
// fail the render.
//
// This is the core safety net of the brand-engine. It's what proved the
// hero-tech .mov was clean (0/120 mismatches). It's what would have caught
// the ProRes 4444 green-channel drift at the QRS spike on the very first run.
import { spawn } from "node:child_process"
import { readdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { writeFileSync, readFileSync, unlinkSync } from "node:fs"
import { createHash } from "node:crypto"

export async function verifyBitPerfect({ movPath, framesDir, asset, outputFps = 60 }) {
  const loopSeconds = asset.loopMs / 1000
  const totalMovFrames = Math.round(outputFps * loopSeconds)

  // Build a hash set of every raw captured PNG's RGBA pixel buffer
  const rawFiles = (await readdir(framesDir)).filter((f) => f.endsWith(".png"))
  const rawHashes = new Set()
  for (const f of rawFiles) {
    const hash = await hashRgba(join(framesDir, f))
    rawHashes.add(hash)
  }

  // For each output frame in the .mov, hash its RGBA buffer and assert it
  // matches one of the raw frames. Cheaper than cmp -l (no temp files), and
  // gives us O(1) lookup against the raw set.
  let mismatches = 0
  const mismatchSamples = []
  for (let f = 0; f < totalMovFrames; f++) {
    const hash = await hashRgbaFromMov(movPath, f)
    if (!rawHashes.has(hash)) {
      mismatches++
      if (mismatchSamples.length < 5) mismatchSamples.push(f)
    }
  }

  return { totalMovFrames, mismatches, mismatchSamples }
}

function hashRgba(pngPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-i", pngPath, "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
      { stdio: ["ignore", "pipe", "ignore"] },
    )
    const hash = createHash("sha256")
    proc.stdout.on("data", (chunk) => hash.update(chunk))
    proc.on("error", reject)
    proc.on("exit", (code) => {
      if (code === 0) resolve(hash.digest("hex"))
      else reject(new Error(`ffmpeg hash failed for ${pngPath} (exit ${code})`))
    })
  })
}

function hashRgbaFromMov(movPath, frameIdx) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-hide_banner", "-loglevel", "error",
        "-i", movPath,
        "-vf", `select=eq(n\\,${frameIdx})`,
        "-frames:v", "1",
        "-f", "rawvideo", "-pix_fmt", "rgba", "-",
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    )
    const hash = createHash("sha256")
    proc.stdout.on("data", (chunk) => hash.update(chunk))
    proc.on("error", reject)
    proc.on("exit", (code) => {
      if (code === 0) resolve(hash.digest("hex"))
      else reject(new Error(`ffmpeg mov frame extract failed for ${movPath} frame ${frameIdx} (exit ${code})`))
    })
  })
}
