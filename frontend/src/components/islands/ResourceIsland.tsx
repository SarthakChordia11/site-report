import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { resourceApi } from '../../services/api';
import { ResourceModule } from '../modules/resource/ResourceModule';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import type {
  MaterialItem,
  FinishedElement,
  DispatchLog,
  Vendor,
  ElementStage,
  ExtractedAIData,
} from '../../types';

export default function ResourceIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [elements, setElements] = useState<FinishedElement[]>([]);
  const [dispatches, setDispatches] = useState<DispatchLog[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const loadData = useCallback(async () => {
    if (!currentSite) return;
    const siteId = currentSite.id;

    const [mats, elems, disps, vends] = await Promise.allSettled([
      resourceApi.getMaterials(siteId),
      resourceApi.getElements(siteId),
      resourceApi.getDispatches(siteId),
      resourceApi.getVendors(siteId),
    ]);

    // Materials
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

    // Finished elements
    if (elems.status === 'fulfilled') {
      setElements(
        (elems.value as any[]).map((e: any): FinishedElement => ({
          id: e.id,
          elementTag: e.element_tag || e.tag || '',
          type: e.type || 'Precast Beam',
          castDate: e.cast_date || '',
          cureCompletionDate: e.cure_completion_date || '',
          qcInspectionPassed: e.qc_passed ?? false,
          stage: (e.stage as ElementStage) || 'Cast',
          targetLocation: e.target_location || '',
          dimensions: e.dimensions || '',
          weightTons: e.weight_tons ?? 0,
          dispatchId: e.dispatch_id,
          erectionPlannedDate: e.erection_planned_date || '',
        }))
      );
    }

    // Dispatches
    if (disps.status === 'fulfilled') {
      setDispatches(
        (disps.value as any[]).map((d: any): DispatchLog => ({
          id: d.id,
          grnNo: d.grn_no || '',
          elementOrMaterial: d.element_or_material || '',
          quantity: d.quantity || '',
          origin: d.origin || '',
          destination: d.destination || '',
          transporter: d.transporter || '',
          vehicleNo: d.vehicle_no || '',
          driverContact: d.driver_contact || '',
          dispatchTime: d.dispatch_time || '',
          eta: d.eta || '',
          status: d.status || 'In Transit',
          receiptConfirmedBy: d.receipt_confirmed_by,
        }))
      );
    }

    // Vendors
    if (vends.status === 'fulfilled') {
      setVendors(
        (vends.value as any[]).map((v: any): Vendor => ({
          id: v.id,
          name: v.name,
          type: v.type || 'Material Supplier',
          materialsSupplied: v.materials_supplied || [],
          onTimeDeliveryRate: v.on_time_delivery_rate ?? 0,
          qualityPassRate: v.quality_pass_rate ?? 0,
          activeOrders: v.active_orders ?? 0,
          totalBilledYTD: v.total_billed_ytd ?? 0,
          paymentStatus: v.payment_status || 'Pending Invoice',
          rating: v.rating ?? 0,
        }))
      );
    }
  }, [currentSite]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /** Persist a stock adjustment to the backend and update local state. */
  const handleAdjustMaterial = async (
    itemId: string,
    type: 'received' | 'consumed',
    amount: number
  ) => {
    // Optimistic local update
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== itemId) return m;
        const rec = type === 'received' ? Math.max(0, m.receivedToday + amount) : m.receivedToday;
        const con = type === 'consumed' ? Math.max(0, m.consumedToday + amount) : m.consumedToday;
        return {
          ...m,
          receivedToday: rec,
          consumedToday: con,
          currentStock: m.openingStock + rec - con,
        };
      })
    );

    if (!currentSite) return;
    try {
      await resourceApi.logMaterial({
        site_id: currentSite.id,
        material_id: itemId,
        log_type: type,
        quantity: amount,
        log_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to log material adjustment:', err);
      // Reload to reconcile on failure
      loadData();
    }
  };

  /** Persist an element stage change to the backend. */
  const handleChangeElementStage = async (elementId: string, stage: ElementStage) => {
    try {
      await resourceApi.updateElementStage(elementId, stage);
    } catch (err) {
      console.error('Failed to update element stage:', err);
      loadData();
    }
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#6B7280]">Select a site to view resource data.</p>
      </div>
    );
  }

  return (
    <>
      <ResourceModule
        materials={materials}
        elements={elements}
        dispatches={dispatches}
        vendors={vendors}
        isPrecastSite={currentSite.isPrecast}
        onUpdateMaterials={setMaterials}
        onUpdateElements={setElements}
        onAdjustMaterial={handleAdjustMaterial}
        onChangeElementStage={handleChangeElementStage}
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
        materials={materials}
        equipment={[]}
        activeSiteId={currentSite.id}
      />
    </>
  );
}
