export type TrustScoreInput = {
  totalEfforts: number;
  verifiedEfforts: number;
  verificationAccuracy: number; // 0..100
  fraudPenalty: number; // 0..100
};

export type TrustScoreOutput = {
  totalScore: number; // 0..1000
  effortScore: number;
  verificationScore: number;
  consistencyScore: number;
  longevityScore: number;
  peerEndorsementScore: number;
  fraudPenalty: number;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * MVP trust-score formula:
 * - Effort score grows with verified efforts.
 * - Verification score is driven by verifier accuracy.
 * - Fraud penalty subtracts.
 */
export function calculateTrustScore(input: TrustScoreInput): TrustScoreOutput {
  const verified = Math.max(0, input.verifiedEfforts);

  const effortScore = clamp(verified * 50, 0, 600);
  const verificationScore = clamp((input.verificationAccuracy / 100) * 200, 0, 200);
  const consistencyScore = clamp(Math.sqrt(Math.max(0, input.totalEfforts)) * 20, 0, 100);

  // Placeholder until we track timestamps / endorsements.
  const longevityScore = 0;
  const peerEndorsementScore = 0;

  const fraudPenalty = clamp(input.fraudPenalty, 0, 200);

  const totalScore = clamp(
    Math.round(effortScore + verificationScore + consistencyScore + longevityScore + peerEndorsementScore - fraudPenalty),
    0,
    1000
  );

  return {
    totalScore,
    effortScore: Math.round(effortScore),
    verificationScore: Math.round(verificationScore),
    consistencyScore: Math.round(consistencyScore),
    longevityScore,
    peerEndorsementScore,
    fraudPenalty
  };
}
