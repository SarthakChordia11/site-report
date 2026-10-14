import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  AlertTriangle, 
  Mic, 
  Fuel, 
  Activity,
  User,
  AlertCircle
} from 'lucide-react';
import type { EquipmentItem, BreakdownEvent, EquipmentStatus } from '../../../types';

interface EquipmentModuleProps {
  equipment?: EquipmentItem[];
  breakdowns?: BreakdownEvent[];
  onUpdateEquipment: (equipment: EquipmentItem[]) => void;
  onUpdateBreakdowns: (breakdowns: BreakdownEvent[]) => void;
  onPersistEquipment?: (equipment: EquipmentItem) => void;
  onOpenAIModal: () => void;
}

export const EquipmentModule: React.FC<EquipmentModuleProps> = ({
  equipment = [],
  breakdowns = [],
  onUpdateEquipment,
  onPersistEquipment,
  onOpenAIModal,
}) => {
  const [subTab, setSubTab] = useState<'status' | 'utilization' | 'rental' | 'breakdowns'>('status');

  const totalMachines = equipment.length;
  const workingCount = equipment.filter(e => e.status === 'Working').length;
  const idleCount = equipment.filter(e => e.status === 'Idle').length;
  const breakdownCount = equipment.filter(e => e.status === 'Breakdown').length;

  const totalWorkingHours = equipment.reduce((acc, e) => acc + e.workingHoursToday, 0);
  const totalIdleHours = equipment.reduce((acc, e) => acc + e.idleHoursToday, 0);
  const totalBreakdownHours = equipment.reduce((acc, e) => acc + e.breakdownHoursToday, 0);
  const totalDailyRentalCost = equipment.reduce((acc, e) => acc + (e.ownership === 'Rented' ? e.dailyRate : 0), 0);
  const totalFuelLiters = equipment.reduce((acc, e) => acc + e.fuelConsumedLiters, 0);

  const handleStatusToggle = (eqId: string, nextStatus: EquipmentStatus) => {
    const updated = equipment.map(e => {
      if (e.id === eqId) {
        if (nextStatus === 'Working') {
          return { ...e, status: nextStatus, workingHoursToday: Math.max(1, e.workingHoursToday), idleHoursToday: 0, breakdownHoursToday: 0 };
        }
        if (nextStatus === 'Idle') {
          return { ...e, status: nextStatus, workingHoursToday: 0, idleHoursToday: Math.max(1, e.idleHoursToday), breakdownHoursToday: 0 };
        }
        return { ...e, status: nextStatus, workingHoursToday: 0, idleHoursToday: 0, breakdownHoursToday: Math.max(1, e.breakdownHoursToday) };
      }
      return e;
    });
    onUpdateEquipment(updated);
    const changed = updated.find(e => e.id === eqId);
    if (changed) onPersistEquipment?.(changed);
  };

  const handleHourChange = (eqId: string, field: 'workingHoursToday' | 'idleHoursToday', delta: number) => {
    const updated = equipment.map(e => {
      if (e.id === eqId) {
        const val = Math.max(0, e[field] + delta);
        return { ...e, [field]: val };
      }
      return e;
    });
    onUpdateEquipment(updated);
    const changed = updated.find(e => e.id === eqId);
    if (changed) onPersistEquipment?.(changed);
  };

  return (
    <div className="space-y-6">
      {/* Module Title & AI Quick Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161A24] p-5 rounded-2xl border border-white/10 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Module 3: Plant & Equipment Management
                </h2>
                <span className="px-2 py-0.5 text-[11px] bg-[#FF5E14]/15 text-[#FF5E14] font-medium rounded-md border border-[#FF5E14]/30">
                  Voice Machine Logs
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Asset register, daily working/idle hours, rental accrual tracking, and breakdown downtime analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>Voice Machinery Log ("Tower crane 7 ghante chali...")</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'status', label: 'Equipment Status Board', badge: `${workingCount}/${totalMachines} Active` },
          { id: 'utilization', label: 'Hours & Utilization Chart', badge: `${totalWorkingHours}h Total` },
          { id: 'rental', label: 'Rental Cost Accruals', badge: `₹${(totalDailyRentalCost / 1000).toFixed(0)}k/day` },
          { id: 'breakdowns', label: 'Breakdown & Downtime Log', badge: breakdownCount > 0 ? `${breakdownCount} BD` : undefined },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              subTab === tab.id
                ? 'bg-white text-neutral-950 font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                subTab === tab.id ? 'bg-neutral-900 text-white' : 'bg-white/10 text-neutral-300'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Fleet Availability</span>
            <Activity className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{workingCount}</span>
            <span className="text-xs text-neutral-400 font-medium">/ {totalMachines} Machines</span>
          </div>
          <p className="text-[11px] text-[#FF5E14] mt-1 font-medium">88% Uptime Target Met</p>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Daily Working Hours</span>
            <Clock className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{totalWorkingHours} hrs</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Average 6.2h per plant asset</p>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Idle & Downtime</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{totalIdleHours}h Idle</span>
            {totalBreakdownHours > 0 && <span className="text-xs text-rose-400 font-bold">• {totalBreakdownHours}h BD</span>}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">JCB 3DX: 3.0h (Trench clearance delay)</p>
        </div>

        <div className="bg-[#161A24] p-4 rounded-2xl border border-white/10 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Fuel & Energy Consumed</span>
            <Fuel className="w-4 h-4 text-[#FF5E14]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white">{totalFuelLiters} L</span>
            <span className="text-xs text-neutral-400 font-medium">Diesel</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">DG Set + Transit Mixer</p>
        </div>
      </div>

      {/* SubTab 1: Equipment Status Board */}
      {subTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((eq) => {
            const statusStyles: Record<EquipmentStatus, { badge: string; dot: string }> = {
              Working: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
              Idle: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
              Breakdown: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
              'Under Maintenance': { badge: 'bg-[#FF5E14]/15 text-[#FF5E14] border-[#FF5E14]/30', dot: 'bg-[#FF5E14]' },
            };
            const style = statusStyles[eq.status];

            return (
              <div key={eq.id} className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs flex flex-col justify-between text-xs space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-neutral-400 font-medium bg-[#0B0D13] border border-white/10 px-2 py-0.5 rounded">
                      {eq.assetTag}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1.5 ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                      {eq.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-tight">{eq.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                    <span>{eq.category}</span>
                    <span>•</span>
                    <span className="text-[#FF5E14] font-medium">{eq.ownership}</span>
                    {eq.ownership === 'Rented' && <span className="font-mono text-white font-semibold">₹{eq.dailyRate.toLocaleString()}/day</span>}
                  </div>

                  {/* Hours Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 bg-[#0B0D13] p-2.5 rounded-xl border border-white/10 text-center">
                    <div>
                      <p className="text-[10px] text-neutral-400">Working</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{eq.workingHoursToday}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400">Idle</p>
                      <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{eq.idleHoursToday}h</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-400">Downtime</p>
                      <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">{eq.breakdownHoursToday}h</p>
                    </div>
                  </div>

                  {eq.idleReason && (
                    <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Idle Reason:</strong> {eq.idleReason}</span>
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-neutral-400 space-y-1">
                    <p className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#FF5E14] shrink-0" /> Operator: <strong className="text-white">{eq.operatorName}</strong></p>
                    <p className="flex items-center gap-1.5"><Fuel className="w-3 h-3 text-[#FF5E14] shrink-0" /> Fuel: <span className="text-white font-mono font-medium">{eq.fuelConsumedLiters} Liters</span></p>
                  </div>
                </div>

                {/* Quick Status Switcher & Hours */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    {(['Working', 'Idle', 'Breakdown'] as EquipmentStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusToggle(eq.id, st)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                          eq.status === st ? 'bg-[#FF5E14] text-white font-bold' : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleHourChange(eq.id, 'workingHoursToday', 1)}
                      className="px-2 py-1 bg-white/5 hover:bg-[#FF5E14] hover:text-white text-neutral-200 border border-white/10 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                      title="+1h Working"
                    >
                      +1h
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SubTab 2: Utilization Chart */}
      {subTab === 'utilization' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white mb-1">Machine Daily Hours & Utilization Stack</h3>
            <p className="text-xs text-neutral-400 mb-5">Working vs Idle vs Downtime breakdown per machine today</p>

            <div className="space-y-3">
              {equipment.map((eq) => {
                const total = Math.max(8, eq.workingHoursToday + eq.idleHoursToday + eq.breakdownHoursToday);
                const workPct = (eq.workingHoursToday / total) * 100;
                const idlePct = (eq.idleHoursToday / total) * 100;
                const bdPct = (eq.breakdownHoursToday / total) * 100;

                return (
                  <div key={eq.id} className="bg-[#0B0D13] p-3.5 rounded-xl border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{eq.name} ({eq.assetTag})</span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-emerald-400 font-semibold">{eq.workingHoursToday}h Work</span>
                        <span className="text-amber-400 font-semibold">{eq.idleHoursToday}h Idle</span>
                        {eq.breakdownHoursToday > 0 && <span className="text-rose-400 font-semibold">{eq.breakdownHoursToday}h BD</span>}
                      </div>
                    </div>

                    {/* Progress bar stack */}
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${workPct}%` }} className="bg-emerald-500 h-full" title={`Working: ${eq.workingHoursToday}h`}></div>
                      <div style={{ width: `${idlePct}%` }} className="bg-amber-500 h-full" title={`Idle: ${eq.idleHoursToday}h`}></div>
                      <div style={{ width: `${bdPct}%` }} className="bg-rose-500 h-full" title={`Breakdown: ${eq.breakdownHoursToday}h`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 3: Rental Accruals */}
      {subTab === 'rental' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white mb-1">Rental Machinery Accrual & Billing Feeder</h3>
            <p className="text-xs text-neutral-400 mb-4">Equipment costs feed directly into Module 4 (Earned Value & Cost Variance)</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-[#0B0D13] text-neutral-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-3">Asset</th>
                    <th className="py-3 px-3">Vendor</th>
                    <th className="py-3 px-3">Daily Rate</th>
                    <th className="py-3 px-3">Rental Window</th>
                    <th className="py-3 px-3 text-right">Cumulative Accrued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {equipment.filter(e => e.ownership === 'Rented').map((eq) => (
                    <tr key={eq.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {eq.name}
                        <span className="text-[10px] text-neutral-400 block font-mono font-normal">{eq.assetTag}</span>
                      </td>
                      <td className="py-3 px-3 text-neutral-300">{eq.vendorName}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-white">₹{eq.dailyRate.toLocaleString()}</td>
                      <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">
                        {eq.rentalStartDate} to {eq.rentalEndDate}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#FF5E14] text-sm">
                        ₹{eq.totalAccruedRental.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Breakdowns */}
      {subTab === 'breakdowns' && (
        <div className="space-y-4">
          <div className="bg-[#161A24] rounded-2xl border border-white/10 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF5E14]" />
                  <span>Breakdown Events & Root Cause Downtime Log</span>
                </h3>
                <p className="text-xs text-neutral-400">Incident resolution tracking, technician reports, and cost impact</p>
              </div>
              <button
                onClick={onOpenAIModal}
                className="px-3 py-1.5 bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30 hover:bg-[#FF5E14] hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                + Log Breakdown via Voice
              </button>
            </div>

            <div className="space-y-2.5">
              {breakdowns.map((bd) => (
                <div key={bd.id} className="bg-[#0B0D13] p-4 rounded-xl border border-white/10 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <span className="font-semibold text-white text-sm">{bd.equipmentName}</span>
                      <span className="text-neutral-400 block text-[11px] font-mono">Reported: {bd.reportedAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded font-mono font-semibold text-[10px]">
                        {bd.downtimeMinutes} mins Downtime
                      </span>
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded font-semibold text-[10px]">
                        {bd.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-neutral-300 space-y-1 text-[11px]">
                    <p className="flex items-center gap-1.5"><AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> <strong>Root Cause:</strong> {bd.reason}</p>
                    <p className="flex items-center gap-1.5"><Wrench className="w-3 h-3 text-[#FF5E14] shrink-0" /> <strong>Action Taken:</strong> {bd.actionTaken}</p>
                    <div className="flex items-center justify-between pt-1 text-neutral-400">
                      <span>Technician: <strong className="text-white">{bd.technician}</strong></span>
                      <span>Repair Cost Impact: <strong className="text-[#FF5E14] font-mono">₹{bd.costImpact.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
