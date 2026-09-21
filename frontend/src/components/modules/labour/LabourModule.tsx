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
  Mic
} from 'lucide-react';
import { TradeRosterItem, AgencyLog, WorkerInduction } from '../../../types';

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

  const filteredInductions = activeInductions.filter(w =>
    (w.workerName || '').toLowerCase().includes(searchWorker.toLowerCase()) ||
    (w.trade || '').toLowerCase().includes(searchWorker.toLowerCase()) ||
    (w.agency || '').toLowerCase().includes(searchWorker.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Module Title & AI Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-brand-900">
                  Module 1: Labour Management
                </h2>
                <span className="px-2 py-0.5 text-[11px] bg-brand-100 text-brand-800 font-medium rounded-md border border-brand-200">
                  Voice Attendance Sync
                </span>
              </div>
              <p className="text-xs text-brand-500 mt-0.5">
                Multi-trade muster roll, subcontractor allocation, wage computation, and mobilization tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-800 hover:bg-brand-900 text-white font-medium rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4 text-brand-200" />
            <span>Voice Muster Entry ("Aaj mason 14 present...")</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-brand-200 pb-2 overflow-x-auto scrollbar-none">
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              subTab === tab.id
                ? 'bg-brand-800 text-white shadow-xs'
                : 'text-brand-600 hover:text-brand-900 hover:bg-brand-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 4 Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-500 text-xs">
            <span>Total Headcount</span>
            <UserCheck className="w-4 h-4 text-brand-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-brand-900">{totalPresent}</span>
            <span className="text-xs text-brand-400 font-medium">/ {totalPlanned} Planned</span>
          </div>
          <div className="mt-2.5 w-full bg-brand-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-800 h-full rounded-full" style={{ width: `${Math.min(100, mobilizationRate)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-500 text-xs">
            <span>Site vs Yard Split</span>
            <Building className="w-4 h-4 text-brand-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-brand-900">{totalOnSite} Site</span>
            <span className="text-xs text-brand-400">/ {totalOffSite} Yard</span>
          </div>
          <p className="text-[11px] text-brand-600 mt-1">Casting Yard: 18 tradesmen</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-500 text-xs">
            <span>Overtime (OT) Log</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-brand-800">{totalOTHours} hrs</span>
            <span className="text-xs text-brand-400">logged today</span>
          </div>
          <p className="text-[11px] text-brand-500 mt-1">Carpenters: 12h OT (Shuttering)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-xs">
          <div className="flex items-center justify-between text-brand-500 text-xs">
            <span>Daily Manpower Spend</span>
            <DollarSign className="w-4 h-4 text-brand-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-brand-900">₹{totalDailyWage.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-brand-500 mt-1">Base: ₹{totalDailyBaseWage.toLocaleString()} + OT: ₹{totalDailyOTWage.toLocaleString()}</p>
        </div>
      </div>

      {/* SubTab 1: Attendance Dashboard */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-brand-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-brand-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                <span>Trade-Wise Headcount Roster</span>
                <span className="text-xs text-brand-400 font-normal">({trades.length} Active Trades)</span>
              </h3>
              <span className="text-xs text-brand-800 bg-brand-100 px-2 py-0.5 rounded border border-brand-200 font-medium">
                Live Voice Sync Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-700">
                <thead className="bg-brand-50 text-brand-500 font-medium uppercase tracking-wider text-[11px] border-b border-brand-200">
                  <tr>
                    <th className="py-3 px-4">Trade Name</th>
                    <th className="py-3 px-3 text-center">Planned</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-3 text-center">OT Hours</th>
                    <th className="py-3 px-3">On-Site / Yard</th>
                    <th className="py-3 px-3">Daily Wage Rate</th>
                    <th className="py-3 px-3 text-right">Quick Tweak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {trades.map((t) => (
                    <tr key={t.trade} className="hover:bg-brand-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                          <span>{t.trade}</span>
                        </div>
                        <span className="text-[11px] text-brand-400 block font-normal">{t.workType}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-brand-500">
                        {t.plannedCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-mono font-bold bg-brand-100 text-brand-800 border border-brand-200">
                          {t.presentCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-mono ${
                          t.absentCount > 0 ? 'bg-brand-100 text-brand-700 font-semibold border border-brand-200' : 'text-brand-400'
                        }`}>
                          {t.absentCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {t.overtimeHours > 0 ? (
                          <span className="text-brand-800 font-semibold bg-brand-100 px-2 py-0.5 rounded border border-brand-200">
                            {t.overtimeHours} hrs
                          </span>
                        ) : (
                          <span className="text-brand-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-brand-600">
                          <span className="text-brand-900 font-medium">{t.onSiteCount} Site</span>
                          <span className="text-brand-300 mx-1">|</span>
                          <span className="text-brand-500">{t.offSiteCount} Yard</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-brand-700">
                        ₹{t.ratePerDay}/day
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-brand-50 p-0.5 rounded-lg border border-brand-200">
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'presentCount', -1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-brand-600 hover:text-brand-900 hover:bg-white cursor-pointer"
                            title="Decrease present"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'presentCount', 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-brand-800 hover:text-brand-900 hover:bg-white font-bold cursor-pointer"
                            title="Increase present"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleAdjustCount(t.trade, 'overtimeHours', 1)}
                            className="px-1.5 h-6 text-[10px] text-brand-800 hover:bg-white rounded font-medium cursor-pointer"
                            title="+1h Overtime"
                          >
                            +1h OT
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
            <div className="lg:col-span-2 bg-white rounded-xl border border-brand-200 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-brand-900 mb-3">Daily Wage Breakdown by Trade</h3>
              <div className="space-y-2.5">
                {trades.map((t) => {
                  const base = t.presentCount * t.ratePerDay;
                  const otWage = t.overtimeHours * (t.ratePerDay / 8) * t.otRateMultiplier;
                  const total = base + otWage;

                  return (
                    <div key={t.trade} className="p-3 bg-brand-50/70 rounded-xl border border-brand-200/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-brand-900">{t.trade}</span>
                          <span className="text-brand-500 font-mono">({t.presentCount} men × ₹{t.ratePerDay})</span>
                        </div>
                        <p className="text-[11px] text-brand-500 mt-0.5">
                          Base: ₹{base.toLocaleString()} {t.overtimeHours > 0 && `+ OT (${t.overtimeHours}h @ 1.5x): ₹${Math.round(otWage).toLocaleString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-brand-900 font-mono">₹{Math.round(total).toLocaleString()}</span>
                        <span className="text-[10px] text-brand-400 block">per day</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cumulative Wage Card */}
            <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-brand-900 mb-1">Wage Summary & Budget</h3>
                <p className="text-xs text-brand-500 mb-4">Rolls up directly into Module 4 (Earned Value & Manpower Cost)</p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-brand-100">
                    <span className="text-brand-500">Total Man-days Today</span>
                    <span className="font-bold text-brand-900 font-mono">{totalPresent}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-100">
                    <span className="text-brand-500">Total OT Man-hours</span>
                    <span className="font-bold text-brand-800 font-mono">{totalOTHours} hrs</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-brand-100">
                    <span className="text-brand-500">Average Rate / Man</span>
                    <span className="font-bold text-brand-800 font-mono">₹{Math.round(totalDailyBaseWage / (totalPresent || 1))}</span>
                  </div>
                  <div className="flex justify-between py-2.5 bg-brand-50 p-3 rounded-lg border border-brand-200">
                    <span className="font-semibold text-brand-900">Daily Total Spend</span>
                    <span className="font-bold text-brand-800 font-mono text-sm">₹{totalDailyWage.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-brand-100 rounded-lg border border-brand-200 text-[11px] text-brand-900 font-medium">
                ✅ Weekly wage forecast: ₹{(totalDailyWage * 6).toLocaleString()} (Within planned manpower allocation)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Mobilization & Shortfall */}
      {subTab === 'mobilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-brand-900 mb-1">Mobilization Status Gauge</h3>
              <p className="text-xs text-brand-500 mb-4">Real-time target vs actual workforce turnout</p>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" className="text-brand-100" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * mobilizationRate) / 100}
                      className="text-brand-700 transition-all duration-1000"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-brand-900 font-mono">{mobilizationRate}%</span>
                    <span className="text-[11px] text-brand-500">Turnout</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-700"></span>
                    <span className="text-brand-600">Present: <strong>{totalPresent}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-300"></span>
                    <span className="text-brand-500">Shortfall: <strong>{shortfallCount}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shortfall Alert & Action List */}
            <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-brand-700" />
                    <span>Trade Shortfall Breakdown</span>
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-800 rounded font-medium border border-brand-200">
                    {shortfallCount} Workers Short
                  </span>
                </div>

                <div className="space-y-2">
                  {trades.filter(t => t.absentCount > 0).map((t) => (
                    <div key={t.trade} className="p-3 bg-brand-50 rounded-lg border border-brand-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-brand-900">{t.trade}</p>
                        <p className="text-[11px] text-brand-600 font-medium">{t.absentCount} missing today ({t.presentCount}/{t.plannedCount} present)</p>
                      </div>
                      <button 
                        onClick={onOpenAIModal}
                        className="px-2.5 py-1 bg-white hover:bg-brand-100 text-brand-900 border border-brand-200 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Request Subcontractor
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-brand-50 rounded-lg border border-brand-200 text-[11px] text-brand-600">
                💡 <strong>AI Recommendation:</strong> Rebar fixing team requires +1 Bar Bender to maintain pour deadline for Crosshead Pier 48 tomorrow.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Productivity & Output */}
      {subTab === 'productivity' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-brand-900 mb-1">Productivity per Manpower-Day</h3>
            <p className="text-xs text-brand-500 mb-4">Actual physical outputs achieved across trades</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {trades.map((t) => {
                const perMan = (t.productivityOutput / (t.presentCount || 1)).toFixed(1);
                return (
                  <div key={t.trade} className="p-3.5 bg-brand-50 rounded-xl border border-brand-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-brand-900">{t.trade}</span>
                      <span className="text-[10px] text-brand-800 bg-brand-100 border border-brand-200 px-1.5 py-0.5 rounded font-mono font-bold">
                        {t.productivityOutput} {t.productivityUnit}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-500">{t.workType}</p>
                    <div className="mt-3 pt-2 border-t border-brand-200 flex items-center justify-between text-[11px]">
                      <span className="text-brand-500">Output per Man-day:</span>
                      <span className="font-bold text-brand-900 font-mono">{perMan} {t.productivityUnit}</span>
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
          <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-700" />
                  <span>Worker Safety Induction & Muster Tracker</span>
                </h3>
                <p className="text-xs text-brand-500">Zero LTI Compliance, Aadhar verification & PPE issuance</p>
              </div>

              <input
                type="text"
                placeholder="Search worker by name, trade, agency..."
                value={searchWorker}
                onChange={(e) => setSearchWorker(e.target.value)}
                className="bg-brand-50 border border-brand-200 text-xs px-3 py-1.5 rounded-lg text-brand-900 placeholder:text-brand-400 w-full sm:w-64 focus:outline-brand-800"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-700">
                <thead className="bg-brand-50 text-brand-500 font-medium uppercase tracking-wider text-[11px] border-b border-brand-200">
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
                <tbody className="divide-y divide-brand-100">
                  {filteredInductions.map((w) => (
                    <tr key={w.id} className="hover:bg-brand-50/70">
                      <td className="py-2.5 px-3 font-semibold text-brand-900">{w.workerName}</td>
                      <td className="py-2.5 px-3">{w.trade}</td>
                      <td className="py-2.5 px-3 text-brand-500">{w.agency}</td>
                      <td className="py-2.5 px-3 font-mono text-brand-500">•••• {w.aadharLast4}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          w.safetyScore >= 90 ? 'bg-brand-100 text-brand-800 border border-brand-200' :
                          w.safetyScore >= 70 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-brand-100 text-brand-900 border border-brand-200'
                        }`}>
                          {w.safetyScore > 0 ? `${w.safetyScore}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {w.ppeIssued ? (
                          <span className="text-brand-700 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Full Kit Issued
                          </span>
                        ) : (
                          <span className="text-brand-600 font-medium">Pending PPE</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          w.status === 'Inducted & Certified' ? 'bg-brand-100 text-brand-800 border border-brand-200' :
                          w.status === 'Expiring Soon' ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-brand-100 text-brand-900 border border-brand-200'
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
              <div key={agency.id} className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-100 text-brand-800 rounded border border-brand-200">
                      {agency.status}
                    </span>
                    <span className="text-xs text-brand-400">{agency.verifiedAt}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-brand-900">{agency.agencyName}</h3>
                  <p className="text-xs text-brand-500 mt-0.5">Supv: {agency.supervisor}</p>

                  <div className="mt-4 pt-3 border-t border-brand-100 space-y-2 text-xs">
                    <p className="text-brand-600 font-medium">Trades Supplied ({agency.totalSupplied} Total):</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {agency.tradesSupplied.map((ts, idx) => (
                        <div key={idx} className="bg-brand-50 p-2 rounded-lg border border-brand-200 flex justify-between text-[11px]">
                          <span className="text-brand-700">{ts.trade}</span>
                          <span className="font-bold text-brand-900">{ts.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between">
                  <span className="text-[11px] text-brand-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Compliance Verified
                  </span>
                  <button 
                    onClick={onOpenAIModal}
                    className="text-xs text-brand-900 hover:text-brand-700 font-semibold cursor-pointer"
                  >
                    Update Log →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
