const currencyFormatEvenNumbers = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  minimumFractionDigits: 0,
})

const currencyFormatFractions = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  roundingMode: 'halfCeil',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function toSEKString(total: bigint) {
  const kronor = total / 100n
  const ören = total % 100n

  if (ören === 0n) {
    return currencyFormatEvenNumbers.format(kronor)
  }

  // Always show 2 digits for fractions
  return currencyFormatFractions.format(`${kronor}.${ören}` as `${number}`)
}
