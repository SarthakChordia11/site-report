import React, { useState } from 'react';
import { 
  Site, 
  ModuleId, 
  InputMode, 
  TradeRosterItem, 
  AgencyLog, 
  WorkerInduction, 
  MaterialItem, 
  FinishedElement, 
  DispatchLog, 
  Vendor, 
  EquipmentItem, 
  BreakdownEvent, 
  CostSummary, 
  HistoricalEVMPoint,
  ExtractedAIData,
  SiteReport
} from './types';
import { sitesApi, labourApi, resourceApi, equipmentApi, costApi, reportsApi, authHelpers } from './services/api';
import { useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { GlobalAIModal } from './components/ai/GlobalAIModal';
import { DashboardOverview } from './components/modules/dashboard/DashboardOverview';
import { ReportsHub } from './components/modules/reports/ReportsHub';
import { SettingsView } from './components/modules/settings/SettingsView';
import { LabourModule } from './components/modules/labour/LabourModule';
import { ResourceModule } from './components/modules/resource/ResourceModule';
import { EquipmentModule } from './components/modules/equipment/EquipmentModule';
import { CostModule } from './components/modules/cost/CostModule';
import { CheckCircle2 } from 'lucide-react';
import { AuthPage } from './components/auth/AuthPage';
import { AddSiteModal } from './components/modules/dashboard/AddSiteModal';
import { INITIAL_COST_SUMMARY } from './data/initialData';

export default function App() {
  // Navigation & View Mode State
  const [viewMode, setViewMode] = useState<'auth' | 'landing' | 'app'>(
    authHelpers.isLoggedIn() ? 'app' : 'landing'
  );
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Data States
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);

  const [reports, setReports] = useState<SiteReport[]>([]);
  const [trades, setTrades] = useState<TradeRosterItem[]>([]);
  const [agencies, setAgencies] = useState<AgencyLog[]>([]);
  const [inductions, setInductions] = useState<WorkerInduction[]>([]);

  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [elements, setElements] = useState<FinishedElement[]>([]);
  const [dispatches, setDispatches] = useState<DispatchLog[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownEvent[]>([]);

  const [costSummary, setCostSummary] = useState<CostSummary>(INITIAL_COST_SUMMARY);
  const [evmHistory, setEvmHistory] = useState<HistoricalEVMPoint[]>([]);

  // Modals
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  const toTradeLabel = (trade: string) => trade.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // ── Load sites after an authenticated session enters the workspace ─────────
  useEffect(() => {
    if (!authHelpers.isLoggedIn()) {
      setSites([]);
      setCurrentSite(null);
      return;
    }
    sitesApi.list().then(data => {
      setSites(data);
      if (data.length > 0) setCurrentSite(data[0]);
    }).catch(error => console.error('Failed to load sites:', error));
  }, [viewMode]);

  // ── Load all module data whenever the active site changes ──────────────────
  const loadSiteData = useCallback(async () => {
    if (!currentSite) return;
    const siteId = currentSite.id;
    const today = new Date().toISOString().split('T')[0];

    try {
      const [
        attendance, safety, mats, elems, disps, vends, assets, bds, cost, siteReports,
      ] = await Promise.allSettled([
        labourApi.getAttendance(siteId, today),
        labourApi.getSafety(siteId),
        resourceApi.getMaterials(siteId),
        resourceApi.getElements(siteId),
        resourceApi.getDispatches(siteId),
        resourceApi.getVendors(siteId),
        equipmentApi.getAssets(siteId),
        equipmentApi.getBreakdowns(siteId),
        costApi.getSummary(siteId),
        reportsApi.list(siteId),
      ]);

      if (attendance.status === 'fulfilled') {
        const tradeMap: Record<string, any> = {};
        (attendance.value as any[]).forEach(r => {
          const key = r.trade;
          if (!tradeMap[key]) {
            tradeMap[key] = {
              trade: toTradeLabel(r.trade),
              plannedCount: r.present + r.absent,
              presentCount: r.present,
              absentCount: r.absent,
              leaveCount: 0,
              ratePerDay: 700,
              overtimeHours: r.ot_hours || 0,
              otRateMultiplier: 1.5,
              productivityOutput: 0,
              productivityUnit: 'Nos',
              workType: r.remarks || '',
              onSiteCount: r.location === 'on_site' ? r.present : 0,
              offSiteCount: r.location !== 'on_site' ? r.present : 0,
            };
          } else {
            tradeMap[key].presentCount += r.present;
            tradeMap[key].absentCount += r.absent;
            tradeMap[key].overtimeHours += r.ot_hours || 0;
            if (r.location !== 'on_site') tradeMap[key].offSiteCount += r.present;
            else tradeMap[key].onSiteCount += r.present;
          }
        });
        setTrades(Object.values(tradeMap));
      }

      if (safety.status === 'fulfilled') {
        setInductions((safety.value as any[]).map(r => ({
          id: r.id,
          workerName: r.worker_name,
          trade: r.trade || 'Helper',
          agency: r.agency || '',
          aadharLast4: '****',
          inductionDate: r.induction_date || 'Pending',
          safetyScore: r.inducted ? 90 : 0,
          status: r.inducted ? 'Inducted & Certified' : 'Induction Pending',
          ppeIssued: r.inducted,
          medicalCheck: r.inducted,
        })));
      }

      if (mats.status === 'fulfilled') {
        setMaterials((mats.value as any[]).map(m => ({
          id: m.id,
          name: m.name,
          category: 'Cement & Aggregates',
          unit: m.unit,
          openingStock: m.current_stock,
          receivedToday: m.total_received || 0,
          consumedToday: m.total_consumed || 0,
          currentStock: m.current_stock,
          minReorderLevel: m.reorder_level,
          unitPrice: 0,
          plannedConsumption: 0,
          reorderStatus: m.low_stock ? 'Low Stock' : 'Sufficient',
          wastagePercent: 0,
          supplier: '',
        })));
      }

      if (elems.status === 'fulfilled') {
        setElements((elems.value as any[]).map(e => ({
          id: e.id,
          elementTag: e.element_id,
          type: e.element_type || 'Precast Beam',
          castDate: e.cast_date || '',
          cureCompletionDate: e.cure_complete_date || '',
          qcInspectionPassed: e.stage !== 'cast',
          stage: e.stage.charAt(0).toUpperCase() + e.stage.slice(1),
          targetLocation: '',
          dimensions: '',
          weightTons: 0,
          erectionPlannedDate: e.erection_date || '',
        })));
      }

      if (disps.status === 'fulfilled') {
        setDispatches((disps.value as any[]).map(d => ({
          id: d.id,
          grnNo: d.id.slice(0, 8).toUpperCase(),
          elementOrMaterial: d.element_id || d.material_item_id || 'Material',
          quantity: d.quantity || '',
          origin: '',
          destination: '',
          transporter: d.transporter || '',
          vehicleNo: d.vehicle_no || '',
          driverContact: '',
          dispatchTime: d.date || '',
          eta: d.eta || '',
          status: d.received_confirmed ? 'Delivered' : 'In Transit',
          receiptConfirmedBy: '',
        })));
      }

      if (vends.status === 'fulfilled') {
        setVendors((vends.value as any[]).map(v => ({
          id: v.id,
          name: v.name,
          type: v.vendor_type === 'transport' ? 'Logistics & Haulage' : 'Material Supplier',
          materialsSupplied: [],
          onTimeDeliveryRate: v.on_time_pct,
          qualityPassRate: 100 - v.quality_issues * 2,
          activeOrders: 0,
          totalBilledYTD: 0,
          paymentStatus: 'Cleared',
          rating: Math.max(1, 5 - v.quality_issues * 0.2),
        })));
      }

      if (assets.status === 'fulfilled') {
        setEquipment((assets.value as any[]).map(a => ({
          id: a.id,
          name: a.name,
          assetTag: a.id.slice(0, 8).toUpperCase(),
          category: 'Lifting & Cranes',
          ownership: a.owned ? 'Owned' : 'Rented',
          status: a.today_status?.breakdown_hrs > 0 ? 'Breakdown'
            : a.today_status?.idle_hrs > 0 ? 'Idle'
            : a.today_status?.working_hrs > 0 ? 'Working' : 'Idle',
          operatorName: a.operator_name || '',
          workingHoursToday: a.today_status?.working_hrs || 0,
          idleHoursToday: a.today_status?.idle_hrs || 0,
          breakdownHoursToday: a.today_status?.breakdown_hrs || 0,
          idleReason: '',
          dailyRate: a.daily_rate || 0,
          vendorName: a.vendor || '',
          rentalStartDate: a.rental_start || '',
          rentalEndDate: a.rental_end || '',
          totalAccruedRental: (a.rental_days_logged || 0) * (a.daily_rate || 0),
          fuelConsumedLiters: 0,
          lastServiceDate: '',
        })));
      }

      if (bds.status === 'fulfilled') {
        setBreakdowns((bds.value as any[]).map(b => ({
          id: b.id,
          equipmentId: '',
          equipmentName: b.asset_name,
          reportedAt: b.date,
          resolvedAt: '',
          downtimeMinutes: Math.round((b.breakdown_hrs || 0) * 60),
          reason: b.reason || '',
          actionTaken: '',
          technician: '',
          status: 'Resolved' as const,
          costImpact: 0,
        })));
      }

      if (cost.status === 'fulfilled') {
        const c = cost.value as any;
        setCostSummary({
          siteId: currentSite.id,
          date: today,
          labourCostActual: c.labour?.actual || 0,
          materialCostActual: c.material?.actual || 0,
          equipmentCostActual: c.equipment?.actual || 0,
          otherCostActual: 0,
          totalActualSpend: c.total?.actual || 0,
          plannedBudgetCumulative: c.total?.budget || 0,
          earnedValueCumulative: c.total?.budget ? c.total.budget * 0.98 : 0,
          actualCostCumulative: c.total?.actual || 0,
          costVariance: c.total?.variance || 0,
          costPerformanceIndex: c.total?.actual > 0 && c.total?.budget > 0
            ? (c.total.budget * 0.98) / c.total.actual : 0,
          scheduleVariance: 0,
          schedulePerformanceIndex: 1,
          percentBudgetUtilized: c.total?.pct_used || 0,
          dailyBurnRate: 0,
          estimatedDaysRemaining: 0,
          aiNarrative: 'Loading AI narrative...',
          overspendAlerts: c.total?.variance < 0
            ? [`⚠️ Budget overrun: ₹${Math.abs(c.total.variance).toLocaleString('en-IN')} over budget.`]
            : [],
          optimizationRecommendations: [],
        });

        costApi.getNarrative(siteId).then(nr => {
          setCostSummary((prev: any) => prev ? { ...prev, aiNarrative: nr.narrative } : prev);
        }).catch(() => {});
      }

      if (siteReports.status === 'fulfilled') {
        setReports(siteReports.value as SiteReport[]);
      }
    } catch (err) {
      console.error('Failed to load site data:', err);
    }
  }, [currentSite]);

  useEffect(() => {
    if (currentSite) loadSiteData();
  }, [currentSite, loadSiteData]);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalInitialMode, setAiModalInitialMode] = useState<InputMode>('voice');
  const [lastSyncToast, setLastSyncToast] = useState<{ text: string; module: ModuleId } | null>(null);

  const handleOpenAIModal = (mode: InputMode = 'voice') => {
    setAiModalInitialMode(mode);
    setAiModalOpen(true);
  };

  const handleUpdateTrades = async (updated: TradeRosterItem[]) => {
    setTrades(updated);
    if (!currentSite) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      await Promise.all(updated.map(trade => labourApi.upsertAttendance({
        site_id: currentSite.id, date: today, trade: trade.trade,
        present: trade.presentCount, absent: trade.absentCount,
        ot_hours: trade.overtimeHours, location: trade.offSiteCount > 0 ? 'casting_yard' : 'on_site',
        remarks: trade.workType,
      })));
      loadSiteData();
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  };

  const handleMaterialAdjustment = async (itemId: string, type: 'received' | 'consumed', amount: number) => {
    if (!currentSite) return;
    try {
      await resourceApi.logMaterial({
        item_id: itemId, site_id: currentSite.id,
        date: new Date().toISOString().split('T')[0],
        received: type === 'received' ? amount : 0,
        consumed: type === 'consumed' ? amount : 0,
      });
      loadSiteData();
    } catch (error) {
      console.error('Failed to save material movement:', error);
    }
  };

  const handleElementStageChange = async (elementId: string, stage: string) => {
    try {
      await resourceApi.updateElementStage(elementId, stage.toLowerCase());
      loadSiteData();
    } catch (error) {
      console.error('Failed to save element stage:', error);
    }
  };

  const handleEquipmentUpdate = async (item: EquipmentItem) => {
    if (!currentSite) return;
    try {
      await equipmentApi.upsertLog({
        asset_id: item.id, site_id: currentSite.id,
        date: new Date().toISOString().split('T')[0],
        working_hrs: item.workingHoursToday,
        idle_hrs: item.idleHoursToday,
        breakdown_hrs: item.breakdownHoursToday,
        idle_reason: item.idleReason || '',
        breakdown_reason: item.status === 'Breakdown' ? 'Reported from dashboard' : '',
      });
      loadSiteData();
    } catch (error) {
      console.error('Failed to save equipment log:', error);
    }
  };

  const handleLaunchApp = (targetModule: ModuleId = 'dashboard') => {
    if (!authHelpers.isLoggedIn()) {
      setViewMode('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveModule(targetModule);
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchEstimator = () => {
    window.location.assign('/estimator');
  };

  // Add new report
  const handleAddReport = async (newRep: SiteReport) => {
    try {
      const saved = await reportsApi.create(newRep);
      setReports(prev => [saved, ...prev]);
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  };

  // Process and apply extracted data into live operational state
  const handleApplyExtraction = async (data: ExtractedAIData) => {
    const { module, parsedFields, actionSummary } = data;

    // Quick-form and document extraction use module-shaped payloads. Persist them
    // before updating the presentation state so an applied result survives refresh.
    if (currentSite) {
      const today = new Date().toISOString().split('T')[0];
      try {
        if (Array.isArray(parsedFields.attendance)) {
          await Promise.all(parsedFields.attendance.map((row: any) => labourApi.upsertAttendance({
            site_id: currentSite.id, date: today, ...row,
          })));
        }
        if (Array.isArray(parsedFields.materials)) {
          for (const row of parsedFields.materials) {
            let item = materials.find(material => material.name.toLowerCase() === String(row.name || '').toLowerCase());
            if (!item && row.name) {
              const created = await resourceApi.addMaterial({
                site_id: currentSite.id, name: row.name, unit: row.unit || 'Nos',
              });
              item = { id: created.id, name: row.name } as MaterialItem;
            }
            if (item) {
              await resourceApi.logMaterial({
                item_id: item.id, site_id: currentSite.id, date: today,
                received: Number(row.received) || 0, consumed: Number(row.consumed) || 0,
                invoice_no: row.invoice_no || '', remarks: row.remarks || '',
              });
            }
          }
        }
        if (Array.isArray(parsedFields.equipment)) {
          for (const row of parsedFields.equipment) {
            let asset = equipment.find(item => item.name.toLowerCase() === String(row.name || '').toLowerCase());
            if (!asset && row.name) {
              const created = await equipmentApi.addAsset({ site_id: currentSite.id, name: row.name });
              asset = { id: created.id, name: row.name } as EquipmentItem;
            }
            if (asset) {
              await equipmentApi.upsertLog({
                asset_id: asset.id, site_id: currentSite.id, date: today,
                working_hrs: Number(row.working_hrs) || 0, idle_hrs: Number(row.idle_hrs) || 0,
                breakdown_hrs: Number(row.breakdown_hrs) || 0,
                idle_reason: row.idle_reason || '', breakdown_reason: row.breakdown_reason || '',
                remarks: row.remarks || '',
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to persist extracted module data:', error);
      }
    }

    let tradesPresent = 0;
    let criticalIssues = 0;
    let materialsSummary = 'Automated stock update';
    let equipmentUptime = 100;

    if (data.parsedFields?.fullReport) {
      const fr = data.parsedFields.fullReport;
      if (fr.labour) tradesPresent = fr.labour.reduce((acc: number, l: any) => acc + (l.present || 0), 0);
      if (fr.ncr_reports) criticalIssues = fr.ncr_reports.length;
      if (fr.materials && fr.materials.length > 0) materialsSummary = `${fr.materials.length} items logged`;
    } else {
      tradesPresent = trades.reduce((acc, t) => acc + t.presentCount, 0);
    }

    // Create a new automatic report entry for this interaction
    const newReportItem: SiteReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      name: `Shift Voice Log #${reports.length + 1}`,
      projectName: currentSite?.name.split(' ')[0] + ' ' + (currentSite?.name.split(' ')[1] || 'Site'),
      siteId: currentSite?.id || '',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      reportType: 'Daily',
      status: 'Completed',
      author: 'Darshan Girase (PM)',
      summary: actionSummary.join('. ') || 'AI Extracted field telemetry and synced live site ledger.',
      tradesPresentCount: tradesPresent,
      criticalIssuesCount: criticalIssues,
      materialsReceivedSummary: materialsSummary,
      equipmentUptimePercent: equipmentUptime,
      evmStatus: 'CPI 1.04 (On Budget)',
      voiceTranscript: data.rawInput,
      extractedData: data.parsedFields?.fullReport
        ? { fullReport: data.parsedFields.fullReport }
        : data.parsedFields,
    };
    await handleAddReport(newReportItem);

    // Refresh from backend after apply
    loadSiteData();

    if (module === 'labour') {
      const updatedTrades = [...trades];
      if (parsedFields.masonPresent !== undefined) {
        const idx = updatedTrades.findIndex(t => t.trade === 'Mason');
        if (idx >= 0) {
          updatedTrades[idx].presentCount = parsedFields.masonPresent;
          if (parsedFields.masonAbsent !== undefined) {
            updatedTrades[idx].absentCount = parsedFields.masonAbsent;
          }
        }
      }
      if (parsedFields.helperPresent !== undefined) {
        const idx = updatedTrades.findIndex(t => t.trade === 'Helper');
        if (idx >= 0) updatedTrades[idx].presentCount = parsedFields.helperPresent;
      }
      if (parsedFields.carpenterPresent !== undefined) {
        const idx = updatedTrades.findIndex(t => t.trade === 'Carpenter');
        if (idx >= 0) {
          updatedTrades[idx].presentCount = parsedFields.carpenterPresent;
          if (parsedFields.carpenterOtHours !== undefined) {
            updatedTrades[idx].overtimeHours = parsedFields.carpenterOtHours * parsedFields.carpenterPresent;
          }
        }
      }
      setTrades(updatedTrades);
      setActiveModule('labour');
    } else if (module === 'resource') {
      const updatedMaterials = [...materials];
      if (parsedFields.cementReceivedBags !== undefined || parsedFields.cementConsumedBags !== undefined) {
        const idx = updatedMaterials.findIndex(m => m.id === 'mat-1');
        if (idx >= 0) {
          const rec = parsedFields.cementReceivedBags ?? updatedMaterials[idx].receivedToday;
          const con = parsedFields.cementConsumedBags ?? updatedMaterials[idx].consumedToday;
          updatedMaterials[idx].receivedToday = rec;
          updatedMaterials[idx].consumedToday = con;
          updatedMaterials[idx].currentStock = updatedMaterials[idx].openingStock + rec - con;
        }
      }
      if (parsedFields.steelConsumedMT !== undefined) {
        const idx = updatedMaterials.findIndex(m => m.id === 'mat-2');
        if (idx >= 0) {
          updatedMaterials[idx].consumedToday = parsedFields.steelConsumedMT;
          updatedMaterials[idx].currentStock = updatedMaterials[idx].openingStock + updatedMaterials[idx].receivedToday - parsedFields.steelConsumedMT;
        }
      }
      setMaterials(updatedMaterials);
      setActiveModule('resource');
    } else if (module === 'equipment') {
      const updatedEquipment = [...equipment];
      if (parsedFields.towerCraneHours !== undefined) {
        const idx = updatedEquipment.findIndex(e => e.id === 'eq-1');
        if (idx >= 0) updatedEquipment[idx].workingHoursToday = parsedFields.towerCraneHours;
      }
      if (parsedFields.jcbIdleHours !== undefined) {
        const idx = updatedEquipment.findIndex(e => e.id === 'eq-2');
        if (idx >= 0) {
          updatedEquipment[idx].status = 'Idle';
          updatedEquipment[idx].idleHoursToday = parsedFields.jcbIdleHours;
          if (parsedFields.jcbIdleReason) updatedEquipment[idx].idleReason = parsedFields.jcbIdleReason;
        }
      }
      if (parsedFields.boomPumpBreakdown) {
        const idx = updatedEquipment.findIndex(e => e.id === 'eq-3');
        if (idx >= 0) {
          updatedEquipment[idx].status = 'Breakdown';
          updatedEquipment[idx].breakdownHoursToday = parsedFields.downtimeHours || 2;
        }
      }
      setEquipment(updatedEquipment);
      setActiveModule('equipment');
    } else if (module === 'cost') {
      setActiveModule('cost');
    }

    // Show quick sync toast
    setLastSyncToast({
      text: `AI Synchronized: ${actionSummary[0] || 'Database Updated & Report Created'}`,
      module,
    });
    setTimeout(() => setLastSyncToast(null), 5000);

    if (viewMode === 'landing') {
      setViewMode('app');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0E0E0E] font-sans antialiased selection:bg-[#FF6A00] selection:text-white">
      {viewMode === 'auth' ? (
        <AuthPage onAuthSuccess={() => handleLaunchApp('dashboard')} />
      ) : viewMode === 'landing' ? (
        <LandingPage
          onLaunchApp={handleLaunchApp}
          onLaunchEstimator={handleLaunchEstimator}
          onOpenAIModal={handleOpenAIModal}
        />
      ) : (
        <div className="min-h-screen flex">
          {/* Left Sidebar matching reference image */}
          <Sidebar
            activeModule={activeModule}
            onSelectModule={setActiveModule}
            onLogOut={() => {
              authHelpers.clearSession();
              setViewMode('auth');
            }}
            reportsCount={reports.length}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area shifted by sidebar width on desktop */}
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            <Header
              currentSite={currentSite}
              sites={sites}
              onSelectSite={setCurrentSite}
              activeModule={activeModule}
              onSelectModule={setActiveModule}
              onOpenAIModal={handleOpenAIModal}
              onBackToLanding={() => setViewMode('landing')}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
              onAddSite={() => setIsAddSiteModalOpen(true)}
            />

            {/* Sync Success Toast */}
            {lastSyncToast && (
              <div className="mx-4 lg:mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{lastSyncToast.text}</span>
                </div>
                <button
                  onClick={() => setActiveModule(lastSyncToast.module)}
                  className="px-2.5 py-1 bg-[#0E0E0E] hover:bg-[#1A1A1A] text-white rounded-lg font-bold text-[11px] cursor-pointer transition-colors"
                >
                  View Module →
                </button>
              </div>
            )}

            {/* Active Workspace View */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
              {activeModule === 'dashboard' && (
                currentSite ? (
                <DashboardOverview
                  currentSite={currentSite}
                  reports={reports}
                  trades={trades}
                  materials={materials}
                  equipment={equipment}
                  costSummary={costSummary}
                  onOpenAIModal={handleOpenAIModal}
                  onSelectModule={setActiveModule}
                />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#0E0E0E] mb-2">No Sites Found</h2>
                      <p className="text-[#6B7280] max-w-sm">Your database is connected but empty. Create your first site to get started.</p>
                    </div>
                    <button
                      onClick={() => setIsAddSiteModalOpen(true)}
                      className="px-6 py-3 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      + Add First Site
                    </button>
                  </div>
                )
              )}


              {activeModule === 'reports' && (
                <ReportsHub
                  reports={reports}
                  currentSite={currentSite}
                  onOpenAIModal={handleOpenAIModal}
                  onAddReport={handleAddReport}
                />
              )}

              {activeModule === 'labour' && (
                <LabourModule
                  trades={trades}
                  agencies={agencies}
                  inductions={inductions}
                  safetyInductions={inductions}
                  onUpdateTrades={handleUpdateTrades}
                  onOpenAIModal={() => handleOpenAIModal('voice')}
                />
              )}

              {activeModule === 'resource' && currentSite && (
                <ResourceModule
                  materials={materials}
                  elements={elements}
                  dispatches={dispatches}
                  vendors={vendors}
                  isPrecastSite={currentSite.isPrecast}
                  onUpdateMaterials={setMaterials}
                  onUpdateElements={setElements}
                  onAdjustMaterial={handleMaterialAdjustment}
                  onChangeElementStage={handleElementStageChange}
                  onOpenAIModal={handleOpenAIModal}
                />
              )}

              {activeModule === 'equipment' && (
                <EquipmentModule
                  equipment={equipment}
                  breakdowns={breakdowns}
                  onUpdateEquipment={setEquipment}
                  onUpdateBreakdowns={setBreakdowns}
                  onPersistEquipment={handleEquipmentUpdate}
                  onOpenAIModal={() => handleOpenAIModal('voice')}
                />
              )}

              {activeModule === 'cost' && (
                <CostModule
                  costSummary={costSummary}
                  evmHistory={evmHistory}
                  trades={trades}
                  materials={materials}
                  equipment={equipment}
                  onOpenAIModal={() => handleOpenAIModal('form')}
                />
              )}

              {activeModule === 'settings' && (
                <SettingsView />
              )}
            </main>
          </div>
        </div>
      )}

      <GlobalAIModal
        isOpen={aiModalOpen}
        initialMode={aiModalInitialMode}
        onClose={() => setAiModalOpen(false)}
        onApplyExtraction={handleApplyExtraction}
        onModulesSynced={() => {
          // Reload all module data from backend after DPR auto-sync
          loadSiteData();
        }}
        trades={trades}
        materials={materials}
        equipment={equipment}
        activeSiteId={currentSite?.id ?? null}
      />

      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onSiteCreated={(newSite) => {
          setSites((prev) => [...prev, newSite]);
          setCurrentSite(newSite);
        }}
      />
    </div>
  );
}
