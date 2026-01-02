# Quick Start Guide

Get your Qwik + Payload CMS application running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running locally
- (Optional) Access to Zitadel and Matrix servers

## 1. Clone & Setup Backend (2 minutes)

```bash
# Navigate to backend directory
cd payload-cms

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with minimal config:
# - PAYLOAD_SECRET=your-secure-key (min 32 chars)
# - DATABASE_URI=postgresql://postgres:postgres@localhost:5432/payload_db
```

## 2. Start PostgreSQL

```bash
# If using Docker:
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=payload_db \
  -p 5432:5432 \
  postgres:latest

# Or use your local PostgreSQL installation
```

## 3. Start Backend (Terminal 1)

```bash
cd payload-cms
npm run dev
```

Expected output:
```
Payload CMS server running on http://localhost:3001
Admin panel: http://localhost:3001/admin
```

## 4. Setup Frontend (1 minute)

```bash
# Navigate to root
cd ../

# Install dependencies
npm install

# Create .env.local with these minimal settings:
# VITE_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
# VITE_PAYLOAD_API_URL=http://localhost:3001
# VITE_API_BASE_URL=http://localhost:3001/api
```

## 5. Start Frontend (Terminal 2)

```bash
npm run dev
```

Expected output:
```
Local:    http://localhost:5173/
```

## 6. Create Sample Data

1. Open http://localhost:3001/admin
2. Create initial admin user (follow Payload prompts)
3. Navigate to **Products** collection
4. Create a sample product:
   - **Title**: "Sample Product"
   - **Description**: "A great product"
   - **Base Price**: 29.99
   - **Variants**: Add 2-3 variants with different SKUs

## 7. Test the App

1. Open http://localhost:5173
2. Click "Browse Products" - should see your products
3. Click on a product to see details and variants
4. Try "Add to Cart" button

## With Authentication (Optional)

### Setup Zitadel Access

1. Get your Zitadel instance URL, Client ID, and Client Secret
2. Update `payload-cms/.env`:
   ```env
   ZITADEL_API_URL=https://your-zitadel.com
   ZITADEL_CLIENT_ID=your-client-id
   ZITADEL_CLIENT_SECRET=your-client-secret
   ```
3. Update `.env.local`:
   ```env
   VITE_ZITADEL_API_URL=https://your-zitadel.com
   VITE_ZITADEL_CLIENT_ID=your-client-id
   VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
   ```
4. Restart both servers
5. Click "Login with Zitadel" button

### Setup Matrix Chat

1. Get your Matrix homeserver URL
2. Update `.env.local`:
   ```env
   VITE_MATRIX_HOMESERVER_URL=https://matrix.example.com
   ```
3. Restart frontend
4. After logging in, visit http://localhost:5173/chat

## File Structure to Know

```
.
├── payload-cms/              # Backend
│   ├── src/
│   │   ├── payload.config.ts (configure collections)
│   │   ├── collections/
│   │   │   ├── Users.ts
│   │   │   └── Products.ts
│   │   └── utils/zitadel.ts
│   └── .env
│
├── src/                      # Frontend
│   ├── routes/
│   │   ├── index.tsx        (home page)
│   │   ├── products/        (product pages)
│   │   ├── chat/            (chat page)
│   │   └── auth/            (auth callback)
│   ├── lib/
│   │   ├── auth.ts          (login/logout logic)
│   │   ├── graphql-client.ts (product queries)
│   │   └── matrix-client.ts (chat)
│   └── components/          (UI components)
│
└── .env.local                (your config)
```

## Common Commands

### Backend
```bash
cd payload-cms
npm run dev      # Start development
npm run build    # Build for production
npm run start    # Run production build
```

### Frontend
```bash
npm run dev      # Start development
npm run build    # Build for production
npm run preview  # Preview production build
npm run qwik     # Qwik CLI tools
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 in use | Kill process: `lsof -ti:3001 \| xargs kill` |
| Port 5173 in use | Kill process: `lsof -ti:5173 \| xargs kill` |
| Database error | Restart PostgreSQL or create database manually |
| GraphQL not working | Check `VITE_GRAPHQL_ENDPOINT` matches Payload URL |
| Login not working | Verify Zitadel credentials and redirect URI |
| Chat not connecting | Verify Matrix URL is correct and accessible |

## Next Steps

- [ ] Add more products with variants
- [ ] Connect real Zitadel instance
- [ ] Connect real Matrix server
- [ ] Add shopping cart functionality
- [ ] Integrate payment processing
- [ ] Deploy to production

## Need Help?

1. Check `SETUP_GUIDE.md` for detailed configuration
2. Read `ARCHITECTURE.md` for how things work
3. Check browser console for error messages
4. Look at component source code for implementation details

---

**Tip**: Keep both servers running in separate terminal windows for best development experience!
