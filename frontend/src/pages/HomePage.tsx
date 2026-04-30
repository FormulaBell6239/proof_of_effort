import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-8 md:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 md:p-16 glow">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
            Live reputation, verifiable evidence, real trust
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight text-gradient">
            Build Trust Through Verified Effort
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            A decentralized platform where your contributions become portable credibility.
            Submit proof, get verified, and unlock opportunities with a reputation you can take anywhere.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/submit" className="btn-primary text-lg px-8 py-3">
              Submit Proof
            </Link>
            <Link to="/verify" className="btn-secondary text-lg px-8 py-3">
              Become a Verifier
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card card-dark text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Verifiable Proof</h3>
          <p className="text-white/65">
            Document your efforts with immutable blockchain records and community verification.
          </p>
        </div>

        <div className="card card-dark text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Fraud Resistance</h3>
          <p className="text-white/65">
            AI-powered detection and community verification prevent fraud and ensure authenticity.
          </p>
        </div>

        <div className="card card-dark text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Portable Trust</h3>
          <p className="text-white/65">
            Build a reputation that follows you anywhere, unlocking opportunities globally.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="card p-10 md:p-12">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-white">Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="text-primary-600 text-2xl">🎯</div>
            <div>
              <h4 className="font-semibold mb-1 text-white">Disaster Relief</h4>
              <p className="text-white/65">Verify genuine needs and distribute aid fairly</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-primary-600 text-2xl">💼</div>
            <div>
              <h4 className="font-semibold mb-1 text-white">Employment</h4>
              <p className="text-white/65">Prove work history and skills to employers</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-primary-600 text-2xl">❤️</div>
            <div>
              <h4 className="font-semibold mb-1 text-white">Charity</h4>
              <p className="text-white/65">Ensure donations reach those with verified needs</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="text-primary-600 text-2xl">🤝</div>
            <div>
              <h4 className="font-semibold mb-1 text-white">Volunteering</h4>
              <p className="text-white/65">Build portable records of community service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: 'Total Efforts', value: '0' },
          { label: 'Verified Users', value: '0' },
          { label: 'Verifications', value: '0' },
          { label: 'Trust Points', value: '0' },
        ].map((s) => (
          <div key={s.label} className="card py-8">
            <div className="text-4xl font-extrabold text-gradient mb-2">{s.value}</div>
            <div className="text-white/60">{s.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
