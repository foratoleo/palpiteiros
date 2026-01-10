import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 * @param inputs - Class names to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Number Formatting Utilities
// ============================================================================

/**
 * Formats a number as currency with proper symbol and decimals
 * @param value - The numeric value to format
 * @param currency - Currency code (default: "USD")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  decimals: number = 2
): string {
  if (isNaN(value)) return "$0.00";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return formatted;
}

/**
 * Formats a number as a percentage
 * @param value - The numeric value to format (e.g., 0.123 for 12.3%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "+12.34%" or "-5.67%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) return "0.00%";

  const sign = value >= 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats large numbers with K, M, B, T suffixes
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "1.5M", "2.3B")
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
  if (isNaN(value)) return "0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1e12) {
    return `${sign}${(abs / 1e12).toFixed(decimals)}T`;
  }
  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(decimals)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(decimals)}M`;
  }
  if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(decimals)}K`;
  }

  return value.toString();
}

/**
 * Formats a decimal as a price (0-100% range)
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted price string (e.g., "12.3c")
 */
export function formatPrice(value: number, decimals: number = 1): string {
  if (isNaN(value)) return "0c";
  const cents = Math.round(value * 100);
  return `${cents.toFixed(decimals)}c`;
}

// ============================================================================
// Date Formatting Utilities
// ============================================================================

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

/**
 * Formats a date as a full date and time string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 1, 2026, 12:00 PM")
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Formats a date as a simple date string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 1, 2026")
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Calculates time remaining until a target date
 * @param targetDate - The target date
 * @returns Formatted time remaining (e.g., "2d 5h" or "Ended")
 */
export function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Gets the color class for a price based on change
 * @param price - Current price
 * @param prevPrice - Previous price (optional)
 * @returns Tailwind color class name
 */
export function getPriceColor(price: number, prevPrice?: number): string {
  if (prevPrice === undefined) return "text-foreground";
  return price > prevPrice ? "text-success" : price < prevPrice ? "text-danger" : "text-foreground";
}

/**
 * Gets the color class for a change value
 * @param change - The change value (positive or negative)
 * @returns Tailwind color class name
 */
export function getChangeColor(change: number): string {
  if (change > 0) return "text-success";
  if (change < 0) return "text-danger";
  return "text-foreground";
}

/**
 * Gets the background color class with opacity for a change value
 * @param change - The change value (positive or negative)
 * @returns Tailwind background color class name
 */
export function getChangeBgColor(change: number): string {
  if (change > 0) return "bg-success/10";
  if (change < 0) return "bg-danger/10";
  return "bg-muted";
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates an email address format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a slug format (lowercase alphanumeric with hyphens)
 * @param slug - Slug string to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Validates a URL format
 * @param url - URL string to validate
 * @returns True if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid number
 * @param value - String to validate
 * @returns True if valid number
 */
export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Truncates a string to a specified length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converts a string to title case
 * @param str - String to convert
 * @returns Title case string
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Generates a slug from a string
 * @param str - String to slugify
 * @returns Slug string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Chunks an array into smaller arrays of specified size
 * @param arr - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Removes duplicates from an array
 * @param arr - Array with duplicates
 * @returns Array with unique values
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Sorts an array of objects by a key
 * @param arr - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order ("asc" or "desc")
 * @returns Sorted array
 */
export function sortBy<T>(
  arr: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Removes undefined values from an object
 * @param obj - Object to clean
 * @returns Object with defined values only
 */
export function removeUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Gets a nested value from an object using a dot-notation path
 * @param obj - Object to query
 * @param path - Dot-notation path (e.g., "user.profile.name")
 * @param defaultValue - Default value if path not found
 * @returns Value at path or default
 */
export function get<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const value = path.split(".").reduce<unknown>((o, p) => {
    return o && typeof o === "object" ? (o as Record<string, unknown>)[p] : undefined;
  }, obj);

  return (value as T | undefined) ?? defaultValue;
}
