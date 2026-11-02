/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MarketItem } from '../types/market.ts';
import { calculateDucatPlatRatio } from '../utils/ducatCalculations.ts';
import { Search, Star, ExternalLink, Copy, Check, ArrowUpDown, TrendingUp, TrendingDown, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface MarketScannerProps {
  items: MarketItem[];
  watchlist: string[];
  onToggleWatchlist: (slug: string) => void;
  onSelectItem: (item: MarketItem) => void;
  ducatBenchmark: number;
}

const PAGE_SIZE = 50;

export const MarketScanner: React.FC<MarketScannerProps> = ({
  items,
  watchlist,
  onToggleWatchlist,
  onSelectItem,
  ducatBenchmark,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'price_desc' | 'price_asc' | 'name_asc' | 'name_desc' | 'change_desc' | 'volume_desc' | 'ducat_desc' | 'ducats_val_desc'
  >('price_desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Items' },
    { key: 'prime_warframe', label: 'Prime Warframes' },
    { key: 'prime_weapon', label: 'Prime Weapons' },
    { key: 'prime_component', label: 'Prime Parts' },
    { key: 'mod', label: 'Mods' },
    { key: 'arcane', label: 'Arcanes' },
    { key: 'relic', label: 'Relics' },
  ];

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesCategory = item.category.toLowerCase().includes(q);
          const matchesVaulted = item.isVaulted && 'vaulted'.includes(q);
          if (!matchesName && !matchesCategory && !matchesVaulted) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return b.currentPrice - a.currentPrice;
        if (sortBy === 'price_asc') return a.currentPrice - b.currentPrice;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'change_desc') return b.change7d - a.change7d;
        if (sortBy === 'volume_desc') return b.volume24h - a.volume24h;
        if (sortBy === 'ducats_val_desc') return b.ducats - a.ducats;
        if (sortBy === 'ducat_desc') {
          const ratioA = a.ducats > 0 ? a.ducats / a.currentPrice : 0;
          const ratioB = b.ducats > 0 ? b.ducats / b.currentPrice : 0;
          return ratioB - ratioA;
        }
        return 0;
      });
  }, [items, selectedCategory, searchQuery, sortBy]);

  // Reset page when category or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://warframe.market/items/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search & Sort Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all 3,000+ items, prime warframes, weapons, mods, arcanes, or 'vaulted'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="price_desc">Platinum (High to Low)</option>
            <option value="price_asc">Platinum (Low to High)</option>
            <option value="name_asc">Name (A to Z)</option>
            <option value="name_desc">Name (Z to A)</option>
            <option value="change_desc">7d Trend (% Change)</option>
            <option value="volume_desc">24h Trade Volume</option>
            <option value="ducats_val_desc">Ducats (High to Low)</option>
            <option value="ducat_desc">Ducat / Plat Ratio</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Total Count Header and Pagination Top Strip */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>
          Showing {paginatedItems.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0} -{' '}
          {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} of {filteredItems.length.toLocaleString()} items
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Items Table View */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-3 px-3 font-semibold w-8 text-center">★</th>
                <th className="py-3 px-4 font-semibold font-sans">Tradable Item</th>
                <th className="py-3 px-3 font-semibold text-right">Lowest Sell</th>
                <th className="py-3 px-3 font-semibold text-right">Highest Buy</th>
                <th className="py-3 px-3 font-semibold text-right">48h / 90d Avg</th>
                <th className="py-3 px-3 font-semibold text-right">7d Trend</th>
                <th className="py-3 px-3 font-semibold text-right">Ducats</th>
                <th className="py-3 px-3 font-semibold text-center">Ducat / Plat</th>
                <th className="py-3 px-4 font-semibold text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedItems.map((item) => {
                const isWatched = watchlist.includes(item.slug);
                const ducatRatio = item.ducats > 0 ? (item.ducats / item.currentPrice).toFixed(1) : '-';
                const ratioMetric = item.ducats > 0 ? calculateDucatPlatRatio(item.ducats, item.currentPrice, ducatBenchmark) : null;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Watchlist toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.slug);
                        }}
                        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Item Name & Details */}
                    <td className="py-3 px-4 font-sans font-medium text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </span>
                        {item.isVaulted && (
                          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-1 py-0.2 rounded">
                            Vaulted
                          </span>
                        )}
                        {item.modMaxRank !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 py-0.2 rounded">
                            Rank {item.modMaxRank}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span>{item.category.replace('_', ' ').toUpperCase()}</span>
                        {item.relicSources && item.relicSources.length > 0 && (
                          <>
                            <span className="mx-1">·</span>
                            <span>{item.relicSources[0]}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Sell Price (Platinum) */}
                    <td className="py-3 px-3 text-right text-sky-300 font-bold tabular-nums">
                      {item.currentPrice}p
                    </td>

                    {/* Buy Price (Platinum) */}
                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                      {item.buyPrice}p
                    </td>

                    {/* 48h / 90d Average */}
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      <span>{item.avgPrice48h}p</span>
                      <span className="text-slate-500 text-[10px] ml-1">/ {item.avgPrice90d}p</span>
                    </td>

                    {/* 7d Trend */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        {item.change7d > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">+{item.change7d}%</span>
                          </>
                        ) : item.change7d < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                            <span className="text-rose-400 font-bold">{item.change7d}%</span>
                          </>
                        ) : (
                          <span className="text-slate-400">0.0%</span>
                        )}
                      </div>
                    </td>

                    {/* Ducats */}
                    <td className="py-3 px-3 text-right text-amber-300 font-bold tabular-nums">
                      {item.ducats > 0 ? `${item.ducats}d` : '-'}
                    </td>

                    {/* Ducat / Plat Ratio */}
                    <td className="py-3 px-3 text-center tabular-nums">
                      {ratioMetric ? (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            ratioMetric.recommendation === 'TRADE_DUCAT'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : ratioMetric.recommendation === 'SELL_PLAT'
                              ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                              : 'text-slate-300'
                          }`}
                        >
                          {ducatRatio} d/p
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Actions: Direct Link & Copy */}
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item);
                          }}
                          title="Inspect live prices"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleCopyLink(item.slug, e)}
                          title="Copy Warframe Market link"
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
                          onClick={(e) => e.stopPropagation()}
                          title="Open on Warframe.market"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredItems.length.toLocaleString()} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2 font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
