/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDucatPlatRatio,
  calculateRelicEV,
  toMarketSlug,
  getWarframeMarketUrl,
} from './ducatCalculations.ts';

test('Ducat/Plat ratio identifies junk prime parts correctly', () => {
  // A 100 Ducat item selling for 5 plat has 20 Ducats/Plat -> clearly Baro Junk
  const junkResult = calculateDucatPlatRatio(100, 5, 10);
  assert.equal(junkResult.ducatsPerPlat, 20);
  assert.equal(junkResult.recommendation, 'TRADE_DUCAT');
  assert.match(junkResult.verdictText, /Trade for Ducats/);
});

test('Ducat/Plat ratio identifies high value prime parts to sell for platinum', () => {
  // A 45 Ducat item selling for 40 plat has 1.13 Ducats/Plat -> sell for Platinum
  const sellResult = calculateDucatPlatRatio(45, 40, 10);
  assert.equal(sellResult.ducatsPerPlat, 1.13);
  assert.equal(sellResult.recommendation, 'SELL_PLAT');
  assert.match(sellResult.verdictText, /Sell on Market/);
});

test('Ducat/Plat ratio identifies fair value middle ground', () => {
  // A 45 Ducat item selling for 4.5 plat has 10 Ducats/Plat -> right around baseline
  const fairResult = calculateDucatPlatRatio(45, 4.5, 10);
  assert.equal(fairResult.ducatsPerPlat, 10);
  assert.equal(fairResult.recommendation, 'FAIR_VALUE');
});

test('Void Relic expected value matches probability distributions', () => {
  const drops = {
    commonPlatAvg: 2,
    commonDucatAvg: 15,
    uncommonPlatAvg: 8,
    uncommonDucatAvg: 45,
    rarePlatAvg: 40,
    rareDucatAvg: 100,
  };

  const ev = calculateRelicEV(drops);
  // Intact: 0.76*2 + 0.22*8 + 0.02*40 = 1.52 + 1.76 + 0.8 = 4.08 -> 4.1 Plat
  assert.equal(ev.intactPlatEV, 4.1);
  // Radiant: 0.50*2 + 0.40*8 + 0.10*40 = 1.0 + 3.2 + 4.0 = 8.2 Plat
  assert.equal(ev.radiantPlatEV, 8.2);
  // Radiant gain = 8.2 - 4.1 = 4.1
  assert.equal(ev.radiantPlatGain, 4.1);
  assert.ok(ev.radiantDucatEV > ev.intactDucatEV);
});

test('Slug generation handles formatting accurately', () => {
  assert.equal(toMarketSlug('Glaive Prime Blade'), 'glaive_prime_blade');
  assert.equal(toMarketSlug('Khora Prime Neuroptics Blueprint'), 'khora_prime_neuroptics_blueprint');
  assert.equal(
    getWarframeMarketUrl('glaive_prime_blade'),
    'https://warframe.market/items/glaive_prime_blade'
  );
});
