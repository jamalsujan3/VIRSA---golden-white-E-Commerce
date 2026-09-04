/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Standardized currency formatter using Intl.NumberFormat for Bangladeshi Taka (BDT)
 */
export function formatPrice(amount: number | null | undefined, includeSymbol: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '৳0' : '0';
  }

  const formatted = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return includeSymbol ? `৳${formatted}` : formatted;
}

/**
 * Standardized order date formatter
 */
export function formatOrderDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return dateString;
  }
}
