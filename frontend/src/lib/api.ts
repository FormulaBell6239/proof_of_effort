import { getAuthToken } from '../stores/walletStore';

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

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function fetchRiskAssessment(payload: EffortRiskInput): Promise<RiskAssessment> {
  const res = await fetch(apiUrl('/api/v1/efforts/risk-assessment'), {
    method: 'POST',
    headers: authHeaders(),
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
    headers: authHeaders(),
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

// ── User ──────────────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  wallet_address: string;
  username: string;
  email?: string;
  trust_score: number;
  reputation_level: number;
  total_efforts: number;
  verified_efforts: number;
  total_verifications: number;
  verification_accuracy: number;
  created_at: string;
  last_active?: string;
  profile_data?: Record<string, unknown>;
};

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await fetch(apiUrl('/api/v1/users/profile'), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch profile (${res.status})`);
  return res.json();
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const res = await fetch(apiUrl(`/api/v1/users/${userId}`), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch user (${res.status})`);
  return res.json();
}

// ── Verifications ─────────────────────────────────────────────────────────────

export type PendingVerification = {
  id: string;
  title: string;
  description: string;
  category: string;
  estimated_hours?: number;
  status: string;
  risk_level?: string;
  created_at: string;
};

export async function fetchPendingVerifications(): Promise<PendingVerification[]> {
  const res = await fetch(apiUrl('/api/v1/verifications/pending'), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch verifications (${res.status})`);
  const json = await res.json() as { success: boolean; data: { verifications: PendingVerification[] } };
  return json.data?.verifications ?? [];
}

export async function submitVerification(params: {
  effortId: string;
  approved: boolean;
  feedback?: string;
}): Promise<void> {
  const res = await fetch(apiUrl('/api/v1/verifications'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      effort_id: params.effortId,
      approved: params.approved,
      feedback: params.feedback,
    }),
  });
  if (!res.ok) throw new Error(`Verification submission failed (${res.status})`);
}

// ── Trust Score & Leaderboard ─────────────────────────────────────────────────

export type TrustScore = {
  trust_score: number;
  reputation_level: number;
  verified_efforts: number;
  verification_accuracy: number;
};

export async function fetchTrustScore(userId: string): Promise<TrustScore> {
  const res = await fetch(apiUrl(`/api/v1/users/${userId}/trust-score`), { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch trust score (${res.status})`);
  return res.json();
}

export type LeaderboardEntry = {
  id: string;
  username: string;
  wallet_address: string;
  trust_score: number;
  verified_efforts: number;
  reputation_level: number;
};

export async function fetchLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const res = await fetch(apiUrl(`/api/v1/trust-scores/leaderboard/global?limit=${limit}`), {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch leaderboard (${res.status})`);
  const json = await res.json() as { success: boolean; data: { leaderboard: LeaderboardEntry[] } };
  return json.data?.leaderboard ?? [];
}
