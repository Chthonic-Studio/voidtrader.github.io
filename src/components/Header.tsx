/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, Download, Database } from 'lucide-react';

export type NavTab = 'scanner' | 'baro' | 'ducats' | 'fissures' | 'trends';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onRefresh,
  isRefreshing,
  onExport,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between gap-6">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('scanner');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 select-none hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-amber-500 to-amber-200 rotate-45 inline-block shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
          <span>VOIDTRADER</span>
          <span className="text-xs font-mono font-normal text-amber-400/90 tracking-widest pl-1">TERMINAL</span>
        </a>
      </div>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onSelectTab('scanner')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
            activeTab === 'scanner'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Market Scanner
        </button>

        <button
          onClick={() => onSelectTab('baro')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'baro'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <span>Baro Ki'Teer Tracker</span>
        </button>

        <button
          onClick={() => onSelectTab('ducats')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
            activeTab === 'ducats'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Ducats vs Plat
        </button>

        <button
          onClick={() => onSelectTab('fissures')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
            activeTab === 'fissures'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Void Fissures
        </button>

        <button
          onClick={() => onSelectTab('trends')}
          className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
            activeTab === 'trends'
              ? 'text-amber-400 border-amber-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          Market Trends
        </button>
      </nav>

      {/* Zone 3: 1 primary action + subtle backup trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onExport}
          title="Backup/Export client-side local cache to JSON"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
          aria-label="Export data backup"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-md hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
        </button>
      </div>
    </header>
  );
};
