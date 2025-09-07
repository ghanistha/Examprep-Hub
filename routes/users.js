const express = require('express');
const db = require('../config/sqlite-database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT up.id, up.progress_type, up.progress_data, up.created_at,
             v.title as video_title, v.youtube_url as video_url,
             p.title as paper_title, p.file_path as paper_path
      FROM user_progress up
      LEFT JOIN videos v ON up.video_id = v.id
      LEFT JOIN papers p ON up.paper_id = p.id
      WHERE up.user_id = ?
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;

    if (type) {
      query += ` AND up.progress_type = $${paramCount++}`;
      queryParams.push(type);
    }

    query += ` ORDER BY up.created_at DESC`;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      progress: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user bookmarks
router.get('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { type, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT b.id, b.bookmark_type, b.created_at,
             v.title as video_title, v.youtube_url as video_url, v.thumbnail_url,
             p.title as paper_title, p.file_path as paper_path
      FROM bookmarks b
      LEFT JOIN videos v ON b.video_id = v.id
      LEFT JOIN papers p ON b.paper_id = p.id
      WHERE b.user_id = ?
    `;
    
    const queryParams = [req.user.id];
    let paramCount = 2;

    if (type) {
      query += ` AND b.bookmark_type = $${paramCount++}`;
      queryParams.push(type);
    }

    query += ` ORDER BY b.created_at DESC`;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      bookmarks: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add bookmark
router.post('/bookmarks', authenticateToken, async (req, res) => {
  try {
    const { videoId, paperId, bookmarkType } = req.body;

    if (!bookmarkType || (!videoId && !paperId)) {
      return res.status(400).json({ error: 'Bookmark type and either videoId or paperId is required' });
    }

    if (bookmarkType === 'video' && !videoId) {
      return res.status(400).json({ error: 'videoId is required for video bookmarks' });
    }

    if (bookmarkType === 'paper' && !paperId) {
      return res.status(400).json({ error: 'paperId is required for paper bookmarks' });
    }

    // Check if item exists
    if (bookmarkType === 'video') {
      const videoCheck = await db.query('SELECT id FROM videos WHERE id = ? AND is_active = 1', [videoId]);
      if (videoCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }
    } else if (bookmarkType === 'paper') {
      const paperCheck = await db.query('SELECT id FROM papers WHERE id = ? AND is_active = 1', [paperId]);
      if (paperCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Paper not found' });
      }
    }

    // Add bookmark
    const result = await db.query(
      'INSERT INTO bookmarks (user_id, video_id, paper_id, bookmark_type) VALUES (?, ?, ?, ?) RETURNING id',
      [req.user.id, videoId || null, paperId || null, bookmarkType]
    );

    res.status(201).json({
      message: 'Bookmark added successfully',
      bookmarkId: result.rows[0].id
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Item already bookmarked' });
    }
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM bookmarks WHERE id = ? AND user_id = ? RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get video watch count
    const videoResult = await db.query(
      'SELECT COUNT(*) as video_count FROM user_progress WHERE user_id = ? AND progress_type = ?',
      [req.user.id, 'video_watched']
    );

    // Get paper download count
    const paperResult = await db.query(
      'SELECT COUNT(*) as paper_count FROM user_progress WHERE user_id = ? AND progress_type = ?',
      [req.user.id, 'paper_downloaded']
    );

    // Get bookmark count
    const bookmarkResult = await db.query(
      'SELECT COUNT(*) as bookmark_count FROM bookmarks WHERE user_id = ?',
      [req.user.id]
    );

    // Get recent activity (last 7 days)
    const activityResult = await db.query(
      'SELECT COUNT(*) as recent_activity FROM user_progress WHERE user_id = ? AND created_at >= NOW() - INTERVAL \'7 days\'',
      [req.user.id]
    );

    res.json({
      stats: {
        videosWatched: parseInt(videoResult.rows[0].video_count),
        papersDownloaded: parseInt(paperResult.rows[0].paper_count),
        bookmarksCount: parseInt(bookmarkResult.rows[0].bookmark_count),
        recentActivity: parseInt(activityResult.rows[0].recent_activity)
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get recent progress
    const progressResult = await db.query(
      `SELECT up.progress_type, up.created_at,
              v.title as video_title, v.youtube_url,
              p.title as paper_title
       FROM user_progress up
       LEFT JOIN videos v ON up.video_id = v.id
       LEFT JOIN papers p ON up.paper_id = p.id
       WHERE up.user_id = ?
       ORDER BY up.created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    // Get recent bookmarks
    const bookmarkResult = await db.query(
      `SELECT b.bookmark_type, b.created_at,
              v.title as video_title, v.youtube_url,
              p.title as paper_title
       FROM bookmarks b
       LEFT JOIN videos v ON b.video_id = v.id
       LEFT JOIN papers p ON b.paper_id = p.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC
       LIMIT 5`,
      [req.user.id]
    );

    // Get recommended content based on exam interest
    const recommendedResult = await db.query(
      `SELECT v.id, v.title, v.description, v.youtube_url, v.thumbnail_url, v.views
       FROM videos v
       JOIN exams e ON v.exam_id = e.id
       WHERE e.code = ? AND v.is_active = 1
       ORDER BY v.views DESC
       LIMIT 3`,
      [req.user.exam_interest.toUpperCase()]
    );

    res.json({
      recentProgress: progressResult.rows,
      recentBookmarks: bookmarkResult.rows,
      recommendedVideos: recommendedResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;





