import { useEffect, useMemo, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry } from '../lib/api';

const PODIUM_CFG = [
  { entryIdx: 1, label: '2ND', pedH: 'h-24 md:h-28', avatarSize: 'h-14 w-14 text-base' },
  { entryIdx: 0, label: '1ST', pedH: 'h-36 md:h-44', avatarSize: 'h-20 w-20 text-xl'  },
  { entryIdx: 2, label: '3RD', pedH: 'h-16 md:h-20', avatarSize: 'h-12 w-12 text-sm'  },
];

const RANK_ICONS = ['🥇', '🪙', '🥉'];

type Filter = 'all' | 'top10' | 'top5';
const FILTERS: { label: string; value: Filter }[] = [
  { label: 'ALL',    value: 'all'   },
  { label: 'TOP 10', value: 'top10' },
  { label: 'TOP 5',  value: 'top5'  },
];

const ACCENT_COLORS = [
  { name: 'Green',  hex: '#4ade80', glow: 'rgba(74,222,128,0.30)'  },
  { name: 'Cyan',   hex: '#22d3ee', glow: 'rgba(34,211,238,0.30)'  },
  { name: 'Amber',  hex: '#fbbf24', glow: 'rgba(251,191,36,0.30)'  },
  { name: 'Violet', hex: '#a78bfa', glow: 'rgba(167,139,250,0.30)' },
  { name: 'Rose',   hex: '#fb7185', glow: 'rgba(251,113,133,0.30)' },
  { name: 'Ice',    hex: '#e2e8f0', glow: 'rgba(226,232,240,0.22)' },
];

export default function LeaderboardPage() {
  const [entries,  setEntries]  = useState<LeaderboardEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<Filter>('all');
  const [accentIdx, setAccentIdx] = useState(1); // default: Cyan
  const [tick, setTick] = useState(true);
  const [showPalette, setShowPalette] = useState(false);
  // Captured once — prevents the timestamp from flickering on cursor blinks
  const [now] = useState(() =>
    new Date().toISOString().replace('T', ' ').slice(0, 19)
  );

  const accent = ACCENT_COLORS[accentIdx];

  // blinking cursor
  useEffect(() => {
    const t = setInterval(() => setTick(v => !v), 530);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchLeaderboard(20)
      .then(setEntries)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'top5')  return entries.slice(0, 5);
    if (filter === 'top10') return entries.slice(0, 10);
    return entries;
  }, [entries, filter]);

  const top3 = filtered.slice(0, 3);
  const rest  = filtered.slice(3);

  const avgScore = entries.length
    ? Math.round(entries.reduce((s, e) => s + e.trust_score, 0) / entries.length)
    : 0;

  return (
    <div className="space-y-4">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#05050a',
          border: `1px solid ${accent.hex}33`,
          boxShadow: `0 0 0 1px ${accent.hex}18 inset, 0 0 40px ${accent.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Scanlines overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* ── Status bar ── */}
        <div
          className="relative z-20 flex items-center justify-between gap-4 px-5 py-2 border-b text-xs font-mono"
          style={{ borderColor: `${accent.hex}22`, background: `${accent.hex}08` }}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest" style={{ color: accent.hex }}>POE://</span>
            <span className="text-white/30 uppercase tracking-widest">LEADERBOARD.SYS</span>
            <span className="text-white/15">[v1.0]</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/25">
            <span>{now} UTC</span>
            <span style={{ color: accent.hex }}>{tick ? '█' : ' '}</span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center gap-4 px-6 md:px-8 pt-5 pb-4 border-b" style={{ borderColor: `${accent.hex}18` }}>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: 'monospace', color: accent.hex, textShadow: `0 0 20px ${accent.glow}` }}>
              LEADERBOARD
            </h1>
            <p className="mt-0.5 text-white/35 text-xs font-mono">TOP CONTRIBUTORS — RANKED BY VERIFIED TRUST SCORE</p>
          </div>

          {/* Live stats */}
          <div className="hidden md:flex items-center gap-6 font-mono text-center">
            {[
              { label: 'NODES',    value: String(entries.length).padStart(3, '0') },
              { label: 'AVG_PTS',  value: avgScore.toLocaleString() },
              { label: 'TOP_PTS',  value: entries[0]?.trust_score?.toLocaleString() ?? '———' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-lg font-black tabular-nums" style={{ color: accent.hex }}>{s.value}</div>
                <div className="text-xs text-white/25 tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Controls: color picker + filter */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Color picker toggle + swatches */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPalette(v => !v)}
                className="rounded px-2 py-0.5 text-xs font-mono font-bold tracking-wider transition-all"
                style={showPalette
                  ? { background: accent.hex, color: '#050505', boxShadow: `0 0 10px ${accent.glow}` }
                  : { border: `1px solid ${accent.hex}40`, color: `${accent.hex}80` }
                }
              >[CLR]</button>
              {showPalette && (
                <div className="flex items-center gap-1.5">
                  {ACCENT_COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      title={c.name}
                      onClick={() => setAccentIdx(i)}
                      className="rounded-full transition-transform hover:scale-110"
                      style={{
                        width: 14, height: 14,
                        background: c.hex,
                        boxShadow: accentIdx === i ? `0 0 8px ${c.glow}, 0 0 0 2px ${c.hex}` : 'none',
                        transform: accentIdx === i ? 'scale(1.25)' : undefined,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Filter toggle */}
            <div className="flex items-center gap-1 rounded-lg border p-1 font-mono" style={{ borderColor: `${accent.hex}30`, background: 'rgba(0,0,0,0.4)' }}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className="rounded px-3 py-1 text-xs font-bold tracking-wider transition-all"
                  style={filter === f.value
                    ? { background: accent.hex, color: '#050505', boxShadow: `0 0 12px ${accent.glow}` }
                    : { color: `${accent.hex}60` }
                  }
                >
                  [{f.label}]
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Podium ── */}
        <div className="relative z-20 py-8 md:py-12 px-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 font-mono text-sm" style={{ color: `${accent.hex}80` }}>
              <span className="animate-pulse">&gt;</span> LOADING DATA…
            </div>
          )}
          {error && <div className="text-center py-16 text-rose-400 font-mono text-sm">{error}</div>}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center font-mono">
              <span className="text-5xl">📡</span>
              <p className="text-white/30 text-sm">&gt; NO ENTRIES FOUND. BE THE FIRST.</p>
            </div>
          )}

          {!loading && top3.length > 0 && (
            <div className="flex items-end justify-center gap-4 md:gap-12">
              {PODIUM_CFG.map(({ entryIdx, label, pedH, avatarSize }) => {
                const entry = top3[entryIdx];
                if (!entry) return null;
                const isFirst = entryIdx === 0;
                return (
                  <div key={entry.id} className="flex flex-col items-center gap-2">
                    <span className="text-2xl md:text-3xl">{RANK_ICONS[entryIdx]}</span>
                    {/* Avatar */}
                    <div
                      className={`${avatarSize} shrink-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-black text-white font-mono`}
                      style={{
                        border: `2px solid ${accent.hex}${isFirst ? 'cc' : '66'}`,
                        boxShadow: isFirst ? `0 0 24px ${accent.glow}` : 'none',
                        color: accent.hex,
                      }}
                    >
                      {entry.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="text-center font-mono">
                      <div className={`font-bold truncate max-w-[100px] text-white ${isFirst ? 'text-sm' : 'text-xs'}`}>
                        {entry.username}
                      </div>
                      <div className={`font-black tabular-nums ${isFirst ? 'text-base' : 'text-sm'}`} style={{ color: accent.hex }}>
                        {entry.trust_score.toLocaleString()}<span className="text-white/20 text-xs ml-1">pts</span>
                      </div>
                    </div>
                    {/* Pedestal */}
                    <div
                      className={`w-24 md:w-36 ${pedH} rounded-t-xl flex items-center justify-center`}
                      style={{
                        background: `linear-gradient(to bottom, ${accent.hex}18, ${accent.hex}06)`,
                        border: `1px solid ${accent.hex}${isFirst ? '44' : '28'}`,
                        borderBottom: 'none',
                        boxShadow: isFirst ? `0 -4px 20px ${accent.glow}` : 'none',
                      }}
                    >
                      <span className="text-2xl md:text-3xl font-black font-mono" style={{ color: `${accent.hex}20` }}>{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Ranked list ── */}
        {!loading && rest.length > 0 && (
          <div className="relative z-20 border-t" style={{ borderColor: `${accent.hex}18` }}>
            {/* Column headers */}
            <div
              className="grid grid-cols-[3rem_1fr_7rem_5rem] gap-2 px-6 py-2 font-mono text-xs tracking-widest"
              style={{ background: `${accent.hex}08`, borderBottom: `1px solid ${accent.hex}18`, color: `${accent.hex}60` }}
            >
              <span>RANK</span>
              <span>NODE</span>
              <span className="text-right">SCORE</span>
              <span className="text-right">LEVEL</span>
            </div>

            <div className="divide-y" style={{ borderColor: `${accent.hex}0f` }}>
              {rest.map((entry, i) => {
                const rank = i + 4;
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[3rem_1fr_7rem_5rem] items-center gap-2 px-6 py-3 font-mono text-sm transition-all cursor-default group"
                    style={{ borderColor: `${accent.hex}10` }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${accent.hex}08`)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="text-xs font-bold tabular-nums" style={{ color: `${accent.hex}50` }}>#{rank}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: `${accent.hex}18`, color: accent.hex, border: `1px solid ${accent.hex}33` }}
                      >
                        {entry.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold truncate">{entry.username}</div>
                        <div className="text-xs truncate" style={{ color: `${accent.hex}40` }}>{entry.wallet_address.slice(0, 6)}…{entry.wallet_address.slice(-4)}</div>
                      </div>
                    </div>
                    <div className="text-right font-black tabular-nums text-sm" style={{ color: accent.hex }}>{entry.trust_score.toLocaleString()}</div>
                    <div className="text-right">
                      <span className="rounded px-2 py-0.5 text-xs" style={{ border: `1px solid ${accent.hex}28`, color: `${accent.hex}80` }}>
                        LV.{entry.reputation_level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom status bar */}
        <div
          className="relative z-20 flex items-center justify-between px-5 py-2 border-t font-mono text-xs"
          style={{ borderColor: `${accent.hex}18`, background: `${accent.hex}05`, color: `${accent.hex}40` }}
        >
          <span>&gt; {filtered.length} RECORD{filtered.length !== 1 ? 'S' : ''} LOADED</span>
          <span>STATUS: <span style={{ color: accent.hex }}>ONLINE</span></span>
        </div>
      </div>
    </div>
  );
}
