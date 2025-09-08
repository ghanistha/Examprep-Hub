const { Pool } = require('pg');

// Production database configuration for PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Database query function compatible with SQLite interface
const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  query,
  testConnection,
  pool
};


