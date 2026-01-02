import express from 'express';
import cors from 'cors';
import payload from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(o => origin.includes(o.trim()))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Payload CMS is running' });
});

// Initialize Payload
const start = async () => {
  try {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'dev-secret-key',
      mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/payload',
      express: app,
      onInit: async () => {
        console.log('✅ Payload CMS initialized successfully');
        console.log(`📊 Admin Panel: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin`);
        console.log(`🚀 GraphQL Endpoint: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/graphql`);
        console.log(`🔌 REST API: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api`);
      },
    });

    // Additional error handling
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });
  } catch (error) {
    console.error('❌ Failed to initialize Payload:', error);
    process.exit(1);
  }
};

start();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`\n🌍 Payload CMS Server running on http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n📴 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
