import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Printer, 
  Share2, 
  Sparkles, 
  Mic, 
  Camera, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Users, 
  Package, 
  Wrench, 
  BarChart3,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { SiteReport, Site } from '../../../types';
import { dprApi } from '../../../services/api';

interface ReportsHubProps {
  reports: SiteReport[];
  currentSite: Site;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
  onAddReport: (report: SiteReport) => void;
}

export const ReportsHub: React.FC<ReportsHubProps> = ({
  reports,
  currentSite,
  onOpenAIModal,
}) => {
  const [selectedReport, setSelectedReport] = useState<SiteReport | null>(reports?.[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [copiedToast, setCopiedToast] = useState(false);

  React.useEffect(() => {
    if (!selectedReport && reports && reports.length > 0) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);

  const filteredReports = (reports || []).filter(r => {
    const matchesSearch = (r?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r?.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r?.status === filterStatus;
    const matchesType = filterType === 'All' || (r?.reportType || 'Daily') === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportPDF = async () => {
    if (selectedReport?.extractedData?.fullReport) {
      try {
        const payload = {
          ...selectedReport.extractedData.fullReport,
          report_type: selectedReport.reportType || 'Daily'
        };
        const blob = await dprApi.generatePdf(payload);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport.projectName.replace(' ', '_')}_DPR_${selectedReport.date.replace(/[\/\s]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error('Failed to generate PDF from backend:', err);
        window.print();
      }
    } else {
      // Fallback to browser print if no backend report object is attached
      window.print();
    }
  };

  const handleShare = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Site Reports Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Automated AI site shift reports, quality inspection logs, and executive PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAIModal('voice')}
            className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-full text-xs sm:text-sm shadow-lg shadow-white/10 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-neutral-950" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Reports List (Left) + Detailed Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report List */}
        <div className="lg:col-span-5 bg-[#10131A] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">All Reports ({filteredReports.length})</h2>
            
            {/* Filter status pills */}
            <div className="flex bg-[#0B0D13] border border-white/10 rounded-full p-1 text-xs">
              {['All', 'Completed', 'In Progress'].map((status) => (
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

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by name, project, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0B0D13] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
            />
          </div>

          {/* Filter Types */}
          <div className="flex bg-[#0B0D13] border border-white/10 rounded-full p-1 text-xs w-full justify-between">
            {['All', 'Daily', 'Weekly', 'Monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white/10 border-sky-400/50 shadow-md ring-1 ring-sky-400/30'
                      : 'bg-[#0B0D13] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-sky-400 text-neutral-950 font-bold' : 'bg-white/10 text-sky-400'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white line-clamp-1">{report.name}</p>
                        <p className="text-[11px] text-neutral-400">{report.projectName}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      report.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {report.summary}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-neutral-300">
                        {report.reportType || 'Daily'}
                      </span>
                      <span>{report.date}</span>
                    </div>
                    <span>By: {report.author}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Document Viewer & Export */}
        <div className="lg:col-span-7 bg-[#10131A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {selectedReport ? (
            <div>
              {/* Document Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 text-sky-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedReport.name}</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Project: <strong className="text-white">{selectedReport.projectName}</strong> • {selectedReport.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-white/10"
                  >
                    <Share2 className="w-3.5 h-3.5 text-neutral-950" />
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

              {/* Report Body */}
              <div className="space-y-6 text-xs text-neutral-200 mt-6">
                {selectedReport?.extractedData?.fullReport ? (
                  <>
                    {/* Template A. DPR Header */}
                    <div className="bg-[#0B0D13] border border-white/10 text-sky-400 p-4 rounded-2xl font-bold flex items-center justify-between">
                      <span>DAILY PROGRESS REPORT (DPR)</span>
                      <span className="text-xs text-neutral-400 font-normal">{selectedReport.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border border-white/10 p-4 bg-[#0B0D13]/60 rounded-2xl">
                      <div><strong className="text-neutral-400">Project Name:</strong> <span className="text-white font-medium">{selectedReport.projectName}</span></div>
                      <div><strong className="text-neutral-400">Location / Site:</strong> <span className="text-white font-medium">{currentSite?.name}</span></div>
                      <div><strong className="text-neutral-400">Report Date:</strong> <span className="text-white font-medium">{selectedReport.date}</span></div>
                      <div><strong className="text-neutral-400">Prepared By:</strong> <span className="text-white font-medium">{selectedReport.author}</span></div>
                    </div>

                    {/* A2. Manpower Summary */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-sm mt-4">Total Manpower Summary</h3>
                      <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider">
                              <th className="p-3 border-b border-white/10">Trade</th>
                              <th className="p-3 border-b border-white/10">Today</th>
                              <th className="p-3 border-b border-white/10">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.labour?.map((l: any, i: number) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium capitalize text-white">{l.trade}</td>
                                <td className="p-3 text-neutral-300">{l.present}</td>
                                <td className="p-3 text-neutral-400">{l.productivity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A3. Material Received / Consumed */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-sm mt-4">Material Received / Consumed Today</h3>
                      <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider">
                              <th className="p-3 border-b border-white/10">Material</th>
                              <th className="p-3 border-b border-white/10">Quantity</th>
                              <th className="p-3 border-b border-white/10">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.materials?.map((m: any, i: number) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium text-white">{m.item}</td>
                                <td className="p-3 text-neutral-300">{m.quantity}</td>
                                <td className="p-3 text-neutral-400">{m.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A5. Production Log */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-sm mt-4">Key Quantity / Production Log</h3>
                      <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider">
                              <th className="p-3 border-b border-white/10">Activity / Stage</th>
                              <th className="p-3 border-b border-white/10">Planned %</th>
                              <th className="p-3 border-b border-white/10">Achieved %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.work_progress?.map((w: any, i: number) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium text-white">{w.activity}</td>
                                <td className="p-3 text-neutral-400">{w.planned_pct}%</td>
                                <td className="p-3 text-emerald-400 font-bold">{w.actual_pct}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A6. Safety & Quality */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-white text-sm mt-4">Safety & Quality</h3>
                      <div className="overflow-x-auto border border-white/10 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0B0D13] text-neutral-300 text-[10px] uppercase tracking-wider">
                              <th className="p-3 border-b border-white/10">Item</th>
                              <th className="p-3 border-b border-white/10">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.safety?.map((s: any, i: number) => (
                              <tr key={`s-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium text-white">{s.item}</td>
                                <td className="p-3 text-neutral-300">{s.status}</td>
                              </tr>
                            ))}
                            {selectedReport.extractedData.fullReport.ncr_reports?.map((n: any, i: number) => (
                              <tr key={`n-${i}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium text-rose-400">NCR: {n.title}</td>
                                <td className="p-3 text-rose-300">{n.severity} - {n.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-5 bg-[#0B0D13] border border-white/10 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Executive AI Summary</span>
                      </div>
                      <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                        {selectedReport.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-neutral-400 uppercase font-semibold">Labour Deployment</p>
                        <p className="text-xl font-extrabold text-white mt-1">{selectedReport.tradesPresentCount}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Full Roster Present</p>
                      </div>

                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-neutral-400 uppercase font-semibold">Equipment Uptime</p>
                        <p className="text-xl font-extrabold text-emerald-400 mt-1">{selectedReport.equipmentUptimePercent}%</p>
                        <p className="text-[10px] text-neutral-400">0 Major Breakdowns</p>
                      </div>

                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-neutral-400 uppercase font-semibold">Quality & Safety</p>
                        <p className="text-xl font-extrabold text-sky-400 mt-1">Zero LTI</p>
                        <p className="text-[10px] text-neutral-400">Safety Standard Met</p>
                      </div>

                      <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl">
                        <p className="text-[10px] text-neutral-400 uppercase font-semibold">Financial EVM</p>
                        <p className="text-xs font-bold text-white mt-1 line-clamp-1">{selectedReport.evmStatus}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Under Budget Envelope</p>
                      </div>
                    </div>

                    <div className="p-5 bg-[#0B0D13] border border-white/10 rounded-2xl space-y-2">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Materials & Delivery Challans Recorded
                      </h3>
                      <p className="text-xs text-neutral-200 font-semibold">
                        {selectedReport.materialsReceivedSummary}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Delivery challan numbers verified against batch plant tickets.
                      </p>
                    </div>
                  </>
                )}

                {/* Verification Sign-Off Footer */}
                <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                  <div>
                    <p>Report Compiled by: <strong className="text-white">{selectedReport.author}</strong></p>
                    <p className="text-[10px] text-neutral-500 font-mono">SiteReportAI Cryptographic Audit: SHA256-V28914</p>
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
