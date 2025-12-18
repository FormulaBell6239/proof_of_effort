export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-xl py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Proof of Effort</h3>
            <p className="text-white/60">
              Building trust through verifiable contributions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Quick Links</h3>
            <ul className="space-y-2 text-white/60">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/submit" className="hover:text-white">Submit Effort</a></li>
              <li><a href="/verify" className="hover:text-white">Verify</a></li>
              <li><a href="/leaderboard" className="hover:text-white">Leaderboard</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Community</h3>
            <ul className="space-y-2 text-white/60">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white">Twitter/X</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white">Discord</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-white/10 text-center text-white/50">
          <p>&copy; 2025 Proof of Effort Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
