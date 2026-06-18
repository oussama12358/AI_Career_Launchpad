import pool from '../config/database.js';
import * as grok from '../services/grokService.js';

const isValidUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY stars DESC, created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  const { name, description, tech_stack, github_url, live_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name required' });

  try {
    const aiDesc = await grok.generateProjectDescription(name, tech_stack || [], description || '');

    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description, ai_description, tech_stack, github_url, live_url, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'manual') RETURNING *`,
      [req.user.id, name, description || '', aiDesc, tech_stack || [], github_url || '', live_url || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/projects/:id/regenerate
const regenerateDescription = async (req, res) => {
  try {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });

    const project = result.rows[0];
    const aiDesc = await grok.generateProjectDescription(
      project.name,
      Array.isArray(project.tech_stack) ? project.tech_stack : [],
      project.description || ''
    );

    const updated = await pool.query(
      'UPDATE projects SET ai_description = $1 WHERE id = $2 RETURNING *',
      [aiDesc, project.id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error regenerating project description:', err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
};

export { getProjects, createProject, deleteProject, regenerateDescription };
