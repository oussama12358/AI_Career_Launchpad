'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Share2,
  LinkIcon,
  Eye,
  Users,
  TrendingUp,
  Copy,
  Trash2,
  Loader2,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';

interface Analytics {
  stats: {
    total_views: number;
    unique_visitors: number;
    unique_ips: number;
    last_view: string;
  };
  viewsByDate: Array<{ date: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

interface ShareLink {
  id: string;
  share_token: string;
  share_method: string;
  view_count: number;
  created_at: string;
}

export default function PortfolioAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [portfolioId, setPortfolioId] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get portfolio
        const portfolioRes = await api.get('/portfolio');
        const pid = portfolioRes.data?.portfolio?.id ?? portfolioRes.data?.id ?? '';
        const slug = portfolioRes.data?.portfolio?.slug ?? portfolioRes.data?.slug ?? '';
        if (!pid) {
          setLoading(false);
          return;
        }
        setPortfolioId(pid);
        setPortfolioUrl(`${window.location.origin}/portfolio/${slug}`);

        // Load analytics
        const analyticsRes = await api.get(`/analytics/${pid}`);
        setAnalytics(analyticsRes.data);

        // Load share links
        const sharesRes = await api.get(`/analytics/${pid}/shares`);
        setShareLinks(sharesRes.data);
      } catch (err: any) {
        console.warn('Error loading analytics:', err?.response?.status || err?.message || err);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const buildShareIntent = (method: string, url: string) => {
    const encodedUrl = encodeURIComponent(url);

    switch (method) {
      case 'email':
        return `mailto:?subject=${encodeURIComponent('Check out my portfolio')}&body=${encodeURIComponent(`View my portfolio here: ${url}`)}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my portfolio')}&url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      default:
        return url;
    }
  };

  const openShareIntent = (method: string, url: string, popup: Window | null) => {
    const intentUrl = buildShareIntent(method, url);

    if (method === 'email') {
      window.location.href = intentUrl;
      return;
    }

    if (popup && !popup.closed) {
      popup.opener = null;
      popup.location.href = intentUrl;
      return;
    }

    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCreateShare = async (method: string, via?: string) => {
    if (!portfolioId || !portfolioUrl) {
      toast.error('Portfolio is still loading. Please wait a moment.');
      return;
    }

    const popup = method === 'email' ? null : window.open('', '_blank');
    setCreating(true);

    try {
      const res = await api.post(`/analytics/${portfolioId}/share`, {
        share_method: method,
        shared_via: via,
      });

      const shareUrl = `${portfolioUrl}?share=${res.data.share_token}`;
      setShareLinks((current) => [...current, res.data]);

      openShareIntent(method, shareUrl, popup);
      toast.success(`Share link created via ${method}!`);
    } catch (err) {
      openShareIntent(method, portfolioUrl, popup);
      toast.error('Could not track this share, but the platform was opened.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!confirm('Delete this share link?')) return;

    try {
      await api.delete(`/analytics/share/${shareId}`);
      setShareLinks(shareLinks.filter((s) => s.id !== shareId));
      toast.success('Share link deleted');
    } catch (err) {
      toast.error('Failed to delete share link');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics & Sharing</h1>
        <p className="text-gray-500 mt-1">Track views, shares, and manage your portfolio distribution</p>
      </div>

      {/* View Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.stats.total_views || 0}</p>
          <p className="text-xs text-gray-600">Total Views</p>
        </div>
        <div className="card text-center">
          <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.stats.unique_visitors || 0}</p>
          <p className="text-xs text-gray-600">Unique Visitors</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{analytics?.stats.unique_ips || 0}</p>
          <p className="text-xs text-gray-600">Unique IPs</p>
        </div>
        <div className="card text-center">
          <Share2 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{shareLinks.length}</p>
          <p className="text-xs text-gray-600">Active Shares</p>
        </div>
      </div>

      {/* Portfolio Link */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Your Portfolio URL
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={portfolioUrl}
            readOnly
            className="input flex-1"
          />
          <button
            onClick={() => handleCopyLink(portfolioUrl)}
            className="btn-primary p-2"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Your Portfolio
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { method: 'email', label: 'Email', icon: Mail, color: 'bg-blue-100 hover:bg-blue-200' },
            { method: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-sky-100 hover:bg-sky-200' },
            { method: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-100 hover:bg-blue-200' },
            { method: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-orange-100 hover:bg-orange-200' },
          ].map(({ method, label, icon: Icon, color }) => (
            <button
              key={method}
              onClick={() => handleCreateShare(method)}
              disabled={creating}
              className={`p-3 rounded-lg ${color} transition-colors text-center flex flex-col items-center gap-2`}
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Share Links */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Links</h2>
        {shareLinks.length === 0 ? (
          <p className="text-gray-500">No share links created yet. Create one using the options above!</p>
        ) : (
          <div className="space-y-3">
            {shareLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 capitalize">{link.share_method}</p>
                  <p className="text-xs text-gray-600">
                    {link.view_count} views • {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(`${portfolioUrl}?share=${link.share_token}`)}
                    className="btn-secondary p-2"
                    title="Copy share link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteShare(link.id)}
                    className="btn-danger p-2"
                    title="Delete share link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Referrers */}
      {analytics?.topReferrers && analytics.topReferrers.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h2>
          <div className="space-y-2">
            {analytics.topReferrers.map((referrer, idx) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <p className="text-sm text-gray-700 truncate">{referrer.referrer || 'Direct'}</p>
                <span className="badge bg-blue-100 text-blue-700">{referrer.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
