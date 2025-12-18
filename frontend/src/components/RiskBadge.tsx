import type { RiskLevel } from '@/lib/api';

const styles: Record<RiskLevel, { label: string; cls: string }> = {
  low: {
    label: 'Low risk',
    cls: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
  },
  medium: {
    label: 'Medium risk',
    cls: 'border-amber-400/30 bg-amber-500/10 text-amber-100'
  },
  high: {
    label: 'High risk',
    cls: 'border-orange-400/30 bg-orange-500/10 text-orange-100'
  },
  critical: {
    label: 'Critical risk',
    cls: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
  }
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const s = styles[level];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${s.cls}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {s.label}
    </span>
  );
}
