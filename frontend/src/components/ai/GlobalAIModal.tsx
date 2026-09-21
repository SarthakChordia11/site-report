import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Camera, 
  FileText, 
  Sparkles, 
  Volume2, 
  Check, 
  ArrowRight, 
  Upload, 
  RefreshCw,
  Layers,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  InputMode, 
  ModuleId, 
  ExtractedAIData, 
  TradeRosterItem, 
  MaterialItem, 
  EquipmentItem 
} from '../../types';
import { 
  SAMPLE_VOICE_PROMPTS, 
  SAMPLE_CHALLANS, 
  parseVoiceOrTextInput, 
  VoicePreset, 
  SampleChallan 
} from '../../utils/aiParser';
import { aiApi, dprApi } from '../../services/api';

interface GlobalAIModalProps {
  isOpen: boolean;
  initialMode?: InputMode;
  onClose: () => void;
  onApplyExtraction: (data: ExtractedAIData) => void;
  onModulesSynced?: () => void;  // NEW: called after DPR auto-syncs to modules
  trades?: TradeRosterItem[];
  materials?: MaterialItem[];
  equipment?: EquipmentItem[];
  activeSiteId?: string | null;
}

export const GlobalAIModal: React.FC<GlobalAIModalProps> = ({
  isOpen,
  initialMode = 'voice',
  onClose,
  onApplyExtraction,
  onModulesSynced,
  trades = [],
  materials = [],
  equipment = [],
  activeSiteId = null,
}) => {
  const [activeMode, setActiveMode] = useState<InputMode>(initialMode);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<VoicePreset | null>(SAMPLE_VOICE_PROMPTS[0]);
  const [selectedChallan, setSelectedChallan] = useState<SampleChallan | null>(SAMPLE_CHALLANS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedAIData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{ labour_rows?: any[]; material_rows?: any[]; error?: string } | null>(null);

  // Quick form state
  const [formModule, setFormModule] = useState<ModuleId>('labour');
  const [formTrade, setFormTrade] = useState('Mason');
  const [formPresent, setFormPresent] = useState(14);
  const [formAbsent, setFormAbsent] = useState(2);
  const [formOT, setFormOT] = useState(2);

  const [formMaterial, setFormMaterial] = useState('OPC 53 Grade Cement');
  const [formMatReceived, setFormMatReceived] = useState(200);
  const [formMatConsumed, setFormMatConsumed] = useState(140);
  const [formInvoice, setFormInvoice] = useState('UT-9941');

  const [formEquip, setFormEquip] = useState('Tower Crane');
  const [formWorkingHours, setFormWorkingHours] = useState(7);
  const [formIdleHours, setFormIdleHours] = useState(0);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode, isOpen]);

  // Handle live Web Speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setVoiceText(currentTranscript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsRecording(false);
      if (voiceText) {
        handleProcessVoice(voiceText);
      }
    } else {
      setVoiceText('');
      setExtractedResult(null);
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.log('Using simulated speech stream');
        }
      }
    }
  };

  const handleSelectPreset = (preset: VoicePreset) => {
    setSelectedPreset(preset);
    setVoiceText(preset.transcript);
    setExtractedResult(null);
  };

  const playPresetAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleProcessVoice = async (textToParse?: string) => {
    const text = textToParse || voiceText || selectedPreset?.transcript || '';
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const local = parseVoiceOrTextInput(text);
      const targetModule = local.module;

      if (activeSiteId) {
        let backendResult: any;
        
        // Always generate a full DPR from voice logs so the dashboard and PDF always have fullReport data.
        const resp = await dprApi.processVoice(text, local.languageDetected, "Site Workspace", "Construction Project", activeSiteId);
        backendResult = resp;
        
        // If the backend synced data, notify parent to reload module panels
        if (resp?.syncSummary && !resp.syncSummary.error) {
          setSyncSummary(resp.syncSummary);
          onModulesSynced?.();
        }
        
        // Ensure actionSummary exists in case backend doesn't send it properly.
        let summaryText = backendResult?.data?.executiveSummary || backendResult?.data?.summary || local.summaryText;
        let actionSummary = backendResult?.data?.actionSummary || local.actionSummary;
        
        if (!Array.isArray(actionSummary)) {
            actionSummary = [summaryText];
        }

        const mapped: ExtractedAIData = {
          module: targetModule,
          rawInput: text,
          languageDetected: local.languageDetected,
          confidence: 0.95,
          intent: local.intent,
          timestamp: new Date().toISOString(),
          parsedFields: backendResult?.data || backendResult, // Fallback depending on exact API format
          summaryText,
          actionSummary,
        };
        setExtractedResult(mapped);
      } else {
        setExtractedResult(local);
      }
    } catch (err) {
      console.error('AI extraction error:', err);
      const local = parseVoiceOrTextInput(text);
      setExtractedResult(local);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPhoto = async (challan?: SampleChallan, uploadedFile?: File) => {
    setIsProcessing(true);
    try {
      if (uploadedFile && activeSiteId) {
        const backendResult = await aiApi.extractImage('resource', uploadedFile, activeSiteId);
        const summary = backendResult?.data?.summary || 'Document fields extracted successfully.';
        setExtractedResult({
          module: 'resource',
          rawInput: `Document scanned: ${uploadedFile.name}`,
          languageDetected: 'English',
          confidence: 0.95,
          intent: 'OCR Document Extraction',
          timestamp: new Date().toISOString(),
          parsedFields: backendResult?.data || {},
          summaryText: summary,
          actionSummary: [summary],
        });
      } else if (challan) {
        const parsed = parseVoiceOrTextInput(challan.itemsText + ' ' + challan.challanNo);
        parsed.rawInput = `Sample challan: ${challan.title} (#${challan.challanNo})`;
        parsed.confidence = 0.998;
        setExtractedResult(parsed);
      }
    } catch (error) {
      console.error('Document extraction failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessQuickForm = async () => {
    setIsProcessing(true);
    let syntheticInput = '';
    if (formModule === 'labour') {
      syntheticInput = `Aaj ${formTrade} ${formPresent} present, ${formAbsent} absent. OT ${formOT} ghante kaam kiya.`;
    } else if (formModule === 'resource') {
      syntheticInput = `Cement ${formMatReceived} bags mila Ultratech se, ${formMatConsumed} bags use hua. Invoice ${formInvoice}.`;
    } else {
      syntheticInput = `${formEquip} aaj ${formWorkingHours} ghante chali, ${formIdleHours} ghante idle tha.`;
    }
    
    try {
      if (activeSiteId) {
        const backendResult = await aiApi.extract(formModule, syntheticInput, activeSiteId);
        const local = parseVoiceOrTextInput(syntheticInput);
        
        let summaryText = backendResult?.data?.summary || local.summaryText;
        let actionSummary = backendResult?.data?.actionSummary || local.actionSummary;
        if (!Array.isArray(actionSummary)) {
            actionSummary = [summaryText];
        }

        setExtractedResult({
          ...local,
          parsedFields: backendResult?.data || backendResult,
          summaryText,
          actionSummary,
        });
      } else {
        const parsed = parseVoiceOrTextInput(syntheticInput);
        setExtractedResult(parsed);
      }
    } catch (err) {
      console.error('AI Quick Form Error:', err);
      const parsed = parseVoiceOrTextInput(syntheticInput);
      setExtractedResult(parsed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!extractedResult) return;
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}

    onApplyExtraction(extractedResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-brand-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-brand-900">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-white border-b border-brand-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-brand-900">AI Site Operations Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-brand-100 text-brand-800 rounded border border-brand-200">
                  Groq Whisper + LLaMA 3.3
                </span>
              </div>
              <p className="text-xs text-brand-500">Log attendance, materials, or machinery instantly via natural input</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector Bar */}
        <div className="px-5 py-2.5 bg-brand-50/70 border-b border-brand-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 bg-brand-100/80 p-1 rounded-lg border border-brand-200">
            <button
              onClick={() => { setActiveMode('voice'); setExtractedResult(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeMode === 'voice'
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-brand-600 hover:text-brand-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-brand-700" />
              <span>Voice Input (Hindi/Marathi/English)</span>
            </button>



            <button
              onClick={() => { setActiveMode('form'); setExtractedResult(null); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeMode === 'form'
                  ? 'bg-white text-brand-900 shadow-xs'
                  : 'text-brand-600 hover:text-brand-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-brand-700" />
              <span>Quick Form</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-800"></span>
            <span>Edge Parser Ready</span>
          </div>
        </div>

        {/* Modal Body: Split view of Input + Extracted AI Output */}
        <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-7 space-y-4">
            {activeMode === 'voice' && (
              <div className="space-y-4">
                {/* Voice Recording Box */}
                <div className="bg-brand-50 p-4 rounded-xl border border-brand-200 text-center relative">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-brand-600 font-medium">Spoken Audio Stream</span>
                    <span className="text-brand-500 font-mono text-[11px]">Supports Hindi / Marathi / English</span>
                  </div>

                  {/* Mic Button & Waveform */}
                  <div className="flex flex-col items-center justify-center py-3">
                    <button
                      onClick={toggleRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform shadow-md cursor-pointer ${
                        isRecording 
                          ? 'bg-brand-900 text-white animate-pulse ring-4 ring-brand-300' 
                          : 'bg-brand-800 hover:bg-brand-900 text-white'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <p className="mt-2.5 text-xs font-medium text-brand-700">
                      {isRecording ? 'Listening... Click to stop & parse' : 'Tap Microphone or select preset voice below'}
                    </p>
                  </div>

                  {/* Transcript Display */}
                  <div className="mt-2 text-left bg-white p-3 rounded-lg border border-brand-200 min-h-[56px]">
                    <p className="text-[10px] text-brand-400 font-medium mb-0.5">Live Transcript:</p>
                    <p className="text-xs text-brand-800 italic font-mono">
                      "{voiceText || selectedPreset?.transcript || 'Press mic to record audio or select a preset prompt below...'}"
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => playPresetAudio(voiceText || selectedPreset?.transcript || '')}
                      disabled={isPlayingAudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-100 border border-brand-200 rounded-lg text-xs font-medium text-brand-700 transition-colors cursor-pointer"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-brand-900 animate-bounce' : 'text-brand-500'}`} />
                      <span>{isPlayingAudio ? 'Playing...' : 'Hear Spoken Voice'}</span>
                    </button>

                    <button
                      onClick={() => handleProcessVoice()}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-800 hover:bg-brand-900 text-white font-medium rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-brand-200" />}
                      <span>Extract with AI</span>
                    </button>
                  </div>
                </div>

              </div>
            )}



            {activeMode === 'form' && (
              <div className="space-y-4 bg-brand-50 p-4 rounded-xl border border-brand-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-700 font-medium">Quick Minimal Tap Form</span>
                  <span className="text-brand-400">Offline Fallback</span>
                </div>

                {/* Target Module Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['labour', 'resource', 'equipment'] as ModuleId[]).map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setFormModule(mod)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                        formModule === mod
                          ? 'bg-brand-800 text-white shadow-xs'
                          : 'bg-white border border-brand-200 text-brand-600 hover:text-brand-900'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>

                {formModule === 'labour' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-brand-600 font-medium mb-1">Select Trade</label>
                      <select
                        value={formTrade}
                        onChange={(e) => setFormTrade(e.target.value)}
                        className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                      >
                        {trades.map(t => <option key={t.trade} value={t.trade}>{t.trade}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Present Count</label>
                        <input
                          type="number"
                          value={formPresent}
                          onChange={(e) => setFormPresent(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Absent Count</label>
                        <input
                          type="number"
                          value={formAbsent}
                          onChange={(e) => setFormAbsent(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Overtime Hours</label>
                        <input
                          type="number"
                          value={formOT}
                          onChange={(e) => setFormOT(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formModule === 'resource' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-brand-600 font-medium mb-1">Material Name</label>
                      <input
                        type="text"
                        value={formMaterial}
                        onChange={(e) => setFormMaterial(e.target.value)}
                        className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Received (Bags/MT)</label>
                        <input
                          type="number"
                          value={formMatReceived}
                          onChange={(e) => setFormMatReceived(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Consumed Today</label>
                        <input
                          type="number"
                          value={formMatConsumed}
                          onChange={(e) => setFormMatConsumed(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-brand-600 font-medium mb-1">Vendor Invoice #</label>
                      <input
                        type="text"
                        value={formInvoice}
                        onChange={(e) => setFormInvoice(e.target.value)}
                        className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                      />
                    </div>
                  </div>
                )}

                {formModule === 'equipment' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-brand-600 font-medium mb-1">Equipment Name</label>
                      <input
                        type="text"
                        value={formEquip}
                        onChange={(e) => setFormEquip(e.target.value)}
                        className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Working Hours</label>
                        <input
                          type="number"
                          value={formWorkingHours}
                          onChange={(e) => setFormWorkingHours(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                      <div>
                        <label className="block text-brand-600 font-medium mb-1">Idle Hours</label>
                        <input
                          type="number"
                          value={formIdleHours}
                          onChange={(e) => setFormIdleHours(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-brand-200 rounded-lg p-2 text-brand-900 focus:outline-brand-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProcessQuickForm}
                  disabled={isProcessing}
                  className="w-full mt-2 py-2 bg-brand-800 hover:bg-brand-900 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-brand-200" />
                  <span>Structure & Auto-Route with AI</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Extraction & Module Auto-Routing Result */}
          <div className="lg:col-span-5 flex flex-col bg-brand-50/90 rounded-xl border border-brand-200 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-800"></span>
                <span className="text-xs font-semibold text-brand-900 uppercase tracking-wider">LLaMA 3.3 Extraction</span>
              </div>
              {extractedResult && (
                <span className="px-2 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-mono font-bold rounded border border-brand-200">
                  {Math.round(extractedResult.confidence * 100)}% Match
                </span>
              )}
            </div>

            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-brand-500 text-xs">
                <RefreshCw className="w-7 h-7 animate-spin text-brand-700 mb-3" />
                <p className="font-semibold text-brand-800">Parsing Multilingual Audio & Documents...</p>
                <p className="text-[11px] text-brand-500 mt-1">Groq Whisper Transcription → LLaMA 3.3 Structuring</p>
              </div>
            ) : extractedResult ? (
              <div className="flex-1 flex flex-col justify-between pt-3 space-y-3">
                <div className="space-y-3">
                  {/* Routed Module Badge */}
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-brand-200">
                    <span className="text-[11px] text-brand-500">Target Module Routing:</span>
                    <span className="px-2 py-1 bg-brand-800 text-white text-xs font-medium rounded uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Module {extractedResult.module.toUpperCase()}</span>
                    </span>
                  </div>

                  {/* ── Auto-Sync Banner ───────────────────────────────── */}
                  {syncSummary && !syncSummary.error && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wide">Auto-Synced to Site Modules</span>
                      </div>
                      <p className="text-[11px] text-emerald-600 pl-6">
                        Data from this voice report was automatically populated across the relevant modules — no re-entry needed!
                      </p>
                      <div className="pl-6 flex flex-wrap gap-2 text-[11px]">
                        {(syncSummary.labour_rows?.length ?? 0) > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full font-semibold">
                            👷 Labour: {syncSummary.labour_rows!.length} trade row{syncSummary.labour_rows!.length > 1 ? 's' : ''} added
                          </span>
                        )}
                        {(syncSummary.material_rows?.length ?? 0) > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full font-semibold">
                            📦 Materials: {syncSummary.material_rows!.length} item{syncSummary.material_rows!.length > 1 ? 's' : ''} updated
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {syncSummary?.error && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-700">
                      ⚠️ Module sync ran into an issue — DPR was saved but Labour/Material modules may need manual update.
                    </div>
                  )}

                  {/* Intent & Language */}
                  <div className="text-xs space-y-1">
                    <p className="text-brand-500">
                      Language Detected: <strong className="text-brand-800">{extractedResult.languageDetected}</strong>
                    </p>
                    <p className="text-brand-500">
                      Intent: <span className="text-brand-800">{extractedResult.intent}</span>
                    </p>
                  </div>

                  {/* Parsed Actionable Changes */}
                  <div>
                    <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider mb-1.5">
                      Structured Fields to Sync:
                    </p>
                    <div className="space-y-1.5">
                      {extractedResult.actionSummary.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs bg-white p-2 rounded-lg border border-brand-200 text-brand-900">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-700 mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON Preview */}
                  <div className="bg-white p-2.5 rounded-lg border border-brand-200 font-mono text-[10px] text-brand-700 max-h-28 overflow-y-auto">
                    <pre>{JSON.stringify(extractedResult.parsedFields, null, 2)}</pre>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  id="apply-ai-extraction-btn"
                  onClick={handleApply}
                  className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 text-brand-200" />
                  <span>Apply & Sync to Live Site Database</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-brand-400 text-xs text-center px-4">
                <Sparkles className="w-8 h-8 text-brand-300 mb-2" />
                <p className="font-medium text-brand-600">No input processed yet</p>
                <p className="text-[11px] text-brand-400 mt-1">
                  Speak into the mic, choose an audio preset, scan a challan photo, or enter tap form to see structured output here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
