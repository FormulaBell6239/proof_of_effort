import type { TrustScore } from './api';

export type TrustScoreBreakdown = {
  total: number;
  effortScore: number;
  verificationScore: number;
  consistencyScore: number;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function calculateTrustScore(input: TrustScore): TrustScoreBreakdown {
  const verified = Math.max(0, input.verified_efforts);
  const effortScore = clamp(verified * 50, 0, 600);
  const verificationScore = clamp((input.verification_accuracy / 100) * 200, 0, 200);
  const consistencyScore = clamp(Math.sqrt(Math.max(0, verified)) * 20, 0, 100);
  const total = clamp(Math.round(effortScore + verificationScore + consistencyScore), 0, 1000);
  return {
    total,
    effortScore: Math.round(effortScore),
    verificationScore: Math.round(verificationScore),
    consistencyScore: Math.round(consistencyScore),
  };
}
