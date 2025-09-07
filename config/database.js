// Universal database configuration that supports both SQLite and PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';
const usePostgreSQL = process.env.DB_TYPE === 'postgresql' || process.env.DATABASE_URL;

let db;

if (usePostgreSQL) {
  // Use PostgreSQL for production
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  db = {
    query: async (text, params = []) => {
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
    },
    
    testConnection: async () => {
      try {
        await pool.query('SELECT NOW()');
        console.log('Connected to PostgreSQL database');
        return true;
      } catch (error) {
        console.error('Database connection failed:', error);
        return false;
      }
    },
    
    close: async () => {
      await pool.end();
    }
  };
} else {
  // Use SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  // Enable foreign keys
  sqliteDb.run('PRAGMA foreign_keys = ON');

  db = {
    query: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        if (sql.trim().toLowerCase().startsWith('select')) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve({ rows });
            }
          });
        } else {
          sqliteDb.run(sql, params, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ 
                rows: [{ id: this.lastID }], 
                rowCount: this.changes 
              });
            }
          });
        }
      });
    },
    
    testConnection: () => {
      return new Promise((resolve) => {
        sqliteDb.get('SELECT 1', (err) => {
          if (err) {
            console.error('SQLite connection test failed:', err);
            resolve(false);
          } else {
            console.log('SQLite connection test successful');
            resolve(true);
          }
        });
      });
    },
    
    close: () => {
      return new Promise((resolve, reject) => {
        sqliteDb.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  };
}

module.exports = db;