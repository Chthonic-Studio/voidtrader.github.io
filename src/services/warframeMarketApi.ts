/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketItem, MarketOrder, VoidFissure, PriceHistoryPoint } from '../types/market.ts';
import { SEED_MARKET_ITEMS } from '../data/seedMarketData.ts';

// In-memory response cache to protect rate-limits
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch live Void Fissures from Warframe Status API (https://docs.warframestat.us/)
 * This API has native Access-Control-Allow-Origin: * for direct browser usage!
 */
export async function fetchLiveFissures(platform: string = 'pc'): Promise<VoidFissure[]> {
  const cacheKey = `fissures_${platform}`;
  const cached = getCached<VoidFissure[]>(cacheKey);
  if (cached) return cached;

  const url = `https://api.warframestat.us/${platform}/fissures`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Sort fissures: active ones first, sorted by expiry ascending
    const now = Date.now();
    const fissures: VoidFissure[] = data
      .map((f: any) => ({
        id: f.id || Math.random().toString(),
        activation: f.activation,
        expiry: f.expiry,
        node: f.node || 'Unknown Node',
        missionType: f.missionType || 'Fissure',
        enemy: f.enemy || 'Orokin',
        tier: f.tier || 'Lith',
        tierNum: f.tierNum || 1,
        isHard: Boolean(f.isHard),
        isStorm: Boolean(f.isStorm),
        eta: f.eta || '',
      }))
      .filter((f: VoidFissure) => new Date(f.expiry).getTime() > now)
      .sort((a: VoidFissure, b: VoidFissure) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

    setCache(cacheKey, fissures);
    return fissures;
  } catch (err) {
    console.warn('Could not fetch fissures from warframestat.us, using local fallback:', err);
    return getFallbackFissures();
  }
}

/**
 * Fetch live orders for an item from Warframe Market.
 * Automatically tries local proxy first, then direct API with CORS handling.
 */
export async function fetchLiveOrders(slug: string): Promise<MarketOrder[]> {
  const cacheKey = `orders_${slug}`;
  const cached = getCached<MarketOrder[]>(cacheKey);
  if (cached) return cached;

  // Try local proxy endpoint first (if full-stack server is running)
  try {
    const proxyRes = await fetch(`/api/wf-market/orders/${slug}`);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.data && Array.isArray(json.data)) {
        const parsed = parseV2Orders(json.data);
        setCache(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // Continue to direct fetch
  }

  // Fallback direct Warframe Market v2 orders
  try {
    const directUrl = `https://api.warframe.market/v2/orders/item/${slug}`;
    const res = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        const parsed = parseV2Orders(json.data);
        setCache(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {
    // CORS or network failure
  }

  // Generate synthetic orders based on seed data
  return generateSyntheticOrders(slug);
}

function parseV2Orders(data: any[]): MarketOrder[] {
  return data
    .filter((o) => o.visible !== false)
    .map((o) => ({
      id: o.id,
      platinum: o.platinum,
      quantity: o.quantity || 1,
      orderType: (o.type === 'buy' ? 'buy' : 'sell') as 'buy' | 'sell',
      user: {
        ingameName: o.user?.ingameName || 'Tenno',
        status: o.user?.status || 'online',
        reputation: o.user?.reputation || 10,
      },
      modRank: o.modRank,
    }))
    .sort((a, b) => (a.orderType === 'sell' ? a.platinum - b.platinum : b.platinum - a.platinum));
}

function generateSyntheticOrders(slug: string): MarketOrder[] {
  const seedItem = SEED_MARKET_ITEMS.find((i) => i.slug === slug);
  const basePlat = seedItem ? seedItem.currentPrice : 25;

  const names = ['VoltRunner', 'ExcaliburPrime', 'VoidHunter_99', 'OrokinTrader', 'TennoLooter', 'LotusDisciple'];
  const orders: MarketOrder[] = [];

  for (let i = 0; i < 5; i++) {
    orders.push({
      id: `sell-${i}`,
      platinum: Math.max(1, Math.round(basePlat + i * Math.max(1, Math.round(basePlat * 0.04)))),
      quantity: Math.floor(1 + Math.random() * 3),
      orderType: 'sell',
      user: {
        ingameName: names[i % names.length],
        status: i === 0 ? 'ingame' : 'online',
        reputation: 25 + i * 15,
      },
    });
  }

  for (let j = 0; j < 3; j++) {
    orders.push({
      id: `buy-${j}`,
      platinum: Math.max(1, Math.round(basePlat * 0.85 - j * Math.max(1, Math.round(basePlat * 0.05)))),
      quantity: 1,
      orderType: 'buy',
      user: {
        ingameName: `Buyer_${j + 1}`,
        status: 'online',
        reputation: 15 + j * 10,
      },
    });
  }

  return orders;
}

/**
 * Fetch price statistics history for an item.
 */
export async function fetchItemStatistics(slug: string): Promise<PriceHistoryPoint[]> {
  const cacheKey = `stats_${slug}`;
  const cached = getCached<PriceHistoryPoint[]>(cacheKey);
  if (cached) return cached;

  // Try server proxy
  try {
    const proxyRes = await fetch(`/api/wf-market/statistics/${slug}`);
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.payload?.statistics_closed?.['90days']) {
        const raw = json.payload.statistics_closed['90days'];
        const points: PriceHistoryPoint[] = raw.slice(-30).map((p: any) => ({
          date: p.datetime.split('T')[0],
          avg: Math.round(p.avg_price || p.wa_price),
          min: Math.round(p.min_price),
          max: Math.round(p.max_price),
          volume: p.volume || 10,
        }));
        setCache(cacheKey, points);
        return points;
      }
    }
  } catch {
    // Proceed to fallback
  }

  const seed = SEED_MARKET_ITEMS.find((i) => i.slug === slug);
  return seed?.history || [];
}

/**
 * Fallback static fissures if network is disconnected.
 */
function getFallbackFissures(): VoidFissure[] {
  const now = Date.now();
  return [
    {
      id: 'fissure-1',
      activation: new Date(now - 10 * 60000).toISOString(),
      expiry: new Date(now + 35 * 60000).toISOString(),
      node: 'Mantis (Void)',
      missionType: 'Capture',
      enemy: 'Orokin',
      tier: 'Lith',
      tierNum: 1,
      isHard: false,
      isStorm: false,
    },
    {
      id: 'fissure-2',
      activation: new Date(now - 15 * 60000).toISOString(),
      expiry: new Date(now + 45 * 60000).toISOString(),
      node: 'Io (Jupiter)',
      missionType: 'Defense',
      enemy: 'Corpus',
      tier: 'Meso',
      tierNum: 2,
      isHard: false,
      isStorm: false,
    },
    {
      id: 'fissure-3',
      activation: new Date(now - 5 * 60000).toISOString(),
      expiry: new Date(now + 55 * 60000).toISOString(),
      node: 'Hydron (Sedna)',
      missionType: 'Defense',
      enemy: 'Grineer',
      tier: 'Neo',
      tierNum: 3,
      isHard: true,
      isStorm: false,
    },
    {
      id: 'fissure-4',
      activation: new Date(now - 20 * 60000).toISOString(),
      expiry: new Date(now + 25 * 60000).toISOString(),
      node: 'Mot (Void)',
      missionType: 'Survival',
      enemy: 'Corrupted',
      tier: 'Axi',
      tierNum: 4,
      isHard: true,
      isStorm: false,
    },
    {
      id: 'fissure-5',
      activation: new Date(now - 25 * 60000).toISOString(),
      expiry: new Date(now + 15 * 60000).toISOString(),
      node: 'Circulus (Lua)',
      missionType: 'Conjunction Survival',
      enemy: 'Thrax',
      tier: 'Omnia',
      tierNum: 6,
      isHard: true,
      isStorm: false,
    },
  ];
}
