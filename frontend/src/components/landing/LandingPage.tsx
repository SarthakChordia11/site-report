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
  ChevronRight,
  Settings,
  Share2,
  Menu,
  X
} from 'lucide-react';
import { SiteReportLogo } from '../common/SiteReportLogo';
import { SAMPLE_VOICE_PROMPTS } from '../../utils/aiParser';
import type { ModuleId } from '../../types';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const servicesShowcase = [
    {
      id: 'labour' as ModuleId,
      title: 'Labour & Muster Roll Intelligence',
      subtitle: 'Section A1 & A2',
      image: '/steelora/service1.webp',
      fallbackImage: '/hero-bg-2.jpg',
      icon: Users,
      bullets: [
        'Multilingual speech attendance (Hindi, Marathi, English)',
        'Subcontractor agency billing ledger reconciliation',
        'Overtime (OT) hours calculation & biometric sync'
      ]
    },
    {
      id: 'resource' as ModuleId,
      title: 'Materials & Delivery Challan OCR',
      subtitle: 'Section A3 & B5',
      image: '/steelora/service2.webp',
      fallbackImage: '/hero-bg-3.jpg',
      icon: Package,
      bullets: [
        'Instant OCR extraction for paper challans and batch tickets',
        'Opening, received, consumed, and closing stock ledger (B5)',
        'Material wastage reconciliation calculation (Universal MPR C5)'
      ]
    },
    {
      id: 'equipment' as ModuleId,
      title: 'Plant, Machinery & Fleet Utilization',
      subtitle: 'Section A4 & B6',
      image: '/steelora/service3.webp',
      fallbackImage: '/hero-bg-3.jpg',
      icon: Wrench,
      bullets: [
        'Available, Working, and Idle machine tracking (A4)',
        'Weekly equipment utilization matrix (B6)',
        'Fuel delivery and hourly engine consumption auditing'
      ]
    },
    {
      id: 'cost' as ModuleId,
      title: 'Earned Value Management (EVM)',
      subtitle: 'Section A12 & B12',
      image: '/steelora/service4.webp',
      fallbackImage: '/hero-bg.png',
      icon: TrendingUp,
      bullets: [
        'Cost heads: Labour, Material, Equipment, Overheads',
        'Live CPI, SPI, and predictive EAC performance curves',
        'Subcontractor measurement sheet verification'
      ]
    },
    {
      id: 'reports' as ModuleId,
      title: 'Universal Progress Reports Engine',
      subtitle: 'DPR • WPR • MPR',
      image: '/steelora/service5.webp',
      fallbackImage: '/hero-bg-3.jpg',
      icon: FileText,
      bullets: [
        'Complete Daily Progress Report coverage across A1 to A13',
        'Automatic Weekly Progress Report rollup with Mon–Sun grid (B1–B14)',
        'Publication-grade ReportLab PDF export with zero empty rows'
      ]
    }
  ];

  const faqs = [
    {
      q: 'Does SiteReport AI work on mobile phones directly on construction sites?',
      a: 'Yes. SiteReport AI is fully responsive and engineered for low-bandwidth mobile browsers on active sites. Field supervisors and engineers can dictate voice notes, photograph paper delivery challans, and review generated reports directly on their phones without laptops.'
    },
    {
      q: 'Which Indian regional languages and dialects are supported for voice input?',
      a: 'SiteReport AI natively supports Hindi (हिंदी), Marathi (मराठी), and Indian English (EN-IN). The AI interprets mixed construction vernacular effortlessly (e.g. "25 Mason aye the, 400 bag cement unloading hua, Tower crane 8 ghante chala").'
    },
    {
      q: 'How does the Delivery Challan OCR handle handwritten or stamped paper slips?',
      a: 'Our multimodal vision pipeline handles crumpled, stamped, and handwritten delivery challans from all major suppliers (Ultratech, ACC, Tata Tiscon, JSW). It extracts supplier names, batch IDs, and quantities in under 2 seconds.'
    },
    {
      q: 'Can we calculate Earned Value Management (EVM) for specific project phases?',
      a: 'Yes. SiteReport AI automatically computes Planned Value (PV), Earned Value (EV), and Actual Cost (AC) to deliver daily Cost Performance Index (CPI) and Schedule Performance Index (SPI) curves and forecasts.'
    },
    {
      q: 'Can we export reports to PDF and share with clients and architects?',
      a: 'Absolutely. You can generate certified Daily Progress Reports (DPRs), weekly rollups (WPRs), and monthly summaries (MPRs) in 1 click, formatted to the official 11-page Universal template with navy headers and zero empty rows.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#111624] font-sans antialiased selection:bg-[#FF5E14] selection:text-white">

      {/* ============================================================================== */}
      {/* 1. FLOATING PURE WHITE NAVBAR                                                  */}
      {/* ============================================================================== */}
      <div className="sticky top-0 z-50 py-3 sm:py-4 px-3 sm:px-6 lg:px-10 bg-[#161A22]/20 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto bg-white rounded-full px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-xl border border-neutral-200/80">
          
          {/* Logo with Orange Gear */}
          <div className="flex items-center gap-2">
            <SiteReportLogo isDark={false} size="md" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold uppercase tracking-wider text-[#111624]">
            <a href="#hero" className="hover:text-[#FF5E14] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#FF5E14] transition-colors">About Us</a>
            <a href="#services" className="hover:text-[#FF5E14] transition-colors">Solutions</a>
            <a href="#why-choose" className="hover:text-[#FF5E14] transition-colors">Why Choose Us</a>
            <a href="#faq" className="hover:text-[#FF5E14] transition-colors">FAQ</a>
          </div>

          {/* Solid Orange Pill Button + Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="hidden sm:inline">Launch Site Dashboard</span>
              <span className="sm:hidden">Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-full hover:bg-neutral-100 text-[#111624] transition-colors cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5 text-[#FF5E14]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-3xl p-5 shadow-2xl animate-in fade-in space-y-4 text-left">
            <div className="flex flex-col space-y-2 text-xs font-bold uppercase tracking-wider text-[#111624]">
              <a 
                href="#hero" 
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Home
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                About Us
              </a>
              <a 
                href="#services" 
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Solutions
              </a>
              <a 
                href="#why-choose" 
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Why Choose Us
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileNavOpen(false)}
                className="p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                FAQ
              </a>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onLaunchApp('dashboard');
                }}
                className="w-full py-3 bg-[#FF5E14] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Dashboard App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onLaunchEstimator();
                }}
                className="w-full py-3 bg-[#111624] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Cost Estimator</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================================== */}
      {/* 2. FULL-BLEED ARCHITECTURAL & ENGINEERING PLANNING HERO SECTION                */}
      {/* ============================================================================== */}
      <section id="hero" className="relative -mt-[80px] sm:-mt-[88px] pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-36 min-h-[580px] sm:min-h-[660px] lg:min-h-[700px] flex items-center overflow-hidden">
        
        {/* Full-Bleed Engineering Planning Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/steelora/hero-planning.webp" 
            onError={(e) => { e.currentTarget.src = '/steelora/hero-planning.jpg'; }}
            alt="Construction engineers and architects collaborating over architectural drawings and site blueprints"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark Overlay matching SiteReport theme for high text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full">
          <div className="max-w-3xl lg:max-w-4xl space-y-7 text-left">
            
            {/* Subtitle Badge with Gear */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161A24]/90 border border-white/20 text-neutral-200 text-xs font-semibold backdrop-blur-sm">
              <Settings className="w-3.5 h-3.5 text-[#FF5E14] animate-spin" style={{ animationDuration: '8s' }} />
              <span>AI Construction Operations & DPR Platform</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
              AI-Powered<br />
              Site Management<br />
              Zero Manual DPRs
            </h1>

            {/* Checklist */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-neutral-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white font-bold" />
                <span>Multilingual Voice Attendance</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white font-bold" />
                <span>Delivery Challan OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white font-bold" />
                <span>Universal DPR Engine (A1–A13)</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                id="hero-analyze-report-btn"
                onClick={() => onLaunchApp('dashboard')}
                className="px-8 py-4 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#FF5E14]/30 flex items-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Launch Site Dashboard</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 4. ASYMMETRIC ABOUT / CAPABILITIES GRID (Matching Screenshot 2 - Light Cream) */}
      {/* ============================================================================== */}
      <section id="about" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        
        {/* Header Block matching Screenshot 2 */}
        <div className="space-y-4 mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161A24] text-white text-xs font-semibold">
            <Settings className="w-3.5 h-3.5 text-[#FF5E14]" />
            <span>Platform Capabilities</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111624] tracking-tight leading-[1.15] max-w-3xl">
              SiteReport AI: The Intelligent Operating System for Modern Construction Sites & Progress Tracking
            </h2>

            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-7 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer self-start lg:self-auto shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Explore Core Modules</span>
            </button>
          </div>
        </div>

        {/* The Exact 3-Column Asymmetric Layout from Screenshot 2 - Aligned Heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* COLUMN 1: Tall Dark Card + White Card */}
          <div className="flex flex-col gap-6">
            
            {/* Card 1: Tall Dark Card with Orange Pipes */}
            <div className="bg-[#111624] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[400px] md:h-[460px] shadow-lg group">
              <div className="space-y-6 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                  Instant Multilingual<br />Voice Logging & Daily<br />Progress Automation
                </h3>
                <button
                  onClick={() => onLaunchApp('dashboard')}
                  className="px-6 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Try Live Voice</span>
                </button>
              </div>

              {/* Orange Pipes Photo on Bottom */}
              <div className="relative h-48 sm:h-52 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 mt-4 overflow-hidden">
                <img 
                  src="/steelora/pipes.webp"
                  onError={(e) => { e.currentTarget.src = '/hero-bg-2.jpg'; }}
                  alt="Construction infrastructure materials"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Card 2: High Production Capacity Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between min-h-[190px] h-auto text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#111624]">Labour & Muster Roll Intelligence</h4>
                  {/* 3 Circle Masked Graphic */}
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user1.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user2.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user3.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Multilingual speech attendance tracking trade headcounts, overtime (OT), custom daily wages, and subcontractor agency reconciliation in real time.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200/80 flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Attendance</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Muster Roll</span>
              </div>
            </div>

          </div>

          {/* COLUMN 2: White Card + Tall Worker Factory Photo */}
          <div className="flex flex-col gap-6">
            
            {/* Card 3: Strict Quality Standards */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between min-h-[190px] h-auto text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#111624]">Delivery Challan OCR & Materials</h4>
                  {/* 3 Circle Masked Graphic */}
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user2.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user1.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user3.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Multimodal OCR digitizes handwritten paper challans from UltraTech, ACC, and Tata Steel, reconciling opening, consumed, and closing stock.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200/80 flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Material OCR</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Stock Ledger</span>
              </div>
            </div>

            {/* Card 4: Worker with Tablet & Industrial Machinery Photo */}
            <div className="rounded-3xl overflow-hidden shadow-md min-h-[320px] md:h-[460px] relative group">
              <img 
                src="/steelora/worker-factory.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg-3.jpg'; }}
                alt="Site engineer in safety gear using tablet on construction job site"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

          {/* COLUMN 3: Tall Sunset Rig with 25+ Overlay + White Card */}
          <div className="flex flex-col gap-6">
            
            {/* Card 5: Sunset Rig with 98% Overlay */}
            <div className="rounded-3xl overflow-hidden shadow-md min-h-[400px] md:h-[460px] relative group flex flex-col justify-end p-5 sm:p-6">
              <img 
                src="/steelora/sunset-rig.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg.png'; }}
                alt="Heavy construction plant against warm evening sky"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Glass Overlay Box matching Screenshot 2 */}
              <div className="relative z-10 bg-[#111624]/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 text-white text-left space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#FF5E14]">98</span>
                  <span className="text-lg sm:text-xl font-bold text-[#FF5E14]">%</span>
                  <span className="text-xs font-bold text-neutral-300 ml-2">DPR Time Saved On Site</span>
                </div>
                <div className="h-px bg-white/15 my-2" />
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Field engineers replace 3-4 hours of manual evening paperwork into certified, publication-grade one-click PDF reports.
                </p>
              </div>
            </div>

            {/* Card 6: EVM Cost Management Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between min-h-[190px] h-auto text-left">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-[#111624]">Earned Value Management (EVM)</h4>
                  {/* 3 Circle Masked Graphic */}
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user3.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user1.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-200 overflow-hidden border border-white">
                      <img src="/steelora/user2.webp" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  Live monitoring of Planned Value (PV), Earned Value (EV), and Actual Cost (AC) with automated CPI/SPI cost variance forecasting.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200/80 flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• EVM Cost</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Cost Forecast</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ============================================================================== */}
      {/* 5. CONSTRUCTION SOLUTIONS WE PROVIDE (Matching Screenshot 3 - Light Cream)    */}
      {/* ============================================================================== */}
      <section id="services" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto border-t border-neutral-300/60">
        
        {/* Header Block matching Screenshot 3 */}
        <div className="space-y-4 mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161A24] text-white text-xs font-semibold">
            <Settings className="w-3.5 h-3.5 text-[#FF5E14]" />
            <span>Core Modules</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111624] tracking-tight">
                Construction Solutions We Provide
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Purpose-built modules engineered for Indian construction projects to eliminate paperwork, streamline field logging, and prevent budget overruns.
              </p>
            </div>

            <button
              onClick={() => onLaunchApp('reports')}
              className="px-7 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer self-start lg:self-auto shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Universal Reports Hub</span>
            </button>
          </div>
        </div>

        {/* Services Cards Grid matching Screenshot 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesShowcase.map((serv) => {
            const Icon = serv.icon;
            return (
              <div 
                key={serv.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200/80 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-shadow"
              >
                {/* Photo on Top */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={serv.image}
                    onError={(e) => { e.currentTarget.src = serv.fallbackImage; }}
                    alt={serv.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating White Card Header Intersecting with Photo */}
                  <div className="absolute -bottom-4 left-4 right-4 bg-white rounded-2xl p-3 shadow-md border border-neutral-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5E14] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="w-px h-6 bg-neutral-200 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-bold text-[#111624] line-clamp-1">
                      {serv.title}
                    </h3>
                  </div>
                </div>

                {/* Card Bottom Body */}
                <div className="p-6 pt-8 space-y-5 text-left flex-1 flex flex-col justify-between">
                  <ul className="space-y-2.5 text-xs text-neutral-600">
                    {serv.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-neutral-800 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Solid Black Button: Learn Details with Arrow */}
                  <button
                    onClick={() => onLaunchApp(serv.id)}
                    className="w-full bg-[#111624] hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Learn Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ============================================================================== */}
      {/* 6. WHY CHOOSE SITEREPORT AI SECTION (Matching Screenshot 4 - Dark Charcoal)     */}
      {/* ============================================================================== */}
      <section id="why-choose" className="bg-[#111624] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Full-Height Industrial Worker Photo with Glass 150+ Badge */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden relative shadow-2xl min-h-[360px] sm:min-h-[520px] max-h-[640px] border border-white/10 group">
              <img 
                src="/steelora/worker-wcu.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg-2.jpg'; }}
                alt="Construction engineer in safety gear reviewing site progress"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating Glass Badge in Corner: Active Sites Monitored 150+ */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto bg-[#1A1F2D]/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-left shadow-2xl max-w-sm space-y-2 sm:space-y-3">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Sites Monitored</h4>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-extrabold text-white">150</span>
                    <span className="text-lg font-bold text-[#FF5E14]">+</span>
                  </div>
                </div>

                {/* Avatar Group + Plus Icon matching Screenshot 4 */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-2">
                    <img src="/steelora/user1.webp" alt="Avatar 1" className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                    <img src="/steelora/user2.webp" alt="Avatar 2" className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                    <img src="/steelora/user3.webp" alt="Avatar 3" className="w-8 h-8 rounded-full border-2 border-white/30 object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FF5E14] text-white flex items-center justify-center font-bold text-sm shadow-md">
                    +
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Work Process & 4-Grid matching Screenshot 4 */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Orange Pill: Work Process */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E14] text-white text-xs font-bold uppercase tracking-wider shadow-md">
              <Settings className="w-3.5 h-3.5" />
              <span>Intelligent Site Operations</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Why Choose SiteReport AI for Construction Management
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed font-normal">
              Choosing SiteReport AI means equipping your site engineers, project directors, and contractors with automated multilingual voice logging, instant challan OCR, real-time EVM cost tracking, and publication-ready DPR generation.
            </p>

            {/* 4-Grid Feature Icons matching Screenshot 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              
              {/* Box 1: Multilingual Voice AI */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Multilingual Voice AI</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Dictate attendance, material receipts, and machine hours in Hindi, Marathi, or English with automatic structured parsing.
                </p>
              </div>

              {/* Box 2: Universal DPR Engine */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Universal DPR Engine</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Automatic Daily, Weekly, and Monthly rollups formatted to the official universal 11-page standard (A1–A13, B1–B14) in PDF.
                </p>
              </div>

              {/* Box 3: Delivery Challan OCR */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Delivery Challan OCR</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Multimodal vision extracts supplier names, batch IDs, and quantities from stamped and handwritten delivery slips in 2 seconds.
                </p>
              </div>

              {/* Box 4: EVM Cost & Variance */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">EVM Cost & Variance</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time Planned Value (PV), Earned Value (EV), and Actual Cost (AC) analytics with live CPI and SPI predictive curves.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================================== */}
      {/* 7. SIGNATURE FULL-WIDTH VIBRANT SAFETY ORANGE SECTION (Matching Screenshot 5) */}
      {/* ============================================================================== */}
      <section className="bg-[#FF5E14] text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Column 1 (Left): 3 White Stats matching Screenshot 5 */}
          <div className="lg:col-span-4 space-y-8 text-left">
            
            {/* Stat 1: 250+ Active Construction Sites */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">250+</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Active Construction Sites</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  Commercial towers, infrastructure projects, and residential developments managed daily
                </p>
              </div>
            </div>

            {/* Stat 2: 15,000+ Automated DPRs Generated */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">15,000+</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Automated DPRs Generated</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  Publication-grade daily reports created via voice and OCR with zero manual data entry delays
                </p>
              </div>
            </div>

            {/* Stat 3: ₹18 Cr+ Cost Overruns Prevented */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">₹18 Cr+</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Cost Overruns Prevented</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  Saved through real-time EVM cost tracking, material wastage audits, and idle machine alerts
                </p>
              </div>
            </div>

          </div>

          {/* Column 2 (Center): Portrait Cutout of Worker with Wrench matching Screenshot 5 */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative max-w-xs sm:max-w-sm">
              <img 
                src="/steelora/worker-orange.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg-2.jpg'; }}
                alt="Smiling construction engineer in safety helmet on job site"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Column 3 (Right): CEO Quote matching Screenshot 5 */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            <blockquote className="text-base sm:text-lg font-medium text-white leading-relaxed">
              “At SiteReport AI, our mission is to free site engineers from tedious evening paperwork and give project directors 100% real-time visibility into labour muster, material consumption, machinery utilization, and EVM budget performance across every construction site.”
            </blockquote>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Rajesh Sharma</h4>
              <p className="text-xs text-white/80 font-medium">Head of Project Controls, Infrastructure & High-Rise Projects</p>
            </div>

            {/* White Divider */}
            <div className="h-px bg-white/30 my-4" />

            {/* Verification Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
              <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full">Universal DPR Standard</span>
              <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full">RERA Compliant</span>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================================== */}
      {/* 8. INTERACTIVE VOICE FIELD LOG DEMONSTRATION                                    */}
      {/* ============================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-neutral-300 bg-white p-8 sm:p-12 shadow-xl relative overflow-hidden text-left">
          
          <div className="max-w-3xl mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111624] text-white text-xs font-semibold">
              <Mic className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Multilingual Speech Synthesizer Demo</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111624] tracking-tight">
              Test Voice Recognition Directly in Your Browser
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
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
                    ? 'border-[#FF5E14] bg-[#FF5E14]/5 shadow-md'
                    : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111624]">{prompt.language}</span>
                  <span className="text-[10px] font-mono uppercase text-[#FF5E14] bg-[#FF5E14]/15 px-2 py-0.5 rounded-full font-bold">
                    {prompt.label}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 italic line-clamp-3">
                  "{prompt.text}"
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playVoice(prompt.text);
                    }}
                    className="flex items-center gap-1.5 text-[#FF5E14] hover:text-[#E04F0F] font-bold cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Audio</span>
                  </button>
                  <span className="text-neutral-500 font-mono text-[10px]">{prompt.tradeCount} Trades</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200">
            <div className="text-xs text-neutral-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5E14]" />
              <span>Powered by Groq 120B with Zero-Hallucination Guardrails</span>
            </div>
            <button
              onClick={() => onOpenAIModal('voice')}
              className="px-6 py-2.5 rounded-full bg-[#FF5E14] hover:bg-[#E04F0F] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record Live Voice Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 9. ROI ESTIMATOR & VALUE CALCULATOR                                            */}
      {/* ============================================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-neutral-300 bg-[#111624] text-white p-5 sm:p-10 lg:p-14 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                <Calculator className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>Interactive Construction ROI Estimator</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Calculate Your Time & Cost Savings
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Adjust your active site portfolio to see how automated multilingual voice logging, challan OCR, and universal auto-rollups eliminate manual administration.
              </p>

              {/* Slider 1 */}
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
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">Active Site Locations</span>
                  <span className="text-white font-mono">{numSites} Sites</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={numSites}
                  onChange={(e) => setNumSites(Number(e.target.value))}
                  className="w-full accent-[#FF5E14] cursor-pointer"
                />
              </div>

              <button
                onClick={onLaunchEstimator}
                className="px-6 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Open Full Construction Estimator</span>
              </button>
            </div>

            {/* Savings Display */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                <Clock className="w-6 h-6 text-[#FF5E14]" />
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{estimatedDaysSaved} Days</div>
                <h4 className="text-xs font-bold text-neutral-200">Engineer Time Saved Yearly</h4>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                <DollarSign className="w-6 h-6 text-white" />
                <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{estimatedCostSavedLakhs} Lakhs</div>
                <h4 className="text-xs font-bold text-neutral-200">Dispute & Wastage Reduction</h4>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2 sm:col-span-2 text-left">
                <Wrench className="w-6 h-6 text-[#FF5E14]" />
                <div className="text-2xl sm:text-3xl font-extrabold text-white">₹{idleMachinerySavedLakhs} Lakhs/Yr</div>
                <h4 className="text-xs font-bold text-neutral-200">Idle Machinery Fleet Optimization</h4>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 10. FREQUENTLY ASKED QUESTIONS ACCORDION                                       */}
      {/* ============================================================================== */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111624] text-white text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-[#FF5E14]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111624] tracking-tight">
            Common Questions About SiteReport AI
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-neutral-300 bg-white overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-[#111624] hover:text-[#FF5E14] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#FF5E14] shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 ml-4" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3 text-left">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 11. PLATFORM FOOTER                                                           */}
      {/* ============================================================================== */}
      <footer className="border-t border-neutral-300 bg-[#111624] text-neutral-400 text-xs py-14 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          
          <div className="space-y-3">
            <SiteReportLogo isDark={true} size="md" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              All-in-one AI construction site intelligence platform automating Daily Progress Reports (DPR), muster rolls, challan OCR, and EVM cost control.
            </p>
            <div className="text-[10px] font-mono text-[#FF5E14]">
              UNIVERSAL DPR • WPR • MPR V2.0
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Field Solutions</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => onLaunchApp('labour')} className="hover:text-white transition-colors cursor-pointer">Labour & Muster Roll</button></li>
              <li><button onClick={() => onLaunchApp('resource')} className="hover:text-white transition-colors cursor-pointer">Materials & Challan OCR</button></li>
              <li><button onClick={() => onLaunchApp('equipment')} className="hover:text-white transition-colors cursor-pointer">Plant & Fleet Utilization</button></li>
              <li><button onClick={() => onLaunchApp('cost')} className="hover:text-white transition-colors cursor-pointer">Earned Value Management (EVM)</button></li>
              <li><button onClick={() => onLaunchApp('reports')} className="hover:text-white transition-colors cursor-pointer">Universal Reports Center</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Universal Standards</h4>
            <ul className="space-y-1.5 text-xs">
              <li>Section A1–A13 Daily Progress Report (DPR)</li>
              <li>Section B1–B14 Weekly Progress Report (WPR)</li>
              <li>Section C1–C15 Monthly Progress Report (MPR)</li>
              <li>Mon–Sun Daily Manpower Grid (B4)</li>
              <li>Material Balance & Wastage Reconciliation (B5 & C5)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Direct Contacts</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>+91 20 6789 4000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>support@sitereportai.tech</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>Pune & Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
