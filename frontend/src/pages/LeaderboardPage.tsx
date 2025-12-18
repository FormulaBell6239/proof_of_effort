export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <select className="input-field w-48">
          <option>All Categories</option>
          <option>Volunteering</option>
          <option>Caregiving</option>
          <option>Work</option>
          <option>Education</option>
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Trust Score</th>
                <th className="text-left py-3 px-4">Verified Efforts</th>
                <th className="text-left py-3 px-4">Reputation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-600">
                  No users yet. Be the first to earn trust points!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-5xl mb-2">🥇</div>
          <h3 className="font-semibold mb-1">Gold Badge</h3>
          <p className="text-sm text-gray-600">5000+ Trust Points</p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-2">🥈</div>
          <h3 className="font-semibold mb-1">Silver Badge</h3>
          <p className="text-sm text-gray-600">1000+ Trust Points</p>
        </div>
        <div className="card text-center">
          <div className="text-5xl mb-2">🥉</div>
          <h3 className="font-semibold mb-1">Bronze Badge</h3>
          <p className="text-sm text-gray-600">100+ Trust Points</p>
        </div>
      </div>
    </div>
  );
}
