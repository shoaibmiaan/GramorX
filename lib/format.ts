export function formatCurrency(amount: number, currency?: string): string {
  const resolvedCurrency =
    currency ??
    (typeof document !== "undefined"
      ? (document.getElementById("currency") as HTMLElement | null)?.textContent ?? undefined
      : undefined) ??
    "USD";

  return amount.toLocaleString(undefined, {
    style: "currency",
    currency: resolvedCurrency,
  });
}
