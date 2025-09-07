# ExamPrep Hub - Database Integration

A comprehensive exam preparation platform with PostgreSQL database integration for UPSC, MPSC, and SSC examinations.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Exam Management**: Support for UPSC, MPSC, and SSC exams
- **Video Lectures**: YouTube integration with progress tracking
- **Previous Papers**: PDF downloads with download tracking
- **Exam Schedules**: Calendar integration with upcoming events
- **User Progress**: Track watched videos and downloaded papers
- **Bookmarks**: Save favorite videos and papers
- **Responsive Design**: Mobile-friendly interface

## Database Schema

### Tables
- `users` - User accounts and profiles
- `exams` - Exam categories (UPSC, MPSC, SSC)
- `videos` - Video lectures with metadata
- `papers` - Previous year question papers
- `schedules` - Exam dates and notifications
- `user_progress` - Track user activity
- `bookmarks` - User bookmarks

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE examprep_hub;
```

2. Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=examprep_hub
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

3. Setup database schema and seed data:
```bash
npm run db:setup
npm run db:seed
```

### 3. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `GET /api/exams/code/:code` - Get exam by code
- `GET /api/exams/:id/stats` - Get exam statistics

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `GET /api/videos/exam/:code` - Get videos by exam
- `GET /api/videos/search/:query` - Search videos
- `GET /api/videos/categories/list` - Get video categories

### Papers
- `GET /api/papers` - Get all papers
- `GET /api/papers/:id` - Get paper by ID
- `GET /api/papers/exam/:code` - Get papers by exam
- `POST /api/papers/:id/download` - Record paper download
- `GET /api/papers/search/:query` - Search papers

### Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get schedule by ID
- `GET /api/schedules/exam/:code` - Get schedules by exam
- `GET /api/schedules/upcoming/list` - Get upcoming schedules
- `GET /api/schedules/calendar/:year/:month` - Get calendar data

### User Management
- `GET /api/users/progress` - Get user progress
- `GET /api/users/bookmarks` - Get user bookmarks
- `POST /api/users/bookmarks` - Add bookmark
- `DELETE /api/users/bookmarks/:id` - Remove bookmark
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/dashboard` - Get dashboard data

## Demo Account
- Email: `demo@example.com`
- Password: `password`

## File Structure
```
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── exams.js             # Exam routes
│   ├── videos.js            # Video routes
│   ├── papers.js            # Paper routes
│   ├── schedules.js         # Schedule routes
│   └── users.js             # User routes
├── scripts/
│   ├── schema.sql           # Database schema
│   ├── setup-database.js    # Database setup script
│   └── seed-database.js     # Database seeding script
├── api.js                   # Frontend API utility
├── server.js                # Express server
├── package.json             # Dependencies
└── README.md                # This file
```

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - see LICENSE file for details


