const db = require('../config/sqlite-database');

async function updatePapersSchema() {
  try {
    console.log('Updating papers table schema...');
    
    // Add file_size column if it doesn't exist
    try {
      await db.query('ALTER TABLE papers ADD COLUMN file_size INTEGER DEFAULT 0');
      console.log('✅ Added file_size column');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ file_size column already exists');
      } else {
        throw error;
      }
    }
    
    // Add is_active column if it doesn't exist
    try {
      await db.query('ALTER TABLE papers ADD COLUMN is_active BOOLEAN DEFAULT 1');
      console.log('✅ Added is_active column');
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ is_active column already exists');
      } else {
        throw error;
      }
    }
    
    // Update existing papers to have is_active = 1
    await db.query('UPDATE papers SET is_active = 1 WHERE is_active IS NULL');
    console.log('✅ Updated existing papers to be active');
    
    console.log('✅ Papers table schema updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating papers schema:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  updatePapersSchema();
}

module.exports = { updatePapersSchema };


