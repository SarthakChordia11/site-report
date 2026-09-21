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
import { LanguageCode } from '../../../types';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E0E0E] tracking-tight">
            Settings & System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] mt-1">
            Configure multilingual voice recognition, OCR parsing accuracy, and project telemetry.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#FF6A00] hover:bg-[#E65F00] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-[#FF6A00]/25 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Preferences saved successfully!</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-5">
        
        {/* Language & Voice Settings */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0E0E0E]">Language & Voice Parser Settings</h2>
              <p className="text-xs text-[#737373]">Configure primary dialect and automatic speech recognition</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#0E0E0E] mb-1.5">Default Spoken Dialect</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value as LanguageCode)}
                className="w-full px-3 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-lg font-medium text-[#0E0E0E] focus:outline-none focus:border-[#FF6A00]"
              >
                <option value="hi">Hindi (हिंदी) - Default</option>
                <option value="mr">Marathi (मराठी)</option>
                <option value="en">Indian English (EN-IN)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#0E0E0E] mb-1.5">Audio Playback Feedback</label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="voiceAudio"
                  checked={enableVoiceAudio}
                  onChange={(e) => setEnableVoiceAudio(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6A00] rounded cursor-pointer"
                />
                <label htmlFor="voiceAudio" className="text-xs text-[#0E0E0E] font-medium cursor-pointer">
                  Speak synthesis voice confirmation after parsing
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AI OCR & Vision */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FF6A00] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0E0E0E]">Document OCR & Challan Intelligence</h2>
              <p className="text-xs text-[#737373]">Image recognition for delivery challans and weighbridge slips</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
              <div>
                <p className="font-bold text-[#0E0E0E]">Instant Material Stock Sync</p>
                <p className="text-[#737373] text-[11px]">Automatically increase live inventory upon scanned challan confirmation</p>
              </div>
              <input
                type="checkbox"
                checked={instantChallanOCR}
                onChange={(e) => setInstantChallanOCR(e.target.checked)}
                className="w-4 h-4 accent-[#FF6A00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
              <div>
                <p className="font-bold text-[#0E0E0E]">Automated EVM Reconciliation</p>
                <p className="text-[#737373] text-[11px]">Recalculate Cost Performance Index (CPI) and Schedule Variance instantly</p>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEVM}
                onChange={(e) => setAutoSyncEVM(e.target.checked)}
                className="w-4 h-4 accent-[#FF6A00] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5E5]">
            <div className="w-9 h-9 rounded-lg bg-[#0E0E0E] text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0E0E0E]">Enterprise Security & Audit Trail</h2>
              <p className="text-xs text-[#737373]">Role-based access control and immutable shift logs</p>
            </div>
          </div>

          <div className="p-4 bg-[#F7F7F7] rounded-xl text-xs text-[#525252] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#0E0E0E]">Logged in as:</span>
              <span className="font-bold text-[#FF6A00]">Authenticated workspace user</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#0E0E0E]">API Access:</span>
              <span className="text-emerald-600 font-semibold">JWT authentication required</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#0E0E0E]">Operational Records:</span>
              <span className="text-[#0E0E0E]">Persisted with created timestamps</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
