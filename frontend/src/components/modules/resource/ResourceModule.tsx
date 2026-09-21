import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Mic, 
  Plus, 
  ArrowRight, 
  Star, 
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  MaterialItem, 
  FinishedElement, 
  DispatchLog, 
  Vendor, 
  ElementStage 
} from '../../../types';

interface ResourceModuleProps {
  materials?: MaterialItem[];
  elements?: FinishedElement[];
  dispatches?: DispatchLog[];
  vendors?: Vendor[];
  isPrecastSite?: boolean;
  onUpdateMaterials: (materials: MaterialItem[]) => void;
  onUpdateElements: (elements: FinishedElement[]) => void;
  onAdjustMaterial?: (itemId: string, type: 'received' | 'consumed', amount: number) => void;
  onChangeElementStage?: (elementId: string, stage: ElementStage) => void;
  onOpenAIModal: (mode?: 'voice' | 'photo' | 'form') => void;
}

export const ResourceModule: React.FC<ResourceModuleProps> = ({
  materials = [],
  elements = [],
  dispatches = [],
  vendors = [],
  isPrecastSite = true,
  onUpdateMaterials,
  onUpdateElements,
  onAdjustMaterial,
  onChangeElementStage,
  onOpenAIModal,
}) => {
  const [subTab, setSubTab] = useState<'inventory' | 'elements' | 'dispatches' | 'vendors'>('inventory');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Finished elements stages
  const STAGES: ElementStage[] = ['Cast', 'Cured', 'Ready', 'Dispatched', 'Erected'];

  const handleStageChange = (elementId: string, newStage: ElementStage) => {
    const updated = elements.map(el => {
      if (el.id === elementId) {
        return { ...el, stage: newStage };
      }
      return el;
    });
    onUpdateElements(updated);
    onChangeElementStage?.(elementId, newStage);

    if (newStage === 'Erected') {
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch(e) {}
    }
  };

  const handleAdjustMaterialStock = (matId: string, type: 'received' | 'consumed', amount: number) => {
    const updated = materials.map(m => {
      if (m.id === matId) {
        let rec = m.receivedToday;
        let con = m.consumedToday;
        if (type === 'received') rec = Math.max(0, rec + amount);
        if (type === 'consumed') con = Math.max(0, con + amount);
        const current = m.openingStock + rec - con;
        const reorderStatus = current <= m.minReorderLevel * 0.5 ? 'Critical Reorder' :
                              current <= m.minReorderLevel ? 'Low Stock' : 'Sufficient';
        return {
          ...m,
          receivedToday: rec,
          consumedToday: con,
          currentStock: current,
          reorderStatus: reorderStatus as any,
        };
      }
      return m;
    });
    onUpdateMaterials(updated);
    onAdjustMaterial?.(matId, type, amount);
  };

  const filteredMaterials = materials.filter(m => {
    const matchesCat = filterCategory === 'All' || m.category === filterCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockCount = materials.filter(m => m.reorderStatus !== 'Sufficient').length;

  return (
    <div className="space-y-6">
      {/* Module Title & AI Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-brand-900">
                  Module 2: Resource & Material Management
                </h2>
                <span className="px-2 py-0.5 text-[11px] bg-brand-100 text-brand-800 font-medium rounded-md border border-brand-200">
                  OCR Challan + Voice GRN
                </span>
              </div>
              <p className="text-xs text-brand-500 mt-0.5">
                Stock balance, minimum reorder thresholds, Precast Kanban pipeline, and logistics dispatches
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={() => onOpenAIModal('voice')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-brand-50 text-brand-800 border border-brand-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4 text-brand-600" />
            <span className="hidden sm:inline">Voice Receipt</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-brand-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'inventory', label: 'Stock Inventory & Reorders', badge: lowStockCount > 0 ? `${lowStockCount} Reorders` : undefined },
          { id: 'elements', label: 'Finished Element Kanban', badge: `${elements.length} Elements` },
          { id: 'dispatches', label: 'Logistics & Haulage Dispatches', badge: `${dispatches.length} Active` },
          { id: 'vendors', label: 'Vendor & Supplier Scorecard' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              subTab === tab.id
                ? 'bg-brand-800 text-white shadow-xs'
                : 'text-brand-600 hover:text-brand-900 hover:bg-brand-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                subTab === tab.id ? 'bg-brand-900 text-white' : 'bg-brand-200 text-brand-800'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SubTab 1: Stock Inventory & Reorder Alerts */}
      {subTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-brand-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Cement & Aggregates', 'Steel & Reinforcement', 'Chemicals & Additives', 'Formwork & Shuttering'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-brand-800 text-white shadow-xs'
                      : 'text-brand-600 hover:text-brand-900 hover:bg-brand-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-brand-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search materials or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-50 border border-brand-200 text-xs pl-8 pr-3 py-1.5 rounded-lg text-brand-900 placeholder:text-brand-400 w-full sm:w-60 focus:outline-brand-800"
              />
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-xl border border-brand-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-700">
                <thead className="bg-brand-50 text-brand-500 uppercase tracking-wider text-[11px] border-b border-brand-200">
                  <tr>
                    <th className="py-3 px-4">Material Name</th>
                    <th className="py-3 px-3">Opening</th>
                    <th className="py-3 px-3">Received Today</th>
                    <th className="py-3 px-3">Consumed Today</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Reorder Alert</th>
                    <th className="py-3 px-3">Wastage %</th>
                    <th className="py-3 px-3 text-right">Stock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {filteredMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-brand-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-brand-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                          <span>{m.name}</span>
                        </div>
                        <span className="text-[11px] text-brand-400 block font-normal truncate max-w-xs">{m.supplier}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-brand-500">
                        {m.openingStock} {m.unit}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {m.receivedToday > 0 ? (
                          <span className="text-brand-800 font-bold bg-brand-100 px-2 py-0.5 rounded border border-brand-200">
                            +{m.receivedToday}
                          </span>
                        ) : (
                          <span className="text-brand-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {m.consumedToday > 0 ? (
                          <span className="text-brand-800 font-bold bg-brand-100 px-2 py-0.5 rounded border border-brand-200">
                            -{m.consumedToday}
                          </span>
                        ) : (
                          <span className="text-brand-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-brand-900">
                        {m.currentStock} <span className="text-[10px] font-normal text-brand-500">{m.unit}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.reorderStatus === 'Sufficient' ? 'bg-brand-100 text-brand-800 border border-brand-200' :
                          m.reorderStatus === 'Low Stock' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                          'bg-brand-200 text-brand-900 border border-brand-300'
                        }`}>
                          {m.reorderStatus !== 'Sufficient' && <AlertTriangle className="w-3 h-3" />}
                          {m.reorderStatus} (Min: {m.minReorderLevel})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={m.wastagePercent > 4 ? 'text-brand-800 font-semibold' : 'text-brand-600'}>
                          {m.wastagePercent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 bg-brand-50 p-0.5 rounded-lg border border-brand-200">
                          <button
                            onClick={() => handleAdjustMaterialStock(m.id, 'received', 10)}
                            className="px-2 py-1 bg-white hover:bg-brand-100 text-brand-800 font-semibold text-[10px] rounded border border-brand-200 cursor-pointer"
                            title="+10 Received"
                          >
                            +10 In
                          </button>
                          <button
                            onClick={() => handleAdjustMaterialStock(m.id, 'consumed', 10)}
                            className="px-2 py-1 bg-white hover:bg-brand-100 text-brand-800 font-semibold text-[10px] rounded border border-brand-200 cursor-pointer"
                            title="+10 Consumed"
                          >
                            +10 Use
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Finished Element Kanban Board */}
      {subTab === 'elements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-brand-900">
                Precast & Modular Elements Pipeline
              </h3>
              <p className="text-xs text-brand-500">Track elements from Casting Yard Bed through Curing to On-site Erection</p>
            </div>
            <button
              onClick={() => onOpenAIModal('voice')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log New Cast</span>
            </button>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STAGES.map((stage, sIdx) => {
              const stageElements = elements.filter(el => el.stage === stage);
              const stageBadgeColors: Record<ElementStage, string> = {
                Cast: 'bg-brand-50 text-brand-800 border-brand-200',
                Cured: 'bg-brand-100 text-brand-800 border-brand-200',
                Ready: 'bg-brand-100 text-brand-800 border-brand-200',
                Dispatched: 'bg-brand-200 text-brand-900 border-brand-300',
                Erected: 'bg-brand-800 text-white border-brand-900',
              };

              return (
                <div key={stage} className="bg-white rounded-xl border border-brand-200 p-3.5 flex flex-col min-h-[420px] shadow-xs">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-brand-100">
                    <span className="font-semibold text-xs text-brand-900 flex items-center gap-1.5">
                      <span>{sIdx + 1}.</span> {stage}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${stageBadgeColors[stage]}`}>
                      {stageElements.length}
                    </span>
                  </div>

                  {/* Elements List */}
                  <div className="space-y-2 flex-1">
                    {stageElements.map((el) => (
                      <div
                        key={el.id}
                        className="bg-brand-50/80 p-3 rounded-lg border border-brand-200 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-brand-900 block font-mono text-[11px]">{el.elementTag}</span>
                            <span className="text-[10px] text-brand-500">{el.type}</span>
                          </div>
                          {el.qcInspectionPassed && (
                            <span className="text-brand-800 text-[10px] flex items-center gap-0.5 font-semibold" title="QC Passed">
                              <Check className="w-3 h-3" /> QC
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-brand-600 space-y-0.5 font-mono">
                          <p>📍 {el.targetLocation}</p>
                          <p>⚖️ {el.weightTons} MT ({el.dimensions})</p>
                        </div>

                        {/* Stage Progression Buttons */}
                        <div className="pt-2 border-t border-brand-200 flex items-center justify-between">
                          {sIdx > 0 && (
                            <button
                              onClick={() => handleStageChange(el.id, STAGES[sIdx - 1])}
                              className="text-[10px] text-brand-500 hover:text-brand-800 font-medium cursor-pointer"
                            >
                              ← Back
                            </button>
                          )}
                          {sIdx < STAGES.length - 1 && (
                            <button
                              onClick={() => handleStageChange(el.id, STAGES[sIdx + 1])}
                              className="ml-auto text-[10px] text-brand-800 hover:text-brand-900 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {stage === 'Erected' && (
                            <span className="text-[10px] text-brand-800 font-semibold ml-auto flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SubTab 3: Logistics & Dispatches */}
      {subTab === 'dispatches' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-brand-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-700" />
              <span>Active Material & Precast Dispatches</span>
            </h3>

            <div className="space-y-3">
              {dispatches.map((disp) => (
                <div key={disp.id} className="bg-brand-50/70 p-4 rounded-xl border border-brand-200 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-brand-200">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-brand-100 text-brand-800 border border-brand-200 rounded font-mono font-semibold text-[10px]">
                        {disp.grnNo}
                      </span>
                      <span className="font-semibold text-brand-900">{disp.elementOrMaterial}</span>
                      <span className="text-brand-500 font-mono">({disp.quantity})</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      disp.status === 'In Transit' ? 'bg-brand-100 text-brand-800 border border-brand-200' :
                      disp.status === 'Delivered' ? 'bg-brand-100 text-brand-800 border border-brand-200' :
                      'bg-brand-50 text-brand-600'
                    }`}>
                      {disp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-brand-600">
                    <div>
                      <p className="text-brand-400 font-medium">Route & Locations:</p>
                      <p className="font-medium text-brand-900">From: {disp.origin}</p>
                      <p className="font-medium text-brand-900">To: {disp.destination}</p>
                    </div>
                    <div>
                      <p className="text-brand-400 font-medium">Transporter & Vehicle:</p>
                      <p className="font-medium text-brand-900">{disp.transporter}</p>
                      <p className="font-mono text-brand-800 font-medium">{disp.vehicleNo}</p>
                      <p className="text-[10px] text-brand-500">Driver: {disp.driverContact}</p>
                    </div>
                    <div>
                      <p className="text-brand-400 font-medium">Timing & Status:</p>
                      <p className="font-mono text-brand-700">Dispatched: {disp.dispatchTime}</p>
                      <p className="font-mono text-brand-800 font-semibold">ETA: {disp.eta}</p>
                      {disp.receiptConfirmedBy && (
                        <p className="text-brand-800 text-[10px] mt-0.5 font-medium">Confirmed by: {disp.receiptConfirmedBy}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Vendor & Supplier Scorecard */}
      {subTab === 'vendors' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-xl border border-brand-200 p-5 shadow-xs flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-800 rounded border border-brand-200">
                      {vendor.type}
                    </span>
                    <div className="flex items-center gap-1 text-brand-800 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{vendor.rating} / 5.0</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-brand-900">{vendor.name}</h3>
                  <p className="text-[11px] text-brand-500 mt-0.5">
                    Supplies: {vendor.materialsSupplied.join(', ')}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-brand-100">
                    <div className="bg-brand-50 p-2.5 rounded-lg border border-brand-200">
                      <p className="text-[10px] text-brand-500">On-Time Delivery Rate</p>
                      <p className="text-base font-bold text-brand-900 font-mono mt-0.5">{vendor.onTimeDeliveryRate}%</p>
                    </div>
                    <div className="bg-brand-50 p-2.5 rounded-lg border border-brand-200">
                      <p className="text-[10px] text-brand-500">Quality Pass Rate</p>
                      <p className="text-base font-bold text-brand-900 font-mono mt-0.5">{vendor.qualityPassRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-brand-100 flex items-center justify-between text-[11px]">
                  <span className="text-brand-500">Total Billed YTD: <strong className="text-brand-900">₹{(vendor.totalBilledYTD / 10000000).toFixed(2)} Cr</strong></span>
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    vendor.paymentStatus === 'Cleared' ? 'bg-brand-100 text-brand-800 border border-brand-200' : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}>
                    {vendor.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
