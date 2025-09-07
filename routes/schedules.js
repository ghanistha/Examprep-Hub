const express = require('express');
const db = require('../config/sqlite-database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all schedules with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { exam, eventType, upcoming, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT s.id, s.event_name, s.event_type, s.start_date, s.end_date, 
             s.description, s.created_at,
             e.name as exam_name, e.code as exam_code
      FROM schedules s
      JOIN exams e ON s.exam_id = e.id
      WHERE s.is_active = 1
    `;
    
    const queryParams = [];

    if (exam) {
      query += ` AND e.code = ?`;
      queryParams.push(exam.toUpperCase());
    }

    if (eventType) {
      query += ` AND s.event_type = ?`;
      queryParams.push(eventType);
    }

    if (upcoming === 'true') {
      query += ` AND date(s.start_date) >= date('now')`;
    }

    query += ` ORDER BY s.start_date ASC, s.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      schedules: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get schedule by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT s.id, s.event_name, s.event_type, s.start_date, s.end_date, 
              s.description, s.created_at,
              e.name as exam_name, e.code as exam_code
       FROM schedules s
       JOIN exams e ON s.exam_id = e.id
       WHERE s.id = ? AND s.is_active = 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      schedule: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get schedules by exam
router.get('/exam/:examCode', optionalAuth, async (req, res) => {
  try {
    const { examCode } = req.params;
    const { eventType, upcoming, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT s.id, s.event_name, s.event_type, s.start_date, s.end_date, 
             s.description, s.created_at
      FROM schedules s
      JOIN exams e ON s.exam_id = e.id
      WHERE e.code = ? AND s.is_active = 1
    `;
    
    const queryParams = [examCode.toUpperCase()];

    if (eventType) {
      query += ` AND s.event_type = ?`;
      queryParams.push(eventType);
    }

    if (upcoming === 'true') {
      query += ` AND date(s.start_date) >= date('now')`;
    }

    query += ` ORDER BY s.start_date ASC, s.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      schedules: result.rows,
      exam: examCode.toUpperCase(),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching schedules by exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming schedules
router.get('/upcoming/list', optionalAuth, async (req, res) => {
  try {
    const { exam, limit = 10 } = req.query;

    let query = `
      SELECT s.id, s.event_name, s.event_type, s.start_date, s.end_date, 
             s.description,
             e.name as exam_name, e.code as exam_code
      FROM schedules s
      JOIN exams e ON s.exam_id = e.id
      WHERE s.is_active = 1 AND date(s.start_date) >= date('now')
    `;
    
    const queryParams = [];

    if (exam) {
      query += ` AND e.code = ?`;
      queryParams.push(exam.toUpperCase());
    }

    query += ` ORDER BY s.start_date ASC`;
    query += ` LIMIT ?`;
    queryParams.push(parseInt(limit));

    const result = await db.query(query, queryParams);

    res.json({
      upcomingSchedules: result.rows
    });
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get event types
router.get('/types/list', optionalAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT DISTINCT event_type FROM schedules WHERE is_active = 1 ORDER BY event_type'
    );

    res.json({
      eventTypes: result.rows.map(row => row.event_type)
    });
  } catch (error) {
    console.error('Error fetching event types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get calendar data (monthly view)
router.get('/calendar/:year/:month', optionalAuth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const { exam } = req.query;

    let query = `
      SELECT s.id, s.event_name, s.event_type, s.start_date, s.end_date, 
             s.description,
             e.name as exam_name, e.code as exam_code
      FROM schedules s
      JOIN exams e ON s.exam_id = e.id
      WHERE s.is_active = 1 
      AND strftime('%Y', s.start_date) = ? 
      AND strftime('%m', s.start_date) = ?
    `;
    
    const queryParams = [String(parseInt(year)).padStart(4, '0'), String(parseInt(month)).padStart(2, '0')];

    if (exam) {
      query += ` AND e.code = ?`;
      queryParams.push(exam.toUpperCase());
    }

    query += ` ORDER BY s.start_date ASC`;

    const result = await db.query(query, queryParams);

    res.json({
      calendar: result.rows,
      year: parseInt(year),
      month: parseInt(month)
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;




