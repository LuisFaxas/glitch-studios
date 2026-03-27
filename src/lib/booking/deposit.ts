import type { DepositType } from "@/types/booking"

interface DepositResult {
  depositAmountCents: number
}

/**
 * Calculate the deposit amount in cents.
 * Pure function — takes already-known values, no DB access needed.
 *
 * @param depositType - "percentage" or "flat"
 * @param depositValue - percentage (e.g. 50 for 50%) or flat dollar amount
 * @param totalPrice - total session price in dollars
 */
export function calculateDeposit(
  depositType: DepositType,
  depositValue: number,
  totalPrice: number
): DepositResult {
  let depositAmount: number

  if (depositType === "percentage") {
    depositAmount = totalPrice * (depositValue / 100)
  } else {
    // flat dollar amount
    depositAmount = depositValue
  }

  // Cap deposit at total price
  if (depositAmount > totalPrice) {
    depositAmount = totalPrice
  }

  return {
    depositAmountCents: Math.round(depositAmount * 100),
  }
}
