const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Hash password for demo user
    const hashedPassword = await bcrypt.hash('password', 10);
    
    // Insert exams
    const examQueries = [
      {
        name: 'UPSC Civil Services',
        code: 'UPSC',
        description: 'Union Public Service Commission - Civil Services Examination',
        exam_type: 'civil_services'
      },
      {
        name: 'MPSC State Service',
        code: 'MPSC',
        description: 'Maharashtra Public Service Commission',
        exam_type: 'state_services'
      },
      {
        name: 'SSC Combined Graduate Level',
        code: 'SSC',
        description: 'Staff Selection Commission - Combined Graduate Level',
        exam_type: 'combined_graduate'
      }
    ];

    for (const exam of examQueries) {
      await pool.query(
        'INSERT INTO exams (name, code, description, exam_type) VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING',
        [exam.name, exam.code, exam.description, exam.exam_type]
      );
    }

    // Insert demo user
    await pool.query(
      'INSERT INTO users (full_name, email, phone, exam_interest, password_hash) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      ['Demo User', 'demo@example.com', '9876543210', 'upsc', hashedPassword]
    );

    // Get exam IDs
    const examResults = await pool.query('SELECT id, code FROM exams');
    const examIds = {};
    examResults.rows.forEach(exam => {
      examIds[exam.code] = exam.id;
    });

    // Insert videos
    const videoQueries = [
      {
        title: 'UPSC Prelims Strategy 2024',
        description: 'Complete strategy for UPSC Civil Services Prelims preparation',
        youtube_url: 'https://www.youtube.com/embed/FvDLtR5kHMM?si=6WRnnLVXiQUpQJmV',
        duration: '45 min',
        views: 125000,
        exam_id: examIds.UPSC,
        category: 'strategy'
      },
      {
        title: 'Indian Polity for UPSC',
        description: 'Comprehensive coverage of Indian Constitution and Polity',
        youtube_url: 'https://www.youtube.com/embed/rSZ69uc6qjw?si=7v2KoLa1BgBcwK0y',
        duration: '1h 20min',
        views: 89000,
        exam_id: examIds.UPSC,
        category: 'polity'
      },
      {
        title: 'SSC CGL Math Shortcuts',
        description: 'Quick math tricks and shortcuts for SSC CGL quantitative aptitude',
        youtube_url: 'https://www.youtube.com/embed/5alj8VYclg8?si=IVH5m9wbKIbzpGxs',
        duration: '35 min',
        views: 234000,
        exam_id: examIds.SSC,
        category: 'mathematics'
      },
      {
        title: 'English Grammar for SSC',
        description: 'Complete English grammar course for SSC examinations',
        youtube_url: 'https://www.youtube.com/embed/OBGS4We9Ybw?si=8LimTUKixYtEQC6u',
        duration: '55 min',
        views: 156000,
        exam_id: examIds.SSC,
        category: 'english'
      },
      {
        title: 'Maharashtra History for MPSC',
        description: 'Complete Maharashtra history and culture for MPSC preparation',
        youtube_url: 'https://www.youtube.com/embed/kWfroJTcpsw?si=ykqSJP3iG41lIMYh',
        duration: '1h 15min',
        views: 67000,
        exam_id: examIds.MPSC,
        category: 'history'
      },
      {
        title: 'MPSC Current Affairs',
        description: 'Monthly current affairs compilation for MPSC examinations',
        youtube_url: 'https://www.youtube.com/embed/FBt4h1bAFCk?si=480Dkpb9UDK41jhR',
        duration: '40 min',
        views: 43000,
        exam_id: examIds.MPSC,
        category: 'current_affairs'
      }
    ];

    for (const video of videoQueries) {
      await pool.query(
        'INSERT INTO videos (title, description, youtube_url, duration, views, exam_id, category) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [video.title, video.description, video.youtube_url, video.duration, video.views, video.exam_id, video.category]
      );
    }

    // Insert papers
    const paperQueries = [
      {
        title: 'UPSC Prelims 2023',
        description: 'General Studies Paper I & II',
        year: 2023,
        exam_id: examIds.UPSC,
        paper_type: 'prelims'
      },
      {
        title: 'SSC CGL 2023',
        description: 'Tier 1 All Shifts',
        year: 2023,
        exam_id: examIds.SSC,
        paper_type: 'tier1'
      },
      {
        title: 'MPSC State Service 2023',
        description: 'Preliminary Examination',
        year: 2023,
        exam_id: examIds.MPSC,
        paper_type: 'prelims'
      }
    ];

    for (const paper of paperQueries) {
      await pool.query(
        'INSERT INTO papers (title, description, year, exam_id, paper_type) VALUES ($1, $2, $3, $4, $5)',
        [paper.title, paper.description, paper.year, paper.exam_id, paper.paper_type]
      );
    }

    // Insert schedules
    const scheduleQueries = [
      {
        exam_id: examIds.UPSC,
        event_name: 'UPSC 2024 Notification',
        event_type: 'notification',
        start_date: '2024-02-14',
        end_date: '2024-03-05',
        description: 'UPSC Civil Services Examination 2024 notification release'
      },
      {
        exam_id: examIds.SSC,
        event_name: 'SSC CGL 2024 Application',
        event_type: 'application',
        start_date: '2024-06-11',
        end_date: '2024-07-10',
        description: 'SSC CGL 2024 application form submission'
      },
      {
        exam_id: examIds.MPSC,
        event_name: 'MPSC 2024 Prelims',
        event_type: 'exam',
        start_date: '2024-04-14',
        end_date: '2024-04-14',
        description: 'MPSC State Service Preliminary Examination 2024'
      }
    ];

    for (const schedule of scheduleQueries) {
      await pool.query(
        'INSERT INTO schedules (exam_id, event_name, event_type, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [schedule.exam_id, schedule.event_name, schedule.event_type, schedule.start_date, schedule.end_date, schedule.description]
      );
    }

    console.log('Database seeded successfully!');
    console.log('Demo user created: demo@example.com / password');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();

