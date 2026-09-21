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
  Calculator
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
    <div className="min-h-screen bg-[#F7F7F7] text-[#0E0E0E] selection:bg-[#FF6A00] selection:text-white">
      {/* Carbon Black Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#0E0E0E] border-b border-[#262626] px-4 lg:px-10 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <SiteReportLogo isDark={true} size="md" />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <a href="#hero" className="hover:text-[#FF6A00] transition-colors">Home</a>
          <a href="#why-it-works" className="hover:text-[#FF6A00] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#FF6A00] transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-[#FF6A00] transition-colors">Pricing</a>
          <a href="#about" className="hover:text-[#FF6A00] transition-colors">About Us</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="landing-get-started-btn"
            onClick={() => onLaunchApp('dashboard')}
            className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-lg text-sm shadow-md shadow-[#FF6A00]/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started</span>
          </button>
        </div>
      </nav>

      {/* Hero Section: Carbon Black Background with Full Bleed Image on Right */}
      <section id="hero" className="relative bg-[#0E0E0E] text-white min-h-[600px] flex items-center border-b border-[#262626] overflow-hidden">
        {/* Full bleed image on the right with a fade to black on the left */}
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="w-full lg:w-[65%] h-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-transparent to-transparent z-10" />
            <img 
              src="/hero-bg-3.jpg" 
              alt="Engineers shaking hands over blueprints" 
              className="w-full h-full object-cover object-center opacity-90"
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-24 relative z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Sub Headline */}
              <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
                AI FOR CONSTRUCTION REPORTS
              </p>
              
              {/* Main Bold Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
                Smarter Reports.<br />
                Stronger Decisions<span className="text-[#FF6A00]">.</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-[#D4D4D4] max-w-lg leading-relaxed font-normal">
                SiteReportAI analyzes site data and documents to generate accurate, insightful, and easy-to-understand reports in minutes.
              </p>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  id="hero-analyze-report-btn"
                  onClick={() => onLaunchApp('dashboard')}
                  className="px-8 py-3.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#FF6A00]/25 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Analyze Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAIModal('voice')}
                  className="px-8 py-3.5 bg-transparent hover:bg-[#1A1A1A] text-white border border-[#333333] hover:border-[#525252] font-semibold rounded-xl text-sm flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Empty Right Column (Image is now background) */}
            <div className="lg:col-span-5 hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* WHAT SITEREPORAI DOES: Comprehensive Interactive Module Explorer */}
      <section id="modules" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
            WHAT SITEREPORAI DOES
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            5 Core Modules Engineered for the Field
          </h2>
          <p className="text-sm text-[#525252] max-w-2xl mx-auto">
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
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#0E0E0E] text-white border-[#0E0E0E] shadow-md'
                    : 'bg-white text-[#525252] border-[#E5E5E5] hover:border-[#FF6A00]/40 hover:text-[#0E0E0E]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6A00]' : 'text-[#737373]'}`} />
                <span>{mod.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? 'bg-[#FF6A00] text-white' : 'bg-[#F7F7F7] text-[#737373]'
                }`}>
                  {mod.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Deep Dive Card */}
        <div className="mt-8 bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-10 shadow-sm transition-all animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Module Details & Features */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF2E8] border border-[#FF6A00]/30 rounded-full text-xs font-bold text-[#FF6A00]">
                {React.createElement(currentModuleData.icon, { className: 'w-4 h-4' })}
                <span>{currentModuleData.name} Module</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0E0E0E] leading-tight">
                {currentModuleData.headline}
              </h3>

              <p className="text-sm text-[#525252] leading-relaxed">
                {currentModuleData.description}
              </p>

              {/* KPI Stat Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {currentModuleData.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-3.5 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                    <p className="text-[10px] text-[#737373] uppercase font-semibold">{kpi.label}</p>
                    <p className="text-lg sm:text-xl font-extrabold text-[#FF6A00] mt-0.5">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-bold uppercase text-[#0E0E0E] tracking-wider">Key Functional Capabilities:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0E0E0E]">
                  {currentModuleData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => onLaunchApp(currentModuleData.id)}
                  className="px-5 py-3 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs shadow-md shadow-[#FF6A00]/25 flex items-center gap-2 transition-all cursor-pointer"
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
                  <span className="text-xs font-bold text-[#FF6A00]">Sector 62</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-[#737373]">Live Metric A</p>
                    <p className="text-sm font-bold text-white mt-0.5">{currentModuleData.previewStats.activeWorkers}</p>
                  </div>
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-[#737373]">Live Metric B</p>
                    <p className="text-sm font-bold text-[#FF6A00] mt-0.5">{currentModuleData.previewStats.tradesLogged}</p>
                  </div>
                </div>

                <div className="p-3 bg-[#141414] rounded-xl border border-[#262626] space-y-1.5">
                  <p className="text-[10px] text-[#737373] uppercase">AI Auto-Reconciliation Status</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{currentModuleData.previewStats.agenciesVerified}</span>
                    <span className="text-emerald-400 font-bold">100% Verified</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#262626] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6A00] w-[94%]" />
                  </div>
                </div>

                <div className="p-3 bg-[#141414] rounded-xl border border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span className="text-[11px] text-[#D4D4D4]">Multilingual Groq Whisper Connected</span>
                  </div>
                  <span className="text-[10px] text-[#A3A3A3]">380ms Latency</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID matching reference layout */}
      <section id="why-it-works" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="space-y-3 max-w-3xl mx-auto mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
            WHY SITEREPORAI?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            Built for Construction. Powered by AI.
          </h2>
          <p className="text-sm text-[#525252] max-w-xl mx-auto">
            From daily muster roll attendance to structural concrete inventory and plant uptime, SiteReportAI turns unstructured field notes into executive clarity.
          </p>
        </div>

        {/* 4 Feature Cards Grid with Orange Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {valueProps.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E5E5] hover:border-[#FF6A00]/40 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFF2E8] border border-[#FF6A00]/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-[#FF6A00]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0E0E0E] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div 
                  onClick={() => onLaunchApp('dashboard')}
                  className="pt-5 mt-4 border-t border-[#F5F5F5] flex items-center gap-1.5 text-xs font-semibold text-[#FF6A00] cursor-pointer"
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
      <section id="how-it-works" className="py-16 bg-white border-y border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
              WORKFLOW IN ACTION
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
              How SiteReportAI Works in 3 Steps
            </h2>
            <p className="text-sm text-[#525252]">
              Simple for supervisors on site. Accurate and audit-ready for executive decision makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#0E0E0E] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-[#0E0E0E] mb-2">
                Capture on Site via Voice or Photo
              </h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Site supervisors record a 20-second voice note in Hindi, Marathi, or English, or snap a photo of paper delivery challans and batch tickets.
              </p>
              <div className="mt-4 p-3 bg-white rounded-xl border border-[#E5E5E5] text-[11px] text-[#737373] italic">
                "25 mason, 30 helper present. 400 bags cement received on Challan #8914."
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-[#0E0E0E] mb-2">
                AI Cleanses, Structures & Reconciles
              </h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Groq Whisper and LLaMA neural models instantly extract trade counts, supplier names, truck numbers, and hours into structured database schemas.
              </p>
              <div className="mt-4 p-3 bg-white rounded-xl border border-[#E5E5E5] text-[11px] font-mono text-emerald-700">
                ✓ Extracted: 55 Manpower • 400 Bags • Verified CPI 1.04
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-[#0E0E0E] text-white flex items-center justify-center font-extrabold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-[#0E0E0E] mb-2">
                Executive Clarity & 1-Click Reports
              </h3>
              <p className="text-xs text-[#525252] leading-relaxed">
                Real-time muster rolls, material stock balances, plant uptime rates, and EVM S-curves update automatically. Instant PDF shift report export.
              </p>
              <div className="mt-4 p-3 bg-white rounded-xl border border-[#E5E5E5] text-[11px] text-[#0E0E0E] font-semibold flex items-center justify-between">
                <span>Certified DPR #128 Ready</span>
                <span className="text-[#FF6A00]">Share PDF →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Voice & Challan OCR Playground */}
      <section id="playground" className="py-16 bg-[#0E0E0E] text-white border-y border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 bg-[#1A1A1A] border border-[#FF6A00]/40 rounded-full text-[11px] font-semibold text-[#FF6A00] uppercase tracking-wide">
              Live Field Multimodal Testing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Speak or Snap. AI Does the Rest.
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Tap any multilingual field supervisor prompt below to hear speech synthesis and trigger instant extraction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Audio Prompts Picker */}
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-2">
                Sample Field Voice Transcripts
              </p>
              {SAMPLE_VOICE_PROMPTS.slice(0, 3).map((sample, idx) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setActiveVoiceDemo(idx);
                    playVoice(sample.transcript);
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    activeVoiceDemo === idx
                      ? 'bg-[#1A1A1A] border-[#FF6A00] ring-1 ring-[#FF6A00] text-white shadow-lg'
                      : 'bg-[#141414] border-[#262626] hover:bg-[#1A1A1A] text-[#A3A3A3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-[#FF6A00]/20 text-[#FF6A00] text-[10px] rounded-md font-semibold border border-[#FF6A00]/30">
                      {sample.language}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoice(sample.transcript);
                      }}
                      className="p-1 rounded-md hover:bg-[#262626] text-[#FF6A00] transition-colors"
                      title="Play Audio"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="italic text-[#E5E5E5] line-clamp-2">"{sample.transcript}"</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373]">
                    <span>Module: <strong className="text-white capitalize">{sample.module}</strong></span>
                    <span className="text-[#FF6A00] font-medium">Tap to load →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Extracted JSON / AI Structure Output Card */}
            <div className="lg:col-span-7 bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Structured Output</h3>
                    <p className="text-[11px] text-[#A3A3A3]">Extracted parameters ready for database sync</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAIModal('voice')}
                  className="px-3.5 py-1.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Try Your Own Voice</span>
                </button>
              </div>

              {/* Field Summary */}
              <div className="mt-5 space-y-4 text-xs">
                <div className="p-3.5 bg-[#0E0E0E] rounded-xl border border-[#262626]">
                  <p className="text-[11px] font-semibold text-[#A3A3A3] uppercase mb-1">Active Transcript</p>
                  <p className="text-white font-medium leading-relaxed">
                    "{SAMPLE_VOICE_PROMPTS[activeVoiceDemo].transcript}"
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#0E0E0E] rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-[#A3A3A3] uppercase">Target Module</p>
                    <p className="text-sm font-bold text-[#FF6A00] capitalize mt-0.5">
                      {SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module}
                    </p>
                  </div>
                  <div className="p-3 bg-[#0E0E0E] rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-[#A3A3A3] uppercase">Confidence Score</p>
                    <p className="text-sm font-bold text-emerald-400 mt-0.5">99.4%</p>
                  </div>
                  <div className="p-3 bg-[#0E0E0E] rounded-xl border border-[#262626]">
                    <p className="text-[10px] text-[#A3A3A3] uppercase">Processing Time</p>
                    <p className="text-sm font-bold text-white mt-0.5">380ms</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onLaunchApp(SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module as ModuleId)}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#333333] hover:border-[#FF6A00] rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>View in {SAMPLE_VOICE_PROMPTS[activeVoiceDemo].module.toUpperCase()} Module</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF6A00]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE FEATURE: Cost Estimator - Standalone Section */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto bg-gradient-to-br from-[#FFF2E8] to-white border-y border-[#FF6A00]/20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-4 py-1.5 bg-[#FF6A00] text-white rounded-full text-xs font-bold uppercase tracking-wide">
            FREE FEATURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            Cost Estimator - BOQ & Material Calculator
          </h2>
          <p className="text-sm text-[#525252] max-w-xl mx-auto">
            Generate instant Bill of Quantities, material requisitions, and complete cost estimates from building dimensions — 100% free, no signup required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Feature Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF6A00] flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0E0E0E]">Instant BOQ Generation</h3>
                <p className="text-xs text-[#525252]">Complete Bill of Quantities with item-wise rates</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0E0E0E]">Multi-floor building parameters</p>
                  <p className="text-xs text-[#525252]">Enter dimensions for each floor with live column height calculation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0E0E0E]">Material requisition summary</p>
                  <p className="text-xs text-[#525252]">Cement, sand, aggregate, steel, bricks with exact quantities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0E0E0E]">Complete cost chain breakdown</p>
                  <p className="text-xs text-[#525252]">Material → Labour → T&P → Profit → GST calculation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0E0E0E]">Steel procurement summary</p>
                  <p className="text-xs text-[#525252]">Total steel required with waste percentage and tonnage</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#0E0E0E]">CSV export ready</p>
                  <p className="text-xs text-[#525252]">Download complete BOQ for procurement and billing</p>
                </div>
              </div>
            </div>

            <button
              onClick={onLaunchEstimator}
              className="px-8 py-3.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-sm shadow-lg shadow-[#FF6A00]/25 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Estimator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Quick Stats */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#0E0E0E] mb-4">Quick Results Preview</h4>
            <div className="space-y-4">
              <div className="p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                <p className="text-[10px] text-[#737373] uppercase mb-1">Calculation Speed</p>
                <p className="text-2xl font-bold text-[#FF6A00]">&lt; 1 Second</p>
              </div>
              <div className="p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                <p className="text-[10px] text-[#737373] uppercase mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-[#0E0E0E]">₹2-5L per Project</p>
              </div>
              <div className="p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                <p className="text-[10px] text-[#737373] uppercase mb-1">Pricing</p>
                <p className="text-2xl font-bold text-emerald-600">100% Free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON MATRIX: Traditional vs SiteReportAI */}
      <section id="comparison" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
            THE SITEREPORAI DIFFERENCE
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            Stop Bleeding Money on Manual Site Chaos
          </h2>
          <p className="text-sm text-[#525252]">
            See how modern AI infrastructure reporting replaces paper delays, contractor disputes, and budget blowouts.
          </p>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0E0E0E] text-white border-b border-[#262626]">
                  <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px] w-1/4">Operational Area</th>
                  <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px] text-red-400 w-3/8">Traditional Site Method</th>
                  <th className="py-4 px-5 font-bold uppercase tracking-wider text-[11px] text-[#FF6A00] w-3/8">With SiteReportAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F7F7F7] transition-colors">
                    <td className="py-4 px-5 font-bold text-[#0E0E0E]">
                      {row.dimension}
                    </td>
                    <td className="py-4 px-5 text-[#737373]">
                      <span className="text-red-500 mr-1.5 font-bold">✕</span>
                      {row.traditional}
                    </td>
                    <td className="py-4 px-5 text-[#0E0E0E] font-medium bg-[#FFF2E8]/40">
                      <span className="text-emerald-600 mr-1.5 font-bold">✓</span>
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
      <section id="calculator" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto bg-white rounded-3xl border border-[#E5E5E5] my-10 shadow-sm">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
            ROI & EFFICIENCY
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            Calculate Your Time & Cost Savings
          </h2>
          <p className="text-sm text-[#525252]">
            See how automating daily construction logs and EVM reconciliation impacts your site profitability.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#0E0E0E] mb-2">
                  <span>Project Portfolio Budget</span>
                  <span className="text-[#FF6A00]">₹{projectSizeCr} Crores</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={projectSizeCr}
                  onChange={(e) => setProjectSizeCr(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-[#0E0E0E] mb-2">
                  <span>Active Construction Sites</span>
                  <span className="text-[#FF6A00]">{numSites} Sites</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={numSites}
                  onChange={(e) => setNumSites(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
                />
              </div>

              <div className="p-4 bg-[#FFF2E8] border border-[#FF6A00]/20 rounded-xl text-xs text-[#525252] space-y-1">
                <p className="font-bold text-[#0E0E0E]">Automated Benefits:</p>
                <p>• Zero manual Excel data re-entry at end of shift</p>
                <p>• Immediate detection of material wastage anomalies</p>
                <p>• Subcontractor invoice verification against voice check-ins</p>
                <p>• Early warning alerts before budget cost overruns occur</p>
              </div>
            </div>

            <div className="bg-[#0E0E0E] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 border border-[#262626]">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                  Projected Annual Impact
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#A3A3A3]">Reporting Time Recovered</p>
                    <p className="text-2xl lg:text-3xl font-extrabold text-white mt-0.5">
                      {estimatedDaysSaved} Eng Days / yr
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#A3A3A3]">Wastage & Delay Prevention</p>
                    <p className="text-2xl lg:text-3xl font-extrabold text-[#FF6A00] mt-0.5">
                      ₹{estimatedCostSavedLakhs} Lakhs
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#A3A3A3]">Idle Plant Recovery</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      ₹{idleMachinerySavedLakhs} Lakhs fuel & rental savings
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchApp('dashboard')}
                className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Live Site Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">
            QUESTIONS & ANSWERS
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E0E0E] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#525252]">
            Everything you need to know about implementing SiteReportAI across your sites.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0E0E0E] cursor-pointer hover:bg-[#F7F7F7] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#FF6A00] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 text-xs text-[#525252] leading-relaxed border-t border-[#F5F5F5]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-[#0E0E0E] text-white py-16 px-4 sm:px-6 lg:px-10 border-t border-[#262626]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] border border-[#FF6A00]/40 rounded-full text-xs font-bold text-[#FF6A00]">
            <Zap className="w-3.5 h-3.5" />
            <span>Ready for Instant Deployment</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Transform Your Construction Reporting Today
          </h2>

          <p className="text-sm sm:text-base text-[#A3A3A3] max-w-xl mx-auto">
            Join forward-thinking general contractors, infrastructure developers, and project managers using SiteReportAI.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-7 py-3.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xl shadow-[#FF6A00]/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Live Site Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#333333] rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#FF6A00]" />
              <span>Try Multilingual Voice Input</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer matching reference image: Carbon Black with SiteReportAI Branding */}
      <footer className="bg-[#0E0E0E] border-t border-[#262626] text-white py-12 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <SiteReportLogo isDark={true} size="md" />
            <div className="h-4 w-px bg-[#333333] hidden sm:block" />
            <p className="text-xs text-[#A3A3A3]">
              AI-Powered Construction Reporting & Earned Value Management System
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#A3A3A3]">
            <span>Smarter Reports. Stronger Sites.</span>
            <div className="h-3 w-px bg-[#333333]" />
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="text-[#FF6A00] hover:underline font-semibold cursor-pointer"
            >
              Open Console →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
