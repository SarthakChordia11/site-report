const BASE = 'https://site-report-605b.onrender.com/api';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sm_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts?.headers || {}) },
  });
  if (!res.ok) {
    let message = `API ${path}: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.detail) {
        message = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (_) {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sm_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    req<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (email: string, password: string) =>
    req<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => req<any>('/auth/me'),
};

export const authHelpers = {
  saveSession: (token: string, user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sm_token', token);
      localStorage.setItem('sm_user', JSON.stringify(user));
    }
  },
  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sm_token');
      localStorage.removeItem('sm_user');
    }
  },
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('sm_token') : null,
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const u = localStorage.getItem('sm_user');
    return u ? JSON.parse(u) : null;
  },
  isLoggedIn: () => typeof window !== 'undefined' ? !!localStorage.getItem('sm_token') : false,
};

// Map a raw backend site to the shape the new frontend expects
function mapSite(s: any) {
  const typeMap: Record<string, string> = {
    precast: 'Precast Casting Yard',
    highrise: 'Commercial High-Rise',
    metro: 'Infrastructure / Metro',
    building: 'Commercial High-Rise',
    residential: 'Residential Complex',
  };
  return {
    ...s,
    code: s.id.slice(0, 8).toUpperCase(),
    type: typeMap[s.site_type] ?? 'Commercial High-Rise',
    isPrecast: s.site_type === 'precast',
    budgetTotal: 0,
    spentTotal: 0,
    startDate: '',
    plannedCompletionDate: '',
  };
}

// ─── Sites ────────────────────────────────────────────────────────────────────
export const sitesApi = {
  list: async () => {
    const data = await req<any[]>('/sites');
    return data.map(mapSite);
  },
  create: (data: any) => req<any>('/sites', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Labour ───────────────────────────────────────────────────────────────────
export const labourApi = {
  getAttendance: (siteId: string, date?: string) =>
    req<any[]>(`/labour/${siteId}/attendance${date ? `?log_date=${date}` : ''}`),
  logAttendanceBulk: (items: any[]) =>
    req<any>('/labour/attendance/bulk', { method: 'POST', body: JSON.stringify(items) }),
  upsertAttendance: (data: any) =>
    req<any>('/labour/attendance/upsert', { method: 'PUT', body: JSON.stringify(data) }),
  getSummary: (siteId: string, date?: string) =>
    req<any>(`/labour/${siteId}/summary${date ? `?for_date=${date}` : ''}`),
  getWagesSummary: (siteId: string) =>
    req<any[]>(`/labour/${siteId}/wages/summary`),
  getMobilization: (siteId: string) =>
    req<any[]>(`/labour/${siteId}/mobilization`),
  addMobilization: (data: any) =>
    req<any>('/labour/mobilization', { method: 'POST', body: JSON.stringify(data) }),
  getSafety: (siteId: string) =>
    req<any[]>(`/labour/${siteId}/safety`),
  addSafety: (data: any) =>
    req<any>('/labour/safety', { method: 'POST', body: JSON.stringify(data) }),
  confirmInduction: (id: string) =>
    req<any>(`/labour/safety/${id}/induct`, { method: 'PATCH' }),
};

// ─── Resource ─────────────────────────────────────────────────────────────────
export const resourceApi = {
  getMaterials: (siteId: string) =>
    req<any[]>(`/resource/${siteId}/materials`),
  addMaterial: (data: any) =>
    req<any>('/resource/materials', { method: 'POST', body: JSON.stringify(data) }),
  logMaterial: (data: any) =>
    req<any>('/resource/materials/log', { method: 'POST', body: JSON.stringify(data) }),
  getElements: (siteId: string, stage?: string) =>
    req<any[]>(`/resource/${siteId}/elements${stage ? `?stage=${stage}` : ''}`),
  addElement: (data: any) =>
    req<any>('/resource/elements', { method: 'POST', body: JSON.stringify(data) }),
  updateElementStage: (id: string, stage: string) =>
    req<any>(`/resource/elements/${id}/stage?stage=${stage}`, { method: 'PATCH' }),
  getDispatches: (siteId: string) =>
    req<any[]>(`/resource/${siteId}/dispatches`),
  addDispatch: (data: any) =>
    req<any>('/resource/dispatches', { method: 'POST', body: JSON.stringify(data) }),
  confirmDispatch: (id: string) =>
    req<any>(`/resource/dispatches/${id}/confirm`, { method: 'PATCH' }),
  getVendors: (siteId: string) =>
    req<any[]>(`/resource/${siteId}/vendors`),
  addVendor: (data: any) =>
    req<any>('/resource/vendors', { method: 'POST', body: JSON.stringify(data) }),
  addVendorIssue: (id: string) =>
    req<any>(`/resource/vendors/${id}/issues`, { method: 'PATCH' }),
  getSummary: (siteId: string) =>
    req<any>(`/resource/${siteId}/summary`),
};

// ─── Equipment ────────────────────────────────────────────────────────────────
export const equipmentApi = {
  getAssets: (siteId: string) =>
    req<any[]>(`/equipment/${siteId}/assets`),
  addAsset: (data: any) =>
    req<any>('/equipment/assets', { method: 'POST', body: JSON.stringify(data) }),
  logBulk: (items: any[]) =>
    req<any>('/equipment/log/bulk', { method: 'POST', body: JSON.stringify(items) }),
  upsertLog: (data: any) =>
    req<any>('/equipment/log/upsert', { method: 'PUT', body: JSON.stringify(data) }),
  getSummary: (siteId: string) =>
    req<any>(`/equipment/${siteId}/summary`),
  getBreakdowns: (siteId: string) =>
    req<any[]>(`/equipment/${siteId}/breakdowns`),
};

// ─── Cost ─────────────────────────────────────────────────────────────────────
export const costApi = {
  getSummary: (siteId: string) =>
    req<any>(`/cost/${siteId}/summary`),
  getBudgets: (siteId: string) =>
    req<any[]>(`/cost/${siteId}/budgets`),
  setBudget: (data: any) =>
    req<any>('/cost/budget', { method: 'POST', body: JSON.stringify(data) }),
  getNarrative: (siteId: string) =>
    req<{ narrative: string }>(`/cost/${siteId}/narrative`),
  // EVM Snapshot endpoints
  saveEVMSnapshot: (data: any) =>
    req<any>('/cost/evm/snapshot', { method: 'POST', body: JSON.stringify(data) }),
  getEVMHistory: (siteId: string) =>
    req<any[]>(`/cost/${siteId}/evm/history`),
  // Cost Baseline endpoints
  setBaseline: (data: any) =>
    req<any>('/cost/baseline', { method: 'POST', body: JSON.stringify(data) }),
  getBaseline: (siteId: string) =>
    req<any>(`/cost/${siteId}/baseline`),
};

// ─── AI / Voice / DPR ─────────────────────────────────────────────────────────
export const aiApi = {
  transcribe: async (audioBlob: Blob, siteId: string): Promise<{ transcript: string }> => {
    const form = new FormData();
    form.append('file', audioBlob, 'recording.webm');
    form.append('site_id', siteId);
    const res = await fetch(`${BASE}/ai/transcribe`, { method: 'POST', body: form, headers: authHeaders() });
    if (!res.ok) throw new Error('Transcription failed');
    return res.json();
  },
  extract: async (module: string, transcript: string, siteId: string): Promise<any> => {
    const form = new FormData();
    form.append('transcript', transcript);
    form.append('site_id', siteId);
    const res = await fetch(`${BASE}/ai/extract/${module}`, {
      method: 'POST',
      body: form,
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Extraction failed');
    return res.json();
  },
  extractImage: async (module: string, file: File, siteId: string): Promise<any> => {
    const form = new FormData();
    form.append('file', file);
    form.append('site_id', siteId);
    const res = await fetch(`${BASE}/ai/extract-image/${module}`, {
      method: 'POST', body: form, headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Document extraction failed');
    return res.json();
  },
};

export const dprApi = {
  processVoice: (transcript: string, language: string, siteName: string, projectName: string, siteId?: string | null) =>
    req<any>('/dpr/process-voice', {
      method: 'POST',
      body: JSON.stringify({ transcript, language, siteName, projectName, siteId: siteId ?? '' }),
    }),
  generatePdf: async (reportData: any) => {
    const res = await fetch(`${BASE}/dpr/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(reportData),
    });
    if (!res.ok) throw new Error('PDF generation failed');
    return res.blob();
  },
  generateFromAudio: async (audioBlob: Blob) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    const res = await fetch(`${BASE}/dpr/generate-from-audio`, { method: 'POST', body: form, headers: authHeaders() });
    if (!res.ok) throw new Error('Audio PDF generation failed');
    return {
      blob: await res.blob(),
      transcript: decodeURIComponent(res.headers.get('X-Transcript') || ''),
    };
  },
};

function mapReport(report: any) {
  return {
    id: report.id,
    name: report.name || 'Site Report',
    projectName: report.project_name || 'Site Project',
    siteId: report.site_id || '',
    date: report.report_date || report.date || '',
    reportType: report.report_type || 'Daily',
    status: report.status || 'Completed',
    author: report.author || 'Site Manager',
    summary: report.summary || '',
    tradesPresentCount: report.trades_present_count ?? 0,
    criticalIssuesCount: report.critical_issues_count ?? 0,
    materialsReceivedSummary: report.materials_received_summary || '',
    equipmentUptimePercent: report.equipment_uptime_percent ?? 0,
    evmStatus: report.evm_status || 'On Track',
    voiceTranscript: report.voice_transcript,
    extractedData: report.extracted_data,
  };
}

function unmapReport(report: any) {
  return {
    site_id: report.siteId,
    name: report.name,
    project_name: report.projectName,
    report_date: report.date,
    report_type: report.reportType || 'Daily',
    status: report.status,
    author: report.author,
    summary: report.summary,
    trades_present_count: report.tradesPresentCount,
    critical_issues_count: report.criticalIssuesCount,
    materials_received_summary: report.materialsReceivedSummary,
    equipment_uptime_percent: report.equipmentUptimePercent,
    evm_status: report.evmStatus,
    voice_transcript: report.voiceTranscript,
    extracted_data: report.extractedData,
  };
}

export const reportsApi = {
  list: async (siteId: string) => (await req<any[]>(`/reports?site_id=${encodeURIComponent(siteId)}`)).map(mapReport),
  create: async (report: any) => mapReport(await req<any>('/reports', {
    method: 'POST', body: JSON.stringify(unmapReport(report)),
  })),
  delete: (id: string) => req<{ ok: boolean }>(`/reports/${id}`, { method: 'DELETE' }),
};
