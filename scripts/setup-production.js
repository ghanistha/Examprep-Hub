const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function setupProduction() {
  try {
    console.log('Setting up production database...');
    
    // Test database connection
    const connected = await db.testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Read and execute PostgreSQL schema
    const schemaPath = path.join(__dirname, 'postgresql-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await db.query(statement);
            console.log('✓ Executed:', statement.substring(0, 50) + '...');
          } catch (error) {
            // Ignore errors for statements that might already exist
            if (!error.message.includes('already exists') && 
                !error.message.includes('duplicate key')) {
              console.warn('Warning:', error.message);
            }
          }
        }
      }
    }
    
    console.log('✓ Production database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up production database:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupProduction();
}

module.exports = setupProduction;


