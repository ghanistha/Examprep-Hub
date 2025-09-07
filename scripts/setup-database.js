const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('Database schema created successfully!');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Uploads directory created!');
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Only call end() if it exists (for PostgreSQL)
    if (pool.end && typeof pool.end === 'function') {
      await pool.end();
    }
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

