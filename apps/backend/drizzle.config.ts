import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://marketplace:marketplace_dev_2025@localhost:5432/marketplace_eventos',
  },
  verbose: true,
  strict: true,
});
