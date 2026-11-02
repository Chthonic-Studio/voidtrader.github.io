/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MarketItem, PriceHistoryPoint } from '../types/market.ts';
import { TrendingUp, TrendingDown, Activity, Calendar, Camera, Clock, Check, ExternalLink } from 'lucide-react';

interface TrendTimelinesProps {
  items: MarketItem[];
  snapshots: { timestamp: string; slug: string; price: number; ducats: number }[];
  onTakeSnapshot: (slug: string, price: number, ducats: number) => void;
  onSelectItem: (item: MarketItem) => void;
}

export const TrendTimelines: React.FC<TrendTimelinesProps> = ({
  items,
  snapshots,
  onTakeSnapshot,
  onSelectItem,
}) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(items[0]?.slug || 'glaive_prime_set');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [snapshotTaken, setSnapshotTaken] = useState<boolean>(false);

  const selectedItem = useMemo(() => {
    return items.find((i) => i.slug === selectedSlug) || items[0];
  }, [items, selectedSlug]);

  const topGainers = useMemo(() => {
    return [...items].sort((a, b) => b.change7d - a.change7d).slice(0, 4);
  }, [items]);

  const topLosers = useMemo(() => {
    return [...items].sort((a, b) => a.change7d - b.change7d).slice(0, 4);
  }, [items]);

  const topVolume = useMemo(() => {
    return [...items].sort((a, b) => b.volume24h - a.volume24h).slice(0, 4);
  }, [items]);

  const history = selectedItem?.history || [];

  // SVG Chart rendering math
  const chartHeight = 220;
  const chartWidth = 650;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };

  const { minVal, maxVal, pointsPath, areaPath } = useMemo(() => {
    if (history.length === 0) {
      return { minVal: 0, maxVal: 100, pointsPath: '', areaPath: '' };
    }

    const prices = history.map((h) => h.avg);
    const min = Math.min(...prices) * 0.9;
    const max = Math.max(...prices) * 1.1;

    const innerW = chartWidth - padding.left - padding.right;
    const innerH = chartHeight - padding.top - padding.bottom;

    const coords = history.map((h, i) => {
      const x = padding.left + (i / (history.length - 1)) * innerW;
      const y = padding.top + innerH - ((h.avg - min) / (max - min || 1)) * innerH;
      return { x, y };
    });

    const pathD = coords.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${padding.top + innerH} L ${coords[0].x} ${padding.top + innerH} Z`;

    return { minVal: min, maxVal: max, pointsPath: pathD, areaPath: areaD };
  }, [history]);

  const handleSnapshot = () => {
    if (!selectedItem) return;
    onTakeSnapshot(selectedItem.slug, selectedItem.currentPrice, selectedItem.ducats);
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  const itemSnapshots = snapshots.filter((s) => s.slug === selectedSlug);

  return (
    <div className="space-y-8">
      {/* 3-Column Global Market Trends Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top 7d Gainers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Top 7d Gainers</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">Bullish Momentum</span>
          </div>

          <div className="space-y-2.5">
            {topGainers.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSlug(item.slug)}
                className={`p-2.5 rounded border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                  selectedSlug === item.slug
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="truncate max-w-[150px]">
                  <span className="text-slate-200 block truncate font-medium">{item.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.currentPrice}p</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold">+{item.change7d}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 7d Declines / Dip Opportunities */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Price Corrections</span>
            </h3>
            <span className="text-[11px] font-mono text-rose-400">Dip Buying Target</span>
          </div>

          <div className="space-y-2.5">
            {topLosers.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSlug(item.slug)}
                className={`p-2.5 rounded border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                  selectedSlug === item.slug
                    ? 'bg-rose-950/40 border-rose-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="truncate max-w-[150px]">
                  <span className="text-slate-200 block truncate font-medium">{item.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.currentPrice}p</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-rose-400 font-bold">{item.change7d}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Trading Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Highest Liquidity</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">24h Orders</span>
          </div>

          <div className="space-y-2.5">
            {topVolume.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedSlug(item.slug)}
                className={`p-2.5 rounded border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                  selectedSlug === item.slug
                    ? 'bg-cyan-950/40 border-cyan-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="truncate max-w-[150px]">
                  <span className="text-slate-200 block truncate font-medium">{item.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.currentPrice}p</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-cyan-300 font-bold">{item.volume24h} trades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Historical Price Timeline & Chart View */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-amber-400 font-mono">TIMELINE RADAR</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">30-Day Moving Pricing Curve</span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{selectedItem.name}</span>
              {selectedItem.ducats > 0 && (
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  {selectedItem.ducats} Ducats
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {items.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name} ({i.currentPrice}p)
                </option>
              ))}
            </select>

            <button
              onClick={handleSnapshot}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {snapshotTaken ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Saved!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Log Snapshot</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SVG Interactive Timeline Chart */}
        <div className="relative w-full overflow-hidden bg-slate-950/70 border border-slate-800 rounded-md p-4">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 sm:h-64 overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = padding.top + (chartHeight - padding.top - padding.bottom) * pct;
              const val = Math.round(maxVal - (maxVal - minVal) * pct);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val}p
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line stroke */}
            <path
              d={pointsPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {history.map((h, i) => {
              const innerW = chartWidth - padding.left - padding.right;
              const innerH = chartHeight - padding.top - padding.bottom;
              const x = padding.left + (i / (history.length - 1)) * innerW;
              const y = padding.top + innerH - ((h.avg - minVal) / (maxVal - minVal || 1)) * innerH;
              const isHovered = hoveredPointIndex === i;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHoveredPointIndex(i)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? '#ffffff' : '#f59e0b'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-all"
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPointIndex !== null && history[hoveredPointIndex] && (
            <div className="absolute top-6 right-6 p-3 bg-slate-900 border border-slate-700 rounded-md shadow-xl text-xs font-mono">
              <div className="text-slate-400 mb-1">{history[hoveredPointIndex].date}</div>
              <div className="text-amber-300 font-bold text-sm">
                Avg: {history[hoveredPointIndex].avg} Plat
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Range: {history[hoveredPointIndex].min}p – {history[hoveredPointIndex].max}p
              </div>
              <div className="text-slate-400 text-[11px]">
                Volume: {history[hoveredPointIndex].volume} trades
              </div>
            </div>
          )}
        </div>

        {/* LocalStorage Recorded Snapshots History */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Client-Side Recorded Snapshots ({itemSnapshots.length})</span>
            </span>
            <span className="text-[11px] text-slate-500">Stored in localStorage</span>
          </div>

          {itemSnapshots.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {itemSnapshots.map((snap, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono flex items-center gap-2"
                >
                  <span className="text-slate-400 text-[10px]">
                    {new Date(snap.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-sky-300 font-bold">{snap.price}p</span>
                  {snap.ducats > 0 && <span className="text-amber-300 text-[11px]">({snap.ducats}d)</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No personal snapshots recorded for this item yet. Click "Log Snapshot" to start tracking your local timeline.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
