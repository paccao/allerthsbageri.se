// TODO: Improve currency formatting to use Intl.NumberFormat() instead for a more standardised approach
export function toSEKString(total: bigint) {
  const kronor = total / 100n
  const ören = total % 100n
  if (ören === 0n) {
    return `${kronor} kr`
  }
  return `${kronor},${ören} kr`
}
