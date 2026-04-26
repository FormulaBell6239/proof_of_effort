import { useEffect, useState } from 'react';
import GamificationPanel from '../components/GamificationPanel';
import { useWalletStore } from '../stores/walletStore';
import { fetchMyProfile, fetchTrustScore, type UserProfile, type TrustScore } from '../lib/api';
import { calculateTrustScore } from '../lib/trustScore';

export default function ProfilePage() {
  const { userId } = useWalletStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trust, setTrust] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([fetchMyProfile(), fetchTrustScore(userId)])
      .then(([p, t]) => { setProfile(p); setTrust(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const breakdown = trust ? calculateTrustScore(trust) : null;

  if (!userId) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{loading ? '...' : (profile?.username ?? 'Unknown')}</h1>
              <p className="text-gray-600">{profile?.wallet_address ? `${profile.wallet_address.slice(0, 10)}...` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GamificationPanel title="Progress" userId={userId ?? undefined} />
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Trust Score Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Effort Score</span><span className="font-semibold">{breakdown?.effortScore ?? 0}</span></div>
            <div className="flex justify-between"><span>Verification Score</span><span className="font-semibold">{breakdown?.verificationScore ?? 0}</span></div>
            <div className="flex justify-between"><span>Consistency Score</span><span className="font-semibold">{breakdown?.consistencyScore ?? 0}</span></div>
            <div className="flex justify-between border-t pt-3 font-bold">
              <span>Total Score</span>
              <span className="text-primary-600">{breakdown?.total ?? profile?.trust_score ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Total Efforts</span><span className="font-semibold">{profile?.total_efforts ?? 0}</span></div>
            <div className="flex justify-between"><span>Verified Efforts</span><span className="font-semibold">{profile?.verified_efforts ?? 0}</span></div>
            <div className="flex justify-between"><span>Verifications Done</span><span className="font-semibold">{profile?.total_verifications ?? 0}</span></div>
            <div className="flex justify-between"><span>Member Since</span><span className="font-semibold">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
