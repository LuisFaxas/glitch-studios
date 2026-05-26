export function formatDurationChip(minutes: number | null): string | null {
  if (minutes == null) return null
  if (minutes >= 60) {
    const hours = minutes / 60
    if (hours === 1) return "1 HR"
    if (Number.isInteger(hours)) return `${hours} HRS`
    return `${hours.toFixed(1).replace(/\.0$/, "")} HRS`
  }
  return `${minutes} MIN`
}
