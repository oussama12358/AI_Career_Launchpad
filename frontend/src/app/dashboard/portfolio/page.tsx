'use client';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Activity,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';

interface Portfolio {
  id: string;
  title: string;
  ai_bio: string;
  skills: string[];
  slug: string;
  score: number;
  is_published: boolean;
  github_url: string;
}

interface Assessment {
  skills_detected: string[];
  skills_missing: string[];
  recommendations: any;
  interview_questions: any[];
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showInterview, setShowInterview] = useState(true);
  const [showSkillGap, setShowSkillGap] = useState(true);

  useEffect(() => {
    api.get('/portfolio')
      .then((res) => {
        setPortfolio(res.data.portfolio);
        setProjects(res.data.projects);
        setAssessment(res.data.assessment);
        setAiAvailable(res.data.aiAvailable ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/portfolio/generate');
      setPortfolio(res.data.portfolio);
      setProjects(res.data.projects);
      setAssessment({
        skills_detected: res.data.skills,
        skills_missing: res.data.skillGap?.missing_skills || [],
        recommendations: res.data.skillGap,
        interview_questions: res.data.interviewQuestions,
      });
      setAiAvailable(res.data.aiAvailable ?? true);
      toast.success(res.data.aiAvailable ? 'Portfolio generated with AI!' : 'Portfolio generated with fallback content');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const portfolioUrl = portfolio ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${portfolio.slug}` : '';

  const interviewQs = useMemo(() => {
    if (!assessment?.interview_questions) return [];
    return typeof assessment.interview_questions === 'string'
      ? JSON.parse(assessment.interview_questions)
      : assessment.interview_questions;
  }, [assessment]);

  const skillGap = useMemo(() => {
    if (!assessment?.recommendations) return null;
    return typeof assessment.recommendations === 'string'
      ? JSON.parse(assessment.recommendations)
      : assessment.recommendations;
  }, [assessment]);

  const stats = [
    { label: 'Portfolio score', value: portfolio?.score ? `${portfolio.score}/100` : 'Not scored', icon: Activity },
    { label: 'Projects', value: String(projects.length), icon: Briefcase },
    { label: 'Skills', value: String(portfolio?.skills?.length || 0), icon: Target },
    { label: 'Status', value: portfolio?.is_published ? 'Published' : 'Draft', icon: Globe },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-700" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-700">Launchpad</p>
          <h1 className="text-3xl font-bold text-gray-950 mt-1">Portfolio Studio</h1>
          <p className="text-gray-500 mt-2">Generate, inspect, and share your professional portfolio.</p>
        </div>
        <button onClick={handleGenerate} className="btn-primary bg-teal-700 hover:bg-teal-800 inline-flex items-center justify-center gap-2 px-5 py-3" disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {portfolio ? 'Regenerate Portfolio' : 'Generate Portfolio'}
        </button>
      </div>

      {!aiAvailable && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <strong>AI not configured:</strong> Grok API key is not set or quota is unavailable. Portfolio generation will use fallback content until `GROK_API_KEY` is available.
        </div>
      )}

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-[#10211f] text-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-teal-100">Shareable profile</p>
                <h2 className="text-2xl font-bold mt-1">{portfolio?.title || 'Your Portfolio'}</h2>
              </div>
              <div className="w-14 h-14 rounded-lg bg-amber-400 text-[#10211f] flex items-center justify-center font-bold">
                {portfolio?.score || '--'}
              </div>
            </div>
            <p className="text-teal-50/85 leading-7 mt-5">
              {portfolio?.ai_bio || 'Generate your portfolio to create a polished bio, skill system, project highlights, and a public share page.'}
            </p>
          </div>

          <div className="p-6">
            <div className="grid sm:grid-cols-4 gap-3">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Icon className="w-4 h-4 text-teal-700 mb-3" />
                  <p className="font-bold text-gray-950">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Public URL</p>
                  <p className="text-sm text-gray-500 font-mono mt-1 truncate max-w-lg">
                    {portfolioUrl || 'Generate a portfolio to create a public link'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyLink} disabled={!portfolio} className="btn-secondary inline-flex items-center gap-2 text-sm">
                    <Copy className="w-4 h-4" /> Copy
                  </button>
                  <a
                    href={portfolio ? `/portfolio/${portfolio.slug}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-primary bg-teal-700 hover:bg-teal-800 inline-flex items-center gap-2 text-sm ${!portfolio ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <ExternalLink className="w-4 h-4" /> View
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Portfolio readiness
              </h2>
              <span className="text-sm font-bold text-teal-700">{portfolio?.score || 0}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-teal-700" style={{ width: `${Math.min(portfolio?.score || 0, 100)}%` }} />
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Bio generated', done: Boolean(portfolio?.ai_bio) },
                { label: 'Skills detected', done: Boolean(portfolio?.skills?.length) },
                { label: 'Projects attached', done: projects.length > 0 },
                { label: 'Public link ready', done: Boolean(portfolio?.slug) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${item.done ? 'text-teal-700' : 'text-gray-300'}`} />
                  <span className={item.done ? 'text-gray-800' : 'text-gray-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-950 mb-4">Top skills</h2>
            <div className="flex flex-wrap gap-2">
              {(portfolio?.skills?.length ? portfolio.skills.slice(0, 16) : ['Upload resume', 'Connect GitHub', 'Generate portfolio']).map((skill) => (
                <span key={skill} className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {skillGap && (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <button onClick={() => setShowSkillGap(!showSkillGap)} className="flex items-center justify-between w-full">
              <h2 className="font-semibold text-gray-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" /> Skill Gap Analysis
              </h2>
              {showSkillGap ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showSkillGap && (
              <div className="mt-5 space-y-5">
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                  <p className="text-3xl font-bold text-amber-700">{skillGap.readiness_score || 0}%</p>
                  <p className="text-sm text-amber-900 mt-1">Career readiness score</p>
                </div>

                {skillGap.missing_skills?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Skills to learn</p>
                    <div className="flex flex-wrap gap-2">
                      {skillGap.missing_skills.map((s: string) => (
                        <span key={s} className="rounded-md bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {skillGap.recommended_courses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-800">Recommended resources</p>
                    {skillGap.recommended_courses.slice(0, 4).map((course: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-gray-800">{course.skill}</span>
                        {course.resource && (
                          <a href={course.resource} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-teal-700 inline-flex items-center gap-1">
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {interviewQs.length > 0 && (
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <button onClick={() => setShowInterview(!showInterview)} className="flex items-center justify-between w-full">
              <h2 className="font-semibold text-gray-950 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-700" /> Interview Questions ({interviewQs.length})
              </h2>
              {showInterview ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showInterview && (
              <div className="mt-5 space-y-3">
                {interviewQs.slice(0, 5).map((q: any, i: number) => (
                  <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400">Q{i + 1}</span>
                      <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">{q.type}</span>
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{q.difficulty}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-950">{q.question}</p>
                    {q.hint && <p className="text-xs text-gray-500 mt-2">{q.hint}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
