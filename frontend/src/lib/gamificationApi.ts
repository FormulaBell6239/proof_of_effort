export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type UserProgress = {
  user_id: string;
  xp: number;
  level: number;
  verified_streak_days: number;
  last_verified_effort_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserBadge = {
  code: string;
  name: string;
  description: string;
  tier: BadgeTier;
  awarded_at: string;
  reason: string | null;
};

export type BadgeDefinition = {
  code: string;
  name: string;
  description: string;
  tier: BadgeTier;
  metadata: unknown;
  created_at: string;
};

function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  if (!base) return path;
  return new URL(path, base).toString();
}

export async function fetchGamificationMe(userId?: string): Promise<{ progress: UserProgress; badges: UserBadge[] }> {
  const url = new URL(apiUrl('/api/v1/gamification/me'), window.location.origin);
  if (userId) url.searchParams.set('userId', userId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gamification /me failed (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as { progress: UserProgress; badges: UserBadge[] };
}

export async function fetchBadges(): Promise<BadgeDefinition[]> {
  const res = await fetch(apiUrl('/api/v1/gamification/badges'), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gamification /badges failed (${res.status}): ${text || res.statusText}`);
  }

  const json = (await res.json()) as { badges: BadgeDefinition[] };
  return json.badges;
}

export function xpForNextLevel(level: number): number {
  // Mirrors the backend curve: level = floor(sqrt(xp/100)) + 1
  // => minimum xp for a given level L is 100*(L-1)^2
  const l = Math.max(1, Math.floor(level));
  return 100 * l * l; // next level threshold
}
