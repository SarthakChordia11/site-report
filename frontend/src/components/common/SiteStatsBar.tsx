import React from 'react';
import { Users, Package, Wrench, TrendingUp, AlertTriangle } from 'lucide-react';
import { TradeRosterItem, MaterialItem, EquipmentItem, CostSummary } from '../../types';

interface SiteStatsBarProps {
  trades?: TradeRosterItem[];
  materials?: MaterialItem[];
  equipment?: EquipmentItem[];
  costSummary?: CostSummary;
  onOpenAIModal: () => void;
}

export const SiteStatsBar: React.FC<SiteStatsBarProps> = ({
  trades = [],
  materials = [],
  equipment = [],
  costSummary = {
    budgetAtCompletion: 0,
    plannedValue: 0,
    earnedValue: 0,
    actualCost: 0,
    costVariance: 0,
    scheduleVariance: 0,
    costPerformanceIndex: 1.0,
    schedulePerformanceIndex: 1.0,
    estimateAtCompletion: 0,
    varianceAtCompletion: 0,
    criticalPathStatus: 'On Schedule',
    projectCompletionPct: 0,
  },
}) => {
  const totalPresent = trades.reduce((acc, t) => acc + (t.presentCount || 0), 0);
  const totalPlanned = trades.reduce((acc, t) => acc + (t.plannedCount || 0), 0);
  const totalOtHours = trades.reduce((acc, t) => acc + (t.overtimeHours || 0), 0);

  const lowStockCount = materials.filter(m => m.reorderStatus !== 'Sufficient').length;
  const cementToday = materials.find(m => m.id === 'mat-1');

  const activeMachines = equipment.filter(e => e.status === 'Working').length;
  const idleMachines = equipment.filter(e => e.status === 'Idle').length;
  const breakdownMachines = equipment.filter(e => e.status === 'Breakdown').length;

  return (
    <div className="bg-brand-50/70 border-b border-brand-200/80 px-4 lg:px-6 py-2.5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
        {/* Metric 1: Labour */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-brand-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-600 font-medium">Labour</span>
              <span className="text-[11px] text-brand-800 font-medium">{totalOtHours}h OT</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-brand-900">{totalPresent}</span>
              <span className="text-xs text-brand-400">/ {totalPlanned}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-brand-100 text-brand-800 ml-auto">
                {Math.round((totalPresent / totalPlanned) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Material */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-brand-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-600 font-medium">Cement</span>
              {lowStockCount > 0 ? (
                <span className="text-[11px] text-brand-800 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-brand-600" /> {lowStockCount} Reorder
                </span>
              ) : (
                <span className="text-[11px] text-brand-700 font-medium">Optimal</span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-brand-900">{cementToday?.currentStock ?? 740}</span>
              <span className="text-xs text-brand-400">Bags (+{cementToday?.receivedToday ?? 200})</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Machinery */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-brand-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-600 font-medium">Machinery</span>
              <span className="text-[11px] text-brand-800 font-medium">{activeMachines} Running</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-brand-900">88%</span>
              <span className="text-xs text-brand-400">
                {idleMachines > 0 && <span className="text-brand-600">{idleMachines} Idle </span>}
                {breakdownMachines > 0 && <span className="text-brand-800"> • {breakdownMachines} BD</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: EVM Performance */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-brand-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-600 font-medium">EVM Index</span>
              <span className="text-[11px] text-brand-800 font-semibold bg-brand-100 px-1.5 py-0.2 rounded">
                Under Budget
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-brand-900">CPI {costSummary.costPerformanceIndex}</span>
              <span className="text-xs text-brand-700 font-medium ml-auto">₹{(costSummary.costVariance / 100000).toFixed(1)}L saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
