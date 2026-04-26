import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletStore } from '../stores/walletStore';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/badges', label: 'Badges' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/verify', label: 'Verify' },
  { to: '/submit', label: 'Submit' },
];

export default function Header() {
  const { isConnected, address, userId, connect, disconnect } = useWalletStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const links = isConnected || userId
    ? [...NAV_LINKS, { to: '/profile', label: 'Profile' }]
    : NAV_LINKS;

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 via-primary-600 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-extrabold text-xs tracking-wide">PoE</span>
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-base font-extrabold text-gradient font-mono">Proof of Effort</div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase font-mono">Build trust · Prove work · Earn reputation</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                  isActive(link.to)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleWalletAction}
              className={
                isConnected
                  ? "flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  : "flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white hover:border-white/30 transition-colors"
              }
            >
              {isConnected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>

            {/* Hamburger */}
            <button
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t border-white/10 pt-3 pb-1 flex flex-col gap-0.5">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(link.to)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
