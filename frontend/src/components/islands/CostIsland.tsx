import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { costApi, labourApi, resourceApi, equipmentApi } from '../../services/api';
import { CostModule } from '../modules/cost/CostModule';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import { INITIAL_COST_SUMMARY } from '../../data/initialData';
import type {
  CostSummary,
  HistoricalEVMPoint,
  TradeRosterItem,
  MaterialItem,
  EquipmentItem,
  ExtractedAIData,
} from '../../types';

export default function CostIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);

  const [costSummary, setCostSummary] = useState<CostSummary>(INITIAL_COST_SUMMARY);
  const [evmHistory, setEvmHistory] = useState<HistoricalEVMPoint[]>([]);
  // Cross-module data fed in for live rollup computations inside CostModule
  const [trades, setTrades] = useState<TradeRosterItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const loadData = useCallback(async () => {
    if (!currentSite) return;
    const siteId = currentSite.id;
    const today = new Date().toISOString().split('T')[0];

    const [cost, evm, attendance, mats, assets] = await Promise.allSettled([
      costApi.getSummary(siteId),
      costApi.getEVMHistory(siteId),
      labourApi.getAttendance(siteId, today),
      resourceApi.getMaterials(siteId),
      equipmentApi.getAssets(siteId),
    ]);

    // Cost summary
    if (cost.status === 'fulfilled') {
      const c = cost.value as any;
      setCostSummary((prev) => ({
        ...prev,
        siteId,
        date: today,
        labourCostActual: c.labour?.actual ?? 0,
        materialCostActual: c.material?.actual ?? 0,
        equipmentCostActual: c.equipment?.actual ?? 0,
        otherCostActual: c.other?.actual ?? 0,
        totalActualSpend: c.total?.actual ?? 0,
        plannedBudgetCumulative: c.total?.budget ?? 0,
        earnedValueCumulative: c.evm?.earned_value ?? 0,
        actualCostCumulative: c.evm?.actual_cost ?? 0,
        costVariance: c.total?.variance ?? 0,
        costPerformanceIndex: c.evm?.cpi ?? 0,
        scheduleVariance: c.evm?.sv ?? 0,
        schedulePerformanceIndex: c.evm?.spi ?? 0,
        percentBudgetUtilized: c.total?.pct_used ?? 0,
        dailyBurnRate: c.daily_burn_rate ?? 0,
        estimatedDaysRemaining: c.estimated_days_remaining ?? 0,
        aiNarrative: c.ai_narrative ?? '',
        overspendAlerts: c.overspend_alerts ?? [],
        optimizationRecommendations: c.optimization_recommendations ?? [],
      }));
    }

    // EVM history → HistoricalEVMPoint[]
    if (evm.status === 'fulfilled') {
      setEvmHistory(
        (evm.value as any[]).map((pt: any): HistoricalEVMPoint => ({
          week: pt.week || pt.date || '',
          plannedValue: pt.planned_value ?? pt.pv ?? 0,
          actualCost: pt.actual_cost ?? pt.ac ?? 0,
          earnedValue: pt.earned_value ?? pt.ev ?? 0,
        }))
      );
    }

    // Labour trades for live rollup inside CostModule
    if (attendance.status === 'fulfilled') {
      const tradeMap: Record<string, TradeRosterItem> = {};
      (attendance.value as any[]).forEach((r: any) => {
        if (!tradeMap[r.trade]) {
          tradeMap[r.trade] = {
            trade: r.trade,
            plannedCount: (r.present || 0) + (r.absent || 0),
            presentCount: r.present || 0,
            absentCount: r.absent || 0,
            leaveCount: 0,
            ratePerDay: r.rate_per_day || 700,
            overtimeHours: r.ot_hours || 0,
            otRateMultiplier: 1.5,
            productivityOutput: 0,
            productivityUnit: 'Nos',
            workType: r.remarks || '',
            onSiteCount: r.present || 0,
            offSiteCount: 0,
          };
        }
      });
      setTrades(Object.values(tradeMap));
    }

    // Materials for live material spend rollup
    if (mats.status === 'fulfilled') {
      setMaterials(
        (mats.value as any[]).map((m: any): MaterialItem => ({
          id: m.id,
          name: m.name,
          category: 'Cement & Aggregates' as const,
          unit: m.unit || 'MT',
          openingStock: m.opening_stock ?? m.current_stock ?? 0,
          receivedToday: m.total_received ?? 0,
          consumedToday: m.total_consumed ?? 0,
          currentStock: m.current_stock ?? 0,
          minReorderLevel: m.reorder_level ?? 0,
          unitPrice: m.unit_price ?? 0,
          plannedConsumption: m.planned_consumption ?? 0,
          reorderStatus: m.low_stock ? ('Low Stock' as const) : ('Sufficient' as const),
          wastagePercent: m.wastage_percent ?? 0,
          supplier: m.supplier || '',
        }))
      );
    }

    // Equipment for live equipment spend rollup
    if (assets.status === 'fulfilled') {
      setEquipment(
        (assets.value as any[]).map((a: any): EquipmentItem => ({
          id: a.id,
          name: a.name,
          assetTag: a.asset_tag || a.id.slice(0, 8).toUpperCase(),
          category: a.category || 'Lifting & Cranes',
          ownership: a.owned ? ('Owned' as const) : ('Rented' as const),
          status: a.today_status?.status || ('Idle' as const),
          operatorName: a.operator_name || '',
          workingHoursToday: a.today_status?.working_hrs ?? 0,
          idleHoursToday: a.today_status?.idle_hrs ?? 0,
          breakdownHoursToday: a.today_status?.breakdown_hrs ?? 0,
          dailyRate: a.daily_rate ?? 0,
          vendorName: a.vendor || '',
          rentalStartDate: a.rental_start || '',
          rentalEndDate: a.rental_end || '',
          totalAccruedRental: a.total_accrued_rental ?? 0,
          fuelConsumedLiters: a.today_status?.fuel_consumed_liters ?? 0,
          lastServiceDate: a.last_service_date || '',
        }))
      );
    }
  }, [currentSite]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#6B7280]">Select a site to view cost data.</p>
      </div>
    );
  }

  return (
    <>
      <CostModule
        costSummary={costSummary}
        evmHistory={evmHistory}
        trades={trades}
        materials={materials}
        equipment={equipment}
        onOpenAIModal={() => setAiModalOpen(true)}
      />
      <GlobalAIModal
        isOpen={aiModalOpen}
        initialMode="voice"
        onClose={() => setAiModalOpen(false)}
        onApplyExtraction={async (_data: ExtractedAIData) => {
          setAiModalOpen(false);
          loadData();
        }}
        onModulesSynced={() => loadData()}
        trades={trades}
        materials={materials}
        equipment={equipment}
        activeSiteId={currentSite.id}
      />
    </>
  );
}
