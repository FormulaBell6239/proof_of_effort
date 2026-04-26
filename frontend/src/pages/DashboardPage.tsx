import { Link } from 'react-router-dom';
import GamificationPanel from '../components/GamificationPanel';
import { useWalletStore } from '../stores/walletStore';

const STEPS = [
  {
    num: '01',
    title: 'Submit an Effort',
    desc: 'Document what you did — volunteer work, caregiving, education, and more.',
    color: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/25',
    to: '/submit',
  },
  {
    num: '02',
    title: 'Attach Proof',
    desc: 'Upload photos, documents, or links as evidence of your contribution.',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/25',
    to: '/submit',
  },
  {
    num: '03',
    title: 'Get Verified',
    desc: 'Community members review and vouch for your effort, boosting your trust score.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/25',
    to: '/verify',
  },
  {
    num: '04',
    title: 'Earn Reputation',
    desc: 'Climb the leaderboard, collect badges, and build an on-chain reputation.',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/25',
    to: '/leaderboard',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Submit Effort',
    desc: 'Record a new contribution',
    to: '/submit',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    accent: 'from-sky-500/30 to-sky-600/10 border-sky-500/30 hover:border-sky-400/50',
  },
  {
    label: 'Verify Others',
    desc: 'Review pending submissions',
    to: '/verify',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'from-emerald-500/30 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50',
  },
  {
    label: 'Leaderboard',
    desc: 'See where you rank globally',
    to: '/leaderboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    accent: 'from-amber-500/30 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50',
  },
  {
    label: 'My Badges',
    desc: 'View your earned achievements',
    to: '/badges',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
      </svg>
    ),
    accent: 'from-violet-500/30 to-violet-600/10 border-violet-500/30 hover:border-violet-400/50',
  },
];

export default function DashboardPage() {
  const { userId, address } = useWalletStore();

  return (
    <div className="space-y-6">

      {/* Hero banner */}
      <div className="card card-tinted overflow-hidden relative" style={{ padding: 0 }}>
        <div className="app-grid absolute inset-0 pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gradient mb-1">
                {address ? `Welcome back, ${address.slice(0, 6)}…${address.slice(-4)}` : 'Welcome to Proof of Effort'}
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-xl">
                Turn real-world contributions into on-chain reputation. Submit work, get verified by your community, and build a trust score that speaks for itself.
              </p>
            </div>
            <Link to="/submit" className="btn-primary shrink-0 self-start md:self-auto px-6 py-3 text-base">
              + New Effort
            </Link>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Total Users', value: '—' },
              { label: 'Efforts Logged', value: '—' },
              { label: 'Verifications', value: '—' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs text-white/45 mt-0.5 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress + Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <GamificationPanel title="Your Progress" userId={userId ?? undefined} />
        <div className="card card-tinted">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(a => (
              <Link
                key={a.label}
                to={a.to}
                className={`rounded-xl p-3 border bg-gradient-to-br transition-colors flex flex-col gap-2 ${a.accent}`}
              >
                <div className="text-white/70">{a.icon}</div>
                <div>
                  <div className="text-sm font-semibold text-white">{a.label}</div>
                  <div className="text-xs text-white/45 leading-snug">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="card card-tinted">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">How It Works</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(s => (
            <Link
              key={s.num}
              to={s.to}
              className={`rounded-xl p-4 border bg-gradient-to-br ${s.color} ${s.border} hover:brightness-110 transition-all flex flex-col gap-2`}
            >
              <div className="text-2xl font-black text-white/20 leading-none">{s.num}</div>
              <div className="text-sm font-semibold text-white">{s.title}</div>
              <div className="text-xs text-white/50 leading-relaxed">{s.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card card-tinted">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link to="/submit" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">+ Log effort</Link>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">No activity yet.</p>
          <Link to="/submit" className="btn-primary px-5 py-2 text-sm mt-1">Submit your first effort</Link>
        </div>
      </div>

    </div>
  );
}
