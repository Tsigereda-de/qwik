# Qwik + Payload CMS Integration Guide

Complete guide to setting up and running the integrated Qwik frontend + Payload CMS backend system with Zitadel authentication and Matrix chat.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (5 minutes)](#quick-start)
4. [Detailed Setup](#detailed-setup)
5. [Configuration](#configuration)
6. [Running the System](#running-the-system)
7. [Creating Sample Data](#creating-sample-data)
8. [Features Overview](#features-overview)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

---

## System Overview

This is a **fully integrated e-commerce system** with:

- **Frontend**: Qwik + Qwik City (Progressive Web App)
- **Backend**: Payload CMS (GraphQL API)
- **Authentication**: Zitadel (OAuth2/OIDC)
- **Real-time Chat**: Matrix (matrix-js-sdk)
- **Database**: MongoDB (Payload)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                            │
│                                                              │
│  Qwik Frontend (PWA)                                        │
│  ├── Products Page (GraphQL)                               │
│  ├── Authentication (Zitadel OAuth)                        │
│  └── Chat Interface (Matrix)                               │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS
             │
┌────────────▼────────────────────────────────────────────────┐
│              BACKEND SERVERS                                │
│                                                              │
│  Payload CMS (Node.js)                                     │
│  ├── GraphQL API (/graphql)                                │
│  ├── Products Collection                                   │
│  ├── Users Collection (Zitadel Integration)               │
│  └── Authentication Endpoints                              │
│                                                              │
│  Zitadel (External)                                        │
│  └── OAuth2/OIDC Provider                                  │
│                                                              │
│  Matrix Server (External)                                  │
│  └── Real-time Messaging                                   │
└────────────┬─────────────────────────────┬──────────────────┘
             │                             │
             ▼                             ▼
        ┌─────────────┐          ┌──────────────────┐
        │   MongoDB   │          │  Zitadel API     │
        │  Database   │          │  Matrix Server   │
        └─────────────┘          └──────────────────┘
```

---

## Prerequisites

### Required
- **Node.js**: v18+ or v20+
- **MongoDB**: Local instance or MongoDB Atlas
- **npm or pnpm**: Package manager
- **Git**: Version control

### Optional (but recommended)
- **Zitadel Instance**: For authentication (or use dev instance)
- **Matrix Homeserver**: For chat (or use matrix.org)
- **Docker**: For containerized MongoDB

### System Requirements
- RAM: 2GB minimum (4GB recommended)
- Disk: 500MB free
- OS: Linux, macOS, or Windows

---

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd payload-qwik
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Docker (Recommended)**
```bash
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -p 27017:27017 \
  mongo:latest
```

**Option B: Local Installation**
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Linux with apt
sudo apt-get install mongodb-org
sudo systemctl start mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

### 3. Configure Environment Variables

**Backend** (payload-qwik/.env):
```env
DATABASE_URL=mongodb://admin:password@localhost:27017/qwik-payload-store?authSource=admin
PAYLOAD_SECRET=your-super-secret-32-character-key-minimum-32-chars!
ZITADEL_API_URL=https://negus.us1.zitadel.cloud
ZITADEL_CLIENT_ID=353171717931146367
ZITADEL_CLIENT_SECRET=your-zitadel-client-secret
ZITADEL_REDIRECT_URI=http://localhost:3000/api/auth/zitadel/callback
```

**Frontend** (.env.local):
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:3000/graphql
VITE_PAYLOAD_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ZITADEL_API_URL=https://negus.us1.zitadel.cloud
VITE_ZITADEL_CLIENT_ID=353171717931146367
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_MATRIX_HOMESERVER_URL=https://matrix.org
```

### 4. Start Backend (Terminal 1)

```bash
cd payload-qwik
npm run dev
# Output: Payload CMS running on http://localhost:3000
```

### 5. Start Frontend (Terminal 2)

```bash
npm run dev
# Output: http://localhost:5173/
```

### 6. Create Admin User

1. Visit http://localhost:3000/admin
2. Create initial admin user (Payload will prompt you)
3. Go to **Products** collection
4. Create a sample product with variants

### 7. Test the App

1. Open http://localhost:5173
2. Click "Products" to see products from backend
3. Click "Login with Zitadel" to authenticate
4. Click "Chat" to test Matrix messaging (after login)

---

## Detailed Setup

### Backend Setup (Payload CMS)

#### Step 1: Install Dependencies
```bash
cd payload-qwik
npm install
```

#### Step 2: Configure Database
Create `.env` file:
```env
DATABASE_URL=mongodb://user:password@host:port/database
PAYLOAD_SECRET=your-secure-key-minimum-32-chars
```

#### Step 3: Configure Zitadel
Get from your Zitadel instance:
1. Log in to Zitadel console
2. Create OAuth2 application
3. Set redirect URI: `http://localhost:3000/api/auth/zitadel/callback`
4. Copy credentials to `.env`:

```env
ZITADEL_API_URL=https://your-zitadel-instance.com
ZITADEL_CLIENT_ID=your-client-id
ZITADEL_CLIENT_SECRET=your-client-secret
ZITADEL_REDIRECT_URI=http://localhost:3000/api/auth/zitadel/callback
```

#### Step 4: Start Development Server
```bash
npm run dev
# Server will be available at http://localhost:3000
```

#### Step 5: Initialize Admin User
1. Visit http://localhost:3000/admin
2. Create your first admin user
3. Log in to admin panel

### Frontend Setup (Qwik)

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Configure Environment
Create `.env.local` file in root:
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:3000/graphql
VITE_PAYLOAD_API_URL=http://localhost:3000
VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
VITE_ZITADEL_CLIENT_ID=your-client-id
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_MATRIX_HOMESERVER_URL=https://matrix.org
```

#### Step 3: Start Development Server
```bash
npm run dev
# Frontend will be available at http://localhost:5173
```

---

## Configuration

### Environment Variables Reference

#### Backend (.env in payload-qwik/)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | ✅ | MongoDB connection string | `mongodb://localhost/db` |
| PAYLOAD_SECRET | ✅ | Encryption key (min 32 chars) | `your-secure-key...` |
| NODE_ENV | ❌ | Environment (development/production) | `development` |
| ZITADEL_API_URL | ✅ | Zitadel instance URL | `https://zitadel.example.com` |
| ZITADEL_CLIENT_ID | ✅ | OAuth client ID | `123456789...` |
| ZITADEL_CLIENT_SECRET | ✅ | OAuth client secret | `secret-key...` |
| ZITADEL_REDIRECT_URI | ✅ | OAuth callback URL | `http://localhost:3000/api/auth/zitadel/callback` |
| PAYLOAD_PUBLIC_SERVER_URL | ❌ | Frontend-facing server URL | `http://localhost:3000` |
| PAYLOAD_GRAPHQL_URL | ❌ | GraphQL endpoint URL | `http://localhost:3000/graphql` |

#### Frontend (.env.local in root/)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| VITE_GRAPHQL_ENDPOINT | ✅ | GraphQL API endpoint | `http://localhost:3000/graphql` |
| VITE_PAYLOAD_API_URL | ✅ | Backend base URL | `http://localhost:3000` |
| VITE_API_BASE_URL | ✅ | API routes base | `http://localhost:3000/api` |
| VITE_ZITADEL_API_URL | ✅ | Zitadel instance URL | `https://zitadel.example.com` |
| VITE_ZITADEL_CLIENT_ID | ✅ | OAuth client ID | `123456789...` |
| VITE_ZITADEL_REDIRECT_URI | ✅ | OAuth callback URL | `http://localhost:5173/auth/callback` |
| VITE_MATRIX_HOMESERVER_URL | ❌ | Matrix homeserver URL | `https://matrix.org` |
| VITE_ENABLE_PWA | ❌ | Enable PWA features | `true` |
| VITE_ENABLE_CHAT | ❌ | Enable chat feature | `true` |

### MongoDB Connection Strings

#### Local
```
mongodb://127.0.0.1:27017/qwik-payload-store
```

#### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/qwik-payload-store?retryWrites=true&w=majority
```

#### Docker Compose
```
mongodb://admin:password@mongo:27017/qwik-payload-store?authSource=admin
```

---

## Running the System

### Development Mode

**Terminal 1 - Backend:**
```bash
cd payload-qwik
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Build for Production

**Backend:**
```bash
cd payload-qwik
npm run build
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

### Using Docker Compose (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DB: qwik-payload-store

  backend:
    build: ./payload-qwik
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mongodb://admin:password@mongo:27017/qwik-payload-store?authSource=admin
      PAYLOAD_SECRET: your-secret-key
      ZITADEL_API_URL: https://your-zitadel.com
      ZITADEL_CLIENT_ID: your-client-id
      ZITADEL_CLIENT_SECRET: your-client-secret
    depends_on:
      - mongo

  frontend:
    build: .
    ports:
      - "5173:5173"
    environment:
      VITE_GRAPHQL_ENDPOINT: http://backend:3000/graphql
      VITE_PAYLOAD_API_URL: http://backend:3000
    depends_on:
      - backend
```

Run with:
```bash
docker-compose up
```

---

## Creating Sample Data

### Via Admin Panel

1. Go to http://localhost:3000/admin
2. Navigate to **Products** collection
3. Click **"Create"**
4. Fill in:
   - **Title**: "Sample Product"
   - **Description**: "A great product"
   - **Base Price**: 29.99
   - **Category**: "Electronics"
   - **Featured**: Check box
5. Add **Variants** (click "+ Add" in variants array):
   - **SKU**: PROD-RED-S
   - **Name**: Red Small
   - **Color**: Red
   - **Size**: S
   - **Price**: 24.99
   - **Stock**: 10
   - **Available**: Check

6. Click **"Save"**

### Via GraphQL

Access GraphQL Playground at http://localhost:3000/graphql

```graphql
mutation CreateProduct {
  createProducts(
    data: {
      title: "Sample Product"
      description: "A great product"
      basePrice: 29.99
      category: "Electronics"
      featured: true
      variants: [
        {
          sku: "PROD-RED-S"
          name: "Red Small"
          color: "Red"
          size: "S"
          price: 24.99
          stock: 10
          isAvailable: true
        }
      ]
    }
  ) {
    id
    title
  }
}
```

---

## Features Overview

### 1. Product Catalog

**Location**: `/products` route

- Lists all products from Payload CMS
- Shows product variants with different prices
- GraphQL query optimization
- Responsive grid layout

**GraphQL Query**:
```graphql
query GetProducts {
  Products {
    docs {
      id
      title
      description
      basePrice
      variants {
        sku
        name
        price
        stock
      }
    }
  }
}
```

### 2. Zitadel Authentication

**Login Flow**:
1. User clicks "Login with Zitadel"
2. Redirects to `/api/auth/zitadel/login`
3. Backend redirects to Zitadel authorization endpoint
4. User logs in with Zitadel
5. Redirects back to `/auth/callback` with authorization code
6. Backend exchanges code for tokens
7. Creates/updates user in Payload
8. Stores tokens in localStorage
9. Redirects to `/products`

**Files**:
- Backend: `payload-qwik/src/app/(payload)/api/auth/zitadel/`
- Frontend: `src/lib/auth.ts`, `src/routes/auth/callback.tsx`

### 3. Matrix Chat

**Features**:
- Real-time messaging (when Matrix server is running)
- Message history
- User presence
- Auto-join general room

**Access**: Click "Chat" in header (only after login)

**Files**:
- Client: `src/lib/matrix-client.ts`
- Component: `src/components/chat-window/chat-window.tsx`
- Route: `src/routes/chat/index.tsx`

### 4. Progressive Web App (PWA)

**Features**:
- Offline support via Service Worker
- Installable on home screen
- Cache strategies for assets and API
- Works without internet connection

**Service Worker**: `public/service-worker.js`
**Manifest**: `public/manifest.json`

---

## Troubleshooting

### Backend Won't Start

**Error**: "Port 3000 is in use"
```bash
# Find and kill process
lsof -ti:3000 | xargs kill

# Or use different port
NODE_ENV=development PORT=3001 npm run dev
```

**Error**: "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
mongosh

# Or check Docker container
docker ps | grep mongo

# Verify connection string in .env
```

**Error**: "GraphQL endpoint not found"
- Check that Payload is running
- Verify `DATABASE_URL` is correct
- Check `.env` file has `PAYLOAD_SECRET`

### Frontend Won't Load Products

**Error**: "GraphQL endpoint is not configured"
1. Create `.env.local` in root directory
2. Set `VITE_GRAPHQL_ENDPOINT=http://localhost:3000/graphql`
3. Restart frontend dev server

**Error**: "CORS error"
- Backend must be running
- Check `VITE_PAYLOAD_API_URL` points to correct backend
- Verify backend GraphQL endpoint is accessible

### Login Not Working

**Error**: "Zitadel configuration error"
1. Verify Zitadel instance is accessible
2. Check `ZITADEL_API_URL` is correct
3. Verify `ZITADEL_CLIENT_ID` matches your Zitadel app

**Error**: "Redirect URI mismatch"
- Update Zitadel app with correct redirect URI
- Frontend: http://localhost:5173/auth/callback
- Backend: http://localhost:3000/api/auth/zitadel/callback

### Chat Not Connecting

**Error**: "Failed to connect to Matrix server"
- Verify `VITE_MATRIX_HOMESERVER_URL` is correct
- Check Matrix server is accessible
- Use https:// for production

**Error**: "Room creation failed"
- Check user is authenticated
- Verify Matrix server allows room creation
- Try using matrix.org as fallback

---

## Production Deployment

### Environment Setup

**Backend (.env for production)**:
```env
NODE_ENV=production
DATABASE_URL=your-production-mongodb-uri
PAYLOAD_SECRET=generate-new-secure-key-32-chars-min

ZITADEL_API_URL=https://your-zitadel-instance.com
ZITADEL_CLIENT_ID=production-client-id
ZITADEL_CLIENT_SECRET=production-client-secret
ZITADEL_REDIRECT_URI=https://api.yourdomain.com/api/auth/zitadel/callback

PAYLOAD_PUBLIC_SERVER_URL=https://api.yourdomain.com
PAYLOAD_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

**Frontend (.env.production)**:
```env
VITE_GRAPHQL_ENDPOINT=https://api.yourdomain.com/graphql
VITE_PAYLOAD_API_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
VITE_ZITADEL_CLIENT_ID=production-client-id
VITE_ZITADEL_REDIRECT_URI=https://yourdomain.com/auth/callback
VITE_MATRIX_HOMESERVER_URL=https://matrix.yourdomain.com
VITE_ENABLE_PWA=true
```

### Database Migrations

```bash
# Backup production database before deploying
mongodump --uri="your-production-mongodb-uri"

# After deployment, verify collections exist
mongosh --uri="your-production-mongodb-uri"
```

### Deployment Platforms

#### Heroku (Backend)
```bash
cd payload-qwik
heroku create your-app-name
heroku config:set DATABASE_URL=your-mongodb-uri
heroku config:set PAYLOAD_SECRET=your-secret
git push heroku main
```

#### Vercel (Frontend)
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

#### AWS (Both)
- Backend: AWS Elastic Beanstalk or EC2
- Frontend: S3 + CloudFront
- Database: AWS DocumentDB or RDS

---

## Support & Resources

### Documentation
- Payload CMS: https://payloadcms.com/docs
- Qwik: https://qwik.builder.io/
- Zitadel: https://zitadel.com/docs
- Matrix: https://spec.matrix.org/

### Getting Help
1. Check TROUBLESHOOTING section above
2. Review error logs in terminal
3. Check browser console (F12 → Console)
4. Review `.env` configuration
5. Restart both servers

### Common Commands

```bash
# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Check code quality
npm run fmt       # Format code

# Backend
cd payload-qwik
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Run production build
npm run generate:types  # Generate types from schema
```

---

## Project Structure

```
.
├── .env.local                  # Frontend env config
├── src/
│   ├── routes/
│   │   ├── index.tsx          # Home page
│   │   ├── products/          # Product listing & details
│   │   ├── chat/              # Chat interface
│   │   └── auth/              # OAuth callback
│   ├── components/
│   │   ├── header/            # Navigation header
│   │   ├── product-card/      # Product display
│   │   └── chat-window/       # Chat UI
│   ├── lib/
│   │   ├── auth.ts            # Authentication service
│   │   ├── graphql-client.ts  # GraphQL queries
│   │   ├── matrix-client.ts   # Chat client
│   │   └── env.ts             # Environment config
│   ├── global.css             # Global styles
│   └── root.tsx               # App root
│
├── payload-qwik/              # Backend (Payload CMS)
│   ├── .env                   # Backend env config
│   ├── src/
│   │   ├── collections/
│   │   │   ├── Users.ts       # User collection + Zitadel
│   │   │   ├── Products.ts    # Product collection with variants
│   │   │   └── Media.ts       # Media/image uploads
│   │   ├── app/(payload)/api/
│   │   │   ├── auth/zitadel/  # OAuth endpoints
│   │   │   └── graphql/       # GraphQL endpoint
│   │   ├── utilities/
│   │   │   └── zitadel.ts     # OAuth utilities
│   │   └── payload.config.ts  # Payload configuration
│   └── package.json
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker
│   └── favicon.svg
│
└── package.json
```

---

## Next Steps

1. **Test All Features**: Products, Login, Chat
2. **Create More Products**: Add variety to product catalog
3. **Customize Styling**: Update colors and fonts
4. **Add Features**: Wishlist, cart, reviews
5. **Deploy to Production**: Follow deployment section
6. **Monitor Performance**: Use Qwik Insights or similar

---

## License

MIT License - Feel free to use for personal and commercial projects.

---

## Changelog

### Version 1.0.0 (Initial Release)
- ✅ Qwik Frontend (PWA)
- ✅ Payload CMS Backend
- ✅ Zitadel Authentication
- ✅ Products with Variants
- ✅ GraphQL API
- ✅ Matrix Chat Integration
- ✅ Service Worker
- ✅ Complete Documentation

---

**Last Updated**: January 2, 2025

For the latest updates and support, visit https://payloadcms.com and https://qwik.builder.io/
