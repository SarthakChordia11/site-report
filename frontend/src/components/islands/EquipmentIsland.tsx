import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { equipmentApi } from '../../services/api';
import { EquipmentModule } from '../modules/equipment/EquipmentModule';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import type {
  EquipmentItem,
  BreakdownEvent,
  ExtractedAIData,
} from '../../types';

export default function EquipmentIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownEvent[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const loadData = useCallback(async () => {
    if (!currentSite) return;
    const siteId = currentSite.id;

    const [assets, bkds] = await Promise.allSettled([
      equipmentApi.getAssets(siteId),
      equipmentApi.getBreakdowns(siteId),
    ]);

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
          idleReason: a.today_status?.idle_reason,
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

    if (bkds.status === 'fulfilled') {
      setBreakdowns(
        (bkds.value as any[]).map((b: any): BreakdownEvent => ({
          id: b.id,
          equipmentId: b.equipment_id || '',
          equipmentName: b.equipment_name || '',
          reportedAt: b.reported_at || '',
          resolvedAt: b.resolved_at,
          downtimeMinutes: b.downtime_minutes ?? 0,
          reason: b.reason || '',
          actionTaken: b.action_taken || '',
          technician: b.technician || '',
          status: b.status || 'Investigating',
          costImpact: b.cost_impact ?? 0,
        }))
      );
    }
  }, [currentSite]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Persist a single equipment item's daily log via upsertLog, then update
   * local state immediately (optimistic).
   */
  const handlePersistEquipment = async (item: EquipmentItem) => {
    if (!currentSite) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      await equipmentApi.upsertLog({
        site_id: currentSite.id,
        asset_id: item.id,
        log_date: today,
        status: item.status,
        working_hrs: item.workingHoursToday,
        idle_hrs: item.idleHoursToday,
        breakdown_hrs: item.breakdownHoursToday,
        idle_reason: item.idleReason,
        fuel_consumed_liters: item.fuelConsumedLiters,
      });
    } catch (err) {
      console.error('Failed to persist equipment log:', err);
    }
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#6B7280]">Select a site to view equipment data.</p>
      </div>
    );
  }

  return (
    <>
      <EquipmentModule
        equipment={equipment}
        breakdowns={breakdowns}
        onUpdateEquipment={setEquipment}
        onUpdateBreakdowns={setBreakdowns}
        onPersistEquipment={handlePersistEquipment}
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
        trades={[]}
        materials={[]}
        equipment={equipment}
        activeSiteId={currentSite.id}
      />
    </>
  );
}
