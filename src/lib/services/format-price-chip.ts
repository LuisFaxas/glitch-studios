export function formatPriceChip(priceLabel: string): string {
  const trimmed = priceLabel.trim()
  if (trimmed.toLowerCase().startsWith("from ")) {
    return `FROM ${trimmed.slice(5).toUpperCase()}`
  }
  return trimmed.toUpperCase()
}
