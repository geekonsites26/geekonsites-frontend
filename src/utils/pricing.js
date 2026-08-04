export const calculateBookingPricing = (booking = {}) => {
  const currency = booking?.currency || "USD"
  const isUK = currency === "GBP" || booking?.country === "UK"

  const symbol = isUK ? "£" : "$"

  const serviceAmount = Number(
    booking?.baseAmount ||
      booking?.serviceAmount ||
      booking?.paymentAmount ||
      0
  )

  const addonsAmount = Number(
    booking?.addonsTotal ||
      booking?.addonsAmount ||
      0
  )

  const antivirusAmount = Number(
    booking?.antivirusTotal ||
      booking?.antivirusAmount ||
      0
  )

  const platformFee = Number(
    booking?.platformFee || 12
  )

  const taxableAmount =
    serviceAmount +
    addonsAmount +
    antivirusAmount +
    platformFee

  const taxRate = isUK ? 0.2 : 0.08

  const taxAmount = Number(
    booking?.taxAmount ||
      Number((taxableAmount * taxRate).toFixed(2))
  )

  const totalAmount = Number(
    booking?.totalAmount ||
      booking?.finalAmount ||
      Number((taxableAmount + taxAmount).toFixed(2))
  )

  return {
    currency: isUK ? "GBP" : "USD",
    symbol,
    serviceAmount,
    addonsAmount,
    antivirusAmount,
    platformFee,
    taxRate,
    taxLabel: isUK ? "VAT" : "Sales Tax",
    taxAmount,
    totalAmount,
  }
}