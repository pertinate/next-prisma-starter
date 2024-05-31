import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

let container: StartedPostgreSqlContainer;
let prisma = prismaGlobal.prisma;

export const setup = async () => {
  console.log('Creating test postgresql container');
  container = await new PostgreSqlContainer().start();

  const dbUrl = container.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;
  console.log('Seeding database');
  execSync('npx prisma migrate deploy && npx prisma db seed', {
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
  });

  prisma = new PrismaClient();
  await prisma.$connect();

  prismaGlobal.prisma = prisma;
};
