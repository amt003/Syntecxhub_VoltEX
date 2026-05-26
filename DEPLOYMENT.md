# VoltEX Deployment Guide

This guide provides step-by-step instructions for deploying VoltEX to production.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Vercel (Frontend)](#vercel-frontend)
4. [Heroku (Backend)](#heroku-backend)
5. [Railway (Backend)](#railway-backend)
6. [AWS (Full Stack)](#aws-full-stack)

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Git

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/VoltEX.git
cd VoltEX
```

2. Install dependencies for all packages:

```bash
npm run install-all
```

3. Configure environment variables:

Backend (.env):

```bash
cd backend
cp .env.example .env
```

Edit backend/.env with your MongoDB connection string and JWT secret.

Frontend (.env):

```bash
cd frontend
cp .env.example .env
```

4. Seed the database:

```bash
cd backend
node src/scripts/runSeed.js
```

5. Start development servers:

```bash
# From root directory
npm run dev
```

This will start:

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Docker Deployment

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Local Docker Deployment

1. Navigate to project root:

```bash
cd VoltEX
```

2. Build and start containers:

```bash
docker-compose up -d
```

3. Access the application:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

4. View logs:

```bash
docker-compose logs -f
```

5. Stop containers:

```bash
docker-compose down
```

## Vercel (Frontend)

### Prerequisites

- Vercel account (free)
- GitHub account
- Git

### Deployment Steps

1. Push frontend to GitHub:

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/voltex-frontend.git
git push -u origin main
```

2. Visit [vercel.com](https://vercel.com) and sign up/login

3. Click "New Project" and import your GitHub repository

4. Configure:
   - Framework: Create React App
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `build`

5. Add Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

6. Click "Deploy"

7. Your frontend is now live! Get the Vercel URL and use it as `REACT_APP_API_URL` in production.

## Heroku (Backend)

### Prerequisites

- Heroku account (free tier available)
- Heroku CLI installed

### Deployment Steps

1. Login to Heroku:

```bash
heroku login
```

2. Create a new app:

```bash
heroku create your-app-name
```

3. Push backend to GitHub (same as Vercel guide)

4. Connect to Heroku from GitHub:
   - Go to Heroku Dashboard
   - Select your app
   - Go to "Deploy" tab
   - Connect to GitHub
   - Select repository
   - Enable automatic deploys

5. Add MongoDB add-on:

```bash
heroku addons:create mongolab:sandbox
```

6. Set environment variables:

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-key
heroku config:set JWT_EXPIRE=7d
heroku config:set RAZORPAY_KEY_ID=your_razorpay_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

7. Deploy:

```bash
git push heroku main
```

8. View logs:

```bash
heroku logs --tail
```

9. Your backend is live at `https://your-app-name.herokuapp.com`

## Railway (Backend)

### Prerequisites

- Railway account (free tier available)
- GitHub account

### Deployment Steps

1. Go to [railway.app](https://railway.app)

2. Click "Start a New Project"

3. Select "Deploy from GitHub"

4. Connect your GitHub account and select your repository

5. Select the backend directory:
   - Root Directory: `backend`

6. Add MongoDB:
   - Click "Add"
   - Search "MongoDB"
   - Select "MongoDB"
   - Click "Create"

7. Railway will automatically set `MONGODB_URI`

8. Add other environment variables:
   - Go to project settings
   - Add variables:
     - `NODE_ENV`: production
     - `JWT_SECRET`: your-secret-key
     - `JWT_EXPIRE`: 7d
     - `RAZORPAY_KEY_ID`: your_razorpay_key_id
     - `RAZORPAY_KEY_SECRET`: your_razorpay_key_secret

9. Deploy:
   - Push to main branch
   - Railway auto-deploys

10. Get your backend URL from Railway dashboard

## AWS (Full Stack)

### Prerequisites

- AWS account
- AWS CLI installed
- Docker installed

### Backend Deployment (EC2)

1. Launch EC2 instance:
   - Use Ubuntu 22.04 LTS
   - Allow HTTP (80) and HTTPS (443) ports

2. SSH into instance:

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

3. Install Docker:

```bash
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker ubuntu
```

4. Clone repository:

```bash
git clone https://github.com/yourusername/VoltEX.git
cd VoltEX
```

5. Create .env file:

```bash
cat > backend/.env << EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EOF
```

6. Build and run with Docker:

```bash
docker build -t voltex-backend ./backend
docker run -d -p 5000:5000 --env-file backend/.env voltex-backend
```

7. Set up reverse proxy with Nginx:

```bash
sudo apt-get install nginx -y
```

8. Configure Nginx:

```bash
sudo tee /etc/nginx/sites-available/default > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
sudo systemctl restart nginx
```

### Frontend Deployment (S3 + CloudFront)

1. Build frontend:

```bash
cd frontend
npm run build
```

2. Create S3 bucket:

```bash
aws s3 mb s3://voltex-frontend-bucket
```

3. Upload build files:

```bash
aws s3 sync build/ s3://voltex-frontend-bucket --delete
```

4. Create CloudFront distribution pointing to S3 bucket

5. Update DNS to point to CloudFront distribution

## Production Checklist

- [ ] Environment variables properly set
- [ ] MongoDB Atlas cluster created and secured
- [ ] JWT secret is strong and random
- [ ] CORS is configured correctly
- [ ] HTTPS/SSL certificates installed
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] Monitoring and alerts configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] CDN configured
- [ ] Caching strategies implemented
- [ ] API documentation updated
- [ ] Testing completed
- [ ] Deployment tested

## Monitoring & Maintenance

### Logs & Monitoring

- Set up error logging (Sentry, LogRocket)
- Monitor API performance
- Set up uptime monitoring
- Configure alerts for errors

### Regular Tasks

- Check database backups
- Update dependencies monthly
- Review security logs
- Monitor resource usage
- Check error rates

### Scaling

- Use database indexing
- Implement caching (Redis)
- Use CDN for static assets
- Load balance across multiple instances
- Auto-scaling policies

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker logs <container-id>

# Restart container
docker restart <container-id>

# Check port availability
lsof -i :5000
```

### Database Connection Issues

- Verify connection string
- Check IP whitelist (MongoDB Atlas)
- Ensure credentials are correct
- Test connection locally first

### Frontend Not Connecting to Backend

- Check API URL in frontend .env
- Verify CORS settings on backend
- Check network tab in browser DevTools
- Ensure backend is running

## Support

For issues or questions:

1. Check logs
2. Review documentation
3. Create GitHub issue
4. Contact support team

---

Happy deploying! 🚀
