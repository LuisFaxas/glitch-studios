# ElasticSlider Integration - Research

**Researched:** 2026-04-01
**Domain:** UI component replacement (slider)
**Confidence:** HIGH

## Summary

ElasticSlider from ReactBits is a single-value animated slider with spring physics. It does NOT support range mode (dual thumbs), has NO onChange callback, and is NOT controllable (no `value` prop -- only `defaultValue` with internal state). This means it CANNOT replace the BPM range slider as-is. It CAN replace the volume slider in the player bar with minor wrapping.

The BPM slider's "jumpy" behavior is caused by nuqs URL state updates on every `onValueChange` firing with `shallow: false`, which triggers server-side re-renders on each thumb drag. This is a nuqs configuration issue, not a component issue.

**Primary recommendation:** Use ElasticSlider for the volume slider only. Fix the BPM range slider jumpiness by debouncing the nuqs state update (keep Radix Slider for range). Fork/wrap ElasticSlider to add an `onChange` callback.

## ElasticSlider API (from source)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `defaultValue` | number | 50 | Initial value -- NOT controlled |
| `startingValue` | number | 0 | Minimum value |
| `maxValue` | number | 100 | Maximum value |
| `className` | string | '' | Outer container class |
| `isStepped` | boolean | false | Snap to step increments |
| `stepSize` | number | 1 | Step increment size |
| `leftIcon` | ReactNode | '-' | Icon on left side (scales on elastic overflow left) |
| `rightIcon` | ReactNode | '+' | Icon on right side (scales on elastic overflow right) |

**Missing from API:**
- No `value` prop (uncontrolled only)
- No `onChange` / `onValueChange` callback
- No range/dual-thumb mode
- No `disabled` prop
- No ARIA attributes (accessibility gap)

**Dependency:** `motion@^12.23.12` (Framer Motion v12+). Project already uses `motion/react` so this is compatible.

**Installation:**
```bash
pnpm dlx shadcn@latest add "https://reactbits.dev/r/ElasticSlider-TS-TW"
```

This copies the component source into the project (shadcn-style, not a dependency). The file will land in `src/components/ui/` or wherever shadcn is configured to output.

## Current Slider Usage (3 files)

### 1. `src/components/beats/filter-bar.tsx` (BPM range slider)
- **Type:** Range slider (dual thumb, min/max BPM)
- **Props used:** `min={60} max={200} step={1} value={bpmValues} onValueChange={...}`
- **State:** Controlled via nuqs `parseAsInteger` with `shallow: false`
- **ElasticSlider compatible:** NO -- requires range mode + onChange + controlled value
- **Fix needed:** Debounce the nuqs update to fix jumpiness

### 2. `src/components/beats/beat-filters.tsx` (BPM range slider -- legacy)
- **Type:** Same range slider pattern as filter-bar.tsx
- **Props used:** `min={60} max={200} value={bpmValues} onValueChange={...}`
- **State:** Controlled via nuqs
- **ElasticSlider compatible:** NO -- same range requirement
- **Note:** This appears to be an older filter component. Verify if still used.

### 3. `src/components/player/player-bar.tsx` (Volume slider)
- **Type:** Single-value slider
- **Props used:** `value={[isMuted ? 0 : volume]} min={0} max={100} onValueChange={handleVolumeChange}`
- **State:** Local useState (not URL state)
- **ElasticSlider compatible:** YES (with wrapper for onChange)

## BPM Slider Jumpiness -- Root Cause

The BPM slider uses nuqs with `shallow: false`, meaning every `onValueChange` event triggers a URL update AND a server-side re-render. During continuous dragging:

1. User drags thumb -> `onValueChange` fires on every pixel
2. nuqs updates URL params (`?bpmMin=X&bpmMax=Y`) on each event
3. `shallow: false` causes Next.js to re-fetch the page (server component re-render)
4. Re-render replaces the slider component, resetting thumb position mid-drag

**Fix:** Debounce the nuqs update. Use local state during drag, commit to URL on pointer-up (or after 300ms idle). The Radix Slider already separates `onValueChange` (continuous) from `onValueCommit` (pointer-up).

```tsx
// Use onValueCommit for URL update, onValueChange for visual feedback
const [localBpm, setLocalBpm] = useState(bpmValues)

<Slider
  min={60}
  max={200}
  value={localBpm}
  onValueChange={(v) => setLocalBpm(v as number[])} // visual only
  onValueCommit={(v) => {                            // URL update
    const values = v as number[]
    setBpmMin(values[0] === 60 ? null : values[0])
    setBpmMax(values[1] === 200 ? null : values[1])
  }}
/>
```

`onValueCommit` is a Radix Slider prop that fires on pointerUp -- perfect for committing to URL state.

## Integration Plan

### Volume Slider (player-bar.tsx)
1. Install ElasticSlider via shadcn CLI
2. Add `onChange` callback to the copied source (it uses internal `setValue` -- add a prop that gets called alongside it)
3. Replace `<Slider>` in volume section with `<ElasticSlider>`
4. Map props: `startingValue={0} maxValue={100} defaultValue={volume}`
5. Use `VolumeX` and `Volume2` icons as `leftIcon` / `rightIcon`
6. Style: override Tailwind classes in the copied source to match dark theme (`bg-gray-400` -> `bg-[#333]`, `bg-gray-500` -> `bg-[#888]`)

### BPM Range Slider (filter-bar.tsx, beat-filters.tsx)
1. Keep Radix/shadcn Slider (ElasticSlider cannot do range)
2. Fix jumpiness with `onValueCommit` pattern above
3. Optionally style the Radix Slider to feel more polished (thicker track on hover, transition effects)

## Modifications Needed to ElasticSlider Source

Since the component is copied into the project (not a package), we can modify it freely:

```tsx
// Add to ElasticSliderProps:
onChange?: (value: number) => void;

// In the internal Slider component, after setValue(newValue):
setValue(newValue);
onChange?.(newValue);  // add this line
```

Also needed:
- Replace hardcoded `bg-gray-400` / `bg-gray-500` / `text-gray-400` with theme-appropriate colors
- Add `aria-label`, `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` for accessibility
- Consider hiding the absolute-positioned value display (`<p>` showing `Math.round(value)`) since volume doesn't need a numeric readout

## Common Pitfalls

### Pitfall 1: ElasticSlider Has No Range Mode
**What goes wrong:** Attempting to use ElasticSlider for BPM results in losing min/max filter capability.
**How to avoid:** Keep Radix Slider for range use cases. ElasticSlider is single-value only.

### Pitfall 2: No Controlled Mode
**What goes wrong:** Setting `defaultValue` after mount does nothing meaningful -- the internal `useEffect` will reset value but won't sync with parent state on subsequent changes.
**How to avoid:** Add an `onChange` callback and treat it as uncontrolled with callback pattern.

### Pitfall 3: motion/react Version Compatibility
**What goes wrong:** ElasticSlider requires `motion@^12.23.12`. If the project uses an older version, animations break.
**How to avoid:** Check current motion version before installing. The project already uses `motion/react` imports (Framer Motion v11+ rebranding).

### Pitfall 4: BPM Jumpiness Is Not a Slider Bug
**What goes wrong:** Replacing the Radix Slider with something else without fixing the nuqs `shallow: false` issue -- the new slider would be equally jumpy.
**How to avoid:** Fix the state management pattern (debounce/onValueCommit) regardless of which slider component is used.

## Sources

### Primary (HIGH confidence)
- [ReactBits ElasticSlider source](https://reactbits.dev/r/ElasticSlider-TS-TW.json) -- full component source code reviewed
- [Radix UI Slider docs](https://www.radix-ui.com/primitives/docs/components/slider) -- `onValueCommit` prop confirmed
- Project source code -- all 3 slider usages examined directly

### Secondary (MEDIUM confidence)
- [ReactBits GitHub](https://github.com/DavidHDev/react-bits) -- repository structure confirmed
- [ReactBits component page](https://reactbits.dev/components/elastic-slider) -- component description

## Metadata

**Confidence breakdown:**
- ElasticSlider API: HIGH -- read actual source code from registry JSON
- BPM jumpiness root cause: HIGH -- traced through nuqs shallow:false -> server re-render chain
- Integration approach: HIGH -- based on direct code review of all 3 usage sites
- Radix onValueCommit: HIGH -- documented Radix primitive prop

**Research date:** 2026-04-01
**Valid until:** 2026-05-01
