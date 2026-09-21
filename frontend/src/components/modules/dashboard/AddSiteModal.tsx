import React, { useState } from 'react';
import { X, Building2, MapPin, User, Briefcase, HardHat, Layers } from 'lucide-react';
import { sitesApi } from '../../../services/api';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (site: any) => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({ isOpen, onClose, onSiteCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    project_name: '',
    client: '',
    contractor: '',
    location: '',
    site_type: 'building',
    status: 'Active',
    progress_percent: 0,
    active_workers: 0,
    weather: 'Clear',
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.project_name.trim()) {
      setError('Site Name and Project Name are required.');
      return;
    }
    setIsLoading(true);
    try {
      const created = await sitesApi.create(form);
      // Fetch the full list to get the mapped version
      const all = await sitesApi.list();
      const newSite = all.find((s: any) => s.id === created.id) || all[all.length - 1];
      onSiteCreated(newSite);
      onClose();
      setForm({ name: '', project_name: '', client: '', contractor: '', location: '', site_type: 'building', status: 'Active', progress_percent: 0, active_workers: 0, weather: 'Clear' });
    } catch (err) {
      setError('Failed to create site. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0E0E0E] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF6A00] rounded-xl flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add New Site</h2>
              <p className="text-[10px] text-[#737373]">Create a new construction project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#262626] text-[#737373] hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Site Name <span className="text-[#FF6A00]">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  placeholder="e.g. Site Alpha — Block C"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                Project Name <span className="text-[#FF6A00]">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={form.project_name}
                  onChange={e => set('project_name', e.target.value)}
                  required
                  placeholder="e.g. Greenfield Towers Phase 2"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Client</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={form.client}
                  onChange={e => set('client', e.target.value)}
                  placeholder="Client name"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Contractor</label>
              <div className="relative">
                <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={form.contractor}
                  onChange={e => set('contractor', e.target.value)}
                  placeholder="Contractor name"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF6A00] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Site Type</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <select
                  value={form.site_type}
                  onChange={e => set('site_type', e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#FF6A00] transition-colors appearance-none cursor-pointer bg-white"
                >
                  <option value="building">Commercial Building</option>
                  <option value="precast">Precast Yard</option>
                  <option value="road">Road / Infrastructure</option>
                  <option value="residential">Residential</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Active Workers</label>
              <input
                type="number"
                value={form.active_workers}
                onChange={e => set('active_workers', parseInt(e.target.value) || 0)}
                min={0}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#FF6A00] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Site'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
