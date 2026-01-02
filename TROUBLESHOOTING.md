# Troubleshooting Guide

## Error: "Failed to fetch" / "Cannot connect to GraphQL API"

### What's happening?
The frontend is trying to reach the GraphQL endpoint at `http://localhost:3001/graphql`, but the Payload CMS backend is not running.

### Solutions

#### Solution 1: Run Backend Locally (Development)

If you're developing locally:

```bash
# Terminal 1: Start the backend
cd payload-cms
npm install
npm run dev

# Terminal 2: Start the frontend (in root directory)
npm install
npm run dev
```

Both servers should now run:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

#### Solution 2: Configure Backend URL (Production/Deployment)

If you've deployed the frontend but haven't deployed the backend:

1. **Deploy Payload CMS Backend**
   - See `PRODUCTION_DEPLOYMENT.md` for detailed instructions
   - Options: Fly.io, Heroku, AWS, Railway, etc.

2. **Update Frontend Environment Variables**
   
   Set these in your deployment platform (Fly.io, Netlify, etc.):
   
   ```env
   VITE_GRAPHQL_ENDPOINT=https://your-api-domain.com/graphql
   VITE_PAYLOAD_API_URL=https://your-api-domain.com
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

3. **Redeploy Frontend**
   - Push changes or redeploy with new environment variables

#### Solution 3: Check Configuration

Verify your environment variables are set correctly:

**Local development** (`.env.local`):
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
```

**Production deployment**:
- Fly.io: Set in `fly.toml` or Fly dashboard
- Netlify: Set in Build & deploy settings → Environment
- Vercel: Set in Settings → Environment Variables

---

## Error: "GraphQL endpoint is not configured"

### What's happening?
The `VITE_GRAPHQL_ENDPOINT` environment variable is missing or set to default value.

### Solution

1. Create `.env.local` file in root directory:
   ```env
   VITE_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
   VITE_PAYLOAD_API_URL=http://localhost:3001
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

---

## Error: "Unable to connect to the GraphQL API"

### What's happening?
The frontend can reach the backend but it's not responding with valid GraphQL.

### Solutions

1. **Check backend is running**
   ```bash
   curl http://localhost:3001/graphql
   ```
   Should return a response (or 405 for GET requests)

2. **Check CORS configuration**
   
   Backend (`payload-cms/.env`):
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Restart backend**
   ```bash
   cd payload-cms
   npm run dev
   ```

4. **Check for errors in backend logs**
   Look for error messages in the terminal running the backend

---

## Error: "No products available" / Empty product list

### What's happening?
The connection is working but there are no products in the database.

### Solution

1. Open Payload admin panel: http://localhost:3001/admin
2. Create admin user if not already done
3. Navigate to **Products** collection
4. Click **Create New**
5. Fill in product details:
   - Title: "Test Product"
   - Description: "A test product"
   - Base Price: 29.99
   - Click **Add** under Variants and add at least one variant
6. Click **Publish**

Products should now appear on http://localhost:5173/products

---

## Error: "Login with Zitadel" not working

### What's happening?
Zitadel OAuth is not properly configured.

### Solutions

1. **Check environment variables**
   
   Frontend (`.env.local`):
   ```env
   VITE_ZITADEL_API_URL=https://your-zitadel-instance.com
   VITE_ZITADEL_CLIENT_ID=your-client-id
   VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

   Backend (`payload-cms/.env`):
   ```env
   ZITADEL_API_URL=https://your-zitadel-instance.com
   ZITADEL_CLIENT_ID=your-client-id
   ZITADEL_CLIENT_SECRET=your-client-secret
   ```

2. **Verify Zitadel OAuth app configuration**
   - Check Redirect URIs match exactly:
     - Development: `http://localhost:5173/auth/callback`
     - Production: `https://yourdomain.com/auth/callback`

3. **Test connection to Zitadel**
   ```bash
   curl https://your-zitadel-instance.com/.well-known/openid-configuration
   ```
   Should return valid JSON

---

## Error: Chat not connecting / "Failed to initialize chat"

### What's happening?
Matrix server is not configured or not accessible.

### Solutions

1. **Check Matrix configuration**
   
   Frontend (`.env.local`):
   ```env
   VITE_MATRIX_HOMESERVER_URL=https://your-matrix-server.com
   ```

2. **Test Matrix connectivity**
   ```bash
   curl https://your-matrix-server.com/_matrix/client/versions
   ```
   Should return valid JSON

3. **For testing, use public Matrix server**
   ```env
   VITE_MATRIX_HOMESERVER_URL=https://matrix.org
   ```

4. **Restart frontend**
   ```bash
   npm run dev
   ```

---

## Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

### What's happening?
Backend CORS is not configured for frontend domain.

### Solution

Backend (`payload-cms/.env`):
```env
# For development (allow localhost:5173)
CORS_ORIGIN=http://localhost:5173

# For production (allow specific domain)
CORS_ORIGIN=https://yourdomain.com

# For multiple domains
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com,https://www.yourdomain.com
```

Restart backend:
```bash
cd payload-cms
npm run dev
```

---

## Error: Port already in use

### What's happening?
Another process is using the port (3001 for backend, 5173 for frontend).

### Solutions

**Kill existing process:**

```bash
# Frontend port 5173
lsof -ti:5173 | xargs kill -9

# Backend port 3001
lsof -ti:3001 | xargs kill -9
```

**Or use different ports:**

Edit `vite.config.ts` (frontend):
```typescript
server: {
  port: 5174  // Changed from 5173
}
```

---

## Error: "Cannot GET /"

### What's happening?
The frontend is deployed but shows 404 error.

### Solution

1. **Check build output**
   ```bash
   npm run build
   ls -la dist/
   ```
   Should have `index.html` and other files

2. **Check deployment platform supports SPA routing**
   
   For Netlify, add `netlify.toml`:
   ```toml
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

3. **Redeploy after fixes**

---

## Error: "Cannot connect to PostgreSQL"

### What's happening?
Backend can't reach the database.

### Solutions

1. **Check database is running**
   ```bash
   # If using local PostgreSQL
   psql -U postgres -c "SELECT 1"
   
   # If using Docker
   docker ps | grep postgres
   ```

2. **Verify connection string**
   
   Format: `postgresql://user:password@host:port/database`
   
   Common issues:
   - Wrong password
   - Wrong host (use `localhost` for local, not `127.0.0.1`)
   - Port not open (default 5432)
   - Database doesn't exist

3. **Create database if missing**
   ```sql
   CREATE DATABASE payload_db;
   ```

4. **Update `.env`**
   ```env
   DATABASE_URI=postgresql://postgres:postgres@localhost:5432/payload_db
   ```

---

## Error: "Cannot import module X"

### What's happening?
A dependency is missing or not installed.

### Solution

```bash
# Clear and reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# If using npm
npm install

# If using yarn
yarn install
```

---

## Error: "Service Worker not registering" (PWA Issues)

### What's happening?
PWA features not working or service worker not installed.

### Solutions

1. **Check browser console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages

2. **Check HTTPS in production**
   - Service workers require HTTPS
   - Development (localhost) is an exception

3. **Verify manifest.json exists**
   - Check: `public/manifest.json`
   - Should be accessible at `/manifest.json`

4. **Clear browser cache**
   - DevTools → Application → Service Workers → Unregister
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## General Debugging Steps

1. **Check browser console** (F12)
   - Look for red errors
   - Check Network tab for failed requests

2. **Check server logs**
   ```bash
   # Frontend
   npm run dev  # Look at terminal output
   
   # Backend
   cd payload-cms && npm run dev  # Look at terminal output
   ```

3. **Test API manually**
   ```bash
   # Test GraphQL
   curl -X POST http://localhost:3001/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "query { __typename }"}'
   ```

4. **Check environment variables**
   ```bash
   # Frontend
   echo "VITE_GRAPHQL_ENDPOINT: $VITE_GRAPHQL_ENDPOINT"
   
   # Backend
   echo "DATABASE_URI: $DATABASE_URI"
   ```

5. **Review documentation**
   - `SETUP_GUIDE.md` - Detailed setup
   - `ARCHITECTURE.md` - How things work
   - `PRODUCTION_DEPLOYMENT.md` - Production setup

---

## Still stuck?

1. **Check GitHub Issues** for similar problems
2. **Review SETUP_GUIDE.md** for missed steps
3. **Check environment variables** are all set correctly
4. **Restart all servers** (frontend + backend)
5. **Clear browser cache** and hard refresh

Common fix: Just restart the dev servers! 🔄
