const db = require('../config/sqlite-database');

async function viewDatabase() {
  try {
    console.log('🗄️ ExamPrep Hub Database Contents\n');
    
    // View all tables
    const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Available Tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    console.log('');
    
    // View centers
    console.log('📍 CENTERS TABLE:');
    const centers = await db.query('SELECT id, name, city, state FROM centers');
    if (centers.rows.length > 0) {
      centers.rows.forEach(center => {
        console.log(`  ID: ${center.id} | Name: ${center.name} | City: ${center.city || '-'} | State: ${center.state || '-'}`);
      });
    } else {
      console.log('  No centers found');
    }
    console.log('');

    // View users
    console.log('👥 USERS TABLE:');
    const users = await db.query('SELECT id, full_name, email, exam_interest, created_at FROM users');
    if (users.rows.length > 0) {
      users.rows.forEach(user => {
        console.log(`  ID: ${user.id} | Name: ${user.full_name} | Email: ${user.email} | Exam: ${user.exam_interest}`);
      });
    } else {
      console.log('  No users found');
    }
    console.log('');
    
    // View exams
    console.log('📚 EXAMS TABLE:');
    const exams = await db.query('SELECT id, name, code, exam_type FROM exams');
    if (exams.rows.length > 0) {
      exams.rows.forEach(exam => {
        console.log(`  ID: ${exam.id} | Name: ${exam.name} | Code: ${exam.code} | Type: ${exam.exam_type}`);
      });
    } else {
      console.log('  No exams found');
    }
    console.log('');
    
    // View videos
    console.log('🎥 VIDEOS TABLE:');
    const videos = await db.query('SELECT id, title, category, views, duration FROM videos');
    if (videos.rows.length > 0) {
      videos.rows.forEach(video => {
        console.log(`  ID: ${video.id} | Title: ${video.title} | Category: ${video.category} | Views: ${video.views} | Duration: ${video.duration}min`);
      });
    } else {
      console.log('  No videos found');
    }
    console.log('');
    
    // View papers
    console.log('📄 PAPERS TABLE:');
    const papers = await db.query('SELECT id, title, year, paper_type, download_count FROM papers');
    if (papers.rows.length > 0) {
      papers.rows.forEach(paper => {
        console.log(`  ID: ${paper.id} | Title: ${paper.title} | Year: ${paper.year} | Type: ${paper.paper_type} | Downloads: ${paper.download_count}`);
      });
    } else {
      console.log('  No papers found');
    }
    console.log('');
    
    // View schedules
    console.log('📅 SCHEDULES TABLE:');
    const schedules = await db.query('SELECT id, event_name, event_type, start_date, end_date FROM schedules');
    if (schedules.rows.length > 0) {
      schedules.rows.forEach(schedule => {
        console.log(`  ID: ${schedule.id} | Event: ${schedule.event_name} | Type: ${schedule.event_type} | Date: ${schedule.start_date}`);
      });
    } else {
      console.log('  No schedules found');
    }
    console.log('');
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`  Total Users: ${users.rows.length}`);
    console.log(`  Total Exams: ${exams.rows.length}`);
    console.log(`  Total Videos: ${videos.rows.length}`);
    console.log(`  Total Papers: ${papers.rows.length}`);
    console.log(`  Total Schedules: ${schedules.rows.length}`);
    console.log(`  Total Centers: ${centers.rows.length}`);
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  viewDatabase();
}

module.exports = { viewDatabase };




