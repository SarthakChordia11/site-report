import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Upload, Plus, Trash2, Calculator, Download, ChevronDown, ChevronUp, Image as ImageIcon, Layers } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────
const FT = 0.3048;
const IN = 0.0254;
const BAG_M3 = 0.0347;
const M3_TO_CFT = 35.3147;
const BRICK_EFF_VOL = 0.00248;

// ── Types ──────────────────────────────────────────────────────────────────
interface FloorData {
  id: number;
  label: string;
  length: number;
  width: number;
  height: number;
  wallLength: number;
  wallThickness: number;
  opening: number;
}

interface MixResult {
  volumeM3: number;
  cementBags: number;
  sandM3: number;
  aggM3: number;
  steelKg: number;
}

interface BOQItem {
  sr: number;
  desc: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

interface BOQCosts {
  A_material: number;
  B_other: number;
  C_labour: number;
  D_tnp: number;
  E_profit: number;
  F_gst: number;
  grandTotal: number;
  pct: RateInputs;
}

interface SteelSource {
  name: string;
  kg: number;
}

interface SteelSummary {
  sources: SteelSource[];
  totalSteelKg: number;
  wastePct: number;
  totalInclWaste: number;
  tonnes: number;
}

interface BOQResult {
  items: BOQItem[];
  costs: BOQCosts;
  steel: SteelSummary;
}

interface CalcResult {
  floors: FloorData[];
  totalCementBags: number;
  totalSandM3: number;
  totalAggM3: number;
  totalSteelKg: number;
  totalConcreteM3: number;
  brickCount: number;
  flooringSqft: number;
  paintLitres: number;
  excavationVol: number;
  netWallVolTotal: number;
  internalPlasterArea: number;
  externalPlasterArea: number;
  rates: RateInputs;
  breakdown: {
    pcc: MixResult;
    rccFooting: MixResult;
    columns: MixResult;
    wallMortar: { cementBags: number; sandM3: number };
    slab: MixResult;
    internalPlaster: { cementBags: number; sandM3: number };
    externalPlaster: { cementBags: number; sandM3: number };
    brickCount: number;
    flooringSqft: number;
    paintLitres: number;
  };
}

interface RateInputs {
  cement: number;
  sand: number;
  agg: number;
  steel: number;
  brick: number;
  excavation: number;
  flooring: number;
  paint: number;
  pctLabour: number;
  pctTnp: number;
  pctProfit: number;
  pctGst: number;
  pctSteelWaste: number;
}

interface FoundationInputs {
  length: number;
  width: number;
  pccDepth: number;
  rccDepth: number;
  pccRatio: string;
  rccRatio: string;
  steel: number;
}

interface ColumnInputs {
  count: number;
  size: string;
  ratio: string;
  steel: number;
}

interface SlabInputs {
  thickness: number;
  ratio: string;
  steel: number;
}

interface FinishingInputs {
  mortarRatio: string;
  plasterInternal: number;
  plasterExternal: number;
  coats: number;
  wastage: number;
}

type PlanType = 'floor' | 'foundation' | 'roof' | 'other';

interface PlanCardData {
  id: number;
  file: File;
  dataUrl: string;
  type: PlanType;
  floorChoice: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseRatio(str: string): number[] {
  return str.split(':').map(Number);
}

function concreteMix(volumeM3: number, ratioStr: string, steelKgPerM3: number): MixResult {
  const [c, s, a] = parseRatio(ratioStr);
  const sum = c + s + a;
  const dryVol = volumeM3 * 1.54;
  return {
    volumeM3,
    cementBags: (dryVol * c / sum) / BAG_M3,
    sandM3: dryVol * s / sum,
    aggM3: dryVol * a / sum,
    steelKg: volumeM3 * (steelKgPerM3 || 0),
  };
}

function mortarMix(volumeM3: number, ratioStr: string, dryFactor: number) {
  const [c, s] = parseRatio(ratioStr);
  const sum = c + s;
  const dryVol = volumeM3 * dryFactor;
  return { cementBags: (dryVol * c / sum) / BAG_M3, sandM3: dryVol * s / sum };
}

function fmt(n: number, d?: number): string {
  return (n || 0).toLocaleString('en-IN', { maximumFractionDigits: d === undefined ? 0 : d });
}

let floorIdCounter = 0;
function newFloor(defaults?: Partial<FloorData>): FloorData {
  floorIdCounter += 1;
  return {
    id: floorIdCounter,
    label: '',
    length: 30,
    width: 25,
    height: 10,
    wallLength: 180,
    wallThickness: 9,
    opening: 12,
    ...defaults,
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export const EstimatorModule: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Floors
  const [floors, setFloors] = useState<FloorData[]>(() => {
    const first = newFloor({ label: 'Ground floor' });
    return [first];
  });

  const [plans, setPlans] = useState<PlanCardData[]>([]);

  // Foundation
  const [foundation, setFoundation] = useState<FoundationInputs>({
    length: 130,
    width: 2,
    pccDepth: 4,
    rccDepth: 9,
    pccRatio: '1:4:8',
    rccRatio: '1:2:4',
    steel: 70,
  });

  // Columns
  const [columns, setColumns] = useState<ColumnInputs>({
    count: 12,
    size: '9x9',
    ratio: '1:1.5:3',
    steel: 110,
  });

  // Slab
  const [slab, setSlab] = useState<SlabInputs>({
    thickness: 5,
    ratio: '1:1.5:3',
    steel: 90,
  });

  // Finishing
  const [finishing, setFinishing] = useState<FinishingInputs>({
    mortarRatio: '1:6',
    plasterInternal: 0.5,
    plasterExternal: 0.75,
    coats: 2,
    wastage: 10,
  });

  // Rates
  const [rates, setRates] = useState<RateInputs>({
    cement: 430,
    sand: 1200,
    agg: 1050,
    steel: 68,
    brick: 8,
    excavation: 180,
    flooring: 65,
    paint: 280,
    pctLabour: 20,
    pctTnp: 2,
    pctProfit: 10,
    pctGst: 18,
    pctSteelWaste: 4,
  });

  // Results
  const [results, setResults] = useState<CalcResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Floor handlers ─────────────────────────────────────────────────────
  const addFloor = useCallback(() => {
    setFloors(prev => {
      const label = prev.length === 0 ? 'Ground floor' : `Floor ${prev.length}`;
      return [...prev, newFloor({ label })];
    });
  }, []);

  const removeFloor = useCallback((id: number) => {
    setFloors(prev => (prev.length <= 1 ? prev : prev.filter(f => f.id !== id)));
  }, []);

  const updateFloor = useCallback((id: number, field: keyof FloorData, value: string | number) => {
    setFloors(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }, []);

  const addFloorAndReturn = useCallback((label?: string) => {
    const created = newFloor({ label: label || (floors.length === 0 ? 'Ground floor' : `Floor ${floors.length}`) });
    setFloors(prev => [...prev, created]);
    return created;
  }, [floors.length]);

  const updatePlan = useCallback((id: number, patch: Partial<PlanCardData>) => {
    setPlans(prev => prev.map(plan => plan.id === id ? { ...plan, ...patch } : plan));
  }, []);

  const removePlan = useCallback((id: number) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  }, []);

  const handlePlanFiles = useCallback((fileList: FileList | File[]) => {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        setPlans(prev => [
          ...prev,
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            file,
            dataUrl: String(reader.result || ''),
            type: 'floor',
            floorChoice: 'new',
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // ── Column height display ──────────────────────────────────────────────
  const totalColumnHeight = useMemo(
    () => floors.reduce((s, f) => s + (f.height || 0), 0),
    [floors]
  );

  // ── Calculation engine ─────────────────────────────────────────────────
  const calculate = useCallback(() => {
    // Foundation
    const fLen = foundation.length * FT;
    const fW = foundation.width * FT;
    const pccVol = fLen * fW * (foundation.pccDepth * IN);
    const rccVol = fLen * fW * (foundation.rccDepth * IN);
    const excavationVol = fLen * fW * ((foundation.pccDepth + foundation.rccDepth) * IN);
    const pcc = concreteMix(pccVol, foundation.pccRatio, 0);
    const rccFooting = concreteMix(rccVol, foundation.rccRatio, foundation.steel);

    // Columns
    const totalColHeightM = totalColumnHeight * FT;
    const [csW, csD] = columns.size.split('x').map(v => parseFloat(v) * IN);
    const colVolTotal = columns.count * csW * csD * totalColHeightM;
    const colMix = concreteMix(colVolTotal, columns.ratio, columns.steel);

    // Per-floor
    const sThickM = slab.thickness * IN;
    let netWallVolTotal = 0;
    let slabVolTotal = 0;
    let internalPlasterArea = 0;
    let externalPlasterArea = 0;
    let flooringAreaM2Sum = 0;

    floors.forEach(f => {
      const lengthM = f.length * FT;
      const widthM = f.width * FT;
      const heightM = f.height * FT;
      const wallLenM = f.wallLength * FT;
      const wallThickM = f.wallThickness * IN;
      const opening = f.opening / 100;

      const areaM2 = lengthM * widthM;
      const wallVolGross = wallLenM * wallThickM * heightM;
      const wallVolNet = wallVolGross * (1 - opening);
      netWallVolTotal += wallVolNet;

      slabVolTotal += areaM2 * sThickM;

      internalPlasterArea += wallLenM * heightM * (1 - opening);
      externalPlasterArea += (lengthM + widthM) * 2 * heightM;

      flooringAreaM2Sum += areaM2;
    });

    const brickCount = netWallVolTotal / BRICK_EFF_VOL;
    const mortarVol = netWallVolTotal * 0.30;
    const wallMortar = mortarMix(mortarVol, finishing.mortarRatio, 1.33);

    const slabMix = concreteMix(slabVolTotal, slab.ratio, slab.steel);

    const internalPlaster = mortarMix(
      internalPlasterArea * (finishing.plasterInternal * IN), '1:6', 1.27
    );
    const externalPlaster = mortarMix(
      externalPlasterArea * (finishing.plasterExternal * IN), '1:4', 1.27
    );

    const flooringAreaM2 = flooringAreaM2Sum * (1 + finishing.wastage / 100);
    const flooringSqft = flooringAreaM2 * 10.7639;

    const paintableArea = internalPlasterArea + externalPlasterArea;
    const paintLitres = (paintableArea / 12.5) * finishing.coats;

    const totalCementBags = pcc.cementBags + rccFooting.cementBags + colMix.cementBags
      + wallMortar.cementBags + slabMix.cementBags + internalPlaster.cementBags + externalPlaster.cementBags;
    const totalSandM3 = pcc.sandM3 + rccFooting.sandM3 + colMix.sandM3
      + wallMortar.sandM3 + slabMix.sandM3 + internalPlaster.sandM3 + externalPlaster.sandM3;
    const totalAggM3 = pcc.aggM3 + rccFooting.aggM3 + colMix.aggM3 + slabMix.aggM3;
    const totalSteelKg = rccFooting.steelKg + colMix.steelKg + slabMix.steelKg;
    const totalConcreteM3 = pcc.volumeM3 + rccFooting.volumeM3 + colMix.volumeM3 + slabMix.volumeM3;

    const calcResult: CalcResult = {
      floors,
      totalCementBags, totalSandM3, totalAggM3, totalSteelKg, totalConcreteM3,
      brickCount, flooringSqft, paintLitres, excavationVol,
      netWallVolTotal, internalPlasterArea, externalPlasterArea,
      rates,
      breakdown: {
        pcc, rccFooting, columns: colMix, wallMortar, slab: slabMix,
        internalPlaster, externalPlaster, brickCount, flooringSqft, paintLitres,
      },
    };

    setResults(calcResult);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [floors, foundation, columns, slab, finishing, rates, totalColumnHeight]);

  // ── BOQ builder ────────────────────────────────────────────────────────
  const buildBOQ = useCallback((r: CalcResult): BOQResult => {
    const b = r.breakdown;
    const rt = r.rates;

    const line = (desc: string, qty: number, unit: string, amount: number): BOQItem => ({
      sr: 0, desc, qty, unit, rate: qty ? amount / qty : 0, amount,
    });

    const excavation = line('Earthwork excavation in foundation trench', r.excavationVol, 'm³', r.excavationVol * rt.excavation);
    const pccItem = line('Foundation — PCC bed', b.pcc.volumeM3, 'm³', b.pcc.cementBags * rt.cement + b.pcc.sandM3 * rt.sand + b.pcc.aggM3 * rt.agg);
    const rccFootingItem = line('Foundation — RCC footing', b.rccFooting.volumeM3, 'm³', b.rccFooting.cementBags * rt.cement + b.rccFooting.sandM3 * rt.sand + b.rccFooting.aggM3 * rt.agg + b.rccFooting.steelKg * rt.steel);
    const columnsItem = line('RCC columns (footing to roof)', b.columns.volumeM3, 'm³', b.columns.cementBags * rt.cement + b.columns.sandM3 * rt.sand + b.columns.aggM3 * rt.agg + b.columns.steelKg * rt.steel);
    const brickworkItem = line('Brickwork in walls, all floors', r.netWallVolTotal, 'm³', b.brickCount * rt.brick + b.wallMortar.cementBags * rt.cement + b.wallMortar.sandM3 * rt.sand);
    const slabItem = line('RCC roof / floor slab, all floors', b.slab.volumeM3, 'm³', b.slab.cementBags * rt.cement + b.slab.sandM3 * rt.sand + b.slab.aggM3 * rt.agg + b.slab.steelKg * rt.steel);
    const intPlasterItem = line('Internal plaster, all floors', r.internalPlasterArea, 'm²', b.internalPlaster.cementBags * rt.cement + b.internalPlaster.sandM3 * rt.sand);
    const extPlasterItem = line('External plaster, all floors', r.externalPlasterArea, 'm²', b.externalPlaster.cementBags * rt.cement + b.externalPlaster.sandM3 * rt.sand);
    const flooringItem = line('Flooring, all floors', r.flooringSqft, 'sqft', r.flooringSqft * rt.flooring);
    const paintItem = line('Painting, all coats', r.paintLitres, 'litre', r.paintLitres * rt.paint);

    const items = [excavation, pccItem, rccFootingItem, columnsItem, brickworkItem, slabItem, intPlasterItem, extPlasterItem, flooringItem, paintItem]
      .map((it, i) => ({ ...it, sr: i + 1 }));

    const A_material = pccItem.amount + rccFootingItem.amount + columnsItem.amount + brickworkItem.amount + slabItem.amount + intPlasterItem.amount + extPlasterItem.amount;
    const B_other = excavation.amount + flooringItem.amount + paintItem.amount;
    const C_labour = A_material * (rt.pctLabour / 100);
    const D_tnp = (A_material + B_other + C_labour) * (rt.pctTnp / 100);
    const E_profit = (A_material + B_other + C_labour + D_tnp) * (rt.pctProfit / 100);
    const F_gst = (A_material + B_other + C_labour + D_tnp + E_profit) * (rt.pctGst / 100);
    const grandTotal = A_material + B_other + C_labour + D_tnp + E_profit + F_gst;

    const costs: BOQCosts = { A_material, B_other, C_labour, D_tnp, E_profit, F_gst, grandTotal, pct: rt };

    const steelSources: SteelSource[] = [
      { name: 'Footing', kg: b.rccFooting.steelKg },
      { name: 'Columns', kg: b.columns.steelKg },
      { name: 'Slab', kg: b.slab.steelKg },
    ];
    const totalSteelKg = steelSources.reduce((s, x) => s + x.kg, 0);
    const totalInclWaste = totalSteelKg * (1 + rt.pctSteelWaste / 100);
    const steel: SteelSummary = {
      sources: steelSources, totalSteelKg, wastePct: rt.pctSteelWaste,
      totalInclWaste, tonnes: totalInclWaste / 1000,
    };

    return { items, costs, steel };
  }, []);

  // ── CSV export ─────────────────────────────────────────────────────────
  const downloadCSV = useCallback(() => {
    if (!results) return;
    const boq = buildBOQ(results);
    const rows: string[][] = [['Sr', 'Item Description', 'Quantity', 'Unit', 'Rate (Rs.)', 'Amount (Rs.)']];
    boq.items.forEach(it => rows.push([String(it.sr), it.desc, it.qty.toFixed(2), it.unit, it.rate.toFixed(2), it.amount.toFixed(2)]));
    rows.push([]);
    const c = boq.costs;
    rows.push(['', 'A: Material cost', '', '', '', c.A_material.toFixed(2)]);
    rows.push(['', 'B: Other direct costs', '', '', '', c.B_other.toFixed(2)]);
    rows.push(['', 'C: Labour', '', '', '', c.C_labour.toFixed(2)]);
    rows.push(['', 'D: T&P', '', '', '', c.D_tnp.toFixed(2)]);
    rows.push(['', 'E: Contractor profit', '', '', '', c.E_profit.toFixed(2)]);
    rows.push(['', 'F: GST', '', '', '', c.F_gst.toFixed(2)]);
    rows.push(['', 'GRAND TOTAL', '', '', '', c.grandTotal.toFixed(2)]);
    rows.push([]);
    rows.push(['Steel summary']);
    boq.steel.sources.forEach(x => rows.push([x.name, x.kg.toFixed(2) + ' kg']));
    rows.push(['Total incl. wastage', boq.steel.totalInclWaste.toFixed(2) + ' kg (' + boq.steel.tonnes.toFixed(2) + ' t)']);

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BOQ_estimate.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results, buildBOQ]);

  // ── Computed BOQ for rendering ─────────────────────────────────────────
  const boq = useMemo(() => results ? buildBOQ(results) : null, [results, buildBOQ]);

  const totalSqft = useMemo(
    () => floors.reduce((s, f) => s + f.length * f.width, 0),
    [floors]
  );

  // ── Reusable input component ───────────────────────────────────────────
  const Field = ({ label, value, onChange, type = 'number', suffix }: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    suffix?: string;
  }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white font-mono text-sm text-[#0E0E0E] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00] transition-colors"
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );

  const planBadgeStyles: Record<PlanType, string> = {
    floor: 'bg-[#FFF2E8] text-[#FF6A00] border-[#FF6A00]/20',
    foundation: 'bg-[#EFF3F6] text-[#2E4A6B] border-[#2E4A6B]/20',
    roof: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    other: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0E0E0E]">Estimator</h1>
          <p className="text-xs text-gray-500">Plan in → BOQ & cost out — Free for all users</p>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Plan images</h2>
            <p className="text-xs text-gray-500">Upload footing, floor, or roof plan images and tag each one before estimating.</p>
          </div>
        </div>

        <div
          className="relative flex items-center gap-4 rounded-xl border-2 border-dashed border-[#2E4A6B]/40 bg-[#FBFAF7] p-5 hover:bg-[#F7F4EC] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handlePlanFiles(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handlePlanFiles(e.target.files);
              e.currentTarget.value = '';
            }}
          />
          <div className="w-12 h-12 rounded-xl bg-white border border-[#2E4A6B]/20 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5 text-[#2E4A6B]" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#0E0E0E]">Drop plan images here, or tap to choose</div>
            <div className="text-xs text-gray-500">JPG or PNG. Photos of hand sketches work too.</div>
          </div>
        </div>

        {plans.length > 0 && (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-xl p-4 bg-[#FAFAFA] flex flex-col gap-4 sm:flex-row sm:items-start">
                <img
                  src={plan.dataUrl}
                  alt={plan.file.name}
                  className="w-full sm:w-24 h-44 sm:h-24 object-cover rounded-lg border border-gray-200 bg-white"
                />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#0E0E0E] truncate">{plan.file.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{Math.round(plan.file.size / 1024)} KB</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${planBadgeStyles[plan.type]}`}>
                      <Layers className="w-3 h-3" />
                      {plan.type === 'floor' ? 'Floor plan' : plan.type === 'foundation' ? 'Foundation / footing plan' : plan.type === 'roof' ? 'Roof / terrace plan' : 'Reference only'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Plan type</label>
                      <select
                        value={plan.type}
                        onChange={(e) => updatePlan(plan.id, { type: e.target.value as PlanType })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                      >
                        <option value="floor">Floor plan</option>
                        <option value="foundation">Foundation / footing plan</option>
                        <option value="roof">Roof / terrace plan</option>
                        <option value="other">Reference only</option>
                      </select>
                    </div>

                    {plan.type === 'floor' && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Attach to floor</label>
                        <select
                          value={plan.floorChoice}
                          onChange={(e) => {
                            const nextChoice = e.target.value;
                            if (nextChoice === 'new') {
                              const created = addFloorAndReturn();
                              updatePlan(plan.id, { floorChoice: created ? String(created.id) : 'new' });
                              return;
                            }
                            updatePlan(plan.id, { floorChoice: nextChoice });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                        >
                          <option value="new">+ Add as new floor</option>
                          {floors.map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 bg-[#EFF3F6] border border-[#2E4A6B]/10 rounded-lg px-3 py-2">
                    The image is stored as a reference inside the estimator. Fill the numeric floor fields below to drive the BOQ.
                  </p>
                </div>

                <button
                  onClick={() => removePlan(plan.id)}
                  className="self-start px-3 py-2 text-xs font-semibold text-[#A8442E] border border-[#A8442E]/20 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Stage 1: Floors */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">1</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Building & floors</h2>
            <p className="text-xs text-gray-500">Add one card per floor. Each floor can have its own footprint.</p>
          </div>
        </div>

        <div className="space-y-3">
          {floors.map(f => (
            <div key={f.id} className="border border-gray-200 rounded-lg p-4 bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-3">
                <input
                  value={f.label}
                  onChange={e => updateFloor(f.id, 'label', e.target.value)}
                  className="font-bold text-sm text-[#0E0E0E] bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-[#FF6A00] px-0 py-0.5 max-w-[200px]"
                />
                {floors.length > 1 && (
                  <button
                    onClick={() => removeFloor(f.id)}
                    className="px-2.5 py-1 text-xs font-medium text-[#A8442E] border border-[#A8442E]/30 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Field label="Length (ft)" value={f.length} onChange={v => updateFloor(f.id, 'length', parseFloat(v) || 0)} />
                <Field label="Width (ft)" value={f.width} onChange={v => updateFloor(f.id, 'width', parseFloat(v) || 0)} />
                <Field label="Floor height (ft)" value={f.height} onChange={v => updateFloor(f.id, 'height', parseFloat(v) || 0)} />
                <Field label="Wall length (ft)" value={f.wallLength} onChange={v => updateFloor(f.id, 'wallLength', parseFloat(v) || 0)} />
                <Field label="Wall thickness (in)" value={f.wallThickness} onChange={v => updateFloor(f.id, 'wallThickness', parseFloat(v) || 0)} />
                <Field label="Opening deduction (%)" value={f.opening} onChange={v => updateFloor(f.id, 'opening', parseFloat(v) || 0)} />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addFloor}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#2E4A6B] border border-[#2E4A6B]/30 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add another floor
        </button>
      </section>

      {/* Stage 2: Foundation */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">2</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Foundation / footing</h2>
            <p className="text-xs text-gray-500">One-time trench footing: PCC bedding then RCC footing above it.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Field label="Total footing run (ft)" value={foundation.length} onChange={v => setFoundation(p => ({ ...p, length: parseFloat(v) || 0 }))} />
          <Field label="Footing width (ft)" value={foundation.width} onChange={v => setFoundation(p => ({ ...p, width: parseFloat(v) || 0 }))} />
          <Field label="PCC bed thickness (in)" value={foundation.pccDepth} onChange={v => setFoundation(p => ({ ...p, pccDepth: parseFloat(v) || 0 }))} />
          <Field label="RCC footing thickness (in)" value={foundation.rccDepth} onChange={v => setFoundation(p => ({ ...p, rccDepth: parseFloat(v) || 0 }))} />
          <Field label="PCC ratio (cement:sand:agg)" value={foundation.pccRatio} onChange={v => setFoundation(p => ({ ...p, pccRatio: v }))} type="text" />
          <Field label="RCC ratio (cement:sand:agg)" value={foundation.rccRatio} onChange={v => setFoundation(p => ({ ...p, rccRatio: v }))} type="text" />
          <Field label="Steel in footing (kg/m³)" value={foundation.steel} onChange={v => setFoundation(p => ({ ...p, steel: parseFloat(v) || 0 }))} />
        </div>
      </section>

      {/* Stage 3: Columns */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">3</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Columns</h2>
            <p className="text-xs text-gray-500">RCC columns from footing to roof. Height is summed from floor heights above.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Number of columns" value={columns.count} onChange={v => setColumns(p => ({ ...p, count: parseFloat(v) || 0 }))} />
          <Field label="Column size (in × in)" value={columns.size} onChange={v => setColumns(p => ({ ...p, size: v }))} type="text" />
          <Field label="Concrete ratio" value={columns.ratio} onChange={v => setColumns(p => ({ ...p, ratio: v }))} type="text" />
          <Field label="Steel in columns (kg/m³)" value={columns.steel} onChange={v => setColumns(p => ({ ...p, steel: parseFloat(v) || 0 }))} />
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-mono text-[#2E4A6B]">Total column height</label>
            <div className="px-3 py-2.5 font-mono text-sm text-[#2E4A6B] font-bold">
              {totalColumnHeight} ft (across {floors.length} floor{floors.length > 1 ? 's' : ''})
            </div>
          </div>
        </div>
      </section>

      {/* Stage 4: Slab */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">4</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Roof / slab</h2>
            <p className="text-xs text-gray-500">RCC slab cast over the full footprint of every floor.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Slab thickness (in)" value={slab.thickness} onChange={v => setSlab(p => ({ ...p, thickness: parseFloat(v) || 0 }))} />
          <Field label="Concrete ratio" value={slab.ratio} onChange={v => setSlab(p => ({ ...p, ratio: v }))} type="text" />
          <Field label="Steel in slab (kg/m³)" value={slab.steel} onChange={v => setSlab(p => ({ ...p, steel: parseFloat(v) || 0 }))} />
        </div>
      </section>

      {/* Stage 5: Finishing */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">5</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Wall mortar, plaster, flooring & paint</h2>
            <p className="text-xs text-gray-500">Finishing quantities across the whole building.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Wall mortar ratio (cement:sand)" value={finishing.mortarRatio} onChange={v => setFinishing(p => ({ ...p, mortarRatio: v }))} type="text" />
          <Field label="Internal plaster (in)" value={finishing.plasterInternal} onChange={v => setFinishing(p => ({ ...p, plasterInternal: parseFloat(v) || 0 }))} />
          <Field label="External plaster (in)" value={finishing.plasterExternal} onChange={v => setFinishing(p => ({ ...p, plasterExternal: parseFloat(v) || 0 }))} />
          <Field label="Paint coats" value={finishing.coats} onChange={v => setFinishing(p => ({ ...p, coats: parseFloat(v) || 0 }))} />
          <Field label="Flooring wastage (%)" value={finishing.wastage} onChange={v => setFinishing(p => ({ ...p, wastage: parseFloat(v) || 0 }))} />
        </div>
      </section>

      {/* Stage 6: Rates */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full border border-[#2E4A6B] text-[#2E4A6B] flex items-center justify-center text-xs font-mono font-bold shrink-0">6</span>
          <div>
            <h2 className="text-sm font-bold text-[#0E0E0E]">Rates, overheads & costing</h2>
            <p className="text-xs text-gray-500">Unit rates for the BOQ + overhead chain: Labour → T&P → Profit → GST.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Field label="Cement (₹/bag, 50kg)" value={rates.cement} onChange={v => setRates(p => ({ ...p, cement: parseFloat(v) || 0 }))} />
          <Field label="Sand (₹/m³)" value={rates.sand} onChange={v => setRates(p => ({ ...p, sand: parseFloat(v) || 0 }))} />
          <Field label="Aggregate (₹/m³)" value={rates.agg} onChange={v => setRates(p => ({ ...p, agg: parseFloat(v) || 0 }))} />
          <Field label="Steel / TMT (₹/kg)" value={rates.steel} onChange={v => setRates(p => ({ ...p, steel: parseFloat(v) || 0 }))} />
          <Field label="Bricks (₹/piece)" value={rates.brick} onChange={v => setRates(p => ({ ...p, brick: parseFloat(v) || 0 }))} />
          <Field label="Earthwork excavation (₹/m³)" value={rates.excavation} onChange={v => setRates(p => ({ ...p, excavation: parseFloat(v) || 0 }))} />
          <Field label="Flooring (₹/sqft)" value={rates.flooring} onChange={v => setRates(p => ({ ...p, flooring: parseFloat(v) || 0 }))} />
          <Field label="Painting (₹/litre applied)" value={rates.paint} onChange={v => setRates(p => ({ ...p, paint: parseFloat(v) || 0 }))} />
        </div>
        <p className="text-xs text-gray-500 mt-1">Overhead % chain (each applied on the running subtotal above it):</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Field label="Labour (% of material cost)" value={rates.pctLabour} onChange={v => setRates(p => ({ ...p, pctLabour: parseFloat(v) || 0 }))} />
          <Field label="T&P (% of material+labour)" value={rates.pctTnp} onChange={v => setRates(p => ({ ...p, pctTnp: parseFloat(v) || 0 }))} />
          <Field label="Contractor's profit (%)" value={rates.pctProfit} onChange={v => setRates(p => ({ ...p, pctProfit: parseFloat(v) || 0 }))} />
          <Field label="GST (%)" value={rates.pctGst} onChange={v => setRates(p => ({ ...p, pctGst: parseFloat(v) || 0 }))} />
          <Field label="Steel wastage (%)" value={rates.pctSteelWaste} onChange={v => setRates(p => ({ ...p, pctSteelWaste: parseFloat(v) || 0 }))} />
        </div>
      </section>

      {/* Calculate button */}
      <div className="flex items-center gap-4">
        <button
          onClick={calculate}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-[#FF6A00]/20"
        >
          <Calculator className="w-4 h-4" />
          Calculate BOQ & cost
        </button>
        <span className="text-xs text-gray-500">Adjust anything above and recalculate any time.</span>
      </div>

      {/* Results */}
      {results && boq && (
        <div ref={resultsRef} className="bg-[#0E0E0E] text-white rounded-xl p-6 space-y-6">
          {/* Material Requisition */}
          <div>
            <h2 className="text-lg font-bold">Material requisition</h2>
            <p className="text-xs text-gray-400 mb-4">
              {results.floors.length} floor{results.floors.length > 1 ? 's' : ''} —{' '}
              {results.floors.map(f => `${f.label} (${f.length}×${f.width} ft)`).join(', ')}.
              Total built-up area {fmt(totalSqft)} sqft.
            </p>
            <div className="divide-y divide-gray-700/50">
              {([
                ['Cement', fmt(results.totalCementBags), 'bags (50 kg)'],
                ['Sand', `${fmt(results.totalSandM3 * M3_TO_CFT)} cft`, `(${fmt(results.totalSandM3, 1)} m³)`],
                ['Aggregate / gravel', `${fmt(results.totalAggM3 * M3_TO_CFT)} cft`, `(${fmt(results.totalAggM3, 1)} m³)`],
                ['Steel (TMT bars)', fmt(results.totalSteelKg), `kg (${fmt(results.totalSteelKg / 1000, 2)} tons)`],
                ['Concrete poured', fmt(results.totalConcreteM3, 1), 'm³ total (footing + columns + slab)'],
                ['Bricks', fmt(results.brickCount), 'nos'],
                ['Flooring', fmt(results.flooringSqft), 'sqft (wastage included)'],
                ['Paint', fmt(results.paintLitres), 'litres, all coats'],
              ] as [string, string, string][]).map(([name, qty, unit]) => (
                <div key={name} className="flex justify-between py-2.5 text-sm">
                  <span className="text-gray-300">{name}</span>
                  <div className="text-right">
                    <span className="font-mono font-bold">{qty}</span>
                    <span className="text-gray-500 text-xs ml-2">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              Show stage-by-stage breakdown
            </button>
            {showBreakdown && (
              <div className="mt-4 space-y-4">
                {[
                  { title: 'Foundation — PCC bed', data: results.breakdown.pcc },
                  { title: 'Foundation — RCC footing', data: results.breakdown.rccFooting },
                  { title: 'Columns', data: results.breakdown.columns },
                  { title: 'Roof / slab (all floors)', data: results.breakdown.slab },
                ].map(({ title, data }) => (
                  <div key={title}>
                    <h3 className="text-xs font-bold text-[#4C6E93] mb-1">{title}</h3>
                    <div className="space-y-0.5 text-xs text-gray-300">
                      <div className="flex justify-between"><span>Cement</span><span className="font-mono">{fmt(data.cementBags, 1)} bags</span></div>
                      <div className="flex justify-between"><span>Sand</span><span className="font-mono">{fmt(data.sandM3 * M3_TO_CFT)} cft</span></div>
                      {data.aggM3 > 0 && <div className="flex justify-between"><span>Aggregate</span><span className="font-mono">{fmt(data.aggM3 * M3_TO_CFT)} cft</span></div>}
                      {data.steelKg > 0 && <div className="flex justify-between"><span>Steel</span><span className="font-mono">{fmt(data.steelKg)} kg</span></div>}
                      <div className="flex justify-between"><span>Concrete volume</span><span className="font-mono">{fmt(data.volumeM3, 2)} m³</span></div>
                    </div>
                  </div>
                ))}
                <div>
                  <h3 className="text-xs font-bold text-[#4C6E93] mb-1">Walls (all floors)</h3>
                  <div className="space-y-0.5 text-xs text-gray-300">
                    <div className="flex justify-between"><span>Bricks</span><span className="font-mono">{fmt(results.breakdown.brickCount)} nos</span></div>
                    <div className="flex justify-between"><span>Mortar cement</span><span className="font-mono">{fmt(results.breakdown.wallMortar.cementBags, 1)} bags</span></div>
                    <div className="flex justify-between"><span>Mortar sand</span><span className="font-mono">{fmt(results.breakdown.wallMortar.sandM3 * M3_TO_CFT)} cft</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#4C6E93] mb-1">Plaster (all floors)</h3>
                  <div className="space-y-0.5 text-xs text-gray-300">
                    <div className="flex justify-between"><span>Internal cement</span><span className="font-mono">{fmt(results.breakdown.internalPlaster.cementBags, 1)} bags</span></div>
                    <div className="flex justify-between"><span>Internal sand</span><span className="font-mono">{fmt(results.breakdown.internalPlaster.sandM3 * M3_TO_CFT)} cft</span></div>
                    <div className="flex justify-between"><span>External cement</span><span className="font-mono">{fmt(results.breakdown.externalPlaster.cementBags, 1)} bags</span></div>
                    <div className="flex justify-between"><span>External sand</span><span className="font-mono">{fmt(results.breakdown.externalPlaster.sandM3 * M3_TO_CFT)} cft</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#4C6E93] mb-1">Finishing (all floors)</h3>
                  <div className="space-y-0.5 text-xs text-gray-300">
                    <div className="flex justify-between"><span>Flooring</span><span className="font-mono">{fmt(results.breakdown.flooringSqft)} sqft</span></div>
                    <div className="flex justify-between"><span>Paint</span><span className="font-mono">{fmt(results.breakdown.paintLitres)} litres</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOQ Table */}
          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-lg font-bold mb-1">Bill of Quantities</h2>
            <p className="text-xs text-gray-400 mb-3">Item-wise quantity × rate = amount.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-xs text-[#4C6E93] uppercase tracking-wider">
                    <th className="text-left py-2 pr-2">Sr</th>
                    <th className="text-left py-2 pr-2">Item description</th>
                    <th className="text-right py-2 pr-2">Qty</th>
                    <th className="text-left py-2 pr-2">Unit</th>
                    <th className="text-right py-2 pr-2">Rate (₹)</th>
                    <th className="text-right py-2">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {boq.items.map(it => (
                    <tr key={it.sr} className="border-b border-gray-700/50">
                      <td className="py-2 pr-2">{it.sr}</td>
                      <td className="py-2 pr-2 text-gray-300">{it.desc}</td>
                      <td className="py-2 pr-2 text-right font-mono font-bold">{fmt(it.qty, 2)}</td>
                      <td className="py-2 pr-2 text-gray-400">{it.unit}</td>
                      <td className="py-2 pr-2 text-right font-mono">{fmt(it.rate)}</td>
                      <td className="py-2 text-right font-mono">{fmt(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-lg font-bold mb-1">Cost summary</h2>
            <p className="text-xs text-gray-400 mb-3">Material → Labour → T&P → Profit → GST.</p>
            <div className="space-y-0 text-sm">
              {[
                ['A', 'Material cost (structural items)', boq.costs.A_material],
                ['B', 'Other direct costs (excavation, flooring, paint)', boq.costs.B_other],
              ].map(([label, desc, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-300"><span className="font-mono text-gray-500 mr-2">{label}</span>{desc}</span>
                  <span className="font-mono font-bold">{fmt(val as number)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-gray-700/50 italic text-gray-400">
                <span>Subtotal (A+B)</span>
                <span className="font-mono">{fmt(boq.costs.A_material + boq.costs.B_other)}</span>
              </div>
              {[
                ['C', `Labour (${boq.costs.pct.pctLabour}% of A)`, boq.costs.C_labour],
                ['D', `T&P (${boq.costs.pct.pctTnp}% of A+B+C)`, boq.costs.D_tnp],
                ['E', `Contractor's profit (${boq.costs.pct.pctProfit}% of A+B+C+D)`, boq.costs.E_profit],
                ['F', `GST (${boq.costs.pct.pctGst}% of A+B+C+D+E)`, boq.costs.F_gst],
              ].map(([label, desc, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-300"><span className="font-mono text-gray-500 mr-2">{label}</span>{desc}</span>
                  <span className="font-mono">{fmt(val as number)}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 border-t-2 border-white font-bold text-base">
                <span>GRAND TOTAL</span>
                <span className="font-mono">₹ {fmt(boq.costs.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Steel Summary */}
          <div className="border-t border-gray-700 pt-4">
            <h2 className="text-lg font-bold mb-1">Steel / Bar Bending summary</h2>
            <p className="text-xs text-gray-400 mb-3">Reinforcement by structural element, with wastage allowance.</p>
            <div className="space-y-0 text-sm">
              {boq.steel.sources.map(x => (
                <div key={x.name} className="flex justify-between py-2 border-b border-gray-700/50">
                  <span className="text-gray-300">{x.name}</span>
                  <span className="font-mono font-bold">{fmt(x.kg)} kg</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-b border-gray-700/50 italic text-gray-400">
                <span>Total (before wastage)</span>
                <span className="font-mono">{fmt(boq.steel.totalSteelKg)} kg</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700/50">
                <span className="text-gray-300">Wastage allowance ({boq.steel.wastePct}%)</span>
                <span className="font-mono">{fmt(boq.steel.totalInclWaste - boq.steel.totalSteelKg)} kg</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-white font-bold">
                <span>Total steel to procure</span>
                <span className="font-mono">{fmt(boq.steel.totalInclWaste)} kg ({fmt(boq.steel.tonnes, 2)} t)</span>
              </div>
            </div>
          </div>

          {/* CSV Download */}
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-gray-800 text-white font-bold text-sm rounded-xl border border-gray-600 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download BOQ (CSV, opens in Excel)
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 max-w-3xl">
        Figures use standard Indian thumb-rule ratios and a 1.54 dry-volume factor for concrete, 1.27–1.33 for mortar.
        Treat this as a working estimate for procurement planning, not a substitute for a structural engineer's bill of quantities —
        get footing, column and steel sizing checked by an engineer before you order steel and concrete.
      </p>
    </div>
  );
};
