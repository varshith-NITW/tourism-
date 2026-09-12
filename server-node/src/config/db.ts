import { Pool } from 'pg';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// 1. PostgreSQL Connection Pool
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'tourmatch_db',
  user: process.env.POSTGRES_USER || 'tourmatch_user',
  password: process.env.POSTGRES_PASSWORD || 'tourmatch_secure_pass',
  max: 20,
  idleTimeoutMillis: 30000,
});

// 2. Redis Cache Client
export const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  socket: {
    reconnectStrategy: false,
    connectTimeout: 1500
  }
});

redisClient.on('error', (err) => console.warn('Redis Cache Notice (Running in Local Mode):', err.message));

// 3. MongoDB Connection
export async function connectDatabases() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tourmatch_docs';
  
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log('✓ Connected to MongoDB (Rich Media & Audit Store)');
  } catch (err: any) {
    console.warn('MongoDB connection note (Running in memory/mock fallback mode):', err.message);
  }

  try {
    await redisClient.connect();
    console.log('✓ Connected to Redis (Check-In Velocity & Session Cache)');
  } catch (err: any) {
    console.warn('Redis connection note (Running in memory cache fallback):', err.message);
  }
}
