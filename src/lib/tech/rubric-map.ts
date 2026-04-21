/**
 * Rubric v1.1 canonical map.
 *
 * Authoritative source for the (discipline, tool, field) -> tech_benchmark_tests row mapping.
 * Phase 16 ingest uses this to translate JSONL lines into test-id lookups.
 * Phase 17/18 code uses this to address specific tests by stable key (no name matching).
 *
 * APPEND-ONLY (D-14): a mistake here requires rubric v1.2. Never mutate existing entries.
 *
 * Adding a 14th discipline requires a new pgEnum value on benchmark_discipline,
 * which is an ALTER TYPE ADD VALUE statement that cannot run inside a transaction
 * in older Postgres versions — author that as a standalone migration file (not inline).
 */

export type BenchmarkDiscipline =
  | "cpu" | "gpu" | "llm" | "video" | "dev" | "python" | "games"
  | "memory" | "storage" | "thermal" | "wireless" | "display" | "battery_life"

export type BenchmarkMode = "ac" | "battery" | "both"
export type BenchmarkDirection = "higher_is_better" | "lower_is_better"

export interface RubricTestSpec {
  discipline: BenchmarkDiscipline
  tool: string
  field: string
  name: string
  unit: string
  direction: BenchmarkDirection
  mode: BenchmarkMode
  bprEligible: boolean
  sortOrder: number
}

/**
 * Key format: `<discipline>:<tool>:<field>` (D-15).
 * All lowercase, colon-separated, no spaces.
 */
export const RUBRIC_V1_1: Record<string, RubricTestSpec> = {
  // --- CPU (BPR-eligible, mode='both') --- RESEARCH §3.1 ---
  "cpu:geekbench6:multi": {
    discipline: "cpu", tool: "geekbench6", field: "multi",
    name: "Geekbench 6 Multi-Core", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 101,
  },
  "cpu:geekbench6:single": {
    discipline: "cpu", tool: "geekbench6", field: "single",
    name: "Geekbench 6 Single-Core", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 102,
  },
  "cpu:cinebench2024:multi": {
    discipline: "cpu", tool: "cinebench2024", field: "multi",
    name: "Cinebench 2024 Multi", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 103,
  },
  "cpu:cinebench2024:single": {
    discipline: "cpu", tool: "cinebench2024", field: "single",
    name: "Cinebench 2024 Single", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 104,
  },
  "cpu:hyperfine:ripgrep_cargo": {
    discipline: "cpu", tool: "hyperfine", field: "ripgrep_cargo_mean_s",
    name: "ripgrep cargo (mean)", unit: "seconds",
    direction: "lower_is_better", mode: "both", bprEligible: true, sortOrder: 105,
  },

  // --- GPU (BPR-eligible, mode='both') --- RESEARCH §3.2 ---
  "gpu:3dmark:wild_life_extreme": {
    discipline: "gpu", tool: "3dmark", field: "wild_life_extreme",
    name: "3DMark Wild Life Extreme", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 201,
  },
  "gpu:3dmark:steel_nomad_light": {
    discipline: "gpu", tool: "3dmark", field: "steel_nomad_light",
    name: "3DMark Steel Nomad Light", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 202,
  },
  "gpu:3dmark:solar_bay": {
    discipline: "gpu", tool: "3dmark", field: "solar_bay",
    name: "3DMark Solar Bay", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 203,
  },
  "gpu:blender:monster": {
    discipline: "gpu", tool: "blender", field: "monster_samples_per_min",
    name: "Blender Monster", unit: "samples/min",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 204,
  },
  "gpu:blender:classroom": {
    discipline: "gpu", tool: "blender", field: "classroom_samples_per_min",
    name: "Blender Classroom", unit: "samples/min",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 205,
  },

  // --- Memory (mode='ac', NOT BPR-eligible) --- RESEARCH §3.3 ---
  "memory:stream:triad": {
    discipline: "memory", tool: "stream", field: "triad_gb_s",
    name: "STREAM Triad", unit: "GB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 301,
  },
  "memory:stream:copy": {
    discipline: "memory", tool: "stream", field: "copy_gb_s",
    name: "STREAM Copy", unit: "GB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 302,
  },

  // --- Storage (mode='ac', NOT BPR-eligible) --- RESEARCH §3.3 ---
  "storage:amorphous:seq_read": {
    discipline: "storage", tool: "amorphous", field: "seq_read_mb_s",
    name: "AmorphousDiskMark Seq Read", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 311,
  },
  "storage:amorphous:seq_write": {
    discipline: "storage", tool: "amorphous", field: "seq_write_mb_s",
    name: "AmorphousDiskMark Seq Write", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 312,
  },
  "storage:amorphous:rnd4k_read": {
    discipline: "storage", tool: "amorphous", field: "rnd4k_read_mb_s",
    name: "AmorphousDiskMark Rnd 4K Read", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 313,
  },
  "storage:amorphous:rnd4k_write": {
    discipline: "storage", tool: "amorphous", field: "rnd4k_write_mb_s",
    name: "AmorphousDiskMark Rnd 4K Write", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 314,
  },

  // --- LLM (BPR-eligible, mode='both') --- RESEARCH §3.4 ---
  "llm:llama_bench:tg128": {
    discipline: "llm", tool: "llama_bench", field: "tg128",
    name: "llama.cpp tg128", unit: "tok/s",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 401,
  },
  "llm:llama_bench:pp512": {
    discipline: "llm", tool: "llama_bench", field: "pp512",
    name: "llama.cpp pp512", unit: "tok/s",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 402,
  },
  "llm:mlx_lm:tg128": {
    discipline: "llm", tool: "mlx_lm", field: "tg128",
    name: "MLX-LM tg128", unit: "tok/s",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 403,
  },

  // --- Video (BPR-eligible, mode='both') --- RESEARCH §3.5 ---
  "video:handbrake:h264_1080p": {
    discipline: "video", tool: "handbrake", field: "h264_1080p_fps",
    name: "HandBrakeCLI H.264 1080p", unit: "fps",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 501,
  },
  "video:handbrake:hevc_4k": {
    discipline: "video", tool: "handbrake", field: "hevc_4k_fps",
    name: "HandBrakeCLI HEVC 4K", unit: "fps",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 502,
  },
  "video:ffmpeg:av1_encode": {
    discipline: "video", tool: "ffmpeg", field: "av1_encode_fps",
    name: "FFmpeg AV1 encode", unit: "fps",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 503,
  },

  // --- Dev / Compile (BPR-eligible, mode='both') --- RESEARCH §3.6 ---
  "dev:cargo:build_release": {
    discipline: "dev", tool: "cargo", field: "build_release_s",
    name: "cargo build --release", unit: "seconds",
    direction: "lower_is_better", mode: "both", bprEligible: true, sortOrder: 601,
  },
  "dev:xcodebuild:clean_build": {
    discipline: "dev", tool: "xcodebuild", field: "clean_build_s",
    name: "xcodebuild clean build", unit: "seconds",
    direction: "lower_is_better", mode: "both", bprEligible: true, sortOrder: 602,
  },
  "dev:npm:tsc_cold": {
    discipline: "dev", tool: "npm", field: "tsc_cold_s",
    name: "tsc --noEmit (cold)", unit: "seconds",
    direction: "lower_is_better", mode: "both", bprEligible: true, sortOrder: 603,
  },

  // --- Python (BPR-eligible, mode='both') --- RESEARCH §3.7 ---
  "python:pyperformance:geomean": {
    discipline: "python", tool: "pyperformance", field: "geomean",
    name: "pyperformance geomean", unit: "score",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 701,
  },
  "python:pytorch_mps:train_resnet": {
    discipline: "python", tool: "pytorch_mps", field: "train_resnet_samples_per_s",
    name: "PyTorch MPS ResNet train", unit: "samples/s",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 702,
  },

  // --- Games (BPR-eligible, mode='both') --- RESEARCH §3.8 ---
  "games:bg3:avg_fps": {
    discipline: "games", tool: "bg3", field: "avg_fps",
    name: "Baldur's Gate 3 (avg fps)", unit: "fps",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 801,
  },
  "games:cyberpunk_gptk:avg_fps": {
    discipline: "games", tool: "cyberpunk_gptk", field: "avg_fps",
    name: "Cyberpunk 2077 (GPTK, avg fps)", unit: "fps",
    direction: "higher_is_better", mode: "both", bprEligible: true, sortOrder: 802,
  },

  // --- Thermal (mode='ac', NOT BPR-eligible) --- RESEARCH §3.9 ---
  "thermal:cinebench_loop:score_retention_pct": {
    discipline: "thermal", tool: "cinebench_loop", field: "score_retention_pct",
    name: "Cinebench 10-min loop retention", unit: "percent",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 901,
  },
  "thermal:stress_ng:peak_package_c": {
    discipline: "thermal", tool: "stress_ng", field: "peak_package_c",
    name: "stress-ng peak SoC temp", unit: "celsius",
    direction: "lower_is_better", mode: "ac", bprEligible: false, sortOrder: 902,
  },

  // --- Battery Life (mode='battery', NOT BPR-eligible) --- RESEARCH §3.10 ---
  "battery_life:video_loop:hours": {
    discipline: "battery_life", tool: "video_loop", field: "hours",
    name: "Video loop (local 1080p)", unit: "hours",
    direction: "higher_is_better", mode: "battery", bprEligible: false, sortOrder: 1001,
  },
  "battery_life:safari_youtube:hours": {
    discipline: "battery_life", tool: "safari_youtube", field: "hours",
    name: "Safari YouTube stream", unit: "hours",
    direction: "higher_is_better", mode: "battery", bprEligible: false, sortOrder: 1002,
  },
  "battery_life:web_rotation:hours": {
    discipline: "battery_life", tool: "web_rotation", field: "hours",
    name: "Web browsing rotation", unit: "hours",
    direction: "higher_is_better", mode: "battery", bprEligible: false, sortOrder: 1003,
  },
  "battery_life:cinebench_drain:hours_to_20pct": {
    discipline: "battery_life", tool: "cinebench_drain", field: "hours_to_20pct",
    name: "Cinebench drain to 20%", unit: "hours",
    direction: "higher_is_better", mode: "battery", bprEligible: false, sortOrder: 1004,
  },
  "battery_life:standby:drain_pct_per_8h": {
    discipline: "battery_life", tool: "standby", field: "drain_pct_per_8h",
    name: "Overnight standby drain", unit: "%/8h",
    direction: "lower_is_better", mode: "battery", bprEligible: false, sortOrder: 1005,
  },

  // --- Wireless (mode='ac', NOT BPR-eligible) --- RESEARCH §3.11 ---
  "wireless:iperf3:wifi_down_mbps": {
    discipline: "wireless", tool: "iperf3", field: "wifi_down_mbps",
    name: "iperf3 Wi-Fi down", unit: "Mbps",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1101,
  },
  "wireless:iperf3:wifi_up_mbps": {
    discipline: "wireless", tool: "iperf3", field: "wifi_up_mbps",
    name: "iperf3 Wi-Fi up", unit: "Mbps",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1102,
  },
  "wireless:tb5:read_mb_s": {
    discipline: "wireless", tool: "tb5", field: "read_mb_s",
    name: "TB5 SSD read", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1103,
  },
  "wireless:tb5:write_mb_s": {
    discipline: "wireless", tool: "tb5", field: "write_mb_s",
    name: "TB5 SSD write", unit: "MB/s",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1104,
  },

  // --- Display (mode='ac', NOT BPR-eligible) --- RESEARCH §3.12 ---
  "display:displaycal:delta_e_avg": {
    discipline: "display", tool: "displaycal", field: "delta_e_avg",
    name: "DisplayCAL delta-E average", unit: "delta-E",
    direction: "lower_is_better", mode: "ac", bprEligible: false, sortOrder: 1201,
  },
  "display:displaycal:gamut_p3_pct": {
    discipline: "display", tool: "displaycal", field: "gamut_p3_pct",
    name: "DisplayCAL P3 gamut", unit: "percent",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1202,
  },
  "display:lagom:contrast_ratio": {
    discipline: "display", tool: "lagom", field: "contrast_ratio",
    name: "Lagom contrast ratio", unit: "ratio",
    direction: "higher_is_better", mode: "ac", bprEligible: false, sortOrder: 1203,
  },
} as const

/**
 * The 7 BPR-eligible disciplines (used by Phase 16 BPR computation).
 * Any change here is a new rubric version, not a mutation.
 */
export const BPR_ELIGIBLE_DISCIPLINES: ReadonlyArray<BenchmarkDiscipline> = [
  "cpu", "gpu", "llm", "video", "dev", "python", "games",
]
