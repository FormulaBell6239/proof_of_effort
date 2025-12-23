export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskSignal = {
  code: string;
  message: string;
  weight: number;
};

export type RiskAssessment = {
  score: number;
  level: RiskLevel;
  reasons: RiskSignal[];
};

export type EffortRiskInput = {
  title?: string;
  description?: string;
  category?: string;
  estimated_hours?: number;
  proof_files_count?: number;
  proof_ipfs_hash?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  created_at?: string;
};

export type SubmittedEffort = {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_hours: number | null;
  proof_files: string[];
  status: string;
  created_at: string;
};

function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  if (!base) return path;
  return new URL(path, base).toString();
}

export async function fetchRiskAssessment(payload: EffortRiskInput): Promise<RiskAssessment> {
  const res = await fetch(apiUrl('/api/v1/efforts/risk-assessment'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Risk assessment failed (${res.status}): ${text || res.statusText}`);
  }

  const json = (await res.json()) as { success: boolean; data: RiskAssessment };
  return json.data;
}

export async function submitEffort(params: {
  title: string;
  description: string;
  category: string;
  estimatedHours?: number;
  proofFiles?: FileList | null;
  walletAddress?: string | null;
}): Promise<{ effort: SubmittedEffort; risk: RiskAssessment }> {
  const res = await fetch(apiUrl('/api/v1/efforts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: params.title,
      description: params.description,
      category: params.category,
      estimated_hours: Number.isFinite(params.estimatedHours) ? params.estimatedHours : undefined,
      proof_files_count: params.proofFiles?.length ?? 0,
      wallet_address: params.walletAddress ?? undefined
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Submit failed (${res.status}): ${text || res.statusText}`);
  }

  const json = (await res.json()) as { success: boolean; data: { effort: SubmittedEffort; risk: RiskAssessment } };
  return json.data;
}
