'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Globe, Copy, ExternalLink, Target, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showInterview, setShowInterview] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(false);

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
      if (res.data.aiAvailable) {
        toast.success('Portfolio generated with AI!');
      } else {
        toast.success('Portfolio generated using default fallback (no AI key configured)');
      }
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

  const scoreColor = (s: number) => s >= 80 ? 'text-green-600' : s >= 60 ? 'text-orange-500' : 'text-red-500';
  const scoreBg = (s: number) => s >= 80 ? 'bg-green-50 border-green-200' : s >= 60 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const interviewQs = assessment?.interview_questions
    ? (typeof assessment.interview_questions === 'string'
        ? JSON.parse(assessment.interview_questions)
        : assessment.interview_questions)
    : [];

  const skillGap = assessment?.recommendations
    ? (typeof assessment.recommendations === 'string'
        ? JSON.parse(assessment.recommendations)
        : assessment.recommendations)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-500 mt-1">Generate and manage your AI-powered portfolio</p>
      </div>

      {!aiAvailable && (
        <div className="card border-yellow-200 bg-yellow-50 text-yellow-800 p-4">
          <strong>AI not configured:</strong> Grok API key is not set or quota is unavailable. Portfolio generation will use basic defaults instead of AI-generated content. To enable richer results add `GROK_API_KEY` to the backend and restart the server.
        </div>
      )}

      {/* Generate button */}
      <div className="card text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {portfolio ? 'Regenerate Portfolio' : 'Generate Your Portfolio'}
        </h2>
        <p className="text-gray-500 text-sm mb-5">
          AI will analyze your resume and GitHub to create a complete portfolio
        </p>
        <button onClick={handleGenerate} className="btn-primary px-8 py-3" disabled={generating}>
          {generating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating with AI...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {portfolio ? 'Regenerate' : 'Generate Portfolio'}
            </span>
          )}
        </button>
      </div>

      {portfolio && (
        <>
          {/* Portfolio card */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{portfolio.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge bg-green-100 text-green-700">Published</span>
                  <Globe className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 font-mono truncate max-w-xs">
                    /portfolio/{portfolio.slug}
                  </span>
                </div>
              </div>

              {portfolio.score && (
                <div className={`px-4 py-2 rounded-xl border font-bold text-2xl ${scoreBg(portfolio.score)} ${scoreColor(portfolio.score)}`}>
                  {portfolio.score}<span className="text-sm font-normal text-gray-500">/100</span>
                </div>
              )}
            </div>

            {portfolio.ai_bio && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 leading-relaxed italic">"{portfolio.ai_bio}"</p>
              </div>
            )}

            {portfolio.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {portfolio.skills.map((skill) => (
                  <span key={skill} className="badge bg-blue-100 text-blue-700">{skill}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <a
                href={`/portfolio/${portfolio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" /> View Portfolio
              </a>
              <button onClick={copyLink} className="btn-secondary flex items-center gap-2 text-sm">
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          {skillGap && (
            <div className="card">
              <button
                onClick={() => setShowSkillGap(!showSkillGap)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" /> Skill Gap Analysis
                </h2>
                {showSkillGap ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showSkillGap && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <span className="text-2xl font-bold text-orange-600">{skillGap.readiness_score || 0}%</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Career Readiness Score</p>
                      <p className="text-xs text-gray-500">Based on your current skill set</p>
                    </div>
                  </div>

                  {skillGap.missing_skills?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills to Learn</p>
                      <div className="flex flex-wrap gap-2">
                        {skillGap.missing_skills.map((s: string) => (
                          <span key={s} className="badge bg-red-100 text-red-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skillGap.recommended_courses?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommended Resources</p>
                      <div className="space-y-2">
                        {skillGap.recommended_courses.slice(0, 4).map((c: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700 font-medium">{c.skill}</span>
                            {c.resource && (
                              <a href={c.resource} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                Learn <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {skillGap.career_tips?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Career Tips</p>
                      <ul className="space-y-1">
                        {skillGap.career_tips.map((tip: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">💡</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Interview Questions */}
          {interviewQs.length > 0 && (
            <div className="card">
              <button
                onClick={() => setShowInterview(!showInterview)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" /> Interview Questions ({interviewQs.length})
                </h2>
                {showInterview ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showInterview && (
                <div className="mt-4 space-y-3">
                  {interviewQs.map((q: any, i: number) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">Q{i + 1}</span>
                        <span className={`badge ${q.type === 'technical' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {q.type}
                        </span>
                        <span className={`badge ${q.difficulty === 'easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
                      {q.hint && (
                        <p className="text-xs text-gray-500 mt-1 italic">💡 {q.hint}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
