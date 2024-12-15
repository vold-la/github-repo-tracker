import { DataSource } from 'typeorm';
import { Repository } from '../models/Repository';
import { Release } from '../models/Release';
import { InitialSchema1702669200000 } from '../migrations/1702669200000-InitialSchema';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'aspire',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Repository, Release],
  migrations: [InitialSchema1702669200000],
  subscribers: [],
}); 