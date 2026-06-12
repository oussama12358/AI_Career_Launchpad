import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">AI</div>
          <span className="font-bold text-xl text-gray-900">Career Launchpad</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
          <Link href="/auth/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 pt-20 pb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Your AI-Powered<br />
          <span className="text-blue-600">Career Portfolio</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Upload your CV, connect GitHub, and let AI generate a stunning portfolio website — with resume feedback, skill gap analysis, and interview prep.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/register" className="btn-primary text-lg px-8 py-3">
            Build My Portfolio →
          </Link>
          <Link href="/auth/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything you need to land your next role</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'CV Analysis', desc: 'Upload your PDF resume and get instant AI-powered feedback, score, and improvement tips.' },
            { title: 'GitHub Integration', desc: 'Connect your GitHub profile to automatically import projects with AI-generated descriptions.' },
            { title: 'Portfolio Generation', desc: 'Get a beautiful, shareable portfolio website generated in seconds from your data.' },
            { title: 'Skill Gap Analysis', desc: 'Discover missing skills for your target role and get free learning resources.' },
            { title: 'Interview Prep', desc: 'Practice with AI-generated technical and behavioral interview questions tailored to you.' },
            { title: 'Portfolio Score', desc: 'Get a 0-100 score for your portfolio with actionable advice to improve it.' },
          ].map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to launch your career?</h2>
        <p className="text-blue-100 mb-8 text-lg">Join students who already built their portfolio in minutes.</p>
        <Link href="/auth/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg">
          Start for Free
        </Link>
      </section>

      <footer className="text-center py-8 text-gray-500 text-sm">
        © 2025 AI Career Launchpad. Built with Next.js & Grok AI.
      </footer>
    </main>
  );
}
