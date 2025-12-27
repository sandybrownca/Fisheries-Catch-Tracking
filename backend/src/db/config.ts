import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
console.log(JSON.stringify(process.env.DB_HOST));
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'fisheries_db',
  user: process.env.DB_USER || 'fisheries_user',
  password: process.env.DB_PASSWORD || 'fisheries_pass',
  max: 20,
  idleTimeoutMillis: 30000
};

export const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout to release the client
  const timeout = setTimeout(() => {
    console.error('Client checkout timeout');
    client.release();
  }, 5000);

  client.release = () => {
    clearTimeout(timeout);
    client.release();
  };

  return { client, query, release };
};

export default pool;