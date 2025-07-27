function toSEKString(total: bigint) {
  const kronor = total / 100n
  const ören = total % 100n
  return `${kronor},${ören} kr`
}
