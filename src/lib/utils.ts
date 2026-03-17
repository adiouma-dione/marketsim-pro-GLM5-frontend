// ============================================================
// MarketSim Pro - Utility Functions
// ============================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApiError, ApiValidationError } from './types';

// ------------------------------------------------------------
// Tailwind Class Merge Utility
// ------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------------------------------------------
// Currency Formatting (EUR)
// ------------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatterWithDecimals = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, showDecimals = false): string {
  return showDecimals
    ? currencyFormatterWithDecimals.format(value)
    : currencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M €`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`;
  }
  return currencyFormatter.format(value);
}

// ------------------------------------------------------------
// Percentage Formatting
// ------------------------------------------------------------

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentageFromDecimal(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatPercentageChange(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a value that's already in percentage form (e.g., 25.5 for 25.5%)
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ------------------------------------------------------------
// Date Formatting
// ------------------------------------------------------------

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('fr-FR');
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(isoString);
}

// ------------------------------------------------------------
// Number Formatting
// ------------------------------------------------------------

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatNumberCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

// ------------------------------------------------------------
// API Error Parsing
// ------------------------------------------------------------

export function parseApiError(error: unknown): string {
  if (!error) return 'Une erreur est survenue';

  // Check if it's an Axios error with response data
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as {
      response?: { data?: ApiError | ApiValidationError; status?: number };
      message?: string;
    };

    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Handle validation errors (array of details)
      if (Array.isArray(data.detail)) {
        return data.detail.map((d) => d.msg).join(', ');
      }

      // Handle simple error message
      if (typeof data.detail === 'string') {
        return data.detail;
      }
    }

    // Handle network errors
    if (axiosError.message === 'Network Error') {
      return 'Erreur réseau. Vérifiez votre connexion.';
    }

    // Handle timeout
    if (axiosError.message?.includes('timeout')) {
      return 'La requête a expiré. Réessayez.';
    }

    // Handle generic axios error message
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inattendue est survenue';
}

// ------------------------------------------------------------
// String Utilities
// ------------------------------------------------------------

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ------------------------------------------------------------
// Color Utilities
// ------------------------------------------------------------

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ------------------------------------------------------------
// Validation Utilities
// ------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// ------------------------------------------------------------
// Array Utilities
// ------------------------------------------------------------

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>
  );
}

export function sortBy<T>(array: T[], keyFn: (item: T) => number, desc = false): T[] {
  const sorted = [...array].sort((a, b) => keyFn(a) - keyFn(b));
  return desc ? sorted.reverse() : sorted;
}

// ------------------------------------------------------------
// Timer Utilities
// ------------------------------------------------------------

export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ------------------------------------------------------------
// Debounce & Throttle
// ------------------------------------------------------------

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: Parameters<T>) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ------------------------------------------------------------
// Local Storage Utilities
// ------------------------------------------------------------

export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Failed to save to localStorage: ${key}`);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    console.error(`Failed to remove from localStorage: ${key}`);
  }
}

// ------------------------------------------------------------
// Cookie Utilities
// ------------------------------------------------------------

export function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
}

// ------------------------------------------------------------
// ID Generation
// ------------------------------------------------------------

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}
