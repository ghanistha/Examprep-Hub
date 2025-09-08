const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/sqlite-database');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'papers');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: exam_year_type_timestamp.pdf
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get all papers with optional filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { exam, year, paperType, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT p.id, p.title, p.description, p.year, p.paper_type, 
             p.file_path, p.file_size, p.download_count, p.created_at,
             e.name as exam_name, e.code as exam_code
      FROM papers p
      JOIN exams e ON p.exam_id = e.id
      WHERE p.is_active = 1
    `;
    
    const queryParams = [];
    let paramCount = 1;

    if (exam) {
      query += ` AND e.code = ?`;
      queryParams.push(exam.toUpperCase());
    }

    if (year) {
      query += ` AND p.year = ?`;
      queryParams.push(parseInt(year));
    }

    if (paperType) {
      query += ` AND p.paper_type = ?`;
      queryParams.push(paperType);
    }

    query += ` ORDER BY p.year DESC, p.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      papers: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get paper by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.id, p.title, p.description, p.year, p.paper_type, 
              p.file_path, p.file_size, p.download_count, p.created_at,
              e.name as exam_name, e.code as exam_code
       FROM papers p
       JOIN exams e ON p.exam_id = e.id
       WHERE p.id = ? AND p.is_active = 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    res.json({
      paper: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get papers by exam
router.get('/exam/:examCode', optionalAuth, async (req, res) => {
  try {
    const { examCode } = req.params;
    const { year, paperType, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT p.id, p.title, p.description, p.year, p.paper_type, 
             p.file_path, p.file_size, p.download_count, p.created_at
      FROM papers p
      JOIN exams e ON p.exam_id = e.id
      WHERE e.code = ? AND p.is_active = 1
    `;
    
    const queryParams = [examCode.toUpperCase()];
    let paramCount = 2;

    if (year) {
      query += ` AND p.year = ?`;
      queryParams.push(parseInt(year));
    }

    if (paperType) {
      query += ` AND p.paper_type = ?`;
      queryParams.push(paperType);
    }

    query += ` ORDER BY p.year DESC, p.created_at DESC`;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    res.json({
      papers: result.rows,
      exam: examCode.toUpperCase(),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching papers by exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download paper (increment download count)
router.post('/:id/download', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if paper exists
    const result = await db.query(
      'SELECT id, title, file_path FROM papers WHERE id = ? AND is_active = 1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const paper = result.rows[0];

    // Increment download count
    await db.query(
      'UPDATE papers SET download_count = download_count + 1 WHERE id = ?',
      [id]
    );

    // Record user progress if authenticated
    if (req.user) {
      await db.query(
        'INSERT INTO user_progress (user_id, paper_id, progress_type) VALUES (?, ?, ?) ON CONFLICT DO NOTHING',
        [req.user.id, id, 'paper_downloaded']
      );
    }

    res.json({
      message: 'Download recorded successfully',
      paper: {
        id: paper.id,
        title: paper.title,
        filePath: paper.file_path
      }
    });
  } catch (error) {
    console.error('Error recording download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available years for papers
router.get('/years/list', optionalAuth, async (req, res) => {
  try {
    const { exam } = req.query;
    
    let query = 'SELECT DISTINCT year FROM papers WHERE is_active = 1';
    const queryParams = [];
    
    if (exam) {
      query += ' AND exam_id = (SELECT id FROM exams WHERE code = ?)';
      queryParams.push(exam.toUpperCase());
    }
    
    query += ' ORDER BY year DESC';

    const result = await db.query(query, queryParams);

    res.json({
      years: result.rows.map(row => row.year)
    });
  } catch (error) {
    console.error('Error fetching paper years:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get paper types
router.get('/types/list', optionalAuth, async (req, res) => {
  try {
    const { exam } = req.query;
    
    let query = 'SELECT DISTINCT paper_type FROM papers WHERE is_active = 1 AND paper_type IS NOT NULL';
    const queryParams = [];
    
    if (exam) {
      query += ' AND exam_id = (SELECT id FROM exams WHERE code = ?)';
      queryParams.push(exam.toUpperCase());
    }
    
    query += ' ORDER BY paper_type';

    const result = await db.query(query, queryParams);

    res.json({
      paperTypes: result.rows.map(row => row.paper_type)
    });
  } catch (error) {
    console.error('Error fetching paper types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search papers
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT p.id, p.title, p.description, p.year, p.paper_type, 
              p.file_path, p.file_size, p.download_count, p.created_at,
              e.name as exam_name, e.code as exam_code
       FROM papers p
       JOIN exams e ON p.exam_id = e.id
       WHERE p.is_active = 1 
       AND (p.title LIKE ? OR p.description LIKE ?)
       ORDER BY p.year DESC, p.download_count DESC
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, parseInt(limit), parseInt(offset)]
    );

    res.json({
      papers: result.rows,
      query,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error searching papers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new paper (Admin only) - Temporarily disabled
router.post('/upload', optionalAuth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { title, description, year, paperType, examId } = req.body;

    // Validate required fields
    if (!title || !year || !paperType || !examId) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Missing required fields: title, year, paperType, examId' 
      });
    }

    // Check if exam exists
    const examResult = await db.query('SELECT id FROM exams WHERE id = ?', [examId]);
    if (examResult.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid exam ID' });
    }

    // Insert paper record
    const result = await db.query(
      `INSERT INTO papers (title, description, year, paper_type, file_path, file_size, exam_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        title,
        description || null,
        parseInt(year),
        paperType,
        `/uploads/papers/${req.file.filename}`,
        req.file.size,
        parseInt(examId)
      ]
    );

    // Get the created paper with exam details
    const paperResult = await db.query(
      `SELECT p.id, p.title, p.description, p.year, p.paper_type, 
              p.file_path, p.file_size, p.download_count, p.created_at,
              e.name as exam_name, e.code as exam_code
       FROM papers p
       JOIN exams e ON p.exam_id = e.id
       WHERE p.id = ?`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'Paper uploaded successfully',
      paper: paperResult.rows[0]
    });

  } catch (error) {
    console.error('Error uploading paper:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve PDF files
router.get('/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'papers', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving PDF file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



