import React, { useState } from 'react';
import { 
  FileText, 
  Building2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  Plus, 
  Mic, 
  Camera, 
  Search, 
  Filter, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Calendar
} from 'lucide-react';
import type { 
  Site, 
  SiteReport, 
  TradeRosterItem, 
  MaterialItem, 
  EquipmentItem, 
  CostSummary, 
  ModuleId 
} from '../../../types';

interface DashboardOverviewProps {
  currentSite: Site;
  reports: SiteReport[];
  trades: TradeRosterItem[];
  materials: MaterialItem[];
  equipment: EquipmentItem[];
  costSummary: CostSummary | null;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
  onSelectModule: (module: ModuleId) => void;
  onSelectReport?: (report: SiteReport) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentSite,
  reports,
  trades,
  materials,
  equipment,
  costSummary,
  onOpenAIModal,
  onSelectModule,
  onSelectReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'In Progress'>('All');
  const [selectedReportDetail, setSelectedReportDetail] = useState<SiteReport | null>(null);

  const totalWorkersPresent = (trades || []).reduce((acc, t) => acc + (t.presentCount || 0), 0);
  const activeMachineryCount = (equipment || []).filter(e => e.status === 'Working').length;
  const criticalMaterialAlerts = (materials || []).filter(m => (m.currentStock ?? 0) <= (m.minReorderLevel ?? 0)).length;

  const filteredReports = (reports || []).filter(r => {
    const matchesSearch = (r?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Header: "Welcome back, Project Manager" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, Project Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal">
            Here's what's happening on your sites today across all active locations.
          </p>
        </div>

        {/* Primary Pill Button: "+ New Report" */}
        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-report-btn"
            onClick={() => onOpenAIModal('voice')}
            className="px-6 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs sm:text-sm shadow-xl shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards with Steelora industrial aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Reports */}
        <div className="bg-[#161A24] border border-white/10 rounded-2xl p-5 shadow-lg hover:border-[#FF5E14]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <FileText className="w-5 h-5" />
            </div>
            {reports.length > 0 && (
              <span className="inline-flex items-center text-[10px] font-semibold text-[#FF5E14] bg-[#FF5E14]/15 px-2.5 py-0.5 rounded-full border border-[#FF5E14]/30">
                Live Data
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-neutral-400">Total Reports</p>
            <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{reports.length}</p>
          </div>
        </div>

        {/* Card 2: Active Sites */}
        <div className="bg-[#161A24] border border-white/10 rounded-2xl p-5 shadow-lg hover:border-[#FF5E14]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-neutral-400">Active Sites</p>
            <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">1</p>
          </div>
        </div>

        {/* Card 3: Issues Found */}
        <div className="bg-[#161A24] border border-white/10 rounded-2xl p-5 shadow-lg hover:border-[#FF5E14]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-neutral-400">Issues Found</p>
            <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{criticalMaterialAlerts}</p>
          </div>
        </div>

        {/* Card 4: Reports Generated / Accuracy */}
        <div className="bg-[#161A24] border border-white/10 rounded-2xl p-5 shadow-lg hover:border-[#FF5E14]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-neutral-400">Extraction Accuracy</p>
            <p className="text-3xl font-extrabold text-white mt-1 tracking-tight">{reports.length > 0 ? '98%' : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Live Site Quick Actions & AI Input triggers */}
      <div className="bg-[#161A24] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14] shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quick Multimodal Field Logging</h2>
              <p className="text-xs text-neutral-400">Capture field logs with zero manual data entry in Hindi, Marathi, or English</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-4 py-2 bg-[#FF5E14] hover:bg-[#E04F0F] text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#FF5E14]/20"
            >
              <Mic className="w-3.5 h-3.5 text-white" />
              <span>Voice Note</span>
            </button>
          </div>
        </div>

        {/* Live Pulse Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 text-xs">
          <div 
            onClick={() => onSelectModule('labour')}
            className="p-4 bg-[#0B0D13] hover:bg-white/5 border border-white/10 hover:border-[#FF5E14]/30 rounded-2xl cursor-pointer transition-colors"
          >
            <p className="text-neutral-400 text-[11px]">Active Manpower</p>
            <p className="text-base font-bold text-white mt-1">{totalWorkersPresent} Workers</p>
            <p className="text-[10px] text-[#FF5E14] mt-1.5 font-semibold">View Labour Roster →</p>
          </div>

          <div 
            onClick={() => onSelectModule('resource')}
            className="p-4 bg-[#0B0D13] hover:bg-white/5 border border-white/10 hover:border-[#FF5E14]/30 rounded-2xl cursor-pointer transition-colors"
          >
            <p className="text-neutral-400 text-[11px]">Material Reorders</p>
            <p className="text-base font-bold text-white mt-1">{criticalMaterialAlerts} Alerts</p>
            <p className="text-[10px] text-[#FF5E14] mt-1.5 font-semibold">View Inventory →</p>
          </div>

          <div 
            onClick={() => onSelectModule('equipment')}
            className="p-4 bg-[#0B0D13] hover:bg-white/5 border border-white/10 hover:border-[#FF5E14]/30 rounded-2xl cursor-pointer transition-colors"
          >
            <p className="text-neutral-400 text-[11px]">Equipment Operating</p>
            <p className="text-base font-bold text-white mt-1">{activeMachineryCount} Units Active</p>
            <p className="text-[10px] text-[#FF5E14] mt-1.5 font-semibold">View Plant Status →</p>
          </div>

          <div 
            onClick={() => onSelectModule('cost')}
            className="p-4 bg-[#0B0D13] hover:bg-white/5 border border-white/10 hover:border-[#FF5E14]/30 rounded-2xl cursor-pointer transition-colors"
          >
            <p className="text-neutral-400 text-[11px]">EVM Performance</p>
            <p className="text-base font-bold text-emerald-400 mt-1">
              CPI {costSummary?.costPerformanceIndex != null ? costSummary.costPerformanceIndex.toFixed(2) : '1.03'}
            </p>
            <p className="text-[10px] text-[#FF5E14] mt-1.5 font-semibold">View Financial EVM →</p>
          </div>
        </div>
      </div>

      {/* Recent Reports Table with Steelora styling */}
      <div className="bg-[#161A24] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Reports</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Summary of latest AI-generated site inspections and shift logs</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {/* Search filter */}
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 bg-[#0B0D13] border border-white/10 rounded-full text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5E14] focus:ring-1 focus:ring-[#FF5E14]/30 transition-colors"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-[#0B0D13] border border-white/10 rounded-full p-1 text-xs justify-between sm:justify-start">
              {(['All', 'Completed', 'In Progress'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table layout with Steelora styling */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 font-semibold">
                <th className="pb-3 px-3">Report Name</th>
                <th className="pb-3 px-3">Project</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className="hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedReportDetail(report)}
                >
                  <td className="py-4 px-3 font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="group-hover:text-[#FF5E14] transition-colors">{report.name}</p>
                        <p className="text-[11px] text-neutral-400 font-normal">{report.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-neutral-300 font-medium">
                    {report.projectName}
                  </td>

                  <td className="py-4 px-3 text-neutral-400">
                    {report.date}
                  </td>

                  <td className="py-4 px-3">
                    <span 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${
                        report.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReportDetail(report);
                      }}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Link: "View All Reports →" */}
        <div className="pt-6 mt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-neutral-400">
            Showing {filteredReports.length} of {reports.length} generated reports
          </span>

          <button
            onClick={() => onSelectModule('reports')}
            className="flex items-center gap-1.5 text-white hover:text-[#FF5E14] font-semibold cursor-pointer transition-colors"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5E14]" />
          </button>
        </div>
      </div>

      {/* Report Quick Modal Inspector */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161A24] border border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedReportDetail.name}</h3>
                  <p className="text-xs text-neutral-400">{selectedReportDetail.projectName} • {selectedReportDetail.date}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                selectedReportDetail.status === 'Completed'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30'
              }`}>
                {selectedReportDetail.status}
              </span>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2">
              {selectedReportDetail.extractedData?.fullReport ? (
                <>
                  <div className="p-3 bg-[#0B0D13] border border-white/10 text-white rounded-xl font-bold text-sm">
                    A. DAILY PROGRESS REPORT (DPR)
                  </div>
                  <div className="grid grid-cols-2 gap-2 border border-white/10 p-3 bg-[#0B0D13] rounded-xl text-neutral-300">
                    <div><strong className="text-white">Project:</strong> {selectedReportDetail.projectName}</div>
                    <div><strong className="text-white">Date:</strong> {selectedReportDetail.date}</div>
                    <div className="col-span-2"><strong className="text-white">Prepared By:</strong> {selectedReportDetail.author}</div>
                  </div>
                  
                  <h4 className="font-bold text-white mt-3">Total Manpower</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#0B0D13] text-white">
                        <th className="p-2 border border-white/10">Trade</th>
                        <th className="p-2 border border-white/10">Today</th>
                        <th className="p-2 border border-white/10">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.labour?.map((l: any, i: number) => (
                        <tr key={`lb-${i}`} className="hover:bg-white/5">
                          <td className="p-2 border border-white/10 capitalize text-white">{l.trade}</td>
                          <td className="p-2 border border-white/10 text-neutral-300">{l.present}</td>
                          <td className="p-2 border border-white/10 text-[10px] text-neutral-400">{l.productivity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h4 className="font-bold text-white mt-3">Material Consumed</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#0B0D13] text-white">
                        <th className="p-2 border border-white/10">Material</th>
                        <th className="p-2 border border-white/10">Qty</th>
                        <th className="p-2 border border-white/10">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.materials?.map((m: any, i: number) => (
                        <tr key={`mt-${i}`} className="hover:bg-white/5">
                          <td className="p-2 border border-white/10 text-white">{m.item}</td>
                          <td className="p-2 border border-white/10 text-neutral-300">{m.quantity}</td>
                          <td className="p-2 border border-white/10 text-[10px] text-neutral-400">{m.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h4 className="font-bold text-white mt-3">Production Log</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#0B0D13] text-white">
                        <th className="p-2 border border-white/10">Activity</th>
                        <th className="p-2 border border-white/10">Achieved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.work_progress?.map((w: any, i: number) => (
                        <tr key={`wp-${i}`} className="hover:bg-white/5">
                          <td className="p-2 border border-white/10 text-white">{w.activity}</td>
                          <td className="p-2 border border-white/10 text-emerald-400 font-bold">{w.actual_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <div className="p-4 bg-[#0B0D13] rounded-2xl border border-white/10">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Executive Summary</p>
                    <p className="text-white leading-relaxed font-medium">{selectedReportDetail.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Labour Count</p>
                      <p className="text-sm font-bold text-white mt-1">{selectedReportDetail.tradesPresentCount} Workers</p>
                    </div>
                    <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Equipment Uptime</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">{selectedReportDetail.equipmentUptimePercent}%</p>
                    </div>
                    <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Materials Received</p>
                      <p className="text-xs font-bold text-white mt-1">{selectedReportDetail.materialsReceivedSummary}</p>
                    </div>
                    <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wider">EVM Index</p>
                      <p className="text-xs font-bold text-[#FF5E14] mt-1">{selectedReportDetail.evmStatus}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedReportDetail(null);
                  onSelectModule('reports');
                }}
                className="px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF5E14]/20 transition-all"
              >
                <span>Open in Reports Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
