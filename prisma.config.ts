import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env.POSTGRES_PRISMA_URL ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error(
    'Database connection string not found. Set POSTGRES_PRISMA_URL, DATABASE_URL, or POSTGRES_URL.',
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
