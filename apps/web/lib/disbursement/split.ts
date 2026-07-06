// Split a favpoll's raised total equally across its charities (brand rule: at
// most 3 charities, proceeds split equally). Works in pence internally to avoid
// floating-point drift, then distributes any leftover pennies one at a time to
// the earliest charities so the parts always sum back to the total.
export function splitEqually(
  totalPounds: number,
  charityIds: string[]
): { charityId: string; amount: number }[] {
  if (charityIds.length === 0) return []
  const totalPence = Math.round(totalPounds * 100)
  if (totalPence <= 0) return []

  const base = Math.floor(totalPence / charityIds.length)
  let remainder = totalPence - base * charityIds.length

  return charityIds.map((charityId) => {
    const pence = base + (remainder > 0 ? 1 : 0)
    if (remainder > 0) remainder--
    return { charityId, amount: pence / 100 }
  })
}
