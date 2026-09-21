import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite, $sites, setSites } from '../../stores/siteStore';
import { sitesApi, labourApi, resourceApi, equipmentApi, costApi, reportsApi } from '../../services/api';
import { DashboardOverview } from '../modules/dashboard/DashboardOverview';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import { AddSiteModal } from '../modules/dashboard/AddSiteModal';
import { INITIAL_COST_SUMMARY } from '../../data/initialData';
import type {
  TradeRosterItem,
  MaterialItem,
  EquipmentItem,
  CostSummary,
  SiteReport,
  ExtractedAIData,
} from '../../types';

export default function DashboardIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);
  const sites = useStore($sites);

  const [trades, setTrades] = useState<TradeRosterItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary>(INITIAL_COST_SUMMARY);
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'voice' | 'photo' | 'form'>('voice');
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    // Load sites if not yet loaded
    if (sites.length === 0) {
      sitesApi.list().then((data) => setSites(data)).catch(console.error);
    }
  }, [isLoggedIn]);

  const loadData = useCallback(async () => {
    if (!currentSite) return;
    const siteId = currentSite.id;
    const today = new Date().toISOString().split('T')[0];

    try {
      const [attendance, mats, assets, cost, siteReports] = await Promise.allSettled([
        labourApi.getAttendance(siteId, today),
        resourceApi.getMaterials(siteId),
        equipmentApi.getAssets(siteId),
        costApi.getSummary(siteId),
        reportsApi.list(siteId),
      ]);

      if (attendance.status === 'fulfilled') {
        const tradeMap: Record<string, any> = {};
        (attendance.value as any[]).forEach((r: any) => {
          if (!tradeMap[r.trade]) {
            tradeMap[r.trade] = {
              trade: r.trade,
              presentCount: r.present,
              absentCount: r.absent,
              plannedCount: r.present + r.absent,
              overtimeHours: r.ot_hours || 0,
              leaveCount: 0,
              ratePerDay: 700,
              otRateMultiplier: 1.5,
              productivityOutput: 0,
              productivityUnit: 'Nos',
              workType: r.remarks || '',
              onSiteCount: r.present,
              offSiteCount: 0,
            };
          } else {
            tradeMap[r.trade].presentCount += r.present;
          }
        });
        setTrades(Object.values(tradeMap));
      }

      if (mats.status === 'fulfilled') {
        setMaterials(
          (mats.value as any[]).map((m: any) => ({
            id: m.id,
            name: m.name,
            category: 'Cement & Aggregates' as const,
            unit: m.unit,
            openingStock: m.current_stock,
            receivedToday: m.total_received || 0,
            consumedToday: m.total_consumed || 0,
            currentStock: m.current_stock,
            minReorderLevel: m.reorder_level,
            unitPrice: 0,
            plannedConsumption: 0,
            reorderStatus: m.low_stock ? ('Low Stock' as const) : ('Sufficient' as const),
            wastagePercent: 0,
            supplier: '',
          }))
        );
      }

      if (assets.status === 'fulfilled') {
        setEquipment(
          (assets.value as any[]).map((a: any) => ({
            id: a.id,
            name: a.name,
            assetTag: a.id.slice(0, 8).toUpperCase(),
            category: 'Lifting & Cranes' as const,
            ownership: a.owned ? ('Owned' as const) : ('Rented' as const),
            status: 'Idle' as const,
            operatorName: a.operator_name || '',
            workingHoursToday: a.today_status?.working_hrs || 0,
            idleHoursToday: a.today_status?.idle_hrs || 0,
            breakdownHoursToday: a.today_status?.breakdown_hrs || 0,
            dailyRate: a.daily_rate || 0,
            vendorName: a.vendor || '',
            rentalStartDate: a.rental_start || '',
            rentalEndDate: a.rental_end || '',
            totalAccruedRental: 0,
            fuelConsumedLiters: 0,
            lastServiceDate: '',
          }))
        );
      }

      if (cost.status === 'fulfilled') {
        const c = cost.value as any;
        setCostSummary((prev) => ({
          ...prev,
          siteId: currentSite.id,
          date: today,
          labourCostActual: c.labour?.actual || 0,
          materialCostActual: c.material?.actual || 0,
          equipmentCostActual: c.equipment?.actual || 0,
          totalActualSpend: c.total?.actual || 0,
          plannedBudgetCumulative: c.total?.budget || 0,
          costVariance: c.total?.variance || 0,
          percentBudgetUtilized: c.total?.pct_used || 0,
        }));
      }

      if (siteReports.status === 'fulfilled') {
        setReports(siteReports.value as SiteReport[]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [currentSite]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentSite) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0E0E0E] mb-2">No Sites Found</h2>
          <p className="text-[#6B7280] max-w-sm">Create your first site to get started.</p>
        </div>
        <button
          onClick={() => setIsAddSiteModalOpen(true)}
          className="px-6 py-3 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
        >
          + Add First Site
        </button>
        <AddSiteModal
          isOpen={isAddSiteModalOpen}
          onClose={() => setIsAddSiteModalOpen(false)}
          onSiteCreated={(newSite) => setSites([...sites, newSite])}
        />
      </div>
    );
  }

  return (
    <>
      <DashboardOverview
        currentSite={currentSite}
        reports={reports}
        trades={trades}
        materials={materials}
        equipment={equipment}
        costSummary={costSummary}
        onOpenAIModal={(mode) => {
          setAiModalMode(mode || 'voice');
          setAiModalOpen(true);
        }}
        onSelectModule={(module) => {
          window.location.href = `/app/${module}`;
        }}
      />
      <GlobalAIModal
        isOpen={aiModalOpen}
        initialMode={aiModalMode}
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
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSiteCreated={(newSite) => setSites([...sites, newSite])}
      />
    </>
  );
}
