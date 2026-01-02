import { buildConfig } from 'payload/config';
import path from 'path';
import { fileURLToPath } from 'url';
import Users from './collections/Users.js';
import Products from './collections/Products.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    css: path.resolve(dirname, './admin.css'),
  },
  collections: [Users, Products],
  upload: {
    limits: {
      fileSize: 10485760, // 10MB
    },
  },
  db: {
    mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/payload',
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  plugins: [
    // GraphQL plugin is included by default in newer versions
  ],
  rateLimit: {
    max: 500,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  i18n: {
    supportedLanguages: {
      en: 'English',
      es: 'Español',
    },
  },
});
