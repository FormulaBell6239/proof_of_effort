import { Link } from 'react-router-dom';
import { useWalletStore } from '../stores/walletStore';

export default function Header() {
  const { isConnected, address, connect, disconnect } = useWalletStore();

  const handleWalletAction = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 via-primary-600 to-indigo-500 flex items-center justify-center glow">
              <span className="text-white font-extrabold text-sm tracking-wide">PoE</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold text-gradient">Proof of Effort</div>
              <div className="text-xs text-white/50">Build trust. Prove work. Earn reputation.</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-2">
            <Link to="/dashboard" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              Dashboard
            </Link>
            <Link to="/submit" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              Submit
            </Link>
            <Link to="/verify" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              Verify
            </Link>
            <Link to="/badges" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              Badges
            </Link>
            <Link to="/leaderboard" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              Leaderboard
            </Link>
            {isConnected && (
              <Link to="/profile" className="px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Profile
              </Link>
            )}
          </div>

          <button onClick={handleWalletAction} className={isConnected ? 'btn-secondary' : 'btn-primary'}>
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </nav>
    </header>
  );
}
