import GamificationPanel from '../components/GamificationPanel';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div>
              <h1 className="text-2xl font-bold">Username</h1>
              <p className="text-gray-600">0x0000...0000</p>
            </div>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GamificationPanel title="Progress" />
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Trust Score Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Effort Score</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Verification Score</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Consistency Score</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Total Score</span>
              <span className="text-primary-600">0</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Efforts</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Efforts</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Verifications Done</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since</span>
              <span className="font-semibold">-</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Efforts</h2>
        <p className="text-gray-600">No efforts submitted yet.</p>
      </div>
    </div>
  );
}
