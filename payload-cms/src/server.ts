import express from 'express';
import cors from 'cors';
import payload from 'payload';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const app = express();

// Middleware
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  })
);

app.use(express.json());

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'default-secret-key',
    mongoURL: process.env.DATABASE_URI || 'mongodb://localhost/payload',
    express: app,
    onInit: async () => {
      payload.logger.info(`Payload CMS Admin URL: ${process.env.ADMIN_URL}`);
      payload.logger.info(`GraphQL Endpoint: http://localhost:${process.env.PORT}${process.env.GRAPHQL_ENDPOINT}`);
    },
  });
};

start();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Payload CMS server running on http://localhost:${PORT}`);
});
