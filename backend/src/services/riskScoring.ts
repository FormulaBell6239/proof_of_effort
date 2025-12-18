import { RiskLevel } from '../models/types';

export type RiskSignal = {
  code: string;
  message: string;
  weight: number; // 0-100 contribution
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
  created_at?: string | Date;
};

export type RiskAssessment = {
  score: number; // 0-100
  level: RiskLevel;
  reasons: RiskSignal[];
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return RiskLevel.CRITICAL;
  if (score >= 65) return RiskLevel.HIGH;
  if (score >= 35) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

function looksLikeSpammyText(text: string): boolean {
  const t = text.toLowerCase();
  const suspiciousPhrases = [
    'guaranteed',
    '100%',
    'no proof needed',
    'trust me',
    'just believe',
    'dm me',
    'cashapp',
    'venmo',
    'wire',
    'bitcoin',
    'crypto only'
  ];
  if (suspiciousPhrases.some((p) => t.includes(p))) return true;

  // Excessive repeated characters e.g., "!!!!!!!!!" or "aaaaaa"
  if (/(.)\1{7,}/.test(text)) return true;

  // Very high punctuation ratio
  const punct = (text.match(/[!?.]/g) ?? []).length;
  return text.length > 0 ? punct / text.length > 0.18 : false;
}

export function assessEffortRisk(input: EffortRiskInput): RiskAssessment {
  const reasons: RiskSignal[] = [];

  const title = (input.title ?? '').trim();
  const description = (input.description ?? '').trim();
  const estimatedHours = input.estimated_hours;
  const proofCount = input.proof_files_count ?? 0;
  const hasIpfs = Boolean((input.proof_ipfs_hash ?? '').trim());

  // 1) Missing or low-quality narrative
  if (title.length < 6) {
    reasons.push({
      code: 'TITLE_TOO_SHORT',
      message: 'Title is very short (hard to evaluate).',
      weight: 12
    });
  }

  if (description.length < 40) {
    reasons.push({
      code: 'DESCRIPTION_TOO_SHORT',
      message: 'Description is short; provide more context and specifics.',
      weight: 18
    });
  }

  if (looksLikeSpammyText([title, description].filter(Boolean).join(' '))) {
    reasons.push({
      code: 'SPAMMY_LANGUAGE',
      message: 'Text contains spam-like phrasing or patterns.',
      weight: 20
    });
  }

  // 2) Hours/proof mismatch
  if (typeof estimatedHours === 'number') {
    if (estimatedHours <= 0) {
      reasons.push({
        code: 'HOURS_NON_POSITIVE',
        message: 'Estimated hours must be greater than 0.',
        weight: 10
      });
    } else if (estimatedHours >= 40 && proofCount === 0 && !hasIpfs) {
      reasons.push({
        code: 'HIGH_HOURS_NO_PROOF',
        message: 'High hours claimed with no proof attached.',
        weight: 35
      });
    } else if (estimatedHours >= 12 && proofCount === 0 && !hasIpfs) {
      reasons.push({
        code: 'MODERATE_HOURS_NO_PROOF',
        message: 'Moderate hours claimed with no proof attached.',
        weight: 22
      });
    }

    if (estimatedHours > 200) {
      reasons.push({
        code: 'HOURS_IMPLAUSIBLE',
        message: 'Estimated hours is unusually high.',
        weight: 30
      });
    }
  }

  // 3) Proof checks (basic)
  if (proofCount === 0 && !hasIpfs) {
    reasons.push({
      code: 'NO_PROOF',
      message: 'No proof provided yet.',
      weight: 15
    });
  }

  // 4) Location sanity checks (no geofencing here; just ranges)
  if (input.location) {
    const { latitude, longitude } = input.location;
    if (typeof latitude === 'number' && (latitude < -90 || latitude > 90)) {
      reasons.push({
        code: 'LAT_OUT_OF_RANGE',
        message: 'Latitude is out of valid range.',
        weight: 25
      });
    }
    if (typeof longitude === 'number' && (longitude < -180 || longitude > 180)) {
      reasons.push({
        code: 'LNG_OUT_OF_RANGE',
        message: 'Longitude is out of valid range.',
        weight: 25
      });
    }
  }

  // Weight aggregation. We treat weights as additive “risk pressure”.
  const raw = reasons.reduce((sum, r) => sum + r.weight, 0);
  const score = clamp(raw, 0, 100);

  return {
    score,
    level: riskLevelFromScore(score),
    reasons: reasons.sort((a, b) => b.weight - a.weight)
  };
}
