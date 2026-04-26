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
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#07080f',
          border: '1px solid rgba(34,211,238,0.18)',
          boxShadow: '0 0 40px rgba(34,211,238,0.08), 0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* top bar */}
        <div
          className="flex items-center justify-between px-5 py-2 border-b font-mono text-xs"
          style={{ borderColor: 'rgba(34,211,238,0.12)', background: 'rgba(34,211,238,0.04)' }}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest text-cyan-400">POE://</span>
            <span className="text-white/30 uppercase tracking-widest">VERIFY.SYS</span>
          </div>
          <div className="flex items-center gap-2 text-white/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="uppercase tracking-widest">QUEUE: {pending.length}</span>
          </div>
        </div>

        {/* heading row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-5 border-b" style={{ borderColor: 'rgba(34,211,238,0.10)' }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-mono tracking-tight text-cyan-400" style={{ textShadow: '0 0 20px rgba(34,211,238,0.35)' }}>
              VERIFY EFFORTS
            </h1>
            <p className="mt-0.5 text-white/35 text-xs font-mono uppercase tracking-widest">Review · Assess · Approve</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-sm" style={{ borderColor: 'rgba(34,211,238,0.20)', background: 'rgba(34,211,238,0.06)' }}>
            <span className="text-white/40 text-xs uppercase tracking-widest">Verifier Rep</span>
            <span className="font-black text-cyan-400 tabular-nums">000</span>
          </div>
        </div>

        {/* ── Effort cards ── */}
        <div className="divide-y" style={{ borderColor: 'rgba(34,211,238,0.08)' }}>
          {pending.map((e, idx) => {
            const q = riskQueries[idx];
            const assessment = q.data;
            return (
              <div key={e.id} className="p-6 space-y-4">
                {/* title + badge row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-bold font-mono text-white">{e.title}</div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs font-mono" style={{ color: 'rgba(34,211,238,0.45)' }}>
                      <span>CAT:<span className="text-white/60 ml-1">{e.category.toUpperCase()}</span></span>
                      <span>HRS:<span className="text-white/60 ml-1">{e.estimated_hours}</span></span>
                      <span>FILES:<span className="text-white/60 ml-1">{e.proof_files_count}</span></span>
                    </div>
                  </div>
                  {assessment ? <RiskBadge level={assessment.level} /> : null}
                </div>

                <p className="text-sm text-white/55 leading-relaxed">{e.description}</p>

                {/* stat panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(34,211,238,0.12)' }}
                  >
                    <div className="text-xs font-mono font-bold uppercase tracking-widest text-white/40">Risk Score</div>
                    <div className="mt-1 text-3xl font-black font-mono tabular-nums text-cyan-400" style={{ textShadow: '0 0 16px rgba(34,211,238,0.4)' }}>
                      {q.isFetching ? <span className="animate-pulse text-white/30">…</span> : assessment ? `${assessment.score}/100` : '—'}
                    </div>
                    {q.error ? (
                      <div className="mt-1 text-xs font-mono text-rose-400">ERR: failed to fetch</div>
                    ) : null}
                  </div>

                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(34,211,238,0.12)' }}
                  >
                    <div className="text-xs font-mono font-bold uppercase tracking-widest text-white/40 mb-2">Top Signals</div>
                    <ul className="space-y-1.5 text-xs font-mono">
                      {assessment?.reasons?.slice(0, 3).map((r) => (
                        <li key={r.code} className="flex items-start justify-between gap-3">
                          <span className="text-white/50 leading-snug">› {r.message}</span>
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 font-bold tabular-nums"
                            style={{ border: '1px solid rgba(34,211,238,0.20)', color: 'rgba(34,211,238,0.70)', background: 'rgba(34,211,238,0.06)' }}
                          >
                            +{r.weight}
                          </span>
                        </li>
                      ))}
                      {!assessment || assessment.reasons.length === 0 ? (
                        <li className="text-white/30">› no signals yet</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                {/* actions */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono">
                  {[
                    { label: 'OPEN PROOF',    primary: false },
                    { label: 'REQUEST INFO',  primary: false },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      className="rounded-lg px-4 py-1.5 text-xs font-bold tracking-wider transition-all"
                      style={{
                        background: 'rgba(34,211,238,0.06)',
                        border: '1px solid rgba(34,211,238,0.25)',
                        color: 'rgba(34,211,238,0.70)',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 2px 12px rgba(34,211,238,0.06) inset',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.14)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#22d3ee';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(34,211,238,0.18)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.06)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(34,211,238,0.70)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(34,211,238,0.06) inset';
                      }}
                    >
                      [{btn.label}]
                    </button>
                  ))}
                  <button
                    className="rounded-lg px-4 py-1.5 text-xs font-bold tracking-wider transition-all"
                    style={{
                      background: 'rgba(34,211,238,0.18)',
                      border: '1px solid rgba(34,211,238,0.50)',
                      color: '#05050a',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 0 16px rgba(34,211,238,0.30)',
                      textShadow: 'none',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#22d3ee';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(34,211,238,0.50)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,211,238,0.18)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(34,211,238,0.30)';
                    }}
                  >
                    [APPROVE]
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How it works ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(0,0,0,0.30)',
          border: '1px solid rgba(34,211,238,0.10)',
        }}
      >
        <div className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400/60 mb-3">// How Verification Works</div>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-white/40 font-mono">
          {[
            'Review submitted efforts and proof materials',
            'Assess authenticity and accuracy',
            'Provide feedback — approve or reject',
            'Build your verifier reputation',
            'Help prevent fraud in the network',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span style={{ color: 'rgba(34,211,238,0.40)' }}>›</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
