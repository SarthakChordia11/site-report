import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  Mic,
  Lightbulb,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import type { TradeRosterItem, AgencyLog, WorkerInduction } from '../../../types';

interface LabourModuleProps {
  trades?: TradeRosterItem[];
  agencies?: AgencyLog[];
  safetyInductions?: WorkerInduction[];
  inductions?: WorkerInduction[];
  onUpdateTrades: (trades: TradeRosterItem[]) => void;
  onOpenAIModal: () => void;
}

export const LabourModule: React.FC<LabourModuleProps> = ({
  trades = [],
  agencies = [],
  safetyInductions,
  inductions = [],
  onUpdateTrades,
  onOpenAIModal,
}) => {
  const activeInductions = safetyInductions || inductions || [];
  const [subTab, setSubTab] = useState<'attendance' | 'wages' | 'mobilization' | 'productivity' | 'safety' | 'agencies'>('attendance');
  const [searchWorker, setSearchWorker] = useState('');

  // Computations
  const totalPlanned = trades.reduce((acc, t) => acc + (t.plannedCount || 0), 0);
  const totalPresent = trades.reduce((acc, t) => acc + (t.presentCount || 0), 0);
  const totalAbsent = trades.reduce((acc, t) => acc + (t.absentCount || 0), 0);
  const totalOTHours = trades.reduce((acc, t) => acc + (t.overtimeHours || 0), 0);
  const totalOnSite = trades.reduce((acc, t) => acc + (t.onSiteCount || 0), 0);
  const totalOffSite = trades.reduce((acc, t) => acc + (t.offSiteCount || 0), 0);

  const totalDailyBaseWage = trades.reduce((acc, t) => acc + ((t.presentCount || 0) * (t.ratePerDay || 0)), 0);
  const totalDailyOTWage = trades.reduce((acc, t) => acc + ((t.overtimeHours || 0) * ((t.ratePerDay || 0) / 8) * (t.otRateMultiplier || 1.5)), 0);
  const totalDailyWage = Math.round(totalDailyBaseWage + totalDailyOTWage);

  const mobilizationRate = totalPlanned > 0 ? Math.round((totalPresent / totalPlanned) * 100) : 0;
  const shortfallCount = Math.max(0, totalPlanned - totalPresent);

  const handleAdjustCount = (tradeName: string, field: 'presentCount' | 'overtimeHours', delta: number) => {
    const updated = trades.map((t) => {
      if (t.trade === tradeName) {
        if (field === 'presentCount') {
          const newPresent = Math.max(0, (t.presentCount || 0) + delta);
          const newAbsent = Math.max(0, (t.plannedCount || 0) - newPresent);
          return {
            ...t,
            presentCount: newPresent,
            absentCount: newAbsent,
            onSiteCount: Math.min(newPresent, t.onSiteCount || 0),
          };
        }
        if (field === 'overtimeHours') {
          return {
            ...t,
            overtimeHours: Math.max(0, (t.overtimeHours || 0) + delta),
          };
        }
      }
      return t;
    });
    onUpdateTrades(updated);
  };

  const handleUpdateRate = (tradeName: string, newRate: number) => {
    const updated = trades.map((t) => {
      if (t.trade === tradeName) {
        return { ...t, ratePerDay: Math.max(0, newRate) };
      }
      return t;
    });
    onUpdateTrades(updated);
  };

  const handleUpdateOTMultiplier = (tradeName: string, newMultiplier: number) => {
    const updated = trades.map((t) => {
      if (t.trade === tradeName) {
        return { ...t, otRateMultiplier: Math.max(1, newMultiplier) };
      }
      return t;
    });
    onUpdateTrades(updated);
  };

  const handleAdjustRateDelta = (tradeName: string, delta: number) => {
    const updated = trades.map((t) => {
      if (t.trade === tradeName) {
        const nextRate = Math.max(0, (t.ratePerDay || 0) + delta);
        return { ...t, ratePerDay: nextRate };
      }
      return t;
    });
    onUpdateTrades(updated);
  };

  // Add Custom Trade State
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [newTradeName, setNewTradeName] = useState('');
  const [newTradeWorkType, setNewTradeWorkType] = useState('');
  const [newTradePlanned, setNewTradePlanned] = useState<number | ''>(4);
  const [newTradePresent, setNewTradePresent] = useState<number | ''>(4);
  const [newTradeWageRate, setNewTradeWageRate] = useState<number | ''>(850);
  const [newTradeOTMultiplier, setNewTradeOTMultiplier] = useState<number | ''>(1.5);

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTradeName.trim()) return;

    const planned = Number(newTradePlanned) || 0;
    const present = Number(newTradePresent) || 0;
    const wageRate = Number(newTradeWageRate) || 800;
    const otMult = Number(newTradeOTMultiplier) || 1.5;

    if (trades.some(t => t.trade.toLowerCase() === newTradeName.trim().toLowerCase())) {
      alert(`Trade "${newTradeName}" already exists on this site roster.`);
      return;
    }

    const newRosterItem: TradeRosterItem = {
      trade: newTradeName.trim(),
      plannedCount: planned,
      presentCount: present,
      absentCount: Math.max(0, planned - present),
      leaveCount: 0,
      ratePerDay: wageRate,
      overtimeHours: 0,
      otRateMultiplier: otMult,
      productivityOutput: 0,
      productivityUnit: 'Nos',
      workType: newTradeWorkType.trim() || 'General Civil Works',
      onSiteCount: present,
      offSiteCount: 0,
    };

    onUpdateTrades([...trades, newRosterItem]);
    setShowAddTradeModal(false);
    setNewTradeName('');
    setNewTradeWorkType('');
    setNewTradePlanned(4);
    setNewTradePresent(4);
    setNewTradeWageRate(850);
    setNewTradeOTMultiplier(1.5);
  };

  const handleRemoveTrade = (tradeName: string) => {
    if (confirm(`Remove "${tradeName}" from this site's roster?`)) {
      const updated = trades.filter(t => t.trade !== tradeName);
      onUpdateTrades(updated);
    }
  };

  const filteredInductions = activeInductions.filter(w =>
    (w.workerName || '').toLowerCase().includes(searchWorker.toLowerCase()) ||
    (w.trade || '').toLowerCase().includes(searchWorker.toLowerCase()) ||
    (w.agency || '').toLowerCase().includes(searchWorker.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title & AI Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161A24] p-5 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Module 1: Labour Management
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] bg-[#FF5E14]/15 text-[#FF5E14] font-semibold rounded-full border border-[#FF5E14]/30">
                  Voice Attendance Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Multi-trade muster roll, subcontractor allocation, wage computation, and mobilization tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddTradeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full text-xs border border-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FF5E14]" />
            <span>+ Add Custom Trade</span>
          </button>
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 transition-all cursor-pointer active:scale-95"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>Voice Muster Entry ("Aaj mason 14 present...")</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'attendance', label: 'Attendance Dashboard' },
          { id: 'wages', label: 'Wage & OT Calculator' },
          { id: 'mobilization', label: 'Mobilization & Shortfall' },
          { id: 'productivity', label: 'Productivity & Output' },
          { id: 'safety', label: 'Safety Induction (HSE)' },
          { id: 'agencies', label: 'Subcontractor Agencies' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-white text-neutral-950 shadow-md font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 4 Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Total Headcount</span>
            <UserCheck className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">{totalPresent}</span>
            <span className="text-xs text-neutral-400 font-medium">/ {totalPlanned} Planned</span>
          </div>
          <div className="mt-2.5 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#FF5E14] h-full rounded-full" style={{ width: `${Math.min(100, mobilizationRate)}%` }}></div>
          </div>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Site vs Yard Split</span>
            <Building className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-white">{totalOnSite} Site</span>
            <span className="text-xs text-neutral-400">/ {totalOffSite} Yard</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Casting Yard: 18 tradesmen</p>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Overtime (OT) Log</span>
            <Clock className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#FF5E14]">{totalOTHours} hrs</span>
            <span className="text-xs text-neutral-400">logged today</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Carpenters: 12h OT (Shuttering)</p>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Daily Manpower Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">₹{totalDailyWage.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Base: ₹{totalDailyBaseWage.toLocaleString()} + OT: ₹{totalDailyOTWage.toLocaleString()}</p>
        </div>
      </div>

      {/* SubTab 1: Attendance Dashboard */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Trade-Wise Headcount Roster</span>
                <span className="text-xs text-neutral-400 font-normal">({trades.length} Active Trades)</span>
              </h3>
              <span className="text-xs text-[#FF5E14] bg-[#FF5E14]/15 px-2.5 py-0.5 rounded-full border border-[#FF5E14]/30 font-semibold">
                Live Voice Sync Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0D13] text-neutral-400 font-semibold uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Trade Name</th>
                    <th className="py-3 px-3 text-center">Planned</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-3 text-center">OT Hours</th>
                    <th className="py-3 px-3">On-Site / Yard</th>
                    <th className="py-3 px-3">Daily Wage Rate (₹/day)</th>
                    <th className="py-3 px-3 text-right">Quick Tweak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trades.map((t) => (
                    <tr key={t.trade} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF5E14]"></span>
                          <span>{t.trade}</span>
                        </div>
                        <span className="text-[11px] text-neutral-400 block font-normal">{t.workType}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-neutral-400">
                        {t.plannedCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-mono font-bold bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30">
                          {t.presentCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-mono ${
                          t.absentCount > 0 ? 'bg-white/5 text-neutral-300 font-semibold border border-white/10' : 'text-neutral-500'
                        }`}>
                          {t.absentCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {t.overtimeHours > 0 ? (
                          <span className="text-[#FF5E14] font-semibold bg-[#FF5E14]/15 px-2 py-0.5 rounded-full border border-[#FF5E14]/30">
                            {t.overtimeHours} hrs
                          </span>
                        ) : (
                          <span className="text-neutral-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-neutral-300">
                          <span className="text-white font-medium">{t.onSiteCount} Site</span>
                          <span className="text-neutral-600 mx-1">|</span>
                          <span className="text-neutral-400">{t.offSiteCount} Yard</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 bg-[#0B0D13] px-2.5 py-1 rounded-xl border border-white/10 focus-within:border-[#FF5E14] focus-within:ring-1 focus-within:ring-[#FF5E14]/40 w-fit">
                          <span className="text-neutral-400 font-mono text-xs font-semibold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={t.ratePerDay ?? ''}
                            onChange={(e) => handleUpdateRate(t.trade, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-transparent text-white font-mono text-xs font-bold focus:outline-none"
                            title="Click to edit manual daily wage for this trade"
                          />
                          <span className="text-neutral-500 text-[10px]">/day</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-[#0B0D13] p-1 rounded-xl border border-white/10">
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'presentCount', -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Decrease present"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'presentCount', 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-white hover:bg-[#FF5E14] hover:text-white font-bold transition-colors cursor-pointer"
                            title="Increase present"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'overtimeHours', 1)}
                            className="px-2 h-6 text-[10px] text-[#FF5E14] hover:bg-[#FF5E14] hover:text-white rounded-lg font-medium transition-colors cursor-pointer"
                            title="+1h Overtime"
                          >
                            +1h OT
                          </button>
                          <button
                            onClick={() => handleRemoveTrade(t.trade)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-0.5"
                            title={`Remove ${t.trade} from roster`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Wage & OT Calculator */}
      {subTab === 'wages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Daily Wage Breakdown & Rate Configuration</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Customize daily wages and overtime multipliers per trade. Updates roll up automatically into Module 4 Cost EVM.</p>
                </div>
                <button
                  onClick={() => setShowAddTradeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5E14]/15 hover:bg-[#FF5E14]/25 text-[#FF5E14] font-bold rounded-xl text-xs border border-[#FF5E14]/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Trade</span>
                </button>
              </div>

              <div className="space-y-3">
                {trades.map((t) => {
                  const base = (t.presentCount || 0) * (t.ratePerDay || 0);
                  const otMultiplier = t.otRateMultiplier || 1.5;
                  const otWage = (t.overtimeHours || 0) * (((t.ratePerDay || 0) / 8) * otMultiplier);
                  const total = base + otWage;

                  return (
                    <div key={t.trade} className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{t.trade}</span>
                          <span className="text-neutral-400 font-mono">({t.presentCount} present {t.overtimeHours > 0 ? `+ ${t.overtimeHours}h OT` : ''})</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Base: ₹{base.toLocaleString()} {t.overtimeHours > 0 && `+ OT (${t.overtimeHours}h @ ${otMultiplier}x): ₹${Math.round(otWage).toLocaleString()}`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Daily Wage Rate Input with quick -50 / +50 revision buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAdjustRateDelta(t.trade, -50)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg text-[10px] font-mono border border-white/10 transition-colors cursor-pointer"
                            title="Decrease daily wage by ₹50"
                          >
                            -50
                          </button>
                          <div className="flex items-center gap-1 bg-[#161A24] px-2.5 py-1 rounded-xl border border-white/10 focus-within:border-[#FF5E14] focus-within:ring-1 focus-within:ring-[#FF5E14]/40">
                            <span className="text-neutral-400 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={t.ratePerDay ?? ''}
                              onChange={(e) => handleUpdateRate(t.trade, parseFloat(e.target.value) || 0)}
                              className="w-16 bg-transparent text-white font-mono text-xs font-bold focus:outline-none text-right"
                              title="Edit daily wage rate for this trade"
                            />
                            <span className="text-neutral-500 text-[10px]">/day</span>
                          </div>
                          <button
                            onClick={() => handleAdjustRateDelta(t.trade, 50)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg text-[10px] font-mono border border-white/10 transition-colors cursor-pointer"
                            title="Increase daily wage by ₹50"
                          >
                            +50
                          </button>
                        </div>

                        {/* OT Multiplier Input */}
                        <div className="flex items-center gap-1 bg-[#161A24] px-2.5 py-1 rounded-xl border border-white/10 focus-within:border-[#FF5E14] focus-within:ring-1 focus-within:ring-[#FF5E14]/40">
                          <span className="text-neutral-400 text-[10px] font-medium">OT:</span>
                          <input
                            type="number"
                            min="1"
                            max="3"
                            step="0.25"
                            value={t.otRateMultiplier ?? 1.5}
                            onChange={(e) => handleUpdateOTMultiplier(t.trade, parseFloat(e.target.value) || 1.5)}
                            className="w-10 bg-transparent text-white font-mono text-xs font-bold focus:outline-none text-right"
                            title="Overtime multiplier (e.g. 1.5x or 2.0x)"
                          />
                          <span className="text-neutral-500 text-[10px]">x</span>
                        </div>

                        {/* Total per Day */}
                        <div className="text-right min-w-[85px] pl-2 border-l border-white/10">
                          <span className="text-sm font-bold text-white font-mono">₹{Math.round(total).toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-500 block">total / day</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cumulative Wage Card */}
            <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Wage Summary & Budget</h3>
                <p className="text-xs text-neutral-400 mb-4">Rolls up directly into Module 4 (Earned Value & Manpower Cost)</p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-neutral-400">Total Man-days Today</span>
                    <span className="font-bold text-white font-mono">{totalPresent}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-neutral-400">Total OT Man-hours</span>
                    <span className="font-bold text-[#FF5E14] font-mono">{totalOTHours} hrs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-neutral-400">Average Rate / Man</span>
                    <span className="font-bold text-[#FF5E14] font-mono">₹{Math.round(totalDailyBaseWage / (totalPresent || 1))}</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-[#0B0D13] p-3 rounded-xl border border-white/10">
                    <span className="font-semibold text-white">Daily Total Spend</span>
                    <span className="font-bold text-white font-mono text-sm">₹{totalDailyWage.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Weekly wage forecast: ₹{(totalDailyWage * 6).toLocaleString()} (Within planned manpower allocation)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Mobilization & Shortfall */}
      {subTab === 'mobilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">Mobilization Status Gauge</h3>
              <p className="text-xs text-neutral-400 mb-4">Real-time target vs actual workforce turnout</p>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-white/10" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * mobilizationRate) / 100}
                      className="text-[#FF5E14] transition-all duration-1000"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-white font-mono">{mobilizationRate}%</span>
                    <span className="text-[11px] text-neutral-400">Turnout</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E14]"></span>
                    <span className="text-neutral-300">Present: <strong className="text-white">{totalPresent}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                    <span className="text-neutral-400">Shortfall: <strong className="text-white">{shortfallCount}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shortfall Alert & Action List */}
            <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FF5E14]" />
                    <span>Trade Shortfall Breakdown</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 bg-[#FF5E14]/15 text-[#FF5E14] rounded-full font-semibold border border-[#FF5E14]/30">
                    {shortfallCount} Workers Short
                  </span>
                </div>

                <div className="space-y-2">
                  {trades.filter(t => t.absentCount > 0).map((t) => (
                    <div key={t.trade} className="p-3 bg-[#0B0D13] rounded-xl border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{t.trade}</p>
                        <p className="text-[11px] text-neutral-400 font-medium">{t.absentCount} missing today ({t.presentCount}/{t.plannedCount} present)</p>
                      </div>
                      <button 
                        onClick={onOpenAIModal}
                        className="px-3 py-1 bg-white/10 hover:bg-[#FF5E14] hover:text-white text-white border border-white/15 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Request Subcontractor
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>AI Recommendation:</strong> Rebar fixing team requires +1 Bar Bender to maintain pour deadline for Crosshead Pier 48 tomorrow.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Productivity & Output */}
      {subTab === 'productivity' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white mb-1">Productivity per Manpower-Day</h3>
            <p className="text-xs text-neutral-400 mb-4">Actual physical outputs achieved across trades</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {trades.map((t) => {
                const perMan = (t.productivityOutput / (t.presentCount || 1)).toFixed(1);
                return (
                  <div key={t.trade} className="p-3.5 bg-[#0B0D13] rounded-xl border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{t.trade}</span>
                      <span className="text-[10px] text-[#FF5E14] bg-[#FF5E14]/15 border border-[#FF5E14]/30 px-1.5 py-0.5 rounded font-mono font-bold">
                        {t.productivityOutput} {t.productivityUnit}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{t.workType}</p>
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Output per Man-day:</span>
                      <span className="font-bold text-[#FF5E14] font-mono">{perMan} {t.productivityUnit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 5: Safety Induction (HSE) */}
      {subTab === 'safety' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF5E14]" />
                  <span>Worker Safety Induction & Muster Tracker</span>
                </h3>
                <p className="text-xs text-neutral-400">Zero LTI Compliance, Aadhar verification & PPE issuance</p>
              </div>

              <input
                type="text"
                placeholder="Search worker by name, trade, agency..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="bg-[#0B0D13] border border-white/10 text-xs px-3 py-1.5 rounded-lg text-white placeholder:text-neutral-500 w-full sm:w-64 focus:outline-none focus:border-[#FF5E14]"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-[#0B0D13] text-neutral-400 font-medium uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-3">Trade</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Aadhar Ref</th>
                    <th className="py-2.5 px-3 text-center">Safety Score</th>
                    <th className="py-2.5 px-3">PPE Issued</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInductions.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white">{w.workerName}</td>
                      <td className="py-2.5 px-3 text-neutral-300">{w.trade}</td>
                      <td className="py-2.5 px-3 text-neutral-400">{w.agency}</td>
                      <td className="py-2.5 px-3 font-mono text-neutral-400">•••• {w.aadharLast4}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          w.safetyScore >= 90 ? 'bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30' :
                          w.safetyScore >= 70 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                          {w.safetyScore > 0 ? `${w.safetyScore}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {w.ppeIssued ? (
                          <span className="text-[#FF5E14] flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Full Kit Issued
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">Pending PPE</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          w.status === 'Inducted & Certified' ? 'bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30' :
                          w.status === 'Expiring Soon' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 6: Subcontractor Agencies */}
      {subTab === 'agencies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agencies.map((agency) => (
              <div key={agency.id} className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#FF5E14]/15 text-[#FF5E14] rounded-full border border-[#FF5E14]/30">
                      {agency.status}
                    </span>
                    <span className="text-xs text-neutral-400">{agency.verifiedAt}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{agency.agencyName}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Supv: {agency.supervisor}</p>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                    <p className="text-neutral-300 font-medium">Trades Supplied ({agency.totalSupplied} Total):</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {agency.tradesSupplied.map((ts, idx) => (
                        <div key={idx} className="bg-[#0B0D13] p-2 rounded-lg border border-white/10 flex justify-between text-[11px]">
                          <span className="text-neutral-400">{ts.trade}</span>
                          <span className="font-bold text-white">{ts.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-[#FF5E14] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Compliance Verified
                  </span>
                  <button 
                    onClick={onOpenAIModal}
                    className="text-xs text-[#FF5E14] hover:text-[#E04F0F] font-semibold cursor-pointer"
                  >
                    Update Log →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Trade Modal */}
      {showAddTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161A24] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl text-white relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Add Custom Trade</h3>
              </div>
              <button
                onClick={() => setShowAddTradeModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolder, Painter, Tile Mason..."
                  value={newTradeName}
                  onChange={(e) => setNewTradeName(e.target.value)}
                  className="w-full bg-[#0B0D13] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">Work Type / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. External Façade Scaffolding"
                  value={newTradeWorkType}
                  onChange={(e) => setNewTradeWorkType(e.target.value)}
                  className="w-full bg-[#0B0D13] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Planned Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newTradePlanned}
                    onChange={(e) => setNewTradePlanned(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0B0D13] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Present Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newTradePresent}
                    onChange={(e) => setNewTradePresent(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0B0D13] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">Daily Wage Rate (₹/day) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-400 font-mono">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10"
                      value={newTradeWageRate}
                      onChange={(e) => setNewTradeWageRate(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#0B0D13] border border-white/10 rounded-xl py-2.5 pl-7 pr-3 text-white font-mono focus:outline-none focus:border-[#FF5E14]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">OT Multiplier</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.25"
                      min="1"
                      max="3"
                      value={newTradeOTMultiplier}
                      onChange={(e) => setNewTradeOTMultiplier(e.target.value === '' ? '' : parseFloat(e.target.value) || 1.5)}
                      className="w-full bg-[#0B0D13] border border-white/10 rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none focus:border-[#FF5E14]"
                    />
                    <span className="absolute right-3 top-2.5 text-neutral-400 font-mono">x</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTradeModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-xl transition-all shadow-md shadow-[#FF5E14]/20 cursor-pointer"
                >
                  Add Trade to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
