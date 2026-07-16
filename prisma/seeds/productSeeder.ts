import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import products from '../utils/products';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });
async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: products });
  const count = await prisma.product.count();
  console.log(`Seeded ${count} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
