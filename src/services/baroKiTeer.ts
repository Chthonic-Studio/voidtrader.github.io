/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BaroStockItem {
  id: string;
  name: string;
  slug: string;
  ducats: number;
  credits: number;
  marketPlatPrice: number;
  ducatsPerPlat: number;
  platPer100Ducats: number;
  verdict: 'BUY_DUCATS' | 'BUY_PLATINUM' | 'FAIR_VALUE';
  verdictLabel: string;
  verdictReason: string;
  category: 'Primed Mod' | '60-60 Mod' | 'Prisma Weapon' | 'Vandal / Wraith Weapon' | 'Relic';
  isTradable: boolean;
}

export interface BaroStatus {
  active: boolean;
  location: string;
  activation: string;
  expiry: string;
  inventory: BaroStockItem[];
}

// Standard rotating tradables from Baro Ki'Teer with benchmark platinum prices
export const BASE_BARO_TRADABLES: Omit<BaroStockItem, 'ducatsPerPlat' | 'platPer100Ducats' | 'verdict' | 'verdictLabel' | 'verdictReason'>[] = [
  {
    id: 'baro-primed-flow',
    name: 'Primed Flow',
    slug: 'primed_flow',
    ducats: 350,
    credits: 110000,
    marketPlatPrice: 85,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-continuity',
    name: 'Primed Continuity',
    slug: 'primed_continuity',
    ducats: 350,
    credits: 100000,
    marketPlatPrice: 65,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-target-cracker',
    name: 'Primed Target Cracker',
    slug: 'primed_target_cracker',
    ducats: 400,
    credits: 150000,
    marketPlatPrice: 75,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-pistol-gambit',
    name: 'Primed Pistol Gambit',
    slug: 'primed_pistol_gambit',
    ducats: 400,
    credits: 150000,
    marketPlatPrice: 70,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-reach',
    name: 'Primed Reach',
    slug: 'primed_reach',
    ducats: 350,
    credits: 220000,
    marketPlatPrice: 70,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-point-blank',
    name: 'Primed Point Blank',
    slug: 'primed_point_blank',
    ducats: 300,
    credits: 110000,
    marketPlatPrice: 60,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-ravage',
    name: 'Primed Ravage',
    slug: 'primed_ravage',
    ducats: 280,
    credits: 220000,
    marketPlatPrice: 55,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-animal-instinct',
    name: 'Primed Animal Instinct',
    slug: 'primed_animal_instinct',
    ducats: 300,
    credits: 200000,
    marketPlatPrice: 60,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-primed-firestorm',
    name: 'Primed Firestorm',
    slug: 'primed_firestorm',
    ducats: 350,
    credits: 175000,
    marketPlatPrice: 75,
    category: 'Primed Mod',
    isTradable: true,
  },
  {
    id: 'baro-high-voltage',
    name: 'High Voltage',
    slug: 'high_voltage',
    ducats: 300,
    credits: 150000,
    marketPlatPrice: 45,
    category: '60-60 Mod',
    isTradable: true,
  },
  {
    id: 'baro-jolt',
    name: 'Jolt',
    slug: 'jolt',
    ducats: 300,
    credits: 150000,
    marketPlatPrice: 40,
    category: '60-60 Mod',
    isTradable: true,
  },
  {
    id: 'baro-shell-shock',
    name: 'Shell Shock',
    slug: 'shell_shock',
    ducats: 300,
    credits: 150000,
    marketPlatPrice: 40,
    category: '60-60 Mod',
    isTradable: true,
  },
  {
    id: 'baro-voltaic-strike',
    name: 'Voltaic Strike',
    slug: 'voltaic_strike',
    ducats: 300,
    credits: 150000,
    marketPlatPrice: 40,
    category: '60-60 Mod',
    isTradable: true,
  },
  {
    id: 'baro-prisma-gorgon',
    name: 'Prisma Gorgon',
    slug: 'prisma_gorgon',
    ducats: 600,
    credits: 50000,
    marketPlatPrice: 35,
    category: 'Prisma Weapon',
    isTradable: true,
  },
  {
    id: 'baro-prisma-skana',
    name: 'Prisma Skana',
    slug: 'prisma_skana',
    ducats: 510,
    credits: 175000,
    marketPlatPrice: 30,
    category: 'Prisma Weapon',
    isTradable: true,
  },
  {
    id: 'baro-prisma-dual-cleavers',
    name: 'Prisma Dual Cleavers',
    slug: 'prisma_dual_cleavers',
    ducats: 490,
    credits: 200000,
    marketPlatPrice: 32,
    category: 'Prisma Weapon',
    isTradable: true,
  },
  {
    id: 'baro-prisma-tetra',
    name: 'Prisma Tetra',
    slug: 'prisma_tetra',
    ducats: 400,
    credits: 50000,
    marketPlatPrice: 22,
    category: 'Prisma Weapon',
    isTradable: true,
  },
  {
    id: 'baro-prova-vandal',
    name: 'Prova Vandal',
    slug: 'prova_vandal',
    ducats: 410,
    credits: 250000,
    marketPlatPrice: 25,
    category: 'Vandal / Wraith Weapon',
    isTradable: true,
  },
  {
    id: 'baro-quanta-vandal',
    name: 'Quanta Vandal',
    slug: 'quanta_vandal',
    ducats: 450,
    credits: 300000,
    marketPlatPrice: 30,
    category: 'Vandal / Wraith Weapon',
    isTradable: true,
  },
  {
    id: 'baro-axi-a2-relic',
    name: 'Axi A2 Relic (Aklex Prime)',
    slug: 'axi_a2_relic',
    ducats: 50,
    credits: 45000,
    marketPlatPrice: 8,
    category: 'Relic',
    isTradable: true,
  },
];

export function enrichBaroItem(item: {
  id: string;
  name: string;
  slug: string;
  ducats: number;
  credits: number;
  marketPlatPrice: number;
  category: BaroStockItem['category'];
  isTradable: boolean;
}): BaroStockItem {
  const safeDucats = Math.max(1, item.ducats);
  const safePlat = Math.max(1, item.marketPlatPrice);

  const ducatsPerPlat = Number((safeDucats / safePlat).toFixed(2));
  const platPer100Ducats = Number(((safePlat / safeDucats) * 100).toFixed(1));

  // Benchmark: junk ducats cost ~10 d/p.
  // If ratio <= 8.5 d/p -> excellent return on Ducats (reselling or keeping saves lots of Plat!)
  // If ratio >= 11.5 d/p -> expensive in Ducats; cheaper to buy directly with Platinum from players!
  let verdict: BaroStockItem['verdict'] = 'FAIR_VALUE';
  let verdictLabel = 'Fair Value';
  let verdictReason = 'Balanced Ducats-to-Platinum cost ratio.';

  if (ducatsPerPlat <= 8.5) {
    verdict = 'BUY_DUCATS';
    verdictLabel = 'Worth Buying with Ducats';
    verdictReason = `High Platinum value (${safePlat}p) for only ${safeDucats} Ducats (${ducatsPerPlat} d/p). Great resale margin or personal keep!`;
  } else if (ducatsPerPlat >= 11.5) {
    verdict = 'BUY_PLATINUM';
    verdictLabel = 'Better to Buy with Platinum';
    verdictReason = `Requires ${safeDucats} Ducats but costs only ${safePlat}p on the market (${ducatsPerPlat} d/p). Save your Ducats and buy with Plat!`;
  } else {
    verdictReason = `Average market cost (${ducatsPerPlat} d/p). Buy with Ducats if you have surplus junk, or with Plat if low on Ducats.`;
  }

  return {
    ...item,
    ducatsPerPlat,
    platPer100Ducats,
    verdict,
    verdictLabel,
    verdictReason,
  };
}

export async function fetchBaroKiTeerStatus(): Promise<BaroStatus> {
  try {
    const res = await fetch('https://api.warframestat.us/pc/voidTrader');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const now = Date.now();
    const expiryTime = data.expiry ? new Date(data.expiry).getTime() : 0;
    const activationTime = data.activation ? new Date(data.activation).getTime() : 0;

    // Check if Baro is currently present
    const isActive = Boolean(data.active || (now >= activationTime && now < expiryTime));

    let stock: BaroStockItem[] = [];

    // If active and API returned inventory items
    if (isActive && Array.isArray(data.inventory) && data.inventory.length > 0) {
      stock = data.inventory
        .map((entry: any, index: number) => {
          const name = entry.item;
          const slug = name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
          // Find matching market price
          const match = BASE_BARO_TRADABLES.find((b) => b.name.toLowerCase() === name.toLowerCase());
          const marketPrice = match ? match.marketPlatPrice : 35;
          const category = match ? match.category : 'Primed Mod';

          // Filter cosmetics or non-tradables if not tradable
          const isTradable = Boolean(match?.isTradable || name.includes('Primed') || name.includes('Prisma') || name.includes('Relic') || name.includes('Vandal') || name.includes('Wraith'));

          return enrichBaroItem({
            id: `baro-live-${index}`,
            name,
            slug,
            ducats: entry.ducats || 350,
            credits: entry.credits || 100000,
            marketPlatPrice: marketPrice,
            category,
            isTradable,
          });
        })
        .filter((i: BaroStockItem) => i.isTradable); // Only show tradables for price comparison
    } else {
      // Baro is away: display the standard tradable rotation
      stock = BASE_BARO_TRADABLES.map(enrichBaroItem);
    }

    return {
      active: isActive,
      location: data.location || 'Kronia Relay (Saturn)',
      activation: data.activation || '2026-11-06T14:00:00.000Z',
      expiry: data.expiry || '2026-11-08T14:00:00.000Z',
      inventory: stock,
    };
  } catch (err) {
    console.warn('Failed to fetch voidTrader status, using standard schedule:', err);
    return {
      active: false,
      location: 'Kronia Relay (Saturn)',
      activation: '2026-11-06T14:00:00.000Z',
      expiry: '2026-11-08T14:00:00.000Z',
      inventory: BASE_BARO_TRADABLES.map(enrichBaroItem),
    };
  }
}
