import { useQuery } from '@tanstack/react-query';
import { fetchBadges, fetchGamificationMe } from '../lib/gamificationApi';

type Props = {
  userId?: string;
};

function tierStyles(tier: string) {
  switch (tier) {
    case 'bronze':
      return 'border-amber-400/30 bg-amber-500/10';
    case 'silver':
      return 'border-slate-200/20 bg-slate-200/5';
    case 'gold':
      return 'border-yellow-300/30 bg-yellow-300/10';
    case 'platinum':
      return 'border-cyan-200/30 bg-cyan-200/10';
    default:
      return 'border-white/10 bg-white/5';
  }
}

export default function BadgesPage({ userId }: Props) {
  const { data: allBadges, isLoading: allLoading, error: allError } = useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges
  });

  const { data: me, isLoading: meLoading, error: meError } = useQuery({
    queryKey: ['gamificationMe', userId ?? 'demo-user'],
    queryFn: () => fetchGamificationMe(userId)
  });

  const earned = new Set((me?.badges ?? []).map((b) => b.code));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Badges</h1>
          <p className="mt-1 text-white/60">Proof you’ve done real work—verified.</p>
        </div>
        <div className="text-sm text-white/60">
          Earned: <span className="font-semibold text-white">{me?.badges?.length ?? 0}</span>
        </div>
      </div>

      {(allLoading || meLoading) && <div className="card">Loading…</div>}

      {(allError || meError) && (
        <div className="card text-red-300 text-sm">{((allError || meError) as Error).message}</div>
      )}

      {allBadges && (
        <div className="grid md:grid-cols-2 gap-4">
          {allBadges.map((b) => {
            const isEarned = earned.has(b.code);
            return (
              <div
                key={b.code}
                className={`rounded-2xl border p-4 ${tierStyles(b.tier)} ${
                  isEarned ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-white/60">{b.tier}</div>
                    <h3 className="text-lg font-semibold">{b.name}</h3>
                    <p className="mt-1 text-sm text-white/70">{b.description}</p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs border ${
                      isEarned ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-white/10'
                    }`}
                  >
                    {isEarned ? 'Earned' : 'Locked'}
                  </div>
                </div>

                <div className="mt-3 text-xs text-white/50">
                  Code: <span className="font-mono">{b.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
