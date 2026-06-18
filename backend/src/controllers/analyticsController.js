import pool from '../config/database.js';
import crypto from 'crypto';

// TRACK portfolio view
export const trackView = async (req, res) => {
  const { portfolioId } = req.params;
  const { visitorId } = req.body;

  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    await pool.query(
      `INSERT INTO portfolio_analytics 
       (portfolio_id, visitor_id, user_agent, referrer, ip_address, viewed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        portfolioId,
        visitorId || crypto.randomUUID(),
        req.headers['user-agent'],
        req.headers['referer'],
        ip,
      ]
    );

    // Update portfolio view count and last viewed
    await pool.query(
      'UPDATE portfolios SET view_count = view_count + 1, last_viewed_at = NOW() WHERE id = $1',
      [portfolioId]
    );

    res.json({ message: 'View tracked' });
  } catch (err) {
    console.error('Error tracking view:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

// GET portfolio analytics
export const getAnalytics = async (req, res) => {
  const { portfolioId } = req.params;

  try {
    // Verify portfolio ownership
    const portfolio = await pool.query(
      'SELECT * FROM portfolios WHERE id = $1 AND user_id = $2',
      [portfolioId, req.user.id]
    );

    if (portfolio.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Get view stats
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(DISTINCT ip_address) as unique_ips,
        MAX(viewed_at) as last_view
       FROM portfolio_analytics WHERE portfolio_id = $1`,
      [portfolioId]
    );

    // Get views by date (last 30 days)
    const viewsByDate = await pool.query(
      `SELECT DATE(viewed_at) as date, COUNT(*) as views
       FROM portfolio_analytics 
       WHERE portfolio_id = $1 AND viewed_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(viewed_at)
       ORDER BY date DESC`,
      [portfolioId]
    );

    // Get top referrers
    const topReferrers = await pool.query(
      `SELECT referrer, COUNT(*) as count
       FROM portfolio_analytics
       WHERE portfolio_id = $1 AND referrer IS NOT NULL
       GROUP BY referrer
       ORDER BY count DESC LIMIT 10`,
      [portfolioId]
    );

    res.json({
      stats: stats.rows[0],
      viewsByDate: viewsByDate.rows,
      topReferrers: topReferrers.rows,
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// CREATE share link
export const createShareLink = async (req, res) => {
  const { portfolioId } = req.params;
  const { share_method, shared_via } = req.body;

  try {
    // Verify portfolio ownership
    const portfolio = await pool.query(
      'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
      [portfolioId, req.user.id]
    );

    if (portfolio.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const shareToken = crypto.randomBytes(16).toString('hex');

    const result = await pool.query(
      `INSERT INTO portfolio_shares (portfolio_id, share_token, share_method, shared_via)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [portfolioId, shareToken, share_method, shared_via]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating share link:', err);
    res.status(500).json({ error: 'Failed to create share link' });
  }
};

// GET share links
export const getShareLinks = async (req, res) => {
  const { portfolioId } = req.params;

  try {
    // Verify portfolio ownership
    const portfolio = await pool.query(
      'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
      [portfolioId, req.user.id]
    );

    if (portfolio.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const result = await pool.query(
      'SELECT id, share_token, share_method, view_count, created_at FROM portfolio_shares WHERE portfolio_id = $1 ORDER BY created_at DESC',
      [portfolioId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching share links:', err);
    res.status(500).json({ error: 'Failed to fetch share links' });
  }
};

// DELETE share link
export const deleteShareLink = async (req, res) => {
  const { shareId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM portfolio_shares ps 
       WHERE ps.id = $1 AND ps.portfolio_id IN 
       (SELECT id FROM portfolios WHERE user_id = $2)
       RETURNING id`,
      [shareId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    res.json({ message: 'Share link deleted' });
  } catch (err) {
    console.error('Error deleting share link:', err);
    res.status(500).json({ error: 'Failed to delete share link' });
  }
};
