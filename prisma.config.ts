import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadEnv({ path: '.env.local' });

const databaseUrl =
  process.env.DATABASE_POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error(
    'Database connection string not found. Set DATABASE_URL, POSTGRES_URL, or one of the DATABASE_POSTGRES_* variants.',
  );
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seeds/productSeeder.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
