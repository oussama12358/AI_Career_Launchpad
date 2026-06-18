import pool from '../config/database.js';

// UPDATE project with image and featured status
export const updateProjectShowcase = async (req, res) => {
  const { projectId } = req.params;
  const { image_url, is_featured, demo_url, featured_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE projects 
       SET image_url = $1, is_featured = $2, demo_url = $3, featured_order = $4, created_at = created_at
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [image_url, is_featured, demo_url, featured_order, projectId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating project showcase:', err);
    res.status(500).json({ error: 'Failed to update project showcase' });
  }
};

// GET featured projects
export const getFeaturedProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects 
       WHERE user_id = $1 AND is_featured = true
       ORDER BY featured_order ASC NULLS LAST, created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching featured projects:', err);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
};

// REORDER featured projects
export const reorderFeaturedProjects = async (req, res) => {
  const { projects } = req.body;

  try {
    // Update order for each project
    for (const [index, projectId] of projects.entries()) {
      await pool.query(
        `UPDATE projects SET featured_order = $1 WHERE id = $2 AND user_id = $3`,
        [index, projectId, req.user.id]
      );
    }

    res.json({ message: 'Projects reordered' });
  } catch (err) {
    console.error('Error reordering projects:', err);
    res.status(500).json({ error: 'Failed to reorder projects' });
  }
};
