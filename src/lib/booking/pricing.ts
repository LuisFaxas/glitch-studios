/**
 * Client-safe pricing utilities for booking packages.
 * Separated from recurring.ts to avoid pulling postgres into the client bundle.
 */

/**
 * Calculate package pricing with discount.
 *
 * @param basePrice - per-session price in dollars
 * @param sessionCount - number of sessions in the package
 * @param discountPercent - percentage discount (e.g. 15 for 15% off)
 */
export function calculatePackagePrice(
  basePrice: number,
  sessionCount: number,
  discountPercent: number
): { perSession: number; total: number; savings: number } {
  const fullTotal = basePrice * sessionCount
  const discountMultiplier = 1 - discountPercent / 100
  const total = Math.round(fullTotal * discountMultiplier * 100) / 100
  const perSession = Math.round((total / sessionCount) * 100) / 100
  const savings = Math.round((fullTotal - total) * 100) / 100

  return { perSession, total, savings }
}
