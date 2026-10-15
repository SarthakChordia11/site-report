import React, { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { labourApi } from '../../services/api';
import { LabourModule } from '../modules/labour/LabourModule';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import { INITIAL_TRADES } from '../../data/initialData';
import type {
  TradeRosterItem,
  AgencyLog,
  WorkerInduction,
  ExtractedAIData,
} from '../../types';

export default function LabourIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);

  const [trades, setTrades] = useState<TradeRosterItem[]>(INITIAL_TRADES);
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
            otRateMultiplier: r.ot_rate_multiplier || 1.5,
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
          if (r.rate_per_day) {
            tradeMap[r.trade].ratePerDay = r.rate_per_day;
          }
          if (r.ot_rate_multiplier) {
            tradeMap[r.trade].otRateMultiplier = r.ot_rate_multiplier;
          }
        }
      });
      if (Object.keys(tradeMap).length > 0) {
        setTrades(Object.values(tradeMap));
      } else {
        setTrades(INITIAL_TRADES);
      }
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
        date: today,
        log_date: today,
        trade: t.trade,
        present: t.presentCount,
        absent: t.absentCount,
        ot_hours: t.overtimeHours,
        rate_per_day: t.ratePerDay,
        ot_rate_multiplier: t.otRateMultiplier || 1.5,
        remarks: t.workType,
      }));
      await Promise.all(payload.map((row) => labourApi.upsertAttendance(row)));
    } catch (err) {
      console.error('Failed to persist attendance:', err);
    }
  };

  if (!currentSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="bg-[#161A24] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14] mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Site Selected</h3>
          <p className="text-xs text-neutral-400">Select or create a site from the header to view labour muster and attendance.</p>
        </div>
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
