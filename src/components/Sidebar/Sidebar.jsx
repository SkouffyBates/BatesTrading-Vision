import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Brain,
  ScrollText,
  Globe,
  Plus,
  Download,
  Upload
  , Settings,
  Activity
} from 'lucide-react';
import { VIEWS } from '../../utils/constants';
import SettingsModal from '../Common/SettingsModal';

const Sidebar = ({
  currentView,
  onViewChange,
  currentAccountId,
  onAccountChange,
  accounts,
  onAccountModalOpen,
  onExport,
  onImportClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <>
      {/* Mobile burger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
      </button>

      {/* Overlay for mobile when open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`w-64 sidebar bg-slate-950 border-r border-slate-800 flex flex-col transform transition-transform z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64`}>
      <div className="sidebar-brand u-card">
        <h1 className="text-2xl font-extrabold tracking-tight brutal-title">
          BatesTrading<span className="font-light text-white">Vision</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 neon-badge">Journal</p>
      </div>

      {/* Account Selector */}
      <div className="px-4 pt-4">
        <div className="u-card rounded-lg p-2">
          <label className="text-xs text-slate-500 uppercase font-bold mb-1 block pl-1">
            Compte Actif
          </label>
          <select
            value={currentAccountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Vue Globale (Tous)</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id} className="bg-slate-900 text-white">
                {acc.name}
              </option>
            ))}
          </select>
          <button
            onClick={onAccountModalOpen}
            className="w-full mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 py-1 border border-dashed border-slate-700 hover:border-cyan-500 rounded transition-colors"
          >
            <Plus size={12} /> Gérer les comptes
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => onViewChange(VIEWS.DASHBOARD)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.DASHBOARD ? 'active' : ''
          }`}
        >
          <LayoutDashboard size={20} /> <span className="nav-label">Dashboard</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.TRADING)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.TRADING ? 'active' : ''
          }`}
        >
          <BookOpen size={20} /> <span className="nav-label">Journal</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.ANALYSIS)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.ANALYSIS ? 'active' : ''
          }`}
        >
          <BarChart2 size={20} /> <span className="nav-label">Analyse</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.MACRO)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.MACRO ? 'active' : ''
          }`}
        >
          <Globe size={20} /> <span className="nav-label">MacroEdge</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.ECO_WATCH)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.ECO_WATCH ? 'active' : ''
          }`}
        >
          <Activity size={20} /> <span className="nav-label">Veille Éco</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.PSYCHOLOGY)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.PSYCHOLOGY ? 'active' : ''
          }`}
        >
          <Brain size={20} /> <span className="nav-label">Psychologie</span>
        </button>
        <button
          onClick={() => onViewChange(VIEWS.PLAN)}
          className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            currentView === VIEWS.PLAN ? 'active' : ''
          }`}
        >
          <ScrollText size={20} /> <span className="nav-label">Plan de Trading</span>
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 u-card text-slate-300 text-sm py-2 rounded-lg transition-colors"
        >
          <Download size={16} /> Backup Data
        </button>
        <button
          onClick={onImportClick}
          className="w-full flex items-center justify-center gap-2 u-card text-slate-300 text-sm py-2 rounded-lg transition-colors"
        >
          <Upload size={16} /> Import Data
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center justify-center gap-2 u-card text-slate-300 text-sm py-2 rounded-lg transition-colors"
        >
          <Settings size={16} /> Paramètres
        </button>
      </div>
      </aside>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Sidebar;
