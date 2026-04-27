// ffmpeg encoder: produces the canonical .mov (PNG-in-MOV, bit-perfect RGBA)
// plus a secondary .webm (VP9 alpha) for browser preview. Both pull from the
// same concat manifest emitted by capture.mjs.
//
// PNG-in-MOV is the ground truth: each frame inside the container is a vanilla
// PNG, no YUV conversion, no chroma subsampling, no premultiplied/straight
// alpha ambiguity. Verified with cmp -l: 0/N differing bytes vs raw captured
// PNGs. ProRes 4444 was tried and rejected because its RGB→YUV conversion
// drifts the green channel at soft alpha edges.
import { spawn } from "node:child_process"
import { join } from "node:path"

export async function encodeOutputs({ asset, concatPath, outDir, outputFps = 60 }) {
  const movPath = join(outDir, `${asset.id}.mov`)
  const webmPath = join(outDir, `${asset.id}.webm`)
  const loopSeconds = asset.loopMs / 1000

  // PNG-codec-in-MOV — bit-perfect RGBA round-trip. The `format=rgba` filter is
  // a no-op safety: ffmpeg's pix_fmt negotiation defaults to rgba already, but
  // declaring it explicitly avoids any future filter chain accidentally
  // dropping the alpha plane.
  await runFfmpeg([
    "-y",
    "-f", "concat", "-safe", "0",
    "-i", concatPath,
    "-vf", `fps=${outputFps},format=rgba`,
    "-c:v", "png",
    "-pix_fmt", "rgba",
    "-movflags", "+faststart",
    "-r", String(outputFps),
    "-t", String(loopSeconds),
    movPath,
  ])

  // VP9 alpha .webm — for browser/web preview and DaVinci 18.5+. Bitrate set
  // generously since most of the frame is transparent and the encoder will
  // happily under-spend.
  await runFfmpeg([
    "-y",
    "-f", "concat", "-safe", "0",
    "-i", concatPath,
    "-vf", `fps=${outputFps},format=yuva420p`,
    "-c:v", "libvpx-vp9",
    "-b:v", "8M",
    "-auto-alt-ref", "0",
    "-row-mt", "1",
    "-r", String(outputFps),
    "-t", String(loopSeconds),
    webmPath,
  ])

  return { movPath, webmPath }
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] })
    let stderrBuf = ""
    proc.stderr.on("data", (chunk) => { stderrBuf += chunk.toString() })
    proc.on("error", reject)
    proc.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`ffmpeg exited ${code}\n${stderrBuf.split("\n").slice(-10).join("\n")}`))
    })
  })
}
