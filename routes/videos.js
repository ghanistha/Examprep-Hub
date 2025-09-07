const express = require('express');
const db = require('../config/sqlite-database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all videos with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { exam, category, featured, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT v.id, v.title, v.description, v.youtube_url, v.thumbnail_url, 
             v.duration, v.views, v.category, v.is_featured, v.created_at,
             e.name as exam_name, e.code as exam_code
      FROM videos v
      JOIN exams e ON v.exam_id = e.id
      WHERE v.is_active = 1
    `;
    
    const queryParams = [];

    if (exam) {
      query += ` AND e.code = ?`;
      queryParams.push(exam.toUpperCase());
    }

    if (category) {
      query += ` AND v.category = ?`;
      queryParams.push(category);
    }

    if (featured === 'true') {
      query += ` AND v.is_featured = 1`;
    }

    query += ` ORDER BY v.is_featured DESC, v.views DESC, v.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      videos: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT v.id, v.title, v.description, v.youtube_url, v.thumbnail_url, 
              v.duration, v.views, v.category, v.is_featured, v.created_at,
              e.name as exam_name, e.code as exam_code
       FROM videos v
       JOIN exams e ON v.exam_id = e.id
       WHERE v.id = ? AND v.is_active = 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment view count
    await db.query(
      'UPDATE videos SET views = views + 1 WHERE id = ?',
      [id]
    );

    // Record user progress if authenticated
    if (req.user) {
      await db.query(
        'INSERT INTO user_progress (user_id, video_id, progress_type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
        [req.user.id, id, 'video_watched']
      );
    }

    res.json({
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get videos by exam
router.get('/exam/:examCode', optionalAuth, async (req, res) => {
  try {
    const { examCode } = req.params;
    const { category, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT v.id, v.title, v.description, v.youtube_url, v.thumbnail_url, 
             v.duration, v.views, v.category, v.is_featured, v.created_at
      FROM videos v
      JOIN exams e ON v.exam_id = e.id
      WHERE e.code = ? AND v.is_active = 1
    `;
    
    const queryParams = [examCode.toUpperCase()];

    if (category) {
      query += ` AND v.category = ?`;
      queryParams.push(category);
    }

    query += ` ORDER BY v.is_featured DESC, v.views DESC, v.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      videos: result.rows,
      exam: examCode.toUpperCase(),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching videos by exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get video categories
router.get('/categories/list', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT category FROM videos WHERE is_active = 1 AND category IS NOT NULL ORDER BY category'
    );

    res.json({
      categories: result.rows.map(row => row.category)
    });
  } catch (error) {
    console.error('Error fetching video categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search videos
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const like = `%${query}%`;
    const result = await db.query(
      `SELECT v.id, v.title, v.description, v.youtube_url, v.thumbnail_url, 
              v.duration, v.views, v.category, v.is_featured, v.created_at,
              e.name as exam_name, e.code as exam_code
       FROM videos v
       JOIN exams e ON v.exam_id = e.id
       WHERE v.is_active = 1 
       AND (v.title LIKE ? OR v.description LIKE ?)
       ORDER BY v.views DESC, v.created_at DESC
       LIMIT ? OFFSET ?`,
      [like, like, parseInt(limit), parseInt(offset)]
    );

    res.json({
      videos: result.rows,
      query,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error searching videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




