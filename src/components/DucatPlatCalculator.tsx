/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MarketItem } from '../types/market.ts';
import { calculateDucatPlatRatio } from '../utils/ducatCalculations.ts';
import { Search, ExternalLink, Copy, Check, ArrowUpDown, Coins, Sparkles, AlertCircle } from 'lucide-react';

interface DucatPlatCalculatorProps {
  items: MarketItem[];
  ducatBenchmark: number;
  onUpdateBenchmark: (benchmark: number) => void;
  onSelectItem: (item: MarketItem) => void;
}

export const DucatPlatCalculator: React.FC<DucatPlatCalculatorProps> = ({
  items,
  ducatBenchmark,
  onUpdateBenchmark,
  onSelectItem,
}) => {
  // Search query & selected item
  const [searchQuery, setSearchQuery] = useState<string>('Glaive Prime Blade');
  const [selectedItem, setSelectedItem] = useState<MarketItem>(() => {
    return items.find((i) => i.slug === 'glaive_prime_blade') || items[0];
  });
  const [filterMode, setFilterMode] = useState<'all' | 'junk' | 'sell_plat'>('all');
  const [sortBy, setSortBy] = useState<
    'ratio_desc' | 'ratio_asc' | 'plat_desc' | 'plat_asc' | 'ducats_desc' | 'name_asc'
  >('ratio_desc');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Autocomplete matching items strictly from the database
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return items
      .filter((i) => i.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [items, searchQuery]);

  // Selected item evaluation metrics
  const evaluationResult = useMemo(() => {
    if (!selectedItem) return null;
    return calculateDucatPlatRatio(selectedItem.ducats, selectedItem.currentPrice, ducatBenchmark);
  }, [selectedItem, ducatBenchmark]);

  // All prime items with Ducat values for the matrix
  const matrixItems = useMemo(() => {
    return items
      .filter((i) => i.ducats > 0)
      .map((item) => {
        const metrics = calculateDucatPlatRatio(item.ducats, item.currentPrice, ducatBenchmark);
        return {
          item,
          ...metrics,
        };
      })
      .filter((entry) => {
        if (filterMode === 'junk') return entry.recommendation === 'TRADE_DUCAT';
        if (filterMode === 'sell_plat') return entry.recommendation === 'SELL_PLAT';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'ratio_desc') return b.ducatsPerPlat - a.ducatsPerPlat;
        if (sortBy === 'ratio_asc') return a.ducatsPerPlat - b.ducatsPerPlat;
        if (sortBy === 'plat_desc') return b.item.currentPrice - a.item.currentPrice;
        if (sortBy === 'plat_asc') return a.item.currentPrice - b.item.currentPrice;
        if (sortBy === 'ducats_desc') return b.item.ducats - a.item.ducats;
        if (sortBy === 'name_asc') return a.item.name.localeCompare(b.item.name);
        return 0;
      });
  }, [items, ducatBenchmark, filterMode, sortBy]);

  const handleSelectAutocomplete = (item: MarketItem) => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setIsDropdownOpen(false);
  };

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://warframe.market/items/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Search-First Trade Evaluator Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span>INSTANT ITEM TRADE EVALUATOR</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
            Should You Sell for Platinum or Trade for Ducats?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            Search any Warframe item from the database. We instantly fetch its current market Platinum price,
            its Baro Ki'Teer Ducat return, and calculate the exact trade recommendation.
          </p>

          {/* Autocomplete Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  // If exact match found in database
                  const match = items.find((i) => i.name.toLowerCase() === e.target.value.toLowerCase().trim());
                  if (match) setSelectedItem(match);
                }}
                placeholder="Type an item name (e.g. Glaive Prime Blade, Protea Chassis, Primed Flow)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
              />
            </div>

            {/* Autocomplete Dropdown List */}
            {isDropdownOpen && autocompleteSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl overflow-hidden divide-y divide-slate-800">
                {autocompleteSuggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAutocomplete(item)}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-right">
                      {item.ducats > 0 && (
                        <span className="text-amber-300 font-bold">{item.ducats}d</span>
                      )}
                      <span className="text-sky-300 font-bold">{item.currentPrice}p</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Item Instant Decision Card */}
        {selectedItem && evaluationResult && (
          <div
            className={`p-6 rounded-lg border transition-all ${
              evaluationResult.recommendation === 'TRADE_DUCAT'
                ? 'bg-amber-950/20 border-amber-500/40'
                : evaluationResult.recommendation === 'SELL_PLAT'
                ? 'bg-sky-950/20 border-sky-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg font-bold text-white">{selectedItem.name}</span>
                  {selectedItem.isVaulted && (
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/80 border border-purple-800/80 px-1.5 py-0.5 rounded">
                      Vaulted
                    </span>
                  )}
                </div>

                {/* Plain-English Action Recommendation */}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-sm font-extrabold px-3 py-1 rounded tracking-wide ${
                      evaluationResult.recommendation === 'TRADE_DUCAT'
                        ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : evaluationResult.recommendation === 'SELL_PLAT'
                        ? 'bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                        : 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    }`}
                  >
                    RECOMMENDED: {evaluationResult.verdictText.toUpperCase()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 max-w-xl leading-relaxed">
                  {selectedItem.ducats === 0 ? (
                    'This complete set cannot be traded at Baro Ki\'Teer\'s kiosk. Sell it to other players for Platinum on Warframe Market.'
                  ) : evaluationResult.recommendation === 'TRADE_DUCAT' ? (
                    `Yields ${selectedItem.ducats} Ducats for only ${selectedItem.currentPrice} Platinum (${evaluationResult.ducatsPerPlat} d/p). This is prime Baro junk—convert it to Ducats to buy valuable Primed Mods!`
                  ) : evaluationResult.recommendation === 'SELL_PLAT' ? (
                    `Players are paying ${selectedItem.currentPrice} Platinum for this item on Warframe Market. Scraping this for only ${selectedItem.ducats} Ducats would waste substantial Platinum value!`
                  ) : (
                    `Yields ${selectedItem.ducats} Ducats for ${selectedItem.currentPrice} Platinum (${evaluationResult.ducatsPerPlat} d/p). Fair value: convert to Ducats if you need Baro items, or sell for Platinum.`
                  )}
                </p>
              </div>

              {/* Numerical Metrics Side-Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono shrink-0 lg:w-[420px]">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Ducat Value</span>
                  <span className="text-lg font-bold text-amber-300 tabular-nums">
                    {selectedItem.ducats > 0 ? `${selectedItem.ducats}d` : '0d'}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Market Price</span>
                  <span className="text-lg font-bold text-sky-300 tabular-nums">
                    {selectedItem.currentPrice}p
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Ducats / Plat</span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {evaluationResult.ducatsPerPlat}
                  </span>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Plat / 100d</span>
                  <span className="text-lg font-bold text-slate-200 tabular-nums">
                    {evaluationResult.platPer100Ducats}p
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Calculated against {ducatBenchmark} d/p junk baseline
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleCopyLink(selectedItem.slug, e)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSlug === selectedItem.slug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSlug === selectedItem.slug ? 'Copied' : 'Copy Link'}</span>
                </button>

                <a
                  href={`https://warframe.market/items/${selectedItem.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Warframe.market Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Catalog Matrix Table with Sorting Options */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Prime Components Ducat vs Platinum Catalog
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any item to load it into the Trade Decision Evaluator above
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-md">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({items.filter((i) => i.ducats > 0).length})
              </button>
              <button
                onClick={() => setFilterMode('junk')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'junk' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Baro Junk
              </button>
              <button
                onClick={() => setFilterMode('sell_plat')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filterMode === 'sell_plat' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sell for Plat
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ratio_desc">Best Junk (Ducats/Plat High to Low)</option>
                <option value="ratio_asc">Best Plat (Ducats/Plat Low to High)</option>
                <option value="plat_desc">Platinum Price (High to Low)</option>
                <option value="plat_asc">Platinum Price (Low to High)</option>
                <option value="ducats_desc">Ducats (High to Low)</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Item Name</th>
                <th className="py-3 px-3 font-semibold text-right">Ducats</th>
                <th className="py-3 px-3 font-semibold text-right">Market Price</th>
                <th className="py-3 px-3 font-semibold text-right">Ducats / Plat</th>
                <th className="py-3 px-3 font-semibold text-right">Plat / 100d</th>
                <th className="py-3 px-4 font-semibold">Suggested Action</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {matrixItems.slice(0, 100).map(({ item, ducatsPerPlat, platPer100Ducats, recommendation, verdictText }) => (
                <tr
                  key={item.id}
                  onClick={() => handleSelectAutocomplete(item)}
                  className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    selectedItem?.slug === item.slug ? 'bg-slate-800/60' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-medium text-slate-100 flex items-center gap-2">
                    <span className="truncate max-w-[220px]">{item.name}</span>
                    {item.isVaulted && (
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.2 rounded">
                        Vaulted
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-300 font-bold tabular-nums">
                    {item.ducats}d
                  </td>
                  <td className="py-3 px-3 text-right text-sky-300 font-bold tabular-nums">
                    {item.currentPrice}p
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        ducatsPerPlat >= ducatBenchmark * 1.15
                          ? 'text-amber-400'
                          : ducatsPerPlat <= ducatBenchmark * 0.75
                          ? 'text-sky-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {ducatsPerPlat}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans ml-1">d/p</span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                    {platPer100Ducats}p
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                        recommendation === 'TRADE_DUCAT'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : recommendation === 'SELL_PLAT'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {verdictText}
                    </span>
                  </td>
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
                        onClick={(e) => e.stopPropagation()}
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
