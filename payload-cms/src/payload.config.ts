import { buildConfig } from 'payload/config';
import path from 'path';
import { fileURLToPath } from 'url';
import Users from './collections/Users';
import Products from './collections/Products';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Products],
  express: undefined,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: {
    type: 'postgres',
    url: process.env.DATABASE_URI || 'postgresql://localhost/payload',
  },
  plugins: [
    // GraphQL plugin will be added here
  ],
});
