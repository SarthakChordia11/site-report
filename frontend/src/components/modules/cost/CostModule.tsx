import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  Clock
} from 'lucide-react';
import type { 
  CostSummary, 
  HistoricalEVMPoint, 
  TradeRosterItem, 
  MaterialItem, 
  EquipmentItem 
} from '../../../types';
import { INITIAL_COST_SUMMARY } from '../../../data/initialData';

interface CostModuleProps {
  costSummary?: CostSummary;
  evmHistory?: HistoricalEVMPoint[];
  trades?: TradeRosterItem[];
  materials?: MaterialItem[];
  equipment?: EquipmentItem[];
  onOpenAIModal: () => void;
}

export const CostModule: React.FC<CostModuleProps> = ({
  costSummary = INITIAL_COST_SUMMARY,
  evmHistory = [],
  trades = [],
  materials = [],
  equipment = [],
  onOpenAIModal,
}) => {
  const [subTab, setSubTab] = useState<'dashboard' | 'scurve' | 'variance' | 'aiInsights'>('dashboard');

  // Compute live rollups from Modules 1-3
  const liveLabourSpend = trades.reduce((sum, t) => {
    const base = t.presentCount * t.ratePerDay;
    const ot = t.overtimeHours * (t.ratePerDay / 8) * t.otRateMultiplier;
    return sum + base + ot;
  }, 0);

  const liveMaterialSpend = materials.reduce((sum, m) => {
    return sum + (m.consumedToday * m.unitPrice);
  }, 0);

  const liveEquipmentSpend = equipment.reduce((sum, e) => {
    return sum + (e.ownership === 'Rented' ? e.dailyRate : e.dailyRate * 0.4);
  }, 0);

  const liveDailyTotal = liveLabourSpend + liveMaterialSpend + liveEquipmentSpend + 12000;

  // Format currency helpers
  const formatCrores = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;
  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(2)} L`;

  return (
    <div className="space-y-6">
      {/* Module Header & AI Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161A24] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Module 4: Cost Management & Earned Value (EVM)
                </h2>
                <span className="px-2 py-0.5 text-[11px] bg-[#FF5E14]/15 text-[#FF5E14] font-medium rounded-md border border-[#FF5E14]/30">
                  AI Cost Intelligence
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Automated cost rollups from Modules 1–3, S-Curve EVM tracking, and cost variance analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate AI Daily Cost Narrative</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'dashboard', label: 'Cost Rollup Dashboard' },
          { id: 'scurve', label: 'Earned Value S-Curve (PV vs AC vs EV)' },
          { id: 'variance', label: 'Variance Report (CV & SV)' },
          { id: 'aiInsights', label: 'AI Cost Insights & Recommendations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              subTab === tab.id
                ? 'bg-white text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4 Core Financial Rollup KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Planned Value (PV) */}
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Planned Value (PV)</span>
            <Calendar className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white font-mono">{formatCrores(costSummary.plannedBudgetCumulative)}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Planned Budget Baseline</p>
        </div>

        {/* Earned Value (EV) */}
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Earned Value (EV)</span>
            <CheckCircle2 className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white font-mono">{formatCrores(costSummary.earnedValueCumulative)}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Value of Completed Physical Work</p>
        </div>

        {/* Actual Cost (AC) */}
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Actual Cost (AC)</span>
            <DollarSign className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white font-mono">{formatCrores(costSummary.actualCostCumulative)}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Cumulative Total Incurred</p>
        </div>

        {/* Cost Performance Index (CPI) */}
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Cost Efficiency (CPI)</span>
            <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
              Under Budget
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{costSummary.costPerformanceIndex}</span>
            <span className="text-xs text-emerald-400 font-semibold">(+{formatLakhs(costSummary.costVariance)})</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">CPI &gt; 1.0 (Savings ₹39.0 Lakh)</p>
        </div>
      </div>

      {/* SubTab 1: Cost Rollup Dashboard */}
      {subTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Live Daily Cost Rollup Feeder */}
            <div className="lg:col-span-2 bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Live 4-Module Daily Cost Rollup</span>
                    <span className="text-xs px-2 py-0.5 bg-[#0B0D13] text-[#FF5E14] border border-[#FF5E14]/30 rounded font-mono">Today's Incurred</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Synchronized dynamically from Modules 1, 2, and 3 entries</p>
                </div>
                <span className="text-base font-bold text-white font-mono">{formatLakhs(liveDailyTotal)} Total</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Module 1 Rollup */}
                <div className="bg-[#0B0D13] p-4 rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="font-semibold text-white">1. Manpower Cost</span>
                    <span className="text-[10px] bg-white/10 text-neutral-300 border border-white/10 px-1 rounded">Mod 1</span>
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{formatLakhs(liveLabourSpend)}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">73 Tradesmen present + 29h OT</p>
                </div>

                {/* Module 2 Rollup */}
                <div className="bg-[#0B0D13] p-4 rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="font-semibold text-white">2. Material Cost</span>
                    <span className="text-[10px] bg-white/10 text-neutral-300 border border-white/10 px-1 rounded">Mod 2</span>
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{formatLakhs(liveMaterialSpend)}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Cement (140 bags) + Steel (3.5 MT)</p>
                </div>

                {/* Module 3 Rollup */}
                <div className="bg-[#0B0D13] p-4 rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-1">
                    <span className="font-semibold text-white">3. Equipment Cost</span>
                    <span className="text-[10px] bg-white/10 text-neutral-300 border border-white/10 px-1 rounded">Mod 3</span>
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{formatLakhs(liveEquipmentSpend)}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Tower Crane + JCB + Boom Pump</p>
                </div>
              </div>

              {/* Progress & Burn Rate */}
              <div className="bg-[#0B0D13] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-medium">Total Site Budget Utilization (₹18.5 Cr Total)</span>
                  <span className="font-bold text-white font-mono">{costSummary.percentBudgetUtilized}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FF5E14] h-full rounded-full" style={{ width: `${costSummary.percentBudgetUtilized}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Actual Spent: <strong className="text-white font-mono">{formatCrores(costSummary.actualCostCumulative)}</strong></span>
                  <span>Remaining Balance: <strong className="text-emerald-400 font-mono">{formatCrores(185000000 - costSummary.actualCostCumulative)}</strong></span>
                </div>
              </div>
            </div>

            {/* AI Cost Intelligence Narrative Box */}
            <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#FF5E14]" />
                  <h3 className="text-sm font-semibold text-white">AI Daily Cost Narrative</h3>
                </div>

                <div className="p-3 bg-[#0B0D13] rounded-xl border border-white/10 text-neutral-300 leading-relaxed text-[11px]">
                  {costSummary.aiNarrative}
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Active Cost Flags:</p>
                  {costSummary.overspendAlerts.map((alert, idx) => (
                    <p key={idx} className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      {alert}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Daily Burn Rate: <strong className="text-white font-mono">₹4.85L/day</strong></span>
                <span className="text-[#FF5E14] font-semibold">{costSummary.estimatedDaysRemaining} Days Runway</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Earned Value S-Curve */}
      {subTab === 'scurve' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Earned Value Management S-Curve</span>
                  <span className="text-xs text-neutral-400 font-normal">(Project Lifecycle Timeline)</span>
                </h3>
                <p className="text-xs text-neutral-400">Planned Value (PV) vs Actual Cost (AC) vs Earned Value (EV)</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-neutral-500 rounded"></span>
                  <span className="text-neutral-400">Planned (PV)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-400 rounded"></span>
                  <span className="text-neutral-400">Actual (AC)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FF5E14] rounded"></span>
                  <span className="text-neutral-400">Earned (EV)</span>
                </div>
              </div>
            </div>

            {/* Visual SVG S-Curve Chart */}
            <div className="h-64 w-full bg-[#0B0D13] p-4 rounded-xl border border-white/10 relative">
              <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="680" y2="20" stroke="#ffffff" strokeDasharray="3 3" opacity="0.1" />
                <line x1="40" y1="70" x2="680" y2="70" stroke="#ffffff" strokeDasharray="3 3" opacity="0.1" />
                <line x1="40" y1="120" x2="680" y2="120" stroke="#ffffff" strokeDasharray="3 3" opacity="0.1" />
                <line x1="40" y1="170" x2="680" y2="170" stroke="#ffffff" strokeDasharray="3 3" opacity="0.1" />

                {/* Y Axis Labels */}
                <text x="5" y="25" fill="#94A3B8" fontSize="10">₹18 Cr</text>
                <text x="5" y="75" fill="#94A3B8" fontSize="10">₹12 Cr</text>
                <text x="5" y="125" fill="#94A3B8" fontSize="10">₹6 Cr</text>
                <text x="5" y="175" fill="#94A3B8" fontSize="10">₹0</text>

                {/* Planned Value (PV) Curve */}
                <polyline
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points="60,170 150,150 250,120 360,85 470,55 580,30 670,18"
                />

                {/* Actual Cost (AC) Curve */}
                <polyline
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points="60,172 150,153 250,124 360,90 470,62"
                />

                {/* Earned Value (EV) Curve */}
                <polyline
                  fill="none"
                  stroke="#FF5E14"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points="60,171 150,151 250,121 360,87 470,57"
                />

                {/* Data Points on Current Week */}
                <circle cx="470" cy="57" r="5" fill="#FF5E14" />
                <circle cx="470" cy="62" r="5" fill="#F59E0B" />
                <circle cx="470" cy="55" r="5" fill="#64748B" />
              </svg>

              <div className="flex justify-between px-10 text-[10px] text-neutral-400 font-mono mt-1">
                <span>W1 (May)</span>
                <span>W4 (Jun)</span>
                <span>W8 (Jul)</span>
                <span>W12 (Aug)</span>
                <span className="text-[#FF5E14] font-bold">Current (W15)</span>
                <span>Forecast W18</span>
                <span>Finish (Dec)</span>
              </div>
            </div>

            {/* EVM Interpretation Callout */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cost Variance (CV = EV - AC): +₹39.0 Lakh</strong>. The solid EV curve is above the AC curve, representing ₹39 Lakh savings below budgeted allowance.</span>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Schedule Variance (SV = EV - PV): -₹16.0 Lakh (SPI 0.987)</strong>. Current project progress is 98.7% aligned with milestone timetable.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Variance Report */}
      {subTab === 'variance' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white mb-1">Cost & Schedule Variance Mathematical Table</h3>
            <p className="text-xs text-neutral-400 mb-4">Formulas and real-time execution indices across project phases</p>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs text-neutral-300 min-w-[640px]">
                <thead className="bg-[#0B0D13] text-neutral-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">EVM Metric</th>
                    <th className="py-3 px-3">Mathematical Formula</th>
                    <th className="py-3 px-3">Current Value</th>
                    <th className="py-3 px-3">Standard Threshold</th>
                    <th className="py-3 px-3 text-right">Site Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">Cost Variance (CV)</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">EV − AC</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">+₹39,00,000</td>
                    <td className="py-3 px-3 text-neutral-400">&gt; 0 (Under budget)</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">Favorable</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">Cost Performance Index (CPI)</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">EV ÷ AC</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">1.031</td>
                    <td className="py-3 px-3 text-neutral-400">&gt; 1.0 (Efficient)</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">High Efficiency</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">Schedule Variance (SV)</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">EV − PV</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">−₹16,00,000</td>
                    <td className="py-3 px-3 text-neutral-400">&gt; 0 (Ahead of time)</td>
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">Minor Delay</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">Schedule Performance Index (SPI)</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">EV ÷ PV</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">0.987</td>
                    <td className="py-3 px-3 text-neutral-400">&gt; 1.0</td>
                    <td className="py-3 px-3 text-right text-amber-400 font-medium">98.7% On Track</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">Estimate at Completion (EAC)</td>
                    <td className="py-3 px-3 font-mono text-neutral-400">BAC ÷ CPI</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">₹17.94 Cr</td>
                    <td className="py-3 px-3 text-neutral-400">≤ ₹18.5 Cr BAC</td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">₹56L Final Savings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: AI Recommendations */}
      {subTab === 'aiInsights' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5E14]" />
              <span>AI Cost Optimization Recommendations</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">Autonomous intelligence scanning idle labour, machinery, and material wastage</p>

            <div className="space-y-2.5">
              {costSummary.optimizationRecommendations.map((rec, idx) => (
                <div key={idx} className="p-3.5 bg-[#0B0D13] rounded-xl border border-white/10 text-xs text-neutral-300 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="leading-relaxed">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
