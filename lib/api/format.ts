/** Formats a numeric amount using the payload currency (defaults to USD). */
export function formatMoney(
  value?: number | null,
  currency = "USD"
): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Unknown/invalid ISO currency code → fall back to a plain amount.
    return `${value} ${currency}`;
  }
}
