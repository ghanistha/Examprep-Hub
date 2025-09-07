const db = require('../config/sqlite-database');
const fs = require('fs');
const path = require('path');

async function addSamplePDFs() {
  try {
    console.log('Adding sample PDF files to database...');
    
    // Create sample PDF files (empty files for demo)
    const sampleFiles = [
      {
        filename: 'upsc_prelims_2023_paper1.pdf',
        title: 'UPSC Prelims 2023 Paper 1',
        description: 'General Studies Paper 1 - UPSC Civil Services Preliminary Examination 2023',
        year: 2023,
        paper_type: 'prelims',
        exam_id: 1,
        file_size: 1024000 // 1MB
      },
      {
        filename: 'upsc_prelims_2023_paper2.pdf',
        title: 'UPSC Prelims 2023 Paper 2',
        description: 'CSAT Paper 2 - UPSC Civil Services Preliminary Examination 2023',
        year: 2023,
        paper_type: 'prelims',
        exam_id: 1,
        file_size: 856000 // 856KB
      },
      {
        filename: 'mpsc_mains_2023_gs.pdf',
        title: 'MPSC Mains 2023 General Studies',
        description: 'General Studies Paper - MPSC State Services Mains 2023',
        year: 2023,
        paper_type: 'mains',
        exam_id: 2,
        file_size: 2048000 // 2MB
      },
      {
        filename: 'ssc_cgl_2023_tier1.pdf',
        title: 'SSC CGL 2023 Tier 1',
        description: 'Combined Graduate Level Tier 1 Examination 2023',
        year: 2023,
        paper_type: 'prelims',
        exam_id: 3,
        file_size: 1536000 // 1.5MB
      }
    ];
    
    for (const file of sampleFiles) {
      // Create empty PDF file
      const filePath = path.join(__dirname, '..', 'uploads', 'papers', file.filename);
      fs.writeFileSync(filePath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Sample PDF Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF');
      
      // Insert into database
      await db.query(
        `INSERT OR REPLACE INTO papers (title, description, year, paper_type, file_path, file_size, exam_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [
          file.title,
          file.description,
          file.year,
          file.paper_type,
          `/uploads/papers/${file.filename}`,
          file.file_size,
          file.exam_id
        ]
      );
      
      console.log(`✅ Added ${file.filename}`);
    }
    
    console.log('✅ Sample PDF files added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample PDFs:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  addSamplePDFs();
}

module.exports = { addSamplePDFs };


