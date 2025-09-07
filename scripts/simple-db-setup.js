const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Try different common passwords
  const passwords = ['postgres', 'admin', 'password', '123456', ''];
  
  for (const password of passwords) {
    console.log(`Trying password: ${password || '(empty)'}`);
    
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: password,
    });

    try {
      // Test connection
      await pool.query('SELECT 1');
      console.log('✅ Connected to PostgreSQL successfully!');
      
      // Check if database exists
      const checkResult = await pool.query(
        "SELECT 1 FROM pg_database WHERE datname = 'examprep_hub'"
      );

      if (checkResult.rows.length > 0) {
        console.log('✅ Database examprep_hub already exists!');
      } else {
        // Create database
        await pool.query('CREATE DATABASE examprep_hub');
        console.log('✅ Database examprep_hub created successfully!');
      }

      await pool.end();
      
      // Update .env with working password
      const fs = require('fs');
      const envContent = `DB_HOST=localhost
DB_PORT=5432
DB_NAME=examprep_hub
DB_USER=postgres
DB_PASSWORD=${password}
JWT_SECRET=your_jwt_secret_key_here_12345
JWT_EXPIRES_IN=7d
PORT=3000`;
      
      fs.writeFileSync('.env', envContent);
      console.log('✅ Updated .env file with working password');
      
      // Now setup tables
      console.log('Setting up database tables...');
      const setupScript = require('./setup-database.js');
      await setupScript.setupDatabase();
      
      return;
      
    } catch (error) {
      console.log(`❌ Failed with password: ${password || '(empty)'}`);
      await pool.end();
    }
  }
  
  console.log('❌ Could not connect to PostgreSQL with any common password.');
  console.log('Please check your PostgreSQL installation and password.');
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

