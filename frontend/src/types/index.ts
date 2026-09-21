export type ModuleId = 'dashboard' | 'reports' | 'labour' | 'resource' | 'equipment' | 'cost' | 'settings';

export interface SiteReport {
  id: string;
  name: string;
  projectName: string;
  siteId: string;
  date: string;
  reportType?: string;
  status: 'Completed' | 'In Progress' | 'Pending Review';
  author: string;
  summary: string;
  tradesPresentCount: number;
  criticalIssuesCount: number;
  materialsReceivedSummary: string;
  equipmentUptimePercent: number;
  evmStatus: string;
  voiceTranscript?: string;
  extractedData?: Record<string, any>;
}

export type InputMode = 'voice' | 'photo' | 'form';

export type LanguageCode = 'hi' | 'mr' | 'en';

export interface Site {
  id: string;
  name: string;
  code: string;
  location: string;
  type: 'Precast Casting Yard' | 'Commercial High-Rise' | 'Infrastructure / Metro' | 'Residential Complex';
  isPrecast: boolean;
  budgetTotal: number;
  spentTotal: number;
  startDate: string;
  plannedCompletionDate: string;
}

export type TradeType = 
  | 'Mason'
  | 'Helper'
  | 'Carpenter'
  | 'Fabricator / Welder'
  | 'Rigger'
  | 'Module Fitter'
  | 'Equipment Operator'
  | 'Bar Bender'
  | 'Electrician';

export interface TradeRosterItem {
  trade: TradeType;
  plannedCount: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  ratePerDay: number;
  overtimeHours: number;
  otRateMultiplier: number;
  productivityOutput: number; // e.g., 24
  productivityUnit: 'Cum' | 'Nos' | 'Sqm' | 'Rmt' | 'MT';
  workType: string;
  onSiteCount: number;
  offSiteCount: number; // Yard / Factory
}

export interface AgencyLog {
  id: string;
  agencyName: string;
  supervisor: string;
  phone: string;
  totalSupplied: number;
  tradesSupplied: { trade: TradeType; count: number }[];
  status: 'Verified' | 'Pending Verification' | 'Discrepancy';
  verifiedAt?: string;
}

export interface WorkerInduction {
  id: string;
  workerName: string;
  trade: TradeType;
  agency: string;
  aadharLast4: string;
  inductionDate: string;
  safetyScore: number;
  status: 'Inducted & Certified' | 'Expiring Soon' | 'Induction Pending';
  ppeIssued: boolean;
  medicalCheck: boolean;
}

export interface AttendanceRecord {
  date: string;
  trades: TradeRosterItem[];
  agencies: AgencyLog[];
  totalPresent: number;
  totalPlanned: number;
  totalOtHours: number;
  dailyWageTotal: number;
  idleHoursTotal: number;
  idleReason?: string;
  shortfallCount: number;
}

// Module 2: Resource
export interface MaterialItem {
  id: string;
  name: string;
  category: 'Cement & Aggregates' | 'Steel & Reinforcement' | 'Formwork & Shuttering' | 'Chemicals & Additives' | 'Precast Hardware';
  unit: string;
  openingStock: number;
  receivedToday: number;
  consumedToday: number;
  currentStock: number;
  minReorderLevel: number;
  unitPrice: number;
  plannedConsumption: number;
  reorderStatus: 'Sufficient' | 'Low Stock' | 'Critical Reorder';
  wastagePercent: number; // (actual - planned) / planned * 100
  supplier: string;
}

export type ElementStage = 'Cast' | 'Cured' | 'Ready' | 'Dispatched' | 'Erected';

export interface FinishedElement {
  id: string;
  elementTag: string; // e.g. "BEAM-B14-L3"
  type: 'Precast Beam' | 'Precast Column' | 'Hollowcore Slab' | 'Facade Panel' | 'Modular Pod';
  castDate: string;
  cureCompletionDate: string;
  qcInspectionPassed: boolean;
  stage: ElementStage;
  targetLocation: string;
  dimensions: string;
  weightTons: number;
  dispatchId?: string;
  erectionPlannedDate: string;
}

export interface DispatchLog {
  id: string;
  grnNo: string;
  elementOrMaterial: string;
  quantity: string;
  origin: string;
  destination: string;
  transporter: string;
  vehicleNo: string;
  driverContact: string;
  dispatchTime: string;
  eta: string;
  status: 'In Transit' | 'Delivered' | 'Pending Dispatch' | 'Delayed';
  receiptConfirmedBy?: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'Material Supplier' | 'Logistics & Haulage' | 'Equipment Rental' | 'Labour Subcontractor';
  materialsSupplied: string[];
  onTimeDeliveryRate: number; // 94%
  qualityPassRate: number; // 98%
  activeOrders: number;
  totalBilledYTD: number;
  paymentStatus: 'Cleared' | 'Pending Invoice' | 'Payment Due';
  rating: number; // 4.8 / 5
}

// Module 3: Equipment
export type EquipmentStatus = 'Working' | 'Idle' | 'Breakdown' | 'Under Maintenance';
export type OwnershipType = 'Owned' | 'Rented';

export interface EquipmentItem {
  id: string;
  name: string;
  assetTag: string;
  category: 'Lifting & Cranes' | 'Earthmoving' | 'Concrete & Pumping' | 'Power & Utilities' | 'Compaction';
  ownership: OwnershipType;
  status: EquipmentStatus;
  operatorName: string;
  workingHoursToday: number;
  idleHoursToday: number;
  breakdownHoursToday: number;
  idleReason?: string;
  dailyRate: number;
  vendorName?: string;
  rentalStartDate?: string;
  rentalEndDate?: string;
  totalAccruedRental: number;
  fuelConsumedLiters: number;
  lastServiceDate: string;
}

export interface BreakdownEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  reportedAt: string;
  resolvedAt?: string;
  downtimeMinutes: number;
  reason: string;
  actionTaken: string;
  technician: string;
  status: 'Investigating' | 'Parts Awaiting' | 'Resolved';
  costImpact: number;
}

// Module 4: Cost & EVM
export interface CostSummary {
  siteId: string;
  date: string;
  labourCostActual: number;
  materialCostActual: number;
  equipmentCostActual: number;
  otherCostActual: number;
  totalActualSpend: number;
  plannedBudgetCumulative: number;
  earnedValueCumulative: number; // EV = % complete * Planned Budget
  actualCostCumulative: number; // AC
  costVariance: number; // EV - AC
  costPerformanceIndex: number; // EV / AC
  scheduleVariance: number; // EV - PV
  schedulePerformanceIndex: number; // EV / PV
  percentBudgetUtilized: number;
  dailyBurnRate: number;
  estimatedDaysRemaining: number;
  aiNarrative: string;
  overspendAlerts: string[];
  optimizationRecommendations: string[];
}

export interface HistoricalEVMPoint {
  week: string;
  plannedValue: number; // PV
  actualCost: number; // AC
  earnedValue: number; // EV
}

export interface ExtractedAIData {
  module: ModuleId;
  rawInput: string;
  languageDetected: string;
  confidence: number;
  intent: string;
  timestamp: string;
  parsedFields: Record<string, any>;
  summaryText: string;
  actionSummary: string[];
}

export type SubcontractorAgency = AgencyLog;
export type SafetyInductionRecord = WorkerInduction;
