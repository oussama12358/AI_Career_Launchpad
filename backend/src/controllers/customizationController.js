import pool from '../config/database.js';
import crypto from 'crypto';

// GET all available themes
export const getThemes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, label, description, preview_colors, is_active FROM portfolio_themes WHERE is_active = true ORDER BY created_at'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching themes:', err);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
};

// GET portfolio customization
export const getCustomization = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM portfolio_customizations WHERE portfolio_id = $1',
      [req.params.portfolioId]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error('Error fetching customization:', err);
    res.status(500).json({ error: 'Failed to fetch customization' });
  }
};

// UPDATE portfolio customization
export const updateCustomization = async (req, res) => {
  const { portfolioId } = req.params;
  const {
    theme_name,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    layout_style,
    show_resume,
    show_github,
    show_projects,
    show_skills,
    font_family,
    custom_css,
  } = req.body;

  try {
    // Check if customization exists
    const existing = await pool.query(
      'SELECT id FROM portfolio_customizations WHERE portfolio_id = $1',
      [portfolioId]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE portfolio_customizations SET 
         theme_name=$2, primary_color=$3, secondary_color=$4, accent_color=$5,
         background_color=$6, text_color=$7, layout_style=$8, show_resume=$9,
         show_github=$10, show_projects=$11, show_skills=$12, font_family=$13,
         custom_css=$14, updated_at=NOW()
         WHERE portfolio_id=$1 RETURNING *`,
        [
          portfolioId,
          theme_name,
          primary_color,
          secondary_color,
          accent_color,
          background_color,
          text_color,
          layout_style,
          show_resume,
          show_github,
          show_projects,
          show_skills,
          font_family,
          custom_css,
        ]
      );
      res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        `INSERT INTO portfolio_customizations 
         (portfolio_id, theme_name, primary_color, secondary_color, accent_color,
          background_color, text_color, layout_style, show_resume, show_github,
          show_projects, show_skills, font_family, custom_css)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
        [
          portfolioId,
          theme_name,
          primary_color,
          secondary_color,
          accent_color,
          background_color,
          text_color,
          layout_style,
          show_resume,
          show_github,
          show_projects,
          show_skills,
          font_family,
          custom_css,
        ]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating customization:', err);
    res.status(500).json({ error: 'Failed to update customization' });
  }
};
