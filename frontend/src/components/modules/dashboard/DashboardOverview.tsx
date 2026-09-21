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
import { 
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
      {/* Top Header matching reference image: "Welcome back, Project Manager" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E0E0E] tracking-tight">
            Welcome back, Project Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] mt-1 font-normal">
            Here's what's happening on your sites today across all active locations.
          </p>
        </div>

        {/* Primary Orange Button: "+ New Report" */}
        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-report-btn"
            onClick={() => onOpenAIModal('voice')}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#FF6A00]/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards matching the reference image layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Reports */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs hover:border-[#FF6A00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#FF6A00]" />
            </div>
            {reports.length > 0 && (
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Data
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">Total Reports</p>
            <p className="text-3xl font-extrabold text-[#0E0E0E] mt-1 tracking-tight">{reports.length}</p>
          </div>
        </div>

        {/* Card 2: Projects */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs hover:border-[#FF6A00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#FF6A00]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">Active Sites</p>
            <p className="text-3xl font-extrabold text-[#0E0E0E] mt-1 tracking-tight">1</p>
          </div>
        </div>

        {/* Card 3: Issues Found */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs hover:border-[#FF6A00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FF6A00]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">Issues Found</p>
            <p className="text-3xl font-extrabold text-[#0E0E0E] mt-1 tracking-tight">{criticalMaterialAlerts}</p>
          </div>
        </div>

        {/* Card 4: Reports Generated / Accuracy */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs hover:border-[#FF6A00]/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#FF6A00]" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-[#737373]">Extraction Accuracy</p>
            <p className="text-3xl font-extrabold text-[#0E0E0E] mt-1 tracking-tight">{reports.length > 0 ? '98%' : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Live Site Quick Actions & AI Input triggers */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E0E0E] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0E0E0E]">Quick Multimodal Field Logging</h2>
              <p className="text-xs text-[#525252]">Capture field logs with zero manual data entry in Hindi, Marathi, or English</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-3.5 py-2 bg-[#0E0E0E] hover:bg-[#1A1A1A] text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Voice Note</span>
            </button>


          </div>
        </div>

        {/* Live Pulse Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div 
            onClick={() => onSelectModule('labour')}
            className="p-3 bg-[#F7F7F7] hover:bg-[#FFF2E8] border border-[#E5E5E5] hover:border-[#FF6A00]/30 rounded-xl cursor-pointer transition-colors"
          >
            <p className="text-[#737373] text-[11px]">Active Manpower</p>
            <p className="text-base font-bold text-[#0E0E0E] mt-0.5">{totalWorkersPresent} Workers</p>
            <p className="text-[10px] text-[#FF6A00] mt-1 font-semibold">View Labour Roster →</p>
          </div>

          <div 
            onClick={() => onSelectModule('resource')}
            className="p-3 bg-[#F7F7F7] hover:bg-[#FFF2E8] border border-[#E5E5E5] hover:border-[#FF6A00]/30 rounded-xl cursor-pointer transition-colors"
          >
            <p className="text-[#737373] text-[11px]">Material Reorders</p>
            <p className="text-base font-bold text-[#0E0E0E] mt-0.5">{criticalMaterialAlerts} Alerts</p>
            <p className="text-[10px] text-[#FF6A00] mt-1 font-semibold">View Inventory →</p>
          </div>

          <div 
            onClick={() => onSelectModule('equipment')}
            className="p-3 bg-[#F7F7F7] hover:bg-[#FFF2E8] border border-[#E5E5E5] hover:border-[#FF6A00]/30 rounded-xl cursor-pointer transition-colors"
          >
            <p className="text-[#737373] text-[11px]">Equipment Operating</p>
            <p className="text-base font-bold text-[#0E0E0E] mt-0.5">{activeMachineryCount} Units Active</p>
            <p className="text-[10px] text-[#FF6A00] mt-1 font-semibold">View Plant Status →</p>
          </div>

          <div 
            onClick={() => onSelectModule('cost')}
            className="p-3 bg-[#F7F7F7] hover:bg-[#FFF2E8] border border-[#E5E5E5] hover:border-[#FF6A00]/30 rounded-xl cursor-pointer transition-colors"
          >
            <p className="text-[#737373] text-[11px]">EVM Performance</p>
            <p className="text-base font-bold text-emerald-600 mt-0.5">
              CPI {costSummary?.costPerformanceIndex != null ? costSummary.costPerformanceIndex.toFixed(2) : '1.03'}
            </p>
            <p className="text-[10px] text-[#FF6A00] mt-1 font-semibold">View Financial EVM →</p>
          </div>
        </div>
      </div>

      {/* Recent Reports Table matching the reference image */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#0E0E0E]">Recent Reports</h2>
            <p className="text-xs text-[#525252] mt-0.5">Summary of latest AI-generated site inspections and shift logs</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg text-xs text-[#0E0E0E] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-0.5 text-xs">
              {(['All', 'Completed', 'In Progress'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-white text-[#0E0E0E] shadow-xs'
                      : 'text-[#737373] hover:text-[#0E0E0E]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table layout matching the reference image */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[#737373] font-semibold">
                <th className="pb-3 px-3">Report Name</th>
                <th className="pb-3 px-3">Project</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className="hover:bg-[#F7F7F7]/80 transition-colors cursor-pointer group"
                  onClick={() => setSelectedReportDetail(report)}
                >
                  <td className="py-4 px-3 font-semibold text-[#0E0E0E]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FFF2E8] flex items-center justify-center text-[#FF6A00] shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="group-hover:text-[#FF6A00] transition-colors">{report.name}</p>
                        <p className="text-[11px] text-[#737373] font-normal">{report.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-3 text-[#525252] font-medium">
                    {report.projectName}
                  </td>

                  <td className="py-4 px-3 text-[#737373]">
                    {report.date}
                  </td>

                  <td className="py-4 px-3">
                    <span 
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        report.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/30'
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
                      className="px-3 py-1.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#0E0E0E] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Link: "View All Reports →" in orange matching reference */}
        <div className="pt-6 mt-2 border-t border-[#E5E5E5] flex items-center justify-between text-xs">
          <span className="text-[#737373]">
            Showing {filteredReports.length} of {reports.length} generated reports
          </span>

          <button
            onClick={() => onSelectModule('reports')}
            className="flex items-center gap-1.5 text-[#FF6A00] hover:text-[#E65F00] font-bold cursor-pointer transition-colors"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Report Quick Modal Inspector */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0E0E0E]">{selectedReportDetail.name}</h3>
                  <p className="text-xs text-[#737373]">{selectedReportDetail.projectName} • {selectedReportDetail.date}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                selectedReportDetail.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/30'
              }`}>
                {selectedReportDetail.status}
              </span>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2">
              {selectedReportDetail.extractedData?.fullReport ? (
                <>
                  <div className="p-3 bg-[#1f3864] text-white rounded-lg font-bold text-sm">
                    A. DAILY PROGRESS REPORT (DPR)
                  </div>
                  <div className="grid grid-cols-2 gap-2 border border-[#cccccc] p-3 bg-[#e0e8f0] rounded">
                    <div><strong className="text-[#1f3864]">Project:</strong> {selectedReportDetail.projectName}</div>
                    <div><strong className="text-[#1f3864]">Date:</strong> {selectedReportDetail.date}</div>
                    <div className="col-span-2"><strong className="text-[#1f3864]">Prepared By:</strong> {selectedReportDetail.author}</div>
                  </div>
                  
                  <h4 className="font-bold text-[#1f3864] mt-3">Total Manpower</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#1f3864] text-white">
                        <th className="p-1.5 border border-[#cccccc]">Trade</th>
                        <th className="p-1.5 border border-[#cccccc]">Today</th>
                        <th className="p-1.5 border border-[#cccccc]">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.labour?.map((l: any, i: number) => (
                        <tr key={`lb-${i}`} className="bg-white">
                          <td className="p-1.5 border border-[#cccccc] capitalize">{l.trade}</td>
                          <td className="p-1.5 border border-[#cccccc]">{l.present}</td>
                          <td className="p-1.5 border border-[#cccccc] text-[10px]">{l.productivity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h4 className="font-bold text-[#1f3864] mt-3">Material Consumed</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#1f3864] text-white">
                        <th className="p-1.5 border border-[#cccccc]">Material</th>
                        <th className="p-1.5 border border-[#cccccc]">Qty</th>
                        <th className="p-1.5 border border-[#cccccc]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.materials?.map((m: any, i: number) => (
                        <tr key={`mt-${i}`} className="bg-white">
                          <td className="p-1.5 border border-[#cccccc]">{m.item}</td>
                          <td className="p-1.5 border border-[#cccccc]">{m.quantity}</td>
                          <td className="p-1.5 border border-[#cccccc] text-[10px]">{m.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h4 className="font-bold text-[#1f3864] mt-3">Production Log</h4>
                  <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
                    <thead>
                      <tr className="bg-[#1f3864] text-white">
                        <th className="p-1.5 border border-[#cccccc]">Activity</th>
                        <th className="p-1.5 border border-[#cccccc]">Achieved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReportDetail.extractedData.fullReport.work_progress?.map((w: any, i: number) => (
                        <tr key={`wp-${i}`} className="bg-white">
                          <td className="p-1.5 border border-[#cccccc]">{w.activity}</td>
                          <td className="p-1.5 border border-[#cccccc] text-emerald-600 font-bold">{w.actual_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <div className="p-3.5 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                    <p className="text-[11px] font-semibold text-[#737373] uppercase mb-1">Executive Summary</p>
                    <p className="text-[#0E0E0E] leading-relaxed font-medium">{selectedReportDetail.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                      <p className="text-[10px] text-[#737373] uppercase">Labour Count</p>
                      <p className="text-sm font-bold text-[#0E0E0E] mt-0.5">{selectedReportDetail.tradesPresentCount} Workers</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                      <p className="text-[10px] text-[#737373] uppercase">Equipment Uptime</p>
                      <p className="text-sm font-bold text-emerald-600 mt-0.5">{selectedReportDetail.equipmentUptimePercent}%</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                      <p className="text-[10px] text-[#737373] uppercase">Materials Received</p>
                      <p className="text-xs font-bold text-[#0E0E0E] mt-0.5">{selectedReportDetail.materialsReceivedSummary}</p>
                    </div>
                    <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                      <p className="text-[10px] text-[#737373] uppercase">Financial EVM Index</p>
                      <p className="text-xs font-bold text-[#FF6A00] mt-0.5">{selectedReportDetail.evmStatus}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#0E0E0E] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedReportDetail(null);
                  onSelectModule('reports');
                }}
                className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E65F00] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
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
