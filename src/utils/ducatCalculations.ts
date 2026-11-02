/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DucatPlatMetrics {
  ducatsPerPlat: number;
  platPer100Ducats: number;
  recommendation: 'SELL_PLAT' | 'TRADE_DUCAT' | 'FAIR_VALUE';
  verdictText: string;
  profitRatioDelta: number; // percentage difference from baseline (e.g. +25% better for ducats)
}

/**
 * Standard Baro Ki'Teer junk baseline in Warframe trading:
 * Typically ~10-12 Ducats per 1 Platinum (equivalent to 8-10 Plat per 100 Ducats).
 */
export const DEFAULT_DUCAT_BENCHMARK = 10; // 10 Ducats per Plat

/**
 * Calculates Ducat to Platinum ratios and investment advice.
 * @param ducats Amount of ducats given by Baro Ki'Teer for this prime part
 * @param platinum Current lowest seller or market price on Warframe Market
 * @param benchmark User-configurable threshold (default 10 ducats/plat)
 */
export function calculateDucatPlatRatio(
  ducats: number,
  platinum: number,
  benchmark: number = DEFAULT_DUCAT_BENCHMARK
): DucatPlatMetrics {
  const safeDucats = Math.max(0, ducats);
  const safePlat = Math.max(0.1, platinum);

  const ducatsPerPlat = safeDucats / safePlat;
  const platPer100Ducats = (safePlat / safeDucats) * 100;

  // If ducatsPerPlat >= benchmark * 1.15 -> great value for Ducats (Baro Junk)
  // If ducatsPerPlat <= benchmark * 0.75 -> sell for Plat (too valuable to scrap for Baro)
  // Otherwise -> Fair / balanced value
  let recommendation: 'SELL_PLAT' | 'TRADE_DUCAT' | 'FAIR_VALUE' = 'FAIR_VALUE';
  let verdictText = 'Fair Value (Sell or Ducat)';

  if (safeDucats === 0) {
    recommendation = 'SELL_PLAT';
    verdictText = 'Sell for Plat (0 Ducats)';
  } else if (ducatsPerPlat >= benchmark * 1.15) {
    recommendation = 'TRADE_DUCAT';
    verdictText = 'Trade for Ducats (Baro Junk)';
  } else if (ducatsPerPlat <= benchmark * 0.75) {
    recommendation = 'SELL_PLAT';
    verdictText = 'Sell on Market (High Plat)';
  }

  const profitRatioDelta = safeDucats > 0
    ? ((ducatsPerPlat - benchmark) / benchmark) * 100
    : 0;

  return {
    ducatsPerPlat: Number(ducatsPerPlat.toFixed(2)),
    platPer100Ducats: Number(platPer100Ducats.toFixed(2)),
    recommendation,
    verdictText,
    profitRatioDelta: Number(profitRatioDelta.toFixed(1)),
  };
}

/**
 * Void Relic Expected Value (EV) calculation.
 * Standard Warframe Relic Drop Probabilities:
 * Intact:
 *   - 3 Common drops: 25.33% each (76% total)
 *   - 2 Uncommon drops: 11% each (22% total)
 *   - 1 Rare drop: 2%
 * Radiant:
 *   - 3 Common drops: 16.67% each (50% total)
 *   - 2 Uncommon drops: 20% each (40% total)
 *   - 1 Rare drop: 10%
 */
export interface RelicDropValues {
  commonPlatAvg: number;
  commonDucatAvg: number;
  uncommonPlatAvg: number;
  uncommonDucatAvg: number;
  rarePlatAvg: number;
  rareDucatAvg: number;
}

export interface RelicExpectedValue {
  intactPlatEV: number;
  intactDucatEV: number;
  radiantPlatEV: number;
  radiantDucatEV: number;
  radiantPlatGain: number;
  radiantDucatGain: number;
}

export function calculateRelicEV(drops: RelicDropValues): RelicExpectedValue {
  const intactPlat =
    0.76 * drops.commonPlatAvg +
    0.22 * drops.uncommonPlatAvg +
    0.02 * drops.rarePlatAvg;

  const intactDucat =
    0.76 * drops.commonDucatAvg +
    0.22 * drops.uncommonDucatAvg +
    0.02 * drops.rareDucatAvg;

  const radiantPlat =
    0.50 * drops.commonPlatAvg +
    0.40 * drops.uncommonPlatAvg +
    0.10 * drops.rarePlatAvg;

  const radiantDucat =
    0.50 * drops.commonDucatAvg +
    0.40 * drops.uncommonDucatAvg +
    0.10 * drops.rareDucatAvg;

  return {
    intactPlatEV: Number(intactPlat.toFixed(1)),
    intactDucatEV: Number(intactDucat.toFixed(1)),
    radiantPlatEV: Number(radiantPlat.toFixed(1)),
    radiantDucatEV: Number(radiantDucat.toFixed(1)),
    radiantPlatGain: Number((radiantPlat - intactPlat).toFixed(1)),
    radiantDucatGain: Number((radiantDucat - intactDucat).toFixed(1)),
  };
}

/**
 * Format market slug for Warframe Market API and URLs.
 * e.g. "Glaive Prime Blade" -> "glaive_prime_blade"
 */
export function toMarketSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Get direct Warframe Market URL for an item slug.
 */
export function getWarframeMarketUrl(slug: string): string {
  return `https://warframe.market/items/${slug}`;
}
