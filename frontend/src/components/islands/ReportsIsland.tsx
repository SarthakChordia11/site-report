import React, { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $isLoggedIn } from '../../stores/authStore';
import { $currentSite } from '../../stores/siteStore';
import { reportsApi } from '../../services/api';
import { ReportsHub } from '../modules/reports/ReportsHub';
import { GlobalAIModal } from '../ai/GlobalAIModal';
import type { SiteReport, ExtractedAIData } from '../../types';

export default function ReportsIsland() {
  const isLoggedIn = useStore($isLoggedIn);
  const currentSite = useStore($currentSite);
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [isRollingUp, setIsRollingUp] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const loadReports = useCallback(async () => {
    if (!currentSite) return;
    try {
      const data = await reportsApi.list(currentSite.id);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }, [currentSite]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleAddReport = async (report: SiteReport) => {
    if (!currentSite) return;
    try {
      const saved = await reportsApi.create(report);
      setReports((prev) => [saved, ...prev]);
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  const handleTriggerRollup = async (type: 'Weekly' | 'Monthly') => {
    if (!currentSite) return;
    setIsRollingUp(true);
    try {
      const res = await reportsApi.triggerRollup(currentSite.id, type);
      if (res.reports && res.reports.length > 0) {
        setReports(res.reports);
      } else {
        await loadReports();
      }
    } catch (err) {
      console.error('Failed to trigger rollup:', err);
      await loadReports();
    } finally {
      setIsRollingUp(false);
    }
  };

  if (!currentSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-400 mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Site Selected</h3>
          <p className="text-xs text-neutral-400">Select or create a site from the header to view shift reports and DPR logs.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReportsHub
        reports={reports}
        currentSite={currentSite}
        onOpenAIModal={() => setAiModalOpen(true)}
        onAddReport={handleAddReport}
        onTriggerRollup={handleTriggerRollup}
        isRollingUp={isRollingUp}
      />
      <GlobalAIModal
        isOpen={aiModalOpen}
        initialMode="voice"
        onClose={() => setAiModalOpen(false)}
        onApplyExtraction={async (_data: ExtractedAIData) => {
          setAiModalOpen(false);
          await loadReports();
        }}
        onModulesSynced={() => loadReports()}
        trades={[]}
        materials={[]}
        equipment={[]}
        activeSiteId={currentSite?.id ?? null}
      />
    </>
  );
}
