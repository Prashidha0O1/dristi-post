import type { Locale } from "./types";

/**
 * Salary is a free-text field ("50,000-70,000", "Negotiable", "रु. ५०,०००").
 * This adds a currency prefix when the value is a bare amount, so an editor who
 * types just a number still gets "Rs 50,000" — while leaving alone anything
 * that already has a currency marker or is plainly not a number.
 */
export function formatSalary(salary: string, locale: Locale): string {
  const value = salary.trim();
  if (!value) return value;
  // Already carries a currency symbol/word — don't double it up.
  if (/rs\.?|रु|₨|\$|npr/i.test(value)) return value;
  // Starts with an ASCII or Devanagari digit -> it's an amount; prefix currency.
  if (/^[\d०-९]/.test(value)) return locale === "ne" ? `रु. ${value}` : `Rs ${value}`;
  // "Negotiable" and similar -> as-is.
  return value;
}
