import pool from '../config/database.js';
import * as gemini from '../services/geminiService.js';
import { v4 as uuidv4 } from 'uuid';

// POST /api/portfolio/generate
const generatePortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    // Get resume
    const resumeResult = await pool.query('SELECT * FROM resumes WHERE user_id = $1', [userId]);
    const resume = resumeResult.rows[0];

    // Get GitHub profile
    const ghResult = await pool.query('SELECT * FROM github_profiles WHERE user_id = $1', [userId]);
    const github = ghResult.rows[0];

    // Get projects
    const projectsResult = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY stars DESC', [userId]);
    const projects = projectsResult.rows;

    if (!resume && !github) {
      return res.status(400).json({ error: 'Please upload a CV or connect GitHub first' });
    }

    // Whether AI key is configured
    const hasAIGeminiKey = Boolean(process.env.GEMINI_API_KEY);

    // Extract skills
    let skills = [];
    if (resume?.parsed_data?.skills) skills = [...skills, ...resume.parsed_data.skills];
    if (github?.repos_data) {
      let repos = [];
      try {
        repos = typeof github.repos_data === 'string' ? JSON.parse(github.repos_data || '[]') : github.repos_data || [];
      } catch (e) {
        repos = [];
      }
      const langs = repos.map((r) => r.language).filter(Boolean);
      skills = [...new Set([...skills, ...langs])];
    }

    // Generate AI bio
    const cvText = resume?.raw_text || `Developer ${user.name} with GitHub profile ${github?.github_username}`;
    // Call Gemini helpers but tolerate failures (quota/errors) and fall back to defaults
    let aiBio;
    let skillGap;
    let interviewQuestions;
    let aiProduced = true;
    try {
      aiBio = await gemini.generateBio(cvText, user.name);
    } catch (e) {
      console.error('AI bio error:', e);
      aiProduced = false;
      aiBio = `${user.name} is a software developer with solid experience building projects and applications.`;
    }

    try {
      skillGap = await gemini.generateSkillGapAnalysis(skills);
    } catch (e) {
      console.error('AI skill gap error:', e);
      aiProduced = false;
      skillGap = { missing_skills: [], recommended_courses: [], career_tips: [], readiness_score: 50 };
    }

    try {
      interviewQuestions = await gemini.generateInterviewQuestions(skills, cvText);
    } catch (e) {
      console.error('AI interview questions error:', e);
      aiProduced = false;
      interviewQuestions = skills.map((skill, i) => ({
        question: `Describe a project where you used ${skill}.`,
        type: 'technical',
        difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
        hint: `Talk about your experience with ${skill} and the outcomes.`,
      }));
    }

    // Create slug
    const slug = `${user.name.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 6)}`;

    // Portfolio score
    const portfolioData = { skills, projects: projects.length, bio: aiBio, github: !!github, resume: !!resume };
    let scoreData;
    try {
      scoreData = await gemini.generatePortfolioScore(portfolioData);
    } catch (e) {
      console.error('AI portfolio score error:', e);
      aiProduced = false;
      scoreData = { score: 65, breakdown: { projects: 15, skills: 15, bio: 20, completeness: 15 }, advice: 'Add more project details and highlight key skills.' };
    }

    // Save/update portfolio
    const existingPortfolio = await pool.query('SELECT id FROM portfolios WHERE user_id = $1', [userId]);
    let portfolio;

    if (existingPortfolio.rows.length > 0) {
      const r = await pool.query(
        `UPDATE portfolios SET ai_bio=$1, skills=$2, score=$3, github_url=$4, is_published=true, updated_at=NOW()
         WHERE user_id=$5 RETURNING *`,
        [
          aiBio,
          skills,
          scoreData.score,
          github?.profile_data?.html_url || '',
          userId,
        ]
      );
      portfolio = r.rows[0];
    } else {
      const r = await pool.query(
        `INSERT INTO portfolios (user_id, title, ai_bio, skills, github_url, slug, score, is_published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
        [
          userId,
          `${user.name}'s Portfolio`,
          aiBio,
          skills,
          github?.profile_data?.html_url || '',
          slug,
          scoreData.score,
        ]
      );
      portfolio = r.rows[0];
    }

    // Save skill assessment
    await pool.query(
      `INSERT INTO skill_assessments (user_id, skills_detected, skills_missing, recommendations, interview_questions)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [
        userId,
        skills,
        skillGap.missing_skills || [],
        JSON.stringify(skillGap),
        JSON.stringify(interviewQuestions),
      ]
    );

    const aiAvailable = hasAIGeminiKey && aiProduced;

    res.json({
      portfolio,
      skills,
      skillGap,
      interviewQuestions,
      scoreData,
      projects,
      aiAvailable,
    });
  } catch (err) {
    console.error('Portfolio generation error:', err);
    res.status(500).json({ error: 'Failed to generate portfolio' });
  }
};

// GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    const portfolioResult = await pool.query('SELECT * FROM portfolios WHERE user_id = $1', [req.user.id]);
    if (portfolioResult.rows.length === 0) return res.status(404).json({ error: 'Portfolio not generated yet' });

    const portfolio = portfolioResult.rows[0];
    const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY stars DESC', [req.user.id]);
    const assessment = await pool.query(
      'SELECT * FROM skill_assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );

    const aiAvailable = Boolean(process.env.GEMINI_API_KEY);

    res.json({ portfolio, projects: projects.rows, assessment: assessment.rows[0] || null, aiAvailable });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/portfolio/public/:slug
const getPublicPortfolio = async (req, res) => {
  try {
    const { slug } = req.params;
    const portfolioResult = await pool.query(
      'SELECT p.*, u.name, u.email FROM portfolios p JOIN users u ON p.user_id = u.id WHERE p.slug = $1 AND p.is_published = true',
      [slug]
    );
    if (portfolioResult.rows.length === 0) return res.status(404).json({ error: 'Portfolio not found' });

    const portfolio = portfolioResult.rows[0];
    const projects = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY stars DESC',
      [portfolio.user_id]
    );

    res.json({ portfolio, projects: projects.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/portfolio
const updatePortfolio = async (req, res) => {
  const { title, bio, contact_email, linkedin_url, theme } = req.body;
  try {
    const result = await pool.query(
      `UPDATE portfolios SET title=$1, bio=$2, contact_email=$3, linkedin_url=$4, theme=$5, updated_at=NOW()
       WHERE user_id=$6 RETURNING *`,
      [title, bio, contact_email, linkedin_url, theme, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { generatePortfolio, getPortfolio, getPublicPortfolio, updatePortfolio };
