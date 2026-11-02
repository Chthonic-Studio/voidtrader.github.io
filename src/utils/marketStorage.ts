/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserPortfolioItem,
  UserPreferences,
  ExportDataPayload,
} from '../types/market.ts';
import { DEFAULT_DUCAT_BENCHMARK } from './ducatCalculations.ts';

const STORAGE_KEYS = {
  WATCHLIST: 'voidtrader_watchlist_v1',
  PORTFOLIO: 'voidtrader_portfolio_v1',
  PREFERENCES: 'voidtrader_preferences_v1',
  PRICE_SNAPSHOTS: 'voidtrader_price_snapshots_v1',
  CUSTOM_ITEMS: 'voidtrader_custom_items_v1',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  ducatBenchmark: DEFAULT_DUCAT_BENCHMARK,
  defaultPlatform: 'pc',
  autoRefreshInterval: 120, // 2 minutes
  showVaultedWarning: true,
};

export const DEFAULT_WATCHLIST: string[] = [
  'protea_prime_set',
  'glaive_prime_set',
  'glaive_prime_blade',
  'lex_prime_receiver',
  'arcane_energize',
  'primed_continuity',
  'burston_prime_receiver',
];

export const DEFAULT_PORTFOLIO: UserPortfolioItem[] = [
  {
    id: 'port-1',
    slug: 'glaive_prime_blade',
    name: 'Glaive Prime Blade',
    quantity: 2,
    costBasis: 110,
    targetSellPrice: 150,
    addedAt: '2026-10-25T14:00:00Z',
    category: 'prime_component',
    ducats: 100,
    notes: 'Bought before resurgence, waiting for 150p',
  },
  {
    id: 'port-2',
    slug: 'lex_prime_receiver',
    name: 'Lex Prime Receiver',
    quantity: 25,
    costBasis: 1.2,
    targetSellPrice: 2.0,
    addedAt: '2026-10-28T18:30:00Z',
    category: 'prime_component',
    ducats: 15,
    notes: 'Bulk Baro junk farm',
  },
  {
    id: 'port-3',
    slug: 'primed_continuity',
    name: 'Primed Continuity',
    quantity: 3,
    costBasis: 45,
    targetSellPrice: 85,
    addedAt: '2026-10-15T12:00:00Z',
    category: 'mod',
    ducats: 0,
    notes: 'Bought from Baro with junk ducats',
  },
];

export function getStoredWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(DEFAULT_WATCHLIST));
      return DEFAULT_WATCHLIST;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function saveWatchlist(watchlist: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  } catch (err) {
    console.error('Failed to save watchlist to localStorage', err);
  }
}

export function toggleWatchlistItem(slug: string): string[] {
  const current = getStoredWatchlist();
  const exists = current.includes(slug);
  const updated = exists ? current.filter((s) => s !== slug) : [...current, slug];
  saveWatchlist(updated);
  return updated;
}

export function getStoredPortfolio(): UserPortfolioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(DEFAULT_PORTFOLIO));
      return DEFAULT_PORTFOLIO;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PORTFOLIO;
  }
}

export function savePortfolio(portfolio: UserPortfolioItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(portfolio));
  } catch (err) {
    console.error('Failed to save portfolio to localStorage', err);
  }
}

export function getStoredPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save preferences to localStorage', err);
  }
}

export function getStoredPriceSnapshots(): {
  timestamp: string;
  slug: string;
  price: number;
  ducats: number;
}[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICE_SNAPSHOTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePriceSnapshot(slug: string, price: number, ducats: number): void {
  try {
    const current = getStoredPriceSnapshots();
    const newEntry = {
      timestamp: new Date().toISOString(),
      slug,
      price,
      ducats,
    };
    // keep latest 500 snapshots
    const updated = [newEntry, ...current].slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.PRICE_SNAPSHOTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save price snapshot', err);
  }
}

/**
 * Exports all user data into a downloadable JSON file.
 */
export function exportUserData(): void {
  const payload: ExportDataPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    preferences: getStoredPreferences(),
    portfolio: getStoredPortfolio(),
    watchlist: getStoredWatchlist(),
    customPriceSnapshots: getStoredPriceSnapshots(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `voidtrader_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Imports user data from a JSON string.
 */
export function importUserData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as ExportDataPayload;
    if (parsed.preferences) savePreferences(parsed.preferences);
    if (Array.isArray(parsed.portfolio)) savePortfolio(parsed.portfolio);
    if (Array.isArray(parsed.watchlist)) saveWatchlist(parsed.watchlist);
    if (Array.isArray(parsed.customPriceSnapshots)) {
      localStorage.setItem(STORAGE_KEYS.PRICE_SNAPSHOTS, JSON.stringify(parsed.customPriceSnapshots));
    }
    return true;
  } catch (err) {
    console.error('Failed to parse import data', err);
    return false;
  }
}
