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

export async function fetchRiskAssessment(payload: EffortRiskInput): Promise<RiskAssessment> {
  const res = await fetch('/api/v1/efforts/risk-assessment', {
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
