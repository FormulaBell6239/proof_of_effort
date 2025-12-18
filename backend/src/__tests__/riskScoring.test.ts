/// <reference path="../../node_modules/@types/jest/index.d.ts" />

import { assessEffortRisk, riskLevelFromScore } from '../services/riskScoring';
import { RiskLevel } from '../models/types';

describe('riskScoring', () => {
  test('low risk for detailed effort with proof', () => {
    const out = assessEffortRisk({
      title: 'Volunteer shift at the food bank',
      description:
        'Completed a 4-hour shift sorting donations and packing grocery boxes for families. Supervisor can confirm attendance.',
      estimated_hours: 4,
      proof_files_count: 2
    });

    expect(out.score).toBeLessThanOrEqual(35);
    expect([RiskLevel.LOW, RiskLevel.MEDIUM]).toContain(out.level);
  });

  test('high risk for high hours and no proof', () => {
    const out = assessEffortRisk({
      title: 'Work',
      description: 'Did a lot.',
      estimated_hours: 60,
      proof_files_count: 0
    });

    expect(out.score).toBeGreaterThanOrEqual(65);
    expect([RiskLevel.HIGH, RiskLevel.CRITICAL]).toContain(out.level);
    expect(out.reasons.map((r) => r.code)).toEqual(
      expect.arrayContaining(['HIGH_HOURS_NO_PROOF', 'DESCRIPTION_TOO_SHORT', 'TITLE_TOO_SHORT', 'NO_PROOF'])
    );
  });

  test('riskLevelFromScore thresholds', () => {
    expect(riskLevelFromScore(0)).toBe(RiskLevel.LOW);
    expect(riskLevelFromScore(34)).toBe(RiskLevel.LOW);
    expect(riskLevelFromScore(35)).toBe(RiskLevel.MEDIUM);
    expect(riskLevelFromScore(64)).toBe(RiskLevel.MEDIUM);
    expect(riskLevelFromScore(65)).toBe(RiskLevel.HIGH);
    expect(riskLevelFromScore(84)).toBe(RiskLevel.HIGH);
    expect(riskLevelFromScore(85)).toBe(RiskLevel.CRITICAL);
  });
});
