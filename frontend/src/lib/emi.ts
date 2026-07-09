/** Monthly EMI for a reducing-balance loan. principal in ₹, rate in % p.a., term in months. */
export function calcEmi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

// ponytail: one runnable check — ₹10L @ 8.5% for 20y ≈ ₹8,678/mo. Dev-only, tree-shaken in prod.
if (import.meta.env.DEV) {
  console.assert(Math.round(calcEmi(1_000_000, 8.5, 240)) === 8678, "calcEmi drift");
}
