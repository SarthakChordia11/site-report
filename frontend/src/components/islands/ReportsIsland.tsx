import React, { useState, useEffect, useCallback } from 'react';
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

  if (!currentSite) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-[#6B7280]">Select a site to view reports.</p>
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
      />
      <GlobalAIModal
        isOpen={aiModalOpen}
        initialMode="voice"
        onClose={() => setAiModalOpen(false)}
        onApplyExtraction={async (_data: ExtractedAIData) => {
          setAiModalOpen(false);
          loadReports();
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
