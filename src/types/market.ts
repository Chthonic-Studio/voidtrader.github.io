/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemCategory =
  | 'prime_warframe'
  | 'prime_weapon'
  | 'prime_component'
  | 'mod'
  | 'arcane'
  | 'relic';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface PriceHistoryPoint {
  date: string;
  avg: number;
  min: number;
  max: number;
  volume: number;
}

export interface MarketItem {
  id: string;
  name: string;
  slug: string;
  category: ItemCategory;
  ducats: number;
  tradingTax: number;
  rarity: ItemRarity;
  currentPrice: number; // lowest active sell price in plat
  buyPrice: number;     // highest active buy order in plat
  avgPrice48h: number;
  avgPrice90d: number;
  change7d: number;     // percentage change
  volume24h: number;
  relicSources?: string[];
  history?: PriceHistoryPoint[];
  isVaulted?: boolean;
  modMaxRank?: number;
  description?: string;
  lastUpdated: string;
}

export interface VoidFissure {
  id: string;
  activation: string;
  expiry: string;
  node: string;
  missionType: string;
  enemy: string;
  tier: 'Lith' | 'Meso' | 'Neo' | 'Axi' | 'Requiem' | 'Omnia';
  tierNum: number;
  isHard: boolean;   // Steel Path
  isStorm: boolean;  // Void Storm (Railjack)
  eta?: string;
}

export interface UserPortfolioItem {
  id: string;
  slug: string;
  name: string;
  quantity: number;
  costBasis: number; // plat spent per unit
  targetSellPrice?: number;
  addedAt: string;
  category: ItemCategory;
  ducats: number;
  notes?: string;
}

export interface MarketOrder {
  id: string;
  platinum: number;
  quantity: number;
  orderType: 'sell' | 'buy';
  user: {
    ingameName: string;
    status: 'ingame' | 'online' | 'offline';
    reputation: number;
  };
  modRank?: number;
}

export interface UserPreferences {
  ducatBenchmark: number;        // e.g. 10 (Ducats per 1 Plat)
  defaultPlatform: 'pc' | 'ps4' | 'xbox' | 'switch';
  autoRefreshInterval: number;   // in seconds (0 = off, 60, 180, 300)
  customProxyUrl?: string;       // optional custom CORS proxy for static github pages
  showVaultedWarning: boolean;
}

export interface ExportDataPayload {
  version: string;
  exportedAt: string;
  preferences: UserPreferences;
  portfolio: UserPortfolioItem[];
  watchlist: string[]; // slugs
  customPriceSnapshots: {
    timestamp: string;
    slug: string;
    price: number;
    ducats: number;
  }[];
}
