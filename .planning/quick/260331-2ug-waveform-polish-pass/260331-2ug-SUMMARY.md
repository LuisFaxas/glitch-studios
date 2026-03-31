---
phase: quick
plan: 260331-2ug
subsystem: player/waveform
tags: [waveform, polish, player-bar, sidebar-widget, beat-row]
dependency_graph:
  requires: []
  provides: [full-bleed-widget-waveform, working-wavesurfer-gradient, interactive-row-waveforms, row-duration-display]
  affects: [widget-now-playing, player-bar, beat-row]
tech_stack:
  added: []
  patterns: [wavesurfer-own-canvas-gradient, absolute-waveform-background]
key_files:
  created: []
  modified:
    - src/components/tiles/widget-now-playing.tsx
    - src/components/player/player-bar.tsx
    - src/components/beats/beat-row.tsx
decisions:
  - "WaveSurfer gradient from its own canvas context (not offscreen) to avoid black bar"
  - "Widget waveform uses semi-transparent colors as background layer"
  - "Row duration shows --:-- for non-active beats (no duration in BeatSummary type)"
metrics:
  duration: ~3min
  completed: "2026-03-31"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Quick Task 260331-2ug: Waveform Polish Pass Summary

Fix four waveform issues: sidebar widget waveform too small, player bar black bar, list row non-interactive waveforms, missing duration display.

**One-liner:** Full-bleed widget waveform background, WaveSurfer gradient fix via own canvas context, interactive list row waveforms with duration.

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Full-bleed waveform background in sidebar widget | 217468c | Absolute-positioned waveform fills entire tile; semi-transparent gradient; track info overlays with z-10 |
| 2 | Player bar gradient fix + list row interactivity/duration | 285e935 | Removed offscreen canvas hack; gradient via ws.on('ready'); beat rows interactive with onSeek; duration display |

## Key Changes

### Sidebar Widget (widget-now-playing.tsx)
- Waveform wrapped in `absolute inset-0 z-0` div, fills entire tile
- Semi-transparent gradient colors (rgba) for subtle background effect
- Track info and controls overlaid with `relative z-10`
- Height set to 200 (ResizeObserver + 100% CSS constrains to actual tile)

### Player Bar (player-bar.tsx)
- Removed offscreen canvas gradient creation (lines 54-62) -- cross-canvas gradients render as black
- Initial flat colors (#444444 / #f5f5f0) applied at WaveSurfer.create()
- `ws.on('ready')` handler queries WaveSurfer's own canvas, creates gradient from that context, applies via `ws.setOptions()`

### Beat Row (beat-row.tsx)
- Waveform changed from `interactive={false}` to `interactive` with `onSeek={handleRowSeek}`
- handleRowSeek: seeks if current beat, starts playback if different beat
- Duration display added between waveform and BPM/Key badges
- Shows formatted time for active beat, "--:--" for others (BeatSummary lacks duration field)

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

- Beat row duration shows "--:--" for non-active beats because `BeatSummary` type has no `duration` field. Future enhancement: add duration to seed data and BeatSummary type.

## Self-Check: PASSED
