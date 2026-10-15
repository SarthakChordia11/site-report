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
import type { 
  InputMode, 
  ModuleId, 
  ExtractedAIData, 
  TradeRosterItem, 
  MaterialItem, 
  EquipmentItem 
} from '../../types';
import { 
  parseVoiceOrTextInput 
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
  const [isPaused, setIsPaused] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedResult, setExtractedResult] = useState<ExtractedAIData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{ labour_rows?: any[]; material_rows?: any[]; error?: string } | null>(null);

  // Quick form state
  const [formModule, setFormModule] = useState<ModuleId>('labour');
  const [formTrade, setFormTrade] = useState('Mason');
  const [formPresent, setFormPresent] = useState<number | ''>('');
  const [formAbsent, setFormAbsent] = useState<number | ''>('');
  const [formOT, setFormOT] = useState<number | ''>('');

  const [formMaterial, setFormMaterial] = useState('');
  const [formMatReceived, setFormMatReceived] = useState<number | ''>('');
  const [formMatConsumed, setFormMatConsumed] = useState<number | ''>('');
  const [formInvoice, setFormInvoice] = useState('');

  const [formEquip, setFormEquip] = useState('');
  const [formWorkingHours, setFormWorkingHours] = useState<number | ''>('');
  const [formIdleHours, setFormIdleHours] = useState<number | ''>('');

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

  const startRecording = () => {
    setVoiceText('');
    setExtractedResult(null);
    setIsRecording(true);
    setIsPaused(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (err) {
        console.log('Using simulated speech stream');
      }
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    if (recognitionRef.current) {
      // Append new speech on top of existing transcript
      const existingText = voiceText;
      recognitionRef.current.onresult = (event: any) => {
        let newSpeech = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          newSpeech += event.results[i][0].transcript;
        }
        if (newSpeech) {
          setVoiceText(existingText ? `${existingText} ${newSpeech}` : newSpeech);
        }
      };
      try { recognitionRef.current.start(); } catch (err) {
        console.log('Using simulated speech stream');
      }
    }
  };

  const doneRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
    setIsPaused(false);
    if (voiceText) {
      handleProcessVoice(voiceText);
    }
  };


  const playPresetAudio = (text: string) => {
    if (!text.trim()) return;
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
    const text = textToParse || voiceText || '';
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
      syntheticInput = `Aaj ${formTrade} ${formPresent || 0} present, ${formAbsent || 0} absent. OT ${formOT || 0} ghante kaam kiya.`;
    } else if (formModule === 'resource') {
      syntheticInput = `${formMaterial || 'Material'} ${formMatReceived || 0} units received, ${formMatConsumed || 0} units consumed. Invoice ${formInvoice || 'N/A'}.`;
    } else {
      syntheticInput = `${formEquip || 'Equipment'} aaj ${formWorkingHours || 0} ghante chali, ${formIdleHours || 0} ghante idle tha.`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#161A24] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0B0D13] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF5E14]/15 border border-[#FF5E14]/30 flex items-center justify-center text-[#FF5E14] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">AI Site Assistant</h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-[#FF5E14]/15 text-[#FF5E14] rounded-full border border-[#FF5E14]/30">
                  AI Voice Intelligence
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5 line-clamp-1 sm:line-clamp-none">Log attendance, materials, or machinery instantly</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Selector Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0B0D13]/60 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="p-1 bg-[#08090C] border border-white/10 rounded-full flex gap-1">
            <button
              onClick={() => { setActiveMode('voice'); setExtractedResult(null); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'voice'
                  ? 'bg-[#FF5E14] text-white shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Voice Input (Hindi/Marathi/English)</span>
              <span className="sm:hidden">Voice</span>
            </button>

            <button
              onClick={() => { setActiveMode('form'); setExtractedResult(null); }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'form'
                  ? 'bg-[#FF5E14] text-white shadow-md font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Quick Form</span>
              <span className="sm:hidden">Form</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Edge Engine Active</span>
          </div>
        </div>

        {/* Modal Body: Split view of Input + Extracted AI Output */}
        <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-7 space-y-4">
            {activeMode === 'voice' && (
              <div className="space-y-4">
                {/* Voice Recording Box */}
                <div className="bg-[#0B0D13] p-5 rounded-2xl border border-white/10 text-center relative">
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="text-neutral-300 font-semibold">Spoken Audio Stream</span>
                    <span className="text-[#FF5E14] font-mono text-[11px] bg-[#FF5E14]/15 px-2 py-0.5 rounded-full border border-[#FF5E14]/30">
                      Hindi / Marathi / English
                    </span>
                  </div>

                  {/* Mic Button & Waveform */}
                  <div className="flex flex-col items-center justify-center py-4">
                    {/* Idle: single mic button */}
                    {!isRecording && !isPaused && (
                      <button
                        onClick={startRecording}
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl shadow-[#FF5E14]/20 cursor-pointer bg-[#FF5E14] hover:bg-[#E04F0F] text-white"
                        title="Click to start recording"
                      >
                        <Mic className="w-7 h-7 text-white" />
                      </button>
                    )}

                    {/* Recording: Pause + Done */}
                    {isRecording && (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={pauseRecording}
                          title="Pause recording"
                          className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer bg-amber-500 hover:bg-amber-600 text-white animate-pulse ring-4 ring-amber-500/30"
                        >
                          <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                          </svg>
                        </button>
                        <button
                          onClick={doneRecording}
                          title="Stop and parse"
                          className="px-6 py-3 rounded-full bg-[#FF5E14] hover:bg-[#E04F0F] text-white text-xs font-bold shadow-md shadow-[#FF5E14]/20 cursor-pointer transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}

                    {/* Paused: Resume + Done */}
                    {isPaused && (
                      <div className="flex items-center gap-4">
                        <button
                          onClick={resumeRecording}
                          title="Resume recording"
                          className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer bg-[#FF5E14] hover:bg-[#E04F0F] text-white ring-4 ring-[#FF5E14]/30"
                        >
                          <Mic className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={doneRecording}
                          title="Stop and parse"
                          className="px-6 py-3 rounded-full bg-[#FF5E14] hover:bg-[#E04F0F] text-white text-xs font-bold shadow-md shadow-[#FF5E14]/20 cursor-pointer transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    )}

                    <p className="mt-3 text-xs font-medium text-neutral-300 flex items-center justify-center">
                      {isRecording ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#FF5E14] animate-ping inline-block mr-2" />
                          <span>Listening... Click Pause or Done when finished</span>
                        </>
                      ) : isPaused ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block mr-2" />
                          <span>Paused — Click Resume to continue speaking, or Done to parse</span>
                        </>
                      ) : (
                        'Tap Microphone to speak, or type site report manually'
                      )}
                    </p>
                  </div>

                  {/* Transcript Display & Editable Input */}
                  <div className="mt-3 text-left bg-[#161A24] p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                        Live Transcript (Editable):
                      </span>
                      {voiceText && (
                        <button
                          onClick={() => setVoiceText('')}
                          className="text-[10px] text-neutral-500 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={voiceText}
                      onChange={(e) => setVoiceText(e.target.value)}
                      placeholder="Spoken words will appear here in real-time, or type manually..."
                      className="w-full bg-transparent text-xs text-white placeholder-neutral-500 font-mono resize-none focus:outline-none"
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => playPresetAudio(voiceText)}
                      disabled={isPlayingAudio || !voiceText.trim()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 rounded-full text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-[#FF5E14] animate-bounce' : 'text-neutral-400'}`} />
                      <span>{isPlayingAudio ? 'Playing Audio...' : 'Hear Spoken Voice'}</span>
                    </button>

                    <button
                      onClick={() => handleProcessVoice()}
                      disabled={isProcessing || isRecording || !voiceText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs transition-all shadow-lg shadow-[#FF5E14]/20 cursor-pointer disabled:opacity-40"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      )}
                      <span>Extract with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeMode === 'form' && (
              <div className="space-y-4 bg-[#0B0D13] p-5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300 font-bold">Quick Manual Tap Form</span>
                  <span className="text-neutral-500">Structured Fallback</span>
                </div>

                {/* Target Module Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['labour', 'resource', 'equipment'] as ModuleId[]).map((mod) => (
                    <button
                      key={mod}
                      onClick={() => setFormModule(mod)}
                      className={`py-2 px-3 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                        formModule === mod
                          ? 'bg-[#FF5E14] text-white shadow-md'
                          : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>

                {formModule === 'labour' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5">Select Trade</label>
                      <select
                        value={formTrade}
                        onChange={(e) => setFormTrade(e.target.value)}
                        className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                      >
                        {(trades.length > 0 ? trades : [
                          { trade: 'Mason' },
                          { trade: 'Helper' },
                          { trade: 'Carpenter' },
                          { trade: 'Barbender' },
                          { trade: 'Electrician' },
                        ]).map((t: any) => (
                          <option key={t.trade} value={t.trade} className="bg-[#10131A] text-white">
                            {t.trade}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Present</label>
                        <input
                          type="number"
                          value={formPresent}
                          placeholder="0"
                          onChange={(e) => setFormPresent(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Absent</label>
                        <input
                          type="number"
                          value={formAbsent}
                          placeholder="0"
                          onChange={(e) => setFormAbsent(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">OT Hours</label>
                        <input
                          type="number"
                          value={formOT}
                          placeholder="0"
                          onChange={(e) => setFormOT(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formModule === 'resource' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5">Material Name</label>
                      <input
                        type="text"
                        value={formMaterial}
                        placeholder="e.g. OPC 53 Grade Cement"
                        onChange={(e) => setFormMaterial(e.target.value)}
                        className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Received</label>
                        <input
                          type="number"
                          value={formMatReceived}
                          placeholder="0"
                          onChange={(e) => setFormMatReceived(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Consumed</label>
                        <input
                          type="number"
                          value={formMatConsumed}
                          placeholder="0"
                          onChange={(e) => setFormMatConsumed(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5">Vendor Invoice #</label>
                      <input
                        type="text"
                        value={formInvoice}
                        placeholder="e.g. UT-9941"
                        onChange={(e) => setFormInvoice(e.target.value)}
                        className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                      />
                    </div>
                  </div>
                )}

                {formModule === 'equipment' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5">Equipment Name</label>
                      <input
                        type="text"
                        value={formEquip}
                        placeholder="e.g. Tower Crane"
                        onChange={(e) => setFormEquip(e.target.value)}
                        className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Working Hours</label>
                        <input
                          type="number"
                          value={formWorkingHours}
                          placeholder="0"
                          onChange={(e) => setFormWorkingHours(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-semibold mb-1.5">Idle Hours</label>
                        <input
                          type="number"
                          value={formIdleHours}
                          placeholder="0"
                          onChange={(e) => setFormIdleHours(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          className="w-full bg-[#10131A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FF5E14]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProcessQuickForm}
                  disabled={isProcessing}
                  className="w-full mt-2 py-3 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5E14]/20"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Structure & Auto-Route with AI</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: AI Extraction & Module Auto-Routing Result */}
          <div className="lg:col-span-5 flex flex-col bg-[#0B0D13] rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5E14] animate-pulse"></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  AI Structured Extraction
                </span>
              </div>
              {extractedResult && (
                <span className="px-2.5 py-0.5 bg-[#FF5E14]/15 text-[#FF5E14] text-[10px] font-mono font-bold rounded-full border border-[#FF5E14]/30">
                  {Math.round(extractedResult.confidence * 100)}% Match
                </span>
              )}
            </div>

            {isProcessing ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-neutral-400 text-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-[#FF5E14] mb-3" />
                <p className="font-bold text-white">Parsing Multilingual Audio & Documents...</p>
                <p className="text-[11px] text-neutral-400 mt-1">Voice Transcription → Structured Data Sync</p>
              </div>
            ) : extractedResult ? (
              <div className="flex-1 flex flex-col justify-between pt-3 space-y-3">
                <div className="space-y-3">
                  {/* Routed Module Badge */}
                  <div className="flex items-center justify-between bg-[#10131A] p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-neutral-400">Target Module Routing:</span>
                    <span className="px-3 py-1 bg-[#FF5E14]/15 text-[#FF5E14] border border-[#FF5E14]/30 text-xs font-bold rounded-full uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Module {extractedResult.module.toUpperCase()}</span>
                    </span>
                  </div>

                  {/* Auto-Sync Banner */}
                  {syncSummary && !syncSummary.error && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wide">Auto-Synced to Site Modules</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 pl-6">
                        Data from this voice report was automatically populated across the relevant modules.
                      </p>
                      <div className="pl-6 flex flex-wrap gap-2 text-[11px]">
                        {(syncSummary.labour_rows?.length ?? 0) > 0 && (
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-semibold">
                            Labour: {syncSummary.labour_rows!.length} trade row{syncSummary.labour_rows!.length > 1 ? 's' : ''} added
                          </span>
                        )}
                        {(syncSummary.material_rows?.length ?? 0) > 0 && (
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-semibold">
                            Materials: {syncSummary.material_rows!.length} item{syncSummary.material_rows!.length > 1 ? 's' : ''} updated
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {syncSummary?.error && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300">
                      Module sync note: DPR was recorded; live tables can be verified in respective tabs.
                    </div>
                  )}

                  {/* Intent & Language */}
                  <div className="text-xs space-y-1 bg-[#10131A] p-3 rounded-xl border border-white/10">
                    <p className="text-neutral-400">
                      Language: <strong className="text-white font-medium">{extractedResult.languageDetected}</strong>
                    </p>
                    <p className="text-neutral-400">
                      Intent: <span className="text-[#FF5E14] font-medium">{extractedResult.intent}</span>
                    </p>
                  </div>

                  {/* Parsed Actionable Changes */}
                  <div>
                    <p className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      Structured Fields to Sync:
                    </p>
                    <div className="space-y-1.5">
                      {extractedResult.actionSummary.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs bg-[#10131A] p-2.5 rounded-xl border border-white/10 text-neutral-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5E14] mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Raw JSON Preview */}
                  <div className="bg-[#10131A] p-3 rounded-xl border border-white/10 font-mono text-[10px] text-neutral-400 max-h-28 overflow-y-auto">
                    <pre>{JSON.stringify(extractedResult.parsedFields, null, 2)}</pre>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  id="apply-ai-extraction-btn"
                  onClick={handleApply}
                  className="w-full py-3.5 bg-[#FF5E14] hover:bg-[#E04F0F] text-white font-bold rounded-full text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#FF5E14]/20 transition-all cursor-pointer mt-4"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Apply & Sync to Live Site Database</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-neutral-400 text-xs text-center px-4">
                <Sparkles className="w-8 h-8 text-neutral-600 mb-2" />
                <p className="font-bold text-neutral-300">No input processed yet</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Speak into the mic or enter quick form to see structured output here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
