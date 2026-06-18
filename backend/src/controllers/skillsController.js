import pool from '../config/database.js';

// GET all user skills
export const getUserSkills = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT us.*, COUNT(se.id) as endorsements_count
       FROM user_skills us
       LEFT JOIN skill_endorsements se ON us.id = se.user_skill_id
       WHERE us.user_id = $1
       GROUP BY us.id
       ORDER BY COUNT(se.id) DESC, us.skill_name`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching skills:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
};

// ADD a skill
export const addSkill = async (req, res) => {
  const { skill_name, proficiency_level, years_of_experience } = req.body;

  if (!skill_name) {
    return res.status(400).json({ error: 'Skill name required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_skills (user_id, skill_name, proficiency_level, years_of_experience)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_name) DO UPDATE
       SET proficiency_level = $3, years_of_experience = $4, updated_at = NOW()
       RETURNING *`,
      [req.user.id, skill_name, proficiency_level || 'beginner', years_of_experience || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ error: 'Failed to add skill' });
  }
};

// UPDATE skill proficiency
export const updateSkillProficiency = async (req, res) => {
  const { skillId } = req.params;
  const { proficiency_level, years_of_experience } = req.body;

  try {
    const result = await pool.query(
      `UPDATE user_skills 
       SET proficiency_level = $1, years_of_experience = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [proficiency_level, years_of_experience, skillId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

// DELETE skill
export const deleteSkill = async (req, res) => {
  const { skillId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM user_skills WHERE id = $1 AND user_id = $2 RETURNING id',
      [skillId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ error: 'Failed to delete skill' });
  }
};

// ENDORSE a skill
export const endorseSkill = async (req, res) => {
  const { skillId } = req.params;
  const { target_user_id } = req.body;

  try {
    // Check if already endorsed
    const existing = await pool.query(
      'SELECT id FROM skill_endorsements WHERE user_skill_id = $1 AND endorsed_by = $2',
      [skillId, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already endorsed this skill' });
    }

    await pool.query(
      'INSERT INTO skill_endorsements (user_skill_id, endorsed_by) VALUES ($1, $2)',
      [skillId, req.user.id]
    );

    // Update endorsement count
    const result = await pool.query(
      `SELECT us.*, COUNT(se.id) as endorsements_count
       FROM user_skills us
       LEFT JOIN skill_endorsements se ON us.id = se.user_skill_id
       WHERE us.id = $1
       GROUP BY us.id`,
      [skillId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error endorsing skill:', err);
    res.status(500).json({ error: 'Failed to endorse skill' });
  }
};

// REMOVE endorsement
export const removeEndorsement = async (req, res) => {
  const { skillId } = req.params;

  try {
    await pool.query(
      'DELETE FROM skill_endorsements WHERE user_skill_id = $1 AND endorsed_by = $2',
      [skillId, req.user.id]
    );

    res.json({ message: 'Endorsement removed' });
  } catch (err) {
    console.error('Error removing endorsement:', err);
    res.status(500).json({ error: 'Failed to remove endorsement' });
  }
};
