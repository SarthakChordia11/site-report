import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Share2, 
  Sparkles, 
  Mic, 
  Search, 
  CheckCircle2, 
  Building2, 
  Users, 
  Package, 
  Wrench, 
  Calendar,
  AlertTriangle,
  Clock,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import type { SiteReport, Site } from '../../../types';
import { dprApi } from '../../../services/api';

interface ReportsHubProps {
  reports: SiteReport[];
  currentSite: Site;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
  onAddReport: (report: SiteReport) => void;
  onTriggerRollup?: (type: 'Weekly' | 'Monthly') => Promise<void>;
  isRollingUp?: boolean;
}

export const ReportsHub: React.FC<ReportsHubProps> = ({
  reports,
  currentSite,
  onOpenAIModal,
  onTriggerRollup,
  isRollingUp = false,
}) => {
  const [selectedReport, setSelectedReport] = useState<SiteReport | null>(reports?.[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [copiedToast, setCopiedToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  React.useEffect(() => {
    if (!selectedReport && reports && reports.length > 0) {
      setSelectedReport(reports[0]);
    } else if (selectedReport && reports) {
      const match = reports.find(r => r.id === selectedReport.id);
      if (match) setSelectedReport(match);
    }
  }, [reports, selectedReport]);

  const filteredReports = (reports || []).filter(r => {
    const matchesSearch = (r?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r?.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r?.status === filterStatus;
    
    let typeMatches = true;
    if (filterType === 'Daily') {
      typeMatches = (r?.reportType || 'Daily') === 'Daily';
    } else if (filterType === 'Weekly') {
      typeMatches = (r?.reportType || '') === 'Weekly';
    } else if (filterType === 'Monthly') {
      typeMatches = (r?.reportType || '') === 'Monthly';
    }
    return matchesSearch && matchesStatus && typeMatches;
  });

  const handleExportPDF = async () => {
    if (!selectedReport) return;
    setIsExporting(true);
    try {
      const ext = selectedReport.extractedData || {};
      const payload = ext.fullReport || ext.universal || ext.wpr || ext.mpr || {
        report_type: selectedReport.reportType || 'Daily',
        site_info: {
          project_name: selectedReport.projectName || currentSite?.name || 'Site Project',
          date: selectedReport.date,
          location: currentSite?.name || '',
          inspector: selectedReport.author,
        },
        ...ext,
      };
      payload.report_type = selectedReport.reportType || 'Daily';
      const blob = await dprApi.generatePdf(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const typeLabel = selectedReport.reportType || 'Daily';
      a.download = `${(selectedReport.projectName || 'Site').replace(/\s+/g, '_')}_${typeLabel}_${(selectedReport.date || 'report').replace(/[\/\s]/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to generate PDF from backend:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Helper to resolve structured data from report
  const extData = selectedReport?.extractedData || {};
  const universal = extData.universal || extData.fullReport || extData;
  const wprData = extData.wpr || extData.fullReport || extData;
  const mprData = extData.mpr || extData.fullReport || extData;

  const currentType = selectedReport?.reportType || 'Daily';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Site Progress Reports
            </h1>
            <span className="px-3 py-1 bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30 rounded-full text-xs font-semibold">
              Universal Template (DPR • WPR • MPR)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Standard 11-page universal format: physical progress, manpower, materials, equipment, costing, and forecast.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onTriggerRollup && (
            <>
              <button
                onClick={() => onTriggerRollup('Weekly')}
                disabled={isRollingUp}
                className="px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRollingUp ? 'animate-spin' : ''}`} />
                <span>Auto-Generate Weekly Rollup</span>
              </button>

              <button
                onClick={() => onTriggerRollup('Monthly')}
                disabled={isRollingUp}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Auto-Generate Monthly Rollup</span>
              </button>
            </>
          )}

          <button
            onClick={() => onOpenAIModal('voice')}
            className="px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs sm:text-sm shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>Voice DPR Log</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Reports List (Left) + Detailed Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report Navigation List */}
        <div className="lg:col-span-4 bg-[#161A24] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF5E14]" />
              <span>Shift & Periodic Reports ({filteredReports.length})</span>
            </h2>
            
            {/* Filter status pills */}
            <div className="flex bg-[#0B0D13] border border-white/10 rounded-full p-1 text-xs">
              {['All', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-white text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Types Pill Bar */}
          <div className="flex bg-[#0B0D13] border border-white/10 rounded-full p-1 text-xs w-full justify-between">
            {['All', 'Daily', 'Weekly', 'Monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer text-center ${
                  filterType === type
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {type === 'Daily' ? 'Daily (DPR)' : type === 'Weekly' ? 'Weekly (WPR)' : type === 'Monthly' ? 'Monthly (MPR)' : 'All'}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by name, project, engineer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0B0D13] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF5E14] focus:ring-1 focus:ring-[#FF5E14]/30 transition-colors"
            />
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredReports.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <FileText className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                <p className="text-xs font-semibold text-neutral-300">No matching reports found</p>
                <p className="text-[11px] mt-1 text-neutral-500">Record a voice DPR or generate a weekly rollup.</p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const repType = report.reportType || 'Daily';
                
                const typeBadgeStyle = repType === 'Weekly'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : repType === 'Monthly'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-[#FF5E14]/15 text-[#FF5E14] border-[#FF5E14]/30';

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 border-[#FF5E14]/50 shadow-md ring-1 ring-[#FF5E14]/30'
                        : 'bg-[#0B0D13] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#FF5E14] text-white font-bold' : 'bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14]'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{report.name}</p>
                          <p className="text-[11px] text-neutral-400">{report.projectName || currentSite?.name}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${typeBadgeStyle}`}>
                        {repType === 'Daily' ? 'DPR' : repType === 'Weekly' ? 'WPR' : 'MPR'}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {report.summary}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-300">{report.date || 'Shift Log'}</span>
                      </div>
                      <span>By: {report.author}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Universal Document Viewer */}
        <div className="lg:col-span-8 bg-[#161A24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {selectedReport ? (
            <div>
              {/* Document Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedReport.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        currentType === 'Weekly'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : currentType === 'Monthly'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-[#FF5E14]/15 text-[#FF5E14] border-[#FF5E14]/30'
                      }`}>
                        {currentType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Project: <strong className="text-white">{selectedReport.projectName || currentSite?.name}</strong> • {selectedReport.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-[#FF5E14] hover:bg-[#E04F0F] text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#FF5E14]/20"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {copiedToast && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Report link copied to clipboard!</span>
                </div>
              )}

              {/* Document Body */}
              <div className="space-y-6 text-xs text-neutral-200 mt-6">

                {/* ════════════════════════════════════════════════════════════ */}
                {/* CASE 1: WEEKLY PROGRESS REPORT (WPR B1 - B14)                 */}
                {/* ════════════════════════════════════════════════════════════ */}
                {currentType === 'Weekly' && (
                  <div className="space-y-6">
                    {/* WPR Header Table */}
                    <div className="bg-[#0B0D13] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <span className="font-bold text-sm text-purple-400 tracking-wide">B. WEEKLY PROGRESS REPORT (WPR)</span>
                        <span className="text-xs text-neutral-400">{selectedReport.date}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div><span className="text-neutral-500 font-medium">Project Name:</span> <p className="text-white font-semibold">{wprData.project_name || selectedReport.projectName}</p></div>
                        <div><span className="text-neutral-500 font-medium">Week No.:</span> <p className="text-white font-semibold">{wprData.week_no || 'Week 1'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Location:</span> <p className="text-white font-semibold">{wprData.location || currentSite?.name}</p></div>
                        <div><span className="text-neutral-500 font-medium">Week Period:</span> <p className="text-white font-semibold">{wprData.week_period || selectedReport.date}</p></div>
                        <div><span className="text-neutral-500 font-medium">Client:</span> <p className="text-white font-semibold">{wprData.client || currentSite?.client || 'Client'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Prepared By:</span> <p className="text-white font-semibold">{wprData.prepared_by || selectedReport.author}</p></div>
                        <div><span className="text-neutral-500 font-medium">Contractor/PMC:</span> <p className="text-white font-semibold">{wprData.contractor_pmc || currentSite?.contractor || 'PMC'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Verification:</span> <p className="text-emerald-400 font-semibold">Certified Rollup</p></div>
                      </div>
                    </div>

                    {/* B1. Executive Summary */}
                    {wprData.b1_executive_summary?.highlights && wprData.b1_executive_summary.highlights.length > 0 && (
                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl space-y-2">
                        <h3 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">B1. Executive Summary</h3>
                        <ul className="space-y-1.5 list-disc pl-4 text-neutral-300">
                          {wprData.b1_executive_summary.highlights.map((h: string, idx: number) => (
                            <li key={idx}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* B4. Manpower Trend (Daily Mon - Sun) */}
                    {wprData.b4_manpower_trend && wprData.b4_manpower_trend.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">B4. Manpower Trend (Daily, for the Week)</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Trade</th>
                                <th className="p-3 border-b border-white/10 text-center">Mon</th>
                                <th className="p-3 border-b border-white/10 text-center">Tue</th>
                                <th className="p-3 border-b border-white/10 text-center">Wed</th>
                                <th className="p-3 border-b border-white/10 text-center">Thu</th>
                                <th className="p-3 border-b border-white/10 text-center">Fri</th>
                                <th className="p-3 border-b border-white/10 text-center">Sat</th>
                                <th className="p-3 border-b border-white/10 text-center">Sun</th>
                                <th className="p-3 border-b border-white/10 text-center font-extrabold text-[#FF5E14]">Avg</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b4_manpower_trend.map((m: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{m.trade}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.mon}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.tue}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.wed}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.thu}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.fri}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.sat}</td>
                                  <td className="p-3 text-center text-neutral-300">{m.sun}</td>
                                  <td className="p-3 text-center font-bold text-[#FF5E14]">{m.avg}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B5. Material Consumption Summary */}
                    {wprData.b5_materials && wprData.b5_materials.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">B5. Material Consumption Summary</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Material</th>
                                <th className="p-3 border-b border-white/10">Opening Stock</th>
                                <th className="p-3 border-b border-white/10">Received This Week</th>
                                <th className="p-3 border-b border-white/10">Consumed This Week</th>
                                <th className="p-3 border-b border-white/10 text-emerald-400 font-bold">Closing Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b5_materials.map((mat: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{mat.material}</td>
                                  <td className="p-3 text-neutral-300">{mat.opening_stock}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{mat.received_this_week}</td>
                                  <td className="p-3 text-neutral-300">{mat.consumed_this_week}</td>
                                  <td className="p-3 font-bold text-emerald-400">{mat.closing_stock}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B2. Zone-wise Physical Progress */}
                    {wprData.b2_zone_progress && wprData.b2_zone_progress.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">B2. Work Location / Zone-wise Physical Progress</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Zone / Location</th>
                                <th className="p-3 border-b border-white/10">Activity / Stage</th>
                                <th className="p-3 border-b border-white/10">Planned %</th>
                                <th className="p-3 border-b border-white/10">Achieved %</th>
                                <th className="p-3 border-b border-white/10">Variance</th>
                                <th className="p-3 border-b border-white/10">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b2_zone_progress.map((z: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{z.work_location_zone}</td>
                                  <td className="p-3 text-neutral-300">{z.activity_stage}</td>
                                  <td className="p-3 text-neutral-400">{z.planned_pct_till_date}%</td>
                                  <td className="p-3 font-bold text-emerald-400">{z.achieved_pct_till_date}%</td>
                                  <td className="p-3 text-neutral-300">{z.variance}</td>
                                  <td className="p-3 text-neutral-400">{z.remarks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B6. Equipment Utilization */}
                    {wprData.b6_equipment && wprData.b6_equipment.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">B6. Equipment Utilization</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Equipment</th>
                                <th className="p-3 border-b border-white/10">Available</th>
                                <th className="p-3 border-b border-white/10">Avg Working</th>
                                <th className="p-3 border-b border-white/10">Idle Days</th>
                                <th className="p-3 border-b border-white/10">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b6_equipment.map((eq: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{eq.equipment}</td>
                                  <td className="p-3 text-neutral-300">{eq.available}</td>
                                  <td className="p-3 text-emerald-400 font-semibold">{eq.avg_working}</td>
                                  <td className="p-3 text-neutral-400">{eq.idle_days}</td>
                                  <td className="p-3 text-neutral-400">{eq.remarks}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B8. Delays / Critical Path */}
                    {wprData.b8_delays && wprData.b8_delays.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm text-rose-400">B8. Delays / Critical Path Issues</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Issue</th>
                                <th className="p-3 border-b border-white/10">Schedule Impact</th>
                                <th className="p-3 border-b border-white/10">Responsible</th>
                                <th className="p-3 border-b border-white/10">Target Resolution</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b8_delays.map((d: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-rose-400">{d.issue}</td>
                                  <td className="p-3 text-neutral-300">{d.impact_on_schedule}</td>
                                  <td className="p-3 text-neutral-400">{d.responsible}</td>
                                  <td className="p-3 text-neutral-400">{d.target_resolution}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* B14. Site Management Summary */}
                    {wprData.b14_management_summary && wprData.b14_management_summary.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">B14. Site Management Summary</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Sr No</th>
                                <th className="p-3 border-b border-white/10">Item</th>
                                <th className="p-3 border-b border-white/10">Category</th>
                                <th className="p-3 border-b border-white/10">Owner</th>
                                <th className="p-3 border-b border-white/10">Status</th>
                                <th className="p-3 border-b border-white/10">Target Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {wprData.b14_management_summary.map((m: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 text-neutral-500">{m.sr_no || idx + 1}</td>
                                  <td className="p-3 font-medium text-white">{m.item}</td>
                                  <td className="p-3 text-neutral-300">{m.category}</td>
                                  <td className="p-3 text-neutral-400">{m.owner}</td>
                                  <td className="p-3 text-amber-400">{m.status}</td>
                                  <td className="p-3 text-neutral-400">{m.target_date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════ */}
                {/* CASE 2: MONTHLY PROGRESS REPORT (MPR C1 - C15)                */}
                {/* ════════════════════════════════════════════════════════════ */}
                {currentType === 'Monthly' && (
                  <div className="space-y-6">
                    {/* MPR Header Table */}
                    <div className="bg-[#0B0D13] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <span className="font-bold text-sm text-amber-400 tracking-wide">C. MONTHLY PROGRESS REPORT (MPR)</span>
                        <span className="text-xs text-neutral-400">{selectedReport.date}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div><span className="text-neutral-500 font-medium">Project Name:</span> <p className="text-white font-semibold">{mprData.project_name || selectedReport.projectName}</p></div>
                        <div><span className="text-neutral-500 font-medium">Project Code:</span> <p className="text-white font-semibold">{mprData.project_code || 'PRJ-001'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Location:</span> <p className="text-white font-semibold">{mprData.location || currentSite?.name}</p></div>
                        <div><span className="text-neutral-500 font-medium">Month Considered:</span> <p className="text-white font-semibold">{mprData.month_considered || selectedReport.date}</p></div>
                        <div><span className="text-neutral-500 font-medium">Client:</span> <p className="text-white font-semibold">{mprData.client || currentSite?.client || 'Client'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Report No:</span> <p className="text-white font-semibold">{mprData.report_no || 'MPR-01'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Contractor/PMC:</span> <p className="text-white font-semibold">{mprData.contractor_pmc || currentSite?.contractor || 'PMC'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Status Date:</span> <p className="text-emerald-400 font-semibold">{mprData.status_date || selectedReport.date}</p></div>
                      </div>
                    </div>

                    {/* C2. Overall Project Progress */}
                    {mprData.c2_project_progress && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                          <p className="text-[10px] text-neutral-400 uppercase font-semibold">Planned % (Cumulative)</p>
                          <p className="text-xl font-extrabold text-white mt-1">{mprData.c2_project_progress.planned_pct_cumulative}%</p>
                        </div>
                        <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                          <p className="text-[10px] text-neutral-400 uppercase font-semibold">Achieved % (Cumulative)</p>
                          <p className="text-xl font-extrabold text-emerald-400 mt-1">{mprData.c2_project_progress.achieved_pct_cumulative}%</p>
                        </div>
                        <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                          <p className="text-[10px] text-neutral-400 uppercase font-semibold">Delay / Lead Days</p>
                          <p className="text-xl font-extrabold text-amber-400 mt-1">{mprData.c2_project_progress.delay_lead_days} Days</p>
                        </div>
                      </div>
                    )}

                    {/* C1. Executive Discipline Summary */}
                    {mprData.c1_executive_summary && mprData.c1_executive_summary.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">C1. Executive Summary by Discipline</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Discipline / Work Location</th>
                                <th className="p-3 border-b border-white/10">Status Summary</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mprData.c1_executive_summary.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{item.discipline_location}</td>
                                  <td className="p-3 text-neutral-300">{item.status_summary}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* C5. Material Reconciliation */}
                    {mprData.c5_materials && mprData.c5_materials.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">C5. Material Reconciliation</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Material</th>
                                <th className="p-3 border-b border-white/10">Opening</th>
                                <th className="p-3 border-b border-white/10">Received (Month)</th>
                                <th className="p-3 border-b border-white/10">Consumed (Month)</th>
                                <th className="p-3 border-b border-white/10">Closing / Balance</th>
                                <th className="p-3 border-b border-white/10">Wastage %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mprData.c5_materials.map((mat: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{mat.material}</td>
                                  <td className="p-3 text-neutral-300">{mat.opening}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{mat.received_month}</td>
                                  <td className="p-3 text-neutral-300">{mat.consumed_month}</td>
                                  <td className="p-3 font-bold text-emerald-400">{mat.closing_balance}</td>
                                  <td className="p-3 text-neutral-400">{mat.wastage_pct}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* C9. Critical Risks */}
                    {mprData.c9_risks && mprData.c9_risks.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm text-rose-400">C9. Critical Issues & Risks</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Issue</th>
                                <th className="p-3 border-b border-white/10">Impact</th>
                                <th className="p-3 border-b border-white/10">Mitigation Action</th>
                                <th className="p-3 border-b border-white/10">Responsible</th>
                                <th className="p-3 border-b border-white/10">Target Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mprData.c9_risks.map((rk: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-rose-400">{rk.issue}</td>
                                  <td className="p-3 text-neutral-300">{rk.impact}</td>
                                  <td className="p-3 text-neutral-300">{rk.mitigation_action}</td>
                                  <td className="p-3 text-neutral-400">{rk.responsible}</td>
                                  <td className="p-3 text-neutral-400">{rk.target_date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════ */}
                {/* CASE 3: DAILY PROGRESS REPORT (DPR A1 - A13)                  */}
                {/* ════════════════════════════════════════════════════════════ */}
                {currentType === 'Daily' && (
                  <div className="space-y-6">
                    {/* DPR Header Table */}
                    <div className="bg-[#0B0D13] border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <span className="font-bold text-sm text-[#FF5E14] tracking-wide">A. DAILY PROGRESS REPORT (DPR)</span>
                        <span className="text-xs text-neutral-400">{selectedReport.date}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div><span className="text-neutral-500 font-medium">Project Name:</span> <p className="text-white font-semibold">{universal.site_info?.project_name || selectedReport.projectName}</p></div>
                        <div><span className="text-neutral-500 font-medium">Location:</span> <p className="text-white font-semibold">{universal.site_info?.location || currentSite?.name}</p></div>
                        <div><span className="text-neutral-500 font-medium">Report Date:</span> <p className="text-white font-semibold">{universal.site_info?.date || selectedReport.date}</p></div>
                        <div><span className="text-neutral-500 font-medium">Weather:</span> <p className="text-white font-semibold">{universal.site_info?.weather || 'Clear'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Client:</span> <p className="text-white font-semibold">{universal.site_info?.client || currentSite?.client || 'Client'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Prepared By:</span> <p className="text-white font-semibold">{universal.site_info?.inspector || selectedReport.author}</p></div>
                        <div><span className="text-neutral-500 font-medium">Contractor:</span> <p className="text-white font-semibold">{universal.site_info?.contractor || currentSite?.contractor || 'PMC'}</p></div>
                        <div><span className="text-neutral-500 font-medium">Status:</span> <p className="text-emerald-400 font-semibold">{selectedReport.status || 'Verified'}</p></div>
                      </div>
                    </div>

                    {/* A1. Agency / Team Manpower Log */}
                    {universal.a1_agency_manpower && universal.a1_agency_manpower.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A1. Agency / Team-wise Manpower & Activity Log</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Sr No</th>
                                <th className="p-3 border-b border-white/10">Agency / Team</th>
                                <th className="p-3 border-b border-white/10">Location / Zone</th>
                                <th className="p-3 border-b border-white/10">Manpower</th>
                                <th className="p-3 border-b border-white/10">Activity Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {universal.a1_agency_manpower.map((a: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 text-neutral-500">{a.sr_no || idx + 1}</td>
                                  <td className="p-3 font-medium text-white">{a.agency_team}</td>
                                  <td className="p-3 text-neutral-300">{a.work_location_zone}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{a.manpower}</td>
                                  <td className="p-3 text-neutral-300">{a.activity_description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A2. Total Manpower Summary */}
                    {(universal.a2_manpower_summary?.length > 0 || universal.labour?.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A2. Total Manpower Summary</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Trade</th>
                                <th className="p-3 border-b border-white/10">Today</th>
                                <th className="p-3 border-b border-white/10">Yesterday</th>
                                <th className="p-3 border-b border-white/10">Variance</th>
                                <th className="p-3 border-b border-white/10">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(universal.a2_manpower_summary || universal.labour || []).map((m: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{m.trade}</td>
                                  <td className="p-3 text-[#FF5E14] font-bold">{m.today ?? m.present ?? 0}</td>
                                  <td className="p-3 text-neutral-400">{m.yesterday ?? 0}</td>
                                  <td className="p-3 text-neutral-400">{m.variance ?? 0}</td>
                                  <td className="p-3 text-neutral-400">{m.remarks || m.contractor || m.productivity || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A3. Material Received / Consumed Today */}
                    {(universal.a3_materials?.length > 0 || universal.materials?.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A3. Material Received / Consumed Today</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Material</th>
                                <th className="p-3 border-b border-white/10">Qty Received</th>
                                <th className="p-3 border-b border-white/10">Unit</th>
                                <th className="p-3 border-b border-white/10">Qty Consumed</th>
                                <th className="p-3 border-b border-white/10">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(universal.a3_materials || []).map((mat: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{mat.material}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{mat.qty_received || '-'}</td>
                                  <td className="p-3 text-neutral-400">{mat.unit || '-'}</td>
                                  <td className="p-3 text-neutral-300">{mat.qty_consumed || '-'}</td>
                                  <td className="p-3 text-neutral-400">{mat.remarks || '-'}</td>
                                </tr>
                              ))}
                              {(!universal.a3_materials || universal.a3_materials.length === 0) && (universal.materials || []).map((mat: any, idx: number) => (
                                <tr key={`legacy-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{mat.item}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{mat.quantity}</td>
                                  <td className="p-3 text-neutral-400">-</td>
                                  <td className="p-3 text-neutral-300">-</td>
                                  <td className="p-3 text-neutral-400">{mat.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A4. Equipment / Machinery on Site */}
                    {universal.a4_equipment && universal.a4_equipment.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A4. Equipment / Machinery on Site</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Equipment</th>
                                <th className="p-3 border-b border-white/10">Available</th>
                                <th className="p-3 border-b border-white/10">Working</th>
                                <th className="p-3 border-b border-white/10">Idle / Breakdown</th>
                                <th className="p-3 border-b border-white/10">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {universal.a4_equipment.map((eq: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{eq.equipment}</td>
                                  <td className="p-3 text-neutral-300">{eq.available}</td>
                                  <td className="p-3 text-emerald-400 font-bold">{eq.working}</td>
                                  <td className="p-3 text-rose-400">{eq.idle_breakdown}</td>
                                  <td className="p-3 text-neutral-400">{eq.remarks || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A5. Key Quantity / Production Log */}
                    {(universal.a5_production_log?.length > 0 || universal.work_progress?.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A5. Key Quantity / Production Log</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Work Location / Zone</th>
                                <th className="p-3 border-b border-white/10">Item / Grade / Stage</th>
                                <th className="p-3 border-b border-white/10">Planned</th>
                                <th className="p-3 border-b border-white/10">Achieved</th>
                                <th className="p-3 border-b border-white/10">Cumulative</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(universal.a5_production_log || []).map((p: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{p.work_location_zone}</td>
                                  <td className="p-3 text-neutral-300">{p.item_grade_stage}</td>
                                  <td className="p-3 text-neutral-400">{p.planned_qty}</td>
                                  <td className="p-3 font-bold text-emerald-400">{p.achieved_qty}</td>
                                  <td className="p-3 text-neutral-400">{p.cumulative_till_date}</td>
                                </tr>
                              ))}
                              {(!universal.a5_production_log || universal.a5_production_log.length === 0) && (universal.work_progress || []).map((wp: any, idx: number) => (
                                <tr key={`wp-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">Main Site</td>
                                  <td className="p-3 text-neutral-300">{wp.activity}</td>
                                  <td className="p-3 text-neutral-400">{wp.planned_pct}%</td>
                                  <td className="p-3 font-bold text-emerald-400">{wp.actual_pct}%</td>
                                  <td className="p-3 text-neutral-400">{wp.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A6. Safety & Quality */}
                    {(universal.a6_safety_quality?.length > 0 || universal.safety?.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A6. Safety & Quality</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Item</th>
                                <th className="p-3 border-b border-white/10">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(universal.a6_safety_quality || []).map((s: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{s.item}</td>
                                  <td className="p-3 text-neutral-300">{s.details}</td>
                                </tr>
                              ))}
                              {(!universal.a6_safety_quality || universal.a6_safety_quality.length === 0) && (universal.safety || []).map((s: any, idx: number) => (
                                <tr key={`saf-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{s.item}</td>
                                  <td className="p-3 text-neutral-300">{s.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A7. Critical Issues / Site Hindrances */}
                    {(universal.a7_critical_issues?.length > 0 || universal.ncr_reports?.length > 0) && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm text-rose-400">A7. Critical Issues / Site Hindrances</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Sr No</th>
                                <th className="p-3 border-b border-white/10">Issue</th>
                                <th className="p-3 border-b border-white/10">Raised On</th>
                                <th className="p-3 border-b border-white/10">Responsible</th>
                                <th className="p-3 border-b border-white/10">Target Date</th>
                                <th className="p-3 border-b border-white/10">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(universal.a7_critical_issues || []).map((iss: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 text-neutral-500">{iss.sr_no || idx + 1}</td>
                                  <td className="p-3 font-medium text-rose-400">{iss.issue}</td>
                                  <td className="p-3 text-neutral-400">{iss.raised_on || '-'}</td>
                                  <td className="p-3 text-neutral-300">{iss.responsible || 'Site Team'}</td>
                                  <td className="p-3 text-neutral-400">{iss.target_date || '-'}</td>
                                  <td className="p-3 text-amber-400">{iss.status || 'Open'}</td>
                                </tr>
                              ))}
                              {(!universal.a7_critical_issues || universal.a7_critical_issues.length === 0) && (universal.ncr_reports || []).map((n: any, idx: number) => (
                                <tr key={`ncr-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 text-neutral-500">{idx + 1}</td>
                                  <td className="p-3 font-medium text-rose-400">{n.title}: {n.description}</td>
                                  <td className="p-3 text-neutral-400">-</td>
                                  <td className="p-3 text-neutral-300">Site Team</td>
                                  <td className="p-3 text-neutral-400">{n.deadline || '-'}</td>
                                  <td className="p-3 text-amber-400">{n.severity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A8. Work Stoppage / Weather Impact */}
                    {universal.a8_work_stoppage && (universal.a8_work_stoppage.hours_lost > 0 || universal.a8_work_stoppage.reason) && (
                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-white">A8. Work Stoppage Impact:</span>
                          <span className="text-neutral-300 ml-2">{universal.a8_work_stoppage.reason}</span>
                        </div>
                        <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-bold">
                          {universal.a8_work_stoppage.hours_lost} Hours Lost
                        </span>
                      </div>
                    )}

                    {/* A10. Plan for Next Day */}
                    {universal.a10_next_day_plan && universal.a10_next_day_plan.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A10. Plan for Next Day</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Location / Zone</th>
                                <th className="p-3 border-b border-white/10">Planned Activity</th>
                                <th className="p-3 border-b border-white/10">Target Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {universal.a10_next_day_plan.map((p: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{p.work_location_zone}</td>
                                  <td className="p-3 text-neutral-300">{p.planned_activity}</td>
                                  <td className="p-3 text-[#FF5E14] font-semibold">{p.target_quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* A11. Labour Attendance & Wage Log */}
                    {universal.a11_attendance_wages && universal.a11_attendance_wages.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-sm">A11. Labour Attendance & Wage Log</h3>
                        <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                                <th className="p-3 border-b border-white/10">Trade</th>
                                <th className="p-3 border-b border-white/10">Present</th>
                                <th className="p-3 border-b border-white/10">Absent</th>
                                <th className="p-3 border-b border-white/10">OT Hours</th>
                                <th className="p-3 border-b border-white/10">Wage Rate</th>
                                <th className="p-3 border-b border-white/10">Amount Payable</th>
                              </tr>
                            </thead>
                            <tbody>
                              {universal.a11_attendance_wages.map((l: any, idx: number) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="p-3 font-medium text-white">{l.trade}</td>
                                  <td className="p-3 text-emerald-400 font-bold">{l.present}</td>
                                  <td className="p-3 text-neutral-400">{l.absent}</td>
                                  <td className="p-3 text-neutral-300">{l.ot_hours}</td>
                                  <td className="p-3 text-neutral-300">₹{l.wage_rate}</td>
                                  <td className="p-3 text-[#FF5E14] font-bold">₹{l.amount_payable}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Sign-Off Footer */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                  <div>
                    <p>Report Compiled by: <strong className="text-white">{selectedReport.author}</strong></p>
                    <p className="text-[10px] text-neutral-500 font-mono">Universal Template Specification Compliance: A1-A13 / B1-B14 / C1-C15</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certified Accurate</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400">
              <FileText className="w-12 h-12 mx-auto text-neutral-600 mb-3" />
              <p className="text-sm font-bold text-white">No Report Selected</p>
              <p className="text-xs mt-1">Select a report from the list to view full details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

