# Production Deployment Guide

This guide explains how to deploy the Qwik + Payload CMS application to production.

## Overview

The application consists of two separate deployments:
1. **Frontend**: Qwik application (static/hybrid rendering)
2. **Backend**: Payload CMS with PostgreSQL database

## Frontend Deployment (Qwik)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Netlify

**Netlify:**
```bash
npm run build
# Connect your repository to Netlify
# Set build command: npm run build
# Set publish directory: dist
```

**Vercel:**
```bash
npm run build
# Connect your repository to Vercel
# Vercel auto-detects Qwik and configures it
```

**AWS S3 + CloudFront:**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Environment Variables (Frontend)

Set these environment variables in your deployment platform:

```env
# Required - Point to your deployed Payload CMS instance
VITE_GRAPHQL_ENDPOINT=https://your-api-domain.com/graphql
VITE_PAYLOAD_API_URL=https://your-api-domain.com
VITE_API_BASE_URL=https://your-api-domain.com/api

# Zitadel Configuration
VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
VITE_ZITADEL_CLIENT_ID=your-client-id
VITE_ZITADEL_REDIRECT_URI=https://your-frontend-domain.com/auth/callback

# Matrix Chat Configuration
VITE_MATRIX_HOMESERVER_URL=https://your-matrix-server.com

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_CHAT=true
```

## Backend Deployment (Payload CMS)

### Prerequisites

- PostgreSQL database (cloud or self-hosted)
- Node.js 18+ runtime

### Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE payload_prod;
   ```

2. Get the connection string:
   ```
   postgresql://user:password@host:5432/payload_prod
   ```

### Deploy to Heroku

```bash
cd payload-cms

# Login to Heroku
heroku login

# Create app
heroku create your-api-name

# Set environment variables
heroku config:set PAYLOAD_SECRET="your-secure-key"
heroku config:set DATABASE_URI="postgresql://user:password@host:5432/payload_prod"
heroku config:set ZITADEL_API_URL="https://your-zitadel.com"
heroku config:set ZITADEL_CLIENT_ID="your-client-id"
heroku config:set ZITADEL_CLIENT_SECRET="your-client-secret"
heroku config:set CORS_ORIGIN="https://your-frontend-domain.com"

# Deploy
git push heroku main
```

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway auto-deploys on push to main

### Deploy to AWS EC2

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd your-repo/payload-cms

# Install dependencies
npm install

# Set environment variables
export PAYLOAD_SECRET="your-secure-key"
export DATABASE_URI="postgresql://user:password@host:5432/payload_prod"
# ... other variables

# Build and run
npm run build
npm start
```

### Environment Variables (Backend)

```env
# Security
PAYLOAD_SECRET=your-very-secure-key-min-32-chars

# Database
DATABASE_URI=postgresql://user:password@host:5432/payload_prod

# Server
PORT=3000
ADMIN_URL=https://your-api-domain.com/admin

# Zitadel Integration
ZITADEL_API_URL=https://your-zitadel.com
ZITADEL_CLIENT_ID=your-client-id
ZITADEL_CLIENT_SECRET=your-client-secret

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Environment
NODE_ENV=production
```

## Common Issues & Solutions

### 1. CORS Errors

**Problem**: Frontend can't reach backend API
**Solution**: 
- Ensure `CORS_ORIGIN` environment variable is set correctly
- Include the full domain: `https://your-domain.com` (not `https://your-domain.com/`)
- Restart the backend after changing CORS settings

### 2. Database Connection Fails

**Problem**: "Cannot connect to PostgreSQL"
**Solution**:
- Verify `DATABASE_URI` is correct
- Check database credentials
- Ensure database server is accessible from your app server
- Check firewall rules allow connections

### 3. SSL/TLS Certificate Errors

**Problem**: "Certificate not trusted"
**Solution**:
- Use a proper HTTPS certificate (Let's Encrypt is free)
- Enable HTTPS on both frontend and backend
- Use `https://` URLs everywhere

### 4. GraphQL Endpoint Returns 404

**Problem**: "GraphQL endpoint not found"
**Solution**:
- Verify the GraphQL plugin is installed in Payload
- Check the endpoint URL is correct: `/graphql`
- Ensure Payload server is running

### 5. Authentication Redirects Not Working

**Problem**: Zitadel redirects fail after login
**Solution**:
- Verify `VITE_ZITADEL_REDIRECT_URI` matches exactly in Zitadel config
- Use full HTTPS URLs
- Check both frontend and backend configurations match

## Domain Setup

### DNS Configuration

Point your domain to your hosting provider:

```
Frontend:   frontend.yourdomain.com -> Netlify / Vercel / Your provider
Backend:    api.yourdomain.com     -> Heroku / Railway / AWS / Your provider
```

### SSL/TLS Certificates

Most hosting platforms provide free SSL:
- **Netlify**: Automatic
- **Vercel**: Automatic
- **Railway**: Automatic
- **Heroku**: Free or paid certificates
- **Let's Encrypt**: Free (setup on server)

## Monitoring & Logs

### View Logs

**Heroku:**
```bash
heroku logs --tail -a your-app-name
```

**AWS CloudWatch:**
Access through AWS Console -> CloudWatch -> Logs

### Error Tracking

Set up error monitoring:
- **Sentry**: Add to both frontend and backend
- **New Relic**: Monitor performance
- **LogRocket**: Frontend session replay

## Scaling

### Database Scaling

For higher traffic:
- Add read replicas
- Use connection pooling (PgBouncer)
- Upgrade database tier

### Backend Scaling

- Use auto-scaling (multiple instances behind load balancer)
- Enable caching with Redis
- Optimize GraphQL queries

### Frontend Scaling

- Use CDN for static assets (CloudFront, Cloudflare)
- Enable gzip compression
- Optimize images and code splitting (Qwik does this)

## Backup & Recovery

### Database Backups

```bash
# PostgreSQL backup
pg_dump postgresql://user:password@host:5432/payload_prod > backup.sql

# AWS RDS Automated Backups
# Enable in RDS console (default is 7 days)
```

### Restore from Backup

```bash
psql postgresql://user:password@host:5432/payload_prod < backup.sql
```

## Security Checklist

- [ ] All environment variables are set (no defaults in production)
- [ ] Database has strong password
- [ ] PAYLOAD_SECRET is secure (32+ random characters)
- [ ] HTTPS enabled everywhere
- [ ] CORS_ORIGIN is restricted to your frontend domain
- [ ] Zitadel OAuth credentials are secure
- [ ] Regular database backups enabled
- [ ] Error logs don't expose sensitive information
- [ ] Rate limiting enabled on API endpoints
- [ ] Admin panel has strong authentication

## Performance Optimization

### Frontend
- Build time optimization: `npm run build` ✓
- Code splitting: Qwik handles this automatically
- Image optimization: Use next-gen formats
- Cache static assets: CDN with long TTL

### Backend
- Database indexes: Check `ARCHITECTURE.md`
- Query optimization: Use GraphQL field selection
- Connection pooling: For database
- Response caching: Consider Redis for frequently accessed data

## Maintenance

### Regular Tasks

- Monitor error logs daily
- Update dependencies monthly
- Check database size
- Review and backup data
- Update Zitadel/Matrix configurations if needed

### Zero-Downtime Deployments

1. Deploy backend first
2. Ensure new version is compatible with old frontend
3. Deploy frontend

Or use blue-green deployments for critical updates.

## Support

For deployment issues:
1. Check application logs
2. Verify all environment variables
3. Test API connectivity with curl:
   ```bash
   curl -X POST https://api.yourdomain.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "query { Products { docs { id } } }"}'
   ```
4. Check firewall/network rules
5. Contact hosting provider support

---

**Need help?** Review the main `SETUP_GUIDE.md` for detailed configuration instructions.
