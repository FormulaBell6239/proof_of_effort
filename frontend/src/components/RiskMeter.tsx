import RiskBadge from '@/components/RiskBadge';
import type { RiskAssessment } from '@/lib/api';

function barColor(level: RiskAssessment['level']) {
  switch (level) {
    case 'low':
      return 'from-emerald-400 to-emerald-500';
    case 'medium':
      return 'from-amber-400 to-amber-500';
    case 'high':
      return 'from-orange-400 to-orange-500';
    case 'critical':
      return 'from-rose-400 to-rose-500';
    default:
      return 'from-white/40 to-white/40';
  }
}

export default function RiskMeter({
  assessment,
  isLoading,
  error
}: {
  assessment?: RiskAssessment;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/80">Fraud / Risk Preview</div>
          <div className="text-xs text-white/50">A quick heuristic score before you submit.</div>
        </div>
        {assessment ? <RiskBadge level={assessment.level} /> : null}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${assessment ? barColor(assessment.level) : 'from-white/20 to-white/20'} transition-all`}
            style={{ width: `${assessment ? assessment.score : 0}%` }}
            aria-label="risk-score-bar"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/55">
          <span>{isLoading ? 'Scoring…' : 'Score'}</span>
          <span className="tabular-nums">{assessment ? `${assessment.score}/100` : '—'}</span>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
            {error}
          </div>
        ) : null}

        {assessment && assessment.reasons.length > 0 ? (
          <div className="mt-4">
            <div className="text-xs font-semibold text-white/70">Top signals</div>
            <ul className="mt-2 space-y-2 text-xs text-white/60">
              {assessment.reasons.slice(0, 3).map((r) => (
                <li key={r.code} className="flex items-start justify-between gap-3">
                  <span className="leading-snug">• {r.message}</span>
                  <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-semibold tabular-nums text-white/70">
                    +{r.weight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4 text-xs text-white/45">Fill in details to see risk signals.</div>
        )}
      </div>
    </div>
  );
}
