import React, { useState } from 'react';
import { 
  FileText, 
  BarChart3, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  Camera, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Users, 
  Package, 
  Wrench, 
  TrendingUp,
  Volume2,
  Building,
  Building2,
  Check,
  Zap,
  Layers,
  FileCheck2,
  AlertTriangle,
  Receipt,
  HardHat,
  Truck,
  DollarSign,
  PieChart,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  CheckCircle,
  HelpCircle,
  Calculator,
  GraduationCap,
  X
} from 'lucide-react';
import { SiteReportLogo } from '../common/SiteReportLogo';
import { SkyscraperHeroGraphic } from '../common/SkyscraperHeroGraphic';
import { SAMPLE_VOICE_PROMPTS } from '../../utils/aiParser';
import { ModuleId } from '../../types';

interface LandingPageProps {
  onLaunchApp: (targetModule?: ModuleId) => void;
  onLaunchEstimator: () => void;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onLaunchEstimator,
  onOpenAIModal,
}) => {
  const [activeVoiceDemo, setActiveVoiceDemo] = useState(0);
  const [activeModuleTab, setActiveModuleTab] = useState<ModuleId>('labour');
  const [projectSizeCr, setProjectSizeCr] = useState<number>(50);
  const [numSites, setNumSites] = useState<number>(3);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const estimatedDaysSaved = Math.round(numSites * 28);
  const estimatedCostSavedLakhs = Math.round(projectSizeCr * 0.035 * 100);
  const idleMachinerySavedLakhs = Math.round(numSites * 4.2);

  const playVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const modulesShowcase = [
    {
      id: 'labour' as ModuleId,
      name: 'Labour & Manpower',
      badge: 'Trade Muster Roll',
      icon: Users,
      headline: 'Automate Daily Attendance, Trade Rosters & Subcontractor Ledgers',
      description: 'Capture daily worker headcounts by trade (Masons, Barbenders, Carpenters, Helpers) in seconds using local voice notes. Track overtime hours, prevent ghost workers, and reconcile subcontractor billing against real site check-ins.',
      kpis: [
        { label: 'Attendance Accuracy', value: '99.8%' },
        { label: 'Time Saved Daily', value: '45 Mins' },
        { label: 'Ghost Worker Reduction', value: '100%' },
      ],
      features: [
        'Voice-logged trade headcounts (Hindi, Marathi, English)',
        'Subcontractor agency billing ledger reconciliation',
        'Overtime (OT) hours calculation & biometric sync',
        'Worker safety inductions & skill level tracking',
      ],
      previewStats: {
        activeWorkers: '78 Active',
        tradesLogged: '6 Trades',
        agenciesVerified: 'Apex Builders & Metro Infra',
      }
    },
    {
      id: 'resource' as ModuleId,
      name: 'Materials & Inventory',
      badge: 'Challan OCR & Stock',
      icon: Package,
      headline: 'Instant Delivery Challan Scanning & Material Consumption Ledger',
      description: 'Snap photos of paper delivery challans, weighbridge slips, and batch plant tickets. SiteReportAI extracts supplier names, batch IDs, and quantities instantly to update live stocks and flag critical shortages before concrete pours halt.',
      kpis: [
        { label: 'OCR Extract Speed', value: '< 2 Sec' },
        { label: 'Wastage Prevention', value: '₹14L/Site' },
        { label: 'Reorder Buffer', value: 'Automated' },
      ],
      features: [
        'Instant OCR extraction for paper challans and batch tickets',
        'Theoretical vs actual material consumption variance',
        'Minimum reorder safety alerts for cement, rebar, aggregate',
        'Precast finished element tracking (Casting, Curing, Dispatch)',
      ],
      previewStats: {
        activeWorkers: 'Cement: 480 Bags',
        tradesLogged: 'Rebar: 42.5 MT',
        agenciesVerified: 'Ultratech & Tata Tiscon',
      }
    },
    {
      id: 'equipment' as ModuleId,
      name: 'Plant & Heavy Machinery',
      badge: 'Equipment Telemetry',
      icon: Wrench,
      headline: 'Maximize Fleet Uptime & Slash Fuel Wastage from Idle Machinery',
      description: 'Track running hours, idle hours, and breakdown downtime across Tower Cranes, Transit Mixers, Boom Pumps, and JCBs. Identify root causes for idle equipment (waiting for rebar, diesel delay) and audit rental vendor bills.',
      kpis: [
        { label: 'Uptime Benchmark', value: '96.2%' },
        { label: 'Fuel Loss Avoided', value: '₹4.2L/mo' },
        { label: 'MTTR Tracking', value: 'Real-time' },
      ],
      features: [
        'Daily working vs idle hours tracking with reason tagging',
        'Breakdown incident logs with downtime impact analysis',
        'Rental billing verification against actual meter hours',
        'Batching plant and concrete pump dispatch coordination',
      ],
      previewStats: {
        activeWorkers: 'Tower Crane 1: 9.5 Hrs',
        tradesLogged: 'JCB 3DX: 8.0 Hrs',
        agenciesVerified: 'Schwing Stetter / Sany',
      }
    },
    {
      id: 'cost' as ModuleId,
      name: 'Cost & EVM Analytics',
      badge: 'Earned Value S-Curves',
      icon: BarChart3,
      headline: 'Executive Financial Earned Value Management (CPI & SPI) at a Glance',
      description: 'Eliminate end-of-month budget shocks. SiteReportAI continuously computes Planned Value (PV), Earned Value (EV), and Actual Cost (AC) from physical site logs, calculating Cost Performance Index (CPI) and Schedule Performance Index (SPI) in real-time.',
      kpis: [
        { label: 'Current CPI', value: '1.04' },
        { label: 'Schedule SPI', value: '0.98' },
        { label: 'Forecast Variance', value: '+3.8% Profit' },
      ],
      features: [
        'Live EVM S-Curves (Planned Value, Earned Value, Actual Cost)',
        'Cost Variance (CV) and Schedule Variance (SV) tracking',
        'Estimate at Completion (EAC) predictive forecasts',
        'Multi-currency / Indian Crores (₹ Cr) financial scaling',
      ],
      previewStats: {
        activeWorkers: 'Budget: ₹18.5 Cr',
        tradesLogged: 'Spent: ₹13.8 Cr',
        agenciesVerified: 'Earned: ₹14.35 Cr',
      }
    },
    {
      id: 'reports' as ModuleId,
      name: 'Reports & Document Hub',
      badge: '1-Click Certified DPR',
      icon: FileText,
      headline: 'Generate Professional Client-Ready PDF Shift Reports in 1 Click',
      description: 'Turn unstructured supervisor voice logs and site notes into beautifully formatted Daily Progress Reports (DPR), safety audits, and weekly structural pour summaries. Certified with cryptographic hashes and ready for instant WhatsApp/Email export.',
      kpis: [
        { label: 'Report Prep Time', value: '2 Mins' },
        { label: 'Format Compliance', value: '100% ISO' },
        { label: 'Client Approvals', value: '3x Faster' },
      ],
      features: [
        'Automated Daily Progress Reports (DPR) generated by AI',
        'Executive summaries crafted from voice and OCR logs',
        'One-click PDF export with site photos and trade counts',
        'Cryptographic verification hashes for audit compliance',
      ],
      previewStats: {
        activeWorkers: '128 Reports Filed',
        tradesLogged: '0 Non-Compliance',
        agenciesVerified: 'Sign-off Certified',
      }
    }
  ];

  const currentModuleData = modulesShowcase.find(m => m.id === activeModuleTab) || modulesShowcase[0];

  const valueProps = [
    {
      icon: Mic,
      title: 'Multilingual Voice AI',
      description: 'Site supervisors speak naturally in Hindi, Marathi, or English. Groq Whisper + LLaMA extract structured counts instantly.',
    },
    {
      icon: Receipt,
      title: 'Challan & Batch OCR',
      description: 'Scan crumpled paper delivery challans and weighbridge slips. AI digitizes supplier names, quantities, and trucks in 2 seconds.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time EVM Engine',
      description: 'Live Planned Value, Earned Value, and Actual Cost tracking with real-time CPI/SPI financial performance metrics.',
    },
    {
      icon: FileCheck2,
      title: 'Automated Shift DPRs',
      description: 'Zero end-of-day Excel retyping. Generate client-ready executive PDF reports with zero manual overhead.',
    },
  ];

  const comparisons = [
    {
      dimension: 'Daily Shift Logging',
      traditional: 'Messy paper clipboards & late-night Excel retyping',
      sitereport: 'Instant 20-second voice note in Hindi/Marathi/English',
    },
    {
      dimension: 'Material Challan Entry',
      traditional: 'Paper challans lost in site cabins for weeks',
      sitereport: 'Camera OCR digitizes batch quantities in 2 seconds',
    },
    {
      dimension: 'Subcontractor Billing',
      traditional: 'Endless disputes over inflated muster rolls',
      sitereport: 'Voice-verified trade rosters & audit-proof logs',
    },
    {
      dimension: 'Financial EVM Tracking',
      traditional: 'Delayed month-end accountant spreadsheets',
      sitereport: 'Live daily CPI, SPI, and predictive EAC curves',
    },
    {
      dimension: 'Client Progress Reports',
      traditional: '3 to 4 hours spent assembling PDFs weekly',
      sitereport: '1-click automated PDF export with certified hash',
    },
  ];

  const faqs = [
    {
      q: 'Does SiteReportAI work on mobile phones directly on construction sites?',
      a: 'Yes! SiteReportAI is fully responsive and optimized for mobile devices and tablets. Field engineers and supervisors can record voice notes and scan delivery challans directly on site without carrying laptops.'
    },
    {
      q: 'Which Indian regional languages and dialects are supported for voice input?',
      a: 'SiteReportAI natively supports Hindi (हिंदी), Marathi (मराठी), and Indian English (EN-IN). The AI understands mixed construction vernacular (e.g. "25 Mason aye the, 400 bag cement unloading hua, Tower crane 8 ghante chala").'
    },
    {
      q: 'How does the Delivery Challan OCR handle handwritten or stamped paper slips?',
      a: 'Our multimodal vision pipeline handles crumpled, stamped, and handwritten delivery challans from all major suppliers (Ultratech, ACC, Tata Tiscon, JSW). It cross-references supplier names and converts unit metrics automatically.'
    },
    {
      q: 'Can we calculate Earned Value Management (EVM) for specific project phases?',
      a: 'Yes. SiteReportAI automatically computes Planned Value (PV), Earned Value (EV), and Actual Cost (AC) to deliver daily Cost Performance Index (CPI) and Schedule Performance Index (SPI) curves and forecasts.'
    },
    {
      q: 'Can we export reports to PDF and share with clients and architects?',
      a: 'Absolutely. You can generate certified Daily Progress Reports (DPRs), weekly pour summaries, and safety audits in 1 click, complete with company branding, site photographs, and cryptographic verification hashes.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F8FAFC] selection:bg-[#38BDF8] selection:text-[#08090C]">
      {/* Dark Glass Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0B0D13]/85 backdrop-blur-md border-b border-white/10 px-4 lg:px-10 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <SiteReportLogo isDark={true} size="md" />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <a href="#hero" className="hover:text-white transition-colors">Home</a>
          <a href="#catalog" className="hover:text-white transition-colors">Catalog</a>
          <a href="#modules" className="hover:text-white transition-colors">Modules</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="landing-get-started-btn"
            onClick={() => onLaunchApp('dashboard')}
            className="px-6 py-2 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-xs shadow-md transition-all cursor-pointer"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section: RentPe Style Contained Box */}
      <section id="hero" className="pt-8 pb-10 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="rounded-[28px] border border-white/10 bg-[#0B0F17] bg-grid bg-radial-hero relative overflow-hidden py-16 sm:py-24 px-6 text-center shadow-2xl">
          {/* Top Feature Timeline Node */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-48 sm:w-72 h-[1px] bg-white/15" />
            <div className="flex items-center gap-6 sm:gap-10 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#121622] border border-white/20 flex items-center justify-center text-sky-400 shadow-lg">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#121622] border border-white/20 flex items-center justify-center text-emerald-400 shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#121622] border border-white/20 flex items-center justify-center text-amber-400 shadow-lg">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Smarter site logs.<br />
            <span className="text-[#38BDF8]">Generated in seconds.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed">
            Turn field voice notes, site photos, and logs into accurate progress reports with zero manual overhead.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-analyze-report-btn"
              onClick={() => onLaunchApp('dashboard')}
              className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-sm shadow-xl shadow-white/5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Workspace
            </button>
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-sm font-semibold transition-all backdrop-blur-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              + Voice Field Log
            </button>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section: Screenshot 2 Style */}
      <section id="catalog" className="py-10 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
              CATALOG : FIELD MODULES
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Automated Site Operations
            </h2>
          </div>
          <button
            onClick={() => onLaunchApp('reports')}
            className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Matching Screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              sku: 'SKU : DPR-AUTO-01',
              title: 'Daily Progress Report',
              desc: 'AI synthesized multi-trade field logs with verified workforce counts and site metrics.',
              metric: '128 Reports',
              action: 'View Hub',
              target: 'reports' as const,
              icon: FileText
            },
            {
              sku: 'SKU : CREW-MGR-02',
              title: 'Labour & Workforce',
              desc: 'Trade attendance tracking, agency breakdowns, and overtime wage calculations.',
              metric: '73 Active',
              action: 'Manage',
              target: 'labour' as const,
              icon: HardHat
            },
            {
              sku: 'SKU : PLANT-MON-03',
              title: 'Equipment & Machinery',
              desc: 'Real-time telemetry, breakdown logs, downtime alerts, and fuel consumption analytics.',
              metric: '96% Uptime',
              action: 'Track Assets',
              target: 'equipment' as const,
              icon: Wrench
            },
            {
              sku: 'SKU : EVM-AUDIT-04',
              title: 'Analytics & EVM',
              desc: 'Earned Value Management, CPI/SPI curves, and automated budget overrun detection.',
              metric: 'CPI 1.031',
              action: 'Audit Cost',
              target: 'cost' as const,
              icon: BarChart3
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#10131A] hover:bg-[#141822] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-105 transition-transform">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  {item.sku}
                </p>
                <h3 className="text-white font-semibold text-base mt-1.5 group-hover:text-sky-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div>
                <div className="border-t border-white/[0.08] my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm font-mono">
                    {item.metric}
                  </span>
                  <button
                    onClick={() => onLaunchApp(item.target)}
                    className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold rounded-full transition-all cursor-pointer"
                  >
                    {item.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => onLaunchApp('dashboard')}
            className="px-6 py-2.5 bg-[#151922] hover:bg-[#1C2230] text-neutral-300 border border-white/10 text-xs font-medium rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Load More
          </button>
        </div>

        {/* Giant Watermark Branding */}
        <div className="overflow-hidden select-none pointer-events-none mt-16 sm:mt-24 text-center">
          <span className="text-neutral-800/25 font-black text-[70px] sm:text-[130px] md:text-[190px] leading-none tracking-tight block uppercase">
            SiteReport
          </span>
        </div>
      </section>

      {/* WHAT SITEREPORAI DOES: Comprehensive Interactive Module Explorer */}
      <section id="modules" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            WHAT SITEREPORAI DOES
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            5 Core Modules Engineered for the Field
          </h2>
          <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
            Explore how SiteReportAI manages every operational pillar of your construction project — from morning muster roll to structural concrete delivery and executive financial EVM curves.
          </p>
        </div>

        {/* Module Tab Switcher */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {modulesShowcase.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModuleTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleTab(mod.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white text-neutral-950 border-white shadow-lg'
                    : 'bg-[#10131A] text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-neutral-400'}`} />
                <span>{mod.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-neutral-900 text-white' : 'bg-white/5 text-neutral-400'
                }`}>
                  {mod.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Deep Dive Card */}
        <div className="mt-8 bg-[#10131A] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl transition-all animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Module Details & Features */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/30 rounded-full text-xs font-bold text-sky-400">
                {React.createElement(currentModuleData.icon, { className: 'w-4 h-4' })}
                <span>{currentModuleData.name} Module</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {currentModuleData.headline}
              </h3>

              <p className="text-sm text-neutral-400 leading-relaxed">
                {currentModuleData.description}
              </p>

              {/* KPI Stat Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {currentModuleData.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3.5 bg-[#141722] rounded-xl border border-white/10">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">{kpi.label}</p>
                    <p className="text-lg sm:text-xl font-extrabold text-sky-400 mt-0.5">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase text-neutral-300 tracking-wider">Key Functional Capabilities:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                  {currentModuleData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => onLaunchApp(currentModuleData.id)}
                  className="px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Open {currentModuleData.name} in Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Column: Live Mock UI Panel */}
            <div className="lg:col-span-5 bg-[#0E0E0E] text-white rounded-2xl p-6 border border-[#262626] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-[#A3A3A3] ml-2">sitereport://{currentModuleData.id}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40">
                  LIVE SYNC
                </span>
              </div>

              {/* Dynamic Mock View based on module */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#141414] rounded-xl border border-[#262626] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#737373] uppercase">Active Site</p>
                    <p className="font-bold text-white">Greenfield Towers - Block A</p>
                  </div>
                  <span className="text-xs font-bold text-sky-400">Sector 62</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-[#10131A] rounded-xl border border-white/10">
                    <p className="text-[10px] text-neutral-400">Live Metric A</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentModuleData.previewStats.activeWorkers}</p>
                  </div>
                  <div className="p-3 bg-[#10131A] rounded-xl border border-white/10">
                    <p className="text-[10px] text-neutral-400">Live Metric B</p>
                    <p className="text-sm font-bold text-sky-400 mt-0.5">{currentModuleData.previewStats.tradesLogged}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#10131A] rounded-xl border border-white/10 space-y-1.5">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider">AI Auto-Reconciliation Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{currentModuleData.previewStats.agenciesVerified}</span>
                    <span className="text-emerald-400 font-bold">100% Verified</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 w-[94%]" />
                  </div>
                </div>

                <div className="p-3 bg-[#10131A] rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[11px] text-neutral-200">Multilingual Groq Whisper Connected</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">380ms Latency</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID matching reference layout */}
      <section id="why-it-works" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="space-y-3 max-w-3xl mx-auto mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            WHY SITEREPORAI?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Construction. Powered by AI.
          </h2>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            From daily muster roll attendance to structural concrete inventory and plant uptime, SiteReportAI turns unstructured field notes into executive clarity.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {valueProps.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-[#10131A] hover:bg-[#141822] border border-white/10 hover:border-white/20 rounded-2xl p-6 shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform text-sky-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div 
                  onClick={() => onLaunchApp('dashboard')}
                  className="pt-5 mt-4 border-t border-white/[0.08] flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-white cursor-pointer transition-colors"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS: 3 Simple Steps */}
      <section id="how-it-works" className="py-16 bg-[#0B0D13] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
              WORKFLOW IN ACTION
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How SiteReportAI Works in 3 Steps
            </h2>
            <p className="text-sm text-neutral-400">
              Simple for supervisors on site. Accurate and audit-ready for executive decision makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-extrabold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Capture on Site via Voice or Photo
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Site supervisors record a 20-second voice note in Hindi, Marathi, or English, or snap a photo of paper delivery challans and batch tickets.
              </p>
              <div className="mt-4 p-3 bg-[#141722] rounded-xl border border-white/10 text-[11px] text-neutral-300 italic font-mono">
                "25 mason, 30 helper present. 400 bags cement received on Challan #8914."
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-neutral-950 flex items-center justify-center font-extrabold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                AI Cleanses, Structures & Reconciles
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Groq Whisper and LLaMA neural models instantly extract trade counts, supplier names, truck numbers, and hours into structured database schemas.
              </p>
              <div className="mt-4 p-3 bg-[#141722] rounded-xl border border-white/10 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Extracted: 55 Manpower • 400 Bags • Verified CPI 1.04</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#10131A] border border-white/10 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-extrabold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Executive Clarity & 1-Click Reports
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Real-time muster rolls, material stock balances, plant uptime rates, and EVM S-curves update automatically. Instant PDF shift report export.
              </p>
              <div className="mt-4 p-3 bg-[#141722] rounded-xl border border-white/10 text-[11px] text-white font-semibold flex items-center justify-between">
                <span>Certified DPR #128 Ready</span>
                <span className="text-sky-400">Share PDF →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Voice & Challan OCR Playground */}
      <section id="playground" className="py-20 bg-[#08090C] text-white border-y border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3.5 py-1 bg-white/10 border border-white/15 rounded-full text-[11px] font-semibold text-sky-400 uppercase tracking-wider">
              Multimodal Field Capture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Speak or Snap. AI Does the Rest.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Tap any multilingual field supervisor prompt below to trigger instant structured extraction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Audio Prompts Picker */}
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Sample Field Voice Transcripts
              </p>
              {SAMPLE_VOICE_PROMPTS.slice(0, 3).map((sample, idx) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setActiveVoiceDemo(idx);
                    playVoice(sample.transcript);
                  }}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    activeVoiceDemo === idx
                      ? 'bg-[#10131A] border-sky-400/50 ring-1 ring-sky-400/40 text-white shadow-lg'
                      : 'bg-[#10131A]/60 border-white/10 hover:bg-[#10131A] text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-sky-500/15 text-sky-400 text-[10px] rounded-full font-semibold border border-sky-500/30">
                      {sample.language}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoice(sample.transcript);
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-sky-400 transition-colors"
                      title="Play Audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="italic text-neutral-200 line-clamp-2">"{sample.transcript}"</p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Module: <strong className="text-white capitalize">{sample.module}</strong></span>
                    <span className="text-sky-400 font-medium">Tap to load →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Extracted JSON / AI Structure Output Card */}
            <div className="lg:col-span-7 bg-[#10131A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Structured Output</h3>
                    <p className="text-[11px] text-neutral-400">Extracted parameters ready for database sync</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAIModal('voice')}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Try Voice Log</span>
                </button>
              </div>

              {/* Field Summary */}
              <div className="mt-5 space-y-4 text-xs">
                <div className="p-4 bg-[#0B0D13] rounded-2xl border border-white/10">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Active Transcript</p>
                  <p className="text-white font-medium leading-relaxed">
                    "{SAMPLE_VOICE_PROMPTS[activeVoiceDemo].transcript}"
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Target Module</p>
                    <p className="text-sm font-bold text-sky-400 capitalize mt-1">
                      {SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module}
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Confidence</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">99.4%</p>
                  </div>
                  <div className="p-3.5 bg-[#0B0D13] rounded-2xl border border-white/10">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Latency</p>
                    <p className="text-sm font-bold text-white mt-1">380ms</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onLaunchApp(SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module as ModuleId)}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View in {SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module.toUpperCase()} Module</span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE FEATURE: Cost Estimator - Standalone Section */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial-glow pointer-events-none opacity-40 -mr-20 -mt-20" />
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 relative z-10">
            <span className="px-3.5 py-1 bg-white/10 text-sky-400 border border-white/15 rounded-full text-xs font-semibold uppercase tracking-wider">
              Free Feature
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Cost Estimator & BOQ Calculator
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Generate instant Bill of Quantities, material requisitions, and complete cost estimates from building dimensions — 100% free, no signup required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left: Feature Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Instant BOQ Generation</h3>
                  <p className="text-xs text-neutral-400">Complete Bill of Quantities with item-wise rates</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Multi-floor building parameters</p>
                    <p className="text-xs text-neutral-400">Enter dimensions for each floor with live column height calculation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Material requisition summary</p>
                    <p className="text-xs text-neutral-400">Cement, sand, aggregate, steel, bricks with exact quantities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Complete cost chain breakdown</p>
                    <p className="text-xs text-neutral-400">Material → Labour → Plant → Contractor Margin → GST calculation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">Steel procurement summary</p>
                    <p className="text-xs text-neutral-400">Total steel required with waste percentage and tonnage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-white">CSV export ready</p>
                    <p className="text-xs text-neutral-400">Download complete BOQ for procurement and billing</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onLaunchEstimator}
                  className="px-8 py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-sm shadow-xl flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Launch Free Estimator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="bg-[#0B0D13] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
              <h4 className="text-sm font-bold text-white mb-2">Instant Engineering Engine</h4>
              <div className="space-y-3.5">
                <div className="p-4 bg-[#141822] rounded-2xl border border-white/10">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Calculation Latency</p>
                  <p className="text-2xl font-bold text-sky-400">&lt; 1 Second</p>
                </div>
                <div className="p-4 bg-[#141822] rounded-2xl border border-white/10">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Average Waste Mitigation</p>
                  <p className="text-2xl font-bold text-white">₹2-5 Lakhs / Site</p>
                </div>
                <div className="p-4 bg-[#141822] rounded-2xl border border-white/10">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Platform License</p>
                  <p className="text-2xl font-bold text-emerald-400">100% Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX: Traditional vs SiteReportAI */}
      <section id="comparison" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Precision vs Paperwork
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop Bleeding Money on Manual Site Chaos
          </h2>
          <p className="text-sm text-neutral-400">
            See how modern AI infrastructure reporting replaces paper delays, contractor disputes, and budget blowouts.
          </p>
        </div>

        <div className="bg-[#10131A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0B0D13] text-white border-b border-white/10">
                  <th className="py-4.5 px-6 font-bold uppercase tracking-wider text-[11px] w-1/4">Operational Area</th>
                  <th className="py-4.5 px-6 font-bold uppercase tracking-wider text-[11px] text-rose-400 w-3/8">Traditional Site Method</th>
                  <th className="py-4.5 px-6 font-bold uppercase tracking-wider text-[11px] text-sky-400 w-3/8">With SiteReport AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-4.5 px-6 font-bold text-white">
                      {row.dimension}
                    </td>
                    <td className="py-4.5 px-6 text-neutral-400">
                      <X className="w-3.5 h-3.5 text-rose-400 inline mr-2 shrink-0" />
                      {row.traditional}
                    </td>
                    <td className="py-4.5 px-6 text-white font-medium bg-sky-500/5">
                      <Check className="w-3.5 h-3.5 text-sky-400 inline mr-2 shrink-0" />
                      {row.sitereport}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI & Business Impact Calculator */}
      <section id="calculator" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="bg-[#10131A] border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
              ROI & Efficiency
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Calculate Your Time & Cost Savings
            </h2>
            <p className="text-sm text-neutral-400">
              See how automating daily construction logs and EVM reconciliation impacts your site profitability.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-white mb-2">
                    <span>Project Portfolio Budget</span>
                    <span className="text-sky-400">₹{projectSizeCr} Crores</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={projectSizeCr}
                    onChange={(e) => setProjectSizeCr(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-white mb-2">
                    <span>Active Construction Sites</span>
                    <span className="text-sky-400">{numSites} Sites</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={numSites}
                    onChange={(e) => setNumSites(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                <div className="p-5 bg-[#0B0D13] border border-white/10 rounded-2xl text-xs text-neutral-400 space-y-2">
                  <p className="font-bold text-white">Automated Site Advantage:</p>
                  <p>• Zero manual Excel data re-entry at end of shift</p>
                  <p>• Immediate detection of material wastage anomalies</p>
                  <p>• Subcontractor invoice verification against voice check-ins</p>
                  <p>• Real-time EVM alerts before budget overruns occur</p>
                </div>
              </div>

              <div className="bg-[#0B0D13] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-white/10">
                <div className="space-y-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Projected Annual Impact
                  </p>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-neutral-400">Reporting Time Recovered</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1">
                        {estimatedDaysSaved} Eng Days / yr
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400">Wastage & Delay Prevention</p>
                      <p className="text-2xl lg:text-3xl font-extrabold text-sky-400 mt-1">
                        ₹{estimatedCostSavedLakhs} Lakhs
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-400">Idle Plant Recovery</p>
                      <p className="text-lg font-bold text-white mt-1">
                        ₹{idleMachinerySavedLakhs} Lakhs fuel & rental savings
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onLaunchApp('dashboard')}
                  className="w-full py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Launch Live Site Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="text-center mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Questions & Answers
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-neutral-400">
            Everything you need to know about implementing SiteReport across your construction portfolio.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#10131A] border border-white/10 rounded-2xl overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-[#08090C] text-white py-20 px-4 sm:px-6 lg:px-10 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-semibold text-sky-400">
            <Zap className="w-3.5 h-3.5" />
            <span>Ready for Instant Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Transform Your Construction Reporting Today
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Join forward-thinking infrastructure developers, general contractors, and project managers using SiteReport.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-full text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch Live Site Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-sky-400" />
              <span>Try Multilingual Voice Input</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer matching RentPe reference: Deep obsidian with giant watermark SiteReport typography */}
      <footer className="bg-[#08090C] border-t border-white/10 text-neutral-400 py-16 px-4 sm:px-6 lg:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <SiteReportLogo isDark={true} size="md" />
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <p className="text-xs text-neutral-400">
              AI-Powered Construction Reporting & Earned Value Management System
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <span>Smarter Reports. Stronger Sites.</span>
            <div className="h-3 w-px bg-white/10" />
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="text-white hover:text-sky-400 font-semibold transition-colors cursor-pointer"
            >
              Open Console →
            </button>
          </div>
        </div>

        {/* Giant RentPe-style Watermark Typography */}
        <div className="mt-12 select-none pointer-events-none text-center">
          <span className="text-[14vw] font-black text-white/[0.03] leading-none tracking-tighter uppercase inline-block">
            SiteReport
          </span>
        </div>
      </footer>
    </div>
  );
};
