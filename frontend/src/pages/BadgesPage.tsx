import { useQuery } from '@tanstack/react-query';
import { fetchBadges, fetchGamificationMe } from '../lib/gamificationApi';
import { getAuthToken } from '../stores/walletStore';

type Badge = {
  code: string;
  name: string;
  description: string;
  tier: string;
};

type Props = {
  userId?: string;
};

const TIER_META: Record<string, { label: string; icon: string; cardClass: string; pillClass: string; headerClass: string }> = {
  bronze: {
    label: 'Bronze',
    icon: '🥉',
    cardClass: 'border-amber-600/30 bg-amber-600/8',
    pillClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    headerClass: 'text-amber-400',
  },
  silver: {
    label: 'Silver',
    icon: '🪙',
    cardClass: 'border-slate-300/20 bg-slate-300/5',
    pillClass: 'border-slate-300/40 bg-slate-300/10 text-slate-200',
    headerClass: 'text-slate-300',
  },
  gold: {
    label: 'Gold',
    icon: '🥇',
    cardClass: 'border-yellow-400/30 bg-yellow-400/8',
    pillClass: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300',
    headerClass: 'text-yellow-400',
  },
  platinum: {
    label: 'Platinum',
    icon: '🔷',
    cardClass: 'border-cyan-300/30 bg-cyan-300/8',
    pillClass: 'border-cyan-300/40 bg-cyan-300/10 text-cyan-200',
    headerClass: 'text-cyan-300',
  },
};

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

function BadgeCard({ b, isEarned }: { b: Badge; isEarned: boolean }) {
  const meta = TIER_META[b.tier] ?? TIER_META['bronze'];
  return (
    <div
      className={`rounded-2xl border p-4 transition-opacity ${meta.cardClass} ${
        isEarned ? 'opacity-100' : 'opacity-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white leading-snug">{b.name}</h3>
          <p className="mt-1 text-sm text-white/60 leading-relaxed">{b.description}</p>
        </div>
        <div
          className={`shrink-0 rounded-full px-3 py-1 text-xs border font-medium ${
            isEarned
              ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
              : `${meta.pillClass}`
          }`}
        >
          {isEarned ? '✓ Earned' : 'Locked'}
        </div>
      </div>
      <div className="mt-3 text-xs text-white/30 font-mono">{b.code}</div>
    </div>
  );
}

export default function BadgesPage({ userId }: Props) {
  const isAuthenticated = !!getAuthToken();

  const { data: allBadges, isLoading: allLoading, error: allError } = useQuery({
    queryKey: ['badges'],
    queryFn: fetchBadges,
  });

  const { data: me, isLoading: meLoading, error: meError } = useQuery({
    queryKey: ['gamificationMe'],
    queryFn: () => fetchGamificationMe(),
    enabled: isAuthenticated,
  });

  const earned = new Set((me?.badges ?? []).map((b) => b.code));

  const grouped = TIER_ORDER.reduce<Record<string, Badge[]>>((acc, tier) => {
    acc[tier] = (allBadges ?? []).filter((b) => b.tier === tier);
    return acc;
  }, {});

  const totalEarned = me?.badges?.length ?? 0;
  const totalBadges = allBadges?.length ?? 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="card card-tinted overflow-hidden relative" style={{ padding: 0 }}>
        <div className="app-grid absolute inset-0 pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">Badges</h1>
              <p className="mt-1 text-white/60 text-sm md:text-base">Proof you’ve done real work — verified on-chain.</p>
            </div>
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">{totalEarned}<span className="text-white/30 text-base font-normal"> / {totalBadges}</span></div>
                  <div className="text-xs text-white/45 uppercase tracking-wider">Badges Earned</div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-2xl">
                  🏆
                </div>
              </div>
            )}
          </div>

          {/* Tier legend */}
          <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap gap-3">
            {TIER_ORDER.map(tier => {
              const meta = TIER_META[tier];
              const tierBadges = grouped[tier] ?? [];
              const tierEarned = tierBadges.filter(b => earned.has(b.code)).length;
              return (
                <div key={tier} className={`flex items-center gap-1.5 text-xs font-medium ${meta.headerClass}`}>
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {isAuthenticated && (
                    <span className="text-white/30 font-normal">{tierEarned}/{tierBadges.length}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(allLoading || meLoading) && (
        <div className="card card-tinted text-white/50 text-sm animate-pulse">Loading badges…</div>
      )}
      {(allError || meError) && (
        <div className="card card-tinted text-red-300 text-sm">{((allError || meError) as Error).message}</div>
      )}

      {allBadges && TIER_ORDER.map(tier => {
        const badges = grouped[tier];
        if (!badges || badges.length === 0) return null;
        const meta = TIER_META[tier];
        return (
          <div key={tier}>
            <div className={`flex items-center gap-2 mb-3 ${meta.headerClass}`}>
              <span className="text-lg">{meta.icon}</span>
              <h2 className="text-sm font-semibold uppercase tracking-widest">{meta.label} Tier</h2>
              <div className="flex-1 h-px bg-current opacity-20 ml-2" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {badges.map(b => (
                <BadgeCard key={b.code} b={b} isEarned={earned.has(b.code)} />
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
}
