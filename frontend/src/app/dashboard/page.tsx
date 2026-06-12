'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { FileText, Github, Globe, FolderOpen, ArrowRight, CheckCircle, Circle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ hasResume: false, hasGithub: false, hasPortfolio: false, projectCount: 0 });
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const [resumeRes, githubRes, portfolioRes, projectsRes] = await Promise.allSettled([
        api.get('/resume'),
        api.get('/github'),
        api.get('/portfolio'),
        api.get('/projects'),
      ]);
      setStats({
        hasResume: resumeRes.status === 'fulfilled',
        hasGithub: githubRes.status === 'fulfilled',
        hasPortfolio: portfolioRes.status === 'fulfilled',
        projectCount: projectsRes.status === 'fulfilled' ? projectsRes.value.data.length : 0,
      });
      if (portfolioRes.status === 'fulfilled') {
        setPortfolioScore(portfolioRes.value.data.portfolio?.score);
      }
    };
    fetchStats();
  }, []);

  const steps = [
    { label: 'Upload your resume', done: stats.hasResume, href: '/dashboard/resume', icon: FileText },
    { label: 'Connect GitHub', done: stats.hasGithub, href: '/dashboard/github', icon: Github },
    { label: 'Generate portfolio', done: stats.hasPortfolio, href: '/dashboard/portfolio', icon: Globe },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your career launchpad overview</p>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Setup Progress</h2>
          <span className="text-sm font-medium text-blue-600">{completedSteps}/{steps.length} completed</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="space-y-3">
          {steps.map(({ label, done, href, icon: Icon }) => (
            <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
              {done
                ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              <Icon className="w-4 h-4 text-gray-500" />
              <span className={`flex-1 text-sm font-medium ${done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{label}</span>
              {!done && <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Resume', value: stats.hasResume ? '✓ Uploaded' : 'Not uploaded', color: stats.hasResume ? 'text-green-600' : 'text-gray-400' },
          { label: 'GitHub', value: stats.hasGithub ? '✓ Connected' : 'Not connected', color: stats.hasGithub ? 'text-green-600' : 'text-gray-400' },
          { label: 'Projects', value: stats.projectCount.toString(), color: 'text-blue-600' },
          { label: 'Portfolio Score', value: portfolioScore !== null ? `${portfolioScore}/100` : 'N/A', color: portfolioScore && portfolioScore >= 70 ? 'text-green-600' : 'text-orange-500' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Upload CV', href: '/dashboard/resume', icon: '📄' },
            { label: 'Connect GitHub', href: '/dashboard/github', icon: '💻' },
            { label: 'Add Project', href: '/dashboard/projects', icon: '🚀' },
            { label: 'Generate Portfolio', href: '/dashboard/portfolio', icon: '✨' },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
