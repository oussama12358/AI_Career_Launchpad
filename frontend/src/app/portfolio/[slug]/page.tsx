'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import {
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Star,
  Target,
  TerminalSquare,
} from 'lucide-react';

type Project = {
  id: string;
  name: string;
  ai_description?: string;
  description?: string;
  tech_stack?: string[];
  github_url?: string;
  live_url?: string;
  stars?: number;
};

type PortfolioResponse = {
  portfolio: {
    name?: string;
    title?: string;
    ai_bio?: string;
    bio?: string;
    skills?: string[];
    score?: number;
    github_url?: string;
    linkedin_url?: string;
    contact_email?: string;
    email?: string;
    location?: string;
  };
  projects: Project[];
};

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/portfolio/public/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const stats = useMemo(() => {
    const skills = data?.portfolio.skills?.length || 0;
    const projects = data?.projects?.length || 0;
    const stars = data?.projects?.reduce((sum, project) => sum + Number(project.stars || 0), 0) || 0;
    return [
      { label: 'Portfolio score', value: data?.portfolio.score ? `${data.portfolio.score}/100` : 'In progress', icon: Award },
      { label: 'Projects', value: String(projects), icon: Briefcase },
      { label: 'Skills', value: String(skills), icon: Code2 },
      { label: 'GitHub stars', value: String(stars), icon: Star },
    ];
  }, [data]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-lg bg-white border border-stone-200 shadow-sm flex items-center justify-center mx-auto mb-4">
          <TerminalSquare className="w-7 h-7 text-stone-500" />
        </div>
        <h1 className="text-2xl font-bold text-stone-950">Portfolio not found</h1>
        <p className="text-stone-500 mt-2">This portfolio does not exist or is not published.</p>
      </div>
    </div>
  );

  const { portfolio, projects } = data;
  const name = portfolio.name || 'Portfolio Owner';
  const bio = portfolio.ai_bio || portfolio.bio || 'A focused builder shaping a professional portfolio with selected projects, technical strengths, and career momentum.';
  const email = portfolio.contact_email || portfolio.email;
  const topSkills = portfolio.skills?.slice(0, 10) || [];
  const featuredProjects = projects?.slice(0, 4) || [];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <section className="relative overflow-hidden bg-[#10211f] text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
          <nav className="flex items-center justify-between gap-4 text-sm text-teal-50/80">
            <span className="font-semibold">{portfolio.title || `${name}'s Portfolio`}</span>
            <div className="hidden sm:flex items-center gap-4">
              <a href="#projects" className="hover:text-white transition-colors">Projects</a>
              <a href="#skills" className="hover:text-white transition-colors">Skills</a>
              {email && <a href={`mailto:${email}`} className="hover:text-white transition-colors">Contact</a>}
            </div>
          </nav>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-end pt-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-teal-50">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                Available portfolio profile
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {name}
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-8 text-teal-50/85">
                {bio}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {portfolio.github_url && (
                  <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#10211f] hover:bg-teal-50 transition-colors">
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                    <Mail className="w-4 h-4" /> Contact
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                <div className="w-16 h-16 rounded-lg bg-amber-400 text-[#10211f] flex items-center justify-center text-2xl font-bold">
                  {getInitials(name)}
                </div>
                <div>
                  <p className="text-sm text-teal-50/70">Profile snapshot</p>
                  <p className="font-semibold text-white">{portfolio.title || 'Career portfolio'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-5">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-md bg-white/10 p-3">
                    <Icon className="w-4 h-4 text-amber-300 mb-3" />
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-teal-50/70">{label}</p>
                  </div>
                ))}
              </div>
              {(email || portfolio.location) && (
                <div className="mt-4 space-y-2 text-sm text-teal-50/80">
                  {email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-300" /> {email}</p>}
                  {portfolio.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-300" /> {portfolio.location}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-stone-200 p-4">
              <Icon className="w-5 h-5 text-teal-700 mb-4" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-stone-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="skills" className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
        <div>
          <p className="text-sm font-semibold text-teal-700">Capabilities</p>
          <h2 className="mt-2 text-3xl font-bold">Skill system</h2>
          <p className="mt-4 text-stone-600 leading-7">
            {topSkills.length
              ? 'A compact view of the tools and strengths currently represented in this profile.'
              : 'Skills will appear here after they are added through a resume upload or GitHub sync.'}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(topSkills.length ? topSkills : ['Add technical skills', 'Connect GitHub', 'Upload resume', 'Add portfolio focus']).map((skill) => (
            <div key={skill} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </span>
                <span className="font-semibold text-stone-900">{skill}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="projects" className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
            <div>
              <p className="text-sm font-semibold text-teal-700">Selected work</p>
              <h2 className="mt-2 text-3xl font-bold">Projects</h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              {featuredProjects.length ? `${featuredProjects.length} highlighted project${featuredProjects.length === 1 ? '' : 's'} from this portfolio.` : 'Project cards will fill this section when repositories or case studies are added.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {(featuredProjects.length ? featuredProjects : createEmptyProjects()).map((project, index) => {
              const href = project.github_url || project.live_url || '';
              return (
                <article key={project.id || project.name} className="rounded-lg border border-stone-200 bg-stone-50 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-11 h-11 rounded-md bg-[#10211f] text-white flex items-center justify-center font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-stone-500">
                      <Star className="w-4 h-4 text-amber-500" /> {project.stars || 0}
                    </div>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-stone-950">{project.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {project.ai_description || project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(project.tech_stack?.length ? project.tech_stack : ['Portfolio', 'Case study']).slice(0, 5).map((tech) => (
                      <span key={tech} className="rounded-md border border-teal-100 bg-white px-2.5 py-1 text-xs font-medium text-teal-800">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-teal-700">
                        <Github className="w-4 h-4" /> Code
                      </a>
                    )}
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-teal-700">
                        <ExternalLink className="w-4 h-4" /> Live
                      </a>
                    )}
                    {!href && <span className="text-sm font-medium text-stone-500">Details pending</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="rounded-lg border border-stone-200 bg-[#10211f] p-6 sm:p-8 text-white grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-sm font-semibold text-amber-300">Next conversation</p>
            <h2 className="mt-2 text-2xl font-bold">Open to aligned roles, collaborations, and technical conversations.</h2>
          </div>
          {email ? (
            <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-bold text-[#10211f] hover:bg-amber-300 transition-colors">
              <Mail className="w-4 h-4" /> Start a conversation
            </a>
          ) : (
            <span className="rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-teal-50/80">Contact details pending</span>
          )}
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm text-stone-500">
          <p>{name}</p>
          <p>Built with AI Career Launchpad</p>
        </div>
      </footer>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'PO';
}

function createEmptyProjects(): Project[] {
  return [
    {
      id: 'empty-1',
      name: 'Add a flagship project',
      description: 'Use this card for the strongest build, case study, or repository in the portfolio.',
      tech_stack: ['Impact', 'Stack', 'Outcome'],
      stars: 0,
    },
    {
      id: 'empty-2',
      name: 'Add a supporting project',
      description: 'Include one more project that shows range, collaboration, or a different technical strength.',
      tech_stack: ['Role', 'Tools', 'Result'],
      stars: 0,
    },
  ];
}
