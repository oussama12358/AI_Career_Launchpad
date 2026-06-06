import pool from '../config/database.js';
import { fetchGitHubProfile } from '../services/githubService.js';
import * as gemini from '../services/geminiService.js';

// POST /api/github/connect
const connectGitHub = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'GitHub username required' });

  try {
    const { profile, repos, languages } = await fetchGitHubProfile(username);

    // Save repos as projects
    const nonForkRepos = repos.filter((r) => !r.fork).slice(0, 10);

    // Save/update github profile
    const existing = await pool.query('SELECT id FROM github_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE github_profiles SET github_username=$1, profile_data=$2, repos_data=$3, last_synced=NOW() WHERE user_id=$4',
        [username, JSON.stringify(profile), JSON.stringify(repos), req.user.id]
      );
    } else {
      await pool.query(
        'INSERT INTO github_profiles (user_id, github_username, profile_data, repos_data) VALUES ($1,$2,$3,$4)',
        [req.user.id, username, JSON.stringify(profile), JSON.stringify(repos)]
      );
    }

    // Insert top repos as projects
    for (const repo of nonForkRepos) {
      const exists = await pool.query(
        'SELECT id FROM projects WHERE user_id=$1 AND github_url=$2',
        [req.user.id, repo.html_url]
      );
      if (exists.rows.length === 0) {
        // Generate AI description for top starred repos
        let aiDesc = repo.description || '';
        if (repo.stargazers_count > 0 || nonForkRepos.indexOf(repo) < 3) {
          try {
            aiDesc = await gemini.generateProjectDescription(
              repo.name,
              [repo.language, ...(repo.topics || [])].filter(Boolean),
              repo.description || ''
            );
          } catch (e) {
            aiDesc = repo.description || '';
          }
        }

        await pool.query(
          `INSERT INTO projects (user_id, name, description, ai_description, tech_stack, github_url, live_url, stars, language, source)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'github')`,
          [
            req.user.id,
            repo.name,
            repo.description || '',
            aiDesc,
            repo.topics || [],
            repo.html_url,
            repo.homepage || '',
            repo.stargazers_count,
            repo.language || '',
          ]
        );
      }
    }

    res.json({ message: 'GitHub connected successfully', profile, languages, repoCount: repos.length });
  } catch (err) {
    console.error('GitHub connect error:', err);
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    res.status(500).json({ error: 'Failed to connect GitHub' });
  }
};

// GET /api/github
const getGitHubProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM github_profiles WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No GitHub profile connected' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { connectGitHub, getGitHubProfile };
