export function formatPHP(amount: string | number): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "₱0.00";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

export function parsePHPInput(input: string): string {
  // Remove currency symbols, commas, and keep numbers and decimal point
  return input.replace(/[^\d.]/g, "");
}

export function formatPHPInput(value: string): string {
  const cleaned = parsePHPInput(value);
  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    return "";
  }

  // Format with commas but without currency symbol for input
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}
