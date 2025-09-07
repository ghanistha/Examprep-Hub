const db = require('../config/sqlite-database');
const bcrypt = require('bcryptjs');

async function seedSQLiteDatabase() {
  try {
    console.log('Seeding SQLite database...');
    
    // Insert sample exams
    const exams = [
      {
        name: 'UPSC Civil Services Examination',
        code: 'UPSC_CSE',
        description: 'Union Public Service Commission Civil Services Examination',
        exam_type: 'combined'
      },
      {
        name: 'MPSC State Services',
        code: 'MPSC_SS',
        description: 'Maharashtra Public Service Commission State Services',
        exam_type: 'combined'
      },
      {
        name: 'SSC Combined Graduate Level',
        code: 'SSC_CGL',
        description: 'Staff Selection Commission Combined Graduate Level',
        exam_type: 'combined'
      }
    ];

    for (const exam of exams) {
      await db.query(
        'INSERT OR IGNORE INTO exams (name, code, description, exam_type) VALUES (?, ?, ?, ?)',
        [exam.name, exam.code, exam.description, exam.exam_type]
      );
    }
    console.log('✅ Sample exams inserted');

    // Insert sample videos
    const videos = [
      {
        title: 'UPSC Prelims Strategy',
        description: 'Complete strategy for UPSC Prelims preparation',
        url: 'https://example.com/upsc-prelims-strategy',
        duration: 45,
        category: 'Strategy',
        views: 1500,
        exam_id: 1
      },
      {
        title: 'MPSC Geography',
        description: 'Maharashtra Geography for MPSC',
        url: 'https://example.com/mpsc-geography',
        duration: 60,
        category: 'Geography',
        views: 800,
        exam_id: 2
      },
      {
        title: 'SSC Quantitative Aptitude',
        description: 'Maths tricks for SSC CGL',
        url: 'https://example.com/ssc-maths',
        duration: 30,
        category: 'Mathematics',
        views: 2000,
        exam_id: 3
      }
    ];

    for (const video of videos) {
      await db.query(
        'INSERT OR IGNORE INTO videos (title, description, url, duration, category, views, exam_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [video.title, video.description, video.url, video.duration, video.category, video.views, video.exam_id]
      );
    }
    console.log('✅ Sample videos inserted');

    // Insert sample papers
    const papers = [
      {
        title: 'UPSC Prelims 2023 Paper 1',
        year: 2023,
        paper_type: 'prelims',
        file_path: '/uploads/upsc_prelims_2023_paper1.pdf',
        download_count: 5000,
        exam_id: 1
      },
      {
        title: 'MPSC Mains 2023 General Studies',
        year: 2023,
        paper_type: 'mains',
        file_path: '/uploads/mpsc_mains_2023_gs.pdf',
        download_count: 2000,
        exam_id: 2
      },
      {
        title: 'SSC CGL 2023 Tier 1',
        year: 2023,
        paper_type: 'prelims',
        file_path: '/uploads/ssc_cgl_2023_tier1.pdf',
        download_count: 8000,
        exam_id: 3
      }
    ];

    for (const paper of papers) {
      await db.query(
        'INSERT OR IGNORE INTO papers (title, year, paper_type, file_path, download_count, exam_id) VALUES (?, ?, ?, ?, ?, ?)',
        [paper.title, paper.year, paper.paper_type, paper.file_path, paper.download_count, paper.exam_id]
      );
    }
    console.log('✅ Sample papers inserted');

    // Insert sample schedules
    const schedules = [
      {
        event_name: 'UPSC Prelims 2024',
        event_type: 'exam',
        start_date: '2024-06-16',
        end_date: '2024-06-16',
        description: 'UPSC Civil Services Prelims Examination 2024',
        exam_id: 1
      },
      {
        event_name: 'MPSC Prelims 2024',
        event_type: 'exam',
        start_date: '2024-07-14',
        end_date: '2024-07-14',
        description: 'MPSC State Services Prelims 2024',
        exam_id: 2
      },
      {
        event_name: 'SSC CGL 2024 Tier 1',
        event_type: 'exam',
        start_date: '2024-08-15',
        end_date: '2024-08-15',
        description: 'SSC CGL Tier 1 Examination 2024',
        exam_id: 3
      }
    ];

    for (const schedule of schedules) {
      await db.query(
        'INSERT OR IGNORE INTO schedules (event_name, event_type, start_date, end_date, description, exam_id) VALUES (?, ?, ?, ?, ?, ?)',
        [schedule.event_name, schedule.event_type, schedule.start_date, schedule.end_date, schedule.description, schedule.exam_id]
      );
    }
    console.log('✅ Sample schedules inserted');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await db.query(
      'INSERT OR IGNORE INTO users (full_name, email, phone, exam_interest, password_hash) VALUES (?, ?, ?, ?, ?)',
      ['Demo User', 'demo@example.com', '9876543210', 'upsc', hashedPassword]
    );
    console.log('✅ Demo user created (email: demo@example.com, password: demo123)');

    console.log('✅ SQLite database seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding SQLite database:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  seedSQLiteDatabase();
}

module.exports = { seedSQLiteDatabase };

