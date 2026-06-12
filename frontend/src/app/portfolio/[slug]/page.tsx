'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Github, ExternalLink, Mail, Linkedin, Star, Loader2 } from 'lucide-react';

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/portfolio/public/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4"></p>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio not found</h1>
        <p className="text-gray-500 mt-2">This portfolio doesn't exist or isn't published.</p>
      </div>
    </div>
  );

  const { portfolio, projects } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-bold">
            {portfolio.name?.[0] || '?'}
          </div>
          <h1 className="text-4xl font-bold mb-3">{portfolio.name}</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            {portfolio.ai_bio || portfolio.bio}
          </p>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {portfolio.github_url && (
              <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
            {portfolio.linkedin_url && (
              <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {portfolio.contact_email && (
              <a href={`mailto:${portfolio.contact_email}`}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors">
                <Mail className="w-4 h-4" /> Contact
              </a>
            )}
          </div>

          {/* Score badge */}
          {portfolio.score && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-1.5 rounded-full text-sm">
              ⭐ Portfolio Score: <strong>{portfolio.score}/100</strong>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Skills */}
        {portfolio.skills?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills & Technologies</h2>
            <div className="flex flex-wrap gap-3">
              {portfolio.skills.map((skill: string) => (
                <span key={skill} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project: any) => {
                const href = project.github_url || project.live_url || null;
                const openHref = (url: string | null) => {
                  if (!url) return;
                  window.open(url, '_blank', 'noopener,noreferrer');
                };
                return (
                  <div
                    key={project.id}
                    role={href ? 'link' : undefined}
                    tabIndex={href ? 0 : undefined}
                    onClick={href ? () => openHref(href) : undefined}
                    onKeyDown={href ? (e) => { if (e.key === 'Enter' || e.key === ' ') { openHref(href); } } : undefined}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
                  >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      {project.stars}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {project.ai_description || project.description}
                  </p>

                  {project.tech_stack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tech_stack.map((t: string) => (
                        <span key={t} className="badge bg-blue-100 text-blue-700">{t}</span>
                      ))}
                    </div>
                  )}

                    <div className="flex items-center gap-3">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <Github className="w-4 h-4" /> Code
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <ExternalLink className="w-4 h-4" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm">
            Built with <span className="text-blue-600 font-medium">AI Career Launchpad</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
