import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import RiskBadge from '@/components/RiskBadge';
import { fetchRiskAssessment, type EffortRiskInput } from '@/lib/api';

type PendingEffort = {
  id: string;
  title: string;
  category: string;
  description: string;
  estimated_hours: number;
  proof_files_count: number;
};

export default function VerifyPage() {
  // Until the real pending-verifications endpoint is built, we show demo cards.
  // When backend adds /verifications/pending with real payloads, swap this list
  // with a query and pass the same fields into fetchRiskAssessment.
  const pending: PendingEffort[] = useMemo(
    () => [
      {
        id: 'demo-1',
        title: 'Food bank volunteer shift',
        category: 'volunteering',
        description:
          'Sorted donations, packed boxes, and helped load deliveries. Supervisor can confirm attendance.',
        estimated_hours: 4,
        proof_files_count: 2
      },
      {
        id: 'demo-2',
        title: 'Work',
        category: 'work',
        description: 'Did a lot.',
        estimated_hours: 60,
        proof_files_count: 0
      }
    ],
    []
  );

  const riskQueries = useQueries({
    queries: pending.map((e) => {
      const payload: EffortRiskInput = {
        title: e.title,
        description: e.description,
        category: e.category,
        estimated_hours: e.estimated_hours,
        proof_files_count: e.proof_files_count
      };

      return {
        queryKey: ['riskAssessment', e.id, payload],
        queryFn: () => fetchRiskAssessment(payload),
        staleTime: 30_000
      };
    })
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Verify Efforts</h1>
        <div className="text-sm text-gray-600">
          Your Verification Reputation: <span className="font-semibold">0</span>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Pending Verifications</h2>
        <div className="space-y-4">
          {pending.map((e, idx) => {
            const q = riskQueries[idx];
            const assessment = q.data;
            return (
              <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{e.title}</div>
                    <div className="mt-1 text-xs text-white/50">
                      Category: <span className="text-white/70">{e.category}</span> · Hours:{' '}
                      <span className="text-white/70">{e.estimated_hours}</span> · Proof files:{' '}
                      <span className="text-white/70">{e.proof_files_count}</span>
                    </div>
                  </div>

                  {assessment ? <RiskBadge level={assessment.level} /> : null}
                </div>

                <p className="mt-3 text-sm text-white/65">{e.description}</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Risk score</div>
                    <div className="mt-1 text-2xl font-extrabold text-white tabular-nums">
                      {q.isFetching ? '…' : assessment ? `${assessment.score}/100` : '—'}
                    </div>
                    {q.error ? (
                      <div className="mt-2 text-xs text-rose-200">Failed to fetch risk preview.</div>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/70">Top signals</div>
                    <ul className="mt-2 space-y-2 text-xs text-white/60">
                      {assessment?.reasons?.slice(0, 3).map((r) => (
                        <li key={r.code} className="flex items-start justify-between gap-3">
                          <span className="leading-snug">• {r.message}</span>
                          <span className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 font-semibold tabular-nums text-white/70">
                            +{r.weight}
                          </span>
                        </li>
                      ))}
                      {!assessment || assessment.reasons.length === 0 ? (
                        <li className="text-white/45">No signals yet.</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary">Open Proof</button>
                  <button className="btn-secondary">Request More Info</button>
                  <button className="btn-primary">Approve</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Verification Works</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Review submitted efforts and their proof materials</li>
          <li>• Assess authenticity and accuracy</li>
          <li>• Provide feedback and approve or reject</li>
          <li>• Build your verifier reputation</li>
          <li>• Help prevent fraud in the network</li>
        </ul>
      </div>
    </div>
  );
}
