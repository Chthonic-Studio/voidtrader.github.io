/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BaroStatus, BaroStockItem } from '../services/baroKiTeer.ts';
import { Clock, MapPin, Sparkles, ExternalLink, Copy, Check, ArrowUpDown, Coins, Flame, AlertCircle } from 'lucide-react';

interface BaroKiTeerTrackerProps {
  status: BaroStatus;
  isLoading: boolean;
  onRefresh: () => void;
}

export const BaroKiTeerTracker: React.FC<BaroKiTeerTrackerProps> = ({
  status,
  isLoading,
  onRefresh,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'best_ducat' | 'best_plat' | 'plat_desc' | 'plat_asc' | 'ducats_desc' | 'name_asc'
  >('best_ducat');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Clock tick for live countdown
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownText = useMemo(() => {
    const target = status.active
      ? new Date(status.expiry).getTime()
      : new Date(status.activation).getTime();

    const diff = target - currentTime;
    if (diff <= 0) {
      return status.active ? 'Departing now...' : 'Arriving now!';
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return `${hours}h ${minutes}m ${seconds}s`;
  }, [status, currentTime]);

  const filteredStock = useMemo(() => {
    return status.inventory
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'best_ducat') return a.ducatsPerPlat - b.ducatsPerPlat;
        if (sortBy === 'best_plat') return b.ducatsPerPlat - a.ducatsPerPlat;
        if (sortBy === 'plat_desc') return b.marketPlatPrice - a.marketPlatPrice;
        if (sortBy === 'plat_asc') return a.marketPlatPrice - b.marketPlatPrice;
        if (sortBy === 'ducats_desc') return b.ducats - a.ducats;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [status.inventory, selectedCategory, sortBy]);

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://warframe.market/items/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Baro Header Banner & Live Status */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90 p-6">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 opacity-25 overflow-hidden hidden md:block pointer-events-none">
          <img
            src="/src/assets/images/baro_ducat_kiosk_1793635596085.jpg"
            alt="Baro Ki'Teer Terminal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                status.active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${status.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{status.active ? 'BARO KI\'TEER IS ACTIVE' : 'BARO KI\'TEER IN TRANSIT'}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Void Trader Schedule & Tradable Stock Evaluator
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            Evaluate every tradable item Baro Ki'Teer brings. Compare Baro's Ducats price against the current
            player-to-player Platinum price on Warframe Market to decide whether to spend Ducats or buy with Platinum.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Location:</span>
              <span className="text-slate-100 font-bold">{status.location}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">{status.active ? 'Leaves in:' : 'Arrives in:'}</span>
              <span className="text-cyan-300 font-bold tabular-nums">{countdownText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Primed Mod', '60-60 Mod', 'Prisma Weapon', 'Vandal / Wraith Weapon', 'Relic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Stock' : cat}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="best_ducat">Best Value (Buy with Ducats)</option>
            <option value="best_plat">Cheaper with Platinum First</option>
            <option value="plat_desc">Platinum Price (High to Low)</option>
            <option value="plat_asc">Platinum Price (Low to High)</option>
            <option value="ducats_desc">Ducats Cost (High to Low)</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Baro Stock Table with Price Comparison */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold">Tradable Stock Item</th>
                <th className="py-3 px-3 font-semibold text-right">Baro Price</th>
                <th className="py-3 px-3 font-semibold text-right">Market Price</th>
                <th className="py-3 px-3 font-semibold text-right">Ducats / Plat</th>
                <th className="py-3 px-4 font-semibold">Purchase Recommendation</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Item Name */}
                  <td className="py-3 px-4 font-sans">
                    <span className="font-semibold text-slate-100 block">{item.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.category}</span>
                  </td>

                  {/* Baro Price */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    <div className="text-amber-300 font-bold">{item.ducats}d</div>
                    <div className="text-slate-500 text-[10px]">{item.credits.toLocaleString()} Cr</div>
                  </td>

                  {/* Warframe Market Price */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    <div className="text-sky-300 font-bold text-sm">{item.marketPlatPrice}p</div>
                    <div className="text-slate-500 text-[10px]">Active lowest sell</div>
                  </td>

                  {/* Ratio */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        item.verdict === 'BUY_DUCATS'
                          ? 'text-emerald-400'
                          : item.verdict === 'BUY_PLATINUM'
                          ? 'text-sky-400'
                          : 'text-amber-300'
                      }`}
                    >
                      {item.ducatsPerPlat}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans ml-1">d/p</span>
                  </td>

                  {/* Recommendation Verdict */}
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                        item.verdict === 'BUY_DUCATS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : item.verdict === 'BUY_PLATINUM'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.verdictLabel}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.verdictReason}</p>
                  </td>

                  {/* Links */}
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleCopyLink(item.slug, e)}
                        title="Copy Market Link"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
                      >
                        {copiedSlug === item.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={`https://warframe.market/items/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open on Warframe.market"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
