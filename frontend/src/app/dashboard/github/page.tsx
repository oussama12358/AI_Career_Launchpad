'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Github, RefreshCw, ExternalLink, Star, Loader2 } from 'lucide-react';

interface GitHubProfile {
  github_username: string;
  profile_data: {
    name: string;
    bio: string;
    avatar_url: string;
    html_url: string;
    public_repos: number;
    followers: number;
    location: string;
  };
  repos_data: any[];
  last_synced: string;
}

export default function GitHubPage() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    api.get('/github')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setConnecting(true);
    try {
      // Extract username from URL if needed (e.g., https://github.com/user -> user)
      let extractedUsername = username.trim();
      if (extractedUsername.includes('github.com/')) {
        extractedUsername = extractedUsername.split('github.com/').pop()?.split('/')[0] || extractedUsername;
      }
      const res = await api.post('/github/connect', { username: extractedUsername });
      toast.success(`Connected! Found ${res.data.repoCount} repositories`);
      // Refresh profile
      const profileRes = await api.get('/github');
      setProfile(profileRes.data);
      setUsername('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to connect GitHub');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const repos = profile?.repos_data ? JSON.parse(JSON.stringify(profile.repos_data)).slice(0, 6) : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">GitHub Integration</h1>
        <p className="text-gray-500 mt-1">Connect your GitHub to import projects automatically</p>
      </div>

      {/* Connect form */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">
          {profile ? 'Reconnect GitHub' : 'Connect your GitHub'}
        </h2>
        <form onSubmit={handleConnect} className="flex gap-3">
          <div className="flex-1 relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Enter your GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-6" disabled={connecting}>
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : profile ? <RefreshCw className="w-4 h-4" /> : 'Connect'}
          </button>
        </form>
      </div>

      {/* Profile card */}
      {profile && (
        <>
          <div className="card">
            <div className="flex items-center gap-4">
              <img
                src={profile.profile_data.avatar_url}
                alt={profile.github_username}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{profile.profile_data.name || profile.github_username}</h3>
                {profile.profile_data.bio && <p className="text-gray-500 text-sm mt-0.5">{profile.profile_data.bio}</p>}
                {profile.profile_data.location && (
                  <p className="text-gray-400 text-xs mt-1">📍 {profile.profile_data.location}</p>
                )}
              </div>
              <a
                href={profile.profile_data.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Profile
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.profile_data.public_repos}</p>
                <p className="text-xs text-gray-500">Public Repos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.profile_data.followers}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
            </div>
          </div>

          {/* Top repos */}
          {repos.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Imported Repositories</h2>
              <div className="space-y-3">
                {repos.map((repo: any) => (
                  <div key={repo.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline text-sm"
                      >
                        {repo.name}
                      </a>
                      {repo.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{repo.description}</p>
                      )}
                      {repo.language && (
                        <span className="badge bg-gray-200 text-gray-700 mt-1">{repo.language}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-4">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      {repo.stargazers_count}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Last synced: {new Date(profile.last_synced).toLocaleString()}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
