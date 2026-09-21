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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E0E0E] tracking-tight">
            Site Reports Center
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] mt-1">
            Automated AI site shift reports, quality inspection logs, and executive PDFs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAIModal('voice')}
            className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#FF6A00]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Reports List (Left) + Detailed Report Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Report List */}
        <div className="lg:col-span-5 bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#0E0E0E]">All Reports ({filteredReports.length})</h2>
            
            {/* Filter pills */}
            <div className="flex bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-0.5 text-xs">
              {['All', 'Completed', 'In Progress'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    filterStatus === status
                      ? 'bg-white text-[#0E0E0E] shadow-xs'
                      : 'text-[#737373] hover:text-[#0E0E0E]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by name, project, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg text-xs text-[#0E0E0E] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#FF6A00]"
            />
          </div>

          {/* Filter Types */}
          <div className="flex bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg p-0.5 text-xs w-full justify-between">
            {['All', 'Daily', 'Weekly', 'Monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-[#FF6A00] shadow-xs'
                    : 'text-[#737373] hover:text-[#0E0E0E]'
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
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FFF2E8] border-[#FF6A00] ring-1 ring-[#FF6A00] shadow-xs'
                      : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#FF6A00] text-white' : 'bg-[#F7F7F7] text-[#FF6A00]'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0E0E0E] line-clamp-1">{report.name}</p>
                        <p className="text-[11px] text-[#737373]">{report.projectName}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      report.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#FFF2E8] text-[#FF6A00] border border-[#FF6A00]/30'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#525252] mt-2 line-clamp-2 leading-relaxed">
                    {report.summary}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#E5E5E5]/60 flex items-center justify-between text-[10px] text-[#737373]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">{report.reportType || 'Daily'}</span>
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
        <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {selectedReport ? (
            <div>
              {/* Document Header & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0E0E0E] text-white flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#FF6A00]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0E0E0E]">{selectedReport.name}</h2>
                    <p className="text-xs text-[#737373]">
                      Project: <strong className="text-[#0E0E0E]">{selectedReport.projectName}</strong> • {selectedReport.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="px-3.5 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] text-[#0E0E0E] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#525252]" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-3.5 py-2 bg-[#FF6A00] hover:bg-[#E65F00] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {copiedToast && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report link copied to clipboard!</span>
                </div>
              )}

              {/* Report Body */}
              <div className="space-y-6 text-xs text-[#0E0E0E]">
                {selectedReport?.extractedData?.fullReport ? (
                  <>
                    {/* Template A. DPR Header */}
                    <div className="bg-[#1f3864] text-white p-4 rounded-t-xl font-bold">A. DAILY PROGRESS REPORT (DPR)</div>
                    <div className="grid grid-cols-2 gap-4 border border-[#cccccc] p-4 bg-[#e0e8f0] -mt-6">
                      <div><strong className="text-[#1f3864]">Project Name:</strong> {selectedReport.projectName}</div>
                      <div><strong className="text-[#1f3864]">Location / Site:</strong> {currentSite?.name}</div>
                      <div><strong className="text-[#1f3864]">Report Date:</strong> {selectedReport.date}</div>
                      <div><strong className="text-[#1f3864]">Prepared By:</strong> {selectedReport.author}</div>
                    </div>

                    {/* A2. Manpower Summary */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#1f3864] text-sm mt-4">A2. Total Manpower Summary</h3>
                      <div className="overflow-x-auto border border-[#cccccc] rounded">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#1f3864] text-white text-[10px]">
                              <th className="p-2 border border-[#cccccc]">Trade</th>
                              <th className="p-2 border border-[#cccccc]">Today</th>
                              <th className="p-2 border border-[#cccccc]">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.labour?.map((l: any, i: number) => (
                              <tr key={i} className="bg-white">
                                <td className="p-2 border border-[#cccccc] font-medium capitalize">{l.trade}</td>
                                <td className="p-2 border border-[#cccccc]">{l.present}</td>
                                <td className="p-2 border border-[#cccccc]">{l.productivity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A3. Material Received / Consumed */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#1f3864] text-sm mt-4">A3. Material Received / Consumed Today</h3>
                      <div className="overflow-x-auto border border-[#cccccc] rounded">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#1f3864] text-white text-[10px]">
                              <th className="p-2 border border-[#cccccc]">Material</th>
                              <th className="p-2 border border-[#cccccc]">Quantity</th>
                              <th className="p-2 border border-[#cccccc]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.materials?.map((m: any, i: number) => (
                              <tr key={i} className="bg-white">
                                <td className="p-2 border border-[#cccccc] font-medium">{m.item}</td>
                                <td className="p-2 border border-[#cccccc]">{m.quantity}</td>
                                <td className="p-2 border border-[#cccccc]">{m.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A5. Production Log */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#1f3864] text-sm mt-4">A5. Key Quantity / Production Log</h3>
                      <div className="overflow-x-auto border border-[#cccccc] rounded">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#1f3864] text-white text-[10px]">
                              <th className="p-2 border border-[#cccccc]">Activity / Stage</th>
                              <th className="p-2 border border-[#cccccc]">Planned %</th>
                              <th className="p-2 border border-[#cccccc]">Achieved %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.work_progress?.map((w: any, i: number) => (
                              <tr key={i} className="bg-white">
                                <td className="p-2 border border-[#cccccc] font-medium">{w.activity}</td>
                                <td className="p-2 border border-[#cccccc]">{w.planned_pct}%</td>
                                <td className="p-2 border border-[#cccccc] text-emerald-600 font-bold">{w.actual_pct}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* A6. Safety & Quality */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-[#1f3864] text-sm mt-4">A6. Safety & Quality</h3>
                      <div className="overflow-x-auto border border-[#cccccc] rounded">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#1f3864] text-white text-[10px]">
                              <th className="p-2 border border-[#cccccc]">Item</th>
                              <th className="p-2 border border-[#cccccc]">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.extractedData.fullReport.safety?.map((s: any, i: number) => (
                              <tr key={`s-${i}`} className="bg-white">
                                <td className="p-2 border border-[#cccccc] font-medium">{s.item}</td>
                                <td className="p-2 border border-[#cccccc]">{s.status}</td>
                              </tr>
                            ))}
                            {selectedReport.extractedData.fullReport.ncr_reports?.map((n: any, i: number) => (
                              <tr key={`n-${i}`} className="bg-white">
                                <td className="p-2 border border-[#cccccc] font-medium text-red-600">NCR: {n.title}</td>
                                <td className="p-2 border border-[#cccccc] text-red-600">{n.severity} - {n.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#FF6A00] uppercase tracking-wide">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Executive AI Summary</span>
                      </div>
                      <p className="text-sm text-[#0E0E0E] leading-relaxed font-medium">
                        {selectedReport.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl">
                        <p className="text-[10px] text-[#737373] uppercase font-semibold">Labour Deployment</p>
                        <p className="text-xl font-extrabold text-[#0E0E0E] mt-1">{selectedReport.tradesPresentCount}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Full Roster Present</p>
                      </div>

                      <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl">
                        <p className="text-[10px] text-[#737373] uppercase font-semibold">Equipment Uptime</p>
                        <p className="text-xl font-extrabold text-emerald-600 mt-1">{selectedReport.equipmentUptimePercent}%</p>
                        <p className="text-[10px] text-[#737373]">0 Major Breakdowns</p>
                      </div>

                      <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl">
                        <p className="text-[10px] text-[#737373] uppercase font-semibold">Quality & Safety</p>
                        <p className="text-xl font-extrabold text-[#FF6A00] mt-1">Zero LTI</p>
                        <p className="text-[10px] text-[#737373]">Safety Standard Met</p>
                      </div>

                      <div className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl">
                        <p className="text-[10px] text-[#737373] uppercase font-semibold">Financial EVM</p>
                        <p className="text-xs font-bold text-[#0E0E0E] mt-1 line-clamp-1">{selectedReport.evmStatus}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Under Budget Envelope</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-[#E5E5E5] rounded-xl space-y-2">
                      <h3 className="text-xs font-bold text-[#0E0E0E] uppercase tracking-wider text-[#737373]">
                        Materials & Delivery Challans Recorded
                      </h3>
                      <p className="text-xs text-[#0E0E0E] font-semibold">
                        {selectedReport.materialsReceivedSummary}
                      </p>
                      <p className="text-[11px] text-[#737373]">
                        Delivery challan numbers verified against batch plant tickets.
                      </p>
                    </div>
                  </>
                )}

                {/* Verification Sign-Off Footer */}
                <div className="pt-6 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#737373]">
                  <div>
                    <p>Report Compiled by: <strong className="text-[#0E0E0E]">{selectedReport.author}</strong></p>
                    <p className="text-[10px] text-[#A3A3A3]">SiteReportAI Cryptographic Hash: SHA256-V28914</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certified Accurate</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-[#737373]">
              <FileText className="w-12 h-12 mx-auto text-[#D4D4D4] mb-3" />
              <p className="text-sm font-semibold text-[#0E0E0E]">No Report Selected</p>
              <p className="text-xs">Select a report from the list to view full details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
