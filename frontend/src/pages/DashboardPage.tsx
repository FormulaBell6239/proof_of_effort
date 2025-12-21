import GamificationPanel from '../components/GamificationPanel';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <GamificationPanel title="Your Progress" />
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">What to do next</h3>
          <ul className="mt-3 space-y-2 text-white/70 text-sm">
            <li>• Submit an effort (small XP)</li>
            <li>• Verify someone else’s effort (medium XP)</li>
            <li>• Get your effort verified (big XP + streak)</li>
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Your Trust Score</h3>
          <div className="text-4xl font-bold text-primary-600">0</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Efforts</h3>
          <div className="text-4xl font-bold text-primary-600">0</div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Verifications Done</h3>
          <div className="text-4xl font-bold text-primary-600">0</div>
        </div>
      </div>
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-600">No activity yet. Start by submitting your first effort!</p>
      </div>
    </div>
  );
}
