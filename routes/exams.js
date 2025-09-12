const express = require('express');
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all exams
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, code, description, exam_type FROM exams WHERE is_active = 1 ORDER BY name'
    );

    res.json({
      exams: result.rows
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, name, code, description, exam_type FROM exams WHERE id = ? AND is_active = 1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      exam: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam by code
router.get('/code/:code', optionalAuth, async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      'SELECT id, name, code, description, exam_type FROM exams WHERE code = ? AND is_active = 1',
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      exam: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching exam by code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam statistics
router.get('/:id/stats', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if exam exists
    const examResult = await db.query(
      'SELECT id, name FROM exams WHERE id = ? AND is_active = 1',
      [id]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Get video count
    const videoResult = await db.query(
      'SELECT COUNT(*) as video_count FROM videos WHERE exam_id = ? AND is_active = 1',
      [id]
    );

    // Get paper count
    const paperResult = await db.query(
      'SELECT COUNT(*) as paper_count FROM papers WHERE exam_id = ? AND is_active = 1',
      [id]
    );

    // Get total views
    const viewsResult = await db.query(
      'SELECT SUM(views) as total_views FROM videos WHERE exam_id = ? AND is_active = 1',
      [id]
    );

    // Get upcoming schedules
    const scheduleResult = await db.query(
      'SELECT COUNT(*) as upcoming_events FROM schedules WHERE exam_id = ? AND is_active = 1 AND start_date >= CURRENT_DATE',
      [id]
    );

    res.json({
      exam: examResult.rows[0],
      stats: {
        videoCount: parseInt(videoResult.rows[0].video_count),
        paperCount: parseInt(paperResult.rows[0].paper_count),
        totalViews: parseInt(viewsResult.rows[0].total_views) || 0,
        upcomingEvents: parseInt(scheduleResult.rows[0].upcoming_events)
      }
    });
  } catch (error) {
    console.error('Error fetching exam stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;





