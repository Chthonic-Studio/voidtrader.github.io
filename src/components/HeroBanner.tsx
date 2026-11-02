/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavTab } from './Header.tsx';
import { ShieldCheck, Flame, Coins, Zap } from 'lucide-react';

interface HeroBannerProps {
  onSelectTab: (tab: NavTab) => void;
  activeFissureCount: number;
  avgDucatRatio: number;
  totalItemsCount: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectTab,
  activeFissureCount,
  avgDucatRatio,
  totalItemsCount,
}) => {
  return (
    <div className="relative w-full overflow-hidden border-b border-slate-800/80 bg-slate-950">
      {/* Background with Generated Hero Asset and Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_void_relic_vault_1793635594774.jpg"
          alt="Orokin Void Relic Hall"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a11] via-[#070a11]/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
              <span>Tenno Trading Network</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Void Market Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3" style={{ textWrap: 'balance' }}>
              Maximize Platinum & Void Ducat Trading Yields
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6">
              Track live market orders, evaluate Baro Ki'Teer stock with exact Ducat vs Platinum price comparisons,
              identify the highest-profit Void Fissures, and optimize every trade with automated junk baselines.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectTab('baro')}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Baro Ki'Teer Tracker</span>
              </button>

              <button
                onClick={() => onSelectTab('ducats')}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Evaluate Ducats vs Plat</span>
              </button>

              <button
                onClick={() => onSelectTab('fissures')}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Fissures ({activeFissureCount})</span>
              </button>

              <button
                onClick={() => onSelectTab('trends')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                View Market Timelines →
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 lg:w-[380px]">
            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Avg Ducats / Plat</span>
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
                {avgDucatRatio.toFixed(1)} <span className="text-xs font-sans text-slate-400">d/p</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Junk benchmark: &ge; 10 d/p
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Active Fissures</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {activeFissureCount} <span className="text-xs font-sans text-slate-400">live</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Real-time Void Frequency
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Tradable Catalog</span>
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalItemsCount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Primes, Mods, Arcanes & Relics
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm">
              <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                <span>Vault Security</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-semibold text-emerald-300 mt-0.5">
                100% Private Terminal
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Secure Tenno Local Storage
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
