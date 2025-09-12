const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Robust CORS configuration to support credentials and preflight
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow same-origin or non-browser
    if (allowedOrigins.length === 0) return callback(null, true); // allow all if not specified
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/users', require('./routes/users'));
app.use('/api/centers', require('./routes/centers'));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/exams', (req, res) => {
  res.sendFile(path.join(__dirname, 'exams.html'));
});

app.get('/videos', (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

app.get('/papers', (req, res) => {
  res.sendFile(path.join(__dirname, 'papers.html'));
});

app.get('/schedule', (req, res) => {
  res.sendFile(path.join(__dirname, 'schedule.html'));
});

app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'calendar.html'));
});

app.get('/upsc', (req, res) => {
  res.sendFile(path.join(__dirname, 'upsc.html'));
});

app.get('/mpsc', (req, res) => {
  res.sendFile(path.join(__dirname, 'mpsc.html'));
});

app.get('/ssc', (req, res) => {
  res.sendFile(path.join(__dirname, 'ssc.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    const db = require('./config/database');
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    
    // Setup production database if needed
    if (process.env.NODE_ENV === 'production') {
      const setupProduction = require('./scripts/setup-production');
      await setupProduction();
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('ExamPrep Hub API is ready!');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
