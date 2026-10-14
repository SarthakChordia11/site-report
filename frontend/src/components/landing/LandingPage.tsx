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
  ChevronRight,
  Settings,
  Share2
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
      {/* 1. TOP NOTICE & CONTACT BAR (Matching Screenshot 1)                           */}
      {/* ============================================================================== */}
      <div className="bg-[#161A22] text-neutral-300 py-2.5 px-4 lg:px-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Left: Pill-shaped contact items */}
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="tel:(01)666-24068" 
              className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Call Us: +(01) 666-240 68</span>
            </a>

            <a 
              href="mailto:info@sitereport.ai" 
              className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Email Us: info@sitereport.ai</span>
            </a>

            <div className="hidden md:flex px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#FF5E14]" />
              <span>Visit Us: 231 Madison, NewYork, USA / Pune, India</span>
            </div>
          </div>

          {/* Right: Round social icons */}
          <div className="flex items-center gap-2">
            {['facebook', 'twitter', 'telegram', 'pinterest'].map((social, i) => (
              <span 
                key={i} 
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#FF5E14] hover:text-white border border-white/10 flex items-center justify-center text-neutral-400 transition-all cursor-pointer text-[11px] font-bold"
              >
                {social.charAt(0).toUpperCase()}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. FLOATING PURE WHITE NAVBAR (Matching Screenshot 1)                          */}
      {/* ============================================================================== */}
      <div className="sticky top-0 z-50 py-3 px-4 lg:px-10 bg-[#161A22]/30 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto bg-white rounded-full px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-xl border border-neutral-200/80">
          
          {/* Logo with Orange Gear */}
          <div className="flex items-center gap-2">
            <SiteReportLogo isDark={false} size="md" />
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#111624]">
            <a href="#hero" className="hover:text-[#FF5E14] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#FF5E14] transition-colors">About Us</a>
            <a href="#services" className="hover:text-[#FF5E14] transition-colors">Solutions</a>
            <a href="#why-choose" className="hover:text-[#FF5E14] transition-colors">Why Choose Us</a>
            <a href="#faq" className="hover:text-[#FF5E14] transition-colors">FAQ</a>
          </div>

          {/* Solid Orange Pill Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-6 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get a Free Quote / Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </div>

      {/* ============================================================================== */}
      {/* 3. FULL-BLEED DRAMATIC WELDER HERO SECTION (Matching Screenshot 1)             */}
      {/* ============================================================================== */}
      <section id="hero" className="relative -mt-[84px] pt-32 pb-24 lg:pt-40 lg:pb-36 min-h-[700px] flex items-center overflow-hidden">
        
        {/* Full-Bleed Dramatic Welder Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/steelora/hero.webp" 
            onError={(e) => { e.currentTarget.src = '/steelora/hero-video.webp'; }}
            alt="Welder in protective gear welding inside giant metal tunnel with sparks flying"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark Overlay matching Steelora Screenshot 1 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Subtitle Badge with Gear */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161A24]/90 border border-white/20 text-neutral-200 text-xs font-semibold backdrop-blur-sm">
                <Settings className="w-3.5 h-3.5 text-[#FF5E14] animate-spin" style={{ animationDuration: '8s' }} />
                <span>SiteReport Manufacturing & Engineering Industry</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]">
                Built on Strength<br />
                Driven by Innovation<br />
                Focused on Quality
              </h1>

              {/* Checklist */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-neutral-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white font-bold" />
                  <span>Reliable Project Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white font-bold" />
                  <span>Strict Quality Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-white font-bold" />
                  <span>Expert Team</span>
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
                  <span>Start A Project With Us</span>
                </button>
              </div>

            </div>

            {/* Right Column: Hero Video Documentary Card (Matching Screenshot 1) */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-md rounded-3xl bg-[#161A24]/90 backdrop-blur-md border border-white/15 p-5 shadow-2xl space-y-4 text-left">
                
                {/* Thumbnail with Round Play Button */}
                <div className="relative h-56 rounded-2xl overflow-hidden border border-white/10 group cursor-pointer" onClick={() => onOpenAIModal('voice')}>
                  <img 
                    src="/steelora/hero-video.webp"
                    onError={(e) => { e.currentTarget.src = '/steelora/hero.webp'; }}
                    alt="Welder welding industrial structure"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Circular White Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white text-[#111624] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5 text-[#111624]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    Raw Steel to Remarkable Results: The Story Behind Our Manufacturing Excellence
                  </h3>
                  <button 
                    onClick={() => onOpenAIModal('voice')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF5E14]" />
                    <span>Watch Full Documentary</span>
                  </button>
                </div>

              </div>
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
            <span>About Company</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111624] tracking-tight leading-[1.15] max-w-3xl">
              SiteReport A Trusted Leader in Industrial Engineering Dedicated to Innovation & Sustainable Growth
            </h2>

            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-7 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer self-start lg:self-auto shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Our Services Offer</span>
            </button>
          </div>
        </div>

        {/* The Exact 3-Column Asymmetric Layout from Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: Tall Dark Card + High Production Capacity Card */}
          <div className="flex flex-col gap-6">
            
            {/* Card 1: Tall Dark Card with Orange Pipes */}
            <div className="bg-[#111624] text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden min-h-[480px] shadow-lg group">
              <div className="space-y-6 relative z-10">
                <h3 className="text-2xl font-bold leading-snug">
                  Delivering Precision<br />Engineering Solutions<br />for Modern Industry
                </h3>
                <button
                  onClick={() => onLaunchApp('dashboard')}
                  className="px-6 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Start A Project</span>
                </button>
              </div>

              {/* Orange Pipes Photo on Bottom */}
              <div className="relative h-60 -mx-8 -mb-8 mt-6 overflow-hidden">
                <img 
                  src="/steelora/pipes.webp"
                  onError={(e) => { e.currentTarget.src = '/hero-bg-2.jpg'; }}
                  alt="Orange industrial pipes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Card 2: High Production Capacity Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-[#111624]">High Production Capacity</h4>
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
                Efficient manufacturing processes capable of handling both small-scale orders plus large industrial projects.
              </p>

              <div className="h-px bg-neutral-200 my-2" />

              <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Production</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Technology</span>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Strict Quality Standards + Tall Angle Grinder Photo */}
          <div className="flex flex-col gap-6">
            
            {/* Card 3: Strict Quality Standards */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-[#111624]">Strict Quality Standards</h4>
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
                Comprehensive inspection procedures at every production stage to maintain reliability and performance
              </p>

              <div className="h-px bg-neutral-200 my-2" />

              <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Production</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Technology</span>
              </div>
            </div>

            {/* Card 4: Angle Grinding Steel Photo with Sparks Flying */}
            <div className="rounded-3xl overflow-hidden shadow-md h-[360px] relative group">
              <img 
                src="/steelora/grinder.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg-3.jpg'; }}
                alt="Worker angle grinding steel with bright sparks flying"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </div>

          </div>

          {/* COLUMN 3: Sunset Pumpjack with 25+ Overlay + Top Production Technology */}
          <div className="flex flex-col gap-6">
            
            {/* Card 5: Sunset Rig with 25+ Years Overlay */}
            <div className="rounded-3xl overflow-hidden shadow-md h-[380px] relative group flex flex-col justify-end p-6">
              <img 
                src="/steelora/sunset-rig.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg.png'; }}
                alt="Oil pumpjack rig against warm sunset sky"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Glass Overlay Box matching Screenshot 2 */}
              <div className="relative z-10 bg-[#111624]/85 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-white text-left space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#FF5E14]">25</span>
                  <span className="text-xl font-bold text-[#FF5E14]">+</span>
                  <span className="text-xs font-bold text-neutral-300 ml-2">Years of Engineering Experience</span>
                </div>
                <div className="h-px bg-white/15 my-2" />
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Our team has successfully handled complex manufacturing challenges across multiple disciplines
                </p>
              </div>
            </div>

            {/* Card 6: Top Production Technology Card */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-[#111624]">Top Production Technology</h4>
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
                Equipped with modern machinery and automated systems to ensure high precision and consistent output
              </p>

              <div className="h-px bg-neutral-200 my-2" />

              <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600">
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Production</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200">• Technology</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ============================================================================== */}
      {/* 5. INDUSTRIAL SOLUTIONS WE PROVIDE (Matching Screenshot 3 - Light Cream)       */}
      {/* ============================================================================== */}
      <section id="services" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto border-t border-neutral-300/60">
        
        {/* Header Block matching Screenshot 3 */}
        <div className="space-y-4 mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161A24] text-white text-xs font-semibold">
            <Settings className="w-3.5 h-3.5 text-[#FF5E14]" />
            <span>Our Services</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#111624] tracking-tight">
                Industrial Solutions We Provide
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Delivering reliable industrial manufacturing solutions designed to improve productivity, performance, long term operational efficiency
              </p>
            </div>

            <button
              onClick={() => onLaunchApp('reports')}
              className="px-7 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs shadow-md shadow-[#FF5E14]/25 flex items-center gap-2 transition-all cursor-pointer self-start lg:self-auto shrink-0"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Our Services Offer</span>
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
      {/* 6. WHY CHOOSE STEELORA SECTION (Matching Screenshot 4 - Dark Charcoal)        */}
      {/* ============================================================================== */}
      <section id="why-choose" className="bg-[#111624] text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Full-Height Industrial Worker Photo with Glass 90+ Badge */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden relative shadow-2xl min-h-[520px] max-h-[640px] border border-white/10 group">
              <img 
                src="/steelora/worker-wcu.webp"
                onError={(e) => { e.currentTarget.src = '/hero-bg-2.jpg'; }}
                alt="Industrial worker in orange cap with safety glasses working on steel beam"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating Glass Badge in Corner: Expert Industrial Employee 90+ */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-[#1A1F2D]/85 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-left shadow-2xl max-w-sm space-y-3">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Expert Industrial Employee</h4>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-extrabold text-white">90</span>
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
              <span>Work Process</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Why Choose Steelora for Industrial Manufacturing
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed font-normal">
              Choosing Steelora means partnering with a team dedicated to precision manufacturing, innovative engineering practices, and efficient production
            </p>

            {/* 4-Grid Feature Icons matching Screenshot 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              
              {/* Box 1: Advanced Technology */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Advanced Technology</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Modern machinery plus innovative production systems ensure precision efficiency & output quality
                </p>
              </div>

              {/* Box 2: Experienced Team */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Experienced Team</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Skilled professionals with years of industry expertise deliver reliable solutions for complex projects
                </p>
              </div>

              {/* Box 3: Strict Quality Standards */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Strict Quality Standards</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Multi stage inspection processes maintain high performance, durability industry compliance
                </p>
              </div>

              {/* Box 4: Reliable Project Delivery */}
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF5E14]">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Reliable Project Delivery</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Structured workflows plus efficient production planning ensure projects are completed on schedule
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
            
            {/* Stat 1: 200+ Skilled Engineers */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">200+</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Skilled Engineers</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  trained professionals ensures technical accuracy, operational efficiency
                </p>
              </div>
            </div>

            {/* Stat 2: 235 Industrial Projects */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">235</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Industrial Projects</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  large scale manufacturing projects each year with proven delivery timelines
                </p>
              </div>
            </div>

            {/* Stat 3: 72 Supply Partners */}
            <div className="space-y-1.5 flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-white mt-3 shrink-0" />
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">72</div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Supply Partners</h4>
                <p className="text-xs text-white/80 leading-relaxed max-w-xs">
                  trusted suppliers ensures consistent raw material quality for stable production
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
                alt="Smiling construction worker in orange vest and hard hat holding a wrench"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Column 3 (Right): CEO Quote matching Screenshot 5 */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            <blockquote className="text-base sm:text-lg font-medium text-white leading-relaxed">
              “At Steelora, our mission is to deliver industrial solutions that combine precision, innovation, and reliability. Every project we take on reflects our commitment to quality, operational excellence, and helping our clients achieve measurable success”
            </blockquote>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Mark Antony</h4>
              <p className="text-xs text-white/80 font-medium">CEO, Steelora</p>
            </div>

            {/* White Divider */}
            <div className="h-px bg-white/30 my-4" />

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {['f', 'X', 't', 'p'].map((s, idx) => (
                <div 
                  key={idx}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white hover:text-[#FF5E14] text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                >
                  {s}
                </div>
              ))}
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
        <div className="rounded-3xl border border-neutral-300 bg-[#111624] text-white p-8 sm:p-14 shadow-2xl">
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
      {/* 11. INDUSTRIAL FOOTER                                                          */}
      {/* ============================================================================== */}
      <footer className="border-t border-neutral-300 bg-[#111624] text-neutral-400 text-xs py-14 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
          
          <div className="space-y-3">
            <SiteReportLogo isDark={true} size="md" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              Industrial Site Progress Report platform powered by Groq LLM speech intelligence and multimodal OCR.
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
                <span>+(01) 666-240 68</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>info@sitereport.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF5E14]" />
                <span>231 Madison, NewYork, USA</span>
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
