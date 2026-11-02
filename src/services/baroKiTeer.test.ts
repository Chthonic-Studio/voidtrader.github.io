/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichBaroItem, BASE_BARO_TRADABLES } from './baroKiTeer.ts';

test('Baro stock price comparison correctly recommends buying with Ducats for high plat items', () => {
  // Primed Flow: 350 Ducats, 85 Plat -> 350 / 85 = 4.12 d/p -> clearly worth buying with Ducats
  const item = enrichBaroItem({
    id: 'test-1',
    name: 'Primed Flow',
    slug: 'primed_flow',
    ducats: 350,
    credits: 110000,
    marketPlatPrice: 85,
    category: 'Primed Mod',
    isTradable: true,
  });

  assert.equal(item.ducatsPerPlat, 4.12);
  assert.equal(item.verdict, 'BUY_DUCATS');
  assert.match(item.verdictLabel, /Worth Buying with Ducats/);
});

test('Baro stock price comparison correctly recommends buying with Platinum for low plat items', () => {
  // Prisma Gorgon: 600 Ducats, 35 Plat -> 600 / 35 = 17.14 d/p -> much cheaper to buy with Platinum from players
  const item = enrichBaroItem({
    id: 'test-2',
    name: 'Prisma Gorgon',
    slug: 'prisma_gorgon',
    ducats: 600,
    credits: 50000,
    marketPlatPrice: 35,
    category: 'Prisma Weapon',
    isTradable: true,
  });

  assert.equal(item.ducatsPerPlat, 17.14);
  assert.equal(item.verdict, 'BUY_PLATINUM');
  assert.match(item.verdictLabel, /Better to Buy with Platinum/);
});

test('Base tradables contains essential Baro rotation items', () => {
  assert.ok(BASE_BARO_TRADABLES.length >= 15);
  const flow = BASE_BARO_TRADABLES.find((i) => i.name === 'Primed Flow');
  assert.ok(flow !== undefined);
  assert.equal(flow?.ducats, 350);
});
