const db = require('../config/sqlite-database');

async function fixPapersData() {
  try {
    console.log('Fixing papers data...');
    
    // Update file paths to include 'papers' directory
    await db.query(`
      UPDATE papers 
      SET file_path = '/uploads/papers/' || SUBSTR(file_path, 10)
      WHERE file_path LIKE '/uploads/%' AND file_path NOT LIKE '/uploads/papers/%'
    `);
    console.log('✅ Updated file paths');
    
    // Add descriptions to papers
    const papers = [
      {
        id: 1,
        description: 'General Studies Paper 1 - UPSC Civil Services Preliminary Examination 2023'
      },
      {
        id: 2,
        description: 'General Studies Paper - MPSC State Services Mains 2023'
      },
      {
        id: 3,
        description: 'Combined Graduate Level Tier 1 Examination 2023'
      },
      {
        id: 4,
        description: 'General Studies Paper 1 - UPSC Civil Services Preliminary Examination 2023'
      },
      {
        id: 5,
        description: 'CSAT Paper 2 - UPSC Civil Services Preliminary Examination 2023'
      },
      {
        id: 6,
        description: 'General Studies Paper - MPSC State Services Mains 2023'
      },
      {
        id: 7,
        description: 'Combined Graduate Level Tier 1 Examination 2023'
      }
    ];
    
    for (const paper of papers) {
      await db.query(
        'UPDATE papers SET description = ? WHERE id = ?',
        [paper.description, paper.id]
      );
    }
    console.log('✅ Added descriptions to papers');
    
    // Update file sizes (set realistic sizes)
    const fileSizes = [
      { id: 1, size: 1024000 }, // 1MB
      { id: 2, size: 2048000 }, // 2MB
      { id: 3, size: 1536000 }, // 1.5MB
      { id: 4, size: 1024000 }, // 1MB
      { id: 5, size: 856000 },  // 856KB
      { id: 6, size: 2048000 }, // 2MB
      { id: 7, size: 1536000 }  // 1.5MB
    ];
    
    for (const file of fileSizes) {
      await db.query(
        'UPDATE papers SET file_size = ? WHERE id = ?',
        [file.size, file.id]
      );
    }
    console.log('✅ Updated file sizes');
    
    // Ensure all papers are active
    await db.query('UPDATE papers SET is_active = 1');
    console.log('✅ Ensured all papers are active');
    
    console.log('✅ Papers data fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing papers data:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  fixPapersData();
}

module.exports = { fixPapersData };

