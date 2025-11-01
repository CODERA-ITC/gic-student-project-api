import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config();

// Create DataSource for migrations (separate from NestJS module)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: String(process.env.DATABASE_HOST),
  port: parseInt(String(process.env.DATABASE_PORT) || '5432', 10),
  username: String(process.env.DATABASE_USER),
  password: String(process.env.DATABASE_PASSWORD),
  database:
    String(process.env.DATABASE_NAME) + '-' + String(process.env.ENVIRONMENT),

  // Use join() for better path resolution
  entities: [join(__dirname, '..', 'handlers', '**', '*.entity.{ts,js}')],

  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],

  synchronize: false, // Never use synchronize with migrations

  logging:
    process.env.ENVIRONMENT === 'local' ||
    process.env.ENVIRONMENT === 'development'
      ? ['query', 'error', 'schema']
      : ['error'],

  ssl:
    process.env.ENVIRONMENT === 'local' ||
    process.env.ENVIRONMENT === 'development'
      ? false
      : { rejectUnauthorized: false },

  // Add migration table name
  migrationsTableName: 'typeorm_migrations',
});

export default AppDataSource;
