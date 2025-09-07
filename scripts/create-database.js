const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to default postgres database first
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('Connecting to PostgreSQL...');
    
    // Check if database exists
    const checkResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'examprep_hub']
    );

    if (checkResult.rows.length > 0) {
      console.log('Database already exists!');
    } else {
      // Create database
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'examprep_hub'}`);
      console.log('Database created successfully!');
    }

    await adminPool.end();
    
    // Now connect to the new database and create tables
    console.log('Setting up database schema...');
    const setupScript = require('./setup-database.js');
    await setupScript.setupDatabase();
    
  } catch (error) {
    console.error('Error creating database:', error.message);
    console.log('\nPlease check:');
    console.log('1. PostgreSQL is running');
    console.log('2. Your password in .env file is correct');
    console.log('3. PostgreSQL user has permission to create databases');
  }
}

if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };

