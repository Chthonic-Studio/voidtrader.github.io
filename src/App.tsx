/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header, NavTab } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { MarketScanner } from './components/MarketScanner.tsx';
import { BaroKiTeerTracker } from './components/BaroKiTeerTracker.tsx';
import { DucatPlatCalculator } from './components/DucatPlatCalculator.tsx';
import { FissureTracker } from './components/FissureTracker.tsx';
import { TrendTimelines } from './components/TrendTimelines.tsx';
import { ItemDetailModal } from './components/ItemDetailModal.tsx';
import { MarketItem, VoidFissure, UserPreferences } from './types/market.ts';
import fullCatalogData from './data/fullCatalog.json';
import { fetchLiveFissures } from './services/warframeMarketApi.ts';
import { fetchBaroKiTeerStatus, BaroStatus } from './services/baroKiTeer.ts';
import {
  getStoredWatchlist,
  saveWatchlist,
  toggleWatchlistItem,
  getStoredPreferences,
  savePreferences,
  getStoredPriceSnapshots,
  savePriceSnapshot,
  exportUserData,
} from './utils/marketStorage.ts';

const FULL_CATALOG = (fullCatalogData as unknown) as MarketItem[];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('scanner');
  const [items, setItems] = useState<MarketItem[]>(FULL_CATALOG);
  const [fissures, setFissures] = useState<VoidFissure[]>([]);
  const [isLoadingFissures, setIsLoadingFissures] = useState<boolean>(true);
  const [baroStatus, setBaroStatus] = useState<BaroStatus | null>(null);
  const [isLoadingBaro, setIsLoadingBaro] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // LocalStorage state
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences());
  const [snapshots, setSnapshots] = useState<{ timestamp: string; slug: string; price: number; ducats: number }[]>([]);

  // Modal
  const [selectedModalItem, setSelectedModalItem] = useState<MarketItem | null>(null);

  // Initialize storage state on mount
  useEffect(() => {
    setWatchlist(getStoredWatchlist());
    setPreferences(getStoredPreferences());
    setSnapshots(getStoredPriceSnapshots());
  }, []);

  // Fetch live Void Fissures
  const loadFissures = useCallback(async () => {
    setIsLoadingFissures(true);
    try {
      const data = await fetchLiveFissures(preferences.defaultPlatform || 'pc');
      setFissures(data);
    } catch (err) {
      console.warn('Fissure fetch error:', err);
    } finally {
      setIsLoadingFissures(false);
    }
  }, [preferences.defaultPlatform]);

  // Fetch Baro Ki'Teer schedule and stock
  const loadBaro = useCallback(async () => {
    setIsLoadingBaro(true);
    try {
      const status = await fetchBaroKiTeerStatus();
      setBaroStatus(status);
    } catch (err) {
      console.warn('Baro status fetch error:', err);
    } finally {
      setIsLoadingBaro(false);
    }
  }, []);

  useEffect(() => {
    loadFissures();
    loadBaro();
  }, [loadFissures, loadBaro]);

  // Handle live data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadFissures(), loadBaro()]);

    // Slightly simulate price tick updates on high volume items
    setItems((prev) =>
      prev.map((item) => {
        if (Math.random() > 0.4) {
          const jitter = (Math.random() - 0.5) * 0.04;
          const newPrice = Math.max(1, Math.round(item.currentPrice * (1 + jitter) * 10) / 10);
          return {
            ...item,
            currentPrice: newPrice,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleToggleWatchlist = (slug: string) => {
    const updated = toggleWatchlistItem(slug);
    setWatchlist(updated);
  };

  const handleUpdateBenchmark = (val: number) => {
    const updated = { ...preferences, ducatBenchmark: val };
    setPreferences(updated);
    savePreferences(updated);
  };

  const handleTakeSnapshot = (slug: string, price: number, ducats: number) => {
    savePriceSnapshot(slug, price, ducats);
    setSnapshots(getStoredPriceSnapshots());
  };

  // Average Ducat ratio across all active prime items in database
  const avgDucatRatio = useMemo(() => {
    const primeParts = items.filter((i) => i.ducats > 0 && i.currentPrice > 0);
    if (primeParts.length === 0) return 10.0;
    const sum = primeParts.reduce((acc, curr) => acc + curr.ducats / curr.currentPrice, 0);
    return sum / primeParts.length;
  }, [items]);

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onExport={exportUserData}
      />

      {/* Hero Banner with Key Metrics and Artwork */}
      <HeroBanner
        onSelectTab={setActiveTab}
        activeFissureCount={fissures.length}
        avgDucatRatio={avgDucatRatio}
        totalItemsCount={items.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'scanner' && (
          <MarketScanner
            items={items}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectItem={setSelectedModalItem}
            ducatBenchmark={preferences.ducatBenchmark}
          />
        )}

        {activeTab === 'baro' && baroStatus && (
          <BaroKiTeerTracker
            status={baroStatus}
            isLoading={isLoadingBaro}
            onRefresh={loadBaro}
          />
        )}

        {activeTab === 'ducats' && (
          <DucatPlatCalculator
            items={items}
            ducatBenchmark={preferences.ducatBenchmark}
            onUpdateBenchmark={handleUpdateBenchmark}
            onSelectItem={setSelectedModalItem}
          />
        )}

        {activeTab === 'fissures' && (
          <FissureTracker
            fissures={fissures}
            items={items}
            isLoading={isLoadingFissures}
            onRefresh={loadFissures}
            onSelectItem={setSelectedModalItem}
          />
        )}

        {activeTab === 'trends' && (
          <TrendTimelines
            items={items}
            snapshots={snapshots}
            onTakeSnapshot={handleTakeSnapshot}
            onSelectItem={setSelectedModalItem}
          />
        )}
      </main>

      {/* Item Detail & Price Inspection Modal */}
      <ItemDetailModal
        item={selectedModalItem}
        onClose={() => setSelectedModalItem(null)}
        isWatched={selectedModalItem ? watchlist.includes(selectedModalItem.slug) : false}
        onToggleWatchlist={handleToggleWatchlist}
        ducatBenchmark={preferences.ducatBenchmark}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-semibold text-slate-300">VOIDTRADER</span>
            <span>·</span>
            <span>Tenno Void Trading & Ducat Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://warframe.market"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Warframe.market
            </a>
            <a
              href="https://warframestat.us"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Warframe World State
            </a>
            <button
              onClick={exportUserData}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Export Local Cache
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
