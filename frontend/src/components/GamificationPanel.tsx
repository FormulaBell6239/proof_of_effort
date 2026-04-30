import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGamificationMe, xpForNextLevel } from '../lib/gamificationApi';
import { getAuthToken } from '../stores/walletStore';

type Props = {
  userId?: string;
  title?: string;
};

function formatTier(tier?: string) {
  switch (tier) {
    case 'bronze':
      return 'text-amber-300';
    case 'silver':
      return 'text-slate-200';
    case 'gold':
      return 'text-yellow-300';
    case 'platinum':
      return 'text-cyan-200';
    default:
      return 'text-white/80';
  }
}

export default function GamificationPanel({ title = 'Progress' }: Props) {
  const isAuthenticated = !!getAuthToken();
  const { data, isLoading, error } = useQuery({
    queryKey: ['gamificationMe'],
    queryFn: () => fetchGamificationMe(),
    enabled: isAuthenticated,
  });

  const progress = data?.progress;
  const badges = data?.badges ?? [];

  const computed = useMemo(() => {
    if (!progress) return null;

    const nextXp = xpForNextLevel(progress.level);
    const current = Math.max(0, progress.xp);
    const prevLevelFloor = 100 * Math.max(0, progress.level - 1) * Math.max(0, progress.level - 1);
    const denom = Math.max(1, nextXp - prevLevelFloor);
    const pct = Math.min(100, Math.max(0, ((current - prevLevelFloor) / denom) * 100));

    return {
      nextXp,
      prevLevelFloor,
      pct: Math.round(pct)
    };
  }, [progress]);

  return (
    <div className="card card-tinted">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {progress && (
          <div className="text-sm text-white/70">
            Level <span className="font-semibold text-white">{progress.level}</span>
          </div>
        )}
      </div>

      {isLoading && <p className="mt-3 text-white/70">Loading progress…</p>}
      {error && (
        <p className="mt-3 text-red-300 text-sm">
          {(error as Error).message || 'Failed to load progress'}
        </p>
      )}

      {progress && computed && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>XP</span>
              <span className="font-semibold text-white">
                {progress.xp} / {computed.nextXp}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400"
                style={{ width: `${computed.pct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Verified streak</div>
              <div className="text-2xl font-bold">{progress.verified_streak_days}</div>
              <div className="text-xs text-white/60">days</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60">Badges</div>
              <div className="text-2xl font-bold">{badges.length}</div>
              <div className="text-xs text-white/60">earned</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white/80">Recent badges</h4>
              <span className="text-xs text-white/50">Most recent first</span>
            </div>
            {badges.length === 0 ? (
              <p className="mt-2 text-sm text-white/60">No badges yet—get your first effort verified.</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {badges.slice(0, 6).map((b) => (
                  <div
                    key={b.code}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-sm"
                    title={b.description}
                  >
                    <span className={"mr-2 align-middle " + formatTier(b.tier)}>
                      ●
                    </span>
                    <span className="align-middle">{b.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
