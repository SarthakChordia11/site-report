import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { labourApi } from '../../services/api';
import { LabourModule } from '../modules/labour/LabourModule';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import type {
  TradeRosterItem,
  AgencyLog,
  WorkerInduction,
  ExtractedAIData,
} from '../../types';

export default function LabourIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);

  const [trades, setTrades] = useState<TradeRosterItem[]>([]);
  const [agencies, setAgencies] = useState<AgencyLog[]>([]);
  const [inductions, setInductions] = useState<WorkerInduction[]>([]);
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

    const [attendance, mobilization, safety] = await Promise.allSettled([
      labourApi.getAttendance(siteId, today),
      labourApi.getMobilization(siteId),
      labourApi.getSafety(siteId),
    ]);

    // Map raw attendance rows → TradeRosterItem[]
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
        } else {
          tradeMap[r.trade].presentCount += r.present || 0;
          tradeMap[r.trade].absentCount += r.absent || 0;
          tradeMap[r.trade].plannedCount += (r.present || 0) + (r.absent || 0);
        }
      });
      setTrades(Object.values(tradeMap));
    }

    // Map raw mobilization rows → AgencyLog[]
    if (mobilization.status === 'fulfilled') {
      setAgencies(
        (mobilization.value as any[]).map((a: any): AgencyLog => ({
          id: a.id,
          agencyName: a.agency_name || a.name || '',
          supervisor: a.supervisor || '',
          phone: a.phone || '',
          totalSupplied: a.total_supplied || 0,
          tradesSupplied: a.trades_supplied || [],
          status: a.status || 'Pending Verification',
          verifiedAt: a.verified_at,
        }))
      );
    }

    // Map raw safety rows → WorkerInduction[]
    if (safety.status === 'fulfilled') {
      setInductions(
        (safety.value as any[]).map((w: any): WorkerInduction => ({
          id: w.id,
          workerName: w.worker_name || '',
          trade: w.trade,
          agency: w.agency || '',
          aadharLast4: w.aadhar_last4 || '',
          inductionDate: w.induction_date || '',
          safetyScore: w.safety_score || 0,
          status: w.inducted ? 'Inducted & Certified' : 'Induction Pending',
          ppeIssued: w.ppe_issued || false,
          medicalCheck: w.medical_check || false,
        }))
      );
    }
  }, [currentSite]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Persist updated trade roster to the backend then reflect locally.
   * Uses upsertAttendance so each trade row is idempotent.
   */
  const handleUpdateTrades = async (updatedTrades: TradeRosterItem[]) => {
    setTrades(updatedTrades);
    if (!currentSite) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      const payload = updatedTrades.map((t) => ({
        site_id: currentSite.id,
        log_date: today,
        trade: t.trade,
        present: t.presentCount,
        absent: t.absentCount,
        ot_hours: t.overtimeHours,
        rate_per_day: t.ratePerDay,
        remarks: t.workType,
      }));
      await Promise.all(payload.map((row) => labourApi.upsertAttendance(row)));
    } catch (err) {
      console.error('Failed to persist attendance:', err);
    }
  };

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#6B7280]">Select a site to view labour data.</p>
      </div>
    );
  }

  return (
    <>
      <LabourModule
        trades={trades}
        agencies={agencies}
        inductions={inductions}
        onUpdateTrades={handleUpdateTrades}
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
        materials={[]}
        equipment={[]}
        activeSiteId={currentSite.id}
      />
    </>
  );
}
