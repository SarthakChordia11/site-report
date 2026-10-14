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
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Cpu, 
  Activity, 
  Calendar, 
  ExternalLink, 
  ChevronRight
} from 'lucide-react';
import { SiteReportLogo } from '../common/SiteReportLogo';
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
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);

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
      badge: 'Section A1 & A2',
      icon: Users,
      headline: 'Trade Muster Roll, Subcontractor Ledger & Real-Time Headcounts',
      description: 'Capture daily worker headcounts across trades (Masons, Barbenders, Carpenters, Welders, Helpers) in seconds using natural voice logs. Automatically track overtime hours, prevent ghost muster rolls, and reconcile contractor billings against verified site check-ins.',
      image: '/hero-bg-2.jpg',
      fallbackImage: '/hero-bg-3.jpg',
      kpis: [
        { label: 'Attendance Precision', value: '99.8%' },
        { label: 'Daily Time Saved', value: '45 Mins' },
        { label: 'Muster Variance', value: '0.0%' },
      ],
      features: [
        'Multilingual voice logging in Hindi, Marathi, and English',
        'Subcontractor agency billing ledger reconciliation',
        'Overtime (OT) hour tracking and muster variance checks',
        'Direct sync with Universal DPR Manpower tables (A1, A2, A11)',
      ],
      previewStats: {
        activeWorkers: '78 Logged',
        tradesLogged: '6 Trades Active',
        agenciesVerified: 'Apex Builders & Metro Infra',
      }
    },
    {
      id: 'resource' as ModuleId,
      name: 'Materials & Inventory',
      badge: 'Section A3 & B5',
      icon: Package,
      headline: 'Weighbridge Ticket OCR & Daily Consumption Ledger',
      description: 'Snap photos of paper delivery challans, weighbridge slips, and batch plant receipts. SiteReport AI extracts supplier names, batch grades, and quantities to maintain opening, received, consumed, and closing stock balances with zero manual data entry.',
      image: 'https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3d/6a477a907ec77946de27d82b_service9.webp',
      fallbackImage: '/hero-bg-3.jpg',
      kpis: [
        { label: 'Challan OCR Speed', value: '< 2 Sec' },
        { label: 'Stock Reconciled', value: '₹14L/Site' },
        { label: 'Shortage Alerts', value: 'Real-Time' },
      ],
      features: [
        'Instant OCR extraction for paper challans and batch tickets',
        'Opening, received, consumed, and closing stock ledger (B5)',
        'Automatic minimum buffer alerts for cement, rebar, and aggregate',
        'Material wastage reconciliation calculation (Universal MPR C5)',
      ],
      previewStats: {
        activeWorkers: 'Cement: 480 Bags',
        tradesLogged: 'Rebar: 42.5 MT',
        agenciesVerified: 'Ultratech & Tata Tiscon',
      }
    },
    {
      id: 'equipment' as ModuleId,
      name: 'Plant & Machinery',
      badge: 'Section A4 & B6',
      icon: Wrench,
      headline: 'Heavy Fleet Deployment, Fuel Log & Idle Hour Reduction',
      description: 'Track tower cranes, concrete boom pumps, transit mixers, excavators, and generators across all zones. Calculate utilization percentages, monitor breakdown hours, and pinpoint idle machinery before leasing costs escalate.',
      image: 'https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3d/6a477a70e76826537825d65b_service8.webp',
      fallbackImage: '/hero-bg-3.jpg',
      kpis: [
        { label: 'Fleet Utilization', value: '87.4%' },
        { label: 'Idle Cost Saved', value: '₹4.2L/Mo' },
        { label: 'Breakdown MTTR', value: '< 3.5 Hrs' },
      ],
      features: [
        'Available, Working, and Idle machine tracking (A4)',
        'Weekly equipment utilization matrix (B6)',
        'Fuel delivery and hourly consumption auditing',
        'Preventative maintenance schedules and operator rosters',
      ],
      previewStats: {
        activeWorkers: '9 Machinery Units',
        tradesLogged: '184 Engine Hours',
        agenciesVerified: 'Tower Crane & Transit Mixers',
      }
    },
    {
      id: 'cost' as ModuleId,
      name: 'Cost & EVM Analytics',
      badge: 'Section A12 & B12',
      icon: TrendingUp,
      headline: 'Earned Value Management (EVM), CPI, SPI & Budget Variance',
      description: 'Replace delayed month-end accounting spreadsheets with live financial tracking. Automatically compute Planned Value (PV), Earned Value (EV), and Actual Cost (AC) to plot daily Cost Performance Index (CPI) and Schedule Performance Index (SPI) curves.',
      image: '/hero-bg-3.jpg',
      fallbackImage: '/hero-bg.png',
      kpis: [
        { label: 'CPI Accuracy', value: '1.04 (+4%)' },
        { label: 'SPI Velocity', value: '0.98' },
        { label: 'EAC Forecast', value: 'On-Track' },
      ],
      features: [
        'Cost head tracking: Labour, Material, Equipment, Overheads',
        'Daily budget vs actual variance tracking (A12 & B12)',
        'Earned Value curves for milestone billing and bank reporting',
        'Subcontractor measurement sheet verification and retention fund logs',
      ],
      previewStats: {
        activeWorkers: '₹34.2L Budgeted',
        tradesLogged: '₹32.8L Actual',
        agenciesVerified: 'EVM CPI 1.04 (Under Budget)',
      }
    },
    {
      id: 'reports' as ModuleId,
      name: 'Universal Reports Engine',
      badge: 'DPR • WPR • MPR',
      icon: FileText,
      headline: 'Certified 11-Page Universal Template with Automated Rollups',
      description: 'Generate certified Daily (DPR A1–A13), Weekly (WPR B1–B14), and Monthly (MPR C1–C15) progress reports adhering strictly to official civil engineering formats. Includes automatic Mon–Sun manpower grids, material closing stock, and ReportLab PDF downloads.',
      image: '/hero-bg.png',
      fallbackImage: '/hero-bg-3.jpg',
      kpis: [
        { label: 'Generation Speed', value: '1-Click' },
        { label: 'Template Compliance', value: '100%' },
        { label: 'Auto-Rollup Synthesis', value: 'Instant' },
      ],
      features: [
        'Complete Daily Progress Report coverage across Sections A1 to A13',
        'Automatic Weekly Progress Report rollup with Mon–Sun grid (B1–B14)',
        'Monthly Executive Synthesis with reconciliation and wastage (C1–C15)',
        'Navy-header certified ReportLab PDF export with zero empty rows',
      ],
      previewStats: {
        activeWorkers: '19 Daily Logs',
        tradesLogged: '2 Weekly Rollups',
        agenciesVerified: 'Official PDF Certified',
      }
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Multilingual Field Capture',
      desc: 'Field engineers and supervisors record audio notes in Hindi, Marathi, or English directly on mobile, or snap photos of paper delivery challans and batch tickets.',
      icon: Mic,
      tag: 'Voice & OCR'
    },
    {
      step: '02',
      title: 'Zero-Hallucination AI Structuring',
      desc: 'Groq-powered multimodal models extract trades, material quantities, and equipment uptime strictly according to the Universal DPR schema. Unmentioned metrics remain untouched.',
      icon: Cpu,
      tag: 'Precision Engine'
    },
    {
      step: '03',
      title: 'Auto-Rollup & Synthesis',
      desc: 'Daily logs are saved in the persistent database and automatically roll up into 7-day Mon–Sun manpower trends (WPR) and 4-week cumulative progress reconciliation (MPR).',
      icon: Activity,
      tag: 'Automated Matrix'
    },
    {
      step: '04',
      title: 'Certified Universal PDF Export',
      desc: 'Download certified, publication-grade PDFs with navy headers, structured data grids, and cryptographic verification stamps ready for clients, architects, and lenders.',
      icon: Award,
      tag: 'Official Standard'
    },
  ];

  const featuredProjects = [
    {
      title: 'Apex Commercial High-Rise Tower',
      location: 'Bandra-Kurla Complex (BKC), Mumbai',
      timeline: '2024 - 2026',
      status: 'In Progress • Floor 28 Casting',
      stats: '128 Daily DPRs • 18 Weekly Rollups',
      desc: 'Full-cycle site intelligence monitoring multi-agency slab pours, tower crane deployment, and biometric muster roll for a 34-story grade-A commercial development.',
      image: 'https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3d/6a8e62dcc2ff1bd08bff2f56_Project%202.webp',
      fallback: '/hero-bg-2.jpg',
      tag: 'Commercial High-Rise'
    },
    {
      title: 'Titan Expressway Flyover Corridor',
      location: 'Pune-Nashik Highway Sector 4',
      timeline: '2023 - 2025',
      status: 'Delivered • Final Rebar Punchlist',
      stats: '342 Daily DPRs • 48 Weekly Rollups',
      desc: 'Heavy civil infrastructure package spanning 18km of elevated highway. Tracked precast girder dispatch, batch plant delivery tickets, and EVM cost performance.',
      image: 'https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3d/6a8e62be9b4e7b20e7943a17_Project%203.webp',
      fallback: '/hero-bg.png',
      tag: 'Heavy Infrastructure'
    },
    {
      title: 'NovaTech Precast Industrial Park',
      location: 'Sanand Industrial Estate, Gujarat',
      timeline: '2024 - 2026',
      status: 'Active • Precast Girder Erection',
      stats: '85 Daily DPRs • 12 Weekly Rollups',
      desc: 'Automated fabrication and delivery tracking for 40,000 sq.m of precast industrial manufacturing facilities with live weighbridge challan scanning.',
      image: 'https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3d/6a8e62a837efc33969e45fa7_Project%204.webp',
      fallback: '/hero-bg-3.jpg',
      tag: 'Precast & Industrial'
    },
  ];

  const testimonials = [
    {
      quote: "The level of precision, technical accuracy, and reporting efficiency truly transformed our site operations. Daily logs that previously took our field engineers 90 minutes of paperwork are now generated in 30 seconds via voice note, perfectly formatted into the 11-page Universal template.",
      author: "Rajeshwar Patil",
      title: "Vice President of Infrastructure, Metro Builders Corp.",
      avatar: "https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a57405aa4a725f72a8ea726_Image_client1.webp",
      sites: "8 Active Sites",
      rating: 5
    },
    {
      quote: "Before SiteReport AI, reconciling weekly subcontractor bills against actual muster roll attendance was a multi-day dispute. Now, with Mon–Sun manpower trends and material closing stocks auto-synthesized, our variance is virtually zero.",
      author: "Siddharth Deshmukh",
      title: "Chief Project Engineer, Apex Infra Projects",
      avatar: "https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a57405ac797add4d407bdfc_Image_client2.webp",
      sites: "12 Active Sites",
      rating: 5
    },
    {
      quote: "The zero-hallucination guarantee is real. If our site supervisor doesn't mention equipment or safety incidents, the AI leaves those sections completely blank rather than fabricating fake entries. Our clients and architects trust these reports implicitly.",
      author: "Col. Sanjeev Mehra",
      title: "Managing Director, Sterling Structural Systems",
      avatar: "https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a57405a131277243167bd07_Image_client3.webp",
      sites: "5 Active Sites",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'Does SiteReport AI work directly on mobile phones on active construction sites?',
      a: 'Yes. SiteReport AI is engineered as an ultra-fast progressive web platform optimized for low-bandwidth mobile browsers on site. Field supervisors and project engineers can dictate voice notes, photograph paper delivery challans, and review generated reports directly on their phones without carrying laptops.'
    },
    {
      q: 'Which regional languages and construction dialects are supported for voice notes?',
      a: 'SiteReport AI natively supports Hindi (हिंदी), Marathi (मराठी), and Indian English (EN-IN). The voice pipeline accurately interprets construction terminology and mixed dialects (e.g., "Aaj 25 Mason aur 18 Barbender aye the, 400 bag Ultratech cement unloading hua, Tower crane 7 ghante chala, 4th floor slab pour on track").'
    },
    {
      q: 'How does the system ensure zero hallucination in daily progress reports?',
      a: 'Our Groq LLM extraction prompt enforces strict civil engineering constraints: if an entity, trade headcount, equipment hour, or safety incident is not explicitly mentioned by the speaker, it remains completely untouched ([] or null). The UI and ReportLab PDF generator suppress empty sections automatically.'
    },
    {
      q: 'How do Weekly (WPR) and Monthly (MPR) auto-rollups work?',
      a: 'As daily reports (DPRs) are saved in the persistent SQLite database, the rollup engine aggregates them into a comprehensive 7-day Mon–Sun manpower grid (Section B4), calculates material opening/received/consumed/closing balances (Section B5), and summarizes equipment utilization (Section B6). You can also generate rollups on demand with 1 click.'
    },
    {
      q: 'Can we generate certified PDFs for clients, lenders, and architects?',
      a: 'Yes. Every Daily (DPR), Weekly (WPR), and Monthly (MPR) report can be exported in 1 click as a publication-grade PDF matching the exact 11-page Universal Site Progress Report template with navy headers, structured data grids, and ISO compliance.'
    },
    {
      q: 'How does the Delivery Challan OCR handle stamped and handwritten paper slips?',
      a: 'Our vision pipeline handles crumpled, carbon-copy, and handwritten delivery challans from all major suppliers including Ultratech, ACC, Tata Tiscon, JSW, and local RMC suppliers. It extracts supplier name, ticket ID, grade, and weight metrics in under 2 seconds.'
    }
  ];

  const currentModule = modulesShowcase.find(m => m.id === activeModuleTab) || modulesShowcase[0];

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] selection:bg-[#FF5E14] selection:text-white font-sans antialiased">
      
      {/* 1. TOP INDUSTRIAL INFO & NOTICE BAR (Steelora Style) */}
      <div className="bg-[#05070B] border-b border-white/5 py-2 px-4 lg:px-10 text-[11px] text-neutral-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Direct Support: +91 (020) 6680-2400</span>
            </span>
            <span className="hidden md:flex items-center gap-2 text-neutral-300">
              <Mail className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Operations: contact@sitereport.ai</span>
            </span>
            <span className="hidden lg:flex items-center gap-2 text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Engineering Hub: Pune • Mumbai, India</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-emerald-400 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>UNIVERSAL TEMPLATE V2 • ONLINE</span>
            </div>
            <button
              onClick={() => onLaunchApp('reports')}
              className="hover:text-white transition-colors cursor-pointer text-[10px] font-semibold text-neutral-300 underline underline-offset-4"
            >
              Reports Center
            </button>
          </div>
        </div>
      </div>

      {/* 2. STICKY GLASS NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#080B11]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-10 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SiteReportLogo isDark={true} size="md" />
            <div className="hidden sm:block border-l border-white/15 pl-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                INDUSTRIAL INTELLIGENCE
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <a href="#hero" className="hover:text-[#FF5E14] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#FF5E14] transition-colors">Capabilities</a>
            <a href="#modules" className="hover:text-[#FF5E14] transition-colors">Field Modules</a>
            <a href="#workflow" className="hover:text-[#FF5E14] transition-colors">Workflow</a>
            <a href="#projects" className="hover:text-[#FF5E14] transition-colors">Projects</a>
            <a href="#estimator" className="hover:text-[#FF5E14] transition-colors">Estimator</a>
            <a href="#faq" className="hover:text-[#FF5E14] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-voice-log-btn"
              onClick={() => onOpenAIModal('voice')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Voice Note</span>
            </button>
            <button
              id="landing-get-started-btn"
              onClick={() => onLaunchApp('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5E14] hover:bg-[#e04f0f] text-white font-bold rounded-full text-xs shadow-lg shadow-[#FF5E14]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION (Steelora Split Layout with Industrial Imagery) */}
      <section id="hero" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF5E14]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Subtitle Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#FF5E14]/30 bg-[#FF5E14]/10 text-[#FF5E14] text-xs font-semibold tracking-wide">
              <Cpu className="w-3.5 h-3.5" />
              <span>SiteReport AI Construction Intelligence & Field Operations</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Built on Strength.<br />
              Driven by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E14] to-[#f9921e]">Intelligence</span>.<br />
              Focused on Precision.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-neutral-300 max-w-xl font-normal leading-relaxed">
              Transform raw field voice notes, weighbridge challan scans, and multi-trade logs into certified Daily (DPR), Weekly (WPR), and Monthly (MPR) reports in seconds with zero manual overhead.
            </p>

            {/* Value Checklist (Steelora Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-neutral-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5E14] shrink-0" />
                <span>Reliable Daily Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5E14] shrink-0" />
                <span>Strict Zero-Hallucination</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FF5E14] shrink-0" />
                <span>Hindi • Marathi • English</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                id="hero-analyze-report-btn"
                onClick={() => onLaunchApp('dashboard')}
                className="px-7 py-3.5 bg-[#FF5E14] hover:bg-[#e04f0f] text-white font-bold rounded-full text-xs sm:text-sm shadow-xl shadow-[#FF5E14]/25 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Analyze Report / Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onOpenAIModal('voice')}
                className="px-6 py-3.5 bg-[#121622] hover:bg-[#1a2030] text-white border border-white/15 hover:border-white/25 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#FF5E14]" />
                <span>+ Voice Field Log</span>
              </button>
            </div>

            {/* Quick Live Preview Bar */}
            <div className="pt-3 flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE DATABASE: 19 Daily DPRs • 2 Weekly WPRs • 2 Monthly MPRs Loaded</span>
            </div>
          </div>

          {/* Right Column: Steelora Interactive Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0F1420] shadow-2xl group">
              {/* Image with dark gradient overlays */}
              <div className="relative h-[380px] sm:h-[460px] w-full overflow-hidden">
                <img 
                  src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a43d65d395aa260e1ac14d8_home-intro-video.webp"
                  onError={(e) => { e.currentTarget.src = '/hero-bg-3.jpg'; }}
                  alt="Industrial construction engineering site with welding sparks and steel infrastructure"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Gradient Shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090C12] via-[#090C12]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#090C12]/60 via-transparent to-transparent" />

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#090C12]/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full text-[11px] font-mono text-sky-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>SECTION A1–A13 UNIVERSAL DPR</span>
                </div>

                {/* Corner Precision Metric Badge */}
                <div className="absolute top-4 right-4 z-20 bg-[#FF5E14] text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-lg">
                  99.8% Precision
                </div>

                {/* Bottom Documentary Overlay Box (Steelora Style) */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0D121D]/90 backdrop-blur-md border border-white/15 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onOpenAIModal('voice')}
                      className="w-11 h-11 rounded-full bg-[#FF5E14] hover:bg-[#e04f0f] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer shrink-0"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                        Raw Site Audio to Certified Progress Reports
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        See how speech notes turn into Mon–Sun manpower & material balances
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Certified Universal DPR</span>
                    </span>
                    <button
                      onClick={() => onLaunchApp('reports')}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Sample PDF</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. LIVE INDUSTRIAL METRICS / COUNTER BAR (Steelora Style) */}
      <section className="border-y border-white/10 bg-[#0B0F17] py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          <div className="border-l-2 border-[#FF5E14] pl-4 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">200</span>
              <span className="text-xl font-bold text-[#FF5E14]">+</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Skilled Engineers & Supervisors
            </h4>
            <p className="text-[11px] text-neutral-400">
              Dictating voice logs daily across commercial & civil projects
            </p>
          </div>

          <div className="border-l-2 border-sky-400 pl-4 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">235</span>
              <span className="text-xl font-bold text-sky-400">+</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Infrastructure Sites Monitored
            </h4>
            <p className="text-[11px] text-neutral-400">
              High-rises, expressway corridors, bridges, and industrial parks
            </p>
          </div>

          <div className="border-l-2 border-emerald-400 pl-4 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">72</span>
              <span className="text-xl font-bold text-emerald-400">+</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Suppliers & RMC Plants
            </h4>
            <p className="text-[11px] text-neutral-400">
              Weighbridge delivery challans reconciled with live stock
            </p>
          </div>

          <div className="border-l-2 border-amber-400 pl-4 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">10,000</span>
              <span className="text-xl font-bold text-amber-400">+</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Certified DPRs Generated
            </h4>
            <p className="text-[11px] text-neutral-400">
              100% compliant with the 11-page Universal template
            </p>
          </div>

        </div>
      </section>

      {/* 5. ENGINEERING CAPABILITIES GRID (Steelora "About Company" 3-Column Asymmetric Grid) */}
      <section id="about" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Engineering Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              SiteReport AI: A Trusted Intelligence Platform for Modern Civil Infrastructure
            </h2>
          </div>
          <div>
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-6 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore All Modules</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF5E14]" />
            </button>
          </div>
        </div>

        {/* 3-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Column 1: Featured Precision Card (Large left) */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-white/15 bg-[#0F1420] min-h-[400px] flex flex-col justify-end p-8 group shadow-xl">
            <img 
              src="/hero-bg-2.jpg"
              onError={(e) => { e.currentTarget.src = '/hero-bg-3.jpg'; }}
              alt="Construction site workers and structural steel"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090C12] via-[#090C12]/80 to-transparent" />
            
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF5E14] text-white flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-white leading-snug">
                Delivering Precision AI Field Solutions for High-Rise & Heavy Civil Engineering
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                From morning muster roll to structural slab pour and concrete curing, SiteReport AI connects field logs directly to financial EVM ledgers.
              </p>
              <button
                onClick={() => onLaunchApp('labour')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
              >
                <span>Open Labour Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Two Stacked Feature Cards (Center) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Top Card: High Production Capacity */}
            <div className="rounded-3xl border border-white/15 bg-[#0F1420] p-6 space-y-4 shadow-lg relative overflow-hidden group">
              <div className="h-36 rounded-2xl overflow-hidden relative">
                <img 
                  src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a44ba5f813a1f1954d6d481_home-ab-5.webp"
                  onError={(e) => { e.currentTarget.src = '/hero-bg.png'; }}
                  alt="Structural orange steel framework and stairs"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">High Capacity Multi-Zone Scale</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Engineered to handle small contractor sites and 50+ zone mega projects with automatic zone progress (B2) and plan vs achieved quantities (B3).
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-[#FF5E14]">
                <span>ZONE PRODUCTION • STRUCTURAL AUDIT</span>
              </div>
            </div>

            {/* Bottom Card: Strict Quality Standards */}
            <div className="rounded-3xl border border-white/15 bg-[#0F1420] p-6 space-y-4 shadow-lg relative overflow-hidden group">
              <div className="h-36 rounded-2xl overflow-hidden relative">
                <img 
                  src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a44ba5f07a44b54508497a8_home-ab-4.webp"
                  onError={(e) => { e.currentTarget.src = '/hero-bg-3.jpg'; }}
                  alt="Engineer in hardhat and orange vest with tablet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">Strict Quality & Safety Standards</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  IS-code compliant NCR tracking (A6), critical hindrance logging (A7), and weather impact work stoppage logs (A8) with zero fake data.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[10px] font-mono text-sky-400">
                <span>IS 456 / IS 1786 COMPLIANT • ZERO HALLUCINATION</span>
              </div>
            </div>

          </div>

          {/* Column 3: Stats & Technology Card (Right) */}
          <div className="md:col-span-3 flex flex-col gap-6">
            
            {/* Experience Counter Card (Steelora Style) */}
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#121826] to-[#0A0D15] p-6 space-y-4 shadow-lg text-left">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">25</span>
                <span className="text-2xl font-bold text-[#FF5E14]">+</span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Years of Construction Engineering Heritage
              </h4>
              <p className="text-[11px] text-neutral-400">
                Built by civil structural veterans and AI engineers to handle demanding field operations.
              </p>

              {/* Avatar Stack */}
              <div className="pt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a5f16b703c1c5b4f1910ea5_user-2.webp" onError={(e) => { e.currentTarget.src = '/favicon.svg'; }} alt="Engineer 1" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                  <img src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a5f16b78b0cea880fba9b1a_user-4.webp" onError={(e) => { e.currentTarget.src = '/favicon.svg'; }} alt="Engineer 2" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                  <img src="https://cdn.prod.website-files.com/6a3dff88c7202b0ccbfd8d3b/6a5f16b73ac6868a5930d304_user-3.webp" onError={(e) => { e.currentTarget.src = '/favicon.svg'; }} alt="Engineer 3" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400">50+ Project Leads</span>
              </div>
            </div>

            {/* Top Production Technology Card */}
            <div className="rounded-3xl border border-white/15 bg-[#0F1420] p-6 space-y-4 shadow-lg flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Modern AI Engine</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Groq 120B LLM models, vision OCR parser, and automated multi-period synthesis running 24/7.
                </p>
              </div>

              <button
                onClick={() => onOpenAIModal('voice')}
                className="w-full py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center transition-all cursor-pointer"
              >
                Test Voice Engine
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. 5 CORE INDUSTRIAL FIELD MODULES (Steelora "Our Services" Cards with Real Photos) */}
      <section id="modules" className="py-16 lg:py-24 border-t border-white/10 bg-[#0A0D15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF5E14]/30 bg-[#FF5E14]/10 text-[#FF5E14] text-xs font-semibold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Field Solutions</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                5 Core Modules Engineered for Construction Sites
              </h2>
              <p className="text-sm text-neutral-400">
                Explore how SiteReport AI governs every operational pillar of your construction project — from morning muster roll to heavy machinery, concrete batches, and Universal DPR, WPR & MPR rollups.
              </p>
            </div>

            {/* Quick Action Button */}
            <div>
              <button
                onClick={() => onLaunchApp('reports')}
                className="px-6 py-2.5 rounded-full bg-[#FF5E14] hover:bg-[#e04f0f] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#FF5E14]/20"
              >
                <span>Launch Reports Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10 border-b border-white/10">
            {modulesShowcase.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModuleTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleTab(mod.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#FF5E14] text-white border-[#FF5E14] shadow-lg shadow-[#FF5E14]/20'
                      : 'bg-[#0E121B] text-neutral-400 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mod.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-white' : 'bg-white/5 text-neutral-400'}`}>
                    {mod.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Module Showcase Card (Steelora Style with Real Image) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl border border-white/15 bg-[#0F1420] overflow-hidden p-6 sm:p-10 shadow-2xl">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] flex items-center justify-center">
                    <currentModule.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF5E14] font-bold">
                      {currentModule.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      {currentModule.name}
                    </h3>
                  </div>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-neutral-200">
                  {currentModule.headline}
                </h4>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                  {currentModule.description}
                </p>

                {/* Feature Bullet List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {currentModule.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-[#FF5E14] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI Metrics Bar */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                {currentModule.kpis.map((kpi, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-lg sm:text-xl font-extrabold text-white">{kpi.value}</div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onLaunchApp(currentModule.id)}
                  className="px-6 py-3 bg-[#FF5E14] hover:bg-[#e04f0f] text-white font-bold rounded-full text-xs shadow-lg shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Launch {currentModule.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Image Showcase Column (Steelora Style) */}
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[320px] lg:min-h-full border border-white/10 bg-[#080B11]">
              <img 
                src={currentModule.image}
                onError={(e) => { e.currentTarget.src = currentModule.fallbackImage; }}
                alt={currentModule.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C12] via-transparent to-transparent opacity-90" />
              
              {/* Floating Stat Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#0F1420]/90 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-1 text-xs">
                <div className="text-[10px] font-mono text-[#FF5E14] font-semibold uppercase">Live Field Ledger</div>
                <div className="font-bold text-white">{currentModule.previewStats.tradesLogged}</div>
                <div className="text-[11px] text-neutral-300">{currentModule.previewStats.agenciesVerified}</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. INTERACTIVE VOICE FIELD LOG DEMO (Preserved from Previous Version) */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#0F1420] to-[#0A0D15] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5E14]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF5E14]/30 bg-[#FF5E14]/10 text-[#FF5E14] text-xs font-semibold">
              <Mic className="w-3.5 h-3.5" />
              <span>Interactive Speech Synthesizer Demo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Test Multilingual Voice Recognition Directly in Your Browser
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Click any sample prompt below to listen to regional field speech. SiteReport AI parses multi-trade rosters, concrete orders, and equipment hours into Universal DPR tables in real-time.
            </p>
          </div>

          {/* Voice Prompt Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {SAMPLE_VOICE_PROMPTS.map((prompt, idx) => (
              <div
                key={idx}
                onClick={() => setActiveVoiceDemo(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  activeVoiceDemo === idx
                    ? 'border-[#FF5E14] bg-[#FF5E14]/10 shadow-lg shadow-[#FF5E14]/10'
                    : 'border-white/10 bg-[#090C12] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{prompt.language}</span>
                  <span className="text-[10px] font-mono uppercase text-[#FF5E14] bg-[#FF5E14]/20 px-2 py-0.5 rounded-full font-bold">
                    {prompt.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 italic line-clamp-3">
                  "{prompt.text}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoice(prompt.text);
                    }}
                    className="flex items-center gap-1.5 text-[#FF5E14] hover:text-[#f9921e] font-bold cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Audio</span>
                  </button>
                  <span className="text-neutral-500 font-mono text-[10px]">{prompt.tradeCount} Trades</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trigger Full Voice Modal Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Powered by Groq 120B with Zero-Hallucination Guardrails</span>
            </div>
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-6 py-2.5 rounded-full bg-[#FF5E14] hover:bg-[#e04f0f] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Your Live Voice Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. ENGINEERING WORKFLOW & PROCESS (Steelora "Work Process" Section) */}
      <section id="workflow" className="py-16 lg:py-24 border-t border-white/10 bg-[#090C12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>Work Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Engineering Workflow Designed for Efficient Construction Projects
              </h2>
              <p className="text-sm text-neutral-400">
                At SiteReport AI, every stage of our workflow is carefully engineered to deliver reliable civil site intelligence with consistent data accuracy and automated rollups.
              </p>
            </div>

            <div>
              <button
                onClick={() => onLaunchApp('reports')}
                className="px-6 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Reports Architecture</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF5E14]" />
              </button>
            </div>
          </div>

          {/* Workflow 4-Step Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {workflowSteps.map((ws, i) => {
              const Icon = ws.icon;
              return (
                <div 
                  key={i} 
                  className="rounded-3xl border border-white/15 bg-[#0F1420] p-6 space-y-4 shadow-lg hover:border-[#FF5E14]/40 transition-colors group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-[#FF5E14]">{ws.step}</span>
                      <span className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 text-neutral-400 px-2 py-0.5 rounded-full">
                        {ws.tag}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center group-hover:bg-[#FF5E14] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{ws.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{ws.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-[#FF5E14] font-semibold">
                    <span>Universal Standard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side Support & ISO Certification Banner (Steelora Style) */}
          <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-[#0F1420] via-[#141B2B] to-[#0F1420] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FF5E14] text-white flex items-center justify-center shadow-lg shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">ISO 9001 Compliant & Universal DPR Certified</h4>
                <p className="text-xs text-neutral-400">
                  Built to satisfy client audit requirements, architect inspections, and banking draw schedules.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onLaunchApp('dashboard')}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Connect Your Project
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 9. FEATURED CIVIL INFRASTRUCTURE PROJECTS (Steelora "Our Projects" Section) */}
      <section id="projects" className="py-16 lg:py-24 border-t border-white/10 bg-[#0B0F17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-400/10 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                <Building className="w-3.5 h-3.5" />
                <span>Monitored Projects</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Delivering Excellence Across Landmark Construction Sites
              </h2>
              <p className="text-sm text-neutral-400">
                Explore how SiteReport AI powers active high-rises, expressway flyovers, and precast manufacturing hubs with automated Universal progress documentation.
              </p>
            </div>

            <div>
              <button
                onClick={() => onLaunchApp('reports')}
                className="px-6 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View All 235 Sites</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          </div>

          {/* 3 Large Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((proj, i) => (
              <div 
                key={i} 
                className="rounded-3xl border border-white/15 bg-[#0F1420] overflow-hidden shadow-xl hover:border-sky-400/40 transition-colors flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={proj.image}
                    onError={(e) => { e.currentTarget.src = proj.fallback; }}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1420] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-[#080B11]/80 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[10px] font-mono text-sky-400">
                    {proj.tag}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{proj.status}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-[#FF5E14] shrink-0" />
                      <span>{proj.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{proj.timeline}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed pt-2">
                      {proj.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-neutral-400">{proj.stats}</span>
                    <button
                      onClick={() => onLaunchApp('reports')}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Reports</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. INTERACTIVE ROI VALUE ESTIMATOR (Preserved from Previous Version) */}
      <section id="estimator" className="py-16 lg:py-24 border-t border-white/10 bg-[#0A0D15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#0F1420] to-[#0A0D15] p-6 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-semibold">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Interactive ROI Value Estimator</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Calculate Your Project Time & Cost Savings
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  Adjust your active site portfolio to see how automated multilingual voice logging, challan OCR, and universal auto-rollups eliminate non-productive site administration.
                </p>

                {/* Slider 1: Total Project Size */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-300">Total Portfolio Value</span>
                    <span className="text-[#FF5E14] font-mono">₹{projectSizeCr} Crores</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={projectSizeCr}
                    onChange={(e) => setProjectSizeCr(Number(e.target.value))}
                    className="w-full accent-[#FF5E14] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>₹5 Cr</span>
                    <span>₹250 Cr</span>
                    <span>₹500 Cr</span>
                  </div>
                </div>

                {/* Slider 2: Number of Active Sites */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-neutral-300">Active Site Locations</span>
                    <span className="text-sky-400 font-mono">{numSites} Sites</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={numSites}
                    onChange={(e) => setNumSites(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>1 Site</span>
                    <span>10 Sites</span>
                    <span>20 Sites</span>
                  </div>
                </div>

                <button
                  onClick={onLaunchEstimator}
                  className="px-6 py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold rounded-full text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Open Full Construction Estimator</span>
                </button>
              </div>

              {/* Savings Output Cards */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-6 rounded-2xl border border-white/10 bg-[#080B11] space-y-2">
                  <Clock className="w-6 h-6 text-[#FF5E14]" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{estimatedDaysSaved} Days</div>
                  <h4 className="text-xs font-bold text-neutral-200">Engineer Time Saved Yearly</h4>
                  <p className="text-[11px] text-neutral-400">
                    No more manual spreadsheets or evening paperwork slogs.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-[#080B11] space-y-2">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{estimatedCostSavedLakhs} Lakhs</div>
                  <h4 className="text-xs font-bold text-neutral-200">Wastage & Dispute Reduction</h4>
                  <p className="text-[11px] text-neutral-400">
                    Eliminates ghost muster rolls and inaccurate concrete batches.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-[#080B11] space-y-2 sm:col-span-2">
                  <Wrench className="w-6 h-6 text-sky-400" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{idleMachinerySavedLakhs} Lakhs/Yr</div>
                  <h4 className="text-xs font-bold text-neutral-200">Idle Machinery Fleet Optimization</h4>
                  <p className="text-[11px] text-neutral-400">
                    Cuts unmonitored crane, transit mixer, and generator standby charges.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 11. CLIENT TESTIMONIAL & EXECUTIVE QUOTES (Steelora Slider Style) */}
      <section className="py-16 lg:py-24 border-t border-white/10 bg-[#090C12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Client Feedback</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Feedback from Our Civil Engineering Clients
              </h2>
            </div>

            {/* Testimonial Nav Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    activeTestimonial === i ? 'bg-[#FF5E14] w-6' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="rounded-3xl border border-white/15 bg-[#0F1420] p-8 sm:p-12 shadow-2xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-6 text-left">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-neutral-400 ml-2">(5.0 Verified Feedback)</span>
                </div>

                <blockquote className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                  <img 
                    src={testimonials[activeTestimonial].avatar}
                    onError={(e) => { e.currentTarget.src = '/favicon.svg'; }}
                    alt={testimonials[activeTestimonial].author}
                    className="w-12 h-12 rounded-full border border-[#FF5E14] object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{testimonials[activeTestimonial].author}</h4>
                    <p className="text-xs text-neutral-400">{testimonials[activeTestimonial].title}</p>
                  </div>
                </div>
              </div>

              {/* Side Metric Card */}
              <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#080B11] p-6 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Active Deployment</h4>
                <p className="text-xs text-neutral-400">
                  Deployed across {testimonials[activeTestimonial].sites} with certified daily reporting.
                </p>
                <button
                  onClick={() => onLaunchApp('dashboard')}
                  className="w-full mt-2 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  View Deployment Stats
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS (Steelora Style with Dark Accordion) */}
      <section id="faq" className="py-16 lg:py-24 border-t border-white/10 bg-[#0B0F17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Common Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions About SiteReport AI
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-[#0F1420] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-white hover:text-[#FF5E14] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#FF5E14] shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-neutral-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 13. BOTTOM CALL-TO-ACTION BANNER (Steelora Style) */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-[#0F1420] via-[#161D2E] to-[#0F1420] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Let's Make Site Reporting Effortless
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Eliminate evening paperwork, prevent ghost muster rolls, and generate certified Universal DPR, WPR & MPR reports in seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-8 py-3.5 bg-[#FF5E14] hover:bg-[#e04f0f] text-white font-bold rounded-full text-xs sm:text-sm shadow-xl shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Workspace Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <Mic className="w-4 h-4 text-[#FF5E14]" />
              <span>Record Live Voice Log</span>
            </button>
          </div>
        </div>
      </section>

      {/* 14. PROFESSIONAL INDUSTRIAL FOOTER */}
      <footer className="border-t border-white/10 bg-[#05070B] py-12 px-4 sm:px-6 lg:px-10 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3 md:col-span-1">
            <SiteReportLogo isDark={true} size="md" />
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Universal Site Progress Report platform powered by Groq LLM speech intelligence and multimodal OCR.
            </p>
            <div className="text-[10px] font-mono text-[#FF5E14]">
              UNIVERSAL DPR • WPR • MPR V2.0
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Field Solutions</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => onLaunchApp('labour')} className="hover:text-white transition-colors cursor-pointer">Labour & Muster Roll</button></li>
              <li><button onClick={() => onLaunchApp('resource')} className="hover:text-white transition-colors cursor-pointer">Materials & Challan OCR</button></li>
              <li><button onClick={() => onLaunchApp('equipment')} className="hover:text-white transition-colors cursor-pointer">Plant & Fleet Utilization</button></li>
              <li><button onClick={() => onLaunchApp('cost')} className="hover:text-white transition-colors cursor-pointer">Earned Value Management (EVM)</button></li>
              <li><button onClick={() => onLaunchApp('reports')} className="hover:text-white transition-colors cursor-pointer">Universal Reports Center</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Universal Standards</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Section A1–A13 Daily Progress Report (DPR)</li>
              <li>Section B1–B14 Weekly Progress Report (WPR)</li>
              <li>Section C1–C15 Monthly Progress Report (MPR)</li>
              <li>Mon–Sun Daily Manpower Grid (B4)</li>
              <li>Material Balance & Wastage Reconciliation (B5 & C5)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Contacts</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>+91 (020) 6680-2400</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>contact@sitereport.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>Pune / Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} SiteReport AI. All rights reserved. Zero-hallucination certified.
          </div>
          <div className="flex items-center gap-4">
            <a href="#hero" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#hero" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#hero" className="hover:text-white transition-colors">Security Standards</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
