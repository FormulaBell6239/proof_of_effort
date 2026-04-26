import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import RiskMeter from '@/components/RiskMeter';
import { fetchRiskAssessment, submitEffort, type EffortRiskInput } from '@/lib/api';
import { useWalletStore } from '@/stores/walletStore';

const CATEGORY_OPTIONS = [
  'volunteering',
  'caregiving',
  'work',
  'education',
  'community_service',
  'other'
] as const;

export default function SubmitEffortPage() {
  const queryClient = useQueryClient();
  const { isConnected, address, userId } = useWalletStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('volunteering');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [submitState, setSubmitState] = useState<{ status: 'idle' | 'submitting' | 'success' | 'error'; message?: string }>(
    { status: 'idle' }
  );

  const payload: EffortRiskInput = useMemo(
    () => ({
      title,
      description,
      category,
      estimated_hours: Number.isFinite(estimatedHours) ? estimatedHours : undefined,
      proof_files_count: proofFiles?.length ?? 0
    }),
    [title, description, category, estimatedHours, proofFiles]
  );

  const enabled = title.trim().length > 0 || description.trim().length > 0 || (proofFiles?.length ?? 0) > 0;

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['riskAssessment', payload],
    queryFn: () => fetchRiskAssessment(payload),
    enabled: false
  });

  // Debounce refetch while typing.
  useEffect(() => {
    if (!enabled) return;
    const t = window.setTimeout(() => {
      void refetch();
    }, 350);
    return () => window.clearTimeout(t);
  }, [enabled, payload, refetch]);

  return (
    <div className="space-y-4">
      <div
        className="card overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, rgba(14,165,233,0.20) 0%, rgba(14,165,233,0.06) 20%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.03) 58%, rgba(14,165,233,0.07) 72%, rgba(14,165,233,0.14) 85%, rgba(14,165,233,0.20) 100%)'
        }}
      >
        <div className="-m-6 mb-6 p-6 border-b border-white/10 bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-emerald-500/10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">Submit Proof of Effort</h1>
          <p className="mt-2 text-white/65">Add details, attach evidence, and publish a claim for verification.</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitState({ status: 'submitting' });

            try {
              const result = await submitEffort({
                title,
                description,
                category,
                estimatedHours,
                proofFiles,
                walletAddress: address
              });

              setSubmitState({ status: 'success', message: `Submitted: ${result.effort.title}` });
              setTitle('');
              setDescription('');
              setEstimatedHours(0);
              setProofFiles(null);

              await queryClient.invalidateQueries({ queryKey: ['gamificationMe', userId ?? 'demo-user'] });
              await queryClient.invalidateQueries({ queryKey: ['efforts'] });
            } catch (err) {
              setSubmitState({ status: 'error', message: err instanceof Error ? err.message : 'Submit failed' });
            }
          }}
        >
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="Brief description of your effort"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Category</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl px-4 py-2 pr-10 bg-black/30 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORY_OPTIONS)[number])}
              >
                <option value="volunteering">Volunteering</option>
                <option value="caregiving">Caregiving</option>
                <option value="work">Work</option>
                <option value="education">Education</option>
                <option value="community_service">Community Service</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Detailed description of your effort"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Upload Proof</label>
            <label className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-white/5 hover:border-white/30 transition-colors cursor-pointer p-8">
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => setProofFiles(e.target.files)}
              />
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white/60 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              {proofFiles && proofFiles.length > 0 ? (
                <div className="text-sm text-emerald-400 font-medium">
                  {proofFiles.length} file{proofFiles.length !== 1 ? 's' : ''} selected
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-white/60">Drop files here or <span className="text-primary-400">browse</span></div>
                  <div className="text-xs text-white/30 mt-1">Images, PDF, or video up to 10 MB each</div>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Estimated Hours</label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              value={Number.isFinite(estimatedHours) ? estimatedHours : 0}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              min={0}
              step={0.25}
            />
          </div>

          <RiskMeter assessment={data} isLoading={isFetching} error={error ? (error as Error).message : null} />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitState.status === 'submitting'}
          >
            {submitState.status === 'submitting' ? 'Submitting…' : 'Submit Effort'}
          </button>

          {submitState.status !== 'idle' && (
            <div
              className={
                submitState.status === 'success'
                  ? 'rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200'
                  : submitState.status === 'error'
                    ? 'rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200'
                    : 'rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70'
              }
            >
              {submitState.message}
            </div>
          )}

          {!isConnected && (
            <div className="text-xs text-white/50">Not connected: submission will be attributed to a demo user.</div>
          )}
        </form>
      </div>

      <div className="text-xs text-white/45 text-center">Tip: the stronger your evidence, the faster you get verified.</div>
    </div>
  );
}
