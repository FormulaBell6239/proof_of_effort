import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RiskMeter from '@/components/RiskMeter';
import { fetchRiskAssessment, type EffortRiskInput } from '@/lib/api';

const CATEGORY_OPTIONS = [
  'volunteering',
  'caregiving',
  'work',
  'education',
  'community_service',
  'other'
] as const;

export default function SubmitEffortPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('volunteering');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);

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
    enabled,
    staleTime: 10_000
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card overflow-hidden">
        <div className="-m-6 mb-6 p-6 border-b border-white/10 bg-gradient-to-r from-primary-500/10 via-indigo-500/10 to-emerald-500/10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gradient">Submit Proof of Effort</h1>
          <p className="mt-2 text-white/65">
            Add details, attach evidence, and publish a claim for verification.
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            <select
              className="input-field"
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
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-5">
              <div className="text-sm text-white/60">
                Photos, documents, and videos help verifiers confirm your claim.
              </div>
              <input
                type="file"
                multiple
                className="input-field mt-3"
                onChange={(e) => setProofFiles(e.target.files)}
              />
            </div>
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

          <button type="submit" className="btn-primary w-full">
            Submit Effort
          </button>
        </form>
      </div>

      <div className="text-xs text-white/45 text-center">
        Tip: the stronger your evidence, the faster you get verified.
      </div>
    </div>
  );
}
