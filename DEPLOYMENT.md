# ExamPrep Hub - Deployment Guide

## Free Hosting Options

### 1. Render (Recommended)

**Steps to deploy on Render:**

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/examprep-hub.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: examprep-hub
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables:**
   - `NODE_ENV`: production
   - `DATABASE_URL`: (will be provided by Render PostgreSQL)
   - `JWT_SECRET`: (generate a random string)
   - `CORS_ORIGIN`: https://your-app-name.onrender.com

4. **Add PostgreSQL Database:**
   - Go to "New +" → "PostgreSQL"
   - Choose Free plan
   - Connect to your web service

### 2. Railway

**Steps to deploy on Railway:**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   railway init
   railway up
   ```

3. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

### 3. Vercel (For Frontend + API Routes)

**Steps to deploy on Vercel:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables in Vercel Dashboard**

## Environment Variables

Create a `.env` file with these variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-domain.com
```

## Database Setup

The application automatically sets up the database schema on first run in production.

## File Uploads

For production, consider using cloud storage services:
- AWS S3
- Cloudinary
- Firebase Storage

## Custom Domain

Most hosting platforms allow you to add a custom domain:
- Render: Dashboard → Settings → Custom Domains
- Railway: Project → Settings → Domains
- Vercel: Project → Settings → Domains

## Monitoring

- **Render**: Built-in monitoring and logs
- **Railway**: Built-in metrics and logs
- **Vercel**: Analytics and monitoring

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Render | 750 hours/month | $7/month |
| Railway | $5 credit/month | $5/month |
| Vercel | Unlimited static | $20/month |
| Netlify | 100GB bandwidth | $19/month |

## Troubleshooting

### Common Issues:

1. **Database Connection Failed:**
   - Check DATABASE_URL environment variable
   - Ensure database service is running

2. **Build Failed:**
   - Check package.json scripts
   - Verify all dependencies are listed

3. **File Upload Issues:**
   - Check file size limits
   - Verify upload directory permissions

4. **CORS Errors:**
   - Update CORS_ORIGIN environment variable
   - Check frontend URL matches

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally first





