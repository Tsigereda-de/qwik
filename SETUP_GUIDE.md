# Qwik + Payload CMS Complete Setup Guide

This guide will help you set up the entire application stack: Payload CMS backend, Qwik frontend, Zitadel authentication, and Matrix chat.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Payload CMS Backend Setup](#payload-cms-backend-setup)
4. [Qwik Frontend Setup](#qwik-frontend-setup)
5. [Zitadel Configuration](#zitadel-configuration)
6. [Matrix Server Configuration](#matrix-server-configuration)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Qwik Frontend (PWA)                      │
│  - User Interface & Product Display                          │
│  - Zitadel Authentication Integration                        │
│  - Matrix Chat Integration                                   │
│  - Runs on: http://localhost:5173                            │
└──────────────┬────────────────────────────┬──────────────────┘
               │                            │
       ┌───────▼────────────────┐   ┌──────▼──────────────────┐
       │ Payload CMS Backend     │   │  Zitadel OIDC Server   │
       │ - GraphQL API          │   │  - User Management      │
       │ - Products & Variants  │   │  - OAuth2/OIDC Auth    │
       │ - User Management      │   │  - Provided URL        │
       │ Runs on: :3001         │   │  - Provided Credentials │
       └───────┬────────────────┘   └──────────────────────────┘
               │
       ┌───────▼────────────────┐
       │    PostgreSQL Database │
       │    (Payload Storage)   │
       └────────────────────────┘

       ┌──────────────────────────┐
       │   Matrix Homeserver      │
       │   - Real-time Chat       │
       │   - Provided URL         │
       │   - Provided Credentials │
       └──────────────────────────┘
```

---

## Prerequisites

### System Requirements
- Node.js 18.17.0 or higher
- npm, yarn, or pnpm package manager
- PostgreSQL 12 or higher
- Git

### External Services Required
- **Zitadel Instance**: OAuth2/OIDC server for authentication
  - API URL (e.g., `https://zitadel.example.com`)
  - Client ID
  - Client Secret
  
- **Matrix Homeserver**: For real-time chat
  - Homeserver URL (e.g., `https://matrix.example.com`)
  - (Optional) Guest access token for unauthenticated users

---

## Payload CMS Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd payload-cms
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
# Payload Configuration
PAYLOAD_SECRET=your-very-secure-random-key-at-least-32-characters
DATABASE_URI=postgresql://username:password@localhost:5432/payload_db
PORT=3001
ADMIN_URL=http://localhost:3001/admin

# Zitadel Integration (you'll fill these in later)
ZITADEL_API_URL=https://your-zitadel-instance.com
ZITADEL_ISSUER=https://your-zitadel-instance.com
ZITADEL_CLIENT_ID=your-client-id
ZITADEL_CLIENT_SECRET=your-client-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Environment
NODE_ENV=development
```

### Step 4: Set Up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE payload_db;
```

### Step 5: Initialize Payload

Payload will automatically create tables on first run:

```bash
npm run dev
```

Visit `http://localhost:3001/admin` and create your initial admin user.

### Step 6: Create Sample Products

In the Payload admin panel:
1. Navigate to **Products** collection
2. Create a new product with:
   - Title: "Sample Product"
   - Description: "A test product"
   - Base Price: 29.99
   - Add variants with different SKUs, colors, and sizes

---

## Qwik Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../
```

(You should be at the root directory)

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual URLs:

```env
# API Endpoints
VITE_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
VITE_PAYLOAD_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api

# Zitadel OAuth Configuration (you'll fill these in later)
VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
VITE_ZITADEL_CLIENT_ID=your-client-id
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback

# Matrix Chat Configuration (you'll fill these in later)
VITE_MATRIX_HOMESERVER_URL=https://your-matrix-server.com
VITE_MATRIX_GUEST_TOKEN=

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_CHAT=true
```

### Step 4: Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Zitadel Configuration

### Prerequisites
- Access to your Zitadel instance
- Admin credentials

### Step 1: Create OAuth Application

1. Log in to your Zitadel console
2. Navigate to **Applications** → **Create new application**
3. Choose **Web** application type
4. Configure:
   - **Name**: Qwik Store
   - **Redirect URIs**: 
     - `http://localhost:5173/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)
   - **Post Logout Redirect URIs**:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)

### Step 2: Get Client Credentials

After creating the application:
1. Copy the **Client ID**
2. Copy the **Client Secret**
3. Copy the **API URL** and **Issuer** from your Zitadel instance

### Step 3: Update Environment Variables

Update both `.env` files with:

**Payload CMS** (`payload-cms/.env`):
```env
ZITADEL_API_URL=https://your-zitadel-instance.com
ZITADEL_CLIENT_ID=your-client-id
ZITADEL_CLIENT_SECRET=your-client-secret
```

**Qwik Frontend** (`frontend/.env.local`):
```env
VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
VITE_ZITADEL_CLIENT_ID=your-client-id
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
```

### Step 4: Test Authentication Flow

1. Start both servers
2. Click "Login with Zitadel" on the frontend
3. You should be redirected to Zitadel login
4. After login, you should be redirected back to the app

---

## Matrix Server Configuration

### Option 1: Using Public Matrix Server

For testing, you can use a public Matrix server:

```env
VITE_MATRIX_HOMESERVER_URL=https://matrix.org
```

### Option 2: Using Your Own Matrix Server

If using your own Matrix server:

1. Get the homeserver URL (e.g., `https://matrix.yourdomain.com`)
2. Create a user account or get a guest token
3. Update environment variable:

```env
VITE_MATRIX_HOMESERVER_URL=https://your-matrix-server.com
VITE_MATRIX_GUEST_TOKEN=your-guest-token-if-available
```

### Step 1: Create a Matrix Account

Option A - Using Element (Matrix client):
1. Go to https://app.element.io
2. Create a new account on your homeserver
3. Note your user ID (e.g., `@username:matrix.yourdomain.com`)

Option B - Via REST API:
```bash
curl -X POST https://your-matrix-server.com/_matrix/client/r0/register \
  -H "Content-Type: application/json" \
  -d '{
    "auth": {"type": "m.login.dummy"},
    "user": "qwik_app",
    "password": "secure-password",
    "initial_device_display_name": "Qwik App"
  }'
```

### Step 2: Update Qwik Environment

```env
VITE_MATRIX_HOMESERVER_URL=https://your-matrix-server.com
```

---

## Running the Application

### Terminal 1: Start Payload CMS Backend

```bash
cd payload-cms
npm run dev
```

Expected output:
```
Payload CMS server running on http://localhost:3001
```

### Terminal 2: Start Qwik Frontend

```bash
npm run dev
```

Expected output:
```
  Local:    http://localhost:5173/
```

### Terminal 3: (Optional) Start PostgreSQL (if using Docker)

```bash
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=payload_db \
  -p 5432:5432 \
  postgres:latest
```

---

## Application Features

### Home Page
- Displays application information
- Quick links to Products and Chat
- Technology stack overview

### Products Page
- Lists all products from Payload CMS
- Shows product cards with variants count
- Click to view product details

### Product Detail Page
- Full product information
- Variant selection (color, size, etc.)
- Stock and price information
- "Add to Cart" button (placeholder)

### Authentication
- Zitadel OAuth2/OIDC integration
- Secure login with Zitadel
- User profile display
- Logout functionality

### Chat Page (Authenticated Users Only)
- Real-time chat using Matrix
- Message history
- Send/receive messages
- User-friendly interface

---

## Testing

### Test Authentication Flow
1. Click "Login with Zitadel" button
2. You should be redirected to Zitadel login page
3. After successful login, redirect to /auth/callback, then to /products
4. Your user information should be displayed in header

### Test Products Listing
1. Navigate to /products
2. Products should load from GraphQL API
3. Click on a product to see details
4. Variants should be selectable

### Test Chat (Authenticated Users)
1. Log in first
2. Navigate to /chat
3. Join the "general" room
4. Send a test message
5. Message should appear in chat window

### Test PWA Capabilities
1. Open Developer Tools (F12)
2. Go to Application → Service Workers
3. Check if service worker is registered
4. Open DevTools → Application → Manifest
5. Verify manifest.json is loaded

---

## API Reference

### GraphQL Endpoints

#### Get All Products
```graphql
query {
  Products {
    docs {
      id
      title
      description
      basePrice
      variants {
        sku
        name
        color
        size
        price
        stock
        isAvailable
      }
    }
  }
}
```

#### Get Single Product
```graphql
query GetProduct($id: String!) {
  Products(where: { id: { equals: $id } }) {
    docs {
      id
      title
      description
      basePrice
      variants {
        sku
        name
        color
        size
        price
        stock
        isAvailable
      }
    }
  }
}
```

### REST Authentication Endpoints

#### Initiate Login
```
GET /api/auth/zitadel-login
```

Response:
```json
{
  "authUrl": "https://zitadel.example.com/oauth/v2/authorize?...",
  "state": "random-state-string"
}
```

#### Handle Callback
```
POST /api/auth/zitadel-callback
Content-Type: application/json

{
  "code": "authorization-code",
  "state": "random-state-string"
}
```

Response:
```json
{
  "accessToken": "...",
  "idToken": "...",
  "refreshToken": "...",
  "userInfo": {
    "sub": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## Project Structure

```
.
├── payload-cms/              # Backend
│   ├── src/
│   │   ├── server.ts        # Server entry point
│   │   ├── payload.config.ts # Payload configuration
│   │   ├── collections/     # Payload collections
│   │   ├── utils/           # Utilities (Zitadel integration)
│   │   └── endpoints/       # Custom endpoints
│   ├── package.json
│   └── .env.example
│
├── src/                      # Frontend
│   ├── routes/
│   │   ├── index.tsx        # Home page
│   │   ├── products/        # Product routes
│   │   ├── chat/            # Chat route
│   │   └── auth/            # Auth routes
│   ├── components/          # React components
│   ├── lib/
│   │   ├── env.ts          # Environment utilities
│   │   ├── auth.ts         # Authentication service
│   │   ├── graphql-client.ts # GraphQL client
│   │   └── matrix-client.ts # Matrix chat client
│   ├── global.css          # Global styles
│   └── root.tsx            # Root component
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── favicon.svg
│   └── robots.txt
│
├── .env.example            # Frontend env example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `Cannot connect to PostgreSQL`

**Solution**:
1. Verify PostgreSQL is running
2. Check connection string in `.env`
3. Ensure database exists:
   ```bash
   psql -U postgres -c "CREATE DATABASE payload_db;"
   ```

### GraphQL Not Working

**Error**: `GraphQL endpoint not found` or `404` on `/graphql`

**Solution**:
1. Verify Payload server is running on port 3001
2. Check `VITE_GRAPHQL_ENDPOINT` in frontend `.env.local`
3. Check Payload configuration in `payload-cms/src/payload.config.ts`

### Authentication Fails

**Error**: `Authentication failed` or `Invalid token`

**Solution**:
1. Verify Zitadel URL is correct and accessible
2. Check Client ID and Client Secret
3. Verify redirect URI matches in both Zitadel and `.env` files
4. Check browser console for detailed error messages

### Chat Not Connecting

**Error**: `Failed to initialize chat` or `Cannot join room`

**Solution**:
1. Verify Matrix homeserver URL is correct and accessible
2. Check if user is authenticated before accessing chat
3. Verify Matrix server has guest access enabled (for test)
4. Check browser console network tab for failed requests

### CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
1. Update `CORS_ORIGIN` in `payload-cms/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174
   ```
2. Restart Payload server
3. For production, update with your domain

### PWA Not Installing

**Error**: Service worker not registering

**Solution**:
1. Verify `manifest.json` is valid
2. Check browser console for service worker errors
3. Ensure HTTPS is used in production
4. Clear browser cache and try again

---

## Performance Optimization

### Frontend
- Qwik's resumability for zero JavaScript
- Lazy loading of routes
- Service worker caching

### Backend
- PostgreSQL indexing on frequently queried fields
- GraphQL query optimization
- Connection pooling

---

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to Git
2. **Passwords**: Use strong, unique passwords for all services
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict CORS origins to your domains
5. **Token Storage**: Tokens stored in localStorage (consider using secure cookies)
6. **API Keys**: Keep Zitadel and Matrix API keys secure

---

## Next Steps

1. Deploy Payload CMS to a production server
2. Deploy Qwik frontend to a CDN or hosting service
3. Configure production Zitadel instance
4. Set up production Matrix server or use managed service
5. Configure custom domain and HTTPS
6. Monitor performance and errors

---

## Support & Documentation

- **Qwik**: https://qwik.io/docs
- **Payload CMS**: https://payloadcms.com/docs
- **Zitadel**: https://zitadel.com/docs
- **Matrix Protocol**: https://spec.matrix.org
- **GraphQL**: https://graphql.org/learn

---

## License

This project is provided as-is for learning and demonstration purposes.
