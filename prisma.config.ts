import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Seed
    seed: 'tsx prisma/seeds/productSeeder.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
