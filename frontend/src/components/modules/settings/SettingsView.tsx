import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Globe, 
  Mic, 
  Bell, 
  ShieldCheck, 
  Database, 
  Sparkles,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';
import type { LanguageCode } from '../../../types';

export const SettingsView: React.FC = () => {
  const [defaultLanguage, setDefaultLanguage] = useState<LanguageCode>('hi');
  const [enableVoiceAudio, setEnableVoiceAudio] = useState(true);
  const [autoSyncEVM, setAutoSyncEVM] = useState(true);
  const [instantChallanOCR, setInstantChallanOCR] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sm_preferences');
    if (!saved) return;
    try {
      const preferences = JSON.parse(saved);
      setDefaultLanguage(preferences.defaultLanguage || 'hi');
      setEnableVoiceAudio(preferences.enableVoiceAudio !== false);
      setAutoSyncEVM(preferences.autoSyncEVM !== false);
      setInstantChallanOCR(preferences.instantChallanOCR !== false);
    } catch {
      localStorage.removeItem('sm_preferences');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('sm_preferences', JSON.stringify({
      defaultLanguage, enableVoiceAudio, autoSyncEVM, instantChallanOCR,
    }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Configure multilingual voice recognition, OCR parsing accuracy, and project telemetry.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="self-start sm:self-auto px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs sm:text-sm shadow-lg shadow-[#FF5E14]/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4 text-white" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">Preferences saved successfully!</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-5">
        
        {/* Language & Voice Settings */}
        <div className="bg-[#161A24] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Language & Voice Parser Settings</h2>
              <p className="text-xs text-neutral-400">Configure primary dialect and automatic speech recognition</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-2">Default Spoken Dialect</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as LanguageCode)}
                className="w-full px-3.5 py-2.5 bg-[#0B0D13] border border-white/10 rounded-xl font-medium text-white focus:outline-none focus:border-[#FF5E14] focus:ring-1 focus:ring-[#FF5E14]/30 transition-colors"
              >
                <option value="hi" className="bg-[#161A24] text-white">Hindi (हिंदी) - Default</option>
                <option value="mr" className="bg-[#161A24] text-white">Marathi (मराठी)</option>
                <option value="en" className="bg-[#161A24] text-white">Indian English (EN-IN)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-2">Audio Playback Feedback</label>
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="checkbox"
                  id="voiceAudio"
                  checked={enableVoiceAudio}
                  onChange={(e) => setEnableVoiceAudio(e.target.checked)}
                  className="w-4 h-4 accent-[#FF5E14] rounded cursor-pointer"
                />
                <label htmlFor="voiceAudio" className="text-xs text-neutral-300 font-medium cursor-pointer">
                  Speak synthesis voice confirmation after parsing
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AI OCR & Vision */}
        <div className="bg-[#161A24] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Document OCR & Challan Intelligence</h2>
              <p className="text-xs text-neutral-400">Image recognition for delivery challans and weighbridge slips</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-4 bg-[#0B0D13] rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-white">Instant Material Stock Sync</p>
                <p className="text-neutral-400 text-[11px] mt-0.5">Automatically increase live inventory upon scanned challan confirmation</p>
              </div>
              <input
                type="checkbox"
                checked={instantChallanOCR}
                onChange={(e) => setInstantChallanOCR(e.target.checked)}
                className="w-4 h-4 accent-[#FF5E14] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0B0D13] rounded-2xl border border-white/10">
              <div>
                <p className="font-bold text-white">Automated EVM Reconciliation</p>
                <p className="text-neutral-400 text-[11px] mt-0.5">Recalculate Cost Performance Index (CPI) and Schedule Variance instantly</p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEVM}
                onChange={(e) => setAutoSyncEVM(e.target.checked)}
                className="w-4 h-4 accent-[#FF5E14] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-[#161A24] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 text-[#FF5E14] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Enterprise Security & Audit Trail</h2>
              <p className="text-xs text-neutral-400">Role-based access control and immutable shift logs</p>
            </div>
          </div>

          <div className="p-4 bg-[#0B0D13] border border-white/10 rounded-2xl text-xs text-neutral-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-400">Logged in as:</span>
              <span className="font-bold text-white">Authenticated workspace user</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-400">API Access:</span>
              <span className="text-emerald-400 font-semibold">JWT authentication required</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-400">Operational Records:</span>
              <span className="text-neutral-300">Persisted with created timestamps</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
