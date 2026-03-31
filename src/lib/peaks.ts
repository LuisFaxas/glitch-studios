import "server-only"
import decode from "audio-decode"
import { r2Client } from "@/lib/r2"
import { GetObjectCommand } from "@aws-sdk/client-s3"

export async function extractPeaks(
  audioKey: string,
  peakCount: number = 256
): Promise<number[]> {
  // 1. Download audio buffer from R2
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: audioKey,
  })
  const response = await r2Client.send(command)
  const arrayBuffer = await response.Body!.transformToByteArray()

  // 2. Decode to PCM using audio-decode (WASM, no native deps)
  const audioBuffer = await decode(new Uint8Array(arrayBuffer))
  const samples = audioBuffer.channelData[0] // mono or left channel

  // 3. Extract peaks by bucketing
  const bucketSize = Math.floor(samples.length / peakCount)
  const peaks: number[] = []
  for (let i = 0; i < peakCount; i++) {
    let max = 0
    const start = i * bucketSize
    const end = Math.min(start + bucketSize, samples.length)
    for (let j = start; j < end; j++) {
      const abs = Math.abs(samples[j])
      if (abs > max) max = abs
    }
    peaks.push(max)
  }

  // 4. Normalize to 0-1 range
  const maxPeak = Math.max(...peaks)
  if (maxPeak > 0) {
    for (let i = 0; i < peaks.length; i++) {
      peaks[i] = peaks[i] / maxPeak
    }
  }

  return peaks
}

/**
 * Generate realistic-looking synthetic peaks for testing/fallback.
 * NOT for production -- use extractPeaks with real audio.
 */
export function generateSyntheticPeaks(count: number = 256): number[] {
  const peaks: number[] = []
  for (let i = 0; i < count; i++) {
    // Create a natural-looking waveform shape
    const t = i / count
    const envelope = Math.sin(t * Math.PI) * 0.4 + 0.3
    const noise = Math.random() * 0.5
    const value = Math.min(1, envelope + noise * 0.5)
    peaks.push(value)
  }
  // Normalize
  const max = Math.max(...peaks)
  return peaks.map((p) => p / max)
}
