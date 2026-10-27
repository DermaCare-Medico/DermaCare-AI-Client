/** Formats a numeric or decimal-string amount using the payload currency (defaults to USD). */
export function formatMoney(
  value?: number | string | null,
  currency = "USD"
): string {
  if (value === undefined || value === null) return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    // Unknown/invalid ISO currency code → fall back to a plain amount.
    return `${numeric} ${currency}`;
  }
}
