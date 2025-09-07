const db = require('../config/sqlite-database');
const fs = require('fs');
const path = require('path');

async function setupSQLiteDatabase() {
  try {
    console.log('Setting up SQLite database...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'sqlite-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }
    
    console.log('✅ SQLite database schema created successfully!');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created!');
    }
    
    console.log('✅ SQLite database setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up SQLite database:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  setupSQLiteDatabase();
}

module.exports = { setupSQLiteDatabase };

