/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { VoidFissure, MarketItem } from '../types/market.ts';
import { calculateRelicEV } from '../utils/ducatCalculations.ts';
import { Flame, Clock, ShieldAlert, Zap, Sparkles, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';

interface FissureTrackerProps {
  fissures: VoidFissure[];
  items: MarketItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectItem: (item: MarketItem) => void;
}

export const FissureTracker: React.FC<FissureTrackerProps> = ({
  fissures,
  items,
  isLoading,
  onRefresh,
  onSelectItem,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<string>('all');
  const [steelPathOnly, setSteelPathOnly] = useState<boolean>(false);
  const [expandedFissureId, setExpandedFissureId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Clock tick every second for real-time countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRemainingTime = (expiry: string) => {
    const diff = new Date(expiry).getTime() - currentTime;
    if (diff <= 0) return 'Expired';
    const totalMinutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${seconds}s`;
  };

  const filteredFissures = useMemo(() => {
    return fissures.filter((f) => {
      if (selectedTier !== 'all' && f.tier.toLowerCase() !== selectedTier.toLowerCase()) return false;
      if (steelPathOnly && !f.isHard) return false;
      if (selectedMission !== 'all') {
        const m = f.missionType.toLowerCase();
        if (selectedMission === 'fast' && !(m.includes('capture') || m.includes('exterminate') || m.includes('rescue'))) {
          return false;
        }
        if (selectedMission === 'endless' && !(m.includes('survival') || m.includes('defense') || m.includes('interception') || m.includes('excavation') || m.includes('disruption'))) {
          return false;
        }
      }
      return true;
    });
  }, [fissures, selectedTier, selectedMission, steelPathOnly]);

  // Map relics to their EV and drops
  const relicAdviceForTier = (tier: string) => {
    const primeParts = items.filter((i) => i.category === 'prime_component' && i.relicSources);
    const matching = primeParts.filter((p) =>
      p.relicSources?.some((r) => r.toLowerCase().includes(tier.toLowerCase()))
    );

    // Compute expected value profile for this tier
    const commonParts = matching.filter((p) => p.rarity === 'common');
    const uncommonParts = matching.filter((p) => p.rarity === 'uncommon');
    const rareParts = matching.filter((p) => p.rarity === 'rare');

    const commonPlat = commonParts.length ? commonParts.reduce((a, b) => a + b.currentPrice, 0) / commonParts.length : 2;
    const commonDucat = commonParts.length ? commonParts.reduce((a, b) => a + b.ducats, 0) / commonParts.length : 15;
    const uncommonPlat = uncommonParts.length ? uncommonParts.reduce((a, b) => a + b.currentPrice, 0) / uncommonParts.length : 6;
    const uncommonDucat = uncommonParts.length ? uncommonParts.reduce((a, b) => a + b.ducats, 0) / uncommonParts.length : 45;
    const rarePlat = rareParts.length ? rareParts.reduce((a, b) => a + b.currentPrice, 0) / rareParts.length : 35;
    const rareDucat = rareParts.length ? rareParts.reduce((a, b) => a + b.ducats, 0) / rareParts.length : 100;

    const ev = calculateRelicEV({
      commonPlatAvg: commonPlat,
      commonDucatAvg: commonDucat,
      uncommonPlatAvg: uncommonPlat,
      uncommonDucatAvg: uncommonDucat,
      rarePlatAvg: rarePlat,
      rareDucatAvg: rareDucat,
    });

    return {
      matchingParts: matching.slice(0, 4),
      ev,
    };
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'lith': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'meso': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'neo': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'axi': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'requiem': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'omnia': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Relic Altar Spotlight Header */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/80 p-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 overflow-hidden hidden sm:block pointer-events-none">
          <img
            src="/src/assets/images/void_fissure_relic_altar_1793635598431.jpg"
            alt="Void Fissure Relic Altar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>VOID FISSURE LIVE TRACKER & PROFIT OPTIMIZER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            Identify Profitable Relics to Farm & Crack
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Live fissure missions synchronized directly with the Warframe Status API.
            Click any active mission to inspect its relic drop pool with <strong>Ducats and Platinum values displayed side-by-side</strong> to
            calculate your expected return (EV) for Intact vs Radiant refinement.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        {/* Tier filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Tier:</span>
          {['all', 'Lith', 'Meso', 'Neo', 'Axi', 'Omnia', 'Requiem'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors ${
                selectedTier.toLowerCase() === tier.toLowerCase()
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>

        {/* Mission Type and Hardmode */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMission}
            onChange={(e) => setSelectedMission(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="all">All Mission Types</option>
            <option value="fast">Fast (Capture, Exterminate, Rescue)</option>
            <option value="endless">Endless (Survival, Defense, Excavation)</option>
          </select>

          <button
            onClick={() => setSteelPathOnly(!steelPathOnly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded cursor-pointer flex items-center gap-1.5 transition-colors border ${
              steelPathOnly
                ? 'bg-red-950/60 text-red-300 border-red-600/60'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Steel Path Only</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Fissures"
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Fissures List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFissures.map((fissure) => {
          const isExpanded = expandedFissureId === fissure.id;
          const advice = relicAdviceForTier(fissure.tier);
          const isExpiringSoon = new Date(fissure.expiry).getTime() - currentTime < 10 * 60000;

          return (
            <div
              key={fissure.id}
              className={`bg-slate-900/90 border rounded-lg transition-all ${
                isExpanded ? 'border-amber-500/60 shadow-lg' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getTierColor(fissure.tier)}`}>
                    {fissure.tier} {fissure.isHard && '• Steel Path'}
                  </span>

                  <span
                    className={`flex items-center gap-1 text-xs font-mono tabular-nums ${
                      isExpiringSoon ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatRemainingTime(fissure.expiry)}</span>
                  </span>
                </div>

                <div className="text-sm font-bold text-white mb-0.5">{fissure.node}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-300">{fissure.missionType}</span>
                  <span>·</span>
                  <span>{fissure.enemy}</span>
                </div>

                {/* Profit Preview Preview Bar */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Intact Expected EV</span>
                    <span className="font-mono text-sky-300 font-semibold">{advice.ev.intactPlatEV}p</span>
                    <span className="text-slate-500 font-mono text-[11px] ml-1">/ {advice.ev.intactDucatEV}d</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Radiant EV Gain</span>
                    <span className="font-mono text-emerald-400 font-semibold">+{advice.ev.radiantPlatGain}p</span>
                    <span className="text-slate-500 font-mono text-[11px] ml-1">/ +{advice.ev.radiantDucatGain}d</span>
                  </div>
                </div>

                {/* Toggle details */}
                <button
                  onClick={() => setExpandedFissureId(isExpanded ? null : fissure.id)}
                  className="w-full mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-center gap-1 text-xs font-medium text-amber-400/90 hover:text-amber-300 cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Relic Drop Analysis' : 'Analyze Relic Drop Profits'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Relic Optimization Panel */}
              {isExpanded && (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 rounded-b-lg space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Top Dropping Parts in {fissure.tier} Relics:</span>
                  </div>

                  <div className="space-y-2">
                    {advice.matchingParts.map((part) => (
                      <div
                        key={part.id}
                        onClick={() => onSelectItem(part)}
                        className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div className="truncate max-w-[170px]">
                          <span className="text-slate-200 block truncate font-medium">{part.name}</span>
                          <span className="text-[10px] text-slate-400">{part.rarity.toUpperCase()}</span>
                        </div>

                        {/* Side-by-side Ducat and Platinum profit indicator */}
                        <div className="flex items-center gap-3 font-mono text-right shrink-0">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Ducats</span>
                            <span className="text-amber-300 font-bold">{part.ducats}d</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Plat</span>
                            <span className="text-sky-300 font-bold">{part.currentPrice}p</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/60 flex items-center justify-between">
                    <span>Radshare recommendation:</span>
                    <span className="text-amber-400 font-semibold font-mono">
                      {advice.ev.radiantPlatGain > 4 ? 'Upgrade to Radiant' : 'Safe Intact Run'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFissures.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-lg">
          <p className="text-slate-400 text-sm">No active fissures match the selected filter criteria.</p>
          <button
            onClick={() => {
              setSelectedTier('all');
              setSelectedMission('all');
              setSteelPathOnly(false);
            }}
            className="mt-3 px-3 py-1.5 text-xs text-amber-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
