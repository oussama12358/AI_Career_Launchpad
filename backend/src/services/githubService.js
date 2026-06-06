import axios from 'axios';

const githubToken = process.env.GITHUB_TOKEN;
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    ...(githubToken && githubToken !== 'your_github_personal_access_token_optional'
      ? { Authorization: `Bearer ${githubToken}` }
      : {}),
  },
});

const fetchGitHubProfile = async (username) => {
  const [profileRes, reposRes] = await Promise.all([
    githubApi.get(`/users/${username}`),
    githubApi.get(`/users/${username}/repos?sort=stars&per_page=20`),
  ]);

  const profile = {
    username: profileRes.data.login,
    name: profileRes.data.name,
    bio: profileRes.data.bio,
    avatar_url: profileRes.data.avatar_url,
    html_url: profileRes.data.html_url,
    public_repos: profileRes.data.public_repos,
    followers: profileRes.data.followers,
    location: profileRes.data.location,
    blog: profileRes.data.blog,
  };

  const repos = reposRes.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    html_url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    topics: repo.topics,
    fork: repo.fork,
  }));

  // Extract languages used
  const languages = [...new Set(repos.filter((r) => r.language).map((r) => r.language))];

  return { profile, repos, languages };
};

export { fetchGitHubProfile };
