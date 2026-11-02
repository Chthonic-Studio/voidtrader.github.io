/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketItem } from '../types/market.ts';
import { calculateDucatPlatRatio } from '../utils/ducatCalculations.ts';
import { X, ExternalLink, Copy, Check, Star, Coins, TrendingUp, TrendingDown, Shield } from 'lucide-react';

interface ItemDetailModalProps {
  item: MarketItem | null;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatchlist: (slug: string) => void;
  ducatBenchmark: number;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  isWatched,
  onToggleWatchlist,
  ducatBenchmark,
}) => {
  if (!item) return null;

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const ducatMetrics = item.ducats > 0 ? calculateDucatPlatRatio(item.ducats, item.currentPrice, ducatBenchmark) : null;
  const spread = Math.max(0, item.currentPrice - item.buyPrice);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://warframe.market/items/${item.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c1220] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h2 className="text-lg font-bold text-white tracking-tight">{item.name}</h2>
            {item.isVaulted && (
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/70 border border-purple-800/80 px-1.5 py-0.5 rounded">
                Vaulted
              </span>
            )}
            {item.modMaxRank !== undefined && (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Max Rank {item.modMaxRank}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(item.slug)}
              title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded cursor-pointer transition-colors"
            >
              <Star className={`w-4 h-4 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5">
          {/* Market Price Grid */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
              Live Market Valuation
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block">Lowest Sell Price</span>
                <span className="text-2xl font-bold font-mono text-sky-300 tabular-nums">
                  {item.currentPrice}p
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Instant purchase</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block">Highest Buy Offer</span>
                <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
                  {item.buyPrice}p
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Instant sell offer</span>
              </div>

              <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
                <span className="text-[10px] uppercase text-slate-400 block">Bid-Ask Spread</span>
                <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
                  {spread}p
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Trader margin</span>
              </div>
            </div>
          </div>

          {/* Historical Trends Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded">
              <span className="text-[10px] text-slate-400 block font-sans">48h Average</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">{item.avgPrice48h}p</span>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded">
              <span className="text-[10px] text-slate-400 block font-sans">90d Average</span>
              <span className="text-sm font-bold text-slate-200 tabular-nums">{item.avgPrice90d}p</span>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded">
              <span className="text-[10px] text-slate-400 block font-sans">7d Trend</span>
              <div className="flex items-center gap-1">
                {item.change7d > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">+{item.change7d}%</span>
                  </>
                ) : item.change7d < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                    <span className="text-sm font-bold text-rose-400 tabular-nums">{item.change7d}%</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-slate-400 tabular-nums">0.0%</span>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded">
              <span className="text-[10px] text-slate-400 block font-sans">Trading Tax</span>
              <span className="text-sm font-bold text-slate-300 tabular-nums">
                {item.tradingTax.toLocaleString()} Cr
              </span>
            </div>
          </div>

          {/* Ducats vs Platinum Evaluation Card (if item grants Ducats) */}
          {ducatMetrics && (
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Ducat vs Plat Optimization</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {ducatMetrics.ducatsPerPlat} Ducats / Plat
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400">Verdict:</span>
                  <span
                    className={`ml-2 font-bold text-xs px-2.5 py-0.5 rounded ${
                      ducatMetrics.recommendation === 'TRADE_DUCAT'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : ducatMetrics.recommendation === 'SELL_PLAT'
                        ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40'
                        : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                    }`}
                  >
                    {ducatMetrics.verdictText}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Yields <span className="text-amber-300 font-bold">{item.ducats}d</span> vs <span className="text-sky-300 font-bold">{item.currentPrice}p</span>
                </div>
              </div>
            </div>
          )}

          {/* Relic Drop Sources (if applicable) */}
          {item.relicSources && item.relicSources.length > 0 && (
            <div className="text-xs">
              <span className="text-slate-400 block mb-1.5 font-semibold">Drop Sources & Relics:</span>
              <div className="flex flex-wrap gap-1.5">
                {item.relicSources.map((r, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-slate-300 text-[11px]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Share link and Open Warframe Market page */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-4">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
          </button>

          <a
            href={`https://warframe.market/items/${item.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Open on Warframe.market</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
